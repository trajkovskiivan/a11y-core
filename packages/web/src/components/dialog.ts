/**
 * compa11y Dialog Web Component
 *
 * Usage:
 * <a11y-dialog trigger="#open-btn">
 *   <h2 slot="title">Dialog Title</h2>
 *   <p slot="description">Optional description</p>
 *   <div>Dialog content here</div>
 * </a11y-dialog>
 */

import { announce } from '@compa11y/core';
import { Compa11yElement, defineElement } from '../utils/base-element';
import { DIALOG_STYLES } from '../utils/styles';

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export class A11yDialog extends Compa11yElement {
  private _open = false;
  private _previouslyFocused: HTMLElement | null = null;
  private _triggerElement: HTMLElement | null = null;

  static get observedAttributes() {
    return ['open', 'trigger', 'close-on-outside-click', 'close-on-escape'];
  }

  get open(): boolean {
    return this._open;
  }

  set open(value: boolean) {
    const oldValue = this._open;
    this._open = value;

    if (value !== oldValue) {
      if (value) {
        this.showDialog();
      } else {
        this.hideDialog();
      }
    }

    this.toggleAttribute('open', value);
  }

  protected setupAccessibility(): void {
    // Accessibility is set up in render()
  }

  protected render(): void {
    const shadow = this.attachShadow({ mode: 'open' });

    const titleId = `${this._id}-title`;
    const descId = `${this._id}-desc`;

    shadow.innerHTML = `
      <style>${DIALOG_STYLES}</style>
      <div class="overlay" part="overlay"></div>
      <div
        class="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="${titleId}"
        aria-describedby="${descId}"
        part="dialog"
      >
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
  }

  protected setupEventListeners(): void {
    // Set up trigger - defer to ensure DOM is ready (Safari fix)
    const triggerSelector = this.getAttribute('trigger');
    if (triggerSelector) {
      // Safari may not have parsed the trigger element yet during connectedCallback
      // Use requestAnimationFrame to defer, then retry with setTimeout as fallback
      const setupTrigger = () => {
        this._triggerElement = document.querySelector(triggerSelector);
        if (this._triggerElement) {
          this._triggerElement.addEventListener(
            'click',
            this.handleTriggerClick
          );
          // Safari fix: Ensure trigger is in tab order (Safari skips buttons by default)
          if (!this._triggerElement.hasAttribute('tabindex')) {
            this._triggerElement.setAttribute('tabindex', '0');
          }
        }
      };

      // Try immediately
      setupTrigger();

      // If not found, try after next frame (Safari timing fix)
      if (!this._triggerElement) {
        requestAnimationFrame(() => {
          setupTrigger();
          // Final fallback for very slow Safari parsing
          if (!this._triggerElement) {
            setTimeout(setupTrigger, 0);
          }
        });
      }
    }

    // Overlay click
    const overlay = this.shadowRoot?.querySelector('.overlay');
    if (this.getAttribute('close-on-outside-click') !== 'false') {
      overlay?.addEventListener('click', this.handleClose);
    }

    // Keyboard handling (Escape and Tab trap)
    this.addEventListener('keydown', this.handleKeyDown);
  }

  protected cleanupEventListeners(): void {
    this._triggerElement?.removeEventListener('click', this.handleTriggerClick);
    this.removeEventListener('keydown', this.handleKeyDown);
  }

  protected onAttributeChange(
    name: string,
    _oldValue: string | null,
    newValue: string | null
  ): void {
    if (name === 'open') {
      this.open = newValue !== null;
    }
  }

  /**
   * Get all focusable elements in the dialog (light DOM first, then shadow DOM)
   * Per WAI-ARIA best practices: focus should go to dialog content first,
   * close button should be last in tab order
   */
  private getFocusableElements(): HTMLElement[] {
    const elements: HTMLElement[] = [];

    // Get focusable elements from light DOM FIRST (slotted content)
    // This ensures Cancel/primary actions get focus before close button
    const lightElements = this.querySelectorAll(FOCUSABLE_SELECTOR);
    lightElements.forEach((el) => elements.push(el as HTMLElement));

    // Get focusable elements from shadow DOM LAST (close button)
    if (this.shadowRoot) {
      const shadowElements =
        this.shadowRoot.querySelectorAll(FOCUSABLE_SELECTOR);
      shadowElements.forEach((el) => {
        // Skip the overlay
        if (!el.classList.contains('overlay')) {
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

    // Escape to close
    if (event.key === 'Escape') {
      if (this.getAttribute('close-on-escape') !== 'false') {
        event.preventDefault();
        this.handleClose();
      }
      return;
    }

    // Tab trap - must manually manage focus between shadow and light DOM
    if (event.key === 'Tab') {
      event.preventDefault(); // Always prevent default - we manage focus manually

      const focusableElements = this.getFocusableElements();
      if (focusableElements.length === 0) return;

      // Find currently focused element in either shadow or light DOM
      const activeElement =
        this.shadowRoot?.activeElement || document.activeElement;

      // Find current index
      let currentIndex = focusableElements.findIndex(
        (el) => el === activeElement
      );

      // If not found, start from beginning (or end for shift+tab)
      if (currentIndex === -1) {
        currentIndex = event.shiftKey ? 0 : focusableElements.length - 1;
      }

      // Calculate next index
      let nextIndex: number;
      if (event.shiftKey) {
        // Shift+Tab: go backwards, wrap to end
        nextIndex =
          currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1;
      } else {
        // Tab: go forwards, wrap to beginning
        nextIndex =
          currentIndex === focusableElements.length - 1 ? 0 : currentIndex + 1;
      }

      // Focus the next element
      const nextElement = focusableElements[nextIndex];
      if (nextElement) {
        nextElement.focus();
      }
    }
  };

  private showDialog(): void {
    this._previouslyFocused = document.activeElement as HTMLElement;
    this.style.display = 'flex';

    // Focus the first focusable element after a short delay
    // to ensure the dialog is fully rendered
    requestAnimationFrame(() => {
      const focusableElements = this.getFocusableElements();
      const firstElement = focusableElements[0];
      if (firstElement) {
        firstElement.focus();
      }
    });

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Announce
    announce('Dialog opened', { politeness: 'polite' });

    // Emit event
    this.emit('a11y-dialog-open');
  }

  private hideDialog(): void {
    this.style.display = 'none';

    // Restore body scroll
    document.body.style.overflow = '';

    // Return focus
    this._previouslyFocused?.focus();
    this._previouslyFocused = null;

    // Announce
    announce('Dialog closed', { politeness: 'polite' });

    // Emit event
    this.emit('a11y-dialog-close');
  }

  /**
   * Programmatic open
   */
  show(): void {
    this.open = true;
  }

  /**
   * Programmatic close
   */
  close(): void {
    this.open = false;
  }
}

defineElement('a11y-dialog', A11yDialog);

export default A11yDialog;
