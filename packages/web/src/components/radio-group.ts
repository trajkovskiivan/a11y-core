/**
 * A11y RadioGroup + Radio Web Components
 *
 * Accessible radio group custom elements with full keyboard support,
 * roving tabindex, and selection-follows-focus behavior.
 *
 * @example
 * ```html
 * <a11y-radio-group aria-label="Favorite color" value="red">
 *   <a11y-radio value="red" label="Red"></a11y-radio>
 *   <a11y-radio value="green" label="Green"></a11y-radio>
 *   <a11y-radio value="blue" label="Blue"></a11y-radio>
 * </a11y-radio-group>
 * ```
 */

import { Compa11yElement, defineElement } from '../utils/base-element';
import { RADIO_GROUP_STYLES, RADIO_STYLES } from '../utils/styles';
import { announcePolite } from '@compa11y/core';

// ============================================================================
// A11yRadioGroup
// ============================================================================

export class A11yRadioGroup extends Compa11yElement {
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
      'aria-label',
      'aria-labelledby',
    ];
  }

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
  }

  get orientation(): 'horizontal' | 'vertical' {
    return this._orientation;
  }

  set orientation(v: 'horizontal' | 'vertical') {
    this._orientation = v;
    this.setAttribute('orientation', v);
    this.setAttribute('aria-orientation', v);
  }

  protected setupAccessibility(): void {
    this.setAttribute('role', 'radiogroup');
    this.setAttribute('aria-orientation', this._orientation);

    if (this._name) {
      // name is tracked internally
    }

    const hasLabel =
      this.hasAttribute('aria-label') ||
      this.hasAttribute('aria-labelledby');
    if (!hasLabel && process.env.NODE_ENV !== 'production') {
      console.warn(
        '[Compa11y RadioGroup]: RadioGroup has no accessible label. ' +
          'Use aria-label or aria-labelledby.'
      );
    }

    // Initialize value from attribute
    const initialValue = this.getAttribute('value');
    if (initialValue) {
      this._value = initialValue;
    }

    // Initialize other attributes
    this._disabled = this.hasAttribute('disabled');
    if (this._disabled) {
      this.setAttribute('aria-disabled', 'true');
    }

    const orient = this.getAttribute('orientation');
    if (orient === 'horizontal' || orient === 'vertical') {
      this._orientation = orient;
    }

    this._required = this.hasAttribute('required');
    this._name = this.getAttribute('name') || this._id;

    const discoverableAttr = this.getAttribute('discoverable');
    if (discoverableAttr === 'false' || discoverableAttr === '0') {
      this._discoverable = false;
    }
  }

  protected render(): void {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }

    const shadow = this.shadowRoot!;
    shadow.innerHTML = `
      <style>${RADIO_GROUP_STYLES}</style>
      <div class="radiogroup" part="group">
        <slot></slot>
      </div>
    `;
  }

  protected setupEventListeners(): void {
    this.addEventListener('keydown', this.handleKeyDown);
    this.addEventListener('radio-select', this.handleRadioSelect as EventListener);

    // Watch for slotchange to sync initial state
    const slot = this.shadowRoot?.querySelector('slot');
    if (slot) {
      slot.addEventListener('slotchange', () => {
        this.syncRadioStates();
      });
    }
  }

  protected cleanupEventListeners(): void {
    this.removeEventListener('keydown', this.handleKeyDown);
    this.removeEventListener('radio-select', this.handleRadioSelect as EventListener);
  }

  private getRadios(): A11yRadio[] {
    return Array.from(this.querySelectorAll('a11y-radio')) as A11yRadio[];
  }

  private getEnabledRadios(): A11yRadio[] {
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

      // Roving tabindex
      if (isChecked) {
        radio.setAttribute('tabindex', '0');
      } else if (!this._value && enabledRadios[0] === radio) {
        // If no value selected, first enabled radio gets tabindex 0
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

    this.emit('change', { value });
    this.emit('a11y-radiogroup-change', { value });
  }

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
      default:
        return;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      event.stopPropagation();

      const nextRadio = enabledRadios[nextIndex];
      if (nextRadio) {
        this.selectRadio(nextRadio.value);
        nextRadio.focus();

        const label = nextRadio.getAttribute('label') || nextRadio.value;
        announcePolite(`${label} selected`);
      }
    }
  };

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
        break;

      case 'name':
        this._name = newValue || '';
        break;

      case 'aria-label':
      case 'aria-labelledby':
        // These are handled natively
        break;
    }
  }
}

// ============================================================================
// A11yRadio
// ============================================================================

export class A11yRadio extends Compa11yElement {
  private _value = '';
  private _checked = false;
  private _disabled = false;
  private _discoverable = true;

  static get observedAttributes() {
    return ['value', 'label', 'disabled', 'discoverable', 'checked'];
  }

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
      this.render();
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
      this.render();
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

  protected setupAccessibility(): void {
    this.setAttribute('role', 'radio');
    this.setAttribute('aria-checked', String(this._checked));

    // Initialize from attributes
    this._value = this.getAttribute('value') || '';
    this._checked = this.hasAttribute('checked');
    this._disabled = this.hasAttribute('disabled');

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

    shadow.innerHTML = `
      <style>${RADIO_STYLES}</style>
      <div class="radio-wrapper" part="wrapper">
        <div class="radio-circle" part="circle">
          <div class="radio-dot" part="dot" aria-hidden="true"></div>
        </div>
        ${label ? `<span class="radio-label" part="label">${label}</span>` : ''}
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

  private handleClick = (event: Event): void => {
    if (this._disabled) {
      event.preventDefault();
      return;
    }

    // Dispatch radio-select event for parent to handle
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

    if (event.key === ' ' || event.key === 'Enter') {
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
        this.render();
        break;

      case 'disabled':
        this._disabled = newValue !== null;
        if (this._disabled) {
          this.setAttribute('aria-disabled', 'true');
        } else {
          this.removeAttribute('aria-disabled');
        }
        this.render();
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
        this.render();
        break;
    }
  }
}

// ============================================================================
// Register elements
// ============================================================================

defineElement('a11y-radio-group', A11yRadioGroup);
defineElement('a11y-radio', A11yRadio);
