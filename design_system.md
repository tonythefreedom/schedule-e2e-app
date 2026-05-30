# Mobile Chat App Design System

`imgs/mobile_chat.jpg` 이미지를 분석하여 도출한 HTML/CSS용 디자인 시스템 가이드라인입니다.

## 1. Color Palette

### Primary Colors
- **Primary (Blue):** `#007AFF` (헤더 배경, 보낸 메시지 말풍선, 전송 버튼)
- **Text White:** `#FFFFFF` (헤더 텍스트, 보낸 메시지 텍스트)

### Background & Surface
- **App Background:** `#F2F2F7` (전체 채팅 배경)
- **Received Bubble:** `#E9E9EB` (받은 메시지 말풍선 배경)
- **Input Background:** `#FFFFFF` (하단 입력창 배경)
- **Input Field:** `#F2F2F7` (입력 필드 내부 배경)

### Text Colors
- **Primary Text:** `#000000` (받은 메시지 텍스트, 입력창 텍스트)
- **Secondary Text:** `#8E8E93` (타임스탬프, 읽음 표시)

---

## 2. Typography

- **Font Family:** `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif` (시스템 폰트 권장)
- **Font Sizes:**
  - **Header Title:** `17px` (Semi-bold)
  - **Message Text:** `15px` (Regular)
  - **Timestamp:** `11px` (Regular)
  - **Input Text:** `16px` (Regular)

---

## 3. Spacing & Layout

- **Base Unit:** `4px`
- **Container Padding:** `16px` (좌우 여백)
- **Message Bubble:**
  - **Padding:** `8px 12px`
  - **Border Radius:** `18px`
  - **Bubble Gap:** `8px` (메시지 간 간격)
- **Header Height:** `44px` ~ `56px`
- **Bottom Input Height:** `60px` (Padding 포함)

---

## 4. Components

### Header
- 상단 고정 (Fixed)
- 왼쪽: 뒤로가기 버튼
- 중앙: 상대방 이름 및 프로필 이미지
- 오른쪽: 통화/더보기 버튼

### Chat Bubbles
- **Sent:** `flex-direction: row-reverse`, 오른쪽 정렬, 파란 배경
- **Received:** `flex-direction: row`, 왼쪽 정렬, 연회색 배경, 프로필 이미지 포함

### Message Input
- 하단 고정 (Fixed)
- Rounded Corner Input Field (`border-radius: 20px`)
- 오른쪽 끝에 전송 아이콘 버튼

### Schedule Components
- **Weekly Calendar:** 상단 날짜 선택 슬라이더, 선택된 날짜 강조 (`#007AFF` 배경)
- **Schedule Item:** 시간, 제목, 설명 포함. 카드 스타일 (`background: #FFFFFF`, `border-radius: 12px`)
- **Action Button:** 일정 등록 버튼, 눈에 띄는 디자인

---

## 5. CSS variables (Utility)

```css
:root {
  --primary-blue: #007AFF;
  --bg-color: #F2F2F7;
  --bubble-received: #E9E9EB;
  --bubble-sent: #007AFF;
  --text-main: #000000;
  --text-white: #FFFFFF;
  --text-muted: #8E8E93;
  
  --radius-bubble: 18px;
  --spacing-main: 16px;
}
```
