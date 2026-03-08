import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useId } from '../../hooks/use-id';
import { useFocusTrap } from '../../hooks/use-focus-trap';
import { useAnnouncer } from '../../hooks/use-announcer';
import { DrawerProvider, useDrawerContext } from './drawer-context';
import { createComponentWarnings } from '@compa11y/core';

const warnings = createComponentWarnings('Drawer');

// Body scroll lock stacking — only restore overflow when all drawers/dialogs are closed
let bodyLockCount = 0;
let savedOverflow = '';

function lockBodyScroll(): void {
  if (bodyLockCount === 0) {
    savedOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  bodyLockCount++;
}

function unlockBodyScroll(): void {
  bodyLockCount--;
  if (bodyLockCount <= 0) {
    bodyLockCount = 0;
    document.body.style.overflow = savedOverflow;
  }
}

export type DrawerSide = 'left' | 'right' | 'top' | 'bottom';

export interface DrawerProps {
  /** Controlled open state */
  open?: boolean;
  /** Uncontrolled starting open state */
  defaultOpen?: boolean;
  /** Called when open state should change */
  onOpenChange?: (open: boolean) => void;
  /** Which edge the drawer slides in from */
  side?: DrawerSide;
  /** The drawer content */
  children: React.ReactNode;
  /** Custom class name */
  className?: string;
  /** Element to focus when drawer opens */
  initialFocus?: React.RefObject<HTMLElement>;
  /** Whether clicking outside closes the drawer */
  closeOnOutsideClick?: boolean;
  /** Whether pressing Escape closes the drawer */
  closeOnEscape?: boolean;
  /**
   * Allow the drawer panel to be dragged to dismiss.
   * When true, dragging the handle (or panel edge) past 40% of its dimension
   * dismisses the drawer; releasing before that snaps it back.
   * Keyboard users can still use Escape to dismiss.
   */
  draggable?: boolean;
  /** Portal container (defaults to document.body) */
  container?: HTMLElement;
  /** Accessible label (required if no DrawerTitle) */
  'aria-label'?: string;
  /** ID of element that labels the drawer */
  'aria-labelledby'?: string;
  /** Remove default styles to allow full customization via className */
  unstyled?: boolean;
}

export function Drawer({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  side = 'right',
  children,
  className,
  initialFocus,
  closeOnOutsideClick = true,
  closeOnEscape = true,
  draggable = false,
  container,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  unstyled = false,
}: DrawerProps) {
  const drawerId = useId('drawer');
  const titleId = useId('drawer-title');
  const descriptionId = useId('drawer-desc');

  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isOpen = controlledOpen ?? uncontrolledOpen;

  const [hasTitle, setHasTitle] = useState(false);
  const [hasDescription, setHasDescription] = useState(false);

  const close = useCallback(() => {
    if (controlledOpen === undefined) setUncontrolledOpen(false);
    onOpenChange?.(false);
  }, [controlledOpen, onOpenChange]);

  const openDrawer = useCallback(() => {
    if (controlledOpen === undefined) setUncontrolledOpen(true);
    onOpenChange?.(true);
  }, [controlledOpen, onOpenChange]);

  // Warn if no accessible label — deferred to allow sub-components to register
  useEffect(() => {
    if (!isOpen) return;

    const frameId = requestAnimationFrame(() => {
      if (!hasTitle && !ariaLabel && !ariaLabelledBy) {
        warnings.warning(
          'Drawer has no accessible title. Add a DrawerTitle or aria-label prop.',
          'Use <Drawer.Title> or provide aria-label="..."'
        );
      }
    });

    return () => cancelAnimationFrame(frameId);
  }, [isOpen, hasTitle, ariaLabel, ariaLabelledBy]);

  const contextValue = {
    isOpen,
    openDrawer,
    close,
    drawerId,
    titleId,
    descriptionId,
    side,
    hasTitle,
    hasDescription,
    setHasTitle,
    setHasDescription,
  };

  if (!isOpen) {
    return (
      <DrawerProvider value={contextValue}>
        {children}
      </DrawerProvider>
    );
  }

  const drawerContent = (
    <DrawerProvider value={contextValue}>
      <DrawerOverlay
        className={className}
        closeOnOutsideClick={closeOnOutsideClick}
        closeOnEscape={closeOnEscape}
        initialFocus={initialFocus}
        ariaLabel={ariaLabel}
        ariaLabelledBy={ariaLabelledBy}
        unstyled={unstyled}
        side={side}
        draggable={draggable}
      >
        {children}
      </DrawerOverlay>
    </DrawerProvider>
  );

  const portalContainer = container ?? document.body;
  return createPortal(drawerContent, portalContainer);
}

// ============================================================================
// Drag logic — imperative style updates to avoid per-pixel React re-renders
// ============================================================================

const DISMISS_THRESHOLD = 0.4;

interface DragState {
  startX: number;
  startY: number;
  pointerId: number;
}

interface DrawerOverlayProps {
  children: React.ReactNode;
  className?: string;
  closeOnOutsideClick: boolean;
  closeOnEscape: boolean;
  initialFocus?: React.RefObject<HTMLElement>;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  unstyled: boolean;
  side: DrawerSide;
  draggable: boolean;
}

function DrawerOverlay({
  children,
  className,
  closeOnOutsideClick,
  closeOnEscape,
  initialFocus,
  ariaLabel,
  ariaLabelledBy,
  unstyled,
  side,
  draggable,
}: DrawerOverlayProps) {
  const { close, drawerId, titleId, descriptionId, hasTitle, hasDescription } =
    useDrawerContext();
  const { announce } = useAnnouncer();

  const trapRef = useFocusTrap<HTMLDivElement>({
    active: true,
    initialFocus: initialFocus?.current ?? undefined,
    escapeDeactivates: closeOnEscape,
    clickOutsideDeactivates: false,
    returnFocus: true,
    onDeactivate: close,
  });

  // Drag state stored in a ref — no re-renders during drag
  const dragState = useRef<DragState | null>(null);

  useEffect(() => {
    announce('Drawer opened', { politeness: 'polite' });
    return () => {
      announce('Drawer closed', { politeness: 'polite' });
    };
  }, [announce]);

  useEffect(() => {
    lockBodyScroll();
    return () => unlockBodyScroll();
  }, []);

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (closeOnOutsideClick && event.target === event.currentTarget) {
      close();
    }
  };

  // ── Drag handlers ─────────────────────────────────────────────────────────

  const applyDragTransform = (dx: number, dy: number) => {
    const el = trapRef.current;
    if (!el) return;
    switch (side) {
      case 'left':
        el.style.transform = `translateX(${Math.min(0, dx)}px)`;
        break;
      case 'right':
        el.style.transform = `translateX(${Math.max(0, dx)}px)`;
        break;
      case 'top':
        el.style.transform = `translateY(${Math.min(0, dy)}px)`;
        break;
      case 'bottom':
        el.style.transform = `translateY(${Math.max(0, dy)}px)`;
        break;
    }
  };

  const snapBack = () => {
    const el = trapRef.current;
    if (!el) return;
    el.style.transition = 'transform 0.3s ease';
    el.style.transform = '';
    const cleanup = () => {
      el.style.transition = '';
      el.removeEventListener('transitionend', cleanup);
    };
    el.addEventListener('transitionend', cleanup);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggable) return;
    // Only initiate drag from the handle or the panel edge strip
    const target = e.target as HTMLElement;
    const isHandle = !!target.closest('[data-compa11y-drawer-handle]');
    if (!isHandle) return;

    e.currentTarget.setPointerCapture(e.pointerId);
    dragState.current = { startX: e.clientX, startY: e.clientY, pointerId: e.pointerId };
    // Disable transition during drag for immediate response
    if (trapRef.current) {
      trapRef.current.style.transition = 'none';
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggable || !dragState.current) return;
    if (dragState.current.pointerId !== e.pointerId) return;

    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    applyDragTransform(dx, dy);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggable || !dragState.current) return;
    if (dragState.current.pointerId !== e.pointerId) return;

    const el = trapRef.current;
    if (!el) { dragState.current = null; return; }

    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    dragState.current = null;

    const w = el.offsetWidth;
    const h = el.offsetHeight;

    const shouldClose =
      (side === 'left'   && dx < -(w * DISMISS_THRESHOLD)) ||
      (side === 'right'  && dx >  w * DISMISS_THRESHOLD)   ||
      (side === 'top'    && dy < -(h * DISMISS_THRESHOLD))  ||
      (side === 'bottom' && dy >  h * DISMISS_THRESHOLD);

    if (shouldClose) {
      close();
    } else {
      snapBack();
    }
  };

  const handlePointerCancel = () => {
    if (!draggable || !dragState.current) return;
    dragState.current = null;
    snapBack();
  };

  // ── Styles ────────────────────────────────────────────────────────────────

  const labelledBy = ariaLabelledBy ?? (hasTitle ? titleId : undefined);
  const describedBy = hasDescription ? descriptionId : undefined;

  const overlayStyles: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 9998,
    ...(unstyled ? {} : { backgroundColor: 'rgba(0, 0, 0, 0.5)' }),
  };

  const panelBaseStyles: React.CSSProperties = {
    position: 'fixed',
    zIndex: 9999,
    overflowY: 'auto',
    transition: 'transform 0.3s ease',
    // Prevent browser native panning in the drag axis
    touchAction:
      draggable
        ? (side === 'left' || side === 'right')
          ? 'pan-y'    // allow vertical scroll, block horizontal drag
          : 'pan-x'    // allow horizontal scroll, block vertical drag
        : 'auto',
  };

  const sideStyles: Record<DrawerSide, React.CSSProperties> = {
    left: {
      top: 0, left: 0, bottom: 0,
      width: 'var(--compa11y-drawer-width, 400px)',
    },
    right: {
      top: 0, right: 0, bottom: 0,
      width: 'var(--compa11y-drawer-width, 400px)',
    },
    top: {
      top: 0, left: 0, right: 0,
      height: 'var(--compa11y-drawer-height, 400px)',
    },
    bottom: {
      bottom: 0, left: 0, right: 0,
      height: 'var(--compa11y-drawer-height, 400px)',
    },
  };

  const panelVisualStyles: React.CSSProperties = unstyled
    ? {}
    : {
        backgroundColor: 'white',
        padding: '1.5rem',
        boxShadow:
          side === 'left'
            ? '4px 0 25px rgba(0, 0, 0, 0.15)'
            : side === 'right'
              ? '-4px 0 25px rgba(0, 0, 0, 0.15)'
              : side === 'top'
                ? '0 4px 25px rgba(0, 0, 0, 0.15)'
                : '0 -4px 25px rgba(0, 0, 0, 0.15)',
      };

  const panelStyles: React.CSSProperties = {
    ...panelBaseStyles,
    ...sideStyles[side],
    ...panelVisualStyles,
  };

  return (
    <>
      {/* Backdrop */}
      <div
        style={overlayStyles}
        onClick={handleOverlayClick}
        data-compa11y-drawer-overlay
        aria-hidden="true"
      />
      {/* Drawer panel */}
      <div
        ref={trapRef}
        id={drawerId}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        style={panelStyles}
        className={className}
        data-compa11y-drawer
        data-side={side}
        data-draggable={draggable || undefined}
        onPointerDown={draggable ? handlePointerDown : undefined}
        onPointerMove={draggable ? handlePointerMove : undefined}
        onPointerUp={draggable ? handlePointerUp : undefined}
        onPointerCancel={draggable ? handlePointerCancel : undefined}
      >
        {children}
      </div>
    </>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

export interface DrawerTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const DrawerTrigger = forwardRef<HTMLButtonElement, DrawerTriggerProps>(
  function DrawerTrigger({ children, onClick, ...props }, ref) {
    const { isOpen, openDrawer } = useDrawerContext();

    // When the drawer is open, this trigger was rendered inside the portal
    // as part of {children} — hide it so it doesn't appear in the panel.
    if (isOpen) return null;

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented) {
        openDrawer();
      }
    };

    return (
      <button
        ref={ref}
        type="button"
        tabIndex={0}
        data-compa11y-drawer-trigger
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    );
  }
);

