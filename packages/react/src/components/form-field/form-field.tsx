/**
 * Accessible FormField compound component.
 *
 * A generic wrapper that provides label, hint, error, and required indicator
 * around **any** form control. Automatically wires `aria-labelledby`,
 * `aria-describedby`, and `aria-invalid` on the child control via context.
 *
 * Unlike `<Input>` which bundles its own `<input>`, FormField wraps any control
 * you give it — native inputs, selects, textareas, switches, custom elements, etc.
 *
 * @example
 * ```tsx
 * // Simple: wrap a native input
 * <FormField label="Email" hint="We'll never share it" required>
 *   <FormField.Control>
 *     {({ controlId, ariaProps }) => (
 *       <input id={controlId} type="email" {...ariaProps} />
 *     )}
 *   </FormField.Control>
 * </FormField>
 *
 * // Wrap a custom component
 * <FormField label="Country" required>
 *   <FormField.Label />       {/* auto-renders from context *\/}
 *   <FormField.Control>
 *     {({ controlId, ariaProps }) => (
 *       <Select id={controlId} {...ariaProps}>...</Select>
 *     )}
 *   </FormField.Control>
 *   <FormField.Hint>Choose your country.</FormField.Hint>
 *   <FormField.Error>{countryError}</FormField.Error>
 * </FormField>
 *
 * // Minimal — just structure + a11y wiring
 * <FormField label="Password" error={pwError}>
 *   <FormField.Control>
 *     {({ controlId, ariaProps }) => (
 *       <input id={controlId} type="password" {...ariaProps} />
 *     )}
 *   </FormField.Control>
 * </FormField>
 * ```
 */

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useId as useReactId,
  useState,
  type ReactNode,
} from 'react';
import { FormFieldContext, useFormFieldContext } from './form-field-context';

// =============================================================================
// Types
// =============================================================================

export interface FormFieldProps {
  /** Visible label text — renders a <FormField.Label> automatically when provided */
  label?: ReactNode;
  /** Hint text below the control */
  hint?: ReactNode;
  /** Error message — sets aria-invalid on control when present */
  error?: ReactNode;
  /** Mark the field as required */
  required?: boolean;
  /** Disable the field */
  disabled?: boolean;
  /** Remove default styles for full customization */
  unstyled?: boolean;
  /** Children: use FormField sub-components */
  children?: ReactNode;
  /** CSS class name for the wrapper */
  className?: string;
  /** Inline styles for the wrapper */
  style?: React.CSSProperties;
  /** Override the auto-generated control id */
  id?: string;
}

/** Props passed to the render-prop child of FormField.Control */
export interface FormFieldControlRenderProps {
  /** The id to set on the control element (matches the label's htmlFor) */
  controlId: string;
  /** Spread these onto the control for full ARIA wiring */
  ariaProps: {
    'aria-labelledby'?: string;
    'aria-describedby'?: string;
    'aria-invalid'?: true;
    'aria-required'?: true;
    'aria-disabled'?: true;
  };
}

export interface FormFieldLabelProps extends React.HTMLAttributes<HTMLLabelElement> {
  children?: ReactNode;
}

export interface FormFieldHintProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export interface FormFieldErrorProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export interface FormFieldControlProps {
  children: (props: FormFieldControlRenderProps) => ReactNode;
}

// =============================================================================
// Styles
// =============================================================================

const wrapperStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.875rem',
  fontWeight: 500,
};

const labelDisabledStyle: React.CSSProperties = {
  color: '#999',
};

const requiredStyle: React.CSSProperties = {
  color: '#ef4444',
  marginLeft: '0.125rem',
};

const hintStyle: React.CSSProperties = {
  color: '#666',
  fontSize: '0.8125rem',
};

const errorStyle: React.CSSProperties = {
  color: '#ef4444',
  fontSize: '0.8125rem',
};

// =============================================================================
// Sub-components
// =============================================================================

/**
 * FormField.Label — renders a <label> wired to the control via context.
 * When you pass `label` to the root `<FormField>`, this is rendered automatically.
 * Use the sub-component for custom layout.
 */
const FormFieldLabel = forwardRef<HTMLLabelElement, FormFieldLabelProps>(
  function FormFieldLabel({ children, style, ...props }, ref) {
    const ctx = useFormFieldContext();
    return (
      <label
        ref={ref}
        id={ctx.labelId}
        htmlFor={ctx.controlId}
        data-compa11y-form-field-label
        style={
          ctx.unstyled
            ? style
            : {
                ...labelStyle,
                ...(ctx.disabled ? labelDisabledStyle : undefined),
                ...style,
              }
        }
        {...props}
      >
        {children}
        {ctx.required && (
          <span
            aria-hidden="true"
            data-compa11y-form-field-required
            style={ctx.unstyled ? undefined : requiredStyle}
          >
            *
          </span>
        )}
      </label>
    );
  }
);

FormFieldLabel.displayName = 'FormField.Label';

/**
 * FormField.Hint — renders hint text wired into aria-describedby.
 */
