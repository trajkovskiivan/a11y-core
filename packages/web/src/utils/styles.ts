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
 * Drawer-specific styles
 */
export const DRAWER_STYLES = `
  ${BASE_STYLES}

  :host {
    position: fixed;
    inset: 0;
    z-index: var(--compa11y-drawer-z-index, 9999);
    display: none;
    pointer-events: none;
  }

  :host([open]) {
    display: block;
  }

  .overlay {
    position: absolute;
    inset: 0;
    background: var(--compa11y-drawer-overlay-bg, rgba(0, 0, 0, 0.5));
    pointer-events: auto;
  }

  .drawer {
    position: absolute;
    background: var(--compa11y-drawer-bg, white);
    overflow: auto;
    pointer-events: auto;
    padding: var(--compa11y-drawer-padding, 1.5rem);
    box-shadow: var(--compa11y-drawer-shadow, 0 25px 50px -12px rgba(0, 0, 0, 0.25));
    transition: transform 0.3s ease;
  }

  /* Left */
  :host([side="left"]) .drawer {
    top: 0;
    left: 0;
    bottom: 0;
    width: var(--compa11y-drawer-width, 400px);
    transform: translateX(-100%);
    border-right: var(--compa11y-drawer-border, 1px solid rgba(0, 0, 0, 0.1));
  }

  :host([side="left"][open]) .drawer {
    transform: translateX(0);
  }

  /* Right (default) */
  :host([side="right"]) .drawer,
  :host(:not([side])) .drawer {
    top: 0;
    right: 0;
    bottom: 0;
    width: var(--compa11y-drawer-width, 400px);
    transform: translateX(100%);
    border-left: var(--compa11y-drawer-border, 1px solid rgba(0, 0, 0, 0.1));
  }

  :host([side="right"][open]) .drawer,
  :host(:not([side])[open]) .drawer {
    transform: translateX(0);
  }

  /* Top */
  :host([side="top"]) .drawer {
    top: 0;
    left: 0;
    right: 0;
    height: var(--compa11y-drawer-height, 400px);
    transform: translateY(-100%);
    border-bottom: var(--compa11y-drawer-border, 1px solid rgba(0, 0, 0, 0.1));
  }

  :host([side="top"][open]) .drawer {
    transform: translateY(0);
  }

  /* Bottom */
  :host([side="bottom"]) .drawer {
    bottom: 0;
    left: 0;
    right: 0;
    height: var(--compa11y-drawer-height, 400px);
    transform: translateY(100%);
    border-top: var(--compa11y-drawer-border, 1px solid rgba(0, 0, 0, 0.1));
    border-radius: var(--compa11y-drawer-radius, 12px 12px 0 0);
  }

  :host([side="bottom"][open]) .drawer {
    transform: translateY(0);
  }

  .handle {
    width: 48px;
    height: 4px;
    border-radius: 2px;
    background: rgba(0, 0, 0, 0.2);
    margin: 0 auto 1rem;
  }

  ::slotted([slot="title"]) {
    margin: 0 0 0.5rem 0;
    font-size: 1.25rem;
    font-weight: 600;
  }

  ::slotted([slot="description"]) {
    margin: 0 0 1rem 0;
    color: var(--compa11y-drawer-description-color, #666);
  }

  @media (prefers-reduced-motion: reduce) {
    .drawer {
      transition: none;
    }
  }

  @media (forced-colors: active) {
    .drawer {
      border: 2px solid ButtonText;
    }
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
    position: relative;
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
    position: absolute;
    top: 50%;
    left: 50%;
    opacity: 0;
    transform: translate(-50%, -50%) scale(0);
    transition: all 0.15s ease;
    color: var(--compa11y-checkbox-check-color, white);
  }

  :host([checked]) .checkbox-check {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }

  :host([indeterminate]) .checkbox-check {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0);
  }

  /* Indeterminate dash */
  .checkbox-dash {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
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
  compa11y-accordion {
    display: block;
    border: 1px solid var(--compa11y-accordion-border-color, #e0e0e0);
    border-radius: var(--compa11y-accordion-radius, 6px);
    overflow: hidden;
  }

  compa11y-accordion h1,
  compa11y-accordion h2,
  compa11y-accordion h3,
  compa11y-accordion h4,
  compa11y-accordion h5,
  compa11y-accordion h6 {
    margin: 0;
    font-size: inherit;
    font-weight: inherit;
  }

  compa11y-accordion [data-accordion-trigger] {
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

  compa11y-accordion [data-accordion-trigger]:hover {
    background: var(--compa11y-accordion-trigger-hover-bg, #f9f9f9);
  }

  compa11y-accordion [data-accordion-trigger]:focus-visible {
    outline: 2px solid var(--compa11y-focus-color, #0066cc);
    outline-offset: -2px;
  }

  compa11y-accordion [data-accordion-trigger][aria-disabled="true"],
  compa11y-accordion [data-accordion-trigger]:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  compa11y-accordion [data-accordion-trigger]::after {
    content: '';
    flex-shrink: 0;
    width: 0.5rem;
    height: 0.5rem;
    border-right: 2px solid currentColor;
    border-bottom: 2px solid currentColor;
    transform: rotate(45deg) translateY(-2px);
    transition: transform 0.2s ease;
  }

  compa11y-accordion [data-accordion-trigger][aria-expanded="true"]::after {
    transform: rotate(-135deg) translateY(-2px);
  }

  compa11y-accordion [data-accordion-panel] {
    padding: var(--compa11y-accordion-content-padding, 1rem);
    background: var(--compa11y-accordion-content-bg, #ffffff);
    border-bottom: 1px solid var(--compa11y-accordion-border-color, #e0e0e0);
  }

  compa11y-accordion [data-accordion-panel][hidden] {
    display: none;
  }

  compa11y-accordion > *:last-child [data-accordion-trigger],
  compa11y-accordion > [data-accordion-panel]:last-child {
    border-bottom: none;
  }

  @media (prefers-reduced-motion: reduce) {
    compa11y-accordion [data-accordion-trigger],
    compa11y-accordion [data-accordion-trigger]::after {
      transition: none;
    }
  }

  @media (forced-colors: active) {
    compa11y-accordion {
      border: 2px solid ButtonText;
    }
    compa11y-accordion [data-accordion-trigger] {
      border-bottom: 1px solid ButtonText;
      forced-color-adjust: none;
    }
  }
`;

export const TABLE_GLOBAL_STYLES = `
  /* ── Host ── */
  compa11y-table {
    display: block;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  /* ── Table element ── */
  compa11y-table table {
    border-collapse: collapse;
    width: 100%;
    font-size: 0.9375rem;
    color: var(--compa11y-table-color, #1a1a1a);
    background: var(--compa11y-table-bg, #ffffff);
  }

  /* ── Caption ── */
  compa11y-table caption {
    caption-side: top;
    text-align: left;
    font-weight: 600;
    font-size: 1rem;
    padding-bottom: 0.5rem;
    color: var(--compa11y-table-caption-color, #1a1a1a);
  }

  /* ── Header cells ── */
  compa11y-table th {
    text-align: left;
    font-weight: 600;
    padding: var(--compa11y-table-cell-padding, 0.625rem 0.875rem);
    background: var(--compa11y-table-head-bg, #f5f5f5);
    border-bottom: 2px solid var(--compa11y-table-border-color, #d0d0d0);
    white-space: nowrap;
  }

  /* ── Data cells ── */
  compa11y-table td {
    padding: var(--compa11y-table-cell-padding, 0.625rem 0.875rem);
    border-bottom: 1px solid var(--compa11y-table-border-color, #e8e8e8);
    vertical-align: top;
  }

  /* ── Row hover ── */
  compa11y-table tbody tr:hover {
    background: var(--compa11y-table-row-hover-bg, #fafafa);
  }

  /* ── Selected row ── */
  compa11y-table tr[aria-selected="true"] {
    background: var(--compa11y-table-selected-bg, #e8f0fe);
  }
  compa11y-table tr[aria-selected="true"]:hover {
    background: var(--compa11y-table-selected-hover-bg, #dde7fd);
  }

  /* ── Sort button ── */
  compa11y-table [data-sort-btn] {
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

  compa11y-table [data-sort-btn]:focus-visible {
    outline: 2px solid var(--compa11y-focus-color, #0066cc);
    outline-offset: 2px;
    border-radius: 2px;
  }

  compa11y-table [data-sort-icon] {
    font-size: 0.75em;
    opacity: 0.6;
    flex-shrink: 0;
  }

  /* ── Select checkboxes ── */
  compa11y-table [data-select-cb] {
    cursor: pointer;
    width: 1rem;
    height: 1rem;
  }
  compa11y-table [data-select-cb]:focus-visible {
    outline: 2px solid var(--compa11y-focus-color, #0066cc);
    outline-offset: 2px;
  }

  /* ── Empty / Loading cells ── */
  compa11y-table [data-empty-cell],
  compa11y-table [data-loading-cell] {
    text-align: center;
    padding: 2rem 1rem;
    color: var(--compa11y-table-muted-color, #6b6b6b);
    font-style: italic;
  }

  /* ── Footer ── */
  compa11y-table tfoot td,
  compa11y-table tfoot th {
    background: var(--compa11y-table-foot-bg, #f5f5f5);
    border-top: 2px solid var(--compa11y-table-border-color, #d0d0d0);
    border-bottom: none;
    font-weight: 600;
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    compa11y-table tr,
    compa11y-table td,
    compa11y-table th {
      transition: none;
    }
  }

  /* ── Windows High Contrast ── */
  @media (forced-colors: active) {
    compa11y-table table {
      border: 1px solid ButtonText;
      forced-color-adjust: none;
    }
    compa11y-table th,
    compa11y-table td {
      border: 1px solid ButtonText;
    }
    compa11y-table tr[aria-selected="true"] {
      outline: 2px solid Highlight;
    }
    compa11y-table [data-sort-btn]:focus-visible {
      outline: 2px solid Highlight;
    }
  }
`;

/**
 * Pagination-specific styles
 */
