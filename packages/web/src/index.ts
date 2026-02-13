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
import { A11yDialog } from './components/dialog';
import { A11yMenu } from './components/menu';
import { A11yTabs } from './components/tabs';
import { A11yCombobox } from './components/combobox';
import { A11ySwitch } from './components/switch';
import { A11yCheckbox } from './components/checkbox';
import { A11ySelect } from './components/select';
import { A11yInput } from './components/input';
import { A11yTextarea } from './components/textarea';
import { A11yButton } from './components/button';
import { A11yRadioGroup, A11yRadio } from './components/radio-group';
import { A11yListbox, A11yOption, A11yOptgroup } from './components/listbox';

// Re-export components
export { A11yDialog, A11yMenu, A11yTabs, A11yCombobox, A11ySwitch, A11yCheckbox, A11ySelect, A11yInput, A11yTextarea, A11yButton, A11yRadioGroup, A11yRadio, A11yListbox, A11yOption, A11yOptgroup };

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
    A11yDialog,
    A11yMenu,
    A11yTabs,
    A11yCombobox,
    A11ySwitch,
    A11yCheckbox,
    A11ySelect,
    A11yInput,
    A11yTextarea,
    A11yButton,
    A11yRadioGroup,
    A11yRadio,
    A11yListbox,
    A11yOption,
    A11yOptgroup,
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
