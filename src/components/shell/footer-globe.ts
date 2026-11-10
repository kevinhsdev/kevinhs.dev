// The footer's globe: the Earth at night (lib/earth-gl.ts) on a huge sphere whose top is the
// horizon, with the arcs from São Paulo climbing over it on a 2D canvas on top.
import { readToken } from "@/lib/color";
import { createEarth } from "@/lib/earth-gl";
import { MALTA, SP, SPAIN, USA, type LatLon } from "@/lib/journey";
import { apply, arcPath, seen, toVec, viewFacing, type Vec3 } from "@/lib/sphere";

/** The point facing the viewer: 90° north of it (Scandinavia) tops the horizon, so Europe and
 * the Mediterranean, Malta included, fill the ground below it. */
const FACE = { lat: -30, lon: 8 };
const ARCS: LatLon[] = [MALTA, SPAIN, USA];
/** The crop of the NASA map (3 km version, 4096 px wide) in footer-earth.webp, in degrees. */
const CROP = { lon0: -58, lon1: 74, lat0: 2, lat1: 62 };

const rgba = (c: Vec3, a: number) => `rgba(${c.map((x) => Math.round(x * 255)).join(",")},${a})`;

/** Mounts the globe in `view` (its two canvases given). Returns the cleanup. */
export function mountFooterGlobe(
  view: HTMLElement,
  glCanvas: HTMLCanvasElement,
  arcCanvas: HTMLCanvasElement,
) {
  const ctx = arcCanvas.getContext("2d");
  const earth =
    ctx &&
    createEarth(
      glCanvas,
      {
        night: { src: "/footer-earth.webp", crop: CROP },
        day: { src: "/footer-earth-day.webp", crop: CROP },
      },
      () => draw(performance.now()),
    );
  if (!ctx || !earth) return () => {};
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  let accent: Vec3 = [0.3, 0.55, 1];
  let strong: Vec3 = accent;
  let day = false;
  const colors = () => {
    day = !document.documentElement.classList.contains("dark");
    accent = readToken("accent", view) as Vec3;
    strong = readToken("accent-strong", view) as Vec3;
  };
  colors();

  function draw(time: number) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = view.clientWidth;
    const h = view.clientHeight;
    const R = Math.max(1.2 * h, 0.75 * w);
    const anchor = parseFloat(getComputedStyle(view).getPropertyValue("--anchor")) || 0.56;
    const cx = w / 2;
    const cy = anchor * h + R;
    const m = viewFacing(FACE.lat, FACE.lon + (reduced ? 0 : Math.sin(time * 0.00012) * 2));
    earth!.draw({ w, h, dpr, cx, cy, R, m, accent, day });

    if (arcCanvas.width !== Math.round(w * dpr) || arcCanvas.height !== Math.round(h * dpr)) {
      arcCanvas.width = Math.round(w * dpr);
      arcCanvas.height = Math.round(h * dpr);
    }
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx!.clearRect(0, 0, w, h);
    const a = toVec(...SP);
    ARCS.forEach((to, k) => {
      const pts = arcPath(a, toVec(...to)).map((p) => {
        const v = apply(m, p);
        return seen(v) ? ([cx + R * v[0], cy - R * v[1]] as [number, number]) : null;
      });
      ctx!.lineWidth = 1.25;
      ctx!.strokeStyle = rgba(accent, 0.55);
      ctx!.beginPath();
      let pen = false;
      for (const p of pts) {
        if (p && pen) ctx!.lineTo(...p);
        else if (p) ctx!.moveTo(...p);
        pen = !!p;
      }
      ctx!.stroke();
      // a light travelling along it
      if (!reduced) {
        const p = pts[Math.floor(((time * 0.00006 + k / 3) % 1) * (pts.length - 1))];
        if (p) {
          const g = ctx!.createRadialGradient(p[0], p[1], 0, p[0], p[1], 7);
          g.addColorStop(0, rgba([1, 1, 1], 0.95));
          g.addColorStop(0.35, rgba(strong, 0.7));
          g.addColorStop(1, rgba(strong, 0));
          ctx!.fillStyle = g;
          ctx!.fillRect(p[0] - 7, p[1] - 7, 14, 14);
        }
      }
    });
    // São Paulo and the destinations, where on this side
    for (const at of [SP, ...ARCS]) {
      const v = apply(m, toVec(...at));
      if (v[2] <= 0.05) continue;
      ctx!.beginPath();
      ctx!.arc(cx + R * v[0], cy - R * v[1], 3, 0, Math.PI * 2);
      ctx!.fillStyle = rgba(strong, 1);
      ctx!.shadowColor = rgba(strong, 0.9);
      ctx!.shadowBlur = 10;
      ctx!.fill();
      ctx!.shadowBlur = 0;
    }
  }

  let raf = 0;
  let visible = false;
  const loop = (time: number) => {
    raf = visible ? requestAnimationFrame(loop) : 0;
    draw(time);
  };
  const io = new IntersectionObserver(([e]) => {
    visible = !!e?.isIntersecting;
    if (visible && !raf) raf = requestAnimationFrame(loop);
  });
  if (reduced) draw(0);
  else io.observe(view);
  const ro = new ResizeObserver(() => draw(performance.now()));
  ro.observe(view);
  const mo = new MutationObserver(() => {
    colors();
    draw(performance.now());
  });
  mo.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-accent", "class"],
  });
  glCanvas.classList.add("is-ready");
  return () => {
    cancelAnimationFrame(raf);
    io.disconnect();
    ro.disconnect();
    mo.disconnect();
    earth.destroy();
  };
}
