import { useState } from 'react';
import {
  Dialog,
  ActionMenu,
  Tabs,
  ToastProvider,
  ToastViewport,
  useToastHelpers,
  Combobox,
  Select,
  Switch,
  Checkbox,
  Input,
  Textarea,
  Button,
  Listbox,
  RadioGroup,
} from '@compa11y/react';

const countries = [
  { value: 'us', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'ca', label: 'Canada' },
  { value: 'au', label: 'Australia' },
  { value: 'de', label: 'Germany' },
  { value: 'fr', label: 'France' },
  { value: 'jp', label: 'Japan' },
];

const fruits = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'dragonfruit', label: 'Dragon Fruit', disabled: true },
  { value: 'elderberry', label: 'Elderberry' },
  { value: 'fig', label: 'Fig' },
  { value: 'grape', label: 'Grape' },
  { value: 'honeydew', label: 'Honeydew' },
];

export function App() {
  return (
    <ToastProvider>
      <div className="app">
        <h1>compa11y React Demo</h1>
        <h3>Powered by Ivan Trajkovski</h3>
        <p>
          All components below are fully accessible with keyboard navigation,
          screen reader support, and ARIA attributes.
        </p>

        <section>
          <h2>Dialog</h2>
          <DialogDemo />
        </section>

        <section>
          <h2>Action Menu</h2>
          <ActionMenuDemo />
        </section>

        <section>
          <h2>Tabs</h2>
          <TabsDemo />
        </section>

        <section>
          <h2>Toast</h2>
          <ToastDemo />
        </section>

        <section>
          <h2>Select</h2>
          <SelectDemo />
        </section>

        <section>
          <h2>Combobox</h2>
          <ComboboxDemo />
        </section>

        <section>
          <h2>Checkbox</h2>
          <CheckboxDemo />
        </section>

        <section>
          <h2>Switch</h2>
          <SwitchDemo />
        </section>

        <section>
          <h2>Input</h2>
          <InputDemo />
        </section>

        <section>
          <h2>Textarea</h2>
          <TextareaDemo />
        </section>

        <section>
          <h2>Button</h2>
          <ButtonDemo />
        </section>

        <section>
          <h2>Radio Group</h2>
          <RadioGroupDemo />
        </section>

        <section>
          <h2>Listbox</h2>
          <ListboxDemo />
        </section>

        <ToastViewport position="bottom-right" />
      </div>
    </ToastProvider>
  );
}

function DialogDemo() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Dialog.Trigger onClick={() => setOpen(true)}>Open Dialog</Dialog.Trigger>

      <Dialog open={open} onOpenChange={setOpen}>
        <Dialog.Title>Confirm Delete</Dialog.Title>
        <Dialog.Description>
          Are you sure you want to delete this item? This action cannot be
          undone.
        </Dialog.Description>
        <Dialog.Actions>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              console.log('Deleted!');
              setOpen(false);
            }}
          >
            Delete
          </Button>
        </Dialog.Actions>
      </Dialog>

      <div className="keyboard-hints">
        <h3>Keyboard Navigation</h3>
        <ul>
          <li>
            <kbd>Tab</kbd> moves between focusable elements
          </li>
          <li>
            <kbd>Escape</kbd> closes the dialog
          </li>
          <li>Focus is trapped within the dialog</li>
        </ul>
      </div>
    </>
  );
}

function ActionMenuDemo() {
  const [lastAction, setLastAction] = useState<string | null>(null);

  return (
    <div>
      <ActionMenu>
        <ActionMenu.Trigger>Actions ▾</ActionMenu.Trigger>
        <ActionMenu.Content>
          <ActionMenu.Item onSelect={() => setLastAction('Edit')}>
            Edit
          </ActionMenu.Item>
          <ActionMenu.Item onSelect={() => setLastAction('Duplicate')}>
            Duplicate
          </ActionMenu.Item>
          <ActionMenu.Separator />
          <ActionMenu.Item onSelect={() => setLastAction('Delete')}>
            Delete
          </ActionMenu.Item>
        </ActionMenu.Content>
      </ActionMenu>
      {lastAction && (
        <p style={{ marginTop: '0.5rem', color: '#666' }}>
          Last action: {lastAction}
        </p>
      )}

      <div className="keyboard-hints">
        <h3>Keyboard Navigation</h3>
        <ul>
          <li>
            <kbd>Enter</kbd> or <kbd>Space</kbd> opens the menu
          </li>
          <li>
            <kbd>↑</kbd> <kbd>↓</kbd> navigates items
          </li>
          <li>
            <kbd>Home</kbd> / <kbd>End</kbd> jumps to first/last
          </li>
          <li>
            <kbd>Escape</kbd> closes the menu
          </li>
        </ul>
      </div>
    </div>
  );
}

