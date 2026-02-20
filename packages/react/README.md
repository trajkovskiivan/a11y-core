# @compa11y/react

Accessible React components that just work. Every component handles ARIA attributes, keyboard navigation, focus management, and screen reader announcements under the hood.

## Installation

```bash
npm install @compa11y/react
```

## Components

Dialog, ActionMenu, Tabs, Toast, Combobox, Select, Listbox, Checkbox, RadioGroup, Switch, Input, Textarea, Button

## Hooks

`useFocusTrap`, `useFocusVisible`, `useFocusNeighbor`, `useFocusReturn`, `useKeyboard`, `useMenuKeyboard`, `useTabsKeyboard`, `useGridKeyboard`, `useTypeAhead`, `useAnnouncer`, `useRovingTabindex`, and more.

## Quick start

```tsx
import { Dialog, Select, useToastHelpers } from '@compa11y/react';

// Fully accessible dialog — focus trap, Escape to close, screen reader announcements
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Title>Confirm</Dialog.Title>
  <Dialog.Content>Are you sure?</Dialog.Content>
  <Dialog.Actions>
    <button onClick={() => setIsOpen(false)}>Cancel</button>
    <button onClick={handleConfirm}>Confirm</button>
  </Dialog.Actions>
</Dialog>
```

## Documentation

Full documentation, live examples, props reference, and accessibility details at **[compa11y.org](https://compa11y.org)**.

## License

MIT
