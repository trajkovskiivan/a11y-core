import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  normalizeKey,
  getKeyCombo,
  createKeyboardManager,
  KeyboardPatterns,
  createTypeAhead,
  createComposableKeymap,
} from './keyboard-manager';

describe('normalizeKey', () => {
  it('should normalize space to "Space"', () => {
    const event = new KeyboardEvent('keydown', { key: ' ' });
    expect(normalizeKey(event)).toBe('Space');
  });

  it('should normalize "Esc" to "Escape"', () => {
    const event = new KeyboardEvent('keydown', { key: 'Esc' });
    expect(normalizeKey(event)).toBe('Escape');
  });

  it('should normalize "Left" to "ArrowLeft"', () => {
    const event = new KeyboardEvent('keydown', { key: 'Left' });
    expect(normalizeKey(event)).toBe('ArrowLeft');
  });

  it('should normalize "Right" to "ArrowRight"', () => {
    const event = new KeyboardEvent('keydown', { key: 'Right' });
    expect(normalizeKey(event)).toBe('ArrowRight');
  });

  it('should normalize "Up" to "ArrowUp"', () => {
    const event = new KeyboardEvent('keydown', { key: 'Up' });
    expect(normalizeKey(event)).toBe('ArrowUp');
  });

  it('should normalize "Down" to "ArrowDown"', () => {
    const event = new KeyboardEvent('keydown', { key: 'Down' });
    expect(normalizeKey(event)).toBe('ArrowDown');
  });

  it('should pass through normal keys unchanged', () => {
    const event = new KeyboardEvent('keydown', { key: 'a' });
    expect(normalizeKey(event)).toBe('a');

    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    expect(normalizeKey(enterEvent)).toBe('Enter');

    const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
    expect(normalizeKey(tabEvent)).toBe('Tab');
  });
});

describe('getKeyCombo', () => {
  it('should return simple key for no modifiers', () => {
    const event = new KeyboardEvent('keydown', { key: 'a', bubbles: true });
    expect(getKeyCombo(event)).toBe('a');
  });

  it('should include Ctrl prefix', () => {
    const event = new KeyboardEvent('keydown', {
      key: 'a',
      ctrlKey: true,
      bubbles: true,
    });
    expect(getKeyCombo(event)).toBe('Ctrl+a');
  });

  it('should include multiple modifiers in order (Ctrl+Alt+Shift+Meta)', () => {
    const event = new KeyboardEvent('keydown', {
      key: 'a',
      ctrlKey: true,
      altKey: true,
      shiftKey: true,
      metaKey: true,
      bubbles: true,
    });
    expect(getKeyCombo(event)).toBe('Ctrl+Alt+Shift+Meta+a');
  });

  it('should not include modifier key as main key', () => {
    const event = new KeyboardEvent('keydown', {
      key: 'Control',
      ctrlKey: true,
      bubbles: true,
    });
    expect(getKeyCombo(event)).toBe('Ctrl');

    const shiftEvent = new KeyboardEvent('keydown', {
      key: 'Shift',
      shiftKey: true,
      bubbles: true,
    });
    expect(getKeyCombo(shiftEvent)).toBe('Shift');
  });
});

