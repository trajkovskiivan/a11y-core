import React, {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useId } from '../../hooks/use-id';
import { useAnnouncer } from '../../hooks/use-announcer';
import { createComponentWarnings } from '@compa11y/core';
import { Dialog, DialogTitle, DialogContent, DialogActions, DialogClose } from '../dialog';
import { Input } from '../input';
import type {
  RTEAdapter,
  RTEFeatures,
  RTEFormat,
  RTEMark,
  RTEBlock,
  RTESelectionState,
  RTEValue,
} from '@compa11y/core';
import { DEFAULT_RTE_FEATURES, EMPTY_SELECTION_STATE } from '@compa11y/core';
import {
  RichTextEditorProvider,
  useRichTextEditorContext,
  type RichTextEditorContextValue,
} from './rich-text-editor-context';

const warnings = createComponentWarnings('RichTextEditor');

// ============================================================================
// Root
// ============================================================================

export interface RichTextEditorProps {
  /** The editor engine adapter (Lexical, Tiptap, etc.) */
  adapter: RTEAdapter;
  /** Controlled value */
  value?: RTEValue;
  /** Uncontrolled default value */
  defaultValue?: RTEValue;
  /** Called when the editor content changes */
  onChange?: (value: RTEValue) => void;
  /** Serialization format */
  format?: RTEFormat;
  /** Visible label text */
  label?: string;
  /** Accessible label (if no visible label) */
  'aria-label'?: string;
  /** Description text */
  description?: string;
  /** Error message (makes field invalid when truthy) */
  errorMessage?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Whether the editor is disabled */
  disabled?: boolean;
  /** Whether the editor is read-only */
  readOnly?: boolean;
  /** Feature flags controlling which tools are available */
  features?: RTEFeatures;
  /** HTML sanitizer (required for HTML format in production) */
  sanitizeHtml?: (html: string) => string;
  /** Enable strict mode — upgrades some dev warnings to errors */
  strict?: boolean;
  /** Remove default styles */
  unstyled?: boolean;
  /** Custom class name */
  className?: string;
  /** Called when the editor receives focus */
  onFocus?: () => void;
  /** Called when the editor loses focus */
  onBlur?: () => void;
  children: React.ReactNode;
}

