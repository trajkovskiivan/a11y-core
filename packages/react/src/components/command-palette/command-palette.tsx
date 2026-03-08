import React, {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { useId } from '../../hooks/use-id';
import { useKeyboard } from '../../hooks/use-keyboard';
import { useFocusTrap } from '../../hooks/use-focus-trap';
import { useAnnouncer, useAnnounceLoading } from '../../hooks/use-announcer';
import { useFocusVisible } from '../../hooks/use-focus-visible';
import { createComponentWarnings } from '@compa11y/core';
import {
  CommandPaletteProvider,
  useCommandPaletteContext,
  type CommandPaletteContextValue,
  type RegisteredItem,
} from './command-palette-context';

const warnings = createComponentWarnings('CommandPalette');

// Body scroll lock stacking
let bodyLockCount = 0;
let savedOverflow = '';

function lockBodyScroll(): void {
  if (bodyLockCount === 0) {
    savedOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  bodyLockCount++;
}

function unlockBodyScroll(): void {
  bodyLockCount--;
  if (bodyLockCount <= 0) {
    bodyLockCount = 0;
    document.body.style.overflow = savedOverflow;
  }
}

// Default filter: case-insensitive substring on value + keywords
function defaultFilter(query: string, value: string, keywords?: string[]): boolean {
  const q = query.toLowerCase();
  if (value.toLowerCase().includes(q)) return true;
  if (keywords?.some((kw) => kw.toLowerCase().includes(q))) return true;
  return false;
}

// ============================================================================
// Root
// ============================================================================

export interface CommandPaletteProps {
  /** Whether the palette is open (controlled) */
  open?: boolean;
  /** Default open state (uncontrolled) */
  defaultOpen?: boolean;
  /** Called when the palette open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Whether to render as a modal dialog (default: true) */
  modal?: boolean;
  /** Whether keyboard navigation wraps around */
  loop?: boolean;
  /** Custom filter function — return true to include an item */
  filter?: (query: string, value: string, keywords?: string[]) => boolean;
  /** Global onSelect callback — called for any item selection */
  onSelect?: (value: string) => void;
  /** Loading state for async search */
  loading?: boolean;
  /** Portal container (defaults to document.body) */
  container?: HTMLElement;
  /** Accessible label (required if no CommandPalette.Title) */
  'aria-label'?: string;
  /** Remove default styles */
  unstyled?: boolean;
  children: React.ReactNode;
}

export function CommandPalette({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  modal = true,
  loop = true,
  filter: filterFn,
  onSelect: globalOnSelect,
  loading: controlledLoading = false,
  container,
  'aria-label': ariaLabel,
  unstyled = false,
  children,
}: CommandPaletteProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isOpen = controlledOpen ?? uncontrolledOpen;

  const [query, setQuery] = useState('');
  const [highlightedValue, setHighlightedValue] = useState<string | null>(null);
  const [hasTitle, setHasTitle] = useState(false);
  const [hasDescription, setHasDescription] = useState(false);

  // Item registry: insertion-order Map preserves DOM rendering order
  const itemsRef = useRef<Map<string, RegisteredItem>>(new Map());
  const [visibleItems, setVisibleItems] = useState<string[]>([]);

  // IDs
  const dialogId = useId('command-palette');
  const titleId = useId('command-palette-title');
  const descriptionId = useId('command-palette-desc');
  const inputId = useId('command-palette-input');
  const listboxId = useId('command-palette-listbox');
  const baseOptionId = useId('command-palette-opt');

  const getOptionId = useCallback(
    (value: string) => `${baseOptionId}-${value.replace(/\s+/g, '-').toLowerCase()}`,
    [baseOptionId]
  );

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (controlledOpen === undefined) setUncontrolledOpen(nextOpen);
      onOpenChange?.(nextOpen);
      if (!nextOpen) {
        setQuery('');
        setHighlightedValue(null);
      }
    },
    [controlledOpen, onOpenChange]
  );

  const openPalette = useCallback(() => handleOpenChange(true), [handleOpenChange]);
  const closePalette = useCallback(() => handleOpenChange(false), [handleOpenChange]);

  // Rebuild visible items list from registry
  const rebuildVisibleItems = useCallback(() => {
    const items: string[] = [];
    for (const [, item] of itemsRef.current) {
      if (!item.disabled) {
        items.push(item.value);
      }
    }
    setVisibleItems(items);
  }, []);

  const registerItem = useCallback(
    (item: RegisteredItem) => {
      itemsRef.current.set(item.value, item);
      rebuildVisibleItems();
    },
    [rebuildVisibleItems]
  );

  const unregisterItem = useCallback(
    (value: string) => {
      itemsRef.current.delete(value);
      rebuildVisibleItems();
    },
    [rebuildVisibleItems]
  );

  const getItem = useCallback(
    (value: string) => itemsRef.current.get(value),
    []
  );

  const executeItem = useCallback(
    (value: string) => {
      const item = itemsRef.current.get(value);
      if (!item || item.disabled) return;

      item.onSelect?.();
      globalOnSelect?.(value);

      if (item.href) {
        window.location.href = item.href;
      }

      closePalette();
    },
    [globalOnSelect, closePalette]
  );

  // Navigation helpers
  const highlightNext = useCallback(() => {
    if (visibleItems.length === 0) return;
    const currentIdx = highlightedValue
      ? visibleItems.indexOf(highlightedValue)
      : -1;
    const nextIdx = loop
      ? (currentIdx + 1) % visibleItems.length
      : Math.min(currentIdx + 1, visibleItems.length - 1);
    setHighlightedValue(visibleItems[nextIdx] ?? null);
  }, [visibleItems, highlightedValue, loop]);

  const highlightPrev = useCallback(() => {
    if (visibleItems.length === 0) return;
    const currentIdx = highlightedValue
      ? visibleItems.indexOf(highlightedValue)
      : visibleItems.length;
    const prevIdx = loop
      ? (currentIdx - 1 + visibleItems.length) % visibleItems.length
      : Math.max(currentIdx - 1, 0);
    setHighlightedValue(visibleItems[prevIdx] ?? null);
  }, [visibleItems, highlightedValue, loop]);

  const highlightFirst = useCallback(() => {
    if (visibleItems.length > 0) setHighlightedValue(visibleItems[0] ?? null);
  }, [visibleItems]);

  const highlightLast = useCallback(() => {
    if (visibleItems.length > 0)
      setHighlightedValue(visibleItems[visibleItems.length - 1] ?? null);
  }, [visibleItems]);

  // Reset highlight when visible items change
  useEffect(() => {
    if (visibleItems.length > 0) {
      if (!highlightedValue || !visibleItems.includes(highlightedValue)) {
        setHighlightedValue(visibleItems[0] ?? null);
      }
    } else {
      setHighlightedValue(null);
    }
  }, [visibleItems, highlightedValue]);

  // Dev warnings
  useEffect(() => {
    if (!isOpen || process.env.NODE_ENV === 'production') return;

    const frameId = requestAnimationFrame(() => {
      if (!hasTitle && !ariaLabel) {
        warnings.warning(
          'CommandPalette has no accessible title. Add a <CommandPalette.Title> or aria-label prop.',
          'Use <CommandPalette.Title> or provide aria-label="..."'
        );
      }
    });

    return () => cancelAnimationFrame(frameId);
  }, [isOpen, hasTitle, ariaLabel]);

  // Global keyboard shortcut (Ctrl/Cmd+K)
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        handleOpenChange(!isOpen);
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isOpen, handleOpenChange]);

  const contextValue: CommandPaletteContextValue = {
    isOpen,
    close: closePalette,
    open: openPalette,
    modal,
    query,
    setQuery,
    highlightedValue,
    setHighlightedValue,
    loading: controlledLoading,
    loop,
    dialogId,
    titleId,
    descriptionId,
    inputId,
    listboxId,
    hasTitle,
    hasDescription,
    setHasTitle,
    setHasDescription,
    getOptionId,
    visibleItems,
    registerItem,
    unregisterItem,
    getItem,
    executeItem,
    highlightNext,
    highlightPrev,
    highlightFirst,
    highlightLast,
    filter: filterFn ?? null,
  };

  if (!isOpen) return null;

  const content = (
    <CommandPaletteProvider value={contextValue}>
      {modal ? (
        <CommandPaletteModal ariaLabel={ariaLabel} unstyled={unstyled}>
          {children}
        </CommandPaletteModal>
      ) : (
        <div data-compa11y-command-palette>{children}</div>
      )}
    </CommandPaletteProvider>
  );

  if (modal) {
    const portalContainer = container ?? document.body;
    return createPortal(content, portalContainer);
  }

  return content;
}

