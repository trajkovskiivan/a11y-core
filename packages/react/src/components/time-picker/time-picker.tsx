/**
 * TimePicker Component
 *
 * An accessible time input that supports free-form text entry plus an
 * optional popup listbox of time suggestions (combobox pattern).
 *
 * @example
 * // Basic 24h
 * <TimePicker label="Start time" hourCycle={24} />
 *
 * // 12h with step
 * <TimePicker
 *   label="Meeting time"
 *   hourCycle={12}
 *   stepMinutes={15}
 *   value={{ hours: 9, minutes: 30, period: 'AM' }}
 *   onChange={setValue}
 * />
 *
 * // With constraints
 * <TimePicker
 *   label="Office hours"
 *   minTime={{ hours: 9, minutes: 0 }}
 *   maxTime={{ hours: 17, minutes: 0 }}
 *   stepMinutes={30}
 * />
 */

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useId } from '../../hooks/use-id';
import { useAnnouncer } from '../../hooks/use-announcer';
import { createComponentWarnings } from '@compa11y/core';

const warn = createComponentWarnings('TimePicker');

// =============================================================================
// Types
// =============================================================================

export interface TimePickerValue {
  hours: number;
  minutes: number;
  period?: 'AM' | 'PM';
}

export interface TimePickerProps {
  /** Visible label */
  label?: string;
  /** Accessible label (hidden) */
  'aria-label'?: string;
  /** ID of external labelling element */
  'aria-labelledby'?: string;
  /** Controlled value */
  value?: TimePickerValue;
  /** Default value (uncontrolled) */
  defaultValue?: TimePickerValue;
  /** Called when value changes */
  onChange?: (value: TimePickerValue) => void;
  /** 12h or 24h */
  hourCycle?: 12 | 24;
  /** Minutes step for popup list (e.g. 1, 5, 15, 30) */
  stepMinutes?: number;
  /** Earliest selectable time */
  minTime?: { hours: number; minutes: number };
  /** Latest selectable time */
  maxTime?: { hours: number; minutes: number };
  /** Allow free-form text input */
  allowFreeInput?: boolean;
  /** Show popup trigger button */
  showPicker?: boolean;
  /** Hint text (e.g. format guidance) */
  hint?: string;
  /** Error message */
  error?: string;
  /** Placeholder */
  placeholder?: string;
  /** Name for form submission */
  name?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Required field */
  required?: boolean;
  /** Called when popup opens/closes */
  onOpenChange?: (open: boolean) => void;
  /** Remove default inline styles */
  unstyled?: boolean;
  /** CSS class */
  className?: string;
  /** CSS style */
  style?: React.CSSProperties;
}

// =============================================================================
// Helpers
// =============================================================================

/** Convert value to total minutes for comparison */
function toMinutes(h: number, m: number): number {
  return h * 60 + m;
}

/** Check if a time is within min/max constraints (in 24h) */
function isTimeInRange(
  h24: number,
  m: number,
  min?: { hours: number; minutes: number },
  max?: { hours: number; minutes: number },
): boolean {
  const t = toMinutes(h24, m);
  if (min && t < toMinutes(min.hours, min.minutes)) return false;
  if (max && t > toMinutes(max.hours, max.minutes)) return false;
  return true;
}

/** Convert 12h + period to 24h */
function to24h(h12: number, period: 'AM' | 'PM'): number {
  if (period === 'AM') return h12 === 12 ? 0 : h12;
  return h12 === 12 ? 12 : h12 + 12;
}

/** Convert 24h to 12h + period */
function to12h(h24: number): { hours: number; period: 'AM' | 'PM' } {
  if (h24 === 0) return { hours: 12, period: 'AM' };
  if (h24 < 12) return { hours: h24, period: 'AM' };
  if (h24 === 12) return { hours: 12, period: 'PM' };
  return { hours: h24 - 12, period: 'PM' };
}

/** Format a time value for display */
function formatTime(
  value: TimePickerValue,
  hourCycle: 12 | 24,
): string {
  const mm = String(value.minutes).padStart(2, '0');
  if (hourCycle === 24) {
    const hh = String(value.hours).padStart(2, '0');
    return `${hh}:${mm}`;
  }
  // 12h display
  const display = to12h(value.hours);
  const period = value.period ?? display.period;
  const h = display.hours;
  return `${h}:${mm} ${period}`;
}

