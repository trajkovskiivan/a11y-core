/**
 * compa11y Drawer Web Component
 *
 * A panel that slides in from any edge of the viewport.
 *
 * Usage:
 * <compa11y-drawer side="right" trigger="#open-btn">
 *   <h2 slot="title">Drawer Title</h2>
 *   <p slot="description">Optional description</p>
 *   <div>Drawer content here</div>
 *   <div slot="actions">
 *     <button>Action</button>
 *   </div>
 * </compa11y-drawer>
 *
 * Drag-to-dismiss (add draggable attribute):
 * <compa11y-drawer side="bottom" draggable>...</compa11y-drawer>
 */

import { announce } from '@compa11y/core';
import { Compa11yElement, defineElement } from '../utils/base-element';
import { DRAWER_STYLES } from '../utils/styles';

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const DISMISS_THRESHOLD = 0.4;

type DrawerSide = 'left' | 'right' | 'top' | 'bottom';

// Body scroll lock stacking — only restore overflow when all overlays are closed
let bodyLockCount = 0;
let savedOverflow = '';

function lockBodyScroll(): void {
  if (bodyLockCount === 0) {
    savedOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  bodyLockCount++;
}

function unlockBodyScroll(): void {
  bodyLockCount--;
  if (bodyLockCount <= 0) {
    bodyLockCount = 0;
    document.body.style.overflow = savedOverflow;
  }
}

export class Compa11yDrawer extends Compa11yElement {
  private _open = false;
  private _side: DrawerSide = 'right';
  private _draggable = false;
  private _previouslyFocused: HTMLElement | null = null;
  private _triggerElement: HTMLElement | null = null;

  // Drag state
  private _dragStartX = 0;
  private _dragStartY = 0;
  private _dragPointerId = -1;

  static get observedAttributes() {
    return ['open', 'side', 'trigger', 'close-on-outside-click', 'close-on-escape', 'draggable'];
  }

  get open(): boolean {
    return this._open;
  }

  set open(value: boolean) {
    const oldValue = this._open;
    this._open = value;

    if (value !== oldValue) {
      if (value) {
        this.showDrawer();
      } else {
        this.hideDrawer();
      }
    }

    this.toggleAttribute('open', value);
  }

  get side(): DrawerSide {
    return this._side;
  }

  set side(value: DrawerSide) {
    this._side = value;
    this.setAttribute('side', value);
  }

  get draggable(): boolean {
    return this._draggable;
  }

  set draggable(value: boolean) {
    this._draggable = value;
    this.toggleAttribute('draggable', value);
    this.syncDraggable();
  }

  protected setupAccessibility(): void {
    this._side = (this.getAttribute('side') as DrawerSide) || 'right';
    this._open = this.hasAttribute('open');
    this._draggable = this.hasAttribute('draggable');

    if (
      typeof process !== 'undefined' &&
      process.env?.NODE_ENV !== 'production'
    ) {
      const titleSlot = this.querySelector('[slot="title"]');
      if (!titleSlot) {
        console.warn(
          '[compa11y/Drawer] Drawer has no title. Add a <h2 slot="title">...</h2> element for accessible labeling.\n' +
            '💡 Suggestion: <compa11y-drawer><h2 slot="title">Drawer Title</h2>...</compa11y-drawer>'
        );
      }
      const side = this.getAttribute('side');
      if (side && !['left', 'right', 'top', 'bottom'].includes(side)) {
        console.warn(
          `[compa11y/Drawer] Invalid side="${side}". Must be one of: left, right, top, bottom.`
        );
      }
    }
  }

  protected render(): void {
    const shadow = this.attachShadow({ mode: 'open' });

    const titleId = `${this._id}-title`;
    const descId = `${this._id}-desc`;

    shadow.innerHTML = `
      <style>${DRAWER_STYLES}</style>
      <div class="overlay" part="overlay"></div>
      <div
        class="drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="${titleId}"
        aria-describedby="${descId}"
        part="drawer"
      >
        <div class="handle" part="handle" aria-hidden="true"></div>
        <div id="${titleId}" part="title">
          <slot name="title"></slot>
        </div>
        <div id="${descId}" part="description">
          <slot name="description"></slot>
        </div>
        <div part="content">
          <slot></slot>
        </div>
        <div part="actions">
          <slot name="actions"></slot>
        </div>
      </div>
    `;

    // Hide by default
    if (!this._open) {
      this.style.display = 'none';
    }

    this.syncDraggable();
  }

  protected setupEventListeners(): void {
    // Set up trigger element via CSS selector
    const triggerSelector = this.getAttribute('trigger');
    if (triggerSelector) {
      const setupTrigger = () => {
        this._triggerElement = document.querySelector(triggerSelector);
        if (this._triggerElement) {
          this._triggerElement.addEventListener('click', this.handleTriggerClick);
          // Safari fix: ensure button is in tab order
          if (!this._triggerElement.hasAttribute('tabindex')) {
            this._triggerElement.setAttribute('tabindex', '0');
          }
        }
      };

      setupTrigger();

      if (!this._triggerElement) {
        requestAnimationFrame(() => {
          setupTrigger();
          if (!this._triggerElement) {
            setTimeout(setupTrigger, 0);
          }
        });
      }
    }

    // Overlay click to close
    const overlay = this.shadowRoot?.querySelector('.overlay');
    if (this.getAttribute('close-on-outside-click') !== 'false') {
      overlay?.addEventListener('click', this.handleClose);
    }

    // Keyboard: Escape + Tab trap
    this.addEventListener('keydown', this.handleKeyDown);

    // Drag listeners on the handle
    const handle = this.shadowRoot?.querySelector('.handle');
    handle?.addEventListener('pointerdown', this.handlePointerDown as EventListener);
    handle?.addEventListener('pointermove', this.handlePointerMove as EventListener);
    handle?.addEventListener('pointerup', this.handlePointerUp as EventListener);
    handle?.addEventListener('pointercancel', this.handlePointerCancel as EventListener);
  }

  protected cleanupEventListeners(): void {
    this._triggerElement?.removeEventListener('click', this.handleTriggerClick);
    this.removeEventListener('keydown', this.handleKeyDown);

    const handle = this.shadowRoot?.querySelector('.handle');
    handle?.removeEventListener('pointerdown', this.handlePointerDown as EventListener);
    handle?.removeEventListener('pointermove', this.handlePointerMove as EventListener);
    handle?.removeEventListener('pointerup', this.handlePointerUp as EventListener);
    handle?.removeEventListener('pointercancel', this.handlePointerCancel as EventListener);
  }

  protected onAttributeChange(
    name: string,
    _oldValue: string | null,
    newValue: string | null
  ): void {
    if (name === 'open') {
      this.open = newValue !== null;
    }
    if (name === 'side') {
      this._side = (newValue as DrawerSide) || 'right';
    }
    if (name === 'draggable') {
      this._draggable = newValue !== null;
      this.syncDraggable();
    }
  }

  // ── Drag helpers ──────────────────────────────────────────────────────────

  private syncDraggable(): void {
    const handle = this.shadowRoot?.querySelector('.handle') as HTMLElement | null;
    if (!handle) return;
    handle.style.cursor = this._draggable ? 'grab' : 'default';
    handle.style.touchAction = this._draggable ? 'none' : '';
  }

  private getDrawerPanel(): HTMLElement | null {
    return (this.shadowRoot?.querySelector('.drawer') as HTMLElement) ?? null;
  }

  private applyDragTransform(dx: number, dy: number): void {
    const panel = this.getDrawerPanel();
    if (!panel) return;
    switch (this._side) {
      case 'left':   panel.style.transform = `translateX(${Math.min(0, dx)}px)`; break;
      case 'right':  panel.style.transform = `translateX(${Math.max(0, dx)}px)`; break;
      case 'top':    panel.style.transform = `translateY(${Math.min(0, dy)}px)`; break;
      case 'bottom': panel.style.transform = `translateY(${Math.max(0, dy)}px)`; break;
    }
  }

  private snapBack(): void {
    const panel = this.getDrawerPanel();
    if (!panel) return;
    panel.style.transition = 'transform 0.3s ease';
    panel.style.transform = '';
    const cleanup = () => {
      panel.style.transition = '';
      panel.removeEventListener('transitionend', cleanup);
    };
    panel.addEventListener('transitionend', cleanup);
  }

  private handlePointerDown = (e: PointerEvent): void => {
    if (!this._draggable || !this._open) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    this._dragStartX = e.clientX;
    this._dragStartY = e.clientY;
    this._dragPointerId = e.pointerId;
    // Disable transition during drag
    const panel = this.getDrawerPanel();
    if (panel) panel.style.transition = 'none';
  };

  private handlePointerMove = (e: PointerEvent): void => {
    if (!this._draggable || this._dragPointerId !== e.pointerId) return;
    this.applyDragTransform(
      e.clientX - this._dragStartX,
      e.clientY - this._dragStartY
    );
  };

  private handlePointerUp = (e: PointerEvent): void => {
    if (!this._draggable || this._dragPointerId !== e.pointerId) return;
    this._dragPointerId = -1;

    const panel = this.getDrawerPanel();
    if (!panel) return;

    const dx = e.clientX - this._dragStartX;
    const dy = e.clientY - this._dragStartY;
    const w = panel.offsetWidth;
    const h = panel.offsetHeight;

    const shouldClose =
      (this._side === 'left'   && dx < -(w * DISMISS_THRESHOLD)) ||
      (this._side === 'right'  && dx >  w * DISMISS_THRESHOLD)   ||
      (this._side === 'top'    && dy < -(h * DISMISS_THRESHOLD))  ||
      (this._side === 'bottom' && dy >  h * DISMISS_THRESHOLD);

    if (shouldClose) {
      this.open = false;
    } else {
      this.snapBack();
    }
  };

  private handlePointerCancel = (): void => {
    if (!this._draggable) return;
    this._dragPointerId = -1;
    this.snapBack();
  };

  // ── Focus management ──────────────────────────────────────────────────────

  private getFocusableElements(): HTMLElement[] {
    const elements: HTMLElement[] = [];

    const lightElements = this.querySelectorAll(FOCUSABLE_SELECTOR);
    lightElements.forEach((el) => elements.push(el as HTMLElement));

    if (this.shadowRoot) {
      const shadowElements = this.shadowRoot.querySelectorAll(FOCUSABLE_SELECTOR);
      shadowElements.forEach((el) => {
        if (!el.classList.contains('overlay') && !el.classList.contains('handle')) {
          elements.push(el as HTMLElement);
        }
      });
    }

    return elements;
  }

  private handleTriggerClick = (): void => {
    this.open = true;
  };

  private handleClose = (): void => {
    this.open = false;
  };

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (!this._open) return;

    if (event.key === 'Escape') {
      if (this.getAttribute('close-on-escape') !== 'false') {
        event.preventDefault();
        this.handleClose();
      }
      return;
    }

    if (event.key === 'Tab') {
      event.preventDefault();

      const focusableElements = this.getFocusableElements();
      if (focusableElements.length === 0) return;

      const activeElement = this.shadowRoot?.activeElement || document.activeElement;
      let currentIndex = focusableElements.findIndex((el) => el === activeElement);

      if (currentIndex === -1) {
        currentIndex = event.shiftKey ? 0 : focusableElements.length - 1;
      }

      let nextIndex: number;
      if (event.shiftKey) {
        nextIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1;
      } else {
        nextIndex = currentIndex === focusableElements.length - 1 ? 0 : currentIndex + 1;
      }

      const nextElement = focusableElements[nextIndex];
      if (nextElement) {
        nextElement.focus();
      }
    }
  };

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  private showDrawer(): void {
    this._previouslyFocused = document.activeElement as HTMLElement;
    this.style.display = 'block';

    requestAnimationFrame(() => {
      const focusableElements = this.getFocusableElements();
      const firstElement = focusableElements[0];
      if (firstElement) {
        firstElement.focus();
      }
    });

    lockBodyScroll();
    announce('Drawer opened', { politeness: 'polite' });
    this.emit('compa11y-drawer-open', { side: this.getAttribute('side') || 'right' });
  }

  private hideDrawer(): void {
    this.style.display = 'none';

    unlockBodyScroll();

    this._previouslyFocused?.focus();
    this._previouslyFocused = null;

    announce('Drawer closed', { politeness: 'polite' });
    this.emit('compa11y-drawer-close', { side: this.getAttribute('side') || 'right' });
  }

  /** Programmatic open */
  show(): void {
    this.open = true;
  }

  /** Programmatic close */
  close(): void {
    this.open = false;
  }
}

defineElement('compa11y-drawer', Compa11yDrawer);

export default Compa11yDrawer;
