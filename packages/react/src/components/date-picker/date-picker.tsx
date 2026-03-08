/**
 * Accessible DatePicker React compound component.
 *
 * Supports:
 * - Single date + range selection
 * - Date-only and datetime (with time panel)
 * - 12-hour (AM/PM) and 24-hour time
 * - Popover (non-modal) and modal overlay
 * - Full keyboard navigation (arrow keys, page up/down, home/end)
 * - Roving tabindex in the calendar grid
 * - Screen reader announcements for all state changes
 * - Controlled + uncontrolled patterns
 *
 * @example
 * ```tsx
 * // Single date
 * <DatePicker label="Appointment date">
 *   <DatePicker.Input />
 *   <DatePicker.Trigger />
 *   <DatePicker.Calendar />
 * </DatePicker>
 *
 * // Range with time
 * <DatePicker mode="range" precision="datetime" label="Trip dates">
 *   <DatePicker.RangeInputs />
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
import { createPortal } from 'react-dom';
import { useId } from '../../hooks/use-id';
import { useAnnouncer } from '../../hooks/use-announcer';
import { useFocusTrap } from '../../hooks/use-focus-trap';
import {
  DatePickerProvider,
  useDatePickerContext,
  type DatePickerMode,
  type DatePickerPrecision,
  type DatePickerOverlay,
  type DatePickerView,
  type DatePickerContextValue,
} from './date-picker-context';
import { createComponentWarnings } from '@compa11y/core';

const warnings = createComponentWarnings('DatePicker');

// ─── Date utilities ───────────────────────────────────────────────────────────

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function isToday(d: Date): boolean {
  return isSameDay(d, new Date());
}

function isInRange(d: Date, start: Date | null, end: Date | null): boolean {
  if (!start || !end) return false;
  const t = d.getTime();
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
  return t >= s && t <= e;
}

function isBeforeDate(a: Date, b: Date): boolean {
  return new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime() <
    new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function addMonths(d: Date, n: number): Date {
  const r = new Date(d);
  r.setMonth(r.getMonth() + n);
  // Clamp day if overflow (e.g. Jan 31 + 1 month = Feb 28)
  if (r.getDate() !== d.getDate()) {
    r.setDate(0); // go to last day of previous month
  }
  return r;
}

function addYears(d: Date, n: number): Date {
  const r = new Date(d);
  r.setFullYear(r.getFullYear() + n);
  if (r.getDate() !== d.getDate()) {
    r.setDate(0);
  }
  return r;
}

function startOfWeek(d: Date, firstDay: number): Date {
  const r = new Date(d);
  const day = r.getDay();
  const diff = (day - firstDay + 7) % 7;
  r.setDate(r.getDate() - diff);
  return r;
}

function endOfWeek(d: Date, firstDay: number): Date {
  const s = startOfWeek(d, firstDay);
  return addDays(s, 6);
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getCalendarDays(year: number, month: number, firstDay: number): Date[] {
  const firstOfMonth = new Date(year, month, 1);
  const start = startOfWeek(firstOfMonth, firstDay);
  const days: Date[] = [];
  // Always show 6 weeks (42 days) for consistent grid
  for (let i = 0; i < 42; i++) {
    days.push(addDays(start, i));
  }
  return days;
}

function getWeekdayNames(locale: string, firstDay: number): string[] {
  const names: string[] = [];
  // Start from a known Sunday (Jan 4, 1970 is a Sunday)
  const base = new Date(1970, 0, 4 + firstDay);
  for (let i = 0; i < 7; i++) {
    const d = addDays(base, i);
    names.push(d.toLocaleDateString(locale, { weekday: 'short' }));
  }
  return names;
}

function getMonthNames(locale: string): string[] {
  const names: string[] = [];
  for (let i = 0; i < 12; i++) {
    names.push(new Date(2000, i, 1).toLocaleDateString(locale, { month: 'long' }));
  }
  return names;
}

function formatDateDefault(d: Date, locale: string): string {
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function formatDateTimeFull(d: Date, locale: string, hourCycle: 12 | 24): string {
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }) + ' ' + d.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: hourCycle === 12,
  });
}

function formatDayLabel(d: Date, locale: string): string {
  return d.toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function parseDateString(text: string, _locale: string): Date | null {
  if (!text.trim()) return null;
  const d = new Date(text);
  if (!isNaN(d.getTime())) return d;
  // Try common formats
  const parts = text.split(/[/\-.\s]+/);
  if (parts.length >= 3) {
    const nums = parts.map(Number);
    const n0 = nums[0]!;
    const n1 = nums[1]!;
    const n2 = nums[2]!;
    // Try MM/DD/YYYY and DD/MM/YYYY
    if (n2 > 31) {
      const d1 = new Date(n2, n0 - 1, n1);
      if (!isNaN(d1.getTime())) return d1;
      const d2 = new Date(n2, n1 - 1, n0);
      if (!isNaN(d2.getTime())) return d2;
    }
    // YYYY/MM/DD
    if (n0 > 31) {
      const d3 = new Date(n0, n1 - 1, n2);
      if (!isNaN(d3.getTime())) return d3;
    }
  }
  return null;
}

// ─── Visually hidden style ────────────────────────────────────────────────────

const srOnlyStyle: React.CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

// ─── Body scroll lock (shared with Dialog) ────────────────────────────────────

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

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DatePickerProps {
  /** Selection mode */
  mode?: DatePickerMode;
  /** Date-only or datetime */
  precision?: DatePickerPrecision;
  /** 12-hour or 24-hour clock */
  hourCycle?: 12 | 24;
  /** Popover or modal overlay */
  overlay?: DatePickerOverlay;

  /** Controlled single value */
  value?: Date | null;
  /** Uncontrolled single default */
  defaultValue?: Date | null;
  /** Called when single value changes */
  onValueChange?: (date: Date | null) => void;

  /** Controlled range start */
  startValue?: Date | null;
  /** Controlled range end */
  endValue?: Date | null;
  /** Uncontrolled range defaults */
  defaultStartValue?: Date | null;
  defaultEndValue?: Date | null;
  /** Called when range changes */
  onRangeChange?: (start: Date | null, end: Date | null) => void;

  /** Controlled open state */
  open?: boolean;
  /** Uncontrolled default open */
  defaultOpen?: boolean;
  /** Called when open state changes */
  onOpenChange?: (open: boolean) => void;

  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Function to disable specific dates */
  isDateDisabled?: (date: Date) => boolean;

  /** Visible label text */
  label?: string;
  /** Accessible label if no visible label */
  'aria-label'?: string;
  /** Hint text (e.g. "MM/DD/YYYY") */
  hint?: string;
  /** Error message */
  error?: string;

  /** Locale for formatting */
  locale?: string;
  /** First day of week (0=Sunday) */
  firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6;

  /** Disabled state */
  disabled?: boolean;
  /** Required field */
  required?: boolean;

  /** Custom date formatter */
  formatDate?: (date: Date) => string;
  /** Custom date parser */
  parseDate?: (text: string) => Date | null;

  /** Remove default styles */
  unstyled?: boolean;
  /** Custom class name */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;

  children: React.ReactNode;
}