export function RichTextEditor({
  adapter,
  value: controlledValue,
  defaultValue,
  onChange,
  format = 'html',
  label,
  'aria-label': ariaLabel,
  description,
  errorMessage,
  required = false,
  disabled = false,
  readOnly = false,
  features: featuresProp,
  sanitizeHtml,
  strict = false,
  unstyled = false,
  className,
  onFocus,
  onBlur,
  children,
}: RichTextEditorProps) {
  const editorId = useId('rte');
  const labelId = useId('rte-label');
  const descriptionId = useId('rte-desc');
  const errorId = useId('rte-error');
  const toolbarId = useId('rte-toolbar');

  const features = { ...DEFAULT_RTE_FEATURES, ...featuresProp };
  const invalid = !!errorMessage;

  const [hasLabel, setHasLabel] = useState(false);
  const [hasDescription, setHasDescription] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [selectionState, setSelectionState] = useState<RTESelectionState>(EMPTY_SELECTION_STATE);

  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);

  // Track whether we've set the initial value
  const initialValueSet = useRef(false);

  // Set initial/default value
  useEffect(() => {
    if (initialValueSet.current) return;
    const initial = controlledValue ?? defaultValue;
    if (initial !== undefined) {
      adapter.setValue(initial, format);
    }
    initialValueSet.current = true;
  }, [adapter, controlledValue, defaultValue, format]);

  // Sync controlled value to adapter
  useEffect(() => {
    if (controlledValue === undefined) return;
    // Only sync if the adapter's current value differs
    const current = adapter.getValue(format);
    if (current !== controlledValue) {
      adapter.setValue(controlledValue, format);
    }
  }, [controlledValue, adapter, format]);

  // Handle content changes from the adapter
  const handleChange = useCallback(() => {
    if (onChange) {
      const value = adapter.getValue(format);
      onChange(value);
    }
  }, [adapter, format, onChange]);

  // Handle selection changes — update toolbar state
  const handleSelectionChange = useCallback(() => {
    setSelectionState(adapter.getSelectionState());
  }, [adapter]);

  // Command proxies (no-op if disabled/readOnly)
  const canEdit = !disabled && !readOnly;

  const toggleMark = useCallback(
    (mark: RTEMark) => { if (canEdit) adapter.commands.toggleMark(mark); },
    [adapter, canEdit]
  );

  const setBlock = useCallback(
    (block: RTEBlock) => { if (canEdit) adapter.commands.setBlock(block); },
    [adapter, canEdit]
  );

  const undo = useCallback(
    () => { if (canEdit) adapter.commands.undo(); },
    [adapter, canEdit]
  );

  const redo = useCallback(
    () => { if (canEdit) adapter.commands.redo(); },
    [adapter, canEdit]
  );

  const toggleBulletList = useCallback(
    () => { if (canEdit) adapter.commands.toggleBulletList(); },
    [adapter, canEdit]
  );

  const toggleNumberList = useCallback(
    () => { if (canEdit) adapter.commands.toggleNumberList(); },
    [adapter, canEdit]
  );

  const indent = useCallback(
    () => { if (canEdit) adapter.commands.indent(); },
    [adapter, canEdit]
  );

  const outdent = useCallback(
    () => { if (canEdit) adapter.commands.outdent(); },
    [adapter, canEdit]
  );

  const toggleCodeBlock = useCallback(
    () => { if (canEdit) adapter.commands.toggleCodeBlock(); },
    [adapter, canEdit]
  );

  const focusEditor = useCallback(
    () => { if (!disabled) adapter.commands.focus(); },
    [adapter, disabled]
  );

  const insertOrEditLink = useCallback(
    (opts: { href: string; text?: string }) => {
      if (canEdit) adapter.commands.insertOrEditLink(opts);
    },
    [adapter, canEdit]
  );

  const removeLink = useCallback(
    () => { if (canEdit) adapter.commands.removeLink(); },
    [adapter, canEdit]
  );

  const insertImage = useCallback(
    (opts: { src: string; alt: string; title?: string }) => {
      if (canEdit && adapter.commands.insertImage) {
        adapter.commands.insertImage(opts);
      }
    },
    [adapter, canEdit]
  );

  // Link dialog openers
  const openLinkDialog = useCallback(() => {
    if (canEdit && features.link) setLinkDialogOpen(true);
  }, [canEdit, features.link]);

  const closeLinkDialog = useCallback(() => {
    setLinkDialogOpen(false);
    // Return focus to editor after dialog closes
    requestAnimationFrame(() => adapter.commands.focus());
  }, [adapter]);

  const openImageDialog = useCallback(() => {
    if (canEdit && features.image) setImageDialogOpen(true);
  }, [canEdit, features.image]);

  const closeImageDialog = useCallback(() => {
    setImageDialogOpen(false);
    requestAnimationFrame(() => adapter.commands.focus());
  }, [adapter]);

  // ---- Dev warnings ----
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;

    const frameId = requestAnimationFrame(() => {
      // Missing label
      if (!label && !ariaLabel) {
        const msg = 'RichTextEditor has no accessible label. Add a "label" or "aria-label" prop.';
        if (strict) {
          warnings.error(msg, 'Use label="..." or aria-label="..."');
        } else {
          warnings.warning(msg, 'Use label="..." or aria-label="..."');
        }
      }

      // HTML format without sanitizer
      if (format === 'html' && !sanitizeHtml && !adapter.sanitizeHtml) {
        const msg = 'RichTextEditor uses HTML format without a sanitizer. XSS risk in production.';
        if (strict) {
          warnings.error(msg, 'Pass sanitizeHtml prop or configure adapter sanitizer.');
        } else {
          warnings.warning(msg, 'Pass sanitizeHtml prop or configure adapter sanitizer.');
        }
      }

      // Image feature without alt support
      if (features.image && !adapter.commands.insertImage) {
        const msg = 'Image feature enabled but adapter does not support insertImage command.';
        if (strict) {
          warnings.error(msg, 'Ensure adapter implements commands.insertImage.');
        } else {
          warnings.warning(msg, 'Ensure adapter implements commands.insertImage.');
        }
      }

      // Link feature check
      if (features.link && adapter.supports && adapter.supports.link === false) {
        warnings.warning(
          'Link feature enabled but adapter reports it is not supported.',
          'Disable features.link or use an adapter that supports links.'
        );
      }
    });

    return () => cancelAnimationFrame(frameId);
  }, [label, ariaLabel, format, sanitizeHtml, adapter, features, strict]);

  // Build aria-describedby from present parts
  const ariaDescribedBy = [
    hasDescription ? descriptionId : null,
    hasError && invalid ? errorId : null,
  ]
    .filter(Boolean)
    .join(' ') || undefined;

  const contextValue: RichTextEditorContextValue = {
    editorId,
    labelId,
    descriptionId,
    errorId,
    toolbarId,
    adapter,
    selectionState,
    features,
    format,
    disabled,
    readOnly,
    required,
    invalid,
    hasLabel,
    hasDescription,
    hasError,
    setHasLabel,
    setHasDescription,
    setHasError,
    toggleMark,
    setBlock,
    undo,
    redo,
    toggleBulletList,
    toggleNumberList,
    indent,
    outdent,
    toggleCodeBlock,
    focusEditor,
    linkDialogOpen,
    openLinkDialog,
    closeLinkDialog,
    insertOrEditLink,
    removeLink,
    imageDialogOpen,
    openImageDialog,
    closeImageDialog,
    insertImage,
    unstyled,
  };

  // Store callbacks in refs so the adapter mount can access latest versions
  const handleChangeRef = useRef(handleChange);
  handleChangeRef.current = handleChange;
  const handleSelectionChangeRef = useRef(handleSelectionChange);
  handleSelectionChangeRef.current = handleSelectionChange;
  const onFocusRef = useRef(onFocus);
  onFocusRef.current = onFocus;
  const onBlurRef = useRef(onBlur);
  onBlurRef.current = onBlur;

  // Store mount options in context for Content to use
  const mountOptionsRef = useRef({
    handleChangeRef,
    handleSelectionChangeRef,
    onFocusRef,
    onBlurRef,
    ariaDescribedBy,
  });
  mountOptionsRef.current = {
    handleChangeRef,
    handleSelectionChangeRef,
    onFocusRef,
    onBlurRef,
    ariaDescribedBy,
  };

  return (
    <RichTextEditorProvider value={contextValue}>
      <RichTextEditorMountContext.Provider value={mountOptionsRef}>
        <div
          data-compa11y-rte
          data-disabled={disabled || undefined}
          data-readonly={readOnly || undefined}
          data-invalid={invalid || undefined}
          className={className}
        >
          {/* Built-in label (if label prop is provided) */}
          {label && (
            <RTELabelInternal id={labelId} editorId={editorId} setHasLabel={setHasLabel}>
              {label}
              {required && <span aria-hidden="true" data-compa11y-rte-required> *</span>}
            </RTELabelInternal>
          )}

          {/* Built-in description (if description prop is provided) */}
          {description && (
            <RTEDescriptionInternal id={descriptionId} setHasDescription={setHasDescription}>
              {description}
            </RTEDescriptionInternal>
          )}

          {children}

          {/* Built-in error message (if errorMessage prop is provided) */}
          {errorMessage && (
            <RTEErrorInternal id={errorId} setHasError={setHasError}>
              {errorMessage}
            </RTEErrorInternal>
          )}
        </div>
      </RichTextEditorMountContext.Provider>
    </RichTextEditorProvider>
  );
}

