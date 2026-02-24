import React, {
  forwardRef,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from 'react';
import { useId } from '../../hooks/use-id';
import { useAnnouncer } from '../../hooks/use-announcer';
import { createComponentWarnings } from '@compa11y/core';
import {
  AccordionProvider,
  AccordionItemProvider,
  useAccordionContext,
  useAccordionItemContext,
  type AccordionContextValue,
  type AccordionItemContextValue,
} from './accordion-context';

const warn = createComponentWarnings('Accordion');

// ============================================================================
// Root
// ============================================================================

export interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Whether one or multiple items can be open at once.
   * @default 'single'
   */
  type?: 'single' | 'multiple';
  /**
   * Whether the open item can be collapsed when clicked again (single mode only).
   * @default false
   */
  collapsible?: boolean;
  /**
   * Controlled open item(s). String for single mode, string[] for multiple mode.
   */
  value?: string | string[];
  /**
   * Default open item(s) for uncontrolled usage.
   */
  defaultValue?: string | string[];
  /**
   * Called when the open item(s) change. Receives a string in single mode,
   * string[] in multiple mode.
   */
  onValueChange?: (value: string | string[]) => void;
  /**
   * Heading level used by Accordion.Header (h2–h6).
   * @default 3
   */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
}

/**
 * Accessible accordion component. Expand/collapse sections of content.
 *
 * @example
 * ```tsx
 * <Accordion defaultValue="item-1" headingLevel={3}>
 *   <Accordion.Item value="item-1">
 *     <Accordion.Header>
 *       <Accordion.Trigger>Section 1</Accordion.Trigger>
 *     </Accordion.Header>
 *     <Accordion.Content>Content 1</Accordion.Content>
 *   </Accordion.Item>
 * </Accordion>
 * ```
 *
 * Keyboard: Arrow Up/Down to move between headers, Home/End for first/last,
 * Enter/Space to toggle. Disabled items are skipped by keyboard navigation.
 */
export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
  function Accordion(
    {
      type = 'single',
      collapsible = false,
      value: controlledValue,
      defaultValue,
      onValueChange,
      headingLevel = 3,
      children,
      onKeyDown,
      ...props
    },
    ref
  ) {
    const baseId = useId('accordion');

    const normalizedDefault = useMemo<string[]>(() => {
      if (!defaultValue) return [];
      return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [uncontrolledItems, setUncontrolledItems] =
      useState<string[]>(normalizedDefault);

    const openItems = useMemo<string[]>(() => {
      if (controlledValue === undefined) return uncontrolledItems;
      if (Array.isArray(controlledValue)) return controlledValue;
      return controlledValue ? [controlledValue] : [];
    }, [controlledValue, uncontrolledItems]);

    const toggleItem = useCallback(
      (value: string) => {
        const wasOpen = openItems.includes(value);

        // Determine which panels will close as a result of this action.
        // We need this BEFORE updating state so we can check focus synchronously.
        let closingValues: string[] = [];
        if (type === 'single') {
          if (wasOpen && collapsible) {
            closingValues = [value];
          } else if (!wasOpen) {
            // All currently open items will close
            closingValues = [...openItems];
          }
        } else {
          if (wasOpen) {
            closingValues = [value];
          }
        }

        // Check whether focus is currently inside any panel that will close.
        // If so, return focus to that panel's trigger after the update.
        const activeEl = document.activeElement;
        const triggerToFocusValue = closingValues.find((closingValue) => {
          const contentEl = document.getElementById(
            `${baseId}-content-${closingValue}`
          );
          return contentEl && contentEl.contains(activeEl);
        });

        // Compute new open items
        let newItems: string[];
        if (type === 'single') {
          if (wasOpen) {
            newItems = collapsible ? [] : [value];
          } else {
            newItems = [value];
          }
        } else {
          newItems = wasOpen
            ? openItems.filter((v) => v !== value)
            : [...openItems, value];
        }

        if (controlledValue === undefined) {
          setUncontrolledItems(newItems);
        }

        const changeValue: string | string[] =
          type === 'single' ? (newItems[0] ?? '') : newItems;
        onValueChange?.(changeValue);

        // Restore focus to the trigger after React has re-rendered and the
        // panel content is removed from the DOM / made hidden.
        if (triggerToFocusValue) {
          requestAnimationFrame(() => {
            const trigger = document.getElementById(
              `${baseId}-trigger-${triggerToFocusValue}`
            );
            trigger?.focus();
          });
        }
      },
      [openItems, type, collapsible, controlledValue, onValueChange, baseId]
    );

    // Arrow key navigation between accordion triggers
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        onKeyDown?.(e);
        const target = e.target as HTMLElement;
        if (!target.hasAttribute('data-compa11y-accordion-trigger')) return;

        const root = e.currentTarget;
        const triggers = Array.from(
          root.querySelectorAll<HTMLButtonElement>(
            '[data-compa11y-accordion-trigger]:not([disabled])'
          )
        );

        const currentIndex = triggers.indexOf(target as HTMLButtonElement);
        if (currentIndex === -1) return;

        let newIndex: number | null = null;

        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            newIndex = (currentIndex + 1) % triggers.length;
            break;
          case 'ArrowUp':
            e.preventDefault();
            newIndex =
              (currentIndex - 1 + triggers.length) % triggers.length;
            break;
          case 'Home':
            e.preventDefault();
            newIndex = 0;
            break;
          case 'End':
            e.preventDefault();
            newIndex = triggers.length - 1;
            break;
        }

        if (newIndex !== null) {
          triggers[newIndex]?.focus();
        }
      },
      [onKeyDown]
    );

    const contextValue: AccordionContextValue = {
      openItems,
      toggleItem,
      type,
      collapsible,
      baseId,
      headingLevel,
    };

    return (
      <AccordionProvider value={contextValue}>
        <div
          ref={ref}
          data-compa11y-accordion
          data-type={type}
          onKeyDown={handleKeyDown}
          {...props}
        >
          {children}
        </div>
      </AccordionProvider>
    );
  }
);

