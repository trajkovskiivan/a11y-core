/**
 * React Hooks for Accessibility
 */

export { useId, useIds, useIdScope } from './use-id';

export {
  useFocusTrap,
  useFocusTrapControls,
  type UseFocusTrapOptions,
} from './use-focus-trap';

export {
  useAnnouncer,
  useAnnounceOnChange,
  useAnnounceLoading,
} from './use-announcer';

export {
  useKeyboard,
  useMenuKeyboard,
  useTabsKeyboard,
  useGridKeyboard,
  useTypeAhead,
  useKeyPressed,
} from './use-keyboard';

export {
  useFocusVisible,
  useFocusManager,
  useFocusControl,
  useFocusWithin,
} from './use-focus-visible';

export {
  useRovingTabindex,
  useRovingTabindexMap,
  type UseRovingTabindexOptions,
  type RovingTabindexItem,
} from './use-roving-tabindex';

export { useFocusNeighbor, useFocusReturn } from './use-focus-neighbor';
