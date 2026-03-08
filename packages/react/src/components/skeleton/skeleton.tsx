/**
 * Accessible Skeleton component.
 *
 * A purely decorative loading placeholder that mimics the shape of content
 * before it arrives. Individual skeleton blocks are hidden from assistive
 * technology (aria-hidden="true") — the loading state is communicated by
 * the surrounding container via aria-busy="true", not by each placeholder.
 *
 * @example
 * // Basic shapes
 * <Skeleton variant="text" width="60%" />
 * <Skeleton variant="circular" width={48} height={48} />
 * <Skeleton variant="rectangular" height={200} />
 *
 * // Composed card skeleton — container owns the a11y
 * <section aria-label="Loading profile" aria-busy="true">
 *   <div aria-hidden="true">
 *     <Skeleton variant="circular" width={56} height={56} />
 *     <Skeleton variant="text" width="40%" />
 *     <Skeleton variant="text" width="80%" />
 *   </div>
 * </section>
 *
 * // Disable animation for reduced-motion users (CSS handles it automatically,
 * // but you can also disable programmatically)
 * <Skeleton animated={false} />
 */

import React, { forwardRef, useEffect } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SkeletonVariant = 'text' | 'circular' | 'rectangular';

export interface SkeletonProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * Shape of the skeleton block.
   * - `'text'`        – sized to text height (1em), rounded pill
   * - `'circular'`    – perfect circle (border-radius: 50%)
   * - `'rectangular'` – block rectangle with subtle border-radius (default)
   */
  variant?: SkeletonVariant;

  /**
   * Width of the skeleton. Accepts any CSS length string or a pixel number.
   * Defaults to `100%` for rectangular/text, `40px` for circular.
   * @example width="60%" | width={200} | width="8rem"
   */
  width?: string | number;

  /**
   * Height of the skeleton. Accepts any CSS length string or a pixel number.
   * Defaults to `1em` for text, `40px` for circular, `20px` for rectangular.
   * @example height={120} | height="4rem"
   */
  height?: string | number;

  /**
   * Enable the shimmer animation.
   * CSS automatically respects prefers-reduced-motion when true.
   * @default true
   */
  animated?: boolean;

  /** Strip default styles so you can apply your own. */
  unstyled?: boolean;
}

// ---------------------------------------------------------------------------
// Keyframes — injected once into <head> on first render
// ---------------------------------------------------------------------------

let _keyframesInjected = false;

function injectKeyframes() {
  if (_keyframesInjected || typeof document === 'undefined') return;
  _keyframesInjected = true;
  const style = document.createElement('style');
  style.dataset.compa11ySkeleton = '';
  style.textContent = `
    @keyframes compa11y-skeleton-shimmer {
      0%   { transform: translateX(-100%); }
      100% { transform: translateX(100%);  }
    }
    @media (prefers-reduced-motion: reduce) {
      @keyframes compa11y-skeleton-shimmer {
        0%, 100% { opacity: 0.5; }
        50%       { opacity: 1;   }
      }
    }
  `;
  document.head.appendChild(style);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toCSSValue(v: string | number | undefined): string | undefined {
  if (v === undefined) return undefined;
  return typeof v === 'number' ? `${v}px` : v;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const Skeleton = forwardRef<HTMLSpanElement, SkeletonProps>(
  function Skeleton(
    {
      variant = 'rectangular',
      width,
      height,
      animated = true,
      unstyled = false,
      className = '',
      style,
      ...props
    },
    ref
  ) {
    useEffect(() => {
      injectKeyframes();
    }, []);

    const cssWidth = toCSSValue(width);
    const cssHeight = toCSSValue(height);

    // Sensible per-variant defaults
    const defaultWidth = variant === 'circular' ? '40px' : '100%';
    const defaultHeight =
      variant === 'text' ? '1em' : variant === 'circular' ? '40px' : '20px';

    const rootStyle: React.CSSProperties = unstyled
      ? { width: cssWidth, height: cssHeight, ...style }
      : {
          display: 'block',
          position: 'relative',
          overflow: 'hidden',
          width: cssWidth ?? defaultWidth,
          height: cssHeight ?? defaultHeight,
          borderRadius:
            variant === 'circular'
              ? '50%'
              : variant === 'text'
                ? 'var(--compa11y-skeleton-radius, 4px)'
                : 'var(--compa11y-skeleton-radius, 6px)',
          background: 'var(--compa11y-skeleton-bg, #e2e8f0)',
          ...style,
        };

    const shimmerStyle: React.CSSProperties = {
      position: 'absolute',
      inset: 0,
      background:
        'linear-gradient(90deg, transparent 0%, var(--compa11y-skeleton-shimmer-color, rgba(255,255,255,0.6)) 50%, transparent 100%)',
      animation: 'compa11y-skeleton-shimmer 1.5s ease-in-out infinite',
    };

    return (
      <span
        ref={ref}
        aria-hidden="true"
        data-compa11y-skeleton={!unstyled ? '' : undefined}
        data-variant={!unstyled ? variant : undefined}
        data-animated={!unstyled && animated ? '' : undefined}
        className={['compa11y-skeleton', className].filter(Boolean).join(' ')}
        style={rootStyle}
        {...props}
      >
        {!unstyled && animated && (
          <span
            aria-hidden="true"
            data-compa11y-skeleton-shimmer=""
            style={shimmerStyle}
          />
        )}
      </span>
    );
  }
);
