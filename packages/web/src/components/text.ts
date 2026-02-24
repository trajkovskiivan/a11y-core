/**
 * Accessible Text and Heading components.
 *
 * Typography primitives that render semantic HTML elements with
 * consistent styling and accessibility features.
 *
 * @example
 * ```html
 * <!-- Heading (renders <h1>–<h6>) -->
 * <a11y-heading level="1">Page Title</a11y-heading>
 * <a11y-heading level="2">Section Title</a11y-heading>
 *
 * <!-- Text (renders <p> by default) -->
 * <a11y-text>Body text paragraph.</a11y-text>
 * <a11y-text size="sm" color="muted">Small muted text.</a11y-text>
 * <a11y-text as="span">Inline text.</a11y-text>
 * ```
 *
 * @attr {string} level - Heading level: '1' | '2' | '3' | '4' | '5' | '6' (a11y-heading only)
 * @attr {string} size - Text size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
 * @attr {string} color - Text color: 'default' | 'muted' | 'accent' | 'error' | 'success' | 'warning'
 * @attr {string} weight - Font weight: 'normal' | 'medium' | 'semibold' | 'bold'
 * @attr {string} align - Text alignment: 'left' | 'center' | 'right'
 * @attr {boolean} truncate - Truncate with ellipsis on overflow
 * @attr {string} as - HTML element for a11y-text: 'p' | 'span' | 'div' | 'label' (default: 'p')
 *
 * @cssprop --compa11y-text-color - Default text color
 * @cssprop --compa11y-text-color-muted - Muted text color
 * @cssprop --compa11y-text-color-accent - Accent text color
 * @cssprop --compa11y-text-color-error - Error text color
 * @cssprop --compa11y-text-color-success - Success text color
 * @cssprop --compa11y-text-color-warning - Warning text color
 * @cssprop --compa11y-text-font-family - Font family
 * @cssprop --compa11y-heading-font-family - Heading font family
 * @cssprop --compa11y-focus-color - Focus outline color
 */

import { Compa11yElement, defineElement } from '../utils/base-element';

const SHARED_STYLES = `
  :host {
    display: block;
  }

  :host([hidden]) {
    display: none !important;
  }

  :host([as="span"]) {
    display: inline;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  /* Size scale */
  .size-xs  { font-size: var(--compa11y-text-size-xs, 0.75rem); line-height: 1.5; }
  .size-sm  { font-size: var(--compa11y-text-size-sm, 0.875rem); line-height: 1.5; }
  .size-md  { font-size: var(--compa11y-text-size-md, 1rem); line-height: 1.5; }
  .size-lg  { font-size: var(--compa11y-text-size-lg, 1.125rem); line-height: 1.5; }
  .size-xl  { font-size: var(--compa11y-text-size-xl, 1.25rem); line-height: 1.4; }
  .size-2xl { font-size: var(--compa11y-text-size-2xl, 1.5rem); line-height: 1.3; }
  .size-3xl { font-size: var(--compa11y-text-size-3xl, 1.875rem); line-height: 1.25; }

  /* Color variants */
  .color-default { color: var(--compa11y-text-color, inherit); }
  .color-muted   { color: var(--compa11y-text-color-muted, #666); }
  .color-accent  { color: var(--compa11y-text-color-accent, #0066cc); }
  .color-error   { color: var(--compa11y-text-color-error, #dc2626); }
  .color-success { color: var(--compa11y-text-color-success, #16a34a); }
  .color-warning { color: var(--compa11y-text-color-warning, #d97706); }

  /* Weight */
  .weight-normal  { font-weight: 400; }
  .weight-medium  { font-weight: 500; }
  .weight-semibold { font-weight: 600; }
  .weight-bold    { font-weight: 700; }

  /* Alignment */
  .align-left   { text-align: left; }
  .align-center { text-align: center; }
  .align-right  { text-align: right; }

  /* Truncation */
  .truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Forced colors */
  @media (forced-colors: active) {
    .color-muted,
    .color-accent,
    .color-error,
    .color-success,
    .color-warning {
      color: CanvasText;
    }
  }
`;

