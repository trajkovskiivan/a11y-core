/**
 * compa11y Input Web Component
 *
 * A foundational accessible input with label, hint, and error support.
 *
 * @example
 * ```html
 * <compa11y-input
 *   label="Full Name"
 *   hint="Enter your first and last name"
 *   required
 *   placeholder="John Doe"
 *   type="text"
 * ></compa11y-input>
 *
 * <!-- With error -->
 * <compa11y-input
 *   label="Email"
 *   error="Please enter a valid email"
 *   type="email"
 * ></compa11y-input>
 *
 * <!-- Disabled -->
 * <compa11y-input label="Organization" value="Compa11y Inc." disabled></compa11y-input>
 * ```
 *
 * @fires input - Emitted on each keystroke, detail: { value: string }
 * @fires change - Emitted on blur after value changes, detail: { value: string }
 * @fires a11y-input-focus - Emitted when input gains focus
 * @fires a11y-input-blur - Emitted when input loses focus
 *
 * @attr {string} label - Visible label text
 * @attr {string} hint - Hint/description text
 * @attr {string} error - Error message text
 * @attr {string} type - Input type (text, email, password, number, tel, url, search)
 * @attr {string} placeholder - Placeholder text
 * @attr {string} value - Current value
 * @attr {boolean} disabled - Whether the input is disabled
 * @attr {boolean} readonly - Whether the input is read-only
 * @attr {boolean} required - Whether the input is required
 * @attr {string} name - Name for form submission
 *
 * @cssprop --compa11y-input-border - Border style (default: 1px solid #ccc)
 * @cssprop --compa11y-input-border-focus - Border color on focus (default: #0066cc)
 * @cssprop --compa11y-input-border-error - Border color on error (default: #ef4444)
 * @cssprop --compa11y-input-bg - Background color (default: white)
 * @cssprop --compa11y-input-radius - Border radius (default: 4px)
 * @cssprop --compa11y-input-padding - Input padding (default: 0.5rem 0.75rem)
 * @cssprop --compa11y-input-font-size - Font size (default: 0.875rem)
 * @cssprop --compa11y-input-label-color - Label color (default: inherit)
 * @cssprop --compa11y-input-label-size - Label font size (default: 0.875rem)
 * @cssprop --compa11y-input-label-weight - Label font weight (default: 500)
 * @cssprop --compa11y-input-hint-color - Hint text color (default: #666)
 * @cssprop --compa11y-input-error-color - Error text color (default: #ef4444)
 * @cssprop --compa11y-input-required-color - Required asterisk color (default: #ef4444)
 * @cssprop --compa11y-input-disabled-bg - Disabled background (default: #f5f5f5)
 * @cssprop --compa11y-input-placeholder-color - Placeholder color (default: #999)
 * @cssprop --compa11y-focus-color - Focus outline color (default: #0066cc)
 */

import { announceAssertive } from '@compa11y/core';
import { Compa11yElement, defineElement } from '../utils/base-element';
import { INPUT_STYLES } from '../utils/styles';

export class Compa11yInput extends Compa11yElement {
  private _value = '';
  private _inputEl: HTMLInputElement | null = null;
  private _labelEl: HTMLLabelElement | null = null;
  private _hintEl: HTMLElement | null = null;
  private _errorEl: HTMLElement | null = null;

  static get observedAttributes() {
    return [
      'label',
      'hint',
      'error',
      'type',
      'placeholder',
      'value',
      'disabled',
      'readonly',
      'required',
      'name',
      'autocomplete',
      'maxlength',
      'minlength',
      'pattern',
      'inputmode',
      'aria-label',
      'aria-labelledby',
    ];
  }

  // =========================================================================
  // Properties
  // =========================================================================

  get value(): string {
    return this._value;
  }

  set value(v: string) {
    const old = this._value;
    this._value = v;
    if (this._inputEl && this._inputEl.value !== v) {
      this._inputEl.value = v;
    }
    if (v !== old) {
      this.setAttribute('value', v);
    }
  }

  get disabled(): boolean {
    return this.hasAttribute('disabled');
  }

  set disabled(v: boolean) {
    this.toggleAttribute('disabled', v);
  }

  get readOnly(): boolean {
    return this.hasAttribute('readonly');
  }

  set readOnly(v: boolean) {
    this.toggleAttribute('readonly', v);
  }

  get required(): boolean {
    return this.hasAttribute('required');
  }

  set required(v: boolean) {
    this.toggleAttribute('required', v);
  }

  get error(): string {
    return this.getAttribute('error') || '';
  }

  set error(v: string) {
    if (v) {
      this.setAttribute('error', v);
    } else {
      this.removeAttribute('error');
    }
  }

