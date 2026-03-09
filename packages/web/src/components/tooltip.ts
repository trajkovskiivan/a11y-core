/**
 * Accessible Tooltip Web Component.
 *
 * Shows a short descriptive text anchored to a trigger element (slot="trigger").
 * Automatically wires role="tooltip" + aria-describedby on the slotted trigger.
 *
 * Shadow DOM boundary note: aria-describedby cannot cross shadow DOM boundaries,
 * so a visually-hidden <span role="tooltip"> is appended to document.body and
 * kept in sync with the label attribute. The shadow DOM tooltip is visual only.
 *
 * @example
 * ```html
 * <compa11y-tooltip label="Save your changes">
 *   <button slot="trigger">Save</button>
 * </compa11y-tooltip>
 *
 * <compa11y-tooltip label="Format: YYYY-MM-DD" placement="bottom">
 *   <input slot="trigger" type="text" placeholder="Date" />
 * </compa11y-tooltip>
 * ```
 *
 * WCAG 2.1 SC 1.4.13 (Content on Hover or Focus):
 * - Tooltip persists while pointer is over trigger or tooltip
 * - Dismissible via Escape without moving focus
 * - Focus shows tooltip immediately (no delay)
 * - Content does not time out
 *
 * @attr {string}  label      - Tooltip text content (required)
 * @attr {string}  placement  - top|top-start|top-end|bottom|bottom-start|bottom-end|
 *                              left|left-start|left-end|right|right-start|right-end
 *                              (default: top)
 * @attr {number}  delay      - Show delay in ms on hover (default: 300)
 * @attr {number}  hide-delay - Hide delay in ms on mouse-leave (default: 0)
 * @attr {number}  offset     - Gap in px between trigger and tooltip (default: 8)
 * @attr {boolean} disabled   - Disables the tooltip entirely
 *
 * @slot trigger - The element that triggers the tooltip
 *
 * @event compa11y-tooltip-show - Fired when the tooltip becomes visible
 * @event compa11y-tooltip-hide - Fired when the tooltip is hidden
 *
 * @cssprop --compa11y-tooltip-bg        - Background (default: #1a1a1a)
 * @cssprop --compa11y-tooltip-color     - Text color (default: #fff)
 * @cssprop --compa11y-tooltip-radius    - Border radius (default: 4px)
 * @cssprop --compa11y-tooltip-padding   - Padding (default: 0.375rem 0.625rem)
 * @cssprop --compa11y-tooltip-font-size - Font size (default: 0.8125rem)
 * @cssprop --compa11y-tooltip-max-width - Max width (default: 280px)
 * @cssprop --compa11y-tooltip-shadow    - Box shadow
 */

import { Compa11yElement, defineElement } from '../utils/base-element';
import { createComponentWarnings } from '@compa11y/core';

const warn = createComponentWarnings('Tooltip');

// ─── Types ───────────────────────────────────────────────────────────────────

type Placement =
  | 'top' | 'top-start' | 'top-end'
  | 'bottom' | 'bottom-start' | 'bottom-end'
  | 'left' | 'left-start' | 'left-end'
  | 'right' | 'right-start' | 'right-end';

// ─── Position Calculation ─────────────────────────────────────────────────────

