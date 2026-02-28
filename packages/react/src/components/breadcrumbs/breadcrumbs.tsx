/**
 * Accessible Breadcrumbs component.
 *
 * Renders a `<nav aria-label>` > `<ol>` trail of links with the last item
 * marked `aria-current="page"`. Separators are aria-hidden. Supports a
 * collapsible middle (maxItems) with a keyboard-accessible expand button.
 *
 * @example
 * ```tsx
 * <Breadcrumbs
 *   items={[
 *     { label: 'Home', href: '/' },
 *     { label: 'Products', href: '/products' },
 *     { label: 'Model X' },
 *   ]}
 * />
 *
 * // With collapse
 * <Breadcrumbs
 *   items={longItems}
 *   maxItems={4}
 *   ariaLabel="Product breadcrumb"
 * />
 * ```
 *
 * @attr ariaLabel  - Accessible name for the <nav> landmark (default: "Breadcrumb")
 * @attr separator  - Visual separator between items (default: "/")
 * @attr maxItems   - Collapse middle items when trail is longer (0 = never)
 * @attr unstyled   - Strip all inline styles
 */

import React, { forwardRef, useState, useRef, useEffect, useCallback } from 'react';
import { createComponentWarnings } from '@compa11y/core';

// =============================================================================
// Warnings
// =============================================================================

const warn = createComponentWarnings('Breadcrumbs');

// =============================================================================
// Types
// =============================================================================

export interface BreadcrumbItem {
  /** Visible label */
  label: string;
  /** Navigation target — omit for current page (last item) */
  href?: string;
  /** Optional decorative icon before label */
  icon?: React.ReactNode;
}

export interface BreadcrumbsProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'aria-label'> {
  /** Ordered list of crumbs — last item is treated as current page */
  items: BreadcrumbItem[];
  /** Accessible name for the <nav> landmark */
  ariaLabel?: string;
  /** Separator between items — string or node */
  separator?: React.ReactNode;
  /** Maximum items before collapsing middle (0 = never collapse) */
  maxItems?: number;
  /** Remove all inline styles */
  unstyled?: boolean;
}

// =============================================================================
// Styles
// =============================================================================

const listStyles: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  listStyle: 'none',
  margin: 0,
  padding: 0,
  gap: 0,
};

const separatorStyles: React.CSSProperties = {
  padding: '0 var(--compa11y-breadcrumbs-separator-padding, 0.375rem)',
  color: 'var(--compa11y-breadcrumbs-separator-color, #999)',
  userSelect: 'none',
  pointerEvents: 'none',
};

const linkStyles: React.CSSProperties = {
  color: 'var(--compa11y-breadcrumbs-link-color, #0066cc)',
  textDecoration: 'underline',
  borderRadius: '2px',
};

const currentStyles: React.CSSProperties = {
  fontWeight: 600,
  textDecoration: 'none',
  color: 'var(--compa11y-breadcrumbs-current-color, inherit)',
};

const expandButtonStyles: React.CSSProperties = {
  appearance: 'none',
  background: 'none',
  border: '1px solid currentColor',
  borderRadius: '3px',
  padding: '0 0.3rem',
  cursor: 'pointer',
  font: 'inherit',
  lineHeight: 1.4,
  color: 'var(--compa11y-breadcrumbs-link-color, #0066cc)',
};

// =============================================================================
// Component
// =============================================================================

