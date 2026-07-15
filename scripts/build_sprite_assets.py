"""Build square character portraits from the generated sprite atlases.

The source atlases use a fixed 6-column by 4-row layout. The first column is
the neutral idle frame used by the directory UI; complete atlases remain
available in the in-app sprite gallery. Hazbin atlases are required, while the
Helluva Boss content pack is skipped atomically until all four of its atlases
are available.
"""

from __future__ import annotations

import argparse
from collections import deque
from dataclasses import dataclass
from pathlib import Path
from typing import Sequence

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SPRITE_DIR = ROOT / "public" / "assets" / "sprites"
COLUMNS = 6
ROWS = 4
EXPECTED_SHEET_SIZE = (1536, 1024)
MIN_CELL_ALPHA_RATIO = 0.05


@dataclass(frozen=True)
class SpriteCollection:
    """One independently publishable set of atlases and portraits."""

    name: str
    sheet_dir: Path
    portrait_dir: Path
    sheets: tuple[tuple[str, tuple[str, ...]], ...]
    required: bool


@dataclass(frozen=True)
class PreparedSheet:
    """A validated atlas ready for portrait extraction."""

    image: Image.Image
    character_ids: tuple[str, ...]
    cell_width: int
    cell_height: int
    portrait_dir: Path


HAZBIN_SHEETS: tuple[tuple[str, tuple[str, ...]], ...] = (
    ("core-a.png", ("charlie", "vaggie", "angeldust", "alastor")),
    ("core-b.png", ("husk", "niffty", "sirpentious", "lucifer")),
    ("hell-antagonists.png", ("cherribomb", "vox", "valentino", "velvette")),
    ("heaven.png", ("adam", "emily", "sera", "lute")),
    ("overlords.png", ("carmilla", "rosie", "zestial", "zeezi")),
    ("season2-au.png", ("baxter", "abel", "sim_applicant_marlow", "sim_applicant_ember")),
)

HELLUVA_SHEETS: tuple[tuple[str, tuple[str, ...]], ...] = (
    ("helluva-core.png", ("hb_blitzo", "hb_moxxie", "hb_millie", "hb_loona")),
    ("helluva-allies.png", ("hb_stolas", "hb_octavia", "hb_fizzarolli", "hb_verosika")),
    ("helluva-powers.png", ("hb_asmodeus", "hb_beelzebub", "hb_striker", "hb_stella")),
    ("helluva-extended.png", ("hb_crimson", "hb_vortex", "hb_sallie_may", "hb_andrealphus")),
)

COLLECTIONS: tuple[SpriteCollection, ...] = (
    SpriteCollection(
        name="Hazbin Hotel",
        sheet_dir=SPRITE_DIR / "sheets",
        portrait_dir=SPRITE_DIR / "portraits",
        sheets=HAZBIN_SHEETS,
        required=True,
    ),
    SpriteCollection(
        name="Helluva Boss",
        sheet_dir=SPRITE_DIR / "helluva" / "sheets",
        portrait_dir=SPRITE_DIR / "helluva" / "portraits",
        sheets=HELLUVA_SHEETS,
        required=False,
    ),
)


def relative_to_root(path: Path) -> str:
    """Return stable repository-relative paths in diagnostics."""

    return path.relative_to(ROOT).as_posix()


def validate_collection_definitions(collections: Sequence[SpriteCollection]) -> None:
    """Reject unsafe paths, malformed row maps, and duplicate output IDs."""

    sheet_paths: set[Path] = set()
    portrait_paths: set[Path] = set()

    for collection in collections:
        if not collection.sheets:
            raise ValueError(f"{collection.name} has no configured sprite atlases")

        for sheet_name, character_ids in collection.sheets:
            if Path(sheet_name).name != sheet_name or Path(sheet_name).suffix.lower() != ".png":
                raise ValueError(
                    f"{collection.name} has an invalid atlas filename: {sheet_name!r}"
                )
            if len(character_ids) != ROWS:
                raise ValueError(
                    f"{collection.name}/{sheet_name} maps {len(character_ids)} rows; "
                    f"expected exactly {ROWS}"
                )

            sheet_path = collection.sheet_dir / sheet_name
            if sheet_path in sheet_paths:
                raise ValueError(f"Duplicate sprite atlas path: {relative_to_root(sheet_path)}")
            sheet_paths.add(sheet_path)

            for character_id in character_ids:
                if (
                    not character_id
                    or Path(character_id).name != character_id
                    or not all(character.isalnum() or character == "_" for character in character_id)
                ):
                    raise ValueError(
                        f"{collection.name}/{sheet_name} has an unsafe character ID: "
                        f"{character_id!r}"
                    )
                portrait_path = collection.portrait_dir / f"{character_id}.png"
                if portrait_path in portrait_paths:
                    raise ValueError(
                        f"Duplicate portrait path: {relative_to_root(portrait_path)}"
                    )
                portrait_paths.add(portrait_path)


