/**
 * Accessible ProgressBar component.
 *
 * Communicates the status of a task in progress to all users.
 * Supports determinate (known value) and indeterminate (unknown progress) modes.
 *
 * Role: progressbar — system reports status; user never sets the value.
 *       This is fundamentally different from a Slider.
 *
 * @example
 * // Determinate — announce at 25 %, 50 %, 75 %, 100 %
 * <ProgressBar
 *   label="Uploading invoice PDF"
 *   value={65}
 *   milestones={[25, 50, 75, 100]}
 *   statusText="Uploading 3 of 10 files…"
 * />
 *
 * // Indeterminate — progress unknown
 * <ProgressBar label="Loading reports" />
 *
 * // Complete
 * <ProgressBar
 *   label="File export"
 *   value={100}
 *   status="complete"
 *   statusText="Export ready — check your downloads"
 * />
 *
 * // Error
 * <ProgressBar
 *   label="Connection"
 *   value={30}
 *   status="error"
 *   statusText="Connection lost. Retry?"
 * />
 */

import React, { forwardRef, useEffect, useRef } from 'react';
import { useAnnouncer } from '../../hooks/use-announcer';
import { useId } from '../../hooks/use-id';
import { createComponentWarnings } from '@compa11y/core';

const warn = createComponentWarnings('ProgressBar');

// ---------------------------------------------------------------------------
// Indeterminate keyframes — injected once into <head> on first render
// ---------------------------------------------------------------------------

let _keyframesInjected = false;

