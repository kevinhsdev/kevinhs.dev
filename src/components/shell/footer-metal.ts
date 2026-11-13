// Campo (ProfitizeBuild) footer-metal.ts, adapted: the mask is Kevin's K instead of a word,
// with its base at a known height (BASE) so it can stand on the horizon.
import {
  getShaderColorFromString,
  LiquidMetalShapes,
  liquidMetalFragmentShader,
  ShaderFitOptions,
  ShaderMount,
  toProcessedLiquidMetal,
} from "@paper-design/shaders";
import { KEVIN_MARK_PATH } from "./logo";

const CAP = 400; // glyph height in the mask, px
const PAD = 80; // room for the contour to breathe
/** Where the glyphs' base sits, as a fraction of the mask height (from the top). */
export const BASE = (PAD + CAP) / (CAP + PAD * 2);

/** The mask: Kevin's K, white on transparent, CAP tall, base at BASE. */
export function monumentMask() {
  const w = Math.round((118 / 107) * CAP);
  const c = new OffscreenCanvas(w + PAD * 2, CAP + PAD * 2);
  const x = c.getContext("2d")!;
  x.translate(PAD, PAD);
  x.scale(CAP / 107, CAP / 107);
  x.fillStyle = "#fff";
  x.fill(new Path2D(KEVIN_MARK_PATH));
  return c;
}

/** Mounts the metal inside `el` with the mask. Returns the unmount function. */
export async function mountMetalWord(el: HTMLElement, mask: OffscreenCanvas) {
  const blob = await mask.convertToBlob({ type: "image/png" });
  const { pngBlob } = await toProcessedLiquidMetal(
    new File([blob], "mask.png", { type: "image/png" }),
  );
  const image = new Image();
  image.src = URL.createObjectURL(pngBlob);
  await image.decode();
  if (!el.isConnected) return () => {};
  const mount = new ShaderMount(
    el,
    liquidMetalFragmentShader,
    {
      u_colorBack: getShaderColorFromString("rgba(0,0,0,0)"),
      u_colorTint: getShaderColorFromString("#e8eeff"),
      u_image: image,
      u_isImage: true,
      u_shape: LiquidMetalShapes.none,
      u_repetition: 2.4,
      u_softness: 0.08,
      u_shiftRed: 0.3,
      u_shiftBlue: 0.3,
      u_distortion: 0.1,
      u_contour: 0.5,
      u_angle: 80,
      u_fit: ShaderFitOptions.contain,
      u_scale: 1,
      u_rotation: 0,
      u_offsetX: 0,
      u_offsetY: 0,
      u_originX: 0.5,
      u_originY: 0.5,
      u_worldWidth: 0,
      u_worldHeight: 0,
    },
    undefined,
    matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 1,
    0,
    2,
    undefined,
    ["u_image"],
  );
  el.classList.add("is-ready");
  return () => {
    mount.dispose();
    el.classList.remove("is-ready");
  };
}
