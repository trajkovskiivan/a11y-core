import React, {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { useId } from '../../hooks/use-id';
import { useKeyboard, useTypeAhead } from '../../hooks/use-keyboard';
import { useAnnouncer } from '../../hooks/use-announcer';
import { createComponentWarnings } from '@compa11y/core';

const warnings = createComponentWarnings('Select');

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectContextValue {
  selectedValue: string | null;
  setSelectedValue: (value: string | null) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  highlightedIndex: number;
  setHighlightedIndex: (index: number) => void;
  options: SelectOption[];
  triggerId: string;
  listboxId: string;
  getOptionId: (index: number) => string;
  onSelect: (option: SelectOption) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  placeholder: string;
  disabled: boolean;
}

const SelectContext = createContext<SelectContextValue | null>(null);

function useSelectContext(): SelectContextValue {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error(
      'Select compound components must be used within a Select component'
    );
  }
  return context;
}

// Navigation helpers that skip disabled options
function findNextEnabledIndex(
  options: SelectOption[],
  currentIndex: number,
  direction: 1 | -1
): number {
  const length = options.length;
  let index = currentIndex + direction;

  if (index < 0) index = length - 1;
  if (index >= length) index = 0;

  const startIndex = index;
  while (options[index]?.disabled) {
    index += direction;
    if (index < 0) index = length - 1;
    if (index >= length) index = 0;
    if (index === startIndex) return -1; // All disabled
  }

  return index;
}

function findFirstEnabledIndex(options: SelectOption[]): number {
  return options.findIndex((o) => !o.disabled);
}

function findLastEnabledIndex(options: SelectOption[]): number {
  for (let i = options.length - 1; i >= 0; i--) {
    if (!options[i]?.disabled) return i;
  }
  return -1;
}

/**
 * Accessible Select component
 *
 * A dropdown selection component following WAI-ARIA Listbox pattern.
 * Unlike Combobox, Select uses a button trigger and does not support text filtering.
 *
 * @example
 * ```tsx
 * <Select
 *   options={[
 *     { value: 'apple', label: 'Apple' },
 *     { value: 'banana', label: 'Banana' },
 *   ]}
 *   value={value}
 *   onValueChange={setValue}
 *   aria-label="Choose a fruit"
 * >
 *   <Select.Trigger placeholder="Pick a fruit..." />
 *   <Select.Listbox />
 * </Select>
 * ```
 */
export interface SelectProps {
  /** List of options */
  options: SelectOption[];
  /** Controlled selected value */
  value?: string | null;
  /** Default value for uncontrolled mode */
  defaultValue?: string;
  /** Called when selection changes */
  onValueChange?: (value: string | null) => void;
  /** Whether the select is disabled */
  disabled?: boolean;
  /** Placeholder text when no value is selected */
  placeholder?: string;
  /** Accessible label */
  'aria-label'?: string;
  /** ID of labelling element */
  'aria-labelledby'?: string;
  children: React.ReactNode;
}

export function Select({
  options,
  value: controlledValue,
  defaultValue,
  onValueChange,
  disabled = false,
  placeholder = 'Select an option...',
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  children,
}: SelectProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState<string | null>(
    defaultValue ?? null
  );
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const selectedValue =
    controlledValue !== undefined ? controlledValue : uncontrolledValue;

  const triggerId = useId('select-trigger');
  const listboxId = useId('select-listbox');
  const baseOptionId = useId('select-option');

  const setSelectedValue = useCallback(
    (value: string | null) => {
      if (controlledValue === undefined) {
        setUncontrolledValue(value);
      }
      onValueChange?.(value);
    },
    [controlledValue, onValueChange]
  );

  const getOptionId = useCallback(
    (index: number) => `${baseOptionId}-${index}`,
    [baseOptionId]
  );

  const onSelect = useCallback(
    (option: SelectOption) => {
      setSelectedValue(option.value);
      setIsOpen(false);
      setHighlightedIndex(-1);
      // Return focus to trigger
      triggerRef.current?.focus();
    },
    [setSelectedValue]
  );

  useEffect(() => {
    if (!ariaLabel && !ariaLabelledBy) {
      warnings.warning(
        'Select has no accessible label.',
        'Add aria-label or aria-labelledby prop.'
      );
    }
  }, [ariaLabel, ariaLabelledBy]);

  const contextValue: SelectContextValue = {
    selectedValue,
    setSelectedValue,
    isOpen,
    setIsOpen,
    highlightedIndex,
    setHighlightedIndex,
    options,
    triggerId,
    listboxId,
    getOptionId,
    onSelect,
    triggerRef,
    placeholder,
    disabled,
  };

  return (
    <SelectContext.Provider value={contextValue}>
      <div data-compa11y-select data-disabled={disabled || undefined}>
        {children}
      </div>
    </SelectContext.Provider>
  );
}

export interface SelectTriggerProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'value'> {
  /** Placeholder text shown when no value is selected (overrides the root Select placeholder) */
  placeholder?: string;
}

