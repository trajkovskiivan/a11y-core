import { createContext, useContext } from 'react';

export interface FileUploadFile {
  /** Unique identifier for this file entry */
  id: string;
  /** The native File object */
  file: File;
  /** Current status of the file */
  status: 'pending' | 'uploading' | 'complete' | 'error';
  /** Upload progress (0-100), only meaningful when status is 'uploading' */
  progress?: number;
  /** Error message when status is 'error' */
  error?: string;
}

export interface FileUploadContextValue {
  /** Current list of files */
  files: FileUploadFile[];
  /** Add files from a FileList or File array (validates before adding) */
  addFiles: (fileList: FileList | File[]) => void;
  /** Remove a file by its ID */
  removeFile: (fileId: string) => void;
  /** Programmatically open the native file picker */
  openFilePicker: () => void;
  /** Whether a drag operation is over the dropzone */
  isDragOver: boolean;
  /** Update drag-over state */
  setIsDragOver: (value: boolean) => void;
  /** Whether the component is disabled */
  disabled: boolean;
  /** Whether the component is required */
  required: boolean;
  /** Accepted file types (e.g. ".pdf,.png,image/*") */
  accept?: string;
  /** Whether multiple files can be selected */
  multiple: boolean;
  /** Maximum number of files allowed */
  maxFiles?: number;
  /** Maximum file size in bytes */
  maxSizeBytes?: number;
  /** External error message */
  error?: string;
  /** Internal validation error */
  internalError?: string;
  /** ID for the label element */
  labelId: string;
  /** ID for the description element */
  descriptionId: string;
  /** ID for the error element */
  errorId: string;
  /** ID for the hidden file input */
  inputId: string;
  /** Whether a Label sub-component is rendered */
  hasLabel: boolean;
  /** Set whether Label is rendered */
  setHasLabel: (value: boolean) => void;
  /** Whether a Description sub-component is rendered */
  hasDescription: boolean;
  /** Set whether Description is rendered */
  setHasDescription: (value: boolean) => void;
  /** Whether an Error sub-component is rendered */
  hasError: boolean;
  /** Set whether Error is rendered */
  setHasError: (value: boolean) => void;
}

const FileUploadContext = createContext<FileUploadContextValue | null>(null);

export function useFileUploadContext(): FileUploadContextValue {
  const context = useContext(FileUploadContext);
  if (!context) {
    throw new Error(
      'FileUpload compound components must be used within a FileUpload component'
    );
  }
  return context;
}

export const FileUploadProvider = FileUploadContext.Provider;
