# Mobile Chat App - 일정관리 에이전트

이 프로젝트는 사용자와의 대화를 통해 일정을 관리해주는 모바일 웹 애플리케이션입니다. Google Gemini AI를 활용하여 사용자의 자연어 요청을 분석하고 일정을 생성, 조회, 분석합니다.

## 🚀 주요 기능

- **자연어 일정 생성**: "오늘 오후 2시에 회의 잡아줘"와 같은 대화를 통해 자동으로 일정을 등록합니다.
- **스마트 일정 조회**: 현재 저장된 일정을 기반으로 오늘의 일정이나 이번 주 일정을 확인하고 시각화된 캘린더를 제공합니다.
- **일정 분석 및 상담**: "이번 주에 언제 비어있어?"와 같은 질문에 대해 기존 일정을 분석하여 답변합니다.
- **모바일 최적화 UI**: 채팅 인터페이스와 주간 캘린더 뷰를 통해 모바일 환경에 최적화된 경험을 제공합니다.

## 🛠 기술 스택

### Frontend

- **Framework**: React 18, TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS, PostCSS
- **Routing**: React Router DOM
- **Icons**: Lucide React

### Backend

- **Runtime**: Node.js (tsx)
- **Framework**: Express
- **AI**: Google Generative AI (Gemini Pro)
- **Database**: SQLite3 (sqlite)

## 📁 프로젝트 구조

```
.
├── server/               # 백엔드 서버 소스 코드
│   ├── index.ts          # Express 서버 및 Gemini AI 연동
│   ├── db.ts             # SQLite 데이터베이스 설정
│   └── gemini.ts         # AI 관련 로직
├── src/                  # 프론트엔드 소스 코드
│   ├── components/       # 공통 컴포넌트 (ChatBubble, Header, WeeklyCalendar 등)
│   ├── pages/            # 페이지 컴포넌트 (ChatList, ChatPage, ScheduleDetail 등)
│   ├── types/            # TypeScript 타입 정의
│   ├── App.tsx           # 라우팅 설정
│   └── main.tsx          # 진입점
├── tests/                # Playwright E2E 테스트 코드
├── public/               # 정적 자산
├── index.html            # 메인 HTML
├── package.json          # 의존성 및 스크립트 설정
├── playwright.config.ts  # E2E 테스트 설정
├── tailwind.config.js    # Tailwind CSS 설정
└── vite.config.ts        # Vite 빌드 설정
```

## ⚙️ 설치 및 실행 방법

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 설정

프로젝트 루트에 `.env` 파일을 생성하고 Gemini API 키를 설정합니다.

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. 애플리케이션 실행

**백엔드 서버 실행:**

```bash
npm run server
```

서버는 기본적으로 `http://localhost:3001`에서 동작합니다.

**프론트엔드 개발 서버 실행:**

```bash
npm run dev
```

기본적으로 `http://localhost:5173`에서 접속 가능합니다.

### 4. 테스트 실행

Playwright를 이용한 E2E 테스트를 실행하려면:

```bash
npx playwright test
```

## 📝 참고 사항

- 백엔드 서버가 실행 중이어야 채팅 기능을 정상적으로 이용할 수 있습니다.
- 데이터는 프로젝트 루트의 `database.sqlite` 파일에 저장됩니다.
