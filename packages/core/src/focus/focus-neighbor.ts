/**
 * Focus Neighbor & Focus Return
 *
 * Utilities for graceful focus recovery when the focused element
 * becomes disabled, removed, or otherwise unfocusable.
 *
 * @example
 * ```ts
 * // Find where focus should go if this button is about to be removed
 * const neighbor = findFocusNeighbor(button);
 * neighbor?.focus();
 *
 * // Remember focus target, restore later (with fallback to neighbor)
 * const focusReturn = createFocusReturn();
 * focusReturn.save(triggerButton);
 * // ... later, after modal closes:
 * focusReturn.return(); // focuses trigger, or its neighbor if trigger is disabled
 * ```
 */

import { getTabbableElements, isTabbable } from '../utils/dom';

// ============================================================================
// findFocusNeighbor
// ============================================================================

export interface FocusNeighborOptions {
  /** Container to search within (default: element.parentElement ?? document.body) */
  scope?: HTMLElement;
  /** Which direction to try first: 'previous' (default) or 'next' */
  prefer?: 'previous' | 'next';
}

/**
 * Find the nearest focusable neighbor of an element within a scope.
 *
 * Useful when an element is about to be removed or disabled and you
 * need to know where to move focus.
 *
 * @param element - The reference element to find a neighbor for
 * @param options - Search scope and direction preference
 * @returns The nearest tabbable neighbor, or null if none found
 */
export function findFocusNeighbor(
  element: HTMLElement,
  options: FocusNeighborOptions = {}
): HTMLElement | null {
  const {
    scope = element.parentElement ?? document.body,
    prefer = 'previous',
  } = options;

  const tabbable = getTabbableElements(scope);

  // Find the element's position (or closest position if it's not in the list)
  let index = tabbable.indexOf(element);

  if (index === -1) {
    // Element is not tabbable (disabled/hidden); find where it would be in DOM order
    // by checking which tabbable elements precede it
    index = tabbable.findIndex(
      (el) =>
        element.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING
    );
    // If all tabbable elements come before, index is -1 → treat as "after last"
    if (index === -1) {
      index = tabbable.length;
    }
  }

  const prevIndex = index - 1;
  const nextIndex = index + 1;
  // Ensure we don't return the element itself
  const prev =
    prevIndex >= 0 && tabbable[prevIndex] !== element
      ? tabbable[prevIndex]!
      : null;
  const next =
    nextIndex < tabbable.length && tabbable[nextIndex] !== element
      ? tabbable[nextIndex]!
      : null;

  if (prefer === 'previous') {
    return prev ?? next;
  }
  return next ?? prev;
}

// ============================================================================
// createFocusReturn
// ============================================================================

export interface FocusReturnOptions {
  /** Fallback element if saved element and its neighbors are all unfocusable */
  fallback?: HTMLElement;
  /** Direction preference for neighbor search */
  prefer?: 'previous' | 'next';
}

export interface FocusReturn {
  /** The currently saved element (may be null) */
  readonly element: HTMLElement | null;
  /** Save an element (or current activeElement) as the return target */
  save(element?: HTMLElement): void;
  /** Return focus to the saved element, or its nearest neighbor if unavailable */
  return(options?: FocusReturnOptions): void;
  /** Clear the saved reference without moving focus */
  clear(): void;
}

/**
 * Create a focus return manager that remembers an element and can
 * restore focus to it later — with smart fallback to the nearest
 * focusable neighbor if the saved element is no longer available.
 *
 * @param initialElement - Optional element to save immediately
 * @returns FocusReturn controller
 */
export function createFocusReturn(initialElement?: HTMLElement): FocusReturn {
  let saved: HTMLElement | null = initialElement ?? null;

  function save(element?: HTMLElement): void {
    saved = element ?? (document.activeElement as HTMLElement) ?? null;
  }

  function returnFocus(options: FocusReturnOptions = {}): void {
    const { fallback, prefer = 'previous' } = options;

    if (!saved) {
      fallback?.focus();
      return;
    }

    // Happy path: saved element is still focusable
    if (saved.isConnected && isTabbable(saved)) {
      saved.focus();
      saved = null;
      return;
    }

    // Saved element is gone or disabled — try its neighbor
    if (saved.isConnected) {
      // Element is in DOM but not tabbable (e.g., disabled button)
      const neighbor = findFocusNeighbor(saved, { prefer });
      if (neighbor) {
        neighbor.focus();
        saved = null;
        return;
      }
    }

    // Last resort: fallback
    if (fallback) {
      fallback.focus();
    }
    saved = null;
  }

  function clear(): void {
    saved = null;
  }

  return {
    get element() {
      return saved;
    },
    save,
    return: returnFocus,
    clear,
  };
}