function TabsDemo() {
  return (
    <>
      <Tabs defaultValue="general">
        <Tabs.List aria-label="Settings">
          <Tabs.Tab value="general">General</Tabs.Tab>
          <Tabs.Tab value="security">Security</Tabs.Tab>
          <Tabs.Tab value="notifications">Notifications</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="general">
          <p>General settings content goes here.</p>
        </Tabs.Panel>
        <Tabs.Panel value="security">
          <p>Security settings content goes here.</p>
        </Tabs.Panel>
        <Tabs.Panel value="notifications">
          <p>Notification settings content goes here.</p>
        </Tabs.Panel>
      </Tabs>

      <div className="keyboard-hints">
        <h3>Keyboard Navigation</h3>
        <ul>
          <li>
            <kbd>←</kbd> <kbd>→</kbd> switches between tabs
          </li>
          <li>
            <kbd>Home</kbd> / <kbd>End</kbd> jumps to first/last tab
          </li>
          <li>Tab panels are automatically shown/hidden</li>
        </ul>
      </div>
    </>
  );
}

function ToastDemo() {
  const { success, error, info, warning } = useToastHelpers();

  return (
    <>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <Button
          variant="outline"
          onClick={() => success('Success!', 'Your changes have been saved.')}
        >
          Success Toast
        </Button>
        <Button
          variant="outline"
          onClick={() => error('Error!', 'Something went wrong.')}
        >
          Error Toast
        </Button>
        <Button
          variant="outline"
          onClick={() => info('Info', 'Here is some information.')}
        >
          Info Toast
        </Button>
        <Button
          variant="outline"
          onClick={() => warning('Warning', 'Please review your input.')}
        >
          Warning Toast
        </Button>
      </div>

      <div className="keyboard-hints">
        <h3>Keyboard Navigation</h3>
        <ul>
          <li>Toasts are announced to screen readers</li>
          <li>Toasts auto-dismiss after a delay</li>
          <li>Click the close button to dismiss early</li>
        </ul>
      </div>
    </>
  );
}

function SelectDemo() {
  const [fruit, setFruit] = useState<string | null>(null);

  return (
    <div>
      <Select
        options={fruits}
        value={fruit}
        onValueChange={setFruit}
        aria-label="Select a fruit"
      >
        <Select.Trigger placeholder="Choose a fruit..." />
        <Select.Listbox />
      </Select>
      <p style={{ marginTop: '0.5rem', color: '#666' }}>
        Selected: {fruit || 'None'}
      </p>

      <div className="keyboard-hints">
        <h3>Keyboard Navigation</h3>
        <ul>
          <li>
            <kbd>↑</kbd> <kbd>↓</kbd> navigates options
          </li>
          <li>
            <kbd>Enter</kbd> or <kbd>Space</kbd> selects the highlighted option
          </li>
          <li>
            <kbd>Escape</kbd> closes the dropdown
          </li>
          <li>
            <kbd>Home</kbd> / <kbd>End</kbd> jumps to first/last option
          </li>
          <li>Type characters to jump to matching options</li>
        </ul>
      </div>
    </div>
  );
}

function ComboboxDemo() {
  const [value, setValue] = useState<string | null>(null);

  return (
    <div>
      <Combobox
        options={countries}
        value={value}
        onValueChange={setValue}
        aria-label="Select a country"
      >
        <Combobox.Input placeholder="Choose a country..." clearable />
        <Combobox.Listbox emptyMessage="No countries found" />
      </Combobox>
      <p style={{ marginTop: '0.5rem', color: '#666' }}>
        Selected: {value || 'None'}
      </p>

      <div className="keyboard-hints">
        <h3>Keyboard Navigation</h3>
        <ul>
          <li>
            <kbd>↑</kbd> <kbd>↓</kbd> navigates options
          </li>
          <li>
            <kbd>Enter</kbd> selects the highlighted option
          </li>
          <li>
            <kbd>Escape</kbd> closes the dropdown
          </li>
          <li>Type to filter options</li>
        </ul>
      </div>
    </div>
  );
}

