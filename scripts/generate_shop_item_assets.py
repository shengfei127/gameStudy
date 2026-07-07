from __future__ import annotations

from pathlib import Path
from random import Random
from typing import Callable

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "src" / "static" / "shop-items"
PREVIEW_PATH = ROOT / ".local-data" / "shop-item-assets-preview.webp"

SIZE = 512
SCALE = 2
CANVAS = SIZE * SCALE


def rgba(hex_color: str, alpha: int = 255) -> tuple[int, int, int, int]:
    value = hex_color.lstrip("#")
    return (int(value[0:2], 16), int(value[2:4], 16), int(value[4:6], 16), alpha)


def mix(a: tuple[int, int, int, int], b: tuple[int, int, int, int], amount: float) -> tuple[int, int, int, int]:
    return tuple(int(a[i] + (b[i] - a[i]) * amount) for i in range(4))  # type: ignore[return-value]


def pt(x: float) -> int:
    return int(round(x * SCALE))


def box(values: tuple[float, float, float, float]) -> tuple[int, int, int, int]:
    return tuple(pt(v) for v in values)  # type: ignore[return-value]


class Icon:
    def __init__(self, item_id: str, theme: str, accent: str):
        self.item_id = item_id
        self.theme = rgba(theme)
        self.accent = rgba(accent)
        self.img = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
        self.draw = ImageDraw.Draw(self.img, "RGBA")
        self.rng = Random(item_id)

    def glow(self, center: tuple[float, float], radius: float, color: tuple[int, int, int, int], power: float = 0.7) -> None:
        layer = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
        d = ImageDraw.Draw(layer, "RGBA")
        steps = 26
        for i in range(steps, 0, -1):
            t = i / steps
            alpha = int(color[3] * power * (1 - t) ** 1.55)
            if alpha <= 0:
                continue
            r = radius * t
            d.ellipse(box((center[0] - r, center[1] - r, center[0] + r, center[1] + r)), fill=color[:3] + (alpha,))
        self.img.alpha_composite(layer)

    def floor_shadow(self, y: float = 398, width: float = 270, height: float = 54, alpha: int = 90) -> None:
        layer = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
        d = ImageDraw.Draw(layer, "RGBA")
        d.ellipse(box((256 - width / 2, y - height / 2, 256 + width / 2, y + height / 2)), fill=(8, 12, 20, alpha))
        layer = layer.filter(ImageFilter.GaussianBlur(pt(12)))
        self.img.alpha_composite(layer)

    def rounded(self, xy: tuple[float, float, float, float], radius: float, fill, outline=None, width: float = 1) -> None:
        self.draw.rounded_rectangle(box(xy), radius=pt(radius), fill=fill, outline=outline, width=pt(width))

    def ellipse(self, xy: tuple[float, float, float, float], fill, outline=None, width: float = 1) -> None:
        self.draw.ellipse(box(xy), fill=fill, outline=outline, width=pt(width))

    def line(self, points: list[tuple[float, float]], fill, width: float, joint: str = "curve") -> None:
        self.draw.line([(pt(x), pt(y)) for x, y in points], fill=fill, width=pt(width), joint=joint)

    def polygon(self, points: list[tuple[float, float]], fill, outline=None) -> None:
        self.draw.polygon([(pt(x), pt(y)) for x, y in points], fill=fill, outline=outline)

    def star(self, cx: float, cy: float, outer: float, inner: float, points: int, fill, rotation: float = -90) -> None:
        import math

        coords = []
        for i in range(points * 2):
            radius = outer if i % 2 == 0 else inner
            angle = math.radians(rotation + i * 180 / points)
            coords.append((cx + math.cos(angle) * radius, cy + math.sin(angle) * radius))
        self.polygon(coords, fill)

    def rotated_layer(self, angle: float, painter: Callable[[ImageDraw.ImageDraw], None]) -> None:
        layer = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
        painter(ImageDraw.Draw(layer, "RGBA"))
        rotated = layer.rotate(angle, resample=Image.Resampling.BICUBIC, center=(pt(256), pt(256)))
        self.img.alpha_composite(rotated)

    def save(self) -> Path:
        self.img = self.img.filter(ImageFilter.UnsharpMask(radius=1.2, percent=105, threshold=3))
        final = self.img.resize((SIZE, SIZE), Image.Resampling.LANCZOS)
        OUT_DIR.mkdir(parents=True, exist_ok=True)
        output = OUT_DIR / f"{self.item_id}.webp"
        final.save(output, "WEBP", quality=92, method=6)
        return output


