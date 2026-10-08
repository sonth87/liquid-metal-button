# 📦 Standalone Bundle (Dành cho HTML tĩnh, WordPress, CDN)

Thư mục này chứa file **`liquid-button-standalone.js`** – giải pháp **1 file duy nhất (All-in-One)**.

File này đã tích hợp sẵn toàn bộ:
- Shader WebGL 2.0
- Lõi JavaScript `LiquidButtonCore`
- Web Component `<liquid-button>` với đầy đủ tính năng slotting SVG icon, Tailwind CSS, và standard HTML attributes.

Không cần `npm`, không cần `package.json`, không cần build tool!

---

## 📦 Copy vào dự án của bạn

Chỉ cần copy **1 file duy nhất**: `liquid-button-standalone.js`.

---

## 🚀 Cách sử dụng trong file HTML

```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>Trang Web Của Tôi</title>
</head>
<body style="background: #000; padding: 50px;">

  <!-- 1. Đặt nút bằng thẻ <liquid-button> -->
  <liquid-button
    height="54"
    radius="14px"
    padding-x="28px"
    color="#00ffff"
    border-color="rgba(0, 255, 255, 0.3)"
    btn-bg="#04121a"
    fluid-color1="#00f0ff"
    fluid-color2="#002b4d"
    onclick="console.log('Button clicked')"
  >
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
    <span>Đăng ký ngay</span>
  </liquid-button>

  <!-- 2. Nhúng script duy nhất trước thẻ đóng </body> -->
  <script src="./liquid-button-standalone.js"></script>

</body>
</html>
```

### Cách 2: Sử dụng qua JavaScript thuần
Khi file `liquid-button-standalone.js` được tải, nó tự động gắn `window.LiquidButtonCore` lên đối tượng toàn cục:
```javascript
const button = new window.LiquidButtonCore(document.getElementById('my-container'), {
  text: "Khởi tạo bằng JS",
  height: 52
});
```
