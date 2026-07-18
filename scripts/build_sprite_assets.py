"""Build square character portraits from the generated sprite atlases.

The source atlases use a fixed 6-column by 4-row layout. The first column is
the neutral idle frame used by the directory UI; complete atlases remain
available in the in-app sprite gallery. The original Hazbin atlases are
required. The extended Hazbin roster and Helluva Boss packs are each skipped
atomically until every atlas in that collection is available.
"""

from __future__ import annotations

import argparse
from collections import deque
from dataclasses import dataclass
import json
from pathlib import Path
from typing import Sequence

from PIL import Image, ImageChops


ROOT = Path(__file__).resolve().parents[1]
SPRITE_DIR = ROOT / "public" / "assets" / "sprites"
HAZBIN_EXPANSION_MANIFEST_PATH = (
    ROOT / "art" / "sprite-sheets" / "hazbin-expansion-manifest.json"
)
COLUMNS = 6
ROWS = 4
EXPECTED_SHEET_SIZE = (1536, 1024)
MIN_CELL_ALPHA_RATIO = 0.05
MIN_CELL_ALPHA_MARGIN = 6
MAX_EDGE_ALPHA_RATIO = 0.0025
PORTRAIT_ALPHA_MARGIN = 16
MIN_FRAME_ALPHA_DIFFERENCE_RATIO = 0.02
ANIMATION_CONTRACT_ID = "six-pose-combat-v2"
ANIMATION_COLUMN_ROLES = (
    "portrait_idle",
    "expression",
    "combat_ready",
    "attack_startup",
    "attack_impact",
    "victory_recovery",
)
ANIMATION_CLIPS = {
    "idle": {
        "loop": True,
        "frames": ({"column": 2, "durationMs": 800},),
    },
    "walk": {
        "loop": True,
        "frames": ({"column": 2, "durationMs": 210},),
    },
    "guard": {
        "loop": True,
        "frames": ({"column": 2, "durationMs": 250},),
    },
    "light": {
        "loop": False,
        "frames": (
            {"column": 2, "durationMs": 40},
            {"column": 3, "durationMs": 80},
            {"column": 4, "durationMs": 100},
            {"column": 2, "durationMs": 120},
        ),
    },
    "heavy": {
        "loop": False,
        "frames": (
            {"column": 2, "durationMs": 80},
            {"column": 3, "durationMs": 140},
            {"column": 4, "durationMs": 140},
            {"column": 5, "durationMs": 100},
        ),
    },
    "special": {
        "loop": False,
        "frames": (
            {"column": 2, "durationMs": 140},
            {"column": 3, "durationMs": 220},
            {"column": 4, "durationMs": 180},
            {"column": 5, "durationMs": 160},
        ),
    },
    "hit": {
        "loop": False,
        "frames": ({"column": 4, "durationMs": 210},),
    },
    "ko": {
        "loop": False,
        "frames": ({"column": 4, "durationMs": 1000},),
    },
    "victory": {
        "loop": True,
        "frames": ({"column": 5, "durationMs": 900},),
    },
}


@dataclass(frozen=True)
class SpriteCollection:
    """One independently publishable set of atlases and portraits."""

    name: str
    sheet_dir: Path
    portrait_dir: Path
    sheets: tuple[tuple[str, tuple[str, ...]], ...]
    required: bool
    display_names: tuple[tuple[str, str], ...] = ()
    strict_alpha_margins: bool = False


@dataclass(frozen=True)
class NamedSpriteAtlas:
    """An atlas whose row IDs and user-facing names share one source of truth."""

    filename: str
    characters: tuple[tuple[str, str], ...]

    @property
    def character_ids(self) -> tuple[str, ...]:
        return tuple(character_id for character_id, _ in self.characters)


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

