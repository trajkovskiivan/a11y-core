/**
 * Checkbox Component
 *
 * Accessible checkbox and checkbox group components following WAI-ARIA patterns.
 * Supports single checkboxes, checkbox groups with fieldset/legend, indeterminate
 * (tri-state) for "select all" patterns, and full keyboard/screen reader support.
 *
 * @example
 * ```tsx
 * // Single checkbox
 * <Checkbox label="Accept terms" checked={agreed} onCheckedChange={setAgreed} />
 *
 * // With hint text
 * <Checkbox label="Subscribe" hint="We'll email you weekly." />
 *
 * // Indeterminate (select all)
 * <Checkbox label="Select all" indeterminate={someChecked} checked={allChecked}
 *   onCheckedChange={handleSelectAll} />
 *
 * // Checkbox group
 * <Checkbox.Group legend="Select toppings" value={toppings} onValueChange={setToppings}>
 *   <Checkbox value="cheese" label="Cheese" />
 *   <Checkbox value="peppers" label="Peppers" />
 *   <Checkbox value="olives" label="Olives" />
 * </Checkbox.Group>
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
import { useAnnouncer } from '../../hooks/use-announcer';
import { useFocusVisible } from '../../hooks/use-focus-visible';

const warnings = createComponentWarnings('Checkbox');

// ============================================================================
// SVG Icons
// ============================================================================

const CheckmarkIcon: React.FC = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    aria-hidden="true"
    style={{ display: 'block' }}
  >
    <path
      d="M2.5 6L5 8.5L9.5 3.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IndeterminateIcon: React.FC = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    aria-hidden="true"
    style={{ display: 'block' }}
  >
    <path
      d="M3 6H9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

// ============================================================================
// Types
// ============================================================================

export interface CheckboxGroupContextValue {
  /** Group name for form submission */
  name: string;
  /** Currently selected values */
  value: string[];
  /** Whether all checkboxes in the group are disabled */
  disabled: boolean;
  /** Whether to remove default styles */
  unstyled: boolean;
  /** Called when a checkbox in the group changes */
  onCheckboxChange: (checkboxValue: string, checked: boolean) => void;
}

export interface CheckboxGroupProps {
  /** Controlled selected values */
  value?: string[];
  /** Default selected values (uncontrolled) */
  defaultValue?: string[];
  /** Called when selected values change */
  onValueChange?: (value: string[]) => void;
  /** Whether all checkboxes are disabled */
  disabled?: boolean;
  /** Group label displayed as fieldset legend */
  legend?: React.ReactNode;
  /** Group-level error message */
  error?: React.ReactNode;
  /** Layout orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Group name for native inputs */
  name?: string;
  /** Remove default styles */
  unstyled?: boolean;
  /** Custom class name */
  className?: string;
  /** Children (Checkbox components) */
  children: React.ReactNode;
  /** Accessible label (if no visible legend) */
  'aria-label'?: string;
  /** Reference to external label element */
  'aria-labelledby'?: string;
}

