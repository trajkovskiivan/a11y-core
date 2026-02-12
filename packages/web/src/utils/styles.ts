/**
 * Shared styles for compa11y Web Components
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
    outline: 2px solid var(--compa11y-focus-color, #0066cc);
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
    z-index: var(--compa11y-dialog-z-index, 9999);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .overlay {
    position: absolute;
    inset: 0;
    background: var(--compa11y-dialog-overlay-bg, rgba(0, 0, 0, 0.5));
  }

  .dialog {
    position: relative;
    background: var(--compa11y-dialog-bg, white);
    border-radius: var(--compa11y-dialog-radius, 8px);
    padding: var(--compa11y-dialog-padding, 1.5rem);
    max-width: var(--compa11y-dialog-max-width, 500px);
    max-height: var(--compa11y-dialog-max-height, 85vh);
    overflow: auto;
    box-shadow: var(--compa11y-dialog-shadow, 0 25px 50px -12px rgba(0, 0, 0, 0.25));
  }

  ::slotted([slot="title"]) {
    margin: 0 0 0.5rem 0;
    font-size: 1.25rem;
    font-weight: 600;
  }

  ::slotted([slot="description"]) {
    margin: 0 0 1rem 0;
    color: var(--compa11y-dialog-description-color, #666);
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
    z-index: var(--compa11y-menu-z-index, 1000);
    min-width: var(--compa11y-menu-min-width, 160px);
    background: var(--compa11y-menu-bg, white);
    border: var(--compa11y-menu-border, 1px solid #e0e0e0);
    border-radius: var(--compa11y-menu-radius, 4px);
    box-shadow: var(--compa11y-menu-shadow, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
    padding: var(--compa11y-menu-padding, 0.25rem 0);
    margin-top: var(--compa11y-menu-offset, 4px);
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
    background: var(--compa11y-menu-item-hover-bg, #f5f5f5);
  }

  ::slotted([role="menuitem"][aria-disabled="true"]) {
    opacity: 0.5;
    cursor: not-allowed;
  }

  ::slotted([role="separator"]) {
    height: 1px;
    margin: 0.25rem 0;
    background: var(--compa11y-menu-separator-color, #e0e0e0);
  }
`;

/**
 * Tabs-specific styles
 */
export const TABS_STYLES = `
  ${BASE_STYLES}

  .tablist {
    display: flex;
    border-bottom: var(--compa11y-tabs-border, 1px solid #e0e0e0);
    gap: var(--compa11y-tabs-gap, 0);
  }

  :host([orientation="vertical"]) .tablist {
    flex-direction: column;
    border-bottom: none;
    border-right: var(--compa11y-tabs-border, 1px solid #e0e0e0);
  }

  ::slotted([role="tab"]) {
    ${RESET_BUTTON_STYLES}
    padding: var(--compa11y-tab-padding, 0.75rem 1rem);
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
    font-weight: 500;
    color: var(--compa11y-tab-color, #666);
    transition: all 0.15s ease;
  }

  ::slotted([role="tab"]:hover) {
    color: var(--compa11y-tab-hover-color, #333);
  }

  ::slotted([role="tab"][aria-selected="true"]) {
    color: var(--compa11y-tab-active-color, #0066cc);
    border-bottom-color: currentColor;
  }

  ::slotted([role="tab"][aria-disabled="true"]) {
    opacity: 0.5;
    cursor: not-allowed;
  }

  ::slotted([role="tabpanel"]) {
    padding: var(--compa11y-tabpanel-padding, 1rem 0);
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
    width: var(--compa11y-combobox-width, 250px);
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
    padding: var(--compa11y-combobox-input-padding, 0.5rem 2rem 0.5rem 0.75rem);
    border: var(--compa11y-combobox-border, 1px solid #ccc);
    border-radius: var(--compa11y-combobox-radius, 4px);
    font: inherit;
    background: var(--compa11y-combobox-bg, white);
    color: var(--compa11y-combobox-color, inherit);
  }

  input:focus {
    outline: 2px solid var(--compa11y-focus-color, #0066cc);
    outline-offset: -1px;
    border-color: var(--compa11y-focus-color, #0066cc);
  }

  input::placeholder {
    color: var(--compa11y-combobox-placeholder-color, #999);
  }

  input:disabled {
    background: var(--compa11y-combobox-disabled-bg, #f5f5f5);
    cursor: not-allowed;
    opacity: 0.7;
  }

  .chevron {
    position: absolute;
    right: 0.5rem;
    pointer-events: none;
    font-size: 0.75rem;
    color: var(--compa11y-combobox-chevron-color, #666);
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
    color: var(--compa11y-combobox-clear-color, #666);
  }

  .clear-button:hover {
    background: var(--compa11y-combobox-clear-hover-bg, rgba(0, 0, 0, 0.1));
  }

  .clear-button[hidden] {
    display: none;
  }

  .listbox {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: var(--compa11y-combobox-z-index, 1000);
    max-height: var(--compa11y-combobox-max-height, 200px);
    overflow-y: auto;
    margin: 0;
    padding: var(--compa11y-combobox-listbox-padding, 0.25rem 0);
    background: var(--compa11y-combobox-listbox-bg, white);
    border: var(--compa11y-combobox-listbox-border, 1px solid #e0e0e0);
    border-radius: var(--compa11y-combobox-radius, 4px);
    box-shadow: var(--compa11y-combobox-shadow, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
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
    padding: var(--compa11y-combobox-option-padding, 0.5rem 0.75rem);
    cursor: pointer;
    transition: background 0.1s ease;
  }

  .listbox li[role="option"]:hover,
  .listbox li[role="option"].highlighted {
    background: var(--compa11y-combobox-option-hover-bg, #f5f5f5);
  }

  .listbox li[role="option"][aria-selected="true"] {
    background: var(--compa11y-combobox-option-selected-bg, #e6f0ff);
    font-weight: 500;
  }

  .listbox li[role="option"].disabled,
  .listbox li[role="option"][aria-disabled="true"] {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .empty-message {
    padding: var(--compa11y-combobox-option-padding, 0.5rem 0.75rem);
    color: var(--compa11y-combobox-empty-color, #666);
    font-style: italic;
  }

  .options-source {
    display: none;
  }
`;

