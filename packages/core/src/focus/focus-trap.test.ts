import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createFocusTrap } from './focus-trap';

describe('createFocusTrap', () => {
  let container: HTMLDivElement;
  let button1: HTMLButtonElement;
  let button2: HTMLButtonElement;
  let button3: HTMLButtonElement;

  beforeEach(() => {
    container = document.createElement('div');
    button1 = document.createElement('button');
    button1.textContent = 'Button 1';
    button2 = document.createElement('button');
    button2.textContent = 'Button 2';
    button3 = document.createElement('button');
    button3.textContent = 'Button 3';

    container.appendChild(button1);
    container.appendChild(button2);
    container.appendChild(button3);
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should create a focus trap', () => {
    const trap = createFocusTrap(container);
    expect(trap).toBeDefined();
    expect(trap.isActive()).toBe(false);
  });

  it('should activate and focus first element', async () => {
    const trap = createFocusTrap(container);
    trap.activate();

    expect(trap.isActive()).toBe(true);

    // Wait for requestAnimationFrame
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(document.activeElement).toBe(button1);

    trap.deactivate();
  });

  it('should deactivate and restore focus', async () => {
    const outsideButton = document.createElement('button');
    document.body.appendChild(outsideButton);
    outsideButton.focus();

    const trap = createFocusTrap(container, { returnFocus: true });
    trap.activate();

    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(document.activeElement).toBe(button1);

    trap.deactivate();

    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(document.activeElement).toBe(outsideButton);
  });

  it('should call onDeactivate callback', () => {
    const onDeactivate = vi.fn();
    const trap = createFocusTrap(container, { onDeactivate });

    trap.activate();
    trap.deactivate();

    expect(onDeactivate).toHaveBeenCalledTimes(1);
  });

  it('should pause and unpause', () => {
    const trap = createFocusTrap(container);
    trap.activate();

    expect(trap.isPaused()).toBe(false);

    trap.pause();
    expect(trap.isPaused()).toBe(true);

    trap.unpause();
    expect(trap.isPaused()).toBe(false);

    trap.deactivate();
  });
});
