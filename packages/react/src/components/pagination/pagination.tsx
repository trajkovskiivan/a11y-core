import React, { forwardRef, useCallback, useState } from 'react';
import { useId } from '../../hooks/use-id';
import { createComponentWarnings } from '@compa11y/core';

const warn = createComponentWarnings('Pagination');

// --------------------------------------------------------------------------
// Visually hidden style for live region (self-contained, no extra dep)
// --------------------------------------------------------------------------

const srOnlyStyle: React.CSSProperties = {
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

// --------------------------------------------------------------------------
// Page range algorithm
// --------------------------------------------------------------------------

/**
 * Compute which pages / ellipsis markers to render.
 *
 * Rules:
 * - Always show `boundaryCount` pages at each end.
 * - Always show `siblingCount` pages either side of currentPage.
 * - If the gap between two groups is exactly 1 page, show the page instead.
 * - If the gap is > 1 page, show an ellipsis.
 */
export function getPageRange(
  currentPage: number,
  totalPages: number,
  siblingCount: number,
  boundaryCount: number
): (number | 'ellipsis-start' | 'ellipsis-end')[] {
  if (totalPages <= 0) return [];
  if (totalPages === 1) return [1];

  const pagesToShow = new Set<number>();

  // Left boundary
  for (let i = 1; i <= Math.min(boundaryCount, totalPages); i++) {
    pagesToShow.add(i);
  }
  // Right boundary
  for (
    let i = Math.max(totalPages - boundaryCount + 1, 1);
    i <= totalPages;
    i++
  ) {
    pagesToShow.add(i);
  }
  // Siblings around current page
  for (
    let i = Math.max(currentPage - siblingCount, 1);
    i <= Math.min(currentPage + siblingCount, totalPages);
    i++
  ) {
    pagesToShow.add(i);
  }

  const sorted = Array.from(pagesToShow).sort((a, b) => a - b);
  const result: (number | 'ellipsis-start' | 'ellipsis-end')[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    const prev = sorted[i - 1];

    if (current === undefined) continue;

    if (prev !== undefined) {
      const gap = current - prev;
      if (gap === 2) {
        // Gap is exactly 1 page — show the number instead of an ellipsis
        result.push(prev + 1);
      } else if (gap > 2) {
        // Gap is 2+ pages — insert ellipsis.
        // Determine left vs right by comparing the gap midpoint to currentPage.
        const midpoint = (prev + current) / 2;
        result.push(midpoint < currentPage ? 'ellipsis-start' : 'ellipsis-end');
      }
    }

    result.push(current);
  }

  return result;
}

// --------------------------------------------------------------------------
// Props interface
// --------------------------------------------------------------------------

export interface PaginationProps {
  /**
   * Total number of pages.
   * Required when `totalItems` is not provided.
   */
  totalPages?: number;
  /**
   * Total number of items across all pages.
   * Used to derive `totalPages` when `totalPages` is not set, and for
   * "Showing X–Y of N" announcements when `showPageSize` is enabled.
   */
  totalItems?: number;
  /**
   * Currently active page (1-indexed).
   * Omit for fully uncontrolled usage — use `defaultPage` to seed initial state.
   */
  currentPage?: number;
  /**
   * Called when the user navigates to a different page.
   */
  onPageChange?: (page: number) => void;
  /**
   * Accessible label for the `<nav>` landmark.
   * **Must be unique** when multiple `Pagination` instances appear on the
   * same page (e.g. top and bottom of a table).
   * @default "Pagination"
   */
  ariaLabel?: string;
  /**
   * Seed page for uncontrolled usage.
   * Ignored when `currentPage` is provided.
   * @default 1
   */
  defaultPage?: number;
  /**
   * Pages shown either side of the current page.
   * @default 1
   */
  siblingCount?: number;
  /**
   * Pages shown at each end of the range.
   * @default 1
   */
  boundaryCount?: number;
  /**
   * Show First (««) and Last (»») buttons.
   * @default false
   */
  showFirstLast?: boolean;
  /**
   * Disable every control.
   * @default false
   */
  disabled?: boolean;
  /**
   * Remove `data-compa11y-*` attributes so no library styles are applied.
   * Useful when you want to supply your own stylesheet from scratch.
   * @default false
   */
  unstyled?: boolean;
  /**
   * Render a rows-per-page `<select>`.
   * Requires `pageSize` and `onPageSizeChange` for controlled usage.
   * @default false
   */
  showPageSize?: boolean;
  /**
   * Current page size (number of rows per page).
   * Omit to let the component manage page size internally.
   */
  pageSize?: number;
  /**
   * Options for the rows-per-page selector.
   * @default [10, 25, 50]
   */
  pageSizeOptions?: number[];
  /**
   * Called when the user selects a different page size.
   * The component automatically resets to page 1 and calls `onPageChange(1)`.
   */
  onPageSizeChange?: (size: number) => void;
  /**
   * Render a "Go to page" number input with inline validation.
   * @default false
   */
  showJumpTo?: boolean;
  /** Inline styles applied to the root `<nav>` element. */
  style?: React.CSSProperties;
  /** Class name applied to the root `<nav>` element. */
  className?: string;
}

// --------------------------------------------------------------------------
// Component
// --------------------------------------------------------------------------

export const Pagination = forwardRef<HTMLElement, PaginationProps>(
  function Pagination(
    {
      totalPages: totalPagesProp,
      totalItems,
      currentPage: currentPageProp,
      onPageChange,
      ariaLabel = 'Pagination',
      defaultPage = 1,
      siblingCount = 1,
      boundaryCount = 1,
      showFirstLast = false,
      disabled = false,
      unstyled = false,
      showPageSize = false,
      pageSize: pageSizeProp,
      pageSizeOptions = [10, 25, 50],
      onPageSizeChange,
      showJumpTo = false,
      style,
      className,
    },
    ref
  ) {
    // ------------------------------------------------------------------
    // Controlled + uncontrolled page state
    // ------------------------------------------------------------------
    const [uncontrolledPage, setUncontrolledPage] = useState(defaultPage);
    const page = currentPageProp ?? uncontrolledPage;

    // ------------------------------------------------------------------
    // Controlled + uncontrolled page-size state
    // ------------------------------------------------------------------
    const [uncontrolledPageSize, setUncontrolledPageSize] = useState(
      pageSizeProp ?? pageSizeOptions[0] ?? 25
    );
    const pageSize = pageSizeProp ?? uncontrolledPageSize;

    // ------------------------------------------------------------------
    // Derived total pages
    // ------------------------------------------------------------------
    const resolvedTotalPages = Math.max(
      1,
      totalPagesProp ??
        (totalItems != null ? Math.ceil(totalItems / pageSize) : 1)
    );

    // ------------------------------------------------------------------
    // Dev warnings
    // ------------------------------------------------------------------
    if (process.env.NODE_ENV !== 'production') {
      if (totalPagesProp == null && totalItems == null) {
        warn.error(
          'Either totalPages or totalItems is required.',
          'Pass totalPages={n} or totalItems={n} to Pagination.'
        );
      }
      if (page < 1 || page > resolvedTotalPages) {
        warn.warning(
          `currentPage (${page}) is out of range 1–${resolvedTotalPages}.`,
          'Ensure currentPage is between 1 and totalPages.'
        );
      }
    }

    // ------------------------------------------------------------------
    // Live region state
    // ------------------------------------------------------------------
    const [liveMessage, setLiveMessage] = useState('');

    // ------------------------------------------------------------------
    // Jump-to state
    // ------------------------------------------------------------------
    const [jumpValue, setJumpValue] = useState('');
    const [jumpError, setJumpError] = useState('');

    // ------------------------------------------------------------------
    // Stable IDs
    // ------------------------------------------------------------------
    const baseId = useId('pagination');
    const pageSizeId = `${baseId}-pagesize`;
    const jumpId = `${baseId}-jump`;
    const jumpErrorId = `${baseId}-jump-error`;

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------
    const pushAnnouncement = useCallback((message: string) => {
      setLiveMessage(message);
      setTimeout(() => setLiveMessage(''), 1000);
    }, []);

    const goToPage = useCallback(
      (p: number) => {
        if (p < 1 || p > resolvedTotalPages || p === page) return;
        if (currentPageProp === undefined) setUncontrolledPage(p);
        onPageChange?.(p);
        pushAnnouncement(`Page ${p} of ${resolvedTotalPages}`);
      },
      [currentPageProp, page, resolvedTotalPages, onPageChange, pushAnnouncement]
    );

    const handlePageSizeChange = useCallback(
      (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSize = parseInt(e.target.value, 10);
        if (pageSizeProp === undefined) setUncontrolledPageSize(newSize);
        onPageSizeChange?.(newSize);
        onPageChange?.(1);
        if (currentPageProp === undefined) setUncontrolledPage(1);
        if (totalItems != null) {
          pushAnnouncement(
            `Showing 1–${Math.min(newSize, totalItems)} of ${totalItems}`
          );
        } else {
          pushAnnouncement(`Page 1 of ${resolvedTotalPages}`);
        }
      },
      [
        pageSizeProp,
        onPageSizeChange,
        onPageChange,
        currentPageProp,
        totalItems,
        resolvedTotalPages,
        pushAnnouncement,
      ]
    );

    const handleJump = useCallback(() => {
      const n = parseInt(jumpValue, 10);
      if (isNaN(n) || n < 1 || n > resolvedTotalPages) {
        setJumpError(`Enter a page between 1 and ${resolvedTotalPages}`);
        return;
      }
      setJumpError('');
      goToPage(n);
      setJumpValue('');
    }, [jumpValue, resolvedTotalPages, goToPage]);

    const handleJumpKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleJump();
      },
      [handleJump]
    );

    // ------------------------------------------------------------------
    // Render helpers
    // ------------------------------------------------------------------
    const pageRange = getPageRange(
      page,
      resolvedTotalPages,
      siblingCount,
      boundaryCount
    );
    const isFirst = page <= 1;
    const isLast = page >= resolvedTotalPages;

    // Spread data attributes only when styled
    const navAttr = unstyled ? {} : { 'data-compa11y-pagination': '' };
    const btnAttr = unstyled ? {} : { 'data-compa11y-pagination-btn': '' };

    // Inline layout styles (only when not unstyled — a stylesheet is expected
    // to handle things in unstyled mode)
    const ulStyle: React.CSSProperties = unstyled
      ? {}
      : {
          display: 'flex',
          flexWrap: 'wrap' as const,
          alignItems: 'center',
          gap: '4px',
          listStyle: 'none',
          margin: 0,
          padding: 0,
        };

    const btnStyle: React.CSSProperties = unstyled
      ? {}
      : {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '44px',
          minHeight: '44px',
          padding: '0 8px',
          border: '1px solid currentColor',
          borderRadius: '4px',
          background: 'transparent',
          cursor: 'pointer',
          font: 'inherit',
        };

    const currentBtnStyle: React.CSSProperties = unstyled
      ? {}
      : {
          ...btnStyle,
          fontWeight: 'bold',
          borderWidth: '2px',
        };

    const extrasStyle: React.CSSProperties = unstyled
      ? {}
      : {
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginTop: '8px',
          flexWrap: 'wrap' as const,
        };

    return (
      <nav ref={ref} aria-label={ariaLabel} style={style} className={className} {...navAttr}>
        {/*
         * Live region — MUST be in the DOM before any page change fires so
         * screen readers register it. Content is updated after activation.
         */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          style={srOnlyStyle}
        >
          {liveMessage}
        </div>

        <ul style={ulStyle}>
          {/* First */}
          {showFirstLast && (
            <li>
              <button
                type="button"
                aria-label="First page"
                disabled={isFirst || disabled}
                onClick={() => goToPage(1)}
                style={btnStyle}
                {...btnAttr}
              >
                «
              </button>
            </li>
          )}

          {/* Previous */}
          <li>
            <button
              type="button"
              aria-label="Previous page"
              disabled={isFirst || disabled}
              onClick={() => goToPage(page - 1)}
              style={btnStyle}
              {...btnAttr}
            >
              ‹
            </button>
          </li>

          {/* Page buttons + ellipsis */}
          {pageRange.map((item) => {
            if (item === 'ellipsis-start' || item === 'ellipsis-end') {
              return (
                <li key={item} aria-hidden="true">
                  <span style={unstyled ? {} : { padding: '0 4px' }}>…</span>
                </li>
              );
            }
            const isCurrent = item === page;
            return (
              <li key={item}>
                <button
                  type="button"
                  aria-label={`Page ${item}`}
                  aria-current={isCurrent ? 'page' : undefined}
                  disabled={disabled}
                  onClick={() => goToPage(item)}
                  style={isCurrent ? currentBtnStyle : btnStyle}
                  {...btnAttr}
                  {...(!unstyled && {
                    'data-compa11y-pagination-page': '',
                    'data-current': String(isCurrent),
                  })}
                >
                  {item}
                </button>
              </li>
            );
          })}

          {/* Next */}
          <li>
            <button
              type="button"
              aria-label="Next page"
              disabled={isLast || disabled}
              onClick={() => goToPage(page + 1)}
              style={btnStyle}
              {...btnAttr}
            >
              ›
            </button>
          </li>

          {/* Last */}
          {showFirstLast && (
            <li>
              <button
                type="button"
                aria-label="Last page"
                disabled={isLast || disabled}
                onClick={() => goToPage(resolvedTotalPages)}
                style={btnStyle}
                {...btnAttr}
              >
                »
              </button>
            </li>
          )}
        </ul>

        {/* Rows per page selector + Jump to page */}
        {(showPageSize || showJumpTo) && (
          <div style={extrasStyle}>
            {/* Rows per page selector */}
            {showPageSize && (
              <div style={unstyled ? {} : { display: 'flex', alignItems: 'center', gap: '6px' }}>
                <label htmlFor={pageSizeId}>Rows per page</label>
                <select
                  id={pageSizeId}
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  disabled={disabled}
                  {...(!unstyled && { 'data-compa11y-pagination-pagesize': '' })}
                >
                  {pageSizeOptions.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Jump to page */}
            {showJumpTo && (
              <div style={unstyled ? {} : { display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <label htmlFor={jumpId}>Go to page</label>
                <input
                  id={jumpId}
                  type="number"
                  min={1}
                  max={resolvedTotalPages}
                  value={jumpValue}
                  onChange={(e) => setJumpValue(e.target.value)}
                  onKeyDown={handleJumpKeyDown}
                  disabled={disabled}
                  style={unstyled ? {} : { width: '60px' }}
                  {...(jumpError ? { 'aria-describedby': jumpErrorId } : {})}
                  {...(!unstyled && { 'data-compa11y-pagination-jump': '' })}
                />
                {jumpError && (
                  <span
                    id={jumpErrorId}
                    role="alert"
                    style={unstyled ? {} : { color: 'red', fontSize: '0.875em' }}
                    {...(!unstyled && { 'data-compa11y-pagination-error': '' })}
                  >
                    {jumpError}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </nav>
    );
  }
);
