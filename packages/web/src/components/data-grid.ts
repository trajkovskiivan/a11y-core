/**
 * compa11y DataGrid Web Component
 *
 * Data-driven, accessible data grid rendered as native semantic HTML
 * in the light DOM. Supports both table mode (default) and ARIA grid mode.
 *
 * Usage:
 * <compa11y-data-grid caption="Invoices" selectable></compa11y-data-grid>
 *
 * <script>
 *   const grid = document.querySelector('compa11y-data-grid');
 *   grid.columns = [
 *     { key: 'name', label: 'Name', sortable: true },
 *     { key: 'amount', label: 'Amount', sortable: true, align: 'right' },
 *   ];
 *   grid.rows = [
 *     { id: '1', name: 'Invoice #001', amount: '$500' },
 *     { id: '2', name: 'Invoice #002', amount: '$1,200' },
 *   ];
 *
 *   grid.addEventListener('compa11y-datagrid-sort', (e) => {
 *     console.log(e.detail); // { sortKey, sortDirection }
 *   });
 *   grid.addEventListener('compa11y-datagrid-select', (e) => {
 *     console.log(e.detail); // { selectedRows: string[] }
 *   });
 *   grid.addEventListener('compa11y-datagrid-page', (e) => {
 *     console.log(e.detail); // { page }
 *   });
 * </script>
 */

import { announce, createComponentWarnings } from '@compa11y/core';
import { Compa11yElement, defineElement } from '../utils/base-element';
import { BASE_STYLES, DATA_GRID_STYLES } from '../utils/styles';

const warn = createComponentWarnings('Compa11yDataGrid');

export type SortDirection = 'ascending' | 'descending' | 'none';

export interface ColumnDef {
  key: string;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  rowHeader?: boolean;
  editable?: boolean;
  width?: string;
}

export type RowData = Record<string, unknown> & { id?: string };

let _globalStylesInjected = false;

function ensureGlobalStyles(): void {
  if (_globalStylesInjected || typeof document === 'undefined') return;
  _globalStylesInjected = true;
  const style = document.createElement('style');
  style.setAttribute('data-compa11y-data-grid', '');
  style.textContent = DATA_GRID_STYLES;
  document.head.appendChild(style);
}

export class Compa11yDataGrid extends Compa11yElement {
  private _columns: ColumnDef[] = [];
  private _rows: RowData[] = [];
  private _sortKey: string | null = null;
  private _sortDirection: SortDirection = 'none';
  private _selectedRows: Set<string> = new Set();
  private _tableEl: HTMLTableElement | null = null;
  private _wrapperEl: HTMLDivElement | null = null;
  private _paginationEl: HTMLElement | null = null;
  private _statusEl: HTMLDivElement | null = null;
  private _page = 1;
  private _pageSize = 10;
  private _totalRows: number | null = null;
  private _focusedCell: { row: number; col: number } | null = null;
  private _editingCell: { row: number; col: number } | null = null;

  static get observedAttributes() {
    return [
      'caption',
      'sort-key',
      'sort-direction',
      'selectable',
      'loading',
      'empty-message',
      'error',
      'mode',
      'page',
      'page-size',
      'total-rows',
      'page-size-options',
      'sticky-header',
      'striped',
      'bordered',
      'compact',
    ];
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

  get errorMessage(): string {
    return this.getAttribute('error') || '';
  }

  get mode(): 'table' | 'grid' {
    return (this.getAttribute('mode') as 'table' | 'grid') || 'table';
  }
  set mode(v: 'table' | 'grid') {
    this.setAttribute('mode', v);
  }

  get stickyHeader(): boolean {
    return this.hasAttribute('sticky-header');
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

  // ── Pagination ────────────────────────────────────────────────────────────

  get page(): number {
    return this._page;
  }
  set page(v: number) {
    this._page = v;
    this.rerenderTable();
    this.renderPagination();
  }

  get pageSize(): number {
    return this._pageSize;
  }
  set pageSize(v: number) {
    this._pageSize = v;
    this.rerenderTable();
    this.renderPagination();
  }

  get totalRows(): number {
    return this._totalRows ?? this._rows.length;
  }
  set totalRows(v: number) {
    this._totalRows = v;
    this.renderPagination();
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalRows / this._pageSize));
  }

