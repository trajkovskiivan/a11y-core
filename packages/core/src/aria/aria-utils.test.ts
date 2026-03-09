import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { aria, buildAriaProps, mergeAriaIds, hasAccessibleName } from './aria-utils';

describe('aria helpers', () => {
  let el: HTMLElement;

  beforeEach(() => {
    el = document.createElement('div');
    document.body.appendChild(el);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('aria.hide() / aria.show()', () => {
    it('should set aria-hidden to true', () => {
      aria.hide(el);
      expect(el.getAttribute('aria-hidden')).toBe('true');
    });

    it('should remove aria-hidden', () => {
      aria.hide(el);
      aria.show(el);
      expect(el.getAttribute('aria-hidden')).toBeNull();
    });
  });

  describe('aria.setExpanded()', () => {
    it('should set aria-expanded to true', () => {
      aria.setExpanded(el, true);
      expect(el.getAttribute('aria-expanded')).toBe('true');
    });

    it('should set aria-expanded to false', () => {
      aria.setExpanded(el, false);
      expect(el.getAttribute('aria-expanded')).toBe('false');
    });
  });

  describe('aria.setSelected()', () => {
    it('should set aria-selected', () => {
      aria.setSelected(el, true);
      expect(el.getAttribute('aria-selected')).toBe('true');
    });
  });

  describe('aria.setChecked()', () => {
    it('should handle boolean values', () => {
      aria.setChecked(el, true);
      expect(el.getAttribute('aria-checked')).toBe('true');
    });

    it('should handle mixed state', () => {
      aria.setChecked(el, 'mixed');
      expect(el.getAttribute('aria-checked')).toBe('mixed');
    });
  });

  describe('aria.setPressed()', () => {
    it('should handle boolean values', () => {
      aria.setPressed(el, true);
      expect(el.getAttribute('aria-pressed')).toBe('true');
    });

    it('should handle mixed state', () => {
      aria.setPressed(el, 'mixed');
      expect(el.getAttribute('aria-pressed')).toBe('mixed');
    });
  });

  describe('aria.setDisabled()', () => {
    it('should set aria-disabled', () => {
      aria.setDisabled(el, true);
      expect(el.getAttribute('aria-disabled')).toBe('true');
    });
  });

  describe('aria.setBusy()', () => {
    it('should set aria-busy', () => {
      aria.setBusy(el, true);
      expect(el.getAttribute('aria-busy')).toBe('true');
    });
  });

  describe('aria.setCurrent()', () => {
    it('should set aria-current for valid values', () => {
      aria.setCurrent(el, 'page');
      expect(el.getAttribute('aria-current')).toBe('page');
    });

    it('should remove aria-current when set to false', () => {
      aria.setCurrent(el, 'page');
      aria.setCurrent(el, 'false');
      expect(el.getAttribute('aria-current')).toBeNull();
    });
  });

  describe('aria.setInvalid()', () => {
    it('should set aria-invalid to true', () => {
      aria.setInvalid(el, true);
      expect(el.getAttribute('aria-invalid')).toBe('true');
    });

    it('should set grammar/spelling', () => {
      aria.setInvalid(el, 'grammar');
      expect(el.getAttribute('aria-invalid')).toBe('grammar');
    });

    it('should remove aria-invalid when false', () => {
      aria.setInvalid(el, true);
      aria.setInvalid(el, false);
      expect(el.getAttribute('aria-invalid')).toBeNull();
    });
  });

  describe('aria.setLabel()', () => {
    it('should set aria-label', () => {
      aria.setLabel(el, 'My label');
      expect(el.getAttribute('aria-label')).toBe('My label');
    });

    it('should remove aria-label for empty string', () => {
      aria.setLabel(el, 'My label');
      aria.setLabel(el, '');
      expect(el.getAttribute('aria-label')).toBeNull();
    });
  });

  describe('aria.setLabelledBy()', () => {
    it('should join multiple IDs with space', () => {
      aria.setLabelledBy(el, 'id1', 'id2');
      expect(el.getAttribute('aria-labelledby')).toBe('id1 id2');
    });

    it('should filter out falsy values', () => {
      aria.setLabelledBy(el, 'id1', '', 'id2');
      expect(el.getAttribute('aria-labelledby')).toBe('id1 id2');
    });

    it('should remove attribute when no valid IDs', () => {
      aria.setLabelledBy(el, 'id1');
      aria.setLabelledBy(el, '', '');
      expect(el.getAttribute('aria-labelledby')).toBeNull();
    });
  });

  describe('aria.setDescribedBy()', () => {
    it('should join multiple IDs', () => {
      aria.setDescribedBy(el, 'desc1', 'desc2');
      expect(el.getAttribute('aria-describedby')).toBe('desc1 desc2');
    });

    it('should remove attribute when empty', () => {
      aria.setDescribedBy(el, '');
      expect(el.getAttribute('aria-describedby')).toBeNull();
    });
  });

  describe('aria.setControls()', () => {
    it('should set aria-controls', () => {
      aria.setControls(el, 'panel-1');
      expect(el.getAttribute('aria-controls')).toBe('panel-1');
    });

    it('should remove when empty', () => {
      aria.setControls(el, '');
      expect(el.getAttribute('aria-controls')).toBeNull();
    });
  });

  describe('aria.setOwns()', () => {
    it('should set aria-owns', () => {
      aria.setOwns(el, 'child-1', 'child-2');
      expect(el.getAttribute('aria-owns')).toBe('child-1 child-2');
    });
  });

  describe('aria.setActiveDescendant()', () => {
    it('should set aria-activedescendant', () => {
      aria.setActiveDescendant(el, 'item-3');
      expect(el.getAttribute('aria-activedescendant')).toBe('item-3');
    });

    it('should remove when null', () => {
      aria.setActiveDescendant(el, 'item-3');
      aria.setActiveDescendant(el, null);
      expect(el.getAttribute('aria-activedescendant')).toBeNull();
    });
  });

  describe('aria.setHasPopup()', () => {
    it('should set popup type', () => {
      aria.setHasPopup(el, 'menu');
      expect(el.getAttribute('aria-haspopup')).toBe('menu');
    });

    it('should set to true for boolean true', () => {
      aria.setHasPopup(el, true);
      expect(el.getAttribute('aria-haspopup')).toBe('true');
    });

    it('should remove for false', () => {
      aria.setHasPopup(el, 'menu');
      aria.setHasPopup(el, false);
      expect(el.getAttribute('aria-haspopup')).toBeNull();
    });
  });

  describe('aria.setLevel()', () => {
    it('should set aria-level', () => {
      aria.setLevel(el, 3);
      expect(el.getAttribute('aria-level')).toBe('3');
    });
  });

  describe('aria.setPosition()', () => {
    it('should set aria-posinset and aria-setsize', () => {
      aria.setPosition(el, 2, 5);
      expect(el.getAttribute('aria-posinset')).toBe('2');
      expect(el.getAttribute('aria-setsize')).toBe('5');
    });
  });

  describe('aria.setValue()', () => {
    it('should set value attributes', () => {
      aria.setValue(el, { min: 0, max: 100, now: 50, text: '50%' });
      expect(el.getAttribute('aria-valuemin')).toBe('0');
      expect(el.getAttribute('aria-valuemax')).toBe('100');
      expect(el.getAttribute('aria-valuenow')).toBe('50');
      expect(el.getAttribute('aria-valuetext')).toBe('50%');
    });

    it('should only set provided values', () => {
      aria.setValue(el, { now: 75 });
      expect(el.getAttribute('aria-valuenow')).toBe('75');
      expect(el.getAttribute('aria-valuemin')).toBeNull();
      expect(el.getAttribute('aria-valuemax')).toBeNull();
    });
  });

  describe('aria.setRole()', () => {
    it('should set role', () => {
      aria.setRole(el, 'button');
      expect(el.getAttribute('role')).toBe('button');
    });

    it('should remove role when null', () => {
      aria.setRole(el, 'button');
      aria.setRole(el, null);
      expect(el.getAttribute('role')).toBeNull();
    });
  });

  describe('aria.setModal()', () => {
    it('should set aria-modal to true', () => {
      aria.setModal(el, true);
      expect(el.getAttribute('aria-modal')).toBe('true');
    });

    it('should remove aria-modal when false', () => {
      aria.setModal(el, true);
      aria.setModal(el, false);
      expect(el.getAttribute('aria-modal')).toBeNull();
    });
  });

  describe('aria.setOrientation()', () => {
    it('should set aria-orientation', () => {
      aria.setOrientation(el, 'vertical');
      expect(el.getAttribute('aria-orientation')).toBe('vertical');
    });
  });

  describe('aria.setRequired()', () => {
    it('should set aria-required', () => {
      aria.setRequired(el, true);
      expect(el.getAttribute('aria-required')).toBe('true');
    });
  });

  describe('aria.setReadOnly()', () => {
    it('should set aria-readonly', () => {
      aria.setReadOnly(el, true);
      expect(el.getAttribute('aria-readonly')).toBe('true');
    });
  });

  describe('aria.setAutocomplete()', () => {
    it('should set aria-autocomplete', () => {
      aria.setAutocomplete(el, 'list');
      expect(el.getAttribute('aria-autocomplete')).toBe('list');
    });
  });

  describe('aria.setMultiSelectable()', () => {
    it('should set aria-multiselectable', () => {
      aria.setMultiSelectable(el, true);
      expect(el.getAttribute('aria-multiselectable')).toBe('true');
    });
  });

  describe('aria.setSort()', () => {
    it('should set aria-sort', () => {
      aria.setSort(el, 'ascending');
      expect(el.getAttribute('aria-sort')).toBe('ascending');
    });
  });
});

describe('buildAriaProps()', () => {
  it('should build props object from configuration', () => {
    const props = buildAriaProps({
      label: 'My component',
      expanded: true,
      disabled: false,
    });

    expect(props['aria-label']).toBe('My component');
    expect(props['aria-expanded']).toBe('true');
    expect(props['aria-disabled']).toBe('false');
  });

  it('should handle array IDs for relationship attributes', () => {
    const props = buildAriaProps({
      labelledBy: ['id1', 'id2'],
      describedBy: ['desc1', 'desc2'],
      controls: ['ctrl1'],
      owns: ['own1', 'own2'],
    });

    expect(props['aria-labelledby']).toBe('id1 id2');
    expect(props['aria-describedby']).toBe('desc1 desc2');
    expect(props['aria-controls']).toBe('ctrl1');
    expect(props['aria-owns']).toBe('own1 own2');
  });

  it('should handle string IDs for relationship attributes', () => {
    const props = buildAriaProps({
      labelledBy: 'single-id',
      describedBy: 'single-desc',
    });

    expect(props['aria-labelledby']).toBe('single-id');
    expect(props['aria-describedby']).toBe('single-desc');
  });

  it('should omit undefined properties', () => {
    const props = buildAriaProps({ label: 'test' });
    expect(Object.keys(props)).toEqual(['aria-label']);
  });

  it('should handle all value-related props', () => {
    const props = buildAriaProps({
      valueMin: 0,
      valueMax: 100,
      valueNow: 50,
      valueText: 'Fifty',
    });

    expect(props['aria-valuemin']).toBe('0');
    expect(props['aria-valuemax']).toBe('100');
    expect(props['aria-valuenow']).toBe('50');
    expect(props['aria-valuetext']).toBe('Fifty');
  });

  it('should handle position props', () => {
    const props = buildAriaProps({
      level: 2,
      posInSet: 3,
      setSize: 10,
    });

    expect(props['aria-level']).toBe('2');
    expect(props['aria-posinset']).toBe('3');
    expect(props['aria-setsize']).toBe('10');
  });

  it('should handle checked and pressed with mixed state', () => {
    const props = buildAriaProps({
      checked: 'mixed',
      pressed: 'mixed',
    });

    expect(props['aria-checked']).toBe('mixed');
    expect(props['aria-pressed']).toBe('mixed');
  });

  it('should handle form-related props', () => {
    const props = buildAriaProps({
      required: true,
      readOnly: false,
      autocomplete: 'list',
      multiSelectable: true,
      sort: 'ascending',
    });

    expect(props['aria-required']).toBe('true');
    expect(props['aria-readonly']).toBe('false');
    expect(props['aria-autocomplete']).toBe('list');
    expect(props['aria-multiselectable']).toBe('true');
    expect(props['aria-sort']).toBe('ascending');
  });

  it('should handle role, modal, orientation, hasPopup, activeDescendant', () => {
    const props = buildAriaProps({
      role: 'dialog',
      modal: true,
      orientation: 'horizontal',
      hasPopup: 'menu',
      activeDescendant: 'item-1',
      current: 'page',
      invalid: 'grammar',
      hidden: true,
      busy: true,
      selected: true,
    });

    expect(props.role).toBe('dialog');
    expect(props['aria-modal']).toBe('true');
    expect(props['aria-orientation']).toBe('horizontal');
    expect(props['aria-haspopup']).toBe('menu');
    expect(props['aria-activedescendant']).toBe('item-1');
    expect(props['aria-current']).toBe('page');
    expect(props['aria-invalid']).toBe('grammar');
    expect(props['aria-hidden']).toBe('true');
    expect(props['aria-busy']).toBe('true');
    expect(props['aria-selected']).toBe('true');
  });
});

describe('mergeAriaIds()', () => {
  it('should merge multiple IDs into space-separated string', () => {
    expect(mergeAriaIds('id1', 'id2', 'id3')).toBe('id1 id2 id3');
  });

  it('should filter out null and undefined values', () => {
    expect(mergeAriaIds('id1', undefined, 'id2', null)).toBe('id1 id2');
  });

  it('should return undefined when no valid IDs', () => {
    expect(mergeAriaIds(undefined, null)).toBeUndefined();
  });

  it('should return single ID without spaces', () => {
    expect(mergeAriaIds('only-id')).toBe('only-id');
  });
});

describe('hasAccessibleName()', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should return true for element with aria-label', () => {
    const el = document.createElement('button');
    el.setAttribute('aria-label', 'Submit');
    expect(hasAccessibleName(el)).toBe(true);
  });

  it('should return true for element with aria-labelledby pointing to valid element', () => {
    const label = document.createElement('span');
    label.id = 'my-label';
    label.textContent = 'Label text';
    document.body.appendChild(label);

    const el = document.createElement('div');
    el.setAttribute('aria-labelledby', 'my-label');
    document.body.appendChild(el);

    expect(hasAccessibleName(el)).toBe(true);
  });

  it('should return false for aria-labelledby pointing to empty element', () => {
    const label = document.createElement('span');
    label.id = 'empty-label';
    label.textContent = '';
    document.body.appendChild(label);

    const el = document.createElement('div');
    el.setAttribute('aria-labelledby', 'empty-label');
    document.body.appendChild(el);

    expect(hasAccessibleName(el)).toBe(false);
  });

  it('should return true for element with text content', () => {
    const el = document.createElement('button');
    el.textContent = 'Click me';
    expect(hasAccessibleName(el)).toBe(true);
  });

  it('should return true for element with title attribute', () => {
    const el = document.createElement('div');
    el.setAttribute('title', 'Info');
    expect(hasAccessibleName(el)).toBe(true);
  });

  it('should return true for img with alt text', () => {
    const img = document.createElement('img');
    img.setAttribute('alt', 'A photo');
    expect(hasAccessibleName(img)).toBe(true);
  });

  it('should return false for empty element with no accessible attributes', () => {
    const el = document.createElement('div');
    expect(hasAccessibleName(el)).toBe(false);
  });
});
