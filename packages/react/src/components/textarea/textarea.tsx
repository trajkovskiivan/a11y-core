/**
 * Textarea Component
 *
 * A foundational accessible textarea with label, hint, and error support.
 * Supports both a simple props-based API and a compound component API
 * for custom layouts.
 *
 * @example
 * ```tsx
 * // Simple props mode
 * <Textarea
 *   label="Description"
 *   hint="Provide a brief summary"
 *   error={descError}
 *   required
 *   rows={4}
 *   value={desc}
 *   onValueChange={setDesc}
 * />
 *
 * // Compound mode
 * <Textarea value={bio} onValueChange={setBio}>
 *   <Textarea.Label>Bio</Textarea.Label>
 *   <Textarea.Field rows={5} placeholder="Tell us about yourself..." />
 *   <Textarea.Hint>Markdown is supported</Textarea.Hint>
 *   <Textarea.Error>{bioError}</Textarea.Error>
 * </Textarea>
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
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';
import { useId } from '../../hooks/use-id';
import { useFocusVisible } from '../../hooks/use-focus-visible';

// =============================================================================
// Types
// =============================================================================

type TextareaResize = 'none' | 'both' | 'horizontal' | 'vertical';

export interface TextareaProps {
  /** Controlled value */
  value?: string;
  /** Uncontrolled default value */
  defaultValue?: string;
  /** Called when value changes */
  onValueChange?: (value: string) => void;

  /** Number of visible text rows */
  rows?: number;
  /** Resize behavior */
  resize?: TextareaResize;

  /** Visible label text (props mode) */
  label?: ReactNode;
  /** Hint/description text (props mode) */
  hint?: ReactNode;
  /** Error message (props mode) */
  error?: ReactNode;

  /** Whether the textarea is required */
  required?: boolean;
  /** Whether the textarea is disabled */
  disabled?: boolean;
  /** Whether the textarea is read-only */
  readOnly?: boolean;

  /** Accessible label when no visible label */
  'aria-label'?: string;
  /** ID of external labelling element */
  'aria-labelledby'?: string;

  /** Placeholder text */
  placeholder?: string;
  /** Textarea name for form submission */
  name?: string;
  /** Autocomplete hint */
  autoComplete?: string;
  /** Maximum character length */
  maxLength?: number;
  /** Minimum character length */
  minLength?: number;

  /** Provided element ID (overrides generated) */
  id?: string;

  /** Remove default styles for full customization */
  unstyled?: boolean;
  /** CSS class name */
  className?: string;

  /** Focus event handler */
  onFocus?: React.FocusEventHandler<HTMLTextAreaElement>;
  /** Blur event handler */
  onBlur?: React.FocusEventHandler<HTMLTextAreaElement>;

  /** Children for compound mode */
  children?: ReactNode;
}

export interface TextareaFieldProps
  extends Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    'onChange' | 'value'
  > {}

export interface TextareaLabelProps {
  children: ReactNode;
  className?: string;
}

export interface TextareaHintProps {
  children: ReactNode;
  className?: string;
}

export interface TextareaErrorProps {
  children?: ReactNode;
  className?: string;
}

// =============================================================================
// Context
// =============================================================================

interface TextareaContextValue {
  fieldId: string;
  labelId: string;
  hintId: string;
  errorId: string;
  value: string;
  setValue: (value: string) => void;
  hasError: boolean;
  hasHint: boolean;
  setHasHint: (value: boolean) => void;
  disabled: boolean;
  readOnly: boolean;
  required: boolean;
  rows: number;
  resize: TextareaResize;
  isFocusVisible: boolean;
  focusProps: { onFocus: () => void; onBlur: () => void };
  unstyled: boolean;
}

const TextareaContext = createContext<TextareaContextValue | null>(null);

function useTextareaContext(): TextareaContextValue {
  const ctx = useContext(TextareaContext);
  if (!ctx) {
    throw new Error(
      '[Compa11y Textarea]: Textarea sub-components (Textarea.Label, Textarea.Field, etc.) must be used within <Textarea>.'
    );
  }
  return ctx;
}

export { useTextareaContext, type TextareaContextValue };

// =============================================================================
// Sub-components (for compound mode)
// =============================================================================

/**
 * Textarea label sub-component
 */
