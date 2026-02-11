/**
 * compa11y Switch Web Component
 *
 * An accessible toggle switch (on/off control) following WAI-ARIA Switch pattern.
 *
 * @example
 * ```html
 * <!-- Basic usage -->
 * <a11y-switch label="Enable notifications"></a11y-switch>
 *
 * <!-- Checked by default -->
 * <a11y-switch checked label="Dark mode"></a11y-switch>
 *
 * <!-- Disabled -->
 * <a11y-switch disabled label="Unavailable feature"></a11y-switch>
 *
 * <!-- Different sizes -->
 * <a11y-switch size="sm" label="Small"></a11y-switch>
 * <a11y-switch size="md" label="Medium"></a11y-switch>
 * <a11y-switch size="lg" label="Large"></a11y-switch>
 *
 * <!-- Listen to changes -->
 * <a11y-switch
 *   label="Notifications"
 *   onchange="handleChange(event.detail.checked)"
 * ></a11y-switch>
 * ```
 *
 * @fires change - Emitted when the switch state changes, detail: { checked: boolean }
 *
 * @attr {boolean} checked - Whether the switch is on
 * @attr {boolean} disabled - Whether the switch is disabled
 * @attr {string} label - Visible label text
 * @attr {string} size - Size variant: 'sm' | 'md' | 'lg' (default: 'md')
 * @attr {string} aria-label - Accessible label (if no visible label)
 *
 * @cssprop --compa11y-switch-bg - Background color when unchecked
 * @cssprop --compa11y-switch-checked-bg - Background color when checked
 * @cssprop --compa11y-switch-thumb-bg - Thumb background color
 * @cssprop --compa11y-switch-thumb-shadow - Thumb shadow
 * @cssprop --compa11y-switch-label-color - Label text color
 * @cssprop --compa11y-focus-color - Focus outline color
 */

import { announcePolite } from '@compa11y/core';
import { A11yKitElement, defineElement } from '../utils/base-element';
import { SWITCH_STYLES } from '../utils/styles';

export class A11ySwitch extends A11yKitElement {
  private _checked = false;
  private _button: HTMLButtonElement | null = null;
  private _label: HTMLLabelElement | null = null;

  static get observedAttributes() {
    return ['checked', 'disabled', 'label', 'size', 'aria-label'];
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
      this.emit('change', { checked: value });
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

  protected setupAccessibility(): void {
    // Set role if not already set
    if (!this.getAttribute('role')) {
      // The button inside has role="switch", host element doesn't need a role
    }

    // Warn if no accessible label
    if (
      typeof process !== 'undefined' &&
      process.env?.NODE_ENV !== 'production'
    ) {
      if (!this.label && !this.getAttribute('aria-label')) {
        console.warn(
          '[compa11y/Switch] Switch has no accessible label. Add label="..." or aria-label="..." attribute.\n' +
            '💡 Suggestion: <a11y-switch label="Enable feature"></a11y-switch>'
        );
      }
    }
  }

  protected render(): void {
    const shadow = this.attachShadow({ mode: 'open' });
    const labelId = `${this._id}-label`;
    const hasLabel = Boolean(this.label);
    const ariaLabel = this.getAttribute('aria-label');

    // Determine aria-label vs aria-labelledby
    const ariaLabelAttr = hasLabel
      ? ''
      : ariaLabel
        ? `aria-label="${ariaLabel}"`
        : '';
    const ariaLabelledByAttr = hasLabel ? `aria-labelledby="${labelId}"` : '';

    shadow.innerHTML = `
      <style>${SWITCH_STYLES}</style>
      <div class="switch-wrapper size-${this.size}" part="wrapper">
        <button
          type="button"
          role="switch"
          aria-checked="${this._checked}"
          ${ariaLabelAttr}
          ${ariaLabelledByAttr}
          ${this.disabled ? 'disabled' : ''}
          class="switch-track ${this._checked ? 'checked' : ''}"
          part="track"
          tabindex="${this.disabled ? '-1' : '0'}"
        >
          <span class="switch-thumb" part="thumb" aria-hidden="true"></span>
        </button>
        ${
          hasLabel
            ? `<label id="${labelId}" class="switch-label ${this.disabled ? 'disabled' : ''}" part="label">${this.label}</label>`
            : ''
        }
      </div>
    `;

    // Cache references
    this._button = shadow.querySelector('button');
    this._label = shadow.querySelector('label');
  }

  protected setupEventListeners(): void {
    this._button?.addEventListener('click', this.handleClick);
    this._button?.addEventListener('keydown', this.handleKeyDown);
    this._label?.addEventListener('click', this.handleLabelClick);
  }

  protected cleanupEventListeners(): void {
    this._button?.removeEventListener('click', this.handleClick);
    this._button?.removeEventListener('keydown', this.handleKeyDown);
    this._label?.removeEventListener('click', this.handleLabelClick);
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
      case 'disabled':
        this.updateDisabledState();
        break;
      case 'label':
      case 'aria-label':
        // Re-render to update label
        if (this.shadowRoot) {
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
   * Handle click on the switch button
   */
  private handleClick = (): void => {
    this.toggle();
  };

  /**
   * Handle keyboard events
   * Space and Enter should toggle the switch
   */
  private handleKeyDown = (event: KeyboardEvent): void => {
    if (this.disabled) return;

    // Space or Enter toggles the switch
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      this.toggle();
    }
  };

  /**
   * Handle click on the label
   */
  private handleLabelClick = (): void => {
    if (this.disabled) return;
    this.toggle();
    // Focus the button after clicking the label (better UX)
    this._button?.focus();
  };

  /**
   * Update the visual state (checked class and aria-checked)
   */
  private updateVisualState(): void {
    if (this._button) {
      this._button.setAttribute('aria-checked', String(this._checked));
      this._button.classList.toggle('checked', this._checked);
    }
  }

  /**
   * Update the disabled state
   */
  private updateDisabledState(): void {
    if (this._button) {
      if (this.disabled) {
        this._button.setAttribute('disabled', '');
        this._button.setAttribute('tabindex', '-1');
      } else {
        this._button.removeAttribute('disabled');
        this._button.setAttribute('tabindex', '0');
      }
    }

    if (this._label) {
      this._label.classList.toggle('disabled', this.disabled);
    }
  }

  /**
   * Update the size class
   */
  private updateSizeClass(): void {
    const wrapper = this.shadowRoot?.querySelector('.switch-wrapper');
    if (wrapper) {
      wrapper.classList.remove('size-sm', 'size-md', 'size-lg');
      wrapper.classList.add(`size-${this.size}`);
    }
  }

  /**
   * Public method to toggle the switch programmatically
   */
  public toggle(): void {
    if (this.disabled) return;

    this.checked = !this.checked;

    // Announce state change to screen readers
    const labelText = this.label || this.getAttribute('aria-label') || 'Switch';
    announcePolite(`${labelText} ${this.checked ? 'on' : 'off'}`);
  }

  /**
   * Public method to open/close programmatically
   */
  public setChecked(checked: boolean): void {
    this.checked = checked;
  }
}

// Register the custom element
defineElement('a11y-switch', A11ySwitch);

export default A11ySwitch;
