/**
 * compa11y CommandPalette Web Component
 *
 * Usage:
 * <compa11y-command-palette trigger="#open-btn">
 *   <h2 slot="title">Command palette</h2>
 *   <p slot="description">Type to search commands.</p>
 *
 *   <div slot="item" data-value="Go to Projects" data-group="Navigation">Go to Projects</div>
 *   <div slot="item" data-value="Create project" data-shortcut="⌘N" data-group="Actions">Create project</div>
 *   <div slot="item" data-value="Danger action" data-disabled data-group="Actions">Danger action</div>
 * </compa11y-command-palette>
 */

import { announce, createComponentWarnings } from '@compa11y/core';
import { Compa11yElement, defineElement } from '../utils/base-element';
import { COMMAND_PALETTE_STYLES } from '../utils/styles';

const warn = createComponentWarnings('CommandPalette');

// Body scroll lock
let bodyLockCount = 0;
let savedOverflow = '';

function lockBodyScroll(): void {
  if (bodyLockCount === 0) {
    savedOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  bodyLockCount++;
}

function unlockBodyScroll(): void {
  bodyLockCount--;
  if (bodyLockCount <= 0) {
    bodyLockCount = 0;
    document.body.style.overflow = savedOverflow;
  }
}

interface PaletteItem {
  value: string;
  keywords: string[];
  group: string;
  shortcut: string;
  disabled: boolean;
  href: string;
  element: HTMLElement;
}

export class Compa11yCommandPalette extends Compa11yElement {
  private _open = false;
  private _previouslyFocused: HTMLElement | null = null;
  private _triggerElement: HTMLElement | null = null;
  private _inputElement: HTMLInputElement | null = null;
  private _listElement: HTMLElement | null = null;
  private _items: PaletteItem[] = [];
  private _filteredItems: PaletteItem[] = [];
  private _highlightedIndex = -1;
  private _query = '';

  static get observedAttributes() {
    return ['open', 'trigger', 'placeholder', 'loop'];
  }

  get open(): boolean {
    return this._open;
  }

  set open(value: boolean) {
    const oldValue = this._open;
    this._open = value;

    if (value !== oldValue) {
      if (value) {
        this.showPalette();
      } else {
        this.hidePalette();
      }
    }

    this.toggleAttribute('open', value);
  }

  protected setupAccessibility(): void {
    // Dev warning for missing title
    const titleSlot = this.querySelector('[slot="title"]');
    if (!titleSlot && !this.getAttribute('aria-label')) {
      warn.warning(
        'CommandPalette has no accessible title. Add a [slot="title"] element or aria-label attribute.'
      );
    }
  }

  protected render(): void {
    const shadow = this.attachShadow({ mode: 'open' });
    const titleId = `${this._id}-title`;
    const descId = `${this._id}-desc`;
    const inputId = `${this._id}-input`;
    const listboxId = `${this._id}-listbox`;
    const placeholder = this.getAttribute('placeholder') || 'Type a command…';

    shadow.innerHTML = `
      <style>${COMMAND_PALETTE_STYLES}</style>
      <div class="overlay" part="overlay"></div>
      <div
        class="palette"
        role="dialog"
        aria-modal="true"
        aria-labelledby="${titleId}"
        aria-describedby="${descId}"
        part="palette"
      >
        <div id="${titleId}" part="title">
          <slot name="title"></slot>
        </div>
        <div id="${descId}" part="description">
          <slot name="description"></slot>
        </div>

        <div class="input-wrapper" part="input-wrapper">
          <span class="search-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
              <circle cx="6.5" cy="6.5" r="4" stroke="currentColor" stroke-width="1.5"/>
              <path d="M9.5 9.5L13 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </span>
          <input
            id="${inputId}"
            type="text"
            role="combobox"
            autocomplete="off"
            aria-expanded="true"
            aria-controls="${listboxId}"
            aria-haspopup="listbox"
            aria-autocomplete="list"
            placeholder="${placeholder}"
            part="input"
          />
          <button type="button" class="clear-button" aria-label="Clear search" tabindex="-1" hidden part="clear-button">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" focusable="false">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <div
          id="${listboxId}"
          class="list"
          role="listbox"
          aria-label="Command results"
          part="list"
        ></div>

        <div class="footer" part="footer">
          <slot name="footer"></slot>
        </div>

        <div class="items-source" hidden>
          <slot name="item"></slot>
        </div>
      </div>
    `;

    this._inputElement = shadow.querySelector('input');
    this._listElement = shadow.querySelector('.list');

    // Hide by default
    if (!this._open) {
      this.style.display = 'none';
    }
  }

  protected setupEventListeners(): void {
    // Trigger setup
    const triggerSelector = this.getAttribute('trigger');
    if (triggerSelector) {
      const setupTrigger = () => {
        this._triggerElement = document.querySelector(triggerSelector);
        if (this._triggerElement) {
          this._triggerElement.addEventListener('click', this.handleTriggerClick);
        }
      };

      setupTrigger();
      if (!this._triggerElement) {
        requestAnimationFrame(() => {
          setupTrigger();
          if (!this._triggerElement) setTimeout(setupTrigger, 0);
        });
      }
    }

    // Global Ctrl/Cmd+K shortcut
    document.addEventListener('keydown', this.handleGlobalKeyDown);

    // Input events
    this._inputElement?.addEventListener('input', this.handleInput);
    this._inputElement?.addEventListener('keydown', this.handleKeyDown);

    // Clear button
    const clearButton = this.shadowRoot?.querySelector('.clear-button');
    clearButton?.addEventListener('click', this.handleClear);

    // Overlay click
    const overlay = this.shadowRoot?.querySelector('.overlay');
    overlay?.addEventListener('click', this.handleClose);

    // Keyboard (Escape, Tab trap)
    this.addEventListener('keydown', this.handleDialogKeyDown);

    // Slot change
    const slot = this.shadowRoot?.querySelector('slot[name="item"]');
    slot?.addEventListener('slotchange', this.updateItems);

    // Initial items
    this.updateItems();
  }

  protected cleanupEventListeners(): void {
    this._triggerElement?.removeEventListener('click', this.handleTriggerClick);
    document.removeEventListener('keydown', this.handleGlobalKeyDown);
    this.removeEventListener('keydown', this.handleDialogKeyDown);
  }

  protected onAttributeChange(
    name: string,
    _oldValue: string | null,
    newValue: string | null
  ): void {
    if (name === 'open') {
      this.open = newValue !== null;
    }
    if (name === 'placeholder' && this._inputElement) {
      this._inputElement.placeholder = newValue || 'Type a command…';
    }
  }

  private updateItems = (): void => {
    const itemElements = Array.from(this.querySelectorAll('[slot="item"]'));
    this._items = itemElements.map((el) => ({
      value: el.getAttribute('data-value') || el.textContent?.trim() || '',
      keywords: (el.getAttribute('data-keywords') || '').split(',').filter(Boolean),
      group: el.getAttribute('data-group') || '',
      shortcut: el.getAttribute('data-shortcut') || '',
      disabled: el.hasAttribute('data-disabled'),
      href: el.getAttribute('data-href') || '',
      element: el as HTMLElement,
    }));
    this._filteredItems = [...this._items];
    this.renderItems();
  };

  private renderItems(): void {
    if (!this._listElement) return;

    if (this._filteredItems.length === 0 && this._query.length > 0) {
      this._listElement.innerHTML =
        '<div class="empty" role="presentation" part="empty">No results found</div>';
      return;
    }

    // Group items
    const groups = new Map<string, PaletteItem[]>();
    const ungrouped: PaletteItem[] = [];

    for (const item of this._filteredItems) {
      if (item.group) {
        const list = groups.get(item.group) || [];
        list.push(item);
        groups.set(item.group, list);
      } else {
        ungrouped.push(item);
      }
    }

    let html = '';
    let globalIndex = 0;

    const renderItem = (item: PaletteItem): string => {
      const idx = globalIndex++;
      const optionId = `${this._id}-opt-${idx}`;
      return `
        <div
          id="${optionId}"
          class="item"
          role="option"
          aria-selected="${idx === this._highlightedIndex}"
          aria-disabled="${item.disabled}"
          data-value="${item.value}"
          data-index="${idx}"
          part="item"
        >
          <span>${item.value}</span>
          ${item.shortcut ? `<kbd class="shortcut" aria-hidden="true" part="shortcut">${item.shortcut}</kbd>` : ''}
        </div>
      `;
    };

    // Render ungrouped first
    for (const item of ungrouped) {
      html += renderItem(item);
    }

    // Render each group
    for (const [groupName, items] of groups) {
      html += `<div class="group-label" aria-hidden="true" part="group-label">${groupName}</div>`;
      for (const item of items) {
        html += renderItem(item);
      }
    }

    this._listElement.innerHTML = html;

    // Attach click/hover handlers
    this._listElement.querySelectorAll('.item').forEach((el) => {
      el.addEventListener('click', this.handleItemClick);
      el.addEventListener('mouseenter', this.handleItemHover);
    });
  }

  private handleTriggerClick = (): void => {
    this.open = true;
  };

  private handleClose = (): void => {
    this.open = false;
  };

  private handleClear = (): void => {
    this._query = '';
    if (this._inputElement) {
      this._inputElement.value = '';
      this._inputElement.focus();
    }
    this._filteredItems = [...this._items];
    this._highlightedIndex = this._filteredItems.length > 0 ? 0 : -1;
    this.renderItems();
    this.updateHighlight();
    this.updateClearButton();
  };

  private handleGlobalKeyDown = (event: KeyboardEvent): void => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      this.open = !this._open;
    }
  };

  private handleInput = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    this._query = target.value;

    const q = this._query.toLowerCase();
    this._filteredItems = q
      ? this._items.filter((item) => {
          if (item.value.toLowerCase().includes(q)) return true;
          if (item.keywords.some((kw) => kw.toLowerCase().includes(q))) return true;
          return false;
        })
      : [...this._items];

    this._highlightedIndex = this._filteredItems.length > 0 ? 0 : -1;
    this.renderItems();
    this.updateActiveDescendant();
    this.updateClearButton();

    // Announce result count
    const count = this._filteredItems.length;
    announce(
      count === 0
        ? 'No results'
        : `${count} result${count === 1 ? '' : 's'} available`,
      { politeness: 'polite' }
    );
  };

  private handleKeyDown = (event: KeyboardEvent): void => {
    const shouldLoop = this.getAttribute('loop') !== 'false';
    const count = this._filteredItems.length;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (count > 0) {
          this._highlightedIndex = shouldLoop
            ? (this._highlightedIndex + 1) % count
            : Math.min(this._highlightedIndex + 1, count - 1);
          this.updateHighlight();
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (count > 0) {
          this._highlightedIndex = shouldLoop
            ? (this._highlightedIndex - 1 + count) % count
            : Math.max(this._highlightedIndex - 1, 0);
          this.updateHighlight();
        }
        break;

      case 'Enter':
        event.preventDefault();
        if (this._highlightedIndex >= 0) {
          const item = this._filteredItems[this._highlightedIndex];
          if (item && !item.disabled) {
            this.selectItem(item);
          }
        }
        break;

      case 'Home':
        event.preventDefault();
        if (count > 0) {
          this._highlightedIndex = 0;
          this.updateHighlight();
        }
        break;

      case 'End':
        event.preventDefault();
        if (count > 0) {
          this._highlightedIndex = count - 1;
          this.updateHighlight();
        }
        break;
    }
  };

  private handleDialogKeyDown = (event: KeyboardEvent): void => {
    if (!this._open) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      this.handleClose();
      return;
    }

    // Tab trap
    if (event.key === 'Tab') {
      event.preventDefault();
      // Keep focus in the input
      this._inputElement?.focus();
    }
  };

  private handleItemClick = (event: Event): void => {
    const target = (event.currentTarget as HTMLElement);
    const value = target.getAttribute('data-value') || '';
    const item = this._filteredItems.find((i) => i.value === value);
    if (item && !item.disabled) {
      this.selectItem(item);
    }
  };

  private handleItemHover = (event: Event): void => {
    const target = (event.currentTarget as HTMLElement);
    const index = parseInt(target.getAttribute('data-index') || '0', 10);
    const item = this._filteredItems[index];
    if (item && !item.disabled) {
      this._highlightedIndex = index;
      this.updateHighlight();
    }
  };

  private selectItem(item: PaletteItem): void {
    this.emit('compa11y-command-palette-select', {
      value: item.value,
      href: item.href,
    });

    announce(`${item.value} selected`, { politeness: 'polite' });

    if (item.href) {
      window.location.href = item.href;
    }

    this.open = false;
  }

  private updateHighlight(): void {
    this._listElement?.querySelectorAll('.item').forEach((el, i) => {
      el.setAttribute('aria-selected', String(i === this._highlightedIndex));
    });

    this.updateActiveDescendant();

    // Scroll into view
    if (this._highlightedIndex >= 0) {
      const optionId = `${this._id}-opt-${this._highlightedIndex}`;
      const option = this._listElement?.querySelector(`#${optionId}`);
      option?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  private updateActiveDescendant(): void {
    if (this._highlightedIndex >= 0) {
      const optionId = `${this._id}-opt-${this._highlightedIndex}`;
      this._inputElement?.setAttribute('aria-activedescendant', optionId);
    } else {
      this._inputElement?.removeAttribute('aria-activedescendant');
    }
  }

  private updateClearButton(): void {
    const clearButton = this.shadowRoot?.querySelector('.clear-button') as HTMLElement;
    if (clearButton) {
      clearButton.hidden = !this._query;
    }
  }

  private showPalette(): void {
    this._previouslyFocused = document.activeElement as HTMLElement;
    this.style.display = 'flex';

    // Reset state
    this._query = '';
    this._highlightedIndex = this._filteredItems.length > 0 ? 0 : -1;
    this._filteredItems = [...this._items];
    this.renderItems();

    if (this._inputElement) {
      this._inputElement.value = '';
    }
    this.updateClearButton();

    requestAnimationFrame(() => {
      this._inputElement?.focus();
      this.updateHighlight();
    });

    lockBodyScroll();
    announce('Command palette opened', { politeness: 'polite' });
    this.emit('compa11y-command-palette-open');
  }

  private hidePalette(): void {
    this.style.display = 'none';
    unlockBodyScroll();

    this._previouslyFocused?.focus();
    this._previouslyFocused = null;

    announce('Command palette closed', { politeness: 'polite' });
    this.emit('compa11y-command-palette-close');
  }

  show(): void {
    this.open = true;
  }

  close(): void {
    this.open = false;
  }
}

defineElement('compa11y-command-palette', Compa11yCommandPalette);

export default Compa11yCommandPalette;
