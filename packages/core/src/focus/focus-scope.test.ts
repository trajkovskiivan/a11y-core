import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createFocusScope, createRovingTabindex } from './focus-scope';

describe('createFocusScope', () => {
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

  it('should create a focus scope', () => {
    const scope = createFocusScope(container);
    expect(scope).toBeDefined();
    expect(scope.focusFirst).toBeTypeOf('function');
    expect(scope.focusLast).toBeTypeOf('function');
    expect(scope.focusNext).toBeTypeOf('function');
    expect(scope.focusPrevious).toBeTypeOf('function');
    expect(scope.focusAt).toBeTypeOf('function');
    expect(scope.getFocused).toBeTypeOf('function');
    expect(scope.getElements).toBeTypeOf('function');
    expect(scope.destroy).toBeTypeOf('function');
  });

  it('focusFirst() should focus the first tabbable element', () => {
    const scope = createFocusScope(container);
    scope.focusFirst();
    expect(document.activeElement).toBe(button1);
    scope.destroy();
  });

  it('focusLast() should focus the last tabbable element', () => {
    const scope = createFocusScope(container);
    scope.focusLast();
    expect(document.activeElement).toBe(button3);
    scope.destroy();
  });

  it('focusNext() should move to next element', () => {
    const scope = createFocusScope(container);
    scope.focusFirst();
    expect(document.activeElement).toBe(button1);

    scope.focusNext();
    expect(document.activeElement).toBe(button2);

    scope.focusNext();
    expect(document.activeElement).toBe(button3);

    scope.destroy();
  });

  it('focusPrevious() should move to previous element', () => {
    const scope = createFocusScope(container);
    scope.focusLast();
    expect(document.activeElement).toBe(button3);

    scope.focusPrevious();
    expect(document.activeElement).toBe(button2);

    scope.focusPrevious();
    expect(document.activeElement).toBe(button1);

    scope.destroy();
  });

  it('focusNext() should wrap around when wrap=true (default)', () => {
    const scope = createFocusScope(container);
    scope.focusLast();
    expect(document.activeElement).toBe(button3);

    scope.focusNext({ wrap: true });
    expect(document.activeElement).toBe(button1);

    scope.destroy();
  });

  it('focusAt() should focus element at specific index', () => {
    const scope = createFocusScope(container);

    scope.focusAt(0);
    expect(document.activeElement).toBe(button1);

    scope.focusAt(1);
    expect(document.activeElement).toBe(button2);

    scope.focusAt(2);
    expect(document.activeElement).toBe(button3);

    scope.destroy();
  });

  it('getElements() should return tabbable elements', () => {
    const scope = createFocusScope(container);
    const elements = scope.getElements();

    expect(elements).toHaveLength(3);
    expect(elements).toContain(button1);
    expect(elements).toContain(button2);
    expect(elements).toContain(button3);

    scope.destroy();
  });

  it('getFocused() should return currently focused element within scope', () => {
    const scope = createFocusScope(container);

    expect(scope.getFocused()).toBeNull();

    button2.focus();
    expect(scope.getFocused()).toBe(button2);

    // Focus something outside the scope
    const outsideButton = document.createElement('button');
    document.body.appendChild(outsideButton);
    outsideButton.focus();
    expect(scope.getFocused()).toBeNull();

    scope.destroy();
  });

  it('destroy() should restore focus when restoreFocus=true', () => {
    const outsideButton = document.createElement('button');
    document.body.appendChild(outsideButton);
    outsideButton.focus();
    expect(document.activeElement).toBe(outsideButton);

    const scope = createFocusScope(container, { restoreFocus: true });
    scope.focusFirst();
    expect(document.activeElement).toBe(button1);

    scope.destroy();
    expect(document.activeElement).toBe(outsideButton);
  });

  it('contain=true should trap Tab key within scope', () => {
    const scope = createFocusScope(container, { contain: true });

    // Focus the last element
    button3.focus();
    expect(document.activeElement).toBe(button3);

    // Simulate Tab from last element — should wrap to first
    const tabEvent = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(tabEvent);
    expect(document.activeElement).toBe(button1);

    // Simulate Shift+Tab from first element — should wrap to last
    const shiftTabEvent = new KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(shiftTabEvent);
    expect(document.activeElement).toBe(button3);

    scope.destroy();
  });

  it('autoFocus=true should auto-focus the first element', async () => {
    const scope = createFocusScope(container, { autoFocus: true });

    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(document.activeElement).toBe(button1);

    scope.destroy();
  });
});

