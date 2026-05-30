import { test, expect } from '@playwright/test';

/**
 * 월간 캘린더 E2E 테스트
 *
 * '전체 캘린더 보기'로 진입하는 월간 캘린더에서 다음 달로 이동해
 * 해당 날짜의 일정을 조회하고, 일정 항목을 눌러 상세 정보까지 확인한다.
 * 실행 날짜와 무관하도록 일정 날짜를 '다음 달 15일'로 동적 생성한다.
 */

const API = 'http://localhost:3001/api';
const pad = (n: number) => String(n).padStart(2, '0');

test('월간 캘린더에서 다음 달 일정을 조회하고 상세까지 확인한다', async ({ page, request }) => {
  // 실행 시점 기준 다음 달 15일에 상세 설명이 담긴 일정 생성
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth() + 1, 15);
  const dateStr = `${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(target.getDate())}`;

  const res = await request.post(`${API}/schedules`, {
    data: {
      title: 'KT클라우드 제품 출시 전략 미팅',
      date: dateStr,
      time: '14:00',
      location: 'KT 클라우드 본사 대회의실',
      content:
        '클라우드 제품 출시를 위한 미팅. 참석자: 메가존 박상욱 전무, 엑세스랩 유명환 대표, KT클라우드 관계자. 출시 일정 확정 및 공동 마케팅 전략 논의.',
    },
  });
  expect(res.ok()).toBeTruthy();
  const schedule = await res.json();

  // 월간 캘린더 진입 (이번 달이 기본 표시)
  await page.goto('http://localhost:5173/calendar');
  await expect(page.getByTestId('calendar-title')).toHaveText(
    `${now.getFullYear()}년 ${now.getMonth() + 1}월`
  );

  // 다음 달로 이동
  await page.getByTestId('next-month').click();
  await expect(page.getByTestId('calendar-title')).toHaveText(
    `${target.getFullYear()}년 ${target.getMonth() + 1}월`
  );

  // 해당 날짜 선택 → 하단에 일정이 노출되어야 한다
  await page.getByTestId(`day-${dateStr}`).click();
  const list = page.getByTestId('selected-schedules');
  await expect(list).toContainText('KT클라우드 제품 출시 전략 미팅');
  await expect(list).toContainText('14:00');
  await expect(list).toContainText('KT 클라우드 본사 대회의실');

  // 일정 항목 클릭 → 상세 페이지에서 실제 정보 확인
  await page.getByTestId(`schedule-item-${schedule.id}`).click();
  await expect(page).toHaveURL(new RegExp(`/schedule/${schedule.id}$`));
  await expect(page.locator('body')).toContainText('메가존 박상욱 전무');
  await expect(page.locator('body')).toContainText('엑세스랩 유명환 대표');
});
