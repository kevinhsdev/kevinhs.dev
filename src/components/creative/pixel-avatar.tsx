import { cn } from "@/lib/utils";
import { Pixels, type Palette } from "./pixel-art";

/*
 * The arcade theme's mascot: a fictional hacker in a hoodie whose face is a
 * screen mask, with the face drawn in code. A 24×32 sprite from character
 * maps (pixel-art.tsx); every letter is a palette slot coloured by the theme
 * (`--av-*` in arcade.css), with a light, a mid and a shadow tone per material.
 *
 * Everything that can change is in the markup and switched by CSS from the
 * wrapper's data attributes (live-avatar.tsx): the face's mood, the blink,
 * the walk cycle, the rock skin with its guitar (the coins' reward) and the
 * legend skin (every trophy).
 */

const HEAD = [
  "........OOOOOOOO........",
  "......OOuuuoooooOO......",
  ".....OuuuoooooooooO.....",
  "....OuuooooooooooooO....",
  "...OuoXXXXXXXXXXXXooO...",
  "...OuoXQQQQQQQQgQXooO...",
  "...OuoXQQQQQQQQQgXooO...",
  "...OuoXQQQQQQQQQQXooO...",
  "...OuoXQQQQQQQQQQXooO...",
  "...OuoXQQQQQQQQQQXooO...",
  "...OuoXQQQQQQQQQQXooO...",
  "...OuoXQQQQQQQQQQXooO...",
  "...OuoXXXXXXXXXXXXooO...",
  "...OuooooooooooooooO....",
  "....OOooooooooooooOO....",
  ".....OOOOOOOOOOOOOO.....",
];
const BODY = [
  "...hHHHHHdHHHHdHHHHHh...",
  "..hLHHHHHdHHHHdHHHHHHh..",
  "..hLHHHHHdHHHHdHHHHHHh..",
  "..hLhHHHHdHHHHdHHHHhHh..",
  "..hLhHHHHrHHHHrHHHHhHh..",
  "..hLhHHHHHHHHHHHHHHhHh..",
  "..hLhHHppppppppppHHhHh..",
  "..hLhHHpHHHHHHHHpHHhHh..",
  "..GGhHHHHHHHHHHHHHHhGG..",
  "..GGhhhhhhhhhhhhhhhhGG..",
  "......PPPPPPPPPPPP......",
];
const LEGS_STAND = [
  "......PPPPP..PPPPP......",
  "......PPPPP..PPPPP......",
  "......mPPPP..PPPPm......",
  ".....KKKKKK..KKKKKK.....",
  ".....SSSSSS..SSSSSS.....",
];
const LEGS_STEP = [
  ".....PPPPP....PPPPP.....",
  "....PPPPP......PPPPP....",
  "....mPPPP......PPPPm....",
  "...KKKKKK......KKKKKK...",
  "...SSSSSS......SSSSSS...",
];

/*
 * The guitar: a blue superstrat with a white pickguard, HSS pickups and
 * a maple neck with a six-in-line headstock. Drawn column by column with a
 * real Strat's proportions (body ~45% of the length, the upper horn longer).
 */
