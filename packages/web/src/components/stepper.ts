/**
 * compa11y Stepper Web Component
 *
 * Supports two modes:
 * - Progress indicator (non-interactive): steps are plain text
 * - Navigation (interactive): steps are clickable buttons
 *
 * Usage:
 * <compa11y-stepper
 *   aria-label="Checkout progress"
 *   mode="progress"
 *   current-step="payment"
 *   steps='[{"id":"shipping","label":"Shipping","state":"completed"},{"id":"payment","label":"Payment"},{"id":"review","label":"Review"}]'
 * ></compa11y-stepper>
 *
 * Events (navigation mode):
 *   compa11y-stepper-select → { stepId: string }
 */

import { announcePolite, createComponentWarnings } from '@compa11y/core';
import { Compa11yElement, defineElement } from '../utils/base-element';
import { STEPPER_STYLES } from '../utils/styles';

const warn = createComponentWarnings('Stepper');

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type StepState = 'upcoming' | 'current' | 'completed' | 'error' | 'locked';

interface StepData {
  id: string;
  label: string;
  state?: StepState;
  description?: string;
}

// ---------------------------------------------------------------------------
// Web Component
// ---------------------------------------------------------------------------

export class Compa11yStepper extends Compa11yElement {
  private _mode: 'progress' | 'navigation' = 'progress';
  private _currentStepId = '';
  private _steps: StepData[] = [];
  private _orientation: 'horizontal' | 'vertical' = 'horizontal';
  private _disabled = false;
  private _showStepCount = false;

  static get observedAttributes(): string[] {
    return [
      'mode',
      'current-step',
      'steps',
      'orientation',
      'disabled',
      'show-step-count',
      'aria-label',
    ];
  }

  // ── Properties ──────────────────────────────────────────────────────────

  get currentStep(): string {
    return this._currentStepId;
  }
  set currentStep(id: string) {
    if (id === this._currentStepId) return;
    this._currentStepId = id;
    this.setAttribute('current-step', id);
    this._syncUI();
    this._announceStep();
  }

  get stepsData(): StepData[] {
    return this._steps;
  }
  set stepsData(data: StepData[]) {
    this._steps = data;
    this._syncUI();
  }

  // ── Lifecycle ───────────────────────────────────────────────────────────

  protected setupAccessibility(): void {
    this._readAttributes();
  }

