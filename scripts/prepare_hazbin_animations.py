"""Prepare and atomically publish Hazbin's supplementary animation banks.

The 25 base atlases remain the identity and row-order authority. ImageGen
masters live on a flat chroma plate; this deterministic pass keys, recentres,
validates and publishes their 75 transparent 6x4 derivatives as one release.
No portraits are extracted from supplementary animation banks.
"""

from __future__ import annotations

import argparse
from dataclasses import dataclass
import json
from pathlib import Path
import shutil
from typing import Iterable

from PIL import Image

try:
    from .build_sprite_assets import (
        COLUMNS,
        EXPECTED_SHEET_SIZE,
        HAZBIN_EXPANSION_ATLASES,
        HAZBIN_SHEETS,
        MIN_CELL_ALPHA_MARGIN,
        MIN_CELL_ALPHA_RATIO,
        ROOT,
        ROWS,
        validate_sheet,
    )
    from .prepare_hazbin_expansion import prepare_atlas
except ImportError:
    from build_sprite_assets import (
        COLUMNS,
        EXPECTED_SHEET_SIZE,
        HAZBIN_EXPANSION_ATLASES,
        HAZBIN_SHEETS,
        MIN_CELL_ALPHA_MARGIN,
        MIN_CELL_ALPHA_RATIO,
        ROOT,
        ROWS,
        validate_sheet,
    )
    from prepare_hazbin_expansion import prepare_atlas


MANIFEST_PATH = (
    ROOT / "art" / "sprite-sheets" / "hazbin-animation-banks-manifest.json"
)
MASTER_ROOT = (
    ROOT / "art" / "sprite-sheets" / "chroma" / "hazbin-animation"
)
PUBLIC_RELEASE_ROOT = (
    ROOT / "public" / "assets" / "sprites" / "hazbin" / "animation" / "v1"
)
STAGING_ROOT = PUBLIC_RELEASE_ROOT.parent / ".v1.tmp"
BACKUP_ROOT = PUBLIC_RELEASE_ROOT.parent / ".v1.backup"
BANK_IDS = ("movement", "offense", "reaction")
ANIMATION_CONTRACT_ID = "four-bank-combat-v3"
REACTION_MIN_CELL_ALPHA_RATIO = 0.04


@dataclass(frozen=True)
class AnimationAtlas:
    """One base atlas and its authoritative four-character row order."""

    stem: str
    base_sheet: str
    rows: tuple[str, ...]


@dataclass(frozen=True)
class AnimationJob:
    """One of the 75 generated atlas transformations."""

    atlas: AnimationAtlas
    bank: str

    @property
    def filename(self) -> str:
        return f"{self.atlas.stem}-{self.bank}.png"

    @property
    def master_path(self) -> Path:
        return MASTER_ROOT / self.bank / f"{self.atlas.stem}-{self.bank}-chroma.png"

    def output_path(self, root: Path = PUBLIC_RELEASE_ROOT) -> Path:
        return root / self.bank / self.filename


def expected_base_atlases() -> tuple[AnimationAtlas, ...]:
    """Build the 25 canonical row maps from the existing extraction sources."""

    historical = tuple(
        AnimationAtlas(
            stem=Path(filename).stem,
            base_sheet=f"/assets/sprites/sheets/{filename}",
            rows=tuple(character_ids),
        )
        for filename, character_ids in HAZBIN_SHEETS
    )
    expanded = tuple(
        AnimationAtlas(
            stem=Path(atlas.filename).stem,
            base_sheet=f"/assets/sprites/hazbin/sheets/{atlas.filename}",
            rows=atlas.character_ids,
        )
        for atlas in HAZBIN_EXPANSION_ATLASES
    )
    return historical + expanded


