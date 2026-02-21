/**
 * Accessible Alert component.
 *
 * A static feedback element for communicating important messages.
 * Uses `role="alert"` for urgent messages (error/warning) and
 * `role="status"` for informational messages (info/success).
 *
 * @example
 * ```tsx
 * // Error alert (assertive)
 * <Alert type="error" title="Payment failed">
 *   Your card was declined. Please try a different payment method.
 * </Alert>
 *
 * // Success alert
 * <Alert type="success" title="Saved!">
 *   Your changes have been saved successfully.
 * </Alert>
 *
 * // Dismissible alert
 * <Alert type="info" dismissible onDismiss={() => setVisible(false)}>
 *   This alert can be closed by the user.
 * </Alert>
 * ```
 *
 * Keyboard: Tab to dismiss button, Enter/Space to dismiss.
 */

import React, { forwardRef, useCallback } from 'react';

export type AlertType = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Alert variant */
  type?: AlertType;
  /** Optional title displayed prominently */
  title?: string;
  /** Whether the alert can be dismissed */
  dismissible?: boolean;
  /** Called when the alert is dismissed */
  onDismiss?: () => void;
  /** Remove default styles */
  unstyled?: boolean;
}

const ICONS: Record<AlertType, string> = {
  info: '\u2139\uFE0F',
  success: '\u2705',
  warning: '\u26A0\uFE0F',
  error: '\u274C',
};

const ACCENT_COLORS: Record<AlertType, string> = {
  info: '#3b82f6',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
};

const baseStyles: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '0.75rem',
  padding: '0.75rem 1rem',
  background: 'white',
  border: '1px solid #e0e0e0',
  borderRadius: '6px',
};

const iconStyles: React.CSSProperties = {
  flexShrink: 0,
  fontSize: '1.25rem',
  lineHeight: 1,
  marginTop: '0.125rem',
};

const contentStyles: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
};

const titleStyles: React.CSSProperties = {
  fontWeight: 600,
  fontSize: '0.875rem',
  marginBottom: '0.125rem',
};

const descriptionStyles: React.CSSProperties = {
  color: '#555',
  fontSize: '0.8125rem',
};

const closeButtonStyles: React.CSSProperties = {
  appearance: 'none',
  background: 'none',
  border: 'none',
  padding: 0,
  margin: 0,
  font: 'inherit',
  cursor: 'pointer',
  flexShrink: 0,
  width: '1.5rem',
  height: '1.5rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '4px',
  color: '#999',
  fontSize: '1.125rem',
  lineHeight: 1,
};

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  function Alert(
    {
      type = 'info',
      title,
      dismissible = false,
      onDismiss,
      unstyled = false,
      children,
      style,
      ...props
    },
    ref
  ) {
    const alertRole = type === 'error' || type === 'warning' ? 'alert' : 'status';

    const handleDismiss = useCallback(() => {
      onDismiss?.();
    }, [onDismiss]);

    const resolvedStyle = unstyled
      ? style
      : {
          ...baseStyles,
          borderLeft: `4px solid ${ACCENT_COLORS[type]}`,
          ...style,
        };

    return (
      <div
        ref={ref}
        role={alertRole}
        aria-live={alertRole === 'alert' ? 'assertive' : 'polite'}
        data-compa11y-alert
        data-type={type}
        data-dismissible={dismissible || undefined}
        style={resolvedStyle}
        {...props}
      >
        {!unstyled && (
          <span
            data-compa11y-alert-icon
            aria-hidden="true"
            style={{ ...iconStyles, color: ACCENT_COLORS[type] }}
          >
            {ICONS[type]}
          </span>
        )}
        <div data-compa11y-alert-content style={unstyled ? undefined : contentStyles}>
          {title && (
            <div
              data-compa11y-alert-title
              style={unstyled ? undefined : titleStyles}
            >
              {title}
            </div>
          )}
          <div
            data-compa11y-alert-description
            style={unstyled ? undefined : descriptionStyles}
          >
            {children}
          </div>
        </div>
        {dismissible && (
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss alert"
            data-compa11y-alert-close
            style={unstyled ? undefined : closeButtonStyles}
          >
            &times;
          </button>
        )}
      </div>
    );
  }
);
