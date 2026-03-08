/**
 * Accessible ErrorSummary component.
 *
 * Displays a summary of validation or system errors with navigation
 * links to the relevant form fields. Two variants:
 *
 * **Form variant** (default) — appears after a failed submit, auto-focuses
 * the container so screen readers announce it, and lists clickable links
 * that jump to the corresponding fields.
 *
 * **Page variant** — for system/page-level errors (save failed, network error).
 * Uses `role="alert"` for assertive announcement. Supports action buttons
 * (Retry, Dismiss) and an optional dismiss button.
 *
 * @example
 * ```tsx
 * // Form validation
 * <ErrorSummary
 *   title="There are 3 problems with your submission"
 *   errors={[
 *     { message: 'Enter your first name', fieldId: 'first-name' },
 *     { message: 'Enter a valid email address', fieldId: 'email' },
 *     { message: 'Select at least one option', fieldId: 'options' },
 *   ]}
 * />
 *
 * // Page/system error
 * <ErrorSummary
 *   variant="page"
 *   title="Something went wrong"
 *   description="We could not save your changes. Please try again."
 *   errors={[{ message: 'Server error: connection timed out' }]}
 *   actions={<Button onClick={handleRetry}>Retry</Button>}
 *   onDismiss={() => setVisible(false)}
 * />
 * ```
 *
 * Keyboard: Tab through error links, Enter activates them (focuses the field).
 */

import React, { forwardRef, useCallback, useEffect, useRef } from 'react';
import { useId } from '../../hooks/use-id';
import { createComponentWarnings } from '@compa11y/core';

const warn = createComponentWarnings('ErrorSummary');

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ErrorSummaryError {
  /** Human-readable error message */
  message: string;
  /** ID of the form field this error relates to. Renders as a link when provided. */
  fieldId?: string;
}

export interface ErrorSummaryProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Heading text. @default "There is a problem" */
  title?: string;
  /** Supporting text below the heading. */
  description?: string;
  /** List of errors to display. */
  errors: ErrorSummaryError[];
  /**
   * Component variant.
   * - `form` — validation summary at top of form (focus-on-render, links to fields)
   * - `page` — system/page-level error banner (live region, optional actions)
   * @default 'form'
   */
  variant?: 'form' | 'page';
  /** Heading level for the title element. @default 2 */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  /**
   * Auto-focus the summary on mount.
   * @default true for form variant, false for page variant
   */
  autoFocus?: boolean;
  /**
   * Live region announcement behavior.
   * - `off` — no ARIA live role (relies on focus for announcement)
   * - `polite` — adds `role="status"` (non-interrupting)
   * - `assertive` — adds `role="alert"` (interrupts current speech)
   * @default 'off' for form variant, 'assertive' for page variant
   */
  announce?: 'off' | 'polite' | 'assertive';
  /** Action buttons for the page variant (e.g. Retry, Dismiss). */
  actions?: React.ReactNode;
  /** Called when the dismiss button is clicked. Renders a dismiss button when provided. */
  onDismiss?: () => void;
  /** Custom accessible label. Overrides aria-labelledby. */
  ariaLabel?: string;
  /** Strip default inline styles. */
  unstyled?: boolean;
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const baseStyles: React.CSSProperties = {
  position: 'relative',
  padding: 'var(--compa11y-error-summary-padding, 1rem 1.25rem)',
  background: 'var(--compa11y-error-summary-bg, white)',
  border: 'var(--compa11y-error-summary-border, 1px solid #e0e0e0)',
  borderLeft: '4px solid var(--compa11y-error-summary-accent-color, #ef4444)',
  borderRadius: 'var(--compa11y-error-summary-radius, 6px)',
};

const focusStyles: React.CSSProperties = {};

const titleStyleMap: React.CSSProperties = {
  margin: '0 0 0.5rem 0',
  fontSize: 'var(--compa11y-error-summary-title-size, 1.125rem)',
  fontWeight: 'var(--compa11y-error-summary-title-weight, 600)' as React.CSSProperties['fontWeight'],
  color: 'var(--compa11y-error-summary-title-color, inherit)',
};

const descriptionStyleMap: React.CSSProperties = {
  margin: '0 0 0.75rem 0',
  fontSize: 'var(--compa11y-error-summary-description-size, 0.875rem)',
  color: 'var(--compa11y-error-summary-description-color, #555)',
};

const listStyles: React.CSSProperties = {
  margin: 0,
  paddingLeft: 'var(--compa11y-error-summary-list-indent, 1.25rem)',
  listStyle: 'none',
};

const itemStyles: React.CSSProperties = {
  marginBottom: '0.25rem',
  fontSize: 'var(--compa11y-error-summary-item-size, 0.875rem)',
};

const linkStyles: React.CSSProperties = {
  color: 'var(--compa11y-error-summary-link-color, #ef4444)',
  textDecoration: 'underline',
  cursor: 'pointer',
  minHeight: '44px',
  display: 'inline-flex',
  alignItems: 'center',
  padding: '0.25rem 0',
};

