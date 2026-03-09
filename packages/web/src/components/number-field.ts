/**
 * compa11y NumberField Web Component
 *
 * An accessible numeric input with optional stepper buttons, on-blur formatting,
 * and built-in min/max validation. Implements role="spinbutton" semantics.
 *
 * Basic:
 * <compa11y-number-field label="Quantity" min="1" max="10" step="1"></compa11y-number-field>
 *
 * With steppers:
 * <compa11y-number-field label="Guests" show-steppers min="1" max="12"></compa11y-number-field>
 *
 * With hint and error:
 * <compa11y-number-field
 *   label="Budget"
 *   hint="Enter an amount in USD"
 *   error="Amount must be at least 1"
 *   min="1"
 *   step="0.01"
 * ></compa11y-number-field>
 *
 * Events:
 *   compa11y-number-field-change   { value: number | undefined }
 *   compa11y-number-field-input    { rawValue: string }
 *
 * CSS vars:
 *   --compa11y-number-field-input-bg, --compa11y-number-field-input-border
 *   --compa11y-number-field-input-border-focus, --compa11y-number-field-input-border-error
 *   --compa11y-number-field-input-radius, --compa11y-number-field-input-padding
 *   --compa11y-number-field-stepper-bg, --compa11y-number-field-stepper-color
 *   --compa11y-number-field-hint-color, --compa11y-number-field-error-color
 *   --compa11y-focus-color
 */

import { announceAssertive, createComponentWarnings } from '@compa11y/core';
import { Compa11yElement, defineElement } from '../utils/base-element';
import { NUMBER_FIELD_STYLES } from '../utils/styles';

const warn = createComponentWarnings('NumberField');

// =============================================================================
// Helpers
// =============================================================================

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(Math.max(v, lo), hi);
}

function snapToStep(v: number, min: number, step: number): number {
  if (step <= 0) return v;
  return Math.round((v - min) / step) * step + min;
}

function parseNumber(s: string): number | undefined {
  const cleaned = s.replace(/[^\d.\-]/g, '');
  if (cleaned === '' || cleaned === '-') return undefined;
  const n = parseFloat(cleaned);
  return isNaN(n) ? undefined : n;
}

// =============================================================================
// Component
// =============================================================================

export class Compa11yNumberField extends Compa11yElement {
  // ── Internal state ──────────────────────────────────────────────────────────
  private _value: number | undefined = undefined;
  private _min: number | undefined = undefined;
  private _max: number | undefined = undefined;
  private _step = 1;
  private _largeStep = 10;
  private _disabled = false;
  private _readOnly = false;
  private _required = false;
  private _showSteppers = false;
  private _isFocused = false;

  private _hasLabelSlot = false;

  // ── DOM refs ────────────────────────────────────────────────────────────────
  private _inputEl: HTMLInputElement | null = null;
  private _decBtn: HTMLButtonElement | null = null;
  private _incBtn: HTMLButtonElement | null = null;
  private _hintEl: HTMLElement | null = null;
  private _errorEl: HTMLElement | null = null;
  private _labelEl: HTMLLabelElement | null = null;

  static get observedAttributes(): string[] {
    return [
      'label',
      'hint',
      'error',
      'value',
      'min',
      'max',
      'step',
      'large-step',
      'disabled',
      'readonly',
      'required',
      'show-steppers',
      'placeholder',
      'name',
      'aria-label',
      'aria-labelledby',
    ];
  }

  // ── Public getters / setters ────────────────────────────────────────────────

  get value(): number | undefined {
    return this._value;
  }
  set value(v: number | undefined) {
    this._value = v;
    if (v !== undefined) {
      this.setAttribute('value', String(v));
    } else {
      this.removeAttribute('value');
    }
    this.syncInput();
  }

  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(v: boolean) {
    this._disabled = Boolean(v);
    this.toggleAttribute('disabled', this._disabled);
    this.syncDisabled();
  }

