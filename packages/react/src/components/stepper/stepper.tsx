/**
 * Accessible Stepper / ProgressSteps component.
 *
 * Supports two explicit modes:
 * - `mode="progress"` — non-interactive indicator ("You are on Step 2 of 5")
 * - `mode="navigation"` — interactive steps users can click to jump around
 *
 * @example
 * // Progress indicator (read-only)
 * <Stepper
 *   ariaLabel="Checkout progress"
 *   mode="progress"
 *   steps={[
 *     { id: 'shipping', label: 'Shipping', state: 'completed' },
 *     { id: 'payment', label: 'Payment', state: 'current' },
 *     { id: 'review', label: 'Review', state: 'upcoming' },
 *   ]}
 *   currentStepId="payment"
 * />
 *
 * // Interactive navigation
 * <Stepper
 *   ariaLabel="Checkout steps"
 *   mode="navigation"
 *   steps={steps}
 *   currentStepId="payment"
 *   onStepSelect={(id) => goToStep(id)}
 * />
 */

import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { useId } from '../../hooks/use-id';
import { createComponentWarnings } from '@compa11y/core';

const warn = createComponentWarnings('Stepper');

// ---------------------------------------------------------------------------
// Visually hidden style (self-contained)
// ---------------------------------------------------------------------------

const srOnlyStyle: React.CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type StepState = 'upcoming' | 'current' | 'completed' | 'error' | 'locked';

export interface StepItem {
  /** Unique identifier for this step. */
  id: string;
  /** Visible label (e.g. "Shipping", "Payment"). */
  label: string;
  /**
   * Visual/semantic state.
   * Defaults to `'upcoming'`. The step matching `currentStepId` is always
   * treated as `'current'` regardless of what you pass here.
   */
  state?: StepState;
  /**
   * Optional description shown below the label.
   * Useful for providing additional context (e.g. "Complete your shipping address").
   */
  description?: string;
}

