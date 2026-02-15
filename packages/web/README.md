# @compa11y/web

Accessible Web Components for any HTML page. No framework required.

## Installation

### CDN (Recommended for quick start)

```html
<script src="https://unpkg.com/@compa11y/web"></script>
```

### npm

```bash
npm install @compa11y/web
```

```js
import '@compa11y/web';
```

## Components

### Dialog

```html
<button id="open-dialog">Open Dialog</button>

<a11y-dialog trigger="#open-dialog">
  <h2 slot="title">Confirm Action</h2>
  <p slot="description">Are you sure you want to proceed?</p>

  <p>This action cannot be undone.</p>

  <div slot="actions">
    <button onclick="this.closest('a11y-dialog').close()">Cancel</button>
    <button onclick="handleConfirm()">Confirm</button>
  </div>
</a11y-dialog>
```

#### Attributes

| Attribute                | Description                     | Default |
| ------------------------ | ------------------------------- | ------- |
| `trigger`                | CSS selector for trigger button | —       |
| `open`                   | Whether dialog is open          | `false` |
| `close-on-outside-click` | Close when clicking overlay     | `true`  |
| `close-on-escape`        | Close when pressing Escape      | `true`  |

#### Slots

| Slot          | Description                               |
| ------------- | ----------------------------------------- |
| `title`       | Dialog title (required for accessibility) |
| `description` | Optional description                      |
| (default)     | Dialog content                            |
| `actions`     | Footer buttons                            |

#### Methods

```js
const dialog = document.querySelector('a11y-dialog');
dialog.show(); // Open
dialog.close(); // Close
```

#### Events

```js
dialog.addEventListener('a11y-dialog-open', () => {});
dialog.addEventListener('a11y-dialog-close', () => {});
```

### Menu

```html
<a11y-menu>
  <button slot="trigger">Actions ▾</button>

  <button role="menuitem">Edit</button>
  <button role="menuitem">Duplicate</button>
  <div role="separator"></div>
  <button role="menuitem">Delete</button>
</a11y-menu>
```

#### Attributes

| Attribute | Description          | Default |
| --------- | -------------------- | ------- |
| `open`    | Whether menu is open | `false` |

#### Methods

```js
const menu = document.querySelector('a11y-menu');
menu.show(); // Open
menu.close(); // Close
menu.toggle(); // Toggle
```

#### Events

```js
menu.addEventListener('a11y-menu-open', () => {});
menu.addEventListener('a11y-menu-close', () => {});
menu.addEventListener('a11y-menu-select', (e) => {
  console.log(e.detail.item);
});
```

### Tabs

```html
<a11y-tabs>
  <button role="tab" aria-controls="panel-1">Tab 1</button>
  <button role="tab" aria-controls="panel-2">Tab 2</button>
  <button role="tab" aria-controls="panel-3">Tab 3</button>

  <div role="tabpanel" id="panel-1">Content 1</div>
  <div role="tabpanel" id="panel-2">Content 2</div>
  <div role="tabpanel" id="panel-3">Content 3</div>
</a11y-tabs>
```

#### Attributes

| Attribute         | Description                  | Default      |
| ----------------- | ---------------------------- | ------------ |
| `orientation`     | `horizontal` or `vertical`   | `horizontal` |
| `activation-mode` | `automatic` or `manual`      | `automatic`  |
| `selected-index`  | Currently selected tab index | `0`          |

#### Methods

```js
const tabs = document.querySelector('a11y-tabs');
tabs.select(2); // Select by index
tabs.next(); // Select next tab
tabs.previous(); // Select previous tab
```

#### Events

```js
tabs.addEventListener('a11y-tabs-change', (e) => {
  console.log(e.detail.index, e.detail.tab, e.detail.panel);
});
```

### Combobox

```html
<a11y-combobox
  label="Choose a country"
  placeholder="Search countries..."
></a11y-combobox>

<script>
  const combobox = document.querySelector('a11y-combobox');
  combobox.options = [
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'ca', label: 'Canada' },
  ];

  combobox.addEventListener('change', (e) => {
    console.log('Selected:', e.detail.value);
  });
</script>
```

#### Attributes

