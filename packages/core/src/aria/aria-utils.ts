/**
 * ARIA Utilities
 *
 * Helpers for managing ARIA attributes and relationships
 */

import type { AriaRole } from '../types';

/**
 * ARIA attribute helpers
 */
export const aria = {
  /**
   * Set aria-hidden on an element
   */
  hide(element: HTMLElement): void {
    element.setAttribute('aria-hidden', 'true');
  },

  /**
   * Remove aria-hidden from an element
   */
  show(element: HTMLElement): void {
    element.removeAttribute('aria-hidden');
  },

  /**
   * Set aria-expanded state
   */
  setExpanded(element: HTMLElement, expanded: boolean): void {
    element.setAttribute('aria-expanded', String(expanded));
  },

  /**
   * Set aria-selected state
   */
  setSelected(element: HTMLElement, selected: boolean): void {
    element.setAttribute('aria-selected', String(selected));
  },

  /**
   * Set aria-checked state
   */
  setChecked(element: HTMLElement, checked: boolean | 'mixed'): void {
    element.setAttribute('aria-checked', String(checked));
  },

  /**
   * Set aria-pressed state
   */
  setPressed(element: HTMLElement, pressed: boolean | 'mixed'): void {
    element.setAttribute('aria-pressed', String(pressed));
  },

  /**
   * Set aria-disabled state
   */
  setDisabled(element: HTMLElement, disabled: boolean): void {
    element.setAttribute('aria-disabled', String(disabled));
  },

  /**
   * Set aria-busy state
   */
  setBusy(element: HTMLElement, busy: boolean): void {
    element.setAttribute('aria-busy', String(busy));
  },

  /**
   * Set aria-current
   */
  setCurrent(
    element: HTMLElement,
    value: 'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false'
  ): void {
    if (value === 'false') {
      element.removeAttribute('aria-current');
    } else {
      element.setAttribute('aria-current', value);
    }
  },

  /**
   * Set aria-invalid state
   */
  setInvalid(element: HTMLElement, invalid: boolean | 'grammar' | 'spelling'): void {
    if (invalid === false) {
      element.removeAttribute('aria-invalid');
    } else {
      element.setAttribute('aria-invalid', String(invalid));
    }
  },

  /**
   * Set aria-label
   */
  setLabel(element: HTMLElement, label: string): void {
    if (label) {
      element.setAttribute('aria-label', label);
    } else {
      element.removeAttribute('aria-label');
    }
  },

  /**
   * Set aria-labelledby
   */
  setLabelledBy(element: HTMLElement, ...ids: string[]): void {
    const value = ids.filter(Boolean).join(' ');
    if (value) {
      element.setAttribute('aria-labelledby', value);
    } else {
      element.removeAttribute('aria-labelledby');
    }
  },

  /**
   * Set aria-describedby
   */
  setDescribedBy(element: HTMLElement, ...ids: string[]): void {
    const value = ids.filter(Boolean).join(' ');
    if (value) {
      element.setAttribute('aria-describedby', value);
    } else {
      element.removeAttribute('aria-describedby');
    }
  },

  /**
   * Set aria-controls
   */
  setControls(element: HTMLElement, ...ids: string[]): void {
    const value = ids.filter(Boolean).join(' ');
    if (value) {
      element.setAttribute('aria-controls', value);
    } else {
      element.removeAttribute('aria-controls');
    }
  },

  /**
   * Set aria-owns
   */
  setOwns(element: HTMLElement, ...ids: string[]): void {
    const value = ids.filter(Boolean).join(' ');
    if (value) {
      element.setAttribute('aria-owns', value);
    } else {
      element.removeAttribute('aria-owns');
    }
  },

  /**
   * Set aria-activedescendant
   */
  setActiveDescendant(element: HTMLElement, id: string | null): void {
    if (id) {
      element.setAttribute('aria-activedescendant', id);
    } else {
      element.removeAttribute('aria-activedescendant');
    }
  },

  /**
   * Set aria-haspopup
   */
  setHasPopup(
    element: HTMLElement,
    popup: 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog' | boolean
  ): void {
    if (popup === false) {
      element.removeAttribute('aria-haspopup');
    } else {
      element.setAttribute('aria-haspopup', String(popup));
    }
  },

  /**
   * Set aria-level
   */
  setLevel(element: HTMLElement, level: number): void {
    element.setAttribute('aria-level', String(level));
  },

  /**
   * Set aria-posinset and aria-setsize
   */
  setPosition(element: HTMLElement, position: number, setSize: number): void {
    element.setAttribute('aria-posinset', String(position));
    element.setAttribute('aria-setsize', String(setSize));
  },

  /**
   * Set aria-valuemin, aria-valuemax, aria-valuenow
   */
  setValue(
    element: HTMLElement,
    options: {
      min?: number;
      max?: number;
      now?: number;
      text?: string;
    }
  ): void {
    if (options.min !== undefined) {
      element.setAttribute('aria-valuemin', String(options.min));
    }
    if (options.max !== undefined) {
      element.setAttribute('aria-valuemax', String(options.max));
    }
    if (options.now !== undefined) {
      element.setAttribute('aria-valuenow', String(options.now));
    }
    if (options.text !== undefined) {
      element.setAttribute('aria-valuetext', options.text);
    }
  },

  /**
   * Set role attribute
   */
  setRole(element: HTMLElement, role: AriaRole | null): void {
    if (role) {
      element.setAttribute('role', role);
    } else {
      element.removeAttribute('role');
    }
  },

  /**
   * Set aria-modal
   */
  setModal(element: HTMLElement, modal: boolean): void {
    if (modal) {
      element.setAttribute('aria-modal', 'true');
    } else {
      element.removeAttribute('aria-modal');
    }
  },

  /**
   * Set aria-orientation
   */
  setOrientation(element: HTMLElement, orientation: 'horizontal' | 'vertical'): void {
    element.setAttribute('aria-orientation', orientation);
  },

  /**
   * Set aria-required
   */
  setRequired(element: HTMLElement, required: boolean): void {
    element.setAttribute('aria-required', String(required));
  },

  /**
   * Set aria-readonly
   */
  setReadOnly(element: HTMLElement, readOnly: boolean): void {
    element.setAttribute('aria-readonly', String(readOnly));
  },

  /**
   * Set aria-autocomplete
   */
  setAutocomplete(element: HTMLElement, value: 'none' | 'inline' | 'list' | 'both'): void {
    element.setAttribute('aria-autocomplete', value);
  },

  /**
   * Set aria-multiselectable
   */
  setMultiSelectable(element: HTMLElement, multiselectable: boolean): void {
    element.setAttribute('aria-multiselectable', String(multiselectable));
  },

  /**
   * Set aria-sort
   */
  setSort(element: HTMLElement, sort: 'none' | 'ascending' | 'descending' | 'other'): void {
    element.setAttribute('aria-sort', sort);
  },
};

