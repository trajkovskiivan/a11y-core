# @compa11y/react

Accessible React components that just work.

## Installation

```bash
npm install @compa11y/react
```

## Components

### Dialog

```tsx
import { Dialog } from '@compa11y/react';

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
import { Menu } from '@compa11y/react';

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
import { Tabs } from '@compa11y/react';

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
import {
  ToastProvider,
  ToastViewport,
  useToastHelpers,
} from '@compa11y/react';

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

  return <button onClick={() => success('Settings saved!')}>Save</button>;
}
```

### Combobox

```tsx
import { Combobox } from '@compa11y/react';

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

### Switch

```tsx
import { Switch } from '@compa11y/react';

function NotificationSettings() {
  const [enabled, setEnabled] = useState(false);

  return (
    <Switch checked={enabled} onCheckedChange={setEnabled}>
      Enable notifications
    </Switch>
  );
}
```

**Customization:**

```css
.my-switch {
  --compa11y-switch-bg: #d1d5db;
  --compa11y-switch-checked-bg: #10b981;
  --compa11y-switch-thumb-bg: white;
  --compa11y-switch-width: 3rem;
  --compa11y-switch-height: 1.75rem;
  --compa11y-focus-color: #10b981;
}
```

### Checkbox

```tsx
import { Checkbox } from '@compa11y/react';

function TermsAcceptance() {
  const [accepted, setAccepted] = useState(false);

  return (
    <Checkbox checked={accepted} onCheckedChange={setAccepted}>
      I accept the terms and conditions
    </Checkbox>
  );
}

// Indeterminate state (for "select all" pattern)
function SelectAllCheckbox({ items, selectedIds, onSelectedChange }) {
  const allSelected = selectedIds.length === items.length;
  const someSelected = selectedIds.length > 0 && !allSelected;

  return (
    <Checkbox
      checked={allSelected ? true : someSelected ? 'indeterminate' : false}
      onCheckedChange={(checked) => {
        onSelectedChange(checked ? items.map((item) => item.id) : []);
      }}
    >
      Select all
    </Checkbox>
  );
}
```

**Customization:**

```css
.my-checkbox {
  --compa11y-checkbox-size: 1.5rem;
  --compa11y-checkbox-checked-bg: #10b981;
  --compa11y-checkbox-checked-border: #10b981;
  --compa11y-checkbox-check-color: white;
  --compa11y-checkbox-radius: 8px;
  --compa11y-checkbox-label-size: 1.125rem;
  --compa11y-focus-color: #10b981;
}
```

**Available CSS variables:**
- `--compa11y-checkbox-size` - Size of the checkbox box (default: `1.25rem`)
- `--compa11y-checkbox-radius` - Border radius (default: `4px`)
- `--compa11y-checkbox-bg` - Background color unchecked (default: `white`)
- `--compa11y-checkbox-border` - Border style unchecked (default: `2px solid #666`)
- `--compa11y-checkbox-checked-bg` - Background color checked (default: `#0066cc`)
- `--compa11y-checkbox-checked-border` - Border color checked (default: `#0066cc`)
- `--compa11y-checkbox-check-color` - Checkmark/icon color (default: `white`)
- `--compa11y-checkbox-label-color` - Label text color (default: `inherit`)
- `--compa11y-checkbox-label-size` - Label font size (default: `1rem`)
- `--compa11y-checkbox-disabled-color` - Disabled label color (default: `#999`)
- `--compa11y-focus-color` - Focus outline color (default: `#0066cc`)

## Hooks

### useFocusTrap

```tsx
import { useFocusTrap } from '@compa11y/react';

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
import { useAnnouncer } from '@compa11y/react';

function SearchResults({ count }) {
  const { announce } = useAnnouncer();

  useEffect(() => {
    announce(`Found ${count} results`);
  }, [count, announce]);
}
```

### useKeyboard

```tsx
import { useKeyboard } from '@compa11y/react';

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
import { useFocusVisible } from '@compa11y/react';

function Button({ children }) {
  const { isFocusVisible, focusProps } = useFocusVisible();

  return (
    <button {...focusProps} className={isFocusVisible ? 'focus-ring' : ''}>
      {children}
    </button>
  );
}
```

### useRovingTabindex

```tsx
import { useRovingTabindex } from '@compa11y/react';

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
[data-compa11y-dialog-overlay] {
  background: rgba(0, 0, 0, 0.5);
}

[data-compa11y-dialog] {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
}

/* Menu */
[data-compa11y-menu-content] {
  background: white;
  border: 1px solid #e0e0e0;
}

[data-compa11y-menu-item][data-highlighted='true'] {
  background: #f0f0f0;
}

/* Tabs */
[data-compa11y-tab][data-selected='true'] {
  border-bottom: 2px solid blue;
}

/* Combobox */
[data-compa11y-combobox-option][data-highlighted='true'] {
  background: #f0f0f0;
}
```

## License

MIT
