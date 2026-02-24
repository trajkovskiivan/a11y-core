/**
 * Accessible Popover Web Component.
 *
 * A non-modal, anchored overlay — distinct from Dialog:
 * - No focus trap (focus moves in, Tab is unrestricted)
 * - No scroll lock
 * - Positioned relative to the trigger element
 * - Dismissable via Escape or pointer outside
 *
 * @example
 * ```html
 * <!-- Basic -->
 * <a11y-popover>
 *   <button slot="trigger">More info</button>
 *   <p>Popover content. Escape or click outside to close.</p>
 * </a11y-popover>
 *
 * <!-- Custom role + label -->
 * <a11y-popover content-role="region" content-label="Filter options" placement="bottom-start">
 *   <button slot="trigger">Filters</button>
 *   <form>...</form>
 * </a11y-popover>
 *
 * <!-- Informational (no autofocus) -->
 * <a11y-popover focus-policy="none">
 *   <button slot="trigger">?</button>
 *   <p>This field accepts ISO-8601 dates.</p>
 * </a11y-popover>
 * ```
 *
 * @attr {boolean}  open          - Whether the popover is currently visible
 * @attr {string}   placement     - Preferred side: top|top-start|top-end|bottom|bottom-start|bottom-end|left|left-start|left-end|right|right-start|right-end (default: bottom)
 * @attr {number}   offset        - Gap in px between trigger and popover (default: 8)
 * @attr {boolean}  disabled      - Prevents the popover from opening
 * @attr {string}   haspopup      - aria-haspopup value on trigger: dialog|menu|listbox|tree|grid|true|false (default: dialog)
 * @attr {string}   content-role  - role attribute applied to the content container (default: dialog)
 * @attr {string}   content-label - aria-label applied to the content container
 * @attr {string}   focus-policy  - Focus behaviour on open: first|container|none (default: first)
 *
 * @slot trigger      - The element that toggles the popover
 * @slot (default)    - The popover content
 *
 * @event a11y-popover-open  - Fired when the popover opens
 * @event a11y-popover-close - Fired when the popover closes
 *
 * @cssprop --compa11y-popover-bg        - Background color (default: #fff)
 * @cssprop --compa11y-popover-color     - Text color (default: inherit)
 * @cssprop --compa11y-popover-border    - Border (default: 1px solid rgba(0,0,0,.15))
 * @cssprop --compa11y-popover-radius    - Border radius (default: 0.375rem)
 * @cssprop --compa11y-popover-shadow    - Box shadow
 * @cssprop --compa11y-popover-padding   - Content padding (default: 1rem)
 * @cssprop --compa11y-popover-max-width - Max content width (default: 320px)
 * @cssprop --compa11y-popover-z-index   - Z-index (default: 1000)
 * @cssprop --compa11y-focus-color       - Focus outline color
 */

import { Compa11yElement, defineElement } from '../utils/base-element';
import { FOCUS_VISIBLE_STYLES } from '../utils/styles';
import { createComponentWarnings } from '@compa11y/core';

const warn = createComponentWarnings('Popover');

// ─── Types ───────────────────────────────────────────────────────────────────

type Placement =
  | 'top' | 'top-start' | 'top-end'
  | 'bottom' | 'bottom-start' | 'bottom-end'
  | 'left' | 'left-start' | 'left-end'
  | 'right' | 'right-start' | 'right-end';

/** 'first' — first focusable child, 'container' — content div, 'none' — no autofocus */
type FocusPolicy = 'first' | 'container' | 'none';

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
  const side = dashIdx === -1 ? placement : placement.slice(0, dashIdx);
  const align = dashIdx === -1 ? 'center' : placement.slice(dashIdx + 1);

  let top = 0;
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

// ─── Focusable Selector ───────────────────────────────────────────────────────

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), details > summary';

// ─── Styles ───────────────────────────────────────────────────────────────────

