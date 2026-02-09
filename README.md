# A11yCore

**Accessible components that just work.** React + Web Components.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)

---

A11yCore provides fully accessible UI components for React and vanilla JavaScript. Focus on building your app—we handle keyboard navigation, ARIA attributes, screen reader announcements, and more.

**By Ivan Trajkovski**

## Features

- **Zero Configuration** — Components are accessible by default
- **Framework Agnostic** — Works with React, Next.js, or plain HTML/JS (Vue, Svelte, Angular coming soon)
- **Dev Warnings** — Get console feedback when accessibility is missing
- **Full Keyboard Support** — Arrow keys, Tab, Enter, Escape all work correctly
- **Screen Reader Ready** — Proper ARIA roles, live regions, and announcements
- **Fully Customizable** — Style components however you want
- **Tree-Shakeable** — Import only what you need
- **TypeScript First** — Full type safety included

## Release Status

a11y-core is currently in **alpha (v0.1.0)**.  
We are actively adding more components. Current components are:

- Combobox
- Dialog
- Menu
- Tabs
- Toast

## Packages

| Package                              | Description                       | Install                        |
| ------------------------------------ | --------------------------------- | ------------------------------ |
| [@a11y-core/react](./packages/react) | React components and hooks        | `npm install @a11y-core/react` |
| [@a11y-core/web](./packages/web)     | Web Components for CDN/vanilla JS | `npm install @a11y-core/web`   |
| [@a11y-core/core](./packages/core)   | Framework-agnostic primitives     | `npm install @a11y-core/core`  |

## Quick Start

### React

```bash
npm install @a11y-core/react
```

```tsx
import { useState } from 'react';
import {
  Dialog,
  ActionMenu,
  Tabs,
  Combobox,
  ToastProvider,
  ToastViewport,
  useToastHelpers,
} from '@a11y-core/react';

function App() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <ToastProvider>
      <Dialog.Trigger onClick={() => setDialogOpen(true)}>
        Open Dialog
      </Dialog.Trigger>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Title>Confirm Action</Dialog.Title>
        <Dialog.Description>
          Are you sure you want to proceed?
        </Dialog.Description>
        <Dialog.Actions>
          <button onClick={() => setDialogOpen(false)}>Cancel</button>
          <button onClick={handleConfirm}>Confirm</button>
        </Dialog.Actions>
      </Dialog>

      <Tabs defaultValue="general">
        <Tabs.List aria-label="Settings">
          <Tabs.Tab value="general">General</Tabs.Tab>
          <Tabs.Tab value="security">Security</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="general">General settings...</Tabs.Panel>
        <Tabs.Panel value="security">Security settings...</Tabs.Panel>
      </Tabs>

      <ActionMenu>
        <ActionMenu.Trigger>Actions</ActionMenu.Trigger>
        <ActionMenu.Content>
          <ActionMenu.Item onSelect={() => console.log('Edit')}>
            Edit
          </ActionMenu.Item>
          <ActionMenu.Separator />
          <ActionMenu.Item onSelect={() => console.log('Delete')}>
            Delete
          </ActionMenu.Item>
        </ActionMenu.Content>
      </ActionMenu>

      <Combobox options={countries} value={country} onValueChange={setCountry}>
        <Combobox.Input placeholder="Select country..." clearable />
        <Combobox.Listbox emptyMessage="No results found" />
      </Combobox>

      <ToastViewport position="bottom-right" />
    </ToastProvider>
  );
}
```

### Web Components (Vanilla HTML)

```html
<script src="https://unpkg.com/@a11y-core/web"></script>

<!-- Dialog -->
<button id="open-dialog">Open Dialog</button>
<a11y-dialog trigger="#open-dialog">
  <h2 slot="title">Confirm Action</h2>
  <p slot="description">Are you sure?</p>
  <div slot="actions">
    <button onclick="this.closest('a11y-dialog').close()">Cancel</button>
    <button onclick="handleConfirm()">Confirm</button>
  </div>
</a11y-dialog>

<!-- Tabs -->
<a11y-tabs>
  <button role="tab" aria-controls="panel-1">Tab 1</button>
  <button role="tab" aria-controls="panel-2">Tab 2</button>
  <div role="tabpanel" id="panel-1">Content 1</div>
  <div role="tabpanel" id="panel-2">Content 2</div>
</a11y-tabs>

<!-- Menu -->
<a11y-menu>
  <button slot="trigger">Actions</button>
  <button role="menuitem">Edit</button>
  <div role="separator"></div>
  <button role="menuitem">Delete</button>
</a11y-menu>
```

