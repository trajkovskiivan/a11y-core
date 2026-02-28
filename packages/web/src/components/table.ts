/**
 * compa11y Table Web Component
 *
 * Data-driven, accessible data table rendered as native semantic HTML
 * in the light DOM so screen readers correctly associate headers with cells.
 *
 * Usage:
 * <compa11y-table caption="Users" selectable></compa11y-table>
 *
 * <script>
 *   const table = document.querySelector('compa11y-table');
 *   table.columns = [
 *     { key: 'name', label: 'Name', sortable: true },
 *     { key: 'role', label: 'Role', sortable: true, align: 'center' },
 *   ];
 *   table.rows = [
 *     { id: '1', name: 'Alice', role: 'Admin' },
 *     { id: '2', name: 'Bob',   role: 'User' },
 *   ];
 *
 *   table.addEventListener('compa11y-table-sort', (e) => {
 *     console.log(e.detail); // { sortKey, sortDirection }
 *   });
 *   table.addEventListener('compa11y-table-select', (e) => {
 *     console.log(e.detail); // { selectedRows: string[] }
 *   });
 * </script>
 */

import { announce, createComponentWarnings } from '@compa11y/core';
import { Compa11yElement, defineElement } from '../utils/base-element';
import { BASE_STYLES, TABLE_GLOBAL_STYLES } from '../utils/styles';

const warn = createComponentWarnings('Compa11yTable');

export type SortDirection = 'ascending' | 'descending' | 'none';

export interface ColumnDef {
  /** Unique column key — matched against row object keys */
  key: string;
  /** Visible header label */
  label: string;
  /** Allow sorting on this column */
  sortable?: boolean;
  /** Text alignment for cells in this column */
  align?: 'left' | 'center' | 'right';
  /** Render the cell as a <th scope="row"> instead of <td> */
  rowHeader?: boolean;
}

export type RowData = Record<string, unknown> & { id?: string };

let _globalStylesInjected = false;

function ensureGlobalStyles(): void {
  if (_globalStylesInjected || typeof document === 'undefined') return;
  _globalStylesInjected = true;
  const style = document.createElement('style');
  style.setAttribute('data-compa11y-table', '');
  style.textContent = TABLE_GLOBAL_STYLES;
  document.head.appendChild(style);
}

export class Compa11yTable extends Compa11yElement {
  private _columns: ColumnDef[] = [];
  private _rows: RowData[] = [];
  private _sortKey: string | null = null;
  private _sortDirection: SortDirection = 'none';
  private _selectedRows: Set<string> = new Set();
  private _tableEl: HTMLTableElement | null = null;

  static get observedAttributes() {
    return ['caption', 'sort-key', 'sort-direction', 'selectable', 'loading', 'empty-message'];
  }

  // ── Attribute-backed getters ──────────────────────────────────────────────

  get caption(): string {
    return this.getAttribute('caption') || '';
  }
  set caption(v: string) {
    this.setAttribute('caption', v);
  }

  get selectable(): boolean {
    return this.hasAttribute('selectable');
  }

  get loading(): boolean {
    return this.hasAttribute('loading');
  }

  get emptyMessage(): string {
    return this.getAttribute('empty-message') || 'No results found';
  }

  // ── Property-backed sort state ────────────────────────────────────────────

  get sortKey(): string | null {
    return this._sortKey;
  }
  set sortKey(v: string | null) {
    this._sortKey = v;
    this.rerenderTable();
  }

  get sortDirection(): SortDirection {
    return this._sortDirection;
  }
  set sortDirection(v: SortDirection) {
    this._sortDirection = v;
    this.rerenderTable();
  }

  // ── Data properties ───────────────────────────────────────────────────────

  get columns(): ColumnDef[] {
    return this._columns;
  }
  set columns(v: ColumnDef[]) {
    this._columns = v;
    this.rerenderTable();
  }

  get rows(): RowData[] {
    return this._rows;
  }
  set rows(v: RowData[]) {
    this._rows = v;
    this.rerenderTable();
  }

