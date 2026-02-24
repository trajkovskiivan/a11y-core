/**
 * Accessible Text and Heading components.
 *
 * Typography primitives that render semantic HTML elements.
 *
 * @example
 * ```tsx
 * // Heading
 * <Heading level={1}>Page Title</Heading>
 * <Heading level={2} size="lg">Smaller h2</Heading>
 *
 * // Text
 * <Text>Body paragraph.</Text>
 * <Text size="sm" color="muted">Small muted text.</Text>
 * <Text as="span">Inline text.</Text>
 * <Text truncate>Long text that gets cut off...</Text>
 * ```
 */

import React, { forwardRef } from 'react';

// ============================================================================
// Shared types
// ============================================================================

type TextSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
type TextColor = 'default' | 'muted' | 'accent' | 'error' | 'success' | 'warning';
type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold';
type TextAlign = 'left' | 'center' | 'right';

const SIZE_MAP: Record<TextSize, string> = {
  xs: '0.75rem',
  sm: '0.875rem',
  md: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
};

const LINE_HEIGHT_MAP: Record<TextSize, number> = {
  xs: 1.5,
  sm: 1.5,
  md: 1.5,
  lg: 1.5,
  xl: 1.4,
  '2xl': 1.3,
  '3xl': 1.25,
};

const COLOR_MAP: Record<TextColor, string> = {
  default: 'inherit',
  muted: '#666',
  accent: '#0066cc',
  error: '#dc2626',
  success: '#16a34a',
  warning: '#d97706',
};

const WEIGHT_MAP: Record<TextWeight, number> = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
};

const HEADING_SIZES: Record<number, { fontSize: string; lineHeight: number; fontWeight: number }> = {
  1: { fontSize: '2.25rem', lineHeight: 1.2, fontWeight: 700 },
  2: { fontSize: '1.875rem', lineHeight: 1.25, fontWeight: 700 },
  3: { fontSize: '1.5rem', lineHeight: 1.3, fontWeight: 600 },
  4: { fontSize: '1.25rem', lineHeight: 1.35, fontWeight: 600 },
  5: { fontSize: '1.125rem', lineHeight: 1.4, fontWeight: 600 },
  6: { fontSize: '1rem', lineHeight: 1.5, fontWeight: 600 },
};

// ============================================================================
// Heading
// ============================================================================

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** Heading level 1–6 */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Override the default size for this heading level */
  size?: TextSize;
  /** Text color variant */
  color?: TextColor;
  /** Font weight override */
  weight?: TextWeight;
  /** Text alignment */
  align?: TextAlign;
  /** Truncate with ellipsis */
  truncate?: boolean;
  /** Remove default styles */
  unstyled?: boolean;
}

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  function Heading(
    {
      level = 2,
      size,
      color = 'default',
      weight,
      align,
      truncate = false,
      unstyled = false,
      style,
      children,
      ...props
    },
    ref
  ) {
    const Tag = `h${level}` as const;
    const defaults = HEADING_SIZES[level] ?? HEADING_SIZES[2]!;

    const resolvedStyle: React.CSSProperties | undefined = unstyled
      ? style
      : {
          margin: 0,
          fontSize: size ? SIZE_MAP[size] : defaults.fontSize,
          lineHeight: size ? LINE_HEIGHT_MAP[size] : defaults.lineHeight,
          fontWeight: weight ? WEIGHT_MAP[weight] : defaults.fontWeight,
          color: COLOR_MAP[color],
          textAlign: align,
          ...(truncate
            ? { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }
            : undefined),
          ...style,
        };

    return (
      <Tag
        ref={ref as React.Ref<HTMLHeadingElement>}
        data-compa11y-heading
        data-level={level}
        style={resolvedStyle}
        {...props}
      >
        {children}
      </Tag>
    );
  }
);

// ============================================================================
// Text
// ============================================================================

type TextElement = 'p' | 'span' | 'div' | 'label';

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  /** HTML element to render */
  as?: TextElement;
  /** Text size */
  size?: TextSize;
  /** Text color variant */
  color?: TextColor;
  /** Font weight */
  weight?: TextWeight;
  /** Text alignment */
  align?: TextAlign;
  /** Truncate with ellipsis */
  truncate?: boolean;
  /** Remove default styles */
  unstyled?: boolean;
}

export const Text = forwardRef<HTMLElement, TextProps>(
  function Text(
    {
      as: Tag = 'p',
      size = 'md',
      color = 'default',
      weight,
      align,
      truncate = false,
      unstyled = false,
      style,
      children,
      ...props
    },
    ref
  ) {
    const resolvedStyle: React.CSSProperties | undefined = unstyled
      ? style
      : {
          margin: 0,
          fontSize: SIZE_MAP[size],
          lineHeight: LINE_HEIGHT_MAP[size],
          color: COLOR_MAP[color],
          ...(weight ? { fontWeight: WEIGHT_MAP[weight] } : undefined),
          ...(align ? { textAlign: align } : undefined),
          ...(truncate
            ? { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }
            : undefined),
          ...style,
        };

    return (
      <Tag
        ref={ref as React.Ref<never>}
        data-compa11y-text
        style={resolvedStyle}
        {...props}
      >
        {children}
      </Tag>
    );
  }
);
