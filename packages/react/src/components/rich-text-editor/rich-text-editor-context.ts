import { createContext, useContext } from 'react';
import type {
  RTEAdapter,
  RTESelectionState,
  RTEFeatures,
  RTEFormat,
  RTEMark,
  RTEBlock,
} from '@compa11y/core';
import { EMPTY_SELECTION_STATE } from '@compa11y/core';

export interface RichTextEditorContextValue {
  // -- IDs --
  editorId: string;
  labelId: string;
  descriptionId: string;
  errorId: string;
  toolbarId: string;

  // -- Adapter --
  adapter: RTEAdapter | null;

  // -- Selection state (from adapter, updated on every selection change) --
  selectionState: RTESelectionState;

  // -- Features --
  features: RTEFeatures;
  format: RTEFormat;

  // -- Form state --
  disabled: boolean;
  readOnly: boolean;
  required: boolean;
  invalid: boolean;

  // -- Presence tracking --
  hasLabel: boolean;
  hasDescription: boolean;
  hasError: boolean;
  setHasLabel: (value: boolean) => void;
  setHasDescription: (value: boolean) => void;
  setHasError: (value: boolean) => void;

  // -- Commands (proxy to adapter) --
  toggleMark: (mark: RTEMark) => void;
  setBlock: (block: RTEBlock) => void;
  undo: () => void;
  redo: () => void;
  toggleBulletList: () => void;
  toggleNumberList: () => void;
  indent: () => void;
  outdent: () => void;
  toggleCodeBlock: () => void;
  focusEditor: () => void;

  // -- Link dialog --
  linkDialogOpen: boolean;
  openLinkDialog: () => void;
  closeLinkDialog: () => void;
  insertOrEditLink: (opts: { href: string; text?: string }) => void;
  removeLink: () => void;

  // -- Image dialog --
  imageDialogOpen: boolean;
  openImageDialog: () => void;
  closeImageDialog: () => void;
  insertImage: (opts: { src: string; alt: string; title?: string }) => void;

  // -- Unstyled --
  unstyled: boolean;
}

const RichTextEditorContext = createContext<RichTextEditorContextValue | null>(null);

export function useRichTextEditorContext(componentName = 'this sub-component'): RichTextEditorContextValue {
  const ctx = useContext(RichTextEditorContext);
  if (!ctx) {
    throw new Error(`${componentName} must be used inside <RichTextEditor>`);
  }
  return ctx;
}

export const RichTextEditorProvider = RichTextEditorContext.Provider;

/** Default context for SSR/testing — all no-ops */
export const DEFAULT_CONTEXT: RichTextEditorContextValue = {
  editorId: '',
  labelId: '',
  descriptionId: '',
  errorId: '',
  toolbarId: '',
  adapter: null,
  selectionState: EMPTY_SELECTION_STATE,
  features: {},
  format: 'html',
  disabled: false,
  readOnly: false,
  required: false,
  invalid: false,
  hasLabel: false,
  hasDescription: false,
  hasError: false,
  setHasLabel: () => {},
  setHasDescription: () => {},
  setHasError: () => {},
  toggleMark: () => {},
  setBlock: () => {},
  undo: () => {},
  redo: () => {},
  toggleBulletList: () => {},
  toggleNumberList: () => {},
  indent: () => {},
  outdent: () => {},
  toggleCodeBlock: () => {},
  focusEditor: () => {},
  linkDialogOpen: false,
  openLinkDialog: () => {},
  closeLinkDialog: () => {},
  insertOrEditLink: () => {},
  removeLink: () => {},
  imageDialogOpen: false,
  openImageDialog: () => {},
  closeImageDialog: () => {},
  insertImage: () => {},
  unstyled: false,
};