function computePosition(
  triggerRect: DOMRect,
  contentEl: HTMLElement,
  placement: Placement,
  offset: number
): { top: number; left: number } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const w = contentEl.offsetWidth;
  const h = contentEl.offsetHeight;

  const dashIdx = placement.indexOf('-');
  const side  = dashIdx === -1 ? placement : placement.slice(0, dashIdx);
  const align = dashIdx === -1 ? 'center' : placement.slice(dashIdx + 1);

  let top  = 0;
  let left = 0;

  switch (side) {
    case 'top':    top  = triggerRect.top - h - offset; break;
    case 'bottom': top  = triggerRect.bottom + offset;  break;
    case 'left':   left = triggerRect.left - w - offset; break;
    case 'right':  left = triggerRect.right + offset;   break;
  }

  if (side === 'top' || side === 'bottom') {
    switch (align) {
      case 'start':  left = triggerRect.left; break;
      case 'end':    left = triggerRect.right - w; break;
      default:       left = triggerRect.left + (triggerRect.width - w) / 2;
    }
  } else {
    switch (align) {
      case 'start':  top = triggerRect.top; break;
      case 'end':    top = triggerRect.bottom - h; break;
      default:       top = triggerRect.top + (triggerRect.height - h) / 2;
    }
  }

  // Flip if off-screen
  if (side === 'bottom' && top + h > vh && triggerRect.top - h - offset > 0)
    top = triggerRect.top - h - offset;
  else if (side === 'top' && top < 0 && triggerRect.bottom + offset + h < vh)
    top = triggerRect.bottom + offset;
  else if (side === 'right' && left + w > vw && triggerRect.left - w - offset > 0)
    left = triggerRect.left - w - offset;
  else if (side === 'left' && left < 0 && triggerRect.right + offset + w < vw)
    left = triggerRect.right + offset;

  const margin = 8;
  left = Math.max(margin, Math.min(left, vw - w - margin));
  top  = Math.max(margin, Math.min(top,  vh - h - margin));

  return { top, left };
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const TOOLTIP_STYLES = `
  :host {
    display: inline-block;
  }

  :host([hidden]) {
    display: none !important;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  /* Visual-only tooltip positioned via JS */
  .tooltip-visual {
    position: fixed;
    z-index: 9999;
    pointer-events: none;
    background: var(--compa11y-tooltip-bg, #1a1a1a);
    color: var(--compa11y-tooltip-color, #fff);
    border-radius: var(--compa11y-tooltip-radius, 4px);
    padding: var(--compa11y-tooltip-padding, 0.375rem 0.625rem);
    font-size: var(--compa11y-tooltip-font-size, 0.8125rem);
    line-height: 1.4;
    max-width: var(--compa11y-tooltip-max-width, 280px);
    box-shadow: var(--compa11y-tooltip-shadow, 0 2px 8px rgba(0, 0, 0, 0.2));
    white-space: pre-wrap;
    word-break: break-word;
    transition: opacity 0.1s ease;
    opacity: 0;
    /* Start hidden so initial positioning isn't visible */
    visibility: hidden;
  }

  .tooltip-visual[data-open] {
    opacity: 1;
    visibility: visible;
  }

  @media (prefers-reduced-motion: reduce) {
    .tooltip-visual {
      transition: none;
    }
  }

  @media (forced-colors: active) {
    .tooltip-visual {
      border: 1px solid ButtonText;
      forced-color-adjust: none;
    }
  }
`;

// ─── Component ────────────────────────────────────────────────────────────────

export class Compa11yTooltip extends Compa11yElement {
  // ── state ──
  private _label     = '';
  private _placement: Placement = 'top';
  private _delay     = 300;
  private _hideDelay = 0;
  private _offset    = 8;
  private _disabled  = false;
  private _open      = false;

  // ── DOM refs ──
  private _triggerEl: HTMLElement | null = null;
  /** Visual tooltip in shadow DOM (positioning + animation) */
  private _visualEl: HTMLElement | null = null;
  /**
   * SR-only tooltip in document.body.
   * Necessary because aria-describedby cannot cross shadow DOM boundaries.
   */
  private _srEl: HTMLElement | null = null;

  // ── timers ──
  private _showTimer: ReturnType<typeof setTimeout> | null = null;
  private _hideTimer: ReturnType<typeof setTimeout> | null = null;

