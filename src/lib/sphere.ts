export type Vec3 = [number, number, number];

const RAD = Math.PI / 180;

/** A point on the unit sphere: y up (north), z toward lon 0 on the equator, x toward lon 90°E. */
export function toVec(lat: number, lon: number): Vec3 {
  const c = Math.cos(lat * RAD);
  return [c * Math.sin(lon * RAD), Math.sin(lat * RAD), c * Math.cos(lon * RAD)];
}

/**
 * The view facing the point (lat, lon), north up: rows are the screen axes in world space
 * (x = east, y = north, z = toward the viewer). v = M · p.
 */
export function viewFacing(lat: number, lon: number): [Vec3, Vec3, Vec3] {
  const sa = Math.sin(lat * RAD);
  const ca = Math.cos(lat * RAD);
  const so = Math.sin(lon * RAD);
  const co = Math.cos(lon * RAD);
  return [
    [co, 0, -so],
    [-sa * so, ca, -sa * co],
    [ca * so, sa, ca * co],
  ];
}

export function apply(m: [Vec3, Vec3, Vec3], p: Vec3): Vec3 {
  return m.map((r) => r[0] * p[0] + r[1] * p[1] + r[2] * p[2]) as Vec3;
}

/**
 * The arc from a to b up to fraction t: the great circle, lifted off the surface toward its
 * middle (higher for longer arcs), as world points.
 */
export function arcPath(a: Vec3, b: Vec3, t = 1, steps = 120): Vec3[] {
  const ang = Math.acos(Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])));
  const out: Vec3[] = [];
  if (ang < 1e-6) return out;
  const n = Math.max(1, Math.round(steps * t));
  for (let i = 0; i <= n; i++) {
    const f = (i / n) * t;
    const s1 = Math.sin((1 - f) * ang) / Math.sin(ang);
    const s2 = Math.sin(f * ang) / Math.sin(ang);
    const lift = 1 + 0.2 * Math.sin(Math.PI * f) * Math.min(1, ang);
    out.push([0, 1, 2].map((j) => (s1 * a[j]! + s2 * b[j]!) * lift) as Vec3);
  }
  return out;
}

/** Whether a view-space point is seen: in front, or lifted past the limb. */
export const seen = (v: Vec3) => v[2] > 0 || v[0] * v[0] + v[1] * v[1] > 1;