// Internal context for passing mount refs to Content
const RichTextEditorMountContext = React.createContext<React.RefObject<{
  handleChangeRef: React.RefObject<() => void>;
  handleSelectionChangeRef: React.RefObject<() => void>;
  onFocusRef: React.RefObject<(() => void) | undefined>;
  onBlurRef: React.RefObject<(() => void) | undefined>;
  ariaDescribedBy: string | undefined;
}> | null>(null);

// ============================================================================
// Internal label/description/error (used when props are provided)
// ============================================================================

function RTELabelInternal({
  id,
  editorId,
  setHasLabel,
  children,
}: {
  id: string;
  editorId: string;
  setHasLabel: (v: boolean) => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    setHasLabel(true);
    return () => setHasLabel(false);
  }, [setHasLabel]);

  return (
    <label id={id} htmlFor={editorId} data-compa11y-rte-label>
      {children}
    </label>
  );
}

function RTEDescriptionInternal({
  id,
  setHasDescription,
  children,
}: {
  id: string;
  setHasDescription: (v: boolean) => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    setHasDescription(true);
    return () => setHasDescription(false);
  }, [setHasDescription]);

  return (
    <div id={id} data-compa11y-rte-description>
      {children}
    </div>
  );
}

function RTEErrorInternal({
  id,
  setHasError,
  children,
}: {
  id: string;
  setHasError: (v: boolean) => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    setHasError(true);
    return () => setHasError(false);
  }, [setHasError]);

  return (
    <div id={id} role="alert" data-compa11y-rte-error>
      {children}
    </div>
  );
}

// ============================================================================
// Toolbar
// ============================================================================

export interface RTEToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const RTEToolbar = forwardRef<HTMLDivElement, RTEToolbarProps>(
  function RTEToolbar({ children, ...props }, ref) {
    const ctx = useRichTextEditorContext('RichTextEditor.Toolbar');

    return (
      <div
        ref={ref}
        id={ctx.toolbarId}
        role="toolbar"
        aria-label={props['aria-label'] ?? 'Formatting'}
        aria-controls={ctx.editorId}
        data-compa11y-rte-toolbar
        data-disabled={ctx.disabled || ctx.readOnly || undefined}
        {...props}
      >
        {children}
      </div>
    );
  }
);

// ============================================================================
// Content (editor mounting point)
// ============================================================================

export interface RTEContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Placeholder text shown when the editor is empty */
  placeholder?: string;
}

