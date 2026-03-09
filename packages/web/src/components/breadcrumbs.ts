/**
 * Accessible Breadcrumbs Web Component.
 *
 * Reads slotted `<a href>` and `<span>` children from light DOM, clones them
 * into a shadow DOM `<nav><ol>` with:
 * - Separators (aria-hidden) injected between items
 * - `aria-current="page"` applied to the last item automatically
 * - Optional collapse via `max-items` attribute
 *
 * @example
 * ```html
 * <compa11y-breadcrumbs aria-label="Breadcrumb">
 *   <a href="/">Home</a>
 *   <a href="/products">Products</a>
 *   <span>Model X</span>
 * </compa11y-breadcrumbs>
 *
 * <!-- With collapse -->
 * <compa11y-breadcrumbs max-items="3">
 *   <a href="/">Home</a>
 *   <a href="/cat">Category</a>
 *   <a href="/sub">Subcategory</a>
 *   <a href="/item">Item</a>
 *   <span>Detail</span>
 * </compa11y-breadcrumbs>
 * ```
 *
 * @fires page-change - Not used; breadcrumbs are static navigation
 *
 * @attr {string}  aria-label  - Accessible name for the <nav> (default: "Breadcrumb")
 * @attr {string}  separator   - Separator character (default: "/")
 * @attr {number}  max-items   - Collapse threshold, 0 = never (default: 0)
 *
 * @cssprop --compa11y-breadcrumbs-link-color      - Link color
 * @cssprop --compa11y-breadcrumbs-current-color   - Current-page item color
 * @cssprop --compa11y-breadcrumbs-separator-color - Separator color
 * @cssprop --compa11y-breadcrumbs-separator-padding - Horizontal separator gap
 * @cssprop --compa11y-focus-color                 - Focus ring color
 */

import { Compa11yElement, defineElement } from '../utils/base-element';
import { createComponentWarnings } from '@compa11y/core';

const warn = createComponentWarnings('Breadcrumbs');

// =============================================================================
// Styles
// =============================================================================

const BREADCRUMBS_STYLES = `
  :host {
    display: block;
    box-sizing: border-box;
  }

  :host([hidden]) {
    display: none !important;
  }

  *,
  *::before,
  *::after {
    box-sizing: inherit;
  }

  nav {
    display: block;
  }

  ol {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    list-style: none;
    margin: 0;
    padding: 0;
    gap: 0;
  }

  li {
    display: inline-flex;
    align-items: center;
  }

  /* Separator */
  li[aria-hidden="true"] {
    padding: 0 var(--compa11y-breadcrumbs-separator-padding, 0.375rem);
    color: var(--compa11y-breadcrumbs-separator-color, #999);
    user-select: none;
    pointer-events: none;
  }

  /* Links */
  a[part="link"] {
    color: var(--compa11y-breadcrumbs-link-color, #0066cc);
    text-decoration: underline;
    border-radius: 2px;
  }

  a[part="link"]:hover {
    text-decoration: none;
  }

  /* Current page */
  [part="current"] {
    font-weight: 600;
    text-decoration: none;
    color: var(--compa11y-breadcrumbs-current-color, inherit);
  }

  /* Focus */
  a:focus-visible,
  button:focus-visible {
    outline: 2px solid var(--compa11y-focus-color, #0066cc);
    outline-offset: 2px;
    border-radius: 2px;
  }

  /* Expand button */
  button[part="expand"] {
    appearance: none;
    background: none;
    border: 1px solid currentColor;
    border-radius: 3px;
    padding: 0 0.3rem;
    cursor: pointer;
    font: inherit;
    line-height: 1.4;
    color: var(--compa11y-breadcrumbs-link-color, #0066cc);
    min-height: 1.5rem;
    min-width: 1.5rem;
  }

  button[part="expand"]:hover {
    background: rgba(0, 102, 204, 0.06);
  }

  /* Responsive — hide middle items on very small screens when not collapsed */
  @media (max-width: 480px) {
    li[data-middle]:not([data-first]):not([data-last]) {
      display: none;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    * {
      transition: none !important;
      animation: none !important;
    }
  }

  /* High contrast */
  @media (forced-colors: active) {
    a[part="link"],
    button[part="expand"] {
      forced-color-adjust: auto;
    }

    a:focus-visible,
    button:focus-visible {
      outline: 2px solid Highlight;
    }
  }
`;

// =============================================================================
// Component
// =============================================================================

export class Compa11yBreadcrumbs extends Compa11yElement {
  private _isExpanded = false;
  private _observer: MutationObserver | null = null;

  static get observedAttributes() {
    return ['aria-label', 'separator', 'max-items'];
  }

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  protected setupAccessibility(): void {
    const children = this._getLightChildren();

    if (process.env.NODE_ENV !== 'production') {
      if (children.length === 0) {
        warn.error(
          'No children found — a11y-breadcrumbs requires at least one <a> or <span> child.'
        );
      } else if (children.length === 1) {
        warn.warning(
          'Single-item breadcrumbs are rarely useful. Consider omitting.'
        );
      }
    }
  }

  protected render(): void {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }

    const sr = this.shadowRoot!;

    // Clear previous shadow content (keep style)
    sr.innerHTML = '';

    const styleEl = document.createElement('style');
    styleEl.textContent = BREADCRUMBS_STYLES;
    sr.appendChild(styleEl);

    const label = this.getAttribute('aria-label') || 'Breadcrumb';
    const separator = this.getAttribute('separator') || '/';
    const maxItems = parseInt(this.getAttribute('max-items') || '0', 10);
    const children = this._getLightChildren();

