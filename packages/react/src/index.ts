/**
 * @compa11y/react
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
  useFocusNeighbor,
  useFocusReturn,
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
// Select
// ============================================================================

export {
  SelectCompound as Select,
  Select as SelectBase,
  SelectTrigger,
  SelectListbox,
  SelectOptionItem,
  type SelectProps,
  type SelectTriggerProps,
  type SelectListboxProps,
  type SelectOptionProps,
  type SelectOptionType,
} from './components/select';

// ============================================================================
// Checkbox
// ============================================================================

export {
  CheckboxCompound as Checkbox,
  Checkbox as CheckboxBase,
  CheckboxGroup,
  CheckboxIndicator,
  useCheckboxGroupContext,
  type CheckboxProps,
  type CheckboxGroupProps,
  type CheckboxIndicatorProps,
  type CheckboxGroupContextValue,
} from './components/checkbox';

// ============================================================================
// RadioGroup
// ============================================================================

export {
  RadioGroupCompound as RadioGroup,
  RadioGroup as RadioGroupBase,
  Radio,
  useRadioGroupContext,
  type RadioGroupProps,
  type RadioProps,
  type RadioGroupContextValue,
} from './components/radio-group';

// ============================================================================
// Switch
// ============================================================================

export { Switch, type SwitchProps } from './components/switch';

// ============================================================================
// Listbox
// ============================================================================

export {
  ListboxCompound as Listbox,
  Listbox as ListboxBase,
  ListboxOption,
  ListboxGroup,
  useListboxContext,
  type ListboxProps,
  type ListboxOptionProps,
  type ListboxGroupProps,
  type ListboxContextValue,
} from './components/listbox';

// ============================================================================
// Input
// ============================================================================

export {
  InputCompound as Input,
  Input as InputBase,
  InputLabel,
  InputField,
  InputHint,
  InputError,
  useInputContext,
  type InputProps,
  type InputFieldProps,
  type InputLabelProps,
  type InputHintProps,
  type InputErrorProps,
  type InputContextValue,
} from './components/input';

// ============================================================================
// Button
// ============================================================================

export { Button, type ButtonProps } from './components/button';

// ============================================================================
// Textarea
// ============================================================================

export {
  TextareaCompound as Textarea,
  Textarea as TextareaBase,
  TextareaLabel,
  TextareaField,
  TextareaHint,
  TextareaError,
  useTextareaContext,
  type TextareaProps,
  type TextareaFieldProps,
  type TextareaLabelProps,
  type TextareaHintProps,
  type TextareaErrorProps,
  type TextareaContextValue,
} from './components/textarea';

// ============================================================================
// VisuallyHidden
// ============================================================================

export {
  VisuallyHidden,
  type VisuallyHiddenProps,
} from './components/visually-hidden';

// ============================================================================
// SkipLink
// ============================================================================

export {
  SkipLink,
  type SkipLinkProps,
} from './components/skip-link';

// ============================================================================
// Alert
// ============================================================================

export {
  Alert,
  type AlertProps,
  type AlertType,
} from './components/alert';

// ============================================================================
// Link
// ============================================================================

export {
  Link,
  type LinkProps,
} from './components/link';

// ============================================================================
// Text / Heading
// ============================================================================

export {
  Heading,
  Text,
  type HeadingProps,
  type TextProps,
} from './components/text';

// ============================================================================
// Popover
// ============================================================================

export {
  Popover,
  PopoverCompound,
  usePopoverContext,
  type PopoverProps,
  type PopoverTriggerProps,
  type PopoverContentProps,
  type PopoverCloseProps,
  type PopoverPlacement,
  type PopoverContextValue,
} from './components/popover';

// ============================================================================
// Accordion
// ============================================================================

export {
  AccordionCompound as Accordion,
  Accordion as AccordionBase,
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionContent,
  useAccordionContext,
  useAccordionItemContext,
  type AccordionProps,
  type AccordionItemProps,
  type AccordionHeaderProps,
  type AccordionTriggerProps,
  type AccordionContentProps,
  type AccordionContextValue,
  type AccordionItemContextValue,
} from './components/accordion';

// ============================================================================
// Table
// ============================================================================

export {
  TableCompound as Table,
  Table as TableBase,
  TableHead,
  TableBody,
  TableFoot,
  TableRow,
  TableHeader,
  TableCell,
  TableSelectAllCell,
  TableSelectCell,
  TableEmptyState,
  TableLoadingState,
  useTableContext,
  useTableSectionContext,
  useTableRowContext,
  type TableProps,
  type TableHeadProps,
  type TableBodyProps,
  type TableFootProps,
  type TableRowProps,
  type TableHeaderProps,
  type TableCellProps,
  type TableSelectAllCellProps,
  type TableSelectCellProps,
  type TableEmptyStateProps,
  type TableLoadingStateProps,
  type SortDirection,
  type TableSection,
  type TableContextValue,
  type TableSectionContextValue,
  type TableRowContextValue,
} from './components/table';

// ============================================================================
// FormField
// ============================================================================

export {
  FormField,
  FormFieldCompound,
  useFormFieldContext,
  type FormFieldProps,
  type FormFieldLabelProps,
  type FormFieldHintProps,
  type FormFieldErrorProps,
  type FormFieldControlProps,
  type FormFieldControlRenderProps,
  type FormFieldContextValue,
} from './components/form-field';

// ============================================================================
// Pagination
// ============================================================================

export {
  Pagination,
  getPageRange,
  type PaginationProps,
} from './components/pagination';

// ============================================================================
// Breadcrumbs
// ============================================================================

export {
  Breadcrumbs,
  type BreadcrumbItem,
  type BreadcrumbsProps,
} from './components/breadcrumbs';

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
} from '@compa11y/core';
