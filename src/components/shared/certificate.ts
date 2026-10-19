import { jpegToPdf } from "@/lib/pdf";

/*
 * The legend certificate, drawn on a canvas at A4 landscape proportions: a
 * guilloché border, a serif title, the visitor's name, a gold seal with the
 * arcade's pixel crown and a signature. The same drawing feeds the live
 * preview (small) and the PDF (large).
 */

export type CertificateText = {
  brand: string;
  title: string;
  kicker: string;
  lead: string;
  body: string;
  body2: string;
  date: string;
  dateLabel: string;
  sign: string;
  role: string;
  id: string;
};

/** Design units; the canvas is this times the scale. */
export const CERT_W = 1754;
export const CERT_H = 1240;

const PAPER = "#fbf7ee";
const INK = "#1c1b3d";
const MUTED = "#5b587a";
const GOLD = "#b8892a";
const GOLD_LT = "#e9c46a";
const RED = "#a8121e";
const SERIF = 'Georgia, "Times New Roman", serif';

const CROWN = ["Y...YY...Y", "YY.YYYY.YY", "YYYYjjYYYY", "YeYYYYYYeY", "yyyyyyyyyy"];
const CROWN_FILL: Record<string, string> = { Y: "#f2c84b", y: GOLD, j: RED, e: "#2e5aa8" };

/** A short, stable id for a name on a date, so each certificate has a number. */
export function certificateId(name: string, date: string) {
  let h = 2166136261;
  for (const c of `${name}|${date}`) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const hex = (h >>> 0).toString(16).toUpperCase().padStart(8, "0");
  return `KH-${hex.slice(0, 4)}-${hex.slice(4)}`;
}

function crown(ctx: CanvasRenderingContext2D, cx: number, top: number, px: number) {
  const left = cx - (CROWN[0]!.length * px) / 2;
  CROWN.forEach((row, y) =>
    [...row].forEach((c, x) => {
      const fill = CROWN_FILL[c];
      if (!fill) return;
      ctx.fillStyle = fill;
      ctx.fillRect(left + x * px, top + y * px, px, px);
    }),
  );
}

