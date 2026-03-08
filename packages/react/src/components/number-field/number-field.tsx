/**
 * NumberField Component
 *
 * An accessible numeric input with optional stepper buttons, on-blur formatting,
 * and built-in min/max validation. Implements role="spinbutton" semantics.
 *
 * @example
 * // Basic
 * <NumberField label="Quantity" min={1} max={10} step={1} />
 *
 * // With steppers
 * <NumberField label="Guests" showSteppers min={1} max={12} />
 *
 * // With currency formatting
 * <NumberField
 *   label="Price"
 *   formatOptions={{ style: 'currency', currency: 'USD' }}
 *   min={0}
 *   step={0.01}
 * />
 *
 * // Controlled
 * <NumberField
 *   label="Discount %"
 *   value={discount}
 *   onValueChange={setDiscount}
 *   min={0}
 *   max={100}
 *   step={1}
 *   hint="Enter a value from 0 to 100."
 * />
 */

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useId } from '../../hooks/use-id';
import { useFocusVisible } from '../../hooks/use-focus-visible';
import { useAnnouncer } from '../../hooks/use-announcer';
import { createComponentWarnings } from '@compa11y/core';

const warn = createComponentWarnings('NumberField');

// =============================================================================
// Helpers
// =============================================================================

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(Math.max(v, lo), hi);
}

function snapToStep(v: number, min: number, step: number): number {
  if (step <= 0) return v;
  return Math.round((v - min) / step) * step + min;
}

/** Strip non-numeric characters and parse to a float. Returns undefined for empty/invalid. */
function parseNumber(s: string): number | undefined {
  // Strip everything except digits, decimal separator, and leading minus
  const cleaned = s.replace(/[^\d.\-]/g, '');
  if (cleaned === '' || cleaned === '-') return undefined;
  const n = parseFloat(cleaned);
  return isNaN(n) ? undefined : n;
}

function formatNumber(
  v: number,
  opts: Intl.NumberFormatOptions,
  locale?: string,
): string {
  try {
    return new Intl.NumberFormat(locale ?? undefined, opts).format(v);
  } catch {
    return String(v);
  }
}

function toRawString(v: number): string {
  return String(v);
}

// =============================================================================
// Props
// =============================================================================

export interface NumberFieldProps {
  /** Visible label text. Either label, aria-label, or aria-labelledby is required. */
  label?: ReactNode;
  /** Hint / description shown below the input and linked via aria-describedby. */
  hint?: ReactNode;
  /**
   * External error message. Takes priority over the component's built-in
   * min/max validation error. Linked via aria-describedby.
   */
  error?: ReactNode;

  /** Controlled value. Pass `undefined` to represent an empty field. */
  value?: number;
  /** Uncontrolled starting value. */
  defaultValue?: number;
  /**
   * Called when the value is committed (on blur or Enter).
   * Receives `undefined` when the field is empty.
   */
  onValueChange?: (value: number | undefined) => void;

  /** Minimum allowed value. */
  min?: number;
  /** Maximum allowed value. */
  max?: number;
  /** Arrow-key / stepper increment size. @default 1 */
  step?: number;
  /** Page Up / Down increment size. Defaults to `step × 10`. */
  largeStep?: number;

  /** Render decrement / increment stepper buttons alongside the input. @default false */
  showSteppers?: boolean;

  /**
   * Intl.NumberFormatOptions applied when displaying the value on blur.
   * Example: `{ style: 'currency', currency: 'USD' }`
   * The raw number is always shown while the field is focused.
   */
  formatOptions?: Intl.NumberFormatOptions;
  /** BCP 47 locale string used with formatOptions. Defaults to the user's locale. */
  locale?: string;

  /** Placeholder text shown when the field is empty. */
  placeholder?: string;
  /** Whether the field is required. */
  required?: boolean;
  /** Disable all interaction. */
  disabled?: boolean;
  /** Make the field read-only. */
  readOnly?: boolean;

  /** Accessible name when no visible label is provided. */
  'aria-label'?: string;
  /** ID of an external labelling element. */
  'aria-labelledby'?: string;

  /** Name attribute forwarded to the native input (for form submission). */
  name?: string;
  /** Override the auto-generated ID. */
  id?: string;

