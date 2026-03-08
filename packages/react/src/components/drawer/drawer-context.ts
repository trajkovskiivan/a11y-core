import { createContext, useContext } from 'react';

export interface DrawerContextValue {
  /** Whether the drawer is open */
  isOpen: boolean;
  /** Open the drawer */
  openDrawer: () => void;
  /** Close the drawer */
  close: () => void;
  /** ID for the drawer element */
  drawerId: string;
  /** ID for the title element */
  titleId: string;
  /** ID for the description element */
  descriptionId: string;
  /** Side the drawer slides in from */
  side: 'left' | 'right' | 'top' | 'bottom';
  /** Whether the drawer has a visible title */
  hasTitle: boolean;
  /** Whether the drawer has a visible description */
  hasDescription: boolean;
  /** Set whether title is rendered */
  setHasTitle: (value: boolean) => void;
  /** Set whether description is rendered */
  setHasDescription: (value: boolean) => void;
}

const DrawerContext = createContext<DrawerContextValue | null>(null);

export function useDrawerContext(): DrawerContextValue {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error(
      'Drawer compound components must be used within a Drawer component'
    );
  }
  return context;
}

export const DrawerProvider = DrawerContext.Provider;
