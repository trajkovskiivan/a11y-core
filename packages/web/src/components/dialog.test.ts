import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import './dialog';
import type { Compa11yDialog } from './dialog';

describe('Compa11yDialog', () => {
  let dialog: Compa11yDialog;
  let trigger: HTMLButtonElement;

  beforeEach(() => {
    // Create external trigger (dialog uses trigger attribute, not slot)
    trigger = document.createElement('button');
    trigger.id = 'open-dialog-btn';
    trigger.textContent = 'Open Dialog';
    document.body.appendChild(trigger);

    // Create dialog with trigger attribute
    dialog = document.createElement('compa11y-dialog') as Compa11yDialog;
    dialog.setAttribute('trigger', '#open-dialog-btn');

    const title = document.createElement('span');
    title.setAttribute('slot', 'title');
    title.textContent = 'Dialog Title';

    const description = document.createElement('span');
    description.setAttribute('slot', 'description');
    description.textContent = 'Dialog description';

    dialog.appendChild(title);
    dialog.appendChild(description);
    document.body.appendChild(dialog);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should be defined as a custom element', () => {
    expect(customElements.get('compa11y-dialog')).toBeDefined();
  });

  it('should have closed state by default', () => {
    expect(dialog.open).toBe(false);
    expect(dialog.hasAttribute('open')).toBe(false);
  });

  it('should have dialog role in shadow DOM', () => {
    const dialogEl = dialog.shadowRoot?.querySelector('[role="dialog"]');
    expect(dialogEl).toBeTruthy();
    expect(dialogEl?.getAttribute('aria-modal')).toBe('true');
  });

  it('should open when show() is called', () => {
    dialog.show();
    expect(dialog.open).toBe(true);
    expect(dialog.hasAttribute('open')).toBe(true);
  });

  it('should close when close() is called', () => {
    dialog.show();
    dialog.close();
    expect(dialog.open).toBe(false);
    expect(dialog.hasAttribute('open')).toBe(false);
  });

  it('should emit a11y-dialog-open event when opened', () => {
    const handler = vi.fn();
    dialog.addEventListener('compa11y-dialog-open', handler);

    dialog.show();

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should emit a11y-dialog-close event when closed', () => {
    const handler = vi.fn();
    dialog.addEventListener('compa11y-dialog-close', handler);

    dialog.show();
    dialog.close();

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should have aria-labelledby linking to title', () => {
    const dialogEl = dialog.shadowRoot?.querySelector('[role="dialog"]');
    const labelledby = dialogEl?.getAttribute('aria-labelledby');
    expect(labelledby).toBeTruthy();

    const titleEl = dialog.shadowRoot?.getElementById(labelledby!);
    expect(titleEl).toBeTruthy();
  });

  it('should have aria-describedby linking to description', () => {
    const dialogEl = dialog.shadowRoot?.querySelector('[role="dialog"]');
    const describedby = dialogEl?.getAttribute('aria-describedby');
    expect(describedby).toBeTruthy();

    const descEl = dialog.shadowRoot?.getElementById(describedby!);
    expect(descEl).toBeTruthy();
  });
});
