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

### Select

```tsx
import { Select } from '@compa11y/react';

const fruits = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'dragonfruit', label: 'Dragon Fruit', disabled: true },
  { value: 'elderberry', label: 'Elderberry' },
];

function FruitPicker() {
  const [value, setValue] = useState(null);

  return (
    <Select
      options={fruits}
      value={value}
      onValueChange={setValue}
      aria-label="Choose a fruit"
    >
      <Select.Trigger placeholder="Pick a fruit..." />
      <Select.Listbox />
    </Select>
  );
}
```

**Keyboard Navigation:**

| Key | Action |
| --- | --- |
| `Enter` / `Space` | Open listbox or select highlighted option |
| `ArrowDown` | Open listbox / move highlight down |
| `ArrowUp` | Open listbox / move highlight up |
| `Home` / `End` | Jump to first / last option |
| `Escape` | Close listbox |
| `Tab` | Close listbox and move focus |
| Type characters | Jump to matching option (type-ahead) |

**Props:**

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `options` | `SelectOption[]` | — | List of options |
| `value` | `string \| null` | — | Controlled selected value |
| `defaultValue` | `string` | — | Default value (uncontrolled) |
| `onValueChange` | `(value: string \| null) => void` | — | Change handler |
| `placeholder` | `string` | `'Select an option...'` | Trigger placeholder text |
| `disabled` | `boolean` | `false` | Disable the select |
| `aria-label` | `string` | — | Accessible label |
| `aria-labelledby` | `string` | — | ID of labelling element |

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

### RadioGroup

```tsx
import { RadioGroup } from '@compa11y/react';

function FavoriteColor() {
  const [color, setColor] = useState('red');

  return (
    <RadioGroup value={color} onValueChange={setColor} aria-label="Favorite color">
      <RadioGroup.Radio value="red">Red</RadioGroup.Radio>
      <RadioGroup.Radio value="green">Green</RadioGroup.Radio>
      <RadioGroup.Radio value="blue">Blue</RadioGroup.Radio>
    </RadioGroup>
  );
}

// Horizontal orientation
function SizePicker() {
  const [size, setSize] = useState('md');

  return (
    <RadioGroup
      value={size}
      onValueChange={setSize}
      orientation="horizontal"
      aria-label="Size"
    >
      <RadioGroup.Radio value="sm">Small</RadioGroup.Radio>
      <RadioGroup.Radio value="md">Medium</RadioGroup.Radio>
      <RadioGroup.Radio value="lg">Large</RadioGroup.Radio>
    </RadioGroup>
  );
}

// Individual disabled radio
<RadioGroup value={plan} onValueChange={setPlan} aria-label="Plan">
  <RadioGroup.Radio value="free">Free</RadioGroup.Radio>
  <RadioGroup.Radio value="pro">Pro</RadioGroup.Radio>
  <RadioGroup.Radio value="enterprise" disabled>Enterprise</RadioGroup.Radio>
</RadioGroup>
```

**Props (RadioGroup):**

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | — | Controlled selected value |
| `defaultValue` | `string` | — | Default value (uncontrolled) |
| `onValueChange` | `(value: string) => void` | — | Change handler |
| `orientation` | `'horizontal' \| 'vertical'` | `'vertical'` | Layout orientation |
| `disabled` | `boolean` | `false` | Disable all radios |
| `discoverable` | `boolean` | `true` | Keep disabled radios in tab order |
| `required` | `boolean` | `false` | Required selection |
| `name` | `string` | — | Radio group name |
| `unstyled` | `boolean` | `false` | Remove default styles |
| `aria-label` | `string` | — | Accessible label |
| `aria-labelledby` | `string` | — | ID of labelling element |

**Props (RadioGroup.Radio):**

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | — | Value for this option (required) |
| `disabled` | `boolean` | `false` | Disable this radio |
| `label` | `string` | — | Label text (alternative to children) |
| `unstyled` | `boolean` | — | Remove default styles (inherits from group) |
| `aria-label` | `string` | — | Accessible label |