  get readOnly(): boolean {
    return this._readOnly;
  }
  set readOnly(v: boolean) {
    this._readOnly = Boolean(v);
    this.toggleAttribute('readonly', this._readOnly);
    if (this._inputEl) {
      this._inputEl.readOnly = this._readOnly;
    }
  }

  get required(): boolean {
    return this._required;
  }
  set required(v: boolean) {
    this._required = Boolean(v);
    this.toggleAttribute('required', this._required);
    if (this._inputEl) {
      if (this._required) {
        this._inputEl.setAttribute('aria-required', 'true');
      } else {
        this._inputEl.removeAttribute('aria-required');
      }
    }
  }

  // ── Lifecycle ───────────────────────────────────────────────────────────────

  protected setupAccessibility(): void {
    const minAttr = this.getAttribute('min');
    const maxAttr = this.getAttribute('max');
    const valueAttr = this.getAttribute('value');

    this._min = minAttr !== null ? parseFloat(minAttr) : undefined;
    this._max = maxAttr !== null ? parseFloat(maxAttr) : undefined;
    this._step = parseFloat(this.getAttribute('step') ?? '1') || 1;
    this._largeStep =
      parseFloat(this.getAttribute('large-step') ?? '0') || this._step * 10;
    this._disabled = this.hasAttribute('disabled');
    this._readOnly = this.hasAttribute('readonly');
    this._required = this.hasAttribute('required');
    this._showSteppers = this.hasAttribute('show-steppers');

    if (valueAttr !== null) {
      const n = parseFloat(valueAttr);
      this._value = isNaN(n) ? undefined : n;
    }

    // Check for slotted label content
    const slottedLabel = this.querySelector('[slot="label"]');
    this._hasLabelSlot = Boolean(slottedLabel);

    // Dev warnings
    if (process.env.NODE_ENV !== 'production') {
      const hasLabel =
        this.hasAttribute('label') ||
        this.hasAttribute('aria-label') ||
        this.hasAttribute('aria-labelledby') ||
        this._hasLabelSlot;
      if (!hasLabel) {
        warn.error(
          'compa11y-number-field requires an accessible label.',
          'Add a label, aria-label, aria-labelledby attribute, or use <span slot="label">...</span>.',
        );
      }
      if (
        this._min !== undefined &&
        this._max !== undefined &&
        this._min >= this._max
      ) {
        warn.error(
          `NumberField min (${this._min}) must be less than max (${this._max}).`,
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

    const label = this.getAttribute('label') ?? '';
    const hint = this.getAttribute('hint') ?? '';
    const error = this.getAttribute('error') ?? '';
    const placeholder = this.getAttribute('placeholder') ?? '';
    const name = this.getAttribute('name') ?? '';
    const ariaLabel = this.getAttribute('aria-label') ?? '';
    const ariaLabelledBy = this.getAttribute('aria-labelledby') ?? '';
    const hasError = Boolean(error);

    // inputMode: numeric for integer steps, decimal for fractional
    const inputMode = this._step % 1 === 0 ? 'numeric' : 'decimal';

    // Build aria-describedby
    const describedParts: string[] = [];
    if (hint) describedParts.push(hintId);
    if (hasError) describedParts.push(errorId);
    const ariaDescribedBy = describedParts.length
      ? `aria-describedby="${describedParts.join(' ')}"`
      : '';

    // Label / aria wiring — always wire aria-labelledby to the label element
    // (which contains the slot) unless an explicit aria-label/aria-labelledby is provided
    const ariaLabelAttr = !label && ariaLabel ? `aria-label="${ariaLabel}"` : '';
    const ariaLabelledByAttr = ariaLabelledBy
      ? `aria-labelledby="${ariaLabelledBy}"`
      : !ariaLabel
        ? `aria-labelledby="${labelId}"`
        : '';

    const displayValue =
      this._value !== undefined ? String(this._value) : '';

    const decDisabled =
      this._disabled ||
      (this._min !== undefined && this._value !== undefined && this._value <= this._min);
    const incDisabled =
      this._disabled ||
      (this._max !== undefined && this._value !== undefined && this._value >= this._max);

    if (hasError) {
      this.setAttribute('data-error', '');
    } else {
      this.removeAttribute('data-error');
    }

    shadow.innerHTML = `
      <style>${NUMBER_FIELD_STYLES}</style>

      <!-- Visually hidden live region, always in DOM -->
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;"
      ></div>

      <div class="number-field-wrapper" part="wrapper">
        <label id="${labelId}" for="${fieldId}" class="number-field-label" part="label" data-compa11y-number-field-label ${!label ? 'hidden' : ''}>
          <slot name="label">${label}</slot>${
            this._required
              ? `<span class="number-field-required" aria-hidden="true" part="required">*</span>`
              : ''
          }
        </label>

        <div class="number-field-control" part="control">
          ${
            this._showSteppers
              ? `<button
                  type="button"
                  class="number-field-dec"
                  part="dec"
                  aria-label="Decrease"
                  ${decDisabled ? 'disabled' : ''}
                >−</button>`
              : ''
          }

          <input
            id="${fieldId}"
            type="text"
            inputmode="${inputMode}"
            role="spinbutton"
            class="number-field-input"
            part="input"
            value="${displayValue}"
            ${placeholder ? `placeholder="${placeholder}"` : ''}
            ${name ? `name="${name}"` : ''}
            ${ariaLabelAttr}
            ${ariaLabelledByAttr}
            ${ariaDescribedBy}
            ${this._min !== undefined ? `aria-valuemin="${this._min}"` : ''}
            ${this._max !== undefined ? `aria-valuemax="${this._max}"` : ''}
            ${this._value !== undefined ? `aria-valuenow="${this._value}"` : ''}
            ${hasError ? 'aria-invalid="true"' : ''}
            ${this._required ? 'aria-required="true"' : ''}
            ${this._disabled ? 'disabled' : ''}
            ${this._readOnly ? 'readonly' : ''}
          />

          ${
            this._showSteppers
              ? `<button
                  type="button"
                  class="number-field-inc"
                  part="inc"
                  aria-label="Increase"
                  ${incDisabled ? 'disabled' : ''}
                >+</button>`
              : ''
          }
        </div>

        ${
          hint
            ? `<div id="${hintId}" class="number-field-hint" part="hint"><slot name="hint">${hint}</slot></div>`
            : ''
        }

        ${
          hasError
            ? `<div id="${errorId}" class="number-field-error" role="alert" part="error"><slot name="error">${error}</slot></div>`
            : ''
        }
      </div>
    `;

    // Cache DOM refs
    this._inputEl = shadow.querySelector('.number-field-input');
    this._decBtn = shadow.querySelector('.number-field-dec');
    this._incBtn = shadow.querySelector('.number-field-inc');
    this._labelEl = shadow.querySelector('.number-field-label');
    this._hintEl = shadow.querySelector('.number-field-hint');
    this._errorEl = shadow.querySelector('.number-field-error');
  }

  protected setupEventListeners(): void {
    this._inputEl?.addEventListener('input', this.handleInput as EventListener);
    this._inputEl?.addEventListener('keydown', this.handleKeyDown as EventListener);
    this._inputEl?.addEventListener('focus', this.handleFocus as EventListener);
    this._inputEl?.addEventListener('blur', this.handleBlur as EventListener);
    this._decBtn?.addEventListener('click', this.handleDec as EventListener);
    this._incBtn?.addEventListener('click', this.handleInc as EventListener);

    // Show/hide label when slot content changes
    const labelSlot = this.shadowRoot?.querySelector('slot[name="label"]');
    labelSlot?.addEventListener('slotchange', this.handleLabelSlotChange);
  }

  protected cleanupEventListeners(): void {
    this._inputEl?.removeEventListener('input', this.handleInput as EventListener);
    this._inputEl?.removeEventListener('keydown', this.handleKeyDown as EventListener);
    this._inputEl?.removeEventListener('focus', this.handleFocus as EventListener);
    this._inputEl?.removeEventListener('blur', this.handleBlur as EventListener);
    this._decBtn?.removeEventListener('click', this.handleDec as EventListener);
    this._incBtn?.removeEventListener('click', this.handleInc as EventListener);

    const labelSlot = this.shadowRoot?.querySelector('slot[name="label"]');
    labelSlot?.removeEventListener('slotchange', this.handleLabelSlotChange);
  }

  protected onAttributeChange(
    name: string,
    _old: string | null,
    next: string | null,
  ): void {
    switch (name) {
      case 'value': {
        const n = next !== null ? parseFloat(next) : NaN;
        this._value = isNaN(n) ? undefined : n;
        if (!this._isFocused) this.syncInput();
        break;
      }
      case 'min': {
        const n = next !== null ? parseFloat(next) : NaN;
        this._min = isNaN(n) ? undefined : n;
        this._inputEl?.setAttribute('aria-valuemin', String(this._min ?? ''));
        this.syncStepperState();
        break;
      }
      case 'max': {
        const n = next !== null ? parseFloat(next) : NaN;
        this._max = isNaN(n) ? undefined : n;
        this._inputEl?.setAttribute('aria-valuemax', String(this._max ?? ''));
        this.syncStepperState();
        break;
      }
      case 'step': {
        const n = next !== null ? parseFloat(next) : NaN;
        this._step = isNaN(n) || n <= 0 ? 1 : n;
        break;
      }
      case 'large-step': {
        const n = next !== null ? parseFloat(next) : NaN;
        this._largeStep = isNaN(n) || n <= 0 ? this._step * 10 : n;
        break;
      }
      case 'disabled':
        this._disabled = next !== null;
        this.syncDisabled();
        break;
      case 'readonly':
        this._readOnly = next !== null;
        if (this._inputEl) this._inputEl.readOnly = this._readOnly;
        break;
      case 'required':
        this._required = next !== null;
        if (this._inputEl) {
          if (this._required) {
            this._inputEl.setAttribute('aria-required', 'true');
          } else {
            this._inputEl.removeAttribute('aria-required');
          }
        }
        this.updateRequiredIndicator(this._required);
        break;
      case 'hint':
        this.updateHint(next ?? '');
        break;
      case 'error':
        this.updateError(next ?? '');
        break;
      case 'label':
      case 'aria-label':
      case 'aria-labelledby':
        // Structural change — re-render
        if (this.shadowRoot) {
          this.cleanupEventListeners();
          this.shadowRoot.innerHTML = '';
          this.render();
          this.setupEventListeners();
        }
        break;
    }
  }

  // ── Event handlers ─────────────────────────────────────────────────────────

  private handleLabelSlotChange = (event: Event): void => {
    const slot = event.target as HTMLSlotElement;
    const assigned = slot.assignedNodes({ flatten: true });
    const hasContent = assigned.some(
      (node) => node.nodeType === Node.ELEMENT_NODE || (node.textContent?.trim() ?? '') !== ''
    );
    const labelEl = this.shadowRoot?.querySelector('.number-field-label');
    if (labelEl) {
      if (hasContent) {
        labelEl.removeAttribute('hidden');
      } else if (!this.getAttribute('label')) {
        labelEl.setAttribute('hidden', '');
      }
    }
  };

  private handleInput = (e: Event): void => {
    const input = e.target as HTMLInputElement;
    this.emit('compa11y-number-field-input', { rawValue: input.value });
  };

  private handleFocus = (): void => {
    this._isFocused = true;
    // Show raw value while editing
    if (this._inputEl && this._value !== undefined) {
      this._inputEl.value = String(this._value);
    }
  };

  private handleBlur = (): void => {
    this._isFocused = false;
    if (!this._inputEl) return;

    const rawValue = this._inputEl.value.trim();

    // Empty field
    if (rawValue === '') {
      this._value = undefined;
      this._inputEl.removeAttribute('aria-valuenow');
      this.removeAttribute('value');
      this.emit('compa11y-number-field-change', { value: undefined });
      this.syncStepperState();
      return;
    }

    const parsed = parseNumber(rawValue);
    if (parsed === undefined) {
      // Non-numeric — announce error, restore previous value
      const msg = 'Enter a valid number.';
      announceAssertive(msg);
      if (!this.hasAttribute('error')) {
        this.updateError(msg);
      }
      this._inputEl.value = this._value !== undefined ? String(this._value) : '';
      return;
    }

    // Validate against min / max
    let next = parsed;
    let errorMsg = '';

    if (this._min !== undefined && next < this._min) {
      errorMsg =
        this._max !== undefined
          ? `Enter a number between ${this._min} and ${this._max}.`
          : `Enter a number of ${this._min} or more.`;
      next = clamp(next, this._min, this._max ?? next);
    } else if (this._max !== undefined && next > this._max) {
      errorMsg =
        this._min !== undefined
          ? `Enter a number between ${this._min} and ${this._max}.`
          : `Enter a number of ${this._max} or less.`;
      next = clamp(next, this._min ?? next, this._max);
    } else {
      // Snap to step
      next = this._min !== undefined ? snapToStep(next, this._min, this._step) : next;
    }

    if (errorMsg) {
      announceAssertive(errorMsg);
      // Show error only if no external error is set
      if (!this.hasAttribute('error')) {
        this.updateError(errorMsg);
      }
    } else {
      // Clear internal error (leave external error alone)
      if (!this.hasAttribute('error')) {
        this.updateError('');
      }
    }

    this._value = next;
    this._inputEl.value = String(next);
    this._inputEl.setAttribute('aria-valuenow', String(next));
    this.setAttribute('value', String(next));
    this.syncStepperState();
    this.emit('compa11y-number-field-change', { value: next });
  };

  private handleKeyDown = (e: KeyboardEvent): void => {
    if (this._disabled || this._readOnly) return;
    const current = this._value ?? this._min ?? 0;

    const adjust = (target: number): void => {
      e.preventDefault();
      this.commitValue(target);
    };

    switch (e.key) {
      case 'ArrowUp':   return adjust(current + this._step);
      case 'ArrowDown': return adjust(current - this._step);
      case 'PageUp':    return adjust(current + this._largeStep);
      case 'PageDown':  return adjust(current - this._largeStep);
      case 'Home':
        if (this._min !== undefined) adjust(this._min);
        return;
      case 'End':
        if (this._max !== undefined) adjust(this._max);
        return;
      case 'Enter': {
        if (!this._inputEl) return;
        const parsed = parseNumber(this._inputEl.value);
        if (parsed !== undefined) adjust(parsed);
        return;
      }
    }
  };

  private handleDec = (): void => {
    if (this._disabled || this._readOnly) return;
    const current = this._value ?? this._min ?? 0;
    this.commitValue(current - this._step);
  };

  private handleInc = (): void => {
    if (this._disabled || this._readOnly) return;
    const current = this._value ?? this._min ?? 0;
    this.commitValue(current + this._step);
  };

  // ── Value commit ───────────────────────────────────────────────────────────

  private commitValue(target: number): void {
    const stepped =
      this._min !== undefined ? snapToStep(target, this._min, this._step) : target;
    const next = clamp(stepped, this._min ?? -Infinity, this._max ?? Infinity);
    this._value = next;

    if (this._inputEl) {
      this._inputEl.value = String(next);
      this._inputEl.setAttribute('aria-valuenow', String(next));
    }
    this.setAttribute('value', String(next));
    this.syncStepperState();

    // Clear internal validation error on programmatic set
    if (!this.hasAttribute('error')) this.updateError('');

    this.emit('compa11y-number-field-change', { value: next });
  }

  // ── DOM sync helpers ───────────────────────────────────────────────────────

  private syncInput(): void {
    if (!this._inputEl) return;
    this._inputEl.value = this._value !== undefined ? String(this._value) : '';
    if (this._value !== undefined) {
      this._inputEl.setAttribute('aria-valuenow', String(this._value));
    } else {
      this._inputEl.removeAttribute('aria-valuenow');
    }
    this.syncStepperState();
  }

  private syncDisabled(): void {
    if (this._inputEl) {
      if (this._disabled) {
        this._inputEl.setAttribute('disabled', '');
        this._inputEl.setAttribute('aria-disabled', 'true');
      } else {
        this._inputEl.removeAttribute('disabled');
        this._inputEl.removeAttribute('aria-disabled');
      }
    }
    this.syncStepperState();
  }

  private syncStepperState(): void {
    if (this._decBtn) {
      const decDisabled =
        this._disabled ||
        (this._min !== undefined &&
          this._value !== undefined &&
          this._value <= this._min);
      if (decDisabled) {
        this._decBtn.setAttribute('disabled', '');
      } else {
        this._decBtn.removeAttribute('disabled');
      }
    }
    if (this._incBtn) {
      const incDisabled =
        this._disabled ||
        (this._max !== undefined &&
          this._value !== undefined &&
          this._value >= this._max);
      if (incDisabled) {
        this._incBtn.setAttribute('disabled', '');
      } else {
        this._incBtn.removeAttribute('disabled');
      }
    }
  }

  private updateError(error: string): void {
    const hasError = Boolean(error);

    if (hasError) {
      this.setAttribute('data-error', '');
    } else {
      this.removeAttribute('data-error');
    }

    if (this._inputEl) {
      if (hasError) {
        this._inputEl.setAttribute('aria-invalid', 'true');
      } else {
        this._inputEl.removeAttribute('aria-invalid');
      }
    }

    if (hasError) {
      if (this._errorEl) {
        this._errorEl.textContent = error;
      } else {
        const errorId = `${this._id}-error`;
        const div = document.createElement('div');
        div.id = errorId;
        div.className = 'number-field-error';
        div.setAttribute('role', 'alert');
        div.setAttribute('part', 'error');
        div.textContent = error;
        this.shadowRoot?.querySelector('.number-field-wrapper')?.appendChild(div);
        this._errorEl = div;
      }
    } else if (this._errorEl) {
      this._errorEl.remove();
      this._errorEl = null;
    }

    this.updateAriaDescribedBy();
  }

  private updateHint(hint: string): void {
    if (hint) {
      if (this._hintEl) {
        this._hintEl.textContent = hint;
      } else {
        const hintId = `${this._id}-hint`;
        const div = document.createElement('div');
        div.id = hintId;
        div.className = 'number-field-hint';
        div.setAttribute('part', 'hint');
        div.textContent = hint;
        const wrapper = this.shadowRoot?.querySelector('.number-field-wrapper');
        if (this._errorEl) {
          wrapper?.insertBefore(div, this._errorEl);
        } else {
          wrapper?.appendChild(div);
        }
        this._hintEl = div;
      }
    } else if (this._hintEl) {
      this._hintEl.remove();
      this._hintEl = null;
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
    const existing = this._labelEl.querySelector('.number-field-required');
    if (isRequired && !existing) {
      const span = document.createElement('span');
      span.className = 'number-field-required';
      span.setAttribute('aria-hidden', 'true');
      span.setAttribute('part', 'required');
      span.textContent = '*';
      this._labelEl.appendChild(span);
    } else if (!isRequired && existing) {
      existing.remove();
    }
  }

  // ── Public methods ─────────────────────────────────────────────────────────

  /** Focus the inner input element. */
  public focus(): void {
    this._inputEl?.focus();
  }

  /** Blur the inner input element. */
  public blur(): void {
    this._inputEl?.blur();
  }
}

defineElement('compa11y-number-field', Compa11yNumberField);

export default Compa11yNumberField;
