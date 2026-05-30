# Mobile Chat Design System

`imgs/mobile_chat.jpg` 분석을 기반으로 한 모바일 채팅 UI 디자인 시스템 가이드라인입니다.

## 1. Color Palette

### Primary Colors
- **Main Blue**: `#007AFF` (시스템 메시지, 사용자 말풍선 배경, 주요 액션 버튼)
- **Background Gray**: `#F2F2F7` (채팅 목록 배경, 앱 전체 배경)
- **Input Background**: `#FFFFFF` (입력창 배경)

### Text Colors
- **Primary Text**: `#000000` (이름, 본문 텍스트)
- **Secondary Text**: `#8E8E93` (시간, 보조 정보)
- **Placeholder Text**: `#C7C7CC` (입력창 힌트 텍스트)

### Functional Colors
- **Success**: `#34C759`
- **Warning**: `#FFCC00`
- **Error**: `#FF3B30`

## 2. Typography (System Font Stack)

- **Font Family**: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`
- **Base Size**: `16px` (본문 텍스트)
- **Small Size**: `12px` (시간, 상태 메시지)
- **Font Weight**:
  - Regular: `400`
  - Medium: `500` (사용자 이름)
  - Bold: `700` (헤더, 중요 버튼)

## 3. Component Styles

### Chat Bubbles (말풍선)
- **Common**: `padding: 10px 16px`, `border-radius: 18px`, `max-width: 75%`
- **Incoming**: Background `#E9E9EB`, Text `#000000`, `align-self: flex-start`
- **Outgoing**: Background `#007AFF`, Text `#FFFFFF`, `align-self: flex-end`

### Input Field (입력창)
- **Border Radius**: `20px`
- **Border**: `1px solid #C7C7CC`
- **Padding**: `8px 12px`
- **Shadow**: `none`

### Avatar (프로필 이미지)
- **Shape**: `Circle (border-radius: 50%)`
- **Size**: `40px x 40px`

## 4. Layout & Spacing
- **Container Padding**: `16px`
- **Bubble Margin**: `8px` (말풍선 간 간격)
- **Header Height**: `44px` (iOS standard)

## 5. CSS Implementation Example

```css
:root {
  --primary-blue: #007AFF;
  --bg-gray: #F2F2F7;
  --text-primary: #000000;
  --text-secondary: #8E8E93;
}

.chat-container {
  display: flex;
  flex-direction: column;
  background-color: var(--bg-gray);
  padding: 16px;
}

.bubble {
  max-width: 70%;
  padding: 10px 15px;
  border-radius: 20px;
  margin-bottom: 8px;
  font-size: 16px;
}

.bubble.incoming {
  background-color: #E9E9EB;
  align-self: flex-start;
}

.bubble.outgoing {
  background-color: var(--primary-blue);
  color: white;
  align-self: flex-end;
}
```# Design System for Mobile Chat UI

Based on the analysis of `imgs/mobile_chat.jpg`.

## 1. Color Palette

| Name | Hex Code | Usage |
| :--- | :--- | :--- |
| **Primary (Brand)** | `#007AFF` | Primary buttons, "My" chat bubbles, links |
| **Background** | `#F2F2F7` | App background, chat screen background |
| **Surface (Other)** | `#E9E9EB` | "Other person" chat bubbles |
| **Text Primary** | `#000000` | Main message text, headers |
| **Text Secondary**| `#8E8E93` | Timestamps, status text, placeholders |
| **White** | `#FFFFFF` | "My" message text, input field background |
| **Border/Divider** | `#C6C6C8` | Thin dividers between UI elements |

## 2. Typography

- **Font Family**: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`
- **Scale**:
  - **Header**: 17px, Semibold (Weight 600)
  - **Body (Message)**: 15px, Regular (Weight 400)
  - **Caption (Time)**: 11px, Regular (Weight 400)
  - **Button**: 16px, Semibold (Weight 600)

## 3. Spacing & Layout

- **Base Unit**: `4px`
- **Bubbles**:
  - Internal Padding: `10px 14px`
  - Margin between same user: `2px`
  - Margin between different users: `12px`
- **Screen Padding**: `16px` (Left/Right)
- **Border Radius**:
  - Message Bubbles: `18px`
  - Input Field: `20px`

## 4. Components

### 4.1 Chat Bubbles
- **Sent (Mine)**:
  - Background: `Primary`
  - Text: `White`
  - Alignment: Right
- **Received (Theirs)**:
  - Background: `Surface`
  - Text: `Text Primary`
  - Alignment: Left

### 4.2 Input Bar
- **Background**: `White` with `Border` top shadow/line.
- **Field**: Rounded rectangle, `1px solid Border`.
- **Icons**: Simple line icons (24x24px).

### 4.3 Navigation Header
- **Height**: `44px` to `56px`.
- **Elements**: Back button (Left), Profile/Title (Center), Menu (Right).

## 5. CSS Utility Variables (Example)

```css
:root {
  --color-primary: #007aff;
  --color-bg: #f2f2f7;
  --color-surface: #e9e9eb;
  --color-text-main: #000000;
  --color-text-sub: #8e8e93;
  
  --radius-bubble: 18px;
  --spacing-base: 4px;
}
```
