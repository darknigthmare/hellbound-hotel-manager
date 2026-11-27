"""Verify accepted static masters and exports without modifying image pixels."""
import argparse
import hashlib
import json
from pathlib import Path
from PIL import Image


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    here = Path(__file__).resolve().parent
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=here.parent.parent)
    parser.add_argument("--register", type=Path, default=here / "production-v5-register.json")
    parser.add_argument("--output", type=Path, default=here / "QA_STATIC_IMAGES_V5_2026-11-25.json")
    args = parser.parse_args()
    register = json.loads(args.register.read_text())
    previous = json.loads(args.output.read_text()) if args.output.exists() else {}
    cache = {row["assetId"]: row for row in previous.get("images", [])}
    results = []
    for asset in register["assets"]:
        master = args.root / asset["masterPath"]
        exported = args.root / asset["exportPath"]
        master_sha, export_sha = digest(master), digest(exported)
        if (master_sha, export_sha) != (asset["masterSha256"], asset["exportSha256"]):
            raise ValueError("Current file differs from consolidated record: " + asset["assetId"])
        cached = cache.get(asset["assetId"])
        if cached and (cached["masterSha256"], cached["exportSha256"]) == (master_sha, export_sha):
            results.append(cached)
            continue
        with Image.open(master) as original, Image.open(exported) as webp:
            if original.format != "PNG" or webp.format != "WEBP":
                raise ValueError("PNG master and WebP export required: " + asset["assetId"])
            original.load()
            webp.load()
            a, b = original.convert("RGBA"), webp.convert("RGBA")
            if a.size != b.size or a.tobytes() != b.tobytes():
                raise ValueError("Decoded RGBA pixels differ: " + asset["assetId"])
            if a.size != (asset["width"], asset["height"]):
                raise ValueError("Dimensions differ from record: " + asset["assetId"])
            alpha = a.getchannel("A")
            histogram = alpha.histogram()
            alpha_range = alpha.getextrema()
            pixels = a.width * a.height
            if asset["category"] in {"character", "enemy", "costume", "prop"} and alpha_range[0] != 0:
                raise ValueError("Isolated sprite lacks transparency: " + asset["assetId"])
            if asset["category"] in {"story", "stage"} and alpha_range != (255, 255):
                raise ValueError("Scene or stage is not opaque: " + asset["assetId"])
            results.append({
                "assetId": asset["assetId"], "master": asset["masterPath"], "export": asset["exportPath"],
                "masterSha256": master_sha, "exportSha256": export_sha,
                "width": a.width, "height": a.height, "masterMode": original.mode,
                "exportMode": webp.mode, "decodedRgbaPixelsEqual": True,
                "alphaRange": alpha_range, "transparentFraction": histogram[0] / pixels,
                "opaqueFraction": histogram[255] / pixels,
            })
    report = {
        "schemaVersion": 1, "date": "2026-11-25",
        "registerSha256": digest(args.register), "acceptedAssignmentsChecked": len(results),
        "distinctDrawingsChecked": len({a["masterSha256"] for a in results}),
        "productionFilesChecked": len({p for a in results for p in [a["master"], a["export"]]}),
        "encodedChecksums": "passed", "decodedPixelEquality": "passed",
        "dimensionsAndAlpha": "passed", "imagePixelsModified": False,
        "visualIdentityReview": "Recorded in production-v5-register.json; this check compares image data only.",
        "images": results,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({"output": str(args.output), "drawings": report["distinctDrawingsChecked"], "files": report["productionFilesChecked"], "decodedPixelEquality": "passed"}))


if __name__ == "__main__":
    main()
