"""Generate the complete Hazbin and Helluva supplementary motion masters.

Eight reviewed ImageGen atlases anchor the four new motions for ``core-a`` and
``helluva-core``.  The remaining rows are identity-preserving derivatives of
the already-reviewed OpenAI base/combat poses: this keeps all 208 character
designs stable while giving every row the same fixed 6x4 animation contract.

The generated files are chroma masters, not public runtime assets.  Run
``prepare_hazbin_animations`` and ``prepare_helluva_animations`` afterwards to
key, normalise, validate and publish the transparent releases atomically.
"""

from __future__ import annotations

import argparse
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, Literal

from PIL import Image

try:
    from .build_sprite_assets import (
        COLUMNS,
        EXPECTED_SHEET_SIZE,
        HAZBIN_EXPANSION_ATLASES,
        HAZBIN_SHEETS,
        HELLUVA_SHEETS,
        ROOT,
        ROWS,
    )
    from .prepare_hazbin_expansion import detect_chroma_plate
except ImportError:
    from build_sprite_assets import (
        COLUMNS,
        EXPECTED_SHEET_SIZE,
        HAZBIN_EXPANSION_ATLASES,
        HAZBIN_SHEETS,
        HELLUVA_SHEETS,
        ROOT,
        ROWS,
    )
    from prepare_hazbin_expansion import detect_chroma_plate


CELL_WIDTH = EXPECTED_SHEET_SIZE[0] // COLUMNS
CELL_HEIGHT = EXPECTED_SHEET_SIZE[1] // ROWS
HAZBIN_NEW_BANKS = ("taunt", "jump", "crouch", "recoil")
HELLUVA_BANKS = (
    "movement",
    "offense",
    "reaction",
    *HAZBIN_NEW_BANKS,
)
PLATE_RGB = {
    "green": (0, 255, 0, 255),
    "magenta": (255, 0, 255, 255),
}

CollectionId = Literal["hazbin", "helluva"]
BankId = Literal[
    "movement",
    "offense",
    "reaction",
    "taunt",
    "jump",
    "crouch",
    "recoil",
]
SourceBankId = Literal["base", "movement", "offense", "reaction"]


@dataclass(frozen=True)
class MotionAtlas:
    collection: CollectionId
    stem: str
    base_path: Path
    character_ids: tuple[str, ...]

    def source_path(self, bank: SourceBankId) -> Path:
        if bank == "base":
            return self.base_path
        if self.collection != "hazbin":
            raise ValueError("Helluva derived banks use the reviewed base atlas")
        return (
            ROOT
            / "public"
            / "assets"
            / "sprites"
            / "hazbin"
            / "animation"
            / "v1"
            / bank
            / f"{self.stem}-{bank}.png"
        )

    def master_path(self, bank: BankId) -> Path:
        return (
            ROOT
            / "art"
            / "sprite-sheets"
            / "chroma"
            / f"{self.collection}-animation"
            / bank
            / f"{self.stem}-{bank}-chroma.png"
        )


@dataclass(frozen=True)
class FrameTransform:
    source_bank: SourceBankId
    source_column: int
    scale_x: float = 1.0
    scale_y: float = 1.0
    rotation: float = 0.0
    offset_x: int = 0
    baseline_y: int = CELL_HEIGHT - 12


HAZBIN_TRANSFORMS: dict[str, tuple[FrameTransform, ...]] = {
    "taunt": (
        FrameTransform("base", 1, 0.98, 0.98),
        FrameTransform("base", 5, 1.0, 1.0, -2, -3),
        FrameTransform("movement", 1, 1.02, 0.98, 2, 2),
        FrameTransform("base", 5, 1.04, 1.02, -3, -2),
        FrameTransform("movement", 0, 0.99, 1.0, 1, 1),
        FrameTransform("base", 2, 1.0, 1.0),
    ),
    "jump": (
        FrameTransform("movement", 5, 1.02, 0.78, -3, -2, 242),
        FrameTransform("movement", 4, 0.96, 0.92, -8, 4, 216),
        FrameTransform("movement", 5, 0.94, 0.94, -4, 4, 184),
        FrameTransform("movement", 5, 0.92, 0.92, 2, 0, 158),
        FrameTransform("movement", 4, 0.96, 0.92, 7, -3, 202),
        FrameTransform("movement", 0, 1.04, 0.82, 2, 2, 242),
    ),
    "crouch": (
        FrameTransform("reaction", 0, 1.04, 0.72, -2, -2, 244),
        FrameTransform("reaction", 1, 1.05, 0.66, -1, -2, 244),
        FrameTransform("reaction", 0, 1.02, 0.64, 1, 2, 244),
        FrameTransform("reaction", 1, 1.08, 0.68, -2, 0, 244),
        FrameTransform("offense", 0, 1.06, 0.7, 2, 2, 244),
        FrameTransform("movement", 0, 1.01, 0.82, 1, 0, 244),
    ),
    "recoil": (
        FrameTransform("reaction", 2, 0.98, 0.94, 4, 3, 242),
        FrameTransform("reaction", 3, 1.0, 0.96, 8, 5, 240),
        FrameTransform("reaction", 3, 0.98, 0.94, 13, 7, 235),
        FrameTransform("reaction", 4, 0.94, 0.9, 18, 9, 215),
        FrameTransform("reaction", 4, 1.04, 0.74, 7, 12, 244),
        FrameTransform("movement", 0, 0.99, 0.98, -2, 3, 244),
    ),
}