const POPOVER_STYLES = `
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

  .popover-content {
    position: fixed;
    z-index: var(--compa11y-popover-z-index, 1000);
    background: var(--compa11y-popover-bg, #fff);
    color: var(--compa11y-popover-color, inherit);
    border: var(--compa11y-popover-border, 1px solid rgba(0, 0, 0, 0.15));
    border-radius: var(--compa11y-popover-radius, 0.375rem);
    box-shadow: var(--compa11y-popover-shadow, 0 4px 16px rgba(0, 0, 0, 0.12));
    padding: var(--compa11y-popover-padding, 1rem);
    max-width: var(--compa11y-popover-max-width, 320px);
    min-width: 100px;
    outline: none;
    transition: opacity 0.15s ease, transform 0.15s ease;
    opacity: 0;
    transform: scale(0.96) translateY(-2px);
  }

  .popover-content[data-open="true"] {
    opacity: 1;
    transform: scale(1) translateY(0);
  }

  .popover-content[hidden] {
    display: none !important;
  }

  @media (prefers-reduced-motion: reduce) {
    .popover-content {
      transition: none;
    }
  }

  ${FOCUS_VISIBLE_STYLES}

  @media (forced-colors: active) {
    .popover-content {
      border: 2px solid ButtonText;
    }
  }
`;

// ─── Component ────────────────────────────────────────────────────────────────

export class A11yPopover extends Compa11yElement {
  // ── state ──
  private _open = false;
  private _placement: Placement = 'bottom';
  private _offset = 8;
  private _disabled = false;
  private _haspopup = 'dialog';
  private _contentRole = 'dialog';
  private _contentLabel = '';
  private _focusPolicy: FocusPolicy = 'first';

  // ── DOM refs ──
  private _triggerEl: HTMLElement | null = null;
  private _contentEl: HTMLElement | null = null;

  /**
   * Element that had focus before we opened the popover. Used to decide
   * whether to restore focus on close.
   */
  private _focusOrigin: Element | null = null;
  /** Set to true only when WE move focus into the content. */
  private _weMovedFocus = false;

  static get observedAttributes() {
    return [
      'open', 'placement', 'offset', 'disabled',
      'haspopup', 'content-role', 'content-label', 'focus-policy',
    ];
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  get open(): boolean { return this._open; }
  set open(value: boolean) {
    if (this._open === value) return;
    this._open = value;
    this.toggleAttribute('open', value);
    if (value) { this._show(); } else { this._hide(); }
  }

  get disabled(): boolean { return this._disabled; }
  set disabled(value: boolean) {
    this._disabled = value;
    this.toggleAttribute('disabled', value);
    this._updateTriggerDisabled();
  }

  // ─── Lifecycle ─────────────────────────────────────────────────────────────

  protected setupAccessibility(): void {
    this._open         = this.hasAttribute('open');
    this._placement    = (this.getAttribute('placement') as Placement) || 'bottom';
    this._offset       = parseInt(this.getAttribute('offset') || '8', 10);
    this._disabled     = this.hasAttribute('disabled');
    this._haspopup     = this.getAttribute('haspopup') || 'dialog';
    this._contentRole  = this.getAttribute('content-role') || 'dialog';
    this._contentLabel = this.getAttribute('content-label') || '';
    this._focusPolicy  = (this.getAttribute('focus-policy') as FocusPolicy) || 'first';
  }

  protected render(): void {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }

    const contentId = `${this._id}-content`;

    const labelAttr = this._contentLabel
      ? `aria-label="${this._contentLabel}"`
      : '';

    this.shadowRoot!.innerHTML = `
      <style>${POPOVER_STYLES}</style>
      <slot name="trigger" part="trigger-slot"></slot>
      <div
        class="popover-content"
        id="${contentId}"
        part="content"
        role="${this._contentRole}"
        aria-modal="false"
        tabindex="-1"
        ${labelAttr}
        ${this._open ? 'data-open="true"' : ''}
        ${this._open ? '' : 'hidden'}
      >
        <slot></slot>
      </div>
    `;

    this._contentEl = this.shadowRoot!.querySelector('.popover-content');
    this._wireTrigger(contentId);

    if (this._open) {
      requestAnimationFrame(() => this._updatePosition());
    }
  }

