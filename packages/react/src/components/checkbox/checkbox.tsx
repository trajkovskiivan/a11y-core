/**
 * Checkbox Component
 *
 * An accessible checkbox that supports controlled/uncontrolled modes,
 * indeterminate state, and full keyboard navigation.
 *
 * @example
 * ```tsx
 * // Uncontrolled
 * <Checkbox defaultChecked>Accept terms</Checkbox>
 *
 * // Controlled
 * <Checkbox checked={checked} onCheckedChange={setChecked}>
 *   Enable notifications
 * </Checkbox>
 *
 * // Indeterminate
 * <Checkbox checked="indeterminate">Select all</Checkbox>
 * ```
 */

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type InputHTMLAttributes,
} from 'react';
import { useId } from '../../hooks/use-id';
import { useAnnouncer } from '../../hooks/use-announcer';
import { useFocusVisible } from '../../hooks/use-focus-visible';

export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'checked' | 'onChange' | 'type' | 'defaultChecked'
> {
  /**
   * Controlled checked state
   * Can be boolean or 'indeterminate' for partial selection
   */
  checked?: boolean | 'indeterminate';

  /**
   * Uncontrolled default checked state
   */
  defaultChecked?: boolean | 'indeterminate';

  /**
   * Called when checked state changes
   */
  onCheckedChange?: (checked: boolean | 'indeterminate') => void;

  /**
   * Remove default styles for full customization
   * Keeps structural and behavioral styles only
   */
  unstyled?: boolean;

  /**
   * Label text (alternative to using children)
   */
  label?: string;

  /**
   * Announce changes to screen readers
   * @default true
   */
  announceChanges?: boolean;

  /**
   * Whether disabled checkbox remains discoverable via keyboard
   * When true, disabled checkbox stays in tab order with aria-disabled
   * When false, disabled checkbox is removed from tab order
   * @default true
   */
  discoverable?: boolean;

  /**
   * Children (typically label text)
   */
  children?: React.ReactNode;
}

