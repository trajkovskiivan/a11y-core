import React, {
  forwardRef,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { useId } from '../../hooks/use-id';
import { useAnnouncer } from '../../hooks/use-announcer';
import { useTypeAhead } from '../../hooks/use-keyboard';
import { createComponentWarnings } from '@compa11y/core';
import {
  TreeViewProvider,
  useTreeViewContext,
  type TreeViewContextValue,
  type TreeViewMode,
  type TreeViewSelectionMode,
  type TreeNodeData,
} from './tree-view-context';

const warn = createComponentWarnings('TreeView');

// ============================================================================
// Types
// ============================================================================

/** A flattened visible row used for keyboard navigation */
interface TreeRow {
  id: string;
  node: TreeNodeData;
  level: number;
  parentId: string | null;
  posInSet: number;
  setSize: number;
  isExpanded: boolean;
  isExpandable: boolean;
}

export interface TreeViewProps extends React.HTMLAttributes<HTMLElement> {
  /** Tree data */
  nodes: TreeNodeData[];
  /** Operating mode: navigation (semantic lists) or widget (ARIA tree) */
  mode?: TreeViewMode;
  /** Selection mode for widget mode */
  selectionMode?: TreeViewSelectionMode;
  /** Controlled expanded node IDs */
  expandedIds?: Set<string>;
  /** Default expanded node IDs (uncontrolled) */
  defaultExpandedIds?: Set<string>;
  /** Called when expanded nodes change */
  onExpandedChange?: (ids: Set<string>) => void;
  /** Controlled selected node IDs */
  selectedIds?: Set<string>;
  /** Default selected node IDs (uncontrolled) */
  defaultSelectedIds?: Set<string>;
  /** Called when selected nodes change */
  onSelectedChange?: (ids: Set<string>) => void;
  /** Called when a node is activated (Enter/click on label) */
  onActivate?: (node: TreeNodeData) => void;
  /** Lazy load children */
  onLoadChildren?: (node: TreeNodeData) => Promise<void>;
  /** Render a custom icon for a node */
  renderIcon?: (node: TreeNodeData) => React.ReactNode;
  /** Render custom actions for a node */
  renderActions?: (node: TreeNodeData) => React.ReactNode;
  /** Label for the tree (required for widget mode) */
  'aria-label'?: string;
  /** ID of element labelling the tree */
  'aria-labelledby'?: string;
  children?: React.ReactNode;
}

// ============================================================================
// Helpers
// ============================================================================

function flattenVisibleNodes(
  nodes: TreeNodeData[],
  expandedIds: Set<string>,
  parentId: string | null = null,
  level: number = 1
): TreeRow[] {
  const rows: TreeRow[] = [];
  const setSize = nodes.length;

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]!;
    const hasChildren =
      (node.children && node.children.length > 0) || !!node.hasChildren;
    const isExpanded = hasChildren && expandedIds.has(node.id);

    rows.push({
      id: node.id,
      node,
      level,
      parentId,
      posInSet: i + 1,
      setSize,
      isExpanded,
      isExpandable: hasChildren,
    });

    if (isExpanded && node.children && node.children.length > 0) {
      rows.push(
        ...flattenVisibleNodes(node.children, expandedIds, node.id, level + 1)
      );
    }
  }

  return rows;
}

function findNodeById(
  nodes: TreeNodeData[],
  id: string
): TreeNodeData | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

// ============================================================================
// Root — TreeView
// ============================================================================

