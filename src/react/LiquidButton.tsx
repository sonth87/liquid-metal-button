'use client';
import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { LiquidButtonCore } from '../core/LiquidButtonCore.js';

export interface LiquidButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Text label displayed on the button. Defaults to 'Sign up'. */
  text?: string;
  /** Custom children (e.g. SVG icons, span tags, custom React elements). */
  children?: React.ReactNode;
  /** Height in pixels. Width scales automatically or with padding. Default is 52. */
  height?: number;
  /** Border radius in CSS format (e.g. '999px', '16px', '0px'). Default is '999px'. */
  radius?: string;
  /** Button text color in CSS/hex format. Default is '#ffffff'. */
  color?: string;
  /** Button border / rim color. Default is 'rgba(255, 255, 255, 0.15)'. */
  borderColor?: string;
  /** Resting background color. Default is '#0b0c0e'. */
  btnBg?: string;
  /** Hover background color. Default is '#08090a'. */
  btnBgHot?: string;
  /** Active / press background color. Default is '#070809'. */
  btnBgPress?: string;
  /** Primary iridescent fluid color. Default is '#251249'. */
  fluidColor1?: string;
  /** Secondary iridescent fluid color. Default is '#070212'. */
  fluidColor2?: string;
  /** WebGL rim highlight reflection color. Default is '#ffffff'. */
  rimColor?: string;
  /** WebGL fluid ripple effect color. Default is '#ffffff'. */
  rippleColor?: string;
  /** CSS font-family for the label. Default is 'inherit'. */
  fontFamily?: string;
  /** Font size in pixels or CSS string (e.g. 16, '1rem', '15px'). */
  fontSize?: string | number;
  /** Font weight (e.g. 500, '600', 'bold'). */
  fontWeight?: string | number;
  /** Gap between icon and text in pixels or CSS string (e.g. 8, '10px'). */
  gap?: string | number;
  /** Custom CSS padding (e.g. '0 32px' or '12px 24px'). */
  padding?: string;
  /** Horizontal padding inside the button in pixels or CSS string (e.g. 24, 32, '28px'). */
  paddingX?: string | number;
  /** Explicit width override (e.g. 200, '250px', '100%'). Defaults to content width with padding. */
  width?: string | number;
  /** Click event listener triggered when the inner button is clicked. */
  onClick?: (event: MouseEvent) => void;
  /** Additional CSS class names. */
  className?: string;
  /** Custom inline styles for the outer container. */
  style?: React.CSSProperties;
}

export const LiquidButton: React.FC<LiquidButtonProps> = ({ 
  text, 
  children,
  height = 52, 
  radius = '999px', 
  color = '#ffffff', 
  borderColor,
  btnBg,
  btnBgHot,
  btnBgPress,
  fluidColor1,
  fluidColor2,
  rimColor,
  rippleColor,
  fontFamily,
  fontSize,
  fontWeight,
  gap,
  padding,
  paddingX,
  width,
  onClick, 
  style,
  className,
  ...props 
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const coreRef = useRef<LiquidButtonCore | null>(null);
  const [portalTarget, setPortalTarget] = useState<HTMLSpanElement | null>(null);
  const clickHandlerRef = useRef(onClick);
  clickHandlerRef.current = onClick;

  const isComplexChildren = children !== undefined && typeof children !== 'string';
  const displayText = text !== undefined 
    ? text 
    : (typeof children === 'string' ? children : (isComplexChildren ? '' : 'Sign up'));

  useEffect(() => {
    if (containerRef.current && !coreRef.current) {
      coreRef.current = new LiquidButtonCore(containerRef.current, {
        text: displayText,
        height,
        borderRadius: radius,
        textColor: color,
        ...(borderColor !== undefined && { borderColor }),
        ...(btnBg !== undefined && { btnBg }),
        ...(btnBgHot !== undefined && { btnBgHot }),
        ...(btnBgPress !== undefined && { btnBgPress }),
        ...(fluidColor1 !== undefined && { fluidColor1 }),
        ...(fluidColor2 !== undefined && { fluidColor2 }),
        ...(rimColor !== undefined && { rimColor }),
        ...(rippleColor !== undefined && { rippleColor }),
        ...(fontFamily !== undefined && { fontFamily }),
        ...(fontSize !== undefined && { fontSize }),
        ...(fontWeight !== undefined && { fontWeight }),
        ...(gap !== undefined && { gap }),
        ...(padding !== undefined && { padding }),
        ...(paddingX !== undefined && { paddingX }),
        ...(width !== undefined && { width })
      });
      
      setPortalTarget(coreRef.current.label);

      const onBtnClick = (e: MouseEvent) => {
        if (clickHandlerRef.current) {
          clickHandlerRef.current(e);
        }
      };
      
      coreRef.current.btn.addEventListener('click', onBtnClick);
      
      return () => {
        if (coreRef.current) {
          coreRef.current.btn.removeEventListener('click', onBtnClick);
          coreRef.current.destroy();
          coreRef.current = null;
        }
      };
    }
  }, []);

  useEffect(() => {
    if (coreRef.current) {
      coreRef.current.updateOptions({
        text: displayText,
        height,
        borderRadius: radius,
        textColor: color,
        ...(borderColor !== undefined && { borderColor }),
        ...(btnBg !== undefined && { btnBg }),
        ...(btnBgHot !== undefined && { btnBgHot }),
        ...(btnBgPress !== undefined && { btnBgPress }),
        ...(fluidColor1 !== undefined && { fluidColor1 }),
        ...(fluidColor2 !== undefined && { fluidColor2 }),
        ...(rimColor !== undefined && { rimColor }),
        ...(rippleColor !== undefined && { rippleColor }),
        ...(fontFamily !== undefined && { fontFamily }),
        ...(fontSize !== undefined && { fontSize }),
        ...(fontWeight !== undefined && { fontWeight }),
        ...(gap !== undefined && { gap }),
        ...(padding !== undefined && { padding }),
        ...(paddingX !== undefined && { paddingX }),
        ...(width !== undefined && { width })
      });
    }
  }, [
    displayText,
    height,
    radius,
    color,
    borderColor,
    btnBg,
    btnBgHot,
    btnBgPress,
    fluidColor1,
    fluidColor2,
    rimColor,
    rippleColor,
    fontFamily,
    fontSize,
    fontWeight,
    gap,
    padding,
    paddingX,
    width
  ]);

  return (
    <div 
      ref={containerRef} 
      style={{ display: 'inline-block', verticalAlign: 'middle', ...style }} 
      className={className} 
      {...props} 
    >
      {isComplexChildren && portalTarget ? ReactDOM.createPortal(children, portalTarget) : null}
    </div>
  );
};

export default LiquidButton;
