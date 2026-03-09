/**
 * compa11y Carousel Web Component
 *
 * A content carousel with keyboard navigation, screen-reader announcements,
 * optional autoplay (pauses on focus/hover), and pagination dots.
 *
 * Single-slide:
 *   <compa11y-carousel aria-label="Featured products">
 *     <div slot="slide">Slide 1</div>
 *     <div slot="slide">Slide 2</div>
 *     <div slot="slide">Slide 3</div>
 *   </compa11y-carousel>
 *
 * Multi-slide:
 *   <compa11y-carousel aria-label="Articles" slides-per-view="3">
 *     <div slot="slide">Card 1</div>
 *     ...
 *   </compa11y-carousel>
 *
 * Autoplay:
 *   <compa11y-carousel aria-label="Hero" autoplay autoplay-interval="6000">
 *     ...
 *   </compa11y-carousel>
 *
 * Events:
 *   compa11y-carousel-change  { activeIndex: number, slideCount: number }
 *
 * CSS vars:
 *   --compa11y-carousel-gap
 *   --compa11y-carousel-dot-size
 *   --compa11y-carousel-dot-color
 *   --compa11y-carousel-dot-active-color
 */

import { announcePolite, createComponentWarnings, prefersReducedMotion } from '@compa11y/core';
import { Compa11yElement, defineElement } from '../utils/base-element';
import { CAROUSEL_STYLES } from '../utils/styles';

const warnings = createComponentWarnings('Carousel');

export class Compa11yCarousel extends Compa11yElement {
  // Internal state
  private _activeIndex = 0;
  private _slideCount = 0;
  private _loop = false;
  private _autoplay = false;
  private _paused = true;
  private _autoplayInterval = 5000;
  private _slidesPerView = 1;
  private _hideNonActive = false;
  private _orientation: 'horizontal' | 'vertical' = 'horizontal';
  private _autoplayTimer: ReturnType<typeof setInterval> | null = null;
  /** Whether the user explicitly paused via the pause button */
  private _userPaused = false;

  static get observedAttributes(): string[] {
    return [
      'value',
      'loop',
      'autoplay',
      'autoplay-interval',
      'slides-per-view',
      'hide-non-active',
      'orientation',
      'aria-label',
      'disabled',
    ];
  }