| Attribute       | Description                           | Default              |
| --------------- | ------------------------------------- | -------------------- |
| `label`         | Label text (required for a11y)        | —                    |
| `placeholder`   | Input placeholder                     | —                    |
| `value`         | Currently selected value              | —                    |
| `disabled`      | Disable the combobox                  | `false`              |
| `clearable`     | Show clear button when value selected | `false`              |
| `empty-message` | Message when no options match         | `'No results found'` |

#### Properties

```js
const combobox = document.querySelector('a11y-combobox');
combobox.options = [...]; // Set options
combobox.value = 'us'; // Set value
```

#### Events

```js
combobox.addEventListener('change', (e) => {
  console.log(e.detail.value, e.detail.option);
});
```

### Select

```html
<a11y-select aria-label="Choose a fruit" placeholder="Pick a fruit...">
  <option value="apple">Apple</option>
  <option value="banana">Banana</option>
  <option value="cherry">Cherry</option>
  <option value="dragonfruit" disabled>Dragon Fruit (unavailable)</option>
  <option value="elderberry">Elderberry</option>
</a11y-select>
```

#### Attributes

| Attribute         | Description              | Default                 |
| ----------------- | ------------------------ | ----------------------- |
| `placeholder`     | Trigger placeholder text | `'Select an option...'` |
| `value`           | Currently selected value | —                       |
| `disabled`        | Disable the select       | `false`                 |
| `aria-label`      | Accessible label         | —                       |
| `aria-labelledby` | ID of labelling element  | —                       |

#### Properties

```js
const select = document.querySelector('a11y-select');
select.value = 'apple'; // Set value programmatically
```

#### Methods

```js
const select = document.querySelector('a11y-select');
select.show(); // Open
select.close(); // Close
```

#### Events

```js
select.addEventListener('change', (e) => {
  console.log('Value:', e.detail.value);
  console.log('Label:', e.detail.label);
});

select.addEventListener('a11y-select-change', (e) => {
  console.log('Selected:', e.detail);
});

select.addEventListener('a11y-select-open', () => {});
select.addEventListener('a11y-select-close', () => {});
```

#### Keyboard Navigation

| Key               | Action                                    |
| ----------------- | ----------------------------------------- |
| `Enter` / `Space` | Open listbox or select highlighted option |
| `ArrowDown`       | Open listbox / move highlight down        |
| `ArrowUp`         | Open listbox / move highlight up          |
| `Home` / `End`    | Jump to first / last option               |
| `Escape`          | Close listbox                             |
| `Tab`             | Close listbox and move focus              |
| Type characters   | Jump to matching option (type-ahead)      |

### Switch

```html
<a11y-switch label="Enable notifications"></a11y-switch>

<!-- Checked by default -->
<a11y-switch checked label="Dark mode"></a11y-switch>

<!-- Disabled -->
<a11y-switch disabled label="Premium feature"></a11y-switch>
```

#### Attributes

| Attribute  | Description               | Default |
| ---------- | ------------------------- | ------- |
| `label`    | Label text                | —       |
| `checked`  | Whether switch is on      | `false` |
| `disabled` | Disable the switch        | `false` |
| `value`    | Value for form submission | —       |
| `name`     | Name for form submission  | —       |

#### Properties

```js
const switchEl = document.querySelector('a11y-switch');
switchEl.checked = true; // Set checked state
```

#### Events

```js
switchEl.addEventListener('change', (e) => {
  console.log('Checked:', e.detail.checked);
  console.log('Value:', e.detail.value);
  console.log('Name:', e.detail.name);
});
```

### RadioGroup

```html
<a11y-radio-group aria-label="Favorite color" value="red">
  <a11y-radio value="red" label="Red"></a11y-radio>
  <a11y-radio value="green" label="Green"></a11y-radio>
  <a11y-radio value="blue" label="Blue"></a11y-radio>
</a11y-radio-group>

<!-- Horizontal orientation -->
<a11y-radio-group aria-label="Size" orientation="horizontal" value="md">
  <a11y-radio value="sm" label="Small"></a11y-radio>
  <a11y-radio value="md" label="Medium"></a11y-radio>
  <a11y-radio value="lg" label="Large"></a11y-radio>
</a11y-radio-group>

<!-- Individual disabled radio -->
<a11y-radio-group aria-label="Plan" value="pro">
  <a11y-radio value="free" label="Free"></a11y-radio>
  <a11y-radio value="pro" label="Pro"></a11y-radio>
  <a11y-radio value="enterprise" label="Enterprise" disabled></a11y-radio>
</a11y-radio-group>
```

