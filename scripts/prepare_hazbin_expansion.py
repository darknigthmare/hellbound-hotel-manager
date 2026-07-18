"""Prepare generated Hazbin chroma masters for the public 6x4 atlas contract.

Image generation is intentionally kept separate from deterministic asset
preparation. This pass removes a green or magenta chroma screen, isolates the
primary pose in each fixed cell, scales down only when a silhouette enters the
safety gutter,
and publishes every manifest-backed transparent atlas atomically.
"""

from __future__ import annotations

import argparse
from collections import deque
from pathlib import Path
from typing import Literal

from PIL import Image, ImageChops, ImageFilter

try:
    from .build_sprite_assets import (
        COLUMNS,
        EXPECTED_SHEET_SIZE,
        HAZBIN_EXPANSION_ATLASES,
        MIN_CELL_ALPHA_MARGIN,
        MIN_CELL_ALPHA_RATIO,
        ROOT,
        ROWS,
        alpha_bounds,
        isolate_primary_sprite,
        validate_hazbin_expansion_manifest,
        validate_sheet,
    )
except ImportError:
    from build_sprite_assets import (
        COLUMNS,
        EXPECTED_SHEET_SIZE,
        HAZBIN_EXPANSION_ATLASES,
        MIN_CELL_ALPHA_MARGIN,
        MIN_CELL_ALPHA_RATIO,
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
NORMALIZED_MIN_ATTACHMENT_PIXELS = 24
NORMALIZED_MIN_ATTACHMENT_RATIO = 0.005
CHROMA_SEED_MIN_CHANNEL = 110
CHROMA_SEED_MIN_DOMINANCE = 35
CHROMA_DETECTION_MIN_CHANNEL = 145
CHROMA_DETECTION_MIN_DOMINANCE = 62
CHROMA_MAGENTA_MAX_IMBALANCE = 96
CHROMA_SPILL_RADIUS = 2
CHROMA_SPILL_MIN_DOMINANCE = 16
CHROMA_SPILL_RETAINED_DOMINANCE = 8
CHROMA_RESIDUAL_MIN_CHANNEL = 220
CHROMA_RESIDUAL_MAX_OTHER_CHANNEL = 60
CHROMA_RESIDUAL_MIN_DOMINANCE = 165
CHROMA_RESIDUAL_MAX_IMBALANCE = 50
MAX_VISIBLE_MAGENTA_RESIDUAL_PIXELS = 32
PATRONS_ATLAS_FILENAME = "hazbin-hotel-patrons.png"
PATRONS_SOURCE_ROW_BOUNDARIES = (
    (0, 278, 510, 770, EXPECTED_SHEET_SIZE[1]),
    (0, 278, 512, 772, EXPECTED_SHEET_SIZE[1]),
    (0, 278, 512, 770, EXPECTED_SHEET_SIZE[1]),
    (0, 278, 512, 770, EXPECTED_SHEET_SIZE[1]),
    (0, 278, 514, 770, EXPECTED_SHEET_SIZE[1]),
    (0, 278, 522, 770, EXPECTED_SHEET_SIZE[1]),
)
PATRONS_SOURCE_COLUMN_BLEED = 20
REVIEWED_SOURCE_WINDOWS: dict[
    tuple[str, int],
    tuple[int, int, int],
] = {
    # Image generation kept the Cactus row visually complete, but a few hair
    # spikes sit just above the nominal y=768 split. The reviewed overlap lets
    # the primary-component isolator retain those tips without importing the
    # Shark row above it.
    ("hazbin-tertiary-locals-a.png", 3): (744, EXPECTED_SHEET_SIZE[1], 0),
    # The Jack-in-the-box spring and feet extend below the nominal first row,
    # and one expressive arm reaches across a vertical split. A small reviewed
    # overlap preserves the complete silhouettes before normalisation.
    ("hazbin-tertiary-locals-b.png", 0): (0, 280, 20),
}

ChromaPlate = Literal["green", "magenta"]


def chroma_master_path(final_filename: str) -> Path:
    stem = Path(final_filename).stem
    return CHROMA_DIR / f"{stem}-chroma.png"


def chroma_dominance(red: int, green: int, blue: int, plate: ChromaPlate) -> int:
    """Measure how strongly a pixel resembles one supported chroma plate."""

    if plate == "green":
        return green - max(red, blue)
    return min(red, blue) - green


def is_chroma_pixel(
    red: int,
    green: int,
    blue: int,
    plate: ChromaPlate,
    *,
    minimum_channel: int,
    minimum_dominance: int,
) -> bool:
    """Match plate-like pixels while rejecting unrelated saturated colours."""

    if plate == "green":
        return (
            green >= minimum_channel
            and chroma_dominance(red, green, blue, plate) >= minimum_dominance
        )
    return (
        min(red, blue) >= minimum_channel
        and abs(red - blue) <= CHROMA_MAGENTA_MAX_IMBALANCE
        and chroma_dominance(red, green, blue, plate) >= minimum_dominance
    )


def detect_chroma_plate(image: Image.Image) -> ChromaPlate:
    """Detect the green or magenta plate from the uncontested outer border."""

    pixels = image.load()
    green_support = 0
    magenta_support = 0
    samples = chroma_seed_points(image.width, image.height)

    for x, y in samples:
        red, green, blue, _ = pixels[x, y]
        green_support += is_chroma_pixel(
            red,
            green,
            blue,
            "green",
            minimum_channel=CHROMA_DETECTION_MIN_CHANNEL,
            minimum_dominance=CHROMA_DETECTION_MIN_DOMINANCE,
        )
        magenta_support += is_chroma_pixel(
            red,
            green,
            blue,
            "magenta",
            minimum_channel=CHROMA_DETECTION_MIN_CHANNEL,
            minimum_dominance=CHROMA_DETECTION_MIN_DOMINANCE,
        )

    required_support = max(8, round(len(samples) * 0.25))
    strongest_support = max(green_support, magenta_support)
    if strongest_support < required_support:
        raise ValueError(
            "Cannot identify a supported green or magenta chroma plate from "
            f"the fixed-cell boundaries (green={green_support}, "
            f"magenta={magenta_support}, required={required_support})"
        )
    return "green" if green_support > magenta_support else "magenta"


def chroma_seed_points(width: int, height: int) -> list[tuple[int, int]]:
    """Seed only the outer plate so internal magenta costume parts survive."""

    seeds: set[tuple[int, int]] = set()
    seeds.update((x, 0) for x in range(width))
    seeds.update((x, height - 1) for x in range(width))
    seeds.update((0, y) for y in range(height))
    seeds.update((width - 1, y) for y in range(height))
    return list(seeds)


def connected_chroma_mask(image: Image.Image, plate: ChromaPlate) -> Image.Image:
    """Flood only plate-connected pixels, preserving enclosed costume colours."""

    width, height = image.size
    pixels = image.load()
    visited = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()

    def enqueue_if_chroma(x: int, y: int) -> None:
        index = y * width + x
        if visited[index]:
            return
        red, green, blue, _ = pixels[x, y]
        if not is_chroma_pixel(
            red,
            green,
            blue,
            plate,
            minimum_channel=CHROMA_SEED_MIN_CHANNEL,
            minimum_dominance=CHROMA_SEED_MIN_DOMINANCE,
        ):
            return
        visited[index] = 1
        queue.append((x, y))

    for x, y in chroma_seed_points(width, height):
        enqueue_if_chroma(x, y)

    while queue:
        x, y = queue.popleft()
        if x > 0:
            enqueue_if_chroma(x - 1, y)
        if x + 1 < width:
            enqueue_if_chroma(x + 1, y)
        if y > 0:
            enqueue_if_chroma(x, y - 1)
        if y + 1 < height:
            enqueue_if_chroma(x, y + 1)

    return Image.frombytes(
        "L",
        (width, height),
        bytes(255 if value else 0 for value in visited),
    )


def residual_magenta_mask(image: Image.Image) -> Image.Image:
    """Find enclosed pixels that still match the generated magenta plate.

    Flood filling from the canvas edge intentionally protects pink costume
    regions, but it cannot reach background pockets enclosed by limbs, hair or
    a tail. The residual threshold is deliberately much stricter than the edge
    key so authored reds and pinks remain intact.
    """

    mask = Image.new("L", image.size, 0)
    source_pixels = image.load()
    mask_pixels = mask.load()
    for y in range(image.height):
        for x in range(image.width):
            red, green, blue, alpha = source_pixels[x, y]
            if (
                alpha > 20
                and min(red, blue) >= CHROMA_RESIDUAL_MIN_CHANNEL
                and green <= CHROMA_RESIDUAL_MAX_OTHER_CHANNEL
                and abs(red - blue) <= CHROMA_RESIDUAL_MAX_IMBALANCE
                and chroma_dominance(red, green, blue, "magenta")
                >= CHROMA_RESIDUAL_MIN_DOMINANCE
            ):
                mask_pixels[x, y] = 255
    return mask


def neutralise_chroma_spill(
    red: int,
    green: int,
    blue: int,
    plate: ChromaPlate,
) -> tuple[int, int, int]:
    """Suppress only residual key colour beside the removed background."""

    dominance = chroma_dominance(red, green, blue, plate)
    if dominance < CHROMA_SPILL_MIN_DOMINANCE:
        return red, green, blue

    if plate == "green":
        green = min(green, max(red, blue) + CHROMA_SPILL_RETAINED_DOMINANCE)
        return red, green, blue

    correction = dominance - CHROMA_SPILL_RETAINED_DOMINANCE
    return max(0, red - correction), green, max(0, blue - correction)


def remove_legacy_green_screen(image: Image.Image) -> Image.Image:
    """Retain the proven global green key used by the original thirteen atlases."""

    pixels = image.load()
    for y in range(image.height):
        for x in range(image.width):
            red, green, blue, alpha = pixels[x, y]
            strongest_other = max(red, blue)
            if (
                green >= CHROMA_DETECTION_MIN_CHANNEL
                and green - strongest_other >= CHROMA_DETECTION_MIN_DOMINANCE
            ):
                pixels[x, y] = (0, 0, 0, 0)
                continue

            # Match the historical spill suppression exactly so rebuilding the
            # green masters remains visually and byte-level compatible.
            if green - strongest_other >= 24:
                green = min(green, strongest_other + 10)
            pixels[x, y] = (red, green, blue, alpha)
    return image


def remove_chroma_screen(source: Image.Image) -> Image.Image:
    """Remove an automatically detected plate without global recolouring."""

    image = source.convert("RGBA")
    plate = detect_chroma_plate(image)
    if plate == "green":
        return remove_legacy_green_screen(image)

    background_mask = connected_chroma_mask(image, plate)
    if plate == "magenta":
        # Generated poses can surround small pockets of the flat screen. Merge
        # those exact plate-colour islands into the removable background.
        background_mask = ImageChops.lighter(
            background_mask,
            residual_magenta_mask(image),
        )
    spill_zone = background_mask.filter(
        ImageFilter.MaxFilter((CHROMA_SPILL_RADIUS * 2) + 1)
    )
    pixels = image.load()
    background_pixels = background_mask.load()
    spill_pixels = spill_zone.load()

    for y in range(image.height):
        for x in range(image.width):
            if background_pixels[x, y]:
                pixels[x, y] = (0, 0, 0, 0)
                continue
            red, green, blue, alpha = pixels[x, y]
            if spill_pixels[x, y]:
                red, green, blue = neutralise_chroma_spill(
                    red,
                    green,
                    blue,
                    plate,
                )
            pixels[x, y] = (red, green, blue, alpha)
    return image


def validate_no_visible_chroma(
    image: Image.Image,
    context: str,
    plate: ChromaPlate,
) -> None:
    """Reject any supported key-colour pixel left visible after preparation."""

    pixels = image.load()
    contaminated_pixels = 0
    first_coordinate: tuple[int, int] | None = None
    for y in range(image.height):
        for x in range(image.width):
            red, green, blue, alpha = pixels[x, y]
            if alpha <= 20:
                continue
            is_contaminated = (
                green >= CHROMA_DETECTION_MIN_CHANNEL
                and green - max(red, blue) >= CHROMA_DETECTION_MIN_DOMINANCE
            ) if plate == "green" else (
                min(red, blue) >= CHROMA_RESIDUAL_MIN_CHANNEL
                and green <= CHROMA_RESIDUAL_MAX_OTHER_CHANNEL
                and abs(red - blue) <= CHROMA_RESIDUAL_MAX_IMBALANCE
                and chroma_dominance(red, green, blue, plate)
                >= CHROMA_RESIDUAL_MIN_DOMINANCE
            )
            if is_contaminated:
                contaminated_pixels += 1
                if first_coordinate is None:
                    first_coordinate = (x, y)

    allowed_pixels = MAX_VISIBLE_MAGENTA_RESIDUAL_PIXELS if plate == "magenta" else 0
    if contaminated_pixels > allowed_pixels:
        raise ValueError(
            f"{context} retains {contaminated_pixels} visible {plate} chroma pixels; "
            f"maximum {allowed_pixels}, first occurrence at {first_coordinate}"
        )


def remove_small_border_components(
    image: Image.Image,
    *,
    border_tolerance: int = 36,
    maximum_primary_ratio: float = 0.45,
) -> Image.Image:
    """Discard detached neighbour-pose fragments entering a fixed cell edge.

    Image generation can place a long weapon a few pixels beyond its intended
    256 px cell. The body in the source cell remains the largest component,
    while the neighbouring cell receives only a detached tip. Removing only
    smaller edge-touching components preserves multi-part costumes near the
    body and prevents those tips from surviving normalisation as visual debris.
    """

    alpha = image.getchannel("A")
    width, height = alpha.size
    pixels = alpha.load()
    visited = bytearray(width * height)
    components: list[tuple[int, bool, list[tuple[int, int]]]] = []

    for y in range(height):
        for x in range(width):
            index = (y * width) + x
            if visited[index] or pixels[x, y] <= 20:
                continue

            queue = deque([(x, y)])
            visited[index] = 1
            points: list[tuple[int, int]] = []
            touches_border = False
            while queue:
                current_x, current_y = queue.popleft()
                points.append((current_x, current_y))
                touches_border = touches_border or (
                    current_x <= border_tolerance
                    or current_y <= border_tolerance
                    or current_x >= width - border_tolerance - 1
                    or current_y >= height - border_tolerance - 1
                )
                for offset_x, offset_y in (
                    (-1, -1), (0, -1), (1, -1),
                    (-1, 0), (1, 0),
                    (-1, 1), (0, 1), (1, 1),
                ):
                    neighbour_x = current_x + offset_x
                    neighbour_y = current_y + offset_y
                    if not (0 <= neighbour_x < width and 0 <= neighbour_y < height):
                        continue
                    neighbour_index = (neighbour_y * width) + neighbour_x
                    if (
                        visited[neighbour_index]
                        or pixels[neighbour_x, neighbour_y] <= 20
                    ):
                        continue
                    visited[neighbour_index] = 1
                    queue.append((neighbour_x, neighbour_y))
            components.append((len(points), touches_border, points))

    if not components:
        return image

    primary_size = max(size for size, _, _ in components)
    cleaned_alpha = alpha.copy()
    cleaned_pixels = cleaned_alpha.load()
    for size, touches_border, points in components:
        if not touches_border or size >= primary_size * maximum_primary_ratio:
            continue
        for x, y in points:
            cleaned_pixels[x, y] = 0

    cleaned = image.copy()
    cleaned.putalpha(cleaned_alpha)
    return cleaned


def normalise_cell(
    cell: Image.Image,
    context: str,
    *,
    attachment_margin: int = 40,
    drop_border_spill: bool = False,
) -> Image.Image:
    """Keep the cell's primary pose and guarantee a transparent safety gutter."""

    if drop_border_spill:
        cell = remove_small_border_components(cell)
    isolated = isolate_primary_sprite(
        cell,
        minimum_attachment_pixels=NORMALIZED_MIN_ATTACHMENT_PIXELS,
        minimum_attachment_ratio=NORMALIZED_MIN_ATTACHMENT_RATIO,
        attachment_margin=attachment_margin,
    )
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


def source_cell_bounds(
    final_filename: str,
    row: int,
    column: int,
) -> tuple[int, int, int, int]:
    """Return a fixed cell or a reviewed overlapping source window."""

    reviewed_window = REVIEWED_SOURCE_WINDOWS.get((final_filename, row))
    if reviewed_window is not None:
        top, bottom, column_bleed = reviewed_window
        left = max(0, (column * CELL_WIDTH) - column_bleed)
        right = min(
            EXPECTED_SHEET_SIZE[0],
            ((column + 1) * CELL_WIDTH) + column_bleed,
        )
        return left, top, right, bottom

    if final_filename != PATRONS_ATLAS_FILENAME:
        left = column * CELL_WIDTH
        top = row * CELL_HEIGHT
        return left, top, left + CELL_WIDTH, top + CELL_HEIGHT

    row_boundaries = PATRONS_SOURCE_ROW_BOUNDARIES[column]
    top, bottom = row_boundaries[row], row_boundaries[row + 1]
    left = max(0, (column * CELL_WIDTH) - PATRONS_SOURCE_COLUMN_BLEED)
    right = min(
        EXPECTED_SHEET_SIZE[0],
        ((column + 1) * CELL_WIDTH) + PATRONS_SOURCE_COLUMN_BLEED,
    )
    return left, top, right, bottom


def prepare_atlas(
    master_path: Path,
    final_filename: str,
    *,
    attachment_margin: int = 40,
    drop_border_spill: bool = False,
    minimum_cell_alpha_ratio: float = MIN_CELL_ALPHA_RATIO,
) -> Image.Image:
    with Image.open(master_path) as source:
        if source.size != EXPECTED_SHEET_SIZE:
            raise ValueError(
                f"{master_path.name} must be {EXPECTED_SHEET_SIZE[0]}x"
                f"{EXPECTED_SHEET_SIZE[1]}, got {source.width}x{source.height}"
            )
        plate = detect_chroma_plate(source.convert("RGBA"))
        transparent = remove_chroma_screen(source)

    atlas = Image.new("RGBA", EXPECTED_SHEET_SIZE, (0, 0, 0, 0))
    for row in range(ROWS):
        for column in range(COLUMNS):
            source_bounds = source_cell_bounds(final_filename, row, column)
            cell = transparent.crop(source_bounds)
            normalised = normalise_cell(
                cell,
                f"{master_path.name} row {row + 1}, column {column + 1}",
                attachment_margin=attachment_margin,
                drop_border_spill=drop_border_spill,
            )
            target_left = column * CELL_WIDTH
            target_top = row * CELL_HEIGHT
            atlas.alpha_composite(normalised, (target_left, target_top))

    if plate == "green":
        # LANCZOS can recreate a handful of strongly green edge pixels while
        # shrinking a keyed silhouette. Reapply the historical key after cell
        # normalisation so generated interpolation cannot leak the plate back
        # into the published atlas.
        remove_legacy_green_screen(atlas)

    validate_sheet(
        atlas,
        f"prepared/{final_filename}",
        strict_alpha_margins=True,
        minimum_cell_alpha_ratio=minimum_cell_alpha_ratio,
    )
    validate_no_visible_chroma(
        atlas,
        f"prepared/{final_filename}",
        plate,
    )
    return atlas


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Chroma-key and atomically publish the generated Hazbin atlases."
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
