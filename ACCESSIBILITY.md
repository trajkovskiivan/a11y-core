# Compa11y Kit — Accessibility Documentation

> **Everything the library handles under the hood, so you don't have to.**
>
> This document covers every component (React & Web), every hook, and every core utility — what ARIA attributes are set automatically, what keyboard navigation is built-in, what screen reader announcements are made, and how focus is managed.

---

## Table of Contents

- [React Components](#react-components)
  - [Button](#button)
  - [Input](#input)
  - [Textarea](#textarea)
  - [Checkbox](#checkbox)
  - [RadioGroup](#radiogroup)
  - [Switch](#switch)
  - [Select](#select)
  - [Combobox](#combobox)
  - [Listbox](#listbox)
  - [Dialog](#dialog)
  - [ActionMenu](#actionmenu)
  - [Tabs](#tabs)
  - [Toast](#toast)
  - [VisuallyHidden](#visuallyhidden)
  - [SkipLink](#skiplink)
  - [Alert](#alert)
- [Web Components](#web-components)
  - [`<a11y-button>`](#a11y-button)
  - [`<a11y-input>`](#a11y-input)
  - [`<a11y-textarea>`](#a11y-textarea)
  - [`<a11y-checkbox>` & `<a11y-checkbox-group>`](#a11y-checkbox)
  - [`<a11y-radio-group>` & `<a11y-radio>`](#a11y-radio-group)
  - [`<a11y-switch>`](#a11y-switch)
  - [`<a11y-select>`](#a11y-select)
  - [`<a11y-combobox>`](#a11y-combobox)
  - [`<a11y-listbox>`](#a11y-listbox)
  - [`<a11y-dialog>`](#a11y-dialog)
  - [`<a11y-menu>`](#a11y-menu)
  - [`<a11y-tabs>`](#a11y-tabs)
  - [`<a11y-toast>`](#a11y-toast)
  - [`<a11y-visually-hidden>`](#a11y-visually-hidden)
  - [`<a11y-skip-link>`](#a11y-skip-link)
  - [`<a11y-alert>`](#a11y-alert)
- [React Hooks](#react-hooks)
  - [ID Generation](#id-generation-hooks)
  - [Focus Management](#focus-management-hooks)
  - [Keyboard Navigation](#keyboard-hooks)
  - [Screen Reader Announcements](#announcer-hooks)
  - [Roving Tabindex](#roving-tabindex-hooks)
- [Core Utilities](#core-utilities)
  - [ARIA Helpers](#aria-helpers)
  - [Focus Trap](#focus-trap)
  - [Focus Visible](#focus-visible)
  - [Focus Scope & Roving Tabindex](#focus-scope--roving-tabindex)
  - [Focus Neighbor & Focus Return](#focus-neighbor--focus-return)
  - [Keyboard Manager](#keyboard-manager)
  - [Live Announcer](#live-announcer)
  - [ID Generation](#id-generation)
  - [Platform Detection](#platform-detection)
  - [Dev Warnings](#dev-warnings)

---

## React Components

### Button

A polymorphic, accessible button component with variant, size, and loading support.

#### What the library handles

| Feature | Details |
|---------|---------|
| **`aria-disabled`** | Set automatically when `disabled` is true |
| **`aria-busy`** | Set to `"true"` when `loading` is true |
| **`aria-label`** | Forwarded if provided; dev warning if button has no accessible name |
| **Loading state** | Renders a spinner with `aria-hidden="true"` and adds screen reader–only "Loading" text |
| **Focus ring** | Keyboard-only focus indicator via `useFocusVisible()` |
| **Dev warnings** | Warns in development if button has no accessible name |

#### Usage

```tsx
import { Button } from '@compa11y/react';

<Button variant="primary" size="md" onClick={handleSave}>
  Save Changes
</Button>

<Button loading aria-label="Saving changes">
  Save
</Button>

<Button as="a" href="/docs">
  Documentation
</Button>
```

---

### Input

A form input with label, hint, and error support. Available in **props mode** (all-in-one) or **compound mode** (composable sub-components).

#### What the library handles

| Feature | Details |
|---------|---------|
| **`<label htmlFor>`** | Automatically associated with input via generated ID |
| **`aria-labelledby`** | References label element ID |
| **`aria-describedby`** | Dynamically includes hint ID and/or error ID only when those elements are rendered |
| **`aria-invalid`** | Set to `"true"` when error is present |
| **`aria-required`** | Set to `"true"` when `required` is true |
| **`role="alert"`** | Applied to error message element for screen reader announcement |
| **Focus ring** | Keyboard-only focus indicator via `useFocusVisible()`, changes color on error |
| **Dev warnings** | Warns if input has no accessible label (no `label`, `aria-label`, or `aria-labelledby`) |

> **Key detail:** In compound mode, `<Input.Hint>` registers itself via `useEffect`. The `aria-describedby` on the input only includes the hint ID when `<Input.Hint>` is actually mounted — no phantom ARIA references.

#### Usage

```tsx
import { Input } from '@compa11y/react';

// Props mode
<Input
  label="Email"
  type="email"
  hint="We'll never share your email"
  error={emailError}
  required
/>

// Compound mode
<Input value={name} onValueChange={setName}>
  <Input.Label>Full Name</Input.Label>
  <Input.Field placeholder="John Doe" required />
  <Input.Hint>First and last name</Input.Hint>
  <Input.Error>{nameError}</Input.Error>
</Input>
```

---

### Textarea

Same architecture as Input, with multi-line text support.

#### What the library handles

| Feature | Details |
|---------|---------|
| **`<label htmlFor>`** | Automatically associated via generated ID |
| **`aria-labelledby`** | References label element ID |
| **`aria-describedby`** | Dynamically includes hint/error IDs only when rendered |
| **`aria-invalid`** | Set when error is present |
| **`aria-required`** | Set when `required` is true |
| **`role="alert"`** | On error element |
| **Resize control** | `resize` prop controls CSS resize behavior |
| **Focus ring** | Keyboard-only, error-aware |
| **Dev warnings** | Missing accessible label |

#### Usage

```tsx
import { Textarea } from '@compa11y/react';

<Textarea
  label="Description"
  hint="Provide a brief summary"
  rows={4}
  error={descError}
  required
/>

// Compound mode
<Textarea value={bio} onValueChange={setBio}>
  <Textarea.Label>Bio</Textarea.Label>
  <Textarea.Field rows={5} />
  <Textarea.Hint>Markdown supported</Textarea.Hint>
  <Textarea.Error>{bioError}</Textarea.Error>
</Textarea>
```

---

### Checkbox

A custom checkbox with indeterminate state, group support, and full keyboard access.

#### What the library handles

| Feature | Details |
|---------|---------|
| **`role="checkbox"`** | On the checkbox control |
| **`aria-checked`** | `"true"`, `"false"`, or `"mixed"` (indeterminate) |
| **`aria-labelledby`** | References label element |
| **`aria-describedby`** | References hint/error elements when present |
| **`aria-disabled`** | Set when disabled |
| **`aria-required`** | Set when required |
| **`aria-invalid`** | Set when error is present |
| **Group: `role="group"`** | Wraps checkbox group with `<fieldset>` and `<legend>` |
| **Keyboard** | **Space** toggles the checkbox; **Tab** navigates between checkboxes |
| **Focus ring** | Keyboard-only via `useFocusVisible()` |
| **Screen reader** | Announces state changes: "{label} checked" / "{label} unchecked" |
| **Indicator** | `<Checkbox.Indicator>` renders checkmark/mixed icon with `aria-hidden="true"` |

#### Usage

```tsx
import { Checkbox, CheckboxGroup } from '@compa11y/react';

// Single checkbox
<Checkbox
  checked={agreed}
  onCheckedChange={setAgreed}
  label="I agree to the terms"
/>

// Group
<CheckboxGroup legend="Toppings" error={toppingsError}>
  <Checkbox value="cheese" label="Cheese" />
  <Checkbox value="pepperoni" label="Pepperoni" />
  <Checkbox value="olives" label="Olives" />
</CheckboxGroup>

// Indeterminate (parent checkbox controlling children)
<Checkbox
  checked={allSelected}
  indeterminate={someSelected && !allSelected}
  onCheckedChange={toggleAll}
  label="Select all"
/>
```

---

### RadioGroup

A radio group with roving tabindex and automatic selection-follows-focus.

#### What the library handles

| Feature | Details |
|---------|---------|
| **`role="radiogroup"`** | On the group container |
| **`role="radio"`** | On each radio item |
| **`aria-checked`** | `"true"` on selected radio, `"false"` on others |
| **`aria-disabled`** | On disabled radios |
| **`aria-required`** | On group when required |
| **`aria-orientation`** | `"horizontal"` or `"vertical"` |
| **`aria-describedby`** | References hint/error elements |
| **`aria-invalid`** | Set on group when error is present |
| **Roving tabindex** | Only the selected radio has `tabindex="0"`, all others `tabindex="-1"` |
| **Keyboard** | **Arrow Down/Right** → next radio + select; **Arrow Up/Left** → previous + select; **Home/End** → first/last + select |
| **Focus ring** | Keyboard-only |
| **Screen reader** | Announces selection changes via `announcePolite()` |
| **Fieldset/Legend** | Group rendered with semantic `<fieldset>` and `<legend>` |

#### Usage

```tsx
import { RadioGroup, Radio } from '@compa11y/react';

<RadioGroup
  value={color}
  onValueChange={setColor}
  legend="Favorite Color"
  orientation="vertical"
>
  <Radio value="red" label="Red" />
  <Radio value="green" label="Green" />
  <Radio value="blue" label="Blue" />
</RadioGroup>
```

---

### Switch

A toggle switch with `role="switch"`.

#### What the library handles

| Feature | Details |
|---------|---------|
| **`role="switch"`** | On the switch button |
| **`aria-checked`** | `"true"` when on, `"false"` when off |
| **`aria-labelledby`** | References label element |
| **`aria-label`** | Forwarded if provided |
| **`aria-disabled`** | Set when disabled |
| **Keyboard** | **Space/Enter** toggles the switch |
| **Focus ring** | Keyboard-only |
| **Screen reader** | Announces state: "{label} on" / "{label} off" |
| **Dev warnings** | Warns if no accessible label |

#### Usage

```tsx
import { Switch } from '@compa11y/react';

<Switch
  checked={darkMode}
  onCheckedChange={setDarkMode}
  label="Dark mode"
  size="md"
/>
```

---

### Select

A custom select dropdown following the combobox pattern (WAI-ARIA).

#### What the library handles

| Feature | Details |
|---------|---------|
| **Trigger: `role="combobox"`** | On the trigger button |
| **`aria-expanded`** | `"true"` when listbox is open |
| **`aria-controls`** | References the listbox ID |
| **`aria-haspopup="listbox"`** | Indicates popup type |
| **`aria-activedescendant`** | Points to the currently highlighted option |
| **Listbox: `role="listbox"`** | On the dropdown list |
| **Option: `role="option"`** | On each option |
| **`aria-selected`** | `"true"` on selected option |
| **`aria-disabled`** | On disabled options |
| **Keyboard** | **Down/Up Arrow** → navigate options; **Enter/Space** → select; **Escape** → close; **Home/End** → first/last; **Type-ahead** → jump to matching option |
| **Positioning** | Auto-positions above or below trigger based on viewport space |
| **Screen reader** | Announces "N options available" on open; "{label} selected" on selection |
| **Focus** | Focus stays on trigger; `aria-activedescendant` moves visual highlight |

#### Usage

```tsx
import { Select } from '@compa11y/react';

<Select
  options={[
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry', disabled: true },
  ]}
  value={fruit}
  onValueChange={setFruit}
  aria-label="Choose a fruit"
>
  <Select.Trigger placeholder="Pick a fruit..." />
  <Select.Listbox />
</Select>
```

---

### Combobox

A searchable combobox with real-time filtering and keyboard navigation.

#### What the library handles

| Feature | Details |
|---------|---------|
| **Input: `role="combobox"`** | On the text input |
| **`aria-expanded`** | `"true"` when listbox is open |
| **`aria-controls`** | References listbox ID |
| **`aria-haspopup="listbox"`** | Indicates popup type |
| **`aria-autocomplete="list"`** | Indicates filtering behavior |
| **`aria-activedescendant`** | Points to highlighted option |
| **Listbox: `role="listbox"`** | On the dropdown |
| **Option: `role="option"`** | On each option |
| **`aria-selected`** | On selected option |
| **`aria-disabled`** | On disabled options |
| **Keyboard** | **Down/Up Arrow** → navigate; **Enter** → select; **Escape** → close; **Home/End** → first/last; **Typing** → filters options in real-time |
| **Screen reader** | Announces "N results available" or "No results" as user types; "{label} selected" on selection |
| **Focus** | Input retains focus; blur has 150ms delay to allow option clicks to register |

#### Usage

```tsx
import { Combobox } from '@compa11y/react';

<Combobox
  options={fruits}
  value={selected}
  onValueChange={setSelected}
  aria-label="Search fruits"
>
  <Combobox.Input placeholder="Type to search..." clearable />
  <Combobox.Listbox emptyMessage="No fruits found" />
</Combobox>
```

---

### Listbox

A persistent listbox (always visible, not a dropdown) with single and multi-select modes.

#### What the library handles

| Feature | Details |
|---------|---------|
| **`role="listbox"`** | On the container |
| **`aria-orientation`** | `"horizontal"` or `"vertical"` |
| **`aria-multiselectable`** | Set to `"true"` in multi-select mode |
| **`aria-disabled`** | On container or individual options |
| **`aria-activedescendant`** | Points to focused option |
| **Option: `role="option"`** | On each option |
| **`aria-selected`** | Selection state per option |
| **Group: `role="group"`** | Groups with visible label via `aria-labelledby` |
| **Single-select keyboard** | **Down/Up Arrow** → move + select; **Home/End** → first/last + select; **Type-ahead** |
| **Multi-select keyboard** | **Down/Up Arrow** → move focus only; **Space** → toggle; **Shift+Arrow** → extend selection; **Ctrl+Shift+Home/End** → range select; **Ctrl+A** → select/deselect all |
| **Focus** | `aria-activedescendant` pattern; scroll-into-view on focus change |
| **Screen reader** | Announces selection/deselection; range selection count; select/deselect all |

#### Usage

```tsx
import { Listbox } from '@compa11y/react';

// Single select
<Listbox value={fruit} onValueChange={setFruit} aria-label="Favorite fruit">
  <Listbox.Option value="apple">Apple</Listbox.Option>
  <Listbox.Option value="banana">Banana</Listbox.Option>
</Listbox>

// Multi-select with groups
<Listbox multiple value={selected} onValueChange={setSelected} aria-label="Toppings">
  <Listbox.Group label="Meats">
    <Listbox.Option value="pepperoni">Pepperoni</Listbox.Option>
    <Listbox.Option value="sausage">Sausage</Listbox.Option>
  </Listbox.Group>
  <Listbox.Group label="Vegetables">
    <Listbox.Option value="peppers">Peppers</Listbox.Option>
    <Listbox.Option value="olives">Olives</Listbox.Option>
  </Listbox.Group>
</Listbox>
```

---

### Dialog

A modal dialog with focus trapping, scroll locking, and full ARIA support.

#### What the library handles

| Feature | Details |
|---------|---------|
| **`role="dialog"`** | On the dialog element |
| **`aria-modal="true"`** | Indicates modal behavior |
| **`aria-labelledby`** | References `<Dialog.Title>` element ID |
| **`aria-describedby`** | References `<Dialog.Description>` element ID |
| **Focus trap** | `useFocusTrap()` — Tab/Shift+Tab cycles within dialog only |
| **Initial focus** | Configurable via `initialFocus` ref prop |
| **Focus return** | Focus restored to trigger element on close |
| **Scroll lock** | Body scroll locked while open (stacking support for nested dialogs) |
| **Keyboard** | **Escape** closes dialog (configurable); **Tab** trapped within dialog |
| **Screen reader** | Announces "Dialog opened" / "Dialog closed" via live region |
| **Close button** | `<Dialog.Close>` auto-gets `aria-label="Close dialog"` |
| **Portaling** | Rendered into configurable container (default: `document.body`) |

#### Usage

```tsx
import { Dialog } from '@compa11y/react';

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <Dialog.Trigger>Open Dialog</Dialog.Trigger>
  <Dialog.Title>Confirm Action</Dialog.Title>
  <Dialog.Description>This action cannot be undone.</Dialog.Description>
  <Dialog.Content>
    <p>Are you sure you want to delete this item?</p>
  </Dialog.Content>
  <Dialog.Actions>
    <button onClick={() => setIsOpen(false)}>Cancel</button>
    <button onClick={handleDelete}>Delete</button>
  </Dialog.Actions>
  <Dialog.Close />
</Dialog>

// With initial focus
const confirmRef = useRef(null);
<Dialog open={isOpen} onOpenChange={setIsOpen} initialFocus={confirmRef}>
  {/* ... */}
  <button ref={confirmRef}>Confirm</button>
</Dialog>
```

---

### ActionMenu

A popup menu triggered by a button, with full keyboard navigation.

#### What the library handles

| Feature | Details |
|---------|---------|
| **Trigger: `aria-haspopup="menu"`** | Indicates menu popup |
| **`aria-expanded`** | `"true"` when menu is open |
| **`aria-controls`** | References menu ID |
| **Menu: `role="menu"`** | On the menu container |
| **`aria-labelledby`** | References trigger ID |
| **Item: `role="menuitem"`** | On each menu item |
| **`aria-disabled`** | On disabled items |
| **Separator: `role="separator"`** | On menu separators |
| **Label: `role="none"`** | Non-interactive label elements |
| **Keyboard (trigger)** | **Down Arrow** → open, focus first; **Up Arrow** → open, focus last; **Enter/Space** → toggle |
| **Keyboard (menu)** | **Down/Up Arrow** → navigate items; **Home/End** → first/last; **Enter/Space** → activate item; **Escape** → close; **Tab** → close and move focus |
| **Focus** | Menu receives focus on open; highlight tracks keyboard/mouse; focus returns to trigger on close |

#### Usage

```tsx
import { ActionMenu } from '@compa11y/react';

<ActionMenu>
  <ActionMenu.Trigger>Options</ActionMenu.Trigger>
  <ActionMenu.Content>
    <ActionMenu.Label>Actions</ActionMenu.Label>
    <ActionMenu.Item onSelect={handleEdit}>Edit</ActionMenu.Item>
    <ActionMenu.Item onSelect={handleDuplicate}>Duplicate</ActionMenu.Item>
    <ActionMenu.Separator />
    <ActionMenu.Item onSelect={handleDelete}>Delete</ActionMenu.Item>
  </ActionMenu.Content>
</ActionMenu>
```

---

### Tabs

A tabbed interface with roving tabindex and automatic or manual activation.

#### What the library handles

| Feature | Details |
|---------|---------|
| **`role="tablist"`** | On the tab list container |
| **`aria-orientation`** | `"horizontal"` or `"vertical"` |
| **Tab: `role="tab"`** | On each tab button |
| **`aria-selected`** | `"true"` on active tab |
| **`aria-controls`** | References corresponding panel ID |
| **`aria-disabled`** | On disabled tabs |
| **Roving tabindex** | Selected tab: `tabindex="0"`, others: `tabindex="-1"` |
| **Panel: `role="tabpanel"`** | On each panel |
| **`aria-labelledby`** | References corresponding tab ID |
| **`hidden`** | Non-selected panels hidden (unless `forceMount`) |
| **Horizontal keyboard** | **Right/Left Arrow** → next/previous tab; **Home/End** → first/last |
| **Vertical keyboard** | **Down/Up Arrow** → next/previous tab; **Home/End** → first/last |
| **Activation modes** | **Automatic** (default): selection follows focus; **Manual**: arrows move focus, Enter/Space activates |
| **Screen reader** | Announces "{value} tab selected" on selection change |

#### Usage

```tsx
import { Tabs } from '@compa11y/react';

<Tabs value={tab} onValueChange={setTab}>
  <Tabs.List aria-label="Account settings">
    <Tabs.Tab value="profile">Profile</Tabs.Tab>
    <Tabs.Tab value="security">Security</Tabs.Tab>
    <Tabs.Tab value="billing" disabled>Billing</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value="profile">Profile content</Tabs.Panel>
  <Tabs.Panel value="security">Security content</Tabs.Panel>
  <Tabs.Panel value="billing">Billing content</Tabs.Panel>
</Tabs>

// Vertical with manual activation
<Tabs orientation="vertical" activationMode="manual">
  {/* ... */}
</Tabs>
```

---

### Toast

A notification system with timed auto-dismiss and screen reader announcements.

#### What the library handles

| Feature | Details |
|---------|---------|
| **Viewport: `role="region"`** | On the toast container |
| **`aria-label`** | Default: "Notifications" |
| **`aria-live="polite"`** | Toast region is a live region |
| **`aria-relevant="additions removals"`** | Announces when toasts appear and disappear |
| **Toast: conditional `role`** | `role="alert"` for error/warning (assertive); `role="status"` for info/success (polite) |
| **`aria-atomic="true"`** | Entire toast announced as a unit |
| **`tabindex="0"`** | Toasts are focusable |
| **Keyboard** | **Escape** dismisses focused toast |
| **Timer** | Auto-dismiss pauses on hover/focus, resumes on blur/mouse leave |
| **No double announcements** | Only the `aria-live` region announces — no redundant programmatic `announce()` calls |

#### Usage

```tsx
import { ToastProvider, ToastViewport, useToast, useToastHelpers } from '@compa11y/react';

// Setup
<ToastProvider duration={5000} maxToasts={5}>
  <App />
  <ToastViewport position="bottom-right" />
</ToastProvider>

// In components
function SaveButton() {
  const { success, error } = useToastHelpers();

  const handleSave = async () => {
    try {
      await save();
      success('Saved!', 'Your changes have been saved.');
    } catch (e) {
      error('Error', 'Failed to save changes.');
    }
  };

  return <button onClick={handleSave}>Save</button>;
}

// Advanced usage
const { addToast, removeToast } = useToast();

const id = addToast({
  type: 'info',
  title: 'Download complete',
  duration: 0, // Won't auto-dismiss
  action: { label: 'Open', onClick: openFile },
});
```

---

### VisuallyHidden

A utility component that hides content visually while keeping it accessible to screen readers.

#### What the library handles

| Feature | Details |
|---------|---------|
| **Visually hidden styles** | Applies `position: absolute; width: 1px; height: 1px; clip: rect(0,0,0,0); overflow: hidden` |
| **`focusable` mode** | When `focusable` is true, content becomes visible on focus (useful for skip-link-like behavior inside `VisuallyHidden`) |
| **No ARIA needed** | The content is still in the DOM — screen readers read it naturally. No extra roles or attributes required |

#### Usage

```tsx
import { VisuallyHidden } from '@compa11y/react';

// Hidden label for an icon button
<button>
  <span aria-hidden="true">&times;</span>
  <VisuallyHidden>Close dialog</VisuallyHidden>
</button>

// Hidden supplementary text
<span>3 items in cart</span>
<VisuallyHidden>, total price: $45.99</VisuallyHidden>

// Focusable skip link wrapped in VisuallyHidden
<VisuallyHidden focusable>
  <a href="#main-content">Skip to main content</a>
</VisuallyHidden>
```

---

### SkipLink

A navigation aid that lets keyboard users skip past repetitive content (e.g., navigation) and jump directly to main content.

#### What the library handles

| Feature | Details |
|---------|---------|
| **Visually hidden until focus** | Uses visually-hidden styles, becomes visible as a fixed-position link when focused |
| **Target focus management** | On click, finds the target element, adds `tabindex="-1"` if needed, focuses it, and scrolls into view |
| **`target` prop** | CSS selector for the skip destination (defaults to `"#main-content"`) |
| **`unstyled` prop** | Removes default styles for full customization |
| **Semantic `<a>` element** | Renders as an anchor with `href` matching the target for progressive enhancement |
| **No ARIA needed** | Native `<a>` element — screen readers announce it as a link naturally |

#### Usage

```tsx
import { SkipLink } from '@compa11y/react';

// Place as the very first focusable element in the page
<SkipLink target="#main-content" />

// Custom label
<SkipLink target="#main-content">Skip navigation</SkipLink>

// Multiple skip links
<SkipLink target="#main-content">Skip to content</SkipLink>
<SkipLink target="#search">Skip to search</SkipLink>
```

Keyboard: **Tab** to reveal, **Enter** to activate.

---

### Alert

A static feedback element for communicating important messages with appropriate ARIA semantics.

#### What the library handles

| Feature | Details |
|---------|---------|
| **`role="alert"`** | Applied for `type="error"` and `type="warning"` — assertive announcement |
| **`role="status"`** | Applied for `type="info"` and `type="success"` — polite announcement |
| **`aria-live`** | `"assertive"` for error/warning, `"polite"` for info/success |
| **Dismiss button** | When `dismissible` is true, renders a close button with `aria-label="Dismiss alert"` |
| **Visual variants** | Left border accent color per type (info: blue, success: green, warning: amber, error: red) |
| **`unstyled` prop** | Removes default styles for full customization |
| **`onDismiss` callback** | Called when the user dismisses the alert |

#### Usage

```tsx
import { Alert } from '@compa11y/react';

// Error alert (assertive)
<Alert type="error" title="Payment failed">
  Your card was declined. Please try a different payment method.
</Alert>

// Success alert (polite)
<Alert type="success" title="Saved!">
  Your changes have been saved successfully.
</Alert>

// Dismissible
<Alert type="info" dismissible onDismiss={() => setVisible(false)}>
  This alert can be closed.
</Alert>
```

---

## Web Components

All web components use Shadow DOM and extend the `Compa11yElement` base class. They are fully functional without JavaScript frameworks and can be used in any HTML page.

### `<a11y-button>`

#### What the library handles

| Feature | Details |
|---------|---------|
| **`aria-disabled`** | Set when `disabled` attribute is present |
| **`aria-busy`** | Set when `loading` attribute is present |
| **`aria-label`** | Forwarded from attribute |
| **Loading state** | Shows spinner (hidden from screen readers), adds visually hidden "Loading" text |
| **Focus ring** | CSS `:focus-visible` with `--compa11y-focus-color` |
| **Dev warnings** | Missing accessible label |

#### Usage

```html
<a11y-button variant="primary" size="md">Save Changes</a11y-button>
<a11y-button loading aria-label="Saving">Save</a11y-button>
<a11y-button disabled>Cannot Click</a11y-button>
```

#### CSS Custom Properties

```css
--compa11y-button-bg, --compa11y-button-color, --compa11y-button-border
--compa11y-button-hover-bg, --compa11y-button-active-bg
--compa11y-button-radius, --compa11y-button-font-size
--compa11y-focus-color
```

---

### `<a11y-input>`

#### What the library handles

| Feature | Details |
|---------|---------|
| **`<label>`** | Auto-associated via `for` attribute |
| **`aria-describedby`** | References hint/error when present |
| **`aria-invalid`** | Set when `error` attribute has content |
| **`aria-required`** | Set when `required` attribute is present |
| **`role="alert"`** | On error container |
| **Focus ring** | Error-aware color |

#### Usage

```html
<a11y-input
  label="Email"
  type="email"
  hint="We won't share your email"
  error="Please enter a valid email"
  required
></a11y-input>
```

**Events:** `input`, `change`, `a11y-input-change`

---

### `<a11y-textarea>`

#### What the library handles

Same as `<a11y-input>` but for multi-line text.

| Feature | Details |
|---------|---------|
| **`<label>`** | Auto-associated |
| **`aria-describedby`** | Hint/error references |
| **`aria-invalid`** | On error |
| **`aria-required`** | On required |
| **`role="alert"`** | On error container |

#### Usage

```html
<a11y-textarea
  label="Description"
  hint="Maximum 500 characters"
  rows="4"
  required
></a11y-textarea>
```

---

### `<a11y-checkbox>`

#### What the library handles

| Feature | Details |
|---------|---------|
| **`role="checkbox"`** | On the checkbox control |
| **`aria-checked`** | `"true"`, `"false"`, or `"mixed"` |
| **`aria-labelledby`** | References label |
| **`aria-describedby`** | References hint |
| **`aria-disabled`** | When disabled |
| **`aria-required`** | When required |
| **Keyboard** | **Space** toggles checkbox |
| **Group: `<fieldset>` + `<legend>`** | `<a11y-checkbox-group>` uses semantic grouping |
| **Group: `aria-invalid`** | Set when group has error |
| **Screen reader** | Announces "{label} checked/unchecked" |

#### Usage

```html
<a11y-checkbox label="I agree to the terms" required></a11y-checkbox>

<a11y-checkbox-group legend="Select toppings">
  <a11y-checkbox value="cheese" label="Cheese"></a11y-checkbox>
  <a11y-checkbox value="peppers" label="Peppers"></a11y-checkbox>
</a11y-checkbox-group>
```

**Events:** `change`, `a11y-checkbox-change`

---

### `<a11y-radio-group>`

#### What the library handles

| Feature | Details |
|---------|---------|
| **`role="radiogroup"`** | On the group container |
| **`role="radio"`** | On each radio |
| **`aria-checked`** | `"true"` on selected, `"false"` on others |
| **`aria-orientation`** | `"horizontal"` or `"vertical"` |
| **`aria-disabled`** | On disabled group or individual radios |
| **`aria-required`** | On required group |
| **`aria-invalid`** | On group with error |
| **`aria-describedby`** | References hint/error |
| **Roving tabindex** | Only selected radio has `tabindex="0"` |
| **Keyboard** | **Arrow Down/Right** → next + select; **Arrow Up/Left** → prev + select; **Home/End** → first/last + select; **Space** → select focused |
| **Screen reader** | Announces selection changes |

#### Usage

```html
<a11y-radio-group legend="Size" orientation="horizontal" value="md">
  <a11y-radio value="sm" label="Small"></a11y-radio>
  <a11y-radio value="md" label="Medium"></a11y-radio>
  <a11y-radio value="lg" label="Large"></a11y-radio>
</a11y-radio-group>
```

**Events:** `change`, `a11y-radiogroup-change`

---

### `<a11y-switch>`

#### What the library handles

| Feature | Details |
|---------|---------|
| **`role="switch"`** | On internal button |
| **`aria-checked`** | Toggle state |
| **`aria-labelledby`** | References label |
| **Keyboard** | **Space/Enter** toggles |
| **Screen reader** | Announces state changes |

#### Usage

```html
<a11y-switch label="Enable notifications" checked></a11y-switch>
<a11y-switch size="lg" label="Dark mode"></a11y-switch>
```

**Methods:** `toggle()`, `setChecked(boolean)`
**Events:** `change`

---

### `<a11y-select>`

#### What the library handles

| Feature | Details |
|---------|---------|
| **Trigger: `role="combobox"`** | On trigger button |
| **`aria-expanded`** | Listbox visibility |
| **`aria-controls`** | References listbox |
| **`aria-haspopup="listbox"`** | Popup type |
| **`aria-activedescendant`** | Highlighted option |
| **`role="listbox"` / `role="option"`** | Semantic structure |
| **`aria-selected`** | On selected option |
| **Keyboard** | Full arrow/Enter/Space/Escape/Home/End/type-ahead support |
| **Positioning** | Auto above/below based on viewport |
| **Screen reader** | Announces option count on open, selection changes |

#### Usage

```html
<a11y-select placeholder="Choose..." aria-label="Select country">
  <option value="us">United States</option>
  <option value="uk">United Kingdom</option>
  <option value="de" disabled>Germany (unavailable)</option>
</a11y-select>
```

**Methods:** `show()`, `close()`
**Events:** `change`, `a11y-select-open`, `a11y-select-close`, `a11y-select-change`

---

### `<a11y-combobox>`

#### What the library handles

| Feature | Details |
|---------|---------|
| **Input: `role="combobox"`** | On text input |
| **`aria-expanded`** | Listbox visibility |
| **`aria-controls`** | References listbox |
| **`aria-haspopup="listbox"`** | Popup type |
| **`aria-autocomplete="list"`** | Filtering behavior |
| **`aria-activedescendant`** | Highlighted option |
| **`autocomplete="off"`** | Prevents browser autocomplete |
| **Keyboard** | Arrow/Enter/Escape/Home/End + real-time text filtering |
| **Screen reader** | Announces result count as user types |

#### Usage

```html
<a11y-combobox placeholder="Search..." clearable>
  <option value="apple">Apple</option>
  <option value="banana">Banana</option>
  <option value="cherry">Cherry</option>
</a11y-combobox>
```

**Methods:** `show()`, `close()`, `clear()`
**Events:** `a11y-combobox-open`, `a11y-combobox-close`, `a11y-combobox-select`, `a11y-combobox-change`, `a11y-combobox-clear`

---

### `<a11y-listbox>`

#### What the library handles

| Feature | Details |
|---------|---------|
| **`role="listbox"`** | On container |
| **`aria-orientation`** | `"horizontal"` or `"vertical"` |
| **`aria-multiselectable`** | In multi-select mode |
| **`aria-activedescendant`** | Focused option |
| **Option: `role="option"`** | On each option |
| **`aria-selected`** | Selection state |
| **Group: `role="group"`** | `<a11y-optgroup>` with `aria-labelledby` |
| **Single-select keyboard** | Arrow/Home/End + auto-select + type-ahead |
| **Multi-select keyboard** | Arrow (focus only), Space (toggle), Shift+Arrow (extend), Ctrl+A (all), Shift+Home/End (range) |
| **Screen reader** | Announces selection/deselection, range counts, select/deselect all |

#### Usage

```html
<!-- Single select -->
<a11y-listbox aria-label="Favorite fruit" value="apple">
  <a11y-option value="apple">Apple</a11y-option>
  <a11y-option value="banana">Banana</a11y-option>
</a11y-listbox>

<!-- Multi-select with groups -->
<a11y-listbox multiple aria-label="Toppings">
  <a11y-optgroup label="Meats">
    <a11y-option value="pepperoni">Pepperoni</a11y-option>
  </a11y-optgroup>
</a11y-listbox>
```

**Events:** `change`, `a11y-listbox-change`

---

### `<a11y-dialog>`

#### What the library handles

| Feature | Details |
|---------|---------|
| **`role="dialog"`** | On dialog element |
| **`aria-modal="true"`** | Modal behavior |
| **`aria-labelledby`** | References title slot |
| **`aria-describedby`** | References description slot |
| **Focus trap** | Tab/Shift+Tab cycle within dialog |
| **Focus return** | Focus restored to trigger on close |
| **Scroll lock** | Body scroll locked (stacking support for nested dialogs) |
| **Keyboard** | **Escape** closes (configurable) |
| **Screen reader** | Announces "Dialog opened" / "Dialog closed" |
| **Overlay** | Click outside closes (configurable) |

#### Usage

```html
<button id="open-btn">Open Dialog</button>

<a11y-dialog trigger="#open-btn">
  <h2 slot="title">Confirm Action</h2>
  <p slot="description">This cannot be undone.</p>
  <p>Are you sure you want to proceed?</p>
  <div slot="actions">
    <button>Cancel</button>
    <button>Confirm</button>
  </div>
</a11y-dialog>
```

**Attributes:** `open`, `trigger`, `close-on-outside-click`, `close-on-escape`
**Methods:** `show()`, `close()`
**Events:** `a11y-dialog-open`, `a11y-dialog-close`

---

### `<a11y-menu>`

#### What the library handles

| Feature | Details |
|---------|---------|
| **Trigger: `aria-haspopup="menu"`** | On trigger slot |
| **`aria-expanded`** | Menu visibility |
| **`aria-labelledby`** | References trigger |
| **`role="menu"`** | On menu container |
| **Items: `role="menuitem"`** | On menu items |
| **`aria-disabled`** | On disabled items |
| **`aria-activedescendant`** | Currently highlighted item |
| **Keyboard** | **Down/Up Arrow** → navigate (wraps); **Home/End** → first/last; **Enter/Space** → activate; **Escape** → close + return focus |
| **Focus** | Returns to trigger on close |

#### Usage

```html
<a11y-menu>
  <button slot="trigger">Actions</button>
  <button role="menuitem">Edit</button>
  <button role="menuitem">Duplicate</button>
  <div role="separator"></div>
  <button role="menuitem" aria-disabled="true">Delete</button>
</a11y-menu>
```

**Methods:** `show()`, `close()`, `toggle()`
**Events:** `a11y-menu-open`, `a11y-menu-close`, `a11y-menu-select`

---

### `<a11y-tabs>`

#### What the library handles

| Feature | Details |
|---------|---------|
| **`role="tablist"`** | On tab container |
| **`aria-orientation`** | `"horizontal"` or `"vertical"` |
| **Tab: `role="tab"`** | On each tab |
| **`aria-selected`** | Selection state |
| **`aria-controls`** | References panel |
| **Roving tabindex** | Only selected tab has `tabindex="0"` |
| **Panel: `role="tabpanel"`** | On each panel |
| **`aria-labelledby`** | References tab |
| **Keyboard** | **Arrow Right/Down** → next; **Arrow Left/Up** → prev; **Home/End** → first/last; (manual mode: Enter/Space to activate) |
| **Activation modes** | `automatic` (default) or `manual` |
| **Screen reader** | Announces tab selection |

#### Usage

```html
<a11y-tabs>
  <button slot="tab" role="tab" aria-controls="panel-1">Profile</button>
  <button slot="tab" role="tab" aria-controls="panel-2">Settings</button>

  <div slot="panel" role="tabpanel" id="panel-1">Profile content</div>
  <div slot="panel" role="tabpanel" id="panel-2">Settings content</div>
</a11y-tabs>

<!-- Vertical with manual activation -->
<a11y-tabs orientation="vertical" activation-mode="manual">
  <!-- ... -->
</a11y-tabs>
```

**Methods:** `select(index)`, `next()`, `previous()`
**Events:** `a11y-tabs-change`

---

### `<a11y-toast>`

#### What the library handles

| Feature | Details |
|---------|---------|
| **Container: `role="region"`** | On toast viewport |
| **`aria-label`** | Default: "Notifications" |
| **`aria-live="polite"`** | Live region for announcements |
| **`aria-relevant="additions removals"`** | Announce toast appear/disappear |
| **Toast: conditional `role`** | `role="alert"` for error/warning; `role="status"` for info/success |
| **`aria-atomic="true"`** | Entire toast announced as unit |
| **`tabindex="0"`** | Toasts are focusable |
| **Keyboard** | **Escape** dismisses focused toast |
| **Timer** | Pauses on hover/focus, resumes on leave/blur |

#### Usage

```html
<a11y-toast position="bottom-right" duration="5000" max-toasts="5"></a11y-toast>

<script>
  const toast = document.querySelector('a11y-toast');

  toast.add({ type: 'success', title: 'Saved', description: 'Changes saved.' });

  toast.add({
    type: 'error',
    title: 'Error',
    description: 'Something went wrong.',
    duration: 0,  // Won't auto-dismiss
  });

  toast.add({
    type: 'info',
    title: 'Update',
    action: { label: 'Undo', onClick: () => undoAction() },
  });

  toast.clear();
</script>
```

**Methods:** `add(options)`, `remove(id)`, `clear()`
**Events:** `a11y-toast-add`, `a11y-toast-remove`

---

### `<a11y-visually-hidden>`

#### What the library handles

| Feature | Details |
|---------|---------|
| **Visually hidden styles** | Host element uses clip/overflow hiding — content remains in DOM for screen readers |
| **`focusable` attribute** | When present, content becomes visible when focused within (`:focus-within`) |
| **Shadow DOM** | Uses `<slot>` for content projection |

#### Usage

```html
<!-- Hidden label -->
<button>
  <span aria-hidden="true">&times;</span>
  <a11y-visually-hidden>Close dialog</a11y-visually-hidden>
</button>

<!-- Focusable (appears on focus) -->
<a11y-visually-hidden focusable>
  <a href="#main-content">Skip to main content</a>
</a11y-visually-hidden>
```

---

### `<a11y-skip-link>`

#### What the library handles

| Feature | Details |
|---------|---------|
| **Visually hidden until focus** | Uses visually-hidden styles, appears as fixed-position link on `:focus` |
| **Target focus management** | Finds target element, adds `tabindex="-1"` if needed, focuses it, scrolls into view |
| **`target` attribute** | CSS selector for destination (default: `"#main-content"`) |
| **`label` attribute** | Custom label text (default: slot content or "Skip to main content") |
| **CSS custom properties** | `--compa11y-skip-link-bg`, `--compa11y-skip-link-color`, `--compa11y-skip-link-padding`, etc. |
| **Forced colors support** | `@media (forced-colors: active)` with semantic borders |
| **Dev warning** | Warns if `target` attribute is missing |

#### Usage

```html
<!-- Place as first child of <body> -->
<a11y-skip-link target="#main-content">Skip to main content</a11y-skip-link>

<!-- With custom label attribute -->
<a11y-skip-link target="#main-content" label="Skip navigation"></a11y-skip-link>

<!-- Multiple skip links -->
<a11y-skip-link target="#main-content">Skip to content</a11y-skip-link>
<a11y-skip-link target="#search">Skip to search</a11y-skip-link>
```

Keyboard: **Tab** to reveal, **Enter** to activate.

---

### `<a11y-alert>`

#### What the library handles

| Feature | Details |
|---------|---------|
| **`role="alert"`** | Applied for `type="error"` and `type="warning"` — assertive live region |
| **`role="status"`** | Applied for `type="info"` and `type="success"` — polite live region |
| **`aria-live`** | `"assertive"` for error/warning, `"polite"` for info/success |
| **Dismiss button** | When `dismissible` attribute is present, renders close button with `aria-label="Dismiss alert"` |
| **Visual variants** | Left border accent per type, emoji icon per type |
| **CSS custom properties** | `--compa11y-alert-bg`, `--compa11y-alert-info-color`, `--compa11y-alert-success-color`, `--compa11y-alert-warning-color`, `--compa11y-alert-error-color`, etc. |
| **`::part()` exports** | `alert`, `icon`, `content`, `title`, `description`, `close` |
| **Forced colors support** | `@media (forced-colors: active)` with semantic borders |
| **Dev warning** | Warns if invalid `type` attribute is provided |

#### Usage

```html
<!-- Error alert (assertive) -->
<a11y-alert type="error" title="Payment failed">
  Your card was declined. Please try a different payment method.
</a11y-alert>

<!-- Success alert -->
<a11y-alert type="success" title="Saved!">
  Your changes have been saved successfully.
</a11y-alert>

<!-- Dismissible -->
<a11y-alert type="info" dismissible>
  This alert can be closed by the user.
</a11y-alert>
```

**Attributes:** `type` (info/success/warning/error), `title`, `dismissible`
**Methods:** `dismiss()`
**Events:** `dismiss`

---

## React Hooks

### ID Generation Hooks

#### `useId(prefix?)`

Generate a unique, stable ID for ARIA attribute associations.

```tsx
function Input({ label }) {
  const id = useId('input');
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <input id={id} />
    </>
  );
}
```

#### `useIds(parts, prefix?)`

Generate multiple related IDs for a component.

```tsx
function Combobox() {
  const ids = useIds(['input', 'listbox', 'label'] as const, 'combo');
  // ids.input, ids.listbox, ids.label — all unique, all related
  return (
    <>
      <label id={ids.label}>Search</label>
      <input id={ids.input} aria-controls={ids.listbox} aria-labelledby={ids.label} />
      <ul id={ids.listbox} role="listbox" />
    </>
  );
}
```

#### `useIdScope(componentName)`

Create a scoped ID generator for complex components with many elements.

```tsx
function Dialog() {
  const ids = useIdScope('dialog');
  const titleId = ids.generate('title');
  const descId = ids.generate('description');
  return <div id={ids.id} aria-labelledby={titleId} aria-describedby={descId} />;
}
```

---

### Focus Management Hooks

#### `useFocusTrap(options)`

Create a focus trap that keeps Tab/Shift+Tab within a container. Used internally by Dialog.

```tsx
function Modal({ isOpen, onClose }) {
  const trapRef = useFocusTrap<HTMLDivElement>({
    active: isOpen,
    onDeactivate: onClose,
    escapeDeactivates: true,
    returnFocus: true,
  });

  return (
    <div ref={trapRef} role="dialog" aria-modal="true">
      <button onClick={onClose}>Close</button>
      <p>Trapped content</p>
    </div>
  );
}
```

**Options:** `active`, `initialFocus`, `returnFocus`, `clickOutsideDeactivates`, `escapeDeactivates`, `onDeactivate`

#### `useFocusTrapControls(options)`

Imperative control over a focus trap (activate/deactivate/pause/unpause programmatically).

```tsx
const { ref, activate, deactivate, pause, unpause, isActive } = useFocusTrapControls();
```

#### `useFocusVisible()`

Detect whether focus should show a visible ring (keyboard navigation vs mouse click).

```tsx
function Button({ children }) {
  const { isFocusVisible, focusProps } = useFocusVisible();

  return (
    <button {...focusProps} className={isFocusVisible ? 'focus-ring' : ''}>
      {children}
    </button>
  );
}
```

#### `useFocusManager(options)`

Automatically focus an element on mount and optionally restore focus on unmount.

```tsx
const ref = useFocusManager({ autoFocus: true, restoreFocus: true, focusVisible: true });
return <input ref={ref} />;
```

#### `useFocusControl()`

Imperative focus control — call `focus()` programmatically with optional visible ring.

```tsx
const { ref, focus } = useFocusControl<HTMLButtonElement>();

const handleAction = () => {
  focus({ visible: true }); // Focus with keyboard-style ring
};

return <button ref={ref}>Target</button>;
```

#### `useFocusWithin()`

Track whether an element or any of its children have focus.

```tsx
const { ref, hasFocus, focusWithinProps } = useFocusWithin<HTMLDivElement>();

return (
  <div ref={ref} {...focusWithinProps} className={hasFocus ? 'active-group' : ''}>
    <input />
    <button>Search</button>
  </div>
);
```

#### `useFocusNeighbor(options?)`

Find and focus the nearest focusable sibling. Useful when the current element is about to be removed or disabled.

```tsx
function RemovableItem({ item, onRemove }) {
  const { ref, focusNeighbor } = useFocusNeighbor<HTMLLIElement>();

  const handleRemove = () => {
    focusNeighbor(); // Move focus to nearest neighbor before removal
    onRemove(item.id);
  };

  return (
    <li ref={ref}>
      {item.label}
      <button onClick={handleRemove}>Remove</button>
    </li>
  );
}
```

**Options:** `scope` (container to search within), `prefer` (`'previous'` or `'next'`)

#### `useFocusReturn()`

Save the current focus target and restore it later. If the saved element is disabled or removed, focus moves to its nearest neighbor automatically.

```tsx
function ModalFlow() {
  const { save, returnFocus, clear } = useFocusReturn();

  const openModal = () => {
    save(); // Remember whatever is focused right now (e.g., the trigger button)
    showModal();
  };

  const closeModal = () => {
    hideModal();
    returnFocus(); // Go back to trigger — or its neighbor if trigger is now disabled
  };
}
```

---

### Keyboard Hooks

#### `useKeyboard(handlers, options?)`

Generic keyboard event handler that normalizes keys across browsers.

```tsx
const { onKeyDown } = useKeyboard({
  ArrowDown: () => focusNext(),
  ArrowUp: () => focusPrevious(),
  Enter: () => selectItem(),
  Escape: () => close(),
  'Ctrl+A': () => selectAll(),
  Space: () => toggleItem(),
});

return <ul onKeyDown={onKeyDown} role="listbox">{/* ... */}</ul>;
```

> **Note:** Use `'Space'` (not `' '`) for the space key. The library normalizes `event.key === ' '` to `'Space'` internally.

**Options:** `preventDefault` (default: true), `stopPropagation` (default: true), `disabled`

#### `useMenuKeyboard(options)`

Pre-built keyboard pattern for menus and listboxes.

```tsx
const { onKeyDown } = useMenuKeyboard({
  onDown: () => focusNext(),
  onUp: () => focusPrevious(),
  onEnter: () => selectItem(),
  onEscape: () => closeMenu(),
  onHome: () => focusFirst(),
  onEnd: () => focusLast(),
});
```

#### `useTabsKeyboard(options)`

Pre-built keyboard pattern for tab navigation (horizontal).

```tsx
const { onKeyDown } = useTabsKeyboard({
  onLeft: () => previousTab(),
  onRight: () => nextTab(),
  onHome: () => firstTab(),
  onEnd: () => lastTab(),
});
```

#### `useGridKeyboard(options)`

Pre-built keyboard pattern for 2D grid navigation.

```tsx
const { onKeyDown } = useGridKeyboard({
  onUp: () => moveUp(),
  onDown: () => moveDown(),
  onLeft: () => moveLeft(),
  onRight: () => moveRight(),
  onCtrlHome: () => goToFirstCell(),
  onCtrlEnd: () => goToLastCell(),
});
```

#### `useTypeAhead(items, onMatch, options?)`

Type-ahead search for lists — pressing characters jumps to matching items.

```tsx
const { onKeyDown, reset } = useTypeAhead(
  items.map((i) => i.label),
  (match) => {
    const index = items.findIndex((i) => i.label === match);
    setFocusedIndex(index);
  },
  { timeout: 500 }
);

return <ul onKeyDown={onKeyDown} onBlur={reset}>{/* ... */}</ul>;
```

#### `useKeyPressed(targetKey)`

Track whether a specific key is currently held down.

```tsx
const isShiftHeld = useKeyPressed('Shift');
// Useful for multi-select behavior: "hold Shift to extend selection"
```

---

### Announcer Hooks

#### `useAnnouncer()`

Access the screen reader announcement system.

```tsx
const { announce, polite, assertive, queue, clear } = useAnnouncer();

// Polite announcement (won't interrupt)
polite('3 results found');

// Assertive announcement (interrupts current speech)
assertive('Error: form validation failed');

// Queue rapid announcements (debounced)
queue('Processing...', { debounce: 300 });
```

#### `useAnnounceOnChange(value, getMessage, options?)`

Automatically announce when a value changes.

```tsx
useAnnounceOnChange(
  selectedCount,
  (count) => `${count} items selected`,
  { skipInitial: true }
);
```

#### `useAnnounceLoading(isLoading, options?)`

Announce loading state transitions.

```tsx
useAnnounceLoading(isLoading, {
  loadingMessage: 'Loading data...',
  loadedMessage: 'Data loaded successfully',
  errorMessage: 'Failed to load data',
  error: fetchError,
});
```

---

### Roving Tabindex Hooks

#### `useRovingTabindex(options)`

Implement the roving tabindex pattern — only one item in a group has `tabindex="0"` at a time.

```tsx
function Toolbar() {
  const { activeIndex, getItemProps } = useRovingTabindex({
    itemCount: 3,
    orientation: 'horizontal',
    wrap: true,
  });

  return (
    <div role="toolbar">
      <button {...getItemProps(0)}>Cut</button>
      <button {...getItemProps(1)}>Copy</button>
      <button {...getItemProps(2)}>Paste</button>
    </div>
  );
}
```

`getItemProps(index)` returns `{ tabIndex, onKeyDown, onFocus }` — spread it on each item.

#### `useRovingTabindexMap(ids, options?)`

Same as `useRovingTabindex` but indexed by IDs instead of numeric indices.

```tsx
const ids = items.map((i) => i.id);
const { activeId, getItemProps } = useRovingTabindexMap(ids, {
  orientation: 'vertical',
});

return (
  <ul role="menu">
    {items.map((item) => (
      <li key={item.id} {...getItemProps(item.id)}>{item.label}</li>
    ))}
  </ul>
);
```

---

## Core Utilities

These are framework-agnostic utilities from `@compa11y/core` that power both the React and Web components. You can use them directly in any JavaScript project.

### ARIA Helpers

```ts
import { aria, buildAriaProps, mergeAriaIds, hasAccessibleName } from '@compa11y/core';
```

#### `aria` — Chainable ARIA attribute setter

```ts
aria.hide(element);                        // aria-hidden="true"
aria.show(element);                        // removes aria-hidden
aria.setExpanded(element, true);           // aria-expanded="true"
aria.setSelected(element, true);           // aria-selected="true"
aria.setChecked(element, 'mixed');         // aria-checked="mixed"
aria.setDisabled(element, true);           // aria-disabled="true"
aria.setRequired(element, true);           // aria-required="true"
aria.setInvalid(element, true);            // aria-invalid="true"
aria.setLabel(element, 'Close');           // aria-label="Close"
aria.setLabelledBy(element, 'title-id');   // aria-labelledby="title-id"
aria.setDescribedBy(element, 'hint-id');   // aria-describedby="hint-id"
aria.setControls(element, 'menu-id');      // aria-controls="menu-id"
aria.setLive(element, 'polite');           // aria-live="polite"
aria.setRole(element, 'dialog');           // role="dialog"
aria.setActiveDescendant(element, 'opt-3'); // aria-activedescendant="opt-3"
aria.setOrientation(element, 'vertical');  // aria-orientation="vertical"
aria.setCurrent(element, 'page');          // aria-current="page"
aria.setPressed(element, true);            // aria-pressed="true"
aria.setModal(element, true);              // aria-modal="true"
aria.setHasPopup(element, 'menu');         // aria-haspopup="menu"
aria.setBusy(element, true);              // aria-busy="true"
```

#### `buildAriaProps(props)` — For React

```ts
const ariaProps = buildAriaProps({
  role: 'dialog',
  label: 'Settings',
  modal: true,
  expanded: false,
});
// Returns: { role: 'dialog', 'aria-label': 'Settings', 'aria-modal': 'true', 'aria-expanded': 'false' }

<div {...ariaProps} />
```

#### `mergeAriaIds(...ids)` — Combine conditional IDs

```ts
const describedBy = mergeAriaIds(hintId, hasError ? errorId : null);
// Returns: "hint-1 error-1" or "hint-1" depending on hasError
```

#### `hasAccessibleName(element)` — Check for accessible name

```ts
if (!hasAccessibleName(button)) {
  console.warn('Button has no accessible name!');
}
```

---

### Focus Trap

```ts
import { createFocusTrap, getActiveFocusTrap, hasFocusTrap } from '@compa11y/core';
```

Constrains focus within a container — Tab/Shift+Tab cycle within the trap. Used by Dialog internally.

```ts
const trap = createFocusTrap(modalElement, {
  initialFocus: closeButton,        // Where to focus on activation
  returnFocus: true,                // Return focus to previous element on deactivation
  escapeDeactivates: true,          // Escape key deactivates trap
  clickOutsideDeactivates: false,   // Click outside behavior
  onDeactivate: () => closeModal(), // Callback on deactivation
});

trap.activate();   // Start trapping
trap.pause();      // Pause (for nested traps)
trap.unpause();    // Resume
trap.deactivate(); // Stop trapping, restore focus
trap.destroy();    // Cleanup without callback

// Stack management
hasFocusTrap();        // Any trap active?
getActiveFocusTrap();  // Get the topmost trap
```

---

### Focus Visible

```ts
import {
  initFocusVisible,
  isFocusVisible,
  hasVisibleFocus,
  getLastFocusSource,
  setFocusVisible,
  focusWithVisibleRing,
} from '@compa11y/core';
```

Distinguishes keyboard focus from mouse/touch focus. Call `initFocusVisible()` once at app startup.

```ts
// Initialize once
const cleanup = initFocusVisible();

// Check focus type
isFocusVisible();              // true if last focus was keyboard-initiated
getLastFocusSource();          // 'keyboard' | 'mouse' | 'touch' | 'unknown'
hasVisibleFocus(element);      // Does this specific element have visible focus?

// Force visible focus (useful for programmatic focus in modals)
focusWithVisibleRing(firstButton);

// Manual override
setFocusVisible(element, true);
```

---

### Focus Scope & Roving Tabindex

```ts
import { createFocusScope, createRovingTabindex } from '@compa11y/core';
```

#### Focus Scope — Navigate within a container

```ts
const scope = createFocusScope(container, {
  contain: true,       // Tab wraps within container
  restoreFocus: true,  // Restore focus on destroy
  autoFocus: true,     // Focus first element immediately
});

scope.focusFirst();
scope.focusLast();
scope.focusNext({ wrap: true });
scope.focusPrevious({ wrap: true });
scope.focusAt(2);
scope.getFocused();    // Currently focused element
scope.getElements();   // All focusable elements in scope
scope.destroy();       // Cleanup
```

#### Roving Tabindex — One tabbable item at a time

```ts
const roving = createRovingTabindex(toolbar, '[role="button"]', {
  initialIndex: 0,
  orientation: 'horizontal',
  wrap: true,
  onSelectionChange: (index, element) => console.log('Selected:', index),
});

roving.next();
roving.previous();
roving.first();
roving.last();
roving.goto(2);
roving.getIndex();  // Current index
roving.update();    // Refresh when DOM changes
roving.destroy();   // Cleanup
```

---

### Focus Neighbor & Focus Return

```ts
import { findFocusNeighbor, createFocusReturn } from '@compa11y/core';
```

#### `findFocusNeighbor(element, options?)` — Find alternate focus target

When an element is about to be removed or disabled, find the nearest focusable sibling.

```ts
const neighbor = findFocusNeighbor(deletedItem, {
  scope: listContainer,   // Search within (default: parent element)
  prefer: 'previous',     // Try previous first, then next (default)
});

neighbor?.focus();
```

#### `createFocusReturn(initialElement?)` — Save and restore focus

Remember a focus target and restore it later — with automatic fallback to the nearest neighbor if the saved element is no longer focusable.

```ts
const focusReturn = createFocusReturn();

// Before opening modal
focusReturn.save(); // Saves document.activeElement
// or
focusReturn.save(triggerButton); // Save specific element

// After closing modal
focusReturn.return(); // Focuses saved element, or its nearest neighbor if disabled

// With options
focusReturn.return({
  prefer: 'next',           // Try next neighbor first if saved element is gone
  fallback: someOtherButton // Last resort fallback
});

focusReturn.element; // Read the saved element (readonly)
focusReturn.clear(); // Clear without focusing
```

---

### Keyboard Manager

```ts
import {
  createKeyboardManager,
  normalizeKey,
  getKeyCombo,
  KeyboardPatterns,
  createTypeAhead,
} from '@compa11y/core';
```

#### Keyboard Manager

```ts
const kb = createKeyboardManager(
  {
    ArrowDown: () => focusNext(),
    ArrowUp: () => focusPrevious(),
    Enter: () => selectItem(),
    Escape: () => close(),
    'Ctrl+A': () => selectAll(),
    Space: () => toggleItem(),
  },
  {
    preventDefault: true,    // Default: true
    stopPropagation: true,   // Default: true
    targetSelector: '[role="option"]', // Only handle when target matches
  }
);

kb.attach(listElement);  // Start listening
kb.on('Delete', () => removeItem());  // Add handler
kb.off('Delete');         // Remove handler
kb.detach();              // Stop listening
kb.destroy();             // Cleanup
```

#### Key Normalization

```ts
normalizeKey(event);  // ' ' → 'Space', 'Esc' → 'Escape', 'Left' → 'ArrowLeft'
getKeyCombo(event);   // 'Ctrl+A', 'Shift+Enter', 'Meta+Space'
```

#### Pre-built Patterns

```ts
KeyboardPatterns.menu({ onUp, onDown, onEnter, onEscape, onHome, onEnd });
KeyboardPatterns.tabs({ onLeft, onRight, onHome, onEnd });
KeyboardPatterns.dialog({ onEscape });
KeyboardPatterns.grid({ onUp, onDown, onLeft, onRight, onHome, onEnd, onCtrlHome, onCtrlEnd });
```

#### Type-Ahead

```ts
const typeAhead = createTypeAhead(['Apple', 'Apricot', 'Banana', 'Cherry'], {
  timeout: 500, // Reset after 500ms of no typing
});

typeAhead.type('a');  // Returns 'Apple'
typeAhead.type('p');  // Returns 'Apricot' (search is now 'ap')
// After 500ms, resets
typeAhead.type('b');  // Returns 'Banana'
typeAhead.reset();    // Manual reset
typeAhead.getSearch(); // Current search string
```

---

### Live Announcer

```ts
import {
  initAnnouncer,
  announce,
  announcePolite,
  announceAssertive,
  announceStatus,
  announceError,
  announceProgress,
  queueAnnouncement,
  clearAnnouncements,
  createAnnouncer,
} from '@compa11y/core';
```

The announcer creates invisible ARIA live regions (`aria-live="polite"` and `aria-live="assertive"`) and injects text into them to trigger screen reader announcements.

```ts
// Initialize once at app startup
const cleanup = initAnnouncer();

// Basic announcements
announce('Form submitted');                          // Polite by default
announcePolite('3 search results found');            // Non-interrupting
announceAssertive('Error: invalid email address');   // Interrupts current speech

// Convenience functions
announceStatus('Saved');                              // Polite status update
announceError('Connection lost');                     // Assertive error
announceProgress(5, 10);                              // "5 of 10"
announceProgress(5, 10, 'Step {current} of {total}'); // "Step 5 of 10"

// Advanced options
announce('Updated', {
  politeness: 'polite',
  delay: 100,           // Delay in ms
  clearPrevious: true,  // Clear previous messages first
  timeout: 7000,        // Auto-clear after 7s (default)
});

// Queue rapid announcements (debounced)
queueAnnouncement('Processing...', { debounce: 300 });

// Clear all
clearAnnouncements();

// Scoped announcer with defaults
const myAnnouncer = createAnnouncer({ politeness: 'polite' });
myAnnouncer.announce('Done');
myAnnouncer.assertive('Error!');
```

---

### ID Generation

```ts
import { generateId, generateIds, createIdScope, resetIdCounter } from '@compa11y/core';
```

```ts
generateId();           // 'compa11y-1'
generateId('button');   // 'compa11y-button-2'

const ids = generateIds(['label', 'input', 'error'] as const, 'search');
// { label: 'compa11y-search-3-label', input: 'compa11y-search-3-input', error: 'compa11y-search-3-error' }

const scope = createIdScope('dropdown');
scope.id;                    // 'compa11y-dropdown-4'
scope.generate('trigger');   // 'compa11y-dropdown-4-trigger'
scope.generate('menu');      // 'compa11y-dropdown-4-menu'

resetIdCounter(); // For testing only
```

---

### Platform Detection

```ts
import {
  isBrowser,
  isMac,
  isIOS,
  isAndroid,
  isWindows,
  isTouchDevice,
  prefersReducedMotion,
  prefersHighContrast,
  prefersDarkMode,
  getScreenReaderHints,
  createMediaQueryListener,
} from '@compa11y/core';
```

```ts
isBrowser();            // true if running in browser (not SSR)
isMac();                // true on macOS
isIOS();                // true on iOS
isAndroid();            // true on Android
isWindows();            // true on Windows
isTouchDevice();        // true if device supports touch

// User preferences
prefersReducedMotion(); // true if user prefers reduced motion
prefersHighContrast();  // true if user prefers high contrast
prefersDarkMode();      // true if user prefers dark color scheme

// Screen reader hints (not 100% reliable)
const { possibleScreenReader, forcedColors } = getScreenReaderHints();

// Listen for preference changes
const cleanup = createMediaQueryListener(
  '(prefers-reduced-motion: reduce)',
  (prefersReduced) => setAnimations(!prefersReduced)
);
```

---

### Dev Warnings

```ts
import { warn, checks, createComponentWarnings, setWarningHandler } from '@compa11y/core';
```

Development-only warnings that help catch accessibility issues early. These are stripped in production builds.

```ts
// Direct warning
warn('Button has no accessible label', 'Button');

// Pre-built checks
checks.hasLabel(element, 'Button');          // Warns if no accessible name
checks.hasLabelledBy(element, 'Combobox');   // Warns if no aria-labelledby

// Component-specific warning factory
const warnings = createComponentWarnings('MyComponent');
warnings.missingProp('aria-label');
warnings.invalidValue('size', 'huge', ['sm', 'md', 'lg']);

// Custom warning handler (e.g., for testing)
setWarningHandler((message, component) => {
  throw new Error(`[${component}] ${message}`);
});
```
