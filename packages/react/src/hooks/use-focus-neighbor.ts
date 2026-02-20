/**
 * Focus Neighbor & Focus Return React Hooks
 *
 * React wrappers around @compa11y/core focus-neighbor utilities.
 *
 * @example
 * ```tsx
 * // Find and focus nearest neighbor when element is removed
 * function RemovableItem({ onRemove }) {
 *   const { ref, focusNeighbor } = useFocusNeighbor<HTMLButtonElement>();
 *
 *   const handleRemove = () => {
 *     focusNeighbor(); // move focus before removal
 *     onRemove();
 *   };
 *
 *   return <button ref={ref} onClick={handleRemove}>Remove me</button>;
 * }
 *
 * // Remember and restore focus (e.g., modal trigger)
 * function ModalTrigger() {
 *   const { save, returnFocus } = useFocusReturn();
 *
 *   const openModal = () => {
 *     save(); // remember the trigger
 *     showModal();
 *   };
 *
 *   const closeModal = () => {
 *     hideModal();
 *     returnFocus(); // go back to trigger (or its neighbor if disabled)
 *   };
 * }
 * ```
 */

import { useCallback, useRef } from 'react';
import {
  findFocusNeighbor,
  createFocusReturn,
  type FocusNeighborOptions,
  type FocusReturnOptions,
} from '@compa11y/core';

// ============================================================================
// useFocusNeighbor
// ============================================================================

/**
 * Hook that provides a ref and methods to find/focus the nearest
 * focusable neighbor of the referenced element.
 *
 * Useful when the element is about to be removed or disabled.
 */
export function useFocusNeighbor<T extends HTMLElement = HTMLElement>(
  options?: FocusNeighborOptions
) {
  const ref = useRef<T>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const getNeighbor = useCallback((): HTMLElement | null => {
    if (!ref.current) return null;
    return findFocusNeighbor(ref.current, optionsRef.current);
  }, []);

  const focusNeighbor = useCallback((): void => {
    const neighbor = getNeighbor();
    neighbor?.focus();
  }, [getNeighbor]);

  return { ref, getNeighbor, focusNeighbor };
}

// ============================================================================
// useFocusReturn
// ============================================================================

/**
 * Hook that remembers an element and can restore focus to it later.
 * If the saved element is no longer focusable (disabled, removed),
 * focus moves to its nearest neighbor instead.
 */
export function useFocusReturn() {
  const managerRef = useRef(createFocusReturn());

  const save = useCallback((element?: HTMLElement): void => {
    managerRef.current.save(element);
  }, []);

  const returnFocus = useCallback((options?: FocusReturnOptions): void => {
    managerRef.current.return(options);
  }, []);

  const clear = useCallback((): void => {
    managerRef.current.clear();
  }, []);

  return { save, returnFocus, clear };
}