# This optional, atomic collection mirrors the expanded Hazbin directory. It
# deliberately uses an isolated public subtree so the historical 24-profile
# bundle and its stable URLs remain untouched while new art is generated.
HAZBIN_EXPANSION_ATLASES: tuple[NamedSpriteAtlas, ...] = (
    NamedSpriteAtlas(
        "hazbin-family-media.png",
        (
            ("hz_lilith", "Lilith Morningstar"),
            ("hz_mimzy", "Mimzy"),
            ("hz_katie_killjoy", "Katie Killjoy"),
            ("hz_tom_trench", "Tom Trench"),
        ),
    ),
    NamedSpriteAtlas(
        "hazbin-companions.png",
        (
            ("hz_frank_egg_boi", "Frank"),
            ("hz_razzle", "Razzle"),
            ("hz_dazzle", "Dazzle"),
            ("hz_keekee", "KeeKee"),
        ),
    ),
    NamedSpriteAtlas(
        "hazbin-heaven-pets.png",
        (
            ("hz_fat_nuggets", "Fat Nuggets"),
            ("hz_st_peter", "St. Peter"),
            ("hz_speaker_of_god", "Speaker of God"),
            ("hz_molly", "Molly"),
        ),
    ),
    NamedSpriteAtlas(
        "hazbin-carmine-overlords.png",
        (
            ("hz_clara_carmine", "Clara Carmine"),
            ("hz_odette_carmine", "Odette Carmine"),
            ("hz_maestro", "Maestro"),
            ("hz_prick", "Prick"),
        ),
    ),
    NamedSpriteAtlas(
        "hazbin-overlord-fringe.png",
        (
            ("hz_hatchet", "Hatchet"),
            ("hz_shok_wav", "Shok.wav"),
            ("hz_susan", "Susan"),
            ("hz_rooster", "Rooster"),
        ),
    ),
    NamedSpriteAtlas(
        "hazbin-season2-network.png",
        (
            ("hz_ethan", "Ethan"),
            ("hz_melissa", "Melissa"),
            ("hz_salina", "Salina"),
            ("hz_zack_rabbit", "Zack Rabbit"),
        ),
    ),
    NamedSpriteAtlas(
        "hazbin-city-names-a.png",
        (
            ("hz_myk_mic_guy", "Myk the Mic Guy"),
            ("hz_man_meat", "Man Meat"),
            ("hz_buddy_mcsluggy", "Buddy McSluggy"),
            ("hz_bryrin", "Bryrin"),
        ),
    ),
    NamedSpriteAtlas(
        "hazbin-city-names-b.png",
        (
            ("hz_egg_boiz", "Egg Boiz"),
            ("hz_rocky", "Rocky"),
            ("hz_dia", "Dia"),
            ("hz_summer", "Summer"),
        ),
    ),
    NamedSpriteAtlas(
        "hazbin-angel-family.png",
        (
            ("hz_arackniss", "Arackniss"),
            ("hz_angel_father", "Angel Dust’s father"),
            ("hz_crymini", "Crymini"),
            ("hz_villa", "Villa"),
        ),
    ),
    NamedSpriteAtlas(
        "hazbin-eldritch-legacy.png",
        (
            ("hz_hellsa_von_eldritch", "Helsa von Eldritch"),
            ("hz_seviathan_von_eldritch", "Seviathan von Eldritch"),
            ("hz_frederick_von_eldritch", "Frederick von Eldritch"),
            ("hz_bethesda_von_eldritch", "Bethesda von Eldritch"),
        ),
    ),
    NamedSpriteAtlas(
        "hazbin-legacy-history.png",
        (
            ("hz_roo", "Roo"),
            ("hz_eve", "Eve"),
            ("hz_british_gentleman", "British Gentleman"),
            ("hz_female_victim", "Female Victim"),
        ),
    ),
    NamedSpriteAtlas(
        "hazbin-human-history.png",
        (
            ("hz_the_killer", "The Killer"),
            ("hz_human_hunter", "Human Hunter"),
            ("hz_harry", "Harry"),
            ("hz_carrie", "Carrie"),
        ),
    ),
    NamedSpriteAtlas(
        "hazbin-human-crossovers.png",
        (
            ("hz_larry", "Larry"),
            ("hz_robert_bob_sinclaire", "Robert “Bob” Sinclaire"),
            ("hz_crying_exorcist", "Crying Exorcist"),
            ("hz_travis", "Travis"),
        ),
    ),
    NamedSpriteAtlas(
        "hazbin-hotel-patrons.png",
        (
            ("hz_la_catrina_sinner", "La Catrina sinner"),
            ("hz_eel_sinner", "Eel sinner"),
            ("hz_egyptian_sinner", "Egyptian sinner"),
            ("hz_ant_sinner", "Ant sinner"),
        ),
    ),
    NamedSpriteAtlas(
        "hazbin-vees-casino.png",
        (
            ("hz_kitty", "Kitty"),
            ("hz_huskette_cat", "Huskette cat-like waitress"),
            ("hz_huskette_spider", "Huskette spider-like waitress"),
            ("hz_huskette_imp", "Huskette imp-like waitress"),
        ),
    ),
    NamedSpriteAtlas(
        "hazbin-season2-voiced-locals.png",
        (
            ("hz_reporter_demon", "Reporter demon"),
            ("hz_goldfish_sinner", "Goldfish sinner"),
            ("hz_fangirl_goat", "Goat-like fangirl sinner"),
            ("hz_fangirl_apple_tree", "Apple-tree fangirl sinner"),
        ),
    ),
    NamedSpriteAtlas(
        "hazbin-recurring-patrons-ii.png",
        (
            ("hz_conjoined_twins", "Conjoined Twin sinners"),
            ("hz_western_sinner", "Western sinner"),
            ("hz_goth_bird_sinner", "Goth bird-like sinner"),
            ("hz_rose_sinner", "Rose-like sinner"),
        ),
    ),
    NamedSpriteAtlas(
        "hazbin-tertiary-locals-a.png",
        (
            ("hz_gator_sinner", "Gator sinner"),
            ("hz_velvette_assistant", "Velvette's assistant"),
            ("hz_shark_gang_leader", "Shark Gang Leader"),
            ("hz_cactus_sinner", "Cactus sinner"),
        ),
    ),
    NamedSpriteAtlas(
        "hazbin-tertiary-locals-b.png",
        (
            ("hz_jack_in_box_sinner", "Jack-in-the-box sinner"),
            ("hz_orphan_imp", "Orphan Imp"),
            ("hz_top_hat_demon", "Top Hat Demon"),
            ("hz_roadkill_sinner", "Roadkill sinner"),
        ),
    ),
)

