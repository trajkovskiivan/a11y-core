/**
 * Accessible VisuallyHidden component.
 *
 * Hides content visually while keeping it accessible to screen readers.
 *
 * @example
 * ```tsx
 * // Screen-reader-only text
 * <VisuallyHidden>Loading, please wait</VisuallyHidden>
 *
 * // Focusable (becomes visible on focus, e.g. skip links)
 * <VisuallyHidden focusable>
 *   <a href="#main-content">Skip to main content</a>
 * </VisuallyHidden>
 * ```
 */

import React, { forwardRef } from 'react';

export interface VisuallyHiddenProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** When true, content becomes visible when a child receives focus (useful for skip links) */
  focusable?: boolean;
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

export const VisuallyHidden = forwardRef<HTMLSpanElement, VisuallyHiddenProps>(
  function VisuallyHidden({ focusable = false, style, children, ...props }, ref) {
    return (
      <span
        ref={ref}
        data-compa11y-visually-hidden
        data-focusable={focusable || undefined}
        style={focusable ? undefined : { ...visuallyHiddenStyles, ...style }}
        {...props}
      >
        {children}
      </span>
    );
  }
);
