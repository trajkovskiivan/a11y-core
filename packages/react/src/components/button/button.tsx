/**
 * Button Component
 *
 * An accessible button with variant, size, loading, and discoverable support.
 *
 * @example
 * ```tsx
 * <Button variant="primary" onClick={handleSave}>Save</Button>
 * <Button variant="danger" loading>Deleting...</Button>
 * <Button variant="outline" disabled discoverable>Unavailable</Button>
 * ```
 */

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react';
import { useId } from '../../hooks/use-id';
import { useFocusVisible } from '../../hooks/use-focus-visible';

// =============================================================================
// Types
// =============================================================================

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'disabled' | 'type'
  > {
  /** Visual variant */
  variant?: ButtonVariant;
  /** Size */
  size?: ButtonSize;
  /** HTML button type */
  type?: 'button' | 'submit' | 'reset';
  /** Whether the button is disabled */
  disabled?: boolean;
  /**
   * Whether disabled button remains discoverable via keyboard.
   * When true, disabled button stays in tab order with aria-disabled.
   * When false, disabled button is removed from tab order with native disabled.
   * @default false
   */
  discoverable?: boolean;
  /** Whether the button is in a loading state (sets aria-busy) */
  loading?: boolean;
  /** Remove default styles for full customization */
  unstyled?: boolean;
  /** Accessible label when no visible text */
  'aria-label'?: string;
  /** Children (button content) */
  children?: ReactNode;
}

// =============================================================================
// Style helpers
// =============================================================================

const VARIANT_STYLES: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: 'var(--compa11y-button-primary-bg, #0066cc)',
    color: 'var(--compa11y-button-primary-color, white)',
    border: 'var(--compa11y-button-primary-border, 1px solid #0066cc)',
  },
  secondary: {
    background: 'var(--compa11y-button-secondary-bg, white)',
    color: 'var(--compa11y-button-secondary-color, #333)',
    border: 'var(--compa11y-button-secondary-border, 1px solid #ccc)',
  },
  danger: {
    background: 'var(--compa11y-button-danger-bg, #ef4444)',
    color: 'var(--compa11y-button-danger-color, white)',
    border: 'var(--compa11y-button-danger-border, 1px solid #ef4444)',
  },
  outline: {
    background: 'var(--compa11y-button-outline-bg, transparent)',
    color: 'var(--compa11y-button-outline-color, #0066cc)',
    border: 'var(--compa11y-button-outline-border, 1px solid #0066cc)',
  },
  ghost: {
    background: 'var(--compa11y-button-ghost-bg, transparent)',
    color: 'var(--compa11y-button-ghost-color, #333)',
    border: 'var(--compa11y-button-ghost-border, 1px solid transparent)',
  },
};

const SIZE_STYLES: Record<ButtonSize, React.CSSProperties> = {
  sm: {
    padding: 'var(--compa11y-button-padding-sm, 0.25rem 0.5rem)',
    fontSize: 'var(--compa11y-button-font-size-sm, 0.75rem)',
  },
  md: {
    padding: 'var(--compa11y-button-padding-md, 0.5rem 1rem)',
    fontSize: 'var(--compa11y-button-font-size-md, 0.875rem)',
  },
  lg: {
    padding: 'var(--compa11y-button-padding-lg, 0.75rem 1.5rem)',
    fontSize: 'var(--compa11y-button-font-size-lg, 1rem)',
  },
};

// =============================================================================
// Component
// =============================================================================

/**
 * Accessible Button component with variant, size, and loading support.
 *
 * Uses `aria-disabled` + event prevention for discoverable disabled state,
 * keeping the button in the tab order so keyboard users can find it.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = 'secondary',
      size = 'md',
      type = 'button',
      disabled = false,
      discoverable = false,
      loading = false,
      unstyled = false,
      'aria-label': ariaLabel,
      className,
      style,
      onClick,
      onFocus: providedOnFocus,
      onBlur: providedOnBlur,
      children,
      ...rest
    },
    ref
  ) {
    const generatedId = useId('button');
    const buttonRef = useRef<HTMLButtonElement>(null);

    const mergedRef = useCallback(
      (node: HTMLButtonElement | null) => {
        (
          buttonRef as React.MutableRefObject<HTMLButtonElement | null>
        ).current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (
            ref as React.MutableRefObject<HTMLButtonElement | null>
          ).current = node;
        }
      },
      [ref]
    );

    // Focus visible
    const { isFocusVisible, focusProps } = useFocusVisible();

    // Dev warnings
    useEffect(() => {
      if (process.env.NODE_ENV !== 'production') {
        if (!children && !ariaLabel && !rest['aria-labelledby']) {
          console.warn(
            '[Compa11y Button]: Button has no accessible label. Screen readers need this to identify the button. ' +
              'Add text content, aria-label, or aria-labelledby.'
          );
        }
      }
    }, [children, ariaLabel, rest['aria-labelledby']]);

    // Use native disabled only when NOT discoverable — removes from tab order entirely.
    // When discoverable, aria-disabled + event prevention keeps it in tab order.
    const useNativeDisabled = disabled && !discoverable;
    const isInteractionDisabled = disabled || loading;

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        if (isInteractionDisabled) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      },
      [isInteractionDisabled, onClick]
    );

    const handleFocus = useCallback(
      (event: React.FocusEvent<HTMLButtonElement>) => {
        focusProps.onFocus();
        providedOnFocus?.(event);
      },
      [focusProps, providedOnFocus]
    );

    const handleBlur = useCallback(
      (event: React.FocusEvent<HTMLButtonElement>) => {
        focusProps.onBlur();
        providedOnBlur?.(event);
      },
      [focusProps, providedOnBlur]
    );

    // Data attributes
    const dataAttrs = {
      'data-compa11y-button': '',
      'data-variant': variant,
      'data-size': size,
      'data-disabled': disabled ? 'true' : 'false',
      'data-loading': loading ? 'true' : 'false',
    };

    const baseStyle: React.CSSProperties = unstyled
      ? {}
      : {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          borderRadius: 'var(--compa11y-button-radius, 4px)',
          fontFamily: 'inherit',
          fontWeight: 'var(--compa11y-button-font-weight, 500)' as any,
          lineHeight: '1.5',
          cursor: isInteractionDisabled ? 'not-allowed' : 'pointer',
          opacity: disabled
            ? ('var(--compa11y-button-disabled-opacity, 0.5)' as any)
            : undefined,
          transition: 'background-color 0.15s ease, border-color 0.15s ease',
          ...VARIANT_STYLES[variant],
          ...SIZE_STYLES[size],
          ...(isFocusVisible && !useNativeDisabled
            ? {
                outline: '2px solid var(--compa11y-focus-color, #0066cc)',
                outlineOffset: '2px',
              }
            : {}),
        };

    return (
      <button
        ref={mergedRef}
        id={generatedId}
        type={type}
        disabled={useNativeDisabled}
        tabIndex={disabled && !discoverable ? undefined : 0}
        aria-disabled={isInteractionDisabled ? 'true' : undefined}
        aria-busy={loading ? 'true' : undefined}
        aria-label={ariaLabel}
        onClick={handleClick}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={className}
        style={{ ...baseStyle, ...style }}
        {...dataAttrs}
        {...rest}
      >
        {loading && (
          <span
            data-compa11y-button-spinner=""
            aria-hidden="true"
            style={
              unstyled
                ? {}
                : {
                    display: 'inline-block',
                    width: '1em',
                    height: '1em',
                    border: '2px solid currentColor',
                    borderRightColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'compa11y-spin 0.6s linear infinite',
                  }
            }
          />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