export const SelectTrigger = forwardRef<HTMLButtonElement, SelectTriggerProps>(
  function SelectTrigger(
    { placeholder: triggerPlaceholder, onKeyDown, onClick, onBlur, ...props },
    forwardedRef
  ) {
    const {
      selectedValue,
      isOpen,
      setIsOpen,
      highlightedIndex,
      setHighlightedIndex,
      options,
      triggerId,
      listboxId,
      getOptionId,
      onSelect,
      triggerRef,
      placeholder: contextPlaceholder,
      disabled,
    } = useSelectContext();
    const placeholder = triggerPlaceholder ?? contextPlaceholder;
    const { announce } = useAnnouncer();

    // Type-ahead: pressing characters jumps to matching option
    const typeAheadProps = useTypeAhead(
      options.map((o) => o.label),
      (match) => {
        const index = options.findIndex(
          (o) => o.label === match && !o.disabled
        );
        if (index >= 0) {
          if (!isOpen) {
            setIsOpen(true);
          }
          setHighlightedIndex(index);
        }
      },
      { disabled }
    );

    // Open and highlight selected or first/last option
    const openAndHighlight = useCallback(
      (preferLast = false) => {
        setIsOpen(true);
        const selectedIndex = options.findIndex(
          (o) => o.value === selectedValue
        );
        if (selectedIndex >= 0) {
          setHighlightedIndex(selectedIndex);
        } else {
          setHighlightedIndex(
            preferLast
              ? findLastEnabledIndex(options)
              : findFirstEnabledIndex(options)
          );
        }
      },
      [options, selectedValue, setIsOpen, setHighlightedIndex]
    );

    const keyboardProps = useKeyboard(
      {
        ArrowDown: () => {
          if (!isOpen) {
            openAndHighlight();
          } else {
            const next = findNextEnabledIndex(options, highlightedIndex, 1);
            if (next >= 0) setHighlightedIndex(next);
          }
        },
        ArrowUp: () => {
          if (!isOpen) {
            openAndHighlight(true);
          } else {
            const prev = findNextEnabledIndex(options, highlightedIndex, -1);
            if (prev >= 0) setHighlightedIndex(prev);
          }
        },
        Enter: () => {
          if (isOpen && highlightedIndex >= 0) {
            const option = options[highlightedIndex];
            if (option && !option.disabled) {
              onSelect(option);
              announce(`${option.label} selected`);
            }
          } else if (!isOpen) {
            openAndHighlight();
          }
        },
        Space: () => {
          if (isOpen && highlightedIndex >= 0) {
            const option = options[highlightedIndex];
            if (option && !option.disabled) {
              onSelect(option);
              announce(`${option.label} selected`);
            }
          } else if (!isOpen) {
            openAndHighlight();
          }
        },
        Escape: () => {
          if (isOpen) {
            setIsOpen(false);
            setHighlightedIndex(-1);
          }
        },
        Home: () => {
          if (isOpen) {
            setHighlightedIndex(findFirstEnabledIndex(options));
          }
        },
        End: () => {
          if (isOpen) {
            setHighlightedIndex(findLastEnabledIndex(options));
          }
        },
        Tab: () => {
          if (isOpen) {
            setIsOpen(false);
            setHighlightedIndex(-1);
          }
          return false; // Allow natural tab behavior
        },
      },
      { preventDefault: true, stopPropagation: false }
    );

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      onKeyDown?.(event);
      if (!event.defaultPrevented) {
        keyboardProps.onKeyDown(event);
      }
      // Type-ahead for printable characters not already handled
      if (!event.defaultPrevented) {
        typeAheadProps.onKeyDown(event);
      }
    };

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented && !disabled) {
        if (isOpen) {
          setIsOpen(false);
          setHighlightedIndex(-1);
        } else {
          openAndHighlight();
        }
      }
    };

    const handleBlur = (event: React.FocusEvent<HTMLButtonElement>) => {
      onBlur?.(event);
      // Delay close to allow clicks on options to register
      setTimeout(() => {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }, 150);
    };

    const activeDescendant =
      isOpen && highlightedIndex >= 0
        ? getOptionId(highlightedIndex)
        : undefined;

    const selectedOption = options.find((o) => o.value === selectedValue);
    const displayText = selectedOption?.label ?? placeholder;

    const setRefs = useCallback(
      (node: HTMLButtonElement | null) => {
        (
          triggerRef as React.MutableRefObject<HTMLButtonElement | null>
        ).current = node;
        if (typeof forwardedRef === 'function') {
          forwardedRef(node);
        } else if (forwardedRef) {
          (
            forwardedRef as React.MutableRefObject<HTMLButtonElement | null>
          ).current = node;
        }
      },
      [forwardedRef, triggerRef]
    );

    return (
      <button
        ref={setRefs}
        id={triggerId}
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-haspopup="listbox"
        aria-activedescendant={activeDescendant}
        disabled={disabled}
        onKeyDown={handleKeyDown}
        onClick={handleClick}
        onBlur={handleBlur}
        data-compa11y-select-trigger
        data-placeholder={!selectedOption || undefined}
        {...props}
      >
        <span data-compa11y-select-value>{displayText}</span>
        <span aria-hidden="true" data-compa11y-select-chevron>
          &#9660;
        </span>
      </button>
    );
  }
);

