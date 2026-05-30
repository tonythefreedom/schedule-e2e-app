import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
// 전용 테스트 DB는 절대경로로 고정한다. webServer 프로세스의 cwd가 프로젝트
// 루트와 다를 수 있어, 상대경로를 쓰면 엉뚱한 위치를 가리켜 SQLITE_READONLY가 난다.
const TEST_DB = path.join(rootDir, 'test-database.sqlite');

export default defineConfig({
  testDir: './tests',
  // 테스트 2가 테스트 1이 등록한 일정을 조회하는 데이터 의존 시나리오이므로
  // 병렬 실행을 끄고 단일 워커로 정의된 순서(등록 → 조회)대로 실행한다.
  fullyParallel: false,
  // 한 테스트에서 LLM(Gemini)을 여러 번 연속 호출하므로 기본 30초로는 부족하다.
  timeout: 90000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
    },
    {
      // 서버 시작 직전에 전용 DB를 비운다. (globalSetup은 webServer보다 늦게 실행되어
      // 이미 열린 DB 파일을 unlink → SQLITE_READONLY를 유발하므로 여기서 처리한다.)
      command: `rm -f "${TEST_DB}" "${TEST_DB}-journal" "${TEST_DB}-wal" "${TEST_DB}-shm"; DATABASE_PATH=${TEST_DB} npm run server`,
      url: 'http://localhost:3001/api/schedules',
      // 테스트는 항상 전용 DB로 새로 띄운 서버를 써야 하므로 기존 서버를 재사용하지 않는다.
      reuseExistingServer: false,
    }
  ],
});