function SwitchDemo() {
  const [notifications, setNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [lastChange, setLastChange] = useState<string>('None');

  const handleChange = (label: string, checked: boolean) => {
    setLastChange(`${label} turned ${checked ? 'ON' : 'OFF'}`);
  };

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Basic switch with visible label */}
        <Switch
          checked={notifications}
          onCheckedChange={(checked) => {
            setNotifications(checked);
            handleChange('Enable notifications', checked);
          }}
          label="Enable notifications"
        />

        {/* Checked by default */}
        <Switch
          checked={darkMode}
          onCheckedChange={(checked) => {
            setDarkMode(checked);
            handleChange('Dark mode', checked);
          }}
          label="Dark mode"
        />

        {/* Different sizes */}
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
        >
          <Switch
            size="sm"
            defaultChecked={false}
            onCheckedChange={(checked) => handleChange('Small switch', checked)}
            label="Small switch"
          />
          <Switch
            size="md"
            defaultChecked={false}
            onCheckedChange={(checked) =>
              handleChange('Medium switch (default)', checked)
            }
            label="Medium switch (default)"
          />
          <Switch
            size="lg"
            defaultChecked={false}
            onCheckedChange={(checked) => handleChange('Large switch', checked)}
            label="Large switch"
          />
        </div>

        {/* Disabled state */}
        <Switch disabled label="Disabled switch (unavailable)" />
      </div>

      <div
        style={{
          marginTop: '1rem',
          padding: '0.75rem',
          background: '#f8f8f8',
          borderRadius: '4px',
          fontSize: '0.875rem',
        }}
      >
        <strong>Last change:</strong> <span>{lastChange}</span>
      </div>

      <div className="keyboard-hints">
        <h3>Keyboard Navigation</h3>
        <ul>
          <li>
            <kbd>Space</kbd> toggles the switch
          </li>
          <li>
            <kbd>Enter</kbd> toggles the switch
          </li>
          <li>Switch state is announced to screen readers</li>
        </ul>
      </div>
    </div>
  );
}

