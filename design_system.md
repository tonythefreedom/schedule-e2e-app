# Design System (Mobile Chat App)

이 문서는 `imgs/mobile_chat.jpg` 분석 결과를 바탕으로 정의된 HTML/CSS 디자인 시스템 가이드라인입니다.

## 1. Color Palette

### Primary Colors
- **Primary (iOS Blue):** `#007AFF` - 주요 액션 버튼, 링크, 내 메시지 배경
- **Secondary (Light Gray):** `#F2F2F7` - 상대방 메시지 배경, 헤더/푸터 배경
- **Background:** `#FFFFFF` - 메인 채팅 영역 배경

### Neutral Colors
- **Text Primary:** `#000000` - 주요 텍스트
- **Text Secondary:** `#8E8E93` - 타임스탬프, 부가 정보
- **Border/Divider:** `#C6C6C8` - 구분선 및 경계선

## 2. Typography

- **Font Family:** `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif` (System Font Stack)

### Text Styles
| Style | Size | Weight | Line Height | Color | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Title** | 17px | Semibold | 22px | `#000000` | 헤더 제목, 이름 |
| **Body** | 15px | Regular | 20px | `#000000` | 메시지 본문 |
| **Caption** | 12px | Regular | 16px | `#8E8E93` | 타임스탬프, 상태 표시 |

## 3. Components

### Message Bubbles
- **Padding:** `8px 12px`
- **Border Radius:** `18px`
- **My Message:**
  - Background: `#007AFF`
  - Text: `#FFFFFF`
  - Alignment: Right
- **Others Message:**
  - Background: `#F2F2F7`
  - Text: `#000000`
  - Alignment: Left

### Header
- **Height:** `44px`
- **Background:** `rgba(249, 249, 249, 0.94)` (Blured/Translucent)
- **Border Bottom:** `0.5px solid #C6C6C8`

### Input Bar
- **Height:** `Min-height 44px`
- **Input Background:** `#FFFFFF`
- **Input Border:** `1px solid #C6C6C8`
- **Input Radius:** `20px`
- **Action Icons:** `#007AFF`

## 4. Spacing & Layout
- **Horizontal Margin:** `16px`
- **Message Gap:** `4px` (동일인), `12px` (타인 전환 시)
- **Container Max-width:** `100%` (Mobile optimized)