  private get _pageSizeOptions(): number[] {
    const attr = this.getAttribute('page-size-options');
    if (attr) {
      return attr.split(',').map(Number).filter((n) => !isNaN(n) && n > 0);
    }
    return [10, 25, 50, 100];
  }

  private get _hasPagination(): boolean {
    return this.hasAttribute('page');
  }

  private get _displayRows(): RowData[] {
    if (!this._hasPagination || this._totalRows !== null) return this._rows;
    const start = (this._page - 1) * this._pageSize;
    return this._rows.slice(start, start + this._pageSize);
  }

  private get _totalColumns(): number {
    return this._columns.length + (this.selectable ? 1 : 0);
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  private upgradeProperty(prop: string): void {
    if (Object.prototype.hasOwnProperty.call(this, prop)) {
      const val = (this as Record<string, unknown>)[prop];
      delete (this as Record<string, unknown>)[prop];
      (this as Record<string, unknown>)[prop] = val;
    }
  }

  protected setupAccessibility(): void {
    ensureGlobalStyles();

    this.upgradeProperty('columns');
    this.upgradeProperty('rows');
    this.upgradeProperty('selectedRows');
    this.upgradeProperty('sortKey');
    this.upgradeProperty('sortDirection');
    this.upgradeProperty('page');
    this.upgradeProperty('pageSize');
    this.upgradeProperty('totalRows');

    const attrKey = this.getAttribute('sort-key');
    if (attrKey) this._sortKey = attrKey;
    const attrDir = this.getAttribute('sort-direction') as SortDirection | null;
    if (attrDir) this._sortDirection = attrDir;

    const attrPage = this.getAttribute('page');
    if (attrPage) this._page = Math.max(1, Number(attrPage));
    const attrPageSize = this.getAttribute('page-size');
    if (attrPageSize) this._pageSize = Math.max(1, Number(attrPageSize));
    const attrTotalRows = this.getAttribute('total-rows');
    if (attrTotalRows) this._totalRows = Number(attrTotalRows);

    if (
      !this.caption &&
      !this.getAttribute('aria-label') &&
      !this.getAttribute('aria-labelledby')
    ) {
      warn.warning(
        'compa11y-data-grid must have an accessible name. Provide a caption attribute, aria-label, or aria-labelledby.'
      );
    }
  }

  protected render(): void {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }
    this.shadowRoot!.innerHTML = `
      <style>
        ${BASE_STYLES}
        :host { display: block; }
      </style>
      <slot name="toolbar"></slot>
      <slot></slot>
      <slot name="pagination"></slot>
    `;

    // Create light DOM elements
    if (!this._wrapperEl) {
      this._wrapperEl = document.createElement('div');
      this._wrapperEl.setAttribute('data-datagrid-wrapper', '');
      this._wrapperEl.style.overflowX = 'auto';

      this._tableEl = document.createElement('table');
      this._wrapperEl.appendChild(this._tableEl);
      this.appendChild(this._wrapperEl);
    }

    // Status live region
    if (!this._statusEl) {
      this._statusEl = document.createElement('div');
      this._statusEl.setAttribute('role', 'status');
      this._statusEl.setAttribute('aria-live', 'polite');
      this._statusEl.setAttribute('aria-atomic', 'true');
      this._statusEl.style.cssText =
        'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0';
      this.appendChild(this._statusEl);
    }

    // Setup grid mode ARIA
    if (this.mode === 'grid') {
      this._wrapperEl.setAttribute('role', 'grid');
      this._wrapperEl.setAttribute('aria-label', this.caption);
      this._wrapperEl.setAttribute('aria-rowcount', String(this.totalRows));
      this._wrapperEl.setAttribute('aria-colcount', String(this._totalColumns));
      this._tableEl!.setAttribute('role', 'none');
    }

    this.renderTable();

    if (this._hasPagination) {
      this.renderPagination();
    }
  }

  protected setupEventListeners(): void {
    this.addEventListener('click', this.handleClick);
    this.addEventListener('change', this.handleChange);
    this.addEventListener('keydown', this.handleKeyDown);
  }

  protected cleanupEventListeners(): void {
    this.removeEventListener('click', this.handleClick);
    this.removeEventListener('change', this.handleChange);
    this.removeEventListener('keydown', this.handleKeyDown);
  }