  // =========================================================================
  // Lifecycle
  // =========================================================================

  private _hasLabelSlot = false;

  protected setupAccessibility(): void {
    // Check for slotted label content
    const slottedLabel = this.querySelector('[slot="label"]');
    this._hasLabelSlot = Boolean(slottedLabel);

    if (
      typeof process !== 'undefined' &&
      process.env?.NODE_ENV !== 'production'
    ) {
      const hasLabel =
        this.hasAttribute('label') ||
        this.hasAttribute('aria-label') ||
        this.hasAttribute('aria-labelledby') ||
        this._hasLabelSlot;
      if (!hasLabel) {
        console.warn(
          '[compa11y/Input] Input has no accessible label. Add label="...", aria-label="...", aria-labelledby="...", or use <span slot="label">...</span>.\n' +
            '💡 Suggestion: <compa11y-input label="Full Name"></compa11y-input>'
        );
      }
    }
  }

  protected render(): void {
    const shadow = this.attachShadow({ mode: 'open' });
    const fieldId = `${this._id}-field`;
    const labelId = `${this._id}-label`;
    const hintId = `${this._id}-hint`;
    const errorId = `${this._id}-error`;

    const label = this.getAttribute('label') || '';
    const hint = this.getAttribute('hint') || '';
    const error = this.getAttribute('error') || '';
    const type = this.getAttribute('type') || 'text';
    const placeholder = this.getAttribute('placeholder') || '';
    const name = this.getAttribute('name') || '';
    const autocomplete = this.getAttribute('autocomplete') || '';
    const maxlength = this.getAttribute('maxlength');
    const minlength = this.getAttribute('minlength');
    const pattern = this.getAttribute('pattern');
    const inputmode = this.getAttribute('inputmode');
    const ariaLabel = this.getAttribute('aria-label') || '';
    const ariaLabelledBy = this.getAttribute('aria-labelledby') || '';
    const isDisabled = this.disabled;
    const isReadOnly = this.readOnly;
    const isRequired = this.required;
    const hasError = Boolean(error);

    // Build aria-describedby
    const describedByParts: string[] = [];
    if (hint) describedByParts.push(hintId);
    if (hasError) describedByParts.push(errorId);
    const ariaDescribedBy = describedByParts.length
      ? `aria-describedby="${describedByParts.join(' ')}"`
      : '';

    // Label attributes — always wire aria-labelledby to the label element
    // (which contains the slot) unless an explicit aria-label/aria-labelledby is provided
    const ariaLabelAttr =
      !label && ariaLabel ? `aria-label="${ariaLabel}"` : '';
    const ariaLabelledByAttr =
      ariaLabelledBy
        ? `aria-labelledby="${ariaLabelledBy}"`
        : !ariaLabel
          ? `aria-labelledby="${labelId}"`
          : '';

    // Set data-error on host for CSS
    this.setAttribute('data-error', hasError ? 'true' : 'false');

    shadow.innerHTML = `
      <style>${INPUT_STYLES}</style>
      <div class="input-wrapper" part="wrapper">
        <label id="${labelId}" for="${fieldId}" class="input-label" part="label" data-compa11y-input-label ${!label ? 'hidden' : ''}>
          <slot name="label">${label}</slot>${isRequired ? '<span class="input-required" aria-hidden="true" part="required">*</span>' : ''}
        </label>
        <input
          id="${fieldId}"
          type="${type}"
          value="${this._value}"
          ${placeholder ? `placeholder="${placeholder}"` : ''}
          ${name ? `name="${name}"` : ''}
          ${autocomplete ? `autocomplete="${autocomplete}"` : ''}
          ${maxlength ? `maxlength="${maxlength}"` : ''}
          ${minlength ? `minlength="${minlength}"` : ''}
          ${pattern ? `pattern="${pattern}"` : ''}
          ${inputmode ? `inputmode="${inputmode}"` : ''}
          ${ariaLabelAttr}
          ${ariaLabelledByAttr}
          ${ariaDescribedBy}
          ${hasError ? 'aria-invalid="true"' : ''}
          ${isRequired ? 'aria-required="true"' : ''}
          ${isDisabled ? 'disabled' : ''}
          ${isReadOnly ? 'readonly' : ''}
          part="field"
        />
        ${
          hint
            ? `<div id="${hintId}" class="input-hint" part="hint"><slot name="hint">${hint}</slot></div>`
            : ''
        }
        ${
          hasError
            ? `<div id="${errorId}" class="input-error" role="alert" part="error"><slot name="error">${error}</slot></div>`
            : ''
        }
      </div>
    `;

    // Cache element references
    this._inputEl = shadow.querySelector('input');
    this._labelEl = shadow.querySelector('label');
    this._hintEl = shadow.querySelector('.input-hint');
    this._errorEl = shadow.querySelector('.input-error');

    // Sync value attribute if set
    const attrValue = this.getAttribute('value');
    if (attrValue && this._inputEl) {
      this._value = attrValue;
      this._inputEl.value = attrValue;
    }
  }

