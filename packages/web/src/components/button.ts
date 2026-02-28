/**
 * compa11y Button Web Component
 *
 * An accessible button with variant, size, loading, and discoverable support.
 *
 * @example
 * ```html
 * <compa11y-button variant="primary">Save</compa11y-button>
 * <compa11y-button variant="danger" loading>Deleting...</compa11y-button>
 * <compa11y-button variant="outline" disabled discoverable>Unavailable</compa11y-button>
 * ```
 *
 * @fires click - Standard click event (prevented when disabled/loading)
 * @fires a11y-button-click - Emitted on click when not disabled/loading
 *
 * @attr {string} variant - Visual variant (primary, secondary, danger, outline, ghost)
 * @attr {string} size - Size (sm, md, lg)
 * @attr {boolean} disabled - Whether the button is disabled
 * @attr {boolean} discoverable - Keep disabled button in tab order with aria-disabled
 * @attr {boolean} loading - Loading state (sets aria-busy, shows spinner)
 * @attr {string} type - Button type (button, submit, reset)
 * @attr {string} aria-label - Accessible label
 *
 * @cssprop --compa11y-button-radius - Border radius (default: 4px)
 * @cssprop --compa11y-button-font-weight - Font weight (default: 500)
 * @cssprop --compa11y-button-disabled-opacity - Disabled opacity (default: 0.5)
 * @cssprop --compa11y-button-primary-bg - Primary background (default: #0066cc)
 * @cssprop --compa11y-button-primary-color - Primary text color (default: white)
 * @cssprop --compa11y-button-danger-bg - Danger background (default: #ef4444)
 * @cssprop --compa11y-button-danger-color - Danger text color (default: white)
 * @cssprop --compa11y-focus-color - Focus outline color (default: #0066cc)
 */

import { Compa11yElement, defineElement } from '../utils/base-element';
import { BUTTON_STYLES } from '../utils/styles';

export class Compa11yButton extends Compa11yElement {
  private _buttonEl: HTMLButtonElement | null = null;

  static get observedAttributes() {
    return [
      'variant',
      'size',
      'disabled',
      'discoverable',
      'loading',
      'type',
      'aria-label',
    ];
  }

  // =========================================================================
  // Properties
  // =========================================================================

  get disabled(): boolean {
    return this.hasAttribute('disabled');
  }

  set disabled(v: boolean) {
    this.toggleAttribute('disabled', v);
  }

  get discoverable(): boolean {
    return this.hasAttribute('discoverable');
  }

  set discoverable(v: boolean) {
    this.toggleAttribute('discoverable', v);
  }

  get loading(): boolean {
    return this.hasAttribute('loading');
  }

  set loading(v: boolean) {
    this.toggleAttribute('loading', v);
  }

  get variant(): string {
    return this.getAttribute('variant') || 'secondary';
  }

  set variant(v: string) {
    this.setAttribute('variant', v);
  }

  get size(): string {
    return this.getAttribute('size') || 'md';
  }