  protected onAttributeChange(
    name: string,
    _oldValue: string | null,
    _newValue: string | null
  ): void {
    switch (name) {
      case 'caption':
      case 'empty-message':
      case 'error':
      case 'selectable':
      case 'loading':
      case 'mode':
      case 'sticky-header':
      case 'striped':
      case 'bordered':
      case 'compact':
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
      case 'page':
        this._page = Math.max(1, Number(_newValue) || 1);
        this.rerenderTable();
        this.renderPagination();
        break;
      case 'page-size':
        this._pageSize = Math.max(1, Number(_newValue) || 10);
        this.rerenderTable();
        this.renderPagination();
        break;
      case 'total-rows':
        this._totalRows = _newValue !== null ? Number(_newValue) : null;
        this.renderPagination();
        break;
      case 'page-size-options':
        this.renderPagination();
        break;
    }
  }

  // ── Public API ────────────────────────────────────────────────────────────

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
    for (const row of this._displayRows) {
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

  private rerenderTable(): void {
    if (!this._tableEl) return;

    const active = document.activeElement as HTMLElement | null;
    const focusedSortKey = active?.dataset.sortKey ?? null;
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

    if (this.loading) {
      this.setAttribute('aria-busy', 'true');
    } else {
      this.removeAttribute('aria-busy');
    }

    // Caption
    let captionEl = t.querySelector('caption');
    if (this.caption && this.mode !== 'grid') {
      if (!captionEl) {
        captionEl = document.createElement('caption');
        t.prepend(captionEl);
      }
      captionEl.textContent = this.caption;
    } else if (captionEl) {
      captionEl.remove();
    }

    // thead
    let thead = t.querySelector('thead');
    if (!thead) {
      thead = document.createElement('thead');
      t.appendChild(thead);
    }
    this.renderThead(thead);

    // tbody
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
    const isGrid = this.mode === 'grid';

    if (isGrid) tr.setAttribute('role', 'row');

    // Select-all column
    if (this.selectable) {
      const th = document.createElement('th');
      th.scope = 'col';
      th.style.width = '3rem';
      if (isGrid) th.setAttribute('role', 'columnheader');

      const rows = this._displayRows;
      const allIds = rows.map((r) => String(r.id ?? '')).filter(Boolean);
      const selectedCount = allIds.filter((id) =>
        this._selectedRows.has(id)
      ).length;
      const allSelected = allIds.length > 0 && selectedCount === allIds.length;
      const someSelected = selectedCount > 0 && selectedCount < allIds.length;

      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.dataset.selectAll = '';
      cb.setAttribute('data-select-cb', '');
      cb.setAttribute('aria-label', 'Select all rows');
      cb.checked = allSelected;
      cb.indeterminate = someSelected;
      cb.style.cssText = 'cursor:pointer;min-width:18px;min-height:18px';

      th.appendChild(cb);
      tr.appendChild(th);
    }

    // Column headers
    for (const col of this._columns) {
      const th = document.createElement('th');
      th.scope = 'col';
      if (col.align) th.style.textAlign = col.align;
      if (col.width) th.style.width = col.width;
      if (isGrid) th.setAttribute('role', 'columnheader');

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
            ? '\u2191'
            : isSorted && dir === 'descending'
            ? '\u2193'
            : '\u2195';

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
    const isGrid = this.mode === 'grid';

    // Error state
    if (this.errorMessage) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.setAttribute('data-error-cell', '');
      td.setAttribute('role', 'alert');
      td.colSpan = this._totalColumns;
      td.textContent = this.errorMessage;
      tr.appendChild(td);
      tbody.appendChild(tr);
      return;
    }

    // Loading state
    if (this.loading && this._displayRows.length === 0) {
      const tr = document.createElement('tr');
      tr.setAttribute('aria-busy', 'true');
      const td = document.createElement('td');
      td.setAttribute('data-loading-cell', '');
      td.colSpan = this._totalColumns;
      td.textContent = 'Loading\u2026';
      tr.appendChild(td);
      tbody.appendChild(tr);
      return;
    }

    // Empty state
    if (this._displayRows.length === 0) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.setAttribute('data-empty-cell', '');
      td.colSpan = this._totalColumns;
      td.textContent = this.emptyMessage;
      tr.appendChild(td);
      tbody.appendChild(tr);
      return;
    }

    // Dev warning
    if (this.selectable) {
      const missingId = this._displayRows.some((r) => !r.id);
      if (missingId) {
        warn.warning(
          'compa11y-data-grid: When selectable is enabled, each row object must have an "id" field.'
        );
      }
    }

    for (let rowIndex = 0; rowIndex < this._displayRows.length; rowIndex++) {
      const row = this._displayRows[rowIndex]!;
      const rowId = String(row.id ?? '');
      const isSelected = rowId ? this._selectedRows.has(rowId) : false;

      const tr = document.createElement('tr');
      if (isGrid) tr.setAttribute('role', 'row');
      if (rowId && this.selectable) {
        tr.setAttribute('aria-selected', String(isSelected));
      }
      if (isGrid && this._hasPagination) {
        tr.setAttribute(
          'aria-rowindex',
          String((this._page - 1) * this._pageSize + rowIndex + 2)
        );
      }

      // Select checkbox
      if (this.selectable) {
        const td = document.createElement('td');
        td.style.width = '3rem';
        if (isGrid) {
          td.setAttribute('role', 'gridcell');
          td.setAttribute('tabindex', '-1');
        }

        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.dataset.rowId = rowId;
        cb.dataset.selectRow = '';
        cb.setAttribute('data-select-cb', '');
        cb.checked = isSelected;
        cb.style.cssText = 'cursor:pointer;min-width:18px;min-height:18px';

        const firstCol = this._columns[0];
        const nameValue = firstCol
          ? String(row[firstCol.key] ?? rowId)
          : rowId;
        cb.setAttribute('aria-label', `Select ${nameValue}`);

        td.appendChild(cb);
        tr.appendChild(td);
      }

      // Data cells
      for (let colIdx = 0; colIdx < this._columns.length; colIdx++) {
        const col = this._columns[colIdx]!;
        const value = row[col.key];
        const displayValue =
          value === null || value === undefined ? '' : String(value);
        const cellColIndex = this.selectable ? colIdx + 1 : colIdx;

        const isEditing =
          this._editingCell?.row === rowIndex &&
          this._editingCell?.col === cellColIndex;

        if (col.rowHeader) {
          const th = document.createElement('th');
          th.scope = 'row';
          if (col.align) th.style.textAlign = col.align;
          if (isGrid) {
            th.setAttribute('role', 'gridcell');
            th.setAttribute('tabindex', '-1');
            th.dataset.row = String(rowIndex);
            th.dataset.col = String(cellColIndex);
          }
          th.textContent = displayValue;
          tr.appendChild(th);
        } else {
          const td = document.createElement('td');
          if (col.align) td.style.textAlign = col.align;
          if (col.editable) td.setAttribute('data-editable', '');
          if (isGrid) {
            td.setAttribute('role', 'gridcell');
            td.setAttribute('tabindex', '-1');
            td.dataset.row = String(rowIndex);
            td.dataset.col = String(cellColIndex);
          }

          if (isEditing) {
            td.setAttribute('data-editing', '');
            const input = document.createElement('input');
            input.type = 'text';
            input.value = displayValue;
            input.setAttribute(
              'aria-label',
              `Edit ${col.label} for ${String(row[this._columns[0]?.key ?? ''] ?? rowId)}`
            );
            td.appendChild(input);
            requestAnimationFrame(() => input.focus());
          } else {
            td.textContent = displayValue;
          }

          tr.appendChild(td);
        }
      }

      tbody.appendChild(tr);
    }
  }

