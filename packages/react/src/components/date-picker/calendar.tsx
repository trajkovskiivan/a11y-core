/**
 * Standalone Calendar component.
 *
 * Can be used inside DatePicker (auto-wired via context) or independently.
 *
 * @example
 * ```tsx
 * // Standalone
 * <Calendar
 *   value={date}
 *   onValueChange={setDate}
 *   label="Event date"
 * />
 *
 * // Inside DatePicker (auto-wired)
 * <DatePicker label="Pick a date">
 *   <DatePicker.Trigger />
 *   <DatePicker.Calendar />
 * </DatePicker>
 * ```
 */

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useId } from '../../hooks/use-id';
import { useAnnouncer } from '../../hooks/use-announcer';
import { createComponentWarnings } from '@compa11y/core';

const warnings = createComponentWarnings('Calendar');

// ─── Date utilities (shared) ─────────────────────────────────────────────────

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function isToday(d: Date): boolean {
  return isSameDay(d, new Date());
}

export function isInRange(d: Date, start: Date | null, end: Date | null): boolean {
  if (!start || !end) return false;
  const t = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
  return t >= s && t <= e;
}

export function isBeforeDate(a: Date, b: Date): boolean {
  return new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime() <
    new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export function addMonths(d: Date, n: number): Date {
  const r = new Date(d);
  const origDay = r.getDate();
  r.setMonth(r.getMonth() + n);
  if (r.getDate() !== origDay) r.setDate(0);
  return r;
}

export function addYears(d: Date, n: number): Date {
  const r = new Date(d);
  const origDay = r.getDate();
  r.setFullYear(r.getFullYear() + n);
  if (r.getDate() !== origDay) r.setDate(0);
  return r;
}

export function startOfWeek(d: Date, firstDay: number): Date {
  const r = new Date(d);
  const diff = (r.getDay() - firstDay + 7) % 7;
  r.setDate(r.getDate() - diff);
  return r;
}

export function endOfWeek(d: Date, firstDay: number): Date {
  return addDays(startOfWeek(d, firstDay), 6);
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getCalendarDays(year: number, month: number, firstDay: number): Date[] {
  const firstOfMonth = new Date(year, month, 1);
  const start = startOfWeek(firstOfMonth, firstDay);
  const days: Date[] = [];
  for (let i = 0; i < 42; i++) days.push(addDays(start, i));
  return days;
}

export function getWeekdayNames(locale: string, firstDay: number): string[] {
  const names: string[] = [];
  const base = new Date(1970, 0, 4 + firstDay);
  for (let i = 0; i < 7; i++) {
    names.push(addDays(base, i).toLocaleDateString(locale, { weekday: 'short' }));
  }
  return names;
}

export function getMonthNames(locale: string): string[] {
  const names: string[] = [];
  for (let i = 0; i < 12; i++) {
    names.push(new Date(2000, i, 1).toLocaleDateString(locale, { month: 'long' }));
  }
  return names;
}

export function formatDayLabel(d: Date, locale: string): string {
  return d.toLocaleDateString(locale, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

// ─── Visually hidden ──────────────────────────────────────────────────────────

const srOnlyStyle: React.CSSProperties = {
  position: 'absolute',
  width: 1, height: 1, padding: 0, margin: -1,
  overflow: 'hidden', clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap', border: 0,
};

// ─── View type ────────────────────────────────────────────────────────────────

export type CalendarView = 'days' | 'months' | 'years';
export type CalendarMode = 'single' | 'range';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface CalendarProps {
  /** Selection mode */
  mode?: CalendarMode;

  /** Selected date (single mode, controlled) */
  value?: Date | null;
  /** Default selected date (single mode, uncontrolled) */
  defaultValue?: Date | null;
  /** Called when date is selected (single mode) */
  onValueChange?: (date: Date | null) => void;

  /** Range start (controlled) */
  startValue?: Date | null;
  /** Range end (controlled) */
  endValue?: Date | null;
  /** Default range start (uncontrolled) */
  defaultStartValue?: Date | null;
  /** Default range end (uncontrolled) */
  defaultEndValue?: Date | null;
  /** Called when range changes */
  onRangeChange?: (start: Date | null, end: Date | null) => void;

  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Function to disable specific dates */
  isDateDisabled?: (date: Date) => boolean;

  /** Accessible label (required) */
  label?: string;
  /** Accessible label via aria-label */
  'aria-label'?: string;

  /** Locale for formatting */
  locale?: string;
  /** First day of week (0=Sunday) */
  firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** Disabled state */
  disabled?: boolean;

  /** Remove default styles */
  unstyled?: boolean;
  /** CSS class */
  className?: string;
  /** CSS styles */
  style?: React.CSSProperties;
}

// ─── Calendar ─────────────────────────────────────────────────────────────────

export const Calendar = forwardRef<HTMLDivElement, CalendarProps>(
  function Calendar(
    {
      mode = 'single',
      value: controlledValue,
      defaultValue,
      onValueChange,
      startValue: controlledStart,
      endValue: controlledEnd,
      defaultStartValue,
      defaultEndValue,
      onRangeChange,
      minDate,
      maxDate,
      isDateDisabled: isDateDisabledProp,
      label,
      'aria-label': ariaLabel,
      locale = 'en-US',
      firstDayOfWeek = 0,
      disabled = false,
      unstyled = false,
      className,
      style,
    },
    ref,
  ) {
    const calendarId = useId('calendar');
    const liveId = useId('calendar-live');
    useAnnouncer();

    // Single value
    const [uncontrolledDate, setUncontrolledDate] = useState<Date | null>(defaultValue ?? null);
    const selectedDate = controlledValue !== undefined ? controlledValue : uncontrolledDate;
    const handleDateSelect = useCallback(
      (date: Date | null) => {
        if (controlledValue === undefined) setUncontrolledDate(date);
        onValueChange?.(date);
      },
      [controlledValue, onValueChange],
    );

    // Range values
    const [uncontrolledStart, setUncontrolledStart] = useState<Date | null>(defaultStartValue ?? null);
    const [uncontrolledEnd, setUncontrolledEnd] = useState<Date | null>(defaultEndValue ?? null);
    const rangeStart = controlledStart !== undefined ? controlledStart : uncontrolledStart;
    const rangeEnd = controlledEnd !== undefined ? controlledEnd : uncontrolledEnd;
    const handleRangeSelect = useCallback(
      (start: Date | null, end: Date | null) => {
        if (controlledStart === undefined) setUncontrolledStart(start);
        if (controlledEnd === undefined) setUncontrolledEnd(end);
        onRangeChange?.(start, end);
      },
      [controlledStart, controlledEnd, onRangeChange],
    );

    // Calendar state
    const initialDate = selectedDate ?? rangeStart ?? new Date();
    const [viewDate, setViewDate] = useState(new Date(initialDate));
    const [currentView, setCurrentView] = useState<CalendarView>('days');
    const [focusedDate, setFocusedDate] = useState(new Date(initialDate));

    // Live region
    const [liveMessage, setLiveMessage] = useState('');
    const liveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pushLive = useCallback((msg: string) => {
      if (liveTimerRef.current) clearTimeout(liveTimerRef.current);
      setLiveMessage(msg);
      liveTimerRef.current = setTimeout(() => setLiveMessage(''), 1000);
    }, []);

    // Disabled check
    const isDateDisabledFn = useCallback(
      (d: Date) => {
        if (disabled) return true;
        if (minDate && isBeforeDate(d, minDate)) return true;
        if (maxDate && isBeforeDate(maxDate, d)) return true;
        return isDateDisabledProp?.(d) ?? false;
      },
      [disabled, minDate, maxDate, isDateDisabledProp],
    );

    // Dev warnings
    useEffect(() => {
      if (process.env.NODE_ENV !== 'production') {
        if (!label && !ariaLabel) {
          warnings.warning(
            'Calendar requires an accessible label.',
            'Add a label or aria-label prop.',
          );
        }
      }
    }, [label, ariaLabel]);

    const resolvedLabel = ariaLabel ?? label ?? 'Calendar';

    const containerStyles: React.CSSProperties = unstyled
      ? {}
      : {
          background: 'var(--compa11y-calendar-bg, #fff)',
          border: 'var(--compa11y-calendar-border, 1px solid rgba(0,0,0,.15))',
          borderRadius: 'var(--compa11y-calendar-radius, 0.5rem)',
          padding: 'var(--compa11y-calendar-padding, 1rem)',
        };

    return (
      <div
        ref={ref}
        id={calendarId}
        role="group"
        aria-label={resolvedLabel}
        data-compa11y-calendar
        data-mode={mode}
        data-disabled={disabled || undefined}
        className={className}
        style={{ ...containerStyles, ...style }}
      >
        {/* Header */}
        <CalendarHeaderStandalone
          viewDate={viewDate}
          setViewDate={setViewDate}
          focusedDate={focusedDate}
          setFocusedDate={setFocusedDate}
          currentView={currentView}
          setCurrentView={setCurrentView}
          locale={locale}
          setLiveMessage={pushLive}
        />

        {/* Grid */}
        {currentView === 'days' && (
          <DayGridStandalone
            mode={mode}
            viewDate={viewDate}
            setViewDate={setViewDate}
            focusedDate={focusedDate}
            setFocusedDate={setFocusedDate}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            onRangeSelect={handleRangeSelect}
            locale={locale}
            firstDayOfWeek={firstDayOfWeek}
            isDateDisabled={isDateDisabledFn}
            setLiveMessage={pushLive}
          />
        )}
        {currentView === 'months' && (
          <MonthGridStandalone
            viewDate={viewDate}
            setViewDate={setViewDate}
            focusedDate={focusedDate}
            setFocusedDate={setFocusedDate}
            setCurrentView={setCurrentView}
            locale={locale}
            setLiveMessage={pushLive}
          />
        )}
        {currentView === 'years' && (
          <YearGridStandalone
            viewDate={viewDate}
            setViewDate={setViewDate}
            focusedDate={focusedDate}
            setFocusedDate={setFocusedDate}
            setCurrentView={setCurrentView}
            locale={locale}
            setLiveMessage={pushLive}
          />
        )}

        {/* Live region */}
        <div id={liveId} role="status" aria-live="polite" aria-atomic="true" style={srOnlyStyle}>
          {liveMessage}
        </div>
      </div>
    );
  },
);

// ─── Calendar Header (standalone) ────────────────────────────────────────────

interface CalendarHeaderStandaloneProps {
  viewDate: Date;
  setViewDate: (d: Date) => void;
  focusedDate: Date;
  setFocusedDate: (d: Date) => void;
  currentView: CalendarView;
  setCurrentView: (v: CalendarView) => void;
  locale: string;
  setLiveMessage: (msg: string) => void;
}

function CalendarHeaderStandalone({
  viewDate, setViewDate, focusedDate, setFocusedDate,
  currentView, setCurrentView, locale, setLiveMessage,
}: CalendarHeaderStandaloneProps) {
  const handlePrevMonth = () => {
    const next = addMonths(viewDate, -1);
    setViewDate(next);
    setFocusedDate(new Date(next.getFullYear(), next.getMonth(), Math.min(focusedDate.getDate(), getDaysInMonth(next.getFullYear(), next.getMonth()))));
    setLiveMessage(next.toLocaleDateString(locale, { month: 'long', year: 'numeric' }));
  };

  const handleNextMonth = () => {
    const next = addMonths(viewDate, 1);
    setViewDate(next);
    setFocusedDate(new Date(next.getFullYear(), next.getMonth(), Math.min(focusedDate.getDate(), getDaysInMonth(next.getFullYear(), next.getMonth()))));
    setLiveMessage(next.toLocaleDateString(locale, { month: 'long', year: 'numeric' }));
  };

  const monthLabel = viewDate.toLocaleDateString(locale, { month: 'long' });
  const yearLabel = viewDate.getFullYear().toString();

  return (
    <div
      data-compa11y-calendar-header
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.25rem', marginBottom: '0.5rem' }}
    >
      <button type="button" aria-label="Previous month" onClick={handlePrevMonth} style={{ minWidth: 44, minHeight: 44 }}>
        <span aria-hidden="true">&lsaquo;</span>
      </button>
      <div style={{ display: 'flex', gap: '0.25rem' }}>
        <button
          type="button"
          aria-label={`Choose month, current month: ${monthLabel}`}
          onClick={() => setCurrentView(currentView === 'months' ? 'days' : 'months')}
          aria-pressed={currentView === 'months'}
          data-compa11y-calendar-month-btn
        >
          {monthLabel}
        </button>
        <button
          type="button"
          aria-label={`Choose year, current year: ${yearLabel}`}
          onClick={() => setCurrentView(currentView === 'years' ? 'days' : 'years')}
          aria-pressed={currentView === 'years'}
          data-compa11y-calendar-year-btn
        >
          {yearLabel}
        </button>
      </div>
      <button type="button" aria-label="Next month" onClick={handleNextMonth} style={{ minWidth: 44, minHeight: 44 }}>
        <span aria-hidden="true">&rsaquo;</span>
      </button>
    </div>
  );
}

// ─── Day Grid (standalone) ───────────────────────────────────────────────────

interface DayGridStandaloneProps {
  mode: CalendarMode;
  viewDate: Date;
  setViewDate: (d: Date) => void;
  focusedDate: Date;
  setFocusedDate: (d: Date) => void;
  selectedDate: Date | null;
  onDateSelect: (d: Date | null) => void;
  rangeStart: Date | null;
  rangeEnd: Date | null;
  onRangeSelect: (s: Date | null, e: Date | null) => void;
  locale: string;
  firstDayOfWeek: number;
  isDateDisabled: (d: Date) => boolean;
  setLiveMessage: (msg: string) => void;
}

function DayGridStandalone({
  mode, viewDate, setViewDate, focusedDate, setFocusedDate,
  selectedDate, onDateSelect, rangeStart, rangeEnd, onRangeSelect,
  locale, firstDayOfWeek, isDateDisabled, setLiveMessage,
}: DayGridStandaloneProps) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const days = useMemo(() => getCalendarDays(year, month, firstDayOfWeek), [year, month, firstDayOfWeek]);
  const weekdayNames = useMemo(() => getWeekdayNames(locale, firstDayOfWeek), [locale, firstDayOfWeek]);
  const dayRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const focusedIndex = useMemo(() => {
    const idx = days.findIndex((d) => isSameDay(d, focusedDate));
    return idx >= 0 ? idx : days.findIndex((d) => isToday(d));
  }, [days, focusedDate]);

  useEffect(() => {
    if (focusedIndex >= 0) dayRefs.current[focusedIndex]?.focus();
  }, [focusedIndex]);

  const navigateDate = useCallback(
    (newDate: Date) => {
      if (!isSameMonth(newDate, viewDate)) {
        setViewDate(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
      }
      setFocusedDate(newDate);
    },
    [viewDate, setViewDate, setFocusedDate],
  );

  const selectDay = useCallback(
    (dayDate: Date) => {
      if (isDateDisabled(dayDate)) return;
      if (mode === 'single') {
        onDateSelect(dayDate);
        setLiveMessage(`Date selected: ${formatDayLabel(dayDate, locale)}`);
      } else {
        if (!rangeStart || (rangeStart && rangeEnd)) {
          onRangeSelect(dayDate, null);
          setLiveMessage(`Range start: ${formatDayLabel(dayDate, locale)}`);
        } else if (isBeforeDate(dayDate, rangeStart)) {
          onRangeSelect(dayDate, null);
          setLiveMessage(`Range start: ${formatDayLabel(dayDate, locale)}`);
        } else {
          onRangeSelect(rangeStart, dayDate);
          setLiveMessage(`Range end: ${formatDayLabel(dayDate, locale)}`);
        }
      }
    },
    [mode, isDateDisabled, onDateSelect, rangeStart, rangeEnd, onRangeSelect, setLiveMessage, locale],
  );

  const handleDayKeyDown = useCallback(
    (e: React.KeyboardEvent, dayDate: Date) => {
      let next: Date | null = null;
      switch (e.key) {
        case 'ArrowLeft': next = addDays(dayDate, -1); break;
        case 'ArrowRight': next = addDays(dayDate, 1); break;
        case 'ArrowUp': next = addDays(dayDate, -7); break;
        case 'ArrowDown': next = addDays(dayDate, 7); break;
        case 'Home': next = startOfWeek(dayDate, firstDayOfWeek); break;
        case 'End': next = endOfWeek(dayDate, firstDayOfWeek); break;
        case 'PageUp': next = e.shiftKey ? addYears(dayDate, -1) : addMonths(dayDate, -1); break;
        case 'PageDown': next = e.shiftKey ? addYears(dayDate, 1) : addMonths(dayDate, 1); break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          selectDay(dayDate);
          return;
        default:
          return;
      }
      if (next) {
        e.preventDefault();
        if (isDateDisabled(next)) {
          const step = ['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key) ? -1 : 1;
          let attempt = next;
          for (let i = 0; i < 365; i++) {
            if (!isDateDisabled(attempt)) break;
            attempt = addDays(attempt, step);
          }
          next = attempt;
        }
        navigateDate(next);
      }
    },
    [firstDayOfWeek, isDateDisabled, navigateDate, selectDay],
  );

  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  return (
    <table
      role="grid"
      aria-label={viewDate.toLocaleDateString(locale, { month: 'long', year: 'numeric' })}
      data-compa11y-calendar-grid
      style={{ borderCollapse: 'collapse', width: '100%' }}
    >
      <thead>
        <tr>
          {weekdayNames.map((name, i) => (
            <th key={i} scope="col" abbr={name} style={{ padding: '0.25rem', textAlign: 'center', fontWeight: 'normal', fontSize: '0.875rem' }}>
              {name}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {weeks.map((week, wi) => (
          <tr key={wi}>
            {week.map((dayDate, di) => {
              const flatIndex = wi * 7 + di;
              const isCurrentMonth = dayDate.getMonth() === month;
              const isSelected = mode === 'single' ? selectedDate && isSameDay(dayDate, selectedDate) : false;
              const isRangeStart = mode === 'range' && rangeStart && isSameDay(dayDate, rangeStart);
              const isRangeEnd = mode === 'range' && rangeEnd && isSameDay(dayDate, rangeEnd);
              const inRange = mode === 'range' && isInRange(dayDate, rangeStart, rangeEnd);
              const isTodayDate = isToday(dayDate);
              const isDisabled = isDateDisabled(dayDate);
              const isFocused = flatIndex === focusedIndex;

              const dayLabel = formatDayLabel(dayDate, locale);
              const stateLabels: string[] = [dayLabel];
              if (isTodayDate) stateLabels.push('today');
              if (isSelected) stateLabels.push('selected');
              if (isRangeStart) stateLabels.push('start date');
              if (isRangeEnd) stateLabels.push('end date');
              if (inRange && !isRangeStart && !isRangeEnd) stateLabels.push('in selected range');
              if (isDisabled) stateLabels.push('not available');

              return (
                <td key={di} role="gridcell" style={{ padding: 0 }}>
                  <button
                    ref={(el) => { dayRefs.current[flatIndex] = el; }}
                    type="button"
                    tabIndex={isFocused ? 0 : -1}
                    disabled={isDisabled}
                    aria-label={stateLabels.join(', ')}
                    aria-current={isTodayDate ? 'date' : undefined}
                    aria-pressed={isSelected || undefined}
                    aria-selected={isRangeStart || isRangeEnd || undefined}
                    onClick={() => selectDay(dayDate)}
                    onKeyDown={(e) => handleDayKeyDown(e, dayDate)}
                    data-compa11y-calendar-day
                    data-today={isTodayDate || undefined}
                    data-selected={isSelected || undefined}
                    data-range-start={isRangeStart || undefined}
                    data-range-end={isRangeEnd || undefined}
                    data-in-range={inRange || undefined}
                    data-outside-month={!isCurrentMonth || undefined}
                    data-disabled={isDisabled || undefined}
                    style={{
                      width: '100%', minWidth: 44, minHeight: 44,
                      border: 'none', background: 'none',
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      opacity: !isCurrentMonth ? 0.4 : isDisabled ? 0.3 : 1,
                      fontWeight: isTodayDate ? 'bold' : 'normal',
                      padding: '0.25rem', borderRadius: '0.25rem',
                    }}
                  >
                    {dayDate.getDate()}
                  </button>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─── Month Grid (standalone) ─────────────────────────────────────────────────

interface MonthGridStandaloneProps {
  viewDate: Date;
  setViewDate: (d: Date) => void;
  focusedDate: Date;
  setFocusedDate: (d: Date) => void;
  setCurrentView: (v: CalendarView) => void;
  locale: string;
  setLiveMessage: (msg: string) => void;
}

function MonthGridStandalone({
  viewDate, setViewDate, focusedDate, setFocusedDate,
  setCurrentView, locale, setLiveMessage,
}: MonthGridStandaloneProps) {
  const monthNames = useMemo(() => getMonthNames(locale), [locale]);
  const [focusedMonth, setFocusedMonth] = useState(viewDate.getMonth());
  const monthRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => { monthRefs.current[focusedMonth]?.focus(); }, [focusedMonth]);

  const selectMonth = (mi: number) => {
    const next = new Date(viewDate);
    next.setMonth(mi);
    setViewDate(next);
    setFocusedDate(new Date(next.getFullYear(), mi, Math.min(focusedDate.getDate(), getDaysInMonth(next.getFullYear(), mi))));
    setCurrentView('days');
    setLiveMessage(`${monthNames[mi]} ${next.getFullYear()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let next = index;
    switch (e.key) {
      case 'ArrowLeft': next = Math.max(0, index - 1); break;
      case 'ArrowRight': next = Math.min(11, index + 1); break;
      case 'ArrowUp': next = Math.max(0, index - 3); break;
      case 'ArrowDown': next = Math.min(11, index + 3); break;
      case 'Home': next = 0; break;
      case 'End': next = 11; break;
      case 'Enter': case ' ': e.preventDefault(); selectMonth(index); return;
      case 'Escape': e.preventDefault(); setCurrentView('days'); return;
      default: return;
    }
    e.preventDefault();
    setFocusedMonth(next);
  };

  const rows = [monthNames.slice(0, 3), monthNames.slice(3, 6), monthNames.slice(6, 9), monthNames.slice(9, 12)];

  return (
    <div role="grid" aria-label="Choose month" data-compa11y-calendar-month-grid>
      {rows.map((row, ri) => (
        <div key={ri} role="row" style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.25rem' }}>
          {row.map((name, ci) => {
            const idx = ri * 3 + ci;
            const isCurrent = idx === viewDate.getMonth();
            return (
              <button
                key={idx}
                ref={(el) => { monthRefs.current[idx] = el; }}
                type="button" role="gridcell"
                tabIndex={idx === focusedMonth ? 0 : -1}
                aria-pressed={isCurrent}
                aria-label={`${name} ${viewDate.getFullYear()}`}
                onClick={() => selectMonth(idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                data-compa11y-calendar-month-cell
                data-selected={isCurrent || undefined}
                style={{ flex: 1, minHeight: 44, border: 'none', background: 'none', cursor: 'pointer', fontWeight: isCurrent ? 'bold' : 'normal', borderRadius: '0.25rem', padding: '0.5rem' }}
              >
                {name.substring(0, 3)}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ─── Year Grid (standalone) ──────────────────────────────────────────────────

interface YearGridStandaloneProps {
  viewDate: Date;
  setViewDate: (d: Date) => void;
  focusedDate: Date;
  setFocusedDate: (d: Date) => void;
  setCurrentView: (v: CalendarView) => void;
  locale: string;
  setLiveMessage: (msg: string) => void;
}

function YearGridStandalone({
  viewDate, setViewDate, focusedDate, setFocusedDate,
  setCurrentView, locale: _locale, setLiveMessage,
}: YearGridStandaloneProps) {
  const currentYear = viewDate.getFullYear();
  const startYear = currentYear - (currentYear % 12);
  const years = useMemo(() => {
    const arr: number[] = [];
    for (let i = 0; i < 12; i++) arr.push(startYear + i);
    return arr;
  }, [startYear]);

  const [focusedYear, setFocusedYear] = useState(currentYear);
  const yearRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const idx = years.indexOf(focusedYear);
    if (idx >= 0) yearRefs.current[idx]?.focus();
  }, [focusedYear, years]);

  const selectYear = (year: number) => {
    const next = new Date(viewDate);
    next.setFullYear(year);
    setViewDate(next);
    setFocusedDate(new Date(year, focusedDate.getMonth(), Math.min(focusedDate.getDate(), getDaysInMonth(year, focusedDate.getMonth()))));
    setCurrentView('months');
    setLiveMessage(`Year ${year}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent, yearVal: number) => {
    let next = yearVal;
    switch (e.key) {
      case 'ArrowLeft': next = yearVal - 1; break;
      case 'ArrowRight': next = yearVal + 1; break;
      case 'ArrowUp': next = yearVal - 3; break;
      case 'ArrowDown': next = yearVal + 3; break;
      case 'Home': next = startYear; break;
      case 'End': next = startYear + 11; break;
      case 'PageUp': e.preventDefault(); { const nv = new Date(viewDate); nv.setFullYear(startYear - 12); setViewDate(nv); } return;
      case 'PageDown': e.preventDefault(); { const nv = new Date(viewDate); nv.setFullYear(startYear + 12); setViewDate(nv); } return;
      case 'Enter': case ' ': e.preventDefault(); selectYear(yearVal); return;
      case 'Escape': e.preventDefault(); setCurrentView('days'); return;
      default: return;
    }
    e.preventDefault();
    if (next < startYear || next > startYear + 11) {
      const nv = new Date(viewDate);
      nv.setFullYear(next < startYear ? startYear - 12 : startYear + 12);
      setViewDate(nv);
    }
    setFocusedYear(next);
  };

  const rows: number[][] = [];
  for (let i = 0; i < years.length; i += 3) rows.push(years.slice(i, i + 3));

  return (
    <div data-compa11y-calendar-year-grid>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <button type="button" aria-label="Previous 12 years" onClick={() => { const nv = new Date(viewDate); nv.setFullYear(startYear - 12); setViewDate(nv); setFocusedYear(startYear - 12); }} style={{ minWidth: 44, minHeight: 44 }}>
          <span aria-hidden="true">&lsaquo;</span>
        </button>
        <span aria-live="polite">{startYear} – {startYear + 11}</span>
        <button type="button" aria-label="Next 12 years" onClick={() => { const nv = new Date(viewDate); nv.setFullYear(startYear + 12); setViewDate(nv); setFocusedYear(startYear + 12); }} style={{ minWidth: 44, minHeight: 44 }}>
          <span aria-hidden="true">&rsaquo;</span>
        </button>
      </div>
      <div role="grid" aria-label="Choose year">
        {rows.map((row, ri) => (
          <div key={ri} role="row" style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.25rem' }}>
            {row.map((yearVal) => {
              const isCurrent = yearVal === currentYear;
              const idx = years.indexOf(yearVal);
              return (
                <button
                  key={yearVal}
                  ref={(el) => { yearRefs.current[idx] = el; }}
                  type="button" role="gridcell"
                  tabIndex={yearVal === focusedYear ? 0 : -1}
                  aria-pressed={isCurrent}
                  aria-label={String(yearVal)}
                  onClick={() => selectYear(yearVal)}
                  onKeyDown={(e) => handleKeyDown(e, yearVal)}
                  data-compa11y-calendar-year-cell
                  data-selected={isCurrent || undefined}
                  style={{ flex: 1, minHeight: 44, border: 'none', background: 'none', cursor: 'pointer', fontWeight: isCurrent ? 'bold' : 'normal', borderRadius: '0.25rem', padding: '0.5rem' }}
                >
                  {yearVal}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
