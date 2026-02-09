import React, {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useId } from '../../hooks/use-id';
import { useKeyboard } from '../../hooks/use-keyboard';
import {
  ActionMenuProvider,
  useActionMenuContext,
  type ActionMenuContextValue,
} from './menu-context';

// ============================================================================
// ActionMenu Root
// ============================================================================

export interface ActionMenuProps {
  /** Whether the menu is initially open */
  defaultOpen?: boolean;
  /** Controlled open state */
  open?: boolean;
  /** Called when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Menu content */
  children: React.ReactNode;
  /** Remove default styles to allow full customization via className */
  unstyled?: boolean;
}

export function ActionMenu({
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  children,
  unstyled = false,
}: ActionMenuProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isOpen = controlledOpen ?? uncontrolledOpen;

  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const itemsRef = useRef<string[]>([]);
  const onSelectRef = useRef<((index: number) => void) | null>(null);

  const menuId = useId('action-menu');
  const triggerId = useId('action-menu-trigger');

  const setOpen = useCallback(
    (value: boolean) => {
      if (controlledOpen === undefined) {
        setUncontrolledOpen(value);
      }
      onOpenChange?.(value);

      if (!value) {
        setHighlightedIndex(-1);
      }
    },
    [controlledOpen, onOpenChange]
  );

  const open = useCallback(() => setOpen(true), [setOpen]);
  const close = useCallback(() => setOpen(false), [setOpen]);
  const toggle = useCallback(() => setOpen(!isOpen), [setOpen, isOpen]);

  const registerItem = useCallback((id: string) => {
    const index = itemsRef.current.length;
    itemsRef.current.push(id);
    return index;
  }, []);

  const unregisterItem = useCallback((id: string) => {
    const index = itemsRef.current.indexOf(id);
    if (index > -1) {
      itemsRef.current.splice(index, 1);
    }
  }, []);

  const getItemCount = useCallback(() => itemsRef.current.length, []);

  const selectItem = useCallback(
    (index: number) => {
      onSelectRef.current?.(index);
      close();
    },
    [close]
  );

  const contextValue: ActionMenuContextValue = {
    isOpen,
    open,
    close,
    toggle,
    highlightedIndex,
    setHighlightedIndex,
    menuId,
    triggerId,
    registerItem,
    unregisterItem,
    getItemCount,
    selectItem,
    unstyled,
  };

  return (
    <ActionMenuProvider value={contextValue}>
      <div
        style={{ position: 'relative', display: 'inline-block' }}
        data-a11y-core-action-menu
      >
        {children}
      </div>
    </ActionMenuProvider>
  );
}

export interface ActionMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const ActionMenuTrigger = forwardRef<
  HTMLButtonElement,
  ActionMenuTriggerProps
>(function ActionMenuTrigger({ children, onClick, onKeyDown, ...props }, ref) {
  const {
    isOpen,
    toggle,
    open,
    close,
    triggerId,
    menuId,
    setHighlightedIndex,
    getItemCount,
  } = useActionMenuContext();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented) {
      toggle();
    }
  };

  const keyboardProps = useKeyboard(
    {
      ArrowDown: () => {
        if (!isOpen) {
          open();
        }
        setHighlightedIndex(0);
      },
      ArrowUp: () => {
        if (!isOpen) {
          open();
        }
        setHighlightedIndex(getItemCount() - 1);
      },
      Enter: () => toggle(),
      Space: () => toggle(),
      Escape: () => close(),
    },
    { preventDefault: true }
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event);
    if (!event.defaultPrevented) {
      keyboardProps.onKeyDown(event);
    }
  };

  return (
    <button
      ref={ref}
      id={triggerId}
      type="button"
      // Safari fix: Ensure button is in tab order (Safari skips buttons by default)
      tabIndex={0}
      aria-haspopup="menu"
      aria-expanded={isOpen}
      aria-controls={isOpen ? menuId : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      data-a11y-core-action-menu-trigger
      {...props}
    >
      {children}
    </button>
  );
});

export interface ActionMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const ActionMenuContent = forwardRef<
  HTMLDivElement,
  ActionMenuContentProps
