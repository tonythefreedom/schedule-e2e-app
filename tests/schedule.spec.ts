import { test, expect } from '@playwright/test';

/**
 * 일정 관리 E2E 테스트
 * 자연어 처리를 통한 일정 등록 및 확인 기능을 검증합니다.
 */
test.describe('Schedule Management (Natural Language)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    // '일정관리 에이전트' 채팅방 클릭하여 입장
    await page.getByText('일정관리 에이전트').first().click();
    // 채팅 입력창(input)이 나타날 때까지 대기
    await page.waitForSelector('input[type="text"]', { state: 'visible', timeout: 30000 });
  });

  test('복합적인 정보가 포함된 일정 등록 및 확인', async ({ page }) => {
    const chatInput = page.locator('input[type="text"]');

    // 1. 장소와 참석자가 포함된 저녁 약속 등록
    await chatInput.fill('오늘 저녁 7시에 강남역 부근에서 유명환 대표님과 저녁 약속 잡아줘');
    await chatInput.press('Enter');
    
    // 응답 확인 및 시각적 대기
    await expect(page.locator('div[class*="bg-white"]').last()).toContainText(/(등록|완료|확인|잡아드렸습니다)/);
    await page.waitForTimeout(2000);

    // 2. 구체적인 장소(식당)가 포함된 점심 약속 등록
    await chatInput.fill('내일 오후 1시에 회사 근처 부엉이식당에서 병대와 점심 약속 잡아줘');
    await chatInput.press('Enter');
    
    await expect(page.locator('div[class*="bg-white"]').last()).toContainText(/(등록|완료|확인|잡아드렸습니다)/);
    await page.waitForTimeout(2000);

    // 3. 오늘 일정 확인
    await chatInput.fill('나 오늘 일정이 어떻게 되지?');
    await chatInput.press('Enter');
    
    const todayResponse = page.locator('div[class*="bg-white"]').last();
    await expect(todayResponse).toContainText('유명환');
    await expect(todayResponse).toContainText('강남역');
    await page.waitForTimeout(2000);

    // 4. 특정 인물과의 약속 확인
    await chatInput.fill('내일 점심 약속이 있었던 거 같은데 확인해 줄래?');
    await chatInput.press('Enter');
    
    const tomorrowResponse = page.locator('div[class*="bg-white"]').last();
    await expect(tomorrowResponse).toContainText('병대');
    await expect(tomorrowResponse).toContainText('부엉이식당');
    await page.waitForTimeout(2000);
  });

  test('주간 일정 및 빈 시간 확인', async ({ page }) => {
    const chatInput = page.locator('input[type="text"]');

    // 1. 주간 일정 조회
    await chatInput.fill('내 주간 일정 보여줘');
    await chatInput.press('Enter');
    
    // 주간 일정에 대한 응답이 오는지 확인
    await expect(page.locator('div[class*="bg-white"]').last()).toContainText(/(월|화|수|목|금|토|일|이번 주|일정)/);
    await page.waitForTimeout(2000);

    // 2. 빈 시간 확인 및 추천
    await chatInput.fill('이번주에 언제 일정이 비는 날이 있지?');
    await chatInput.press('Enter');
    
    await expect(page.locator('div[class*="bg-white"]').last()).toContainText(/(비어|가능|추천|없습니다)/);
    await page.waitForTimeout(2000);

    // 3. 약속 시간 추천 요청
    await chatInput.fill('점심약속을 잡고 싶은데 언제가 적당할까?');
    await chatInput.press('Enter');
    
    await expect(page.locator('div[class*="bg-white"]').last()).toContainText(/(추천|어떠세요|시간|적당)/);
    await page.waitForTimeout(2000);
  });
});