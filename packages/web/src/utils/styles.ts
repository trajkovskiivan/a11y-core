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

/**
 * Textarea-specific styles
 */
export const TEXTAREA_STYLES = `
  ${BASE_STYLES}

  :host {
    display: block;
    width: var(--compa11y-textarea-width, 100%);
  }

  .textarea-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .textarea-label {
    display: block;
    color: var(--compa11y-textarea-label-color, inherit);
    font-size: var(--compa11y-textarea-label-size, 0.875rem);
    font-weight: var(--compa11y-textarea-label-weight, 500);
  }

  :host([disabled]) .textarea-label {
    color: var(--compa11y-textarea-disabled-color, #999);
  }

  .textarea-required {
    color: var(--compa11y-textarea-required-color, #ef4444);
    margin-left: 0.125rem;
  }

  textarea {
    width: 100%;
    padding: var(--compa11y-textarea-padding, 0.5rem 0.75rem);
    border: var(--compa11y-textarea-border, 1px solid #ccc);
    border-radius: var(--compa11y-textarea-radius, 4px);
    font: inherit;
    font-size: var(--compa11y-textarea-font-size, 0.875rem);
    line-height: 1.5;
    background: var(--compa11y-textarea-bg, white);
    color: inherit;
    resize: var(--compa11y-textarea-resize, vertical);
  }

  textarea:focus {
    outline: 2px solid var(--compa11y-focus-color, #0066cc);
    outline-offset: -1px;
    border-color: var(--compa11y-textarea-border-focus, #0066cc);
  }

  textarea::placeholder {
    color: var(--compa11y-textarea-placeholder-color, #999);
  }

  textarea:disabled {
    background: var(--compa11y-textarea-disabled-bg, #f5f5f5);
    cursor: not-allowed;
    opacity: var(--compa11y-textarea-disabled-opacity, 0.7);
  }

  textarea[readonly] {
    background: var(--compa11y-textarea-readonly-bg, #f9f9f9);
  }

  :host([data-error="true"]) textarea {
    border-color: var(--compa11y-textarea-border-error, #ef4444);
  }

  :host([data-error="true"]) textarea:focus {
    outline-color: var(--compa11y-textarea-border-error, #ef4444);
    border-color: var(--compa11y-textarea-border-error, #ef4444);
  }

  .textarea-hint {
    color: var(--compa11y-textarea-hint-color, #666);
    font-size: var(--compa11y-textarea-hint-size, 0.8125rem);
  }

  .textarea-error {
    color: var(--compa11y-textarea-error-color, #ef4444);
    font-size: var(--compa11y-textarea-error-size, 0.8125rem);
  }
`;

/**
 * Button-specific styles
 */