export const RTEContent = forwardRef<HTMLDivElement, RTEContentProps>(
  function RTEContent({ placeholder, ...props }, ref) {
    const ctx = useRichTextEditorContext('RichTextEditor.Content');
    const mountRef = React.useContext(RichTextEditorMountContext);
    const containerRef = useRef<HTMLDivElement>(null);

    // Mount the adapter into the container div
    useEffect(() => {
      const el = containerRef.current;
      if (!el || !ctx.adapter) return;

      const opts = mountRef?.current;

      const unmount = ctx.adapter.mount(el, {
        readOnly: ctx.readOnly,
        disabled: ctx.disabled,
        placeholder,
        ariaLabelledBy: ctx.hasLabel ? ctx.labelId : undefined,
        ariaDescribedBy: opts?.ariaDescribedBy,
        onChange: () => opts?.handleChangeRef.current?.(),
        onSelectionChange: () => opts?.handleSelectionChangeRef.current?.(),
        onFocus: () => opts?.onFocusRef.current?.(),
        onBlur: () => opts?.onBlurRef.current?.(),
      });

      return unmount;
    }, [ctx.adapter, ctx.readOnly, ctx.disabled, ctx.labelId, ctx.hasLabel, placeholder, mountRef]);

    // Merge refs
    const setRefs = useCallback(
      (node: HTMLDivElement | null) => {
        (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      },
      [ref]
    );

    return (
      <div
        ref={setRefs}
        id={ctx.editorId}
        data-compa11y-rte-content
        data-disabled={ctx.disabled || undefined}
        data-readonly={ctx.readOnly || undefined}
        aria-invalid={ctx.invalid || undefined}
        aria-required={ctx.required || undefined}
        aria-disabled={ctx.disabled || undefined}
        aria-live="polite"
        aria-relevant="text"
        {...props}
      />
    );
  }
);

// ============================================================================
// Toolbar controls — Toggle buttons for marks
// ============================================================================

interface ToolbarToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

function createMarkToggle(mark: RTEMark, defaultLabel: string, defaultContent: string) {
  const Component = forwardRef<HTMLButtonElement, ToolbarToggleProps>(
    function MarkToggle({ children, onClick, ...props }, ref) {
      const ctx = useRichTextEditorContext(`RichTextEditor.${defaultLabel}`);
      const isActive = !!ctx.selectionState.marks[mark];
      const isDisabled = ctx.disabled || ctx.readOnly;

      const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        if (!e.defaultPrevented) {
          ctx.toggleMark(mark);
          // Return focus to editor after toolbar action
          requestAnimationFrame(() => ctx.focusEditor());
        }
      };

      return (
        <button
          ref={ref}
          type="button"
          role="button"
          aria-label={props['aria-label'] ?? defaultLabel}
          aria-pressed={isActive}
          disabled={isDisabled}
          onClick={handleClick}
          data-compa11y-rte-button
          data-compa11y-rte-button-mark={mark}
          data-active={isActive || undefined}
          tabIndex={0}
          {...props}
        >
          {children ?? defaultContent}
        </button>
      );
    }
  );
  Component.displayName = `RTE${defaultLabel}`;
  return Component;
}

export const RTEBold = createMarkToggle('bold', 'Bold', 'B');
export const RTEItalic = createMarkToggle('italic', 'Italic', 'I');
export const RTEUnderline = createMarkToggle('underline', 'Underline', 'U');
export const RTEStrike = createMarkToggle('strikethrough', 'Strikethrough', 'S');
export const RTECode = createMarkToggle('code', 'Code', '</>');

// ============================================================================
// Heading select
// ============================================================================

export interface RTEHeadingSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const RTEHeadingSelect = forwardRef<HTMLSelectElement, RTEHeadingSelectProps>(
  function RTEHeadingSelect(props, ref) {
    const ctx = useRichTextEditorContext('RichTextEditor.HeadingSelect');
    const isDisabled = ctx.disabled || ctx.readOnly;
    const currentBlock = ctx.selectionState.block;

    // Map current block to select value
    const selectValue = currentBlock.startsWith('heading') ? currentBlock : 'paragraph';

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value as RTEBlock;
      ctx.setBlock(value);
      requestAnimationFrame(() => ctx.focusEditor());
    };

    return (
      <select
        ref={ref}
        aria-label={props['aria-label'] ?? 'Text style'}
        value={selectValue}
        onChange={handleChange}
        disabled={isDisabled}
        data-compa11y-rte-heading-select
        tabIndex={0}
        {...props}
      >
        <option value="paragraph">Normal</option>
        <option value="heading1">Heading 1</option>
        <option value="heading2">Heading 2</option>
        <option value="heading3">Heading 3</option>
        <option value="heading4">Heading 4</option>
        <option value="heading5">Heading 5</option>
        <option value="heading6">Heading 6</option>
      </select>
    );
  }
);

// ============================================================================
// List buttons
// ============================================================================