function CheckboxDemo() {
  const [agreed, setAgreed] = useState(false);
  const [subscribed, setSubscribed] = useState(true);
  const [toppings, setToppings] = useState<string[]>(['cheese', 'mushrooms']);
  const [sizes, setSizes] = useState<string[]>(['md', 'lg']);
  const [lastChange, setLastChange] = useState('None');

  // Select all pattern
  const allItems = ['item1', 'item2', 'item3'];
  const [selectedItems, setSelectedItems] = useState<string[]>([
    'item1',
    'item3',
  ]);
  const allChecked = selectedItems.length === allItems.length;
  const someChecked = selectedItems.length > 0 && !allChecked;

  const handleSelectAll = (checked: boolean) => {
    setSelectedItems(checked ? [...allItems] : []);
    setLastChange(`Select all: ${checked ? 'all checked' : 'all unchecked'}`);
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        {/* Single checkboxes */}
        <div>
          <h3 style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            Single Checkbox
          </h3>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <Checkbox
              label="Accept terms and conditions"
              checked={agreed}
              onCheckedChange={(checked) => {
                setAgreed(checked);
                setLastChange(
                  `Accept terms: ${checked ? 'checked' : 'unchecked'}`
                );
              }}
              required
            />
            <Checkbox
              label="Subscribe to updates"
              hint="We'll email you weekly."
              checked={subscribed}
              onCheckedChange={(checked) => {
                setSubscribed(checked);
                setLastChange(
                  `Subscribe: ${checked ? 'checked' : 'unchecked'}`
                );
              }}
            />
          </div>
        </div>

        {/* Select All / Indeterminate */}
        <div>
          <h3 style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            Select All (Indeterminate)
          </h3>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <Checkbox
              label="Select all items"
              checked={allChecked}
              indeterminate={someChecked}
              onCheckedChange={handleSelectAll}
            />
            <div
              style={{
                marginLeft: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              {allItems.map((item) => (
                <Checkbox
                  key={item}
                  label={`Item ${item.replace('item', '')}`}
                  value={item}
                  checked={selectedItems.includes(item)}
                  onCheckedChange={(checked) => {
                    const next = checked
                      ? [...selectedItems, item]
                      : selectedItems.filter((v) => v !== item);
                    setSelectedItems(next);
                    setLastChange(
                      `${item}: ${checked ? 'checked' : 'unchecked'}`
                    );
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Checkbox Group */}
        <div>
          <h3 style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            Checkbox Group (Vertical)
          </h3>
          <Checkbox.Group
            legend="Select toppings"
            value={toppings}
            onValueChange={(v) => {
              setToppings(v);
              setLastChange(`Toppings: ${v.join(', ') || 'None'}`);
            }}
          >
            <Checkbox value="cheese" label="Cheese" />
            <Checkbox value="pepperoni" label="Pepperoni" />
            <Checkbox value="mushrooms" label="Mushrooms" />
            <Checkbox value="olives" label="Olives" />
            <Checkbox value="anchovies" label="Anchovies" disabled />
          </Checkbox.Group>
        </div>

        {/* Horizontal Group */}
        <div>
          <h3 style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            Checkbox Group (Horizontal)
          </h3>
          <Checkbox.Group
            legend="Available sizes"
            orientation="horizontal"
            value={sizes}
            onValueChange={(v) => {
              setSizes(v);
              setLastChange(`Sizes: ${v.join(', ') || 'None'}`);
            }}
          >
            <Checkbox value="xs" label="XS" />
            <Checkbox value="sm" label="S" />
            <Checkbox value="md" label="M" />
            <Checkbox value="lg" label="L" />
            <Checkbox value="xl" label="XL" />
          </Checkbox.Group>
        </div>

        {/* Sizes */}
        <div>
          <h3 style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            Sizes
          </h3>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <Checkbox size="sm" defaultChecked label="Small checkbox" />
            <Checkbox
              size="md"
              defaultChecked
              label="Medium checkbox (default)"
            />
            <Checkbox size="lg" defaultChecked label="Large checkbox" />
          </div>
        </div>

        {/* With error */}
        <div>
          <h3 style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            With Error
          </h3>
          <Checkbox
            label="I agree to the privacy policy"
            required
            error="You must agree to continue"
          />
        </div>

        {/* Disabled */}
        <div>
          <h3 style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            Disabled
          </h3>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <Checkbox label="Disabled unchecked" disabled />
            <Checkbox label="Disabled checked" disabled defaultChecked />
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: '1rem',
          padding: '0.75rem',
          background: '#f8f8f8',
          borderRadius: '4px',
          fontSize: '0.875rem',
        }}
      >
        <strong>Last change:</strong> <span>{lastChange}</span>
      </div>

      <div className="keyboard-hints">
        <h3>Keyboard Navigation</h3>
        <ul>
          <li>
            <kbd>Space</kbd> toggles the checkbox
          </li>
          <li>
            <kbd>Tab</kbd> moves between checkboxes
          </li>
          <li>
            Indeterminate state is announced as &quot;mixed&quot; to screen
            readers
          </li>
          <li>
            Groups use <code>&lt;fieldset&gt;</code> +{' '}
            <code>&lt;legend&gt;</code> for screen reader grouping
          </li>
          <li>
            Hint and error text connected via <code>aria-describedby</code>
          </li>
        </ul>
      </div>
    </div>
  );
}

function InputDemo() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');

  const validateName = () => {
    if (!name.trim()) {
      setNameError('Name is required');
    } else if (name.trim().length < 2) {
      setNameError('Name must be at least 2 characters');
    } else {
      setNameError('');
    }
  };

  const validateEmail = () => {
    if (!email.trim()) {
      setEmailError('Email is required');
    } else if (!email.includes('@')) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          maxWidth: '400px',
        }}
      >
        {/* Basic required input with validation */}
        <Input
          label="Full Name"
          hint="Enter your first and last name"
          error={nameError || undefined}
          required
          type="text"
          placeholder="John Doe"
          value={name}
          onValueChange={setName}
          onBlur={validateName}
        />

        {/* Email with validation */}
        <Input
          label="Email Address"
          hint="We will never share your email"
          error={emailError || undefined}
          required
          type="email"
          placeholder="john@example.com"
          value={email}
          onValueChange={setEmail}
          onBlur={validateEmail}
        />

        {/* Read-only */}
        <Input label="User ID" value="USR-12345" readOnly />

        {/* Disabled */}
        <Input label="Organization" value="Compa11y Inc." disabled />

        {/* Compound mode example */}
        <Input value={name} onValueChange={setName}>
          <Input.Label>Full Name (Compound)</Input.Label>
          <Input.Field placeholder="Jane Doe" />
          <Input.Hint>Custom layout using compound components</Input.Hint>
          {nameError && <Input.Error>{nameError}</Input.Error>}
        </Input>
      </div>

      <div className="keyboard-hints">
        <h3>Accessibility Features</h3>
        <ul>
          <li>
            Labels are programmatically associated via <code>for</code>/
            <code>id</code>
          </li>
          <li>
            Hints and errors linked via <code>aria-describedby</code>
          </li>
          <li>
            Errors use <code>role=&quot;alert&quot;</code> for screen reader
            announcements
          </li>
          <li>
            <code>aria-invalid</code> set when errors are present
          </li>
          <li>
            <code>aria-required</code> set for required fields
          </li>
        </ul>
      </div>
    </div>
  );
}

function TextareaDemo() {
  const [description, setDescription] = useState('');
  const [descError, setDescError] = useState('');
  const [feedback, setFeedback] = useState('');

  const validateDescription = () => {
    if (!description.trim()) {
      setDescError('Description is required');
    } else if (description.trim().length < 10) {
      setDescError('Description must be at least 10 characters');
    } else {
      setDescError('');
    }
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          maxWidth: '400px',
        }}
      >
        {/* Basic required textarea with validation */}
        <Textarea
          label="Description"
          hint="Provide at least 10 characters"
          error={descError || undefined}
          required
          rows={4}
          placeholder="Enter a description..."
          value={description}
          onValueChange={setDescription}
          onBlur={validateDescription}
        />

        {/* Read-only */}
        <Textarea
          label="Terms of Service"
          value="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
          readOnly
          rows={3}
        />

        {/* Disabled */}
        <Textarea
          label="Admin Notes"
          value="This field is disabled."
          disabled
          rows={2}
        />

        {/* Resize control */}
        <Textarea
          label="Feedback"
          hint="Resize is disabled on this textarea"
          placeholder="Share your feedback..."
          resize="none"
          rows={3}
          value={feedback}
          onValueChange={setFeedback}
        />

        {/* Compound mode example */}
        <Textarea value={description} onValueChange={setDescription}>
          <Textarea.Label>Description (Compound)</Textarea.Label>
          <Textarea.Field rows={3} placeholder="Custom layout..." />
          <Textarea.Hint>
            Using compound components for custom layout
          </Textarea.Hint>
          {descError && <Textarea.Error>{descError}</Textarea.Error>}
        </Textarea>
      </div>

      <div className="keyboard-hints">
        <h3>Accessibility Features</h3>
        <ul>
          <li>
            Labels are programmatically associated via <code>for</code>/
            <code>id</code>
          </li>
          <li>
            Hints and errors linked via <code>aria-describedby</code>
          </li>
          <li>
            Errors use <code>role=&quot;alert&quot;</code> for screen reader
            announcements
          </li>
          <li>
            <code>aria-invalid</code> set when errors are present
          </li>
          <li>
            <code>aria-required</code> set for required fields
          </li>
        </ul>
      </div>
    </div>
  );
}

