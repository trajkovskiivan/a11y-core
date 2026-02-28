# @compa11y/web

Accessible Web Components for any HTML page. No framework required. Every component handles ARIA attributes, keyboard navigation, focus management, and screen reader announcements under the hood.

## Installation

```bash
npm install @compa11y/web
```

Or via CDN:

```html
<script src="https://unpkg.com/@compa11y/web"></script>
```

## Components

`<compa11y-dialog>`, `<compa11y-menu>`, `<compa11y-tabs>`, `<compa11y-toast>`, `<compa11y-combobox>`, `<compa11y-select>`, `<compa11y-listbox>`, `<compa11y-checkbox>`, `<compa11y-radio-group>`, `<compa11y-switch>`, `<compa11y-input>`, `<compa11y-textarea>`, `<compa11y-button>`

## Quick start

```html
<!-- Fully accessible dialog — focus trap, Escape to close, screen reader announcements -->
<button id="open-btn">Open Dialog</button>

<compa11y-dialog trigger="#open-btn">
  <h2 slot="title">Confirm</h2>
  <p>Are you sure?</p>
  <div slot="actions">
    <button>Cancel</button>
    <button>Confirm</button>
  </div>
</compa11y-dialog>
```

## Documentation

Full documentation, live examples, attributes/events reference, and accessibility details at **[compa11y.org](https://compa11y.org)**.

## License

MIT
