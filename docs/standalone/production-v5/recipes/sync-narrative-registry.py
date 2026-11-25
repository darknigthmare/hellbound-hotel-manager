"""Link accepted narrative exports, without importing a production manifest at runtime.

Run from any directory after appending visually accepted outputs to a production
ledger. The default root is inferred from the final V5 recipes location;
--root and --source-dir support another checkout/source archive. --all-reviewed-ledgers reads the eight explicitly named reviewed batches,
including the three continuation batches. --dry-run checks files and dimensions
without changing the TypeScript registry. Existing accepted entries are retained.
"""
import argparse
import json
import pathlib
import re
import subprocess

from PIL import Image

HERE = pathlib.Path(__file__).resolve().parent
DEFAULT_ROOT = HERE.parents[3]
REVIEWED_LEDGER_NAMES = (
    'generated-assets.json',
    'personal-generated-assets.json',
    'review-personal-generated-assets.json',
    'root-personal-generated-assets.json',
    'bible-personal-generated-assets.json',
    'continuation-generated-assets.json',
    'audit-continuation-generated-assets.json',
    'runtime-continuation-generated-assets.json',
)
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--root', type=pathlib.Path, default=DEFAULT_ROOT)
parser.add_argument('--source-dir', type=pathlib.Path)
manifest_options = parser.add_mutually_exclusive_group()
manifest_options.add_argument('--manifest', type=pathlib.Path, action='append', help='Repeat to merge separate accepted-output ledgers; defaults to generated-assets.json.')
manifest_options.add_argument('--all-reviewed-ledgers', action='store_true', help='Read all eight explicitly named initial and continuation ledgers; missing ledgers are errors.')
parser.add_argument('--dry-run', action='store_true')
args = parser.parse_args()
ROOT = args.root.resolve()
SOURCE = (args.source_dir or ROOT / 'docs/standalone/production-v5/source-ledgers').resolve()
REGISTRY = ROOT / 'src/standalone/campaign-illustrations-v4.ts'

audit = json.loads((SOURCE / 'narrative-audit.json').read_text())
briefs = audit['globalCampaign']['chapters'] + audit['globalCampaign']['optionalBookends']
briefs += [b for route in audit['v3PriorityTrios'] for b in route['illustrations']]
by_id = {brief['assetId']: brief for brief in briefs}
known_fighters = {route['fighterId'] for route in audit['v3FullBacklog']}
for route in audit['v3FullBacklog']:
    for source_brief in route['sourceIllustrations']:
        beat = source_brief['kind']
        asset_id = f'v3:{route["fighterId"]}:{beat}'
        if asset_id not in by_id:
            by_id[asset_id] = {
                'assetId': asset_id, 'scope': 'personal_route', 'routeVersion': 3,
                'fighterId': route['fighterId'], 'beat': beat,
                'targetRepoPath': f'public/assets/story/infernal-versus/v3/{route["fighterId"]}-{beat}.webp',
                'altText': source_brief['title'] + ' — ' + source_brief['action'],
                'spoilerTier': route['continuity']['spoilerTier'],
                'rivalCombat': route['rivalCombat'], 'requiresStaging': True,
            }
manifest_assets = []
manifest_paths = ([SOURCE / name for name in REVIEWED_LEDGER_NAMES] if args.all_reviewed_ledgers
                  else args.manifest or [SOURCE / 'generated-assets.json'])
for path in manifest_paths:
    manifest = json.loads(path.read_text())
    if manifest.get('schemaVersion') != 1 or not isinstance(manifest.get('assets'), list):
        raise SystemExit(f'Expected schemaVersion 1 with an assets array: {path}')
    manifest_assets.extend(manifest['assets'])

# The registry only has type imports. Evaluate its transpiled data locally to
# preserve earlier accepted entries even when a batch manifest is incremental.
existing_json = subprocess.check_output([
    'node', '-e',
    "const fs=require('fs'),vm=require('vm'),ts=require('typescript');"
    "function read(path){const src=fs.readFileSync(path,'utf8');"
    "const js=ts.transpileModule(src,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;"
    "const sandbox={exports:{},require:id=>{throw Error('Unexpected runtime import '+id)}};"
    "vm.runInNewContext(js,sandbox);return sandbox.exports;}"
    "process.stdout.write(JSON.stringify({entries:read(process.argv[1]).CAMPAIGN_ILLUSTRATIONS_V4,stages:read(process.argv[2]).STANDALONE_STAGES.map(s=>s.id)}));",
    str(REGISTRY), str(ROOT / 'src/lib/pentagram-stages.ts'),
], cwd=ROOT, text=True)
existing_data = json.loads(existing_json)
entries = {entry['id']: entry for entry in existing_data['entries']}
known_stages = set(existing_data['stages'])
accepted_ids = set()
new_ids = []


def checked_path(value, prefix):
    if not isinstance(value, str):
        raise ValueError('Expected a repository-relative file path.')
    relative = pathlib.PurePosixPath(value)
    if relative.is_absolute() or '..' in relative.parts or relative.parts[:len(prefix)] != tuple(prefix):
        raise ValueError(f'Unexpected asset path: {value}')
    absolute = ROOT.joinpath(*relative.parts)
    if not absolute.is_file():
        raise ValueError(f'Asset file is missing: {absolute}')
    return absolute


