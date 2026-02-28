/**
 * A11y RadioGroup + Radio Web Components
 *
 * Accessible radio group custom elements with full keyboard support,
 * roving tabindex, and selection-follows-focus behavior.
 * Follows WAI-ARIA Radio Group pattern.
 *
 * @example
 * ```html
 * <!-- Basic radio group with legend -->
 * <compa11y-radio-group legend="Favorite color" value="red">
 *   <compa11y-radio value="red" label="Red"></compa11y-radio>
 *   <compa11y-radio value="green" label="Green"></compa11y-radio>
 *   <compa11y-radio value="blue" label="Blue"></compa11y-radio>
 * </compa11y-radio-group>
 *
 * <!-- With aria-label instead of legend -->
 * <compa11y-radio-group aria-label="Favorite color" value="red">
 *   <compa11y-radio value="red" label="Red"></compa11y-radio>
 *   <compa11y-radio value="green" label="Green"></compa11y-radio>
 * </compa11y-radio-group>
 *
 * <!-- Horizontal orientation -->
 * <compa11y-radio-group legend="Size" orientation="horizontal">
 *   <compa11y-radio value="sm" label="Small"></compa11y-radio>
 *   <compa11y-radio value="md" label="Medium"></compa11y-radio>
 *   <compa11y-radio value="lg" label="Large"></compa11y-radio>
 * </compa11y-radio-group>
 *
 * <!-- Required with error -->
 * <compa11y-radio-group legend="Payment method" required error="Please select a payment method">
 *   <compa11y-radio value="card" label="Credit Card"></compa11y-radio>
 *   <compa11y-radio value="paypal" label="PayPal"></compa11y-radio>
 * </compa11y-radio-group>
 *
 * <!-- With disabled options -->
 * <compa11y-radio-group legend="Delivery speed" value="standard">
 *   <compa11y-radio value="standard" label="Standard"></compa11y-radio>
 *   <compa11y-radio value="express" label="Express" disabled></compa11y-radio>
 *   <compa11y-radio value="overnight" label="Overnight"></compa11y-radio>
 * </compa11y-radio-group>
 * ```
 *
 * Keyboard support:
 * - Tab: Move into/out of the group (lands on checked radio, or first enabled if none checked)
 * - Arrow Down/Right: Move to next radio and select it
 * - Arrow Up/Left: Move to previous radio and select it
 * - Home: Move to first radio and select it
 * - End: Move to last radio and select it
 * - Space: Select the focused radio
 *
 * @fires change - Emitted when selected value changes, detail: { value: string }
 * @fires a11y-radiogroup-change - Namespaced change event, detail: { value: string }
 *
 * @attr {string} value - Currently selected radio value
 * @attr {boolean} disabled - Whether the entire group is disabled
 * @attr {boolean} discoverable - Whether disabled radios remain in tab order (default: true)
 * @attr {string} orientation - Layout: 'horizontal' | 'vertical' (default: 'vertical')
 * @attr {boolean} required - Whether selection is required
 * @attr {string} name - Form field name
 * @attr {string} legend - Visible group label text (renders as fieldset/legend)
 * @attr {string} hint - Helper/description text
 * @attr {string} error - Error message text
 *
 * @cssprop --compa11y-radio-group-gap - Gap between radio items
 * @cssprop --compa11y-radio-group-legend-gap - Gap below legend
 * @cssprop --compa11y-radio-group-legend-weight - Legend font weight
 * @cssprop --compa11y-radio-group-legend-color - Legend text color
 * @cssprop --compa11y-radio-group-legend-size - Legend font size
 * @cssprop --compa11y-radio-group-hint-color - Hint text color
 * @cssprop --compa11y-radio-group-error-color - Error text color
 * @cssprop --compa11y-radio-group-required-color - Required indicator color
 */

import { Compa11yElement, defineElement } from '../utils/base-element';
import { RADIO_GROUP_STYLES, RADIO_STYLES } from '../utils/styles';
import { announcePolite } from '@compa11y/core';

// ============================================================================
// Compa11yRadioGroup
// ============================================================================

export class Compa11yRadioGroup extends Compa11yElement {
  private _value = '';
  private _disabled = false;
  private _discoverable = true;
  private _orientation: 'horizontal' | 'vertical' = 'vertical';
  private _required = false;
  private _name = '';

  static get observedAttributes() {
    return [
      'value',
      'disabled',
      'discoverable',
      'orientation',
      'required',
      'name',
      'legend',
      'hint',
      'error',
      'aria-label',
      'aria-labelledby',
    ];
  }

