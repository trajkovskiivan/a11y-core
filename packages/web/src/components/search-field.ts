/**
 * compa11y SearchField Web Component
 *
 * An accessible search input that supports both submit-on-Enter and
 * live filter-as-you-type patterns. Wraps the input in a `role="search"`
 * landmark, provides an accessible clear button, and announces result
 * count changes to screen readers via a polite live region.
 *
 * Basic submit pattern:
 * <compa11y-search-field
 *   label="Search products"
 *   show-search-button
 * ></compa11y-search-field>
 *
 * Filter-as-you-type (update results-count as user types):
 * <compa11y-search-field
 *   label="Filter messages"
 *   results-count="12"
 * ></compa11y-search-field>
 *
 * Events:
 *   compa11y-search-field-change   { value: string }  — fires on every keystroke
 *   compa11y-search-field-submit   { value: string }  — fires on Enter / Search button
 *   compa11y-search-field-clear                       — fires when field is cleared
 *
 * Attributes:
 *   label, aria-label, aria-labelledby
 *   value, placeholder, name, max-length, autocomplete
 *   disabled, required
 *   hint, error
 *   clear-label         (default: "Clear search")
 *   show-search-button  (boolean)
 *   search-button-label (default: "Search")
 *   is-loading          (boolean)
 *   results-count       (number as string)
 *   results-label       (custom announcement string)
 *
 * CSS custom properties:
 *   --compa11y-search-field-bg, --compa11y-search-field-border
 *   --compa11y-search-field-border-focus, --compa11y-search-field-border-error
 *   --compa11y-search-field-radius, --compa11y-search-field-disabled-bg
 *   --compa11y-search-field-label-color, --compa11y-search-field-label-size
 *   --compa11y-search-field-font-size, --compa11y-search-field-hint-color
 *   --compa11y-search-field-error-color, --compa11y-search-field-icon-color
 *   --compa11y-search-field-clear-color, --compa11y-search-field-btn-bg
 *   --compa11y-search-field-btn-color, --compa11y-focus-color
 */

import { announcePolite, createComponentWarnings } from '@compa11y/core';
import { Compa11yElement, defineElement } from '../utils/base-element';
import { SEARCH_FIELD_STYLES } from '../utils/styles';

const warn = createComponentWarnings('SearchField');

// =============================================================================
// SVG helpers
// =============================================================================

const SEARCH_ICON = `
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
    <circle cx="6.5" cy="6.5" r="4" stroke="currentColor" stroke-width="1.5"/>
    <path d="M9.5 9.5L13 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  </svg>
`;

const CLEAR_ICON = `
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" focusable="false">
    <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  </svg>
`;

const SPINNER_ICON = `
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false" class="search-field-spin-svg">
    <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="2"
      stroke-dasharray="28" stroke-dashoffset="10" fill="none" opacity="0.25"/>
    <path d="M8 2a6 6 0 0 1 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/>
  </svg>
`;

// =============================================================================
// Component
// =============================================================================

export class Compa11ySearchField extends Compa11yElement {
  // ── State ──────────────────────────────────────────────────────────────────
  private _value = '';
  private _disabled = false;
  private _isLoading = false;
  private _resultsCount: number | undefined = undefined;
  private _resultsCountInitialized = false;
  private _announceTimer: ReturnType<typeof setTimeout> | null = null;

  // ── DOM refs ───────────────────────────────────────────────────────────────
  private _inputEl: HTMLInputElement | null = null;
  private _clearBtn: HTMLButtonElement | null = null;
  private _submitBtn: HTMLButtonElement | null = null;
  private _errorEl: HTMLDivElement | null = null;
  private _hintEl: HTMLDivElement | null = null;
  private _wrapperEl: HTMLDivElement | null = null;