export const BUTTON_STYLES = `
  ${BASE_STYLES}

  :host {
    display: inline-block;
  }

  @keyframes compa11y-spin {
    to { transform: rotate(360deg); }
  }

  button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    border-radius: var(--compa11y-button-radius, 4px);
    font: inherit;
    font-weight: var(--compa11y-button-font-weight, 500);
    line-height: 1.5;
    cursor: pointer;
    transition: background-color 0.15s ease, border-color 0.15s ease;
    appearance: none;
    text-decoration: none;
  }

  button:focus-visible {
    outline: 2px solid var(--compa11y-focus-color, #0066cc);
    outline-offset: 2px;
  }

  /* Sizes */
  button.size-sm {
    padding: var(--compa11y-button-padding-sm, 0.25rem 0.5rem);
    font-size: var(--compa11y-button-font-size-sm, 0.75rem);
  }

  button.size-md {
    padding: var(--compa11y-button-padding-md, 0.5rem 1rem);
    font-size: var(--compa11y-button-font-size-md, 0.875rem);
  }

  button.size-lg {
    padding: var(--compa11y-button-padding-lg, 0.75rem 1.5rem);
    font-size: var(--compa11y-button-font-size-lg, 1rem);
  }

  /* Variants */
  button.variant-primary {
    background: var(--compa11y-button-primary-bg, #0066cc);
    color: var(--compa11y-button-primary-color, white);
    border: var(--compa11y-button-primary-border, 1px solid #0066cc);
  }

  button.variant-primary:hover:not(:disabled):not([aria-disabled="true"]) {
    background: var(--compa11y-button-primary-hover-bg, #0052a3);
  }

  button.variant-secondary {
    background: var(--compa11y-button-secondary-bg, white);
    color: var(--compa11y-button-secondary-color, #333);
    border: var(--compa11y-button-secondary-border, 1px solid #ccc);
  }

  button.variant-secondary:hover:not(:disabled):not([aria-disabled="true"]) {
    background: var(--compa11y-button-secondary-hover-bg, #f0f0f0);
  }

  button.variant-danger {
    background: var(--compa11y-button-danger-bg, #ef4444);
    color: var(--compa11y-button-danger-color, white);
    border: var(--compa11y-button-danger-border, 1px solid #ef4444);
  }

  button.variant-danger:hover:not(:disabled):not([aria-disabled="true"]) {
    background: var(--compa11y-button-danger-hover-bg, #dc2626);
  }

  button.variant-outline {
    background: var(--compa11y-button-outline-bg, transparent);
    color: var(--compa11y-button-outline-color, #0066cc);
    border: var(--compa11y-button-outline-border, 1px solid #0066cc);
  }

  button.variant-outline:hover:not(:disabled):not([aria-disabled="true"]) {
    background: var(--compa11y-button-outline-hover-bg, rgba(0, 102, 204, 0.05));
  }

  button.variant-ghost {
    background: var(--compa11y-button-ghost-bg, transparent);
    color: var(--compa11y-button-ghost-color, #333);
    border: var(--compa11y-button-ghost-border, 1px solid transparent);
  }

  button.variant-ghost:hover:not(:disabled):not([aria-disabled="true"]) {
    background: var(--compa11y-button-ghost-hover-bg, rgba(0, 0, 0, 0.05));
  }

  /* Disabled */
  button:disabled,
  button[aria-disabled="true"] {
    opacity: var(--compa11y-button-disabled-opacity, 0.5);
    cursor: not-allowed;
  }

  /* Loading spinner */
  .button-spinner {
    display: inline-block;
    width: 1em;
    height: 1em;
    border: 2px solid currentColor;
    border-right-color: transparent;
    border-radius: 50%;
    animation: compa11y-spin 0.6s linear infinite;
  }
`;

/**
 * Listbox-specific styles
 */
export const LISTBOX_STYLES = `
  ${BASE_STYLES}

  :host {
    display: block;
    width: var(--compa11y-listbox-width, 250px);
  }

  .listbox-wrapper {
    max-height: var(--compa11y-listbox-max-height, 300px);
    overflow-y: auto;
    border: var(--compa11y-listbox-border, 1px solid #e0e0e0);
    border-radius: var(--compa11y-listbox-radius, 4px);
    background: var(--compa11y-listbox-bg, white);
    padding: var(--compa11y-listbox-padding, 0.25rem 0);
  }

  :host([disabled]) .listbox-wrapper {
    opacity: var(--compa11y-listbox-disabled-opacity, 0.5);
    cursor: not-allowed;
  }

  /* Focus indicator lives on the active option (via data-focused),
     not on the container, to avoid a double focus ring. */
  :host(:focus-visible) .listbox-wrapper {
    outline: none;
  }

  :host([orientation="horizontal"]) .listbox-wrapper {
    display: flex;
    flex-wrap: wrap;
    max-height: none;
    overflow-y: visible;
  }
`;

/**
 * Option-specific styles (for a11y-option inside listbox)
 */
export const OPTION_STYLES = `
  ${BASE_STYLES}

  :host {
    display: block;
  }

  .option-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--compa11y-listbox-option-padding, 0.5rem 0.75rem);
    cursor: pointer;
    transition: background 0.1s ease;
    user-select: none;
  }

  :host([data-focused]) .option-wrapper {
    background: var(--compa11y-listbox-option-hover-bg, #f5f5f5);
  }

  :host([aria-selected="true"]) .option-wrapper {
    background: var(--compa11y-listbox-option-selected-bg, #e6f0ff);
    font-weight: 500;
  }

  :host([aria-selected="true"][data-focused]) .option-wrapper {
    background: var(--compa11y-listbox-option-selected-hover-bg, #cce0ff);
  }

  :host([aria-disabled="true"]) .option-wrapper {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .option-content {
    flex: 1;
  }

  .check-mark {
    font-size: 0.875rem;
    color: var(--compa11y-listbox-check-color, #0066cc);
    margin-left: 0.5rem;
    visibility: hidden;
  }

  :host([aria-selected="true"]) .check-mark {
    visibility: visible;
  }
`;

