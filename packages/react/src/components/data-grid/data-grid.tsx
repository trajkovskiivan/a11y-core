import React, {
  forwardRef,
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from 'react';
import { useId } from '../../hooks/use-id';
import { useAnnouncer, useAnnounceLoading } from '../../hooks/use-announcer';
import { createComponentWarnings } from '@compa11y/core';
import {
  DataGridProvider,
  type DataGridContextValue,
  type DataGridColumnDef,
  type DataGridRowData,
  type DataGridMode,
  type SortDirection,
} from './data-grid-context';

const warn = createComponentWarnings('DataGrid');

// ============================================================================
// Global styles — injected once into <head> on first render
// ============================================================================

let _globalStylesInjected = false;

function ensureGlobalStyles() {
  if (_globalStylesInjected || typeof document === 'undefined') return;
  _globalStylesInjected = true;
  const style = document.createElement('style');
  style.dataset.compa11yDatagrid = '';
  style.textContent = `
    /* ── Root ── */
    [data-compa11y-datagrid] {
      position: relative;
    }

    /* ── Wrapper ── */
    [data-compa11y-datagrid-wrapper] {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }

    /* ── Table ── */
    [data-compa11y-datagrid-table] {
      border-collapse: collapse;
      width: 100%;
      font-size: 0.9375rem;
      color: var(--compa11y-datagrid-color, #1a1a1a);
      background: var(--compa11y-datagrid-bg, #ffffff);
    }

    /* ── Caption ── */
    [data-compa11y-datagrid-table] caption {
      caption-side: top;
      text-align: left;
      font-weight: 600;
      font-size: 1rem;
      padding-bottom: 0.5rem;
      color: var(--compa11y-datagrid-caption-color, #1a1a1a);
    }

    /* ── Header cells ── */
    [data-compa11y-datagrid-header-cell] {
      text-align: left;
      font-weight: 600;
      padding: var(--compa11y-datagrid-cell-padding, 0.625rem 0.875rem);
      background: var(--compa11y-datagrid-head-bg, #f5f5f5);
      border-bottom: 2px solid var(--compa11y-datagrid-border-color, #d0d0d0);
      white-space: nowrap;
    }

    /* ── Sticky header ── */
    [data-compa11y-datagrid][data-sticky-header] [data-compa11y-datagrid-header-cell] {
      position: sticky;
      top: 0;
      z-index: 1;
    }

    /* ── Data cells ── */
    [data-compa11y-datagrid-cell] {
      padding: var(--compa11y-datagrid-cell-padding, 0.625rem 0.875rem);
      border-bottom: 1px solid var(--compa11y-datagrid-border-color, #e8e8e8);
      vertical-align: top;
    }

    /* ── Compact ── */
    [data-compa11y-datagrid][data-compact] [data-compa11y-datagrid-header-cell],
    [data-compa11y-datagrid][data-compact] [data-compa11y-datagrid-cell] {
      padding: var(--compa11y-datagrid-compact-padding, 0.375rem 0.625rem);
    }

    /* ── Bordered ── */
    [data-compa11y-datagrid][data-bordered] [data-compa11y-datagrid-header-cell],
    [data-compa11y-datagrid][data-bordered] [data-compa11y-datagrid-cell] {
      border: 1px solid var(--compa11y-datagrid-border-color, #d0d0d0);
    }

    /* ── Striped ── */
    [data-compa11y-datagrid][data-striped] [data-compa11y-datagrid-body] tr:nth-child(even) {
      background: var(--compa11y-datagrid-stripe-bg, #fafafa);
    }

    /* ── Row hover ── */
    [data-compa11y-datagrid-body] tr:hover {
      background: var(--compa11y-datagrid-row-hover-bg, #f0f0f0);
    }

    /* ── Selected row ── */
    [data-compa11y-datagrid] tr[aria-selected="true"] {
      background: var(--compa11y-datagrid-selected-bg, #e8f0fe);
    }
    [data-compa11y-datagrid] tr[aria-selected="true"]:hover {
      background: var(--compa11y-datagrid-selected-hover-bg, #dde7fd);
    }

    /* ── Sort button ── */
    [data-compa11y-sort-key] {
      appearance: none;
      -webkit-appearance: none;
      background: none;
      border: none;
      padding: 0;
      margin: 0;
      font: inherit;
      color: inherit;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.375em;
      text-align: left;
      width: 100%;
    }
    [data-compa11y-sort-key]:focus-visible {
      outline: 2px solid var(--compa11y-focus-color, #0066cc);
      outline-offset: 2px;
      border-radius: 2px;
    }
    [data-compa11y-sort-key] > [aria-hidden="true"] {
      font-size: 0.75em;
      opacity: 0.6;
      flex-shrink: 0;
    }

    /* ── Select checkboxes ── */
    [data-compa11y-datagrid-select-all] input,
    [data-compa11y-datagrid-select-cell] input {
      cursor: pointer;
      min-width: 18px;
      min-height: 18px;
    }
    [data-compa11y-datagrid-select-all] input:focus-visible,
    [data-compa11y-datagrid-select-cell] input:focus-visible {
      outline: 2px solid var(--compa11y-focus-color, #0066cc);
      outline-offset: 2px;
    }

    /* ── Grid cell focus (grid mode) ── */
    [data-compa11y-datagrid][data-mode="grid"] [data-compa11y-datagrid-cell]:focus,
    [data-compa11y-datagrid][data-mode="grid"] [data-compa11y-datagrid-header-cell]:focus {
      outline: 2px solid var(--compa11y-focus-color, #0066cc);
      outline-offset: -2px;
    }

    /* ── Editable cell ── */
    [data-compa11y-datagrid-cell][data-editable] {
      cursor: text;
    }
    [data-compa11y-datagrid-cell][data-editing] input {
      width: 100%;
      border: 2px solid var(--compa11y-focus-color, #0066cc);
      padding: 0.25rem;
      font: inherit;
      outline: none;
    }

    /* ── Empty / Loading / Error cells ── */
    [data-compa11y-datagrid-empty-cell],
    [data-compa11y-datagrid] [data-compa11y-datagrid-loading-row] td {
      text-align: center;
      padding: 2rem 1rem;
      color: var(--compa11y-datagrid-muted-color, #6b6b6b);
      font-style: italic;
    }
    [data-compa11y-datagrid-error-cell] {
      text-align: center;
      padding: 2rem 1rem;
      color: var(--compa11y-datagrid-error-color, #d32f2f);
    }

    /* ── Toolbar ── */
    [data-compa11y-datagrid-toolbar] {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem 0;
      flex-wrap: wrap;
    }

    /* ── Pagination ── */
    [data-compa11y-datagrid-pagination] {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.75rem 0;
      flex-wrap: wrap;
      font-size: 0.875rem;
    }

    [data-compa11y-datagrid-page-size] {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    [data-compa11y-datagrid-page-size] select {
      padding: 0.25rem 0.5rem;
      border: 1px solid var(--compa11y-datagrid-border-color, #d0d0d0);
      border-radius: 4px;
      font: inherit;
      font-size: 0.875rem;
      background: var(--compa11y-datagrid-bg, #ffffff);
    }

    [data-compa11y-datagrid-page-buttons] {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    [data-compa11y-datagrid-page-buttons] button {
      appearance: none;
      -webkit-appearance: none;
      background: var(--compa11y-datagrid-pagination-btn-bg, #ffffff);
      border: 1px solid var(--compa11y-datagrid-border-color, #d0d0d0);
      border-radius: 4px;
      padding: 0.375rem 0.75rem;
      font: inherit;
      font-size: 0.875rem;
      cursor: pointer;
      min-width: 2.75rem;
      min-height: 2.75rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    [data-compa11y-datagrid-page-buttons] button:hover:not(:disabled) {
      background: var(--compa11y-datagrid-pagination-btn-hover-bg, #f0f0f0);
    }

    [data-compa11y-datagrid-page-buttons] button:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    [data-compa11y-datagrid-page-buttons] button[aria-current="page"] {
      background: var(--compa11y-datagrid-pagination-active-bg, #0066cc);
      color: var(--compa11y-datagrid-pagination-active-color, #ffffff);
      border-color: var(--compa11y-datagrid-pagination-active-bg, #0066cc);
      font-weight: 600;
    }

    [data-compa11y-datagrid-page-buttons] button:focus-visible {
      outline: 2px solid var(--compa11y-focus-color, #0066cc);
      outline-offset: 2px;
    }

    /* ── Reduced motion ── */
    @media (prefers-reduced-motion: reduce) {
      [data-compa11y-datagrid] * {
        transition: none !important;
      }
    }

    /* ── High contrast ── */
    @media (forced-colors: active) {
      [data-compa11y-datagrid-header-cell] {
        border-bottom-color: ButtonText;
      }
      [data-compa11y-datagrid-cell] {
        border-bottom-color: ButtonText;
      }
      [data-compa11y-datagrid] tr[aria-selected="true"] {
        outline: 2px solid Highlight;
        outline-offset: -2px;
      }
      [data-compa11y-sort-key]:focus-visible,
      [data-compa11y-datagrid-select-all] input:focus-visible,
      [data-compa11y-datagrid-select-cell] input:focus-visible,
      [data-compa11y-datagrid-page-buttons] button:focus-visible {
        outline-color: Highlight;
      }
      [data-compa11y-datagrid][data-mode="grid"] [data-compa11y-datagrid-cell]:focus,
      [data-compa11y-datagrid][data-mode="grid"] [data-compa11y-datagrid-header-cell]:focus {
        outline-color: Highlight;
      }
    }
  `;
  document.head.appendChild(style);
}

// ============================================================================
// Sort icons
// ============================================================================

const SORT_ICONS: Record<SortDirection, string> = {
  ascending: '\u2191',
  descending: '\u2193',
  none: '\u2195',
};

// ============================================================================
// Utility: get cell value from row using column accessor
// ============================================================================

function getCellValue<T>(
  row: T,
  accessor: DataGridColumnDef<T>['accessor']
): unknown {
  if (typeof accessor === 'function') return accessor(row);
  return (row as Record<string, unknown>)[accessor as string];
}

// ============================================================================
// Root — DataGrid
// ============================================================================

export interface DataGridProps<T extends DataGridRowData = DataGridRowData>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Column definitions */
  columns: DataGridColumnDef<T>[];
  /** Row data — each row must have a unique `id` field */
  rows: T[];
  /**
   * Accessible name for the grid (rendered as `<caption>` in table mode).
   * Required unless `aria-label` or `aria-labelledby` is provided.
   */
  caption: string;
  /** Hide the caption visually while keeping it accessible. @default false */
  captionHidden?: boolean;

  // --- Mode ---
  /**
   * `"table"` — native `<table>` with Tab-based navigation (default).
   * `"grid"` — ARIA grid with arrow-key cell navigation + optional inline editing.
   * @default 'table'
   */
  mode?: DataGridMode;

  // --- Sort ---
  /** Controlled sort column key */
  sortKey?: string | null;
  /** Controlled sort direction @default 'none' */
  sortDirection?: SortDirection;
  /** Called when a sortable header is activated */
  onSortChange?: (key: string | null, direction: SortDirection) => void;

  // --- Selection ---
  /** Enable row selection via checkboxes */
  selectable?: boolean;
  /** Controlled selected row IDs */
  selectedRows?: string[];
  /** Default selected rows for uncontrolled mode */
  defaultSelectedRows?: string[];
  /** Called when selection changes */
  onSelectionChange?: (rows: string[]) => void;

  // --- Pagination ---
  /** Current page (1-based). When provided, pagination is shown. */
  page?: number;
  /** Rows per page @default 10 */
  pageSize?: number;
  /** Total number of rows (for server-side pagination) */
  totalRows?: number;
  /** Called when page changes */
  onPageChange?: (page: number) => void;
  /** Page size options @default [10, 25, 50, 100] */
  pageSizeOptions?: number[];
  /** Called when page size changes */
  onPageSizeChange?: (size: number) => void;

  // --- Row actions ---
  /** Render action buttons for each row */
  renderRowActions?: (row: T) => React.ReactNode;

  // --- States ---
  /** Whether data is loading */
  isLoading?: boolean;
  /** Error to display */
  error?: React.ReactNode;
  /** Content shown when rows is empty */
  emptyContent?: React.ReactNode;

  // --- Grid-mode editing ---
  /** Called when a cell edit is committed (grid mode) */
  onCellEdit?: (rowId: string, columnId: string, value: unknown) => void;

  // --- Toolbar ---
  /** Content rendered above the table (search, filters, bulk actions) */
  toolbar?: React.ReactNode;

  // --- Styling ---
  /** Sticky header @default false */
  stickyHeader?: boolean;
  /** Stripe alternate rows @default false */
  striped?: boolean;
  /** Render gridlines @default false */
  bordered?: boolean;
  /** Compact row height @default false */
  compact?: boolean;

  /** Accessible description for the data grid */
  description?: string;
}

