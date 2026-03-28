import { useState, useRef, useCallback, useEffect } from 'react';

interface UseAutoScrollOptions {
  baseSpeed?: number;
  edgeThreshold?: number;
  pauseDuration?: number;
}

export const useAutoScroll = (
  containerRef: React.RefObject<HTMLElement>,
  options: UseAutoScrollOptions = {}
) => {
  const { baseSpeed = 1.0, edgeThreshold = 200, pauseDuration = 60 } = options;

  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(2.5);
  const [scrollDirection, setScrollDirection] = useState<'down' | 'up'>('down');

  const scrollDirectionRef = useRef<'down' | 'up'>('down');
  const animationRef = useRef<number | null>(null);
  const scrollSpeedRef = useRef(0);
  const pauseTimeRef = useRef(0);
  const isPausedRef = useRef(false);
  const speedMultiplierRef = useRef(2.5);

  const easeInOutCubic = (t: number): number =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  const smoothScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const scrollTop = Math.round(container.scrollTop);
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;
    const maxScroll = Math.max(0, scrollHeight - clientHeight);

    if (maxScroll <= 0) {
      animationRef.current = requestAnimationFrame(smoothScroll);
      return;
    }

    if (isPausedRef.current) {
      pauseTimeRef.current++;
      if (pauseTimeRef.current >= pauseDuration) {
        isPausedRef.current = false;
        pauseTimeRef.current = 0;
        scrollSpeedRef.current = 0;
      }
      animationRef.current = requestAnimationFrame(smoothScroll);
      return;
    }

    const maxSpeed = baseSpeed * speedMultiplierRef.current;
    const distanceToBottom = maxScroll - scrollTop;
    const distanceToTop = scrollTop;
    let direction = scrollDirectionRef.current;
    const switchThreshold = 5;

    if (direction === 'down' && distanceToBottom <= switchThreshold) {
      scrollDirectionRef.current = 'up';
      isPausedRef.current = true;
      pauseTimeRef.current = 0;
      animationRef.current = requestAnimationFrame(smoothScroll);
      return;
    } else if (direction === 'up' && distanceToTop <= switchThreshold) {
      scrollDirectionRef.current = 'down';
      isPausedRef.current = true;
      pauseTimeRef.current = 0;
      animationRef.current = requestAnimationFrame(smoothScroll);
      return;
    }

    direction = scrollDirectionRef.current;
    const distanceToEdge = direction === 'down' ? distanceToBottom : distanceToTop;

    if (distanceToEdge < edgeThreshold) {
      const progress = distanceToEdge / edgeThreshold;
      const easedProgress = easeInOutCubic(progress);
      scrollSpeedRef.current = Math.max(0.3, maxSpeed * easedProgress);
    } else {
      const targetSpeed = maxSpeed;
      const speedDiff = targetSpeed - scrollSpeedRef.current;
      scrollSpeedRef.current += speedDiff * 0.02;
    }

    container.scrollTop += direction === 'down' ? scrollSpeedRef.current : -scrollSpeedRef.current;
    animationRef.current = requestAnimationFrame(smoothScroll);
  }, [containerRef, baseSpeed, edgeThreshold, pauseDuration]);

  const toggleAutoScroll = useCallback(() => {
    if (isAutoScrolling) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      setIsAutoScrolling(false);
    } else {
      scrollSpeedRef.current = 0.5;
      scrollDirectionRef.current = 'down';
      setScrollDirection('down');
      setIsAutoScrolling(true);
      animationRef.current = requestAnimationFrame(smoothScroll);
    }
  }, [isAutoScrolling, smoothScroll]);

  const handleSpeedChange = useCallback((speed: number) => {
    setScrollSpeed(speed);
    speedMultiplierRef.current = speed;
  }, []);

  // Sync direction state for UI
  useEffect(() => {
    if (!isAutoScrolling) return;
    const intervalId = setInterval(() => {
      setScrollDirection(scrollDirectionRef.current);
    }, 100);
    return () => clearInterval(intervalId);
  }, [isAutoScrolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return {
    isAutoScrolling,
    scrollDirection,
    scrollSpeed,
    toggleAutoScroll,
    handleSpeedChange,
  };
};
