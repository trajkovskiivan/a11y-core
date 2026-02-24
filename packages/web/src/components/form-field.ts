/**
 * Accessible FormField component.
 *
 * A generic wrapper that provides label, hint, error, and required indicator
 * around any slotted form control. Automatically wires up `aria-labelledby`,
 * `aria-describedby`, and `aria-invalid` on the slotted control.
 *
 * Unlike `<a11y-input>` which bundles its own `<input>`, FormField wraps
 * **any** control you slot into it — native `<input>`, `<select>`, `<textarea>`,
 * or custom elements.
 *
 * @example
 * ```html
 * <!-- With a native input -->
 * <a11y-form-field label="Email" hint="We won't share it" required>
 *   <input type="email" placeholder="you@example.com" />
 * </a11y-form-field>
 *
 * <!-- With a native select -->
 * <a11y-form-field label="Country" required>
 *   <select>
 *     <option value="">Choose...</option>
 *     <option value="us">United States</option>
 *     <option value="uk">United Kingdom</option>
 *   </select>
 * </a11y-form-field>
 *
 * <!-- With error state -->
 * <a11y-form-field label="Password" error="Must be at least 8 characters">
 *   <input type="password" />
 * </a11y-form-field>
 *
 * <!-- Disabled -->
 * <a11y-form-field label="Organization" disabled>
 *   <input type="text" value="Compa11y Inc." />
 * </a11y-form-field>
 * ```
 *
 * @attr {string} label - Visible label text
 * @attr {string} hint - Hint/description text below the label
 * @attr {string} error - Error message (sets aria-invalid on control)
 * @attr {boolean} required - Shows required indicator and sets aria-required
 * @attr {boolean} disabled - Disables the control
 *
 * @cssprop --compa11y-field-gap - Gap between label, control, hint, error (default: 0.25rem)
 * @cssprop --compa11y-field-label-color - Label color
 * @cssprop --compa11y-field-label-size - Label font size
 * @cssprop --compa11y-field-label-weight - Label font weight
 * @cssprop --compa11y-field-hint-color - Hint text color
 * @cssprop --compa11y-field-hint-size - Hint font size
 * @cssprop --compa11y-field-error-color - Error text color
 * @cssprop --compa11y-field-error-size - Error font size
 * @cssprop --compa11y-field-required-color - Required asterisk color
 * @cssprop --compa11y-focus-color - Focus outline color
 */

import { Compa11yElement, defineElement } from '../utils/base-element';

const FORM_FIELD_STYLES = `
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

  .field-wrapper {
    display: flex;
    flex-direction: column;
    gap: var(--compa11y-field-gap, 0.25rem);
  }

  .field-label {
    display: block;
    color: var(--compa11y-field-label-color, inherit);
    font-size: var(--compa11y-field-label-size, 0.875rem);
    font-weight: var(--compa11y-field-label-weight, 500);
  }

  :host([disabled]) .field-label {
    color: var(--compa11y-field-disabled-color, #999);
  }

  .field-required {
    color: var(--compa11y-field-required-color, #ef4444);
    margin-left: 0.125rem;
  }

  .field-hint {
    color: var(--compa11y-field-hint-color, #666);
    font-size: var(--compa11y-field-hint-size, 0.8125rem);
  }

  .field-error {
    color: var(--compa11y-field-error-color, #ef4444);
    font-size: var(--compa11y-field-error-size, 0.8125rem);
  }

  /* Forced colors */
  @media (forced-colors: active) {
    .field-label {
      color: CanvasText;
    }

    :host([disabled]) .field-label {
      color: GrayText;
    }

    .field-error {
      color: LinkText;
    }
  }
`;

export class A11yFormField extends Compa11yElement {
  static get observedAttributes() {
    return ['label', 'hint', 'error', 'required', 'disabled'];
  }

  protected setupAccessibility(): void {
    if (
      typeof process !== 'undefined' &&
      process.env?.NODE_ENV !== 'production'
    ) {
      if (!this.hasAttribute('label')) {
        console.warn(
          '[compa11y/FormField] FormField has no label. Add label="..." attribute.\n' +
            '💡 Suggestion: <a11y-form-field label="Email">...</a11y-form-field>'
        );
      }
    }
  }