  protected setupEventListeners(): void {
    this._inputEl?.addEventListener('input', this.handleInput);
    this._inputEl?.addEventListener('change', this.handleChange);
    this._inputEl?.addEventListener('focus', this.handleFocus);
    this._inputEl?.addEventListener('blur', this.handleBlur);

    // Show/hide label when slot content changes
    const labelSlot = this.shadowRoot?.querySelector('slot[name="label"]');
    labelSlot?.addEventListener('slotchange', this.handleLabelSlotChange);
  }

  protected cleanupEventListeners(): void {
    this._inputEl?.removeEventListener('input', this.handleInput);
    this._inputEl?.removeEventListener('change', this.handleChange);
    this._inputEl?.removeEventListener('focus', this.handleFocus);
    this._inputEl?.removeEventListener('blur', this.handleBlur);

    const labelSlot = this.shadowRoot?.querySelector('slot[name="label"]');
    labelSlot?.removeEventListener('slotchange', this.handleLabelSlotChange);
  }

  protected onAttributeChange(
    name: string,
    _oldValue: string | null,
    newValue: string | null
  ): void {
    switch (name) {
      case 'value':
        this._value = newValue || '';
        if (this._inputEl && this._inputEl.value !== this._value) {
          this._inputEl.value = this._value;
        }
        break;

      case 'error':
        this.updateError(newValue || '');
        break;

      case 'hint':
        this.updateHint(newValue || '');
        break;

      case 'disabled':
        if (this._inputEl) {
          if (newValue !== null) {
            this._inputEl.setAttribute('disabled', '');
          } else {
            this._inputEl.removeAttribute('disabled');
          }
        }
        break;

      case 'readonly':
        if (this._inputEl) {
          if (newValue !== null) {
            this._inputEl.setAttribute('readonly', '');
          } else {
            this._inputEl.removeAttribute('readonly');
          }
        }
        break;

      case 'required':
        if (this._inputEl) {
          if (newValue !== null) {
            this._inputEl.setAttribute('aria-required', 'true');
          } else {
            this._inputEl.removeAttribute('aria-required');
          }
        }
        this.updateRequiredIndicator(newValue !== null);
        break;

      case 'placeholder':
        if (this._inputEl) {
          if (newValue) {
            this._inputEl.setAttribute('placeholder', newValue);
          } else {
            this._inputEl.removeAttribute('placeholder');
          }
        }
        break;

      case 'type':
        if (this._inputEl) {
          this._inputEl.type = newValue || 'text';
        }
        break;

      case 'name':
        if (this._inputEl) {
          if (newValue) {
            this._inputEl.setAttribute('name', newValue);
          } else {
            this._inputEl.removeAttribute('name');
          }
        }
        break;

      case 'autocomplete':
        if (this._inputEl) {
          if (newValue) {
            this._inputEl.setAttribute('autocomplete', newValue);
          } else {
            this._inputEl.removeAttribute('autocomplete');
          }
        }
        break;

      case 'maxlength':
        if (this._inputEl) {
          if (newValue) {
            this._inputEl.setAttribute('maxlength', newValue);
          } else {
            this._inputEl.removeAttribute('maxlength');
          }
        }
        break;

      case 'minlength':
        if (this._inputEl) {
          if (newValue) {
            this._inputEl.setAttribute('minlength', newValue);
          } else {
            this._inputEl.removeAttribute('minlength');
          }
        }
        break;

      case 'pattern':
        if (this._inputEl) {
          if (newValue) {
            this._inputEl.setAttribute('pattern', newValue);
          } else {
            this._inputEl.removeAttribute('pattern');
          }
        }
        break;

      case 'inputmode':
        if (this._inputEl) {
          if (newValue) {
            this._inputEl.setAttribute('inputmode', newValue);
          } else {
            this._inputEl.removeAttribute('inputmode');
          }
        }
        break;

      case 'label':
      case 'aria-label':
      case 'aria-labelledby':
        // Structural change - full re-render needed
        if (this.shadowRoot) {
          this.cleanupEventListeners();
          this.shadowRoot.innerHTML = '';
          this.render();
          this.setupEventListeners();
        }
        break;
    }
  }

  // =========================================================================
  // Event handlers
  // =========================================================================

