/**
 * compa11y Menu Web Component
 *
 * Usage:
 * <a11y-menu>
 *   <button slot="trigger">Open Menu</button>
 *   <button role="menuitem">Option 1</button>
 *   <button role="menuitem">Option 2</button>
 *   <div role="separator"></div>
 *   <button role="menuitem">Option 3</button>
 * </a11y-menu>
 */

// No core imports needed - using base element
import { A11yKitElement, defineElement } from '../utils/base-element';
import { MENU_STYLES } from '../utils/styles';

export class A11yMenu extends A11yKitElement {
  private _open = false;
  private _highlightedIndex = -1;
  private _menuItems: HTMLElement[] = [];

  static get observedAttributes() {
    return ['open'];
  }

  get open(): boolean {
    return this._open;
  }

  set open(value: boolean) {
    const oldValue = this._open;
    this._open = value;

    if (value !== oldValue) {
      this.updateMenuVisibility();
    }

    this.toggleAttribute('open', value);
  }

  protected setupAccessibility(): void {
    // Set up trigger
    const trigger = this.querySelector('[slot="trigger"]') as HTMLElement;
    if (trigger) {
      trigger.setAttribute('aria-haspopup', 'menu');
      trigger.setAttribute('aria-expanded', String(this._open));
      trigger.id = trigger.id || `${this._id}-trigger`;
      // Safari fix: Ensure button is in tab order (Safari skips buttons by default)
      if (!trigger.hasAttribute('tabindex')) {
        trigger.setAttribute('tabindex', '0');
      }
    }
  }

  protected render(): void {
    const shadow = this.attachShadow({ mode: 'open' });

    shadow.innerHTML = `
      <style>${MENU_STYLES}</style>
      <slot name="trigger"></slot>
      <div
        class="menu-content"
        role="menu"
        aria-labelledby="${this._id}-trigger"
        tabindex="-1"
        hidden
        part="menu"
      >
        <slot></slot>
      </div>
    `;
  }

  protected setupEventListeners(): void {
    // Trigger click - attach to light DOM element
    const trigger = this.querySelector('[slot="trigger"]');
    trigger?.addEventListener('click', this.handleTriggerClick);
    trigger?.addEventListener(
      'keydown',
      this.handleTriggerKeyDown as EventListener
    );

    // Safari fix: Also listen on the trigger slot for clicks
    // Safari has issues with click events on slotted content not bubbling properly
    const triggerSlot = this.shadowRoot?.querySelector('slot[name="trigger"]');
    triggerSlot?.addEventListener('click', this.handleTriggerClick);

    // Menu items
    this.addEventListener('click', this.handleItemClick);
    this.addEventListener('keydown', this.handleMenuKeyDown);
    this.addEventListener('mouseover', this.handleMouseOver);

    // Outside click
    document.addEventListener('mousedown', this.handleOutsideClick);

    // Slot change
    const slot = this.shadowRoot?.querySelector('slot:not([name])');
    slot?.addEventListener('slotchange', this.updateMenuItems);

    // Initialize menu items immediately (Safari may not fire slotchange)
    this.updateMenuItems();
  }

  protected cleanupEventListeners(): void {
    document.removeEventListener('mousedown', this.handleOutsideClick);
  }

  protected onAttributeChange(
    name: string,
    _oldValue: string | null,
    newValue: string | null
  ): void {
    if (name === 'open') {
      this.open = newValue !== null;
    }
  }

  private updateMenuItems = (): void => {
    this._menuItems = Array.from(
      this.querySelectorAll('[role="menuitem"]:not([aria-disabled="true"])')
    ) as HTMLElement[];

    // Set up IDs and tabindex
    this._menuItems.forEach((item, index) => {
      item.id = item.id || `${this._id}-item-${index}`;
      item.setAttribute('tabindex', '-1');
    });
  };

  private _lastClickTime = 0;

  private handleTriggerClick = (): void => {
    // Debounce to prevent double-firing (Safari fix has dual listeners)
    const now = Date.now();
    if (now - this._lastClickTime < 50) return;
    this._lastClickTime = now;

    this.toggle();
  };

