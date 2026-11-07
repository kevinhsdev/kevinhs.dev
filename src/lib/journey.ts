import { clamp, inOutCubic, lerp, monotone, range } from "@/motion/math";

/**
 * The globe journey as a pure function of scroll progress s (in screens, 0..SCREENS):
 * SP → flight → Malta → plans → zoom out. The section only applies what this returns.
 */
export const SCREENS = 9;

export type Chapter = "intro" | "sp" | "flight" | "malta" | "plans" | "outro";
export type LatLon = [number, number];

export const SP: LatLon = [-23.5505, -46.6333];
export const MALTA: LatLon = [35.9187, 14.489];
export const SPAIN: LatLon = [40.4168, -3.7038]; // Madrid
export const USA: LatLon = [42.3736, -71.1097]; // Cambridge, MA

/** Titles, in order; titleIndex points here. SP: school, UMC, OASE; then Malta. */
export const TITLES = [
  "intro",
  "luterano",
  "umc",
  "oase-apprentice",
  "flight",
  "ef-malta",
  "plans",
  "outro",
] as const;

const CHAPTERS: [Chapter, number][] = [
  ["intro", 0.8],
  ["sp", 3.4],
  ["flight", 4.6],
  ["malta", 6.8],
  ["plans", 7.9],
  ["outro", SCREENS],
];

/** cobe angles that put a point at the front of the globe. */
export function toAngles([lat, lon]: LatLon): [phi: number, theta: number] {
  return [Math.PI - ((lon * Math.PI) / 180 - Math.PI / 2), (lat * Math.PI) / 180];
}

const scale = monotone([
  [0, 0.6],
  [0.8, 1],
  [1.2, 2.4],
  [3.3, 2.4],
  [3.6, 1.5],
  [4.4, 1.5],
  [4.8, 2.4],
  [6.6, 2.4],
  [7, 1.3],
  [7.9, 1.2],
  [8.6, 0.75],
  [SCREENS, 0.75],
]);

const [spPhi, spTheta] = toAngles(SP);
const [mtPhi, mtTheta] = toAngles(MALTA);
const [usPhi] = toAngles(USA);

function angles(s: number): { phi: number; theta: number } {
  if (s < 0.8) {
    const t = inOutCubic(range(s, 0, 0.8));
    return { phi: lerp(spPhi - 1.2, spPhi, t), theta: lerp(0.15, spTheta * 0.6, t) };
  }
  if (s < 3.4) return { phi: spPhi, theta: spTheta * 0.6 };
  if (s < 4.6) {
    const t = inOutCubic(range(s, 3.4, 4.5));
    return { phi: lerp(spPhi, mtPhi, t), theta: lerp(spTheta * 0.6, mtTheta * 0.6, t) };
  }
  if (s < 6.8) return { phi: mtPhi, theta: mtTheta * 0.6 };
  // plans, then a slow drift west while zooming out
  const t = inOutCubic(range(s, 6.8, 7.9));
  const phi = lerp(mtPhi, (mtPhi + usPhi) / 2, t) + range(s, 7.9, SCREENS) * 0.6;
  return { phi, theta: lerp(mtTheta * 0.6, 0.25, t) };
}

export function journeyState(input: number) {
  const s = clamp(input, 0, SCREENS);
  const chapter = CHAPTERS.find(([, end]) => s < end)?.[0] ?? "outro";

  const inSp = s >= 1.1 && s < 3.4;
  const inMalta = s >= 4.7 && s < 6.8;
  const scene: "globe" | "sp" | "malta" = inSp ? "sp" : inMalta ? "malta" : "globe";
  const iris = inSp
    ? Math.min(range(s, 1.1, 1.5), 1 - range(s, 3.1, 3.4))
    : inMalta
      ? Math.min(range(s, 4.7, 5), 1 - range(s, 6.5, 6.8))
      : 0;

  // [index into TITLES, from, to]; null in the gaps (iris transitions)
  const slots: [number, number, number][] = [
    [0, 0.15, 1.05],
    [1, 1.5, 2.03],
    [2, 2.03, 2.56],
    [3, 2.56, 3.1],
    [4, 3.5, 4.55],
    [5, 5, 6.5],
    [6, 6.85, 7.85],
    [7, 8.05, SCREENS + 1],
  ];
  const titleIndex = slots.find(([, a, b]) => s >= a && s < b)?.[0] ?? null;

  return {
    chapter,
    globe: { ...angles(s), scale: scale(s) },
    scene,
    iris,
    arc: { spMalta: inOutCubic(range(s, 3.4, 4.5)), planned: inOutCubic(range(s, 6.9, 7.7)) },
    titleIndex,
  };
}

export type JourneyState = ReturnType<typeof journeyState>;

/** The point a fraction t along the great circle from a to b (slerp on the unit sphere). */
export function greatCircle(a: LatLon, b: LatLon, t: number): LatLon {
  const r = Math.PI / 180;
  const v = ([lat, lon]: LatLon) => [
    Math.cos(lat * r) * Math.cos(lon * r),
    Math.cos(lat * r) * Math.sin(lon * r),
    Math.sin(lat * r),
  ];
  const p = v(a);
  const q = v(b);
  const dot = clamp(p[0]! * q[0]! + p[1]! * q[1]! + p[2]! * q[2]!, -1, 1);
  const w = Math.acos(dot);
  if (w < 1e-9) return a;
  const ka = Math.sin((1 - t) * w) / Math.sin(w);
  const kb = Math.sin(t * w) / Math.sin(w);
  const [x, y, z] = [0, 1, 2].map((i) => ka * p[i]! + kb * q[i]!) as [number, number, number];
  return [Math.atan2(z, Math.hypot(x, y)) / r, Math.atan2(y, x) / r];
}
