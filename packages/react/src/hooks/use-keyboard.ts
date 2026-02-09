import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  KeyboardPatterns,
  createTypeAhead,
  normalizeKey,
  getKeyCombo,
  type KeyboardHandlers,
} from '@a11y-core/core';

/**
 * Hook for keyboard event handling
 *
 * @example
 * ```tsx
 * function Menu({ items, onSelect }) {
 *   const keyboardProps = useKeyboard({
 *     ArrowDown: () => focusNext(),
 *     ArrowUp: () => focusPrevious(),
 *     Enter: () => onSelect(focused),
 *     Escape: () => close(),
 *   });
 *
 *   return <ul {...keyboardProps}>...</ul>;
 * }
 * ```
 */
export function useKeyboard(
  handlers: KeyboardHandlers,
  options: {
    preventDefault?: boolean;
    stopPropagation?: boolean;
    disabled?: boolean;
  } = {}
) {
  const { preventDefault = true, stopPropagation = true, disabled = false } = options;

  // Memoize handlers to prevent unnecessary re-renders
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (disabled) return;

      // Try key combo first
      const combo = getKeyCombo(event.nativeEvent);
      let handler = handlersRef.current[combo];

      // Fall back to simple key
      if (!handler) {
        const key = normalizeKey(event.nativeEvent);
        handler = handlersRef.current[key];
      }

      if (handler) {
        const result = handler(event.nativeEvent);
        if (result !== false) {
          if (preventDefault) {
            event.preventDefault();
          }
          if (stopPropagation) {
            event.stopPropagation();
          }
        }
      }
    },
    [disabled, preventDefault, stopPropagation]
  );

  return {
    onKeyDown: handleKeyDown,
  };
}

/**
 * Pre-built keyboard patterns for common widgets
 */
export function useMenuKeyboard(options: {
  onUp?: () => void;
  onDown?: () => void;
  onEnter?: () => void;
  onEscape?: () => void;
  onHome?: () => void;
  onEnd?: () => void;
  disabled?: boolean;
}) {
  const { disabled, ...handlers } = options;
  return useKeyboard(KeyboardPatterns.menu(handlers), { disabled });
}

export function useTabsKeyboard(options: {
  onLeft?: () => void;
  onRight?: () => void;
  onHome?: () => void;
  onEnd?: () => void;
  disabled?: boolean;
}) {
  const { disabled, ...handlers } = options;
  return useKeyboard(KeyboardPatterns.tabs(handlers), { disabled });
}

export function useGridKeyboard(options: {
  onUp?: () => void;
  onDown?: () => void;
  onLeft?: () => void;
  onRight?: () => void;
  onHome?: () => void;
  onEnd?: () => void;
  onCtrlHome?: () => void;
  onCtrlEnd?: () => void;
  disabled?: boolean;
}) {
  const { disabled, ...handlers } = options;
  return useKeyboard(KeyboardPatterns.grid(handlers), { disabled });
}

/**
 * Hook for type-ahead search in menus/listboxes
 *
 * @example
 * ```tsx
 * function Listbox({ items }) {
 *   const { onKeyDown, reset } = useTypeAhead(
 *     items.map(i => i.label),
 *     (match) => focusItem(match)
 *   );
 *
 *   return <ul onKeyDown={onKeyDown}>...</ul>;
 * }
 * ```
 */
export function useTypeAhead(
  items: string[],
  onMatch: (match: string) => void,
  options: { timeout?: number; disabled?: boolean } = {}
) {
  const { timeout = 500, disabled = false } = options;

  const typeAhead = useMemo(
    () => createTypeAhead(items, { timeout }),
    [items, timeout]
  );

  const onMatchRef = useRef(onMatch);
  onMatchRef.current = onMatch;

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (disabled) return;

      // Only handle single character keys
      if (event.key.length !== 1) return;

      // Ignore if modifier keys are pressed
      if (event.ctrlKey || event.altKey || event.metaKey) return;

      const match = typeAhead.type(event.key);
      if (match) {
        onMatchRef.current(match);
      }
    },
    [disabled, typeAhead]
  );

  return {
    onKeyDown: handleKeyDown,
    reset: typeAhead.reset,
    getSearch: typeAhead.getSearch,
  };
}

/**
 * Hook for tracking which key is currently pressed
 * Useful for showing keyboard shortcuts or modifier states
 */
export function useKeyPressed(
  targetKey: string
): boolean {
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (normalizeKey(event) === targetKey) {
        setPressed(true);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (normalizeKey(event) === targetKey) {
        setPressed(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [targetKey]);

  return pressed;
}

// Need to import useState
import { useState } from 'react';
