import argparse
import hashlib
import shutil
from itertools import cycle
from pathlib import Path

import requests
from PIL import Image, ImageEnhance, ImageOps

# Curated real-life food / café / market / portrait photography
SOURCE_URLS = {
    "hawker": "https://images.pexels.com/photos/30210592/pexels-photo-30210592.jpeg?cs=srgb&dl=pexels-namzy-419907319-30210592.jpg&fm=jpg",
    "pastry": "https://images.pexels.com/photos/29353012/pexels-photo-29353012.jpeg?cs=srgb&dl=pexels-arda-kaykisiz-672105204-29353012.jpg&fm=jpg",
    "coffee_pastry": "https://images.pexels.com/photos/30573107/pexels-photo-30573107.jpeg?cs=srgb&dl=pexels-esra-afsar-123882149-30573107.jpg&fm=jpg",
    "ramen": "https://images.pexels.com/photos/31302293/pexels-photo-31302293.jpeg?cs=srgb&dl=pexels-emanuel-pedro-1266938328-31302293.jpg&fm=jpg",
    "beer": "https://images.pexels.com/photos/1267700/pexels-photo-1267700.jpeg?cs=srgb&dl=pexels-elevate-1267700.jpg&fm=jpg",
    "tacos": "https://images.pexels.com/photos/34289262/pexels-photo-34289262.jpeg?cs=srgb&dl=pexels-abner-velazquez-1035709527-34289262.jpg&fm=jpg",
    "vegan": "https://images.pexels.com/photos/4409271/pexels-photo-4409271.jpeg?cs=srgb&dl=pexels-nadezhda-moryak-4409271.jpg&fm=jpg",
    "seafood": "https://images.pexels.com/photos/35290664/pexels-photo-35290664.png?cs=srgb&dl=pexels-efeburakbaydar-35290664.jpg&fm=jpg",
    "tea": "https://images.pexels.com/photos/8748538/pexels-photo-8748538.jpeg?cs=srgb&dl=pexels-cottonbro-8748538.jpg&fm=jpg",
    "korean": "https://images.pexels.com/photos/28977930/pexels-photo-28977930.jpeg?cs=srgb&dl=pexels-japy-28977930.jpg&fm=jpg",
    "market": "https://images.pexels.com/photos/7353558/pexels-photo-7353558.jpeg?cs=srgb&dl=pexels-frank-barning-744539-7353558.jpg&fm=jpg",
    "dessert": "https://images.pexels.com/photos/10581380/pexels-photo-10581380.jpeg?cs=srgb&dl=pexels-maide-arslan-128712163-10581380.jpg&fm=jpg",
    "kopi_toast": "https://images.pexels.com/photos/17116057/pexels-photo-17116057.jpeg?cs=srgb&dl=pexels-chiyoung-17116057.jpg&fm=jpg",
    "portrait_female_owner": "https://images.pexels.com/photos/10375825/pexels-photo-10375825.jpeg?cs=srgb&dl=pexels-rdne-10375825.jpg&fm=jpg",
    "portrait_barista": "https://images.pexels.com/photos/13233963/pexels-photo-13233963.jpeg?cs=srgb&dl=pexels-masudriguez-13233963.jpg&fm=jpg",
    "portrait_male": "https://images.pexels.com/photos/13610289/pexels-photo-13610289.jpeg?cs=srgb&dl=pexels-oktay-koseoglu-42034955-13610289.jpg&fm=jpg",
    "portrait_female_cafe": "https://images.pexels.com/photos/31977405/pexels-photo-31977405.jpeg?cs=srgb&dl=pexels-aminnaderloei-31977405.jpg&fm=jpg",
}

PROFILE_ROTATION = [
    "portrait_female_owner",
    "portrait_barista",
    "portrait_male",
    "portrait_female_cafe",
]

EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}


