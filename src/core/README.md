# ⚡ Liquid Button Core (Vanilla JavaScript / WebGL2)

Thư mục này chứa module lõi **LiquidButtonCore** viết bằng Vanilla JavaScript (ES Module) và **WebGL 2.0**.

---

## 📦 Copy vào dự án của bạn

Dành cho bất kỳ dự án nào sử dụng **Vite, Webpack, Rollup, Parcel**, hoặc JavaScript ES Module:
- Bạn chỉ cần **1 file duy nhất**: `LiquidButtonCore.js`.
- **Zero dependencies:** Không cần cài bất kỳ package npm bên thứ ba nào.

---

## 🚀 Cách sử dụng

### 1. Khởi tạo cơ bản
```javascript
import { LiquidButtonCore } from './LiquidButtonCore.js';

// Lấy phần tử HTML chứa nút
const container = document.getElementById('button-container');

// Khởi tạo
const button = new LiquidButtonCore(container, {
  text: "Khám Phá Ngay",
  height: 54,
  borderRadius: "14px",
  textColor: "#ffffff",
  borderColor: "rgba(255, 255, 255, 0.2)",
  btnBg: "#0f1115",
  fluidColor1: "#ff007a",
  fluidColor2: "#4a00e0",
  rimColor: "#ffffff",
  paddingX: 28
});

// Lắng nghe sự kiện click trên phần tử button nội bộ
button.btn.addEventListener('click', (event) => {
  console.log('Button clicked!', event);
});
```

### 2. Nút chứa icon SVG qua thuộc tính `content`
```javascript
const buttonWithIcon = new LiquidButtonCore(container, {
  content: `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M5 12h14"></path>
      <path d="m12 5 7 7-7 7"></path>
    </svg>
    <span>Tiếp tục</span>
  `,
  height: 52,
  borderRadius: "999px",
  textColor: "#ffd700",
  borderColor: "rgba(255, 215, 0, 0.35)",
  btnBg: "#121008",
  fluidColor1: "#ffaa00",
  fluidColor2: "#3a2500"
});
```

### 3. Cập nhật thông số động (Dynamic Reactivity)
Bạn có thể thay đổi màu sắc, text, kích thước bất kỳ lúc nào mà không cần khởi tạo lại WebGL context:
```javascript
button.updateOptions({
  text: "Đang xử lý...",
  disabled: true,
  textColor: "#888888"
});
```

### 4. Dọn dẹp tài nguyên (Cleanup)
Khi chuyển trang trong Single Page Application (SPA), hãy gọi `destroy()` để hủy WebGL Context và tránh rò rỉ bộ nhớ:
```javascript
button.destroy();
```
