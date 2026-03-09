/**
 * compa11y Pagination Web Component
 *
 * Usage:
 * <compa11y-pagination
 *   current-page="3"
 *   total-pages="24"
 * ></compa11y-pagination>
 *
 * Events:
 *   page-change      → { page: number }
 *   page-size-change → { pageSize: number }
 */

import { announcePolite, createComponentWarnings } from '@compa11y/core';
import { Compa11yElement, defineElement } from '../utils/base-element';
import { PAGINATION_STYLES } from '../utils/styles';

const warn = createComponentWarnings('Pagination');

// --------------------------------------------------------------------------
// Page range algorithm (duplicated from React package — no shared dep)
// --------------------------------------------------------------------------

type PageItem = number | 'ellipsis-start' | 'ellipsis-end';

function getPageRange(
  currentPage: number,
  totalPages: number,
  siblingCount: number,
  boundaryCount: number
): PageItem[] {
  if (totalPages <= 0) return [];
  if (totalPages === 1) return [1];

  const pagesToShow = new Set<number>();

  for (let i = 1; i <= Math.min(boundaryCount, totalPages); i++) {
    pagesToShow.add(i);
  }
  for (
    let i = Math.max(totalPages - boundaryCount + 1, 1);
    i <= totalPages;
    i++
  ) {
    pagesToShow.add(i);
  }
  for (
    let i = Math.max(currentPage - siblingCount, 1);
    i <= Math.min(currentPage + siblingCount, totalPages);
    i++
  ) {
    pagesToShow.add(i);
  }

  const sorted = Array.from(pagesToShow).sort((a, b) => a - b);
  const result: PageItem[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    const prev = sorted[i - 1];

    if (current === undefined) continue;

    if (prev !== undefined) {
      const gap = current - prev;
      if (gap === 2) {
        result.push(prev + 1);
      } else if (gap > 2) {
        const midpoint = (prev + current) / 2;
        result.push(midpoint < currentPage ? 'ellipsis-start' : 'ellipsis-end');
      }
    }
    result.push(current);
  }

  return result;
}

// --------------------------------------------------------------------------
// Web Component
// --------------------------------------------------------------------------

export class Compa11yPagination extends Compa11yElement {
  private _currentPage = 1;
  private _totalPages = 1;
  private _totalItems: number | null = null;
  private _pageSize = 25;
  private _siblingCount = 1;
  private _boundaryCount = 1;
  private _showFirstLast = false;
  private _showPageSize = false;
  private _showJumpTo = false;
  private _disabled = false;
  private _pageSizeOptions: number[] = [10, 25, 50];

  static get observedAttributes(): string[] {
    return [
      'current-page',
      'total-pages',
      'total-items',
      'page-size',
      'page-size-options',
      'show-first-last',
      'show-page-size',
      'show-jump-to',
      'sibling-count',
      'boundary-count',
      'disabled',
      'aria-label',
    ];
  }

  // ------------------------------------------------------------------
  // Attribute-backed properties
  // ------------------------------------------------------------------

  get currentPage(): number {
    return this._currentPage;
  }
  set currentPage(value: number) {
    const clamped = Math.max(1, Math.min(value, this._totalPages));
    if (clamped !== this._currentPage) {
      this._currentPage = clamped;
      this._syncUI();
    }
  }

  get totalPages(): number {
    return this._totalPages;
  }
  set totalPages(value: number) {
    this._totalPages = Math.max(1, value);
    this._syncUI();
  }

  // ------------------------------------------------------------------
  // Lifecycle
  // ------------------------------------------------------------------

  protected setupAccessibility(): void {
    // Attribute values are read before render() runs
    this._readAttributes();
  }