#### RadioGroup Attributes

| Attribute         | Description                       | Default    |
| ----------------- | --------------------------------- | ---------- |
| `value`           | Currently selected value          | —          |
| `disabled`        | Disable all radios                | `false`    |
| `discoverable`    | Keep disabled radios in tab order | `true`     |
| `orientation`     | `horizontal` or `vertical`        | `vertical` |
| `required`        | Required selection                | `false`    |
| `name`            | Group name                        | —          |
| `aria-label`      | Accessible label                  | —          |
| `aria-labelledby` | ID of labelling element           | —          |

#### Radio Attributes

| Attribute      | Description                      | Default |
| -------------- | -------------------------------- | ------- |
| `value`        | Value for this option            | —       |
| `label`        | Label text                       | —       |
| `disabled`     | Disable this radio               | `false` |
| `discoverable` | Keep disabled radio in tab order | `true`  |
| `checked`      | Whether radio is selected        | `false` |

#### Properties

```js
const group = document.querySelector('a11y-radio-group');
group.value = 'blue'; // Set selected value
group.disabled = true; // Disable all radios
group.orientation = 'horizontal'; // Change layout
```

#### Methods

```js
const group = document.querySelector('a11y-radio-group');
group.selectRadio('blue'); // Select a radio by value
```

#### Events

```js
group.addEventListener('change', (e) => {
  console.log('Value:', e.detail.value);
});

group.addEventListener('a11y-radiogroup-change', (e) => {
  console.log('Selected:', e.detail.value);
});
```

#### Keyboard Navigation

| Key                        | Action                                    |
| -------------------------- | ----------------------------------------- |
| `ArrowDown` / `ArrowRight` | Move to next radio and select             |
| `ArrowUp` / `ArrowLeft`    | Move to previous radio and select         |
| `Home` / `End`             | Jump to first / last radio                |
| `Tab`                      | Move to selected radio, then out of group |

#### CSS Custom Properties

```css
a11y-radio-group {
  --compa11y-radio-gap: 0.75rem;
}

a11y-radio {
  --compa11y-radio-size: 1.25rem;
  --compa11y-radio-border: 2px solid #666;
  --compa11y-radio-bg: white;
  --compa11y-radio-checked-bg: #0066cc;
  --compa11y-radio-checked-border: #0066cc;
  --compa11y-radio-dot-size: 0.5rem;
  --compa11y-radio-dot-color: white;
  --compa11y-radio-label-color: inherit;
  --compa11y-radio-label-size: 1rem;
  --compa11y-radio-disabled-color: #999;
  --compa11y-radio-hover-border: #0066cc;
  --compa11y-focus-color: #0066cc;
}
```

### Listbox

```html
<!-- Single select -->
<a11y-listbox aria-label="Favorite fruit" value="apple">
  <a11y-optgroup label="Citrus">
    <a11y-option value="orange">Orange</a11y-option>
    <a11y-option value="lemon">Lemon</a11y-option>
    <a11y-option value="grapefruit">Grapefruit</a11y-option>
  </a11y-optgroup>
  <a11y-optgroup label="Berries">
    <a11y-option value="strawberry">Strawberry</a11y-option>
    <a11y-option value="blueberry">Blueberry</a11y-option>
    <a11y-option value="raspberry" disabled>Raspberry (sold out)</a11y-option>
  </a11y-optgroup>
  <a11y-option value="apple">Apple</a11y-option>
  <a11y-option value="banana">Banana</a11y-option>
</a11y-listbox>

<!-- Multi select -->
<a11y-listbox multiple aria-label="Pizza toppings" value="cheese,mushrooms">
  <a11y-option value="cheese">Cheese</a11y-option>
  <a11y-option value="pepperoni">Pepperoni</a11y-option>
  <a11y-option value="mushrooms">Mushrooms</a11y-option>
  <a11y-option value="onions">Onions</a11y-option>
  <a11y-option value="pineapple" disabled>Pineapple (unavailable)</a11y-option>
</a11y-listbox>
```