  // ===== Getters/Setters =====

  get value(): string {
    return this._value;
  }

  set value(v: string) {
    if (this._value !== v) {
      this._value = v;
      this.setAttribute('value', v);
      this.syncRadioStates();
    }
  }

  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(v: boolean) {
    const newValue = Boolean(v);
    if (this._disabled !== newValue) {
      this._disabled = newValue;
      if (newValue) {
        this.setAttribute('disabled', '');
        this.setAttribute('aria-disabled', 'true');
      } else {
        this.removeAttribute('disabled');
        this.removeAttribute('aria-disabled');
      }
      this.syncRadioStates();
    }
  }

  get discoverable(): boolean {
    return this._discoverable;
  }

  set discoverable(v: boolean) {
    this._discoverable = Boolean(v);
  }

  get required(): boolean {
    return this._required;
  }

  set required(v: boolean) {
    this._required = Boolean(v);
    if (this._required) {
      this.setAttribute('aria-required', 'true');
    } else {
      this.removeAttribute('aria-required');
    }
  }

  get name(): string {
    return this._name;
  }

  set name(v: string) {
    this._name = v;
    this.setAttribute('name', v);
  }

  get orientation(): 'horizontal' | 'vertical' {
    return this._orientation;
  }

  set orientation(v: 'horizontal' | 'vertical') {
    this._orientation = v;
    this.setAttribute('orientation', v);
    this.setAttribute('aria-orientation', v);
  }

  // ===== Lifecycle =====

  protected setupAccessibility(): void {
    this.setAttribute('role', 'radiogroup');
    this.setAttribute('aria-orientation', this._orientation);

    const hasLabel =
      this.hasAttribute('aria-label') ||
      this.hasAttribute('aria-labelledby') ||
      this.hasAttribute('legend');
    if (!hasLabel && process.env.NODE_ENV !== 'production') {
      console.warn(
        '[Compa11y RadioGroup]: RadioGroup has no accessible label. ' +
          'Use legend, aria-label, or aria-labelledby.'
      );
    }

    // Initialize from attributes
    const initialValue = this.getAttribute('value');
    if (initialValue) {
      this._value = initialValue;
    }

    this._disabled = this.hasAttribute('disabled');
    if (this._disabled) {
      this.setAttribute('aria-disabled', 'true');
    }

    const orient = this.getAttribute('orientation');
    if (orient === 'horizontal' || orient === 'vertical') {
      this._orientation = orient;
    }

    this._required = this.hasAttribute('required');
    if (this._required) {
      this.setAttribute('aria-required', 'true');
    }

    this._name = this.getAttribute('name') || this._id;

    const discoverableAttr = this.getAttribute('discoverable');
    if (discoverableAttr === 'false' || discoverableAttr === '0') {
      this._discoverable = false;
    }

    // Set aria-invalid if error is present
    if (this.hasAttribute('error') && this.getAttribute('error')) {
      this.setAttribute('aria-invalid', 'true');
    }
  }

  protected render(): void {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }

    const shadow = this.shadowRoot!;
    const legend = this.getAttribute('legend') || '';
    const hint = this.getAttribute('hint') || '';
    const error = this.getAttribute('error') || '';
    const hintId = hint ? `${this._id}-hint` : '';
    const errorId = error ? `${this._id}-error` : '';

    // Build aria-describedby from hint and error
    const describedBy = [hintId, errorId].filter(Boolean).join(' ');
    if (describedBy) {
      this.setAttribute('aria-describedby', describedBy);
    } else {
      this.removeAttribute('aria-describedby');
    }