HELLUVA_TRANSFORMS: dict[str, tuple[FrameTransform, ...]] = {
    "movement": (
        FrameTransform("base", 2, 0.99, 1.0),
        FrameTransform("base", 2, 1.01, 0.98, -1, 2),
        FrameTransform("base", 3, 0.98, 0.98, -3, -3),
        FrameTransform("base", 2, 1.0, 0.96, 2, 2),
        FrameTransform("base", 3, 1.0, 0.98, 3, 3),
        FrameTransform("base", 4, 1.02, 0.92, -5, 5),
    ),
    "offense": (
        FrameTransform("base", 2, 0.98, 1.0),
        FrameTransform("base", 3, 1.02, 1.0, -3, 2),
        FrameTransform("base", 2, 1.0, 0.98, 2, -1),
        FrameTransform("base", 3, 1.04, 1.0, -5, 3),
        FrameTransform("base", 4, 1.06, 0.98, -2, 5),
        FrameTransform("base", 5, 1.0, 1.0, 2, -2),
    ),
    "reaction": (
        FrameTransform("base", 2, 1.0, 0.98),
        FrameTransform("base", 4, 1.02, 0.96, 3, 3),
        FrameTransform("base", 4, 0.98, 0.96, 6, 5),
        FrameTransform("base", 4, 1.0, 0.92, 10, 7),
        FrameTransform("base", 4, 1.05, 0.72, 5, 9, 244),
        FrameTransform("base", 5, 0.98, 0.9, 2, 4, 244),
    ),
    "taunt": (
        FrameTransform("base", 1, 0.98, 0.98),
        FrameTransform("base", 5, 1.0, 1.0, -2, -3),
        FrameTransform("base", 1, 1.02, 0.98, 2, 2),
        FrameTransform("base", 5, 1.04, 1.02, -3, -2),
        FrameTransform("base", 0, 0.99, 1.0, 1, 1),
        FrameTransform("base", 2, 1.0, 1.0),
    ),
    "jump": (
        FrameTransform("base", 3, 1.02, 0.78, -3, -2, 242),
        FrameTransform("base", 3, 0.96, 0.92, -8, 4, 216),
        FrameTransform("base", 4, 0.94, 0.94, -4, 4, 184),
        FrameTransform("base", 4, 0.92, 0.92, 2, 0, 158),
        FrameTransform("base", 3, 0.96, 0.92, 7, -3, 202),
        FrameTransform("base", 2, 1.04, 0.82, 2, 2, 242),
    ),
    "crouch": (
        FrameTransform("base", 2, 1.04, 0.72, -2, -2, 244),
        FrameTransform("base", 2, 1.05, 0.66, -1, -2, 244),
        FrameTransform("base", 1, 1.02, 0.64, 1, 2, 244),
        FrameTransform("base", 4, 1.08, 0.68, -2, 0, 244),
        FrameTransform("base", 3, 1.06, 0.7, 2, 2, 244),
        FrameTransform("base", 2, 1.01, 0.82, 1, 0, 244),
    ),
    "recoil": (
        FrameTransform("base", 4, 0.98, 0.94, 4, 3, 242),
        FrameTransform("base", 4, 1.0, 0.96, 8, 5, 240),
        FrameTransform("base", 4, 0.98, 0.94, 13, 7, 235),
        FrameTransform("base", 4, 0.94, 0.9, 18, 9, 215),
        FrameTransform("base", 4, 1.04, 0.74, 7, 12, 244),
        FrameTransform("base", 2, 0.99, 0.98, -2, 3, 244),
    ),
}


def expected_hazbin_atlases() -> tuple[MotionAtlas, ...]:
    historical = tuple(
        MotionAtlas(
            collection="hazbin",
            stem=Path(filename).stem,
            base_path=ROOT / "public" / "assets" / "sprites" / "sheets" / filename,
            character_ids=tuple(character_ids),
        )
        for filename, character_ids in HAZBIN_SHEETS
    )
    expanded = tuple(
        MotionAtlas(
            collection="hazbin",
            stem=Path(atlas.filename).stem,
            base_path=(
                ROOT
                / "public"
                / "assets"
                / "sprites"
                / "hazbin"
                / "sheets"
                / atlas.filename
            ),
            character_ids=atlas.character_ids,
        )
        for atlas in HAZBIN_EXPANSION_ATLASES
    )
    return historical + expanded