export const PAGINATION_STYLES = `
  ${BASE_STYLES}

  :host {
    display: block;
  }

  /* Visually hidden — live region always in DOM */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  nav {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--compa11y-pagination-gap, 0.5rem);
  }

  ul {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--compa11y-pagination-btn-gap, 2px);
    list-style: none;
    padding: 0;
    margin: 0;
  }

  [data-compa11y-pagination-btn] {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: var(--compa11y-pagination-btn-size, 44px);
    min-height: var(--compa11y-pagination-btn-size, 44px);
    padding: var(--compa11y-pagination-btn-padding, 0.25rem 0.5rem);
    border: var(--compa11y-pagination-btn-border, 1px solid #d1d5db);
    border-radius: var(--compa11y-pagination-btn-radius, 4px);
    background: var(--compa11y-pagination-btn-bg, transparent);
    color: var(--compa11y-pagination-btn-color, inherit);
    font: inherit;
    cursor: pointer;
    user-select: none;
    transition: background 0.15s ease, border-color 0.15s ease;
  }

  [data-compa11y-pagination-btn]:not([disabled]):hover {
    background: var(--compa11y-pagination-btn-hover-bg, #f3f4f6);
    border-color: var(--compa11y-pagination-btn-hover-border, #9ca3af);
  }

  [data-compa11y-pagination-btn]:focus-visible {
    outline: var(--compa11y-focus-width, 2px) solid
      var(--compa11y-focus-color, #0066cc);
    outline-offset: 2px;
  }

  [data-compa11y-pagination-btn][disabled] {
    opacity: 0.4;
    cursor: not-allowed;
    pointer-events: none;
  }

  /* Current page — background + border so color is not the only indicator */
  [data-compa11y-pagination-page][data-current="true"] {
    background: var(--compa11y-pagination-current-bg, #0066cc);
    color: var(--compa11y-pagination-current-color, #fff);
    border-color: var(--compa11y-pagination-current-bg, #0066cc);
    font-weight: 600;
    text-decoration: underline;
  }

  [aria-hidden="true"] span {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: var(--compa11y-pagination-btn-size, 44px);
    min-height: var(--compa11y-pagination-btn-size, 44px);
    color: var(--compa11y-pagination-ellipsis-color, #9ca3af);
    user-select: none;
  }

  /* Rows-per-page selector */
  .page-size-wrapper {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .page-size-wrapper label {
    white-space: nowrap;
    font-size: 0.875rem;
  }

  [data-compa11y-pagination-pagesize] {
    padding: 0.25rem 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font: inherit;
    font-size: 0.875rem;
    background: var(--compa11y-pagination-select-bg, #fff);
    cursor: pointer;
  }

  [data-compa11y-pagination-pagesize]:focus-visible {
    outline: var(--compa11y-focus-width, 2px) solid
      var(--compa11y-focus-color, #0066cc);
    outline-offset: 2px;
  }

  /* Jump-to-page input */
  .jump-wrapper {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .jump-wrapper label {
    white-space: nowrap;
    font-size: 0.875rem;
  }

  [data-compa11y-pagination-jump] {
    width: 5rem;
    padding: 0.25rem 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font: inherit;
    font-size: 0.875rem;
    background: var(--compa11y-pagination-input-bg, #fff);
  }

  [data-compa11y-pagination-jump]:focus-visible {
    outline: var(--compa11y-focus-width, 2px) solid
      var(--compa11y-focus-color, #0066cc);
    outline-offset: 2px;
    border-color: var(--compa11y-focus-color, #0066cc);
  }

  [data-compa11y-pagination-error] {
    color: var(--compa11y-pagination-error-color, #dc2626);
    font-size: 0.75rem;
    width: 100%;
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    [data-compa11y-pagination-btn] {
      transition: none !important;
    }
  }

  /* Forced colours / high contrast */
  @media (forced-colors: active) {
    [data-compa11y-pagination-page][data-current="true"] {
      border: 2px solid ButtonText;
      forced-color-adjust: none;
    }

    [data-compa11y-pagination-btn]:focus-visible {
      outline: 2px solid Highlight;
    }
  }
`;

/**
 * ProgressBar-specific styles
 *
 * CSS custom properties:
 *   --compa11y-progress-bar-track-bg          Track background       (default #e2e8f0)
 *   --compa11y-progress-bar-track-size        Track height           (default 8px)
 *   --compa11y-progress-bar-fill-bg           Determinate fill       (default #0066cc)
 *   --compa11y-progress-bar-fill-bg-complete  Complete fill          (default #22c55e)
 *   --compa11y-progress-bar-fill-bg-error     Error fill             (default #ef4444)
 *   --compa11y-progress-bar-label-color       Label color            (default inherit)
 *   --compa11y-progress-bar-value-color       Value text color       (default #555)
 *   --compa11y-progress-bar-status-color      Status text color      (default #555)
 *   --compa11y-progress-bar-error-color       Error status text      (default #ef4444)
 */
export const PROGRESS_BAR_STYLES = `
  ${BASE_STYLES}

  :host {
    display: block;
  }

  @keyframes compa11y-progress-indeterminate {
    0%   { transform: translateX(-100%); }
    100% { transform: translateX(350%);  }
  }

  .progress-bar-root {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .progress-bar-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 0.5rem;
  }

  .progress-bar-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--compa11y-progress-bar-label-color, inherit);
  }

  .progress-bar-value {
    font-size: 0.8125rem;
    color: var(--compa11y-progress-bar-value-color, #555);
    white-space: nowrap;
  }

  /* Track carries role="progressbar" */
  .progress-bar-track {
    position: relative;
    height: var(--compa11y-progress-bar-track-size, 8px);
    width: 100%;
    border-radius: 9999px;
    background: var(--compa11y-progress-bar-track-bg, #e2e8f0);
    overflow: hidden;
  }

  .progress-bar-fill {
    position: absolute;
    inset: 0;
    border-radius: 9999px;
    background: var(--compa11y-progress-bar-fill-bg, #0066cc);
    transition: width 0.3s ease;
  }

  .progress-bar-fill--indeterminate {
    width: 40% !important;
    animation: compa11y-progress-indeterminate 1.5s ease-in-out infinite;
    transition: none;
  }

  /* Status variants — use :host([status]) selectors */
  :host([status="complete"]) .progress-bar-fill {
    background: var(--compa11y-progress-bar-fill-bg-complete, #22c55e);
  }

  :host([status="error"]) .progress-bar-fill {
    background: var(--compa11y-progress-bar-fill-bg-error, #ef4444);
  }

  .progress-bar-status {
    font-size: 0.8125rem;
    color: var(--compa11y-progress-bar-status-color, #555);
    margin: 0;
  }

  :host([status="error"]) .progress-bar-status {
    color: var(--compa11y-progress-bar-error-color, #ef4444);
  }

  /* Reduced motion — slow indeterminate to a gentle pulse, remove fill transition */
  @media (prefers-reduced-motion: reduce) {
    .progress-bar-fill {
      transition: none !important;
    }

    .progress-bar-fill--indeterminate {
      animation-name: compa11y-progress-indeterminate-reduced;
      animation-duration: 2s;
    }

    @keyframes compa11y-progress-indeterminate-reduced {
      0%, 100% { opacity: 0.4; }
      50%       { opacity: 1;   }
    }
  }

  /* Forced colors / High Contrast mode */
  @media (forced-colors: active) {
    .progress-bar-track {
      border: 1px solid ButtonText;
      background: ButtonFace;
      forced-color-adjust: none;
    }

    .progress-bar-fill {
      background: Highlight;
      forced-color-adjust: none;
    }

    :host([status="error"]) .progress-bar-fill {
      background: Mark;
    }
  }
`;

/**
 * Slider-specific styles
 *
 * CSS custom properties:
 *   --compa11y-slider-track-bg         Track background (default #e2e8f0)
 *   --compa11y-slider-track-size       Track thickness  (default 4px)
 *   --compa11y-slider-track-length     Vertical track height (default 160px)
 *   --compa11y-slider-fill-bg          Fill color       (default #0066cc)
 *   --compa11y-slider-thumb-size       Thumb diameter   (default 20px)
 *   --compa11y-slider-thumb-bg         Thumb fill       (default white)
 *   --compa11y-slider-thumb-border     Thumb border     (default #0066cc)
 */
export const SLIDER_STYLES = `
  ${BASE_STYLES}

  :host {
    display: inline-block;
  }

  /* Root layout */
  .slider-root {
    display: inline-flex;
    flex-direction: column;
    gap: 8px;
    padding-block: 10px;
  }

  :host([orientation="vertical"]) .slider-root {
    flex-direction: row;
    align-items: flex-start;
    padding-block: 0;
    padding-inline: 10px;
  }

  /* Label */
  .slider-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
  }

  /* Track */
  .slider-track {
    position: relative;
    height: var(--compa11y-slider-track-size, 4px);
    width: 100%;
    border-radius: 9999px;
    background: var(--compa11y-slider-track-bg, #e2e8f0);
    cursor: pointer;
    user-select: none;
    touch-action: none;
  }

  :host([orientation="vertical"]) .slider-track {
    width: var(--compa11y-slider-track-size, 4px);
    height: var(--compa11y-slider-track-length, 160px);
    min-height: 80px;
  }

  :host([disabled]) .slider-track {
    cursor: not-allowed;
  }

  /* Fill */
  .slider-fill {
    position: absolute;
    top: 0;
    bottom: 0;
    border-radius: 9999px;
    background: var(--compa11y-slider-fill-bg, #0066cc);
    pointer-events: none;
  }

  :host([disabled]) .slider-fill {
    background: var(--compa11y-slider-fill-bg-disabled, #94a3b8);
  }

  :host([orientation="vertical"]) .slider-fill {
    top: auto;
    left: 0;
    right: 0;
  }

  /* Thumb */
  .slider-thumb {
    position: absolute;
    top: 50%;
    width: var(--compa11y-slider-thumb-size, 20px);
    height: var(--compa11y-slider-thumb-size, 20px);
    border-radius: 50%;
    background: var(--compa11y-slider-thumb-bg, white);
    border: 2px solid var(--compa11y-slider-thumb-border, #0066cc);
    transform: translate(-50%, -50%);
    cursor: grab;
    touch-action: none;
    outline: none;
  }

  :host([orientation="vertical"]) .slider-thumb {
    top: auto;
    left: 50%;
    transform: translate(-50%, 50%);
  }

  :host([disabled]) .slider-thumb {
    background: var(--compa11y-slider-thumb-bg-disabled, #cbd5e1);
    border-color: var(--compa11y-slider-thumb-border-disabled, #94a3b8);
    cursor: not-allowed;
  }

  .slider-thumb:focus-visible {
    outline: 2px solid var(--compa11y-focus-color, #0066cc);
    outline-offset: 3px;
  }

  /* Disabled host */
  :host([disabled]) {
    opacity: 0.6;
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .slider-thumb,
    .slider-fill {
      transition: none !important;
    }
  }

  /* High contrast */
  @media (forced-colors: active) {
    .slider-track {
      background: ButtonFace;
      border: 1px solid ButtonText;
      forced-color-adjust: none;
    }

    .slider-fill {
      background: Highlight;
      forced-color-adjust: none;
    }

    .slider-thumb {
      background: ButtonFace;
      border-color: ButtonText;
      forced-color-adjust: none;
    }

    .slider-thumb:focus-visible {
      outline: 2px solid Highlight;
    }
  }
`;

/**
 * Skeleton-specific styles
 *
 * CSS custom properties:
 *   --compa11y-skeleton-bg             Skeleton background  (default #e2e8f0)
 *   --compa11y-skeleton-shimmer-color  Shimmer highlight    (default rgba(255,255,255,0.6))
 *   --compa11y-skeleton-radius         Border radius        (default 6px / 4px for text)
 */
