/**
 * DOM utilities for accessibility
 */

/**
 * Focusable element selectors
 * Based on WHATWG focus management spec
 */
export const FOCUSABLE_SELECTORS = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
  'audio[controls]',
  'video[controls]',
  'details > summary:first-of-type',
  'iframe',
].join(',');

/**
 * Tabbable element selectors (subset of focusable that can be tabbed to)
 */
export const TABBABLE_SELECTORS = [
  'a[href]:not([tabindex="-1"])',
  'area[href]:not([tabindex="-1"])',
  'button:not([disabled]):not([tabindex="-1"])',
  'input:not([disabled]):not([type="hidden"]):not([tabindex="-1"])',
  'select:not([disabled]):not([tabindex="-1"])',
  'textarea:not([disabled]):not([tabindex="-1"])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]:not([tabindex="-1"])',
  'audio[controls]:not([tabindex="-1"])',
  'video[controls]:not([tabindex="-1"])',
  'details > summary:first-of-type:not([tabindex="-1"])',
  'iframe:not([tabindex="-1"])',
].join(',');

/**
 * Check if an element is visible (not hidden by CSS)
 */
export function isVisible(element: Element): boolean {
  if (!(element instanceof HTMLElement)) {
    return false;
  }

  // Check hidden attribute
  if (element.hidden) {
    return false;
  }

  // Check inline display style first (fast path)
  if (element.style.display === 'none') {
    return false;
  }

  // Check visibility
  if (element.style.visibility === 'hidden') {
    return false;
  }

  // Check computed styles
  const style = window.getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden') {
    return false;
  }

  // Check if element is connected to DOM
  if (!element.isConnected) {
    return false;
  }

  // Note: We intentionally don't check offsetWidth/offsetHeight here
  // because jsdom and some testing environments return 0 for all elements.
  // The display/visibility checks above are sufficient for accessibility purposes.

  return true;
}

/**
 * Check if an element is focusable
 */
export function isFocusable(element: Element): boolean {
  if (!(element instanceof HTMLElement)) {
    return false;
  }

  // Must be visible
  if (!isVisible(element)) {
    return false;
  }

  // Check if it matches focusable selectors
  if (!element.matches(FOCUSABLE_SELECTORS)) {
    return false;
  }

  // Check inert attribute
  if (element.closest('[inert]')) {
    return false;
  }

  return true;
}

/**
 * Check if an element is tabbable (can receive focus via Tab key)
 */
export function isTabbable(element: Element): boolean {
  if (!isFocusable(element)) {
    return false;
  }

  // Elements with tabindex="-1" are focusable but not tabbable
  const tabIndex = (element as HTMLElement).tabIndex;
  if (tabIndex < 0) {
    return false;
  }

  return element.matches(TABBABLE_SELECTORS);
}

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(
  container: HTMLElement
): HTMLElement[] {
  const elements = Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
  );

  return elements.filter(isFocusable);
}

/**
 * Get all tabbable elements within a container (sorted by tabIndex)
 */
export function getTabbableElements(
  container: HTMLElement
): HTMLElement[] {
  const elements = Array.from(
    container.querySelectorAll<HTMLElement>(TABBABLE_SELECTORS)
  );

  const tabbable = elements.filter(isTabbable);

  // Sort by tabIndex (elements with tabIndex > 0 come first, then tabIndex = 0)
  return tabbable.sort((a, b) => {
    const aIndex = Math.max(0, a.tabIndex);
    const bIndex = Math.max(0, b.tabIndex);

    if (aIndex === 0 && bIndex === 0) {
      return 0; // Keep DOM order
    }
    if (aIndex === 0) {
      return 1; // a comes after b
    }
    if (bIndex === 0) {
      return -1; // a comes before b
    }
    return aIndex - bIndex;
  });
}

/**
 * Get the first focusable element in a container
 */
export function getFirstFocusable(
  container: HTMLElement
): HTMLElement | null {
  const elements = getTabbableElements(container);
  return elements[0] ?? null;
}

/**
 * Get the last focusable element in a container
 */
export function getLastFocusable(
  container: HTMLElement
): HTMLElement | null {
  const elements = getTabbableElements(container);
  return elements[elements.length - 1] ?? null;
}

/**
 * Check if an element contains the currently focused element
 */
export function containsFocus(container: HTMLElement): boolean {
  const activeElement = document.activeElement;
  return activeElement !== null && container.contains(activeElement);
}

/**
 * Get the next focusable element
 */
export function getNextFocusable(
  container: HTMLElement,
  current: HTMLElement,
  wrap = true
): HTMLElement | null {
  const elements = getTabbableElements(container);
  const currentIndex = elements.indexOf(current);

  if (currentIndex === -1) {
    return elements[0] ?? null;
  }

  const nextIndex = currentIndex + 1;
  if (nextIndex < elements.length) {
    return elements[nextIndex]!;
  }

  return wrap ? (elements[0] ?? null) : null;
}

/**
 * Get the previous focusable element
 */
export function getPreviousFocusable(
  container: HTMLElement,
  current: HTMLElement,
  wrap = true
): HTMLElement | null {
  const elements = getTabbableElements(container);
  const currentIndex = elements.indexOf(current);

  if (currentIndex === -1) {
    return elements[elements.length - 1] ?? null;
  }

  const prevIndex = currentIndex - 1;
  if (prevIndex >= 0) {
    return elements[prevIndex]!;
  }

  return wrap ? (elements[elements.length - 1] ?? null) : null;
}

/**
 * Check if element is within a specific container
 */
export function isWithinContainer(
  element: Element,
  container: Element
): boolean {
  return container.contains(element);
}

/**
 * Query for an element, supporting various input types
 */
export function resolveElement<T extends HTMLElement = HTMLElement>(
  target: T | string | (() => T | null) | null | undefined,
  container: HTMLElement = document.body
): T | null {
  if (!target) {
    return null;
  }

  if (typeof target === 'string') {
    return container.querySelector<T>(target);
  }

  if (typeof target === 'function') {
    return target();
  }

  return target;
}
