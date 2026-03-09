import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  initFocusVisible,
  isFocusVisible,
  hasVisibleFocus,
  getLastFocusSource,
  setFocusVisible,
  focusWithVisibleRing,
} from './focus-visible';

describe('focus-visible', () => {
  let cleanup: () => void;

  beforeEach(() => {
    cleanup = initFocusVisible();
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = '';
  });

  describe('initFocusVisible()', () => {
    it('should return a cleanup function', () => {
      expect(typeof cleanup).toBe('function');
    });

    it('should not double-initialize (second call returns noop)', () => {
      const cleanup2 = initFocusVisible();
      // Should be a noop since already initialized
      cleanup2();
      // Original cleanup still works — won't throw
      expect(() => cleanup()).not.toThrow();
    });
  });

  describe('keyboard vs pointer detection', () => {
    it('should default to keyboard focus (conservative)', () => {
      expect(isFocusVisible()).toBe(true);
    });

    it('should detect pointer input after mousedown', () => {
      document.dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true })
      );
      expect(isFocusVisible()).toBe(false);
      expect(getLastFocusSource()).toBe('mouse');
    });

    it('should detect keyboard input after navigation key press', () => {
      // First go to pointer mode
      document.dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true })
      );
      expect(isFocusVisible()).toBe(false);

      // Then press Tab
      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Tab', bubbles: true })
      );
      expect(isFocusVisible()).toBe(true);
      expect(getLastFocusSource()).toBe('keyboard');
    });

    it('should detect keyboard for arrow keys', () => {
      document.dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true })
      );
      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })
      );
      expect(isFocusVisible()).toBe(true);
    });

    it('should not treat non-navigation keys as keyboard focus', () => {
      document.dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true })
      );
      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'a', bubbles: true })
      );
      // 'a' is not a navigation key, so pointer state remains
      expect(isFocusVisible()).toBe(false);
    });
  });

  describe('focus/blur data attribute', () => {
    it('should set data-compa11yFocusVisible on focus after keyboard event', () => {
      const button = document.createElement('button');
      document.body.appendChild(button);

      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Tab', bubbles: true })
      );

      button.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
      expect(button.dataset.compa11yFocusVisible).toBe('true');
    });

    it('should NOT set data attribute on focus after pointer event', () => {
      const button = document.createElement('button');
      document.body.appendChild(button);

      document.dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true })
      );

      button.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
      expect(button.dataset.compa11yFocusVisible).toBeUndefined();
    });

    it('should remove data attribute on blur', () => {
      const button = document.createElement('button');
      document.body.appendChild(button);

      // Set visible focus
      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Tab', bubbles: true })
      );
      button.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
      expect(button.dataset.compa11yFocusVisible).toBe('true');

      // Blur
      button.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
      expect(button.dataset.compa11yFocusVisible).toBeUndefined();
    });

    it('should always show focus for text inputs regardless of input method', () => {
      const input = document.createElement('input');
      input.type = 'text';
      document.body.appendChild(input);

      // Mouse click on input
      document.dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true })
      );
      input.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
      expect(input.dataset.compa11yFocusVisible).toBe('true');
    });

    it('should always show focus for textarea', () => {
      const textarea = document.createElement('textarea');
      document.body.appendChild(textarea);

      document.dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true })
      );
      textarea.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
      expect(textarea.dataset.compa11yFocusVisible).toBe('true');
    });

    it('should always show focus for email inputs', () => {
      const input = document.createElement('input');
      input.type = 'email';
      document.body.appendChild(input);

      document.dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true })
      );
      input.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
      expect(input.dataset.compa11yFocusVisible).toBe('true');
    });

    it('should always show focus for password inputs', () => {
      const input = document.createElement('input');
      input.type = 'password';
      document.body.appendChild(input);

      document.dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true })
      );
      input.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
      expect(input.dataset.compa11yFocusVisible).toBe('true');
    });

    it('should NOT always show focus for checkbox inputs', () => {
      const input = document.createElement('input');
      input.type = 'checkbox';
      document.body.appendChild(input);

      document.dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true })
      );
      input.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
      expect(input.dataset.compa11yFocusVisible).toBeUndefined();
    });
  });

  describe('hasVisibleFocus()', () => {
    it('should return true for element with data attribute', () => {
      const el = document.createElement('div');
      el.dataset.compa11yFocusVisible = 'true';
      expect(hasVisibleFocus(el)).toBe(true);
    });

    it('should return false for element without data attribute', () => {
      const el = document.createElement('div');
      expect(hasVisibleFocus(el)).toBe(false);
    });
  });

  describe('setFocusVisible()', () => {
    it('should set data attribute when visible=true', () => {
      const el = document.createElement('div');
      setFocusVisible(el, true);
      expect(el.dataset.compa11yFocusVisible).toBe('true');
    });

    it('should remove data attribute when visible=false', () => {
      const el = document.createElement('div');
      el.dataset.compa11yFocusVisible = 'true';
      setFocusVisible(el, false);
      expect(el.dataset.compa11yFocusVisible).toBeUndefined();
    });
  });

  describe('focusWithVisibleRing()', () => {
    it('should focus element and set keyboard source', () => {
      const button = document.createElement('button');
      document.body.appendChild(button);

      // Start in pointer mode
      document.dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true })
      );
      expect(isFocusVisible()).toBe(false);

      focusWithVisibleRing(button);

      expect(isFocusVisible()).toBe(true);
      expect(getLastFocusSource()).toBe('keyboard');
      expect(document.activeElement).toBe(button);
    });
  });

  describe('visibility change', () => {
    it('should assume keyboard focus after tab becomes hidden', () => {
      // Go to pointer mode
      document.dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true })
      );
      expect(isFocusVisible()).toBe(false);

      // Simulate visibility change — jsdom has visibilityState as 'hidden' is tricky,
      // but the event fires and the handler checks document.visibilityState
      Object.defineProperty(document, 'visibilityState', {
        value: 'hidden',
        writable: true,
        configurable: true,
      });
      document.dispatchEvent(new Event('visibilitychange'));

      expect(isFocusVisible()).toBe(true);

      // Restore
      Object.defineProperty(document, 'visibilityState', {
        value: 'visible',
        writable: true,
        configurable: true,
      });
    });
  });

  describe('cleanup', () => {
    it('should remove event listeners on cleanup', () => {
      cleanup();

      const button = document.createElement('button');
      document.body.appendChild(button);

      // After cleanup, keydown should not change state
      document.dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true })
      );
      const stateAfterMouse = isFocusVisible();

      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Tab', bubbles: true })
      );

      // State should not have changed since listeners were removed
      expect(isFocusVisible()).toBe(stateAfterMouse);

      // Re-init for afterEach cleanup
      cleanup = initFocusVisible();
    });
  });
});