export const TreeView = forwardRef<HTMLElement, TreeViewProps>(
  function TreeView(
    {
      nodes,
      mode = 'widget',
      selectionMode = 'none',
      expandedIds: controlledExpanded,
      defaultExpandedIds,
      onExpandedChange,
      selectedIds: controlledSelected,
      defaultSelectedIds,
      onSelectedChange,
      onActivate,
      onLoadChildren,
      renderIcon,
      renderActions,
      children,
      ...props
    },
    ref
  ) {
    const baseId = useId('tree-view');
    const { polite } = useAnnouncer();

    // -- Expanded state (controlled + uncontrolled) --
    const [uncontrolledExpanded, setUncontrolledExpanded] = useState<
      Set<string>
    >(() => defaultExpandedIds ?? new Set());

    const expandedIds = controlledExpanded ?? uncontrolledExpanded;

    const toggleExpanded = useCallback(
      (id: string) => {
        const next = new Set(expandedIds);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        if (controlledExpanded === undefined) {
          setUncontrolledExpanded(next);
        }
        onExpandedChange?.(next);
      },
      [expandedIds, controlledExpanded, onExpandedChange]
    );

    // -- Selected state (controlled + uncontrolled) --
    const [uncontrolledSelected, setUncontrolledSelected] = useState<
      Set<string>
    >(() => defaultSelectedIds ?? new Set());

    const selectedIds = controlledSelected ?? uncontrolledSelected;

    const selectNode = useCallback(
      (id: string) => {
        if (selectionMode === 'none') return;

        const node = findNodeById(nodes, id);
        if (node?.disabled) return;

        let next: Set<string>;
        if (selectionMode === 'single') {
          next = new Set([id]);
        } else {
          next = new Set(selectedIds);
          if (next.has(id)) {
            next.delete(id);
          } else {
            next.add(id);
          }
        }

        if (controlledSelected === undefined) {
          setUncontrolledSelected(next);
        }
        onSelectedChange?.(next);
      },
      [selectionMode, selectedIds, controlledSelected, onSelectedChange, nodes]
    );

    // -- Activation --
    const activateNode = useCallback(
      (id: string) => {
        const node = findNodeById(nodes, id);
        if (!node || node.disabled) return;
        onActivate?.(node);
      },
      [nodes, onActivate]
    );

    // -- Lazy loading --
    const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
    const [loadErrors, setLoadErrors] = useState<Map<string, string>>(
      new Map()
    );

    const isNodeLoading = useCallback(
      (id: string) => loadingIds.has(id),
      [loadingIds]
    );

    const getNodeError = useCallback(
      (id: string) => loadErrors.get(id) ?? null,
      [loadErrors]
    );

    const loadChildren = useCallback(
      (id: string) => {
        const node = findNodeById(nodes, id);
        if (!node || !onLoadChildren) return;

        setLoadingIds((prev) => new Set(prev).add(id));
        setLoadErrors((prev) => {
          const next = new Map(prev);
          next.delete(id);
          return next;
        });

        onLoadChildren(node)
          .then(() => {
            setLoadingIds((prev) => {
              const next = new Set(prev);
              next.delete(id);
              return next;
            });
          })
          .catch((err: Error) => {
            setLoadingIds((prev) => {
              const next = new Set(prev);
              next.delete(id);
              return next;
            });
            setLoadErrors((prev) =>
              new Map(prev).set(id, err.message || 'Failed to load')
            );
          });
      },
      [nodes, onLoadChildren]
    );

    // -- Focus (widget mode) --
    const [focusedId, setFocusedId] = useState<string | null>(null);

    // -- Visible rows --
    const visibleRows = useMemo(
      () => flattenVisibleNodes(nodes, expandedIds),
      [nodes, expandedIds]
    );

    // -- Type-ahead (widget mode) --
    const visibleLabels = useMemo(
      () => visibleRows.map((r) => r.node.label),
      [visibleRows]
    );

    const { onKeyDown: typeAheadKeyDown } = useTypeAhead(
      visibleLabels,
      (match) => {
        const row = visibleRows.find((r) => r.node.label === match);
        if (row) {
          setFocusedId(row.id);
          focusNode(row.id);
        }
      },
      { disabled: mode !== 'widget' }
    );

    // -- Focus helper --
    const treeRef = useRef<HTMLElement | null>(null);

    const focusNode = useCallback(
      (id: string) => {
        const el = treeRef.current?.querySelector(
          `[data-compa11y-tree-node-id="${id}"]`
        ) as HTMLElement | null;
        el?.focus();
      },
      []
    );

    // -- Widget mode keyboard --
    const handleWidgetKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLElement>) => {
        if (mode !== 'widget') return;

        typeAheadKeyDown(e);

        const currentIndex = visibleRows.findIndex(
          (r) => r.id === focusedId
        );
        if (currentIndex === -1 && visibleRows.length > 0) {
          // If nothing focused, focus first on any key
          if (
            ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)
          ) {
            e.preventDefault();
            const firstId = visibleRows[0]!.id;
            setFocusedId(firstId);
            focusNode(firstId);
          }
          return;
        }

        const currentRow = visibleRows[currentIndex];
        if (!currentRow) return;

        let handled = true;

        switch (e.key) {
          case 'ArrowDown': {
            // Move to next visible row, skipping disabled
            let nextIdx = currentIndex + 1;
            while (
              nextIdx < visibleRows.length &&
              visibleRows[nextIdx]!.node.disabled
            ) {
              nextIdx++;
            }
            if (nextIdx < visibleRows.length) {
              const nextId = visibleRows[nextIdx]!.id;
              setFocusedId(nextId);
              focusNode(nextId);
            }
            break;
          }
          case 'ArrowUp': {
            let prevIdx = currentIndex - 1;
            while (prevIdx >= 0 && visibleRows[prevIdx]!.node.disabled) {
              prevIdx--;
            }
            if (prevIdx >= 0) {
              const prevId = visibleRows[prevIdx]!.id;
              setFocusedId(prevId);
              focusNode(prevId);
            }
            break;
          }
          case 'ArrowRight': {
            if (currentRow.isExpandable && !currentRow.isExpanded) {
              // Expand
              const node = currentRow.node;
              if (
                node.hasChildren &&
                (!node.children || node.children.length === 0)
              ) {
                loadChildren(currentRow.id);
              }
              toggleExpanded(currentRow.id);
              polite('Expanded');
            } else if (currentRow.isExpanded) {
              // Focus first child
              const firstChild = visibleRows.find(
                (r) => r.parentId === currentRow.id
              );
              if (firstChild) {
                setFocusedId(firstChild.id);
                focusNode(firstChild.id);
              }
            } else {
              handled = false;
            }
            break;
          }
          case 'ArrowLeft': {
            if (currentRow.isExpanded) {
              // Collapse
              toggleExpanded(currentRow.id);
              polite('Collapsed');
            } else if (currentRow.parentId) {
              // Focus parent
              setFocusedId(currentRow.parentId);
              focusNode(currentRow.parentId);
            } else {
              handled = false;
            }
            break;
          }
          case 'Home': {
            const firstId = visibleRows[0]?.id;
            if (firstId) {
              setFocusedId(firstId);
              focusNode(firstId);
            }
            break;
          }
          case 'End': {
            const lastId = visibleRows[visibleRows.length - 1]?.id;
            if (lastId) {
              setFocusedId(lastId);
              focusNode(lastId);
            }
            break;
          }
          case 'Enter': {
            if (!currentRow.node.disabled) {
              activateNode(currentRow.id);
              // If node has href in navigation, let it handle naturally
            }
            break;
          }
          case ' ': {
            if (selectionMode !== 'none' && !currentRow.node.disabled) {
              selectNode(currentRow.id);
            } else {
              handled = false;
            }
            break;
          }
          case '*': {
            // Expand all siblings at the same level
            const siblings = visibleRows.filter(
              (r) =>
                r.parentId === currentRow.parentId &&
                r.level === currentRow.level &&
                r.isExpandable &&
                !r.isExpanded
            );
            if (siblings.length > 0) {
              const next = new Set(expandedIds);
              siblings.forEach((s) => next.add(s.id));
              if (controlledExpanded === undefined) {
                setUncontrolledExpanded(next);
              }
              onExpandedChange?.(next);
            }
            break;
          }
          default:
            handled = false;
        }

        if (handled) {
          e.preventDefault();
          e.stopPropagation();
        }
      },
      [
        mode,
        focusedId,
        visibleRows,
        expandedIds,
        selectionMode,
        toggleExpanded,
        selectNode,
        activateNode,
        loadChildren,
        focusNode,
        polite,
        typeAheadKeyDown,
        controlledExpanded,
        onExpandedChange,
      ]
    );

    // Dev warnings
    if (process.env.NODE_ENV !== 'production') {
      if (
        mode === 'widget' &&
        !props['aria-label'] &&
        !props['aria-labelledby']
      ) {
        warn.warning(
          'Widget mode TreeView requires an accessible label. Provide aria-label or aria-labelledby.',
          'Add aria-label="Files" to <TreeView>'
        );
      }
    }

    // -- Context --
    const contextValue: TreeViewContextValue = useMemo(
      () => ({
        mode,
        selectionMode,
        expandedIds,
        selectedIds,
        focusedId,
        baseId,
        toggleExpanded,
        selectNode,
        activateNode,
        setFocusedId,
        isNodeLoading,
        getNodeError,
        loadChildren,
        renderIcon,
        renderActions,
      }),
      [
        mode,
        selectionMode,
        expandedIds,
        selectedIds,
        focusedId,
        baseId,
        toggleExpanded,
        selectNode,
        activateNode,
        setFocusedId,
        isNodeLoading,
        getNodeError,
        loadChildren,
        renderIcon,
        renderActions,
      ]
    );

    // -- Render --
    const setRef = useCallback(
      (el: HTMLElement | null) => {
        treeRef.current = el;
        if (typeof ref === 'function') ref(el);
        else if (ref) (ref as React.MutableRefObject<HTMLElement | null>).current = el;
      },
      [ref]
    );

    if (mode === 'navigation') {
      return (
        <TreeViewProvider value={contextValue}>
          <nav
            ref={setRef as React.Ref<HTMLElement>}
            data-compa11y-tree-view
            data-mode="navigation"
            {...props}
          >
            <TreeNodeList nodes={nodes} level={1} parentId={null} />
            {children}
          </nav>
        </TreeViewProvider>
      );
    }

    // Widget mode
    return (
      <TreeViewProvider value={contextValue}>
        <div
          ref={setRef as React.Ref<HTMLDivElement>}
          role="tree"
          data-compa11y-tree-view
          data-mode="widget"
          onKeyDown={handleWidgetKeyDown}
          {...props}
        >
          <TreeNodeList nodes={nodes} level={1} parentId={null} />
          {children}
        </div>
      </TreeViewProvider>
    );
  }
);

