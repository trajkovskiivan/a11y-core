import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useId } from '../../hooks/use-id';
import { useAnnouncer } from '../../hooks/use-announcer';
import { useKeyboard } from '../../hooks/use-keyboard';
import { createComponentWarnings, prefersReducedMotion } from '@compa11y/core';
import {
  CarouselProvider,
  useCarouselContext,
  type CarouselContextValue,
} from './carousel-context';

const warn = createComponentWarnings('Carousel');

// ---------------------------------------------------------------------------
// Visually hidden style
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Root — Carousel
// ---------------------------------------------------------------------------

export interface CarouselProps extends React.HTMLAttributes<HTMLElement> {
  /** Accessible label for the carousel region */
  ariaLabel?: string;
  /** Controlled active slide index (0-based) */
  value?: number;
  /** Uncontrolled starting index */
  defaultValue?: number;
  /** Called when active slide changes */
  onValueChange?: (index: number) => void;
  /** Wrap from last to first and vice versa */
  loop?: boolean;
  /** Number of slides visible at once */
  slidesPerView?: number;
  /** Hide non-active slides from the accessibility tree (single-slide mode) */
  hideNonActiveSlides?: boolean;
  /** Enable autoplay (default false) */
  autoplay?: boolean;
  /** Autoplay interval in ms */
  autoplayInterval?: number;
  /** Orientation */
  orientation?: 'horizontal' | 'vertical';
  children: React.ReactNode;
}

export const Carousel = forwardRef<HTMLElement, CarouselProps>(
  function Carousel(
    {
      ariaLabel,
      value: controlledValue,
      defaultValue = 0,
      onValueChange,
      loop = false,
      slidesPerView = 1,
      hideNonActiveSlides = false,
      autoplay: autoplayProp = false,
      autoplayInterval = 5000,
      orientation = 'horizontal',
      children,
      ...props
    },
    ref
  ) {
    const baseId = useId('carousel');
    const { announce } = useAnnouncer();

    // Controlled + uncontrolled
    const [uncontrolled, setUncontrolled] = useState(defaultValue);
    const activeIndex = controlledValue ?? uncontrolled;

    // Slide registration
    const slideCountRef = useRef(0);
    const [slideCount, setSlideCount] = useState(0);
    const nextIndexRef = useRef(0);

    const registerSlide = useCallback((): number => {
      const idx = nextIndexRef.current++;
      slideCountRef.current++;
      setSlideCount(slideCountRef.current);
      return idx;
    }, []);

    const unregisterSlide = useCallback((_index: number) => {
      slideCountRef.current = Math.max(0, slideCountRef.current - 1);
      setSlideCount(slideCountRef.current);
    }, []);

    // Autoplay state
    const reducedMotion = useMemo(() => prefersReducedMotion(), []);
    const effectiveAutoplay = autoplayProp && !reducedMotion;
    const [paused, setPaused] = useState(!effectiveAutoplay);

    const togglePause = useCallback(() => {
      setPaused((p) => !p);
    }, []);

    // Navigation
    const goToSlide = useCallback(
      (index: number) => {
        if (slideCount === 0) return;
        let next = index;
        if (loop) {
          next = ((index % slideCount) + slideCount) % slideCount;
        } else {
          next = Math.max(0, Math.min(index, slideCount - 1));
        }
        if (next === activeIndex) return;
        if (controlledValue === undefined) setUncontrolled(next);
        onValueChange?.(next);

        if (slidesPerView > 1) {
          const endSlide = Math.min(next + slidesPerView, slideCount);
          announce(`Showing slides ${next + 1} to ${endSlide} of ${slideCount}`, { politeness: 'polite' });
        } else {
          announce(`Slide ${next + 1} of ${slideCount}`, { politeness: 'polite' });
        }
      },
      [slideCount, loop, activeIndex, controlledValue, onValueChange, announce, slidesPerView]
    );

    const goToPrev = useCallback(() => {
      goToSlide(activeIndex - 1);
    }, [goToSlide, activeIndex]);

    const goToNext = useCallback(() => {
      goToSlide(activeIndex + 1);
    }, [goToSlide, activeIndex]);

    // Autoplay timer
    useEffect(() => {
      if (!effectiveAutoplay || paused || slideCount <= 1) return;
      const timer = setInterval(() => {
        goToSlide(loop ? activeIndex + 1 : Math.min(activeIndex + 1, slideCount - 1));
      }, autoplayInterval);
      return () => clearInterval(timer);
    }, [effectiveAutoplay, paused, activeIndex, slideCount, loop, autoplayInterval, goToSlide]);

    // Pause autoplay on focus/hover
    const handleFocus = useCallback(() => {
      if (effectiveAutoplay) setPaused(true);
    }, [effectiveAutoplay]);

    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLElement>) => {
        if (effectiveAutoplay && !e.currentTarget.contains(e.relatedTarget as Node)) {
          setPaused(false);
        }
      },
      [effectiveAutoplay]
    );

    const handleMouseEnter = useCallback(() => {
      if (effectiveAutoplay) setPaused(true);
    }, [effectiveAutoplay]);

    const handleMouseLeave = useCallback(() => {
      if (effectiveAutoplay) setPaused(false);
    }, [effectiveAutoplay]);

    // Dev warnings
    if (process.env.NODE_ENV !== 'production') {
      if (!ariaLabel && !props['aria-labelledby']) {
        warn.error(
          'Carousel requires an accessible name.',
          'Add ariaLabel or aria-labelledby to <Carousel>.'
        );
      }
      if (autoplayProp && !React.Children.toArray(children).some(
        (child) => React.isValidElement(child) && (child as React.ReactElement<{ 'data-carousel-pause'?: boolean }>).props?.['data-carousel-pause']
      )) {
        // We can't easily detect CarouselPause inside Controls, so we just warn generally
        warn.info(
          'Autoplay is enabled. Ensure a <Carousel.Pause /> control is provided.',
          'Users must be able to pause autoplay for WCAG compliance.'
        );
      }
    }

    const contextValue: CarouselContextValue = {
      activeIndex,
      slideCount,
      goToSlide,
      goToPrev,
      goToNext,
      loop,
      orientation,
      slidesPerView,
      hideNonActiveSlides,
      autoplay: effectiveAutoplay,
      paused,
      togglePause,
      baseId,
      registerSlide,
      unregisterSlide,
    };

    return (
      <CarouselProvider value={contextValue}>
        <section
          ref={ref}
          aria-label={ariaLabel}
          aria-roledescription="carousel"
          data-compa11y-carousel
          data-orientation={orientation}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          {...props}
        >
          {children}
        </section>
      </CarouselProvider>
    );
  }
);

