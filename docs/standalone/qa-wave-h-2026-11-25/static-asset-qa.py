"""Read-only alpha/hash checks and labelled overview; not a game capture.

The PNG masters are never changed. Resizing below is only for this QA sheet.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import hashlib
import json

OUT = Path(__file__).resolve().parent
ROOT = OUT.parents[2]
PROD = ROOT / 'art/infernal-versus/production'
manifest = json.loads((PROD / 'export-wave-h-2026-11-25.json').read_text())
font_path = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
fonts = {n: ImageFont.truetype(font_path, n) for n in (12, 16, 20)}
canvas = Image.new('RGB', (1200, 1010), '#17131b')
draw = ImageDraw.Draw(canvas)
draw.text((18, 12), 'VAGUE H — 10 DESSINS STATIQUES / PLANCHE DE CONTROLE', font=fonts[20], fill='white')
draw.text((18, 42), '4 bases en reserve, 2 fonds et 4 accessoires. Pas de capture du jeu.', font=fonts[12], fill='#d7c4d8')
results = []

def source(ident):
    master = next(f for f in manifest['files'] if f['id'] == ident and f['kind'] == 'master')
    runtime = next(f for f in manifest['files'] if f['id'] == ident and f['kind'] == 'runtime')
    m = Image.open(ROOT / master['path']).convert('RGBA')
    r = Image.open(ROOT / runtime['path']).convert('RGBA')
    record = {'id': ident, 'master': master['path'], 'export': runtime['path'],
              'masterHashMatches': hashlib.sha256((ROOT / master['path']).read_bytes()).hexdigest() == master['sha256'],
              'exportHashMatches': hashlib.sha256((ROOT / runtime['path']).read_bytes()).hexdigest() == runtime['sha256'],
              'pixelExact': m.size == r.size and m.tobytes() == r.tobytes(),
              'dimensions': list(m.size)}
    if master['mode'] == 'RGBA':
        alpha = m.getchannel('A')
        w, h = m.size
        edges = list(alpha.crop((0, 0, w, 1)).tobytes()) + list(alpha.crop((0, h-1, w, h)).tobytes())
        edges += list(alpha.crop((0, 0, 1, h)).tobytes()) + list(alpha.crop((w-1, 0, w, h)).tobytes())
        record.update({'alphaExtrema': list(alpha.getextrema()), 'alphaBounds16': alpha.point(lambda a: 255 if a >= 16 else 0).getbbox(),
                       'maxEdgeAlpha': max(edges), 'edgePixelsAbove16': sum(a > 16 for a in edges)})
    results.append(record)
    return m

def paste_scaled(im, box):
    x, y, w, h = box
    im.thumbnail((w, h), Image.Resampling.LANCZOS)
    canvas.paste(im, (x + (w-im.width)//2, y + (h-im.height)//2), im)

for i, (ident, label) in enumerate([('hb_paimon', 'Paimon'), ('hb_cash_buckzo', 'Cash Buckzo'), ('hb_joe', 'Joe'), ('hb_lin', 'Lin')]):
    x = 12 + i*298
    draw.rounded_rectangle((x, 72, x+286, 374), radius=8, fill='#eee7ed')
    draw.text((x+12, 82), label + ' — reserve', font=fonts[16], fill='#421a35')
    paste_scaled(source(ident+'-ready'), (x+10, 112, 266, 250))

for i, (ident, label) in enumerate([('ghost-hotel', 'One Star Wonder — Couloir'), ('apology-party', 'Apology Tour — Salle de fete')]):
    x = 12 + i*598
    draw.text((x+4, 392), label, font=fonts[16], fill='#f0ce91')
    paste_scaled(source(ident+'-room'), (x, 420, 584, 329))

for i, (ident, label) in enumerate([('ghost-hotel-middle', 'Chariot de linge'), ('ghost-hotel-near', 'Applique'), ('apology-party-middle', 'Neon fantome'), ('apology-party-near', 'Boule a facettes')]):
    x = 12 + i*298
    draw.rounded_rectangle((x, 768, x+286, 985), radius=8, fill='#302838')
    draw.text((x+12, 778), label, font=fonts[16], fill='white')
    paste_scaled(source(ident), (x+10, 807, 266, 168))

assert len(results) == 10
assert all(r['masterHashMatches'] and r['exportHashMatches'] and r['pixelExact'] for r in results)
assert all(r.get('edgePixelsAbove16', 0) == 0 for r in results)
canvas.save(OUT / 'static-asset-overview.png')
report = {'batchId': 'wave-h-2026-11-25', 'scope': 'Read-only exported-image checks and diagnostic composition.',
          'browserCapture': False, 'sourcePixelsModified': False, 'checkedArtworks': 10,
          'pixelExactExports': 10, 'rgbaCutouts': 8, 'cutoutsWithoutClippedAlpha16': 8,
          'fidelityOneToOneCertified': False, 'assets': results}
(OUT / 'static-asset-measurements.json').write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n')
print(json.dumps({k:v for k,v in report.items() if k != 'assets'}, ensure_ascii=False))