// ============================================================================
// Modal shell (internal)
// ============================================================================

interface CommandPaletteModalProps {
  children: React.ReactNode;
  ariaLabel?: string;
  unstyled: boolean;
}

function CommandPaletteModal({
  children,
  ariaLabel,
  unstyled,
}: CommandPaletteModalProps) {
  const ctx = useCommandPaletteContext('CommandPaletteModal');
  const { announce } = useAnnouncer();

  const trapRef = useFocusTrap<HTMLDivElement>({
    active: true,
    escapeDeactivates: true,
    clickOutsideDeactivates: false,
    onDeactivate: ctx.close,
  });

  useEffect(() => {
    announce('Command palette opened', { politeness: 'polite' });
    return () => {
      announce('Command palette closed', { politeness: 'polite' });
    };
  }, [announce]);

  useEffect(() => {
    lockBodyScroll();
    return () => unlockBodyScroll();
  }, []);

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      ctx.close();
    }
  };

  const handleDialogClick = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  const labelledBy = ctx.hasTitle ? ctx.titleId : undefined;
  const describedBy = ctx.hasDescription ? ctx.descriptionId : undefined;

  const overlayStyles: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingTop: '15vh',
    zIndex: 9999,
    ...(unstyled ? {} : { backgroundColor: 'rgba(0, 0, 0, 0.5)' }),
  };

  const dialogStyles: React.CSSProperties = unstyled
    ? {}
    : {
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '640px',
        maxHeight: '70vh',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column' as const,
      };

  return (
    <div
      style={overlayStyles}
      onClick={handleOverlayClick}
      data-compa11y-command-palette-overlay
    >
      <div
        ref={trapRef}
        id={ctx.dialogId}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabel ? undefined : labelledBy}
        aria-describedby={describedBy}
        onClick={handleDialogClick}
        style={dialogStyles}
        data-compa11y-command-palette
      >
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// Trigger
// ============================================================================

