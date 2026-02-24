import React, {
  forwardRef,
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from 'react';
import { useId } from '../../hooks/use-id';
import { useAnnouncer } from '../../hooks/use-announcer';
import { createComponentWarnings } from '@compa11y/core';
import {
  TableProvider,
  TableSectionProvider,
  TableRowProvider,
  useTableContext,
  useTableSectionContext,
  useTableRowContext,
  type TableContextValue,
  type SortDirection,
} from './table-context';

const warn = createComponentWarnings('Table');

// ============================================================================
// Root — <table>
// ============================================================================

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  /**
   * Accessible name for the table, rendered as a `<caption>` element.
   * Required unless `aria-label` or `aria-labelledby` is provided.
   */
  caption?: string;
  /**
   * Hides the caption visually while keeping it accessible to screen readers.
   * @default false
   */
  captionHidden?: boolean;
  /**
   * Controlled sort column key. Pass `null` to clear sort.
   */
  sortKey?: string | null;
  /**
   * Direction of the controlled sort.
   * @default 'none'
   */
  sortDirection?: SortDirection;
  /**
   * Called when a sortable header is activated. Receives the column key and
   * new direction. Direction cycles: none → ascending → descending → none.
   */
  onSortChange?: (key: string | null, direction: SortDirection) => void;
  /**
   * Controlled array of selected row IDs.
   */
  selectedRows?: string[];
  /**
   * Default selected row IDs for uncontrolled usage.
   */
  defaultSelectedRows?: string[];
  /**
   * Called when row selection changes.
   */
  onSelectionChange?: (rows: string[]) => void;
  /**
   * When `true`, the table communicates a loading state via `aria-busy`.
   * @default false
   */
  isLoading?: boolean;
  children: React.ReactNode;
}

/**
 * Accessible data table component. Renders native semantic HTML table elements
 * with automatic ARIA wiring for sorting and selection.
 *
 * @example
 * ```tsx
 * <Table caption="Active users" sortKey={key} sortDirection={dir} onSortChange={handleSort}>
 *   <Table.Head>
 *     <Table.Row>
 *       <Table.Header sortKey="name">Name</Table.Header>
 *       <Table.Header>Role</Table.Header>
 *     </Table.Row>
 *   </Table.Head>
 *   <Table.Body>
 *     {users.map(u => (
 *       <Table.Row key={u.id} rowId={u.id}>
 *         <Table.Cell>{u.name}</Table.Cell>
 *         <Table.Cell>{u.role}</Table.Cell>
 *       </Table.Row>
 *     ))}
 *   </Table.Body>
 * </Table>
 * ```
 */
