/**
 * compa11y Textarea Web Component
 *
 * A foundational accessible textarea with label, hint, and error support.
 *
 * @example
 * ```html
 * <compa11y-textarea
 *   label="Description"
 *   hint="Provide a brief summary"
 *   required
 *   rows="4"
 *   placeholder="Enter description..."
 * ></compa11y-textarea>
 *
 * <!-- With error -->
 * <compa11y-textarea
 *   label="Bio"
 *   error="Bio is required"
 *   rows="5"
 * ></compa11y-textarea>
 *
 * <!-- Disabled -->
 * <compa11y-textarea label="Notes" value="Read only content" disabled></compa11y-textarea>
 * ```
 *
 * @fires input - Emitted on each keystroke, detail: { value: string }
 * @fires change - Emitted on blur after value changes, detail: { value: string }
 * @fires a11y-textarea-focus - Emitted when textarea gains focus
 * @fires a11y-textarea-blur - Emitted when textarea loses focus
 *
 * @attr {string} label - Visible label text
 * @attr {string} hint - Hint/description text
 * @attr {string} error - Error message text
 * @attr {string} rows - Number of visible rows (default: 3)
 * @attr {string} resize - Resize behavior (none, both, horizontal, vertical)
 * @attr {string} placeholder - Placeholder text
 * @attr {string} value - Current value
 * @attr {boolean} disabled - Whether the textarea is disabled
 * @attr {boolean} readonly - Whether the textarea is read-only
 * @attr {boolean} required - Whether the textarea is required
 * @attr {string} name - Name for form submission
 *
 * @cssprop --compa11y-textarea-border - Border style (default: 1px solid #ccc)
 * @cssprop --compa11y-textarea-border-focus - Border color on focus (default: #0066cc)
 * @cssprop --compa11y-textarea-border-error - Border color on error (default: #ef4444)
 * @cssprop --compa11y-textarea-bg - Background color (default: white)
 * @cssprop --compa11y-textarea-radius - Border radius (default: 4px)
 * @cssprop --compa11y-textarea-padding - Textarea padding (default: 0.5rem 0.75rem)
 * @cssprop --compa11y-textarea-font-size - Font size (default: 0.875rem)
 * @cssprop --compa11y-textarea-resize - Resize behavior (default: vertical)
 * @cssprop --compa11y-textarea-label-color - Label color (default: inherit)
 * @cssprop --compa11y-textarea-label-size - Label font size (default: 0.875rem)
 * @cssprop --compa11y-textarea-label-weight - Label font weight (default: 500)
 * @cssprop --compa11y-textarea-hint-color - Hint text color (default: #666)
 * @cssprop --compa11y-textarea-error-color - Error text color (default: #ef4444)
 * @cssprop --compa11y-textarea-required-color - Required asterisk color (default: #ef4444)
 * @cssprop --compa11y-textarea-disabled-bg - Disabled background (default: #f5f5f5)
 * @cssprop --compa11y-textarea-placeholder-color - Placeholder color (default: #999)
 * @cssprop --compa11y-focus-color - Focus outline color (default: #0066cc)
 */

import { announceAssertive } from '@compa11y/core';
import { Compa11yElement, defineElement } from '../utils/base-element';
import { TEXTAREA_STYLES } from '../utils/styles';

export class Compa11yTextarea extends Compa11yElement {
  private _value = '';
  private _textareaEl: HTMLTextAreaElement | null = null;
  private _labelEl: HTMLLabelElement | null = null;
  private _hintEl: HTMLElement | null = null;
  private _errorEl: HTMLElement | null = null;