const FormFieldHint = forwardRef<HTMLDivElement, FormFieldHintProps>(
  function FormFieldHint({ children, style, ...props }, ref) {
    const ctx = useFormFieldContext();

    useEffect(() => {
      ctx.setHasHint(true);
      return () => ctx.setHasHint(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!children) return null;

    return (
      <div
        ref={ref}
        id={ctx.hintId}
        data-compa11y-form-field-hint
        style={ctx.unstyled ? style : { ...hintStyle, ...style }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

FormFieldHint.displayName = 'FormField.Hint';

/**
 * FormField.Error — renders error text. Only mounts when children are truthy.
 */
const FormFieldError = forwardRef<HTMLDivElement, FormFieldErrorProps>(
  function FormFieldError({ children, style, ...props }, ref) {
    const ctx = useFormFieldContext();

    if (!children) return null;

    return (
      <div
        ref={ref}
        id={ctx.errorId}
        role="alert"
        data-compa11y-form-field-error
        style={ctx.unstyled ? style : { ...errorStyle, ...style }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

FormFieldError.displayName = 'FormField.Error';

/**
 * FormField.Control — render-prop that provides the control ID and ARIA props.
 *
 * @example
 * ```tsx
 * <FormField.Control>
 *   {({ controlId, ariaProps }) => (
 *     <input id={controlId} type="text" {...ariaProps} />
 *   )}
 * </FormField.Control>
 * ```
 */
function FormFieldControl({ children }: FormFieldControlProps) {
  const ctx = useFormFieldContext();

  const describedBy: string[] = [];
  if (ctx.hasHint) describedBy.push(ctx.hintId);
  if (ctx.hasError) describedBy.push(ctx.errorId);

  const ariaProps: FormFieldControlRenderProps['ariaProps'] = {
    'aria-labelledby': ctx.labelId,
    ...(describedBy.length ? { 'aria-describedby': describedBy.join(' ') } : undefined),
    ...(ctx.hasError ? { 'aria-invalid': true as const } : undefined),
    ...(ctx.required ? { 'aria-required': true as const } : undefined),
    ...(ctx.disabled ? { 'aria-disabled': true as const } : undefined),
  };

  return <>{children({ controlId: ctx.controlId, ariaProps })}</>;
}

FormFieldControl.displayName = 'FormField.Control';

// =============================================================================
// Root FormField
// =============================================================================

/**
 * Accessible FormField compound component.
 *
 * Provides label, hint, error, and required indicator for any form control.
 * Automatically wires aria-labelledby, aria-describedby, and aria-invalid.
 */
const FormFieldRoot = forwardRef<HTMLDivElement, FormFieldProps>(
  function FormField(
    {
      label,
      hint,
      error,
      required = false,
      disabled = false,
      unstyled = false,
      children,
      className,
      style,
      id: providedId,
    },
    ref
  ) {
    const generatedId = useReactId();
    const baseId = providedId ?? generatedId;
    const controlId = `${baseId}-control`;
    const labelId = `${baseId}-label`;
    const hintId = `${baseId}-hint`;
    const errorId = `${baseId}-error`;

    const hasError = Boolean(error);
    const [compoundHasHint, setCompoundHasHint] = useState(false);

    // If hint is provided as a prop (not via sub-component), mark it present
    const hasHint = Boolean(hint) || compoundHasHint;

    const setHasHint = useCallback((value: boolean) => {
      setCompoundHasHint(value);
    }, []);

    const contextValue = {
      controlId,
      labelId,
      hintId,
      errorId,
      hasError,
      hasHint,
      setHasHint,
      required,
      disabled,
      unstyled,
    };

    return (
      <FormFieldContext.Provider value={contextValue}>
        <div
          ref={ref}
          data-compa11y-form-field
          data-error={hasError || undefined}
          data-required={required || undefined}
          data-disabled={disabled || undefined}
          className={className}
          style={unstyled ? style : { ...wrapperStyle, ...style }}
        >
          {/* Auto-render label if provided as prop */}
          {label && <FormFieldLabel>{label}</FormFieldLabel>}

          {children}

          {/* Auto-render hint if provided as prop (and no hint sub-component) */}
          {hint && !compoundHasHint && (
            <div
              id={hintId}
              data-compa11y-form-field-hint
              style={unstyled ? undefined : hintStyle}
            >
              {hint}
            </div>
          )}

          {/* Auto-render error if provided as prop (and no error sub-component) */}
          {error && (
            <div
              id={errorId}
              role="alert"
              data-compa11y-form-field-error
              style={unstyled ? undefined : errorStyle}
            >
              {error}
            </div>
          )}
        </div>
      </FormFieldContext.Provider>
    );
  }
);

FormFieldRoot.displayName = 'FormField';

// =============================================================================
// Compound export
// =============================================================================

export const FormField = Object.assign(FormFieldRoot, {
  Label: FormFieldLabel,
  Hint: FormFieldHint,
  Error: FormFieldError,
  Control: FormFieldControl,
});

export const FormFieldCompound = FormField;
