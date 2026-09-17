"""
THYLORA / ErsatzReality customer-artifact design system (Edition v2).

Governing backend canon read before authoring (do not weaken without backend change):
  THY-VISUAL-OUTPUT-IDENTITY-001   LOCKED  stock/template default prohibited; words and
                                            evidence dominate; imagery carries atmosphere.
  THY-INTERWORLD-OLDFILM-BARRIER-001 LOCKED restrained sepia/charcoal/umber/cream palette,
                                            selective low-saturation colour, faint variable
                                            refractive interworld film, never an object.
                                            Prohibited: glitter, sparkles, glowing webs,
                                            fantasy portals, smoke, orbit rings, neon, sci-fi.
  THY-VISUAL-PREFLIGHT-LOCK-001    LOCKED  explicit visual brief before any render.
  BRAND-THYLORA-MARK               UNKNOWN / NOT_APPROVED -> no graphic logo may be invented.
                                            Typographic wordmark only.
  BRAND-FONT-FAMILY                UNKNOWN -> exact family must not be guessed or renamed.
                                            Families below are PROPOSED - NOT CANON.
  BRAND-QR-DESTINATIONS            NOT_APPROVED -> no QR is placed in any edition.
  BRAND-EDITORIAL-TONE             CHAIRMAN_APPROVED: technical, evidence-led, question-driven;
                                            generic inspirational/cliche copy prohibited.
"""
import tiles

# ---------------------------------------------------------------- palette
# Base is the barrier gate's restrained range. Colour is selective, never spread.
INK        = "#1A1714"
CHARCOAL   = "#2E2823"
UMBER      = "#6B4F32"
SEPIA      = "#8A6A45"
CREAM      = "#F2EADA"
PAPER      = "#EAE0CB"
PAPER_DEEP = "#DED2B8"
RULE       = "#C2B69B"
RULE_SOFT  = "#D6CCB4"
MUTED      = "#7A6E5C"

# One selective accent per product. Low saturation by rule.
ACCENT = {
    "bramble":  "#C0842F",  # lantern amber
    "lastmatch":"#4E6B4A",  # pitch green
    "city":     "#3E6B8A",  # current blue
    "handoff":  "#9A7B3F",  # brass
    "world":    "#6B5A8E",  # THYLORA violet
    "deck":     "#6B5A8E",
}
# Question Deck class coding (five classes, low saturation, distinguishable in greyscale by
# both hue and the tick-pattern drawn in class_mark()).
DECK_CLASS = {
    "REALITY":  ("#3E6B8A", 1),
    "FRICTION": ("#A05A3C", 2),
    "VALUE":    ("#5E7A4A", 3),
    "PEOPLE":   ("#6B5A8E", 4),
    "ACTION":   ("#8A6A45", 5),
}

# ---------------------------------------------------------------- type
# PROPOSED - NOT CANON. Backend records the approved family as UNKNOWN.
SERIF = '"Bitstream Charter","Charter","DejaVu Serif",Georgia,serif'
SANS  = '"Liberation Sans","DejaVu Sans",Helvetica,Arial,sans-serif'
MONO  = '"Courier 10 Pitch","DejaVu Sans Mono","Liberation Mono",monospace'

TRIM = {           # width x height in mm
    "story":    (152.4, 228.6),   # 6 x 9 in
    "letter":   (215.9, 279.4),   # 8.5 x 11 in
}