function injectKeyframes() {
  if (_keyframesInjected || typeof document === 'undefined') return;
  _keyframesInjected = true;
  const style = document.createElement('style');
  style.dataset.compa11yProgressBar = '';
  style.textContent = `
    @keyframes compa11y-progress-indeterminate {
      0%   { transform: translateX(-100%); }
      100% { transform: translateX(350%);  }
    }
    @media (prefers-reduced-motion: reduce) {
      @keyframes compa11y-progress-indeterminate {
        0%, 100% { opacity: 0.4; }
        50%       { opacity: 1;   }
      }
    }
  `;
  document.head.appendChild(style);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ProgressBarStatus = 'active' | 'complete' | 'error';

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Visible label that describes what is progressing.
   * Also used as the accessible name — required.
   * Example: "Uploading invoice PDF", "Profile setup progress"
   */
  label: string;

  /**
   * Current progress value.
   * Omit (or pass `undefined`) for indeterminate mode — when you do not know
   * how far along the task is. Do not fake precision.
   */
  value?: number;

  /** Minimum value. @default 0 */
  min?: number;

  /** Maximum value. @default 100 */
  max?: number;

  /**
   * Maps the numeric value to a human-readable string for `aria-valuetext`.
   * Use when the raw number is not meaningful on its own.
   * Example: `(v) => \`${v} of 10 files uploaded\``
   */
  valueText?: (value: number, min: number, max: number) => string;

  /**
   * Show a visible value text (percentage or `valueText` result) beside the label.
   * Defaults to `true` when determinate, `false` when indeterminate.
   */
  showValue?: boolean;

  /**
   * Status of the operation.
   * - `'active'`   – task is in progress (default)
   * - `'complete'` – task finished successfully
   * - `'error'`    – task failed
   *
   * Transitioning to `'complete'` or `'error'` triggers a polite / assertive
   * screen-reader announcement automatically.
   */
  status?: ProgressBarStatus;

  /**
   * Optional visible status message shown below the track.
   * Useful for sighted users and cognitive accessibility.
   * Examples: "Uploading 3 of 10 files…", "Upload complete", "Connection lost. Retry?"
   */
  statusText?: string;

  /**
   * Announce when the value crosses any of these thresholds.
   * Example: `[25, 50, 75, 100]` → announces "Label: 25 %", …, "Label complete".
   * Only the first crossed threshold per change is announced to avoid noise.
   */
  milestones?: number[];

  /**
   * Override the label used in SR announcements.
   * Falls back to the `label` prop.
   */
  announceLabel?: string;

  /** Strip default styles so you can apply your own. */
  unstyled?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  function ProgressBar(
    {
      label,
      value,
      min = 0,
      max = 100,
      valueText,
      showValue,
      status = 'active',
      statusText,
      milestones,
      announceLabel,
      unstyled = false,
      className = '',
      style,
      ...props
    },
    ref
  ) {
    const id = useId('progress-bar');
    const labelId = `${id}-label`;
    const { polite, assertive } = useAnnouncer();

    const isIndeterminate = value === undefined;
    const clampedValue = isIndeterminate
      ? 0
      : Math.min(max, Math.max(min, value));
    const percentage = isIndeterminate
      ? 0
      : ((clampedValue - min) / (max - min)) * 100;
    const resolvedShowValue = showValue ?? !isIndeterminate;
    const displayText = valueText
      ? valueText(clampedValue, min, max)
      : `${Math.round(percentage)}%`;

    // Inject indeterminate keyframes once on first mount
    useEffect(() => {
      injectKeyframes();
    }, []);

    // ── Dev warnings ──────────────────────────────────────────────────────────
    if (process.env.NODE_ENV !== 'production') {
      if (!label) {
        warn.error(
          'ProgressBar requires a label prop.',
          'It is both the visible label and the accessible name for the progressbar.'
        );
      }
      if (!isIndeterminate && min >= max) {
        warn.error(
          `ProgressBar: min (${min}) must be less than max (${max}).`
        );
      }
      if (!isIndeterminate && (value! < min || value! > max)) {
        warn.warning(
          `ProgressBar: value (${value}) is outside [min=${min}, max=${max}]. It will be clamped.`
        );
      }
    }

    // ── Milestone announcements ───────────────────────────────────────────────
    // Only fire when value crosses a threshold going forward, not on mount.
    const prevValueRef = useRef<number | undefined>(undefined);

    useEffect(() => {
      if (isIndeterminate || !milestones?.length) return;

      const prev = prevValueRef.current;
      prevValueRef.current = clampedValue;

      if (prev === undefined) return; // first mount — do not announce

      const sorted = [...milestones].sort((a, b) => a - b);
      for (const m of sorted) {
        if (prev < m && clampedValue >= m) {
          const lbl = announceLabel ?? label;
          const pct = Math.round(((m - min) / (max - min)) * 100);
          const msg = m >= max ? `${lbl} complete` : `${lbl}: ${pct}%`;
          polite(msg);
          break; // one announcement per change
        }
      }
    }, [clampedValue, milestones, min, max, label, announceLabel, polite, isIndeterminate]);

    // ── Status change announcements ───────────────────────────────────────────
    const prevStatusRef = useRef<ProgressBarStatus | undefined>(undefined);

    useEffect(() => {
      if (prevStatusRef.current === status) return;
      prevStatusRef.current = status;

      const lbl = announceLabel ?? label;
      if (status === 'complete') polite(`${lbl} complete`);
      if (status === 'error')    assertive(`${lbl} failed`);
    }, [status, label, announceLabel, polite, assertive]);

    // ── Styles ────────────────────────────────────────────────────────────────

    const fillBg = unstyled
      ? undefined
      : status === 'error'
        ? 'var(--compa11y-progress-bar-fill-bg-error, #ef4444)'
        : status === 'complete'
          ? 'var(--compa11y-progress-bar-fill-bg-complete, #22c55e)'
          : 'var(--compa11y-progress-bar-fill-bg, #0066cc)';

    const rootStyle: React.CSSProperties = unstyled
      ? {}
      : { display: 'flex', flexDirection: 'column', gap: '6px' };

    const trackStyle: React.CSSProperties = unstyled
      ? {}
      : {
          position: 'relative',
          height: 'var(--compa11y-progress-bar-track-size, 8px)',
          width: '100%',
          borderRadius: '9999px',
          background: 'var(--compa11y-progress-bar-track-bg, #e2e8f0)',
          overflow: 'hidden',
        };

    const fillStyle: React.CSSProperties = unstyled
      ? {}
      : {
          position: 'absolute',
          inset: 0,
          borderRadius: '9999px',
          background: fillBg,
          width: isIndeterminate ? '40%' : `${Math.min(100, Math.max(0, percentage))}%`,
          transition: isIndeterminate ? 'none' : 'width 0.3s ease',
          animation: isIndeterminate
            ? 'compa11y-progress-indeterminate 1.5s ease-in-out infinite'
            : 'none',
        };

    const dataAttrs = unstyled
      ? {}
      : {
          'data-compa11y-progress-bar': '',
          'data-status': status,
          ...(isIndeterminate && { 'data-indeterminate': '' }),
        };

    return (
      <div
        ref={ref}
        className={['compa11y-progress-bar', className].filter(Boolean).join(' ')}
        style={{ ...rootStyle, ...style }}
        {...dataAttrs}
        {...props}
      >
        {/* Header row: label + optional value text */}
        <div
          style={
            unstyled
              ? undefined
              : {
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  gap: '0.5rem',
                }
          }
          {...(!unstyled && { 'data-compa11y-progress-bar-header': '' })}
        >
          <span
            id={labelId}
            style={
              unstyled
                ? undefined
                : { fontSize: '0.875rem', fontWeight: 500 }
            }
            {...(!unstyled && { 'data-compa11y-progress-bar-label': '' })}
          >
            {label}
          </span>

          {resolvedShowValue && !isIndeterminate && (
            <span
              aria-hidden="true"
              style={
                unstyled
                  ? undefined
                  : {
                      fontSize: '0.8125rem',
                      color: 'var(--compa11y-progress-bar-value-color, #555)',
                      whiteSpace: 'nowrap',
                    }
              }
              {...(!unstyled && { 'data-compa11y-progress-bar-value': '' })}
            >
              {displayText}
            </span>
          )}
        </div>

        {/* Track — carries role="progressbar" semantics */}
        <div
          role="progressbar"
          aria-labelledby={labelId}
          aria-valuemin={isIndeterminate ? undefined : min}
          aria-valuemax={isIndeterminate ? undefined : max}
          aria-valuenow={isIndeterminate ? undefined : clampedValue}
          aria-valuetext={
            !isIndeterminate && valueText
              ? valueText(clampedValue, min, max)
              : undefined
          }
          style={trackStyle}
          {...(!unstyled && { 'data-compa11y-progress-bar-track': '' })}
        >
          <div
            aria-hidden="true"
            style={fillStyle}
            {...(!unstyled && { 'data-compa11y-progress-bar-fill': '' })}
          />
        </div>

        {/* Optional visible status message */}
        {statusText && (
          <p
            aria-hidden="true"
            style={
              unstyled
                ? undefined
                : {
                    fontSize: '0.8125rem',
                    color:
                      status === 'error'
                        ? 'var(--compa11y-progress-bar-error-color, #ef4444)'
                        : 'var(--compa11y-progress-bar-status-color, #555)',
                    margin: 0,
                  }
            }
            {...(!unstyled && { 'data-compa11y-progress-bar-status': '' })}
          >
            {statusText}
          </p>
        )}
      </div>
    );
  }
);