export const DataGrid = forwardRef(function DataGrid<
  T extends DataGridRowData = DataGridRowData,
>(
  {
    columns,
    rows,
    caption,
    captionHidden = false,
    mode = 'table',
    sortKey: controlledSortKey,
    sortDirection: controlledSortDirection,
    onSortChange,
    selectable = false,
    selectedRows: controlledSelected,
    defaultSelectedRows,
    onSelectionChange,
    page: controlledPage,
    pageSize: controlledPageSize,
    totalRows: totalRowsProp,
    onPageChange,
    pageSizeOptions = [10, 25, 50, 100],
    onPageSizeChange,
    renderRowActions,
    isLoading = false,
    error,
    emptyContent,
    onCellEdit,
    toolbar,
    stickyHeader = false,
    striped = false,
    bordered = false,
    compact = false,
    description,
    ...props
  }: DataGridProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  ensureGlobalStyles();

  const baseId = useId('datagrid');
  const { announce } = useAnnouncer();
  const tableRef = useRef<HTMLTableElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // --- Announce loading ---
  useAnnounceLoading(isLoading, {
    loadingMessage: 'Loading data...',
    loadedMessage: 'Data loaded',
  });

  // --- Sort state (controlled + uncontrolled) ---
  const [uncontrolledSortKey, setUncontrolledSortKey] = useState<string | null>(
    null
  );
  const [uncontrolledSortDir, setUncontrolledSortDir] =
    useState<SortDirection>('none');

  const sortKey =
    controlledSortKey !== undefined ? controlledSortKey : uncontrolledSortKey;
  const sortDirection =
    controlledSortDirection !== undefined
      ? controlledSortDirection
      : uncontrolledSortDir;

  const handleSort = useCallback(
    (key: string) => {
      let newDir: SortDirection;
      if (sortKey !== key) {
        newDir = 'ascending';
      } else if (sortDirection === 'ascending') {
        newDir = 'descending';
      } else if (sortDirection === 'descending') {
        newDir = 'none';
      } else {
        newDir = 'ascending';
      }

      const newKey = newDir === 'none' ? null : key;

      if (controlledSortKey === undefined) {
        setUncontrolledSortKey(newKey);
        setUncontrolledSortDir(newDir);
      }
      onSortChange?.(newKey, newDir);

      // Preserve focus on sort button
      const active = document.activeElement as HTMLElement | null;
      const focusedSortKey = active?.dataset?.compa11ySortKey ?? null;
      if (focusedSortKey) {
        requestAnimationFrame(() => {
          const btn = tableRef.current?.querySelector<HTMLElement>(
            `[data-compa11y-sort-key="${focusedSortKey}"]`
          );
          btn?.focus();
        });
      }

      const col = columns.find((c) => c.id === key);
      const label = col?.header ?? key;
      const dirLabel =
        newDir === 'none' ? 'sort cleared' : `sorted ${newDir}`;
      announce(`${label} ${dirLabel}`);
    },
    [sortKey, sortDirection, controlledSortKey, onSortChange, announce, columns]
  );

  // --- Selection state (controlled + uncontrolled) ---
  const normalizedDefault = useMemo(
    () => new Set<string>(defaultSelectedRows ?? []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const [uncontrolledSelected, setUncontrolledSelected] =
    useState<Set<string>>(normalizedDefault);

  const selectedRowsSet: Set<string> = useMemo(
    () =>
      controlledSelected !== undefined
        ? new Set(controlledSelected)
        : uncontrolledSelected,
    [controlledSelected, uncontrolledSelected]
  );

  const handleSelectionChange = useCallback(
    (rowIds: string[]) => {
      if (controlledSelected === undefined) {
        setUncontrolledSelected(new Set(rowIds));
      }
      onSelectionChange?.(rowIds);

      if (rowIds.length === 0) {
        announce('Selection cleared');
      } else {
        announce(
          `${rowIds.length} row${rowIds.length === 1 ? '' : 's'} selected`
        );
      }
    },
    [controlledSelected, onSelectionChange, announce]
  );

  // --- Pagination state ---
  const hasPagination = controlledPage !== undefined;
  const [uncontrolledPageSize, setUncontrolledPageSize] = useState(
    controlledPageSize ?? 10
  );
  const pageSize = controlledPageSize ?? uncontrolledPageSize;
  const totalRows = totalRowsProp ?? rows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const currentPage = hasPagination
    ? Math.min(Math.max(1, controlledPage), totalPages)
    : 1;

  // Slice rows for client-side pagination (when totalRows not provided)
  const displayRows = useMemo(() => {
    if (!hasPagination || totalRowsProp !== undefined) return rows;
    const start = (currentPage - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, hasPagination, currentPage, pageSize, totalRowsProp]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      onPageChange?.(newPage);
      announce(`Page ${newPage} of ${totalPages}`);
    },
    [onPageChange, announce, totalPages]
  );

  const handlePageSizeChange = useCallback(
    (newSize: number) => {
      if (controlledPageSize === undefined) {
        setUncontrolledPageSize(newSize);
      }
      onPageSizeChange?.(newSize);
      announce(`Showing ${newSize} rows per page`);
    },
    [controlledPageSize, onPageSizeChange, announce]
  );

  // --- Grid-mode focus & editing ---
  const [focusedCell, setFocusedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [editingCell, setEditingCell] = useState<{
    row: number;
    col: number;
  } | null>(null);

  const hasActionsColumn = renderRowActions !== undefined;
  const totalColumns =
    columns.length + (selectable ? 1 : 0) + (hasActionsColumn ? 1 : 0);

  const startEditing = useCallback(
    (row: number, col: number) => {
      const colIndex = selectable ? col - 1 : col;
      if (colIndex < 0 || colIndex >= columns.length) return;
      const colDef = columns[colIndex];
      if (!colDef?.editable) return;
      setEditingCell({ row, col });
    },
    [columns, selectable]
  );

  const stopEditing = useCallback(
    (save?: boolean) => {
      if (save && editingCell && onCellEdit) {
        const rowIndex = editingCell.row;
        const colIndex = selectable
          ? editingCell.col - 1
          : editingCell.col;
        if (rowIndex >= 0 && rowIndex < displayRows.length && colIndex >= 0 && colIndex < columns.length) {
          const rowData = displayRows[rowIndex];
          const colDef = columns[colIndex];
          const cellEl = tableRef.current?.querySelector<HTMLElement>(
            `[data-compa11y-datagrid-cell][data-row="${rowIndex}"][data-col="${editingCell.col}"] input, [data-compa11y-datagrid-cell][data-row="${rowIndex}"][data-col="${editingCell.col}"] select`
          );
          if (cellEl && rowData && colDef) {
            const value = (cellEl as HTMLInputElement).value;
            onCellEdit(rowData.id, colDef.id, value);
            announce(`Cell updated`);
          }
        }
      }
      setEditingCell(null);
    },
    [editingCell, onCellEdit, displayRows, columns, selectable, announce]
  );

  // --- Grid keyboard navigation ---
  const handleGridKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (mode !== 'grid' || !focusedCell) return;

      const { row, col } = focusedCell;
      const rowCount = displayRows.length;
      let newRow = row;
      let newCol = col;
      let handled = false;

      switch (e.key) {
        case 'ArrowRight':
          if (col < totalColumns - 1) {
            newCol = col + 1;
            handled = true;
          }
          break;
        case 'ArrowLeft':
          if (col > 0) {
            newCol = col - 1;
            handled = true;
          }
          break;
        case 'ArrowDown':
          if (row < rowCount - 1) {
            newRow = row + 1;
            handled = true;
          }
          break;
        case 'ArrowUp':
          if (row > 0) {
            newRow = row - 1;
            handled = true;
          } else if (row === 0) {
            // Move focus to header row
            newRow = -1;
            handled = true;
          }
          break;
        case 'Home':
          if (e.ctrlKey) {
            newRow = 0;
            newCol = 0;
          } else {
            newCol = 0;
          }
          handled = true;
          break;
        case 'End':
          if (e.ctrlKey) {
            newRow = rowCount - 1;
            newCol = totalColumns - 1;
          } else {
            newCol = totalColumns - 1;
          }
          handled = true;
          break;
        case 'PageDown':
          newRow = Math.min(row + pageSize, rowCount - 1);
          handled = true;
          break;
        case 'PageUp':
          newRow = Math.max(row - pageSize, 0);
          handled = true;
          break;
        case 'Enter':
        case 'F2':
          if (!editingCell) {
            startEditing(row, col);
            handled = true;
          }
          break;
        case 'Escape':
          if (editingCell) {
            stopEditing(false);
            handled = true;
          }
          break;
        case ' ':
          if (selectable && !editingCell) {
            const rowData = displayRows[row];
            if (rowData) {
              const current = Array.from(selectedRowsSet);
              const isSelected = selectedRowsSet.has(rowData.id);
              handleSelectionChange(
                isSelected
                  ? current.filter((id) => id !== rowData.id)
                  : [...current, rowData.id]
              );
              handled = true;
            }
          }
          break;
      }

      if (handled) {
        e.preventDefault();
        e.stopPropagation();

        if (editingCell && e.key !== 'Escape' && e.key !== 'Enter' && e.key !== 'F2') {
          return;
        }

        if (newRow !== row || newCol !== col) {
          setFocusedCell({ row: newRow, col: newCol });
          // Focus the new cell
          requestAnimationFrame(() => {
            const selector =
              newRow === -1
                ? `[data-compa11y-datagrid-header-cell][data-col="${newCol}"]`
                : `[data-compa11y-datagrid-cell][data-row="${newRow}"][data-col="${newCol}"]`;
            const cell =
              tableRef.current?.querySelector<HTMLElement>(selector);
            if (cell) {
              const focusable = cell.querySelector<HTMLElement>(
                'button, input, select, a[href], [tabindex="0"]'
              );
              (focusable ?? cell).focus();
            }
          });
        }
      }
    },
    [
      mode,
      focusedCell,
      displayRows,
      totalColumns,
      pageSize,
      editingCell,
      startEditing,
      stopEditing,
      selectable,
      selectedRowsSet,
      handleSelectionChange,
    ]
  );

  // --- Header keyboard for grid mode ---
  const handleHeaderGridKeyDown = useCallback(
    (e: React.KeyboardEvent, colIndex: number) => {
      if (mode !== 'grid') return;

      let handled = false;
      let newCol = colIndex;

      switch (e.key) {
        case 'ArrowRight':
          if (colIndex < totalColumns - 1) {
            newCol = colIndex + 1;
            handled = true;
          }
          break;
        case 'ArrowLeft':
          if (colIndex > 0) {
            newCol = colIndex - 1;
            handled = true;
          }
          break;
        case 'ArrowDown':
          if (displayRows.length > 0) {
            setFocusedCell({ row: 0, col: colIndex });
            handled = true;
            requestAnimationFrame(() => {
              const cell = tableRef.current?.querySelector<HTMLElement>(
                `[data-compa11y-datagrid-cell][data-row="0"][data-col="${colIndex}"]`
              );
              if (cell) {
                const focusable = cell.querySelector<HTMLElement>(
                  'button, input, select, a[href], [tabindex="0"]'
                );
                (focusable ?? cell).focus();
              }
            });
          }
          break;
        case 'Home':
          newCol = 0;
          handled = true;
          break;
        case 'End':
          newCol = totalColumns - 1;
          handled = true;
          break;
      }

      if (handled) {
        e.preventDefault();
        e.stopPropagation();
        if (newCol !== colIndex) {
          requestAnimationFrame(() => {
            const cell = tableRef.current?.querySelector<HTMLElement>(
              `[data-compa11y-datagrid-header-cell][data-col="${newCol}"]`
            );
            if (cell) {
              const focusable = cell.querySelector<HTMLElement>(
                'button, input, [tabindex="0"]'
              );
              (focusable ?? cell).focus();
            }
          });
        }
      }
    },
    [mode, totalColumns, displayRows.length]
  );

  // --- Dev warnings ---
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;

    if (
      !caption &&
      !props['aria-label'] &&
      !props['aria-labelledby']
    ) {
      warn.warning(
        'DataGrid must have an accessible name. Provide a caption prop, aria-label, or aria-labelledby.'
      );
    }

    if (selectable) {
      const missingId = rows.some((r) => !r.id);
      if (missingId) {
        warn.warning(
          'When selectable is enabled, each row object must have an "id" field.'
        );
      }
    }

    if (mode === 'grid') {
      const editableCols = columns.filter((c) => c.editable);
      if (editableCols.length > 0 && !onCellEdit) {
        warn.info(
          'Columns are marked editable but no onCellEdit handler is provided.'
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Live region for status ---
  const [liveMessage] = useState('');

  // --- Context ---
  const contextValue: DataGridContextValue = useMemo(
    () => ({
      baseId,
      mode,
      columns: columns as DataGridColumnDef[],
      sortKey: sortKey ?? null,
      sortDirection,
      onSort: handleSort,
      selectedRows: selectedRowsSet,
      onSelectionChange: handleSelectionChange,
      selectable,
      isLoading,
      focusedCell,
      setFocusedCell,
      editingCell,
      startEditing,
      stopEditing,
      totalColumns,
    }),
    [
      baseId,
      mode,
      columns,
      sortKey,
      sortDirection,
      handleSort,
      selectedRowsSet,
      handleSelectionChange,
      selectable,
      isLoading,
      focusedCell,
      editingCell,
      startEditing,
      stopEditing,
      totalColumns,
    ]
  );

  // --- Caption styles ---
  const captionStyle: React.CSSProperties = captionHidden
    ? {
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0,0,0,0)',
        whiteSpace: 'nowrap',
        border: 0,
      }
    : {};

  // --- Select All ---
  const allRowIds = useMemo(
    () => displayRows.map((r) => r.id).filter(Boolean),
    [displayRows]
  );
  const allSelected = allRowIds.length > 0 && allRowIds.every((id) => selectedRowsSet.has(id));
  const someSelected =
    allRowIds.some((id) => selectedRowsSet.has(id)) && !allSelected;
  const selectAllRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  const handleSelectAll = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleSelectionChange(e.target.checked ? allRowIds : []);
    },
    [handleSelectionChange, allRowIds]
  );

  const handleRowSelect = useCallback(
    (rowId: string, checked: boolean) => {
      const current = Array.from(selectedRowsSet);
      const next = checked
        ? [...current, rowId]
        : current.filter((id) => id !== rowId);
      handleSelectionChange(next);
    },
    [selectedRowsSet, handleSelectionChange]
  );

  // --- Pagination range ---
  const paginationRange = useMemo(() => {
    if (!hasPagination) return [];
    const range: (number | 'ellipsis')[] = [];
    const siblingCount = 1;
    const boundaryCount = 1;

    const leftBound = Math.max(1, currentPage - siblingCount);
    const rightBound = Math.min(totalPages, currentPage + siblingCount);

    for (let i = 1; i <= Math.min(boundaryCount, totalPages); i++) {
      range.push(i);
    }
    if (leftBound > boundaryCount + 1) {
      range.push('ellipsis');
    }
    for (let i = leftBound; i <= rightBound; i++) {
      if (!range.includes(i)) range.push(i);
    }
    if (rightBound < totalPages - boundaryCount) {
      range.push('ellipsis');
    }
    for (
      let i = Math.max(totalPages - boundaryCount + 1, 1);
      i <= totalPages;
      i++
    ) {
      if (!range.includes(i)) range.push(i);
    }

    return range;
  }, [hasPagination, currentPage, totalPages]);

  // --- Showing X of Y text ---
  const showingText = useMemo(() => {
    if (!hasPagination) return null;
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalRows);
    return `Showing ${start}\u2013${end} of ${totalRows}`;
  }, [hasPagination, currentPage, pageSize, totalRows]);

  // --- Render ---
  const isGrid = mode === 'grid';
  const descriptionId = description ? `${baseId}-desc` : undefined;
  const statusId = `${baseId}-status`;

  return (
    <DataGridProvider value={contextValue}>
      <div
        ref={ref}
        data-compa11y-datagrid
        data-mode={mode}
        data-loading={isLoading || undefined}
        data-striped={striped || undefined}
        data-bordered={bordered || undefined}
        data-compact={compact || undefined}
        data-sticky-header={stickyHeader || undefined}
        {...props}
      >
        {/* Description */}
        {description && (
          <div
            id={descriptionId}
            style={{
              position: 'absolute',
              width: '1px',
              height: '1px',
              padding: 0,
              margin: '-1px',
              overflow: 'hidden',
              clip: 'rect(0,0,0,0)',
              whiteSpace: 'nowrap',
              border: 0,
            }}
          >
            {description}
          </div>
        )}

        {/* Toolbar */}
        {toolbar && (
          <div data-compa11y-datagrid-toolbar role="toolbar" aria-label={`${caption} tools`}>
            {toolbar}
          </div>
        )}

        {/* Table wrapper for horizontal scroll */}
        <div
          ref={gridRef}
          data-compa11y-datagrid-wrapper
          role={isGrid ? 'grid' : undefined}
          aria-label={isGrid ? caption : undefined}
          aria-describedby={
            [descriptionId, statusId].filter(Boolean).join(' ') || undefined
          }
          aria-busy={isLoading || undefined}
          aria-rowcount={isGrid ? totalRows : undefined}
          aria-colcount={isGrid ? totalColumns : undefined}
          onKeyDown={isGrid ? handleGridKeyDown : undefined}
        >
          <table
            ref={tableRef}
            data-compa11y-datagrid-table
            data-sticky-header={stickyHeader || undefined}
            role={isGrid ? 'none' : undefined}
            aria-label={!isGrid ? undefined : undefined}
            aria-describedby={
              !isGrid
                ? [descriptionId, statusId].filter(Boolean).join(' ') || undefined
                : undefined
            }
            aria-busy={!isGrid ? (isLoading || undefined) : undefined}
          >
            {/* Caption — only for native table mode */}
            {!isGrid && caption && (
              <caption style={captionStyle}>{caption}</caption>
            )}

            {/* Header */}
            <thead data-compa11y-datagrid-head>
              <tr
                data-compa11y-datagrid-header-row
                role={isGrid ? 'row' : undefined}
              >
                {/* Select all */}
                {selectable && (
                  <th
                    scope="col"
                    data-compa11y-datagrid-header-cell
                    data-compa11y-datagrid-select-all
                    data-col={0}
                    role={isGrid ? 'columnheader' : undefined}
                    style={{ width: '3rem' }}
                    onKeyDown={
                      isGrid ? (e) => handleHeaderGridKeyDown(e, 0) : undefined
                    }
                  >
                    <input
                      ref={selectAllRef}
                      type="checkbox"
                      checked={allSelected}
                      aria-label="Select all rows"
                      onChange={handleSelectAll}
                      tabIndex={isGrid ? -1 : undefined}
                      style={{ cursor: 'pointer', minWidth: '18px', minHeight: '18px' }}
                    />
                  </th>
                )}

                {/* Column headers */}
                {columns.map((col, i) => {
                  const colIndex = selectable ? i + 1 : i;
                  const isSortable = col.sortable === true;
                  const isActivelySorted = isSortable && sortKey === col.id;
                  const ariaSort: SortDirection | undefined = isSortable
                    ? isActivelySorted
                      ? sortDirection
                      : 'none'
                    : undefined;

                  return (
                    <th
                      key={col.id}
                      scope="col"
                      data-compa11y-datagrid-header-cell
                      data-col={colIndex}
                      data-sortable={isSortable || undefined}
                      aria-sort={ariaSort}
                      role={isGrid ? 'columnheader' : undefined}
                      style={{
                        textAlign: col.align,
                        width: col.width,
                        minWidth: col.minWidth,
                      }}
                      tabIndex={isGrid && !isSortable ? 0 : undefined}
                      onKeyDown={
                        isGrid
                          ? (e) => handleHeaderGridKeyDown(e, colIndex)
                          : undefined
                      }
                    >
                      {isSortable ? (
                        <button
                          type="button"
                          data-compa11y-sort-key={col.id}
                          onClick={() => handleSort(col.id)}
                          aria-label={
                            col.headerAriaLabel ??
                            `Sort by ${col.header}, ${
                              isActivelySorted ? sortDirection : 'none'
                            }`
                          }
                          tabIndex={isGrid ? -1 : undefined}
                        >
                          {col.header}
                          <span aria-hidden="true">
                            {isActivelySorted
                              ? SORT_ICONS[sortDirection]
                              : SORT_ICONS['none']}
                          </span>
                        </button>
                      ) : (
                        col.header
                      )}
                    </th>
                  );
                })}

                {/* Actions column header */}
                {hasActionsColumn && (
                  <th
                    scope="col"
                    data-compa11y-datagrid-header-cell
                    data-col={totalColumns - 1}
                    role={isGrid ? 'columnheader' : undefined}
                    onKeyDown={
                      isGrid
                        ? (e) => handleHeaderGridKeyDown(e, totalColumns - 1)
                        : undefined
                    }
                  >
                    <span
                      style={{
                        position: 'absolute',
                        width: '1px',
                        height: '1px',
                        padding: 0,
                        margin: '-1px',
                        overflow: 'hidden',
                        clip: 'rect(0,0,0,0)',
                        whiteSpace: 'nowrap',
                        border: 0,
                      }}
                    >
                      Actions
                    </span>
                  </th>
                )}
              </tr>
            </thead>

            {/* Body */}
            <tbody data-compa11y-datagrid-body>
              {/* Error state */}
              {error && (
                <tr data-compa11y-datagrid-error-row>
                  <td
                    colSpan={totalColumns}
                    data-compa11y-datagrid-error-cell
                    role="alert"
                    style={{ textAlign: 'center', padding: '2rem 1rem' }}
                  >
                    {error}
                  </td>
                </tr>
              )}

              {/* Loading state */}
              {isLoading && !error && displayRows.length === 0 && (
                <tr data-compa11y-datagrid-loading-row aria-busy="true">
                  <td
                    colSpan={totalColumns}
                    style={{ textAlign: 'center', padding: '2rem 1rem' }}
                  >
                    Loading\u2026
                  </td>
                </tr>
              )}

              {/* Empty state */}
              {!isLoading && !error && displayRows.length === 0 && (
                <tr data-compa11y-datagrid-empty-row>
                  <td
                    colSpan={totalColumns}
                    data-compa11y-datagrid-empty-cell
                    style={{ textAlign: 'center', padding: '2rem 1rem' }}
                  >
                    {emptyContent ?? 'No results found'}
                  </td>
                </tr>
              )}

              {/* Data rows */}
              {!error &&
                displayRows.map((row, rowIndex) => {
                  const isSelected = selectedRowsSet.has(row.id);
                  const firstCol = columns[0];
                  const firstColValue = firstCol ? getCellValue(row, firstCol.accessor) : undefined;
                  const rowLabel = String(firstColValue ?? row.id);

                  return (
                    <tr
                      key={row.id}
                      data-compa11y-datagrid-row
                      data-selected={isSelected || undefined}
                      aria-selected={selectable ? isSelected : undefined}
                      aria-rowindex={
                        isGrid && hasPagination
                          ? (currentPage - 1) * pageSize + rowIndex + 2
                          : undefined
                      }
                      role={isGrid ? 'row' : undefined}
                    >
                      {/* Selection checkbox */}
                      {selectable && (
                        <td
                          data-compa11y-datagrid-cell
                          data-compa11y-datagrid-select-cell
                          data-row={rowIndex}
                          data-col={0}
                          role={isGrid ? 'gridcell' : undefined}
                          tabIndex={
                            isGrid &&
                            focusedCell?.row === rowIndex &&
                            focusedCell?.col === 0
                              ? 0
                              : isGrid
                              ? -1
                              : undefined
                          }
                          style={{ width: '3rem' }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            aria-label={`Select ${rowLabel}`}
                            onChange={(e) =>
                              handleRowSelect(row.id, e.target.checked)
                            }
                            tabIndex={isGrid ? -1 : undefined}
                            style={{ cursor: 'pointer', minWidth: '18px', minHeight: '18px' }}
                          />
                        </td>
                      )}

                      {/* Data cells */}
                      {columns.map((col, colIdx) => {
                        const cellColIndex = selectable ? colIdx + 1 : colIdx;
                        const value = getCellValue(row, col.accessor);
                        const isFocused =
                          isGrid &&
                          focusedCell?.row === rowIndex &&
                          focusedCell?.col === cellColIndex;
                        const isEditing =
                          editingCell?.row === rowIndex &&
                          editingCell?.col === cellColIndex;

                        const cellContent = isEditing ? (
                          <input
                            type="text"
                            defaultValue={
                              value === null || value === undefined
                                ? ''
                                : String(value)
                            }
                            autoFocus
                            onBlur={() => stopEditing(true)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                stopEditing(true);
                              } else if (e.key === 'Escape') {
                                e.preventDefault();
                                stopEditing(false);
                              }
                              e.stopPropagation();
                            }}
                            aria-label={`Edit ${col.header} for ${rowLabel}`}
                            style={{
                              width: '100%',
                              border: '2px solid var(--compa11y-focus-color, #0066cc)',
                              padding: '0.25rem',
                              font: 'inherit',
                            }}
                          />
                        ) : col.cell ? (
                          col.cell(value, row)
                        ) : value === null || value === undefined ? (
                          ''
                        ) : (
                          String(value)
                        );

                        const CellTag = col.rowHeader ? 'th' : 'td';

                        return (
                          <CellTag
                            key={col.id}
                            scope={col.rowHeader ? 'row' : undefined}
                            data-compa11y-datagrid-cell
                            data-row={rowIndex}
                            data-col={cellColIndex}
                            data-editable={col.editable || undefined}
                            role={isGrid ? 'gridcell' : undefined}
                            tabIndex={isGrid ? (isFocused ? 0 : -1) : undefined}
                            style={{ textAlign: col.align }}
                            onClick={
                              isGrid
                                ? () => {
                                    setFocusedCell({
                                      row: rowIndex,
                                      col: cellColIndex,
                                    });
                                  }
                                : undefined
                            }
                            onDoubleClick={
                              isGrid && col.editable
                                ? () => startEditing(rowIndex, cellColIndex)
                                : undefined
                            }
                            onFocus={
                              isGrid
                                ? () =>
                                    setFocusedCell({
                                      row: rowIndex,
                                      col: cellColIndex,
                                    })
                                : undefined
                            }
                          >
                            {cellContent}
                          </CellTag>
                        );
                      })}

                      {/* Row actions */}
                      {hasActionsColumn && (
                        <td
                          data-compa11y-datagrid-cell
                          data-compa11y-datagrid-actions-cell
                          data-row={rowIndex}
                          data-col={totalColumns - 1}
                          role={isGrid ? 'gridcell' : undefined}
                          tabIndex={
                            isGrid &&
                            focusedCell?.row === rowIndex &&
                            focusedCell?.col === totalColumns - 1
                              ? 0
                              : isGrid
                              ? -1
                              : undefined
                          }
                        >
                          {renderRowActions!(row)}
                        </td>
                      )}
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {hasPagination && (
          <nav
            data-compa11y-datagrid-pagination
            aria-label={`${caption} pagination`}
          >
            <div data-compa11y-datagrid-pagination-info>
              {showingText}
            </div>

            {/* Page size selector */}
            {pageSizeOptions.length > 0 && (
              <div data-compa11y-datagrid-page-size>
                <label htmlFor={`${baseId}-page-size`}>Rows per page:</label>
                <select
                  id={`${baseId}-page-size`}
                  value={pageSize}
                  onChange={(e) =>
                    handlePageSizeChange(Number(e.target.value))
                  }
                >
                  {pageSizeOptions.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Page buttons */}
            <div data-compa11y-datagrid-page-buttons>
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                aria-label="Previous page"
              >
                Previous
              </button>

              {paginationRange.map((item, i) =>
                item === 'ellipsis' ? (
                  <span key={`ellipsis-${i}`} aria-hidden="true">
                    \u2026
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handlePageChange(item as number)}
                    aria-current={
                      item === currentPage ? 'page' : undefined
                    }
                    aria-label={`Page ${item}`}
                    data-compa11y-datagrid-page-active={
                      item === currentPage || undefined
                    }
                  >
                    {item}
                  </button>
                )
              )}

              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                aria-label="Next page"
              >
                Next
              </button>
            </div>
          </nav>
        )}

        {/* Live region for announcements */}
        <div
          id={statusId}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          style={{
            position: 'absolute',
            width: '1px',
            height: '1px',
            padding: 0,
            margin: '-1px',
            overflow: 'hidden',
            clip: 'rect(0,0,0,0)',
            whiteSpace: 'nowrap',
            border: 0,
          }}
        >
          {liveMessage}
        </div>
      </div>
    </DataGridProvider>
  );
}) as <T extends DataGridRowData = DataGridRowData>(
  props: DataGridProps<T> & { ref?: React.Ref<HTMLDivElement> }
) => React.ReactElement;

// ============================================================================
// DataGrid Toolbar (convenience sub-component)
// ============================================================================

export interface DataGridToolbarProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const DataGridToolbar = forwardRef<HTMLDivElement, DataGridToolbarProps>(
  function DataGridToolbar({ children, ...props }, ref) {
    return (
      <div ref={ref} data-compa11y-datagrid-toolbar-content {...props}>
        {children}
      </div>
    );
  }
);

// ============================================================================
// Compound Export
// ============================================================================

export const DataGridCompound = Object.assign(DataGrid, {
  Toolbar: DataGridToolbar,
});
