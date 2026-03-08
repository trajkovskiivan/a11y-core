/**
 * compa11y EmptyState Web Component
 *
 * Renders a structured, accessible message when a list, table, search result,
 * or section has no content. Answers: what is empty, why, and what the user
 * can do next.
 *
 * Static (page-level, no live region):
 * @example
 * <compa11y-empty-state
 *   title="No projects yet"
 *   description="Create your first project to get started."
 * >
 *   <div slot="actions">
 *     <button>Create project</button>
 *   </div>
 * </compa11y-empty-state>
 *
 * Dynamic (appears after search/filter — announces to screen readers):
 * @example
 * <compa11y-empty-state
 *   title="No results"
 *   description='No items match your search. Try clearing filters.'
 *   live
 * >
 *   <div slot="actions">
 *     <button id="clear-btn">Clear filters</button>
 *   </div>
 * </compa11y-empty-state>
 *
 * With decorative icon:
 * @example
 * <compa11y-empty-state title="No saved articles" description="Articles you save will appear here.">
 *   <svg slot="icon" aria-hidden="true" width="48" height="48">…</svg>
 *   <div slot="actions"><a href="/browse">Browse articles</a></div>
 * </compa11y-empty-state>
 *
 * @attr {string}  title         - Heading text. Required.
 * @attr {string}  description   - Supporting paragraph text.
 * @attr {number}  heading-level - Heading level 1–6 (default: 2).
 * @attr {boolean} live          - Adds role="status" aria-live="polite" for dynamic states.
 *
 * @slot icon    - Decorative illustration or icon. Always aria-hidden in the shadow DOM wrapper.
 * @slot actions - Primary and secondary action buttons/links.
 *
 * @cssprop --compa11y-empty-state-gap                  Layout gap between sections (default 0.75rem)
 * @cssprop --compa11y-empty-state-padding              Padding around the container (default 3rem 1.5rem)
 * @cssprop --compa11y-empty-state-icon-color           Icon/illustration color (default #9ca3af)
 * @cssprop --compa11y-empty-state-icon-size            Icon font-size / size (default 3rem)
 * @cssprop --compa11y-empty-state-title-size           Title font-size (default 1.125rem)
 * @cssprop --compa11y-empty-state-title-weight         Title font-weight (default 600)
 * @cssprop --compa11y-empty-state-title-color          Title color (default inherit)
 * @cssprop --compa11y-empty-state-description-size     Description font-size (default 0.9375rem)
 * @cssprop --compa11y-empty-state-description-color    Description color (default #6b7280)
 * @cssprop --compa11y-empty-state-description-max-width Max width of description (default 36ch)
 * @cssprop --compa11y-empty-state-actions-gap          Gap between action buttons (default 0.5rem)
 * @cssprop --compa11y-empty-state-actions-margin       Top margin above actions (default 0.25rem)
 */

import { Compa11yElement, defineElement } from '../utils/base-element';
import { EMPTY_STATE_STYLES } from '../utils/styles';
import { createComponentWarnings } from '@compa11y/core';

const warn = createComponentWarnings('EmptyState');

export class Compa11yEmptyState extends Compa11yElement {
  static get observedAttributes() {
    return ['title', 'description', 'heading-level', 'live'];
  }

  // ── Lifecycle ───────────────────────────────────────────────────────────────

  protected setupAccessibility(): void {
    if (process.env.NODE_ENV !== 'production') {
      const title = this.getAttribute('title');
      if (!title) {
        warn.error('The "title" attribute is required for EmptyState to be accessible.');
      }
    }
  }

  protected render(): void {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }

    const title = this.getAttribute('title') ?? '';
    const description = this.getAttribute('description') ?? '';
    const level = Math.min(6, Math.max(1, parseInt(this.getAttribute('heading-level') ?? '2', 10)));
    const live = this.hasAttribute('live');

    const liveAttrs = live
      ? `role="status" aria-live="polite" aria-atomic="true"`
      : '';

    this.shadowRoot!.innerHTML = `
      <style>${EMPTY_STATE_STYLES}</style>
      <section class="empty-state" part="root" ${liveAttrs}>
        <div class="icon-wrapper" part="icon" aria-hidden="true">
          <slot name="icon"></slot>
        </div>
        <h${level} class="title" part="title">${this._escapeHtml(title)}</h${level}>
        ${description ? `<p class="description" part="description">${this._escapeHtml(description)}</p>` : ''}
        <div class="actions" part="actions">
          <slot name="actions"></slot>
        </div>
      </section>
    `;
  }

  protected setupEventListeners(): void {}
  protected cleanupEventListeners(): void {}

  protected onAttributeChange(
    _name: string,
    _old: string | null,
    _next: string | null
  ): void {
    this.render();
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  private _escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}

defineElement('compa11y-empty-state', Compa11yEmptyState);
