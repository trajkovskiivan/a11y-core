/**
 * A11y Listbox + Option + Optgroup Web Components
 *
 * Accessible listbox custom elements with full keyboard support,
 * single-select (selection follows focus) and multi-select modes,
 * option groups, and type-ahead search.
 *
 * @example
 * ```html
 * <!-- Single select -->
 * <a11y-listbox aria-label="Favorite fruit" value="apple">
 *   <a11y-option value="apple">Apple</a11y-option>
 *   <a11y-option value="banana" disabled>Banana</a11y-option>
 *   <a11y-optgroup label="Citrus">
 *     <a11y-option value="orange">Orange</a11y-option>
 *     <a11y-option value="lemon">Lemon</a11y-option>
 *   </a11y-optgroup>
 * </a11y-listbox>
 *
 * <!-- Multi select -->
 * <a11y-listbox multiple aria-label="Toppings" value="cheese,pepperoni">
 *   <a11y-option value="cheese">Cheese</a11y-option>
 *   <a11y-option value="pepperoni">Pepperoni</a11y-option>
 * </a11y-listbox>
 * ```
 */

import { Compa11yElement, defineElement } from '../utils/base-element';
import {
  LISTBOX_STYLES,
  OPTION_STYLES,
  OPTGROUP_STYLES,
} from '../utils/styles';
import { announcePolite, createTypeAhead } from '@compa11y/core';

// ============================================================================
// A11yOptgroup
// ============================================================================

export class A11yOptgroup extends Compa11yElement {
  private _label = '';
  private _disabled = false;

  static get observedAttributes() {
    return ['label', 'disabled'];
  }

  get label(): string {
    return this._label;
  }

  set label(v: string) {
    this._label = v;
    this.setAttribute('label', v);
    this.updateLabel();
  }

  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(v: boolean) {
    const newValue = Boolean(v);
    if (this._disabled !== newValue) {
      this._disabled = newValue;
      if (newValue) {
        this.setAttribute('disabled', '');
        this.setAttribute('aria-disabled', 'true');
      } else {
        this.removeAttribute('disabled');
        this.removeAttribute('aria-disabled');
      }
    }
  }

  protected setupAccessibility(): void {
    this.setAttribute('role', 'group');

    this._label = this.getAttribute('label') || '';
    this._disabled = this.hasAttribute('disabled');
    if (this._disabled) {
      this.setAttribute('aria-disabled', 'true');
    }

    // aria-labelledby set after render when we have the label element ID
  }

  protected render(): void {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }

    const labelId = `${this._id}-label`;

    this.shadowRoot!.innerHTML = `
      <style>${OPTGROUP_STYLES}</style>
      <div class="optgroup-wrapper" part="group">
        <div class="optgroup-label" part="label" id="${labelId}" role="presentation">
          ${this._label}
        </div>
        <div class="optgroup-options" part="options" role="none">
          <slot></slot>
        </div>
      </div>
    `;

    this.setAttribute('aria-labelledby', labelId);
  }

  protected setupEventListeners(): void {
    // No direct events — parent handles keyboard
  }

  protected cleanupEventListeners(): void {
    // No cleanup needed
  }

  private updateLabel(): void {
    const labelEl = this.shadowRoot?.querySelector('.optgroup-label');
    if (labelEl) {
      labelEl.textContent = this._label;
    }
  }

  protected onAttributeChange(
    name: string,
    _oldValue: string | null,
    newValue: string | null
  ): void {
    switch (name) {
      case 'label':
        this._label = newValue || '';
        this.updateLabel();
        break;
      case 'disabled':
        this._disabled = newValue !== null;
        if (this._disabled) {
          this.setAttribute('aria-disabled', 'true');
        } else {
          this.removeAttribute('aria-disabled');
        }
        break;
    }
  }
}

// ============================================================================
// A11yOption
// ============================================================================

export class A11yOption extends Compa11yElement {
  private _value = '';
  private _disabled = false;
  private _selected = false;
  private _discoverable = true;

  static get observedAttributes() {
    return ['value', 'disabled', 'discoverable'];
  }

  get value(): string {
    return this._value;
  }