// ============================================================================
// TreeNodeList — renders a list of nodes at a given level
// ============================================================================

interface TreeNodeListProps {
  nodes: TreeNodeData[];
  level: number;
  parentId: string | null;
}

function TreeNodeList({ nodes, level, parentId }: TreeNodeListProps) {
  const ctx = useTreeViewContext();
  const isRoot = parentId === null;

  if (ctx.mode === 'navigation') {
    const Tag = isRoot ? 'ul' : 'ul';
    return (
      <Tag
        role={isRoot ? 'list' : undefined}
        data-compa11y-tree-view-list
        data-level={level}
        id={
          parentId ? `${ctx.baseId}-group-${parentId}` : undefined
        }
      >
        {nodes.map((node, index) => (
          <TreeNodeNavigation
            key={node.id}
            node={node}
            level={level}
            parentId={parentId}
            posInSet={index + 1}
            setSize={nodes.length}
          />
        ))}
      </Tag>
    );
  }

  // Widget mode
  if (isRoot) {
    return (
      <>
        {nodes.map((node, index) => (
          <TreeNodeWidget
            key={node.id}
            node={node}
            level={level}
            parentId={parentId}
            posInSet={index + 1}
            setSize={nodes.length}
          />
        ))}
      </>
    );
  }

  return (
    <div
      role="group"
      id={`${ctx.baseId}-group-${parentId}`}
      data-compa11y-tree-view-group
    >
      {nodes.map((node, index) => (
        <TreeNodeWidget
          key={node.id}
          node={node}
          level={level}
          parentId={parentId}
          posInSet={index + 1}
          setSize={nodes.length}
        />
      ))}
    </div>
  );
}

