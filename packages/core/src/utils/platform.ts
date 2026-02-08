/**
 * Platform detection utilities
 *
 * Used for platform-specific accessibility behavior
 */

/**
 * Check if we're in a browser environment
 */
export function isBrowser(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Detect if running on macOS
 */
export function isMac(): boolean {
  if (!isBrowser()) return false;
  return /Mac|iPod|iPhone|iPad/.test(navigator.platform);
}

/**
 * Detect if running on iOS
 */
export function isIOS(): boolean {
  if (!isBrowser()) return false;
  return /iPod|iPhone|iPad/.test(navigator.platform) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

/**
 * Detect if running on Android
 */
export function isAndroid(): boolean {
  if (!isBrowser()) return false;
  return /Android/.test(navigator.userAgent);
}

/**
 * Detect if running on Windows
 */
export function isWindows(): boolean {
  if (!isBrowser()) return false;
  return /Win/.test(navigator.platform);
}

/**
 * Detect if using a touch device
 */
export function isTouchDevice(): boolean {
  if (!isBrowser()) return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Detect if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (!isBrowser()) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Detect if user prefers high contrast
 */
export function prefersHighContrast(): boolean {
  if (!isBrowser()) return false;
  return (
    window.matchMedia('(prefers-contrast: more)').matches ||
    window.matchMedia('(-ms-high-contrast: active)').matches
  );
}

/**
 * Detect if user prefers dark color scheme
 */
export function prefersDarkMode(): boolean {
  if (!isBrowser()) return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Get the current screen reader mode (if detectable)
 * Note: This is not 100% reliable and should not be depended upon
 */
export function getScreenReaderHints(): {
  possibleScreenReader: boolean;
  forcedColors: boolean;
} {
  if (!isBrowser()) {
    return { possibleScreenReader: false, forcedColors: false };
  }

  const forcedColors = window.matchMedia('(forced-colors: active)').matches;

  // Heuristic: users with forced colors often use screen readers
  // But this is NOT a reliable indicator
  return {
    possibleScreenReader: forcedColors,
    forcedColors,
  };
}

/**
 * Create a media query listener with cleanup
 */
export function createMediaQueryListener(
  query: string,
  callback: (matches: boolean) => void
): () => void {
  if (!isBrowser()) {
    return () => {};
  }

  const mediaQuery = window.matchMedia(query);

  // Initial call
  callback(mediaQuery.matches);

  // Modern API
  if (mediaQuery.addEventListener) {
    const handler = (e: MediaQueryListEvent) => callback(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }

  // Legacy API (Safari < 14)
  const legacyHandler = () => callback(mediaQuery.matches);
  mediaQuery.addListener(legacyHandler);
  return () => mediaQuery.removeListener(legacyHandler);
}
