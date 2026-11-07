export type Size = { w: number; h: number };

/**
 * Where a point of a media (fx, fy in 0..1 of its own size) lands inside a box under
 * object-fit: cover. focusX is object-position x (0..1): which part survives a crop on a
 * tall box. Every element pinned to a point of an image goes through here.
 */
export function coverPoint(media: Size, box: Size, fx: number, fy: number, focusX = 0.5) {
  const scale = Math.max(box.w / media.w, box.h / media.h);
  const w = media.w * scale;
  const h = media.h * scale;
  return { x: (box.w - w) * focusX + fx * w, y: (box.h - h) / 2 + fy * h, scale };
}
