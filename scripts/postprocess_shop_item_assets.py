from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "tmp" / "imagegen" / "shop-items-api"
OUT_DIR = ROOT / "src" / "static" / "shop-items"
PREVIEW_PATH = ROOT / ".local-data" / "shop-item-assets-preview.webp"
SIZE = 512


def detect_key_color(image: Image.Image) -> tuple[int, int, int]:
    rgb = image.convert("RGB")
    samples: list[tuple[int, int, int]] = []
    width, height = rgb.size
    px = rgb.load()
    step = max(1, min(width, height) // 80)
    for x in range(0, width, step):
        samples.append(px[x, 0])
        samples.append(px[x, height - 1])
    for y in range(0, height, step):
        samples.append(px[0, y])
        samples.append(px[width - 1, y])

    buckets: dict[tuple[int, int, int], int] = {}
    for r, g, b in samples:
        key = (round(r / 8) * 8, round(g / 8) * 8, round(b / 8) * 8)
        buckets[key] = buckets.get(key, 0) + 1
    return max(buckets.items(), key=lambda item: item[1])[0]


def remove_chroma_key(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    if rgba.getchannel("A").getbbox() != (0, 0, rgba.width, rgba.height):
        return rgba

    key = detect_key_color(rgba)
    is_green_key = key[1] > 180 and key[1] > key[0] * 1.8 and key[1] > key[2] * 1.8
    is_magenta_key = key[0] > 180 and key[2] > 180 and key[0] > key[1] * 1.8 and key[2] > key[1] * 1.8
    # Only auto-key obvious chroma backgrounds. Normal opaque generated assets
    # should pass through unchanged.
    if not (is_green_key or is_magenta_key):
        return rgba

    px = rgba.load()
    transparent = 26
    opaque = 150
    for y in range(rgba.height):
        for x in range(rgba.width):
            r, g, b, a = px[x, y]
            distance = ((r - key[0]) ** 2 + (g - key[1]) ** 2 + (b - key[2]) ** 2) ** 0.5
            if distance <= transparent:
                px[x, y] = (r, g, b, 0)
                continue
            if distance < opaque:
                alpha = int(255 * (distance - transparent) / (opaque - transparent))
                # Despill bright chroma fringes without dulling the object.
                if is_green_key:
                    g = min(g, int((r + b) * 0.58) + 30)
                elif is_magenta_key:
                    r = min(r, int((g + b) * 0.7) + 28)
                    b = min(b, int((r + g) * 0.7) + 28)
                px[x, y] = (r, g, b, min(a, alpha))
    return rgba


def largest_component_mask(mask: Image.Image) -> tuple[Image.Image, tuple[int, int, int, int]] | None:
    px = mask.load()
    width, height = mask.size
    seen = bytearray(width * height)
    best_points: list[tuple[int, int]] = []
    best_bbox: tuple[int, int, int, int] | None = None

    for y in range(height):
        for x in range(width):
            index = y * width + x
            if seen[index] or px[x, y] <= 14:
                continue

            q: deque[tuple[int, int]] = deque([(x, y)])
            seen[index] = 1
            points: list[tuple[int, int]] = []
            min_x = max_x = x
            min_y = max_y = y

            while q:
                cx, cy = q.popleft()
                points.append((cx, cy))
                min_x = min(min_x, cx)
                max_x = max(max_x, cx)
                min_y = min(min_y, cy)
                max_y = max(max_y, cy)

                for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
                    if nx < 0 or nx >= width or ny < 0 or ny >= height:
                        continue
                    nindex = ny * width + nx
                    if seen[nindex] or px[nx, ny] <= 14:
                        continue
                    seen[nindex] = 1
                    q.append((nx, ny))

            if len(points) > len(best_points):
                best_points = points
                best_bbox = (min_x, min_y, max_x + 1, max_y + 1)

    if best_bbox is None:
        return None

    component = Image.new("L", mask.size, 0)
    out_px = component.load()
    for x, y in best_points:
        out_px[x, y] = 255

    return component.filter(ImageFilter.GaussianBlur(0.25)), best_bbox


def keep_largest_component(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    alpha = rgba.getchannel("A")
    component = largest_component_mask(alpha)
    if component is None:
        return rgba

    component_mask, _ = component
    cleaned_alpha = Image.composite(alpha, Image.new("L", alpha.size, 0), component_mask)
    cleaned = rgba.copy()
    cleaned.putalpha(cleaned_alpha)
    return cleaned


def normalize_asset(path: Path) -> Path:
    image = keep_largest_component(remove_chroma_key(Image.open(path)))
    bbox = image.getchannel("A").getbbox()
    if bbox is None:
        raise ValueError(f"No visible subject in {path}")

    left, top, right, bottom = bbox
    subject_w = right - left
    subject_h = bottom - top
    padding = int(max(subject_w, subject_h) * 0.12)
    left = max(0, left - padding)
    top = max(0, top - padding)
    right = min(image.width, right + padding)
    bottom = min(image.height, bottom + padding)
    subject = image.crop((left, top, right, bottom))

    scale = min((SIZE * 0.86) / subject.width, (SIZE * 0.86) / subject.height)
    new_size = (max(1, int(subject.width * scale)), max(1, int(subject.height * scale)))
    subject = subject.resize(new_size, Image.Resampling.LANCZOS)

    canvas = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    x = (SIZE - subject.width) // 2
    y = (SIZE - subject.height) // 2
    shadow = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    shadow_alpha = subject.getchannel("A").filter(ImageFilter.GaussianBlur(10))
    shadow_layer = Image.new("RGBA", subject.size, (0, 0, 0, 70))
    shadow_layer.putalpha(shadow_alpha.point(lambda value: int(value * 0.35)))
    shadow.alpha_composite(shadow_layer, (x, y + 12))
    canvas.alpha_composite(shadow)
    canvas.alpha_composite(subject, (x, y))

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    output = OUT_DIR / f"{path.stem.replace('_source', '')}.webp"
    canvas.save(output, "WEBP", quality=94, method=6)
    return output


def build_preview(paths: list[Path]) -> None:
    PREVIEW_PATH.parent.mkdir(parents=True, exist_ok=True)
    cell = 170
    preview = Image.new("RGBA", (cell * 5, cell * 4), (245, 248, 251, 255))
    for index, path in enumerate(paths):
        asset = Image.open(path).convert("RGBA").resize((142, 142), Image.Resampling.LANCZOS)
        x = (index % 5) * cell + 14
        y = (index // 5) * cell + 14
        tile = Image.new("RGBA", (142, 142), (255, 255, 255, 255))
        mask = Image.new("L", (142, 142), 0)
        ImageDraw.Draw(mask).rounded_rectangle((0, 0, 141, 141), radius=28, fill=255)
        preview.alpha_composite(tile, (x, y))
        preview.alpha_composite(asset, (x, y))
    preview.convert("RGB").save(PREVIEW_PATH, "WEBP", quality=92, method=6)


def main() -> None:
    sources = sorted(SOURCE_DIR.glob("*_source.png"))
    if not sources:
        raise SystemExit(f"No source files found in {SOURCE_DIR}")

    outputs = [normalize_asset(path) for path in sources]
    build_preview(outputs)
    for output in outputs:
        print(output.relative_to(ROOT))
    print(PREVIEW_PATH.relative_to(ROOT))


if __name__ == "__main__":
    main()
