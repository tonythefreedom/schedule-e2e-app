import { test, expect } from '@playwright/test';

/**
 * 슬랙 일정 알림 E2E 테스트
 *
 * 현재 시각 기준으로 "2시간 후" / "10분 후" 일정을 생성하면,
 * 각각 '일정 2시간 전' / '일정 10분 전' 알림 시점이 바로 지금이 된다.
 * 알림 점검을 트리거하면 해당 일정에 대한 슬랙 DM이 발송되어야 한다.
 */

const API = 'http://localhost:3001/api';

// 로컬 시간 기준 YYYY-MM-DD / HH:mm 문자열로 변환 (분 단위, 초 버림)
function toDateTime(ms: number) {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

test('일정 2시간 전 / 10분 전에 각각 슬랙 DM이 발송된다', async ({ request }) => {
  const now = Date.now();

  // 1) 지금부터 2시간 후 일정 → '2시간 전' 알림 시점이 지금
  const in2h = toDateTime(now + 2 * 60 * 60 * 1000);
  const create2h = await request.post(`${API}/schedules`, {
    data: { title: '슬랙 알림 테스트 · 2시간 후 회의', ...in2h, location: '강남 본사' },
  });
  expect(create2h.ok()).toBeTruthy();
  const schedule2h = await create2h.json();

  // 2) 지금부터 10분 후 일정 → '10분 전' 알림 시점이 지금
  const in10m = toDateTime(now + 10 * 60 * 1000);
  const create10m = await request.post(`${API}/schedules`, {
    data: { title: '슬랙 알림 테스트 · 10분 후 점심', ...in10m, location: '회사 근처 식당' },
  });
  expect(create10m.ok()).toBeTruthy();
  const schedule10m = await create10m.json();

  // 3) 알림 점검 트리거 (분 단위 반올림 오차를 흡수하도록 윈도우를 넉넉히 둠)
  const res = await request.post(`${API}/check-reminders`, { data: { windowMs: 180000 } });
  expect(res.ok()).toBeTruthy();
  const { sent } = await res.json();

  // 4) 2시간 후 일정에는 '2h' 알림이, 10분 후 일정에는 '10m' 알림이 발송되어야 한다
  expect(sent).toContainEqual({ id: schedule2h.id, kind: '2h' });
  expect(sent).toContainEqual({ id: schedule10m.id, kind: '10m' });

  // 가까운 일정에 잘못된 종류의 알림이 중복 발송되지 않았는지 확인
  expect(sent).not.toContainEqual({ id: schedule2h.id, kind: '10m' });
  expect(sent).not.toContainEqual({ id: schedule10m.id, kind: '2h' });

  // 5) 동일 조건으로 다시 트리거해도 이미 발송된 알림은 재발송되지 않아야 한다 (DB 기록 기반)
  const res2 = await request.post(`${API}/check-reminders`, { data: { windowMs: 180000 } });
  const { sent: sent2 } = await res2.json();
  expect(sent2).not.toContainEqual({ id: schedule2h.id, kind: '2h' });
  expect(sent2).not.toContainEqual({ id: schedule10m.id, kind: '10m' });
});