>(function ActionMenuContent({ children, onKeyDown, style, ...props }, ref) {
  const {
    isOpen,
    close,
    menuId,
    triggerId,
    highlightedIndex,
    setHighlightedIndex,
    getItemCount,
    unstyled,
  } = useActionMenuContext();
  const menuRef = useRef<HTMLDivElement>(null);

  const clickHighlightedItem = () => {
    if (highlightedIndex >= 0 && menuRef.current) {
      const items = menuRef.current.querySelectorAll('[role="menuitem"]');
      const item = items[highlightedIndex] as HTMLElement;
      if (item && item.getAttribute('aria-disabled') !== 'true') {
        item.click();
      }
    }
  };

  const keyboardProps = useKeyboard(
    {
      ArrowDown: () => {
        const count = getItemCount();
        setHighlightedIndex((highlightedIndex + 1) % count);
      },
      ArrowUp: () => {
        const count = getItemCount();
        setHighlightedIndex((highlightedIndex - 1 + count) % count);
      },
      Home: () => setHighlightedIndex(0),
      End: () => setHighlightedIndex(getItemCount() - 1),
      Enter: () => clickHighlightedItem(),
      Space: () => clickHighlightedItem(),
      Escape: () => close(),
      Tab: () => {
        close();
        return false; // Allow default tab behavior
      },
    },
    { preventDefault: true }
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (!event.defaultPrevented) {
      keyboardProps.onKeyDown(event);
    }
  };

  useEffect(() => {
    if (isOpen && menuRef.current) {
      menuRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node;
      const menu = menuRef.current;
      const trigger = document.getElementById(triggerId);

      if (
        menu &&
        !menu.contains(target) &&
        trigger &&
        !trigger.contains(target)
      ) {
        close();
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen, close, triggerId]);

  if (!isOpen) {
    return null;
  }

  // Structural styles - always applied, required for dropdown positioning
  const contentStructuralStyles: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    left: 0,
    marginTop: '4px',
    zIndex: 1000,
  };

  // Visual styles - only applied when not unstyled
  const contentVisualStyles: React.CSSProperties = unstyled
    ? {}
    : {
        minWidth: '160px',
        backgroundColor: 'white',
        border: '1px solid #e0e0e0',
        borderRadius: '4px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        padding: '4px 0',
      };

  const contentStyles: React.CSSProperties = {
    ...contentStructuralStyles,
    ...contentVisualStyles,
  };

  return (
    <div
      ref={(node) => {
        (menuRef as React.MutableRefObject<HTMLDivElement | null>).current =
          node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }}
      id={menuId}
      role="menu"
      aria-labelledby={triggerId}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      style={{ ...contentStyles, ...style }}
      data-a11y-core-action-menu-content
      {...props}
    >
      {children}
    </div>
  );
});

export interface ActionMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether the item is disabled */
  disabled?: boolean;
  /** Called when item is selected */
  onSelect?: () => void;
  children: React.ReactNode;
}

export const ActionMenuItem = forwardRef<HTMLDivElement, ActionMenuItemProps>(
  function ActionMenuItem(
    {
      children,
      disabled = false,
      onSelect,
      onClick,
      onMouseEnter,
      style,
      ...props
    },
    ref
  ) {
    const {
      registerItem,
      unregisterItem,
      highlightedIndex,
      setHighlightedIndex,
      close,
      unstyled,
    } = useActionMenuContext();
    const itemId = useId('action-menu-item');
    const indexRef = useRef(-1);

    useEffect(() => {
      if (!disabled) {
        indexRef.current = registerItem(itemId);
      }
      return () => {
        if (!disabled) {
          unregisterItem(itemId);
        }
      };
    }, [itemId, disabled, registerItem, unregisterItem]);

    const isHighlighted = indexRef.current === highlightedIndex;

    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented && !disabled) {
        onSelect?.();
        close();
      }
    };

    const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
      onMouseEnter?.(event);
      if (!disabled) {
        setHighlightedIndex(indexRef.current);
      }
    };

    // Behavioral styles - always applied for correct UX
    const itemBehaviorStyles: React.CSSProperties = {
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
    };

    // Visual styles - only applied when not unstyled
    const itemVisualStyles: React.CSSProperties = unstyled
      ? {}
      : {
          padding: '8px 16px',
          backgroundColor: isHighlighted ? '#f0f0f0' : 'transparent',
        };

    const itemStyles: React.CSSProperties = {
      ...itemBehaviorStyles,
      ...itemVisualStyles,
    };

    return (
      <div
        ref={ref}
        id={itemId}
        role="menuitem"
        tabIndex={-1}
        aria-disabled={disabled}
        data-highlighted={isHighlighted}
        data-disabled={disabled}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        style={{ ...itemStyles, ...style }}
        data-a11y-core-action-menu-item
        {...props}
      >
        {children}
      </div>
    );
  }
);

export interface ActionMenuSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ActionMenuSeparator = forwardRef<
  HTMLDivElement,
  ActionMenuSeparatorProps
>(function ActionMenuSeparator(props, ref) {
  return (
    <div
      ref={ref}
      role="separator"
      data-a11y-core-action-menu-separator
      {...props}
    />
  );
});

export interface ActionMenuLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const ActionMenuLabel = forwardRef<HTMLDivElement, ActionMenuLabelProps>(
  function ActionMenuLabel({ children, ...props }, ref) {
    return (
      <div
        ref={ref}
        role="presentation"
        data-a11y-core-action-menu-label
        {...props}
      >
        {children}
      </div>
    );
  }
);

export const ActionMenuCompound = Object.assign(ActionMenu, {
  Trigger: ActionMenuTrigger,
  Content: ActionMenuContent,
  Item: ActionMenuItem,
  Separator: ActionMenuSeparator,
  Label: ActionMenuLabel,
});
