// Mercúrio (ProfitizeBuild) metal-ring.ts, as given; the tint is a parameter (default: the prompt's).
import {
  ShaderMount,
  liquidMetalFragmentShader,
  toProcessedLiquidMetal,
  getShaderColorFromString,
  ShaderFitOptions,
  LiquidMetalShapes,
} from '@paper-design/shaders';

// máscara: a pílula branca com o miolo recortado, em 4x para o contorno sair liso
function ringMask(w: number, h: number, ring: number) {
  const k = 4;
  const c = new OffscreenCanvas(Math.round(w * k), Math.round(h * k));
  const x = c.getContext('2d')!;
  x.fillStyle = '#fff';
  x.beginPath();
  x.roundRect(0, 0, c.width, c.height, c.height / 2);
  x.fill();
  const t = ring * k;
  x.globalCompositeOperation = 'destination-out';
  x.beginPath();
  x.roundRect(t, t, c.width - t * 2, c.height - t * 2, c.height / 2 - t);
  x.fill();
  return c;
}

// o processamento é pesado: uma vez por tamanho, em fila, para não travar a página
const cache = new Map<string, Promise<HTMLImageElement>>();
let queue: Promise<unknown> = Promise.resolve();
function processed(w: number, h: number, ring: number) {
  const key = `${w}x${h}:${ring}`;
  let p = cache.get(key);
  if (!p) {
    p = queue.then(async () => {
      const blob = await ringMask(w, h, ring).convertToBlob({ type: 'image/png' });
      const { pngBlob } = await toProcessedLiquidMetal(new File([blob], 'mask.png', { type: 'image/png' }));
      const img = new Image();
      img.src = URL.createObjectURL(pngBlob);
      await img.decode();
      return img;
    });
    queue = p.catch(() => {});
    cache.set(key, p);
  }
  return p;
}

/** Monta o anel de metal dentro de `el` (o .metal-btn__metal). Devolve a função de desmontar. */
export async function mountMetalRing(el: HTMLElement, tint = "#eee6f6") {
  // tamanho de layout, não o retângulo na tela: dentro de algo com transform: scale() os dois diferem
  const image = await processed(el.offsetWidth, el.offsetHeight, 2);
  if (!el.isConnected) return () => {};
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mount = new ShaderMount(
    el,
    liquidMetalFragmentShader,
    {
      u_colorBack: getShaderColorFromString('rgba(0,0,0,0)'),
      u_colorTint: getShaderColorFromString(tint),
      u_image: image,
      u_isImage: true,
      u_shape: LiquidMetalShapes.none,
      u_repetition: 1.5,
      u_softness: 0.15,
      u_shiftRed: 0.3,
      u_shiftBlue: 0.3,
      u_distortion: 0.08,
      u_contour: 0.2,
      u_angle: 90,
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
    undefined, // atributos do contexto WebGL (padrão)
    still ? 0 : 1, // velocidade: 0 deixa o metal parado
    0, // quadro inicial
    2, // densidade mínima de pixels: o anel tem 2 px e precisa de nitidez
    undefined, // limite de pixels (padrão)
    ['u_image'], // uniforms com mipmap
  );
  el.classList.add('is-ready');
  return () => {
    mount.dispose();
    el.classList.remove('is-ready');
  };
}
