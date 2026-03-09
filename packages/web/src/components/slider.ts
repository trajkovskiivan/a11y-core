/**
 * compa11y Slider Web Component
 *
 * A single-thumb or range (two-thumb) slider with full keyboard support,
 * pointer drag, and screen-reader announcements.
 *
 * Single thumb:
 * <compa11y-slider label="Volume" min="0" max="100" step="1" value="50"></compa11y-slider>
 *
 * Range:
 * <compa11y-slider
 *   label="Price range"
 *   range
 *   min-value="20"
 *   max-value="80"
 *   min-thumb-label="Minimum price"
 *   max-thumb-label="Maximum price"
 * ></compa11y-slider>
 *
 * Vertical:
 * <compa11y-slider label="Level" orientation="vertical"></compa11y-slider>
 *
 * Events:
 *   compa11y-slider-change        { value: number }
 *   compa11y-slider-range-change  { minValue: number, maxValue: number }
 *
 * CSS vars:
 *   --compa11y-slider-track-bg, --compa11y-slider-track-size
 *   --compa11y-slider-fill-bg, --compa11y-slider-thumb-size
 *   --compa11y-slider-thumb-bg, --compa11y-slider-thumb-border
 */

import { announcePolite, createComponentWarnings } from '@compa11y/core';
import { Compa11yElement, defineElement } from '../utils/base-element';
import { SLIDER_STYLES } from '../utils/styles';

const warn = createComponentWarnings('Slider');

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(Math.max(v, lo), hi);
}

function snap(raw: number, min: number, step: number): number {
  if (step <= 0) return raw;
  return Math.round((raw - min) / step) * step + min;
}

function toPercent(v: number, min: number, max: number): number {
  return ((clamp(v, min, max) - min) / (max - min)) * 100;
}

// --------------------------------------------------------------------------
// Component
// --------------------------------------------------------------------------

export class Compa11ySlider extends Compa11yElement {
  // ── Internal state ────────────────────────────────────────────────────────
  private _value = 50;
  private _minValue = 0;
  private _maxValue = 100;
  private _min = 0;
  private _max = 100;
  private _step = 1;
  private _largeStep = 10;
  private _disabled = false;
  private _range = false;
  private _orientation: 'horizontal' | 'vertical' = 'horizontal';

  private _hasLabelSlot = false;

  // Drag state
  private _activeThumb: 0 | 1 | null = null;
  private _activePointerId = -1;

  static get observedAttributes(): string[] {
    return [
      'value',
      'min-value',
      'max-value',
      'min',
      'max',
      'step',
      'large-step',
      'disabled',
      'range',
      'orientation',
      'label',
      'aria-label',
      'min-thumb-label',
      'max-thumb-label',
    ];
  }

  // ── Public getters / setters ──────────────────────────────────────────────

  get value(): number {
    return this._value;
  }
  set value(v: number) {
    this._value = clamp(snap(v, this._min, this._step), this._min, this._max);
    this.setAttribute('value', String(this._value));
    this.syncThumbPositions();
    this.emit('compa11y-slider-change', { value: this._value });
  }

  get minValue(): number {
    return this._minValue;
  }
  set minValue(v: number) {
    this._minValue = clamp(snap(v, this._min, this._step), this._min, this._maxValue);
    this.setAttribute('min-value', String(this._minValue));
    this.syncThumbPositions();
    this.emit('compa11y-slider-range-change', {
      minValue: this._minValue,
      maxValue: this._maxValue,
    });
  }