def base_css(kind: str, accent: str) -> str:
    w, h = TRIM[kind]
    body_size = "11.4pt" if kind == "story" else "10pt"
    margin = "16mm 15mm 17mm 15mm" if kind == "story" else "15mm 16mm 16mm 16mm"
    return f"""
@page {{ size: {w}mm {h}mm; margin: 0; }}
* {{ box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }}
html, body {{ margin:0; padding:0; background:{CREAM}; }}
body {{ font-family:{SERIF}; color:{INK}; font-size:{body_size}; line-height:1.58; }}

.page {{
  position:relative; width:{w}mm; height:{h}mm; overflow:hidden;
  page-break-after:always; break-after:page; background:{CREAM};
}}
.page:last-child {{ page-break-after:auto; break-after:auto; }}
.pad {{ position:absolute; inset:0; padding:{margin}; display:flex; flex-direction:column; }}

/* ---- paper substrate: fibre tint + faint plate tone. Never obscures text. ---- */
.substrate {{ position:absolute; inset:0; pointer-events:none; }}
.substrate .fibre {{ position:absolute; inset:0; opacity:.16; mix-blend-mode:multiply; }}
.substrate .tone  {{ position:absolute; inset:0;
  background:radial-gradient(118% 82% at 26% 12%, rgba(255,252,244,.62), rgba(0,0,0,0) 56%),
             radial-gradient(112% 88% at 82% 96%, rgba(107,79,50,.13), rgba(0,0,0,0) 62%); }}
.substrate .edge {{ position:absolute; inset:0;
  box-shadow: inset 0 0 14mm rgba(74,56,36,.13), inset 0 0 3mm rgba(74,56,36,.10); }}

/* ---- running furniture ---- */
.rail {{ display:flex; align-items:baseline; gap:2.6mm; font-family:{SANS};
  font-size:6.3pt; letter-spacing:.085em; text-transform:uppercase; color:{MUTED}; }}
.rail .wordmark {{ font-family:{SANS}; font-weight:700; letter-spacing:.13em; color:{UMBER}; }}
.rail .sep {{ color:{RULE}; }}
.rail-rule {{ height:.35mm; background:{RULE}; margin-top:1.6mm; opacity:.85; }}

.foot {{ margin-top:auto; padding-top:3mm; }}
.foot-rule {{ height:.3mm; background:{RULE_SOFT}; margin-bottom:1.8mm; }}
.foot-row {{ display:flex; justify-content:space-between; align-items:baseline; gap:4mm;
  font-family:{MONO}; font-size:5.7pt; color:{MUTED}; letter-spacing:.02em; }}
.foot-row .prov {{ max-width:74%; }}
.folio {{ font-family:{SANS}; font-size:7.4pt; font-weight:700; color:{UMBER};
  letter-spacing:.06em; }}

/* ---- headings ---- */
h1,h2,h3 {{ margin:0; font-weight:400; }}
.eyebrow {{ font-family:{SANS}; font-size:6.6pt; font-weight:700; letter-spacing:.20em;
  text-transform:uppercase; color:{accent}; }}
.chapter-no {{ font-family:{SANS}; font-size:6.6pt; font-weight:700; letter-spacing:.18em;
  color:{MUTED}; text-transform:uppercase; }}
h2.head {{ font-family:{SERIF}; font-size:18.5pt; line-height:1.14; color:{INK};
  margin:1.4mm 0 0 0; }}
h3.sub {{ font-family:{SANS}; font-size:8.2pt; font-weight:700; letter-spacing:.10em;
  text-transform:uppercase; color:{UMBER}; }}

p {{ margin:0 0 3.1mm 0; }}
p.lead {{ font-size:11.4pt; line-height:1.46; color:{CHARCOAL}; }}
.drop::first-letter {{ float:left; font-family:{SERIF}; font-size:25pt; line-height:.84;
  padding:1.2mm 1.6mm 0 0; color:{accent}; }}
em.line {{ font-style:italic; color:{UMBER}; }}

/* ---- evidence + callouts ---- */
.callout {{ border-left:1.1mm solid {accent}; background:rgba(255,253,246,.62);
  padding:2.6mm 3.2mm; margin:2.6mm 0; }}
.callout .k {{ font-family:{SANS}; font-size:6.4pt; font-weight:700; letter-spacing:.16em;
  text-transform:uppercase; color:{accent}; display:block; margin-bottom:1.1mm; }}
.callout p {{ margin:0; font-size:9.4pt; }}

.qbox {{ border:.38mm solid {RULE}; background:rgba(255,253,246,.55); padding:3.2mm 3.6mm; }}
.qbox .k {{ font-family:{SANS}; font-size:6.4pt; font-weight:700; letter-spacing:.16em;
  text-transform:uppercase; color:{UMBER}; display:block; margin-bottom:1.4mm; }}
.qbox .q {{ font-family:{SERIF}; font-size:11pt; line-height:1.34; color:{INK}; }}

/* ---- writing surfaces (real, ruled, printable) ---- */
.write {{ margin:1.8mm 0 0 0; }}
.write .ln {{ height:7.4mm; border-bottom:.3mm solid {RULE}; }}
.write .ln.tight {{ height:6.4mm; }}
.prompt {{ font-family:{SANS}; font-size:8.4pt; font-weight:700; color:{CHARCOAL};
  margin:3.2mm 0 .6mm 0; letter-spacing:.005em; }}
.hint {{ font-family:{SERIF}; font-style:italic; font-size:8.2pt; color:{MUTED};
  margin:.4mm 0 1.2mm 0; }}

.fig {{ margin:2.4mm 0; }}
.figwrap {{ flex:1; min-height:0; display:flex; flex-direction:column; justify-content:center;
  margin:2.6mm 0 0 0; }}
.figwrap .fig {{ margin:0; }}
.fig-fill {{ flex:1; min-height:0; }}
.strip {{ margin-top:auto; }}
.strip-inner {{ display:flex; gap:0; border-top:.35mm solid {RULE};
  border-bottom:.35mm solid {RULE}; }}
.strip-cell {{ flex:1; padding:2.2mm 2.6mm; border-left:.3mm solid {RULE_SOFT}; }}
.strip-cell:first-child {{ border-left:none; padding-left:0; }}
.strip-k {{ font-family:{SANS}; font-size:5.8pt; font-weight:700; letter-spacing:.14em;
  text-transform:uppercase; color:{MUTED}; display:block; margin-bottom:.9mm; }}
.strip-v {{ font-family:{SERIF}; font-size:8.4pt; line-height:1.28; color:{INK}; }}
.figcap {{ font-family:{SANS}; font-size:6.5pt; letter-spacing:.07em; text-transform:uppercase;
  color:{MUTED}; margin-top:1.4mm; }}
"""


