/**
 * Input Component
 *
 * A foundational accessible input with label, hint, and error support.
 * Supports both a simple props-based API and a compound component API
 * for custom layouts.
 *
 * @example
 * ```tsx
 * // Simple props mode
 * <Input
 *   label="Email"
 *   hint="We'll never share your email"
 *   error={emailError}
 *   type="email"
 *   required
 *   value={email}
 *   onValueChange={setEmail}
 * />
 *
 * // Compound mode
 * <Input value={name} onValueChange={setName}>
 *   <Input.Label>Full Name</Input.Label>
 *   <Input.Field placeholder="John Doe" required />
 *   <Input.Hint>Enter your first and last name</Input.Hint>
 *   <Input.Error>{nameError}</Input.Error>
 * </Input>
 * ```
 */

import {
  Children,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { useId } from '../../hooks/use-id';
import { useFocusVisible } from '../../hooks/use-focus-visible';

// =============================================================================
// Types
// =============================================================================

type InputType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'search';

export interface InputProps {
  /** Controlled value */
  value?: string;
  /** Uncontrolled default value */
  defaultValue?: string;
  /** Called when value changes */
  onValueChange?: (value: string) => void;

  /** Input type */
  type?: InputType;

  /** Visible label text (props mode) */
  label?: ReactNode;
  /** Hint/description text (props mode) */
  hint?: ReactNode;
  /** Error message (props mode) */
  error?: ReactNode;

  /** Whether the input is required */
  required?: boolean;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Whether the input is read-only */
  readOnly?: boolean;

  /** Accessible label when no visible label */
  'aria-label'?: string;
  /** ID of external labelling element */
  'aria-labelledby'?: string;

  /** Placeholder text */
  placeholder?: string;
  /** Input name for form submission */
  name?: string;
  /** Autocomplete hint */
  autoComplete?: string;
  /** Maximum character length */
  maxLength?: number;
  /** Minimum character length */
  minLength?: number;
  /** Validation pattern */
  pattern?: string;
  /** Input mode hint for virtual keyboards */
  inputMode?: 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';

  /** Provided element ID (overrides generated) */
  id?: string;

  /** Remove default styles for full customization */
  unstyled?: boolean;
  /** CSS class name */
  className?: string;

  /** Focus event handler */
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  /** Blur event handler */
  onBlur?: React.FocusEventHandler<HTMLInputElement>;

  /** Children for compound mode */
  children?: ReactNode;
}

export interface InputFieldProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'type' | 'onChange' | 'value'
  > {
  /** Input type */
  type?: InputType;
}

export interface InputLabelProps {
  children: ReactNode;
  className?: string;
}

export interface InputHintProps {
  children: ReactNode;
  className?: string;
}

export interface InputErrorProps {
  children?: ReactNode;
  className?: string;
}

// =============================================================================
// Context
// =============================================================================

interface InputContextValue {
  fieldId: string;
  labelId: string;
  hintId: string;
  errorId: string;
  value: string;
  setValue: (value: string) => void;
  hasError: boolean;
  hasHint: boolean;
  setHasHint: (hasHint: boolean) => void;
  disabled: boolean;
  readOnly: boolean;
  required: boolean;
  isFocusVisible: boolean;
  focusProps: { onFocus: () => void; onBlur: () => void };
  unstyled: boolean;
}

const InputContext = createContext<InputContextValue | null>(null);

function useInputContext(): InputContextValue {
  const ctx = useContext(InputContext);
  if (!ctx) {
    throw new Error(
      '[Compa11y Input]: Input sub-components (Input.Label, Input.Field, etc.) must be used within <Input>.'
    );
  }
  return ctx;
}

export { useInputContext, type InputContextValue };

// =============================================================================
// Sub-components (for compound mode)
// =============================================================================

/**
 * Input label sub-component
 */
export const InputLabel = forwardRef<HTMLLabelElement, InputLabelProps>(
  function InputLabel({ children, className }, ref) {
    const ctx = useInputContext();

    return (
      <label
        ref={ref}
        id={ctx.labelId}
        htmlFor={ctx.fieldId}
        data-compa11y-input-label=""
        className={className}
        style={
          ctx.unstyled
            ? {}
            : {
                display: 'block',
                color: ctx.disabled
                  ? 'var(--compa11y-input-disabled-color, #999)'
                  : 'var(--compa11y-input-label-color, inherit)',
                fontSize: 'var(--compa11y-input-label-size, 0.875rem)',
                fontWeight:
                  'var(--compa11y-input-label-weight, 500)' as any,
              }
        }
      >
        {children}
        {ctx.required && (
          <span
            data-compa11y-input-required=""
            aria-hidden="true"
            style={
              ctx.unstyled
                ? {}
                : {
                    color: 'var(--compa11y-input-required-color, #ef4444)',
                    marginLeft: '0.125rem',
                  }
            }
          >
            *
          </span>
        )}
      </label>
    );
  }
);

InputLabel.displayName = 'InputLabel';

/**
 * Input field sub-component (the actual <input> element)
 */
export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  function InputField(
    {
      type = 'text',
      onFocus: providedOnFocus,
      onBlur: providedOnBlur,
      className,
      style,
      ...rest
    },
    ref
  ) {
    const ctx = useInputContext();
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

    const handleChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        ctx.setValue(event.target.value);
      },
      [ctx.setValue]
    );

    const handleFocus = useCallback(
      (event: React.FocusEvent<HTMLInputElement>) => {
        ctx.focusProps.onFocus();
        providedOnFocus?.(event);
      },
      [ctx.focusProps, providedOnFocus]
    );

    const handleBlur = useCallback(
      (event: React.FocusEvent<HTMLInputElement>) => {
        ctx.focusProps.onBlur();
        providedOnBlur?.(event);
      },
      [ctx.focusProps, providedOnBlur]
    );

    // Build aria-describedby — only include IDs for elements that exist
    const describedByParts: string[] = [];
    if (ctx.hasHint) {
      describedByParts.push(ctx.hintId);
    }
    if (ctx.hasError) {
      describedByParts.push(ctx.errorId);
    }

    return (
      <input
        ref={mergedRef}
        id={ctx.fieldId}
        type={type}
        value={ctx.value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={ctx.disabled}
        readOnly={ctx.readOnly}
        aria-describedby={describedByParts.join(' ') || undefined}
        aria-invalid={ctx.hasError ? 'true' : undefined}
        aria-required={ctx.required ? 'true' : undefined}
        data-compa11y-input-field=""
        className={className}
        style={
          ctx.unstyled
            ? style
            : {
                width: '100%',
                padding: 'var(--compa11y-input-padding, 0.5rem 0.75rem)',
                border: ctx.hasError
                  ? '1px solid var(--compa11y-input-border-error, #ef4444)'
                  : 'var(--compa11y-input-border, 1px solid #ccc)',
                borderRadius: 'var(--compa11y-input-radius, 4px)',
                fontSize: 'var(--compa11y-input-font-size, 0.875rem)',
                fontFamily: 'inherit',
                background: ctx.disabled
                  ? 'var(--compa11y-input-disabled-bg, #f5f5f5)'
                  : ctx.readOnly
                    ? 'var(--compa11y-input-readonly-bg, #f9f9f9)'
                    : 'var(--compa11y-input-bg, white)',
                color: 'inherit',
                cursor: ctx.disabled ? 'not-allowed' : undefined,
                opacity: ctx.disabled
                  ? 'var(--compa11y-input-disabled-opacity, 0.7)' as any
                  : undefined,
                ...(ctx.isFocusVisible && !ctx.disabled
                  ? {
                      outline:
                        ctx.hasError
                          ? '2px solid var(--compa11y-input-border-error, #ef4444)'
                          : '2px solid var(--compa11y-focus-color, #0066cc)',
                      outlineOffset: '-1px',
                      borderColor: ctx.hasError
                        ? 'var(--compa11y-input-border-error, #ef4444)'
                        : 'var(--compa11y-input-border-focus, #0066cc)',
                    }
                  : {}),
                ...style,
              }
        }
        {...rest}
      />
    );
  }
);

