import React, { forwardRef, useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useId } from '../../hooks/use-id';
import { useFocusTrap } from '../../hooks/use-focus-trap';
import { useAnnouncer } from '../../hooks/use-announcer';
import { DialogProvider, useDialogContext } from './dialog-context';
import { createComponentWarnings } from '@compa11y/core';

const warnings = createComponentWarnings('Dialog');

export interface DialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Called when the dialog should close */
  onOpenChange: (open: boolean) => void;
  /** The dialog content */
  children: React.ReactNode;
  /** Custom class name */
  className?: string;
  /** Element to focus when dialog opens */
  initialFocus?: React.RefObject<HTMLElement>;
  /** Whether clicking outside closes the dialog */
  closeOnOutsideClick?: boolean;
  /** Whether pressing Escape closes the dialog */
  closeOnEscape?: boolean;
  /** Portal container (defaults to document.body) */
  container?: HTMLElement;
  /** Accessible label (required if no DialogTitle) */
  'aria-label'?: string;
  /** ID of element that labels the dialog */
  'aria-labelledby'?: string;
  /** Remove default styles to allow full customization via className */
  unstyled?: boolean;
}

export function Dialog({
  open,
  onOpenChange,
  children,
  className,
  initialFocus,
  closeOnOutsideClick = true,
  closeOnEscape = true,
  container,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  unstyled = false,
}: DialogProps) {
  const dialogId = useId('dialog');
  const titleId = useId('dialog-title');
  const descriptionId = useId('dialog-desc');

  const [hasTitle, setHasTitle] = useState(false);
  const [hasDescription, setHasDescription] = useState(false);

  const close = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  // Warn if no accessible label
  useEffect(() => {
    if (open && !hasTitle && !ariaLabel && !ariaLabelledBy) {
      warnings.warning(
        'Dialog has no accessible title. Add a DialogTitle or aria-label prop.',
        'Use <Dialog.Title> or provide aria-label="..."'
      );
    }
  }, [open, hasTitle, ariaLabel, ariaLabelledBy]);

  const contextValue = {
    isOpen: open,
    close,
    dialogId,
    titleId,
    descriptionId,
    hasTitle,
    hasDescription,
    setHasTitle,
    setHasDescription,
  };

  if (!open) {
    return null;
  }

  const dialogContent = (
    <DialogProvider value={contextValue}>
      <DialogOverlay
        className={className}
        closeOnOutsideClick={closeOnOutsideClick}
        closeOnEscape={closeOnEscape}
        initialFocus={initialFocus}
        ariaLabel={ariaLabel}
        ariaLabelledBy={ariaLabelledBy}
        unstyled={unstyled}
      >
        {children}
      </DialogOverlay>
    </DialogProvider>
  );

  const portalContainer = container ?? document.body;
  return createPortal(dialogContent, portalContainer);
}

interface DialogOverlayProps {
  children: React.ReactNode;
  className?: string;
  closeOnOutsideClick: boolean;
  closeOnEscape: boolean;
  initialFocus?: React.RefObject<HTMLElement>;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  unstyled: boolean;
}