// ─── Root Component ───────────────────────────────────────────────────────────

function DatePickerRoot({
  mode = 'single',
  precision = 'date',
  hourCycle = 12,
  overlay = 'popover',
  value: controlledValue,
  defaultValue,
  onValueChange,
  startValue: controlledStart,
  endValue: controlledEnd,
  defaultStartValue,
  defaultEndValue,
  onRangeChange,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  minDate,
  maxDate,
  isDateDisabled: isDateDisabledProp,
  label,
  'aria-label': ariaLabel,
  hint,
  error,
  locale = 'en-US',
  firstDayOfWeek = 0,
  disabled = false,
  required = false,
  formatDate: formatDateProp,
  parseDate: parseDateProp,
  unstyled: _unstyled = false,
  className = '',
  style,
  children,
}: DatePickerProps) {
  // IDs
  const inputId = useId('dp-input');
  const startInputId = useId('dp-start');
  const endInputId = useId('dp-end');
  const calendarId = useId('dp-calendar');
  const triggerId = useId('dp-trigger');
  const titleId = useId('dp-title');
  const hintId = useId('dp-hint');
  const errorId = useId('dp-error');
  const liveRegionId = useId('dp-live');

  const triggerRef = useRef<HTMLButtonElement>(null);

  // Announcer
  useAnnouncer();

  // Live region
  const [liveMessage, setLiveMessage] = useState('');
  const liveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pushLiveMessage = useCallback((msg: string) => {
    if (liveTimerRef.current) clearTimeout(liveTimerRef.current);
    setLiveMessage(msg);
    liveTimerRef.current = setTimeout(() => setLiveMessage(''), 1000);
  }, []);

  // Open state — controlled + uncontrolled
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isOpen = controlledOpen ?? uncontrolledOpen;
  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (controlledOpen === undefined) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [controlledOpen, onOpenChange],
  );

  // Single value — controlled + uncontrolled
  const [uncontrolledDate, setUncontrolledDate] = useState<Date | null>(
    defaultValue ?? null,
  );
  const selectedDate = controlledValue !== undefined ? controlledValue : uncontrolledDate;
  const handleDateSelect = useCallback(
    (date: Date | null) => {
      if (controlledValue === undefined) setUncontrolledDate(date);
      onValueChange?.(date);
    },
    [controlledValue, onValueChange],
  );

  // Range values — controlled + uncontrolled
  const [uncontrolledStart, setUncontrolledStart] = useState<Date | null>(
    defaultStartValue ?? null,
  );
  const [uncontrolledEnd, setUncontrolledEnd] = useState<Date | null>(
    defaultEndValue ?? null,
  );
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

  // Calendar navigation state
  const initialViewDate = selectedDate ?? rangeStart ?? new Date();
  const [viewDate, setViewDate] = useState(new Date(initialViewDate));
  const [currentView, setCurrentView] = useState<DatePickerView>('days');
  const [focusedDate, setFocusedDate] = useState(new Date(initialViewDate));

  // Time state — start/single
  const [hours, setHours] = useState(() => {
    const d = selectedDate ?? rangeStart;
    return d ? d.getHours() : new Date().getHours();
  });
  const [minutes, setMinutes] = useState(() => {
    const d = selectedDate ?? rangeStart;
    return d ? d.getMinutes() : 0;
  });
  const [period, setPeriod] = useState<'AM' | 'PM'>(() =>
    hours >= 12 ? 'PM' : 'AM',
  );

  // Time state — end (range)
  const [endHours, setEndHours] = useState(() => {
    return rangeEnd ? rangeEnd.getHours() : 23;
  });
  const [endMinutes, setEndMinutes] = useState(() => {
    return rangeEnd ? rangeEnd.getMinutes() : 59;
  });
  const [endPeriod, setEndPeriod] = useState<'AM' | 'PM'>(() =>
    endHours >= 12 ? 'PM' : 'AM',
  );

  // Date disabled check
  const isDateDisabled = useCallback(
    (d: Date) => {
      if (disabled) return true;
      if (minDate && isBeforeDate(d, minDate)) return true;
      if (maxDate && isBeforeDate(maxDate, d)) return true;
      return isDateDisabledProp?.(d) ?? false;
    },
    [disabled, minDate, maxDate, isDateDisabledProp],
  );

  // Formatting
  const formatDateFn = useCallback(
    (d: Date) => {
      if (formatDateProp) return formatDateProp(d);
      if (precision === 'datetime') return formatDateTimeFull(d, locale, hourCycle);
      return formatDateDefault(d, locale);
    },
    [formatDateProp, precision, locale, hourCycle],
  );

  const parseDateFn = useCallback(
    (text: string) => {
      if (parseDateProp) return parseDateProp(text);
      return parseDateString(text, locale);
    },
    [parseDateProp, locale],
  );

  // Dev warnings
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      if (!label && !ariaLabel) {
        warnings.warning(
          'DatePicker requires an accessible label.',
          'Add a label prop or aria-label="..."',
        );
      }
      if (minDate && maxDate && isBeforeDate(maxDate, minDate)) {
        warnings.error(
          `DatePicker minDate must be before maxDate.`,
        );
      }
    }
  }, [label, ariaLabel, minDate, maxDate]);

  // Reset view when opening
  useEffect(() => {
    if (isOpen) {
      const target = selectedDate ?? rangeStart ?? new Date();
      setViewDate(new Date(target));
      setFocusedDate(new Date(target));
      setCurrentView('days');
    }
  }, [isOpen]); // intentionally only on isOpen change

  const contextValue: DatePickerContextValue = useMemo(
    () => ({
      mode,
      precision,
      overlay,
      hourCycle,
      inputId,
      startInputId,
      endInputId,
      calendarId,
      triggerId,
      titleId,
      hintId,
      errorId,
      liveRegionId,
      isOpen,
      onOpenChange: handleOpenChange,
      selectedDate,
      onDateSelect: handleDateSelect,
      rangeStart,
      rangeEnd,
      onRangeSelect: handleRangeSelect,
      viewDate,
      setViewDate,
      currentView,
      setCurrentView,
      focusedDate,
      setFocusedDate,
      hours,
      minutes,
      period,
      setHours,
      setMinutes,
      setPeriod,
      endHours,
      endMinutes,
      endPeriod,
      setEndHours,
      setEndMinutes,
      setEndPeriod,
      minDate,
      maxDate,
      isDateDisabled,
      locale,
      firstDayOfWeek,
      disabled,
      required,
      label,
      error,
      formatDate: formatDateFn,
      parseDate: parseDateFn,
      triggerRef,
      setLiveMessage: pushLiveMessage,
    }),
    [
      mode, precision, overlay, hourCycle,
      inputId, startInputId, endInputId, calendarId, triggerId, titleId, hintId, errorId, liveRegionId,
      isOpen, handleOpenChange,
      selectedDate, handleDateSelect,
      rangeStart, rangeEnd, handleRangeSelect,
      viewDate, currentView, focusedDate,
      hours, minutes, period,
      endHours, endMinutes, endPeriod,
      minDate, maxDate, isDateDisabled,
      locale, firstDayOfWeek, disabled, required, label, error,
      formatDateFn, parseDateFn, pushLiveMessage,
    ],
  );

  return (
    <DatePickerProvider value={contextValue}>
      <div
        data-compa11y-date-picker
        data-mode={mode}
        data-precision={precision}
        data-disabled={disabled || undefined}
        data-open={isOpen || undefined}
        className={className}
        style={{ position: 'relative', display: 'inline-block', ...style }}
      >
        {label && (
          <label
            htmlFor={mode === 'single' ? inputId : startInputId}
            data-compa11y-date-picker-label
          >
            {label}
          </label>
        )}
        {children}
        {hint && (
          <div id={hintId} data-compa11y-date-picker-hint>
            {hint}
          </div>
        )}
        {error && (
          <div id={errorId} role="alert" data-compa11y-date-picker-error>
            {error}
          </div>
        )}
        {/* Pre-mounted live region */}
        <div
          id={liveRegionId}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          style={srOnlyStyle}
        >
          {liveMessage}
        </div>
      </div>
    </DatePickerProvider>
  );
}

