/**
 * Kevin's K: one stroke weight, 45-degree arms, the upper arm's line slicing the stem.
 * Same geometry as the favicon (src/app/icon.png). Takes the text color.
 */
export const KEVIN_MARK_PATH = "M0 0H27V53L80 0H118L64.5 53.5L118 107H80L27 54L0 80.5Z";

export function KevinMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 118 107"
      aria-hidden
      focusable="false"
      className={className}
      fill="currentColor"
    >
      <path d={KEVIN_MARK_PATH} />
    </svg>
  );
}
