import React, { forwardRef, useCallback, useRef, useState } from 'react';
import { useId } from '../../hooks/use-id';
import { useKeyboard } from '../../hooks/use-keyboard';
import { useAnnouncer } from '../../hooks/use-announcer';
import {
  TabsProvider,
  useTabsContext,
  type TabsContextValue,
} from './tabs-context';

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Default selected tab value */
  defaultValue?: string;
  /** Controlled selected value */
  value?: string;
  /** Called when selection changes */
  onValueChange?: (value: string) => void;
  /** Orientation of tabs */
  orientation?: 'horizontal' | 'vertical';
  /** Activation mode */
  activationMode?: 'automatic' | 'manual';
  children: React.ReactNode;
}

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  {
    defaultValue = '',
    value: controlledValue,
    onValueChange,
    orientation = 'horizontal',
    activationMode = 'automatic',
    children,
    ...props
  },
  ref
) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const selectedValue = controlledValue ?? uncontrolledValue;
  const tabsRef = useRef<string[]>([]);
  const baseId = useId('tabs');

  const setSelectedValue = useCallback(
    (value: string) => {
      if (controlledValue === undefined) {
        setUncontrolledValue(value);
      }
      onValueChange?.(value);
    },
    [controlledValue, onValueChange]
  );

  const registerTab = useCallback((value: string) => {
    if (!tabsRef.current.includes(value)) {
      tabsRef.current.push(value);
    }
  }, []);

  const unregisterTab = useCallback((value: string) => {
    const index = tabsRef.current.indexOf(value);
    if (index > -1) {
      tabsRef.current.splice(index, 1);
    }
  }, []);

  const getTabValues = useCallback(() => [...tabsRef.current], []);

  const contextValue: TabsContextValue = {
    selectedValue,
    setSelectedValue,
    baseId,
    orientation,
    activationMode,
    registerTab,
    unregisterTab,
    getTabValues,
  };

  return (
    <TabsProvider value={contextValue}>
      <div
        ref={ref}
        data-orientation={orientation}
        data-compa11y-tabs
        {...props}
      >
        {children}
      </div>
    </TabsProvider>
  );
});

export interface TabListProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Accessible label for the tab list */
  'aria-label'?: string;
  children: React.ReactNode;
}

export const TabList = forwardRef<HTMLDivElement, TabListProps>(
  function TabList(
    { children, 'aria-label': ariaLabel, onKeyDown, ...props },
    ref
  ) {
    const {
      orientation,
      selectedValue,
      setSelectedValue,
      getTabValues,
      activationMode,
    } = useTabsContext();

    const navigateToTab = useCallback(
      (direction: 'next' | 'previous' | 'first' | 'last') => {
        const values = getTabValues();
        if (values.length === 0) return;

        const currentIndex = values.indexOf(selectedValue);
        let newIndex: number;

        switch (direction) {
          case 'next':
            newIndex = (currentIndex + 1) % values.length;
            break;
          case 'previous':
            newIndex = (currentIndex - 1 + values.length) % values.length;
            break;
          case 'first':
            newIndex = 0;
            break;
          case 'last':
            newIndex = values.length - 1;
            break;
        }

        const newValue = values[newIndex];
        if (newValue) {
          const tabElement = document.querySelector(
            `[data-compa11y-tab][data-value="${newValue}"]`
          ) as HTMLElement;
          tabElement?.focus();

          if (activationMode === 'automatic') {
            setSelectedValue(newValue);
          }
        }
      },
      [getTabValues, selectedValue, setSelectedValue, activationMode]
    );

    const keyboardProps = useKeyboard(
      {
        ArrowRight: () => {
          if (orientation === 'horizontal') navigateToTab('next');
        },
        ArrowLeft: () => {
          if (orientation === 'horizontal') navigateToTab('previous');
        },
        ArrowDown: () => {
          if (orientation === 'vertical') navigateToTab('next');
        },
        ArrowUp: () => {
          if (orientation === 'vertical') navigateToTab('previous');
        },
        Home: () => navigateToTab('first'),
        End: () => navigateToTab('last'),
      },
      { preventDefault: true }
    );

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      if (!event.defaultPrevented) {
        keyboardProps.onKeyDown(event);
      }
    };

    return (
      <div
        ref={ref}
        role="tablist"
        aria-label={ariaLabel}
        aria-orientation={orientation}
        onKeyDown={handleKeyDown}
        data-compa11y-tablist
        {...props}
      >
        {children}
      </div>
    );
  }
);

export interface TabProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'value'
> {
  /** Value identifying this tab */
  value: string;
  /** Whether the tab is disabled */
  disabled?: boolean;
  children: React.ReactNode;
}

export const Tab = forwardRef<HTMLButtonElement, TabProps>(function Tab(
  { value, disabled = false, children, onClick, ...props },
  ref
) {
  const {
    selectedValue,
    setSelectedValue,
    baseId,
    registerTab,
    unregisterTab,
  } = useTabsContext();
  const { announce } = useAnnouncer();

  React.useEffect(() => {
    registerTab(value);
    return () => unregisterTab(value);
  }, [value, registerTab, unregisterTab]);

  const isSelected = selectedValue === value;
  const tabId = `${baseId}-tab-${value}`;
  const panelId = `${baseId}-panel-${value}`;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented && !disabled) {
      setSelectedValue(value);
      announce(`${value} tab selected`);
    }
  };

  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      id={tabId}
      aria-selected={isSelected}
      aria-controls={panelId}
      aria-disabled={disabled}
      tabIndex={isSelected ? 0 : -1}
      onClick={handleClick}
      disabled={disabled}
      data-selected={isSelected}
      data-disabled={disabled}
      data-value={value}
      data-compa11y-tab
      {...props}
    >
      {children}
    </button>
  );
});

export interface TabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Value identifying this panel (must match a Tab value) */
  value: string;
  /** Whether to keep panel mounted when not selected */
  forceMount?: boolean;
  children: React.ReactNode;
}

export const TabPanel = forwardRef<HTMLDivElement, TabPanelProps>(
  function TabPanel({ value, forceMount = false, children, ...props }, ref) {
    const { selectedValue, baseId } = useTabsContext();

    const isSelected = selectedValue === value;
    const tabId = `${baseId}-tab-${value}`;
    const panelId = `${baseId}-panel-${value}`;

    if (!isSelected && !forceMount) {
      return null;
    }

    return (
      <div
        ref={ref}
        role="tabpanel"
        id={panelId}
        aria-labelledby={tabId}
        tabIndex={0}
        hidden={!isSelected}
        data-selected={isSelected}
        data-compa11y-tabpanel
        {...props}
      >
        {children}
      </div>
    );
  }
);

export const TabsCompound = Object.assign(Tabs, {
  List: TabList,
  Tab: Tab,
  Panel: TabPanel,
});