/**
 * Optgroup-specific styles (for a11y-optgroup inside listbox)
 */
export const OPTGROUP_STYLES = `
  ${BASE_STYLES}

  :host {
    display: block;
  }

  .optgroup-label {
    padding: var(--compa11y-listbox-group-label-padding, 0.5rem 0.75rem 0.25rem);
    font-size: var(--compa11y-listbox-group-label-size, 0.75rem);
    font-weight: var(--compa11y-listbox-group-label-weight, 600);
    color: var(--compa11y-listbox-group-label-color, #666);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  :host([disabled]) {
    opacity: 0.5;
  }
`;

/**
 * Checkbox-specific styles
 */
export const CHECKBOX_STYLES = `
  ${BASE_STYLES}

  :host {
    display: inline-block;
  }

  .checkbox-wrapper {
    display: inline-flex;
    align-items: flex-start;
    gap: var(--compa11y-checkbox-gap, 0.5rem);
    cursor: pointer;
    user-select: none;
  }

  :host([disabled]) .checkbox-wrapper {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .checkbox-control {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .checkbox-input {
    position: absolute;
    opacity: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    cursor: inherit;
    z-index: 1;
  }

  .checkbox-indicator {
    width: var(--compa11y-checkbox-size, 1.25rem);
    height: var(--compa11y-checkbox-size, 1.25rem);
    min-width: 24px;
    min-height: 24px;
    border: var(--compa11y-checkbox-border, 2px solid #666);
    border-radius: var(--compa11y-checkbox-radius, 3px);
    background: var(--compa11y-checkbox-bg, white);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.15s ease;
    pointer-events: none;
  }

  :host([checked]) .checkbox-indicator {
    background: var(--compa11y-checkbox-checked-bg, #0066cc);
    border-color: var(--compa11y-checkbox-checked-border, #0066cc);
  }

  :host([indeterminate]) .checkbox-indicator {
    background: var(--compa11y-checkbox-checked-bg, #0066cc);
    border-color: var(--compa11y-checkbox-checked-border, #0066cc);
  }

  /* Size variants */
  .checkbox-wrapper.size-sm .checkbox-indicator {
    width: var(--compa11y-checkbox-size-sm, 1rem);
    height: var(--compa11y-checkbox-size-sm, 1rem);
    min-width: 24px;
    min-height: 24px;
  }

  .checkbox-wrapper.size-lg .checkbox-indicator {
    width: var(--compa11y-checkbox-size-lg, 1.5rem);
    height: var(--compa11y-checkbox-size-lg, 1.5rem);
  }

  /* Check mark SVG */
  .checkbox-check {
    opacity: 0;
    transform: scale(0);
    transition: all 0.15s ease;
    color: var(--compa11y-checkbox-check-color, white);
  }

  :host([checked]) .checkbox-check {
    opacity: 1;
    transform: scale(1);
  }

  :host([indeterminate]) .checkbox-check {
    opacity: 0;
    transform: scale(0);
  }

  /* Indeterminate dash */
  .checkbox-dash {
    opacity: 0;
    transition: all 0.15s ease;
    color: var(--compa11y-checkbox-check-color, white);
  }

  :host([indeterminate]) .checkbox-dash {
    opacity: 1;
  }

  /* Focus visible on indicator when input is focused */
  .checkbox-input:focus-visible + .checkbox-indicator {
    outline: 2px solid var(--compa11y-focus-color, #0066cc);
    outline-offset: 2px;
  }

  /* Hover */
  .checkbox-wrapper:hover:not([disabled]) .checkbox-indicator {
    border-color: var(--compa11y-checkbox-hover-border, #0066cc);
  }

  /* Label and text */
  .checkbox-content {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    padding-top: 0.125rem;
  }

  .checkbox-label {
    color: var(--compa11y-checkbox-label-color, inherit);
    font-size: var(--compa11y-checkbox-label-size, 1rem);
    cursor: inherit;
  }

  .checkbox-hint {
    color: var(--compa11y-checkbox-hint-color, #666);
    font-size: var(--compa11y-checkbox-hint-size, 0.8125rem);
  }

  .checkbox-error {
    color: var(--compa11y-checkbox-error-color, #ef4444);
    font-size: var(--compa11y-checkbox-error-size, 0.8125rem);
  }

  .checkbox-required {
    color: var(--compa11y-checkbox-required-color, #ef4444);
    margin-left: 0.125rem;
  }

  /* Forced colors / high contrast mode */
  @media (forced-colors: active) {
    .checkbox-indicator {
      border: 2px solid ButtonText;
    }

    :host([checked]) .checkbox-indicator,
    :host([indeterminate]) .checkbox-indicator {
      background: Highlight;
      border-color: Highlight;
    }

    .checkbox-check,
    .checkbox-dash {
      color: HighlightText;
    }
  }
`;

