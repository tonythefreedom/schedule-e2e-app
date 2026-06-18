# 백엔드 코딩 가이드 (FastAPI + SQLAlchemy)

이 문서는 LLM 코드 생성 시 발생했던 실제 결함을 바탕으로, 동일한 문제가
재발하지 않도록 하는 규칙 모음이다.

## 규칙 1 — 모델·엔진·Base는 단 하나의 출처에서 공유한다

`declarative_base()`는 **프로젝트 전체에서 한 번만** 호출한다. 여러 파일에서
각각 호출하면 서로 다른 메타데이터가 생겨 테이블이 연결되지 않는다.

```python
# database.py  ← Base/engine/SessionLocal의 유일한 출처
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

engine = create_engine(
    "sqlite:///./schedules.db",
    connect_args={"check_same_thread": False},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()   # 오직 여기서만
```

```python
# models.py  ← Base를 새로 만들지 말고 import 한다
from database import Base   # ❌ declarative_base() 재호출 금지
```

## 규칙 2 — 사용하는 모든 심볼은 반드시 import 한다 (생성 후 자가 점검)

`Schedule`, `User` 같은 ORM 클래스를 코드에서 쓰면 파일 상단에 import가
있는지 **출력 직전 검증**한다.

> 자가 점검: "이 파일에서 대문자로 시작하는 식별자를 호출했는데, 정의도
> import도 없는 것이 있는가?" → 있으면 NameError다.

```python
# main.py
from database import engine, SessionLocal, Base
from models import Schedule          # ✅ 사용하므로 반드시 import
```

## 규칙 3 — ORM 모델은 시작 시 테이블을 생성한다

SQLite/개발 환경이면 앱 기동 시 `create_all`을 호출한다. (운영은 Alembic 권장)

```python
Base.metadata.create_all(bind=engine)   # 모델 import 이후에 호출
```

## 규칙 4 — ORM → Pydantic 변환은 `model_validate`를 쓴다

`__dict__`나 `**unpack`은 SQLAlchemy 내부 상태를 흘린다. `from_attributes=True`를
켜고 공식 변환을 쓴다.

```python
class ScheduleResponse(BaseModel):
    id: int
    title: str
    model_config = {"from_attributes": True}     # Pydantic v2

# 변환
ScheduleResponse.model_validate(db_obj)          # ✅
# ScheduleResponse(**db_obj.__dict__)            # ❌ _sa_instance_state 유입
```

## 규칙 5 — CORS는 정확한 조합만 쓴다

인증정보를 보낼 때 `"*"`는 금지. 명시적 오리진을 나열한다.

```python
allow_origins=["http://localhost:5173"],   # credentials 쓰면 "*" 불가
allow_credentials=True,
```

## 규칙 6 — 기본값/시간 처리

- `default=lambda: None`처럼 의미 없는 기본값을 넣지 않는다. 생성 시각은
  `default=datetime.utcnow`(또는 `server_default=func.now()`).
- "오늘/내일/다음주"를 해석할 땐 타임존을 명시(`ZoneInfo("Asia/Seoul")`)하고,
  기준 날짜를 요청 파라미터로 받을 수 있게 둔다 — 서버 로컬 `datetime.now()`
  암묵 의존 금지.

## 규칙 7 — 외부 LLM 호출은 항상 폴백·타임아웃·검증을 갖춘다

`timeout`, 예외 처리, 정규식 폴백이 있어야 한다. 추가로 LLM이 돌려준 JSON에
**필수 키(date/time)가 있는지 검증**한 뒤 저장한다.

---

## 출력 전 최종 체크리스트 (코드 내보내기 직전 실행)

- [ ] `declarative_base()`가 전체에서 1번만 호출되는가?
- [ ] 코드에서 쓰는 모든 ORM 클래스가 import 되어 있는가? (NameError 후보 0개)
- [ ] `Base.metadata.create_all` 또는 마이그레이션이 존재하는가?
- [ ] 모든 모델이 같은 `Base`/`engine`을 공유하는가?
- [ ] ORM→스키마 변환에 `model_validate`/`from_attributes`를 쓰는가?
- [ ] `import`만 하고 안 쓰거나, 쓰는데 import 안 한 게 없는가?