    shadow.innerHTML = `
      <style>${RADIO_GROUP_STYLES}</style>
      <fieldset part="fieldset">
        ${
          legend
            ? `<legend part="legend">${legend}${
                this._required
                  ? '<span class="radio-group-required" aria-hidden="true"> *</span>'
                  : ''
              }</legend>`
            : ''
        }
        <div class="radio-group-items" part="items">
          <slot></slot>
        </div>
        ${hint ? `<div class="radio-group-hint" id="${hintId}" part="hint">${hint}</div>` : ''}
        ${error ? `<div class="radio-group-error" id="${errorId}" part="error" role="alert">${error}</div>` : ''}
      </fieldset>
    `;
  }

  protected setupEventListeners(): void {
    this.addEventListener('keydown', this.handleKeyDown);
    this.addEventListener(
      'radio-select',
      this.handleRadioSelect as EventListener
    );

    // Sync initial state when slotted children change
    const slot = this.shadowRoot?.querySelector('slot');
    if (slot) {
      slot.addEventListener('slotchange', () => {
        this.syncRadioStates();
      });
    }
  }

  protected cleanupEventListeners(): void {
    this.removeEventListener('keydown', this.handleKeyDown);
    this.removeEventListener(
      'radio-select',
      this.handleRadioSelect as EventListener
    );
  }

  // ===== Radio Management =====

  private getRadios(): Compa11yRadio[] {
    return Array.from(this.querySelectorAll('compa11y-radio')) as Compa11yRadio[];
  }

  private getEnabledRadios(): Compa11yRadio[] {
    return this.getRadios().filter(
      (radio) => !radio.disabled && !this._disabled
    );
  }

  private syncRadioStates(): void {
    const radios = this.getRadios();
    const enabledRadios = this.getEnabledRadios();

    radios.forEach((radio) => {
      const isChecked = radio.value === this._value;
      radio.checked = isChecked;

      // Roving tabindex: only checked radio (or first enabled if none checked) gets tabindex 0
      if (isChecked) {
        radio.setAttribute('tabindex', '0');
      } else if (!this._value && enabledRadios[0] === radio) {
        radio.setAttribute('tabindex', '0');
      } else {
        radio.setAttribute('tabindex', '-1');
      }
    });
  }

  selectRadio(value: string): void {
    if (this._disabled) return;

    this._value = value;
    this.setAttribute('value', value);
    this.syncRadioStates();

    // Clear error state on selection
    if (this.hasAttribute('aria-invalid')) {
      this.removeAttribute('aria-invalid');
    }

    this.emit('change', { value });
    this.emit('compa11y-radiogroup-change', { value });
  }

  // ===== Event Handlers =====

  private handleRadioSelect = (event: CustomEvent): void => {
    if (this._disabled) return;

    const value = event.detail?.value;
    if (value !== undefined) {
      this.selectRadio(value);
    }
  };

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (this._disabled) return;

    const enabledRadios = this.getEnabledRadios();
    if (enabledRadios.length === 0) return;

    const currentIndex = enabledRadios.findIndex(
      (r) => r.value === this._value
    );

    let nextIndex: number | null = null;

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        nextIndex =
          currentIndex < 0
            ? 0
            : (currentIndex + 1) % enabledRadios.length;
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        nextIndex =
          currentIndex < 0
            ? enabledRadios.length - 1
            : (currentIndex - 1 + enabledRadios.length) %
              enabledRadios.length;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = enabledRadios.length - 1;
        break;
      case ' ':
        // Space selects the currently focused radio
        event.preventDefault();
        event.stopPropagation();
        {
          const focusedRadio = enabledRadios.find(
            (r) => r === document.activeElement || r.contains(document.activeElement)
          );
          if (focusedRadio && focusedRadio.value !== this._value) {
            this.selectRadio(focusedRadio.value);
            const label =
              focusedRadio.getAttribute('label') || focusedRadio.value;
            announcePolite(`${label} selected`);
          }
        }
        return;
      default:
        return;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      event.stopPropagation();

      const nextRadio = enabledRadios[nextIndex];
      if (nextRadio) {
        // Selection follows focus
        this.selectRadio(nextRadio.value);
        nextRadio.focus();

        const label = nextRadio.getAttribute('label') || nextRadio.value;
        announcePolite(`${label} selected`);
      }
    }
  };

  // ===== Attribute Changes =====

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null
  ): void {
    if (oldValue === newValue) return;

    switch (name) {
      case 'value':
        this._value = newValue || '';
        this.syncRadioStates();
        break;

      case 'disabled':
        this._disabled = newValue !== null;
        if (this._disabled) {
          this.setAttribute('aria-disabled', 'true');
        } else {
          this.removeAttribute('aria-disabled');
        }
        this.syncRadioStates();
        break;

      case 'discoverable':
        if (newValue === null) {
          this._discoverable = true;
        } else if (newValue === 'false' || newValue === '0') {
          this._discoverable = false;
        } else {
          this._discoverable = true;
        }
        break;

      case 'orientation':
        if (newValue === 'horizontal' || newValue === 'vertical') {
          this._orientation = newValue;
          this.setAttribute('aria-orientation', newValue);
        }
        break;

      case 'required':
        this._required = newValue !== null;
        if (this._required) {
          this.setAttribute('aria-required', 'true');
        } else {
          this.removeAttribute('aria-required');
        }
        break;

      case 'name':
        this._name = newValue || '';
        break;

      case 'error':
        if (newValue) {
          this.setAttribute('aria-invalid', 'true');
        } else {
          this.removeAttribute('aria-invalid');
        }
        this.render();
        break;

      case 'legend':
      case 'hint':
        this.render();
        break;

      case 'aria-label':
      case 'aria-labelledby':
        // Handled natively
        break;
    }
  }
}