  private syncSelectionState(): void {
    if (!this._tableEl) return;

    const rows =
      this._tableEl.querySelectorAll<HTMLTableRowElement>('tbody tr');
    for (const tr of Array.from(rows)) {
      const cb = tr.querySelector<HTMLInputElement>('[data-select-row]');
      if (!cb) continue;
      const rowId = cb.dataset.rowId ?? '';
      const isSelected = this._selectedRows.has(rowId);
      tr.setAttribute('aria-selected', String(isSelected));
      cb.checked = isSelected;
    }

    const selectAll =
      this._tableEl.querySelector<HTMLInputElement>('[data-select-all]');
    if (selectAll) {
      const allIds = this._displayRows
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

  // ── Pagination ────────────────────────────────────────────────────────────

  private renderPagination(): void {
    if (!this._hasPagination) {
      if (this._paginationEl) {
        this._paginationEl.remove();
        this._paginationEl = null;
      }
      return;
    }

    if (!this._paginationEl) {
      this._paginationEl = document.createElement('nav');
      this._paginationEl.setAttribute('data-datagrid-pagination', '');
      this._paginationEl.setAttribute(
        'aria-label',
        `${this.caption} pagination`
      );
      this.appendChild(this._paginationEl);
    }

    const page = this._page;
    const total = this.totalPages;
    const start = (page - 1) * this._pageSize + 1;
    const end = Math.min(page * this._pageSize, this.totalRows);

    let html = `<div data-datagrid-pagination-info>Showing ${start}\u2013${end} of ${this.totalRows}</div>`;

    // Page size selector
    const options = this._pageSizeOptions;
    if (options.length > 0) {
      html += `<div data-datagrid-page-size><label for="${this._id}-page-size">Rows per page:</label><select id="${this._id}-page-size" data-page-size-select>`;
      for (const size of options) {
        html += `<option value="${size}"${
          size === this._pageSize ? ' selected' : ''
        }>${size}</option>`;
      }
      html += `</select></div>`;
    }

    // Page buttons
    html += `<div data-datagrid-page-buttons>`;
    html += `<button type="button" data-page-prev${
      page <= 1 ? ' disabled' : ''
    } aria-label="Previous page">Previous</button>`;

    const range = this.getPageRange(page, total);
    for (const item of range) {
      if (item === 'ellipsis') {
        html += `<span aria-hidden="true">\u2026</span>`;
      } else {
        html += `<button type="button" data-page="${item}"${
          item === page ? ' aria-current="page"' : ''
        } aria-label="Page ${item}">${item}</button>`;
      }
    }

    html += `<button type="button" data-page-next${
      page >= total ? ' disabled' : ''
    } aria-label="Next page">Next</button>`;
    html += `</div>`;

    this._paginationEl.innerHTML = html;
  }

  private getPageRange(
    current: number,
    total: number
  ): (number | 'ellipsis')[] {
    const range: (number | 'ellipsis')[] = [];
    const sibling = 1;
    const boundary = 1;

    const left = Math.max(1, current - sibling);
    const right = Math.min(total, current + sibling);

    for (let i = 1; i <= Math.min(boundary, total); i++) range.push(i);
    if (left > boundary + 1) range.push('ellipsis');
    for (let i = left; i <= right; i++) {
      if (!range.includes(i)) range.push(i);
    }
    if (right < total - boundary) range.push('ellipsis');
    for (let i = Math.max(total - boundary + 1, 1); i <= total; i++) {
      if (!range.includes(i)) range.push(i);
    }
    return range;
  }

  // ── Event handlers ────────────────────────────────────────────────────────

  private handleClick = (event: Event): void => {
    const target = event.target as HTMLElement;

    // Sort buttons
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

        this.emit('compa11y-datagrid-sort', {
          sortKey: this._sortKey,
          sortDirection: this._sortDirection,
        });
      }
      return;
    }

    // Pagination — previous
    if (target.closest('[data-page-prev]')) {
      if (this._page > 1) {
        this._page--;
        this.rerenderTable();
        this.renderPagination();
        announce(`Page ${this._page} of ${this.totalPages}`);
        this.emit('compa11y-datagrid-page', { page: this._page });
      }
      return;
    }

    // Pagination — next
    if (target.closest('[data-page-next]')) {
      if (this._page < this.totalPages) {
        this._page++;
        this.rerenderTable();
        this.renderPagination();
        announce(`Page ${this._page} of ${this.totalPages}`);
        this.emit('compa11y-datagrid-page', { page: this._page });
      }
      return;
    }

    // Pagination — specific page
    const pageBtn = target.closest<HTMLElement>('[data-page]');
    if (pageBtn && pageBtn.dataset.page) {
      const newPage = Number(pageBtn.dataset.page);
      if (newPage !== this._page) {
        this._page = newPage;
        this.rerenderTable();
        this.renderPagination();
        announce(`Page ${this._page} of ${this.totalPages}`);
        this.emit('compa11y-datagrid-page', { page: this._page });
      }
      return;
    }

    // Grid mode — cell focus
    if (this.mode === 'grid') {
      const cell = target.closest<HTMLElement>('[data-row][data-col]');
      if (cell) {
        const row = Number(cell.dataset.row);
        const col = Number(cell.dataset.col);
        this._focusedCell = { row, col };
      }
    }
  };