function ButtonDemo() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastClick, setLastClick] = useState<string>('None');

  const handleLoadingClick = () => {
    setIsLoading(true);
    setLastClick('Save (loading...)');
    setTimeout(() => {
      setIsLoading(false);
      setLastClick('Save completed!');
    }, 2000);
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        {/* Variants */}
        <div>
          <h3 style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            Variants
          </h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Button variant="primary" onClick={() => setLastClick('Primary')}>
              Primary
            </Button>
            <Button
              variant="secondary"
              onClick={() => setLastClick('Secondary')}
            >
              Secondary
            </Button>
            <Button variant="danger" onClick={() => setLastClick('Danger')}>
              Danger
            </Button>
            <Button variant="outline" onClick={() => setLastClick('Outline')}>
              Outline
            </Button>
            <Button variant="ghost" onClick={() => setLastClick('Ghost')}>
              Ghost
            </Button>
          </div>
        </div>

        {/* Sizes */}
        <div>
          <h3 style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            Sizes
          </h3>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setLastClick('Small')}
            >
              Small
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => setLastClick('Medium')}
            >
              Medium
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={() => setLastClick('Large')}
            >
              Large
            </Button>
          </div>
        </div>

        {/* Loading state */}
        <div>
          <h3 style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            Loading
          </h3>
          <Button
            variant="primary"
            loading={isLoading}
            onClick={handleLoadingClick}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        {/* Disabled states */}
        <div>
          <h3 style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            Disabled
          </h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Button variant="primary" disabled>
              Disabled (removed from tab order)
            </Button>
            <Button variant="primary" disabled discoverable>
              Disabled (discoverable via keyboard)
            </Button>
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: '1rem',
          padding: '0.75rem',
          background: '#f8f8f8',
          borderRadius: '4px',
          fontSize: '0.875rem',
        }}
      >
        <strong>Last click:</strong> <span>{lastClick}</span>
      </div>

      <div className="keyboard-hints">
        <h3>Accessibility Features</h3>
        <ul>
          <li>
            <kbd>Enter</kbd> or <kbd>Space</kbd> activates the button
          </li>
          <li>
            Loading state sets <code>aria-busy</code> and prevents interaction
          </li>
          <li>
            Discoverable disabled buttons stay in tab order with{' '}
            <code>aria-disabled</code>
          </li>
          <li>Focus ring appears only on keyboard navigation</li>
        </ul>
      </div>
    </div>
  );
}

