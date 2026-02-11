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

| Attribute      | Description                           | Default |
| -------------- | ------------------------------------- | ------- |
| `label`        | Label text (required for a11y)        | —       |
| `placeholder`  | Input placeholder                     | —       |
| `value`        | Currently selected value              | —       |
| `disabled`     | Disable the combobox                  | `false` |
| `clearable`    | Show clear button when value selected | `false` |
| `empty-message`| Message when no options match         | `'No results found'` |

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

### Switch

```html
<a11y-switch label="Enable notifications"></a11y-switch>

<!-- Checked by default -->
<a11y-switch checked label="Dark mode"></a11y-switch>

<!-- Disabled -->
<a11y-switch disabled label="Premium feature"></a11y-switch>
```

#### Attributes

| Attribute  | Description            | Default |
| ---------- | ---------------------- | ------- |
| `label`    | Label text             | —       |
| `checked`  | Whether switch is on   | `false` |
| `disabled` | Disable the switch     | `false` |
| `value`    | Value for form submission | —    |
| `name`     | Name for form submission  | —    |

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

### Checkbox

```html
<a11y-checkbox label="I accept the terms"></a11y-checkbox>

<!-- Checked by default -->
<a11y-checkbox checked label="Subscribe to newsletter"></a11y-checkbox>

<!-- Indeterminate state (for "select all" pattern) -->
<a11y-checkbox indeterminate label="Select all"></a11y-checkbox>

<!-- Disabled -->
<a11y-checkbox disabled label="Disabled option"></a11y-checkbox>
```

#### Attributes

| Attribute       | Description                  | Default |
| --------------- | ---------------------------- | ------- |
| `label`         | Label text                   | —       |
| `checked`       | Whether checkbox is checked  | `false` |
| `indeterminate` | Indeterminate state (mixed)  | `false` |
| `disabled`      | Disable the checkbox         | `false` |
| `value`         | Value for form submission    | —       |
| `name`          | Name for form submission     | —       |

#### Properties

```js
const checkbox = document.querySelector('a11y-checkbox');
checkbox.checked = true; // Set checked
checkbox.indeterminate = true; // Set indeterminate
```

#### Events

```js
checkbox.addEventListener('change', (e) => {
  console.log('Checked:', e.detail.checked);
  console.log('Indeterminate:', e.detail.indeterminate);
  console.log('Value:', e.detail.value);
  console.log('Name:', e.detail.name);
});
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

/* Switch */
a11y-switch {
  --compa11y-switch-bg: #d1d5db;
  --compa11y-switch-checked-bg: #0066cc;
  --compa11y-switch-thumb-bg: white;
  --compa11y-switch-width: 2.75rem;
  --compa11y-switch-height: 1.5rem;
  --compa11y-switch-thumb-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

/* Checkbox */
a11y-checkbox {
  --compa11y-checkbox-size: 1.25rem;
  --compa11y-checkbox-border: 2px solid #666;
  --compa11y-checkbox-radius: 4px;
  --compa11y-checkbox-bg: white;
  --compa11y-checkbox-checked-bg: #0066cc;
  --compa11y-checkbox-checked-border: #0066cc;
  --compa11y-checkbox-check-color: white;
  --compa11y-checkbox-label-color: inherit;
  --compa11y-checkbox-label-size: 1rem;
  --compa11y-checkbox-disabled-color: #999;
  --compa11y-checkbox-hover-border: #0066cc;
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
