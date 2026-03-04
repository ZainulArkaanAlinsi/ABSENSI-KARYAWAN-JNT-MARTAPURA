import { animate, type AnimationParams, utils } from 'animejs';
import { useCallback, useRef, useEffect } from 'react';

/**
 * A hook to use AnimeJS in React components.
 * Returns a ref to attach to the target element and a function to trigger the animation.
 */
export const useAnime = <T extends HTMLElement>(params: AnimationParams) => {
  const elementRef = useRef<T>(null);
  const animationRef = useRef<any>(null);

  const play = useCallback((extraParams?: AnimationParams) => {
    const target = elementRef.current;
    if (target) {
      if (animationRef.current) animationRef.current.pause();
      animationRef.current = animate(target, {
        ...params,
        ...extraParams,
      });
    }
  }, [params]);

  return { elementRef, play };
};

/**
 * A hook to trigger a "pop" animation.
 */
export const usePopAnimation = <T extends HTMLElement>() => {
  return useAnime<T>({
    scale: [1, 1.2, 1],
    duration: 300,
    easing: 'outElastic(1, .5)', // Fixed easing name for v4
  });
};

/**
 * A hook for staggered entrance of children elements.
 */
export const useStaggerEntrance = (selector: string, containerRef: React.RefObject<HTMLElement | null>) => {
  const animateEntrance = useCallback(() => {
    if (!containerRef.current) return;
    
    // Select targets within the container
    const targets = containerRef.current.querySelectorAll(selector);
    if (targets.length === 0) return;

    animate(targets, {
      opacity: [0, 1],
      translateY: [20, 0],
      scale: [0.9, 1],
      duration: 800,
      delay: utils.stagger(40), // Staggering using anime.utils.stagger
      easing: 'outExpo',
    });
  }, [selector, containerRef]);

  useEffect(() => {
    animateEntrance();
  }, [animateEntrance]);

  return { animateEntrance };
};