function RadioGroupDemo() {
  const [delivery, setDelivery] = useState('standard');
  const [size, setSize] = useState<string | undefined>(undefined);
  const [payment, setPayment] = useState<string | undefined>(undefined);
  const [paymentError, setPaymentError] = useState<string | undefined>(
    undefined
  );

  const handlePaymentSubmit = () => {
    if (!payment) {
      setPaymentError('Please select a payment method');
    } else {
      setPaymentError(undefined);
    }
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          gap: '2rem',
          flexWrap: 'wrap',
        }}
      >
        {/* Controlled with defaultValue */}
        <div style={{ flex: '1 1 250px' }}>
          <RadioGroup
            legend="Delivery speed"
            value={delivery}
            onValueChange={setDelivery}
          >
            <RadioGroup.Radio value="standard" hint="5-7 business days">
              Standard
            </RadioGroup.Radio>
            <RadioGroup.Radio value="express" hint="2-3 business days">
              Express
            </RadioGroup.Radio>
            <RadioGroup.Radio value="overnight" hint="Next business day">
              Overnight
            </RadioGroup.Radio>
          </RadioGroup>
          <p
            style={{ marginTop: '0.5rem', color: '#666', fontSize: '0.875rem' }}
          >
            Selected: {delivery}
          </p>
        </div>

        {/* Horizontal with no initial selection */}
        <div style={{ flex: '1 1 250px' }}>
          <RadioGroup
            legend="T-Shirt Size"
            orientation="horizontal"
            value={size}
            onValueChange={setSize}
          >
            <RadioGroup.Radio value="xs">XS</RadioGroup.Radio>
            <RadioGroup.Radio value="sm">S</RadioGroup.Radio>
            <RadioGroup.Radio value="md">M</RadioGroup.Radio>
            <RadioGroup.Radio value="lg">L</RadioGroup.Radio>
            <RadioGroup.Radio value="xl">XL</RadioGroup.Radio>
          </RadioGroup>
          <p
            style={{ marginTop: '0.5rem', color: '#666', fontSize: '0.875rem' }}
          >
            Selected: {size || 'None'}
          </p>
        </div>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <h3 style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
          With Disabled Options
        </h3>
        <RadioGroup
          legend="Shipping method"
          defaultValue="ground"
          aria-label="Shipping method"
        >
          <RadioGroup.Radio value="ground">Ground</RadioGroup.Radio>
          <RadioGroup.Radio value="air" disabled>
            Air (unavailable)
          </RadioGroup.Radio>
          <RadioGroup.Radio value="sea">Sea</RadioGroup.Radio>
        </RadioGroup>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <h3 style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
          Required with Validation
        </h3>
        <RadioGroup
          legend="Payment method"
          required
          value={payment}
          onValueChange={(v) => {
            setPayment(v);
            setPaymentError(undefined);
          }}
          error={paymentError}
        >
          <RadioGroup.Radio value="card">Credit Card</RadioGroup.Radio>
          <RadioGroup.Radio value="paypal">PayPal</RadioGroup.Radio>
          <RadioGroup.Radio value="bank">Bank Transfer</RadioGroup.Radio>
        </RadioGroup>
        <button
          onClick={handlePaymentSubmit}
          style={{
            marginTop: '0.5rem',
            padding: '0.25rem 0.75rem',
            fontSize: '0.875rem',
          }}
        >
          Submit
        </button>
      </div>

      <div className="keyboard-hints">
        <h3>Keyboard Navigation</h3>
        <ul>
          <li>
            <kbd>Tab</kbd> moves into/out of the group (lands on checked or
            first radio)
          </li>
          <li>
            <kbd>↓</kbd> <kbd>→</kbd> moves to next radio and selects it
          </li>
          <li>
            <kbd>↑</kbd> <kbd>←</kbd> moves to previous radio and selects it
          </li>
          <li>
            <kbd>Home</kbd> / <kbd>End</kbd> jumps to first/last radio
          </li>
          <li>
            <kbd>Space</kbd> selects the focused radio
          </li>
        </ul>
      </div>
    </div>
  );
}