export interface SelectListboxProps
  extends React.HTMLAttributes<HTMLUListElement> {
  children?: React.ReactNode;
}

export const SelectListbox = forwardRef<HTMLUListElement, SelectListboxProps>(
  function SelectListbox({ children, style, ...props }, forwardedRef) {
    const { isOpen, options, listboxId, triggerId } = useSelectContext();
    const { announce } = useAnnouncer();
    const internalRef = useRef<HTMLUListElement | null>(null);
    const [position, setPosition] = useState<'bottom' | 'top'>('bottom');

    useEffect(() => {
      if (isOpen) {
        announce(
          `${options.length} option${options.length === 1 ? '' : 's'} available`
        );
      }
    }, [isOpen, options.length, announce]);

    useLayoutEffect(() => {
      if (isOpen && internalRef.current) {
        const listbox = internalRef.current;
        const rect = listbox.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const spaceBelow = viewportHeight - rect.top;
        const spaceAbove = rect.top;
        const listboxHeight = Math.min(rect.height, 200);

        if (spaceBelow < listboxHeight + 50 && spaceAbove > spaceBelow) {
          setPosition('top');
        } else {
          setPosition('bottom');
        }
      }
    }, [isOpen]);

    // Prevent trigger blur when clicking inside the listbox
    const handleMouseDown = (event: React.MouseEvent) => {
      event.preventDefault();
    };

    const setRefs = useCallback(
      (node: HTMLUListElement | null) => {
        internalRef.current = node;
        if (typeof forwardedRef === 'function') {
          forwardedRef(node);
        } else if (forwardedRef) {
          (
            forwardedRef as React.MutableRefObject<HTMLUListElement | null>
          ).current = node;
        }
      },
      [forwardedRef]
    );

    if (!isOpen) {
      return null;
    }

    const positionStyle: React.CSSProperties =
      position === 'top'
        ? { bottom: '100%', top: 'auto', marginBottom: '4px', marginTop: 0 }
        : {};

    return (
      <ul
        ref={setRefs}
        id={listboxId}
        role="listbox"
        aria-labelledby={triggerId}
        style={{ ...style, ...positionStyle }}
        onMouseDown={handleMouseDown}
        data-compa11y-select-listbox
        data-position={position}
        {...props}
      >
        {children ??
          options.map((option, index) => (
            <SelectOptionItem
              key={option.value}
              option={option}
              index={index}
            />
          ))}
      </ul>
    );
  }
);

export interface SelectOptionProps
  extends React.LiHTMLAttributes<HTMLLIElement> {
  option: SelectOption;
  index: number;
}

export const SelectOptionItem = forwardRef<HTMLLIElement, SelectOptionProps>(
  function SelectOptionItem(
    { option, index, onClick, onMouseEnter, ...props },
    forwardedRef
  ) {
    const {
      selectedValue,
      highlightedIndex,
      setHighlightedIndex,
      getOptionId,
      onSelect,
    } = useSelectContext();
    const { announce } = useAnnouncer();
    const internalRef = useRef<HTMLLIElement | null>(null);

    const isSelected = selectedValue === option.value;
    const isHighlighted = highlightedIndex === index;
    const optionId = getOptionId(index);

    useEffect(() => {
      if (isHighlighted && internalRef.current) {
        internalRef.current.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        });
      }
    }, [isHighlighted]);

    const handleClick = (event: React.MouseEvent<HTMLLIElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented && !option.disabled) {
        onSelect(option);
        announce(`${option.label} selected`);
      }
    };

    const handleMouseEnter = (event: React.MouseEvent<HTMLLIElement>) => {
      onMouseEnter?.(event);
      if (!option.disabled) {
        setHighlightedIndex(index);
      }
    };

    const setRefs = useCallback(
      (node: HTMLLIElement | null) => {
        internalRef.current = node;
        if (typeof forwardedRef === 'function') {
          forwardedRef(node);
        } else if (forwardedRef) {
          (
            forwardedRef as React.MutableRefObject<HTMLLIElement | null>
          ).current = node;
        }
      },
      [forwardedRef]
    );

    return (
      <li
        ref={setRefs}
        id={optionId}
        role="option"
        aria-selected={isSelected}
        aria-disabled={option.disabled}
        data-highlighted={isHighlighted}
        data-selected={isSelected}
        data-disabled={option.disabled}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        data-compa11y-select-option
        {...props}
      >
        <span data-compa11y-select-option-text>{option.label}</span>
        {isSelected && (
          <span aria-hidden="true" data-compa11y-select-check>
            &#10003;
          </span>
        )}
      </li>
    );
  }
);

export const SelectCompound = Object.assign(Select, {
  Trigger: SelectTrigger,
  Listbox: SelectListbox,
  Option: SelectOptionItem,
});