export const TextareaLabel = forwardRef<HTMLLabelElement, TextareaLabelProps>(
  function TextareaLabel({ children, className }, ref) {
    const ctx = useTextareaContext();

    return (
      <label
        ref={ref}
        id={ctx.labelId}
        htmlFor={ctx.fieldId}
        data-compa11y-textarea-label=""
        className={className}
        style={
          ctx.unstyled
            ? {}
            : {
                display: 'block',
                color: ctx.disabled
                  ? 'var(--compa11y-textarea-disabled-color, #999)'
                  : 'var(--compa11y-textarea-label-color, inherit)',
                fontSize: 'var(--compa11y-textarea-label-size, 0.875rem)',
                fontWeight:
                  'var(--compa11y-textarea-label-weight, 500)' as any,
              }
        }
      >
        {children}
        {ctx.required && (
          <span
            data-compa11y-textarea-required=""
            aria-hidden="true"
            style={
              ctx.unstyled
                ? {}
                : {
                    color: 'var(--compa11y-textarea-required-color, #ef4444)',
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

TextareaLabel.displayName = 'TextareaLabel';

/**
 * Textarea field sub-component (the actual <textarea> element)
 */
export const TextareaField = forwardRef<
  HTMLTextAreaElement,
  TextareaFieldProps
>(
  function TextareaField(
    {
      onFocus: providedOnFocus,
      onBlur: providedOnBlur,
      className,
      style,
      rows: rowsOverride,
      ...rest
    },
    ref
  ) {
    const ctx = useTextareaContext();
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const mergedRef = useCallback(
      (node: HTMLTextAreaElement | null) => {
        (
          textareaRef as React.MutableRefObject<HTMLTextAreaElement | null>
        ).current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (
            ref as React.MutableRefObject<HTMLTextAreaElement | null>
          ).current = node;
        }
      },
      [ref]
    );

    const handleChange = useCallback(
      (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        ctx.setValue(event.target.value);
      },
      [ctx.setValue]
    );

    const handleFocus = useCallback(
      (event: React.FocusEvent<HTMLTextAreaElement>) => {
        ctx.focusProps.onFocus();
        providedOnFocus?.(event);
      },
      [ctx.focusProps, providedOnFocus]
    );

    const handleBlur = useCallback(
      (event: React.FocusEvent<HTMLTextAreaElement>) => {
        ctx.focusProps.onBlur();
        providedOnBlur?.(event);
      },
      [ctx.focusProps, providedOnBlur]
    );

    // Build aria-describedby
    const describedByParts: string[] = [];
    if (ctx.hasHint) describedByParts.push(ctx.hintId);
    if (ctx.hasError) describedByParts.push(ctx.errorId);

    return (
      <textarea
        ref={mergedRef}
        id={ctx.fieldId}
        rows={rowsOverride ?? ctx.rows}
        value={ctx.value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={ctx.disabled}
        readOnly={ctx.readOnly}
        aria-describedby={describedByParts.join(' ') || undefined}
        aria-invalid={ctx.hasError ? 'true' : undefined}
        aria-required={ctx.required ? 'true' : undefined}
        data-compa11y-textarea-field=""
        className={className}
        style={
          ctx.unstyled
            ? style
            : {
                width: '100%',
                padding: 'var(--compa11y-textarea-padding, 0.5rem 0.75rem)',
                border: ctx.hasError
                  ? '1px solid var(--compa11y-textarea-border-error, #ef4444)'
                  : 'var(--compa11y-textarea-border, 1px solid #ccc)',
                borderRadius: 'var(--compa11y-textarea-radius, 4px)',
                fontSize: 'var(--compa11y-textarea-font-size, 0.875rem)',
                fontFamily: 'inherit',
                lineHeight: '1.5',
                resize: ctx.resize,
                background: ctx.disabled
                  ? 'var(--compa11y-textarea-disabled-bg, #f5f5f5)'
                  : ctx.readOnly
                    ? 'var(--compa11y-textarea-readonly-bg, #f9f9f9)'
                    : 'var(--compa11y-textarea-bg, white)',
                color: 'inherit',
                cursor: ctx.disabled ? 'not-allowed' : undefined,
                opacity: ctx.disabled
                  ? ('var(--compa11y-textarea-disabled-opacity, 0.7)' as any)
                  : undefined,
                ...(ctx.isFocusVisible && !ctx.disabled
                  ? {
                      outline: ctx.hasError
                        ? '2px solid var(--compa11y-textarea-border-error, #ef4444)'
                        : '2px solid var(--compa11y-focus-color, #0066cc)',
                      outlineOffset: '-1px',
                      borderColor: ctx.hasError
                        ? 'var(--compa11y-textarea-border-error, #ef4444)'
                        : 'var(--compa11y-textarea-border-focus, #0066cc)',
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

TextareaField.displayName = 'TextareaField';

/**
 * Textarea hint sub-component
 */
export const TextareaHint = forwardRef<HTMLDivElement, TextareaHintProps>(
  function TextareaHint({ children, className }, ref) {
    const ctx = useTextareaContext();

    useEffect(() => {
      ctx.setHasHint(true);
      return () => ctx.setHasHint(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <div
        ref={ref}
        id={ctx.hintId}
        data-compa11y-textarea-hint=""
        className={className}
        style={
          ctx.unstyled
            ? {}
            : {
                color: 'var(--compa11y-textarea-hint-color, #666)',
                fontSize: 'var(--compa11y-textarea-hint-size, 0.8125rem)',
              }
        }
      >
        {children}
      </div>
    );
  }
);

TextareaHint.displayName = 'TextareaHint';

/**
 * Textarea error sub-component - only renders when children are truthy
 */
export const TextareaError = forwardRef<HTMLDivElement, TextareaErrorProps>(
  function TextareaError({ children, className }, ref) {
    const ctx = useTextareaContext();

    if (!children) return null;

    return (
      <div
        ref={ref}
        id={ctx.errorId}
        role="alert"
        data-compa11y-textarea-error=""
        className={className}
        style={
          ctx.unstyled
            ? {}
            : {
                color: 'var(--compa11y-textarea-error-color, #ef4444)',
                fontSize: 'var(--compa11y-textarea-error-size, 0.8125rem)',
              }
        }
      >
        {children}
      </div>
    );
  }
);

TextareaError.displayName = 'TextareaError';

// =============================================================================
// Root Textarea component
// =============================================================================

/**
 * Accessible Textarea component with label, hint, and error support.
 *
 * Supports two modes:
 * - **Props mode**: Pass `label`, `hint`, `error` as props for automatic layout
 * - **Compound mode**: Use `<Textarea.Label>`, `<Textarea.Field>`, etc. as children for custom layout
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      value: controlledValue,
      defaultValue = '',
      onValueChange,
      rows = 3,
      resize = 'vertical',
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
      id: providedId,
      unstyled = false,
      className,
      onFocus: providedOnFocus,
      onBlur: providedOnBlur,
      children,
    },
    ref
  ) {
    const generatedId = useId('textarea');
    const baseId = providedId || generatedId;
    const fieldId = `${baseId}-field`;
    const labelId = `${baseId}-label`;
    const hintId = `${baseId}-hint`;
    const errorId = `${baseId}-error`;

    // Controlled / Uncontrolled
    const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
    const isControlled = controlledValue !== undefined;
    const currentValue = isControlled ? controlledValue : uncontrolledValue;

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

    // Dev warnings
    useEffect(() => {
      if (process.env.NODE_ENV !== 'production') {
        const isCompound = Children.count(children) > 0;
        if (!isCompound && !label && !ariaLabel && !ariaLabelledBy) {
          console.warn(
            '[Compa11y Textarea]: Textarea has no accessible label. Screen readers need this to identify the textarea. ' +
              'Use label prop, aria-label, or aria-labelledby.'
          );
        }
      }
    }, [children, label, ariaLabel, ariaLabelledBy]);

    const hasError = Boolean(error);
    const [compoundHasHint, setCompoundHasHint] = useState(false);
    const isCompound = Children.count(children) > 0;

    const contextValue: TextareaContextValue = {
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
      rows,
      resize,
      isFocusVisible,
      focusProps,
      unstyled,
    };

    // Data attributes for the wrapper
    const dataAttrs = {
      'data-compa11y-textarea': '',
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

    // Hooks must be called unconditionally (Rules of Hooks)
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const mergedRef = useCallback(
      (node: HTMLTextAreaElement | null) => {
        (
          textareaRef as React.MutableRefObject<HTMLTextAreaElement | null>
        ).current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (
            ref as React.MutableRefObject<HTMLTextAreaElement | null>
          ).current = node;
        }
      },
      [ref]
    );

    const handleChange = useCallback(
      (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setValue(event.target.value);
      },
      [setValue]
    );

    const handleFocus = useCallback(
      (event: React.FocusEvent<HTMLTextAreaElement>) => {
        focusProps.onFocus();
        providedOnFocus?.(event);
      },
      [focusProps, providedOnFocus]
    );

    const handleBlur = useCallback(
      (event: React.FocusEvent<HTMLTextAreaElement>) => {
        focusProps.onBlur();
        providedOnBlur?.(event);
      },
      [focusProps, providedOnBlur]
    );

    // ----- Compound mode -----
    if (isCompound) {
      return (
        <TextareaContext.Provider value={contextValue}>
          <div {...dataAttrs} className={className} style={wrapperStyle}>
            {children}
          </div>
        </TextareaContext.Provider>
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
            data-compa11y-textarea-label=""
            style={
              unstyled
                ? {}
                : {
                    display: 'block',
                    color: disabled
                      ? 'var(--compa11y-textarea-disabled-color, #999)'
                      : 'var(--compa11y-textarea-label-color, inherit)',
                    fontSize: 'var(--compa11y-textarea-label-size, 0.875rem)',
                    fontWeight:
                      'var(--compa11y-textarea-label-weight, 500)' as any,
                  }
            }
          >
            {label}
            {required && (
              <span
                data-compa11y-textarea-required=""
                aria-hidden="true"
                style={
                  unstyled
                    ? {}
                    : {
                        color:
                          'var(--compa11y-textarea-required-color, #ef4444)',
                        marginLeft: '0.125rem',
                      }
                }
              >
                *
              </span>
            )}
          </label>
        )}

        {/* Textarea field */}
        <textarea
          ref={mergedRef}
          id={fieldId}
          rows={rows}
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
          data-compa11y-textarea-field=""
          style={
            unstyled
              ? {}
              : {
                  width: '100%',
                  padding: 'var(--compa11y-textarea-padding, 0.5rem 0.75rem)',
                  border: hasError
                    ? '1px solid var(--compa11y-textarea-border-error, #ef4444)'
                    : 'var(--compa11y-textarea-border, 1px solid #ccc)',
                  borderRadius: 'var(--compa11y-textarea-radius, 4px)',
                  fontSize: 'var(--compa11y-textarea-font-size, 0.875rem)',
                  fontFamily: 'inherit',
                  lineHeight: '1.5',
                  resize,
                  background: disabled
                    ? 'var(--compa11y-textarea-disabled-bg, #f5f5f5)'
                    : readOnly
                      ? 'var(--compa11y-textarea-readonly-bg, #f9f9f9)'
                      : 'var(--compa11y-textarea-bg, white)',
                  color: 'inherit',
                  cursor: disabled ? 'not-allowed' : undefined,
                  opacity: disabled
                    ? ('var(--compa11y-textarea-disabled-opacity, 0.7)' as any)
                    : undefined,
                  ...(isFocusVisible && !disabled
                    ? {
                        outline: hasError
                          ? '2px solid var(--compa11y-textarea-border-error, #ef4444)'
                          : '2px solid var(--compa11y-focus-color, #0066cc)',
                        outlineOffset: '-1px',
                        borderColor: hasError
                          ? 'var(--compa11y-textarea-border-error, #ef4444)'
                          : 'var(--compa11y-textarea-border-focus, #0066cc)',
                      }
                    : {}),
                }
          }
        />

        {/* Hint */}
        {hint && (
          <div
            id={hintId}
            data-compa11y-textarea-hint=""
            style={
              unstyled
                ? {}
                : {
                    color: 'var(--compa11y-textarea-hint-color, #666)',
                    fontSize: 'var(--compa11y-textarea-hint-size, 0.8125rem)',
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
            data-compa11y-textarea-error=""
            style={
              unstyled
                ? {}
                : {
                    color: 'var(--compa11y-textarea-error-color, #ef4444)',
                    fontSize:
                      'var(--compa11y-textarea-error-size, 0.8125rem)',
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

Textarea.displayName = 'Textarea';

// =============================================================================
// Compound export
// =============================================================================

export const TextareaCompound = Object.assign(Textarea, {
  Label: TextareaLabel,
  Field: TextareaField,
  Hint: TextareaHint,
  Error: TextareaError,
});
