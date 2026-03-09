import { describe, it, expect, beforeEach } from 'vitest';
import { generateId, generateIds, resetIdCounter, createIdScope } from './id';

describe('id utilities', () => {
  beforeEach(() => {
    resetIdCounter();
  });

  describe('generateId', () => {
    it('should return string with compa11y- prefix', () => {
      const id = generateId();
      expect(id).toMatch(/^compa11y-/);
    });

    it('should include the custom prefix', () => {
      const id = generateId('btn');
      expect(id).toBe('compa11y-btn-1');
    });

    it('should produce unique IDs with incrementing counter', () => {
      const id1 = generateId();
      const id2 = generateId();
      const id3 = generateId();

      expect(id1).toBe('compa11y-1');
      expect(id2).toBe('compa11y-2');
      expect(id3).toBe('compa11y-3');
      expect(new Set([id1, id2, id3]).size).toBe(3);
    });
  });

  describe('resetIdCounter', () => {
    it('should reset the counter so IDs start from 1 again', () => {
      generateId();
      generateId();
      resetIdCounter();
      const id = generateId();
      expect(id).toBe('compa11y-1');
    });
  });

  describe('generateIds', () => {
    it('should return object with keys for each part and proper prefixes', () => {
      const ids = generateIds(['trigger', 'panel'] as const, 'tabs');

      expect(ids).toHaveProperty('trigger');
      expect(ids).toHaveProperty('panel');
      expect(ids.trigger).toBe('compa11y-tabs-1-trigger');
      expect(ids.panel).toBe('compa11y-tabs-1-panel');
    });
  });

  describe('createIdScope', () => {
    it('should return a scoped generator with an id property', () => {
      const scope = createIdScope('dialog');

      expect(scope.id).toBe('compa11y-dialog-1');
      expect(typeof scope.generate).toBe('function');
      expect(typeof scope.generateMultiple).toBe('function');
    });

    it('generate should produce scoped IDs with suffix', () => {
      const scope = createIdScope('dialog');

      const titleId = scope.generate('title');
      expect(titleId).toBe('compa11y-dialog-1-title');
    });

    it('generateMultiple should produce object of scoped IDs', () => {
      const scope = createIdScope('dialog');
      const ids = scope.generateMultiple(['title', 'description', 'close'] as const);

      expect(ids.title).toBe('compa11y-dialog-1-title');
      expect(ids.description).toBe('compa11y-dialog-1-description');
      expect(ids.close).toBe('compa11y-dialog-1-close');
    });
  });
});