const GUITAR_ITEM = [
  ".......................................................",
  "......................llllb............................",
  "....................llBBBBBlb.............llllllb......",
  "...................lBBBBBBBBBlb........lllBBBBBBBllb...",
  "...................bBBBBBBBBBBBllb..lllBBBBBBBBBBBBBlb.",
  "...t.t..............bbBBBBBBBBBBBBllBBBBBBBBBBBBBBBBBBb",
  ".tnnnn.t..............bbbBBBBBBBBWWWWWWWWWWwBBBBBBBBBBb",
  ".nnnnnnn.................bbbBBBWWWWWWWWWWWWWWWwBBBBBBBb",
  "nnnnnnnnn...................bbwWWWWWWWWWWWWWWWWwBBBBBBb",
  "nnnnnnnnnn....................bbWWWWkWWWkWWWkkWWwssBBBb",
  "nnnnnnnnnnWnnfnnfnfnnfnfnnfnfnfnfnnnkWWWkWWWkkWWwssBBBb",
  ".nnnnnnnnnWnnfnnfnfknfnfknfnfkfnfnnnkWWWkWWWkkWWwssBBBb",
  "..nnnnnnnnWnnfnnfnfnnfnfnnfnfnfnfnnnkWWWkWWWkkWWwssBBBb",
  ".......nnnWnnfnnfnfnnfnfnnfnfnfnfnnnkWWWkWWWkkWWwssBBBb",
  "..............................lWWWWWkWWWkWWWkkWkwssBBBb",
  "............................lWWWWWWWWWWWWWWWWWWWwBBBBBb",
  "..........................lWWWWWWWWWWWWWWWWWWkWwBBBBBBb",
  ".........................lWWWWWWWWWWWWWWWWkWWWwBBBBBsBb",
  ".........................bwWWWWWWWWWWWWsWWWWwwBBBBBBBb.",
  "..........................bwWWWWWwbbWWWWWwwwBBBBBBBBb..",
  "...........................bbwwwwb..bbwwwBBBBBBBBBbb...",
  ".............................bbbb.....bbbBBBBBBbbb.....",
  ".........................................bbbbbb........",
  ".......................................................",
];

/** The same guitar, smaller, held across the body by the rock skin. */
const GUITAR = [
  "..................llb.....lllb..",
  "...t............llBBBlb.llBBBBlb",
  ".tnn............bBBBBBBlBBBBBBBb",
  ".nnnn............bbbBBWWWWWwBBBb",
  "nnnnn...............bbWWkWkkwsBb",
  "nnnnnWnnfnnfnfnfnfnfnfnnkWkkwsBb",
  ".nnnnWnnfnnfnfnfnfnfnfnnkWkkwsBb",
  "....................WWWWkWkkwsBb",
  "...................bwWWWbwwkBBBb",
  "....................bbbb.bBBBBb.",
  "..........................bbbb..",
];

/*
 * The rock skin's outfit, drawn over the hoodie: a red mohawk, a studded
 * leather jacket open over a band tee, ripped jeans and buckled boots.
 */
const MOHAWK = [
  "..........M.MM..........",
  "..........MMMN..........",
  "..........MMMN..........",
  "..........MMMN..........",
  "..........MMMN..........",
];
const JACKET = [
  "...s................s...",
  "...s.....cTTTTc.....s...",
  "..s.s....cTRRTc....s.s..",
  ".........cTRRTc.........",
  ".........cTTTTc.........",
];
const RIPS_STAND = [
  "........................",
  ".......ww.....w.........",
  "........................",
  "......s........s........",
  "........................",
];
const RIPS_STEP = [
  "........................",
  ".....ww.........w.......",
  "........................",
  "....s..........s........",
  "........................",
];

/*
 * The legend skin, for whoever gets every trophy: a terminal in human form,
 * all black with a green mask and a corrupted grin, under a jewelled crown.
 * The glitch, the green trail and the code falling around it are CSS.
 */
const CROWN = [
  ".......Y...YY...Y.......",
  ".......YY.YYYY.YY.......",
  ".......YYYYjjYYYY.......",
  ".......YeYYYYYYeY.......",
  ".......yyyyyyyyyy.......",
];

/** The faces on the screen (10×7, inside the mask). */
const FACES = {
  idle: [
    "..........",
    ".FF....FF.",
    ".FF....FF.",
    "..........",
    "...FFFF...",
    "..........",
    "..........",
  ],
  blink: [
    "..........",
    "..........",
    ".FF....FF.",
    "..........",
    "...FFFF...",
    "..........",
    "..........",
  ],
  happy: [
    "..........",
    "..F....F..",
    ".F.F..F.F.",
    "..........",
    ".F......F.",
    "..FFFFFF..",
    "..........",
  ],
  wow: [
    ".FF....FF.",
    ".FF....FF.",
    "..........",
    "....FF....",
    "...F..F...",
    "....FF....",
    "..........",
  ],
  angry: [
    "F........F",
    ".FF....FF.",
    "..F....F..",
    "..........",
    "..FFFFFF..",
    ".F......F.",
    "..........",
  ],
  talk: [
    "..........",
    "..........",
    "..........",
    "..........",
    "...FFFF...",
    "...F..F...",
    "...FFFF...",
  ],
  rock: [
    "..........",
    "FFFFFFFFFF",
    "FFFF..FFFF",
    ".FF....FF.",
    "..........",
    "....FFF...",
    "..........",
  ],
  legend: [
    "F........F",
    ".FF....FF.",
    "..FF..FF..",
    ".FF....FF.",
    "..........",
    "F.F.F.F.F.",
    ".F.F.F.F.F",
  ],
} as const;

