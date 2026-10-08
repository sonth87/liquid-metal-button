# ⚛️ Hướng dẫn tích hợp React / Next.js

## 1. Copy file vào dự án React của bạn:
Chỉ cần copy:
- `src/react/LiquidButton.jsx` (hoặc `LiquidButton.tsx`)
- `src/core/LiquidButtonCore.js`

## 2. Sử dụng:
Xem code mẫu tại file [App.jsx](./App.jsx).

```jsx
import { LiquidButton } from './LiquidButton';

<LiquidButton 
  height={54} 
  radius="14px"
  color="#ffd700"
  onClick={() => alert('Clicked!')}
>
  Nhấn vào tôi
</LiquidButton>
```
