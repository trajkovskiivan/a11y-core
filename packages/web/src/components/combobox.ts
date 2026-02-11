/**
 * compa11y Combobox Web Component
 *
 * Usage:
 * <a11y-combobox placeholder="Search...">
 *   <option value="1">Option 1</option>
 *   <option value="2">Option 2</option>
 *   <option value="3" disabled>Option 3 (disabled)</option>
 * </a11y-combobox>
 */

import { announce } from '@compa11y/core';
import { A11yKitElement, defineElement } from '../utils/base-element';
import { COMBOBOX_STYLES } from '../utils/styles';

interface ComboboxOption {
  value: string;
  label: string;
  disabled: boolean;
  element: HTMLElement;
}

export class A11yCombobox extends A11yKitElement {
  private _open = false;
  private _highlightedIndex = -1;
  private _options: ComboboxOption[] = [];
  private _filteredOptions: ComboboxOption[] = [];
  private _inputValue = '';
  private _selectedValue: string | null = null;
  private _inputElement: HTMLInputElement | null = null;
  private _listboxElement: HTMLElement | null = null;

  static get observedAttributes() {
    return ['open', 'value', 'placeholder', 'disabled', 'clearable'];
  }

  get open(): boolean {
    return this._open;
  }

  set open(value: boolean) {
    const oldValue = this._open;
    this._open = value;

    if (value !== oldValue) {
      this.updateListboxVisibility();
    }

    this.toggleAttribute('open', value);
  }

  get value(): string | null {
    return this._selectedValue;
  }

  set value(val: string | null) {
    this._selectedValue = val;
    const option = this._options.find((o) => o.value === val);
    if (option) {
      this._inputValue = option.label;
      if (this._inputElement) {
        this._inputElement.value = option.label;
      }
    }
    this.setAttribute('value', val || '');
  }

  protected setupAccessibility(): void {
    // Accessibility is set up in render()
  }

  protected render(): void {
    const shadow = this.attachShadow({ mode: 'open' });
    const inputId = `${this._id}-input`;
    const listboxId = `${this._id}-listbox`;
    const placeholder = this.getAttribute('placeholder') || 'Search...';
    const clearable = this.hasAttribute('clearable');

    shadow.innerHTML = `
      <style>${COMBOBOX_STYLES}</style>
      <div class="combobox-wrapper" part="wrapper">
        <div class="input-wrapper" part="input-wrapper">
          <input
            id="${inputId}"
            type="text"
            role="combobox"
            autocomplete="off"
            aria-expanded="false"
            aria-controls="${listboxId}"
            aria-haspopup="listbox"
            aria-autocomplete="list"
            placeholder="${placeholder}"
            part="input"
          />
          ${
            clearable
              ? `
            <button
              type="button"
              class="clear-button"
              aria-label="Clear selection"
              tabindex="-1"
              hidden
              part="clear-button"
            >×</button>
          `
              : ''
          }
          <span class="chevron" aria-hidden="true" part="chevron">▼</span>
        </div>
        <ul
          id="${listboxId}"
          role="listbox"
          aria-labelledby="${inputId}"
          class="listbox"
          tabindex="-1"
          hidden
          part="listbox"
        ></ul>
      </div>
      <div class="options-source" hidden>
        <slot></slot>
      </div>
    `;

    this._inputElement = shadow.querySelector('input');
    this._listboxElement = shadow.querySelector('.listbox');
  }

  protected setupEventListeners(): void {
    // Input events
    this._inputElement?.addEventListener('input', this.handleInput);
    this._inputElement?.addEventListener('focus', this.handleFocus);
    this._inputElement?.addEventListener('blur', this.handleBlur);
    this._inputElement?.addEventListener('keydown', this.handleKeyDown);

    // Clear button
    const clearButton = this.shadowRoot?.querySelector('.clear-button');
    clearButton?.addEventListener('click', this.handleClear);

    // Outside click
    document.addEventListener('mousedown', this.handleOutsideClick);

    // Slot change
    const slot = this.shadowRoot?.querySelector('slot');
    slot?.addEventListener('slotchange', this.updateOptions);

    // Initial options
    this.updateOptions();
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
    if (name === 'value') {
      this.value = newValue;
    }
    if (name === 'disabled') {
      if (this._inputElement) {
        this._inputElement.disabled = newValue !== null;
      }
    }
    if (name === 'placeholder') {
      if (this._inputElement) {
        this._inputElement.placeholder = newValue || 'Search...';
      }
    }
  }

