import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  isFocusable,
  isTabbable,
  getFocusableElements,
  getTabbableElements,
  getFirstFocusable,
  getLastFocusable,
  getNextFocusable,
  getPreviousFocusable,
} from './dom';

describe('DOM Utilities', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('isFocusable', () => {
    it('should return true for buttons', () => {
      const button = document.createElement('button');
      container.appendChild(button);
      expect(isFocusable(button)).toBe(true);
    });

    it('should return false for disabled buttons', () => {
      const button = document.createElement('button');
      button.disabled = true;
      container.appendChild(button);
      expect(isFocusable(button)).toBe(false);
    });

    it('should return true for inputs', () => {
      const input = document.createElement('input');
      container.appendChild(input);
      expect(isFocusable(input)).toBe(true);
    });

    it('should return false for hidden inputs', () => {
      const input = document.createElement('input');
      input.type = 'hidden';
      container.appendChild(input);
      expect(isFocusable(input)).toBe(false);
    });

    it('should return true for links with href', () => {
      const link = document.createElement('a');
      link.href = '#';
      container.appendChild(link);
      expect(isFocusable(link)).toBe(true);
    });

    it('should return false for links without href', () => {
      const link = document.createElement('a');
      container.appendChild(link);
      expect(isFocusable(link)).toBe(false);
    });

    it('should return true for elements with tabindex >= 0', () => {
      const div = document.createElement('div');
      div.tabIndex = 0;
      container.appendChild(div);
      expect(isFocusable(div)).toBe(true);
    });
  });

  describe('isTabbable', () => {
    it('should return true for buttons', () => {
      const button = document.createElement('button');
      container.appendChild(button);
      expect(isTabbable(button)).toBe(true);
    });

    it('should return false for elements with tabindex=-1', () => {
      const button = document.createElement('button');
      button.tabIndex = -1;
      container.appendChild(button);
      expect(isTabbable(button)).toBe(false);
    });
  });

  describe('getFocusableElements', () => {
    it('should return all focusable elements', () => {
      container.innerHTML = `
        <button>Button</button>
        <input type="text" />
        <a href="#">Link</a>
        <div>Not focusable</div>
      `;

      const focusable = getFocusableElements(container);
      expect(focusable).toHaveLength(3);
    });

    it('should exclude disabled elements', () => {
      container.innerHTML = `
        <button>Active</button>
        <button disabled>Disabled</button>
      `;

      const focusable = getFocusableElements(container);
      expect(focusable).toHaveLength(1);
    });
  });

  describe('getTabbableElements', () => {
    it('should return tabbable elements sorted by tabindex', () => {
      container.innerHTML = `
        <button tabindex="2">Third</button>
        <button>First (default)</button>
        <button tabindex="1">Second</button>
      `;

      const tabbable = getTabbableElements(container);
      expect(tabbable).toHaveLength(3);
      expect(tabbable[0]?.textContent).toBe('Second');
      expect(tabbable[1]?.textContent).toBe('Third');
      expect(tabbable[2]?.textContent).toBe('First (default)');
    });
  });

  describe('getFirstFocusable / getLastFocusable', () => {
    it('should return first and last focusable elements', () => {
      container.innerHTML = `
        <button id="first">First</button>
        <button id="middle">Middle</button>
        <button id="last">Last</button>
      `;

      const first = getFirstFocusable(container);
      const last = getLastFocusable(container);

      expect(first?.id).toBe('first');
      expect(last?.id).toBe('last');
    });
  });

  describe('getNextFocusable / getPreviousFocusable', () => {
    it('should navigate between elements', () => {
      container.innerHTML = `
        <button id="a">A</button>
        <button id="b">B</button>
        <button id="c">C</button>
      `;

      const buttons = Array.from(container.querySelectorAll('button'));
      const [a, b, c] = buttons;

      expect(getNextFocusable(container, a!)?.id).toBe('b');
      expect(getNextFocusable(container, b!)?.id).toBe('c');
      expect(getNextFocusable(container, c!, true)?.id).toBe('a'); // wrap

      expect(getPreviousFocusable(container, c!)?.id).toBe('b');
      expect(getPreviousFocusable(container, a!, true)?.id).toBe('c'); // wrap
    });
  });
});
