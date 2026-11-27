#!/usr/bin/env python3
"""Archive the accessible Infernal Versus V8–V10 evidence, without runtime use.

The manifest keeps source paths for provenance and repository paths for reuse.
Run only in the original workspace: source paths are session-specific.
"""
from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
from collections import Counter
from datetime import datetime, timezone

ARCHIVE = Path(__file__).resolve().parent
REPO = ARCHIVE.parents[2]
SOURCE_ROOTS = [
    Path('/workspace/scratch/57c1b6f2d64f/generated_images'),
    Path('/workspace/scratch/57c1b6f2d64f/reference-work'),
    Path('/workspace/scratch/57c1b6f2d64f/outputs'),
    Path('/workspace/scratch/57c1b6f2d64f/drive-workbook-review'),
    Path('/workspace/scratch/b07af32d1b2c/generated_images'),
    Path('/workspace/scratch/b07af32d1b2c/outputs'),
    Path('/tmp/infernal-v9'),
    Path('/tmp/infernal-v9-reference-audit'),
    Path('/tmp/infernal-v10'),
]
PRUNE_DIRS = {'node_modules', '__pycache__', '.git', 'dist', 'dist-standalone', '.cache'}
SKIP_NAMES = {
    'github-immutable-blobs.json': 'Cache de transport GitHub ; les preuves de publication sont conservées séparément.',
    'pr-before.json': 'Réponse brute de PR déjà accessible sur GitHub ; pas un livrable.',
    'lucifer-player-response.json': 'Réponse brute du lecteur distant, cache de récupération.',
    'discovery-0.txt': 'Résultat de recherche vide, sans preuve exploitable.',
    'viv-speedpaint-playlist.json': 'Résultat de recherche vide, sans preuve exploitable.',
}
ALLOWED = {'.png', '.jpg', '.jpeg', '.webp', '.xlsx', '.json', '.ndjson', '.py', '.cjs', '.mjs', '.txt', '.log', '.md'}
SECRET_PATTERNS = [
    re.compile(r'(?:gh[pousr]_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,}|sk-proj-[A-Za-z0-9_-]{20,}|-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----)'),
    re.compile(r'''(?i)(?:Authorization\s*:\s*Bearer\s+[A-Za-z0-9._-]{15,}|(?:access_token|refresh_token|api[_-]?key)\s*["']?\s*[:=]\s*["'][^"'\s]{15,})'''),
]
REJECTED = {
    'exec-fc77321b-b291-483e-bef2-2a6c7a7ee51c.png': ('v9/bee-lounge-divider-attempt-1.png', '43 ouvertures au lieu de 38 ; remplacé.'),
    'exec-d5a014e6-5f03-47d7-9904-e7d7a0d01ef1.png': ('v9/bee-lounge-divider-attempt-2.png', '28 ouvertures au lieu de 38 ; remplacé.'),
    'exec-6e7a8c55-8b0a-4f08-8823-530dec3cc221.png': ('v9/bee-lounge-divider-attempt-3.png', '38 ouvertures mais contour inférieur au bord ; remplacé.'),
    'exec-bd2d21cc-810a-4216-b268-009e4ab41b2d.png': ('v10/loo-loo-unsupported-red-nose.png', 'Nez rouge ajouté absent des références ; remplacé.'),
    'exec-93d6d6bc-a203-4579-a527-144dc5f2ef72.png': ('v10/moxxie-unsupported-tailcoat-lining.png', 'Doublure rose non soutenue par les références ; remplacé.'),
    'exec-6a4f9f81-ad02-4894-9afa-3b3ace317ebf.png': ('v10/charlie-incomplete-demon-arm.png', 'Bras démoniaque transformé absent ; remplacé.'),
}


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def git_paths(*args: str) -> set[str]:
    return set(subprocess.check_output(['git', *args, '-z'], cwd=REPO).decode().rstrip('\0').split('\0')) - {''}


