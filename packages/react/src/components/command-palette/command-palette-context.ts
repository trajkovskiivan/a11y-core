import { createContext, useContext } from 'react';

export interface RegisteredItem {
  value: string;
  onSelect?: () => void;
  href?: string;
  disabled?: boolean;
  keywords?: string[];
}

export interface CommandPaletteContextValue {
  isOpen: boolean;
  close: () => void;
  open: () => void;
  modal: boolean;
  query: string;
  setQuery: (query: string) => void;
  highlightedValue: string | null;
  setHighlightedValue: (value: string | null) => void;
  loading: boolean;
  loop: boolean;
  dialogId: string;
  titleId: string;
  descriptionId: string;
  inputId: string;
  listboxId: string;
  hasTitle: boolean;
  hasDescription: boolean;
  setHasTitle: (value: boolean) => void;
  setHasDescription: (value: boolean) => void;
  getOptionId: (value: string) => string;
  /** Ordered list of currently visible (non-disabled) item values */
  visibleItems: string[];
  registerItem: (item: RegisteredItem) => void;
  unregisterItem: (value: string) => void;
  getItem: (value: string) => RegisteredItem | undefined;
  executeItem: (value: string) => void;
  highlightNext: () => void;
  highlightPrev: () => void;
  highlightFirst: () => void;
  highlightLast: () => void;
  filter: ((query: string, value: string, keywords?: string[]) => boolean) | null;
}

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(null);

export function useCommandPaletteContext(componentName = 'this sub-component'): CommandPaletteContextValue {
  const context = useContext(CommandPaletteContext);
  if (!context) {
    throw new Error(`${componentName} must be used inside <CommandPalette>`);
  }
  return context;
}

export const CommandPaletteProvider = CommandPaletteContext.Provider;