/**
 * CheckboxGroup-specific styles
 */
export const CHECKBOX_GROUP_STYLES = `
  ${BASE_STYLES}

  :host {
    display: block;
  }

  fieldset {
    border: none;
    margin: 0;
    padding: 0;
    min-width: 0;
  }

  legend {
    padding: 0;
    margin-bottom: var(--compa11y-checkbox-group-legend-gap, 0.5rem);
    font-weight: var(--compa11y-checkbox-group-legend-weight, 600);
    color: var(--compa11y-checkbox-group-legend-color, inherit);
    font-size: var(--compa11y-checkbox-group-legend-size, 1rem);
  }

  .checkbox-group-items {
    display: flex;
    flex-direction: column;
    gap: var(--compa11y-checkbox-group-gap, 0.75rem);
  }

  :host([orientation="horizontal"]) .checkbox-group-items {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .checkbox-group-error {
    color: var(--compa11y-checkbox-group-error-color, #ef4444);
    font-size: var(--compa11y-checkbox-group-error-size, 0.8125rem);
    margin-top: 0.25rem;
  }

  :host([disabled]) {
    opacity: 0.5;
  }
`;

/**
 * RadioGroup-specific styles
 */
export const RADIO_GROUP_STYLES = `
  ${BASE_STYLES}

  :host {
    display: block;
  }

  fieldset {
    border: none;
    margin: 0;
    padding: 0;
    min-width: 0;
  }

  legend {
    padding: 0;
    margin-bottom: var(--compa11y-radio-group-legend-gap, 0.5rem);
    font-weight: var(--compa11y-radio-group-legend-weight, 600);
    color: var(--compa11y-radio-group-legend-color, inherit);
    font-size: var(--compa11y-radio-group-legend-size, 1rem);
  }

  .radio-group-items {
    display: flex;
    flex-direction: column;
    gap: var(--compa11y-radio-group-gap, 0.75rem);
  }

  :host([orientation="horizontal"]) .radio-group-items {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .radio-group-hint {
    color: var(--compa11y-radio-group-hint-color, #666);
    font-size: var(--compa11y-radio-group-hint-size, 0.8125rem);
    margin-top: 0.25rem;
  }

  .radio-group-error {
    color: var(--compa11y-radio-group-error-color, #ef4444);
    font-size: var(--compa11y-radio-group-error-size, 0.8125rem);
    margin-top: 0.25rem;
  }

  .radio-group-required {
    color: var(--compa11y-radio-group-required-color, #ef4444);
    margin-left: 0.125rem;
  }

  :host([disabled]) {
    opacity: 0.5;
  }
`;

/**
 * Radio-specific styles
 */
