/**
 * SearchField Component
 *
 * An accessible search input that supports both submit-on-Enter and
 * live filter-as-you-type patterns. Wraps the input in a `role="search"`
 * landmark, provides an accessible clear button, and announces result
 * count changes to screen readers.
 *
 * @example
 * // Submit pattern
 * <SearchField
 *   label="Search products"
 *   value={query}
 *   onChange={setQuery}
 *   onSubmit={runSearch}
 *   showSearchButton
 * />
 *
 * // Filter-as-you-type pattern
 * <SearchField
 *   label="Filter messages"
 *   value={query}
 *   onChange={setQuery}
 *   resultsCount={filteredItems.length}
 * />
 *
 * // Both patterns simultaneously
 * <SearchField
 *   label="Search"
 *   value={query}
 *   onChange={setQuery}
 *   onSubmit={runSearch}
 *   resultsCount={results.length}
 *   isLoading={isLoading}
 * />
 */

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useId } from '../../hooks/use-id';
import { useFocusVisible } from '../../hooks/use-focus-visible';
import { useAnnouncer, useAnnounceLoading } from '../../hooks/use-announcer';
import { createComponentWarnings } from '@compa11y/core';

const warn = createComponentWarnings('SearchField');

// =============================================================================
// One-time global style injection (webkit cancel button + spinner keyframes)
// =============================================================================

let _globalStylesInjected = false;

function injectGlobalStyles(): void {
  if (_globalStylesInjected || typeof document === 'undefined') return;
  _globalStylesInjected = true;
  const style = document.createElement('style');
  style.textContent = `
    [data-compa11y-search-field-input]::-webkit-search-cancel-button,
    [data-compa11y-search-field-input]::-webkit-search-decoration {
      -webkit-appearance: none;
      appearance: none;
    }
    @keyframes compa11y-search-spin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    @media (prefers-reduced-motion: reduce) {
      [data-compa11y-search-field-spinner] svg {
        animation: none !important;
      }
    }
  `;
  document.head.appendChild(style);
}

// =============================================================================
// Types
// =============================================================================

export interface SearchFieldProps {
  // ── Label (at least one required) ─────────────────────────────────────────
  /** Visible label text */
  label?: string;
  /** Accessible label when no visible label is rendered */
  'aria-label'?: string;
  /** ID of an external element that labels this field */
  'aria-labelledby'?: string;

  // ── Value (controlled + uncontrolled) ─────────────────────────────────────
  /** Controlled search value */
  value?: string;
  /** Initial value for uncontrolled use */
  defaultValue?: string;
  /** Called on every keystroke */
  onChange?: (value: string) => void;

  // ── Actions ───────────────────────────────────────────────────────────────
  /** Called when user submits (Enter key or Search button click) */
  onSubmit?: (value: string) => void;
  /** Called when user clears the field; field is also cleared internally */
  onClear?: () => void;

  // ── Buttons ───────────────────────────────────────────────────────────────
  /** Accessible label for the clear button (default: "Clear search") */
  clearLabel?: string;
  /** Render a visible Search submit button (default: false) */
  showSearchButton?: boolean;
  /** Label for the Search submit button (default: "Search") */
  searchButtonLabel?: string;

  // ── Results feedback ──────────────────────────────────────────────────────
  /**
   * Current results count. When this value changes, a polite screen reader
   * announcement is made (debounced 300 ms to avoid keystroke spam).
   */
  resultsCount?: number;
  /**
   * Custom announcement string. When provided, replaces the auto-generated
   * "N results" / "No results" message.
   */
  resultsLabel?: string;

  // ── State ─────────────────────────────────────────────────────────────────
  /** Shows a loading spinner and announces loading state to screen readers */
  isLoading?: boolean;
  /** Disables the entire field */
  disabled?: boolean;

  // ── Input configuration ───────────────────────────────────────────────────
  placeholder?: string;
  name?: string;
  /** Moves focus to the input on mount */
  autoFocus?: boolean;
  maxLength?: number;

  // ── Validation ────────────────────────────────────────────────────────────
  error?: ReactNode;
  hint?: ReactNode;

