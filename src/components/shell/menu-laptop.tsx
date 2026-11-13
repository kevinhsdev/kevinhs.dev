"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { AfterimagePass } from "three/examples/jsm/postprocessing/AfterimagePass.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

type Props = { open: boolean };

const LID_OPEN = 1.9; // radians from closed
const SCREEN_W = 3.6;
const SCREEN_H = 2.25;
const ease = (x: number) => 1 - Math.pow(1 - Math.min(Math.max(x, 0), 1), 4);

/* ───────── the screen: a hacker terminal, typed live onto a canvas ───────── */

/** What scrolls past: "$" lines are typed key by key, the rest print at once. Decoration only. */
const SCRIPT = [
  "$ ssh kevin@dev-box",
  "> handshake ok · key ed25519 · 12ms",
  "$ git pull --rebase",
  "> fast-forward · 14 files changed",
  "$ npm run build",
  "> compiling 214 modules…",
  "%build",
  "> build ok in 3.2s",
  '$ claude "refactor the auth flow"',
  "> agent: reading 12 files",
  "> agent: plan ready · 4 steps",
  "> tests: 78 passed · 0 failed",
  "$ nmap -sV localhost",
  "> 22/tcp   open  ssh",
  "> 443/tcp  open  https",
  "#hex",
  "#hex",
  "$ python3 train.py --epochs 20",
  "%train",
  "> epoch 20/20 · loss 0.0412 · acc 0.981",
  "$ docker compose up -d",
  "> api ✓  db ✓  cache ✓",
  "$ ./deploy --prod",
  "#hex",
  "> deployed ✓",
];

const GREEN = "#3dff8a";
const DIM = "#1d7a49";
const BLUE = "#4d8dff";
const W = 1152;
const H = 720;
const LINE = 38;
const TOP = 70;
const ROWS = Math.floor((H - TOP - 20) / LINE);
const MONO = "ui-monospace, Menlo, Consolas, monospace";

type Row = { text: string; kind: "cmd" | "out" | "bar"; label?: string };

function hexLine() {
  const h = () =>
    Math.floor(Math.random() * 0xffff)
      .toString(16)
      .padStart(4, "0");
  return `0x${h()}${h()}  ${h()} ${h()} ${h()} ${h()}  ${h()} ${h()}`;
}

function makeTerminal() {
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;

  const rows: Row[] = [];
  let step = 0; // index into SCRIPT
  let typed = 0; // chars of the current command typed so far
  let wait = 0; // ticks before the next line
  let bar = 0; // progress of the current bar
  let tick = 0;

  // matrix rain, faint, behind the text
  const COLS = 40;
  const drops = Array.from({ length: COLS }, () => Math.random() * -30);
  const glyph = () => String.fromCharCode(0x30a0 + Math.floor(Math.random() * 96));

  const push = (r: Row) => {
    rows.push(r);
    if (rows.length > ROWS) rows.shift();
  };

  function advance() {
    if (wait > 0) return void wait--;
    const line = SCRIPT[step % SCRIPT.length]!;
    if (line.startsWith("$")) {
      if (typed === 0) push({ text: "", kind: "cmd" });
      typed = Math.min(line.length, typed + 1 + (Math.random() < 0.3 ? 1 : 0));
      rows[rows.length - 1]!.text = line.slice(2, typed);
      if (typed >= line.length) {
        typed = 0;
        step++;
        wait = 6;
      }
    } else if (line.startsWith("%")) {
      if (bar === 0) push({ text: "0", kind: "bar", label: line.slice(1) });
      bar = Math.min(1, bar + 0.02 + Math.random() * 0.03);
      rows[rows.length - 1]!.text = String(bar);
      if (bar >= 1) {
        bar = 0;
        step++;
        wait = 4;
      }
    } else {
      push({ text: line === "#hex" ? hexLine() : line.replace(/^> /, "  "), kind: "out" });
      step++;
      wait = 2 + Math.floor(Math.random() * 4);
    }
  }

  function draw() {
    tick++;
    advance();
    g.fillStyle = "#03060c";
    g.fillRect(0, 0, W, H);
    // rain
    g.font = `22px ${MONO}`;
    for (let i = 0; i < COLS; i++) {
      const x = i * (W / COLS) + 6;
      const y = drops[i]! * 26;
      g.fillStyle = "rgba(61,255,138,0.16)";
      g.fillText(glyph(), x, y);
      g.fillStyle = "rgba(61,255,138,0.06)";
      g.fillText(glyph(), x, y - 26);
      drops[i]! += 0.6 + (i % 3) * 0.25;
      if (y > H && Math.random() > 0.96) drops[i] = Math.random() * -10;
    }
    // title bar
    g.fillStyle = "#0b1220";
    g.fillRect(0, 0, W, 48);
    ["#ff5f57", "#febc2e", "#28c840"].forEach((col, i) => {
      g.fillStyle = col;
      g.beginPath();
      g.arc(30 + i * 26, 24, 8, 0, Math.PI * 2);
      g.fill();
    });
    g.fillStyle = "#8e9ab5";
    g.fillText("kevin@code: ~", 120, 31);
    // lines
    g.font = `26px ${MONO}`;
    rows.forEach((r, i) => {
      const y = TOP + 20 + i * LINE;
      if (r.kind === "cmd") {
        g.fillStyle = BLUE;
        g.fillText("❯", 28, y);
        g.fillStyle = "#eef2fb";
        g.fillText(r.text, 60, y);
        if (i === rows.length - 1 && tick % 16 < 8) {
          g.fillStyle = GREEN;
          g.fillRect(64 + g.measureText(r.text).width, y - 22, 14, 28);
        }
      } else if (r.kind === "bar") {
        const p = Number(r.text);
        const cells = 28;
        const full = Math.round(p * cells);
        const head = `${r.label} [`;
        g.fillStyle = DIM;
        g.fillText(head, 28, y);
        const x0 = 28 + g.measureText(head).width;
        g.fillStyle = GREEN;
        g.fillText("█".repeat(full), x0, y);
        g.fillStyle = DIM;
        g.fillText(
          "░".repeat(cells - full) + `] ${Math.round(p * 100)}%`,
          x0 + g.measureText("█".repeat(full)).width,
          y,
        );
      } else {
        g.fillStyle = r.text.startsWith("0x") ? DIM : GREEN;
        g.fillText(r.text, 28, y);
      }
    });
    // scanlines and a glow from the corner
    g.fillStyle = "rgba(0,0,0,0.18)";
    for (let y = 0; y < H; y += 4) g.fillRect(0, y, W, 2);
    const glow = g.createRadialGradient(W * 0.8, H * 0.15, 10, W * 0.8, H * 0.15, W * 0.6);
    glow.addColorStop(0, "rgba(77,141,255,0.16)");
    glow.addColorStop(1, "rgba(77,141,255,0)");
    g.fillStyle = glow;
    g.fillRect(0, 0, W, H);
    tex.needsUpdate = true;
  }

  // fill the screen before it is first seen
  for (let i = 0; i < 160; i++) advance();
  draw();
  return { tex, draw };
}

