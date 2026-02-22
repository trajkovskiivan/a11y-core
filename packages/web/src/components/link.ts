/**
 * Accessible Link component.
 *
 * An enhanced anchor element that handles external link indicators,
 * `aria-current` for navigation, and proper focus styling.
 *
 * @example
 * ```html
 * <!-- Basic link -->
 * <a11y-link href="/about">About us</a11y-link>
 *
 * <!-- External link (opens in new tab, announces to screen readers) -->
 * <a11y-link href="https://example.com" external>Visit Example</a11y-link>
 *
 * <!-- Current page in navigation -->
 * <a11y-link href="/dashboard" current="page">Dashboard</a11y-link>
 *
 * <!-- Disabled link -->
 * <a11y-link href="/settings" disabled>Settings</a11y-link>
 * ```
 *
 * @attr {string} href - Link destination URL
 * @attr {boolean} external - Opens in new tab with security attrs and screen reader hint
 * @attr {string} current - Sets aria-current value: 'page' | 'step' | 'location' | 'true'
 * @attr {boolean} disabled - Disables the link (removes from tab order, prevents navigation)
 *
 * @cssprop --compa11y-link-color - Link text color
 * @cssprop --compa11y-link-color-hover - Hover text color
 * @cssprop --compa11y-link-color-visited - Visited text color
 * @cssprop --compa11y-link-underline - Text decoration (default: underline)
 * @cssprop --compa11y-focus-color - Focus outline color
 */

import { Compa11yElement, defineElement } from '../utils/base-element';

const LINK_STYLES = `
  :host {
    display: inline;
  }

  :host([hidden]) {
    display: none !important;
  }

  a {
    color: var(--compa11y-link-color, #0066cc);
    text-decoration: var(--compa11y-link-underline, underline);
    cursor: pointer;
    border-radius: 2px;
  }

  a:hover {
    color: var(--compa11y-link-color-hover, #004499);
  }

  a:visited {
    color: var(--compa11y-link-color-visited, #551a8b);
  }

  a:focus-visible {
    outline: 2px solid var(--compa11y-focus-color, #0066cc);
    outline-offset: 2px;
  }

  /* Disabled state */
  :host([disabled]) a {
    color: var(--compa11y-link-color-disabled, #999);
    cursor: not-allowed;
    pointer-events: none;
    text-decoration: none;
  }

  /* External link indicator */
  .external-icon {
    display: inline-block;
    width: 0.75em;
    height: 0.75em;
    margin-left: 0.25em;
    vertical-align: baseline;
  }

  /* Forced colors / high contrast mode */
  @media (forced-colors: active) {
    a {
      forced-color-adjust: none;
      color: LinkText;
    }

    a:visited {
      color: VisitedText;
    }

    a:focus-visible {
      outline: 2px solid Highlight;
    }

    :host([disabled]) a {
      color: GrayText;
    }
  }
`;

export class A11yLink extends Compa11yElement {
  static get observedAttributes() {
    return ['href', 'external', 'current', 'disabled'];
  }

  protected setupAccessibility(): void {
    // Accessibility setup happens in render via anchor attributes
  }

  protected render(): void {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }

    const href = this.getAttribute('href') || '';
    const external = this.hasAttribute('external');
    const current = this.getAttribute('current');
    const disabled = this.hasAttribute('disabled');

    const attrs: string[] = [];

    if (disabled) {
      attrs.push('role="link"');
      attrs.push('aria-disabled="true"');
      attrs.push('tabindex="-1"');
    } else {
      attrs.push(`href="${href}"`);
    }

    if (external && !disabled) {
      attrs.push('target="_blank"');
      attrs.push('rel="noopener noreferrer"');
    }

    if (current) {
      attrs.push(`aria-current="${current}"`);
    }

    const externalIcon = external
      ? `<svg class="external-icon" part="external-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
          <polyline points="15 3 21 3 21 9"/>
          <line x1="10" y1="14" x2="21" y2="3"/>
        </svg>`
      : '';

    const srHint = external
      ? '<span class="sr-only" style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;">(opens in new tab)</span>'
      : '';

    this.shadowRoot!.innerHTML = `
      <style>${LINK_STYLES}</style>
      <a ${attrs.join(' ')} part="link">
        <slot></slot>${externalIcon}${srHint}
      </a>
    `;
  }

  protected onAttributeChange(
    name: string,
    _oldValue: string | null,
    _newValue: string | null
  ): void {
    if (['href', 'external', 'current', 'disabled'].includes(name)) {
      this.render();
    }
  }
}

defineElement('a11y-link', A11yLink);
