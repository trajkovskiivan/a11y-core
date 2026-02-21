/**
 * Accessible Alert component.
 *
 * A static feedback element that communicates important messages to users.
 * Uses `role="alert"` for urgent/error messages (assertive) and `role="status"`
 * for informational messages (polite).
 *
 * @example
 * ```html
 * <!-- Error alert (assertive, role="alert") -->
 * <a11y-alert type="error" title="Payment failed">
 *   Your card was declined. Please try a different payment method.
 * </a11y-alert>
 *
 * <!-- Success alert -->
 * <a11y-alert type="success" title="Saved!">
 *   Your changes have been saved successfully.
 * </a11y-alert>
 *
 * <!-- Info alert (polite, role="status") -->
 * <a11y-alert type="info">
 *   Your session will expire in 5 minutes.
 * </a11y-alert>
 *
 * <!-- Warning alert -->
 * <a11y-alert type="warning" title="Low storage">
 *   You have less than 100MB of storage remaining.
 * </a11y-alert>
 *
 * <!-- Dismissible alert -->
 * <a11y-alert type="info" dismissible>
 *   This alert can be closed by the user.
 * </a11y-alert>
 * ```
 *
 * @fires dismiss - Emitted when the alert is dismissed by the user
 *
 * @attr {string} type - Alert variant: 'info' | 'success' | 'warning' | 'error' (default: 'info')
 * @attr {string} title - Optional title text displayed prominently
 * @attr {boolean} dismissible - Whether the alert can be dismissed
 *
 * @cssprop --compa11y-alert-bg - Background color
 * @cssprop --compa11y-alert-color - Text color
 * @cssprop --compa11y-alert-border - Border style
 * @cssprop --compa11y-alert-radius - Border radius
 * @cssprop --compa11y-alert-padding - Padding
 * @cssprop --compa11y-alert-info-color - Info accent color
 * @cssprop --compa11y-alert-success-color - Success accent color
 * @cssprop --compa11y-alert-warning-color - Warning accent color
 * @cssprop --compa11y-alert-error-color - Error accent color
 * @cssprop --compa11y-focus-color - Focus outline color
 */

import { Compa11yElement, defineElement } from '../utils/base-element';
import { createComponentWarnings } from '@compa11y/core';

const warn = createComponentWarnings('Alert');

const ALERT_STYLES = `
  :host {
    display: block;
    box-sizing: border-box;
  }

  :host([hidden]) {
    display: none !important;
  }

  *,
  *::before,
  *::after {
    box-sizing: inherit;
  }

  .alert {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: var(--compa11y-alert-padding, 0.75rem 1rem);
    background: var(--compa11y-alert-bg, white);
    border: var(--compa11y-alert-border, 1px solid #e0e0e0);
    border-radius: var(--compa11y-alert-radius, 6px);
  }

  /* Type variants — left border accent */
  :host([type="info"]) .alert,
  :host(:not([type])) .alert {
    border-left: 4px solid var(--compa11y-alert-info-color, #3b82f6);
  }

  :host([type="success"]) .alert {
    border-left: 4px solid var(--compa11y-alert-success-color, #22c55e);
  }

  :host([type="warning"]) .alert {
    border-left: 4px solid var(--compa11y-alert-warning-color, #f59e0b);
  }

  :host([type="error"]) .alert {
    border-left: 4px solid var(--compa11y-alert-error-color, #ef4444);
  }

  .alert-icon {
    flex-shrink: 0;
    font-size: 1.25rem;
    line-height: 1;
    margin-top: 0.125rem;
  }

  :host([type="info"]) .alert-icon,
  :host(:not([type])) .alert-icon {
    color: var(--compa11y-alert-info-color, #3b82f6);
  }

  :host([type="success"]) .alert-icon {
    color: var(--compa11y-alert-success-color, #22c55e);
  }

  :host([type="warning"]) .alert-icon {
    color: var(--compa11y-alert-warning-color, #f59e0b);
  }

  :host([type="error"]) .alert-icon {
    color: var(--compa11y-alert-error-color, #ef4444);
  }

  .alert-content {
    flex: 1;
    min-width: 0;
  }

  .alert-title {
    font-weight: var(--compa11y-alert-title-weight, 600);
    font-size: var(--compa11y-alert-title-size, 0.875rem);
    margin-bottom: 0.125rem;
  }

  .alert-description {
    color: var(--compa11y-alert-description-color, #555);
    font-size: var(--compa11y-alert-description-size, 0.8125rem);
  }

  .alert-close {
    appearance: none;
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    font: inherit;
    color: inherit;
    cursor: pointer;
    flex-shrink: 0;
    width: 1.5rem;
    height: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--compa11y-alert-close-radius, 4px);
    color: var(--compa11y-alert-close-color, #999);
    font-size: 1.125rem;
    line-height: 1;
  }

  .alert-close:hover {
    background: var(--compa11y-alert-close-hover-bg, rgba(0, 0, 0, 0.05));
    color: var(--compa11y-alert-close-hover-color, #333);
  }

  .alert-close:focus-visible {
    outline: 2px solid var(--compa11y-focus-color, #0066cc);
    outline-offset: 2px;
  }

  /* Forced colors / high contrast mode */
  @media (forced-colors: active) {
    .alert {
      border: 2px solid ButtonText;
    }

    .alert-close:focus-visible {
      outline: 2px solid Highlight;
    }
  }
`;