export const RTEBulletedList = forwardRef<HTMLButtonElement, ToolbarToggleProps>(
  function RTEBulletedList({ children, onClick, ...props }, ref) {
    const ctx = useRichTextEditorContext('RichTextEditor.BulletedList');
    const isActive = ctx.selectionState.block === 'bulletList';
    const isDisabled = ctx.disabled || ctx.readOnly;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      if (!e.defaultPrevented) {
        ctx.toggleBulletList();
        requestAnimationFrame(() => ctx.focusEditor());
      }
    };

    return (
      <button
        ref={ref}
        type="button"
        aria-label={props['aria-label'] ?? 'Bulleted list'}
        aria-pressed={isActive}
        disabled={isDisabled}
        onClick={handleClick}
        data-compa11y-rte-button
        data-compa11y-rte-button-list="bullet"
        data-active={isActive || undefined}
        tabIndex={0}
        {...props}
      >
        {children ?? '• List'}
      </button>
    );
  }
);

export const RTENumberedList = forwardRef<HTMLButtonElement, ToolbarToggleProps>(
  function RTENumberedList({ children, onClick, ...props }, ref) {
    const ctx = useRichTextEditorContext('RichTextEditor.NumberedList');
    const isActive = ctx.selectionState.block === 'numberList';
    const isDisabled = ctx.disabled || ctx.readOnly;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      if (!e.defaultPrevented) {
        ctx.toggleNumberList();
        requestAnimationFrame(() => ctx.focusEditor());
      }
    };

    return (
      <button
        ref={ref}
        type="button"
        aria-label={props['aria-label'] ?? 'Numbered list'}
        aria-pressed={isActive}
        disabled={isDisabled}
        onClick={handleClick}
        data-compa11y-rte-button
        data-compa11y-rte-button-list="number"
        data-active={isActive || undefined}
        tabIndex={0}
        {...props}
      >
        {children ?? '1. List'}
      </button>
    );
  }
);

// ============================================================================
// Indent / Outdent
// ============================================================================

export const RTEIndent = forwardRef<HTMLButtonElement, ToolbarToggleProps>(
  function RTEIndent({ children, onClick, ...props }, ref) {
    const ctx = useRichTextEditorContext('RichTextEditor.Indent');
    const isDisabled = ctx.disabled || ctx.readOnly;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      if (!e.defaultPrevented) {
        ctx.indent();
        requestAnimationFrame(() => ctx.focusEditor());
      }
    };

    return (
      <button
        ref={ref}
        type="button"
        aria-label={props['aria-label'] ?? 'Indent'}
        disabled={isDisabled}
        onClick={handleClick}
        data-compa11y-rte-button
        data-compa11y-rte-button-action="indent"
        tabIndex={0}
        {...props}
      >
        {children ?? 'Indent'}
      </button>
    );
  }
);

export const RTEOutdent = forwardRef<HTMLButtonElement, ToolbarToggleProps>(
  function RTEOutdent({ children, onClick, ...props }, ref) {
    const ctx = useRichTextEditorContext('RichTextEditor.Outdent');
    const isDisabled = ctx.disabled || ctx.readOnly;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      if (!e.defaultPrevented) {
        ctx.outdent();
        requestAnimationFrame(() => ctx.focusEditor());
      }
    };

    return (
      <button
        ref={ref}
        type="button"
        aria-label={props['aria-label'] ?? 'Outdent'}
        disabled={isDisabled}
        onClick={handleClick}
        data-compa11y-rte-button
        data-compa11y-rte-button-action="outdent"
        tabIndex={0}
        {...props}
      >
        {children ?? 'Outdent'}
      </button>
    );
  }
);

// ============================================================================
// Blockquote
// ============================================================================

export const RTEBlockquote = forwardRef<HTMLButtonElement, ToolbarToggleProps>(
  function RTEBlockquote({ children, onClick, ...props }, ref) {
    const ctx = useRichTextEditorContext('RichTextEditor.Blockquote');
    const isActive = ctx.selectionState.block === 'blockquote';
    const isDisabled = ctx.disabled || ctx.readOnly;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      if (!e.defaultPrevented) {
        ctx.setBlock(isActive ? 'paragraph' : 'blockquote');
        requestAnimationFrame(() => ctx.focusEditor());
      }
    };

    return (
      <button
        ref={ref}
        type="button"
        aria-label={props['aria-label'] ?? 'Blockquote'}
        aria-pressed={isActive}
        disabled={isDisabled}
        onClick={handleClick}
        data-compa11y-rte-button
        data-compa11y-rte-button-block="blockquote"
        data-active={isActive || undefined}
        tabIndex={0}
        {...props}
      >
        {children ?? 'Quote'}
      </button>
    );
  }
);

// ============================================================================
// Code Block
// ============================================================================