export const SKELETON_STYLES = `
  ${BASE_STYLES}

  :host {
    display: block;
  }

  @keyframes compa11y-skeleton-shimmer {
    0%   { transform: translateX(-100%); }
    100% { transform: translateX(100%);  }
  }

  .skeleton {
    display: block;
    position: relative;
    overflow: hidden;
    background: var(--compa11y-skeleton-bg, #e2e8f0);
    border-radius: var(--compa11y-skeleton-radius, 6px);
  }

  .skeleton--text {
    border-radius: var(--compa11y-skeleton-radius, 4px);
  }

  .skeleton--circular {
    border-radius: 50%;
  }

  .skeleton-shimmer {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      var(--compa11y-skeleton-shimmer-color, rgba(255, 255, 255, 0.6)) 50%,
      transparent 100%
    );
  }

  .skeleton--animated .skeleton-shimmer {
    animation: compa11y-skeleton-shimmer 1.5s ease-in-out infinite;
  }

  /* Reduced motion — fade pulse instead of translate shimmer */
  @media (prefers-reduced-motion: reduce) {
    .skeleton--animated .skeleton-shimmer {
      animation-name: compa11y-skeleton-shimmer-reduced;
      animation-duration: 2s;
    }

    @keyframes compa11y-skeleton-shimmer-reduced {
      0%, 100% { opacity: 0.5; }
      50%       { opacity: 1;   }
    }
  }

  /* High Contrast mode — use system border colors */
  @media (forced-colors: active) {
    .skeleton {
      background: ButtonFace;
      border: 1px solid ButtonText;
      forced-color-adjust: none;
    }

    .skeleton-shimmer {
      display: none;
    }
  }
`;

/**
 * EmptyState-specific styles
 */
export const EMPTY_STATE_STYLES = `
  ${BASE_STYLES}

  :host {
    display: block;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: var(--compa11y-empty-state-gap, 0.75rem);
    padding: var(--compa11y-empty-state-padding, 3rem 1.5rem);
  }

  .icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--compa11y-empty-state-icon-color, #9ca3af);
    font-size: var(--compa11y-empty-state-icon-size, 3rem);
  }

  /* Hide icon wrapper when nothing is slotted into "icon" */
  .icon-wrapper:not(:has(slot[name="icon"] ~ *)):empty {
    display: none;
  }

  .title {
    margin: 0;
    font-size: var(--compa11y-empty-state-title-size, 1.125rem);
    font-weight: var(--compa11y-empty-state-title-weight, 600);
    color: var(--compa11y-empty-state-title-color, inherit);
    line-height: 1.3;
  }

  .description {
    margin: 0;
    font-size: var(--compa11y-empty-state-description-size, 0.9375rem);
    color: var(--compa11y-empty-state-description-color, #6b7280);
    max-width: var(--compa11y-empty-state-description-max-width, 36ch);
    line-height: 1.5;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: var(--compa11y-empty-state-actions-gap, 0.5rem);
    margin-top: var(--compa11y-empty-state-actions-margin, 0.25rem);
  }

  /* Hide actions wrapper when slot is empty */
  .actions:not(:has(*)) {
    display: none;
  }

  /* Reduced motion — no animations present in this component, future-proof */
  @media (prefers-reduced-motion: reduce) {
    .empty-state * {
      transition: none !important;
      animation: none !important;
    }
  }

  /* High Contrast mode */
  @media (forced-colors: active) {
    .title {
      color: CanvasText;
    }

    .description {
      color: CanvasText;
    }

    .icon-wrapper {
      color: CanvasText;
    }
  }
`;

/**
 * NumberField-specific styles
 *
 * CSS custom properties:
 *   --compa11y-number-field-input-bg              Input background (default: white)
 *   --compa11y-number-field-input-border          Input border (default: 1px solid #ccc)
 *   --compa11y-number-field-input-border-focus    Border color on focus (default: #0066cc)
 *   --compa11y-number-field-input-border-error    Border color on error (default: #ef4444)
 *   --compa11y-number-field-input-radius          Border radius (default: 4px)
 *   --compa11y-number-field-input-padding         Input padding (default: 0.5rem 0.75rem)
 *   --compa11y-number-field-input-font-size       Font size (default: 0.875rem)
 *   --compa11y-number-field-label-color           Label color (default: inherit)
 *   --compa11y-number-field-label-size            Label font size (default: 0.875rem)
 *   --compa11y-number-field-label-weight          Label font weight (default: 500)
 *   --compa11y-number-field-hint-color            Hint text color (default: #666)
 *   --compa11y-number-field-error-color           Error text color (default: #ef4444)
 *   --compa11y-number-field-stepper-bg            Stepper button background (default: #f0f0f0)
 *   --compa11y-number-field-stepper-color         Stepper button color (default: inherit)
 *   --compa11y-number-field-stepper-border        Stepper button border (default: 1px solid #ccc)
 */
export const NUMBER_FIELD_STYLES = `
  ${BASE_STYLES}

  :host {
    display: block;
  }

  .number-field-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .number-field-label {
    display: block;
    color: var(--compa11y-number-field-label-color, inherit);
    font-size: var(--compa11y-number-field-label-size, 0.875rem);
    font-weight: var(--compa11y-number-field-label-weight, 500);
  }

  :host([disabled]) .number-field-label {
    color: var(--compa11y-number-field-label-disabled-color, #999);
  }

  .number-field-required {
    color: var(--compa11y-number-field-required-color, #ef4444);
    margin-left: 0.125rem;
  }

  .number-field-control {
    display: flex;
    align-items: stretch;
  }

  .number-field-input {
    flex: 1;
    min-width: 0;
    padding: var(--compa11y-number-field-input-padding, 0.5rem 0.75rem);
    border: var(--compa11y-number-field-input-border, 1px solid #ccc);
    font-size: var(--compa11y-number-field-input-font-size, 0.875rem);
    font-family: inherit;
    background: var(--compa11y-number-field-input-bg, white);
    color: inherit;
    text-align: right;
    border-radius: var(--compa11y-number-field-input-radius, 4px);
    /* Remove native number-input spinners */
    -moz-appearance: textfield;
  }

  .number-field-input::-webkit-inner-spin-button,
  .number-field-input::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Steppers present — remove adjacent border-radius */
  .number-field-control:has(.number-field-dec) .number-field-input {
    border-radius: 0;
  }

  .number-field-input:focus-visible {
    outline: 2px solid var(--compa11y-focus-color, #0066cc);
    outline-offset: -1px;
    border-color: var(--compa11y-number-field-input-border-focus, #0066cc);
  }

  :host([data-error]) .number-field-input {
    border-color: var(--compa11y-number-field-input-border-error, #ef4444);
  }

  :host([data-error]) .number-field-input:focus-visible {
    outline-color: var(--compa11y-number-field-input-border-error, #ef4444);
    border-color: var(--compa11y-number-field-input-border-error, #ef4444);
  }

  :host([disabled]) .number-field-input {
    background: var(--compa11y-number-field-input-disabled-bg, #f5f5f5);
    opacity: var(--compa11y-number-field-input-disabled-opacity, 0.7);
    cursor: not-allowed;
  }

  :host([readonly]) .number-field-input {
    background: var(--compa11y-number-field-input-readonly-bg, #f9f9f9);
  }

  /* Stepper buttons */
  .number-field-dec,
  .number-field-inc {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 44px;
    min-height: 44px;
    padding: 0 0.75rem;
    background: var(--compa11y-number-field-stepper-bg, #f0f0f0);
    color: var(--compa11y-number-field-stepper-color, inherit);
    border: var(--compa11y-number-field-stepper-border, 1px solid #ccc);
    font-size: 1.25rem;
    line-height: 1;
    font-weight: 400;
    cursor: pointer;
    user-select: none;
    flex-shrink: 0;
    font-family: inherit;
  }

  .number-field-dec {
    border-right: none;
    border-radius: var(--compa11y-number-field-input-radius, 4px) 0 0 var(--compa11y-number-field-input-radius, 4px);
  }

  .number-field-inc {
    border-left: none;
    border-radius: 0 var(--compa11y-number-field-input-radius, 4px) var(--compa11y-number-field-input-radius, 4px) 0;
  }

  :host([data-error]) .number-field-dec,
  :host([data-error]) .number-field-inc {
    border-color: var(--compa11y-number-field-input-border-error, #ef4444);
  }

  .number-field-dec:disabled,
  .number-field-inc:disabled {
    background: var(--compa11y-number-field-stepper-disabled-bg, #f5f5f5);
    color: var(--compa11y-number-field-stepper-disabled-color, #999);
    cursor: not-allowed;
    opacity: 0.5;
  }

  .number-field-dec:focus-visible,
  .number-field-inc:focus-visible {
    outline: 2px solid var(--compa11y-focus-color, #0066cc);
    outline-offset: 2px;
    position: relative;
    z-index: 1;
  }

  /* Hint */
  .number-field-hint {
    color: var(--compa11y-number-field-hint-color, #666);
    font-size: var(--compa11y-number-field-hint-size, 0.8125rem);
  }

  /* Error */
  .number-field-error {
    color: var(--compa11y-number-field-error-color, #ef4444);
    font-size: var(--compa11y-number-field-error-size, 0.8125rem);
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .number-field-input,
    .number-field-dec,
    .number-field-inc {
      transition: none !important;
    }
  }

  /* High Contrast mode */
  @media (forced-colors: active) {
    .number-field-input {
      border: 1px solid ButtonText;
      background: Field;
      color: FieldText;
    }

    .number-field-dec,
    .number-field-inc {
      border: 1px solid ButtonText;
      background: ButtonFace;
      color: ButtonText;
    }

    .number-field-dec:disabled,
    .number-field-inc:disabled {
      color: GrayText;
      border-color: GrayText;
    }
  }
`;

/**
 * SearchField styles
 *
 * CSS custom properties:
 *   --compa11y-search-field-bg            Input background (default: white)
 *   --compa11y-search-field-border        Input border (default: 1px solid #ccc)
 *   --compa11y-search-field-border-focus  Focus border color (default: #0066cc)
 *   --compa11y-search-field-border-error  Error border color (default: #ef4444)
 *   --compa11y-search-field-radius        Border radius (default: 4px)
 *   --compa11y-search-field-disabled-bg   Disabled background (default: #f5f5f5)
 *   --compa11y-search-field-label-color   Label text color
 *   --compa11y-search-field-label-size    Label font size (default: 0.875rem)
 *   --compa11y-search-field-label-weight  Label font weight (default: 500)
 *   --compa11y-search-field-font-size     Input font size (default: 0.875rem)
 *   --compa11y-search-field-hint-color    Hint text color (default: #666)
 *   --compa11y-search-field-error-color   Error text color (default: #ef4444)
 *   --compa11y-search-field-icon-color    Icon color (default: #777)
 *   --compa11y-search-field-clear-color   Clear button color (default: #777)
 *   --compa11y-search-field-btn-bg        Submit button background (default: #0066cc)
 *   --compa11y-search-field-btn-color     Submit button text (default: white)
 *   --compa11y-focus-color                Global focus ring color (default: #0066cc)
 */