  static get observedAttributes() {
    return ['label', 'placement', 'delay', 'hide-delay', 'offset', 'disabled'];
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  get open(): boolean { return this._open; }

  get disabled(): boolean { return this._disabled; }
  set disabled(v: boolean) {
    this._disabled = Boolean(v);
    this.toggleAttribute('disabled', this._disabled);
    if (this._disabled) this._hide(true);
  }

  // ─── Lifecycle ─────────────────────────────────────────────────────────────

  protected setupAccessibility(): void {
    this._label     = this.getAttribute('label') || '';
    this._placement = (this.getAttribute('placement') as Placement) || 'top';
    this._delay     = parseInt(this.getAttribute('delay') || '300', 10);
    this._hideDelay = parseInt(this.getAttribute('hide-delay') || '0', 10);
    this._offset    = parseInt(this.getAttribute('offset') || '8', 10);
    this._disabled  = this.hasAttribute('disabled');

    if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
      if (!this._label) {
        warn.warning(
          'Tooltip has no label. Provide a label attribute.',
          '<compa11y-tooltip label="Your tooltip text">...</compa11y-tooltip>'
        );
      }
    }

    // Create (or reuse) the SR-only element in document.body so
    // aria-describedby can reference it from the light DOM trigger.
    this._ensureSrEl();
  }