  static get observedAttributes(): string[] {
    return [
      'label',
      'aria-label',
      'aria-labelledby',
      'value',
      'placeholder',
      'name',
      'max-length',
      'autocomplete',
      'disabled',
      'required',
      'hint',
      'error',
      'clear-label',
      'show-search-button',
      'search-button-label',
      'is-loading',
      'results-count',
      'results-label',
    ];
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  get value(): string { return this._value; }
  set value(v: string) {
    if (this._value === v) return;
    this._value = v;
    this._syncInput();
    this._syncClearButton();
  }

  get disabled(): boolean { return this._disabled; }
  set disabled(v: boolean) {
    this._disabled = Boolean(v);
    this.toggleAttribute('disabled', this._disabled);
    this._syncDisabled();
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  protected setupAccessibility(): void {
    if (process.env.NODE_ENV !== 'production') {
      const hasLabel =
        this.getAttribute('label') ||
        this.getAttribute('aria-label') ||
        this.getAttribute('aria-labelledby');
      if (!hasLabel) {
        warn.warning(
          'SearchField has no accessible label. Provide a label, aria-label, or aria-labelledby attribute.'
        );
      }
    }

    this._value = this.getAttribute('value') ?? '';
    this._disabled = this.hasAttribute('disabled');
    this._isLoading = this.hasAttribute('is-loading');

    const rawCount = this.getAttribute('results-count');
    if (rawCount !== null) {
      this._resultsCount = parseInt(rawCount, 10);
      this._resultsCountInitialized = true;
    }
  }

  protected render(): void {
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });

    const label = this.getAttribute('label') ?? '';
    const ariaLabel = this.getAttribute('aria-label') ?? '';
    const ariaLabelledBy = this.getAttribute('aria-labelledby') ?? '';
    const placeholder = this.getAttribute('placeholder') ?? '';
    const name = this.getAttribute('name') ?? '';
    const maxLength = this.getAttribute('max-length') ?? '';
    const autocomplete = this.getAttribute('autocomplete') ?? 'off';
    const required = this.hasAttribute('required');
    const hint = this.getAttribute('hint') ?? '';
    const error = this.getAttribute('error') ?? '';
    const clearLabel = this.getAttribute('clear-label') ?? 'Clear search';
    const showSearchButton = this.hasAttribute('show-search-button');
    const searchButtonLabel = this.getAttribute('search-button-label') ?? 'Search';

    const hintId = `${this._id}-hint`;
    const errorId = `${this._id}-error`;
    const inputId = `${this._id}-input`;
    const statusId = `${this._id}-status`;

    // Build aria-describedby
    const describedByParts: string[] = [];
    if (hint) describedByParts.push(hintId);
    if (error) describedByParts.push(errorId);
    const describedBy = describedByParts.join(' ');

    // Label association: prefer visible label, then aria-label, then aria-labelledby
    const inputAriaLabel = !label && ariaLabel ? `aria-label="${ariaLabel}"` : '';
    const inputAriaLabelledBy = !label && !ariaLabel && ariaLabelledBy
      ? `aria-labelledby="${ariaLabelledBy}"`
      : '';
    const labelledById = label ? `aria-labelledby="${this._id}-label"` : '';

    this.shadowRoot!.innerHTML = `
      <style>${SEARCH_FIELD_STYLES}</style>
      <div class="search-field-root" part="root">

        ${label ? `
          <label
            id="${this._id}-label"
            for="${inputId}"
            class="search-field-label"
            part="label"
          ><slot name="label">${label}</slot></label>
        ` : ''}

        ${hint ? `
          <div id="${hintId}" class="search-field-hint" part="hint">${hint}</div>
        ` : ''}

        <form role="search" class="search-field-form" part="form">
          <div class="search-field-wrapper" part="wrapper">

            <span class="search-field-icon" part="icon" aria-hidden="true">
              ${SEARCH_ICON}
            </span>

            <input
              id="${inputId}"
              type="search"
              class="search-field-input"
              part="input"
              value="${this._value.replace(/"/g, '&quot;')}"
              ${placeholder ? `placeholder="${placeholder}"` : ''}
              ${name ? `name="${name}"` : ''}
              ${maxLength ? `maxlength="${maxLength}"` : ''}
              autocomplete="${autocomplete}"
              ${this._disabled ? 'disabled' : ''}
              ${required ? 'required aria-required="true"' : ''}
              ${error ? 'aria-invalid="true"' : ''}
              ${describedBy ? `aria-describedby="${describedBy}"` : ''}
              ${inputAriaLabel}
              ${inputAriaLabelledBy}
              ${labelledById}
            />

            ${this._isLoading ? `
              <span class="search-field-spinner" part="spinner" aria-hidden="true">
                ${SPINNER_ICON}
              </span>
            ` : ''}

            ${this._value && !this._disabled ? `
              <button
                type="button"
                class="search-field-clear"
                part="clear-button"
                aria-label="${clearLabel}"
              >
                ${CLEAR_ICON}
              </button>
            ` : ''}

            ${showSearchButton ? `
              <button
                type="submit"
                class="search-field-submit"
                part="submit-button"
                ${this._disabled ? 'disabled' : ''}
              >${searchButtonLabel}</button>
            ` : ''}
          </div>
        </form>

        ${error ? `
          <div id="${errorId}" class="search-field-error" role="alert" part="error">${error}</div>
        ` : ''}

        <div
          id="${statusId}"
          class="search-field-status"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        ></div>
      </div>
    `;

    // Cache refs
    this._inputEl = this.shadowRoot!.querySelector('.search-field-input');
    this._clearBtn = this.shadowRoot!.querySelector('.search-field-clear');
    this._submitBtn = this.shadowRoot!.querySelector('.search-field-submit');
    this._errorEl = this.shadowRoot!.querySelector('.search-field-error');
    this._hintEl = this.shadowRoot!.querySelector('.search-field-hint');
    this._wrapperEl = this.shadowRoot!.querySelector('.search-field-wrapper');

    // Reflect error state on host for CSS
    this.toggleAttribute('data-error', Boolean(error));
  }