function ListboxDemo() {
  const [fruit, setFruit] = useState<string>('apple');
  const [toppings, setToppings] = useState<string[]>(['cheese', 'mushrooms']);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          gap: '2rem',
          flexWrap: 'wrap',
        }}
      >
        {/* Single-select with groups */}
        <div style={{ flex: '1 1 250px' }}>
          <h3 style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            Favorite Fruit (Single Select)
          </h3>
          <Listbox
            value={fruit}
            onValueChange={(v) => setFruit(v as string)}
            aria-label="Favorite fruit"
          >
            <Listbox.Group label="Citrus">
              <Listbox.Option value="orange">Orange</Listbox.Option>
              <Listbox.Option value="lemon">Lemon</Listbox.Option>
              <Listbox.Option value="grapefruit">Grapefruit</Listbox.Option>
            </Listbox.Group>
            <Listbox.Group label="Berries">
              <Listbox.Option value="strawberry">Strawberry</Listbox.Option>
              <Listbox.Option value="blueberry">Blueberry</Listbox.Option>
              <Listbox.Option value="raspberry" disabled>
                Raspberry (sold out)
              </Listbox.Option>
            </Listbox.Group>
            <Listbox.Option value="apple">Apple</Listbox.Option>
            <Listbox.Option value="banana">Banana</Listbox.Option>
          </Listbox>
          <p
            style={{ marginTop: '0.5rem', color: '#666', fontSize: '0.875rem' }}
          >
            Selected: {fruit || 'None'}
          </p>
        </div>

        {/* Multi-select */}
        <div style={{ flex: '1 1 250px' }}>
          <h3 style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            Pizza Toppings (Multi Select)
          </h3>
          <Listbox
            value={toppings}
            onValueChange={(v) => setToppings(v as string[])}
            multiple
            aria-label="Pizza toppings"
          >
            <Listbox.Option value="cheese">Cheese</Listbox.Option>
            <Listbox.Option value="pepperoni">Pepperoni</Listbox.Option>
            <Listbox.Option value="mushrooms">Mushrooms</Listbox.Option>
            <Listbox.Option value="onions">Onions</Listbox.Option>
            <Listbox.Option value="peppers">Peppers</Listbox.Option>
            <Listbox.Option value="olives">Olives</Listbox.Option>
            <Listbox.Option value="pineapple" disabled>
              Pineapple (unavailable)
            </Listbox.Option>
          </Listbox>
          <p
            style={{ marginTop: '0.5rem', color: '#666', fontSize: '0.875rem' }}
          >
            Selected: {toppings.length > 0 ? toppings.join(', ') : 'None'}
          </p>
        </div>
      </div>

      <div className="keyboard-hints">
        <h3>Keyboard Navigation</h3>
        <ul>
          <li>
            <kbd>↑</kbd> <kbd>↓</kbd> navigates options
          </li>
          <li>
            Single-select: arrow keys move focus <strong>and</strong> select
          </li>
          <li>
            Multi-select: <kbd>Space</kbd> toggles selection, <kbd>Shift+↑</kbd>{' '}
            <kbd>Shift+↓</kbd> extends selection
          </li>
          <li>
            <kbd>Home</kbd> / <kbd>End</kbd> jumps to first/last option
          </li>
          <li>
            Multi-select: <kbd>Ctrl+A</kbd> toggles select all
          </li>
          <li>Type characters to jump to matching options</li>
        </ul>
      </div>
    </div>
  );
}