## Components

### Dialog

Accessible modal dialog with focus trapping and keyboard navigation.

```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <Dialog.Title>Title</Dialog.Title>
  <Dialog.Description>Description</Dialog.Description>
  <Dialog.Actions>
    <button>Cancel</button>
    <button>Confirm</button>
  </Dialog.Actions>
</Dialog>
```

**Keyboard Navigation:**
| Key | Action |
|-----|--------|
| `Tab` | Move between focusable elements |
| `Escape` | Close the dialog |

### ActionMenu / Menu

Dropdown menu with keyboard navigation and proper ARIA roles.

```tsx
<ActionMenu>
  <ActionMenu.Trigger>Actions</ActionMenu.Trigger>
  <ActionMenu.Content>
    <ActionMenu.Item onSelect={handleEdit}>Edit</ActionMenu.Item>
    <ActionMenu.Separator />
    <ActionMenu.Item onSelect={handleDelete}>Delete</ActionMenu.Item>
  </ActionMenu.Content>
</ActionMenu>
```

**Keyboard Navigation:**
| Key | Action |
|-----|--------|
| `Enter` / `Space` | Open menu / Select item |
| `Arrow Up` / `Arrow Down` | Navigate items |
| `Home` / `End` | Jump to first / last item |
| `Escape` | Close menu |

### Tabs

Tab interface with automatic keyboard navigation.

```tsx
<Tabs defaultValue="tab1">
  <Tabs.List aria-label="Settings">
    <Tabs.Tab value="tab1">Tab 1</Tabs.Tab>
    <Tabs.Tab value="tab2">Tab 2</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value="tab1">Content 1</Tabs.Panel>
  <Tabs.Panel value="tab2">Content 2</Tabs.Panel>
</Tabs>
```

**Keyboard Navigation:**
| Key | Action |
|-----|--------|
| `Arrow Left` / `Arrow Right` | Switch between tabs |
| `Home` / `End` | Jump to first / last tab |

### Toast

Accessible toast notifications with automatic screen reader announcements.

```tsx
<ToastProvider>
  <App />
  <ToastViewport position="bottom-right" />
</ToastProvider>;

// In your component
const { success, error, warning, info } = useToastHelpers();
success('Success!', 'Your changes have been saved.');
error('Error!', 'Something went wrong.');
```

**Features:**

- Toasts are announced to screen readers via live regions
- Auto-dismiss with configurable duration
- Multiple toast types: success, error, warning, info

### Combobox

Autocomplete input with keyboard navigation and filtering.

```tsx
const countries = [
  { value: 'us', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' },
];

<Combobox options={countries} value={value} onValueChange={setValue}>
  <Combobox.Input placeholder="Select country..." clearable />
  <Combobox.Listbox emptyMessage="No countries found" />
</Combobox>;
```

**Keyboard Navigation:**
| Key | Action |
|-----|--------|
| `Arrow Up` / `Arrow Down` | Navigate options |
| `Enter` | Select highlighted option |
| `Escape` | Close dropdown |
| Type to filter | Filter options |

## React Hooks