/** Three interlaced sine waves along a straight line: the classic banknote border. */
function guilloche(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number) {
  const len = Math.hypot(x1 - x0, y1 - y0);
  const [ux, uy] = [(x1 - x0) / len, (y1 - y0) / len];
  for (let k = 0; k < 3; k++) {
    ctx.beginPath();
    for (let t = 0; t <= len; t += 2) {
      const off = 9 * Math.sin((t / 34) * Math.PI * 2 + (k * Math.PI * 2) / 3);
      const x = x0 + ux * t - uy * off;
      const y = y0 + uy * t + ux * off;
      if (t === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

/** A rosette of rotated ellipses for the border's corners. */
function rosette(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  for (let i = 0; i < 12; i++) {
    ctx.beginPath();
    ctx.ellipse(cx, cy, r, r * 0.38, (i * Math.PI) / 12, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function seal(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  // ribbon tails
  ctx.fillStyle = RED;
  for (const dir of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(cx + dir * 22, cy + 40);
    ctx.lineTo(cx + dir * 62, cy + 150);
    ctx.lineTo(cx + dir * 44, cy + 134);
    ctx.lineTo(cx + dir * 30, cy + 158);
    ctx.lineTo(cx + dir * -4, cy + 52);
    ctx.closePath();
    ctx.fill();
  }
  // serrated gold disc
  const grad = ctx.createRadialGradient(cx - 30, cy - 30, 10, cx, cy, 96);
  grad.addColorStop(0, "#fff2c4");
  grad.addColorStop(0.45, GOLD_LT);
  grad.addColorStop(1, GOLD);
  ctx.fillStyle = grad;
  ctx.beginPath();
  for (let i = 0; i < 72; i++) {
    const a = (i * Math.PI) / 36;
    const r = i % 2 ? 84 : 92;
    ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#8a6414";
  ctx.lineWidth = 2;
  for (const r of [72, 66]) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(cx, cy, 60, 0, Math.PI * 2);
  ctx.fill();
  crown(ctx, cx, cy - 34, 7);
  ctx.fillStyle = GOLD_LT;
  ctx.font = `700 26px ${SERIF}`;
  ctx.textAlign = "center";
  ctx.fillText("100%", cx, cy + 34);
}

function spaced(ctx: CanvasRenderingContext2D, px: number) {
  if ("letterSpacing" in ctx) ctx.letterSpacing = `${px}px`;
}

export function drawCertificate(
  canvas: HTMLCanvasElement,
  scale: number,
  name: string,
  text: CertificateText,
) {
  canvas.width = Math.round(CERT_W * scale);
  canvas.height = Math.round(CERT_H * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  const sans =
    getComputedStyle(document.documentElement).getPropertyValue("--font-geist-sans").trim() ||
    "system-ui, sans-serif";
  const W = CERT_W;
  const H = CERT_H;
  const cx = W / 2;

  // paper with a soft warm vignette
  const paper = ctx.createRadialGradient(cx, H / 2, 200, cx, H / 2, W * 0.7);
  paper.addColorStop(0, PAPER);
  paper.addColorStop(1, "#f1e7d0");
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, W, H);

  // border: navy rule, guilloché band, rosettes, fine gold rule
  ctx.strokeStyle = INK;
  ctx.lineWidth = 6;
  ctx.strokeRect(36, 36, W - 72, H - 72);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 1.4;
  const b = 72;
  guilloche(ctx, b + 40, b, W - b - 40, b);
  guilloche(ctx, b + 40, H - b, W - b - 40, H - b);
  guilloche(ctx, b, b + 40, b, H - b - 40);
  guilloche(ctx, W - b, b + 40, W - b, H - b - 40);
  for (const [x, y] of [
    [b, b],
    [W - b, b],
    [b, H - b],
    [W - b, H - b],
  ] as const)
    rosette(ctx, x, y, 30);
  ctx.lineWidth = 2;
  ctx.strokeRect(108, 108, W - 216, H - 216);

  // a faint crown watermark behind the text
  ctx.globalAlpha = 0.05;
  crown(ctx, cx, 360, 56);
  ctx.globalAlpha = 1;

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  // brand with ornaments
  ctx.font = `600 22px ${sans}`;
  ctx.fillStyle = MUTED;
  spaced(ctx, 8);
  ctx.fillText(text.brand, cx, 200);
  const brandW = ctx.measureText(text.brand).width;
  spaced(ctx, 0);
  ctx.fillStyle = GOLD;
  for (const dir of [-1, 1]) {
    const x = cx + dir * (brandW / 2 + 40);
    ctx.fillRect(dir < 0 ? x - 120 : x, 192, 120, 2);
    ctx.save();
    ctx.translate(x, 193);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-5, -5, 10, 10);
    ctx.restore();
  }

  ctx.font = `italic 400 104px ${SERIF}`;
  ctx.fillStyle = INK;
  ctx.fillText(text.title, cx, 330, W - 320);

  ctx.font = `700 26px ${sans}`;
  ctx.fillStyle = RED;
  spaced(ctx, 12);
  ctx.fillText(text.kicker, cx, 392);
  spaced(ctx, 0);

  ctx.font = `400 30px ${sans}`;
  ctx.fillStyle = MUTED;
  ctx.fillText(text.lead, cx, 490);

  ctx.font = `italic 700 96px ${SERIF}`;
  ctx.fillStyle = INK;
  ctx.fillText(name, cx, 610, W - 360);
  const nameW = Math.min(ctx.measureText(name).width, W - 360) + 140;
  ctx.fillStyle = GOLD;
  ctx.fillRect(cx - nameW / 2, 646, nameW, 2);
  ctx.save();
  ctx.translate(cx, 647);
  ctx.rotate(Math.PI / 4);
  ctx.fillRect(-7, -7, 14, 14);
  ctx.restore();

  ctx.font = `400 32px ${sans}`;
  ctx.fillStyle = INK;
  ctx.fillText(text.body, cx, 730, W - 320);
  ctx.fillText(text.body2, cx, 778, W - 320);

  seal(ctx, cx, 940);

  // date (left) and signature (right)
  const col = 420;
  ctx.fillStyle = INK;
  ctx.font = `500 32px ${sans}`;
  ctx.fillText(text.date, col, 950);
  ctx.fillRect(col - 170, 972, 340, 2);
  ctx.font = `400 22px ${sans}`;
  ctx.fillStyle = MUTED;
  spaced(ctx, 3);
  ctx.fillText(text.dateLabel.toUpperCase(), col, 1008);
  spaced(ctx, 0);

  ctx.font = `italic 400 58px ${SERIF}`;
  ctx.fillStyle = "#23306b";
  ctx.fillText(text.sign, W - col, 950);
  ctx.fillStyle = INK;
  ctx.fillRect(W - col - 170, 972, 340, 2);
  ctx.font = `400 22px ${sans}`;
  ctx.fillStyle = MUTED;
  ctx.fillText(text.role, W - col, 1008);

  ctx.font = `400 18px ${sans}`;
  ctx.fillStyle = MUTED;
  spaced(ctx, 2);
  ctx.fillText(text.id, cx, H - 128);
  spaced(ctx, 0);
}

/** Draws the certificate large and saves it as a one-page PDF. */
export async function downloadCertificatePdf(name: string, text: CertificateText, file: string) {
  const canvas = document.createElement("canvas");
  drawCertificate(canvas, 1.5, name, text);
  const blob = await new Promise<Blob | null>((done) => canvas.toBlob(done, "image/jpeg", 0.92));
  if (!blob) return;
  const pdf = jpegToPdf(new Uint8Array(await blob.arrayBuffer()), canvas.width, canvas.height);
  const url = URL.createObjectURL(new Blob([pdf], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${file}.pdf`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
