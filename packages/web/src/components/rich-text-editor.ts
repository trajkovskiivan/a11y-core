/**
 * compa11y Rich Text Editor Web Component
 *
 * An engine-agnostic rich text editor shell providing accessible structure,
 * toolbar semantics, dialog semantics, and dev warnings.
 *
 * Usage:
 * <compa11y-rich-text-editor label="Message">
 *   <div slot="toolbar">
 *     <!-- Toolbar buttons are rendered by the component based on features -->
 *   </div>
 *   <div slot="content">
 *     <!-- The engine mounts into the content area -->
 *   </div>
 *   <div slot="footer">
 *     <!-- Optional footer content -->
 *   </div>
 * </compa11y-rich-text-editor>
 *
 * The component requires an RTEAdapter to be set via the `adapter` property:
 *   const editor = document.querySelector('compa11y-rich-text-editor');
 *   editor.adapter = createLexicalAdapter();
 */

import { announce, createComponentWarnings } from '@compa11y/core';
import type {
  RTEAdapter,
  RTEFeatures,
  RTEFormat,
  RTEMark,
  RTEBlock,
  RTESelectionState,
  RTEValue,
} from '@compa11y/core';
import { EMPTY_SELECTION_STATE, DEFAULT_RTE_FEATURES } from '@compa11y/core';
import { Compa11yElement, defineElement } from '../utils/base-element';
import {
  BASE_STYLES,
  FOCUS_VISIBLE_STYLES,
  RESET_BUTTON_STYLES,
  VISUALLY_HIDDEN_STYLES,
} from '../utils/styles';

const warnings = createComponentWarnings('RichTextEditor');

export const RICH_TEXT_EDITOR_STYLES = `
  :host {
    --compa11y-rte-border-color: #d1d5db;
    --compa11y-rte-border-radius: 8px;
    --compa11y-rte-toolbar-bg: #f9fafb;
    --compa11y-rte-toolbar-border-color: #e5e7eb;
    --compa11y-rte-toolbar-gap: 4px;
    --compa11y-rte-btn-size: 32px;
    --compa11y-rte-btn-radius: 4px;
    --compa11y-rte-btn-hover-bg: #e5e7eb;
    --compa11y-rte-btn-active-bg: #dbeafe;
    --compa11y-rte-btn-active-color: #1d4ed8;
    --compa11y-rte-content-min-height: 150px;
    --compa11y-rte-content-padding: 12px;
    --compa11y-rte-error-color: #dc2626;
    --compa11y-rte-label-font-weight: 600;
  }
`;

export class Compa11yRichTextEditor extends Compa11yElement {
  private _adapter: RTEAdapter | null = null;
  private _unmountAdapter: (() => void) | null = null;
  private _selectionState: RTESelectionState = EMPTY_SELECTION_STATE;
  private _features: RTEFeatures = { ...DEFAULT_RTE_FEATURES };
  private _format: RTEFormat = 'html';
  private _disabled = false;
  private _readOnly = false;
  private _required = false;
  private _linkDialogOpen = false;
  private _value: RTEValue | undefined = undefined;

  static get observedAttributes() {
    return [
      'label',
      'aria-label',
      'description',
      'error-message',
      'required',
      'disabled',
      'readonly',
      'format',
      'placeholder',
      'features',
    ];
  }

  // ---- Public properties ----

  get adapter(): RTEAdapter | null {
    return this._adapter;
  }

  set adapter(adapter: RTEAdapter | null) {
    this._adapter = adapter;
    if (this.isConnected) {
      this.mountAdapter();
    }
  }

  get value(): RTEValue | undefined {
    return this._adapter?.getValue(this._format);
  }

  set value(val: RTEValue | undefined) {
    this._value = val;
    if (val !== undefined && this._adapter) {
      this._adapter.setValue(val, this._format);
    }
  }

  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(v: boolean) {
    this._disabled = v;
    this.toggleAttribute('disabled', v);
    this.syncState();
  }

  get readOnly(): boolean {
    return this._readOnly;
  }