  protected render(): void {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }

    const label = this.getAttribute('label') || '';
    const hint = this.getAttribute('hint') || '';
    const error = this.getAttribute('error') || '';
    const isRequired = this.hasAttribute('required');
    const hasError = Boolean(error);

    const labelId = `${this._id}-label`;
    const hintId = `${this._id}-hint`;
    const errorId = `${this._id}-error`;

    this.setAttribute('data-error', hasError ? 'true' : 'false');

    this.shadowRoot!.innerHTML = `
      <style>${FORM_FIELD_STYLES}</style>
      <div class="field-wrapper" part="wrapper">
        ${
          label
            ? `<label
                class="field-label"
                id="${labelId}"
                part="label"
              >${label}${
                isRequired
                  ? '<span class="field-required" aria-hidden="true" part="required">*</span>'
                  : ''
              }</label>`
            : ''
        }
        <slot></slot>
        ${
          hint
            ? `<div class="field-hint" id="${hintId}" part="hint">${hint}</div>`
            : ''
        }
        ${
          hasError
            ? `<div class="field-error" id="${errorId}" role="alert" part="error">${error}</div>`
            : ''
        }
      </div>
    `;

    // Wire up ARIA on slotted control
    this.wireControl();
  }

  protected setupEventListeners(): void {
    // Listen for slot changes to rewire ARIA on dynamic content
    const slot = this.shadowRoot?.querySelector('slot');
    slot?.addEventListener('slotchange', () => this.wireControl());
  }

  protected cleanupEventListeners(): void {
    const slot = this.shadowRoot?.querySelector('slot');
    slot?.removeEventListener('slotchange', () => this.wireControl());
  }

  /**
   * Find the first focusable control in the slot and wire ARIA attributes.
   */
  private wireControl(): void {
    const slot = this.shadowRoot?.querySelector('slot');
    if (!slot) return;

    const assigned = (slot as HTMLSlotElement).assignedElements({ flatten: true });
    // Find the first input, select, textarea, or element with role
    const control = assigned.find(
      (el) =>
        el instanceof HTMLInputElement ||
        el instanceof HTMLSelectElement ||
        el instanceof HTMLTextAreaElement ||
        el.hasAttribute('role') ||
        el.hasAttribute('tabindex')
    ) || assigned[0];

    if (!control) return;

    const label = this.getAttribute('label') || '';
    const hint = this.getAttribute('hint') || '';
    const error = this.getAttribute('error') || '';
    const isRequired = this.hasAttribute('required');
    const isDisabled = this.hasAttribute('disabled');
    const hasError = Boolean(error);

    const labelId = `${this._id}-label`;
    const hintId = `${this._id}-hint`;
    const errorId = `${this._id}-error`;

    // Wire aria-labelledby (only if we have a label)
    if (label && !control.hasAttribute('aria-label')) {
      control.setAttribute('aria-labelledby', labelId);
    }

    // Wire aria-describedby
    const describedBy: string[] = [];
    if (hint) describedBy.push(hintId);
    if (hasError) describedBy.push(errorId);
    if (describedBy.length) {
      control.setAttribute('aria-describedby', describedBy.join(' '));
    } else {
      control.removeAttribute('aria-describedby');
    }

    // Wire aria-invalid
    if (hasError) {
      control.setAttribute('aria-invalid', 'true');
    } else {
      control.removeAttribute('aria-invalid');
    }

    // Wire aria-required
    if (isRequired) {
      control.setAttribute('aria-required', 'true');
    } else {
      control.removeAttribute('aria-required');
    }

    // Wire disabled
    if (isDisabled) {
      if ('disabled' in control) {
        (control as HTMLInputElement).disabled = true;
      }
      control.setAttribute('aria-disabled', 'true');
    } else {
      if ('disabled' in control) {
        (control as HTMLInputElement).disabled = false;
      }
      control.removeAttribute('aria-disabled');
    }
  }

  protected onAttributeChange(
    name: string,
    _oldValue: string | null,
    _newValue: string | null
  ): void {
    if (['label', 'hint', 'error', 'required', 'disabled'].includes(name)) {
      this.render();
      this.setupEventListeners();
    }
  }
}

defineElement('a11y-form-field', A11yFormField);