  protected render(): void {
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>${STEPPER_STYLES}</style>
      <nav part="nav" data-compa11y-stepper>
        <div
          class="sr-only"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          part="live-region"
        ></div>
        <div class="step-count" part="step-count" style="display:none"></div>
        <ol part="list" class="stepper-list"></ol>
      </nav>
    `;
    this._syncUI();
  }

  protected setupEventListeners(): void {
    const root = this.shadowRoot as EventTarget | null;
    root?.addEventListener('click', this._handleClick as EventListener);
  }

  protected cleanupEventListeners(): void {
    const root = this.shadowRoot as EventTarget | null;
    root?.removeEventListener('click', this._handleClick as EventListener);
  }

  protected onAttributeChange(
    name: string,
    _oldValue: string | null,
    newValue: string | null
  ): void {
    switch (name) {
      case 'mode':
        this._mode = newValue === 'navigation' ? 'navigation' : 'progress';
        break;
      case 'current-step':
        this._currentStepId = newValue ?? '';
        break;
      case 'steps':
        this._parseSteps(newValue);
        break;
      case 'orientation':
        this._orientation = newValue === 'vertical' ? 'vertical' : 'horizontal';
        break;
      case 'disabled':
        this._disabled = newValue !== null;
        break;
      case 'show-step-count':
        this._showStepCount = newValue !== null;
        break;
      case 'aria-label': {
        const nav = this.shadowRoot?.querySelector('nav');
        if (nav) nav.setAttribute('aria-label', newValue ?? 'Steps');
        return;
      }
    }
    this._syncUI();
  }

  // ── Internal ────────────────────────────────────────────────────────────

  private _readAttributes(): void {
    const attr = (name: string) => this.getAttribute(name);

    this._mode = attr('mode') === 'navigation' ? 'navigation' : 'progress';
    this._currentStepId = attr('current-step') ?? '';
    this._orientation = attr('orientation') === 'vertical' ? 'vertical' : 'horizontal';
    this._disabled = this.hasAttribute('disabled');
    this._showStepCount = this.hasAttribute('show-step-count');
    this._parseSteps(attr('steps'));
    this._devWarnings();
  }

  private _parseSteps(json: string | null): void {
    if (!json) {
      this._steps = [];
      return;
    }
    try {
      const parsed = JSON.parse(json);
      if (Array.isArray(parsed)) {
        this._steps = parsed;
      }
    } catch {
      warn.error(
        'Invalid JSON in steps attribute.',
        'Pass a valid JSON array of step objects.'
      );
      this._steps = [];
    }
  }

  private _devWarnings(): void {
    if (!this.getAttribute('aria-label')) {
      warn.error(
        'Stepper requires an aria-label attribute.',
        'Add aria-label="Checkout steps" to <compa11y-stepper>.'
      );
    }
    if (this._steps.length === 0) {
      warn.error(
        'Stepper steps array is empty.',
        'Pass steps as a JSON array in the steps attribute.'
      );
    }
  }

  private _ariaLabel(): string {
    return this.getAttribute('aria-label') ?? 'Steps';
  }

  private _resolvedSteps(): (StepData & { state: StepState })[] {
    return this._steps.map((step) => ({
      ...step,
      state: step.id === this._currentStepId
        ? 'current'
        : (step.state ?? 'upcoming'),
    }));
  }

  private _announce(message: string): void {
    const region = this.shadowRoot?.querySelector('[role="status"]');
    if (!region) return;
    region.textContent = message;
    setTimeout(() => {
      region.textContent = '';
    }, 1000);
  }

  private _announceStep(): void {
    const steps = this._resolvedSteps();
    const idx = steps.findIndex((s) => s.id === this._currentStepId);
    const step = steps[idx];
    if (step) {
      this._announce(`Step ${idx + 1} of ${steps.length}: ${step.label}`);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────

  private _syncUI(): void {
    if (!this.shadowRoot) return;

    const nav = this.shadowRoot.querySelector('nav');
    if (nav) {
      nav.setAttribute('aria-label', this._ariaLabel());
      nav.setAttribute('data-orientation', this._orientation);
      nav.setAttribute('data-mode', this._mode);
    }

    this._renderStepCount();
    this._renderList();
  }

  private _renderStepCount(): void {
    const el = this.shadowRoot?.querySelector('.step-count') as HTMLElement | null;
    if (!el) return;

    const steps = this._resolvedSteps();
    const idx = steps.findIndex((s) => s.state === 'current');

    if (this._showStepCount && idx >= 0) {
      el.textContent = `Step ${idx + 1} of ${steps.length}`;
      el.style.display = '';
    } else {
      el.style.display = 'none';
    }
  }

  private _renderList(): void {
    const ol = this.shadowRoot?.querySelector('ol');
    if (!ol) return;

    const steps = this._resolvedSteps();
    const isVertical = this._orientation === 'vertical';

    ol.className = `stepper-list ${isVertical ? 'vertical' : 'horizontal'}`;

    const items: string[] = [];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]!;
      const isCurrent = step.state === 'current';
      const isLast = i === steps.length - 1;

      // Indicator content
      const defaultIndicator = step.state === 'completed' ? '\u2713' : step.state === 'error' ? '!' : String(i + 1);
      const indicatorContent = `<slot name="indicator-${this._esc(step.id)}">${defaultIndicator}</slot>`;

      // SR-only state suffix
      const stateLabels: Record<StepState, string> = {
        upcoming: '',
        current: ' (current step)',
        completed: ' (completed)',
        error: ' (error)',
        locked: ' (locked)',
      };
      const srSuffix = stateLabels[step.state];

      // Label slot – allows consumers to provide custom label content per step
      const labelContent = `<slot name="label-${this._esc(step.id)}">${this._esc(step.label)}</slot>`;

      // Description
      const descHtml = step.description
        ? `<span class="stepper-description" data-compa11y-stepper-description part="step-description">${this._esc(step.description)}</span>`
        : '';

      // Connector
      const connectorHtml = isLast
        ? ''
        : `<span class="stepper-connector ${step.state === 'completed' ? 'completed' : ''}" aria-hidden="true" data-compa11y-stepper-connector part="connector"></span>`;

      if (this._mode === 'progress') {
        items.push(
          `<li
            class="stepper-item ${isVertical ? 'vertical' : 'horizontal'}"
            data-compa11y-stepper-item
            data-state="${step.state}"
            ${isCurrent ? 'aria-current="step"' : ''}
            part="step"
          >
            <span class="stepper-indicator" data-state="${step.state}" aria-hidden="true" data-compa11y-stepper-indicator part="indicator">${indicatorContent}</span>
            <span class="stepper-text" data-compa11y-stepper-text>
              <span class="stepper-label" data-compa11y-stepper-label part="label">
                ${labelContent}
                <span class="sr-only">${srSuffix}</span>
              </span>
              ${descHtml}
            </span>
            ${connectorHtml}
          </li>`
        );
      } else {
        const isDisabled = this._disabled || step.state === 'locked';
        items.push(
          `<li
            class="stepper-item ${isVertical ? 'vertical' : 'horizontal'}"
            data-compa11y-stepper-item
            data-state="${step.state}"
            part="step"
          >
            <button
              type="button"
              class="stepper-btn"
              data-compa11y-stepper-btn
              data-state="${step.state}"
              data-step-id="${this._esc(step.id)}"
              aria-label="Step ${i + 1} of ${steps.length}, ${this._esc(step.label)}${srSuffix}"
              ${isCurrent ? 'aria-current="step"' : ''}
              ${isDisabled ? 'disabled' : ''}
              part="btn"
            >
              <span class="stepper-indicator" data-state="${step.state}" aria-hidden="true" data-compa11y-stepper-indicator part="indicator">${indicatorContent}</span>
              <span class="stepper-text" data-compa11y-stepper-text>
                <span class="stepper-label" data-compa11y-stepper-label part="label">
                  ${labelContent}
                </span>
                ${descHtml}
              </span>
            </button>
            ${connectorHtml}
          </li>`
        );
      }
    }

    ol.innerHTML = items.join('');
  }

  private _esc(str: string): string {
    const el = document.createElement('span');
    el.textContent = str;
    return el.innerHTML;
  }

  // ── Events ──────────────────────────────────────────────────────────────

  private _handleClick = (e: Event): void => {
    if (this._mode !== 'navigation') return;

    const target = (e.target as HTMLElement).closest(
      'button[data-step-id]'
    ) as HTMLButtonElement | null;
    if (!target || target.disabled) return;

    const stepId = target.dataset.stepId;
    if (!stepId || stepId === this._currentStepId) return;

    const step = this._steps.find((s) => s.id === stepId);
    if (!step || step.state === 'locked') return;

    this._currentStepId = stepId;
    this._syncUI();

    const idx = this._steps.findIndex((s) => s.id === stepId);
    announcePolite(`Step ${idx + 1} of ${this._steps.length}: ${step.label}`);

    // Restore focus to the clicked button after re-render
    requestAnimationFrame(() => {
      const btn = this.shadowRoot?.querySelector(
        `button[data-step-id="${stepId}"]`
      ) as HTMLElement | null;
      btn?.focus();
    });

    this.emit('compa11y-stepper-select', { stepId });
  };

  // ── Public API ──────────────────────────────────────────────────────────

  goToStep(stepId: string): void {
    this.currentStep = stepId;
    this.emit('compa11y-stepper-select', { stepId });
  }
}

defineElement('compa11y-stepper', Compa11yStepper);

export default Compa11yStepper;