  private handleLabelSlotChange = (event: Event): void => {
    const slot = event.target as HTMLSlotElement;
    const assigned = slot.assignedNodes({ flatten: true });
    const hasContent = assigned.some(
      (node) => node.nodeType === Node.ELEMENT_NODE || (node.textContent?.trim() ?? '') !== ''
    );
    const labelEl = this.shadowRoot?.querySelector('.input-label');
    if (labelEl) {
      if (hasContent) {
        labelEl.removeAttribute('hidden');
      } else if (!this.getAttribute('label')) {
        labelEl.setAttribute('hidden', '');
      }
    }
  };

  private handleInput = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    this._value = target.value;
    this.emit('input', { value: this._value });
    this.emit('compa11y-input-change', { value: this._value });
  };

  private handleChange = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    this._value = target.value;
    this.emit('change', { value: this._value });
    this.emit('compa11y-input-change', { value: this._value });
  };

  private handleFocus = (): void => {
    this.emit('compa11y-input-focus', { value: this._value });
  };

  private handleBlur = (): void => {
    this.emit('compa11y-input-blur', { value: this._value });
  };

  // =========================================================================
  // DOM update helpers
  // =========================================================================

  private updateError(error: string): void {
    const hasError = Boolean(error);
    this.setAttribute('data-error', hasError ? 'true' : 'false');

    if (this._inputEl) {
      if (hasError) {
        this._inputEl.setAttribute('aria-invalid', 'true');
      } else {
        this._inputEl.removeAttribute('aria-invalid');
      }
    }

    if (hasError) {
      if (this._errorEl) {
        // Update existing error element
        this._errorEl.textContent = error;
      } else {
        // Create error element
        const errorId = `${this._id}-error`;
        const errorDiv = document.createElement('div');
        errorDiv.id = errorId;
        errorDiv.className = 'input-error';
        errorDiv.setAttribute('role', 'alert');
        errorDiv.setAttribute('part', 'error');
        errorDiv.textContent = error;

        const wrapper = this.shadowRoot?.querySelector('.input-wrapper');
        wrapper?.appendChild(errorDiv);
        this._errorEl = errorDiv;

        // Announce the error
        announceAssertive(error);
      }
      this.updateAriaDescribedBy();
    } else {
      if (this._errorEl) {
        this._errorEl.remove();
        this._errorEl = null;
      }
      this.updateAriaDescribedBy();
    }
  }

  private updateHint(hint: string): void {
    if (hint) {
      if (this._hintEl) {
        this._hintEl.textContent = hint;
      } else {
        const hintId = `${this._id}-hint`;
        const hintDiv = document.createElement('div');
        hintDiv.id = hintId;
        hintDiv.className = 'input-hint';
        hintDiv.setAttribute('part', 'hint');
        hintDiv.textContent = hint;

        // Insert before error element if it exists, otherwise append
        const wrapper = this.shadowRoot?.querySelector('.input-wrapper');
        if (this._errorEl) {
          wrapper?.insertBefore(hintDiv, this._errorEl);
        } else {
          wrapper?.appendChild(hintDiv);
        }
        this._hintEl = hintDiv;
      }
    } else {
      if (this._hintEl) {
        this._hintEl.remove();
        this._hintEl = null;
      }
    }
    this.updateAriaDescribedBy();
  }

  private updateAriaDescribedBy(): void {
    if (!this._inputEl) return;

    const parts: string[] = [];
    if (this._hintEl) parts.push(this._hintEl.id);
    if (this._errorEl) parts.push(this._errorEl.id);

    if (parts.length > 0) {
      this._inputEl.setAttribute('aria-describedby', parts.join(' '));
    } else {
      this._inputEl.removeAttribute('aria-describedby');
    }
  }

  private updateRequiredIndicator(isRequired: boolean): void {
    if (!this._labelEl) return;

    const existing = this._labelEl.querySelector('.input-required');
    if (isRequired && !existing) {
      const span = document.createElement('span');
      span.className = 'input-required';
      span.setAttribute('aria-hidden', 'true');
      span.setAttribute('part', 'required');
      span.textContent = '*';
      this._labelEl.appendChild(span);
    } else if (!isRequired && existing) {
      existing.remove();
    }
  }

  // =========================================================================
  // Public methods
  // =========================================================================

  /** Focus the input element */
  public focus(): void {
    this._inputEl?.focus();
  }

  /** Blur the input element */
  public blur(): void {
    this._inputEl?.blur();
  }

  /** Select all text in the input */
  public select(): void {
    this._inputEl?.select();
  }
}

// Register the custom element
defineElement('compa11y-input', Compa11yInput);

export default Compa11yInput;
