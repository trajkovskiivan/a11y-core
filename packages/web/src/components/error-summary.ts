/**
 * compa11y ErrorSummary Web Component
 *
 * Displays a summary of validation or system errors with optional navigation
 * links to the relevant form fields. Two variants:
 *
 * **Form variant** (default) — appears after a failed submit, auto-focuses
 * the container so screen readers announce it, and lists clickable links
 * that jump to the corresponding fields.
 *
 * **Page variant** — for system/page-level errors (save failed, network error).
 * Uses `role="alert"` for assertive announcement. Supports action buttons via
 * the `actions` slot.
 *
 * Form validation:
 * @example
 * <compa11y-error-summary
 *   title="There are 3 problems"
 *   errors='[{"message":"Enter your name","fieldId":"name"},{"message":"Enter your email","fieldId":"email"}]'
 * ></compa11y-error-summary>
 *
 * Page/system error:
 * @example
 * <compa11y-error-summary
 *   variant="page"
 *   title="Something went wrong"
 *   description="We could not save your changes."
 *   errors='[{"message":"Server error: connection timed out"}]'
 * >
 *   <div slot="actions">
 *     <button>Retry</button>
 *   </div>
 * </compa11y-error-summary>
 *
 * @fires compa11y-error-summary-dismiss - Emitted when the dismiss button is clicked
 * @fires compa11y-error-summary-link-click - Emitted when an error link is clicked. Detail: { fieldId, message }
 *
 * @attr {string}  title         - Heading text (default: "There is a problem")
 * @attr {string}  description   - Supporting paragraph text
 * @attr {string}  variant       - 'form' | 'page' (default: 'form')
 * @attr {number}  heading-level - Heading level 1–6 (default: 2)
 * @attr {boolean} auto-focus    - Auto-focus on mount (default: true for form, false for page)
 * @attr {string}  announce      - 'off' | 'polite' | 'assertive' (default: 'off' for form, 'assertive' for page)
 * @attr {string}  errors        - JSON string of errors: [{ message, fieldId? }]
 * @attr {boolean} dismissible   - Show a dismiss button
 *
 * @slot actions - Action buttons (Retry, Dismiss, etc.)
 *
 * @cssprop --compa11y-error-summary-bg              Background color (default: white)
 * @cssprop --compa11y-error-summary-border           Border style (default: 1px solid #e0e0e0)
 * @cssprop --compa11y-error-summary-accent-color     Left border accent (default: #ef4444)
 * @cssprop --compa11y-error-summary-radius           Border radius (default: 6px)
 * @cssprop --compa11y-error-summary-padding          Padding (default: 1rem 1.25rem)
 * @cssprop --compa11y-error-summary-title-size       Title font-size (default: 1.125rem)
 * @cssprop --compa11y-error-summary-title-weight     Title font-weight (default: 600)
 * @cssprop --compa11y-error-summary-title-color      Title color (default: inherit)
 * @cssprop --compa11y-error-summary-description-size Description font-size (default: 0.875rem)
 * @cssprop --compa11y-error-summary-description-color Description color (default: #555)
 * @cssprop --compa11y-error-summary-link-color       Error link color (default: #ef4444)
 * @cssprop --compa11y-error-summary-link-hover-color Error link hover color (default: #dc2626)
 * @cssprop --compa11y-error-summary-dismiss-color    Dismiss button color (default: #999)
 * @cssprop --compa11y-focus-color                    Focus outline color (shared)
 */

import { Compa11yElement, defineElement } from '../utils/base-element';
import { ERROR_SUMMARY_STYLES } from '../utils/styles';
import { createComponentWarnings } from '@compa11y/core';

const warn = createComponentWarnings('ErrorSummary');

interface ErrorSummaryErrorData {
  message: string;
  fieldId?: string;
}

export class Compa11yErrorSummary extends Compa11yElement {
  private _errors: ErrorSummaryErrorData[] = [];
  private _container: HTMLDivElement | null = null;
  private _dismissButton: HTMLButtonElement | null = null;

  static get observedAttributes() {
    return ['title', 'description', 'variant', 'heading-level', 'auto-focus', 'announce', 'errors', 'dismissible'];
  }

  /** Get/set errors programmatically as an array. */
  get errorsData(): ErrorSummaryErrorData[] {
    return this._errors;
  }

  set errorsData(value: ErrorSummaryErrorData[]) {
    this._errors = Array.isArray(value) ? value : [];
    this.render();
    this.setupEventListeners();
    this._maybeAutoFocus();
  }

  private get _variant(): string {
    return this.getAttribute('variant') || 'form';
  }

  private get _resolvedAnnounce(): string {
    const announce = this.getAttribute('announce');
    if (announce) return announce;
    return this._variant === 'page' ? 'assertive' : 'off';
  }

  private get _shouldAutoFocus(): boolean {
    const attr = this.getAttribute('auto-focus');
    if (attr === 'false') return false;
    if (attr !== null) return true;
    return this._variant === 'form';
  }

  // ── Lifecycle ───────────────────────────────────────────────────────────────

