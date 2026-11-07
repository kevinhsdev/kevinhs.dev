import gsap from "gsap";

/**
 * A title that plays on its own clock, never on the scrub: when the hand stops mid-scroll
 * it still finishes, so no letter is ever left half-cut. Each call interrupts the running
 * tween (overwrite) and settles on the new end state.
 */
export class Title {
  visible = false;
  private readonly parts: HTMLElement[];

  constructor(private readonly el: HTMLElement) {
    const lines = el.querySelectorAll<HTMLElement>("[data-line]");
    this.parts = lines.length ? [...lines] : [el];
    gsap.set(el, { autoAlpha: 0 });
  }

  show(dir: 1 | -1 = 1) {
    this.visible = true;
    gsap.set(this.el, { autoAlpha: 1, overwrite: true });
    gsap.fromTo(
      this.parts,
      { autoAlpha: 0, yPercent: 40 * dir },
      {
        autoAlpha: 1,
        yPercent: 0,
        duration: 0.8,
        ease: "expo.out",
        stagger: 0.06,
        overwrite: true,
      },
    );
  }

  hide(dir: 1 | -1 = 1) {
    this.visible = false;
    gsap.to(this.parts, {
      autoAlpha: 0,
      yPercent: -24 * dir,
      duration: 0.35,
      ease: "power2.in",
      overwrite: true,
    });
    gsap.to(this.el, { autoAlpha: 0, duration: 0.35, overwrite: true });
  }
}

/** Keeps exactly one title (or none) visible; the direction follows the index change. */
export function switcher(titles: Title[]) {
  let current: number | null = null;
  return (index: number | null) => {
    if (index === current) return;
    const dir: 1 | -1 = current === null || index === null || index > current ? 1 : -1;
    if (current !== null) titles[current]?.hide(dir);
    if (index !== null) titles[index]?.show(dir);
    current = index;
  };
}
