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
  VisuallyHidden,
  SkipLink,
  Alert,
  Link,
  Heading,
  Text,
  FormField,
  Popover,
  Accordion,
  Table,
  Pagination,
  Breadcrumbs,
  Tooltip,
  Drawer,
  Slider,
  ProgressBar,
  Skeleton,
  EmptyState,
  NumberField,
  SearchField,
  FileUpload,
  ErrorSummary,
  Stepper,
  DataGrid,
  DatePicker,
  Calendar,
  TimeField,
  TimePicker,
  TreeView,
  CommandPalette,
  Carousel,
  RichTextEditor,
  type TreeNodeData,
  type TimePickerValue,
  type DataGridColumnDef,
  type StepItem,
  type FileUploadFile,
  type SortDirection,
  type DataGridSortDirection,
  type RTEAdapter,
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

function VisuallyHiddenDemo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <p>
        Content hidden visually but accessible to screen readers. Inspect the
        DOM or use a screen reader to verify.
      </p>

      <div>
        <strong>Icon button with hidden label:</strong>{' '}
        <Button aria-label="Close">
          <span aria-hidden="true">&times;</span>
          <VisuallyHidden>Close this dialog</VisuallyHidden>
        </Button>
      </div>

      <div>
        <strong>Focusable skip link (Tab to reveal):</strong>{' '}
        <VisuallyHidden focusable>
          <a
            href="#main-content"
            style={{
              padding: '0.5rem 1rem',
              background: '#0066cc',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
            }}
          >
            Skip to main content
          </a>
        </VisuallyHidden>
      </div>

      <div>
        <strong>Hidden status text:</strong> <span>3 items in cart</span>
        <VisuallyHidden>, total price: $45.99</VisuallyHidden>
      </div>
    </div>
  );
}

export function App() {
  return (
    <ToastProvider>
      <SkipLink target="#main-content" />
      <div className="app">
        <h1 id="main-content" tabIndex={-1}>
          compa11y React Demo
        </h1>
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

        <section>
          <h2>VisuallyHidden</h2>
          <VisuallyHiddenDemo />
        </section>

        <section>
          <h2>SkipLink</h2>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
          >
            <p>
              A skip link is placed at the very top of this page. Press{' '}
              <kbd>Tab</kbd> from the address bar to reveal it.
            </p>
            <p>
              <strong>How to test:</strong> Click in the browser address bar,
              then press <kbd>Tab</kbd>. The skip link will appear at the
              top-left corner.
            </p>
            <p style={{ color: '#666', fontSize: '0.875rem' }}>
              The skip link at the top of this page uses:{' '}
              <code>{'<SkipLink target="#main-content" />'}</code>
            </p>
          </div>
        </section>

        <section>
          <h2>Alert</h2>
          <AlertDemo />
        </section>

        <section>
          <h2>Link</h2>
          <LinkDemo />
        </section>

        <section>
          <h2>Text / Heading</h2>
          <TextHeadingDemo />
        </section>

        <section>
          <h2>FormField</h2>
          <FormFieldDemo />
        </section>

        <section>
          <h2>Popover</h2>
          <PopoverDemo />
        </section>

        <section>
          <h2>Accordion</h2>
          <AccordionDemo />
        </section>

        <section>
          <h2>Table</h2>
          <TableDemo />
        </section>

        <section>
          <h2>Pagination</h2>
          <PaginationDemo />
        </section>

        <section>
          <h2>Breadcrumbs</h2>
          <BreadcrumbsDemo />
        </section>

        <section>
          <h2>Tooltip</h2>
          <TooltipDemo />
        </section>

        <section>
          <h2>Drawer</h2>
          <DrawerDemo />
        </section>

        <section>
          <h2>Slider</h2>
          <SliderDemo />
        </section>

        <section>
          <h2>ProgressBar</h2>
          <ProgressBarDemo />
        </section>

        <section>
          <h2>Skeleton</h2>
          <SkeletonDemo />
        </section>

        <section>
          <h2>EmptyState</h2>
          <EmptyStateDemo />
        </section>

        <section>
          <h2>NumberField</h2>
          <NumberFieldDemo />
        </section>

        <section>
          <h2>SearchField</h2>
          <SearchFieldDemo />
        </section>

        <section>
          <h2>FileUpload</h2>
          <FileUploadDemo />
        </section>

        <section>
          <h2>ErrorSummary</h2>
          <ErrorSummaryDemo />
        </section>

        <section>
          <h2>Stepper</h2>
          <StepperDemo />
        </section>

        <section>
          <h2>DataGrid</h2>
          <DataGridDemo />
        </section>

        <section>
          <h2>DatePicker</h2>
          <DatePickerDemo />
        </section>

        <section>
          <h2>TimePicker</h2>
          <TimePickerDemo />
        </section>

        <section>
          <h2>TreeView</h2>
          <TreeViewDemo />
        </section>

        <section>
          <h2>CommandPalette</h2>
          <CommandPaletteDemo />
        </section>

        <section>
          <CarouselDemo />
        </section>

        <section>
          <h2>RichTextEditor</h2>
          <RichTextEditorDemo />
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

function AlertDemo() {
  const [showDismissible1, setShowDismissible1] = useState(true);
  const [showDismissible2, setShowDismissible2] = useState(true);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <p>
        Static feedback messages with appropriate ARIA roles. Error/warning use{' '}
        <code>role="alert"</code> (assertive), info/success use{' '}
        <code>role="status"</code> (polite).
      </p>

      <Alert type="info" title="Tip">
        You can customize alert colors using CSS custom properties or the{' '}
        <code>unstyled</code> prop.
      </Alert>

      <Alert type="success" title="Saved!">
        Your changes have been saved successfully.
      </Alert>

      <Alert type="warning" title="Low storage">
        You have less than 100MB of storage remaining.
      </Alert>

      <Alert type="error" title="Payment failed">
        Your card was declined. Please try a different payment method.
      </Alert>

      {showDismissible1 && (
        <Alert
          type="info"
          dismissible
          onDismiss={() => setShowDismissible1(false)}
        >
          This is a dismissible info alert. Click the close button to remove it.
        </Alert>
      )}

      {showDismissible2 && (
        <Alert
          type="success"
          dismissible
          title="Upload complete"
          onDismiss={() => setShowDismissible2(false)}
        >
          Your file has been uploaded. This alert can be dismissed.
        </Alert>
      )}

      {(!showDismissible1 || !showDismissible2) && (
        <button
          onClick={() => {
            setShowDismissible1(true);
            setShowDismissible2(true);
          }}
          style={{
            alignSelf: 'flex-start',
            padding: '0.5rem 1rem',
            border: '1px solid #ccc',
            borderRadius: '4px',
            background: 'white',
            cursor: 'pointer',
          }}
        >
          Reset dismissed alerts
        </button>
      )}
    </div>
  );
}

function LinkDemo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <p>
        Accessible links with external indicators, <code>aria-current</code> for
        navigation, and proper focus styling.
      </p>

      <div>
        <Link href="/about">Internal link</Link>
      </div>

      <div>
        <Link href="https://compa11y.org" external>
          Compa11y Documentation
        </Link>
        {' — opens in a new tab with screen reader hint'}
      </div>

      <div>
        {'Navigation with '}
        <code>aria-current</code>
        {': '}
        <nav
          style={{ display: 'inline-flex', gap: '1rem', marginLeft: '0.5rem' }}
        >
          <Link href="/home">Home</Link>
          <Link href="/dashboard" current="page">
            Dashboard
          </Link>
          <Link href="/settings">Settings</Link>
        </nav>
      </div>

      <div>
        <Link href="/disabled" disabled>
          Disabled link
        </Link>
        {' — not focusable or clickable'}
      </div>
    </div>
  );
}

function TextHeadingDemo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <Text color="muted" size="sm">
        Semantic typography primitives. Headings render proper{' '}
        <code>&lt;h1&gt;</code>–<code>&lt;h6&gt;</code> elements. Text renders{' '}
        <code>&lt;p&gt;</code>, <code>&lt;span&gt;</code>, or <code>&lt;div&gt;</code>.
      </Text>

      <Heading level={1}>Heading Level 1</Heading>
      <Heading level={2}>Heading Level 2</Heading>
      <Heading level={3}>Heading Level 3</Heading>
      <Heading level={4}>Heading Level 4</Heading>
      <Heading level={5}>Heading Level 5</Heading>
      <Heading level={6}>Heading Level 6</Heading>

      <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', margin: '0.5rem 0' }} />

      <Text>Default body text paragraph (size md).</Text>
      <Text size="sm" color="muted">Small muted text for secondary content.</Text>
      <Text size="lg" weight="semibold">Large semibold text for emphasis.</Text>
      <Text color="error">Error-colored text for validation messages.</Text>
      <Text color="success">Success-colored text for confirmations.</Text>
      <Text align="center" color="accent">Center-aligned accent text.</Text>
      <Text truncate style={{ maxWidth: 300 }}>
        This is a very long text that should be truncated with an ellipsis when it overflows the container boundary.
      </Text>
      <Text as="span">This is an inline <code>&lt;span&gt;</code> element.</Text>
    </div>
  );
}

function FormFieldDemo() {
  const [emailError, setEmailError] = useState('');
  const [email, setEmail] = useState('');

  const validateEmail = (val: string) => {
    if (!val) {
      setEmailError('Email is required.');
    } else if (!val.includes('@')) {
      setEmailError('Please enter a valid email address.');
    } else {
      setEmailError('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: 420 }}>
      <Text color="muted" size="sm">
        Generic wrapper that wires <code>aria-labelledby</code>,{' '}
        <code>aria-describedby</code>, and <code>aria-invalid</code> on any
        child control. Works with native inputs, selects, and custom components.
      </Text>

      {/* Native input — props mode */}
      <FormField
        label="Email"
        hint="We'll never share your email."
        error={emailError}
        required
      >
        <FormField.Control>
          {({ controlId, ariaProps }) => (
            <input
              id={controlId}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => validateEmail(email)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                border: `1px solid ${emailError ? '#ef4444' : '#ccc'}`,
                borderRadius: 4,
                fontSize: '0.875rem',
                fontFamily: 'inherit',
              }}
              {...ariaProps}
            />
          )}
        </FormField.Control>
      </FormField>

      {/* Native select */}
      <FormField label="Country" hint="Select your country of residence." required>
        <FormField.Control>
          {({ controlId, ariaProps }) => (
            <select
              id={controlId}
              defaultValue=""
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                border: '1px solid #ccc',
                borderRadius: 4,
                fontSize: '0.875rem',
                fontFamily: 'inherit',
                background: 'white',
              }}
              {...ariaProps}
            >
              <option value="" disabled>Choose a country…</option>
              <option value="us">United States</option>
              <option value="uk">United Kingdom</option>
              <option value="ca">Canada</option>
              <option value="au">Australia</option>
            </select>
          )}
        </FormField.Control>
      </FormField>

      {/* Textarea */}
      <FormField label="Bio" hint="Tell us a little about yourself (optional).">
        <FormField.Control>
          {({ controlId, ariaProps }) => (
            <textarea
              id={controlId}
              rows={3}
              placeholder="I'm a developer who loves accessibility…"
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                border: '1px solid #ccc',
                borderRadius: 4,
                fontSize: '0.875rem',
                fontFamily: 'inherit',
                resize: 'vertical',
              }}
              {...ariaProps}
            />
          )}
        </FormField.Control>
      </FormField>

      {/* Custom compound layout */}
      <FormField error="This field is required." required disabled>
        <FormField.Label>Organization</FormField.Label>
        <FormField.Control>
          {({ controlId, ariaProps }) => (
            <input
              id={controlId}
              type="text"
              placeholder="Acme Inc."
              disabled
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                border: '1px solid #ef4444',
                borderRadius: 4,
                fontSize: '0.875rem',
                fontFamily: 'inherit',
                background: '#f5f5f5',
                cursor: 'not-allowed',
                color: '#999',
              }}
              {...ariaProps}
            />
          )}
        </FormField.Control>
        <FormField.Error>This field is required.</FormField.Error>
      </FormField>
    </div>
  );
}

