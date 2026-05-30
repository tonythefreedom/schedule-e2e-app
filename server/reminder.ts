import { sendSlackDM } from './slack';

interface Schedule {
  id: number;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  location?: string;
  content?: string;
  reminded_2h?: number;
  reminded_10m?: number;
}

// 발송할 알림 종류: 일정 시작 기준 오프셋과 발송 여부를 기록하는 DB 컬럼
const REMINDERS = [
  { kind: '2h', offsetMs: 2 * 60 * 60 * 1000, label: '2시간 전', column: 'reminded_2h' },
  { kind: '10m', offsetMs: 10 * 60 * 1000, label: '10분 전', column: 'reminded_10m' },
] as const;

function getScheduleStart(s: Schedule): Date {
  // date/time은 로컬 시간 기준으로 해석한다.
  return new Date(`${s.date}T${s.time}:00`);
}

function formatMessage(s: Schedule, label: string): string {
  return [
    `🔔 일정 알림 (${label})`,
    `📌 ${s.title}`,
    `🕒 ${s.date} ${s.time}`,
    `📍 ${s.location || '장소 미정'}`,
  ].join('\n');
}

/**
 * 현재 시각 기준으로 알림 시점(일정 2시간 전 / 10분 전)이 직전 체크 윈도우 안에
 * 들어온 일정을 찾아 슬랙 DM을 발송한다. 발송된 항목 목록을 반환한다.
 *
 * @param windowMs 알림 시점을 놓치지 않기 위한 허용 윈도우. 스케줄러 주기보다 약간 크게 둔다.
 */
export async function checkReminders(
  db: any,
  now: Date = new Date(),
  windowMs: number = 90 * 1000
): Promise<{ id: number; kind: string }[]> {
  const schedules: Schedule[] = await db.all('SELECT * FROM schedules');
  const sent: { id: number; kind: string }[] = [];

  for (const s of schedules) {
    const start = getScheduleStart(s);
    if (isNaN(start.getTime())) continue;

    for (const r of REMINDERS) {
      // 이미 발송한 알림은 건너뛴다. (DB 컬럼에 기록되어 서버 재시작에도 유지됨)
      if (s[r.column]) continue;

      const remindAt = start.getTime() - r.offsetMs;
      // 알림 시점이 (now - window, now] 구간에 들어왔을 때 1회 발송한다.
      if (remindAt <= now.getTime() && remindAt > now.getTime() - windowMs) {
        const ok = await sendSlackDM(formatMessage(s, r.label));
        if (ok) {
          await db.run(`UPDATE schedules SET ${r.column} = 1 WHERE id = ?`, [s.id]);
          sent.push({ id: s.id, kind: r.kind });
          console.log(`[reminder] 발송: 일정 #${s.id} (${r.label})`);
        }
      }
    }
  }

  return sent;
}

/**
 * 1분마다 알림 조건을 점검하는 백그라운드 스케줄러를 시작한다.
 */
export function startReminderScheduler(db: any): void {
  setInterval(() => {
    checkReminders(db).catch((err) => console.error('[reminder] 체크 실패:', err));
  }, 60 * 1000);
  console.log('[reminder] 알림 스케줄러 시작 (1분 주기)');
}
