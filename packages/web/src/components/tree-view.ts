/**
 * compa11y TreeView Web Component
 *
 * Supports two modes:
 * - mode="navigation" (default): Semantic nested lists in a <nav>
 * - mode="widget": ARIA tree widget with roving tabindex
 *
 * Usage (navigation mode):
 * <compa11y-tree-view aria-label="Files">
 *   <!-- nodes provided via JS property or JSON attribute -->
 * </compa11y-tree-view>
 *
 * Usage (widget mode):
 * <compa11y-tree-view mode="widget" aria-label="Files" selection-mode="single">
 * </compa11y-tree-view>
 *
 * Set nodes via JS:
 *   el.nodesData = [{ id: 'src', label: 'src', children: [...] }];
 *
 * Or via attribute (JSON):
 *   <compa11y-tree-view nodes='[{"id":"src","label":"src"}]'>
 */

import { announcePolite, createComponentWarnings } from '@compa11y/core';
import { Compa11yElement, defineElement } from '../utils/base-element';
import { BASE_STYLES, TREE_VIEW_STYLES } from '../utils/styles';

const warn = createComponentWarnings('Compa11yTreeView');

interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
  hasChildren?: boolean;
  disabled?: boolean;
  href?: string;
}

interface FlatRow {
  id: string;
  node: TreeNode;
  level: number;
  parentId: string | null;
  posInSet: number;
  setSize: number;
  isExpandable: boolean;
  isExpanded: boolean;
}

export class Compa11yTreeView extends Compa11yElement {
  private _nodes: TreeNode[] = [];
  private _expandedIds: Set<string> = new Set();
  private _selectedIds: Set<string> = new Set();
  private _focusedId: string | null = null;
  private _visibleRows: FlatRow[] = [];
  private _typeAheadBuffer = '';
  private _typeAheadTimer: ReturnType<typeof setTimeout> | null = null;

  static get observedAttributes() {
    return ['mode', 'selection-mode', 'nodes', 'aria-label', 'aria-labelledby'];
  }

  // -- Properties --

  get mode(): 'navigation' | 'widget' {
    return (this.getAttribute('mode') as 'navigation' | 'widget') || 'navigation';
  }
  set mode(v: string) {
    this.setAttribute('mode', v);
  }

  get selectionMode(): 'none' | 'single' | 'multiple' {
    return (this.getAttribute('selection-mode') as 'none' | 'single' | 'multiple') || 'none';
  }
  set selectionMode(v: string) {
    this.setAttribute('selection-mode', v);
  }

  get nodesData(): TreeNode[] {
    return this._nodes;
  }
  set nodesData(v: TreeNode[]) {
    this._nodes = v;
    this.rebuildTree();
  }

  get expandedIds(): Set<string> {
    return this._expandedIds;
  }

  get selectedIds(): Set<string> {
    return this._selectedIds;
  }

  // -- Lifecycle --

  protected setupAccessibility(): void {
    warn.checks.accessibleLabel(this, 'compa11y-tree-view');
    const nodesAttr = this.getAttribute('nodes');
    if (nodesAttr) {
      try {
        this._nodes = JSON.parse(nodesAttr);
      } catch {
        warn.error('Invalid JSON in "nodes" attribute');
      }
    }
  }

