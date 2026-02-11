import React, {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useId } from '../../hooks/use-id';
import { useKeyboard } from '../../hooks/use-keyboard';
import { useAnnouncer } from '../../hooks/use-announcer';
import { createComponentWarnings } from '@compa11y/core';

const warnings = createComponentWarnings('Combobox');

export interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface ComboboxContextValue {
  inputValue: string;
  setInputValue: (value: string) => void;
  selectedValue: string | null;
  setSelectedValue: (value: string | null) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  highlightedIndex: number;
  setHighlightedIndex: (index: number) => void;
  options: ComboboxOption[];
  filteredOptions: ComboboxOption[];
  inputId: string;
  listboxId: string;
  getOptionId: (index: number) => string;
  onSelect: (option: ComboboxOption) => void;
}

const ComboboxContext = createContext<ComboboxContextValue | null>(null);

function useComboboxContext(): ComboboxContextValue {
  const context = useContext(ComboboxContext);
  if (!context) {
    throw new Error(
      'Combobox compound components must be used within a Combobox component'
    );
  }
  return context;
}

export interface ComboboxProps {
  /** List of options */
  options: ComboboxOption[];
  /** Currently selected value */
  value?: string | null;
  /** Called when selection changes */
  onValueChange?: (value: string | null) => void;
  /** Called when input changes */
  onInputChange?: (value: string) => void;
  /** Default input value */
  defaultInputValue?: string;
  /** Whether the combobox is disabled */
  disabled?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Custom filter function */
  filterFn?: (option: ComboboxOption, inputValue: string) => boolean;
  /** Accessible label */
  'aria-label'?: string;
  /** ID of labelling element */
  'aria-labelledby'?: string;
  children: React.ReactNode;
}

export function Combobox({
  options,
  value: controlledValue,
  onValueChange,
  onInputChange,
  defaultInputValue = '',
  disabled = false,
  filterFn,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  children,
}: ComboboxProps) {
  const [inputValue, setInputValueState] = useState(defaultInputValue);
  const [selectedValue, setSelectedValueState] = useState<string | null>(
    controlledValue ?? null
  );
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const inputId = useId('combobox-input');
  const listboxId = useId('combobox-listbox');
  const baseOptionId = useId('combobox-option');

  // Sync controlled value
  useEffect(() => {
    if (controlledValue !== undefined) {
      setSelectedValueState(controlledValue);
      // Update input value to match selected option
      const option = options.find((o) => o.value === controlledValue);
      if (option) {
        setInputValueState(option.label);
      }
    }
  }, [controlledValue, options]);

  const setInputValue = useCallback(
    (value: string) => {
      setInputValueState(value);
      onInputChange?.(value);
    },
    [onInputChange]
  );

  const setSelectedValue = useCallback(
    (value: string | null) => {
      if (controlledValue === undefined) {
        setSelectedValueState(value);
      }
      onValueChange?.(value);
    },
    [controlledValue, onValueChange]
  );

  const filteredOptions = useMemo(() => {
    if (!inputValue) return options;

    const defaultFilter = (opt: ComboboxOption, input: string) =>
      opt.label.toLowerCase().includes(input.toLowerCase());

    const filter = filterFn ?? defaultFilter;
    return options.filter((opt) => filter(opt, inputValue));
  }, [options, inputValue, filterFn]);

  const getOptionId = useCallback(
    (index: number) => `${baseOptionId}-${index}`,
    [baseOptionId]
  );

  const onSelect = useCallback(
    (option: ComboboxOption) => {
      setSelectedValue(option.value);
      setInputValue(option.label);
      setIsOpen(false);
      setHighlightedIndex(-1);
    },
    [setSelectedValue, setInputValue]
  );

  useEffect(() => {
    if (!ariaLabel && !ariaLabelledBy) {
      warnings.warning(
        'Combobox has no accessible label.',
        'Add aria-label or aria-labelledby prop.'
      );
    }
  }, [ariaLabel, ariaLabelledBy]);

  const contextValue: ComboboxContextValue = {
    inputValue,
    setInputValue,
    selectedValue,
    setSelectedValue,
    isOpen,
    setIsOpen,
    highlightedIndex,
    setHighlightedIndex,
    options,
    filteredOptions,
    inputId,
    listboxId,
    getOptionId,
    onSelect,
  };

  return (
    <ComboboxContext.Provider value={contextValue}>
      <div data-compa11y-combobox data-disabled={disabled}>
        {children}
      </div>
    </ComboboxContext.Provider>
  );
}

export interface ComboboxInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange'
> {
  /** Show clear button */
  clearable?: boolean;
}