def draw_flame_headband(icon: Icon) -> None:
    icon.glow((260, 240), 210, icon.accent, 0.62)
    icon.floor_shadow()

    def band(d: ImageDraw.ImageDraw) -> None:
        d.rounded_rectangle(box((120, 240, 392, 306)), radius=pt(28), fill=rgba("#9f1239", 245))
        d.rounded_rectangle(box((138, 252, 374, 286)), radius=pt(17), fill=rgba("#ef4444", 255))
        d.rounded_rectangle(box((160, 260, 352, 271)), radius=pt(5), fill=rgba("#fed7aa", 120))
        d.ellipse(box((224, 230, 286, 292)), fill=rgba("#facc15", 245), outline=rgba("#fff7ed", 210), width=pt(3))

    icon.rotated_layer(-6, band)
    for cx, height, color in [(176, 110, "#f97316"), (252, 134, "#ef4444"), (330, 104, "#f59e0b")]:
        icon.polygon([(cx - 34, 246), (cx - 6, 246 - height), (cx + 8, 202), (cx + 36, 246)], rgba(color, 232))
        icon.polygon([(cx - 10, 238), (cx + 2, 190), (cx + 18, 238)], rgba("#fff7ad", 170))


def draw_scholar_crown(icon: Icon) -> None:
    icon.glow((256, 250), 220, rgba("#facc15", 255), 0.58)
    icon.floor_shadow(404, 248, 46)
    base = rgba("#b45309", 255)
    gold = rgba("#facc15", 255)
    icon.rounded((132, 276, 380, 344), 24, base, outline=rgba("#fff7cc", 170), width=3)
    icon.rounded((154, 286, 358, 320), 16, gold)
    tips = [(142, 282, 176, 164, 214, 284), (204, 284, 256, 126, 308, 284), (298, 284, 336, 164, 372, 282)]
    for pts in tips:
        icon.polygon([(pts[0], pts[1]), (pts[2], pts[3]), (pts[4], pts[5])], rgba("#f59e0b", 255), outline=rgba("#fff7cc", 170))
    for cx, cy, r, color in [(176, 164, 18, "#fef08a"), (256, 126, 22, "#fff7ad"), (336, 164, 18, "#fef08a"), (256, 302, 16, "#4f46e5")]:
        icon.ellipse((cx - r, cy - r, cx + r, cy + r), rgba(color, 245), outline=rgba("#ffffff", 190), width=2)
    for cx in [180, 222, 290, 332]:
        icon.star(cx, 230, 12, 5, 5, rgba("#fff7ad", 210))


def draw_cloud_cape(icon: Icon) -> None:
    icon.glow((252, 236), 220, icon.accent, 0.5)
    icon.floor_shadow(416, 270, 56)
    icon.polygon([(162, 150), (350, 142), (410, 392), (258, 430), (106, 392)], rgba("#0e7490", 246))
    icon.polygon([(184, 174), (256, 148), (328, 172), (286, 410), (226, 410)], rgba("#22d3ee", 155))
    for x in [166, 210, 302, 346]:
        icon.line([(x, 184), (250 + (x - 256) * 0.28, 404)], rgba("#e0faff", 92), 3)
    icon.rounded((192, 126, 320, 178), 25, rgba("#e0f2fe", 245), outline=rgba("#ffffff", 210), width=2)
    for cx, cy, r in [(190, 288, 24), (220, 272, 30), (254, 286, 24), (302, 334, 22), (332, 320, 30), (366, 336, 22)]:
        icon.ellipse((cx - r, cy - r, cx + r, cy + r), rgba("#ecfeff", 170))