export const Table = forwardRef<HTMLTableElement, TableProps>(function Table(
  {
    caption,
    captionHidden = false,
    sortKey: controlledSortKey,
    sortDirection: controlledSortDirection,
    onSortChange,
    selectedRows: controlledSelected,
    defaultSelectedRows,
    onSelectionChange,
    isLoading = false,
    children,
    ...props
  },
  ref
) {
  const baseId = useId('table');
  const { announce } = useAnnouncer();

  // --- Sort state ---
  const [uncontrolledSortKey, setUncontrolledSortKey] = useState<string | null>(null);
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

      const dirLabel =
        newDir === 'none' ? 'sort cleared' : `sorted ${newDir}`;
      announce(`${key} ${dirLabel}`);
    },
    [sortKey, sortDirection, controlledSortKey, onSortChange, announce]
  );

  // --- Selection state ---
  const normalizedDefault = useMemo(
    () => new Set<string>(defaultSelectedRows ?? []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const [uncontrolledSelected, setUncontrolledSelected] =
    useState<Set<string>>(normalizedDefault);

  const selectedRows: Set<string> = useMemo(
    () =>
      controlledSelected !== undefined
        ? new Set(controlledSelected)
        : uncontrolledSelected,
    [controlledSelected, uncontrolledSelected]
  );

  const handleSelectionChange = useCallback(
    (rows: string[]) => {
      if (controlledSelected === undefined) {
        setUncontrolledSelected(new Set(rows));
      }
      onSelectionChange?.(rows);

      if (rows.length === 0) {
        announce('Selection cleared');
      } else {
        announce(`${rows.length} row${rows.length === 1 ? '' : 's'} selected`);
      }
    },
    [controlledSelected, onSelectionChange, announce]
  );

  // Dev warning: table must have an accessible name
  useEffect(() => {
    if (
      !caption &&
      !props['aria-label'] &&
      !props['aria-labelledby']
    ) {
      warn.warning(
        'Table must have an accessible name. Provide a caption prop, aria-label, or aria-labelledby.'
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const contextValue: TableContextValue = {
    baseId,
    sortKey: sortKey ?? null,
    sortDirection,
    onSort: handleSort,
    selectedRows,
    onSelectionChange: handleSelectionChange,
    isLoading,
  };

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

  return (
    <TableProvider value={contextValue}>
      <table
        ref={ref}
        data-compa11y-table
        aria-busy={isLoading || undefined}
        {...props}
      >
        {caption && (
          <caption style={captionStyle}>{caption}</caption>
        )}
        {children}
      </table>
    </TableProvider>
  );
});

// ============================================================================
// Head — <thead>
// ============================================================================

export interface TableHeadProps
  extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

/**
 * Wraps `<thead>`. Column headers inside are automatically assigned
 * `scope="col"`.
 */
export const TableHead = forwardRef<HTMLTableSectionElement, TableHeadProps>(
  function TableHead({ children, ...props }, ref) {
    return (
      <TableSectionProvider value={{ section: 'head' }}>
        <thead ref={ref} data-compa11y-table-head {...props}>
          {children}
        </thead>
      </TableSectionProvider>
    );
  }
);

// ============================================================================
// Body — <tbody>
// ============================================================================

export interface TableBodyProps
  extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

/**
 * Wraps `<tbody>`. Row headers inside (Table.Header) are automatically
 * assigned `scope="row"`.
 */
export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  function TableBody({ children, ...props }, ref) {
    return (
      <TableSectionProvider value={{ section: 'body' }}>
        <tbody ref={ref} data-compa11y-table-body {...props}>
          {children}
        </tbody>
      </TableSectionProvider>
    );
  }
);

// ============================================================================
// Foot — <tfoot>
// ============================================================================

export interface TableFootProps
  extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

/**
 * Wraps `<tfoot>`.
 */
export const TableFoot = forwardRef<HTMLTableSectionElement, TableFootProps>(
  function TableFoot({ children, ...props }, ref) {
    return (
      <TableSectionProvider value={{ section: 'foot' }}>
        <tfoot ref={ref} data-compa11y-table-foot {...props}>
          {children}
        </tfoot>
      </TableSectionProvider>
    );
  }
);

// ============================================================================
// Row — <tr>
// ============================================================================

export interface TableRowProps
  extends React.HTMLAttributes<HTMLTableRowElement> {
  /**
   * Unique identifier for this row. Required when using row selection
   * (Table.SelectCell / Table.SelectAllCell).
   */
  rowId?: string;
  children: React.ReactNode;
}

/**
 * Renders a `<tr>`. When `rowId` is supplied and the table is selectable,
 * `aria-selected` is applied automatically.
 */
export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  function TableRow({ rowId, children, ...props }, ref) {
    const { selectedRows } = useTableContext();
    const isSelected = rowId ? selectedRows.has(rowId) : false;
    const isSelectable = rowId !== undefined;

    return (
      <TableRowProvider value={{ rowId: rowId ?? null, isSelected }}>
        <tr
          ref={ref}
          data-compa11y-table-row
          data-selected={isSelected}
          aria-selected={isSelectable ? isSelected : undefined}
          {...props}
        >
          {children}
        </tr>
      </TableRowProvider>
    );
  }
);

// ============================================================================
// Header — <th>
// ============================================================================

export interface TableHeaderProps
  extends React.ThHTMLAttributes<HTMLTableCellElement> {
  /**
   * When provided, the header becomes a sort control. The column key is
   * passed to `onSortChange`. `aria-sort` and the sort button are managed
   * automatically — no consumer ARIA wiring needed.
   */
  sortKey?: string;
  /**
   * Override the auto-detected `scope` attribute.
   * - In `Table.Head`: defaults to `"col"`
   * - In `Table.Body` / `Table.Foot`: defaults to `"row"`
   */
  scope?: 'col' | 'row' | 'colgroup' | 'rowgroup';
  children?: React.ReactNode;
}

const SORT_ICONS: Record<SortDirection, string> = {
  ascending: '↑',
  descending: '↓',
  none: '↕',
};

/**
 * Renders a `<th>` with auto-applied `scope`. When `sortKey` is supplied,
 * a native `<button>` with correct `aria-sort` state is rendered inside the
 * header — no manual ARIA required.
 */
export const TableHeader = forwardRef<HTMLTableCellElement, TableHeaderProps>(
  function TableHeader({ sortKey, scope, children, ...props }, ref) {
    const { sortKey: activeSortKey, sortDirection, onSort } =
      useTableContext();
    const sectionCtx = useTableSectionContext();

    // Auto-detect scope from section context
    const resolvedScope =
      scope ??
      (sectionCtx?.section === 'head' || sectionCtx?.section === 'foot'
        ? 'col'
        : 'row');

    const isSortable = sortKey !== undefined && onSort !== null;
    const isActivelySorted = isSortable && activeSortKey === sortKey;
    const ariaSort: SortDirection | undefined = isSortable
      ? isActivelySorted
        ? sortDirection
        : 'none'
      : undefined;

    if (isSortable) {
      const sortIcon = isActivelySorted
        ? SORT_ICONS[sortDirection]
        : SORT_ICONS['none'];

      return (
        <th
          ref={ref}
          scope={resolvedScope}
          aria-sort={ariaSort}
          data-compa11y-table-header
          data-sortable="true"
          data-sort-key={sortKey}
          {...props}
        >
          <button
            type="button"
            data-compa11y-sort-key={sortKey}
            onClick={() => onSort(sortKey)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25em',
              background: 'none',
              border: 'none',
              padding: 0,
              margin: 0,
              font: 'inherit',
              color: 'inherit',
              cursor: 'pointer',
              textAlign: 'inherit',
              width: '100%',
            }}
          >
            {children}
            <span aria-hidden="true" style={{ fontSize: '0.75em', opacity: 0.7 }}>
              {sortIcon}
            </span>
          </button>
        </th>
      );
    }

    return (
      <th
        ref={ref}
        scope={resolvedScope}
        data-compa11y-table-header
        {...props}
      >
        {children}
      </th>
    );
  }
);

// ============================================================================
// Cell — <td>
// ============================================================================

export interface TableCellProps
  extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children?: React.ReactNode;
}