**Customization:**

```css
.my-radiogroup {
  --compa11y-radio-gap: 1rem;
  --compa11y-radio-size: 1.5rem;
  --compa11y-radio-border: 2px solid #666;
  --compa11y-radio-bg: white;
  --compa11y-radio-checked-bg: #10b981;
  --compa11y-radio-checked-border: #10b981;
  --compa11y-radio-dot-size: 0.5rem;
  --compa11y-radio-dot-color: white;
  --compa11y-radio-label-color: inherit;
  --compa11y-radio-label-size: 1rem;
  --compa11y-radio-disabled-color: #999;
  --compa11y-focus-color: #10b981;
}
```

### Listbox

```tsx
import { Listbox } from '@compa11y/react';

// Single select (selection follows focus)
function FruitPicker() {
  const [fruit, setFruit] = useState('apple');

  return (
    <Listbox value={fruit} onValueChange={setFruit} aria-label="Favorite fruit">
      <Listbox.Group label="Citrus">
        <Listbox.Option value="orange">Orange</Listbox.Option>
        <Listbox.Option value="lemon">Lemon</Listbox.Option>
        <Listbox.Option value="grapefruit">Grapefruit</Listbox.Option>
      </Listbox.Group>
      <Listbox.Option value="apple">Apple</Listbox.Option>
      <Listbox.Option value="banana" disabled>Banana (sold out)</Listbox.Option>
    </Listbox>
  );
}

// Multi select (focus independent of selection)
function ToppingsPicker() {
  const [toppings, setToppings] = useState(['cheese']);

  return (
    <Listbox
      multiple
      value={toppings}
      onValueChange={setToppings}
      aria-label="Pizza toppings"
    >
      <Listbox.Option value="cheese">Cheese</Listbox.Option>
      <Listbox.Option value="pepperoni">Pepperoni</Listbox.Option>
      <Listbox.Option value="mushrooms">Mushrooms</Listbox.Option>
      <Listbox.Option value="olives">Olives</Listbox.Option>
    </Listbox>
  );
}
```

**Props (Listbox):**

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string \| string[]` | — | Controlled value (string for single, array for multi) |
| `defaultValue` | `string \| string[]` | — | Default value (uncontrolled) |
| `onValueChange` | `(value: string \| string[]) => void` | — | Change handler |
| `multiple` | `boolean` | `false` | Enable multi-select mode |
| `disabled` | `boolean` | `false` | Disable all options |
| `discoverable` | `boolean` | `true` | Keep disabled listbox in tab order |
| `orientation` | `'horizontal' \| 'vertical'` | `'vertical'` | Layout orientation |
| `unstyled` | `boolean` | `false` | Remove default styles |
| `aria-label` | `string` | — | Accessible label |
| `aria-labelledby` | `string` | — | ID of labelling element |

**Props (Listbox.Option):**

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | — | Value for this option (required) |
| `disabled` | `boolean` | `false` | Disable this option |
| `discoverable` | `boolean` | `true` | Keep disabled option discoverable |
| `unstyled` | `boolean` | — | Remove default styles (inherits from root) |
| `aria-label` | `string` | — | Accessible label override |

**Props (Listbox.Group):**

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | `string` | — | Group label (required, visible) |
| `disabled` | `boolean` | `false` | Disable all options in group |
| `unstyled` | `boolean` | — | Remove default styles (inherits from root) |

**Keyboard Navigation:**

| Key | Single Select | Multi Select |
| --- | --- | --- |
| `ArrowDown` / `ArrowUp` | Move focus and select | Move focus only |
| `Home` / `End` | First/last option and select | Move focus only |
| `Space` | — | Toggle focused option |
| `Shift+Arrow` | — | Move focus and toggle |
| `Ctrl+Shift+Home/End` | — | Select range to first/last |
| `Ctrl+A` | — | Toggle select all |
| Type characters | Jump to match and select | Jump to match |

**Customization:**

```css
[data-compa11y-listbox] {
  --compa11y-listbox-bg: white;
  --compa11y-listbox-border: 1px solid #ccc;
  --compa11y-listbox-radius: 6px;
  --compa11y-listbox-max-height: 300px;
}

