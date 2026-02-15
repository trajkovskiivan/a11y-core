/**
 * RadioGroup Component
 *
 * An accessible radio group for single-selection from a set of options.
 * Follows WAI-ARIA Radio Group pattern with roving tabindex and
 * selection-follows-focus keyboard behavior.
 *
 * @example
 * ```tsx
 * // Controlled
 * <RadioGroup value={color} onValueChange={setColor} aria-label="Favorite color">
 *   <RadioGroup.Radio value="red">Red</RadioGroup.Radio>
 *   <RadioGroup.Radio value="green">Green</RadioGroup.Radio>
 *   <RadioGroup.Radio value="blue">Blue</RadioGroup.Radio>
 * </RadioGroup>
 *
 * // Uncontrolled
 * <RadioGroup defaultValue="red" aria-label="Favorite color">
 *   <RadioGroup.Radio value="red">Red</RadioGroup.Radio>
 *   <RadioGroup.Radio value="green">Green</RadioGroup.Radio>
 * </RadioGroup>
 *
 * // With legend (fieldset semantics)
 * <RadioGroup legend="Delivery speed" required>
 *   <RadioGroup.Radio value="standard">Standard</RadioGroup.Radio>
 *   <RadioGroup.Radio value="express">Express</RadioGroup.Radio>
 *   <RadioGroup.Radio value="overnight">Overnight</RadioGroup.Radio>
 * </RadioGroup>
 *
 * // With error validation
 * <RadioGroup legend="Payment method" required error="Please select a payment method">
 *   <RadioGroup.Radio value="card">Credit Card</RadioGroup.Radio>
 *   <RadioGroup.Radio value="paypal">PayPal</RadioGroup.Radio>
 * </RadioGroup>
 * ```
 */

import React, {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createComponentWarnings } from '@compa11y/core';
import { useId } from '../../hooks/use-id';
import { useKeyboard } from '../../hooks/use-keyboard';
import { useAnnouncer } from '../../hooks/use-announcer';
import { useFocusVisible } from '../../hooks/use-focus-visible';

const warnings = createComponentWarnings('RadioGroup');

// ============================================================================
// Types
// ============================================================================

export interface RadioGroupContextValue {
  /** Group name for native radio inputs */
  name: string;
  /** Currently selected value */
  value: string | null;
  /** Whether all radios are disabled */
  disabled: boolean;
  /** Whether disabled radios remain discoverable in tab order */
  discoverable: boolean;
  /** Whether selection is required */
  required: boolean;
  /** Whether to remove default styles */
  unstyled: boolean;
  /** Layout orientation */
  orientation: 'horizontal' | 'vertical';
  /** Called when selected value changes */
  onValueChange: (value: string) => void;
  /** Register a radio option with the group */
  registerRadio: (value: string, disabled: boolean) => void;
  /** Unregister a radio option from the group */
  unregisterRadio: (value: string) => void;
  /** Update a radio's disabled state */
  updateRadioDisabled: (value: string, disabled: boolean) => void;
}

export interface RadioGroupProps {
  /** Controlled value */
  value?: string;
  /** Default value (uncontrolled) */
  defaultValue?: string;
  /** Called when selected value changes */
  onValueChange?: (value: string) => void;
  /** Whether all radios are disabled */
  disabled?: boolean;
  /** Whether disabled radios remain discoverable in tab order */
  discoverable?: boolean;
  /** Whether selection is required */
  required?: boolean;
  /** Layout orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Group name for native radio inputs */
  name?: string;
  /** Group label displayed as fieldset legend */
  legend?: React.ReactNode;
  /** Helper/description text */
  hint?: React.ReactNode;
  /** Error message */
  error?: React.ReactNode;
  /** Remove default styles */
  unstyled?: boolean;
  /** Custom class name */
  className?: string;
  /** Children (Radio components) */
  children: React.ReactNode;
  /** Accessible label (if no visible legend) */
  'aria-label'?: string;
  /** Reference to external label element */
  'aria-labelledby'?: string;
}

export interface RadioProps {
  /** Value for this radio option (required) */
  value: string;
  /** Whether this individual radio is disabled */
  disabled?: boolean;
  /** Whether disabled radio remains discoverable */
  discoverable?: boolean;
  /** Label text (alternative to children) */
  label?: React.ReactNode;
  /** Helper/description text */
  hint?: React.ReactNode;
  /** Remove default styles */
  unstyled?: boolean;
  /** Custom class name */
  className?: string;
  /** Children (typically label text) */
  children?: React.ReactNode;
  /** Accessible label */
  'aria-label'?: string;
}

