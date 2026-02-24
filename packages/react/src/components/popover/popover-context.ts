import { createContext, useContext, RefObject } from 'react';

export interface PopoverContextValue {
  /** Whether the popover is open */
  isOpen: boolean;
  /** Toggle or set open state */
  onOpenChange: (open: boolean) => void;
  /** Stable IDs */
  triggerId: string;
  contentId: string;
  /** Ref to the trigger element (for positioning + focus return) */
  triggerRef: RefObject<HTMLElement | null>;
  /** Whether the popover trigger is disabled */
  disabled: boolean;
  /**
   * Called by Popover.Content to signal it is mounted in the DOM.
   * Trigger uses this to set aria-controls only when content exists.
   */
  setContentMounted: (mounted: boolean) => void;
  /** True when Popover.Content is mounted */
  contentMounted: boolean;
}

const PopoverContext = createContext<PopoverContextValue | null>(null);

export function usePopoverContext(): PopoverContextValue {
  const ctx = useContext(PopoverContext);
  if (!ctx) {
    throw new Error(
      'Popover sub-components must be used within a <Popover> component'
    );
  }
  return ctx;
}

export const PopoverProvider = PopoverContext.Provider;