#### Listbox Attributes

| Attribute         | Description                                   | Default    |
| ----------------- | --------------------------------------------- | ---------- |
| `value`           | Selected value(s) (comma-separated for multi) | —          |
| `multiple`        | Enable multi-select mode                      | `false`    |
| `disabled`        | Disable all options                           | `false`    |
| `discoverable`    | Keep disabled listbox in tab order            | `true`     |
| `orientation`     | `horizontal` or `vertical`                    | `vertical` |
| `aria-label`      | Accessible label                              | —          |
| `aria-labelledby` | ID of labelling element                       | —          |

#### Option Attributes

| Attribute      | Description                       | Default |
| -------------- | --------------------------------- | ------- |
| `value`        | Value for this option             | —       |
| `disabled`     | Disable this option               | `false` |
| `discoverable` | Keep disabled option in tab order | `true`  |

#### Optgroup Attributes

| Attribute  | Description                     | Default |
| ---------- | ------------------------------- | ------- |
| `label`    | Group label (visible, required) | —       |
| `disabled` | Disable all options in group    | `false` |

#### Properties

```js
const listbox = document.querySelector('a11y-listbox');
listbox.value = 'apple'; // Set selected value (single)
listbox.value = 'cheese,onions'; // Set selected values (multi, comma-separated)
listbox.multiple = true; // Toggle multi-select mode
listbox.disabled = true; // Disable all options
```

#### Events

```js
listbox.addEventListener('change', (e) => {
  console.log('Value:', e.detail.value);
  console.log('Label:', e.detail.label);
});

listbox.addEventListener('a11y-listbox-change', (e) => {
  console.log('Selected:', e.detail);
});
```

#### Keyboard Navigation

| Key                     | Single Select                      | Multi Select                    |
| ----------------------- | ---------------------------------- | ------------------------------- |
| `ArrowDown` / `ArrowUp` | Move focus and select              | Move focus only                 |
| `Home` / `End`          | First/last option and select       | Move focus only                 |
| `Space`                 | —                                  | Toggle focused option           |
| `Shift+ArrowDown/Up`    | —                                  | Move focus and toggle selection |
| `Ctrl+Shift+Home/End`   | —                                  | Select range to first/last      |
| `Ctrl+A` / `Cmd+A`      | —                                  | Toggle select all               |
| Type characters         | Jump to matching option and select | Jump to matching option         |

#### CSS Custom Properties

```css
a11y-listbox {
  --compa11y-listbox-bg: white;
  --compa11y-listbox-border: 1px solid #ccc;
  --compa11y-listbox-radius: 6px;
  --compa11y-listbox-max-height: 300px;
  --compa11y-listbox-padding: 4px;
}

a11y-option {
  --compa11y-option-padding: 0.5rem 0.75rem;
  --compa11y-option-radius: 4px;
  --compa11y-option-hover-bg: #f5f5f5;
  --compa11y-option-focused-bg: #e6f0ff;
  --compa11y-option-focused-border: #0066cc;
  --compa11y-option-selected-bg: #e6f0ff;
  --compa11y-option-selected-color: #0066cc;
  --compa11y-option-check-color: #0066cc;
  --compa11y-option-disabled-color: #999;
  --compa11y-option-disabled-bg: transparent;
  --compa11y-focus-color: #0066cc;
}
```

### Input

```html
<a11y-input
  label="Full Name"
  hint="Enter your first and last name"
  required
  placeholder="John Doe"
  type="text"
></a11y-input>

<!-- With error -->
<a11y-input
  label="Email"
  error="Please enter a valid email"
  type="email"
></a11y-input>

<!-- Read-only -->
<a11y-input label="User ID" value="USR-12345" readonly></a11y-input>

<!-- Disabled -->
<a11y-input label="Organization" value="Compa11y Inc." disabled></a11y-input>
```

#### Attributes