describe('createKeyboardManager', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should call handler for matching key', () => {
    const handler = vi.fn();
    const manager = createKeyboardManager({ ArrowUp: handler });
    manager.attach(container);

    container.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true })
    );

    expect(handler).toHaveBeenCalledTimes(1);
    manager.destroy();
  });

  it('should call handler for key combo (e.g., Ctrl+A)', () => {
    const handler = vi.fn();
    const manager = createKeyboardManager({ 'Ctrl+a': handler });
    manager.attach(container);

    container.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'a',
        ctrlKey: true,
        bubbles: true,
      })
    );

    expect(handler).toHaveBeenCalledTimes(1);
    manager.destroy();
  });

  it('should preventDefault and stopPropagation by default', () => {
    const handler = vi.fn();
    const manager = createKeyboardManager({ Enter: handler });
    manager.attach(container);

    const event = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
      cancelable: true,
    });
    const preventSpy = vi.spyOn(event, 'preventDefault');
    const stopSpy = vi.spyOn(event, 'stopPropagation');

    container.dispatchEvent(event);

    expect(preventSpy).toHaveBeenCalled();
    expect(stopSpy).toHaveBeenCalled();
    manager.destroy();
  });

  it('should not preventDefault when handler returns false', () => {
    const handler = vi.fn(() => false);
    const manager = createKeyboardManager({ Enter: handler });
    manager.attach(container);

    const event = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
      cancelable: true,
    });
    const preventSpy = vi.spyOn(event, 'preventDefault');
    const stopSpy = vi.spyOn(event, 'stopPropagation');

    container.dispatchEvent(event);

    expect(handler).toHaveBeenCalled();
    expect(preventSpy).not.toHaveBeenCalled();
    expect(stopSpy).not.toHaveBeenCalled();
    manager.destroy();
  });

  it('attach/detach should add/remove event listeners', () => {
    const handler = vi.fn();
    const manager = createKeyboardManager({ ArrowDown: handler });

    manager.attach(container);
    container.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })
    );
    expect(handler).toHaveBeenCalledTimes(1);

    manager.detach();
    container.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })
    );
    expect(handler).toHaveBeenCalledTimes(1);

    manager.destroy();
  });

  it('on/off should add/remove handlers dynamically', () => {
    const handler = vi.fn();
    const manager = createKeyboardManager();
    manager.attach(container);

    // Initially no handler
    container.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true })
    );
    expect(handler).not.toHaveBeenCalled();

    // Add handler dynamically
    manager.on('ArrowUp', handler);
    container.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true })
    );
    expect(handler).toHaveBeenCalledTimes(1);

    // Remove handler dynamically
    manager.off('ArrowUp');
    container.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true })
    );
    expect(handler).toHaveBeenCalledTimes(1);

    manager.destroy();
  });

  it('destroy should clean up everything', () => {
    const handler = vi.fn();
    const manager = createKeyboardManager({ Enter: handler });
    manager.attach(container);

    manager.destroy();

    container.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
    );
    expect(handler).not.toHaveBeenCalled();
  });

  it('targetSelector should filter events by target', () => {
    const handler = vi.fn();
    const manager = createKeyboardManager(
      { Enter: handler },
      { targetSelector: 'button' }
    );
    manager.attach(container);

    // Event from a div should not trigger handler
    const div = document.createElement('div');
    container.appendChild(div);
    div.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
    );
    expect(handler).not.toHaveBeenCalled();

    // Event from a button should trigger handler
    const button = document.createElement('button');
    container.appendChild(button);
    button.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
    );
    expect(handler).toHaveBeenCalledTimes(1);

    manager.destroy();
  });
});

describe('KeyboardPatterns', () => {
  it('menu pattern should have ArrowUp, ArrowDown, Enter, Space, Escape, Home, End handlers', () => {
    const handlers = KeyboardPatterns.menu({
      onUp: vi.fn(),
      onDown: vi.fn(),
      onEnter: vi.fn(),
      onEscape: vi.fn(),
      onHome: vi.fn(),
      onEnd: vi.fn(),
    });

    expect(handlers).toHaveProperty('ArrowUp');
    expect(handlers).toHaveProperty('ArrowDown');
    expect(handlers).toHaveProperty('Enter');
    expect(handlers).toHaveProperty('Space');
    expect(handlers).toHaveProperty('Escape');
    expect(handlers).toHaveProperty('Home');
    expect(handlers).toHaveProperty('End');
  });

  it('tabs pattern should have ArrowLeft, ArrowRight, Home, End handlers', () => {
    const handlers = KeyboardPatterns.tabs({
      onLeft: vi.fn(),
      onRight: vi.fn(),
      onHome: vi.fn(),
      onEnd: vi.fn(),
    });

    expect(handlers).toHaveProperty('ArrowLeft');
    expect(handlers).toHaveProperty('ArrowRight');
    expect(handlers).toHaveProperty('Home');
    expect(handlers).toHaveProperty('End');
  });

  it('dialog pattern should have Escape handler', () => {
    const handlers = KeyboardPatterns.dialog({
      onEscape: vi.fn(),
    });

    expect(handlers).toHaveProperty('Escape');
  });

  it('grid pattern should have all arrow keys + Home/End + Ctrl+Home/Ctrl+End', () => {
    const handlers = KeyboardPatterns.grid({
      onUp: vi.fn(),
      onDown: vi.fn(),
      onLeft: vi.fn(),
      onRight: vi.fn(),
      onHome: vi.fn(),
      onEnd: vi.fn(),
      onCtrlHome: vi.fn(),
      onCtrlEnd: vi.fn(),
    });

    expect(handlers).toHaveProperty('ArrowUp');
    expect(handlers).toHaveProperty('ArrowDown');
    expect(handlers).toHaveProperty('ArrowLeft');
    expect(handlers).toHaveProperty('ArrowRight');
    expect(handlers).toHaveProperty('Home');
    expect(handlers).toHaveProperty('End');
    expect(handlers).toHaveProperty('Ctrl+Home');
    expect(handlers).toHaveProperty('Ctrl+End');
  });
});

