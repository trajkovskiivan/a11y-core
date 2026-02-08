/**
 * Shared styles for A11yKit Web Components
 */

export const VISUALLY_HIDDEN_STYLES = `
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

export const RESET_BUTTON_STYLES = `
  appearance: none;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  font: inherit;
  color: inherit;
  cursor: pointer;
`;

export const FOCUS_VISIBLE_STYLES = `
  :host(:focus-visible),
  :focus-visible {
    outline: 2px solid var(--a11ykit-focus-color, #0066cc);
    outline-offset: 2px;
  }
`;

/**
 * Base styles shared by all components
 */
export const BASE_STYLES = `
  :host {
    display: block;
    box-sizing: border-box;
  }

  :host([hidden]) {
    display: none !important;
  }

  *,
  *::before,
  *::after {
    box-sizing: inherit;
  }

  ${FOCUS_VISIBLE_STYLES}
`;

/**
 * Dialog-specific styles
 */
export const DIALOG_STYLES = `
  ${BASE_STYLES}

  :host {
    position: fixed;
    inset: 0;
    z-index: var(--a11ykit-dialog-z-index, 9999);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .overlay {
    position: absolute;
    inset: 0;
    background: var(--a11ykit-dialog-overlay-bg, rgba(0, 0, 0, 0.5));
  }

  .dialog {
    position: relative;
    background: var(--a11ykit-dialog-bg, white);
    border-radius: var(--a11ykit-dialog-radius, 8px);
    padding: var(--a11ykit-dialog-padding, 1.5rem);
    max-width: var(--a11ykit-dialog-max-width, 500px);
    max-height: var(--a11ykit-dialog-max-height, 85vh);
    overflow: auto;
    box-shadow: var(--a11ykit-dialog-shadow, 0 25px 50px -12px rgba(0, 0, 0, 0.25));
  }

  ::slotted([slot="title"]) {
    margin: 0 0 0.5rem 0;
    font-size: 1.25rem;
    font-weight: 600;
  }

  ::slotted([slot="description"]) {
    margin: 0 0 1rem 0;
    color: var(--a11ykit-dialog-description-color, #666);
  }
`;

/**
 * Menu-specific styles
 */
export const MENU_STYLES = `
  ${BASE_STYLES}

  :host {
    position: relative;
    display: inline-block;
  }

  .menu-content {
    position: absolute;
    top: 100%;
    left: 0;
    z-index: var(--a11ykit-menu-z-index, 1000);
    min-width: var(--a11ykit-menu-min-width, 160px);
    background: var(--a11ykit-menu-bg, white);
    border: var(--a11ykit-menu-border, 1px solid #e0e0e0);
    border-radius: var(--a11ykit-menu-radius, 4px);
    box-shadow: var(--a11ykit-menu-shadow, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
    padding: var(--a11ykit-menu-padding, 0.25rem 0);
    margin-top: var(--a11ykit-menu-offset, 4px);
  }

  .menu-content[hidden] {
    display: none;
  }

  ::slotted([role="menuitem"]) {
    display: block;
    width: 100%;
    padding: 0.5rem 1rem;
    text-align: left;
    background: none;
    border: none;
    cursor: pointer;
    font: inherit;
  }

  ::slotted([role="menuitem"]:hover),
  ::slotted([role="menuitem"][data-highlighted="true"]) {
    background: var(--a11ykit-menu-item-hover-bg, #f5f5f5);
  }

  ::slotted([role="menuitem"][aria-disabled="true"]) {
    opacity: 0.5;
    cursor: not-allowed;
  }

  ::slotted([role="separator"]) {
    height: 1px;
    margin: 0.25rem 0;
    background: var(--a11ykit-menu-separator-color, #e0e0e0);
  }
`;

/**
 * Tabs-specific styles
 */
export const TABS_STYLES = `
  ${BASE_STYLES}

  .tablist {
    display: flex;
    border-bottom: var(--a11ykit-tabs-border, 1px solid #e0e0e0);
    gap: var(--a11ykit-tabs-gap, 0);
  }

  :host([orientation="vertical"]) .tablist {
    flex-direction: column;
    border-bottom: none;
    border-right: var(--a11ykit-tabs-border, 1px solid #e0e0e0);
  }

  ::slotted([role="tab"]) {
    ${RESET_BUTTON_STYLES}
    padding: var(--a11ykit-tab-padding, 0.75rem 1rem);
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
    font-weight: 500;
    color: var(--a11ykit-tab-color, #666);
    transition: all 0.15s ease;
  }

  ::slotted([role="tab"]:hover) {
    color: var(--a11ykit-tab-hover-color, #333);
  }

  ::slotted([role="tab"][aria-selected="true"]) {
    color: var(--a11ykit-tab-active-color, #0066cc);
    border-bottom-color: currentColor;
  }

  ::slotted([role="tab"][aria-disabled="true"]) {
    opacity: 0.5;
    cursor: not-allowed;
  }

  ::slotted([role="tabpanel"]) {
    padding: var(--a11ykit-tabpanel-padding, 1rem 0);
  }

  ::slotted([role="tabpanel"][hidden]) {
    display: none;
  }
`;

/**
 * Combobox-specific styles
 */
export const COMBOBOX_STYLES = `
  ${BASE_STYLES}

  :host {
    display: inline-block;
    position: relative;
    width: var(--a11ykit-combobox-width, 250px);
  }

  .combobox-wrapper {
    position: relative;
  }

  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  input {
    width: 100%;
    padding: var(--a11ykit-combobox-input-padding, 0.5rem 2rem 0.5rem 0.75rem);
    border: var(--a11ykit-combobox-border, 1px solid #ccc);
    border-radius: var(--a11ykit-combobox-radius, 4px);
    font: inherit;
    background: var(--a11ykit-combobox-bg, white);
    color: var(--a11ykit-combobox-color, inherit);
  }

  input:focus {
    outline: 2px solid var(--a11ykit-focus-color, #0066cc);
    outline-offset: -1px;
    border-color: var(--a11ykit-focus-color, #0066cc);
  }

  input::placeholder {
    color: var(--a11ykit-combobox-placeholder-color, #999);
  }

  input:disabled {
    background: var(--a11ykit-combobox-disabled-bg, #f5f5f5);
    cursor: not-allowed;
    opacity: 0.7;
  }

  .chevron {
    position: absolute;
    right: 0.5rem;
    pointer-events: none;
    font-size: 0.75rem;
    color: var(--a11ykit-combobox-chevron-color, #666);
    transition: transform 0.15s ease;
  }

  :host([open]) .chevron {
    transform: rotate(180deg);
  }

  .clear-button {
    ${RESET_BUTTON_STYLES}
    position: absolute;
    right: 1.5rem;
    width: 1.25rem;
    height: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-size: 1rem;
    color: var(--a11ykit-combobox-clear-color, #666);
  }

  .clear-button:hover {
    background: var(--a11ykit-combobox-clear-hover-bg, rgba(0, 0, 0, 0.1));
  }

  .clear-button[hidden] {
    display: none;
  }

  .listbox {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: var(--a11ykit-combobox-z-index, 1000);
    max-height: var(--a11ykit-combobox-max-height, 200px);
    overflow-y: auto;
    margin: 0;
    padding: var(--a11ykit-combobox-listbox-padding, 0.25rem 0);
    background: var(--a11ykit-combobox-listbox-bg, white);
    border: var(--a11ykit-combobox-listbox-border, 1px solid #e0e0e0);
    border-radius: var(--a11ykit-combobox-radius, 4px);
    box-shadow: var(--a11ykit-combobox-shadow, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
    list-style: none;
  }

  /* Flip chevron when listbox is positioned above */
  :host([data-position="top"]) .chevron {
    transform: rotate(180deg);
  }

  :host([data-position="top"][open]) .chevron {
    transform: rotate(0deg);
  }

  .listbox[hidden] {
    display: none;
  }

  .listbox li[role="option"] {
    padding: var(--a11ykit-combobox-option-padding, 0.5rem 0.75rem);
    cursor: pointer;
    transition: background 0.1s ease;
  }

  .listbox li[role="option"]:hover,
  .listbox li[role="option"].highlighted {
    background: var(--a11ykit-combobox-option-hover-bg, #f5f5f5);
  }

  .listbox li[role="option"][aria-selected="true"] {
    background: var(--a11ykit-combobox-option-selected-bg, #e6f0ff);
    font-weight: 500;
  }

  .listbox li[role="option"].disabled,
  .listbox li[role="option"][aria-disabled="true"] {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .empty-message {
    padding: var(--a11ykit-combobox-option-padding, 0.5rem 0.75rem);
    color: var(--a11ykit-combobox-empty-color, #666);
    font-style: italic;
  }

  .options-source {
    display: none;
  }
`;
