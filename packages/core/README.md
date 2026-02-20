# @compa11y/core

Framework-agnostic accessibility primitives for building accessible UI components.

## Installation

```bash
npm install @compa11y/core
```

## What's included

- **Focus Management** — Focus traps, focus scope, roving tabindex, focus neighbor/return
- **Keyboard Navigation** — Pre-built patterns for menus, tabs, grids, dialogs
- **Screen Reader Support** — Live region announcements (polite & assertive)
- **ARIA Utilities** — Helpers for managing ARIA attributes and relationships
- **Platform Detection** — Detect reduced motion, high contrast, dark mode preferences
- **Dev Warnings** — Catch accessibility issues during development

## Quick start

```ts
import { createFocusTrap, announce, aria } from '@compa11y/core';

// Trap focus in a dialog
const trap = createFocusTrap(dialogElement, { escapeDeactivates: true });
trap.activate();

// Announce to screen readers
announce('Item added to cart');

// Set ARIA attributes
aria.setExpanded(button, true);
```

## Documentation

Full documentation, API reference, and examples at **[compa11y.org](https://compa11y.org)**.

## License

MIT
