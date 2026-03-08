/**
 * compa11y DatePicker Web Component
 *
 * Usage:
 * <compa11y-date-picker label="Appointment date" hint="MM/DD/YYYY">
 * </compa11y-date-picker>
 *
 * Attributes:
 *   label, aria-label, hint, error, mode ("single"|"range"),
 *   precision ("date"|"datetime"), hour-cycle ("12"|"24"),
 *   overlay ("popover"|"modal"), min-date, max-date,
 *   disabled, required, value, start-value, end-value,
 *   locale, first-day-of-week ("0"-"6")
 *
 * Events:
 *   compa11y-date-picker-change   { value: string }
 *   compa11y-date-picker-range    { start: string, end: string }
 *   compa11y-date-picker-open
 *   compa11y-date-picker-close
 */

import { announcePolite, createComponentWarnings } from '@compa11y/core';
import { Compa11yElement, defineElement } from '../utils/base-element';
import { DATE_PICKER_STYLES } from '../utils/styles';

const warn = createComponentWarnings('Compa11yDatePicker');

// ─── Date utilities ────────────────────────────────────────────────────────────

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isToday(d: Date): boolean { return isSameDay(d, new Date()); }

function isBeforeDate(a: Date, b: Date): boolean {
  return new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime() < new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
}

function isInRange(d: Date, s: Date | null, e: Date | null): boolean {
  if (!s || !e) return false;
  const t = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  return t >= new Date(s.getFullYear(), s.getMonth(), s.getDate()).getTime() && t <= new Date(e.getFullYear(), e.getMonth(), e.getDate()).getTime();
}

function addDays(d: Date, n: number): Date { const r = new Date(d); r.setDate(r.getDate() + n); return r; }

function addMonths(d: Date, n: number): Date {
  const r = new Date(d); const orig = r.getDate(); r.setMonth(r.getMonth() + n);
  if (r.getDate() !== orig) r.setDate(0); return r;
}

function addYears(d: Date, n: number): Date {
  const r = new Date(d); const orig = r.getDate(); r.setFullYear(r.getFullYear() + n);
  if (r.getDate() !== orig) r.setDate(0); return r;
}

function startOfWeek(d: Date, first: number): Date {
  const r = new Date(d); r.setDate(r.getDate() - ((r.getDay() - first + 7) % 7)); return r;
}

function endOfWeek(d: Date, first: number): Date { return addDays(startOfWeek(d, first), 6); }

function getDaysInMonth(y: number, m: number): number { return new Date(y, m + 1, 0).getDate(); }

function getCalendarDays(y: number, m: number, first: number): Date[] {
  const s = startOfWeek(new Date(y, m, 1), first); const days: Date[] = [];
  for (let i = 0; i < 42; i++) days.push(addDays(s, i)); return days;
}

function getWeekdayNames(locale: string, first: number): string[] {
  const names: string[] = []; const base = new Date(1970, 0, 4 + first);
  for (let i = 0; i < 7; i++) names.push(addDays(base, i).toLocaleDateString(locale, { weekday: 'short' }));
  return names;
}

function getMonthNames(locale: string): string[] {
  const names: string[] = [];
  for (let i = 0; i < 12; i++) names.push(new Date(2000, i, 1).toLocaleDateString(locale, { month: 'long' }));
  return names;
}

