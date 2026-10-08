import { LiquidButtonCore } from '../core/LiquidButtonCore.js';

/**
 * Extracts options dynamically from:
 * 1. CSS Custom Properties / Variables (--fluid-1, --fluid-2, --rim, --ripple, --btn-bg, etc.)
 * 2. Tailwind / CSS classes computed styles (height, borderRadius, backgroundColor, color, padding, etc.)
 * 3. Standard HTML element attributes (text, disabled, type, etc.)
 */
export function getStylesFromHost(el) {
  const opts = {};
  const cs = typeof window !== 'undefined' && window.getComputedStyle ? window.getComputedStyle(el) : null;

  // 1. Text & Label
  if (el.hasAttribute('text')) opts.text = el.getAttribute('text');

  // 2. CSS Variables (Highest priority for WebGL palette)
  if (cs) {
    const vFluid1 = cs.getPropertyValue('--fluid-1') || cs.getPropertyValue('--fluid-color1');
    if (vFluid1 && vFluid1.trim()) opts.fluidColor1 = vFluid1.trim();

    const vFluid2 = cs.getPropertyValue('--fluid-2') || cs.getPropertyValue('--fluid-color2');
    if (vFluid2 && vFluid2.trim()) opts.fluidColor2 = vFluid2.trim();

    const vRim = cs.getPropertyValue('--rim') || cs.getPropertyValue('--rim-color');
    if (vRim && vRim.trim()) opts.rimColor = vRim.trim();

    const vRipple = cs.getPropertyValue('--ripple') || cs.getPropertyValue('--ripple-color');
    if (vRipple && vRipple.trim()) opts.rippleColor = vRipple.trim();

    const vBtnBg = cs.getPropertyValue('--btn-bg') || cs.getPropertyValue('--bg');
    if (vBtnBg && vBtnBg.trim()) opts.btnBg = vBtnBg.trim();

    const vBorder = cs.getPropertyValue('--btn-border') || cs.getPropertyValue('--border-color') || cs.getPropertyValue('--border');
    if (vBorder && vBorder.trim()) opts.borderColor = vBorder.trim();

    const vRadius = cs.getPropertyValue('--br') || cs.getPropertyValue('--radius');
    if (vRadius && vRadius.trim()) opts.borderRadius = vRadius.trim();

    const vH = cs.getPropertyValue('--h') || cs.getPropertyValue('--height');
    if (vH && vH.trim()) opts.height = parseInt(vH.trim(), 10);

    const vPadX = cs.getPropertyValue('--padding-x') || cs.getPropertyValue('--pad-x');
    if (vPadX && vPadX.trim()) opts.paddingX = vPadX.trim();
  }

  // Fluid and Rim attributes fallback
  if (el.hasAttribute('fluid-color1')) opts.fluidColor1 = el.getAttribute('fluid-color1');
  if (el.hasAttribute('fluid-color2')) opts.fluidColor2 = el.getAttribute('fluid-color2');
  if (el.hasAttribute('rim-color')) opts.rimColor = el.getAttribute('rim-color');
  if (el.hasAttribute('ripple-color')) opts.rippleColor = el.getAttribute('ripple-color');

  // 3. Attributes, Inline Styles, and Tailwind / CSS classes
  // Height
  if (el.hasAttribute('height')) {
    opts.height = parseInt(el.getAttribute('height'), 10);
  } else if (el.style.height) {
    opts.height = parseFloat(el.style.height);
  } else if (cs) {
    const h = parseFloat(cs.height);
    if (h && h > 0 && el.className && el.className.match(/\bh-\d+/)) {
      opts.height = h;
    }
  }

  // Border Radius (e.g. rounded-xl, rounded-full)
  if (el.hasAttribute('radius')) opts.borderRadius = el.getAttribute('radius');
  else if (el.hasAttribute('border-radius')) opts.borderRadius = el.getAttribute('border-radius');
  else if (el.style.borderRadius) opts.borderRadius = el.style.borderRadius;
  else if (cs && el.className && el.className.includes('rounded')) {
    const br = cs.borderRadius;
    if (br && br !== '0px') opts.borderRadius = br;
  }

  // Text Color (e.g. text-yellow-400, text-white)
  if (el.hasAttribute('color')) opts.textColor = el.getAttribute('color');
  else if (el.hasAttribute('text-color')) opts.textColor = el.getAttribute('text-color');
  else if (el.style.color) opts.textColor = el.style.color;
  else if (cs && cs.color && cs.color !== 'rgba(0, 0, 0, 0)' && el.className && el.className.includes('text-')) {
    opts.textColor = cs.color;
  }

  // Background Color (e.g. bg-neutral-900, bg-zinc-800)
  if (el.hasAttribute('btn-bg')) opts.btnBg = el.getAttribute('btn-bg');
  else if (el.style.backgroundColor) opts.btnBg = el.style.backgroundColor;
  else if (cs && cs.backgroundColor && cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'transparent' && el.className && el.className.includes('bg-')) {
    opts.btnBg = cs.backgroundColor;
  }

  // Border Color (e.g. border-yellow-500/20)
  if (el.hasAttribute('border-color')) opts.borderColor = el.getAttribute('border-color');
  else if (el.style.borderColor) opts.borderColor = el.style.borderColor;
  else if (cs && cs.borderColor && cs.borderColor !== 'rgba(0, 0, 0, 0)' && cs.borderColor !== 'transparent' && el.className && el.className.includes('border-')) {
    opts.borderColor = cs.borderColor;
  }

  // Padding / Padding X (e.g. px-8, px-6, p-4)
  if (el.hasAttribute('padding')) opts.padding = el.getAttribute('padding');
  else if (el.style.padding) opts.padding = el.style.padding;
  else if (el.hasAttribute('padding-x')) opts.paddingX = el.getAttribute('padding-x');
  else if (cs && el.className && (el.className.includes('px-') || el.className.includes('p-'))) {
    const pl = parseFloat(cs.paddingLeft) || 0;
    const pr = parseFloat(cs.paddingRight) || 0;
    if (pl > 0 || pr > 0) {
      opts.paddingX = `${Math.max(pl, pr)}px`;
    }
  }

  // Typography (Font size, weight, gap)
  if (el.hasAttribute('font-size')) opts.fontSize = el.getAttribute('font-size');
  else if (el.style.fontSize) opts.fontSize = el.style.fontSize;
  else if (cs && el.className && el.className.match(/\btext-(xs|sm|base|lg|xl|\d+)/)) {
    opts.fontSize = cs.fontSize;
  }

  if (el.hasAttribute('font-weight')) opts.fontWeight = el.getAttribute('font-weight');
  else if (el.style.fontWeight) opts.fontWeight = el.style.fontWeight;
  else if (cs && el.className && el.className.includes('font-')) {
    opts.fontWeight = cs.fontWeight;
  }

  if (el.hasAttribute('font-family')) opts.fontFamily = el.getAttribute('font-family');
  else if (el.style.fontFamily) opts.fontFamily = el.style.fontFamily;

  if (el.hasAttribute('gap')) opts.gap = el.getAttribute('gap');
  else if (el.style.gap) opts.gap = el.style.gap;
  else if (cs && el.className && el.className.includes('gap-')) {
    opts.gap = cs.gap;
  }

  if (el.hasAttribute('width')) opts.width = el.getAttribute('width');
  else if (el.style.width) opts.width = el.style.width;

  // Disabled
  if (el.hasAttribute('disabled')) {
    opts.disabled = true;
  }

  return opts;
}