def classify(path: Path, root: Path) -> tuple[Path, str, str]:
    rel = path.relative_to(root)
    if path.name in REJECTED:
        dest, why = REJECTED[path.name]
        return Path('rejected-candidates') / dest, 'rejected_candidate_not_for_runtime', why
    if root.name == 'generated_images':
        return Path('generated-source') / root.parent.name / rel, 'generation_source', 'Source native conservée ; aucun ajout au décompte des dessins acceptés.'
    if root.name == 'reference-work':
        return Path('research') / root.parent.name / rel, 'research_reference', 'Référence ou planche de recherche ; ne constitue pas un asset livré.'
    if root.name in {'outputs', 'drive-workbook-review'}:
        return Path('workbooks') / root.parent.name / root.name / rel, 'workbook_copy', 'Copie de classeur contrôlée par empreinte.'
    if root.name == 'infernal-v9-reference-audit':
        group = 'evidence' if path.name.startswith('review-') else 'research'
        return Path(group) / root.name / rel, 'historical_visual_evidence' if group == 'evidence' else 'research_reference', 'Source ou diagnostic historique V9 ; ne prouve pas la validation du code courant.'
    if rel.parts[0] in {'browser', 'workbook', 'independent-review', 'root'} or len(rel.parts) == 1:
        return Path('evidence') / root.name / rel, 'historical_evidence', 'Preuve, script ou diagnostic de la session conservé à titre historique.'
    return Path('research') / root.name / rel, 'research_reference', 'Recherche et provenance réutilisables pour la suite de la production.'