/**
 * Build ARIA props object for React/JS usage
 */
export function buildAriaProps(props: {
  label?: string;
  labelledBy?: string | string[];
  describedBy?: string | string[];
  controls?: string | string[];
  owns?: string | string[];
  expanded?: boolean;
  selected?: boolean;
  checked?: boolean | 'mixed';
  pressed?: boolean | 'mixed';
  disabled?: boolean;
  hidden?: boolean;
  modal?: boolean;
  busy?: boolean;
  current?: 'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false';
  invalid?: boolean | 'grammar' | 'spelling';
  hasPopup?: 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog' | boolean;
  activeDescendant?: string;
  level?: number;
  posInSet?: number;
  setSize?: number;
  valueMin?: number;
  valueMax?: number;
  valueNow?: number;
  valueText?: string;
  orientation?: 'horizontal' | 'vertical';
  required?: boolean;
  readOnly?: boolean;
  autocomplete?: 'none' | 'inline' | 'list' | 'both';
  multiSelectable?: boolean;
  sort?: 'none' | 'ascending' | 'descending' | 'other';
  role?: AriaRole;
}): Record<string, string | undefined> {
  const result: Record<string, string | undefined> = {};

  if (props.label) result['aria-label'] = props.label;
  if (props.labelledBy) {
    result['aria-labelledby'] = Array.isArray(props.labelledBy)
      ? props.labelledBy.join(' ')
      : props.labelledBy;
  }
  if (props.describedBy) {
    result['aria-describedby'] = Array.isArray(props.describedBy)
      ? props.describedBy.join(' ')
      : props.describedBy;
  }
  if (props.controls) {
    result['aria-controls'] = Array.isArray(props.controls)
      ? props.controls.join(' ')
      : props.controls;
  }
  if (props.owns) {
    result['aria-owns'] = Array.isArray(props.owns)
      ? props.owns.join(' ')
      : props.owns;
  }
  if (props.expanded !== undefined) result['aria-expanded'] = String(props.expanded);
  if (props.selected !== undefined) result['aria-selected'] = String(props.selected);
  if (props.checked !== undefined) result['aria-checked'] = String(props.checked);
  if (props.pressed !== undefined) result['aria-pressed'] = String(props.pressed);
  if (props.disabled !== undefined) result['aria-disabled'] = String(props.disabled);
  if (props.hidden !== undefined) result['aria-hidden'] = String(props.hidden);
  if (props.modal !== undefined) result['aria-modal'] = String(props.modal);
  if (props.busy !== undefined) result['aria-busy'] = String(props.busy);
  if (props.current) result['aria-current'] = props.current;
  if (props.invalid !== undefined) result['aria-invalid'] = String(props.invalid);
  if (props.hasPopup !== undefined) result['aria-haspopup'] = String(props.hasPopup);
  if (props.activeDescendant) result['aria-activedescendant'] = props.activeDescendant;
  if (props.level !== undefined) result['aria-level'] = String(props.level);
  if (props.posInSet !== undefined) result['aria-posinset'] = String(props.posInSet);
  if (props.setSize !== undefined) result['aria-setsize'] = String(props.setSize);
  if (props.valueMin !== undefined) result['aria-valuemin'] = String(props.valueMin);
  if (props.valueMax !== undefined) result['aria-valuemax'] = String(props.valueMax);
  if (props.valueNow !== undefined) result['aria-valuenow'] = String(props.valueNow);
  if (props.valueText) result['aria-valuetext'] = props.valueText;
  if (props.orientation) result['aria-orientation'] = props.orientation;
  if (props.required !== undefined) result['aria-required'] = String(props.required);
  if (props.readOnly !== undefined) result['aria-readonly'] = String(props.readOnly);
  if (props.autocomplete) result['aria-autocomplete'] = props.autocomplete;
  if (props.multiSelectable !== undefined) result['aria-multiselectable'] = String(props.multiSelectable);
  if (props.sort) result['aria-sort'] = props.sort;
  if (props.role) result.role = props.role;

  return result;
}

