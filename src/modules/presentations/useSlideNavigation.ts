import { useCallback, useEffect, useState } from 'react';

export interface UseSlideNavigationOptions {
  total: number;
  initialIndex?: number;
}

export interface UseSlideNavigationResult {
  index: number;
  isFirst: boolean;
  isLast: boolean;
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
}

export function useSlideNavigation({
  total,
  initialIndex = 0,
}: UseSlideNavigationOptions): UseSlideNavigationResult {
  const [index, setIndex] = useState(initialIndex);
  const clamp = useCallback((i: number) => Math.min(Math.max(i, 0), total - 1), [total]);

  const goTo = useCallback((i: number) => setIndex(clamp(i)), [clamp]);
  const next = useCallback(() => setIndex((i) => clamp(i + 1)), [clamp]);
  const prev = useCallback(() => setIndex((i) => clamp(i - 1)), [clamp]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (['ArrowRight', 'ArrowDown', ' ', 'PageDown'].includes(e.key)) {
        e.preventDefault();
        next();
      } else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) {
        e.preventDefault();
        prev();
      } else if (e.key === 'Home') {
        goTo(0);
      } else if (e.key === 'End') {
        goTo(total - 1);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [next, prev, goTo, total]);

  return {
    index,
    isFirst: index === 0,
    isLast: index === total - 1,
    next,
    prev,
    goTo,
  };
}
