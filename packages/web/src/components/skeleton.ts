/**
 * compa11y Skeleton Web Component
 *
 * A purely decorative loading placeholder that mimics the shape of content
 * before it arrives. The element itself is hidden from assistive technology
 * (aria-hidden on all inner markup). The surrounding container should
 * communicate loading state via aria-busy="true".
 *
 * @example
 * <!-- Basic shapes -->
 * <compa11y-skeleton variant="text" width="60%"></compa11y-skeleton>
 * <compa11y-skeleton variant="circular" width="48px" height="48px"></compa11y-skeleton>
 * <compa11y-skeleton variant="rectangular" height="200px"></compa11y-skeleton>
 *
 * <!-- Composed card skeleton — container owns the a11y -->
 * <section aria-label="Loading article" aria-busy="true">
 *   <div aria-hidden="true">
 *     <compa11y-skeleton variant="rectangular" height="160px"></compa11y-skeleton>
 *     <compa11y-skeleton variant="text" width="50%" style="margin-top:0.75rem"></compa11y-skeleton>
 *     <compa11y-skeleton variant="text" style="margin-top:0.5rem"></compa11y-skeleton>
 *   </div>
 * </section>
 *
 * @attr {string}  variant   - "text" | "circular" | "rectangular" (default: "rectangular")
 * @attr {string}  width     - CSS width, e.g. "60%", "200px". Defaults vary by variant.
 * @attr {string}  height    - CSS height, e.g. "1em", "120px". Defaults vary by variant.
 * @attr {boolean} animated  - Enable shimmer animation (default: true; remove attr to disable)
 *
 * @cssprop --compa11y-skeleton-bg             Skeleton background  (default #e2e8f0)
 * @cssprop --compa11y-skeleton-shimmer-color  Shimmer highlight    (default rgba(255,255,255,0.6))
 * @cssprop --compa11y-skeleton-radius         Border radius        (default 6px for rectangular, 4px for text)
 */

import { Compa11yElement, defineElement } from '../utils/base-element';
import { SKELETON_STYLES } from '../utils/styles';

export class Compa11ySkeleton extends Compa11yElement {
  static get observedAttributes() {
    return ['variant', 'width', 'height', 'animated'];
  }

  // ── Lifecycle ───────────────────────────────────────────────────────────────

  protected setupAccessibility(): void {
    // Skeleton is purely decorative — no accessible semantics required.
    // aria-hidden is applied inside the shadow DOM on all rendered content.
  }

  protected render(): void {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }

    const variant = this.getAttribute('variant') || 'rectangular';
    const width = this.getAttribute('width') || '';
    const height = this.getAttribute('height') || '';
    const animated = !this.hasAttribute('animated') || this.getAttribute('animated') !== 'false';

    // Per-variant defaults
    const defaultWidth = variant === 'circular' ? '40px' : '100%';
    const defaultHeight =
      variant === 'text' ? '1em' : variant === 'circular' ? '40px' : '20px';

    const resolvedWidth = width || defaultWidth;
    const resolvedHeight = height || defaultHeight;

    this.shadowRoot!.innerHTML = `
      <style>${SKELETON_STYLES}</style>
      <span
        class="skeleton skeleton--${variant}${animated ? ' skeleton--animated' : ''}"
        part="root"
        aria-hidden="true"
        style="width:${resolvedWidth};height:${resolvedHeight}"
      >${animated ? '<span class="skeleton-shimmer" part="shimmer" aria-hidden="true"></span>' : ''}
      </span>
    `;
  }

  protected setupEventListeners(): void {}
  protected cleanupEventListeners(): void {}

  protected onAttributeChange(
    _name: string,
    _old: string | null,
    _next: string | null
  ): void {
    this.render();
  }
}

defineElement('compa11y-skeleton', Compa11ySkeleton);