describe('createRovingTabindex', () => {
  let container: HTMLDivElement;
  let item1: HTMLButtonElement;
  let item2: HTMLButtonElement;
  let item3: HTMLButtonElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.setAttribute('role', 'toolbar');

    item1 = document.createElement('button');
    item1.textContent = 'Item 1';
    item1.classList.add('item');
    item2 = document.createElement('button');
    item2.textContent = 'Item 2';
    item2.classList.add('item');
    item3 = document.createElement('button');
    item3.textContent = 'Item 3';
    item3.classList.add('item');

    container.appendChild(item1);
    container.appendChild(item2);
    container.appendChild(item3);
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should initialize tabindex attributes (first=0, rest=-1)', () => {
    const roving = createRovingTabindex(container, '.item');

    expect(item1.getAttribute('tabindex')).toBe('0');
    expect(item2.getAttribute('tabindex')).toBe('-1');
    expect(item3.getAttribute('tabindex')).toBe('-1');

    roving.destroy();
  });

  it('next() should move to next item and update tabindex', () => {
    const roving = createRovingTabindex(container, '.item');

    roving.next();

    expect(item1.getAttribute('tabindex')).toBe('-1');
    expect(item2.getAttribute('tabindex')).toBe('0');
    expect(document.activeElement).toBe(item2);

    roving.destroy();
  });

  it('previous() should move to previous item', () => {
    const roving = createRovingTabindex(container, '.item', {
      initialIndex: 2,
    });

    roving.previous();

    expect(item2.getAttribute('tabindex')).toBe('0');
    expect(item3.getAttribute('tabindex')).toBe('-1');
    expect(document.activeElement).toBe(item2);

    roving.destroy();
  });

  it('first() and last() should move to first/last items', () => {
    const roving = createRovingTabindex(container, '.item', {
      initialIndex: 1,
    });

    roving.last();
    expect(document.activeElement).toBe(item3);
    expect(item3.getAttribute('tabindex')).toBe('0');
    expect(item2.getAttribute('tabindex')).toBe('-1');

    roving.first();
    expect(document.activeElement).toBe(item1);
    expect(item1.getAttribute('tabindex')).toBe('0');
    expect(item3.getAttribute('tabindex')).toBe('-1');

    roving.destroy();
  });

  it('goto() should move to specific index', () => {
    const roving = createRovingTabindex(container, '.item');

    roving.goto(2);
    expect(document.activeElement).toBe(item3);
    expect(item3.getAttribute('tabindex')).toBe('0');
    expect(item1.getAttribute('tabindex')).toBe('-1');

    roving.goto(0);
    expect(document.activeElement).toBe(item1);
    expect(item1.getAttribute('tabindex')).toBe('0');
    expect(item3.getAttribute('tabindex')).toBe('-1');

    roving.destroy();
  });

  it('should wrap around by default', () => {
    const roving = createRovingTabindex(container, '.item', {
      initialIndex: 2,
    });

    roving.next();
    expect(document.activeElement).toBe(item1);
    expect(item1.getAttribute('tabindex')).toBe('0');

    roving.previous();
    expect(document.activeElement).toBe(item3);
    expect(item3.getAttribute('tabindex')).toBe('0');

    roving.destroy();
  });

  it('wrap=false should clamp at boundaries', () => {
    const roving = createRovingTabindex(container, '.item', {
      wrap: false,
      initialIndex: 0,
    });

    roving.previous();
    expect(document.activeElement).toBe(item1);
    expect(roving.getIndex()).toBe(0);

    roving.goto(2);
    roving.next();
    expect(document.activeElement).toBe(item3);
    expect(roving.getIndex()).toBe(2);

    roving.destroy();
  });

  it('should handle ArrowRight/ArrowLeft for horizontal orientation', () => {
    const roving = createRovingTabindex(container, '.item', {
      orientation: 'horizontal',
    });

    item1.focus();

    item1.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      bubbles: true,
      cancelable: true,
    }));
    expect(document.activeElement).toBe(item2);

    item2.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'ArrowLeft',
      bubbles: true,
      cancelable: true,
    }));
    expect(document.activeElement).toBe(item1);

    // ArrowDown should not move in horizontal orientation
    item1.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'ArrowDown',
      bubbles: true,
      cancelable: true,
    }));
    expect(document.activeElement).toBe(item1);

    roving.destroy();
  });

  it('should handle ArrowDown/ArrowUp for vertical orientation', () => {
    const roving = createRovingTabindex(container, '.item', {
      orientation: 'vertical',
    });

    item1.focus();

    item1.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'ArrowDown',
      bubbles: true,
      cancelable: true,
    }));
    expect(document.activeElement).toBe(item2);

    item2.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'ArrowUp',
      bubbles: true,
      cancelable: true,
    }));
    expect(document.activeElement).toBe(item1);

    // ArrowRight should not move in vertical orientation
    item1.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      bubbles: true,
      cancelable: true,
    }));
    expect(document.activeElement).toBe(item1);

    roving.destroy();
  });

  it('Home/End keys should go to first/last', () => {
    const roving = createRovingTabindex(container, '.item');

    item1.focus();

    item1.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'End',
      bubbles: true,
      cancelable: true,
    }));
    expect(document.activeElement).toBe(item3);

    item3.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'Home',
      bubbles: true,
      cancelable: true,
    }));
    expect(document.activeElement).toBe(item1);

    roving.destroy();
  });

  it('getIndex() should return current index', () => {
    const roving = createRovingTabindex(container, '.item', {
      initialIndex: 1,
    });

    expect(roving.getIndex()).toBe(1);

    roving.next();
    expect(roving.getIndex()).toBe(2);

    roving.first();
    expect(roving.getIndex()).toBe(0);

    roving.destroy();
  });

  it('update() should refresh element list', () => {
    const roving = createRovingTabindex(container, '.item');

    const item4 = document.createElement('button');
    item4.textContent = 'Item 4';
    item4.classList.add('item');
    container.appendChild(item4);

    roving.update();

    // New element should have tabindex=-1
    expect(item4.getAttribute('tabindex')).toBe('-1');

    // Should be able to navigate to the new element
    roving.goto(3);
    expect(document.activeElement).toBe(item4);
    expect(item4.getAttribute('tabindex')).toBe('0');

    roving.destroy();
  });

  it('destroy() should remove event listeners', () => {
    const roving = createRovingTabindex(container, '.item');

    roving.destroy();

    item1.focus();

    const rightEvent = new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      bubbles: true,
      cancelable: true,
    });
    container.dispatchEvent(rightEvent);

    // Focus should not have moved because listeners were removed
    expect(document.activeElement).toBe(item1);
  });

  it('onSelectionChange callback should fire on move', () => {
    const onChange = vi.fn();
    const roving = createRovingTabindex(container, '.item', {
      onSelectionChange: onChange,
    });

    roving.next();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(1, item2);

    roving.next();
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenCalledWith(2, item3);

    roving.last();
    expect(onChange).toHaveBeenCalledTimes(3);
    expect(onChange).toHaveBeenCalledWith(2, item3);

    roving.first();
    expect(onChange).toHaveBeenCalledTimes(4);
    expect(onChange).toHaveBeenCalledWith(0, item1);

    roving.destroy();
  });
});
