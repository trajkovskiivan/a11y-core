import { createContext, useContext } from 'react';

export interface DialogContextValue {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Close the dialog */
  close: () => void;
  /** ID for the dialog element */
  dialogId: string;
  /** ID for the title element */
  titleId: string;
  /** ID for the description element */
  descriptionId: string;
  /** Whether the dialog has a visible title */
  hasTitle: boolean;
  /** Whether the dialog has a visible description */
  hasDescription: boolean;
  /** Set whether title is rendered */
  setHasTitle: (value: boolean) => void;
  /** Set whether description is rendered */
  setHasDescription: (value: boolean) => void;
}

const DialogContext = createContext<DialogContextValue | null>(null);

export function useDialogContext(): DialogContextValue {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error(
      'Dialog compound components must be used within a Dialog component'
    );
  }
  return context;
}

export const DialogProvider = DialogContext.Provider;
