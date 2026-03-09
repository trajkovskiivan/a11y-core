/**
 * compa11y FileUpload Web Component
 *
 * An accessible file upload component that supports keyboard-triggered file
 * selection, drag-and-drop, a semantic file list with per-file remove buttons,
 * and screen reader announcements.
 *
 * Basic usage:
 * <compa11y-file-upload
 *   label="Upload resume"
 *   accept=".pdf,.docx"
 *   max-size-bytes="5000000"
 * ></compa11y-file-upload>
 *
 * With multiple files:
 * <compa11y-file-upload
 *   label="Upload images"
 *   accept="image/*"
 *   multiple
 *   max-files="5"
 *   max-size-bytes="5000000"
 * >
 *   <span slot="description">PNG, JPG or GIF. Max 5MB each.</span>
 *   <span slot="trigger">Browse files</span>
 * </compa11y-file-upload>
 *
 * Events:
 *   compa11y-file-upload-add      { files: InternalFile[] }
 *   compa11y-file-upload-remove   { file: InternalFile }
 *   compa11y-file-upload-error    { errors: string[] }
 *   compa11y-file-upload-change   { files: InternalFile[] }
 *
 * Attributes:
 *   label, aria-label, aria-labelledby
 *   accept, multiple, max-files, max-size-bytes
 *   disabled, required, name, error
 *
 * Slots:
 *   trigger      — custom trigger content
 *   description  — hint / constraints text
 *   (default)    — additional content
 *
 * CSS custom properties:
 *   --compa11y-file-upload-dropzone-border, --compa11y-file-upload-dropzone-bg
 *   --compa11y-file-upload-dropzone-border-active-color, --compa11y-file-upload-dropzone-bg-active
 *   --compa11y-file-upload-border-radius, --compa11y-file-upload-item-bg
 *   --compa11y-file-upload-item-border, --compa11y-file-upload-error-color
 *   --compa11y-file-upload-progress-bg, --compa11y-file-upload-progress-fill
 *   --compa11y-file-upload-label-color, --compa11y-file-upload-label-size
 *   --compa11y-file-upload-hint-color, --compa11y-focus-color
 */

import { announcePolite, announceAssertive, createComponentWarnings } from '@compa11y/core';
import { Compa11yElement, defineElement } from '../utils/base-element';
import { FILE_UPLOAD_STYLES } from '../utils/styles';

const warn = createComponentWarnings('FileUpload');

// =============================================================================
// SVG helpers
// =============================================================================

const UPLOAD_ICON = `
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <polyline points="17,8 12,3 7,8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
`;

const REMOVE_ICON = `
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" focusable="false">
    <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  </svg>
`;

// =============================================================================
// Internal file model
// =============================================================================

interface InternalFile {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  progress?: number;
  error?: string;
}

// =============================================================================
// Helpers
// =============================================================================

let fileIdCounter = 0;