  set value(v: string) {
    this._value = v;
    this.setAttribute('value', v);
  }

  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(v: boolean) {
    const newValue = Boolean(v);
    if (this._disabled !== newValue) {
      this._disabled = newValue;
      if (newValue) {
        this.setAttribute('disabled', '');
        this.setAttribute('aria-disabled', 'true');
      } else {
        this.removeAttribute('disabled');
        this.removeAttribute('aria-disabled');
      }
    }
  }

  get selected(): boolean {
    return this._selected;
  }

  set selected(v: boolean) {
    const newValue = Boolean(v);
    if (this._selected !== newValue) {
      this._selected = newValue;
      this.setAttribute('aria-selected', String(newValue));
    }
  }

  get discoverable(): boolean {
    return this._discoverable;
  }

  set discoverable(v: boolean) {
    this._discoverable = Boolean(v);
  }

  /**
   * Whether this option is effectively disabled (own disabled or group disabled)
   */
  get effectivelyDisabled(): boolean {
    if (this._disabled) return true;
    const group = this.closest('a11y-optgroup') as A11yOptgroup | null;
    return group?.disabled ?? false;
  }

  protected setupAccessibility(): void {
    this.setAttribute('role', 'option');
    this.setAttribute('aria-selected', 'false');

    this._value = this.getAttribute('value') || '';
    this._disabled = this.hasAttribute('disabled');
    if (this._disabled) {
      this.setAttribute('aria-disabled', 'true');
    }

    const discoverableAttr = this.getAttribute('discoverable');
    if (discoverableAttr === 'false' || discoverableAttr === '0') {
      this._discoverable = false;
    }
  }

  protected render(): void {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }

    this.shadowRoot!.innerHTML = `
      <style>${OPTION_STYLES}</style>
      <div class="option-wrapper" part="option">
        <span class="option-content" part="content"><slot></slot></span>
        <span class="check-mark" part="check" aria-hidden="true">&#10003;</span>
      </div>
    `;
  }

  protected setupEventListeners(): void {
    this.addEventListener('click', this.handleClick);
  }

  protected cleanupEventListeners(): void {
    this.removeEventListener('click', this.handleClick);
  }

  private handleClick = (event: Event): void => {
    if (this.effectivelyDisabled) {
      event.preventDefault();
      return;
    }

    this.dispatchEvent(
      new CustomEvent('option-select', {
        detail: { value: this._value },
        bubbles: true,
        composed: true,
      })
    );
  };

  protected onAttributeChange(
    name: string,
    _oldValue: string | null,
    newValue: string | null
  ): void {
    switch (name) {
      case 'value':
        this._value = newValue || '';
        break;
      case 'disabled':
        this._disabled = newValue !== null;
        if (this._disabled) {
          this.setAttribute('aria-disabled', 'true');
        } else {
          this.removeAttribute('aria-disabled');
        }
        break;
      case 'discoverable':
        if (newValue === null) {
          this._discoverable = true;
        } else if (newValue === 'false' || newValue === '0') {
          this._discoverable = false;
        } else {
          this._discoverable = true;
        }
        break;
    }
  }
}

// ============================================================================
// A11yListbox
// ============================================================================

export class A11yListbox extends Compa11yElement {
  private _value: string | null = null;
  private _values: Set<string> = new Set();
  private _multiple = false;
  private _disabled = false;
  private _discoverable = true;
  private _orientation: 'horizontal' | 'vertical' = 'vertical';
  private _focusedIndex = -1;
  private _typeAhead: ReturnType<typeof createTypeAhead> | null = null;

  static get observedAttributes() {
    return [
      'value',
      'multiple',
      'disabled',
      'discoverable',
      'orientation',
      'aria-label',
      'aria-labelledby',
    ];
  }

  // ===== Getters/Setters =====

  get value(): string | string[] {
    if (this._multiple) {
      return Array.from(this._values);
    }
    return this._value || '';
  }

  set value(v: string | string[]) {
    if (this._multiple) {
      const arr = Array.isArray(v) ? v : String(v).split(',').filter(Boolean);
      this._values = new Set(arr);
      this.setAttribute('value', arr.join(','));
    } else {
      const str = Array.isArray(v) ? v[0] || '' : String(v);
      this._value = str;
      this.setAttribute('value', str);
    }
    this.syncOptionStates();
  }

