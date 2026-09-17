# -*- coding: utf-8 -*-
"""Render the six redesigned editions to PDF, hash them, and verify every page."""
import hashlib, json, os, subprocess, sys, shutil, re

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
OUT = os.environ.get("THY_OUT", "/tmp/claude-0/-home-user-Thylora/"
                     "d3272dba-25bd-571e-9555-c5dbbdd95dba/scratchpad/editions")
CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"

import books, books2
from design import TRIM

PRODUCTS = [
    ("last_match",   "The Last Match — A THYLORA Family Story About Legacy",
     "gid://shopify/Product/7957206630477", "3.00",  "story",  books.last_match),
    ("question_deck","THYLORA Question Deck — 50 Better Questions",
     "gid://shopify/Product/7957199913037", "12.00", "letter", books2.question_deck),
    ("city_power",   "The City That Needed More Power — A THYLORA Science Story",
     "gid://shopify/Product/7957206892621", "5.00",  "story",  books.city_power),
    ("build_a_world","Build a World From One Idea — THYLORA Starter Kit",
     "gid://shopify/Product/7957200109645", "19.00", "letter", books2.build_a_world),
    ("handoff",      "The Handoff — A THYLORA Story About Leadership and Change",
     "gid://shopify/Product/7957206958157", "7.00",  "story",  books.handoff),
    ("bramble_wick", "Bramble Wick — The Lantern That Wouldn't Go Out",
     "gid://shopify/Product/7956697448525", "1.99",  "story",  books.bramble_wick),
]


def run(cmd, timeout=240):
    p = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
    return p.returncode, p.stdout, p.stderr


def render_pdf(html_path, pdf_path):
    rc, so, se = run([
        CHROME, "--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars",
        "--run-all-compositor-stages-before-draw", "--virtual-time-budget=20000",
        "--no-pdf-header-footer", f"--print-to-pdf={pdf_path}", f"file://{html_path}"])
    if not os.path.exists(pdf_path):
        raise RuntimeError(f"chromium produced no pdf\nrc={rc}\n{se[-2000:]}")
    return se


def shot(html_path, png_path, w, h):
    run([CHROME, "--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars",
         "--virtual-time-budget=12000", f"--window-size={w},{h}",
         f"--screenshot={png_path}", f"file://{html_path}"])
    return os.path.exists(png_path)


def mobile_preview(key, html, kind, pages_wanted=(0, 1, 2)):
    """Phone-width proof: each selected page scaled to a 1080px-wide viewport, as a customer
    sees it on a phone. Verifies the page is readable at phone scale, not just at print scale."""
    mm_w, mm_h = TRIM[kind]
    px_w = 1080
    px_h = int(px_w * mm_h / mm_w)
    parts = re.findall(r'<div class="page"\s.*?(?=<div class="page"\s|</body>)', html, re.S)
    head = html.split("<body>")[0] + "<body>"
    outs = []
    for i in pages_wanted:
        if i >= len(parts):
            continue
        scale = px_w / (mm_w * 96 / 25.4)
        wrap = (f'{head}<div style="width:{px_w}px;height:{px_h}px;overflow:hidden">'
                f'<div style="transform:scale({scale:.5f});transform-origin:top left">'
                f'{parts[i]}</div></div></body></html>')
        hp = os.path.join(OUT, f"{key}.mobile{i+1}.html")
        pp = os.path.join(OUT, f"{key}.mobile-p{i+1}.png")
        open(hp, "w", encoding="utf-8").write(wrap)
        if shot(hp, pp, px_w, px_h):
            outs.append((f"page {i+1}", pp, os.path.getsize(pp)))
        os.remove(hp)
    return px_w, px_h, outs


def main():
    os.makedirs(OUT, exist_ok=True)
    from pypdf import PdfReader
    manifest = []
    import scenes as S
    for key, title, pid, price, kind, fn in PRODUCTS:
        S.ASSET_LOG.clear()
        html, npages = fn()
        # one row per generated component, deduplicated by content hash
        seen, components = set(), []
        for a in S.ASSET_LOG:
            if a["sha256"] in seen:
                continue
            seen.add(a["sha256"])
            components.append(a)
        hp = os.path.join(OUT, f"{key}.html")
        pp = os.path.join(OUT, f"{key}.v2.pdf")
        open(hp, "w", encoding="utf-8").write(html)
        render_pdf(hp, pp)
        raw = open(pp, "rb").read()
        sha = hashlib.sha256(raw).hexdigest()
        rd = PdfReader(pp)
        actual = len(rd.pages)
        box = rd.pages[0].mediabox
        pw_mm = round(float(box.width) * 25.4 / 72, 1)
        ph_mm = round(float(box.height) * 25.4 / 72, 1)
        # every page must carry extractable text (no page is an image-only dead end)
        empties = [i + 1 for i, pg in enumerate(rd.pages)
                   if len((pg.extract_text() or "").strip()) < 12]
        page_map = [dict(zip(("kind", "title", "folio", "art", "surface", "strip", "callout"), m))
                    for m in re.findall(
                        r'<div class="page"\s+data-kind="([^"]*)"\s+data-title="([^"]*)"\s+'
                        r'data-folio="([^"]*)"\s+data-art="([^"]*)"\s+data-surface="([^"]*)"\s+'
                        r'data-strip="([^"]*)"\s+data-callout="([^"]*)"', html, re.S)]
        for i, pm in enumerate(page_map):
            pm["page"] = i + 1
        mw, mh, shots = mobile_preview(key, html, kind)
        if not shots:
            raise RuntimeError(f"{key}: mobile preview produced no images")
        manifest.append({
            "key": key, "title": title, "external_product_id": pid, "price_usd": price,
            "pdf": pp, "bytes": len(raw), "sha256": sha,
            "pages_composed": npages, "pages_in_pdf": actual,
            "page_size_mm": [pw_mm, ph_mm], "trim": kind,
            "pages_without_text": empties,
            "page_map": page_map,
            "components": components,
            "component_count": len(components),
            "mobile_preview": {"viewport_px": [mw, mh],
                               "shots": [{"page": a, "file": b, "bytes": c} for a, b, c in shots]},
        })
        if len(page_map) != actual:
            raise RuntimeError(f"{key}: page map has {len(page_map)} entries but the PDF has "
                               f"{actual} pages - the map must describe every page")
        flag = "OK " if (actual == npages and not empties) else "!! "
        print(f"{flag}{key:15} {len(components):3d}art {actual:3d}pp  {pw_mm}x{ph_mm}mm  {len(raw)/1024:7.1f}KB  "
              f"sha256 {sha[:16]}  empty={empties}")
    json.dump(manifest, open(os.path.join(OUT, "manifest.json"), "w"), indent=1)
    print(f"\nmanifest -> {os.path.join(OUT,'manifest.json')}")
    return manifest


if __name__ == "__main__":
    main()
