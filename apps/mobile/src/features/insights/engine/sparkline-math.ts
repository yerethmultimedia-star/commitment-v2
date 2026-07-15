/**
 * Pure point-mapping math for Sparkline.tsx — kept separate from the React
 * component so it's unit-testable without rendering, same convention as
 * daily-metrics.ts / focus-detail.ts.
 */

export interface SparklinePoint {
  readonly x: number;
  readonly y: number;
}

/**
 * Maps `values` onto an SVG viewBox of `width` x `height`. Returns [] for
 * fewer than 2 values — a single point (or none) can't form a line, and the
 * caller (Sparkline.tsx) should skip rendering entirely rather than draw a
 * meaningless dot.
 */
export function computeSparklinePoints(values: readonly number[], width: number, height: number): SparklinePoint[] {
  if (values.length < 2) return [];

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;

  return values.map((v, i) => {
    const x = i * (width / (values.length - 1));
    // SVG y grows downward — invert so higher values sit higher on screen.
    // range === 0 (all values equal) would divide by zero, so flatten to a
    // mid-height line instead.
    const y = range === 0 ? height / 2 : height - ((v - min) / range) * height;
    return { x, y };
  });
}

export function toPolylinePointsAttr(points: readonly SparklinePoint[]): string {
  return points.map((p) => `${p.x},${p.y}`).join(' ');
}
