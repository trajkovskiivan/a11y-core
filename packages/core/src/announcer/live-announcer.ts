/**
 * Live Announcer
 *
 * Provides screen reader announcements via ARIA live regions
 */

import type { AriaLivePoliteness, AnnouncerOptions } from '../types';
import { isBrowser } from '../utils/platform';

interface LiveRegion {
  element: HTMLElement;
  politeness: AriaLivePoliteness;
}

// Singleton regions
let politeRegion: LiveRegion | null = null;
let assertiveRegion: LiveRegion | null = null;
let isInitialized = false;

// Message queue for debouncing
let messageQueue: Array<{
  message: string;
  options: AnnouncerOptions;
}> = [];
let queueTimeout: ReturnType<typeof setTimeout> | null = null;

/**
 * Create the visually hidden styles for live regions
 */
function getHiddenStyles(): Partial<CSSStyleDeclaration> {
  return {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: '0',
  };
}

/**
 * Create a live region element
 */
function createLiveRegion(politeness: AriaLivePoliteness): LiveRegion {
  const element = document.createElement('div');

  // Set ARIA attributes
  element.setAttribute('role', 'status');
  element.setAttribute('aria-live', politeness);
  element.setAttribute('aria-atomic', 'true');
  element.setAttribute('aria-relevant', 'additions text');
  element.id = `a11ykit-announcer-${politeness}`;

  // Apply visually hidden styles
  const styles = getHiddenStyles();
  Object.assign(element.style, styles);

  // Add to DOM
  document.body.appendChild(element);

  return { element, politeness };
}

/**
 * Initialize the live announcer
 * Call this once at app startup
 */
export function initAnnouncer(): () => void {
  if (!isBrowser() || isInitialized) {
    return () => {};
  }

  isInitialized = true;

  // Create live regions
  politeRegion = createLiveRegion('polite');
  assertiveRegion = createLiveRegion('assertive');

  // Cleanup function
  return () => {
    if (politeRegion) {
      politeRegion.element.remove();
      politeRegion = null;
    }
    if (assertiveRegion) {
      assertiveRegion.element.remove();
      assertiveRegion = null;
    }
    if (queueTimeout) {
      clearTimeout(queueTimeout);
      queueTimeout = null;
    }
    messageQueue = [];
    isInitialized = false;
  };
}

/**
 * Get or create the announcer (auto-init if needed)
 */
function ensureAnnouncer(): void {
  if (!isInitialized && isBrowser()) {
    initAnnouncer();
  }
}

/**
 * Clear a live region's content
 */
function clearRegion(region: LiveRegion): void {
  region.element.textContent = '';
}

/**
 * Announce a message to screen readers
 */
export function announce(
  message: string,
  options: AnnouncerOptions = {}
): void {
  if (!isBrowser()) return;

  const {
    politeness = 'polite',
    delay = 0,
    clearPrevious = false,
    timeout = 7000,
  } = options;

  ensureAnnouncer();

  const region = politeness === 'assertive' ? assertiveRegion : politeRegion;
  if (!region) return;

  const doAnnounce = () => {
    if (clearPrevious) {
      clearRegion(region);
    }

    region.element.textContent = '';

    requestAnimationFrame(() => {
      region.element.textContent = message;

      // Auto-clear after timeout
      if (timeout > 0) {
        setTimeout(() => {
          if (region.element.textContent === message) {
            region.element.textContent = '';
          }
        }, timeout);
      }
    });
  };

  if (delay > 0) {
    setTimeout(doAnnounce, delay);
  } else {
    doAnnounce();
  }
}

/**
 * Announce a polite message (non-interruptive)
 */
export function announcePolite(
  message: string,
  options?: Omit<AnnouncerOptions, 'politeness'>
): void {
  announce(message, { ...options, politeness: 'polite' });
}

/**
 * Announce an assertive message (interruptive)
 */
export function announceAssertive(
  message: string,
  options?: Omit<AnnouncerOptions, 'politeness'>
): void {
  announce(message, { ...options, politeness: 'assertive' });
}

/**
 * Clear all announcements
 */
export function clearAnnouncements(): void {
  if (politeRegion) clearRegion(politeRegion);
  if (assertiveRegion) clearRegion(assertiveRegion);
}

/**
 * Queue multiple announcements (debounced)
 */
export function queueAnnouncement(
  message: string,
  options: AnnouncerOptions & { debounce?: number } = {}
): void {
  const { debounce = 150, ...announceOptions } = options;

  messageQueue.push({ message, options: announceOptions });

  if (queueTimeout) {
    clearTimeout(queueTimeout);
  }

  queueTimeout = setTimeout(() => {
    // Combine messages or use the last one
    const lastMessage = messageQueue[messageQueue.length - 1];
    if (lastMessage) {
      announce(lastMessage.message, lastMessage.options);
    }
    messageQueue = [];
    queueTimeout = null;
  }, debounce);
}

/**
 * Create an announcer instance for a specific context
 */
export function createAnnouncer(defaultOptions: AnnouncerOptions = {}) {
  return {
    announce: (message: string, options?: AnnouncerOptions) =>
      announce(message, { ...defaultOptions, ...options }),
    polite: (message: string, options?: Omit<AnnouncerOptions, 'politeness'>) =>
      announcePolite(message, { ...defaultOptions, ...options }),
    assertive: (
      message: string,
      options?: Omit<AnnouncerOptions, 'politeness'>
    ) => announceAssertive(message, { ...defaultOptions, ...options }),
    queue: (
      message: string,
      options?: AnnouncerOptions & { debounce?: number }
    ) => queueAnnouncement(message, { ...defaultOptions, ...options }),
    clear: clearAnnouncements,
  };
}

/**
 * Status announcer - for status updates like "Saved", "Loading complete"
 */
export function announceStatus(message: string): void {
  announcePolite(message);
}

/**
 * Error announcer - for error messages
 */
export function announceError(message: string): void {
  announceAssertive(message);
}

/**
 * Progress announcer - for progress updates
 */
export function announceProgress(
  current: number,
  total: number,
  template = '{current} of {total}'
): void {
  const message = template
    .replace('{current}', String(current))
    .replace('{total}', String(total));
  announcePolite(message);
}