/**
 * Select-specific styles
 */
export const SELECT_STYLES = `
  ${BASE_STYLES}

  :host {
    display: inline-block;
    position: relative;
    width: var(--compa11y-select-width, 250px);
  }

  .select-wrapper {
    position: relative;
  }

  .select-trigger {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--compa11y-select-trigger-padding, 0.5rem 2rem 0.5rem 0.75rem);
    border: var(--compa11y-select-border, 1px solid #ccc);
    border-radius: var(--compa11y-select-radius, 4px);
    font: inherit;
    background: var(--compa11y-select-bg, white);
    color: var(--compa11y-select-color, inherit);
    cursor: pointer;
    text-align: left;
    position: relative;
    appearance: none;
  }

  .select-trigger:focus {
    outline: 2px solid var(--compa11y-focus-color, #0066cc);
    outline-offset: -1px;
    border-color: var(--compa11y-focus-color, #0066cc);
  }

  .select-trigger:disabled {
    background: var(--compa11y-select-disabled-bg, #f5f5f5);
    cursor: not-allowed;
    opacity: 0.7;
  }

  .select-value {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .select-value.placeholder {
    color: var(--compa11y-select-placeholder-color, #999);
  }

  .chevron {
    position: absolute;
    right: 0.5rem;
    pointer-events: none;
    font-size: 0.75rem;
    color: var(--compa11y-select-chevron-color, #666);
    transition: transform 0.15s ease;
  }

  :host([open]) .chevron {
    transform: rotate(180deg);
  }

  :host([data-position="top"]) .chevron {
    transform: rotate(180deg);
  }

  :host([data-position="top"][open]) .chevron {
    transform: rotate(0deg);
  }

  .listbox {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: var(--compa11y-select-z-index, 1000);
    max-height: var(--compa11y-select-max-height, 200px);
    overflow-y: auto;
    margin: 0;
    padding: var(--compa11y-select-listbox-padding, 0.25rem 0);
    background: var(--compa11y-select-listbox-bg, white);
    border: var(--compa11y-select-listbox-border, 1px solid #e0e0e0);
    border-radius: var(--compa11y-select-radius, 4px);
    box-shadow: var(--compa11y-select-shadow, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
    list-style: none;
    margin-top: 4px;
  }

  .listbox[hidden] {
    display: none;
  }

  .listbox li[role="option"] {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--compa11y-select-option-padding, 0.5rem 0.75rem);
    cursor: pointer;
    transition: background 0.1s ease;
  }

  .listbox li[role="option"]:hover,
  .listbox li[role="option"].highlighted {
    background: var(--compa11y-select-option-hover-bg, #f5f5f5);
  }

  .listbox li[role="option"][aria-selected="true"] {
    background: var(--compa11y-select-option-selected-bg, #e6f0ff);
    font-weight: 500;
  }

  .listbox li[role="option"].disabled,
  .listbox li[role="option"][aria-disabled="true"] {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .check-mark {
    font-size: 0.875rem;
    color: var(--compa11y-select-check-color, #0066cc);
    margin-left: 0.5rem;
  }

  .options-source {
    display: none;
  }
`;

/**
 * Switch-specific styles
 */
