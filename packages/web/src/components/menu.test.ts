import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import './menu';
import type { A11yMenu } from './menu';

describe('A11yMenu', () => {
  let menu: A11yMenu;
  let trigger: HTMLButtonElement;
  let item1: HTMLButtonElement;
  let item2: HTMLButtonElement;

  beforeEach(() => {
    menu = document.createElement('a11y-menu') as A11yMenu;
    trigger = document.createElement('button');
    trigger.setAttribute('slot', 'trigger');
    trigger.textContent = 'Open Menu';

    item1 = document.createElement('button');
    item1.setAttribute('role', 'menuitem');
    item1.textContent = 'Item 1';

    item2 = document.createElement('button');
    item2.setAttribute('role', 'menuitem');
    item2.textContent = 'Item 2';

    menu.appendChild(trigger);
    menu.appendChild(item1);
    menu.appendChild(item2);
    document.body.appendChild(menu);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should be defined as a custom element', () => {
    expect(customElements.get('a11y-menu')).toBeDefined();
  });

  it('should have closed state by default', () => {
    expect(menu.open).toBe(false);
    expect(menu.hasAttribute('open')).toBe(false);
  });

  it('should have aria-haspopup on trigger', () => {
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('should open when show() is called', () => {
    menu.show();
    expect(menu.open).toBe(true);
    expect(menu.hasAttribute('open')).toBe(true);
  });

  it('should close when close() is called', () => {
    menu.show();
    menu.close();
    expect(menu.open).toBe(false);
    expect(menu.hasAttribute('open')).toBe(false);
  });

  it('should toggle state', () => {
    expect(menu.open).toBe(false);
    menu.toggle();
    expect(menu.open).toBe(true);
    menu.toggle();
    expect(menu.open).toBe(false);
  });

  it('should emit a11y-menu-open event when opened', () => {
    const handler = vi.fn();
    menu.addEventListener('a11y-menu-open', handler);

    menu.show();

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should emit a11y-menu-close event when closed', () => {
    const handler = vi.fn();
    menu.addEventListener('a11y-menu-close', handler);

    menu.show();
    menu.close();

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should set tabindex on menu items', () => {
    menu.show();
    expect(item1.getAttribute('tabindex')).toBe('-1');
    expect(item2.getAttribute('tabindex')).toBe('-1');
  });
});