export const RTECodeBlock = forwardRef<HTMLButtonElement, ToolbarToggleProps>(
  function RTECodeBlock({ children, onClick, ...props }, ref) {
    const ctx = useRichTextEditorContext('RichTextEditor.CodeBlock');
    const isActive = ctx.selectionState.block === 'codeBlock';
    const isDisabled = ctx.disabled || ctx.readOnly;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      if (!e.defaultPrevented) {
        ctx.toggleCodeBlock();
        requestAnimationFrame(() => ctx.focusEditor());
      }
    };

    return (
      <button
        ref={ref}
        type="button"
        aria-label={props['aria-label'] ?? 'Code block'}
        aria-pressed={isActive}
        disabled={isDisabled}
        onClick={handleClick}
        data-compa11y-rte-button
        data-compa11y-rte-button-block="codeBlock"
        data-active={isActive || undefined}
        tabIndex={0}
        {...props}
      >
        {children ?? 'Code Block'}
      </button>
    );
  }
);

// ============================================================================
// Undo / Redo
// ============================================================================

export const RTEUndo = forwardRef<HTMLButtonElement, ToolbarToggleProps>(
  function RTEUndo({ children, onClick, ...props }, ref) {
    const ctx = useRichTextEditorContext('RichTextEditor.Undo');
    const isDisabled = ctx.disabled || ctx.readOnly || !ctx.selectionState.canUndo;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      if (!e.defaultPrevented) {
        ctx.undo();
        requestAnimationFrame(() => ctx.focusEditor());
      }
    };

    return (
      <button
        ref={ref}
        type="button"
        aria-label={props['aria-label'] ?? 'Undo'}
        disabled={isDisabled}
        onClick={handleClick}
        data-compa11y-rte-button
        data-compa11y-rte-button-action="undo"
        tabIndex={0}
        {...props}
      >
        {children ?? 'Undo'}
      </button>
    );
  }
);

export const RTERedo = forwardRef<HTMLButtonElement, ToolbarToggleProps>(
  function RTERedo({ children, onClick, ...props }, ref) {
    const ctx = useRichTextEditorContext('RichTextEditor.Redo');
    const isDisabled = ctx.disabled || ctx.readOnly || !ctx.selectionState.canRedo;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      if (!e.defaultPrevented) {
        ctx.redo();
        requestAnimationFrame(() => ctx.focusEditor());
      }
    };

    return (
      <button
        ref={ref}
        type="button"
        aria-label={props['aria-label'] ?? 'Redo'}
        disabled={isDisabled}
        onClick={handleClick}
        data-compa11y-rte-button
        data-compa11y-rte-button-action="redo"
        tabIndex={0}
        {...props}
      >
        {children ?? 'Redo'}
      </button>
    );
  }
);

// ============================================================================
// Separator
// ============================================================================

export interface RTESeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

export const RTESeparator = forwardRef<HTMLDivElement, RTESeparatorProps>(
  function RTESeparator(props, ref) {
    return (
      <div
        ref={ref}
        role="separator"
        aria-orientation="vertical"
        data-compa11y-rte-separator
        {...props}
      />
    );
  }
);

// ============================================================================
// Link button (opens link dialog)
// ============================================================================

export const RTELink = forwardRef<HTMLButtonElement, ToolbarToggleProps>(
  function RTELink({ children, onClick, ...props }, ref) {
    const ctx = useRichTextEditorContext('RichTextEditor.Link');
    const hasLink = !!ctx.selectionState.link;
    const isDisabled = ctx.disabled || ctx.readOnly;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      if (!e.defaultPrevented) {
        ctx.openLinkDialog();
      }
    };

    return (
      <button
        ref={ref}
        type="button"
        aria-label={props['aria-label'] ?? (hasLink ? 'Edit link' : 'Insert link')}
        aria-pressed={hasLink}
        disabled={isDisabled}
        onClick={handleClick}
        data-compa11y-rte-button
        data-compa11y-rte-button-action="link"
        data-active={hasLink || undefined}
        tabIndex={0}
        {...props}
      >
        {children ?? 'Link'}
      </button>
    );
  }
);

// ============================================================================
// Link Dialog
// ============================================================================

export interface RTELinkDialogProps {
  /** Label for the URL input */
  urlLabel?: string;
  /** Label for the text input */
  textLabel?: string;
  /** Label for the cancel button */
  cancelLabel?: string;
  /** Label for the apply button */
  applyLabel?: string;
  /** Label for the remove button */
  removeLabel?: string;
  /** Remove default styles */
  unstyled?: boolean;
  /** Custom class name */
  className?: string;
}

