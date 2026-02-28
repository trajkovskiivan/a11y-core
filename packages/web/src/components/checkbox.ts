/**
 * compa11y Checkbox Web Components
 *
 * Accessible checkbox and checkbox group components following WAI-ARIA patterns.
 *
 * @example
 * ```html
 * <!-- Basic checkbox -->
 * <compa11y-checkbox label="Subscribe to updates"></compa11y-checkbox>
 *
 * <!-- With helper text -->
 * <compa11y-checkbox label="Subscribe" hint="We'll email you weekly."></compa11y-checkbox>
 *
 * <!-- Checked by default -->
 * <compa11y-checkbox checked label="Accept terms"></compa11y-checkbox>
 *
 * <!-- Indeterminate / mixed state -->
 * <compa11y-checkbox indeterminate label="Select all"></compa11y-checkbox>
 *
 * <!-- Disabled -->
 * <compa11y-checkbox disabled label="Unavailable option"></compa11y-checkbox>
 *
 * <!-- Checkbox group -->
 * <compa11y-checkbox-group legend="Select toppings">
 *   <compa11y-checkbox value="cheese" label="Cheese"></compa11y-checkbox>
 *   <compa11y-checkbox value="peppers" label="Peppers"></compa11y-checkbox>
 *   <compa11y-checkbox value="olives" label="Olives"></compa11y-checkbox>
 * </compa11y-checkbox-group>
 * ```
 *
 * @fires change - Emitted when checkbox state changes, detail: { checked: boolean, value: string }
 *
 * @attr {boolean} checked - Whether the checkbox is checked
 * @attr {boolean} indeterminate - Whether the checkbox is in indeterminate/mixed state
 * @attr {boolean} disabled - Whether the checkbox is disabled
 * @attr {string} label - Visible label text
 * @attr {string} hint - Helper/description text
 * @attr {string} error - Error message text
 * @attr {string} value - Value for use in checkbox groups
 * @attr {string} name - Form field name
 * @attr {boolean} required - Whether the checkbox is required
 * @attr {string} size - Size variant: 'sm' | 'md' | 'lg' (default: 'md')
 *
 * @cssprop --compa11y-checkbox-size - Checkbox indicator size
 * @cssprop --compa11y-checkbox-bg - Background color when unchecked
 * @cssprop --compa11y-checkbox-border - Border style when unchecked
 * @cssprop --compa11y-checkbox-checked-bg - Background color when checked
 * @cssprop --compa11y-checkbox-checked-border - Border color when checked
 * @cssprop --compa11y-checkbox-check-color - Check mark color
 * @cssprop --compa11y-checkbox-label-color - Label text color
 * @cssprop --compa11y-checkbox-hint-color - Hint text color
 * @cssprop --compa11y-checkbox-error-color - Error text color
 * @cssprop --compa11y-focus-color - Focus outline color
 */

import { announcePolite } from '@compa11y/core';
import { Compa11yElement, defineElement } from '../utils/base-element';
import { CHECKBOX_STYLES, CHECKBOX_GROUP_STYLES } from '../utils/styles';

// SVG for checkmark
const CHECK_SVG = `<svg class="checkbox-check" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
  <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// SVG for indeterminate dash
const DASH_SVG = `<svg class="checkbox-dash" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
  <path d="M3 6H9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
