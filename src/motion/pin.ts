import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * A section pinned for `screens` viewport heights. No scrub: onUpdate hands the position s
 * (in screens) to a pure render(s), so stopping or reversing anywhere shows render(s). On
 * touch, s eases toward its target (~0.25 s) on the ticker so finger flicks don't jitter.
 */
export function createPin(opts: {
  el: HTMLElement;
  screens: number;
  render: (s: number) => void;
  smoothTouch?: boolean;
}) {
  const { el, screens, render, smoothTouch = true } = opts;
  const touch = smoothTouch && window.matchMedia("(hover: none)").matches;
  let target = 0;
  let shown = 0;

  const tick = () => {
    const k = 1 - Math.exp(-gsap.ticker.deltaRatio(60) / 15);
    shown += (target - shown) * k;
    if (Math.abs(target - shown) < 1e-4) shown = target;
    render(shown);
  };

  const st = ScrollTrigger.create({
    trigger: el,
    start: "top top",
    end: () => `+=${screens * window.innerHeight}`,
    pin: true,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      target = self.progress * screens;
      if (!touch) render(target);
    },
  });
  if (touch) gsap.ticker.add(tick);
  render(st.progress * screens);

  return {
    kill() {
      gsap.ticker.remove(tick);
      st.kill();
    },
    refresh: () => ScrollTrigger.refresh(),
  };
}
