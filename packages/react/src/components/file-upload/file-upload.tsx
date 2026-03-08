/**
 * FileUpload Component
 *
 * An accessible file upload component that supports keyboard-triggered file
 * selection, optional drag-and-drop, a semantic file list with per-file
 * remove buttons, and screen reader announcements.
 *
 * Type 3 (Compound) + Type 2 (Stateful)
 *
 * @example
 * // Basic usage
 * <FileUpload label="Upload resume" accept=".pdf,.docx">
 *   <FileUpload.Trigger>Choose file</FileUpload.Trigger>
 *   <FileUpload.Description>PDF or DOCX, max 5MB</FileUpload.Description>
 *   <FileUpload.FileList>
 *     {(files) => files.map(f => <FileUpload.FileItem key={f.id} file={f} />)}
 *   </FileUpload.FileList>
 *   <FileUpload.Error />
 * </FileUpload>
 *
 * @example
 * // With dropzone
 * <FileUpload accept="image/*" multiple maxFiles={5} maxSizeBytes={5_000_000}>
 *   <FileUpload.Label>Upload images</FileUpload.Label>
 *   <FileUpload.Dropzone>
 *     Drag images here or click to browse
 *   </FileUpload.Dropzone>
 *   <FileUpload.Description>PNG, JPG or GIF. Max 5MB each, up to 5 files.</FileUpload.Description>
 *   <FileUpload.FileList>
 *     {(files) => files.map(f => <FileUpload.FileItem key={f.id} file={f} />)}
 *   </FileUpload.FileList>
 *   <FileUpload.Error />
 * </FileUpload>
 */

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useId } from '../../hooks/use-id';
import { useAnnouncer } from '../../hooks/use-announcer';
import { createComponentWarnings } from '@compa11y/core';
import {
  FileUploadProvider,
  useFileUploadContext,
  type FileUploadFile,
  type FileUploadContextValue,
} from './file-upload-context';

const warnings = createComponentWarnings('FileUpload');

// =============================================================================
// Helpers
// =============================================================================

let fileIdCounter = 0;