[data-compa11y-listbox-option] {
  --compa11y-option-hover-bg: #f5f5f5;
  --compa11y-option-focused-bg: #e6f0ff;
  --compa11y-option-selected-bg: #e6f0ff;
  --compa11y-option-selected-color: #10b981;
  --compa11y-option-check-color: #10b981;
  --compa11y-option-disabled-color: #999;
  --compa11y-focus-color: #10b981;
}
```

### Input

```tsx
import { Input } from '@compa11y/react';

function ContactForm() {
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');

  const validate = () => {
    if (!name.trim()) setNameError('Name is required');
    else setNameError('');
  };

  return (
    <Input
      label="Full Name"
      hint="Enter your first and last name"
      error={nameError || undefined}
      required
      placeholder="John Doe"
      value={name}
      onValueChange={setName}
      onBlur={validate}
    />
  );
}

// Compound mode for custom layouts
function CustomInput() {
  const [value, setValue] = useState('');

  return (
    <Input value={value} onValueChange={setValue}>
      <Input.Label>Email</Input.Label>
      <Input.Field type="email" placeholder="you@example.com" />
      <Input.Hint>We'll never share your email</Input.Hint>
      <Input.Error>{/* error message here */}</Input.Error>
    </Input>
  );
}
```

**Props:**

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | `ReactNode` | — | Visible label text |
| `hint` | `ReactNode` | — | Hint/description text |
| `error` | `ReactNode` | — | Error message (enables `aria-invalid`) |
| `value` | `string` | — | Controlled value |
| `defaultValue` | `string` | `''` | Default value (uncontrolled) |
| `onValueChange` | `(value: string) => void` | — | Change handler |
| `type` | `string` | `'text'` | Input type (text, email, password, number, tel, url, search) |
| `placeholder` | `string` | — | Placeholder text |
| `required` | `boolean` | `false` | Required field |
| `disabled` | `boolean` | `false` | Disable the input |
| `readOnly` | `boolean` | `false` | Read-only input |
| `unstyled` | `boolean` | `false` | Remove default styles |
| `aria-label` | `string` | — | Accessible label (when no visible label) |
| `aria-labelledby` | `string` | — | ID of labelling element |

**Customization:**

```css
.my-input {
  --compa11y-input-border: 1px solid #ccc;
  --compa11y-input-border-focus: #10b981;
  --compa11y-input-border-error: #ef4444;
  --compa11y-input-radius: 8px;
  --compa11y-input-label-weight: 600;
  --compa11y-input-error-color: #ef4444;
  --compa11y-input-hint-color: #666;
  --compa11y-focus-color: #10b981;
}
```

### Button

```tsx
import { Button } from '@compa11y/react';

function Actions() {
  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <Button variant="primary" onClick={handleSave}>Save</Button>
      <Button variant="outline" onClick={handleCancel}>Cancel</Button>
      <Button variant="danger" onClick={handleDelete}>Delete</Button>
    </div>
  );
}

// Loading state
function SaveButton() {
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    await saveData();
    setLoading(false);
  };

  return (
    <Button variant="primary" loading={loading} onClick={handleSave}>
      {loading ? 'Saving...' : 'Save Changes'}
    </Button>
  );
}

// Disabled but discoverable (stays in tab order)
<Button variant="primary" disabled discoverable>
  Unavailable
