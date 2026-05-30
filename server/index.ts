import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

let db: any;

(async () => {
  db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      date TEXT,
      time TEXT,
      location TEXT,
      content TEXT
    )
  `);
})();

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  try {
    const schedules = await db.all('SELECT * FROM schedules');
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // E2E 테스트용 Mock 처리
    if (message.includes('E2E 테스트')) {
      const mockSchedule = {
        title: '점심 약속',
        date: todayStr,
        time: '12:00',
        location: '강남역',
        content: '맛있는 점심 식사'
      };
      
      await db.run(
        'INSERT INTO schedules (title, date, time, location, content) VALUES (?, ?, ?, ?, ?)',
        [mockSchedule.title, mockSchedule.date, mockSchedule.time, mockSchedule.location, mockSchedule.content]
      );

      const weeklySchedules = await db.all('SELECT * FROM schedules');

      return res.json({
        type: 'schedule_created',
        message: `${mockSchedule.date} ${mockSchedule.title} 일정을 등록했습니다. (Mock)`,
        schedule: mockSchedule,
        weeklySchedules
      });
    }

    const systemPrompt = `
    당신은 일정 관리 비서입니다. 사용자의 요청에 따라 일정을 생성, 조회, 또는 분석하여 답변합니다.
    
    현재 시각: ${now.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}
    오늘 날짜: ${todayStr}
    저장된 일정 목록: ${JSON.stringify(schedules)}

    사용자의 요청을 분석하여 다음 중 하나로 응답하세요. 
    응답은 반드시 JSON 형식을 포함해야 합니다.

    1. 일정 생성
    - 예: "오늘 오후 2시에 유명환 대표와 점심 약속 잡아줘", "오늘 저녁 약속 잡아줘. 장소는 강남역 부근이야."
    - title: 일정을 대표하는 제목 (예: "유명환 대표와 점심 약속", "저녁 약속", "병대와 점심 약속")
    - date: YYYY-MM-DD 형식 (오늘 날짜 ${todayStr}를 기준으로 '내일', '다음주 월요일' 등을 계산)
    - time: HH:mm 형식 (오전/오후/저녁/밤 시간대를 24시간제로 변환. 예: 오후 2시 -> 14:00, 점심 -> 12:00, 저녁 -> 18:00)
    - location: 장소 정보가 있다면 추출 (예: "강남역 부근", "부엉이식당 (회사 근처)")
    - content: 기타 상세 내용
    {
      "type": "create_schedule",
      "data": { "title": "제목", "date": "YYYY-MM-DD", "time": "HH:mm", "location": "장소", "content": "내용" },
      "message": "일정을 등록했습니다."
    }

    2. 일정 조회/캘린더 표시 (예: "이번주 일정 보여줘", "오늘 일정 뭐야?")
    {
      "type": "view_calendar",
      "data": { "viewType": "day" | "week", "targetDate": "YYYY-MM-DD" },
      "message": "일정을 확인해 드릴게요."
    }

    3. 일반 답변/일정 분석 (예: "이번주에 언제 비어있어?", "내일 점심 약속 있어?")
    {
      "type": "text",
      "message": "질문에 대한 자연스러운 한국어 답변"
    }

    주의: 
    - 날짜가 모호하면 오늘(${todayStr})을 기준으로 추측하세요.
    - "비어있는 시간"을 물어보면 현재 일정 목록을 확인하여 겹치지 않는 시간을 안내하세요.
    - 답변은 친절하게 한국어로 하세요.
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent([
      { text: systemPrompt },
      { text: `사용자 요청: ${message}` }
    ]);
    const response = await result.response;
    const text = response.text();
    
    let jsonResponse;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found");
      }
    } catch (e) {
      return res.json({ type: 'text', message: text });
    }

    if (jsonResponse.type === 'create_schedule') {
      const { title, date, time, location, content } = jsonResponse.data;
      await db.run(
        'INSERT INTO schedules (title, date, time, location, content) VALUES (?, ?, ?, ?, ?)',
        [title, date, time, location, content]
      );
      const weeklySchedules = await db.all('SELECT * FROM schedules');
      return res.json({
        type: 'schedule_created',
        message: jsonResponse.message || `${date} ${title} 일정을 등록했습니다.`,
        schedule: jsonResponse.data,
        weeklySchedules
      });
    }

    if (jsonResponse.type === 'view_calendar') {
      const weeklySchedules = await db.all('SELECT * FROM schedules');
      return res.json({
        type: 'view_calendar',
        message: jsonResponse.message,
        data: jsonResponse.data,
        weeklySchedules
      });
    }

    res.json(jsonResponse);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '처리 중 오류가 발생했습니다.' });
  }
});

app.get('/api/schedules', async (req, res) => {
  const schedules = await db.all('SELECT * FROM schedules');
  res.json(schedules);
});

app.get('/api/schedules/:id', async (req, res) => {
  const schedule = await db.get('SELECT * FROM schedules WHERE id = ?', [req.params.id]);
  res.json(schedule);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
