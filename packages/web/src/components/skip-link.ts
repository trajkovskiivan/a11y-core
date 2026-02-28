/**
 * Accessible SkipLink component.
 *
 * A navigation aid that allows keyboard users to skip repetitive content
 * (like navigation menus) and jump directly to the main content area.
 *
 * Must be the FIRST focusable element on the page. Visually hidden until
 * focused, then appears prominently.
 *
 * @example
 * ```html
 * <!-- Place as first child of <body> -->
 * <compa11y-skip-link target="#main-content">Skip to main content</compa11y-skip-link>
 *
 * <!-- With custom label -->
 * <compa11y-skip-link target="#main-content" label="Skip navigation"></compa11y-skip-link>
 *
 * <!-- Multiple skip links -->
 * <compa11y-skip-link target="#main-content">Skip to main content</compa11y-skip-link>
 * <compa11y-skip-link target="#search">Skip to search</compa11y-skip-link>
 * ```
 *
 * Keyboard: Tab to reveal, Enter to activate.
 */

import { Compa11yElement, defineElement } from '../utils/base-element';
import { VISUALLY_HIDDEN_STYLES } from '../utils/styles';
import { createComponentWarnings } from '@compa11y/core';

const warn = createComponentWarnings('SkipLink');

export class Compa11ySkipLink extends Compa11yElement {
  static get observedAttributes() {
    return ['target', 'label'];
  }

  protected setupAccessibility(): void {
    const target = this.getAttribute('target');
    if (!target) {
      warn.warning(
        'Missing "target" attribute. Provide a CSS selector (e.g. target="#main-content") pointing to the skip destination.'
      );
    }
  }

  protected render(): void {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }

    const target = this.getAttribute('target') || '#main-content';
    const label = this.getAttribute('label');

    this.shadowRoot!.innerHTML = `
      <style>
        :host {
          display: block;
        }

        :host([hidden]) {
          display: none !important;
        }

        .skip-link {
          ${VISUALLY_HIDDEN_STYLES}
          display: inline-block;
          text-decoration: none;
        }

        .skip-link:focus {
          position: fixed;
          top: var(--compa11y-skip-link-top, 0.5rem);
          left: var(--compa11y-skip-link-left, 0.5rem);
          z-index: var(--compa11y-skip-link-z-index, 99999);
          width: auto;
          height: auto;
          padding: var(--compa11y-skip-link-padding, 0.75rem 1.5rem);
          margin: 0;
          overflow: visible;
          clip: auto;
          white-space: normal;
          background: var(--compa11y-skip-link-bg, #0066cc);
          color: var(--compa11y-skip-link-color, white);
          font-size: var(--compa11y-skip-link-font-size, 1rem);
          font-weight: var(--compa11y-skip-link-font-weight, 600);
          border-radius: var(--compa11y-skip-link-radius, 4px);
          border: var(--compa11y-skip-link-border, 2px solid transparent);
          box-shadow: var(--compa11y-skip-link-shadow, 0 2px 8px rgba(0, 0, 0, 0.2));
          outline: 2px solid var(--compa11y-focus-color, #0066cc);
          outline-offset: 2px;
        }

        @media (forced-colors: active) {
          .skip-link:focus {
            border: 2px solid ButtonText;
            outline: 2px solid Highlight;
          }
        }
      </style>
      <a class="skip-link" href="${target}" part="link">
        ${label ? label : '<slot>Skip to main content</slot>'}
      </a>
    `;
  }

  protected setupEventListeners(): void {
    this.addEventListener('click', this.handleClick);
  }

  protected cleanupEventListeners(): void {
    this.removeEventListener('click', this.handleClick);
  }

  private handleClick = (event: Event): void => {
    const target = this.getAttribute('target') || '#main-content';
    const element = document.querySelector(target) as HTMLElement | null;

    if (element) {
      event.preventDefault();
      // Ensure the target is focusable
      if (!element.hasAttribute('tabindex') && element.tabIndex < 0) {
        element.setAttribute('tabindex', '-1');
      }
      element.focus();
      // Scroll into view
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  protected onAttributeChange(
    name: string,
    _oldValue: string | null,
    _newValue: string | null
  ): void {
    if (name === 'target' || name === 'label') {
      this.render();
    }
  }
}

defineElement('compa11y-skip-link', Compa11ySkipLink);
