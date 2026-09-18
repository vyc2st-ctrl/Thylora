"""
HERB FILE 001 — viewable Chairman approval artifact.

Produced under carryforward #459 (approval must be immediately viewable) and
THY-VISIBLE-PRODUCTION-SLA-001.

DESIGN TOKEN PROVENANCE
-----------------------
The tokens below are RESTATED from the approved Edition v2 design system at
    products/redesign/design.py   (branch claude/thylora-backend-continuity-djn6ih)
That branch is not merged into this one, so the values are restated here rather than
imported. This is recorded as release blocker HERB-BLK-007: the production build MUST
import the canonical design.py. This file is a preview renderer, not a second design system.

NOTHING IS GENERATED HERE. Under THY-VISUAL-PREFLIGHT-LOCK-001 no plate may be rendered
before its written brief is approved, so every plate area is drawn as a marked reserve
naming the brief that fills it. Layout, type, palette, register bands and page
architecture are the only things this preview asserts.
"""
import pathlib

# ---- inherited tokens (restated - see provenance note above) ----
INK, CHARCOAL, UMBER, SEPIA = "#1A1714", "#2E2823", "#6B4F32", "#8A6A45"
CREAM, PAPER, RULE, RULE_SOFT, MUTED = "#F2EADA", "#EAE0CB", "#C2B69B", "#D6CCB4", "#7A6E5C"

# ---- new for this shelf (PROPOSED) ----
ACCENT = "#5F7168"          # withy grey-green
REGISTER = {                 # colour, ticks, rule style  (see design-logic.md 2.2)
    "DOCUMENTED":     ("#3E6B8A", 1, "solid",  "0.9mm"),
    "TRADITION":      ("#8A6A45", 2, "dashed", "0.6mm"),
    "MODERN SCIENCE": ("#5F7168", 3, "solid",  "0.45mm"),
    "UNKNOWN":        ("#7A6E5C", 4, "dotted", "0.35mm"),
}

SERIF = '"Bitstream Charter","Charter","DejaVu Serif",Georgia,serif'
SANS  = '"Liberation Sans","DejaVu Sans",Helvetica,Arial,sans-serif'
MONO  = '"Courier 10 Pitch","DejaVu Sans Mono","Liberation Mono",monospace'

SUBSTRATE = f"""
.substrate{{position:absolute;inset:0;pointer-events:none}}
.substrate .tone{{position:absolute;inset:0;
 background:radial-gradient(118% 82% at 26% 12%,rgba(255,252,244,.62),rgba(0,0,0,0) 56%),
            radial-gradient(112% 88% at 82% 96%,rgba(107,79,50,.13),rgba(0,0,0,0) 62%)}}
.substrate .fibre{{position:absolute;inset:0;opacity:.14;mix-blend-mode:multiply;
 background-image:repeating-linear-gradient(94deg,rgba(107,79,50,.10) 0 .6px,rgba(0,0,0,0) .6px 3.1px),
                  repeating-linear-gradient(3deg,rgba(107,79,50,.07) 0 .5px,rgba(0,0,0,0) .5px 4.3px)}}
.substrate .edge{{position:absolute;inset:0;
 box-shadow:inset 0 0 14mm rgba(74,56,36,.13),inset 0 0 3mm rgba(74,56,36,.10)}}
"""

def ticks(colour, n):
    return "".join(
        f'<i style="display:inline-block;width:1.6mm;height:1.6mm;background:{colour};'
        f'margin-right:.8mm;border-radius:.2mm"></i>' for _ in range(n))

def band(name, text, compact=False):
    colour, n, style, weight = REGISTER[name]
    pad = ".9mm 0 1.5mm 0" if compact else "1.5mm 0 2.4mm 0"
    return f"""
<div class="band" style="padding:{pad}">
  <div class="bandrule" style="border-top:{weight} {style} {colour}"></div>
  <div class="bandhead" style="color:{colour}">{ticks(colour,n)}<span>{name}</span></div>
  <div class="bandtext">{text}</div>
</div>"""

def reserve(label, brief, h, grow=False):
    box = "flex:1;min-height:0" if grow else f"height:{h}"
    return f"""
<div class="reserve" style="{box}">
  <div class="rlabel">PLATE RESERVE — NOT GENERATED</div>
  <div class="rname">{label}</div>
  <div class="rbrief">{brief}</div>
  <div class="rgate">THY-VISUAL-PREFLIGHT-LOCK-001 — generation prohibited before brief approval</div>
</div>"""


INDEX = [("1763","DOCUMENTED"),("1828","DOCUMENTED"),("1838","DOCUMENTED"),
         ("1897","CONTESTED"),("1971","DOCUMENTED"),("——","UNKNOWN")]

def index_rows():
    out=[]
    for date, reg in INDEX:
        colour = REGISTER.get(reg,("#8A6A45",0,"",""))[0] if reg in REGISTER else "#8A6A45"
        out.append(
            f'<div style="display:flex;justify-content:space-between;align-items:baseline;'
            f'gap:1.5mm;border-bottom:.2mm solid {RULE_SOFT};padding:.9mm 0">'
            f'<span style="font-family:{MONO};font-size:6.4pt;color:{CHARCOAL}">{date}</span>'
            f'<span style="font-family:{SANS};font-size:4.9pt;font-weight:700;'
            f'letter-spacing:.09em;color:{colour}">{reg}</span></div>')
    return "".join(out)

