/**
 * Accessible Tooltip component.
 *
 * Shows a short descriptive text anchored to a trigger element.
 * Uses role="tooltip" + aria-describedby so screen readers announce
 * the tooltip content after the trigger's name and role.
 *
 * WCAG 2.1 SC 1.4.13 (Content on Hover or Focus):
 * - Tooltip persists while the pointer hovers over the trigger or content
 * - Tooltip dismissible via Escape without moving focus
 * - Focus always shows tooltip immediately (no hover delay)
 * - Tooltip content does not time out
 *
 * @example
 * ```tsx
 * // Basic
 * <Tooltip label="Save your changes">
 *   <button>Save</button>
 * </Tooltip>
 *
 * // Custom placement
 * <Tooltip label="Format: YYYY-MM-DD" placement="bottom">
 *   <input type="text" placeholder="Date" />
 * </Tooltip>
 *
 * // Controlled
 * <Tooltip label="Read only" open={isOpen} onOpenChange={setIsOpen}>
 *   <span tabIndex={0}>Hover me</span>
 * </Tooltip>
 * ```
 *
 * Keyboard contract:
 * - **Focus** trigger → tooltip appears immediately
 * - **Escape** → tooltip dismisses; focus stays on trigger
 * - **Tab** away → tooltip dismisses
 */

