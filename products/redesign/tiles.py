# -*- coding: utf-8 -*-
"""
Small tiled raster textures, generated once and embedded as data URIs.

Why: SVG feTurbulence forces Chromium to rasterize the whole filtered region at print
resolution, which produced 30-115 MB PDFs. A customer download must stay small, so paper
fibre and film grain are supplied as tiny repeating tiles instead, and everything else
stays vector.
"""
import base64, io, random
from PIL import Image

_cache = {}


def _tile_png(size, fn, seed):
    img = Image.new("RGBA", (size, size))
    rnd = random.Random(seed)
    px = img.load()
    for y in range(size):
        for x in range(size):
            px[x, y] = fn(x, y, rnd)
    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    return buf.getvalue()


def fibre(size=96, seed=7):
    """Laid-paper fibre: mostly vertical grain with irregular flecks."""
    key = ("fibre", size, seed)
    if key in _cache:
        return _cache[key]

    def f(x, y, rnd):
        v = rnd.random()
        a = 0
        if v < 0.16:
            a = int(10 + rnd.random() * 16)
        if rnd.random() < 0.012:
            a = int(22 + rnd.random() * 20)
        return (74, 56, 36, a)
    _cache[key] = _b64(_tile_png(size, f, seed))
    return _cache[key]


def grain(size=72, seed=23):
    """Emulsion grain: neutral, fine, low alpha."""
    key = ("grain", size, seed)
    if key in _cache:
        return _cache[key]

    def f(x, y, rnd):
        v = rnd.random()
        if v < 0.5:
            return (26, 23, 20, int(rnd.random() * 20))
        return (255, 251, 240, int(rnd.random() * 16))
    _cache[key] = _b64(_tile_png(size, f, seed))
    return _cache[key]


def _b64(raw):
    return "data:image/png;base64," + base64.b64encode(raw).decode("ascii")
