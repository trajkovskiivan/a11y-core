import { useCallback, useEffect, useRef } from 'react';
import {
  announce,
  announcePolite,
  announceAssertive,
  queueAnnouncement,
  clearAnnouncements,
  initAnnouncer,
  type AnnouncerOptions,
} from '@a11ykit/core';

/**
 * Hook for screen reader announcements
 *
 * @example
 * ```tsx
 * function SearchResults({ results }) {
 *   const { announce } = useAnnouncer();
 *
 *   useEffect(() => {
 *     announce(`Found ${results.length} results`);
 *   }, [results.length, announce]);
 *
 *   return <ul>...</ul>;
 * }
 * ```
 */
export function useAnnouncer() {
  // Ensure announcer is initialized
  useEffect(() => {
    const cleanup = initAnnouncer();
    return cleanup;
  }, []);

  const announceMessage = useCallback(
    (message: string, options?: AnnouncerOptions) => {
      announce(message, options);
    },
    []
  );

  const polite = useCallback(
    (message: string, options?: Omit<AnnouncerOptions, 'politeness'>) => {
      announcePolite(message, options);
    },
    []
  );

  const assertive = useCallback(
    (message: string, options?: Omit<AnnouncerOptions, 'politeness'>) => {
      announceAssertive(message, options);
    },
    []
  );

  const queue = useCallback(
    (message: string, options?: AnnouncerOptions & { debounce?: number }) => {
      queueAnnouncement(message, options);
    },
    []
  );

  const clear = useCallback(() => {
    clearAnnouncements();
  }, []);

  return {
    announce: announceMessage,
    polite,
    assertive,
    queue,
    clear,
  };
}

/**
 * Announce a message when a value changes
 *
 * @example
 * ```tsx
 * function Counter({ count }) {
 *   useAnnounceOnChange(count, (value) => `Count is now ${value}`);
 *   return <span>{count}</span>;
 * }
 * ```
 */
export function useAnnounceOnChange<T>(
  value: T,
  getMessage: (value: T) => string,
  options?: AnnouncerOptions & { skipInitial?: boolean }
): void {
  const { skipInitial = true, ...announceOptions } = options ?? {};
  const isFirstRender = useRef(true);
  const previousValue = useRef(value);

  useEffect(() => {
    // Skip initial render if specified
    if (isFirstRender.current && skipInitial) {
      isFirstRender.current = false;
      previousValue.current = value;
      return;
    }

    // Only announce if value changed
    if (previousValue.current !== value) {
      announce(getMessage(value), announceOptions);
      previousValue.current = value;
    }
  }, [value, getMessage, announceOptions]);
}

/**
 * Announce loading states
 *
 * @example
 * ```tsx
 * function DataList({ isLoading }) {
 *   useAnnounceLoading(isLoading, {
 *     loadingMessage: 'Loading data...',
 *     loadedMessage: 'Data loaded',
 *   });
 *
 *   return <div>...</div>;
 * }
 * ```
 */
export function useAnnounceLoading(
  isLoading: boolean,
  options: {
    loadingMessage?: string;
    loadedMessage?: string;
    errorMessage?: string;
    error?: Error | null;
  } = {}
): void {
  const {
    loadingMessage = 'Loading...',
    loadedMessage = 'Content loaded',
    errorMessage = 'An error occurred',
    error,
  } = options;

  const wasLoading = useRef(false);

  useEffect(() => {
    if (isLoading && !wasLoading.current) {
      announcePolite(loadingMessage);
    } else if (!isLoading && wasLoading.current) {
      if (error) {
        announceAssertive(errorMessage);
      } else {
        announcePolite(loadedMessage);
      }
    }
    wasLoading.current = isLoading;
  }, [isLoading, error, loadingMessage, loadedMessage, errorMessage]);
}
