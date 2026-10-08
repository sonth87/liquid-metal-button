# 🌐 Liquid Button Web Component & Tailwind CSS

Thư mục này chứa custom element `<liquid-button>` sử dụng chuẩn **W3C Web Components (Shadow DOM)**.

Tương thích tự nhiên với mọi framework frontend: **Vue.js, Svelte, Angular, Astro, SolidJS, HTML thuần**, và hỗ trợ tạo kiểu trực tiếp bằng **Tailwind CSS**.

---

## 📦 Copy vào dự án của bạn

Chỉ cần copy **2 file**:
1. `LiquidButtonElement.js`
2. `LiquidButtonCore.js` (từ thư mục `../core/LiquidButtonCore.js`).

Sau đó chỉ cần import file element 1 lần duy nhất tại file entry của bạn (ví dụ `main.js` hoặc `App.vue`):
```javascript
import './path/to/LiquidButtonElement.js';
```

---

## 🎨 Tạo kiểu trực tiếp bằng Tailwind CSS / Class & Inline Style

Không cần khai báo hàng chục attribute rườm rà, bạn có thể áp dụng các class Tailwind CSS và biến CSS trực tiếp lên thẻ `<liquid-button>`:

```html
<liquid-button
  class="h-14 px-8 rounded-xl bg-neutral-900 border border-yellow-500/30 text-yellow-400 font-semibold text-sm gap-2.5"
  style="--fluid-1: #ffaa00; --fluid-2: #3a2500; --rim: #ffd700;"
  onclick="console.log('Button clicked')"
  data-tracking="hero-cta"
  aria-label="Đăng ký tài khoản"
>
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
  <span>Bắt đầu ngay</span>
</liquid-button>
```

### Các lớp Tailwind tự động được ánh xạ vào WebGL Canvas:
- **Chiều cao:** `h-12`, `h-14`, `h-16`,...
- **Bo góc:** `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-full`,...
- **Padding:** `px-6`, `px-8`, `p-4`,...
- **Màu chữ & Cỡ chữ:** `text-yellow-400`, `text-white`, `text-sm`, `font-semibold`,...
- **Màu nền:** `bg-neutral-900`, `bg-zinc-800`,...
- **Màu viền:** `border-yellow-500/30`, `border-white/20`,...
- **Khoảng cách icon và chữ:** `gap-2`, `gap-3`,...

---

## 🏷️ Hỗ trợ toàn bộ thuộc tính chuẩn HTML

- **`onclick="..."`**: Tự động bắt sự kiện click chuẩn của trình duyệt.
- **`disabled`**: Thêm thuộc tính `disabled`, nút sẽ tự động giảm opacity 55%, chuyển grayscale nhẹ và chặn mọi thao tác click.
- **`type="submit"`**: Khi nằm trong `<form>`, click nút sẽ kích hoạt submit form chuẩn HTML5.
- **`data-*`**: Thoải mái gán `data-id="101"`, `data-track="lead"` và truy xuất qua `element.dataset`.
