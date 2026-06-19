# 일정 관리 에이전트 - 제품 요구사항 문서 (PRD)

## 1. 개요

### 1.1 프로젝트명
일정 관리 에이전트 (Schedule Agent)

### 1.2 목적
자연어 처리를 통해 일정을 생성, 조회, 제안하는 AI 기반 일정 관리 서비스

### 1.3 타겟 사용자
- 모바일 중심의 일정 관리가 필요한 사용자
- 자연어로 일정을 간편하게 관리하고 싶은 사용자
- 빠른 일정 등록 및 조회가 필요한 비즈니스 사용자

---

## 2. 화면 레이아웃

### 2.1 모바일 뷰포트
- **최대 너비**: 480px (Container 기준)
- **패딩**: 16px (모바일), 24px (데스크톱)
- **배경색**: `#F2F2F7` (Background)

### 2.2 주요 섹션 구조

```
┌─────────────────────────────────┐
│         네비게이션 바           │ ← navbar (Surface 배경, 하단 테두리)
├─────────────────────────────────┤
│                                 │
│    [일정 생성 입력 필드]        │ ← input 컴포넌트
│                                 │
├─────────────────────────────────┤
│                                 │
│    [일정 목록 카드]             │ ← card 컴포넌트 (여러 개)
│    - 제목, 날짜, 시간, 위치     │
│    - 상태 칩 (성공/경고/오류)   │
│                                 │
├─────────────────────────────────┤
│    [주요 액션 버튼]             │ ← btn-primary / btn-secondary
│                                 │
└─────────────────────────────────┘
```

### 2.3 컴포넌트 배치