const actionsStyles: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 'var(--compa11y-error-summary-actions-gap, 0.5rem)',
  marginTop: 'var(--compa11y-error-summary-actions-margin, 0.75rem)',
};

const dismissButtonStyles: React.CSSProperties = {
  appearance: 'none',
  background: 'none',
  border: 'none',
  padding: 0,
  margin: 0,
  font: 'inherit',
  cursor: 'pointer',
  position: 'absolute',
  top: '0.75rem',
  right: '0.75rem',
  width: '2rem',
  height: '2rem',
  minWidth: '44px',
  minHeight: '44px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '4px',
  color: 'var(--compa11y-error-summary-dismiss-color, #999)',
  fontSize: '1.25rem',
  lineHeight: 1,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const ErrorSummary = forwardRef<HTMLDivElement, ErrorSummaryProps>(
  function ErrorSummary(
    {
      title,
      description,
      errors,
      variant = 'form',
      headingLevel = 2,
      autoFocus,
      announce,
      actions,
      onDismiss,
      ariaLabel,
      unstyled = false,
      className = '',
      style,
      ...props
    },
    ref
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const headingId = useId('error-summary-heading');

    // Resolved defaults based on variant
    const resolvedTitle = title ?? 'There is a problem';
    const resolvedAutoFocus = autoFocus ?? (variant === 'form');
    const resolvedAnnounce = announce ?? (variant === 'page' ? 'assertive' : 'off');

    // Dev warnings
    if (process.env.NODE_ENV !== 'production') {
      if (!errors || errors.length === 0) {
        warn.info(
          'ErrorSummary rendered with no errors. Consider conditionally rendering the component.',
        );
      }
      if (variant === 'form' && errors?.length > 0) {
        const missingFieldIds = errors.filter((e) => !e.fieldId);
        if (missingFieldIds.length > 0) {
          warn.warning(
            `${missingFieldIds.length} error(s) are missing a fieldId. Link to the corresponding field for the best user experience.`,
            'Provide a fieldId for each error that corresponds to a form field ID.',
          );
        }
      }
    }

    // Merge refs
    const mergedRef = useCallback(
      (node: HTMLDivElement | null) => {
        (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      },
      [ref],
    );

    // Auto-focus on mount
    useEffect(() => {
      if (resolvedAutoFocus && errors?.length > 0) {
        containerRef.current?.focus();
      }
      // Only run on mount — consumer can call ref.focus() for re-submits
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Error link click handler
    const handleErrorClick = useCallback(
      (fieldId: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        const target = document.getElementById(fieldId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          target.focus({ preventScroll: true });
        }
      },
      [],
    );

    // ARIA role based on announce setting
    const roleProps: Record<string, string | undefined> = {};
    if (resolvedAnnounce === 'assertive') {
      roleProps.role = 'alert';
    } else if (resolvedAnnounce === 'polite') {
      roleProps.role = 'status';
      roleProps['aria-live'] = 'polite';
      roleProps['aria-atomic'] = 'true';
    }

    const Tag = `h${headingLevel}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

    const resolvedStyle = unstyled
      ? style
      : {
          ...baseStyles,
          ...(onDismiss ? { paddingRight: '3rem' } : {}),
          ...focusStyles,
          ...style,
        };

    return (
      <div
        ref={mergedRef}
        tabIndex={-1}
        {...roleProps}
        aria-label={ariaLabel}
        aria-labelledby={!ariaLabel ? headingId : undefined}
        data-compa11y-error-summary=""
        data-variant={variant}
        className={['compa11y-error-summary', className].filter(Boolean).join(' ')}
        style={resolvedStyle}
        {...props}
      >
        <Tag
          id={headingId}
          data-compa11y-error-summary-title=""
          style={unstyled ? undefined : titleStyleMap}
        >
          {resolvedTitle}
        </Tag>

        {description && (
          <p
            data-compa11y-error-summary-description=""
            style={unstyled ? undefined : descriptionStyleMap}
          >
            {description}
          </p>
        )}

        {errors.length > 0 && (
          <ul
            data-compa11y-error-summary-list=""
            style={unstyled ? undefined : listStyles}
          >
            {errors.map((error, i) => (
              <li
                key={error.fieldId ?? i}
                data-compa11y-error-summary-item=""
                style={unstyled ? undefined : itemStyles}
              >
                {error.fieldId ? (
                  <a
                    href={`#${error.fieldId}`}
                    onClick={handleErrorClick(error.fieldId)}
                    data-compa11y-error-summary-link=""
                    style={unstyled ? undefined : linkStyles}
                  >
                    {error.message}
                  </a>
                ) : (
                  error.message
                )}
              </li>
            ))}
          </ul>
        )}

        {actions && (
          <div
            data-compa11y-error-summary-actions=""
            style={unstyled ? undefined : actionsStyles}
          >
            {actions}
          </div>
        )}

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss error summary"
            data-compa11y-error-summary-dismiss=""
            style={unstyled ? undefined : dismissButtonStyles}
          >
            &times;
          </button>
        )}
      </div>
    );
  },
);