function PopoverDemo() {
  const [controlled, setControlled] = useState(false);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-start', paddingBottom: '12rem' }}>

      {/* Basic — bottom (default) */}
      <Popover>
        <Popover.Trigger
          style={{
            padding: '0.5rem 1rem',
            background: '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          More info
        </Popover.Trigger>
        <Popover.Content>
          <strong>Did you know?</strong>
          <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
            Non-modal overlay. Press <kbd>Escape</kbd> or click outside to dismiss.
          </p>
        </Popover.Content>
      </Popover>

      {/* top-start placement */}
      <Popover>
        <Popover.Trigger
          style={{
            padding: '0.5rem 1rem',
            background: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Open (top-start)
        </Popover.Trigger>
        <Popover.Content placement="top-start">
          <p style={{ fontSize: '0.875rem' }}>I appear above, aligned to the left edge.</p>
        </Popover.Content>
      </Popover>

      {/* right placement */}
      <Popover>
        <Popover.Trigger
          style={{
            padding: '0.5rem 1rem',
            background: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Open (right)
        </Popover.Trigger>
        <Popover.Content placement="right">
          <p style={{ fontSize: '0.875rem' }}>I appear to the right.</p>
        </Popover.Content>
      </Popover>

      {/* With Close button */}
      <Popover>
        <Popover.Trigger
          style={{
            padding: '0.5rem 1rem',
            background: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          With close button
        </Popover.Trigger>
        <Popover.Content placement="bottom-start">
          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            This popover has a close button inside.
          </p>
          <Popover.Close
            style={{
              padding: '0.375rem 0.75rem',
              background: '#0066cc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Dismiss
          </Popover.Close>
        </Popover.Content>
      </Popover>

      {/* Controlled */}
      <div>
        <div style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
          Controlled: {controlled ? 'open' : 'closed'}
        </div>
        <Popover open={controlled} onOpenChange={setControlled}>
          <Popover.Trigger
            style={{
              padding: '0.5rem 1rem',
              background: 'white',
              border: '1px solid #0066cc',
              borderRadius: '4px',
              cursor: 'pointer',
              color: '#0066cc',
            }}
          >
            Controlled popover
          </Popover.Trigger>
          <Popover.Content placement="bottom">
            <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
              Open state is managed externally.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setControlled(false)}
                style={{
                  padding: '0.375rem 0.75rem',
                  background: '#0066cc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Confirm
              </button>
              <button
                onClick={() => setControlled(false)}
                style={{
                  padding: '0.375rem 0.75rem',
                  background: 'white',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </Popover.Content>
        </Popover>
      </div>

    </div>
  );
}

function AccordionDemo() {
  const [singleValue, setSingleValue] = useState<string>('item-1');
  const [multipleValue, setMultipleValue] = useState<string[]>([
    'keyboard',
  ]);

  const triggerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '1rem',
    background: 'white',
    border: 'none',
    borderBottom: '1px solid #e0e0e0',
    fontSize: '1rem',
    fontWeight: 500,
    cursor: 'pointer',
    textAlign: 'left',
  };

  const accordionStyle: React.CSSProperties = {
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    overflow: 'hidden',
    maxWidth: 600,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Single mode, controlled, collapsible */}
      <div>
        <h3 style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
          Single (controlled, collapsible)
        </h3>
        <Accordion
          type="single"
          collapsible
          value={singleValue}
          onValueChange={(v) => setSingleValue(v as string)}
          style={accordionStyle}
        >
          <Accordion.Item value="item-1">
            <Accordion.Header>
              <Accordion.Trigger style={triggerStyle}>
                What is compa11y?
                <span aria-hidden="true" style={{ fontSize: '0.75rem' }}>
                  {singleValue === 'item-1' ? '▲' : '▼'}
                </span>
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content
              style={{ padding: '1rem', borderBottom: '1px solid #e0e0e0' }}
            >
              <p>
                compa11y is an accessible component library built with WCAG
                AAA compliance. Every component ships with keyboard
                navigation, ARIA attributes, and screen reader support.
              </p>
            </Accordion.Content>
          </Accordion.Item>

          <Accordion.Item value="item-2">
            <Accordion.Header>
              <Accordion.Trigger style={triggerStyle}>
                How do I install it?
                <span aria-hidden="true" style={{ fontSize: '0.75rem' }}>
                  {singleValue === 'item-2' ? '▲' : '▼'}
                </span>
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content
              style={{ padding: '1rem', borderBottom: '1px solid #e0e0e0' }}
            >
              <p>
                Install via npm: <code>npm install @compa11y/react</code> or{' '}
                <code>npm install @compa11y/web</code>.
              </p>
            </Accordion.Content>
          </Accordion.Item>

          <Accordion.Item value="item-3">
            <Accordion.Header>
              <Accordion.Trigger
                style={{ ...triggerStyle, borderBottom: 'none' }}
              >
                Is it framework-agnostic?
                <span aria-hidden="true" style={{ fontSize: '0.75rem' }}>
                  {singleValue === 'item-3' ? '▲' : '▼'}
                </span>
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content style={{ padding: '1rem' }}>
              <p>
                Yes! The web package provides vanilla Web Components. The
                React package provides compound components.
              </p>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion>
        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
          Open: {singleValue || 'none'}
        </p>
      </div>

      {/* Multiple mode, controlled */}
      <div>
        <h3 style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
          Multiple (controlled)
        </h3>
        <Accordion
          type="multiple"
          value={multipleValue}
          onValueChange={(v) => setMultipleValue(v as string[])}
          style={accordionStyle}
        >
          {(
            [
              {
                value: 'keyboard',
                title: 'Keyboard Navigation',
                content:
                  'Arrow Up/Down moves between headers. Home/End jumps to first/last. Enter or Space toggles a section.',
              },
              {
                value: 'screen-reader',
                title: 'Screen Reader Support',
                content:
                  'aria-expanded announces open/closed state. role="region" with aria-labelledby identifies each panel.',
              },
            ] as const
          ).map(({ value, title, content }) => (
            <Accordion.Item key={value} value={value}>
              <Accordion.Header>
                <Accordion.Trigger style={triggerStyle}>
                  {title}
                  <span
                    aria-hidden="true"
                    style={{ fontSize: '0.75rem' }}
                  >
                    {multipleValue.includes(value) ? '▲' : '▼'}
                  </span>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content
                style={{ padding: '1rem', borderBottom: '1px solid #e0e0e0' }}
              >
                <p>{content}</p>
              </Accordion.Content>
            </Accordion.Item>
          ))}

          {/* Disabled item */}
          <Accordion.Item value="disabled-item" disabled>
            <Accordion.Header>
              <Accordion.Trigger
                style={{
                  ...triggerStyle,
                  borderBottom: 'none',
                  opacity: 0.5,
                  cursor: 'not-allowed',
                }}
              >
                Disabled Item
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content style={{ padding: '1rem' }}>
              <p>This content is not reachable.</p>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion>
        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
          Open: {multipleValue.join(', ') || 'none'}
        </p>
      </div>

      {/* Uncontrolled */}
      <div>
        <h3 style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
          Uncontrolled (defaultValue)
        </h3>
        <Accordion defaultValue="faq-1" style={accordionStyle}>
          <Accordion.Item value="faq-1">
            <Accordion.Header>
              <Accordion.Trigger style={triggerStyle}>
                Open by default
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content
              style={{ padding: '1rem', borderBottom: '1px solid #e0e0e0' }}
            >
              <p>
                This item is open by default via{' '}
                <code>defaultValue="faq-1"</code>.
              </p>
            </Accordion.Content>
          </Accordion.Item>

          <Accordion.Item value="faq-2">
            <Accordion.Header>
              <Accordion.Trigger
                style={{ ...triggerStyle, borderBottom: 'none' }}
              >
                Starts closed
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content style={{ padding: '1rem' }}>
              <p>This item starts closed.</p>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion>
      </div>

      <div className="keyboard-hints">
        <h3>Keyboard Navigation</h3>
        <ul>
          <li>
            <kbd>Tab</kbd> moves focus into the accordion triggers
          </li>
          <li>
            <kbd>Enter</kbd> / <kbd>Space</kbd> toggles the focused section
          </li>
          <li>
            <kbd>↓</kbd> moves to the next trigger
          </li>
          <li>
            <kbd>↑</kbd> moves to the previous trigger
          </li>
          <li>
            <kbd>Home</kbd> / <kbd>End</kbd> jumps to first/last trigger
          </li>
        </ul>
      </div>
    </div>
  );
}

// ─── TableDemo ───────────────────────────────────────────────────────────────

const PRODUCTS = [
  { id: 'p1', name: 'Wireless Keyboard',   category: 'Peripherals', price: 79,  inStock: true },
  { id: 'p2', name: 'USB-C Hub',           category: 'Accessories', price: 49,  inStock: true },
  { id: 'p3', name: '4K Monitor',          category: 'Displays',    price: 499, inStock: false },
  { id: 'p4', name: 'Noise-Cancel Headset', category: 'Audio',      price: 149, inStock: true },
  { id: 'p5', name: 'Mechanical Keyboard', category: 'Peripherals', price: 129, inStock: true },
];

type Product = typeof PRODUCTS[number];

function sortProducts(
  products: Product[],
  key: string | null,
  dir: SortDirection
): Product[] {
  if (!key || dir === 'none') return products;
  return [...products].sort((a, b) => {
    const av = (a as Record<string, unknown>)[key];
    const bv = (b as Record<string, unknown>)[key];
    const cmp =
      typeof av === 'number' && typeof bv === 'number'
        ? av - bv
        : String(av ?? '').localeCompare(String(bv ?? ''));
    return dir === 'ascending' ? cmp : -cmp;
  });
}

function TableDemo() {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>('none');
  const [selected, setSelected] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sorted = sortProducts(PRODUCTS, sortKey, sortDir);

  const handleSort = (key: string | null, dir: SortDirection) => {
    setSortKey(key);
    setSortDir(dir);
  };

  const tableWrapperStyle: React.CSSProperties = {
    border: '1px solid #e0e0e0',
    borderRadius: 6,
    overflow: 'hidden',
    maxWidth: 700,
    width: '100%',
  };

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
  };

  const thStyle: React.CSSProperties = {
    padding: '0.625rem 0.875rem',
    background: '#f5f5f5',
    borderBottom: '2px solid #d0d0d0',
    fontWeight: 600,
    textAlign: 'left',
    whiteSpace: 'nowrap',
  };

  const tdStyle: React.CSSProperties = {
    padding: '0.625rem 0.875rem',
    borderBottom: '1px solid #e8e8e8',
    verticalAlign: 'top',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* Sortable + selectable */}
      <div>
        <h3 style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
          Sortable &amp; Selectable
        </h3>
        <div style={tableWrapperStyle}>
        <Table
          caption="Product catalogue"
          sortKey={sortKey}
          sortDirection={sortDir}
          onSortChange={handleSort}
          selectedRows={selected}
          onSelectionChange={setSelected}
          style={tableStyle}
        >
          <Table.Head>
            <Table.Row>
              <Table.SelectAllCell
                rowIds={PRODUCTS.map((p) => p.id)}
                style={thStyle}
              />
              <Table.Header sortKey="name" style={thStyle}>
                Name
              </Table.Header>
              <Table.Header sortKey="category" style={thStyle}>
                Category
              </Table.Header>
              <Table.Header
                sortKey="price"
                style={{ ...thStyle, textAlign: 'right' }}
              >
                Price
              </Table.Header>
              <Table.Header style={{ ...thStyle, textAlign: 'center' }}>
                In stock
              </Table.Header>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {sorted.map((product) => (
              <Table.Row key={product.id} rowId={product.id}>
                <Table.SelectCell
                  label={`Select ${product.name}`}
                  style={tdStyle}
                />
                <Table.Cell style={tdStyle}>{product.name}</Table.Cell>
                <Table.Cell style={tdStyle}>{product.category}</Table.Cell>
                <Table.Cell style={{ ...tdStyle, textAlign: 'right' }}>
                  ${product.price}
                </Table.Cell>
                <Table.Cell style={{ ...tdStyle, textAlign: 'center' }}>
                  {product.inStock ? '✓' : '✗'}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
          <Table.Foot>
            <Table.Row>
              <Table.Cell
                colSpan={5}
                style={{
                  ...tdStyle,
                  background: '#f5f5f5',
                  borderTop: '2px solid #d0d0d0',
                  borderBottom: 'none',
                  fontWeight: 600,
                }}
              >
                {PRODUCTS.length} products
              </Table.Cell>
            </Table.Row>
          </Table.Foot>
        </Table>
        </div>
        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
          Sort: {sortKey ? `${sortKey} (${sortDir})` : 'none'}&nbsp;|&nbsp;
          Selected: {selected.length > 0 ? selected.join(', ') : 'none'}
        </p>
      </div>

      {/* Loading / empty */}
      <div>
        <h3 style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
          Loading &amp; Empty states
        </h3>
        <button
          type="button"
          onClick={() => setIsLoading((v) => !v)}
          style={{ marginBottom: '0.5rem', padding: '0.25rem 0.75rem', cursor: 'pointer' }}
        >
          Toggle loading
        </button>
        <Table
          caption="Products (loading demo)"
          isLoading={isLoading}
          style={{ ...tableStyle, marginBottom: '1rem' }}
        >
          <Table.Head>
            <Table.Row>
              <Table.Header style={thStyle}>Name</Table.Header>
              <Table.Header style={thStyle}>Category</Table.Header>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {isLoading ? (
              <Table.LoadingState colSpan={2}>Loading products…</Table.LoadingState>
            ) : (
              PRODUCTS.slice(0, 2).map((p) => (
                <Table.Row key={p.id}>
                  <Table.Cell style={tdStyle}>{p.name}</Table.Cell>
                  <Table.Cell style={tdStyle}>{p.category}</Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table>

        <Table caption="Filtered products (empty)" style={tableStyle}>
          <Table.Head>
            <Table.Row>
              <Table.Header style={thStyle}>Name</Table.Header>
              <Table.Header style={thStyle}>Category</Table.Header>
              <Table.Header style={thStyle}>Price</Table.Header>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            <Table.EmptyState colSpan={3}>
              No products match your current filters.
            </Table.EmptyState>
          </Table.Body>
        </Table>
      </div>

      <div className="keyboard-hints">
        <h3>Keyboard Navigation</h3>
        <ul>
          <li>
            <kbd>Tab</kbd> moves between sort buttons and checkboxes
          </li>
          <li>
            <kbd>Enter</kbd> / <kbd>Space</kbd> on a sort header cycles the sort direction
          </li>
          <li>
            <kbd>Space</kbd> on a checkbox toggles row selection
          </li>
        </ul>
      </div>
    </div>
  );
}

function PaginationDemo() {
  const [page, setPage] = useState(1);
  const [page2, setPage2] = useState(6);
  const [pageSize, setPageSize] = useState(25);

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage2(1);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <p style={{ marginBottom: '0.5rem' }}>
          <strong>Basic (5 pages):</strong>
        </p>
        <Pagination
          currentPage={page}
          totalPages={5}
          onPageChange={setPage}
          showFirstLast
          style={{ fontFamily: 'inherit' } as React.CSSProperties}
        />
        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
          Current page: {page}
        </p>
      </div>

      <div>
        <p style={{ marginBottom: '0.5rem' }}>
          <strong>Full-featured (312 items, page size selector, jump-to):</strong>
        </p>
        <Pagination
          currentPage={page2}
          totalItems={312}
          pageSize={pageSize}
          pageSizeOptions={[10, 25, 50, 100]}
          onPageChange={setPage2}
          onPageSizeChange={handlePageSizeChange}
          ariaLabel="Search results pagination"
          showFirstLast
          showPageSize
          showJumpTo
          siblingCount={1}
          boundaryCount={1}
        />
        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
          Page {page2} · {pageSize} per page ·{' '}
          Showing {(page2 - 1) * pageSize + 1}–
          {Math.min(page2 * pageSize, 312)} of 312
        </p>
      </div>

      <div>
        <p style={{ marginBottom: '0.5rem' }}>
          <strong>Disabled:</strong>
        </p>
        <Pagination
          currentPage={3}
          totalPages={10}
          onPageChange={() => {}}
          disabled
        />
      </div>
    </div>
  );
}

function BreadcrumbsDemo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      <div>
        <p style={{ marginBottom: '0.5rem' }}>
          <strong>Basic — last item as span (no href, current page):</strong>
        </p>
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Products', href: '/products' },
            { label: 'Keyboards', href: '/products/keyboards' },
            { label: 'Model X' },
          ]}
        />
      </div>

      <div>
        <p style={{ marginBottom: '0.5rem' }}>
          <strong>Last item as link (aria-current="page" on anchor):</strong>
        </p>
        <Breadcrumbs
          ariaLabel="Product breadcrumb"
          items={[
            { label: 'Home', href: '/' },
            { label: 'Products', href: '/products' },
            { label: 'Model X', href: '/products/model-x' },
          ]}
        />
      </div>

      <div>
        <p style={{ marginBottom: '0.5rem' }}>
          <strong>Custom separator — arrow:</strong>
        </p>
        <Breadcrumbs
          separator="›"
          items={[
            { label: 'Home', href: '/' },
            { label: 'Docs', href: '/docs' },
            { label: 'Components', href: '/docs/components' },
            { label: 'Breadcrumbs' },
          ]}
        />
      </div>

      <div>
        <p style={{ marginBottom: '0.5rem' }}>
          <strong>Collapsed (maxItems=3) — click … to expand:</strong>
        </p>
        <Breadcrumbs
          maxItems={3}
          items={[
            { label: 'Home', href: '/' },
            { label: 'Category', href: '/cat' },
            { label: 'Subcategory', href: '/cat/sub' },
            { label: 'Item', href: '/cat/sub/item' },
            { label: 'Detail' },
          ]}
        />
      </div>

      <div className="keyboard-hints">
        <h3>Keyboard Navigation</h3>
        <ul>
          <li><kbd>Tab</kbd> — move between breadcrumb links</li>
          <li><kbd>Enter</kbd> — follow focused link</li>
          <li>
            When collapsed: <kbd>Tab</kbd> to the <strong>…</strong> button,{' '}
            <kbd>Enter</kbd> / <kbd>Space</kbd> to expand; focus moves to first
            newly revealed link
          </li>
        </ul>
        <h3>Screen Reader</h3>
        <ul>
          <li>
            Announced as a <strong>navigation</strong> landmark (
            <code>nav aria-label="Breadcrumb"</code>)
          </li>
          <li>Separators are hidden from screen readers (<code>aria-hidden</code>)</li>
          <li>
            Current page announced as{' '}
            <em>"Model X, current page"</em>
          </li>
        </ul>
      </div>

    </div>
  );
}

function TooltipDemo() {
  const btnStyle: React.CSSProperties = {
    padding: '0.5rem 1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer',
    background: 'white',
    font: 'inherit',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '4rem' }}>

      {/* Basic placements */}
      <div>
        <p style={{ marginBottom: '0.75rem' }}><strong>Placements — hover or Tab to each button:</strong></p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          <Tooltip label="I appear above" placement="top">
            <button style={btnStyle}>Top (default)</button>
          </Tooltip>
          <Tooltip label="I appear below" placement="bottom">
            <button style={btnStyle}>Bottom</button>
          </Tooltip>
          <Tooltip label="I appear to the right" placement="right">
            <button style={btnStyle}>Right</button>
          </Tooltip>
          <Tooltip label="I appear to the left" placement="left">
            <button style={btnStyle}>Left</button>
          </Tooltip>
          <Tooltip label="top-start — aligned to left edge" placement="top-start">
            <button style={btnStyle}>Top-start</button>
          </Tooltip>
          <Tooltip label="bottom-end — aligned to right edge" placement="bottom-end">
            <button style={btnStyle}>Bottom-end</button>
          </Tooltip>
        </div>
      </div>

      {/* Icon buttons */}
      <div>
        <p style={{ marginBottom: '0.75rem' }}><strong>Icon-only buttons with tooltip as description:</strong></p>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Tooltip label="Delete item">
            <button
              aria-label="Delete"
              style={{ ...btnStyle, width: '2.5rem', height: '2.5rem', padding: 0, fontSize: '1.25rem' }}
            >
              🗑
            </button>
          </Tooltip>
          <Tooltip label="Edit item">
            <button
              aria-label="Edit"
              style={{ ...btnStyle, width: '2.5rem', height: '2.5rem', padding: 0, fontSize: '1.25rem' }}
            >
              ✏️
            </button>
          </Tooltip>
          <Tooltip label="Share this link">
            <button
              aria-label="Share"
              style={{ ...btnStyle, width: '2.5rem', height: '2.5rem', padding: 0, fontSize: '1.25rem' }}
            >
              🔗
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Input with tooltip */}
      <div>
        <p style={{ marginBottom: '0.75rem' }}><strong>Input with tooltip description:</strong></p>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <label htmlFor="tooltip-date-input" style={{ fontWeight: 500 }}>Date</label>
          <Tooltip label="Format: YYYY-MM-DD (e.g. 2024-12-31)" placement="right">
            <input
              id="tooltip-date-input"
              type="text"
              placeholder="YYYY-MM-DD"
              style={{ padding: '0.375rem 0.625rem', border: '1px solid #ccc', borderRadius: '4px', font: 'inherit' }}
            />
          </Tooltip>
        </div>
      </div>

      {/* Disabled tooltip */}
      <div>
        <p style={{ marginBottom: '0.75rem' }}><strong>Disabled tooltip:</strong></p>
        <Tooltip label="This will never show" disabled>
          <button style={btnStyle}>Hover me (tooltip disabled)</button>
        </Tooltip>
      </div>

      {/* Long label */}
      <div>
        <p style={{ marginBottom: '0.75rem' }}><strong>Long label — wraps at max-width:</strong></p>
        <Tooltip
          label="This is a longer tooltip that wraps across multiple lines once it reaches the maximum width."
          placement="bottom"
        >
          <button style={btnStyle}>Long description</button>
        </Tooltip>
      </div>

      <div className="keyboard-hints">
        <h3>Keyboard Navigation</h3>
        <ul>
          <li><kbd>Tab</kbd> to trigger — tooltip appears immediately (no delay)</li>
          <li><kbd>Escape</kbd> — closes tooltip; focus stays on trigger</li>
          <li><kbd>Tab</kbd> away — tooltip closes</li>
          <li>Mouse hover shows tooltip after 300 ms delay</li>
        </ul>
        <h3>Screen Reader</h3>
        <ul>
          <li>
            <code>aria-describedby</code> injected on the trigger automatically —
            screen readers announce the tooltip after the element's name and role
          </li>
          <li>Tooltip element stays in the DOM (opacity 0) so the reference is always valid</li>
          <li>Tooltip is not focusable — focus stays on the trigger at all times</li>
        </ul>
      </div>

    </div>
  );
}

function DrawerDemo() {
  const [rightOpen, setRightOpen] = useState(false);
  const [leftOpen, setLeftOpen] = useState(false);
  const [topOpen, setTopOpen] = useState(false);
  const [bottomOpen, setBottomOpen] = useState(false);
  const [controlledOpen, setControlledOpen] = useState(false);
  const [draggableRightOpen, setDraggableRightOpen] = useState(false);
  const [draggableBottomOpen, setDraggableBottomOpen] = useState(false);

  const triggerBtnStyle: React.CSSProperties = {
    padding: '0.5rem 1rem',
    border: '1px solid #ccc',
    borderRadius: '6px',
    background: 'white',
    cursor: 'pointer',
    fontSize: '0.9rem',
  };

  const drawerContentStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    height: '100%',
  };

  const closeStyle: React.CSSProperties = {
    alignSelf: 'flex-end',
    padding: '0.25rem 0.75rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    background: 'white',
    cursor: 'pointer',
  };

  const actionBtnStyle: React.CSSProperties = {
    padding: '0.5rem 1.25rem',
    border: 'none',
    borderRadius: '6px',
    background: '#0066cc',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 600,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* Side variants */}
      <div>
        <p style={{ marginBottom: '0.75rem' }}><strong>Side variants:</strong></p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button style={triggerBtnStyle} onClick={() => setRightOpen(true)}>
            Open Right →
          </button>
          <button style={triggerBtnStyle} onClick={() => setLeftOpen(true)}>
            ← Open Left
          </button>
          <button style={triggerBtnStyle} onClick={() => setTopOpen(true)}>
            ↑ Open Top
          </button>
          <button style={triggerBtnStyle} onClick={() => setBottomOpen(true)}>
            ↓ Open Bottom
          </button>
        </div>
      </div>

      {/* Right drawer */}
      <Drawer open={rightOpen} onOpenChange={setRightOpen} side="right">
        <div style={drawerContentStyle}>
          <Drawer.Close style={closeStyle} />
          <Drawer.Title>Navigation</Drawer.Title>
          <Drawer.Description>Use the links below to navigate the app.</Drawer.Description>
          <Drawer.Content>
            <nav>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {['Dashboard', 'Profile', 'Settings', 'Help'].map((item) => (
                  <li key={item}>
                    <a href="#" style={{ display: 'block', padding: '0.5rem', borderRadius: '4px', textDecoration: 'none', color: '#0066cc' }}>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </Drawer.Content>
          <Drawer.Actions style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
            <button style={actionBtnStyle} onClick={() => setRightOpen(false)}>
              Confirm
            </button>
          </Drawer.Actions>
        </div>
      </Drawer>

      {/* Left drawer */}
      <Drawer open={leftOpen} onOpenChange={setLeftOpen} side="left">
        <div style={drawerContentStyle}>
          <Drawer.Close style={closeStyle} />
          <Drawer.Title>Filters</Drawer.Title>
          <Drawer.Description>Narrow down results using the options below.</Drawer.Description>
          <Drawer.Content>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {['Category', 'Price range', 'Rating', 'Availability'].map((f) => (
                <label key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" />
                  {f}
                </label>
              ))}
            </div>
          </Drawer.Content>
        </div>
      </Drawer>

      {/* Top drawer */}
      <Drawer open={topOpen} onOpenChange={setTopOpen} side="top">
        <div style={drawerContentStyle}>
          <Drawer.Close style={closeStyle} />
          <Drawer.Title>Search</Drawer.Title>
          <Drawer.Content>
            <input
              type="search"
              placeholder="Search…"
              autoFocus
              style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ccc', borderRadius: '6px', fontSize: '1rem' }}
            />
          </Drawer.Content>
        </div>
      </Drawer>

      {/* Bottom sheet — draggable */}
      <Drawer open={bottomOpen} onOpenChange={setBottomOpen} side="bottom" draggable>
        <Drawer.Handle />
        <Drawer.Title>Share</Drawer.Title>
        <Drawer.Description>Drag the handle down to dismiss, or choose an option.</Drawer.Description>
        <Drawer.Content>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            {['Copy link', 'Email', 'Twitter', 'LinkedIn'].map((option) => (
              <button
                key={option}
                style={{ ...triggerBtnStyle, flex: '1 1 120px' }}
                onClick={() => setBottomOpen(false)}
              >
                {option}
              </button>
            ))}
          </div>
        </Drawer.Content>
      </Drawer>

      {/* Controlled example */}
      <div>
        <p style={{ marginBottom: '0.75rem' }}><strong>Controlled mode:</strong></p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button style={triggerBtnStyle} onClick={() => setControlledOpen(true)}>
            Open drawer
          </button>
          <span style={{ fontSize: '0.875rem', color: '#666' }}>
            State: <code>{controlledOpen ? 'open' : 'closed'}</code>
          </span>
        </div>
        <Drawer open={controlledOpen} onOpenChange={setControlledOpen} side="right">
          <Drawer.Title>Controlled Drawer</Drawer.Title>
          <Drawer.Description>This drawer is driven by external state.</Drawer.Description>
          <Drawer.Content>
            <p>Current state is tracked outside the component.</p>
          </Drawer.Content>
          <Drawer.Actions style={{ marginTop: '1.5rem' }}>
            <Drawer.Close style={actionBtnStyle}>Done</Drawer.Close>
          </Drawer.Actions>
        </Drawer>
      </div>

      {/* Uncontrolled example */}
      <div>
        <p style={{ marginBottom: '0.75rem' }}><strong>Uncontrolled mode (defaultOpen):</strong></p>
        <Drawer defaultOpen={false} side="right">
          <Drawer.Trigger>Open uncontrolled drawer</Drawer.Trigger>
          <Drawer.Title>Uncontrolled Drawer</Drawer.Title>
          <Drawer.Description>Internal state — no external open/close needed.</Drawer.Description>
          <Drawer.Content>
            <p>The drawer manages its own open state.</p>
          </Drawer.Content>
          <Drawer.Actions style={{ marginTop: '1.5rem' }}>
            <Drawer.Close style={closeStyle}>Close</Drawer.Close>
          </Drawer.Actions>
        </Drawer>
      </div>

      {/* ── Draggable (drag-to-dismiss) ── */}
      <div>
        <p style={{ marginBottom: '0.5rem' }}><strong>Draggable (drag-to-dismiss):</strong></p>
        <p style={{ marginBottom: '0.75rem', fontSize: '0.875rem', color: '#555' }}>
          Add <code>draggable</code> to any <code>Drawer</code> and include a <code>Drawer.Handle</code>.
          Drag the handle past 40% of the panel's dimension to dismiss; release earlier to snap back.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button style={triggerBtnStyle} onClick={() => setDraggableRightOpen(true)}>
            Draggable → Right
          </button>
          <button style={triggerBtnStyle} onClick={() => setDraggableBottomOpen(true)}>
            Draggable ↓ Bottom sheet
          </button>
        </div>
      </div>

      {/* Draggable right drawer */}
      <Drawer open={draggableRightOpen} onOpenChange={setDraggableRightOpen} side="right" draggable>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1rem' }}>
          <Drawer.Handle
            style={{
              width: '4px',
              height: '48px',
              margin: '0.25rem 0 0',
              flexShrink: 0,
            }}
          />
          <div>
            <Drawer.Title>Draggable panel</Drawer.Title>
            <Drawer.Description style={{ marginTop: '0.25rem' }}>
              Grab the handle and drag right to dismiss.
            </Drawer.Description>
          </div>
        </div>
        <Drawer.Content>
          <p style={{ fontSize: '0.9rem', color: '#555', lineHeight: 1.6 }}>
            Pointer capture ensures the drag tracks even if you move outside the panel.
            Release before 40% to snap back.
          </p>
        </Drawer.Content>
        <Drawer.Actions style={{ marginTop: '1.5rem' }}>
          <Drawer.Close style={closeStyle}>Close</Drawer.Close>
        </Drawer.Actions>
      </Drawer>

      {/* Draggable bottom sheet */}
      <Drawer open={draggableBottomOpen} onOpenChange={setDraggableBottomOpen} side="bottom" draggable>
        <Drawer.Handle />
        <Drawer.Title>Bottom sheet</Drawer.Title>
        <Drawer.Description style={{ marginTop: '0.25rem' }}>
          Grab the pill above and drag down to dismiss.
        </Drawer.Description>
        <Drawer.Content>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
            {['Copy link', 'Email', 'Twitter', 'LinkedIn'].map((option) => (
              <button
                key={option}
                style={{ ...triggerBtnStyle, flex: '1 1 120px' }}
                onClick={() => setDraggableBottomOpen(false)}
              >
                {option}
              </button>
            ))}
          </div>
        </Drawer.Content>
      </Drawer>

      <div className="keyboard-hints">
        <h3>Keyboard Navigation</h3>
        <ul>
          <li><kbd>Escape</kbd> — closes the drawer, returns focus to trigger</li>
          <li><kbd>Tab</kbd> / <kbd>Shift+Tab</kbd> — cycles focus within the drawer (trapped)</li>
          <li>Click outside (overlay) — closes the drawer</li>
        </ul>
        <h3>Screen Reader</h3>
        <ul>
          <li><code>role="dialog"</code> + <code>aria-modal="true"</code> on the panel</li>
          <li><code>aria-labelledby</code> linked to <code>Drawer.Title</code></li>
          <li>"Drawer opened" / "Drawer closed" announced politely on state change</li>
        </ul>
      </div>

    </div>
  );
}

function ProgressBarDemo() {
  const [uploadValue, setUploadValue] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'active' | 'complete' | 'error'>('active');
  const [isRunning, setIsRunning] = useState(false);

  const startUpload = () => {
    setUploadValue(0);
    setUploadStatus('active');
    setIsRunning(true);
    let v = 0;
    const tick = setInterval(() => {
      v += Math.floor(Math.random() * 8) + 3;
      if (v >= 100) {
        setUploadValue(100);
        setUploadStatus('complete');
        setIsRunning(false);
        clearInterval(tick);
      } else {
        setUploadValue(v);
      }
    }, 300);
  };

  const triggerError = () => {
    setUploadValue(42);
    setUploadStatus('error');
    setIsRunning(false);
  };

  const statusText =
    uploadStatus === 'complete'
      ? 'Upload complete — file is ready'
      : uploadStatus === 'error'
        ? 'Upload failed. Check your connection and retry.'
        : isRunning
          ? `Uploading… ${uploadValue}% complete`
          : 'Press "Start upload" to begin';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* Determinate — simulated upload */}
      <div>
        <h3 style={{ marginBottom: '0.75rem' }}>Determinate — file upload</h3>
        <ProgressBar
          label="Profile photo upload"
          value={uploadValue}
          status={uploadStatus}
          statusText={statusText}
          milestones={[25, 50, 75, 100]}
          style={{ marginBottom: '0.75rem' }}
        />
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={startUpload}
            disabled={isRunning}
            style={{
              padding: '0.4rem 0.9rem',
              borderRadius: '4px',
              border: '1px solid #0066cc',
              background: '#0066cc',
              color: 'white',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              opacity: isRunning ? 0.6 : 1,
            }}
          >
            {isRunning ? 'Uploading…' : 'Start upload'}
          </button>
          <button
            type="button"
            onClick={triggerError}
            disabled={isRunning}
            style={{
              padding: '0.4rem 0.9rem',
              borderRadius: '4px',
              border: '1px solid #ef4444',
              background: 'white',
              color: '#ef4444',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              opacity: isRunning ? 0.6 : 1,
            }}
          >
            Simulate error
          </button>
        </div>
      </div>

      {/* Custom valueText */}
      <div>
        <h3 style={{ marginBottom: '0.75rem' }}>Custom valueText</h3>
        <ProgressBar
          label="Onboarding"
          value={2}
          min={0}
          max={5}
          valueText={(v: number, _min: number, max: number) => `Step ${v} of ${max}`}
          statusText="Complete your profile to get started"
        />
      </div>

      {/* Indeterminate */}
      <div>
        <h3 style={{ marginBottom: '0.75rem' }}>Indeterminate</h3>
        <ProgressBar
          label="Loading report data"
          statusText="Fetching results from the server…"
        />
      </div>

      {/* Complete */}
      <div>
        <h3 style={{ marginBottom: '0.75rem' }}>Complete</h3>
        <ProgressBar
          label="Video export"
          value={100}
          status="complete"
          statusText="Export ready — check your downloads folder"
        />
      </div>

      {/* Error */}
      <div>
        <h3 style={{ marginBottom: '0.75rem' }}>Error</h3>
        <ProgressBar
          label="Database backup"
          value={37}
          status="error"
          statusText="Connection lost. Retry?"
        />
      </div>

      {/* Screen reader notes */}
      <div>
        <h3>Screen Reader</h3>
        <ul>
          <li><code>role="progressbar"</code> with <code>aria-valuemin</code>, <code>aria-valuemax</code>, <code>aria-valuenow</code></li>
          <li>No <code>aria-valuenow</code> when indeterminate — avoids fake precision</li>
          <li>Milestone crossings announced politely (25 %, 50 %, 75 %, 100 %)</li>
          <li>Status transitions to "complete" / "error" announced automatically</li>
          <li>Visible value text and status message aid cognitive accessibility</li>
        </ul>
      </div>
    </div>
  );
}

function SliderDemo() {
  const [volume, setVolume] = useState(50);
  const [priceRange, setPriceRange] = useState<[number, number]>([20, 80]);
  const [level, setLevel] = useState(3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* Single thumb */}
      <div>
        <h3 style={{ marginBottom: '0.75rem' }}>Single thumb (uncontrolled)</h3>
        <Slider
          label="Brightness"
          defaultValue={40}
          min={0}
          max={100}
          step={5}
          valueText={(v: number) => `${v}%`}
        />
      </div>

      {/* Controlled */}
      <div>
        <h3 style={{ marginBottom: '0.75rem' }}>
          Controlled — Volume: {volume}%
        </h3>
        <Slider
          label="Volume"
          value={volume}
          onValueChange={setVolume}
          min={0}
          max={100}
          step={1}
          valueText={(v: number) => `${v}%`}
        />
      </div>

      {/* Discrete steps with aria-valuetext */}
      <div>
        <h3 style={{ marginBottom: '0.75rem' }}>Discrete steps — Level: {['Off', 'Low', 'Medium', 'High', 'Max'][level]}</h3>
        <Slider
          label="Fan speed"
          value={level}
          onValueChange={setLevel}
          min={0}
          max={4}
          step={1}
          valueText={(v: number) => ['Off', 'Low', 'Medium', 'High', 'Max'][v] ?? String(v)}
        />
      </div>

      {/* Range slider */}
      <div>
        <h3 style={{ marginBottom: '0.75rem' }}>
          Range — ${priceRange[0]} – ${priceRange[1]}
        </h3>
        <Slider
          label="Price range"
          range
          values={priceRange}
          onValuesChange={setPriceRange}
          min={0}
          max={200}
          step={5}
          minThumbLabel="Minimum price"
          maxThumbLabel="Maximum price"
          valueText={(v: number) => `$${v}`}
        />
      </div>

      {/* Disabled */}
      <div>
        <h3 style={{ marginBottom: '0.75rem' }}>Disabled</h3>
        <Slider
          label="Rating (read-only)"
          defaultValue={70}
          disabled
        />
      </div>

      {/* Accessibility notes */}
      <div>
        <h3>Keyboard</h3>
        <ul>
          <li><kbd>←</kbd> / <kbd>↓</kbd> — decrease by one step</li>
          <li><kbd>→</kbd> / <kbd>↑</kbd> — increase by one step</li>
          <li><kbd>Home</kbd> — jump to minimum</li>
          <li><kbd>End</kbd> — jump to maximum</li>
          <li><kbd>Page Down</kbd> / <kbd>Page Up</kbd> — large step</li>
        </ul>
        <h3>Screen Reader</h3>
        <ul>
          <li><code>role="slider"</code> with <code>aria-valuemin</code>, <code>aria-valuemax</code>, <code>aria-valuenow</code></li>
          <li><code>aria-valuetext</code> when a custom label factory is provided</li>
          <li>Range thumbs labelled individually ("Minimum price" / "Maximum price")</li>
          <li>Value announced politely after each change</li>
        </ul>
      </div>
    </div>
  );
}

function SkeletonDemo() {
  const gap: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '2rem' };
  const row: React.CSSProperties = { display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' };

  return (
    <div style={gap}>
      <div>
        <h3 style={{ marginBottom: '0.75rem' }}>Variants</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: 400 }}>
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="rectangular" height={120} />
          <div style={row}>
            <Skeleton variant="circular" width={48} height={48} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="40%" />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 style={{ marginBottom: '0.75rem' }}>No animation</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: 300 }}>
          <Skeleton variant="text" animated={false} />
          <Skeleton variant="text" width="70%" animated={false} />
          <Skeleton variant="rectangular" height={80} animated={false} />
        </div>
      </div>

      <div>
        <h3 style={{ marginBottom: '0.75rem' }}>Card skeleton — container owns a11y</h3>
        <p style={{ fontSize: '0.875rem', color: '#555', marginBottom: '0.75rem' }}>
          The <code>section</code> carries <code>aria-busy="true"</code> and the label.
          Individual skeleton blocks are wrapped in <code>aria-hidden="true"</code>.
        </p>
        <section
          aria-label="Loading article"
          aria-busy="true"
          style={{ maxWidth: 360, border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}
        >
          <div aria-hidden="true">
            <Skeleton variant="rectangular" height={180} style={{ borderRadius: 0 }} />
            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Skeleton variant="text" width="55%" />
              <Skeleton variant="text" />
              <Skeleton variant="text" width="80%" />
            </div>
          </div>
        </section>
      </div>

      <div>
        <h3 style={{ marginBottom: '0.75rem' }}>A11y notes</h3>
        <ul style={{ fontSize: '0.875rem', color: '#555', lineHeight: 1.7 }}>
          <li>Each <code>{'<Skeleton>'}</code> renders with <code>aria-hidden="true"</code> — purely decorative</li>
          <li>The loading region communicates state via <code>aria-busy="true"</code> on its container</li>
          <li>Animation respects <code>prefers-reduced-motion</code> automatically (fade pulse instead of shimmer)</li>
          <li>High Contrast mode: shimmer hidden, border applied via <code>forced-colors</code> query</li>
        </ul>
      </div>
    </div>
  );
}

function NumberFieldDemo() {
  const [quantity, setQuantity] = useState<number | undefined>(1);
  const [budget, setBudget] = useState<number | undefined>(250);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      <div>
        <h3 style={{ marginBottom: '0.75rem' }}>Basic — quantity with steppers</h3>
        <NumberField
          label="Quantity"
          value={quantity}
          onValueChange={setQuantity}
          min={1}
          max={99}
          step={1}
          showSteppers
          hint="Maximum 99 units per order."
          style={{ maxWidth: 220 }}
        />
        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#555' }}>
          Value: <strong>{quantity ?? '—'}</strong>
        </p>
      </div>

      <div>
        <h3 style={{ marginBottom: '0.75rem' }}>Currency formatting</h3>
        <p style={{ fontSize: '0.875rem', color: '#555', marginBottom: '0.75rem' }}>
          Focus to edit the raw number. Blur to see it formatted as USD.
        </p>
        <NumberField
          label="Budget"
          value={budget}
          onValueChange={setBudget}
          min={0}
          step={0.01}
          formatOptions={{ style: 'currency', currency: 'USD' }}
          hint="Enter an amount in US dollars."
          style={{ maxWidth: 260 }}
        />
        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#555' }}>
          Value: <strong>{budget ?? '—'}</strong>
        </p>
      </div>

      <div>
        <h3 style={{ marginBottom: '0.75rem' }}>Fractional step — percentage</h3>
        <NumberField
          label="Rating"
          defaultValue={7.5}
          min={0}
          max={10}
          step={0.5}
          largeStep={2}
          hint="Enter a value from 0 to 10 in 0.5 increments."
          style={{ maxWidth: 260 }}
        />
      </div>

      <div>
        <h3 style={{ marginBottom: '0.75rem' }}>Validation — built-in error on blur</h3>
        <p style={{ fontSize: '0.875rem', color: '#555', marginBottom: '0.75rem' }}>
          Type a number outside 1–10 and tab away to see a built-in validation message announced to screen readers.
        </p>
        <NumberField
          label="Score"
          min={1}
          max={10}
          step={1}
          placeholder="1–10"
          required
          style={{ maxWidth: 220 }}
        />
      </div>

      <div>
        <h3 style={{ marginBottom: '0.75rem' }}>Disabled</h3>
        <NumberField
          label="Seats reserved"
          value={4}
          min={1}
          max={20}
          showSteppers
          disabled
          style={{ maxWidth: 220 }}
        />
      </div>

      <div>
        <h3 style={{ marginBottom: '0.75rem' }}>A11y notes</h3>
        <ul style={{ fontSize: '0.875rem', color: '#555', lineHeight: 1.7 }}>
          <li>Uses <code>{'<input type="text" inputMode="numeric|decimal">'}</code> + <code>role="spinbutton"</code> — not <code>type="number"</code></li>
          <li><code>aria-valuenow</code>, <code>aria-valuemin</code>, <code>aria-valuemax</code> keep screen readers informed</li>
          <li>Arrow Up/Down step · Page Up/Down large step · Home/End jump to min/max</li>
          <li>Validation errors announced assertively on blur; hint linked via <code>aria-describedby</code></li>
          <li>Stepper buttons are never the only input path — typing always works</li>
          <li>Steppers meet the 44×44px minimum touch target</li>
        </ul>
      </div>
    </div>
  );
}

function EmptyStateDemo() {
  const [showResults, setShowResults] = useState(true);
  const card: React.CSSProperties = {
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    overflow: 'hidden',
    background: '#fafafa',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      <div>
        <h3 style={{ marginBottom: '0.75rem' }}>Static — brand-new account</h3>
        <div style={card}>
          <EmptyState
            title="No projects yet"
            description="Create your first project to get started with your team."
            icon={
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
              </svg>
            }
            action={<button style={{ padding: '0.5rem 1.25rem', background: '#0066cc', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.875rem' }}>Create project</button>}
            secondaryAction={<button style={{ padding: '0.5rem 1.25rem', background: 'transparent', border: '1px solid #ccc', borderRadius: 6, cursor: 'pointer', fontSize: '0.875rem' }}>Browse templates</button>}
          />
        </div>
      </div>

      <div>
        <h3 style={{ marginBottom: '0.75rem' }}>Dynamic — search / filter result</h3>
        <p style={{ fontSize: '0.875rem', color: '#555', marginBottom: '0.75rem' }}>
          Toggle results to simulate a filter returning nothing. The empty state uses <code>live</code> so screen readers announce the change.
        </p>
        <div style={{ marginBottom: '0.75rem' }}>
          <button
            onClick={() => setShowResults(r => !r)}
            style={{ padding: '0.5rem 1rem', border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer', fontSize: '0.875rem' }}
          >
            {showResults ? 'Apply filter (clears results)' : 'Clear filter (restore results)'}
          </button>
        </div>
        <div style={{ ...card, minHeight: 180 }}>
          {showResults ? (
            <ul style={{ padding: '1rem', margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li style={{ padding: '0.5rem', background: '#fff', borderRadius: 4, border: '1px solid #e2e8f0' }}>Wireless Mouse</li>
              <li style={{ padding: '0.5rem', background: '#fff', borderRadius: 4, border: '1px solid #e2e8f0' }}>Mechanical Keyboard</li>
              <li style={{ padding: '0.5rem', background: '#fff', borderRadius: 4, border: '1px solid #e2e8f0' }}>USB-C Hub</li>
            </ul>
          ) : (
            <EmptyState
              live
              title="No results"
              description='No items match the active filter. Try clearing filters or adjusting your search.'
              action={<button onClick={() => setShowResults(true)} style={{ padding: '0.5rem 1.25rem', background: '#0066cc', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.875rem' }}>Clear filters</button>}
            />
          )}
        </div>
      </div>

      <div>
        <h3 style={{ marginBottom: '0.75rem' }}>Minimal — no icon, no actions</h3>
        <div style={card}>
          <EmptyState
            title="No notifications"
            description="You're all caught up."
          />
        </div>
      </div>

      <div>
        <h3 style={{ marginBottom: '0.75rem' }}>A11y notes</h3>
        <ul style={{ fontSize: '0.875rem', color: '#555', lineHeight: 1.7 }}>
          <li>Title renders as a real heading — pick <code>headingLevel</code> to fit the document outline</li>
          <li>Icon slot is always wrapped in <code>aria-hidden="true"</code> — meaning comes from text only</li>
          <li>Add <code>live</code> when the empty state appears after a user action (search, filter, delete)</li>
          <li>Static empty states (brand-new account) need no live region — they are page content</li>
          <li>Actions slot accepts any element — button, link, or custom component</li>
        </ul>
      </div>
    </div>
  );
}

const DEMO_ITEMS = [
  'Apples', 'Avocados', 'Bananas', 'Blueberries', 'Cherries',
  'Grapes', 'Kiwi', 'Mangoes', 'Oranges', 'Papayas',
  'Peaches', 'Pears', 'Pineapples', 'Raspberries', 'Strawberries',
];

function SearchFieldDemo() {
  const [filterQuery, setFilterQuery] = useState('');
  const [submitQuery, setSubmitQuery] = useState('');
  const [lastSubmit, setLastSubmit] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const filtered = DEMO_ITEMS.filter(item =>
    item.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const handleSubmit = (value: string) => {
    setLastSubmit(value);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1200);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      <div>
        <h3 style={{ marginBottom: '0.75rem' }}>Filter-as-you-type</h3>
        <p style={{ fontSize: '0.875rem', color: '#555', marginBottom: '0.75rem' }}>
          Results count is announced politely (debounced) as you type.
        </p>
        <SearchField
          label="Search fruits"
          value={filterQuery}
          onChange={setFilterQuery}
          onClear={() => setFilterQuery('')}
          resultsCount={filtered.length}
          placeholder="e.g. berry"
          style={{ maxWidth: 320 }}
        />
        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#555' }}>
          {filtered.length === 0
            ? 'No results'
            : `${filtered.length} result${filtered.length === 1 ? '' : 's'}`}
        </p>
        {filtered.length > 0 && (
          <ul style={{ marginTop: '0.5rem', fontSize: '0.875rem', paddingLeft: '1.25rem' }}>
            {filtered.map(item => <li key={item}>{item}</li>)}
          </ul>
        )}
      </div>

      <div>
        <h3 style={{ marginBottom: '0.75rem' }}>Submit pattern with loading state</h3>
        <p style={{ fontSize: '0.875rem', color: '#555', marginBottom: '0.75rem' }}>
          Press Enter or click Search to trigger a (simulated) async search.
        </p>
        <SearchField
          label="Search products"
          value={submitQuery}
          onChange={setSubmitQuery}
          onSubmit={handleSubmit}
          onClear={() => setSubmitQuery('')}
          isLoading={isLoading}
          showSearchButton
          placeholder="Search…"
          hint="Press Enter or click Search."
          style={{ maxWidth: 380 }}
        />
        {lastSubmit && (
          <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#555' }}>
            Last search: <strong>{lastSubmit}</strong>
          </p>
        )}
      </div>

      <div>
        <h3 style={{ marginBottom: '0.75rem' }}>With error</h3>
        <SearchField
          label="Search orders"
          defaultValue="ORD-"
          error="Search requires at least 3 characters."
          style={{ maxWidth: 320 }}
        />
      </div>

      <div>
        <h3 style={{ marginBottom: '0.75rem' }}>Disabled</h3>
        <SearchField
          label="Search (unavailable)"
          disabled
          style={{ maxWidth: 320 }}
        />
      </div>

      <div>
        <h3 style={{ marginBottom: '0.75rem' }}>A11y notes</h3>
        <ul style={{ fontSize: '0.875rem', color: '#555', lineHeight: 1.7 }}>
          <li>Wrapped in <code>{'<form role="search">'}</code> — screen reader users can jump to it via landmarks</li>
          <li>Uses <code>type="search"</code> — triggers search keyboard on mobile</li>
          <li>Results count announced politely, debounced 300 ms — no per-keystroke spam</li>
          <li>Clear button only appears when there is text; restores focus to input after clearing</li>
          <li>Loading state announced via <code>useAnnounceLoading</code> ("Searching…" / "Search complete")</li>
          <li>Label is a real <code>{'<label htmlFor>'}</code> — placeholder never used as the only label</li>
        </ul>
      </div>
    </div>
  );
}

function FileUploadDemo() {
  const [files, setFiles] = useState<FileUploadFile[]>([]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h3 style={{ marginBottom: '0.75rem' }}>Basic — with trigger button</h3>
        <FileUpload
          label="Upload resume"
          accept=".pdf,.docx"
          maxSizeBytes={5_000_000}
          onFilesChange={(f) => console.log('Files:', f)}
        >
          <FileUpload.Trigger>Choose file</FileUpload.Trigger>
          <FileUpload.Description>PDF or DOCX, max 5 MB</FileUpload.Description>
          <FileUpload.FileList>
            {(f) => f.map((file) => <FileUpload.FileItem key={file.id} file={file} />)}
          </FileUpload.FileList>
          <FileUpload.Error />
        </FileUpload>
      </div>

      <div>
        <h3 style={{ marginBottom: '0.75rem' }}>Dropzone — multiple files</h3>
        <FileUpload
          accept="image/*"
          multiple
          maxFiles={5}
          maxSizeBytes={5_000_000}
          files={files}
          onFilesChange={setFiles}
        >
          <FileUpload.Label>Upload images</FileUpload.Label>
          <FileUpload.Dropzone>
            <span style={{ fontSize: '0.875rem', color: '#555' }}>
              Drag images here or click to browse
            </span>
          </FileUpload.Dropzone>
          <FileUpload.Description>PNG, JPG or GIF. Max 5 MB each, up to 5 files.</FileUpload.Description>
          <FileUpload.FileList>
            {(f) => f.map((file) => <FileUpload.FileItem key={file.id} file={file} />)}
          </FileUpload.FileList>
          <FileUpload.Error />
        </FileUpload>
      </div>

      <div>
        <h3 style={{ marginBottom: '0.75rem' }}>With external error</h3>
        <FileUpload
          label="Upload document"
          accept=".pdf"
          error="Please upload a signed document."
        >
          <FileUpload.Trigger>Choose file</FileUpload.Trigger>
          <FileUpload.FileList>
            {(f) => f.map((file) => <FileUpload.FileItem key={file.id} file={file} />)}
          </FileUpload.FileList>
          <FileUpload.Error />
        </FileUpload>
      </div>

      <div>
        <h3 style={{ marginBottom: '0.75rem' }}>Disabled</h3>
        <FileUpload label="Upload (unavailable)" disabled>
          <FileUpload.Trigger>Choose file</FileUpload.Trigger>
          <FileUpload.FileList>
            {(f) => f.map((file) => <FileUpload.FileItem key={file.id} file={file} />)}
          </FileUpload.FileList>
        </FileUpload>
      </div>

      <div>
        <h3 style={{ marginBottom: '0.75rem' }}>A11y notes</h3>
        <ul style={{ fontSize: '0.875rem', color: '#555', lineHeight: 1.7 }}>
          <li>Real <code>{'<input type="file">'}</code> is visually hidden — keyboard users activate it via the trigger button or dropzone</li>
          <li>Trigger is a native <code>{'<button>'}</code> — Enter/Space opens the file picker</li>
          <li>Dropzone has <code>role="button"</code> + <code>tabindex="0"</code> — fully keyboard accessible</li>
          <li>Constraints (accepted types, max size) shown as visible description linked via <code>aria-describedby</code></li>
          <li>Validation errors use <code>role="alert"</code> and are announced assertively</li>
          <li>File additions/removals announced politely to screen readers</li>
          <li>Each file's remove button has <code>aria-label="Remove filename"</code></li>
          <li>After removing a file, focus moves to the adjacent item or back to the trigger</li>
          <li>Drag-and-drop is a visual bonus — not the only way to add files</li>
        </ul>
      </div>
    </div>
  );
}

function ErrorSummaryDemo() {
  const [showFormErrors, setShowFormErrors] = useState(false);
  const [showPageError, setShowPageError] = useState(true);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h3 style={{ marginBottom: '0.75rem' }}>Form validation (default)</h3>
        <p style={{ fontSize: '0.875rem', color: '#555', marginBottom: '0.75rem' }}>
          Click "Submit" to trigger the error summary. It auto-focuses on render.
        </p>

        {showFormErrors && (
          <ErrorSummary
            title="There are 3 problems with your submission"
            errors={[
              { message: 'Enter your first name', fieldId: 'demo-first-name' },
              { message: 'Enter a valid email address', fieldId: 'demo-email' },
              { message: 'Accept the terms and conditions', fieldId: 'demo-terms' },
            ]}
            style={{ marginBottom: '1rem' }}
          />
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setShowFormErrors(true);
          }}
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}
        >
          <div>
            <label htmlFor="demo-first-name" style={{ display: 'block', fontWeight: 500, marginBottom: '0.25rem' }}>First name</label>
            <input id="demo-first-name" type="text" style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }} />
          </div>
          <div>
            <label htmlFor="demo-email" style={{ display: 'block', fontWeight: 500, marginBottom: '0.25rem' }}>Email</label>
            <input id="demo-email" type="email" style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input id="demo-terms" type="checkbox" />
            <label htmlFor="demo-terms">I accept the terms and conditions</label>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button type="submit">Submit</Button>
            {showFormErrors && (
              <Button variant="outline" type="button" onClick={() => setShowFormErrors(false)}>
                Clear errors
              </Button>
            )}
          </div>
        </form>
      </div>

      <div>
        <h3 style={{ marginBottom: '0.75rem' }}>Page / system error</h3>
        {showPageError ? (
          <ErrorSummary
            variant="page"
            title="Something went wrong"
            description="We could not save your changes. Please try again."
            errors={[{ message: 'Server error: connection timed out' }]}
            actions={
              <Button variant="outline" onClick={() => alert('Retrying...')}>
                Retry
              </Button>
            }
            onDismiss={() => setShowPageError(false)}
          />
        ) : (
          <Button variant="outline" onClick={() => setShowPageError(true)}>
            Show page error again
          </Button>
        )}
      </div>

      <div>
        <h3 style={{ marginBottom: '0.75rem' }}>Keyboard navigation</h3>
        <div className="keyboard-hints">
          <ul>
            <li><kbd>Tab</kbd> moves through error links</li>
            <li><kbd>Enter</kbd> on a link focuses the corresponding field</li>
            <li>Form variant auto-focuses the summary on render</li>
            <li>Page variant uses <code>role="alert"</code> for screen reader announcement</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function StepperDemo() {
  const [currentStep, setCurrentStep] = useState('payment');

  const progressSteps: StepItem[] = [
    { id: 'shipping', label: 'Shipping', state: 'completed' },
    { id: 'payment', label: 'Payment' },
    { id: 'review', label: 'Review' },
    { id: 'confirm', label: 'Confirm' },
  ];

  const navSteps: StepItem[] = [
    { id: 'shipping', label: 'Shipping', state: 'completed', description: 'Address confirmed' },
    { id: 'payment', label: 'Payment', description: 'Enter payment details' },
    { id: 'review', label: 'Review', state: 'upcoming' },
    { id: 'confirm', label: 'Confirm', state: 'locked' },
  ];

  const errorSteps: StepItem[] = [
    { id: 'account', label: 'Account', state: 'completed' },
    { id: 'profile', label: 'Profile', state: 'error' },
    { id: 'settings', label: 'Settings', state: 'upcoming' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h3 style={{ marginBottom: '0.75rem' }}>Progress indicator (non-interactive)</h3>
        <Stepper
          ariaLabel="Checkout progress"
          mode="progress"
          steps={progressSteps}
          currentStepId="payment"
          showStepCount
        />
      </div>

      <div>
        <h3 style={{ marginBottom: '0.75rem' }}>Navigation (interactive)</h3>
        <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
          Current step: <strong>{currentStep}</strong> — click completed steps to go back. Locked steps are disabled.
        </p>
        <Stepper
          ariaLabel="Checkout steps"
          mode="navigation"
          steps={navSteps}
          currentStepId={currentStep}
          onStepSelect={(id) => setCurrentStep(id)}
        />
      </div>

      <div>
        <h3 style={{ marginBottom: '0.75rem' }}>Vertical orientation with error state</h3>
        <Stepper
          ariaLabel="Profile setup"
          mode="navigation"
          steps={errorSteps}
          currentStepId="profile"
          orientation="vertical"
          onStepSelect={(id) => alert(`Navigate to: ${id}`)}
        />
      </div>

      <div>
        <h3 style={{ marginBottom: '0.75rem' }}>Keyboard navigation</h3>
        <div className="keyboard-hints">
          <ul>
            <li><kbd>Tab</kbd> moves between interactive steps (navigation mode)</li>
            <li><kbd>Enter</kbd> / <kbd>Space</kbd> activates a step</li>
            <li>Disabled/locked steps are skipped by Tab</li>
            <li>Progress mode has no interactive elements</li>
            <li><code>aria-current="step"</code> marks the current step</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// DataGrid Demo
// ============================================================================

interface Invoice {
  id: string;
  number: string;
  client: string;
  amount: string;
  status: string;
  date: string;
}

const invoiceData: Invoice[] = [
  { id: '1', number: 'INV-001', client: 'Acme Corp', amount: '$1,200.00', status: 'Paid', date: '2026-03-01' },
  { id: '2', number: 'INV-002', client: 'Globex Inc', amount: '$3,450.00', status: 'Pending', date: '2026-03-02' },
  { id: '3', number: 'INV-003', client: 'Initech', amount: '$890.00', status: 'Overdue', date: '2026-02-15' },
  { id: '4', number: 'INV-004', client: 'Umbrella Co', amount: '$2,100.00', status: 'Paid', date: '2026-03-04' },
  { id: '5', number: 'INV-005', client: 'Stark Industries', amount: '$15,000.00', status: 'Pending', date: '2026-03-05' },
  { id: '6', number: 'INV-006', client: 'Wayne Enterprises', amount: '$8,750.00', status: 'Paid', date: '2026-03-06' },
  { id: '7', number: 'INV-007', client: 'Oscorp', amount: '$4,200.00', status: 'Overdue', date: '2026-02-20' },
  { id: '8', number: 'INV-008', client: 'LexCorp', amount: '$6,300.00', status: 'Pending', date: '2026-03-07' },
  { id: '9', number: 'INV-009', client: 'Cyberdyne', amount: '$950.00', status: 'Paid', date: '2026-02-28' },
  { id: '10', number: 'INV-010', client: 'Weyland-Yutani', amount: '$11,400.00', status: 'Pending', date: '2026-03-03' },
  { id: '11', number: 'INV-011', client: 'Soylent Corp', amount: '$2,800.00', status: 'Paid', date: '2026-02-25' },
  { id: '12', number: 'INV-012', client: 'Tyrell Corp', amount: '$7,600.00', status: 'Overdue', date: '2026-02-10' },
];

const invoiceColumns: DataGridColumnDef<Invoice>[] = [
  { id: 'number', header: 'Invoice #', accessor: 'number', sortable: true, rowHeader: true },
  { id: 'client', header: 'Client', accessor: 'client', sortable: true },
  { id: 'amount', header: 'Amount', accessor: 'amount', sortable: true, align: 'right' },
  { id: 'status', header: 'Status', accessor: 'status', sortable: true },
  { id: 'date', header: 'Date', accessor: 'date', sortable: true },
];

function DataGridDemo() {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<DataGridSortDirection>('none');
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h3 style={{ marginBottom: '0.75rem' }}>Table mode (default) — sorting, selection, pagination</h3>
        <DataGrid<Invoice>
          columns={invoiceColumns}
          rows={invoiceData}
          caption="Invoices for March 2026"
          selectable
          selectedRows={selected}
          onSelectionChange={setSelected}
          sortKey={sortKey}
          sortDirection={sortDir}
          onSortChange={(key, dir) => { setSortKey(key); setSortDir(dir); }}
          page={page}
          pageSize={5}
          onPageChange={setPage}
          striped
          renderRowActions={(row) => (
            <button
              type="button"
              onClick={() => alert(`View ${row.number}`)}
              style={{ fontSize: '0.8125rem', padding: '0.25rem 0.5rem' }}
            >
              View
            </button>
          )}
        />
        {selected.length > 0 && (
          <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
            Selected: {selected.join(', ')}
          </p>
        )}
      </div>

      <div>
        <h3 style={{ marginBottom: '0.75rem' }}>Grid mode — arrow key cell navigation</h3>
        <DataGrid<Invoice>
          columns={invoiceColumns.map(c => ({ ...c, editable: c.id === 'client' || c.id === 'amount' }))}
          rows={invoiceData.slice(0, 5)}
          caption="Editable invoices"
          mode="grid"
          bordered
          onCellEdit={(rowId, colId, value) => alert(`Edit row ${rowId}, col ${colId}: ${value}`)}
        />
      </div>

      <div>
        <h3 style={{ marginBottom: '0.75rem' }}>Keyboard navigation</h3>
        <div className="keyboard-hints">
          <ul>
            <li><strong>Table mode:</strong> <kbd>Tab</kbd> moves between interactive elements (sort buttons, checkboxes, pagination)</li>
            <li><strong>Grid mode:</strong> <kbd>{'\u2190\u2191\u2192\u2193'}</kbd> arrow keys navigate cells</li>
            <li><kbd>Enter</kbd> / <kbd>F2</kbd> enters edit mode on editable cells</li>
            <li><kbd>Escape</kbd> cancels editing</li>
            <li><kbd>Space</kbd> toggles row selection (grid mode)</li>
            <li><kbd>Home</kbd> / <kbd>End</kbd> jump to first/last cell in row</li>
            <li><kbd>Ctrl+Home</kbd> / <kbd>Ctrl+End</kbd> jump to first/last cell in grid</li>
            <li><kbd>PageUp</kbd> / <kbd>PageDown</kbd> jump by page size</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// DatePicker Demo
// ============================================================================

function DatePickerDemo() {
  const [singleDate, setSingleDate] = useState<Date | null>(null);
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
  const [standaloneDate, setStandaloneDate] = useState<Date | null>(null);
  const [timeHours, setTimeHours] = useState(14);
  const [timeMinutes, setTimeMinutes] = useState(30);
  const [timePeriod, setTimePeriod] = useState<'AM' | 'PM'>('PM');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Single date picker */}
      <div>
        <h3 style={{ marginBottom: '0.75rem' }}>Single Date (Popover)</h3>
        <DatePicker
          label="Appointment date"
          hint="MM/DD/YYYY"
          value={singleDate}
          onValueChange={setSingleDate}
        >
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'end' }}>
            <DatePicker.Input placeholder="Select a date" />
            <DatePicker.Trigger />
          </div>
          <DatePicker.Calendar />
        </DatePicker>
        {singleDate && <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>Selected: {singleDate.toLocaleDateString()}</p>}
      </div>

      {/* Single datetime picker (modal) */}
      <div>
        <h3 style={{ marginBottom: '0.75rem' }}>DateTime (Modal, 24h)</h3>
        <DatePicker
          label="Meeting time"
          precision="datetime"
          hourCycle={24}
          overlay="modal"
        >
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'end' }}>
            <DatePicker.Input placeholder="Pick date & time" />
            <DatePicker.Trigger>Choose</DatePicker.Trigger>
          </div>
          <DatePicker.Calendar />
        </DatePicker>
      </div>

      {/* Range date picker */}
      <div>
        <h3 style={{ marginBottom: '0.75rem' }}>Date Range</h3>
        <DatePicker
          mode="range"
          label="Trip dates"
          startValue={rangeStart}
          endValue={rangeEnd}
          onRangeChange={(s, e) => { setRangeStart(s); setRangeEnd(e); }}
        >
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'end' }}>
            <DatePicker.RangeInputs />
            <DatePicker.Trigger />
          </div>
          <DatePicker.Calendar />
        </DatePicker>
        {rangeStart && rangeEnd && (
          <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
            Range: {rangeStart.toLocaleDateString()} – {rangeEnd.toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Standalone Calendar */}
      <div>
        <h3 style={{ marginBottom: '0.75rem' }}>Standalone Calendar</h3>
        <Calendar
          label="Select a date"
          value={standaloneDate}
          onValueChange={setStandaloneDate}
          style={{ maxWidth: 350 }}
        />
        {standaloneDate && <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>Selected: {standaloneDate.toLocaleDateString()}</p>}
      </div>

      {/* Standalone TimeField */}
      <div>
        <h3 style={{ marginBottom: '0.75rem' }}>Standalone TimeField</h3>
        <TimeField
          label="Alarm time"
          hours={timeHours}
          minutes={timeMinutes}
          period={timePeriod}
          onHoursChange={setTimeHours}
          onMinutesChange={setTimeMinutes}
          onPeriodChange={setTimePeriod}
          hourCycle={12}
        />
        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
          Time: {String(timeHours).padStart(2, '0')}:{String(timeMinutes).padStart(2, '0')} {timePeriod}
        </p>
      </div>

      {/* Keyboard hints */}
      <div>
        <h3 style={{ marginBottom: '0.75rem' }}>Keyboard navigation</h3>
        <div className="keyboard-hints">
          <ul>
            <li><kbd>Enter</kbd> / <kbd>Space</kbd> on trigger opens calendar</li>
            <li><kbd>{'\u2190\u2191\u2192\u2193'}</kbd> navigate days (left/right: day, up/down: week)</li>
            <li><kbd>Home</kbd> / <kbd>End</kbd> jump to start/end of week</li>
            <li><kbd>PageUp</kbd> / <kbd>PageDown</kbd> previous/next month</li>
            <li><kbd>Shift+PageUp</kbd> / <kbd>Shift+PageDown</kbd> previous/next year</li>
            <li><kbd>Enter</kbd> / <kbd>Space</kbd> selects focused day</li>
            <li><kbd>Escape</kbd> closes calendar, returns focus to trigger</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function TimePickerDemo() {
  const [time12, setTime12] = useState<TimePickerValue | undefined>(undefined);
  const [time24, setTime24] = useState<TimePickerValue>({ hours: 14, minutes: 30 });
  const [constrained, setConstrained] = useState<TimePickerValue | undefined>(undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* 12h mode */}
      <div>
        <h3>12-hour with 15min steps</h3>
        <TimePicker
          label="Meeting time"
          hourCycle={12}
          stepMinutes={15}
          value={time12}
          onChange={setTime12}
        />
        {time12 && (
          <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
            Selected: {time12.hours}:{String(time12.minutes).padStart(2, '0')} {time12.period}
          </p>
        )}
      </div>

      {/* 24h mode */}
      <div>
        <h3>24-hour with 30min steps</h3>
        <TimePicker
          label="Departure time"
          hourCycle={24}
          stepMinutes={30}
          value={time24}
          onChange={setTime24}
        />
        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
          Selected: {String(time24.hours).padStart(2, '0')}:{String(time24.minutes).padStart(2, '0')}
        </p>
      </div>

      {/* With constraints */}
      <div>
        <h3>Business hours only (09:00 - 17:00)</h3>
        <TimePicker
          label="Appointment time"
          hourCycle={24}
          stepMinutes={30}
          minTime={{ hours: 9, minutes: 0 }}
          maxTime={{ hours: 17, minutes: 0 }}
          value={constrained}
          onChange={setConstrained}
        />
      </div>

      {/* Disabled */}
      <div>
        <h3>Disabled</h3>
        <TimePicker
          label="Locked time"
          disabled
          defaultValue={{ hours: 10, minutes: 0 }}
        />
      </div>

      {/* Keyboard hints */}
      <div style={{ marginTop: '1rem', padding: '1rem', background: '#f0f0f0', borderRadius: 8, fontSize: '0.875rem' }}>
        <strong>Keyboard:</strong>
        <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem' }}>
          <li><kbd>ArrowDown</kbd> / <kbd>ArrowUp</kbd> navigates the time list</li>
          <li><kbd>Enter</kbd> selects highlighted time or commits typed value</li>
          <li><kbd>Escape</kbd> closes the popup</li>
          <li>Type freely: "2:30 PM", "14:30", "2pm", etc.</li>
        </ul>
      </div>
    </div>
  );
}

// ============================================================================
// TreeView Demo
// ============================================================================

const fileTreeNodes: TreeNodeData[] = [
  {
    id: 'src',
    label: 'src',
    children: [
      {
        id: 'components',
        label: 'components',
        children: [
          { id: 'button-tsx', label: 'Button.tsx' },
          { id: 'dialog-tsx', label: 'Dialog.tsx' },
          { id: 'tree-view-tsx', label: 'TreeView.tsx' },
        ],
      },
      {
        id: 'hooks',
        label: 'hooks',
        children: [
          { id: 'use-id-ts', label: 'use-id.ts' },
          { id: 'use-announcer-ts', label: 'use-announcer.ts' },
        ],
      },
      { id: 'index-ts', label: 'index.ts' },
      { id: 'app-tsx', label: 'App.tsx' },
    ],
  },
  {
    id: 'public',
    label: 'public',
    children: [
      { id: 'favicon-ico', label: 'favicon.ico' },
      { id: 'index-html', label: 'index.html' },
    ],
  },
  { id: 'package-json', label: 'package.json' },
  { id: 'tsconfig-json', label: 'tsconfig.json' },
  { id: 'readme-md', label: 'README.md' },
];

const navTreeNodes: TreeNodeData[] = [
  {
    id: 'getting-started',
    label: 'Getting Started',
    href: '#getting-started',
    children: [
      { id: 'installation', label: 'Installation', href: '#installation' },
      { id: 'quick-start', label: 'Quick Start', href: '#quick-start' },
    ],
  },
  {
    id: 'components',
    label: 'Components',
    href: '#components',
    children: [
      { id: 'button', label: 'Button', href: '#button' },
      { id: 'dialog', label: 'Dialog', href: '#dialog' },
      {
        id: 'forms',
        label: 'Forms',
        href: '#forms',
        children: [
          { id: 'input', label: 'Input', href: '#input' },
          { id: 'select', label: 'Select', href: '#select' },
          { id: 'checkbox', label: 'Checkbox', href: '#checkbox' },
        ],
      },
      { id: 'tree-view', label: 'TreeView', href: '#tree-view' },
    ],
  },
  {
    id: 'api',
    label: 'API Reference',
    href: '#api',
    disabled: true,
  },
];

const treeViewStyles = `
[data-compa11y-tree-view-toggle] {
  appearance: none;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  font: inherit;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.75rem;
  color: #64748b;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}
[data-compa11y-tree-view-toggle]:hover { background: #e2e8f0; color: #334155; }
[data-compa11y-tree-view-toggle]:disabled { opacity: 0.4; cursor: default; }
[data-compa11y-tree-view-spacer] { display: inline-block; width: 1.25rem; flex-shrink: 0; }
[data-compa11y-tree-view-row] {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.2rem 0.375rem;
  border-radius: 6px;
  cursor: default;
  font-size: 0.875rem;
  color: #334155;
}
[data-compa11y-tree-view-row]:hover { background: #f1f5f9; }
[data-compa11y-tree-view-node][data-focused] > [data-compa11y-tree-view-row],
[role="treeitem"][data-focused] {
  outline: 2px solid #3b82f6;
  outline-offset: -2px;
  border-radius: 6px;
}
[data-compa11y-tree-view-node][data-selected] > [data-compa11y-tree-view-row],
[role="treeitem"][data-selected] { background: #eff6ff; }
[data-compa11y-tree-view-node][data-disabled] > [data-compa11y-tree-view-row] { opacity: 0.4; }
[data-compa11y-tree-view-label] { text-decoration: none; color: inherit; }
a[data-compa11y-tree-view-label] { color: #2563eb; }
a[data-compa11y-tree-view-label]:hover { text-decoration: underline; }
[data-compa11y-tree-view-list] { list-style: none; padding-left: 0; margin: 0; }
[data-compa11y-tree-view-list] [data-compa11y-tree-view-list] { padding-left: 1.25rem; }
[role="treeitem"] {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.2rem 0.375rem;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #334155;
  cursor: default;
  outline: none;
}
[role="treeitem"]:hover { background: #f1f5f9; }
[role="group"] { padding-left: 1.25rem; }
`;

function TreeViewDemo() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const cardStyle: React.CSSProperties = {
    border: '1px solid #e2e8f0',
    borderRadius: 12,
    padding: '1rem',
    background: '#fff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    minWidth: 280,
    flex: '1 1 280px',
  };
  const titleStyle: React.CSSProperties = {
    fontSize: '0.95rem',
    fontWeight: 600,
    marginBottom: '0.75rem',
    color: '#1a202c',
  };

  return (
    <div>
      <style>{treeViewStyles}</style>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'flex-start' }}>
        {/* Widget mode — file explorer */}
        <div style={cardStyle}>
          <h3 style={titleStyle}>File Explorer (Single-Select)</h3>
          <TreeView
            nodes={fileTreeNodes}
            mode="widget"
            selectionMode="single"
            defaultExpandedIds={new Set(['src'])}
            aria-label="Project files"
            onActivate={(node) => setSelectedFile(node.label)}
          />
          {selectedFile && (
            <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#4a5568', borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem' }}>
              Activated: <strong>{selectedFile}</strong>
            </p>
          )}
        </div>

        {/* Widget mode — multi-select */}
        <div style={cardStyle}>
          <h3 style={titleStyle}>File Explorer (Multi-Select)</h3>
          <TreeView
            nodes={fileTreeNodes}
            mode="widget"
            selectionMode="multiple"
            defaultExpandedIds={new Set(['src', 'components'])}
            aria-label="Select files"
          />
        </div>

        {/* Navigation mode */}
        <div style={cardStyle}>
          <h3 style={titleStyle}>Documentation Nav</h3>
          <TreeView
            nodes={navTreeNodes}
            mode="navigation"
            defaultExpandedIds={new Set(['components'])}
            aria-label="Documentation navigation"
            onActivate={(node) => alert(`Navigate to: ${node.label}`)}
          />
        </div>
      </div>

      <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#718096' }}>
        <strong>Widget mode:</strong> <kbd>↑↓</kbd> navigate · <kbd>→</kbd> expand · <kbd>←</kbd> collapse · <kbd>Space</kbd> select · <kbd>Enter</kbd> activate · <kbd>*</kbd> expand siblings · type-ahead search.
        <strong> Navigation mode:</strong> semantic <code>&lt;nav&gt;</code> + nested lists, standard Tab/Enter.
      </p>
    </div>
  );
}

// ============================================================================
// CommandPalette Demo
// ============================================================================

function CommandPaletteDemo() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setOpen(true)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
        Open Command Palette
        <kbd style={{ fontSize: '0.75rem', padding: '2px 6px', background: '#e5e7eb', borderRadius: '4px' }}>⌘K</kbd>
      </button>

      <CommandPalette open={open} onOpenChange={setOpen} aria-label="Command palette">
        <CommandPalette.Input placeholder="Type a command..." aria-label="Search commands" />

        <CommandPalette.List>
          <CommandPalette.Empty>No results found.</CommandPalette.Empty>

          <CommandPalette.Group label="Navigation">
            <CommandPalette.Item value="Go to Dashboard" onSelect={() => alert('Navigate: Dashboard')} keywords={['home', 'main']} />
            <CommandPalette.Item value="Go to Projects" onSelect={() => alert('Navigate: Projects')} keywords={['work']} />
            <CommandPalette.Item value="Go to Settings" onSelect={() => alert('Navigate: Settings')} keywords={['preferences', 'config']} />
          </CommandPalette.Group>

          <CommandPalette.Separator />

          <CommandPalette.Group label="Actions">
            <CommandPalette.Item value="Create new project" onSelect={() => alert('Action: Create project')} shortcut="⌘N" />
            <CommandPalette.Item value="Invite team member" onSelect={() => alert('Action: Invite')} shortcut="⌘I" />
            <CommandPalette.Item value="Delete account" disabled />
          </CommandPalette.Group>

          <CommandPalette.Separator />

          <CommandPalette.Group label="Theme">
            <CommandPalette.Item value="Switch to light mode" onSelect={() => alert('Theme: Light')} keywords={['theme', 'appearance']} />
            <CommandPalette.Item value="Switch to dark mode" onSelect={() => alert('Theme: Dark')} keywords={['theme', 'appearance']} />
          </CommandPalette.Group>
        </CommandPalette.List>

        <CommandPalette.Footer>
          <span style={{ display: 'flex', gap: '16px' }}>
            <span><kbd>↑↓</kbd> navigate</span>
            <span><kbd>↵</kbd> select</span>
            <span><kbd>esc</kbd> close</span>
          </span>
        </CommandPalette.Footer>
      </CommandPalette>

      <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#6b7280' }}>
        Press <kbd style={{ padding: '2px 6px', background: '#e5e7eb', borderRadius: '4px', fontSize: '0.75rem' }}>⌘K</kbd> / <kbd style={{ padding: '2px 6px', background: '#e5e7eb', borderRadius: '4px', fontSize: '0.75rem' }}>Ctrl+K</kbd> anywhere to open.
        Arrow keys to navigate, Enter to select, Escape to close.
      </p>
    </div>
  );
}

// ── Carousel Demo ──────────────────────────────────────────────────────────

const slideColors = ['#dbeafe', '#ede9fe', '#fce7f3', '#d1fae5'];
const btnStyle = { padding: '6px 12px', border: '1px solid #ccc', borderRadius: 4, background: 'white', cursor: 'pointer', minWidth: 44, minHeight: 44 } as const;

function CarouselDemo() {
  return (
    <div style={{ padding: '1.5rem', background: 'white', borderRadius: '8px', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', maxWidth: 800 }}>
      <h2>Carousel</h2>

      <h3 style={{ marginTop: '1rem' }}>Single-slide (with transition)</h3>
      <Carousel ariaLabel="Featured products" loop>
        <Carousel.Status style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: 4 }} />
        <Carousel.Controls style={{ display: 'flex', gap: '4px', marginBottom: 8 }}>
          <Carousel.Prev style={btnStyle}>&larr; Prev</Carousel.Prev>
          <Carousel.Next style={btnStyle}>Next &rarr;</Carousel.Next>
        </Carousel.Controls>
        <Carousel.Content>
          {['Product A', 'Product B', 'Product C', 'Product D'].map((name, i) => (
            <Carousel.Item key={name} style={{ padding: '2.5rem 1.5rem', background: slideColors[i % slideColors.length], borderRadius: 8, textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 0.5rem' }}>{name}</h3>
              <p style={{ margin: 0, color: '#374151' }}>This is slide {i + 1}. The carousel slides smoothly between items.</p>
              <button style={{ ...btnStyle, marginTop: 12 }}>View {name}</button>
            </Carousel.Item>
          ))}
        </Carousel.Content>
        <Carousel.Pagination style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 8 }} />
      </Carousel>

      <h3 style={{ marginTop: '2rem' }}>Multi-slide (3 per view)</h3>
      <Carousel ariaLabel="Trending articles" slidesPerView={3} loop>
        <Carousel.Status style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: 4 }} />
        <Carousel.Controls style={{ display: 'flex', gap: '4px', marginBottom: 8 }}>
          <Carousel.Prev style={btnStyle}>&larr;</Carousel.Prev>
          <Carousel.Next style={btnStyle}>&rarr;</Carousel.Next>
        </Carousel.Controls>
        <Carousel.Content>
          {Array.from({ length: 9 }, (_, i) => (
            <Carousel.Item key={i} style={{ padding: '1.25rem 0.75rem', textAlign: 'center' }}>
              <div style={{ background: '#fef3c7', borderRadius: 8, padding: '1.5rem 0.75rem' }}>
                <strong style={{ fontSize: '1.1rem' }}>Article {i + 1}</strong>
                <p style={{ margin: '0.5rem 0 0', color: '#92400e', fontSize: '0.85rem' }}>Card content for article {i + 1}</p>
              </div>
            </Carousel.Item>
          ))}
        </Carousel.Content>
        <Carousel.Pagination style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 8 }} />
      </Carousel>

      <h3 style={{ marginTop: '2rem' }}>With autoplay</h3>
      <Carousel ariaLabel="Auto-rotating banners" loop autoplay autoplayInterval={4000}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Carousel.Status style={{ fontSize: '0.85rem', color: '#6b7280', flex: 1 }} live />
          <Carousel.Controls style={{ display: 'flex', gap: '4px' }}>
            <Carousel.Prev style={btnStyle}>&larr;</Carousel.Prev>
            <Carousel.Next style={btnStyle}>&rarr;</Carousel.Next>
            <Carousel.Pause style={{ ...btnStyle, fontWeight: 'bold' }} />
          </Carousel.Controls>
        </div>
        <Carousel.Content>
          {['Banner 1 — Spring Sale', 'Banner 2 — New Arrivals', 'Banner 3 — Free Shipping'].map((text, i) => (
            <Carousel.Item key={i} style={{ padding: '3rem 2rem', background: ['#dbeafe', '#dcfce7', '#fef9c3'][i], borderRadius: 8, textAlign: 'center' }}>
              <h3 style={{ margin: 0 }}>{text}</h3>
              <p style={{ margin: '0.5rem 0 0', color: '#4b5563' }}>Autoplay pauses on hover or focus. Respects reduced motion.</p>
            </Carousel.Item>
          ))}
        </Carousel.Content>
        <Carousel.Pagination style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 8 }} />
      </Carousel>

      <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#6b7280' }}>
        Slides transition with <code>transform</code>. Users with <code>prefers-reduced-motion</code> see instant snapping instead of animation.
      </p>
    </div>
  );
}

