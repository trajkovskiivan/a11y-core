import { useEffect, useState, useCallback } from 'react';
import {
  initFocusVisible,
  isFocusVisible as checkFocusVisible,
  focusWithVisibleRing,
} from '@compa11y/core';

/**
 * Hook to detect if focus should be visible (keyboard navigation)
 *
 * @example
 * ```tsx
 * function Button({ children }) {
 *   const { isFocusVisible, focusProps } = useFocusVisible();
 *
 *   return (
 *     <button
 *       {...focusProps}
 *       className={isFocusVisible ? 'focus-ring' : ''}
 *     >
 *       {children}
 *     </button>
 *   );
 * }
 * ```
 */
export function useFocusVisible() {
  const [isFocusVisible, setIsFocusVisible] = useState(false);

  // Initialize focus-visible tracking
  useEffect(() => {
    const cleanup = initFocusVisible();
    return cleanup;
  }, []);

  const handleFocus = useCallback(() => {
    setIsFocusVisible(checkFocusVisible());
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocusVisible(false);
  }, []);

  return {
    isFocusVisible,
    focusProps: {
      onFocus: handleFocus,
      onBlur: handleBlur,
    },
  };
}

/**
 * Hook for managing focus on a specific element
 *
 * @example
 * ```tsx
 * function Combobox() {
 *   const inputRef = useFocusManager<HTMLInputElement>({
 *     autoFocus: true,
 *   });
 *
 *   return <input ref={inputRef} />;
 * }
 * ```
 */
export function useFocusManager<T extends HTMLElement = HTMLElement>(
  options: {
    autoFocus?: boolean;
    restoreFocus?: boolean;
    focusVisible?: boolean;
  } = {}
) {
  const {
    autoFocus = false,
    restoreFocus = false,
    focusVisible = true,
  } = options;

  const elementRef = useCallback(
    (node: T | null) => {
      if (node && autoFocus) {
        // Delay focus to ensure DOM is ready
        requestAnimationFrame(() => {
          if (focusVisible) {
            focusWithVisibleRing(node);
          } else {
            node.focus();
          }
        });
      }
    },
    [autoFocus, focusVisible]
  );

  // Store ref for restore focus
  useEffect(() => {
    if (!restoreFocus) return;

    const previousElement = document.activeElement as HTMLElement;

    return () => {
      if (previousElement && previousElement.focus) {
        previousElement.focus();
      }
    };
  }, [restoreFocus]);

  return elementRef;
}

/**
 * Focus an element programmatically with proper focus-visible handling
 */
export function useFocusControl<T extends HTMLElement = HTMLElement>() {
  const elementRef = useCallback((_node: T | null) => {
    // Just store the ref
  }, []);

  const focus = useCallback((options?: { visible?: boolean }) => {
    const element = elementRef as unknown as { current: T | null };
    if (element.current) {
      if (options?.visible) {
        focusWithVisibleRing(element.current);
      } else {
        element.current.focus();
      }
    }
  }, []);

  return { ref: elementRef, focus };
}

/**
 * Track if an element has focus
 */
export function useFocusWithin<T extends HTMLElement = HTMLElement>() {
  const [hasFocus, setHasFocus] = useState(false);
  const containerRef = useCallback<React.RefCallback<T>>((_node) => {
    // Element ref callback
  }, []);

  const handleFocusIn = useCallback(() => {
    setHasFocus(true);
  }, []);

  const handleFocusOut = useCallback((event: React.FocusEvent) => {
    const container = event.currentTarget;
    const relatedTarget = event.relatedTarget as Node | null;

    // Check if focus moved outside the container
    if (!relatedTarget || !container.contains(relatedTarget)) {
      setHasFocus(false);
    }
  }, []);

  return {
    ref: containerRef,
    hasFocus,
    focusWithinProps: {
      onFocus: handleFocusIn,
      onBlur: handleFocusOut,
    },
  };
}
