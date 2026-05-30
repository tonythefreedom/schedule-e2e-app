# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

대화(자연어)로 일정을 등록·조회·추천하는 모바일 웹 앱. React(Vite) 프론트엔드 + Express 백엔드 + Google Gemini로 의도를 분석하고 SQLite에 일정을 저장한다.

## Commands

```bash
npm run dev        # Vite 프론트엔드 (http://localhost:5173)
npm run server     # Express + Gemini 백엔드 (http://localhost:3001)
npm run build      # tsc 타입체크 후 vite 프로덕션 빌드
npm run lint       # ESLint (--max-warnings 0)

npx playwright test                          # E2E 전체 실행
npx playwright test tests/schedule.spec.ts   # 단일 파일
npx playwright test -g "주간 일정"            # 제목으로 단일 테스트
npx playwright show-report                   # 마지막 리포트 보기
```

채팅 기능을 쓰려면 백엔드(`npm run server`)와 프론트엔드(`npm run dev`)를 **둘 다** 띄워야 한다. Playwright는 `playwright.config.ts`의 `webServer` 설정으로 두 서버를 자동 기동하므로 테스트 시 수동 기동은 불필요하다.

## Environment

루트 `.env`에 키를 둔다 (gitignore됨). **중요:** README는 `GEMINI_API_KEY`라고 적혀 있으나 실제 코드([server/gemini.ts](server/gemini.ts))가 읽는 변수는 `GEMINI_KEY`다. 키가 없거나 틀리면 `analyzeSchedule`이 `null`을 반환하고 채팅이 조용히 실패한다.

E2E 테스트는 Gemini API를 모킹하지 않고 실제 호출하므로, 테스트 통과에도 유효한 `GEMINI_KEY`가 필요하다.

## Architecture

**의도 기반 파이프라인.** 핵심 흐름은 사용자 메시지 → Gemini가 의도(intent) JSON으로 분류 → 백엔드가 intent에 따라 분기 처리다.

1. **[server/gemini.ts](server/gemini.ts) — `analyzeSchedule(message, existingSchedules)`**: 기존 일정 목록과 오늘 날짜를 프롬프트에 주입해 Gemini를 호출하고, `responseMimeType: "application/json"`으로 JSON을 받는다. 응답에서 정규식으로 `{...}`를 추출하고, 파싱 실패 시 escape를 보정해 재시도하는 방어 로직이 있다. 모델은 `gemini-3.0-flash`. intent 종류: `create` | `duplicate` | `query` | `recommend`/`check_free` | `unknown`.

2. **[server/index.ts](server/index.ts) — `/api/chat`**: intent별로 응답 `type`을 결정한다. `create`면 DB INSERT 후 `schedule_created`, `query`면 `query_type`(today/tomorrow/week/person)에 따라 **백엔드에서 날짜 필터링**(Gemini가 아니라 서버 코드가 직접 today/tomorrow를 계산)해 `calendar` 타입으로 반환. `duplicate`면 확인 메시지만 보낸다. 응답에는 보통 갱신된 `weeklySchedules` 배열이 함께 실린다.

3. **[server/db.ts](server/db.ts)**: `sqlite`/`sqlite3`로 단일 `schedules` 테이블(id, title, date, time, location, content)을 만든다. 파일 경로는 `DATABASE_PATH` 또는 `./database.sqlite`.

**프론트엔드.** [src/App.tsx](src/App.tsx)가 라우팅. 일정 에이전트 채팅은 `/chat/:id`에서 **`id === 'agent'`일 때만** 백엔드와 통신한다([src/pages/ChatRoom.tsx](src/pages/ChatRoom.tsx)). 마운트 시 `GET /api/schedules`로 DB와 동기화하고, 메시지 전송 시 `POST /api/chat` 응답의 `type`에 따라 일반 텍스트 버블 또는 `WeeklyCalendar`가 포함된 버블을 렌더링한다. 상세 페이지 이동/복귀 시 메시지·일정 상태는 `location.state`로 보존한다.

**Vite 프록시 없음.** 프론트엔드가 백엔드를 직접 호출한다. [src/pages/ChatRoom.tsx](src/pages/ChatRoom.tsx)는 `VITE_API_BASE_URL`(기본 `http://localhost:3001/api`)을 쓰지만, [src/pages/ChatPage.tsx](src/pages/ChatPage.tsx)는 `http://127.0.0.1:3001`을 하드코딩한다. 두 채팅 화면 구현이 공존하니, 에이전트 동작을 수정할 때는 실제 라우트가 가리키는 컴포넌트(ChatRoom)를 대상으로 하라.

## Gotchas

- **localStorage ↔ DB 동기화**: 일정의 진실 소스(source of truth)는 SQLite다. 프론트는 마운트마다 `/api/schedules`로 다시 동기화한다. 동기화 관련 회귀가 잦았으므로(최근 커밋 이력 참고), 일정 상태를 만지는 변경 후엔 calendar 렌더링을 확인할 것.
- **루트의 `test-*.ts` / `list-models*.js` / `*-fetch.js`**: Gemini 모델 확인용 임시 스크립트다. 앱 코드가 아니므로 import하지 말 것.
- **E2E는 시간 의존적**: 테스트가 "오늘/내일" 키워드와 `waitForTimeout`에 의존하고 실제 LLM 응답을 기다리므로 간헐적으로 불안정할 수 있다.

## Styling

Tailwind CSS. iOS 메신저 풍 디자인 토큰은 [design_system.md](design_system.md)에 정리됨(primary `#007AFF`, 앱 배경 `#F2F2F7`, 버블 radius `18px` 등). 새 UI는 이 팔레트를 따른다.
