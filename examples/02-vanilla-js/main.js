import { LiquidButtonCore } from '../../src/core/LiquidButtonCore.js';

const container = document.getElementById('btn-container');

// Khởi tạo nút bấm
const button = new LiquidButtonCore(container, {
  content: `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
    <span>Nạp xu ngay</span>
  `,
  height: 54,
  borderRadius: "14px",
  paddingX: 30,
  textColor: "#ffd700",
  borderColor: "rgba(255, 215, 0, 0.35)",
  btnBg: "#161305",
  fluidColor1: "#ffaa00",
  fluidColor2: "#4a3300"
});

button.btn.addEventListener('click', () => {
  console.log('Button clicked');
});

// Điều khiển động bằng updateOptions
let isPurple = false;
document.getElementById('toggle-color').addEventListener('click', () => {
  isPurple = !isPurple;
  button.updateOptions({
    textColor: isPurple ? "#f3e8ff" : "#ffd700",
    borderColor: isPurple ? "rgba(168, 85, 247, 0.4)" : "rgba(255, 215, 0, 0.35)",
    btnBg: isPurple ? "#1b0a2a" : "#161305",
    fluidColor1: isPurple ? "#c084fc" : "#ffaa00",
    fluidColor2: isPurple ? "#3b0764" : "#4a3300"
  });
});

let isDisabled = false;
document.getElementById('toggle-disabled').addEventListener('click', () => {
  isDisabled = !isDisabled;
  button.updateOptions({ disabled: isDisabled });
});
