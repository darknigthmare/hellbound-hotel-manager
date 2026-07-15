"""Build square character portraits from the generated sprite atlases.

The source atlases use a fixed 6-column by 4-row layout. The first column is
the neutral idle frame used by the directory UI; complete atlases remain
available in the in-app sprite gallery.
"""

from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SHEET_DIR = ROOT / "public" / "assets" / "sprites" / "sheets"
PORTRAIT_DIR = ROOT / "public" / "assets" / "sprites" / "portraits"
COLUMNS = 6
ROWS = 4
EXPECTED_SHEET_SIZE = (1536, 1024)
MIN_CELL_ALPHA_RATIO = 0.05

SHEETS: tuple[tuple[str, tuple[str, str, str, str]], ...] = (
    ("core-a.png", ("charlie", "vaggie", "angeldust", "alastor")),
    ("core-b.png", ("husk", "niffty", "sirpentious", "lucifer")),
    ("hell-antagonists.png", ("cherribomb", "vox", "valentino", "velvette")),
    ("heaven.png", ("adam", "emily", "sera", "lute")),
    ("overlords.png", ("carmilla", "rosie", "zestial", "zeezi")),
    ("season2-au.png", ("baxter", "abel", "sim_applicant_marlow", "sim_applicant_ember")),
)


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


def main() -> None:
    PORTRAIT_DIR.mkdir(parents=True, exist_ok=True)
    prepared: list[tuple[Image.Image, tuple[str, str, str, str], int, int]] = []

    # Validate every atlas before touching a published portrait.
    for sheet_name, character_ids in SHEETS:
        sheet_path = SHEET_DIR / sheet_name
        if not sheet_path.is_file():
            raise FileNotFoundError(f"Missing sprite atlas: {sheet_path}")
        with Image.open(sheet_path) as source:
            sheet = source.convert("RGBA")
        cell_width, cell_height = validate_sheet(sheet, sheet_name)
        prepared.append((sheet, character_ids, cell_width, cell_height))

    written = 0
    staged_portraits: list[tuple[Path, Path]] = []
    try:
        for sheet, character_ids, cell_width, cell_height in prepared:
            for row, character_id in enumerate(character_ids):
                cell, allowed_centre_y = extract_idle_pose(
                    sheet,
                    row,
                    cell_width,
                    cell_height,
                )
                portrait = fit_on_square(cell, allowed_centre_y=allowed_centre_y)
                staged_path = PORTRAIT_DIR / f".{character_id}.tmp.png"
                destination = PORTRAIT_DIR / f"{character_id}.png"
                portrait.save(staged_path, optimize=True)
                staged_portraits.append((staged_path, destination))
                written += 1

        for staged_path, destination in staged_portraits:
            staged_path.replace(destination)
    finally:
        for staged_path, _ in staged_portraits:
            staged_path.unlink(missing_ok=True)

    print(f"Wrote {written} character portraits to {PORTRAIT_DIR}")


if __name__ == "__main__":
    main()