export const SEARCH_FIELD_STYLES = `
  :host {
    display: block;
    box-sizing: border-box;
    font-family: inherit;
  }

  *,
  *::before,
  *::after {
    box-sizing: inherit;
  }

  /* Layout */
  .search-field-root {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  /* Label */
  .search-field-label {
    display: block;
    color: var(--compa11y-search-field-label-color, inherit);
    font-size: var(--compa11y-search-field-label-size, 0.875rem);
    font-weight: var(--compa11y-search-field-label-weight, 500);
  }

  :host([disabled]) .search-field-label {
    color: var(--compa11y-search-field-disabled-color, #999);
  }

  /* Hint */
  .search-field-hint {
    color: var(--compa11y-search-field-hint-color, #666);
    font-size: var(--compa11y-search-field-hint-size, 0.8125rem);
  }

  /* Input row (inside form[role="search"]) */
  .search-field-wrapper {
    display: flex;
    align-items: center;
    border: var(--compa11y-search-field-border, 1px solid #ccc);
    border-radius: var(--compa11y-search-field-radius, 4px);
    background: var(--compa11y-search-field-bg, white);
    overflow: hidden;
    transition: border-color 0.15s;
  }

  :host([data-error]) .search-field-wrapper {
    border-color: var(--compa11y-search-field-border-error, #ef4444);
  }

  :host([disabled]) .search-field-wrapper {
    background: var(--compa11y-search-field-disabled-bg, #f5f5f5);
  }

  .search-field-wrapper:focus-within {
    outline: 2px solid var(--compa11y-focus-color, #0066cc);
    outline-offset: 2px;
    border-color: var(--compa11y-search-field-border-focus, #0066cc);
  }

  :host([data-error]) .search-field-wrapper:focus-within {
    outline-color: var(--compa11y-search-field-border-error, #ef4444);
  }

  /* Search icon */
  .search-field-icon {
    display: flex;
    align-items: center;
    padding-left: 0.625rem;
    color: var(--compa11y-search-field-icon-color, #777);
    flex-shrink: 0;
    pointer-events: none;
  }

  /* Input */
  .search-field-input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    padding: 0.5rem 0.5rem 0.5rem 0.375rem;
    font-size: var(--compa11y-search-field-font-size, 0.875rem);
    font-family: inherit;
    color: inherit;
    min-width: 0;
  }

  .search-field-input:disabled {
    cursor: not-allowed;
    color: var(--compa11y-search-field-disabled-color, #999);
  }

  /* Hide webkit native cancel button */
  .search-field-input::-webkit-search-cancel-button,
  .search-field-input::-webkit-search-decoration {
    -webkit-appearance: none;
    appearance: none;
  }

  /* Loading spinner */
  .search-field-spinner {
    display: flex;
    align-items: center;
    padding-right: 0.375rem;
    color: var(--compa11y-search-field-spinner-color, #777);
    flex-shrink: 0;
  }

  @keyframes compa11y-search-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  .search-field-spinner svg {
    animation: compa11y-search-spin 0.8s linear infinite;
  }

  /* Clear button */
  .search-field-clear {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    padding: 0.25rem;
    margin: 0 0.125rem;
    cursor: pointer;
    color: var(--compa11y-search-field-clear-color, #777);
    border-radius: var(--compa11y-search-field-clear-radius, 2px);
    min-width: 1.75rem;
    min-height: 1.75rem;
    flex-shrink: 0;
    font-family: inherit;
  }

  .search-field-clear:focus-visible {
    outline: 2px solid var(--compa11y-focus-color, #0066cc);
    outline-offset: 2px;
  }

  .search-field-clear:hover {
    color: var(--compa11y-search-field-clear-hover-color, #333);
  }

  /* Submit button */
  .search-field-submit {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    background: var(--compa11y-search-field-btn-bg, #0066cc);
    color: var(--compa11y-search-field-btn-color, white);
    border: none;
    padding: 0.5rem 0.875rem;
    cursor: pointer;
    font-size: var(--compa11y-search-field-font-size, 0.875rem);
    font-family: inherit;
    font-weight: 500;
    flex-shrink: 0;
    align-self: stretch;
    white-space: nowrap;
  }

  .search-field-submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .search-field-submit:focus-visible {
    outline: 2px solid var(--compa11y-focus-color, #0066cc);
    outline-offset: 2px;
  }

  /* Error */
  .search-field-error {
    color: var(--compa11y-search-field-error-color, #ef4444);
    font-size: var(--compa11y-search-field-error-size, 0.8125rem);
  }

  /* Visually hidden (for status live region) */
  .search-field-status {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .search-field-wrapper {
      transition: none;
    }
    .search-field-spinner svg {
      animation: none;
    }
  }

  /* High Contrast */
  @media (forced-colors: active) {
    .search-field-wrapper {
      border: 1px solid ButtonText;
      background: Field;
    }
    .search-field-input {
      color: FieldText;
      background: Field;
    }
    .search-field-clear,
    .search-field-submit {
      border: 1px solid ButtonText;
      background: ButtonFace;
      color: ButtonText;
    }
    .search-field-submit:disabled {
      color: GrayText;
      border-color: GrayText;
    }
  }
`;

// =============================================================================
// FileUpload
// =============================================================================

export const FILE_UPLOAD_STYLES = `
  :host {
    display: block;
    box-sizing: border-box;
    font-family: inherit;
  }

  :host([hidden]) {
    display: none !important;
  }

  *, *::before, *::after {
    box-sizing: inherit;
  }

  .visually-hidden {
    ${VISUALLY_HIDDEN_STYLES}
  }

  .file-upload-root {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .file-upload-label {
    display: block;
    color: var(--compa11y-file-upload-label-color, inherit);
    font-size: var(--compa11y-file-upload-label-size, 0.875rem);
    font-weight: var(--compa11y-file-upload-label-weight, 500);
  }

  :host([disabled]) .file-upload-label {
    color: var(--compa11y-file-upload-disabled-color, #999);
  }

  .file-upload-description {
    color: var(--compa11y-file-upload-hint-color, #666);
    font-size: var(--compa11y-file-upload-hint-size, 0.8125rem);
  }

  .file-upload-dropzone {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-height: 120px;
    padding: 1.5rem;
    border: var(--compa11y-file-upload-dropzone-border, 2px dashed #ccc);
    border-radius: var(--compa11y-file-upload-border-radius, 8px);
    background: var(--compa11y-file-upload-dropzone-bg, #fafafa);
    cursor: pointer;
    text-align: center;
    transition: border-color 0.15s, background-color 0.15s;
  }

  .file-upload-dropzone[data-drag-over] {
    border-color: var(--compa11y-file-upload-dropzone-border-active-color, #0066cc);
    border-style: dashed;
    background: var(--compa11y-file-upload-dropzone-bg-active, #f0f7ff);
  }

  :host([disabled]) .file-upload-dropzone {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  .file-upload-dropzone:focus-visible {
    outline: 2px solid var(--compa11y-focus-color, #0066cc);
    outline-offset: 2px;
  }

  .file-upload-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .file-upload-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: var(--compa11y-file-upload-item-bg, #f5f5f5);
    border: var(--compa11y-file-upload-item-border, 1px solid #e5e5e5);
    border-radius: var(--compa11y-file-upload-border-radius, 6px);
  }

  .file-upload-item[data-status="error"] {
    border-color: var(--compa11y-file-upload-error-color, #ef4444);
  }

  .file-upload-item-name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.875rem;
  }

  .file-upload-item-size {
    flex-shrink: 0;
    color: #666;
    font-size: 0.8125rem;
  }

  .file-upload-item-progress {
    width: 60px;
    height: 4px;
    background: var(--compa11y-file-upload-progress-bg, #e5e5e5);
    border-radius: 2px;
    overflow: hidden;
    flex-shrink: 0;
  }

  .file-upload-item-progress-fill {
    height: 100%;
    background: var(--compa11y-file-upload-progress-fill, #0066cc);
    transition: width 0.2s;
  }

  .file-upload-item-error {
    color: var(--compa11y-file-upload-error-color, #ef4444);
    font-size: 0.8125rem;
  }

  .file-upload-item-remove {
    ${RESET_BUTTON_STYLES}
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 28px;
    min-height: 28px;
    border-radius: 4px;
    flex-shrink: 0;
    color: #666;
  }

  .file-upload-item-remove:hover {
    background: rgba(0, 0, 0, 0.05);
    color: #333;
  }

  .file-upload-item-remove:focus-visible {
    outline: 2px solid var(--compa11y-focus-color, #0066cc);
    outline-offset: 2px;
  }

  .file-upload-item-remove:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .file-upload-error {
    color: var(--compa11y-file-upload-error-color, #ef4444);
    font-size: var(--compa11y-file-upload-error-size, 0.8125rem);
  }

  @media (prefers-reduced-motion: reduce) {
    .file-upload-dropzone {
      transition: none;
    }
    .file-upload-item-progress-fill {
      transition: none;
    }
  }

  @media (forced-colors: active) {
    .file-upload-dropzone {
      border-color: ButtonText;
      background: Field;
    }
    .file-upload-dropzone[data-drag-over] {
      border-color: Highlight;
    }
    .file-upload-item {
      border: 1px solid ButtonText;
      background: Field;
    }
    .file-upload-item[data-status="error"] {
      border-color: LinkText;
    }
    .file-upload-item-remove {
      border: 1px solid ButtonText;
      background: ButtonFace;
      color: ButtonText;
    }
    .file-upload-item-remove:disabled {
      color: GrayText;
      border-color: GrayText;
    }
    .file-upload-error {
      color: LinkText;
    }
  }
`;

/**
 * ErrorSummary-specific styles
 */
