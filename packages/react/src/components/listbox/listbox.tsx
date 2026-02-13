/**
 * Listbox Component
 *
 * An accessible listbox for single or multi-selection from a visible list.
 * Follows WAI-ARIA Listbox pattern with aria-activedescendant,
 * type-ahead search, option groups, and full keyboard support.
 *
 * @example
 * ```tsx
 * // Single select (selection follows focus)
 * <Listbox value={fruit} onValueChange={setFruit} aria-label="Favorite fruit">
 *   <Listbox.Option value="apple">Apple</Listbox.Option>
 *   <Listbox.Option value="banana" disabled>Banana</Listbox.Option>
 *   <Listbox.Group label="Citrus">
 *     <Listbox.Option value="orange">Orange</Listbox.Option>
 *   </Listbox.Group>
 * </Listbox>
 *
 * // Multi select (focus independent of selection)
 * <Listbox multiple value={toppings} onValueChange={setToppings} aria-label="Toppings">
 *   <Listbox.Option value="cheese">Cheese</Listbox.Option>
 *   <Listbox.Option value="pepperoni">Pepperoni</Listbox.Option>
 * </Listbox>
 * ```
 */

import React, {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createComponentWarnings } from '@compa11y/core';
import { useId } from '../../hooks/use-id';
import { useKeyboard } from '../../hooks/use-keyboard';
import { useTypeAhead } from '../../hooks/use-keyboard';
import { useAnnouncer } from '../../hooks/use-announcer';

const warnings = createComponentWarnings('Listbox');

// ============================================================================
// Types
// ============================================================================

export interface ListboxContextValue {
  multiple: boolean;
  disabled: boolean;
  discoverable: boolean;
  unstyled: boolean;
  orientation: 'horizontal' | 'vertical';
  selectedValues: Set<string>;
  focusedValue: string | null;
  onSelect: (value: string) => void;
  onFocusOption: (value: string) => void;
  registerOption: (value: string, disabled: boolean, label: string) => void;
  unregisterOption: (value: string) => void;
  updateOptionDisabled: (value: string, disabled: boolean) => void;
  isSelected: (value: string) => boolean;
  listboxId: string;
}

export interface ListboxProps {
  /** Controlled value — string for single, string[] for multi */
  value?: string | string[];
  /** Default value (uncontrolled) */
  defaultValue?: string | string[];
  /** Called when selection changes */
  onValueChange?: (value: string | string[]) => void;
  /** Enable multi-select mode */
  multiple?: boolean;
  /** Disable all options */
  disabled?: boolean;
  /** Keep disabled listbox in tab order */
  discoverable?: boolean;
  /** Layout orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Remove default styles */
  unstyled?: boolean;
  /** Custom class name */
  className?: string;
  /** Children (Option and Group components) */
  children: React.ReactNode;
  /** Accessible label */
  'aria-label'?: string;
  /** Reference to external label element */
  'aria-labelledby'?: string;
}

export interface ListboxOptionProps {
  /** Value for this option (required) */
  value: string;
  /** Whether this option is disabled */
  disabled?: boolean;
  /** Keep disabled option discoverable */
  discoverable?: boolean;
  /** Remove default styles */
  unstyled?: boolean;
  /** Custom class name */
  className?: string;
  /** Children (label content) */
  children?: React.ReactNode;
  /** Accessible label override */
  'aria-label'?: string;
}

export interface ListboxGroupProps {
  /** Group label (required, visible) */
  label: string;
  /** Disable all options in this group */
  disabled?: boolean;
  /** Remove default styles */
  unstyled?: boolean;
  /** Custom class name */
  className?: string;
  /** Children (Option components) */
  children: React.ReactNode;
}

// ============================================================================
// Contexts
// ============================================================================

const ListboxContext = createContext<ListboxContextValue | null>(null);

