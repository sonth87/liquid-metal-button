'use client';
import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { LiquidButtonCore } from '../core/LiquidButtonCore.js';

export const LiquidButton = ({ 
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
  const containerRef = useRef(null);
  const coreRef = useRef(null);
  const [portalTarget, setPortalTarget] = useState(null);
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

      const onBtnClick = (e) => {
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
