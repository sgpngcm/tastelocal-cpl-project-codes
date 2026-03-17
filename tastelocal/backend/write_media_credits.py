import argparse
import re
from itertools import cycle
from pathlib import Path
from urllib.parse import parse_qs, urlparse

from upgrade_media_real import EXTENSIONS, PROFILE_ROTATION, SOURCE_URLS, classify_theme


def title_case_slug(value: str) -> str:
    parts = [p for p in value.replace("_", "-").split("-") if p]
    return " ".join(word.capitalize() for word in parts)


def extract_optional_attribution(source_url: str) -> str:
    """
    Builds a best-effort optional attribution line from the Pexels download URL.
    Example:
        https://...?...&dl=pexels-arda-kaykisiz-672105204-29353012.jpg&fm=jpg
    -> 'Photo by Arda Kaykisiz on Pexels'
    """
    try:
        parsed = urlparse(source_url)
        qs = parse_qs(parsed.query)
        dl_value = qs.get("dl", [""])[0]
        if not dl_value:
            return "Photo source from Pexels"

        name_part = Path(dl_value).stem  # pexels-arda-kaykisiz-672105204-29353012
        name_part = re.sub(r"^pexels-", "", name_part)
        name_part = re.sub(r"-\d+(?:-\d+)*$", "", name_part).strip("-")

        if not name_part:
            return "Photo source from Pexels"

        photographer = title_case_slug(name_part)
        return f"Photo by {photographer} on Pexels"
    except Exception:
        return "Photo source from Pexels"


def iter_media_files(media_dir: Path):
    for path in sorted(media_dir.rglob("*")):
        if path.is_file() and path.suffix.lower() in EXTENSIONS:
            yield path


def build_rows(media_dir: Path, skip_profiles: bool):
    profile_cycle = cycle(PROFILE_ROTATION)
    rows = []

    for path in iter_media_files(media_dir):
        rel = path.relative_to(media_dir)
        rel_lower = str(rel).lower().replace("\\", "/")

        if "/vendors/logos/" in rel_lower:
            continue

        if skip_profiles and "/profiles/" in rel_lower:
            continue

        theme = classify_theme(rel, profile_cycle)
        if theme is None:
            continue

        source_url = SOURCE_URLS.get(theme, "")
        attribution = extract_optional_attribution(source_url)

        rows.append(
            {
                "file": str(rel).replace("\\", "/"),
                "theme": theme,
                "source_url": source_url,
                "attribution": attribution,
            }
        )

    return rows


def write_markdown(output_path: Path, rows: list[dict], media_dir: Path):
    unique_sources = []
    seen = set()

    for row in rows:
        key = (row["theme"], row["source_url"], row["attribution"])
        if key not in seen:
            seen.add(key)
            unique_sources.append(row)

    lines = []
    lines.append("# media_credits")
    lines.append("")
    lines.append(f"Generated for media directory: `{media_dir}`")
    lines.append("")
    lines.append("This file lists the source image used for each replaced media file.")
    lines.append("Attribution lines are optional and can be used in project documentation if desired.")
    lines.append("")
    lines.append("## Source Images")
    lines.append("")
    lines.append("| Theme | Source Image URL | Optional Attribution |")
    lines.append("|---|---|---|")

    for row in sorted(unique_sources, key=lambda x: x["theme"]):
        lines.append(
            f"| `{row['theme']}` | {row['source_url']} | {row['attribution']} |"
        )

    lines.append("")
    lines.append("## File-to-Source Mapping")
    lines.append("")
    lines.append("| Media File | Theme | Source Image URL | Optional Attribution |")
    lines.append("|---|---|---|---|")

    for row in rows:
        lines.append(
            f"| `{row['file']}` | `{row['theme']}` | {row['source_url']} | {row['attribution']} |"
        )

    lines.append("")
    lines.append("## Suggested Attribution Block")
    lines.append("")
    lines.append("You can adapt lines from the table above, for example:")
    lines.append("")
    lines.append("- Photo by Arda Kaykisiz on Pexels")
    lines.append("- Photo by Namzy on Pexels")
    lines.append("- Photo by Cottonbro on Pexels")
    lines.append("")

    output_path.write_text("\n".join(lines), encoding="utf-8")


def main():
    parser = argparse.ArgumentParser(
        description="Generate a media_credits.md file for images replaced by upgrade_media_real.py"
    )
    parser.add_argument(
        "--media-dir",
        required=True,
        help="Path to the extracted media folder used by upgrade_media_real.py",
    )
    parser.add_argument(
        "--output",
        default="media_credits.md",
        help="Output markdown filename or path. Default: media_credits.md",
    )
    parser.add_argument(
        "--skip-profiles",
        action="store_true",
        help="Skip profile image rows, matching a --skip-profiles media upgrade run",
    )
    args = parser.parse_args()

    media_dir = Path(args.media_dir).resolve()
    if not media_dir.exists():
        raise FileNotFoundError(f"Media directory not found: {media_dir}")

    output_path = Path(args.output)
    if not output_path.is_absolute():
        output_path = media_dir.parent / output_path

    rows = build_rows(media_dir, skip_profiles=args.skip_profiles)
    write_markdown(output_path, rows, media_dir)

    print(f"Done. Wrote {output_path}")
    print(f"Mapped {len(rows)} media files.")


if __name__ == "__main__":
    main()