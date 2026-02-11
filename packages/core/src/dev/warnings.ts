/**
 * Developer Warnings System
 *
 * Provides development-time feedback for accessibility issues
 */

import type { DevWarning, DevWarningHandler } from '../types';
import { hasAccessibleName } from '../aria/aria-utils';

// Global warning handler
let warningHandler: DevWarningHandler | null = null;

// Track issued warnings to avoid duplicates
const issuedWarnings = new Set<string>();

// Check if we're in development mode
function isDev(): boolean {
  return (
    typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production'
  );
}

/**
 * Set a custom warning handler
 */
export function setWarningHandler(handler: DevWarningHandler | null): void {
  warningHandler = handler;
}

/**
 * Create a warning key for deduplication
 */
function createWarningKey(warning: DevWarning): string {
  return `${warning.component}:${warning.message}`;
}

/**
 * Issue a development warning
 */
export function warn(warning: DevWarning): void {
  if (!isDev()) return;

  const key = createWarningKey(warning);
  if (issuedWarnings.has(key)) return;
  issuedWarnings.add(key);

  if (warningHandler) {
    warningHandler(warning);
    return;
  }

  const prefix = `[compa11y/${warning.component}]`;
  const style = getConsoleStyle(warning.type);

  const message = warning.suggestion
    ? `${warning.message}\n\n💡 Suggestion: ${warning.suggestion}`
    : warning.message;

  switch (warning.type) {
    case 'error':
      console.error(`%c${prefix}%c ${message}`, style, '');
      break;
    case 'warning':
      console.warn(`%c${prefix}%c ${message}`, style, '');
      break;
    case 'info':
      console.info(`%c${prefix}%c ${message}`, style, '');
      break;
  }

  if (warning.element) {
    console.log('Element:', warning.element);
  }
}

/**
 * Get console style for warning type
 */
function getConsoleStyle(type: DevWarning['type']): string {
  switch (type) {
    case 'error':
      return 'background: #ff5555; color: white; padding: 2px 4px; border-radius: 2px; font-weight: bold;';
    case 'warning':
      return 'background: #ffaa00; color: black; padding: 2px 4px; border-radius: 2px; font-weight: bold;';
    case 'info':
      return 'background: #5555ff; color: white; padding: 2px 4px; border-radius: 2px; font-weight: bold;';
  }
}

/**
 * Clear issued warnings (useful for testing)
 */
export function clearWarnings(): void {
  issuedWarnings.clear();
}

/**
 * Pre-built warning checks
 */