  protected render(): void {
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });

    this.shadowRoot!.innerHTML = `
      <style>${TOOLTIP_STYLES}</style>
      <slot name="trigger" part="trigger-slot"></slot>
      <div
        class="tooltip-visual"
        part="tooltip"
        aria-hidden="true"
      >${this._escapeHtml(this._label)}</div>
    `;

    this._visualEl = this.shadowRoot!.querySelector('.tooltip-visual');
    this._wireTrigger();
  }

  protected setupEventListeners(): void {
    const slot = this.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="trigger"]');
    slot?.addEventListener('slotchange', this._onTriggerSlotChange);
  }

  protected cleanupEventListeners(): void {
    const slot = this.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="trigger"]');
    slot?.removeEventListener('slotchange', this._onTriggerSlotChange);
    this._clearTimers();
    this._detachTriggerListeners();
    document.removeEventListener('keydown', this._onDocumentKeyDown, true);
    this._removeSrEl();
  }

  protected onAttributeChange(
    name: string,
    _old: string | null,
    next: string | null
  ): void {
    switch (name) {
      case 'label':
        this._label = next || '';
        // Sync both visual and SR elements
        if (this._visualEl) this._visualEl.textContent = this._label;
        if (this._srEl)     this._srEl.textContent = this._label;
        break;
      case 'placement':
        this._placement = (next as Placement) || 'top';
        if (this._open) this._updatePosition();
        break;
      case 'delay':
        this._delay = parseInt(next || '300', 10);
        break;
      case 'hide-delay':
        this._hideDelay = parseInt(next || '0', 10);
        break;
      case 'offset':
        this._offset = parseInt(next || '8', 10);
        if (this._open) this._updatePosition();
        break;
      case 'disabled':
        this._disabled = next !== null;
        if (this._disabled) this._hide(true);
        break;
    }
  }

  // ─── SR Element (body-level, light DOM) ────────────────────────────────────

  private _ensureSrEl(): void {
    const srId = `${this._id}-sr`;

    // Reuse if already created (e.g. re-connection)
    let el = document.getElementById(srId) as HTMLElement | null;
    if (!el) {
      el = document.createElement('span');
      el.id = srId;
      el.setAttribute('role', 'tooltip');
      // Visually hidden
      el.style.cssText = [
        'position:absolute',
        'width:1px',
        'height:1px',
        'padding:0',
        'margin:-1px',
        'overflow:hidden',
        'clip:rect(0,0,0,0)',
        'white-space:nowrap',
        'border:0',
      ].join(';');
      document.body.appendChild(el);
    }

    el.textContent = this._label;
    this._srEl = el;
  }

  private _removeSrEl(): void {
    this._srEl?.remove();
    this._srEl = null;
  }

  // ─── Trigger Wiring ────────────────────────────────────────────────────────

  private _wireTrigger(): void {
    const slot = this.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="trigger"]');
    if (!slot) return;

    const assigned = slot.assignedElements({ flatten: true });
    const el = (assigned[0] as HTMLElement) || null;

    if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production' && !el) {
      warn.warning(
        'Tooltip has no trigger. Add an element to the "trigger" slot.',
        '<compa11y-tooltip label="..."><button slot="trigger">Click me</button></compa11y-tooltip>'
      );
    }

    this._detachTriggerListeners();
    this._triggerEl = el;
    if (!el || !this._srEl) return;

    // aria-describedby points to the body-level SR span — works across shadow DOM
    el.setAttribute('aria-describedby', this._srEl.id);

    el.addEventListener('mouseenter', this._onMouseEnter);
    el.addEventListener('mouseleave', this._onMouseLeave);
    el.addEventListener('focus',      this._onFocus);
    el.addEventListener('blur',       this._onBlur);
  }

  private _detachTriggerListeners(): void {
    if (!this._triggerEl) return;
    this._triggerEl.removeAttribute('aria-describedby');
    this._triggerEl.removeEventListener('mouseenter', this._onMouseEnter);
    this._triggerEl.removeEventListener('mouseleave', this._onMouseLeave);
    this._triggerEl.removeEventListener('focus',      this._onFocus);
    this._triggerEl.removeEventListener('blur',       this._onBlur);
  }

  private _onTriggerSlotChange = (): void => this._wireTrigger();

  // ─── Show / Hide ───────────────────────────────────────────────────────────

  private _clearTimers(): void {
    if (this._showTimer) { clearTimeout(this._showTimer); this._showTimer = null; }
    if (this._hideTimer) { clearTimeout(this._hideTimer); this._hideTimer = null; }
  }

  private _show(immediate = false): void {
    if (this._disabled) return;
    this._clearTimers();
    this._showTimer = setTimeout(() => {
      this._open = true;
      this._updatePosition();
      requestAnimationFrame(() => {
        this._visualEl?.setAttribute('data-open', '');
      });
      document.addEventListener('keydown', this._onDocumentKeyDown, true);
      this.emit('compa11y-tooltip-show', { label: this.getAttribute('label') || '', placement: this.getAttribute('placement') || 'top' });
    }, immediate ? 0 : this._delay);
  }

  private _hide(immediate = false): void {
    this._clearTimers();
    this._hideTimer = setTimeout(() => {
      this._open = false;
      this._visualEl?.removeAttribute('data-open');
      document.removeEventListener('keydown', this._onDocumentKeyDown, true);
      this.emit('compa11y-tooltip-hide', { label: this.getAttribute('label') || '', placement: this.getAttribute('placement') || 'top' });
    }, immediate ? 0 : this._hideDelay);
  }

  // ─── Positioning ───────────────────────────────────────────────────────────

  private _updatePosition(): void {
    const triggerEl = this._triggerEl;
    const visualEl  = this._visualEl;
    if (!triggerEl || !visualEl) return;

    const { top, left } = computePosition(
      triggerEl.getBoundingClientRect(),
      visualEl,
      this._placement,
      this._offset
    );

    visualEl.style.top  = `${top}px`;
    visualEl.style.left = `${left}px`;
  }

  // ─── Event Handlers ────────────────────────────────────────────────────────

  private _onMouseEnter = (): void => this._show();
  private _onMouseLeave = (): void => this._hide();
  // WCAG 2.1 SC 1.4.13: focus shows immediately, no delay
  private _onFocus = (): void => this._show(true);
  private _onBlur  = (): void => this._hide(true);

  private _onDocumentKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      this._clearTimers();
      this._hide(true);
    }
  };

  // ─── Utilities ─────────────────────────────────────────────────────────────

  private _escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}

defineElement('compa11y-tooltip', Compa11yTooltip);
