import { useEffect, useRef, useState } from 'react';

/**
 * Small local count-up — Focus screen's "números contando" request. Kept
 * feature-local (not a Design System primitive): one consumer today, and
 * the DS's own bar for promotion is a real second independent consumer
 * (see GoalTabStrip.tsx's doc comment for the same reasoning). Duration
 * matches the theme's `cardEntrance` preset (220ms) so it settles in step
 * with the bars' own entrance transition, not as a separate, longer beat.
 */
export function useCountUp(target: number, durationMs = 220): number {
  const [value, setValue] = useState(0);
  const startRef = useRef<number | null>(null);
  const fromRef = useRef(0);

  useEffect(() => {
    fromRef.current = value;
    startRef.current = null;
    let raf: number;

    const tick = (timestamp: number) => {
      if (startRef.current === null) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(1, elapsed / durationMs);
      setValue(Math.round(fromRef.current + (target - fromRef.current) * progress));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, durationMs]);

  return value;
}