def draw_book_pack(icon: Icon) -> None:
    icon.glow((248, 260), 210, rgba("#fdba74", 255), 0.44)
    icon.floor_shadow()
    icon.rounded((154, 162, 356, 386), 36, rgba("#7c2d12", 255), outline=rgba("#fed7aa", 125), width=3)
    icon.rounded((176, 178, 334, 354), 28, rgba("#9a3412", 255))
    icon.rounded((198, 228, 314, 356), 18, rgba("#431407", 195), outline=rgba("#fdba74", 120), width=2)
    for x, color in [(184, "#fef3c7"), (218, "#dc2626"), (254, "#2563eb"), (292, "#16a34a")]:
        icon.rounded((x, 116, x + 30, 200), 8, rgba(color, 245), outline=rgba("#ffffff", 90), width=1)
    icon.line([(176, 186), (130, 254), (150, 340)], rgba("#451a03", 220), 14)
    icon.line([(336, 186), (382, 254), (362, 340)], rgba("#451a03", 220), 14)
    icon.ellipse((232, 254, 280, 302), rgba("#f59e0b", 220), outline=rgba("#fff7ad", 160), width=2)


def draw_ink_brush(icon: Icon) -> None:
    icon.glow((260, 260), 210, rgba("#94a3b8", 255), 0.38)
    icon.floor_shadow(404, 240, 44)
    icon.line([(166, 354), (318, 166)], rgba("#111827", 255), 24)
    icon.line([(178, 338), (306, 180)], rgba("#4b5563", 255), 10)
    icon.rounded((298, 142, 340, 202), 12, rgba("#d97706", 245), outline=rgba("#fff7ad", 150), width=2)
    icon.polygon([(326, 138), (372, 98), (358, 182)], rgba("#0f172a", 245))
    icon.polygon([(337, 148), (362, 116), (354, 174)], rgba("#334155", 190))
    for cx, cy, r in [(158, 368, 30), (126, 388, 18), (206, 374, 12)]:
        icon.ellipse((cx - r, cy - r, cx + r, cy + r), rgba("#020617", 190))


def draw_focus_staff(icon: Icon) -> None:
    icon.glow((270, 238), 230, icon.accent, 0.58)
    icon.floor_shadow()
    icon.line([(178, 384), (324, 138)], rgba("#1e3a8a", 255), 20)
    icon.line([(190, 366), (314, 156)], rgba("#93c5fd", 150), 6)
    icon.polygon([(324, 76), (384, 140), (340, 220), (276, 202), (262, 128)], rgba("#38bdf8", 226), outline=rgba("#e0f2fe", 190))
    icon.polygon([(324, 76), (340, 220), (302, 152)], rgba("#dbeafe", 130))
    icon.ellipse((276, 186, 356, 266), rgba("#1d4ed8", 190), outline=rgba("#bae6fd", 180), width=4)
    for cx, cy in [(250, 160), (382, 222), (210, 268)]:
        icon.star(cx, cy, 18, 7, 5, rgba("#e0f2fe", 210))


def draw_morning_aura(icon: Icon) -> None:
    icon.glow((256, 256), 230, rgba("#fde68a", 255), 0.68)
    icon.floor_shadow(408, 260, 48, 58)
    for angle in range(0, 360, 20):
        import math

        a = math.radians(angle)
        icon.line([(256 + math.cos(a) * 98, 256 + math.sin(a) * 98), (256 + math.cos(a) * 168, 256 + math.sin(a) * 168)], rgba("#f59e0b", 150), 7)
    for width, alpha, color in [(34, 220, "#f59e0b"), (18, 240, "#fde68a"), (6, 255, "#fff7ad")]:
        icon.ellipse((118, 118, 394, 394), (0, 0, 0, 0), outline=rgba(color, alpha), width=width)


