/**
 * Accessible Popover React compound component.
 *
 * Non-modal, anchored overlay — distinct from Dialog:
 * - No focus trap (Tab moves through content freely)
 * - No scroll lock
 * - Positioned relative to trigger, viewport-aware with flip
 * - Dismissable via Escape or pointer outside
 *
 * @example
 * ```tsx
 * // Basic
 * <Popover>
 *   <Popover.Trigger>More info</Popover.Trigger>
 *   <Popover.Content aria-label="More information">
 *     <p>Non-modal overlay. Press Escape or click outside to dismiss.</p>
 *   </Popover.Content>
 * </Popover>
 *
 * // With placement + close button
 * <Popover>
 *   <Popover.Trigger>Settings</Popover.Trigger>
 *   <Popover.Content placement="bottom-start" aria-label="Settings panel">
 *     <p>Adjust your preferences.</p>
 *     <Popover.Close>Dismiss</Popover.Close>
 *   </Popover.Content>
 * </Popover>
 *
 * // Controlled + informational (no autofocus)
 * const [open, setOpen] = useState(false);
 * <Popover open={open} onOpenChange={setOpen}>
 *   <Popover.Trigger>?</Popover.Trigger>
 *   <Popover.Content focusPolicy="none" aria-label="Help text">
 *     <p>ISO-8601 date format required.</p>
 *   </Popover.Content>
 * </Popover>
 *
 * // Region role (non-dialog semantic)
 * <Popover>
 *   <Popover.Trigger>Filter</Popover.Trigger>
 *   <Popover.Content role="region" aria-label="Filter options" haspopup="false">
 *     <form>...</form>
 *   </Popover.Content>
 * </Popover>
 * ```
 *
 * Keyboard contract:
 * - Enter / Space on trigger → open
 * - Escape (from anywhere inside) → close, return focus to trigger
 * - Tab / Shift+Tab → move through content freely (no trap)
 * - Click outside → close (focus stays where the user clicked)
 */

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { useId as useReactId } from 'react';
import { PopoverProvider, usePopoverContext } from './popover-context';
import { createComponentWarnings } from '@compa11y/core';

const warnings = createComponentWarnings('Popover');

// ─── Types ───────────────────────────────────────────────────────────────────

export type PopoverPlacement =
  | 'top' | 'top-start' | 'top-end'
  | 'bottom' | 'bottom-start' | 'bottom-end'
  | 'left' | 'left-start' | 'left-end'
  | 'right' | 'right-start' | 'right-end';

/**
 * 'first'     — focus first focusable child (default, good for interactive popovers)
 * 'container' — focus the content container itself (tabindex=-1)
 * 'none'      — do not move focus (good for pointer-triggered informational popovers)
 */
export type PopoverFocusPolicy = 'first' | 'container' | 'none';

export interface PopoverProps {
  /** Whether the popover is open (controlled) */
  open?: boolean;
  /** Default open state (uncontrolled) */
  defaultOpen?: boolean;
  /** Called when open state should change */
  onOpenChange?: (open: boolean) => void;
  /** Disable the trigger, preventing the popover from opening */
  disabled?: boolean;
  children: React.ReactNode;
}

export interface PopoverTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * aria-haspopup value applied to the trigger button.
   * Should match the role of the popover content.
   * @default 'dialog'
   */
  haspopup?: 'dialog' | 'menu' | 'listbox' | 'tree' | 'grid' | 'true' | false;
}

export interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Preferred placement. Auto-flips if the popover would overflow the viewport.
   * @default 'bottom'
   */
  placement?: PopoverPlacement;
  /**
   * Pixel gap between trigger and popover.
   * @default 8
   */
  offset?: number;
  /**
   * ARIA role for the content container.
   * Use 'region' for landmark-style popovers; 'dialog' for interactive surfaces.
   * @default 'dialog'
   */
  role?: string;
  /**
   * Focus policy on open.
   * @default 'first'
   */
  focusPolicy?: PopoverFocusPolicy;
  /** Portal target element. Defaults to document.body. */
  container?: HTMLElement | null;
  /** Remove default visual styles */
  unstyled?: boolean;
}