// ============================================================================
// Context
// ============================================================================

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

/**
 * Access the RadioGroup context.
 * Throws if used outside a RadioGroup.
 */
export function useRadioGroupContext(): RadioGroupContextValue {
  const context = useContext(RadioGroupContext);
  if (!context) {
    throw new Error(
      '[Compa11y RadioGroup]: Radio must be used within a RadioGroup.'
    );
  }
  return context;
}

// ============================================================================
// RadioGroup
// ============================================================================

/**
 * RadioGroup - Groups related radio buttons with proper ARIA semantics.
 *
 * Uses `role="radiogroup"` with optional `<fieldset>/<legend>` for proper
 * screen reader group labeling. Implements roving tabindex and
 * selection-follows-focus keyboard behavior.
 *
 * Keyboard support:
 * - Tab: Move into/out of the group
 * - Arrow Down/Right: Move to next radio and select it
 * - Arrow Up/Left: Move to previous radio and select it
 * - Home: Move to first radio and select it
 * - End: Move to last radio and select it
 * - Space: Select the focused radio
 */
export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  function RadioGroup(
    {
      value: controlledValue,
      defaultValue,
      onValueChange,
      disabled = false,
      discoverable = true,
      required = false,
      orientation = 'vertical',
      name: providedName,
      legend,
      hint,
      error,
      unstyled = false,
      className = '',
      children,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
    },
    ref
  ) {
    const generatedName = useId('radiogroup');
    const name = providedName || generatedName;
    const hintId = useId('radiogroup-hint');
    const errorId = useId('radiogroup-error');

    const [uncontrolledValue, setUncontrolledValue] = useState<string | null>(
      defaultValue ?? null
    );
    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : uncontrolledValue;

    // Track registered radios and their disabled state
    const radiosRef = useRef<Map<string, boolean>>(new Map());

    // Warn if no accessible label
    useEffect(() => {
      if (!legend && !ariaLabel && !ariaLabelledBy) {
        warnings.warning(
          'RadioGroup has no accessible label. Screen readers need this to identify the group.',
          'Add legend="...", aria-label="...", or aria-labelledby="..."'
        );
      }
    }, [legend, ariaLabel, ariaLabelledBy]);

    const handleValueChange = useCallback(
      (newValue: string) => {
        if (disabled) return;

        if (!isControlled) {
          setUncontrolledValue(newValue);
        }
        onValueChange?.(newValue);
      },
      [disabled, isControlled, onValueChange]
    );

    const registerRadio = useCallback(
      (radioValue: string, radioDisabled: boolean) => {
        radiosRef.current.set(radioValue, radioDisabled);
      },
      []
    );

    const unregisterRadio = useCallback((radioValue: string) => {
      radiosRef.current.delete(radioValue);
    }, []);

    const updateRadioDisabled = useCallback(
      (radioValue: string, radioDisabled: boolean) => {
        radiosRef.current.set(radioValue, radioDisabled);
      },
      []
    );

    // Get ordered list of enabled radio values
    const getEnabledRadioValues = useCallback((): string[] => {
      const values: string[] = [];
      radiosRef.current.forEach((isDisabled, radioValue) => {
        if (!isDisabled && !disabled) {
          values.push(radioValue);
        }
      });
      return values;
    }, [disabled]);

    // Internal ref for DOM queries
    const internalRef = useRef<HTMLDivElement>(null);
    const groupRef = ref || internalRef;

    const navigateWithRef = useCallback(
      (direction: 'next' | 'prev' | 'first' | 'last') => {
        const enabledValues = getEnabledRadioValues();
        if (enabledValues.length === 0) return;

        const currentIndex = value ? enabledValues.indexOf(value) : -1;

        let nextIndex: number;
        switch (direction) {
          case 'next':
            nextIndex =
              currentIndex < 0
                ? 0
                : (currentIndex + 1) % enabledValues.length;
            break;
          case 'prev':
            nextIndex =
              currentIndex < 0
                ? enabledValues.length - 1
                : (currentIndex - 1 + enabledValues.length) %
                  enabledValues.length;
            break;
          case 'first':
            nextIndex = 0;
            break;
          case 'last':
            nextIndex = enabledValues.length - 1;
            break;
        }

        const nextValue = enabledValues[nextIndex];
        if (nextValue !== undefined) {
          handleValueChange(nextValue);

          // Focus the radio input
          const groupEl =
            typeof groupRef === 'object' && groupRef
              ? (groupRef as React.RefObject<HTMLDivElement | null>).current
              : null;
          if (groupEl) {
            const input = groupEl.querySelector<HTMLInputElement>(
              `input[type="radio"][value="${CSS.escape(nextValue)}"]`
            );
            input?.focus();
          }
        }
      },
      [getEnabledRadioValues, value, handleValueChange, groupRef]
    );

    const keyboardProps = useKeyboard(
      {
        ArrowDown: () => navigateWithRef('next'),
        ArrowRight: () => navigateWithRef('next'),
        ArrowUp: () => navigateWithRef('prev'),
        ArrowLeft: () => navigateWithRef('prev'),
        Home: () => navigateWithRef('first'),
        End: () => navigateWithRef('last'),
      },
      { preventDefault: true, stopPropagation: true, disabled }
    );

    const contextValue: RadioGroupContextValue = {
      name,
      value: value ?? null,
      disabled,
      discoverable,
      required,
      unstyled,
      orientation,
      onValueChange: handleValueChange,
      registerRadio,
      unregisterRadio,
      updateRadioDisabled,
    };

    // Build aria-describedby
    const describedByParts: string[] = [];
    if (hint) describedByParts.push(hintId);
    if (error) describedByParts.push(errorId);
    const ariaDescribedBy =
      describedByParts.length > 0 ? describedByParts.join(' ') : undefined;

    const groupContent = (
      <>
        <div
          style={
            unstyled
              ? {
                  display: 'flex',
                  flexDirection:
                    orientation === 'horizontal' ? 'row' : 'column',
                }
              : {
                  display: 'flex',
                  flexDirection:
                    orientation === 'horizontal' ? 'row' : 'column',
                  gap: 'var(--compa11y-radio-gap, 0.75rem)',
                }
          }
        >
          {children}
        </div>
        {hint && (
          <div
            id={hintId}
            style={
              unstyled
                ? {}
                : {
                    color: 'var(--compa11y-radio-group-hint-color, #666)',
                    fontSize: '0.8125rem',
                    marginTop: '0.25rem',
                  }
            }
          >
            {hint}
          </div>
        )}
        {error && (
          <div
            id={errorId}
            role="alert"
            style={
              unstyled
                ? {}
                : {
                    color: 'var(--compa11y-radio-group-error-color, #ef4444)',
                    fontSize: '0.8125rem',
                    marginTop: '0.25rem',
                  }
            }
          >
            {error}
          </div>
        )}
      </>
    );

    // If legend is provided, wrap in fieldset/legend for proper semantics
    if (legend) {
      return (
        <RadioGroupContext.Provider value={contextValue}>
          <fieldset
            ref={groupRef as React.Ref<HTMLFieldSetElement>}
            role="radiogroup"
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            aria-orientation={orientation}
            aria-required={required || undefined}
            aria-disabled={disabled || undefined}
            aria-invalid={error ? true : undefined}
            aria-describedby={ariaDescribedBy}
            className={`compa11y-radiogroup ${className}`.trim()}
            data-compa11y-radiogroup=""
            data-orientation={orientation}
            data-disabled={disabled ? 'true' : undefined}
            data-error={error ? 'true' : undefined}
            onKeyDown={keyboardProps.onKeyDown}
            style={
              unstyled
                ? { border: 'none', margin: 0, padding: 0, minWidth: 0 }
                : {
                    border: 'none',
                    margin: 0,
                    padding: 0,
                    minWidth: 0,
                  }
            }
          >
            <legend
              style={
                unstyled
                  ? {}
                  : {
                      padding: 0,
                      marginBottom:
                        'var(--compa11y-radio-group-legend-gap, 0.5rem)',
                      fontWeight: 'var(--compa11y-radio-group-legend-weight, 600)' as any,
                      color: 'var(--compa11y-radio-group-legend-color, inherit)',
                      fontSize:
                        'var(--compa11y-radio-group-legend-size, 1rem)',
                    }
              }
            >
              {legend}
              {required && !unstyled && (
                <span
                  aria-hidden="true"
                  style={{
                    color:
                      'var(--compa11y-radio-group-required-color, #ef4444)',
                    marginLeft: '0.125rem',
                  }}
                >
                  {' '}
                  *
                </span>
              )}
            </legend>
            {groupContent}
          </fieldset>
        </RadioGroupContext.Provider>
      );
    }

    // No legend: use div with role="radiogroup"
    return (
      <RadioGroupContext.Provider value={contextValue}>
        <div
          ref={groupRef as React.Ref<HTMLDivElement>}
          role="radiogroup"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-orientation={orientation}
          aria-required={required || undefined}
          aria-disabled={disabled || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={ariaDescribedBy}
          className={`compa11y-radiogroup ${className}`.trim()}
          data-compa11y-radiogroup=""
          data-orientation={orientation}
          data-disabled={disabled ? 'true' : undefined}
          data-error={error ? 'true' : undefined}
          onKeyDown={keyboardProps.onKeyDown}
        >
          {groupContent}
        </div>
      </RadioGroupContext.Provider>
    );
  }
);

