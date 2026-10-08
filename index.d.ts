import * as React from 'react';

/**
 * Options to configure the Liquid Metal Button.
 */
export interface LiquidButtonOptions {
  /**
   * Text label displayed on the button.
   * @default 'Sign up'
   */
  text?: string;

  /**
   * Custom HTML or Node content (e.g. '<span><svg ...></span> Text' or DOM Node).
   */
  content?: string | Node | Node[];

  /**
   * Height of the button in pixels. The width scales proportionally or fits content.
   * @default 52
   */
  height?: number;

  /**
   * CSS border radius. Can be '999px' (pill), '16px', '8px', '0px' (sharp), etc.
   * Both GLSL WebGL shaders and DOM boundaries will adapt seamlessly.
   * @default '999px'
   */
  borderRadius?: string;

  /**
   * Text color in hex or CSS string.
   * @default '#ffffff'
   */
  textColor?: string;

  /**
   * Font family for the button label text.
   * @default 'inherit'
   */
  fontFamily?: string;

  /**
   * Font size in pixels or CSS string (e.g. 16, '15px', '1rem').
   */
  fontSize?: string | number;

  /**
   * Font weight (e.g. 500, '600', 'bold').
   */
  fontWeight?: string | number;

  /**
   * Spacing between icon and text in pixels or CSS string (e.g. 8, '10px').
   */
  gap?: string | number;

  /**
   * Outer border / rim stroke color.
   * @default 'rgba(255, 255, 255, 0.15)'
   */
  borderColor?: string;

  /**
   * Resting background color of the button plate.
   * @default '#0b0c0e'
   */
  btnBg?: string;

  /**
   * Hover state background color of the button plate.
   * @default '#08090a'
   */
  btnBgHot?: string;

  /**
   * Active / pressed state background color of the button plate.
   * @default '#070809'
   */
  btnBgPress?: string;

  /**
   * Primary iridescent fluid color for WebGL shader.
   * @default '#251249'
   */
  fluidColor1?: string;

  /**
   * Secondary iridescent fluid color for WebGL shader.
   * @default '#070212'
   */
  fluidColor2?: string;

  /**
   * Specular rim highlight color around button edge.
   * @default '#ffffff'
   */
  rimColor?: string;

  /**
   * WebGL pointer ripple wave reaction color.
   * @default '#ffffff'
   */
  rippleColor?: string;

  /**
   * Custom CSS padding string (e.g. '0 32px' or '12px 24px').
   */
  padding?: string;

  /**
   * Horizontal padding inside the button in pixels or CSS string (e.g. 24, 32, '28px').
   */
  paddingX?: string | number;

  /**
   * Explicit width override in pixels or CSS string (e.g. 220, '250px', '100%').
   */
  width?: string | number;

  /**
   * When true, generates a `<slot>` inside the button label for Web Components.
   */
  useSlot?: boolean;

  /**
   * Box shadow multiplier.
   * @default 0.0
   */
  shadowMultiplier?: number;
}

/**
 * Core WebGL & DOM Controller for Liquid Metal Button.
 */
export class LiquidButtonCore {
  /** The container element or ShadowRoot where the button is mounted. */
  container: HTMLElement | ShadowRoot;

  /** Current active options. */
  options: LiquidButtonOptions;

  /** The root wrapper element `.liquid-button-wrapper`. */
  stage: HTMLDivElement;

  /** The background plate element `.liquid-button-plate`. */
  plate: HTMLDivElement;

  /** The WebGL2 canvas element `.liquid-button-canvas`. */
  cv: HTMLCanvasElement;

  /** The interactive HTML button element `.liquid-button-btn`. */
  btn: HTMLButtonElement;

  /** The text label span element `.liquid-button-label`. */
  label: HTMLSpanElement;

  /** Active WebGL2 rendering context. */
  gl: WebGL2RenderingContext | null;

  /**
   * Initializes a new Liquid Metal Button instance.
   * @param container DOM element or ShadowRoot to attach to.
   * @param options Configuration options.
   */
  constructor(container: HTMLElement | ShadowRoot, options?: LiquidButtonOptions);

  /**
   * Updates button label text or rich DOM content.
   */
  setContent(content: string | Node | Node[]): void;

  /**
   * Updates one or more button options dynamically without re-mounting.
   * @param newOptions Partial options to update.
   */
  updateOptions(newOptions: Partial<LiquidButtonOptions>): void;

  /**
   * Destroys WebGL animation loops, observers, and removes the button DOM elements.
   */
  destroy(): void;
}

/**
 * Custom Web Component `<liquid-button>` for standalone or framework usage.
 */
export class LiquidButtonElement extends HTMLElement {
  buttonCore: LiquidButtonCore | null;
}

/**
 * React Component Props for `<LiquidButton />`.
 */
export interface LiquidButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Text label displayed on the button. */
  text?: string;
  /** Custom children (SVG icons, badges, spans, custom React elements). */
  children?: React.ReactNode;
  /** Height in pixels. Default is 52. */
  height?: number;
  /** Border radius in CSS format (e.g. '999px', '16px', '0px'). Default is '999px'. */
  radius?: string;
  /** Text color in CSS/hex format. Default is '#ffffff'. */
  color?: string;
  /** Border / rim stroke color. Default is 'rgba(255, 255, 255, 0.15)'. */
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
  /** Rim highlight reflection color. Default is '#ffffff'. */
  rimColor?: string;
  /** WebGL fluid ripple effect color. Default is '#ffffff'. */
  rippleColor?: string;
  /** CSS font-family for the label. Default is 'inherit'. */
  fontFamily?: string;
  /** Font size in pixels or CSS string (e.g. 16, '15px', '1rem'). */
  fontSize?: string | number;
  /** Font weight (e.g. 500, '600', 'bold'). */
  fontWeight?: string | number;
  /** Spacing between icon and text in pixels or CSS string (e.g. 8, '10px'). */
  gap?: string | number;
  /** Custom CSS padding string (e.g. '0 32px' or '12px 24px'). */
  padding?: string;
  /** Horizontal padding inside the button in pixels or CSS string (e.g. 24, 32, '28px'). */
  paddingX?: string | number;
  /** Explicit width override (e.g. 200, '250px', '100%'). */
  width?: string | number;
  /** Click event listener triggered on the inner button. */
  onClick?: (event: MouseEvent) => void;
  /** Custom CSS classes. */
  className?: string;
  /** Custom inline styles for the outer container. */
  style?: React.CSSProperties;
}

/**
 * Liquid Metal Button as a React Component.
 */
export const LiquidButton: React.FC<LiquidButtonProps>;

export default LiquidButton;

declare global {
  interface Window {
    LiquidButtonCore: typeof LiquidButtonCore;
  }

  interface HTMLElementTagNameMap {
    'liquid-button': LiquidButtonElement;
  }

  namespace JSX {
    interface IntrinsicElements {
      'liquid-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        text?: string;
        height?: string | number;
        radius?: string;
        color?: string;
        'border-radius'?: string;
        'text-color'?: string;
        'border-color'?: string;
        'btn-bg'?: string;
        'btn-bg-hot'?: string;
        'btn-bg-press'?: string;
        'fluid-color1'?: string;
        'fluid-color2'?: string;
        'rim-color'?: string;
        'ripple-color'?: string;
        'font-family'?: string;
        'font-size'?: string | number;
        'font-weight'?: string | number;
        gap?: string | number;
        padding?: string;
        'padding-x'?: string | number;
        width?: string | number;
      };
    }
  }
}