export interface PopoverCloseProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

// ─── Position Calculation ─────────────────────────────────────────────────────

interface Position {
  top: number;
  left: number;
}

function computePosition(
  triggerRect: DOMRect,
  contentEl: HTMLElement,
  placement: PopoverPlacement,
  offset: number
): Position {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const w = contentEl.offsetWidth;
  const h = contentEl.offsetHeight;

  const dashIdx = placement.indexOf('-');
  const side = dashIdx === -1 ? placement : placement.slice(0, dashIdx);
  const align = dashIdx === -1 ? 'center' : placement.slice(dashIdx + 1);

  let top = 0;
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

// ─── Focusable Selector ───────────────────────────────────────────────────────

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), details > summary';

// ─── Root ─────────────────────────────────────────────────────────────────────

function PopoverRoot({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  children,
}: PopoverProps) {
  const reactId = useReactId();
  const id = reactId.replace(/:/g, '-');

  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isOpen = controlledOpen ?? uncontrolledOpen;

  const [contentMounted, setContentMounted] = useState(false);

  const triggerRef = useRef<HTMLElement | null>(null);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (controlledOpen === undefined) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [controlledOpen, onOpenChange]
  );

  return (
    <PopoverProvider
      value={{
        isOpen,
        onOpenChange: handleOpenChange,
        triggerId: `${id}-trigger`,
        contentId: `${id}-content`,
        triggerRef,
        disabled,
        contentMounted,
        setContentMounted,
      }}
    >
      {children}
    </PopoverProvider>
  );
}

// ─── Trigger ─────────────────────────────────────────────────────────────────

const PopoverTrigger = forwardRef<HTMLButtonElement, PopoverTriggerProps>(
  function PopoverTrigger(
    { onClick, children, haspopup = 'dialog', disabled: localDisabled, ...props },
    ref
  ) {
    const {
      isOpen,
      onOpenChange,
      triggerId,
      contentId,
      triggerRef,
      disabled: contextDisabled,
      contentMounted,
    } = usePopoverContext();

    const isDisabled = localDisabled ?? contextDisabled;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) return;
      onClick?.(e);
      onOpenChange(!isOpen);
    };

    // Merge refs
    const mergedRef = useCallback(
      (el: HTMLButtonElement | null) => {
        (triggerRef as React.MutableRefObject<HTMLElement | null>).current = el;
        if (typeof ref === 'function') ref(el);
        else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = el;
      },
      [ref, triggerRef]
    );

    return (
      <button
        ref={mergedRef}
        id={triggerId}
        type="button"
        // aria-haspopup is configurable — set to false/undefined to omit
        aria-haspopup={haspopup === false ? undefined : haspopup}
        aria-expanded={isOpen}
        // aria-controls only when content is actually mounted in the DOM
        aria-controls={contentMounted ? contentId : undefined}
        disabled={isDisabled}
        onClick={handleClick}
        data-compa11y-popover-trigger
        data-open={isOpen}
        {...props}
      >
        {children}
      </button>
    );
  }
);

// ─── Content ──────────────────────────────────────────────────────────────────

