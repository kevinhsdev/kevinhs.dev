/*
 * A minimal WebGL2 runner for full-screen fragment shaders (Fluxo, Tipos):
 * one buffer-less triangle, pointer smoothing, pause off-screen, resize, and a
 * single still frame under prefers-reduced-motion. No libraries.
 */

const VERTEX = `#version 300 es
void main() { vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2); gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0); }`;

export type WebglStageOptions = {
  fragment: string;
  /** Uniform name → CSS custom property holding a hex color (read from the stage element). */
  colors: Record<string, string>;
  /** Canvas pixels per CSS pixel, before the devicePixelRatio (Fluxo 0.75, Tipos 1). */
  resolution: number;
  /** Minimum ms between frames (0 = every rAF). */
  frameInterval?: number;
  /** Per-frame easing toward the pointer / hover targets, at 60 fps. */
  ease: { pointer: number; hover: number };
  /** Also send u_dpr and u_center (Tipos). */
  pixelUniforms?: boolean;
};

function hexToVec3(value: string): [number, number, number] {
  const n = parseInt(value.trim().replace("#", ""), 16) || 0;
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/** Mounts the shader as the first child of `el`. Returns dispose(), or null without WebGL2. */
export function mountWebglStage(el: HTMLElement, options: WebglStageOptions): (() => void) | null {
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.className = "stage-canvas";
  const gl = canvas.getContext("webgl2", { antialias: false, alpha: false });
  if (!gl) return null;

  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
      console.error(gl.getShaderInfoLog(shader));
    return shader;
  };
  const program = gl.createProgram()!;
  gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, options.fragment));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);
  gl.bindVertexArray(gl.createVertexArray());

  const loc = (name: string) => gl.getUniformLocation(program, name);
  const uRes = loc("u_res");
  const uTime = loc("u_time");
  const uMouse = loc("u_mouse");
  const uHover = loc("u_hover");
  const uDpr = loc("u_dpr");
  const styles = getComputedStyle(el);
  for (const [name, cssVar] of Object.entries(options.colors)) {
    gl.uniform3fv(loc(name), hexToVec3(styles.getPropertyValue(cssVar)));
  }
  if (options.pixelUniforms) gl.uniform2f(loc("u_center"), 0, 0);

  el.prepend(canvas);

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
  let hover = 0;
  let hoverTarget = 0;
  let scale = 1;
  let frame = 0;
  let last = 0;
  let visible = false;
  const start = performance.now();

  const resize = () => {
    scale = Math.min(window.devicePixelRatio || 1, 2) * options.resolution;
    canvas.width = Math.max(1, Math.round(el.clientWidth * scale));
    canvas.height = Math.max(1, Math.round(el.clientHeight * scale));
    gl.viewport(0, 0, canvas.width, canvas.height);
  };

  const draw = (time: number) => {
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, time);
    gl.uniform2f(uMouse, mouse.x, mouse.y);
    gl.uniform1f(uHover, hover);
    if (options.pixelUniforms) gl.uniform1f(uDpr, scale);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const tick = (now: number) => {
    frame = requestAnimationFrame(tick);
    const dt = now - last;
    if (dt < (options.frameInterval ?? 0)) return;
    last = now;
    // frame-rate independent easing: the factors are tuned for 60 fps
    const steps = Math.min(dt, 100) / (1000 / 60);
    const kp = 1 - Math.pow(1 - options.ease.pointer, steps);
    const kh = 1 - Math.pow(1 - options.ease.hover, steps);
    mouse.x += (mouse.tx - mouse.x) * kp;
    mouse.y += (mouse.ty - mouse.y) * kp;
    hover += (hoverTarget - hover) * kh;
    draw((now - start) / 1000);
  };

  const still = () => {
    mouse.x = mouse.tx;
    mouse.y = mouse.ty;
    hover = hoverTarget;
    draw(18);
  };

  const onMove = (event: PointerEvent) => {
    const rect = el.getBoundingClientRect();
    mouse.tx = (event.clientX - rect.left) / rect.width;
    mouse.ty = 1 - (event.clientY - rect.top) / rect.height;
    hoverTarget = 1;
    if (reduced) still();
  };
  const onLeave = () => {
    hoverTarget = 0;
    if (reduced) still();
  };

  const resizeObserver = new ResizeObserver(() => {
    resize();
    if (reduced || !visible) still();
  });
  const intersection = new IntersectionObserver(
    ([entry]) => {
      visible = !!entry?.isIntersecting;
      cancelAnimationFrame(frame);
      if (visible && !reduced) frame = requestAnimationFrame(tick);
    },
    { rootMargin: "100px" },
  );

  resize();
  still();
  resizeObserver.observe(el);
  intersection.observe(el);
  el.addEventListener("pointermove", onMove);
  el.addEventListener("pointerleave", onLeave);

  return () => {
    cancelAnimationFrame(frame);
    resizeObserver.disconnect();
    intersection.disconnect();
    el.removeEventListener("pointermove", onMove);
    el.removeEventListener("pointerleave", onLeave);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    canvas.remove();
  };
}
