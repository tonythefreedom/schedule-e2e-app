# LLM 연동 가이드

이 문서는 사내 LLM 추론 서버(OpenAI 호환 API)를 연동할 때의 표준 사용법과 반드시 지켜야 할 주의사항을 정리한 것입니다. 특정 애플리케이션 구현과 무관하게 공통으로 적용됩니다.

## 1. 엔드포인트 / 모델 정보

| 항목 | 값 |
|------|-----|
| Base URL | `https://agentgo-qwen.changshininc.com` |
| Chat 엔드포인트 | `POST /v1/chat/completions` |
| 모델 목록 | `GET /v1/models` |
| 모델 ID | `qwen3.5-122b` |
| 서버 종류 | vLLM (OpenAI 호환 API) |
| max_model_len | 131072 |
| 인증 | 현재 없음 (API Key 헤더 불필요) |

> **모델 ID는 반드시 `/v1/models`로 확인한 정확한 값을 사용**할 것. `qwen` 같은 축약명은 `404 NotFoundError: The model 'qwen' does not exist.`를 반환합니다.

```bash
# 사용 가능한 모델 확인
curl -s https://agentgo-qwen.changshininc.com/v1/models | jq '.data[].id'
# => "qwen3.5-122b"
```

OpenAI 호환 API이므로 OpenAI SDK / LangChain 등에서 `base_url`만 위 주소로 바꿔 사용할 수 있습니다.

## 2. thinking(추론) 비활성화 — 필수

`qwen3.5-122b`는 **추론(thinking) 모델**입니다. 기본 상태로 호출하면:

- 사고 과정이 `message.reasoning` 필드로 들어가고, **`message.content`가 `null`** 이 됩니다.
- 사고 토큰을 길게 생성하느라 **응답이 매우 느립니다(상황에 따라 120초 초과 → 타임아웃)**.

따라서 단순 추출·분류·응답처럼 사고 과정이 불필요한 작업에서는 요청 본문에 다음을 넣어 thinking을 끕니다.

```jsonc
"chat_template_kwargs": { "enable_thinking": false }
```

thinking을 끄면 동일 요청이 **약 4~6초** 안에 `content`로 결과를 반환합니다. (복잡한 추론이 실제로 필요한 작업이라면 켠 채로 충분한 타임아웃을 두고 사용)

### 기본 요청 형태 (언어 무관)

```jsonc
POST /v1/chat/completions
{
  "model": "qwen3.5-122b",
  "messages": [
    { "role": "system", "content": "<지시문>" },
    { "role": "user",    "content": "<사용자 입력>" }
  ],
  "temperature": 0.1,
  "max_tokens": 512,
  "chat_template_kwargs": { "enable_thinking": false }
}
```

### Python (OpenAI SDK) 예시

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://agentgo-qwen.changshininc.com/v1",
    api_key="not-needed",  # 인증 없음 (빈 값 방지용 더미)
)

resp = client.chat.completions.create(
    model="qwen3.5-122b",
    messages=[
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_message},
    ],
    temperature=0.1,
    max_tokens=512,
    extra_body={"chat_template_kwargs": {"enable_thinking": False}},
    timeout=30,
)
content = resp.choices[0].message.content
```

> `requests`로 직접 호출할 때는 `chat_template_kwargs`를 JSON 본문 최상위에 그대로 넣습니다.

## 3. 주의사항

### 3-1. 상대 날짜·시간은 현재 시각을 주입할 것
모델은 "지금"이 언제인지 모릅니다. `오늘`, `내일`, `다음주 월요일` 같은 상대 표현을 다루려면 현재 날짜를 직접 알려줘야 합니다. 주입하지 않으면 임의의 과거 날짜(예: `2024-05-22`)로 잘못 변환합니다.
→ 프롬프트에 `오늘 날짜는 {YYYY-MM-DD (요일)} 입니다.` 같은 문장을 포함해 전달합니다.

### 3-2. 타임아웃은 넉넉하게
대형 모델(122B)은 thinking을 꺼도 응답에 4~6초가 걸립니다. `timeout=10` 같은 짧은 값은 정상 응답도 실패로 처리하게 만들므로 **최소 30초**를 권장합니다. thinking을 켜는 작업이라면 더 길게 잡습니다.

### 3-3. `content`가 비어 있을 수 있음
thinking이 켜져 있거나 `max_tokens`가 너무 작아 출력이 도중에 잘리면 `content`가 `null`/공백이 됩니다. 파싱 전에 `content`와 `finish_reason`(`length`면 토큰 부족)을 확인하세요.

### 3-4. 구조화 출력(JSON)은 방어적으로 파싱
시스템 프롬프트로 "JSON만 반환"을 지시해도 모델이 코드펜스(```json … ```)나 설명을 덧붙일 수 있습니다.
- 코드펜스 제거 후 파싱하거나, 응답에서 첫 `{` ~ 마지막 `}` 구간만 추출해 파싱하는 등 방어 로직을 둡니다.
- 가능하면 서버의 구조화 출력 기능(`response_format`의 `json_object` / `json_schema`, 또는 guided decoding)을 사용해 스키마를 강제하는 편이 안전합니다.
- 파싱 실패 시의 폴백(예: 정규식 기반 추출)은 적용 범위가 좁아 안전망이 되기 어렵습니다. **LLM 본 경로(thinking off + 현재 시각 주입 + 명확한 출력 형식 지시)가 정상 동작하는 것을 전제**로 설계하세요.

### 3-5. 네트워크 도달성
추론 서버(`agentgo-qwen.changshininc.com`)는 사내망/VPN 전용입니다. 외부망·CI에서는 DNS 해석이 안 되거나(NXDOMAIN) 연결이 거부될 수 있습니다. 배포·테스트 환경의 네트워크 접근성을 먼저 확인하세요.

### 3-6. `max_tokens`
짧은 구조화 응답은 `512`면 충분합니다. 단, thinking을 켠 상태에서 작은 값을 주면 사고 도중 잘려 `content`가 비므로, 작은 값은 **thinking off와 함께** 사용합니다.

### 3-7. 파라미터 기본값
- `temperature`: 추출·분류 등 결정적 결과가 필요하면 `0.1` 내외로 낮게.
- 동일 입력에 대한 재현성이 중요하면 temperature를 낮추고 출력 형식을 명확히 지시합니다.

## 4. 동작 검증 스니펫

```bash
# thinking off + 현재 날짜 주입 → ~5초, 결과 반환 확인
curl -s -m 40 -X POST https://agentgo-qwen.changshininc.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen3.5-122b",
    "messages": [
      {"role": "system", "content": "일정 정보를 추출해 유효한 JSON만 반환."},
      {"role": "user", "content": "오늘 날짜는 2026-06-18 입니다.\n사용자 메시지: 오늘 오후 2시 삼성증권 미팅 잡아줘"}
    ],
    "temperature": 0.1,
    "max_tokens": 512,
    "chat_template_kwargs": {"enable_thinking": false}
  }'
```

## 5. 체크리스트

- [ ] 모델 ID를 `/v1/models`로 확인했는가 (`qwen3.5-122b`)
- [ ] 사고가 불필요한 작업에 `chat_template_kwargs.enable_thinking = false`를 넣었는가
- [ ] 상대 날짜·시간을 다룬다면 현재 시각을 주입했는가
- [ ] `timeout`을 30초 이상으로 설정했는가
- [ ] `content`가 비거나 `finish_reason=length`인 경우를 처리했는가
- [ ] 구조화 출력(JSON)을 방어적으로 파싱하거나 스키마를 강제했는가
- [ ] 대상 환경에서 엔드포인트 네트워크 접근이 가능한가
