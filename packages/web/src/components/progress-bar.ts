/**
 * Accessible ProgressBar web component.
 *
 * Communicates the status of a task in progress to all users.
 * Supports determinate (known value) and indeterminate (unknown progress) modes.
 *
 * @example
 * <!-- Determinate — announce at 25 %, 50 %, 75 %, 100 % -->
 * <compa11y-progress-bar
 *   label="Uploading invoice PDF"
 *   value="65"
 *   milestones="25,50,75,100"
 *   status-text="Uploading 3 of 10 files…"
 * ></compa11y-progress-bar>
 *
 * <!-- Indeterminate — progress unknown -->
 * <compa11y-progress-bar label="Loading reports"></compa11y-progress-bar>
 *
 * <!-- Complete -->
 * <compa11y-progress-bar
 *   label="File export"
 *   value="100"
 *   status="complete"
 *   status-text="Export ready — check your downloads"
 * ></compa11y-progress-bar>
 *
 * <!-- Error -->
 * <compa11y-progress-bar
 *   label="Connection"
 *   value="30"
 *   status="error"
 *   status-text="Connection lost. Retry?"
 * ></compa11y-progress-bar>
 *
 * @fires compa11y-progress-milestone - Fired when value crosses a milestone threshold
 * @fires compa11y-progress-complete  - Fired when status changes to "complete"
 * @fires compa11y-progress-error     - Fired when status changes to "error"
 *
 * @attr {string}  label          - Visible label and accessible name (required)
 * @attr {number}  value          - Current progress value; absent = indeterminate
 * @attr {number}  min            - Minimum value (default: 0)
 * @attr {number}  max            - Maximum value (default: 100)
 * @attr {boolean} show-value     - Show percentage text; defaults true when determinate
 * @attr {string}  status         - "active" | "complete" | "error" (default: "active")
 * @attr {string}  status-text    - Visible status message shown below the track
 * @attr {string}  milestones     - Comma-separated thresholds to announce, e.g. "25,50,75,100"
 * @attr {string}  announce-label - Override label used in SR announcements
 *
 * @cssprop --compa11y-progress-bar-track-bg         Track background      (default #e2e8f0)
 * @cssprop --compa11y-progress-bar-track-size       Track height          (default 8px)
 * @cssprop --compa11y-progress-bar-fill-bg          Determinate fill      (default #0066cc)
 * @cssprop --compa11y-progress-bar-fill-bg-complete Complete fill         (default #22c55e)
 * @cssprop --compa11y-progress-bar-fill-bg-error    Error fill            (default #ef4444)
 * @cssprop --compa11y-progress-bar-label-color      Label color           (default inherit)
 * @cssprop --compa11y-progress-bar-value-color      Value text color      (default #555)
 * @cssprop --compa11y-progress-bar-status-color     Status text color     (default #555)
 * @cssprop --compa11y-progress-bar-error-color      Error status text     (default #ef4444)
 */

import { Compa11yElement, defineElement } from '../utils/base-element';
import { PROGRESS_BAR_STYLES } from '../utils/styles';
import { announcePolite, announceAssertive, createComponentWarnings } from '@compa11y/core';

const warn = createComponentWarnings('ProgressBar');

type ProgressStatus = 'active' | 'complete' | 'error';

export class Compa11yProgressBar extends Compa11yElement {
  private _value: number | undefined = undefined;
  private _min = 0;
  private _max = 100;
  private _status: ProgressStatus = 'active';
  private _milestones: number[] = [];