| Attribute         | Description              | Default  |
| ----------------- | ------------------------ | -------- |
| `label`           | Visible label text       | —        |
| `hint`            | Hint/description text    | —        |
| `error`           | Error message text       | —        |
| `type`            | Input type               | `'text'` |
| `placeholder`     | Placeholder text         | —        |
| `value`           | Current value            | —        |
| `disabled`        | Disable the input        | `false`  |
| `readonly`        | Read-only input          | `false`  |
| `required`        | Required field           | `false`  |
| `name`            | Name for form submission | —        |
| `aria-label`      | Accessible label         | —        |
| `aria-labelledby` | ID of labelling element  | —        |

#### Properties

```js
const input = document.querySelector('a11y-input');
input.value = 'Hello'; // Set value
input.error = 'Required'; // Set error (shows role="alert")
input.error = ''; // Clear error
input.disabled = true; // Disable
```

#### Methods

```js
const input = document.querySelector('a11y-input');
input.focus(); // Focus the input
input.blur(); // Blur the input
input.select(); // Select all text
```

#### Events

```js
input.addEventListener('input', (e) => {
  console.log('Value:', e.detail.value);
});

input.addEventListener('change', (e) => {
  console.log('Final value:', e.detail.value);
});

input.addEventListener('a11y-input-focus', () => {});
input.addEventListener('a11y-input-blur', () => {});
```

### Textarea

```html
<a11y-textarea
  label="Description"
  hint="Provide at least 10 characters"
  required
  rows="4"
  placeholder="Enter a description..."
></a11y-textarea>

<!-- With error -->
<a11y-textarea label="Bio" error="Bio is required" rows="5"></a11y-textarea>

<!-- Read-only -->
<a11y-textarea
  label="Terms"
  value="Read only content..."
  readonly
  rows="3"
></a11y-textarea>

<!-- Disabled -->
<a11y-textarea
  label="Notes"
  value="Disabled content"
  disabled
  rows="2"
></a11y-textarea>
```

#### Attributes

| Attribute         | Description              | Default      |
| ----------------- | ------------------------ | ------------ |
| `label`           | Visible label text       | —            |
| `hint`            | Hint/description text    | —            |
| `error`           | Error message text       | —            |
| `rows`            | Number of visible rows   | `3`          |
| `resize`          | Resize behavior          | `'vertical'` |
| `placeholder`     | Placeholder text         | —            |
| `value`           | Current value            | —            |
| `disabled`        | Disable the textarea     | `false`      |
| `readonly`        | Read-only textarea       | `false`      |
| `required`        | Required field           | `false`      |
| `name`            | Name for form submission | —            |
| `aria-label`      | Accessible label         | —            |
| `aria-labelledby` | ID of labelling element  | —            |

#### Properties

```js
const textarea = document.querySelector('a11y-textarea');
textarea.value = 'Hello'; // Set value
textarea.error = 'Required'; // Set error (shows role="alert")
textarea.error = ''; // Clear error
textarea.disabled = true; // Disable
```

#### Methods

```js
const textarea = document.querySelector('a11y-textarea');
textarea.focus(); // Focus the textarea
textarea.blur(); // Blur the textarea
textarea.select(); // Select all text
```

#### Events

```js
textarea.addEventListener('input', (e) => {
  console.log('Value:', e.detail.value);
});

textarea.addEventListener('change', (e) => {
  console.log('Final value:', e.detail.value);
});

textarea.addEventListener('a11y-textarea-focus', () => {});
textarea.addEventListener('a11y-textarea-blur', () => {});
```

### Button

```html
<a11y-button variant="primary">Save</a11y-button>
<a11y-button variant="danger">Delete</a11y-button>
<a11y-button variant="outline">Cancel</a11y-button>

<!-- Loading state -->
<a11y-button variant="primary" loading>Saving...</a11y-button>

<!-- Disabled but discoverable (stays in tab order) -->
<a11y-button variant="primary" disabled discoverable>Unavailable</a11y-button>

<!-- Sizes -->
<a11y-button variant="primary" size="sm">Small</a11y-button>
<a11y-button variant="primary" size="md">Medium</a11y-button>
<a11y-button variant="primary" size="lg">Large</a11y-button>
```

#### Attributes