  private handleTriggerKeyDown = (event: KeyboardEvent): void => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.toggle();
        if (this._open) {
          this.highlightItem(0);
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!this._open) {
          this.show();
        }
        this.highlightItem(0);
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!this._open) {
          this.show();
        }
        this.highlightItem(this._menuItems.length - 1);
        break;
    }
  };

  private handleMenuKeyDown = (event: KeyboardEvent): void => {
    if (!this._open) return;

    const target = event.target as HTMLElement;
    if (
      !target.hasAttribute('role') ||
      target.getAttribute('role') !== 'menuitem'
    ) {
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.highlightItem(
          (this._highlightedIndex + 1) % this._menuItems.length
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.highlightItem(
          (this._highlightedIndex - 1 + this._menuItems.length) %
            this._menuItems.length
        );
        break;
      case 'Home':
        event.preventDefault();
        this.highlightItem(0);
        break;
      case 'End':
        event.preventDefault();
        this.highlightItem(this._menuItems.length - 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.selectItem(this._highlightedIndex);
        break;
      case 'Escape':
        event.preventDefault();
        this.close();
        break;
      case 'Tab':
        this.close();
        break;
    }
  };

  private handleItemClick = (event: Event): void => {
    const target = event.target as HTMLElement;
    if (target.getAttribute('role') === 'menuitem') {
      if (target.getAttribute('aria-disabled') !== 'true') {
        const index = this._menuItems.indexOf(target);
        this.selectItem(index);
      }
    }
  };

  private handleMouseOver = (event: Event): void => {
    const target = event.target as HTMLElement;
    if (target.getAttribute('role') === 'menuitem') {
      const index = this._menuItems.indexOf(target);
      if (index !== -1) {
        this.highlightItem(index, false);
      }
    }
  };

  private handleOutsideClick = (event: MouseEvent): void => {
    if (!this._open) return;

    const path = event.composedPath();
    if (!path.includes(this)) {
      this.close();
    }
  };

  private highlightItem(index: number, focus = true): void {
    // Remove highlight from previous
    if (this._highlightedIndex >= 0) {
      const prev = this._menuItems[this._highlightedIndex];
      prev?.removeAttribute('data-highlighted');
    }

    // Add highlight to new
    this._highlightedIndex = index;
    const item = this._menuItems[index];
    if (item) {
      item.setAttribute('data-highlighted', 'true');
      if (focus) {
        item.focus();
      }

      // Update aria-activedescendant
      const menu = this.shadowRoot?.querySelector('[role="menu"]');
      menu?.setAttribute('aria-activedescendant', item.id);
    }
  }

  private selectItem(index: number): void {
    const item = this._menuItems[index];
    if (item) {
      this.emit('a11y-menu-select', { item, index });
      item.click();
    }
    this.close();
  }

  private updateMenuVisibility(): void {
    const menu = this.shadowRoot?.querySelector('.menu-content') as HTMLElement;
    const trigger = this.querySelector('[slot="trigger"]') as HTMLElement;

    if (this._open) {
      menu?.removeAttribute('hidden');
      trigger?.setAttribute('aria-expanded', 'true');
      this.updateMenuItems();
      this.emit('a11y-menu-open');
    } else {
      menu?.setAttribute('hidden', '');
      trigger?.setAttribute('aria-expanded', 'false');
      this._highlightedIndex = -1;

      // Clear highlights
      this._menuItems.forEach((item) => {
        item.removeAttribute('data-highlighted');
      });

      // Return focus to trigger
      trigger?.focus();
      this.emit('a11y-menu-close');
    }
  }

  /**
   * Show the menu
   */
  show(): void {
    this.open = true;
  }

  /**
   * Hide the menu
   */
  close(): void {
    this.open = false;
  }

  /**
   * Toggle the menu
   */
  toggle(): void {
    this.open = !this._open;
  }
}

defineElement('a11y-menu', A11yMenu);

export default A11yMenu;