RadioGroup.displayName = 'RadioGroup';

// ============================================================================
// Radio
// ============================================================================

/**
 * Radio - Individual radio option for use within a RadioGroup.
 *
 * Uses a native `<input type="radio">` (visually hidden) for full
 * accessibility, with a custom visual indicator overlay.
 *
 * @example
 * ```tsx
 * <RadioGroup.Radio value="option1">Option 1</RadioGroup.Radio>
 * <RadioGroup.Radio value="option2" label="Option 2" />
 * <RadioGroup.Radio value="option3" disabled>Option 3 (unavailable)</RadioGroup.Radio>
 * ```
 */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  function Radio(
    {
      value,
      disabled: localDisabled = false,
      discoverable: localDiscoverable,
      label,
      hint,
      unstyled: localUnstyled,
      className = '',
      children,
      'aria-label': ariaLabel,
    },
    ref
  ) {
    const context = useRadioGroupContext();
    const generatedId = useId('radio');
    const hintId = useId('radio-hint');

    const disabled = context.disabled || localDisabled;
    const discoverable = localDiscoverable ?? context.discoverable;
    const unstyled = localUnstyled ?? context.unstyled;
    const checked = context.value === value;

    const { announce } = useAnnouncer();
    const { isFocusVisible, focusProps } = useFocusVisible();

    const inputRef = useRef<HTMLInputElement>(null);

    const mergedRef = useCallback(
      (node: HTMLInputElement | null) => {
        (inputRef as React.MutableRefObject<HTMLInputElement | null>).current =
          node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLInputElement | null>).current =
            node;
        }
      },
      [ref]
    );

    // Register/unregister with parent
    useEffect(() => {
      context.registerRadio(value, disabled);
      return () => context.unregisterRadio(value);
    }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

    // Update disabled state in parent
    useEffect(() => {
      context.updateRadioDisabled(value, disabled);
    }, [disabled, value]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled) {
          event.preventDefault();
          return;
        }

        context.onValueChange(value);

        const labelText =
          label ||
          (typeof children === 'string' ? children : null) ||
          value;
        announce(`${labelText} selected`, { politeness: 'polite' });
      },
      [disabled, context, value, label, children, announce]
    );

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLInputElement>) => {
        if (disabled) {
          event.preventDefault();
        }
      },
      [disabled]
    );

    const handleFocus = useCallback(
      (_event: React.FocusEvent<HTMLInputElement>) => {
        focusProps.onFocus();

        // Selection follows focus: when focused via keyboard nav, select this radio
        if (!checked && !disabled) {
          context.onValueChange(value);
        }
      },
      [focusProps, checked, disabled, context, value]
    );

    const handleBlur = useCallback(() => {
      focusProps.onBlur();
    }, [focusProps]);

    const hasLabel = Boolean(children || label);
    const labelContent = children || label;
    const labelId = `${generatedId}-label`;
    const hasHint = Boolean(hint);

    // Roving tabindex: only the checked radio (or first enabled if none checked) gets tabindex 0
    const isFirstEnabled = (() => {
      if (context.value !== null) return false;
      const entries = Array.from(
        (
          inputRef.current?.closest('[role="radiogroup"]') as HTMLElement
        )?.querySelectorAll('input[type="radio"]') ?? []
      );
      for (const entry of entries) {
        const input = entry as HTMLInputElement;
        if (!input.disabled && input.getAttribute('aria-disabled') !== 'true') {
          return input.value === value;
        }
      }
      return false;
    })();

    const tabIndex = (() => {
      if (disabled && !discoverable) return -1;
      if (checked) return 0;
      if (context.value === null && isFirstEnabled) return 0;
      return -1;
    })();

    const useNativeDisabled = disabled && !discoverable;

    // Build aria-describedby
    const ariaDescribedBy = hasHint ? hintId : undefined;

    return (
      <label
        htmlFor={generatedId}
        className={`compa11y-radio-wrapper ${className}`.trim()}
        data-compa11y-radio=""
        data-value={value}
        data-checked={checked ? 'true' : 'false'}
        data-disabled={disabled ? 'true' : undefined}
        style={
          unstyled
            ? {
                display: 'inline-flex',
                alignItems: 'flex-start',
                cursor: disabled ? 'not-allowed' : 'pointer',
                gap: '0.5rem',
              }
            : {
                display: 'inline-flex',
                alignItems: 'flex-start',
                gap: 'var(--compa11y-radio-gap, 0.5rem)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                userSelect: 'none',
                opacity: disabled ? 0.5 : 1,
              }
        }
      >
        <div
          style={{
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {/* Native radio input - visually hidden but accessible */}
          <input
            ref={mergedRef}
            type="radio"
            id={generatedId}
            name={context.name}
            value={value}
            checked={checked}
            onChange={handleChange}
            onClick={handleClick}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={useNativeDisabled}
            tabIndex={tabIndex}
            aria-disabled={disabled ? 'true' : undefined}
            aria-label={!hasLabel ? ariaLabel : undefined}
            aria-labelledby={hasLabel ? labelId : undefined}
            aria-describedby={ariaDescribedBy}
            required={context.required}
            className="compa11y-radio-input"
            style={{
              position: 'absolute',
              opacity: 0,
              width: 'var(--compa11y-radio-size, 1.25rem)',
              height: 'var(--compa11y-radio-size, 1.25rem)',
              margin: 0,
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}
          />
          {/* Custom radio circle visual */}
          {!unstyled && (
            <div
              className="compa11y-radio-circle"
              style={{
                width: 'var(--compa11y-radio-size, 1.25rem)',
                height: 'var(--compa11y-radio-size, 1.25rem)',
                minWidth: '24px',
                minHeight: '24px',
                border: checked
                  ? 'var(--compa11y-radio-checked-border, 2px solid #0066cc)'
                  : 'var(--compa11y-radio-border, 2px solid #666)',
                borderRadius: '50%',
                background: checked
                  ? 'var(--compa11y-radio-checked-bg, #0066cc)'
                  : 'var(--compa11y-radio-bg, white)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.15s ease',
                pointerEvents: 'none',
                ...(isFocusVisible
                  ? {
                      outline:
                        '2px solid var(--compa11y-focus-color, #0066cc)',
                      outlineOffset: '2px',
                    }
                  : {}),
              }}
            >
              {/* Inner dot */}
              <div
                aria-hidden="true"
                style={{
                  width: 'var(--compa11y-radio-dot-size, 0.5rem)',
                  height: 'var(--compa11y-radio-dot-size, 0.5rem)',
                  borderRadius: '50%',
                  background: 'var(--compa11y-radio-dot-color, white)',
                  opacity: checked ? 1 : 0,
                  transform: checked ? 'scale(1)' : 'scale(0)',
                  transition: 'all 0.15s ease',
                }}
              />
            </div>
          )}
        </div>
        {(hasLabel || hasHint) && (
          <div
            style={
              unstyled
                ? {}
                : {
                    display: 'flex',
                    flexDirection: 'column' as const,
                    gap: '0.125rem',
                    paddingTop: '0.125rem',
                  }
            }
          >
            {hasLabel && (
              <span
                id={labelId}
                className="compa11y-radio-label"
                style={
                  unstyled
                    ? {}
                    : {
                        color: 'var(--compa11y-radio-label-color, inherit)',
                        fontSize: 'var(--compa11y-radio-label-size, 1rem)',
                      }
                }
              >
                {labelContent}
              </span>
            )}
            {hasHint && (
              <span
                id={hintId}
                className="compa11y-radio-hint"
                style={
                  unstyled
                    ? {}
                    : {
                        color: 'var(--compa11y-radio-hint-color, #666)',
                        fontSize: 'var(--compa11y-radio-hint-size, 0.8125rem)',
                      }
                }
              >
                {hint}
              </span>
            )}
          </div>
        )}
      </label>
    );
  }
);

Radio.displayName = 'Radio';

// ============================================================================
// Compound Component
// ============================================================================

export const RadioGroupCompound = Object.assign(RadioGroup, { Radio });
