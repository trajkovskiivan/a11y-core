/**
 * compa11y Toast Web Component
 *
 * A toast notification system that manages stacking, auto-dismiss, and
 * screen-reader announcements via an aria-live region.
 *
 * Usage (imperative):
 *   <compa11y-toast position="bottom-right"></compa11y-toast>
 *
 *   const toast = document.querySelector('compa11y-toast');
 *   toast.add({ type: 'success', title: 'Saved', description: 'Changes saved.' });
 *
 * Usage (declarative, for static toasts):
 *   <compa11y-toast>
 *     <div slot="toast" data-type="info">
 *       <span slot="title">Hello</span>
 *     </div>
 *   </compa11y-toast>
 */

import { Compa11yElement, defineElement } from '../utils/base-element';
import { TOAST_STYLES } from '../utils/styles';

export interface ToastOptions {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastEntry extends Required<Pick<ToastOptions, 'type'>> {
  id: string;
  title?: string;
  description?: string;
  duration: number;
  action?: ToastOptions['action'];
  timerId: ReturnType<typeof setTimeout> | null;
  remaining: number;
  startTime: number;
}

export class Compa11yToast extends Compa11yElement {
  private _toasts: ToastEntry[] = [];
  private _counter = 0;
  private _containerEl: HTMLElement | null = null;
  private _maxToasts = 5;

  static get observedAttributes() {
    return ['position', 'duration', 'max-toasts', 'label'];
  }

  get position(): string {
    return this.getAttribute('position') || 'bottom-right';
  }

  get duration(): number {
    const val = this.getAttribute('duration');
    return val ? parseInt(val, 10) : 5000;
  }

  get maxToasts(): number {
    const val = this.getAttribute('max-toasts');
    return val ? parseInt(val, 10) : 5;
  }

  get label(): string {
    return this.getAttribute('label') || 'Notifications';
  }

  protected setupAccessibility(): void {
    // Accessibility attributes are set on the shadow DOM container in render()
  }

  protected render(): void {
    const shadow = this.attachShadow({ mode: 'open' });

    shadow.innerHTML = `
      <style>${TOAST_STYLES}</style>
      <div
        class="toast-container"
        role="region"
        aria-label="${this.label}"
        aria-live="polite"
        aria-relevant="additions removals"
      ></div>
    `;

    this._containerEl =
      shadow.querySelector('.toast-container') as HTMLElement;
  }

  protected setupEventListeners(): void {
    // Delegate click events on the container
    this._containerEl?.addEventListener('click', this._handleClick);
  }

  protected cleanupEventListeners(): void {
    this._containerEl?.removeEventListener('click', this._handleClick);

    // Clear all active timers
    for (const toast of this._toasts) {
      if (toast.timerId) clearTimeout(toast.timerId);
    }
    this._toasts = [];
  }

  protected onAttributeChange(
    name: string,
    _oldValue: string | null,
    newValue: string | null
  ): void {
    if (name === 'max-toasts' && newValue) {
      this._maxToasts = parseInt(newValue, 10);
    }
    if (name === 'label' && this._containerEl) {
      this._containerEl.setAttribute('aria-label', newValue || 'Notifications');
    }
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Add a toast notification. Returns the toast ID.
   */
  add(options: ToastOptions): string {
    const id = `toast-${++this._counter}`;
    const duration = options.duration ?? this.duration;

    const entry: ToastEntry = {
      id,
      type: options.type || 'info',
      title: options.title,
      description: options.description,
      duration,
      action: options.action,
      timerId: null,
      remaining: duration,
      startTime: Date.now(),
    };

    this._toasts.push(entry);

    // Enforce max toasts — remove oldest
    while (this._toasts.length > this._maxToasts) {
      const oldest = this._toasts.shift();
      if (oldest) {
        if (oldest.timerId) clearTimeout(oldest.timerId);
        this._removeElement(oldest.id);
      }
    }

    this._renderToast(entry);
    this._startTimer(entry);

    this.emit('compa11y-toast-add', { id, ...options });

    return id;
  }

  /**
   * Remove a toast by ID.
   */
  removeToast(id: string): void {
    const index = this._toasts.findIndex((t) => t.id === id);
    if (index === -1) return;

    const entry = this._toasts[index];
    if (entry && entry.timerId) clearTimeout(entry.timerId);
    this._toasts.splice(index, 1);
    this._removeElement(id);

    this.emit('compa11y-toast-remove', { id });
  }

  /**
   * Remove all toasts.
   */
  clear(): void {
    for (const toast of this._toasts) {
      if (toast.timerId) clearTimeout(toast.timerId);
    }
    this._toasts = [];
    if (this._containerEl) {
      this._containerEl.innerHTML = '';
    }
  }

  // ---------------------------------------------------------------------------
  // Internal
  // ---------------------------------------------------------------------------

  private _renderToast(entry: ToastEntry): void {
    if (!this._containerEl) return;

    const isUrgent = entry.type === 'error' || entry.type === 'warning';

    const el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('data-toast-id', entry.id);
    el.setAttribute('data-type', entry.type);
    el.setAttribute('role', isUrgent ? 'alert' : 'status');
    el.setAttribute('aria-atomic', 'true');
    el.setAttribute('tabindex', '0');

    let html = '<div class="toast-content">';
    if (entry.title) {
      html += `<div class="toast-title">${this._escapeHtml(entry.title)}</div>`;
    }
    if (entry.description) {
      html += `<div class="toast-description">${this._escapeHtml(entry.description)}</div>`;
    }
    if (entry.action) {
      html += `<button type="button" class="toast-action" data-action-id="${entry.id}" tabindex="0">${this._escapeHtml(entry.action.label)}</button>`;
    }
    html += '</div>';
    html += `<button type="button" class="toast-close" aria-label="Dismiss" data-close-id="${entry.id}" tabindex="0">\u00d7</button>`;

    el.innerHTML = html;

    // Pause timer on hover
    el.addEventListener('mouseenter', () => this._pauseTimer(entry));
    el.addEventListener('mouseleave', () => this._resumeTimer(entry));
    el.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.removeToast(entry.id);
      }
    });

    this._containerEl.appendChild(el);
  }

  private _removeElement(id: string): void {
    const el = this._containerEl?.querySelector(
      `[data-toast-id="${id}"]`
    );
    el?.remove();
  }

  private _startTimer(entry: ToastEntry): void {
    if (entry.duration === 0) return; // Infinite

    entry.startTime = Date.now();
    entry.timerId = setTimeout(() => {
      this.removeToast(entry.id);
    }, entry.remaining);
  }

  private _pauseTimer(entry: ToastEntry): void {
    if (entry.timerId) {
      clearTimeout(entry.timerId);
      entry.timerId = null;
      entry.remaining -= Date.now() - entry.startTime;
    }
  }

  private _resumeTimer(entry: ToastEntry): void {
    this._startTimer(entry);
  }

  private _handleClick = (event: Event): void => {
    const target = event.target as HTMLElement;

    // Close button
    const closeId = target.getAttribute('data-close-id');
    if (closeId) {
      this.removeToast(closeId);
      return;
    }

    // Action button
    const actionId = target.getAttribute('data-action-id');
    if (actionId) {
      const entry = this._toasts.find((t) => t.id === actionId);
      entry?.action?.onClick();
      this.removeToast(actionId);
    }
  };

  private _escapeHtml(str: string): string {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

defineElement('compa11y-toast', Compa11yToast);

export default Compa11yToast;