</svg>`;

export class Compa11yCheckbox extends Compa11yElement {
  private _checked = false;
  private _indeterminate = false;
  private _input: HTMLInputElement | null = null;

  static get observedAttributes() {
    return [
      'checked',
      'indeterminate',
      'disabled',
      'label',
      'hint',
      'error',
      'value',
      'name',
      'required',
      'size',
      'aria-label',
      'aria-describedby',
    ];
  }

  /**
   * Get/set the checked state
   */
  get checked(): boolean {
    return this._checked;
  }

  set checked(value: boolean) {
    const oldValue = this._checked;
    this._checked = value;
    this.toggleAttribute('checked', value);

    if (value !== oldValue) {
      this.updateVisualState();
      this.emit('change', { checked: value, value: this.value });
    }
  }

  /**
   * Get/set the indeterminate state
   */
  get indeterminate(): boolean {
    return this._indeterminate;
  }

  set indeterminate(value: boolean) {
    const oldValue = this._indeterminate;
    this._indeterminate = value;
    this.toggleAttribute('indeterminate', value);

    if (value !== oldValue) {
      this.updateVisualState();
    }
  }

  /**
   * Get/set the disabled state
   */
  get disabled(): boolean {
    return this.hasAttribute('disabled');
  }

  set disabled(value: boolean) {
    this.toggleAttribute('disabled', value);
    this.updateDisabledState();
  }

  /**
   * Get/set the value
   */
  get value(): string {
    return this.getAttribute('value') || '';
  }

  set value(v: string) {
    if (v) {
      this.setAttribute('value', v);
    } else {
      this.removeAttribute('value');
    }
  }

  /**
   * Get/set the visible label
   */
  get label(): string {
    return this.getAttribute('label') || '';
  }

  set label(value: string) {
    if (value) {
      this.setAttribute('label', value);
    } else {
      this.removeAttribute('label');
    }
  }

  /**
   * Get/set the hint text
   */
  get hint(): string {
    return this.getAttribute('hint') || '';
  }

  set hint(value: string) {
    if (value) {
      this.setAttribute('hint', value);
    } else {
      this.removeAttribute('hint');
    }
  }

  /**
   * Get/set the error message
   */
  get error(): string {
    return this.getAttribute('error') || '';
  }

  set error(value: string) {
    if (value) {
      this.setAttribute('error', value);
    } else {
      this.removeAttribute('error');
    }
  }

  /**
   * Get/set the size variant
   */
  get size(): 'sm' | 'md' | 'lg' {
    const size = this.getAttribute('size');
    if (size === 'sm' || size === 'lg') return size;
    return 'md';
  }

  set size(value: 'sm' | 'md' | 'lg') {
    this.setAttribute('size', value);
  }

  /**
   * Get/set required state
   */
  get required(): boolean {
    return this.hasAttribute('required');
  }

  set required(value: boolean) {
    this.toggleAttribute('required', value);
  }

  protected setupAccessibility(): void {
    // Initialize state from attributes
    this._checked = this.hasAttribute('checked');
    this._indeterminate = this.hasAttribute('indeterminate');

    // Warn if no accessible label
    if (
      typeof process !== 'undefined' &&
      process.env?.NODE_ENV !== 'production'
    ) {
      if (!this.label && !this.getAttribute('aria-label')) {
        console.warn(
          '[compa11y/Checkbox] Checkbox has no accessible label. Add label="..." or aria-label="..." attribute.\n' +
            '💡 Suggestion: <compa11y-checkbox label="Accept terms"></compa11y-checkbox>'
        );
      }
    }
  }

  protected render(): void {
    const shadow = this.attachShadow({ mode: 'open' });
    const inputId = `${this._id}-input`;
    const labelId = `${this._id}-label`;
    const hintId = `${this._id}-hint`;
    const errorId = `${this._id}-error`;
    const hasLabel = Boolean(this.label);
    const hasHint = Boolean(this.hint);
    const hasError = Boolean(this.error);
    const ariaLabel = this.getAttribute('aria-label');
    const name = this.getAttribute('name') || '';
    const externalDescribedBy = this.getAttribute('aria-describedby') || '';

    // Build aria-describedby
    const describedByParts: string[] = [];
    if (externalDescribedBy) describedByParts.push(externalDescribedBy);
    if (hasHint) describedByParts.push(hintId);
    if (hasError) describedByParts.push(errorId);
    const describedBy = describedByParts.length
      ? `aria-describedby="${describedByParts.join(' ')}"`
      : '';

    // Build aria-label for non-visible-label case
    const ariaLabelAttr =
      !hasLabel && ariaLabel ? `aria-label="${ariaLabel}"` : '';

    shadow.innerHTML = `
      <style>${CHECKBOX_STYLES}</style>
      <div class="checkbox-wrapper size-${this.size}" part="wrapper">
        <div class="checkbox-control">
          <input
            type="checkbox"
            class="checkbox-input"
            id="${inputId}"
            ${name ? `name="${name}"` : ''}
            ${this.value ? `value="${this.value}"` : ''}
            ${this._checked ? 'checked' : ''}
            ${this.disabled ? 'disabled' : ''}
            ${this.required ? 'required aria-required="true"' : ''}
            ${describedBy}
            ${ariaLabelAttr}
            ${hasError ? 'aria-invalid="true"' : ''}
            part="input"
          />
          <div class="checkbox-indicator" part="indicator" aria-hidden="true">
            ${CHECK_SVG}
            ${DASH_SVG}
          </div>
        </div>
        ${
          hasLabel || hasHint || hasError
            ? `<div class="checkbox-content">
            ${hasLabel ? `<label for="${inputId}" id="${labelId}" class="checkbox-label" part="label">${this.label}${this.required ? '<span class="checkbox-required" aria-hidden="true">*</span>' : ''}</label>` : ''}
            ${hasHint ? `<div id="${hintId}" class="checkbox-hint" part="hint">${this.hint}</div>` : ''}
            ${hasError ? `<div id="${errorId}" class="checkbox-error" role="alert" part="error">${this.error}</div>` : ''}
          </div>`
            : ''
        }
      </div>
    `;

    // Cache reference
    this._input = shadow.querySelector('input');

    // Set indeterminate imperatively (no HTML attribute for this)
    if (this._input && this._indeterminate) {
      this._input.indeterminate = true;
    }
  }

  protected setupEventListeners(): void {
    this._input?.addEventListener('change', this.handleChange);
  }

  protected cleanupEventListeners(): void {
    this._input?.removeEventListener('change', this.handleChange);
  }

  protected onAttributeChange(
    name: string,
    _oldValue: string | null,
    newValue: string | null
  ): void {
    switch (name) {
      case 'checked':
        this._checked = newValue !== null;
        this.updateVisualState();
        break;
      case 'indeterminate':
        this._indeterminate = newValue !== null;
        this.updateVisualState();
        break;
      case 'disabled':
        this.updateDisabledState();
        break;
      case 'label':
      case 'hint':
      case 'error':
      case 'aria-label':
      case 'aria-describedby':
      case 'required':
      case 'name':
        // Re-render for structural changes
        if (this.shadowRoot) {
          this.cleanupEventListeners();
          this.shadowRoot.innerHTML = '';
          this.render();
          this.setupEventListeners();
        }
        break;
      case 'size':
        this.updateSizeClass();
        break;
    }
  }

  /**
   * Handle change event from native input
   */
  private handleChange = (): void => {
    if (!this._input) return;

    this._checked = this._input.checked;
    this.toggleAttribute('checked', this._checked);

    // Clear indeterminate on user interaction
    if (this._indeterminate) {
      this._indeterminate = false;
      this.removeAttribute('indeterminate');
      this._input.indeterminate = false;
    }

    this.updateVisualState();
    this.emit('change', { checked: this._checked, value: this.value });

    // Announce state change
    const labelText =
      this.label || this.getAttribute('aria-label') || 'Checkbox';
    announcePolite(`${labelText} ${this._checked ? 'checked' : 'unchecked'}`);
  };

  /**
   * Update visual state of indicator
   */
  private updateVisualState(): void {
    if (this._input) {
      this._input.checked = this._checked;
      this._input.indeterminate = this._indeterminate;
    }
  }

  /**
   * Update disabled state
   */
  private updateDisabledState(): void {
    if (this._input) {
      if (this.disabled) {
        this._input.setAttribute('disabled', '');
      } else {
        this._input.removeAttribute('disabled');
      }
    }
  }

  /**
   * Update size class
   */
  private updateSizeClass(): void {
    const wrapper = this.shadowRoot?.querySelector('.checkbox-wrapper');
    if (wrapper) {
      wrapper.classList.remove('size-sm', 'size-md', 'size-lg');
      wrapper.classList.add(`size-${this.size}`);
    }
  }

  /**
   * Toggle the checkbox programmatically
   */
  public toggle(): void {
    if (this.disabled) return;

    if (this._indeterminate) {
      this.indeterminate = false;
      this.checked = true;
    } else {
      this.checked = !this.checked;
    }

    const labelText =
      this.label || this.getAttribute('aria-label') || 'Checkbox';
    announcePolite(`${labelText} ${this.checked ? 'checked' : 'unchecked'}`);
  }

  /**
   * Set checked state programmatically
   */
  public setChecked(checked: boolean): void {
    this.checked = checked;
  }
}

/**
 * compa11y Checkbox Group Web Component
 *
 * Groups related checkboxes with a fieldset/legend for accessibility.
 *
 * @example
 * ```html
 * <compa11y-checkbox-group legend="Select toppings" error="Pick at least 2">
 *   <compa11y-checkbox value="cheese" label="Cheese"></compa11y-checkbox>
 *   <compa11y-checkbox value="peppers" label="Peppers"></compa11y-checkbox>
 *   <compa11y-checkbox value="olives" label="Olives"></compa11y-checkbox>
 * </compa11y-checkbox-group>
 * ```
 *
 * @fires change - Emitted when any checkbox in the group changes, detail: { value: string[] }
 *
 * @attr {string} legend - Group label displayed as fieldset legend
 * @attr {string} error - Group-level error message
 * @attr {boolean} disabled - Disable all checkboxes in the group
 * @attr {string} orientation - Layout: 'vertical' | 'horizontal' (default: 'vertical')
 *
 * @cssprop --compa11y-checkbox-group-gap - Gap between checkboxes
 * @cssprop --compa11y-checkbox-group-legend-weight - Legend font weight
 * @cssprop --compa11y-checkbox-group-legend-color - Legend text color
 * @cssprop --compa11y-checkbox-group-error-color - Error text color
 */
export class Compa11yCheckboxGroup extends Compa11yElement {
  private _value: string[] = [];

  static get observedAttributes() {
    return [
      'disabled',
      'legend',
      'error',
      'orientation',
      'aria-label',
      'aria-labelledby',
    ];
  }

  /**
   * Get/set the selected values as an array
   */
  get value(): string[] {
    return [...this._value];
  }

  set value(val: string[]) {
    this._value = [...val];
    this.syncCheckboxStates();
  }

  /**
   * Get/set the disabled state
   */
  get disabled(): boolean {
    return this.hasAttribute('disabled');
  }

  set disabled(value: boolean) {
    this.toggleAttribute('disabled', value);
    this.syncDisabledState();
  }

  /**
   * Get/set the legend text
   */
  get legend(): string {
    return this.getAttribute('legend') || '';
  }

  set legend(value: string) {
    if (value) {
      this.setAttribute('legend', value);
    } else {
      this.removeAttribute('legend');
    }
  }

  /**
   * Get/set the error message
   */
  get error(): string {
    return this.getAttribute('error') || '';
  }

  set error(value: string) {
    if (value) {
      this.setAttribute('error', value);
    } else {
      this.removeAttribute('error');
    }
  }

  /**
   * Get/set the orientation
   */
  get orientation(): 'vertical' | 'horizontal' {
    return this.getAttribute('orientation') === 'horizontal'
      ? 'horizontal'
      : 'vertical';
  }

  set orientation(value: 'vertical' | 'horizontal') {
    this.setAttribute('orientation', value);
  }

  protected setupAccessibility(): void {
    // Warn if no group label
    if (
      typeof process !== 'undefined' &&
      process.env?.NODE_ENV !== 'production'
    ) {
      if (
        !this.legend &&
        !this.getAttribute('aria-label') &&
        !this.getAttribute('aria-labelledby')
      ) {
        console.warn(
          '[compa11y/CheckboxGroup] CheckboxGroup has no accessible label. Add legend="..." or aria-label="..." attribute.\n' +
            '💡 Suggestion: <compa11y-checkbox-group legend="Select options"></compa11y-checkbox-group>'
        );
      }
    }

    // Initialize value from checked children
    this.initValueFromChildren();
  }

  protected render(): void {
    const shadow = this.attachShadow({ mode: 'open' });
    const errorId = `${this._id}-error`;
    const hasLegend = Boolean(this.legend);
    const hasError = Boolean(this.error);
    const ariaLabel = this.getAttribute('aria-label');
    const ariaLabelledby = this.getAttribute('aria-labelledby');

    shadow.innerHTML = `
      <style>${CHECKBOX_GROUP_STYLES}</style>
      <fieldset
        part="fieldset"
        ${ariaLabel ? `aria-label="${ariaLabel}"` : ''}
        ${ariaLabelledby ? `aria-labelledby="${ariaLabelledby}"` : ''}
        ${hasError ? `aria-describedby="${errorId}"` : ''}
        ${this.disabled ? 'disabled' : ''}
      >
        ${hasLegend ? `<legend part="legend">${this.legend}</legend>` : ''}
        <div class="checkbox-group-items" part="items">
          <slot></slot>
        </div>
        ${hasError ? `<div id="${errorId}" class="checkbox-group-error" role="alert" part="error">${this.error}</div>` : ''}
      </fieldset>
    `;
  }

  protected setupEventListeners(): void {
    this.addEventListener('change', this.handleChildChange);
  }

  protected cleanupEventListeners(): void {
    this.removeEventListener('change', this.handleChildChange);
  }

  protected onAttributeChange(
    name: string,
    _oldValue: string | null,
    _newValue: string | null
  ): void {
    switch (name) {
      case 'disabled':
        this.syncDisabledState();
        break;
      case 'legend':
      case 'error':
      case 'aria-label':
      case 'aria-labelledby':
        // Re-render for structural changes
        if (this.shadowRoot) {
          this.cleanupEventListeners();
          this.shadowRoot.innerHTML = '';
          this.render();
          this.setupEventListeners();
        }
        break;
    }
  }

  /**
   * Handle change events from child checkboxes
   */
  private handleChildChange = (event: Event): void => {
    const target = event.target;
    if (!(target instanceof Compa11yCheckbox)) return;

    // Don't re-emit our own events
    if (target === (this as unknown)) return;

    const checkboxValue = target.value;
    if (!checkboxValue) return;

    if (target.checked) {
      if (!this._value.includes(checkboxValue)) {
        this._value = [...this._value, checkboxValue];
      }
    } else {
      this._value = this._value.filter((v) => v !== checkboxValue);
    }

    this.emit('change', { value: this._value });
  };

  /**
   * Initialize value array from currently checked children
   */
  private initValueFromChildren(): void {
    // Use requestAnimationFrame to wait for children to be upgraded
    requestAnimationFrame(() => {
      const checkboxes = this.querySelectorAll('compa11y-checkbox');
      const values: string[] = [];
      checkboxes.forEach((checkbox) => {
        if (
          checkbox.hasAttribute('checked') &&
          checkbox.getAttribute('value')
        ) {
          values.push(checkbox.getAttribute('value')!);
        }
      });
      this._value = values;
    });
  }

  /**
   * Sync checkbox checked states from value array
   */
  private syncCheckboxStates(): void {
    const checkboxes = this.querySelectorAll(
      'compa11y-checkbox'
    ) as NodeListOf<Compa11yCheckbox>;
    checkboxes.forEach((checkbox) => {
      const val = checkbox.value;
      if (val) {
        checkbox.checked = this._value.includes(val);
      }
    });
  }

  /**
   * Sync disabled state to children
   */
  private syncDisabledState(): void {
    const fieldset = this.shadowRoot?.querySelector('fieldset');
    if (fieldset) {
      if (this.disabled) {
        fieldset.setAttribute('disabled', '');
      } else {
        fieldset.removeAttribute('disabled');
      }
    }
  }
}

// Register custom elements
defineElement('compa11y-checkbox', Compa11yCheckbox);
defineElement('compa11y-checkbox-group', Compa11yCheckboxGroup);

export default Compa11yCheckbox;
