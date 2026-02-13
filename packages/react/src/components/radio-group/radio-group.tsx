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
  name: string;
  value: string | null;
  disabled: boolean;
  discoverable: boolean;
  required: boolean;
  unstyled: boolean;
  orientation: 'horizontal' | 'vertical';
  onValueChange: (value: string) => void;
  registerRadio: (value: string, disabled: boolean) => void;
  unregisterRadio: (value: string) => void;
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
  /** Remove default styles */
  unstyled?: boolean;
  /** Custom class name */
  className?: string;
  /** Children (Radio components) */
  children: React.ReactNode;
  /** Accessible label */
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
  label?: string;
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

    const [uncontrolledValue, setUncontrolledValue] = useState<string | null>(
      defaultValue ?? null
    );
    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : uncontrolledValue;

    // Track registered radios and their disabled state
    const radiosRef = useRef<Map<string, boolean>>(new Map());

    // Warn if no accessible label
    useEffect(() => {
      if (!ariaLabel && !ariaLabelledBy) {
        warnings.warning(
          'RadioGroup has no accessible label. Screen readers need this.',
          'Add aria-label="..." or aria-labelledby="..."'
        );
      }
    }, [ariaLabel, ariaLabelledBy]);

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

    // Get ordered list of enabled radio values (based on DOM order)
    const getEnabledRadioValues = useCallback((): string[] => {
      const values: string[] = [];
      radiosRef.current.forEach((isDisabled, radioValue) => {
        if (!isDisabled && !disabled) {
          values.push(radioValue);
        }
      });
      return values;
    }, [disabled]);

    // Use an internal ref if no ref is provided
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

          // Focus the radio input using the internal ref
          const groupEl =
            typeof groupRef === 'object' && groupRef
              ? (groupRef as React.RefObject<HTMLDivElement>).current
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
          className={`compa11y-radiogroup ${className}`.trim()}
          data-compa11y-radiogroup=""
          data-orientation={orientation}
          data-disabled={disabled ? 'true' : undefined}
          onKeyDown={keyboardProps.onKeyDown}
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
      </RadioGroupContext.Provider>
    );
  }
);

RadioGroup.displayName = 'RadioGroup';

// ============================================================================
// Radio
// ============================================================================

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  function Radio(
    {
      value,
      disabled: localDisabled = false,
      discoverable: localDiscoverable,
      label,
      unstyled: localUnstyled,
      className = '',
      children,
      'aria-label': ariaLabel,
    },
    ref
  ) {
    const context = useRadioGroupContext();
    const generatedId = useId('radio');

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
          label || (typeof children === 'string' ? children : 'Radio');
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
        // The parent handles arrow key navigation, which calls onValueChange + focus
        // But clicking to focus should also select
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

    // Roving tabindex: only the checked radio (or first enabled if none checked) gets tabindex 0
    const isFirstEnabled = (() => {
      if (context.value !== null) return false;
      // Check if this is the first enabled radio
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
                alignItems: 'center',
                cursor: disabled ? 'not-allowed' : 'pointer',
                gap: '0.5rem',
              }
            : {
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: disabled ? 'not-allowed' : 'pointer',
                userSelect: 'none',
              }
        }
      >
        <div
          style={{
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
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
                opacity: disabled ? 0.5 : 1,
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
                  background:
                    'var(--compa11y-radio-dot-color, white)',
                  opacity: checked ? 1 : 0,
                  transform: checked ? 'scale(1)' : 'scale(0)',
                  transition: 'all 0.15s ease',
                }}
              />
            </div>
          )}
        </div>
        {hasLabel && (
          <span
            id={labelId}
            className="compa11y-radio-label"
            style={
              unstyled
                ? {}
                : {
                    color: disabled
                      ? 'var(--compa11y-radio-disabled-color, #999)'
                      : 'var(--compa11y-radio-label-color, inherit)',
                    fontSize: 'var(--compa11y-radio-label-size, 1rem)',
                  }
            }
          >
            {labelContent}
          </span>
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