export interface CommandPaletteTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const CommandPaletteTrigger = forwardRef<
  HTMLButtonElement,
  CommandPaletteTriggerProps
>(function CommandPaletteTrigger({ children, onClick, ...props }, ref) {
  const ctx = useCommandPaletteContext('CommandPalette.Trigger');

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented) {
      ctx.open();
    }
  };

  return (
    <button
      ref={ref}
      type="button"
      tabIndex={0}
      onClick={handleClick}
      data-compa11y-command-palette-trigger
      {...props}
    >
      {children}
    </button>
  );
});

// ============================================================================
// Content
// ============================================================================

export interface CommandPaletteContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CommandPaletteContent = forwardRef<
  HTMLDivElement,
  CommandPaletteContentProps
>(function CommandPaletteContent({ children, ...props }, ref) {
  return (
    <div ref={ref} data-compa11y-command-palette-content {...props}>
      {children}
    </div>
  );
});

// ============================================================================
// Title
// ============================================================================

export interface CommandPaletteTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  children: React.ReactNode;
}

export const CommandPaletteTitle = forwardRef<
  HTMLHeadingElement,
  CommandPaletteTitleProps
>(function CommandPaletteTitle(
  { as: Component = 'h2', children, ...props },
  ref
) {
  const { titleId, setHasTitle } = useCommandPaletteContext(
    'CommandPalette.Title'
  );

  useEffect(() => {
    setHasTitle(true);
    return () => setHasTitle(false);
  }, [setHasTitle]);

  return (
    <Component
      ref={ref}
      id={titleId}
      data-compa11y-command-palette-title
      {...props}
    >
      {children}
    </Component>
  );
});

// ============================================================================
// Description
// ============================================================================

export interface CommandPaletteDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export const CommandPaletteDescription = forwardRef<
  HTMLParagraphElement,
  CommandPaletteDescriptionProps
>(function CommandPaletteDescription({ children, ...props }, ref) {
  const { descriptionId, setHasDescription } = useCommandPaletteContext(
    'CommandPalette.Description'
  );

  useEffect(() => {
    setHasDescription(true);
    return () => setHasDescription(false);
  }, [setHasDescription]);

  return (
    <p
      ref={ref}
      id={descriptionId}
      data-compa11y-command-palette-description
      {...props}
    >
      {children}
    </p>
  );
});

// ============================================================================
// Input (borrows search icon, clear button, spinner from SearchField pattern)
// ============================================================================