CSS = f"""
*{{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}}
html,body{{margin:0;padding:0;background:#6E655A}}
.sheet{{position:relative;background:{CREAM};overflow:hidden;margin:0 auto}}
.pad{{position:absolute;inset:0;display:flex;flex-direction:column}}
{SUBSTRATE}
.rail{{display:flex;align-items:baseline;gap:2.6mm;font-family:{SANS};font-size:6.3pt;
 letter-spacing:.085em;text-transform:uppercase;color:{MUTED}}}
.rail .wordmark{{font-weight:700;letter-spacing:.13em;color:{UMBER}}}
.rail .sep{{color:{RULE}}}
.rail-rule{{height:.35mm;background:{RULE};margin-top:1.6mm;opacity:.85}}
.eyebrow{{font-family:{SANS};font-size:6.8pt;font-weight:700;letter-spacing:.20em;
 text-transform:uppercase;color:{ACCENT}}}
h1{{font-family:{SERIF};font-weight:400;color:{INK};margin:0}}
.lead{{font-family:{SERIF};color:{CHARCOAL};margin:0}}
.band .bandrule{{width:100%}}
.band .bandhead{{font-family:{SANS};font-size:6.4pt;font-weight:700;letter-spacing:.17em;
 text-transform:uppercase;margin:1.3mm 0 .9mm 0;display:flex;align-items:center}}
.band .bandtext{{font-family:{SERIF};color:{INK}}}
.reserve{{border:.4mm dashed {RULE};background:rgba(255,253,246,.42);display:flex;
 flex-direction:column;align-items:center;justify-content:center;text-align:center;
 padding:3mm;gap:1.2mm}}
.reserve .rlabel{{font-family:{SANS};font-size:6pt;font-weight:700;letter-spacing:.18em;
 color:{MUTED};text-transform:uppercase}}
.reserve .rname{{font-family:{SERIF};font-size:11pt;color:{UMBER}}}
.reserve .rbrief{{font-family:{SERIF};font-style:italic;font-size:7.6pt;color:{MUTED};
 max-width:78%;line-height:1.4}}
.reserve .rgate{{font-family:{MONO};font-size:5.6pt;color:{MUTED};letter-spacing:.02em}}
.foot{{margin-top:auto}}
.foot-rule{{height:.3mm;background:{RULE_SOFT};margin-bottom:1.8mm}}
.foot-row{{display:flex;justify-content:space-between;align-items:baseline;gap:4mm;
 font-family:{MONO};font-size:5.7pt;color:{MUTED}}}
.folio{{font-family:{SANS};font-size:7.4pt;font-weight:700;color:{UMBER};letter-spacing:.06em}}
.canon{{border:.3mm solid {RULE};padding:2.4mm 3mm;margin-top:2.4mm;
 background:rgba(255,253,246,.5)}}
.canon .k{{font-family:{SANS};font-size:5.9pt;font-weight:700;letter-spacing:.16em;
 text-transform:uppercase;color:{UMBER};display:block;margin-bottom:1mm}}
.canon p{{font-family:{SERIF};font-style:italic;color:{UMBER};margin:0;font-size:8.4pt;
 line-height:1.45}}
.note{{font-family:{MONO};font-size:5.8pt;color:{MUTED};line-height:1.5}}
"""

RAIL = ('<div class="rail"><span class="wordmark">THYLORA</span><span class="sep">/</span>'
        '<span>ERSATZREALITY</span><span class="sep">·</span><span>HERB FILE 001</span>'
        '<span class="sep">·</span><span>WILLOW</span></div><div class="rail-rule"></div>')

FOOT = ('<div class="foot"><div class="foot-rule"></div><div class="foot-row">'
        '<span>PREVIEW — NOT ACTIVATED, NOT PUBLISHED, NOT SCHEDULED · '
        'RIGHTS: THYLORA · IMAGERY: NONE GENERATED</span>'
        '<span class="folio">{folio}</span></div></div>')

