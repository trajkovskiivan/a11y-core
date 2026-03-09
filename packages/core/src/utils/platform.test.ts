import { describe, it, expect, beforeAll } from 'vitest';
import {
  isBrowser,
  isMac,
  isIOS,
  isAndroid,
  isWindows,
  isTouchDevice,
  prefersReducedMotion,
  prefersHighContrast,
  prefersDarkMode,
  pointerCoarse,
  pointerFine,
  getScreenReaderHints,
  createMediaQueryListener,
} from './platform';

describe('platform utilities', () => {
  beforeAll(() => {
    // jsdom doesn't provide matchMedia — mock it
    if (!window.matchMedia) {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query: string) => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => false,
        }),
      });
    }
  });
  it('isBrowser() should return true in jsdom', () => {
    expect(isBrowser()).toBe(true);
  });

  it('isMac() should return a boolean', () => {
    expect(typeof isMac()).toBe('boolean');
  });

  it('isIOS() should return a boolean', () => {
    expect(typeof isIOS()).toBe('boolean');
  });

  it('isAndroid() should return false in jsdom', () => {
    expect(isAndroid()).toBe(false);
  });

  it('isWindows() should return a boolean', () => {
    expect(typeof isWindows()).toBe('boolean');
  });

  it('isTouchDevice() should return a boolean', () => {
    expect(typeof isTouchDevice()).toBe('boolean');
  });

  it('prefersReducedMotion() should return a boolean', () => {
    expect(typeof prefersReducedMotion()).toBe('boolean');
  });

  it('prefersHighContrast() should return a boolean', () => {
    expect(typeof prefersHighContrast()).toBe('boolean');
  });

  it('prefersDarkMode() should return a boolean', () => {
    expect(typeof prefersDarkMode()).toBe('boolean');
  });

  it('pointerCoarse() should return a boolean', () => {
    expect(typeof pointerCoarse()).toBe('boolean');
  });

  it('pointerFine() should return a boolean', () => {
    expect(typeof pointerFine()).toBe('boolean');
  });

  it('getScreenReaderHints() should return object with possibleScreenReader and forcedColors', () => {
    const hints = getScreenReaderHints();

    expect(hints).toHaveProperty('possibleScreenReader');
    expect(hints).toHaveProperty('forcedColors');
    expect(typeof hints.possibleScreenReader).toBe('boolean');
    expect(typeof hints.forcedColors).toBe('boolean');
  });

  it('createMediaQueryListener() should return cleanup function and call callback with initial value', () => {
    let calledWith: boolean | undefined;
    const callback = (matches: boolean) => {
      calledWith = matches;
    };

    const cleanup = createMediaQueryListener(
      '(prefers-reduced-motion: reduce)',
      callback
    );

    expect(typeof cleanup).toBe('function');
    expect(typeof calledWith).toBe('boolean');

    // Cleanup should be callable without error
    cleanup();
  });
});