| Attribute      | Description                                                 | Default       |
| -------------- | ----------------------------------------------------------- | ------------- |
| `variant`      | Visual variant (primary, secondary, danger, outline, ghost) | `'secondary'` |
| `size`         | Size (sm, md, lg)                                           | `'md'`        |
| `type`         | Button type (button, submit, reset)                         | `'button'`    |
| `disabled`     | Disable the button                                          | `false`       |
| `discoverable` | Keep disabled button in tab order                           | `false`       |
| `loading`      | Loading state (shows spinner, aria-busy)                    | `false`       |
| `aria-label`   | Accessible label                                            | —             |

#### Properties

```js
const btn = document.querySelector('a11y-button');
btn.disabled = true; // Disable
btn.loading = true; // Set loading
btn.variant = 'danger'; // Change variant
btn.size = 'lg'; // Change size
```

#### Methods

```js
const btn = document.querySelector('a11y-button');
btn.focus(); // Focus the button
btn.blur(); // Blur the button
btn.click(); // Programmatic click
```

#### Events

```js
btn.addEventListener('a11y-button-click', () => {
  console.log('Button clicked');
});
```

#### CSS Custom Properties

```css
a11y-button {
  --compa11y-button-radius: 4px;
  --compa11y-button-font-weight: 500;
  --compa11y-button-disabled-opacity: 0.5;
  --compa11y-button-primary-bg: #0066cc;
  --compa11y-button-primary-color: white;
  --compa11y-button-danger-bg: #ef4444;
  --compa11y-button-danger-color: white;
  --compa11y-focus-color: #0066cc;
}
```

## Styling

Use CSS custom properties for theming:

