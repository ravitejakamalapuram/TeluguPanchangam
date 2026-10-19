// Geometry for the timings popup arc: a half circle from one end of the span (sunrise to sunset by day,
// sunset to the next sunrise at night) to the other. Pure functions, so Node tests import them unchanged.

export const ARC = { cx: 150, cy: 130, r: 110 };

/** Share of the span [start, end] that `t` has covered, clamped to 0..1. */
export function fraction(t, start, end) {
  if (!(end > start)) return 0;
  return Math.min(1, Math.max(0, (t - start) / (end - start)));
}

/** Point on the arc at fraction `f`: 0 is the left end, 1 the right end, 0.5 the top. */
export function arcPoint(f, { cx, cy, r } = ARC) {
  const a = Math.PI * (1 - f);
  return { x: cx + r * Math.cos(a), y: cy - r * Math.sin(a) };
}

/** SVG path along the arc from fraction f0 to f1 (left to right over the top, so sweep is clockwise). */
export function arcPath(f0, f1, geom = ARC) {
  const a = arcPoint(f0, geom);
  const b = arcPoint(f1, geom);
  const n = (v) => v.toFixed(1);
  return `M${n(a.x)} ${n(a.y)} A${geom.r} ${geom.r} 0 0 1 ${n(b.x)} ${n(b.y)}`;
}

/**
 * Windows clipped to the span and turned into arc bands; windows outside the span are dropped.
 * @param {{ type: string, label?: string, start: Date, end: Date }[]} windows
 * @returns {{ type: string, label?: string, start: Date, end: Date, f0: number, f1: number }[]}
 */
export function bands(windows, start, end) {
  return windows
    .filter((w) => w.end > start && w.start < end)
    .map((w) => ({ type: w.type, label: w.label, start: w.start, end: w.end, f0: fraction(w.start, start, end), f1: fraction(w.end, start, end) }))
    .filter((b) => b.f1 > b.f0);
}
