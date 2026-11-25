"""Persist reviewed image-generation attempts and reproduce lossless exports.

Portable V5 recipe: default location docs/standalone/production-v5/recipes.
The original generation is stochastic; this script does not regenerate artwork.
--dry-run and verify only read files and never create locks or directories.
"""
import argparse
import fcntl
import hashlib
import json
import pathlib
import shutil
from datetime import datetime, timezone

from PIL import Image

HERE = pathlib.Path(__file__).resolve().parent
DEFAULT_ROOT = HERE.parents[3]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--root', type=pathlib.Path, default=DEFAULT_ROOT)
parser.add_argument('--source-dir', type=pathlib.Path)
parser.add_argument('--dry-run', action='store_true')
parser.add_argument('--queue', type=pathlib.Path, default=None)
parser.add_argument('--records', type=pathlib.Path, default=None)
parser.add_argument('--ledger', type=pathlib.Path, default=None)
parser.add_argument('action', choices=['start', 'export', 'accept', 'failure', 'reject', 'verify'])
parser.add_argument('asset_id')
parser.add_argument('extra', nargs='*')
args = parser.parse_args()
ROOT = args.root.resolve()
SOURCE = (args.source_dir or ROOT / 'docs/standalone/production-v5/source-ledgers').resolve()
args.queue = args.queue or SOURCE / 'personal-generation-queue.json'
args.records = args.records or SOURCE / 'personal-generation-records.json'
args.ledger = args.ledger or SOURCE / 'personal-generated-assets.json'
queue_data = json.loads(args.queue.read_text())
QUEUE = queue_data['jobs'] if isinstance(queue_data, dict) else queue_data
JOBS = {}
for source_job in QUEUE:
    job = dict(source_job)
    job.setdefault('prompt', job.get('generationPrompt'))
    job.setdefault('referencedImagePaths', job.get('refs'))
    job.setdefault('targetRepoPath', job.get('exportPath'))
    job.setdefault('visibleCharacterIds', job.get('cast'))
    job.setdefault('altText', job.get('alt'))
    job.setdefault('title', job.get('name', job['assetId']))
    job.setdefault('sourceIds', [])
    if not job.get('masterPath'):
        job['masterPath'] = job['targetRepoPath'].replace('public/assets/story/', 'art/infernal-versus/masters/story/').replace('.webp', '.png')
    JOBS[job['assetId']] = job
RECORDS = args.records.resolve()
MANIFEST = args.ledger.resolve()


def now():
    return datetime.now(timezone.utc).isoformat()


def write_json(path, data):
    temporary = path.with_suffix('.json.tmp')
    temporary.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    temporary.replace(path)


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


action, asset_id, extra = args.action, args.asset_id, args.extra
job = JOBS[asset_id]
def repository_path(value):
    relative = pathlib.PurePosixPath(value)
    if relative.is_absolute() or '..' in relative.parts:
        raise ValueError(f'Expected repository-relative output path: {value}')
    resolved = (ROOT / relative).resolve()
    if not resolved.is_relative_to(ROOT):
        raise ValueError(f'Output escapes repository: {value}')
    return resolved

# Check even when replaying writes; a source ledger cannot redirect an export.
repository_path(job['masterPath'])
repository_path(job['targetRepoPath'])
if args.dry_run or action == 'verify':
    report = {'dryRun': True, 'action': action, 'assetId': asset_id,
              'root': str(ROOT), 'sourceDirectory': str(SOURCE), 'mutations': False}
    if action == 'verify':
        manifest = json.loads(MANIFEST.read_text())
        matches = [row for row in manifest['assets'] if row['assetId'] == asset_id and row['status'] == 'accepted']
        if len(matches) != 1:
            raise ValueError(f'Expected one accepted ledger entry for {asset_id}')
        accepted = matches[0]
        master = repository_path(accepted['masterPath'])
        export = repository_path(accepted['exportPath'])
        if digest(master) != accepted['masterSha256'] or digest(export) != accepted['exportSha256']:
            raise ValueError('Master/export checksum differs from accepted ledger')
        with Image.open(master) as original, Image.open(export) as encoded:
            if original.format != 'PNG' or encoded.format != 'WEBP':
                raise ValueError('Expected a PNG master and WebP export')
            expected = (accepted['width'], accepted['height'])
            if original.size != encoded.size or original.size != expected:
                raise ValueError('Image dimensions differ from accepted ledger')
            rgba = original.convert('RGBA')
            if rgba.tobytes() != encoded.convert('RGBA').tobytes():
                raise ValueError('Decoded WebP pixels differ from original master')
            if rgba.getextrema()[3] != (255, 255):
                raise ValueError('Narrative image is not opaque')
        report.update(status='verified', width=expected[0], height=expected[1],
                      pixelExactExport=True, masterSha256=digest(master), exportSha256=digest(export))
    elif action == 'export':
        if not extra:
            raise ValueError('export requires an original PNG path')
        source = pathlib.Path(extra[0])
        if not source.is_absolute(): source = ROOT / source
        with Image.open(source) as original:
            if original.format != 'PNG': raise ValueError('Original source is not a PNG')
            report.update(source=str(source), width=original.width, height=original.height,
                          opaque=original.convert('RGBA').getextrema()[3] == (255, 255))
        report['existingOutputs'] = [str(path) for path in [repository_path(job['masterPath']), repository_path(job['targetRepoPath'])] if path.exists()]
        report['wouldRefuseOverwrite'] = bool(report['existingOutputs'])
    else:
        report.update(status='preflight_only', queue=str(args.queue), records=str(RECORDS), ledger=str(MANIFEST))
    print(json.dumps(report, ensure_ascii=False))
    raise SystemExit(0)