function formatDayLabel(d: Date, locale: string): string {
  return d.toLocaleDateString(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function formatDateDefault(d: Date, locale: string): string {
  return d.toLocaleDateString(locale, { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function formatDateTime(d: Date, locale: string, h12: boolean): string {
  return formatDateDefault(d, locale) + ' ' + d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: h12 });
}

function parseDateStr(text: string): Date | null {
  if (!text.trim()) return null;
  const d = new Date(text);
  if (!isNaN(d.getTime())) return d;
  const parts = text.split(/[/\-.\s]+/).map(Number);
  if (parts.length >= 3) {
    const [a, b, c] = parts as [number, number, number];
    if (c > 31) { const d1 = new Date(c, a - 1, b); if (!isNaN(d1.getTime())) return d1; }
    if (a > 31) { const d2 = new Date(a, b - 1, c); if (!isNaN(d2.getTime())) return d2; }
  }
  return null;
}

// ─── Body scroll lock ──────────────────────────────────────────────────────────

let bodyLockCount = 0;
let savedOverflow = '';
function lockBody(): void { if (bodyLockCount === 0) { savedOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; } bodyLockCount++; }
function unlockBody(): void { bodyLockCount--; if (bodyLockCount <= 0) { bodyLockCount = 0; document.body.style.overflow = savedOverflow; } }

// ─── Component ─────────────────────────────────────────────────────────────────

type Mode = 'single' | 'range';
type Precision = 'date' | 'datetime';
type Overlay = 'popover' | 'modal';
type View = 'days' | 'months' | 'years';

export class Compa11yDatePicker extends Compa11yElement {
  // State
  private _open = false;
  private _mode: Mode = 'single';
  private _precision: Precision = 'date';
  private _hourCycle: 12 | 24 = 12;
  private _overlay: Overlay = 'popover';
  private _locale = 'en-US';
  private _firstDay = 0;
  private _disabled = false;
  private _required = false;
  private _minDate: Date | null = null;
  private _maxDate: Date | null = null;

  // Selection
  private _selectedDate: Date | null = null;
  private _rangeStart: Date | null = null;
  private _rangeEnd: Date | null = null;

  // Calendar navigation
  private _viewDate = new Date();
  private _focusedDate = new Date();
  private _currentView: View = 'days';

  // Time
  private _hours = 0;
  private _minutes = 0;
  private _period: 'AM' | 'PM' = 'AM';
  private _endHours = 23;
  private _endMinutes = 59;
  private _endPeriod: 'AM' | 'PM' = 'PM';

  // DOM refs
  private _triggerEl: HTMLButtonElement | null = null;
  private _calendarEl: HTMLDivElement | null = null;
  private _inputEl: HTMLInputElement | null = null;

  // Handlers
  private _outsideClickHandler: ((e: PointerEvent) => void) | null = null;
  private _escapeHandler: ((e: KeyboardEvent) => void) | null = null;
  private _positionHandler: (() => void) | null = null;

  static get observedAttributes() {
    return [
      'label', 'aria-label', 'hint', 'error', 'mode', 'precision',
      'hour-cycle', 'overlay', 'min-date', 'max-date', 'disabled',
      'required', 'value', 'start-value', 'end-value', 'locale',
      'first-day-of-week', 'open',
    ];
  }

  get open(): boolean { return this._open; }
  set open(v: boolean) {
    if (v === this._open) return;
    this._open = v;
    this.toggleAttribute('open', v);
    if (v) this.showCalendar();
    else this.hideCalendar();
  }

  get selectedDate(): Date | null { return this._selectedDate; }
  set selectedDate(v: Date | null) {
    this._selectedDate = v;
    this.syncInputValue();
    this.emit('compa11y-date-picker-change', { value: v ? this.formatDate(v) : null });
  }

  get rangeStart(): Date | null { return this._rangeStart; }
  get rangeEnd(): Date | null { return this._rangeEnd; }

  protected setupAccessibility(): void {
    const label = this.getAttribute('label');
    const ariaLabel = this.getAttribute('aria-label');
    if (!label && !ariaLabel) {
      warn.warning('DatePicker requires an accessible label.', 'Add a label or aria-label attribute.');
    }

    this._mode = (this.getAttribute('mode') as Mode) || 'single';
    this._precision = (this.getAttribute('precision') as Precision) || 'date';
    this._hourCycle = this.getAttribute('hour-cycle') === '24' ? 24 : 12;
    this._overlay = (this.getAttribute('overlay') as Overlay) || 'popover';
    this._locale = this.getAttribute('locale') || 'en-US';
    this._firstDay = parseInt(this.getAttribute('first-day-of-week') || '0', 10);
    this._disabled = this.hasAttribute('disabled');
    this._required = this.hasAttribute('required');

    const minStr = this.getAttribute('min-date');
    const maxStr = this.getAttribute('max-date');
    if (minStr) this._minDate = parseDateStr(minStr);
    if (maxStr) this._maxDate = parseDateStr(maxStr);

    const valueStr = this.getAttribute('value');
    if (valueStr) this._selectedDate = parseDateStr(valueStr);
    const startStr = this.getAttribute('start-value');
    if (startStr) this._rangeStart = parseDateStr(startStr);
    const endStr = this.getAttribute('end-value');
    if (endStr) this._rangeEnd = parseDateStr(endStr);

    const initDate = this._selectedDate ?? this._rangeStart ?? new Date();
    this._viewDate = new Date(initDate);
    this._focusedDate = new Date(initDate);
    this._hours = initDate.getHours();
    this._minutes = initDate.getMinutes();
    this._period = this._hours >= 12 ? 'PM' : 'AM';
  }

  protected render(): void {
    const shadow = this.attachShadow({ mode: 'open' });
    const label = this.getAttribute('label') || '';
    const hint = this.getAttribute('hint') || '';
    const error = this.getAttribute('error') || '';
    const labelFor = this._mode === 'single' ? `${this._id}-input` : `${this._id}-start`;

    shadow.innerHTML = `
      <style>${DATE_PICKER_STYLES}</style>
      ${label ? `<label class="label" for="${labelFor}">${label}</label>` : ''}
      <div class="field-row">
        ${this._mode === 'single' ? `
          <input
            id="${this._id}-input"
            class="field-input"
            type="text"
            inputmode="numeric"
            autocomplete="off"
            placeholder="${hint || ''}"
            ${this._disabled ? 'disabled' : ''}
            ${this._required ? 'required' : ''}
            ${error ? `aria-invalid="true"` : ''}
            ${hint ? `aria-describedby="${this._id}-hint"` : ''}
            ${error ? `aria-describedby="${this._id}-hint ${this._id}-error"` : ''}
          />
        ` : `
          <label for="${this._id}-start" class="sr-only">Start date</label>
          <input id="${this._id}-start" class="field-input" type="text" inputmode="numeric" autocomplete="off" placeholder="Start date" ${this._disabled ? 'disabled' : ''} />
          <span aria-hidden="true">–</span>
          <label for="${this._id}-end" class="sr-only">End date</label>
          <input id="${this._id}-end" class="field-input" type="text" inputmode="numeric" autocomplete="off" placeholder="End date" ${this._disabled ? 'disabled' : ''} />
        `}
        <button
          class="trigger-btn"
          type="button"
          aria-label="Open calendar"
          aria-haspopup="dialog"
          aria-expanded="false"
          ${this._disabled ? 'disabled' : ''}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
            <rect x="2" y="4" width="16" height="14" rx="2" />
            <line x1="2" y1="8" x2="18" y2="8" />
            <line x1="6" y1="2" x2="6" y2="6" />
            <line x1="14" y1="2" x2="14" y2="6" />
          </svg>
        </button>
      </div>
      ${hint ? `<div id="${this._id}-hint" class="hint">${hint}</div>` : ''}
      ${error ? `<div id="${this._id}-error" class="error" role="alert">${error}</div>` : ''}
      <div class="overlay" ${this._overlay === 'modal' ? 'data-modal' : ''}></div>
      <div
        class="calendar"
        role="dialog"
        aria-modal="${this._overlay === 'modal' ? 'true' : 'false'}"
        aria-label="${this._mode === 'range' ? 'Choose date range' : 'Choose date'}${this._precision === 'datetime' ? ' and time' : ''}"
        tabindex="-1"
      ></div>
      <div class="sr-only" role="status" aria-live="polite" aria-atomic="true"></div>
    `;

    // Grab refs
    this._triggerEl = shadow.querySelector('.trigger-btn');
    this._calendarEl = shadow.querySelector('.calendar');
    this._inputEl = shadow.querySelector('.field-input');

    this.syncInputValue();
  }

  protected setupEventListeners(): void {
    this._triggerEl?.addEventListener('click', this.handleTriggerClick);

    // Input blur/enter
    if (this._mode === 'single' && this._inputEl) {
      this._inputEl.addEventListener('blur', this.handleInputCommit);
      this._inputEl.addEventListener('keydown', this.handleInputKeyDown);
    }

    // Overlay click for modal close
    const overlay = this.shadowRoot?.querySelector('.overlay');
    overlay?.addEventListener('click', () => { if (this._open) this.open = false; });
  }

  protected cleanupEventListeners(): void {
    this._triggerEl?.removeEventListener('click', this.handleTriggerClick);
    if (this._inputEl) {
      this._inputEl.removeEventListener('blur', this.handleInputCommit);
      this._inputEl.removeEventListener('keydown', this.handleInputKeyDown);
    }
    this.removeGlobalListeners();
  }

  protected onAttributeChange(name: string, _old: string | null, next: string | null): void {
    switch (name) {
      case 'open': this.open = next !== null; break;
      case 'disabled': this._disabled = next !== null; this.renderCalendarContent(); break;
      case 'value':
        this._selectedDate = next ? parseDateStr(next) : null;
        this.syncInputValue();
        break;
      case 'error':
        this.renderError(next);
        break;
    }
  }

  // ─── Event handlers ──────────────────────────────────────────────────────

  private handleTriggerClick = (): void => {
    if (this._disabled) return;
    this.open = !this._open;
  };

  private handleInputCommit = (): void => {
    const text = this._inputEl?.value || '';
    if (!text.trim()) { this.selectedDate = null; return; }
    const parsed = parseDateStr(text);
    if (parsed && !this.isDateDisabled(parsed)) {
      this.selectedDate = parsed;
      this.announce(`Date selected: ${this.formatDate(parsed)}`);
    }
  };

  private handleInputKeyDown = (e: Event): void => {
    if ((e as KeyboardEvent).key === 'Enter') {
      (e as KeyboardEvent).preventDefault();
      this.handleInputCommit();
    }
  };

  // ─── Calendar ────────────────────────────────────────────────────────────

  private showCalendar(): void {
    // Reset view
    const target = this._selectedDate ?? this._rangeStart ?? new Date();
    this._viewDate = new Date(target);
    this._focusedDate = new Date(target);
    this._currentView = 'days';

    // Update trigger
    this._triggerEl?.setAttribute('aria-expanded', 'true');

    // Render calendar content
    this.renderCalendarContent();

    // Position
    if (this._overlay === 'popover') {
      this.positionCalendar();
      this._positionHandler = () => this.positionCalendar();
      window.addEventListener('scroll', this._positionHandler, { passive: true, capture: true });
      window.addEventListener('resize', this._positionHandler, { passive: true });
    }

    // Body lock for modal
    if (this._overlay === 'modal') lockBody();

    // Outside click
    this._outsideClickHandler = (e: PointerEvent) => {
      const path = e.composedPath();
      if (this._calendarEl && path.includes(this._calendarEl)) return;
      if (this._triggerEl && path.includes(this._triggerEl)) return;
      this.open = false;
    };
    document.addEventListener('pointerdown', this._outsideClickHandler, true);

    // Escape
    this._escapeHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        this.open = false;
        this._triggerEl?.focus();
      }
    };
    document.addEventListener('keydown', this._escapeHandler, true);

    // Focus the selected day
    requestAnimationFrame(() => {
      const focused = this._calendarEl?.querySelector('[tabindex="0"].day-btn') as HTMLElement;
      focused?.focus();
    });

    this.emit('compa11y-date-picker-open');
    announcePolite('Calendar opened');
  }

  private hideCalendar(): void {
    this._triggerEl?.setAttribute('aria-expanded', 'false');
    if (this._overlay === 'modal') unlockBody();
    this.removeGlobalListeners();
    this._triggerEl?.focus();
    this.emit('compa11y-date-picker-close');
  }

  private removeGlobalListeners(): void {
    if (this._outsideClickHandler) {
      document.removeEventListener('pointerdown', this._outsideClickHandler, true);
      this._outsideClickHandler = null;
    }
    if (this._escapeHandler) {
      document.removeEventListener('keydown', this._escapeHandler, true);
      this._escapeHandler = null;
    }
    if (this._positionHandler) {
      window.removeEventListener('scroll', this._positionHandler, true);
      window.removeEventListener('resize', this._positionHandler);
      this._positionHandler = null;
    }
  }

  private positionCalendar(): void {
    if (!this._triggerEl || !this._calendarEl) return;
    const rect = this._triggerEl.getBoundingClientRect();
    const cal = this._calendarEl;
    let top = rect.bottom + 8;
    let left = rect.left;
    const calRect = cal.getBoundingClientRect();
    if (top + calRect.height > window.innerHeight && rect.top - calRect.height - 8 > 0) {
      top = rect.top - calRect.height - 8;
    }
    left = Math.max(8, Math.min(left, window.innerWidth - calRect.width - 8));
    top = Math.max(8, top);
    cal.style.top = `${top}px`;
    cal.style.left = `${left}px`;
  }

  // ─── Rendering ───────────────────────────────────────────────────────────

  private renderCalendarContent(): void {
    if (!this._calendarEl) return;

    const header = this.renderHeader();
    let body = '';
    if (this._currentView === 'days') body = this.renderDayGrid();
    else if (this._currentView === 'months') body = this.renderMonthGrid();
    else body = this.renderYearGrid();

    const summary = this.renderSummary();
    const time = this._precision === 'datetime' ? this.renderTimePanel() : '';
    const actions = this.renderActions();

    this._calendarEl.innerHTML = `${header}${body}${summary}${time}${actions}`;

    // Wire up events
    this.wireCalendarEvents();
  }

  private renderHeader(): string {
    const month = this._viewDate.toLocaleDateString(this._locale, { month: 'long' });
    const year = this._viewDate.getFullYear();
    return `
      <div class="calendar-header">
        <button type="button" class="nav-btn" data-nav="prev" aria-label="Previous month">&#8249;</button>
        <div style="display:flex;gap:0.25rem">
          <button type="button" class="month-year-btn" data-view="months" aria-label="Choose month, current month: ${month}" aria-pressed="${this._currentView === 'months'}">${month}</button>
          <button type="button" class="month-year-btn" data-view="years" aria-label="Choose year, current year: ${year}" aria-pressed="${this._currentView === 'years'}">${year}</button>
        </div>
        <button type="button" class="nav-btn" data-nav="next" aria-label="Next month">&#8250;</button>
      </div>
    `;
  }

  private renderDayGrid(): string {
    const y = this._viewDate.getFullYear();
    const m = this._viewDate.getMonth();
    const days = getCalendarDays(y, m, this._firstDay);
    const weekdays = getWeekdayNames(this._locale, this._firstDay);

    let html = `<table class="day-grid" role="grid" aria-label="${this._viewDate.toLocaleDateString(this._locale, { month: 'long', year: 'numeric' })}"><thead><tr>`;
    for (const wd of weekdays) html += `<th scope="col" abbr="${wd}">${wd}</th>`;
    html += '</tr></thead><tbody>';

    for (let w = 0; w < 6; w++) {
      html += '<tr>';
      for (let d = 0; d < 7; d++) {
        const day = days[w * 7 + d]!;
        const label = formatDayLabel(day, this._locale);
        const isDisabled = this.isDateDisabled(day);
        const isCurrMonth = day.getMonth() === m;
        const isTod = isToday(day);
        const isSel = this._mode === 'single' && this._selectedDate && isSameDay(day, this._selectedDate);
        const isRS = this._mode === 'range' && this._rangeStart && isSameDay(day, this._rangeStart);
        const isRE = this._mode === 'range' && this._rangeEnd && isSameDay(day, this._rangeEnd);
        const inR = this._mode === 'range' && isInRange(day, this._rangeStart, this._rangeEnd);
        const isFocused = isSameDay(day, this._focusedDate);

        const stateLabels = [label];
        if (isTod) stateLabels.push('today');
        if (isSel) stateLabels.push('selected');
        if (isRS) stateLabels.push('start date');
        if (isRE) stateLabels.push('end date');
        if (inR && !isRS && !isRE) stateLabels.push('in selected range');

        html += `<td role="gridcell" style="padding:0">
          <button type="button" class="day-btn"
            tabindex="${isFocused ? 0 : -1}"
            ${isDisabled ? 'disabled' : ''}
            aria-label="${stateLabels.join(', ')}"
            ${isTod ? 'aria-current="date"' : ''}
            ${isSel ? 'aria-pressed="true"' : ''}
            ${isRS || isRE ? 'aria-selected="true"' : ''}
            data-date="${day.toISOString()}"
            ${isTod ? 'data-today' : ''}
            ${isSel ? 'data-selected' : ''}
            ${isRS ? 'data-range-start' : ''}
            ${isRE ? 'data-range-end' : ''}
            ${inR ? 'data-in-range' : ''}
            ${!isCurrMonth ? 'data-outside-month' : ''}
          >${day.getDate()}</button>
        </td>`;
      }
      html += '</tr>';
    }
    html += '</tbody></table>';
    return html;
  }

  private renderMonthGrid(): string {
    const names = getMonthNames(this._locale);
    let html = '<div class="month-grid" role="grid" aria-label="Choose month">';
    for (let i = 0; i < 12; i++) {
      const isCurrent = i === this._viewDate.getMonth();
      html += `<button type="button" class="month-cell" role="gridcell"
        tabindex="${isCurrent ? 0 : -1}"
        aria-pressed="${isCurrent}" aria-label="${names[i]} ${this._viewDate.getFullYear()}"
        data-month="${i}" ${isCurrent ? 'data-selected' : ''}
      >${names[i]!.substring(0, 3)}</button>`;
    }
    html += '</div>';
    return html;
  }

  private renderYearGrid(): string {
    const cur = this._viewDate.getFullYear();
    const start = cur - (cur % 12);
    let html = `<div data-year-grid>
      <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem">
        <button type="button" class="nav-btn" data-year-nav="prev" aria-label="Previous 12 years">&#8249;</button>
        <span aria-live="polite">${start} – ${start + 11}</span>
        <button type="button" class="nav-btn" data-year-nav="next" aria-label="Next 12 years">&#8250;</button>
      </div>
      <div class="year-grid-inner" role="grid" aria-label="Choose year">`;
    for (let i = 0; i < 12; i++) {
      const y = start + i;
      const isCurrent = y === cur;
      html += `<button type="button" class="year-cell" role="gridcell"
        tabindex="${isCurrent ? 0 : -1}"
        aria-pressed="${isCurrent}" aria-label="${y}"
        data-year="${y}" ${isCurrent ? 'data-selected' : ''}
      >${y}</button>`;
    }
    html += '</div></div>';
    return html;
  }

  private renderSummary(): string {
    let text = '';
    if (this._mode === 'single' && this._selectedDate) {
      text = `Selected: ${this.formatDate(this._selectedDate)}`;
    } else if (this._mode === 'range') {
      const parts: string[] = [];
      if (this._rangeStart) parts.push(`Start: ${this.formatDate(this._rangeStart)}`);
      if (this._rangeEnd) parts.push(`End: ${this.formatDate(this._rangeEnd)}`);
      text = parts.join(' — ');
    }
    return text ? `<div class="summary" aria-live="polite">${text}</div>` : '';
  }

  private renderTimePanel(): string {
    const h12 = this._hourCycle === 12;
    const displayH = h12 ? (this._hours > 12 ? this._hours - 12 : this._hours === 0 ? 12 : this._hours) : this._hours;

    let html = `<div class="time-panel">
      <fieldset><legend>${this._mode === 'range' ? 'Start time' : 'Time'}</legend>
        <div class="time-row">
          <label for="${this._id}-hour" class="sr-only">Hour</label>
          <input id="${this._id}-hour" class="time-input" type="text" inputmode="numeric" value="${String(displayH).padStart(2, '0')}" aria-label="Hour" data-time="hour" />
          <span aria-hidden="true">:</span>
          <label for="${this._id}-min" class="sr-only">Minute</label>
          <input id="${this._id}-min" class="time-input" type="text" inputmode="numeric" value="${String(this._minutes).padStart(2, '0')}" aria-label="Minute" data-time="minute" />
          ${h12 ? `
            <div role="group" aria-label="AM/PM" style="display:flex;gap:0.125rem">
              <button type="button" class="period-btn" aria-pressed="${this._period === 'AM'}" data-period="AM">AM</button>
              <button type="button" class="period-btn" aria-pressed="${this._period === 'PM'}" data-period="PM">PM</button>
            </div>
          ` : ''}
        </div>
      </fieldset>`;

    if (this._mode === 'range') {
      const displayEH = h12 ? (this._endHours > 12 ? this._endHours - 12 : this._endHours === 0 ? 12 : this._endHours) : this._endHours;
      html += `<fieldset style="margin-top:0.5rem"><legend>End time</legend>
        <div class="time-row">
          <label for="${this._id}-ehour" class="sr-only">End hour</label>
          <input id="${this._id}-ehour" class="time-input" type="text" inputmode="numeric" value="${String(displayEH).padStart(2, '0')}" aria-label="End hour" data-time="end-hour" />
          <span aria-hidden="true">:</span>
          <label for="${this._id}-emin" class="sr-only">End minute</label>
          <input id="${this._id}-emin" class="time-input" type="text" inputmode="numeric" value="${String(this._endMinutes).padStart(2, '0')}" aria-label="End minute" data-time="end-minute" />
          ${h12 ? `
            <div role="group" aria-label="End AM/PM" style="display:flex;gap:0.125rem">
              <button type="button" class="period-btn" aria-pressed="${this._endPeriod === 'AM'}" data-end-period="AM">AM</button>
              <button type="button" class="period-btn" aria-pressed="${this._endPeriod === 'PM'}" data-end-period="PM">PM</button>
            </div>
          ` : ''}
        </div>
      </fieldset>`;
    }

    html += '</div>';
    return html;
  }

  private renderActions(): string {
    const showApply = this._precision === 'datetime';
    return `<div class="actions">
      <div style="display:flex;gap:0.25rem">
        <button type="button" data-action="today">Today</button>
        <button type="button" data-action="clear">Clear</button>
      </div>
      ${showApply ? `
        <div style="display:flex;gap:0.25rem">
          <button type="button" data-action="cancel">Cancel</button>
          <button type="button" data-action="apply" data-primary>Apply</button>
        </div>
      ` : ''}
    </div>`;
  }

  // ─── Wire events inside calendar ─────────────────────────────────────────

  private wireCalendarEvents(): void {
    if (!this._calendarEl) return;
    const cal = this._calendarEl;

    // Nav buttons
    cal.querySelector('[data-nav="prev"]')?.addEventListener('click', () => {
      this._viewDate = addMonths(this._viewDate, -1);
      this._focusedDate = new Date(this._viewDate.getFullYear(), this._viewDate.getMonth(), Math.min(this._focusedDate.getDate(), getDaysInMonth(this._viewDate.getFullYear(), this._viewDate.getMonth())));
      this.renderCalendarContent();
      this.announce(this._viewDate.toLocaleDateString(this._locale, { month: 'long', year: 'numeric' }));
    });

    cal.querySelector('[data-nav="next"]')?.addEventListener('click', () => {
      this._viewDate = addMonths(this._viewDate, 1);
      this._focusedDate = new Date(this._viewDate.getFullYear(), this._viewDate.getMonth(), Math.min(this._focusedDate.getDate(), getDaysInMonth(this._viewDate.getFullYear(), this._viewDate.getMonth())));
      this.renderCalendarContent();
      this.announce(this._viewDate.toLocaleDateString(this._locale, { month: 'long', year: 'numeric' }));
    });

    // View toggles
    cal.querySelector('[data-view="months"]')?.addEventListener('click', () => {
      this._currentView = this._currentView === 'months' ? 'days' : 'months';
      this.renderCalendarContent();
    });
    cal.querySelector('[data-view="years"]')?.addEventListener('click', () => {
      this._currentView = this._currentView === 'years' ? 'days' : 'years';
      this.renderCalendarContent();
    });

    // Day buttons
    cal.querySelectorAll('.day-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const dateStr = (btn as HTMLElement).getAttribute('data-date');
        if (!dateStr) return;
        const date = new Date(dateStr);
        this.handleDaySelect(date);
      });
      btn.addEventListener('keydown', (e: Event) => this.handleDayKeyDown(e as KeyboardEvent));
    });

    // Month cells
    cal.querySelectorAll('.month-cell').forEach((btn) => {
      btn.addEventListener('click', () => {
        const mi = parseInt((btn as HTMLElement).getAttribute('data-month') || '0', 10);
        this._viewDate.setMonth(mi);
        this._focusedDate = new Date(this._viewDate.getFullYear(), mi, Math.min(this._focusedDate.getDate(), getDaysInMonth(this._viewDate.getFullYear(), mi)));
        this._currentView = 'days';
        this.renderCalendarContent();
      });
    });

    // Year cells
    cal.querySelectorAll('.year-cell').forEach((btn) => {
      btn.addEventListener('click', () => {
        const y = parseInt((btn as HTMLElement).getAttribute('data-year') || '0', 10);
        this._viewDate.setFullYear(y);
        this._focusedDate = new Date(y, this._focusedDate.getMonth(), Math.min(this._focusedDate.getDate(), getDaysInMonth(y, this._focusedDate.getMonth())));
        this._currentView = 'months';
        this.renderCalendarContent();
      });
    });

    // Year nav
    cal.querySelector('[data-year-nav="prev"]')?.addEventListener('click', () => {
      this._viewDate = addYears(this._viewDate, -12);
      this.renderCalendarContent();
    });
    cal.querySelector('[data-year-nav="next"]')?.addEventListener('click', () => {
      this._viewDate = addYears(this._viewDate, 12);
      this.renderCalendarContent();
    });

    // Time inputs
    cal.querySelector('[data-time="hour"]')?.addEventListener('change', (e) => {
      const v = parseInt((e.target as HTMLInputElement).value, 10);
      if (!isNaN(v)) this._hours = Math.max(this._hourCycle === 24 ? 0 : 1, Math.min(this._hourCycle === 24 ? 23 : 12, v));
    });
    cal.querySelector('[data-time="minute"]')?.addEventListener('change', (e) => {
      const v = parseInt((e.target as HTMLInputElement).value, 10);
      if (!isNaN(v)) this._minutes = Math.max(0, Math.min(59, v));
    });
    cal.querySelectorAll('[data-period]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this._period = (btn as HTMLElement).getAttribute('data-period') as 'AM' | 'PM';
        this.renderCalendarContent();
      });
    });
    cal.querySelectorAll('[data-end-period]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this._endPeriod = (btn as HTMLElement).getAttribute('data-end-period') as 'AM' | 'PM';
        this.renderCalendarContent();
      });
    });

    // Actions
    cal.querySelector('[data-action="today"]')?.addEventListener('click', () => {
      const today = new Date();
      this._viewDate = new Date(today.getFullYear(), today.getMonth(), 1);
      this._focusedDate = today;
      this._currentView = 'days';
      this.renderCalendarContent();
      this.announce(`Navigated to today`);
    });
    cal.querySelector('[data-action="clear"]')?.addEventListener('click', () => {
      if (this._mode === 'single') this.selectedDate = null;
      else { this._rangeStart = null; this._rangeEnd = null; this.emit('compa11y-date-picker-range', { start: null, end: null }); }
      this.renderCalendarContent();
      this.announce('Selection cleared');
    });
    cal.querySelector('[data-action="cancel"]')?.addEventListener('click', () => { this.open = false; });
    cal.querySelector('[data-action="apply"]')?.addEventListener('click', () => { this.applyDateTime(); this.open = false; });
  }

  // ─── Day selection & keyboard ────────────────────────────────────────────

  private handleDaySelect(date: Date): void {
    if (this.isDateDisabled(date)) return;

    if (this._mode === 'single') {
      this._selectedDate = date;
      if (this._precision === 'datetime') {
        this.renderCalendarContent();
        this.announce(`Date selected: ${formatDayLabel(date, this._locale)}`);
      } else {
        this.selectedDate = date;
        this.open = false;
      }
    } else {
      if (!this._rangeStart || (this._rangeStart && this._rangeEnd)) {
        this._rangeStart = date;
        this._rangeEnd = null;
        this.announce(`Range start: ${formatDayLabel(date, this._locale)}`);
      } else if (isBeforeDate(date, this._rangeStart)) {
        this._rangeStart = date;
        this._rangeEnd = null;
        this.announce(`Range start: ${formatDayLabel(date, this._locale)}`);
      } else {
        this._rangeEnd = date;
        this.announce(`Range end: ${formatDayLabel(date, this._locale)}`);
        if (this._precision === 'date') {
          this.emit('compa11y-date-picker-range', { start: this.formatDate(this._rangeStart), end: this.formatDate(date) });
          this.open = false;
          return;
        }
      }
      this.renderCalendarContent();
    }
  }

  private handleDayKeyDown(e: KeyboardEvent): void {
    const btn = e.target as HTMLElement;
    const dateStr = btn.getAttribute('data-date');
    if (!dateStr) return;
    const current = new Date(dateStr);
    let next: Date | null = null;

    switch (e.key) {
      case 'ArrowLeft': next = addDays(current, -1); break;
      case 'ArrowRight': next = addDays(current, 1); break;
      case 'ArrowUp': next = addDays(current, -7); break;
      case 'ArrowDown': next = addDays(current, 7); break;
      case 'Home': next = startOfWeek(current, this._firstDay); break;
      case 'End': next = endOfWeek(current, this._firstDay); break;
      case 'PageUp': next = e.shiftKey ? addYears(current, -1) : addMonths(current, -1); break;
      case 'PageDown': next = e.shiftKey ? addYears(current, 1) : addMonths(current, 1); break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        this.handleDaySelect(current);
        return;
      default: return;
    }

    if (next) {
      e.preventDefault();
      // Skip disabled
      if (this.isDateDisabled(next)) {
        const step = ['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key) ? -1 : 1;
        let attempt = next;
        for (let i = 0; i < 365; i++) { if (!this.isDateDisabled(attempt)) break; attempt = addDays(attempt, step); }
        next = attempt;
      }
      this._focusedDate = next;
      if (next.getMonth() !== this._viewDate.getMonth() || next.getFullYear() !== this._viewDate.getFullYear()) {
        this._viewDate = new Date(next.getFullYear(), next.getMonth(), 1);
      }
      this.renderCalendarContent();
      requestAnimationFrame(() => {
        const focused = this._calendarEl?.querySelector('[tabindex="0"].day-btn') as HTMLElement;
        focused?.focus();
      });
    }
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  private isDateDisabled(d: Date): boolean {
    if (this._disabled) return true;
    if (this._minDate && isBeforeDate(d, this._minDate)) return true;
    if (this._maxDate && isBeforeDate(this._maxDate, d)) return true;
    return false;
  }

  private formatDate(d: Date): string {
    if (this._precision === 'datetime') return formatDateTime(d, this._locale, this._hourCycle === 12);
    return formatDateDefault(d, this._locale);
  }

  private syncInputValue(): void {
    if (this._inputEl && this._mode === 'single') {
      this._inputEl.value = this._selectedDate ? this.formatDate(this._selectedDate) : '';
    }
  }

  private applyDateTime(): void {
    if (this._mode === 'single' && this._selectedDate) {
      const result = new Date(this._selectedDate);
      let h = this._hours;
      if (this._hourCycle === 12) h = this._period === 'PM' ? (h % 12) + 12 : h % 12;
      result.setHours(h, this._minutes, 0, 0);
      this.selectedDate = result;
    }
    if (this._mode === 'range' && this._rangeStart) {
      const start = new Date(this._rangeStart);
      let sh = this._hours;
      if (this._hourCycle === 12) sh = this._period === 'PM' ? (sh % 12) + 12 : sh % 12;
      start.setHours(sh, this._minutes, 0, 0);
      this._rangeStart = start;

      if (this._rangeEnd) {
        const end = new Date(this._rangeEnd);
        let eh = this._endHours;
        if (this._hourCycle === 12) eh = this._endPeriod === 'PM' ? (eh % 12) + 12 : eh % 12;
        end.setHours(eh, this._endMinutes, 0, 0);
        this._rangeEnd = end;
      }

      this.emit('compa11y-date-picker-range', {
        start: this.formatDate(this._rangeStart),
        end: this._rangeEnd ? this.formatDate(this._rangeEnd) : null,
      });
    }
  }

  private announce(msg: string): void {
    const liveEl = this.shadowRoot?.querySelector('[role="status"]');
    if (liveEl) {
      liveEl.textContent = msg;
      setTimeout(() => { if (liveEl) liveEl.textContent = ''; }, 1000);
    }
  }

  private renderError(error: string | null): void {
    const el = this.shadowRoot?.querySelector('.error');
    if (el) {
      el.textContent = error || '';
      (el as HTMLElement).style.display = error ? 'block' : 'none';
    }
    if (this._inputEl) {
      if (error) this._inputEl.setAttribute('aria-invalid', 'true');
      else this._inputEl.removeAttribute('aria-invalid');
    }
  }
}

defineElement('compa11y-date-picker', Compa11yDatePicker);
