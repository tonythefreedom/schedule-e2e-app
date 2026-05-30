import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDB } from './db';
import { analyzeSchedule } from './gemini';
import { checkReminders, startReminderScheduler } from './reminder';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

let db: any;

async function startServer() {
  db = await initDB();

  app.get('/api/schedules', async (req, res) => {
    try {
      const schedules = await db.all('SELECT * FROM schedules ORDER BY date ASC, time ASC');
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch schedules' });
    }
  });

  app.get('/api/schedules/:id', async (req, res) => {
    try {
      const schedule = await db.get('SELECT * FROM schedules WHERE id = ?', [req.params.id]);
      if (schedule) {
        res.json(schedule);
      } else {
        res.status(404).json({ message: 'Schedule not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch schedule' });
    }
  });

  // 일정 직접 생성 (REST). 알림 e2e 테스트에서 정확한 시각의 일정을 만들 때 사용한다.
  app.post('/api/schedules', async (req, res) => {
    const { title, date, time, location = '', content = '' } = req.body;
    if (!title || !date || !time) {
      return res.status(400).json({ error: 'title, date, time은 필수입니다.' });
    }
    try {
      const result = await db.run(
        'INSERT INTO schedules (title, date, time, location, content) VALUES (?, ?, ?, ?, ?)',
        [title, date, time, location, content]
      );
      const created = await db.get('SELECT * FROM schedules WHERE id = ?', [result.lastID]);
      res.status(201).json(created);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create schedule' });
    }
  });

  // 일정 삭제
  app.delete('/api/schedules/:id', async (req, res) => {
    try {
      const result = await db.run('DELETE FROM schedules WHERE id = ?', [req.params.id]);
      if (result.changes && result.changes > 0) {
        res.json({ deleted: true, id: Number(req.params.id) });
      } else {
        res.status(404).json({ message: 'Schedule not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete schedule' });
    }
  });

  // 알림 조건을 즉시 점검하고 발송 결과를 반환한다. (스케줄러 수동 트리거 / 테스트용)
  app.post('/api/check-reminders', async (req, res) => {
    try {
      const windowMs = typeof req.body?.windowMs === 'number' ? req.body.windowMs : undefined;
      const sent = await checkReminders(db, new Date(), windowMs);
      res.json({ sent });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to check reminders' });
    }
  });

  app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    
    try {
      const existingSchedules = await db.all('SELECT * FROM schedules');
      const analysis = await analyzeSchedule(message, existingSchedules);
      
      if (!analysis) {
        return res.json({ message: '죄송합니다. 요청을 이해하지 못했습니다.' });
      }

      if (analysis.intent === 'duplicate') {
        const { title, date, time } = analysis.data;
        return res.json({
          type: 'text',
          message: `중복된 일정이 이미 존재합니다: ${date} ${time} '${title}'. 그래도 등록하시겠습니까?`,
          duplicateInfo: analysis.data
        });
      }

      if (analysis.intent === 'create') {
        const { title, date, time, location, content } = analysis.data;
        await db.run(
          'INSERT INTO schedules (title, date, time, location, content) VALUES (?, ?, ?, ?, ?)',
          [title, date, time, location, content]
        );
        
        const weeklySchedules = await db.all('SELECT * FROM schedules ORDER BY date ASC, time ASC');
        return res.json({
          type: 'schedule_created',
          message: `일정이 등록되었습니다. ${date} ${time}에 '${title}' 일정을 확인했습니다.`,
          weeklySchedules
        });
      }

      if (analysis.intent === 'query') {
        const schedules = await db.all('SELECT * FROM schedules ORDER BY date ASC, time ASC');
        let responseText = '일정 목록입니다:\n';
        
        const filtered = schedules.filter((s: any) => {
          if (analysis.query_type === 'today') {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            return s.date === `${year}-${month}-${day}`;
          }
          if (analysis.query_type === 'tomorrow') {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const year = tomorrow.getFullYear();
            const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
            const day = String(tomorrow.getDate()).padStart(2, '0');
            return s.date === `${year}-${month}-${day}`;
          }
          if (analysis.query_type === 'person') {
            return (s.title && s.title.includes(analysis.person)) || (s.content && s.content.includes(analysis.person));
          }
          return true;
        });

        if (filtered.length === 0) {
          responseText = '관련된 일정이 없습니다.';
        } else {
          filtered.forEach((s: any) => {
            responseText += `- ${s.date} ${s.time}: ${s.title} (${s.location || '장소 없음'})\n`;
          });
        }

        return res.json({
          type: 'calendar',
          message: responseText,
          weeklySchedules: filtered
        });
      }

      if (analysis.intent === 'recommend' || analysis.intent === 'check_free') {
        const schedules = await db.all('SELECT * FROM schedules ORDER BY date ASC, time ASC');
        return res.json({
          type: 'calendar',
          message: analysis.response || '이번 주에는 목요일 오후 2시가 비어있네요. 이때는 어떠신가요?',
          weeklySchedules: schedules
        });
      }

      res.json({ message: '요청을 처리할 수 없습니다.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // 일정 알림(2시간 전 / 10분 전) 백그라운드 스케줄러 시작
  startReminderScheduler(db);

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

startServer();