export interface StepperProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange'> {
  /** Accessible label for the `<nav>` landmark. Required. */
  ariaLabel: string;

  /**
   * Component mode.
   * - `'progress'` — non-interactive indicator
   * - `'navigation'` — interactive, steps can be clicked
   */
  mode: 'progress' | 'navigation';

  /** Ordered list of steps. */
  steps: StepItem[];

  /**
   * ID of the currently active step.
   * Controlled — pass this to drive which step is "current".
   */
  currentStepId?: string;

  /**
   * Seed value for uncontrolled usage.
   * Ignored when `currentStepId` is provided.
   */
  defaultStepId?: string;

  /**
   * Called when the user selects a step (navigation mode only).
   * Receives the step `id`.
   */
  onStepSelect?: (stepId: string) => void;

  /**
   * Layout direction.
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical';

  /**
   * Show "Step X of Y" text alongside the step list.
   * @default false
   */
  showStepCount?: boolean;

  /**
   * Custom icon renderer per step.
   * The returned node is wrapped with `aria-hidden="true"` — meaning
   * must come from the text label, not the icon.
   */
  renderIcon?: (step: StepItem, index: number) => React.ReactNode;

  /**
   * Override the screen-reader label for a step.
   * Default generates labels like "Shipping (completed)", "Payment (current step)".
   */
  getA11yLabel?: (step: StepItem, index: number, totalSteps: number) => string;

  /** Disables all interactive steps (navigation mode). */
  disabled?: boolean;

  /** Strip default data attributes / inline styles. */
  unstyled?: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getDefaultA11yLabel(step: StepItem, index: number, total: number): string {
  const position = `Step ${index + 1} of ${total}`;
  const state = step.state ?? 'upcoming';

  const stateLabels: Record<StepState, string> = {
    upcoming: '',
    current: '(current step)',
    completed: '(completed)',
    error: '(error)',
    locked: '(locked)',
  };

  const suffix = stateLabels[state];
  return [position, step.label, suffix].filter(Boolean).join(', ');
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const Stepper = forwardRef<HTMLElement, StepperProps>(
  function Stepper(
    {
      ariaLabel,
      mode,
      steps,
      currentStepId: controlledStepId,
      defaultStepId,
      onStepSelect,
      orientation = 'horizontal',
      showStepCount = false,
      renderIcon,
      getA11yLabel,
      disabled = false,
      unstyled = false,
      className = '',
      style,
      ...props
    },
    ref
  ) {
    // ── Controlled + uncontrolled ──────────────────────────────────────────
    const [uncontrolledStepId, setUncontrolledStepId] = useState(
      defaultStepId ?? steps[0]?.id ?? ''
    );
    const currentId = controlledStepId ?? uncontrolledStepId;

    // Apply "current" state to the step matching currentId
    const resolvedSteps = steps.map((step) => ({
      ...step,
      state: step.id === currentId ? ('current' as StepState) : (step.state ?? 'upcoming'),
    }));

    const currentIndex = resolvedSteps.findIndex((s) => s.id === currentId);

    // ── IDs ───────────────────────────────────────────────────────────────
    const baseId = useId('stepper');

    // ── Live region ───────────────────────────────────────────────────────
    const [liveMessage, setLiveMessage] = useState('');

    const pushAnnouncement = useCallback((message: string) => {
      setLiveMessage(message);
      setTimeout(() => setLiveMessage(''), 1000);
    }, []);

    // ── Dev warnings ──────────────────────────────────────────────────────
    if (process.env.NODE_ENV !== 'production') {
      if (!ariaLabel) {
        warn.error(
          'Stepper requires an ariaLabel prop.',
          'Pass ariaLabel="Checkout steps" (or similar) to Stepper.'
        );
      }
      if (!steps || steps.length === 0) {
        warn.error(
          'Stepper steps array is empty.',
          'Pass at least one step to Stepper.'
        );
      }
      if (currentId && !steps.find((s) => s.id === currentId)) {
        warn.warning(
          `currentStepId "${currentId}" does not match any step id.`,
          'Ensure currentStepId matches one of the step ids.'
        );
      }
      if (mode === 'navigation' && !onStepSelect) {
        warn.info(
          'Navigation mode without onStepSelect — steps will be interactive but clicks won\'t do anything.',
          'Pass onStepSelect to handle step navigation.'
        );
      }

      // Check for duplicate step IDs
      const ids = steps.map((s) => s.id);
      const uniqueIds = new Set(ids);
      if (uniqueIds.size !== ids.length) {
        warn.error(
          'Stepper contains duplicate step IDs.',
          'Each step must have a unique id.'
        );
      }
    }

    // ── Step selection handler ─────────────────────────────────────────────
    const prevStepIdRef = useRef<string | undefined>(undefined);

    const handleStepSelect = useCallback(
      (stepId: string) => {
        if (mode !== 'navigation' || disabled) return;

        const step = resolvedSteps.find((s) => s.id === stepId);
        if (!step) return;

        // Don't allow navigation to locked steps
        if (step.state === 'locked') return;

        if (controlledStepId === undefined) setUncontrolledStepId(stepId);
        onStepSelect?.(stepId);

        const idx = steps.findIndex((s) => s.id === stepId);
        pushAnnouncement(`Step ${idx + 1} of ${steps.length}: ${step.label}`);
      },
      [mode, disabled, resolvedSteps, controlledStepId, onStepSelect, steps, pushAnnouncement]
    );

    // ── Announce step changes when driven externally (controlled) ──────────
    useEffect(() => {
      if (prevStepIdRef.current === undefined) {
        prevStepIdRef.current = currentId;
        return;
      }
      if (prevStepIdRef.current === currentId) return;
      prevStepIdRef.current = currentId;

      if (mode === 'progress') {
        const idx = steps.findIndex((s) => s.id === currentId);
        const step = steps[idx];
        if (step) {
          pushAnnouncement(`Step ${idx + 1} of ${steps.length}: ${step.label}`);
        }
      }
    }, [currentId, mode, steps, pushAnnouncement]);

    // ── Styles ────────────────────────────────────────────────────────────
    const isVertical = orientation === 'vertical';

    const navAttr = unstyled ? {} : { 'data-compa11y-stepper': '' };

    const olStyle: React.CSSProperties = unstyled
      ? {}
      : {
          display: 'flex',
          flexDirection: isVertical ? 'column' : 'row',
          alignItems: isVertical ? 'stretch' : 'center',
          gap: isVertical ? '0' : '0',
          listStyle: 'none',
          margin: 0,
          padding: 0,
          width: '100%',
          counterReset: 'stepper-counter',
        };

    const getStepStyle = (): React.CSSProperties => {
      if (unstyled) return {};
      return {
        display: 'flex',
        flexDirection: isVertical ? 'row' : 'column',
        alignItems: 'center',
        flex: isVertical ? undefined : '1 1 0',
        position: 'relative',
        textAlign: isVertical ? 'left' : 'center',
        gap: isVertical ? '12px' : '8px',
        padding: isVertical ? '0 0 24px 0' : '0',
      };
    };

    const getIndicatorStyle = (step: typeof resolvedSteps[0]): React.CSSProperties => {
      if (unstyled) return {};

      const stateColors: Record<StepState, string> = {
        upcoming: 'var(--compa11y-stepper-indicator-bg-upcoming, #e2e8f0)',
        current: 'var(--compa11y-stepper-indicator-bg-current, #0066cc)',
        completed: 'var(--compa11y-stepper-indicator-bg-completed, #22c55e)',
        error: 'var(--compa11y-stepper-indicator-bg-error, #ef4444)',
        locked: 'var(--compa11y-stepper-indicator-bg-locked, #94a3b8)',
      };

      const stateTextColors: Record<StepState, string> = {
        upcoming: 'var(--compa11y-stepper-indicator-color-upcoming, #64748b)',
        current: 'var(--compa11y-stepper-indicator-color-current, #fff)',
        completed: 'var(--compa11y-stepper-indicator-color-completed, #fff)',
        error: 'var(--compa11y-stepper-indicator-color-error, #fff)',
        locked: 'var(--compa11y-stepper-indicator-color-locked, #fff)',
      };

      return {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 'var(--compa11y-stepper-indicator-size, 32px)',
        height: 'var(--compa11y-stepper-indicator-size, 32px)',
        minWidth: 'var(--compa11y-stepper-indicator-size, 32px)',
        borderRadius: '50%',
        background: stateColors[step.state],
        color: stateTextColors[step.state],
        fontSize: '0.875rem',
        fontWeight: step.state === 'current' ? 700 : 500,
        border: step.state === 'current'
          ? '2px solid var(--compa11y-stepper-indicator-border-current, #0066cc)'
          : '2px solid transparent',
        transition: 'background 0.2s ease, border-color 0.2s ease',
        flexShrink: 0,
      };
    };

    const getConnectorStyle = (index: number): React.CSSProperties => {
      if (unstyled) return {};
      const step = resolvedSteps[index];
      const isCompleted = step?.state === 'completed';

      if (isVertical) {
        return {
          position: 'absolute',
          left: 'calc(var(--compa11y-stepper-indicator-size, 32px) / 2)',
          top: 'calc(var(--compa11y-stepper-indicator-size, 32px) + 4px)',
          width: '2px',
          bottom: '4px',
          background: isCompleted
            ? 'var(--compa11y-stepper-connector-bg-completed, #22c55e)'
            : 'var(--compa11y-stepper-connector-bg, #e2e8f0)',
          transition: 'background 0.2s ease',
        };
      }

      return {
        flex: '1 1 0',
        height: '2px',
        background: isCompleted
          ? 'var(--compa11y-stepper-connector-bg-completed, #22c55e)'
          : 'var(--compa11y-stepper-connector-bg, #e2e8f0)',
        transition: 'background 0.2s ease',
        alignSelf: 'center',
      };
    };

    const getLabelStyle = (step: typeof resolvedSteps[0]): React.CSSProperties => {
      if (unstyled) return {};
      return {
        fontSize: 'var(--compa11y-stepper-label-size, 0.875rem)',
        fontWeight: step.state === 'current' ? 600 : 400,
        color: step.state === 'locked'
          ? 'var(--compa11y-stepper-label-color-locked, #94a3b8)'
          : step.state === 'error'
            ? 'var(--compa11y-stepper-label-color-error, #ef4444)'
            : 'var(--compa11y-stepper-label-color, inherit)',
        marginTop: isVertical ? '0' : '0',
      };
    };

    const getDescriptionStyle = (): React.CSSProperties => {
      if (unstyled) return {};
      return {
        fontSize: 'var(--compa11y-stepper-description-size, 0.75rem)',
        color: 'var(--compa11y-stepper-description-color, #64748b)',
        marginTop: '2px',
      };
    };

    const buttonBaseStyle: React.CSSProperties = unstyled
      ? {}
      : {
          appearance: 'none',
          background: 'none',
          border: 'none',
          padding: '8px',
          margin: 0,
          font: 'inherit',
          color: 'inherit',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: isVertical ? 'row' : 'column',
          alignItems: 'center',
          gap: isVertical ? '12px' : '8px',
          textAlign: isVertical ? 'left' : 'center',
          borderRadius: 'var(--compa11y-stepper-btn-radius, 8px)',
          minWidth: '44px',
          minHeight: '44px',
          width: '100%',
        };

    // ── Render step content ───────────────────────────────────────────────
    const renderStepIndicator = (step: typeof resolvedSteps[0], index: number) => {
      if (renderIcon) {
        return (
          <span aria-hidden="true" style={getIndicatorStyle(step)}
            {...(!unstyled && { 'data-compa11y-stepper-indicator': '' })}
          >
            {renderIcon(step, index)}
          </span>
        );
      }

      // Default: show step number, checkmark for completed, X for error
      let content: React.ReactNode = index + 1;
      if (step.state === 'completed') content = '\u2713'; // checkmark
      if (step.state === 'error') content = '!';

      return (
        <span aria-hidden="true" style={getIndicatorStyle(step)}
          {...(!unstyled && { 'data-compa11y-stepper-indicator': '', 'data-state': step.state })}
        >
          {content}
        </span>
      );
    };

    const renderStepLabel = (step: typeof resolvedSteps[0]) => (
      <span
        style={getLabelStyle(step)}
        {...(!unstyled && { 'data-compa11y-stepper-label': '' })}
      >
        {step.label}
        <span style={srOnlyStyle}>
          {step.state === 'completed' && ' (completed)'}
          {step.state === 'current' && ' (current step)'}
          {step.state === 'error' && ' (error)'}
          {step.state === 'locked' && ' (locked)'}
        </span>
      </span>
    );

    const renderStepDescription = (step: typeof resolvedSteps[0]) => {
      if (!step.description) return null;
      return (
        <span
          style={getDescriptionStyle()}
          {...(!unstyled && { 'data-compa11y-stepper-description': '' })}
        >
          {step.description}
        </span>
      );
    };

    const renderStepTextContent = (step: typeof resolvedSteps[0]) => (
      <span
        style={unstyled ? {} : { display: 'flex', flexDirection: 'column' }}
        {...(!unstyled && { 'data-compa11y-stepper-text': '' })}
      >
        {renderStepLabel(step)}
        {renderStepDescription(step)}
      </span>
    );

    // ── Render ────────────────────────────────────────────────────────────
    return (
      <nav
        ref={ref}
        aria-label={ariaLabel}
        style={style}
        className={className}
        {...navAttr}
        {...(!unstyled && {
          'data-orientation': orientation,
          'data-mode': mode,
        })}
        {...props}
      >
        {/* Live region — always in DOM */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          style={srOnlyStyle}
        >
          {liveMessage}
        </div>

        {/* Step count (optional) */}
        {showStepCount && currentIndex >= 0 && (
          <div
            style={unstyled ? {} : {
              fontSize: 'var(--compa11y-stepper-count-size, 0.875rem)',
              color: 'var(--compa11y-stepper-count-color, #64748b)',
              marginBottom: '8px',
            }}
            {...(!unstyled && { 'data-compa11y-stepper-count': '' })}
          >
            Step {currentIndex + 1} of {steps.length}
          </div>
        )}

        <ol
          style={olStyle}
          {...(!unstyled && { 'data-compa11y-stepper-list': '' })}
        >
          {resolvedSteps.map((step, index) => {
            const stepId = `${baseId}-step-${step.id}`;
            const isCurrent = step.state === 'current';
            const isLast = index === resolvedSteps.length - 1;

            const a11yLabel = getA11yLabel
              ? getA11yLabel(step, index, steps.length)
              : getDefaultA11yLabel(step, index, steps.length);

            if (mode === 'progress') {
              // Non-interactive: plain text
              return (
                <li
                  key={step.id}
                  id={stepId}
                  aria-current={isCurrent ? 'step' : undefined}
                  style={getStepStyle()}
                  {...(!unstyled && {
                    'data-compa11y-stepper-item': '',
                    'data-state': step.state,
                  })}
                >
                  {renderStepIndicator(step, index)}
                  {renderStepTextContent(step)}
                  {!isLast && (
                    <span
                      aria-hidden="true"
                      style={getConnectorStyle(index)}
                      {...(!unstyled && { 'data-compa11y-stepper-connector': '' })}
                    />
                  )}
                </li>
              );
            }

            // Navigation mode: steps are <button>
            const isDisabled = disabled || step.state === 'locked';

            return (
              <li
                key={step.id}
                style={unstyled ? {} : {
                  display: 'flex',
                  flex: isVertical ? undefined : '1 1 0',
                  alignItems: 'center',
                  position: 'relative',
                  ...(isVertical ? { paddingBottom: isLast ? 0 : '0' } : {}),
                }}
                {...(!unstyled && {
                  'data-compa11y-stepper-item': '',
                  'data-state': step.state,
                })}
              >
                <button
                  type="button"
                  id={stepId}
                  aria-label={a11yLabel}
                  aria-current={isCurrent ? 'step' : undefined}
                  disabled={isDisabled}
                  onClick={() => handleStepSelect(step.id)}
                  style={{
                    ...buttonBaseStyle,
                    ...(isDisabled && !unstyled
                      ? { opacity: 0.5, cursor: 'not-allowed' }
                      : {}
                    ),
                  }}
                  {...(!unstyled && {
                    'data-compa11y-stepper-btn': '',
                    'data-state': step.state,
                  })}
                >
                  {renderStepIndicator(step, index)}
                  {renderStepTextContent(step)}
                </button>
                {!isLast && (
                  <span
                    aria-hidden="true"
                    style={getConnectorStyle(index)}
                    {...(!unstyled && { 'data-compa11y-stepper-connector': '' })}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }
);