export const checks = {
  /**
   * Check for missing accessible label
   */
  accessibleLabel(
    element: HTMLElement | null,
    component: string,
    propName = 'aria-label'
  ): void {
    if (!element) return;

    if (!hasAccessibleName(element)) {
      warn({
        type: 'error',
        component,
        message: `Missing accessible label. Screen reader users will not be able to understand this element.`,
        suggestion: `Add ${propName}, aria-labelledby, or visible text content.`,
        element,
      });
    }
  },

  /**
   * Check for missing required prop
   */
  requiredProp(value: unknown, propName: string, component: string): void {
    if (value === undefined || value === null || value === '') {
      warn({
        type: 'error',
        component,
        message: `Missing required prop "${propName}".`,
        suggestion: `Provide a value for the "${propName}" prop.`,
      });
    }
  },

  /**
   * Check for invalid ARIA role
   */
  validRole(
    role: string | undefined,
    component: string,
    element?: HTMLElement
  ): void {
    if (!role) return;

    const validRoles = new Set([
      'alert',
      'alertdialog',
      'application',
      'article',
      'banner',
      'button',
      'cell',
      'checkbox',
      'columnheader',
      'combobox',
      'complementary',
      'contentinfo',
      'definition',
      'dialog',
      'directory',
      'document',
      'feed',
      'figure',
      'form',
      'grid',
      'gridcell',
      'group',
      'heading',
      'img',
      'link',
      'list',
      'listbox',
      'listitem',
      'log',
      'main',
      'marquee',
      'math',
      'menu',
      'menubar',
      'menuitem',
      'menuitemcheckbox',
      'menuitemradio',
      'navigation',
      'none',
      'note',
      'option',
      'presentation',
      'progressbar',
      'radio',
      'radiogroup',
      'region',
      'row',
      'rowgroup',
      'rowheader',
      'scrollbar',
      'search',
      'searchbox',
      'separator',
      'slider',
      'spinbutton',
      'status',
      'switch',
      'tab',
      'table',
      'tablist',
      'tabpanel',
      'term',
      'textbox',
      'timer',
      'toolbar',
      'tooltip',
      'tree',
      'treegrid',
      'treeitem',
    ]);

    if (!validRoles.has(role)) {
      warn({
        type: 'warning',
        component,
        message: `Invalid ARIA role "${role}".`,
        suggestion: 'Use a valid ARIA role from the WAI-ARIA specification.',
        element,
      });
    }
  },

  /**
   * Check for interactive element without keyboard support
   */
  keyboardAccessible(
    element: HTMLElement | null,
    component: string,
    handlers: { onClick?: unknown; onKeyDown?: unknown }
  ): void {
    if (!element) return;

    if (handlers.onClick && !handlers.onKeyDown) {
      const tagName = element.tagName.toLowerCase();
      const role = element.getAttribute('role');

      // Native interactive elements are fine
      if (['button', 'a', 'input', 'select', 'textarea'].includes(tagName)) {
        return;
      }

      // Elements with interactive roles need keyboard handling
      const interactiveRoles = ['button', 'link', 'menuitem', 'option', 'tab'];
      if (role && interactiveRoles.includes(role)) {
        warn({
          type: 'warning',
          component,
          message: `Element has onClick but no onKeyDown handler.`,
          suggestion: 'Add keyboard event handling for Enter and Space keys.',
          element,
        });
      }
    }
  },

  /**
   * Check tabIndex usage
   */
  tabIndex(
    tabIndex: number | undefined,
    component: string,
    element?: HTMLElement
  ): void {
    if (tabIndex === undefined) return;

    if (tabIndex > 0) {
      warn({
        type: 'warning',
        component,
        message: `Positive tabIndex (${tabIndex}) disrupts natural tab order.`,
        suggestion:
          'Use tabIndex={0} or tabIndex={-1} instead. Rely on DOM order for tab sequence.',
        element,
      });
    }
  },

  /**
   * Check for autofocus in dialogs
   */
  dialogAutoFocus(hasAutoFocus: boolean, component: string): void {
    if (!hasAutoFocus) {
      warn({
        type: 'info',
        component,
        message: 'No initial focus element specified for dialog.',
        suggestion: 'Consider setting initialFocus to guide keyboard users.',
      });
    }
  },

  /**
   * Check for missing form labels
   */
  formLabel(
    inputElement: HTMLElement | null,
    labelId: string | undefined,
    component: string
  ): void {
    if (!inputElement) return;

    const hasLabel =
      labelId ||
      inputElement.getAttribute('aria-label') ||
      inputElement.getAttribute('aria-labelledby') ||
      (inputElement as HTMLInputElement).labels?.length;

    if (!hasLabel) {
      warn({
        type: 'error',
        component,
        message: 'Form input is missing an accessible label.',
        suggestion: 'Add a <label>, aria-label, or aria-labelledby.',
        element: inputElement,
      });
    }
  },

  /**
   * Check for missing alt text on images
   */
  imageAlt(element: HTMLElement | null, component: string): void {
    if (!element || element.tagName !== 'IMG') return;

    const alt = element.getAttribute('alt');
    const role = element.getAttribute('role');

    if (alt === null && role !== 'presentation' && role !== 'none') {
      warn({
        type: 'error',
        component,
        message: 'Image is missing alt attribute.',
        suggestion:
          'Add alt="" for decorative images or descriptive alt text for meaningful images.',
        element,
      });
    }
  },
};

/**
 * Create a component-scoped warning function
 */
export function createComponentWarnings(componentName: string) {
  return {
    error: (message: string, suggestion?: string, element?: Element) =>
      warn({
        type: 'error',
        component: componentName,
        message,
        suggestion,
        element,
      }),
    warning: (message: string, suggestion?: string, element?: Element) =>
      warn({
        type: 'warning',
        component: componentName,
        message,
        suggestion,
        element,
      }),
    info: (message: string, suggestion?: string, element?: Element) =>
      warn({
        type: 'info',
        component: componentName,
        message,
        suggestion,
        element,
      }),
    checks: {
      accessibleLabel: (element: HTMLElement | null, propName?: string) =>
        checks.accessibleLabel(element, componentName, propName),
      requiredProp: (value: unknown, propName: string) =>
        checks.requiredProp(value, propName, componentName),
      keyboardAccessible: (
        element: HTMLElement | null,
        handlers: { onClick?: unknown; onKeyDown?: unknown }
      ) => checks.keyboardAccessible(element, componentName, handlers),
      tabIndex: (tabIndex: number | undefined, element?: HTMLElement) =>
        checks.tabIndex(tabIndex, componentName, element),
    },
  };
}
