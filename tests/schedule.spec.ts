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
    
    // 응답 확인 및 시각적 대기 (assistant 메시지 버블 타겟팅)
    // 새로운 메시지가 추가될 때까지 대기하기 위해 카운트를 활용하거나 특정 텍스트 대기
    await page.waitForTimeout(5000);
    const lastMessage = await page.locator('.flex.justify-start').last().innerText();
    console.log('Last message:', lastMessage);
    await expect(page.locator('.flex.justify-start').last()).toContainText(/(등록|완료|확인|잡아드렸습니다)/, { timeout: 15000 });
    await page.waitForTimeout(1000);

    // 2. 구체적인 장소(식당)가 포함된 점심 약속 등록
    await chatInput.fill('내일 오후 1시에 회사 근처 부엉이식당에서 병대와 점심 약속 잡아줘');
    await chatInput.press('Enter');
    
    await expect(page.locator('.flex.justify-start').last()).toContainText(/(등록|완료|확인|잡아드렸습니다)/, { timeout: 15000 });
    await page.waitForTimeout(1000);

  });

  test('주간 일정 및 빈 시간 확인', async ({ page }) => {
    const chatInput = page.locator('input[type="text"]');

    // 1. 오늘 일정 확인
    await chatInput.fill('나 오늘 일정이 어떻게 되지?');
    await chatInput.press('Enter');
    
    await expect(page.locator('.flex.justify-start').last()).toContainText('유명환', { timeout: 15000 });
    await expect(page.locator('.flex.justify-start').last()).toContainText('강남역');
    await page.waitForTimeout(1000);

    // 2. 특정 인물과의 약속 확인
    await chatInput.fill('내일 점심 약속이 있었던 거 같은데 확인해 줄래?');
    await chatInput.press('Enter');
    
    await expect(page.locator('.flex.justify-start').last()).toContainText('병대', { timeout: 15000 });
    await expect(page.locator('.flex.justify-start').last()).toContainText('부엉이식당');
    await page.waitForTimeout(1000);

    // 3. 주간 일정 조회
    await chatInput.fill('내 주간 일정 보여줘');
    await chatInput.press('Enter');
    
    // 주간 일정에 대한 응답이 오는지 확인 (LLM 응답 지연을 고려해 충분한 타임아웃 적용)
    await expect(page.locator('.flex.justify-start').last()).toContainText(/(월|화|수|목|금|토|일|이번 주|일정)/, { timeout: 15000 });
    await page.waitForTimeout(2000);

    // 4. 빈 시간 확인 및 추천
    await chatInput.fill('이번주에 언제 일정이 비는 날이 있지?');
    await chatInput.press('Enter');

    await expect(page.locator('.flex.justify-start').last()).toContainText(/(비어|가능|추천|없습니다|목록)/, { timeout: 15000 });
    await page.waitForTimeout(2000);

    // 5. 약속 시간 추천 요청
    await chatInput.fill('점심약속을 잡고 싶은데 언제가 적당할까?');
    await chatInput.press('Enter');
    
    // 응답에 추천, 시간, 비어있음 등의 키워드가 포함되어 있는지 확인
    await expect(page.locator('.flex.justify-start').last()).toContainText(/(추천|어떠세요|시간|적당|목록|없습니다|없네요|비어|가능)/, { timeout: 15000 });
    await page.waitForTimeout(2000);
  });
});