def draw_perfect_aura(icon: Icon) -> None:
    icon.glow((256, 256), 230, rgba("#fda4af", 255), 0.64)
    icon.floor_shadow(410, 250, 42, 55)
    icon.ellipse((112, 130, 400, 382), (0, 0, 0, 0), outline=rgba("#be123c", 235), width=30)
    icon.ellipse((136, 154, 376, 358), (0, 0, 0, 0), outline=rgba("#fecdd3", 250), width=10)
    for cx, cy, rot in [(150, 168, 18), (366, 170, -15), (388, 300, 25), (126, 304, -20)]:
        icon.star(cx, cy, 30, 12, 5, rgba("#fff1f2", 235), rotation=rot)
        icon.star(cx, cy, 18, 7, 5, rgba("#fb7185", 190), rotation=rot)
    for cx, cy in [(248, 112), (300, 402), (206, 390)]:
        icon.ellipse((cx - 12, cy - 12, cx + 12, cy + 12), rgba("#fda4af", 230), outline=rgba("#ffffff", 190), width=2)


def draw_spark_effect(icon: Icon) -> None:
    icon.glow((256, 256), 230, rgba("#c4b5fd", 255), 0.7)
    icon.floor_shadow(408, 235, 36, 42)
    for i in range(34):
        angle = i * 0.52
        radius = 42 + i * 4.3
        import math

        cx = 256 + math.cos(angle) * radius
        cy = 260 + math.sin(angle) * radius * 0.72
        size = 7 + (i % 4) * 3
        color = rgba("#fef08a" if i % 3 == 0 else "#c4b5fd", 210)
        icon.star(cx, cy, size, size * 0.42, 5, color, rotation=i * 9)
    icon.ellipse((190, 194, 322, 326), (0, 0, 0, 0), outline=rgba("#7c3aed", 150), width=8)


def draw_cloud_effect(icon: Icon) -> None:
    icon.glow((256, 252), 230, rgba("#99f6e4", 255), 0.58)
    icon.floor_shadow(408, 260, 40, 44)
    layer = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer, "RGBA")
    for cx, cy, r, a in [
        (158, 250, 38, 190),
        (196, 218, 54, 210),
        (250, 238, 44, 190),
        (314, 220, 56, 210),
        (362, 258, 38, 190),
        (292, 310, 46, 160),
        (212, 318, 42, 160),
    ]:
        d.ellipse(box((cx - r, cy - r, cx + r, cy + r)), fill=rgba("#ecfeff", a))
    layer = layer.filter(ImageFilter.GaussianBlur(pt(5)))
    icon.img.alpha_composite(layer)
    icon.ellipse((140, 164, 382, 356), (0, 0, 0, 0), outline=rgba("#14b8a6", 165), width=10)


