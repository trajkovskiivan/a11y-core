/**
 * Keyboard Navigation Manager
 *
 * Provides keyboard navigation patterns for common accessibility scenarios
 */

export type KeyboardHandler = (event: KeyboardEvent) => void | boolean;

export interface KeyboardHandlers {
  [key: string]: KeyboardHandler;
}

export interface KeyboardManagerOptions {
  /** Prevent default for handled keys */
  preventDefault?: boolean;
  /** Stop propagation for handled keys */
  stopPropagation?: boolean;
  /** Only handle when target matches selector */
  targetSelector?: string;
}

export interface KeyboardManager {
  /** Attach to an element */
  attach: (element: HTMLElement) => void;
  /** Detach from current element */
  detach: () => void;
  /** Add a key handler */
  on: (key: string, handler: KeyboardHandler) => void;
  /** Remove a key handler */
  off: (key: string) => void;
  /** Destroy the manager */
  destroy: () => void;
}

/**
 * Normalize key names for cross-browser compatibility
 */
export function normalizeKey(event: KeyboardEvent): string {
  const key = event.key;

  // Handle special cases
  switch (key) {
    case ' ':
      return 'Space';
    case 'Esc':
      return 'Escape';
    case 'Left':
      return 'ArrowLeft';
    case 'Right':
      return 'ArrowRight';
    case 'Up':
      return 'ArrowUp';
    case 'Down':
      return 'ArrowDown';
    default:
      return key;
  }
}

/**
 * Build a key combo string from an event
 */
export function getKeyCombo(event: KeyboardEvent): string {
  const parts: string[] = [];

  if (event.ctrlKey) parts.push('Ctrl');
  if (event.altKey) parts.push('Alt');
  if (event.shiftKey) parts.push('Shift');
  if (event.metaKey) parts.push('Meta');

  const key = normalizeKey(event);

  // Don't add modifier keys as the main key
  if (!['Control', 'Alt', 'Shift', 'Meta'].includes(key)) {
    parts.push(key);
  }

  return parts.join('+');
}

/**
 * Create a keyboard manager for handling key events
 */
export function createKeyboardManager(
  handlers: KeyboardHandlers = {},
  options: KeyboardManagerOptions = {}
): KeyboardManager {
  const {
    preventDefault = true,
    stopPropagation = true,
    targetSelector,
  } = options;

  const keyHandlers: Map<string, KeyboardHandler> = new Map(
    Object.entries(handlers)
  );

  let attachedElement: HTMLElement | null = null;

  function handleKeyDown(event: KeyboardEvent): void {
    // Check target selector
    if (targetSelector) {
      const target = event.target as HTMLElement;
      if (!target.matches(targetSelector)) {
        return;
      }
    }

    // Try key combo first (e.g., "Ctrl+A")
    const combo = getKeyCombo(event);
    let handler = keyHandlers.get(combo);

    // Fall back to simple key
    if (!handler) {
      const key = normalizeKey(event);
      handler = keyHandlers.get(key);
    }

    if (handler) {
      const result = handler(event);

      // If handler returns false explicitly, don't prevent/stop
      if (result !== false) {
        if (preventDefault) {
          event.preventDefault();
        }
        if (stopPropagation) {
          event.stopPropagation();
        }
      }
    }
  }

  function attach(element: HTMLElement): void {
    if (attachedElement) {
      detach();
    }
    attachedElement = element;
    element.addEventListener('keydown', handleKeyDown);
  }

  function detach(): void {
    if (attachedElement) {
      attachedElement.removeEventListener('keydown', handleKeyDown);
      attachedElement = null;
    }
  }

  function on(key: string, handler: KeyboardHandler): void {
    keyHandlers.set(key, handler);
  }

  function off(key: string): void {
    keyHandlers.delete(key);
  }

  function destroy(): void {
    detach();
    keyHandlers.clear();
  }

  return {
    attach,
    detach,
    on,
    off,
    destroy,
  };
}

/**
 * Common keyboard navigation patterns
 */
export const KeyboardPatterns = {
  /**
   * Menu/Listbox navigation
   */
  menu: (options: {
    onUp?: () => void;
    onDown?: () => void;
    onEnter?: () => void;
    onEscape?: () => void;
    onHome?: () => void;
    onEnd?: () => void;
    onTypeAhead?: (char: string) => void;
  }): KeyboardHandlers => ({
    ArrowUp: () => options.onUp?.(),
    ArrowDown: () => options.onDown?.(),
    Enter: () => options.onEnter?.(),
    Space: () => options.onEnter?.(),
    Escape: () => options.onEscape?.(),
    Home: () => options.onHome?.(),
    End: () => options.onEnd?.(),
  }),

  /**
   * Tab navigation (horizontal)
   */
  tabs: (options: {
    onLeft?: () => void;
    onRight?: () => void;
    onHome?: () => void;
    onEnd?: () => void;
  }): KeyboardHandlers => ({
    ArrowLeft: () => options.onLeft?.(),
    ArrowRight: () => options.onRight?.(),
    Home: () => options.onHome?.(),
    End: () => options.onEnd?.(),
  }),

  /**
   * Dialog navigation
   */
  dialog: (options: {
    onEscape?: () => void;
  }): KeyboardHandlers => ({
    Escape: () => options.onEscape?.(),
  }),

  /**
   * Grid navigation (2D)
   */
  grid: (options: {
    onUp?: () => void;
    onDown?: () => void;
    onLeft?: () => void;
    onRight?: () => void;
    onHome?: () => void;
    onEnd?: () => void;
    onCtrlHome?: () => void;
    onCtrlEnd?: () => void;
  }): KeyboardHandlers => ({
    ArrowUp: () => options.onUp?.(),
    ArrowDown: () => options.onDown?.(),
    ArrowLeft: () => options.onLeft?.(),
    ArrowRight: () => options.onRight?.(),
    Home: () => options.onHome?.(),
    End: () => options.onEnd?.(),
    'Ctrl+Home': () => options.onCtrlHome?.(),
    'Ctrl+End': () => options.onCtrlEnd?.(),
  }),
};

/**
 * Type-ahead search for menus and listboxes
 */
export interface TypeAhead {
  /** Handle a character input */
  type: (char: string) => string | null;
  /** Reset the search */
  reset: () => void;
  /** Get current search string */
  getSearch: () => string;
}

export function createTypeAhead(
  items: string[],
  options: { timeout?: number } = {}
): TypeAhead {
  const { timeout = 500 } = options;

  let search = '';
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  function reset(): void {
    search = '';
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  }

  function type(char: string): string | null {
    // Only accept single printable characters
    if (char.length !== 1 || char === ' ') {
      return null;
    }

    // Clear existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Add character to search
    search += char.toLowerCase();

    // Set new timeout
    timeoutId = setTimeout(reset, timeout);

    // Find matching item
    const match = items.find((item) =>
      item.toLowerCase().startsWith(search)
    );

    return match ?? null;
  }

  return {
    type,
    reset,
    getSearch: () => search,
  };
}
