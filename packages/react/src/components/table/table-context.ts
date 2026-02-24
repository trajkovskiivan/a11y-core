import { createContext, useContext } from 'react';

// ============================================================================
// Sort
// ============================================================================

export type SortDirection = 'ascending' | 'descending' | 'none';

// ============================================================================
// Table Root Context
// ============================================================================

export interface TableContextValue {
  /** Stable base ID for generating unique child element IDs */
  baseId: string;
  /** Currently sorted column key, or null if unsorted */
  sortKey: string | null;
  /** Sort direction for the active sorted column */
  sortDirection: SortDirection;
  /** Called when a sortable column header is activated */
  onSort: ((key: string) => void) | null;
  /** Set of currently selected row IDs */
  selectedRows: Set<string>;
  /** Called when selection changes; receives new array of selected IDs */
  onSelectionChange: ((rows: string[]) => void) | null;
  /** Whether the table is in a loading state */
  isLoading: boolean;
}

const TableContext = createContext<TableContextValue | null>(null);

export function useTableContext(): TableContextValue {
  const ctx = useContext(TableContext);
  if (!ctx) {
    throw new Error('Table compound components must be used within a <Table> component');
  }
  return ctx;
}

export const TableProvider = TableContext.Provider;

// ============================================================================
// Table Section Context (head / body / foot)
// ============================================================================

export type TableSection = 'head' | 'body' | 'foot';

export interface TableSectionContextValue {
  section: TableSection;
}

const TableSectionContext = createContext<TableSectionContextValue | null>(null);

export function useTableSectionContext(): TableSectionContextValue | null {
  return useContext(TableSectionContext);
}

export const TableSectionProvider = TableSectionContext.Provider;

// ============================================================================
// Table Row Context
// ============================================================================

export interface TableRowContextValue {
  /** The row's unique ID (required for selection) */
  rowId: string | null;
  /** Whether this row is currently selected */
  isSelected: boolean;
}

const TableRowContext = createContext<TableRowContextValue | null>(null);

export function useTableRowContext(): TableRowContextValue | null {
  return useContext(TableRowContext);
}

export const TableRowProvider = TableRowContext.Provider;