/** Format for the label of a listbox option */
function formatOptionLabel(h24: number, m: number, hourCycle: 12 | 24): string {
  const mm = String(m).padStart(2, '0');
  if (hourCycle === 24) {
    return `${String(h24).padStart(2, '0')}:${mm}`;
  }
  const { hours: h12, period } = to12h(h24);
  return `${h12}:${mm} ${period}`;
}

/** Parse user input into a TimePickerValue. Returns null if invalid. */
function parseTimeInput(
  raw: string,
  hourCycle: 12 | 24,
): TimePickerValue | null {
  const s = raw.trim().toLowerCase();
  if (!s) return null;

  // Detect AM/PM
  let detectedPeriod: 'AM' | 'PM' | undefined;
  let cleaned = s;
  if (/a\.?m\.?$/i.test(cleaned)) {
    detectedPeriod = 'AM';
    cleaned = cleaned.replace(/\s*a\.?m\.?$/i, '');
  } else if (/p\.?m\.?$/i.test(cleaned)) {
    detectedPeriod = 'PM';
    cleaned = cleaned.replace(/\s*p\.?m\.?$/i, '');
  } else if (/a$/i.test(cleaned)) {
    detectedPeriod = 'AM';
    cleaned = cleaned.replace(/\s*a$/i, '');
  } else if (/p$/i.test(cleaned)) {
    detectedPeriod = 'PM';
    cleaned = cleaned.replace(/\s*p$/i, '');
  }

  cleaned = cleaned.trim();

  // Split on : or .
  const parts = cleaned.split(/[:.]/);
  const hourStr = parts[0];
  const minStr = parts[1] ?? '0';
  if (!hourStr) return null;

  const h = parseInt(hourStr, 10);
  const m = parseInt(minStr, 10);
  if (isNaN(h) || isNaN(m)) return null;
  if (m < 0 || m > 59) return null;

  if (hourCycle === 24) {
    // In 24h mode, if user typed AM/PM, convert
    if (detectedPeriod) {
      if (h < 1 || h > 12) return null;
      const h24 = to24h(h, detectedPeriod);
      return { hours: h24, minutes: m };
    }
    if (h < 0 || h > 23) return null;
    return { hours: h, minutes: m };
  }

  // 12h mode
  if (detectedPeriod) {
    if (h < 1 || h > 12) return null;
    const h24 = to24h(h, detectedPeriod);
    return { hours: h24, minutes: m, period: detectedPeriod };
  }
  // No period typed — try to infer
  if (h >= 0 && h <= 23) {
    const { period } = to12h(h);
    return { hours: h, minutes: m, period };
  }
  return null;
}

/** Generate list of time options */
function generateTimeOptions(
  stepMinutes: number,
  hourCycle: 12 | 24,
  min?: { hours: number; minutes: number },
  max?: { hours: number; minutes: number },
): Array<{ h24: number; m: number; label: string; disabled: boolean }> {
  const options: Array<{
    h24: number;
    m: number;
    label: string;
    disabled: boolean;
  }> = [];
  for (let totalMin = 0; totalMin < 24 * 60; totalMin += stepMinutes) {
    const h24 = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    const inRange = isTimeInRange(h24, m, min, max);
    options.push({
      h24,
      m,
      label: formatOptionLabel(h24, m, hourCycle),
      disabled: !inRange,
    });
  }
  return options;
}

// =============================================================================
// Component
// =============================================================================

