# ⚛️ Liquid Metal Button cho React & Next.js

Thư mục này chứa component **React** cho Liquid Metal Button, tương thích với cả **React 18 / 19** và **Next.js (App Router & Pages Router)**.

---

## 📦 Copy vào dự án của bạn

Khi muốn dùng trong dự án React / Next.js, bạn chỉ cần copy **2 file**:
1. `LiquidButton.jsx` (nếu dùng JavaScript) **hoặc** `LiquidButton.tsx` (nếu dùng TypeScript).
2. `LiquidButtonCore.js` (từ thư mục `../core/LiquidButtonCore.js`, bạn có thể đặt chung vào thư mục components).

> [!NOTE]
> Component hoàn toàn **không cần cài thêm bất kỳ thư viện WebGL/3D nặng nề nào** (không cần Three.js, Pixi.js, v.v.). Nó sử dụng WebGL2 thuần nên cực kỳ nhẹ và tải siêu nhanh!

---

## 🚀 Cách sử dụng

### 1. Nút cơ bản với thuộc tính `text`
```jsx
'use client'; // Nếu dùng Next.js App Router
import React from 'react';
import { LiquidButton } from './LiquidButton';

export default function MyPage() {
  const handleClick = (e) => {
    console.log('Button clicked', e);
  };

  return (
    <LiquidButton 
      text="Bắt đầu ngay"
      height={54}
      radius="12px"
      color="#00ffff"
      borderColor="rgba(0, 255, 255, 0.3)"
      btnBg="#051018"
      fluidColor1="#00f0ff"
      fluidColor2="#002b4d"
      onClick={handleClick}
    />
  );
}
```

### 2. Nút truyền icon SVG hoặc các thẻ con (`children`)
Bạn có thể truyền trực tiếp SVG icon, badge, span vào `children`:

```jsx
import { LiquidButton } from './LiquidButton';

export function SubscribeButton() {
  return (
    <LiquidButton
      height={56}
      radius="16px"
      paddingX="30px"
      color="#ffd700"
      borderColor="rgba(255, 215, 0, 0.35)"
      btnBg="#141006"
      fluidColor1="#ffaa00"
      fluidColor2="#3d2600"
      gap="10px"
      onClick={() => console.log('Subscribed!')}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>
      <span style={{ fontWeight: 600 }}>Nâng cấp Pro</span>
    </LiquidButton>
  );
}
```

### 3. Trạng thái Vô hiệu hóa (`disabled`)
```jsx
<LiquidButton 
  text="Đang xử lý..." 
  disabled={isLoading}
  height={50}
/>
```

---

## 📋 Danh sách Props chính

| Prop | Kiểu | Mặc định | Ý nghĩa |
| :--- | :--- | :--- | :--- |
| `text` | `string` | `'Sign up'` | Nội dung chữ hiển thị |
| `children` | `ReactNode` | `undefined` | Icon SVG, span hoặc component con |
| `height` | `number` | `52` | Chiều cao nút (px) |
| `radius` | `string` | `'999px'` | Bo góc (vd: `'12px'`, `'999px'`) |
| `color` | `string` | `'#ffffff'` | Màu chữ |
| `borderColor` | `string` | `rgba(255,255,255,0.15)` | Màu viền kim loại |
| `btnBg` | `string` | `'#0b0c0e'` | Màu nền nút |
| `fluidColor1` | `string` | `'#251249'` | Màu chất lỏng WebGL thứ nhất |
| `fluidColor2` | `string` | `'#070212'` | Màu chất lỏng WebGL thứ hai (gradient) |
| `rimColor` | `string` | `'#ffffff'` | Màu sáng phản quang mép viền |
| `paddingX` | `number \| string` | `undefined` | Khoảng đệm ngang (vd: `28` hoặc `'32px'`) |
| `gap` | `number \| string` | `undefined` | Khoảng cách icon và chữ |
| `disabled` | `boolean` | `false` | Khóa nút và ngắt sự kiện |
| `onClick` | `(e) => void` | `undefined` | Callback khi click nút |
