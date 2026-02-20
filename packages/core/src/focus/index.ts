/**
 * Focus Management Module
 *
 * Provides utilities for managing focus in accessible components
 */

export {
  createFocusTrap,
  getActiveFocusTrap,
  hasFocusTrap,
} from './focus-trap';

export {
  initFocusVisible,
  isFocusVisible,
  hasVisibleFocus,
  getLastFocusSource,
  setFocusVisible,
  focusWithVisibleRing,
} from './focus-visible';

export {
  createFocusScope,
  createRovingTabindex,
  type FocusScopeOptions,
  type FocusScope,
  type RovingTabindexOptions,
  type RovingTabindex,
} from './focus-scope';

export {
  findFocusNeighbor,
  createFocusReturn,
  type FocusNeighborOptions,
  type FocusReturnOptions,
  type FocusReturn,
} from './focus-neighbor';
