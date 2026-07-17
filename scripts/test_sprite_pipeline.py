"""Regression tests for the deterministic sprite-atlas validation helpers."""

from __future__ import annotations

import unittest

from PIL import Image, ImageDraw

from scripts.build_sprite_assets import (
    COLUMNS,
    isolate_primary_sprite,
    validate_hazbin_expansion_manifest,
    validate_row_frame_diversity,
)


def make_pose(horizontal_offset: int) -> Image.Image:
    """Create one opaque synthetic silhouette on a transparent atlas cell."""

    cell = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
    draw = ImageDraw.Draw(cell)
    draw.rectangle(
        (24 + horizontal_offset, 28, 124 + horizontal_offset, 227),
        fill=(255, 255, 255, 255),
    )
    return cell


def make_pose_with_detached_parts() -> Image.Image:
    """Create a body, a 32 px spill and a meaningful 120 px detached part."""

    cell = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
    draw = ImageDraw.Draw(cell)
    draw.rectangle((40, 40, 139, 169), fill=(255, 255, 255, 255))
    draw.rectangle((150, 55, 157, 58), fill=(255, 255, 255, 255))
    draw.rectangle((150, 100, 161, 109), fill=(255, 255, 255, 255))
    return cell


class SpritePipelineValidationTests(unittest.TestCase):
    def test_manifest_matches_the_runtime_animation_contract(self) -> None:
        validate_hazbin_expansion_manifest()

    def test_six_distinct_pose_silhouettes_are_accepted(self) -> None:
        cells = [make_pose(index * 12) for index in range(COLUMNS)]
        validate_row_frame_diversity(cells, "synthetic row")

    def test_duplicate_pose_silhouettes_are_rejected(self) -> None:
        cells = [make_pose(index * 12) for index in range(COLUMNS)]
        cells[4] = cells[3].copy()

        with self.assertRaisesRegex(ValueError, "near-duplicate animation silhouettes"):
            validate_row_frame_diversity(cells, "synthetic row")

    def test_sub_two_percent_pose_shift_is_rejected(self) -> None:
        cells = [make_pose(index * 12) for index in range(COLUMNS)]
        cells[1] = make_pose(1)
        cells[0] = make_pose(0)

        with self.assertRaisesRegex(ValueError, "minimum 2%"):
            validate_row_frame_diversity(cells, "synthetic row")

    def test_strict_generated_atlas_threshold_removes_spill_but_keeps_costume_part(
        self,
    ) -> None:
        cell = make_pose_with_detached_parts()
        historical = isolate_primary_sprite(cell)
        strict = isolate_primary_sprite(
            cell,
            minimum_attachment_pixels=24,
            minimum_attachment_ratio=0.005,
        )

        self.assertGreater(historical.getpixel((151, 56))[3], 0)
        self.assertEqual(strict.getpixel((151, 56))[3], 0)
        self.assertGreater(strict.getpixel((151, 101))[3], 0)


if __name__ == "__main__":
    unittest.main()