export function useListboxContext(): ListboxContextValue {
  const context = useContext(ListboxContext);
  if (!context) {
    throw new Error(
      '[Compa11y Listbox]: Option/Group must be used within a Listbox.'
    );
  }
  return context;
}

/** Group context to cascade disabled */
const ListboxGroupContext = createContext<{ groupDisabled: boolean }>({
  groupDisabled: false,
});

// ============================================================================
// Listbox (Root)
// ============================================================================

export const Listbox = forwardRef<HTMLDivElement, ListboxProps>(
  function Listbox(
    {
      value: controlledValue,
      defaultValue,
      onValueChange,
      multiple = false,
      disabled = false,
      discoverable = true,
      orientation = 'vertical',
      unstyled = false,
      className = '',
      children,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
    },
    ref
  ) {
    const listboxId = useId('listbox');
    const { announce } = useAnnouncer();

    // ===== State =====
    const [uncontrolledValue, setUncontrolledValue] = useState<
      string | string[]
    >(() => defaultValue ?? (multiple ? [] : ''));
    const isControlled = controlledValue !== undefined;
    const currentValue = isControlled ? controlledValue! : uncontrolledValue;

    const selectedValues = useMemo(() => {
      if (multiple) {
        return new Set(
          Array.isArray(currentValue) ? currentValue : []
        );
      }
      return new Set(currentValue ? [String(currentValue)] : []);
    }, [currentValue, multiple]);

    const [focusedValue, setFocusedValue] = useState<string | null>(null);

    // ===== Option Registry =====
    const optionsRef = useRef<
      Map<string, { disabled: boolean; label: string }>
    >(new Map());
    const [optionsVersion, setOptionsVersion] = useState(0);

    const registerOption = useCallback(
      (value: string, optDisabled: boolean, label: string) => {
        optionsRef.current.set(value, { disabled: optDisabled, label });
        setOptionsVersion((v) => v + 1);
      },
      []
    );

    const unregisterOption = useCallback((value: string) => {
      optionsRef.current.delete(value);
      setOptionsVersion((v) => v + 1);
    }, []);

    const updateOptionDisabled = useCallback(
      (value: string, optDisabled: boolean) => {
        const existing = optionsRef.current.get(value);
        if (existing) {
          optionsRef.current.set(value, { ...existing, disabled: optDisabled });
        }
      },
      []
    );

    // ===== Derived option lists =====
    const enabledValues = useMemo(() => {
      const result: string[] = [];
      optionsRef.current.forEach((info, value) => {
        if (!info.disabled && !disabled) {
          result.push(value);
        }
      });
      return result;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [optionsVersion, disabled]);

    // ===== Accessible label warning =====
    useEffect(() => {
      if (!ariaLabel && !ariaLabelledBy) {
        warnings.warning(
          'Listbox has no accessible label. Screen readers need this.',
          'Add aria-label="..." or aria-labelledby="..."'
        );
      }
    }, [ariaLabel, ariaLabelledBy]);

    // ===== Selection =====
    const isSelected = useCallback(
      (value: string) => selectedValues.has(value),
      [selectedValues]
    );

    const handleSelect = useCallback(
      (optionValue: string) => {
        if (disabled) return;

        const info = optionsRef.current.get(optionValue);
        if (info?.disabled) return;

        let newValue: string | string[];
        const label = info?.label || optionValue;

        if (multiple) {
          const current = new Set(selectedValues);
          if (current.has(optionValue)) {
            current.delete(optionValue);
            announce(`${label} deselected`, { politeness: 'polite' });
          } else {
            current.add(optionValue);
            announce(`${label} selected`, { politeness: 'polite' });
          }
          newValue = Array.from(current);
        } else {
          newValue = optionValue;
          announce(`${label} selected`, { politeness: 'polite' });
        }

        if (!isControlled) {
          setUncontrolledValue(newValue);
        }
        onValueChange?.(newValue);
      },
      [disabled, multiple, selectedValues, isControlled, onValueChange, announce]
    );

    // ===== Navigation =====
    const navigateOption = useCallback(
      (direction: 'next' | 'prev' | 'first' | 'last') => {
        if (enabledValues.length === 0) return;

        const currentIndex = focusedValue
          ? enabledValues.indexOf(focusedValue)
          : -1;

        let nextIndex: number;
        switch (direction) {
          case 'next':
            nextIndex =
              currentIndex < 0
                ? 0
                : Math.min(currentIndex + 1, enabledValues.length - 1);
            break;
          case 'prev':
            nextIndex =
              currentIndex < 0
                ? enabledValues.length - 1
                : Math.max(currentIndex - 1, 0);
            break;
          case 'first':
            nextIndex = 0;
            break;
          case 'last':
            nextIndex = enabledValues.length - 1;
            break;
        }

        const nextValue = enabledValues[nextIndex];
        if (nextValue !== undefined) {
          setFocusedValue(nextValue);

          if (!multiple) {
            // Single-select: selection follows focus
            const info = optionsRef.current.get(nextValue);
            const label = info?.label || nextValue;

            let newVal: string | string[] = nextValue;
            if (!isControlled) {
              setUncontrolledValue(newVal);
            }
            onValueChange?.(newVal);
            announce(`${label} selected`, { politeness: 'polite' });
          } else {
            // Multi-select: just announce
            const info = optionsRef.current.get(nextValue);
            const label = info?.label || nextValue;
            const sel = selectedValues.has(nextValue);
            announce(`${label}${sel ? ', selected' : ''}`, {
              politeness: 'polite',
            });
          }
        }
      },
      [
        enabledValues,
        focusedValue,
        multiple,
        isControlled,
        onValueChange,
        announce,
        selectedValues,
      ]
    );

    const toggleFocusedOption = useCallback(() => {
      if (focusedValue && multiple) {
        handleSelect(focusedValue);
      }
    }, [focusedValue, multiple, handleSelect]);

    const selectRangeToFirst = useCallback(() => {
      if (!multiple || !focusedValue) return;
      const currentIdx = enabledValues.indexOf(focusedValue);
      if (currentIdx < 0) return;

      const toSelect = enabledValues.slice(0, currentIdx + 1);
      const newSet = new Set(selectedValues);
      toSelect.forEach((v) => newSet.add(v));
      const newValue = Array.from(newSet);

      if (!isControlled) {
        setUncontrolledValue(newValue);
      }
      onValueChange?.(newValue);
      setFocusedValue(enabledValues[0] ?? null);
      announce(`${toSelect.length} items selected`, { politeness: 'polite' });
    }, [
      multiple,
      focusedValue,
      enabledValues,
      selectedValues,
      isControlled,
      onValueChange,
      announce,
    ]);

    const selectRangeToLast = useCallback(() => {
      if (!multiple || !focusedValue) return;
      const currentIdx = enabledValues.indexOf(focusedValue);
      if (currentIdx < 0) return;

      const toSelect = enabledValues.slice(currentIdx);
      const newSet = new Set(selectedValues);
      toSelect.forEach((v) => newSet.add(v));
      const newValue = Array.from(newSet);

      if (!isControlled) {
        setUncontrolledValue(newValue);
      }
      onValueChange?.(newValue);
      setFocusedValue(enabledValues[enabledValues.length - 1] ?? null);
      announce(`${toSelect.length} items selected`, { politeness: 'polite' });
    }, [
      multiple,
      focusedValue,
      enabledValues,
      selectedValues,
      isControlled,
      onValueChange,
      announce,
    ]);

    const toggleSelectAll = useCallback(() => {
      if (!multiple) return;

      const allSelected = enabledValues.every((v) => selectedValues.has(v));
      let newValue: string[];

      if (allSelected) {
        newValue = [];
        announce('All deselected', { politeness: 'polite' });
      } else {
        newValue = [...enabledValues];
        announce('All selected', { politeness: 'polite' });
      }

      if (!isControlled) {
        setUncontrolledValue(newValue);
      }
      onValueChange?.(newValue);
    }, [
      multiple,
      enabledValues,
      selectedValues,
      isControlled,
      onValueChange,
      announce,
    ]);

    // ===== Keyboard =====
    const keyboardHandlers = useMemo(() => {
      const handlers: Record<string, (e: KeyboardEvent) => void | boolean> = {
        ArrowDown: () => navigateOption('next'),
        ArrowUp: () => navigateOption('prev'),
        Home: () => navigateOption('first'),
        End: () => navigateOption('last'),
      };

      if (multiple) {
        handlers[' '] = () => toggleFocusedOption();
        handlers['Shift+ArrowDown'] = () => {
          navigateOption('next');
          // Toggle after navigate has set the new focused value
          // We need to use a microtask since navigateOption sets state
          setTimeout(() => toggleFocusedOption(), 0);
        };
        handlers['Shift+ArrowUp'] = () => {
          navigateOption('prev');
          setTimeout(() => toggleFocusedOption(), 0);
        };
        handlers['Ctrl+Shift+Home'] = () => selectRangeToFirst();
        handlers['Ctrl+Shift+End'] = () => selectRangeToLast();
        handlers['Ctrl+a'] = () => toggleSelectAll();
        handlers['Meta+a'] = () => toggleSelectAll();
      }

      return handlers;
    }, [
      multiple,
      navigateOption,
      toggleFocusedOption,
      selectRangeToFirst,
      selectRangeToLast,
      toggleSelectAll,
    ]);

    const keyboardProps = useKeyboard(keyboardHandlers, {
      preventDefault: true,
      stopPropagation: true,
      disabled,
    });

    // ===== Type-ahead =====
    const optionLabels = useMemo(() => {
      return Array.from(optionsRef.current.values()).map((info) => info.label);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [optionsVersion]);

    const typeAheadProps = useTypeAhead(
      optionLabels,
      (matchedLabel) => {
        // Find the value that matches this label
        for (const [value, info] of optionsRef.current.entries()) {
          if (info.label === matchedLabel && !info.disabled) {
            setFocusedValue(value);
            if (!multiple) {
              // Single-select: also select
              let newVal: string | string[] = value;
              if (!isControlled) {
                setUncontrolledValue(newVal);
              }
              onValueChange?.(newVal);
              announce(`${matchedLabel} selected`, { politeness: 'polite' });
            }
            break;
          }
        }
      },
      { disabled }
    );

    // Merge keyboard handlers
    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent) => {
        keyboardProps.onKeyDown(event);
        if (!event.defaultPrevented) {
          typeAheadProps.onKeyDown(event);
        }
      },
      [keyboardProps, typeAheadProps]
    );

    // ===== Focus handling =====
    const handleFocus = useCallback(() => {
      if (focusedValue) return; // Already have focus state

      // Focus selected option (or first selected in multi)
      if (!multiple && currentValue && typeof currentValue === 'string') {
        setFocusedValue(currentValue);
        return;
      }
      if (multiple && Array.isArray(currentValue) && currentValue.length > 0) {
        setFocusedValue(currentValue[0] ?? null);
        return;
      }

      // Default to first enabled
      if (enabledValues.length > 0) {
        setFocusedValue(enabledValues[0] ?? null);
      }
    }, [focusedValue, multiple, currentValue, enabledValues]);

    const handleBlur = useCallback(() => {
      // Keep focused value for when we re-focus, but clear active descendant
    }, []);

    // ===== Scroll into view =====
    const listboxRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (focusedValue && listboxRef.current) {
        const el = listboxRef.current.querySelector(
          `[data-value="${CSS.escape(focusedValue)}"]`
        );
        el?.scrollIntoView({ block: 'nearest' });
      }
    }, [focusedValue]);

    // ===== Context =====
    const contextValue: ListboxContextValue = useMemo(
      () => ({
        multiple,
        disabled,
        discoverable,
        unstyled,
        orientation,
        selectedValues,
        focusedValue,
        onSelect: handleSelect,
        onFocusOption: setFocusedValue,
        registerOption,
        unregisterOption,
        updateOptionDisabled,
        isSelected,
        listboxId,
      }),
      [
        multiple,
        disabled,
        discoverable,
        unstyled,
        orientation,
        selectedValues,
        focusedValue,
        handleSelect,
        registerOption,
        unregisterOption,
        updateOptionDisabled,
        isSelected,
        listboxId,
      ]
    );

    // ===== Merge refs =====
    const mergedRef = useCallback(
      (node: HTMLDivElement | null) => {
        (listboxRef as React.MutableRefObject<HTMLDivElement | null>).current =
          node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }
      },
      [ref]
    );

    // ===== Focused option ID for aria-activedescendant =====
    const activeDescendantId = focusedValue
      ? `${listboxId}-option-${focusedValue}`
      : undefined;

    return (
      <ListboxContext.Provider value={contextValue}>
        <div
          ref={mergedRef}
          role="listbox"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-orientation={orientation}
          aria-multiselectable={multiple || undefined}
          aria-disabled={disabled || undefined}
          aria-activedescendant={activeDescendantId}
          tabIndex={disabled && !discoverable ? -1 : 0}
          className={`compa11y-listbox ${className}`.trim()}
          data-compa11y-listbox=""
          data-orientation={orientation}
          data-disabled={disabled ? 'true' : undefined}
          data-multiple={multiple ? 'true' : undefined}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={
            unstyled
              ? {}
              : {
                  width: 'var(--compa11y-listbox-width, 250px)',
                  maxHeight: 'var(--compa11y-listbox-max-height, 300px)',
                  overflowY: 'auto' as const,
                  border: 'var(--compa11y-listbox-border, 1px solid #e0e0e0)',
                  borderRadius: 'var(--compa11y-listbox-radius, 4px)',
                  background: 'var(--compa11y-listbox-bg, white)',
                  padding: 'var(--compa11y-listbox-padding, 0.25rem 0)',
                  ...(disabled
                    ? {
                        opacity: 'var(--compa11y-listbox-disabled-opacity, 0.5)' as any,
                        cursor: 'not-allowed',
                      }
                    : {}),
                }
          }
        >
          {children}
        </div>
      </ListboxContext.Provider>
    );
  }
);