// ─── Input (single mode) ─────────────────────────────────────────────────────

export interface DatePickerInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  /** Placeholder text */
  placeholder?: string;
}

export const DatePickerInput = forwardRef<HTMLInputElement, DatePickerInputProps>(
  function DatePickerInput({ placeholder, onBlur, onKeyDown, ...props }, ref) {
    const ctx = useDatePickerContext('DatePicker.Input');
    const [inputText, setInputText] = useState('');

    // Sync input text from selected date
    useEffect(() => {
      if (ctx.selectedDate) {
        setInputText(ctx.formatDate(ctx.selectedDate));
      } else {
        setInputText('');
      }
    }, [ctx.selectedDate, ctx.formatDate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputText(e.target.value);
    };

    const commitInput = () => {
      if (!inputText.trim()) {
        ctx.onDateSelect(null);
        return;
      }
      const parsed = ctx.parseDate(inputText);
      if (parsed && !ctx.isDateDisabled(parsed)) {
        ctx.onDateSelect(parsed);
        ctx.setLiveMessage(`Date selected: ${ctx.formatDate(parsed)}`);
      } else if (parsed && ctx.isDateDisabled(parsed)) {
        ctx.setLiveMessage('Selected date is not available');
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      commitInput();
      onBlur?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        commitInput();
      }
      onKeyDown?.(e);
    };

    const describedBy = [
      ctx.hintId,
      ctx.error ? ctx.errorId : undefined,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

    return (
      <input
        ref={ref}
        id={ctx.inputId}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={inputText}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={ctx.disabled}
        required={ctx.required}
        aria-invalid={ctx.error ? true : undefined}
        aria-describedby={describedBy}
        data-compa11y-date-picker-input
        {...props}
      />
    );
  },
);

// ─── RangeInputs (range mode) ────────────────────────────────────────────────

export interface DatePickerRangeInputsProps {
  /** Placeholder for start input */
  startPlaceholder?: string;
  /** Placeholder for end input */
  endPlaceholder?: string;
  /** Label for start input */
  startLabel?: string;
  /** Label for end input */
  endLabel?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const DatePickerRangeInputs = forwardRef<HTMLDivElement, DatePickerRangeInputsProps>(
  function DatePickerRangeInputs(
    {
      startPlaceholder = 'Start date',
      endPlaceholder = 'End date',
      startLabel = 'Start date',
      endLabel = 'End date',
      className,
      style,
    },
    ref,
  ) {
    const ctx = useDatePickerContext('DatePicker.RangeInputs');
    const [startText, setStartText] = useState('');
    const [endText, setEndText] = useState('');

    useEffect(() => {
      setStartText(ctx.rangeStart ? ctx.formatDate(ctx.rangeStart) : '');
    }, [ctx.rangeStart, ctx.formatDate]);

    useEffect(() => {
      setEndText(ctx.rangeEnd ? ctx.formatDate(ctx.rangeEnd) : '');
    }, [ctx.rangeEnd, ctx.formatDate]);

    const commitStart = () => {
      if (!startText.trim()) {
        ctx.onRangeSelect(null, ctx.rangeEnd);
        return;
      }
      const parsed = ctx.parseDate(startText);
      if (parsed && !ctx.isDateDisabled(parsed)) {
        ctx.onRangeSelect(parsed, ctx.rangeEnd);
      }
    };

    const commitEnd = () => {
      if (!endText.trim()) {
        ctx.onRangeSelect(ctx.rangeStart, null);
        return;
      }
      const parsed = ctx.parseDate(endText);
      if (parsed && !ctx.isDateDisabled(parsed)) {
        ctx.onRangeSelect(ctx.rangeStart, parsed);
      }
    };

    const describedBy = [
      ctx.hintId,
      ctx.error ? ctx.errorId : undefined,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

    return (
      <div
        ref={ref}
        data-compa11y-date-picker-range-inputs
        className={className}
        style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center', ...style }}
      >
        <div>
          <label htmlFor={ctx.startInputId} style={srOnlyStyle}>
            {startLabel}
          </label>
          <input
            id={ctx.startInputId}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={startText}
            onChange={(e) => setStartText(e.target.value)}
            onBlur={commitStart}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), commitStart())}
            placeholder={startPlaceholder}
            disabled={ctx.disabled}
            required={ctx.required}
            aria-invalid={ctx.error ? true : undefined}
            aria-describedby={describedBy}
            data-compa11y-date-picker-input
            data-compa11y-date-picker-input-start
          />
        </div>
        <span aria-hidden="true">–</span>
        <div>
          <label htmlFor={ctx.endInputId} style={srOnlyStyle}>
            {endLabel}
          </label>
          <input
            id={ctx.endInputId}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={endText}
            onChange={(e) => setEndText(e.target.value)}
            onBlur={commitEnd}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), commitEnd())}
            placeholder={endPlaceholder}
            disabled={ctx.disabled}
            required={ctx.required}
            aria-invalid={ctx.error ? true : undefined}
            aria-describedby={describedBy}
            data-compa11y-date-picker-input
            data-compa11y-date-picker-input-end
          />
        </div>
      </div>
    );
  },
);

// ─── Trigger ──────────────────────────────────────────────────────────────────

export interface DatePickerTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

export const DatePickerTrigger = forwardRef<HTMLButtonElement, DatePickerTriggerProps>(
  function DatePickerTrigger({ children, onClick, ...props }, ref) {
    const ctx = useDatePickerContext('DatePicker.Trigger');

    const mergedRef = useCallback(
      (el: HTMLButtonElement | null) => {
        (ctx.triggerRef as React.MutableRefObject<HTMLButtonElement | null>).current = el;
        if (typeof ref === 'function') ref(el);
        else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = el;
      },
      [ref, ctx.triggerRef],
    );

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      if (!e.defaultPrevented && !ctx.disabled) {
        ctx.onOpenChange(!ctx.isOpen);
      }
    };

    return (
      <button
        ref={mergedRef}
        id={ctx.triggerId}
        type="button"
        tabIndex={0}
        aria-label={children ? undefined : 'Open calendar'}
        aria-haspopup="dialog"
        aria-expanded={ctx.isOpen}
        aria-controls={ctx.isOpen ? ctx.calendarId : undefined}
        disabled={ctx.disabled}
        onClick={handleClick}
        data-compa11y-date-picker-trigger
        data-open={ctx.isOpen || undefined}
        {...props}
      >
        {children ?? (
          <span aria-hidden="true">
            {/* Calendar icon SVG */}
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="4" width="16" height="14" rx="2" />
              <line x1="2" y1="8" x2="18" y2="8" />
              <line x1="6" y1="2" x2="6" y2="6" />
              <line x1="14" y1="2" x2="14" y2="6" />
            </svg>
          </span>
        )}
      </button>
    );
  },
);