  get maxValue(): number {
    return this._maxValue;
  }
  set maxValue(v: number) {
    this._maxValue = clamp(snap(v, this._min, this._step), this._minValue, this._max);
    this.setAttribute('max-value', String(this._maxValue));
    this.syncThumbPositions();
    this.emit('compa11y-slider-range-change', {
      minValue: this._minValue,
      maxValue: this._maxValue,
    });
  }

  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(v: boolean) {
    this._disabled = Boolean(v);
    this.toggleAttribute('disabled', this._disabled);
    this.syncDisabled();
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  protected setupAccessibility(): void {
    this._min = parseFloat(this.getAttribute('min') ?? '0') || 0;
    this._max = parseFloat(this.getAttribute('max') ?? '100') || 100;
    this._step = parseFloat(this.getAttribute('step') ?? '1') || 1;
    this._largeStep =
      parseFloat(this.getAttribute('large-step') ?? '0') ||
      clamp(Math.round((this._max - this._min) / 10), this._step, this._max - this._min);
    this._value = clamp(
      parseFloat(this.getAttribute('value') ?? '50') || 50,
      this._min,
      this._max,
    );
    this._minValue = clamp(
      parseFloat(this.getAttribute('min-value') ?? String(this._min)) || this._min,
      this._min,
      this._max,
    );
    this._maxValue = clamp(
      parseFloat(this.getAttribute('max-value') ?? String(this._max)) || this._max,
      this._minValue,
      this._max,
    );
    this._disabled = this.hasAttribute('disabled');
    this._range = this.hasAttribute('range');
    this._orientation =
      (this.getAttribute('orientation') as 'horizontal' | 'vertical') ?? 'horizontal';

    // Check for slotted label content
    const slottedLabel = this.querySelector('[slot="label"]');
    this._hasLabelSlot = Boolean(slottedLabel);

    // Dev warnings
    if (process.env.NODE_ENV !== 'production') {
      const hasLabel =
        this.hasAttribute('label') ||
        this.hasAttribute('aria-label') ||
        this.hasAttribute('aria-labelledby') ||
        this._hasLabelSlot;
      if (!hasLabel) {
        warn.error(
          'compa11y-slider requires an accessible label.',
          'Add a label, aria-label, aria-labelledby attribute, or use <span slot="label">...</span>.',
        );
      }
      if (this._range) {
        const hasMinLabel = this.hasAttribute('min-thumb-label');
        const hasMaxLabel = this.hasAttribute('max-thumb-label');
        if (!hasMinLabel || !hasMaxLabel) {
          warn.warning(
            'Range sliders should have min-thumb-label and max-thumb-label attributes.',
            'Example: min-thumb-label="Minimum price" max-thumb-label="Maximum price".',
          );
        }
      }
    }
  }

  protected render(): void {
    const shadow = this.attachShadow({ mode: 'open' });
    const labelText = this.getAttribute('label') ?? '';

    const thumb0Id = `${this._id}-thumb-0`;
    const thumb1Id = `${this._id}-thumb-1`;
    const labelId = `${this._id}-label`;
    const liveId = `${this._id}-live`;

    const baseLabel =
      this.getAttribute('aria-label') ?? this.getAttribute('label') ?? '';
    const minThumbLabel =
      this.getAttribute('min-thumb-label') ??
      (baseLabel ? `${baseLabel} minimum` : 'Minimum');
    const maxThumbLabel =
      this.getAttribute('max-thumb-label') ??
      (baseLabel ? `${baseLabel} maximum` : 'Maximum');

    const thumb0Label = this._range ? minThumbLabel : (baseLabel || undefined);
    const thumb1Label = this._range ? maxThumbLabel : undefined;

    shadow.innerHTML = `
      <style>${SLIDER_STYLES}</style>

      <!-- Visually hidden live region, always in DOM -->
      <div id="${liveId}" role="status" aria-live="polite" aria-atomic="true" style="
        position:absolute;width:1px;height:1px;padding:0;margin:-1px;
        overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;
      "></div>

      <div class="slider-root" part="root">
        <label id="${labelId}" class="slider-label" part="label" data-compa11y-slider-label ${!labelText ? 'hidden' : ''}><slot name="label">${labelText}</slot></label>

        <div class="slider-range-labels" part="range-labels" data-compa11y-slider-range-labels>
          <span class="slider-min-label" part="min-label" data-compa11y-slider-min-label><slot name="min-label">${this._min}</slot></span>
          <span class="slider-max-label" part="max-label" data-compa11y-slider-max-label><slot name="max-label">${this._max}</slot></span>
        </div>

        <div class="slider-track" part="track">
          <div class="slider-fill" part="fill" aria-hidden="true"></div>

          <div
            id="${thumb0Id}"
            class="slider-thumb"
            part="thumb thumb-0"
            role="slider"
            tabindex="${this._disabled ? -1 : 0}"
            aria-valuemin="${this._min}"
            aria-valuemax="${this._max}"
            aria-valuenow="${this._range ? this._minValue : this._value}"
            aria-orientation="${this._orientation}"
            ${thumb0Label ? `aria-label="${thumb0Label}"` : ''}
            ${this._disabled ? 'aria-disabled="true"' : ''}
          ></div>

          ${
            this._range
              ? `<div
            id="${thumb1Id}"
            class="slider-thumb"
            part="thumb thumb-1"
            role="slider"
            tabindex="${this._disabled ? -1 : 0}"
            aria-valuemin="${this._min}"
            aria-valuemax="${this._max}"
            aria-valuenow="${this._maxValue}"
            aria-orientation="${this._orientation}"
            ${thumb1Label ? `aria-label="${thumb1Label}"` : ''}
            ${this._disabled ? 'aria-disabled="true"' : ''}
          ></div>`
              : ''
          }
        </div>
      </div>
    `;

    this.syncThumbPositions();
    this.syncDisabled();
  }

  protected setupEventListeners(): void {
    const track = this.shadowRoot?.querySelector('.slider-track') as HTMLElement | null;
    const thumb0 = this.getThumb(0);
    const thumb1 = this.getThumb(1);

    track?.addEventListener('pointerdown', this.handleTrackPointerDown as EventListener);

    thumb0?.addEventListener('keydown', this.handleThumb0KeyDown as EventListener);
    thumb0?.addEventListener('pointerdown', this.handleThumb0PointerDown as EventListener);
    thumb0?.addEventListener('pointermove', this.handleThumb0PointerMove as EventListener);
    thumb0?.addEventListener('pointerup', this.handleThumbPointerUp as EventListener);
    thumb0?.addEventListener('pointercancel', this.handleThumbPointerUp as EventListener);

    if (this._range && thumb1) {
      thumb1.addEventListener('keydown', this.handleThumb1KeyDown as EventListener);
      thumb1.addEventListener('pointerdown', this.handleThumb1PointerDown as EventListener);
      thumb1.addEventListener('pointermove', this.handleThumb1PointerMove as EventListener);
      thumb1.addEventListener('pointerup', this.handleThumbPointerUp as EventListener);
      thumb1.addEventListener('pointercancel', this.handleThumbPointerUp as EventListener);
    }

    // Show/hide label when slot content changes
    const labelSlot = this.shadowRoot?.querySelector('slot[name="label"]');
    labelSlot?.addEventListener('slotchange', this.handleLabelSlotChange);
  }

  protected cleanupEventListeners(): void {
    const track = this.shadowRoot?.querySelector('.slider-track') as HTMLElement | null;
    const thumb0 = this.getThumb(0);
    const thumb1 = this.getThumb(1);

    track?.removeEventListener('pointerdown', this.handleTrackPointerDown as EventListener);

    thumb0?.removeEventListener('keydown', this.handleThumb0KeyDown as EventListener);
    thumb0?.removeEventListener('pointerdown', this.handleThumb0PointerDown as EventListener);
    thumb0?.removeEventListener('pointermove', this.handleThumb0PointerMove as EventListener);
    thumb0?.removeEventListener('pointerup', this.handleThumbPointerUp as EventListener);
    thumb0?.removeEventListener('pointercancel', this.handleThumbPointerUp as EventListener);

    if (thumb1) {
      thumb1.removeEventListener('keydown', this.handleThumb1KeyDown as EventListener);
      thumb1.removeEventListener('pointerdown', this.handleThumb1PointerDown as EventListener);
      thumb1.removeEventListener('pointermove', this.handleThumb1PointerMove as EventListener);
      thumb1.removeEventListener('pointerup', this.handleThumbPointerUp as EventListener);
      thumb1.removeEventListener('pointercancel', this.handleThumbPointerUp as EventListener);
    }

    const labelSlot = this.shadowRoot?.querySelector('slot[name="label"]');
    labelSlot?.removeEventListener('slotchange', this.handleLabelSlotChange);
  }

  protected onAttributeChange(
    name: string,
    _old: string | null,
    next: string | null,
  ): void {
    const num = parseFloat(next ?? '');
    if (name === 'value' && !isNaN(num)) {
      this._value = clamp(snap(num, this._min, this._step), this._min, this._max);
      this.syncThumbPositions();
    }
    if (name === 'min-value' && !isNaN(num)) {
      this._minValue = clamp(snap(num, this._min, this._step), this._min, this._maxValue);
      this.syncThumbPositions();
    }
    if (name === 'max-value' && !isNaN(num)) {
      this._maxValue = clamp(snap(num, this._min, this._step), this._minValue, this._max);
      this.syncThumbPositions();
    }
    if (name === 'min' && !isNaN(num)) {
      this._min = num;
      this.syncThumbPositions();
    }
    if (name === 'max' && !isNaN(num)) {
      this._max = num;
      this.syncThumbPositions();
    }
    if (name === 'step' && !isNaN(num)) this._step = num;
    if (name === 'large-step' && !isNaN(num)) this._largeStep = num;
    if (name === 'disabled') {
      this._disabled = next !== null;
      this.syncDisabled();
    }
    if (name === 'orientation') {
      this._orientation =
        (next as 'horizontal' | 'vertical' | null) ?? 'horizontal';
    }
  }

  private handleLabelSlotChange = (event: Event): void => {
    const slot = event.target as HTMLSlotElement;
    const assigned = slot.assignedNodes({ flatten: true });
    const hasContent = assigned.some(
      (node) => node.nodeType === Node.ELEMENT_NODE || (node.textContent?.trim() ?? '') !== ''
    );
    const labelEl = this.shadowRoot?.querySelector('.slider-label');
    if (labelEl) {
      if (hasContent) {
        labelEl.removeAttribute('hidden');
      } else if (!this.getAttribute('label')) {
        labelEl.setAttribute('hidden', '');
      }
    }
  };

  // ── DOM helpers ───────────────────────────────────────────────────────────

  private getThumb(idx: 0 | 1): HTMLElement | null {
    const thumbs = this.shadowRoot?.querySelectorAll('.slider-thumb');
    if (!thumbs) return null;
    return (thumbs[idx] as HTMLElement) ?? null;
  }

  private getTrack(): HTMLElement | null {
    return (this.shadowRoot?.querySelector('.slider-track') as HTMLElement) ?? null;
  }

  // ── Sync helpers ──────────────────────────────────────────────────────────

  private syncThumbPositions(): void {
    const track = this.getTrack();
    const thumb0 = this.getThumb(0);
    const thumb1 = this.getThumb(1);
    const fill = this.shadowRoot?.querySelector('.slider-fill') as HTMLElement | null;
    if (!track || !thumb0) return;

    const isVertical = this._orientation === 'vertical';

    if (this._range) {
      const loPct = toPercent(this._minValue, this._min, this._max);
      const hiPct = toPercent(this._maxValue, this._min, this._max);

      if (isVertical) {
        thumb0.style.bottom = `${loPct}%`;
        thumb0.style.left = '';
        if (thumb1) {
          thumb1.style.bottom = `${hiPct}%`;
          thumb1.style.left = '';
        }
        if (fill) {
          fill.style.bottom = `${loPct}%`;
          fill.style.top = `${100 - hiPct}%`;
          fill.style.left = '0';
          fill.style.right = '0';
        }
      } else {
        thumb0.style.left = `${loPct}%`;
        thumb0.style.bottom = '';
        if (thumb1) {
          thumb1.style.left = `${hiPct}%`;
          thumb1.style.bottom = '';
        }
        if (fill) {
          fill.style.left = `${loPct}%`;
          fill.style.right = `${100 - hiPct}%`;
          fill.style.bottom = '';
          fill.style.top = '0';
        }
      }

      thumb0.setAttribute('aria-valuenow', String(this._minValue));
      thumb1?.setAttribute('aria-valuenow', String(this._maxValue));
    } else {
      const pct = toPercent(this._value, this._min, this._max);

      if (isVertical) {
        thumb0.style.bottom = `${pct}%`;
        thumb0.style.left = '';
        if (fill) {
          fill.style.bottom = '0';
          fill.style.top = `${100 - pct}%`;
          fill.style.left = '0';
          fill.style.right = '0';
        }
      } else {
        thumb0.style.left = `${pct}%`;
        thumb0.style.bottom = '';
        if (fill) {
          fill.style.left = '0';
          fill.style.right = `${100 - pct}%`;
          fill.style.bottom = '';
          fill.style.top = '0';
        }
      }

      thumb0.setAttribute('aria-valuenow', String(this._value));
    }
  }

  private syncDisabled(): void {
    const thumb0 = this.getThumb(0);
    const thumb1 = this.getThumb(1);
    const tabs = this._disabled ? '-1' : '0';

    thumb0?.setAttribute('tabindex', tabs);
    thumb1?.setAttribute('tabindex', tabs);

    if (this._disabled) {
      thumb0?.setAttribute('aria-disabled', 'true');
      thumb1?.setAttribute('aria-disabled', 'true');
    } else {
      thumb0?.removeAttribute('aria-disabled');
      thumb1?.removeAttribute('aria-disabled');
    }
  }

  // ── Value calculation from pointer position ───────────────────────────────

  private valueFromPointer(e: PointerEvent): number {
    const track = this.getTrack();
    if (!track) return this._min;
    const rect = track.getBoundingClientRect();
    const pct =
      this._orientation === 'vertical'
        ? 1 - (e.clientY - rect.top) / rect.height
        : (e.clientX - rect.left) / rect.width;
    return clamp(snap(clamp(pct, 0, 1) * (this._max - this._min) + this._min, this._min, this._step), this._min, this._max);
  }

  // ── Update value helpers ──────────────────────────────────────────────────

  private commitSingle(raw: number): void {
    const next = clamp(snap(raw, this._min, this._step), this._min, this._max);
    this._value = next;
    this.syncThumbPositions();
    this.emit('compa11y-slider-change', { value: next });
    announcePolite(String(next));
  }

  private commitRange(raw: number, thumbIdx: 0 | 1): void {
    if (thumbIdx === 0) {
      this._minValue = clamp(snap(raw, this._min, this._step), this._min, this._maxValue);
    } else {
      this._maxValue = clamp(snap(raw, this._min, this._step), this._minValue, this._max);
    }
    this.syncThumbPositions();
    this.emit('compa11y-slider-range-change', {
      minValue: this._minValue,
      maxValue: this._maxValue,
    });
    announcePolite(`${this._minValue} to ${this._maxValue}`);
  }

  // ── Keyboard handlers ─────────────────────────────────────────────────────

  private handleKeyDown(e: KeyboardEvent, thumbIdx: 0 | 1): void {
    if (this._disabled) return;
    const current =
      this._range ? (thumbIdx === 0 ? this._minValue : this._maxValue) : this._value;
    const update = (v: number) => {
      e.preventDefault();
      if (this._range) this.commitRange(v, thumbIdx);
      else this.commitSingle(v);
    };

    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') return update(current + this._step);
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') return update(current - this._step);
    if (e.key === 'Home') return update(this._min);
    if (e.key === 'End') return update(this._max);
    if (e.key === 'PageUp') return update(current + this._largeStep);
    if (e.key === 'PageDown') return update(current - this._largeStep);
  }

  private handleThumb0KeyDown = (e: KeyboardEvent): void => {
    this.handleKeyDown(e, 0);
  };

  private handleThumb1KeyDown = (e: KeyboardEvent): void => {
    this.handleKeyDown(e, 1);
  };

  // ── Pointer handlers ──────────────────────────────────────────────────────

  private handlePointerDown(e: PointerEvent, thumbIdx: 0 | 1): void {
    if (this._disabled) return;
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    this._activeThumb = thumbIdx;
    this._activePointerId = e.pointerId;
  }

  private handlePointerMove(e: PointerEvent, thumbIdx: 0 | 1): void {
    if (this._disabled || this._activeThumb !== thumbIdx || this._activePointerId !== e.pointerId) return;
    const v = this.valueFromPointer(e);
    if (this._range) this.commitRange(v, thumbIdx);
    else this.commitSingle(v);
  }

  private handleThumb0PointerDown = (e: PointerEvent): void => this.handlePointerDown(e, 0);
  private handleThumb0PointerMove = (e: PointerEvent): void => this.handlePointerMove(e, 0);
  private handleThumb1PointerDown = (e: PointerEvent): void => this.handlePointerDown(e, 1);
  private handleThumb1PointerMove = (e: PointerEvent): void => this.handlePointerMove(e, 1);

  private handleThumbPointerUp = (): void => {
    this._activeThumb = null;
    this._activePointerId = -1;
  };

  private handleTrackPointerDown = (e: PointerEvent): void => {
    if (this._disabled) return;
    const target = e.target as HTMLElement;
    // Ignore if clicking directly on a thumb
    if (target.classList.contains('slider-thumb')) return;

    const v = this.valueFromPointer(e);
    if (!this._range) {
      this.commitSingle(v);
    } else {
      const distLo = Math.abs(v - this._minValue);
      const distHi = Math.abs(v - this._maxValue);
      this.commitRange(v, distLo <= distHi ? 0 : 1);
    }
  };
}

defineElement('compa11y-slider', Compa11ySlider);

export default Compa11ySlider;
