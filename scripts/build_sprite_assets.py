"""Build square character portraits from the generated sprite atlases.

The source atlases use a fixed 6-column by 4-row layout. The first column is
the neutral idle frame used by the directory UI; complete atlases remain
available in the in-app sprite gallery.
"""

from __future__ import annotations

from pathlib import Path
from collections import deque

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SHEET_DIR = ROOT / "public" / "assets" / "sprites" / "sheets"
PORTRAIT_DIR = ROOT / "public" / "assets" / "sprites" / "portraits"

SHEETS: tuple[tuple[str, tuple[str, str, str, str]], ...] = (
    ("core-a.png", ("charlie", "vaggie", "angeldust", "alastor")),
    ("core-b.png", ("husk", "niffty", "sirpentious", "lucifer")),
    ("hell-antagonists.png", ("cherribomb", "vox", "valentino", "velvette")),
    ("heaven.png", ("adam", "emily", "sera", "lute")),
    ("overlords.png", ("carmilla", "rosie", "zestial", "zeezi")),
    ("season2-au.png", ("baxter", "abel", "sim_applicant_marlow", "sim_applicant_ember")),
)


def isolate_primary_sprite(image: Image.Image) -> Image.Image:
    """Discard fragments that spill in from neighbouring atlas cells."""

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

    components.sort(key=lambda component: component[0], reverse=True)
    _, _, keep = components[0]

    mask = Image.new("L", image.size, 0)
    mask_pixels = mask.load()
    for x, y in keep:
        mask_pixels[x, y] = pixels[x, y]

    isolated = image.copy()
    isolated.putalpha(mask)
    return isolated


def fit_on_square(image: Image.Image, size: int = 512, margin: int = 22) -> Image.Image:
    image = isolate_primary_sprite(image)
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


def main() -> None:
    PORTRAIT_DIR.mkdir(parents=True, exist_ok=True)
    written = 0

    for sheet_name, character_ids in SHEETS:
        sheet_path = SHEET_DIR / sheet_name
        with Image.open(sheet_path) as source:
            sheet = source.convert("RGBA")

        cell_width = sheet.width // 6
        cell_height = sheet.height // 4

        for row, character_id in enumerate(character_ids):
            cell = sheet.crop((0, row * cell_height, cell_width, (row + 1) * cell_height))
            portrait = fit_on_square(cell)
            portrait.save(PORTRAIT_DIR / f"{character_id}.png", optimize=True)
            written += 1

    print(f"Wrote {written} character portraits to {PORTRAIT_DIR}")


if __name__ == "__main__":
    main()