export class LiquidButtonElement extends HTMLElement {
  static get observedAttributes() {
    return [
      'class',
      'style',
      'disabled',
      'type',
      'text',
      'height',
      'radius',
      'border-radius',
      'color',
      'text-color',
      'border-color',
      'btn-bg',
      'btn-bg-hot',
      'btn-bg-press',
      'fluid-color1',
      'fluid-color2',
      'rim-color',
      'ripple-color',
      'font-family',
      'font-size',
      'font-weight',
      'gap',
      'padding',
      'padding-x',
      'width'
    ];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const options = getStylesFromHost(this);
    this.buttonCore = new LiquidButtonCore(this.shadowRoot, options);

    // Forward accessibility & state
    if (this.hasAttribute('disabled')) {
      this.buttonCore.btn.disabled = true;
    }
    if (this.hasAttribute('aria-label')) {
      this.buttonCore.btn.setAttribute('aria-label', this.getAttribute('aria-label'));
    }
    if (this.hasAttribute('title')) {
      this.buttonCore.btn.setAttribute('title', this.getAttribute('title'));
    }

    // Handle clicks, disabled state, form submission, and event bubbling
    this.buttonCore.btn.addEventListener('click', (e) => {
      if (this.hasAttribute('disabled')) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      
      this.dispatchEvent(new CustomEvent('button-click', { detail: e, bubbles: true }));

      const type = this.getAttribute('type');
      if (type === 'submit') {
        const form = this.closest('form');
        if (form && typeof form.requestSubmit === 'function') {
          form.requestSubmit();
        }
      } else if (type === 'reset') {
        const form = this.closest('form');
        if (form) form.reset();
      }
    });

    // Listen for class, style, or attribute changes dynamically
    this.mutationObserver = new MutationObserver(() => {
      if (this.buttonCore) {
        const newOptions = getStylesFromHost(this);
        this.buttonCore.updateOptions(newOptions);
        if (this.hasAttribute('disabled')) {
          this.buttonCore.btn.disabled = true;
        } else {
          this.buttonCore.btn.disabled = false;
        }
      }
    });

    this.mutationObserver.observe(this, {
      attributes: true,
      attributeFilter: [
        'class',
        'style',
        'disabled',
        'aria-label',
        'title',
        'text',
        'height',
        'radius',
        'border-radius',
        'color',
        'text-color',
        'border-color',
        'btn-bg',
        'fluid-color1',
        'fluid-color2',
        'rim-color',
        'ripple-color',
        'padding',
        'padding-x',
        'font-size',
        'font-weight',
        'gap',
        'width'
      ]
    });
  }

