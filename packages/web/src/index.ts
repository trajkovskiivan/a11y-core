/**
 * @compa11y/web
 *
 * Accessible Web Components for any HTML page
 *
 * Usage via CDN:
 * <script src="https://unpkg.com/@compa11y/web"></script>
 *
 * Or import specific components:
 * import '@compa11y/web/dialog';
 */

// Components - importing auto-registers them as custom elements
import { Compa11yDialog } from './components/dialog';
import { Compa11yMenu } from './components/menu';
import { Compa11yTabs } from './components/tabs';
import { Compa11yCombobox } from './components/combobox';
import { Compa11ySwitch } from './components/switch';
import { Compa11ySelect } from './components/select';
import { Compa11yInput } from './components/input';
import { Compa11yTextarea } from './components/textarea';
import { Compa11yButton } from './components/button';
import { Compa11yListbox, Compa11yOption, Compa11yOptgroup } from './components/listbox';
import { Compa11yCheckbox, Compa11yCheckboxGroup } from './components/checkbox';
import { Compa11yRadioGroup, Compa11yRadio } from './components/radio-group';
import { Compa11yToast } from './components/toast';
import { Compa11yVisuallyHidden } from './components/visually-hidden';
import { Compa11ySkipLink } from './components/skip-link';
import { Compa11yAlert } from './components/alert';
import { Compa11yLink } from './components/link';
import { Compa11yHeading, Compa11yText } from './components/text';
import { Compa11yFormField } from './components/form-field';
import { Compa11yPopover } from './components/popover';
import { Compa11yAccordion } from './components/accordion';
import { Compa11yTable } from './components/table';
import { Compa11yPagination } from './components/pagination';
import { Compa11yBreadcrumbs } from './components/breadcrumbs';

// Re-export components
export {
  Compa11yDialog,
  Compa11yMenu,
  Compa11yTabs,
  Compa11yCombobox,
  Compa11ySwitch,
  Compa11ySelect,
  Compa11yInput,
  Compa11yTextarea,
  Compa11yButton,
  Compa11yListbox,
  Compa11yOption,
  Compa11yOptgroup,
  Compa11yCheckbox,
  Compa11yCheckboxGroup,
  Compa11yRadioGroup,
  Compa11yRadio,
  Compa11yToast,
  Compa11yVisuallyHidden,
  Compa11ySkipLink,
  Compa11yAlert,
  Compa11yLink,
  Compa11yHeading,
  Compa11yText,
  Compa11yFormField,
  Compa11yPopover,
  Compa11yAccordion,
  Compa11yTable,
  Compa11yPagination,
  Compa11yBreadcrumbs,
};

// Core utilities for vanilla JS usage
import {
  // Announcer
  initAnnouncer,
  announce,
  announcePolite,
  announceAssertive,
  announceStatus,
  announceError,
  // Focus
  initFocusVisible,
  createFocusTrap,
  createFocusScope,
  createRovingTabindex,
  // Keyboard
  createKeyboardManager,
  KeyboardPatterns,
  createTypeAhead,
  // ARIA
  aria,
  buildAriaProps,
  hasAccessibleName,
  // Platform
  isBrowser,
  prefersReducedMotion,
  prefersHighContrast,
  prefersDarkMode,
} from '@compa11y/core';

// Re-export core utilities
export {
  initAnnouncer,
  announce,
  announcePolite,
  announceAssertive,
  announceStatus,
  announceError,
  initFocusVisible,
  createFocusTrap,
  createFocusScope,
  createRovingTabindex,
  createKeyboardManager,
  KeyboardPatterns,
  createTypeAhead,
  aria,
  buildAriaProps,
  hasAccessibleName,
  isBrowser,
  prefersReducedMotion,
  prefersHighContrast,
  prefersDarkMode,
};

// Initialize core systems when script loads
if (typeof window !== 'undefined') {
  const init = () => {
    initAnnouncer();
    initFocusVisible();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose on window for CDN usage (IIFE bundle)
  // This allows: compa11y.announcePolite('message')
  (window as any).compa11y = {
    // Components (classes)
    Compa11yDialog,
    Compa11yMenu,
    Compa11yTabs,
    Compa11yCombobox,
    Compa11ySwitch,
    Compa11ySelect,
    Compa11yInput,
    Compa11yTextarea,
    Compa11yButton,
    Compa11yListbox,
    Compa11yOption,
    Compa11yOptgroup,
    Compa11yCheckbox,
    Compa11yCheckboxGroup,
    Compa11yRadioGroup,
    Compa11yRadio,
    Compa11yToast,
    Compa11yVisuallyHidden,
    Compa11ySkipLink,
    Compa11yAlert,
    Compa11yLink,
    Compa11yHeading,
    Compa11yText,
    Compa11yFormField,
    Compa11yPopover,
    Compa11yAccordion,
    Compa11yTable,
    Compa11yPagination,
    Compa11yBreadcrumbs,
    // Announcer utilities
    initAnnouncer,
    announce,
    announcePolite,
    announceAssertive,
    announceStatus,
    announceError,
    // Focus utilities
    initFocusVisible,
    createFocusTrap,
    createFocusScope,
    createRovingTabindex,
    // Keyboard utilities
    createKeyboardManager,
    KeyboardPatterns,
    createTypeAhead,
    // ARIA utilities
    aria,
    buildAriaProps,
    hasAccessibleName,
    // Platform detection
    isBrowser,
    prefersReducedMotion,
    prefersHighContrast,
    prefersDarkMode,
  };
}