for asset in manifest_assets:
    if asset.get('status') != 'accepted':
        continue
    asset_id = asset.get('assetId', '')
    if asset_id not in by_id:
        if asset_id.startswith(('global:', 'v3:')):
            raise ValueError(f'No reviewed narrative brief for {asset_id}.')
        continue  # Characters, costumes, props and environments use other registries.
    if asset_id in accepted_ids:
        raise ValueError(f'More than one accepted output for {asset_id}.')
    accepted_ids.add(asset_id)
    brief = by_id[asset_id]
    stage_id = brief.get('stageId')
    cast = brief.get('visibleCharacterIds')
    if brief.get('requiresStaging'):
        stage_id = asset.get('stageId')
        cast = asset.get('cast')
        if brief['beat'] == 'rival':
            combat = brief['rivalCombat']
            if stage_id != combat['stageId'] or not isinstance(cast, list) or set(cast) != {combat['fighterId'], combat['opponentId']}:
                raise ValueError(f'Rival stage/cast differ from the V3 campaign for {asset_id}.')
    else:
        if asset.get('stageId', stage_id) != stage_id or asset.get('cast', cast) != cast:
            raise ValueError(f'Accepted output staging differs from the reviewed brief for {asset_id}.')
    if stage_id not in known_stages or not isinstance(cast, list) or not cast or any(fid not in known_fighters for fid in cast):
        raise ValueError(f'A real stage and known visible cast are required for {asset_id}.')
    if brief['scope'] == 'personal_route' and brief['fighterId'] not in cast:
        raise ValueError(f'The route protagonist is missing from the visible cast for {asset_id}.')
    if asset.get('spoilerTier', brief['spoilerTier']) != brief['spoilerTier']:
        raise ValueError(f'Spoiler tier differs from the V3 route for {asset_id}.')
    export_path = checked_path(asset.get('exportPath'), ['public', 'assets'])
    checked_path(asset.get('masterPath'), ['art'])
    if asset['exportPath'] != brief['targetRepoPath']:
        raise ValueError(f'Export path differs from the agreed brief for {asset_id}: {asset["exportPath"]}')
    with Image.open(export_path) as image:
        if image.format != 'WEBP':
            raise ValueError(f'Runtime narrative export is not a WebP: {export_path}')
        size = image.size
    if size != (asset.get('width'), asset.get('height')):
        raise ValueError(f'Manifest dimensions do not match {asset_id}: actual {size}.')
    entry = {
        'id': asset_id,
        'scope': 'global' if brief['scope'] == 'global_campaign' else 'personal',
        'src': '/' + str(pathlib.PurePosixPath(asset['exportPath']).relative_to('public')),
        'alt': asset.get('alt') or brief['altText'],
        'width': size[0], 'height': size[1],
        'stageId': stage_id, 'cast': cast,
        'spoilerTier': brief['spoilerTier'],
    }
    if entry['scope'] == 'global':
        entry.update(campaignId=brief['campaignId'], campaignVersion=brief['campaignVersion'],
                     sceneId=brief.get('chapterId', brief.get('beat')))
    else:
        entry.update(fighterId=brief['fighterId'], routeVersion=brief['routeVersion'], beat=brief['beat'])
    if asset_id not in entries:
        new_ids.append(asset_id)
    entries[asset_id] = entry

for entry in entries.values():
    checked_path('public' + entry['src'], ['public', 'assets'])

ordered = sorted(entries.values(), key=lambda entry: list(by_id).index(entry['id']) if entry['id'] in by_id else len(by_id))
block = ('// BEGIN APPROVED NARRATIVE ARTWORK\n'
         'export const CAMPAIGN_ILLUSTRATIONS_V4: readonly CampaignIllustration[] = '
         + json.dumps(ordered, ensure_ascii=False, indent=2)
         + ';\n// END APPROVED NARRATIVE ARTWORK')
source = REGISTRY.read_text()
updated, matches = re.subn(r'// BEGIN APPROVED NARRATIVE ARTWORK\n.*?// END APPROVED NARRATIVE ARTWORK',
                           lambda _: block, source, flags=re.DOTALL)
if matches != 1:
    raise ValueError('Expected exactly one approved-artwork block in the registry.')
if not args.dry_run and updated != source:
    temporary = REGISTRY.with_suffix('.ts.tmp')
    temporary.write_text(updated)
    temporary.replace(REGISTRY)
print(json.dumps({'dryRun': args.dry_run, 'registry': str(REGISTRY), 'acceptedNarrativeOutputsInManifest': len(accepted_ids),
                  'registeredNarrativeOutputs': len(ordered), 'personalOutputs': sum(e['scope'] == 'personal' for e in ordered),
                  'globalOutputs': sum(e['scope'] == 'global' for e in ordered),
                  'manifests': [str(path) for path in manifest_paths], 'newIds': new_ids}, ensure_ascii=False))
