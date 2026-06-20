import { useCallback, useEffect, useRef } from 'react';

/**
 * Helper animasi ringan di atas Web Animations API (WAAPI) bawaan browser.
 * Menggantikan implementasi lama berbasis animejs: tanpa dependency runtime,
 * transform GPU-composited (FPS lebih halus), dan bundle lebih kecil.
 */

/** Umpan balik "pop" imperatif (membesar lalu kembali). */
export const usePopAnimation = <T extends HTMLElement>() => {
  const elementRef = useRef<T>(null);
  const animationRef = useRef<Animation | null>(null);

  const play = useCallback(() => {
    const el = elementRef.current;
    if (!el) return;
    animationRef.current?.cancel();
    animationRef.current = el.animate(
      [
        { transform: 'scale(1)' },
        { transform: 'scale(1.2)' },
        { transform: 'scale(1)' },
      ],
      { duration: 300, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
    );
  }, []);

  return { elementRef, play };
};

/** Entrance bertahap (stagger) untuk anak yang cocok [selector] di [containerRef]. */
export const useStaggerEntrance = (
  selector: string,
  containerRef: React.RefObject<HTMLElement | null>,
) => {
  const animateEntrance = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const targets = container.querySelectorAll<HTMLElement>(selector);
    targets.forEach((el, i) => {
      el.animate(
        [
          { opacity: 0, transform: 'translateY(20px) scale(0.95)' },
          { opacity: 1, transform: 'translateY(0) scale(1)' },
        ],
        {
          duration: 600,
          delay: i * 40,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          fill: 'both',
        },
      );
    });
  }, [selector, containerRef]);

  useEffect(() => {
    animateEntrance();
  }, [animateEntrance]);

  return { animateEntrance };
};