export const TimePicker = forwardRef<HTMLDivElement, TimePickerProps>(
  function TimePicker(props, ref) {
    const {
      label,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      value: controlledValue,
      defaultValue,
      onChange,
      hourCycle = 12,
      stepMinutes = 30,
      minTime,
      maxTime,
      allowFreeInput = true,
      showPicker = true,
      hint,
      error,
      placeholder,
      name,
      disabled = false,
      required = false,
      onOpenChange,
      unstyled = false,
      className,
      style,
    } = props;

    // ---- IDs ----
    const baseId = useId('time-picker');
    const inputId = `${baseId}-input`;
    const listboxId = `${baseId}-listbox`;
    const hintId = `${baseId}-hint`;
    const errorId = `${baseId}-error`;
    const labelId = `${baseId}-label`;

    // ---- Announcer ----
    const { announce } = useAnnouncer();

    // ---- Dev warnings ----
    if (process.env.NODE_ENV !== 'production') {
      if (!label && !ariaLabel && !ariaLabelledBy) {
        warn.warning(
          'TimePicker requires an accessible label.',
          'Add label, aria-label, or aria-labelledby.',
        );
      }
    }

    // ---- State ----
    const [uncontrolledValue, setUncontrolledValue] = useState<
      TimePickerValue | undefined
    >(defaultValue);
    const resolved = controlledValue ?? uncontrolledValue;

    const [inputText, setInputText] = useState(() =>
      resolved ? formatTime(resolved, hourCycle) : '',
    );
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [validationError, setValidationError] = useState<string | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);
    const listboxRef = useRef<HTMLUListElement>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    // ---- Time options ----
    const timeOptions = useMemo(
      () => generateTimeOptions(stepMinutes, hourCycle, minTime, maxTime),
      [stepMinutes, hourCycle, minTime, maxTime],
    );

    // Filter options based on input text (when typing)
    const filteredOptions = useMemo(() => {
      if (!inputText.trim()) return timeOptions;
      const lower = inputText.trim().toLowerCase();
      return timeOptions.filter((opt) =>
        opt.label.toLowerCase().includes(lower),
      );
    }, [timeOptions, inputText]);

    // ---- Derived ----
    const displayError = error ?? validationError;
    const hasError = !!displayError;
    const autoHint =
      hint ??
      (hourCycle === 24 ? 'Format: HH:MM (24h)' : 'Format: H:MM AM/PM');

    const describedBy = [
      autoHint ? hintId : null,
      hasError ? errorId : null,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

    const labelledBy = ariaLabelledBy
      ? ariaLabelledBy
      : label
        ? labelId
        : undefined;

    // ---- Commit value ----
    const commitValue = useCallback(
      (val: TimePickerValue) => {
        setValidationError(null);

        // Check constraints
        const h24 =
          val.period !== undefined
            ? to24h(
                val.hours <= 12 ? val.hours : val.hours,
                val.period,
              )
            : val.hours;
        if (!isTimeInRange(h24, val.minutes, minTime, maxTime)) {
          const minLabel = minTime
            ? formatOptionLabel(minTime.hours, minTime.minutes, hourCycle)
            : '';
          const maxLabel = maxTime
            ? formatOptionLabel(maxTime.hours, maxTime.minutes, hourCycle)
            : '';
          const msg =
            minTime && maxTime
              ? `Enter a time between ${minLabel} and ${maxLabel}.`
              : minTime
                ? `Enter a time after ${minLabel}.`
                : `Enter a time before ${maxLabel}.`;
          setValidationError(msg);
          return;
        }

        // Normalize to 24h internally
        const normalized: TimePickerValue = {
          hours: h24,
          minutes: val.minutes,
          ...(hourCycle === 12 ? { period: to12h(h24).period } : {}),
        };

        if (controlledValue === undefined) {
          setUncontrolledValue(normalized);
        }
        setInputText(formatTime(normalized, hourCycle));
        onChange?.(normalized);
      },
      [controlledValue, onChange, hourCycle, minTime, maxTime],
    );

    // ---- Sync controlled value to display ----
    useEffect(() => {
      if (controlledValue) {
        setInputText(formatTime(controlledValue, hourCycle));
        setValidationError(null);
      }
    }, [controlledValue, hourCycle]);

    // ---- Open/close ----
    const open = useCallback(() => {
      if (disabled) return;
      setIsOpen(true);
      onOpenChange?.(true);

      // Try to highlight current value
      if (resolved) {
        const h24 =
          resolved.period !== undefined
            ? to24h(resolved.hours <= 12 ? resolved.hours : resolved.hours, resolved.period)
            : resolved.hours;
        const idx = timeOptions.findIndex(
          (o) => o.h24 === h24 && o.m === resolved.minutes,
        );
        setHighlightedIndex(idx >= 0 ? idx : 0);
      } else {
        setHighlightedIndex(0);
      }

      announce(
        `${filteredOptions.length} time${filteredOptions.length === 1 ? '' : 's'} available`,
      );
    }, [disabled, onOpenChange, resolved, timeOptions, filteredOptions.length, announce]);

    const close = useCallback(() => {
      setIsOpen(false);
      setHighlightedIndex(-1);
      onOpenChange?.(false);
    }, [onOpenChange]);

    // ---- Outside click ----
    useEffect(() => {
      if (!isOpen) return;
      const handler = (e: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target as Node)
        ) {
          close();
        }
      };
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }, [isOpen, close]);

    // ---- Select an option ----
    const selectOption = useCallback(
      (opt: { h24: number; m: number; label: string; disabled: boolean }) => {
        if (opt.disabled) return;
        const val: TimePickerValue = {
          hours: opt.h24,
          minutes: opt.m,
          ...(hourCycle === 12 ? { period: to12h(opt.h24).period } : {}),
        };
        commitValue(val);
        close();
        announce(`${opt.label} selected`);
        inputRef.current?.focus();
      },
      [hourCycle, commitValue, close, announce],
    );

    // ---- Clear ----
    const handleClear = useCallback(() => {
      setInputText('');
      setValidationError(null);
      if (controlledValue === undefined) {
        setUncontrolledValue(undefined);
      }
      onChange?.(undefined as unknown as TimePickerValue);
      close();
      inputRef.current?.focus();
    }, [controlledValue, onChange, close]);

    // ---- Input handlers ----
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setInputText(val);
      setValidationError(null);
      if (showPicker && !isOpen && val.length > 0) {
        open();
      }
      // Reset highlight to match filtered
      setHighlightedIndex(0);
    };

    const handleBlur = (e: React.FocusEvent) => {
      // Don't close if focus moves within the container
      if (
        containerRef.current &&
        containerRef.current.contains(e.relatedTarget as Node)
      ) {
        return;
      }
      // Commit typed value
      if (inputText.trim() && allowFreeInput) {
        const parsed = parseTimeInput(inputText, hourCycle);
        if (parsed) {
          commitValue(parsed);
        } else {
          setValidationError(
            hourCycle === 24
              ? 'Enter a valid time in HH:MM format.'
              : 'Enter a valid time in H:MM AM/PM format.',
          );
        }
      }
      close();
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          if (!isOpen) {
            open();
          } else {
            // Move to next non-disabled
            let next = highlightedIndex;
            for (let i = 0; i < filteredOptions.length; i++) {
              next = (next + 1) % filteredOptions.length;
              if (!filteredOptions[next]?.disabled) break;
            }
            setHighlightedIndex(next);
          }
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          if (!isOpen) {
            open();
          } else {
            let prev = highlightedIndex;
            for (let i = 0; i < filteredOptions.length; i++) {
              prev =
                (prev - 1 + filteredOptions.length) % filteredOptions.length;
              if (!filteredOptions[prev]?.disabled) break;
            }
            setHighlightedIndex(prev);
          }
          break;
        }
        case 'Enter': {
          e.preventDefault();
          if (isOpen && highlightedIndex >= 0) {
            const opt = filteredOptions[highlightedIndex];
            if (opt && !opt.disabled) {
              selectOption(opt);
            }
          } else if (inputText.trim() && allowFreeInput) {
            const parsed = parseTimeInput(inputText, hourCycle);
            if (parsed) {
              commitValue(parsed);
            } else {
              setValidationError(
                hourCycle === 24
                  ? 'Enter a valid time in HH:MM format.'
                  : 'Enter a valid time in H:MM AM/PM format.',
              );
            }
          }
          break;
        }
        case 'Escape': {
          if (isOpen) {
            e.preventDefault();
            close();
          }
          break;
        }
        case 'Tab': {
          if (isOpen) {
            close();
          }
          // Allow default tab
          break;
        }
        case 'Home': {
          if (isOpen) {
            e.preventDefault();
            // Find first non-disabled
            const first = filteredOptions.findIndex((o) => !o.disabled);
            if (first >= 0) setHighlightedIndex(first);
          }
          break;
        }
        case 'End': {
          if (isOpen) {
            e.preventDefault();
            // Find last non-disabled
            for (let i = filteredOptions.length - 1; i >= 0; i--) {
              if (!filteredOptions[i]?.disabled) {
                setHighlightedIndex(i);
                break;
              }
            }
          }
          break;
        }
      }
    };

    // ---- Scroll highlighted into view ----
    useEffect(() => {
      if (
        isOpen &&
        highlightedIndex >= 0 &&
        listboxRef.current
      ) {
        const items = listboxRef.current.querySelectorAll('[role="option"]');
        const item = items[highlightedIndex] as HTMLElement | undefined;
        item?.scrollIntoView({ block: 'nearest' });
      }
    }, [isOpen, highlightedIndex]);

    // ---- Listbox position (above/below) ----
    const [position, setPosition] = useState<'bottom' | 'top'>('bottom');
    useLayoutEffect(() => {
      if (isOpen && listboxRef.current) {
        const rect = listboxRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.top;
        if (spaceBelow < 220 && rect.top > spaceBelow) {
          setPosition('top');
        } else {
          setPosition('bottom');
        }
      }
    }, [isOpen]);

    // ---- Option ID helper ----
    const getOptionId = (index: number) => `${baseId}-option-${index}`;

    const activeDescendant =
      isOpen && highlightedIndex >= 0
        ? getOptionId(highlightedIndex)
        : undefined;

    // ---- Styles ----
    const containerStyle: React.CSSProperties = unstyled
      ? {}
      : { position: 'relative', display: 'inline-block' };

    const inputStyle: React.CSSProperties = unstyled
      ? {}
      : { padding: '0.5rem', minWidth: '10rem' };

    const triggerBtnStyle: React.CSSProperties = unstyled
      ? {}
      : {
          padding: '0.5rem',
          minWidth: 44,
          minHeight: 44,
          cursor: disabled ? 'default' : 'pointer',
        };

    const listboxStyle: React.CSSProperties = unstyled
      ? {}
      : {
          position: 'absolute',
          left: 0,
          right: 0,
          zIndex: 100,
          maxHeight: '12rem',
          overflowY: 'auto',
          margin: 0,
          padding: 0,
          listStyle: 'none',
          background: 'var(--compa11y-time-picker-listbox-bg, #fff)',
          border: '1px solid var(--compa11y-time-picker-listbox-border, #ccc)',
          borderRadius: 'var(--compa11y-time-picker-listbox-radius, 4px)',
          boxShadow:
            'var(--compa11y-time-picker-listbox-shadow, 0 4px 12px rgba(0,0,0,0.15))',
          ...(position === 'top'
            ? { bottom: '100%', marginBottom: 4 }
            : { top: '100%', marginTop: 4 }),
        };

    const optionStyle = (
      highlighted: boolean,
      selected: boolean,
      isDisabled: boolean,
    ): React.CSSProperties =>
      unstyled
        ? {}
        : {
            padding: '0.5rem 0.75rem',
            cursor: isDisabled ? 'default' : 'pointer',
            opacity: isDisabled ? 0.5 : 1,
            background: highlighted
              ? 'var(--compa11y-time-picker-option-highlight-bg, #e8f0fe)'
              : selected
                ? 'var(--compa11y-time-picker-option-selected-bg, #f0f0f0)'
                : 'transparent',
            fontWeight: selected ? 600 : 'normal',
          };

    return (
      <div
        ref={(node) => {
          containerRef.current = node;
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (ref as any).current = node;
          }
        }}
        data-compa11y-time-picker
        data-disabled={disabled || undefined}
        data-invalid={hasError || undefined}
        className={className}
        style={{ ...containerStyle, ...style }}
      >
        {/* Label */}
        {label && (
          <label
            id={labelId}
            htmlFor={inputId}
            data-compa11y-time-picker-label
            style={unstyled ? {} : { display: 'block', fontWeight: 600, marginBottom: '0.25rem' }}
          >
            {label}
            {required && (
              <span aria-hidden="true" style={{ color: 'red', marginLeft: 2 }}>
                *
              </span>
            )}
          </label>
        )}

        {/* Hint */}
        {autoHint && (
          <div
            id={hintId}
            data-compa11y-time-picker-hint
            style={
              unstyled
                ? {}
                : {
                    fontSize: '0.8125rem',
                    color: 'var(--compa11y-time-picker-hint-color, #666)',
                    marginBottom: '0.25rem',
                  }
            }
          >
            {autoHint}
          </div>
        )}

        {/* Input row */}
        <div
          data-compa11y-time-picker-field
          style={unstyled ? {} : { display: 'flex', alignItems: 'center', gap: '0.25rem' }}
        >
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            role="combobox"
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            onBlur={handleBlur}
            onFocus={() => {
              if (showPicker && !isOpen) open();
            }}
            placeholder={
              placeholder ??
              (hourCycle === 24 ? 'HH:MM' : 'H:MM AM/PM')
            }
            disabled={disabled}
            required={required}
            name={name}
            autoComplete="off"
            aria-expanded={isOpen}
            aria-controls={isOpen ? listboxId : undefined}
            aria-activedescendant={activeDescendant}
            aria-haspopup="listbox"
            aria-autocomplete={allowFreeInput ? 'list' : 'none'}
            aria-invalid={hasError || undefined}
            aria-describedby={describedBy}
            aria-label={ariaLabel}
            aria-labelledby={labelledBy}
            data-compa11y-time-picker-input
            style={inputStyle}
          />

          {/* Clear button */}
          {inputText && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear time"
              tabIndex={-1}
              data-compa11y-time-picker-clear
              style={
                unstyled
                  ? {}
                  : {
                      padding: '0.25rem 0.5rem',
                      cursor: 'pointer',
                      background: 'transparent',
                      border: 'none',
                      fontSize: '1.125rem',
                      lineHeight: 1,
                    }
              }
            >
              ×
            </button>
          )}

          {/* Trigger button */}
          {showPicker && (
            <button
              type="button"
              onClick={() => {
                if (isOpen) {
                  close();
                } else {
                  open();
                  inputRef.current?.focus();
                }
              }}
              disabled={disabled}
              aria-label="Choose time"
              aria-expanded={isOpen}
              aria-controls={isOpen ? listboxId : undefined}
              data-compa11y-time-picker-trigger
              style={triggerBtnStyle}
            >
              <svg
                aria-hidden="true"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="8" cy="8" r="6.5" />
                <path d="M8 4v4l2.5 2.5" />
              </svg>
            </button>
          )}
        </div>

        {/* Listbox popup */}
        {isOpen && (
          <ul
            ref={listboxRef}
            id={listboxId}
            role="listbox"
            aria-labelledby={labelledBy ?? undefined}
            aria-label={!labelledBy ? (ariaLabel ?? label ?? 'Time options') : undefined}
            data-compa11y-time-picker-listbox
            data-position={position}
            style={listboxStyle}
          >
            {filteredOptions.length === 0 ? (
              <li
                role="presentation"
                data-compa11y-time-picker-empty
                style={unstyled ? {} : { padding: '0.5rem 0.75rem', color: '#666' }}
              >
                No matching times
              </li>
            ) : (
              filteredOptions.map((opt, index) => {
                const isHighlighted = index === highlightedIndex;
                const isSelected =
                  resolved !== undefined &&
                  ((resolved.period !== undefined
                    ? to24h(resolved.hours <= 12 ? resolved.hours : resolved.hours, resolved.period)
                    : resolved.hours) === opt.h24 &&
                    resolved.minutes === opt.m);

                return (
                  <li
                    key={`${opt.h24}-${opt.m}`}
                    id={getOptionId(index)}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={opt.disabled || undefined}
                    data-highlighted={isHighlighted || undefined}
                    data-selected={isSelected || undefined}
                    data-disabled={opt.disabled || undefined}
                    onClick={() => selectOption(opt)}
                    onMouseEnter={() => {
                      if (!opt.disabled) setHighlightedIndex(index);
                    }}
                    data-compa11y-time-picker-option
                    style={optionStyle(isHighlighted, isSelected, opt.disabled)}
                  >
                    {opt.label}
                  </li>
                );
              })
            )}
          </ul>
        )}

        {/* Error message */}
        {hasError && (
          <div
            id={errorId}
            role="alert"
            data-compa11y-time-picker-error
            style={
              unstyled
                ? {}
                : {
                    color: 'var(--compa11y-time-picker-error-color, #d32f2f)',
                    fontSize: '0.8125rem',
                    marginTop: '0.25rem',
                  }
            }
          >
            {displayError}
          </div>
        )}

        {/* Hidden input for form submission */}
        {name && resolved && (
          <input
            type="hidden"
            name={name}
            value={formatTime(resolved, 24)}
          />
        )}
      </div>
    );
  },
);