/**
 * Accessible checkbox component with support for controlled/uncontrolled modes
 * and indeterminate state.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(
    {
      checked: controlledChecked,
      defaultChecked = false,
      onCheckedChange,
      disabled = false,
      unstyled = false,
      label,
      announceChanges = true,
      discoverable = true,
      children,
      className = '',
      id: providedId,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      onFocus: providedOnFocus,
      onBlur: providedOnBlur,
      ...rest
    },
    ref
  ) {
    const generatedId = useId('checkbox');
    const id = providedId || generatedId;
    const labelId = `${id}-label`;

    const [uncontrolledChecked, setUncontrolledChecked] = useState<
      boolean | 'indeterminate'
    >(defaultChecked);

    const checked = controlledChecked ?? uncontrolledChecked;

    const inputRef = useRef<HTMLInputElement>(null);

    const mergedRef = useCallback(
      (node: HTMLInputElement | null) => {
        // Update local ref
        (inputRef as React.MutableRefObject<HTMLInputElement | null>).current =
          node;

        // Update forwarded ref
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLInputElement | null>).current =
            node;
        }
      },
      [ref]
    );

    const { announce } = useAnnouncer();
    const { isFocusVisible, focusProps } = useFocusVisible();

    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.indeterminate = checked === 'indeterminate';
      }
    }, [checked]);

    useEffect(() => {
      if (process.env.NODE_ENV !== 'production') {
        if (!children && !label && !ariaLabel && !ariaLabelledBy) {
          console.warn(
            '[Compa11y Checkbox]: Checkbox has no accessible label. Screen readers need this. ' +
              'Use children, label prop, or provide aria-label/aria-labelledby.'
          );
        }
      }
    }, [children, label, ariaLabel, ariaLabelledBy]);

    const handleChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled) {
          event.preventDefault();
          return;
        }

        // Indeterminate always transitions to checked
        const newChecked =
          checked === 'indeterminate' ? true : event.target.checked;

        if (controlledChecked === undefined) {
          setUncontrolledChecked(newChecked);
        }

        onCheckedChange?.(newChecked);

        if (announceChanges) {
          const labelText =
            label || (typeof children === 'string' ? children : 'Checkbox');
          announce(`${labelText} ${newChecked ? 'checked' : 'unchecked'}`, {
            politeness: 'polite',
          });
        }
      },
      [
        controlledChecked,
        onCheckedChange,
        announceChanges,
        disabled,
        checked,
        label,
        children,
        announce,
      ]
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

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLInputElement>) => {
        if (disabled) {
          event.preventDefault();
        }
      },
      [disabled]
    );

    const hasLabel = Boolean(children || label);
    const labelContent = children || label;

    const dataAttrs = {
      'data-compa11y-checkbox': '',
      'data-checked': checked === true ? 'true' : 'false',
      'data-indeterminate': checked === 'indeterminate' ? 'true' : 'false',
      'data-disabled': disabled ? 'true' : 'false',
      'data-unstyled': unstyled ? 'true' : 'false',
    };

    const icon =
      checked === 'indeterminate' ? (
        // Horizontal line for indeterminate
        <line
          x1="4"
          y1="12"
          x2="20"
          y2="12"
          stroke="var(--compa11y-checkbox-check-color, white)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      ) : checked ? (
        // Checkmark for checked
        <polyline
          points="20 6 9 17 4 12"
          stroke="var(--compa11y-checkbox-check-color, white)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      ) : null;

    // Use native disabled only when not discoverable — removes from tab order entirely.
    // When discoverable, aria-disabled + event prevention keeps it in tab order
    // while screen readers still announce the disabled state.
    const useNativeDisabled = disabled && !discoverable;

    return (
      <label
        htmlFor={id}
        className={`compa11y-checkbox-wrapper ${className}`.trim()}
        {...dataAttrs}
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
          {/* Native input - visually hidden but accessible */}
          <input
            ref={mergedRef}
            type="checkbox"
            id={id}
            checked={checked === 'indeterminate' ? false : checked}
            onChange={handleChange}
            onClick={handleClick}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={useNativeDisabled}
            tabIndex={disabled && !discoverable ? -1 : 0}
            aria-disabled={disabled ? 'true' : undefined}
            aria-label={!hasLabel ? ariaLabel : undefined}
            aria-labelledby={
              !hasLabel && ariaLabelledBy
                ? ariaLabelledBy
                : hasLabel
                  ? labelId
                  : undefined
            }
            aria-checked={checked === 'indeterminate' ? 'mixed' : checked}
            className="compa11y-checkbox-input"
            style={{
              position: 'absolute',
              opacity: 0,
              width: '1.25rem',
              height: '1.25rem',
              margin: 0,
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}
            {...rest}
          />
          {/* Custom checkbox visual */}
          {!unstyled && (
            <div
              className="compa11y-checkbox-box"
              style={{
                width: 'var(--compa11y-checkbox-size, 1.25rem)',
                height: 'var(--compa11y-checkbox-size, 1.25rem)',
                border:
                  checked === true || checked === 'indeterminate'
                    ? 'var(--compa11y-checkbox-checked-border, 2px solid #0066cc)'
                    : 'var(--compa11y-checkbox-border, 2px solid #666)',
                borderRadius: 'var(--compa11y-checkbox-radius, 4px)',
                background:
                  checked === true || checked === 'indeterminate'
                    ? 'var(--compa11y-checkbox-checked-bg, #0066cc)'
                    : 'var(--compa11y-checkbox-bg, white)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.15s ease',
                pointerEvents: 'none',
                ...(isFocusVisible
                  ? {
                      outline: '2px solid var(--compa11y-focus-color, #0066cc)',
                      outlineOffset: '2px',
                    }
                  : {}),
              }}
            >
              {icon && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  style={{
                    width: '100%',
                    height: '100%',
                    opacity:
                      checked === true || checked === 'indeterminate' ? 1 : 0,
                    transform:
                      checked === true || checked === 'indeterminate'
                        ? 'scale(1)'
                        : 'scale(0)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {icon}
                </svg>
              )}
            </div>
          )}
        </div>
        {hasLabel && (
          <span
            id={labelId}
            className="compa11y-checkbox-label"
            style={
              unstyled
                ? {}
                : {
                    color: disabled
                      ? 'var(--compa11y-checkbox-disabled-color, #999)'
                      : 'var(--compa11y-checkbox-label-color, inherit)',
                    fontSize: 'var(--compa11y-checkbox-label-size, 1rem)',
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

Checkbox.displayName = 'Checkbox';
