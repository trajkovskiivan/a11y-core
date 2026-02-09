/**
 * @a11y-core/react
 *
 * Accessible React components that just work
 */

// ============================================================================
// Hooks
// ============================================================================

export {
  useId,
  useIds,
  useIdScope,
  useFocusTrap,
  useFocusTrapControls,
  useAnnouncer,
  useAnnounceOnChange,
  useAnnounceLoading,
  useKeyboard,
  useMenuKeyboard,
  useTabsKeyboard,
  useGridKeyboard,
  useTypeAhead,
  useKeyPressed,
  useFocusVisible,
  useFocusManager,
  useFocusControl,
  useFocusWithin,
  useRovingTabindex,
  useRovingTabindexMap,
  type UseFocusTrapOptions,
  type UseRovingTabindexOptions,
  type RovingTabindexItem,
} from './hooks';

// ============================================================================
// Dialog
// ============================================================================

export {
  DialogCompound as Dialog,
  Dialog as DialogBase,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogContent,
  DialogActions,
  useDialogContext,
  type DialogProps,
  type DialogTriggerProps,
  type DialogTitleProps,
  type DialogDescriptionProps,
  type DialogCloseProps,
  type DialogContentProps,
  type DialogActionsProps,
  type DialogContextValue,
} from './components/dialog';

// ============================================================================
// ActionMenu
// ============================================================================

export {
  ActionMenuCompound as ActionMenu,
  ActionMenu as ActionMenuBase,
  ActionMenuTrigger,
  ActionMenuContent,
  ActionMenuItem,
  ActionMenuSeparator,
  ActionMenuLabel,
  useActionMenuContext,
  type ActionMenuProps,
  type ActionMenuTriggerProps,
  type ActionMenuContentProps,
  type ActionMenuItemProps,
  type ActionMenuSeparatorProps,
  type ActionMenuLabelProps,
  type ActionMenuContextValue,
} from './components/menu';

// ============================================================================
// Tabs
// ============================================================================

export {
  TabsCompound as Tabs,
  Tabs as TabsBase,
  TabList,
  Tab,
  TabPanel,
  useTabsContext,
  type TabsProps,
  type TabListProps,
  type TabProps,
  type TabPanelProps,
  type TabsContextValue,
} from './components/tabs';

// ============================================================================
// Toast
// ============================================================================

export {
  ToastProvider,
  ToastViewport,
  useToast,
  useToastHelpers,
  type Toast,
  type ToastType,
  type ToastProviderProps,
  type ToastViewportProps,
} from './components/toast';

// ============================================================================
// Combobox
// ============================================================================

export {
  ComboboxCompound as Combobox,
  Combobox as ComboboxBase,
  ComboboxInput,
  ComboboxListbox,
  ComboboxOption,
  type ComboboxProps,
  type ComboboxInputProps,
  type ComboboxListboxProps,
  type ComboboxOptionProps,
  type ComboboxOptionType,
} from './components/combobox';

// ============================================================================
// Switch
// ============================================================================

export { Switch, type SwitchProps } from './components/switch';

// ============================================================================
// Re-export core utilities
// ============================================================================

export {
  // ARIA utilities
  aria,
  buildAriaProps,
  mergeAriaIds,
  hasAccessibleName,
  // Dev warnings
  warn,
  setWarningHandler,
  checks,
  createComponentWarnings,
  // Announcer
  announce,
  announcePolite,
  announceAssertive,
  announceStatus,
  announceError,
  announceProgress,
  // Platform detection
  isBrowser,
  isMac,
  isIOS,
  isAndroid,
  prefersReducedMotion,
  prefersHighContrast,
  prefersDarkMode,
} from '@a11y-core/core';
