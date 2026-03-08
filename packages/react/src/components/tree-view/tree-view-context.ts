import { createContext, useContext } from 'react';

export type TreeViewMode = 'navigation' | 'widget';
export type TreeViewSelectionMode = 'none' | 'single' | 'multiple';

export interface TreeViewContextValue {
  /** Operating mode */
  mode: TreeViewMode;
  /** Selection mode */
  selectionMode: TreeViewSelectionMode;
  /** Currently expanded node IDs */
  expandedIds: Set<string>;
  /** Currently selected node IDs */
  selectedIds: Set<string>;
  /** The focused node ID (widget mode) */
  focusedId: string | null;
  /** Base ID for ARIA relationships */
  baseId: string;
  /** Toggle a node's expanded state */
  toggleExpanded: (id: string) => void;
  /** Select a node */
  selectNode: (id: string) => void;
  /** Activate a node (navigate/open) */
  activateNode: (id: string) => void;
  /** Set focused node (widget mode) */
  setFocusedId: (id: string | null) => void;
  /** Whether a node is loading children */
  isNodeLoading: (id: string) => boolean;
  /** Get load error for a node */
  getNodeError: (id: string) => string | null;
  /** Trigger lazy load for a node */
  loadChildren: (id: string) => void;
  /** Render icon callback */
  renderIcon?: (node: TreeNodeData) => React.ReactNode;
  /** Render actions callback */
  renderActions?: (node: TreeNodeData) => React.ReactNode;
}

export interface TreeNodeData {
  id: string;
  label: string;
  children?: TreeNodeData[];
  hasChildren?: boolean;
  disabled?: boolean;
  href?: string;
  data?: unknown;
}

const TreeViewContext = createContext<TreeViewContextValue | null>(null);

export function useTreeViewContext(): TreeViewContextValue {
  const context = useContext(TreeViewContext);
  if (!context) {
    throw new Error(
      'TreeView compound components must be used within a TreeView component'
    );
  }
  return context;
}

export const TreeViewProvider = TreeViewContext.Provider;
