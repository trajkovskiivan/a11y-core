/**
 * A11y Checkbox Web Component
 *
 * An accessible checkbox custom element with full keyboard support
 * and ARIA attributes.
 *
 * @example
 * ```html
 * <a11y-checkbox label="Accept terms"></a11y-checkbox>
 * <a11y-checkbox checked>Enable notifications</a11y-checkbox>
 * <a11y-checkbox indeterminate>Select all</a11y-checkbox>
 * ```
 */

import { A11yKitElement, defineElement } from '../utils/base-element';
import { BASE_STYLES, FOCUS_VISIBLE_STYLES } from '../utils/styles';
import { announcePolite } from '@compa11y/core';

const CHECKBOX_STYLES = `
  ${BASE_STYLES}
  ${FOCUS_VISIBLE_STYLES}

  :host {
    display: inline-block;
    position: relative;
  }

  .checkbox-wrapper {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    user-select: none;
  }

  :host([disabled]) .checkbox-wrapper {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .checkbox-box {
    width: var(--compa11y-checkbox-size, 1.25rem);
    height: var(--compa11y-checkbox-size, 1.25rem);
    border: var(--compa11y-checkbox-border, 2px solid #666);
    border-radius: var(--compa11y-checkbox-radius, 4px);
    background: var(--compa11y-checkbox-bg, white);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.15s ease;
  }

  :host([checked]) .checkbox-box,
  :host([indeterminate]) .checkbox-box {
    background: var(--compa11y-checkbox-checked-bg, #0066cc);
    border-color: var(--compa11y-checkbox-checked-border, #0066cc);
  }

  .checkbox-box svg {
    width: 100%;
    height: 100%;
    stroke: var(--compa11y-checkbox-check-color, white);
    stroke-width: 3;
    stroke-linecap: round;
    stroke-linejoin: round;
    fill: none;
    opacity: 0;
    transform: scale(0);
    transition: all 0.15s ease;
  }

  :host([checked]) .checkbox-box svg,
  :host([indeterminate]) .checkbox-box svg {
    opacity: 1;
    transform: scale(1);
  }

  .checkbox-label {
    color: var(--compa11y-checkbox-label-color, inherit);
    font-size: var(--compa11y-checkbox-label-size, 1rem);
  }

  :host([disabled]) .checkbox-label {
    color: var(--compa11y-checkbox-disabled-color, #999);
  }

  /* Focus styles */
  .checkbox-wrapper:focus-within .checkbox-box {
    outline: 2px solid var(--compa11y-focus-color, #0066cc);
    outline-offset: 2px;
  }

  /* Focus-visible only for keyboard */
  .checkbox-wrapper:focus-within:not([data-compa11y-focus-visible="true"]) .checkbox-box {
    outline: none;
  }

  /* Hover state */
  .checkbox-wrapper:hover:not([disabled]) .checkbox-box {
    border-color: var(--compa11y-checkbox-hover-border, #0066cc);
  }
`;

export class A11yCheckbox extends A11yKitElement {
  private _checked = false;
  private _indeterminate = false;
  private _disabled = false;
  private _discoverable = true;
  private _value = '';
  private _name = '';

  static get observedAttributes() {
    return ['checked', 'indeterminate', 'disabled', 'discoverable', 'label', 'value', 'name'];
  }

  get checked(): boolean {
    return this._checked;
  }

  set checked(value: boolean) {
    const newValue = Boolean(value);
    if (this._checked !== newValue) {
      this._checked = newValue;
      if (newValue) {
        this.setAttribute('checked', '');
        this._indeterminate = false;
        this.removeAttribute('indeterminate');
      } else {
        this.removeAttribute('checked');
      }
      this.updateAriaChecked();
      this.render();
    }
  }

  get indeterminate(): boolean {
    return this._indeterminate;
  }

  set indeterminate(value: boolean) {
    const newValue = Boolean(value);
    if (this._indeterminate !== newValue) {
      this._indeterminate = newValue;
      if (newValue) {
        this.setAttribute('indeterminate', '');
        this._checked = false;
        this.removeAttribute('checked');
      } else {
        this.removeAttribute('indeterminate');
      }
      this.updateAriaChecked();
      this.render();
    }
  }

  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(value: boolean) {
    const newValue = Boolean(value);
    if (this._disabled !== newValue) {
      this._disabled = newValue;
      if (newValue) {
        this.setAttribute('disabled', '');
        this.setAttribute('aria-disabled', 'true');
      } else {
        this.removeAttribute('disabled');
        this.removeAttribute('aria-disabled');
      }
      this.updateTabindex();
      this.render();
    }
  }

