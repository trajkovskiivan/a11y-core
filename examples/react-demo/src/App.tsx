import { useState } from 'react';
import {
  Dialog,
  ActionMenu,
  Tabs,
  ToastProvider,
  ToastViewport,
  useToastHelpers,
  Combobox,
} from '@a11ykit/react';

const countries = [
  { value: 'us', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'ca', label: 'Canada' },
  { value: 'au', label: 'Australia' },
  { value: 'de', label: 'Germany' },
  { value: 'fr', label: 'France' },
  { value: 'jp', label: 'Japan' },
];

export function App() {
  return (
    <ToastProvider>
      <div className="app">
        <h1>A11yKit React Demo</h1>
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
          <h2>Combobox</h2>
          <ComboboxDemo />
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
          <button tabIndex={0} onClick={() => setOpen(false)}>
            Cancel
          </button>
          <button
            tabIndex={0}
            className="button-danger"
            onClick={() => {
              console.log('Deleted!');
              setOpen(false);
            }}
          >
            Delete
          </button>
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
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          tabIndex={0}
          onClick={() => success('Success!', 'Your changes have been saved.')}
        >
          Success Toast
        </button>
        <button
          tabIndex={0}
          onClick={() => error('Error!', 'Something went wrong.')}
        >
          Error Toast
        </button>
        <button
          tabIndex={0}
          onClick={() => info('Info', 'Here is some information.')}
        >
          Info Toast
        </button>
        <button
          tabIndex={0}
          onClick={() => warning('Warning', 'Please review your input.')}
        >
          Warning Toast
        </button>
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