#### 네비게이션 바 (Navbar)
- **위치**: 상단 고정
- **높이**: 자동 (패딩 포함 약 56px)
- **내용**: 페이지 제목 (navbar-title)
- **스타일**: Surface 배경, 하단 테두리 (#C6C6C8), 그림자 (shadow-sm)

#### 입력 필드 (Input)
- **위치**: 네비게이션 바 하단
- **너비**: 100% (Container 내)
- **높이**: 약 48px (패딩 포함)
- **플레이스홀더**: "일정을 입력하세요 (예: 내일 오후 2 시 미팅)"

#### 일정 카드 (Schedule Card)
- **레이아웃**: 세로 스택 (Flex-col)
- **간격**: space-4 (16px)
- **카드 내부 구조**:
  - Header: 일정 제목 (font-size-lg, font-weight-semibold)
  - Body: 날짜, 시간, 위치 (font-size-md, text-secondary)
  - Footer: 상태 칩, 액션 버튼

#### 버튼 (Buttons)
- **Primary**: 주요 액션 (일정 생성, 저장)
- **Secondary**: 보조 액션 (취소, 수정)
- **배치**: Flex-row, gap-3

---

## 3. 아키텍처 구조

### 3.1 전체 아키텍처

```
┌─────────────────────────────────────────────────────┐
│                  Frontend (React/Vite)              │
│                  http://localhost:5173              │
└────────────────────┬────────────────────────────────┘
                     │ CORS (credentials)
                     │
┌────────────────────▼────────────────────────────────┐
│              Backend (FastAPI)                      │
│  ┌───────────────────────────────────────────────┐  │
│  │            API Routes (main.py)               │  │
│  │  - POST /api/schedules (생성)                 │  │
│  │  - GET  /api/schedules (조회)                 │  │
│  │  - POST /api/suggest (제안)                   │  │
│  └───────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────┐  │
│  │         LLM Service (llm_service.py)          │  │
│  │  - 자연어 → JSON 파싱                         │  │
│  │  - OpenAI 호환 API 연동                       │  │
│  └───────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────┐  │
│  │        Database (SQLAlchemy ORM)              │  │
│  │  - models.py (Schedule 모델)                  │  │
│  │  - database.py (Engine, Session, Base)        │  │
│  └───────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│           LLM API (사내 추론 서버)                  │
│  https://agentgo-qwen.changshininc.com              │
│  - 모델: qwen3.5-122b                               │
│  - 엔드포인트: /v1/chat/completions                 │
└─────────────────────────────────────────────────────┘
```

### 3.2 데이터베이스 스키마

#### Schedule 테이블
```sql
CREATE TABLE schedules (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT NOT NULL,
    date        TEXT NOT NULL,      -- YYYY-MM-DD
    time        TEXT,               -- HH:MM
    location    TEXT,
    description TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### ORM 모델 (models.py)
- **Base**: database.py 에서 import (단일 출처)
- **필드**:
  - `id`: Integer, Primary Key
  - `title`: String, Not Null
  - `date`: String (YYYY-MM-DD), Not Null
  - `time`: String (HH:MM), Nullable
  - `location`: String, Nullable
  - `description`: Text, Nullable
  - `created_at`: DateTime, Default=datetime.utcnow

### 3.3 API 엔드포인트

#### 1. 일정 생성
```
POST /api/schedules
Content-Type: application/json

{
  "title": "삼성증권 미팅",
  "date": "2026-06-20",
  "time": "14:00",
  "location": "삼성증권 본사",
  "description": "분기별 투자 전략 회의"
}

Response: 201 Created
{
  "id": 1,
  "title": "삼성증권 미팅",
  "date": "2026-06-20",
  "time": "14:00",
  "location": "삼성증권 본사",
  "description": "분기별 투자 전략 회의",
  "created_at": "2026-06-19T10:30:00"
}
```

#### 2. 일정 조회
```
GET /api/schedules

Response: 200 OK
[
  {
    "id": 1,
    "title": "삼성증권 미팅",
    "date": "2026-06-20",
    "time": "14:00",
    "location": "삼성증권 본사",
    "description": "분기별 투자 전략 회의",
    "created_at": "2026-06-19T10:30:00"
  }
]
```

#### 3. 자연어 일정 제안
```
POST /api/suggest
Content-Type: application/json

{
  "message": "내일 오후 2 시에 삼성증권 미팅 잡아줘",
  "current_date": "2026-06-19"  // 기준 날짜 주입 필수
}

Response: 200 OK
{
  "action": "create",
  "schedule": {
    "title": "삼성증권 미팅",
    "date": "2026-06-20",
    "time": "14:00",
    "location": "삼성증권 본사"
  }
}
```

---

## 4. 기능 명세

### 4.1 일정 생성 (Create)

#### 사용자 시나리오
1. 사용자가 입력 필드에 자연어로 일정 입력
2. 시스템이 LLM 을 통해 구조화된 데이터로 변환
3. 사용자가 확인 후 저장
4. 일정 목록에 추가됨

#### 처리 흐름
```
사용자 입력 → LLM 파싱 (JSON) → 검증 → DB 저장 → 응답 반환
```

#### LLM 파싱 규칙 (LLM_GUIDE.md 기준)
- **모델**: qwen3.5-122b
- **Thinking**: 비활성화 (`enable_thinking: false`)
- **Temperature**: 0.1 (결정적 결과)
- **Timeout**: 30 초 이상
- **Max Tokens**: 512
- **현재 날짜 주입**: 필수 (상대 날짜 처리)

#### 시스템 프롬프트 예시
```
당신은 일정 정보를 추출하는 AI 어시스턴트입니다.
사용자의 자연어 입력에서 일정 정보를 JSON 형식으로만 추출하세요.

오늘 날짜는 {current_date} 입니다.

출력 형식 (JSON 만 반환, 설명 금지):
{
  "action": "create" | "view" | "suggest",
  "schedule": {
    "title": string,
    "date": "YYYY-MM-DD",
    "time": "HH:MM",
    "location": string,
    "description": string
  }
}
```

#### 검증 규칙
- `date`: YYYY-MM-DD 형식, 유효한 날짜
- `time`: HH:MM 형식 (24 시간제), 선택 항목
- `title`: 필수, 공백 제외 1 자 이상
- `location`, `description`: 선택 항목

### 4.2 일정 조회 (Read)

#### 조회 옵션
1. **전체 조회**: 모든 일정 목록
2. **날짜 필터**: 특정 날짜의 일정
3. **기간 필터**: 시작일 ~ 종료일 범위

#### 정렬
- 기본: 생성일 오름차순 (created_at ASC)
- 옵션: 날짜순 (date ASC), 시간순 (time ASC)

### 4.3 일정 제안 (Suggest)

#### 기능 설명
사용자의 자연어 메시지를 분석하여:
1. 일정 생성이 필요한지 판단
2. 기존 일정과 중복되는지 확인
3. 적절한 시간/장소를 제안

#### LLM 처리
- **입력**: 사용자 메시지 + 현재 날짜
- **출력**: action type + 구조화된 일정 데이터
- **폴백**: LLM 실패 시 정규식 기반 추출

### 4.4 상태 표시 (Chips)

#### 상태 타입
- **Success** (`#34C759`): 일정 성공적으로 저장됨
- **Warning** (`#FF9500`): 일정 중복 또는 충돌 가능성
- **Error** (`#FF3B30`): 저장 실패, 유효성 검사 실패
- **Info** (`#007AFF`): 정보 메시지

---

## 5. 디자인 시스템 적용

### 5.1 색상 매핑

| 용도 | 색상 변수 | Hex 값 |
|------|-----------|--------|
| 메인 액션 | `--primary-blue` | #007AFF |
| 호버/강조 | `--primary-dark` | #0056CC |
| 성공 | `--success` | #34C759 |
| 경고 | `--warning` | #FF9500 |
| 오류 | `--error` | #FF3B30 |
| 배경 | `--background` | #F2F2F7 |
| 표면 (카드) | `--surface` | #FFFFFF |
| 메인 텍스트 | `--text-primary` | #000000 |
| 서브 텍스트 | `--text-secondary` | #8E8E93 |
| 테두리 | `--border` | #C6C6C8 |

### 5.2 타이포그래피

| 요소 | 폰트 크기 | 라인 높이 | 폰트 두께 |
|------|-----------|-----------|-----------|
| H1 (메인 제목) | 30px | 1.25 | 700 (Bold) |
| H2 (섹션 제목) | 24px | 1.25 | 600 (SemiBold) |
| H3 (카드 제목) | 20px | 1.3 | 600 (SemiBold) |
| Body Large | 18px | 1.5 | 400 (Normal) |
| Body | 16px | 1.5 | 400 (Normal) |
| Body Small | 14px | 1.4 | 400 (Normal) |
| Caption | 12px | 1.4 | 400 (Normal) |

### 5.3 간격 시스템

| 요소 | 간격 | CSS 변수 |
|------|------|-----------|
| 페이지 패딩 | 16px | `--page-padding` |
| 카드 패딩 | 16px | `--card-padding` |
| 섹션 간격 | 24px | `--section-spacing` |
| 요소 간격 (작음) | 8px | `--space-2` |
| 요소 간격 (보통) | 16px | `--space-4` |
| 요소 간격 (큼) | 24px | `--space-6` |

### 5.4 컴포넌트 스타일

#### 버튼
- **Primary**: 배경 #007AFF, 텍스트 흰색, 패딩 12px 24px, 테두리 8px
- **Secondary**: 배경 투명, 텍스트 #007AFF, 테두리 1px #007AFF, 패딩 12px 24px
- **호버**: 배경 #0056CC (Primary), 배경 rgba(0,122,255,0.1) (Secondary)

#### 카드
- 배경: #FFFFFF
- 테두리: 1px #C6C6C8
- 패딩: 16px
- 둥글기: 12px
- 그림자: `0 4px 6px rgba(0,0,0,0.1)`

#### 입력 필드
- 배경: #FFFFFF
- 테두리: 1px #C6C6C8
- 패딩: 12px 16px
- 포커스: 테두리 #007AFF, 그림자 rgba(0,122,255,0.2)
- 둥글기: 8px

---

## 6. 기술 스택

### 6.1 Frontend
- **프레임워크**: React (Vite 기반 추정)
- **포트**: 5173
- **스타일링**: CSS Variables (디자인 시스템 기반)

### 6.2 Backend
- **프레임워크**: FastAPI (Python)
- **ORM**: SQLAlchemy
- **데이터베이스**: SQLite (schedules.db)
- **데이터 검증**: Pydantic v2

### 6.3 LLM
- **엔드포인트**: https://agentgo-qwen.changshininc.com/v1/chat/completions
- **모델**: qwen3.5-122b
- **프로토콜**: OpenAI 호환 API
- **인증**: 없음 (사내망/VPN 전용)

---

## 7. 보안 및 성능

### 7.1 CORS 설정
```
allow_origins=["http://localhost:5173"]  # 명시적 오리진
allow_credentials=True
```

### 7.2 LLM 호출 안전장치
- **Timeout**: 30 초 이상
- **예외 처리**: 네트워크 오류, 파싱 실패 대응
- **폴백**: 정규식 기반 추출 (LLM 실패 시)
- **검증**: 필수 키 (date/time) 확인 후 저장

### 7.3 데이터 유효성 검사
- 날짜 형식: YYYY-MM-DD (정규식 검증)
- 시간 형식: HH:MM (24 시간제)
- 필수 필드: title, date
- 선택 필드: time, location, description

---

## 8. 개발 가이드

### 8.1 코드 작성 규칙 (CODING_GUIDE.md 기준)

1. **Base 단일 출처**: `declarative_base()` 는 database.py 에서만 호출
2. **Import 검증**: 사용하는 모든 ORM 클래스 import 확인
3. **테이블 생성**: 앱 기동 시 `Base.metadata.create_all(bind=engine)`
4. **ORM→Pydantic**: `model_validate()` 사용, `from_attributes=True`
5. **CORS**: 명시적 오리진만 허용, "*" 금지
6. **시간 처리**: `ZoneInfo("Asia/Seoul")` 명시, 기준 날짜 파라미터화
7. **LLM 호출**: timeout, 예외 처리, 정규식 폴백 필수

### 8.2 LLM 연동 규칙 (LLM_GUIDE.md 기준)

1. **모델 ID**: `/v1/models` 로 확인한 정확한 값 (`qwen3.5-122b`)
2. **Thinking 비활성화**: `chat_template_kwargs.enable_thinking = false`
3. **현재 시각 주입**: 상대 날짜 처리 시 필수
4. **Timeout**: 최소 30 초
5. **JSON 파싱**: 코드펜스 제거 또는 `{`~`}` 추출
6. **Temperature**: 추출 작업은 0.1 낮게

---

## 9. 체크리스트

### 개발 전
- [ ] 모델 ID 확인 (`qwen3.5-122b`)
- [ ] 네트워크 접근성 확인 (사내망/VPN)
- [ ] 환경 변수 설정 (BASE_URL, MODEL_ID)

### 코드 작성 시
- [ ] `declarative_base()` 단일 호출 확인
- [ ] 모든 Import 검증 (NameError 없음)
- [ ] `Base.metadata.create_all` 존재 확인
- [ ] ORM→Pydantic 변환에 `model_validate` 사용
- [ ] CORS 설정에 명시적 오리진
- [ ] LLM 호출에 timeout, 예외 처리, 폴백

### LLM 연동 시
- [ ] `enable_thinking: false` 설정 (단순 추출 작업)
- [ ] 현재 날짜/시간 주입 (상대 표현 처리)
- [ ] Timeout 30 초 이상
- [ ] `content` null/공백 처리
- [ ] JSON 파싱 방어 로직 (코드펜스 제거)
- [ ] 필수 키 검증 (date/time)

---

## 10. 버전 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|------------|
| 1.0 | 2026-06-19 | 초기 PRD 작성 |

---

*문서 생성일: 2026-06-19*
*참고 문서: design_system.md, CODING_GUIDE.md, LLM_GUIDE.md, imgs/mobile_chat.jpg*