def count_visible_pixels(alpha: Image.Image, threshold: int = 20) -> int:
    """Count non-transparent pixels without materialising the full pixel list."""

    histogram = alpha.histogram()
    return sum(histogram[threshold + 1:])


def validate_sheet(sheet: Image.Image, sheet_name: str) -> tuple[int, int]:
    """Reject malformed or visibly incomplete fixed-grid atlases."""

    if sheet.size != EXPECTED_SHEET_SIZE:
        raise ValueError(
            f"{sheet_name} must be {EXPECTED_SHEET_SIZE[0]}x{EXPECTED_SHEET_SIZE[1]}, "
            f"got {sheet.width}x{sheet.height}"
        )

    cell_width = sheet.width // COLUMNS
    cell_height = sheet.height // ROWS
    minimum_visible_pixels = round(cell_width * cell_height * MIN_CELL_ALPHA_RATIO)

    for row in range(ROWS):
        for column in range(COLUMNS):
            cell = sheet.crop((
                column * cell_width,
                row * cell_height,
                (column + 1) * cell_width,
                (row + 1) * cell_height,
            ))
            visible_pixels = count_visible_pixels(cell.getchannel("A"))
            if visible_pixels < minimum_visible_pixels:
                raise ValueError(
                    f"{sheet_name} row {row + 1}, column {column + 1} looks incomplete: "
                    f"{visible_pixels} visible pixels, minimum {minimum_visible_pixels}"
                )

    return cell_width, cell_height


def isolate_primary_sprite(
    image: Image.Image,
    allowed_centre_y: tuple[int, int] | None = None,
) -> Image.Image:
    """Keep the main body and nearby detached costume parts, but discard spill."""

    alpha = image.getchannel("A")
    width, height = alpha.size
    pixels = alpha.load()
    visited = bytearray(width * height)
    components: list[tuple[int, tuple[int, int, int, int], list[tuple[int, int]]]] = []

    for y in range(height):
        for x in range(width):
            index = y * width + x
            if visited[index] or pixels[x, y] <= 20:
                continue

            queue = deque([(x, y)])
            visited[index] = 1
            points: list[tuple[int, int]] = []
            left = right = x
            top = bottom = y

            while queue:
                current_x, current_y = queue.popleft()
                points.append((current_x, current_y))
                left = min(left, current_x)
                right = max(right, current_x)
                top = min(top, current_y)
                bottom = max(bottom, current_y)

                for offset_x, offset_y in (
                    (-1, -1), (0, -1), (1, -1),
                    (-1, 0), (1, 0),
                    (-1, 1), (0, 1), (1, 1),
                ):
                    neighbour_x = current_x + offset_x
                    neighbour_y = current_y + offset_y
                    if not (0 <= neighbour_x < width and 0 <= neighbour_y < height):
                        continue
                    neighbour_index = neighbour_y * width + neighbour_x
                    if visited[neighbour_index] or pixels[neighbour_x, neighbour_y] <= 20:
                        continue
                    visited[neighbour_index] = 1
                    queue.append((neighbour_x, neighbour_y))

            components.append((len(points), (left, top, right + 1, bottom + 1), points))

    if not components:
        raise ValueError("Sprite cell is fully transparent")

    eligible_components = components
    if allowed_centre_y is not None:
        minimum_y, maximum_y = allowed_centre_y
        eligible_components = [
            component
            for component in components
            if minimum_y
            <= (component[1][1] + component[1][3]) / 2
            <= maximum_y
        ]

    if not eligible_components:
        raise ValueError("Sprite cell has no component centred in its expected row")

    eligible_components.sort(key=lambda component: component[0], reverse=True)
    primary_size, primary_bounds, primary_points = eligible_components[0]
    left, top, right, bottom = primary_bounds
    attachment_margin = 40
    attachment_bounds = (
        left - attachment_margin,
        top - attachment_margin,
        right + attachment_margin,
        bottom + attachment_margin,
    )
    minimum_attachment_size = max(12, round(primary_size * 0.002))
    keep = list(primary_points)

    for size, bounds, points in eligible_components[1:]:
        if size < minimum_attachment_size:
            continue
        component_left, component_top, component_right, component_bottom = bounds
        centre_x = (component_left + component_right) / 2
        centre_y = (component_top + component_bottom) / 2
        if (
            attachment_bounds[0] <= centre_x <= attachment_bounds[2]
            and attachment_bounds[1] <= centre_y <= attachment_bounds[3]
        ):
            keep.extend(points)

    mask = Image.new("L", image.size, 0)
    mask_pixels = mask.load()
    for x, y in keep:
        mask_pixels[x, y] = pixels[x, y]

    isolated = image.copy()
    isolated.putalpha(mask)
    return isolated