const HEADING_STYLES = `
  ${SHARED_STYLES}

  h1, h2, h3, h4, h5, h6 {
    margin: 0;
    font-family: var(--compa11y-heading-font-family, inherit);
  }

  /* Default heading sizes (when no size attr) */
  h1 { font-size: var(--compa11y-heading-1-size, 2.25rem); line-height: 1.2; font-weight: 700; }
  h2 { font-size: var(--compa11y-heading-2-size, 1.875rem); line-height: 1.25; font-weight: 700; }
  h3 { font-size: var(--compa11y-heading-3-size, 1.5rem); line-height: 1.3; font-weight: 600; }
  h4 { font-size: var(--compa11y-heading-4-size, 1.25rem); line-height: 1.35; font-weight: 600; }
  h5 { font-size: var(--compa11y-heading-5-size, 1.125rem); line-height: 1.4; font-weight: 600; }
  h6 { font-size: var(--compa11y-heading-6-size, 1rem); line-height: 1.5; font-weight: 600; }
`;

const TEXT_STYLES = `
  ${SHARED_STYLES}

  p, span, div, label {
    margin: 0;
    font-family: var(--compa11y-text-font-family, inherit);
  }
`;

function buildClasses(el: HTMLElement, defaultSize?: string): string {
  const classes: string[] = [];
  const size = el.getAttribute('size');
  const color = el.getAttribute('color') || 'default';
  const weight = el.getAttribute('weight');
  const align = el.getAttribute('align');
  const truncate = el.hasAttribute('truncate');

  if (size) classes.push(`size-${size}`);
  else if (defaultSize) classes.push(`size-${defaultSize}`);
  classes.push(`color-${color}`);
  if (weight) classes.push(`weight-${weight}`);
  if (align) classes.push(`align-${align}`);
  if (truncate) classes.push('truncate');

  return classes.join(' ');
}

// ============================================================================
// Heading
// ============================================================================

export class A11yHeading extends Compa11yElement {
  static get observedAttributes() {
    return ['level', 'size', 'color', 'weight', 'align', 'truncate'];
  }

  private get headingLevel(): number {
    const level = parseInt(this.getAttribute('level') || '2', 10);
    return level >= 1 && level <= 6 ? level : 2;
  }

  protected setupAccessibility(): void {
    // Semantic heading element handles accessibility
  }

  protected render(): void {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }

    const tag = `h${this.headingLevel}`;
    const classes = buildClasses(this);
    // Only apply size class if explicitly set (otherwise use default h1-h6 sizes)
    const sizeClass = this.getAttribute('size') ? `size-${this.getAttribute('size')}` : '';
    const finalClasses = sizeClass
      ? classes
      : classes; // size won't be in classes if not set

    this.shadowRoot!.innerHTML = `
      <style>${HEADING_STYLES}</style>
      <${tag} class="${finalClasses}" part="heading">
        <slot></slot>
      </${tag}>
    `;
  }

  protected onAttributeChange(): void {
    this.render();
  }
}

// ============================================================================
// Text
// ============================================================================

export class A11yText extends Compa11yElement {
  static get observedAttributes() {
    return ['as', 'size', 'color', 'weight', 'align', 'truncate'];
  }

  private get tagName_(): string {
    const as = this.getAttribute('as');
    const valid = ['p', 'span', 'div', 'label'];
    return as && valid.includes(as) ? as : 'p';
  }

  protected setupAccessibility(): void {
    // Semantic text element handles accessibility
  }

  protected render(): void {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }

    const tag = this.tagName_;
    const classes = buildClasses(this, 'md');

    this.shadowRoot!.innerHTML = `
      <style>${TEXT_STYLES}</style>
      <${tag} class="${classes}" part="text">
        <slot></slot>
      </${tag}>
    `;
  }

  protected onAttributeChange(): void {
    this.render();
  }
}

defineElement('a11y-heading', A11yHeading);
defineElement('a11y-text', A11yText);