def download_sources(cache_dir: Path) -> dict[str, Path]:
    cache_dir.mkdir(parents=True, exist_ok=True)
    session = requests.Session()
    session.headers.update(
        {
            "User-Agent": "Mozilla/5.0 TasteLocal Media Upgrade",
            "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        }
    )

    local_paths = {}
    for key, url in SOURCE_URLS.items():
        suffix = ".jpg"
        out_path = cache_dir / f"{key}{suffix}"
        if not out_path.exists():
            print(f"Downloading source: {key}")
            resp = session.get(url, timeout=60)
            resp.raise_for_status()
            out_path.write_bytes(resp.content)
        local_paths[key] = out_path
    return local_paths


def classify_theme(rel_path: Path, profile_cycle) -> str | None:
    rel = str(rel_path).lower().replace("\\", "/")
    name = rel_path.stem.lower()

    if "/vendors/logos/" in rel:
        return None

    if "/profiles/" in rel:
        return next(profile_cycle)

    if any(k in name for k in ["ramen", "sushi", "omakase"]):
        return "ramen"

    if any(k in name for k in ["korean", "bbq", "soju"]):
        return "korean"

    if any(k in name for k in ["vegan", "vegetarian"]):
        return "vegan"

    if any(k in name for k in ["taco", "mexican", "fiesta"]):
        return "tacos"

    if any(k in name for k in ["seafood", "bay"]):
        return "seafood"

    if any(k in name for k in ["tea", "chai", "matcha", "pavilion"]):
        return "tea"

    if any(k in name for k in ["beer", "brew", "craftbrew"]):
        return "beer"

    if any(k in name for k in ["wet-market", "wet_market", "market-to-table", "market", "food-trail", "spice-trail"]):
        return "market"

    if any(k in name for k in ["kopi", "kaya", "toast", "kopitiam", "heritage-kopitiam"]):
        return "kopi_toast"

    if any(k in name for k in ["dessert", "sweet", "cake", "pastry", "bakery", "croissant"]):
        return "dessert"

    if any(k in name for k in ["cafe", "café", "blossom", "coffee"]):
        return "pastry"

    if any(k in name for k in [
        "hawker", "street", "satay", "wok", "peranakan", "spice", "curry", "kebab",
        "nasi", "tiong", "chinatown", "kampong", "little-india", "heritage",
        "local", "food-culture", "discovery-walk"
    ]):
        return "hawker"

    if "/blog/" in rel:
        if any(k in name for k in ["coffee", "kaya", "toast"]):
            return "kopi_toast"
        if any(k in name for k in ["vegetarian", "vegan"]):
            return "vegan"
        if any(k in name for k in ["durian", "pandan", "dessert"]):
            return "dessert"
        if any(k in name for k in ["indian", "malay", "peranakan", "hawker", "chinatown", "festival", "night", "street", "local"]):
            return "hawker"
        return "market"

    if "/experiences/" in rel or "/vendors/" in rel:
        return "hawker"

    return "pastry"


def build_variant(image: Image.Image, target_size: tuple[int, int], token: str) -> Image.Image:
    digest = hashlib.sha256(token.encode("utf-8")).hexdigest()
    zoom_step = int(digest[:2], 16) / 255.0
    center_x = 0.35 + (int(digest[2:4], 16) / 255.0) * 0.30
    center_y = 0.35 + (int(digest[4:6], 16) / 255.0) * 0.30
    zoom = 1.02 + zoom_step * 0.18

    w, h = image.size
    crop_w = int(w / zoom)
    crop_h = int(h / zoom)

    left = max(0, min(w - crop_w, int((w - crop_w) * center_x)))
    top = max(0, min(h - crop_h, int((h - crop_h) * center_y)))
    cropped = image.crop((left, top, left + crop_w, top + crop_h))

    fitted = ImageOps.fit(
        cropped,
        target_size,
        method=Image.Resampling.LANCZOS,
        centering=(center_x, center_y),
    )

    fitted = ImageEnhance.Color(fitted).enhance(1.08)
    fitted = ImageEnhance.Contrast(fitted).enhance(1.06)
    fitted = ImageEnhance.Sharpness(fitted).enhance(1.04)
    return fitted


def replace_image(target_path: Path, source_path: Path):
    with Image.open(target_path) as target_img:
        target_size = target_img.size

    with Image.open(source_path) as source_img:
        source_img = source_img.convert("RGB")
        upgraded = build_variant(source_img, target_size, str(target_path))

    upgraded.save(target_path, format="PNG", optimize=True)


def main():
    parser = argparse.ArgumentParser(description="Upgrade TasteLocal media with real-life photography.")
    parser.add_argument("--media-dir", required=True, help="Path to the extracted media folder")
    parser.add_argument("--backup", action="store_true", help="Create a backup copy before overwriting")
    parser.add_argument("--skip-profiles", action="store_true", help="Do not replace profile avatars")
    args = parser.parse_args()

    media_dir = Path(args.media_dir).resolve()
    if not media_dir.exists():
        raise FileNotFoundError(f"Media directory not found: {media_dir}")

    if args.backup:
        backup_dir = media_dir.parent / f"{media_dir.name}_backup_before_real_upgrade"
        if not backup_dir.exists():
            shutil.copytree(media_dir, backup_dir)
            print(f"Backup created: {backup_dir}")

    cache_dir = media_dir.parent / "_real_photo_cache"
    source_paths = download_sources(cache_dir)

    profile_cycle = cycle(PROFILE_ROTATION)
    replaced = 0
    skipped = 0

    for path in sorted(media_dir.rglob("*")):
        if not path.is_file() or path.suffix.lower() not in EXTENSIONS:
            continue

        rel = path.relative_to(media_dir)
        rel_lower = str(rel).lower().replace("\\", "/")

        if "/vendors/logos/" in rel_lower:
            skipped += 1
            continue

        if args.skip_profiles and "/profiles/" in rel_lower:
            skipped += 1
            continue

        theme = classify_theme(rel, profile_cycle)
        if theme is None:
            skipped += 1
            continue

        source_path = source_paths[theme]
        replace_image(path, source_path)
        replaced += 1
        print(f"Replaced [{theme}] -> {rel}")

    print(f"\nDone. Replaced {replaced} files, skipped {skipped} files.")
    print("Vendor logos were intentionally preserved.")


if __name__ == "__main__":
    main()