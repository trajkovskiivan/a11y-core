import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseRovingTabindexOptions {
  /** Initial active index */
  initialIndex?: number;
  /** Whether navigation wraps around */
  wrap?: boolean;
  /** Orientation for arrow keys */
  orientation?: 'horizontal' | 'vertical' | 'both';
  /** Called when active index changes */
  onChange?: (index: number) => void;
}

export interface RovingTabindexItem {
  /** Props to spread on the item element */
  props: {
    tabIndex: number;
    onKeyDown: (event: React.KeyboardEvent) => void;
    onFocus: () => void;
  };
  /** Whether this item is the active/focusable one */
  isActive: boolean;
}

/**
 * Hook for roving tabindex pattern
 *
 * @example
 * ```tsx
 * function Toolbar() {
 *   const { getItemProps, activeIndex } = useRovingTabindex({
 *     itemCount: 3,
 *     orientation: 'horizontal',
 *   });
 *
 *   return (
 *     <div role="toolbar">
 *       <button {...getItemProps(0)}>Cut</button>
 *       <button {...getItemProps(1)}>Copy</button>
 *       <button {...getItemProps(2)}>Paste</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useRovingTabindex(options: UseRovingTabindexOptions & { itemCount: number }) {
  const {
    itemCount,
    initialIndex = 0,
    wrap = true,
    orientation = 'both',
    onChange,
  } = options;

  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  // Reset if item count changes
  useEffect(() => {
    if (activeIndex >= itemCount) {
      setActiveIndex(Math.max(0, itemCount - 1));
    }
  }, [itemCount, activeIndex]);

  const moveTo = useCallback(
    (index: number) => {
      let newIndex = index;
      if (newIndex < 0) {
        newIndex = wrap ? itemCount - 1 : 0;
      } else if (newIndex >= itemCount) {
        newIndex = wrap ? 0 : itemCount - 1;
      }

      setActiveIndex(newIndex);
      onChange?.(newIndex);

      // Focus the element
      const element = itemRefs.current[newIndex];
      element?.focus();
    },
    [itemCount, wrap, onChange]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, index: number) => {
      let handled = false;

      switch (event.key) {
        case 'ArrowRight':
          if (orientation === 'horizontal' || orientation === 'both') {
            moveTo(index + 1);
            handled = true;
          }
          break;
        case 'ArrowLeft':
          if (orientation === 'horizontal' || orientation === 'both') {
            moveTo(index - 1);
            handled = true;
          }
          break;
        case 'ArrowDown':
          if (orientation === 'vertical' || orientation === 'both') {
            moveTo(index + 1);
            handled = true;
          }
          break;
        case 'ArrowUp':
          if (orientation === 'vertical' || orientation === 'both') {
            moveTo(index - 1);
            handled = true;
          }
          break;
        case 'Home':
          moveTo(0);
          handled = true;
          break;
        case 'End':
          moveTo(itemCount - 1);
          handled = true;
          break;
      }

      if (handled) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    [orientation, moveTo, itemCount]
  );

  const getItemProps = useCallback(
    (index: number) => ({
      ref: (el: HTMLElement | null) => {
        itemRefs.current[index] = el;
      },
      tabIndex: index === activeIndex ? 0 : -1,
      onKeyDown: (event: React.KeyboardEvent) => handleKeyDown(event, index),
      onFocus: () => {
        if (index !== activeIndex) {
          setActiveIndex(index);
          onChange?.(index);
        }
      },
    }),
    [activeIndex, handleKeyDown, onChange]
  );

  return {
    activeIndex,
    setActiveIndex: moveTo,
    getItemProps,
    first: () => moveTo(0),
    last: () => moveTo(itemCount - 1),
    next: () => moveTo(activeIndex + 1),
    previous: () => moveTo(activeIndex - 1),
  };
}

/**
 * Simplified roving tabindex for items with known IDs
 */
export function useRovingTabindexMap<T extends string>(
  ids: T[],
  options: Omit<UseRovingTabindexOptions, 'itemCount'> = {}
) {
  const roving = useRovingTabindex({
    ...options,
    itemCount: ids.length,
  });

  const getItemProps = useCallback(
    (id: T) => {
      const index = ids.indexOf(id);
      if (index === -1) {
        throw new Error(`Unknown item ID: ${id}`);
      }
      return roving.getItemProps(index);
    },
    [ids, roving]
  );

  const activeId = ids[roving.activeIndex];

  return {
    ...roving,
    activeId,
    getItemProps,
    setActiveId: (id: T) => {
      const index = ids.indexOf(id);
      if (index !== -1) {
        roving.setActiveIndex(index);
      }
    },
  };
}