def fit_on_square(
    image: Image.Image,
    size: int = 512,
    margin: int = 22,
    allowed_centre_y: tuple[int, int] | None = None,
) -> Image.Image:
    image = isolate_primary_sprite(image, allowed_centre_y)
    alpha = image.getchannel("A")
    bounds = alpha.getbbox()
    if bounds is None:
        raise ValueError("Sprite cell is fully transparent")

    trimmed = image.crop(bounds)
    available = size - (margin * 2)
    scale = min(available / trimmed.width, available / trimmed.height)
    resized = trimmed.resize(
        (max(1, round(trimmed.width * scale)), max(1, round(trimmed.height * scale))),
        Image.Resampling.LANCZOS,
    )

    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    x = (size - resized.width) // 2
    y = size - margin - resized.height
    canvas.alpha_composite(resized, (x, y))
    return canvas


def extract_idle_pose(
    sheet: Image.Image,
    row: int,
    cell_width: int,
    cell_height: int,
) -> tuple[Image.Image, tuple[int, int]]:
    """Include modest vertical bleed so tall poses are not cut at row boundaries."""

    vertical_padding = cell_height // 4
    top = max(0, row * cell_height - vertical_padding)
    bottom = min(sheet.height, (row + 1) * cell_height + vertical_padding)
    nominal_top = row * cell_height - top
    nominal_bottom = (row + 1) * cell_height - top
    centre_tolerance = 8
    allowed_centre_y = (
        max(0, nominal_top - centre_tolerance),
        min(bottom - top, nominal_bottom + centre_tolerance),
    )
    return sheet.crop((0, top, cell_width, bottom)), allowed_centre_y


def prepare_sheets(require_helluva: bool) -> list[PreparedSheet]:
    """Load complete collections and validate every configured 6x4 cell."""

    validate_collection_definitions(COLLECTIONS)
    prepared: list[PreparedSheet] = []

    # Validate every atlas before touching a published portrait. Optional packs
    # are all-or-nothing so a partial generation pass cannot publish mixed rows.
    for collection in COLLECTIONS:
        missing_paths = [
            collection.sheet_dir / sheet_name
            for sheet_name, _ in collection.sheets
            if not (collection.sheet_dir / sheet_name).is_file()
        ]
        if missing_paths:
            diagnostic = ", ".join(relative_to_root(path) for path in missing_paths)
            if collection.required or require_helluva:
                raise FileNotFoundError(
                    f"{collection.name} is missing {len(missing_paths)} sprite atlas(es): "
                    f"{diagnostic}"
                )
            print(
                f"Skipped optional {collection.name} portraits: missing "
                f"{len(missing_paths)}/{len(collection.sheets)} atlases: {diagnostic}"
            )
            continue

        for sheet_name, character_ids in collection.sheets:
            sheet_path = collection.sheet_dir / sheet_name
            with Image.open(sheet_path) as source:
                sheet = source.convert("RGBA")
            cell_width, cell_height = validate_sheet(
                sheet,
                relative_to_root(sheet_path),
            )
            prepared.append(
                PreparedSheet(
                    image=sheet,
                    character_ids=character_ids,
                    cell_width=cell_width,
                    cell_height=cell_height,
                    portrait_dir=collection.portrait_dir,
                )
            )

    return prepared


def write_portraits(prepared: Sequence[PreparedSheet]) -> int:
    """Extract validated idle poses and publish them transactionally."""

    written = 0
    staged_portraits: list[tuple[Path, Path]] = []
    try:
        for prepared_sheet in prepared:
            prepared_sheet.portrait_dir.mkdir(parents=True, exist_ok=True)
            for row, character_id in enumerate(prepared_sheet.character_ids):
                cell, allowed_centre_y = extract_idle_pose(
                    prepared_sheet.image,
                    row,
                    prepared_sheet.cell_width,
                    prepared_sheet.cell_height,
                )
                portrait = fit_on_square(cell, allowed_centre_y=allowed_centre_y)
                staged_path = prepared_sheet.portrait_dir / f".{character_id}.tmp.png"
                destination = prepared_sheet.portrait_dir / f"{character_id}.png"
                portrait.save(staged_path, optimize=True)
                staged_portraits.append((staged_path, destination))
                written += 1

        for staged_path, destination in staged_portraits:
            staged_path.replace(destination)
    finally:
        for staged_path, _ in staged_portraits:
            staged_path.unlink(missing_ok=True)

    return written


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Validate 6x4 sprite atlases and build square idle portraits."
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="validate available atlases and row mappings without writing portraits",
    )
    parser.add_argument(
        "--require-helluva",
        action="store_true",
        help="fail when any Helluva Boss atlas is not available",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    try:
        prepared = prepare_sheets(require_helluva=args.require_helluva)
    except (FileNotFoundError, ValueError) as error:
        raise SystemExit(f"Sprite asset build failed: {error}") from None
    atlas_count = len(prepared)
    portrait_count = sum(len(sheet.character_ids) for sheet in prepared)
    cell_count = atlas_count * COLUMNS * ROWS

    if args.check:
        print(
            f"Validated {atlas_count} sprite atlases ({cell_count} cells); "
            f"{portrait_count} portraits are ready to build."
        )
        return

    written = write_portraits(prepared)
    print(f"Wrote {written} character portraits across configured sprite collections.")


if __name__ == "__main__":
    main()
