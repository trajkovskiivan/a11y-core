/**
 * Focus Scope Management
 *
 * Manages focus within a scope, supporting roving tabindex
 * and programmatic focus control
 */

import {
  getTabbableElements,
  getNextFocusable,
  getPreviousFocusable,
} from '../utils/dom';
import { createComponentWarnings } from '../dev/warnings';

export interface FocusScopeOptions {
  /** Whether to contain focus within the scope */
  contain?: boolean;
  /** Whether to restore focus when scope is destroyed */
  restoreFocus?: boolean;
  /** Whether to auto-focus the first element */
  autoFocus?: boolean;
}

export interface FocusScope {
  /** Focus the first focusable element */
  focusFirst: () => void;
  /** Focus the last focusable element */
  focusLast: () => void;
  /** Focus the next focusable element */
  focusNext: (options?: { wrap?: boolean }) => void;
  /** Focus the previous focusable element */
  focusPrevious: (options?: { wrap?: boolean }) => void;
  /** Focus a specific element by index */
  focusAt: (index: number) => void;
  /** Get the currently focused element within scope */
  getFocused: () => HTMLElement | null;
  /** Get all focusable elements in the scope */
  getElements: () => HTMLElement[];
  /** Destroy the scope and cleanup */
  destroy: () => void;
}

/**
 * Create a focus scope for a container
 */