export function RTELinkDialog({
  urlLabel = 'URL',
  textLabel = 'Link text',
  cancelLabel = 'Cancel',
  applyLabel = 'Apply',
  removeLabel = 'Remove link',
  unstyled: unstyledProp,
  className,
}: RTELinkDialogProps) {
  const ctx = useRichTextEditorContext('RichTextEditor.LinkDialog');
  const { announce } = useAnnouncer();

  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [urlError, setUrlError] = useState('');

  // Populate fields only when dialog first opens
  const prevOpen = useRef(false);
  useEffect(() => {
    if (ctx.linkDialogOpen && !prevOpen.current) {
      const link = ctx.selectionState.link;
      setUrl(link?.href ?? '');
      setText(link?.text ?? '');
      setUrlError('');
    }
    prevOpen.current = ctx.linkDialogOpen;
  }, [ctx.linkDialogOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pending action to execute after dialog closes and focus trap deactivates
  const pendingAction = useRef<(() => void) | null>(null);
  useEffect(() => {
    if (!ctx.linkDialogOpen && pendingAction.current) {
      const action = pendingAction.current;
      pendingAction.current = null;
      // Wait for focus trap deactivation, then execute
      requestAnimationFrame(() => {
        action();
      });
    }
  }, [ctx.linkDialogOpen]);

  const handleApply = () => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setUrlError('URL is required');
      return;
    }

    const isValid = /^(https?:\/\/|\/|#|mailto:|tel:)/.test(trimmedUrl) || !trimmedUrl.includes(' ');
    if (!isValid) {
      setUrlError('Please enter a valid URL');
      return;
    }

    // Auto-prepend https:// for bare domains (e.g. www.google.com → https://www.google.com)
    const normalizedUrl = /^(https?:\/\/|\/|#|mailto:|tel:)/.test(trimmedUrl)
      ? trimmedUrl
      : `https://${trimmedUrl}`;

    const linkText = text.trim() || undefined;
    // Schedule link insertion after dialog closes (focus trap must deactivate first)
    pendingAction.current = () => {
      ctx.insertOrEditLink({ href: normalizedUrl, text: linkText });
      announce('Link applied', { politeness: 'polite' });
    };
    ctx.closeLinkDialog();
  };

  const handleRemove = () => {
    pendingAction.current = () => {
      ctx.removeLink();
      announce('Link removed', { politeness: 'polite' });
    };
    ctx.closeLinkDialog();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleApply();
    }
  };

  const hasExistingLink = !!ctx.selectionState.link;

  return (
    <Dialog
      open={ctx.linkDialogOpen}
      onOpenChange={(open) => { if (!open) ctx.closeLinkDialog(); }}
      unstyled={unstyledProp ?? ctx.unstyled}
      className={className}
    >
      <DialogTitle data-compa11y-rte-link-dialog-title>
        {hasExistingLink ? 'Edit link' : 'Insert link'}
      </DialogTitle>

      <DialogContent data-compa11y-rte-link-dialog onKeyDown={handleKeyDown} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <Input
          label={urlLabel}
          type="url"
          value={url}
          onValueChange={(v) => { setUrl(v); setUrlError(''); }}
          error={urlError || undefined}
        />

        <Input
          label={textLabel}
          type="text"
          value={text}
          onValueChange={setText}
        />
      </DialogContent>

      <DialogActions data-compa11y-rte-link-dialog-actions>
        {hasExistingLink && (
          <button
            type="button"
            onClick={handleRemove}
            data-compa11y-rte-link-dialog-remove
            tabIndex={0}
          >
            {removeLabel}
          </button>
        )}
        <DialogClose data-compa11y-rte-link-dialog-cancel>
          {cancelLabel}
        </DialogClose>
        <button
          type="button"
          onClick={handleApply}
          data-compa11y-rte-link-dialog-apply
          tabIndex={0}
        >
          {applyLabel}
        </button>
      </DialogActions>
    </Dialog>
  );
}

// ============================================================================
// Image Dialog
// ============================================================================

export interface RTEImageDialogProps {
  /** Label for the src input */
  srcLabel?: string;
  /** Label for the alt text input */
  altLabel?: string;
  /** Label for the title input */
  titleLabel?: string;
  /** Label for the cancel button */
  cancelLabel?: string;
  /** Label for the insert button */
  insertLabel?: string;
  /** Remove default styles */
  unstyled?: boolean;
  /** Custom class name */
  className?: string;
}

export function RTEImageDialog({
  srcLabel = 'Image URL',
  altLabel = 'Alt text (required)',
  titleLabel = 'Title (optional)',
  cancelLabel = 'Cancel',
  insertLabel = 'Insert image',
  unstyled: unstyledProp,
  className,
}: RTEImageDialogProps) {
  const ctx = useRichTextEditorContext('RichTextEditor.ImageDialog');
  const { announce } = useAnnouncer();

  const [src, setSrc] = useState('');
  const [alt, setAlt] = useState('');
  const [title, setTitle] = useState('');
  const [srcError, setSrcError] = useState('');
  const [altError, setAltError] = useState('');

  // Reset fields when dialog opens
  const prevOpen = useRef(false);
  useEffect(() => {
    if (ctx.imageDialogOpen && !prevOpen.current) {
      setSrc('');
      setAlt('');
      setTitle('');
      setSrcError('');
      setAltError('');
    }
    prevOpen.current = ctx.imageDialogOpen;
  }, [ctx.imageDialogOpen]);

  // Pending action to execute after dialog closes
  const pendingAction = useRef<(() => void) | null>(null);
  useEffect(() => {
    if (!ctx.imageDialogOpen && pendingAction.current) {
      const action = pendingAction.current;
      pendingAction.current = null;
      requestAnimationFrame(() => {
        action();
      });
    }
  }, [ctx.imageDialogOpen]);

  const handleInsert = () => {
    let hasError = false;

    if (!src.trim()) {
      setSrcError('Image URL is required');
      hasError = true;
    }

    if (!alt.trim()) {
      setAltError('Alt text is required for accessibility');
      hasError = true;
    }

    if (hasError) return;

    const imgSrc = src.trim();
    const imgAlt = alt.trim();
    const imgTitle = title.trim() || undefined;
    pendingAction.current = () => {
      ctx.insertImage({ src: imgSrc, alt: imgAlt, title: imgTitle });
      announce('Image inserted', { politeness: 'polite' });
    };
    ctx.closeImageDialog();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleInsert();
    }
  };

  return (
    <Dialog
      open={ctx.imageDialogOpen}
      onOpenChange={(open) => { if (!open) ctx.closeImageDialog(); }}
      unstyled={unstyledProp ?? ctx.unstyled}
      className={className}
    >
      <DialogTitle data-compa11y-rte-image-dialog-title>
        Insert image
      </DialogTitle>

      <DialogContent data-compa11y-rte-image-dialog onKeyDown={handleKeyDown} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <Input
          label={srcLabel}
          type="url"
          value={src}
          onValueChange={(v) => { setSrc(v); setSrcError(''); }}
          error={srcError || undefined}
        />

        <Input
          label={altLabel}
          type="text"
          value={alt}
          onValueChange={(v) => { setAlt(v); setAltError(''); }}
          error={altError || undefined}
          required
        />

        <Input
          label={titleLabel}
          type="text"
          value={title}
          onValueChange={setTitle}
        />
      </DialogContent>

      <DialogActions data-compa11y-rte-image-dialog-actions>
        <DialogClose data-compa11y-rte-image-dialog-cancel>
          {cancelLabel}
        </DialogClose>
        <button
          type="button"
          onClick={handleInsert}
          data-compa11y-rte-image-dialog-insert
          tabIndex={0}
        >
          {insertLabel}
        </button>
      </DialogActions>
    </Dialog>
  );
}

