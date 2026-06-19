# 디자인 시스템

## 색상 팔레트

### Primary Colors
- **Primary Blue**: `#007AFF` - 메인 액션, 버튼, 링크
- **Primary Dark**: `#0056CC` - 호버 상태, 강조

### Secondary Colors
- **Secondary Green**: `#34C759` - 성공, 확인
- **Secondary Orange**: `#FF9500` - 경고, 주의

### Neutral Colors
- **Background**: `#F2F2F7` - 전체 배경
- **Surface**: `#FFFFFF` - 카드, 컨테이너
- **Text Primary**: `#000000` - 메인 텍스트
- **Text Secondary**: `#8E8E93` - 서브 텍스트, 설명
- **Border**: `#C6C6C8` - 테두리, 구분선
- **Shadow**: `#00000020` - 그림자

### Semantic Colors
- **Success**: `#34C759`
- **Warning**: `#FF9500`
- **Error**: `#FF3B30`
- **Info**: `#007AFF`

---

## 타이포그래피

### Font Family
```css
--font-primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
--font-mono: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', monospace;
```

### Font Sizes
```css
--font-size-xs: 12px;    /* 0.75rem */
--font-size-sm: 14px;    /* 0.875rem */
--font-size-md: 16px;    /* 1rem */
--font-size-lg: 18px;    /* 1.125rem */
--font-size-xl: 20px;    /* 1.25rem */
--font-size-2xl: 24px;   /* 1.5rem */
--font-size-3xl: 30px;   /* 1.875rem */
```

### Font Weights
```css
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

### Line Heights
```css
--line-height-tight: 1.25;
--line-height-normal: 1.5;
--line-height-relaxed: 1.75;
```

### Typography Scale
```css
/* Heading 1 */
--text-h1: 30px / 1.25 / 700;

/* Heading 2 */
--text-h2: 24px / 1.25 / 600;

/* Heading 3 */
--text-h3: 20px / 1.3 / 600;

/* Body Large */
--text-body-lg: 18px / 1.5 / 400;

/* Body */
--text-body: 16px / 1.5 / 400;

/* Body Small */
--text-body-sm: 14px / 1.4 / 400;

/* Caption */
--text-caption: 12px / 1.4 / 400;
```

---

## 간격 (Spacing)

### Spacing Scale
```css
--space-1: 4px;    /* 0.25rem */
--space-2: 8px;    /* 0.5rem */
--space-3: 12px;   /* 0.75rem */
--space-4: 16px;   /* 1rem */
--space-5: 20px;   /* 1.25rem */
--space-6: 24px;   /* 1.5rem */
--space-8: 32px;   /* 2rem */
--space-10: 40px;  /* 2.5rem */
--space-12: 48px;  /* 3rem */
```

### Layout Spacing
```css
--page-padding: 16px;
--card-padding: 16px;
--section-spacing: 24px;
```

---

## 테두리 (Border Radius)

```css
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-full: 9999px;
```

---

## 그림자 (Shadows)

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
```

---

## 컴포넌트 스타일

### 버튼 (Buttons)

#### Primary Button
```css
.btn-primary {
  background-color: var(--primary-blue);
  color: #FFFFFF;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: var(--primary-dark);
}
```

#### Secondary Button
```css
.btn-secondary {
  background-color: transparent;
  color: var(--primary-blue);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  border: 1px solid var(--primary-blue);
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-secondary:hover {
  background-color: rgba(0, 122, 255, 0.1);
}
```

### 카드 (Cards)

```css
.card {
  background-color: var(--surface);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border);
}

.card-header {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--space-3);
  color: var(--text-primary);
}

.card-body {
  font-size: var(--font-size-md);
  color: var(--text-secondary);
  line-height: var(--line-height-normal);
}
```

### 입력 필드 (Input Fields)

```css
.input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  font-size: var(--font-size-md);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background-color: var(--surface);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input:focus {
  outline: none;
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.2);
}

.input::placeholder {
  color: var(--text-secondary);
}
```

### 네비게이션 바 (Navigation Bar)

```css
.navbar {
  background-color: var(--surface);
  padding: var(--space-2) var(--space-4);
  box-shadow: var(--shadow-sm);
  border-bottom: 1px solid var(--border);
}

.navbar-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.navbar-item {
  font-size: var(--font-size-md);
  color: var(--text-secondary);
  padding: var(--space-2) var(--space-3);
  transition: color 0.2s;
}

.navbar-item.active {
  color: var(--primary-blue);
}
```

### 칩 (Chips)