export function createFocusScope(
  container: HTMLElement,
  options: FocusScopeOptions = {}
): FocusScope {
  const { contain = false, restoreFocus = false, autoFocus = false } = options;

  let previouslyFocused: HTMLElement | null = null;
  let isDestroyed = false;

  // Store previously focused element
  if (restoreFocus) {
    previouslyFocused = document.activeElement as HTMLElement;
  }

  function getElements(): HTMLElement[] {
    if (isDestroyed) return [];
    return getTabbableElements(container);
  }

  function getFocused(): HTMLElement | null {
    const active = document.activeElement;
    if (active && container.contains(active)) {
      return active as HTMLElement;
    }
    return null;
  }

  function focusFirst(): void {
    if (isDestroyed) return;
    const elements = getElements();
    elements[0]?.focus();
  }

  function focusLast(): void {
    if (isDestroyed) return;
    const elements = getElements();
    elements[elements.length - 1]?.focus();
  }

  function focusNext({ wrap = true } = {}): void {
    if (isDestroyed) return;
    const current = getFocused();
    if (!current) {
      focusFirst();
      return;
    }
    const next = getNextFocusable(container, current, wrap);
    next?.focus();
  }

  function focusPrevious({ wrap = true } = {}): void {
    if (isDestroyed) return;
    const current = getFocused();
    if (!current) {
      focusLast();
      return;
    }
    const prev = getPreviousFocusable(container, current, wrap);
    prev?.focus();
  }

  function focusAt(index: number): void {
    if (isDestroyed) return;
    const elements = getElements();
    const element = elements[index];
    element?.focus();
  }

  function handleKeyDown(event: KeyboardEvent): void {
    if (isDestroyed || !contain) return;

    if (event.key === 'Tab') {
      const elements = getElements();
      if (elements.length === 0) {
        event.preventDefault();
        return;
      }

      const first = elements[0]!;
      const last = elements[elements.length - 1]!;
      const current = getFocused();

      if (event.shiftKey && current === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && current === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  function destroy(): void {
    if (isDestroyed) return;
    isDestroyed = true;

    document.removeEventListener('keydown', handleKeyDown, true);

    if (restoreFocus && previouslyFocused) {
      previouslyFocused.focus();
    }
  }

  // Setup
  if (contain) {
    document.addEventListener('keydown', handleKeyDown, true);
  }

  if (autoFocus) {
    requestAnimationFrame(() => {
      if (!isDestroyed) focusFirst();
    });
  }

  return {
    focusFirst,
    focusLast,
    focusNext,
    focusPrevious,
    focusAt,
    getFocused,
    getElements,
    destroy,
  };
}

/**
 * Roving Tabindex - Only one element is tabbable at a time
 * Standard pattern for composite widgets like toolbars, menus, listboxes
 */
export interface RovingTabindexOptions {
  /** Current active index */
  initialIndex?: number;
  /** Orientation for arrow key navigation */
  orientation?: 'horizontal' | 'vertical' | 'both';
  /** Whether to wrap around */
  wrap?: boolean;
  /** Called when selection changes */
  onSelectionChange?: (index: number, element: HTMLElement) => void;
}

export interface RovingTabindex {
  /** Move to the next item */
  next: () => void;
  /** Move to the previous item */
  previous: () => void;
  /** Move to the first item */
  first: () => void;
  /** Move to the last item */
  last: () => void;
  /** Move to a specific index */
  goto: (index: number) => void;
  /** Get current index */
  getIndex: () => number;
  /** Update elements (call when DOM changes) */
  update: () => void;
  /** Cleanup */
  destroy: () => void;
}

const rovingWarnings = createComponentWarnings('RovingTabindex');

export function createRovingTabindex(
  container: HTMLElement,
  selector: string,
  options: RovingTabindexOptions = {}
): RovingTabindex {
  const {
    initialIndex = 0,
    orientation = 'both',
    wrap = true,
    onSelectionChange,
  } = options;

  let elements: HTMLElement[] = [];
  let currentIndex = initialIndex;

  function update(): void {
    elements = Array.from(container.querySelectorAll<HTMLElement>(selector));

    if (elements.length === 0) {
      rovingWarnings.warning(
        `No elements matching "${selector}" found in the container. Roving tabindex has nothing to manage.`,
        'Ensure the container has child elements matching the selector.',
        container
      );
    }

    // Update tabindex attributes
    elements.forEach((el, index) => {
      el.setAttribute('tabindex', index === currentIndex ? '0' : '-1');
    });
  }

  function moveTo(index: number): void {
    if (elements.length === 0) return;

    let newIndex = index;
    if (newIndex < 0) {
      newIndex = wrap ? elements.length - 1 : 0;
    } else if (newIndex >= elements.length) {
      newIndex = wrap ? 0 : elements.length - 1;
    }

    const previousElement = elements[currentIndex];
    const nextElement = elements[newIndex];

    if (previousElement) {
      previousElement.setAttribute('tabindex', '-1');
    }

    if (nextElement) {
      nextElement.setAttribute('tabindex', '0');
      nextElement.focus();
      onSelectionChange?.(newIndex, nextElement);
    }

    currentIndex = newIndex;
  }

  function handleKeyDown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    if (!elements.includes(target)) return;

    let handled = false;

    switch (event.key) {
      case 'ArrowRight':
        if (orientation === 'horizontal' || orientation === 'both') {
          moveTo(currentIndex + 1);
          handled = true;
        }
        break;
      case 'ArrowLeft':
        if (orientation === 'horizontal' || orientation === 'both') {
          moveTo(currentIndex - 1);
          handled = true;
        }
        break;
      case 'ArrowDown':
        if (orientation === 'vertical' || orientation === 'both') {
          moveTo(currentIndex + 1);
          handled = true;
        }
        break;
      case 'ArrowUp':
        if (orientation === 'vertical' || orientation === 'both') {
          moveTo(currentIndex - 1);
          handled = true;
        }
        break;
      case 'Home':
        moveTo(0);
        handled = true;
        break;
      case 'End':
        moveTo(elements.length - 1);
        handled = true;
        break;
    }

    if (handled) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  function handleFocus(event: FocusEvent): void {
    const target = event.target as HTMLElement;
    const index = elements.indexOf(target);
    if (index !== -1 && index !== currentIndex) {
      // Update current index when element is focused directly
      const previousElement = elements[currentIndex];
      if (previousElement) {
        previousElement.setAttribute('tabindex', '-1');
      }
      target.setAttribute('tabindex', '0');
      currentIndex = index;
    }
  }

  // Initialize
  update();
  container.addEventListener('keydown', handleKeyDown);
  container.addEventListener('focusin', handleFocus);

  return {
    next: () => moveTo(currentIndex + 1),
    previous: () => moveTo(currentIndex - 1),
    first: () => moveTo(0),
    last: () => moveTo(elements.length - 1),
    goto: moveTo,
    getIndex: () => currentIndex,
    update,
    destroy: () => {
      container.removeEventListener('keydown', handleKeyDown);
      container.removeEventListener('focusin', handleFocus);
    },
  };
}
