import React, { forwardRef, useCallback, useEffect, useState } from 'react';
import { createComponentWarnings } from '@compa11y/core';
import { useId } from '../../hooks/use-id';
import { useKeyboard } from '../../hooks/use-keyboard';
import { useAnnouncer } from '../../hooks/use-announcer';

const warnings = createComponentWarnings('Switch');

export interface SwitchProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'onChange' | 'role'
> {
  /** Controlled checked state */
  checked?: boolean;
  /** Default checked state (uncontrolled) */
  defaultChecked?: boolean;
  /** Called when the switch state changes */
  onCheckedChange?: (checked: boolean) => void;
  /** Accessible label for the switch (renders visible label next to switch) */
  label?: string;
  /** Whether the switch is disabled */
  disabled?: boolean;
  /** Remove default styles to allow full customization via className */
  unstyled?: boolean;
  /** Custom class name */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Switch component - An accessible toggle switch (on/off control)
 *
 * Follows WAI-ARIA Switch pattern with proper keyboard support and screen reader announcements.
 *
 * @example
 * ```tsx
 * // Uncontrolled
 * <Switch defaultChecked={true} label="Enable notifications" />
 *
 * // Controlled
 * <Switch
 *   checked={enabled}
 *   onCheckedChange={setEnabled}
 *   aria-label="Dark mode"
 * />
 *
 * // With visible label
 * <Switch checked={enabled} onCheckedChange={setEnabled} label="Dark mode" />
 * ```
 */
export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  function Switch(
    {
      checked: controlledChecked,
      defaultChecked = false,
      onCheckedChange,
      label,
      disabled = false,
      unstyled = false,
      className,
      size = 'md',
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledby,
      onClick,
      ...props
    },
    ref
  ) {
    const id = useId('switch');
    const labelId = `${id}-label`;
    const { announce } = useAnnouncer();

    // Support both controlled and uncontrolled modes
    const [uncontrolledChecked, setUncontrolledChecked] =
      useState(defaultChecked);
    const isControlled = controlledChecked !== undefined;
    const checked = isControlled ? controlledChecked : uncontrolledChecked;

    // Warn if no accessible label is provided
    useEffect(() => {
      if (!label && !ariaLabel && !ariaLabelledby) {
        warnings.warning(
          'Switch has no accessible label. Screen readers need this to identify the switch.',
          'Add label="Description", aria-label="...", or aria-labelledby="..."'
        );
      }
    }, [label, ariaLabel, ariaLabelledby]);

    const toggleSwitch = useCallback(() => {
      if (disabled) return;

      const newChecked = !checked;

      if (!isControlled) {
        setUncontrolledChecked(newChecked);
      }

      onCheckedChange?.(newChecked);

      // Announce state change to screen readers
      const labelText = label || ariaLabel || 'Switch';
      announce(`${labelText} ${newChecked ? 'on' : 'off'}`);
    }, [
      checked,
      disabled,
      isControlled,
      onCheckedChange,
      label,
      ariaLabel,
      announce,
    ]);

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          toggleSwitch();
        }
      },
      [onClick, toggleSwitch]
    );

    // Keyboard handling: Space and Enter should toggle
    const keyboardProps = useKeyboard(
      {
        ' ': () => {
          // Space toggles the switch
          toggleSwitch();
        },
        Enter: () => {
          // Enter also toggles (some users prefer Enter over Space)
          toggleSwitch();
        },
      },
      { preventDefault: true }
    );

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      props.onKeyDown?.(event);
      if (!event.defaultPrevented) {
        keyboardProps.onKeyDown(event);
      }
    };

    // Compute ARIA label
    const computedAriaLabel = ariaLabel;
    const computedAriaLabelledby =
      ariaLabelledby || (label ? labelId : undefined);

    // Structural styles (always applied)
    const wrapperStructuralStyles: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
    };

    // Size dimensions for structural styles
    const sizes = {
      sm: { width: 32, height: 18, thumb: 14, translate: 14 },
      md: { width: 44, height: 24, thumb: 20, translate: 20 },
      lg: { width: 56, height: 30, thumb: 26, translate: 26 },
    };

    const sizeConfig = sizes[size];

    const trackStructuralStyles: React.CSSProperties = {
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      flexShrink: 0,
      width: sizeConfig.width,
      height: sizeConfig.height,
      border: 'none',
      padding: 2,
      cursor: disabled ? 'not-allowed' : 'pointer',
    };

    const trackVisualStyles: React.CSSProperties = unstyled
      ? {}
      : {
          backgroundColor: checked ? '#0066cc' : '#d1d5db',
          borderRadius: sizeConfig.height / 2,
          transition: 'background-color 0.2s ease',
          opacity: disabled ? 0.5 : 1,
        };

    const thumbStructuralStyles: React.CSSProperties = {
      position: 'absolute',
      left: 2,
      width: sizeConfig.thumb,
      height: sizeConfig.thumb,
      pointerEvents: 'none',
      transform: checked
        ? `translateX(${sizeConfig.translate}px)`
        : 'translateX(0)',
    };

    const thumbVisualStyles: React.CSSProperties = unstyled
      ? {}
      : {
          backgroundColor: 'white',
          borderRadius: '50%',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
          transition: 'transform 0.2s ease',
        };

    const labelStyles: React.CSSProperties = unstyled
      ? {
          marginLeft: 8,
          userSelect: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }
      : {
          marginLeft: 8,
          userSelect: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
        };

    return (
      <div
        style={wrapperStructuralStyles}
        data-compa11y-switch-wrapper
        data-size={size}
      >
        <button
          ref={ref}
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={computedAriaLabel}
          aria-labelledby={computedAriaLabelledby}
          disabled={disabled}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          className={className}
          style={{ ...trackStructuralStyles, ...trackVisualStyles }}
          tabIndex={disabled ? -1 : 0}
          data-compa11y-switch
          data-checked={checked}
          data-disabled={disabled || undefined}
          data-size={size}
          {...props}
          // CSS-in-JS focus-visible styles
          onFocus={(e) => {
            // Add focus-visible indicator
            if (!unstyled) {
              e.currentTarget.style.outline = '2px solid #0066cc';
              e.currentTarget.style.outlineOffset = '2px';
            }
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            // Remove focus indicator on blur
            if (!unstyled) {
              e.currentTarget.style.outline = 'none';
            }
            props.onBlur?.(e);
          }}
        >
          <span
            style={{ ...thumbStructuralStyles, ...thumbVisualStyles }}
            data-compa11y-switch-thumb
            aria-hidden="true"
          />
        </button>
        {label && (
          <label
            id={labelId}
            onClick={disabled ? undefined : () => toggleSwitch()}
            style={labelStyles}
            data-compa11y-switch-label
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

Switch.displayName = 'Switch';
