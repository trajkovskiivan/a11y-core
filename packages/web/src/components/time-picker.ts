/**
 * compa11y TimePicker Web Component
 *
 * An accessible time input with an optional popup listbox of time suggestions
 * (combobox pattern). Supports 12h (AM/PM) and 24h modes, free-form text
 * input, step-based time list generation, min/max constraints, and validation.
 *
 * Usage:
 *   <compa11y-time-picker
 *     label="Meeting time"
 *     hour-cycle="12"
 *     step-minutes="15"
 *   ></compa11y-time-picker>
 *
 * Events:
 *   compa11y-time-picker-change  { hours: number, minutes: number, period?: string }
 *   compa11y-time-picker-open
 *   compa11y-time-picker-close
 *   compa11y-time-picker-clear
 *
 * Attributes:
 *   label, aria-label, value (HH:MM or H:MM AM/PM), hour-cycle (12|24),
 *   step-minutes, min-time (HH:MM), max-time (HH:MM), disabled, required,
 *   placeholder, name, hint, error, show-picker (boolean, default true)
 *
 * CSS custom properties:
 *   --compa11y-time-picker-bg, --compa11y-time-picker-border,
 *   --compa11y-time-picker-radius, --compa11y-time-picker-font-size,
 *   --compa11y-time-picker-label-color, --compa11y-time-picker-hint-color,
 *   --compa11y-time-picker-error-color, --compa11y-time-picker-listbox-bg,
 *   --compa11y-time-picker-listbox-border, --compa11y-time-picker-listbox-shadow,
 *   --compa11y-time-picker-option-highlight-bg, --compa11y-time-picker-option-selected-bg,
 *   --compa11y-focus-color
 */

import { announcePolite, createComponentWarnings } from '@compa11y/core';
import { Compa11yElement, defineElement } from '../utils/base-element';
import { TIME_PICKER_STYLES } from '../utils/styles';

const warn = createComponentWarnings('TimePicker');

// =============================================================================
// SVG
// =============================================================================

const CLOCK_ICON = `
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
    <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.5"/>
    <path d="M8 4v4l2.5 2.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
`;

const CLEAR_ICON = `
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" focusable="false">
    <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  </svg>
`;

// =============================================================================
// Helpers
// =============================================================================

function toMinutes(h: number, m: number): number {
  return h * 60 + m;
}

function isTimeInRange(
  h24: number,
  m: number,
  min?: { h: number; m: number },
  max?: { h: number; m: number },
): boolean {
  const t = toMinutes(h24, m);
  if (min && t < toMinutes(min.h, min.m)) return false;
  if (max && t > toMinutes(max.h, max.m)) return false;
  return true;
}

function to24h(h12: number, period: 'AM' | 'PM'): number {
  if (period === 'AM') return h12 === 12 ? 0 : h12;
  return h12 === 12 ? 12 : h12 + 12;
}

function to12h(h24: number): { hours: number; period: 'AM' | 'PM' } {
  if (h24 === 0) return { hours: 12, period: 'AM' };
  if (h24 < 12) return { hours: h24, period: 'AM' };
  if (h24 === 12) return { hours: 12, period: 'PM' };
  return { hours: h24 - 12, period: 'PM' };
}

function formatOptionLabel(h24: number, m: number, hourCycle: 12 | 24): string {
  const mm = String(m).padStart(2, '0');
  if (hourCycle === 24) return `${String(h24).padStart(2, '0')}:${mm}`;
  const { hours, period } = to12h(h24);
  return `${hours}:${mm} ${period}`;
}

function formatTimeValue(h24: number, m: number, hourCycle: 12 | 24): string {
  const mm = String(m).padStart(2, '0');
  if (hourCycle === 24) return `${String(h24).padStart(2, '0')}:${mm}`;
  const { hours, period } = to12h(h24);
  return `${hours}:${mm} ${period}`;
}

interface TimeOption {
  h24: number;
  m: number;
  label: string;
  disabled: boolean;
}

function generateTimeOptions(
  step: number,
  hourCycle: 12 | 24,
  min?: { h: number; m: number },
  max?: { h: number; m: number },
): TimeOption[] {
  const opts: TimeOption[] = [];
  for (let t = 0; t < 24 * 60; t += step) {
    const h24 = Math.floor(t / 60);
    const m = t % 60;
    opts.push({
      h24,
      m,
      label: formatOptionLabel(h24, m, hourCycle),
      disabled: !isTimeInRange(h24, m, min, max),
    });
  }
  return opts;
}

