# @a11y-core/core

Framework-agnostic accessibility primitives for building accessible UI components.

## Installation

```bash
npm install @a11y-core/core
```

## Features

- **Focus Management** — Focus traps, focus scope, roving tabindex
- **Keyboard Navigation** — Pre-built patterns for menus, tabs, grids
- **Screen Reader Support** — Live region announcements
- **ARIA Utilities** — Helpers for managing ARIA attributes
- **Dev Warnings** — Catch accessibility issues during development

## Usage

### Focus Trap

```ts
import { createFocusTrap } from '@a11y-core/core';

const dialog = document.getElementById('dialog');
const trap = createFocusTrap(dialog, {
  escapeDeactivates: true,
  returnFocus: true,
});

// Activate when dialog opens
trap.activate();

// Deactivate when dialog closes
trap.deactivate();
```

### Announcements

```ts
import { announce, announcePolite, announceAssertive } from '@a11y-core/core';

// Polite announcement (doesn't interrupt)
announcePolite('Item added to cart');

// Assertive announcement (interrupts current speech)
announceAssertive('Error: Form submission failed');
```

### Keyboard Navigation

```ts
import { createKeyboardManager, KeyboardPatterns } from '@a11y-core/core';

const manager = createKeyboardManager(
  KeyboardPatterns.menu({
    onUp: () => focusPreviousItem(),
    onDown: () => focusNextItem(),
    onEnter: () => selectItem(),
    onEscape: () => closeMenu(),
  })
);

manager.attach(menuElement);
```

### ARIA Utilities

```ts
import { aria, buildAriaProps, hasAccessibleName } from '@a11y-core/core';

// Set individual ARIA attributes
aria.setExpanded(button, true);
aria.setControls(button, 'menu-id');

// Build props object for React/frameworks
const props = buildAriaProps({
  expanded: true,
  controls: 'menu-id',
  hasPopup: 'menu',
});

// Check accessibility
if (!hasAccessibleName(element)) {
  console.warn('Element needs an accessible name');
}
```

### Dev Warnings

```ts
import { checks, createComponentWarnings } from '@a11y-core/core';

// Use pre-built checks
checks.accessibleLabel(element, 'MyComponent');

// Create component-scoped warnings
const warnings = createComponentWarnings('MyComponent');
warnings.error('Missing required prop', 'Add the "label" prop');
```

## API Reference

### Focus

- `createFocusTrap(container, options)` — Create a focus trap
- `createFocusScope(container, options)` — Manage focus within a scope
- `createRovingTabindex(container, selector, options)` — Roving tabindex pattern
- `initFocusVisible()` — Initialize focus-visible detection

### Announcer

- `initAnnouncer()` — Initialize live regions
- `announce(message, options)` — General announcement
- `announcePolite(message)` — Non-interrupting announcement
- `announceAssertive(message)` — Interrupting announcement
- `createAnnouncer(defaults)` — Create scoped announcer

### Keyboard

- `createKeyboardManager(handlers, options)` — Keyboard event handling
- `KeyboardPatterns.menu(handlers)` — Menu navigation pattern
- `KeyboardPatterns.tabs(handlers)` — Tabs navigation pattern
- `KeyboardPatterns.grid(handlers)` — Grid navigation pattern
- `createTypeAhead(items, options)` — Type-ahead search

### ARIA

- `aria.*` — ARIA attribute setters
- `buildAriaProps(props)` — Build props object
- `hasAccessibleName(element)` — Check for accessible name
- `mergeAriaIds(...ids)` — Merge ARIA ID lists

### Dev

- `warn(warning)` — Issue a warning
- `checks.*` — Pre-built accessibility checks
- `createComponentWarnings(name)` — Create scoped warnings

### DOM Utilities

- `isFocusable(element)` — Check if focusable
- `isTabbable(element)` — Check if tabbable
- `getFocusableElements(container)` — Get all focusable elements
- `getTabbableElements(container)` — Get all tabbable elements
- `getFirstFocusable(container)` — Get first focusable
- `getLastFocusable(container)` — Get last focusable

### Platform

- `isBrowser()` — Check if in browser
- `isMac()` — Check if macOS
- `prefersReducedMotion()` — Check motion preference
- `prefersHighContrast()` — Check contrast preference
- `prefersDarkMode()` — Check color scheme preference

## License

MIT
