import React, {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { announce, announceAssertive } from '@compa11y/core';
export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  type: ToastType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  updateToast: (id: string, toast: Partial<Omit<Toast, 'id'>>) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export interface ToastProviderProps {
  children: React.ReactNode;
  /** Default duration for toasts in ms */
  duration?: number;
  /** Maximum number of visible toasts */
  maxToasts?: number;
}

export function ToastProvider({
  children,
  duration = 5000,
  maxToasts = 5,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdCounter = useRef(0);

  const addToast = useCallback(
    (toast: Omit<Toast, 'id'>): string => {
      const id = `toast-${++toastIdCounter.current}`;
      const newToast: Toast = {
        ...toast,
        id,
        duration: toast.duration ?? duration,
      };

      setToasts((prev) => {
        const updated = [...prev, newToast];
        // Limit visible toasts
        return updated.slice(-maxToasts);
      });

      // Announce to screen readers
      const message = toast.title
        ? `${toast.title}. ${toast.description || ''}`
        : toast.description || '';

      if (toast.type === 'error') {
        announceAssertive(message);
      } else {
        announce(message, { politeness: 'polite' });
      }

      return id;
    },
    [duration, maxToasts]
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const updateToast = useCallback(
    (id: string, updates: Partial<Omit<Toast, 'id'>>) => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
      );
    },
    []
  );

  return (
    <ToastContext.Provider
      value={{ toasts, addToast, removeToast, updateToast }}
    >
      {children}
    </ToastContext.Provider>
  );
}

export interface ToastViewportProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Position of the toast container */
  position?:
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right';
  /** Label for screen readers */
  label?: string;
}

const positionStyles: Record<string, React.CSSProperties> = {
  'top-left': { top: 0, left: 0 },
  'top-center': { top: 0, left: '50%', transform: 'translateX(-50%)' },
  'top-right': { top: 0, right: 0 },
  'bottom-left': { bottom: 0, left: 0 },
  'bottom-center': { bottom: 0, left: '50%', transform: 'translateX(-50%)' },
  'bottom-right': { bottom: 0, right: 0 },
};

export const ToastViewport = forwardRef<HTMLDivElement, ToastViewportProps>(
  function ToastViewport(
    {
      position = 'bottom-right',
      label = 'Notifications',
      style,
      children,
      ...props
    },
    ref
  ) {
    const { toasts, removeToast } = useToast();

    const viewport = (
      <div
        ref={ref}
        role="region"
        aria-label={label}
        aria-live="polite"
        aria-relevant="additions removals"
        tabIndex={-1}
        style={{
          position: 'fixed',
          zIndex: 9999,
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          ...positionStyles[position],
          ...style,
        }}
        data-compa11y-toast-viewport
        data-position={position}
        {...props}
      >
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
        {children}
      </div>
    );

    return createPortal(viewport, document.body);
  }
);

interface ToastItemProps {
  toast: Toast;
  onClose: () => void;
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remainingRef = useRef(toast.duration || 5000);
  const startTimeRef = useRef(Date.now());

  const startTimer = useCallback(() => {
    if (toast.duration === 0) return; // Infinite duration

    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 200); // Allow exit animation
    }, remainingRef.current);
  }, [toast.duration, onClose]);

  const pauseTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      remainingRef.current -= Date.now() - startTimeRef.current;
    }
  }, []);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [startTimer]);

  const handleMouseEnter = () => {
    setIsPaused(true);
    pauseTimer();
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
    startTimer();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      role="alert"
      aria-atomic="true"
      tabIndex={0}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
      data-type={toast.type}
      data-visible={isVisible}
      data-compa11y-toast
    >
      {toast.title && <div data-compa11y-toast-title>{toast.title}</div>}
      {toast.description && (
        <div data-compa11y-toast-description>{toast.description}</div>
      )}
      {toast.action && (
        <button
          type="button"
          // Safari fix: Ensure button is in tab order
          tabIndex={0}
          onClick={() => {
            toast.action?.onClick();
            onClose();
          }}
          data-compa11y-toast-action
        >
          {toast.action.label}
        </button>
      )}
      <button
        type="button"
        // Safari fix: Ensure button is in tab order
        tabIndex={0}
        aria-label="Dismiss"
        onClick={onClose}
        data-compa11y-toast-close
      >
        ×
      </button>
    </div>
  );
}

/**
 * Hook for common toast patterns
 */
export function useToastHelpers() {
  const { addToast } = useToast();

  return {
    toast: addToast,
    success: (title: string, description?: string) =>
      addToast({ type: 'success', title, description }),
    error: (title: string, description?: string) =>
      addToast({ type: 'error', title, description }),
    warning: (title: string, description?: string) =>
      addToast({ type: 'warning', title, description }),
    info: (title: string, description?: string) =>
      addToast({ type: 'info', title, description }),
  };
}