MANIFEST.parent.mkdir(parents=True, exist_ok=True)
RECORDS.parent.mkdir(parents=True, exist_ok=True)
with MANIFEST.with_suffix('.lock').open('a') as lock:
    fcntl.flock(lock.fileno(), fcntl.LOCK_EX)
    records = json.loads(RECORDS.read_text()) if RECORDS.exists() else {'schemaVersion': 1, 'tool': 'image_gen__imagegen', 'requestedCount': len(QUEUE), 'attempts': []}
    records['requestedCount'] = len(QUEUE)
    attempts = [x for x in records['attempts'] if x['assetId'] == asset_id]
    if action == 'start':
        attempt = {
            'attemptId': f'{asset_id}:attempt-{len(attempts) + 1:02d}',
            'assetId': asset_id, 'id': asset_id, 'category': 'story',
            'tool': 'image_gen__imagegen', 'startedAt': now(), 'status': 'started',
            'prompt': job['prompt'], 'refs': job['referencedImagePaths'],
            'targetRepoPath': job['targetRepoPath'], 'targetMasterPath': job['masterPath'],
        }
        records['attempts'].append(attempt)
    else:
        if not attempts:
            raise ValueError(f'No started attempt for {asset_id}')
        attempt = attempts[-1]
        if action == 'export':
            source = pathlib.Path(extra[0])
            if not source.is_absolute(): source = ROOT / source
            if source.suffix.lower() != '.png' or not source.is_file():
                raise ValueError(f'Original generated PNG missing: {source}')
            master = ROOT / job['masterPath']
            export = ROOT / job['targetRepoPath']
            if master.exists() or export.exists():
                raise ValueError(f'Refusing to overwrite an existing output for {asset_id}. Record a sibling revision explicitly.')
            master.parent.mkdir(parents=True, exist_ok=True)
            export.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, master)
            with Image.open(master) as image:
                if image.format != 'PNG':
                    raise ValueError('The original is not a PNG.')
                width, height = image.size
                rgba = image.convert('RGBA')
                opaque = rgba.getextrema()[3] == (255, 255)
                image.save(export, format='WEBP', lossless=True, quality=100, method=4, exact=True)
                with Image.open(export) as reopened:
                    pixel_exact = reopened.convert('RGBA').tobytes() == rgba.tobytes()
            if not pixel_exact:
                raise ValueError('Lossless export did not preserve decoded RGBA pixels.')
            attempt.update({
                'sourcePath': str(source), 'masterPath': str(master.relative_to(ROOT)),
                'exportPath': str(export.relative_to(ROOT)), 'width': width, 'height': height,
                'opaque': opaque, 'pixelExactExport': pixel_exact,
                'hashes': {'originalPngSha256': digest(source), 'masterSha256': digest(master), 'exportSha256': digest(export)},
                'masterSha256': digest(master), 'exportSha256': digest(export),
                'masterBytes': master.stat().st_size, 'exportBytes': export.stat().st_size,
                'generatedAt': now(), 'status': 'generated_pending_visual_review',
            })
        elif action == 'accept':
            if attempt['status'] != 'generated_pending_visual_review':
                raise ValueError('Only a saved, decoded and visually reviewed output can be accepted.')
            if not attempt['opaque']:
                raise ValueError('Narrative scene must be opaque.')
            attempt.update(status='accepted', reviewedAt=now(), visualReviewNotes=extra[0], fidelityOneToOneCertified=False)
            manifest = json.loads(MANIFEST.read_text()) if MANIFEST.exists() else {'schemaVersion': 1, 'assets': []}
            asset = {key: value for key, value in attempt.items() if key not in {'startedAt', 'targetRepoPath', 'targetMasterPath'}}
            asset.update(name=job['title'], scope='simulation_au', sourceIds=job['sourceIds'], routeVersion=3, fighterId=job['fighterId'], beat=job['beat'], stageId=job['stageId'], cast=job['visibleCharacterIds'], spoilerTier=job['spoilerTier'], alt=job['altText'])
            manifest['assets'] = [x for x in manifest['assets'] if x['assetId'] != asset_id] + [asset]
            write_json(MANIFEST, manifest)
        elif action in {'failure', 'reject'}:
            attempt.update(status='failed' if action == 'failure' else 'rejected_after_visual_review', finishedAt=now(), error=extra[0])
        else:
            raise ValueError(action)
    write_json(RECORDS, records)
    print(json.dumps({k: attempt[k] for k in ['assetId', 'attemptId', 'status', 'sourcePath', 'masterPath', 'exportPath', 'width', 'height', 'opaque', 'pixelExactExport'] if k in attempt}, ensure_ascii=False))