// ============================================================================
// Footer
// ============================================================================

export interface RTEFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const RTEFooter = forwardRef<HTMLDivElement, RTEFooterProps>(
  function RTEFooter({ children, ...props }, ref) {
    return (
      <div ref={ref} data-compa11y-rte-footer {...props}>
        {children}
      </div>
    );
  }
);

// ============================================================================
// Character Count
// ============================================================================

export interface RTECharacterCountProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** Maximum character count (if specified, displays "current / max") */
  max?: number;
  /** Render function for custom display */
  children?: (count: number, max?: number) => React.ReactNode;
}

export const RTECharacterCount = forwardRef<HTMLSpanElement, RTECharacterCountProps>(
  function RTECharacterCount({ max, children: renderFn, ...props }, ref) {
    const ctx = useRichTextEditorContext('RichTextEditor.CharacterCount');
    const count = ctx.adapter?.getCharacterCount() ?? 0;
    const isOver = max !== undefined && count > max;

    return (
      <span
        ref={ref}
        aria-live="polite"
        aria-atomic="true"
        data-compa11y-rte-character-count
        data-over={isOver || undefined}
        {...props}
      >
        {renderFn
          ? renderFn(count, max)
          : max !== undefined
            ? `${count} / ${max}`
            : `${count}`}
      </span>
    );
  }
);

// ============================================================================
// Help Text (arbitrary footer content)
// ============================================================================

export interface RTEHelpTextProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const RTEHelpText = forwardRef<HTMLDivElement, RTEHelpTextProps>(
  function RTEHelpText({ children, ...props }, ref) {
    return (
      <div ref={ref} data-compa11y-rte-help-text {...props}>
        {children}
      </div>
    );
  }
);

// ============================================================================
// Compound export
// ============================================================================

export const RichTextEditorCompound = Object.assign(RichTextEditor, {
  Toolbar: RTEToolbar,
  Content: RTEContent,
  Bold: RTEBold,
  Italic: RTEItalic,
  Underline: RTEUnderline,
  Strike: RTEStrike,
  Code: RTECode,
  CodeBlock: RTECodeBlock,
  HeadingSelect: RTEHeadingSelect,
  BulletedList: RTEBulletedList,
  NumberedList: RTENumberedList,
  Indent: RTEIndent,
  Outdent: RTEOutdent,
  Blockquote: RTEBlockquote,
  Link: RTELink,
  Undo: RTEUndo,
  Redo: RTERedo,
  Separator: RTESeparator,
  LinkDialog: RTELinkDialog,
  ImageDialog: RTEImageDialog,
  Footer: RTEFooter,
  CharacterCount: RTECharacterCount,
  HelpText: RTEHelpText,
});
