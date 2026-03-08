import { createContext, useContext } from 'react';

// ============================================================================
// Types
// ============================================================================

export type SortDirection = 'ascending' | 'descending' | 'none';

export type DataGridMode = 'table' | 'grid';

export interface DataGridColumnDef<T = Record<string, unknown>> {
  /** Unique column identifier */
  id: string;
  /** Visible header text */
  header: string;
  /** Key on the row object to access cell value, or accessor function */
  accessor: keyof T | ((row: T) => unknown);
  /** Custom cell renderer */
  cell?: (value: unknown, row: T) => React.ReactNode;
  /** Whether this column is sortable */
  sortable?: boolean;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Column width (CSS value) */
  width?: string | number;
  /** Min column width for resizable columns */
  minWidth?: number;
  /** Whether column is resizable (grid mode only) */
  resizable?: boolean;
  /** Whether cells in this column are editable (grid mode only) */
  editable?: boolean;
  /** Override the aria-label for the sort button */
  headerAriaLabel?: string;
  /** Render this column as a row header (<th scope="row">) */
  rowHeader?: boolean;
}

export type DataGridRowData = {
  /** Stable unique row identifier — required */
  id: string;
};

// ============================================================================
// Context
// ============================================================================

export interface DataGridContextValue {
  /** Stable base ID for generating unique child element IDs */
  baseId: string;
  /** Table or grid mode */
  mode: DataGridMode;
  /** Column definitions */
  columns: DataGridColumnDef[];
  /** Currently sorted column key, or null if unsorted */
  sortKey: string | null;
  /** Sort direction for the active sorted column */
  sortDirection: SortDirection;
  /** Called when a sortable column header is activated */
  onSort: (key: string) => void;
  /** Set of currently selected row IDs */
  selectedRows: Set<string>;
  /** Called when selection changes */
  onSelectionChange: (rows: string[]) => void;
  /** Whether the grid is selectable */
  selectable: boolean;
  /** Whether the grid is in a loading state */
  isLoading: boolean;
  /** Grid-mode focused cell coordinates */
  focusedCell: { row: number; col: number } | null;
  /** Set focused cell in grid mode */
  setFocusedCell: (cell: { row: number; col: number } | null) => void;
  /** Whether a cell is currently being edited (grid mode) */
  editingCell: { row: number; col: number } | null;
  /** Start editing a cell */
  startEditing: (row: number, col: number) => void;
  /** Stop editing */
  stopEditing: (save?: boolean) => void;
  /** Total number of data columns (including selection column offset) */
  totalColumns: number;
}

const DataGridContext = createContext<DataGridContextValue | null>(null);

export function useDataGridContext(): DataGridContextValue {
  const ctx = useContext(DataGridContext);
  if (!ctx) {
    throw new Error(
      'DataGrid compound components must be used within a <DataGrid> component'
    );
  }
  return ctx;
}

export const DataGridProvider = DataGridContext.Provider;
