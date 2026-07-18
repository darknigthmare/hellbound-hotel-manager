"""Prepare and atomically publish Hazbin's match-cinematic sprite banks.

The existing 25 base atlases remain the identity and row-order authority.
ImageGen masters contain six new poses for each intro, victory and draw bank.
This pass removes the chroma plate, normalises every cell, validates the full
100-character product, and publishes all 75 transparent atlases atomically.
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
        MIN_CELL_ALPHA_MARGIN,
        MIN_CELL_ALPHA_RATIO,
        ROOT,
        ROWS,
        validate_sheet,
    )
    from .prepare_hazbin_animations import AnimationAtlas, expected_base_atlases
    from .prepare_hazbin_expansion import prepare_atlas
except ImportError:
    from build_sprite_assets import (
        COLUMNS,
        EXPECTED_SHEET_SIZE,
        MIN_CELL_ALPHA_MARGIN,
        MIN_CELL_ALPHA_RATIO,
        ROOT,
        ROWS,
        validate_sheet,
    )
    from prepare_hazbin_animations import AnimationAtlas, expected_base_atlases
    from prepare_hazbin_expansion import prepare_atlas


MANIFEST_PATH = (
    ROOT / "art" / "sprite-sheets" / "hazbin-cinematic-banks-manifest.json"
)
MASTER_ROOT = (
    ROOT / "art" / "sprite-sheets" / "chroma" / "hazbin-cinematics"
)
PUBLIC_RELEASE_ROOT = (
    ROOT / "public" / "assets" / "sprites" / "hazbin" / "cinematics" / "v1"
)
STAGING_ROOT = PUBLIC_RELEASE_ROOT.parent / ".v1.tmp"
BACKUP_ROOT = PUBLIC_RELEASE_ROOT.parent / ".v1.backup"
BANK_IDS = ("intro", "victory", "draw")
ANIMATION_CONTRACT_ID = "three-bank-cinematics-v1"


@dataclass(frozen=True)
class CinematicJob:
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


def load_cinematic_manifest() -> tuple[AnimationAtlas, ...]:
    try:
        manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise ValueError(f"Cannot read {MANIFEST_PATH.name}: {error}") from error

    if manifest.get("schemaVersion") != 1:
        raise ValueError("Hazbin cinematic manifest schemaVersion must be 1")
    if manifest.get("animationContractId") != ANIMATION_CONTRACT_ID:
        raise ValueError("Hazbin cinematic manifest has the wrong contract")
    if manifest.get("atomic") is not True:
        raise ValueError("Hazbin cinematic banks must publish atomically")
    if manifest.get("identityManifest") != "hazbin-animation-banks-manifest.json":
        raise ValueError("Hazbin cinematic identity authority is out of sync")

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
        raise ValueError("Hazbin cinematic canvas contract is out of sync")

    banks = manifest.get("banks")
    if not isinstance(banks, list):
        raise ValueError("Hazbin cinematic banks must be a list")
    bank_ids = tuple(bank.get("id") for bank in banks if isinstance(bank, dict))
    if bank_ids != BANK_IDS:
        raise ValueError(
            f"Hazbin cinematic banks must be ordered {BANK_IDS}, got {bank_ids}"
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
                f"Hazbin cinematic bank {bank.get('id')!r} needs six unique roles"
            )

    atlases = expected_base_atlases()
    character_ids = [
        character_id
        for atlas in atlases
        for character_id in atlas.rows
    ]
    if len(atlases) != 25 or len({atlas.stem for atlas in atlases}) != 25:
        raise ValueError("Hazbin cinematics require 25 unique identity atlases")
    if len(character_ids) != 100 or len(set(character_ids)) != 100:
        raise ValueError("Hazbin cinematics require 100 unique illustrated identities")
    return atlases


def build_jobs(atlases: Iterable[AnimationAtlas]) -> tuple[CinematicJob, ...]:
    jobs = tuple(
        CinematicJob(atlas=atlas, bank=bank)
        for bank in BANK_IDS
        for atlas in atlases
    )
    if len(jobs) != 75 or len({job.output_path() for job in jobs}) != 75:
        raise ValueError("Hazbin cinematic product must contain 75 unique atlas jobs")
    return jobs


def safe_remove_release_tree(path: Path) -> None:
    release_parent = PUBLIC_RELEASE_ROOT.parent.resolve()
    resolved = path.resolve()
    if resolved.parent != release_parent or resolved.name not in {
        STAGING_ROOT.name,
        BACKUP_ROOT.name,
    }:
        raise ValueError(f"Refusing to remove unsafe release path: {resolved}")
    if resolved.exists():
        shutil.rmtree(resolved)


def validate_jobs(jobs: Iterable[CinematicJob], root: Path) -> int:
    validated = 0
    for job in jobs:
        output_path = job.output_path(root)
        if not output_path.is_file():
            raise FileNotFoundError(f"Missing cinematic atlas: {output_path}")
        with Image.open(output_path) as source:
            if source.mode != "RGBA":
                raise ValueError(f"{output_path.name} must be RGBA, got {source.mode}")
            atlas = source.copy()
        validate_sheet(
            atlas,
            f"cinematics/{job.bank}/{job.filename}",
            strict_alpha_margins=True,
            minimum_cell_alpha_ratio=MIN_CELL_ALPHA_RATIO,
        )
        validated += 1
    return validated


def publish_cinematic_banks(jobs: tuple[CinematicJob, ...]) -> None:
    missing = [job.master_path for job in jobs if not job.master_path.is_file()]
    if missing:
        preview = ", ".join(path.relative_to(ROOT).as_posix() for path in missing[:8])
        remainder = "" if len(missing) <= 8 else f", plus {len(missing) - 8} more"
        raise FileNotFoundError(
            f"Missing {len(missing)}/75 Hazbin cinematic master(s): "
            f"{preview}{remainder}"
        )

    safe_remove_release_tree(STAGING_ROOT)
    safe_remove_release_tree(BACKUP_ROOT)
    STAGING_ROOT.mkdir(parents=True)
    try:
        failures: list[str] = []
        for index, job in enumerate(jobs, start=1):
            try:
                prepared = prepare_atlas(
                    job.master_path,
                    job.filename,
                    attachment_margin=40,
                    drop_border_spill=True,
                    minimum_cell_alpha_ratio=MIN_CELL_ALPHA_RATIO,
                )
                destination = job.output_path(STAGING_ROOT)
                destination.parent.mkdir(parents=True, exist_ok=True)
                prepared.save(destination, optimize=True)
            except (OSError, ValueError) as error:
                failure = f"{job.bank}/{job.filename}: {error}"
                failures.append(failure)
                print(f"[{index:02d}/75] rejected {failure}", flush=True)
                continue
            print(f"[{index:02d}/75] prepared {job.bank}/{job.filename}", flush=True)

        if failures:
            raise ValueError(
                f"{len(failures)} cinematic atlas preparation failure(s):\n - "
                + "\n - ".join(failures)
            )

        validate_jobs(jobs, STAGING_ROOT)
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
        description="Prepare or validate the 75 Hazbin match-cinematic atlases."
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="validate the published 75-atlas release without writing",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    try:
        jobs = build_jobs(load_cinematic_manifest())
        if args.check:
            count = validate_jobs(jobs, PUBLIC_RELEASE_ROOT)
            print(
                f"Validated {count} Hazbin cinematic atlases "
                f"({count * COLUMNS * ROWS} cells, 100 characters x 3 banks)."
            )
            return
        publish_cinematic_banks(jobs)
    except (FileNotFoundError, OSError, ValueError) as error:
        raise SystemExit(f"Hazbin cinematic preparation failed: {error}") from None

    print(
        "Published 75 Hazbin cinematic atlases atomically "
        "(1,800 new cells, 18 new poses for each of 100 characters)."
    )


if __name__ == "__main__":
    main()