// ---------------------------------------------------------------------------
// Carousel.Content — viewport container with slide list
// ---------------------------------------------------------------------------

export interface CarouselContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CarouselContent = forwardRef<HTMLDivElement, CarouselContentProps>(
  function CarouselContent({ children, style, ...props }, ref) {
    const { baseId, orientation, activeIndex, slidesPerView } =
      useCarouselContext('CarouselContent');

    const keyboardProps = useViewportKeyboard();
    const reducedMotion = useMemo(() => prefersReducedMotion(), []);

    const isVertical = orientation === 'vertical';
    const offsetPercent = -(activeIndex * (100 / slidesPerView));

    const trackStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: isVertical ? 'column' : 'row',
      transform: isVertical
        ? `translateY(${offsetPercent}%)`
        : `translateX(${offsetPercent}%)`,
      transition: reducedMotion ? 'none' : 'transform 0.35s ease',
      willChange: 'transform',
    };

    const viewportStyle: React.CSSProperties = {
      overflow: 'hidden',
      ...style,
    };

    return (
      <div
        ref={ref}
        data-compa11y-carousel-viewport
        aria-describedby={`${baseId}-status`}
        style={viewportStyle}
        {...keyboardProps}
        {...props}
      >
        <ul
          role="list"
          data-compa11y-carousel-slides
          aria-orientation={orientation}
          style={trackStyle}
        >
          {children}
        </ul>
      </div>
    );
  }
);