function generateFileId(): string {
  return `file-${++fileIdCounter}-${Date.now()}`;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} bytes`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function matchesAccept(file: File, accept: string): boolean {
  const tokens = accept.split(',').map(t => t.trim().toLowerCase());
  const fileType = file.type.toLowerCase();
  const fileExt = '.' + (file.name.split('.').pop()?.toLowerCase() ?? '');

  return tokens.some(token => {
    if (token.startsWith('.')) return fileExt === token;
    if (token.endsWith('/*'))
      return fileType.startsWith(token.replace('/*', '/'));
    return fileType === token;
  });
}

// =============================================================================
// Root Component
// =============================================================================

export interface FileUploadProps {
  /** Controlled file list */
  files?: FileUploadFile[];
  /** Called when the file list changes */
  onFilesChange?: (files: FileUploadFile[]) => void;
  /** Initial file list for uncontrolled usage */
  defaultFiles?: FileUploadFile[];
  /** Accepted file types (e.g. ".pdf,.png,image/*") */
  accept?: string;
  /** Allow multiple file selection (default: false) */
  multiple?: boolean;
  /** Maximum number of files */
  maxFiles?: number;
  /** Maximum file size in bytes */
  maxSizeBytes?: number;
  /** Function to upload a file; when provided, files auto-upload on add */
  uploadFn?: (file: File) => Promise<void>;
  /** Called when files are successfully added */
  onFileAdd?: (files: FileUploadFile[]) => void;
  /** Called when a file is removed */
  onFileRemove?: (file: FileUploadFile) => void;
  /** Called when a file fails validation or upload */
  onFileError?: (file: FileUploadFile, error: string) => void;
  /** Disables the component */
  disabled?: boolean;
  /** Marks the field as required */
  required?: boolean;
  /** Name attribute for the hidden file input (form submission) */
  name?: string;
  /** Visible label (alternative to FileUpload.Label sub-component) */
  label?: string;
  /** Accessible label when no visible label is rendered */
  'aria-label'?: string;
  /** ID of external element that labels this component */
  'aria-labelledby'?: string;
  /** External error message (overrides internal validation errors) */
  error?: string;
  /** Remove built-in styles for full customization */
  unstyled?: boolean;
  /** Custom class name */
  className?: string;
  children: React.ReactNode;
}

export function FileUpload({
  files: controlledFiles,
  onFilesChange,
  defaultFiles = [],
  accept,
  multiple = false,
  maxFiles,
  maxSizeBytes,
  uploadFn,
  onFileAdd,
  onFileRemove,
  onFileError,
  disabled = false,
  required = false,
  name,
  label,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  error: externalError,
  unstyled = false,
  className = '',
  children,
}: FileUploadProps) {
  // ── IDs ──────────────────────────────────────────────────────────────────
  const baseId = useId('file-upload');
  const labelId = `${baseId}-label`;
  const descriptionId = `${baseId}-desc`;
  const errorId = `${baseId}-error`;
  const inputId = `${baseId}-input`;

  // ── Refs ─────────────────────────────────────────────────────────────────
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // ── Controlled / Uncontrolled ────────────────────────────────────────────
  const [uncontrolledFiles, setUncontrolledFiles] =
    useState<FileUploadFile[]>(defaultFiles);
  const files = controlledFiles ?? uncontrolledFiles;

  // ── Presence tracking ────────────────────────────────────────────────────
  const [hasLabel, setHasLabel] = useState(false);
  const [hasDescription, setHasDescription] = useState(false);
  const [hasError, setHasError] = useState(false);

  // ── Drag state ───────────────────────────────────────────────────────────
  const [isDragOver, setIsDragOver] = useState(false);

  // ── Internal validation error ────────────────────────────────────────────
  const [internalError, setInternalError] = useState<string | undefined>();

  // ── Announcer ────────────────────────────────────────────────────────────
  const { polite, assertive } = useAnnouncer();

  // ── Update files helper ──────────────────────────────────────────────────
  const setFiles = useCallback(
    (newFiles: FileUploadFile[]) => {
      if (controlledFiles === undefined) setUncontrolledFiles(newFiles);
      onFilesChange?.(newFiles);
    },
    [controlledFiles, onFilesChange]
  );

  // ── Update a single file's status ────────────────────────────────────────
  const updateFileStatus = useCallback(
    (
      fileId: string,
      status: FileUploadFile['status'],
      error?: string
    ) => {
      const updater = (prev: FileUploadFile[]) =>
        prev.map(f =>
          f.id === fileId ? { ...f, status, error } : f
        );

      if (controlledFiles === undefined) {
        setUncontrolledFiles(updater);
      }
      // For controlled mode, let the parent handle status updates via onFilesChange
      onFilesChange?.(updater(files));
    },
    [controlledFiles, files, onFilesChange]
  );

  // ── Upload a single file ─────────────────────────────────────────────────
  const uploadFile = useCallback(
    async (fileItem: FileUploadFile) => {
      if (!uploadFn) return;

      updateFileStatus(fileItem.id, 'uploading');
      polite(`Uploading ${fileItem.file.name}`);

      try {
        await uploadFn(fileItem.file);
        updateFileStatus(fileItem.id, 'complete');
        polite(`${fileItem.file.name} upload complete`);
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : 'Upload failed';
        updateFileStatus(fileItem.id, 'error', errorMsg);
        assertive(`${fileItem.file.name} upload failed: ${errorMsg}`);
        onFileError?.(fileItem, errorMsg);
      }
    },
    [uploadFn, updateFileStatus, polite, assertive, onFileError]
  );

  // ── Add files (validation + state update) ────────────────────────────────
  const addFiles = useCallback(
    (fileList: FileList | File[]) => {
      const incoming = Array.from(fileList);
      const accepted: FileUploadFile[] = [];
      const errors: string[] = [];

      for (const file of incoming) {
        // Type check
        if (accept && !matchesAccept(file, accept)) {
          errors.push(`${file.name}: File type not accepted`);
          continue;
        }
        // Size check
        if (maxSizeBytes && file.size > maxSizeBytes) {
          errors.push(
            `${file.name}: File exceeds maximum size (${formatFileSize(maxSizeBytes)})`
          );
          continue;
        }
        // Count check
        if (maxFiles && files.length + accepted.length >= maxFiles) {
          errors.push(
            `Maximum number of files exceeded (${maxFiles})`
          );
          break;
        }

        accepted.push({
          id: generateFileId(),
          file,
          status: 'pending',
        });
      }

      if (errors.length > 0) {
        const errMsg = errors.join('. ');
        setInternalError(errMsg);
        assertive(errMsg);
      } else {
        setInternalError(undefined);
      }

      if (accepted.length > 0) {
        const first = accepted[0]!;
        const newFiles: FileUploadFile[] = multiple
          ? [...files, ...accepted]
          : [first];
        setFiles(newFiles);
        onFileAdd?.(accepted);

        // Announcement
        if (accepted.length === 1) {
          polite(`${first.file.name} added`);
        } else {
          polite(`${accepted.length} files added`);
        }

        // Auto-upload if uploadFn provided
        if (uploadFn) {
          for (const f of accepted) {
            uploadFile(f);
          }
        }
      }
    },
    [
      accept,
      maxSizeBytes,
      maxFiles,
      files,
      multiple,
      setFiles,
      onFileAdd,
      polite,
      assertive,
      uploadFn,
      uploadFile,
    ]
  );

  // ── Remove file ──────────────────────────────────────────────────────────
  const removeFile = useCallback(
    (fileId: string) => {
      const fileIndex = files.findIndex(f => f.id === fileId);
      const removedFile = files[fileIndex];
      if (!removedFile) return;

      const newFiles = files.filter(f => f.id !== fileId);
      setFiles(newFiles);
      onFileRemove?.(removedFile);

      polite(`${removedFile.file.name} removed`);

      // Clear internal error if removing fixed the constraint
      if (internalError) {
        setInternalError(undefined);
      }

      // Focus management: schedule for next frame after re-render
      requestAnimationFrame(() => {
        if (!rootRef.current) return;
        if (newFiles.length === 0) {
          const target = rootRef.current.querySelector(
            '[data-compa11y-file-upload-trigger], [data-compa11y-file-upload-dropzone]'
          ) as HTMLElement;
          target?.focus();
        } else {
          const removeButtons = rootRef.current.querySelectorAll(
            '[data-compa11y-file-upload-item-remove]'
          );
          const nextIndex = Math.min(fileIndex, newFiles.length - 1);
          (removeButtons[nextIndex] as HTMLElement)?.focus();
        }
      });
    },
    [files, setFiles, onFileRemove, polite, internalError]
  );

  // ── Open file picker ─────────────────────────────────────────────────────
  const openFilePicker = useCallback(() => {
    if (disabled) return;
    inputRef.current?.click();
  }, [disabled]);

  // ── Input change handler ─────────────────────────────────────────────────
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        addFiles(e.target.files);
      }
      // Reset so re-selecting the same file triggers change
      e.target.value = '';
    },
    [addFiles]
  );

  // ── Dev warnings ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      const frameId = requestAnimationFrame(() => {
        if (!label && !ariaLabel && !ariaLabelledBy && !hasLabel) {
          warnings.warning(
            'FileUpload has no accessible label. Provide a label prop, aria-label, aria-labelledby, or use <FileUpload.Label>.'
          );
        }
      });
      return () => cancelAnimationFrame(frameId);
    }
  }, [label, ariaLabel, ariaLabelledBy, hasLabel]);

  // ── Context value ────────────────────────────────────────────────────────
  const activeError = externalError ?? internalError;

  const contextValue = useMemo<FileUploadContextValue>(
    () => ({
      files,
      addFiles,
      removeFile,
      openFilePicker,
      isDragOver,
      setIsDragOver,
      disabled,
      required,
      accept,
      multiple,
      maxFiles,
      maxSizeBytes,
      error: externalError,
      internalError,
      labelId,
      descriptionId,
      errorId,
      inputId,
      hasLabel,
      setHasLabel,
      hasDescription,
      setHasDescription,
      hasError,
      setHasError,
    }),
    [
      files,
      addFiles,
      removeFile,
      openFilePicker,
      isDragOver,
      disabled,
      required,
      accept,
      multiple,
      maxFiles,
      maxSizeBytes,
      externalError,
      internalError,
      labelId,
      descriptionId,
      errorId,
      inputId,
      hasLabel,
      hasDescription,
      hasError,
    ]
  );

  // ── Styles ───────────────────────────────────────────────────────────────
  const rootStyle: React.CSSProperties = unstyled
    ? {}
    : { display: 'flex', flexDirection: 'column', gap: '0.5rem' };

  const labelStyle: React.CSSProperties = unstyled
    ? {}
    : {
        display: 'block',
        color: disabled
          ? 'var(--compa11y-file-upload-disabled-color, #999)'
          : 'var(--compa11y-file-upload-label-color, inherit)',
        fontSize: 'var(--compa11y-file-upload-label-size, 0.875rem)',
        fontWeight: 'var(--compa11y-file-upload-label-weight, 500)' as any,
      };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <FileUploadProvider value={contextValue}>
      <div
        ref={rootRef}
        data-compa11y-file-upload=""
        data-disabled={disabled ? '' : undefined}
        data-error={activeError ? '' : undefined}
        className={className}
        style={rootStyle}
      >
        {/* Visible label from label prop */}
        {label && (
          <label
            htmlFor={inputId}
            id={labelId}
            data-compa11y-file-upload-label=""
            style={labelStyle}
          >
            {label}
          </label>
        )}

        {/* Hidden native file input */}
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          name={name}
          onChange={handleInputChange}
          tabIndex={-1}
          aria-hidden="true"
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
        />

        {children}
      </div>
    </FileUploadProvider>
  );
}

// =============================================================================
// FileUpload.Label
// =============================================================================

export interface FileUploadLabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

export const FileUploadLabel = forwardRef<
  HTMLLabelElement,
  FileUploadLabelProps
>(function FileUploadLabel({ children, style, ...props }, ref) {
  const { labelId, inputId, setHasLabel, disabled } =
    useFileUploadContext();

  useEffect(() => {
    setHasLabel(true);
    return () => setHasLabel(false);
  }, [setHasLabel]);

  const defaultStyle: React.CSSProperties = {
    display: 'block',
    color: disabled
      ? 'var(--compa11y-file-upload-disabled-color, #999)'
      : 'var(--compa11y-file-upload-label-color, inherit)',
    fontSize: 'var(--compa11y-file-upload-label-size, 0.875rem)',
    fontWeight: 'var(--compa11y-file-upload-label-weight, 500)' as any,
    ...style,
  };

  return (
    <label
      ref={ref}
      id={labelId}
      htmlFor={inputId}
      data-compa11y-file-upload-label=""
      style={defaultStyle}
      {...props}
    >
      {children}
    </label>
  );
});

// =============================================================================
// FileUpload.Description
// =============================================================================

export interface FileUploadDescriptionProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const FileUploadDescription = forwardRef<
  HTMLDivElement,
  FileUploadDescriptionProps
>(function FileUploadDescription({ children, style, ...props }, ref) {
  const { descriptionId, setHasDescription } = useFileUploadContext();

  useEffect(() => {
    setHasDescription(true);
    return () => setHasDescription(false);
  }, [setHasDescription]);

  const defaultStyle: React.CSSProperties = {
    color: 'var(--compa11y-file-upload-hint-color, #666)',
    fontSize: 'var(--compa11y-file-upload-hint-size, 0.8125rem)',
    ...style,
  };

  return (
    <div
      ref={ref}
      id={descriptionId}
      data-compa11y-file-upload-description=""
      style={defaultStyle}
      {...props}
    >
      {children}
    </div>
  );
});

// =============================================================================
// FileUpload.Error
// =============================================================================

export interface FileUploadErrorProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const FileUploadError = forwardRef<
  HTMLDivElement,
  FileUploadErrorProps
>(function FileUploadError({ children, style, ...props }, ref) {
  const { errorId, setHasError, error, internalError } =
    useFileUploadContext();
  const activeError = children ?? error ?? internalError;

  useEffect(() => {
    setHasError(Boolean(activeError));
    return () => setHasError(false);
  }, [setHasError, activeError]);

  if (!activeError) return null;

  const defaultStyle: React.CSSProperties = {
    color: 'var(--compa11y-file-upload-error-color, #ef4444)',
    fontSize: 'var(--compa11y-file-upload-error-size, 0.8125rem)',
    ...style,
  };

  return (
    <div
      ref={ref}
      id={errorId}
      role="alert"
      data-compa11y-file-upload-error=""
      style={defaultStyle}
      {...props}
    >
      {activeError}
    </div>
  );
});

// =============================================================================
// FileUpload.Trigger
// =============================================================================

export interface FileUploadTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

export const FileUploadTrigger = forwardRef<
  HTMLButtonElement,
  FileUploadTriggerProps
>(function FileUploadTrigger({ children, onClick, style, ...props }, ref) {
  const {
    openFilePicker,
    disabled,
    required,
    hasDescription,
    descriptionId,
    hasError,
    errorId,
    error,
    internalError,
  } = useFileUploadContext();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (!e.defaultPrevented) openFilePicker();
  };

  // Build aria-describedby
  const describedByParts: string[] = [];
  if (hasDescription) describedByParts.push(descriptionId);
  if (hasError) describedByParts.push(errorId);
  const describedBy = describedByParts.join(' ') || undefined;

  const activeError = error ?? internalError;

  const defaultStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.375rem',
    padding: '0.5rem 1rem',
    border: '1px solid var(--compa11y-file-upload-trigger-border, #ccc)',
    borderRadius: 'var(--compa11y-file-upload-border-radius, 6px)',
    background: 'var(--compa11y-file-upload-trigger-bg, white)',
    color: 'var(--compa11y-file-upload-trigger-color, inherit)',
    fontSize: 'var(--compa11y-file-upload-font-size, 0.875rem)',
    fontFamily: 'inherit',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : undefined,
    minHeight: '44px',
    ...style,
  };

  return (
    <button
      ref={ref}
      type="button"
      tabIndex={0}
      disabled={disabled}
      aria-describedby={describedBy}
      aria-invalid={activeError ? true : undefined}
      aria-required={required || undefined}
      data-compa11y-file-upload-trigger=""
      onClick={handleClick}
      style={defaultStyle}
      {...props}
    >
      {children ?? 'Choose files'}
    </button>
  );
});

// =============================================================================
// FileUpload.Dropzone
// =============================================================================

export interface FileUploadDropzoneProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const FileUploadDropzone = forwardRef<
  HTMLDivElement,
  FileUploadDropzoneProps
>(function FileUploadDropzone({ children, style, ...props }, ref) {
  const {
    openFilePicker,
    addFiles,
    isDragOver,
    setIsDragOver,
    disabled,
    required,
    hasDescription,
    descriptionId,
    hasError,
    errorId,
    error,
    internalError,
  } = useFileUploadContext();

  // Drag counter to handle nested elements
  const dragCounter = useRef(0);

  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;
      dragCounter.current++;
      if (e.dataTransfer.types.includes('Files')) {
        setIsDragOver(true);
      }
    },
    [disabled, setIsDragOver]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current--;
      if (dragCounter.current <= 0) {
        dragCounter.current = 0;
        setIsDragOver(false);
      }
    },
    [setIsDragOver]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current = 0;
      setIsDragOver(false);
      if (disabled) return;
      if (e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
    },
    [disabled, addFiles, setIsDragOver]
  );

  const handleClick = useCallback(() => {
    if (!disabled) openFilePicker();
  }, [disabled, openFilePicker]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openFilePicker();
      }
    },
    [disabled, openFilePicker]
  );

  // Build aria-describedby
  const describedByParts: string[] = [];
  if (hasDescription) describedByParts.push(descriptionId);
  if (hasError) describedByParts.push(errorId);
  const describedBy = describedByParts.join(' ') || undefined;

  const activeError = error ?? internalError;

  const defaultStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    minHeight: '120px',
    padding: '1.5rem',
    border: isDragOver
      ? 'var(--compa11y-file-upload-dropzone-border-active, 2px dashed #0066cc)'
      : 'var(--compa11y-file-upload-dropzone-border, 2px dashed #ccc)',
    borderRadius: 'var(--compa11y-file-upload-border-radius, 8px)',
    background: isDragOver
      ? 'var(--compa11y-file-upload-dropzone-bg-active, #f0f7ff)'
      : 'var(--compa11y-file-upload-dropzone-bg, #fafafa)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : undefined,
    textAlign: 'center',
    transition: 'border-color 0.15s, background-color 0.15s',
    ...style,
  };

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled || undefined}
      aria-describedby={describedBy}
      aria-invalid={activeError ? true : undefined}
      aria-required={required || undefined}
      data-compa11y-file-upload-dropzone=""
      data-drag-over={isDragOver ? '' : undefined}
      data-disabled={disabled ? '' : undefined}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      style={defaultStyle}
      {...props}
    >
      {children ?? 'Choose files or drag and drop'}
    </div>
  );
});

// =============================================================================
// FileUpload.FileList
// =============================================================================

export interface FileUploadFileListProps
  extends Omit<React.HTMLAttributes<HTMLUListElement>, 'children'> {
  /** Render function that receives the current files array */
  children: (files: FileUploadFile[]) => React.ReactNode;
}

export const FileUploadFileList = forwardRef<
  HTMLUListElement,
  FileUploadFileListProps
>(function FileUploadFileList({ children, style, ...props }, ref) {
  const { files } = useFileUploadContext();

  if (files.length === 0) return null;

  const defaultStyle: React.CSSProperties = {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    ...style,
  };

  return (
    <ul
      ref={ref}
      role="list"
      data-compa11y-file-upload-list=""
      style={defaultStyle}
      {...props}
    >
      {children(files)}
    </ul>
  );
});

// =============================================================================
// FileUpload.FileItem
// =============================================================================

export interface FileUploadFileItemProps
  extends React.HTMLAttributes<HTMLLIElement> {
  /** The file entry to render */
  file: FileUploadFile;
  /** Custom file size formatter */
  formatSize?: (bytes: number) => string;
  /** Custom content — replaces default layout when provided */
  children?: React.ReactNode;
}

export const FileUploadFileItem = forwardRef<
  HTMLLIElement,
  FileUploadFileItemProps
>(function FileUploadFileItem(
  { file, formatSize, children, style, ...props },
  ref
) {
  const { removeFile, disabled } = useFileUploadContext();

  const handleRemove = useCallback(() => {
    removeFile(file.id);
  }, [file.id, removeFile]);

  const sizeStr = (formatSize ?? formatFileSize)(file.file.size);

  const itemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.75rem',
    background: 'var(--compa11y-file-upload-item-bg, #f5f5f5)',
    border:
      file.status === 'error'
        ? '1px solid var(--compa11y-file-upload-error-color, #ef4444)'
        : 'var(--compa11y-file-upload-item-border, 1px solid #e5e5e5)',
    borderRadius: 'var(--compa11y-file-upload-border-radius, 6px)',
    ...style,
  };

  const nameStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: '0.875rem',
  };

  const sizeStyle: React.CSSProperties = {
    flexShrink: 0,
    color: '#666',
    fontSize: '0.8125rem',
  };

  const progressBarStyle: React.CSSProperties = {
    width: '60px',
    height: '4px',
    background: 'var(--compa11y-file-upload-progress-bg, #e5e5e5)',
    borderRadius: '2px',
    overflow: 'hidden',
    flexShrink: 0,
  };

  const progressFillStyle: React.CSSProperties = {
    height: '100%',
    width: `${file.progress ?? 0}%`,
    background: 'var(--compa11y-file-upload-progress-fill, #0066cc)',
    transition: 'width 0.2s',
  };

  const errorTextStyle: React.CSSProperties = {
    color: 'var(--compa11y-file-upload-error-color, #ef4444)',
    fontSize: '0.8125rem',
    flexShrink: 0,
  };

  const removeBtnStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'none',
    border: 'none',
    padding: '0.25rem',
    cursor: disabled ? 'not-allowed' : 'pointer',
    color: '#666',
    borderRadius: '4px',
    minWidth: '28px',
    minHeight: '28px',
    flexShrink: 0,
    fontFamily: 'inherit',
    fontSize: '1rem',
  };

  return (
    <li
      ref={ref}
      data-compa11y-file-upload-item=""
      data-status={file.status}
      style={itemStyle}
      {...props}
    >
      {children ?? (
        <>
          <span data-compa11y-file-upload-item-name="" style={nameStyle}>
            {file.file.name}
          </span>
          <span data-compa11y-file-upload-item-size="" style={sizeStyle}>
            {sizeStr}
          </span>

          {file.status === 'uploading' && file.progress !== undefined && (
            <span
              role="progressbar"
              aria-valuenow={file.progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Uploading ${file.file.name}`}
              data-compa11y-file-upload-item-progress=""
              style={progressBarStyle}
            >
              <span style={progressFillStyle} />
            </span>
          )}

          {file.status === 'error' && file.error && (
            <span
              data-compa11y-file-upload-item-error=""
              role="alert"
              style={errorTextStyle}
            >
              {file.error}
            </span>
          )}

          <button
            type="button"
            aria-label={`Remove ${file.file.name}`}
            onClick={handleRemove}
            disabled={disabled}
            data-compa11y-file-upload-item-remove=""
            style={removeBtnStyle}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M1 1l10 10M11 1L1 11"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </>
      )}
    </li>
  );
});

// =============================================================================
// Compound export
// =============================================================================

export const FileUploadCompound = Object.assign(FileUpload, {
  Label: FileUploadLabel,
  Description: FileUploadDescription,
  Error: FileUploadError,
  Trigger: FileUploadTrigger,
  Dropzone: FileUploadDropzone,
  FileList: FileUploadFileList,
  FileItem: FileUploadFileItem,
});