  static get observedAttributes() {
    return [
      'label',
      'hint',
      'error',
      'rows',
      'resize',
      'placeholder',
      'value',
      'disabled',
      'readonly',
      'required',
      'name',
      'autocomplete',
      'maxlength',
      'minlength',
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
    if (this._textareaEl && this._textareaEl.value !== v) {
      this._textareaEl.value = v;
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

  protected setupAccessibility(): void {
    if (
      typeof process !== 'undefined' &&
      process.env?.NODE_ENV !== 'production'
    ) {
      const hasLabel =
        this.hasAttribute('label') ||
        this.hasAttribute('aria-label') ||
        this.hasAttribute('aria-labelledby');
      if (!hasLabel) {
        console.warn(
          '[compa11y/Textarea] Textarea has no accessible label. Add label="...", aria-label="...", or aria-labelledby="..." attribute.\n' +
            '💡 Suggestion: <compa11y-textarea label="Description"></compa11y-textarea>'
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
    const rows = this.getAttribute('rows') || '3';
    const placeholder = this.getAttribute('placeholder') || '';
    const name = this.getAttribute('name') || '';
    const autocomplete = this.getAttribute('autocomplete') || '';
    const maxlength = this.getAttribute('maxlength');
    const minlength = this.getAttribute('minlength');
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

    // Label attributes
    const ariaLabelAttr =
      !label && ariaLabel ? `aria-label="${ariaLabel}"` : '';
    const ariaLabelledByAttr =
      !label && ariaLabelledBy
        ? `aria-labelledby="${ariaLabelledBy}"`
        : label
          ? `aria-labelledby="${labelId}"`
          : '';

    // Set data-error on host for CSS
    this.setAttribute('data-error', hasError ? 'true' : 'false');

    shadow.innerHTML = `
      <style>${TEXTAREA_STYLES}</style>
      <div class="textarea-wrapper" part="wrapper">
        ${
          label
            ? `<label id="${labelId}" for="${fieldId}" class="textarea-label" part="label">
                ${label}${isRequired ? '<span class="textarea-required" aria-hidden="true" part="required">*</span>' : ''}
              </label>`
            : ''
        }
        <textarea
          id="${fieldId}"
          rows="${rows}"
          ${placeholder ? `placeholder="${placeholder}"` : ''}
          ${name ? `name="${name}"` : ''}
          ${autocomplete ? `autocomplete="${autocomplete}"` : ''}
          ${maxlength ? `maxlength="${maxlength}"` : ''}
          ${minlength ? `minlength="${minlength}"` : ''}
          ${ariaLabelAttr}
          ${ariaLabelledByAttr}
          ${ariaDescribedBy}
          ${hasError ? 'aria-invalid="true"' : ''}
          ${isRequired ? 'aria-required="true"' : ''}
          ${isDisabled ? 'disabled' : ''}
          ${isReadOnly ? 'readonly' : ''}
          part="field"
        >${this._value}</textarea>
        ${
          hint
            ? `<div id="${hintId}" class="textarea-hint" part="hint">${hint}</div>`
            : ''
        }
        ${
          hasError
            ? `<div id="${errorId}" class="textarea-error" role="alert" part="error">${error}</div>`
            : ''
        }
      </div>
    `;

    // Cache element references
    this._textareaEl = shadow.querySelector('textarea');
    this._labelEl = shadow.querySelector('label');
    this._hintEl = shadow.querySelector('.textarea-hint');
    this._errorEl = shadow.querySelector('.textarea-error');

    // Sync value attribute if set
    const attrValue = this.getAttribute('value');
    if (attrValue && this._textareaEl) {
      this._value = attrValue;
      this._textareaEl.value = attrValue;
    }
  }

  protected setupEventListeners(): void {
    this._textareaEl?.addEventListener('input', this.handleInput);
    this._textareaEl?.addEventListener('change', this.handleChange);
    this._textareaEl?.addEventListener('focus', this.handleFocus);
    this._textareaEl?.addEventListener('blur', this.handleBlur);
  }

  protected cleanupEventListeners(): void {
    this._textareaEl?.removeEventListener('input', this.handleInput);
    this._textareaEl?.removeEventListener('change', this.handleChange);
    this._textareaEl?.removeEventListener('focus', this.handleFocus);
    this._textareaEl?.removeEventListener('blur', this.handleBlur);
  }

  protected onAttributeChange(
    name: string,
    _oldValue: string | null,
    newValue: string | null
  ): void {
    switch (name) {
      case 'value':
        this._value = newValue || '';
        if (this._textareaEl && this._textareaEl.value !== this._value) {
          this._textareaEl.value = this._value;
        }
        break;

      case 'error':
        this.updateError(newValue || '');
        break;

      case 'hint':
        this.updateHint(newValue || '');
        break;

      case 'disabled':
        if (this._textareaEl) {
          if (newValue !== null) {
            this._textareaEl.setAttribute('disabled', '');
          } else {
            this._textareaEl.removeAttribute('disabled');
          }
        }
        break;

      case 'readonly':
        if (this._textareaEl) {
          if (newValue !== null) {
            this._textareaEl.setAttribute('readonly', '');
          } else {
            this._textareaEl.removeAttribute('readonly');
          }
        }
        break;

      case 'required':
        if (this._textareaEl) {
          if (newValue !== null) {
            this._textareaEl.setAttribute('aria-required', 'true');
          } else {
            this._textareaEl.removeAttribute('aria-required');
          }
        }
        this.updateRequiredIndicator(newValue !== null);
        break;

      case 'placeholder':
        if (this._textareaEl) {
          if (newValue) {
            this._textareaEl.setAttribute('placeholder', newValue);
          } else {
            this._textareaEl.removeAttribute('placeholder');
          }
        }
        break;

      case 'rows':
        if (this._textareaEl) {
          this._textareaEl.rows = parseInt(newValue || '3', 10);
        }
        break;

      case 'name':
        if (this._textareaEl) {
          if (newValue) {
            this._textareaEl.setAttribute('name', newValue);
          } else {
            this._textareaEl.removeAttribute('name');
          }
        }
        break;

      case 'autocomplete':
        if (this._textareaEl) {
          if (newValue) {
            this._textareaEl.setAttribute('autocomplete', newValue);
          } else {
            this._textareaEl.removeAttribute('autocomplete');
          }
        }
        break;

      case 'maxlength':
        if (this._textareaEl) {
          if (newValue) {
            this._textareaEl.setAttribute('maxlength', newValue);
          } else {
            this._textareaEl.removeAttribute('maxlength');
          }
        }
        break;

      case 'minlength':
        if (this._textareaEl) {
          if (newValue) {
            this._textareaEl.setAttribute('minlength', newValue);
          } else {
            this._textareaEl.removeAttribute('minlength');
          }
        }
        break;

      case 'resize':
        // Handled via CSS custom property on :host, but we can also
        // set it inline if the textarea element exists
        if (this._textareaEl) {
          this._textareaEl.style.resize = newValue || 'vertical';
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

  private handleInput = (event: Event): void => {
    const target = event.target as HTMLTextAreaElement;
    this._value = target.value;
    this.emit('input', { value: this._value });
  };

  private handleChange = (event: Event): void => {
    const target = event.target as HTMLTextAreaElement;
    this._value = target.value;
    this.emit('change', { value: this._value });
  };

  private handleFocus = (): void => {
    this.emit('compa11y-textarea-focus');
  };

  private handleBlur = (): void => {
    this.emit('compa11y-textarea-blur');
  };

  // =========================================================================
  // DOM update helpers
  // =========================================================================

  private updateError(error: string): void {
    const hasError = Boolean(error);
    this.setAttribute('data-error', hasError ? 'true' : 'false');

    if (this._textareaEl) {
      if (hasError) {
        this._textareaEl.setAttribute('aria-invalid', 'true');
      } else {
        this._textareaEl.removeAttribute('aria-invalid');
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
        errorDiv.className = 'textarea-error';
        errorDiv.setAttribute('role', 'alert');
        errorDiv.setAttribute('part', 'error');
        errorDiv.textContent = error;

        const wrapper = this.shadowRoot?.querySelector('.textarea-wrapper');
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
        hintDiv.className = 'textarea-hint';
        hintDiv.setAttribute('part', 'hint');
        hintDiv.textContent = hint;

        // Insert before error element if it exists, otherwise append
        const wrapper = this.shadowRoot?.querySelector('.textarea-wrapper');
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
    if (!this._textareaEl) return;

    const parts: string[] = [];
    if (this._hintEl) parts.push(this._hintEl.id);
    if (this._errorEl) parts.push(this._errorEl.id);

    if (parts.length > 0) {
      this._textareaEl.setAttribute('aria-describedby', parts.join(' '));
    } else {
      this._textareaEl.removeAttribute('aria-describedby');
    }
  }

  private updateRequiredIndicator(isRequired: boolean): void {
    if (!this._labelEl) return;

    const existing = this._labelEl.querySelector('.textarea-required');
    if (isRequired && !existing) {
      const span = document.createElement('span');
      span.className = 'textarea-required';
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

  /** Focus the textarea element */
  public focus(): void {
    this._textareaEl?.focus();
  }

  /** Blur the textarea element */
  public blur(): void {
    this._textareaEl?.blur();
  }

  /** Select all text in the textarea */
  public select(): void {
    this._textareaEl?.select();
  }
}

// Register the custom element
defineElement('compa11y-textarea', Compa11yTextarea);

export default Compa11yTextarea;