def load_animation_manifest() -> tuple[AnimationAtlas, ...]:
    """Validate the JSON art contract against the live Hazbin row registry."""

    try:
        manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise ValueError(f"Cannot read {MANIFEST_PATH.name}: {error}") from error

    if manifest.get("schemaVersion") != 1:
        raise ValueError("Hazbin animation manifest schemaVersion must be 1")
    if manifest.get("animationContractId") != ANIMATION_CONTRACT_ID:
        raise ValueError("Hazbin animation manifest has the wrong animation contract")
    if manifest.get("atomic") is not True:
        raise ValueError("Hazbin animation banks must publish atomically")

    expected_canvas = {
        "width": EXPECTED_SHEET_SIZE[0],
        "height": EXPECTED_SHEET_SIZE[1],
        "columns": COLUMNS,
        "rows": ROWS,
        "cellWidth": EXPECTED_SHEET_SIZE[0] // COLUMNS,
        "cellHeight": EXPECTED_SHEET_SIZE[1] // ROWS,
        "minimumAlphaMargin": MIN_CELL_ALPHA_MARGIN,
    }
    if manifest.get("canvas") != expected_canvas:
        raise ValueError("Hazbin animation canvas contract is out of sync")

    banks = manifest.get("banks")
    if not isinstance(banks, list):
        raise ValueError("Hazbin animation manifest banks must be a list")
    bank_ids = tuple(bank.get("id") for bank in banks if isinstance(bank, dict))
    if bank_ids != BANK_IDS:
        raise ValueError(
            f"Hazbin animation banks must be ordered {BANK_IDS}, got {bank_ids}"
        )
    for bank in banks:
        roles = bank.get("columnRoles")
        if (
            not isinstance(roles, list)
            or len(roles) != COLUMNS
            or len(set(roles)) != COLUMNS
            or not all(isinstance(role, str) and role for role in roles)
        ):
            raise ValueError(
                f"Hazbin animation bank {bank.get('id')!r} needs six unique roles"
            )

    try:
        configured = tuple(
            AnimationAtlas(
                stem=entry["stem"],
                base_sheet=entry["baseSheet"],
                rows=tuple(entry["rows"]),
            )
            for entry in manifest["baseAtlases"]
        )
    except (KeyError, TypeError) as error:
        raise ValueError("Hazbin animation manifest atlas schema is invalid") from error

    expected = expected_base_atlases()
    if configured != expected:
        raise ValueError(
            "Hazbin animation manifest baseAtlases are out of sync with "
            "HAZBIN_SHEETS + HAZBIN_EXPANSION_ATLASES"
        )

    stems = [atlas.stem for atlas in configured]
    character_ids = [character_id for atlas in configured for character_id in atlas.rows]
    if len(configured) != 25 or len(set(stems)) != 25:
        raise ValueError("Hazbin animation manifest must contain 25 unique base atlases")
    if len(character_ids) != 100 or len(set(character_ids)) != 100:
        raise ValueError("Hazbin animation manifest must map 100 unique characters")
    if any(len(atlas.rows) != ROWS for atlas in configured):
        raise ValueError("Every Hazbin animation atlas must inherit exactly four rows")

    return configured


def build_jobs(atlases: Iterable[AnimationAtlas]) -> tuple[AnimationJob, ...]:
    jobs = tuple(
        AnimationJob(atlas=atlas, bank=bank)
        for bank in BANK_IDS
        for atlas in atlases
    )
    output_paths = [job.output_path() for job in jobs]
    if len(jobs) != 75 or len(set(output_paths)) != 75:
        raise ValueError("Hazbin animation product must contain 75 unique atlas jobs")
    return jobs


def safe_remove_release_tree(path: Path) -> None:
    """Remove only a known sibling of the versioned public release."""

    release_parent = PUBLIC_RELEASE_ROOT.parent.resolve()
    resolved = path.resolve()
    if resolved.parent != release_parent or resolved.name not in {
        STAGING_ROOT.name,
        BACKUP_ROOT.name,
    }:
        raise ValueError(f"Refusing to remove unsafe release path: {resolved}")
    if resolved.exists():
        shutil.rmtree(resolved)


