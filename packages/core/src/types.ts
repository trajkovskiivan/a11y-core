/**
 * Core types used across A11yKit
 */

export type AriaRole =
  | 'alert'
  | 'alertdialog'
  | 'application'
  | 'article'
  | 'banner'
  | 'button'
  | 'cell'
  | 'checkbox'
  | 'columnheader'
  | 'combobox'
  | 'complementary'
  | 'contentinfo'
  | 'definition'
  | 'dialog'
  | 'directory'
  | 'document'
  | 'feed'
  | 'figure'
  | 'form'
  | 'grid'
  | 'gridcell'
  | 'group'
  | 'heading'
  | 'img'
  | 'link'
  | 'list'
  | 'listbox'
  | 'listitem'
  | 'log'
  | 'main'
  | 'marquee'
  | 'math'
  | 'menu'
  | 'menubar'
  | 'menuitem'
  | 'menuitemcheckbox'
  | 'menuitemradio'
  | 'navigation'
  | 'none'
  | 'note'
  | 'option'
  | 'presentation'
  | 'progressbar'
  | 'radio'
  | 'radiogroup'
  | 'region'
  | 'row'
  | 'rowgroup'
  | 'rowheader'
  | 'scrollbar'
  | 'search'
  | 'searchbox'
  | 'separator'
  | 'slider'
  | 'spinbutton'
  | 'status'
  | 'switch'
  | 'tab'
  | 'table'
  | 'tablist'
  | 'tabpanel'
  | 'term'
  | 'textbox'
  | 'timer'
  | 'toolbar'
  | 'tooltip'
  | 'tree'
  | 'treegrid'
  | 'treeitem';

export type AriaLivePoliteness = 'off' | 'polite' | 'assertive';

export interface FocusableElement extends HTMLElement {
  focus(options?: FocusOptions): void;
}

export interface KeyboardNavigationOptions {
  /** Whether navigation wraps around at boundaries */
  wrap?: boolean;
  /** Orientation of the navigation */
  orientation?: 'horizontal' | 'vertical' | 'both';
  /** Whether to focus on hover */
  focusOnHover?: boolean;
  /** Custom key handlers */
  keyHandlers?: Record<string, (event: KeyboardEvent) => void>;
}

export interface FocusTrapOptions {
  /** Element to focus when trap activates */
  initialFocus?: HTMLElement | string | (() => HTMLElement | null);
  /** Element to focus when trap deactivates */
  returnFocus?: HTMLElement | boolean;
  /** Whether clicking outside deactivates the trap */
  clickOutsideDeactivates?: boolean;
  /** Whether pressing Escape deactivates the trap */
  escapeDeactivates?: boolean;
  /** Callback when trap is deactivated */
  onDeactivate?: () => void;
  /** Callback when focus escapes (for portals) */
  onEscapeFocus?: (element: Element) => void;
}

export interface AnnouncerOptions {
  /** Politeness level for the announcement */
  politeness?: AriaLivePoliteness;
  /** Delay before announcement in ms */
  delay?: number;
  /** Clear previous announcements */
  clearPrevious?: boolean;
  /** Timeout for announcement visibility */
  timeout?: number;
}

export interface DevWarning {
  type: 'error' | 'warning' | 'info';
  component: string;
  message: string;
  suggestion?: string;
  element?: Element;
}

export type DevWarningHandler = (warning: DevWarning) => void;