  private updateOptions = (): void => {
    const optionElements = Array.from(this.querySelectorAll('option'));
    this._options = optionElements.map((el) => ({
      value: el.getAttribute('value') || el.textContent || '',
      label: el.textContent || '',
      disabled: el.hasAttribute('disabled'),
      element: el,
    }));
    this._filteredOptions = [...this._options];
    this.renderOptions();
  };

  private renderOptions(): void {
    if (!this._listboxElement) return;

    this._listboxElement.innerHTML =
      this._filteredOptions.length === 0
        ? '<li role="presentation" class="empty-message" part="empty">No results found</li>'
        : this._filteredOptions
            .map(
              (option, index) => `
          <li
            id="${this._id}-option-${index}"
            role="option"
            aria-selected="${this._selectedValue === option.value}"
            aria-disabled="${option.disabled}"
            data-value="${option.value}"
            data-index="${index}"
            part="option"
            ${option.disabled ? 'class="disabled"' : ''}
          >${option.label}</li>
        `
            )
            .join('');

    // Add click handlers to options
    this._listboxElement
      .querySelectorAll('[role="option"]')
      .forEach((option) => {
        option.addEventListener('click', this.handleOptionClick);
        option.addEventListener('mouseenter', this.handleOptionHover);
      });
  }

  private handleInput = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    this._inputValue = target.value;

    // Filter options
    const query = this._inputValue.toLowerCase();
    this._filteredOptions = query
      ? this._options.filter((opt) => opt.label.toLowerCase().includes(query))
      : [...this._options];

    this.renderOptions();
    this.open = true;
    this._highlightedIndex = 0;
    this.updateHighlight();
    this.updateClearButton();