export interface DrawerTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  children: React.ReactNode;
}

export const DrawerTitle = forwardRef<HTMLHeadingElement, DrawerTitleProps>(
  function DrawerTitle({ as: Component = 'h2', children, ...props }, ref) {
    const { titleId, setHasTitle } = useDrawerContext();

    useEffect(() => {
      setHasTitle(true);
      return () => setHasTitle(false);
    }, [setHasTitle]);

    return (
      <Component ref={ref} id={titleId} data-compa11y-drawer-title {...props}>
        {children}
      </Component>
    );
  }
);

export interface DrawerDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export const DrawerDescription = forwardRef<
  HTMLParagraphElement,
  DrawerDescriptionProps
>(function DrawerDescription({ children, ...props }, ref) {
  const { descriptionId, setHasDescription } = useDrawerContext();

  useEffect(() => {
    setHasDescription(true);
    return () => setHasDescription(false);
  }, [setHasDescription]);

  return (
    <p
      ref={ref}
      id={descriptionId}
      data-compa11y-drawer-description
      {...props}
    >
      {children}
    </p>
  );
});

export interface DrawerCloseProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

export const DrawerClose = forwardRef<HTMLButtonElement, DrawerCloseProps>(
  function DrawerClose({ children, onClick, ...props }, ref) {
    const { close } = useDrawerContext();

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented) {
        close();
      }
    };

    return (
      <button
        ref={ref}
        type="button"
        tabIndex={0}
        onClick={handleClick}
        aria-label={children ? undefined : 'Close drawer'}
        data-compa11y-drawer-close
        {...props}
      >
        {children ?? '×'}
      </button>
    );
  }
);