  get discoverable(): boolean {
    return this._discoverable;
  }

  set discoverable(value: boolean | string) {
    // Handle string values like "false" and "0" as false
    let newValue: boolean;
    if (typeof value === 'string') {
      newValue = value !== 'false' && value !== '0';
    } else {
      newValue = Boolean(value);
    }

    if (this._discoverable !== newValue) {
      this._discoverable = newValue;
      if (newValue) {
        this.setAttribute('discoverable', '');
      } else {
        this.removeAttribute('discoverable');
      }
      this.updateTabindex();
    }
  }

  get value(): string {
    return this._value;
  }

  set value(v: string) {
    this._value = v;
    this.setAttribute('value', v);
  }

  get name(): string {
    return this._name;
  }

  set name(v: string) {
    this._name = v;
    this.setAttribute('name', v);
  }

  protected setupAccessibility(): void {
    this.setAttribute('role', 'checkbox');

    this.updateTabindex();
    this.updateAriaChecked();

    const hasLabel =
      this.hasAttribute('label') || this.hasAttribute('aria-label') || this.hasAttribute('aria-labelledby');
    if (!hasLabel && process.env.NODE_ENV !== 'production') {
      console.warn(
        '[A11yKit Checkbox]: Checkbox has no accessible label. ' +
          'Use label attribute or aria-label.'
      );
    }
  }

  private updateAriaChecked(): void {
    if (this._indeterminate) {
      this.setAttribute('aria-checked', 'mixed');
    } else {
      this.setAttribute('aria-checked', this._checked ? 'true' : 'false');
    }
  }

  private updateTabindex(): void {
    // If disabled and not discoverable, remove from tab order
    // Otherwise, keep in tab order
    if (this._disabled && !this._discoverable) {
      this.setAttribute('tabindex', '-1');
    } else {
      this.setAttribute('tabindex', '0');
    }
  }

  protected render(): void {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }

    const shadow = this.shadowRoot!;
    const label = this.getAttribute('label') || '';

    let icon = '';
    if (this._indeterminate) {
      icon = '<line x1="4" y1="12" x2="20" y2="12" />';
    } else if (this._checked) {
      icon = '<polyline points="20 6 9 17 4 12" />';
    }

    shadow.innerHTML = `
      <style>${CHECKBOX_STYLES}</style>
      <div class="checkbox-wrapper" part="wrapper">
        <div class="checkbox-box" part="box">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
            ${icon}
          </svg>
        </div>
        ${label ? `<span class="checkbox-label" part="label">${label}</span>` : ''}
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

    this.toggle();
  };

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (this._disabled) {
      return;
    }

    if (event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault();
      this.toggle();
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      this.toggle();
    }
  };

  private toggle(): void {
    if (this._disabled) {
      return;
    }

    if (this._indeterminate) {
      this.indeterminate = false;
      this.checked = true;
    } else {
      this.checked = !this._checked;
    }

    this.emit('change', {
      checked: this._checked,
      indeterminate: this._indeterminate,
      value: this._value,
      name: this._name,
    });

    const label = this.getAttribute('label') || 'Checkbox';
    const state = this._checked ? 'checked' : 'unchecked';
    announcePolite(`${label} ${state}`);
  }

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null
  ): void {
    if (oldValue === newValue) return;

    switch (name) {
      case 'checked':
        this._checked = newValue !== null;
        if (this._checked) {
          this._indeterminate = false;
        }
        this.updateAriaChecked();
        this.render();
        break;

      case 'indeterminate':
        this._indeterminate = newValue !== null;
        if (this._indeterminate) {
          this._checked = false;
        }
        this.updateAriaChecked();
        this.render();
        break;

      case 'disabled':
        this._disabled = newValue !== null;
        if (this._disabled) {
          this.setAttribute('aria-disabled', 'true');
        } else {
          this.removeAttribute('aria-disabled');
        }
        this.updateTabindex();
        this.render();
        break;

      case 'discoverable':
        // If attribute is removed, default to true
        // If attribute value is explicitly "false", set to false
        // Otherwise, set to true
        if (newValue === null) {
          this._discoverable = true;
        } else if (newValue === 'false' || newValue === '0') {
          this._discoverable = false;
        } else {
          this._discoverable = true;
        }
        this.updateTabindex();
        break;

      case 'label':
        this.render();
        break;

      case 'value':
        this._value = newValue || '';
        break;

      case 'name':
        this._name = newValue || '';
        break;
    }
  }
}

defineElement('a11y-checkbox', A11yCheckbox);
