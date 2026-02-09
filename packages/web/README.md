# @a11y-core/web

Accessible Web Components for any HTML page. No framework required.

## Installation

### CDN (Recommended for quick start)

```html
<script src="https://unpkg.com/@a11y-core/web"></script>
```

### npm

```bash
npm install @a11y-core/web
```

```js
import '@a11y-core/web';
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

## Styling

Use CSS custom properties for theming:

```css
/* Dialog */
a11y-dialog {
  --a11y-core-dialog-bg: white;
  --a11y-core-dialog-radius: 8px;
  --a11y-core-dialog-padding: 1.5rem;
  --a11y-core-dialog-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  --a11y-core-dialog-overlay-bg: rgba(0, 0, 0, 0.5);
  --a11y-core-dialog-z-index: 9999;
}

/* Menu */
a11y-menu {
  --a11y-core-menu-bg: white;
  --a11y-core-menu-border: 1px solid #e0e0e0;
  --a11y-core-menu-radius: 4px;
  --a11y-core-menu-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  --a11y-core-menu-item-hover-bg: #f5f5f5;
}

/* Tabs */
a11y-tabs {
  --a11y-core-tabs-border: 1px solid #e0e0e0;
  --a11y-core-tab-padding: 0.75rem 1rem;
  --a11y-core-tab-color: #666;
  --a11y-core-tab-active-color: #0066cc;
}

/* Focus ring */
:root {
  --a11y-core-focus-color: #0066cc;
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
} from '@a11y-core/web';

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