// ============================================================================
// RichTextEditor Demo
// ============================================================================

/**
 * Mock adapter for demo purposes.
 * In production, use @compa11y/rte-lexical or @compa11y/rte-tiptap.
 */
function createMockAdapter(): RTEAdapter {
  let content = '';
  let onChangeCb: (() => void) | null = null;
  let onSelectionChangeCb: (() => void) | null = null;
  let editorEl: HTMLDivElement | null = null;
  let isBold = false;
  let isItalic = false;
  let isUnderline = false;
  let currentBlock: 'paragraph' | 'heading1' | 'heading2' | 'heading3' | 'heading4' | 'heading5' | 'heading6' | 'blockquote' | 'bulletList' | 'numberList' | 'codeBlock' = 'paragraph';
  const undoStack: string[] = [];
  const redoStack: string[] = [];

  // Save/restore selection so commands work after dialog closes
  let savedRange: Range | null = null;
  function saveSelection() {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorEl?.contains(sel.anchorNode)) {
      savedRange = sel.getRangeAt(0).cloneRange();
    }
  }
  function restoreSelection() {
    if (savedRange && editorEl) {
      editorEl.focus();
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedRange);
      }
    }
  }

  return {
    mount(el, opts) {
      editorEl = document.createElement('div');
      editorEl.contentEditable = opts.disabled ? 'false' : opts.readOnly ? 'false' : 'true';
      editorEl.setAttribute('role', 'textbox');
      editorEl.setAttribute('aria-multiline', 'true');
      if (opts.ariaLabelledBy) editorEl.setAttribute('aria-labelledby', opts.ariaLabelledBy);
      if (opts.ariaDescribedBy) editorEl.setAttribute('aria-describedby', opts.ariaDescribedBy);
      editorEl.style.outline = 'none';
      editorEl.style.minHeight = '120px';

      if (opts.placeholder) {
        editorEl.setAttribute('data-placeholder', opts.placeholder);
        editorEl.style.position = 'relative';
      }

      if (content) editorEl.innerHTML = content;

      onChangeCb = opts.onChange;
      onSelectionChangeCb = opts.onSelectionChange;

      editorEl.addEventListener('input', () => {
        undoStack.push(content);
        redoStack.length = 0;
        content = editorEl!.innerHTML;
        onChangeCb?.();
        onSelectionChangeCb?.();
      });

      editorEl.addEventListener('focus', () => opts.onFocus?.());
      editorEl.addEventListener('blur', () => {
        saveSelection();
        opts.onBlur?.();
      });

      // Keyboard shortcuts
      editorEl.addEventListener('keydown', (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
          e.preventDefault();
          document.execCommand('bold');
          isBold = !isBold;
          onSelectionChangeCb?.();
        }
        if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
          e.preventDefault();
          document.execCommand('italic');
          isItalic = !isItalic;
          onSelectionChangeCb?.();
        }
        if ((e.metaKey || e.ctrlKey) && e.key === 'u') {
          e.preventDefault();
          document.execCommand('underline');
          isUnderline = !isUnderline;
          onSelectionChangeCb?.();
        }
        if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
          e.preventDefault();
          if (e.shiftKey) {
            // Redo
            if (redoStack.length > 0) {
              undoStack.push(content);
              content = redoStack.pop()!;
              editorEl!.innerHTML = content;
              onChangeCb?.();
              onSelectionChangeCb?.();
            }
          } else {
            // Undo
            if (undoStack.length > 0) {
              redoStack.push(content);
              content = undoStack.pop()!;
              editorEl!.innerHTML = content;
              onChangeCb?.();
              onSelectionChangeCb?.();
            }
          }
        }
      });

      el.appendChild(editorEl);

      return () => {
        editorEl?.remove();
        editorEl = null;
        onChangeCb = null;
        onSelectionChangeCb = null;
      };
    },

    getSelectionState: () => ({
      isCollapsed: true,
      marks: { bold: isBold, italic: isItalic, underline: isUnderline },
      block: currentBlock,
      canUndo: undoStack.length > 0,
      canRedo: redoStack.length > 0,
      link: null,
    }),

    getValue: () => content,
    setValue: (value) => {
      content = typeof value === 'string' ? value : JSON.stringify(value);
      if (editorEl) editorEl.innerHTML = content;
    },

    isEmpty: () => !content || content === '<br>' || content.replace(/<[^>]*>/g, '').trim() === '',
    getPlainText: () => content.replace(/<[^>]*>/g, ''),
    getCharacterCount: () => content.replace(/<[^>]*>/g, '').length,

    commands: {
      focus: () => editorEl?.focus(),
      undo: () => {
        if (undoStack.length > 0) {
          redoStack.push(content);
          content = undoStack.pop()!;
          if (editorEl) editorEl.innerHTML = content;
          onChangeCb?.();
          onSelectionChangeCb?.();
        }
      },
      redo: () => {
        if (redoStack.length > 0) {
          undoStack.push(content);
          content = redoStack.pop()!;
          if (editorEl) editorEl.innerHTML = content;
          onChangeCb?.();
          onSelectionChangeCb?.();
        }
      },
      toggleMark: (mark) => {
        if (mark === 'bold') { document.execCommand('bold'); isBold = !isBold; }
        if (mark === 'italic') { document.execCommand('italic'); isItalic = !isItalic; }
        if (mark === 'underline') { document.execCommand('underline'); isUnderline = !isUnderline; }
        if (mark === 'strikethrough') document.execCommand('strikeThrough');
        onSelectionChangeCb?.();
      },
      setBlock: (block) => {
        currentBlock = block;
        if (block === 'paragraph') document.execCommand('formatBlock', false, 'p');
        else if (block.startsWith('heading')) {
          const level = block.replace('heading', '');
          document.execCommand('formatBlock', false, `h${level}`);
        } else if (block === 'blockquote') document.execCommand('formatBlock', false, 'blockquote');
        onSelectionChangeCb?.();
      },
      toggleBulletList: () => { document.execCommand('insertUnorderedList'); onSelectionChangeCb?.(); },
      toggleNumberList: () => { document.execCommand('insertOrderedList'); onSelectionChangeCb?.(); },
      indent: () => { document.execCommand('indent'); },
      outdent: () => { document.execCommand('outdent'); },
      insertOrEditLink: (opts) => {
        if (!editorEl) return;
        restoreSelection();
        const sel = window.getSelection();

        // Check if selection is inside the editor
        const selIsInsideEditor = sel && sel.rangeCount > 0 && editorEl.contains(sel.anchorNode);

        if (sel && selIsInsideEditor && !sel.isCollapsed) {
          // Text is selected inside editor — wrap it with createLink
          document.execCommand('createLink', false, opts.href);
        } else {
          // No selection or collapsed — insert an <a> element
          const linkText = opts.text || opts.href;
          const a = document.createElement('a');
          a.href = opts.href;
          a.textContent = linkText;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';

          if (selIsInsideEditor && sel!.rangeCount > 0) {
            // Cursor is inside editor — insert at cursor
            const range = sel!.getRangeAt(0);
            range.deleteContents();
            range.insertNode(a);
            range.setStartAfter(a);
            range.collapse(true);
            sel!.removeAllRanges();
            sel!.addRange(range);
          } else {
            // No valid cursor position — append at end of editor
            editorEl.appendChild(a);
          }
        }
        content = editorEl.innerHTML;
        onChangeCb?.();
      },
      removeLink: () => {
        restoreSelection();
        document.execCommand('unlink');
        if (editorEl) content = editorEl.innerHTML;
        onChangeCb?.();
      },
      toggleCodeBlock: () => {
        document.execCommand('formatBlock', false, 'pre');
        currentBlock = currentBlock === 'codeBlock' ? 'paragraph' : 'codeBlock';
        onSelectionChangeCb?.();
      },
    },
  };
}