HAZBIN_EXPANSION_SHEETS: tuple[tuple[str, tuple[str, ...]], ...] = tuple(
    (atlas.filename, atlas.character_ids) for atlas in HAZBIN_EXPANSION_ATLASES
)
HAZBIN_EXPANSION_DISPLAY_NAMES: tuple[tuple[str, str], ...] = tuple(
    character
    for atlas in HAZBIN_EXPANSION_ATLASES
    for character in atlas.characters
)


def validate_hazbin_expansion_manifest() -> None:
    """Keep the reviewed JSON art contract and Python extraction map identical."""

    try:
        manifest = json.loads(HAZBIN_EXPANSION_MANIFEST_PATH.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise ValueError(
            f"Cannot read {relative_to_root(HAZBIN_EXPANSION_MANIFEST_PATH)}: {error}"
        ) from error

    try:
        manifest_atlases = tuple(
            (
                atlas["filename"],
                tuple((row["id"], row["name"]) for row in atlas["rows"]),
            )
            for atlas in manifest["atlases"]
        )
    except (KeyError, TypeError) as error:
        raise ValueError("Hazbin expansion manifest has an invalid atlas schema") from error

    configured_atlases = tuple(
        (atlas.filename, atlas.characters) for atlas in HAZBIN_EXPANSION_ATLASES
    )
    if manifest_atlases != configured_atlases:
        raise ValueError(
            "Hazbin expansion manifest is out of sync with "
            "HAZBIN_EXPANSION_ATLASES"
        )

    if manifest.get("schemaVersion") != 2:
        raise ValueError("Hazbin expansion manifest schemaVersion must be 2")

    canvas = manifest.get("canvas", {})
    expected_canvas = {
        "width": EXPECTED_SHEET_SIZE[0],
        "height": EXPECTED_SHEET_SIZE[1],
        "columns": COLUMNS,
        "rows": ROWS,
        "minimumAlphaMargin": MIN_CELL_ALPHA_MARGIN,
    }
    if any(canvas.get(key) != value for key, value in expected_canvas.items()):
        raise ValueError("Hazbin expansion manifest canvas contract is out of sync")

    expected_animation_contract = {
        "id": ANIMATION_CONTRACT_ID,
        "facing": "screen_right",
        "columnRoles": list(ANIMATION_COLUMN_ROLES),
        "clips": {
            clip_name: {
                "loop": clip["loop"],
                "frames": list(clip["frames"]),
            }
            for clip_name, clip in ANIMATION_CLIPS.items()
        },
    }
    if manifest.get("animationContract") != expected_animation_contract:
        raise ValueError(
            "Hazbin expansion manifest animationContract is out of sync"
        )

HELLUVA_SHEETS: tuple[tuple[str, tuple[str, ...]], ...] = (
    ("helluva-core.png", ("hb_blitzo", "hb_moxxie", "hb_millie", "hb_loona")),
    ("helluva-allies.png", ("hb_stolas", "hb_octavia", "hb_fizzarolli", "hb_verosika")),
    ("helluva-powers.png", ("hb_asmodeus", "hb_beelzebub", "hb_striker", "hb_stella")),
    ("helluva-extended.png", ("hb_crimson", "hb_vortex", "hb_sallie_may", "hb_andrealphus")),
    ("helluva-origins.png", ("hb_paimon", "hb_barbie_wire", "hb_cash_buckzo", "hb_wally_wackford")),
    ("helluva-rivals.png", ("hb_mammon", "hb_chazwick_thurman", "hb_glitz", "hb_glam")),
    ("helluva-celestial.png", ("hb_cletus", "hb_collin", "hb_keenie", "hb_vassago")),
    (
        "helluva-operatives.png",
        ("hb_robo_fizz", "hb_agent_one", "hb_agent_two", "hb_satan"),
    ),
    (
        "helluva-hauntings.png",
        ("hb_rolando", "hb_mrs_mayberry", "hb_martha", "hb_tilla"),
    ),
    (
        "helluva-legacies.png",
        ("hb_moxxies_mother", "hb_loopty_goopty", "hb_lyle_lipton", "hb_deerie"),
    ),
    (
        "helluva-powers-and-kin.png",
        ("hb_joe", "hb_lin", "hb_leviathan", "hb_belphegor"),
    ),
    (
        "helluva-secondary-underworld.png",
        ("hb_alessio", "hb_arick_burnz", "hb_counselor_jimmy", "hb_yogirt"),
    ),
    (
        "helluva-secondary-humans.png",
        (
            "hb_emberlynn_pinkle",
            "hb_kendra",
            "hb_rita",
            "hb_better_than_blitzo_guy",
        ),
    ),
    (
        "helluva-secondary-rides.png",
        ("hb_loo_loo", "hb_jesse", "hb_miles", "hb_bombproof"),
    ),
    (
        "helluva-secondary-nightlife.png",
        ("hb_muffy", "hb_dr_somna", "hb_vikki", "hb_gigi"),
    ),
    (
        "helluva-friends-and-foes.png",
        ("hb_russ", "hb_dennis", "hb_ralphie", "hb_catfish_monster"),
    ),
    (
        "helluva-greed-and-ghosts.png",
        (
            "hb_elder_jaws",
            "hb_bethany_ghostfucker",
            "hb_karen_client",
            "hb_toledo_the_igor",
        ),
    ),
    (
        "helluva-stars-and-strays.png",
        ("hb_brennon_ragers", "hb_uggie", "hb_skips", "hb_queef"),
    ),
    (
        "helluva-shorts-targets-a.png",
        (
            "hb_ace",
            "hb_gerardo_velazquez",
            "hb_frank_mctickly_wrigglers",
            "hb_driveso",
        ),
    ),
    (
        "helluva-shorts-targets-b.png",
        (
            "hb_joe_smoe",
            "hb_paulie_paesano",
            "hb_luigi_paesano",
            "hb_william_diddle",
        ),
    ),
    (
        "helluva-shorts-locals.png",
        ("hb_adrian", "hb_mr_mayor", "hb_gerald", "hb_rick"),
    ),
    (
        "helluva-verosika-crew-a.png",
        ("hb_coco", "hb_apple", "hb_kat", "hb_milky"),
    ),
    (
        "helluva-verosika-crew-b.png",
        (
            "hb_kiki",
            "hb_josh",
            "hb_stolas_family_butler",
            "hb_mister_butler",
        ),
    ),
    (
        "helluva-family-fallout.png",
        (
            "hb_marthas_daughter",
            "hb_marthas_son",
            "hb_harold_patriot",
            "hb_dolores",
        ),
    ),
    (
        "helluva-turning-points.png",
        (
            "hb_hellhound_adoption_lady",
            "hb_travis",
            "hb_tour_guide_guy",
            "hb_big_woobly",
        ),
    ),
    (
        "helluva-shorts-witnesses.png",
        (
            "hb_gerardos_wife",
            "hb_diddle_secretary",
            "hb_bigfoot_waiter",
            "hb_gorilla_suit_guy",
        ),
    ),
    (
        "helluva-cherub-staff.png",
        (
            "hb_rachel_cherub",
            "hb_bea_cherub",
            "hb_beau_cherub",
            "hb_honey_cherub",
        ),
    ),
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
        name="Hazbin Hotel extended roster",
        sheet_dir=SPRITE_DIR / "hazbin" / "sheets",
        portrait_dir=SPRITE_DIR / "hazbin" / "portraits",
        sheets=HAZBIN_EXPANSION_SHEETS,
        required=False,
        display_names=HAZBIN_EXPANSION_DISPLAY_NAMES,
        strict_alpha_margins=True,
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
    """Reject unsafe paths, malformed row maps, and duplicate public outputs."""

    validate_hazbin_expansion_manifest()
    sheet_paths: set[Path] = set()
    portrait_paths: set[Path] = set()
    sprite_root = SPRITE_DIR.resolve()

    for collection in collections:
        if not collection.sheets:
            raise ValueError(f"{collection.name} has no configured sprite atlases")

        for output_dir in (collection.sheet_dir, collection.portrait_dir):
            try:
                output_dir.resolve().relative_to(sprite_root)
            except ValueError:
                raise ValueError(
                    f"{collection.name} publishes outside public/assets/sprites: "
                    f"{output_dir}"
                ) from None

        display_names: dict[str, str] = {}
        for character_id, display_name in collection.display_names:
            if character_id in display_names:
                raise ValueError(
                    f"{collection.name} defines more than one name for {character_id!r}"
                )
            if not display_name or display_name.strip() != display_name:
                raise ValueError(
                    f"{collection.name} has an invalid display name for {character_id!r}: "
                    f"{display_name!r}"
                )
            display_names[character_id] = display_name

        configured_ids: set[str] = set()

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
                configured_ids.add(character_id)
                portrait_path = collection.portrait_dir / f"{character_id}.png"
                if portrait_path in portrait_paths:
                    raise ValueError(
                        f"Duplicate portrait path: {relative_to_root(portrait_path)}"
                    )
                portrait_paths.add(portrait_path)

        if display_names:
            missing_names = sorted(configured_ids - display_names.keys())
            orphan_names = sorted(display_names.keys() - configured_ids)
            if missing_names or orphan_names:
                raise ValueError(
                    f"{collection.name} display-name manifest is out of sync; "
                    f"missing={missing_names}, orphaned={orphan_names}"
                )


def count_visible_pixels(alpha: Image.Image, threshold: int = 20) -> int:
    """Count non-transparent pixels without materialising the full pixel list."""

    histogram = alpha.histogram()
    return sum(histogram[threshold + 1:])


def alpha_bounds(alpha: Image.Image, threshold: int = 20) -> tuple[int, int, int, int] | None:
    """Return bounds for meaningful alpha while ignoring resampling speckles."""

    thresholded = alpha.point(lambda value: 255 if value > threshold else 0)
    return thresholded.getbbox()


def validate_row_frame_diversity(
    cells: Sequence[Image.Image],
    context: str,
) -> None:
    """Reject duplicated or nearly duplicated key poses in one character row."""

    if len(cells) != COLUMNS:
        raise ValueError(
            f"{context} provides {len(cells)} animation cells; expected {COLUMNS}"
        )

    alpha_masks = [
        cell.getchannel("A").point(lambda value: 255 if value > 20 else 0)
        for cell in cells
    ]
    for left_index, left_mask in enumerate(alpha_masks):
        for right_index in range(left_index + 1, len(alpha_masks)):
            right_mask = alpha_masks[right_index]
            union_pixels = count_visible_pixels(
                ImageChops.lighter(left_mask, right_mask)
            )
            if union_pixels == 0:
                continue
            changed_pixels = count_visible_pixels(
                ImageChops.difference(left_mask, right_mask)
            )
            difference_ratio = changed_pixels / union_pixels
            if difference_ratio < MIN_FRAME_ALPHA_DIFFERENCE_RATIO:
                raise ValueError(
                    f"{context} has near-duplicate animation silhouettes in "
                    f"columns {left_index + 1} and {right_index + 1}: "
                    f"{difference_ratio:.2%} alpha difference, minimum "
                    f"{MIN_FRAME_ALPHA_DIFFERENCE_RATIO:.0%}"
                )


def validate_cell_alpha_margin(cell: Image.Image, context: str) -> None:
    """Reject meaningful alpha in the grid gutter or a primary pose clipped by it."""

    alpha = cell.getchannel("A")
    visible_pixels = count_visible_pixels(alpha)
    inner_alpha = alpha.crop((
        MIN_CELL_ALPHA_MARGIN,
        MIN_CELL_ALPHA_MARGIN,
        cell.width - MIN_CELL_ALPHA_MARGIN,
        cell.height - MIN_CELL_ALPHA_MARGIN,
    ))
    edge_pixels = visible_pixels - count_visible_pixels(inner_alpha)
    allowed_edge_pixels = max(8, round(visible_pixels * MAX_EDGE_ALPHA_RATIO))
    if edge_pixels > allowed_edge_pixels:
        raise ValueError(
            f"{context} spills into its {MIN_CELL_ALPHA_MARGIN}px alpha gutter: "
            f"{edge_pixels} edge pixels, maximum {allowed_edge_pixels}"
        )

    primary = isolate_primary_sprite(cell)
    bounds = alpha_bounds(primary.getchannel("A"))
    if bounds is None:
        raise ValueError(f"{context} has no primary sprite")
    left, top, right, bottom = bounds
    margins = (left, top, cell.width - right, cell.height - bottom)
    if min(margins) < MIN_CELL_ALPHA_MARGIN:
        raise ValueError(
            f"{context} clips its primary pose: alpha margins "
            f"left/top/right/bottom={margins}, minimum {MIN_CELL_ALPHA_MARGIN}px"
        )


def validate_sheet(
    sheet: Image.Image,
    sheet_name: str,
    strict_alpha_margins: bool = False,
) -> tuple[int, int]:
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
        row_cells: list[Image.Image] = []
        for column in range(COLUMNS):
            cell = sheet.crop((
                column * cell_width,
                row * cell_height,
                (column + 1) * cell_width,
                (row + 1) * cell_height,
            ))
            row_cells.append(cell)
            visible_pixels = count_visible_pixels(cell.getchannel("A"))
            if visible_pixels < minimum_visible_pixels:
                raise ValueError(
                    f"{sheet_name} row {row + 1}, column {column + 1} looks incomplete: "
                    f"{visible_pixels} visible pixels, minimum {minimum_visible_pixels}"
                )
            if strict_alpha_margins:
                validate_cell_alpha_margin(
                    cell,
                    f"{sheet_name} row {row + 1}, column {column + 1}",
                )
        validate_row_frame_diversity(
            row_cells,
            f"{sheet_name} row {row + 1}",
        )

    return cell_width, cell_height


def isolate_primary_sprite(
    image: Image.Image,
    allowed_centre_y: tuple[int, int] | None = None,
    *,
    minimum_attachment_pixels: int = 12,
    minimum_attachment_ratio: float = 0.002,
) -> Image.Image:
    """Keep the main body and meaningful nearby costume parts, but discard spill.

    Defaults preserve the historical portrait and cross-collection behaviour.
    Callers preparing newly generated atlases can opt into a stricter minimum
    attachment size without changing extraction of existing portrait assets.
    """

    if minimum_attachment_pixels < 0 or minimum_attachment_ratio < 0:
        raise ValueError("Attachment thresholds must be non-negative")

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
    minimum_attachment_size = max(
        minimum_attachment_pixels,
        round(primary_size * minimum_attachment_ratio),
    )
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


def validate_portrait_alpha_margin(image: Image.Image, character_id: str) -> None:
    """Ensure portrait resizing did not clip antialiased costume details."""

    bounds = alpha_bounds(image.getchannel("A"))
    if bounds is None:
        raise ValueError(f"Portrait for {character_id} is fully transparent")
    left, top, right, bottom = bounds
    margins = (left, top, image.width - right, image.height - bottom)
    if min(margins) < PORTRAIT_ALPHA_MARGIN:
        raise ValueError(
            f"Portrait for {character_id} clips after resizing: alpha margins "
            f"left/top/right/bottom={margins}, minimum {PORTRAIT_ALPHA_MARGIN}px"
        )


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


def prepare_sheets(
    require_helluva: bool,
    require_hazbin_expansion: bool,
) -> list[PreparedSheet]:
    """Load complete collections and validate every configured 6x4 cell."""

    validate_collection_definitions(COLLECTIONS)
    prepared: list[PreparedSheet] = []

    # Validate every atlas before touching a published portrait. Optional packs
    # are all-or-nothing so a partial generation pass cannot publish mixed rows.
    for collection in COLLECTIONS:
        force_optional_collection = (
            (collection.name == "Helluva Boss" and require_helluva)
            or (
                collection.name == "Hazbin Hotel extended roster"
                and require_hazbin_expansion
            )
        )
        missing_paths = [
            collection.sheet_dir / sheet_name
            for sheet_name, _ in collection.sheets
            if not (collection.sheet_dir / sheet_name).is_file()
        ]
        if missing_paths:
            diagnostic = ", ".join(relative_to_root(path) for path in missing_paths)
            if collection.required or force_optional_collection:
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
                if source.mode != "RGBA":
                    raise ValueError(
                        f"{relative_to_root(sheet_path)} must be an RGBA PNG, "
                        f"got mode {source.mode}"
                    )
                sheet = source.copy()
            cell_width, cell_height = validate_sheet(
                sheet,
                relative_to_root(sheet_path),
                strict_alpha_margins=collection.strict_alpha_margins,
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
                validate_portrait_alpha_margin(portrait, character_id)
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
    parser.add_argument(
        "--require-hazbin-expansion",
        action="store_true",
        help="fail when any extended Hazbin roster atlas is not available",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    try:
        prepared = prepare_sheets(
            require_helluva=args.require_helluva,
            require_hazbin_expansion=args.require_hazbin_expansion,
        )
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