// ============================================================================
// Item
// ============================================================================

export interface AccordionItemProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Unique value identifying this item */
  value: string;
  /** Whether this item is disabled */
  disabled?: boolean;
  children: React.ReactNode;
}

/**
 * A single accordion item. Must be a direct child of Accordion.
 * Contains Accordion.Header (with Accordion.Trigger inside) and Accordion.Content.
 */
export const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(
  function AccordionItem(
    { value, disabled = false, children, ...props },
    ref
  ) {
    const { baseId, openItems } = useAccordionContext();
    const isOpen = openItems.includes(value);
    const triggerId = `${baseId}-trigger-${value}`;
    const contentId = `${baseId}-content-${value}`;

    const itemContextValue: AccordionItemContextValue = {
      value,
      isOpen,
      isDisabled: disabled,
      triggerId,
      contentId,
    };

    return (
      <AccordionItemProvider value={itemContextValue}>
        <div
          ref={ref}
          data-compa11y-accordion-item
          data-open={isOpen}
          data-disabled={disabled}
          {...props}
        >
          {children}
        </div>
      </AccordionItemProvider>
    );
  }
);

// ============================================================================
// Header
// ============================================================================

export interface AccordionHeaderProps
  extends React.HTMLAttributes<HTMLHeadingElement> {
  /**
   * Override the heading level for this specific header (h2–h6).
   * Defaults to the `headingLevel` set on the parent `<Accordion>`.
   */
  level?: 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
}

/**
 * Semantic heading wrapper for an accordion trigger.
 * Renders an `<h{level}>` element so the trigger button is correctly nested
 * inside a heading — fulfilling WCAG 1.3.1 and the ARIA authoring practices.
 *
 * Must be used inside Accordion.Item.
 *
 * @example
 * ```tsx
 * <Accordion.Header>
 *   <Accordion.Trigger>Section Title</Accordion.Trigger>
 * </Accordion.Header>
 * ```
 */
export const AccordionHeader = forwardRef<
  HTMLHeadingElement,
  AccordionHeaderProps
>(function AccordionHeader({ level, children, style, ...props }, ref) {
  const { headingLevel } = useAccordionContext();
  const effectiveLevel = level ?? headingLevel;
  const Tag = `h${effectiveLevel}` as 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

  return (
    <Tag
      ref={ref}
      data-compa11y-accordion-header
      // Reset default heading margin so it doesn't break layout.
      // Consumers can override via CSS targeting [data-compa11y-accordion-header].
      style={{ margin: 0, ...style }}
      {...props}
    >
      {children}
    </Tag>
  );
});

// ============================================================================
// Trigger
// ============================================================================

export interface AccordionTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

/**
 * The button that toggles an accordion item's panel.
 * Must be used inside Accordion.Header (which must be inside Accordion.Item).
 *
 * All ARIA wiring (aria-expanded, aria-controls, id) is applied automatically.
 * Provide visible label text — no aria-label needed for typical usage.
 */
export const AccordionTrigger = forwardRef<
  HTMLButtonElement,
  AccordionTriggerProps
>(function AccordionTrigger({ children, onClick, ...props }, ref) {
  const { toggleItem } = useAccordionContext();
  const { value, isOpen, isDisabled, triggerId, contentId } =
    useAccordionItemContext();
  const { announce } = useAnnouncer();

  // Dev-time check: warn if this trigger has no accessible name.
  useEffect(() => {
    const el = document.getElementById(triggerId);
    if (el) {
      warn.checks.accessibleLabel(el, 'Accordion.Trigger');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerId]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || isDisabled) return;
    toggleItem(value);
    announce(isOpen ? 'Collapsed' : 'Expanded');
  };

  return (
    <button
      ref={ref}
      id={triggerId}
      type="button"
      aria-expanded={isOpen}
      aria-controls={contentId}
      disabled={isDisabled}
      onClick={handleClick}
      data-compa11y-accordion-trigger
      data-open={isOpen}
      data-disabled={isDisabled}
      {...props}
    >
      {children}
    </button>
  );
});

// ============================================================================
// Content
// ============================================================================

export interface AccordionContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Keep content mounted in the DOM even when closed */
  forceMount?: boolean;
  children: React.ReactNode;
}

/**
 * The collapsible content panel for an accordion item.
 * Must be used inside Accordion.Item.
 *
 * When closed, the panel is hidden from visual users, keyboard users, and
 * assistive technologies via the HTML `hidden` attribute.
 * Use `forceMount` to keep the DOM node alive (e.g., for CSS transitions).
 */
export const AccordionContent = forwardRef<
  HTMLDivElement,
  AccordionContentProps
>(function AccordionContent(
  { children, forceMount = false, ...props },
  ref
) {
  const { isOpen, contentId, triggerId } = useAccordionItemContext();

  if (!isOpen && !forceMount) {
    return null;
  }

  return (
    <div
      ref={ref}
      id={contentId}
      role="region"
      aria-labelledby={triggerId}
      hidden={!isOpen}
      data-compa11y-accordion-content
      data-open={isOpen}
      {...props}
    >
      {children}
    </div>
  );
});

// ============================================================================
// Compound Export
// ============================================================================

export const AccordionCompound = Object.assign(Accordion, {
  Item: AccordionItem,
  Header: AccordionHeader,
  Trigger: AccordionTrigger,
  Content: AccordionContent,
});
