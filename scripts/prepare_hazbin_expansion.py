"""Prepare generated Hazbin chroma masters for the public 6x4 atlas contract.

Image generation is intentionally kept separate from deterministic asset
preparation. This pass removes the green screen, isolates the primary pose in
each fixed cell, scales down only when a silhouette enters the safety gutter,
and publishes all thirteen transparent atlases atomically.
"""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image

from build_sprite_assets import (
    COLUMNS,
    EXPECTED_SHEET_SIZE,
    HAZBIN_EXPANSION_ATLASES,
    MIN_CELL_ALPHA_MARGIN,
    ROOT,
    ROWS,
    alpha_bounds,
    isolate_primary_sprite,
    validate_hazbin_expansion_manifest,
    validate_sheet,
)


CHROMA_DIR = ROOT / "art" / "sprite-sheets" / "chroma"
PUBLIC_SHEET_DIR = ROOT / "public" / "assets" / "sprites" / "hazbin" / "sheets"
CELL_WIDTH = EXPECTED_SHEET_SIZE[0] // COLUMNS
CELL_HEIGHT = EXPECTED_SHEET_SIZE[1] // ROWS
NORMALIZED_MARGIN = MIN_CELL_ALPHA_MARGIN + 4


def chroma_master_path(final_filename: str) -> Path:
    stem = Path(final_filename).stem
    return CHROMA_DIR / f"{stem}-chroma.png"


def remove_green_screen(source: Image.Image) -> Image.Image:
    """Remove the generated green screen and neutralise green edge spill."""

    image = source.convert("RGBA")
    pixels = image.load()
    for y in range(image.height):
        for x in range(image.width):
            red, green, blue, alpha = pixels[x, y]
            strongest_other = max(red, blue)
            if green >= 145 and green - strongest_other >= 62:
                pixels[x, y] = (0, 0, 0, 0)
                continue

            # Antialiased borders mix costume colours with the chroma plate.
            # Suppress only a strong residual green cast on visible pixels.
            if green - strongest_other >= 24:
                green = min(green, strongest_other + 10)
            pixels[x, y] = (red, green, blue, alpha)
    return image


def normalise_cell(cell: Image.Image, context: str) -> Image.Image:
    """Keep the cell's primary pose and guarantee a transparent safety gutter."""

    isolated = isolate_primary_sprite(cell)
    bounds = alpha_bounds(isolated.getchannel("A"))
    if bounds is None:
        raise ValueError(f"{context} has no visible primary pose after chroma removal")

    trimmed = isolated.crop(bounds)
    available_width = CELL_WIDTH - (NORMALIZED_MARGIN * 2)
    available_height = CELL_HEIGHT - (NORMALIZED_MARGIN * 2)
    scale = min(1.0, available_width / trimmed.width, available_height / trimmed.height)
    if scale < 1.0:
        trimmed = trimmed.resize(
            (
                max(1, round(trimmed.width * scale)),
                max(1, round(trimmed.height * scale)),
            ),
            Image.Resampling.LANCZOS,
        )

    canvas = Image.new("RGBA", (CELL_WIDTH, CELL_HEIGHT), (0, 0, 0, 0))
    left = (CELL_WIDTH - trimmed.width) // 2
    top = CELL_HEIGHT - NORMALIZED_MARGIN - trimmed.height
    canvas.alpha_composite(trimmed, (left, top))
    return canvas


def prepare_atlas(master_path: Path, final_filename: str) -> Image.Image:
    with Image.open(master_path) as source:
        if source.size != EXPECTED_SHEET_SIZE:
            raise ValueError(
                f"{master_path.name} must be {EXPECTED_SHEET_SIZE[0]}x"
                f"{EXPECTED_SHEET_SIZE[1]}, got {source.width}x{source.height}"
            )
        transparent = remove_green_screen(source)

    atlas = Image.new("RGBA", EXPECTED_SHEET_SIZE, (0, 0, 0, 0))
    for row in range(ROWS):
        for column in range(COLUMNS):
            left = column * CELL_WIDTH
            top = row * CELL_HEIGHT
            cell = transparent.crop((left, top, left + CELL_WIDTH, top + CELL_HEIGHT))
            normalised = normalise_cell(
                cell,
                f"{master_path.name} row {row + 1}, column {column + 1}",
            )
            atlas.alpha_composite(normalised, (left, top))

    validate_sheet(
        atlas,
        f"prepared/{final_filename}",
        strict_alpha_margins=True,
    )
    return atlas


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Chroma-key and atomically publish the 13 generated Hazbin atlases."
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="validate all chroma masters without publishing transparent atlases",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    try:
        validate_hazbin_expansion_manifest()
    except ValueError as error:
        raise SystemExit(f"Hazbin expansion preparation failed: {error}") from None

    missing = [
        chroma_master_path(atlas.filename)
        for atlas in HAZBIN_EXPANSION_ATLASES
        if not chroma_master_path(atlas.filename).is_file()
    ]
    if missing:
        names = ", ".join(path.name for path in missing)
        raise SystemExit(
            f"Hazbin expansion preparation failed: missing {len(missing)}/"
            f"{len(HAZBIN_EXPANSION_ATLASES)} chroma masters: {names}"
        )

    prepared: list[tuple[str, Image.Image]] = []
    try:
        for atlas in HAZBIN_EXPANSION_ATLASES:
            master_path = chroma_master_path(atlas.filename)
            prepared.append((atlas.filename, prepare_atlas(master_path, atlas.filename)))
    except ValueError as error:
        raise SystemExit(f"Hazbin expansion preparation failed: {error}") from None

    if args.check:
        print(
            f"Validated {len(prepared)} Hazbin chroma masters "
            f"({len(prepared) * COLUMNS * ROWS} isolated cells)."
        )
        return

    PUBLIC_SHEET_DIR.mkdir(parents=True, exist_ok=True)
    staged: list[tuple[Path, Path]] = []
    try:
        for filename, image in prepared:
            staged_path = PUBLIC_SHEET_DIR / f".{filename}.tmp.png"
            destination = PUBLIC_SHEET_DIR / filename
            image.save(staged_path, optimize=True)
            staged.append((staged_path, destination))
        for staged_path, destination in staged:
            staged_path.replace(destination)
    finally:
        for staged_path, _ in staged:
            staged_path.unlink(missing_ok=True)

    print(
        f"Published {len(prepared)} transparent Hazbin atlases to "
        f"{PUBLIC_SHEET_DIR.relative_to(ROOT).as_posix()}."
    )


if __name__ == "__main__":
    main()
