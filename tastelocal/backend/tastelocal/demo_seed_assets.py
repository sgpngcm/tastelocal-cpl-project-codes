"""Utilities for generating rich demo imagery for seeded TasteLocal content."""
from __future__ import annotations

from io import BytesIO
from textwrap import wrap
from typing import Iterable, Tuple

from django.core.files.base import ContentFile
from PIL import Image, ImageDraw, ImageFont

Palette = Tuple[tuple[int, int, int], tuple[int, int, int]]

PALETTES: list[Palette] = [
    ((238, 122, 27), (147, 58, 21)),
    ((22, 163, 74), (20, 83, 45)),
    ((241, 147, 64), (185, 72, 16)),
    ((168, 85, 247), (88, 28, 135)),
    ((14, 165, 233), (8, 47, 73)),
]


def _font(size: int, bold: bool = False):
    candidates = [
        '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf' if bold else '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
        '/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf' if bold else '/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf',
    ]
    for path in candidates:
        try:
            return ImageFont.truetype(path, size=size)
        except OSError:
            continue
    return ImageFont.load_default()


def _gradient(size: tuple[int, int], start: tuple[int, int, int], end: tuple[int, int, int]) -> Image.Image:
    width, height = size
    image = Image.new('RGB', size, start)
    draw = ImageDraw.Draw(image)
    for y in range(height):
        ratio = y / max(height - 1, 1)
        color = tuple(int(start[i] + (end[i] - start[i]) * ratio) for i in range(3))
        draw.line((0, y, width, y), fill=color)
    return image


def _draw_glow(draw: ImageDraw.ImageDraw, xy: tuple[int, int, int, int], fill: tuple[int, int, int, int]):
    draw.ellipse(xy, fill=fill)


def _draw_wrapped(draw: ImageDraw.ImageDraw, text: str, position: tuple[int, int], font, fill, line_height: int, width_chars: int):
    x, y = position
    for line in wrap(text, width=width_chars):
        draw.text((x, y), line, font=font, fill=fill)
        y += line_height


def _to_content_file(image: Image.Image, name: str) -> ContentFile:
    buffer = BytesIO()
    image.save(buffer, format='PNG', optimize=True)
    return ContentFile(buffer.getvalue(), name=name)


def build_card_image(
    *,
    title: str,
    subtitle: str = '',
    badge: str = 'TasteLocal',
    size: tuple[int, int] = (1400, 900),
    palette: Palette | None = None,
    filename: str = 'seed.png',
) -> ContentFile:
    start, end = palette or PALETTES[0]
    image = _gradient(size, start, end).convert('RGBA')
    overlay = Image.new('RGBA', size, (255, 255, 255, 0))
    draw = ImageDraw.Draw(overlay)

    width, height = size
    _draw_glow(draw, (width - 360, 40, width - 40, 360), (255, 255, 255, 24))
    _draw_glow(draw, (-80, height - 320, 280, height + 40), (255, 255, 255, 18))
    _draw_glow(draw, (width - 240, height - 200, width - 120, height - 80), (255, 255, 255, 28))

    badge_font = _font(28, bold=True)
    title_font = _font(74, bold=True)
    subtitle_font = _font(30)

    draw.rounded_rectangle((72, 64, 300, 118), radius=28, fill=(255, 255, 255, 52))
    draw.text((100, 79), badge[:24], font=badge_font, fill=(255, 255, 255, 230))
    _draw_wrapped(draw, title[:120], (72, 300), title_font, (255, 255, 255, 255), 88, 22)
    _draw_wrapped(draw, subtitle[:180], (72, 470), subtitle_font, (255, 255, 255, 228), 40, 44)
    draw.line((72, 560, 520, 620), fill=(255, 255, 255, 70), width=14)

    image = Image.alpha_composite(image, overlay).convert('RGB')
    return _to_content_file(image, filename)


def build_avatar(name: str, filename: str = 'avatar.png', size: int = 512) -> ContentFile:
    initials = ''.join(part[:1].upper() for part in name.split()[:2]) or 'TL'
    start, end = PALETTES[0]
    image = _gradient((size, size), start, end).convert('RGBA')
    mask = Image.new('L', (size, size), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, size, size), fill=255)
    circle = Image.new('RGBA', (size, size), (255, 255, 255, 0))
    draw = ImageDraw.Draw(circle)
    draw.ellipse((36, 36, size - 36, size - 36), fill=(255, 255, 255, 20))
    draw.ellipse((90, 90, size - 90, size - 90), fill=(255, 255, 255, 16))
    font = _font(int(size * 0.28), bold=True)
    bbox = draw.textbbox((0, 0), initials, font=font)
    x = (size - (bbox[2] - bbox[0])) / 2
    y = (size - (bbox[3] - bbox[1])) / 2 - 10
    draw.text((x, y), initials, font=font, fill=(255, 255, 255, 245))
    image = Image.composite(circle, image, mask)
    return _to_content_file(image.convert('RGB'), filename)


def palette_for_index(index: int) -> Palette:
    return PALETTES[index % len(PALETTES)]