  set readOnly(v: boolean) {
    this._readOnly = v;
    this.toggleAttribute('readonly', v);
    this.syncState();
  }

  get features(): RTEFeatures {
    return this._features;
  }

  set features(f: RTEFeatures) {
    this._features = { ...DEFAULT_RTE_FEATURES, ...f };
    this.renderToolbar();
  }

  // ---- Lifecycle ----

  protected setupAccessibility(): void {
    this._disabled = this.hasAttribute('disabled');
    this._readOnly = this.hasAttribute('readonly');
    this._required = this.hasAttribute('required');
    this._format = (this.getAttribute('format') as RTEFormat) || 'html';

    // Parse features from attribute (JSON)
    const featuresAttr = this.getAttribute('features');
    if (featuresAttr) {
      try {
        this._features = { ...DEFAULT_RTE_FEATURES, ...JSON.parse(featuresAttr) };
      } catch {
        warnings.warning('Invalid features attribute — must be valid JSON.');
      }
    }

    // Accessible name check
    requestAnimationFrame(() => {
      if (!this.getAttribute('label') && !this.getAttribute('aria-label')) {
        warnings.error(
          'RichTextEditor has no accessible label. Add label="..." or aria-label="..." attribute.\n' +
            '💡 Suggestion: <compa11y-rich-text-editor label="Message">...</compa11y-rich-text-editor>'
        );
      }
    });
  }