export const Breadcrumbs = forwardRef<HTMLElement, BreadcrumbsProps>(
  function Breadcrumbs(
    {
      items,
      ariaLabel = 'Breadcrumb',
      separator = '/',
      maxItems = 0,
      unstyled = false,
      style,
      ...props
    },
    ref
  ) {
    const [isExpanded, setIsExpanded] = useState(false);
    const firstRevealedRef = useRef<HTMLAnchorElement | null>(null);

    // Dev warnings (stripped in production)
    if (process.env.NODE_ENV !== 'production') {
      if (!items || items.length === 0) {
        warn.error(
          'items array is empty — Breadcrumbs requires at least one item.'
        );
      } else if (items.length === 1) {
        warn.warning(
          'Single-item breadcrumbs are rarely useful. Consider omitting.'
        );
      }
    }

    // After expanding, move focus to the first newly revealed link (index 1)
    useEffect(() => {
      if (isExpanded && firstRevealedRef.current) {
        firstRevealedRef.current.focus();
      }
    }, [isExpanded]);

    const shouldCollapse =
      maxItems > 0 && !isExpanded && (items?.length ?? 0) > maxItems;

    const handleExpand = useCallback(() => {
      setIsExpanded(true);
    }, []);

    if (!items || items.length === 0) {
      return null;
    }

    // ---------- helpers ----------

    const renderItemContent = (item: BreadcrumbItem) => (
      <>
        {item.icon && (
          <span aria-hidden="true" data-compa11y-breadcrumbs-icon="">
            {item.icon}
          </span>
        )}
        {item.label}
      </>
    );

    const renderCrumb = (
      item: BreadcrumbItem,
      isLast: boolean,
      key: string,
      isFirstRevealed = false
    ) => {
      const content = renderItemContent(item);

      if (isLast) {
        return (
          <li key={key} data-compa11y-breadcrumbs-item="">
            {item.href ? (
              <a
                href={item.href}
                aria-current="page"
                data-compa11y-breadcrumbs-current=""
                style={unstyled ? undefined : currentStyles}
              >
                {content}
              </a>
            ) : (
              <span
                aria-current="page"
                data-compa11y-breadcrumbs-current=""
                style={unstyled ? undefined : currentStyles}
              >
                {content}
              </span>
            )}
          </li>
        );
      }

      return (
        <li key={key} data-compa11y-breadcrumbs-item="">
          {item.href ? (
            <a
              href={item.href}
              ref={isFirstRevealed ? firstRevealedRef : undefined}
              data-compa11y-breadcrumbs-link=""
              style={unstyled ? undefined : linkStyles}
            >
              {content}
            </a>
          ) : (
            <span data-compa11y-breadcrumbs-link="">{content}</span>
          )}
        </li>
      );
    };

    const renderSeparator = (key: string) => (
      <li
        key={key}
        aria-hidden="true"
        data-compa11y-breadcrumbs-separator=""
        style={unstyled ? undefined : separatorStyles}
      >
        {separator}
      </li>
    );

    // ---------- build list items ----------

    const listItems: React.ReactNode[] = [];

    if (shouldCollapse) {
      const tailCount = Math.max(maxItems - 1, 1);
      const tailItems = items.slice(items.length - tailCount);

      // Always show first item
      listItems.push(renderCrumb(items[0]!, false, 'item-0'));
      listItems.push(renderSeparator('sep-before-ellipsis'));

      // Expand button
      listItems.push(
        <li key="ellipsis" data-compa11y-breadcrumbs-item="">
          <button
            type="button"
            aria-label="Show full breadcrumb path"
            aria-expanded={false}
            data-compa11y-breadcrumbs-expand=""
            onClick={handleExpand}
            style={unstyled ? undefined : expandButtonStyles}
          >
            &hellip;
          </button>
        </li>
      );

      listItems.push(renderSeparator('sep-after-ellipsis'));

      // Tail items
      tailItems.forEach((item, i) => {
        if (i > 0) listItems.push(renderSeparator(`sep-tail-${i}`));
        const isLast = i === tailItems.length - 1;
        listItems.push(renderCrumb(item, isLast, `tail-${i}`));
      });
    } else {
      items.forEach((item, i) => {
        if (i > 0) listItems.push(renderSeparator(`sep-${i}`));
        const isLast = i === items.length - 1;
        // First revealed after expand = index 1 (first previously-hidden item)
        const isFirstRevealed = isExpanded && i === 1;
        listItems.push(renderCrumb(item, isLast, `item-${i}`, isFirstRevealed));
      });
    }

    return (
      <nav
        ref={ref as React.Ref<HTMLElement>}
        aria-label={ariaLabel}
        data-compa11y-breadcrumbs=""
        style={style}
        {...props}
      >
        <ol
          data-compa11y-breadcrumbs-list=""
          style={unstyled ? undefined : listStyles}
        >
          {listItems}
        </ol>
      </nav>
    );
  }
);

Breadcrumbs.displayName = 'Breadcrumbs';