</Button>
```

**Props:**

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | `'primary' \| 'secondary' \| 'danger' \| 'outline' \| 'ghost'` | `'secondary'` | Visual variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | HTML button type |
| `disabled` | `boolean` | `false` | Disable the button |
| `discoverable` | `boolean` | `false` | Keep disabled button in tab order with `aria-disabled` |
| `loading` | `boolean` | `false` | Loading state (shows spinner, sets `aria-busy`) |
| `unstyled` | `boolean` | `false` | Remove default styles |
| `aria-label` | `string` | — | Accessible label |

**Customization:**

```css
[data-compa11y-button] {
  --compa11y-button-radius: 8px;
  --compa11y-button-font-weight: 600;
  --compa11y-button-primary-bg: #10b981;
  --compa11y-button-primary-color: white;
  --compa11y-button-danger-bg: #ef4444;
  --compa11y-button-danger-color: white;
  --compa11y-button-disabled-opacity: 0.5;
  --compa11y-focus-color: #10b981;
}
```

### Textarea

```tsx
import { Textarea } from '@compa11y/react';

function FeedbackForm() {
  const [desc, setDesc] = useState('');
  const [descError, setDescError] = useState('');

  const validate = () => {
    if (!desc.trim()) setDescError('Description is required');
    else if (desc.trim().length < 10) setDescError('Must be at least 10 characters');
    else setDescError('');
  };

  return (
    <Textarea
      label="Description"
      hint="Provide at least 10 characters"
      error={descError || undefined}
      required
      rows={4}
      placeholder="Enter a description..."
      value={desc}
      onValueChange={setDesc}
      onBlur={validate}
    />
  );
}

// Compound mode for custom layouts
function CustomTextarea() {
  const [value, setValue] = useState('');

  return (
    <Textarea value={value} onValueChange={setValue}>
      <Textarea.Label>Bio</Textarea.Label>
      <Textarea.Field rows={5} placeholder="Tell us about yourself..." />
      <Textarea.Hint>Markdown is supported</Textarea.Hint>
      <Textarea.Error>{/* error message here */}</Textarea.Error>
    </Textarea>
  );
}
```

**Props:**

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | `ReactNode` | — | Visible label text |
| `hint` | `ReactNode` | — | Hint/description text |
| `error` | `ReactNode` | — | Error message (enables `aria-invalid`) |
| `value` | `string` | — | Controlled value |
| `defaultValue` | `string` | `''` | Default value (uncontrolled) |
| `onValueChange` | `(value: string) => void` | — | Change handler |
| `rows` | `number` | `3` | Number of visible text rows |
| `resize` | `string` | `'vertical'` | Resize behavior (none, both, horizontal, vertical) |
| `placeholder` | `string` | — | Placeholder text |
| `required` | `boolean` | `false` | Required field |
| `disabled` | `boolean` | `false` | Disable the textarea |
| `readOnly` | `boolean` | `false` | Read-only textarea |
| `unstyled` | `boolean` | `false` | Remove default styles |
| `aria-label` | `string` | — | Accessible label (when no visible label) |
| `aria-labelledby` | `string` | — | ID of labelling element |

**Customization:**

```css
.my-textarea {
  --compa11y-textarea-border: 1px solid #ccc;
  --compa11y-textarea-border-focus: #10b981;
  --compa11y-textarea-border-error: #ef4444;
  --compa11y-textarea-radius: 8px;
  --compa11y-textarea-label-weight: 600;
  --compa11y-textarea-error-color: #ef4444;
  --compa11y-textarea-hint-color: #666;
  --compa11y-focus-color: #10b981;
}
```

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

/* Listbox */
[data-compa11y-listbox] {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  max-height: 300px;
  overflow-y: auto;
}

[data-compa11y-listbox-option][data-focused='true'] {
  background: #e6f0ff;
}

[data-compa11y-listbox-option][data-selected='true'] {
  background: #e6f0ff;
  font-weight: 600;
}

/* Select */
[data-compa11y-select] {
  position: relative;
  width: 300px;
}

[data-compa11y-select-trigger] {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 2rem 0.5rem 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  text-align: left;
}

[data-compa11y-select-listbox] {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  list-style: none;
  padding: 0;
}

[data-compa11y-select-option][data-highlighted='true'] {
  background: #f0f0f0;
}

[data-compa11y-select-option][data-selected='true'] {
  background: #e6f0ff;
  font-weight: 600;
}
```

## License

MIT