export const ERROR_SUMMARY_STYLES = `
  ${BASE_STYLES}

  :host {
    display: block;
  }

  .error-summary {
    position: relative;
    padding: var(--compa11y-error-summary-padding, 1rem 1.25rem);
    background: var(--compa11y-error-summary-bg, white);
    border: var(--compa11y-error-summary-border, 1px solid #e0e0e0);
    border-left: 4px solid var(--compa11y-error-summary-accent-color, #ef4444);
    border-radius: var(--compa11y-error-summary-radius, 6px);
  }

  .error-summary:focus {
    outline: 2px solid var(--compa11y-focus-color, #0066cc);
    outline-offset: 2px;
  }

  :host([dismissible]) .error-summary {
    padding-right: 3rem;
  }

  .error-summary-title {
    margin: 0 0 0.5rem 0;
    font-size: var(--compa11y-error-summary-title-size, 1.125rem);
    font-weight: var(--compa11y-error-summary-title-weight, 600);
    color: var(--compa11y-error-summary-title-color, inherit);
  }

  .error-summary-description {
    margin: 0 0 0.75rem 0;
    font-size: var(--compa11y-error-summary-description-size, 0.875rem);
    color: var(--compa11y-error-summary-description-color, #555);
  }

  .error-summary-list {
    margin: 0;
    padding-left: var(--compa11y-error-summary-list-indent, 1.25rem);
    list-style: none;
  }

  .error-summary-list li {
    margin-bottom: 0.25rem;
    font-size: var(--compa11y-error-summary-item-size, 0.875rem);
  }

  .error-summary-list a {
    color: var(--compa11y-error-summary-link-color, #ef4444);
    text-decoration: underline;
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0;
    cursor: pointer;
  }

  .error-summary-list a:hover {
    color: var(--compa11y-error-summary-link-hover-color, #dc2626);
  }

  .error-summary-list a:focus-visible {
    outline: 2px solid var(--compa11y-focus-color, #0066cc);
    outline-offset: 2px;
  }

  .error-summary-actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--compa11y-error-summary-actions-gap, 0.5rem);
    margin-top: var(--compa11y-error-summary-actions-margin, 0.75rem);
  }

  .error-summary-dismiss {
    ${RESET_BUTTON_STYLES}
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    width: 2rem;
    height: 2rem;
    min-width: 44px;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    color: var(--compa11y-error-summary-dismiss-color, #999);
    font-size: 1.25rem;
    line-height: 1;
  }

  .error-summary-dismiss:hover {
    background: var(--compa11y-error-summary-dismiss-hover-bg, rgba(0, 0, 0, 0.05));
    color: var(--compa11y-error-summary-dismiss-hover-color, #333);
  }

  .error-summary-dismiss:focus-visible {
    outline: 2px solid var(--compa11y-focus-color, #0066cc);
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    .error-summary,
    .error-summary * {
      transition: none !important;
      animation: none !important;
    }
  }

  @media (forced-colors: active) {
    .error-summary {
      border: 2px solid ButtonText;
    }
    .error-summary-list a {
      color: LinkText;
    }
    .error-summary-list a:hover {
      color: ActiveText;
    }
    .error-summary-dismiss {
      border: 1px solid ButtonText;
      background: ButtonFace;
      color: ButtonText;
    }
    .error-summary:focus,
    .error-summary-list a:focus-visible,
    .error-summary-dismiss:focus-visible {
      outline: 2px solid Highlight;
    }
  }
`;

// ============================================================================
// Stepper
// ============================================================================

export const STEPPER_STYLES = `
  :host {
    display: block;
    box-sizing: border-box;
    --compa11y-stepper-indicator-size: 32px;
    --compa11y-stepper-indicator-bg-upcoming: #e2e8f0;
    --compa11y-stepper-indicator-bg-current: #0066cc;
    --compa11y-stepper-indicator-bg-completed: #22c55e;
    --compa11y-stepper-indicator-bg-error: #ef4444;
    --compa11y-stepper-indicator-bg-locked: #94a3b8;
    --compa11y-stepper-indicator-color-upcoming: #64748b;
    --compa11y-stepper-indicator-color-current: #fff;
    --compa11y-stepper-indicator-color-completed: #fff;
    --compa11y-stepper-indicator-color-error: #fff;
    --compa11y-stepper-indicator-color-locked: #fff;
    --compa11y-stepper-indicator-border-current: #0066cc;
    --compa11y-stepper-connector-bg: #e2e8f0;
    --compa11y-stepper-connector-bg-completed: #22c55e;
    --compa11y-stepper-label-size: 0.875rem;
    --compa11y-stepper-label-color: inherit;
    --compa11y-stepper-label-color-locked: #94a3b8;
    --compa11y-stepper-label-color-error: #ef4444;
    --compa11y-stepper-description-size: 0.75rem;
    --compa11y-stepper-description-color: #64748b;
    --compa11y-stepper-count-size: 0.875rem;
    --compa11y-stepper-count-color: #64748b;
    --compa11y-stepper-btn-radius: 8px;
  }

  :host([hidden]) {
    display: none !important;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .step-count {
    font-size: var(--compa11y-stepper-count-size);
    color: var(--compa11y-stepper-count-color);
    margin-bottom: 8px;
  }

  .stepper-list {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
    width: 100%;
  }

  .stepper-list.horizontal {
    flex-direction: row;
    align-items: center;
  }

  .stepper-list.vertical {
    flex-direction: column;
  }

  .stepper-item {
    display: flex;
    position: relative;
  }

  .stepper-item.horizontal {
    flex-direction: column;
    align-items: center;
    flex: 1 1 0;
    text-align: center;
    gap: 8px;
  }

  .stepper-item.vertical {
    flex-direction: row;
    align-items: flex-start;
    gap: 12px;
    padding-bottom: 24px;
  }

  .stepper-item.vertical:last-child {
    padding-bottom: 0;
  }

  /* Indicator circle */
  .stepper-indicator {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--compa11y-stepper-indicator-size);
    height: var(--compa11y-stepper-indicator-size);
    min-width: var(--compa11y-stepper-indicator-size);
    border-radius: 50%;
    font-size: 0.875rem;
    font-weight: 500;
    flex-shrink: 0;
    border: 2px solid transparent;
    transition: background 0.2s ease, border-color 0.2s ease;
  }

  .stepper-indicator[data-state="upcoming"] {
    background: var(--compa11y-stepper-indicator-bg-upcoming);
    color: var(--compa11y-stepper-indicator-color-upcoming);
  }
  .stepper-indicator[data-state="current"] {
    background: var(--compa11y-stepper-indicator-bg-current);
    color: var(--compa11y-stepper-indicator-color-current);
    font-weight: 700;
    border-color: var(--compa11y-stepper-indicator-border-current);
  }
  .stepper-indicator[data-state="completed"] {
    background: var(--compa11y-stepper-indicator-bg-completed);
    color: var(--compa11y-stepper-indicator-color-completed);
  }
  .stepper-indicator[data-state="error"] {
    background: var(--compa11y-stepper-indicator-bg-error);
    color: var(--compa11y-stepper-indicator-color-error);
  }
  .stepper-indicator[data-state="locked"] {
    background: var(--compa11y-stepper-indicator-bg-locked);
    color: var(--compa11y-stepper-indicator-color-locked);
  }

  /* Connector lines */
  .stepper-connector {
    background: var(--compa11y-stepper-connector-bg);
    transition: background 0.2s ease;
  }
  .stepper-connector.completed {
    background: var(--compa11y-stepper-connector-bg-completed);
  }

  .stepper-list.horizontal .stepper-connector {
    flex: 1 1 0;
    height: 2px;
    align-self: center;
  }

  .stepper-list.vertical .stepper-connector {
    position: absolute;
    left: calc(var(--compa11y-stepper-indicator-size) / 2);
    top: calc(var(--compa11y-stepper-indicator-size) + 4px);
    width: 2px;
    bottom: 4px;
  }

  /* Text */
  .stepper-text {
    display: flex;
    flex-direction: column;
  }

  .stepper-label {
    font-size: var(--compa11y-stepper-label-size);
    font-weight: 400;
  }

  [data-state="current"] .stepper-label,
  [data-state="current"] > .stepper-text .stepper-label {
    font-weight: 600;
  }

  [data-state="locked"] .stepper-label {
    color: var(--compa11y-stepper-label-color-locked);
  }
  [data-state="error"] .stepper-label {
    color: var(--compa11y-stepper-label-color-error);
  }

  .stepper-description {
    font-size: var(--compa11y-stepper-description-size);
    color: var(--compa11y-stepper-description-color);
    margin-top: 2px;
  }

  /* Button (navigation mode) */
  .stepper-btn {
    appearance: none;
    background: none;
    border: none;
    padding: 8px;
    margin: 0;
    font: inherit;
    color: inherit;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    border-radius: var(--compa11y-stepper-btn-radius);
    min-width: 44px;
    min-height: 44px;
    width: 100%;
    text-align: inherit;
  }

  .stepper-list.horizontal .stepper-btn {
    flex-direction: column;
    text-align: center;
  }

  .stepper-list.vertical .stepper-btn {
    flex-direction: row;
    text-align: left;
    gap: 12px;
  }

  .stepper-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .stepper-btn:focus-visible {
    outline: 2px solid var(--compa11y-focus-color, #0066cc);
    outline-offset: 2px;
  }

  .stepper-btn:not(:disabled):hover {
    background: var(--compa11y-stepper-btn-hover-bg, rgba(0, 0, 0, 0.04));
  }

  @media (prefers-reduced-motion: reduce) {
    .stepper-indicator,
    .stepper-connector {
      transition: none;
    }
  }

  @media (forced-colors: active) {
    .stepper-indicator {
      border: 2px solid ButtonText;
    }
    .stepper-indicator[data-state="current"] {
      border-color: Highlight;
      background: Highlight;
      color: HighlightText;
    }
    .stepper-indicator[data-state="completed"] {
      border-color: ButtonText;
    }
    .stepper-indicator[data-state="error"] {
      border-color: ActiveText;
      color: ActiveText;
    }
    .stepper-connector {
      background: ButtonText;
    }
    .stepper-connector.completed {
      background: ButtonText;
    }
    .stepper-btn:focus-visible {
      outline: 2px solid Highlight;
    }
  }
`;

/**
 * DataGrid global styles (light DOM table)
 */