  get selectedRows(): string[] {
    return Array.from(this._selectedRows);
  }
  set selectedRows(v: string[]) {
    this._selectedRows = new Set(v);
    this.syncSelectionState();
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  /**
   * Re-apply JS properties that were set before the element was upgraded.
   *
   * When a custom element is used before its class is registered (e.g. inline
   * script sets `el.columns = [...]` before the module loads), the value lands
   * as a plain "own" property on the HTMLElement, shadowing the class
   * getter/setter. This method detects that, removes the own property, and
   * re-routes the value through the real setter so private fields are updated.
   */
  private upgradeProperty(prop: string): void {
    if (Object.prototype.hasOwnProperty.call(this, prop)) {
      const val = (this as Record<string, unknown>)[prop];
      delete (this as Record<string, unknown>)[prop];
      (this as Record<string, unknown>)[prop] = val;
    }
  }

  protected setupAccessibility(): void {
    ensureGlobalStyles();

    // Promote any own properties set before element upgrade so setters fire.
    this.upgradeProperty('columns');
    this.upgradeProperty('rows');
    this.upgradeProperty('selectedRows');
    this.upgradeProperty('sortKey');
    this.upgradeProperty('sortDirection');

    // Read sort state from attributes if provided at construction time
    const attrKey = this.getAttribute('sort-key');
    if (attrKey) this._sortKey = attrKey;
    const attrDir = this.getAttribute('sort-direction') as SortDirection | null;
    if (attrDir) this._sortDirection = attrDir;

    // Dev warning: caption is required for accessible name
    if (
      !this.caption &&
      !this.getAttribute('aria-label') &&
      !this.getAttribute('aria-labelledby')
    ) {
      warn.warning(
        'compa11y-table must have an accessible name. Provide a caption attribute, aria-label, or aria-labelledby.'
      );
    }
  }

  protected render(): void {
    // Minimal shadow DOM — just display:block host style + slot so that the
    // light-DOM <table> we create below is rendered and styled by global CSS.
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }
    this.shadowRoot!.innerHTML = `
      <style>
        ${BASE_STYLES}
        :host { display: block; overflow-x: auto; }
      </style>
      <slot></slot>
    `;

    // Create the light-DOM <table> on first render
    if (!this._tableEl) {
      this._tableEl = document.createElement('table');
      this.appendChild(this._tableEl);
    }
    this.renderTable();
  }

  protected setupEventListeners(): void {
    // Sort button clicks + select-all / row-select checkbox changes
    // are handled via event delegation on the host element.
    this.addEventListener('click', this.handleClick);
    this.addEventListener('change', this.handleChange);
  }

  protected cleanupEventListeners(): void {
    this.removeEventListener('click', this.handleClick);
    this.removeEventListener('change', this.handleChange);
  }

  protected onAttributeChange(
    name: string,
    _oldValue: string | null,
    _newValue: string | null
  ): void {
    switch (name) {
      case 'caption':
      case 'empty-message':
        this.rerenderTable();
        break;
      case 'sort-key':
        this._sortKey = _newValue;
        this.rerenderTable();
        break;
      case 'sort-direction':
        this._sortDirection = (_newValue as SortDirection) || 'none';
        this.rerenderTable();
        break;
      case 'selectable':
      case 'loading':
        this.rerenderTable();
        break;
    }
  }

  // ── Public API ────────────────────────────────────────────────────────────

  /** Sort the table by a column key, cycling direction automatically */
  sort(key: string, direction?: SortDirection): void {
    if (direction) {
      this._sortKey = direction === 'none' ? null : key;
      this._sortDirection = direction;
    } else {
      if (this._sortKey !== key) {
        this._sortKey = key;
        this._sortDirection = 'ascending';
      } else if (this._sortDirection === 'ascending') {
        this._sortDirection = 'descending';
      } else if (this._sortDirection === 'descending') {
        this._sortKey = null;
        this._sortDirection = 'none';
      } else {
        this._sortKey = key;
        this._sortDirection = 'ascending';
      }
    }
    this.rerenderTable();
  }

  selectRow(id: string): void {
    this._selectedRows.add(id);
    this.syncSelectionState();
    this.emitSelectEvent();
  }

  deselectRow(id: string): void {
    this._selectedRows.delete(id);
    this.syncSelectionState();
    this.emitSelectEvent();
  }

  selectAll(): void {
    for (const row of this._rows) {
      const id = String(row.id ?? '');
      if (id) this._selectedRows.add(id);
    }
    this.syncSelectionState();
    this.emitSelectEvent();
  }

  deselectAll(): void {
    this._selectedRows.clear();
    this.syncSelectionState();
    this.emitSelectEvent();
  }

  // ── Rendering ─────────────────────────────────────────────────────────────

  /**
   * Preserve focus on a sort button across full re-renders.
   * We save the sort-key of the focused sort button, re-render, then
   * move focus back to the newly rendered sort button.
   */
  private rerenderTable(): void {
    if (!this._tableEl) return;

    const active = document.activeElement as HTMLElement | null;
    const focusedSortKey =
      active?.dataset.sortKey ?? null;
    const isFocusInTable = this._tableEl.contains(active);

    this.renderTable();

    if (isFocusInTable && focusedSortKey) {
      requestAnimationFrame(() => {
        const btn = this._tableEl?.querySelector<HTMLElement>(
          `[data-sort-key="${focusedSortKey}"]`
        );
        btn?.focus();
      });
    }
  }

