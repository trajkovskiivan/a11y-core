import { createContext, useContext } from 'react';

export interface ActionMenuContextValue {
  /** Whether the menu is open */
  isOpen: boolean;
  /** Open the menu */
  open: () => void;
  /** Close the menu */
  close: () => void;
  /** Toggle the menu */
  toggle: () => void;
  /** Currently highlighted item index */
  highlightedIndex: number;
  /** Set highlighted item */
  setHighlightedIndex: (index: number) => void;
  /** ID for the menu element */
  menuId: string;
  /** ID for the trigger element */
  triggerId: string;
  /** Register a menu item */
  registerItem: (id: string) => number;
  /** Unregister a menu item */
  unregisterItem: (id: string) => void;
  /** Get item count */
  getItemCount: () => number;
  /** Select an item */
  selectItem: (index: number) => void;
  /** Whether default styles are disabled */
  unstyled: boolean;
}

const ActionMenuContext = createContext<ActionMenuContextValue | null>(null);

export function useActionMenuContext(): ActionMenuContextValue {
  const context = useContext(ActionMenuContext);
  if (!context) {
    throw new Error(
      'ActionMenu compound components must be used within an ActionMenu component'
    );
  }
  return context;
}

export const ActionMenuProvider = ActionMenuContext.Provider;