import React, {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { useId } from '../../hooks/use-id';
import { createComponentWarnings } from '@compa11y/core';

const warnings = createComponentWarnings('Tooltip');

// ─── Types ───────────────────────────────────────────────────────────────────

export type TooltipPlacement =
  | 'top' | 'top-start' | 'top-end'
  | 'bottom' | 'bottom-start' | 'bottom-end'
  | 'left' | 'left-start' | 'left-end'
  | 'right' | 'right-start' | 'right-end';

export interface TooltipProps {
  /** Tooltip text or content. Required — warns in dev if absent. */
  label: React.ReactNode;
  /** Trigger element — must be a single React element. */
  children: React.ReactElement;
  /**
   * Preferred placement relative to the trigger.
   * Auto-flips to the opposite side if the tooltip would overflow the viewport.
   * @default 'top'
   */
  placement?: TooltipPlacement;
  /**
   * Delay in ms before the tooltip shows on hover.
   * Focus always shows the tooltip immediately regardless of this value.
   * @default 300
   */
  delay?: number;
  /**
   * Delay in ms before the tooltip hides on mouse-leave.
   * @default 0
   */
  hideDelay?: number;
  /** Pixel gap between trigger and tooltip. @default 8 */
  offset?: number;
  /** Disable the tooltip. The trigger is still interactive. */
  disabled?: boolean;
  /** Remove default visual styles (background, radius, shadow, etc.). */
  unstyled?: boolean;
  /** Portal target element. @default document.body */
  container?: HTMLElement | null;
  /** Controlled open state. */
  open?: boolean;
  /** Called when the open state should change. */
  onOpenChange?: (open: boolean) => void;
}

// ─── Position Calculation ─────────────────────────────────────────────────────

interface Position {
  top: number;
  left: number;
}

function computePosition(
  triggerRect: DOMRect,
  contentEl: HTMLElement,
  placement: TooltipPlacement,
  offset: number
): Position {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const w = contentEl.offsetWidth;
  const h = contentEl.offsetHeight;

  const dashIdx = placement.indexOf('-');
  const side  = dashIdx === -1 ? placement : placement.slice(0, dashIdx);
  const align = dashIdx === -1 ? 'center' : placement.slice(dashIdx + 1);

  let top  = 0;
  let left = 0;

  switch (side) {
    case 'top':    top  = triggerRect.top - h - offset; break;
    case 'bottom': top  = triggerRect.bottom + offset;  break;
    case 'left':   left = triggerRect.left - w - offset; break;
    case 'right':  left = triggerRect.right + offset;   break;
  }

  if (side === 'top' || side === 'bottom') {
    switch (align) {
      case 'start':  left = triggerRect.left; break;
      case 'end':    left = triggerRect.right - w; break;
      default:       left = triggerRect.left + (triggerRect.width - w) / 2;
    }
  } else {
    switch (align) {
      case 'start':  top = triggerRect.top; break;
      case 'end':    top = triggerRect.bottom - h; break;
      default:       top = triggerRect.top + (triggerRect.height - h) / 2;
    }
  }

  // Flip if off-screen
  if (side === 'bottom' && top + h > vh && triggerRect.top - h - offset > 0)
    top = triggerRect.top - h - offset;
  else if (side === 'top' && top < 0 && triggerRect.bottom + offset + h < vh)
    top = triggerRect.bottom + offset;
  else if (side === 'right' && left + w > vw && triggerRect.left - w - offset > 0)
    left = triggerRect.left - w - offset;
  else if (side === 'left' && left < 0 && triggerRect.right + offset + w < vw)
    left = triggerRect.right + offset;

  const margin = 8;
  left = Math.max(margin, Math.min(left, vw - w - margin));
  top  = Math.max(margin, Math.min(top,  vh - h - margin));

  return { top, left };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Tooltip({
  label,
  children,
  placement = 'top',
  delay = 300,
  hideDelay = 0,
  offset = 8,
  disabled = false,
  unstyled = false,
  container,
  open: controlledOpen,
  onOpenChange,
}: TooltipProps) {
  const tooltipId = useId('tooltip');

  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isOpen = controlledOpen ?? uncontrolledOpen;

  const triggerRef = useRef<HTMLElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const showTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [position, setPosition] = useState<Position>({ top: 0, left: 0 });
  // Separate visible flag so opacity transition starts after position is set
  const [visible, setVisible] = useState(false);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const clearTimers = useCallback(() => {
    if (showTimer.current) { clearTimeout(showTimer.current); showTimer.current = null; }
    if (hideTimer.current) { clearTimeout(hideTimer.current); hideTimer.current = null; }
  }, []);

  const setOpen = useCallback((next: boolean) => {
    if (controlledOpen === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  }, [controlledOpen, onOpenChange]);

  const show = useCallback((immediate = false) => {
    if (disabled) return;
    clearTimers();
    showTimer.current = setTimeout(() => setOpen(true), immediate ? 0 : delay);
  }, [disabled, delay, setOpen, clearTimers]);

  const hide = useCallback((immediate = false) => {
    clearTimers();
    hideTimer.current = setTimeout(() => setOpen(false), immediate ? 0 : hideDelay);
  }, [hideDelay, setOpen, clearTimers]);

  // ── Position ─────────────────────────────────────────────────────────────

  const updatePosition = useCallback(() => {
    const triggerEl = triggerRef.current;
    const tooltipEl = tooltipRef.current;
    if (!triggerEl || !tooltipEl) return;
    setPosition(computePosition(triggerEl.getBoundingClientRect(), tooltipEl, placement, offset));
  }, [placement, offset]);

  // Two-step open: position first, then fade in
  useEffect(() => {
    if (!isOpen) {
      setVisible(false);
      return;
    }
    requestAnimationFrame(() => {
      updatePosition();
      setVisible(true);
    });
  }, [isOpen, updatePosition]);

  // Reposition on scroll / resize while open
  useEffect(() => {
    if (!isOpen) return;
    const update = () => updatePosition();
    window.addEventListener('scroll', update, { passive: true, capture: true });
    window.addEventListener('resize', update, { passive: true });
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [isOpen, updatePosition]);

  // ── Escape to dismiss (WCAG 2.1 SC 1.4.13) ───────────────────────────────

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      clearTimers();
      setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [isOpen, clearTimers, setOpen]);

  // ── Cleanup timers on unmount ─────────────────────────────────────────────

  useEffect(() => () => clearTimers(), [clearTimers]);

  // ── Dev warnings ──────────────────────────────────────────────────────────

  if (process.env.NODE_ENV !== 'production') {
    if (!label) {
      warnings.warning('Tooltip has no label. Provide a non-empty label prop.');
    }
    if (!isValidElement(children)) {
      warnings.error('Tooltip children must be a single React element.');
    }
  }

  if (!isValidElement(children)) {
    return children as unknown as React.ReactElement;
  }

  // ── Inject ARIA + event handlers into trigger child ───────────────────────

  const childProps = children.props as Record<string, unknown>;
  const existingDescribedBy = childProps['aria-describedby'] as string | undefined;
  const newDescribedBy = disabled
    ? existingDescribedBy
    : [tooltipId, existingDescribedBy].filter(Boolean).join(' ') || undefined;

  const trigger = cloneElement(children, {
    ref: (el: HTMLElement | null) => {
      triggerRef.current = el;
      // Forward existing ref
      const childRef = (children as unknown as { ref?: React.Ref<HTMLElement> }).ref;
      if (typeof childRef === 'function') (childRef as (el: HTMLElement | null) => void)(el);
      else if (childRef && typeof childRef === 'object' && 'current' in childRef) {
        (childRef as React.MutableRefObject<HTMLElement | null>).current = el;
      }
    },
    'aria-describedby': newDescribedBy,
    onMouseEnter: (e: React.MouseEvent) => {
      (childProps.onMouseEnter as ((e: React.MouseEvent) => void) | undefined)?.(e);
      show();
    },
    onMouseLeave: (e: React.MouseEvent) => {
      (childProps.onMouseLeave as ((e: React.MouseEvent) => void) | undefined)?.(e);
      hide();
    },
    // WCAG 2.1 SC 1.4.13: Focus shows immediately, no delay
    onFocus: (e: React.FocusEvent) => {
      (childProps.onFocus as ((e: React.FocusEvent) => void) | undefined)?.(e);
      show(true);
    },
    onBlur: (e: React.FocusEvent) => {
      (childProps.onBlur as ((e: React.FocusEvent) => void) | undefined)?.(e);
      hide(true);
    },
  } as Partial<typeof childProps>);

  // ── Tooltip element ───────────────────────────────────────────────────────
  // Always rendered in the portal so aria-describedby reference is always valid.
  // Shown/hidden via opacity — never removed from DOM while the parent renders.

  const showTooltip = isOpen && visible && !disabled;

  const defaultStyles: React.CSSProperties = {
    position: 'fixed',
    zIndex: 9999,
    top: position.top,
    left: position.left,
    pointerEvents: 'none',
    background: 'var(--compa11y-tooltip-bg, #1a1a1a)',
    color: 'var(--compa11y-tooltip-color, #fff)',
    borderRadius: 'var(--compa11y-tooltip-radius, 4px)',
    padding: 'var(--compa11y-tooltip-padding, 0.375rem 0.625rem)',
    fontSize: 'var(--compa11y-tooltip-font-size, 0.8125rem)',
    lineHeight: 1.4,
    maxWidth: 'var(--compa11y-tooltip-max-width, 280px)',
    boxShadow: 'var(--compa11y-tooltip-shadow, 0 2px 8px rgba(0,0,0,.2))',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    transition: 'opacity 0.1s ease',
    opacity: showTooltip ? 1 : 0,
  };

  const unstyledBase: React.CSSProperties = {
    position: 'fixed',
    zIndex: 9999,
    top: position.top,
    left: position.left,
    pointerEvents: 'none',
    opacity: showTooltip ? 1 : 0,
    transition: 'opacity 0.1s ease',
  };

  const tooltipEl = (
    <div
      ref={tooltipRef}
      id={tooltipId}
      role="tooltip"
      data-compa11y-tooltip
      data-placement={placement}
      data-open={showTooltip || undefined}
      style={unstyled ? unstyledBase : defaultStyles}
    >
      {label}
    </div>
  );

  const portalTarget = container ?? (typeof document !== 'undefined' ? document.body : null);

  return (
    <>
      {trigger}
      {portalTarget ? createPortal(tooltipEl, portalTarget) : tooltipEl}
    </>
  );
}
