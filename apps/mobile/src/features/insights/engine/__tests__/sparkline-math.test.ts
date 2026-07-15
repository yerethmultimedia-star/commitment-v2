import { computeSparklinePoints, toPolylinePointsAttr } from '../sparkline-math';

describe('computeSparklinePoints', () => {
  it('returns [] for 0 or 1 values', () => {
    expect(computeSparklinePoints([], 64, 24)).toEqual([]);
    expect(computeSparklinePoints([5], 64, 24)).toEqual([]);
  });

  it('maps min/max values to the full height range, inverted (SVG y grows downward)', () => {
    const points = computeSparklinePoints([0, 10], 100, 20);
    expect(points[0]).toEqual({ x: 0, y: 20 }); // min -> bottom
    expect(points[1]).toEqual({ x: 100, y: 0 }); // max -> top
  });

  it('spaces x evenly across width', () => {
    const points = computeSparklinePoints([1, 2, 3, 4], 90, 10);
    expect(points.map((p) => p.x)).toEqual([0, 30, 60, 90]);
  });

  it('flattens to a mid-height line when all values are equal (no divide-by-zero)', () => {
    const points = computeSparklinePoints([5, 5, 5], 60, 24);
    expect(points.every((p) => p.y === 12)).toBe(true);
  });
});

describe('toPolylinePointsAttr', () => {
  it('formats points as an SVG polyline points attribute string', () => {
    const attr = toPolylinePointsAttr([{ x: 0, y: 20 }, { x: 50, y: 0 }]);
    expect(attr).toBe('0,20 50,0');
  });

  it('returns an empty string for no points', () => {
    expect(toPolylinePointsAttr([])).toBe('');
  });
});
