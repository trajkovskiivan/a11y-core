/**
 * a11y-core Tabs Web Component
 *
 * Usage:
 * <a11y-tabs>
 *   <button role="tab" aria-controls="panel-1">Tab 1</button>
 *   <button role="tab" aria-controls="panel-2">Tab 2</button>
 *   <div role="tabpanel" id="panel-1">Content 1</div>
 *   <div role="tabpanel" id="panel-2">Content 2</div>
 * </a11y-tabs>
 */

import { announce } from '@a11y-core/core';
import { A11yKitElement, defineElement } from '../utils/base-element';
import { TABS_STYLES } from '../utils/styles';

export class A11yTabs extends A11yKitElement {
  private _tabs: HTMLElement[] = [];
  private _panels: HTMLElement[] = [];
  private _selectedIndex = 0;

  static get observedAttributes() {
    return ['orientation', 'activation-mode', 'selected-index'];
  }

  get selectedIndex(): number {
    return this._selectedIndex;
  }

  set selectedIndex(value: number) {
    if (value >= 0 && value < this._tabs.length) {
      this._selectedIndex = value;
      this.updateSelection();
    }
  }

  get orientation(): 'horizontal' | 'vertical' {
    return (
      (this.getAttribute('orientation') as 'horizontal' | 'vertical') ||
      'horizontal'
    );
  }

  get activationMode(): 'automatic' | 'manual' {
    return (
      (this.getAttribute('activation-mode') as 'automatic' | 'manual') ||
      'automatic'
    );
  }

  protected setupAccessibility(): void {
    this.updateTabsAndPanels();
  }

  protected render(): void {
    const shadow = this.attachShadow({ mode: 'open' });

    shadow.innerHTML = `
      <style>${TABS_STYLES}</style>
      <div class="tablist" role="tablist" aria-orientation="${this.orientation}" part="tablist">
        <slot name="tab"></slot>
      </div>
      <div class="panels" part="panels">
        <slot name="panel"></slot>
      </div>
      <slot></slot>
    `;
  }

  protected setupEventListeners(): void {
    this.addEventListener('click', this.handleClick);
    this.addEventListener('keydown', this.handleKeyDown);

    // Watch for slot changes
    const tabSlot = this.shadowRoot?.querySelector('slot[name="tab"]');
    const panelSlot = this.shadowRoot?.querySelector('slot[name="panel"]');
    const defaultSlot = this.shadowRoot?.querySelector('slot:not([name])');

    tabSlot?.addEventListener('slotchange', this.updateTabsAndPanels);
    panelSlot?.addEventListener('slotchange', this.updateTabsAndPanels);
    defaultSlot?.addEventListener('slotchange', this.updateTabsAndPanels);
  }

  protected onAttributeChange(
    name: string,
    _oldValue: string | null,
    newValue: string | null
  ): void {
    if (name === 'orientation') {
      const tablist = this.shadowRoot?.querySelector('[role="tablist"]');
      tablist?.setAttribute('aria-orientation', newValue || 'horizontal');
    }
    if (name === 'selected-index' && newValue) {
      this.selectedIndex = parseInt(newValue, 10);
    }
  }

  private updateTabsAndPanels = (): void => {
    // Get tabs and panels from slots or direct children
    this._tabs = Array.from(
      this.querySelectorAll('[role="tab"]')
    ) as HTMLElement[];

    this._panels = Array.from(
      this.querySelectorAll('[role="tabpanel"]')
    ) as HTMLElement[];

    // Set up ARIA relationships
    this._tabs.forEach((tab, index) => {
      const panel = this._panels[index];
      const tabId = tab.id || `${this._id}-tab-${index}`;
      const panelId = panel?.id || `${this._id}-panel-${index}`;

      tab.id = tabId;
      tab.setAttribute('aria-controls', panelId);
      tab.setAttribute('tabindex', index === this._selectedIndex ? '0' : '-1');
      tab.setAttribute('aria-selected', String(index === this._selectedIndex));

      // Assign to slot if not already
      if (!tab.hasAttribute('slot')) {
        tab.setAttribute('slot', 'tab');
      }

      if (panel) {
        panel.id = panelId;
        panel.setAttribute('aria-labelledby', tabId);
        panel.setAttribute('tabindex', '0');
        panel.hidden = index !== this._selectedIndex;

        if (!panel.hasAttribute('slot')) {
          panel.setAttribute('slot', 'panel');
        }
      }
    });

    this.updateSelection();
  };

  private handleClick = (event: Event): void => {
    const target = event.target as HTMLElement;
    if (target.getAttribute('role') === 'tab') {
      const index = this._tabs.indexOf(target);
      if (index !== -1 && target.getAttribute('aria-disabled') !== 'true') {
        this.selectTab(index);
      }
    }
  };

  private handleKeyDown = (event: KeyboardEvent): void => {
    const target = event.target as HTMLElement;
    if (target.getAttribute('role') !== 'tab') return;

    const isHorizontal = this.orientation === 'horizontal';
    const nextKey = isHorizontal ? 'ArrowRight' : 'ArrowDown';
    const prevKey = isHorizontal ? 'ArrowLeft' : 'ArrowUp';

    let newIndex = this._selectedIndex;

    switch (event.key) {
      case nextKey:
        event.preventDefault();
        newIndex = (this._selectedIndex + 1) % this._tabs.length;
        break;
      case prevKey:
        event.preventDefault();
        newIndex =
          (this._selectedIndex - 1 + this._tabs.length) % this._tabs.length;
        break;
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        newIndex = this._tabs.length - 1;
        break;
      default:
        return;
    }

    // Focus the new tab
    this._tabs[newIndex]?.focus();

    // Select if automatic activation
    if (this.activationMode === 'automatic') {
      this.selectTab(newIndex);
    }
  };

  private selectTab(index: number): void {
    const oldIndex = this._selectedIndex;
    this._selectedIndex = index;
    this.updateSelection();

    if (oldIndex !== index) {
      const tab = this._tabs[index];
      announce(`${tab?.textContent || 'Tab'} selected`);
      this.emit('a11y-tabs-change', {
        index,
        tab: this._tabs[index],
        panel: this._panels[index],
      });
    }
  }

  private updateSelection(): void {
    this._tabs.forEach((tab, index) => {
      const isSelected = index === this._selectedIndex;
      tab.setAttribute('aria-selected', String(isSelected));
      tab.setAttribute('tabindex', isSelected ? '0' : '-1');
    });

    this._panels.forEach((panel, index) => {
      panel.hidden = index !== this._selectedIndex;
    });
  }

  /**
   * Select a tab by index
   */
  select(index: number): void {
    this.selectTab(index);
  }

  /**
   * Select next tab
   */
  next(): void {
    this.selectTab((this._selectedIndex + 1) % this._tabs.length);
  }

  /**
   * Select previous tab
   */
  previous(): void {
    this.selectTab(
      (this._selectedIndex - 1 + this._tabs.length) % this._tabs.length
    );
  }
}

defineElement('a11y-tabs', A11yTabs);

export default A11yTabs;