def draw_forest_wall(icon: Icon) -> None:
    icon.glow((254, 250), 220, rgba("#86efac", 255), 0.42)
    icon.floor_shadow(414, 270, 58)
    icon.rounded((126, 126, 386, 386), 28, rgba("#14532d", 248), outline=rgba("#bbf7d0", 125), width=3)
    icon.rounded((150, 150, 362, 362), 18, rgba("#166534", 235))
    for y in [218, 286]:
        icon.rounded((166, y, 346, y + 18), 8, rgba("#78350f", 240))
        for x in [184, 224, 264, 304]:
            icon.rounded((x, y - 48, x + 20, y), 5, rgba(["#fef3c7", "#22c55e", "#60a5fa", "#f97316"][(x // 40) % 4], 235))
    icon.polygon([(176, 344), (212, 250), (252, 344)], rgba("#052e16", 195))
    icon.polygon([(246, 344), (302, 218), (358, 344)], rgba("#052e16", 210))
    for cx, cy in [(204, 232), (304, 204), (332, 244)]:
        icon.ellipse((cx - 24, cy - 16, cx + 24, cy + 16), rgba("#86efac", 95))


def draw_dragon_wall(icon: Icon) -> None:
    icon.glow((260, 250), 230, rgba("#67e8f9", 255), 0.54)
    icon.floor_shadow(416, 285, 60)
    icon.rounded((118, 116, 394, 392), 30, rgba("#0e7490", 248), outline=rgba("#cffafe", 150), width=3)
    for y in range(150, 344, 38):
        for x in range(138, 364, 44):
            icon.ellipse((x, y, x + 52, y + 42), rgba("#155e75", 132), outline=rgba("#67e8f9", 70), width=1)
    icon.line([(166, 282), (202, 220), (256, 232), (292, 178), (346, 206), (366, 160)], rgba("#ecfeff", 210), 18)
    icon.line([(166, 282), (202, 220), (256, 232), (292, 178), (346, 206), (366, 160)], rgba("#0891b2", 240), 8)
    for cx, cy in [(204, 220), (292, 178), (346, 206)]:
        icon.star(cx, cy - 26, 18, 8, 3, rgba("#fef08a", 210), rotation=-90)


def draw_moon_window(icon: Icon) -> None:
    icon.glow((256, 240), 220, rgba("#c4b5fd", 255), 0.52)
    icon.floor_shadow(412, 240, 52)
    icon.rounded((142, 128, 370, 386), 32, rgba("#1e1b4b", 250), outline=rgba("#ddd6fe", 160), width=5)
    icon.rounded((166, 154, 346, 360), 24, rgba("#312e81", 255))
    icon.ellipse((222, 176, 302, 256), rgba("#f8fafc", 240))
    icon.ellipse((250, 158, 326, 238), rgba("#312e81", 255))
    icon.line([(256, 154), (256, 360)], rgba("#c4b5fd", 140), 5)
    icon.line([(166, 258), (346, 258)], rgba("#c4b5fd", 140), 5)
    for cx, cy in [(206, 190), (318, 286), (218, 316)]:
        icon.star(cx, cy, 9, 4, 5, rgba("#fefce8", 220))


def draw_sunrise_window(icon: Icon) -> None:
    icon.glow((256, 242), 230, rgba("#fed7aa", 255), 0.56)
    icon.floor_shadow(412, 245, 52)
    icon.rounded((142, 128, 370, 386), 32, rgba("#7c2d12", 250), outline=rgba("#ffedd5", 165), width=5)
    icon.rounded((166, 154, 346, 360), 24, rgba("#fb923c", 240))
    icon.ellipse((204, 202, 308, 306), rgba("#fef3c7", 240))
    icon.rounded((166, 256, 346, 360), 10, rgba("#7dd3fc", 180))
    icon.line([(256, 154), (256, 360)], rgba("#ffedd5", 150), 5)
    icon.line([(166, 260), (346, 260)], rgba("#ffedd5", 150), 5)
    for y in [286, 316, 342]:
        icon.line([(184, y), (330, y - 8)], rgba("#ffffff", 95), 3)


def draw_oak_desk(icon: Icon) -> None:
    icon.glow((256, 270), 210, rgba("#fcd34d", 255), 0.36)
    icon.floor_shadow(410, 276, 62)
    icon.polygon([(126, 250), (382, 224), (420, 292), (160, 330)], rgba("#92400e", 255), outline=rgba("#fde68a", 120))
    icon.polygon([(160, 330), (420, 292), (396, 350), (180, 382)], rgba("#78350f", 255))
    for x in [184, 356]:
        icon.rounded((x, 320, x + 24, 414), 8, rgba("#451a03", 245))
    icon.rounded((214, 210, 320, 260), 10, rgba("#f8fafc", 245), outline=rgba("#cbd5e1", 150), width=2)
    icon.line([(266, 212), (272, 258)], rgba("#60a5fa", 170), 3)
    for x in [170, 230, 294]:
        icon.line([(x, 262), (x + 74, 254)], rgba("#fbbf24", 110), 2)


def draw_focus_lamp(icon: Icon) -> None:
    icon.glow((288, 236), 230, rgba("#fef08a", 255), 0.66)
    icon.floor_shadow(410, 220, 50)
    icon.polygon([(248, 194), (364, 178), (334, 256), (216, 266)], rgba("#ca8a04", 255), outline=rgba("#fef9c3", 160))
    icon.polygon([(250, 204), (336, 192), (318, 236), (230, 246)], rgba("#fde68a", 220))
    icon.line([(274, 258), (236, 354)], rgba("#78350f", 255), 16)
    icon.rounded((184, 352, 294, 388), 18, rgba("#ca8a04", 255), outline=rgba("#fef9c3", 140), width=2)
    icon.polygon([(234, 260), (368, 290), (318, 398), (182, 374)], rgba("#fef08a", 60))


def draw_trophy_shelf(icon: Icon) -> None:
    icon.glow((254, 260), 210, rgba("#fde68a", 255), 0.44)
    icon.floor_shadow(414, 270, 56)
    icon.rounded((142, 308, 370, 336), 12, rgba("#78350f", 250), outline=rgba("#fde68a", 120), width=2)
    icon.rounded((164, 336, 190, 392), 8, rgba("#451a03", 240))
    icon.rounded((322, 336, 348, 392), 8, rgba("#451a03", 240))
    icon.ellipse((202, 142, 310, 248), rgba("#facc15", 255), outline=rgba("#fff7ad", 170), width=3)
    icon.rounded((220, 238, 292, 284), 12, rgba("#d97706", 255))
    icon.rounded((198, 282, 314, 312), 10, rgba("#facc15", 255))
    icon.line([(202, 188), (164, 204), (178, 246)], rgba("#facc15", 230), 12)
    icon.line([(310, 188), (348, 204), (334, 246)], rgba("#facc15", 230), 12)
    for cx, cy in [(176, 166), (342, 158), (254, 112)]:
        icon.star(cx, cy, 16, 7, 5, rgba("#fff7ad", 220))


def draw_tomato_clock(icon: Icon) -> None:
    icon.glow((256, 252), 210, rgba("#fecaca", 255), 0.5)
    icon.floor_shadow(412, 230, 50)
    icon.ellipse((146, 148, 366, 368), rgba("#dc2626", 255), outline=rgba("#fee2e2", 140), width=4)
    icon.ellipse((180, 184, 332, 336), rgba("#fef2f2", 238))
    icon.line([(256, 260), (256, 210)], rgba("#7f1d1d", 245), 7)
    icon.line([(256, 260), (300, 278)], rgba("#7f1d1d", 245), 7)
    for i in range(12):
        import math

        a = math.radians(i * 30 - 90)
        icon.line([(256 + math.cos(a) * 60, 260 + math.sin(a) * 60), (256 + math.cos(a) * 68, 260 + math.sin(a) * 68)], rgba("#991b1b", 180), 3)
    icon.polygon([(228, 148), (256, 104), (282, 148)], rgba("#16a34a", 245))
    icon.polygon([(256, 122), (312, 108), (284, 154)], rgba("#15803d", 225))


def draw_star_floor(icon: Icon) -> None:
    icon.glow((256, 280), 210, rgba("#a5b4fc", 255), 0.44)
    icon.floor_shadow(420, 300, 62)
    icon.polygon([(118, 290), (256, 176), (394, 290), (332, 390), (180, 390)], rgba("#312e81", 252), outline=rgba("#c7d2fe", 140))
    icon.polygon([(152, 296), (256, 212), (360, 296), (312, 366), (200, 366)], rgba("#4338ca", 230))
    for cx, cy, size in [(256, 286, 30), (204, 316, 15), (310, 242, 13), (304, 336, 18), (220, 248, 11)]:
        icon.star(cx, cy, size, size * 0.42, 5, rgba("#fef3c7", 230))


def draw_cloud_floor(icon: Icon) -> None:
    icon.glow((256, 284), 210, rgba("#99f6e4", 255), 0.42)
    icon.floor_shadow(420, 300, 62)
    icon.polygon([(112, 282), (248, 184), (400, 270), (338, 392), (174, 392)], rgba("#0f766e", 250), outline=rgba("#ccfbf1", 140))
    icon.polygon([(150, 290), (250, 220), (360, 282), (316, 358), (194, 360)], rgba("#14b8a6", 205))
    for cx, cy, r in [(202, 300, 22), (228, 284, 28), (260, 302, 20), (296, 326, 18), (318, 314, 24), (344, 328, 18)]:
        icon.ellipse((cx - r, cy - r * 0.65, cx + r, cy + r * 0.65), rgba("#ecfeff", 190))
    for x in [182, 242, 302]:
        icon.line([(x, 246), (x + 56, 374)], rgba("#ccfbf1", 75), 3)


ITEMS: list[tuple[str, str, str, Callable[[Icon], None]]] = [
    ("flame_headband", "#ef4444", "#f97316", draw_flame_headband),
    ("scholar_crown", "#4f46e5", "#facc15", draw_scholar_crown),
    ("cloud_cape", "#0891b2", "#67e8f9", draw_cloud_cape),
    ("book_pack", "#7c2d12", "#fdba74", draw_book_pack),
    ("ink_brush", "#1f2937", "#94a3b8", draw_ink_brush),
    ("focus_staff", "#2563eb", "#38bdf8", draw_focus_staff),
    ("morning_aura", "#d97706", "#fde68a", draw_morning_aura),
    ("perfect_aura", "#be123c", "#fda4af", draw_perfect_aura),
    ("spark_effect", "#7c3aed", "#c4b5fd", draw_spark_effect),
    ("cloud_effect", "#0f766e", "#99f6e4", draw_cloud_effect),
    ("forest_wall", "#166534", "#86efac", draw_forest_wall),
    ("dragon_wall", "#0e7490", "#67e8f9", draw_dragon_wall),
    ("moon_window", "#4338ca", "#c4b5fd", draw_moon_window),
    ("sunrise_window", "#ea580c", "#fed7aa", draw_sunrise_window),
    ("oak_desk", "#92400e", "#fcd34d", draw_oak_desk),
    ("focus_lamp", "#ca8a04", "#fef08a", draw_focus_lamp),
    ("trophy_shelf", "#b45309", "#fde68a", draw_trophy_shelf),
    ("tomato_clock", "#dc2626", "#fecaca", draw_tomato_clock),
    ("star_floor", "#312e81", "#a5b4fc", draw_star_floor),
    ("cloud_floor", "#0f766e", "#99f6e4", draw_cloud_floor),
]


def build_preview(paths: list[Path]) -> None:
    PREVIEW_PATH.parent.mkdir(parents=True, exist_ok=True)
    cell = 170
    preview = Image.new("RGBA", (cell * 5, cell * 4), rgba("#f8fafc", 255))
    for index, path in enumerate(paths):
        asset = Image.open(path).convert("RGBA").resize((142, 142), Image.Resampling.LANCZOS)
        x = (index % 5) * cell + 14
        y = (index // 5) * cell + 14
        tile = Image.new("RGBA", (142, 142), rgba("#ffffff", 255))
        mask = Image.new("L", (142, 142), 0)
        ImageDraw.Draw(mask).rounded_rectangle((0, 0, 141, 141), radius=28, fill=255)
        preview.alpha_composite(tile, (x, y))
        preview.alpha_composite(asset, (x, y))
    preview.convert("RGB").save(PREVIEW_PATH, "WEBP", quality=90, method=6)


def main() -> None:
    paths: list[Path] = []
    for item_id, theme, accent, renderer in ITEMS:
        icon = Icon(item_id, theme, accent)
        renderer(icon)
        paths.append(icon.save())
    build_preview(paths)
    for path in paths:
        print(path.relative_to(ROOT))
    print(PREVIEW_PATH.relative_to(ROOT))


if __name__ == "__main__":
    main()
