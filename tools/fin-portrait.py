"""Crop a Gemini 3:4 portrait to 4:5 (centred horizontally, keep the head: crop from 8 % below the top) and save
600 x 750 JPEG in 30-60 KB.  python3 tools/fin-portrait.py <in> <out.jpg>"""
import sys, io
from PIL import Image
im = Image.open(sys.argv[1]).convert('RGB'); w, h = im.size
tw, th = (w, int(w * 5 / 4)) if w * 5 / 4 <= h else (int(h * 4 / 5), h)
x = (w - tw) // 2; y = min(max(0, int((h - th) * 0.35)), h - th)
im = im.crop((x, y, x + tw, y + th)).resize((600, 750), Image.LANCZOS)
for q in range(88, 40, -4):
    b = io.BytesIO(); im.save(b, 'JPEG', quality=q, optimize=True, progressive=True)
    if b.tell() <= 60000: break
open(sys.argv[2], 'wb').write(b.getvalue()); print(sys.argv[2], b.tell() // 1024, 'KB q', q)