export const DATA_GRID_STYLES = `
  /* ── Host ── */
  compa11y-data-grid {
    display: block;
  }

  /* ── Wrapper ── */
  compa11y-data-grid [data-datagrid-wrapper] {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  /* ── Table element ── */
  compa11y-data-grid table {
    border-collapse: collapse;
    width: 100%;
    font-size: 0.9375rem;
    color: var(--compa11y-datagrid-color, #1a1a1a);
    background: var(--compa11y-datagrid-bg, #ffffff);
  }

  /* ── Caption ── */
  compa11y-data-grid caption {
    caption-side: top;
    text-align: left;
    font-weight: 600;
    font-size: 1rem;
    padding-bottom: 0.5rem;
    color: var(--compa11y-datagrid-caption-color, #1a1a1a);
  }

  /* ── Header cells ── */
  compa11y-data-grid th {
    text-align: left;
    font-weight: 600;
    padding: var(--compa11y-datagrid-cell-padding, 0.625rem 0.875rem);
    background: var(--compa11y-datagrid-head-bg, #f5f5f5);
    border-bottom: 2px solid var(--compa11y-datagrid-border-color, #d0d0d0);
    white-space: nowrap;
  }

  /* ── Sticky header ── */
  compa11y-data-grid[sticky-header] thead th {
    position: sticky;
    top: 0;
    z-index: 1;
  }

  /* ── Data cells ── */
  compa11y-data-grid td {
    padding: var(--compa11y-datagrid-cell-padding, 0.625rem 0.875rem);
    border-bottom: 1px solid var(--compa11y-datagrid-border-color, #e8e8e8);
    vertical-align: top;
  }

  /* ── Compact ── */
  compa11y-data-grid[compact] th,
  compa11y-data-grid[compact] td {
    padding: var(--compa11y-datagrid-compact-padding, 0.375rem 0.625rem);
  }

  /* ── Bordered ── */
  compa11y-data-grid[bordered] th,
  compa11y-data-grid[bordered] td {
    border: 1px solid var(--compa11y-datagrid-border-color, #d0d0d0);
  }

  /* ── Striped ── */
  compa11y-data-grid[striped] tbody tr:nth-child(even) {
    background: var(--compa11y-datagrid-stripe-bg, #fafafa);
  }

  /* ── Row hover ── */
  compa11y-data-grid tbody tr:hover {
    background: var(--compa11y-datagrid-row-hover-bg, #f0f0f0);
  }

  /* ── Selected row ── */
  compa11y-data-grid tr[aria-selected="true"] {
    background: var(--compa11y-datagrid-selected-bg, #e8f0fe);
  }
  compa11y-data-grid tr[aria-selected="true"]:hover {
    background: var(--compa11y-datagrid-selected-hover-bg, #dde7fd);
  }

  /* ── Sort button ── */
  compa11y-data-grid [data-sort-btn] {
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

  compa11y-data-grid [data-sort-btn]:focus-visible {
    outline: 2px solid var(--compa11y-focus-color, #0066cc);
    outline-offset: 2px;
    border-radius: 2px;
  }

  compa11y-data-grid [data-sort-icon] {
    font-size: 0.75em;
    opacity: 0.6;
    flex-shrink: 0;
  }

  /* ── Select checkboxes ── */
  compa11y-data-grid [data-select-cb] {
    cursor: pointer;
    min-width: 18px;
    min-height: 18px;
  }
  compa11y-data-grid [data-select-cb]:focus-visible {
    outline: 2px solid var(--compa11y-focus-color, #0066cc);
    outline-offset: 2px;
  }

  /* ── Grid cell focus (grid mode) ── */
  compa11y-data-grid[mode="grid"] td:focus,
  compa11y-data-grid[mode="grid"] th:focus {
    outline: 2px solid var(--compa11y-focus-color, #0066cc);
    outline-offset: -2px;
  }

  /* ── Editable cell ── */
  compa11y-data-grid td[data-editable] {
    cursor: text;
  }
  compa11y-data-grid td[data-editing] input {
    width: 100%;
    border: 2px solid var(--compa11y-focus-color, #0066cc);
    padding: 0.25rem;
    font: inherit;
    outline: none;
  }

  /* ── Empty / Loading cells ── */
  compa11y-data-grid [data-empty-cell],
  compa11y-data-grid [data-loading-cell] {
    text-align: center;
    padding: 2rem 1rem;
    color: var(--compa11y-datagrid-muted-color, #6b6b6b);
    font-style: italic;
  }

  /* ── Error cell ── */
  compa11y-data-grid [data-error-cell] {
    text-align: center;
    padding: 2rem 1rem;
    color: var(--compa11y-datagrid-error-color, #d32f2f);
  }

  /* ── Toolbar ── */
  compa11y-data-grid [data-datagrid-toolbar] {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 0;
    flex-wrap: wrap;
  }

  /* ── Pagination ── */
  compa11y-data-grid [data-datagrid-pagination] {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.75rem 0;
    flex-wrap: wrap;
    font-size: 0.875rem;
  }

  compa11y-data-grid [data-datagrid-page-size] {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  compa11y-data-grid [data-datagrid-page-size] select {
    padding: 0.25rem 0.5rem;
    border: 1px solid var(--compa11y-datagrid-border-color, #d0d0d0);
    border-radius: 4px;
    font: inherit;
    font-size: 0.875rem;
    background: var(--compa11y-datagrid-bg, #ffffff);
  }

  compa11y-data-grid [data-datagrid-page-buttons] {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  compa11y-data-grid [data-datagrid-page-buttons] button {
    appearance: none;
    -webkit-appearance: none;
    background: var(--compa11y-datagrid-pagination-btn-bg, #ffffff);
    border: 1px solid var(--compa11y-datagrid-border-color, #d0d0d0);
    border-radius: 4px;
    padding: 0.375rem 0.75rem;
    font: inherit;
    font-size: 0.875rem;
    cursor: pointer;
    min-width: 2.75rem;
    min-height: 2.75rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  compa11y-data-grid [data-datagrid-page-buttons] button:hover:not(:disabled) {
    background: var(--compa11y-datagrid-pagination-btn-hover-bg, #f0f0f0);
  }

  compa11y-data-grid [data-datagrid-page-buttons] button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  compa11y-data-grid [data-datagrid-page-buttons] button[aria-current="page"] {
    background: var(--compa11y-datagrid-pagination-active-bg, #0066cc);
    color: var(--compa11y-datagrid-pagination-active-color, #ffffff);
    border-color: var(--compa11y-datagrid-pagination-active-bg, #0066cc);
    font-weight: 600;
  }

  compa11y-data-grid [data-datagrid-page-buttons] button:focus-visible {
    outline: 2px solid var(--compa11y-focus-color, #0066cc);
    outline-offset: 2px;
  }

  /* ── Reduced motion ── */
  @media (prefers-reduced-motion: reduce) {
    compa11y-data-grid * {
      transition: none !important;
    }
  }

  /* ── High contrast ── */
  @media (forced-colors: active) {
    compa11y-data-grid th {
      border-bottom-color: ButtonText;
    }
    compa11y-data-grid td {
      border-bottom-color: ButtonText;
    }
    compa11y-data-grid tr[aria-selected="true"] {
      outline: 2px solid Highlight;
      outline-offset: -2px;
    }
    compa11y-data-grid [data-sort-btn]:focus-visible,
    compa11y-data-grid [data-select-cb]:focus-visible,
    compa11y-data-grid [data-datagrid-page-buttons] button:focus-visible {
      outline-color: Highlight;
    }
    compa11y-data-grid[mode="grid"] td:focus,
    compa11y-data-grid[mode="grid"] th:focus {
      outline-color: Highlight;
    }
  }
`;

/**
 * DatePicker-specific styles
 */
