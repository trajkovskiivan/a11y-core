# @a11ykit/react

Accessible React components that just work.

## Installation

```bash
npm install @a11ykit/react
```

## Components

### Dialog

```tsx
import { Dialog } from '@a11ykit/react';

function ConfirmDialog({ open, onClose, onConfirm }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <Dialog.Title>Confirm Delete</Dialog.Title>
      <Dialog.Description>
        Are you sure you want to delete this item?
      </Dialog.Description>
      <Dialog.Actions>
        <button onClick={onClose}>Cancel</button>
        <button onClick={onConfirm}>Delete</button>
      </Dialog.Actions>
    </Dialog>
  );
}
```

### Menu

```tsx
import { Menu } from '@a11ykit/react';

function ActionMenu() {
  return (
    <Menu>
      <Menu.Trigger>Actions</Menu.Trigger>
      <Menu.Content>
        <Menu.Item onSelect={() => console.log('Edit')}>Edit</Menu.Item>
        <Menu.Item onSelect={() => console.log('Copy')}>Copy</Menu.Item>
        <Menu.Separator />
        <Menu.Item onSelect={() => console.log('Delete')}>Delete</Menu.Item>
      </Menu.Content>
    </Menu>
  );
}
```

### Tabs

```tsx
import { Tabs } from '@a11ykit/react';

function SettingsTabs() {
  return (
    <Tabs defaultValue="general">
      <Tabs.List>
        <Tabs.Tab value="general">General</Tabs.Tab>
        <Tabs.Tab value="security">Security</Tabs.Tab>
        <Tabs.Tab value="notifications">Notifications</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="general">General settings...</Tabs.Panel>
      <Tabs.Panel value="security">Security settings...</Tabs.Panel>
      <Tabs.Panel value="notifications">Notification settings...</Tabs.Panel>
    </Tabs>
  );
}
```

### Toast

```tsx
import { ToastProvider, ToastViewport, useToastHelpers } from '@a11ykit/react';

function App() {
  return (
    <ToastProvider>
      <Content />
      <ToastViewport position="bottom-right" />
    </ToastProvider>
  );
}

function Content() {
  const { success, error } = useToastHelpers();

  return (
    <button onClick={() => success('Settings saved!')}>
      Save
    </button>
  );
}
```

### Combobox

```tsx
import { Combobox } from '@a11ykit/react';

const countries = [
  { value: 'us', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'ca', label: 'Canada' },
];

function CountrySelect() {
  const [value, setValue] = useState(null);

  return (
    <Combobox
      options={countries}
      value={value}
      onValueChange={setValue}
      aria-label="Select country"
    >
      <Combobox.Input placeholder="Choose a country..." clearable />
      <Combobox.Listbox emptyMessage="No countries found" />
    </Combobox>
  );
}
```

## Hooks

### useFocusTrap

```tsx
import { useFocusTrap } from '@a11ykit/react';

function Modal({ isOpen }) {
  const trapRef = useFocusTrap({ active: isOpen });

  return (
    <div ref={trapRef} role="dialog">
      <button>Close</button>
    </div>
  );
}
```

### useAnnouncer

```tsx
import { useAnnouncer } from '@a11ykit/react';

function SearchResults({ count }) {
  const { announce } = useAnnouncer();

  useEffect(() => {
    announce(`Found ${count} results`);
  }, [count, announce]);
}
```

### useKeyboard

```tsx
import { useKeyboard } from '@a11ykit/react';

function CustomList() {
  const keyboardProps = useKeyboard({
    ArrowDown: () => focusNext(),
    ArrowUp: () => focusPrevious(),
    Enter: () => selectItem(),
  });

  return <ul {...keyboardProps}>...</ul>;
}
```

### useFocusVisible

```tsx
import { useFocusVisible } from '@a11ykit/react';

function Button({ children }) {
  const { isFocusVisible, focusProps } = useFocusVisible();

  return (
    <button
      {...focusProps}
      className={isFocusVisible ? 'focus-ring' : ''}
    >
      {children}
    </button>
  );
}
```

### useRovingTabindex

```tsx
import { useRovingTabindex } from '@a11ykit/react';

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

## Styling

All components are unstyled. Use `data-*` attributes for state-based styling:

```css
/* Dialog */
[data-a11ykit-dialog-overlay] {
  background: rgba(0, 0, 0, 0.5);
}

[data-a11ykit-dialog] {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
}

/* Menu */
[data-a11ykit-menu-content] {
  background: white;
  border: 1px solid #e0e0e0;
}

[data-a11ykit-menu-item][data-highlighted="true"] {
  background: #f0f0f0;
}

/* Tabs */
[data-a11ykit-tab][data-selected="true"] {
  border-bottom: 2px solid blue;
}

/* Combobox */
[data-a11ykit-combobox-option][data-highlighted="true"] {
  background: #f0f0f0;
}
```

## License

MIT