  static get observedAttributes() {
    return [
      'label',
      'value',
      'min',
      'max',
      'show-value',
      'status',
      'status-text',
      'milestones',
      'announce-label',
    ];
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  get value(): number | undefined {
    return this._value;
  }

  set value(v: number | undefined) {
    const prev = this._value;
    this._value = v;

    if (v === undefined) {
      this.removeAttribute('value');
    } else {
      this.setAttribute('value', String(v));
    }

    this.checkMilestones(prev, v);
    this.render();
  }

  get status(): ProgressStatus {
    return this._status;
  }

  set status(v: ProgressStatus) {
    const prev = this._status;
    this._status = v;
    this.setAttribute('status', v);

    if (prev !== v) this.announceStatus(v);
    this.render();
  }

  // ── Lifecycle ───────────────────────────────────────────────────────────────

  protected setupAccessibility(): void {
    const labelAttr = this.getAttribute('label');

    if (process.env.NODE_ENV !== 'production') {
      if (!labelAttr) {
        warn.error(
          'compa11y-progress-bar requires a label attribute.',
          'It is both the visible label and the accessible name.'
        );
      }
    }

    this._min = parseFloat(this.getAttribute('min') || '0') || 0;
    this._max = parseFloat(this.getAttribute('max') || '100') || 100;

    const valAttr = this.getAttribute('value');
    this._value = valAttr !== null ? parseFloat(valAttr) : undefined;

    this._status =
      (this.getAttribute('status') as ProgressStatus) || 'active';

    this._milestones = this.parseMilestones(
      this.getAttribute('milestones') || ''
    );
  }

  protected render(): void {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }

    const label = this.getAttribute('label') || '';
    const isIndeterminate = this._value === undefined;
    const clampedValue = isIndeterminate
      ? 0
      : Math.min(this._max, Math.max(this._min, this._value!));
    const percentage = isIndeterminate
      ? 0
      : ((clampedValue - this._min) / (this._max - this._min)) * 100;
    const statusText = this.getAttribute('status-text') || '';

    // show-value defaults to true when determinate; explicit "false" hides it
    const showValueAttr = this.getAttribute('show-value');
    const shouldShowValue =
      showValueAttr === 'false' ? false : !isIndeterminate;

    const fillWidth = isIndeterminate
      ? '40%'
      : `${Math.min(100, Math.max(0, percentage))}%`;

    const labelId = `${this._id}-label`;

    this.shadowRoot!.innerHTML = `
      <style>${PROGRESS_BAR_STYLES}</style>
      <div
        class="progress-bar-root"
        part="root"
      >
        <div class="progress-bar-header" part="header">
          <span
            id="${labelId}"
            class="progress-bar-label"
            part="label"
          >${label}</span>
          ${
            shouldShowValue
              ? `<span class="progress-bar-value" part="value" aria-hidden="true">${Math.round(percentage)}%</span>`
              : ''
          }
        </div>

        <div
          class="progress-bar-track"
          part="track"
          role="progressbar"
          aria-labelledby="${labelId}"
          ${
            !isIndeterminate
              ? `aria-valuemin="${this._min}" aria-valuemax="${this._max}" aria-valuenow="${clampedValue}"`
              : ''
          }
        >
          <div
            class="progress-bar-fill${isIndeterminate ? ' progress-bar-fill--indeterminate' : ''}"
            part="fill"
            aria-hidden="true"
            style="width: ${fillWidth}"
          ></div>
        </div>

        ${
          statusText
            ? `<p class="progress-bar-status" part="status" aria-hidden="true">${statusText}</p>`
            : ''
        }
      </div>
    `;
  }

  protected setupEventListeners(): void {}
  protected cleanupEventListeners(): void {}

  protected onAttributeChange(
    name: string,
    oldValue: string | null,
    newValue: string | null
  ): void {
    if (name === 'value') {
      const prevNumeric =
        oldValue !== null ? parseFloat(oldValue) : undefined;
      this._value =
        newValue !== null ? parseFloat(newValue) : undefined;
      this.checkMilestones(prevNumeric, this._value);
    } else if (name === 'min') {
      this._min = parseFloat(newValue || '0') || 0;
    } else if (name === 'max') {
      this._max = parseFloat(newValue || '100') || 100;
    } else if (name === 'status') {
      const prev = this._status;
      this._status = (newValue as ProgressStatus) || 'active';
      if (prev !== this._status) this.announceStatus(this._status);
    } else if (name === 'milestones') {
      this._milestones = this.parseMilestones(newValue || '');
    }

    this.render();
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  private parseMilestones(raw: string): number[] {
    return raw
      .split(',')
      .map(s => parseFloat(s.trim()))
      .filter(n => !isNaN(n));
  }

  private checkMilestones(
    prev: number | undefined,
    current: number | undefined
  ): void {
    if (current === undefined || !this._milestones.length) return;
    if (prev === undefined) return; // first assignment — no crossing yet

    const sorted = [...this._milestones].sort((a, b) => a - b);
    for (const m of sorted) {
      if (prev < m && current >= m) {
        const lbl =
          this.getAttribute('announce-label') ||
          this.getAttribute('label') ||
          '';
        const pct = Math.round(
          ((m - this._min) / (this._max - this._min)) * 100
        );
        const msg = m >= this._max ? `${lbl} complete` : `${lbl}: ${pct}%`;
        announcePolite(msg);
        this.emit('compa11y-progress-milestone', {
          milestone: m,
          value: current,
          percent: pct,
        });
        break; // announce only the first crossed threshold per change
      }
    }
  }

  private announceStatus(newStatus: ProgressStatus): void {
    const lbl =
      this.getAttribute('announce-label') ||
      this.getAttribute('label') ||
      '';

    if (newStatus === 'complete') {
      announcePolite(`${lbl} complete`);
      this.emit('compa11y-progress-complete', { label: lbl });
    } else if (newStatus === 'error') {
      announceAssertive(`${lbl} failed`);
      this.emit('compa11y-progress-error', { label: lbl });
    }
  }
}

defineElement('compa11y-progress-bar', Compa11yProgressBar);
