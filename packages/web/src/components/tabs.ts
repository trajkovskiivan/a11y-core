/**
 * compa11y Tabs Web Component
 *
 * Usage:
 * <compa11y-tabs>
 *   <button role="tab" aria-controls="panel-1">Tab 1</button>
 *   <button role="tab" aria-controls="panel-2">Tab 2</button>
 *   <div role="tabpanel" id="panel-1">Content 1</div>
 *   <div role="tabpanel" id="panel-2">Content 2</div>
 * </compa11y-tabs>
 */

import { announce } from '@compa11y/core';
import { Compa11yElement, defineElement } from '../utils/base-element';
import { TABS_STYLES } from '../utils/styles';

export class Compa11yTabs extends Compa11yElement {
  private _tabs: HTMLElement[] = [];
  private _panels: HTMLElement[] = [];
  private _selectedIndex = 0;
  private _focusedIndex = 0;
  private _tabSlotEl: Element | null = null;
  private _panelSlotEl: Element | null = null;
  private _defaultSlotEl: Element | null = null;

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
    this._tabSlotEl = this.shadowRoot?.querySelector('slot[name="tab"]') ?? null;
    this._panelSlotEl = this.shadowRoot?.querySelector('slot[name="panel"]') ?? null;
    this._defaultSlotEl = this.shadowRoot?.querySelector('slot:not([name])') ?? null;

    this._tabSlotEl?.addEventListener('slotchange', this.updateTabsAndPanels);
    this._panelSlotEl?.addEventListener('slotchange', this.updateTabsAndPanels);
    this._defaultSlotEl?.addEventListener('slotchange', this.updateTabsAndPanels);
  }

  protected cleanupEventListeners(): void {
    this.removeEventListener('click', this.handleClick);
    this.removeEventListener('keydown', this.handleKeyDown);
    this._tabSlotEl?.removeEventListener('slotchange', this.updateTabsAndPanels);
    this._panelSlotEl?.removeEventListener('slotchange', this.updateTabsAndPanels);
    this._defaultSlotEl?.removeEventListener('slotchange', this.updateTabsAndPanels);
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
        this._focusedIndex = index;
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

    let newIndex = this._focusedIndex;

    switch (event.key) {
      case nextKey:
        event.preventDefault();
        newIndex = (this._focusedIndex + 1) % this._tabs.length;
        break;
      case prevKey:
        event.preventDefault();
        newIndex =
          (this._focusedIndex - 1 + this._tabs.length) % this._tabs.length;
        break;
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        newIndex = this._tabs.length - 1;
        break;
      case 'Enter':
      case ' ':
        // In manual mode, Enter/Space activates the focused tab
        event.preventDefault();
        this.selectTab(this._focusedIndex);
        return;
      default:
        return;
    }

    // Update focused index and move focus
    this._focusedIndex = newIndex;
    this._tabs[newIndex]?.focus();

    // In automatic mode, selection follows focus
    if (this.activationMode === 'automatic') {
      this.selectTab(newIndex);
    }
  };

  private selectTab(index: number): void {
    const oldIndex = this._selectedIndex;
    this._selectedIndex = index;
    this._focusedIndex = index;
    this.updateSelection();

    if (oldIndex !== index) {
      const tab = this._tabs[index];
      announce(`${tab?.textContent || 'Tab'} selected`);
      this.emit('compa11y-tabs-change', {
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

defineElement('compa11y-tabs', Compa11yTabs);

export default Compa11yTabs;
