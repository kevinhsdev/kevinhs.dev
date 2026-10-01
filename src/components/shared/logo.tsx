/**
 * Kevin's K: one stroke weight, 45-degree arms, and the upper arm's line
 * slicing the stem. Same geometry as src/app/icon.svg; the og image draws it
 * from `KEVIN_MARK_PATH` too. Takes the text color.
 */
export const KEVIN_MARK_PATH = "M0 0H27V53L80 0H118L64.5 53.5L118 107H80L27 54L0 80.5Z";
export const KEVIN_MARK_VIEWBOX = "0 0 118 107";

export function KevinMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox={KEVIN_MARK_VIEWBOX}
      aria-hidden
      focusable="false"
      className={className}
      fill="currentColor"
    >
      <path d={KEVIN_MARK_PATH} />
    </svg>
  );
}