/**
 * Renders a `<td>` data cell. Use `Table.Header` for row-header cells.
 */
export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  function TableCell({ children, ...props }, ref) {
    return (
      <td ref={ref} data-compa11y-table-cell {...props}>
        {children}
      </td>
    );
  }
);

// ============================================================================
// SelectAllCell — <th> with "Select all" checkbox
// ============================================================================

export interface TableSelectAllCellProps
  extends React.ThHTMLAttributes<HTMLTableCellElement> {
  /**
   * All selectable row IDs. Used to compute `checked` / `indeterminate`
   * state and to pass the complete list to `onSelectionChange` when
   * "select all" is activated.
   */
  rowIds: string[];
}

/**
 * Renders a `<th scope="col">` containing a "Select all rows" checkbox.
 * Automatically manages checked and indeterminate states.
 * Must be placed inside `Table.Head > Table.Row`.
 */
export const TableSelectAllCell = forwardRef<
  HTMLTableCellElement,
  TableSelectAllCellProps
>(function TableSelectAllCell({ rowIds, ...props }, ref) {
  const { baseId, selectedRows, onSelectionChange } = useTableContext();
  const checkboxRef = useRef<HTMLInputElement>(null);

  const total = rowIds.length;
  const selected = rowIds.filter((id) => selectedRows.has(id)).length;
  const allSelected = total > 0 && selected === total;
  const someSelected = selected > 0 && selected < total;

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onSelectionChange) return;
    onSelectionChange(e.target.checked ? rowIds : []);
  };

  return (
    <th ref={ref} scope="col" data-compa11y-table-select-all {...props}>
      <input
        ref={checkboxRef}
        type="checkbox"
        id={`${baseId}-select-all`}
        checked={allSelected}
        aria-label="Select all rows"
        onChange={handleChange}
        style={{ cursor: 'pointer' }}
      />
    </th>
  );
});

