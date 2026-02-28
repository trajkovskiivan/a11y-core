/**
 * compa11y Accordion Web Component
 *
 * Usage:
 * <compa11y-accordion type="single" collapsible>
 *   <h3>
 *     <button data-accordion-trigger>Section 1</button>
 *   </h3>
 *   <div data-accordion-panel>Content 1</div>
 *
 *   <h3>
 *     <button data-accordion-trigger>Section 2</button>
 *   </h3>
 *   <div data-accordion-panel>Content 2</div>
 * </compa11y-accordion>
 *
 * Without headings (button as direct child):
 * <compa11y-accordion>
 *   <button data-accordion-trigger>Section 1</button>
 *   <div data-accordion-panel>Content 1</div>
 * </compa11y-accordion>
 */

import { announce, createComponentWarnings } from '@compa11y/core';
import { Compa11yElement, defineElement } from '../utils/base-element';
import { BASE_STYLES, ACCORDION_GLOBAL_STYLES } from '../utils/styles';

const warn = createComponentWarnings('Compa11yAccordion');

// Inject global (light DOM) styles once per document
let _globalStylesInjected = false;

function ensureGlobalStyles(): void {
  if (_globalStylesInjected || typeof document === 'undefined') return;
  _globalStylesInjected = true;
  const style = document.createElement('style');
  style.setAttribute('data-compa11y-accordion', '');
  style.textContent = ACCORDION_GLOBAL_STYLES;
  document.head.appendChild(style);
}

export class Compa11yAccordion extends Compa11yElement {
  private _triggers: HTMLElement[] = [];
  private _panels: HTMLElement[] = [];
  private _openItems: Set<number> = new Set();
  private _defaultSlotEl: Element | null = null;

  static get observedAttributes() {
    return ['type', 'collapsible'];
  }

  /** Whether one or multiple items can be open at once. @default 'single' */
  get type(): 'single' | 'multiple' {
    return (
      (this.getAttribute('type') as 'single' | 'multiple') || 'single'
    );
  }

  /** Whether the open item can be collapsed in single mode. */
  get collapsible(): boolean {
    return this.hasAttribute('collapsible');
  }

  protected setupAccessibility(): void {
    ensureGlobalStyles();
    this.updateItems();
  }