const PopoverContent = forwardRef<HTMLDivElement, PopoverContentProps>(
  function PopoverContent(
    {
      placement = 'bottom',
      offset = 8,
      role = 'dialog',
      focusPolicy = 'first',
      container,
      unstyled = false,
      style,
      className = '',
      children,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      ...props
    },
    ref
  ) {
    const {
      isOpen,
      onOpenChange,
      contentId,
      triggerId,
      triggerRef,
      setContentMounted,
    } = usePopoverContext();

    const contentRef = useRef<HTMLDivElement | null>(null);
    const [position, setPosition] = useState<Position>({ top: 0, left: 0 });
    const [visible, setVisible] = useState(false);
    /** True only when WE moved focus into the content. */
    const weMovedFocusRef = useRef(false);

    // ── Notify root when we mount/unmount ──────────────────────────────────
    useEffect(() => {
      setContentMounted(true);
      return () => setContentMounted(false);
    }, [setContentMounted]);

    // ── Compute position ──────────────────────────────────────────────────
    const updatePosition = useCallback(() => {
      const triggerEl = triggerRef.current;
      const contentEl = contentRef.current;
      if (!triggerEl || !contentEl) return;

      const triggerRect = triggerEl.getBoundingClientRect();
      const pos = computePosition(triggerRect, contentEl, placement, offset);
      setPosition(pos);
    }, [triggerRef, placement, offset]);

    // ── On open: position → show → focus ─────────────────────────────────
    useEffect(() => {
      if (!isOpen) {
        setVisible(false);
        weMovedFocusRef.current = false;
        return;
      }

      requestAnimationFrame(() => {
        updatePosition();
        setVisible(true);

        const contentEl = contentRef.current;

        // Dev warning: content must have an accessible name
        if (contentEl) {
          const hasLabel = ariaLabel || ariaLabelledBy;
          const hasHeading = !!contentEl.querySelector(
            'h1, h2, h3, h4, h5, h6, [role="heading"]'
          );
          if (!hasLabel && !hasHeading) {
            warnings.warning(
              'Popover.Content has no accessible name. Add aria-label="..." or aria-labelledby, or place a heading inside the content.',
              'Example: <Popover.Content aria-label="Filter options">...</Popover.Content>'
            );
          }
        }

        // Focus policy
        if (focusPolicy === 'none') return;
        if (!contentEl) return;

        let target: HTMLElement | null = null;
        if (focusPolicy === 'first') {
          target = contentEl.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
        }
        // Fall back to container if no focusable found (or policy === 'container')
        if (!target) target = contentEl;

        weMovedFocusRef.current = true;
        target.focus();
      });
    }, [isOpen, updatePosition, focusPolicy, ariaLabel, ariaLabelledBy]);

    // ── Keep position updated on scroll / resize ──────────────────────────
    useEffect(() => {
      if (!isOpen) return;
      const onScrollOrResize = () => updatePosition();
      window.addEventListener('scroll', onScrollOrResize, { passive: true, capture: true });
      window.addEventListener('resize', onScrollOrResize, { passive: true });
      return () => {
        window.removeEventListener('scroll', onScrollOrResize, true);
        window.removeEventListener('resize', onScrollOrResize);
      };
    }, [isOpen, updatePosition]);

    // ── Dismiss: outside pointer click via composedPath() ─────────────────
    useEffect(() => {
      if (!isOpen) return;

      const onPointerDown = (e: PointerEvent) => {
        // composedPath() pierces shadow DOM and portal boundaries correctly,
        // unlike Node.contains() which can miss portaled or shadow-rooted nodes.
        const path = e.composedPath();
        if (contentRef.current && path.includes(contentRef.current)) return;
        if (triggerRef.current && path.includes(triggerRef.current)) return;
        // User clicked somewhere else — close but DON'T yank focus back
        // (their click already moved focus where they intended)
        onOpenChange(false);
      };

      document.addEventListener('pointerdown', onPointerDown, true);
      return () => document.removeEventListener('pointerdown', onPointerDown, true);
    }, [isOpen, onOpenChange, triggerRef]);

    // ── Dismiss: Escape key ───────────────────────────────────────────────
    useEffect(() => {
      if (!isOpen) return;

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key !== 'Escape') return;
        e.stopPropagation();
        onOpenChange(false);

        // Only return focus if it's currently inside the popover.
        // (Avoids yanking focus when Escape is pressed elsewhere.)
        if (contentRef.current?.contains(document.activeElement)) {
          triggerRef.current?.focus();
        }
        weMovedFocusRef.current = false;
      };

      document.addEventListener('keydown', onKeyDown, true);
      return () => document.removeEventListener('keydown', onKeyDown, true);
    }, [isOpen, onOpenChange, triggerRef]);

    // ── Merge refs ────────────────────────────────────────────────────────
    const mergedRef = useCallback(
      (el: HTMLDivElement | null) => {
        contentRef.current = el;
        if (typeof ref === 'function') ref(el);
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
      },
      [ref]
    );

    if (!isOpen) return null;

    const defaultStyles: React.CSSProperties = unstyled
      ? {}
      : {
          background: 'var(--compa11y-popover-bg, #fff)',
          color: 'var(--compa11y-popover-color, inherit)',
          border: 'var(--compa11y-popover-border, 1px solid rgba(0,0,0,.15))',
          borderRadius: 'var(--compa11y-popover-radius, 0.375rem)',
          boxShadow:
            'var(--compa11y-popover-shadow, 0 4px 16px rgba(0,0,0,.12))',
          padding: 'var(--compa11y-popover-padding, 1rem)',
          maxWidth: 'var(--compa11y-popover-max-width, 320px)',
          minWidth: '100px',
          transition: 'opacity 0.15s ease, transform 0.15s ease',
          opacity: visible ? 1 : 0,
          transform: visible
            ? 'scale(1) translateY(0)'
            : 'scale(0.96) translateY(-2px)',
        };

    const content = (
      <div
        ref={mergedRef}
        id={contentId}
        role={role}
        aria-modal="false"
        // aria-labelledby defaults to triggerId when no explicit label is given
        aria-labelledby={ariaLabelledBy ?? (!ariaLabel ? triggerId : undefined)}
        aria-label={ariaLabel}
        tabIndex={-1}
        className={className}
        data-compa11y-popover-content
        data-placement={placement}
        data-open={isOpen}
        style={{
          position: 'fixed',
          zIndex: 1000,
          top: position.top,
          left: position.left,
          ...defaultStyles,
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );

    const portalTarget =
      container ?? (typeof document !== 'undefined' ? document.body : null);

    return portalTarget ? createPortal(content, portalTarget) : content;
  }
);

