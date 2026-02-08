/**
 * Focus Trap - Constrains focus within a container
 *
 * Essential for modals, dialogs, and other overlay components
 */

import type { FocusTrapOptions } from '../types';
import {
  getTabbableElements,
  getFirstFocusable,
  containsFocus,
  resolveElement,
} from '../utils/dom';

interface FocusTrap {
  activate: () => void;
  deactivate: () => void;
  /** Cleanup without calling onDeactivate - for use in effect cleanup */
  destroy: () => void;
  pause: () => void;
  unpause: () => void;
  isActive: () => boolean;
  isPaused: () => boolean;
}

// Track active focus traps in a stack (for nested traps)
const focusTrapStack: FocusTrap[] = [];

/**
 * Create a focus trap for a container element
 */
export function createFocusTrap(
  container: HTMLElement,
  options: FocusTrapOptions = {}
): FocusTrap {
  const {
    initialFocus,
    returnFocus = true,
    clickOutsideDeactivates = false,
    escapeDeactivates = true,
    onDeactivate,
    onEscapeFocus,
  } = options;

  let active = false;
  let paused = false;
  let previouslyFocused: HTMLElement | null = null;

  function handleKeyDown(event: KeyboardEvent): void {
    if (paused || !active) return;

    if (event.key === 'Tab') {
      handleTabKey(event);
    } else if (event.key === 'Escape' && escapeDeactivates) {
      event.preventDefault();
      event.stopPropagation();
      deactivate();
    }
  }

  function handleTabKey(event: KeyboardEvent): void {
    const tabbable = getTabbableElements(container);

    if (tabbable.length === 0) {
      // No focusable elements, prevent tab
      event.preventDefault();
      return;
    }

    const first = tabbable[0]!;
    const last = tabbable[tabbable.length - 1]!;
    const activeElement = document.activeElement as HTMLElement;

    if (event.shiftKey) {
      // Shift+Tab: moving backwards
      if (activeElement === first || !container.contains(activeElement)) {
        event.preventDefault();
        last.focus();
      }
    } else {
      // Tab: moving forwards
      if (activeElement === last || !container.contains(activeElement)) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  function handleFocusIn(event: FocusEvent): void {
    if (paused || !active) return;

    const target = event.target as HTMLElement;

    // If focus moved outside the container, bring it back
    if (!container.contains(target)) {
      // Notify about the escape attempt (useful for portals)
      onEscapeFocus?.(target);

      // Refocus inside the container
      const first = getFirstFocusable(container);
      first?.focus();
    }
  }

  function handleClick(event: MouseEvent): void {
    if (paused || !active) return;

    const target = event.target as HTMLElement;

    if (clickOutsideDeactivates && !container.contains(target)) {
      deactivate();
    }
  }

  function activate(): void {
    if (active) return;

    // Store the currently focused element
    previouslyFocused = document.activeElement as HTMLElement;

    // Add to stack
    focusTrapStack.push(trap);

    // Pause other active traps
    for (let i = 0; i < focusTrapStack.length - 1; i++) {
      focusTrapStack[i]!.pause();
    }

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('focusin', handleFocusIn, true);
    document.addEventListener('click', handleClick, true);

    active = true;

    // Focus the initial element
    requestAnimationFrame(() => {
      if (!active) return;

      const initialElement = resolveElement(initialFocus, container);
      if (initialElement) {
        initialElement.focus();
      } else {
        const first = getFirstFocusable(container);
        if (first) {
          first.focus();
        } else {
          // If no focusable elements, focus the container itself
          container.setAttribute('tabindex', '-1');
          container.focus();
        }
      }
    });
  }

  function cleanupTrap(callOnDeactivate: boolean): void {
    if (!active) return;

    // Remove event listeners
    document.removeEventListener('keydown', handleKeyDown, true);
    document.removeEventListener('focusin', handleFocusIn, true);
    document.removeEventListener('click', handleClick, true);

    active = false;
    paused = false;

    // Remove from stack
    const index = focusTrapStack.indexOf(trap);
    if (index > -1) {
      focusTrapStack.splice(index, 1);
    }

    // Unpause the previous trap in the stack
    const previousTrap = focusTrapStack[focusTrapStack.length - 1];
    previousTrap?.unpause();

    // Return focus
    if (returnFocus && previouslyFocused) {
      const target =
        typeof returnFocus === 'boolean'
          ? previouslyFocused
          : returnFocus;

      requestAnimationFrame(() => {
        if (target && 'focus' in target) {
          target.focus();
        }
      });
    }

    if (callOnDeactivate) {
      onDeactivate?.();
    }
  }

  function deactivate(): void {
    cleanupTrap(true);
  }

  function destroy(): void {
    cleanupTrap(false);
  }

  function pause(): void {
    if (!active || paused) return;
    paused = true;
  }

  function unpause(): void {
    if (!active || !paused) return;
    paused = false;

    // Ensure focus is within the container
    if (!containsFocus(container)) {
      const first = getFirstFocusable(container);
      first?.focus();
    }
  }

  const trap: FocusTrap = {
    activate,
    deactivate,
    destroy,
    pause,
    unpause,
    isActive: () => active,
    isPaused: () => paused,
  };

  return trap;
}

/**
 * Get the currently active focus trap
 */
export function getActiveFocusTrap(): FocusTrap | null {
  return focusTrapStack[focusTrapStack.length - 1] ?? null;
}

/**
 * Check if there's an active focus trap
 */
export function hasFocusTrap(): boolean {
  return focusTrapStack.length > 0;
}