  protected render(): void {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }
    this.shadowRoot!.innerHTML = `
      <style>
        ${BASE_STYLES}
        :host {
          display: block;
        }
      </style>
      <slot></slot>
    `;
  }

  protected setupEventListeners(): void {
    this.addEventListener('click', this.handleClick);
    this.addEventListener('keydown', this.handleKeyDown);

    this._defaultSlotEl =
      this.shadowRoot?.querySelector('slot') ?? null;
    this._defaultSlotEl?.addEventListener('slotchange', this.updateItems);
  }

  protected cleanupEventListeners(): void {
    this.removeEventListener('click', this.handleClick);
    this.removeEventListener('keydown', this.handleKeyDown);
    this._defaultSlotEl?.removeEventListener(
      'slotchange',
      this.updateItems
    );
  }

  protected onAttributeChange(
    name: string,
    _oldValue: string | null,
    _newValue: string | null
  ): void {
    if (name === 'type') {
      // Changing type resets open state
      this._openItems.clear();
      this.syncState();
    }
  }

  private updateItems = (): void => {
    this._triggers = Array.from(
      this.querySelectorAll<HTMLElement>('[data-accordion-trigger]')
    );
    this._panels = Array.from(
      this.querySelectorAll<HTMLElement>('[data-accordion-panel]')
    );

    // Wire up ARIA relationships
    this._triggers.forEach((trigger, index) => {
      const panel = this._panels[index];
      const triggerId =
        trigger.id || `${this._id}-trigger-${index}`;
      const panelId = panel?.id || `${this._id}-panel-${index}`;

      trigger.id = triggerId;

      if (!trigger.getAttribute('aria-controls')) {
        trigger.setAttribute('aria-controls', panelId);
      }

      const isExpanded = this._openItems.has(index);
      trigger.setAttribute('aria-expanded', String(isExpanded));

      if (panel) {
        panel.id = panelId;
        if (!panel.getAttribute('role')) {
          panel.setAttribute('role', 'region');
        }
        if (!panel.getAttribute('aria-labelledby')) {
          panel.setAttribute('aria-labelledby', triggerId);
        }
        panel.hidden = !isExpanded;
      }

      // Dev-time: warn if trigger has no accessible name
      warn.checks.accessibleLabel(
        trigger,
        `a11y-accordion trigger[${index}]`
      );
    });
  };

  private handleClick = (event: Event): void => {
    const target = event.target as HTMLElement;
    const trigger = target.closest(
      '[data-accordion-trigger]'
    ) as HTMLElement | null;
    if (!trigger) return;

    const isDisabled =
      trigger.hasAttribute('disabled') ||
      trigger.getAttribute('aria-disabled') === 'true';
    if (isDisabled) return;

    const index = this._triggers.indexOf(trigger);
    if (index !== -1) {
      this.toggleItem(index);
    }
  };

  private handleKeyDown = (event: KeyboardEvent): void => {
    const target = event.target as HTMLElement;
    const trigger = target.closest(
      '[data-accordion-trigger]'
    ) as HTMLElement | null;
    if (!trigger) return;

    const currentIndex = this._triggers.indexOf(trigger);
    if (currentIndex === -1) return;

    const enabledTriggers = this._triggers.filter(
      (t) =>
        !t.hasAttribute('disabled') &&
        t.getAttribute('aria-disabled') !== 'true'
    );
    const currentEnabledIndex = enabledTriggers.indexOf(trigger);
    if (currentEnabledIndex === -1) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        enabledTriggers[
          (currentEnabledIndex + 1) % enabledTriggers.length
        ]?.focus();
        break;
      case 'ArrowUp':
        event.preventDefault();
        enabledTriggers[
          (currentEnabledIndex - 1 + enabledTriggers.length) %
            enabledTriggers.length
        ]?.focus();
        break;
      case 'Home':
        event.preventDefault();
        enabledTriggers[0]?.focus();
        break;
      case 'End':
        event.preventDefault();
        enabledTriggers[enabledTriggers.length - 1]?.focus();
        break;
    }
  };

  private toggleItem(index: number): void {
    const wasOpen = this._openItems.has(index);

    // Determine which panels will close so we can restore focus if needed.
    const closingIndices: number[] = [];
    if (this.type === 'single') {
      if (wasOpen && this.collapsible) {
        closingIndices.push(index);
      } else if (!wasOpen) {
        // All currently open panels will close
        this._openItems.forEach((i) => closingIndices.push(i));
      }
    } else {
      if (wasOpen) {
        closingIndices.push(index);
      }
    }

    // Check if focus is inside any panel that is about to close
    const activeEl = document.activeElement;
    const focusedClosingIndex = closingIndices.find((i) => {
      const panel = this._panels[i];
      return panel && panel.contains(activeEl);
    });

    // Update open state
    if (this.type === 'single') {
      if (wasOpen) {
        if (this.collapsible) {
          this._openItems.delete(index);
        }
        // Without collapsible, clicking the open item does nothing
      } else {
        this._openItems.clear();
        this._openItems.add(index);
      }
    } else {
      if (wasOpen) {
        this._openItems.delete(index);
      } else {
        this._openItems.add(index);
      }
    }

    this.syncState();

    // Return focus to the trigger whose panel closed while focus was inside
    if (focusedClosingIndex !== undefined) {
      requestAnimationFrame(() => {
        this._triggers[focusedClosingIndex]?.focus();
      });
    }

    const isNowOpen = this._openItems.has(index);
    const label =
      this._triggers[index]?.textContent?.trim() || 'Section';
    announce(`${label} ${isNowOpen ? 'expanded' : 'collapsed'}`);

    this.emit('compa11y-accordion-change', {
      index,
      expanded: isNowOpen,
      trigger: this._triggers[index],
      panel: this._panels[index],
    });
  }

  private syncState(): void {
    this._triggers.forEach((trigger, index) => {
      const panel = this._panels[index];
      const isExpanded = this._openItems.has(index);
      trigger.setAttribute('aria-expanded', String(isExpanded));
      if (panel) {
        panel.hidden = !isExpanded;
      }
    });
  }

  /** Open an item by index */
  open(index: number): void {
    if (this.type === 'single') {
      this._openItems.clear();
    }
    this._openItems.add(index);
    this.syncState();
  }

  /** Close an item by index */
  close(index: number): void {
    this._openItems.delete(index);
    this.syncState();
  }

  /** Toggle an item by index */
  toggle(index: number): void {
    this.toggleItem(index);
  }
}

defineElement('compa11y-accordion', Compa11yAccordion);

export default Compa11yAccordion;