  set size(v: string) {
    this.setAttribute('size', v);
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
        this.textContent?.trim() ||
        this.hasAttribute('aria-label') ||
        this.hasAttribute('aria-labelledby');
      if (!hasLabel) {
        console.warn(
          '[compa11y/Button] Button has no accessible label. Add text content, aria-label="...", or aria-labelledby="..." attribute.\n' +
            '💡 Suggestion: <compa11y-button>Click me</compa11y-button>'
        );
      }
    }
  }

  protected render(): void {
    const shadow = this.attachShadow({ mode: 'open' });
    const variant = this.variant;
    const size = this.size;
    const type = this.getAttribute('type') || 'button';
    const ariaLabel = this.getAttribute('aria-label') || '';
    const isDisabled = this.disabled;
    const isDiscoverable = this.discoverable;
    const isLoading = this.loading;
    const isInteractionDisabled = isDisabled || isLoading;
    const useNativeDisabled = isDisabled && !isDiscoverable;

    shadow.innerHTML = `
      <style>${BUTTON_STYLES}</style>
      <button
        class="variant-${variant} size-${size}"
        type="${type}"
        ${useNativeDisabled ? 'disabled' : ''}
        ${isInteractionDisabled ? 'aria-disabled="true"' : ''}
        ${isLoading ? 'aria-busy="true"' : ''}
        ${ariaLabel ? `aria-label="${ariaLabel}"` : ''}
        part="button"
      >${isLoading ? '<span class="button-spinner" aria-hidden="true" part="spinner"></span>' : ''}<slot></slot></button>
    `;

    this._buttonEl = shadow.querySelector('button');
  }

  protected setupEventListeners(): void {
    this._buttonEl?.addEventListener('click', this.handleClick);
  }

  protected cleanupEventListeners(): void {
    this._buttonEl?.removeEventListener('click', this.handleClick);
  }

  protected onAttributeChange(
    name: string,
    _oldValue: string | null,
    newValue: string | null
  ): void {
    switch (name) {
      case 'variant': {
        if (!this._buttonEl) break;
        // Remove old variant classes, add new one
        const classes = this._buttonEl.className.split(' ');
        const filtered = classes.filter((c) => !c.startsWith('variant-'));
        filtered.push(`variant-${newValue || 'secondary'}`);
        this._buttonEl.className = filtered.join(' ');
        break;
      }

      case 'size': {
        if (!this._buttonEl) break;
        const classes = this._buttonEl.className.split(' ');
        const filtered = classes.filter((c) => !c.startsWith('size-'));
        filtered.push(`size-${newValue || 'md'}`);
        this._buttonEl.className = filtered.join(' ');
        break;
      }

      case 'disabled':
      case 'discoverable':
        this.updateDisabledState();
        break;

      case 'loading':
        this.updateLoadingState();
        break;

      case 'type':
        if (this._buttonEl) {
          this._buttonEl.type = (newValue || 'button') as 'button' | 'reset' | 'submit';
        }
        break;

      case 'aria-label':
        if (this._buttonEl) {
          if (newValue) {
            this._buttonEl.setAttribute('aria-label', newValue);
          } else {
            this._buttonEl.removeAttribute('aria-label');
          }
        }
        break;
    }
  }

  // =========================================================================
  // Event handlers
  // =========================================================================

  private handleClick = (event: Event): void => {
    if (this.disabled || this.loading) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.emit('compa11y-button-click');
  };

  // =========================================================================
  // DOM update helpers
  // =========================================================================

  private updateDisabledState(): void {
    if (!this._buttonEl) return;
    const isDisabled = this.disabled;
    const isDiscoverable = this.discoverable;
    const isLoading = this.loading;
    const useNativeDisabled = isDisabled && !isDiscoverable;
    const isInteractionDisabled = isDisabled || isLoading;

    if (useNativeDisabled) {
      this._buttonEl.setAttribute('disabled', '');
    } else {
      this._buttonEl.removeAttribute('disabled');
    }

    if (isInteractionDisabled) {
      this._buttonEl.setAttribute('aria-disabled', 'true');
    } else {
      this._buttonEl.removeAttribute('aria-disabled');
    }
  }

  private updateLoadingState(): void {
    if (!this._buttonEl) return;
    const isLoading = this.loading;

    if (isLoading) {
      this._buttonEl.setAttribute('aria-busy', 'true');
      this._buttonEl.setAttribute('aria-disabled', 'true');
      // Add spinner if not present
      if (!this._buttonEl.querySelector('.button-spinner')) {
        const spinner = document.createElement('span');
        spinner.className = 'button-spinner';
        spinner.setAttribute('aria-hidden', 'true');
        spinner.setAttribute('part', 'spinner');
        this._buttonEl.insertBefore(spinner, this._buttonEl.firstChild);
      }
    } else {
      this._buttonEl.removeAttribute('aria-busy');
      // Remove spinner
      const spinner = this._buttonEl.querySelector('.button-spinner');
      spinner?.remove();
      // Re-evaluate disabled state
      this.updateDisabledState();
    }
  }

  // =========================================================================
  // Public methods
  // =========================================================================

  /** Focus the button element */
  public focus(): void {
    this._buttonEl?.focus();
  }

  /** Blur the button element */
  public blur(): void {
    this._buttonEl?.blur();
  }

  /** Programmatically click the button */
  public click(): void {
    this._buttonEl?.click();
  }
}

// Register the custom element
defineElement('compa11y-button', Compa11yButton);

export default Compa11yButton;