// ─── Close Button ─────────────────────────────────────────────────────────────

const PopoverClose = forwardRef<HTMLButtonElement, PopoverCloseProps>(
  function PopoverClose({ onClick, children, ...props }, ref) {
    const { onOpenChange, triggerRef } = usePopoverContext();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      onOpenChange(false);
      // Explicit close always returns focus to the trigger
      triggerRef.current?.focus();
    };

    return (
      <button
        ref={ref}
        type="button"
        onClick={handleClick}
        data-compa11y-popover-close
        {...props}
      >
        {children ?? 'Close'}
      </button>
    );
  }
);

// ─── Compound Export ──────────────────────────────────────────────────────────

/**
 * Accessible, non-modal Popover.
 *
 * Keyboard contract:
 * - **Enter / Space** on trigger → open
 * - **Escape** (from anywhere inside) → close, return focus to trigger
 * - **Tab / Shift+Tab** → move freely through content (no trap)
 * - **Click outside** → close; focus stays where the user clicked
 *
 * @example
 * ```tsx
 * <Popover>
 *   <Popover.Trigger>Open</Popover.Trigger>
 *   <Popover.Content aria-label="Settings panel" placement="bottom-start">
 *     <p>Content here.</p>
 *     <Popover.Close>Dismiss</Popover.Close>
 *   </Popover.Content>
 * </Popover>
 * ```
 */
export const Popover = Object.assign(PopoverRoot, {
  Trigger: PopoverTrigger,
  Content: PopoverContent,
  Close: PopoverClose,
});

/** Same as Popover, exported for named compound imports */
export const PopoverCompound = Popover;
