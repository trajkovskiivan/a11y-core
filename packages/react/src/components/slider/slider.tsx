import React, { forwardRef, useCallback, useRef, useState } from 'react';
import { useId } from '../../hooks/use-id';
import { createComponentWarnings } from '@compa11y/core';

const warn = createComponentWarnings('Slider');

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

const srOnlyStyle: React.CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(Math.max(v, lo), hi);
}

function snap(raw: number, min: number, step: number): number {
  if (step <= 0) return raw;
  return Math.round((raw - min) / step) * step + min;
}

// --------------------------------------------------------------------------
// Props
// --------------------------------------------------------------------------

export interface SliderProps {
  /**
   * Visible label rendered above the slider.
   * Either `label`, `ariaLabel`, or `ariaLabelledBy` is required.
   */
  label?: string;
  /**
   * `aria-label` placed directly on the thumb.
   * Use when you don't want a visible label element.
   */
  ariaLabel?: string;
  /**
   * `aria-labelledby` pointing to an existing element's id.
   */
  ariaLabelledBy?: string;

  // ── Single-thumb ─────────────────────────────────────────────────────────
  /** Controlled value (single-thumb mode). */
  value?: number;
  /** Uncontrolled starting value. @default 0 */
  defaultValue?: number;
  /** Called when the value changes (single-thumb mode). */
  onValueChange?: (value: number) => void;

  // ── Range (two-thumb) mode ────────────────────────────────────────────────
  /** Enable range mode — renders two thumbs. */
  range?: boolean;
  /** Controlled values `[min, max]` (range mode). */
  values?: [number, number];
  /** Uncontrolled starting values (range mode). */
  defaultValues?: [number, number];
  /** Called when values change (range mode). */
  onValuesChange?: (values: [number, number]) => void;
  /**
   * Accessible label for the lower thumb.
   * Example: "Minimum price"
   * Strongly recommended for range sliders.
   */
  minThumbLabel?: string;
  /**
   * Accessible label for the upper thumb.
   * Example: "Maximum price"
   * Strongly recommended for range sliders.
   */
  maxThumbLabel?: string;

  // ── Range / behaviour ─────────────────────────────────────────────────────
  /** Minimum allowed value. @default 0 */
  min?: number;
  /** Maximum allowed value. @default 100 */
  max?: number;
  /** Arrow-key step size. @default 1 */
  step?: number;
  /** Page Up / Page Down step size. @default max(10 × step, (max-min)/10) */
  largeStep?: number;
  /** Disable all interaction. */
  disabled?: boolean;
  /**
   * Maps a numeric value to a human-readable string for `aria-valuetext`.
   * Use when the raw number is not meaningful on its own.
   * Example: `(v) => `${v}%``
   */
  valueText?: (value: number) => string;
  /** Track orientation. @default 'horizontal' */
  orientation?: 'horizontal' | 'vertical';

  // ── Styling ───────────────────────────────────────────────────────────────
  /** Strip `data-compa11y-*` attributes so you can apply your own styles. */
  unstyled?: boolean;
  /** Class applied to the root element. */
  className?: string;
  /** Style applied to the root element. */
  style?: React.CSSProperties;
}

// --------------------------------------------------------------------------
// Component
// --------------------------------------------------------------------------