describe('createTypeAhead', () => {
  it('should match first item starting with typed character', () => {
    const typeAhead = createTypeAhead(['Apple', 'Banana', 'Cherry']);
    expect(typeAhead.type('a')).toBe('Apple');
    typeAhead.reset();
    expect(typeAhead.type('b')).toBe('Banana');
  });

  it('should accumulate characters for multi-char search', () => {
    const typeAhead = createTypeAhead(['Apple', 'Apricot', 'Banana']);
    expect(typeAhead.type('a')).toBe('Apple');
    expect(typeAhead.type('p')).toBe('Apple');
    expect(typeAhead.type('r')).toBe('Apricot');
  });

  it('should return null for no match', () => {
    const typeAhead = createTypeAhead(['Apple', 'Banana']);
    expect(typeAhead.type('z')).toBeNull();
  });

  it('should reset after timeout', () => {
    vi.useFakeTimers();

    const typeAhead = createTypeAhead(['Apple', 'Apricot', 'Banana'], {
      timeout: 500,
    });

    typeAhead.type('a');
    typeAhead.type('p');
    expect(typeAhead.getSearch()).toBe('ap');

    vi.advanceTimersByTime(500);

    expect(typeAhead.getSearch()).toBe('');
    // After reset, typing 'b' should match Banana
    expect(typeAhead.type('b')).toBe('Banana');

    vi.useRealTimers();
  });

  it('should ignore space character', () => {
    const typeAhead = createTypeAhead(['Apple', 'Banana']);
    expect(typeAhead.type(' ')).toBeNull();
    expect(typeAhead.getSearch()).toBe('');
  });
});

describe('createComposableKeymap', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should handle keys through priority-ordered layers', () => {
    const keymap = createComposableKeymap();
    const handler = vi.fn();

    keymap.add({
      id: 'layer1',
      priority: 0,
      handlers: { Escape: handler },
    });

    const event = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
    });
    const handled = keymap.handle(event);

    expect(handled).toBe(true);
    expect(handler).toHaveBeenCalledTimes(1);
    keymap.destroy();
  });

  it('higher priority layer should handle key before lower priority', () => {
    const keymap = createComposableKeymap();
    const lowHandler = vi.fn();
    const highHandler = vi.fn();

    keymap.add({
      id: 'low',
      priority: 0,
      handlers: { Escape: lowHandler },
    });

    keymap.add({
      id: 'high',
      priority: 10,
      handlers: { Escape: highHandler },
    });

    const event = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
    });
    keymap.handle(event);

    expect(highHandler).toHaveBeenCalledTimes(1);
    // Default is exclusive, so low handler should not be called
    expect(lowHandler).not.toHaveBeenCalled();
    keymap.destroy();
  });

  it('remove() should remove a layer by ID', () => {
    const keymap = createComposableKeymap();
    const handler = vi.fn();

    keymap.add({
      id: 'layer1',
      priority: 0,
      handlers: { Escape: handler },
    });

    keymap.remove('layer1');

    const event = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
    });
    const handled = keymap.handle(event);

    expect(handled).toBe(false);
    expect(handler).not.toHaveBeenCalled();
    keymap.destroy();
  });

  it('exclusive layer (default) should stop checking lower layers', () => {
    const keymap = createComposableKeymap();
    const lowHandler = vi.fn();
    const highHandler = vi.fn();

    keymap.add({
      id: 'low',
      priority: 0,
      handlers: { Enter: lowHandler },
    });

    keymap.add({
      id: 'high',
      priority: 10,
      handlers: { Enter: highHandler },
      // exclusive defaults to undefined, which is treated as true
    });

    const event = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
    });
    keymap.handle(event);

    expect(highHandler).toHaveBeenCalledTimes(1);
    expect(lowHandler).not.toHaveBeenCalled();
    keymap.destroy();
  });

  it('exclusive=false should allow lower layers to also handle', () => {
    const keymap = createComposableKeymap();
    const lowHandler = vi.fn();
    const highHandler = vi.fn();

    keymap.add({
      id: 'low',
      priority: 0,
      handlers: { Enter: lowHandler },
    });

    keymap.add({
      id: 'high',
      priority: 10,
      handlers: { Enter: highHandler },
      exclusive: false,
    });

    const event = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
    });
    keymap.handle(event);

    expect(highHandler).toHaveBeenCalledTimes(1);
    expect(lowHandler).toHaveBeenCalledTimes(1);
    keymap.destroy();
  });

  it('attach/detach should work with DOM elements', () => {
    const keymap = createComposableKeymap();
    const handler = vi.fn();

    keymap.add({
      id: 'layer1',
      priority: 0,
      handlers: { ArrowUp: handler },
    });

    keymap.attach(container);
    container.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true })
    );
    expect(handler).toHaveBeenCalledTimes(1);

    keymap.detach();
    container.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true })
    );
    expect(handler).toHaveBeenCalledTimes(1);

    keymap.destroy();
  });

  it('destroy should clean up', () => {
    const keymap = createComposableKeymap();
    const handler = vi.fn();

    keymap.add({
      id: 'layer1',
      priority: 0,
      handlers: { Escape: handler },
    });

    keymap.attach(container);
    keymap.destroy();

    container.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
    );
    expect(handler).not.toHaveBeenCalled();

    // After destroy, handle should also not find layers
    const event = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
    });
    const handled = keymap.handle(event);
    expect(handled).toBe(false);
  });
});
