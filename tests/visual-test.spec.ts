import { test, expect } from '@playwright/test';

test('일정 확인 요청 시 캘린더 UI 렌더링 확인', async ({ page }) => {
  // 1. 채팅 목록 페이지 접속
  await page.goto('/');
  
  // 2. 일정관리 에이전트 채팅방 클릭 (이미 존재하는 경우)
  // 만약 목록에 없다면 직접 경로로 이동
  await page.goto('/chat/agent');

  // 3. 메시지 입력창 확인
  const input = page.locator('input[placeholder="메시지"]');
  await expect(input).toBeVisible();

  // 4. "내일 일정 알려줘" 메시지 전송
  await input.fill('내일 일정 알려줘');
  await page.keyboard.press('Enter');

  // 5. 에이전트의 응답 대기 (네트워크 요청 및 AI 응답 시간 고려)
  // 캘린더 UI가 포함된 메시지가 올 때까지 대기
  // WeeklyCalendar 컴포넌트 내부의 텍스트로 확인
  const calendarHeader = page.locator('text=주간 일정 브리핑');
  
  // 응답이 올 때까지 충분히 대기 (최대 15초)
  await expect(calendarHeader).toBeVisible({ timeout: 15000 });

  // 6. 스크린샷 캡쳐
  await page.screenshot({ path: 'tests/screenshots/calendar-render-test.png', fullPage: true });

  // 7. 캘린더 내부의 버튼 확인
  const viewAllButton = page.locator('text=전체 캘린더 보기');
  await expect(viewAllButton).toBeVisible();
});