const PALETTE: Palette = {
  O: "av-hood",
  o: "av-hood-hi",
  u: "av-hood-lt",
  X: "av-frame",
  r: "av-frame",
  Q: "av-screen",
  g: "av-glare",
  H: "av-hoodie",
  h: "av-hoodie-sh",
  L: "av-hoodie-lt",
  d: "av-string",
  p: "av-pocket",
  G: "av-glove",
  P: "av-pants",
  m: "av-pants-sh",
  K: "av-shoe",
  S: "av-sole",
  F: "av-code",
  n: "av-maple",
  f: "av-fret",
  B: "av-guitar",
  b: "av-guitar-sh",
  l: "av-guitar-hi",
  W: "av-guard",
  k: "av-pickup",
  s: "av-chrome",
  t: "av-chrome",
  M: "av-mohawk",
  N: "av-mohawk-sh",
  c: "av-lapel",
  T: "av-tee",
  R: "av-tee-ink",
  w: "av-rip",
  Y: "av-gold",
  y: "av-gold-sh",
  j: "av-ruby",
  e: "av-sapphire",
};

const SCREEN = { left: 7, top: 5 };

export function PixelAvatar({ walking, className }: { walking?: boolean; className?: string }) {
  const legsTop = HEAD.length + BODY.length;
  return (
    <svg
      viewBox="0 0 24 32"
      shapeRendering="crispEdges"
      aria-hidden
      className={cn("px-avatar", walking && "is-walking", className)}
    >
      <g className="av-body">
        <Pixels rows={HEAD} palette={PALETTE} />
        <g className="av-rock">
          <Pixels rows={MOHAWK} palette={PALETTE} top={-5} />
        </g>
        <g className="av-legend">
          <Pixels rows={CROWN} palette={PALETTE} top={-5} />
        </g>
        {/* code rain behind the face */}
        <g className="av-rain">
          {[1, 4, 8].map((x, i) => (
            <rect
              key={x}
              x={SCREEN.left + x}
              y={SCREEN.top}
              width={1}
              height={1}
              style={{ animationDelay: `${i * -0.37}s` }}
            />
          ))}
        </g>
        {Object.entries(FACES).map(([mood, rows]) => (
          <g key={mood} className={`av-face av-face-${mood}`}>
            <Pixels rows={rows} palette={PALETTE} {...SCREEN} />
          </g>
        ))}
        <Pixels rows={BODY} palette={PALETTE} top={HEAD.length} />
        <g className="av-rock">
          <Pixels rows={JACKET} palette={PALETTE} top={HEAD.length - 1} />
        </g>
        <g className="av-guitar-held">
          <Pixels rows={GUITAR} palette={PALETTE} top={19} left={-7} />
        </g>
      </g>
      <g className="av-legs-a">
        <Pixels rows={LEGS_STAND} palette={PALETTE} top={legsTop} />
        <g className="av-rock">
          <Pixels rows={RIPS_STAND} palette={PALETTE} top={legsTop} />
        </g>
      </g>
      <g className="av-legs-b">
        <Pixels rows={LEGS_STEP} palette={PALETTE} top={legsTop} />
        <g className="av-rock">
          <Pixels rows={RIPS_STEP} palette={PALETTE} top={legsTop} />
        </g>
      </g>
    </svg>
  );
}

/** The guitar on its own, bigger, for the inventory: 55×24. */
export function PixelGuitar({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 55 24"
      shapeRendering="crispEdges"
      aria-hidden
      className={cn("px-guitar", className)}
    >
      <Pixels rows={GUITAR_ITEM} palette={PALETTE} />
    </svg>
  );
}
