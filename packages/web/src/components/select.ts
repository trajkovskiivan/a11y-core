/**
 * compa11y Select Web Component
 *
 * A dropdown select component without text filtering.
 * Uses a button trigger and follows WAI-ARIA Listbox pattern.
 *
 * Usage:
 * <compa11y-select placeholder="Choose..." aria-label="Select a country">
 *   <option value="us">United States</option>
 *   <option value="uk">United Kingdom</option>
 *   <option value="de" disabled>Germany (unavailable)</option>
 * </compa11y-select>
 */

import { announce, createComponentWarnings, createTypeAhead } from '@compa11y/core';
import { Compa11yElement, defineElement } from '../utils/base-element';
import { SELECT_STYLES } from '../utils/styles';

const warnings = createComponentWarnings('Select');

interface SelectOption {
  value: string;
  label: string;
  disabled: boolean;
  element: HTMLElement;
}

export class Compa11ySelect extends Compa11yElement {
  private _open = false;
  private _highlightedIndex = -1;
  private _options: SelectOption[] = [];
  private _selectedValue: string | null = null;
  private _triggerElement: HTMLButtonElement | null = null;
  private _listboxElement: HTMLElement | null = null;
  private _typeAhead: ReturnType<typeof createTypeAhead> | null = null;

  static get observedAttributes() {
    return ['open', 'value', 'placeholder', 'disabled', 'label'];
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
    this.updateTriggerText();
    this.setAttribute('value', val || '');
  }

  private _hasLabelSlot = false;

  protected setupAccessibility(): void {
    // Check for slotted label content
    const slottedLabel = this.querySelector('[slot="label"]');
    this._hasLabelSlot = Boolean(slottedLabel);

    const hasLabel =
      this.hasAttribute('label') ||
      this.hasAttribute('aria-label') ||
      this.hasAttribute('aria-labelledby') ||
      this._hasLabelSlot;
    if (!hasLabel) {
      warnings.error(
        'Select has no accessible label. Add label="...", aria-label="...", aria-labelledby="...", or use <span slot="label">...</span>.\n' +
          '💡 Suggestion: <compa11y-select label="Country">...</compa11y-select>'
      );
    }
  }

  protected render(): void {
    const shadow = this.attachShadow({ mode: 'open' });
    const triggerId = `${this._id}-trigger`;
    const listboxId = `${this._id}-listbox`;
    const labelId = `${this._id}-label`;
    const placeholder =
      this.getAttribute('placeholder') || 'Select an option...';
    const label = this.getAttribute('label') || '';
    const ariaLabel = this.getAttribute('aria-label') || '';
    const ariaLabelledBy = this.getAttribute('aria-labelledby') || '';

    // Determine what labels the trigger — always wire to label element
    // (which contains the slot) unless an explicit aria-labelledby is provided
    const triggerLabelledBy = ariaLabelledBy || (!ariaLabel ? labelId : '');

    shadow.innerHTML = `
      <style>${SELECT_STYLES}</style>
      <div class="select-wrapper" part="wrapper">
        <label id="${labelId}" for="${triggerId}" part="label" data-compa11y-select-label ${!label ? 'hidden' : ''}><slot name="label">${label}</slot></label>
        <button
          id="${triggerId}"
          type="button"
          role="combobox"
          aria-expanded="false"
          aria-controls="${listboxId}"
          aria-haspopup="listbox"
          ${!label && ariaLabel ? `aria-label="${ariaLabel}"` : ''}
          ${triggerLabelledBy ? `aria-labelledby="${triggerLabelledBy}"` : ''}
          class="select-trigger"
          part="trigger"
        >
          <span class="select-value placeholder" part="value">${placeholder}</span>
          <span class="chevron" aria-hidden="true" part="chevron">&#9660;</span>
        </button>
        <ul
          id="${listboxId}"
          role="listbox"
          aria-labelledby="${triggerLabelledBy || triggerId}"
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

    this._triggerElement = shadow.querySelector('.select-trigger');
    this._listboxElement = shadow.querySelector('.listbox');
  }

  protected setupEventListeners(): void {
    this._triggerElement?.addEventListener('click', this.handleTriggerClick);
    this._triggerElement?.addEventListener('keydown', this.handleKeyDown);
    this._triggerElement?.addEventListener('blur', this.handleBlur);

    // Prevent trigger blur when clicking in listbox
    this._listboxElement?.addEventListener(
      'mousedown',
      this.handleListboxMouseDown
    );

    // Outside click
    document.addEventListener('mousedown', this.handleOutsideClick);

    // Slot change
    const slot = this.shadowRoot?.querySelector('slot:not([name])');
    slot?.addEventListener('slotchange', this.updateOptions);

    // Show/hide label when slot content changes
    const labelSlot = this.shadowRoot?.querySelector('slot[name="label"]');
    labelSlot?.addEventListener('slotchange', this.handleLabelSlotChange);

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
      if (this._triggerElement) {
        this._triggerElement.disabled = newValue !== null;
      }
    }
    if (name === 'placeholder') {
      this.updateTriggerText();
    }
  }

  private handleLabelSlotChange = (event: Event): void => {
    const slot = event.target as HTMLSlotElement;
    const assigned = slot.assignedNodes({ flatten: true });
    const hasContent = assigned.some(
      (node) => node.nodeType === Node.ELEMENT_NODE || (node.textContent?.trim() ?? '') !== ''
    );
    const labelEl = this.shadowRoot?.querySelector('[data-compa11y-select-label]');
    if (labelEl) {
      if (hasContent) {
        labelEl.removeAttribute('hidden');
      } else if (!this.getAttribute('label')) {
        labelEl.setAttribute('hidden', '');
      }
    }
  };

  private updateOptions = (): void => {
    const optionElements = Array.from(this.querySelectorAll('option'));
    this._options = optionElements.map((el) => ({
      value: el.getAttribute('value') || el.textContent || '',
      label: el.textContent || '',
      disabled: el.hasAttribute('disabled'),
      element: el,
    }));

    // Rebuild type-ahead
    this._typeAhead = createTypeAhead(
      this._options.map((o) => o.label),
      { timeout: 500 }
    );

    this.renderOptions();
    this.updateTriggerText();
  };

  private renderOptions(): void {
    if (!this._listboxElement) return;

    this._listboxElement.innerHTML = this._options
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
        >
          <span class="option-text">${option.label}</span>
          ${this._selectedValue === option.value ? '<span class="check-mark" aria-hidden="true">&#10003;</span>' : ''}
        </li>
      `
      )
      .join('');