```css
/* Dialog */
a11y-dialog {
  --compa11y-dialog-bg: white;
  --compa11y-dialog-radius: 8px;
  --compa11y-dialog-padding: 1.5rem;
  --compa11y-dialog-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  --compa11y-dialog-overlay-bg: rgba(0, 0, 0, 0.5);
  --compa11y-dialog-z-index: 9999;
}

/* Menu */
a11y-menu {
  --compa11y-menu-bg: white;
  --compa11y-menu-border: 1px solid #e0e0e0;
  --compa11y-menu-radius: 4px;
  --compa11y-menu-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  --compa11y-menu-item-hover-bg: #f5f5f5;
}

/* Tabs */
a11y-tabs {
  --compa11y-tabs-border: 1px solid #e0e0e0;
  --compa11y-tab-padding: 0.75rem 1rem;
  --compa11y-tab-color: #666;
  --compa11y-tab-active-color: #0066cc;
}

/* Combobox */
a11y-combobox {
  --compa11y-combobox-width: 300px;
  --compa11y-combobox-border: 1px solid #ccc;
  --compa11y-combobox-radius: 4px;
  --compa11y-combobox-option-hover-bg: #f5f5f5;
  --compa11y-combobox-option-selected-bg: #e6f0ff;
}

/* Select */
a11y-select {
  --compa11y-select-width: 300px;
  --compa11y-select-border: 1px solid #ccc;
  --compa11y-select-radius: 4px;
  --compa11y-select-bg: white;
  --compa11y-select-placeholder-color: #999;
  --compa11y-select-chevron-color: #666;
  --compa11y-select-option-hover-bg: #f5f5f5;
  --compa11y-select-option-selected-bg: #e6f0ff;
  --compa11y-select-check-color: #0066cc;
  --compa11y-select-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Switch */
a11y-switch {
  --compa11y-switch-bg: #d1d5db;
  --compa11y-switch-checked-bg: #0066cc;
  --compa11y-switch-thumb-bg: white;
  --compa11y-switch-width: 2.75rem;
  --compa11y-switch-height: 1.5rem;
  --compa11y-switch-thumb-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

/* Input */
a11y-input {
  --compa11y-input-border: 1px solid #ccc;
  --compa11y-input-border-focus: #0066cc;
  --compa11y-input-border-error: #ef4444;
  --compa11y-input-bg: white;
  --compa11y-input-radius: 4px;
  --compa11y-input-padding: 0.5rem 0.75rem;
  --compa11y-input-font-size: 0.875rem;
  --compa11y-input-label-color: inherit;
  --compa11y-input-label-size: 0.875rem;
  --compa11y-input-label-weight: 500;
  --compa11y-input-hint-color: #666;
  --compa11y-input-hint-size: 0.8125rem;
  --compa11y-input-error-color: #ef4444;
  --compa11y-input-error-size: 0.8125rem;
  --compa11y-input-required-color: #ef4444;
  --compa11y-input-disabled-bg: #f5f5f5;
  --compa11y-input-placeholder-color: #999;
}

/* Textarea */
a11y-textarea {
  --compa11y-textarea-border: 1px solid #ccc;
  --compa11y-textarea-border-focus: #0066cc;
  --compa11y-textarea-border-error: #ef4444;
  --compa11y-textarea-bg: white;
  --compa11y-textarea-radius: 4px;
  --compa11y-textarea-padding: 0.5rem 0.75rem;
  --compa11y-textarea-font-size: 0.875rem;
  --compa11y-textarea-resize: vertical;
  --compa11y-textarea-label-color: inherit;
  --compa11y-textarea-label-size: 0.875rem;
  --compa11y-textarea-label-weight: 500;
  --compa11y-textarea-hint-color: #666;
  --compa11y-textarea-hint-size: 0.8125rem;
  --compa11y-textarea-error-color: #ef4444;
  --compa11y-textarea-error-size: 0.8125rem;
  --compa11y-textarea-required-color: #ef4444;
  --compa11y-textarea-disabled-bg: #f5f5f5;
  --compa11y-textarea-placeholder-color: #999;
}

/* Button */
a11y-button {
  --compa11y-button-radius: 4px;
  --compa11y-button-font-weight: 500;
  --compa11y-button-disabled-opacity: 0.5;
  --compa11y-button-primary-bg: #0066cc;
  --compa11y-button-primary-color: white;
  --compa11y-button-danger-bg: #ef4444;
  --compa11y-button-danger-color: white;
}

/* Listbox */
a11y-listbox {
  --compa11y-listbox-bg: white;
  --compa11y-listbox-border: 1px solid #ccc;
  --compa11y-listbox-radius: 6px;
  --compa11y-listbox-max-height: 300px;
  --compa11y-listbox-padding: 4px;
}

a11y-option {
  --compa11y-option-padding: 0.5rem 0.75rem;
  --compa11y-option-radius: 4px;
  --compa11y-option-hover-bg: #f5f5f5;
  --compa11y-option-focused-bg: #e6f0ff;
  --compa11y-option-selected-bg: #e6f0ff;
  --compa11y-option-check-color: #0066cc;
  --compa11y-option-disabled-color: #999;
}

/* RadioGroup */
a11y-radio-group {
  --compa11y-radio-gap: 0.75rem;
}

a11y-radio {
  --compa11y-radio-size: 1.25rem;
  --compa11y-radio-border: 2px solid #666;
  --compa11y-radio-bg: white;
  --compa11y-radio-checked-bg: #0066cc;
  --compa11y-radio-checked-border: #0066cc;
  --compa11y-radio-dot-size: 0.5rem;
  --compa11y-radio-dot-color: white;
  --compa11y-radio-label-color: inherit;
  --compa11y-radio-label-size: 1rem;
  --compa11y-radio-disabled-color: #999;
  --compa11y-radio-hover-border: #0066cc;
}

/* Focus ring */
:root {
  --compa11y-focus-color: #0066cc;
}
```

Use `::part()` for Shadow DOM styling:

```css
a11y-dialog::part(overlay) {
  backdrop-filter: blur(4px);
}

a11y-dialog::part(dialog) {
  max-width: 600px;
}

a11y-dialog::part(close-button) {
  color: #666;
}
```

## JavaScript API

```js
import {
  // Announcer
  announce,
  announcePolite,
  announceAssertive,

  // Focus
  createFocusTrap,
  createFocusScope,

  // Keyboard
  createKeyboardManager,
  KeyboardPatterns,

  // ARIA
  aria,

  // Platform
  prefersReducedMotion,
  prefersHighContrast,
} from '@compa11y/web';

// Make announcements
announcePolite('Item added to cart');

// Check preferences
if (prefersReducedMotion()) {
  // Disable animations
}
```

## Browser Support

- Chrome/Edge 88+
- Firefox 78+
- Safari 14+

## License

MIT