Listbox.displayName = 'Listbox';

// ============================================================================
// ListboxOption
// ============================================================================

export const ListboxOption = forwardRef<HTMLDivElement, ListboxOptionProps>(
  function ListboxOption(
    {
      value,
      disabled: localDisabled = false,
      discoverable: _,
      unstyled: localUnstyled,
      className = '',
      children,
      'aria-label': ariaLabel,
    },
    ref
  ) {
    const context = useListboxContext();
    const { groupDisabled } = useContext(ListboxGroupContext);

    const disabled = context.disabled || groupDisabled || localDisabled;
    const unstyled = localUnstyled ?? context.unstyled;
    const selected = context.isSelected(value);
    const focused = context.focusedValue === value;

    const optionId = `${context.listboxId}-option-${value}`;

    // Get label text from children
    const labelRef = useRef<string>('');
    const optionRef = useRef<HTMLDivElement>(null);

    const mergedRef = useCallback(
      (node: HTMLDivElement | null) => {
        (optionRef as React.MutableRefObject<HTMLDivElement | null>).current =
          node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }
      },
      [ref]
    );

    // Register/unregister with parent
    useEffect(() => {
      const label =
        typeof children === 'string'
          ? children
          : optionRef.current?.textContent?.trim() || value;
      labelRef.current = label;
      context.registerOption(value, disabled, label);
      return () => context.unregisterOption(value);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    // Update disabled state
    useEffect(() => {
      context.updateOptionDisabled(value, disabled);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [disabled, value]);

    const handleClick = useCallback(
      (event: React.MouseEvent) => {
        if (disabled) {
          event.preventDefault();
          return;
        }
        context.onFocusOption(value);
        context.onSelect(value);
      },
      [disabled, context, value]
    );

    return (
      <div
        ref={mergedRef}
        id={optionId}
        role="option"
        aria-selected={selected}
        aria-disabled={disabled || undefined}
        aria-label={ariaLabel}
        className={`compa11y-listbox-option ${className}`.trim()}
        data-compa11y-listbox-option=""
        data-value={value}
        data-selected={selected ? 'true' : 'false'}
        data-focused={focused ? 'true' : 'false'}
        data-disabled={disabled ? 'true' : undefined}
        onClick={handleClick}
        style={
          unstyled
            ? {
                cursor: disabled ? 'not-allowed' : 'pointer',
              }
            : {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding:
                  'var(--compa11y-listbox-option-padding, 0.5rem 0.75rem)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                userSelect: 'none' as const,
                transition: 'background 0.1s ease',
                background: focused
                  ? selected
                    ? 'var(--compa11y-listbox-option-selected-hover-bg, #cce0ff)'
                    : 'var(--compa11y-listbox-option-hover-bg, #f5f5f5)'
                  : selected
                    ? 'var(--compa11y-listbox-option-selected-bg, #e6f0ff)'
                    : 'transparent',
                fontWeight: selected ? 500 : 'normal',
                opacity: disabled ? 0.5 : 1,
              }
        }
      >
        <span style={{ flex: 1 }}>{children}</span>
        {selected && !unstyled && (
          <span
            aria-hidden="true"
            style={{
              fontSize: '0.875rem',
              color: 'var(--compa11y-listbox-check-color, #0066cc)',
              marginLeft: '0.5rem',
            }}
          >
            &#10003;
          </span>
        )}
      </div>
    );
  }
);

ListboxOption.displayName = 'ListboxOption';

// ============================================================================
// ListboxGroup
// ============================================================================

export const ListboxGroup = forwardRef<HTMLDivElement, ListboxGroupProps>(
  function ListboxGroup(
    {
      label,
      disabled: groupDisabled = false,
      unstyled: localUnstyled,
      className = '',
      children,
    },
    ref
  ) {
    const context = useListboxContext();
    const unstyled = localUnstyled ?? context.unstyled;
    const labelId = useId('listbox-group');

    const groupContextValue = useMemo(
      () => ({ groupDisabled: context.disabled || groupDisabled }),
      [context.disabled, groupDisabled]
    );

    return (
      <ListboxGroupContext.Provider value={groupContextValue}>
        <div
          ref={ref}
          role="group"
          aria-labelledby={labelId}
          aria-disabled={groupDisabled || undefined}
          className={`compa11y-listbox-group ${className}`.trim()}
          data-compa11y-listbox-group=""
          data-disabled={groupDisabled ? 'true' : undefined}
          style={
            unstyled
              ? {}
              : {
                  opacity: groupDisabled ? 0.5 : 1,
                }
          }
        >
          <div
            id={labelId}
            role="presentation"
            style={
              unstyled
                ? {}
                : {
                    padding:
                      'var(--compa11y-listbox-group-label-padding, 0.5rem 0.75rem 0.25rem)',
                    fontSize:
                      'var(--compa11y-listbox-group-label-size, 0.75rem)',
                    fontWeight: 600,
                    color:
                      'var(--compa11y-listbox-group-label-color, #666)',
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.05em',
                  }
            }
          >
            {label}
          </div>
          {children}
        </div>
      </ListboxGroupContext.Provider>
    );
  }
);

ListboxGroup.displayName = 'ListboxGroup';

// ============================================================================
// Compound Component
// ============================================================================

export const ListboxCompound = Object.assign(Listbox, {
  Option: ListboxOption,
  Group: ListboxGroup,
});
