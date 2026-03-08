import { useEffect, useRef, useCallback } from 'react';
import { createFocusTrap, type FocusTrapOptions } from '@compa11y/core';

export interface UseFocusTrapOptions extends FocusTrapOptions {
  /** Whether the focus trap is active */
  active?: boolean;
}

/**
 * Hook to create a focus trap for modals, dialogs, etc.
 *
 * @example
 * ```tsx
 * function Modal({ isOpen, onClose }) {
 *   const trapRef = useFocusTrap({
 *     active: isOpen,
 *     onDeactivate: onClose,
 *   });
 *
 *   return (
 *     <div ref={trapRef} role="dialog">
 *       <button>Close</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useFocusTrap<T extends HTMLElement = HTMLDivElement>(
  options: UseFocusTrapOptions = {}
): React.RefObject<T> {
  const { active = true, ...trapOptions } = options;
  const containerRef = useRef<T>(null);
  const trapRef = useRef<ReturnType<typeof createFocusTrap> | null>(null);

  // Store callbacks in refs so they don't cause the effect to re-run
  // (which would destroy + recreate the trap and steal focus)
  const onDeactivateRef = useRef(trapOptions.onDeactivate);
  onDeactivateRef.current = trapOptions.onDeactivate;
  const onEscapeFocusRef = useRef(trapOptions.onEscapeFocus);
  onEscapeFocusRef.current = trapOptions.onEscapeFocus;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    trapRef.current = createFocusTrap(container, {
      ...trapOptions,
      onDeactivate: () => onDeactivateRef.current?.(),
      onEscapeFocus: (el) => onEscapeFocusRef.current?.(el),
    });

    if (active) {
      trapRef.current.activate();
    }

    return () => {
      // Use destroy() instead of deactivate() to avoid calling onDeactivate
      // during cleanup (which would cause issues with React Strict Mode)
      trapRef.current?.destroy();
      trapRef.current = null;
    };
  // Only re-create the trap when config values (not callbacks) change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    trapOptions.initialFocus,
    trapOptions.returnFocus,
    trapOptions.clickOutsideDeactivates,
    trapOptions.escapeDeactivates,
  ]);

  useEffect(() => {
    if (!trapRef.current) return;

    if (active) {
      trapRef.current.activate();
    } else {
      trapRef.current.deactivate();
    }
  }, [active]);

  return containerRef;
}

/**
 * Imperative focus trap controls
 */
export function useFocusTrapControls<T extends HTMLElement = HTMLDivElement>(
  options: Omit<FocusTrapOptions, 'onDeactivate'> = {}
) {
  const containerRef = useRef<T | null>(null);
  const trapRef = useRef<ReturnType<typeof createFocusTrap> | null>(null);

  const activate = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!trapRef.current) {
      trapRef.current = createFocusTrap(container, options);
    }
    trapRef.current.activate();
  }, [options]);

  const deactivate = useCallback(() => {
    trapRef.current?.deactivate();
  }, []);

  const pause = useCallback(() => {
    trapRef.current?.pause();
  }, []);

  const unpause = useCallback(() => {
    trapRef.current?.unpause();
  }, []);

  useEffect(() => {
    return () => {
      // Use destroy() for cleanup to avoid calling onDeactivate during unmount
      trapRef.current?.destroy();
      trapRef.current = null;
    };
  }, []);

  return {
    ref: containerRef,
    activate,
    deactivate,
    pause,
    unpause,
    isActive: () => trapRef.current?.isActive() ?? false,
    isPaused: () => trapRef.current?.isPaused() ?? false,
  };
}
