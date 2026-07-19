"""Prepare and atomically publish the Helluva Boss DLC animation banks.

The 27 base atlases remain the identity and row-order authority.  This pass
keys, recentres and validates all seven supplementary banks as one versioned
release.  Supplementary banks never replace or extract directory portraits.
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
        HELLUVA_SHEETS,
        MIN_CELL_ALPHA_MARGIN,
        MIN_CELL_ALPHA_RATIO,
        ROOT,
        ROWS,
        validate_sheet,
    )
    from .prepare_hazbin_expansion import prepare_atlas
    from .generate_motion_bank_masters import (
        HAZBIN_NEW_BANKS,
        HELLUVA_TRANSFORMS,
        expected_helluva_atlases,
        render_derived_transparent,
    )
except ImportError:
    from build_sprite_assets import (
        COLUMNS,
        EXPECTED_SHEET_SIZE,
        HELLUVA_SHEETS,
        MIN_CELL_ALPHA_MARGIN,
        MIN_CELL_ALPHA_RATIO,
        ROOT,
        ROWS,
        validate_sheet,
    )
    from prepare_hazbin_expansion import prepare_atlas
    from generate_motion_bank_masters import (
        HAZBIN_NEW_BANKS,
        HELLUVA_TRANSFORMS,
        expected_helluva_atlases,
        render_derived_transparent,
    )


MANIFEST_PATH = (
    ROOT / "art" / "sprite-sheets" / "helluva-animation-banks-manifest.json"
)
MASTER_ROOT = (
    ROOT / "art" / "sprite-sheets" / "chroma" / "helluva-animation"
)
PUBLIC_RELEASE_ROOT = (
    ROOT / "public" / "assets" / "sprites" / "helluva" / "animation" / "v1"
)
STAGING_ROOT = PUBLIC_RELEASE_ROOT.parent / ".v1.tmp"
BACKUP_ROOT = PUBLIC_RELEASE_ROOT.parent / ".v1.backup"
BANK_IDS = (
    "movement",
    "offense",
    "reaction",
    "taunt",
    "jump",
    "crouch",
    "recoil",
)
ANIMATION_CONTRACT_ID = "eight-bank-combat-v4"
BANK_MIN_CELL_ALPHA_RATIOS = {
    "reaction": 0.035,
    "jump": 0.025,
    "crouch": 0.025,
    "recoil": 0.025,
}


@dataclass(frozen=True)
class AnimationAtlas:
    stem: str
    base_sheet: str
    rows: tuple[str, ...]


@dataclass(frozen=True)
class AnimationJob:
    atlas: AnimationAtlas
    bank: str

    @property
    def filename(self) -> str:
        return f"{self.atlas.stem}-{self.bank}.png"

    @property
    def master_path(self) -> Path:
        return (
            MASTER_ROOT
            / self.bank
            / f"{self.atlas.stem}-{self.bank}-chroma.png"
        )

    def output_path(self, root: Path = PUBLIC_RELEASE_ROOT) -> Path:
        return root / self.bank / self.filename


def expected_base_atlases() -> tuple[AnimationAtlas, ...]:
    return tuple(
        AnimationAtlas(
            stem=Path(filename).stem,
            base_sheet=f"/assets/sprites/helluva/sheets/{filename}",
            rows=tuple(character_ids),
        )
        for filename, character_ids in HELLUVA_SHEETS
    )


def load_animation_manifest() -> tuple[AnimationAtlas, ...]:
    try:
        manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise ValueError(f"Cannot read {MANIFEST_PATH.name}: {error}") from error

    if manifest.get("schemaVersion") != 1:
        raise ValueError("Helluva animation manifest schemaVersion must be 1")
    if manifest.get("animationContractId") != ANIMATION_CONTRACT_ID:
        raise ValueError("Helluva animation manifest has the wrong contract")
    if manifest.get("atomic") is not True:
        raise ValueError("Helluva animation banks must publish atomically")

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
        raise ValueError("Helluva animation canvas contract is out of sync")

    banks = manifest.get("banks")
    if not isinstance(banks, list):
        raise ValueError("Helluva animation manifest banks must be a list")
    bank_ids = tuple(bank.get("id") for bank in banks if isinstance(bank, dict))
    if bank_ids != BANK_IDS:
        raise ValueError(
            f"Helluva animation banks must be ordered {BANK_IDS}, got {bank_ids}"
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
                f"Helluva animation bank {bank.get('id')!r} needs six roles"
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
        raise ValueError("Helluva animation manifest schema is invalid") from error

    expected = expected_base_atlases()
    if configured != expected:
        raise ValueError(
            "Helluva animation manifest baseAtlases are out of sync with "
            "HELLUVA_SHEETS"
        )

    stems = [atlas.stem for atlas in configured]
    character_ids = [
        character_id
        for atlas in configured
        for character_id in atlas.rows
    ]
    if len(configured) != 27 or len(set(stems)) != 27:
        raise ValueError("Helluva animation manifest needs 27 unique atlases")
    if len(character_ids) != 108 or len(set(character_ids)) != 108:
        raise ValueError("Helluva animation manifest must map 108 characters")
    if any(len(atlas.rows) != ROWS for atlas in configured):
        raise ValueError("Every Helluva animation atlas needs four rows")
    return configured


def build_jobs(
    atlases: Iterable[AnimationAtlas],
) -> tuple[AnimationJob, ...]:
    jobs = tuple(
        AnimationJob(atlas=atlas, bank=bank)
        for bank in BANK_IDS
        for atlas in atlases
    )
    output_paths = [job.output_path() for job in jobs]
    if len(jobs) != 189 or len(set(output_paths)) != 189:
        raise ValueError("Helluva animation product needs 189 unique jobs")
    return jobs


def minimum_alpha_ratio(bank: str) -> float:
    return BANK_MIN_CELL_ALPHA_RATIOS.get(bank, MIN_CELL_ALPHA_RATIO)


def prepare_animation_job(job: AnimationJob) -> tuple[Image.Image, str]:
    """Key the four ImageGen anchors and retain alpha for all derivatives."""

    if job.atlas.stem == "helluva-core" and job.bank in HAZBIN_NEW_BANKS:
        return (
            prepare_atlas(
                job.master_path,
                job.filename,
                attachment_margin=44,
                drop_border_spill=True,
                minimum_cell_alpha_ratio=minimum_alpha_ratio(job.bank),
            ),
            "keyed ImageGen",
        )

    atlas_by_stem = {
        atlas.stem: atlas
        for atlas in expected_helluva_atlases()
    }
    motion_atlas = atlas_by_stem.get(job.atlas.stem)
    if motion_atlas is None or job.bank not in HELLUVA_TRANSFORMS:
        raise ValueError(
            f"No deterministic alpha source for {job.bank}/{job.filename}"
        )
    prepared = render_derived_transparent(
        motion_atlas,
        job.bank,
        HELLUVA_TRANSFORMS[job.bank],
    )
    validate_sheet(
        prepared,
        f"helluva-animation/{job.bank}/{job.filename}",
        strict_alpha_margins=True,
        minimum_cell_alpha_ratio=minimum_alpha_ratio(job.bank),
    )
    return prepared, "derived"


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


def validate_published_jobs(
    jobs: Iterable[AnimationJob],
    root: Path,
) -> int:
    validated = 0
    for job in jobs:
        output_path = job.output_path(root)
        if not output_path.is_file():
            raise FileNotFoundError(
                f"Missing prepared Helluva animation atlas: {output_path}"
            )
        with Image.open(output_path) as source:
            if source.mode != "RGBA":
                raise ValueError(
                    f"{output_path.name} must be RGBA, got {source.mode}"
                )
            atlas = source.copy()
        validate_sheet(
            atlas,
            f"helluva-animation/{job.bank}/{job.filename}",
            strict_alpha_margins=True,
            minimum_cell_alpha_ratio=minimum_alpha_ratio(job.bank),
        )
        validated += 1
    return validated


def publish_animation_banks(jobs: tuple[AnimationJob, ...]) -> None:
    missing = [job.master_path for job in jobs if not job.master_path.is_file()]
    if missing:
        preview = ", ".join(
            path.relative_to(ROOT).as_posix()
            for path in missing[:8]
        )
        remainder = "" if len(missing) <= 8 else f", plus {len(missing) - 8} more"
        raise FileNotFoundError(
            f"Missing {len(missing)}/189 Helluva animation master(s): "
            f"{preview}{remainder}"
        )

    safe_remove_release_tree(STAGING_ROOT)
    safe_remove_release_tree(BACKUP_ROOT)
    STAGING_ROOT.mkdir(parents=True)
    try:
        failures: list[str] = []
        for index, job in enumerate(jobs, start=1):
            try:
                prepared, preparation_kind = prepare_animation_job(job)
                destination = job.output_path(STAGING_ROOT)
                destination.parent.mkdir(parents=True, exist_ok=True)
                prepared.save(destination, optimize=True)
            except (OSError, ValueError) as error:
                failure = f"{job.bank}/{job.filename}: {error}"
                failures.append(failure)
                print(f"[{index:03d}/189] rejected {failure}", flush=True)
                continue
            print(
                f"[{index:03d}/189] {preparation_kind} "
                f"{job.bank}/{job.filename}",
                flush=True,
            )

        if failures:
            raise ValueError(
                f"{len(failures)} Helluva preparation failure(s):\n - "
                + "\n - ".join(failures)
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
        description="Prepare or validate the 189 Helluva animation atlases.",
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="validate the published 189-atlas release without writing",
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
                f"Validated {count} supplementary Helluva atlases "
                f"({count * COLUMNS * ROWS} cells, 108 characters x 7 banks)."
            )
            return
        publish_animation_banks(jobs)
    except (FileNotFoundError, OSError, ValueError) as error:
        raise SystemExit(
            f"Helluva animation preparation failed: {error}"
        ) from None

    print(
        "Published 189 supplementary Helluva atlases atomically "
        "(4,536 cells, 42 new poses for each of 108 characters)."
    )


if __name__ == "__main__":
    main()