def validate_published_jobs(jobs: Iterable[AnimationJob], root: Path) -> int:
    """Reopen every output and enforce the same strict atlas contract."""

    validated = 0
    for job in jobs:
        output_path = job.output_path(root)
        if not output_path.is_file():
            raise FileNotFoundError(f"Missing prepared animation atlas: {output_path}")
        with Image.open(output_path) as source:
            if source.mode != "RGBA":
                raise ValueError(f"{output_path.name} must be RGBA, got {source.mode}")
            atlas = source.copy()
        validate_sheet(
            atlas,
            f"animation/{job.bank}/{job.filename}",
            strict_alpha_margins=True,
            minimum_cell_alpha_ratio=(
                REACTION_MIN_CELL_ALPHA_RATIO
                if job.bank == "reaction"
                else MIN_CELL_ALPHA_RATIO
            ),
        )
        validated += 1
    return validated


def publish_animation_banks(jobs: tuple[AnimationJob, ...]) -> None:
    """Prepare all masters to disk, then swap the versioned release once."""

    missing = [job.master_path for job in jobs if not job.master_path.is_file()]
    if missing:
        preview = ", ".join(path.relative_to(ROOT).as_posix() for path in missing[:8])
        remainder = "" if len(missing) <= 8 else f", plus {len(missing) - 8} more"
        raise FileNotFoundError(
            f"Missing {len(missing)}/75 Hazbin animation master(s): "
            f"{preview}{remainder}"
        )

    safe_remove_release_tree(STAGING_ROOT)
    safe_remove_release_tree(BACKUP_ROOT)
    STAGING_ROOT.mkdir(parents=True)
    try:
        preparation_failures: list[str] = []
        for index, job in enumerate(jobs, start=1):
            try:
                prepared = prepare_atlas(
                    job.master_path,
                    job.filename,
                    attachment_margin=40,
                    drop_border_spill=True,
                    minimum_cell_alpha_ratio=(
                        REACTION_MIN_CELL_ALPHA_RATIO
                        if job.bank == "reaction"
                        else MIN_CELL_ALPHA_RATIO
                    ),
                )
                destination = job.output_path(STAGING_ROOT)
                destination.parent.mkdir(parents=True, exist_ok=True)
                prepared.save(destination, optimize=True)
            except (OSError, ValueError) as error:
                failure = f"{job.bank}/{job.filename}: {error}"
                preparation_failures.append(failure)
                print(f"[{index:02d}/75] rejected {failure}", flush=True)
                continue
            print(
                f"[{index:02d}/75] prepared {job.bank}/{job.filename}",
                flush=True,
            )

        if preparation_failures:
            preview = "\n - ".join(preparation_failures)
            raise ValueError(
                f"{len(preparation_failures)} animation atlas preparation "
                f"failure(s):\n - {preview}"
            )

        validate_published_jobs(jobs, STAGING_ROOT)

        had_previous_release = PUBLIC_RELEASE_ROOT.exists()
        if had_previous_release:
            PUBLIC_RELEASE_ROOT.replace(BACKUP_ROOT)
        try:
            STAGING_ROOT.replace(PUBLIC_RELEASE_ROOT)
        except OSError:
            if had_previous_release and BACKUP_ROOT.exists():
                BACKUP_ROOT.replace(PUBLIC_RELEASE_ROOT)
            raise
        safe_remove_release_tree(BACKUP_ROOT)
    finally:
        safe_remove_release_tree(STAGING_ROOT)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Prepare or validate the 75 Hazbin supplementary animation atlases."
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="validate the already-published 75-atlas release without writing",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    try:
        atlases = load_animation_manifest()
        jobs = build_jobs(atlases)
        if args.check:
            count = validate_published_jobs(jobs, PUBLIC_RELEASE_ROOT)
            print(
                f"Validated {count} supplementary Hazbin atlases "
                f"({count * COLUMNS * ROWS} cells, 100 characters x 3 banks)."
            )
            return
        publish_animation_banks(jobs)
    except (FileNotFoundError, OSError, ValueError) as error:
        raise SystemExit(f"Hazbin animation preparation failed: {error}") from None

    print(
        "Published 75 supplementary Hazbin atlases atomically "
        "(1,800 cells, 18 new poses for each of 100 characters)."
    )


if __name__ == "__main__":
    main()
