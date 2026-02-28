import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import './tabs';
import type { Compa11yTabs } from './tabs';

describe('Compa11yTabs', () => {
  let tabs: Compa11yTabs;
  let tab1: HTMLButtonElement;
  let tab2: HTMLButtonElement;
  let panel1: HTMLDivElement;
  let panel2: HTMLDivElement;

  beforeEach(() => {
    tabs = document.createElement('compa11y-tabs') as Compa11yTabs;

    tab1 = document.createElement('button');
    tab1.setAttribute('role', 'tab');
    tab1.textContent = 'Tab 1';

    tab2 = document.createElement('button');
    tab2.setAttribute('role', 'tab');
    tab2.textContent = 'Tab 2';

    panel1 = document.createElement('div');
    panel1.setAttribute('role', 'tabpanel');
    panel1.textContent = 'Panel 1 content';

    panel2 = document.createElement('div');
    panel2.setAttribute('role', 'tabpanel');
    panel2.textContent = 'Panel 2 content';

    tabs.appendChild(tab1);
    tabs.appendChild(tab2);
    tabs.appendChild(panel1);
    tabs.appendChild(panel2);
    document.body.appendChild(tabs);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should be defined as a custom element', () => {
    expect(customElements.get('compa11y-tabs')).toBeDefined();
  });

  it('should set first tab as selected by default', () => {
    expect(tab1.getAttribute('aria-selected')).toBe('true');
    expect(tab2.getAttribute('aria-selected')).toBe('false');
  });

  it('should show first panel by default', () => {
    expect(panel1.hidden).toBe(false);
    expect(panel2.hidden).toBe(true);
  });

  it('should set up aria-controls on tabs', () => {
    expect(tab1.hasAttribute('aria-controls')).toBe(true);
    expect(tab2.hasAttribute('aria-controls')).toBe(true);
  });

  it('should set up aria-labelledby on panels', () => {
    expect(panel1.hasAttribute('aria-labelledby')).toBe(true);
    expect(panel2.hasAttribute('aria-labelledby')).toBe(true);
  });

  it('should switch tabs when selectTab is called', () => {
    tabs.select(1);

    expect(tab1.getAttribute('aria-selected')).toBe('false');
    expect(tab2.getAttribute('aria-selected')).toBe('true');
    expect(panel1.hidden).toBe(true);
    expect(panel2.hidden).toBe(false);
  });

  it('should emit a11y-tabs-change event when tab changes', () => {
    const handler = vi.fn();
    tabs.addEventListener('compa11y-tabs-change', handler);

    tabs.select(1);

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should set proper tabindex on tabs', () => {
    expect(tab1.getAttribute('tabindex')).toBe('0');
    expect(tab2.getAttribute('tabindex')).toBe('-1');

    tabs.select(1);

    expect(tab1.getAttribute('tabindex')).toBe('-1');
    expect(tab2.getAttribute('tabindex')).toBe('0');
  });
});