// ============================================================================
// Compa11yRadio
// ============================================================================

/**
 * Individual radio option for use within a11y-radio-group.
 *
 * @example
 * ```html
 * <compa11y-radio value="option1" label="Option 1"></compa11y-radio>
 * <compa11y-radio value="option2" label="Option 2" hint="Additional info"></compa11y-radio>
 * <compa11y-radio value="option3" label="Option 3" disabled></compa11y-radio>
 * ```
 *
 * @attr {string} value - Radio value
 * @attr {string} label - Visible label text
 * @attr {string} hint - Helper/description text
 * @attr {boolean} checked - Whether this radio is checked
 * @attr {boolean} disabled - Whether this radio is disabled
 * @attr {boolean} discoverable - Whether disabled radio remains in tab order
 *
 * @cssprop --compa11y-radio-size - Radio circle size
 * @cssprop --compa11y-radio-bg - Background when unchecked
 * @cssprop --compa11y-radio-border - Border when unchecked
 * @cssprop --compa11y-radio-checked-bg - Background when checked
 * @cssprop --compa11y-radio-checked-border - Border when checked
 * @cssprop --compa11y-radio-dot-size - Inner dot size
 * @cssprop --compa11y-radio-dot-color - Inner dot color
 * @cssprop --compa11y-radio-hover-border - Border on hover
 * @cssprop --compa11y-radio-label-color - Label text color
 * @cssprop --compa11y-radio-hint-color - Hint text color
 * @cssprop --compa11y-focus-color - Focus outline color
 */
export class Compa11yRadio extends Compa11yElement {
  private _value = '';
  private _checked = false;
  private _disabled = false;
  private _discoverable = true;

  static get observedAttributes() {
    return ['value', 'label', 'hint', 'disabled', 'discoverable', 'checked'];
  }

  // ===== Getters/Setters =====

  get value(): string {
    return this._value;
  }

  set value(v: string) {
    this._value = v;
    this.setAttribute('value', v);
  }

  get checked(): boolean {
    return this._checked;
  }

  set checked(v: boolean) {
    const newValue = Boolean(v);
    if (this._checked !== newValue) {
      this._checked = newValue;
      if (newValue) {
        this.setAttribute('checked', '');
      } else {
        this.removeAttribute('checked');
      }
      this.setAttribute('aria-checked', String(newValue));
      this.updateVisual();
    }
  }

  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(v: boolean) {
    const newValue = Boolean(v);
    if (this._disabled !== newValue) {
      this._disabled = newValue;
      if (newValue) {
        this.setAttribute('disabled', '');
        this.setAttribute('aria-disabled', 'true');
      } else {
        this.removeAttribute('disabled');
        this.removeAttribute('aria-disabled');
      }
    }
  }

  get discoverable(): boolean {
    return this._discoverable;
  }

  set discoverable(v: boolean | string) {
    let newValue: boolean;
    if (typeof v === 'string') {
      newValue = v !== 'false' && v !== '0';
    } else {
      newValue = Boolean(v);
    }

    if (this._discoverable !== newValue) {
      this._discoverable = newValue;
      if (newValue) {
        this.setAttribute('discoverable', '');
      } else {
        this.removeAttribute('discoverable');
      }
    }
  }

  // ===== Lifecycle =====

  protected setupAccessibility(): void {
    this.setAttribute('role', 'radio');
    this.setAttribute('aria-checked', 'false');

    // Initialize from attributes
    this._value = this.getAttribute('value') || '';
    this._checked = this.hasAttribute('checked');
    this._disabled = this.hasAttribute('disabled');

    if (this._checked) {
      this.setAttribute('aria-checked', 'true');
    }

    if (this._disabled) {
      this.setAttribute('aria-disabled', 'true');
    }

    const discoverableAttr = this.getAttribute('discoverable');
    if (discoverableAttr === 'false' || discoverableAttr === '0') {
      this._discoverable = false;
    }

    // Default tabindex (parent will manage via syncRadioStates)
    if (!this.hasAttribute('tabindex')) {
      this.setAttribute('tabindex', '-1');
    }
  }

