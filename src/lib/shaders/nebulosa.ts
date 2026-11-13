import {
  GrainGradientShapes,
  ShaderFitOptions,
  ShaderMount,
  getShaderColorFromString,
  getShaderNoiseTexture,
  grainGradientFragmentShader,
} from "@paper-design/shaders";

/*
 * Nebulosa (ProfitizeBuild): Paper's GrainGradient (Apache-2.0) in "corners"
 * shape, two grainy light blobs breathing in opposite corners, with a clean
 * black far from them and a wider framing on tall stages.
 */

let noise: Promise<HTMLImageElement | undefined> | undefined;
function loadNoise() {
  noise ??= (async () => {
    const img = getShaderNoiseTexture();
    await img?.decode();
    return img;
  })();
  return noise;
}

const ANCHORS = [
  ["uniform float u_noise;", "uniform float u_noise;\nuniform float u_grainSpread;"],
  [
    "float baseNoise = snoise(grain_uv * .5);",
    "float shape0 = shape;\nfloat baseNoise = snoise(grain_uv * .5);",
  ],
  [
    "fragColor = vec4(color, opacity);",
    "color = mix(bgColor, color, mix(smoothstep(0., 0.3, shape0), 1., u_grainSpread));\nfragColor = vec4(color, opacity);",
  ],
] as const;

/** Clean dark: keep the grain inside the blobs only. Falls back to the original shader if Paper changes it. */
function cleanFragment(): string {
  if (!ANCHORS.every(([anchor]) => grainGradientFragmentShader.includes(anchor))) {
    console.warn("[nebulosa] GrainGradient shader changed; using the original");
    return grainGradientFragmentShader;
  }
  return ANCHORS.reduce(
    (src, [anchor, next]) => src.replace(anchor, next),
    grainGradientFragmentShader,
  );
}

/** Mounts the shader in `el` once the noise texture is ready. Returns the unmount function. */
export function mountNebulosa(el: HTMLElement): () => void {
  let disposed = false;
  let cleanup = () => {};

  void loadNoise().then((texture) => {
    if (disposed) return;
    const css = getComputedStyle(el);
    const color = (name: string) => getShaderColorFromString(css.getPropertyValue(name).trim());
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    try {
      const mount = new ShaderMount(
        el,
        cleanFragment(),
        {
          u_colorBack: color("--nebula-back"),
          u_colors: ["--nebula-1", "--nebula-2", "--nebula-3", "--nebula-4"].map(color),
          u_colorsCount: 4,
          u_softness: 0.5,
          u_intensity: 0.5,
          u_noise: 0.25,
          u_grainSpread: 0,
          u_shape: GrainGradientShapes.corners,
          u_noiseTexture: texture!,
          u_fit: ShaderFitOptions.cover,
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
        reduced ? 0 : 1,
        0,
      );
      // The "corners" shape lives in a square box. Wide stage: cover, so the blobs sit in the
      // real corners instead of behind the left-aligned hero text. Tall stage: contain, scaled
      // up so only the blob edges show at the sides.
      const resize = new ResizeObserver(() => {
        const tall = el.clientHeight > el.clientWidth;
        mount.setUniforms({
          u_fit: tall ? ShaderFitOptions.contain : ShaderFitOptions.cover,
          u_scale: tall ? 1.4 : 1,
        });
      });
      resize.observe(el);
      cleanup = () => {
        resize.disconnect();
        mount.dispose();
      };
    } catch {
      el.classList.add("no-gl");
    }
  });

  return () => {
    disposed = true;
    cleanup();
  };
}