export const RADIO_STYLES = `
  ${BASE_STYLES}

  :host {
    display: inline-block;
  }

  .radio-wrapper {
    display: inline-flex;
    align-items: flex-start;
    gap: var(--compa11y-radio-gap, 0.5rem);
    cursor: pointer;
    user-select: none;
  }

  :host([disabled]) .radio-wrapper {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .radio-control {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .radio-input {
    position: absolute;
    opacity: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    cursor: inherit;
    z-index: 1;
  }

  .radio-circle {
    width: var(--compa11y-radio-size, 1.25rem);
    height: var(--compa11y-radio-size, 1.25rem);
    min-width: 24px;
    min-height: 24px;
    border: var(--compa11y-radio-border, 2px solid #666);
    border-radius: 50%;
    background: var(--compa11y-radio-bg, white);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.15s ease;
    pointer-events: none;
  }

  :host([checked]) .radio-circle {
    background: var(--compa11y-radio-checked-bg, #0066cc);
    border-color: var(--compa11y-radio-checked-border, #0066cc);
  }

  /* Focus visible on circle when input is focused */
  .radio-input:focus-visible + .radio-circle {
    outline: 2px solid var(--compa11y-focus-color, #0066cc);
    outline-offset: 2px;
  }

  /* Hover */
  .radio-wrapper:hover:not([disabled]) .radio-circle {
    border-color: var(--compa11y-radio-hover-border, #0066cc);
  }

  /* Inner dot */
  .radio-dot {
    width: var(--compa11y-radio-dot-size, 0.5rem);
    height: var(--compa11y-radio-dot-size, 0.5rem);
    border-radius: 50%;
    background: var(--compa11y-radio-dot-color, white);
    opacity: 0;
    transform: scale(0);
    transition: all 0.15s ease;
  }

  :host([checked]) .radio-dot {
    opacity: 1;
    transform: scale(1);
  }

  /* Label and text */
  .radio-content {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    padding-top: 0.125rem;
  }

  .radio-label {
    color: var(--compa11y-radio-label-color, inherit);
    font-size: var(--compa11y-radio-label-size, 1rem);
    cursor: inherit;
  }

  .radio-hint {
    color: var(--compa11y-radio-hint-color, #666);
    font-size: var(--compa11y-radio-hint-size, 0.8125rem);
  }

  /* Forced colors / high contrast mode */
  @media (forced-colors: active) {
    .radio-circle {
      border: 2px solid ButtonText;
    }

    :host([checked]) .radio-circle {
      background: Highlight;
      border-color: Highlight;
    }

    .radio-dot {
      background: HighlightText;
    }
  }
`;

/**
 * Toast-specific styles
 */
export const TOAST_STYLES = `
  ${BASE_STYLES}

  :host {
    position: fixed;
    z-index: var(--compa11y-toast-z-index, 9999);
    padding: var(--compa11y-toast-viewport-padding, 1rem);
    display: flex;
    flex-direction: column;
    gap: var(--compa11y-toast-gap, 0.5rem);
    pointer-events: none;
  }

  /* Position variants */
  :host([position="top-left"]) { top: 0; left: 0; }
  :host([position="top-center"]) { top: 0; left: 50%; transform: translateX(-50%); }
  :host([position="top-right"]) { top: 0; right: 0; }
  :host([position="bottom-left"]) { bottom: 0; left: 0; }
  :host(:not([position])),
  :host([position="bottom-right"]) { bottom: 0; right: 0; }
  :host([position="bottom-center"]) { bottom: 0; left: 50%; transform: translateX(-50%); }

  .toast {
    pointer-events: auto;
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: var(--compa11y-toast-padding, 0.75rem 1rem);
    background: var(--compa11y-toast-bg, white);
    border: var(--compa11y-toast-border, 1px solid #e0e0e0);
    border-radius: var(--compa11y-toast-radius, 6px);
    box-shadow: var(--compa11y-toast-shadow, 0 4px 12px rgba(0, 0, 0, 0.15));
    min-width: var(--compa11y-toast-min-width, 250px);
    max-width: var(--compa11y-toast-max-width, 420px);
  }

  .toast[data-type="error"] {
    border-left: 4px solid var(--compa11y-toast-error-color, #ef4444);
  }

  .toast[data-type="warning"] {
    border-left: 4px solid var(--compa11y-toast-warning-color, #f59e0b);
  }

  .toast[data-type="success"] {
    border-left: 4px solid var(--compa11y-toast-success-color, #22c55e);
  }

  .toast[data-type="info"] {
    border-left: 4px solid var(--compa11y-toast-info-color, #3b82f6);
  }

  .toast-content {
    flex: 1;
    min-width: 0;
  }

  .toast-title {
    font-weight: var(--compa11y-toast-title-weight, 600);
    font-size: var(--compa11y-toast-title-size, 0.875rem);
  }

  .toast-description {
    color: var(--compa11y-toast-description-color, #666);
    font-size: var(--compa11y-toast-description-size, 0.8125rem);
    margin-top: 0.125rem;
  }

  .toast-close {
    ${RESET_BUTTON_STYLES}
    flex-shrink: 0;
    width: 1.5rem;
    height: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--compa11y-toast-close-radius, 4px);
    color: var(--compa11y-toast-close-color, #999);
    font-size: 1.125rem;
    line-height: 1;
  }

  .toast-close:hover {
    background: var(--compa11y-toast-close-hover-bg, rgba(0, 0, 0, 0.05));
    color: var(--compa11y-toast-close-hover-color, #333);
  }

  .toast-close:focus-visible {
    outline: 2px solid var(--compa11y-focus-color, #0066cc);
    outline-offset: 2px;
  }

  .toast-action {
    ${RESET_BUTTON_STYLES}
    margin-top: 0.375rem;
    font-size: var(--compa11y-toast-action-size, 0.8125rem);
    font-weight: 500;
    color: var(--compa11y-toast-action-color, #0066cc);
    text-decoration: underline;
  }

  .toast-action:hover {
    color: var(--compa11y-toast-action-hover-color, #0052a3);
  }

  .toast-action:focus-visible {
    outline: 2px solid var(--compa11y-focus-color, #0066cc);
    outline-offset: 2px;
  }
`;

