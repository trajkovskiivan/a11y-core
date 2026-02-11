/**
 * ID generation utilities for accessible components
 *
 * Generates unique, predictable IDs for ARIA relationships
 */

let idCounter = 0;

const PREFIX = 'compa11y';

/**
 * Generate a unique ID with optional prefix
 */
export function generateId(prefix?: string): string {
  const id = ++idCounter;
  return prefix ? `${PREFIX}-${prefix}-${id}` : `${PREFIX}-${id}`;
}

/**
 * Generate a set of related IDs for a component
 * Useful for complex components with multiple ARIA relationships
 */
export function generateIds<T extends readonly string[]>(
  parts: T,
  prefix?: string
): Record<T[number], string> {
  const baseId = generateId(prefix);
  const ids = {} as Record<string, string>;

  for (const part of parts) {
    ids[part] = `${baseId}-${part}`;
  }

  return ids as Record<T[number], string>;
}

/**
 * Reset the ID counter (useful for testing)
 */
export function resetIdCounter(): void {
  idCounter = 0;
}

/**
 * Create a scoped ID generator for a component instance
 */
export function createIdScope(componentName: string) {
  const scopeId = generateId(componentName);

  return {
    id: scopeId,
    generate: (suffix: string) => `${scopeId}-${suffix}`,
    generateMultiple: <T extends readonly string[]>(parts: T) => {
      const ids = {} as Record<string, string>;
      for (const part of parts) {
        ids[part] = `${scopeId}-${part}`;
      }
      return ids as Record<T[number], string>;
    },
  };
}