# ---------------------------------------------------------------- card (free post)
CARD = f"""
<div class="sheet" style="width:1080px;height:1350px">
 <div class="substrate"><div class="tone"></div><div class="fibre"></div><div class="edge"></div></div>
 <div class="pad" style="padding:52px 56px 46px 56px">
  {RAIL}
  <div style="margin-top:26px">
   <div class="eyebrow">Herb File 001 · Free Card · Recto</div>
   <h1 style="font-size:46px;line-height:1.1;margin-top:10px">He picked the right tree<br>
     for completely the wrong reason.</h1>
   <p class="lead" style="font-size:17.5px;line-height:1.5;margin-top:16px;max-width:84%">
     In 1763 an English parson chose willow bark because willow grows in wet ground and fevers
     came from wet ground. The logic was worthless. The bark was not.</p>
  </div>
  {reserve("Plate 1 — <i>Salix</i> specimen",
           "Bough, six to nine lanceolate leaves, two catkins, bark section at 2x scale. "
           "Charcoal and umber line, single accent on the catkins only. Earth-side: no barrier.",
           "430px", grow=True)}
  <div style="margin-top:22px;flex:none">
   {band("DOCUMENTED","Edward Stone gave willow bark to around fifty people with agues and wrote it up for the Royal Society in 1763.",True)}
   {band("TRADITION","He chose it by the doctrine of signatures — the belief that a plant growing where an illness comes from carries its answer.",True)}
   {band("MODERN SCIENCE","Willow bark holds salicin, and the line runs from there to aspirin — but willow bark is still not aspirin.",True)}
   {band("UNKNOWN","Whether the doses people actually took were ever near enough to matter. No dose records survive.",True)}
  </div>
  <div style="font-family:{SERIF};font-size:15.5px;color:{INK};margin-top:14px;
              border-top:.7mm solid {ACCENT};padding-top:14px;margin-top:18px">
    <b style="font-family:{SANS};font-size:11px;letter-spacing:.16em;color:{ACCENT}">
      THE OPEN QUESTION</b><br>
    <span style="font-size:23px;line-height:1.3;display:inline-block;margin-top:5px">If the reasoning was wrong, why did the plant work?</span>
  </div>
  <div class="note" style="margin-top:16px">
    A HISTORY FILE. NOT HEALTH ADVICE. NOT A RECOMMENDATION TO TAKE ANYTHING.
  </div>
  {FOOT.format(folio="CARD 001")}
 </div>
</div>"""

# ---------------------------------------------------------------- field-note page
PAGE = f"""
<div class="sheet" style="width:215.9mm;height:279.4mm">
 <div class="substrate"><div class="tone"></div><div class="fibre"></div><div class="edge"></div></div>
 <div class="pad" style="padding:15mm 16mm 16mm 16mm">
  {RAIL}
  <div style="margin-top:6mm">
   <div class="eyebrow">Page 12 · Specimen page · Field-note layout</div>
   <h1 style="font-size:23pt;line-height:1.12;margin-top:1.6mm">Willow bark is not aspirin.</h1>
  </div>
  <div style="display:flex;gap:7mm;margin-top:5mm;flex:1;min-height:0">
   <div style="flex:1;min-width:0;display:flex;flex-direction:column">
    <p class="lead" style="font-size:10.4pt;line-height:1.55">
      This is the page that protects the reader, so it is placed before anything that could be
      mistaken for encouragement. The chemistry line from bark to drug is real and dated. It
      does not run backwards: the existence of a manufactured drug derived from a plant is not
      evidence about the plant as people actually used it.</p>
    {band("DOCUMENTED","Acetylsalicylic acid irreversibly acetylates COX-1 in platelets. The salicylate route from willow does not act on platelets in the same way, so the two are not interchangeable.")}
    {band("DOCUMENTED","Salicin content varies widely between <i>Salix</i> species and with harvest conditions, so 'willow bark' is not one consistent material.")}
    {band("UNKNOWN","Whether any raw bark preparation reproduces results seen in studied standardised extracts. Not established.")}
    <div class="canon" style="margin-top:auto">
      <span class="k">THYLORA reads it this way</span>
      <p>The interesting thing is not that the old use was vindicated. It is that it was
      vindicated sideways — the plant led to a drug that works differently from the plant.
      That gap is where most plant writing quietly cheats.</p>
    </div>
   </div>
   <div style="width:44mm;flex:none;border-left:.3mm solid {RULE_SOFT};padding-left:4.5mm;display:flex;flex-direction:column">
    <div style="font-family:{SANS};font-size:5.9pt;font-weight:700;letter-spacing:.16em;
                color:{MUTED};text-transform:uppercase">Register index</div>
    <div style="margin-top:2.5mm">{index_rows()}</div>
    {reserve("Plate 2 detail","Final station of the bark-to-molecule line: where the plant stops and the manufactured drug begins.","58mm", grow=True)}
    <div class="note" style="margin-top:3mm">
      RULE WEIGHT CARRIES EPISTEMIC WEIGHT. SOLID/HEAVY = DOCUMENTED. DOTTED/LIGHT = UNKNOWN.
    </div>
   </div>
  </div>
  <div class="note" style="margin-top:3mm">
    NO DOSING. NO SAFETY CLEARANCE. NO TREATMENT CLAIM. DOCUMENTED RISK SIGNALS APPEAR ON PAGE 15.
  </div>
  {FOOT.format(folio="12")}
 </div>
</div>"""

HTML = f"""<!doctype html><meta charset="utf-8">
<title>HERB FILE 001 — Chairman preview</title>
<style>{CSS}
@page{{size:auto;margin:0}}
body{{padding:34px 0}} .sheet{{margin-bottom:34px;box-shadow:0 10px 34px rgba(0,0,0,.34)}}
</style>
{CARD}
{PAGE}
"""

out = pathlib.Path(__file__).parent / "out"
out.mkdir(parents=True, exist_ok=True)
(out / "herb-file-001-preview.html").write_text(HTML, encoding="utf-8")
print("wrote", out / "herb-file-001-preview.html")
