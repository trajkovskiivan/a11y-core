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

`<a11y-dialog>`, `<a11y-menu>`, `<a11y-tabs>`, `<a11y-toast>`, `<a11y-combobox>`, `<a11y-select>`, `<a11y-listbox>`, `<a11y-checkbox>`, `<a11y-radio-group>`, `<a11y-switch>`, `<a11y-input>`, `<a11y-textarea>`, `<a11y-button>`

## Quick start

```html
<!-- Fully accessible dialog — focus trap, Escape to close, screen reader announcements -->
<button id="open-btn">Open Dialog</button>

<a11y-dialog trigger="#open-btn">
  <h2 slot="title">Confirm</h2>
  <p>Are you sure?</p>
  <div slot="actions">
    <button>Cancel</button>
    <button>Confirm</button>
  </div>
</a11y-dialog>
```

## Documentation

Full documentation, live examples, attributes/events reference, and accessibility details at **[compa11y.org](https://compa11y.org)**.

## License

MIT