export interface CommandPaletteInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'value' | 'onChange'
  > {
  /** Accessible label for the clear button */
  clearLabel?: string;
  /** Remove built-in input wrapper styles */
  unstyled?: boolean;
}

export const CommandPaletteInput = forwardRef<
  HTMLInputElement,
  CommandPaletteInputProps
>(function CommandPaletteInput(
  { onKeyDown, clearLabel = 'Clear search', unstyled = false, ...props },
  forwardedRef
) {
  const ctx = useCommandPaletteContext('CommandPalette.Input');
  const { announce } = useAnnouncer();
  const { isFocusVisible, focusProps } = useFocusVisible();
  const internalRef = useRef<HTMLInputElement>(null);
  const prevCountRef = useRef(-1);

  useAnnounceLoading(ctx.loading, {
    loadingMessage: 'Searching\u2026',
    loadedMessage: 'Search complete',
  });

  // Dev warning: input needs accessible label
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    if (
      !props['aria-label'] &&
      !props['aria-labelledby'] &&
      !props.placeholder
    ) {
      warnings.warning(
        'CommandPalette.Input has no accessible label.',
        'Add aria-label, aria-labelledby, or placeholder prop.'
      );
    }
  }, [props]);

  const keyboardProps = useKeyboard(
    {
      ArrowDown: () => ctx.highlightNext(),
      ArrowUp: () => ctx.highlightPrev(),
      Enter: () => {
        if (ctx.highlightedValue) ctx.executeItem(ctx.highlightedValue);
      },
      Home: () => ctx.highlightFirst(),
      End: () => ctx.highlightLast(),
      Escape: () => ctx.close(),
    },
    { preventDefault: true, stopPropagation: false }
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (!event.defaultPrevented) {
      keyboardProps.onKeyDown(event);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    ctx.setQuery(event.target.value);
  };

  const handleClear = () => {
    ctx.setQuery('');
    internalRef.current?.focus();
  };

  // Announce result count changes (debounced)
  useEffect(() => {
    const count = ctx.visibleItems.length;
    if (prevCountRef.current === count) return;
    prevCountRef.current = count;

    if (ctx.query.length === 0) return;

    const timer = setTimeout(() => {
      if (count === 0) {
        announce('No results', { politeness: 'polite' });
      } else {
        announce(`${count} result${count === 1 ? '' : 's'} available`, {
          politeness: 'polite',
        });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [ctx.visibleItems.length, ctx.query, announce]);

  const activeDescendant = ctx.highlightedValue
    ? ctx.getOptionId(ctx.highlightedValue)
    : undefined;

  const mergedRef = useCallback(
    (node: HTMLInputElement | null) => {
      (internalRef as React.MutableRefObject<HTMLInputElement | null>).current =
        node;
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef)
        (
          forwardedRef as React.MutableRefObject<HTMLInputElement | null>
        ).current = node;
    },
    [forwardedRef]
  );

  // Styles borrowed from SearchField pattern
  const wrapperStyle: React.CSSProperties = unstyled
    ? {}
    : {
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        borderBottom: '1px solid var(--compa11y-command-palette-border-color, #e5e5e5)',
        ...(isFocusVisible
          ? {
              outline:
                '2px solid var(--compa11y-focus-color, #0066cc)',
              outlineOffset: '-2px',
            }
          : {}),
      };

  const iconStyle: React.CSSProperties = unstyled
    ? {}
    : {
        display: 'flex',
        alignItems: 'center',
        color: 'var(--compa11y-command-palette-icon-color, #999)',
        flexShrink: 0,
        marginRight: '8px',
        pointerEvents: 'none' as const,
      };

  const inputStyle: React.CSSProperties = unstyled
    ? {}
    : {
        flex: 1,
        border: 'none',
        outline: 'none',
        background: 'transparent',
        fontSize: 'var(--compa11y-command-palette-input-font-size, 16px)',
        fontFamily: 'inherit',
        color: 'inherit',
        minWidth: 0,
      };

  const spinnerStyle: React.CSSProperties = unstyled
    ? {}
    : {
        display: 'flex',
        alignItems: 'center',
        marginLeft: '8px',
        color: 'var(--compa11y-command-palette-spinner-color, #999)',
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
        padding: '4px',
        marginLeft: '4px',
        cursor: 'pointer',
        color: 'var(--compa11y-command-palette-clear-color, #999)',
        borderRadius: '2px',
        minWidth: '28px',
        minHeight: '28px',
        flexShrink: 0,
      };

  return (
    <div
      data-compa11y-command-palette-input-wrapper
      style={wrapperStyle}
    >
      {/* Search icon (decorative) */}
      <span aria-hidden="true" data-compa11y-command-palette-icon style={iconStyle}>
        <svg
          width="18"
          height="18"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          focusable="false"
        >
          <circle cx="6.5" cy="6.5" r="4" stroke="currentColor" strokeWidth="1.5" />
          <path d="M9.5 9.5L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </span>

      <input
        ref={mergedRef}
        id={ctx.inputId}
        type="text"
        role="combobox"
        value={ctx.query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={focusProps.onFocus}
        onBlur={focusProps.onBlur}
        aria-expanded={true}
        aria-controls={ctx.listboxId}
        aria-activedescendant={activeDescendant}
        aria-autocomplete="list"
        aria-haspopup="listbox"
        autoComplete="off"
        autoFocus
        data-compa11y-command-palette-input
        style={inputStyle}
        {...props}
      />

      {/* Loading spinner (decorative — announcements via useAnnounceLoading) */}
      {ctx.loading && (
        <span
          aria-hidden="true"
          data-compa11y-command-palette-spinner
          style={spinnerStyle}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
            focusable="false"
            style={{ animation: 'compa11y-search-spin 0.8s linear infinite' }}
          >
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeDasharray="28" strokeDashoffset="10" fill="none" opacity="0.25" />
            <path d="M8 2a6 6 0 0 1 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
          </svg>
        </span>
      )}

      {/* Clear button — visible only when there is text */}
      {ctx.query && (
        <button
          type="button"
          aria-label={clearLabel}
          onClick={handleClear}
          tabIndex={-1}
          data-compa11y-command-palette-clear
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
            <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
});

// ============================================================================
// List
// ============================================================================

export interface CommandPaletteListProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CommandPaletteList = forwardRef<
  HTMLDivElement,
  CommandPaletteListProps
>(function CommandPaletteList({ children, style, ...props }, ref) {
  const ctx = useCommandPaletteContext('CommandPalette.List');

  const listStyles: React.CSSProperties = {
    overflowY: 'auto',
    maxHeight: '50vh',
    ...style,
  };

  return (
    <div
      ref={ref}
      id={ctx.listboxId}
      role="listbox"
      aria-label={props['aria-label'] ?? 'Command results'}
      aria-busy={ctx.loading || undefined}
      style={listStyles}
      data-compa11y-command-palette-list
      {...props}
    >
      {children}
    </div>
  );
});

// ============================================================================
// Empty
// ============================================================================

export interface CommandPaletteEmptyProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CommandPaletteEmpty = forwardRef<
  HTMLDivElement,
  CommandPaletteEmptyProps
>(function CommandPaletteEmpty({ children, ...props }, ref) {
  const ctx = useCommandPaletteContext('CommandPalette.Empty');

  if (ctx.visibleItems.length > 0 || ctx.query.length === 0 || ctx.loading) {
    return null;
  }

  return (
    <div
      ref={ref}
      role="presentation"
      data-compa11y-command-palette-empty
      {...props}
    >
      {children}
    </div>
  );
});

// ============================================================================
// Loading
// ============================================================================

export interface CommandPaletteLoadingProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CommandPaletteLoading = forwardRef<
  HTMLDivElement,
  CommandPaletteLoadingProps
>(function CommandPaletteLoading({ children, ...props }, ref) {
  const ctx = useCommandPaletteContext('CommandPalette.Loading');

  if (!ctx.loading) return null;

  return (
    <div
      ref={ref}
      role="presentation"
      aria-live="polite"
      data-compa11y-command-palette-loading
      {...props}
    >
      {children}
    </div>
  );
});

// ============================================================================
// Group
// ============================================================================

export interface CommandPaletteGroupProps
  extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  children: React.ReactNode;
}

export const CommandPaletteGroup = forwardRef<
  HTMLDivElement,
  CommandPaletteGroupProps
>(function CommandPaletteGroup({ label, children, ...props }, ref) {
  const headingId = useId('command-palette-group');

  return (
    <div
      ref={ref}
      role="group"
      aria-labelledby={headingId}
      data-compa11y-command-palette-group
      {...props}
    >
      <div
        id={headingId}
        role="presentation"
        aria-hidden="true"
        data-compa11y-command-palette-group-label
      >
        {label}
      </div>
      {children}
    </div>
  );
});

// ============================================================================
// Separator
// ============================================================================

export interface CommandPaletteSeparatorProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const CommandPaletteSeparator = forwardRef<
  HTMLDivElement,
  CommandPaletteSeparatorProps
>(function CommandPaletteSeparator(props, ref) {
  return (
    <div
      ref={ref}
      role="separator"
      data-compa11y-command-palette-separator
      {...props}
    />
  );
});

// ============================================================================
// Item
// ============================================================================

export interface CommandPaletteItemProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  /** The searchable value (also announced by screen readers) */
  value: string;
  /** Additional search keywords */
  keywords?: string[];
  /** Callback when this item is selected */
  onSelect?: () => void;
  /** Navigate to this URL on selection */
  href?: string;
  /** Keyboard shortcut hint (display only) */
  shortcut?: string;
  /** Whether this item is disabled */
  disabled?: boolean;
  children?: React.ReactNode;
}

export const CommandPaletteItem = forwardRef<
  HTMLDivElement,
  CommandPaletteItemProps
>(function CommandPaletteItem(
  {
    value,
    keywords,
    onSelect,
    href,
    shortcut,
    disabled = false,
    children,
    onClick,
    onMouseEnter,
    ...props
  },
  forwardedRef
) {
  const ctx = useCommandPaletteContext('CommandPalette.Item');
  const internalRef = useRef<HTMLDivElement | null>(null);

  // Dev warning: missing value
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    if (!value) {
      warnings.error('CommandPalette.Item requires a "value" prop.');
    }
  }, [value]);

  // Determine visibility
  const isVisible = (() => {
    if (ctx.query.length === 0) return true;
    const filterFn = ctx.filter ?? defaultFilter;
    return filterFn(ctx.query, value, keywords);
  })();

  // Register/unregister with context based on visibility
  useEffect(() => {
    if (isVisible) {
      ctx.registerItem({ value, onSelect, href, disabled, keywords });
    } else {
      ctx.unregisterItem(value);
    }

    return () => {
      ctx.unregisterItem(value);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, isVisible, disabled, onSelect, href]);

  const isHighlighted = ctx.highlightedValue === value;

  // Scroll highlighted item into view
  useEffect(() => {
    if (isHighlighted && internalRef.current) {
      internalRef.current.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [isHighlighted]);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || disabled) return;
    ctx.executeItem(value);
  };

  const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
    onMouseEnter?.(event);
    if (!disabled) {
      ctx.setHighlightedValue(value);
    }
  };

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      internalRef.current = node;
      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        (
          forwardedRef as React.MutableRefObject<HTMLDivElement | null>
        ).current = node;
      }
    },
    [forwardedRef]
  );

  if (!isVisible) return null;

  const optionId = ctx.getOptionId(value);

  return (
    <div
      ref={setRefs}
      id={optionId}
      role="option"
      aria-selected={isHighlighted}
      aria-disabled={disabled || undefined}
      data-highlighted={isHighlighted || undefined}
      data-disabled={disabled || undefined}
      data-value={value}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      data-compa11y-command-palette-item
      {...props}
    >
      {children ?? value}
      {shortcut && (
        <kbd aria-hidden="true" data-compa11y-command-palette-shortcut>
          {shortcut}
        </kbd>
      )}
    </div>
  );
});

// ============================================================================
// Footer
// ============================================================================

export interface CommandPaletteFooterProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const CommandPaletteFooter = forwardRef<
  HTMLDivElement,
  CommandPaletteFooterProps
>(function CommandPaletteFooter({ children, ...props }, ref) {
  return (
    <div ref={ref} data-compa11y-command-palette-footer {...props}>
      {children}
    </div>
  );
});

// ============================================================================
// Compound export
// ============================================================================

export const CommandPaletteCompound = Object.assign(CommandPalette, {
  Trigger: CommandPaletteTrigger,
  Content: CommandPaletteContent,
  Title: CommandPaletteTitle,
  Description: CommandPaletteDescription,
  Input: CommandPaletteInput,
  List: CommandPaletteList,
  Empty: CommandPaletteEmpty,
  Loading: CommandPaletteLoading,
  Group: CommandPaletteGroup,
  Separator: CommandPaletteSeparator,
  Item: CommandPaletteItem,
  Footer: CommandPaletteFooter,
});