  get multiple(): boolean {
    return this._multiple;
  }

  set multiple(v: boolean) {
    const newValue = Boolean(v);
    if (this._multiple !== newValue) {
      this._multiple = newValue;
      if (newValue) {
        this.setAttribute('multiple', '');
        this.setAttribute('aria-multiselectable', 'true');
      } else {
        this.removeAttribute('multiple');
        this.removeAttribute('aria-multiselectable');
      }
    }
  }

  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(v: boolean) {
    const newValue = Boolean(v);
    if (this._disabled !== newValue) {
      this._disabled = newValue;
      if (newValue) {
        this.setAttribute('disabled', '');
        this.setAttribute('aria-disabled', 'true');
      } else {
        this.removeAttribute('disabled');
        this.removeAttribute('aria-disabled');
      }
    }
  }

  get discoverable(): boolean {
    return this._discoverable;
  }

  set discoverable(v: boolean) {
    this._discoverable = Boolean(v);
  }

  get orientation(): 'horizontal' | 'vertical' {
    return this._orientation;
  }

  set orientation(v: 'horizontal' | 'vertical') {
    this._orientation = v;
    this.setAttribute('orientation', v);
    this.setAttribute('aria-orientation', v);
  }

  // ===== Lifecycle =====

  protected setupAccessibility(): void {
    this.setAttribute('role', 'listbox');
    this.setAttribute('aria-orientation', this._orientation);

    const hasLabel =
      this.hasAttribute('aria-label') ||
      this.hasAttribute('aria-labelledby');
    if (!hasLabel && process.env.NODE_ENV !== 'production') {
      console.warn(
        '[Compa11y Listbox]: Listbox has no accessible label. ' +
          'Use aria-label or aria-labelledby.'
      );
    }

    // Initialize from attributes
    this._multiple = this.hasAttribute('multiple');
    if (this._multiple) {
      this.setAttribute('aria-multiselectable', 'true');
    }

    this._disabled = this.hasAttribute('disabled');
    if (this._disabled) {
      this.setAttribute('aria-disabled', 'true');
    }

    const orient = this.getAttribute('orientation');
    if (orient === 'horizontal' || orient === 'vertical') {
      this._orientation = orient;
    }

    const discoverableAttr = this.getAttribute('discoverable');
    if (discoverableAttr === 'false' || discoverableAttr === '0') {
      this._discoverable = false;
    }

    // Parse initial value
    const initialValue = this.getAttribute('value');
    if (initialValue) {
      if (this._multiple) {
        this._values = new Set(initialValue.split(',').filter(Boolean));
      } else {
        this._value = initialValue;
      }
    }

    // Tabindex
    if (this._disabled && !this._discoverable) {
      this.setAttribute('tabindex', '-1');
    } else {
      this.setAttribute('tabindex', '0');
    }
  }

  protected render(): void {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }

