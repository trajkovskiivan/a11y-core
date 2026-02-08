import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFocusVisible, useFocusWithin } from './use-focus-visible';

describe('useFocusVisible', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should return isFocusVisible and focusProps', () => {
    const { result } = renderHook(() => useFocusVisible());

    expect(result.current.isFocusVisible).toBe(false);
    expect(result.current.focusProps).toBeDefined();
    expect(result.current.focusProps.onFocus).toBeInstanceOf(Function);
    expect(result.current.focusProps.onBlur).toBeInstanceOf(Function);
  });

  it('should set isFocusVisible to false on blur', () => {
    const { result } = renderHook(() => useFocusVisible());

    act(() => {
      result.current.focusProps.onBlur();
    });

    expect(result.current.isFocusVisible).toBe(false);
  });
});

describe('useFocusWithin', () => {
  it('should return ref, hasFocus, and focusWithinProps', () => {
    const { result } = renderHook(() => useFocusWithin());

    expect(result.current.ref).toBeDefined();
    expect(result.current.hasFocus).toBe(false);
    expect(result.current.focusWithinProps).toBeDefined();
    expect(result.current.focusWithinProps.onFocus).toBeInstanceOf(Function);
    expect(result.current.focusWithinProps.onBlur).toBeInstanceOf(Function);
  });

  it('should set hasFocus to true on focus', () => {
    const { result } = renderHook(() => useFocusWithin());

    act(() => {
      result.current.focusWithinProps.onFocus();
    });

    expect(result.current.hasFocus).toBe(true);
  });
});
