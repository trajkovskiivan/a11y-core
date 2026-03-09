/**
 * Accessible SkipLink component.
 *
 * A navigation aid that allows keyboard users to skip repetitive content
 * (like navigation menus) and jump directly to the main content area.
 *
 * Must be rendered as the FIRST focusable element on the page.
 * Visually hidden until focused, then appears prominently.
 *
 * @example
 * ```tsx
 * // Place at the very top of your layout
 * <SkipLink target="#main-content" />
 *
 * // Custom label
 * <SkipLink target="#main-content">Skip navigation</SkipLink>
 *
 * // Multiple skip links
 * <SkipLink target="#main-content">Skip to content</SkipLink>
 * <SkipLink target="#search">Skip to search</SkipLink>
 * ```
 *
 * Keyboard: Tab to reveal, Enter to activate.
 */

import React, { forwardRef, useCallback, useEffect } from 'react';
import { createComponentWarnings } from '@compa11y/core';

const warnings = createComponentWarnings('SkipLink');

export interface SkipLinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  /** CSS selector of the target element to skip to (e.g. "#main-content") */
  target?: string;
  /** Remove default styles */
  unstyled?: boolean;
}

const visuallyHiddenStyles: React.CSSProperties = {
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

const focusedStyles: React.CSSProperties = {
  position: 'fixed',
  top: '0.5rem',
  left: '0.5rem',
  zIndex: 99999,
  width: 'auto',
  height: 'auto',
  padding: '0.75rem 1.5rem',
  margin: 0,
  overflow: 'visible',
  clip: 'auto',
  whiteSpace: 'normal',
  background: '#0066cc',
  color: 'white',
  fontSize: '1rem',
  fontWeight: 600,
  borderRadius: '4px',
  border: '2px solid transparent',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
  outline: '2px solid #0066cc',
  outlineOffset: '2px',
  textDecoration: 'none',
};

export const SkipLink = forwardRef<HTMLAnchorElement, SkipLinkProps>(
  function SkipLink(
    { target = '#main-content', unstyled = false, children, style, onClick, ...props },
    ref
  ) {
    const [isFocused, setIsFocused] = React.useState(false);

    // Dev warning: target selector doesn't match any element
    useEffect(() => {
      if (process.env.NODE_ENV !== 'production') {
        // Check after mount to allow target to render
        const timer = setTimeout(() => {
          if (!document.querySelector(target)) {
            warnings.warning(
              `Target selector "${target}" does not match any element in the DOM. The skip link will not function.`
            );
          }
        }, 0);
        return () => clearTimeout(timer);
      }
    }, [target]);

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLAnchorElement>) => {
        const element = document.querySelector(target) as HTMLElement | null;
        if (element) {
          event.preventDefault();
          if (!element.hasAttribute('tabindex') && element.tabIndex < 0) {
            element.setAttribute('tabindex', '-1');
          }
          element.focus();
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        onClick?.(event);
      },
      [target, onClick]
    );

    const resolvedStyle = unstyled
      ? style
      : isFocused
        ? { ...focusedStyles, ...style }
        : { ...visuallyHiddenStyles, ...style };

    return (
      <a
        ref={ref}
        href={target}
        data-compa11y-skip-link
        data-focused={isFocused || undefined}
        style={resolvedStyle}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onClick={handleClick}
        {...props}
      >
        {children || 'Skip to main content'}
      </a>
    );
  }
);