function parseTimeStr(raw: string): { h: number; m: number } | null {
  const s = raw.trim().toLowerCase();
  if (!s) return null;

  let period: 'AM' | 'PM' | undefined;
  let cleaned = s;
  if (/a\.?m\.?$/i.test(cleaned)) {
    period = 'AM';
    cleaned = cleaned.replace(/\s*a\.?m\.?$/i, '');
  } else if (/p\.?m\.?$/i.test(cleaned)) {
    period = 'PM';
    cleaned = cleaned.replace(/\s*p\.?m\.?$/i, '');
  } else if (/a$/i.test(cleaned)) {
    period = 'AM';
    cleaned = cleaned.replace(/\s*a$/i, '');
  } else if (/p$/i.test(cleaned)) {
    period = 'PM';
    cleaned = cleaned.replace(/\s*p$/i, '');
  }

  cleaned = cleaned.trim();
  const parts = cleaned.split(/[:.]/);
  const hourStr = parts[0];
  const minStr = parts[1] ?? '0';
  if (!hourStr) return null;

  const h = parseInt(hourStr, 10);
  const m = parseInt(minStr, 10);
  if (isNaN(h) || isNaN(m) || m < 0 || m > 59) return null;

  if (period) {
    if (h < 1 || h > 12) return null;
    return { h: to24h(h, period), m };
  }
  if (h < 0 || h > 23) return null;
  return { h, m };
}

function parseMinMax(val: string | null): { h: number; m: number } | undefined {
  if (!val) return undefined;
  const parsed = parseTimeStr(val);
  return parsed ? parsed : undefined;
}

// =============================================================================
// Component
// =============================================================================

export class Compa11yTimePicker extends Compa11yElement {
  private _hours: number | undefined = undefined;
  private _minutes: number | undefined = undefined;
  private _isOpen = false;
  private _highlightedIndex = -1;
  private _disabled = false;
  private _options: TimeOption[] = [];
  private _filteredOptions: TimeOption[] = [];

  // DOM refs
  private _inputEl: HTMLInputElement | null = null;
  private _listboxEl: HTMLUListElement | null = null;
  private _triggerBtn: HTMLButtonElement | null = null;
  private _clearBtn: HTMLButtonElement | null = null;
  private _errorEl: HTMLDivElement | null = null;
  private _hintEl: HTMLDivElement | null = null;

  // Bound handlers
  private _onInputHandler = this._onInput.bind(this);
  private _onKeyDownHandler = this._onKeyDown.bind(this);
  private _onFocusHandler = this._onFocus.bind(this);
  private _onBlurHandler = this._onBlur.bind(this);
  private _onTriggerClickHandler = this._onTriggerClick.bind(this);
  private _onDocClickHandler = this._onDocClick.bind(this);

  static get observedAttributes(): string[] {
    return [
      'label', 'aria-label', 'value', 'hour-cycle', 'step-minutes',
      'min-time', 'max-time', 'disabled', 'required', 'placeholder',
      'name', 'hint', 'error', 'show-picker',
    ];
  }

  get hourCycle(): 12 | 24 {
    const v = this.getAttribute('hour-cycle');
    return v === '24' ? 24 : 12;
  }

  get stepMinutes(): number {
    const v = parseInt(this.getAttribute('step-minutes') ?? '30', 10);
    return isNaN(v) || v < 1 ? 30 : v;
  }

  get value(): string {
    return this._inputEl?.value ?? '';
  }