  get activeIndex(): number {
    return this._activeIndex;
  }
  set activeIndex(v: number) {
    this.goToSlide(v);
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────

  protected setupAccessibility(): void {
    this._activeIndex = parseInt(this.getAttribute('value') ?? '0', 10) || 0;
    this._loop = this.hasAttribute('loop');
    this._autoplay = this.hasAttribute('autoplay') && !prefersReducedMotion();
    this._paused = !this._autoplay;
    this._autoplayInterval =
      parseInt(this.getAttribute('autoplay-interval') ?? '5000', 10) || 5000;
    this._slidesPerView =
      Math.max(1, parseInt(this.getAttribute('slides-per-view') ?? '1', 10) || 1);
    this._hideNonActive = this.hasAttribute('hide-non-active');
    this._orientation =
      (this.getAttribute('orientation') as 'horizontal' | 'vertical') ?? 'horizontal';

    const hasLabel =
      this.hasAttribute('aria-label') || this.hasAttribute('aria-labelledby');
    if (!hasLabel) {
      warnings.error(
        'Carousel has no accessible label. Add aria-label="..." or aria-labelledby="..." attribute.\n' +
          '💡 Suggestion: <compa11y-carousel aria-label="Featured items">...</compa11y-carousel>'
      );
    }

    // Warn if autoplay is enabled but no pause control will be available
    if (this.hasAttribute('autoplay')) {
      requestAnimationFrame(() => {
        const pauseBtn = this.shadowRoot?.querySelector('.carousel-pause');
        if (!pauseBtn) {
          warnings.warning(
            'Carousel with autoplay should include a pause control for accessibility.\n' +
              '💡 Suggestion: Ensure autoplay is not suppressed by prefers-reduced-motion, or provide a custom pause mechanism.'
          );
        }
      });
    }
  }

  protected render(): void {
    const shadow = this.attachShadow({ mode: 'open' });
    const liveId = `${this._id}-live`;
    const statusId = `${this._id}-status`;

    shadow.innerHTML = `
      <style>${CAROUSEL_STYLES}</style>

      <div
        class="carousel-root"
        part="root"
        role="region"
        aria-roledescription="carousel"
      >
        <!-- Status text -->
        <div id="${statusId}" class="carousel-status" part="status"></div>

        <!-- Controls -->
        <div class="carousel-controls" part="controls">
          <button type="button" class="carousel-prev" part="prev" aria-label="Previous slide">
            <slot name="prev-label">&#8249;</slot>
          </button>
          <button type="button" class="carousel-next" part="next" aria-label="Next slide">
            <slot name="next-label">&#8250;</slot>
          </button>
          ${this._autoplay ? `
            <button type="button" class="carousel-pause" part="pause"
              aria-label="${this._paused ? 'Start autoplay' : 'Pause autoplay'}"
              aria-pressed="${!this._paused}">
              <slot name="pause-label">${this._paused ? 'Play' : 'Pause'}</slot>
            </button>
          ` : ''}
        </div>

        <!-- Viewport -->
        <div class="carousel-viewport" part="viewport" aria-describedby="${statusId}">
          <div class="carousel-track" part="track">
            <slot name="slide"></slot>
          </div>
        </div>

        <!-- Pagination dots -->
        <div class="carousel-pagination" part="pagination" role="group" aria-label="Choose slide"></div>

        <!-- Live region (always in DOM) -->
        <div id="${liveId}" role="status" aria-live="polite" aria-atomic="true" style="
          position:absolute;width:1px;height:1px;padding:0;margin:-1px;
          overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;
        "></div>
      </div>
    `;

    this.syncSlideBasis();
    this.countSlides();
    this.syncUI();
    this.startAutoplay();
  }

  protected setupEventListeners(): void {
    const prev = this.shadowRoot?.querySelector('.carousel-prev') as HTMLElement | null;
    const next = this.shadowRoot?.querySelector('.carousel-next') as HTMLElement | null;
    const pause = this.shadowRoot?.querySelector('.carousel-pause') as HTMLElement | null;
    const viewport = this.shadowRoot?.querySelector('.carousel-viewport') as HTMLElement | null;

    prev?.addEventListener('click', this.handlePrev);
    next?.addEventListener('click', this.handleNext);
    pause?.addEventListener('click', this.handleTogglePause);
    viewport?.addEventListener('keydown', this.handleViewportKeyDown as EventListener);

    // Slot change to detect slides
    const slot = this.shadowRoot?.querySelector('slot[name="slide"]') as HTMLSlotElement | null;
    slot?.addEventListener('slotchange', this.handleSlotChange);

    // Pause autoplay on focus/hover
    this.addEventListener('focusin', this.handleFocusIn);
    this.addEventListener('focusout', this.handleFocusOut);
    this.addEventListener('mouseenter', this.handleMouseEnter);
    this.addEventListener('mouseleave', this.handleMouseLeave);
  }

  protected cleanupEventListeners(): void {
    const prev = this.shadowRoot?.querySelector('.carousel-prev') as HTMLElement | null;
    const next = this.shadowRoot?.querySelector('.carousel-next') as HTMLElement | null;
    const pause = this.shadowRoot?.querySelector('.carousel-pause') as HTMLElement | null;
    const viewport = this.shadowRoot?.querySelector('.carousel-viewport') as HTMLElement | null;

    prev?.removeEventListener('click', this.handlePrev);
    next?.removeEventListener('click', this.handleNext);
    pause?.removeEventListener('click', this.handleTogglePause);
    viewport?.removeEventListener('keydown', this.handleViewportKeyDown as EventListener);

    const slot = this.shadowRoot?.querySelector('slot[name="slide"]') as HTMLSlotElement | null;
    slot?.removeEventListener('slotchange', this.handleSlotChange);

    this.removeEventListener('focusin', this.handleFocusIn);
    this.removeEventListener('focusout', this.handleFocusOut);
    this.removeEventListener('mouseenter', this.handleMouseEnter);
    this.removeEventListener('mouseleave', this.handleMouseLeave);

    this.stopAutoplay();
  }

  protected onAttributeChange(name: string, _old: string | null, next: string | null): void {
    if (name === 'value') {
      const v = parseInt(next ?? '0', 10);
      if (!isNaN(v)) this.goToSlide(v);
    }
    if (name === 'loop') this._loop = next !== null;
    if (name === 'autoplay') {
      this._autoplay = next !== null && !prefersReducedMotion();
      this._paused = !this._autoplay;
      if (this._autoplay) this.startAutoplay();
      else this.stopAutoplay();
    }
    if (name === 'autoplay-interval') {
      this._autoplayInterval = parseInt(next ?? '5000', 10) || 5000;
      if (this._autoplay && !this._paused) {
        this.stopAutoplay();
        this.startAutoplay();
      }
    }
    if (name === 'slides-per-view') {
      this._slidesPerView = Math.max(1, parseInt(next ?? '1', 10) || 1);
      this.syncSlideBasis();
      this.syncUI();
    }
    if (name === 'hide-non-active') {
      this._hideNonActive = next !== null;
      this.syncUI();
    }
    if (name === 'orientation') {
      this._orientation = (next as 'horizontal' | 'vertical') ?? 'horizontal';
    }
  }

  // ── Slide counting ─────────────────────────────────────────────────────

  private countSlides(): void {
    const slot = this.shadowRoot?.querySelector('slot[name="slide"]') as HTMLSlotElement | null;
    const slides = slot?.assignedElements() ?? [];
    this._slideCount = slides.length;
    if (this._activeIndex >= this._slideCount && this._slideCount > 0) {
      this._activeIndex = this._slideCount - 1;
    }
  }

  private getSlides(): Element[] {
    const slot = this.shadowRoot?.querySelector('slot[name="slide"]') as HTMLSlotElement | null;
    return slot?.assignedElements() ?? [];
  }

  // ── Navigation ─────────────────────────────────────────────────────────

  private goToSlide(index: number): void {
    if (this._slideCount === 0) return;
    let next = index;
    if (this._loop) {
      next = ((index % this._slideCount) + this._slideCount) % this._slideCount;
    } else {
      next = Math.max(0, Math.min(index, this._slideCount - 1));
    }
    if (next === this._activeIndex) return;
    this._activeIndex = next;
    this.setAttribute('value', String(next));
    this.syncUI();
    this.emit('compa11y-carousel-change', {
      activeIndex: next,
      slideCount: this._slideCount,
    });
    this.announceSlide();
  }

  private announceSlide(): void {
    if (this._slidesPerView > 1) {
      const end = Math.min(this._activeIndex + this._slidesPerView, this._slideCount);
      announcePolite(`Showing slides ${this._activeIndex + 1} to ${end} of ${this._slideCount}`);
    } else {
      announcePolite(`Slide ${this._activeIndex + 1} of ${this._slideCount}`);
    }
  }

  // ── Autoplay ───────────────────────────────────────────────────────────

  private startAutoplay(): void {
    this.stopAutoplay();
    if (!this._autoplay || this._paused || this._slideCount <= 1) return;
    this._autoplayTimer = setInterval(() => {
      if (this._loop) {
        this.goToSlide(this._activeIndex + 1);
      } else if (this._activeIndex < this._slideCount - 1) {
        this.goToSlide(this._activeIndex + 1);
      }
    }, this._autoplayInterval);
  }

  private stopAutoplay(): void {
    if (this._autoplayTimer !== null) {
      clearInterval(this._autoplayTimer);
      this._autoplayTimer = null;
    }
  }

  // ── UI sync ────────────────────────────────────────────────────────────

  private syncUI(): void {
    this.syncTrackPosition();
    this.syncSlideVisibility();
    this.syncPagination();
    this.syncStatus();
    this.syncControls();
  }

  private syncTrackPosition(): void {
    const track = this.shadowRoot?.querySelector('.carousel-track') as HTMLElement | null;
    if (!track) return;
    const offsetPercent = -(this._activeIndex * (100 / this._slidesPerView));
    if (this._orientation === 'vertical') {
      track.style.transform = `translateY(${offsetPercent}%)`;
    } else {
      track.style.transform = `translateX(${offsetPercent}%)`;
    }
    // Disable transition when prefers-reduced-motion
    if (prefersReducedMotion()) {
      track.style.transition = 'none';
    }
  }

  private syncSlideBasis(): void {
    this.style.setProperty(
      '--compa11y-carousel-slide-basis',
      `${100 / this._slidesPerView}%`
    );
  }

  private syncSlideVisibility(): void {
    const slides = this.getSlides();
    slides.forEach((slide, i) => {
      const isVisible = i >= this._activeIndex && i < this._activeIndex + this._slidesPerView;
      const el = slide as HTMLElement;

      if (this._hideNonActive) {
        el.style.display = isVisible ? '' : 'none';
        el.removeAttribute('aria-hidden');
      } else {
        el.style.display = '';
        el.setAttribute('aria-hidden', String(!isVisible));
      }

      el.setAttribute('aria-roledescription', 'slide');
      el.setAttribute('aria-label', `Slide ${i + 1} of ${this._slideCount}`);
      if (isVisible) {
        el.setAttribute('data-active', '');
      } else {
        el.removeAttribute('data-active');
      }
    });
  }

  private syncPagination(): void {
    const container = this.shadowRoot?.querySelector('.carousel-pagination') as HTMLElement | null;
    if (!container) return;

    if (this._slideCount <= 1) {
      container.innerHTML = '';
      return;
    }

    // Only rebuild if count changed
    const existingDots = container.querySelectorAll('button');
    if (existingDots.length !== this._slideCount) {
      container.innerHTML = '';
      for (let i = 0; i < this._slideCount; i++) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'carousel-dot';
        dot.setAttribute('part', 'dot');
        dot.setAttribute('aria-label', `Go to slide ${i + 1} of ${this._slideCount}`);
        dot.addEventListener('click', () => this.goToSlide(i));
        container.appendChild(dot);
      }
    }

    // Update active state
    const dots = container.querySelectorAll('button');
    dots.forEach((dot, i) => {
      if (i === this._activeIndex) {
        dot.setAttribute('aria-current', 'true');
        dot.setAttribute('data-active', '');
      } else {
        dot.removeAttribute('aria-current');
        dot.removeAttribute('data-active');
      }
    });
  }

