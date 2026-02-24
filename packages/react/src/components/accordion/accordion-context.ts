import { createContext, useContext } from 'react';

export interface AccordionContextValue {
  /** Currently open item values */
  openItems: string[];
  /** Toggle an item open/closed */
  toggleItem: (value: string) => void;
  /** Whether one or multiple items can be open */
  type: 'single' | 'multiple';
  /** Whether the open item can be collapsed in single mode */
  collapsible: boolean;
  /** Base ID for ARIA relationships */
  baseId: string;
  /** Heading level rendered by Accordion.Header (2–6) */
  headingLevel: 2 | 3 | 4 | 5 | 6;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

export function useAccordionContext(): AccordionContextValue {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error(
      'Accordion compound components must be used within an Accordion component'
    );
  }
  return context;
}

export const AccordionProvider = AccordionContext.Provider;

// ============================================================================
// Item Context
// ============================================================================

export interface AccordionItemContextValue {
  /** Value identifying this item */
  value: string;
  /** Whether the panel is currently open */
  isOpen: boolean;
  /** Whether the item is disabled */
  isDisabled: boolean;
  /** ID for the trigger button */
  triggerId: string;
  /** ID for the content panel */
  contentId: string;
}

const AccordionItemContext =
  createContext<AccordionItemContextValue | null>(null);

export function useAccordionItemContext(): AccordionItemContextValue {
  const context = useContext(AccordionItemContext);
  if (!context) {
    throw new Error(
      'Accordion.Trigger and Accordion.Content must be used within an Accordion.Item'
    );
  }
  return context;
}

export const AccordionItemProvider = AccordionItemContext.Provider;