// ─── Calendar (overlay) ──────────────────────────────────────────────────────

export interface DatePickerCalendarProps {
  /** Portal container */
  container?: HTMLElement;
  /** Remove default styles */
  unstyled?: boolean;
  /** Additional class */
  className?: string;
  /** Additional styles */
  style?: React.CSSProperties;
}

export const DatePickerCalendar = forwardRef<HTMLDivElement, DatePickerCalendarProps>(
  function DatePickerCalendar({ container, unstyled = false, className, style }, ref) {
    const ctx = useDatePickerContext('DatePicker.Calendar');

    if (!ctx.isOpen) return null;

    const content = (
      <CalendarOverlay
        ref={ref}
        unstyled={unstyled}
        className={className}
        style={style}
      />
    );

    const portalTarget = container ?? document.body;
    return createPortal(content, portalTarget);
  },
);

// ─── Calendar overlay inner ──────────────────────────────────────────────────

interface CalendarOverlayProps {
  unstyled: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const CalendarOverlay = forwardRef<HTMLDivElement, CalendarOverlayProps>(
  function CalendarOverlay({ unstyled, className, style }, ref) {
    const ctx = useDatePickerContext('CalendarOverlay');
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    // Focus trap for modal mode
    const trapRef = useFocusTrap<HTMLDivElement>({
      active: ctx.overlay === 'modal' && ctx.isOpen,
      escapeDeactivates: true,
      clickOutsideDeactivates: false,
      onDeactivate: () => ctx.onOpenChange(false),
    });

    // Position calculation for popover mode
    useEffect(() => {
      if (ctx.overlay !== 'popover' || !ctx.isOpen) return;
      const updatePos = () => {
        const trigger = ctx.triggerRef.current;
        const content = containerRef.current;
        if (!trigger || !content) return;
        const rect = trigger.getBoundingClientRect();
        const contentRect = content.getBoundingClientRect();
        let top = rect.bottom + 8;
        let left = rect.left;
        // Flip up if needed
        if (top + contentRect.height > window.innerHeight && rect.top - contentRect.height - 8 > 0) {
          top = rect.top - contentRect.height - 8;
        }
        // Keep in viewport
        left = Math.max(8, Math.min(left, window.innerWidth - contentRect.width - 8));
        top = Math.max(8, top);
        setPosition({ top, left });
      };
      requestAnimationFrame(updatePos);
      window.addEventListener('scroll', updatePos, { passive: true, capture: true });
      window.addEventListener('resize', updatePos, { passive: true });
      return () => {
        window.removeEventListener('scroll', updatePos, true);
        window.removeEventListener('resize', updatePos);
      };
    }, [ctx.isOpen, ctx.overlay, ctx.triggerRef]);

    // Body scroll lock for modal
    useEffect(() => {
      if (ctx.overlay === 'modal' && ctx.isOpen) {
        lockBodyScroll();
        return () => unlockBodyScroll();
      }
    }, [ctx.isOpen, ctx.overlay]);

    // Outside click for popover
    useEffect(() => {
      if (ctx.overlay !== 'popover' || !ctx.isOpen) return;
      const onPointerDown = (e: PointerEvent) => {
        const path = e.composedPath();
        if (containerRef.current && path.includes(containerRef.current)) return;
        if (ctx.triggerRef.current && path.includes(ctx.triggerRef.current)) return;
        ctx.onOpenChange(false);
      };
      document.addEventListener('pointerdown', onPointerDown, true);
      return () => document.removeEventListener('pointerdown', onPointerDown, true);
    }, [ctx.isOpen, ctx.overlay, ctx.onOpenChange, ctx.triggerRef]);

    // Escape key for popover (modal handles via focus trap)
    useEffect(() => {
      if (ctx.overlay !== 'popover' || !ctx.isOpen) return;
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.stopPropagation();
          ctx.onOpenChange(false);
          ctx.triggerRef.current?.focus();
        }
      };
      document.addEventListener('keydown', onKeyDown, true);
      return () => document.removeEventListener('keydown', onKeyDown, true);
    }, [ctx.isOpen, ctx.overlay, ctx.onOpenChange, ctx.triggerRef]);

    // Focus return for modal
    useEffect(() => {
      if (ctx.overlay === 'modal' && !ctx.isOpen) {
        ctx.triggerRef.current?.focus();
      }
    }, [ctx.isOpen, ctx.overlay, ctx.triggerRef]);

    // Merge refs
    const mergedRef = useCallback(
      (el: HTMLDivElement | null) => {
        containerRef.current = el;
        if (ctx.overlay === 'modal') {
          (trapRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
        }
        if (typeof ref === 'function') ref(el);
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
      },
      [ref, ctx.overlay, trapRef],
    );

    const overlayStyles: React.CSSProperties = ctx.overlay === 'modal'
      ? {
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          ...(unstyled ? {} : { backgroundColor: 'rgba(0, 0, 0, 0.5)' }),
        }
      : {};

    const calendarStyles: React.CSSProperties = {
      ...(ctx.overlay === 'popover'
        ? { position: 'fixed', zIndex: 1000, top: position.top, left: position.left }
        : {}),
      ...(unstyled
        ? {}
        : {
            background: 'var(--compa11y-date-picker-bg, #fff)',
            border: 'var(--compa11y-date-picker-border, 1px solid rgba(0,0,0,.15))',
            borderRadius: 'var(--compa11y-date-picker-radius, 0.5rem)',
            boxShadow: 'var(--compa11y-date-picker-shadow, 0 4px 16px rgba(0,0,0,.12))',
            padding: 'var(--compa11y-date-picker-padding, 1rem)',
          }),
      ...style,
    };

    const calendarContent = (
      <div
        ref={mergedRef}
        id={ctx.calendarId}
        role="dialog"
        aria-modal={ctx.overlay === 'modal' ? 'true' : 'false'}
        aria-labelledby={ctx.titleId}
        tabIndex={-1}
        className={className}
        data-compa11y-date-picker-calendar
        style={calendarStyles}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id={ctx.titleId}
          data-compa11y-date-picker-calendar-title
          style={unstyled ? {} : { margin: 0, fontSize: '1rem', fontWeight: 600 }}
        >
          {ctx.mode === 'range' ? 'Choose date range' : 'Choose date'}
          {ctx.precision === 'datetime' ? ' and time' : ''}
        </h2>

        {/* Calendar header: month/year nav */}
        <CalendarHeader />

        {/* Day/Month/Year view */}
        {ctx.currentView === 'days' && <DayGrid />}
        {ctx.currentView === 'months' && <MonthGrid />}
        {ctx.currentView === 'years' && <YearGrid />}

        {/* Selection summary */}
        <SelectionSummary />

        {/* Time panel */}
        {ctx.precision === 'datetime' && <TimePanel />}

        {/* Actions */}
        <CalendarActions />
      </div>
    );

    if (ctx.overlay === 'modal') {
      return (
        <div
          style={overlayStyles}
          onClick={() => ctx.onOpenChange(false)}
          data-compa11y-date-picker-overlay
        >
          {calendarContent}
        </div>
      );
    }

    return calendarContent;
  },
);

