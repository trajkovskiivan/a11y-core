import { useId as useReactId, useMemo } from 'react';

/**
 * Generate a unique ID for accessibility purposes
 *
 * Uses React's useId when available, with a fallback for SSR
 */
export function useId(prefix?: string): string {
  // Use React 18's useId as the base
  const reactId = useReactId();

  return useMemo(() => {
    // Clean up React's ID format (removes colons)
    const cleanId = reactId.replace(/:/g, '');
    return prefix ? `a11ykit-${prefix}-${cleanId}` : `a11ykit-${cleanId}`;
  }, [reactId, prefix]);
}

/**
 * Generate multiple related IDs for a component
 */
export function useIds<T extends readonly string[]>(
  parts: T,
  prefix?: string
): Record<T[number], string> {
  const baseId = useId(prefix);

  return useMemo(() => {
    const ids = {} as Record<string, string>;
    for (const part of parts) {
      ids[part] = `${baseId}-${part}`;
    }
    return ids as Record<T[number], string>;
  }, [baseId, parts]);
}

/**
 * Create a scoped ID generator for complex components
 */
export function useIdScope(componentName: string) {
  const scopeId = useId(componentName);

  return useMemo(
    () => ({
      id: scopeId,
      generate: (suffix: string) => `${scopeId}-${suffix}`,
      generateMultiple: <T extends readonly string[]>(parts: T) => {
        const ids = {} as Record<string, string>;
        for (const part of parts) {
          ids[part] = `${scopeId}-${part}`;
        }
        return ids as Record<T[number], string>;
      },
    }),
    [scopeId]
  );
}