/**
 * Merge multiple aria-labelledby or aria-describedby values
 */
export function mergeAriaIds(...ids: (string | undefined | null)[]): string | undefined {
  const filtered = ids.filter(Boolean) as string[];
  return filtered.length > 0 ? filtered.join(' ') : undefined;
}

/**
 * Check if an element has an accessible name
 */
export function hasAccessibleName(element: HTMLElement): boolean {
  // Check aria-label
  if (element.getAttribute('aria-label')) {
    return true;
  }

  // Check aria-labelledby
  const labelledBy = element.getAttribute('aria-labelledby');
  if (labelledBy) {
    const ids = labelledBy.split(' ');
    const hasLabelContent = ids.some((id) => {
      const labelElement = document.getElementById(id);
      return labelElement && labelElement.textContent?.trim();
    });
    if (hasLabelContent) return true;
  }

  // Check text content (for buttons, links, etc.)
  if (element.textContent?.trim()) {
    return true;
  }

  // Check title attribute (fallback)
  if (element.getAttribute('title')) {
    return true;
  }

  // Check associated label (for form elements)
  if ('labels' in element && (element as HTMLInputElement).labels?.length) {
    return true;
  }

  // Check alt attribute (for images)
  if (element.tagName === 'IMG' && element.getAttribute('alt')) {
    return true;
  }

  return false;
}
