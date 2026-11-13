// The Earth on a sphere, in WebGL: at night (NASA Black Marble 2016) or by day for the light
// theme (NASA Blue Marble, Dec 2004), both public domain. The body is lit at the rim like an
// atmosphere, with a glow above the limb. A map is an equirectangular image, possibly cropped
// to the part a view can show. Shared by the footer and the journey.
import type { Vec3 } from "./sphere";

export type EarthMap = {
  /** The image, or a pick by the GPU's largest texture. */
  src: string | ((maxTexture: number) => string);
  /** What part of the world the image covers, in degrees (default: all of it). */
  crop?: { lon0: number; lon1: number; lat0: number; lat1: number };
};

export type EarthFrame = {
  /** Canvas size in CSS px and the pixel ratio it is drawn at. */
  w: number;
  h: number;
  dpr: number;
  /** The sphere: center and radius in CSS px, and the view (rows: screen x, y, z in world). */
  cx: number;
  cy: number;
  R: number;
  m: [Vec3, Vec3, Vec3];
  accent: Vec3;
  /** Light theme: the day map (the night one shows until it is in). */
  day?: boolean;
};

const VS = `#version 300 es
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;
const FS = `#version 300 es
precision highp float;
uniform vec2 u_res;
uniform vec2 u_c;
uniform float u_R;
uniform float u_dpr;
uniform vec3 u_accent;
uniform vec3 u_ex;
uniform vec3 u_ey;
uniform vec3 u_ez;
uniform vec4 u_crop; // lon0, lon1, lat0, lat1
uniform sampler2D u_map;
uniform sampler2D u_color; // the day map, for the night's colours
uniform vec4 u_crop2;
uniform float u_colored;
uniform float u_ready;
uniform float u_day;
out vec4 o;
void main() {
  vec2 px = vec2(gl_FragCoord.x, u_res.y - gl_FragCoord.y);
  vec2 q = (px - u_c) / u_R;
  float r = length(q);
  float inside = clamp((1.0 - r) * u_R + 0.5, 0.0, 1.0);
  float z = sqrt(max(1.0 - r * r, 0.0));
  // back from the screen to the world, then to the map
  vec3 p = q.x * u_ex - q.y * u_ey + z * u_ez;
  float lat = degrees(asin(clamp(p.y, -1.0, 1.0)));
  float lon = degrees(atan(p.x, p.z));
  vec2 uv = vec2((lon - u_crop.x) / (u_crop.y - u_crop.x), (u_crop.w - lat) / (u_crop.w - u_crop.z));
  vec3 tex = texture(u_map, clamp(uv, 0.0, 1.0)).rgb;
  // night: the day's colours, deep in shadow, under the Black Marble's relief; the city lights
  // kept gold (they are the warm pixels; the land and sea are blue-grey)
  float lum = dot(tex, vec3(0.299, 0.587, 0.114));
  vec3 land = vec3(0.012, 0.02, 0.05) + pow(lum, 0.9) * vec3(0.82, 0.87, 1.0) * 1.6;
  vec2 uv2 = vec2((lon - u_crop2.x) / (u_crop2.y - u_crop2.x), (u_crop2.w - lat) / (u_crop2.w - u_crop2.z));
  vec3 col = texture(u_color, clamp(uv2, 0.0, 1.0)).rgb;
  land = mix(land, pow(col, vec3(1.1)) * 0.42 + land * 0.3, u_colored);
  vec3 lights = pow(tex, vec3(0.85)) * 1.9;
  lights += vec3(1.0, 0.7, 0.35) * smoothstep(0.55, 1.1, max(lights.r, lights.g)) * 0.3;
  vec3 night = mix(land, lights, clamp((tex.r - tex.b) * 6.0, 0.0, 1.0));
  vec3 earth = mix(night, pow(tex, vec3(0.92)) * 1.06, u_day);
  vec3 body = mix(mix(vec3(0.012, 0.02, 0.05), vec3(0.75, 0.82, 0.9), u_day), earth, u_ready);
  // the atmosphere seen edge-on: the rim lifts toward the accent (a pale sky by day)
  vec3 air = mix(u_accent * 0.6, vec3(0.62, 0.8, 1.0), u_day);
  body = mix(body, air, pow(1.0 - z, mix(5.0, 3.0, u_day)) * mix(0.85, 0.7, u_day));
  // the glow above the limb
  float g = exp(-max(r - 1.0, 0.0) * u_R / (26.0 * u_dpr)) * mix(0.85, 0.55, u_day);
  o = mix(vec4(mix(u_accent, vec3(0.45, 0.68, 1.0), u_day) * g, g), vec4(body, 1.0), inside);
}`;

/** Mounts the Earth on `canvas`. Null without WebGL2. `onReady` fires as each map comes in. */
export function createEarth(
  canvas: HTMLCanvasElement,
  /** `tint`: the day map the night borrows its colours from (default: `day`), on unit 1. */
  maps: { night: EarthMap; day?: EarthMap; tint?: EarthMap },
  onReady?: () => void,
) {
  const gl = canvas.getContext("webgl2", { antialias: false, premultipliedAlpha: true });
  // a lost context (too many on the page) compiles nothing: fall back like no WebGL2
  if (!gl || gl.isContextLost()) return null;
  const prog = gl.createProgram()!;
  for (const [type, src] of [
    [gl.VERTEX_SHADER, VS],
    [gl.FRAGMENT_SHADER, FS],
  ] as const) {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(s);
      if (log) console.error(log);
      return null;
    }
    gl.attachShader(prog, s);
  }
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  const u = (n: string) => gl.getUniformLocation(prog, n);
  const maxTexture = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number;

  // each map loads the first time it is wanted: mipmapped and anisotropic, so the foreshortened
  // limb stays sharp
  type Loaded = { tex: WebGLTexture; img: HTMLImageElement; ready: boolean; map: EarthMap };
  const loaded: Partial<Record<"night" | "day" | "tint", Loaded>> = {};
  const load = (key: "night" | "day" | "tint") => {
    const map = (key === "tint" ? (maps.tint ?? maps.day) : maps[key])!;
    const l: Loaded = { tex: gl.createTexture(), img: new Image(), ready: false, map };
    l.img.decoding = "async";
    l.img.src = typeof map.src === "string" ? map.src : map.src(maxTexture);
    l.img.onload = () => {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, l.tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, l.img);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const aniso = gl.getExtension("EXT_texture_filter_anisotropic");
      if (aniso)
        gl.texParameterf(
          gl.TEXTURE_2D,
          aniso.TEXTURE_MAX_ANISOTROPY_EXT,
          Math.min(8, gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT)),
        );
      l.ready = true;
      onReady?.();
    };
    return (loaded[key] = l);
  };

  return {
    draw(f: EarthFrame) {
      const W = Math.round(f.w * f.dpr);
      const H = Math.round(f.h * f.dpr);
      if (canvas.width !== W || canvas.height !== H) {
        canvas.width = W;
        canvas.height = H;
      }
      gl.viewport(0, 0, W, H);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(u("u_res"), W, H);
      gl.uniform2f(u("u_c"), f.cx * f.dpr, f.cy * f.dpr);
      gl.uniform1f(u("u_R"), f.R * f.dpr);
      gl.uniform1f(u("u_dpr"), f.dpr);
      gl.uniform3fv(u("u_accent"), f.accent);
      gl.uniform3fv(u("u_ex"), f.m[0]);
      gl.uniform3fv(u("u_ey"), f.m[1]);
      gl.uniform3fv(u("u_ez"), f.m[2]);
      const want = f.day && maps.day ? "day" : "night";
      const wanted = loaded[want] ?? load(want);
      // the day map not in yet: keep the night one meanwhile
      const l = wanted.ready || !loaded.night?.ready ? wanted : loaded.night;
      const crop = l.map.crop ?? { lon0: -180, lon1: 180, lat0: -90, lat1: 90 };
      gl.uniform4f(u("u_crop"), crop.lon0, crop.lon1, crop.lat0, crop.lat1);
      gl.uniform1f(u("u_ready"), l.ready ? 1 : 0);
      const isDay = l.ready && l === loaded.day;
      gl.uniform1f(u("u_day"), isDay ? 1 : 0);
      // the night's colours: the tint map on unit 1, once it is in
      const t = !isDay && (maps.tint ?? maps.day) ? (loaded.tint ?? load("tint")) : undefined;
      const crop2 = t?.map.crop ?? { lon0: -180, lon1: 180, lat0: -90, lat1: 90 };
      gl.uniform4f(u("u_crop2"), crop2.lon0, crop2.lon1, crop2.lat0, crop2.lat1);
      gl.uniform1f(u("u_colored"), t?.ready ? 1 : 0);
      gl.uniform1i(u("u_map"), 0);
      gl.uniform1i(u("u_color"), 1);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, t?.ready ? t.tex : null);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, l.tex);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    destroy() {
      // free, don't lose: the canvas keeps its one context, and a remount (StrictMode) reuses it
      for (const l of Object.values(loaded)) {
        l.img.onload = null;
        gl.deleteTexture(l.tex);
      }
      gl.deleteProgram(prog);
    },
  };
}