  private renderTable(): void {
    if (!this._tableEl) return;
    const t = this._tableEl;

    // Update aria-busy on the host for loading state
    if (this.loading) {
      this.setAttribute('aria-busy', 'true');
    } else {
      this.removeAttribute('aria-busy');
    }

    // ── Caption ──
    let captionEl = t.querySelector('caption');
    if (this.caption) {
      if (!captionEl) {
        captionEl = document.createElement('caption');
        t.prepend(captionEl);
      }
      captionEl.textContent = this.caption;
    } else if (captionEl) {
      captionEl.remove();
    }

    // ── thead ──
    let thead = t.querySelector('thead');
    if (!thead) {
      thead = document.createElement('thead');
      t.appendChild(thead);
    }
    this.renderThead(thead);

    // ── tbody ──
    let tbody = t.querySelector('tbody');
    if (!tbody) {
      tbody = document.createElement('tbody');
      t.appendChild(tbody);
    }
    this.renderTbody(tbody);
  }

  private renderThead(thead: HTMLTableSectionElement): void {
    thead.innerHTML = '';
    const tr = document.createElement('tr');

    // Select-all column
    if (this.selectable) {
      const th = document.createElement('th');
      th.scope = 'col';
      th.style.width = '2.5rem';

      const allIds = this._rows
        .map((r) => String(r.id ?? ''))
        .filter(Boolean);
      const selectedCount = allIds.filter((id) =>
        this._selectedRows.has(id)
      ).length;
      const allSelected = allIds.length > 0 && selectedCount === allIds.length;
      const someSelected =
        selectedCount > 0 && selectedCount < allIds.length;

      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.dataset.selectAll = '';
      cb.setAttribute('data-select-cb', '');
      cb.setAttribute('aria-label', 'Select all rows');
      cb.checked = allSelected;
      cb.indeterminate = someSelected;

      th.appendChild(cb);
      tr.appendChild(th);
    }

    // Column headers
    for (const col of this._columns) {
      const th = document.createElement('th');
      th.scope = 'col';
      if (col.align) th.style.textAlign = col.align;

      if (col.sortable) {
        const isSorted = this._sortKey === col.key;
        const dir: SortDirection = isSorted ? this._sortDirection : 'none';

        th.setAttribute('aria-sort', dir);

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.setAttribute('data-sort-btn', '');
        btn.setAttribute('data-sort-key', col.key);

        const labelSpan = document.createElement('span');
        labelSpan.textContent = col.label;

        const iconSpan = document.createElement('span');
        iconSpan.setAttribute('aria-hidden', 'true');
        iconSpan.setAttribute('data-sort-icon', '');
        iconSpan.textContent =
          isSorted && dir === 'ascending'
            ? '↑'
            : isSorted && dir === 'descending'
            ? '↓'
            : '↕';

        btn.appendChild(labelSpan);
        btn.appendChild(iconSpan);
        th.appendChild(btn);
      } else {
        th.textContent = col.label;
      }

      tr.appendChild(th);
    }

    thead.appendChild(tr);
  }

  private renderTbody(tbody: HTMLTableSectionElement): void {
    tbody.innerHTML = '';

    // Loading state
    if (this.loading) {
      const tr = document.createElement('tr');
      tr.setAttribute('aria-busy', 'true');
      const td = document.createElement('td');
      td.setAttribute('data-loading-cell', '');
      td.colSpan = this._columns.length + (this.selectable ? 1 : 0);
      td.textContent = 'Loading…';
      tr.appendChild(td);
      tbody.appendChild(tr);
      return;
    }

    // Empty state
    if (this._rows.length === 0) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.setAttribute('data-empty-cell', '');
      td.colSpan = this._columns.length + (this.selectable ? 1 : 0);
      td.textContent = this.emptyMessage;
      tr.appendChild(td);
      tbody.appendChild(tr);
      return;
    }

    // Dev warning: selectable rows need an 'id' field
    if (this.selectable) {
      const missingId = this._rows.some((r) => !r.id);
      if (missingId) {
        warn.warning(
          'compa11y-table: When selectable is enabled, each row object must have an "id" field.'
        );
      }
    }

