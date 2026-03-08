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
  - [Link](#link)
  - [Heading](#heading)
  - [Text](#text)
  - [FormField](#formfield)
  - [Popover](#popover)
  - [Accordion](#accordion)
  - [Table](#table)
  - [Pagination](#pagination)
  - [Breadcrumbs](#breadcrumbs)
  - [Tooltip](#tooltip)
  - [Drawer](#drawer)
  - [Slider](#slider)
  - [ProgressBar](#progressbar)
  - [Skeleton](#skeleton)
  - [EmptyState](#emptystate)
  - [NumberField](#numberfield)
  - [SearchField](#searchfield)
  - [ErrorSummary](#errorsummary)
  - [Stepper](#stepper)
  - [DataGrid](#datagrid)
  - [Carousel](#carousel)
  - [RichTextEditor](#richtexteditor)
- [Web Components](#web-components)
  - [`<compa11y-button>`](#compa11y-button)
  - [`<compa11y-input>`](#compa11y-input)
  - [`<compa11y-textarea>`](#compa11y-textarea)
  - [`<compa11y-checkbox>` & `<compa11y-checkbox-group>`](#compa11y-checkbox)
  - [`<compa11y-radio-group>` & `<compa11y-radio>`](#compa11y-radio-group)
  - [`<compa11y-switch>`](#compa11y-switch)
  - [`<compa11y-select>`](#compa11y-select)
  - [`<compa11y-combobox>`](#compa11y-combobox)
  - [`<compa11y-listbox>`](#compa11y-listbox)
  - [`<compa11y-dialog>`](#compa11y-dialog)
  - [`<compa11y-menu>`](#compa11y-menu)
  - [`<compa11y-tabs>`](#compa11y-tabs)
  - [`<compa11y-toast>`](#compa11y-toast)
  - [`<compa11y-visually-hidden>`](#compa11y-visually-hidden)
  - [`<compa11y-skip-link>`](#compa11y-skip-link)
  - [`<compa11y-alert>`](#compa11y-alert)
  - [`<compa11y-link>`](#compa11y-link)
  - [`<compa11y-heading>`](#compa11y-heading)
  - [`<compa11y-text>`](#compa11y-text)
  - [`<compa11y-form-field>`](#compa11y-form-field)
  - [`<compa11y-popover>`](#compa11y-popover)
  - [`<compa11y-accordion>`](#compa11y-accordion)
  - [`<compa11y-table>`](#compa11y-table)
  - [`<compa11y-pagination>`](#compa11y-pagination)
  - [`<compa11y-breadcrumbs>`](#compa11y-breadcrumbs)
  - [`<compa11y-tooltip>`](#compa11y-tooltip)
  - [`<compa11y-drawer>`](#compa11y-drawer)
  - [`<compa11y-slider>`](#compa11y-slider)
  - [`<compa11y-progress-bar>`](#compa11y-progress-bar)
  - [`<compa11y-skeleton>`](#compa11y-skeleton)
  - [`<compa11y-number-field>`](#compa11y-number-field)
  - [`<compa11y-empty-state>`](#emptystate)
  - [`<compa11y-search-field>`](#searchfield)
  - [`<compa11y-error-summary>`](#errorsummary)
  - [`<compa11y-stepper>`](#stepper)
  - [`<compa11y-data-grid>`](#datagrid)
  - [`<compa11y-carousel>`](#compa11y-carousel)
  - [`<compa11y-rich-text-editor>`](#compa11y-rich-text-editor)
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

### Link

An accessible anchor element with external link handling, navigation context, and disabled state.

#### What the library handles

| Feature | Details |
|---------|---------|
| **External links** | When `external` is true, adds `target="_blank"`, `rel="noopener noreferrer"`, external icon, and screen reader "(opens in new tab)" hint |
| **`aria-current`** | Supports `"page"`, `"step"`, `"location"`, `"true"` for navigation context |
| **Disabled state** | When `disabled` is true, removes `href`, sets `role="link"`, `aria-disabled="true"`, `tabIndex={-1}` |
| **`unstyled` prop** | Removes default styles for full customization |

#### Usage

```tsx
import { Link } from '@compa11y/react';

// Basic link
<Link href="/about">About us</Link>

// External link (opens in new tab with screen reader hint)
<Link href="https://example.com" external>Visit Example</Link>

// Current page in navigation
<Link href="/dashboard" current="page">Dashboard</Link>

// Disabled link
<Link href="/settings" disabled>Settings</Link>
```

---

### Heading

A semantic heading component that renders `<h1>`–`<h6>` elements with consistent typography.

#### What the library handles

| Feature | Details |
|---------|---------|
| **Semantic elements** | Renders actual `<h1>`–`<h6>` based on `level` prop (default: `2`) |
| **Size override** | Optional `size` prop to visually adjust without changing semantic level |
| **Color, weight, alignment** | `color`, `weight`, `align` props for text styling |
| **Truncation** | `truncate` prop adds ellipsis overflow |
| **`unstyled` prop** | Removes default styles for full customization |

#### Usage

```tsx
import { Heading } from '@compa11y/react';

<Heading level={1}>Page Title</Heading>
<Heading level={2} size="lg">Visually smaller h2</Heading>
<Heading level={3} color="muted">Muted heading</Heading>
```

---

### Text

A semantic text component that renders `<p>`, `<span>`, `<div>`, or `<label>` with consistent typography.

#### What the library handles

| Feature | Details |
|---------|---------|
| **Semantic elements** | Renders `<p>` (default), `<span>`, `<div>`, or `<label>` via `as` prop |
| **Size scale** | `xs`, `sm`, `md` (default), `lg`, `xl`, `2xl`, `3xl` |
| **Color variants** | `default`, `muted`, `accent`, `error`, `success`, `warning` |
| **Weight, alignment** | `weight`, `align` props for text styling |
| **Truncation** | `truncate` prop adds ellipsis overflow |
| **`unstyled` prop** | Removes default styles for full customization |

#### Usage

```tsx
import { Text } from '@compa11y/react';

<Text>Default body paragraph.</Text>
<Text size="sm" color="muted">Small muted text.</Text>
<Text as="span" weight="bold">Bold inline text.</Text>
<Text truncate style={{ maxWidth: 300 }}>Long text that truncates...</Text>
```

---

### FormField

A compound component that provides label, hint, error, and required indicator for **any** form control. Unlike `<Input>`, it is control-agnostic — wrap native inputs, selects, textareas, switches, or custom components.

#### What the library handles

| Feature | Details |
|---------|---------|
| **`aria-labelledby`** | Label element ID wired to control via `<FormField.Control>` render-prop |
| **`aria-describedby`** | Includes hint and/or error IDs when present |
| **`aria-invalid`** | Set when `error` prop is truthy |
| **`aria-required`** | Set when `required` prop is true |
| **`aria-disabled`** | Set when `disabled` prop is true |
| **Required asterisk** | Rendered visually via `<span aria-hidden="true">*</span>` |
| **Error live region** | `<FormField.Error>` renders with `role="alert"` |
| **Dev warning** | Warns in development if `label` is missing |
| **`unstyled` prop** | Removes default styles for full customization |
| **Dual mode** | Props mode (`label`, `hint`, `error` as props) or compound mode (`<FormField.Label>`, sub-components) |

#### Sub-components

| Sub-component | Description |
|--------------|-------------|
| `<FormField.Label>` | `<label>` wired to control; rendered automatically when `label` prop is passed |
| `<FormField.Control>` | Render-prop providing `controlId` and `ariaProps` to spread onto the control |
| `<FormField.Hint>` | Hint text; registers itself in `aria-describedby` |
| `<FormField.Error>` | Error message; renders with `role="alert"`, only when children are truthy |

#### Usage

```tsx
import { FormField } from '@compa11y/react';

// Props mode — label/hint/error as props, control via render-prop
<FormField label="Email" hint="We'll never share it." error={emailError} required>
  <FormField.Control>
    {({ controlId, ariaProps }) => (
      <input id={controlId} type="email" {...ariaProps} />
    )}
  </FormField.Control>
</FormField>

// Compound mode — sub-components for full layout control
<FormField error={pwError} required>
  <FormField.Label>Password</FormField.Label>
  <FormField.Control>
    {({ controlId, ariaProps }) => (
      <input id={controlId} type="password" {...ariaProps} />
    )}
  </FormField.Control>
  <FormField.Hint>Minimum 8 characters.</FormField.Hint>
  <FormField.Error>{pwError}</FormField.Error>
</FormField>

// Works with any control — native select, custom component, etc.
<FormField label="Country" required>
  <FormField.Control>
    {({ controlId, ariaProps }) => (
      <select id={controlId} {...ariaProps}>
        <option value="">Choose…</option>
        <option value="us">United States</option>
      </select>
    )}
  </FormField.Control>
</FormField>
```

---

### Popover

A non-modal, anchored overlay — semantically distinct from Dialog (no focus trap, no scroll lock). Use for contextual information, actions, or forms anchored to a trigger.

#### What the library handles

| Feature | Details |
|---------|---------|
| **`aria-haspopup="dialog"`** | Set on `<Popover.Trigger>` to signal a popover will open |
| **`aria-expanded`** | Toggled on the trigger to reflect open/closed state |
| **`aria-controls`** | Points from trigger to content element |
| **`role="dialog"` + `aria-modal="false"`** | Content is a non-modal dialog region |
| **`aria-labelledby`** | Content is labelled by the trigger ID |
| **Focus management** | First focusable element inside content receives focus on open; focus returns to trigger on close |
| **Escape key** | Closes popover, returns focus to trigger |
| **Outside click** | Clicking outside closes the popover (`pointerdown` listener) |
| **Viewport positioning** | Automatically flips placement if content would overflow viewport |
| **Scroll/resize tracking** | Position is updated while the popover is open |
| **Controlled + Uncontrolled** | `open`/`defaultOpen` + `onOpenChange` |

#### Sub-components

| Sub-component | Description |
|--------------|-------------|
| `<Popover.Trigger>` | Button that toggles the popover; wired with ARIA |
| `<Popover.Content>` | Positioned overlay rendered in a portal; manages focus and dismiss |
| `<Popover.Close>` | Button inside content that closes the popover and returns focus |

#### Usage

```tsx
import { Popover } from '@compa11y/react';

// Basic
<Popover>
  <Popover.Trigger>More info</Popover.Trigger>
  <Popover.Content>
    <p>Non-modal overlay. Press Escape or click outside to dismiss.</p>
  </Popover.Content>
</Popover>

// With placement and close button
<Popover>
  <Popover.Trigger>Settings</Popover.Trigger>
  <Popover.Content placement="bottom-start">
    <p>Configure your preferences here.</p>
    <Popover.Close>Dismiss</Popover.Close>
  </Popover.Content>
</Popover>

// Controlled
const [open, setOpen] = useState(false);
<Popover open={open} onOpenChange={setOpen}>
  <Popover.Trigger>Open</Popover.Trigger>
  <Popover.Content placement="right">
    <p>Controlled popover content.</p>
  </Popover.Content>
</Popover>
```

#### Placement values

`top` | `top-start` | `top-end` | `bottom` (default) | `bottom-start` | `bottom-end` | `left` | `left-start` | `left-end` | `right` | `right-start` | `right-end`

---

### Accordion

Expand/collapse sections of content. Supports single or multiple open items, controlled and uncontrolled modes.

**Components:** `<Accordion>` · `<Accordion.Item>` · `<Accordion.Trigger>` · `<Accordion.Content>`

#### What the library handles

| Feature | Details |
|---------|---------|
| **`aria-expanded`** | Set to `"true"`/`"false"` on `Accordion.Trigger` to indicate open/closed state |
| **`aria-controls`** | Trigger references its panel via `aria-controls` |
| **`role="region"`** | Set on `Accordion.Content` for landmark navigation |
| **`aria-labelledby`** | Panel references its trigger via `aria-labelledby` |
| **`disabled`** | `disabled` attribute on trigger prevents interaction; keyboard skips it |
| **Keyboard Navigation** | `↓`/`↑` between triggers, `Home`/`End` for first/last, `Enter`/`Space` to toggle |
| **Screen Reader** | Announces `"Expanded"` or `"Collapsed"` after toggling |
| **Single mode** | Only one item open at a time; `collapsible` prop controls whether active item can close |
| **Multiple mode** | Any number of items can be open simultaneously |
| **Controlled + Uncontrolled** | Works with `value`/`onValueChange` or `defaultValue` |

#### Keyboard navigation

| Key | Behavior |
|-----|---------|
| `Enter` / `Space` | Toggle the focused section |
| `↓` | Move focus to the next accordion header |
| `↑` | Move focus to the previous accordion header |
| `Home` | Move focus to the first accordion header |
| `End` | Move focus to the last accordion header |
| `Tab` | Move focus into/out of the accordion |

#### Usage

```tsx
// Uncontrolled, single mode
<Accordion defaultValue="item-1">
  <Accordion.Item value="item-1">
    <h3><Accordion.Trigger>Section 1</Accordion.Trigger></h3>
    <Accordion.Content>Content 1</Accordion.Content>
  </Accordion.Item>
  <Accordion.Item value="item-2">
    <h3><Accordion.Trigger>Section 2</Accordion.Trigger></h3>
    <Accordion.Content>Content 2</Accordion.Content>
  </Accordion.Item>
</Accordion>

// Controlled, collapsible
<Accordion
  type="single"
  collapsible
  value={openItem}
  onValueChange={setOpenItem}
>
  ...
</Accordion>

// Multiple items can be open
<Accordion type="multiple" defaultValue={['item-1', 'item-2']}>
  ...
</Accordion>

// Disabled item
<Accordion.Item value="item-3" disabled>
  <h3><Accordion.Trigger>Cannot open</Accordion.Trigger></h3>
  <Accordion.Content>Unreachable</Accordion.Content>
</Accordion.Item>
```

#### What you must provide

| Requirement | Why |
|-------------|-----|
| Wrap `Accordion.Trigger` in a heading (`<h2>`–`<h6>`) | Provides document outline and visual hierarchy |
| Unique `value` on each `Accordion.Item` | Required for state tracking |

#### Props

**`Accordion`**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `'single' \| 'multiple'` | `'single'` | One or many items open at once |
| `collapsible` | `boolean` | `false` | In single mode, allow closing the active item |
| `value` | `string \| string[]` | — | Controlled open item(s) |
| `defaultValue` | `string \| string[]` | — | Default open item(s) |
| `onValueChange` | `(v: string \| string[]) => void` | — | Change handler |

**`Accordion.Item`**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | required | Unique identifier |
| `disabled` | `boolean` | `false` | Prevents opening/closing |

**`Accordion.Content`**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `forceMount` | `boolean` | `false` | Keep content in DOM when closed (hidden via `hidden` attribute) |

---

### Table

Accessible data table component. Renders native semantic HTML (`<table>`, `<thead>`, `<th>`, `<td>`, etc.) with automatic ARIA wiring for sorting and row selection. No ARIA props required from consumers.

**Components:** `<Table>` · `<Table.Head>` · `<Table.Body>` · `<Table.Foot>` · `<Table.Row>` · `<Table.Header>` · `<Table.Cell>` · `<Table.SelectAllCell>` · `<Table.SelectCell>` · `<Table.EmptyState>` · `<Table.LoadingState>`

#### What the library handles

| Feature | Details |
|---------|---------|
| **`<caption>`** | Rendered automatically from the `caption` prop; `captionHidden` visually hides it while keeping it accessible |
| **`scope="col"`** | Applied automatically to `Table.Header` cells inside `Table.Head` |
| **`scope="row"`** | Applied automatically to `Table.Header` cells inside `Table.Body` |
| **`aria-sort`** | Set to `ascending`, `descending`, or `none` on the `<th>` of sortable columns; updates immediately on sort |
| **Sort button** | Sortable headers render a native `<button>` internally — no `div` click handlers |
| **Sort cycling** | `none → ascending → descending → none` on repeated activation |
| **`aria-selected`** | Set on `<tr>` when the table is in selection mode (`rowId` prop supplied) |
| **Select-all indeterminate** | `Table.SelectAllCell` sets `.indeterminate` on the checkbox via a ref when some (not all) rows are selected |
| **Accessible checkbox labels** | `Table.SelectAllCell` uses `aria-label="Select all rows"`; `Table.SelectCell` requires a `label` prop |
| **`aria-busy`** | Applied to `<table>` when `isLoading={true}` |
| **Focus retention** | After sort re-renders, focus is returned to the activated sort button |
| **Screen Reader** | Announces sort direction changes and selection count changes via polite live region |
| **Dev warnings** | Warns in development if `caption`, `aria-label`, or `aria-labelledby` is missing; warns if `Table.SelectCell` is missing `label` |

#### Keyboard interactions

| Key | Target | Action |
|-----|--------|--------|
| `Tab` | All interactive elements | Move between sort buttons and checkboxes |
| `Enter` / `Space` | Sort button | Cycle sort: none → ascending → descending → none |
| `Space` | Row checkbox | Toggle row selection |

> This is a **data table**, not a grid. Arrow-key cell navigation is intentionally absent — that belongs to a separate Grid component.

#### Usage examples

```tsx
// Basic read-only
<Table caption="Team members">
  <Table.Head>
    <Table.Row>
      <Table.Header>Name</Table.Header>
      <Table.Header>Role</Table.Header>
    </Table.Row>
  </Table.Head>
  <Table.Body>
    {members.map(m => (
      <Table.Row key={m.id}>
        <Table.Cell>{m.name}</Table.Cell>
        <Table.Cell>{m.role}</Table.Cell>
      </Table.Row>
    ))}
  </Table.Body>
</Table>

// Sortable
<Table
  caption="Products"
  sortKey={sortKey}
  sortDirection={sortDir}
  onSortChange={(key, dir) => { setSortKey(key); setSortDir(dir); }}
>
  <Table.Head>
    <Table.Row>
      <Table.Header sortKey="name">Name</Table.Header>
      <Table.Header sortKey="price">Price</Table.Header>
    </Table.Row>
  </Table.Head>
  ...
</Table>

// Selectable
<Table caption="Users" selectedRows={selected} onSelectionChange={setSelected}>
  <Table.Head>
    <Table.Row>
      <Table.SelectAllCell rowIds={users.map(u => u.id)} />
      <Table.Header>Name</Table.Header>
    </Table.Row>
  </Table.Head>
  <Table.Body>
    {users.map(u => (
      <Table.Row key={u.id} rowId={u.id}>
        <Table.SelectCell label={`Select ${u.name}`} />
        <Table.Cell>{u.name}</Table.Cell>
      </Table.Row>
    ))}
  </Table.Body>
</Table>

// Empty / loading states
<Table.Body>
  {isLoading
    ? <Table.LoadingState colSpan={3}>Loading…</Table.LoadingState>
    : rows.length === 0
    ? <Table.EmptyState colSpan={3}>No results found</Table.EmptyState>
    : rows.map(r => <Table.Row key={r.id}>…</Table.Row>)}
</Table.Body>
```

#### API reference

| Prop | Component | Type | Default | Description |
|------|-----------|------|---------|-------------|
| `caption` | `Table` | `string` | — | Renders `<caption>`; required for accessible name unless `aria-label`/`aria-labelledby` is used |
| `captionHidden` | `Table` | `boolean` | `false` | Visually hides the caption (still accessible to AT) |
| `sortKey` | `Table` | `string \| null` | — | Controlled sort column |
| `sortDirection` | `Table` | `SortDirection` | `'none'` | Controlled sort direction |
| `onSortChange` | `Table` | `(key, dir) => void` | — | Called when sort changes |
| `selectedRows` | `Table` | `string[]` | — | Controlled selection |
| `defaultSelectedRows` | `Table` | `string[]` | — | Uncontrolled default selection |
| `onSelectionChange` | `Table` | `(rows) => void` | — | Called when selection changes |
| `isLoading` | `Table` | `boolean` | `false` | Shows loading state (`aria-busy`) |
| `sortKey` | `Table.Header` | `string` | — | Enables sort button on this column |
| `scope` | `Table.Header` | `string` | auto | Override auto-detected `scope` attribute |
| `rowId` | `Table.Row` | `string` | — | Required for selection; sets `aria-selected` |
| `rowIds` | `Table.SelectAllCell` | `string[]` | — | All selectable IDs (drives indeterminate state) |
| `label` | `Table.SelectCell` | `string` | — | **Required** — accessible label e.g. `"Select Alice"` |
| `colSpan` | `Table.EmptyState` | `number` | — | Required — spans full table width |
| `colSpan` | `Table.LoadingState` | `number` | — | Required — spans full table width |

---

### Pagination

Accessible pagination control. Renders a `<nav>` landmark with a labelled `<ul>` of page buttons, optional First/Last buttons, an optional rows-per-page `<select>`, and an optional "Go to page" number input. Works fully controlled, fully uncontrolled, or mixed.

**Component:** `<Pagination>`

#### What the library handles

| Feature | Details |
|---------|---------|
| **`<nav>` landmark** | Wraps all controls; `aria-label` defaults to `"Pagination"` and is customisable via `ariaLabel` |
| **`aria-current="page"`** | Applied to the active page button; no other ARIA role needed |
| **`aria-label` on every button** | `"Page N"`, `"Previous page"`, `"Next page"`, `"First page"`, `"Last page"` — meaningful out of context |
| **`disabled` attribute** | Native HTML `disabled` on buttons (not `aria-disabled`) for Prev/First at page 1, Next/Last at the last page, and when `disabled={true}` |
| **Live region** | `role="status" aria-live="polite" aria-atomic="true"` always present in the DOM; announces `"Page N of M"` on navigation, `"Showing 1–N of M"` on page-size change |
| **Ellipsis hiding** | Ellipsis `<li>` items carry `aria-hidden="true"` — they are purely visual |
| **Labelled page-size selector** | `<label>` is programmatically linked via `htmlFor` / `id` |
| **Labelled jump input** | `<label>` linked via `htmlFor`; validation error rendered in a `role="alert"` span linked to the input via `aria-describedby` |
| **Stable IDs** | `useId` generates unique IDs even when multiple instances share a page |
| **Controlled + uncontrolled** | `currentPage` / `onPageChange` for controlled; `defaultPage` seeds uncontrolled state |
| **Dev warnings** | Error if neither `totalPages` nor `totalItems` is supplied; warning if `currentPage` is out of range |

#### Keyboard interactions

| Key | Target | Action |
|-----|--------|--------|
| `Tab` | All buttons / inputs | Move between controls in DOM order |
| `Enter` / `Space` | Any page button | Navigate to that page |
| `Enter` | Jump-to input | Navigate to the entered page number; shows inline error if invalid |

#### Page range algorithm

The component never shows an ellipsis when it would only collapse a single page number. Given `boundaryCount` pages at each end and `siblingCount` pages either side of the current page:

- A gap of exactly 1 page → the page number is shown directly
- A gap of 2+ pages → a single `…` ellipsis is inserted

#### Usage examples

```tsx
// Uncontrolled (simplest)
<Pagination totalPages={24} />

// Controlled
const [page, setPage] = useState(1);
<Pagination
  totalPages={24}
  currentPage={page}
  onPageChange={setPage}
/>

// Derived from totalItems
<Pagination
  totalItems={312}
  pageSize={25}
  currentPage={page}
  onPageChange={setPage}
/>

// Full-featured
<Pagination
  totalItems={312}
  currentPage={page}
  onPageChange={setPage}
  showFirstLast
  showPageSize
  pageSizeOptions={[10, 25, 50, 100]}
  pageSize={pageSize}
  onPageSizeChange={setPageSize}
  showJumpTo
  ariaLabel="Products pagination"
/>

// Disabled
<Pagination totalPages={10} currentPage={1} disabled />
```

#### API reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `totalPages` | `number` | — | Total page count. Required unless `totalItems` is set |
| `totalItems` | `number` | — | Total item count; used to derive `totalPages` when `totalPages` is not set |
| `currentPage` | `number` | — | Controlled current page (1-indexed) |
| `defaultPage` | `number` | `1` | Initial page for uncontrolled usage |
| `onPageChange` | `(page: number) => void` | — | Called when the active page changes |
| `ariaLabel` | `string` | `"Pagination"` | `aria-label` for the `<nav>` landmark — must be unique when multiple instances appear on the same page |
| `siblingCount` | `number` | `1` | Pages shown either side of the current page |
| `boundaryCount` | `number` | `1` | Pages shown at each end of the range |
| `showFirstLast` | `boolean` | `false` | Show First (««) and Last (»») buttons |
| `disabled` | `boolean` | `false` | Disable all controls |
| `unstyled` | `boolean` | `false` | Omit `data-compa11y-*` attributes and inline layout styles |
| `showPageSize` | `boolean` | `false` | Render a rows-per-page `<select>` |
| `pageSize` | `number` | — | Controlled page size |
| `pageSizeOptions` | `number[]` | `[10, 25, 50]` | Options for the rows-per-page selector |
| `onPageSizeChange` | `(size: number) => void` | — | Called when page size changes; component automatically resets to page 1 |
| `showJumpTo` | `boolean` | `false` | Render a "Go to page" number input |

---

### Breadcrumbs

Accessible trail-of-links navigation. Renders a `<nav aria-label>` > `<ol>` with `aria-current="page"` on the last item and `aria-hidden` separators. Supports an optional collapsible middle section when the trail is long.

**Component:** `<Breadcrumbs>`

#### What the library handles

| Feature | Details |
|---------|---------|
| **`<nav>` landmark** | Wraps all items; `aria-label` defaults to `"Breadcrumb"` |
| **`<ol>` list** | Order is semantic — `<ul>` would be wrong here |
| **`aria-current="page"`** | Automatically applied to the last item (link or span) |
| **Separators hidden** | Each separator `<li>` carries `aria-hidden="true"` — never read by screen readers |
| **`<a>` vs `<span>` for current** | If the last item has `href`, renders an `<a aria-current="page">`; otherwise a `<span aria-current="page">` |
| **Decorative icons** | Icon nodes inside items are wrapped in `<span aria-hidden="true">` |
| **Collapse / expand** | When `maxItems > 0` and trail exceeds that count, middle items are hidden behind a `<button aria-expanded="false" aria-label="Show full breadcrumb path">` |
| **Focus after expand** | On expand, focus is moved programmatically to the first newly-revealed link |
| **Dev warnings** | Error if `items` is empty; warning if only one item is provided |

#### Keyboard interactions

| Key | Target | Action |
|-----|--------|--------|
| `Tab` | Links / expand button | Move between interactive items |
| `Enter` | Link | Navigate to that crumb |
| `Enter` / `Space` | Expand (…) button | Show all items; focus moves to first revealed link |

#### Usage examples

```tsx
// Basic
<Breadcrumbs
  items={[
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Model X' },          // last item — no href → <span>
  ]}
/>

// Last item as link (aria-current on anchor)
<Breadcrumbs
  ariaLabel="Product breadcrumb"
  items={[
    { label: 'Home', href: '/' },
    { label: 'Model X', href: '/products/model-x' },
  ]}
/>

// Custom separator
<Breadcrumbs separator="›" items={items} />

// Collapsed middle (click … to expand)
<Breadcrumbs maxItems={3} items={longItems} />

// With icons
<Breadcrumbs
  items={[
    { label: 'Home', href: '/', icon: <HomeIcon /> },
    { label: 'Settings' },
  ]}
/>
```

#### API reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `BreadcrumbItem[]` | **required** | Ordered crumbs; last item is current page |
| `ariaLabel` | `string` | `"Breadcrumb"` | `aria-label` for the `<nav>` — must be unique per page when multiple instances appear |
| `separator` | `ReactNode` | `"/"` | Visual separator between items; automatically `aria-hidden` |
| `maxItems` | `number` | `0` | Collapse middle items when trail is longer; `0` = never collapse |
| `unstyled` | `boolean` | `false` | Strip all inline styles (layout, colors, focus ring) |

#### `BreadcrumbItem` shape

| Field | Type | Description |
|-------|------|-------------|
| `label` | `string` | Visible text |
| `href` | `string?` | Navigation target; omit for the current-page item |
| `icon` | `ReactNode?` | Decorative icon; rendered `aria-hidden` |

---

### Tooltip

A short descriptive overlay anchored to a trigger element. Uses `role="tooltip"` and `aria-describedby` so screen readers announce the tooltip text after the trigger's name and role. Meets WCAG 2.1 SC 1.4.13 (Content on Hover or Focus).

**Component:** `<Tooltip>`

#### What the library handles

| Feature | Details |
|---------|---------|
| **`role="tooltip"`** | Applied to the tooltip content element |
| **`aria-describedby`** | Injected automatically onto the trigger child; points to the tooltip ID |
| **Hover trigger** | `mouseenter` shows tooltip (after `delay`), `mouseleave` hides it |
| **Focus trigger** | `focus` shows tooltip immediately (no delay — WCAG 2.1 SC 1.4.13); `blur` hides it |
| **Escape to dismiss** | Closes the tooltip without moving focus (WCAG 2.1 SC 1.4.13) |
| **Viewport-aware positioning** | Auto-flips placement side if tooltip would overflow viewport |
| **Scroll/resize tracking** | Position recalculated while tooltip is open |
| **Always in DOM** | Tooltip element remains in the DOM (opacity 0) so `aria-describedby` reference is always valid |
| **Controlled + Uncontrolled** | `open` / `onOpenChange` for controlled; uncontrolled by default |
| **Existing `aria-describedby` preserved** | Merged with the tooltip ID — does not overwrite existing references |
| **Dev warnings** | Warns if `label` is empty or `children` is not a single React element |

#### Keyboard interactions

| Key | Action |
|-----|--------|
| `Tab` to trigger | Tooltip appears immediately |
| `Escape` | Tooltip closes; focus stays on trigger |
| `Tab` away | Tooltip closes |

#### Usage

```tsx
import { Tooltip } from '@compa11y/react';

// Basic
<Tooltip label="Save your changes">
  <button>Save</button>
</Tooltip>

// Custom placement
<Tooltip label="Format: YYYY-MM-DD" placement="bottom">
  <input type="text" placeholder="Date" />
</Tooltip>

// Controlled
<Tooltip label="Read only" open={isOpen} onOpenChange={setIsOpen}>
  <span tabIndex={0}>Hover me</span>
</Tooltip>

// Disabled
<Tooltip label="Cannot delete" disabled>
  <button>Delete</button>
</Tooltip>
```

#### API reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `ReactNode` | — | **Required.** Tooltip text or content |
| `children` | `ReactElement` | — | **Required.** Single trigger element |
| `placement` | `TooltipPlacement` | `'top'` | Preferred side; auto-flips on overflow |
| `delay` | `number` | `300` | Hover show delay in ms. Focus always immediate. |
| `hideDelay` | `number` | `0` | Hide delay in ms on mouse-leave |
| `offset` | `number` | `8` | Gap between trigger and tooltip in px |
| `disabled` | `boolean` | `false` | Suppresses tooltip entirely |
| `unstyled` | `boolean` | `false` | Remove default visual styles |
| `container` | `HTMLElement \| null` | `document.body` | Portal target |
| `open` | `boolean` | — | Controlled open state |
| `onOpenChange` | `(open: boolean) => void` | — | Called when open state changes |

#### Placement values

`top` | `top-start` | `top-end` | `bottom` | `bottom-start` | `bottom-end` | `left` | `left-start` | `left-end` | `right` | `right-start` | `right-end`

#### CSS Custom Properties

```css
--compa11y-tooltip-bg          /* Background color (default: #1a1a1a) */
--compa11y-tooltip-color       /* Text color (default: #fff) */
--compa11y-tooltip-radius      /* Border radius (default: 4px) */
--compa11y-tooltip-padding     /* Padding (default: 0.375rem 0.625rem) */
--compa11y-tooltip-font-size   /* Font size (default: 0.8125rem) */
--compa11y-tooltip-max-width   /* Max width (default: 280px) */
--compa11y-tooltip-shadow      /* Box shadow */
```

---

### Drawer

A panel that slides in from any edge of the viewport. Built on `role="dialog"` with a full focus trap, body scroll lock, and optional drag-to-dismiss.

**Component:** `<Drawer>` (compound) — `Drawer.Trigger`, `Drawer.Title`, `Drawer.Description`, `Drawer.Close`, `Drawer.Content`, `Drawer.Actions`, `Drawer.Handle`

#### What the library handles

| Feature | Details |
|---------|---------|
| **`role="dialog"` + `aria-modal="true"`** | Set on the drawer panel automatically |
| **`aria-labelledby`** | Wired to `Drawer.Title`'s id; falls back to the `aria-label` prop |
| **`aria-describedby`** | Wired to `Drawer.Description`'s id when `Drawer.Description` is rendered |
| **Focus trap** | All keyboard focus is contained within the open drawer (`useFocusTrap`) |
| **Focus return** | Focus returns to the element that was active when the drawer opened |
| **Body scroll lock** | `document.body` overflow is hidden while drawer is open; uses a stacking counter shared with Dialog so nested usage is safe |
| **Screen reader announcements** | "Drawer opened" / "Drawer closed" announced politely on open/close |
| **`Drawer.Trigger`** | Returns `null` when the drawer is open to avoid a duplicate trigger inside the portal |
| **`Drawer.Handle`** | Marked `aria-hidden="true"` — purely decorative pill bar |
| **`Drawer.Close`** | Falls back to `aria-label="Close drawer"` when no text children are provided |
| **Drag to dismiss** | When `draggable` is set, dragging the handle past 40 % of the panel dimension closes the drawer; releasing earlier snaps it back with a CSS transition |
| **Controlled + Uncontrolled** | `open` / `onOpenChange` for controlled; `defaultOpen` for uncontrolled |
| **Dev warnings** | Warns if neither `Drawer.Title` nor `aria-label` is provided while the drawer is open |

#### Keyboard interactions

| Key | Action |
|-----|--------|
| `Tab` / `Shift+Tab` | Cycle focus through interactive elements inside the drawer (wraps) |
| `Escape` | Closes the drawer and returns focus to the trigger |

#### Usage

```tsx
import { Drawer } from '@compa11y/react';

// Uncontrolled with compound sub-components
<Drawer>
  <Drawer.Trigger>Open Settings</Drawer.Trigger>
  <Drawer.Title>Settings</Drawer.Title>
  <Drawer.Description>Adjust your preferences below.</Drawer.Description>
  <Drawer.Content>…content…</Drawer.Content>
  <Drawer.Actions>
    <Drawer.Close>Done</Drawer.Close>
  </Drawer.Actions>
</Drawer>

// Controlled, slides in from the bottom (bottom sheet)
<Drawer open={isOpen} onOpenChange={setIsOpen} side="bottom" draggable>
  <Drawer.Handle />
  <Drawer.Title>Share</Drawer.Title>
  <Drawer.Content>…</Drawer.Content>
</Drawer>
```

#### API reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | — | Controlled open state |
| `defaultOpen` | `boolean` | `false` | Uncontrolled starting state |
| `onOpenChange` | `(open: boolean) => void` | — | Called when open state should change |
| `side` | `'left' \| 'right' \| 'top' \| 'bottom'` | `'right'` | Edge the drawer slides in from |
| `draggable` | `boolean` | `false` | Enable drag-to-dismiss via the handle |
| `closeOnOutsideClick` | `boolean` | `true` | Close when clicking the backdrop |
| `closeOnEscape` | `boolean` | `true` | Close on `Escape` key |
| `initialFocus` | `RefObject<HTMLElement>` | — | Element to focus when drawer opens |
| `container` | `HTMLElement` | `document.body` | Portal mount target |
| `aria-label` | `string` | — | Accessible label (use if no `Drawer.Title`) |
| `aria-labelledby` | `string` | — | ID of external label element |
| `unstyled` | `boolean` | `false` | Remove default visual styles |

#### CSS Custom Properties

```css
--compa11y-drawer-width          /* Panel width for left/right drawers (default: 400px) */
--compa11y-drawer-height         /* Panel height for top/bottom drawers (default: 400px) */
```

---

### Slider

A single-thumb or range (two-thumb) slider with full keyboard support, pointer drag, and live region announcements.

**Component:** `<Slider>`

#### What the library handles

| Feature | Details |
|---------|---------|
| **`role="slider"`** | Applied to each thumb element |
| **`aria-valuemin` / `aria-valuemax` / `aria-valuenow`** | Kept in sync with the current value on every change |
| **`aria-valuetext`** | Set via the `valueText` callback when provided (e.g. `"50%"`, `"Low"`) |
| **`aria-orientation`** | Set to `"horizontal"` or `"vertical"` to match the `orientation` prop |
| **`aria-disabled`** | Applied to thumbs when `disabled` is true |
| **`aria-label`** | Each thumb receives its own label. In range mode, falls back to `"{label} minimum"` / `"{label} maximum"` if `minThumbLabel` / `maxThumbLabel` are not provided |
| **`aria-labelledby`** | Forwarded to the thumb when only `ariaLabelledBy` is supplied |
| **Live region** | A `role="status" aria-live="polite"` region announces the new value after every change; always mounted before any interaction |
| **Focus ring** | Managed in JavaScript state rather than CSS `:focus-visible` (inline styles would otherwise override it) |
| **Keyboard navigation** | See keyboard table below |
| **Pointer drag** | `setPointerCapture` ensures drag works even when the cursor leaves the thumb; works with mouse and touch |
| **Track click** | Clicking anywhere on the track moves the thumb (range mode: moves the nearest thumb) |
| **Controlled + Uncontrolled** | `value` / `onValueChange` for controlled single-thumb; `values` / `onValuesChange` for controlled range |
| **Dev warnings** | Errors if no accessible label is provided; warns if range mode is missing `minThumbLabel` / `maxThumbLabel`; errors if `min >= max` |

#### Keyboard interactions

| Key | Action |
|-----|--------|
| `→` / `↑` | Increase value by one `step` |
| `←` / `↓` | Decrease value by one `step` |
| `Home` | Set to minimum value |
| `End` | Set to maximum value |
| `Page Up` | Increase by `largeStep` (default: 10 × step or 10 % of range) |
| `Page Down` | Decrease by `largeStep` |

#### Usage

```tsx
import { Slider } from '@compa11y/react';

// Single thumb — uncontrolled
<Slider label="Volume" defaultValue={50} />

// Controlled with custom value text
<Slider
  label="Brightness"
  value={brightness}
  onValueChange={setBrightness}
  valueText={(v) => `${v}%`}
/>

// Range slider
<Slider
  label="Price"
  range
  defaultValues={[20, 80]}
  min={0}
  max={200}
  minThumbLabel="Minimum price"
  maxThumbLabel="Maximum price"
  valueText={(v) => `$${v}`}
  onValuesChange={([lo, hi]) => setRange([lo, hi])}
/>

// Vertical
<Slider label="Level" orientation="vertical" />

// Disabled
<Slider label="Read-only setting" value={40} disabled />
```

#### API reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Visible label and base for thumb `aria-label` |
| `ariaLabel` | `string` | — | `aria-label` on the thumb (invisible label) |
| `ariaLabelledBy` | `string` | — | `aria-labelledby` on the thumb |
| `value` | `number` | — | Controlled value (single-thumb) |
| `defaultValue` | `number` | `0` | Uncontrolled starting value |
| `onValueChange` | `(value: number) => void` | — | Called on value change (single-thumb) |
| `range` | `boolean` | `false` | Enable two-thumb range mode |
| `values` | `[number, number]` | — | Controlled values (range mode) |
| `defaultValues` | `[number, number]` | `[min, max]` | Uncontrolled starting values (range mode) |
| `onValuesChange` | `(values: [number, number]) => void` | — | Called on value change (range mode) |
| `minThumbLabel` | `string` | `"{label} minimum"` | Accessible label for the lower thumb |
| `maxThumbLabel` | `string` | `"{label} maximum"` | Accessible label for the upper thumb |
| `min` | `number` | `0` | Minimum value |
| `max` | `number` | `100` | Maximum value |
| `step` | `number` | `1` | Arrow-key step size |
| `largeStep` | `number` | `max(10×step, (max-min)/10)` | Page Up / Page Down step |
| `disabled` | `boolean` | `false` | Disable all interaction |
| `valueText` | `(value: number) => string` | — | Maps value to `aria-valuetext` string |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Track orientation |
| `unstyled` | `boolean` | `false` | Remove default visual styles |

#### CSS Custom Properties

```css
--compa11y-slider-track-bg              /* Track background (default: #e2e8f0) */
--compa11y-slider-track-size            /* Track thickness (default: 4px) */
--compa11y-slider-track-length          /* Track length in vertical mode (default: 160px) */
--compa11y-slider-fill-bg               /* Filled range color (default: #0066cc) */
--compa11y-slider-fill-bg-disabled      /* Filled range color when disabled (default: #94a3b8) */
--compa11y-slider-thumb-size            /* Thumb diameter (default: 20px) */
--compa11y-slider-thumb-bg              /* Thumb background (default: white) */
--compa11y-slider-thumb-bg-disabled     /* Thumb background when disabled (default: #cbd5e1) */
--compa11y-slider-thumb-border          /* Thumb border color (default: #0066cc) */
--compa11y-slider-thumb-border-disabled /* Thumb border when disabled (default: #94a3b8) */
--compa11y-focus-color                  /* Focus ring color (default: #0066cc) */
```

---

### ProgressBar

A status indicator that communicates how much of a task is complete. The user never interacts with it — the system drives the value. This is fundamentally different from a Slider.

**Component:** `<ProgressBar>`

#### Determinate vs indeterminate

| Mode | When to use | ARIA |
|---|---|---|
| **Determinate** | You know actual progress (65 % uploaded, step 2 of 5) | `aria-valuenow`, `aria-valuemin`, `aria-valuemax` all set |
| **Indeterminate** | Task is running but progress is unknown | `aria-valuenow` intentionally omitted — no fake precision |

#### What the library handles

| Feature | Details |
|---|---|
| **`role="progressbar"`** | Applied to the track element |
| **`aria-labelledby`** | Points to the visible label element (always visible — no blind labelling) |
| **`aria-valuemin` / `aria-valuemax` / `aria-valuenow`** | Set when `value` prop is provided (determinate); omitted when indeterminate |
| **`aria-valuetext`** | Set via the `valueText` callback when provided (e.g. `"Step 2 of 5"`) |
| **Milestone announcements** | Politely announced when `value` crosses any threshold in `milestones` (e.g. `[25, 50, 75, 100]`). Only the first crossed threshold per change is announced to avoid noise. |
| **Status announcements** | Transitioning to `status="complete"` → polite `"Label complete"`. Transitioning to `status="error"` → assertive `"Label failed"`. |
| **Indeterminate animation** | CSS keyframe animation injected once into `<head>`; replaced by a gentle opacity pulse when `prefers-reduced-motion` is active |
| **`forced-colors`** | Track and fill use semantic `ButtonFace` / `Highlight` system colors |
| **Dev warnings** | Errors when `label` is missing; errors when `min >= max`; warns when value is out of range |

#### What you must provide

```tsx
// label is required — it is both visible and the accessible name
<ProgressBar label="Uploading invoice PDF" value={65} />
```

#### Usage

```tsx
import { ProgressBar } from '@compa11y/react';

// Determinate — announce at milestones
<ProgressBar
  label="Uploading invoice PDF"
  value={65}
  milestones={[25, 50, 75, 100]}
  statusText="Uploading 3 of 10 files…"
/>

// Indeterminate — progress unknown, do not fake a value
<ProgressBar label="Loading reports" statusText="Fetching data from server…" />

// Custom valueText
<ProgressBar
  label="Onboarding"
  value={2}
  min={0}
  max={5}
  valueText={(v, _min, max) => `Step ${v} of ${max}`}
/>

// Complete
<ProgressBar
  label="Video export"
  value={100}
  status="complete"
  statusText="Export ready — check your downloads"
/>

// Error
<ProgressBar
  label="Database backup"
  value={37}
  status="error"
  statusText="Connection lost. Retry?"
/>
```

#### API reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | **Required.** Visible label and accessible name |
| `value` | `number` | `undefined` | Current value; omit for indeterminate mode |
| `min` | `number` | `0` | Minimum value |
| `max` | `number` | `100` | Maximum value |
| `valueText` | `(v, min, max) => string` | — | Maps value to `aria-valuetext` string |
| `showValue` | `boolean` | `true` when determinate | Show percentage / valueText beside the label |
| `status` | `'active' \| 'complete' \| 'error'` | `'active'` | Status of the operation |
| `statusText` | `string` | — | Visible message below the track |
| `milestones` | `number[]` | — | Announce when value crosses these thresholds |
| `announceLabel` | `string` | `label` | Override label used in SR announcements |
| `unstyled` | `boolean` | `false` | Remove default visual styles |

#### CSS Custom Properties

```css
--compa11y-progress-bar-track-bg          /* Track background (default: #e2e8f0) */
--compa11y-progress-bar-track-size        /* Track height (default: 8px) */
--compa11y-progress-bar-fill-bg           /* Determinate fill (default: #0066cc) */
--compa11y-progress-bar-fill-bg-complete  /* Complete fill (default: #22c55e) */
--compa11y-progress-bar-fill-bg-error     /* Error fill (default: #ef4444) */
--compa11y-progress-bar-label-color       /* Label text color (default: inherit) */
--compa11y-progress-bar-value-color       /* Value text color (default: #555) */
--compa11y-progress-bar-status-color      /* Status text color (default: #555) */
--compa11y-progress-bar-error-color       /* Error status text (default: #ef4444) */
```

---

### Skeleton

A purely decorative loading placeholder that mimics the shape of content before it loads. Individual skeleton blocks carry no meaningful semantics — the surrounding region communicates loading state.

**Component:** `<Skeleton>`

#### A11y design principle

| Layer | Responsibility |
|---|---|
| **`<Skeleton>` itself** | `aria-hidden="true"` — invisible to assistive technology |
| **Surrounding container** | `aria-busy="true"` + accessible label → tells screen readers what is loading |

#### What the library handles

| Feature | Details |
|---|---|
| **`aria-hidden="true"`** | Applied to every skeleton block — screen readers skip them entirely |
| **Not focusable** | No `tabIndex`, no interactive content |
| **Shimmer animation** | CSS keyframe automatically replaced by a gentle opacity fade when `prefers-reduced-motion: reduce` is active |
| **High Contrast mode** | Shimmer hidden; border applied via `forced-colors` media query |
| **Variants** | `text` (pill, 1em tall) · `circular` (50% radius) · `rectangular` (default) |

#### What you must provide

```tsx
// The container must communicate loading state — the skeleton does not
<section aria-label="Loading profile" aria-busy={isLoading}>
  <div aria-hidden="true">
    <Skeleton variant="circular" width={56} height={56} />
    <Skeleton variant="text" width="60%" />
  </div>
</section>
```

#### Usage

```tsx
import { Skeleton } from '@compa11y/react';

// Basic shapes
<Skeleton variant="text" width="80%" />
<Skeleton variant="circular" width={48} height={48} />
<Skeleton variant="rectangular" height={200} />

// Disable animation (e.g. when user preference is set programmatically)
<Skeleton animated={false} />

// Composed card skeleton — container owns the a11y
<section aria-label="Loading article" aria-busy="true">
  <div aria-hidden="true">
    <Skeleton variant="rectangular" height={180} style={{ borderRadius: 0 }} />
    <Skeleton variant="text" width="55%" />
    <Skeleton variant="text" />
  </div>
</section>
```

#### API reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `'text' \| 'circular' \| 'rectangular'` | `'rectangular'` | Shape of the placeholder |
| `width` | `string \| number` | `100%` (circular: `40px`) | Width; number = px |
| `height` | `string \| number` | `20px` (text: `1em`, circular: `40px`) | Height; number = px |
| `animated` | `boolean` | `true` | Enable shimmer animation |
| `unstyled` | `boolean` | `false` | Remove all default visual styles |

#### CSS Custom Properties

```css
--compa11y-skeleton-bg             /* Skeleton fill (default: #e2e8f0) */
--compa11y-skeleton-shimmer-color  /* Shimmer highlight (default: rgba(255,255,255,0.6)) */
--compa11y-skeleton-radius         /* Border radius (default: 6px / 4px for text) */
```

---

### EmptyState

Renders a clear, structured message when a list, table, search result, or section has no content. Answers: **what** is empty, **why**, and **what** the user can do next.

**Component:** `<EmptyState>`

#### A11y design principle

Two distinct modes require different treatment:

| Mode | When | What the library does |
|---|---|---|
| **Static** | Brand-new account, no data ever existed | Regular page content — no live region needed |
| **Dynamic** | Search/filter returned zero results; item was deleted | `role="status" aria-live="polite"` so screen readers announce the change |

Use the `live` prop to switch between them.

#### What the library handles

| Feature | Details |
|---|---|
| **Heading** | `title` renders as a real `<h1>`–`<h6>` element (default `<h2>`) — semantic, not a styled `<div>` |
| **Icon is decorative** | `icon` slot is always wrapped in `aria-hidden="true"` — meaning must come from `title`/`description` text |
| **Live region** | When `live={true}`: `role="status" aria-live="polite" aria-atomic="true"` on the container |
| **No motion** | `prefers-reduced-motion` rule strips any future transition/animation |
| **High Contrast** | Title, description, and icon color use system `CanvasText` token |
| **Dev warning** | `title` absence warned in development |

#### What you must provide

- A clear `title` that names the empty state ("No projects yet", not "Nothing here")
- A `description` that explains why and optionally hints at next steps
- An `action` that helps the user recover (when applicable)

#### Usage

```tsx
import { EmptyState } from '@compa11y/react';

// Static — brand-new account (no live region)
<EmptyState
  title="No projects yet"
  description="Create your first project to get started."
  icon={<FolderIcon aria-hidden="true" />}
  action={<Button>Create project</Button>}
  secondaryAction={<Button variant="ghost">Browse templates</Button>}
/>

// Dynamic — search returned zero results (announces to screen readers)
<EmptyState
  live
  title="No results"
  description='No items match "wireless mouse". Try clearing filters.'
  action={<Button onClick={clearFilters}>Clear filters</Button>}
/>

// Minimal — no icon, no actions
<EmptyState
  title="No notifications"
  description="You're all caught up."
/>
```

#### API reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `string` | — | **Required.** Heading text naming the empty state |
| `description` | `string` | — | Supporting paragraph explaining why and what to do |
| `icon` | `ReactNode` | — | Decorative illustration/icon — always `aria-hidden` |
| `action` | `ReactNode` | — | Primary action (Button, Link, etc.) |
| `secondaryAction` | `ReactNode` | — | Secondary action |
| `headingLevel` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `2` | Heading level for the title — pick one that fits the document outline |
| `live` | `boolean` | `false` | Adds `role="status" aria-live="polite"` for dynamic states |
| `unstyled` | `boolean` | `false` | Remove all default inline styles |

#### CSS Custom Properties

```css
--compa11y-empty-state-gap                   /* Gap between sections (default: 0.75rem) */
--compa11y-empty-state-padding               /* Container padding (default: 3rem 1.5rem) */
--compa11y-empty-state-icon-color            /* Icon color (default: #9ca3af) */
--compa11y-empty-state-icon-size             /* Icon font-size (default: 3rem) */
--compa11y-empty-state-title-size            /* Title font-size (default: 1.125rem) */
--compa11y-empty-state-title-weight          /* Title font-weight (default: 600) */
--compa11y-empty-state-title-color           /* Title color (default: inherit) */
--compa11y-empty-state-description-size      /* Description font-size (default: 0.9375rem) */
--compa11y-empty-state-description-color     /* Description color (default: #6b7280) */
--compa11y-empty-state-description-max-width /* Max-width of description (default: 36ch) */
--compa11y-empty-state-actions-gap           /* Gap between action buttons (default: 0.5rem) */
--compa11y-empty-state-actions-margin        /* Top margin above actions (default: 0.25rem) */
```

#### Web Component

```html
<!-- Static -->
<compa11y-empty-state
  title="No projects yet"
  description="Create your first project to get started."
>
  <svg slot="icon" aria-hidden="true">…</svg>
  <div slot="actions">
    <button>Create project</button>
  </div>
</compa11y-empty-state>

<!-- Dynamic (search/filter) -->
<compa11y-empty-state
  live
  title="No results"
  description="No items match your search. Try clearing filters."
>
  <div slot="actions">
    <button onclick="clearFilters()">Clear filters</button>
  </div>
</compa11y-empty-state>
```

**Web Component attributes:** `title`, `description`, `heading-level` (default `2`), `live` (boolean)

---

### NumberField

An accessible numeric input with optional stepper buttons, on-blur formatting, and built-in min/max validation. Implements `role="spinbutton"` semantics — the correct ARIA pattern for a field whose value can be incremented and decremented.

**Component:** `<NumberField>`

#### Why not `<input type="number">`?

`type="number"` is semantically correct but has significant practical problems: it rejects mid-type input (e.g. typing `"-"` before the digits), behaves inconsistently across locales (`,` vs `.` as decimal separator), and renders browser-native spinners that vary widely between browsers and break in some screen reader / browser combinations.

`NumberField` uses `<input type="text" inputMode="numeric|decimal">` with explicit `role="spinbutton"` + `aria-valuenow/min/max` for the same semantics with full input control.

#### What the library handles

| Feature | Details |
|---|---|
| **`role="spinbutton"`** | Set on the `<input>` — correct ARIA pattern for a numeric field with increment/decrement |
| **`aria-valuenow`** | Kept in sync with the committed numeric value |
| **`aria-valuemin` / `aria-valuemax`** | Set from `min` / `max` props |
| **`aria-valuetext`** | Set from `formatOptions` when provided — gives screen readers the human-readable formatted string |
| **`aria-invalid`** | Set on validation error (internal or external) |
| **`aria-describedby`** | Links hint and error message to the input |
| **`aria-required`** | Set when `required={true}` |
| **`aria-disabled`** | Set when `disabled={true}` |
| **Keyboard — Arrow Up/Down** | Increment/decrement by `step` |
| **Keyboard — Page Up/Down** | Increment/decrement by `largeStep` (default: `step × 10`) |
| **Keyboard — Home / End** | Jump to `min` / `max` (requires props to be set) |
| **Keyboard — Enter** | Commit current typed value without blurring |
| **Commit on blur** | Parses, validates, snaps to step, and commits when focus leaves |
| **Formatting on blur** | Shows `Intl.NumberFormat` formatted value when blurred (raw number shown while focused for easy editing) |
| **Validation errors** | Built-in min/max error message; announced **assertively** via live region |
| **`inputMode`** | Auto-selected: `"numeric"` for integer steps, `"decimal"` for fractional — triggers the right mobile keyboard |
| **Stepper buttons** | When `showSteppers={true}`: −/+ buttons with `aria-label="Decrease"/"Increase"`, min 44×44 px touch targets |
| **Stepper disabled state** | Decrement button disabled when `value ≤ min`; increment when `value ≥ max` |
| **Live region** | Pre-mounted `role="status"` region — always in DOM before any message |
| **High Contrast** | Borders use `ButtonText`/`FieldText` system tokens |
| **Reduced motion** | All transitions removed |
| **Dev warnings** | Missing label, `min ≥ max` |

#### What you must provide

- A `label` (or `aria-label` / `aria-labelledby`) that names **what** the number represents ("Quantity", "Budget", "Rating")
- A `hint` explaining constraints when they aren't obvious ("Enter a value from 0 to 100")
- Use `error` to communicate validation failures from your form logic; the component handles wiring

#### Usage

```tsx
import { NumberField } from '@compa11y/react';

// Basic with steppers
<NumberField
  label="Quantity"
  min={1}
  max={99}
  step={1}
  showSteppers
  hint="Maximum 99 units per order."
/>

// Controlled
<NumberField
  label="Guests"
  value={guests}
  onValueChange={setGuests}
  min={1}
  max={12}
  step={1}
  showSteppers
/>

// Currency formatting (raw on focus, formatted on blur)
<NumberField
  label="Budget"
  min={0}
  step={0.01}
  formatOptions={{ style: 'currency', currency: 'USD' }}
  hint="Enter an amount in US dollars."
/>

// With external error from form validation
<NumberField
  label="Score"
  min={1}
  max={10}
  required
  error={formErrors.score}
/>
```

#### API reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `ReactNode` | — | Visible label text |
| `hint` | `ReactNode` | — | Description text linked via `aria-describedby` |
| `error` | `ReactNode` | — | External error message; takes priority over built-in validation |
| `value` | `number` | — | Controlled value (`undefined` = empty field) |
| `defaultValue` | `number` | — | Uncontrolled starting value |
| `onValueChange` | `(value: number \| undefined) => void` | — | Called on commit (blur or Enter) |
| `min` | `number` | — | Minimum allowed value |
| `max` | `number` | — | Maximum allowed value |
| `step` | `number` | `1` | Arrow-key / stepper increment |
| `largeStep` | `number` | `step × 10` | Page Up / Down increment |
| `showSteppers` | `boolean` | `false` | Show −/+ buttons alongside the input |
| `formatOptions` | `Intl.NumberFormatOptions` | — | Format applied when blurred (e.g. `{ style: 'currency', currency: 'USD' }`) |
| `locale` | `string` | user locale | BCP 47 locale for `Intl.NumberFormat` |
| `placeholder` | `string` | — | Input placeholder |
| `required` | `boolean` | `false` | Marks field as required |
| `disabled` | `boolean` | `false` | Disables all interaction |
| `readOnly` | `boolean` | `false` | Makes the field read-only |
| `aria-label` | `string` | — | Accessible name when no visible label |
| `aria-labelledby` | `string` | — | ID of an external labelling element |
| `name` | `string` | — | Name for form submission |
| `unstyled` | `boolean` | `false` | Remove all default inline styles |
| `className` | `string` | — | CSS class on the root wrapper |
| `style` | `CSSProperties` | — | Inline styles on the root wrapper |

#### CSS Custom Properties

```css
--compa11y-number-field-input-bg               /* Input background (default: white) */
--compa11y-number-field-input-border           /* Input border (default: 1px solid #ccc) */
--compa11y-number-field-input-border-focus     /* Border color on focus (default: #0066cc) */
--compa11y-number-field-input-border-error     /* Border color on error (default: #ef4444) */
--compa11y-number-field-input-radius           /* Border radius (default: 4px) */
--compa11y-number-field-input-padding          /* Input padding (default: 0.5rem 0.75rem) */
--compa11y-number-field-input-font-size        /* Font size (default: 0.875rem) */
--compa11y-number-field-label-color            /* Label color (default: inherit) */
--compa11y-number-field-label-size             /* Label font size (default: 0.875rem) */
--compa11y-number-field-label-weight           /* Label font weight (default: 500) */
--compa11y-number-field-hint-color             /* Hint text color (default: #666) */
--compa11y-number-field-error-color            /* Error text color (default: #ef4444) */
--compa11y-number-field-stepper-bg             /* Stepper button background (default: #f0f0f0) */
--compa11y-number-field-stepper-color          /* Stepper button color (default: inherit) */
--compa11y-number-field-stepper-border         /* Stepper button border (default: 1px solid #ccc) */
--compa11y-focus-color                         /* Focus ring color (shared, default: #0066cc) */
```

#### Web Component

```html
<!-- Basic with steppers -->
<compa11y-number-field
  label="Quantity"
  value="1"
  min="1"
  max="99"
  step="1"
  show-steppers
  hint="Maximum 99 units per order."
></compa11y-number-field>

<!-- Fractional step -->
<compa11y-number-field
  label="Rating"
  value="7.5"
  min="0"
  max="10"
  step="0.5"
  large-step="2"
></compa11y-number-field>

<!-- With external error -->
<compa11y-number-field
  label="Score"
  min="1"
  max="10"
  required
  error="Score must be between 1 and 10."
></compa11y-number-field>
```

```js
// Events
el.addEventListener('compa11y-number-field-change', (e) => {
  console.log(e.detail.value); // number | undefined
});

el.addEventListener('compa11y-number-field-input', (e) => {
  console.log(e.detail.rawValue); // string — fires on each keystroke
});
```

**Web Component attributes:** `label`, `hint`, `error`, `value`, `min`, `max`, `step`, `large-step`, `show-steppers` (boolean), `disabled` (boolean), `readonly` (boolean), `required` (boolean), `placeholder`, `name`, `aria-label`, `aria-labelledby`

#### Keyboard reference

| Key | Action |
|---|---|
| `↑` Arrow Up | Increment by `step` |
| `↓` Arrow Down | Decrement by `step` |
| `Page Up` | Increment by `largeStep` |
| `Page Down` | Decrement by `largeStep` |
| `Home` | Jump to `min` (if set) |
| `End` | Jump to `max` (if set) |
| `Enter` | Commit current typed value |
| `Tab` / `Shift+Tab` | Leave field — triggers commit + validation |

#### When to use NumberField vs other components

| Need | Use |
|---|---|
| Quantity, age, price, count — a true numeric quantity | **NumberField** |
| Approximate value on a continuous scale | **Slider** |
| System-reported progress (upload, loading) | **ProgressBar** |
| Phone number, ZIP code, credit card, OTP | **Input** with `inputMode="numeric"` |

---

### Carousel

A scrollable region of slides with controls, pagination, and optional autoplay.

#### Semantic structure
- Container: `<section aria-label="…" aria-roledescription="carousel">`
- Slides: `<ul role="list">` with `<li aria-roledescription="slide" aria-label="Slide X of Y">`
- Controls: real `<button>` elements with `aria-label`
- Pagination: `<div role="group" aria-label="Choose slide">` with dot buttons using `aria-current="true"`
- Status: visible "Slide X of Y" text linked via `aria-describedby`

#### Auto-set ARIA
| Attribute | Where | Value |
|---|---|---|
| `aria-roledescription` | root `<section>` | `"carousel"` |
| `aria-roledescription` | each slide | `"slide"` |
| `aria-label` | each slide | `"Slide X of Y"` |
| `aria-label` | prev/next buttons | `"Previous slide"` / `"Next slide"` |
| `aria-label` | each dot | `"Go to slide X of Y"` |
| `aria-current` | active dot | `"true"` |
| `aria-pressed` | pause button | toggles with play/pause |
| `aria-hidden` | non-visible slides (multi-slide mode) | `"true"` |
| `disabled` | prev/next at boundaries (non-loop) | native `disabled` |

#### Keyboard
| Key | Context | Action |
|---|---|---|
| `Enter` / `Space` | Prev button | Go to previous slide |
| `Enter` / `Space` | Next button | Go to next slide |
| `Enter` / `Space` | Dot button | Go to that slide |
| `Enter` / `Space` | Pause button | Toggle autoplay |
| `ArrowLeft` / `ArrowUp` | Viewport (if focused) | Previous slide |
| `ArrowRight` / `ArrowDown` | Viewport (if focused) | Next slide |
| `Home` | Viewport | First slide |
| `End` | Viewport | Last slide |

#### Screen reader announcements
- On slide change: `"Slide X of Y"` (polite) or `"Showing slides X to Y of Z"` (multi-slide)
- On autoplay toggle: `"Autoplay paused"` / `"Autoplay started"` (polite)

#### Autoplay rules
- Off by default
- Disabled when `prefers-reduced-motion: reduce` is detected
- Auto-pauses on focus entering carousel
- Auto-pauses on mouse hover
- Pause/Play button required for WCAG compliance (dev warning if missing)

#### Dev warnings
- Missing accessible name (`ariaLabel` or `aria-labelledby`)
- Autoplay enabled without a Pause control
- Hide-non-active mode with slides not properly hidden

#### Props (React)
```tsx
<Carousel
  ariaLabel="Featured products"
  value={index}               // controlled
  defaultValue={0}            // uncontrolled
  onValueChange={setIndex}
  loop                        // wrap navigation
  slidesPerView={1}           // 1 = single, >1 = multi
  hideNonActiveSlides          // remove hidden slides from a11y tree
  autoplay={false}            // default off
  autoplayInterval={5000}
  orientation="horizontal"
>
  <Carousel.Status />
  <Carousel.Controls>
    <Carousel.Prev />
    <Carousel.Next />
    <Carousel.Pause />
  </Carousel.Controls>
  <Carousel.Content>
    <Carousel.Item>…</Carousel.Item>
  </Carousel.Content>
  <Carousel.Pagination />
</Carousel>
```

---

### RichTextEditor

**Component:** `<RichTextEditor>` / `<compa11y-rich-text-editor>`
**Type:** Type 3 (Compound) — Engine-agnostic rich text editing shell
**Pattern:** Toolbar + contenteditable region + auxiliary dialogs, wrapping an editor engine via `RTEAdapter`

#### Architecture

compa11y owns the accessible UI shell (labeling, toolbar semantics, dialog semantics, keyboard contracts, dev warnings). The editor engine (Lexical, ProseMirror/Tiptap, Slate) is provided via an adapter that implements the `RTEAdapter` interface from `@compa11y/core`.

#### What the library handles

| Concern | Implementation |
|---|---|
| Editor labeling | `aria-labelledby` to visible label, `aria-describedby` for description + error |
| Toolbar semantics | `role="toolbar"`, `aria-label="Formatting"`, `aria-controls` → editor region |
| Toggle buttons | `aria-pressed` for bold/italic/underline/etc. — reflects current selection state |
| Link dialog | `role="dialog"`, `aria-modal="true"`, focus trap, Escape closes, returns focus to editor |
| Image dialog | Same as link dialog; **requires alt text** (strict mode errors if missing) |
| Validation | `aria-invalid`, `aria-required`, error message via `aria-describedby` |
| Focus management | Tab exits editor (no trap), focus returns to editor after toolbar/dialog actions |
| Screen reader announcements | Link applied/removed, image inserted, dialog open/close |
| Feature gating | Feature flags control which toolbar controls render; unsupported features hidden |
| Dev warnings | Missing label, HTML without sanitizer, image without alt path, unsupported adapter features |

#### Keyboard contract

| Key | Context | Action |
|---|---|---|
| `Ctrl/Cmd+B` | Editor | Toggle bold |
| `Ctrl/Cmd+I` | Editor | Toggle italic |
| `Ctrl/Cmd+U` | Editor | Toggle underline |
| `Ctrl/Cmd+K` | Editor | Open link dialog |
| `Ctrl/Cmd+Z` | Editor | Undo |
| `Ctrl/Cmd+Shift+Z` / `Ctrl/Cmd+Y` | Editor | Redo |
| `Tab` | Editor | Move focus **out** of editor (no trap) |
| `Shift+Tab` | Editor | Move focus backwards out of editor |
| `Enter` / `Space` | Toolbar button | Activate formatting command |
| `Escape` | Link/Image dialog | Close dialog, return focus to editor |
| `Enter` | Link/Image dialog | Submit dialog |

#### React compound API

```tsx
<RichTextEditor
  adapter={createLexicalAdapter()}
  label="Message"
  description="Describe your issue."
  errorMessage={error}
  value={value}
  onChange={setValue}
  format="html"
  required
  features={{ bold: true, italic: true, link: true, lists: true, headings: true }}
  sanitizeHtml={sanitize}
  strict
>
  <RichTextEditor.Toolbar>
    <RichTextEditor.Bold />
    <RichTextEditor.Italic />
    <RichTextEditor.Underline />
    <RichTextEditor.Separator />
    <RichTextEditor.HeadingSelect />
    <RichTextEditor.BulletedList />
    <RichTextEditor.NumberedList />
    <RichTextEditor.Separator />
    <RichTextEditor.Link />
    <RichTextEditor.Code />
    <RichTextEditor.Blockquote />
    <RichTextEditor.Separator />
    <RichTextEditor.Undo />
    <RichTextEditor.Redo />
  </RichTextEditor.Toolbar>

  <RichTextEditor.Content placeholder="Write your message…" />

  <RichTextEditor.Footer>
    <RichTextEditor.CharacterCount max={500} />
    <RichTextEditor.HelpText>Markdown shortcuts supported</RichTextEditor.HelpText>
  </RichTextEditor.Footer>

  <RichTextEditor.LinkDialog />
  <RichTextEditor.ImageDialog />
</RichTextEditor>
```

#### Props (React)

| Prop | Type | Default | Description |
|---|---|---|---|
| `adapter` | `RTEAdapter` | — | Editor engine adapter (required) |
| `value` | `string \| object` | — | Controlled value |
| `defaultValue` | `string \| object` | — | Uncontrolled initial value |
| `onChange` | `(value) => void` | — | Called on content change |
| `format` | `'html' \| 'json' \| 'markdown'` | `'html'` | Serialization format |
| `label` | `string` | — | Visible label text |
| `aria-label` | `string` | — | Accessible label (if no visible label) |
| `description` | `string` | — | Description text |
| `errorMessage` | `string` | — | Error message (makes field invalid) |
| `required` | `boolean` | `false` | Required field |
| `disabled` | `boolean` | `false` | Disables all interaction |
| `readOnly` | `boolean` | `false` | Content selectable but not editable |
| `features` | `RTEFeatures` | all common on | Feature flags for toolbar controls |
| `sanitizeHtml` | `(html) => string` | — | HTML sanitizer (required for HTML format) |
| `strict` | `boolean` | `false` | Upgrade dev warnings to errors |
| `unstyled` | `boolean` | `false` | Remove default styles |

#### Sub-components

| Component | Description |
|---|---|
| `RichTextEditor.Toolbar` | `role="toolbar"` container for formatting controls |
| `RichTextEditor.Content` | Editor mounting point (adapter mounts here) |
| `RichTextEditor.Bold` / `.Italic` / `.Underline` / `.Strike` / `.Code` | Inline mark toggle buttons with `aria-pressed` |
| `RichTextEditor.HeadingSelect` | `<select>` for paragraph/heading levels |
| `RichTextEditor.BulletedList` / `.NumberedList` | List toggle buttons |
| `RichTextEditor.Indent` / `.Outdent` | Indentation controls |
| `RichTextEditor.Blockquote` / `.CodeBlock` | Block-level toggles |
| `RichTextEditor.Link` | Opens link dialog (`aria-pressed` when in link) |
| `RichTextEditor.Undo` / `.Redo` | History controls (disabled when unavailable) |
| `RichTextEditor.Separator` | Visual `role="separator"` divider |
| `RichTextEditor.LinkDialog` | Accessible modal for inserting/editing/removing links |
| `RichTextEditor.ImageDialog` | Accessible modal for inserting images (requires alt text) |
| `RichTextEditor.Footer` | Container for footer content |
| `RichTextEditor.CharacterCount` | Live-region character counter with optional `max` |
| `RichTextEditor.HelpText` | Arbitrary help text in footer |

#### Dev warnings

| Condition | Severity | Strict mode |
|---|---|---|
| Missing `label` and `aria-label` | Warning | Error |
| `format="html"` without `sanitizeHtml` | Warning | Error |
| `features.image` enabled but adapter lacks `insertImage` | Warning | Error |
| `features.link` enabled but adapter reports unsupported | Warning | Warning |

#### Data attributes (for styling)

| Attribute | Element |
|---|---|
| `data-compa11y-rte` | Root wrapper |
| `data-compa11y-rte-label` | Label element |
| `data-compa11y-rte-description` | Description text |
| `data-compa11y-rte-error` | Error message |
| `data-compa11y-rte-toolbar` | Toolbar container |
| `data-compa11y-rte-content` | Editor content area |
| `data-compa11y-rte-button` | Any toolbar button |
| `data-compa11y-rte-button-mark` | Mark toggle (value: bold/italic/etc.) |
| `data-compa11y-rte-button-list` | List toggle (value: bullet/number) |
| `data-compa11y-rte-button-block` | Block toggle (value: blockquote/codeBlock) |
| `data-compa11y-rte-button-action` | Action button (value: undo/redo/link/indent/outdent) |
| `data-compa11y-rte-heading-select` | Heading level select |
| `data-compa11y-rte-separator` | Toolbar separator |
| `data-compa11y-rte-footer` | Footer container |
| `data-compa11y-rte-character-count` | Character count span |
| `data-compa11y-rte-help-text` | Help text |
| `data-compa11y-rte-link-dialog` | Link dialog |
| `data-compa11y-rte-image-dialog` | Image dialog |
| `data-active` | Active/pressed toggle |
| `data-disabled` | Disabled state |
| `data-readonly` | Read-only state |
| `data-invalid` | Invalid state |
| `data-over` | Character count exceeds max |

#### RTEAdapter interface (from `@compa11y/core`)

The adapter contract is engine-agnostic. Implement it for each engine:

```typescript
interface RTEAdapter {
  mount(el: HTMLElement, opts: RTEMountOptions): () => void;  // returns unmount
  getSelectionState(): RTESelectionState;
  getValue(format: RTEFormat): RTEValue;
  setValue(value: RTEValue, format: RTEFormat): void;
  isEmpty(): boolean;
  getPlainText(): string;
  getCharacterCount(): number;
  commands: RTECommands;  // toggleMark, setBlock, insertOrEditLink, undo/redo, etc.
  supports?: RTECapabilities;
  sanitizeHtml?: (html: string) => string;
}
```

Adapter packages (separate): `@compa11y/rte-lexical`, `@compa11y/rte-tiptap`

---

## Web Components

All web components use Shadow DOM and extend the `Compa11yElement` base class. They are fully functional without JavaScript frameworks and can be used in any HTML page.

### `<compa11y-button>`

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
<compa11y-button variant="primary" size="md">Save Changes</a11y-button>
<compa11y-button loading aria-label="Saving">Save</a11y-button>
<compa11y-button disabled>Cannot Click</a11y-button>
```

#### CSS Custom Properties

```css
--compa11y-button-bg, --compa11y-button-color, --compa11y-button-border
--compa11y-button-hover-bg, --compa11y-button-active-bg
--compa11y-button-radius, --compa11y-button-font-size
--compa11y-focus-color
```

---

### `<compa11y-input>`

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
<compa11y-input
  label="Email"
  type="email"
  hint="We won't share your email"
  error="Please enter a valid email"
  required
></a11y-input>
```

**Events:** `input`, `change`, `a11y-input-change`

---

### `<compa11y-textarea>`

#### What the library handles

Same as `<compa11y-input>` but for multi-line text.

| Feature | Details |
|---------|---------|
| **`<label>`** | Auto-associated |
| **`aria-describedby`** | Hint/error references |
| **`aria-invalid`** | On error |
| **`aria-required`** | On required |
| **`role="alert"`** | On error container |

#### Usage

```html
<compa11y-textarea
  label="Description"
  hint="Maximum 500 characters"
  rows="4"
  required
></a11y-textarea>
```

---

### `<compa11y-checkbox>`

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
| **Group: `<fieldset>` + `<legend>`** | `<compa11y-checkbox-group>` uses semantic grouping |
| **Group: `aria-invalid`** | Set when group has error |
| **Screen reader** | Announces "{label} checked/unchecked" |

#### Usage

```html
<compa11y-checkbox label="I agree to the terms" required></a11y-checkbox>

<compa11y-checkbox-group legend="Select toppings">
  <compa11y-checkbox value="cheese" label="Cheese"></a11y-checkbox>
  <compa11y-checkbox value="peppers" label="Peppers"></a11y-checkbox>
</a11y-checkbox-group>
```

**Events:** `change`, `a11y-checkbox-change`

---

### `<compa11y-radio-group>`

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
<compa11y-radio-group legend="Size" orientation="horizontal" value="md">
  <compa11y-radio value="sm" label="Small"></a11y-radio>
  <compa11y-radio value="md" label="Medium"></a11y-radio>
  <compa11y-radio value="lg" label="Large"></a11y-radio>
</a11y-radio-group>
```

**Events:** `change`, `a11y-radiogroup-change`

---

### `<compa11y-switch>`

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
<compa11y-switch label="Enable notifications" checked></a11y-switch>
<compa11y-switch size="lg" label="Dark mode"></a11y-switch>
```

**Methods:** `toggle()`, `setChecked(boolean)`
**Events:** `change`

---

### `<compa11y-select>`

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
<compa11y-select placeholder="Choose..." aria-label="Select country">
  <option value="us">United States</option>
  <option value="uk">United Kingdom</option>
  <option value="de" disabled>Germany (unavailable)</option>
</a11y-select>
```

**Methods:** `show()`, `close()`
**Events:** `change`, `a11y-select-open`, `a11y-select-close`, `a11y-select-change`

---

### `<compa11y-combobox>`

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
<compa11y-combobox placeholder="Search..." clearable>
  <option value="apple">Apple</option>
  <option value="banana">Banana</option>
  <option value="cherry">Cherry</option>
</a11y-combobox>
```

**Methods:** `show()`, `close()`, `clear()`
**Events:** `a11y-combobox-open`, `a11y-combobox-close`, `a11y-combobox-select`, `a11y-combobox-change`, `a11y-combobox-clear`

---

### `<compa11y-listbox>`

#### What the library handles

| Feature | Details |
|---------|---------|
| **`role="listbox"`** | On container |
| **`aria-orientation`** | `"horizontal"` or `"vertical"` |
| **`aria-multiselectable`** | In multi-select mode |
| **`aria-activedescendant`** | Focused option |
| **Option: `role="option"`** | On each option |
| **`aria-selected`** | Selection state |
| **Group: `role="group"`** | `<compa11y-optgroup>` with `aria-labelledby` |
| **Single-select keyboard** | Arrow/Home/End + auto-select + type-ahead |
| **Multi-select keyboard** | Arrow (focus only), Space (toggle), Shift+Arrow (extend), Ctrl+A (all), Shift+Home/End (range) |
| **Screen reader** | Announces selection/deselection, range counts, select/deselect all |

#### Usage

```html
<!-- Single select -->
<compa11y-listbox aria-label="Favorite fruit" value="apple">
  <compa11y-option value="apple">Apple</a11y-option>
  <compa11y-option value="banana">Banana</a11y-option>
</a11y-listbox>

<!-- Multi-select with groups -->
<compa11y-listbox multiple aria-label="Toppings">
  <compa11y-optgroup label="Meats">
    <compa11y-option value="pepperoni">Pepperoni</a11y-option>
  </a11y-optgroup>
</a11y-listbox>
```

**Events:** `change`, `a11y-listbox-change`

---

### `<compa11y-dialog>`

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

<compa11y-dialog trigger="#open-btn">
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

### `<compa11y-menu>`

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
<compa11y-menu>
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

### `<compa11y-tabs>`

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
<compa11y-tabs>
  <button slot="tab" role="tab" aria-controls="panel-1">Profile</button>
  <button slot="tab" role="tab" aria-controls="panel-2">Settings</button>

  <div slot="panel" role="tabpanel" id="panel-1">Profile content</div>
  <div slot="panel" role="tabpanel" id="panel-2">Settings content</div>
</a11y-tabs>

<!-- Vertical with manual activation -->
<compa11y-tabs orientation="vertical" activation-mode="manual">
  <!-- ... -->
</a11y-tabs>
```

**Methods:** `select(index)`, `next()`, `previous()`
**Events:** `a11y-tabs-change`

---

### `<compa11y-toast>`

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
<compa11y-toast position="bottom-right" duration="5000" max-toasts="5"></a11y-toast>

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

### `<compa11y-visually-hidden>`

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
  <compa11y-visually-hidden>Close dialog</a11y-visually-hidden>
</button>

<!-- Focusable (appears on focus) -->
<compa11y-visually-hidden focusable>
  <a href="#main-content">Skip to main content</a>
</a11y-visually-hidden>
```

---

### `<compa11y-skip-link>`

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
<compa11y-skip-link target="#main-content">Skip to main content</a11y-skip-link>

<!-- With custom label attribute -->
<compa11y-skip-link target="#main-content" label="Skip navigation"></a11y-skip-link>

<!-- Multiple skip links -->
<compa11y-skip-link target="#main-content">Skip to content</a11y-skip-link>
<compa11y-skip-link target="#search">Skip to search</a11y-skip-link>
```

Keyboard: **Tab** to reveal, **Enter** to activate.

---

### `<compa11y-alert>`

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
<compa11y-alert type="error" title="Payment failed">
  Your card was declined. Please try a different payment method.
</a11y-alert>

<!-- Success alert -->
<compa11y-alert type="success" title="Saved!">
  Your changes have been saved successfully.
</a11y-alert>

<!-- Dismissible -->
<compa11y-alert type="info" dismissible>
  This alert can be closed by the user.
</a11y-alert>
```

**Attributes:** `type` (info/success/warning/error), `title`, `dismissible`
**Methods:** `dismiss()`
**Events:** `dismiss`

---

### `<compa11y-link>`

#### What the library handles

| Feature | Details |
|---------|---------|
| **External links** | When `external` attribute is present, adds `target="_blank"`, `rel="noopener noreferrer"`, external SVG icon, and screen reader "(opens in new tab)" hint |
| **`aria-current`** | Supports `page`, `step`, `location`, `true` for navigation context |
| **Disabled state** | When `disabled` attribute is present, removes `href`, sets `role="link"`, `aria-disabled="true"`, `tabindex="-1"` |
| **CSS custom properties** | `--compa11y-link-color`, `--compa11y-link-color-hover`, `--compa11y-link-color-visited`, `--compa11y-link-underline`, `--compa11y-focus-color` |
| **`::part()` exports** | `link`, `external-icon` |
| **Forced colors support** | `@media (forced-colors: active)` with `LinkText`, `VisitedText`, `GrayText` |

#### Usage

```html
<!-- Basic link -->
<compa11y-link href="/about">About us</a11y-link>

<!-- External link (opens in new tab with screen reader hint) -->
<compa11y-link href="https://example.com" external>Visit Example</a11y-link>

<!-- Current page in navigation -->
<compa11y-link href="/dashboard" current="page">Dashboard</a11y-link>

<!-- Disabled link -->
<compa11y-link href="/settings" disabled>Settings</a11y-link>
```

**Attributes:** `href`, `external`, `current` (page/step/location/true), `disabled`

---

### `<compa11y-heading>`

#### What the library handles

| Feature | Details |
|---------|---------|
| **Semantic elements** | Renders `<h1>`–`<h6>` based on `level` attribute (default: `2`) |
| **Size override** | Optional `size` attribute to visually adjust without changing semantic level |
| **Color, weight, alignment** | `color`, `weight`, `align` attributes for text styling |
| **Truncation** | `truncate` attribute adds ellipsis overflow |
| **CSS custom properties** | `--compa11y-heading-font-family`, `--compa11y-heading-1-size` through `--compa11y-heading-6-size`, `--compa11y-text-color-*` |
| **`::part()` exports** | `heading` |
| **Forced colors support** | `@media (forced-colors: active)` resets color variants to `CanvasText` |

#### Usage

```html
<compa11y-heading level="1">Page Title</a11y-heading>
<compa11y-heading level="2" size="lg">Visually smaller h2</a11y-heading>
<compa11y-heading level="3" color="muted">Muted heading</a11y-heading>
```

**Attributes:** `level` (1–6), `size` (xs/sm/md/lg/xl/2xl/3xl), `color`, `weight`, `align`, `truncate`

---

### `<compa11y-text>`

#### What the library handles

| Feature | Details |
|---------|---------|
| **Semantic elements** | Renders `<p>` (default), `<span>`, `<div>`, or `<label>` via `as` attribute |
| **Size scale** | `xs`, `sm`, `md` (default), `lg`, `xl`, `2xl`, `3xl` |
| **Color variants** | `default`, `muted`, `accent`, `error`, `success`, `warning` |
| **Weight, alignment** | `weight`, `align` attributes for text styling |
| **Truncation** | `truncate` attribute adds ellipsis overflow |
| **CSS custom properties** | `--compa11y-text-font-family`, `--compa11y-text-size-*`, `--compa11y-text-color-*` |
| **`::part()` exports** | `text` |
| **Forced colors support** | `@media (forced-colors: active)` resets color variants to `CanvasText` |

#### Usage

```html
<compa11y-text>Default body paragraph.</a11y-text>
<compa11y-text size="sm" color="muted">Small muted text.</a11y-text>
<compa11y-text as="span" weight="bold">Bold inline text.</a11y-text>
<compa11y-text truncate style="max-width: 300px;">Long text that truncates...</a11y-text>
```

**Attributes:** `as` (p/span/div/label), `size`, `color`, `weight`, `align`, `truncate`

---

### `<compa11y-form-field>`

A generic wrapper that provides label, hint, error, and required indicator around any slotted control. Automatically wires ARIA on the first interactive element found in the slot.

#### What the library handles

| Feature | Details |
|---------|---------|
| **`aria-labelledby`** | Wired onto the slotted control when `label` attribute is present |
| **`aria-describedby`** | Includes hint and/or error element IDs when present |
| **`aria-invalid`** | Set on slotted control when `error` attribute is present |
| **`aria-required`** | Set on slotted control when `required` attribute is present |
| **`aria-disabled` / `disabled`** | Applied to slotted control when `disabled` attribute is present |
| **Required asterisk** | Rendered via `<span aria-hidden="true">*</span>` inside the label |
| **Error live region** | Error element renders with `role="alert"` |
| **Dev warning** | Warns in development if `label` attribute is missing |
| **CSS custom properties** | `--compa11y-field-gap`, `--compa11y-field-label-*`, `--compa11y-field-hint-*`, `--compa11y-field-error-*`, `--compa11y-field-required-color` |
| **`::part()` exports** | `wrapper`, `label`, `hint`, `error`, `required` |
| **Forced colors support** | `@media (forced-colors: active)` for label and error colors |

#### Usage

```html
<!-- Wrap a native input -->
<compa11y-form-field label="Email" hint="We'll never share it." required>
  <input type="email" placeholder="you@example.com" />
</a11y-form-field>

<!-- Wrap a native select -->
<compa11y-form-field label="Country" required>
  <select>
    <option value="">Choose…</option>
    <option value="us">United States</option>
  </select>
</a11y-form-field>

<!-- With error -->
<compa11y-form-field label="Password" error="Must be at least 8 characters">
  <input type="password" />
</a11y-form-field>

<!-- Disabled -->
<compa11y-form-field label="Organization" disabled>
  <input type="text" value="Compa11y Inc." />
</a11y-form-field>
```

**Attributes:** `label`, `hint`, `error`, `required`, `disabled`

---

### `<compa11y-popover>`

Non-modal, anchored overlay. Wraps trigger and content in a single element using named slots. No focus trap, no scroll lock — use for contextual UI distinct from dialogs.

#### What the library handles

| Feature | Details |
|---------|---------|
| **`aria-haspopup="dialog"`** | Set on slotted trigger element when wired |
| **`aria-expanded`** | Toggled on trigger to reflect open/closed state |
| **`aria-controls`** | Points from trigger to the shadow DOM content container |
| **`role="dialog"` + `aria-modal="false"`** | Content element is a non-modal dialog region |
| **Focus management** | On open: first focusable in content receives focus. On close: focus returns to trigger |
| **Escape key** | Closes popover and returns focus to trigger |
| **Outside click** | `pointerdown` outside the component closes the popover |
| **Viewport-aware positioning** | Automatically flips placement side if content overflows viewport |
| **Scroll/resize tracking** | Position is recalculated on scroll and resize while open |
| **CSS custom properties** | Full theming via `--compa11y-popover-*` tokens |
| **`::part()` exports** | `trigger-slot`, `content` |
| **Forced colors support** | `@media (forced-colors: active)` border handling |
| **Reduced motion** | Transitions are disabled when `prefers-reduced-motion: reduce` is set |

#### Usage

```html
<!-- Basic -->
<compa11y-popover placement="bottom">
  <button slot="trigger">More info</button>
  <p>Popover content. Press Escape or click outside to dismiss.</p>
</a11y-popover>

<!-- With interactive content -->
<compa11y-popover placement="bottom-start">
  <button slot="trigger">Open settings</button>
  <div>
    <p>Choose an option:</p>
    <button>Option A</button>
    <button>Option B</button>
  </div>
</a11y-popover>

<!-- Controlled via JS -->
<compa11y-popover id="my-pop" placement="right">
  <button slot="trigger">Open</button>
  <p>Controlled popover.</p>
</a11y-popover>
<script>
  const pop = document.getElementById('my-pop');
  pop.addEventListener('a11y-popover-open', () => console.log('opened'));
  pop.addEventListener('a11y-popover-close', () => console.log('closed'));
  // Programmatic: pop.open = true / pop.open = false
</script>
```

**Attributes:** `open`, `placement`, `offset`, `disabled`

**Events:** `a11y-popover-open`, `a11y-popover-close`

**CSS Custom Properties:**

| Property | Default | Description |
|----------|---------|-------------|
| `--compa11y-popover-bg` | `#fff` | Background color |
| `--compa11y-popover-color` | inherit | Text color |
| `--compa11y-popover-border` | `1px solid rgba(0,0,0,.15)` | Border |
| `--compa11y-popover-radius` | `0.375rem` | Border radius |
| `--compa11y-popover-shadow` | `0 4px 16px rgba(0,0,0,.12)` | Box shadow |
| `--compa11y-popover-padding` | `1rem` | Content padding |
| `--compa11y-popover-max-width` | `320px` | Max content width |
| `--compa11y-popover-z-index` | `1000` | Z-index |

---

### `<compa11y-accordion>`

Accessible accordion web component. Supports single/multiple modes with full keyboard navigation.

#### What the library handles

| Feature | Details |
|---------|---------|
| **`aria-expanded`** | Set on each `[data-accordion-trigger]` button |
| **`aria-controls`** | Auto-assigned to link trigger to its panel |
| **`role="region"`** | Set on each `[data-accordion-panel]` |
| **`aria-labelledby`** | Panel references its trigger by ID |
| **IDs** | Auto-generated for triggers and panels if not provided |
| **Keyboard Navigation** | `↓`/`↑` between triggers, `Home`/`End` for first/last |
| **Screen Reader** | Announces `"[label] expanded/collapsed"` on toggle |
| **Global styles** | Injected into `<head>` once, scoped to `a11y-accordion` |

#### Attributes

| Attribute | Values | Default | Description |
|-----------|--------|---------|-------------|
| `type` | `single \| multiple` | `single` | One or many items open at once |
| `collapsible` | boolean | `false` | In single mode, allow closing the active item |

#### Events

| Event | `detail` | Description |
|-------|----------|-------------|
| `a11y-accordion-change` | `{ index, expanded, trigger, panel }` | Fired when an item is toggled |

#### Programmatic API

```javascript
const accordion = document.querySelector('a11y-accordion');
accordion.open(0);    // Open item at index 0
accordion.close(1);   // Close item at index 1
accordion.toggle(2);  // Toggle item at index 2
```

#### Usage

```html
<!-- Single mode (default) — wrap triggers in headings for semantics -->
<compa11y-accordion type="single" collapsible>
  <h3>
    <button data-accordion-trigger>Section 1</button>
  </h3>
  <div data-accordion-panel>
    <p>Content for section 1.</p>
  </div>

  <h3>
    <button data-accordion-trigger>Section 2</button>
  </h3>
  <div data-accordion-panel>
    <p>Content for section 2.</p>
  </div>
</a11y-accordion>

<!-- Multiple mode -->
<compa11y-accordion type="multiple">
  <h3><button data-accordion-trigger>Section A</button></h3>
  <div data-accordion-panel>Content A</div>

  <h3><button data-accordion-trigger>Section B</button></h3>
  <div data-accordion-panel>Content B</div>
</a11y-accordion>

<!-- Disabled trigger -->
<compa11y-accordion>
  <h3><button data-accordion-trigger disabled>Cannot open</button></h3>
  <div data-accordion-panel>Unreachable content</div>
</a11y-accordion>
```

#### CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--compa11y-accordion-border-color` | `#e0e0e0` | Border color |
| `--compa11y-accordion-radius` | `6px` | Border radius |
| `--compa11y-accordion-trigger-bg` | `#ffffff` | Trigger background |
| `--compa11y-accordion-trigger-hover-bg` | `#f9f9f9` | Trigger hover background |
| `--compa11y-accordion-trigger-color` | `#1a1a1a` | Trigger text color |
| `--compa11y-accordion-trigger-padding` | `1rem` | Trigger padding |
| `--compa11y-accordion-content-bg` | `#ffffff` | Panel background |
| `--compa11y-accordion-content-padding` | `1rem` | Panel padding |
| `--compa11y-focus-color` | `#0066cc` | Focus ring color |

---

### `<compa11y-table>`

Data-driven accessible table. Accepts `columns` and `rows` as JavaScript properties and renders a fully semantic `<table>` in the light DOM. Supports sorting and row selection with automatic ARIA wiring.

#### What the library handles

| Feature | Details |
|---------|---------|
| **Semantic HTML** | Renders `<table>`, `<caption>`, `<thead>`, `<tbody>`, `<tr>`, `<th scope="col">`, `<td>` in the light DOM |
| **`caption`** | Rendered from the `caption` attribute |
| **`aria-sort`** | Set to `ascending`, `descending`, or `none` on sortable column headers |
| **Sort button** | Renders a `<button>` inside each sortable `<th>`; focus preserved across re-renders |
| **`aria-selected`** | Applied to `<tr>` in selection mode |
| **Select-all** | Checkbox with `aria-label="Select all rows"` and automatic indeterminate state |
| **Row checkboxes** | Auto-labeled using the first column value (e.g., `"Select Alice"`) |
| **`aria-busy`** | Applied to host element when `loading` attribute is set |
| **Empty state** | Full-width `<td>` with configurable `empty-message` |
| **Loading state** | Full-width `<td>` with `aria-busy="true"` |
| **Global styles** | Injected into `<head>` once, scoped to `a11y-table` |
| **Screen Reader** | Announces sort direction changes and selection count changes |
| **Dev warnings** | Warns if `caption` is absent; warns if selectable rows have no `id` field |

#### Events

| Event | Detail | Description |
|-------|--------|-------------|
| `a11y-table-sort` | `{ sortKey, sortDirection }` | Fired when a sortable column header is activated |
| `a11y-table-select` | `{ selectedRows: string[] }` | Fired when row selection changes |

#### Usage

```html
<compa11y-table caption="Product catalogue" selectable></a11y-table>

<script>
  const table = document.querySelector('a11y-table');

  table.columns = [
    { key: 'name',  label: 'Name',  sortable: true },
    { key: 'price', label: 'Price', sortable: true, align: 'right' },
    { key: 'stock', label: 'Stock', sortable: false, align: 'center' },
  ];

  table.rows = [
    { id: 'p1', name: 'Widget A', price: '$49',  stock: 'In stock' },
    { id: 'p2', name: 'Widget B', price: '$149', stock: 'Out of stock' },
  ];

  table.addEventListener('a11y-table-sort', (e) => {
    console.log('Sort:', e.detail.sortKey, e.detail.sortDirection);
  });

  table.addEventListener('a11y-table-select', (e) => {
    console.log('Selected:', e.detail.selectedRows);
  });
</script>
```

#### Column definition

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `key` | `string` | — | Matches row object key |
| `label` | `string` | — | Header cell text |
| `sortable` | `boolean` | `false` | Renders sort button |
| `align` | `'left' \| 'center' \| 'right'` | `'left'` | Text alignment |
| `rowHeader` | `boolean` | `false` | Renders `<th scope="row">` instead of `<td>` |

#### Public methods

| Method | Description |
|--------|-------------|
| `sort(key, dir?)` | Sort by column; cycles direction if `dir` omitted |
| `selectRow(id)` | Select a row by ID |
| `deselectRow(id)` | Deselect a row by ID |
| `selectAll()` | Select all rows |
| `deselectAll()` | Clear selection |

#### CSS custom properties

| Property | Default | Description |
|----------|---------|-------------|
| `--compa11y-table-color` | `#1a1a1a` | Default text color |
| `--compa11y-table-bg` | `#ffffff` | Table background |
| `--compa11y-table-head-bg` | `#f5f5f5` | Header row background |
| `--compa11y-table-foot-bg` | `#f5f5f5` | Footer row background |
| `--compa11y-table-border-color` | `#d0d0d0` | Border color |
| `--compa11y-table-cell-padding` | `0.625rem 0.875rem` | Cell padding |
| `--compa11y-table-row-hover-bg` | `#fafafa` | Row hover background |
| `--compa11y-table-selected-bg` | `#e8f0fe` | Selected row background |
| `--compa11y-table-selected-hover-bg` | `#dde7fd` | Selected row hover background |
| `--compa11y-table-muted-color` | `#6b6b6b` | Empty/loading cell text color |
| `--compa11y-focus-color` | `#0066cc` | Focus ring color |

---

### `<compa11y-pagination>`

Accessible pagination web component. Renders a shadow-DOM `<nav>` landmark containing a `<ul>` of page buttons, optional First/Last buttons, an optional rows-per-page `<select>`, and an optional "Go to page" number input. Emits `page-change` and `page-size-change` custom events.

#### What the library handles

| Feature | Details |
|---------|---------|
| **`<nav>` landmark** | Shadow DOM `<nav>` with `aria-label` (defaults to `"Pagination"`) |
| **`aria-current="page"`** | Applied to the active page button |
| **`aria-label` on every button** | `"Page N"`, `"Previous page"`, `"Next page"`, `"First page"`, `"Last page"` |
| **`disabled` attribute** | Native `disabled` on Prev/First at page 1, Next/Last at the last page, and when the `disabled` attribute is set |
| **Live region** | `role="status" aria-live="polite" aria-atomic="true"` always in shadow DOM; announces `"Page N of M"` or `"Showing 1–N of M"` |
| **Ellipsis hiding** | Ellipsis `<li>` items carry `aria-hidden="true"` |
| **Labelled controls** | Page-size `<select>` and jump-to `<input>` each have a linked `<label>` |
| **Jump validation** | Invalid jump input shows an inline `role="alert"` error linked via `aria-describedby` |
| **Focus restoration** | After innerHTML rebuild (required when the page range changes), focus is restored to the equivalent button via `requestAnimationFrame` |
| **Dev warnings** | Error if neither `total-pages` nor `total-items` is set |

#### Keyboard interactions

| Key | Target | Action |
|-----|--------|--------|
| `Tab` | All buttons / inputs | Move between controls in DOM order |
| `Enter` / `Space` | Any page button | Navigate to that page |
| `Enter` | Jump-to input | Navigate to the entered page; shows inline error if invalid |

#### Events

| Event | Detail | Description |
|-------|--------|-------------|
| `page-change` | `{ page: number }` | Fired when the active page changes |
| `page-size-change` | `{ pageSize: number }` | Fired when the rows-per-page selector changes |

#### Usage

```html
<!-- Basic -->
<compa11y-pagination total-pages="24"></a11y-pagination>

<!-- Derived from totalItems with page size -->
<compa11y-pagination
  total-items="312"
  page-size="25"
  current-page="1"
></a11y-pagination>

<!-- Full-featured -->
<compa11y-pagination
  total-items="312"
  current-page="1"
  show-first-last
  show-page-size
  page-size-options="10,25,50,100"
  show-jump-to
  aria-label="Products pagination"
></a11y-pagination>

<script>
  const pg = document.querySelector('a11y-pagination');

  pg.addEventListener('page-change', (e) => {
    console.log('Page:', e.detail.page);
  });

  pg.addEventListener('page-size-change', (e) => {
    console.log('Page size:', e.detail.pageSize);
  });
</script>
```

#### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `total-pages` | `number` | `1` | Total page count. Required unless `total-items` is set |
| `total-items` | `number` | — | Total item count; used to derive `total-pages` when `total-pages` is absent |
| `current-page` | `number` | `1` | Active page (1-indexed) |
| `page-size` | `number` | `25` | Items per page (used with `total-items`) |
| `page-size-options` | `string` | `"10,25,50"` | Comma-separated list of page size options |
| `sibling-count` | `number` | `1` | Pages shown either side of the current page |
| `boundary-count` | `number` | `1` | Pages shown at each end of the range |
| `show-first-last` | boolean attr | absent | Show First (««) and Last (»») buttons |
| `show-page-size` | boolean attr | absent | Render a rows-per-page `<select>` |
| `show-jump-to` | boolean attr | absent | Render a "Go to page" number input |
| `disabled` | boolean attr | absent | Disable all controls |
| `aria-label` | `string` | `"Pagination"` | Label for the `<nav>` landmark |

#### Public methods

| Method | Description |
|--------|-------------|
| `goTo(page)` | Navigate to a specific page |
| `next()` | Navigate to the next page |
| `previous()` | Navigate to the previous page |

#### CSS custom properties

| Property | Default | Description |
|----------|---------|-------------|
| `--compa11y-pagination-color` | `inherit` | Button text color |
| `--compa11y-pagination-bg` | `transparent` | Button background |
| `--compa11y-pagination-border` | `currentColor` | Button border color |
| `--compa11y-pagination-radius` | `4px` | Button border radius |
| `--compa11y-pagination-size` | `44px` | Minimum button width and height (touch target) |
| `--compa11y-pagination-current-bg` | `currentColor` | Current page button background |
| `--compa11y-pagination-current-color` | `canvas` | Current page button text color |
| `--compa11y-focus-color` | `#0066cc` | Focus ring color |

---

### `<compa11y-breadcrumbs>`

Reads slotted `<a>` and `<span>` children from the light DOM, clones them into a shadow `<nav><ol>` with separators and `aria-current="page"` injected automatically on the last child.

#### What the library handles automatically

| Feature | Details |
|---------|---------|
| `<nav aria-label>` | Defaults to `"Breadcrumb"`; override with the `aria-label` attribute |
| `<ol>` list | Semantic ordered list; children cloned into shadow DOM |
| `aria-current="page"` | Applied automatically to the last child's shadow clone |
| Separators | `aria-hidden="true"` `<li>` nodes injected between each item |
| `<a>` vs `<span>` | If the source child is `<a href>` the clone is an anchor; `<span>` otherwise |
| Collapse / expand | `max-items` attribute hides middle items behind a keyboard-accessible `<button>` |
| Focus after expand | Focus moves to the first newly-revealed link |
| Child change detection | `MutationObserver` watches for added/removed children and re-renders |

#### Attributes

| Attribute | Default | Description |
|-----------|---------|-------------|
| `aria-label` | `"Breadcrumb"` | Accessible name for the `<nav>` landmark |
| `separator` | `"/"` | Separator text between items |
| `max-items` | `0` | Collapse threshold; `0` = never collapse |

#### Usage

```html
<!-- Basic -->
<compa11y-breadcrumbs aria-label="Breadcrumb">
  <a href="/">Home</a>
  <a href="/products">Products</a>
  <span>Model X</span>        <!-- last child → current page -->
</a11y-breadcrumbs>

<!-- Last item as link -->
<compa11y-breadcrumbs>
  <a href="/">Home</a>
  <a href="/products/model-x">Model X</a>
</a11y-breadcrumbs>

<!-- Custom separator -->
<compa11y-breadcrumbs separator="›">
  <a href="/">Home</a>
  <span>Settings</span>
</a11y-breadcrumbs>

<!-- Collapsible -->
<compa11y-breadcrumbs max-items="3">
  <a href="/">Home</a>
  <a href="/cat">Category</a>
  <a href="/cat/sub">Subcategory</a>
  <a href="/cat/sub/item">Item</a>
  <span>Detail</span>
</a11y-breadcrumbs>
```

#### CSS custom properties

| Property | Default | Description |
|----------|---------|-------------|
| `--compa11y-breadcrumbs-link-color` | `#0066cc` | Link text color |
| `--compa11y-breadcrumbs-current-color` | `inherit` | Current-page item color |
| `--compa11y-breadcrumbs-separator-color` | `#999` | Separator color |
| `--compa11y-breadcrumbs-separator-padding` | `0.375rem` | Horizontal padding around each separator |
| `--compa11y-focus-color` | `#0066cc` | Focus ring color |

---

### `<compa11y-tooltip>`

Anchors a descriptive tooltip to a slotted trigger element. Automatically sets `aria-describedby` on the trigger. Because `aria-describedby` cannot cross shadow DOM boundaries, the component mirrors the tooltip text into a visually-hidden `<span role="tooltip">` appended to `document.body` — the shadow DOM tooltip is visual only.

#### What the library handles

| Feature | Details |
|---------|---------|
| **`role="tooltip"` (body span)** | A visually-hidden `<span role="tooltip">` in `document.body` carries the label text for screen readers |
| **`aria-describedby`** | Set on the slotted trigger element; points to the body-level tooltip span |
| **Visual tooltip** | Shadow DOM element handles positioning, animation, and styling — marked `aria-hidden="true"` |
| **Hover trigger** | `mouseenter` → show (after `delay` ms), `mouseleave` → hide |
| **Focus trigger** | `focus` → show immediately (WCAG 2.1 SC 1.4.13), `blur` → hide immediately |
| **Escape to dismiss** | Closes tooltip without moving focus |
| **Viewport-aware positioning** | Auto-flips if tooltip would overflow viewport |
| **`label` sync** | Both the visual tooltip and the SR span are updated when `label` attribute changes |
| **Dev warnings** | Warns if `label` attribute is missing or trigger slot is empty |

#### Keyboard interactions

| Key | Action |
|-----|--------|
| `Tab` to trigger | Tooltip appears immediately |
| `Escape` | Tooltip closes; focus stays on trigger |
| `Tab` away | Tooltip closes |

#### Usage

```html
<!-- Basic -->
<compa11y-tooltip label="Save your changes">
  <button slot="trigger">Save</button>
</compa11y-tooltip>

<!-- Custom placement -->
<compa11y-tooltip label="Format: YYYY-MM-DD" placement="bottom">
  <input slot="trigger" type="text" placeholder="Date" />
</compa11y-tooltip>

<!-- With delay -->
<compa11y-tooltip label="Opens in a new window" delay="500">
  <a slot="trigger" href="/docs" target="_blank">Docs</a>
</compa11y-tooltip>

<!-- Disabled -->
<compa11y-tooltip label="Cannot delete" disabled>
  <button slot="trigger" disabled>Delete</button>
</compa11y-tooltip>
```

**Events:** `compa11y-tooltip-show`, `compa11y-tooltip-hide`

#### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `label` | `string` | — | **Required.** Tooltip text |
| `placement` | `string` | `top` | Preferred side (top/bottom/left/right and -start/-end variants) |
| `delay` | `number` | `300` | Hover show delay in ms |
| `hide-delay` | `number` | `0` | Hide delay in ms on mouse-leave |
| `offset` | `number` | `8` | Gap between trigger and tooltip in px |
| `disabled` | boolean attr | absent | Suppress the tooltip |

#### CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--compa11y-tooltip-bg` | `#1a1a1a` | Background color |
| `--compa11y-tooltip-color` | `#fff` | Text color |
| `--compa11y-tooltip-radius` | `4px` | Border radius |
| `--compa11y-tooltip-padding` | `0.375rem 0.625rem` | Padding |
| `--compa11y-tooltip-font-size` | `0.8125rem` | Font size |
| `--compa11y-tooltip-max-width` | `280px` | Max width |
| `--compa11y-tooltip-shadow` | `0 2px 8px rgba(0,0,0,.2)` | Box shadow |

---

### `<compa11y-drawer>`

A panel that slides in from any edge of the viewport. Uses Shadow DOM with named slots for title, description, content, and actions.

#### What the library handles

| Feature | Details |
|---------|---------|
| **`role="dialog"` + `aria-modal="true"`** | Set on the inner panel element |
| **`aria-labelledby`** | Points to the shadow-DOM wrapper around the `title` slot |
| **`aria-describedby`** | Points to the shadow-DOM wrapper around the `description` slot |
| **Focus trap (Tab / Shift+Tab)** | Tab order cycles through all focusable elements inside the open drawer; wraps at both ends |
| **Focus return** | Saves the previously focused element and restores it on close |
| **Body scroll lock** | Prevents background scroll while drawer is open; uses a stacking counter so multiple overlays are safe |
| **Screen reader announcements** | "Drawer opened" / "Drawer closed" announced politely on open/close |
| **Drag to dismiss** | When `draggable` attribute is present, dragging the handle past 40 % of the panel closes the drawer; releasing earlier snaps it back |
| **Trigger wiring** | `trigger` attribute accepts a CSS selector; the matched element gets a click listener that opens the drawer |
| **Escape key** | Closes the drawer (disable with `close-on-escape="false"`) |
| **Backdrop click** | Closes the drawer (disable with `close-on-outside-click="false"`) |
| **Dev warnings** | Warns if no label-providing slot or `aria-label` attribute is found |

#### Keyboard interactions

| Key | Action |
|-----|--------|
| `Tab` / `Shift+Tab` | Cycle focus inside the drawer (wraps) |
| `Escape` | Close the drawer and return focus to the trigger |

#### Usage

```html
<!-- Basic right-side drawer -->
<button id="open-drawer">Open Settings</button>
<compa11y-drawer trigger="#open-drawer">
  <h2 slot="title">Settings</h2>
  <p slot="description">Adjust your preferences.</p>
  <div>…content…</div>
  <div slot="actions">
    <button id="close-btn">Done</button>
  </div>
</compa11y-drawer>

<!-- Bottom sheet with drag-to-dismiss -->
<compa11y-drawer side="bottom" trigger="#share-btn" draggable>
  <h2 slot="title">Share</h2>
  <div>…</div>
</compa11y-drawer>

<!-- Programmatic control -->
<compa11y-drawer id="my-drawer" side="left">
  <h2 slot="title">Menu</h2>
  <div>…</div>
</compa11y-drawer>
<script>
  document.querySelector('#my-drawer').show();
  // later…
  document.querySelector('#my-drawer').close();
</script>
```

**Events:** `compa11y-drawer-open`, `compa11y-drawer-close`

**Methods:** `show()`, `close()`

#### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `open` | boolean attr | absent | Open/close state (reflects JS property) |
| `side` | `string` | `right` | Edge to slide in from: `left`, `right`, `top`, `bottom` |
| `trigger` | `string` | — | CSS selector for the external trigger element |
| `draggable` | boolean attr | absent | Enable drag-to-dismiss on the handle |
| `close-on-outside-click` | `string` | `true` | Set to `"false"` to prevent backdrop click from closing |
| `close-on-escape` | `string` | `true` | Set to `"false"` to prevent Escape from closing |

#### Slots

| Slot | Description |
|------|-------------|
| `title` | Drawer heading — wired to `aria-labelledby` |
| `description` | Optional subtitle — wired to `aria-describedby` |
| `actions` | Footer action buttons |
| *(default)* | Main body content |

#### CSS Parts

`overlay` · `drawer` · `handle` · `title` · `description` · `content` · `actions`

#### CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--compa11y-drawer-width` | `400px` | Panel width (left / right drawers) |
| `--compa11y-drawer-height` | `400px` | Panel height (top / bottom drawers) |
| `--compa11y-drawer-bg` | `#fff` | Panel background color |
| `--compa11y-drawer-overlay-bg` | `rgba(0,0,0,0.5)` | Backdrop color |
| `--compa11y-drawer-z-index` | `9999` | Stacking order |
| `--compa11y-drawer-padding` | `1.5rem` | Panel padding |
| `--compa11y-drawer-shadow` | directional shadow | Box shadow (direction matches `side`) |
| `--compa11y-drawer-border` | — | Optional border on the panel edge |

---

### `<compa11y-slider>`

A single-thumb or range (two-thumb) slider with full keyboard support, pointer drag, and live region announcements.

#### What the library handles

| Feature | Details |
|---------|---------|
| **`role="slider"`** | Applied to each thumb element |
| **`aria-valuemin` / `aria-valuemax` / `aria-valuenow`** | Kept in sync with the current value after every change |
| **`aria-orientation`** | Set to `"horizontal"` or `"vertical"` |
| **`aria-disabled`** | Applied to thumbs when `disabled` attribute is present |
| **`aria-label`** | Each thumb receives its own label. In range mode, falls back to `"{label} minimum"` / `"{label} maximum"` |
| **Live region** | A `role="status" aria-live="polite"` region announces the new value after every change; always in the DOM |
| **Focus ring** | Applied via inline style on focus; CSS `forced-colors` media query ensures visibility in high-contrast mode |
| **Keyboard navigation** | See keyboard table below |
| **Pointer drag** | `setPointerCapture` keeps drag active when the pointer leaves the thumb; works with mouse and touch |
| **Track click** | Clicking the track sets value (range mode: moves the nearest thumb) |
| **Dev warnings** | Errors if no accessible label; warns if range mode is missing `min-thumb-label` / `max-thumb-label` |

#### Keyboard interactions

| Key | Action |
|-----|--------|
| `→` / `↑` | Increase value by one `step` |
| `←` / `↓` | Decrease value by one `step` |
| `Home` | Set to minimum value |
| `End` | Set to maximum value |
| `Page Up` | Increase by `large-step` |
| `Page Down` | Decrease by `large-step` |

#### Usage

```html
<!-- Single thumb -->
<compa11y-slider label="Volume" value="50" min="0" max="100"></compa11y-slider>

<!-- Discrete steps -->
<compa11y-slider label="Fan speed" value="2" min="1" max="5" step="1"></compa11y-slider>

<!-- Range -->
<compa11y-slider
  label="Price range"
  range
  min-value="20"
  max-value="80"
  min-thumb-label="Minimum price"
  max-thumb-label="Maximum price"
></compa11y-slider>

<!-- Vertical -->
<compa11y-slider label="Level" orientation="vertical" value="40"></compa11y-slider>

<!-- Disabled -->
<compa11y-slider label="Brightness" value="70" disabled></compa11y-slider>
```

**Events:**
- `compa11y-slider-change` — detail: `{ value: number }` (single-thumb)
- `compa11y-slider-range-change` — detail: `{ minValue: number, maxValue: number }` (range)

```js
document.querySelector('compa11y-slider').addEventListener('compa11y-slider-change', (e) => {
  console.log(e.detail.value);
});
```

#### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `label` | `string` | — | Visible label and base for thumb `aria-label` |
| `aria-label` | `string` | — | Hidden label on the thumb |
| `aria-labelledby` | `string` | — | ID of external label element |
| `value` | `number` | `50` | Current value (single-thumb mode) |
| `min` | `number` | `0` | Minimum value |
| `max` | `number` | `100` | Maximum value |
| `step` | `number` | `1` | Arrow-key step size |
| `large-step` | `number` | `10 % of range` | Page Up / Page Down step |
| `disabled` | boolean attr | absent | Disable all interaction |
| `range` | boolean attr | absent | Enable two-thumb range mode |
| `min-value` | `number` | `min` | Lower thumb value (range mode) |
| `max-value` | `number` | `max` | Upper thumb value (range mode) |
| `min-thumb-label` | `string` | `"{label} minimum"` | `aria-label` for the lower thumb |
| `max-thumb-label` | `string` | `"{label} maximum"` | `aria-label` for the upper thumb |
| `orientation` | `string` | `horizontal` | `horizontal` or `vertical` |

#### CSS Parts

`root` · `label` · `track` · `fill` · `thumb` · `thumb-0` · `thumb-1`

#### CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--compa11y-slider-track-bg` | `#e2e8f0` | Track background |
| `--compa11y-slider-track-size` | `4px` | Track thickness |
| `--compa11y-slider-fill-bg` | `#0066cc` | Filled range color |
| `--compa11y-slider-thumb-size` | `20px` | Thumb diameter |
| `--compa11y-slider-thumb-bg` | `#fff` | Thumb background |
| `--compa11y-slider-thumb-border` | `#0066cc` | Thumb border color |
| `--compa11y-focus-color` | `#0066cc` | Focus ring color |

---

### `<compa11y-progress-bar>`

Accessible progress bar web component. Communicates task progress to all users. Supports determinate and indeterminate modes.

#### What the library handles

| Feature | Details |
|---|---|
| **`role="progressbar"`** | Applied to the inner track element |
| **`aria-labelledby`** | Points to the visible `label` text |
| **`aria-valuemin` / `aria-valuemax` / `aria-valuenow`** | Set in determinate mode; omitted in indeterminate mode |
| **Milestone announcements** | `announcePolite()` fired when `value` crosses any threshold in `milestones`; emits `compa11y-progress-milestone` event |
| **Status announcements** | `"complete"` → `announcePolite`; `"error"` → `announceAssertive`; events `compa11y-progress-complete` / `compa11y-progress-error` |
| **Indeterminate animation** | CSS keyframe in shadow DOM; paused under `prefers-reduced-motion` |
| **`forced-colors`** | Track/fill use `ButtonFace` / `Highlight` system colors |
| **Dev warnings** | Error if `label` attribute is missing |

#### Attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | **Required.** Visible label and accessible name |
| `value` | `number` | absent | Current value; absent = indeterminate |
| `min` | `number` | `0` | Minimum value |
| `max` | `number` | `100` | Maximum value |
| `show-value` | boolean / `"false"` | auto | Show percentage text; defaults true when determinate |
| `status` | `active\|complete\|error` | `active` | Status of the operation |
| `status-text` | `string` | — | Visible message below the track |
| `milestones` | `string` | — | Comma-separated thresholds, e.g. `"25,50,75,100"` |
| `announce-label` | `string` | `label` | Override label used in announcements |

#### Events

- `compa11y-progress-milestone` — detail: `{ milestone, value, percent }`
- `compa11y-progress-complete` — detail: `{ label }`
- `compa11y-progress-error` — detail: `{ label }`

#### Usage

```html
<!-- Determinate -->
<compa11y-progress-bar
  label="Uploading invoice PDF"
  value="65"
  milestones="25,50,75,100"
  status-text="Uploading 3 of 10 files…"
></compa11y-progress-bar>

<!-- Indeterminate -->
<compa11y-progress-bar
  label="Loading reports"
  status-text="Fetching data from server…"
></compa11y-progress-bar>

<!-- Complete -->
<compa11y-progress-bar
  label="Video export"
  value="100"
  status="complete"
  status-text="Export ready"
></compa11y-progress-bar>
```

```js
// Programmatic update
const bar = document.querySelector('compa11y-progress-bar');
bar.value = 75;
bar.setAttribute('status-text', 'Almost done…');

bar.addEventListener('compa11y-progress-milestone', (e) => {
  console.log('Milestone reached:', e.detail.percent + '%');
});
```

#### CSS Custom Properties

| Property | Default | Description |
|---|---|---|
| `--compa11y-progress-bar-track-bg` | `#e2e8f0` | Track background |
| `--compa11y-progress-bar-track-size` | `8px` | Track height |
| `--compa11y-progress-bar-fill-bg` | `#0066cc` | Determinate fill |
| `--compa11y-progress-bar-fill-bg-complete` | `#22c55e` | Complete fill |
| `--compa11y-progress-bar-fill-bg-error` | `#ef4444` | Error fill |
| `--compa11y-progress-bar-label-color` | inherit | Label text color |
| `--compa11y-progress-bar-value-color` | `#555` | Value text color |
| `--compa11y-progress-bar-status-color` | `#555` | Status text color |
| `--compa11y-progress-bar-error-color` | `#ef4444` | Error status text |

---

### `<compa11y-skeleton>`

Accessible skeleton web component. Purely decorative — hidden from assistive technology. The surrounding container communicates loading state.

#### What the library handles

| Feature | Details |
|---|---|
| **`aria-hidden="true"`** | Applied to all inner shadow DOM content |
| **Not focusable** | No interactive content, no tabindex |
| **Shimmer animation** | CSS keyframe; replaced by opacity fade under `prefers-reduced-motion` |
| **High Contrast mode** | Shimmer hidden; border applied via `forced-colors` query |
| **Variants** | `text` · `circular` · `rectangular` |

#### Attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `variant` | `text\|circular\|rectangular` | `rectangular` | Shape of the placeholder |
| `width` | `string` | `100%` (circular: `40px`) | CSS width |
| `height` | `string` | `20px` (text: `1em`, circular: `40px`) | CSS height |
| `animated` | boolean / `"false"` | `true` | Enable shimmer animation |

#### Usage

```html
<!-- Basic shapes -->
<compa11y-skeleton variant="text" width="80%"></compa11y-skeleton>
<compa11y-skeleton variant="circular" width="48px" height="48px"></compa11y-skeleton>
<compa11y-skeleton variant="rectangular" height="200px"></compa11y-skeleton>

<!-- Card skeleton — container owns the a11y -->
<section aria-label="Loading article" aria-busy="true">
  <div aria-hidden="true">
    <compa11y-skeleton variant="rectangular" height="180px"></compa11y-skeleton>
    <compa11y-skeleton variant="text" width="55%"></compa11y-skeleton>
    <compa11y-skeleton variant="text"></compa11y-skeleton>
  </div>
</section>
```

#### CSS Custom Properties

| Property | Default | Description |
|---|---|---|
| `--compa11y-skeleton-bg` | `#e2e8f0` | Skeleton fill color |
| `--compa11y-skeleton-shimmer-color` | `rgba(255,255,255,0.6)` | Shimmer highlight |
| `--compa11y-skeleton-radius` | `6px` / `4px` for text | Border radius |

---

### `<compa11y-number-field>`

Accessible numeric input web component. Mirrors the React `NumberField` — same keyboard model, same spinbutton semantics, same validation behaviour.

#### What the library handles

| Feature | Details |
|---|---|
| **`role="spinbutton"`** | Set on the inner `<input>` |
| **`aria-valuenow/min/max`** | Kept in sync with the current committed value |
| **`aria-invalid`** | Set on validation error |
| **`aria-describedby`** | Links `hint` and `error` to the input |
| **`aria-required`** | Set when `required` attribute is present |
| **Keyboard navigation** | Arrow Up/Down step · Page Up/Down large step · Home/End min/max · Enter commit |
| **Commit on blur** | Parses, validates, snaps to step, commits value |
| **Stepper buttons** | When `show-steppers` present: −/+ buttons, 44×44 px minimum, auto-disabled at bounds |
| **Validation errors** | Announced assertively via `aria-live="assertive"` region |
| **`inputMode`** | `"numeric"` for integer steps, `"decimal"` for fractional |
| **High Contrast** | Borders use system `ButtonText` / `FieldText` tokens |
| **Reduced motion** | All transitions removed |
| **Dev warnings** | Missing label, `min ≥ max` |

#### Attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | **Required** (or `aria-label`/`aria-labelledby`). Visible label text |
| `hint` | `string` | — | Description linked via `aria-describedby` |
| `error` | `string` | — | External error message — takes priority over internal validation |
| `value` | `string` (number) | — | Current value |
| `min` | `string` (number) | — | Minimum allowed value |
| `max` | `string` (number) | — | Maximum allowed value |
| `step` | `string` (number) | `1` | Arrow-key / stepper increment |
| `large-step` | `string` (number) | `step × 10` | Page Up / Down increment |
| `show-steppers` | boolean | `false` | Show −/+ stepper buttons |
| `disabled` | boolean | `false` | Disable all interaction |
| `readonly` | boolean | `false` | Make field read-only |
| `required` | boolean | `false` | Mark field as required |
| `placeholder` | `string` | — | Input placeholder |
| `name` | `string` | — | Name for form submission |
| `aria-label` | `string` | — | Accessible name (no visible label) |
| `aria-labelledby` | `string` | — | ID of external labelling element |

#### Events

| Event | `detail` | When |
|---|---|---|
| `compa11y-number-field-change` | `{ value: number \| undefined }` | Value committed (blur or Enter) |
| `compa11y-number-field-input` | `{ rawValue: string }` | Each keystroke |

#### Usage

```html
<compa11y-number-field
  label="Quantity"
  value="1"
  min="1"
  max="99"
  step="1"
  show-steppers
  hint="Maximum 99 units per order."
></compa11y-number-field>
```

```js
document.querySelector('compa11y-number-field')
  .addEventListener('compa11y-number-field-change', (e) => {
    console.log(e.detail.value); // number | undefined
  });
```

---

### SearchField

**Type:** 2 — Stateful

**Component:** `<SearchField>` / `<compa11y-search-field>`

An accessible search input that supports **both** submit-on-Enter and live filter-as-you-type patterns simultaneously. The input is wrapped in a `<form role="search">` landmark, provides a keyboard-accessible clear button, and announces result count changes to screen readers via a polite live region (debounced 300 ms to avoid per-keystroke spam).

#### Accessibility design decisions

**Search landmark** — The `<form role="search">` wrapper lets screen reader users navigate directly to the search area using landmark shortcuts (F6, Ctrl+F8 in JAWS, etc.).

**`type="search"`** — Signals to mobile browsers to show a search-optimised keyboard. The browser's native ❌ cancel button is suppressed via `appearance: none` so only the custom accessible clear button is shown.

**Results count announcements** — When `resultsCount` changes, the component announces "N results" / "1 result" / "No results" via `announcePolite()`. The announcement is debounced 300 ms so rapid keystrokes produce a single announcement, not a stream of them.

**Clear button** — Only rendered when there is text and the field is not disabled. After clearing, focus is programmatically returned to the input (WCAG 2.4.3 Focus Order).

**Loading state** — `isLoading` triggers `useAnnounceLoading`, which announces "Searching…" when loading starts and "Search complete" when it ends.

**Label** — A real `<label htmlFor>` is generated from the `label` prop. Placeholder text is never used as the only label.

#### API

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | Visible label (required unless `aria-label` or `aria-labelledby` provided) |
| `aria-label` | `string` | — | Hidden accessible name when no visible label |
| `aria-labelledby` | `string` | — | ID of external labelling element |
| `value` | `string` | — | Controlled value |
| `defaultValue` | `string` | `''` | Uncontrolled initial value |
| `onChange` | `(value: string) => void` | — | Called on every keystroke |
| `onSubmit` | `(value: string) => void` | — | Called on Enter or Search button click |
| `onClear` | `() => void` | — | Called when field is cleared |
| `clearLabel` | `string` | `'Clear search'` | Accessible label for the clear button |
| `showSearchButton` | `boolean` | `false` | Render a visible Search submit button |
| `searchButtonLabel` | `string` | `'Search'` | Label for the submit button |
| `resultsCount` | `number` | — | Current results count; triggers SR announcement when it changes |
| `resultsLabel` | `string` | — | Custom announcement string (replaces auto "N results") |
| `isLoading` | `boolean` | `false` | Shows spinner; announces loading/complete to SR |
| `disabled` | `boolean` | `false` | Disables the entire field |
| `placeholder` | `string` | — | Placeholder text (not used as label) |
| `hint` | `ReactNode` | — | Helper text linked via `aria-describedby` |
| `error` | `ReactNode` | — | Error message; sets `aria-invalid="true"` |
| `autoFocus` | `boolean` | — | Focus input on mount |
| `maxLength` | `number` | — | Maximum character length |
| `name` | `string` | — | Input name for form submission |
| `style` | `CSSProperties` | — | Inline styles on the root wrapper |
| `className` | `string` | — | CSS class on the root wrapper |
| `unstyled` | `boolean` | `false` | Strip all built-in styles |

#### Keyboard behaviour

| Key | Action |
|---|---|
| `Enter` | Calls `onSubmit` |
| `Tab` | Moves to clear button (if visible), then submit button |
| `Enter` / `Space` on clear button | Clears field and returns focus to input |
| `Enter` / `Space` on submit button | Triggers form submit |

#### React usage

```tsx
import { SearchField } from '@compa11y/react';

// Filter-as-you-type
<SearchField
  label="Search fruits"
  value={query}
  onChange={setQuery}
  resultsCount={filtered.length}
/>

// Submit pattern
<SearchField
  label="Search products"
  value={query}
  onChange={setQuery}
  onSubmit={runSearch}
  isLoading={isLoading}
  showSearchButton
/>

// Both patterns simultaneously
<SearchField
  label="Search"
  value={query}
  onChange={setQuery}
  onSubmit={runSearch}
  resultsCount={results.length}
  isLoading={isLoading}
  hint="Press Enter or click Search."
/>
```

#### CSS custom properties

```css
compa11y-search-field {
  --compa11y-search-field-bg: white;
  --compa11y-search-field-border: 1px solid #ccc;
  --compa11y-search-field-border-focus: #0066cc;
  --compa11y-search-field-border-error: #ef4444;
  --compa11y-search-field-radius: 4px;
  --compa11y-search-field-disabled-bg: #f5f5f5;
  --compa11y-search-field-label-color: inherit;
  --compa11y-search-field-label-size: 0.875rem;
  --compa11y-search-field-label-weight: 500;
  --compa11y-search-field-font-size: 0.875rem;
  --compa11y-search-field-hint-color: #666;
  --compa11y-search-field-error-color: #ef4444;
  --compa11y-search-field-icon-color: #777;
  --compa11y-search-field-clear-color: #777;
  --compa11y-search-field-btn-bg: #0066cc;
  --compa11y-search-field-btn-color: white;
  --compa11y-focus-color: #0066cc;
}
```

#### Web Component usage

```html
<!-- Filter-as-you-type -->
<compa11y-search-field
  id="sf"
  label="Search fruits"
  placeholder="e.g. berry"
></compa11y-search-field>

<!-- Submit pattern -->
<compa11y-search-field
  label="Search products"
  hint="Press Enter or click Search."
  show-search-button
></compa11y-search-field>
```

```js
const sf = document.getElementById('sf');

// Fires on every keystroke
sf.addEventListener('compa11y-search-field-change', (e) => {
  const filtered = items.filter(i => i.includes(e.detail.value));
  sf.setAttribute('results-count', String(filtered.length));
});

// Fires on Enter / Search button
sf.addEventListener('compa11y-search-field-submit', (e) => {
  console.log('Search:', e.detail.value);
  sf.setAttribute('is-loading', '');
  fetch('/search?q=' + encodeURIComponent(e.detail.value))
    .then(() => sf.removeAttribute('is-loading'));
});

// Fires when cleared
sf.addEventListener('compa11y-search-field-clear', () => {
  console.log('Cleared');
});
```

#### SearchField vs Combobox

| Use SearchField | Use Combobox |
|---|---|
| Results are elsewhere on the page / fetched separately | Suggestions appear in an inline dropdown as you type |
| Simple text input + submit or live filter | Arrow keys navigate a popup listbox |
| No inline suggestion selection | User selects a suggestion to populate the field |

---

### ErrorSummary

**Type:** 2 — Stateful (focus management)

**Component:** `<ErrorSummary>` / `<compa11y-error-summary>`

An accessible error summary that displays a list of validation or system errors with navigation links to the relevant form fields. Two variants serve different use cases:

- **Form variant** (default) — Appears at the top of a form after a failed submission. Auto-focuses the container so screen readers announce it immediately. Each error links to its corresponding field.
- **Page variant** — For system/page-level errors (save failed, network error). Uses `role="alert"` for assertive screen reader announcement. Supports action buttons (Retry, Dismiss).

#### Accessibility design decisions

**Form variant — no `role="alert"`** — When `autoFocus` is enabled (the default for form variant), the container receives programmatic focus via `tabIndex={-1}`. Screen readers announce the focused element's content, so adding `role="alert"` would cause double-announcement (once from focus, once from the live region). The component relies solely on focus for announcement, following the GOV.UK Error Summary pattern.

**Page variant — `role="alert"`** — Page-level errors may appear asynchronously (e.g., after a failed API call) when the user's focus is elsewhere. `role="alert"` (assertive) ensures the error is announced immediately regardless of focus position.

**Error links** — Each error with a `fieldId` renders as `<a href="#fieldId">`. The click handler calls `preventDefault()` + `document.getElementById(fieldId).focus()`, which explicitly moves keyboard focus to the target field. Native hash navigation scrolls but does not guarantee focus.

**Real heading** — The title uses a real `<h2>` (configurable via `headingLevel`) so screen reader users can navigate to it via heading shortcuts.

**Touch targets** — All interactive elements (error links, dismiss button) maintain a minimum 44×44px touch target per WCAG 2.5.5.

#### What the library handles

| Feature | Details |
|---------|---------|
| **`tabIndex={-1}`** | Set on the container for programmatic focus (form variant) |
| **`role="alert"`** | Set on the container for page variant (assertive announcement) |
| **`role="status"`** | Set when `announce="polite"` |
| **`aria-labelledby`** | Points to the heading element (auto-generated ID) |
| **`aria-label`** | Forwarded if provided; overrides `aria-labelledby` |
| **Auto-focus** | Focuses the container on mount (form variant default) |
| **Error links** | `<a href="#fieldId">` with click handler that focuses the target field |
| **Dismiss button** | `aria-label="Dismiss error summary"` |
| **Heading level** | Configurable 1–6 (default: 2) |
| **Dev warnings** | Warns when errors array is empty, or form errors are missing `fieldId` |

#### API

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `string` | `'There is a problem'` | Heading text |
| `description` | `string` | — | Supporting text below the heading |
| `errors` | `ErrorSummaryError[]` | — | **Required.** Array of `{ message, fieldId? }` |
| `variant` | `'form' \| 'page'` | `'form'` | Determines a11y behavior |
| `headingLevel` | `1–6` | `2` | Heading level for the title |
| `autoFocus` | `boolean` | `true` (form) / `false` (page) | Focus the summary on mount |
| `announce` | `'off' \| 'polite' \| 'assertive'` | `'off'` (form) / `'assertive'` (page) | Live region behavior |
| `actions` | `ReactNode` | — | Action buttons (Retry, Dismiss, etc.) |
| `onDismiss` | `() => void` | — | Renders a dismiss button; called on click |
| `ariaLabel` | `string` | — | Custom accessible name |
| `unstyled` | `boolean` | `false` | Strip default inline styles |

#### Usage — React

```tsx
// Form validation (auto-focuses, links to fields)
<ErrorSummary
  title="There are 3 problems with your submission"
  errors={[
    { message: 'Enter your first name', fieldId: 'first-name' },
    { message: 'Enter a valid email address', fieldId: 'email' },
    { message: 'Accept the terms and conditions', fieldId: 'terms' },
  ]}
/>

// Page/system error (role="alert", actions)
<ErrorSummary
  variant="page"
  title="Something went wrong"
  description="We could not save your changes."
  errors={[{ message: 'Server error: connection timed out' }]}
  actions={<Button onClick={handleRetry}>Retry</Button>}
  onDismiss={() => setVisible(false)}
/>
```

#### `<compa11y-error-summary>`

| Attribute | Type | Default | Description |
|---|---|---|---|
| `title` | `string` | `'There is a problem'` | Heading text |
| `description` | `string` | — | Supporting paragraph text |
| `variant` | `'form' \| 'page'` | `'form'` | Determines a11y behavior |
| `heading-level` | `number` | `2` | Heading level 1–6 |
| `auto-focus` | `boolean` | `true` (form) / `false` (page) | Focus on connect |
| `announce` | `'off' \| 'polite' \| 'assertive'` | `'off'` (form) / `'assertive'` (page) | Live region mode |
| `errors` | `string` (JSON) | — | JSON array of `{ message, fieldId? }` |
| `dismissible` | `boolean` | `false` | Show dismiss button |

| Slot | Description |
|---|---|
| `actions` | Action buttons (Retry, Dismiss, etc.) |

| Event | Detail | Description |
|---|---|---|
| `compa11y-error-summary-dismiss` | — | Dismiss button clicked |
| `compa11y-error-summary-link-click` | `{ fieldId, message }` | Error link clicked |

| JS Property | Type | Description |
|---|---|---|
| `errorsData` | `{ message: string, fieldId?: string }[]` | Get/set errors programmatically |

#### Usage — Web Component

```html
<!-- Form validation -->
<compa11y-error-summary
  title="There are 2 problems"
  errors='[{"message":"Enter your name","fieldId":"name"},{"message":"Enter your email","fieldId":"email"}]'
></compa11y-error-summary>

<!-- Page/system error with actions -->
<compa11y-error-summary
  variant="page"
  title="Something went wrong"
  description="We could not save your changes."
  errors='[{"message":"Server error: connection timed out"}]'
  dismissible
>
  <div slot="actions">
    <button>Retry</button>
  </div>
</compa11y-error-summary>
```

#### CSS custom properties

| Property | Default | Description |
|---|---|---|
| `--compa11y-error-summary-bg` | `white` | Background color |
| `--compa11y-error-summary-border` | `1px solid #e0e0e0` | Border |
| `--compa11y-error-summary-accent-color` | `#ef4444` | Left border accent |
| `--compa11y-error-summary-radius` | `6px` | Border radius |
| `--compa11y-error-summary-padding` | `1rem 1.25rem` | Padding |
| `--compa11y-error-summary-title-size` | `1.125rem` | Title font size |
| `--compa11y-error-summary-title-weight` | `600` | Title font weight |
| `--compa11y-error-summary-title-color` | `inherit` | Title color |
| `--compa11y-error-summary-link-color` | `#ef4444` | Error link color |
| `--compa11y-error-summary-link-hover-color` | `#dc2626` | Error link hover color |
| `--compa11y-error-summary-dismiss-color` | `#999` | Dismiss button color |
| `--compa11y-focus-color` | `#0066cc` | Focus outline color (shared) |

---

### Stepper

**Type:** 2 — Stateful (dual-mode: progress indicator + step navigation)

**Component:** `<Stepper>` / `<compa11y-stepper>`

An accessible stepper / progress-steps component that supports two explicit modes:

- **Progress mode** (`mode="progress"`) — Non-interactive indicator. Steps are rendered as plain text inside `<ol><li>`. Answers "Where am I in the flow?" without any clickable elements.
- **Navigation mode** (`mode="navigation"`) — Interactive. Steps are `<button>` elements that users can click to jump between steps. Supports gating via `locked` state.

#### Accessibility design decisions

**Two modes, not one** — Progress indicators and step navigation have fundamentally different a11y expectations. A progress indicator is content (no keyboard interaction); a step navigator is a set of controls. The `mode` prop makes this explicit rather than letting consumers accidentally ship interactive-looking steps that aren't keyboard accessible.

**`<nav>` + `<ol>` baseline** — Both modes wrap steps in a `<nav aria-label>` landmark containing an ordered list. Screen reader users can jump to it via landmark navigation and understand the step sequence from the list semantics.

**`aria-current="step"`** — The current step is marked with `aria-current="step"` (not `aria-selected`, which implies a different widget contract). This works in both modes.

**Plain text in progress mode** — Steps are `<span>` text, not disabled buttons. Disabled buttons are still "controls" conceptually and confuse screen reader users when there's no intention for interaction.

**`<button>` in navigation mode** — Steps that change in-page content use `<button>`, not `<div>` with click handlers. This provides native keyboard support (Tab + Enter/Space) and correct screen reader announcements.

**Locked steps use native `disabled`** — Rather than `aria-disabled` on a `<button>`, which still receives focus, locked steps use the native `disabled` attribute to remove them from the tab order entirely.

**SR-only state suffixes** — Each step includes a visually hidden suffix like "(completed)", "(current step)", "(error)", "(locked)" so screen reader users don't rely on color/icons alone.

**No roving tabindex** — Steps use standard Tab navigation, not arrow keys. Per the spec, roving tabindex is for widgets like tablists, menus, and radio groups. A stepper is a flat set of buttons/links — Tab is the correct model.

**Live region announcements** — Step changes are announced via a pre-mounted `role="status"` live region ("Step 2 of 5: Payment"). The region is always in the DOM; only its text content changes.

#### What the library handles

| Feature | Details |
|---------|---------|
| **`<nav aria-label>`** | Landmark wrapper with required label |
| **`<ol>` list** | Ordered list conveys step sequence |
| **`aria-current="step"`** | Set on the current step |
| **`disabled`** | Set on locked steps (navigation mode) |
| **SR-only state text** | "(completed)", "(current step)", "(error)", "(locked)" |
| **Live region** | Pre-mounted, announces step transitions |
| **Controlled + uncontrolled** | `currentStepId` + `defaultStepId` |
| **Orientation** | `horizontal` (default) / `vertical` |
| **Step count** | Optional "Step X of Y" display |
| **Dev warnings** | Missing `ariaLabel`, empty steps, invalid `currentStepId`, duplicate IDs |

#### Step states

| State | Meaning | Navigation mode behavior |
|-------|---------|--------------------------|
| `upcoming` | Not yet reached | Clickable (unless gated by consumer logic) |
| `current` | Active step | Marked with `aria-current="step"` |
| `completed` | Previously finished | Clickable, shows checkmark |
| `error` | Has validation problem | Clickable, shows error indicator |
| `locked` | Cannot access | `disabled` button, removed from tab order |

#### API

| Prop | Type | Default | Description |
|---|---|---|---|
| `ariaLabel` | `string` | — | **Required.** Accessible name for the `<nav>` |
| `mode` | `'progress' \| 'navigation'` | — | **Required.** Component behavior mode |
| `steps` | `StepItem[]` | — | **Required.** Array of step objects |
| `currentStepId` | `string` | — | Controlled current step |
| `defaultStepId` | `string` | — | Uncontrolled initial step |
| `onStepSelect` | `(stepId: string) => void` | — | Called when a step is clicked (navigation mode) |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Layout direction |
| `showStepCount` | `boolean` | `false` | Show "Step X of Y" text |
| `renderIcon` | `(step, index) => ReactNode` | — | Custom icon renderer (wrapped `aria-hidden`) |
| `getA11yLabel` | `(step, index, total) => string` | — | Custom SR label override |
| `disabled` | `boolean` | `false` | Disable all steps (navigation mode) |
| `unstyled` | `boolean` | `false` | Strip default inline styles |

#### Usage — React

```tsx
import { Stepper, type StepItem } from '@compa11y/react';

// Progress indicator (read-only)
const steps: StepItem[] = [
  { id: 'shipping', label: 'Shipping', state: 'completed' },
  { id: 'payment', label: 'Payment' },
  { id: 'review', label: 'Review' },
];

<Stepper
  ariaLabel="Checkout progress"
  mode="progress"
  steps={steps}
  currentStepId="payment"
  showStepCount
/>

// Interactive navigation
<Stepper
  ariaLabel="Checkout steps"
  mode="navigation"
  steps={[
    { id: 'shipping', label: 'Shipping', state: 'completed' },
    { id: 'payment', label: 'Payment', description: 'Enter details' },
    { id: 'review', label: 'Review', state: 'upcoming' },
    { id: 'confirm', label: 'Confirm', state: 'locked' },
  ]}
  currentStepId={currentStep}
  onStepSelect={(id) => setCurrentStep(id)}
/>

// Vertical with error state
<Stepper
  ariaLabel="Profile setup"
  mode="navigation"
  steps={[
    { id: 'account', label: 'Account', state: 'completed' },
    { id: 'profile', label: 'Profile', state: 'error' },
    { id: 'settings', label: 'Settings' },
  ]}
  currentStepId="profile"
  orientation="vertical"
  onStepSelect={handleStep}
/>
```

#### Usage — Web Component

```html
<!-- Progress indicator -->
<compa11y-stepper
  aria-label="Checkout progress"
  mode="progress"
  current-step="payment"
  show-step-count
  steps='[
    {"id":"shipping","label":"Shipping","state":"completed"},
    {"id":"payment","label":"Payment"},
    {"id":"review","label":"Review"}
  ]'
></compa11y-stepper>

<!-- Interactive navigation -->
<compa11y-stepper
  id="checkout-steps"
  aria-label="Checkout steps"
  mode="navigation"
  current-step="payment"
  steps='[
    {"id":"shipping","label":"Shipping","state":"completed"},
    {"id":"payment","label":"Payment"},
    {"id":"confirm","label":"Confirm","state":"locked"}
  ]'
></compa11y-stepper>

<script>
  document.getElementById('checkout-steps')
    .addEventListener('compa11y-stepper-select', (e) => {
      e.target.setAttribute('current-step', e.detail.stepId);
    });
</script>
```

#### Web Component attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `aria-label` | `string` | Accessible name for the nav landmark |
| `mode` | `'progress' \| 'navigation'` | Component behavior mode |
| `steps` | JSON string | Array of step objects |
| `current-step` | `string` | Current step ID |
| `orientation` | `'horizontal' \| 'vertical'` | Layout direction |
| `disabled` | boolean attr | Disable all steps |
| `show-step-count` | boolean attr | Show "Step X of Y" |

#### Web Component events

| Event | Detail | Description |
|-------|--------|-------------|
| `compa11y-stepper-select` | `{ stepId: string }` | Fired when a step is clicked (navigation mode) |

#### CSS custom properties

| Property | Default | Description |
|----------|---------|-------------|
| `--compa11y-stepper-indicator-size` | `32px` | Step circle size |
| `--compa11y-stepper-indicator-bg-upcoming` | `#e2e8f0` | Upcoming step background |
| `--compa11y-stepper-indicator-bg-current` | `#0066cc` | Current step background |
| `--compa11y-stepper-indicator-bg-completed` | `#22c55e` | Completed step background |
| `--compa11y-stepper-indicator-bg-error` | `#ef4444` | Error step background |
| `--compa11y-stepper-indicator-bg-locked` | `#94a3b8` | Locked step background |
| `--compa11y-stepper-indicator-border-current` | `#0066cc` | Current step border |
| `--compa11y-stepper-connector-bg` | `#e2e8f0` | Connector line color |
| `--compa11y-stepper-connector-bg-completed` | `#22c55e` | Completed connector color |
| `--compa11y-stepper-label-size` | `0.875rem` | Label font size |
| `--compa11y-stepper-label-color-locked` | `#94a3b8` | Locked label color |
| `--compa11y-stepper-label-color-error` | `#ef4444` | Error label color |
| `--compa11y-stepper-description-size` | `0.75rem` | Description font size |
| `--compa11y-stepper-description-color` | `#64748b` | Description color |
| `--compa11y-stepper-btn-radius` | `8px` | Button border radius |
| `--compa11y-stepper-btn-hover-bg` | `rgba(0,0,0,0.04)` | Button hover background |
| `--compa11y-focus-color` | `#0066cc` | Focus outline color (shared) |

---

### TimePicker

**Component:** `<TimePicker>` / `<compa11y-time-picker>`

**Type:** Stateful (Type 2) — input + popup listbox (combobox pattern)

**ARIA Pattern:** Combobox with listbox popup ([WAI-ARIA Combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/))

**Semantics:**

| Element | Role / Attribute | Purpose |
|---|---|---|
| Text input | `role="combobox"`, `aria-expanded`, `aria-haspopup="listbox"`, `aria-autocomplete="list"` | Primary time entry field |
| Input (active) | `aria-activedescendant` | Points to highlighted option |
| Input (invalid) | `aria-invalid="true"`, `aria-describedby` → error | Links error message |
| Trigger button | `aria-label="Choose time"`, `aria-expanded` | Opens/closes popup |
| Clear button | `aria-label="Clear time"`, `tabIndex={-1}` | Clears current value |
| Popup list | `role="listbox"`, `aria-labelledby` | Time suggestions |
| Time option | `role="option"`, `aria-selected`, `aria-disabled` | Individual time choice |
| Hint text | `id` linked via `aria-describedby` | Format guidance |
| Error message | `role="alert"` | Validation feedback |

**Keyboard:**

| Key | Context | Action |
|---|---|---|
| `ArrowDown` | Input (closed) | Open popup, highlight first option |
| `ArrowDown` | Input (open) | Move highlight to next non-disabled option |
| `ArrowUp` | Input (closed) | Open popup, highlight last option |
| `ArrowUp` | Input (open) | Move highlight to previous non-disabled option |
| `Enter` | Input (open) | Select highlighted option |
| `Enter` | Input (closed) | Commit typed value (parse + validate) |
| `Escape` | Input (open) | Close popup (value unchanged) |
| `Tab` | Input (open) | Close popup, move focus naturally |
| `Home` | Input (open) | Highlight first non-disabled option |
| `End` | Input (open) | Highlight last non-disabled option |
| Free typing | Input | Filters time list; accepts formats: "2:30 PM", "14:30", "2pm", "2:30p" |

**Focus Management:**
- After selecting an option, focus returns to input
- After clearing, focus returns to input
- Trigger button opens popup and moves focus to input

**Announcements:**
- On popup open: "`N` times available" (polite)
- On option select: "`time` selected" (polite)
- Validation errors: `role="alert"` (assertive)

**Validation:**
- Format validation on blur/Enter (specific messages per `hourCycle`)
- Range validation against `minTime`/`maxTime` with descriptive error
- `aria-invalid="true"` set on input; error linked via `aria-describedby`

**12h / 24h:**
- `hourCycle={12}`: Accepts "2pm", "2:30 PM", "2:30p"; displays "H:MM AM/PM"
- `hourCycle={24}`: Accepts "14:30", "9:05"; displays "HH:MM"
- Hint text auto-generated: "Format: H:MM AM/PM" or "Format: HH:MM (24h)"

**Dev Warnings:**
- Missing accessible label (`label`, `aria-label`, or `aria-labelledby`)

**CSS Custom Properties:**

| Token | Default | Purpose |
|---|---|---|
| `--compa11y-time-picker-bg` | `#fff` | Input background |
| `--compa11y-time-picker-border` | `#ccc` | Input/trigger border |
| `--compa11y-time-picker-radius` | `4px` | Border radius |
| `--compa11y-time-picker-font-size` | `1rem` | Input font size |
| `--compa11y-time-picker-label-color` | `inherit` | Label text color |
| `--compa11y-time-picker-label-size` | `0.875rem` | Label font size |
| `--compa11y-time-picker-hint-color` | `#666` | Hint text color |
| `--compa11y-time-picker-error-color` | `#d32f2f` | Error text color |
| `--compa11y-time-picker-listbox-bg` | `#fff` | Popup background |
| `--compa11y-time-picker-listbox-border` | `#ccc` | Popup border |
| `--compa11y-time-picker-listbox-shadow` | `0 4px 12px rgba(0,0,0,0.15)` | Popup shadow |
| `--compa11y-time-picker-option-highlight-bg` | `#e8f0fe` | Highlighted option background |
| `--compa11y-time-picker-option-selected-bg` | `#f0f0f0` | Selected option background |
| `--compa11y-focus-color` | `#2563eb` | Focus outline (shared) |

---

### DatePicker

**Component:** `<DatePicker>` / `<compa11y-date-picker>`

**Type:** Compound (Type 3) + Stateful (Type 2)

**Modes:** Single date, date range, date-only, datetime (12h/24h), popover, modal

**ARIA Pattern:** Dialog + Grid (calendar), Spinbutton (time fields)

**Semantics:**
- Text input with `inputmode="numeric"` for direct date entry
- Trigger button: `aria-haspopup="dialog"`, `aria-expanded`, `aria-controls`
- Calendar overlay: `role="dialog"`, `aria-modal` (true for modal, false for popover)
- Day grid: `<table>` with `role="grid"`, `<th scope="col">` for weekday headers
- Day buttons: `aria-label` with full date + state ("Saturday, March 7, 2026, today, selected")
- Today: `aria-current="date"`
- Selected (single): `aria-pressed="true"`
- Range start/end: `aria-selected="true"` + SR-only "start date"/"end date"
- Range days: SR-only "in selected range"
- Disabled days: native `disabled` attribute
- Time inputs: `inputmode="numeric"`, `aria-label="Hour"/"Minute"`
- AM/PM: `role="group"` with `aria-label="AM/PM"`, buttons with `aria-pressed`
- Range mode: `<fieldset>` + `<legend>` wrapping start/end inputs

**Keyboard Contract:**
| Key | Action |
|---|---|
| `Enter`/`Space` on trigger | Open calendar |
| `ArrowLeft`/`ArrowRight` | Previous/next day |
| `ArrowUp`/`ArrowDown` | Previous/next week |
| `Home`/`End` | Start/end of week |
| `PageUp`/`PageDown` | Previous/next month |
| `Shift+PageUp`/`Shift+PageDown` | Previous/next year |
| `Enter`/`Space` on day | Select focused day |
| `Escape` | Close calendar, return focus to trigger |
| `ArrowUp`/`ArrowDown` on time input | Increment/decrement hour/minute |
| Arrow keys in month/year grid | Navigate cells |
| `Enter`/`Space` in month/year | Select and return to day view |
| `Escape` in month/year view | Return to day view |

**Focus Management:**
- On open: focus moves to selected date (or today if none)
- Roving tabindex: one day button `tabIndex=0`, all others `-1`
- Tab moves between calendar controls (nav buttons, time fields, actions)
- Modal: focus trapped within dialog
- On close: focus returns to trigger button
- Disabled dates: skipped during arrow key navigation

**Announcements:**
- Month changes announced via live region
- Date selection: "Date selected: [full date label]"
- Range: "Range start: [date]" / "Range end: [date]"
- Clear: "Selection cleared"
- Calendar open/close announced politely

**Standalone Sub-components:**
- `<Calendar>` — usable independently with own label, mode, value
- `<TimeField>` — usable independently with own label, hourCycle, AM/PM

**Dev Warnings:**
- Missing accessible label (no `label` or `aria-label`)
- `minDate` after `maxDate`

---

### DataGrid

**Component:** `<DataGrid>` / `<compa11y-data-grid>`
**Type:** Type 3 (Compound) + Type 2 (Stateful) — dual mode: table (default) and ARIA grid
**Pattern:** [WAI-ARIA Data Grid](https://www.w3.org/WAI/ARIA/apg/patterns/grid/)

#### When to use which mode

| Use **table mode** (default) | Use **grid mode** |
|---|---|
| Content is mostly read-only | Need cell-level arrow-key navigation |
| Interactions limited to sorting/selection/pagination | Support inline cell editing |
| Best screen reader compat — native `<table>` semantics | Spreadsheet-like behavior required |

#### Automatic ARIA

| Feature | What's applied |
|---|---|
| **Table structure** | Native `<table>`, `<thead>`, `<tbody>`, `<th scope="col/row">`, `<td>` |
| **Caption** | `<caption>` element for table mode; `aria-label` on grid wrapper for grid mode |
| **Sorting** | `aria-sort="ascending\|descending\|none"` on `<th>`, sort button with accessible label |
| **Selection** | `aria-selected` on `<tr>`, real `<input type="checkbox">` with `aria-label="Select {name}"` |
| **Select all** | Checkbox with `aria-label="Select all rows"`, auto indeterminate state |
| **Loading** | `aria-busy="true"` on table/grid while loading |
| **Grid mode** | `role="grid"`, `role="row"`, `role="columnheader"`, `role="gridcell"` on grid wrapper |
| **Grid row count** | `aria-rowcount` and `aria-colcount` on grid; `aria-rowindex` on paginated rows |
| **Error state** | `role="alert"` on error cell |

#### Keyboard

**Table mode** — standard Tab navigation:

| Key | Action |
|---|---|
| `Tab` | Moves between interactive elements: sort buttons, checkboxes, pagination buttons |

**Grid mode** — arrow key cell navigation:

| Key | Action |
|---|---|
| `Arrow keys` | Move focus cell-to-cell (up/down/left/right) |
| `Home` / `End` | Jump to first/last cell in current row |
| `Ctrl+Home` / `Ctrl+End` | Jump to first/last cell in entire grid |
| `PageUp` / `PageDown` | Jump by page size rows |
| `Enter` / `F2` | Enter edit mode on editable cell |
| `Escape` | Cancel editing, return to cell navigation |
| `Space` | Toggle row selection (when selectable) |

#### Screen Reader Announcements

| Event | Announcement |
|---|---|
| Sort column activated | `"{Column} sorted ascending"` / `"sort cleared"` |
| Rows selected | `"3 rows selected"` / `"Selection cleared"` |
| Select all | `"All 12 rows selected"` |
| Page changed | `"Page 2 of 5"` |
| Page size changed | `"Showing 25 rows per page"` |
| Cell edited | `"Cell updated"` |
| Loading starts | `"Loading data..."` |
| Loading ends | `"Data loaded"` |

#### Focus Management

| Scenario | Behavior |
|---|---|
| Sort header clicked | Focus preserved on sort button across re-renders |
| Grid cell click | Cell receives focus, becomes active for arrow navigation |
| Enter edit mode | Input auto-focused inside cell |
| Exit edit mode | Focus returns to the cell |

#### Dev Warnings

| Condition | Warning |
|---|---|
| No `caption`, `aria-label`, or `aria-labelledby` | `"DataGrid must have an accessible name..."` |
| `selectable` but rows missing `id` field | `"Each row object must have an id field"` |
| Editable columns without `onCellEdit` handler | Info: `"Columns are marked editable but no onCellEdit handler is provided"` |

#### Usage (React)

```tsx
import { DataGrid, type DataGridColumnDef } from '@compa11y/react';

interface Invoice {
  id: string;
  number: string;
  client: string;
  amount: string;
}

const columns: DataGridColumnDef<Invoice>[] = [
  { id: 'number', header: 'Invoice #', accessor: 'number', sortable: true, rowHeader: true },
  { id: 'client', header: 'Client', accessor: 'client', sortable: true },
  { id: 'amount', header: 'Amount', accessor: 'amount', sortable: true, align: 'right' },
];

// Table mode (default) — native <table>
<DataGrid
  columns={columns}
  rows={invoices}
  caption="Invoices for March 2026"
  selectable
  selectedRows={selected}
  onSelectionChange={setSelected}
  sortKey={sortKey}
  sortDirection={sortDir}
  onSortChange={(key, dir) => { setSortKey(key); setSortDir(dir); }}
  page={page}
  pageSize={10}
  onPageChange={setPage}
  striped
/>

// Grid mode — ARIA grid with arrow key navigation
<DataGrid
  columns={columns.map(c => ({ ...c, editable: true }))}
  rows={invoices}
  caption="Editable invoices"
  mode="grid"
  onCellEdit={(rowId, colId, value) => handleEdit(rowId, colId, value)}
/>
```

#### Usage (Web Component)

```html
<compa11y-data-grid
  id="my-grid"
  caption="Invoices"
  selectable
  page="1"
  page-size="10"
></compa11y-data-grid>

<script>
  const grid = document.querySelector('#my-grid');
  grid.columns = [
    { key: 'number', label: 'Invoice #', sortable: true, rowHeader: true },
    { key: 'client', label: 'Client', sortable: true },
  ];
  grid.rows = [
    { id: '1', number: 'INV-001', client: 'Acme Corp' },
  ];

  grid.addEventListener('compa11y-datagrid-sort', (e) => {
    console.log(e.detail); // { sortKey, sortDirection }
  });
  grid.addEventListener('compa11y-datagrid-select', (e) => {
    console.log(e.detail); // { selectedRows: string[] }
  });
  grid.addEventListener('compa11y-datagrid-page', (e) => {
    console.log(e.detail); // { page }
  });
  grid.addEventListener('compa11y-datagrid-cell-edit', (e) => {
    console.log(e.detail); // { rowId, columnId, value }
  });
</script>
```

#### Props (React)

| Prop | Type | Default | Description |
|---|---|---|---|
| `columns` | `DataGridColumnDef<T>[]` | — | Column definitions (required) |
| `rows` | `T[]` | — | Row data with `id` field (required) |
| `caption` | `string` | — | Accessible name (required) |
| `captionHidden` | `boolean` | `false` | Visually hide caption |
| `mode` | `'table' \| 'grid'` | `'table'` | Table or grid interaction mode |
| `sortKey` | `string \| null` | — | Controlled sort column |
| `sortDirection` | `SortDirection` | `'none'` | Controlled sort direction |
| `onSortChange` | `(key, dir) => void` | — | Sort change handler |
| `selectable` | `boolean` | `false` | Enable row selection checkboxes |
| `selectedRows` | `string[]` | — | Controlled selected row IDs |
| `defaultSelectedRows` | `string[]` | — | Default selected rows (uncontrolled) |
| `onSelectionChange` | `(rows) => void` | — | Selection change handler |
| `page` | `number` | — | Current page (enables pagination) |
| `pageSize` | `number` | `10` | Rows per page |
| `totalRows` | `number` | — | Total rows (server-side pagination) |
| `onPageChange` | `(page) => void` | — | Page change handler |
| `pageSizeOptions` | `number[]` | `[10,25,50,100]` | Page size options |
| `onPageSizeChange` | `(size) => void` | — | Page size change handler |
| `renderRowActions` | `(row) => ReactNode` | — | Row action buttons |
| `isLoading` | `boolean` | `false` | Loading state |
| `error` | `ReactNode` | — | Error content |
| `emptyContent` | `ReactNode` | `"No results found"` | Empty state content |
| `onCellEdit` | `(rowId, colId, val) => void` | — | Cell edit handler (grid mode) |
| `toolbar` | `ReactNode` | — | Toolbar content (search, filters) |
| `stickyHeader` | `boolean` | `false` | Sticky table header |
| `striped` | `boolean` | `false` | Alternating row colors |
| `bordered` | `boolean` | `false` | Cell borders |
| `compact` | `boolean` | `false` | Compact row height |

#### Attributes (Web Component)

| Attribute | Type | Description |
|---|---|---|
| `caption` | `string` | Accessible name |
| `mode` | `'table' \| 'grid'` | Interaction mode |
| `selectable` | `boolean` | Enable selection |
| `loading` | `boolean` | Loading state |
| `error` | `string` | Error message |
| `empty-message` | `string` | Empty state text |
| `page` | `number` | Current page (enables pagination) |
| `page-size` | `number` | Rows per page |
| `total-rows` | `number` | Total rows (server-side) |
| `page-size-options` | `string` | Comma-separated sizes |
| `sort-key` | `string` | Sort column key |
| `sort-direction` | `string` | Sort direction |
| `sticky-header` | `boolean` | Sticky header |
| `striped` | `boolean` | Alternating row colors |
| `bordered` | `boolean` | Cell borders |
| `compact` | `boolean` | Compact rows |

#### JS Properties (Web Component)

| Property | Type | Description |
|---|---|---|
| `columns` | `ColumnDef[]` | Column definitions |
| `rows` | `RowData[]` | Row data (each must have `id`) |
| `selectedRows` | `string[]` | Get/set selected row IDs |
| `sortKey` | `string \| null` | Get/set sort column |
| `sortDirection` | `SortDirection` | Get/set sort direction |
| `page` | `number` | Get/set current page |
| `pageSize` | `number` | Get/set page size |
| `totalRows` | `number` | Get/set total row count |

#### Events (Web Component)

| Event | Detail | When |
|---|---|---|
| `compa11y-datagrid-sort` | `{ sortKey, sortDirection }` | Sort column changes |
| `compa11y-datagrid-select` | `{ selectedRows: string[] }` | Selection changes |
| `compa11y-datagrid-page` | `{ page }` | Page changes |
| `compa11y-datagrid-page-size` | `{ pageSize }` | Page size changes |
| `compa11y-datagrid-cell-edit` | `{ rowId, columnId, value }` | Cell edit committed (grid mode) |

#### CSS Custom Properties

| Property | Default | Description |
|---|---|---|
| `--compa11y-datagrid-color` | `#1a1a1a` | Text color |
| `--compa11y-datagrid-bg` | `#ffffff` | Background |
| `--compa11y-datagrid-head-bg` | `#f5f5f5` | Header background |
| `--compa11y-datagrid-border-color` | `#d0d0d0` | Border color |
| `--compa11y-datagrid-cell-padding` | `0.625rem 0.875rem` | Cell padding |
| `--compa11y-datagrid-compact-padding` | `0.375rem 0.625rem` | Compact padding |
| `--compa11y-datagrid-stripe-bg` | `#fafafa` | Striped row background |
| `--compa11y-datagrid-row-hover-bg` | `#f0f0f0` | Row hover background |
| `--compa11y-datagrid-selected-bg` | `#e8f0fe` | Selected row background |
| `--compa11y-datagrid-selected-hover-bg` | `#dde7fd` | Selected row hover |
| `--compa11y-datagrid-pagination-btn-bg` | `#ffffff` | Pagination button background |
| `--compa11y-datagrid-pagination-active-bg` | `#0066cc` | Active page button |
| `--compa11y-datagrid-pagination-active-color` | `#ffffff` | Active page text |
| `--compa11y-datagrid-error-color` | `#d32f2f` | Error text color |
| `--compa11y-datagrid-muted-color` | `#6b6b6b` | Empty/loading text |
| `--compa11y-focus-color` | `#0066cc` | Focus outline color (shared) |

---

### TreeView

**Component:** `<TreeView>` / `<compa11y-tree-view>`
**Type:** Type 3 (Compound) + Type 4 (Roving Tabindex) — dual mode: navigation and widget
**Pattern:** [WAI-ARIA TreeView](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/)

#### When to use which mode

| Use **navigation mode** | Use **widget mode** |
|---|---|
| Tree is site/app navigation (categories, docs, pages) | File explorer behavior needed |
| Items are links that navigate | Arrow key navigation between items expected |
| Minimal ARIA risk — semantic HTML lists | Selection is a concept (highlighted row) |
| Standard Tab/Enter/Space keyboard | Multi-select, rename, type-ahead needed |

#### Automatic ARIA

**Navigation mode:**

| Feature | What's applied |
|---|---|
| **Structure** | `<nav>` wrapper with nested `<ul>/<li>` |
| **Expand/collapse** | `<button>` with `aria-expanded="true/false"`, `aria-controls` pointing to child `<ul>` |
| **Toggle label** | `aria-label="Expand {name}"` / `"Collapse {name}"` on toggle button |
| **Active route** | `aria-current="page"` on the active link |
| **Collapsed children** | Not rendered (removed from DOM — invisible to screen readers) |
| **Disabled** | Native `disabled` on toggle button; `aria-disabled` + `tabIndex={-1}` on links |

**Widget mode:**

| Feature | What's applied |
|---|---|
| **Container** | `role="tree"` with `aria-label` |
| **Nodes** | `role="treeitem"` with roving `tabIndex` (one `0`, rest `-1`) |
| **Children** | `role="group"` wrapping child treeitems |
| **Hierarchy** | `aria-level`, `aria-posinset`, `aria-setsize` on each treeitem |
| **Expand/collapse** | `aria-expanded="true/false"` on expandable treeitems |
| **Selection** | `aria-selected="true/false"` when `selectionMode` is `"single"` or `"multiple"` |
| **Disabled** | `aria-disabled="true"` — not activatable/selectable |
| **Loading** | `aria-busy="true"` on node during async child load |

#### Keyboard

**Navigation mode** — standard Tab navigation:

| Key | Action |
|---|---|
| `Tab` / `Shift+Tab` | Move between interactive elements (toggle buttons, links) |
| `Enter` | Activate focused link/button |
| `Space` | Toggle expand button |

**Widget mode** — arrow key tree navigation:

| Key | Action |
|---|---|
| `↑` / `↓` | Move focus to previous/next visible node (skips disabled) |
| `→` | Expand collapsed node; if expanded, focus first child |
| `←` | Collapse expanded node; if collapsed, focus parent |
| `Home` / `End` | Focus first / last visible node |
| `Enter` | Activate focused node |
| `Space` | Select/toggle selection (when `selectionMode != "none"`) |
| `*` | Expand all siblings at the same level |
| Type letters | Type-ahead: jump to next node matching typed prefix |

#### Screen Reader Announcements

| Event | Announcement |
|---|---|
| Node expanded | `"Expanded"` (polite) |
| Node collapsed | `"Collapsed"` (polite) |
| Toggle via caret (web) | `"{label} expanded"` / `"{label} collapsed"` (polite) |

#### Dev Warnings

| Condition | Warning |
|---|---|
| Widget mode without `aria-label` or `aria-labelledby` | `"Widget mode TreeView requires an accessible label..."` |
| Web component without accessible label | Standard `accessibleLabel` check |

#### Usage (React)

```tsx
import { TreeView, type TreeNodeData } from '@compa11y/react';

const nodes: TreeNodeData[] = [
  {
    id: 'src', label: 'src', children: [
      { id: 'index', label: 'index.ts' },
      { id: 'app', label: 'App.tsx' },
    ]
  },
  { id: 'readme', label: 'README.md' },
];

// Widget mode (file explorer)
<TreeView
  nodes={nodes}
  mode="widget"
  selectionMode="single"
  defaultExpandedIds={new Set(['src'])}
  aria-label="Project files"
  onActivate={(node) => console.log('Opened:', node.label)}
/>

// Navigation mode
<TreeView
  nodes={navNodes}
  mode="navigation"
  aria-label="Documentation"
/>
```

#### Usage (Web Component)

```html
<compa11y-tree-view
  id="file-tree"
  mode="widget"
  selection-mode="single"
  aria-label="Project files"
></compa11y-tree-view>

<script>
  const tree = document.getElementById('file-tree');
  tree.nodesData = [
    { id: 'src', label: 'src', children: [
      { id: 'index', label: 'index.ts' },
    ]},
    { id: 'readme', label: 'README.md' },
  ];
  tree.expand('src');

  tree.addEventListener('compa11y-tree-view-activate', (e) => {
    console.log('Activated:', e.detail.nodeId);
  });
  tree.addEventListener('compa11y-tree-view-select', (e) => {
    console.log('Selected:', e.detail.selectedIds);
  });
</script>
```

#### Props (React)

| Prop | Type | Default | Description |
|---|---|---|---|
| `nodes` | `TreeNodeData[]` | — | Tree data (required) |
| `mode` | `'navigation' \| 'widget'` | `'widget'` | Operating mode |
| `selectionMode` | `'none' \| 'single' \| 'multiple'` | `'none'` | Selection behavior |
| `expandedIds` | `Set<string>` | — | Controlled expanded nodes |
| `defaultExpandedIds` | `Set<string>` | `new Set()` | Uncontrolled default |
| `onExpandedChange` | `(ids: Set<string>) => void` | — | Expansion change callback |
| `selectedIds` | `Set<string>` | — | Controlled selected nodes |
| `defaultSelectedIds` | `Set<string>` | `new Set()` | Uncontrolled default |
| `onSelectedChange` | `(ids: Set<string>) => void` | — | Selection change callback |
| `onActivate` | `(node: TreeNodeData) => void` | — | Node activation callback |
| `onLoadChildren` | `(node: TreeNodeData) => Promise<void>` | — | Lazy load callback |
| `renderIcon` | `(node: TreeNodeData) => ReactNode` | — | Custom icon renderer |
| `renderActions` | `(node: TreeNodeData) => ReactNode` | — | Custom actions renderer |
| `aria-label` | `string` | — | Accessible label (required for widget mode) |

#### TreeNodeData

| Property | Type | Description |
|---|---|---|
| `id` | `string` | Unique node identifier |
| `label` | `string` | Display text |
| `children` | `TreeNodeData[]` | Child nodes |
| `hasChildren` | `boolean` | True if lazy-loadable (children not yet fetched) |
| `disabled` | `boolean` | Prevents interaction |
| `href` | `string` | Navigation URL (navigation mode) |
| `data` | `unknown` | Application payload |

#### Web Component Attributes

| Attribute | Type | Description |
|---|---|---|
| `mode` | `'navigation' \| 'widget'` | Operating mode (default: `'navigation'`) |
| `selection-mode` | `'none' \| 'single' \| 'multiple'` | Selection behavior |
| `nodes` | JSON string | Tree data |
| `aria-label` | `string` | Accessible label |

#### Web Component Events

| Event | Detail | Description |
|---|---|---|
| `compa11y-tree-view-expand` | `{ nodeId }` | Node expanded |
| `compa11y-tree-view-collapse` | `{ nodeId }` | Node collapsed |
| `compa11y-tree-view-select` | `{ nodeId, selectedIds }` | Node selected |
| `compa11y-tree-view-activate` | `{ nodeId }` | Node activated |

#### Web Component JS API

| Method/Property | Description |
|---|---|
| `nodesData` | Get/set nodes array |
| `expandedIds` | Get expanded node IDs (Set) |
| `selectedIds` | Get selected node IDs (Set) |
| `expand(id)` | Expand a node |
| `collapse(id)` | Collapse a node |
| `toggle(id)` | Toggle expand/collapse |
| `select(id)` | Select a node |
| `expandAll()` | Expand all nodes |
| `collapseAll()` | Collapse all nodes |

#### Data Attributes for Styling

| Attribute | Description |
|---|---|
| `data-compa11y-tree-view` | Root container |
| `data-compa11y-tree-view-node` | Individual node |
| `data-compa11y-tree-view-row` | Row wrapper (navigation mode) |
| `data-compa11y-tree-view-toggle` | Expand/collapse button |
| `data-compa11y-tree-view-label` | Node label text |
| `data-compa11y-tree-view-icon` | Icon wrapper (`aria-hidden`) |
| `data-compa11y-tree-view-spacer` | Leaf node indent spacer |
| `data-compa11y-tree-view-actions` | Actions wrapper |
| `data-compa11y-tree-view-group` | Children group |
| `data-expanded` | Node is expanded |
| `data-selected` | Node is selected |
| `data-disabled` | Node is disabled |
| `data-focused` | Node has focus (widget mode) |
| `data-loading` | Node is loading children |
| `data-level` | Nesting depth (1-based) |

#### CSS Custom Properties

| Variable | Default | Description |
|---|---|---|
| `--compa11y-tree-view-indent` | `20px` | Nesting indentation |
| `--compa11y-tree-view-node-height` | `32px` | Minimum node row height |
| `--compa11y-tree-view-color` | `inherit` | Text color |
| `--compa11y-tree-view-bg` | `transparent` | Background |
| `--compa11y-tree-view-hover-bg` | `rgba(0,0,0,0.04)` | Hover background |
| `--compa11y-tree-view-selected-bg` | `rgba(0,102,204,0.08)` | Selected background |
| `--compa11y-tree-view-focus-outline` | `2px solid var(--compa11y-focus-color)` | Focus ring |
| `--compa11y-tree-view-toggle-size` | `16px` | Expand/collapse button size |
| `--compa11y-tree-view-icon-size` | `16px` | Icon size |
| `--compa11y-tree-view-icon-gap` | `6px` | Gap between icon and label |
| `--compa11y-tree-view-error-color` | `#c00` | Error text color |

---

### CommandPalette

**Component:** `<CommandPalette>` / `<compa11y-command-palette>`
**Type:** Type 3 (Compound) + Type 2 (Stateful) — Dialog + Combobox-like hybrid
**Pattern:** Modal dialog with input-controlled listbox (aria-activedescendant)

#### What the library handles

| Concern | Implementation |
|---|---|
| Dialog semantics | `role="dialog"`, `aria-modal="true"`, labeled via Title or `aria-label` |
| Input ↔ listbox relationship | `role="combobox"` on input, `aria-controls` → listbox, `aria-activedescendant` → highlighted option |
| Keyboard navigation | Arrow keys (with wrap), Enter to execute, Escape to close, Home/End, Ctrl/Cmd+K global shortcut |
| Focus management | Focus trap in modal, auto-focus input on open, return focus to trigger on close |
| Screen reader announcements | Result count (debounced), item selection, palette open/close |
| Filtering | Default case-insensitive substring on `value` + `keywords`; custom filter override |
| Disabled items | `aria-disabled="true"`, skipped during keyboard navigation |
| Groups | `role="group"` + `aria-labelledby` for group headings |
| Body scroll lock | Stacking-aware lock/unlock (safe with nested dialogs) |
| Dev warnings | Missing title/label, missing input label, missing item value |

#### Keyboard contract

| Key | Behavior |
|---|---|
| `Ctrl/Cmd+K` | Toggle palette open/close (global) |
| `Escape` | Close palette, return focus |
| `ArrowDown` | Highlight next option (wraps if `loop`) |
| `ArrowUp` | Highlight previous option (wraps if `loop`) |
| `Home` | Highlight first option |
| `End` | Highlight last option |
| `Enter` | Execute highlighted option (calls `onSelect`, navigates to `href`) |
| `Tab` / `Shift+Tab` | Standard dialog focus trap behavior |

#### React compound API

```tsx
<CommandPalette open={open} onOpenChange={setOpen} aria-label="Command palette">
  <CommandPalette.Title>Command palette</CommandPalette.Title>
  <CommandPalette.Description>Type to search commands.</CommandPalette.Description>
  <CommandPalette.Input placeholder="Type a command..." aria-label="Search commands" />
  <CommandPalette.List>
    <CommandPalette.Empty>No results</CommandPalette.Empty>
    <CommandPalette.Loading>Searching...</CommandPalette.Loading>
    <CommandPalette.Group label="Navigation">
      <CommandPalette.Item value="Go to Projects" onSelect={...} />
    </CommandPalette.Group>
    <CommandPalette.Separator />
    <CommandPalette.Group label="Actions">
      <CommandPalette.Item value="Create project" onSelect={...} shortcut="⌘N" />
      <CommandPalette.Item value="Danger action" disabled />
    </CommandPalette.Group>
  </CommandPalette.List>
  <CommandPalette.Footer>↑↓ navigate · ↵ select · esc close</CommandPalette.Footer>
</CommandPalette>
```

#### Web Component

```html
<compa11y-command-palette trigger="#open-btn" placeholder="Type a command...">
  <h2 slot="title">Command palette</h2>
  <div slot="item" data-value="Go to Projects" data-group="Navigation">Go to Projects</div>
  <div slot="item" data-value="Create project" data-group="Actions" data-shortcut="⌘N">Create project</div>
  <div slot="item" data-value="Danger action" data-group="Actions" data-disabled>Danger action</div>
  <span slot="footer">↑↓ navigate · ↵ select · esc close</span>
</compa11y-command-palette>
```

#### Props (React)

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | — | Controlled open state |
| `defaultOpen` | `boolean` | `false` | Uncontrolled initial state |
| `onOpenChange` | `(open: boolean) => void` | — | Called on open/close |
| `modal` | `boolean` | `true` | Render as modal dialog |
| `loop` | `boolean` | `true` | Wrap keyboard navigation |
| `filter` | `(query, value, keywords?) => boolean` | — | Custom filter function |
| `onSelect` | `(value: string) => void` | — | Global select callback |
| `loading` | `boolean` | `false` | Async loading state |
| `aria-label` | `string` | — | Accessible label (if no Title) |
| `unstyled` | `boolean` | `false` | Remove default styles |

#### Item props

| Prop | Type | Description |
|---|---|---|
| `value` | `string` | Searchable value (required) |
| `keywords` | `string[]` | Additional search terms |
| `onSelect` | `() => void` | Called on selection |
| `href` | `string` | Navigate to URL on selection |
| `shortcut` | `string` | Display-only shortcut hint |
| `disabled` | `boolean` | Prevents selection, announced |

#### Data attributes (for styling)

| Attribute | Element |
|---|---|
| `data-compa11y-command-palette-overlay` | Overlay backdrop |
| `data-compa11y-command-palette` | Dialog container |
| `data-compa11y-command-palette-input` | Search input |
| `data-compa11y-command-palette-list` | Results listbox |
| `data-compa11y-command-palette-item` | Individual option |
| `data-compa11y-command-palette-group` | Group container |
| `data-compa11y-command-palette-group-label` | Group heading |
| `data-compa11y-command-palette-separator` | Visual separator |
| `data-compa11y-command-palette-empty` | Empty state |
| `data-compa11y-command-palette-loading` | Loading state |
| `data-compa11y-command-palette-footer` | Footer area |
| `data-compa11y-command-palette-shortcut` | Shortcut kbd |
| `data-highlighted` | Currently highlighted item |
| `data-disabled` | Disabled item |

#### CSS custom properties (Web Component)

| Property | Default | Description |
|---|---|---|
| `--compa11y-command-palette-z-index` | `9999` | Overlay z-index |
| `--compa11y-command-palette-overlay-bg` | `rgba(0,0,0,0.5)` | Overlay background |
| `--compa11y-command-palette-bg` | `white` | Palette background |
| `--compa11y-command-palette-radius` | `12px` | Border radius |
| `--compa11y-command-palette-max-width` | `640px` | Max width |
| `--compa11y-command-palette-max-height` | `70vh` | Max height |
| `--compa11y-command-palette-shadow` | `0 25px 50px -12px rgba(0,0,0,0.25)` | Box shadow |
| `--compa11y-command-palette-border-color` | `#e5e5e5` | Border color |
| `--compa11y-command-palette-highlight-bg` | `#f0f0f0` | Highlighted item background |
| `--compa11y-command-palette-hover-bg` | `#f5f5f5` | Hovered item background |
| `--compa11y-command-palette-item-padding` | `8px 12px` | Item padding |
| `--compa11y-command-palette-item-radius` | `6px` | Item border radius |

---

### `<compa11y-carousel>`

A carousel web component with slide navigation, pagination dots, and optional autoplay.

```html
<compa11y-carousel aria-label="Featured products" loop>
  <div slot="slide">Slide 1 content</div>
  <div slot="slide">Slide 2 content</div>
  <div slot="slide">Slide 3 content</div>
</compa11y-carousel>
```

**Attributes:** `aria-label`, `value` (active index), `loop`, `autoplay`, `autoplay-interval`, `slides-per-view`, `hide-non-active`, `orientation`

**Events:**
- `compa11y-carousel-change` — `{ activeIndex: number, slideCount: number }`

**Slots:**
| Name | Purpose |
|---|---|
| `slide` | Each slide element |
| `prev-label` | Custom prev button content |
| `next-label` | Custom next button content |
| `pause-label` | Custom pause button content |

**Parts:** `root`, `status`, `controls`, `prev`, `next`, `pause`, `viewport`, `track`, `pagination`, `dot`

**CSS custom properties:**

| Property | Default | Description |
|---|---|---|
| `--compa11y-carousel-gap` | `0` | Gap between slides |
| `--compa11y-carousel-dot-size` | `12px` | Pagination dot diameter |
| `--compa11y-carousel-dot-color` | `#ccc` | Inactive dot color |
| `--compa11y-carousel-dot-active-color` | `#333` | Active dot color |

**Keyboard and ARIA:** Same as React Carousel — see [Carousel](#carousel) above.

---

### `<compa11y-rich-text-editor>`

An engine-agnostic rich text editor web component. Set the adapter via the `adapter` JS property.

```html
<compa11y-rich-text-editor
  label="Message"
  description="Describe your issue."
  format="html"
  required
>
</compa11y-rich-text-editor>

<script>
  const editor = document.querySelector('compa11y-rich-text-editor');
  editor.adapter = createLexicalAdapter();
  editor.features = { bold: true, italic: true, link: true, lists: true };

  editor.addEventListener('compa11y-rte-change', (e) => {
    console.log('Value:', e.detail.value);
  });
</script>
```

**Attributes:** `label`, `aria-label`, `description`, `error-message`, `required`, `disabled`, `readonly`, `format`, `placeholder`, `features` (JSON string)

**JS Properties:**
- `adapter` — `RTEAdapter` instance (required, set via JS)
- `value` — get/set editor value
- `disabled`, `readOnly`, `features` — get/set

**Events:**
- `compa11y-rte-change` — `{ value: string | object }` — content changed
- `compa11y-rte-focus` — editor focused
- `compa11y-rte-blur` — editor blurred

**Slots:**
| Name | Purpose |
|---|---|
| `footer` | Optional footer content |

**Parts:** `wrapper`, `label`, `description`, `toolbar`, `content`, `error`

**CSS custom properties:**

| Property | Default | Description |
|---|---|---|
| `--compa11y-rte-border-color` | `#d1d5db` | Border color |
| `--compa11y-rte-border-radius` | `8px` | Border radius |
| `--compa11y-rte-toolbar-bg` | `#f9fafb` | Toolbar background |
| `--compa11y-rte-toolbar-border-color` | `#e5e7eb` | Toolbar border |
| `--compa11y-rte-toolbar-gap` | `4px` | Gap between toolbar items |
| `--compa11y-rte-btn-size` | `32px` | Toolbar button min size |
| `--compa11y-rte-btn-radius` | `4px` | Button border radius |
| `--compa11y-rte-btn-hover-bg` | `#e5e7eb` | Button hover background |
| `--compa11y-rte-btn-active-bg` | `#dbeafe` | Active toggle background |
| `--compa11y-rte-btn-active-color` | `#1d4ed8` | Active toggle text color |
| `--compa11y-rte-content-min-height` | `150px` | Editor minimum height |
| `--compa11y-rte-content-padding` | `12px` | Editor content padding |
| `--compa11y-rte-error-color` | `#dc2626` | Error text color |
| `--compa11y-rte-label-font-weight` | `600` | Label font weight |

**Built-in toolbar:** Automatically rendered from `features` — includes inline marks, heading select, list toggles, blockquote, code block, link, image, undo/redo.

**Built-in dialogs:** Link dialog and image dialog are rendered inside shadow DOM with full accessibility (focus trap, Escape to close, return focus, validation).

**Keyboard and ARIA:** Same as React RichTextEditor — see [RichTextEditor](#richtexteditor) above.

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