```tsx
import {
  useFocusTrap, // Trap focus within a container
  useAnnouncer, // Screen reader announcements
  useKeyboard, // Keyboard event handling
  useFocusVisible, // Detect keyboard vs mouse focus
  useRovingTabindex, // Roving tabindex pattern
} from '@a11y-core/react';

// Focus Trap
function Modal({ isOpen }) {
  const trapRef = useFocusTrap({ active: isOpen });
  return <div ref={trapRef}>...</div>;
}

// Screen Reader Announcements
function SearchResults({ count }) {
  const { announce } = useAnnouncer();
  useEffect(() => announce(`Found ${count} results`), [count]);
}

// Keyboard Handler
function CustomList() {
  const keyboardProps = useKeyboard({
    ArrowDown: () => focusNext(),
    ArrowUp: () => focusPrevious(),
    Enter: () => selectItem(),
  });
  return <ul {...keyboardProps}>...</ul>;
}

// Roving Tabindex
function Toolbar() {
  const { getItemProps } = useRovingTabindex({
    itemCount: 3,
    orientation: 'horizontal',
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

## Core Primitives

Use `@a11y-core/core` to build your own accessible components:

```ts
import {
  // Focus management
  createFocusTrap,
  createRovingTabindex,

  // Announcements
  announcePolite,
  announceAssertive,

  // Keyboard
  createKeyboardManager,
  KeyboardPatterns,

  // ARIA helpers
  aria,
  hasAccessibleName,

  // Platform detection
  prefersReducedMotion,
  prefersHighContrast,
} from '@a11y-core/core';

// Create a focus trap
const trap = createFocusTrap(dialogElement, {
  escapeDeactivates: true,
  returnFocus: true,
});
trap.activate();

// Announce to screen readers
announcePolite('Item added to cart');
announceAssertive('Error: Form submission failed');

// Check user preferences
if (prefersReducedMotion()) {
  // Disable animations
}
```

## Styling

### React Components

Components use `data-*` attributes for state-based styling:

```css
/* Dialog */
[data-a11y-core-dialog-overlay] {
  background: rgba(0, 0, 0, 0.5);
}

[data-a11y-core-dialog] {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
}

/* Menu */
[data-a11y-core-action-menu-content] {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

[data-a11y-core-action-menu-item][data-highlighted='true'] {
  background: #f0f0f0;
}

/* Tabs */
[data-a11y-core-tab][data-selected='true'] {
  color: #0066cc;
  border-bottom: 2px solid #0066cc;
}

/* Combobox */
[data-a11y-core-combobox-option][data-highlighted='true'] {
  background: #f0f0f0;
}
```

#### Unstyled Mode

Use the `unstyled` prop for full styling control. It removes visual styles while keeping structural and behavioral styles:

```tsx
<Dialog unstyled open={open} onOpenChange={setOpen}>
  {/* Apply your own styles */}
</Dialog>

<ActionMenu unstyled>
  {/* Fully custom styling */}
</ActionMenu>
```

### Web Components

Use CSS custom properties:

```css
a11y-dialog {
  --a11y-core-dialog-bg: white;
  --a11y-core-dialog-radius: 8px;
  --a11y-core-dialog-padding: 1.5rem;
  --a11y-core-dialog-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  --a11y-core-dialog-overlay-bg: rgba(0, 0, 0, 0.5);
}

a11y-menu {
  --a11y-core-menu-bg: white;
  --a11y-core-menu-border: 1px solid #e0e0e0;
  --a11y-core-menu-item-hover-bg: #f5f5f5;
}

a11y-tabs {
  --a11y-core-tabs-border: 1px solid #e0e0e0;
  --a11y-core-tab-active-color: #0066cc;
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
```

## Dev Warnings

a11y-core warns you in development when accessibility is missing:

```
[a11y-core/Dialog] Missing accessible title. Add a DialogTitle or aria-label prop.
Suggestion: Use <Dialog.Title> or provide aria-label="..."
```

## Browser Support

- Chrome / Edge 88+
- Firefox 78+
- Safari 14+

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Start dev mode
pnpm dev
```

### Project Structure

```
a11y-core/
├── packages/
│   ├── core/          # Framework-agnostic primitives
│   ├── react/         # React components
│   └── web/           # Web Components
├── examples/
│   ├── react-demo/    # React demo app
│   └── vanilla-demo/  # Vanilla HTML demo
└── .changeset/        # Version management
```

## License

MIT

---

**Built with accessibility in mind by Ivan Trajkovski**
