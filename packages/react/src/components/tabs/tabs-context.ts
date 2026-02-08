import { createContext, useContext } from 'react';

export interface TabsContextValue {
  /** Currently selected tab value */
  selectedValue: string;
  /** Change selected tab */
  setSelectedValue: (value: string) => void;
  /** Base ID for ARIA relationships */
  baseId: string;
  /** Orientation of tabs */
  orientation: 'horizontal' | 'vertical';
  /** Whether tabs are activated on focus or on click */
  activationMode: 'automatic' | 'manual';
  /** Register a tab */
  registerTab: (value: string) => void;
  /** Unregister a tab */
  unregisterTab: (value: string) => void;
  /** Get all tab values */
  getTabValues: () => string[];
}

const TabsContext = createContext<TabsContextValue | null>(null);

export function useTabsContext(): TabsContextValue {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error(
      'Tabs compound components must be used within a Tabs component'
    );
  }
  return context;
}

export const TabsProvider = TabsContext.Provider;