  private syncStatus(): void {
    const status = this.shadowRoot?.querySelector('.carousel-status') as HTMLElement | null;
    if (!status) return;
    if (this._slidesPerView > 1) {
      const end = Math.min(this._activeIndex + this._slidesPerView, this._slideCount);
      status.textContent = `Showing slides ${this._activeIndex + 1}\u2013${end} of ${this._slideCount}`;
    } else {
      status.textContent = `Slide ${this._activeIndex + 1} of ${this._slideCount}`;
    }
  }

  private syncControls(): void {
    const prev = this.shadowRoot?.querySelector('.carousel-prev') as HTMLButtonElement | null;
    const next = this.shadowRoot?.querySelector('.carousel-next') as HTMLButtonElement | null;
    if (prev) prev.disabled = !this._loop && this._activeIndex <= 0;
    if (next) next.disabled = !this._loop && this._activeIndex >= this._slideCount - this._slidesPerView;
  }

  // ── Event handlers ─────────────────────────────────────────────────────

  private handlePrev = (): void => {
    this.goToSlide(this._activeIndex - 1);
  };

  private handleNext = (): void => {
    this.goToSlide(this._activeIndex + 1);
  };

  private handleTogglePause = (): void => {
    this._userPaused = !this._userPaused;
    this._paused = this._userPaused;
    this.syncPauseButton();
    if (this._paused) {
      this.stopAutoplay();
      announcePolite('Autoplay paused');
    } else {
      this.startAutoplay();
      announcePolite('Autoplay started');
    }
  };

