/*
 * Pixel art from character maps: each string is a row, each letter a palette
 * slot (styled by a CSS class, so themes can repaint it) and "." is empty.
 * Used by Kevin's sprite, the trophy icons, the guitar and the boss.
 */

export type Palette = Record<string, string>;

/** One rect per horizontal run of the same letter, starting at row `top`. */
export function Pixels({
  rows,
  palette,
  top = 0,
  left = 0,
}: {
  rows: readonly string[];
  palette: Palette;
  top?: number;
  left?: number;
}) {
  return rows.flatMap((row, y) => {
    const rects = [];
    for (let x = 0; x < row.length;) {
      const c = row[x] ?? ".";
      let end = x + 1;
      while (row[end] === c) end++;
      const slot = palette[c];
      if (slot)
        rects.push(
          <rect
            key={`${top + y}-${x}`}
            x={left + x}
            y={top + y}
            width={end - x}
            height={1}
            className={slot}
          />,
        );
      x = end;
    }
    return rects;
  });
}