export interface DrawerContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const DrawerContent = forwardRef<HTMLDivElement, DrawerContentProps>(
  function DrawerContent({ children, ...props }, ref) {
    return (
      <div ref={ref} data-compa11y-drawer-content {...props}>
        {children}
      </div>
    );
  }
);

export interface DrawerActionsProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const DrawerActions = forwardRef<HTMLDivElement, DrawerActionsProps>(
  function DrawerActions({ children, ...props }, ref) {
    return (
      <div ref={ref} data-compa11y-drawer-actions {...props}>
        {children}
      </div>
    );
  }
);

export interface DrawerHandleProps
  extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Visual drag handle bar.
 *
 * When the parent `<Drawer draggable>` is set, this element becomes the
 * drag target — dragging it past 40% of the panel's dimension dismisses
 * the drawer; releasing earlier snaps it back. Without `draggable`, it
 * is purely decorative and hidden from assistive technology.
 */
export const DrawerHandle = forwardRef<HTMLDivElement, DrawerHandleProps>(
  function DrawerHandle({ style, ...props }, ref) {
    const handleStyles: React.CSSProperties = {
      width: '48px',
      height: '4px',
      borderRadius: '2px',
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      margin: '0 auto 1rem',
      cursor: 'grab',
      touchAction: 'none',
      ...style,
    };

    return (
      <div
        ref={ref}
        aria-hidden="true"
        data-compa11y-drawer-handle
        style={handleStyles}
        {...props}
      />
    );
  }
);

export const DrawerCompound = Object.assign(Drawer, {
  Trigger: DrawerTrigger,
  Title: DrawerTitle,
  Description: DrawerDescription,
  Close: DrawerClose,
  Content: DrawerContent,
  Actions: DrawerActions,
  Handle: DrawerHandle,
});