def _grain_specks(seed: int) -> str:
    import random
    rnd = random.Random(seed * 29 + 11)
    out = []
    for _ in range(26):
        out.append(f'<circle cx="{rnd.uniform(0,16):.1f}" cy="{rnd.uniform(0,16):.1f}" '
                   f'r="{rnd.uniform(.12,.42):.2f}" fill="{"#1A1714" if rnd.random()<.5 else "#FFFBF0"}" '
                   f'fill-opacity="{rnd.uniform(.05,.18):.3f}"/>')
    return "".join(out)


def barrier_defs(seed: int, strength: float = 1.0) -> str:
    """
    World-view barrier, implementing  I_seen = T*I_world + R*I_viewer + D.

      T  transmission : uneven, mostly transparent  -> .bar-t  (variable opacity field)
      R  reflection   : viewer-side sheen           -> .bar-r  (low-angle gradient)
      D  distortion   : refraction + grain + scratch-> filter displacement, grain, strokes

    The barrier is a thin variable atmospheric screen, never an object. Primary subject,
    geometry and evidence stay readable (THY-INTERWORLD-OLDFILM-BARRIER-001).
    """
    return f"""
<!-- T: transmission field. Mostly open; thickens irregularly toward the edges. -->
<radialGradient id="trans{seed}" cx="44%" cy="40%" r="74%">
  <stop offset="0%"   stop-color="#000" stop-opacity="0"/>
  <stop offset="62%"  stop-color="#000" stop-opacity="0"/>
  <stop offset="88%"  stop-color="{UMBER}" stop-opacity="{0.10*strength:.3f}"/>
  <stop offset="100%" stop-color="{UMBER}" stop-opacity="{0.20*strength:.3f}"/>
</radialGradient>
<!-- R: viewer-side reflection. A low-angle sheen across the plane the reader sits on. -->
<linearGradient id="refl{seed}" x1="0%" y1="0%" x2="100%" y2="72%">
  <stop offset="0%"   stop-color="#FFFDF6" stop-opacity="{0.15*strength:.3f}"/>
  <stop offset="26%"  stop-color="#FFFDF6" stop-opacity="{0.05*strength:.3f}"/>
  <stop offset="47%"  stop-color="#FFFDF6" stop-opacity="{0.13*strength:.3f}"/>
  <stop offset="63%"  stop-color="#FFFDF6" stop-opacity="0"/>
  <stop offset="100%" stop-color="#FFFDF6" stop-opacity="{0.07*strength:.3f}"/>
</linearGradient>
<!-- D: emulsion grain, supplied as a small repeating tile rather than a filter. -->
<pattern id="grainp{seed}" patternUnits="userSpaceOnUse" width="24" height="24">
  <image href="{tiles.grain()}" x="0" y="0" width="24" height="24"/>
</pattern>
"""