/**
 * Accordion-specific styles (injected into document head for light DOM styling)
 */
export const ACCORDION_GLOBAL_STYLES = `
  a11y-accordion {
    display: block;
    border: 1px solid var(--compa11y-accordion-border-color, #e0e0e0);
    border-radius: var(--compa11y-accordion-radius, 6px);
    overflow: hidden;
  }

  a11y-accordion h1,
  a11y-accordion h2,
  a11y-accordion h3,
  a11y-accordion h4,
  a11y-accordion h5,
  a11y-accordion h6 {
    margin: 0;
    font-size: inherit;
    font-weight: inherit;
  }

  a11y-accordion [data-accordion-trigger] {
    appearance: none;
    -webkit-appearance: none;
    background: var(--compa11y-accordion-trigger-bg, #ffffff);
    border: none;
    border-bottom: 1px solid var(--compa11y-accordion-border-color, #e0e0e0);
    padding: var(--compa11y-accordion-trigger-padding, 1rem);
    font: inherit;
    font-size: 1rem;
    font-weight: 500;
    color: var(--compa11y-accordion-trigger-color, #1a1a1a);
    width: 100%;
    text-align: left;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    transition: background 0.15s ease;
  }

  a11y-accordion [data-accordion-trigger]:hover {
    background: var(--compa11y-accordion-trigger-hover-bg, #f9f9f9);
  }

  a11y-accordion [data-accordion-trigger]:focus-visible {
    outline: 2px solid var(--compa11y-focus-color, #0066cc);
    outline-offset: -2px;
  }

  a11y-accordion [data-accordion-trigger][aria-disabled="true"],
  a11y-accordion [data-accordion-trigger]:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  a11y-accordion [data-accordion-trigger]::after {
    content: '';
    flex-shrink: 0;
    width: 0.5rem;
    height: 0.5rem;
    border-right: 2px solid currentColor;
    border-bottom: 2px solid currentColor;
    transform: rotate(45deg) translateY(-2px);
    transition: transform 0.2s ease;
  }

  a11y-accordion [data-accordion-trigger][aria-expanded="true"]::after {
    transform: rotate(-135deg) translateY(-2px);
  }

  a11y-accordion [data-accordion-panel] {
    padding: var(--compa11y-accordion-content-padding, 1rem);
    background: var(--compa11y-accordion-content-bg, #ffffff);
    border-bottom: 1px solid var(--compa11y-accordion-border-color, #e0e0e0);
  }

  a11y-accordion [data-accordion-panel][hidden] {
    display: none;
  }

  a11y-accordion > *:last-child [data-accordion-trigger],
  a11y-accordion > [data-accordion-panel]:last-child {
    border-bottom: none;
  }

  @media (prefers-reduced-motion: reduce) {
    a11y-accordion [data-accordion-trigger],
    a11y-accordion [data-accordion-trigger]::after {
      transition: none;
    }
  }

  @media (forced-colors: active) {
    a11y-accordion {
      border: 2px solid ButtonText;
    }
    a11y-accordion [data-accordion-trigger] {
      border-bottom: 1px solid ButtonText;
      forced-color-adjust: none;
    }
  }
`;

