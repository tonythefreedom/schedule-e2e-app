import { test, expect } from '@playwright/test';

test.describe('Schedule Management E2E Test', () => {
  test('should create a schedule via chat and view details', async ({ page }) => {
    // 1. 메인 페이지 접속 (채팅 리스트에서 에이전트 선택)
    await page.goto('/');
    
    // 일정관리 에이전트 클릭
    const agentItem = page.locator('text=일정관리 에이전트');
    await agentItem.waitFor({ state: 'visible' });
    await page.waitForTimeout(2000);
    await agentItem.click();
    
    // 2. 일정 생성 요청 입력
    const chatInput = page.locator('input[placeholder*="일정을 만들어줘"]');
    await chatInput.waitFor({ state: 'visible' });

    // 오늘 날짜 기준으로 일정 생성 (테스트 환경에 따라 유동적으로)
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const day = today.getDate();

    await chatInput.fill(`${dateStr} 점심 약속 일정을 만들어줘 (E2E 테스트)`);
    await page.waitForTimeout(2000);
    await chatInput.press('Enter');

    // 3. 응답 및 캘린더 출력 대기
    // WeeklyCalendar가 포함된 컨테이너 대기
    const calendar = page.locator('text=주간 일정');
    await expect(calendar).toBeVisible({ timeout: 20000 });

    // 4. 생성된 일정 클릭 (WeeklyCalendar 내의 일정 항목)
    const scheduleDay = page.locator('.grid > div')
      .filter({ has: page.getByText(day.toString(), { exact: true }) })
      .filter({ has: page.locator('.bg-primary') })
      .first();
    await expect(scheduleDay).toBeVisible();
    await page.waitForTimeout(2000);
    await scheduleDay.click();

    // 5. 상세 페이지 확인
    await expect(page).toHaveURL(/\/schedule\/\d+/);
    await expect(page.locator('h2').filter({ hasText: '점심 약속' })).toBeVisible();

    // 6. 뒤로가기 버튼 확인 (헤더의 왼쪽 버튼)
    const backButton = page.locator('header button').first();
    await page.waitForTimeout(2000);
    await backButton.click();
    await expect(page).toHaveURL(/\/chat\/agent/);
  });
});