  // ── Style ─────────────────────────────────────────────────────────────────
  /** Remove built-in styles for full customization */
  unstyled?: boolean;
  className?: string;
  /** Inline styles applied to the root wrapper element */
  style?: React.CSSProperties;
}

// =============================================================================
// Component
// =============================================================================

export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(
  function SearchField(
    {
      label,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      value: controlledValue,
      defaultValue = '',
      onChange,
      onSubmit,
      onClear,
      clearLabel = 'Clear search',
      showSearchButton = false,
      searchButtonLabel = 'Search',
      resultsCount,
      resultsLabel,
      isLoading = false,
      disabled = false,
      placeholder,
      name,
      autoFocus,
      maxLength,
      error,
      hint,
      unstyled = false,
      className = '',
      style: rootStyle,
    },
    ref
  ) {
    // ── IDs ─────────────────────────────────────────────────────────────────
    const baseId = useId('search-field');
    const inputId = `${baseId}-input`;
    const hintId = `${baseId}-hint`;
    const errorId = `${baseId}-error`;

    // ── Refs ────────────────────────────────────────────────────────────────
    const inputRef = useRef<HTMLInputElement>(null);
    const resultsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const prevResultsCount = useRef<number | undefined>(undefined);
    const isFirstMount = useRef(true);

    // ── Announcer ───────────────────────────────────────────────────────────
    const { polite } = useAnnouncer();
    useAnnounceLoading(isLoading, {
      loadingMessage: 'Searching…',
      loadedMessage: 'Search complete',
    });

    // ── Controlled / Uncontrolled ───────────────────────────────────────────
    const [uncontrolled, setUncontrolled] = useState(defaultValue);
    const value = controlledValue ?? uncontrolled;

    const setValue = useCallback(
      (next: string) => {
        if (controlledValue === undefined) setUncontrolled(next);
        onChange?.(next);
      },
      [controlledValue, onChange]
    );

    // ── Focus visible (for wrapper border ring) ──────────────────────────────
    const { isFocusVisible, focusProps } = useFocusVisible();

    // ── Global style injection ───────────────────────────────────────────────
    useEffect(() => {
      injectGlobalStyles();
    }, []);

    // ── Results count announcement (debounced, skip initial render) ──────────
    useEffect(() => {
      if (resultsCount === undefined) return;

      // Skip the very first mount — don't announce on page load
      if (isFirstMount.current) {
        isFirstMount.current = false;
        prevResultsCount.current = resultsCount;
        return;
      }

      if (prevResultsCount.current === resultsCount) return;
      prevResultsCount.current = resultsCount;

      if (resultsTimerRef.current) clearTimeout(resultsTimerRef.current);
      resultsTimerRef.current = setTimeout(() => {
        const message =
          resultsLabel ??
          (resultsCount === 0
            ? 'No results'
            : resultsCount === 1
              ? '1 result'
              : `${resultsCount} results`);
        polite(message);
      }, 300);

      return () => {
        if (resultsTimerRef.current) clearTimeout(resultsTimerRef.current);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resultsCount]);

    // ── Dev warnings ─────────────────────────────────────────────────────────
    useEffect(() => {
      if (process.env.NODE_ENV !== 'production') {
        if (!label && !ariaLabel && !ariaLabelledBy) {
          warn.warning(
            'SearchField has no accessible label. Provide a label prop, aria-label, or aria-labelledby.'
          );
        }
      }
    }, [label, ariaLabel, ariaLabelledBy]);

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
      },
      [setValue]
    );

    const handleSubmit = useCallback(
      (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit?.(value);
      },
      [onSubmit, value]
    );

    const handleClear = useCallback(() => {
      setValue('');
      onClear?.();
      // Return focus to the input after clearing
      inputRef.current?.focus();
    }, [setValue, onClear]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
          onSubmit?.(value);
        }
      },
      [onSubmit, value]
    );

    // ── Merged ref ───────────────────────────────────────────────────────────
    const mergedRef = useCallback(
      (node: HTMLInputElement | null) => {
        (
          inputRef as React.MutableRefObject<HTMLInputElement | null>
        ).current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref)
          (
            ref as React.MutableRefObject<HTMLInputElement | null>
          ).current = node;
      },
      [ref]
    );

    // ── aria-describedby ─────────────────────────────────────────────────────
    const hasError = Boolean(error);
    const describedBy =
      [hint ? hintId : '', hasError ? errorId : ''].filter(Boolean).join(' ') ||
      undefined;

    // ── Styles ───────────────────────────────────────────────────────────────
    const wrapperStyle: React.CSSProperties = unstyled
      ? {}
      : { display: 'flex', flexDirection: 'column', gap: '0.25rem' };

    const labelStyle: React.CSSProperties = unstyled
      ? {}
      : {
          display: 'block',
          color: disabled
            ? 'var(--compa11y-search-field-disabled-color, #999)'
            : 'var(--compa11y-search-field-label-color, inherit)',
          fontSize: 'var(--compa11y-search-field-label-size, 0.875rem)',
          fontWeight: 'var(--compa11y-search-field-label-weight, 500)' as any,
        };

    const hintStyle: React.CSSProperties = unstyled
      ? {}
      : {
          color: 'var(--compa11y-search-field-hint-color, #666)',
          fontSize: 'var(--compa11y-search-field-hint-size, 0.8125rem)',
        };

    const inputRowStyle: React.CSSProperties = unstyled
      ? {}
      : {
          display: 'flex',
          alignItems: 'center',
          border: hasError
            ? '1px solid var(--compa11y-search-field-border-error, #ef4444)'
            : 'var(--compa11y-search-field-border, 1px solid #ccc)',
          borderRadius: 'var(--compa11y-search-field-radius, 4px)',
          background: disabled
            ? 'var(--compa11y-search-field-disabled-bg, #f5f5f5)'
            : 'var(--compa11y-search-field-bg, white)',
          overflow: 'hidden',
          ...(isFocusVisible
            ? {
                outline: hasError
                  ? '2px solid var(--compa11y-search-field-border-error, #ef4444)'
                  : '2px solid var(--compa11y-focus-color, #0066cc)',
                outlineOffset: '2px',
              }
            : {}),
        };

    const searchIconStyle: React.CSSProperties = unstyled
      ? {}
      : {
          display: 'flex',
          alignItems: 'center',
          paddingLeft: '0.625rem',
          color: 'var(--compa11y-search-field-icon-color, #777)',
          flexShrink: 0,
          pointerEvents: 'none',
        };

    const inputStyle: React.CSSProperties = unstyled
      ? {}
      : {
          flex: 1,
          border: 'none',
          outline: 'none',
          background: 'transparent',
          padding: 'var(--compa11y-search-field-input-padding, 0.5rem 0.5rem 0.5rem 0.375rem)',
          fontSize: 'var(--compa11y-search-field-font-size, 0.875rem)',
          fontFamily: 'inherit',
          color: 'inherit',
          minWidth: 0,
          cursor: disabled ? 'not-allowed' : undefined,
        };

    const spinnerStyle: React.CSSProperties = unstyled
      ? {}
      : {
          display: 'flex',
          alignItems: 'center',
          paddingRight: '0.375rem',
          color: 'var(--compa11y-search-field-spinner-color, #777)',
          flexShrink: 0,
        };

    const clearBtnStyle: React.CSSProperties = unstyled
      ? {}
      : {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'none',
          border: 'none',
          padding: '0.25rem',
          margin: '0 0.125rem',
          cursor: 'pointer',
          color: 'var(--compa11y-search-field-clear-color, #777)',
          borderRadius: 'var(--compa11y-search-field-clear-radius, 2px)',
          minWidth: '1.75rem',
          minHeight: '1.75rem',
          flexShrink: 0,
        };

    const submitBtnStyle: React.CSSProperties = unstyled
      ? {}
      : {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.25rem',
          background: 'var(--compa11y-search-field-btn-bg, #0066cc)',
          color: 'var(--compa11y-search-field-btn-color, white)',
          border: 'none',
          padding: '0.5rem 0.875rem',
          cursor: disabled ? 'not-allowed' : 'pointer',
          fontSize: 'var(--compa11y-search-field-font-size, 0.875rem)',
          fontFamily: 'inherit',
          fontWeight: 500 as any,
          flexShrink: 0,
          alignSelf: 'stretch',
          opacity: disabled ? 0.6 : undefined,
          whiteSpace: 'nowrap',
        };

    const errorStyle: React.CSSProperties = unstyled
      ? {}
      : {
          color: 'var(--compa11y-search-field-error-color, #ef4444)',
          fontSize: 'var(--compa11y-search-field-error-size, 0.8125rem)',
        };

    // ── Render ───────────────────────────────────────────────────────────────
    return (
      <div
        data-compa11y-search-field=""
        data-disabled={disabled ? '' : undefined}
        data-loading={isLoading ? '' : undefined}
        data-error={hasError ? '' : undefined}
        className={className}
        style={{ ...wrapperStyle, ...rootStyle }}
      >
        {/* Visible label */}
        {label && (
          <label
            htmlFor={inputId}
            data-compa11y-search-field-label=""
            style={labelStyle}
          >
            {label}
          </label>
        )}

        {/* Hint */}
        {hint && (
          <div
            id={hintId}
            data-compa11y-search-field-hint=""
            style={hintStyle}
          >
            {hint}
          </div>
        )}

        {/* Search landmark wraps the input row */}
        <form
          role="search"
          onSubmit={handleSubmit}
          data-compa11y-search-field-form=""
          noValidate
        >
          {/* Input row — search icon + input + clear btn + submit btn */}
          <div
            data-compa11y-search-field-wrapper=""
            style={inputRowStyle}
          >
            {/* Decorative search icon */}
            <span
              aria-hidden="true"
              data-compa11y-search-field-icon=""
              style={searchIconStyle}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
                focusable="false"
              >
                <circle
                  cx="6.5"
                  cy="6.5"
                  r="4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M9.5 9.5L13 13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>

            {/* The actual search input */}
            <input
              ref={mergedRef}
              id={inputId}
              type="search"
              value={value}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onFocus={focusProps.onFocus}
              onBlur={focusProps.onBlur}
              disabled={disabled}
              placeholder={placeholder}
              name={name}
              autoFocus={autoFocus}
              maxLength={maxLength}
              autoComplete="off"
              aria-label={!label ? ariaLabel : undefined}
              aria-labelledby={!label ? ariaLabelledBy : undefined}
              aria-describedby={describedBy}
              aria-invalid={hasError ? 'true' : undefined}
              data-compa11y-search-field-input=""
              style={inputStyle}
            />

            {/* Loading spinner (decorative — announcements via useAnnounceLoading) */}
            {isLoading && (
              <span
                aria-hidden="true"
                data-compa11y-search-field-spinner=""
                style={spinnerStyle}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                  focusable="false"
                  style={{
                    animation: 'compa11y-search-spin 0.8s linear infinite',
                  }}
                >
                  <circle
                    cx="8"
                    cy="8"
                    r="6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray="28"
                    strokeDashoffset="10"
                    fill="none"
                    opacity="0.25"
                  />
                  <path
                    d="M8 2a6 6 0 0 1 6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </span>
            )}

            {/* Clear button — visible only when there is text */}
            {value && !disabled && (
              <button
                type="button"
                aria-label={clearLabel}
                onClick={handleClear}
                data-compa11y-search-field-clear=""
                style={clearBtnStyle}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    d="M1 1l10 10M11 1L1 11"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            )}

            {/* Optional Search submit button */}
            {showSearchButton && (
              <button
                type="submit"
                disabled={disabled}
                data-compa11y-search-field-submit=""
                style={submitBtnStyle}
              >
                {searchButtonLabel}
              </button>
            )}
          </div>
        </form>

        {/* Error message */}
        {hasError && (
          <div
            id={errorId}
            role="alert"
            data-compa11y-search-field-error=""
            style={errorStyle}
          >
            {error}
          </div>
        )}
      </div>
    );
  }
);

SearchField.displayName = 'SearchField';