export const DATE_PICKER_STYLES = `
  ${BASE_STYLES}
  ${VISUALLY_HIDDEN_STYLES}

  :host {
    display: inline-block;
    position: relative;
    font-family: var(--compa11y-date-picker-font, inherit);
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* Field row */
  .field-row {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }

  .field-input {
    padding: var(--compa11y-date-picker-input-padding, 0.5rem);
    border: var(--compa11y-date-picker-input-border, 1px solid #ccc);
    border-radius: var(--compa11y-date-picker-input-radius, 0.25rem);
    font: inherit;
    min-width: 10ch;
  }

  .field-input:focus-visible {
    outline: 2px solid var(--compa11y-focus-color, #0066cc);
    outline-offset: 2px;
  }

  .field-input[disabled] {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .trigger-btn {
    appearance: none;
    background: var(--compa11y-date-picker-trigger-bg, none);
    border: var(--compa11y-date-picker-trigger-border, 1px solid #ccc);
    border-radius: var(--compa11y-date-picker-trigger-radius, 0.25rem);
    padding: var(--compa11y-date-picker-trigger-padding, 0.5rem);
    cursor: pointer;
    min-width: 44px;
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: inherit;
  }

  .trigger-btn:focus-visible {
    outline: 2px solid var(--compa11y-focus-color, #0066cc);
    outline-offset: 2px;
  }

  .trigger-btn[disabled] {
    opacity: 0.4;
    cursor: not-allowed;
  }

  /* Overlay */
  .overlay {
    display: none;
    position: fixed;
    inset: 0;
    z-index: 9998;
  }

  :host([open]) .overlay[data-modal] {
    display: block;
    background: rgba(0, 0, 0, 0.5);
  }

  /* Calendar panel */
  .calendar {
    display: none;
    position: fixed;
    z-index: var(--compa11y-date-picker-z-index, 9999);
    background: var(--compa11y-date-picker-bg, #fff);
    border: var(--compa11y-date-picker-border, 1px solid rgba(0,0,0,.15));
    border-radius: var(--compa11y-date-picker-radius, 0.5rem);
    box-shadow: var(--compa11y-date-picker-shadow, 0 4px 16px rgba(0,0,0,.12));
    padding: var(--compa11y-date-picker-padding, 1rem);
    min-width: 300px;
  }

  :host([open]) .calendar {
    display: block;
  }

  .calendar-title {
    margin: 0 0 0.5rem;
    font-size: 1rem;
    font-weight: 600;
  }

  /* Header navigation */
  .calendar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.25rem;
    margin-bottom: 0.5rem;
  }

  .nav-btn,
  .month-year-btn {
    appearance: none;
    background: none;
    border: none;
    padding: 0.25rem 0.5rem;
    cursor: pointer;
    font: inherit;
    color: inherit;
    border-radius: 0.25rem;
    min-width: 44px;
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .nav-btn:hover,
  .month-year-btn:hover {
    background: var(--compa11y-date-picker-hover-bg, rgba(0,0,0,.05));
  }

  .nav-btn:focus-visible,
  .month-year-btn:focus-visible {
    outline: 2px solid var(--compa11y-focus-color, #0066cc);
    outline-offset: 2px;
  }

  /* Day grid */
  .day-grid {
    border-collapse: collapse;
    width: 100%;
  }

  .day-grid th {
    padding: 0.25rem;
    text-align: center;
    font-weight: normal;
    font-size: 0.875rem;
    color: var(--compa11y-date-picker-weekday-color, #666);
  }

  .day-btn {
    appearance: none;
    background: none;
    border: none;
    width: 100%;
    min-width: 44px;
    min-height: 44px;
    padding: 0.25rem;
    cursor: pointer;
    font: inherit;
    color: inherit;
    border-radius: var(--compa11y-date-picker-day-radius, 0.25rem);
    position: relative;
  }

  .day-btn:hover:not([disabled]) {
    background: var(--compa11y-date-picker-day-hover-bg, rgba(0,0,0,.05));
  }

  .day-btn:focus-visible {
    outline: 2px solid var(--compa11y-focus-color, #0066cc);
    outline-offset: -2px;
  }

  .day-btn[disabled] {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .day-btn[data-outside-month] {
    opacity: 0.4;
  }

  .day-btn[data-today] {
    font-weight: bold;
    border: 2px solid var(--compa11y-date-picker-today-border, currentColor);
  }

  .day-btn[data-selected],
  .day-btn[aria-pressed="true"] {
    background: var(--compa11y-date-picker-selected-bg, #0066cc);
    color: var(--compa11y-date-picker-selected-color, #fff);
    font-weight: bold;
  }

  .day-btn[data-range-start],
  .day-btn[data-range-end] {
    background: var(--compa11y-date-picker-selected-bg, #0066cc);
    color: var(--compa11y-date-picker-selected-color, #fff);
    font-weight: bold;
  }

  .day-btn[data-in-range] {
    background: var(--compa11y-date-picker-range-bg, rgba(0, 102, 204, 0.15));
  }

  /* Month/year grids */
  .month-grid,
  .year-grid-inner {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.25rem;
  }

  .month-cell,
  .year-cell {
    appearance: none;
    background: none;
    border: none;
    padding: 0.5rem;
    min-height: 44px;
    cursor: pointer;
    font: inherit;
    color: inherit;
    border-radius: 0.25rem;
    text-align: center;
  }

  .month-cell:hover,
  .year-cell:hover {
    background: var(--compa11y-date-picker-day-hover-bg, rgba(0,0,0,.05));
  }

  .month-cell:focus-visible,
  .year-cell:focus-visible {
    outline: 2px solid var(--compa11y-focus-color, #0066cc);
    outline-offset: 2px;
  }

  .month-cell[data-selected],
  .year-cell[data-selected] {
    background: var(--compa11y-date-picker-selected-bg, #0066cc);
    color: var(--compa11y-date-picker-selected-color, #fff);
    font-weight: bold;
  }

  /* Time panel */
  .time-panel {
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--compa11y-date-picker-divider, rgba(0,0,0,.1));
  }

  .time-panel fieldset {
    border: none;
    padding: 0;
    margin: 0;
  }

  .time-panel legend {
    font-size: 0.875rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .time-row {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .time-input {
    width: 3rem;
    text-align: center;
    padding: 0.25rem;
    border: 1px solid #ccc;
    border-radius: 0.25rem;
    font: inherit;
  }

  .time-input:focus-visible {
    outline: 2px solid var(--compa11y-focus-color, #0066cc);
    outline-offset: 2px;
  }

  .period-btn {
    appearance: none;
    background: none;
    border: 1px solid #ccc;
    padding: 0.25rem 0.5rem;
    min-height: 44px;
    cursor: pointer;
    font: inherit;
    color: inherit;
    border-radius: 0.25rem;
  }

  .period-btn[aria-pressed="true"] {
    background: var(--compa11y-date-picker-selected-bg, #0066cc);
    color: var(--compa11y-date-picker-selected-color, #fff);
    border-color: var(--compa11y-date-picker-selected-bg, #0066cc);
  }

  .period-btn:focus-visible {
    outline: 2px solid var(--compa11y-focus-color, #0066cc);
    outline-offset: 2px;
  }

  /* Actions */
  .actions {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
    margin-top: 0.75rem;
    padding-top: 0.5rem;
    border-top: 1px solid var(--compa11y-date-picker-divider, rgba(0,0,0,.1));
  }

  .actions button {
    appearance: none;
    background: none;
    border: 1px solid #ccc;
    padding: 0.375rem 0.75rem;
    min-height: 44px;
    cursor: pointer;
    font: inherit;
    color: inherit;
    border-radius: 0.25rem;
  }

  .actions button:hover {
    background: var(--compa11y-date-picker-day-hover-bg, rgba(0,0,0,.05));
  }

  .actions button:focus-visible {
    outline: 2px solid var(--compa11y-focus-color, #0066cc);
    outline-offset: 2px;
  }

  .actions button[data-primary] {
    background: var(--compa11y-date-picker-selected-bg, #0066cc);
    color: var(--compa11y-date-picker-selected-color, #fff);
    border-color: var(--compa11y-date-picker-selected-bg, #0066cc);
  }

  /* Summary */
  .summary {
    font-size: 0.875rem;
    margin-top: 0.5rem;
    min-height: 1.5rem;
  }

  /* Hint / Error */
  .hint {
    font-size: 0.875rem;
    color: var(--compa11y-date-picker-hint-color, #666);
    margin-top: 0.25rem;
  }

  .error {
    font-size: 0.875rem;
    color: var(--compa11y-date-picker-error-color, #d32f2f);
    margin-top: 0.25rem;
  }

  /* Label */
  .label {
    display: block;
    font-weight: 500;
    margin-bottom: 0.25rem;
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .calendar {
      transition: none;
    }
  }

  /* High contrast */
  @media (forced-colors: active) {
    .day-btn[data-selected],
    .day-btn[aria-pressed="true"],
    .day-btn[data-range-start],
    .day-btn[data-range-end] {
      background: Highlight;
      color: HighlightText;
      forced-color-adjust: none;
    }

    .day-btn[data-in-range] {
      border: 2px solid Highlight;
    }

    .day-btn[data-today] {
      border-color: ButtonText;
    }

    .day-btn:focus-visible,
    .nav-btn:focus-visible,
    .month-year-btn:focus-visible,
    .month-cell:focus-visible,
    .year-cell:focus-visible,
    .trigger-btn:focus-visible,
    .field-input:focus-visible {
      outline-color: Highlight;
    }

    .period-btn[aria-pressed="true"],
    .month-cell[data-selected],
    .year-cell[data-selected] {
      background: Highlight;
      color: HighlightText;
      forced-color-adjust: none;
    }
  }
`;

export const TIME_PICKER_STYLES = `
  :host {
    display: inline-block;
    position: relative;
    font-family: inherit;
  }

  .time-picker {
    position: relative;
  }

  .time-picker-label {
    display: block;
    font-weight: 600;
    font-size: var(--compa11y-time-picker-label-size, 0.875rem);
    color: var(--compa11y-time-picker-label-color, inherit);
    margin-bottom: 0.25rem;
  }

  .time-picker-required {
    color: var(--compa11y-time-picker-error-color, #d32f2f);
    margin-left: 2px;
  }

  .time-picker-hint {
    font-size: 0.8125rem;
    color: var(--compa11y-time-picker-hint-color, #666);
    margin-bottom: 0.25rem;
  }

  .time-picker-field {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .time-picker-input {
    padding: 0.5rem;
    min-width: 10rem;
    font-size: var(--compa11y-time-picker-font-size, 1rem);
    font-family: inherit;
    border: 1px solid var(--compa11y-time-picker-border, #ccc);
    border-radius: var(--compa11y-time-picker-radius, 4px);
    background: var(--compa11y-time-picker-bg, #fff);
    color: inherit;
  }

  .time-picker-input:focus {
    outline: 2px solid var(--compa11y-focus-color, #2563eb);
    outline-offset: 2px;
  }

  .time-picker-input[aria-invalid="true"] {
    border-color: var(--compa11y-time-picker-error-color, #d32f2f);
  }

  .time-picker-input:disabled {
    opacity: 0.5;
    cursor: default;
    background: var(--compa11y-time-picker-disabled-bg, #f5f5f5);
  }

  .time-picker-clear {
    appearance: none;
    background: transparent;
    border: none;
    padding: 0.25rem 0.5rem;
    cursor: pointer;
    color: var(--compa11y-time-picker-clear-color, #666);
    line-height: 1;
    font-size: 1rem;
  }

  .time-picker-clear:hover {
    color: inherit;
  }

  .time-picker-trigger {
    appearance: none;
    background: var(--compa11y-time-picker-trigger-bg, transparent);
    border: 1px solid var(--compa11y-time-picker-border, #ccc);
    border-radius: var(--compa11y-time-picker-radius, 4px);
    padding: 0.5rem;
    min-width: 44px;
    min-height: 44px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: inherit;
  }

  .time-picker-trigger:focus-visible {
    outline: 2px solid var(--compa11y-focus-color, #2563eb);
    outline-offset: 2px;
  }

  .time-picker-trigger:disabled {
    opacity: 0.5;
    cursor: default;
  }

  .time-picker-listbox {
    position: absolute;
    left: 0;
    right: 0;
    top: 100%;
    margin-top: 4px;
    z-index: 100;
    max-height: 12rem;
    overflow-y: auto;
    padding: 0;
    list-style: none;
    background: var(--compa11y-time-picker-listbox-bg, #fff);
    border: 1px solid var(--compa11y-time-picker-listbox-border, #ccc);
    border-radius: var(--compa11y-time-picker-listbox-radius, 4px);
    box-shadow: var(--compa11y-time-picker-listbox-shadow, 0 4px 12px rgba(0,0,0,0.15));
  }

  .time-picker-option {
    padding: 0.5rem 0.75rem;
    cursor: pointer;
  }

  .time-picker-option.highlighted {
    background: var(--compa11y-time-picker-option-highlight-bg, #e8f0fe);
  }

  .time-picker-option.selected {
    font-weight: 600;
    background: var(--compa11y-time-picker-option-selected-bg, #f0f0f0);
  }

  .time-picker-option.highlighted.selected {
    background: var(--compa11y-time-picker-option-highlight-bg, #e8f0fe);
  }

  .time-picker-option.disabled {
    opacity: 0.5;
    cursor: default;
  }

  .time-picker-empty {
    padding: 0.5rem 0.75rem;
    color: #666;
  }

  .time-picker-error {
    color: var(--compa11y-time-picker-error-color, #d32f2f);
    font-size: 0.8125rem;
    margin-top: 0.25rem;
  }

  @media (prefers-reduced-motion: reduce) {
    .time-picker-listbox {
      transition: none;
    }
  }

  @media (forced-colors: active) {
    .time-picker-input {
      border: 1px solid ButtonText;
    }

    .time-picker-option.highlighted {
      background: Highlight;
      color: HighlightText;
      forced-color-adjust: none;
    }

    .time-picker-option.selected {
      border-left: 3px solid Highlight;
    }
  }
`;