// ─── Calendar Header ─────────────────────────────────────────────────────────

function CalendarHeader() {
  const ctx = useDatePickerContext('CalendarHeader');

  const handlePrevMonth = () => {
    const next = addMonths(ctx.viewDate, -1);
    ctx.setViewDate(next);
    ctx.setFocusedDate(new Date(next.getFullYear(), next.getMonth(), Math.min(ctx.focusedDate.getDate(), getDaysInMonth(next.getFullYear(), next.getMonth()))));
    ctx.setLiveMessage(next.toLocaleDateString(ctx.locale, { month: 'long', year: 'numeric' }));
  };

  const handleNextMonth = () => {
    const next = addMonths(ctx.viewDate, 1);
    ctx.setViewDate(next);
    ctx.setFocusedDate(new Date(next.getFullYear(), next.getMonth(), Math.min(ctx.focusedDate.getDate(), getDaysInMonth(next.getFullYear(), next.getMonth()))));
    ctx.setLiveMessage(next.toLocaleDateString(ctx.locale, { month: 'long', year: 'numeric' }));
  };

  const toggleMonthView = () => {
    ctx.setCurrentView(ctx.currentView === 'months' ? 'days' : 'months');
  };

  const toggleYearView = () => {
    ctx.setCurrentView(ctx.currentView === 'years' ? 'days' : 'years');
  };

  const monthLabel = ctx.viewDate.toLocaleDateString(ctx.locale, { month: 'long' });
  const yearLabel = ctx.viewDate.getFullYear().toString();

  return (
    <div
      data-compa11y-date-picker-header
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.25rem', marginBottom: '0.5rem' }}
    >
      <button
        type="button"
        aria-label="Previous month"
        onClick={handlePrevMonth}
        data-compa11y-date-picker-nav
        style={{ minWidth: 44, minHeight: 44 }}
      >
        <span aria-hidden="true">&lsaquo;</span>
      </button>

      <div style={{ display: 'flex', gap: '0.25rem' }}>
        <button
          type="button"
          aria-label={`Choose month, current month: ${monthLabel}`}
          onClick={toggleMonthView}
          data-compa11y-date-picker-month-btn
          aria-pressed={ctx.currentView === 'months'}
        >
          {monthLabel}
        </button>
        <button
          type="button"
          aria-label={`Choose year, current year: ${yearLabel}`}
          onClick={toggleYearView}
          data-compa11y-date-picker-year-btn
          aria-pressed={ctx.currentView === 'years'}
        >
          {yearLabel}
        </button>
      </div>

      <button
        type="button"
        aria-label="Next month"
        onClick={handleNextMonth}
        data-compa11y-date-picker-nav
        style={{ minWidth: 44, minHeight: 44 }}
      >
        <span aria-hidden="true">&rsaquo;</span>
      </button>
    </div>
  );
}

// ─── Day Grid ────────────────────────────────────────────────────────────────