def expected_helluva_atlases() -> tuple[MotionAtlas, ...]:
    return tuple(
        MotionAtlas(
            collection="helluva",
            stem=Path(filename).stem,
            base_path=(
                ROOT
                / "public"
                / "assets"
                / "sprites"
                / "helluva"
                / "sheets"
                / filename
            ),
            character_ids=tuple(character_ids),
        )
        for filename, character_ids in HELLUVA_SHEETS
    )


def validate_atlas_registry(atlases: Iterable[MotionAtlas]) -> None:
    configured = tuple(atlases)
    stems = [atlas.stem for atlas in configured]
    character_ids = [
        character_id
        for atlas in configured
        for character_id in atlas.character_ids
    ]
    if len(stems) != len(set(stems)):
        raise ValueError("Motion atlas stems must be unique inside a collection")
    if len(character_ids) != len(set(character_ids)):
        raise ValueError("Motion atlas rows must map unique character IDs")
    if any(len(atlas.character_ids) != ROWS for atlas in configured):
        raise ValueError("Every motion atlas must map exactly four character rows")
    missing = [atlas.base_path for atlas in configured if not atlas.base_path.is_file()]
    if missing:
        raise FileNotFoundError(
            f"Missing {len(missing)} reviewed base atlas source(s): "
            + ", ".join(path.relative_to(ROOT).as_posix() for path in missing[:8])
        )


def extract_visible_pose(cell: Image.Image) -> Image.Image:
    rgba = cell.convert("RGBA")
    bounds = rgba.getchannel("A").getbbox()
    if bounds is None:
        raise ValueError("Cannot derive motion from an empty source cell")
    return rgba.crop(bounds)


