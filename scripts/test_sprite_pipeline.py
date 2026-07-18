"""Regression tests for the deterministic sprite-atlas validation helpers."""

from __future__ import annotations

import unittest

from PIL import Image, ImageDraw

from scripts.build_sprite_assets import (
    COLUMNS,
    ROWS,
    isolate_primary_sprite,
    validate_hazbin_expansion_manifest,
    validate_row_frame_diversity,
    validate_sheet,
)
from scripts.prepare_hazbin_animations import (
    BANK_IDS,
    build_jobs,
    load_animation_manifest,
)
from scripts.prepare_hazbin_expansion import remove_small_border_components


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

    def test_supplementary_manifest_builds_exactly_75_unique_jobs(self) -> None:
        atlases = load_animation_manifest()
        jobs = build_jobs(atlases)

        self.assertEqual(len(atlases), 25)
        self.assertEqual(len(jobs), 75)
        self.assertEqual({job.bank for job in jobs}, set(BANK_IDS))
        self.assertEqual(len({job.output_path() for job in jobs}), 75)
        self.assertEqual(
            len({character_id for atlas in atlases for character_id in atlas.rows}),
            100,
        )

    def test_supplementary_jobs_never_target_portrait_directories(self) -> None:
        jobs = build_jobs(load_animation_manifest())
        for job in jobs:
            self.assertNotIn("portraits", job.output_path().parts)
            self.assertTrue(job.output_path().name.endswith(f"-{job.bank}.png"))

    def test_supplementary_cleanup_removes_only_small_neighbour_cell_spill(
        self,
    ) -> None:
        cell = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
        draw = ImageDraw.Draw(cell)
        draw.rectangle((72, 40, 172, 226), fill=(255, 255, 255, 255))
        draw.rectangle((8, 100, 28, 118), fill=(255, 255, 255, 255))

        cleaned = remove_small_border_components(cell)

        self.assertGreater(cleaned.getpixel((100, 100))[3], 0)
        self.assertEqual(cleaned.getpixel((18, 109))[3], 0)

    def test_reaction_threshold_accepts_readable_horizontal_ko_silhouettes(
        self,
    ) -> None:
        atlas = Image.new("RGBA", (1536, 1024), (0, 0, 0, 0))
        for row in range(ROWS):
            for column in range(COLUMNS):
                cell = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
                draw = ImageDraw.Draw(cell)
                draw.rectangle(
                    (24, 96, 68 + (column * 2), 155),
                    fill=(255, 255, 255, 255),
                )
                atlas.alpha_composite(cell, (column * 256, row * 256))

        with self.assertRaisesRegex(ValueError, "looks incomplete"):
            validate_sheet(atlas, "default synthetic atlas")
        validate_sheet(
            atlas,
            "reaction synthetic atlas",
            minimum_cell_alpha_ratio=0.04,
        )

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
