import type { WebglStageOptions } from "@/lib/webgl-stage";

/*
 * Ondas: the hero of the live kevinhs.dev (old repo, main: creative/hero-shader.tsx), ported
 * to WebGL2: flowing "telemetry" contour lines in the accent, brighter toward the bottom, with
 * the accent glow the old hero had under it.
 */
const fragment = `#version 300 es
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform vec3 u_accent;
uniform vec3 u_bg;
out vec4 o;

float h(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(h(i), h(i + vec2(1, 0)), u.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, s = 0.5;
  for (int i = 0; i < 5; i++) { v += s * n(p); p *= 2.02; s *= 0.5; }
  return v;
}

void main() {
  float t = u_time;
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 q = uv * vec2(u_res.x / u_res.y, 1.0) * 2.2;
  float f = fbm(q + vec2(t * 0.05, -t * 0.03) + fbm(q * 1.3 - t * 0.02));
  float lines = smoothstep(0.06, 0.0, abs(fract(f * 9.0) - 0.5) - 0.44);
  float glow = smoothstep(0.2, 1.0, f) * (1.0 - uv.y * 0.6);
  float m = lines * 0.55 * glow + glow * 0.18;
  vec3 c = mix(u_bg, u_accent, m);
  // the old hero's accent glow, low on the right
  vec2 g = (uv - vec2(0.8, -0.1)) / vec2(1.2, 0.8);
  c += u_accent * 0.28 * smoothstep(1.0, 0.0, length(g)) * (1.0 - m);
  o = vec4(c, 1.0);
}`;

export const ondas: WebglStageOptions = {
  fragment,
  colors: { u_accent: "--accent", u_bg: "--background" },
  resolution: 0.75,
  ease: { pointer: 0.06, hover: 0.04 },
};
