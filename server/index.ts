import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDB } from './db';
import { analyzeSchedule } from './gemini';

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

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

startServer();