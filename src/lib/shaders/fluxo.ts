import type { WebglStageOptions } from "@/lib/webgl-stage";

/* Fluxo (ProfitizeBuild): marbled liquid ink running diagonally; the pointer swirls it. */
const fragment = `#version 300 es
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_hover;
uniform vec3 u_light;  // plano claro
uniform vec3 u_rim;    // borda acesa
uniform vec3 u_blue;   // fitas
uniform vec3 u_deep;   // fundo
out vec4 o;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm3(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 3; i++) { v += a * noise(p); p = mat2(1.6, 1.2, -1.2, 1.6) * p + 3.1; a *= 0.5; }
  return v / 0.875;
}

void main() {
  float asp = u_res.x / u_res.y;
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  vec2 m = (u_mouse - 0.5) * vec2(asp, 1.0);
  float t = u_time * 0.07;

  // a tinta escorre na diagonal: gira e estica o espaço
  vec2 s = mat2(0.8, -0.6, 0.6, 0.8) * p * (asp > 1.0 ? 0.85 : 1.15);
  s.y *= 1.8;

  vec2 q = vec2(fbm3(s + vec2(0.0, t)), fbm3(s + vec2(5.2, -t * 0.8)));
  vec2 dm = p - m;
  q += 0.9 * u_hover * exp(-dot(dm, dm) * 7.0) * vec2(-dm.y, dm.x);   // redemoinho no ponteiro
  vec2 r = vec2(fbm3(s + 4.2 * q + vec2(1.7, 9.2) + t * 1.3), fbm3(s + 4.2 * q + vec2(8.3, 2.8) - t * 1.1));
  float f = fbm3(s + 3.6 * r + t * 0.5);

  // atrás do texto (centro do palco) a tinta puxa para as fitas escuras; o plano claro fica para as bordas
  vec2 tb = p / vec2(0.36 * max(asp, 1.0), asp > 1.0 ? 0.3 : 0.42);
  float behind = exp(-dot(tb, tb));
  f -= (asp > 1.0 ? 0.2 : 0.12) * behind;
  // estrias: linhas finas que seguem o fluxo e se juntam onde a tinta estica
  float streak = sin(length(r) * 150.0 + f * 40.0);
  f += 0.014 * streak * smoothstep(0.32, 0.52, f) * smoothstep(0.64, 0.54, f);

  // rampa: fundo → fitas → borda acesa → plano claro
  vec3 deep = u_deep * 0.75;
  float band = smoothstep(0.34, 0.52, f);
  float lit = smoothstep(0.588, 0.605, f);
  float rim = exp(-pow((f - 0.576) / 0.022, 2.0));
  vec3 col = mix(deep, u_blue, band * (0.45 + 0.55 * smoothstep(0.42, 0.55, f)));
  col += mix(u_blue, u_light, 0.45) * 0.45 * pow(clamp(length(r - 0.5) * 2.2 - 0.4, 0.0, 1.0), 3.0) * band;  // brilho nas fitas
  col = mix(col, u_rim, clamp(rim, 0.0, 1.0) * 0.95);
  col = mix(col, u_light, lit);
  // se o plano claro chegar ao texto, vira meio-tom ali: o branco do título não some
  col *= 1.0 - 0.5 * behind * max(lit, rim * 0.6);
  o = vec4(col, 1.0);
}`;

export const fluxo: WebglStageOptions = {
  fragment,
  colors: {
    u_light: "--fluxo-light",
    u_rim: "--fluxo-rim",
    u_blue: "--fluxo-blue",
    u_deep: "--fluxo-deep",
  },
  resolution: 0.75,
  ease: { pointer: 0.06, hover: 0.04 },
};