  protected setupEventListeners(): void {
    if (!this.shadowRoot) return;

    const form = this.shadowRoot.querySelector('form');
    form?.addEventListener('submit', this._handleSubmit);

    this._inputEl?.addEventListener('input', this._handleInput);
    this._inputEl?.addEventListener('keydown', this._handleKeyDown);
    this._clearBtn?.addEventListener('click', this._handleClear);
  }

  protected cleanupEventListeners(): void {
    if (!this.shadowRoot) return;

    const form = this.shadowRoot.querySelector('form');
    form?.removeEventListener('submit', this._handleSubmit);

    this._inputEl?.removeEventListener('input', this._handleInput);
    this._inputEl?.removeEventListener('keydown', this._handleKeyDown);
    this._clearBtn?.removeEventListener('click', this._handleClear);
  }

  // ── Event handlers ─────────────────────────────────────────────────────────

  private _handleInput = (e: Event): void => {
    const input = e.target as HTMLInputElement;
    this._value = input.value;
    this.setAttribute('value', this._value);
    this._syncClearButton();
    this.emit('compa11y-search-field-change', { value: this._value });
  };

  private _handleSubmit = (e: Event): void => {
    e.preventDefault();
    this.emit('compa11y-search-field-submit', { value: this._value });
  };

  private _handleKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'Enter') {
      this.emit('compa11y-search-field-submit', { value: this._value });
    }
  };

  private _handleClear = (): void => {
    this._value = '';
    this.setAttribute('value', '');
    this._syncInput();
    this._syncClearButton();
    this.emit('compa11y-search-field-clear', {});
    this.emit('compa11y-search-field-change', { value: '' });
    // Return focus to input
    this._inputEl?.focus();
  };

  // ── Sync helpers ───────────────────────────────────────────────────────────

  private _syncInput(): void {
    if (this._inputEl) {
      this._inputEl.value = this._value;
    }
  }

  private _syncClearButton(): void {
    if (!this.shadowRoot) return;
    const hasClear = this._value && !this._disabled;
    const existing = this.shadowRoot.querySelector('.search-field-clear');

    if (hasClear && !existing) {
      // Insert clear button before submit (or before end of wrapper)
      const clearBtn = document.createElement('button');
      clearBtn.type = 'button';
      clearBtn.className = 'search-field-clear';
      clearBtn.setAttribute('part', 'clear-button');
      clearBtn.setAttribute(
        'aria-label',
        this.getAttribute('clear-label') ?? 'Clear search'
      );
      clearBtn.innerHTML = CLEAR_ICON;
      clearBtn.addEventListener('click', this._handleClear);

      const submitBtn = this.shadowRoot.querySelector('.search-field-submit');
      if (submitBtn) {
        this._wrapperEl?.insertBefore(clearBtn, submitBtn);
      } else {
        this._wrapperEl?.appendChild(clearBtn);
      }
      this._clearBtn = clearBtn;
    } else if (!hasClear && existing) {
      existing.removeEventListener('click', this._handleClear);
      existing.remove();
      this._clearBtn = null;
    }
  }

  private _syncDisabled(): void {
    if (this._inputEl) {
      this._inputEl.disabled = this._disabled;
    }
    if (this._submitBtn) {
      this._submitBtn.disabled = this._disabled;
    }
    // Hide clear button when disabled
    this._syncClearButton();
  }

  private _syncLoading(): void {
    if (!this.shadowRoot || !this._wrapperEl) return;
    const existing = this.shadowRoot.querySelector('.search-field-spinner');

    if (this._isLoading && !existing) {
      const spinner = document.createElement('span');
      spinner.className = 'search-field-spinner';
      spinner.setAttribute('part', 'spinner');
      spinner.setAttribute('aria-hidden', 'true');
      spinner.innerHTML = SPINNER_ICON;

      const clearBtn = this.shadowRoot.querySelector('.search-field-clear');
      if (clearBtn) {
        this._wrapperEl.insertBefore(spinner, clearBtn);
      } else {
        const submitBtn = this.shadowRoot.querySelector('.search-field-submit');
        if (submitBtn) {
          this._wrapperEl.insertBefore(spinner, submitBtn);
        } else {
          this._wrapperEl.appendChild(spinner);
        }
      }
    } else if (!this._isLoading && existing) {
      existing.remove();
    }
  }

  private _announceResults(): void {
    if (this._resultsCount === undefined) return;
    if (!this._resultsCountInitialized) {
      this._resultsCountInitialized = true;
      return;
    }

    if (this._announceTimer) clearTimeout(this._announceTimer);
    this._announceTimer = setTimeout(() => {
      const custom = this.getAttribute('results-label');
      const message =
        custom ??
        (this._resultsCount === 0
          ? 'No results'
          : this._resultsCount === 1
            ? '1 result'
            : `${this._resultsCount} results`);
      announcePolite(message);
    }, 300);
  }

  // ── Attribute changes (post-render updates) ────────────────────────────────

  protected onAttributeChange(
    name: string,
    _old: string | null,
    next: string | null
  ): void {
    switch (name) {
      case 'value':
        this._value = next ?? '';
        this._syncInput();
        this._syncClearButton();
        break;

      case 'disabled':
        this._disabled = next !== null;
        this._syncDisabled();
        break;

      case 'is-loading':
        this._isLoading = next !== null;
        this._syncLoading();
        if (this._isLoading) {
          announcePolite('Searching…');
        } else {
          announcePolite('Search complete');
        }
        break;

      case 'results-count': {
        const prev = this._resultsCount;
        this._resultsCount = next !== null ? parseInt(next, 10) : undefined;
        if (this._resultsCount !== prev) {
          this._announceResults();
        }
        break;
      }

      case 'results-label':
        // No visual update needed — used on next announcement
        break;

      case 'error': {
        // Re-render error section and update aria-invalid on input
        const hasError = Boolean(next);
        this.toggleAttribute('data-error', hasError);
        if (this._inputEl) {
          if (hasError) {
            this._inputEl.setAttribute('aria-invalid', 'true');
          } else {
            this._inputEl.removeAttribute('aria-invalid');
          }
        }
        // Update error element
        if (hasError && !this._errorEl && this.shadowRoot) {
          const errorId = `${this._id}-error`;
          const div = document.createElement('div');
          div.id = errorId;
          div.className = 'search-field-error';
          div.setAttribute('role', 'alert');
          div.setAttribute('part', 'error');
          div.textContent = next!;
          const root = this.shadowRoot.querySelector('.search-field-root');
          const status = this.shadowRoot.querySelector('.search-field-status');
          root?.insertBefore(div, status);
          this._errorEl = div;
          // Update describedby
          this._updateDescribedBy();
        } else if (this._errorEl) {
          if (hasError) {
            this._errorEl.textContent = next;
          } else {
            this._errorEl.remove();
            this._errorEl = null;
            this._updateDescribedBy();
          }
        }
        break;
      }

      case 'hint': {
        if (this._hintEl) {
          this._hintEl.textContent = next ?? '';
        }
        break;
      }

      case 'label': {
        // Re-render requires full render for label association
        const labelEl = this.shadowRoot?.querySelector(`#${this._id}-label`);
        if (labelEl) {
          labelEl.textContent = next ?? '';
        }
        break;
      }

      case 'placeholder':
        if (this._inputEl) this._inputEl.placeholder = next ?? '';
        break;

      case 'clear-label':
        if (this._clearBtn) {
          this._clearBtn.setAttribute('aria-label', next ?? 'Clear search');
        }
        break;

      case 'aria-label':
        if (this._inputEl) {
          if (next) this._inputEl.setAttribute('aria-label', next);
          else this._inputEl.removeAttribute('aria-label');
        }
        break;

      case 'aria-labelledby':
        if (this._inputEl) {
          if (next) this._inputEl.setAttribute('aria-labelledby', next);
          else this._inputEl.removeAttribute('aria-labelledby');
        }
        break;
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private _updateDescribedBy(): void {
    if (!this._inputEl) return;
    const parts: string[] = [];
    if (this._hintEl) parts.push(`${this._id}-hint`);
    if (this._errorEl) parts.push(`${this._id}-error`);
    const val = parts.join(' ');
    if (val) {
      this._inputEl.setAttribute('aria-describedby', val);
    } else {
      this._inputEl.removeAttribute('aria-describedby');
    }
  }

  /** Focus the inner input */
  focus(): void {
    this._inputEl?.focus();
  }

  /** Blur the inner input */
  blur(): void {
    this._inputEl?.blur();
  }
}

defineElement('compa11y-search-field', Compa11ySearchField);