  protected render(): void {
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>${PAGINATION_STYLES}</style>
      <nav part="nav" data-compa11y-pagination>
        <span
          id="${this._id}-label"
          class="sr-only"
          part="nav-label"
          data-compa11y-pagination-label
        ><slot name="label">${this._ariaLabel()}</slot></span>
        <div
          class="sr-only"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          part="live-region"
        ></div>
        <ul part="list"></ul>
        <div class="extras" part="extras"></div>
      </nav>
    `;
    this._syncUI();
  }

  protected setupEventListeners(): void {
    const root = this.shadowRoot as EventTarget | null;
    root?.addEventListener('click', this._handleClick as EventListener);
    root?.addEventListener('change', this._handleChange as EventListener);
    root?.addEventListener('keydown', this._handleKeyDown as EventListener);
  }

  protected cleanupEventListeners(): void {
    const root = this.shadowRoot as EventTarget | null;
    root?.removeEventListener('click', this._handleClick as EventListener);
    root?.removeEventListener('change', this._handleChange as EventListener);
    root?.removeEventListener('keydown', this._handleKeyDown as EventListener);
  }

  protected onAttributeChange(
    name: string,
    _oldValue: string | null,
    newValue: string | null
  ): void {
    switch (name) {
      case 'current-page':
        this._currentPage = Math.max(
          1,
          Math.min(parseInt(newValue ?? '1', 10), this._totalPages)
        );
        break;
      case 'total-pages':
        this._totalPages = Math.max(1, parseInt(newValue ?? '1', 10));
        break;
      case 'total-items':
        this._totalItems = newValue != null ? parseInt(newValue, 10) : null;
        this._recomputeTotalPages();
        break;
      case 'page-size':
        this._pageSize = Math.max(1, parseInt(newValue ?? '25', 10));
        this._recomputeTotalPages();
        break;
      case 'page-size-options':
        if (newValue) {
          this._pageSizeOptions = newValue
            .split(',')
            .map((s) => parseInt(s.trim(), 10))
            .filter((n) => !isNaN(n) && n > 0);
        }
        break;
      case 'show-first-last':
        this._showFirstLast = newValue !== null;
        break;
      case 'show-page-size':
        this._showPageSize = newValue !== null;
        break;
      case 'show-jump-to':
        this._showJumpTo = newValue !== null;
        break;
      case 'sibling-count':
        this._siblingCount = Math.max(0, parseInt(newValue ?? '1', 10));
        break;
      case 'boundary-count':
        this._boundaryCount = Math.max(0, parseInt(newValue ?? '1', 10));
        break;
      case 'disabled':
        this._disabled = newValue !== null;
        break;
      case 'aria-label': {
        // Update fallback text in the label slot
        const labelEl = this.shadowRoot?.querySelector('[data-compa11y-pagination-label] slot[name="label"]');
        if (labelEl) {
          const fallback = labelEl.childNodes[0];
          if (fallback) fallback.textContent = newValue ?? 'Pagination';
        }
        return; // No full re-render needed
      }
    }
    this._syncUI();
  }

  // ------------------------------------------------------------------
  // Internal helpers
  // ------------------------------------------------------------------

  private _readAttributes(): void {
    const attr = (name: string) => this.getAttribute(name);

    this._currentPage = Math.max(1, parseInt(attr('current-page') ?? '1', 10));
    this._totalPages = Math.max(1, parseInt(attr('total-pages') ?? '1', 10));
    this._totalItems =
      attr('total-items') != null
        ? parseInt(attr('total-items')!, 10)
        : null;
    this._pageSize = Math.max(1, parseInt(attr('page-size') ?? '25', 10));
    this._siblingCount = Math.max(
      0,
      parseInt(attr('sibling-count') ?? '1', 10)
    );
    this._boundaryCount = Math.max(
      0,
      parseInt(attr('boundary-count') ?? '1', 10)
    );
    this._showFirstLast = this.hasAttribute('show-first-last');
    this._showPageSize = this.hasAttribute('show-page-size');
    this._showJumpTo = this.hasAttribute('show-jump-to');
    this._disabled = this.hasAttribute('disabled');

    const pageSizeOptionsAttr = attr('page-size-options');
    if (pageSizeOptionsAttr) {
      this._pageSizeOptions = pageSizeOptionsAttr
        .split(',')
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n) && n > 0);
    }

    this._recomputeTotalPages();
    this._devWarnings();
  }

  private _recomputeTotalPages(): void {
    if (this._totalItems != null) {
      this._totalPages = Math.max(
        1,
        Math.ceil(this._totalItems / this._pageSize)
      );
    }
  }

  private _devWarnings(): void {
    const hasTotal =
      this.hasAttribute('total-pages') || this.hasAttribute('total-items');
    if (!hasTotal) {
      warn.error(
        'Either total-pages or total-items attribute is required.',
        'Add total-pages="n" or total-items="n" to <compa11y-pagination>.'
      );
    }
  }

  private _ariaLabel(): string {
    return this.getAttribute('aria-label') ?? 'Pagination';
  }

  private _announce(message: string): void {
    const region = this.shadowRoot?.querySelector('[role="status"]');
    if (!region) return;
    region.textContent = message;
    setTimeout(() => {
      region.textContent = '';
    }, 1000);
  }

  private _goToPage(p: number, refocusAction?: string): void {
    if (p < 1 || p > this._totalPages || p === this._currentPage) return;
    this._currentPage = p;
    this._syncUI();
    // Defer focus restoration to the next animation frame.
    // When ul.innerHTML is replaced the focused button is destroyed, causing the
    // browser to queue its own focus-move task (to the shadow host / body).
    // That queued task runs after our synchronous handler returns and would
    // override a synchronous .focus() call. requestAnimationFrame fires after
    // the browser has settled its focus management, so our restoration wins.
    if (refocusAction !== undefined) {
      const action = refocusAction;
      requestAnimationFrame(() => this._restoreFocus(action, p));
    }
    this._announce(`Page ${p} of ${this._totalPages}`);
    this.emit('page-change', { page: p });
  }

  private _restoreFocus(action: string, page: number): void {
    if (!this.shadowRoot) return;
    let btn: HTMLElement | null = null;

    if (action === 'page') {
      btn = this.shadowRoot.querySelector(`button[data-page="${page}"]`);
    } else {
      btn = this.shadowRoot.querySelector(`button[data-action="${action}"]`);
      // If the button we wanted is now disabled (e.g. Prev at page 1),
      // focus the opposite directional button instead.
      if (btn && (btn as HTMLButtonElement).disabled) {
        if (action === 'prev' || action === 'first') {
          btn =
            this.shadowRoot.querySelector('button[data-action="next"]:not([disabled])') ??
            this.shadowRoot.querySelector('button[data-action="last"]:not([disabled])');
        } else {
          btn =
            this.shadowRoot.querySelector('button[data-action="prev"]:not([disabled])') ??
            this.shadowRoot.querySelector('button[data-action="first"]:not([disabled])');
        }
      }
    }

    (btn as HTMLElement | null)?.focus();
  }

  // ------------------------------------------------------------------
  // Full UI sync
  // ------------------------------------------------------------------

  private _syncUI(): void {
    if (!this.shadowRoot) return;

    const nav = this.shadowRoot.querySelector('nav');
    if (nav) nav.setAttribute('aria-labelledby', `${this._id}-label`);

    // Update the label slot fallback text
    const labelSlot = this.shadowRoot.querySelector('[data-compa11y-pagination-label]');
    if (labelSlot) {
      const slot = labelSlot.querySelector('slot[name="label"]');
      if (slot) {
        // Update default text; slotted content takes priority automatically
        const fallback = slot.childNodes[0];
        if (fallback) fallback.textContent = this._ariaLabel();
      }
    }

    this._renderList();
    this._renderExtras();
  }

  private _renderList(): void {
    const ul = this.shadowRoot?.querySelector('ul');
    if (!ul) return;

    const isFirst = this._currentPage <= 1;
    const isLast = this._currentPage >= this._totalPages;
    const d = this._disabled;

    const items: string[] = [];

    if (this._showFirstLast) {
      items.push(
        `<li>
          <button
            type="button"
            aria-label="First page"
            data-compa11y-pagination-btn
            data-action="first"
            ${isFirst || d ? 'disabled' : ''}
            part="btn btn-first"
          ><slot name="first-label">\u00AB</slot></button>
        </li>`
      );
    }

    items.push(
      `<li>
        <button
          type="button"
          aria-label="Previous page"
          data-compa11y-pagination-btn
          data-action="prev"
          ${isFirst || d ? 'disabled' : ''}
          part="btn btn-prev"
        ><slot name="prev-label">\u2039</slot></button>
      </li>`
    );

    const range = getPageRange(
      this._currentPage,
      this._totalPages,
      this._siblingCount,
      this._boundaryCount
    );

    for (const item of range) {
      if (item === 'ellipsis-start' || item === 'ellipsis-end') {
        items.push(
          `<li aria-hidden="true" part="ellipsis"><span>…</span></li>`
        );
        continue;
      }
      const isCurrent = item === this._currentPage;
      items.push(
        `<li>
          <button
            type="button"
            aria-label="Page ${item}"
            ${isCurrent ? 'aria-current="page"' : ''}
            ${d ? 'disabled' : ''}
            data-compa11y-pagination-btn
            data-compa11y-pagination-page
            data-current="${isCurrent}"
            data-action="page"
            data-page="${item}"
            part="btn btn-page${isCurrent ? ' btn-current' : ''}"
          >${item}</button>
        </li>`
      );
    }

    items.push(
      `<li>
        <button
          type="button"
          aria-label="Next page"
          data-compa11y-pagination-btn
          data-action="next"
          ${isLast || d ? 'disabled' : ''}
          part="btn btn-next"
        ><slot name="next-label">\u203A</slot></button>
      </li>`
    );

    if (this._showFirstLast) {
      items.push(
        `<li>
          <button
            type="button"
            aria-label="Last page"
            data-compa11y-pagination-btn
            data-action="last"
            ${isLast || d ? 'disabled' : ''}
            part="btn btn-last"
          ><slot name="last-label">\u00BB</slot></button>
        </li>`
      );
    }

    ul.innerHTML = items.join('');
  }

  private _renderExtras(): void {
    const extras = this.shadowRoot?.querySelector('.extras');
    if (!extras) return;

    const parts: string[] = [];

    if (this._showPageSize) {
      const options = this._pageSizeOptions
        .map(
          (s) =>
            `<option value="${s}"${s === this._pageSize ? ' selected' : ''}>${s}</option>`
        )
        .join('');
      parts.push(
        `<div class="page-size-wrapper" part="page-size-wrapper">
          <label for="${this._id}-pagesize">Rows per page</label>
          <select
            id="${this._id}-pagesize"
            data-compa11y-pagination-pagesize
            ${this._disabled ? 'disabled' : ''}
            part="page-size-select"
          >${options}</select>
        </div>`
      );
    }

    if (this._showJumpTo) {
      parts.push(
        `<div class="jump-wrapper" part="jump-wrapper">
          <label for="${this._id}-jump">Go to page</label>
          <input
            id="${this._id}-jump"
            type="number"
            min="1"
            max="${this._totalPages}"
            data-compa11y-pagination-jump
            ${this._disabled ? 'disabled' : ''}
            part="jump-input"
          />
          <span
            id="${this._id}-jump-error"
            role="alert"
            data-compa11y-pagination-error
            part="jump-error"
            style="display:none"
          ></span>
        </div>`
      );
    }

    extras.innerHTML = parts.join('');
  }

  // ------------------------------------------------------------------
  // Event handlers (delegation)
  // ------------------------------------------------------------------

  private _handleClick = (e: Event): void => {
    const target = (e.target as HTMLElement).closest(
      'button[data-action]'
    ) as HTMLButtonElement | null;
    if (!target || target.disabled) return;

    const action = target.dataset.action;
    switch (action) {
      case 'first':
        this._goToPage(1, 'first');
        break;
      case 'prev':
        this._goToPage(this._currentPage - 1, 'prev');
        break;
      case 'page': {
        const p = parseInt(target.dataset.page ?? '', 10);
        if (!isNaN(p)) this._goToPage(p, 'page');
        break;
      }
      case 'next':
        this._goToPage(this._currentPage + 1, 'next');
        break;
      case 'last':
        this._goToPage(this._totalPages, 'last');
        break;
    }
  };

  private _handleChange = (e: Event): void => {
    const target = e.target as HTMLElement;
    if (!target.matches('[data-compa11y-pagination-pagesize]')) return;

    const newSize = parseInt((target as HTMLSelectElement).value, 10);
    this._pageSize = newSize;
    this._recomputeTotalPages();
    this._currentPage = 1;
    this._syncUI();

    if (this._totalItems != null) {
      announcePolite(
        `Showing 1–${Math.min(newSize, this._totalItems)} of ${this._totalItems}`
      );
    } else {
      announcePolite(`Page 1 of ${this._totalPages}`);
    }

    this.emit('page-change', { page: 1 });
    this.emit('page-size-change', { pageSize: newSize });
  };

  private _handleKeyDown = (e: KeyboardEvent): void => {
    const target = e.target as HTMLElement;
    if (!target.matches('[data-compa11y-pagination-jump]')) return;
    if (e.key !== 'Enter') return;

    const input = target as HTMLInputElement;
    const n = parseInt(input.value, 10);
    const errorEl = this.shadowRoot?.querySelector(
      '[data-compa11y-pagination-error]'
    ) as HTMLElement | null;

    if (isNaN(n) || n < 1 || n > this._totalPages) {
      if (errorEl) {
        errorEl.textContent = `Enter a page between 1 and ${this._totalPages}`;
        errorEl.style.display = '';
        input.setAttribute('aria-describedby', `${this._id}-jump-error`);
      }
      return;
    }

    if (errorEl) {
      errorEl.textContent = '';
      errorEl.style.display = 'none';
      input.removeAttribute('aria-describedby');
    }
    this._goToPage(n, 'page');
    input.value = '';
  };

  // ------------------------------------------------------------------
  // Public API
  // ------------------------------------------------------------------

  /** Navigate to a specific page. */
  goTo(page: number): void {
    this._goToPage(page);
  }

  /** Navigate to the next page. */
  next(): void {
    this._goToPage(this._currentPage + 1);
  }

  /** Navigate to the previous page. */
  previous(): void {
    this._goToPage(this._currentPage - 1);
  }
}

defineElement('compa11y-pagination', Compa11yPagination);

export default Compa11yPagination;