function RichTextEditorDemo() {
  const [value, setValue] = useState('');
  const [adapter] = useState(() => createMockAdapter());

  return (
    <div style={{ maxWidth: '700px' }}>
      <p style={{ marginBottom: '1rem', color: '#6b7280', fontSize: '0.9rem' }}>
        This demo uses a mock adapter based on <code>document.execCommand</code> for illustration.
        In production, use <code>@compa11y/rte-lexical</code> or <code>@compa11y/rte-tiptap</code> for
        full engine support.
      </p>

      <style>{`
        [data-compa11y-rte] {
          border: 1px solid #d1d5db;
          border-radius: 8px;
          overflow: hidden;
        }
        [data-compa11y-rte-toolbar] {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 2px;
          padding: 6px 8px;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
        }
        [data-compa11y-rte-button] {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 32px;
          height: 32px;
          padding: 0 8px;
          border: 1px solid transparent;
          border-radius: 4px;
          background: transparent;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 500;
          color: #374151;
        }
        [data-compa11y-rte-button]:hover {
          background: #e5e7eb;
        }
        [data-compa11y-rte-button][aria-pressed="true"] {
          background: #dbeafe;
          color: #1d4ed8;
          border-color: #93c5fd;
        }
        [data-compa11y-rte-button]:disabled {
          opacity: 0.4;
          cursor: default;
        }
        [data-compa11y-rte-heading-select] {
          height: 32px;
          padding: 0 8px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          background: white;
          font-size: 0.85rem;
          color: #374151;
        }
        [data-compa11y-rte-separator] {
          width: 1px;
          height: 24px;
          background: #e5e7eb;
          margin: 0 4px;
        }
        [data-compa11y-rte-content] {
          min-height: 180px;
          padding: 12px 16px;
          outline: none;
          font-size: 1rem;
          line-height: 1.6;
        }
        [data-compa11y-rte-content]:focus-within {
          box-shadow: inset 0 0 0 2px #3b82f6;
        }
        [data-compa11y-rte-footer] {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 12px;
          border-top: 1px solid #e5e7eb;
          background: #f9fafb;
          font-size: 0.8rem;
          color: #6b7280;
        }
        [data-compa11y-rte-character-count] {
          font-variant-numeric: tabular-nums;
        }
        /* Editor content formatting */
        [data-compa11y-rte-content] pre,
        .rte-preview pre {
          background: #1e293b;
          color: #e2e8f0;
          padding: 0.75rem 1rem;
          border-radius: 6px;
          font-family: 'SF Mono', 'Fira Code', 'Fira Mono', Menlo, Consolas, monospace;
          font-size: 0.875rem;
          overflow-x: auto;
          margin: 0.5rem 0;
        }
        [data-compa11y-rte-content] code,
        .rte-preview code {
          background: #f1f5f9;
          color: #e11d48;
          padding: 0.15em 0.4em;
          border-radius: 3px;
          font-family: 'SF Mono', 'Fira Code', 'Fira Mono', Menlo, Consolas, monospace;
          font-size: 0.875em;
        }
        [data-compa11y-rte-content] pre code,
        .rte-preview pre code {
          background: none;
          color: inherit;
          padding: 0;
          border-radius: 0;
          font-size: inherit;
        }
        [data-compa11y-rte-content] blockquote,
        .rte-preview blockquote {
          border-left: 3px solid #6366f1;
          margin: 0.5rem 0;
          padding: 0.5rem 1rem;
          color: #4b5563;
          background: #f9fafb;
        }
        [data-compa11y-rte-content] a,
        .rte-preview a {
          color: #2563eb;
          text-decoration: underline;
        }
        [data-compa11y-rte-content] ul,
        [data-compa11y-rte-content] ol,
        .rte-preview ul,
        .rte-preview ol {
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        /* Link dialog styling */
        [data-compa11y-rte-link-dialog-actions],
        [data-compa11y-rte-image-dialog-actions] {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }
        [data-compa11y-rte-link-dialog-actions] button,
        [data-compa11y-rte-image-dialog-actions] button {
          padding: 6px 16px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          font: inherit;
          font-size: 0.875rem;
        }
        [data-compa11y-rte-link-dialog-apply],
        [data-compa11y-rte-image-dialog-insert] {
          background: #2563eb !important;
          color: white !important;
          border-color: #2563eb !important;
        }
        [data-compa11y-rte-link-dialog-remove] {
          color: #dc2626 !important;
          border-color: #dc2626 !important;
          margin-right: auto !important;
        }
      `}</style>

      <RichTextEditor
        adapter={adapter}
        label="Message"
        description="Write your message below. Formatting toolbar above the editor."
        value={value}
        onChange={(v) => setValue(v as string)}
        format="html"
        features={{
          bold: true,
          italic: true,
          underline: true,
          headings: true,
          lists: true,
          link: true,
          code: true,
          blockquote: true,
        }}
      >
        <RichTextEditor.Toolbar>
          <RichTextEditor.Bold />
          <RichTextEditor.Italic />
          <RichTextEditor.Underline />
          <RichTextEditor.Separator />
          <RichTextEditor.HeadingSelect />
          <RichTextEditor.BulletedList />
          <RichTextEditor.NumberedList />
          <RichTextEditor.Separator />
          <RichTextEditor.Blockquote />
          <RichTextEditor.Code />
          <RichTextEditor.CodeBlock />
          <RichTextEditor.Separator />
          <RichTextEditor.Link />
          <RichTextEditor.Separator />
          <RichTextEditor.Undo />
          <RichTextEditor.Redo />
        </RichTextEditor.Toolbar>

        <RichTextEditor.Content placeholder="Start typing…" />

        <RichTextEditor.Footer>
          <RichTextEditor.CharacterCount max={500} />
          <RichTextEditor.HelpText>
            <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
              Ctrl+B bold · Ctrl+I italic · Ctrl+U underline · Ctrl+K link
            </span>
          </RichTextEditor.HelpText>
        </RichTextEditor.Footer>

        <RichTextEditor.LinkDialog />
      </RichTextEditor>

      {value && (
        <>
          <div style={{ marginTop: '1.5rem' }}>
            <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: '#374151' }}>Rendered Preview</h4>
            <div
              className="rte-preview"
              style={{
                padding: '1rem',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                background: '#fff',
                lineHeight: 1.6,
                fontSize: '1rem',
              }}
              dangerouslySetInnerHTML={{ __html: value }}
            />
          </div>

          <details style={{ marginTop: '1rem' }}>
            <summary style={{ cursor: 'pointer', color: '#6b7280', fontSize: '0.85rem' }}>
              Raw HTML output
            </summary>
            <pre style={{ marginTop: '0.5rem', padding: '0.75rem', background: '#f3f4f6', borderRadius: 6, fontSize: '0.8rem', overflow: 'auto', maxHeight: '200px' }}>
              {value}
            </pre>
          </details>
        </>
      )}
    </div>
  );
}