    for (const row of this._rows) {
      const rowId = String(row.id ?? '');
      const isSelected = rowId ? this._selectedRows.has(rowId) : false;

      const tr = document.createElement('tr');
      if (rowId && this.selectable) {
        tr.setAttribute('aria-selected', String(isSelected));
      }

      // Select checkbox cell
      if (this.selectable) {
        const td = document.createElement('td');
        td.style.width = '2.5rem';

        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.dataset.rowId = rowId;
        cb.dataset.selectRow = '';
        cb.setAttribute('data-select-cb', '');
        cb.checked = isSelected;

        // Accessible label: use the first non-id column value or rowId
        const firstCol = this._columns[0];
        const nameValue = firstCol
          ? String(row[firstCol.key] ?? rowId)
          : rowId;
        cb.setAttribute('aria-label', `Select ${nameValue}`);

        td.appendChild(cb);
        tr.appendChild(td);
      }

      // Data cells
      for (const col of this._columns) {
        const value = row[col.key];
        const displayValue =
          value === null || value === undefined ? '' : String(value);

        if (col.rowHeader) {
          const th = document.createElement('th');
          th.scope = 'row';
          if (col.align) th.style.textAlign = col.align;
          th.textContent = displayValue;
          tr.appendChild(th);
        } else {
          const td = document.createElement('td');
          if (col.align) td.style.textAlign = col.align;
          td.textContent = displayValue;
          tr.appendChild(td);
        }
      }

      tbody.appendChild(tr);
    }
  }

  /** Re-sync selection state without full re-render (preserves focus) */
  private syncSelectionState(): void {
    if (!this._tableEl) return;

    // Sync row aria-selected + row checkbox states
    const rows = this._tableEl.querySelectorAll<HTMLTableRowElement>('tbody tr');
    for (const tr of Array.from(rows)) {
      const cb = tr.querySelector<HTMLInputElement>('[data-select-row]');
      if (!cb) continue;
      const rowId = cb.dataset.rowId ?? '';
      const isSelected = this._selectedRows.has(rowId);
      tr.setAttribute('aria-selected', String(isSelected));
      cb.checked = isSelected;
    }

    // Sync select-all checkbox
    const selectAll =
      this._tableEl.querySelector<HTMLInputElement>('[data-select-all]');
    if (selectAll) {
      const allIds = this._rows
        .map((r) => String(r.id ?? ''))
        .filter(Boolean);
      const selectedCount = allIds.filter((id) =>
        this._selectedRows.has(id)
      ).length;
      selectAll.checked =
        allIds.length > 0 && selectedCount === allIds.length;
      selectAll.indeterminate =
        selectedCount > 0 && selectedCount < allIds.length;
    }
  }

  // ── Event handlers ────────────────────────────────────────────────────────

  private handleClick = (event: Event): void => {
    const target = event.target as HTMLElement;
    const sortBtn = target.closest<HTMLElement>('[data-sort-btn]');
    if (sortBtn) {
      const key = sortBtn.dataset.sortKey;
      if (key) {
        this.sort(key);

        const col = this._columns.find((c) => c.key === key);
        const label = col?.label ?? key;
        const dirLabel =
          this._sortDirection === 'none'
            ? 'sort cleared'
            : `sorted ${this._sortDirection}`;
        announce(`${label} ${dirLabel}`);

        this.emit('compa11y-table-sort', {
          sortKey: this._sortKey,
          sortDirection: this._sortDirection,
        });
      }
    }
  };

  private handleChange = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    if (!target || target.type !== 'checkbox') return;

    // Select-all checkbox
    if ('selectAll' in target.dataset) {
      if (target.checked) {
        this.selectAll();
      } else {
        this.deselectAll();
      }
      const count = this._selectedRows.size;
      announce(
        count === 0
          ? 'Selection cleared'
          : `All ${count} rows selected`
      );
      return;
    }

    // Individual row checkbox
    if ('selectRow' in target.dataset) {
      const rowId = target.dataset.rowId ?? '';
      if (!rowId) return;

      if (target.checked) {
        this._selectedRows.add(rowId);
      } else {
        this._selectedRows.delete(rowId);
      }
      this.syncSelectionState();
      this.emitSelectEvent();

      const count = this._selectedRows.size;
      announce(
        count === 0
          ? 'Selection cleared'
          : `${count} row${count === 1 ? '' : 's'} selected`
      );
    }
  };

  private emitSelectEvent(): void {
    this.emit('compa11y-table-select', {
      selectedRows: Array.from(this._selectedRows),
    });
  }
}

defineElement('compa11y-table', Compa11yTable);

export default Compa11yTable;