  protected render(): void {
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });

    const label = this.getAttribute('label') || '';
    const description = this.getAttribute('description') || '';
    const errorMessage = this.getAttribute('error-message') || '';
    const ariaLabelAttr = this.getAttribute('aria-label') || '';

    const labelId = `${this._id}-label`;
    const descId = `${this._id}-desc`;
    const errorId = `${this._id}-error`;
    const toolbarId = `${this._id}-toolbar`;
    const contentId = `${this._id}-content`;

    const describedBy = [
      description ? descId : '',
      errorMessage ? errorId : '',
    ].filter(Boolean).join(' ');

    this.shadowRoot!.innerHTML = `
      <style>
        ${BASE_STYLES}
        ${FOCUS_VISIBLE_STYLES}
        ${RICH_TEXT_EDITOR_STYLES}

        .rte-wrapper {
          display: flex;
          flex-direction: column;
        }

        .rte-label {
          font-weight: var(--compa11y-rte-label-font-weight);
          margin-bottom: 4px;
        }

        .rte-description {
          color: #6b7280;
          font-size: 0.875em;
          margin-bottom: 4px;
        }

        .rte-error {
          color: var(--compa11y-rte-error-color);
          font-size: 0.875em;
          margin-top: 4px;
        }

        .rte-required {
          color: var(--compa11y-rte-error-color);
        }

        .rte-toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: var(--compa11y-rte-toolbar-gap);
          padding: 4px 8px;
          background: var(--compa11y-rte-toolbar-bg);
          border: 1px solid var(--compa11y-rte-border-color);
          border-bottom: 1px solid var(--compa11y-rte-toolbar-border-color);
          border-radius: var(--compa11y-rte-border-radius) var(--compa11y-rte-border-radius) 0 0;
        }

        .rte-toolbar[data-disabled] {
          opacity: 0.5;
          pointer-events: none;
        }

        .rte-toolbar-btn {
          ${RESET_BUTTON_STYLES}
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: var(--compa11y-rte-btn-size);
          min-height: var(--compa11y-rte-btn-size);
          padding: 4px 8px;
          border-radius: var(--compa11y-rte-btn-radius);
          font-size: 0.875em;
          font-weight: 600;
          transition: background-color 0.15s;
        }

        .rte-toolbar-btn:hover:not(:disabled) {
          background: var(--compa11y-rte-btn-hover-bg);
        }

        .rte-toolbar-btn[aria-pressed="true"] {
          background: var(--compa11y-rte-btn-active-bg);
          color: var(--compa11y-rte-btn-active-color);
        }

        .rte-toolbar-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .rte-toolbar-select {
          padding: 4px 8px;
          border: 1px solid var(--compa11y-rte-toolbar-border-color);
          border-radius: var(--compa11y-rte-btn-radius);
          font-size: 0.875em;
          background: white;
        }

        .rte-separator {
          width: 1px;
          align-self: stretch;
          margin: 4px 2px;
          background: var(--compa11y-rte-toolbar-border-color);
        }

        .rte-content {
          min-height: var(--compa11y-rte-content-min-height);
          padding: var(--compa11y-rte-content-padding);
          border: 1px solid var(--compa11y-rte-border-color);
          border-top: none;
          border-radius: 0 0 var(--compa11y-rte-border-radius) var(--compa11y-rte-border-radius);
          outline: none;
        }

        .rte-content:focus-within {
          box-shadow: 0 0 0 2px var(--compa11y-focus-color, #0066cc);
        }

        :host([disabled]) .rte-content {
          opacity: 0.5;
          pointer-events: none;
        }

        .rte-footer {
          display: flex;
          justify-content: space-between;
          padding: 4px 0;
          font-size: 0.875em;
          color: #6b7280;
        }

        .visually-hidden {
          ${VISUALLY_HIDDEN_STYLES}
        }

        /* Link dialog overlay */
        .rte-dialog-overlay {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          background: rgba(0, 0, 0, 0.5);
        }

        .rte-dialog {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          min-width: 360px;
          max-width: 480px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }

        .rte-dialog h2 {
          margin: 0 0 1rem;
          font-size: 1.1em;
        }

        .rte-dialog-field {
          margin-bottom: 0.75rem;
        }

        .rte-dialog-field label {
          display: block;
          font-weight: 600;
          margin-bottom: 4px;
          font-size: 0.875em;
        }

        .rte-dialog-field input {
          width: 100%;
          padding: 8px;
          border: 1px solid var(--compa11y-rte-border-color);
          border-radius: 4px;
          font: inherit;
          box-sizing: border-box;
        }

        .rte-dialog-field input[aria-invalid="true"] {
          border-color: var(--compa11y-rte-error-color);
        }

        .rte-dialog-field-error {
          color: var(--compa11y-rte-error-color);
          font-size: 0.8em;
          margin-top: 2px;
        }

        .rte-dialog-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 1rem;
        }

        .rte-dialog-actions button {
          padding: 8px 16px;
          border: 1px solid var(--compa11y-rte-border-color);
          border-radius: 4px;
          background: white;
          cursor: pointer;
          font: inherit;
        }

        .rte-dialog-actions button[data-primary] {
          background: #2563eb;
          color: white;
          border-color: #2563eb;
        }

        .rte-dialog-actions button[data-danger] {
          color: var(--compa11y-rte-error-color);
          border-color: var(--compa11y-rte-error-color);
        }
      </style>

      <div class="rte-wrapper" part="wrapper" data-compa11y-rte>
        ${label ? `
          <label id="${labelId}" for="${contentId}" class="rte-label" part="label" data-compa11y-rte-label>
            ${label}${this._required ? '<span class="rte-required" aria-hidden="true"> *</span>' : ''}
          </label>
        ` : ''}

        ${description ? `
          <div id="${descId}" class="rte-description" part="description" data-compa11y-rte-description>
            ${description}
          </div>
        ` : ''}

        <div
          id="${toolbarId}"
          class="rte-toolbar"
          role="toolbar"
          aria-label="Formatting"
          aria-controls="${contentId}"
          part="toolbar"
          data-compa11y-rte-toolbar
          ${this._disabled || this._readOnly ? 'data-disabled' : ''}
        >
          <!-- Toolbar buttons rendered dynamically -->
        </div>

        <div
          id="${contentId}"
          class="rte-content"
          part="content"
          data-compa11y-rte-content
          ${label ? `aria-labelledby="${labelId}"` : ''}
          ${ariaLabelAttr && !label ? `aria-label="${ariaLabelAttr}"` : ''}
          ${describedBy ? `aria-describedby="${describedBy}"` : ''}
          ${errorMessage ? 'aria-invalid="true"' : ''}
          ${this._required ? 'aria-required="true"' : ''}
        >
          <!-- Adapter mounts here -->
        </div>

        <slot name="footer"></slot>

        ${errorMessage ? `
          <div id="${errorId}" class="rte-error" role="alert" part="error" data-compa11y-rte-error>
            ${errorMessage}
          </div>
        ` : ''}

        <!-- Link dialog (hidden by default) -->
        <div class="rte-link-dialog-container" style="display: none;" data-compa11y-rte-link-dialog-container></div>

        <!-- Live region for announcements -->
        <div class="visually-hidden" role="status" aria-live="polite" aria-atomic="true" data-compa11y-rte-live></div>
      </div>
    `;

    this.renderToolbar();
    this.mountAdapter();
  }

  protected setupEventListeners(): void {
    // Toolbar click delegation
    const toolbar = this.shadowRoot?.querySelector('[data-compa11y-rte-toolbar]');
    if (toolbar) {
      (toolbar as EventTarget).addEventListener('click', this.handleToolbarClick as EventListener);
    }

    // Toolbar select change delegation
    const headingSelect = this.shadowRoot?.querySelector('[data-compa11y-rte-heading-select]');
    if (headingSelect) {
      headingSelect.addEventListener('change', this.handleHeadingChange as EventListener);
    }
  }

  protected cleanupEventListeners(): void {
    if (this._unmountAdapter) {
      this._unmountAdapter();
      this._unmountAdapter = null;
    }
  }

  protected onAttributeChange(name: string, _old: string | null, next: string | null): void {
    switch (name) {
      case 'disabled':
        this._disabled = next !== null;
        this.syncState();
        break;
      case 'readonly':
        this._readOnly = next !== null;
        this.syncState();
        break;
      case 'required':
        this._required = next !== null;
        break;
      case 'format':
        this._format = (next as RTEFormat) || 'html';
        break;
      case 'error-message':
        this.updateError(next);
        break;
      case 'features':
        if (next) {
          try {
            this._features = { ...DEFAULT_RTE_FEATURES, ...JSON.parse(next) };
            this.renderToolbar();
          } catch {
            // ignore invalid JSON
          }
        }
        break;
    }
  }

  // ---- Private methods ----

  private mountAdapter(): void {
    if (this._unmountAdapter) {
      this._unmountAdapter();
      this._unmountAdapter = null;
    }

    if (!this._adapter) return;

    const content = this.shadowRoot?.querySelector('[data-compa11y-rte-content]') as HTMLElement;
    if (!content) return;

    const label = this.getAttribute('label');
    const labelId = `${this._id}-label`;
    const descId = `${this._id}-desc`;
    const errorId = `${this._id}-error`;
    const description = this.getAttribute('description');
    const errorMessage = this.getAttribute('error-message');

    const describedBy = [
      description ? descId : '',
      errorMessage ? errorId : '',
    ].filter(Boolean).join(' ');

    this._unmountAdapter = this._adapter.mount(content, {
      readOnly: this._readOnly,
      disabled: this._disabled,
      placeholder: this.getAttribute('placeholder') || undefined,
      ariaLabelledBy: label ? labelId : undefined,
      ariaDescribedBy: describedBy || undefined,
      onChange: () => {
        this.emit('compa11y-rte-change', { value: this.value });
      },
      onSelectionChange: () => {
        this._selectionState = this._adapter!.getSelectionState();
        this.syncToolbarState();
      },
      onFocus: () => {
        this.emit('compa11y-rte-focus');
      },
      onBlur: () => {
        this.emit('compa11y-rte-blur');
      },
    });

    // Set initial value if provided
    if (this._value !== undefined) {
      this._adapter.setValue(this._value, this._format);
    }
  }

  private renderToolbar(): void {
    const toolbar = this.shadowRoot?.querySelector('[data-compa11y-rte-toolbar]');
    if (!toolbar) return;

    const f = this._features;
    const btns: string[] = [];

    // Inline marks
    if (f.bold) btns.push(this.toolbarBtn('bold', 'Bold', 'B'));
    if (f.italic) btns.push(this.toolbarBtn('italic', 'Italic', 'I'));
    if (f.underline) btns.push(this.toolbarBtn('underline', 'Underline', 'U'));
    if (f.strikethrough) btns.push(this.toolbarBtn('strikethrough', 'Strikethrough', 'S'));
    if (f.code) btns.push(this.toolbarBtn('code', 'Inline code', '&lt;/&gt;'));

    // Separator after marks
    if (btns.length > 0 && (f.headings || f.lists || f.blockquote || f.link)) {
      btns.push('<div class="rte-separator" role="separator" aria-orientation="vertical"></div>');
    }

    // Headings
    if (f.headings) {
      btns.push(`
        <select class="rte-toolbar-select" aria-label="Text style" data-compa11y-rte-heading-select>
          <option value="paragraph">Normal</option>
          <option value="heading1">Heading 1</option>
          <option value="heading2">Heading 2</option>
          <option value="heading3">Heading 3</option>
          <option value="heading4">Heading 4</option>
          <option value="heading5">Heading 5</option>
          <option value="heading6">Heading 6</option>
        </select>
      `);
    }

    // Lists
    if (f.lists) {
      btns.push(this.toolbarBtn('bulletList', 'Bulleted list', '• List'));
      btns.push(this.toolbarBtn('numberList', 'Numbered list', '1. List'));
    }

    // Blockquote
    if (f.blockquote) {
      btns.push(this.toolbarBtn('blockquote', 'Blockquote', 'Quote'));
    }

    // Code block (separate from inline code)
    if (f.code) {
      btns.push(this.toolbarBtn('codeBlock', 'Code block', 'Code Block'));
    }

    // Separator before link/undo
    const hasMore = f.link || f.image;
    if (hasMore) {
      btns.push('<div class="rte-separator" role="separator" aria-orientation="vertical"></div>');
    }

    // Link
    if (f.link) {
      btns.push(this.toolbarBtn('link', 'Insert link', 'Link'));
    }

    // Image
    if (f.image) {
      btns.push(this.toolbarBtn('image', 'Insert image', 'Image'));
    }

    // Always include undo/redo
    btns.push('<div class="rte-separator" role="separator" aria-orientation="vertical"></div>');
    btns.push(this.toolbarBtn('undo', 'Undo', 'Undo'));
    btns.push(this.toolbarBtn('redo', 'Redo', 'Redo'));

    toolbar.innerHTML = btns.join('');

    // Re-attach heading select listener
    const headingSelect = this.shadowRoot?.querySelector('[data-compa11y-rte-heading-select]');
    if (headingSelect) {
      headingSelect.addEventListener('change', this.handleHeadingChange as EventListener);
    }
  }

  private toolbarBtn(action: string, label: string, content: string): string {
    return `<button type="button" class="rte-toolbar-btn" aria-label="${label}" aria-pressed="false" data-action="${action}" data-compa11y-rte-button>${content}</button>`;
  }

  private handleToolbarClick = (e: Event): void => {
    const target = (e.target as HTMLElement).closest('[data-action]') as HTMLElement | null;
    if (!target || this._disabled || this._readOnly) return;
    if (!this._adapter) return;

    const action = target.getAttribute('data-action');
    if (!action) return;

    const markActions: RTEMark[] = ['bold', 'italic', 'underline', 'strikethrough', 'code'];
    if (markActions.includes(action as RTEMark)) {
      this._adapter.commands.toggleMark(action as RTEMark);
    } else if (action === 'bulletList') {
      this._adapter.commands.toggleBulletList();
    } else if (action === 'numberList') {
      this._adapter.commands.toggleNumberList();
    } else if (action === 'blockquote') {
      const isActive = this._selectionState.block === 'blockquote';
      this._adapter.commands.setBlock(isActive ? 'paragraph' : 'blockquote');
    } else if (action === 'codeBlock') {
      this._adapter.commands.toggleCodeBlock();
    } else if (action === 'link') {
      this.openLinkDialog();
    } else if (action === 'image') {
      this.openImageDialog();
    } else if (action === 'undo') {
      this._adapter.commands.undo();
    } else if (action === 'redo') {
      this._adapter.commands.redo();
    }

    // Return focus to editor
    requestAnimationFrame(() => this._adapter?.commands.focus());
  };

  private handleHeadingChange = (e: Event): void => {
    if (this._disabled || this._readOnly || !this._adapter) return;
    const value = (e.target as HTMLSelectElement).value as RTEBlock;
    this._adapter.commands.setBlock(value);
    requestAnimationFrame(() => this._adapter?.commands.focus());
  };

  private syncToolbarState(): void {
    const s = this._selectionState;

    // Update mark buttons
    const markBtns = this.shadowRoot?.querySelectorAll('[data-compa11y-rte-button]');
    markBtns?.forEach((btn) => {
      const action = (btn as HTMLElement).getAttribute('data-action');
      if (!action) return;

      const markActions: RTEMark[] = ['bold', 'italic', 'underline', 'strikethrough', 'code'];
      if (markActions.includes(action as RTEMark)) {
        btn.setAttribute('aria-pressed', String(!!s.marks[action as RTEMark]));
      } else if (action === 'bulletList') {
        btn.setAttribute('aria-pressed', String(s.block === 'bulletList'));
      } else if (action === 'numberList') {
        btn.setAttribute('aria-pressed', String(s.block === 'numberList'));
      } else if (action === 'blockquote') {
        btn.setAttribute('aria-pressed', String(s.block === 'blockquote'));
      } else if (action === 'codeBlock') {
        btn.setAttribute('aria-pressed', String(s.block === 'codeBlock'));
      } else if (action === 'link') {
        btn.setAttribute('aria-pressed', String(!!s.link));
        btn.setAttribute('aria-label', s.link ? 'Edit link' : 'Insert link');
      } else if (action === 'undo') {
        (btn as HTMLButtonElement).disabled = !s.canUndo;
      } else if (action === 'redo') {
        (btn as HTMLButtonElement).disabled = !s.canRedo;
      }
    });

    // Update heading select
    const headingSelect = this.shadowRoot?.querySelector('[data-compa11y-rte-heading-select]') as HTMLSelectElement | null;
    if (headingSelect) {
      headingSelect.value = s.block.startsWith('heading') ? s.block : 'paragraph';
    }
  }

  private syncState(): void {
    const toolbar = this.shadowRoot?.querySelector('[data-compa11y-rte-toolbar]') as HTMLElement | null;
    if (toolbar) {
      if (this._disabled || this._readOnly) {
        toolbar.setAttribute('data-disabled', '');
      } else {
        toolbar.removeAttribute('data-disabled');
      }
    }
  }

  private updateError(errorMessage: string | null): void {
    const errorEl = this.shadowRoot?.querySelector('[data-compa11y-rte-error]');
    const contentEl = this.shadowRoot?.querySelector('[data-compa11y-rte-content]');

    if (errorMessage) {
      if (errorEl) {
        errorEl.textContent = errorMessage;
      }
      contentEl?.setAttribute('aria-invalid', 'true');
    } else {
      if (errorEl) {
        errorEl.textContent = '';
      }
      contentEl?.removeAttribute('aria-invalid');
    }
  }

  // ---- Link dialog ----

  private openLinkDialog(): void {
    if (this._linkDialogOpen) return;
    this._linkDialogOpen = true;

    const container = this.shadowRoot?.querySelector('[data-compa11y-rte-link-dialog-container]') as HTMLElement;
    if (!container) return;

    const link = this._selectionState.link;
    const isEdit = !!link;

    const titleId = `${this._id}-link-title`;
    const urlId = `${this._id}-link-url`;
    const textId = `${this._id}-link-text`;
    const urlErrorId = `${this._id}-link-url-error`;

    container.style.display = '';
    container.innerHTML = `
      <div class="rte-dialog-overlay" data-compa11y-rte-link-dialog-overlay>
        <div class="rte-dialog" role="dialog" aria-modal="true" aria-labelledby="${titleId}" data-compa11y-rte-link-dialog>
          <h2 id="${titleId}">${isEdit ? 'Edit link' : 'Insert link'}</h2>
          <div class="rte-dialog-field">
            <label for="${urlId}">URL</label>
            <input id="${urlId}" type="url" value="${link?.href ?? ''}" data-compa11y-rte-link-url />
            <div id="${urlErrorId}" class="rte-dialog-field-error" role="alert" style="display: none;"></div>
          </div>
          <div class="rte-dialog-field">
            <label for="${textId}">Link text</label>
            <input id="${textId}" type="text" value="${link?.text ?? ''}" data-compa11y-rte-link-text />
          </div>
          <div class="rte-dialog-actions">
            ${isEdit ? '<button type="button" data-danger data-compa11y-rte-link-remove>Remove link</button>' : ''}
            <button type="button" data-compa11y-rte-link-cancel>Cancel</button>
            <button type="button" data-primary data-compa11y-rte-link-apply>Apply</button>
          </div>
        </div>
      </div>
    `;

    // Focus URL input
    requestAnimationFrame(() => {
      const urlInput = this.shadowRoot?.querySelector('[data-compa11y-rte-link-url]') as HTMLInputElement;
      urlInput?.focus();
    });

    // Event listeners
    const overlay = container.querySelector('[data-compa11y-rte-link-dialog-overlay]');
    overlay?.addEventListener('click', (e) => {
      if (e.target === overlay) this.closeLinkDialog();
    });

    container.querySelector('[data-compa11y-rte-link-cancel]')?.addEventListener('click', () => this.closeLinkDialog());
    container.querySelector('[data-compa11y-rte-link-apply]')?.addEventListener('click', () => this.applyLink());
    container.querySelector('[data-compa11y-rte-link-remove]')?.addEventListener('click', () => this.removeLinkFromDialog());

    // Enter to apply, Escape to close
    container.addEventListener('keydown', (e: Event) => {
      const ke = e as KeyboardEvent;
      if (ke.key === 'Escape') {
        this.closeLinkDialog();
      } else if (ke.key === 'Enter' && !ke.shiftKey) {
        ke.preventDefault();
        this.applyLink();
      }
    });

    announce('Link dialog opened', { politeness: 'polite' });
  }

  private closeLinkDialog(): void {
    this._linkDialogOpen = false;
    const container = this.shadowRoot?.querySelector('[data-compa11y-rte-link-dialog-container]') as HTMLElement;
    if (container) {
      container.style.display = 'none';
      container.innerHTML = '';
    }
    announce('Link dialog closed', { politeness: 'polite' });
    requestAnimationFrame(() => this._adapter?.commands.focus());
  }

  private applyLink(): void {
    const urlInput = this.shadowRoot?.querySelector('[data-compa11y-rte-link-url]') as HTMLInputElement;
    const textInput = this.shadowRoot?.querySelector('[data-compa11y-rte-link-text]') as HTMLInputElement;
    const urlErrorEl = this.shadowRoot?.querySelector(`#${this._id}-link-url-error`) as HTMLElement;

    const href = urlInput?.value.trim() || '';
    if (!href) {
      if (urlInput) urlInput.setAttribute('aria-invalid', 'true');
      if (urlErrorEl) {
        urlErrorEl.textContent = 'URL is required';
        urlErrorEl.style.display = '';
      }
      return;
    }

    // Auto-prepend https:// for bare domains (e.g. www.google.com)
    const normalizedHref = /^(https?:\/\/|\/|#|mailto:|tel:)/.test(href)
      ? href
      : `https://${href}`;
    const text = textInput?.value.trim() || undefined;
    // Close dialog first so focus can return to editor, then execute command
    this.closeLinkDialog();
    requestAnimationFrame(() => {
      this._adapter?.commands.insertOrEditLink({ href: normalizedHref, text });
      announce('Link applied', { politeness: 'polite' });
      // Fire change event so output updates
      const value = this._adapter?.getValue(this.getAttribute('format') as any || 'html');
      this.emit('compa11y-rte-change', { value, format: this.getAttribute('format') || 'html' });
    });
  }

  private removeLinkFromDialog(): void {
    // Close dialog first so focus can return to editor, then execute command
    this.closeLinkDialog();
    requestAnimationFrame(() => {
      this._adapter?.commands.removeLink();
      announce('Link removed', { politeness: 'polite' });
      const value = this._adapter?.getValue(this.getAttribute('format') as any || 'html');
      this.emit('compa11y-rte-change', { value, format: this.getAttribute('format') || 'html' });
    });
  }

  // ---- Image dialog (simplified) ----

  private openImageDialog(): void {
    if (!this._adapter?.commands.insertImage) {
      warnings.warning('Image feature enabled but adapter does not support insertImage.');
      return;
    }

    // Similar pattern to link dialog — create overlay + form
    const container = this.shadowRoot?.querySelector('[data-compa11y-rte-link-dialog-container]') as HTMLElement;
    if (!container) return;

    const titleId = `${this._id}-image-title`;
    const srcId = `${this._id}-image-src`;
    const altId = `${this._id}-image-alt`;

    container.style.display = '';
    container.innerHTML = `
      <div class="rte-dialog-overlay" data-compa11y-rte-image-dialog-overlay>
        <div class="rte-dialog" role="dialog" aria-modal="true" aria-labelledby="${titleId}" data-compa11y-rte-image-dialog>
          <h2 id="${titleId}">Insert image</h2>
          <div class="rte-dialog-field">
            <label for="${srcId}">Image URL</label>
            <input id="${srcId}" type="url" data-compa11y-rte-image-src />
          </div>
          <div class="rte-dialog-field">
            <label for="${altId}">Alt text (required)</label>
            <input id="${altId}" type="text" data-compa11y-rte-image-alt />
          </div>
          <div class="rte-dialog-actions">
            <button type="button" data-compa11y-rte-image-cancel>Cancel</button>
            <button type="button" data-primary data-compa11y-rte-image-insert>Insert image</button>
          </div>
        </div>
      </div>
    `;

    requestAnimationFrame(() => {
      const srcInput = this.shadowRoot?.querySelector('[data-compa11y-rte-image-src]') as HTMLInputElement;
      srcInput?.focus();
    });

    const overlay = container.querySelector('[data-compa11y-rte-image-dialog-overlay]');
    overlay?.addEventListener('click', (e) => {
      if (e.target === overlay) this.closeImageDialog();
    });

    container.querySelector('[data-compa11y-rte-image-cancel]')?.addEventListener('click', () => this.closeImageDialog());
    container.querySelector('[data-compa11y-rte-image-insert]')?.addEventListener('click', () => {
      const srcInput = this.shadowRoot?.querySelector('[data-compa11y-rte-image-src]') as HTMLInputElement;
      const altInput = this.shadowRoot?.querySelector('[data-compa11y-rte-image-alt]') as HTMLInputElement;

      const src = srcInput?.value.trim() || '';
      const alt = altInput?.value.trim() || '';

      if (!src || !alt) {
        if (!src) srcInput?.setAttribute('aria-invalid', 'true');
        if (!alt) altInput?.setAttribute('aria-invalid', 'true');
        return;
      }

      this._adapter?.commands.insertImage?.({ src, alt });
      announce('Image inserted', { politeness: 'polite' });
      this.closeImageDialog();
    });

    container.addEventListener('keydown', (e: Event) => {
      const ke = e as KeyboardEvent;
      if (ke.key === 'Escape') this.closeImageDialog();
    });

    announce('Image dialog opened', { politeness: 'polite' });
  }

  private closeImageDialog(): void {
    const container = this.shadowRoot?.querySelector('[data-compa11y-rte-link-dialog-container]') as HTMLElement;
    if (container) {
      container.style.display = 'none';
      container.innerHTML = '';
    }
    announce('Image dialog closed', { politeness: 'polite' });
    requestAnimationFrame(() => this._adapter?.commands.focus());
  }
}

defineElement('compa11y-rich-text-editor', Compa11yRichTextEditor);
