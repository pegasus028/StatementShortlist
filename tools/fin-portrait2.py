"""Re-crop with zoom and optional white-balance to a neutral grey backdrop.
python3 tools/fin-portrait2.py <raw> <out.jpg> <zoom> <topfrac> [neutral] [desat]
zoom > 1 crops tighter; topfrac = where the crop starts as a fraction of the free height; neutral: scale channels so the
backdrop corners become neutral grey ~135; desat: reduce saturation by this fraction."""
import sys, io
import numpy as np
from PIL import Image, ImageEnhance
src, out, zoom, top = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4])
neutral = len(sys.argv) > 5 and sys.argv[5] == '1'; desat = float(sys.argv[6]) if len(sys.argv) > 6 else 0
im = Image.open(src).convert('RGB'); w, h = im.size
tw = int(min(w, h * 4 / 5) / zoom); th = int(tw * 5 / 4)
x = (w - tw) // 2; y = int((h - th) * top)
im = im.crop((x, y, x + tw, y + th)).resize((600, 750), Image.LANCZOS)
if neutral:
    a = np.asarray(im).astype(float)
    c = np.concatenate([a[:60, :60].reshape(-1, 3), a[:60, -60:].reshape(-1, 3), a[60:200, :25].reshape(-1, 3), a[60:200, -25:].reshape(-1, 3)])
    m = c.mean(axis=0); a = a * (135.0 / m); im = Image.fromarray(np.clip(a, 0, 255).astype('uint8'))
if desat: im = ImageEnhance.Color(im).enhance(1 - desat)
for q in range(88, 40, -4):
    b = io.BytesIO(); im.save(b, 'JPEG', quality=q, optimize=True, progressive=True)
    if b.tell() <= 60000: break
open(out, 'wb').write(b.getvalue()); print(out, b.tell() // 1024, 'KB')