    // Announce results
    const count = this._filteredOptions.length;
    announce(
      count === 0
        ? 'No results'
        : `${count} result${count === 1 ? '' : 's'} available`
    );
  };

  private handleFocus = (): void => {
    this.open = true;
  };

  private handleBlur = (): void => {
    // Delay close to allow click on options
    setTimeout(() => {
      if (!this.shadowRoot?.activeElement) {
        this.open = false;
      }
    }, 150);
  };

  private handleKeyDown = (event: KeyboardEvent): void => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!this._open) {
          this.open = true;
          this._highlightedIndex = 0;
        } else {
          this._highlightedIndex = Math.min(
            this._highlightedIndex + 1,
            this._filteredOptions.length - 1
          );
        }
        this.updateHighlight();
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (!this._open) {
          this.open = true;
          this._highlightedIndex = this._filteredOptions.length - 1;
        } else {
          this._highlightedIndex = Math.max(this._highlightedIndex - 1, 0);
        }
        this.updateHighlight();
        break;

      case 'Enter':
        event.preventDefault();
        if (this._open && this._highlightedIndex >= 0) {
          const option = this._filteredOptions[this._highlightedIndex];
          if (option && !option.disabled) {
            this.selectOption(option);
          }
        }
        break;

      case 'Escape':
        event.preventDefault();
        this.open = false;
        this._highlightedIndex = -1;
        break;

      case 'Home':
        if (this._open) {
          event.preventDefault();
          this._highlightedIndex = 0;
          this.updateHighlight();
        }
        break;

      case 'End':
        if (this._open) {
          event.preventDefault();
          this._highlightedIndex = this._filteredOptions.length - 1;
          this.updateHighlight();
        }
        break;

      case 'Tab':
        // Close dropdown but don't prevent default - let focus move naturally
        if (this._open) {
          this.open = false;
          this._highlightedIndex = -1;
        }
        break;
    }
  };

  private handleOptionClick = (event: Event): void => {
    const target = event.currentTarget as HTMLElement;
    const index = parseInt(target.dataset.index || '0', 10);
    const option = this._filteredOptions[index];
    if (option && !option.disabled) {
      this.selectOption(option);
    }
  };

  private handleOptionHover = (event: Event): void => {
    const target = event.currentTarget as HTMLElement;
    const index = parseInt(target.dataset.index || '0', 10);
    const option = this._filteredOptions[index];
    if (option && !option.disabled) {
      this._highlightedIndex = index;
      this.updateHighlight();
    }
  };

  private handleClear = (): void => {
    this._inputValue = '';
    this._selectedValue = null;
    if (this._inputElement) {
      this._inputElement.value = '';
      this._inputElement.focus();
    }
    this._filteredOptions = [...this._options];
    this.renderOptions();
    this.updateClearButton();
    this.emit('a11y-combobox-clear');
    this.emit('a11y-combobox-change', { value: null, label: null });
  };

  private handleOutsideClick = (event: MouseEvent): void => {
    if (!this._open) return;

    const path = event.composedPath();
    if (!path.includes(this)) {
      this.open = false;
    }
  };

  private selectOption(option: ComboboxOption): void {
    this._selectedValue = option.value;
    this._inputValue = option.label;
    if (this._inputElement) {
      this._inputElement.value = option.label;
    }
    this.open = false;
    this._highlightedIndex = -1;
    this.renderOptions();
    this.updateClearButton();

    announce(`${option.label} selected`);
    this.emit('a11y-combobox-select', {
      value: option.value,
      label: option.label,
    });
    this.emit('a11y-combobox-change', {
      value: option.value,
      label: option.label,
    });
  }

  private updateHighlight(): void {
    // Remove all highlights
    this._listboxElement
      ?.querySelectorAll('[role="option"]')
      .forEach((el, i) => {
        el.classList.toggle('highlighted', i === this._highlightedIndex);
      });

    // Update aria-activedescendant
    if (this._highlightedIndex >= 0) {
      const optionId = `${this._id}-option-${this._highlightedIndex}`;
      this._inputElement?.setAttribute('aria-activedescendant', optionId);

      // Scroll into view
      const option = this._listboxElement?.querySelector(`#${optionId}`);
      option?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    } else {
      this._inputElement?.removeAttribute('aria-activedescendant');
    }
  }

  private updateListboxVisibility(): void {
    if (!this._listboxElement || !this._inputElement) return;

    if (this._open) {
      this._listboxElement.hidden = false;
      this._inputElement.setAttribute('aria-expanded', 'true');

      // Viewport-aware positioning
      this.updateListboxPosition();

      this.emit('a11y-combobox-open');
    } else {
      this._listboxElement.hidden = true;
      this._inputElement.setAttribute('aria-expanded', 'false');
      this._highlightedIndex = -1;
      this.updateHighlight();

      // Reset position
      this._listboxElement.style.top = '';
      this._listboxElement.style.bottom = '';
      this.removeAttribute('data-position');

      this.emit('a11y-combobox-close');
    }
  }

  private updateListboxPosition(): void {
    if (!this._listboxElement || !this._inputElement) return;

    // Get measurements
    const inputRect = this._inputElement.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const listboxHeight = Math.min(
      this._listboxElement.scrollHeight,
      200 // max-height from CSS
    );

    const spaceBelow = viewportHeight - inputRect.bottom;
    const spaceAbove = inputRect.top;

    // Determine position: flip to top if not enough space below but more above
    if (spaceBelow < listboxHeight + 8 && spaceAbove > spaceBelow) {
      // Position above the input
      this._listboxElement.style.top = 'auto';
      this._listboxElement.style.bottom = '100%';
      this._listboxElement.style.marginTop = '0';
      this._listboxElement.style.marginBottom = '4px';
      this.setAttribute('data-position', 'top');
    } else {
      // Position below the input (default)
      this._listboxElement.style.top = '100%';
      this._listboxElement.style.bottom = 'auto';
      this._listboxElement.style.marginTop = '4px';
      this._listboxElement.style.marginBottom = '0';
      this.setAttribute('data-position', 'bottom');
    }
  }

  private updateClearButton(): void {
    const clearButton = this.shadowRoot?.querySelector(
      '.clear-button'
    ) as HTMLElement;
    if (clearButton) {
      clearButton.hidden = !this._inputValue;
    }
  }

  /**
   * Programmatic open
   */
  show(): void {
    this.open = true;
  }

  /**
   * Programmatic close
   */
  close(): void {
    this.open = false;
  }

  /**
   * Clear the selection
   */
  clear(): void {
    this.handleClear();
  }
}

defineElement('a11y-combobox', A11yCombobox);

export default A11yCombobox;