def transform_pose(pose: Image.Image, transform: FrameTransform) -> Image.Image:
    width = max(1, round(pose.width * transform.scale_x))
    height = max(1, round(pose.height * transform.scale_y))
    resized = pose.resize((width, height), Image.Resampling.LANCZOS)
    if transform.rotation:
        resized = resized.rotate(
            transform.rotation,
            resample=Image.Resampling.BICUBIC,
            expand=True,
        )

    max_width = CELL_WIDTH - 24
    max_height = CELL_HEIGHT - 24
    fit_scale = min(1.0, max_width / resized.width, max_height / resized.height)
    if fit_scale < 1:
        resized = resized.resize(
            (
                max(1, round(resized.width * fit_scale)),
                max(1, round(resized.height * fit_scale)),
            ),
            Image.Resampling.LANCZOS,
        )

    frame = Image.new("RGBA", (CELL_WIDTH, CELL_HEIGHT), (0, 0, 0, 0))
    left = ((CELL_WIDTH - resized.width) // 2) + transform.offset_x
    top = transform.baseline_y - resized.height
    left = min(CELL_WIDTH - 12 - resized.width, max(12, left))
    top = min(CELL_HEIGHT - 12 - resized.height, max(12, top))
    frame.alpha_composite(resized, (left, top))
    return frame


def count_plate_conflicts(atlas: Image.Image, plate: Literal["green", "magenta"]) -> int:
    count = 0
    for red, green, blue, alpha in atlas.get_flattened_data():
        if alpha <= 20:
            continue
        dominance = (
            green - max(red, blue)
            if plate == "green"
            else min(red, blue) - green
        )
        if dominance >= 62:
            count += 1
    return count


def choose_plate(atlas: Image.Image) -> Literal["green", "magenta"]:
    green_conflicts = count_plate_conflicts(atlas, "green")
    magenta_conflicts = count_plate_conflicts(atlas, "magenta")
    return "green" if green_conflicts <= magenta_conflicts else "magenta"


def render_derived_master(
    atlas: MotionAtlas,
    bank: BankId,
    transforms: tuple[FrameTransform, ...],
) -> Image.Image:
    transparent = render_derived_transparent(atlas, bank, transforms)
    plate = choose_plate(transparent)
    master = Image.new("RGBA", EXPECTED_SHEET_SIZE, PLATE_RGB[plate])
    master.alpha_composite(transparent)
    return master


def render_derived_transparent(
    atlas: MotionAtlas,
    bank: BankId,
    transforms: tuple[FrameTransform, ...],
) -> Image.Image:
    """Rebuild the exact alpha source used beneath a derivative chroma master."""

    if len(transforms) != COLUMNS:
        raise ValueError(f"{bank} needs exactly {COLUMNS} frame transforms")

    sources: dict[SourceBankId, Image.Image] = {}
    for source_bank in {frame.source_bank for frame in transforms}:
        source_path = atlas.source_path(source_bank)
        if not source_path.is_file():
            raise FileNotFoundError(
                f"Missing source bank for {atlas.stem}/{bank}: "
                f"{source_path.relative_to(ROOT).as_posix()}"
            )
        with Image.open(source_path) as source:
            if source.size != EXPECTED_SHEET_SIZE:
                raise ValueError(
                    f"{source_path.name} must be {EXPECTED_SHEET_SIZE}, "
                    f"got {source.size}"
                )
            sources[source_bank] = source.convert("RGBA")

    transparent = Image.new("RGBA", EXPECTED_SHEET_SIZE, (0, 0, 0, 0))
    for row in range(ROWS):
        for column, transform in enumerate(transforms):
            source = sources[transform.source_bank]
            left = transform.source_column * CELL_WIDTH
            top = row * CELL_HEIGHT
            cell = source.crop(
                (left, top, left + CELL_WIDTH, top + CELL_HEIGHT),
            )
            frame = transform_pose(extract_visible_pose(cell), transform)
            transparent.alpha_composite(
                frame,
                (column * CELL_WIDTH, row * CELL_HEIGHT),
            )

    return transparent


def expected_jobs() -> tuple[
    tuple[MotionAtlas, BankId, tuple[FrameTransform, ...]], ...
]:
    jobs: list[tuple[MotionAtlas, BankId, tuple[FrameTransform, ...]]] = []
    for atlas in expected_hazbin_atlases():
        for bank in HAZBIN_NEW_BANKS:
            jobs.append((atlas, bank, HAZBIN_TRANSFORMS[bank]))
    for atlas in expected_helluva_atlases():
        for bank in HELLUVA_BANKS:
            jobs.append((atlas, bank, HELLUVA_TRANSFORMS[bank]))
    if len(jobs) != 289:
        raise ValueError(f"Expected 289 motion master jobs, got {len(jobs)}")
    return tuple(jobs)


def validate_master(path: Path) -> None:
    if not path.is_file():
        raise FileNotFoundError(f"Missing motion master: {path}")
    with Image.open(path) as source:
        if source.size != EXPECTED_SHEET_SIZE:
            raise ValueError(
                f"{path.name} must be {EXPECTED_SHEET_SIZE}, got {source.size}"
            )
        detect_chroma_plate(source.convert("RGBA"))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate or validate all Hazbin/Helluva motion masters.",
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="validate the 289 expected chroma masters without writing",
    )
    parser.add_argument(
        "--force-derived",
        action="store_true",
        help="regenerate derived masters while preserving the eight ImageGen anchors",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    hazbin_atlases = expected_hazbin_atlases()
    helluva_atlases = expected_helluva_atlases()
    validate_atlas_registry(hazbin_atlases)
    validate_atlas_registry(helluva_atlases)
    if len(hazbin_atlases) != 25 or len(helluva_atlases) != 27:
        raise SystemExit(
            "Motion master generation failed: expected 25 Hazbin and "
            f"27 Helluva atlases, got {len(hazbin_atlases)} and "
            f"{len(helluva_atlases)}"
        )

    jobs = expected_jobs()
    if args.check:
        for atlas, bank, _ in jobs:
            validate_master(atlas.master_path(bank))
        print(
            "Validated 289 motion chroma masters "
            "(6,936 cells; 100 Hazbin and 108 Helluva identities)."
        )
        return

    generated = 0
    preserved = 0
    for index, (atlas, bank, transforms) in enumerate(jobs, start=1):
        destination = atlas.master_path(bank)
        is_imagegen_anchor = (
            (atlas.collection == "hazbin" and atlas.stem == "core-a")
            or (atlas.collection == "helluva" and atlas.stem == "helluva-core")
        ) and bank in HAZBIN_NEW_BANKS
        if is_imagegen_anchor:
            validate_master(destination)
            preserved += 1
            print(
                f"[{index:03d}/289] preserved ImageGen anchor "
                f"{atlas.collection}/{bank}/{destination.name}",
                flush=True,
            )
            continue
        if destination.is_file() and not args.force_derived:
            validate_master(destination)
            preserved += 1
            continue

        master = render_derived_master(atlas, bank, transforms)
        destination.parent.mkdir(parents=True, exist_ok=True)
        master.save(destination, optimize=True)
        validate_master(destination)
        generated += 1
        print(
            f"[{index:03d}/289] generated "
            f"{atlas.collection}/{bank}/{destination.name}",
            flush=True,
        )

    print(
        f"Motion master generation complete: {generated} generated, "
        f"{preserved} preserved, 289 total."
    )


if __name__ == "__main__":
    main()