// ============================================================================
// SelectCell — <td> with row selection checkbox
// ============================================================================

export interface TableSelectCellProps
  extends React.TdHTMLAttributes<HTMLTableCellElement> {
  /**
   * Accessible label for this checkbox, e.g. "Select Alice".
   * Required — a dev warning is shown in development if omitted.
   */
  label: string;
}

/**
 * Renders a `<td>` containing a row-selection checkbox.
 * Must be placed inside `Table.Body > Table.Row` that has a `rowId` prop.
 * The `label` prop is required for accessibility.
 */
export const TableSelectCell = forwardRef<
  HTMLTableCellElement,
  TableSelectCellProps
>(function TableSelectCell({ label, ...props }, ref) {
  const { baseId, selectedRows, onSelectionChange } = useTableContext();
  const rowCtx = useTableRowContext();
  const rowId = rowCtx?.rowId ?? null;
  const isSelected = rowCtx?.isSelected ?? false;

  useEffect(() => {
    if (!label) {
      warn.warning(
        'Table.SelectCell requires a label prop for accessibility, e.g. label="Select Alice"'
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onSelectionChange || !rowId) return;
    const current = Array.from(selectedRows);
    const next = e.target.checked
      ? [...current, rowId]
      : current.filter((id) => id !== rowId);
    onSelectionChange(next);
  };

  return (
    <td ref={ref} data-compa11y-table-select-cell {...props}>
      <input
        type="checkbox"
        id={rowId ? `${baseId}-select-${rowId}` : undefined}
        checked={isSelected}
        aria-label={label}
        onChange={handleChange}
        style={{ cursor: 'pointer' }}
      />
    </td>
  );
});

// ============================================================================
// EmptyState — full-width row shown when there is no data
// ============================================================================

export interface TableEmptyStateProps
  extends React.HTMLAttributes<HTMLTableRowElement> {
  /** Number of columns the empty cell should span */
  colSpan: number;
  children?: React.ReactNode;
}

/**
 * Renders a single full-width `<tr>` for empty-table states.
 * Place inside `Table.Body` in place of data rows.
 */
export const TableEmptyState = forwardRef<
  HTMLTableRowElement,
  TableEmptyStateProps
>(function TableEmptyState({ colSpan, children, ...props }, ref) {
  return (
    <tr ref={ref} data-compa11y-table-empty {...props}>
      <td
        colSpan={colSpan}
        data-compa11y-table-empty-cell
        style={{ textAlign: 'center', padding: '2rem 1rem' }}
      >
        {children ?? 'No results found'}
      </td>
    </tr>
  );
});

// ============================================================================
// LoadingState — full-width row shown while data is loading
// ============================================================================

export interface TableLoadingStateProps
  extends React.HTMLAttributes<HTMLTableRowElement> {
  /** Number of columns the loading cell should span */
  colSpan: number;
  children?: React.ReactNode;
}

/**
 * Renders a single full-width `<tr>` with `aria-busy="true"` for loading states.
 * Place inside `Table.Body` in place of data rows.
 */
export const TableLoadingState = forwardRef<
  HTMLTableRowElement,
  TableLoadingStateProps
>(function TableLoadingState({ colSpan, children, ...props }, ref) {
  return (
    <tr ref={ref} aria-busy="true" data-compa11y-table-loading {...props}>
      <td
        colSpan={colSpan}
        style={{ textAlign: 'center', padding: '2rem 1rem' }}
      >
        {children ?? 'Loading…'}
      </td>
    </tr>
  );
});

// ============================================================================
// Compound Export
// ============================================================================

export const TableCompound = Object.assign(Table, {
  Head: TableHead,
  Body: TableBody,
  Foot: TableFoot,
  Row: TableRow,
  Header: TableHeader,
  Cell: TableCell,
  SelectAllCell: TableSelectAllCell,
  SelectCell: TableSelectCell,
  EmptyState: TableEmptyState,
  LoadingState: TableLoadingState,
});
