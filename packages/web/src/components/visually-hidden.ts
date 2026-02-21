/**
 * Accessible VisuallyHidden component.
 *
 * Hides content visually while keeping it accessible to screen readers.
 * Commonly used for:
 * - Providing labels for icon-only buttons
 * - Adding context that is visually obvious but needs to be explicit for screen readers
 * - Skip links (when combined with focusable mode)
 *
 * @example
 * ```html
 * <!-- Screen-reader-only text -->
 * <a11y-visually-hidden>Loading, please wait</a11y-visually-hidden>
 *
 * <!-- Focusable (becomes visible on focus, e.g. skip links) -->
 * <a11y-visually-hidden focusable>
 *   <a href="#main-content">Skip to main content</a>
 * </a11y-visually-hidden>
 * ```
 */

import { Compa11yElement, defineElement } from '../utils/base-element';
import { VISUALLY_HIDDEN_STYLES } from '../utils/styles';

export class A11yVisuallyHidden extends Compa11yElement {
  static get observedAttributes() {
    return ['focusable'];
  }

  protected setupAccessibility(): void {
    // No role needed — this is a utility wrapper, not a semantic element
  }

  protected render(): void {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }

    this.shadowRoot!.innerHTML = `
      <style>
        :host {
          ${VISUALLY_HIDDEN_STYLES}
        }

        :host([hidden]) {
          display: none !important;
        }

        /* When focusable, become visible when a child receives focus */
        :host([focusable]:focus-within) {
          position: static;
          width: auto;
          height: auto;
          padding: 0;
          margin: 0;
          overflow: visible;
          clip: auto;
          white-space: normal;
          border: 0;
        }
      </style>
      <slot></slot>
    `;
  }

  protected setupEventListeners(): void {}
  protected cleanupEventListeners(): void {}
}

defineElement('a11y-visually-hidden', A11yVisuallyHidden);
