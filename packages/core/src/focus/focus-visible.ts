/**
 * Focus Visible Management
 *
 * Provides :focus-visible polyfill behavior and utilities
 * for distinguishing keyboard focus from mouse/touch focus
 */

import { isBrowser } from '../utils/platform';

type FocusSource = 'keyboard' | 'mouse' | 'touch' | 'unknown';

interface FocusVisibleState {
  hadKeyboardEvent: boolean;
  isPointerInput: boolean;
  lastFocusSource: FocusSource;
}

const state: FocusVisibleState = {
  hadKeyboardEvent: true, // Assume keyboard initially (conservative)
  isPointerInput: false,
  lastFocusSource: 'unknown',
};

let isInitialized = false;

// Keys that indicate keyboard navigation
const NAVIGATION_KEYS = new Set([
  'Tab',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Enter',
  ' ',
  'Home',
  'End',
  'PageUp',
  'PageDown',
  'Escape',
]);

/**
 * Initialize focus-visible tracking
 * Call this once at app startup
 */
export function initFocusVisible(): () => void {
  if (!isBrowser() || isInitialized) {
    return () => {};
  }

  isInitialized = true;

  function handleKeyDown(event: KeyboardEvent): void {
    if (NAVIGATION_KEYS.has(event.key)) {
      state.hadKeyboardEvent = true;
      state.isPointerInput = false;
      state.lastFocusSource = 'keyboard';
    }
  }

  function handlePointerDown(event: PointerEvent | MouseEvent): void {
    state.isPointerInput = true;
    state.hadKeyboardEvent = false;
    state.lastFocusSource =
      'pointerType' in event
        ? event.pointerType === 'touch'
          ? 'touch'
          : 'mouse'
        : 'mouse';
  }

  function handleFocus(event: FocusEvent): void {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    if (state.hadKeyboardEvent || shouldShowFocusForElement(target)) {
      target.dataset.a11ykitFocusVisible = 'true';
    }
  }

  function handleBlur(event: FocusEvent): void {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    delete target.dataset.a11ykitFocusVisible;
  }

  function handleVisibilityChange(): void {
    if (document.visibilityState === 'hidden') {
      // When tab becomes hidden, assume next focus could be keyboard
      state.hadKeyboardEvent = true;
    }
  }

  // Add event listeners
  document.addEventListener('keydown', handleKeyDown, true);
  document.addEventListener('mousedown', handlePointerDown, true);
  document.addEventListener('pointerdown', handlePointerDown, true);
  document.addEventListener('focus', handleFocus, true);
  document.addEventListener('blur', handleBlur, true);
  document.addEventListener('visibilitychange', handleVisibilityChange, true);

  // Cleanup function
  return () => {
    document.removeEventListener('keydown', handleKeyDown, true);
    document.removeEventListener('mousedown', handlePointerDown, true);
    document.removeEventListener('pointerdown', handlePointerDown, true);
    document.removeEventListener('focus', handleFocus, true);
    document.removeEventListener('blur', handleBlur, true);
    document.removeEventListener(
      'visibilitychange',
      handleVisibilityChange,
      true
    );
    isInitialized = false;
  };
}

/**
 * Check if focus should always be visible for this element type
 * Some elements (like text inputs) should always show focus ring
 */
function shouldShowFocusForElement(element: HTMLElement): boolean {
  const tagName = element.tagName.toLowerCase();
  const type = element.getAttribute('type')?.toLowerCase();

  // Text inputs should always show focus
  if (
    tagName === 'input' &&
    (!type ||
      type === 'text' ||
      type === 'email' ||
      type === 'password' ||
      type === 'search' ||
      type === 'tel' ||
      type === 'url' ||
      type === 'number')
  ) {
    return true;
  }

  if (tagName === 'textarea') {
    return true;
  }

  if (element.isContentEditable) {
    return true;
  }

  return false;
}

/**
 * Check if current focus should be visible (keyboard-initiated)
 */
export function isFocusVisible(): boolean {
  return state.hadKeyboardEvent;
}

/**
 * Check if an element has visible focus
 */
export function hasVisibleFocus(element: HTMLElement): boolean {
  return element.dataset.a11ykitFocusVisible === 'true';
}

/**
 * Get the source of the last focus event
 */
export function getLastFocusSource(): FocusSource {
  return state.lastFocusSource;
}

/**
 * Manually set focus as visible (useful for programmatic focus)
 */
export function setFocusVisible(element: HTMLElement, visible: boolean): void {
  if (visible) {
    element.dataset.a11ykitFocusVisible = 'true';
  } else {
    delete element.dataset.a11ykitFocusVisible;
  }
}

/**
 * Focus an element with visible focus ring (keyboard-style)
 */
export function focusWithVisibleRing(
  element: HTMLElement,
  options?: FocusOptions
): void {
  state.hadKeyboardEvent = true;
  state.lastFocusSource = 'keyboard';
  element.focus(options);
}