/** A soft round shadow for the floor, drawn once. */
function shadowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const r = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  r.addColorStop(0, "rgba(0,0,0,0.55)");
  r.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = r;
  g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

/**
 * The glitch the notebook leaves when it moves: the colour channels split along the motion,
 * bands of pixels jump sideways and smear into blocks. `amt` is 0 at rest and 1 at full speed.
 */
const Glitch = {
  uniforms: {
    tDiffuse: { value: null },
    amt: { value: 0 },
    dir: { value: new THREE.Vector2(1, 0) },
    time: { value: 0 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float amt;
    uniform vec2 dir;
    uniform float time;
    varying vec2 vUv;
    float hash(float n) { return fract(sin(n) * 43758.5453); }
    void main() {
      vec2 uv = vUv;
      float tick = floor(time * 14.0);
      // bands that jump sideways
      float band = floor(uv.y * 34.0);
      float r = hash(band + tick * 7.13);
      if (r > 1.0 - amt * 0.45) uv.x += (hash(band * 3.1 + tick) - 0.5) * 0.08 * amt;
      // some of them smear into blocks, like stretched pixels
      if (r > 1.0 - amt * 0.18) uv = (floor(uv * vec2(60.0, 140.0)) + 0.5) / vec2(60.0, 140.0);
      vec2 o = dir * 0.015 * amt;
      vec4 cr = texture2D(tDiffuse, uv + o);
      vec4 cg = texture2D(tDiffuse, uv);
      vec4 cb = texture2D(tDiffuse, uv - o);
      gl_FragColor = vec4(cr.r, cg.g, cb.b, max(cg.a, max(cr.a, cb.a)));
    }`,
};

/**
 * The menu's 3D notebook, modelled in code (no model file): a MacBook-style laptop in space
 * black, lit by a studio environment, with softly backlit keys, a glass trackpad, a notch and a
 * screen running a hacker terminal. When the menu opens it rises in turning and the lid swings open; it
 * leans gently toward the pointer, and the faster the pointer moves the more it glitches.
 * Renders only while the menu is open; with reduced motion it sits still, open and clean.
 */
export default function MenuLaptop({ open }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const api = useRef<((o: boolean) => void) | null>(null);
  const first = useRef(open);

  useEffect(() => {
    const el = host.current!;
    if (!window.matchMedia("(min-width: 900px)").matches) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    el.append(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const env = pmrem.fromScene(room, 0.04).texture;
    scene.environment = env;

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);

    // lights on top of the environment: a key, a blue rim in the site's accent, a cool edge
    const key = new THREE.DirectionalLight(0xffffff, 1.4);
    key.position.set(3, 6, 5);
    scene.add(key);
    const rim = new THREE.PointLight(0x4d8dff, 40, 20);
    rim.position.set(-4, 2.5, -3);
    scene.add(rim);
    const edge = new THREE.PointLight(0xdfe8ff, 25, 18);
    edge.position.set(5, 3, 2);
    scene.add(edge);

    // materials
    // space-black anodised aluminium
    const body = new THREE.MeshPhysicalMaterial({
      color: 0x2b2c30,
      metalness: 1,
      roughness: 0.32,
      clearcoat: 0.3,
      clearcoatRoughness: 0.4,
    });
    const keyMat = new THREE.MeshStandardMaterial({
      color: 0x0b0b0d,
      roughness: 0.6,
      metalness: 0.1,
    });
    const pad = new THREE.MeshPhysicalMaterial({
      color: 0x1d1e22,
      metalness: 0.8,
      roughness: 0.18,
      clearcoat: 1,
    });
    // the backlight, faint, showing only through the gaps between the keys
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x3a3d46, toneMapped: false });
    const notchMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const bezel = new THREE.MeshPhysicalMaterial({
      color: 0x050608,
      roughness: 0.15,
      metalness: 0.2,
      clearcoat: 1,
    });
    const term = makeTerminal();
    const screenMat = new THREE.MeshBasicMaterial({ map: term.tex, toneMapped: false });

    const geos: THREE.BufferGeometry[] = [];
    const geo = <T extends THREE.BufferGeometry>(g: T) => (geos.push(g), g);

    // the notebook
    const laptop = new THREE.Group();
    laptop.add(new THREE.Mesh(geo(new RoundedBoxGeometry(4, 0.18, 2.8, 4, 0.08)), body));
    const well = new THREE.Mesh(geo(new THREE.PlaneGeometry(3.55, 1.32)), glowMat);
    well.rotation.x = -Math.PI / 2;
    well.position.set(0, 0.091, -0.45);
    laptop.add(well);
    const KC = 14;
    const KR = 5;
    const keys = new THREE.InstancedMesh(
      geo(new RoundedBoxGeometry(0.19, 0.05, 0.185, 2, 0.025)),
      keyMat,
      KC * KR,
    );
    const m = new THREE.Matrix4();
    for (let r = 0, n = 0; r < KR; r++)
      for (let c = 0; c < KC; c++, n++) {
        m.makeTranslation(-1.6 + c * 0.246, 0.11, -0.97 + r * 0.25);
        keys.setMatrixAt(n, m);
      }
    laptop.add(keys);
    const trackpad = new THREE.Mesh(geo(new RoundedBoxGeometry(1.75, 0.012, 0.9, 2, 0.006)), pad);
    trackpad.position.set(0, 0.092, 0.78);
    laptop.add(trackpad);

    // the lid hinges on the back edge of the base; closed, it lies on top of it
    const hinge = new THREE.Group();
    hinge.position.set(0, 0.09, -1.4);
    laptop.add(hinge);
    const lid = new THREE.Mesh(geo(new RoundedBoxGeometry(4, 0.09, 2.75, 4, 0.04)), body);
    lid.position.set(0, 0.045, 1.375);
    hinge.add(lid);
    const glass = new THREE.Mesh(geo(new THREE.PlaneGeometry(3.86, 2.58)), bezel);
    glass.rotation.x = Math.PI / 2;
    glass.position.set(0, -0.001, 1.375);
    hinge.add(glass);
    const screen = new THREE.Mesh(geo(new THREE.PlaneGeometry(SCREEN_W, SCREEN_H)), screenMat);
    screen.rotation.x = Math.PI / 2;
    screen.position.set(0, -0.003, 1.42);
    hinge.add(screen);
    const notch = new THREE.Mesh(geo(new THREE.PlaneGeometry(0.42, 0.09)), notchMat);
    notch.rotation.x = Math.PI / 2;
    notch.position.set(0, -0.004, 1.42 + SCREEN_H / 2 - 0.045);
    hinge.add(notch);
    // the screen's green glow falling on the keys
    const glow = new THREE.PointLight(0x3dff8a, 0, 4);
    glow.position.set(0, 1.2, -0.6);
    laptop.add(glow);

    // centre the open notebook on the rig's origin, so it turns about its middle and sits in
    // the middle of the column
    hinge.rotation.x = -LID_OPEN;
    laptop.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(laptop);
    const centre = box.getCenter(new THREE.Vector3());
    const radius = box.getBoundingSphere(new THREE.Sphere()).radius;
    laptop.position.sub(centre);
    hinge.rotation.x = 0;

    const rig = new THREE.Group();
    rig.add(laptop);
    scene.add(rig);

    // floor shadow, under the notebook
    const shadowTex = shadowTexture();
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    });
    const shadow = new THREE.Mesh(geo(new THREE.PlaneGeometry(6, 4)), shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -(centre.y - box.min.y) - 0.9;
    scene.add(shadow);

    // size: fit the whole open notebook in the column, whatever its shape
    // post-processing: render, glitch, trails, then tone mapping and colour space
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const glitch = new ShaderPass(Glitch);
    composer.addPass(glitch);
    const trails = new AfterimagePass(0);
    composer.addPass(trails);
    const output = new OutputPass();
    composer.addPass(output);

    const fit = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      composer.setPixelRatio(renderer.getPixelRatio());
      composer.setSize(w, h);
      camera.aspect = w / h;
      const half = Math.tan(((camera.fov / 2) * Math.PI) / 180);
      const dist = (radius / Math.min(half, half * camera.aspect)) * 1.12;
      camera.position.set(0, dist * 0.12, dist);
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);

    // the pointer across the window: -1 to 1 on each axis, and a smoothed copy
    const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
    const move = (e: PointerEvent) => {
      mouse.x = (e.clientX / innerWidth) * 2 - 1;
      mouse.y = (e.clientY / innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", move, { passive: true });
    let amt = 0;
    const dir = glitch.uniforms.dir!.value as THREE.Vector2;

    // open/close progress: 0 closed and below, 1 open and in place
    let isOpen = false;
    let p = 0;
    let raf = 0;
    let last = 0;
    let frameNo = 0;
    const clock = new THREE.Clock();

    const frame = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0.016;
      last = now;
      frameNo++;
      const target = isOpen ? 1 : 0;
      if (reduced) p = target;
      else p += (target - p) * (1 - Math.exp(-dt * (isOpen ? 3.2 : 9)));
      const t = clock.getElapsedTime();

      const rise = ease(p);
      const lidT = ease(Math.max(0, (p - 0.25) / 0.75));
      hinge.rotation.x = -LID_OPEN * lidT;

      const lx = mouse.sx;
      const ly = mouse.sy;
      mouse.sx += (mouse.x - mouse.sx) * (1 - Math.exp(-dt * 4));
      mouse.sy += (mouse.y - mouse.sy) * (1 - Math.exp(-dt * 4));
      const bob = reduced ? 0 : Math.sin(t * 1.3) * 0.09;
      rig.position.y = (1 - rise) * -3.2 + bob;
      rig.rotation.y = -0.55 + mouse.sx * 0.38 + (1 - rise) * 1.4;
      rig.rotation.x = 0.32 + mouse.sy * 0.14;
      rig.rotation.z = reduced ? 0 : Math.sin(t * 0.9) * 0.02;
      shadowMat.opacity = rise * (0.9 - bob * 1.5);
      shadow.scale.setScalar(1 - bob * 0.6);

      // glitch with the pointer's speed (and while it flies in): quick to start, slow to settle
      const vx = (mouse.sx - lx) / dt;
      const vy = (mouse.sy - ly) / dt;
      const speed = Math.hypot(vx, vy);
      const want = reduced ? 0 : Math.min(0.75, speed * 0.25 + (isOpen ? (1 - rise) * 0.6 : 0));
      amt += (want - amt) * (1 - Math.exp(-dt * (want > amt ? 18 : 4)));
      if (speed > 0.05) dir.set(vx / speed, -vy / speed);
      glitch.uniforms.amt!.value = amt;
      glitch.uniforms.time!.value = t;
      trails.uniforms.damp!.value = amt * 0.75;

      // the terminal runs at 30 fps, and only once the lid is up
      if (lidT > 0.2 && frameNo % 2 === 0) term.draw();
      screenMat.color.setScalar(lidT);
      glow.intensity = 5 * lidT;

      composer.render(dt);
      // closed and settled: stop drawing until the menu opens again
      if (!isOpen && p < 0.002) {
        raf = 0;
        last = 0;
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    api.current = (o) => {
      isOpen = o;
      if (o && !raf) raf = requestAnimationFrame(frame);
    };
    api.current(first.current);

    return () => {
      api.current = null;
      [glitch, trails, output].forEach((ps) => ps.dispose());
      composer.dispose();
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", move);
      geos.forEach((g) => g.dispose());
      [body, keyMat, pad, glowMat, notchMat, bezel, screenMat, shadowMat].forEach((mt) =>
        mt.dispose(),
      );
      [term.tex, shadowTex, env].forEach((tx) => tx.dispose());
      room.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  useEffect(() => {
    first.current = open;
    api.current?.(open);
  }, [open]);

  return <div ref={host} className="sm-3d" />;
}