  protected setupAccessibility(): void {
    // Parse errors from attribute
    this._parseErrorsAttribute();

    if (process.env.NODE_ENV !== 'production') {
      if (this._errors.length === 0) {
        warn.info('ErrorSummary rendered with no errors. Consider conditionally rendering the component.');
      }
      if (this._variant === 'form' && this._errors.length > 0) {
        const missing = this._errors.filter((e) => !e.fieldId);
        if (missing.length > 0) {
          warn.warning(
            `${missing.length} error(s) are missing a fieldId. Link to the corresponding field for the best user experience.`,
            'Provide a fieldId for each error that corresponds to a form field ID.',
          );
        }
      }
    }
  }

  protected render(): void {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }

    const title = this.getAttribute('title') || 'There is a problem';
    const description = this.getAttribute('description') || '';
    const level = Math.min(6, Math.max(1, parseInt(this.getAttribute('heading-level') || '2', 10)));
    const dismissible = this.hasAttribute('dismissible');
    const announceMode = this._resolvedAnnounce;

    // Build role/aria attrs
    let roleAttrs = '';
    if (announceMode === 'assertive') {
      roleAttrs = 'role="alert"';
    } else if (announceMode === 'polite') {
      roleAttrs = 'role="status" aria-live="polite" aria-atomic="true"';
    }

    const headingId = `${this._id}-heading`;

    const errorsHtml = this._errors.length > 0
      ? `<ul class="error-summary-list" part="list">
          ${this._errors.map((error, i) => {
            const msg = this._escapeHtml(error.message);
            if (error.fieldId) {
              return `<li><a href="#${this._escapeHtml(error.fieldId)}" data-field-id="${this._escapeHtml(error.fieldId)}" data-index="${i}">${msg}</a></li>`;
            }
            return `<li>${msg}</li>`;
          }).join('')}
        </ul>`
      : '';

    this.shadowRoot!.innerHTML = `
      <style>${ERROR_SUMMARY_STYLES}</style>
      <div
        class="error-summary"
        part="root"
        tabindex="-1"
        ${roleAttrs}
        aria-labelledby="${headingId}"
      >
        <h${level} class="error-summary-title" part="title" id="${headingId}">${this._escapeHtml(title)}</h${level}>
        ${description ? `<p class="error-summary-description" part="description">${this._escapeHtml(description)}</p>` : ''}
        ${errorsHtml}
        <div class="error-summary-actions" part="actions">
          <slot name="actions"></slot>
        </div>
        ${dismissible ? `<button class="error-summary-dismiss" part="dismiss" type="button" aria-label="Dismiss error summary">&times;</button>` : ''}
      </div>
    `;

    this._container = this.shadowRoot!.querySelector('.error-summary');
    this._dismissButton = this.shadowRoot!.querySelector('.error-summary-dismiss');
  }

  protected setupEventListeners(): void {
    // Dismiss button
    this._dismissButton?.addEventListener('click', this._handleDismiss);

    // Error link clicks — delegate from shadow root
    this.shadowRoot?.querySelectorAll('.error-summary-list a').forEach((link) => {
      link.addEventListener('click', this._handleLinkClick as EventListener);
    });
  }

  protected cleanupEventListeners(): void {
    this._dismissButton?.removeEventListener('click', this._handleDismiss);

    this.shadowRoot?.querySelectorAll('.error-summary-list a').forEach((link) => {
      link.removeEventListener('click', this._handleLinkClick as EventListener);
    });
  }

  protected onAttributeChange(
    name: string,
    _old: string | null,
    _next: string | null,
  ): void {
    if (name === 'errors') {
      this._parseErrorsAttribute();
    }
    this.render();
    this.setupEventListeners();
    if (name === 'errors' || name === 'auto-focus') {
      this._maybeAutoFocus();
    }
  }

  // Override connectedCallback to auto-focus after initial render
  connectedCallback(): void {
    super.connectedCallback();
    this._maybeAutoFocus();
  }

  // ── Event handlers ────────────────────────────────────────────────────────

  private _handleDismiss = (): void => {
    this.emit('compa11y-error-summary-dismiss');
  };

  private _handleLinkClick = (e: Event): void => {
    e.preventDefault();
    const anchor = e.currentTarget as HTMLAnchorElement;
    const fieldId = anchor.getAttribute('data-field-id');
    const message = anchor.textContent || '';

    if (fieldId) {
      const target = document.getElementById(fieldId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        target.focus({ preventScroll: true });
      }
    }

    this.emit('compa11y-error-summary-link-click', { fieldId, message });
  };

  // ── Helpers ─────────────────────────────────────────────────────────────────

  private _parseErrorsAttribute(): void {
    const raw = this.getAttribute('errors');
    if (!raw) {
      this._errors = [];
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      this._errors = Array.isArray(parsed) ? parsed : [];
    } catch {
      if (process.env.NODE_ENV !== 'production') {
        warn.error(
          'Invalid JSON in "errors" attribute. Expected an array of { message, fieldId? } objects.',
        );
      }
      this._errors = [];
    }
  }

  private _maybeAutoFocus(): void {
    if (this._shouldAutoFocus && this._errors.length > 0 && this._container) {
      requestAnimationFrame(() => {
        this._container?.focus();
      });
    }
  }

  private _escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}

defineElement('compa11y-error-summary', Compa11yErrorSummary);
