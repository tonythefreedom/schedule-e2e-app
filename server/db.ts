import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function initDB() {
  const db = await open({
    filename: process.env.DATABASE_PATH || './database.sqlite',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      location TEXT,
      content TEXT,
      reminded_2h INTEGER NOT NULL DEFAULT 0,
      reminded_10m INTEGER NOT NULL DEFAULT 0
    )
  `);

  // 기존 테이블에 알림 발송 기록 컬럼이 없으면 추가한다. (마이그레이션)
  const columns = await db.all('PRAGMA table_info(schedules)');
  const names = columns.map((c: any) => c.name);
  if (!names.includes('reminded_2h')) {
    await db.exec('ALTER TABLE schedules ADD COLUMN reminded_2h INTEGER NOT NULL DEFAULT 0');
  }
  if (!names.includes('reminded_10m')) {
    await db.exec('ALTER TABLE schedules ADD COLUMN reminded_10m INTEGER NOT NULL DEFAULT 0');
  }

  return db;
}
