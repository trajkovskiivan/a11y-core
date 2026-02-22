/**
 * Accessible Link component.
 *
 * An enhanced anchor element that handles external link indicators,
 * `aria-current` for navigation, and proper focus styling.
 *
 * @example
 * ```tsx
 * // Basic link
 * <Link href="/about">About us</Link>
 *
 * // External link (opens in new tab with screen reader hint)
 * <Link href="https://example.com" external>Visit Example</Link>
 *
 * // Current page in navigation
 * <Link href="/dashboard" current="page">Dashboard</Link>
 *
 * // Disabled link
 * <Link href="/settings" disabled>Settings</Link>
 * ```
 *
 * Keyboard: Tab to focus, Enter to activate.
 */

import React, { forwardRef } from 'react';

export interface LinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'aria-current'> {
  /** Opens in new tab with rel="noopener noreferrer" and screen reader hint */
  external?: boolean;
  /** Sets aria-current for navigation context */
  current?: 'page' | 'step' | 'location' | 'true' | boolean;
  /** Disables the link (removes from tab order, prevents navigation) */
  disabled?: boolean;
  /** Remove default styles */
  unstyled?: boolean;
}

const linkStyles: React.CSSProperties = {
  color: '#0066cc',
  textDecoration: 'underline',
  cursor: 'pointer',
  borderRadius: '2px',
};

const disabledStyles: React.CSSProperties = {
  color: '#999',
  cursor: 'not-allowed',
  textDecoration: 'none',
};

const externalIconStyles: React.CSSProperties = {
  display: 'inline-block',
  width: '0.75em',
  height: '0.75em',
  marginLeft: '0.25em',
  verticalAlign: 'baseline',
};

const srOnlyStyles: React.CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  function Link(
    {
      external = false,
      current,
      disabled = false,
      unstyled = false,
      children,
      style,
      href,
      target,
      rel,
      tabIndex,
      onClick,
      ...props
    },
    ref
  ) {
    const resolvedStyle = unstyled
      ? style
      : {
          ...linkStyles,
          ...(disabled ? disabledStyles : undefined),
          ...style,
        };

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (disabled) {
        e.preventDefault();
        return;
      }
      onClick?.(e);
    };

    // Compute aria-current value
    const ariaCurrent =
      current === true ? 'true' : current || undefined;

    // For disabled links, render without href to remove from default tab order
    const linkProps: React.AnchorHTMLAttributes<HTMLAnchorElement> = disabled
      ? {
          role: 'link',
          'aria-disabled': true,
          tabIndex: -1,
        }
      : {
          href,
          target: external ? (target ?? '_blank') : target,
          rel: external ? (rel ?? 'noopener noreferrer') : rel,
          tabIndex,
        };

    return (
      <a
        ref={ref}
        aria-current={ariaCurrent}
        data-compa11y-link
        data-external={external || undefined}
        data-disabled={disabled || undefined}
        style={resolvedStyle}
        onClick={handleClick}
        {...linkProps}
        {...props}
      >
        {children}
        {external && (
          <>
            <svg
              data-compa11y-link-external-icon
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={unstyled ? undefined : externalIconStyles}
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            <span style={srOnlyStyles}>(opens in new tab)</span>
          </>
        )}
      </a>
    );
  }
);