  /** Remove default inline styles so you can fully control appearance. */
  unstyled?: boolean;
  /** CSS class applied to the root wrapper div. */
  className?: string;
  /** Inline styles applied to the root wrapper div. */
  style?: React.CSSProperties;

  /** Focus event forwarded from the inner input. */
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  /** Blur event forwarded from the inner input. */
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
}

// =============================================================================
// Styles
// =============================================================================

const srOnlyStyle: React.CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap',
  border: 0,
};

// =============================================================================
// Component
// =============================================================================

export const NumberField = forwardRef<HTMLDivElement, NumberFieldProps>(
  function NumberField(
    {
      label,
      hint,
      error: externalError,
      value: controlledValue,
      defaultValue,
      onValueChange,
      min,
      max,
      step = 1,
      largeStep,
      showSteppers = false,
      formatOptions,
      locale,
      placeholder,
      required = false,
      disabled = false,
      readOnly = false,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      name,
      id: providedId,
      unstyled = false,
      className = '',
      style: rootStyleProp,
      onFocus: externalOnFocus,
      onBlur: externalOnBlur,
    },
    ref,
  ) {
    const generatedId = useId('number-field');
    const baseId = providedId ?? generatedId;
    const fieldId = `${baseId}-field`;
    const labelId = `${baseId}-label`;
    const hintId = `${baseId}-hint`;
    const errorId = `${baseId}-error`;

    const resolvedLargeStep = largeStep ?? step * 10;

    // ── Controlled / uncontrolled ─────────────────────────────────────────────
    const [uncontrolledValue, setUncontrolledValue] = useState<
      number | undefined
    >(defaultValue);
    const isControlled = controlledValue !== undefined;
    const committedValue = isControlled ? controlledValue : uncontrolledValue;

    // ── Input string (what the <input> shows) ─────────────────────────────────
    const initialDisplay =
      committedValue !== undefined
        ? formatOptions
          ? formatNumber(committedValue, formatOptions, locale)
          : toRawString(committedValue)
        : '';
    const [inputString, setInputString] = useState(initialDisplay);

    // ── Error state ───────────────────────────────────────────────────────────
    const [internalError, setInternalError] = useState('');

    // ── Hooks ─────────────────────────────────────────────────────────────────
    const { assertive } = useAnnouncer();
    const { isFocusVisible, focusProps } = useFocusVisible();
    const inputRef = useRef<HTMLInputElement>(null);
    const isFocusedRef = useRef(false);

    // ── Sync controlled value when changed externally while not focused ───────
    useEffect(() => {
      if (isFocusedRef.current) return;
      if (controlledValue !== undefined) {
        setInputString(
          formatOptions
            ? formatNumber(controlledValue, formatOptions, locale)
            : toRawString(controlledValue),
        );
      } else {
        setInputString('');
      }
    }, [controlledValue, formatOptions, locale]);

    // ── Dev warnings ──────────────────────────────────────────────────────────
    if (process.env.NODE_ENV !== 'production') {
      if (!label && !ariaLabel && !ariaLabelledBy) {
        warn.error(
          'NumberField requires an accessible label.',
          'Add a label prop, aria-label, or aria-labelledby.',
        );
      }
      if (min !== undefined && max !== undefined && min >= max) {
        warn.error(
          `NumberField min (${min}) must be less than max (${max}).`,
        );
      }
    }

    // ── Commit helper ─────────────────────────────────────────────────────────
    const commit = useCallback(
      (next: number | undefined) => {
        if (!isControlled) setUncontrolledValue(next);
        onValueChange?.(next);
      },
      [isControlled, onValueChange],
    );

    // ── Adjust value by absolute target (used by steppers + arrow keys) ───────
    const adjustValue = useCallback(
      (target: number) => {
        if (disabled || readOnly) return;
        // Snap to step grid, then clamp to min/max
        const stepped =
          min !== undefined ? snapToStep(target, min, step) : target;
        const clamped = clamp(
          stepped,
          min ?? -Infinity,
          max ?? Infinity,
        );
        // While focused, show raw; otherwise show formatted
        setInputString(
          !isFocusedRef.current && formatOptions
            ? formatNumber(clamped, formatOptions, locale)
            : toRawString(clamped),
        );
        setInternalError('');
        commit(clamped);
      },
      [disabled, readOnly, min, max, step, formatOptions, locale, commit],
    );

    // ── Keyboard handler ──────────────────────────────────────────────────────
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (disabled || readOnly) return;
        const current = committedValue ?? min ?? 0;

        const step_ = (delta: number) => {
          e.preventDefault();
          adjustValue(current + delta);
        };

        switch (e.key) {
          case 'ArrowUp':
            return step_(step);
          case 'ArrowDown':
            return step_(-step);
          case 'PageUp':
            return step_(resolvedLargeStep);
          case 'PageDown':
            return step_(-resolvedLargeStep);
          case 'Home':
            if (min !== undefined) {
              e.preventDefault();
              adjustValue(min);
            }
            return;
          case 'End':
            if (max !== undefined) {
              e.preventDefault();
              adjustValue(max);
            }
            return;
          case 'Enter': {
            // Commit whatever is currently typed, without losing focus
            const parsed = parseNumber(inputString);
            if (parsed !== undefined) {
              adjustValue(parsed);
            } else if (inputString === '') {
              setInternalError('');
              commit(undefined);
            }
            return;
          }
        }
      },
      [
        disabled,
        readOnly,
        committedValue,
        min,
        max,
        step,
        resolvedLargeStep,
        inputString,
        adjustValue,
        commit,
      ],
    );

    // ── Focus ─────────────────────────────────────────────────────────────────
    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        isFocusedRef.current = true;
        focusProps.onFocus();
        // Show the raw numeric value while editing (not formatted)
        if (committedValue !== undefined) {
          setInputString(toRawString(committedValue));
        }
        externalOnFocus?.(e);
      },
      [committedValue, focusProps, externalOnFocus],
    );

    // ── Blur — parse, validate, commit, format ────────────────────────────────
    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        isFocusedRef.current = false;
        focusProps.onBlur();

        // Empty field — intentionally cleared
        if (inputString.trim() === '') {
          setInputString('');
          setInternalError('');
          commit(undefined);
          externalOnBlur?.(e);
          return;
        }

        const parsed = parseNumber(inputString);

        // Non-numeric text — restore previous value and show error
        if (parsed === undefined) {
          const msg = 'Enter a valid number.';
          setInternalError(msg);
          assertive(msg);
          setInputString(
            committedValue !== undefined
              ? formatOptions
                ? formatNumber(committedValue, formatOptions, locale)
                : toRawString(committedValue)
              : '',
          );
          externalOnBlur?.(e);
          return;
        }

        // Validate against min / max
        let next = parsed;
        let errorMsg = '';

        if (min !== undefined && next < min) {
          errorMsg =
            max !== undefined
              ? `Enter a number between ${min} and ${max}.`
              : `Enter a number of ${min} or more.`;
          next = clamp(next, min, max ?? next);
        } else if (max !== undefined && next > max) {
          errorMsg =
            min !== undefined
              ? `Enter a number between ${min} and ${max}.`
              : `Enter a number of ${max} or less.`;
          next = clamp(next, min ?? next, max);
        } else {
          // Snap to step
          next = min !== undefined ? snapToStep(next, min, step) : next;
        }

        if (errorMsg) {
          setInternalError(errorMsg);
          assertive(errorMsg);
        } else {
          setInternalError('');
        }

        // Apply formatting for display
        setInputString(
          formatOptions ? formatNumber(next, formatOptions, locale) : toRawString(next),
        );
        commit(next);
        externalOnBlur?.(e);
      },
      [
        inputString,
        min,
        max,
        step,
        formatOptions,
        locale,
        focusProps,
        commit,
        assertive,
        externalOnBlur,
      ],
    );

    // ── Derived state ─────────────────────────────────────────────────────────
    const activeError = externalError ?? (internalError || undefined);
    const hasError = Boolean(activeError);

    const describedByParts: string[] = [];
    if (hint) describedByParts.push(hintId);
    if (hasError) describedByParts.push(errorId);

    // spinbutton inputMode: numeric for integer steps, decimal for fractional
    const inputMode: React.HTMLAttributes<HTMLInputElement>['inputMode'] =
      step % 1 === 0 ? 'numeric' : 'decimal';

    // Accessible label wiring
    const effectiveLabelledBy = label ? labelId : ariaLabelledBy;
    const effectiveAriaLabel = !label ? ariaLabel : undefined;

    // Stepper disabled states
    const decDisabled =
      disabled || (min !== undefined && committedValue !== undefined && committedValue <= min);
    const incDisabled =
      disabled || (max !== undefined && committedValue !== undefined && committedValue >= max);

    // ── Styles ────────────────────────────────────────────────────────────────
    const rootStyle: React.CSSProperties = unstyled
      ? { ...rootStyleProp }
      : { display: 'flex', flexDirection: 'column', gap: '0.25rem', ...rootStyleProp };

    const controlStyle: React.CSSProperties = unstyled
      ? {}
      : { display: 'flex', alignItems: 'stretch' };

    const inputStyle: React.CSSProperties = unstyled
      ? {}
      : {
          flex: 1,
          minWidth: 0,
          padding: 'var(--compa11y-number-field-input-padding, 0.5rem 0.75rem)',
          border: hasError
            ? '1px solid var(--compa11y-number-field-input-border-error, #ef4444)'
            : 'var(--compa11y-number-field-input-border, 1px solid #ccc)',
          borderRadius: showSteppers
            ? '0'
            : 'var(--compa11y-number-field-input-radius, 4px)',
          fontSize: 'var(--compa11y-number-field-input-font-size, 0.875rem)',
          fontFamily: 'inherit',
          background: disabled
            ? 'var(--compa11y-number-field-input-disabled-bg, #f5f5f5)'
            : readOnly
              ? 'var(--compa11y-number-field-input-readonly-bg, #f9f9f9)'
              : 'var(--compa11y-number-field-input-bg, white)',
          color: 'inherit',
          cursor: disabled ? 'not-allowed' : undefined,
          opacity: disabled
            ? ('var(--compa11y-number-field-input-disabled-opacity, 0.7)' as any)
            : undefined,
          textAlign: 'right' as const,
          // Remove native number-input spinner arrows if someone passes type="number"
          MozAppearance: 'textfield' as any,
          ...(isFocusVisible && !disabled
            ? {
                outline: hasError
                  ? '2px solid var(--compa11y-number-field-input-border-error, #ef4444)'
                  : '2px solid var(--compa11y-focus-color, #0066cc)',
                outlineOffset: '-1px',
                borderColor: hasError
                  ? 'var(--compa11y-number-field-input-border-error, #ef4444)'
                  : 'var(--compa11y-number-field-input-border-focus, #0066cc)',
              }
            : {}),
        };

    const makeStepperStyle = (
      side: 'dec' | 'inc',
      isDisabled: boolean,
    ): React.CSSProperties =>
      unstyled
        ? {}
        : {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '44px',
            minHeight: '44px',
            padding: '0 0.75rem',
            background: isDisabled
              ? 'var(--compa11y-number-field-stepper-disabled-bg, #f5f5f5)'
              : 'var(--compa11y-number-field-stepper-bg, #f0f0f0)',
            color: isDisabled
              ? 'var(--compa11y-number-field-stepper-disabled-color, #999)'
              : 'var(--compa11y-number-field-stepper-color, inherit)',
            border: hasError
              ? '1px solid var(--compa11y-number-field-input-border-error, #ef4444)'
              : 'var(--compa11y-number-field-stepper-border, 1px solid #ccc)',
            ...(side === 'dec' ? { borderRight: 'none' } : { borderLeft: 'none' }),
            borderRadius:
              side === 'dec'
                ? 'var(--compa11y-number-field-input-radius, 4px) 0 0 var(--compa11y-number-field-input-radius, 4px)'
                : '0 var(--compa11y-number-field-input-radius, 4px) var(--compa11y-number-field-input-radius, 4px) 0',
            cursor: isDisabled ? 'not-allowed' : 'pointer',
            userSelect: 'none' as const,
            fontSize: '1.25rem',
            lineHeight: 1,
            fontWeight: 400,
            opacity: isDisabled ? 0.5 : 1,
            flexShrink: 0,
          };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
      <div
        ref={ref}
        data-compa11y-number-field=""
        {...(disabled && { 'data-disabled': '' })}
        {...(hasError && { 'data-error': '' })}
        {...(required && { 'data-required': '' })}
        {...(readOnly && { 'data-readonly': '' })}
        className={['compa11y-number-field', className].filter(Boolean).join(' ')}
        style={rootStyle}
      >
        {/* Live region — always pre-mounted so SR picks up dynamic messages */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          style={srOnlyStyle}
        />

        {/* Label */}
        {label && (
          <label
            id={labelId}
            htmlFor={fieldId}
            data-compa11y-number-field-label=""
            style={
              unstyled
                ? {}
                : {
                    display: 'block',
                    color: disabled
                      ? 'var(--compa11y-number-field-label-disabled-color, #999)'
                      : 'var(--compa11y-number-field-label-color, inherit)',
                    fontSize: 'var(--compa11y-number-field-label-size, 0.875rem)',
                    fontWeight:
                      'var(--compa11y-number-field-label-weight, 500)' as any,
                  }
            }
          >
            {label}
            {required && (
              <span
                data-compa11y-number-field-required=""
                aria-hidden="true"
                style={
                  unstyled
                    ? {}
                    : {
                        color:
                          'var(--compa11y-number-field-required-color, #ef4444)',
                        marginLeft: '0.125rem',
                      }
                }
              >
                *
              </span>
            )}
          </label>
        )}

        {/* Control row: [−] [input] [+] */}
        <div
          data-compa11y-number-field-control=""
          style={controlStyle}
        >
          {showSteppers && (
            <button
              type="button"
              data-compa11y-number-field-dec=""
              aria-label="Decrease"
              disabled={decDisabled}
              onClick={() =>
                adjustValue((committedValue ?? min ?? 0) - step)
              }
              style={makeStepperStyle('dec', Boolean(decDisabled))}
            >
              −
            </button>
          )}

          <input
            ref={inputRef}
            id={fieldId}
            type="text"
            inputMode={inputMode}
            role="spinbutton"
            value={inputString}
            placeholder={placeholder}
            name={name}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            aria-label={effectiveAriaLabel}
            aria-labelledby={effectiveLabelledBy}
            aria-describedby={
              describedByParts.length ? describedByParts.join(' ') : undefined
            }
            aria-invalid={hasError ? 'true' : undefined}
            aria-required={required ? 'true' : undefined}
            aria-valuenow={committedValue}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuetext={
              committedValue !== undefined && formatOptions
                ? formatNumber(committedValue, formatOptions, locale)
                : undefined
            }
            aria-disabled={disabled ? 'true' : undefined}
            data-compa11y-number-field-input=""
            onChange={(e) => setInputString(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={inputStyle}
          />

          {showSteppers && (
            <button
              type="button"
              data-compa11y-number-field-inc=""
              aria-label="Increase"
              disabled={incDisabled}
              onClick={() =>
                adjustValue((committedValue ?? min ?? 0) + step)
              }
              style={makeStepperStyle('inc', Boolean(incDisabled))}
            >
              +
            </button>
          )}
        </div>

        {/* Hint */}
        {hint && (
          <div
            id={hintId}
            data-compa11y-number-field-hint=""
            style={
              unstyled
                ? {}
                : {
                    color: 'var(--compa11y-number-field-hint-color, #666)',
                    fontSize: 'var(--compa11y-number-field-hint-size, 0.8125rem)',
                  }
            }
          >
            {hint}
          </div>
        )}

        {/* Error */}
        {hasError && (
          <div
            id={errorId}
            role="alert"
            data-compa11y-number-field-error=""
            style={
              unstyled
                ? {}
                : {
                    color: 'var(--compa11y-number-field-error-color, #ef4444)',
                    fontSize:
                      'var(--compa11y-number-field-error-size, 0.8125rem)',
                  }
            }
          >
            {activeError}
          </div>
        )}
      </div>
    );
  },
);

NumberField.displayName = 'NumberField';
