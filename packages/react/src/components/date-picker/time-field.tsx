/**
 * Standalone TimeField component.
 *
 * Can be used inside DatePicker or independently.
 *
 * @example
 * ```tsx
 * // Standalone
 * <TimeField
 *   hours={14}
 *   minutes={30}
 *   onHoursChange={setHours}
 *   onMinutesChange={setMinutes}
 *   hourCycle={24}
 *   label="Meeting time"
 * />
 *
 * // 12-hour with AM/PM
 * <TimeField
 *   hours={2}
 *   minutes={0}
 *   period="PM"
 *   onHoursChange={setH}
 *   onMinutesChange={setM}
 *   onPeriodChange={setP}
 *   hourCycle={12}
 *   label="Alarm"
 * />
 * ```
 */

import React, { forwardRef } from 'react';
import { useId } from '../../hooks/use-id';
import { createComponentWarnings } from '@compa11y/core';

const warnings = createComponentWarnings('TimeField');

const srOnlyStyle: React.CSSProperties = {
  position: 'absolute',
  width: 1, height: 1, padding: 0, margin: -1,
  overflow: 'hidden', clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap', border: 0,
};

export interface TimeFieldProps {
  /** Current hour value */
  hours: number;
  /** Current minute value */
  minutes: number;
  /** AM/PM for 12-hour mode */
  period?: 'AM' | 'PM';
  /** Called when hours change */
  onHoursChange: (h: number) => void;
  /** Called when minutes change */
  onMinutesChange: (m: number) => void;
  /** Called when period changes (12h mode) */
  onPeriodChange?: (p: 'AM' | 'PM') => void;
  /** 12-hour or 24-hour */
  hourCycle?: 12 | 24;
  /** Accessible label */
  label?: string;
  /** Accessible label via aria-label */
  'aria-label'?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Remove default styles */
  unstyled?: boolean;
  /** CSS class */
  className?: string;
  /** CSS styles */
  style?: React.CSSProperties;
}

export const TimeField = forwardRef<HTMLFieldSetElement, TimeFieldProps>(
  function TimeField(
    {
      hours,
      minutes,
      period = 'AM',
      onHoursChange,
      onMinutesChange,
      onPeriodChange,
      hourCycle = 12,
      label,
      'aria-label': ariaLabel,
      disabled = false,
      unstyled = false,
      className,
      style,
    },
    ref,
  ) {
    const baseId = useId('time-field');

    if (process.env.NODE_ENV !== 'production') {
      if (!label && !ariaLabel) {
        warnings.warning('TimeField requires an accessible label.', 'Add a label or aria-label prop.');
      }
    }

    const maxH = hourCycle === 24 ? 23 : 12;
    const minH = hourCycle === 24 ? 0 : 1;

    const displayHour = hourCycle === 12
      ? (hours > 12 ? hours - 12 : hours === 0 ? 12 : hours)
      : hours;

    const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value, 10);
      if (!isNaN(val)) onHoursChange(Math.max(minH, Math.min(maxH, val)));
    };

    const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value, 10);
      if (!isNaN(val)) onMinutesChange(Math.max(0, Math.min(59, val)));
    };

    const handleHourKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowUp') { e.preventDefault(); onHoursChange(Math.min(maxH, hours + 1)); }
      if (e.key === 'ArrowDown') { e.preventDefault(); onHoursChange(Math.max(minH, hours - 1)); }
      if (e.key === 'Home') { e.preventDefault(); onHoursChange(minH); }
      if (e.key === 'End') { e.preventDefault(); onHoursChange(maxH); }
    };

    const handleMinuteKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowUp') { e.preventDefault(); onMinutesChange(Math.min(59, minutes + 1)); }
      if (e.key === 'ArrowDown') { e.preventDefault(); onMinutesChange(Math.max(0, minutes - 1)); }
      if (e.key === 'Home') { e.preventDefault(); onMinutesChange(0); }
      if (e.key === 'End') { e.preventDefault(); onMinutesChange(59); }
    };

    const containerStyle: React.CSSProperties = unstyled
      ? {}
      : { display: 'flex', alignItems: 'center', gap: '0.25rem' };

    const inputStyle: React.CSSProperties = unstyled
      ? {}
      : { width: '3rem', textAlign: 'center' as const, padding: '0.25rem' };

    return (
      <fieldset
        ref={ref}
        data-compa11y-time-field
        data-disabled={disabled || undefined}
        className={className}
        style={{ border: 'none', padding: 0, margin: 0, ...style }}
      >
        <legend style={label ? { fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' } : srOnlyStyle}>
          {label ?? ariaLabel ?? 'Time'}
        </legend>
        <div style={containerStyle}>
          <label htmlFor={`${baseId}-hour`} style={srOnlyStyle}>Hour</label>
          <input
            id={`${baseId}-hour`}
            type="text"
            inputMode="numeric"
            value={String(displayHour).padStart(2, '0')}
            onChange={handleHourChange}
            onKeyDown={handleHourKeyDown}
            disabled={disabled}
            aria-label="Hour"
            style={inputStyle}
            data-compa11y-time-field-hour
          />
          <span aria-hidden="true">:</span>
          <label htmlFor={`${baseId}-minute`} style={srOnlyStyle}>Minute</label>
          <input
            id={`${baseId}-minute`}
            type="text"
            inputMode="numeric"
            value={String(minutes).padStart(2, '0')}
            onChange={handleMinuteChange}
            onKeyDown={handleMinuteKeyDown}
            disabled={disabled}
            aria-label="Minute"
            style={inputStyle}
            data-compa11y-time-field-minute
          />
          {hourCycle === 12 && (
            <div role="group" aria-label="AM/PM" style={{ display: 'flex', gap: '0.125rem' }}>
              <button
                type="button"
                aria-pressed={period === 'AM'}
                onClick={() => onPeriodChange?.('AM')}
                disabled={disabled}
                data-compa11y-time-field-period
                style={unstyled ? {} : { padding: '0.25rem 0.5rem', minHeight: 44 }}
              >
                AM
              </button>
              <button
                type="button"
                aria-pressed={period === 'PM'}
                onClick={() => onPeriodChange?.('PM')}
                disabled={disabled}
                data-compa11y-time-field-period
                style={unstyled ? {} : { padding: '0.25rem 0.5rem', minHeight: 44 }}
              >
                PM
              </button>
            </div>
          )}
        </div>
      </fieldset>
    );
  },
);
