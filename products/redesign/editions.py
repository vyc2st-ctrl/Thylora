"""
The six redesigned customer editions.

CONTENT LOCK: every sentence of body copy below is carried across verbatim from the
v1 artifact stored in thylora_delivery_assets (extracted from the stored PDF bytes).
Meaning, sequence, prices, rights and product identity are preserved. What changed is
presentation: page architecture, typography, hierarchy, world imagery and evidence marks.

One deliberate, declared presentation change (Question Deck): v1 reprinted the identical
"Look for: ... / Do: ..." instruction under all 50 cards. Under the Chairman's visual
efficiency rule V = (Ir+Dr+Tr+Sr)/Nc that repetition is pure Nc. The exact wording is
preserved once, on the How to use it page, and encoded per card by the class band and
the ruled answer field. No question text is altered.
"""
from design import (TRIM, base_css, substrate, rail, foot, ACCENT, DECK_CLASS,
                    INK, CHARCOAL, UMBER, SEPIA, CREAM, PAPER, RULE, RULE_SOFT, MUTED,
                    SANS, SERIF, MONO, barrier_defs, barrier_overlay)
import scenes as S

EDITION = "Edition v2"
BUILD_TAG = "THY-ED2-20260917"


# ------------------------------------------------------------------ page shell
def page(inner, seed, rail_left, rail_right, prov, folio, kind="story"):
    """Emits the page and declares, as data attributes, what it structurally contains.
    The declaration is what the page gate scores and what the design map is built from."""
    art = "yes" if 'class="fig' in inner else "no"
    surface = "yes" if ('class="write"' in inner or 'class="ln"' in inner
                        or "border-bottom:.3mm solid" in inner) else "no"
    strip = "yes" if 'class="strip"' in inner else "no"
    callout = "yes" if ('class="callout"' in inner or 'class="qbox"' in inner) else "no"
    return (f'<div class="page" data-kind="{kind}" data-title="{rail_left}" '
            f'data-folio="{folio if folio is not None else ""}" data-art="{art}" '
            f'data-surface="{surface}" data-strip="{strip}" data-callout="{callout}">'
            f'{substrate(seed)}<div class="pad">'
            f'{rail(rail_left, rail_right)}{inner}{foot(prov, folio)}</div></div>')


def cover(title, subtitle, kicker, scene_html, accent, seed, price, serial, kind="story"):
    """Designed cover. Typographic wordmark only: no THYLORA graphic mark is approved."""
    return f"""<div class="page" data-kind="cover" data-title="Cover" data-folio=""
  data-art="yes" data-surface="no" data-strip="no" data-callout="no">{substrate(seed)}
<div class="pad" style="padding:0">
  <div style="position:relative;height:100%;display:flex;flex-direction:column">
    <div style="padding:14mm 14mm 0 14mm">
      <div style="font-family:{SANS};font-size:7pt;font-weight:700;letter-spacing:.26em;
        color:{UMBER};text-transform:uppercase">THYLORA &#183; ErsatzReality</div>
      <div style="height:.5mm;background:{accent};margin:2.4mm 0 0 0;width:34mm"></div>
      <div style="font-family:{SANS};font-size:6.6pt;font-weight:700;letter-spacing:.20em;
        color:{accent};text-transform:uppercase;margin-top:4mm">{kicker}</div>
      <h1 style="font-family:{SERIF};font-size:27pt;line-height:1.06;margin:2.4mm 0 0 0;
        color:{INK};letter-spacing:-.01em">{title}</h1>
      <p style="font-family:{SERIF};font-size:10.6pt;line-height:1.42;color:{CHARCOAL};
        margin:3.4mm 0 0 0;max-width:104mm">{subtitle}</p>
    </div>
    <div style="margin-top:6mm;flex:1;min-height:0;display:flex;
      flex-direction:column">{scene_html}</div>
    <div style="margin-top:auto;padding:0 14mm 13mm 14mm">
      <div style="height:.35mm;background:{RULE};margin-bottom:2.4mm"></div>
      <div style="display:flex;justify-content:space-between;align-items:baseline;
        font-family:{MONO};font-size:6pt;color:{MUTED}">
        <span>{serial}</span><span>{EDITION}</span><span>US ${price}</span>
      </div>
    </div>
  </div>
</div></div>"""