export const TABLE_GLOBAL_STYLES = `
  /* ── Host ── */
  a11y-table {
    display: block;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  /* ── Table element ── */
  a11y-table table {
    border-collapse: collapse;
    width: 100%;
    font-size: 0.9375rem;
    color: var(--compa11y-table-color, #1a1a1a);
    background: var(--compa11y-table-bg, #ffffff);
  }

  /* ── Caption ── */
  a11y-table caption {
    caption-side: top;
    text-align: left;
    font-weight: 600;
    font-size: 1rem;
    padding-bottom: 0.5rem;
    color: var(--compa11y-table-caption-color, #1a1a1a);
  }

  /* ── Header cells ── */
  a11y-table th {
    text-align: left;
    font-weight: 600;
    padding: var(--compa11y-table-cell-padding, 0.625rem 0.875rem);
    background: var(--compa11y-table-head-bg, #f5f5f5);
    border-bottom: 2px solid var(--compa11y-table-border-color, #d0d0d0);
    white-space: nowrap;
  }

  /* ── Data cells ── */
  a11y-table td {
    padding: var(--compa11y-table-cell-padding, 0.625rem 0.875rem);
    border-bottom: 1px solid var(--compa11y-table-border-color, #e8e8e8);
    vertical-align: top;
  }

  /* ── Row hover ── */
  a11y-table tbody tr:hover {
    background: var(--compa11y-table-row-hover-bg, #fafafa);
  }

  /* ── Selected row ── */
  a11y-table tr[aria-selected="true"] {
    background: var(--compa11y-table-selected-bg, #e8f0fe);
  }
  a11y-table tr[aria-selected="true"]:hover {
    background: var(--compa11y-table-selected-hover-bg, #dde7fd);
  }

  /* ── Sort button ── */
  a11y-table [data-sort-btn] {
    appearance: none;
    -webkit-appearance: none;
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    font: inherit;
    color: inherit;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.375em;
    text-align: left;
    width: 100%;
  }

  a11y-table [data-sort-btn]:focus-visible {
    outline: 2px solid var(--compa11y-focus-color, #0066cc);
    outline-offset: 2px;
    border-radius: 2px;
  }

  a11y-table [data-sort-icon] {
    font-size: 0.75em;
    opacity: 0.6;
    flex-shrink: 0;
  }

  /* ── Select checkboxes ── */
  a11y-table [data-select-cb] {
    cursor: pointer;
    width: 1rem;
    height: 1rem;
  }
  a11y-table [data-select-cb]:focus-visible {
    outline: 2px solid var(--compa11y-focus-color, #0066cc);
    outline-offset: 2px;
  }

  /* ── Empty / Loading cells ── */
  a11y-table [data-empty-cell],
  a11y-table [data-loading-cell] {
    text-align: center;
    padding: 2rem 1rem;
    color: var(--compa11y-table-muted-color, #6b6b6b);
    font-style: italic;
  }

  /* ── Footer ── */
  a11y-table tfoot td,
  a11y-table tfoot th {
    background: var(--compa11y-table-foot-bg, #f5f5f5);
    border-top: 2px solid var(--compa11y-table-border-color, #d0d0d0);
    border-bottom: none;
    font-weight: 600;
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    a11y-table tr,
    a11y-table td,
    a11y-table th {
      transition: none;
    }
  }

  /* ── Windows High Contrast ── */
  @media (forced-colors: active) {
    a11y-table table {
      border: 1px solid ButtonText;
      forced-color-adjust: none;
    }
    a11y-table th,
    a11y-table td {
      border: 1px solid ButtonText;
    }
    a11y-table tr[aria-selected="true"] {
      outline: 2px solid Highlight;
    }
    a11y-table [data-sort-btn]:focus-visible {
      outline: 2px solid Highlight;
    }
  }
`;
