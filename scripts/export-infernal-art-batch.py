#!/usr/bin/env python3
"""Copy authored masters unchanged and export pixel-exact WebP runtime assets.

Usage: python scripts/export-infernal-art-batch.py mapping.json report.json
The mapping contains source/master/runtime paths and optional thumbnail path.
This performs format conversion only; it does not redraw, remove backgrounds,
crop, alter alpha, recolor, or manufacture additional animation poses.
"""
import hashlib
import json
import shutil
import sys
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]


def describe(path):
    data = path.read_bytes()
    image = Image.open(path)
    alpha = image.getchannel('A') if image.mode == 'RGBA' else None
    return {
        'path': str(path.relative_to(ROOT)),
        'bytes': len(data),
        'sha256': hashlib.sha256(data).hexdigest(),
        'gitBlobSha': hashlib.sha1(b'blob ' + str(len(data)).encode() + b'\0' + data).hexdigest(),
        'dimensions': list(image.size),
        'mode': image.mode,
        'alphaExtrema': list(alpha.getextrema()) if alpha else None,
        'alphaBounds16': list(alpha.point(lambda value: 255 if value >= 16 else 0).getbbox()) if alpha else None,
    }


def main():
    mapping = json.loads(Path(sys.argv[1]).read_text())
    files = []
    for entry in mapping:
        runtime_status = entry.get('runtimeStatus', 'active')
        if runtime_status not in ('active', 'reserve', 'selectable_costume'):
            raise ValueError('Unexpected runtime status: ' + runtime_status)
        source = Path(entry['source'])
        master = ROOT / entry['master']
        runtime = ROOT / entry['runtime']
        master.parent.mkdir(parents=True, exist_ok=True)
        runtime.parent.mkdir(parents=True, exist_ok=True)
        if master.exists() and master.read_bytes() != source.read_bytes():
            raise ValueError('Refusing to replace a different master: ' + str(master))
        shutil.copyfile(source, master)
        image = Image.open(master)
        if image.mode not in ('RGB', 'RGBA'):
            raise ValueError('Unexpected mode: ' + image.mode)
        image.save(runtime, format='WEBP', lossless=True, exact=True, method=6)
        exported = Image.open(runtime).convert(image.mode)
        if image.size != exported.size or image.tobytes() != exported.tobytes():
            raise ValueError('Pixel mismatch in lossless export: ' + str(runtime))
        for role, path in [('master', master), ('runtime', runtime)]:
            files.append({**describe(path), 'id': entry['id'], 'group': entry['group'], 'kind': role,
                          'pixelExactToMaster': role == 'runtime', 'runtimeStatus': runtime_status,
                          'registered': role == 'runtime' and runtime_status in ('active', 'selectable_costume')})
        if entry.get('thumbnail'):
            thumbnail = ROOT / entry['thumbnail']
            thumbnail.parent.mkdir(parents=True, exist_ok=True)
            small = image.copy()
            small.thumbnail((480, 270), Image.Resampling.LANCZOS)
            small.save(thumbnail, format='WEBP', quality=92, method=6)
            files.append({**describe(thumbnail), 'id': entry['id'], 'group': entry['group'],
                          'kind': 'thumbnail', 'pixelExactToMaster': False, 'runtimeStatus': runtime_status,
                          'registered': runtime_status in ('active', 'selectable_costume')})
    report = {'masterCount': len(mapping), 'fileCount': len(files),
              'allRuntimeExportsPixelExact': True, 'files': files}
    target = ROOT / sys.argv[2]
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'masterCount': len(mapping), 'fileCount': len(files),
                      'allRuntimeExportsPixelExact': True}))


if __name__ == '__main__':
    main()
