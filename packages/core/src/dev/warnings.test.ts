import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  warn,
  clearWarnings,
  setWarningHandler,
  checks,
  createComponentWarnings,
} from './warnings';

describe('warnings', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let infoSpy: ReturnType<typeof vi.spyOn>;
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    clearWarnings();
    setWarningHandler(null);
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('warn()', () => {
    it('should call console.error for error type', () => {
      warn({ type: 'error', component: 'TestComp', message: 'An error occurred' });
      expect(errorSpy).toHaveBeenCalledOnce();
      // Format: '%c[compa11y/TestComp]%c An error occurred', style, ''
      expect(errorSpy.mock.calls[0][0]).toContain('An error occurred');
    });

    it('should call console.warn for warning type', () => {
      warn({ type: 'warning', component: 'TestComp', message: 'A warning occurred' });
      expect(warnSpy).toHaveBeenCalledOnce();
      expect(warnSpy.mock.calls[0][0]).toContain('A warning occurred');
    });

    it('should call console.info for info type', () => {
      warn({ type: 'info', component: 'TestComp', message: 'Some info' });
      expect(infoSpy).toHaveBeenCalledOnce();
      expect(infoSpy.mock.calls[0][0]).toContain('Some info');
    });

    it('should deduplicate — same component+message only warns once', () => {
      warn({ type: 'error', component: 'TestComp', message: 'duplicate msg' });
      warn({ type: 'error', component: 'TestComp', message: 'duplicate msg' });
      expect(errorSpy).toHaveBeenCalledOnce();
    });

    it('clearWarnings() should allow the same warning to fire again', () => {
      warn({ type: 'error', component: 'TestComp', message: 'dup msg' });
      expect(errorSpy).toHaveBeenCalledOnce();

      clearWarnings();

      warn({ type: 'error', component: 'TestComp', message: 'dup msg' });
      expect(errorSpy).toHaveBeenCalledTimes(2);
    });

    it('should include suggestion in message when provided', () => {
      warn({
        type: 'warning',
        component: 'TestComp',
        message: 'Missing label',
        suggestion: 'Add aria-label',
      });
      const outputMessage = warnSpy.mock.calls[0][0] as string;
      expect(outputMessage).toContain('Missing label');
      expect(outputMessage).toContain('Suggestion: Add aria-label');
    });

    it('should log element when provided', () => {
      const el = document.createElement('div');
      warn({ type: 'error', component: 'TestComp', message: 'bad element', element: el });
      expect(logSpy).toHaveBeenCalledWith('Element:', el);
    });
  });

  describe('setWarningHandler()', () => {
    it('custom handler should receive warning object instead of console output', () => {
      const handler = vi.fn();
      setWarningHandler(handler);

      const warning = { type: 'error' as const, component: 'Test', message: 'test msg' };
      warn(warning);

      expect(handler).toHaveBeenCalledWith(warning);
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('setting handler to null should revert to console', () => {
      const handler = vi.fn();
      setWarningHandler(handler);
      warn({ type: 'error', component: 'Test', message: 'msg1' });
      expect(handler).toHaveBeenCalledOnce();

      clearWarnings();
      setWarningHandler(null);
      warn({ type: 'error', component: 'Test', message: 'msg1' });
      expect(errorSpy).toHaveBeenCalledOnce();
    });
  });

  describe('checks', () => {
    it('accessibleLabel should warn for element without accessible name', () => {
      const el = document.createElement('div');
      checks.accessibleLabel(el, 'TestComp');
      expect(errorSpy).toHaveBeenCalledOnce();
    });

    it('accessibleLabel should NOT warn for element with aria-label', () => {
      const el = document.createElement('div');
      el.setAttribute('aria-label', 'My label');
      checks.accessibleLabel(el, 'TestComp');
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('requiredProp should warn for undefined/null/empty values', () => {
      checks.requiredProp(undefined, 'label', 'TestComp');
      clearWarnings();
      checks.requiredProp(null, 'label', 'TestComp');
      clearWarnings();
      checks.requiredProp('', 'label', 'TestComp');

      expect(errorSpy).toHaveBeenCalledTimes(3);
    });

    it('requiredProp should NOT warn for valid values', () => {
      checks.requiredProp('hello', 'label', 'TestComp');
      checks.requiredProp(0, 'count', 'TestComp');
      checks.requiredProp(false, 'disabled', 'TestComp');
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('validRole should warn for invalid role', () => {
      checks.validRole('foobar', 'TestComp');
      expect(warnSpy).toHaveBeenCalledOnce();
    });

    it('validRole should NOT warn for valid role like "button"', () => {
      checks.validRole('button', 'TestComp');
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('tabIndex should warn for positive tabIndex', () => {
      checks.tabIndex(5, 'TestComp');
      expect(warnSpy).toHaveBeenCalledOnce();
    });

    it('tabIndex should NOT warn for 0 or -1', () => {
      checks.tabIndex(0, 'TestComp');
      checks.tabIndex(-1, 'TestComp');
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('keyboardAccessible should warn for element with onClick but no onKeyDown and interactive role', () => {
      const el = document.createElement('div');
      el.setAttribute('role', 'button');
      checks.keyboardAccessible(el, 'TestComp', { onClick: () => {}, onKeyDown: undefined });
      expect(warnSpy).toHaveBeenCalledOnce();
    });

    it('formLabel should warn for input without label', () => {
      const input = document.createElement('input');
      checks.formLabel(input, undefined, 'TestComp');
      expect(errorSpy).toHaveBeenCalledOnce();
    });

    it('imageAlt should warn for img without alt', () => {
      const img = document.createElement('img');
      checks.imageAlt(img, 'TestComp');
      expect(errorSpy).toHaveBeenCalledOnce();
    });
  });

  describe('createComponentWarnings()', () => {
    it('.error() should issue error warning scoped to component name', () => {
      const warnings = createComponentWarnings('MyButton');
      warnings.error('Something is wrong');
      expect(errorSpy).toHaveBeenCalledOnce();
      const msg = errorSpy.mock.calls[0][0] as string;
      expect(msg).toContain('MyButton');
    });

    it('.warning() should issue warning scoped to component name', () => {
      const warnings = createComponentWarnings('MyButton');
      warnings.warning('Consider fixing this');
      expect(warnSpy).toHaveBeenCalledOnce();
      const msg = warnSpy.mock.calls[0][0] as string;
      expect(msg).toContain('MyButton');
    });

    it('.info() should issue info scoped to component name', () => {
      const warnings = createComponentWarnings('MyButton');
      warnings.info('FYI');
      expect(infoSpy).toHaveBeenCalledOnce();
      const msg = infoSpy.mock.calls[0][0] as string;
      expect(msg).toContain('MyButton');
    });

    it('.checks.accessibleLabel should work with scoped component name', () => {
      const warnings = createComponentWarnings('MyButton');
      const el = document.createElement('div');
      warnings.checks.accessibleLabel(el);
      expect(errorSpy).toHaveBeenCalledOnce();
      const msg = errorSpy.mock.calls[0][0] as string;
      expect(msg).toContain('MyButton');
    });
  });
});