function DayGrid() {
  const ctx = useDatePickerContext('DayGrid');
  const gridRef = useRef<HTMLTableElement>(null);

  const year = ctx.viewDate.getFullYear();
  const month = ctx.viewDate.getMonth();
  const days = useMemo(
    () => getCalendarDays(year, month, ctx.firstDayOfWeek),
    [year, month, ctx.firstDayOfWeek],
  );
  const weekdayNames = useMemo(
    () => getWeekdayNames(ctx.locale, ctx.firstDayOfWeek),
    [ctx.locale, ctx.firstDayOfWeek],
  );

  // Roving tabindex: find the index of focused date in the days array
  const focusedIndex = useMemo(() => {
    const idx = days.findIndex((d) => isSameDay(d, ctx.focusedDate));
    return idx >= 0 ? idx : days.findIndex((d) => isSameDay(d, new Date()));
  }, [days, ctx.focusedDate]);

  const dayRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Focus the active day button when focusedDate or view changes
  useEffect(() => {
    if (focusedIndex >= 0) {
      dayRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex]);

  const navigateDate = useCallback(
    (newDate: Date) => {
      // If moving out of current month, change view
      if (!isSameMonth(newDate, ctx.viewDate)) {
        ctx.setViewDate(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
      }
      ctx.setFocusedDate(newDate);
    },
    [ctx],
  );

  const handleDayKeyDown = useCallback(
    (e: React.KeyboardEvent, dayDate: Date) => {
      let next: Date | null = null;

      switch (e.key) {
        case 'ArrowLeft':
          next = addDays(dayDate, -1);
          break;
        case 'ArrowRight':
          next = addDays(dayDate, 1);
          break;
        case 'ArrowUp':
          next = addDays(dayDate, -7);
          break;
        case 'ArrowDown':
          next = addDays(dayDate, 7);
          break;
        case 'Home':
          next = startOfWeek(dayDate, ctx.firstDayOfWeek);
          break;
        case 'End':
          next = endOfWeek(dayDate, ctx.firstDayOfWeek);
          break;
        case 'PageUp':
          if (e.shiftKey) {
            next = addYears(dayDate, -1);
          } else {
            next = addMonths(dayDate, -1);
          }
          break;
        case 'PageDown':
          if (e.shiftKey) {
            next = addYears(dayDate, 1);
          } else {
            next = addMonths(dayDate, 1);
          }
          break;
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
        // Skip disabled dates in navigation direction
        if (ctx.isDateDisabled(next)) {
          // Try to find next non-disabled date in same direction
          const step = e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 1;
          let attempt = next;
          for (let i = 0; i < 365; i++) {
            if (!ctx.isDateDisabled(attempt)) break;
            attempt = addDays(attempt, step);
          }
          next = attempt;
        }
        navigateDate(next);
      }
    },
    [ctx, navigateDate],
  );

  const selectDay = useCallback(
    (dayDate: Date) => {
      if (ctx.isDateDisabled(dayDate)) return;

      if (ctx.mode === 'single') {
        // Build date with time if datetime
        let result = new Date(dayDate);
        if (ctx.precision === 'datetime') {
          let h = ctx.hours;
          if (ctx.hourCycle === 12) {
            h = ctx.period === 'PM' ? (h % 12) + 12 : h % 12;
          }
          result.setHours(h, ctx.minutes, 0, 0);
        }
        ctx.onDateSelect(result);
        ctx.setLiveMessage(`Date selected: ${formatDayLabel(dayDate, ctx.locale)}`);

        // Close immediately if date-only, keep open for datetime (user needs to set time)
        if (ctx.precision === 'date') {
          ctx.onOpenChange(false);
          ctx.triggerRef.current?.focus();
        }
      } else {
        // Range mode
        if (!ctx.rangeStart || (ctx.rangeStart && ctx.rangeEnd)) {
          // Start new range
          ctx.onRangeSelect(dayDate, null);
          ctx.setLiveMessage(`Range start: ${formatDayLabel(dayDate, ctx.locale)}`);
        } else {
          // Set end
          if (isBeforeDate(dayDate, ctx.rangeStart)) {
            // New start if before current start
            ctx.onRangeSelect(dayDate, null);
            ctx.setLiveMessage(`Range start: ${formatDayLabel(dayDate, ctx.locale)}`);
          } else {
            ctx.onRangeSelect(ctx.rangeStart, dayDate);
            ctx.setLiveMessage(
              `Range end: ${formatDayLabel(dayDate, ctx.locale)}`,
            );
            // Close if date-only range
            if (ctx.precision === 'date') {
              ctx.onOpenChange(false);
              ctx.triggerRef.current?.focus();
            }
          }
        }
      }
    },
    [ctx],
  );

  // Build weeks (rows of 7)
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <table
      ref={gridRef}
      role="grid"
      aria-label={ctx.viewDate.toLocaleDateString(ctx.locale, { month: 'long', year: 'numeric' })}
      data-compa11y-date-picker-grid
      style={{ borderCollapse: 'collapse', width: '100%' }}
    >
      <thead>
        <tr>
          {weekdayNames.map((name, i) => (
            <th
              key={i}
              scope="col"
              abbr={name}
              style={{ padding: '0.25rem', textAlign: 'center', fontWeight: 'normal', fontSize: '0.875rem' }}
            >
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
              const isSelected =
                ctx.mode === 'single'
                  ? ctx.selectedDate && isSameDay(dayDate, ctx.selectedDate)
                  : false;
              const isRangeStart =
                ctx.mode === 'range' && ctx.rangeStart && isSameDay(dayDate, ctx.rangeStart);
              const isRangeEnd =
                ctx.mode === 'range' && ctx.rangeEnd && isSameDay(dayDate, ctx.rangeEnd);
              const inRange =
                ctx.mode === 'range' && isInRange(dayDate, ctx.rangeStart, ctx.rangeEnd);
              const isTodayDate = isToday(dayDate);
              const isDisabled = ctx.isDateDisabled(dayDate);
              const isFocused = flatIndex === focusedIndex;

              // Build accessible label
              const dayLabel = formatDayLabel(dayDate, ctx.locale);
              const stateLabels: string[] = [dayLabel];
              if (isTodayDate) stateLabels.push('today');
              if (isSelected) stateLabels.push('selected');
              if (isRangeStart) stateLabels.push('start date');
              if (isRangeEnd) stateLabels.push('end date');
              if (inRange && !isRangeStart && !isRangeEnd) stateLabels.push('in selected range');
              if (isDisabled) stateLabels.push('not available');
              const fullLabel = stateLabels.join(', ');

              return (
                <td
                  key={di}
                  role="gridcell"
                  style={{ padding: 0 }}
                >
                  <button
                    ref={(el) => { dayRefs.current[flatIndex] = el; }}
                    type="button"
                    tabIndex={isFocused ? 0 : -1}
                    disabled={isDisabled}
                    aria-label={fullLabel}
                    aria-current={isTodayDate ? 'date' : undefined}
                    aria-pressed={isSelected || undefined}
                    aria-selected={isRangeStart || isRangeEnd || undefined}
                    onClick={() => selectDay(dayDate)}
                    onKeyDown={(e) => handleDayKeyDown(e, dayDate)}
                    data-compa11y-date-picker-day
                    data-today={isTodayDate || undefined}
                    data-selected={isSelected || undefined}
                    data-range-start={isRangeStart || undefined}
                    data-range-end={isRangeEnd || undefined}
                    data-in-range={inRange || undefined}
                    data-outside-month={!isCurrentMonth || undefined}
                    data-disabled={isDisabled || undefined}
                    style={{
                      width: '100%',
                      minWidth: 44,
                      minHeight: 44,
                      border: 'none',
                      background: 'none',
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      opacity: !isCurrentMonth ? 0.4 : isDisabled ? 0.3 : 1,
                      fontWeight: isTodayDate ? 'bold' : 'normal',
                      padding: '0.25rem',
                      borderRadius: '0.25rem',
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

// ─── Month Grid ──────────────────────────────────────────────────────────────

function MonthGrid() {
  const ctx = useDatePickerContext('MonthGrid');
  const monthNames = useMemo(() => getMonthNames(ctx.locale), [ctx.locale]);
  const [focusedMonth, setFocusedMonth] = useState(ctx.viewDate.getMonth());
  const monthRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    monthRefs.current[focusedMonth]?.focus();
  }, [focusedMonth]);

  const selectMonth = (monthIndex: number) => {
    const next = new Date(ctx.viewDate);
    next.setMonth(monthIndex);
    ctx.setViewDate(next);
    ctx.setFocusedDate(new Date(next.getFullYear(), monthIndex, Math.min(ctx.focusedDate.getDate(), getDaysInMonth(next.getFullYear(), monthIndex))));
    ctx.setCurrentView('days');
    ctx.setLiveMessage(`${monthNames[monthIndex]} ${next.getFullYear()}`);
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
      case 'Enter':
      case ' ':
        e.preventDefault();
        selectMonth(index);
        return;
      case 'Escape':
        e.preventDefault();
        ctx.setCurrentView('days');
        return;
      default:
        return;
    }
    e.preventDefault();
    setFocusedMonth(next);
  };

  // 4x3 grid
  const rows = [
    monthNames.slice(0, 3),
    monthNames.slice(3, 6),
    monthNames.slice(6, 9),
    monthNames.slice(9, 12),
  ];

  return (
    <div
      role="grid"
      aria-label="Choose month"
      data-compa11y-date-picker-month-grid
    >
      {rows.map((row, ri) => (
        <div key={ri} role="row" style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.25rem' }}>
          {row.map((name, ci) => {
            const idx = ri * 3 + ci;
            const isCurrent = idx === ctx.viewDate.getMonth();
            return (
              <button
                key={idx}
                ref={(el) => { monthRefs.current[idx] = el; }}
                type="button"
                role="gridcell"
                tabIndex={idx === focusedMonth ? 0 : -1}
                aria-pressed={isCurrent}
                aria-label={`${name} ${ctx.viewDate.getFullYear()}`}
                onClick={() => selectMonth(idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                data-compa11y-date-picker-month-cell
                data-selected={isCurrent || undefined}
                style={{
                  flex: 1,
                  minHeight: 44,
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  fontWeight: isCurrent ? 'bold' : 'normal',
                  borderRadius: '0.25rem',
                  padding: '0.5rem',
                }}
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

// ─── Year Grid ───────────────────────────────────────────────────────────────

function YearGrid() {
  const ctx = useDatePickerContext('YearGrid');
  const currentYear = ctx.viewDate.getFullYear();
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
    const next = new Date(ctx.viewDate);
    next.setFullYear(year);
    ctx.setViewDate(next);
    ctx.setFocusedDate(new Date(year, ctx.focusedDate.getMonth(), Math.min(ctx.focusedDate.getDate(), getDaysInMonth(year, ctx.focusedDate.getMonth()))));
    ctx.setCurrentView('months');
    ctx.setLiveMessage(`Year ${year}`);
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
      case 'PageUp':
        e.preventDefault();
        ctx.setViewDate(addYears(ctx.viewDate, -12));
        return;
      case 'PageDown':
        e.preventDefault();
        ctx.setViewDate(addYears(ctx.viewDate, 12));
        return;
      case 'Enter':
      case ' ':
        e.preventDefault();
        selectYear(yearVal);
        return;
      case 'Escape':
        e.preventDefault();
        ctx.setCurrentView('days');
        return;
      default:
        return;
    }
    e.preventDefault();
    if (next < startYear || next > startYear + 11) {
      // Navigate to adjacent year block
      const newStart = next < startYear ? startYear - 12 : startYear + 12;
      const newView = new Date(ctx.viewDate);
      newView.setFullYear(newStart);
      ctx.setViewDate(newView);
    }
    setFocusedYear(next);
  };

  // Navigate year blocks
  const handlePrevBlock = () => {
    const newView = new Date(ctx.viewDate);
    newView.setFullYear(startYear - 12);
    ctx.setViewDate(newView);
    setFocusedYear(startYear - 12);
  };

  const handleNextBlock = () => {
    const newView = new Date(ctx.viewDate);
    newView.setFullYear(startYear + 12);
    ctx.setViewDate(newView);
    setFocusedYear(startYear + 12);
  };

  // 4x3 grid
  const rows: number[][] = [];
  for (let i = 0; i < years.length; i += 3) {
    rows.push(years.slice(i, i + 3));
  }

  return (
    <div data-compa11y-date-picker-year-grid>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <button
          type="button"
          aria-label="Previous 12 years"
          onClick={handlePrevBlock}
          style={{ minWidth: 44, minHeight: 44 }}
        >
          <span aria-hidden="true">&lsaquo;</span>
        </button>
        <span aria-live="polite">{startYear} – {startYear + 11}</span>
        <button
          type="button"
          aria-label="Next 12 years"
          onClick={handleNextBlock}
          style={{ minWidth: 44, minHeight: 44 }}
        >
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
                  type="button"
                  role="gridcell"
                  tabIndex={yearVal === focusedYear ? 0 : -1}
                  aria-pressed={isCurrent}
                  aria-label={String(yearVal)}
                  onClick={() => selectYear(yearVal)}
                  onKeyDown={(e) => handleKeyDown(e, yearVal)}
                  data-compa11y-date-picker-year-cell
                  data-selected={isCurrent || undefined}
                  style={{
                    flex: 1,
                    minHeight: 44,
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    fontWeight: isCurrent ? 'bold' : 'normal',
                    borderRadius: '0.25rem',
                    padding: '0.5rem',
                  }}
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

// ─── Selection Summary ───────────────────────────────────────────────────────

function SelectionSummary() {
  const ctx = useDatePickerContext('SelectionSummary');

  let summary = '';
  if (ctx.mode === 'single' && ctx.selectedDate) {
    summary = `Selected: ${ctx.formatDate(ctx.selectedDate)}`;
  } else if (ctx.mode === 'range') {
    const parts: string[] = [];
    if (ctx.rangeStart) parts.push(`Start: ${ctx.formatDate(ctx.rangeStart)}`);
    if (ctx.rangeEnd) parts.push(`End: ${ctx.formatDate(ctx.rangeEnd)}`);
    summary = parts.join(' — ');
  }

  if (!summary) return null;

  return (
    <div
      aria-live="polite"
      data-compa11y-date-picker-summary
      style={{ fontSize: '0.875rem', marginTop: '0.5rem', minHeight: '1.5rem' }}
    >
      {summary}
    </div>
  );
}

// ─── Time Panel ──────────────────────────────────────────────────────────────

function TimePanel() {
  const ctx = useDatePickerContext('TimePanel');

  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val)) return;
    const max = ctx.hourCycle === 24 ? 23 : 12;
    const min = ctx.hourCycle === 24 ? 0 : 1;
    ctx.setHours(Math.max(min, Math.min(max, val)));
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val)) return;
    ctx.setMinutes(Math.max(0, Math.min(59, val)));
  };

  const handleHourKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const max = ctx.hourCycle === 24 ? 23 : 12;
    const min = ctx.hourCycle === 24 ? 0 : 1;
    if (e.key === 'ArrowUp') { e.preventDefault(); ctx.setHours(Math.min(max, ctx.hours + 1)); }
    if (e.key === 'ArrowDown') { e.preventDefault(); ctx.setHours(Math.max(min, ctx.hours - 1)); }
  };

  const handleMinuteKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') { e.preventDefault(); ctx.setMinutes(Math.min(59, ctx.minutes + 1)); }
    if (e.key === 'ArrowDown') { e.preventDefault(); ctx.setMinutes(Math.max(0, ctx.minutes - 1)); }
  };

  const hourDisplay = ctx.hourCycle === 12
    ? (ctx.hours > 12 ? ctx.hours - 12 : ctx.hours === 0 ? 12 : ctx.hours)
    : ctx.hours;

  return (
    <div data-compa11y-date-picker-time style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(0,0,0,.1)' }}>
      <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
        <legend style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          {ctx.mode === 'range' ? 'Start time' : 'Time'}
        </legend>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <label htmlFor={`${ctx.calendarId}-hour`} style={srOnlyStyle}>Hour</label>
          <input
            id={`${ctx.calendarId}-hour`}
            type="text"
            inputMode="numeric"
            value={String(hourDisplay).padStart(2, '0')}
            onChange={handleHourChange}
            onKeyDown={handleHourKeyDown}
            aria-label="Hour"
            style={{ width: '3rem', textAlign: 'center', padding: '0.25rem' }}
            data-compa11y-date-picker-hour
          />
          <span aria-hidden="true">:</span>
          <label htmlFor={`${ctx.calendarId}-minute`} style={srOnlyStyle}>Minute</label>
          <input
            id={`${ctx.calendarId}-minute`}
            type="text"
            inputMode="numeric"
            value={String(ctx.minutes).padStart(2, '0')}
            onChange={handleMinuteChange}
            onKeyDown={handleMinuteKeyDown}
            aria-label="Minute"
            style={{ width: '3rem', textAlign: 'center', padding: '0.25rem' }}
            data-compa11y-date-picker-minute
          />
          {ctx.hourCycle === 12 && (
            <div role="group" aria-label="AM/PM" style={{ display: 'flex', gap: '0.125rem' }}>
              <button
                type="button"
                aria-pressed={ctx.period === 'AM'}
                onClick={() => ctx.setPeriod('AM')}
                data-compa11y-date-picker-period
                style={{ padding: '0.25rem 0.5rem', minHeight: 44 }}
              >
                AM
              </button>
              <button
                type="button"
                aria-pressed={ctx.period === 'PM'}
                onClick={() => ctx.setPeriod('PM')}
                data-compa11y-date-picker-period
                style={{ padding: '0.25rem 0.5rem', minHeight: 44 }}
              >
                PM
              </button>
            </div>
          )}
        </div>
      </fieldset>

      {/* Range end time */}
      {ctx.mode === 'range' && (
        <RangeEndTime />
      )}
    </div>
  );
}

function RangeEndTime() {
  const ctx = useDatePickerContext('RangeEndTime');

  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val)) return;
    const max = ctx.hourCycle === 24 ? 23 : 12;
    const min = ctx.hourCycle === 24 ? 0 : 1;
    ctx.setEndHours(Math.max(min, Math.min(max, val)));
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val)) return;
    ctx.setEndMinutes(Math.max(0, Math.min(59, val)));
  };

  const handleHourKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const max = ctx.hourCycle === 24 ? 23 : 12;
    const min = ctx.hourCycle === 24 ? 0 : 1;
    if (e.key === 'ArrowUp') { e.preventDefault(); ctx.setEndHours(Math.min(max, ctx.endHours + 1)); }
    if (e.key === 'ArrowDown') { e.preventDefault(); ctx.setEndHours(Math.max(min, ctx.endHours - 1)); }
  };

  const handleMinuteKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') { e.preventDefault(); ctx.setEndMinutes(Math.min(59, ctx.endMinutes + 1)); }
    if (e.key === 'ArrowDown') { e.preventDefault(); ctx.setEndMinutes(Math.max(0, ctx.endMinutes - 1)); }
  };

  const hourDisplay = ctx.hourCycle === 12
    ? (ctx.endHours > 12 ? ctx.endHours - 12 : ctx.endHours === 0 ? 12 : ctx.endHours)
    : ctx.endHours;

  return (
    <fieldset style={{ border: 'none', padding: 0, margin: 0, marginTop: '0.5rem' }}>
      <legend style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
        End time
      </legend>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <label htmlFor={`${ctx.calendarId}-end-hour`} style={srOnlyStyle}>End hour</label>
        <input
          id={`${ctx.calendarId}-end-hour`}
          type="text"
          inputMode="numeric"
          value={String(hourDisplay).padStart(2, '0')}
          onChange={handleHourChange}
          onKeyDown={handleHourKeyDown}
          aria-label="End hour"
          style={{ width: '3rem', textAlign: 'center', padding: '0.25rem' }}
          data-compa11y-date-picker-hour
        />
        <span aria-hidden="true">:</span>
        <label htmlFor={`${ctx.calendarId}-end-minute`} style={srOnlyStyle}>End minute</label>
        <input
          id={`${ctx.calendarId}-end-minute`}
          type="text"
          inputMode="numeric"
          value={String(ctx.endMinutes).padStart(2, '0')}
          onChange={handleMinuteChange}
          onKeyDown={handleMinuteKeyDown}
          aria-label="End minute"
          style={{ width: '3rem', textAlign: 'center', padding: '0.25rem' }}
          data-compa11y-date-picker-minute
        />
        {ctx.hourCycle === 12 && (
          <div role="group" aria-label="End AM/PM" style={{ display: 'flex', gap: '0.125rem' }}>
            <button
              type="button"
              aria-pressed={ctx.endPeriod === 'AM'}
              onClick={() => ctx.setEndPeriod('AM')}
              data-compa11y-date-picker-period
              style={{ padding: '0.25rem 0.5rem', minHeight: 44 }}
            >
              AM
            </button>
            <button
              type="button"
              aria-pressed={ctx.endPeriod === 'PM'}
              onClick={() => ctx.setEndPeriod('PM')}
              data-compa11y-date-picker-period
              style={{ padding: '0.25rem 0.5rem', minHeight: 44 }}
            >
              PM
            </button>
          </div>
        )}
      </div>
    </fieldset>
  );
}

// ─── Calendar Actions ────────────────────────────────────────────────────────

function CalendarActions() {
  const ctx = useDatePickerContext('CalendarActions');

  const handleApply = () => {
    if (ctx.precision === 'datetime' && ctx.mode === 'single' && ctx.selectedDate) {
      // Update time on the selected date
      const result = new Date(ctx.selectedDate);
      let h = ctx.hours;
      if (ctx.hourCycle === 12) {
        h = ctx.period === 'PM' ? (h % 12) + 12 : h % 12;
      }
      result.setHours(h, ctx.minutes, 0, 0);
      ctx.onDateSelect(result);
    }
    if (ctx.precision === 'datetime' && ctx.mode === 'range') {
      // Apply time to range values
      if (ctx.rangeStart) {
        const start = new Date(ctx.rangeStart);
        let sh = ctx.hours;
        if (ctx.hourCycle === 12) {
          sh = ctx.period === 'PM' ? (sh % 12) + 12 : sh % 12;
        }
        start.setHours(sh, ctx.minutes, 0, 0);

        let end: Date | null = null;
        if (ctx.rangeEnd) {
          end = new Date(ctx.rangeEnd);
          let eh = ctx.endHours;
          if (ctx.hourCycle === 12) {
            eh = ctx.endPeriod === 'PM' ? (eh % 12) + 12 : eh % 12;
          }
          end.setHours(eh, ctx.endMinutes, 0, 0);
        }

        ctx.onRangeSelect(start, end);
      }
    }
    ctx.onOpenChange(false);
    ctx.triggerRef.current?.focus();
  };

  const handleCancel = () => {
    ctx.onOpenChange(false);
    ctx.triggerRef.current?.focus();
  };

  const handleClear = () => {
    if (ctx.mode === 'single') {
      ctx.onDateSelect(null);
    } else {
      ctx.onRangeSelect(null, null);
    }
    ctx.setLiveMessage('Selection cleared');
  };

  const handleToday = () => {
    const today = new Date();
    ctx.setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
    ctx.setFocusedDate(today);
    ctx.setCurrentView('days');
    ctx.setLiveMessage(`Navigated to today: ${formatDayLabel(today, ctx.locale)}`);
  };

  // Show Apply/Cancel for datetime mode; single date-only auto-closes
  const showApplyCancel = ctx.precision === 'datetime';

  return (
    <div
      data-compa11y-date-picker-actions
      style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(0,0,0,.1)' }}
    >
      <div style={{ display: 'flex', gap: '0.25rem' }}>
        <button
          type="button"
          onClick={handleToday}
          data-compa11y-date-picker-today-btn
          style={{ minHeight: 44 }}
        >
          Today
        </button>
        <button
          type="button"
          onClick={handleClear}
          data-compa11y-date-picker-clear-btn
          style={{ minHeight: 44 }}
        >
          Clear
        </button>
      </div>
      {showApplyCancel && (
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <button
            type="button"
            onClick={handleCancel}
            data-compa11y-date-picker-cancel-btn
            style={{ minHeight: 44 }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            data-compa11y-date-picker-apply-btn
            style={{ minHeight: 44 }}
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Compound export ─────────────────────────────────────────────────────────

export const DatePickerCompound = Object.assign(DatePickerRoot, {
  Input: DatePickerInput,
  RangeInputs: DatePickerRangeInputs,
  Trigger: DatePickerTrigger,
  Calendar: DatePickerCalendar,
});

export { DatePickerRoot as DatePicker };