export const SWITCH_STYLES = `
  ${BASE_STYLES}

  :host {
    display: inline-block;
  }

  .switch-wrapper {
    display: inline-flex;
    align-items: center;
    gap: var(--compa11y-switch-gap, 0.5rem);
  }

  /* Size variants */
  .switch-wrapper.size-sm .switch-track {
    width: var(--compa11y-switch-width-sm, 32px);
    height: var(--compa11y-switch-height-sm, 18px);
  }

  .switch-wrapper.size-sm .switch-thumb {
    width: var(--compa11y-switch-thumb-sm, 14px);
    height: var(--compa11y-switch-thumb-sm, 14px);
  }

  .switch-wrapper.size-sm .switch-track.checked .switch-thumb {
    transform: translateX(14px);
  }

  .switch-wrapper.size-md .switch-track {
    width: var(--compa11y-switch-width-md, 44px);
    height: var(--compa11y-switch-height-md, 24px);
  }

  .switch-wrapper.size-md .switch-thumb {
    width: var(--compa11y-switch-thumb-md, 20px);
    height: var(--compa11y-switch-thumb-md, 20px);
  }

  .switch-wrapper.size-md .switch-track.checked .switch-thumb {
    transform: translateX(20px);
  }

  .switch-wrapper.size-lg .switch-track {
    width: var(--compa11y-switch-width-lg, 56px);
    height: var(--compa11y-switch-height-lg, 30px);
  }

  .switch-wrapper.size-lg .switch-thumb {
    width: var(--compa11y-switch-thumb-lg, 26px);
    height: var(--compa11y-switch-thumb-lg, 26px);
  }

  .switch-wrapper.size-lg .switch-track.checked .switch-thumb {
    transform: translateX(26px);
  }

  .switch-track {
    position: relative;
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
    padding: 2px;
    border: none;
    border-radius: var(--compa11y-switch-radius, 9999px);
    background: var(--compa11y-switch-bg, #d1d5db);
    cursor: pointer;
    transition: background-color 0.2s ease;
    outline: none;
  }

  .switch-track:focus-visible {
    outline: 2px solid var(--compa11y-focus-color, #0066cc);
    outline-offset: 2px;
  }

  .switch-track.checked {
    background: var(--compa11y-switch-checked-bg, #0066cc);
  }

  .switch-track:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .switch-thumb {
    position: absolute;
    left: 2px;
    background: var(--compa11y-switch-thumb-bg, white);
    border-radius: 50%;
    box-shadow: var(--compa11y-switch-thumb-shadow, 0 1px 3px rgba(0, 0, 0, 0.2));
    transition: transform 0.2s ease;
    pointer-events: none;
  }

  .switch-label {
    user-select: none;
    cursor: pointer;
    color: var(--compa11y-switch-label-color, inherit);
  }

  .switch-label.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

/**
 * Input-specific styles
 */
export const INPUT_STYLES = `
  ${BASE_STYLES}

  :host {
    display: block;
    width: var(--compa11y-input-width, 100%);
  }

  .input-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .input-label {
    display: block;
    color: var(--compa11y-input-label-color, inherit);
    font-size: var(--compa11y-input-label-size, 0.875rem);
    font-weight: var(--compa11y-input-label-weight, 500);
  }

  :host([disabled]) .input-label {
    color: var(--compa11y-input-disabled-color, #999);
  }

  .input-required {
    color: var(--compa11y-input-required-color, #ef4444);
    margin-left: 0.125rem;
  }

  input {
    width: 100%;
    padding: var(--compa11y-input-padding, 0.5rem 0.75rem);
    border: var(--compa11y-input-border, 1px solid #ccc);
    border-radius: var(--compa11y-input-radius, 4px);
    font: inherit;
    font-size: var(--compa11y-input-font-size, 0.875rem);
    background: var(--compa11y-input-bg, white);
    color: inherit;
  }

  input:focus {
    outline: 2px solid var(--compa11y-focus-color, #0066cc);
    outline-offset: -1px;
    border-color: var(--compa11y-input-border-focus, #0066cc);
  }

  input::placeholder {
    color: var(--compa11y-input-placeholder-color, #999);
  }

  input:disabled {
    background: var(--compa11y-input-disabled-bg, #f5f5f5);
    cursor: not-allowed;
    opacity: var(--compa11y-input-disabled-opacity, 0.7);
  }

  input[readonly] {
    background: var(--compa11y-input-readonly-bg, #f9f9f9);
  }

  :host([data-error="true"]) input {
    border-color: var(--compa11y-input-border-error, #ef4444);
  }

  :host([data-error="true"]) input:focus {
    outline-color: var(--compa11y-input-border-error, #ef4444);
    border-color: var(--compa11y-input-border-error, #ef4444);
  }

  .input-hint {
    color: var(--compa11y-input-hint-color, #666);
    font-size: var(--compa11y-input-hint-size, 0.8125rem);
  }

  .input-error {
    color: var(--compa11y-input-error-color, #ef4444);
    font-size: var(--compa11y-input-error-size, 0.8125rem);
  }
`;