  protected render(): void {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }
    this.shadowRoot!.innerHTML = `
      <style>
        ${BASE_STYLES}
        ${TREE_VIEW_STYLES}
      </style>
      <div class="tree-root" part="root"></div>
      <div class="sr-only" role="status" aria-live="polite" aria-atomic="true"></div>
    `;
    this.rebuildTree();
  }

  protected setupEventListeners(): void {
    (this.shadowRoot as EventTarget)?.addEventListener('click', this.handleClick as EventListener);
    (this.shadowRoot as EventTarget)?.addEventListener('keydown', this.handleKeyDown as EventListener);
  }

  protected cleanupEventListeners(): void {
    (this.shadowRoot as EventTarget)?.removeEventListener('click', this.handleClick as EventListener);
    (this.shadowRoot as EventTarget)?.removeEventListener('keydown', this.handleKeyDown as EventListener);
  }

  protected onAttributeChange(name: string, _old: string | null, next: string | null): void {
    if (name === 'nodes' && next) {
      try {
        this._nodes = JSON.parse(next);
        this.rebuildTree();
      } catch {
        warn.error('Invalid JSON in "nodes" attribute');
      }
    }
    if (name === 'mode' || name === 'selection-mode') {
      this.rebuildTree();
    }
  }

  // -- Flatten visible rows --

  private flattenRows(): FlatRow[] {
    const rows: FlatRow[] = [];
    const walk = (
      nodes: TreeNode[],
      parentId: string | null,
      level: number
    ) => {
      const setSize = nodes.length;
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]!;
        const isExpandable =
          (node.children && node.children.length > 0) || !!node.hasChildren;
        const isExpanded = isExpandable && this._expandedIds.has(node.id);
        rows.push({
          id: node.id,
          node,
          level,
          parentId,
          posInSet: i + 1,
          setSize,
          isExpandable,
          isExpanded,
        });
        if (isExpanded && node.children) {
          walk(node.children, node.id, level + 1);
        }
      }
    };
    walk(this._nodes, null, 1);
    return rows;
  }

  // -- Render tree --

  private rebuildTree(): void {
    const root = this.shadowRoot?.querySelector('.tree-root');
    if (!root) return;

    this._visibleRows = this.flattenRows();

    if (this.mode === 'navigation') {
      this.renderNavigation(root);
    } else {
      this.renderWidget(root);
    }

    // Ensure focused ID is valid
    if (
      this.mode === 'widget' &&
      this._focusedId &&
      !this._visibleRows.find((r) => r.id === this._focusedId)
    ) {
      this._focusedId = this._visibleRows[0]?.id ?? null;
    }

    // If no focused ID, set first
    if (this.mode === 'widget' && !this._focusedId && this._visibleRows.length > 0) {
      this._focusedId = this._visibleRows[0]!.id;
    }
  }

  private renderNavigation(root: Element): void {
    root.innerHTML = '';
    const nav = document.createElement('nav');
    const ariaLabel = this.getAttribute('aria-label');
    const ariaLabelledby = this.getAttribute('aria-labelledby');
    if (ariaLabel) nav.setAttribute('aria-label', ariaLabel);
    if (ariaLabelledby) nav.setAttribute('aria-labelledby', ariaLabelledby);
    nav.setAttribute('data-compa11y-tree-view', '');
    nav.setAttribute('data-mode', 'navigation');

    const ul = this.buildNavList(this._nodes, null, 1);
    nav.appendChild(ul);
    root.appendChild(nav);
  }

  private buildNavList(
    nodes: TreeNode[],
    parentId: string | null,
    level: number
  ): HTMLUListElement {
    const ul = document.createElement('ul');
    ul.setAttribute('data-compa11y-tree-view-list', '');
    ul.setAttribute('data-level', String(level));
    if (parentId) {
      ul.id = `${this._id}-group-${parentId}`;
    }

    for (const node of nodes) {
      const li = document.createElement('li');
      li.setAttribute('data-compa11y-tree-view-node', '');
      li.setAttribute('data-compa11y-tree-node-id', node.id);
      li.setAttribute('data-level', String(level));

      const hasChildren =
        (node.children && node.children.length > 0) || !!node.hasChildren;
      const isExpanded = hasChildren && this._expandedIds.has(node.id);

      if (node.disabled) li.setAttribute('data-disabled', 'true');
      if (isExpanded) li.setAttribute('data-expanded', 'true');

      // Row
      const row = document.createElement('div');
      row.setAttribute('data-compa11y-tree-view-row', '');

      // Toggle button
      if (hasChildren) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.setAttribute('data-compa11y-tree-view-toggle', '');
        btn.setAttribute('aria-expanded', String(isExpanded));
        btn.setAttribute('aria-controls', `${this._id}-group-${node.id}`);
        btn.setAttribute(
          'aria-label',
          `${isExpanded ? 'Collapse' : 'Expand'} ${node.label}`
        );
        if (node.disabled) btn.disabled = true;
        btn.setAttribute('data-node-id', node.id);
        btn.innerHTML = `<span aria-hidden="true">${isExpanded ? '\u25BE' : '\u25B8'}</span>`;
        row.appendChild(btn);
      } else {
        const spacer = document.createElement('span');
        spacer.setAttribute('data-compa11y-tree-view-spacer', '');
        spacer.setAttribute('aria-hidden', 'true');
        row.appendChild(spacer);
      }

      // Label
      if (node.href && !node.disabled) {
        const a = document.createElement('a');
        a.href = node.href;
        a.textContent = node.label;
        a.setAttribute('data-compa11y-tree-view-label', '');
        a.setAttribute('data-node-id', node.id);
        if (this._selectedIds.has(node.id)) {
          a.setAttribute('aria-current', 'page');
        }
        row.appendChild(a);
      } else {
        const span = document.createElement('span');
        span.textContent = node.label;
        span.setAttribute('data-compa11y-tree-view-label', '');
        span.setAttribute('data-node-id', node.id);
        if (node.disabled) span.setAttribute('data-disabled', 'true');
        row.appendChild(span);
      }

      li.appendChild(row);

      // Children
      if (isExpanded && node.children && node.children.length > 0) {
        const childUl = this.buildNavList(
          node.children,
          node.id,
          level + 1
        );
        li.appendChild(childUl);
      }

      ul.appendChild(li);
    }

    return ul;
  }

  private renderWidget(root: Element): void {
    root.innerHTML = '';
    const tree = document.createElement('div');
    tree.setAttribute('role', 'tree');
    const ariaLabel = this.getAttribute('aria-label');
    const ariaLabelledby = this.getAttribute('aria-labelledby');
    if (ariaLabel) tree.setAttribute('aria-label', ariaLabel);
    if (ariaLabelledby) tree.setAttribute('aria-labelledby', ariaLabelledby);
    tree.setAttribute('data-compa11y-tree-view', '');
    tree.setAttribute('data-mode', 'widget');

    this.buildWidgetNodes(tree, this._nodes, null, 1);
    root.appendChild(tree);
  }

  private buildWidgetNodes(
    container: Element,
    nodes: TreeNode[],
    _parentId: string | null,
    level: number
  ): void {
    const setSize = nodes.length;

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]!;
      const hasChildren =
        (node.children && node.children.length > 0) || !!node.hasChildren;
      const isExpanded = hasChildren && this._expandedIds.has(node.id);
      const isSelected = this._selectedIds.has(node.id);
      const isFocused = this._focusedId === node.id;

      // Treeitem
      const item = document.createElement('div');
      item.setAttribute('role', 'treeitem');
      item.id = `${this._id}-node-${node.id}`;
      item.setAttribute('data-compa11y-tree-view-node', '');
      item.setAttribute('data-compa11y-tree-node-id', node.id);
      item.tabIndex = isFocused ? 0 : -1;
      item.setAttribute('aria-level', String(level));
      item.setAttribute('aria-setsize', String(setSize));
      item.setAttribute('aria-posinset', String(i + 1));

      if (hasChildren) {
        item.setAttribute('aria-expanded', String(isExpanded));
      }
      if (this.selectionMode !== 'none') {
        item.setAttribute('aria-selected', String(isSelected));
      }
      if (node.disabled) {
        item.setAttribute('aria-disabled', 'true');
        item.setAttribute('data-disabled', 'true');
      }
      if (isExpanded) item.setAttribute('data-expanded', 'true');
      if (isSelected) item.setAttribute('data-selected', 'true');
      if (isFocused) item.setAttribute('data-focused', 'true');
      item.setAttribute('data-level', String(level));

      // Toggle
      if (hasChildren) {
        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.tabIndex = -1;
        toggle.setAttribute('aria-hidden', 'true');
        toggle.setAttribute('data-compa11y-tree-view-toggle', '');
        toggle.setAttribute('data-node-id', node.id);
        toggle.innerHTML = `<span>${isExpanded ? '\u25BE' : '\u25B8'}</span>`;
        item.appendChild(toggle);
      } else {
        const spacer = document.createElement('span');
        spacer.setAttribute('data-compa11y-tree-view-spacer', '');
        spacer.setAttribute('aria-hidden', 'true');
        item.appendChild(spacer);
      }

      // Label
      const label = document.createElement('span');
      label.setAttribute('data-compa11y-tree-view-label', '');
      label.textContent = node.label;
      item.appendChild(label);

      container.appendChild(item);

      // Children group
      if (isExpanded && node.children && node.children.length > 0) {
        const group = document.createElement('div');
        group.setAttribute('role', 'group');
        group.id = `${this._id}-group-${node.id}`;
        group.setAttribute('data-compa11y-tree-view-group', '');
        this.buildWidgetNodes(group, node.children, node.id, level + 1);
        container.appendChild(group);
      }
    }
  }

  // -- Event handlers --

  private handleClick = (e: Event): void => {
    const target = e.target as HTMLElement;

    // Toggle button click
    const toggle = target.closest('[data-compa11y-tree-view-toggle]') as HTMLElement | null;
    if (toggle) {
      const nodeId = toggle.getAttribute('data-node-id');
      if (nodeId) {
        this.toggleNode(nodeId);
        return;
      }
    }

    // Label click (navigation mode)
    const label = target.closest('[data-compa11y-tree-view-label]') as HTMLElement | null;
    if (label && this.mode === 'navigation') {
      const nodeId = label.getAttribute('data-node-id');
      if (nodeId) {
        this.emit('compa11y-tree-view-activate', { nodeId });
      }
      return;
    }

    // Treeitem click (widget mode)
    const treeitem = target.closest('[role="treeitem"]') as HTMLElement | null;
    if (treeitem && this.mode === 'widget') {
      const nodeId = treeitem.getAttribute('data-compa11y-tree-node-id');
      if (!nodeId) return;

      const row = this._visibleRows.find((r) => r.id === nodeId);
      if (row?.node.disabled) return;

      this._focusedId = nodeId;

      if (row?.isExpandable) {
        this.toggleNode(nodeId);
      } else {
        this.updateFocusInPlace();
      }

      if (this.selectionMode !== 'none') {
        this.selectNode(nodeId);
      }
    }
  };

  private handleKeyDown = (e: Event): void => {
    if (this.mode !== 'widget') return;
    const event = e as KeyboardEvent;

    // Type-ahead
    if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
      this.handleTypeAhead(event.key);
      return;
    }

    const currentIndex = this._visibleRows.findIndex(
      (r) => r.id === this._focusedId
    );
    if (currentIndex === -1 && this._visibleRows.length > 0) {
      if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        this._focusedId = this._visibleRows[0]!.id;
        this.updateFocusInPlace();
      }
      return;
    }

    const currentRow = this._visibleRows[currentIndex];
    if (!currentRow) return;

    let handled = true;

    switch (event.key) {
      case 'ArrowDown': {
        let nextIdx = currentIndex + 1;
        while (
          nextIdx < this._visibleRows.length &&
          this._visibleRows[nextIdx]!.node.disabled
        ) {
          nextIdx++;
        }
        if (nextIdx < this._visibleRows.length) {
          this._focusedId = this._visibleRows[nextIdx]!.id;
          this.updateFocusInPlace();
        }
        break;
      }
      case 'ArrowUp': {
        let prevIdx = currentIndex - 1;
        while (prevIdx >= 0 && this._visibleRows[prevIdx]!.node.disabled) {
          prevIdx--;
        }
        if (prevIdx >= 0) {
          this._focusedId = this._visibleRows[prevIdx]!.id;
          this.updateFocusInPlace();
        }
        break;
      }
      case 'ArrowRight': {
        if (currentRow.isExpandable && !currentRow.isExpanded) {
          this._expandedIds.add(currentRow.id);
          this.rebuildTree();
          this.focusCurrentNode();
          announcePolite('Expanded');
          this.emit('compa11y-tree-view-expand', { nodeId: currentRow.id });
        } else if (currentRow.isExpanded && currentRow.node.children?.length) {
          const firstChildId = currentRow.node.children[0]!.id;
          this._focusedId = firstChildId;
          this.updateFocusInPlace();
        } else {
          handled = false;
        }
        break;
      }
      case 'ArrowLeft': {
        if (currentRow.isExpanded) {
          this._expandedIds.delete(currentRow.id);
          this.rebuildTree();
          this.focusCurrentNode();
          announcePolite('Collapsed');
          this.emit('compa11y-tree-view-collapse', { nodeId: currentRow.id });
        } else if (currentRow.parentId) {
          this._focusedId = currentRow.parentId;
          this.updateFocusInPlace();
        } else {
          handled = false;
        }
        break;
      }
      case 'Home': {
        this._focusedId = this._visibleRows[0]?.id ?? null;
        this.updateFocusInPlace();
        break;
      }
      case 'End': {
        this._focusedId =
          this._visibleRows[this._visibleRows.length - 1]?.id ?? null;
        this.updateFocusInPlace();
        break;
      }
      case 'Enter': {
        if (!currentRow.node.disabled) {
          this.emit('compa11y-tree-view-activate', { nodeId: currentRow.id });
        }
        break;
      }
      case ' ': {
        if (this.selectionMode !== 'none' && !currentRow.node.disabled) {
          this.selectNode(currentRow.id);
        } else {
          handled = false;
        }
        break;
      }
      case '*': {
        // Expand all siblings
        const siblings = this._visibleRows.filter(
          (r) =>
            r.parentId === currentRow.parentId &&
            r.level === currentRow.level &&
            r.isExpandable &&
            !r.isExpanded
        );
        if (siblings.length > 0) {
          siblings.forEach((s) => this._expandedIds.add(s.id));
          this.rebuildTree();
          this.focusCurrentNode();
        }
        break;
      }
      default:
        handled = false;
    }

    if (handled) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  private handleTypeAhead(char: string): void {
    if (this._typeAheadTimer) {
      clearTimeout(this._typeAheadTimer);
    }
    this._typeAheadBuffer += char.toLowerCase();
    this._typeAheadTimer = setTimeout(() => {
      this._typeAheadBuffer = '';
    }, 500);

    const currentIndex = this._visibleRows.findIndex(
      (r) => r.id === this._focusedId
    );

    // Search from current position forward, then wrap
    for (let offset = 1; offset <= this._visibleRows.length; offset++) {
      const idx = (currentIndex + offset) % this._visibleRows.length;
      const row = this._visibleRows[idx]!;
      if (
        !row.node.disabled &&
        row.node.label.toLowerCase().startsWith(this._typeAheadBuffer)
      ) {
        this._focusedId = row.id;
        this.updateFocusInPlace();
        return;
      }
    }
  }

  // -- Actions --

  private toggleNode(nodeId: string): void {
    const node = this.findNode(this._nodes, nodeId);
    if (!node || node.disabled) return;

    if (this._expandedIds.has(nodeId)) {
      this._expandedIds.delete(nodeId);
      announcePolite(`${node.label} collapsed`);
      this.emit('compa11y-tree-view-collapse', { nodeId });
    } else {
      this._expandedIds.add(nodeId);
      announcePolite(`${node.label} expanded`);
      this.emit('compa11y-tree-view-expand', { nodeId });
    }

    if (this.mode === 'widget') {
      this._focusedId = nodeId;
    }

    this.rebuildTree();
    if (this.mode === 'widget') {
      this.focusCurrentNode();
    }
  }

  private selectNode(nodeId: string): void {
    const node = this.findNode(this._nodes, nodeId);
    if (!node || node.disabled) return;

    if (this.selectionMode === 'single') {
      this._selectedIds = new Set([nodeId]);
    } else if (this.selectionMode === 'multiple') {
      if (this._selectedIds.has(nodeId)) {
        this._selectedIds.delete(nodeId);
      } else {
        this._selectedIds.add(nodeId);
      }
    }

    this.updateSelectionInPlace();
    this.emit('compa11y-tree-view-select', {
      nodeId,
      selectedIds: Array.from(this._selectedIds),
    });
  }

  /**
   * Update aria-selected and data-selected on existing DOM without rebuilding.
   */
  private updateSelectionInPlace(): void {
    if (!this.shadowRoot) return;
    const allItems = this.shadowRoot.querySelectorAll('[data-compa11y-tree-node-id]');
    allItems.forEach((el) => {
      const id = el.getAttribute('data-compa11y-tree-node-id');
      if (!id) return;
      const isSelected = this._selectedIds.has(id);
      if (this.selectionMode !== 'none') {
        el.setAttribute('aria-selected', String(isSelected));
      }
      if (isSelected) {
        el.setAttribute('data-selected', 'true');
      } else {
        el.removeAttribute('data-selected');
      }
    });
  }

  /**
   * Update tabIndex and data-focused on existing DOM without rebuilding.
   * Used for focus-only changes (ArrowUp/Down/Home/End/type-ahead).
   */
  private updateFocusInPlace(): void {
    if (!this._focusedId || !this.shadowRoot) return;
    // Remove focus from old node
    const allItems = this.shadowRoot.querySelectorAll('[data-compa11y-tree-node-id]');
    allItems.forEach((el) => {
      (el as HTMLElement).tabIndex = -1;
      el.removeAttribute('data-focused');
    });
    // Set focus on new node
    const target = this.shadowRoot.querySelector(
      `[data-compa11y-tree-node-id="${this._focusedId}"]`
    ) as HTMLElement | null;
    if (target) {
      target.tabIndex = 0;
      target.setAttribute('data-focused', 'true');
      target.focus();
    }
  }

  /**
   * After a full rebuildTree(), synchronously focus the current node.
   */
  private focusCurrentNode(): void {
    if (!this._focusedId) return;
    // Use microtask to run after current call stack (DOM is already built synchronously)
    queueMicrotask(() => {
      const el = this.shadowRoot?.querySelector(
        `[data-compa11y-tree-node-id="${this._focusedId}"]`
      ) as HTMLElement | null;
      el?.focus();
    });
  }

  private findNode(nodes: TreeNode[], id: string): TreeNode | null {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = this.findNode(node.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  // -- Public API --

  /** Expand a node */
  expand(nodeId: string): void {
    this._expandedIds.add(nodeId);
    this.rebuildTree();
  }

  /** Collapse a node */
  collapse(nodeId: string): void {
    this._expandedIds.delete(nodeId);
    this.rebuildTree();
  }

  /** Toggle a node */
  toggle(nodeId: string): void {
    this.toggleNode(nodeId);
  }

  /** Select a node */
  select(nodeId: string): void {
    this.selectNode(nodeId);
  }

  /** Expand all nodes */
  expandAll(): void {
    const walkAdd = (nodes: TreeNode[]) => {
      for (const node of nodes) {
        if (
          (node.children && node.children.length > 0) ||
          node.hasChildren
        ) {
          this._expandedIds.add(node.id);
        }
        if (node.children) walkAdd(node.children);
      }
    };
    walkAdd(this._nodes);
    this.rebuildTree();
  }

  /** Collapse all nodes */
  collapseAll(): void {
    this._expandedIds.clear();
    this.rebuildTree();
  }
}

defineElement('compa11y-tree-view', Compa11yTreeView);

export default Compa11yTreeView;