  set value(v: string) {
    if (this._inputEl) this._inputEl.value = v;
    const parsed = parseTimeStr(v);
    if (parsed) {
      this._hours = parsed.h;
      this._minutes = parsed.m;
    }
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  protected setupAccessibility(): void {
    if (!this.getAttribute('role')) {
      // Container doesn't need a role — the input has role="combobox"
    }
  }

  protected render(): void {
    const shadow = this.attachShadow({ mode: 'open' });

    const label = this.getAttribute('label') ?? '';
    const ariaLabel = this.getAttribute('aria-label') ?? '';
    const hc = this.hourCycle;
    const hint = this.getAttribute('hint') ?? (hc === 24 ? 'Format: HH:MM (24h)' : 'Format: H:MM AM/PM');
    const error = this.getAttribute('error') ?? '';
    const placeholder = this.getAttribute('placeholder') ?? (hc === 24 ? 'HH:MM' : 'H:MM AM/PM');
    const showPicker = this.getAttribute('show-picker') !== 'false';
    this._disabled = this.hasAttribute('disabled');

    // Generate options
    this._rebuildOptions();

    // Initial value
    const initVal = this.getAttribute('value') ?? '';
    if (initVal) {
      const parsed = parseTimeStr(initVal);
      if (parsed) {
        this._hours = parsed.h;
        this._minutes = parsed.m;
      }
    }

    const displayValue = this._hours !== undefined && this._minutes !== undefined
      ? formatTimeValue(this._hours, this._minutes, hc)
      : initVal;

    // Dev warning
    if (!label && !ariaLabel) {
      warn.warning('TimePicker requires an accessible label.', 'Add label or aria-label attribute.');
    }

    shadow.innerHTML = `
      <style>${TIME_PICKER_STYLES}</style>
      <div class="time-picker" part="container">
        ${label ? `<label class="time-picker-label" for="${this._id}-input" part="label">${label}${this.hasAttribute('required') ? '<span aria-hidden="true" class="time-picker-required">*</span>' : ''}</label>` : ''}
        ${hint ? `<div class="time-picker-hint" id="${this._id}-hint" part="hint">${hint}</div>` : ''}
        <div class="time-picker-field" part="field">
          <input
            id="${this._id}-input"
            type="text"
            role="combobox"
            class="time-picker-input"
            part="input"
            value="${displayValue}"
            placeholder="${placeholder}"
            autocomplete="off"
            aria-expanded="false"
            aria-haspopup="listbox"
            aria-autocomplete="list"
            ${ariaLabel ? `aria-label="${ariaLabel}"` : ''}
            ${label ? `aria-labelledby="${this._id}-label"` : ''}
            aria-describedby="${this._id}-hint${error ? ` ${this._id}-error` : ''}"
            ${error ? 'aria-invalid="true"' : ''}
            ${this._disabled ? 'disabled' : ''}
            ${this.hasAttribute('required') ? 'required' : ''}
            ${this.getAttribute('name') ? `name="${this.getAttribute('name')}"` : ''}
          />
          <button type="button" class="time-picker-clear" part="clear" aria-label="Clear time" tabindex="-1" style="display:none">${CLEAR_ICON}</button>
          ${showPicker ? `
            <button type="button" class="time-picker-trigger" part="trigger" aria-label="Choose time" aria-expanded="false" ${this._disabled ? 'disabled' : ''}>
              ${CLOCK_ICON}
            </button>
          ` : ''}
        </div>
        <ul
          id="${this._id}-listbox"
          role="listbox"
          class="time-picker-listbox"
          part="listbox"
          ${label ? `aria-labelledby="${this._id}-label"` : `aria-label="${ariaLabel || 'Time options'}"`}
          style="display:none"
        ></ul>
        ${error ? `<div id="${this._id}-error" class="time-picker-error" role="alert" part="error">${error}</div>` : `<div id="${this._id}-error" class="time-picker-error" part="error" style="display:none"></div>`}
      </div>
    `;

    // Cache refs
    this._inputEl = shadow.querySelector('.time-picker-input');
    this._listboxEl = shadow.querySelector('.time-picker-listbox');
    this._triggerBtn = shadow.querySelector('.time-picker-trigger');
    this._clearBtn = shadow.querySelector('.time-picker-clear');
    this._errorEl = shadow.querySelector('.time-picker-error');
    this._hintEl = shadow.querySelector('.time-picker-hint');

    // Label id
    const labelEl = shadow.querySelector('.time-picker-label');
    if (labelEl) labelEl.id = `${this._id}-label`;

    this._updateClearVisibility();
  }

  protected setupEventListeners(): void {
    if (this._inputEl) {
      this._inputEl.addEventListener('input', this._onInputHandler);
      this._inputEl.addEventListener('keydown', this._onKeyDownHandler);
      this._inputEl.addEventListener('focus', this._onFocusHandler);
      this._inputEl.addEventListener('blur', this._onBlurHandler);
    }
    if (this._triggerBtn) {
      this._triggerBtn.addEventListener('click', this._onTriggerClickHandler);
    }
    if (this._clearBtn) {
      this._clearBtn.addEventListener('click', () => {
        this._clearValue();
      });
    }
    document.addEventListener('mousedown', this._onDocClickHandler);
  }

  protected cleanupEventListeners(): void {
    document.removeEventListener('mousedown', this._onDocClickHandler);
  }

  protected onAttributeChange(name: string): void {
    if (!this.shadowRoot) return;

    switch (name) {
      case 'disabled':
        this._disabled = this.hasAttribute('disabled');
        if (this._inputEl) this._inputEl.disabled = this._disabled;
        if (this._triggerBtn) this._triggerBtn.disabled = this._disabled;
        break;
      case 'error': {
        const err = this.getAttribute('error') ?? '';
        if (this._errorEl) {
          this._errorEl.textContent = err;
          this._errorEl.style.display = err ? '' : 'none';
        }
        if (this._inputEl) {
          if (err) {
            this._inputEl.setAttribute('aria-invalid', 'true');
          } else {
            this._inputEl.removeAttribute('aria-invalid');
          }
        }
        break;
      }
      case 'value': {
        const v = this.getAttribute('value') ?? '';
        const parsed = parseTimeStr(v);
        if (parsed) {
          this._hours = parsed.h;
          this._minutes = parsed.m;
          if (this._inputEl) {
            this._inputEl.value = formatTimeValue(parsed.h, parsed.m, this.hourCycle);
          }
        }
        break;
      }
      case 'hour-cycle':
      case 'step-minutes':
      case 'min-time':
      case 'max-time':
        this._rebuildOptions();
        break;
      case 'hint': {
        const hint = this.getAttribute('hint') ?? '';
        if (this._hintEl) this._hintEl.textContent = hint;
        break;
      }
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private _rebuildOptions(): void {
    const min = parseMinMax(this.getAttribute('min-time'));
    const max = parseMinMax(this.getAttribute('max-time'));
    this._options = generateTimeOptions(this.stepMinutes, this.hourCycle, min, max);
    this._filteredOptions = [...this._options];
  }

  private _updateClearVisibility(): void {
    if (this._clearBtn && this._inputEl) {
      this._clearBtn.style.display =
        this._inputEl.value && !this._disabled ? '' : 'none';
    }
  }

  private _open(): void {
    if (this._disabled || this._isOpen) return;
    this._isOpen = true;

    // Filter based on current input
    this._filterOptions();

    // Highlight current value or first
    this._highlightedIndex = -1;
    if (this._hours !== undefined && this._minutes !== undefined) {
      const idx = this._filteredOptions.findIndex(
        (o) => o.h24 === this._hours && o.m === this._minutes,
      );
      this._highlightedIndex = idx >= 0 ? idx : 0;
    } else {
      this._highlightedIndex = 0;
    }

    this._renderListbox();
    if (this._listboxEl) this._listboxEl.style.display = '';
    if (this._inputEl) {
      this._inputEl.setAttribute('aria-expanded', 'true');
      this._inputEl.setAttribute('aria-controls', `${this._id}-listbox`);
    }
    if (this._triggerBtn) this._triggerBtn.setAttribute('aria-expanded', 'true');

    this.emit('compa11y-time-picker-open');
    announcePolite(
      `${this._filteredOptions.length} time${this._filteredOptions.length === 1 ? '' : 's'} available`,
    );
  }

  private _close(): void {
    if (!this._isOpen) return;
    this._isOpen = false;
    this._highlightedIndex = -1;
    if (this._listboxEl) this._listboxEl.style.display = 'none';
    if (this._inputEl) {
      this._inputEl.setAttribute('aria-expanded', 'false');
      this._inputEl.removeAttribute('aria-controls');
      this._inputEl.removeAttribute('aria-activedescendant');
    }
    if (this._triggerBtn) this._triggerBtn.setAttribute('aria-expanded', 'false');
    this.emit('compa11y-time-picker-close');
  }

  private _filterOptions(): void {
    const text = (this._inputEl?.value ?? '').trim().toLowerCase();
    if (!text) {
      this._filteredOptions = [...this._options];
    } else {
      this._filteredOptions = this._options.filter((o) =>
        o.label.toLowerCase().includes(text),
      );
    }
  }

  private _renderListbox(): void {
    if (!this._listboxEl) return;

    if (this._filteredOptions.length === 0) {
      this._listboxEl.innerHTML = `<li role="presentation" class="time-picker-empty" part="empty">No matching times</li>`;
      return;
    }

    this._listboxEl.innerHTML = this._filteredOptions
      .map((opt, i) => {
        const isHighlighted = i === this._highlightedIndex;
        const isSelected =
          this._hours !== undefined &&
          opt.h24 === this._hours &&
          opt.m === this._minutes;
        return `<li
          id="${this._id}-option-${i}"
          role="option"
          class="time-picker-option${isHighlighted ? ' highlighted' : ''}${isSelected ? ' selected' : ''}${opt.disabled ? ' disabled' : ''}"
          part="option"
          aria-selected="${isSelected}"
          ${opt.disabled ? 'aria-disabled="true"' : ''}
          data-index="${i}"
        >${opt.label}</li>`;
      })
      .join('');

    // Update activedescendant
    if (this._highlightedIndex >= 0 && this._inputEl) {
      this._inputEl.setAttribute(
        'aria-activedescendant',
        `${this._id}-option-${this._highlightedIndex}`,
      );
    }

    // Scroll highlighted into view
    if (this._highlightedIndex >= 0) {
      const item = this._listboxEl.querySelector(`#${this._id}-option-${this._highlightedIndex}`) as HTMLElement | null;
      item?.scrollIntoView({ block: 'nearest' });
    }

    // Click handlers
    this._listboxEl.addEventListener('click', (e) => {
      const li = (e.target as HTMLElement).closest('[role="option"]') as HTMLElement | null;
      if (!li) return;
      const idx = parseInt(li.dataset.index ?? '-1', 10);
      const opt = this._filteredOptions[idx];
      if (opt && !opt.disabled) {
        this._selectOption(opt);
      }
    });

    // Mouse hover
    this._listboxEl.addEventListener('mouseover', (e) => {
      const li = (e.target as HTMLElement).closest('[role="option"]') as HTMLElement | null;
      if (!li) return;
      const idx = parseInt(li.dataset.index ?? '-1', 10);
      const opt = this._filteredOptions[idx];
      if (opt && !opt.disabled) {
        this._highlightedIndex = idx;
        this._updateHighlight();
      }
    });
  }

  private _updateHighlight(): void {
    if (!this._listboxEl) return;
    const items = this._listboxEl.querySelectorAll('[role="option"]');
    items.forEach((item, i) => {
      item.classList.toggle('highlighted', i === this._highlightedIndex);
    });
    if (this._highlightedIndex >= 0 && this._inputEl) {
      this._inputEl.setAttribute(
        'aria-activedescendant',
        `${this._id}-option-${this._highlightedIndex}`,
      );
      const item = items[this._highlightedIndex] as HTMLElement | undefined;
      item?.scrollIntoView({ block: 'nearest' });
    }
  }

  private _selectOption(opt: TimeOption): void {
    this._hours = opt.h24;
    this._minutes = opt.m;
    if (this._inputEl) {
      this._inputEl.value = opt.label;
    }
    this._clearValidationError();
    this._close();
    this._updateClearVisibility();
    this._inputEl?.focus();
    announcePolite(`${opt.label} selected`);
    this.emit('compa11y-time-picker-change', {
      hours: opt.h24,
      minutes: opt.m,
      ...(this.hourCycle === 12 ? { period: to12h(opt.h24).period } : {}),
    });
  }

  private _commitTypedValue(): void {
    const raw = this._inputEl?.value ?? '';
    if (!raw.trim()) return;

    const parsed = parseTimeStr(raw);
    if (!parsed) {
      this._showValidationError(
        this.hourCycle === 24
          ? 'Enter a valid time in HH:MM format.'
          : 'Enter a valid time in H:MM AM/PM format.',
      );
      return;
    }

    const min = parseMinMax(this.getAttribute('min-time'));
    const max = parseMinMax(this.getAttribute('max-time'));
    if (!isTimeInRange(parsed.h, parsed.m, min, max)) {
      const hc = this.hourCycle;
      const minLabel = min ? formatOptionLabel(min.h, min.m, hc) : '';
      const maxLabel = max ? formatOptionLabel(max.h, max.m, hc) : '';
      const msg =
        min && max
          ? `Enter a time between ${minLabel} and ${maxLabel}.`
          : min
            ? `Enter a time after ${minLabel}.`
            : `Enter a time before ${maxLabel}.`;
      this._showValidationError(msg);
      return;
    }

    this._hours = parsed.h;
    this._minutes = parsed.m;
    if (this._inputEl) {
      this._inputEl.value = formatTimeValue(parsed.h, parsed.m, this.hourCycle);
    }
    this._clearValidationError();
    this._updateClearVisibility();
    this.emit('compa11y-time-picker-change', {
      hours: parsed.h,
      minutes: parsed.m,
      ...(this.hourCycle === 12 ? { period: to12h(parsed.h).period } : {}),
    });
  }

  private _clearValue(): void {
    this._hours = undefined;
    this._minutes = undefined;
    if (this._inputEl) this._inputEl.value = '';
    this._clearValidationError();
    this._close();
    this._updateClearVisibility();
    this._inputEl?.focus();
    this.emit('compa11y-time-picker-clear');
  }

  private _showValidationError(msg: string): void {
    if (this._errorEl) {
      this._errorEl.textContent = msg;
      this._errorEl.style.display = '';
      this._errorEl.setAttribute('role', 'alert');
    }
    if (this._inputEl) this._inputEl.setAttribute('aria-invalid', 'true');
  }

  private _clearValidationError(): void {
    // Don't clear external error
    if (this.getAttribute('error')) return;
    if (this._errorEl) {
      this._errorEl.textContent = '';
      this._errorEl.style.display = 'none';
    }
    if (this._inputEl) this._inputEl.removeAttribute('aria-invalid');
  }

  // ── Event handlers ────────────────────────────────────────────────────────

  private _onInput(): void {
    this._updateClearVisibility();
    if (!this._isOpen) {
      this._open();
    } else {
      this._filterOptions();
      this._highlightedIndex = 0;
      this._renderListbox();
    }
  }

  private _onKeyDown(e: KeyboardEvent): void {
    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        if (!this._isOpen) {
          this._open();
        } else {
          let next = this._highlightedIndex;
          for (let i = 0; i < this._filteredOptions.length; i++) {
            next = (next + 1) % this._filteredOptions.length;
            if (!this._filteredOptions[next]?.disabled) break;
          }
          this._highlightedIndex = next;
          this._updateHighlight();
        }
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        if (!this._isOpen) {
          this._open();
        } else {
          let prev = this._highlightedIndex;
          for (let i = 0; i < this._filteredOptions.length; i++) {
            prev = (prev - 1 + this._filteredOptions.length) % this._filteredOptions.length;
            if (!this._filteredOptions[prev]?.disabled) break;
          }
          this._highlightedIndex = prev;
          this._updateHighlight();
        }
        break;
      }
      case 'Enter': {
        e.preventDefault();
        if (this._isOpen && this._highlightedIndex >= 0) {
          const opt = this._filteredOptions[this._highlightedIndex];
          if (opt && !opt.disabled) this._selectOption(opt);
        } else {
          this._commitTypedValue();
        }
        break;
      }
      case 'Escape': {
        if (this._isOpen) {
          e.preventDefault();
          this._close();
        }
        break;
      }
      case 'Tab': {
        if (this._isOpen) this._close();
        break;
      }
      case 'Home': {
        if (this._isOpen) {
          e.preventDefault();
          const first = this._filteredOptions.findIndex((o) => !o.disabled);
          if (first >= 0) {
            this._highlightedIndex = first;
            this._updateHighlight();
          }
        }
        break;
      }
      case 'End': {
        if (this._isOpen) {
          e.preventDefault();
          for (let i = this._filteredOptions.length - 1; i >= 0; i--) {
            if (!this._filteredOptions[i]?.disabled) {
              this._highlightedIndex = i;
              this._updateHighlight();
              break;
            }
          }
        }
        break;
      }
    }
  }

  private _onFocus(): void {
    if (!this._isOpen && this.getAttribute('show-picker') !== 'false') {
      this._open();
    }
  }

  private _onBlur(e: FocusEvent): void {
    // Check if focus moved within shadow root
    const related = e.relatedTarget as Node | null;
    if (related && this.shadowRoot?.contains(related)) return;
    this._commitTypedValue();
    this._close();
  }

  private _onTriggerClick(): void {
    if (this._isOpen) {
      this._close();
    } else {
      this._open();
      this._inputEl?.focus();
    }
  }

  private _onDocClick(e: MouseEvent): void {
    if (!this._isOpen) return;
    const path = e.composedPath();
    if (!path.includes(this)) {
      this._commitTypedValue();
      this._close();
    }
  }
}

defineElement('compa11y-time-picker', Compa11yTimePicker);
