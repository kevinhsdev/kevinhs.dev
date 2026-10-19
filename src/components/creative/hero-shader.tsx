"use client";

import { useEffect, useRef, useState } from "react";

/*
 * A few-KB WebGL fragment shader instead of three.js: flowing "telemetry"
 * contour lines in the accent color. It is purely decorative, so it:
 *   - starts only after the page is idle (never competes with LCP),
 *   - skips Save-Data, reduced motion and missing WebGL,
 *   - renders at device resolution (capped) and pauses when off-screen or hidden.
 * A static CSS gradient sits underneath as the fallback.
 *
 * Under the secret arcade theme (`data-arcade` on <html>) the same field turns
 * 8-bit: it renders at a fraction of the resolution, scaled up crisp by CSS,
 * and its colours snap to four steps, like an old console's palette.
 */

const VERTEX = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

const FRAGMENT = `precision mediump float;
uniform vec2 r;uniform float t;uniform vec3 a;uniform vec3 b;uniform float k;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float v=0.,s=.5;for(int i=0;i<5;i++){v+=s*n(p);p*=2.02;s*=.5;}return v;}
void main(){vec2 uv=gl_FragCoord.xy/r;vec2 q=uv*vec2(r.x/r.y,1.)*2.2;
float f=fbm(q+vec2(t*.05,-t*.03)+fbm(q*1.3-t*.02));
float lines=smoothstep(.06,0.,abs(fract(f*9.)-.5)-.44);
float glow=smoothstep(.2,1.,f)*(1.-uv.y*.6);
float m=lines*.55*glow+glow*.18;
if(k>.5)m=floor(m*4.+.35)/4.;
vec3 c=mix(b,a,m);
gl_FragColor=vec4(c,1.);}`;

function hexToRgb(value: string): [number, number, number] {
  const hex = value.trim().replace("#", "");
  const int = parseInt(hex.length === 3 ? hex.replace(/./g, "$&$&") : hex, 16);
  return [((int >> 16) & 255) / 255, ((int >> 8) & 255) / 255, (int & 255) / 255];
}

function canRun(): boolean {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return (
    window.matchMedia("(prefers-reduced-motion: no-preference)").matches && !connection?.saveData
  );
}

export function HeroShader() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canRun()) return;

    let frame = 0;
    let visible = true;
    let cleanup = () => {};

    const start = () => {
      const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
      if (!gl) return;

      const shader = (type: number, source: string) => {
        const s = gl.createShader(type)!;
        gl.shaderSource(s, source);
        gl.compileShader(s);
        return s;
      };
      const program = gl.createProgram()!;
      gl.attachShader(program, shader(gl.VERTEX_SHADER, VERTEX));
      gl.attachShader(program, shader(gl.FRAGMENT_SHADER, FRAGMENT));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
      gl.useProgram(program);

      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const position = gl.getAttribLocation(program, "p");
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

      const uRes = gl.getUniformLocation(program, "r");
      const uTime = gl.getUniformLocation(program, "t");
      const uAccent = gl.getUniformLocation(program, "a");
      const uBg = gl.getUniformLocation(program, "b");
      const uPixel = gl.getUniformLocation(program, "k");
      const arcade = () => document.documentElement.hasAttribute("data-arcade");

      const resize = () => {
        // Device pixels, capped: the thin contour lines alias below 1:1, while
        // past 1.5x the extra GPU cost buys no visible sharpness. The arcade
        // look wants the opposite: one canvas pixel per 8 CSS pixels.
        const scale = arcade() ? 1 / 8 : Math.min(window.devicePixelRatio || 1, 1.5);
        canvas.width = Math.max(1, Math.floor(canvas.clientWidth * scale));
        canvas.height = Math.max(1, Math.floor(canvas.clientHeight * scale));
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform2f(uRes, canvas.width, canvas.height);
      };
      const readColors = () => {
        const styles = getComputedStyle(canvas);
        gl.uniform3fv(uAccent, hexToRgb(styles.getPropertyValue("--accent")));
        gl.uniform3fv(uBg, hexToRgb(styles.getPropertyValue("--background")));
        gl.uniform1f(uPixel, arcade() ? 1 : 0);
        resize();
        loop(performance.now());
      };
      // Theme switches (light/dark, arcade) change the tokens and the resolution.
      const themeObserver = new MutationObserver(readColors);
      themeObserver.observe(document.documentElement, {
        attributeFilter: ["class", "data-arcade"],
      });

      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(canvas);

      const visibility = new IntersectionObserver(([entry]) => {
        visible = Boolean(entry?.isIntersecting);
        if (visible && !document.hidden) loop(performance.now());
      });
      visibility.observe(canvas);

      const t0 = performance.now();
      const loop = (now: number) => {
        cancelAnimationFrame(frame);
        if (!visible || document.hidden) return;
        gl.uniform1f(uTime, (now - t0) / 1000);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        frame = requestAnimationFrame(loop);
      };
      const onVisibility = () => !document.hidden && loop(performance.now());
      document.addEventListener("visibilitychange", onVisibility);
      readColors();
      setReady(true);

      cleanup = () => {
        cancelAnimationFrame(frame);
        themeObserver.disconnect();
        resizeObserver.disconnect();
        visibility.disconnect();
        document.removeEventListener("visibilitychange", onVisibility);
        gl.getExtension("WEBGL_lose_context")?.loseContext();
      };
    };

    // Safari only recently shipped requestIdleCallback; fall back to a timeout.
    const hasIdle = typeof window.requestIdleCallback === "function";
    const idle = hasIdle
      ? window.requestIdleCallback(start, { timeout: 2000 })
      : window.setTimeout(start, 1200);

    return () => {
      if (hasIdle) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      cleanup();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="hero-shader absolute inset-0 size-full opacity-0 transition-opacity duration-1000 ease-out data-[ready=true]:opacity-100"
      data-ready={ready}
    />
  );
}