def barrier_overlay(seed: int, w: float, h: float, strength: float = 1.0) -> str:
    """Barrier layers drawn OVER a world scene, inside the scene's own <svg>."""
    import random
    rnd = random.Random(seed * 131 + 7)
    scratches = []
    for _ in range(int(5 * strength) + 2):
        x = rnd.uniform(0.04, 0.96) * w
        y0 = rnd.uniform(0, h * 0.5)
        ln = rnd.uniform(h * 0.10, h * 0.42)
        dx = rnd.uniform(-2.2, 2.2)
        op = rnd.uniform(0.05, 0.13) * strength
        wd = rnd.uniform(0.13, 0.34)
        scratches.append(
            f'<path d="M{x:.1f},{y0:.1f} C{x+dx:.1f},{y0+ln*0.4:.1f} '
            f'{x-dx:.1f},{y0+ln*0.7:.1f} {x+dx*0.5:.1f},{y0+ln:.1f}" '
            f'stroke="#FFFBF0" stroke-opacity="{op:.3f}" stroke-width="{wd:.2f}" fill="none"/>')
    # a few emulsion specks (material artifacts, not sparkle)
    specks = []
    for _ in range(int(9 * strength)):
        cx = rnd.uniform(0, w); cy = rnd.uniform(0, h)
        r = rnd.uniform(0.18, 0.55); op = rnd.uniform(0.05, 0.14) * strength
        specks.append(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.2f}" '
                      f'fill="{UMBER}" fill-opacity="{op:.3f}"/>')
    # gate weave: the transmission lattice, extremely faint, irregular pitch
    weave = []
    x = 0.0
    while x < w:
        op = 0.020 + 0.026 * abs((x / max(w, 1)) - 0.5) * strength
        weave.append(f'<line x1="{x:.1f}" y1="0" x2="{x:.1f}" y2="{h:.1f}" '
                     f'stroke="{UMBER}" stroke-opacity="{op:.3f}" stroke-width="0.2"/>')
        x += rnd.uniform(2.3, 4.1)
    y = 0.0
    while y < h:
        op = 0.016 + 0.020 * abs((y / max(h, 1)) - 0.5) * strength
        weave.append(f'<line x1="0" y1="{y:.1f}" x2="{w:.1f}" y2="{y:.1f}" '
                     f'stroke="{UMBER}" stroke-opacity="{op:.3f}" stroke-width="0.2"/>')
        y += rnd.uniform(2.6, 4.6)
    return f"""
<g class="barrier" aria-hidden="true">
  <g opacity="{0.55*strength:.2f}">{''.join(weave)}</g>
  <rect width="{w}" height="{h}" fill="url(#trans{seed})"/>
  <rect width="{w}" height="{h}" fill="url(#refl{seed})"/>
  <rect width="{w}" height="{h}" fill="url(#grainp{seed})" opacity="{0.55*strength:.2f}"/>
  {''.join(specks)}
  {''.join(scratches)}
</g>"""


def substrate(seed: int) -> str:
    """Paper fibre + plate tone under every page.

    Measured, not assumed: a vector stroke pattern produced thousands of path ops per page
    and made the PDFs ~30% LARGER than a small repeating raster tile. The tile wins, so the
    tile stays.
    """
    return f"""<div class="substrate" aria-hidden="true">
  <div class="fibre" style="background-image:url({tiles.fibre()});background-repeat:repeat;
    background-size:12mm 12mm"></div>
  <div class="tone"></div><div class="edge"></div>
</div>"""


def rail(left: str, right: str = "") -> str:
    r = f'<span class="sep">/</span><span>{right}</span>' if right else ""
    return (f'<div><div class="rail"><span class="wordmark">THYLORA</span>'
            f'<span class="sep">&#183;</span><span>ErsatzReality</span>'
            f'<span class="sep">/</span><span>{left}</span>{r}</div>'
            f'<div class="rail-rule"></div></div>')


def foot(prov: str, folio) -> str:
    f = f'<span class="folio">{folio}</span>' if folio is not None else "<span></span>"
    return (f'<div class="foot"><div class="foot-rule"></div>'
            f'<div class="foot-row"><span class="prov">{prov}</span>{f}</div></div>')