const ICONS: Record<string, string> = {
  info: '\u2139\uFE0F',     // ℹ️
  success: '\u2705',         // ✅
  warning: '\u26A0\uFE0F',  // ⚠️
  error: '\u274C',           // ❌
};

export class A11yAlert extends Compa11yElement {
  private _closeButton: HTMLButtonElement | null = null;

  static get observedAttributes() {
    return ['type', 'title', 'dismissible'];
  }

  private get alertType(): string {
    return this.getAttribute('type') || 'info';
  }

  /**
   * Determine the ARIA role based on alert type.
   * error/warning → role="alert" (assertive)
   * info/success → role="status" (polite)
   */
  private get alertRole(): string {
    const type = this.alertType;
    return type === 'error' || type === 'warning' ? 'alert' : 'status';
  }

  protected setupAccessibility(): void {
    // Validate the type attribute
    const validTypes = ['info', 'success', 'warning', 'error'];
    const type = this.getAttribute('type');
    if (type && !validTypes.includes(type)) {
      warn.warning(
        `Invalid type="${type}". Use one of: ${validTypes.join(', ')}.`
      );
    }
  }

  protected render(): void {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }

    const title = this.getAttribute('title');
    const dismissible = this.hasAttribute('dismissible');
    const icon = ICONS[this.alertType] || ICONS.info;

    this.shadowRoot!.innerHTML = `
      <style>${ALERT_STYLES}</style>
      <div
        class="alert"
        role="${this.alertRole}"
        aria-live="${this.alertRole === 'alert' ? 'assertive' : 'polite'}"
        part="alert"
      >
        <span class="alert-icon" part="icon" aria-hidden="true">${icon}</span>
        <div class="alert-content" part="content">
          ${title ? `<div class="alert-title" part="title">${title}</div>` : ''}
          <div class="alert-description" part="description">
            <slot></slot>
          </div>
        </div>
        ${
          dismissible
            ? `<button
                class="alert-close"
                part="close"
                aria-label="Dismiss alert"
                type="button"
              >&times;</button>`
            : ''
        }
      </div>
    `;

    this._closeButton = this.shadowRoot!.querySelector('.alert-close');
  }

  protected setupEventListeners(): void {
    this._closeButton?.addEventListener('click', this.handleDismiss);
  }

  protected cleanupEventListeners(): void {
    this._closeButton?.removeEventListener('click', this.handleDismiss);
  }

  private handleDismiss = (): void => {
    this.emit('dismiss', { type: this.alertType });
    this.remove();
  };

  protected onAttributeChange(
    name: string,
    _oldValue: string | null,
    _newValue: string | null
  ): void {
    if (name === 'type' || name === 'title' || name === 'dismissible') {
      this.render();
      this.setupEventListeners();
    }
  }

  /**
   * Programmatically dismiss the alert
   */
  public dismiss(): void {
    this.handleDismiss();
  }
}

defineElement('a11y-alert', A11yAlert);