export const TREE_VIEW_STYLES = `
  :host {
    display: block;
    font-family: inherit;
    --compa11y-tree-view-indent: 20px;
    --compa11y-tree-view-node-height: 32px;
    --compa11y-tree-view-color: inherit;
    --compa11y-tree-view-bg: transparent;
    --compa11y-tree-view-hover-bg: rgba(0, 0, 0, 0.04);
    --compa11y-tree-view-selected-bg: rgba(0, 102, 204, 0.08);
    --compa11y-tree-view-focus-outline: 2px solid var(--compa11y-focus-color, #0066cc);
    --compa11y-tree-view-toggle-size: 16px;
    --compa11y-tree-view-icon-size: 16px;
    --compa11y-tree-view-icon-gap: 6px;
  }

  .sr-only {
    ${VISUALLY_HIDDEN_STYLES}
  }

  [data-compa11y-tree-view] {
    color: var(--compa11y-tree-view-color);
    background: var(--compa11y-tree-view-bg);
  }

  [data-compa11y-tree-view-list] {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  [data-compa11y-tree-view-list][data-level] {
    padding-left: var(--compa11y-tree-view-indent);
  }

  [data-compa11y-tree-view-list][data-level="1"] {
    padding-left: 0;
  }

  [data-compa11y-tree-view-node] {
    margin: 0;
    padding: 0;
  }

  [data-compa11y-tree-view-row] {
    display: flex;
    align-items: center;
    min-height: var(--compa11y-tree-view-node-height);
    padding: 0 4px;
    gap: var(--compa11y-tree-view-icon-gap);
    cursor: default;
  }

  [data-compa11y-tree-view-row]:hover {
    background: var(--compa11y-tree-view-hover-bg);
  }

  /* Widget mode treeitem styling */
  [role="treeitem"] {
    display: flex;
    align-items: center;
    min-height: var(--compa11y-tree-view-node-height);
    padding: 0 4px;
    gap: var(--compa11y-tree-view-icon-gap);
    cursor: default;
    outline: none;
  }

  [role="treeitem"]:hover {
    background: var(--compa11y-tree-view-hover-bg);
  }

  [role="treeitem"]:focus-visible,
  [role="treeitem"][data-focused="true"] {
    outline: var(--compa11y-tree-view-focus-outline);
    outline-offset: -2px;
  }

  [role="treeitem"][data-selected="true"] {
    background: var(--compa11y-tree-view-selected-bg);
  }

  [role="treeitem"][data-disabled="true"] {
    opacity: 0.5;
    cursor: default;
  }

  /* Indent widget mode nodes based on level */
  [role="group"] {
    padding-left: var(--compa11y-tree-view-indent);
  }

  /* Toggle button */
  [data-compa11y-tree-view-toggle] {
    ${RESET_BUTTON_STYLES}
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--compa11y-tree-view-toggle-size);
    height: var(--compa11y-tree-view-toggle-size);
    flex-shrink: 0;
    font-size: 10px;
    line-height: 1;
    border-radius: 2px;
  }

  [data-compa11y-tree-view-toggle]:hover {
    background: rgba(0, 0, 0, 0.08);
  }

  [data-compa11y-tree-view-toggle]:focus-visible {
    outline: var(--compa11y-tree-view-focus-outline);
    outline-offset: 1px;
  }

  /* Spacer (leaf nodes, matches toggle width) */
  [data-compa11y-tree-view-spacer] {
    display: inline-block;
    width: var(--compa11y-tree-view-toggle-size);
    flex-shrink: 0;
  }

  /* Icon */
  [data-compa11y-tree-view-icon] {
    display: inline-flex;
    align-items: center;
    width: var(--compa11y-tree-view-icon-size);
    height: var(--compa11y-tree-view-icon-size);
    flex-shrink: 0;
  }

  /* Label */
  [data-compa11y-tree-view-label] {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-decoration: none;
    color: inherit;
  }

  a[data-compa11y-tree-view-label]:hover {
    text-decoration: underline;
  }

  a[data-compa11y-tree-view-label]:focus-visible {
    outline: var(--compa11y-tree-view-focus-outline);
    outline-offset: 1px;
  }

  /* Actions */
  [data-compa11y-tree-view-actions] {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    flex-shrink: 0;
    opacity: 0;
  }

  [data-compa11y-tree-view-row]:hover [data-compa11y-tree-view-actions],
  [role="treeitem"]:hover [data-compa11y-tree-view-actions],
  [role="treeitem"]:focus-within [data-compa11y-tree-view-actions],
  [data-compa11y-tree-view-row]:focus-within [data-compa11y-tree-view-actions] {
    opacity: 1;
  }

  /* Loading */
  [data-compa11y-tree-view-loading] {
    font-size: 0.85em;
    opacity: 0.6;
    font-style: italic;
    margin-left: 4px;
  }

  /* Error */
  [data-compa11y-tree-view-error] {
    font-size: 0.85em;
    color: var(--compa11y-tree-view-error-color, #c00);
    margin-left: 4px;
  }

  /* High contrast */
  @media (forced-colors: active) {
    [role="treeitem"][data-selected="true"] {
      outline: 2px solid Highlight;
      outline-offset: -2px;
    }

    [role="treeitem"]:focus-visible,
    [role="treeitem"][data-focused="true"] {
      outline: 2px solid Highlight;
    }

    [data-compa11y-tree-view-toggle]:focus-visible {
      outline: 2px solid Highlight;
    }
  }
`;

export const COMMAND_PALETTE_STYLES = `
  ${BASE_STYLES}

  :host {
    position: fixed;
    inset: 0;
    z-index: var(--compa11y-command-palette-z-index, 9999);
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 15vh;
  }

  .overlay {
    position: absolute;
    inset: 0;
    background: var(--compa11y-command-palette-overlay-bg, rgba(0, 0, 0, 0.5));
  }

  .palette {
    position: relative;
    background: var(--compa11y-command-palette-bg, white);
    border-radius: var(--compa11y-command-palette-radius, 12px);
    width: 100%;
    max-width: var(--compa11y-command-palette-max-width, 640px);
    max-height: var(--compa11y-command-palette-max-height, 70vh);
    overflow: hidden;
    box-shadow: var(--compa11y-command-palette-shadow, 0 25px 50px -12px rgba(0, 0, 0, 0.25));
    display: flex;
    flex-direction: column;
  }

  .input-wrapper {
    display: flex;
    align-items: center;
    padding: var(--compa11y-command-palette-input-padding, 12px 16px);
    border-bottom: 1px solid var(--compa11y-command-palette-border-color, #e5e5e5);
  }

  .search-icon {
    display: flex;
    align-items: center;
    color: var(--compa11y-command-palette-icon-color, #999);
    flex-shrink: 0;
    margin-right: 8px;
    pointer-events: none;
  }

  .input-wrapper input {
    flex: 1;
    min-width: 0;
    border: none;
    outline: none;
    font-size: var(--compa11y-command-palette-input-font-size, 16px);
    font-family: inherit;
    background: transparent;
    color: inherit;
  }

  .clear-button {
    display: flex;
    align-items: center;
    justify-content: center;
    appearance: none;
    background: none;
    border: none;
    padding: 4px;
    margin-left: 4px;
    cursor: pointer;
    color: var(--compa11y-command-palette-clear-color, #999);
    border-radius: 2px;
    min-width: 28px;
    min-height: 28px;
    flex-shrink: 0;
  }

  .clear-button:hover {
    color: var(--compa11y-command-palette-clear-hover-color, #666);
  }

  .clear-button[hidden] {
    display: none;
  }

  .input-wrapper input::placeholder {
    color: var(--compa11y-command-palette-placeholder-color, #999);
  }

  .list {
    overflow-y: auto;
    max-height: var(--compa11y-command-palette-list-max-height, 50vh);
    padding: var(--compa11y-command-palette-list-padding, 8px);
  }

  .group-label {
    padding: 8px 12px 4px;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--compa11y-command-palette-group-color, #666);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--compa11y-command-palette-item-padding, 8px 12px);
    border-radius: var(--compa11y-command-palette-item-radius, 6px);
    cursor: pointer;
    min-height: 44px;
  }

  .item[aria-selected="true"] {
    background: var(--compa11y-command-palette-highlight-bg, #f0f0f0);
  }

  .item[aria-disabled="true"] {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .item:hover:not([aria-disabled="true"]) {
    background: var(--compa11y-command-palette-hover-bg, #f5f5f5);
  }

  .shortcut {
    font-size: 0.75rem;
    color: var(--compa11y-command-palette-shortcut-color, #999);
    font-family: monospace;
  }

  .separator {
    height: 1px;
    background: var(--compa11y-command-palette-border-color, #e5e5e5);
    margin: 4px 8px;
  }

  .empty {
    padding: 24px 16px;
    text-align: center;
    color: var(--compa11y-command-palette-empty-color, #999);
  }

  .loading {
    padding: 16px;
    text-align: center;
    color: var(--compa11y-command-palette-loading-color, #999);
  }

  .footer {
    padding: var(--compa11y-command-palette-footer-padding, 8px 16px);
    border-top: 1px solid var(--compa11y-command-palette-border-color, #e5e5e5);
    font-size: 0.75rem;
    color: var(--compa11y-command-palette-footer-color, #999);
  }

  @media (prefers-reduced-motion: reduce) {
    * { transition: none !important; }
  }

  @media (forced-colors: active) {
    .item[aria-selected="true"] {
      outline: 2px solid Highlight;
    }

    .separator {
      background: CanvasText;
    }
  }
`;

/**
 * Carousel styles
 *
 * CSS custom properties:
 *   --compa11y-carousel-gap               Gap between slides (default 0)
 *   --compa11y-carousel-dot-size          Pagination dot size (default 12px)
 *   --compa11y-carousel-dot-color         Inactive dot color (default #ccc)
 *   --compa11y-carousel-dot-active-color  Active dot color (default #333)
 */
export const CAROUSEL_STYLES = `
  ${BASE_STYLES}

  :host {
    display: block;
    position: relative;
  }

  .carousel-root {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .carousel-status {
    font-size: 0.875rem;
    text-align: center;
  }

  .carousel-controls {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .carousel-controls button {
    ${RESET_BUTTON_STYLES}
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 44px;
    min-height: 44px;
    border: 1px solid currentColor;
    border-radius: 4px;
    font-size: 1.25rem;
  }

  .carousel-controls button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .carousel-controls button:focus-visible {
    outline: 2px solid var(--compa11y-focus-color, #0066cc);
    outline-offset: 2px;
  }

  .carousel-viewport {
    overflow: hidden;
  }

  .carousel-track {
    display: flex;
    gap: var(--compa11y-carousel-gap, 0);
    transition: transform 0.35s ease;
    will-change: transform;
  }

  :host([orientation="vertical"]) .carousel-track {
    flex-direction: column;
  }

  ::slotted([slot="slide"]) {
    flex: 0 0 var(--compa11y-carousel-slide-basis, 100%);
    min-width: 0;
    box-sizing: border-box;
  }

  .carousel-pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .carousel-dot {
    ${RESET_BUTTON_STYLES}
    width: var(--compa11y-carousel-dot-size, 12px);
    height: var(--compa11y-carousel-dot-size, 12px);
    min-width: 44px;
    min-height: 44px;
    padding: 0;
    background: none;
    position: relative;
  }

  .carousel-dot::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: var(--compa11y-carousel-dot-size, 12px);
    height: var(--compa11y-carousel-dot-size, 12px);
    border-radius: 50%;
    background: var(--compa11y-carousel-dot-color, #ccc);
    border: 2px solid transparent;
    transition: background 0.15s ease, border-color 0.15s ease;
  }

  .carousel-dot[data-active]::after {
    background: var(--compa11y-carousel-dot-active-color, #333);
    border-color: var(--compa11y-carousel-dot-active-color, #333);
  }

  .carousel-dot:focus-visible {
    outline: 2px solid var(--compa11y-focus-color, #0066cc);
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    .carousel-track { transition: none !important; }
  }

  @media (forced-colors: active) {
    .carousel-dot[data-active]::after {
      background: Highlight;
      border-color: Highlight;
    }
    .carousel-controls button:disabled {
      border-color: GrayText;
      color: GrayText;
    }
  }
`;