function generateFileId(): string {
  return `file-${++fileIdCounter}-${Date.now()}`;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} bytes`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function matchesAccept(file: File, accept: string): boolean {
  const tokens = accept.split(',').map(t => t.trim().toLowerCase());
  const fileType = file.type.toLowerCase();
  const fileExt = '.' + (file.name.split('.').pop()?.toLowerCase() ?? '');

  return tokens.some(token => {
    if (token.startsWith('.')) return fileExt === token;
    if (token.endsWith('/*'))
      return fileType.startsWith(token.replace('/*', '/'));
    return fileType === token;
  });
}

// =============================================================================
// Component
// =============================================================================

export class Compa11yFileUpload extends Compa11yElement {
  // ── State ──────────────────────────────────────────────────────────────────
  private _files: InternalFile[] = [];
  private _disabled = false;
  private _dragCounter = 0;

  // ── DOM refs ───────────────────────────────────────────────────────────────
  private _inputEl: HTMLInputElement | null = null;
  private _dropzoneEl: HTMLDivElement | null = null;
  private _fileListEl: HTMLUListElement | null = null;
  private _errorEl: HTMLDivElement | null = null;

  static get observedAttributes(): string[] {
    return [
      'label',
      'aria-label',
      'aria-labelledby',
      'accept',
      'multiple',
      'max-files',
      'max-size-bytes',
      'disabled',
      'required',
      'name',
      'error',
    ];
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  /** Current list of files (read-only copy) */
  get files(): InternalFile[] {
    return [...this._files];
  }

  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(v: boolean) {
    this._disabled = Boolean(v);
    this.toggleAttribute('disabled', this._disabled);
    this._syncDisabled();
  }

  /** Programmatically open the native file picker */
  openFilePicker(): void {
    if (!this._disabled) this._inputEl?.click();
  }

  /** Remove a file by ID */
  removeFile(fileId: string): void {
    const index = this._files.findIndex(f => f.id === fileId);
    if (index < 0) return;
    const removed = this._files[index]!;
    this._files.splice(index, 1);
    this._renderFileList();

    announcePolite(`${removed.file.name} removed`);
    this.emit('compa11y-file-upload-remove', { file: removed });
    this.emit('compa11y-file-upload-change', { files: [...this._files] });

    // Focus management
    requestAnimationFrame(() => {
      if (!this.shadowRoot) return;
      if (this._files.length === 0) {
        this._dropzoneEl?.focus();
      } else {
        const removeButtons = this.shadowRoot.querySelectorAll('.file-upload-item-remove');
        const nextIndex = Math.min(index, this._files.length - 1);
        (removeButtons[nextIndex] as HTMLElement)?.focus();
      }
    });
  }

  /** Clear all files */
  clearFiles(): void {
    this._files = [];
    this._renderFileList();
    this.emit('compa11y-file-upload-change', { files: [] });
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
          'FileUpload has no accessible label. Provide a label, aria-label, or aria-labelledby attribute.'
        );
      }
    }

    this._disabled = this.hasAttribute('disabled');
  }

  protected render(): void {
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });

    const label = this.getAttribute('label') ?? '';
    const error = this.getAttribute('error') ?? '';
    const descId = `${this._id}-desc`;
    const errorId = `${this._id}-error`;
    const inputId = `${this._id}-input`;
    const accept = this.getAttribute('accept') ?? '';
    const multiple = this.hasAttribute('multiple');
    const name = this.getAttribute('name') ?? '';

    // Build aria-describedby for dropzone
    const describedByParts: string[] = [];
    // Check if description slot has content (we'll update after render)
    if (error) describedByParts.push(errorId);

    this.shadowRoot!.innerHTML = `
      <style>${FILE_UPLOAD_STYLES}</style>
      <div class="file-upload-root" part="root">

        ${label ? `
          <label
            id="${this._id}-label"
            for="${inputId}"
            class="file-upload-label"
            part="label"
          >${label}</label>
        ` : ''}

        <div id="${descId}" class="file-upload-description" part="description">
          <slot name="description"></slot>
        </div>

        <div
          class="file-upload-dropzone"
          part="dropzone"
          role="button"
          tabindex="${this._disabled ? '-1' : '0'}"
          ${error ? `aria-invalid="true"` : ''}
          ${this.hasAttribute('required') ? 'aria-required="true"' : ''}
          aria-describedby="${descId}${error ? ` ${errorId}` : ''}"
        >
          <span class="file-upload-dropzone-icon" aria-hidden="true">
            ${UPLOAD_ICON}
          </span>
          <slot name="trigger">
            <span>Choose files or drag and drop</span>
          </slot>
        </div>

        <input
          id="${inputId}"
          type="file"
          class="visually-hidden"
          ${accept ? `accept="${accept}"` : ''}
          ${multiple ? 'multiple' : ''}
          ${this._disabled ? 'disabled' : ''}
          ${name ? `name="${name}"` : ''}
          tabindex="-1"
          aria-hidden="true"
        />

        <ul class="file-upload-list" part="file-list" role="list"></ul>

        ${error ? `
          <div id="${errorId}" class="file-upload-error" role="alert" part="error">${error}</div>
        ` : ''}

        <div
          class="file-upload-status visually-hidden"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        ></div>

        <slot></slot>
      </div>
    `;

    // Cache refs
    this._inputEl = this.shadowRoot!.querySelector('input[type="file"]');
    this._dropzoneEl = this.shadowRoot!.querySelector('.file-upload-dropzone');
    this._fileListEl = this.shadowRoot!.querySelector('.file-upload-list');
    this._errorEl = this.shadowRoot!.querySelector('.file-upload-error');
  }

  protected setupEventListeners(): void {
    if (!this.shadowRoot) return;

    this._inputEl?.addEventListener('change', this._handleInputChange);
    this._dropzoneEl?.addEventListener('click', this._handleDropzoneClick);
    this._dropzoneEl?.addEventListener('keydown', this._handleDropzoneKeyDown as EventListener);
    this._dropzoneEl?.addEventListener('dragenter', this._handleDragEnter as EventListener);
    this._dropzoneEl?.addEventListener('dragover', this._handleDragOver as EventListener);
    this._dropzoneEl?.addEventListener('dragleave', this._handleDragLeave as EventListener);
    this._dropzoneEl?.addEventListener('drop', this._handleDrop as EventListener);
  }

  protected cleanupEventListeners(): void {
    this._inputEl?.removeEventListener('change', this._handleInputChange);
    this._dropzoneEl?.removeEventListener('click', this._handleDropzoneClick);
    this._dropzoneEl?.removeEventListener('keydown', this._handleDropzoneKeyDown as EventListener);
    this._dropzoneEl?.removeEventListener('dragenter', this._handleDragEnter as EventListener);
    this._dropzoneEl?.removeEventListener('dragover', this._handleDragOver as EventListener);
    this._dropzoneEl?.removeEventListener('dragleave', this._handleDragLeave as EventListener);
    this._dropzoneEl?.removeEventListener('drop', this._handleDrop as EventListener);
  }

  // ── Event handlers ─────────────────────────────────────────────────────────

  private _handleInputChange = (e: Event): void => {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this._addFiles(input.files);
    }
    // Reset so re-selecting same file triggers change
    input.value = '';
  };

  private _handleDropzoneClick = (): void => {
    if (!this._disabled) this._inputEl?.click();
  };

  private _handleDropzoneKeyDown = (e: KeyboardEvent): void => {
    if (this._disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this._inputEl?.click();
    }
  };

  private _handleDragEnter = (e: DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    if (this._disabled) return;
    this._dragCounter++;
    if (e.dataTransfer?.types.includes('Files')) {
      this._dropzoneEl?.setAttribute('data-drag-over', '');
    }
  };

  private _handleDragOver = (e: DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
  };

  private _handleDragLeave = (e: DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    this._dragCounter--;
    if (this._dragCounter <= 0) {
      this._dragCounter = 0;
      this._dropzoneEl?.removeAttribute('data-drag-over');
    }
  };

  private _handleDrop = (e: DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    this._dragCounter = 0;
    this._dropzoneEl?.removeAttribute('data-drag-over');
    if (this._disabled) return;
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      this._addFiles(e.dataTransfer.files);
    }
  };

  // ── File management ────────────────────────────────────────────────────────

  private _addFiles(fileList: FileList): void {
    const accept = this.getAttribute('accept') ?? '';
    const maxSizeBytes = parseInt(this.getAttribute('max-size-bytes') ?? '0', 10) || 0;
    const maxFiles = parseInt(this.getAttribute('max-files') ?? '0', 10) || 0;
    const multiple = this.hasAttribute('multiple');

    const incoming = Array.from(fileList);
    const accepted: InternalFile[] = [];
    const errors: string[] = [];

    for (const file of incoming) {
      // Type check
      if (accept && !matchesAccept(file, accept)) {
        errors.push(`${file.name}: File type not accepted`);
        continue;
      }
      // Size check
      if (maxSizeBytes && file.size > maxSizeBytes) {
        errors.push(
          `${file.name}: File exceeds maximum size (${formatFileSize(maxSizeBytes)})`
        );
        continue;
      }
      // Count check
      if (maxFiles && this._files.length + accepted.length >= maxFiles) {
        errors.push(`Maximum number of files exceeded (${maxFiles})`);
        break;
      }

      accepted.push({
        id: generateFileId(),
        file,
        status: 'pending',
      });
    }

    // Handle errors
    if (errors.length > 0) {
      const errMsg = errors.join('. ');
      this._setError(errMsg);
      announceAssertive(errMsg);
      this.emit('compa11y-file-upload-error', { errors });
    } else {
      this._clearError();
    }

    if (accepted.length > 0) {
      if (multiple) {
        this._files.push(...accepted);
      } else {
        this._files = [accepted[0]!];
      }

      this._renderFileList();
      this.emit('compa11y-file-upload-add', { files: accepted });
      this.emit('compa11y-file-upload-change', { files: [...this._files] });

      // Announcement
      if (accepted.length === 1) {
        announcePolite(`${accepted[0]!.file.name} added`);
      } else {
        announcePolite(`${accepted.length} files added`);
      }
    }
  }

  private _renderFileList(): void {
    if (!this._fileListEl) return;

    // Clear existing items
    this._fileListEl.innerHTML = '';

    for (const f of this._files) {
      const li = document.createElement('li');
      li.className = 'file-upload-item';
      li.setAttribute('data-status', f.status);

      const nameSpan = document.createElement('span');
      nameSpan.className = 'file-upload-item-name';
      nameSpan.textContent = f.file.name;
      li.appendChild(nameSpan);

      const sizeSpan = document.createElement('span');
      sizeSpan.className = 'file-upload-item-size';
      sizeSpan.textContent = formatFileSize(f.file.size);
      li.appendChild(sizeSpan);

      if (f.status === 'uploading' && f.progress !== undefined) {
        const progress = document.createElement('span');
        progress.className = 'file-upload-item-progress';
        progress.setAttribute('role', 'progressbar');
        progress.setAttribute('aria-valuenow', String(f.progress));
        progress.setAttribute('aria-valuemin', '0');
        progress.setAttribute('aria-valuemax', '100');
        progress.setAttribute('aria-label', `Uploading ${f.file.name}`);

        const fill = document.createElement('span');
        fill.className = 'file-upload-item-progress-fill';
        fill.style.width = `${f.progress}%`;
        progress.appendChild(fill);
        li.appendChild(progress);
      }

      if (f.status === 'error' && f.error) {
        const errSpan = document.createElement('span');
        errSpan.className = 'file-upload-item-error';
        errSpan.setAttribute('role', 'alert');
        errSpan.textContent = f.error;
        li.appendChild(errSpan);
      }

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'file-upload-item-remove';
      removeBtn.setAttribute('aria-label', `Remove ${f.file.name}`);
      removeBtn.innerHTML = REMOVE_ICON;
      if (this._disabled) removeBtn.disabled = true;

      const fileId = f.id;
      removeBtn.addEventListener('click', () => {
        this.removeFile(fileId);
      });

      li.appendChild(removeBtn);
      this._fileListEl.appendChild(li);
    }
  }

  private _setError(message: string): void {
    if (!this.shadowRoot) return;
    const errorId = `${this._id}-error`;

    if (!this._errorEl) {
      const div = document.createElement('div');
      div.id = errorId;
      div.className = 'file-upload-error';
      div.setAttribute('role', 'alert');
      div.setAttribute('part', 'error');
      div.textContent = message;

      const root = this.shadowRoot.querySelector('.file-upload-root');
      const status = this.shadowRoot.querySelector('.file-upload-status');
      root?.insertBefore(div, status);
      this._errorEl = div;
    } else {
      this._errorEl.textContent = message;
    }

    // Update aria-invalid on dropzone
    this._dropzoneEl?.setAttribute('aria-invalid', 'true');
    this._updateDescribedBy();
  }

  private _clearError(): void {
    if (this._errorEl && !this.getAttribute('error')) {
      this._errorEl.remove();
      this._errorEl = null;
      this._dropzoneEl?.removeAttribute('aria-invalid');
      this._updateDescribedBy();
    }
  }

  private _updateDescribedBy(): void {
    if (!this._dropzoneEl) return;
    const parts: string[] = [];
    const descEl = this.shadowRoot?.querySelector('.file-upload-description');
    if (descEl) parts.push(`${this._id}-desc`);
    if (this._errorEl) parts.push(this._errorEl.id);
    const val = parts.join(' ');
    if (val) {
      this._dropzoneEl.setAttribute('aria-describedby', val);
    } else {
      this._dropzoneEl.removeAttribute('aria-describedby');
    }
  }

  private _syncDisabled(): void {
    if (this._inputEl) {
      this._inputEl.disabled = this._disabled;
    }
    if (this._dropzoneEl) {
      this._dropzoneEl.setAttribute('tabindex', this._disabled ? '-1' : '0');
      if (this._disabled) {
        this._dropzoneEl.setAttribute('aria-disabled', 'true');
      } else {
        this._dropzoneEl.removeAttribute('aria-disabled');
      }
    }
    // Update remove buttons
    if (this._fileListEl) {
      const buttons = this._fileListEl.querySelectorAll('.file-upload-item-remove');
      buttons.forEach(btn => {
        (btn as HTMLButtonElement).disabled = this._disabled;
      });
    }
  }

  // ── Attribute changes ──────────────────────────────────────────────────────

  protected onAttributeChange(
    name: string,
    _old: string | null,
    next: string | null
  ): void {
    switch (name) {
      case 'disabled':
        this._disabled = next !== null;
        this._syncDisabled();
        break;

      case 'error': {
        const hasError = Boolean(next);
        if (hasError) {
          this._setError(next!);
        } else {
          this._clearError();
        }
        break;
      }

      case 'label': {
        const labelEl = this.shadowRoot?.querySelector(`#${this._id}-label`);
        if (labelEl) {
          labelEl.textContent = next ?? '';
        }
        break;
      }

      case 'accept':
      case 'multiple':
      case 'name':
        // Sync to the hidden input
        if (this._inputEl) {
          if (name === 'accept') {
            if (next) this._inputEl.setAttribute('accept', next);
            else this._inputEl.removeAttribute('accept');
          } else if (name === 'multiple') {
            this._inputEl.toggleAttribute('multiple', next !== null);
            this.toggleAttribute('multiple', next !== null);
          } else if (name === 'name') {
            if (next) this._inputEl.setAttribute('name', next);
            else this._inputEl.removeAttribute('name');
          }
        }
        break;

      case 'required':
        if (this._dropzoneEl) {
          if (next !== null) {
            this._dropzoneEl.setAttribute('aria-required', 'true');
          } else {
            this._dropzoneEl.removeAttribute('aria-required');
          }
        }
        break;
    }
  }

  /** Focus the dropzone */
  focus(): void {
    this._dropzoneEl?.focus();
  }

  /** Blur the dropzone */
  blur(): void {
    this._dropzoneEl?.blur();
  }
}

defineElement('compa11y-file-upload', Compa11yFileUpload);