  private handleChange = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    if (!target || target.type !== 'checkbox' && !target.dataset.pageSizeSelect) return;

    // Page size select
    if ('pageSizeSelect' in target.dataset) {
      this._pageSize = Number((target as unknown as HTMLSelectElement).value);
      this._page = 1;
      this.rerenderTable();
      this.renderPagination();
      announce(`Showing ${this._pageSize} rows per page`);
      this.emit('compa11y-datagrid-page-size', { pageSize: this._pageSize });
      return;
    }

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

  private handleKeyDown = (event: Event): void => {
    if (this.mode !== 'grid') return;
    const e = event as KeyboardEvent;
    if (!this._focusedCell) return;

    const { row, col } = this._focusedCell;
    const rowCount = this._displayRows.length;
    let newRow = row;
    let newCol = col;
    let handled = false;

    // Handle editing state
    if (this._editingCell) {
      if (e.key === 'Escape') {
        this._editingCell = null;
        this.rerenderTable();
        handled = true;
      } else if (e.key === 'Enter') {
        // Save edit
        const cellEl = this._tableEl?.querySelector<HTMLInputElement>(
          `[data-row="${row}"][data-col="${col}"] input`
        );
        if (cellEl) {
          const colIndex = this.selectable ? col - 1 : col;
          const colDef = this._columns[colIndex];
          const rowData = this._displayRows[row];
          if (colDef && rowData) {
            this.emit('compa11y-datagrid-cell-edit', {
              rowId: rowData.id,
              columnId: colDef.key,
              value: cellEl.value,
            });
            announce('Cell updated');
          }
        }
        this._editingCell = null;
        this.rerenderTable();
        handled = true;
      }
      if (handled) {
        e.preventDefault();
        e.stopPropagation();
        // Re-focus cell
        requestAnimationFrame(() => {
          const cell = this._tableEl?.querySelector<HTMLElement>(
            `[data-row="${row}"][data-col="${col}"]`
          );
          cell?.focus();
        });
      }
      return;
    }

    switch (e.key) {
      case 'ArrowRight':
        if (col < this._totalColumns - 1) { newCol = col + 1; handled = true; }
        break;
      case 'ArrowLeft':
        if (col > 0) { newCol = col - 1; handled = true; }
        break;
      case 'ArrowDown':
        if (row < rowCount - 1) { newRow = row + 1; handled = true; }
        break;
      case 'ArrowUp':
        if (row > 0) { newRow = row - 1; handled = true; }
        break;
      case 'Home':
        if (e.ctrlKey) { newRow = 0; newCol = 0; } else { newCol = 0; }
        handled = true;
        break;
      case 'End':
        if (e.ctrlKey) { newRow = rowCount - 1; newCol = this._totalColumns - 1; } else { newCol = this._totalColumns - 1; }
        handled = true;
        break;
      case 'PageDown':
        newRow = Math.min(row + this._pageSize, rowCount - 1);
        handled = true;
        break;
      case 'PageUp':
        newRow = Math.max(row - this._pageSize, 0);
        handled = true;
        break;
      case 'Enter':
      case 'F2': {
        const colIndex = this.selectable ? col - 1 : col;
        const colDef = this._columns[colIndex];
        if (colDef?.editable) {
          this._editingCell = { row, col };
          this.rerenderTable();
          handled = true;
        }
        break;
      }
      case ' ':
        if (this.selectable) {
          const rowData = this._displayRows[row];
          if (rowData?.id) {
            if (this._selectedRows.has(rowData.id)) {
              this._selectedRows.delete(rowData.id);
            } else {
              this._selectedRows.add(rowData.id);
            }
            this.syncSelectionState();
            this.emitSelectEvent();
            const count = this._selectedRows.size;
            announce(
              count === 0
                ? 'Selection cleared'
                : `${count} row${count === 1 ? '' : 's'} selected`
            );
            handled = true;
          }
        }
        break;
    }

    if (handled) {
      e.preventDefault();
      e.stopPropagation();
      if (newRow !== row || newCol !== col) {
        this._focusedCell = { row: newRow, col: newCol };
        requestAnimationFrame(() => {
          const cell = this._tableEl?.querySelector<HTMLElement>(
            `[data-row="${newRow}"][data-col="${newCol}"]`
          );
          cell?.focus();
        });
      }
    }
  };

  private emitSelectEvent(): void {
    this.emit('compa11y-datagrid-select', {
      selectedRows: Array.from(this._selectedRows),
    });
  }
}

defineElement('compa11y-data-grid', Compa11yDataGrid);

export default Compa11yDataGrid;