export interface CheckboxProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'onChange' | 'type' | 'checked' | 'defaultChecked' | 'size'
  > {
  /** Controlled checked state */
  checked?: boolean;
  /** Default checked state (uncontrolled) */
  defaultChecked?: boolean;
  /** Called when checked state changes */
  onCheckedChange?: (checked: boolean) => void;
  /** Whether the checkbox is in indeterminate/mixed state */
  indeterminate?: boolean;
  /** Visible label text */
  label?: React.ReactNode;
  /** Helper/description text */
  hint?: React.ReactNode;
  /** Error message */
  error?: React.ReactNode;
  /** Whether the checkbox is disabled */
  disabled?: boolean;
  /** Value for use in checkbox groups */
  value?: string;
  /** Whether the checkbox is required */
  required?: boolean;
  /** Remove default styles */
  unstyled?: boolean;
  /** Custom class name */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

export interface CheckboxIndicatorProps {
  /** Custom indicator content (replaces default checkmark/dash) */
  children?: React.ReactNode;
  /** Custom class name */
  className?: string;
}

// ============================================================================
// Context
// ============================================================================

const CheckboxGroupContext = createContext<CheckboxGroupContextValue | null>(
  null
);

/**
 * Access the CheckboxGroup context. Returns null if not within a group.
 */
export function useCheckboxGroupContext(): CheckboxGroupContextValue | null {
  return useContext(CheckboxGroupContext);
}

// ============================================================================
// CheckboxGroup
// ============================================================================

/**
 * CheckboxGroup - Groups related checkboxes with fieldset/legend semantics.
 *
 * Uses `<fieldset>` and `<legend>` for proper screen reader group labeling.
 * Manages an array of selected values for controlled/uncontrolled usage.
 *
 * @example
 * ```tsx
 * <Checkbox.Group legend="Toppings" value={toppings} onValueChange={setToppings}>
 *   <Checkbox value="cheese" label="Cheese" />
 *   <Checkbox value="peppers" label="Peppers" />
 * </Checkbox.Group>
 * ```
 */
export const CheckboxGroup = forwardRef<HTMLFieldSetElement, CheckboxGroupProps>(
  function CheckboxGroup(
    {
      value: controlledValue,
      defaultValue = [],
      onValueChange,
      disabled = false,
      legend,
      error,
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
    const generatedName = useId('checkbox-group');
    const name = providedName || generatedName;
    const errorId = useId('checkbox-group-error');

    const [uncontrolledValue, setUncontrolledValue] =
      useState<string[]>(defaultValue);
    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : uncontrolledValue;

    // Warn if no accessible label
    useEffect(() => {
      if (!legend && !ariaLabel && !ariaLabelledBy) {
        warnings.warning(
          'CheckboxGroup has no accessible label. Screen readers need this to identify the group.',
          'Add legend="...", aria-label="...", or aria-labelledby="..."'
        );
      }
    }, [legend, ariaLabel, ariaLabelledBy]);

    const handleCheckboxChange = useCallback(
      (checkboxValue: string, checked: boolean) => {
        const currentValue = isControlled ? controlledValue! : uncontrolledValue;
        const newValue = checked
          ? [...currentValue, checkboxValue]
          : currentValue.filter((v) => v !== checkboxValue);

        if (!isControlled) {
          setUncontrolledValue(newValue);
        }
        onValueChange?.(newValue);
      },
      [isControlled, controlledValue, uncontrolledValue, onValueChange]
    );

    const contextValue: CheckboxGroupContextValue = {
      name,
      value,
      disabled,
      unstyled,
      onCheckboxChange: handleCheckboxChange,
    };

    const hasError = Boolean(error);

    // Fieldset styles
    const fieldsetStyle: React.CSSProperties = {
      border: 'none',
      margin: 0,
      padding: 0,
      minWidth: 0,
    };

    const legendStyle: React.CSSProperties = unstyled
      ? { padding: 0, marginBottom: '0.5rem' }
      : {
          padding: 0,
          marginBottom: '0.5rem',
          fontWeight: 600,
        };

    const itemsStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: orientation === 'horizontal' ? 'row' : 'column',
      flexWrap: orientation === 'horizontal' ? 'wrap' : undefined,
      gap: 'var(--compa11y-checkbox-group-gap, 0.75rem)',
    };

    const errorStyle: React.CSSProperties = unstyled
      ? { marginTop: '0.25rem' }
      : {
          color: 'var(--compa11y-checkbox-group-error-color, #ef4444)',
          fontSize: '0.8125rem',
          marginTop: '0.25rem',
        };

    return (
      <CheckboxGroupContext.Provider value={contextValue}>
        <fieldset
          ref={ref}
          className={className}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-describedby={hasError ? errorId : undefined}
          disabled={disabled}
          data-compa11y-checkbox-group=""
          data-orientation={orientation}
          data-disabled={disabled ? 'true' : undefined}
          style={fieldsetStyle}
        >
          {legend && (
            <legend
              data-compa11y-checkbox-group-legend=""
              style={legendStyle}
            >
              {legend}
            </legend>
          )}
          <div style={itemsStyle}>{children}</div>
          {hasError && (
            <div
              id={errorId}
              role="alert"
              data-compa11y-checkbox-group-error=""
              style={errorStyle}
            >
              {error}
            </div>
          )}
        </fieldset>
      </CheckboxGroupContext.Provider>
    );
  }
);

CheckboxGroup.displayName = 'CheckboxGroup';

// ============================================================================
// Checkbox
// ============================================================================

/**
 * Checkbox - An accessible checkbox with label, hint, error, and indeterminate support.
 *
 * Uses a native `<input type="checkbox">` for proper form integration and
 * built-in keyboard behavior (Space to toggle, Tab to focus).
 *
 * Supports standalone usage and usage within a CheckboxGroup.
 *
 * @example
 * ```tsx
 * // Standalone
 * <Checkbox label="Accept terms" checked={agreed} onCheckedChange={setAgreed} />
 *
 * // With hint
 * <Checkbox label="Subscribe" hint="Weekly newsletter" />
 *
 * // Indeterminate
 * <Checkbox label="Select all" indeterminate={someSelected} />
 *
 * // In a group
 * <Checkbox.Group legend="Options" value={selected} onValueChange={setSelected}>
 *   <Checkbox value="a" label="Option A" />
 *   <Checkbox value="b" label="Option B" />
 * </Checkbox.Group>
 * ```
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(
    {
      checked: controlledChecked,
      defaultChecked = false,
      onCheckedChange,
      indeterminate = false,
      label,
      hint,
      error,
      disabled: localDisabled = false,
      value,
      required = false,
      unstyled: localUnstyled,
      className = '',
      size = 'md',
      name: localName,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      'aria-describedby': externalDescribedBy,
      onClick,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) {
    const groupContext = useCheckboxGroupContext();
    const id = useId('checkbox');
    const fieldId = `${id}-input`;
    const labelId = `${id}-label`;
    const hintId = `${id}-hint`;
    const errorId = `${id}-error`;

    const { announce } = useAnnouncer();
    const { isFocusVisible, focusProps } = useFocusVisible();

    const isInGroup = groupContext !== null;
    const disabled = isInGroup ? groupContext.disabled || localDisabled : localDisabled;
    const unstyled = localUnstyled ?? (isInGroup ? groupContext.unstyled : false);
    const name = isInGroup ? groupContext.name : localName;

    // Resolve checked state
    const [uncontrolledChecked, setUncontrolledChecked] =
      useState(defaultChecked);

    const checked = isInGroup
      ? groupContext.value.includes(value || '')
      : controlledChecked !== undefined
        ? controlledChecked
        : uncontrolledChecked;

    // Internal ref for setting indeterminate imperatively
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

    // Set indeterminate imperatively (no HTML attribute for this)
    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    // Warn if no accessible label
    useEffect(() => {
      if (!label && !ariaLabel && !ariaLabelledBy) {
        warnings.warning(
          'Checkbox has no accessible label. Screen readers need this to identify the checkbox.',
          'Add label="...", aria-label="...", or aria-labelledby="..."'
        );
      }
    }, [label, ariaLabel, ariaLabelledBy]);

    const handleChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const newChecked = event.target.checked;

        if (isInGroup) {
          groupContext.onCheckboxChange(value || '', newChecked);
        } else {
          if (controlledChecked === undefined) {
            setUncontrolledChecked(newChecked);
          }
          onCheckedChange?.(newChecked);
        }

        const labelText =
          typeof label === 'string' ? label : ariaLabel || 'Checkbox';
        announce(`${labelText} ${newChecked ? 'checked' : 'unchecked'}`);
      },
      [
        isInGroup,
        groupContext,
        value,
        controlledChecked,
        onCheckedChange,
        label,
        ariaLabel,
        announce,
      ]
    );

    const handleFocus = useCallback(
      (event: React.FocusEvent<HTMLInputElement>) => {
        focusProps.onFocus();
        onFocus?.(event);
      },
      [focusProps, onFocus]
    );

    const handleBlur = useCallback(
      (event: React.FocusEvent<HTMLInputElement>) => {
        focusProps.onBlur();
        onBlur?.(event);
      },
      [focusProps, onBlur]
    );

    const hasLabel = Boolean(label);
    const hasHint = Boolean(hint);
    const hasError = Boolean(error);

    // Build aria-describedby
    const describedByParts: string[] = [];
    if (externalDescribedBy) describedByParts.push(externalDescribedBy);
    if (hasHint) describedByParts.push(hintId);
    if (hasError) describedByParts.push(errorId);
    const describedBy = describedByParts.length
      ? describedByParts.join(' ')
      : undefined;

    // Size config
    const sizes = {
      sm: { box: 16 },
      md: { box: 20 },
      lg: { box: 24 },
    };
    const sizeConfig = sizes[size];

    // Styles
    const wrapperStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      cursor: disabled ? 'not-allowed' : 'pointer',
      userSelect: 'none',
      ...(disabled && !unstyled ? { opacity: 0.5 } : {}),
    };

    const controlStyle: React.CSSProperties = {
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    };

    const hiddenInputStyle: React.CSSProperties = {
      position: 'absolute',
      opacity: 0,
      width: '100%',
      height: '100%',
      margin: 0,
      cursor: 'inherit',
      zIndex: 1,
    };

    const indicatorStyle: React.CSSProperties = unstyled
      ? {}
      : {
          width: sizeConfig.box,
          height: sizeConfig.box,
          border:
            checked || indeterminate
              ? 'var(--compa11y-checkbox-checked-border, 2px solid #0066cc)'
              : 'var(--compa11y-checkbox-border, 2px solid #666)',
          borderRadius: 'var(--compa11y-checkbox-radius, 3px)',
          background:
            checked || indeterminate
              ? 'var(--compa11y-checkbox-checked-bg, #0066cc)'
              : 'var(--compa11y-checkbox-bg, white)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'all 0.15s ease',
          pointerEvents: 'none' as const,
          color: 'var(--compa11y-checkbox-check-color, white)',
          ...(isFocusVisible
            ? {
                outline: '2px solid var(--compa11y-focus-color, #0066cc)',
                outlineOffset: '2px',
              }
            : {}),
        };

    const contentStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.125rem',
    };

    const labelStyle: React.CSSProperties = unstyled
      ? { cursor: 'inherit' }
      : {
          cursor: 'inherit',
          color: 'var(--compa11y-checkbox-label-color, inherit)',
        };

    const hintStyle: React.CSSProperties = unstyled
      ? {}
      : {
          color: 'var(--compa11y-checkbox-hint-color, #666)',
          fontSize: '0.8125rem',
        };

    const errorStyles: React.CSSProperties = unstyled
      ? {}
      : {
          color: 'var(--compa11y-checkbox-error-color, #ef4444)',
          fontSize: '0.8125rem',
        };

    return (
      <div
        className={className}
        data-compa11y-checkbox=""
        data-checked={checked ? 'true' : 'false'}
        data-indeterminate={indeterminate ? 'true' : undefined}
        data-disabled={disabled ? 'true' : undefined}
        data-size={size}
        style={wrapperStyle}
      >
        <div style={controlStyle}>
          <input
            ref={mergedRef}
            type="checkbox"
            id={fieldId}
            name={name}
            value={value}
            checked={checked}
            onChange={handleChange}
            onClick={onClick}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            required={required}
            aria-required={required || undefined}
            aria-invalid={hasError || undefined}
            aria-label={!hasLabel && !ariaLabelledBy ? ariaLabel : undefined}
            aria-labelledby={
              ariaLabelledBy || (hasLabel ? labelId : undefined)
            }
            aria-describedby={describedBy}
            aria-checked={indeterminate ? 'mixed' : checked}
            tabIndex={disabled ? -1 : 0}
            style={hiddenInputStyle}
            {...props}
          />
          {!unstyled && (
            <div
              data-compa11y-checkbox-indicator=""
              aria-hidden="true"
              style={indicatorStyle}
            >
              {checked && !indeterminate && <CheckmarkIcon />}
              {indeterminate && <IndeterminateIcon />}
            </div>
          )}
        </div>
        {(hasLabel || hasHint || hasError) && (
          <div style={contentStyle}>
            {hasLabel && (
              <label
                htmlFor={fieldId}
                id={labelId}
                data-compa11y-checkbox-label=""
                style={labelStyle}
              >
                {label}
                {required && (
                  <span
                    aria-hidden="true"
                    style={{
                      color: 'var(--compa11y-checkbox-required-color, #ef4444)',
                      marginLeft: '0.125rem',
                    }}
                  >
                    *
                  </span>
                )}
              </label>
            )}
            {hasHint && (
              <div
                id={hintId}
                data-compa11y-checkbox-hint=""
                style={hintStyle}
              >
                {hint}
              </div>
            )}
            {hasError && (
              <div
                id={errorId}
                role="alert"
                data-compa11y-checkbox-error=""
                style={errorStyles}
              >
                {error}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

// ============================================================================
// CheckboxIndicator (optional compound sub-component)
// ============================================================================

/**
 * CheckboxIndicator - Optional custom indicator for compound usage.
 *
 * When used inside a checkbox, replaces the default checkmark/dash icons.
 * Primarily for advanced customization scenarios.
 */
export const CheckboxIndicator = forwardRef<
  HTMLDivElement,
  CheckboxIndicatorProps
>(function CheckboxIndicator({ children, className }, ref) {
  return (
    <div
      ref={ref}
      className={className}
      data-compa11y-checkbox-indicator=""
      aria-hidden="true"
    >
      {children}
    </div>
  );
});

CheckboxIndicator.displayName = 'CheckboxIndicator';

// ============================================================================
// Compound Component
// ============================================================================

export const CheckboxCompound = Object.assign(Checkbox, {
  Group: CheckboxGroup,
  Indicator: CheckboxIndicator,
});