  protected setupEventListeners(): void {
    const triggerSlot = this.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="trigger"]');
    triggerSlot?.addEventListener('slotchange', this._onTriggerSlotChange);
  }

  protected cleanupEventListeners(): void {
    const triggerSlot = this.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="trigger"]');
    triggerSlot?.removeEventListener('slotchange', this._onTriggerSlotChange);
    this._removeGlobalListeners();
    this._detachTriggerListeners();
  }

  protected onAttributeChange(
    name: string,
    _oldValue: string | null,
    newValue: string | null
  ): void {
    switch (name) {
      case 'open':
        this.open = newValue !== null;
        break;
      case 'placement':
        this._placement = (newValue as Placement) || 'bottom';
        if (this._open) this._updatePosition();
        break;
      case 'offset':
        this._offset = parseInt(newValue || '8', 10);
        if (this._open) this._updatePosition();
        break;
      case 'disabled':
        this._disabled = newValue !== null;
        this._updateTriggerDisabled();
        break;
      case 'haspopup':
        this._haspopup = newValue || 'dialog';
        this._updateTriggerAria();
        break;
      case 'content-role':
        this._contentRole = newValue || 'dialog';
        this._contentEl?.setAttribute('role', this._contentRole);
        break;
      case 'content-label':
        this._contentLabel = newValue || '';
        if (this._contentLabel) {
          this._contentEl?.setAttribute('aria-label', this._contentLabel);
        } else {
          this._contentEl?.removeAttribute('aria-label');
        }
        break;
      case 'focus-policy':
        this._focusPolicy = (newValue as FocusPolicy) || 'first';
        break;
    }
  }

  // ─── Trigger Wiring ────────────────────────────────────────────────────────

  private _wireTrigger(contentId: string): void {
    const triggerSlot = this.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="trigger"]');
    if (!triggerSlot) return;

    const assigned = triggerSlot.assignedElements({ flatten: true });
    const el = (assigned[0] as HTMLElement) || null;

    if (
      typeof process !== 'undefined' &&
      process.env?.NODE_ENV !== 'production'
    ) {
      if (!el) {
        warn.warning(
          'Popover has no trigger. Add an element to the "trigger" slot.',
          '<a11y-popover><button slot="trigger">Open</button>...</a11y-popover>'
        );
      }
    }

    this._detachTriggerListeners();
    this._triggerEl = el;
    if (!el) return;

    this._updateTriggerAria(contentId);
    this._updateTriggerDisabled();

    el.addEventListener('click', this._onTriggerClick);
    el.addEventListener('keydown', this._onTriggerKeyDown);
  }

  /** Update ARIA attributes on the trigger without re-wiring listeners. */
  private _updateTriggerAria(contentId?: string): void {
    const el = this._triggerEl;
    if (!el) return;

    const cid = contentId || `${this._id}-content`;

    if (this._haspopup && this._haspopup !== 'false') {
      el.setAttribute('aria-haspopup', this._haspopup);
    } else {
      el.removeAttribute('aria-haspopup');
    }

    el.setAttribute('aria-expanded', String(this._open));

    // aria-controls only when content is in the DOM (i.e. when open)
    if (this._open) {
      el.setAttribute('aria-controls', cid);
    } else {
      el.removeAttribute('aria-controls');
    }
  }

  /** Apply disabled state to the trigger element. */
  private _updateTriggerDisabled(): void {
    const el = this._triggerEl;
    if (!el) return;

    if (this._disabled) {
      if ('disabled' in el) {
        (el as HTMLButtonElement).disabled = true;
      } else {
        el.setAttribute('aria-disabled', 'true');
        el.setAttribute('tabindex', '-1');
      }
    } else {
      if ('disabled' in el) {
        (el as HTMLButtonElement).disabled = false;
      } else {
        el.removeAttribute('aria-disabled');
        el.removeAttribute('tabindex');
      }
    }
  }

  private _detachTriggerListeners(): void {
    if (!this._triggerEl) return;
    this._triggerEl.removeEventListener('click', this._onTriggerClick);
    this._triggerEl.removeEventListener('keydown', this._onTriggerKeyDown);
    this._triggerEl.removeAttribute('aria-haspopup');
    this._triggerEl.removeAttribute('aria-expanded');
    this._triggerEl.removeAttribute('aria-controls');
  }

  private _onTriggerSlotChange = (): void => {
    const contentId = `${this._id}-content`;
    this._wireTrigger(contentId);
  };

  // ─── Open / Close ──────────────────────────────────────────────────────────

  private _show(): void {
    if (!this._contentEl) return;

    this._focusOrigin = document.activeElement;

    this._contentEl.removeAttribute('hidden');
    this._updateTriggerAria(); // set aria-expanded=true + aria-controls

    this._updatePosition();
    requestAnimationFrame(() => {
      this._contentEl?.setAttribute('data-open', 'true');
    });

    // Dev warning: content should be labelled
    if (
      typeof process !== 'undefined' &&
      process.env?.NODE_ENV !== 'production'
    ) {
      requestAnimationFrame(() => {
        const c = this._contentEl;
        if (!c) return;
        const hasLabel = c.hasAttribute('aria-label') || c.hasAttribute('aria-labelledby');
        const hasHeading = !!c.querySelector('h1, h2, h3, h4, h5, h6, [role="heading"]');
        if (!hasLabel && !hasHeading) {
          warn.warning(
            'Popover content has no accessible name. Add content-label="..." on <a11y-popover>, or place a heading inside the content.',
            'Example: <a11y-popover content-label="Filter options">...</a11y-popover>'
          );
        }
      });
    }

    // Focus management
    requestAnimationFrame(() => {
      const policy = this._focusPolicy;
      if (policy === 'none') return;

      const contentEl = this._contentEl;
      if (!contentEl) return;

      let target: HTMLElement | null = null;
      if (policy === 'first') {
        target = contentEl.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      }
      // Fall through to container if no focusable found or policy === 'container'
      if (!target) target = contentEl;

      this._weMovedFocus = true;
      target.focus();
    });

    this._addGlobalListeners();
    this.emit('a11y-popover-open');
  }

  private _hide(): void {
    if (!this._contentEl) return;

    this._contentEl.removeAttribute('data-open');
    this._updateTriggerAria(); // set aria-expanded=false, remove aria-controls

    const onTransitionEnd = () => {
      this._contentEl?.setAttribute('hidden', '');
      this._contentEl?.removeEventListener('transitionend', onTransitionEnd);
    };

    const hasTransition =
      getComputedStyle(this._contentEl).transitionDuration !== '0s';

    if (hasTransition) {
      this._contentEl.addEventListener('transitionend', onTransitionEnd);
      setTimeout(onTransitionEnd, 200);
    } else {
      this._contentEl.setAttribute('hidden', '');
    }

    this._removeGlobalListeners();

    // Only return focus if it is currently inside the popover content
    // (i.e. we moved it there, or user tabbed into it).
    // If the user clicked somewhere else, don't yank focus away.
    const focusIsInContent =
      this._weMovedFocus ||
      this._contentEl.contains(document.activeElement);

    this._weMovedFocus = false;
    this._focusOrigin = null;

    if (focusIsInContent) {
      this._triggerEl?.focus();
    }

    this.emit('a11y-popover-close');
  }

  // ─── Positioning ───────────────────────────────────────────────────────────

  private _updatePosition(): void {
    if (!this._triggerEl || !this._contentEl || !this._open) return;

    const triggerRect = this._triggerEl.getBoundingClientRect();
    const { top, left } = computePosition(
      triggerRect,
      this._contentEl,
      this._placement,
      this._offset
    );

    this._contentEl.style.top  = `${top}px`;
    this._contentEl.style.left = `${left}px`;
  }

  // ─── Global Dismiss Listeners ──────────────────────────────────────────────

  private _addGlobalListeners(): void {
    document.addEventListener('pointerdown', this._onOutsidePointerDown, true);
    document.addEventListener('keydown', this._onDocumentKeyDown, true);
    window.addEventListener('scroll', this._onScrollOrResize, { passive: true, capture: true });
    window.addEventListener('resize', this._onScrollOrResize, { passive: true });
  }

  private _removeGlobalListeners(): void {
    document.removeEventListener('pointerdown', this._onOutsidePointerDown, true);
    document.removeEventListener('keydown', this._onDocumentKeyDown, true);
    window.removeEventListener('scroll', this._onScrollOrResize, true);
    window.removeEventListener('resize', this._onScrollOrResize);
  }

  /**
   * Use composedPath() so that events originating inside the shadow DOM or
   * inside portaled content are correctly identified as "inside".
   */
  private _onOutsidePointerDown = (e: PointerEvent): void => {
    const path = e.composedPath() as EventTarget[];
    // If the click touched this host element (or any of its shadow DOM children),
    // it is an "inside" click. composedPath() pierces shadow boundaries.
    if (path.includes(this as unknown as EventTarget)) return;
    this.open = false;
  };

  private _onDocumentKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      this.open = false;
    }
  };

  private _onScrollOrResize = (): void => {
    if (this._open) this._updatePosition();
  };

  // ─── Trigger Event Handlers ───────────────────────────────────────────────

  private _onTriggerClick = (): void => {
    if (this._disabled) return;
    this.open = !this._open;
  };

  private _onTriggerKeyDown = (e: KeyboardEvent): void => {
    if (this._disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.open = !this._open;
    }
  };
}

defineElement('a11y-popover', A11yPopover);