    this.shadowRoot!.innerHTML = `
      <style>${LISTBOX_STYLES}</style>
      <div class="listbox-wrapper" part="wrapper">
        <slot></slot>
      </div>
    `;
  }

  protected setupEventListeners(): void {
    this.addEventListener('keydown', this.handleKeyDown);
    this.addEventListener('focus', this.handleFocus);
    this.addEventListener('option-select', this.handleOptionSelect as EventListener);

    // Watch for slotchange to re-index options
    const slot = this.shadowRoot?.querySelector('slot');
    if (slot) {
      slot.addEventListener('slotchange', () => {
        this.rebuildTypeAhead();
        this.syncOptionStates();
      });
    }

    // Initial sync
    this.rebuildTypeAhead();
    this.syncOptionStates();
  }

  protected cleanupEventListeners(): void {
    this.removeEventListener('keydown', this.handleKeyDown);
    this.removeEventListener('focus', this.handleFocus);
    this.removeEventListener('option-select', this.handleOptionSelect as EventListener);
  }

  // ===== Option Queries =====

  private getAllOptions(): A11yOption[] {
    return Array.from(this.querySelectorAll('a11y-option')) as A11yOption[];
  }

  private getEnabledOptions(): A11yOption[] {
    return this.getAllOptions().filter((option) => !option.effectivelyDisabled);
  }

  private getEnabledIndices(): number[] {
    const allOptions = this.getAllOptions();
    const indices: number[] = [];
    allOptions.forEach((opt, i) => {
      if (!opt.effectivelyDisabled) {
        indices.push(i);
      }
    });
    return indices;
  }

  // ===== State Sync =====

  private syncOptionStates(): void {
    const options = this.getAllOptions();

    options.forEach((option) => {
      if (this._multiple) {
        option.selected = this._values.has(option.value);
      } else {
        option.selected = option.value === this._value;
      }
    });
  }

  private updateFocusHighlight(): void {
    const options = this.getAllOptions();

    options.forEach((opt, i) => {
      if (i === this._focusedIndex) {
        opt.toggleAttribute('data-focused', true);
      } else {
        opt.removeAttribute('data-focused');
      }
    });

    // Update aria-activedescendant
    const focusedOption = this._focusedIndex >= 0 ? options[this._focusedIndex] : undefined;
    if (focusedOption) {
      this.setAttribute('aria-activedescendant', focusedOption.id);
      focusedOption.scrollIntoView({ block: 'nearest' });
    } else {
      this.removeAttribute('aria-activedescendant');
    }
  }

  // ===== Navigation Helpers =====

  private findNextEnabled(currentIndex: number, direction: 1 | -1): number {
    const enabledIndices = this.getEnabledIndices();
    if (enabledIndices.length === 0) return -1;

    // Find current position in enabled list
    const currentPos = enabledIndices.indexOf(currentIndex);

    if (currentPos === -1) {
      // Current is not enabled, find nearest
      return direction === 1 ? enabledIndices[0]! : enabledIndices[enabledIndices.length - 1]!;
    }

    const nextPos = currentPos + direction;
    if (nextPos < 0 || nextPos >= enabledIndices.length) {
      return -1; // No wrapping for listbox
    }

    return enabledIndices[nextPos]!;
  }

  private findFirstEnabled(): number {
    const indices = this.getEnabledIndices();
    return indices.length > 0 ? indices[0]! : -1;
  }

  private findLastEnabled(): number {
    const indices = this.getEnabledIndices();
    return indices.length > 0 ? indices[indices.length - 1]! : -1;
  }

  // ===== Selection =====

  private selectOption(option: A11yOption): void {
    if (option.effectivelyDisabled || this._disabled) return;

    if (this._multiple) {
      this.toggleOptionSelection(option);
    } else {
      this.selectSingle(option);
    }
  }

  private selectSingle(option: A11yOption): void {
    const oldValue = this._value;
    this._value = option.value;
    this.setAttribute('value', option.value);
    this.syncOptionStates();

    if (oldValue !== this._value) {
      const label = option.textContent?.trim() || option.value;
      this.emit('change', { value: this._value, label });
      this.emit('a11y-listbox-change', { value: this._value, label });
      announcePolite(`${label} selected`);
    }
  }

  private toggleOptionSelection(option: A11yOption): void {
    if (option.effectivelyDisabled || this._disabled) return;

    const label = option.textContent?.trim() || option.value;

    if (this._values.has(option.value)) {
      this._values.delete(option.value);
      option.selected = false;
      announcePolite(`${label} deselected`);
    } else {
      this._values.add(option.value);
      option.selected = true;
      announcePolite(`${label} selected`);
    }

    const valueArray = Array.from(this._values);
    this.setAttribute('value', valueArray.join(','));

    this.emit('change', { value: valueArray });
    this.emit('a11y-listbox-change', { value: valueArray });
  }

  private selectRange(fromIndex: number, toIndex: number): void {
    const options = this.getAllOptions();
    const start = Math.min(fromIndex, toIndex);
    const end = Math.max(fromIndex, toIndex);

    for (let i = start; i <= end; i++) {
      const opt = options[i];
      if (opt && !opt.effectivelyDisabled) {
        this._values.add(opt.value);
        opt.selected = true;
      }
    }

    const valueArray = Array.from(this._values);
    this.setAttribute('value', valueArray.join(','));
    this.emit('change', { value: valueArray });
    this.emit('a11y-listbox-change', { value: valueArray });
    announcePolite(`${end - start + 1} items selected`);
  }

  private toggleSelectAll(): void {
    const enabledOptions = this.getEnabledOptions();
    const allSelected = enabledOptions.every((o) => this._values.has(o.value));

    if (allSelected) {
      // Deselect all
      this._values.clear();
      this.getAllOptions().forEach((o) => (o.selected = false));
      announcePolite('All deselected');
    } else {
      // Select all enabled
      enabledOptions.forEach((o) => {
        this._values.add(o.value);
        o.selected = true;
      });
      announcePolite('All selected');
    }

    const valueArray = Array.from(this._values);
    this.setAttribute('value', valueArray.join(','));
    this.emit('change', { value: valueArray });
    this.emit('a11y-listbox-change', { value: valueArray });
  }

  // ===== Type-ahead =====

  private rebuildTypeAhead(): void {
    const labels = this.getAllOptions().map(
      (o) => o.textContent?.trim() || ''
    );
    this._typeAhead = createTypeAhead(labels, { timeout: 500 });
  }

  // ===== Event Handlers =====

  private handleFocus = (): void => {
    if (this._focusedIndex >= 0) return; // Already has focus state

    const options = this.getAllOptions();

    // Focus selected option (or first selected in multi)
    if (!this._multiple && this._value) {
      const idx = options.findIndex((o) => o.value === this._value);
      if (idx >= 0) {
        this._focusedIndex = idx;
        this.updateFocusHighlight();
        return;
      }
    } else if (this._multiple && this._values.size > 0) {
      const idx = options.findIndex((o) => this._values.has(o.value));
      if (idx >= 0) {
        this._focusedIndex = idx;
        this.updateFocusHighlight();
        return;
      }
    }

    // Default to first enabled option
    this._focusedIndex = this.findFirstEnabled();
    this.updateFocusHighlight();
  };

  private handleOptionSelect = (event: CustomEvent): void => {
    if (this._disabled) return;

    const value = event.detail?.value;
    if (value === undefined) return;

    const options = this.getAllOptions();
    const option = options.find((o) => o.value === value);
    if (!option) return;

    // Update focus to clicked option
    const index = options.indexOf(option);
    this._focusedIndex = index;
    this.updateFocusHighlight();

    this.selectOption(option);

    // Re-focus the listbox container
    this.focus();
  };

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (this._disabled && !this._discoverable) return;

    const options = this.getAllOptions();
    if (options.length === 0) return;

    let nextIndex: number | null = null;
    let handled = false;

    if (this._multiple) {
      // Multi-select keyboard
      switch (event.key) {
        case 'ArrowDown':
          if (event.shiftKey) {
            // Shift+Down: move focus AND toggle selection
            nextIndex = this.findNextEnabled(this._focusedIndex, 1);
            if (nextIndex >= 0) {
              this.toggleOptionSelection(options[nextIndex]!);
            }
          } else {
            nextIndex = this.findNextEnabled(this._focusedIndex, 1);
          }
          handled = true;
          break;

        case 'ArrowUp':
          if (event.shiftKey) {
            nextIndex = this.findNextEnabled(this._focusedIndex, -1);
            if (nextIndex >= 0) {
              this.toggleOptionSelection(options[nextIndex]!);
            }
          } else {
            nextIndex = this.findNextEnabled(this._focusedIndex, -1);
          }
          handled = true;
          break;

        case ' ':
          // Space: toggle focused option
          if (this._focusedIndex >= 0 && options[this._focusedIndex] != null) {
            this.toggleOptionSelection(options[this._focusedIndex]!);
          }
          handled = true;
          break;

        case 'Home':
          if (event.ctrlKey && event.shiftKey) {
            // Ctrl+Shift+Home: select range from focus to first
            this.selectRange(this.findFirstEnabled(), this._focusedIndex);
            nextIndex = this.findFirstEnabled();
          } else {
            nextIndex = this.findFirstEnabled();
          }
          handled = true;
          break;

        case 'End':
          if (event.ctrlKey && event.shiftKey) {
            // Ctrl+Shift+End: select range from focus to last
            this.selectRange(this._focusedIndex, this.findLastEnabled());
            nextIndex = this.findLastEnabled();
          } else {
            nextIndex = this.findLastEnabled();
          }
          handled = true;
          break;

        case 'a':
          if (event.ctrlKey || event.metaKey) {
            this.toggleSelectAll();
            handled = true;
          }
          break;

        default:
          // Type-ahead
          if (
            event.key.length === 1 &&
            !event.ctrlKey &&
            !event.altKey &&
            !event.metaKey
          ) {
            const match = this._typeAhead?.type(event.key);
            if (match) {
              const idx = options.findIndex(
                (o) =>
                  (o.textContent?.trim() || '') === match &&
                  !o.effectivelyDisabled
              );
              if (idx >= 0) {
                nextIndex = idx;
                handled = true;
              }
            }
          }
          break;
      }
    } else {
      // Single-select keyboard (selection follows focus)
      switch (event.key) {
        case 'ArrowDown':
          nextIndex = this.findNextEnabled(this._focusedIndex, 1);
          handled = true;
          break;

        case 'ArrowUp':
          nextIndex = this.findNextEnabled(this._focusedIndex, -1);
          handled = true;
          break;

        case 'Home':
          nextIndex = this.findFirstEnabled();
          handled = true;
          break;

        case 'End':
          nextIndex = this.findLastEnabled();
          handled = true;
          break;

        default:
          // Type-ahead
          if (
            event.key.length === 1 &&
            !event.ctrlKey &&
            !event.altKey &&
            !event.metaKey
          ) {
            const match = this._typeAhead?.type(event.key);
            if (match) {
              const idx = options.findIndex(
                (o) =>
                  (o.textContent?.trim() || '') === match &&
                  !o.effectivelyDisabled
              );
              if (idx >= 0) {
                nextIndex = idx;
                handled = true;
              }
            }
          }
          break;
      }
    }

    if (handled) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (nextIndex !== null && nextIndex >= 0) {
      this._focusedIndex = nextIndex;
      this.updateFocusHighlight();

      // Single-select: selection follows focus
      const targetOption = options[nextIndex];
      if (!this._multiple && targetOption) {
        this.selectSingle(targetOption);
      } else if (targetOption) {
        // Multi-select: just announce the focused option
        const label = targetOption.textContent?.trim() || targetOption.value;
        const isSelected = this._values.has(targetOption.value);
        announcePolite(`${label}${isSelected ? ', selected' : ''}`);
      }
    }
  };

  // ===== Attribute Changes =====

  protected onAttributeChange(
    name: string,
    _oldValue: string | null,
    newValue: string | null
  ): void {
    switch (name) {
      case 'value':
        if (this._multiple) {
          this._values = new Set(
            (newValue || '').split(',').filter(Boolean)
          );
        } else {
          this._value = newValue || null;
        }
        this.syncOptionStates();
        break;

      case 'multiple':
        this._multiple = newValue !== null;
        if (this._multiple) {
          this.setAttribute('aria-multiselectable', 'true');
          // Convert single value to multi
          if (this._value) {
            this._values = new Set([this._value]);
            this._value = null;
          }
        } else {
          this.removeAttribute('aria-multiselectable');
          // Convert multi to single (pick first)
          if (this._values.size > 0) {
            this._value = Array.from(this._values)[0] ?? null;
            this._values.clear();
          }
        }
        this.syncOptionStates();
        break;

      case 'disabled':
        this._disabled = newValue !== null;
        if (this._disabled) {
          this.setAttribute('aria-disabled', 'true');
          if (!this._discoverable) {
            this.setAttribute('tabindex', '-1');
          }
        } else {
          this.removeAttribute('aria-disabled');
          this.setAttribute('tabindex', '0');
        }
        break;

      case 'discoverable':
        if (newValue === null) {
          this._discoverable = true;
        } else if (newValue === 'false' || newValue === '0') {
          this._discoverable = false;
        } else {
          this._discoverable = true;
        }
        break;

      case 'orientation':
        if (newValue === 'horizontal' || newValue === 'vertical') {
          this._orientation = newValue;
          this.setAttribute('aria-orientation', newValue);
        }
        break;

      case 'aria-label':
      case 'aria-labelledby':
        // Handled natively
        break;
    }
  }
}

// ============================================================================
// Register elements
// ============================================================================

defineElement('a11y-optgroup', A11yOptgroup);
defineElement('a11y-option', A11yOption);
defineElement('a11y-listbox', A11yListbox);