    const nav = document.createElement('nav');
    nav.setAttribute('aria-label', label);
    nav.setAttribute('part', 'nav');

    const ol = document.createElement('ol');
    ol.setAttribute('part', 'list');

    if (children.length === 0) {
      nav.appendChild(ol);
      sr.appendChild(nav);
      return;
    }

    const shouldCollapse =
      maxItems > 0 && !this._isExpanded && children.length > maxItems;

    if (shouldCollapse) {
      this._renderCollapsed(ol, children, separator, maxItems);
    } else {
      this._renderFull(ol, children, separator);
    }

    nav.appendChild(ol);
    sr.appendChild(nav);
  }

  // ---------------------------------------------------------------------------
  // Event listeners
  // ---------------------------------------------------------------------------

  protected setupEventListeners(): void {
    // Watch for light DOM child changes and re-render
    this._observer = new MutationObserver(() => {
      this._isExpanded = false;
      this.render();
    });
    this._observer.observe(this, { childList: true });
  }

  protected cleanupEventListeners(): void {
    this._observer?.disconnect();
    this._observer = null;
  }

  protected onAttributeChange(
    name: string,
    _old: string | null,
    _next: string | null
  ): void {
    if (name === 'aria-label' || name === 'separator' || name === 'max-items') {
      this.render();
    }
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /** Return direct element children (skip text nodes, comments, etc.) */
  private _getLightChildren(): Element[] {
    return Array.from(this.children);
  }

  /** Render all items without collapse */
  private _renderFull(
    ol: HTMLOListElement,
    children: Element[],
    separator: string
  ): void {
    children.forEach((child, i) => {
      const isLast = i === children.length - 1;
      const isFirst = i === 0;

      if (i > 0) {
        ol.appendChild(this._makeSeparator(separator));
      }

      const li = document.createElement('li');
      // Data attrs for responsive hiding (hide middle items on small screens)
      if (isFirst) li.setAttribute('data-first', '');
      else if (isLast) li.setAttribute('data-last', '');
      else li.setAttribute('data-middle', '');

      li.appendChild(this._makeCrumbEl(child, isLast));
      ol.appendChild(li);
    });
  }

  /** Render collapsed: first item, ellipsis button, last (maxItems-1) items */
  private _renderCollapsed(
    ol: HTMLOListElement,
    children: Element[],
    separator: string,
    maxItems: number
  ): void {
    const tailCount = Math.max(maxItems - 1, 1);
    const tailChildren = children.slice(children.length - tailCount);

    // First item
    const firstChild = children[0]!;
    const firstLi = document.createElement('li');
    firstLi.setAttribute('data-first', '');
    firstLi.appendChild(this._makeCrumbEl(firstChild, false));
    ol.appendChild(firstLi);

    ol.appendChild(this._makeSeparator(separator));

    // Expand button
    const expandLi = document.createElement('li');
    const expandBtn = document.createElement('button');
    expandBtn.type = 'button';
    expandBtn.setAttribute('aria-label', 'Show full breadcrumb path');
    expandBtn.setAttribute('aria-expanded', 'false');
    expandBtn.setAttribute('part', 'expand');
    expandBtn.textContent = '\u2026'; // …
    expandBtn.addEventListener('click', this._handleExpand);
    expandLi.appendChild(expandBtn);
    ol.appendChild(expandLi);

    ol.appendChild(this._makeSeparator(separator));

    // Tail items
    tailChildren.forEach((child, i) => {
      if (i > 0) {
        ol.appendChild(this._makeSeparator(separator));
      }
      const isLast = i === tailChildren.length - 1;
      const li = document.createElement('li');
      if (isLast) li.setAttribute('data-last', '');
      li.appendChild(this._makeCrumbEl(child, isLast));
      ol.appendChild(li);
    });
  }

  /** Create a link or span element for a single breadcrumb */
  private _makeCrumbEl(sourceEl: Element, isLast: boolean): HTMLElement {
    const href =
      sourceEl.tagName === 'A'
        ? (sourceEl as HTMLAnchorElement).getAttribute('href')
        : null;

    let el: HTMLElement;

    if (href) {
      el = document.createElement('a');
      (el as HTMLAnchorElement).href = href;
      el.setAttribute('part', isLast ? 'current' : 'link');
    } else {
      el = document.createElement('span');
      el.setAttribute('part', isLast ? 'current' : 'link');
    }

    if (isLast) {
      el.setAttribute('aria-current', 'page');
    }

    // Clone child nodes from light DOM (preserves icons, text, etc.)
    Array.from(sourceEl.childNodes).forEach((node) => {
      el.appendChild(node.cloneNode(true));
    });

    return el;
  }

  /** Create an aria-hidden separator <li> */
  private _makeSeparator(text: string): HTMLLIElement {
    const li = document.createElement('li');
    li.setAttribute('aria-hidden', 'true');
    li.setAttribute('part', 'separator');
    li.textContent = text;
    return li;
  }

  /** Expand collapsed breadcrumbs and focus first newly-revealed link */
  private _handleExpand = (): void => {
    this._isExpanded = true;
    this.render();
    this.emit('compa11y-breadcrumbs-expand');

    // Focus first newly revealed link (index 1 in the full list)
    const links = Array.from(
      this.shadowRoot!.querySelectorAll<HTMLElement>(
        'ol li a[part="link"]'
      )
    );
    if (links.length > 1) {
      links[1]!.focus();
    } else if (links.length === 1) {
      links[0]!.focus();
    }
  };
}

defineElement('compa11y-breadcrumbs', Compa11yBreadcrumbs);