export const Slider = forwardRef<HTMLDivElement, SliderProps>(function Slider(
  {
    label,
    ariaLabel,
    ariaLabelledBy,
    value: controlledValue,
    defaultValue = 0,
    onValueChange,
    range = false,
    values: controlledValues,
    defaultValues,
    onValuesChange,
    minThumbLabel,
    maxThumbLabel,
    min = 0,
    max = 100,
    step = 1,
    largeStep,
    disabled = false,
    valueText,
    orientation = 'horizontal',
    unstyled = false,
    className = '',
    style,
  },
  ref,
) {
  const id = useId('slider');
  const labelId = `${id}-label`;
  const isVertical = orientation === 'vertical';
  const resolvedLargeStep =
    largeStep ?? clamp(Math.round((max - min) / 10), step, max - min);

  // ── Single-thumb state ────────────────────────────────────────────────────
  const [uncontrolledSingle, setUncontrolledSingle] = useState(() =>
    clamp(defaultValue, min, max),
  );
  const singleValue =
    controlledValue !== undefined
      ? clamp(controlledValue, min, max)
      : uncontrolledSingle;

  // ── Range-thumb state ─────────────────────────────────────────────────────
  const resolvedDefaultValues: [number, number] = defaultValues ?? [min, max];
  const [uncontrolledRange, setUncontrolledRange] = useState<[number, number]>(
    () => [
      clamp(resolvedDefaultValues[0], min, max),
      clamp(resolvedDefaultValues[1], min, max),
    ],
  );
  const rangeValues: [number, number] =
    controlledValues !== undefined
      ? [clamp(controlledValues[0], min, max), clamp(controlledValues[1], min, max)]
      : uncontrolledRange;

  // ── Focus state (drives inline focus ring since inline styles override :focus-visible) ──
  const [focusedThumb, setFocusedThumb] = useState<0 | 1 | null>(null);

  // ── Live region ───────────────────────────────────────────────────────────
  const [liveMessage, setLiveMessage] = useState('');
  const liveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pushAnnouncement = useCallback((message: string) => {
    if (liveTimerRef.current !== null) clearTimeout(liveTimerRef.current);
    setLiveMessage(message);
    liveTimerRef.current = setTimeout(() => setLiveMessage(''), 1000);
  }, []);

  // ── Refs ──────────────────────────────────────────────────────────────────
  const trackRef = useRef<HTMLDivElement>(null);
  const activeThumbRef = useRef<0 | 1 | null>(null);

  // ── Dev warnings ──────────────────────────────────────────────────────────
  if (process.env.NODE_ENV !== 'production') {
    if (!label && !ariaLabel && !ariaLabelledBy) {
      warn.error(
        'Slider requires an accessible label.',
        'Add a label prop, ariaLabel, or ariaLabelledBy.',
      );
    }
    if (range && (!minThumbLabel || !maxThumbLabel)) {
      warn.warning(
        'Range sliders should have minThumbLabel and maxThumbLabel.',
        'Example: minThumbLabel="Minimum price" maxThumbLabel="Maximum price".',
      );
    }
    if (min >= max) {
      warn.error(`Slider min (${min}) must be less than max (${max}).`);
    }
  }

  // ── Value helpers ─────────────────────────────────────────────────────────
  const toPercent = (v: number): number =>
    ((clamp(v, min, max) - min) / (max - min)) * 100;

  const fromPointer = useCallback(
    (clientX: number, clientY: number): number => {
      const track = trackRef.current;
      if (!track) return min;
      const rect = track.getBoundingClientRect();
      const pct = isVertical
        ? 1 - (clientY - rect.top) / rect.height
        : (clientX - rect.left) / rect.width;
      return clamp(snap(clamp(pct, 0, 1) * (max - min) + min, min, step), min, max);
    },
    [isVertical, min, max, step],
  );

  // ── Update helpers ────────────────────────────────────────────────────────
  const commitSingle = useCallback(
    (raw: number) => {
      const next = clamp(snap(raw, min, step), min, max);
      if (controlledValue === undefined) setUncontrolledSingle(next);
      onValueChange?.(next);
      pushAnnouncement(valueText ? valueText(next) : String(next));
    },
    [controlledValue, min, max, step, onValueChange, valueText, pushAnnouncement],
  );

  const commitRange = useCallback(
    (raw: number, thumbIdx: 0 | 1, currentRange: [number, number]) => {
      const next: [number, number] = [currentRange[0], currentRange[1]];
      if (thumbIdx === 0) {
        next[0] = clamp(snap(raw, min, step), min, next[1]);
      } else {
        next[1] = clamp(snap(raw, min, step), next[0], max);
      }
      if (controlledValues === undefined) setUncontrolledRange(next);
      onValuesChange?.(next);
      const loText = valueText ? valueText(next[0]) : String(next[0]);
      const hiText = valueText ? valueText(next[1]) : String(next[1]);
      pushAnnouncement(`${loText} to ${hiText}`);
    },
    [controlledValues, min, max, step, onValuesChange, valueText, pushAnnouncement],
  );

  // ── Keyboard ──────────────────────────────────────────────────────────────
  const handleThumbKeyDown = useCallback(
    (thumbIdx: 0 | 1) =>
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (disabled) return;
        const current = range
          ? thumbIdx === 0
            ? rangeValues[0]
            : rangeValues[1]
          : singleValue;

        const update = (v: number) => {
          e.preventDefault();
          if (range) commitRange(v, thumbIdx, rangeValues);
          else commitSingle(v);
        };

        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') return update(current + step);
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') return update(current - step);
        if (e.key === 'Home') return update(min);
        if (e.key === 'End') return update(max);
        if (e.key === 'PageUp') return update(current + resolvedLargeStep);
        if (e.key === 'PageDown') return update(current - resolvedLargeStep);
      },
    [
      disabled,
      range,
      rangeValues,
      singleValue,
      step,
      resolvedLargeStep,
      min,
      max,
      commitSingle,
      commitRange,
    ],
  );

  // ── Pointer drag on thumb ─────────────────────────────────────────────────
  const handleThumbPointerDown = useCallback(
    (thumbIdx: 0 | 1) =>
      (e: React.PointerEvent<HTMLDivElement>) => {
        if (disabled) return;
        e.stopPropagation(); // prevent track from also reacting
        e.currentTarget.setPointerCapture(e.pointerId);
        activeThumbRef.current = thumbIdx;
      },
    [disabled],
  );

  const handleThumbPointerMove = useCallback(
    (thumbIdx: 0 | 1) =>
      (e: React.PointerEvent<HTMLDivElement>) => {
        if (disabled || activeThumbRef.current !== thumbIdx) return;
        const v = fromPointer(e.clientX, e.clientY);
        if (range) commitRange(v, thumbIdx, rangeValues);
        else commitSingle(v);
      },
    [disabled, range, fromPointer, commitSingle, commitRange, rangeValues],
  );

  const handleThumbPointerUp = useCallback(() => {
    activeThumbRef.current = null;
  }, []);

  // ── Track click ───────────────────────────────────────────────────────────
  const handleTrackPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (disabled) return;
      const v = fromPointer(e.clientX, e.clientY);
      if (!range) {
        commitSingle(v);
      } else {
        // Move whichever thumb is closer
        const distLo = Math.abs(v - rangeValues[0]);
        const distHi = Math.abs(v - rangeValues[1]);
        const thumbIdx: 0 | 1 = distLo <= distHi ? 0 : 1;
        commitRange(v, thumbIdx, rangeValues);
      }
    },
    [disabled, range, rangeValues, fromPointer, commitSingle, commitRange],
  );

  // ── Accessible names ──────────────────────────────────────────────────────
  // Each thumb gets an aria-label. For range mode, derive from dedicated props
  // or fall back to `${label} minimum` / `${label} maximum`.
  const baseLabel = ariaLabel ?? label;
  const thumb0Label = range
    ? (minThumbLabel ?? (baseLabel ? `${baseLabel} minimum` : 'Minimum'))
    : baseLabel;
  const thumb1Label = range
    ? (maxThumbLabel ?? (baseLabel ? `${baseLabel} maximum` : 'Maximum'))
    : undefined;

  // When only ariaLabelledBy is provided and no label/ariaLabel for single-thumb:
  const thumb0LabelledBy =
    !thumb0Label && ariaLabelledBy ? ariaLabelledBy : undefined;

  // ── Layout styles (used when not unstyled) ────────────────────────────────
  const trackStyle: React.CSSProperties = unstyled
    ? {}
    : isVertical
      ? {
          position: 'relative',
          width: 'var(--compa11y-slider-track-size, 4px)',
          height: 'var(--compa11y-slider-track-length, 160px)',
          borderRadius: '9999px',
          background: 'var(--compa11y-slider-track-bg, #e2e8f0)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          userSelect: 'none',
          touchAction: 'none',
        }
      : {
          position: 'relative',
          height: 'var(--compa11y-slider-track-size, 4px)',
          width: '100%',
          borderRadius: '9999px',
          background: 'var(--compa11y-slider-track-bg, #e2e8f0)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          userSelect: 'none',
          touchAction: 'none',
        };

  const fillStyle: React.CSSProperties = (() => {
    if (unstyled) return {};
    const base: React.CSSProperties = {
      position: 'absolute',
      background: disabled
        ? 'var(--compa11y-slider-fill-bg-disabled, #94a3b8)'
        : 'var(--compa11y-slider-fill-bg, #0066cc)',
      borderRadius: '9999px',
      pointerEvents: 'none',
    };
    if (isVertical) {
      const lo = range ? toPercent(rangeValues[0]) : 0;
      const hi = range ? toPercent(rangeValues[1]) : toPercent(singleValue);
      return { ...base, bottom: `${lo}%`, top: `${100 - hi}%`, left: 0, right: 0 };
    }
    const lo = range ? toPercent(rangeValues[0]) : 0;
    const hi = range ? toPercent(rangeValues[1]) : toPercent(singleValue);
    return { ...base, left: `${lo}%`, right: `${100 - hi}%`, top: 0, bottom: 0 };
  })();

  const makeThumbStyle = (pct: number, focused: boolean): React.CSSProperties => {
    if (unstyled) return {};
    const shared: React.CSSProperties = {
      position: 'absolute',
      width: 'var(--compa11y-slider-thumb-size, 20px)',
      height: 'var(--compa11y-slider-thumb-size, 20px)',
      borderRadius: '50%',
      background: disabled
        ? 'var(--compa11y-slider-thumb-bg-disabled, #cbd5e1)'
        : 'var(--compa11y-slider-thumb-bg, white)',
      border: `2px solid ${disabled ? 'var(--compa11y-slider-thumb-border-disabled, #94a3b8)' : 'var(--compa11y-slider-thumb-border, #0066cc)'}`,
      cursor: disabled ? 'not-allowed' : 'grab',
      touchAction: 'none',
      // Inline styles override :focus-visible, so we manage the ring in JS
      outline: focused ? '2px solid var(--compa11y-focus-color, #0066cc)' : 'none',
      outlineOffset: focused ? '3px' : undefined,
    };
    return isVertical
      ? { ...shared, left: '50%', bottom: `${pct}%`, transform: 'translate(-50%, 50%)' }
      : { ...shared, top: '50%', left: `${pct}%`, transform: 'translate(-50%, -50%)' };
  };

  const rootStyle: React.CSSProperties = unstyled
    ? {}
    : {
        display: 'inline-flex',
        flexDirection: isVertical ? 'row' : 'column',
        alignItems: isVertical ? 'flex-start' : 'stretch',
        gap: '8px',
        paddingBlock: isVertical ? 0 : '10px', // space for thumb overflow
        paddingInline: isVertical ? '10px' : 0,
      };

  const dataAttrs = unstyled
    ? {}
    : {
        'data-compa11y-slider': '',
        ...(disabled && { 'data-disabled': '' }),
        ...(isVertical && { 'data-vertical': '' }),
        ...(range && { 'data-range': '' }),
      };

  return (
    <div
      ref={ref}
      className={['compa11y-slider', className].filter(Boolean).join(' ')}
      style={{ ...rootStyle, ...style }}
      {...dataAttrs}
    >
      {/* Live region — always mounted before any value changes */}
      <div role="status" aria-live="polite" aria-atomic="true" style={srOnlyStyle}>
        {liveMessage}
      </div>

      {/* Visible label */}
      {label && (
        <label
          id={labelId}
          style={
            unstyled
              ? {}
              : { display: 'block', fontSize: '0.875rem', fontWeight: 500 }
          }
          {...(!unstyled && { 'data-compa11y-slider-label': '' })}
        >
          {label}
        </label>
      )}

      {/* Track */}
      <div
        ref={trackRef}
        style={trackStyle}
        onPointerDown={handleTrackPointerDown}
        {...(!unstyled && { 'data-compa11y-slider-track': '' })}
      >
        {/* Fill bar */}
        <div
          aria-hidden="true"
          style={fillStyle}
          {...(!unstyled && { 'data-compa11y-slider-fill': '' })}
        />

        {/* First (or only) thumb */}
        <div
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={range ? rangeValues[0] : singleValue}
          aria-valuetext={
            valueText
              ? valueText(range ? rangeValues[0] : singleValue)
              : undefined
          }
          aria-label={thumb0Label}
          aria-labelledby={!thumb0Label ? thumb0LabelledBy : undefined}
          aria-orientation={orientation}
          aria-disabled={disabled || undefined}
          style={makeThumbStyle(
            range ? toPercent(rangeValues[0]) : toPercent(singleValue),
            focusedThumb === 0,
          )}
          {...(!unstyled && { 'data-compa11y-slider-thumb': '' })}
          onFocus={() => setFocusedThumb(0)}
          onBlur={() => setFocusedThumb(null)}
          onKeyDown={handleThumbKeyDown(0)}
          onPointerDown={handleThumbPointerDown(0)}
          onPointerMove={handleThumbPointerMove(0)}
          onPointerUp={handleThumbPointerUp}
          onPointerCancel={handleThumbPointerUp}
        />

        {/* Second thumb (range mode only) */}
        {range && (
          <div
            role="slider"
            tabIndex={disabled ? -1 : 0}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={rangeValues[1]}
            aria-valuetext={valueText ? valueText(rangeValues[1]) : undefined}
            aria-label={thumb1Label}
            aria-orientation={orientation}
            aria-disabled={disabled || undefined}
            style={makeThumbStyle(toPercent(rangeValues[1]), focusedThumb === 1)}
            {...(!unstyled && { 'data-compa11y-slider-thumb': '', 'data-compa11y-slider-thumb-max': '' })}
            onFocus={() => setFocusedThumb(1)}
            onBlur={() => setFocusedThumb(null)}
            onKeyDown={handleThumbKeyDown(1)}
            onPointerDown={handleThumbPointerDown(1)}
            onPointerMove={handleThumbPointerMove(1)}
            onPointerUp={handleThumbPointerUp}
            onPointerCancel={handleThumbPointerUp}
          />
        )}
      </div>
    </div>
  );
});
