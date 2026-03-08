/**
 * Rich Text Editor — Engine-Agnostic Adapter Types
 *
 * These types define the contract between compa11y's RTE UI shell
 * and any underlying editor engine (Lexical, ProseMirror/Tiptap, Slate, etc.).
 *
 * compa11y owns: accessible structure, toolbar, dialogs, keyboard contracts, dev warnings
 * The adapter owns: editing behavior, selection, document model, serialization
 */

// ============================================================================
// Format & value types
// ============================================================================

/** Supported serialization formats */
export type RTEFormat = 'html' | 'json' | 'markdown';

/** Value type — string for HTML/Markdown, object for JSON document */
export type RTEValue = string | Record<string, unknown>;

// ============================================================================
// Mark & block types
// ============================================================================

/** Inline formatting marks */
export type RTEMark =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikethrough'
  | 'code';

/** Block-level formatting types */
export type RTEBlock =
  | 'paragraph'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'heading4'
  | 'heading5'
  | 'heading6'
  | 'blockquote'
  | 'bulletList'
  | 'numberList'
  | 'codeBlock';

// ============================================================================
// Selection state
// ============================================================================

/** Current selection/formatting state — toolbar reads this to reflect pressed states */
export interface RTESelectionState {
  /** Whether the selection is collapsed (caret, no range) */
  isCollapsed: boolean;
  /** Active inline marks at cursor/selection */
  marks: Partial<Record<RTEMark, boolean>>;
  /** Current block type at cursor */
  block: RTEBlock;
  /** Whether undo is available */
  canUndo: boolean;
  /** Whether redo is available */
  canRedo: boolean;
  /** Link context at cursor, if inside a link */
  link?: { href: string; text?: string } | null;
}

/** Default empty selection state */
export const EMPTY_SELECTION_STATE: RTESelectionState = {
  isCollapsed: true,
  marks: {},
  block: 'paragraph',
  canUndo: false,
  canRedo: false,
  link: null,
};

// ============================================================================
// Feature flags
// ============================================================================

/** Feature flags that control which toolbar controls are available */
export interface RTEFeatures {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  headings?: boolean;
  lists?: boolean;
  link?: boolean;
  code?: boolean;
  blockquote?: boolean;
  image?: boolean;
  table?: boolean;
}

/** Default feature set — common formatting only */
export const DEFAULT_RTE_FEATURES: RTEFeatures = {
  bold: true,
  italic: true,
  underline: true,
  strikethrough: false,
  headings: true,
  lists: true,
  link: true,
  code: true,
  blockquote: true,
  image: false,
  table: false,
};

// ============================================================================
// Adapter mount options
// ============================================================================

/** Options passed to the adapter when mounting the editor */
export interface RTEMountOptions {
  /** Whether the editor is read-only */
  readOnly: boolean;
  /** Whether the editor is disabled */
  disabled: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** ID of the element labelling the editor */
  ariaLabelledBy?: string;
  /** ID(s) of the element(s) describing the editor */
  ariaDescribedBy?: string;
  /** Called when the editor content changes */
  onChange: () => void;
  /** Called when the selection/format state changes */
  onSelectionChange: () => void;
  /** Called when the editor receives focus */
  onFocus?: () => void;
  /** Called when the editor loses focus */
  onBlur?: () => void;
}

// ============================================================================
// Adapter commands
// ============================================================================

/** Link insertion/edit options */
export interface RTELinkOptions {
  href: string;
  text?: string;
}

/** Image insertion options */
export interface RTEImageOptions {
  src: string;
  alt: string;
  title?: string;
}

/** Table insertion options */
export interface RTETableOptions {
  rows: number;
  cols: number;
}

/** Commands the adapter must implement */
export interface RTECommands {
  /** Focus the editor */
  focus: () => void;

  /** Undo last action */
  undo: () => void;
  /** Redo last undone action */
  redo: () => void;

  /** Toggle an inline mark (bold, italic, etc.) */
  toggleMark: (mark: RTEMark) => void;
  /** Set the current block type */
  setBlock: (block: RTEBlock) => void;

  /** Toggle bulleted list */
  toggleBulletList: () => void;
  /** Toggle numbered list */
  toggleNumberList: () => void;

  /** Indent current block */
  indent: () => void;
  /** Outdent current block */
  outdent: () => void;

  /** Insert or edit a link */
  insertOrEditLink: (opts: RTELinkOptions) => void;
  /** Remove the link at cursor */
  removeLink: () => void;

  /** Toggle code block */
  toggleCodeBlock: () => void;

  /** Insert an image (optional — adapter may not support) */
  insertImage?: (opts: RTEImageOptions) => void;

  /** Insert a table (optional — adapter may not support) */
  insertTable?: (opts: RTETableOptions) => void;

  /** Paste as plain text (optional) */
  pasteAsPlainText?: () => void;
}

// ============================================================================
// Adapter capabilities (runtime feature detection)
// ============================================================================

/** What the adapter actually supports at runtime */
export interface RTECapabilities {
  marks?: Partial<Record<RTEMark, boolean>>;
  blocks?: Partial<Record<RTEBlock, boolean>>;
  link?: boolean;
  image?: boolean;
  table?: boolean;
}

// ============================================================================
// The adapter interface
// ============================================================================

/**
 * RTEAdapter — the contract between compa11y's RTE shell and an editor engine.
 *
 * Implement this interface for each engine:
 *   - @compa11y/rte-lexical
 *   - @compa11y/rte-tiptap (or rte-prosemirror)
 *
 * The adapter is responsible for all editing behavior.
 * compa11y is responsible for the accessible UI shell around it.
 */
export interface RTEAdapter {
  // -- Lifecycle --

  /** Mount the editor into a DOM element. Returns an unmount function. */
  mount: (el: HTMLElement, opts: RTEMountOptions) => () => void;

  // -- State --

  /** Get the current selection/format state for toolbar UI */
  getSelectionState: () => RTESelectionState;

  // -- Value I/O --

  /** Get the current value in the specified format */
  getValue: (format: RTEFormat) => RTEValue;
  /** Set the editor value from the specified format */
  setValue: (value: RTEValue, format: RTEFormat) => void;

  // -- Validation helpers --

  /** Whether the editor is empty (no meaningful content) */
  isEmpty: () => boolean;
  /** Get the plain text content (for validation, char count, etc.) */
  getPlainText: () => string;
  /** Get the character count */
  getCharacterCount: () => number;

  // -- Commands --

  /** All editor commands (toggle marks, insert links, undo/redo, etc.) */
  commands: RTECommands;

  // -- Optional capabilities --

  /** Runtime feature detection — what the adapter actually supports */
  supports?: RTECapabilities;

  /** Optional HTML sanitizer (required if adapter outputs HTML) */
  sanitizeHtml?: (html: string) => string;
}

// ============================================================================
// Factory type (for creating adapters)
// ============================================================================

/** Configuration for creating an adapter */
export interface RTEAdapterConfig {
  /** Features to enable in the engine schema */
  features?: RTEFeatures;
  /** HTML sanitizer function */
  sanitizeHtml?: (html: string) => string;
  /** Custom configuration passed to the engine */
  engineConfig?: Record<string, unknown>;
}

/** Factory function type for creating an adapter */
export type RTEAdapterFactory = (config?: RTEAdapterConfig) => RTEAdapter;
