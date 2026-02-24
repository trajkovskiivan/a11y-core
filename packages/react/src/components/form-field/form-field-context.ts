import { createContext, useContext } from 'react';

export interface FormFieldContextValue {
  /** ID for the form control (used in label htmlFor) */
  controlId: string;
  /** ID for the label element */
  labelId: string;
  /** ID for the hint element */
  hintId: string;
  /** ID for the error element */
  errorId: string;
  /** Whether an error is present */
  hasError: boolean;
  /** Whether a hint sub-component is mounted */
  hasHint: boolean;
  /** Register hint presence from sub-component */
  setHasHint: (value: boolean) => void;
  /** Whether the field is required */
  required: boolean;
  /** Whether the field is disabled */
  disabled: boolean;
  /** Whether to remove default styles */
  unstyled: boolean;
}

export const FormFieldContext = createContext<FormFieldContextValue | null>(null);

export function useFormFieldContext(): FormFieldContextValue {
  const ctx = useContext(FormFieldContext);
  if (!ctx) {
    throw new Error(
      '[Compa11y FormField]: FormField sub-components must be used within <FormField>.'
    );
  }
  return ctx;
}