```css
.chip {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-3);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-full);
  background-color: rgba(0, 122, 255, 0.1);
  color: var(--primary-blue);
}

.chip-success {
  background-color: rgba(52, 199, 89, 0.1);
  color: var(--success);
}

.chip-warning {
  background-color: rgba(255, 149, 0, 0.1);
  color: var(--warning);
}

.chip-error {
  background-color: rgba(255, 59, 48, 0.1);
  color: var(--error);
}
```

---

## 레이아웃 (Layout)

### Container
```css
.container {
  max-width: 480px;
  margin: 0 auto;
  padding: 0 var(--page-padding);
}
```

### Grid
```css
.grid {
  display: grid;
  gap: var(--space-4);
}

.grid-2 {
  grid-template-columns: repeat(2, 1fr);
}

.grid-3 {
  grid-template-columns: repeat(3, 1fr);
}
```

### Flex
```css
.flex {
  display: flex;
}

.flex-col {
  flex-direction: column;
}

.flex-between {
  justify-content: space-between;
  align-items: center;
}

.flex-center {
  justify-content: center;
  align-items: center;
}

.gap-2 { gap: var(--space-2); }
.gap-3 { gap: var(--space-3); }
.gap-4 { gap: var(--space-4); }
```

---

## 애니메이션 (Animations)

```css
/* Transition */
--transition-fast: 0.15s ease;
--transition-normal: 0.3s ease;
--transition-slow: 0.5s ease;

/* Keyframes */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Utility Classes */
.animate-fade-in {
  animation: fadeIn var(--transition-normal);
}

.animate-slide-up {
  animation: slideUp var(--transition-normal);
}

.animate-pulse {
  animation: pulse 2s infinite;
}
```

---

## 반응형 디자인 (Responsive)

```css
/* Breakpoints */
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;

/* Mobile First */
@media (max-width: 640px) {
  :root {
    --page-padding: 12px;
    --font-size-h1: 24px;
    --font-size-h2: 20px;
  }
}

@media (min-width: 641px) and (max-width: 1024px) {
  :root {
    --page-padding: 16px;
  }
}

@media (min-width: 1025px) {
  :root {
    --page-padding: 24px;
  }
}
```

---

## CSS 변수 전체 목록

```css
:root {
  /* Colors */
  --primary-blue: #007AFF;
  --primary-dark: #0056CC;
  --secondary-green: #34C759;
  --secondary-orange: #FF9500;
  --background: #F2F2F7;
  --surface: #FFFFFF;
  --text-primary: #000000;
  --text-secondary: #8E8E93;
  --border: #C6C6C8;
  --shadow: #00000020;
  --success: #34C759;
  --warning: #FF9500;
  --error: #FF3B30;
  --info: #007AFF;

  /* Typography */
  --font-primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  --font-mono: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', monospace;
  --font-size-xs: 12px;
  --font-size-sm: 14px;
  --font-size-md: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 20px;
  --font-size-2xl: 24px;
  --font-size-3xl: 30px;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --page-padding: 16px;
  --card-padding: 16px;
  --section-spacing: 24px;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);

  /* Animations */
  --transition-fast: 0.15s ease;
  --transition-normal: 0.3s ease;
  --transition-slow: 0.5s ease;

  /* Breakpoints */
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
}
```

---

## 사용 예제

### HTML 예제
```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>디자인 시스템 데모</title>
  <link rel="stylesheet" href="design-system.css">
</head>
<body>
  <div class="container">
    <nav class="navbar">
      <span class="navbar-title">제목</span>
    </nav>
    
    <main>
      <h1 class="text-h1">메인 제목</h1>
      
      <div class="card">
        <div class="card-header">카드 제목</div>
        <div class="card-body">
          카드 내용입니다. 디자인 시스템을 적용한 예제입니다.
        </div>
      </div>
      
      <button class="btn-primary">주요 버튼</button>
      <button class="btn-secondary">보조 버튼</button>
      
      <div class="flex gap-3">
        <span class="chip">태그 1</span>
        <span class="chip chip-success">성공</span>
        <span class="chip chip-warning">경고</span>
      </div>
      
      <input type="text" class="input" placeholder="입력하세요">
    </main>
  </div>
</body>
</html>
```

---

## 체크리스트

- [x] 색상 팔레트 정의
- [x] 타이포그래피 시스템 정의
- [x] 간격 시스템 정의
- [x] 테두리 스타일 정의
- [x] 그림자 스타일 정의
- [x] 컴포넌트 스타일 정의
- [x] 레이아웃 시스템 정의
- [x] 애니메이션 정의
- [x] 반응형 디자인 정의
- [x] CSS 변수 전체 목록 정리
- [x] 사용 예제 포함

---

*생성일: 2026-06-19*
*소스: imgs/mobile_chat.jpg 분석*