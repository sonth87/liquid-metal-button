import React, { useState } from 'react';
import { LiquidButton } from '../../src/react/LiquidButton';

export default function App() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleCheckout = () => {
    setLoading(true);
    setTimeout(() => {
      setCount((prev) => prev + 1);
      setLoading(false);
      console.log('Checkout completed');
    }, 1200);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#07080b',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif',
      gap: 24
    }}>
      <h2>Ví dụ React / Next.js Component</h2>
      <p style={{ color: '#888' }}>Số lần đã nhấn: {count}</p>

      {/* Nút chính có Icon SVG và trạng thái loading */}
      <LiquidButton
        height={56}
        radius="16px"
        paddingX="32px"
        color="#00ffcc"
        borderColor="rgba(0, 255, 204, 0.35)"
        btnBg="#031514"
        fluidColor1="#00f5d4"
        fluidColor2="#013a36"
        gap="10px"
        disabled={loading}
        onClick={handleCheckout}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        <span style={{ fontWeight: 600 }}>
          {loading ? 'Đang thanh toán...' : 'Thanh toán ngay ($49)'}
        </span>
      </LiquidButton>
    </div>
  );
}
