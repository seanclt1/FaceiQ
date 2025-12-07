import { useEffect, useState } from 'react';

/**
 * Custom hook for animating progress bar fill
 * @param targetValue - Target percentage (0-100)
 * @param trigger - Boolean to trigger the animation
 * @param duration - Animation duration in milliseconds (default: 1000ms)
 * @returns Current progress value
 */
export const useProgressBar = (
  targetValue: number,
  trigger: boolean,
  duration: number = 1000
): number => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!trigger) return;

    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progressRatio = Math.min(elapsed / duration, 1);

      // Ease-out quad for smooth deceleration
      const easeOutQuad = 1 - Math.pow(1 - progressRatio, 2);

      const currentProgress = targetValue * easeOutQuad;
      setProgress(currentProgress);

      if (progressRatio < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setProgress(targetValue);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [targetValue, trigger, duration]);

  return progress;
};