def main() -> None:
    tracked = git_paths('ls-files')
    changed = git_paths('diff', '--name-only', 'HEAD')
    by_hash: dict[str, list[dict]] = {}
    indexed = 0
    for folder in ['docs/standalone', 'production', 'art/infernal-versus', 'public/assets', 'src']:
        for path in sorted((REPO / folder).rglob('*')):
            if not path.is_file() or ARCHIVE in path.parents or any(p in PRUNE_DIRS for p in path.parts):
                continue
            relative = path.relative_to(REPO).as_posix()
            status = 'already_in_head' if relative in tracked and relative not in changed else 'already_in_worktree_pending_publication'
            by_hash.setdefault(digest(path), []).append({'destination': relative, 'status': status})
            indexed += 1

    records, excluded, unavailable, pruned = [], [], [], []
    for root in SOURCE_ROOTS:
        if not root.exists():
            unavailable.append({'path': str(root), 'reason': 'Dossier absent dans cette session.'})
            continue
        def onerror(error: OSError) -> None:
            unavailable.append({'path': str(error.filename), 'reason': type(error).__name__})
        for current, dirs, names in os.walk(root, onerror=onerror):
            for directory in dirs[:]:
                if directory in PRUNE_DIRS:
                    dirs.remove(directory)
                    pruned.append({'path': str(Path(current) / directory), 'reason': 'Dépendances, build ou cache reproductible.'})
            dirs.sort()
            for name in sorted(names):
                path = Path(current) / name
                if path.is_symlink():
                    excluded.append({'source': str(path), 'reason': 'Lien symbolique, aucune donnée supplémentaire copiée.'})
                    continue
                why = SKIP_NAMES.get(name)
                if path.suffix.lower() not in ALLOWED:
                    why = 'Page HTML brute ou format de cache hors livrables.'
                if why:
                    excluded.append({'source': str(path), 'reason': why})
                    continue
                content = path.read_bytes()
                if path.suffix.lower() in {'.json', '.ndjson', '.py', '.cjs', '.mjs', '.txt', '.log', '.md'}:
                    text = content.decode('utf-8', errors='replace')
                    if any(pattern.search(text) for pattern in SECRET_PATTERNS):
                        excluded.append({'source': str(path), 'reason': 'Contenu textuel sensible ou jeton de transport détecté ; fichier non copié.'})
                        continue
                sha = hashlib.sha256(content).hexdigest()
                destination, category, reason = classify(path, root)
                record = {'source': str(path), 'sourceSha256': sha, 'sourceBytes': len(content), 'category': category, 'reason': reason}
                matches = by_hash.get(sha, [])
                if matches:
                    match = sorted(matches, key=lambda m: (m['status'] != 'already_in_head', m['destination']))[0]
                    record.update(match)
                    record['allIdenticalRepositoryPaths'] = sorted(m['destination'] for m in matches)
                else:
                    target = ARCHIVE / destination
                    target.parent.mkdir(parents=True, exist_ok=True)
                    if target.exists() and digest(target) != sha:
                        raise RuntimeError(f'Conflicting recovery path: {target}')
                    if not target.exists():
                        if path.suffix.lower() in {'.png', '.jpg', '.jpeg', '.webp', '.xlsx'} and path.stat().st_dev == ARCHIVE.stat().st_dev:
                            # Immutable source images can share blocks inside this
                            # workspace; publication still reads their full bytes.
                            os.link(path, target)
                        else:
                            partial = target.with_name(target.name + '.partial')
                            try:
                                shutil.copyfile(path, partial)
                                partial.replace(target)
                            finally:
                                if partial.exists():
                                    partial.unlink()
                    relative = target.relative_to(REPO).as_posix()
                    record.update({'destination': relative, 'status': 'copied_to_recovery'})
                    record['workspaceStorage'] = 'hardlink_to_immutable_source' if target.stat().st_dev == path.stat().st_dev and target.stat().st_ino == path.stat().st_ino else 'independent_copy'
                    by_hash[sha] = [{'destination': relative, 'status': 'deduplicated_in_recovery'}]
                records.append(record)

    checks = []
    for record in records:
        target = REPO / record['destination']
        checks.append(digest(target) == record['sourceSha256'] and target.stat().st_size == record['sourceBytes'])
    if not all(checks):
        raise RuntimeError('At least one archive destination failed the hash check.')
    statuses = Counter(r['status'] for r in records)
    copied = [r for r in records if r['status'] == 'copied_to_recovery']
    manifest = {
        'schemaVersion': 1,
        'createdAt': datetime.now(timezone.utc).isoformat(),
        'repository': 'darknigthmare/hellbound-hotel-manager',
        'localBaselineCommit': subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=REPO).decode().strip(),
        'purpose': 'Récupération dédupliquée des productions et preuves locales accessibles V8–V10.',
        'runtimeIntegration': False,
        'currentReleaseValidationClaimed': False,
        'sourceRoots': [str(p) for p in SOURCE_ROOTS],
        'summary': {
            'indexedRepositoryFiles': indexed,
            'consideredSourceFiles': len(records) + len(excluded),
            'manifestEntries': len(records),
            'statusCounts': dict(statuses),
            'copiedPayloadFiles': len(copied),
            'copiedPayloadBytes': sum(r['sourceBytes'] for r in copied),
            'copiedRejectedCandidates': sum(r['category'] == 'rejected_candidate_not_for_runtime' for r in copied),
            'excludedFiles': len(excluded),
            'prunedDirectories': len(pruned),
            'unavailablePaths': len(unavailable),
            'verifiedDestinations': len(checks),
            'allDestinationHashesMatch': all(checks),
        },
        'limitations': [
            'Périmètre limité aux dossiers accessibles listés ; les sessions disparues et stockages distants ne sont pas audités ici.',
            'Les captures et rapports sont historiques et peuvent documenter une tentative en échec ; leur copie ne vaut pas validation de la version courante.',
            'Les candidats rejetés restent exclus des catalogues et des décomptes de dessins acceptés.',
            'Les chemins sources absolus sont de la provenance ; utiliser les destinations relatives au dépôt après clonage.',
            'Les doublons déjà présents dans le worktree V10 nécessitent sa publication par le responsable de la livraison.',
        ],
        'entries': records,
        'excluded': excluded,
        'prunedDirectories': pruned,
        'unavailable': unavailable,
    }
    (ARCHIVE / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(manifest['summary'], ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