InputField.displayName = 'InputField';

/**
 * Input hint sub-component
 */
export const InputHint = forwardRef<HTMLDivElement, InputHintProps>(
  function InputHint({ children, className }, ref) {
    const ctx = useInputContext();

    // Register hint presence so InputField knows to include hintId in aria-describedby
    useEffect(() => {
      ctx.setHasHint(true);
      return () => ctx.setHasHint(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <div
        ref={ref}
        id={ctx.hintId}
        data-compa11y-input-hint=""
        className={className}
        style={
          ctx.unstyled
            ? {}
            : {
                color: 'var(--compa11y-input-hint-color, #666)',
                fontSize: 'var(--compa11y-input-hint-size, 0.8125rem)',
              }
        }
      >
        {children}
      </div>
    );
  }
);

InputHint.displayName = 'InputHint';

/**
 * Input error sub-component - only renders when children are truthy
 */
export const InputError = forwardRef<HTMLDivElement, InputErrorProps>(
  function InputError({ children, className }, ref) {
    const ctx = useInputContext();

    if (!children) return null;

    return (
      <div
        ref={ref}
        id={ctx.errorId}
        role="alert"
        data-compa11y-input-error=""
        className={className}
        style={
          ctx.unstyled
            ? {}
            : {
                color: 'var(--compa11y-input-error-color, #ef4444)',
                fontSize: 'var(--compa11y-input-error-size, 0.8125rem)',
              }
        }
      >
        {children}
      </div>
    );
  }
);

InputError.displayName = 'InputError';

// =============================================================================
// Root Input component
// =============================================================================

/**
 * Accessible Input component with label, hint, and error support.
 *
 * Supports two modes:
 * - **Props mode**: Pass `label`, `hint`, `error` as props for automatic layout
 * - **Compound mode**: Use `<Input.Label>`, `<Input.Field>`, etc. as children for custom layout
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input(
    {
      value: controlledValue,
      defaultValue = '',
      onValueChange,
      type = 'text',
      label,
      hint,
      error,
      required = false,
      disabled = false,
      readOnly = false,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      placeholder,
      name,
      autoComplete,
      maxLength,
      minLength,
      pattern,
      inputMode,
      id: providedId,
      unstyled = false,
      className,
      onFocus: providedOnFocus,
      onBlur: providedOnBlur,
      children,
    },
    ref
  ) {
    const generatedId = useId('input');
    const baseId = providedId || generatedId;
    const fieldId = `${baseId}-field`;
    const labelId = `${baseId}-label`;
    const hintId = `${baseId}-hint`;
    const errorId = `${baseId}-error`;

    // Controlled / Uncontrolled
    const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
    const isControlled = controlledValue !== undefined;
    const currentValue = isControlled ? controlledValue : uncontrolledValue;

    // Track whether a hint sub-component is mounted (compound mode)
    const [compoundHasHint, setCompoundHasHint] = useState(false);

    const setValue = useCallback(
      (newValue: string) => {
        if (!isControlled) {
          setUncontrolledValue(newValue);
        }
        onValueChange?.(newValue);
      },
      [isControlled, onValueChange]
    );

    // Focus visible
    const { isFocusVisible, focusProps } = useFocusVisible();

    // Props-mode refs and handlers (must be called unconditionally for Rules of Hooks)
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

    const handleChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value);
      },
      [setValue]
    );

    const handleFocus = useCallback(
      (event: React.FocusEvent<HTMLInputElement>) => {
        focusProps.onFocus();
        providedOnFocus?.(event);
      },
      [focusProps, providedOnFocus]
    );

    const handleBlur = useCallback(
      (event: React.FocusEvent<HTMLInputElement>) => {
        focusProps.onBlur();
        providedOnBlur?.(event);
      },
      [focusProps, providedOnBlur]
    );

    // Dev warnings
    useEffect(() => {
      if (process.env.NODE_ENV !== 'production') {
        const isCompound = Children.count(children) > 0;
        if (!isCompound && !label && !ariaLabel && !ariaLabelledBy) {
          console.warn(
            '[Compa11y Input]: Input has no accessible label. Screen readers need this to identify the input. ' +
              'Use label prop, aria-label, or aria-labelledby.'
          );
        }
      }
    }, [children, label, ariaLabel, ariaLabelledBy]);

    const hasError = Boolean(error);
    const isCompound = Children.count(children) > 0;

    const contextValue: InputContextValue = {
      fieldId,
      labelId,
      hintId,
      errorId,
      value: currentValue,
      setValue,
      hasError,
      hasHint: isCompound ? compoundHasHint : !!hint,
      setHasHint: setCompoundHasHint,
      disabled,
      readOnly,
      required,
      isFocusVisible,
      focusProps,
      unstyled,
    };

    // Data attributes for the wrapper
    const dataAttrs = {
      'data-compa11y-input': '',
      'data-error': hasError ? 'true' : 'false',
      'data-disabled': disabled ? 'true' : 'false',
      'data-required': required ? 'true' : 'false',
      'data-readonly': readOnly ? 'true' : 'false',
    };

    const wrapperStyle = unstyled
      ? {}
      : {
          display: 'flex',
          flexDirection: 'column' as const,
          gap: '0.25rem',
        };

    // ----- Compound mode -----
    if (isCompound) {
      return (
        <InputContext.Provider value={contextValue}>
          <div {...dataAttrs} className={className} style={wrapperStyle}>
            {children}
          </div>
        </InputContext.Provider>
      );
    }

    // ----- Props mode -----
    // Build aria-describedby
    const describedByParts: string[] = [];
    if (hint) describedByParts.push(hintId);
    if (hasError) describedByParts.push(errorId);
    const ariaDescribedBy =
      describedByParts.length > 0 ? describedByParts.join(' ') : undefined;

    return (
      <div {...dataAttrs} className={className} style={wrapperStyle}>
        {/* Label */}
        {label && (
          <label
            id={labelId}
            htmlFor={fieldId}
            data-compa11y-input-label=""
            style={
              unstyled
                ? {}
                : {
                    display: 'block',
                    color: disabled
                      ? 'var(--compa11y-input-disabled-color, #999)'
                      : 'var(--compa11y-input-label-color, inherit)',
                    fontSize: 'var(--compa11y-input-label-size, 0.875rem)',
                    fontWeight:
                      'var(--compa11y-input-label-weight, 500)' as any,
                  }
            }
          >
            {label}
            {required && (
              <span
                data-compa11y-input-required=""
                aria-hidden="true"
                style={
                  unstyled
                    ? {}
                    : {
                        color:
                          'var(--compa11y-input-required-color, #ef4444)',
                        marginLeft: '0.125rem',
                      }
                }
              >
                *
              </span>
            )}
          </label>
        )}

        {/* Input field */}
        <input
          ref={mergedRef}
          id={fieldId}
          type={type}
          value={currentValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          placeholder={placeholder}
          name={name}
          autoComplete={autoComplete}
          maxLength={maxLength}
          minLength={minLength}
          pattern={pattern}
          inputMode={inputMode}
          aria-label={!label ? ariaLabel : undefined}
          aria-labelledby={
            !label && ariaLabelledBy
              ? ariaLabelledBy
              : label
                ? labelId
                : undefined
          }
          aria-describedby={ariaDescribedBy}
          aria-invalid={hasError ? 'true' : undefined}
          aria-required={required ? 'true' : undefined}
          data-compa11y-input-field=""
          style={
            unstyled
              ? {}
              : {
                  width: '100%',
                  padding: 'var(--compa11y-input-padding, 0.5rem 0.75rem)',
                  border: hasError
                    ? '1px solid var(--compa11y-input-border-error, #ef4444)'
                    : 'var(--compa11y-input-border, 1px solid #ccc)',
                  borderRadius: 'var(--compa11y-input-radius, 4px)',
                  fontSize: 'var(--compa11y-input-font-size, 0.875rem)',
                  fontFamily: 'inherit',
                  background: disabled
                    ? 'var(--compa11y-input-disabled-bg, #f5f5f5)'
                    : readOnly
                      ? 'var(--compa11y-input-readonly-bg, #f9f9f9)'
                      : 'var(--compa11y-input-bg, white)',
                  color: 'inherit',
                  cursor: disabled ? 'not-allowed' : undefined,
                  opacity: disabled
                    ? ('var(--compa11y-input-disabled-opacity, 0.7)' as any)
                    : undefined,
                  ...(isFocusVisible && !disabled
                    ? {
                        outline: hasError
                          ? '2px solid var(--compa11y-input-border-error, #ef4444)'
                          : '2px solid var(--compa11y-focus-color, #0066cc)',
                        outlineOffset: '-1px',
                        borderColor: hasError
                          ? 'var(--compa11y-input-border-error, #ef4444)'
                          : 'var(--compa11y-input-border-focus, #0066cc)',
                      }
                    : {}),
                }
          }
        />

        {/* Hint */}
        {hint && (
          <div
            id={hintId}
            data-compa11y-input-hint=""
            style={
              unstyled
                ? {}
                : {
                    color: 'var(--compa11y-input-hint-color, #666)',
                    fontSize: 'var(--compa11y-input-hint-size, 0.8125rem)',
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
            data-compa11y-input-error=""
            style={
              unstyled
                ? {}
                : {
                    color: 'var(--compa11y-input-error-color, #ef4444)',
                    fontSize:
                      'var(--compa11y-input-error-size, 0.8125rem)',
                  }
            }
          >
            {error}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// =============================================================================
// Compound export
// =============================================================================

export const InputCompound = Object.assign(Input, {
  Label: InputLabel,
  Field: InputField,
  Hint: InputHint,
  Error: InputError,
});
