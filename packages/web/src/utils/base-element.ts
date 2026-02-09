/**
 * Base class for a11y-core Web Components
 */

import { generateId } from '@a11y-core/core';

export abstract class A11yKitElement extends HTMLElement {
  protected _internals: ElementInternals | null = null;
  protected _id: string;

  constructor() {
    super();
    this._id = generateId(this.tagName.toLowerCase().replace('a11y-', ''));

    // Use ElementInternals if available
    if ('attachInternals' in this) {
      this._internals = this.attachInternals();
    }
  }

  /**
   * Standard observed attributes
   */
  static get observedAttributes(): string[] {
    return [];
  }

  /**
   * Called when element is added to DOM
   */
  connectedCallback(): void {
    this.setupAccessibility();
    this.render();
    this.setupEventListeners();
  }

  /**
   * Called when element is removed from DOM
   */
  disconnectedCallback(): void {
    this.cleanupEventListeners();
  }

  /**
   * Called when observed attributes change
   */
  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null
  ): void {
    if (oldValue !== newValue) {
      this.onAttributeChange(name, oldValue, newValue);
    }
  }

  /**
   * Set up ARIA attributes and roles
   */
  protected abstract setupAccessibility(): void;

  /**
   * Render the component
   */
  protected abstract render(): void;

  /**
   * Set up event listeners
   */
  protected setupEventListeners(): void {}

  /**
   * Clean up event listeners
   */
  protected cleanupEventListeners(): void {}

  /**
   * Handle attribute changes
   */
  protected onAttributeChange(
    _name: string,
    _oldValue: string | null,
    _newValue: string | null
  ): void {}

  /**
   * Emit a custom event
   */
  protected emit<T>(name: string, detail?: T): boolean {
    return this.dispatchEvent(
      new CustomEvent(name, {
        detail,
        bubbles: true,
        composed: true,
        cancelable: true,
      })
    );
  }

  /**
   * Query a slot
   */
  protected getSlot(name: string): HTMLSlotElement | null {
    return this.shadowRoot?.querySelector(`slot[name="${name}"]`) ?? null;
  }

  /**
   * Get slotted elements
   */
  protected getSlottedElements(slotName?: string): Element[] {
    const selector = slotName ? `slot[name="${slotName}"]` : 'slot:not([name])';
    const slot = this.shadowRoot?.querySelector(
      selector
    ) as HTMLSlotElement | null;
    return slot?.assignedElements() ?? [];
  }
}

/**
 * Helper to define a custom element safely
 */
export function defineElement(
  name: string,
  constructor: CustomElementConstructor
): void {
  if (!customElements.get(name)) {
    customElements.define(name, constructor);
  }
}