function useViewportKeyboard() {
  const { goToPrev, goToNext, goToSlide, slideCount, orientation } =
    useCarouselContext('CarouselContent');

  return useKeyboard(
    {
      ArrowLeft: () => {
        if (orientation === 'horizontal') goToPrev();
      },
      ArrowRight: () => {
        if (orientation === 'horizontal') goToNext();
      },
      ArrowUp: () => {
        if (orientation === 'vertical') goToPrev();
      },
      ArrowDown: () => {
        if (orientation === 'vertical') goToNext();
      },
      Home: () => goToSlide(0),
      End: () => goToSlide(slideCount - 1),
    },
    { preventDefault: true, stopPropagation: false }
  );
}

// ---------------------------------------------------------------------------
// Carousel.Item — individual slide
// ---------------------------------------------------------------------------

export interface CarouselItemProps extends React.HTMLAttributes<HTMLLIElement> {
  children: React.ReactNode;
}

export const CarouselItem = forwardRef<HTMLLIElement, CarouselItemProps>(
  function CarouselItem({ children, style, ...props }, ref) {
    const {
      activeIndex,
      slideCount,
      slidesPerView,
      hideNonActiveSlides,
      registerSlide,
      unregisterSlide,
      orientation,
    } = useCarouselContext('CarouselItem');

    const indexRef = useRef<number>(-1);
    const [slideIndex, setSlideIndex] = useState(-1);

    useEffect(() => {
      const idx = registerSlide();
      indexRef.current = idx;
      setSlideIndex(idx);
      return () => unregisterSlide(idx);
    }, [registerSlide, unregisterSlide]);

    const isVisible =
      slideIndex >= activeIndex && slideIndex < activeIndex + slidesPerView;
    const isCurrent = slideIndex === activeIndex;

    if (hideNonActiveSlides && !isVisible) {
      return null;
    }

    const isVertical = orientation === 'vertical';
    const itemStyle: React.CSSProperties = {
      flex: `0 0 ${100 / slidesPerView}%`,
      [isVertical ? 'minHeight' : 'minWidth']: 0,
      boxSizing: 'border-box' as const,
      ...style,
    };

    return (
      <li
        ref={ref}
        role="listitem"
        aria-roledescription="slide"
        aria-label={`Slide ${slideIndex + 1} of ${slideCount}`}
        data-compa11y-carousel-item
        data-active={isCurrent || undefined}
        data-visible={isVisible || undefined}
        aria-hidden={hideNonActiveSlides ? undefined : (!isVisible || undefined)}
        style={itemStyle}
        {...props}
      >
        {children}
      </li>
    );
  }
);

// ---------------------------------------------------------------------------
// Carousel.Controls — wrapper for Prev/Next/Pause
// ---------------------------------------------------------------------------

export interface CarouselControlsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CarouselControls = forwardRef<HTMLDivElement, CarouselControlsProps>(
  function CarouselControls({ children, ...props }, ref) {
    return (
      <div ref={ref} data-compa11y-carousel-controls {...props}>
        {children}
      </div>
    );
  }
);

// ---------------------------------------------------------------------------
// Carousel.Prev
// ---------------------------------------------------------------------------

export interface CarouselPrevProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

export const CarouselPrev = forwardRef<HTMLButtonElement, CarouselPrevProps>(
  function CarouselPrev({ children, ...props }, ref) {
    const { goToPrev, activeIndex, loop } = useCarouselContext('CarouselPrev');
    const isDisabled = !loop && activeIndex <= 0;

    return (
      <button
        ref={ref}
        type="button"
        aria-label="Previous slide"
        disabled={isDisabled}
        onClick={goToPrev}
        data-compa11y-carousel-prev
        {...props}
      >
        {children ?? 'Previous'}
      </button>
    );
  }
);

// ---------------------------------------------------------------------------
// Carousel.Next
// ---------------------------------------------------------------------------

export interface CarouselNextProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

export const CarouselNext = forwardRef<HTMLButtonElement, CarouselNextProps>(
  function CarouselNext({ children, ...props }, ref) {
    const { goToNext, activeIndex, slideCount, loop, slidesPerView } =
      useCarouselContext('CarouselNext');
    const isDisabled = !loop && activeIndex >= slideCount - slidesPerView;

    return (
      <button
        ref={ref}
        type="button"
        aria-label="Next slide"
        disabled={isDisabled}
        onClick={goToNext}
        data-compa11y-carousel-next
        {...props}
      >
        {children ?? 'Next'}
      </button>
    );
  }
);

