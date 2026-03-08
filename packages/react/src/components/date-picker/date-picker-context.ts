import { createContext, useContext } from 'react';

export type DatePickerMode = 'single' | 'range';
export type DatePickerPrecision = 'date' | 'datetime';
export type DatePickerOverlay = 'popover' | 'modal';
export type DatePickerView = 'days' | 'months' | 'years';

export interface DatePickerContextValue {
  // Mode
  mode: DatePickerMode;
  precision: DatePickerPrecision;
  overlay: DatePickerOverlay;
  hourCycle: 12 | 24;

  // IDs
  inputId: string;
  startInputId: string;
  endInputId: string;
  calendarId: string;
  triggerId: string;
  titleId: string;
  hintId: string;
  errorId: string;
  liveRegionId: string;

  // Open state
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;

  // Single value
  selectedDate: Date | null;
  onDateSelect: (date: Date | null) => void;

  // Range values
  rangeStart: Date | null;
  rangeEnd: Date | null;
  onRangeSelect: (start: Date | null, end: Date | null) => void;

  // Calendar navigation
  viewDate: Date;
  setViewDate: (date: Date) => void;
  currentView: DatePickerView;
  setCurrentView: (view: DatePickerView) => void;

  // Focus
  focusedDate: Date;
  setFocusedDate: (date: Date) => void;

  // Time
  hours: number;
  minutes: number;
  period: 'AM' | 'PM';
  setHours: (h: number) => void;
  setMinutes: (m: number) => void;
  setPeriod: (p: 'AM' | 'PM') => void;
  // Range time
  endHours: number;
  endMinutes: number;
  endPeriod: 'AM' | 'PM';
  setEndHours: (h: number) => void;
  setEndMinutes: (m: number) => void;
  setEndPeriod: (p: 'AM' | 'PM') => void;

  // Constraints
  minDate?: Date;
  maxDate?: Date;
  isDateDisabled: (date: Date) => boolean;

  // Config
  locale: string;
  firstDayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  disabled: boolean;
  required: boolean;

  // Labels
  label?: string;
  error?: string;

  // Formatting
  formatDate: (date: Date) => string;
  parseDate: (text: string) => Date | null;

  // Trigger ref (for focus return)
  triggerRef: React.RefObject<HTMLButtonElement | null>;

  // Live region
  setLiveMessage: (msg: string) => void;
}

const DatePickerContext = createContext<DatePickerContextValue | null>(null);

export const DatePickerProvider = DatePickerContext.Provider;

export function useDatePickerContext(componentName = 'DatePicker sub-component'): DatePickerContextValue {
  const ctx = useContext(DatePickerContext);
  if (!ctx) {
    throw new Error(`${componentName} must be used inside <DatePicker>`);
  }
  return ctx;
}
