import { createContext, useContext } from 'react';

export interface CarouselContextValue {
  /** Current active slide index (0-based) */
  activeIndex: number;
  /** Total number of slides */
  slideCount: number;
  /** Go to a specific slide */
  goToSlide: (index: number) => void;
  /** Go to previous slide */
  goToPrev: () => void;
  /** Go to next slide */
  goToNext: () => void;
  /** Whether looping is enabled */
  loop: boolean;
  /** Orientation */
  orientation: 'horizontal' | 'vertical';
  /** Number of slides visible at once */
  slidesPerView: number;
  /** Whether non-active slides are hidden from the a11y tree */
  hideNonActiveSlides: boolean;
  /** Whether autoplay is active */
  autoplay: boolean;
  /** Whether autoplay is currently paused */
  paused: boolean;
  /** Toggle autoplay pause state */
  togglePause: () => void;
  /** Base ID for ARIA relationships */
  baseId: string;
  /** Register a slide (returns unregister fn) */
  registerSlide: () => number;
  /** Unregister a slide */
  unregisterSlide: (index: number) => void;
}

const CarouselContext = createContext<CarouselContextValue | null>(null);

export function useCarouselContext(componentName = 'this sub-component'): CarouselContextValue {
  const ctx = useContext(CarouselContext);
  if (!ctx) throw new Error(`${componentName} must be used inside <Carousel>`);
  return ctx;
}

export const CarouselProvider = CarouselContext.Provider;