  protected render(): void {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }

    const shadow = this.shadowRoot!;
    const label = this.getAttribute('label') || '';
    const hint = this.getAttribute('hint') || '';
    const labelId = label ? `${this._id}-label` : '';
    const hintId = hint ? `${this._id}-hint` : '';

    // Set aria-labelledby if label present
    if (labelId) {
      this.setAttribute('aria-labelledby', labelId);
    }

    // Set aria-describedby if hint present
    if (hintId) {
      this.setAttribute('aria-describedby', hintId);
    }

    shadow.innerHTML = `
      <style>${RADIO_STYLES}</style>
      <div class="radio-wrapper" part="wrapper">
        <div class="radio-control" part="control">
          <input
            type="radio"
            class="radio-input"
            tabindex="-1"
            aria-hidden="true"
            ${this._disabled ? 'disabled' : ''}
          />
          <div class="radio-circle" part="circle">
            <div class="radio-dot" part="dot" aria-hidden="true"></div>
          </div>
        </div>
        ${
          label || hint
            ? `<div class="radio-content">
                ${label ? `<span class="radio-label" id="${labelId}" part="label">${label}</span>` : ''}
                ${hint ? `<span class="radio-hint" id="${hintId}" part="hint">${hint}</span>` : ''}
              </div>`
            : ''
        }
        <slot></slot>
      </div>
    `;
  }

  protected setupEventListeners(): void {
    this.addEventListener('click', this.handleClick);
    this.addEventListener('keydown', this.handleKeyDown);
  }

  protected cleanupEventListeners(): void {
    this.removeEventListener('click', this.handleClick);
    this.removeEventListener('keydown', this.handleKeyDown);
  }

  // ===== Event Handlers =====

  private handleClick = (event: Event): void => {
    if (this._disabled) {
      event.preventDefault();
      return;
    }

    this.dispatchEvent(
      new CustomEvent('radio-select', {
        detail: { value: this._value },
        bubbles: true,
        composed: true,
      })
    );

    const label = this.getAttribute('label') || this._value;
    announcePolite(`${label} selected`);
  };

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (this._disabled) return;

    // Space is handled by the parent group for selection
    // Enter also selects for convenience
    if (event.key === 'Enter') {
      event.preventDefault();

      this.dispatchEvent(
        new CustomEvent('radio-select', {
          detail: { value: this._value },
          bubbles: true,
          composed: true,
        })
      );

      const label = this.getAttribute('label') || this._value;
      announcePolite(`${label} selected`);
    }
  };

  // ===== Visual Update =====

  private updateVisual(): void {
    if (!this.shadowRoot) return;

    const dot = this.shadowRoot.querySelector('.radio-dot') as HTMLElement;
    if (dot) {
      dot.style.opacity = this._checked ? '1' : '0';
      dot.style.transform = this._checked ? 'scale(1)' : 'scale(0)';
    }

    const circle = this.shadowRoot.querySelector(
      '.radio-circle'
    ) as HTMLElement;
    if (circle) {
      if (this._checked) {
        circle.style.background =
          'var(--compa11y-radio-checked-bg, #0066cc)';
        circle.style.borderColor =
          'var(--compa11y-radio-checked-border, #0066cc)';
      } else {
        circle.style.background = 'var(--compa11y-radio-bg, white)';
        circle.style.borderColor = '';
      }
    }
  }

  // ===== Attribute Changes =====

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null
  ): void {
    if (oldValue === newValue) return;

    switch (name) {
      case 'value':
        this._value = newValue || '';
        break;

      case 'checked':
        this._checked = newValue !== null;
        this.setAttribute('aria-checked', String(this._checked));
        this.updateVisual();
        break;

      case 'disabled':
        this._disabled = newValue !== null;
        if (this._disabled) {
          this.setAttribute('aria-disabled', 'true');
        } else {
          this.removeAttribute('aria-disabled');
        }
        break;

      case 'discoverable':
        if (newValue === null) {
          this._discoverable = true;
        } else if (newValue === 'false' || newValue === '0') {
          this._discoverable = false;
        } else {
          this._discoverable = true;
        }
        break;

      case 'label':
      case 'hint':
        this.render();
        break;
    }
  }
}

// ============================================================================
// Register elements
// ============================================================================

defineElement('compa11y-radio-group', Compa11yRadioGroup);
defineElement('compa11y-radio', Compa11yRadio);