// ============================================================================
// TreeNodeNavigation — a single node in navigation mode
// ============================================================================

interface TreeNodeProps {
  node: TreeNodeData;
  level: number;
  parentId: string | null;
  posInSet: number;
  setSize: number;
}

function TreeNodeNavigation({
  node,
  level,
}: TreeNodeProps) {
  const ctx = useTreeViewContext();
  const { polite } = useAnnouncer();
  const hasChildren =
    (node.children && node.children.length > 0) || !!node.hasChildren;
  const isExpanded = hasChildren && ctx.expandedIds.has(node.id);
  const isLoading = ctx.isNodeLoading(node.id);
  const loadError = ctx.getNodeError(node.id);
  const groupId = `${ctx.baseId}-group-${node.id}`;

  const handleToggle = useCallback(() => {
    if (node.disabled) return;
    if (
      node.hasChildren &&
      (!node.children || node.children.length === 0)
    ) {
      ctx.loadChildren(node.id);
    }
    ctx.toggleExpanded(node.id);
    polite(isExpanded ? 'Collapsed' : 'Expanded');
  }, [ctx, node, isExpanded, polite]);

  const handleActivate = useCallback(() => {
    if (node.disabled) return;
    ctx.activateNode(node.id);
  }, [ctx, node]);

  const icon = ctx.renderIcon?.(node);
  const actions = ctx.renderActions?.(node);

  return (
    <li
      data-compa11y-tree-view-node
      data-compa11y-tree-node-id={node.id}
      data-expanded={isExpanded || undefined}
      data-disabled={node.disabled || undefined}
      data-loading={isLoading || undefined}
      data-error={loadError ? 'true' : undefined}
      data-level={level}
    >
      <div data-compa11y-tree-view-row>
        {hasChildren && (
          <button
            type="button"
            data-compa11y-tree-view-toggle
            aria-expanded={isExpanded}
            aria-controls={groupId}
            aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${node.label}`}
            disabled={node.disabled}
            onClick={handleToggle}
          >
            <span aria-hidden="true">
              {isExpanded ? '\u25BE' : '\u25B8'}
            </span>
          </button>
        )}
        {!hasChildren && (
          <span
            data-compa11y-tree-view-spacer
            aria-hidden="true"
          />
        )}

        {icon && (
          <span data-compa11y-tree-view-icon aria-hidden="true">
            {icon}
          </span>
        )}

        {node.href ? (
          <a
            href={node.disabled ? undefined : node.href}
            data-compa11y-tree-view-label
            aria-current={
              ctx.selectedIds.has(node.id) ? 'page' : undefined
            }
            aria-disabled={node.disabled || undefined}
            tabIndex={node.disabled ? -1 : undefined}
            onClick={(e) => {
              if (node.disabled) {
                e.preventDefault();
                return;
              }
              handleActivate();
            }}
          >
            {node.label}
          </a>
        ) : (
          <span
            data-compa11y-tree-view-label
            onClick={handleActivate}
          >
            {node.label}
          </span>
        )}

        {actions && (
          <span data-compa11y-tree-view-actions>{actions}</span>
        )}
      </div>

      {isLoading && (
        <span
          data-compa11y-tree-view-loading
          aria-busy="true"
          role="status"
        >
          Loading…
        </span>
      )}

      {loadError && (
        <span data-compa11y-tree-view-error role="alert">
          {loadError}{' '}
          <button
            type="button"
            onClick={() => ctx.loadChildren(node.id)}
          >
            Retry
          </button>
        </span>
      )}

      {isExpanded && node.children && node.children.length > 0 && (
        <TreeNodeList
          nodes={node.children}
          level={level + 1}
          parentId={node.id}
        />
      )}
    </li>
  );
}

// ============================================================================
// TreeNodeWidget — a single node in widget mode (ARIA tree)
// ============================================================================

function TreeNodeWidget({
  node,
  level,
  posInSet,
  setSize,
}: TreeNodeProps) {
  const ctx = useTreeViewContext();
  const { polite } = useAnnouncer();
  const hasChildren =
    (node.children && node.children.length > 0) || !!node.hasChildren;
  const isExpanded = hasChildren && ctx.expandedIds.has(node.id);
  const isSelected = ctx.selectedIds.has(node.id);
  const isFocused = ctx.focusedId === node.id;
  const isLoading = ctx.isNodeLoading(node.id);
  const loadError = ctx.getNodeError(node.id);

  const handleFocus = useCallback(() => {
    ctx.setFocusedId(node.id);
  }, [ctx, node.id]);

  const handleClick = useCallback(() => {
    if (node.disabled) return;
    ctx.setFocusedId(node.id);
    if (hasChildren) {
      ctx.toggleExpanded(node.id);
      polite(isExpanded ? 'Collapsed' : 'Expanded');
    }
    if (ctx.selectionMode !== 'none') {
      ctx.selectNode(node.id);
    }
  }, [ctx, node, hasChildren, isExpanded, polite]);

  const handleToggleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (node.disabled) return;
      if (
        node.hasChildren &&
        (!node.children || node.children.length === 0)
      ) {
        ctx.loadChildren(node.id);
      }
      ctx.toggleExpanded(node.id);
      ctx.setFocusedId(node.id);
      polite(isExpanded ? 'Collapsed' : 'Expanded');
    },
    [ctx, node, isExpanded, polite]
  );

  const handleDoubleClick = useCallback(() => {
    if (node.disabled) return;
    ctx.activateNode(node.id);
  }, [ctx, node]);

  const icon = ctx.renderIcon?.(node);
  const actions = ctx.renderActions?.(node);

  return (
    <>
      <div
        role="treeitem"
        id={`${ctx.baseId}-node-${node.id}`}
        data-compa11y-tree-view-node
        data-compa11y-tree-node-id={node.id}
        tabIndex={isFocused ? 0 : -1}
        aria-expanded={hasChildren ? isExpanded : undefined}
        aria-selected={
          ctx.selectionMode !== 'none' ? isSelected : undefined
        }
        aria-disabled={node.disabled || undefined}
        aria-level={level}
        aria-setsize={setSize}
        aria-posinset={posInSet}
        aria-busy={isLoading || undefined}
        data-expanded={isExpanded || undefined}
        data-selected={isSelected || undefined}
        data-disabled={node.disabled || undefined}
        data-focused={isFocused || undefined}
        data-loading={isLoading || undefined}
        data-error={loadError ? 'true' : undefined}
        data-level={level}
        onFocus={handleFocus}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
      >
        {hasChildren && (
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            data-compa11y-tree-view-toggle
            onClick={handleToggleClick}
          >
            <span>{isExpanded ? '\u25BE' : '\u25B8'}</span>
          </button>
        )}
        {!hasChildren && (
          <span
            data-compa11y-tree-view-spacer
            aria-hidden="true"
          />
        )}

        {icon && (
          <span data-compa11y-tree-view-icon aria-hidden="true">
            {icon}
          </span>
        )}

        <span data-compa11y-tree-view-label>{node.label}</span>

        {isLoading && (
          <span
            data-compa11y-tree-view-loading
            aria-hidden="true"
          >
            Loading…
          </span>
        )}

        {loadError && (
          <span data-compa11y-tree-view-error aria-hidden="true">
            Error
          </span>
        )}

        {actions && (
          <span data-compa11y-tree-view-actions>{actions}</span>
        )}
      </div>

      {isExpanded && node.children && node.children.length > 0 && (
        <div
          role="group"
          id={`${ctx.baseId}-group-${node.id}`}
          data-compa11y-tree-view-group
        >
          {node.children.map((child, index) => (
            <TreeNodeWidget
              key={child.id}
              node={child}
              level={level + 1}
              parentId={node.id}
              posInSet={index + 1}
              setSize={node.children!.length}
            />
          ))}
        </div>
      )}
    </>
  );
}

// ============================================================================
// Compound Export
// ============================================================================

export const TreeViewCompound = TreeView;