// ---------------------------------------------------------------------------
// Carousel.Pause — only renders when autoplay is enabled
// ---------------------------------------------------------------------------

export interface CarouselPauseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Label when playing */
  playLabel?: string;
  /** Label when paused */
  pauseLabel?: string;
  children?: React.ReactNode;
}

export const CarouselPause = forwardRef<HTMLButtonElement, CarouselPauseProps>(
  function CarouselPause(
    {
      playLabel = 'Start autoplay',
      pauseLabel = 'Pause autoplay',
      children,
      ...props
    },
    ref
  ) {
    const { autoplay, paused, togglePause } = useCarouselContext('CarouselPause');

    if (!autoplay) return null;

    return (
      <button
        ref={ref}
        type="button"
        aria-label={paused ? playLabel : pauseLabel}
        aria-pressed={!paused}
        onClick={togglePause}
        data-compa11y-carousel-pause
        data-carousel-pause
        {...props}
      >
        {children ?? (paused ? 'Play' : 'Pause')}
      </button>
    );
  }
);

// ---------------------------------------------------------------------------
// Carousel.Pagination — dot navigation
// ---------------------------------------------------------------------------

export interface CarouselPaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Accessible label for the pagination group */
  ariaLabel?: string;
}

export const CarouselPagination = forwardRef<HTMLDivElement, CarouselPaginationProps>(
  function CarouselPagination({ ariaLabel = 'Choose slide', ...props }, ref) {
    const { activeIndex, slideCount, goToSlide } =
      useCarouselContext('CarouselPagination');

    if (slideCount <= 1) return null;

    return (
      <div
        ref={ref}
        role="group"
        aria-label={ariaLabel}
        data-compa11y-carousel-pagination
        {...props}
      >
        {Array.from({ length: slideCount }, (_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to slide ${i + 1} of ${slideCount}`}
            aria-current={i === activeIndex ? 'true' : undefined}
            onClick={() => goToSlide(i)}
            data-compa11y-carousel-dot
            data-active={i === activeIndex || undefined}
          />
        ))}
      </div>
    );
  }
);

// ---------------------------------------------------------------------------
// Carousel.Status — "Slide X of Y" visible text
// ---------------------------------------------------------------------------

export interface CarouselStatusProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Make the status a live region (useful for autoplay) */
  live?: boolean;
  /** Custom render function, or omit for default "Slide X of Y" text */
  children?: ((ctx: { activeIndex: number; slideCount: number; slidesPerView: number }) => React.ReactNode);
}

export const CarouselStatus = forwardRef<HTMLDivElement, CarouselStatusProps>(
  function CarouselStatus({ live = false, children, ...props }, ref) {
    const { activeIndex, slideCount, slidesPerView, baseId } =
      useCarouselContext('CarouselStatus');

    const defaultText =
      slidesPerView > 1
        ? `Showing slides ${activeIndex + 1}–${Math.min(activeIndex + slidesPerView, slideCount)} of ${slideCount}`
        : `Slide ${activeIndex + 1} of ${slideCount}`;

    const content =
      typeof children === 'function'
        ? children({ activeIndex, slideCount, slidesPerView })
        : defaultText;

    return (
      <div
        ref={ref}
        id={`${baseId}-status`}
        data-compa11y-carousel-status
        {...(live ? { 'aria-live': 'polite' as const, 'aria-atomic': true } : {})}
        {...props}
      >
        {content}
      </div>
    );
  }
);

// ---------------------------------------------------------------------------
// Compound export
// ---------------------------------------------------------------------------

export const CarouselCompound = Object.assign(Carousel, {
  Content: CarouselContent,
  Item: CarouselItem,
  Controls: CarouselControls,
  Prev: CarouselPrev,
  Next: CarouselNext,
  Pause: CarouselPause,
  Pagination: CarouselPagination,
  Status: CarouselStatus,
});