  disconnectedCallback() {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }
    if (this.buttonCore) {
      this.buttonCore.destroy();
      this.buttonCore = null;
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (!this.buttonCore || oldValue === newValue) return;

    if (name === 'class' || name === 'style') {
      const updates = getStylesFromHost(this);
      this.buttonCore.updateOptions(updates);
      return;
    }

    if (name === 'disabled') {
      const isDisabled = this.hasAttribute('disabled');
      this.buttonCore.btn.disabled = isDisabled;
      this.buttonCore.stage.classList.toggle('disabled', isDisabled);
      return;
    }

    const updates = {};
    if (name === 'text') updates.text = newValue;
    else if (name === 'height') updates.height = parseInt(newValue, 10) || 52;
    else if (name === 'radius' || name === 'border-radius') updates.borderRadius = newValue;
    else if (name === 'color' || name === 'text-color') updates.textColor = newValue;
    else if (name === 'border-color') updates.borderColor = newValue;
    else if (name === 'btn-bg') updates.btnBg = newValue;
    else if (name === 'btn-bg-hot') updates.btnBgHot = newValue;
    else if (name === 'btn-bg-press') updates.btnBgPress = newValue;
    else if (name === 'fluid-color1') updates.fluidColor1 = newValue;
    else if (name === 'fluid-color2') updates.fluidColor2 = newValue;
    else if (name === 'rim-color') updates.rimColor = newValue;
    else if (name === 'ripple-color') updates.rippleColor = newValue;
    else if (name === 'font-family') updates.fontFamily = newValue;
    else if (name === 'font-size') updates.fontSize = newValue;
    else if (name === 'font-weight') updates.fontWeight = newValue;
    else if (name === 'gap') updates.gap = newValue;
    else if (name === 'padding') updates.padding = newValue;
    else if (name === 'padding-x') updates.paddingX = newValue;
    else if (name === 'width') updates.width = newValue;

    this.buttonCore.updateOptions(updates);
  }
}

if (!customElements.get('liquid-button')) {
  customElements.define('liquid-button', LiquidButtonElement);
}