export const ComboboxInput = forwardRef<HTMLInputElement, ComboboxInputProps>(
  function ComboboxInput(
    { clearable = false, onKeyDown, onFocus, onBlur, ...props },
    ref
  ) {
    const {
      inputValue,
      setInputValue,
      setSelectedValue,
      isOpen,
      setIsOpen,
      highlightedIndex,
      setHighlightedIndex,
      filteredOptions,
      inputId,
      listboxId,
      getOptionId,
      onSelect,
    } = useComboboxContext();
    const { announce } = useAnnouncer();

    const keyboardProps = useKeyboard(
      {
        ArrowDown: () => {
          if (!isOpen) {
            setIsOpen(true);
            setHighlightedIndex(0);
          } else {
            const nextIndex = (highlightedIndex + 1) % filteredOptions.length;
            setHighlightedIndex(nextIndex);
          }
        },
        ArrowUp: () => {
          if (!isOpen) {
            setIsOpen(true);
            setHighlightedIndex(filteredOptions.length - 1);
          } else {
            const prevIndex =
              (highlightedIndex - 1 + filteredOptions.length) %
              filteredOptions.length;
            setHighlightedIndex(prevIndex);
          }
        },
        Enter: () => {
          if (isOpen && highlightedIndex >= 0) {
            const option = filteredOptions[highlightedIndex];
            if (option && !option.disabled) {
              onSelect(option);
              announce(`${option.label} selected`);
            }
          }
        },
        Escape: () => {
          if (isOpen) {
            setIsOpen(false);
            setHighlightedIndex(-1);
          }
        },
        Tab: () => {
          // Tab should close the listbox and allow natural focus movement
          if (isOpen) {
            setIsOpen(false);
            setHighlightedIndex(-1);
          }
          // Return false to allow browser's default Tab behavior
          return false;
        },
        Home: () => {
          if (isOpen) {
            setHighlightedIndex(0);
          }
        },
        End: () => {
          if (isOpen) {
            setHighlightedIndex(filteredOptions.length - 1);
          }
        },
      },
      { preventDefault: true, stopPropagation: false }
    );

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(event);
      if (!event.defaultPrevented) {
        keyboardProps.onKeyDown(event);
      }
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setInputValue(value);
      setIsOpen(true);
      setHighlightedIndex(0);

      if (value === '') {
        setSelectedValue(null);
      }
    };

    const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
      onFocus?.(event);
      setIsOpen(true);
    };

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      onBlur?.(event);
      // Use setTimeout to allow clicks on options to register before closing
      // This delay allows option click events to fire before the listbox closes
      setTimeout(() => {
        // Only close if focus didn't move to the listbox itself
        // This handles cases where user clicks on an option
        setIsOpen(false);
      }, 150);
    };

    const handleClear = () => {
      setInputValue('');
      setSelectedValue(null);
      setIsOpen(false);
    };

    const activeDescendant =
      isOpen && highlightedIndex >= 0
        ? getOptionId(highlightedIndex)
        : undefined;

    return (
      <div data-compa11y-combobox-input-wrapper>
        <input
          ref={ref}
          id={inputId}
          type="text"
          role="combobox"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-activedescendant={activeDescendant}
          aria-autocomplete="list"
          aria-haspopup="listbox"
          autoComplete="off"
          data-compa11y-combobox-input
          {...props}
        />
        {clearable && inputValue && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear selection"
            tabIndex={-1}
            data-compa11y-combobox-clear
          >
            ×
          </button>
        )}
      </div>
    );
  }
);

export interface ComboboxListboxProps extends React.HTMLAttributes<HTMLUListElement> {
  /** Render when no options match */
  emptyMessage?: React.ReactNode;
  children?: React.ReactNode;
}

export const ComboboxListbox = forwardRef<
  HTMLUListElement,
  ComboboxListboxProps
>(function ComboboxListbox(
  { emptyMessage = 'No results found', children, style, ...props },
  forwardedRef
) {
  const { isOpen, filteredOptions, listboxId, inputId } = useComboboxContext();
  const { announce } = useAnnouncer();
  const internalRef = useRef<HTMLUListElement | null>(null);
  const [position, setPosition] = useState<'bottom' | 'top'>('bottom');

  useEffect(() => {
    if (isOpen) {
      const count = filteredOptions.length;
      announce(
        count === 0
          ? 'No results'
          : `${count} result${count === 1 ? '' : 's'} available`
      );
    }
  }, [isOpen, filteredOptions.length, announce]);

  useLayoutEffect(() => {
    if (isOpen && internalRef.current) {
      const listbox = internalRef.current;
      const rect = listbox.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.top;
      const spaceAbove = rect.top;
      const listboxHeight = Math.min(rect.height, 200); // max-height from CSS

      if (spaceBelow < listboxHeight + 50 && spaceAbove > spaceBelow) {
        setPosition('top');
      } else {
        setPosition('bottom');
      }
    }
  }, [isOpen]);

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
      aria-labelledby={inputId}
      style={{ ...style, ...positionStyle }}
      data-compa11y-combobox-listbox
      data-position={position}
      {...props}
    >
      {filteredOptions.length === 0 ? (
        <li role="presentation" data-compa11y-combobox-empty>
          {emptyMessage}
        </li>
      ) : (
        (children ??
        filteredOptions.map((option, index) => (
          <ComboboxOption key={option.value} option={option} index={index} />
        )))
      )}
    </ul>
  );
});

export interface ComboboxOptionProps extends React.LiHTMLAttributes<HTMLLIElement> {
  option: ComboboxOption;
  index: number;
}

export const ComboboxOption = forwardRef<HTMLLIElement, ComboboxOptionProps>(
  function ComboboxOption(
    { option, index, onClick, onMouseEnter, ...props },
    forwardedRef
  ) {
    const {
      selectedValue,
      highlightedIndex,
      setHighlightedIndex,
      getOptionId,
      onSelect,
    } = useComboboxContext();
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
        data-compa11y-combobox-option
        {...props}
      >
        {option.label}
      </li>
    );
  }
);

export const ComboboxCompound = Object.assign(Combobox, {
  Input: ComboboxInput,
  Listbox: ComboboxListbox,
  Option: ComboboxOption,
});
