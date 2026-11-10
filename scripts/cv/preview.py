# Page 1 of public/cv/kevin-henrique-cv-<lang>.pdf -> .webp next to it (the site's CV preview).
# Usage: python scripts/cv/preview.py pt    (needs: pip install pymupdf pillow)
import pathlib
import sys

import pymupdf

lang = sys.argv[1] if len(sys.argv) > 1 else "pt"
pdf = pathlib.Path(__file__).parents[2] / "public" / "cv" / f"kevin-henrique-cv-{lang}.pdf"
pix = pymupdf.open(pdf)[0].get_pixmap(dpi=220)
pix.pil_save(pdf.with_suffix(".webp"), format="WEBP", quality=92, method=6)
print("wrote", pdf.with_suffix(".webp"), pix.width, pix.height)