  private syncPauseButton(): void {
    const btn = this.shadowRoot?.querySelector('.carousel-pause') as HTMLButtonElement | null;
    if (!btn) return;
    btn.setAttribute('aria-label', this._paused ? 'Start autoplay' : 'Pause autoplay');
    btn.setAttribute('aria-pressed', String(!this._paused));
    // Update the fallback text (only if user hasn't slotted custom content)
    const slot = btn.querySelector('slot[name="pause-label"]') as HTMLSlotElement | null;
    if (slot && slot.assignedElements().length === 0) {
      slot.textContent = this._paused ? 'Play' : 'Pause';
    }
  }

  private handleViewportKeyDown = (e: KeyboardEvent): void => {
    const isHorizontal = this._orientation === 'horizontal';
    if (e.key === 'ArrowLeft' && isHorizontal) { e.preventDefault(); this.goToSlide(this._activeIndex - 1); }
    if (e.key === 'ArrowRight' && isHorizontal) { e.preventDefault(); this.goToSlide(this._activeIndex + 1); }
    if (e.key === 'ArrowUp' && !isHorizontal) { e.preventDefault(); this.goToSlide(this._activeIndex - 1); }
    if (e.key === 'ArrowDown' && !isHorizontal) { e.preventDefault(); this.goToSlide(this._activeIndex + 1); }
    if (e.key === 'Home') { e.preventDefault(); this.goToSlide(0); }
    if (e.key === 'End') { e.preventDefault(); this.goToSlide(this._slideCount - 1); }
  };

  private handleSlotChange = (): void => {
    this.countSlides();
    this.syncUI();
  };

  private handleFocusIn = (): void => {
    if (this._autoplay && !this._userPaused) {
      this.stopAutoplay();
    }
  };

  private handleFocusOut = (e: FocusEvent): void => {
    if (this._autoplay && !this._userPaused && !this.contains(e.relatedTarget as Node)) {
      this._paused = false;
      this.startAutoplay();
    }
  };

  private handleMouseEnter = (): void => {
    if (this._autoplay && !this._userPaused) {
      this.stopAutoplay();
    }
  };

  private handleMouseLeave = (): void => {
    if (this._autoplay && !this._userPaused) {
      this._paused = false;
      this.startAutoplay();
    }
  };
}

defineElement('compa11y-carousel', Compa11yCarousel);

export default Compa11yCarousel;