    // Add click/hover handlers to options
    this._listboxElement
      .querySelectorAll('[role="option"]')
      .forEach((option) => {
        option.addEventListener('click', this.handleOptionClick);
        option.addEventListener('mouseenter', this.handleOptionHover);
      });
  }

  private handleTriggerClick = (): void => {
    if (this._triggerElement?.disabled) return;

    if (this._open) {
      this.open = false;
      this._highlightedIndex = -1;
    } else {
      this.openAndHighlight();
    }
  };

  private handleKeyDown = (event: KeyboardEvent): void => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!this._open) {
          this.openAndHighlight();
        } else {
          this.highlightNext();
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (!this._open) {
          this.openAndHighlight(true);
        } else {
          this.highlightPrevious();
        }
        break;

      case 'Enter':
        event.preventDefault();
        if (this._open && this._highlightedIndex >= 0) {
          const option = this._options[this._highlightedIndex];
          if (option && !option.disabled) {
            this.selectOption(option);
          }
        } else if (!this._open) {
          this.openAndHighlight();
        }
        break;

      case ' ':
        event.preventDefault();
        if (this._open && this._highlightedIndex >= 0) {
          const option = this._options[this._highlightedIndex];
          if (option && !option.disabled) {
            this.selectOption(option);
          }
        } else if (!this._open) {
          this.openAndHighlight();
        }
        break;

      case 'Escape':
        event.preventDefault();
        if (this._open) {
          this.open = false;
          this._highlightedIndex = -1;
        }
        break;

      case 'Home':
        if (this._open) {
          event.preventDefault();
          this._highlightedIndex = this.findFirstEnabled();
          this.updateHighlight();
        }
        break;

      case 'End':
        if (this._open) {
          event.preventDefault();
          this._highlightedIndex = this.findLastEnabled();
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

      default:
        // Type-ahead: single printable characters
        if (
          event.key.length === 1 &&
          !event.ctrlKey &&
          !event.altKey &&
          !event.metaKey
        ) {
          const match = this._typeAhead?.type(event.key);
          if (match) {
            const index = this._options.findIndex(
              (o) => o.label === match && !o.disabled
            );
            if (index >= 0) {
              if (!this._open) {
                this.open = true;
              }
              this._highlightedIndex = index;
              this.updateHighlight();
            }
          }
        }
        break;
    }
  };

  private handleBlur = (): void => {
    setTimeout(() => {
      if (!this.shadowRoot?.activeElement) {
        this.open = false;
        this._highlightedIndex = -1;
      }
    }, 150);
  };

  private handleListboxMouseDown = (event: Event): void => {
    // Prevent trigger from losing focus when clicking in listbox
    event.preventDefault();
  };

  private handleOptionClick = (event: Event): void => {
    const target = event.currentTarget as HTMLElement;
    const index = parseInt(target.dataset.index || '0', 10);
    const option = this._options[index];
    if (option && !option.disabled) {
      this.selectOption(option);
    }
  };

  private handleOptionHover = (event: Event): void => {
    const target = event.currentTarget as HTMLElement;
    const index = parseInt(target.dataset.index || '0', 10);
    const option = this._options[index];
    if (option && !option.disabled) {
      this._highlightedIndex = index;
      this.updateHighlight();
    }
  };

  private handleOutsideClick = (event: MouseEvent): void => {
    if (!this._open) return;

    const path = event.composedPath();
    if (!path.includes(this)) {
      this.open = false;
      this._highlightedIndex = -1;
    }
  };

  private openAndHighlight(preferLast = false): void {
    this.open = true;

    // Highlight selected option, or first/last enabled
    const selectedIndex = this._options.findIndex(
      (o) => o.value === this._selectedValue
    );
    if (selectedIndex >= 0) {
      this._highlightedIndex = selectedIndex;
    } else {
      this._highlightedIndex = preferLast
        ? this.findLastEnabled()
        : this.findFirstEnabled();
    }
    this.updateHighlight();

    // Announce options count
    announce(
      `${this._options.length} option${this._options.length === 1 ? '' : 's'} available`
    );
  }

  private selectOption(option: SelectOption): void {
    this._selectedValue = option.value;
    this.updateTriggerText();
    this.open = false;
    this._highlightedIndex = -1;
    this.renderOptions();

    announce(`${option.label} selected`);
    this.emit('compa11y-select-change', {
      value: option.value,
      label: option.label,
    });
    this.emit('change', {
      value: option.value,
      label: option.label,
    });
  }

  private updateTriggerText(): void {
    const valueEl = this.shadowRoot?.querySelector('.select-value');
    if (!valueEl) return;

    const selectedOption = this._options.find(
      (o) => o.value === this._selectedValue
    );
    const placeholder =
      this.getAttribute('placeholder') || 'Select an option...';

    if (selectedOption) {
      valueEl.textContent = selectedOption.label;
      valueEl.classList.remove('placeholder');
    } else {
      valueEl.textContent = placeholder;
      valueEl.classList.add('placeholder');
    }
  }

  private highlightNext(): void {
    const next = this.findNextEnabled(this._highlightedIndex, 1);
    if (next >= 0) {
      this._highlightedIndex = next;
      this.updateHighlight();
    }
  }

  private highlightPrevious(): void {
    const prev = this.findNextEnabled(this._highlightedIndex, -1);
    if (prev >= 0) {
      this._highlightedIndex = prev;
      this.updateHighlight();
    }
  }

  private findNextEnabled(currentIndex: number, direction: 1 | -1): number {
    const length = this._options.length;
    let index = currentIndex + direction;

    if (index < 0) index = length - 1;
    if (index >= length) index = 0;

    const startIndex = index;
    while (this._options[index]?.disabled) {
      index += direction;
      if (index < 0) index = length - 1;
      if (index >= length) index = 0;
      if (index === startIndex) return -1;
    }

    return index;
  }

  private findFirstEnabled(): number {
    return this._options.findIndex((o) => !o.disabled);
  }

  private findLastEnabled(): number {
    for (let i = this._options.length - 1; i >= 0; i--) {
      if (!this._options[i]?.disabled) return i;
    }
    return -1;
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
      this._triggerElement?.setAttribute('aria-activedescendant', optionId);

      // Scroll into view
      const option = this._listboxElement?.querySelector(`#${optionId}`);
      option?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    } else {
      this._triggerElement?.removeAttribute('aria-activedescendant');
    }
  }

  private updateListboxVisibility(): void {
    if (!this._listboxElement || !this._triggerElement) return;

    if (this._open) {
      this._listboxElement.hidden = false;
      this._triggerElement.setAttribute('aria-expanded', 'true');

      // Viewport-aware positioning
      this.updateListboxPosition();

      this.emit('compa11y-select-open');
    } else {
      this._listboxElement.hidden = true;
      this._triggerElement.setAttribute('aria-expanded', 'false');
      this._highlightedIndex = -1;
      this.updateHighlight();

      // Reset position
      this._listboxElement.style.top = '';
      this._listboxElement.style.bottom = '';
      this.removeAttribute('data-position');

      this.emit('compa11y-select-close');
    }
  }

  private updateListboxPosition(): void {
    if (!this._listboxElement || !this._triggerElement) return;

    const triggerRect = this._triggerElement.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const listboxHeight = Math.min(this._listboxElement.scrollHeight, 200);

    const spaceBelow = viewportHeight - triggerRect.bottom;
    const spaceAbove = triggerRect.top;

    if (spaceBelow < listboxHeight + 8 && spaceAbove > spaceBelow) {
      this._listboxElement.style.top = 'auto';
      this._listboxElement.style.bottom = '100%';
      this._listboxElement.style.marginTop = '0';
      this._listboxElement.style.marginBottom = '4px';
      this.setAttribute('data-position', 'top');
    } else {
      this._listboxElement.style.top = '100%';
      this._listboxElement.style.bottom = 'auto';
      this._listboxElement.style.marginTop = '4px';
      this._listboxElement.style.marginBottom = '0';
      this.setAttribute('data-position', 'bottom');
    }
  }

  /** Programmatic open */
  show(): void {
    this.open = true;
  }

  /** Programmatic close */
  close(): void {
    this.open = false;
  }
}

defineElement('compa11y-select', Compa11ySelect);

export default Compa11ySelect;
