import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { findFocusNeighbor, createFocusReturn } from './focus-neighbor';

describe('findFocusNeighbor', () => {
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

  it('should return previous tabbable sibling by default (prefer="previous")', () => {
    const neighbor = findFocusNeighbor(button2);
    expect(neighbor).toBe(button1);
  });

  it('should return next tabbable sibling when prefer="next"', () => {
    const neighbor = findFocusNeighbor(button2, { prefer: 'next' });
    expect(neighbor).toBe(button3);
  });

  it('should fall back to next if no previous exists', () => {
    const neighbor = findFocusNeighbor(button1);
    expect(neighbor).toBe(button2);
  });

  it('should fall back to previous if no next exists', () => {
    const neighbor = findFocusNeighbor(button3, { prefer: 'next' });
    expect(neighbor).toBe(button2);
  });

  it('should return null when no tabbable neighbors exist', () => {
    const loneContainer = document.createElement('div');
    const loneButton = document.createElement('button');
    loneButton.textContent = 'Lone';
    loneContainer.appendChild(loneButton);
    document.body.appendChild(loneContainer);

    const neighbor = findFocusNeighbor(loneButton, { scope: loneContainer });
    expect(neighbor).toBeNull();
  });

  it('should work with custom scope', () => {
    const outerContainer = document.createElement('div');
    const innerContainer = document.createElement('div');
    const outerButton = document.createElement('button');
    outerButton.textContent = 'Outer';
    const innerButton1 = document.createElement('button');
    innerButton1.textContent = 'Inner 1';
    const innerButton2 = document.createElement('button');
    innerButton2.textContent = 'Inner 2';

    innerContainer.appendChild(innerButton1);
    innerContainer.appendChild(innerButton2);
    outerContainer.appendChild(outerButton);
    outerContainer.appendChild(innerContainer);
    document.body.appendChild(outerContainer);

    // Scoped to innerContainer, outerButton should not be a candidate
    const neighbor = findFocusNeighbor(innerButton1, {
      scope: innerContainer,
    });
    expect(neighbor).toBe(innerButton2);
  });

  it('should handle disabled elements (non-tabbable reference)', () => {
    button2.disabled = true;

    // button2 is disabled, so it is not tabbable itself.
    // findFocusNeighbor should still find a neighbor relative to
    // button2's DOM position.
    const neighbor = findFocusNeighbor(button2);
    // Default prefer='previous', so button1 is the expected neighbor
    expect(neighbor).toBe(button1);
  });
});

describe('createFocusReturn', () => {
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

  it('save() should store the element', () => {
    const focusReturn = createFocusReturn();
    expect(focusReturn.element).toBeNull();

    focusReturn.save(button1);
    expect(focusReturn.element).toBe(button1);
  });

  it('save() without argument should use document.activeElement', () => {
    button2.focus();
    const focusReturn = createFocusReturn();
    focusReturn.save();
    expect(focusReturn.element).toBe(button2);
  });

  it('return() should focus the saved element', () => {
    const focusReturn = createFocusReturn();
    focusReturn.save(button1);

    // Move focus elsewhere
    button3.focus();
    expect(document.activeElement).toBe(button3);

    focusReturn.return();
    expect(document.activeElement).toBe(button1);
    // After returning, saved element should be cleared
    expect(focusReturn.element).toBeNull();
  });

  it('return() should use neighbor when saved element is disabled', () => {
    const focusReturn = createFocusReturn();
    focusReturn.save(button2);

    // Disable the saved element
    button2.disabled = true;

    focusReturn.return();
    // Default prefer='previous', so button1 is the neighbor
    expect(document.activeElement).toBe(button1);
    expect(focusReturn.element).toBeNull();
  });

  it('return() should use fallback when saved element and neighbors are gone', () => {
    const fallbackButton = document.createElement('button');
    fallbackButton.textContent = 'Fallback';
    document.body.appendChild(fallbackButton);

    const focusReturn = createFocusReturn();
    focusReturn.save(button2);

    // Remove the saved element from the DOM entirely
    button2.remove();

    focusReturn.return({ fallback: fallbackButton });
    expect(document.activeElement).toBe(fallbackButton);
    expect(focusReturn.element).toBeNull();
  });

  it('clear() should remove the saved reference', () => {
    const focusReturn = createFocusReturn();
    focusReturn.save(button1);
    expect(focusReturn.element).toBe(button1);

    focusReturn.clear();
    expect(focusReturn.element).toBeNull();
  });

  it('element getter should return current saved element', () => {
    const focusReturn = createFocusReturn();
    expect(focusReturn.element).toBeNull();

    focusReturn.save(button1);
    expect(focusReturn.element).toBe(button1);

    focusReturn.save(button2);
    expect(focusReturn.element).toBe(button2);

    focusReturn.clear();
    expect(focusReturn.element).toBeNull();
  });

  it('initializing with an element should save it immediately', () => {
    const focusReturn = createFocusReturn(button3);
    expect(focusReturn.element).toBe(button3);

    focusReturn.return();
    expect(document.activeElement).toBe(button3);
    expect(focusReturn.element).toBeNull();
  });
});
