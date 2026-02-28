# Compa11y

**Accessible components that just work.** React + Web Components.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)

---

Compa11y provides fully accessible UI components for React and vanilla JavaScript. Focus on building your app—we handle keyboard navigation, ARIA attributes, screen reader announcements, and more.

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

compa11y is currently in **alpha (v0.1.0)**.
We are actively adding more components. Current components are:

- Button
- Combobox
- Dialog
- Input
- Menu
- Select
- Switch
- Tabs
- Textarea
- Toast

## Packages

| Package                             | Description                       | Install                       |
| ----------------------------------- | --------------------------------- | ----------------------------- |
| [@compa11y/react](./packages/react) | React components and hooks        | `npm install @compa11y/react` |
| [@compa11y/web](./packages/web)     | Web Components for CDN/vanilla JS | `npm install @compa11y/web`   |
| [@compa11y/core](./packages/core)   | Framework-agnostic primitives     | `npm install @compa11y/core`  |

## Quick Start

### React

```bash
npm install @compa11y/react
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
} from '@compa11y/react';

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
<script src="https://unpkg.com/@compa11y/web"></script>

<!-- Dialog -->
<button id="open-dialog">Open Dialog</button>
<compa11y-dialog trigger="#open-dialog">
  <h2 slot="title">Confirm Action</h2>
  <p slot="description">Are you sure?</p>
  <div slot="actions">
    <button onclick="this.closest('compa11y-dialog').close()">Cancel</button>
    <button onclick="handleConfirm()">Confirm</button>
  </div>
</compa11y-dialog>

<!-- Tabs -->
<compa11y-tabs>
  <button role="tab" aria-controls="panel-1">Tab 1</button>
  <button role="tab" aria-controls="panel-2">Tab 2</button>
  <div role="tabpanel" id="panel-1">Content 1</div>
  <div role="tabpanel" id="panel-2">Content 2</div>
</compa11y-tabs>

<!-- Menu -->
<compa11y-menu>
  <button slot="trigger">Actions</button>
  <button role="menuitem">Edit</button>
  <div role="separator"></div>
  <button role="menuitem">Delete</button>
</compa11y-menu>
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

### Switch

Toggle switch component with support for controlled/uncontrolled modes.

```tsx
import { Switch } from '@compa11y/react';

function Settings() {
  const [enabled, setEnabled] = useState(false);

  return (
    <Switch checked={enabled} onCheckedChange={setEnabled}>
      Enable notifications
    </Switch>
  );
}
```

**Keyboard Navigation:**
| Key | Action |
|-----|--------|
| `Space` / `Enter` | Toggle switch |

**Customization:**

```css
.my-switch {
  --compa11y-switch-bg: #d1d5db;
  --compa11y-switch-checked-bg: #10b981;
  --compa11y-switch-thumb-bg: white;
  --compa11y-switch-width: 3rem;
  --compa11y-switch-height: 1.75rem;
}
```

## React Hooks

```tsx
import {
  useFocusTrap, // Trap focus within a container
  useAnnouncer, // Screen reader announcements
  useKeyboard, // Keyboard event handling
  useFocusVisible, // Detect keyboard vs mouse focus
  useRovingTabindex, // Roving tabindex pattern
} from '@compa11y/react';

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

Use `@compa11y/core` to build your own accessible components:

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
} from '@compa11y/core';

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
[data-compa11y-dialog-overlay] {
  background: rgba(0, 0, 0, 0.5);
}

[data-compa11y-dialog] {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
}

/* Menu */
[data-compa11y-action-menu-content] {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

[data-compa11y-action-menu-item][data-highlighted='true'] {
  background: #f0f0f0;
}

/* Tabs */
[data-compa11y-tab][data-selected='true'] {
  color: #0066cc;
  border-bottom: 2px solid #0066cc;
}

/* Combobox */
[data-compa11y-combobox-option][data-highlighted='true'] {
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
  --compa11y-dialog-bg: white;
  --compa11y-dialog-radius: 8px;
  --compa11y-dialog-padding: 1.5rem;
  --compa11y-dialog-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  --compa11y-dialog-overlay-bg: rgba(0, 0, 0, 0.5);
}

a11y-menu {
  --compa11y-menu-bg: white;
  --compa11y-menu-border: 1px solid #e0e0e0;
  --compa11y-menu-item-hover-bg: #f5f5f5;
}

a11y-tabs {
  --compa11y-tabs-border: 1px solid #e0e0e0;
  --compa11y-tab-active-color: #0066cc;
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

compa11y warns you in development when accessibility is missing:

```
[compa11y/Dialog] Missing accessible title. Add a DialogTitle or aria-label prop.
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
compa11y/
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
