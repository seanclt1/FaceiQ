import { useEffect, useState } from 'react';

/**
 * Custom hook for animating number count-up
 * @param end - Target number to count up to
 * @param duration - Animation duration in milliseconds (default: 1500ms)
 * @param start - Starting number (default: 0)
 * @returns Current animated value
 */
export const useCountUp = (end: number, duration: number = 1500, start: number = 0): number => {
  const [count, setCount] = useState(start);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      // Ease-out cubic function for smooth deceleration
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);

      const currentCount = start + (end - start) * easeOutCubic;
      setCount(currentCount);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end); // Ensure we end exactly at target
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration, start]);

  return count;
};