def identity_page(meta, accent, seed, kind="story", pages="-"):
    # the 6x9 story trim is tighter than Letter, so the identity table runs at a
    # smaller scale there; verified by the clipping check, not by eye
    tight = (kind == "story")
    dense = tight and len(meta["rows"]) >= 9      # long tables need a further step down
    fs_k = ("5.6pt" if dense else "5.9pt") if tight else "6.6pt"
    fs_v = ("7.0pt" if dense else "7.4pt") if tight else "8.6pt"
    pad_r = ("0.6mm 0" if dense else "0.9mm 0") if tight else "1.5mm 0"
    fs_u = ("6.6pt" if dense else "7.0pt") if tight else "8.2pt"
    fs_b = ("7.2pt" if dense else "7.6pt") if tight else "8.8pt"
    w_k = "26mm" if tight else "34mm"
    """Identity / serial page: document class, version, audience, rights, provenance,
    truth boundary, and what is knowingly UNKNOWN."""
    rows = "".join(
        f'<tr><td style="padding:{pad_r};font-family:{SANS};font-size:{fs_k};'
        f'letter-spacing:.09em;text-transform:uppercase;color:{MUTED};'
        f'vertical-align:top;width:{w_k}">{k}</td>'
        f'<td style="padding:{pad_r};font-family:{SERIF};font-size:{fs_v};color:{INK};'
        f'vertical-align:top;line-height:1.34">{v}</td></tr>' for k, v in meta["rows"])
    unknown = "".join(f'<li style="margin-bottom:.9mm">{u}</li>' for u in meta["unknown"])
    inner = f"""
<div style="margin-top:4mm;flex:1;display:flex;flex-direction:column;min-height:0">
  <div class="eyebrow" style="color:{accent}">Edition identity</div>
  <h2 class="head" style="font-size:{"11.6pt" if tight else "14pt"};margin-bottom:2.4mm;
    line-height:1.14">{meta['title']}</h2>
  <table style="width:100%;border-collapse:collapse;border-top:.35mm solid {RULE};
    border-bottom:.35mm solid {RULE}">{rows}</table>
  <div style="margin-top:3mm;border-left:1.1mm solid {accent};padding:2mm 2.8mm;
    background:rgba(255,253,246,.6)">
    <span style="font-family:{SANS};font-size:6.4pt;font-weight:700;letter-spacing:.16em;
      text-transform:uppercase;color:{accent};display:block;margin-bottom:1.2mm">Truth boundary</span>
    <p style="margin:0;font-size:{fs_b};line-height:1.38">{meta['boundary']}</p>
  </div>
  <div style="margin-top:3mm">
    <span style="font-family:{SANS};font-size:6.2pt;font-weight:700;letter-spacing:.16em;
      text-transform:uppercase;color:{UMBER}">Recorded as unknown</span>
    <ul style="margin:1.2mm 0 0 0;padding-left:4.2mm;font-size:{fs_u};line-height:1.34;
      color:{CHARCOAL}">{unknown}</ul>
  </div>
  <div style="margin-top:auto;padding-top:2.4mm">{S.edition_stamp(meta["serial"], EDITION,
     BUILD_TAG, pages, accent, seed + 60, h=(34 if dense else 40 if tight else 64))}</div>
  {"" if tight else S.detail_strip([("Edition", EDITION), ("Build", BUILD_TAG),
                   ("Supersedes", "v1, retained in the backend")])}
</div>"""
    return page(inner, seed, "Edition identity", meta["serial"], meta["prov"], None, kind)


def talk_page(seed, accent, questions, prov, folio, kind="story", title="Talk together",
              note=""):
    blocks = ""
    for q in questions:
        blocks += S.worksheet_block(q, "", 3)
    n = f'<p class="hint" style="margin-top:3mm">{note}</p>' if note else ""
    inner = f"""
<div style="margin-top:5mm">
  <div class="eyebrow" style="color:{accent}">Use it</div>
  <h2 class="head" style="font-size:15pt">{title}</h2>
  {n}
  <div style="margin-top:3mm">{blocks}</div>
</div>"""
    return page(inner, seed, title, "", prov, folio, kind)


def story_page(seed, accent, chapter_no, head, paras, scene="", prov="", folio=1,
               kind="story", callout=None, drop=False, tail=None):
    ps = ""
    for i, p in enumerate(paras):
        cls = "drop" if (drop and i == 0) else ""
        ps += f'<p class="{cls}">{p}</p>'
    co = ""
    if callout:
        co = (f'<div class="callout"><span class="k">{callout[0]}</span>'
              f'<p>{callout[1]}</p></div>')
    ch = (f'<div class="chapter-no">{chapter_no}</div>') if chapter_no else ""
    art = f'<div class="figwrap">{scene}</div>' if scene else '<div style="flex:1"></div>'
    tl = tail or ""
    inner = f"""
<div style="margin-top:5mm;flex:1;display:flex;flex-direction:column;min-height:0">
  {ch}<h2 class="head">{head}</h2>
  <div style="margin-top:3.4mm">{ps}{co}</div>
  {art}{tl}
</div>"""
    return page(inner, seed, head, "", prov, folio, kind)