function DialogOverlay({
  children,
  className,
  closeOnOutsideClick,
  closeOnEscape,
  initialFocus,
  ariaLabel,
  ariaLabelledBy,
  unstyled,
}: DialogOverlayProps) {
  const { close, dialogId, titleId, descriptionId, hasTitle, hasDescription } =
    useDialogContext();
  const { announce } = useAnnouncer();

  const trapRef = useFocusTrap<HTMLDivElement>({
    active: true,
    initialFocus: initialFocus?.current ?? undefined,
    escapeDeactivates: closeOnEscape,
    // Don't use clickOutsideDeactivates - we handle this in handleOverlayClick
    clickOutsideDeactivates: false,
    onDeactivate: close,
  });

  useEffect(() => {
    announce('Dialog opened', { politeness: 'polite' });
    return () => {
      announce('Dialog closed', { politeness: 'polite' });
    };
  }, [announce]);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (closeOnOutsideClick && event.target === event.currentTarget) {
      close();
    }
  };

  const labelledBy = ariaLabelledBy ?? (hasTitle ? titleId : undefined);
  const describedBy = hasDescription ? descriptionId : undefined;

  const handleDialogClick = (event: React.MouseEvent) => {
    // Prevent clicks inside dialog from bubbling to overlay
    event.stopPropagation();
  };

  const overlayStructuralStyles: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  };

  // Visual styles - only applied when not unstyled
  const overlayVisualStyles: React.CSSProperties = unstyled
    ? {}
    : {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      };

  const overlayStyles: React.CSSProperties = {
    ...overlayStructuralStyles,
    ...overlayVisualStyles,
  };

  // Visual styles for dialog panel - only applied when not unstyled
  const dialogStyles: React.CSSProperties = unstyled
    ? {}
    : {
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '1.5rem',
        minWidth: '300px',
        maxWidth: '500px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
      };

  return (
    <div
      className={className}
      style={overlayStyles}
      onClick={handleOverlayClick}
      data-compa11y-dialog-overlay
    >
      <div
        ref={trapRef}
        id={dialogId}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        onClick={handleDialogClick}
        style={dialogStyles}
        data-compa11y-dialog
      >
        {children}
      </div>
    </div>
  );
}

export interface DialogTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const DialogTrigger = forwardRef<HTMLButtonElement, DialogTriggerProps>(
  function DialogTrigger({ children, ...props }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        // Safari fix: Ensure button is in tab order (Safari skips buttons by default)
        tabIndex={0}
        data-compa11y-dialog-trigger
        {...props}
      >
        {children}
      </button>
    );
  }
);

export interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  children: React.ReactNode;
}

export const DialogTitle = forwardRef<HTMLHeadingElement, DialogTitleProps>(
  function DialogTitle({ as: Component = 'h2', children, ...props }, ref) {
    const { titleId, setHasTitle } = useDialogContext();

    useEffect(() => {
      setHasTitle(true);
      return () => setHasTitle(false);
    }, [setHasTitle]);

    return (
      <Component ref={ref} id={titleId} data-compa11y-dialog-title {...props}>
        {children}
      </Component>
    );
  }
);

export interface DialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export const DialogDescription = forwardRef<
  HTMLParagraphElement,
  DialogDescriptionProps
>(function DialogDescription({ children, ...props }, ref) {
  const { descriptionId, setHasDescription } = useDialogContext();

  useEffect(() => {
    setHasDescription(true);
    return () => setHasDescription(false);
  }, [setHasDescription]);

  return (
    <p ref={ref} id={descriptionId} data-compa11y-dialog-description {...props}>
      {children}
    </p>
  );
});

export interface DialogCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

export const DialogClose = forwardRef<HTMLButtonElement, DialogCloseProps>(
  function DialogClose({ children, onClick, ...props }, ref) {
    const { close } = useDialogContext();

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
        // Safari fix: Ensure button is in tab order (Safari skips buttons by default)
        tabIndex={0}
        onClick={handleClick}
        aria-label={children ? undefined : 'Close dialog'}
        data-compa11y-dialog-close
        {...props}
      >
        {children ?? '×'}
      </button>
    );
  }
);

export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
  function DialogContent({ children, ...props }, ref) {
    return (
      <div ref={ref} data-compa11y-dialog-content {...props}>
        {children}
      </div>
    );
  }
);

export interface DialogActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const DialogActions = forwardRef<HTMLDivElement, DialogActionsProps>(
  function DialogActions({ children, ...props }, ref) {
    return (
      <div ref={ref} data-compa11y-dialog-actions {...props}>
        {children}
      </div>
    );
  }
);

export const DialogCompound = Object.assign(Dialog, {
  Trigger: DialogTrigger,
  Title: DialogTitle,
  Description: DialogDescription,
  Close: DialogClose,
  Content: DialogContent,
  Actions: DialogActions,
});
