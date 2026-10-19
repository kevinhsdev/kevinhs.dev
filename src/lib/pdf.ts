/**
 * The smallest PDF that holds one JPEG on one page (A4 landscape by default):
 * catalog, pages, page, image XObject and a content stream that draws it.
 * Enough for the legend certificate without a PDF library.
 */
export function jpegToPdf(
  jpeg: Uint8Array,
  width: number,
  height: number,
  page: [number, number] = [841.89, 595.28],
) {
  const [W, H] = page;
  const encoder = new TextEncoder();
  const parts: Uint8Array[] = [];
  const offsets: number[] = [];
  let length = 0;
  const push = (data: string | Uint8Array) => {
    const bytes = typeof data === "string" ? encoder.encode(data) : data;
    parts.push(bytes);
    length += bytes.length;
  };
  const obj = (n: number, ...body: (string | Uint8Array)[]) => {
    offsets[n] = length;
    push(`${n} 0 obj\n`);
    body.forEach(push);
    push("\nendobj\n");
  };
  const draw = `q ${W} 0 0 ${H} 0 0 cm /Im0 Do Q`;

  push("%PDF-1.4\n");
  obj(1, "<< /Type /Catalog /Pages 2 0 R >>");
  obj(2, "<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  obj(
    3,
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`,
  );
  obj(
    4,
    `<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`,
    jpeg,
    "\nendstream",
  );
  obj(5, `<< /Length ${draw.length} >>\nstream\n${draw}\nendstream`);
  const xref = length;
  push(
    `xref\n0 6\n0000000000 65535 f \n${offsets
      .slice(1)
      .map((o) => `${String(o).padStart(10, "0")} 00000 n \n`)
      .join("")}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`,
  );

  const out = new Uint8Array(length);
  let at = 0;
  for (const part of parts) {
    out.set(part, at);
    at += part.length;
  }
  return out;
}
