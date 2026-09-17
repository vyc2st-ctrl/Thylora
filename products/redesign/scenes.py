"""
World scenes and evidence diagrams.

Every scene is drawn deterministically in vector form from an explicit brief (see
BRIEFS in briefs.py). Nothing is sampled from an outside image and nothing is
photographic, so provenance is clean: creator = THYLORA build, rights = original.

Scenes that depict EdereAriah through the viewer plane carry the barrier overlay
(design.barrier_overlay). Earth-side or purely instructional diagrams do not: the
barrier marks the world boundary and must stay meaningful.
"""
import hashlib
import random
from design import (INK, CHARCOAL, UMBER, SEPIA, CREAM, PAPER, PAPER_DEEP, RULE,
                    RULE_SOFT, MUTED, barrier_defs, barrier_overlay, SANS, MONO, SERIF)


ASSET_LOG = []


def _log_asset(name, svg, w, h):
    ASSET_LOG.append({
        "component": name,
        "sha256": hashlib.sha256(svg.encode("utf-8")).hexdigest(),
        "bytes": len(svg.encode("utf-8")),
        "viewbox": f"0 0 {w} {h}",
    })


def _svg(w, h, defs, body, cls="fig", fill=False):
    if fill:
        return (f'<div class="{cls} fig-fill"><svg viewBox="0 0 {w} {h}" '
                f'preserveAspectRatio="xMidYMid slice" '
                f'style="display:block;width:100%;height:100%" '
                f'xmlns="http://www.w3.org/2000/svg">'
                f'<defs>{defs}</defs>{body}</svg></div>')
    return (f'<div class="{cls}"><svg viewBox="0 0 {w} {h}" width="100%" '
            f'style="display:block" xmlns="http://www.w3.org/2000/svg">'
            f'<defs>{defs}</defs>{body}</svg></div>')


def _cap(text):
    return f'<div class="figcap">{text}</div>'


# ----------------------------------------------------------------- Bramble Wick
def lantern_window(seed=11, accent="#C0842F", w=300, h=190):
    """BRIEF: east window of a hill-town house, storm night, single lantern, wick lowered.
    Geometry: interior sill foreground, mullioned window, rain on glass, hills beyond."""
    rnd = random.Random(seed)
    def _rain(n, x0, x1, y0, y1, op_lo, op_hi, ln_lo, ln_hi, wid):
        out = []
        for _ in range(n):
            x = rnd.uniform(x0, x1); y = rnd.uniform(y0, y1)
            ln = rnd.uniform(ln_lo, ln_hi)
            dx = -ln * 0.34                      # wind drives it left, consistently
            out.append(f'<line x1="{x:.1f}" y1="{y:.1f}" x2="{x+dx:.1f}" y2="{y+ln:.1f}" '
                       f'stroke="#F2EADA" stroke-opacity="{rnd.uniform(op_lo,op_hi):.2f}" '
                       f'stroke-width="{wid}" stroke-linecap="round"/>')
        return "".join(out)
    rain = _rain(70, 28, 272, 14, 126, .10, .22, 5, 11, 0.5)      # far rain
    rain += _rain(26, 28, 272, 14, 126, .22, .38, 9, 16, 0.8)     # near rain
    # water on the glass: beads and runs, the reason the pane reads as wet
    beads = "".join(
        f'<circle cx="{rnd.uniform(30,270):.1f}" cy="{rnd.uniform(20,124):.1f}" '
        f'r="{rnd.uniform(.5,1.3):.2f}" fill="#F2EADA" fill-opacity="{rnd.uniform(.10,.24):.2f}"/>'
        for _ in range(34))
    runs = "".join(
        f'<path d="M{(rx:=rnd.uniform(34,266)):.1f},{(ry:=rnd.uniform(20,60)):.1f} '
        f'q{rnd.uniform(-1.6,1.6):.1f},{rnd.uniform(10,20):.1f} {rnd.uniform(-2.4,2.4):.1f},'
        f'{rnd.uniform(26,48):.1f}" stroke="#F2EADA" stroke-opacity="{rnd.uniform(.08,.18):.2f}" '
        f'stroke-width="{rnd.uniform(.5,1.1):.2f}" fill="none"/>'
        for _ in range(9))
    rain += beads + runs
    hills = ('<path d="M26,120 L62,96 L92,110 L128,84 L166,106 L202,88 L238,108 L274,98 '
             'L274,132 L26,132 Z" fill="#2A2420" fill-opacity=".55"/>')
    far_lights = "".join(
        f'<circle cx="{x}" cy="{y}" r="1.5" fill="{accent}" fill-opacity="{op}"/>'
        for x, y, op in [(70,112,.20),(110,101,.12),(150,116,.08),(196,101,.16),(232,114,.07)])
    defs = barrier_defs(seed, .85) + f"""
<linearGradient id="sky{seed}" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0%" stop-color="#3A322A"/><stop offset="100%" stop-color="#5A4C3C"/>
</linearGradient>
<radialGradient id="flame{seed}" cx="50%" cy="46%" r="52%">
  <stop offset="0%" stop-color="#FFE9B8" stop-opacity=".97"/>
  <stop offset="38%" stop-color="{accent}" stop-opacity=".72"/>
  <stop offset="100%" stop-color="{accent}" stop-opacity="0"/>
</radialGradient>
<radialGradient id="glow{seed}" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="{accent}" stop-opacity=".40"/>
  <stop offset="55%" stop-color="{accent}" stop-opacity=".12"/>
  <stop offset="100%" stop-color="{accent}" stop-opacity="0"/>
</radialGradient>"""
    body = f"""
<rect width="{w}" height="{h}" fill="{PAPER_DEEP}"/>
<g>
  <rect x="26" y="18" width="248" height="114" fill="url(#sky{seed})"/>
  {hills}{far_lights}{rain}
  <!-- lantern glow reaching the glass -->
  <ellipse cx="214" cy="120" rx="62" ry="44" fill="url(#glow{seed})"/>
  <!-- window frame: mullions -->
  <g stroke="#241F1A" stroke-width="3" fill="none">
    <rect x="26" y="18" width="248" height="114"/>
    <line x1="150" y1="18" x2="150" y2="132"/><line x1="26" y1="75" x2="274" y2="75"/>
  </g>
  <g stroke="#241F1A" stroke-width="1.1" fill="none" opacity=".8">
    <line x1="88" y1="18" x2="88" y2="132"/><line x1="212" y1="18" x2="212" y2="132"/>
  </g>
  <!-- sill -->
  <rect x="18" y="132" width="264" height="13" fill="#3A322A"/>
  <rect x="18" y="132" width="264" height="3" fill="#4E4136" opacity=".8"/>
  <!-- lantern body on the sill, set back from the draft -->
  <g>
    <rect x="200" y="96" width="28" height="36" rx="2" fill="#2C2620"/>
    <rect x="203" y="100" width="22" height="26" fill="#120F0C"/>
    <ellipse cx="214" cy="113" rx="11" ry="14" fill="url(#flame{seed})"/>
    <path d="M214,120 C211,114 212,109 214,105 C216,109 217,114 214,120 Z"
          fill="#FFF2CF" fill-opacity=".92"/>
    <rect x="197" y="92" width="34" height="5" rx="1.6" fill="#3A322A"/>
    <path d="M206,92 C206,84 222,84 222,92" stroke="#3A322A" stroke-width="2.2" fill="none"/>
    <rect x="200" y="130" width="28" height="4" rx="1" fill="#241F1A"/>
  </g>
  <!-- warm pool cast on the sill -->
  <ellipse cx="214" cy="140" rx="42" ry="6" fill="{accent}" fill-opacity=".20"/>
</g>
{barrier_overlay(seed, w, h, .85)}
<rect width="{w}" height="{h}" fill="none" stroke="{RULE}" stroke-width="0.8"/>"""
    return _svg(w, h, defs, body) + _cap(
        "East window, Bramble Wick &#183; wick lowered, lantern moved off the draft &#183; "
        "seen through the interworld film")


def valley_lights(seed=12, accent="#C0842F", w=300, h=92):
    """BRIEF: valley at the height of the storm; lights disappearing one by one; one stays."""
    rnd = random.Random(seed + 3)
    houses, lights = [], []
    xs = [34, 62, 92, 124, 152, 184, 214, 246, 272]
    on = {2: True, 5: False, 8: False}
    for i, x in enumerate(xs):
        y = 56 + rnd.uniform(-9, 7)
        houses.append(f'<path d="M{x-9},{y+14} L{x-9},{y+2} L{x},{y-6} L{x+9},{y+2} '
                      f'L{x+9},{y+14} Z" fill="#2A2420" fill-opacity=".72"/>')
        lit = (i == 4)
        if lit:
            lights.append(f'<circle cx="{x}" cy="{y+6}" r="9" fill="{accent}" fill-opacity=".22"/>'
                          f'<rect x="{x-2.2}" y="{y+3}" width="4.4" height="5" fill="{accent}"/>')
        elif i in (0, 3, 7):
            lights.append(f'<rect x="{x-2.2}" y="{y+3}" width="4.4" height="5" '
                          f'fill="{accent}" fill-opacity=".16"/>')
        else:
            lights.append(f'<rect x="{x-2.2}" y="{y+3}" width="4.4" height="5" '
                          f'fill="#1A1714" fill-opacity=".45"/>')
    defs = barrier_defs(seed, .7)
    body = f"""
<rect width="{w}" height="{h}" fill="#4A3F34"/>
<g>
  <path d="M0,74 L40,62 L80,70 L120,58 L160,68 L200,56 L240,66 L300,58 L300,92 L0,92 Z"
        fill="#241F1A" fill-opacity=".85"/>
  {''.join(houses)}{''.join(lights)}
</g>
{barrier_overlay(seed, w, h, .7)}"""
    return _svg(w, h, defs, body) + _cap(
        "Across the valley, one light after another went out. Mara&#8217;s stayed.")


def wheel_pin(seed=13, accent="#C0842F", w=300, h=104):
    """BRIEF: the broken wheel-pin, laid on a table as evidence. Iron, sheared, worn."""
    defs = f"""<linearGradient id="iron{seed}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#6E6358"/><stop offset="48%" stop-color="#3E372F"/>
      <stop offset="100%" stop-color="#574C40"/></linearGradient>"""
    body = f"""
<rect width="{w}" height="{h}" fill="{PAPER}"/>
<g stroke="{RULE}" stroke-width="0.5" opacity=".55">
  <line x1="0" y1="78" x2="300" y2="78"/></g>
<ellipse cx="150" cy="80" rx="76" ry="6" fill="{UMBER}" fill-opacity=".16"/>
<g>
  <rect x="78" y="46" width="118" height="13" rx="6" fill="url(#iron{seed})"/>
  <path d="M196,46 L214,50 L214,55 L196,59 Z" fill="url(#iron{seed})"/>
  <!-- sheared end: the break that stranded the cart -->
  <path d="M78,46 L70,49 L74,53 L68,56 L78,59 Z" fill="#2E2823"/>
  <circle cx="104" cy="52.5" r="4.6" fill="#241F1A" fill-opacity=".55"/>
  <g stroke="#241F1A" stroke-opacity=".35" stroke-width="0.7">
    <line x1="120" y1="47" x2="126" y2="58"/><line x1="140" y1="47" x2="146" y2="58"/>
    <line x1="164" y1="48" x2="169" y2="57"/></g>
</g>
<g font-family="{MONO}" font-size="7" fill="{MUTED}">
  <line x1="70" y1="36" x2="70" y2="42" stroke="{RULE}" stroke-width=".6"/>
  <line x1="214" y1="36" x2="214" y2="42" stroke="{RULE}" stroke-width=".6"/>
  <line x1="70" y1="39" x2="214" y2="39" stroke="{RULE}" stroke-width=".6"/>
  <text x="142" y="33" text-anchor="middle">kept</text>
</g>
<text x="150" y="96" text-anchor="middle" font-family="{SANS}" font-size="7.4"
      letter-spacing="1.6" fill="{accent}">THE BROKEN WHEEL-PIN</text>"""
    return _svg(w, h, defs, body) + _cap(
        "Object held in the family &#183; iron, sheared at one end &#183; "
        "no Earth artefact is represented")


# ----------------------------------------------------------------- The Last Match
def pitch_pass(seed=21, accent="#4E6B4A", w=300, h=178):
    """BRIEF: community pitch, half clover, five minutes left. The shot Tomas had and the
    pass he made. Diagram reads as a match programme, not a coaching chart."""
    rnd = random.Random(seed)
    clover = "".join(
        f'<circle cx="{rnd.uniform(16,284):.0f}" cy="{rnd.uniform(24,150):.0f}" '
        f'r="{rnd.uniform(.8,2.0):.1f}" fill="#6E7F5E" fill-opacity="{rnd.uniform(.16,.36):.2f}"/>'
        for _ in range(120))
    defs = barrier_defs(seed, .6) + f"""
<linearGradient id="turf{seed}" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0%" stop-color="#7D8A६B"/><stop offset="100%" stop-color="#6A7758"/>
</linearGradient>""".replace("६", "6")
    body = f"""
<rect width="{w}" height="{h}" fill="url(#turf{seed})"/>
<g opacity=".5">{clover}</g>
<g>
  <!-- chalk: the second line, straight enough for everybody except Tomas -->
  <g stroke="#F4EFE4" stroke-opacity=".88" stroke-width="1.6" fill="none">
    <rect x="16" y="20" width="268" height="132"/>
    <line x1="150" y1="20" x2="150" y2="152"/>
    <circle cx="150" cy="86" r="26" fill="none"/>
    <rect x="16" y="52" width="40" height="68"/>
    <rect x="244" y="52" width="40" height="68"/>
  </g>
  <!-- the first line: curved toward the garden fence, drawn over, still faintly there -->
  <path d="M16,152 C90,149 170,157 284,150" stroke="#F4EFE4" stroke-opacity=".30"
        stroke-width="1.5" fill="none" stroke-dasharray="5 4"/>
  <!-- the shot he could have taken -->
  <path d="M232,74 L276,86" stroke="#F4EFE4" stroke-opacity=".38" stroke-width="1.2"
        stroke-dasharray="3 3" fill="none"/>
  <text x="292" y="68" text-anchor="end" font-family="{SANS}" font-size="6.2" fill="#F4EFE4"
        fill-opacity=".62" letter-spacing="1">HIS KIND OF NARROW</text>
  <!-- the pass -->
  <path d="M232,74 C238,52 246,44 258,40" stroke="{accent}" stroke-width="2.4"
        fill="none" marker-end="url(#ah{seed})"/>
  <circle cx="232" cy="74" r="4.4" fill="#F4EFE4" stroke="{INK}" stroke-width=".8"/>
  <circle cx="258" cy="40" r="4.4" fill="{accent}" stroke="#F4EFE4" stroke-width=".9"/>
  <text x="212" y="88" font-family="{SANS}" font-size="7" fill="#F4EFE4" letter-spacing=".8">TOMAS</text>
  <text x="250" y="31" font-family="{SANS}" font-size="7" fill="#F4EFE4" letter-spacing=".8">MALIK 16</text>
</g>
<marker id="ah{seed}" markerWidth="7" markerHeight="7" refX="5.4" refY="3" orient="auto">
  <path d="M0,0 L6,3 L0,6 Z" fill="{accent}"/></marker>
{barrier_overlay(seed, w, h, .6)}
<g font-family="{MONO}" font-size="6.6" fill="#F4EFE4" fill-opacity=".75">
  <text x="20" y="168">HARBOR ELEVEN &#183; COMMUNITY MATCH &#183; 5 MIN REMAINING</text>
</g>"""
    return _svg(w, h, defs, body) + _cap(
        "The opening he had, and the pass he chose &#183; the first chalk line still shows")


def legacy_objects(seed=22, accent="#4E6B4A", w=300, h=96):
    """BRIEF: three objects that carry the legacy: chalk machine, captain's band, boots."""
    defs = ""
    body = f"""
<rect width="{w}" height="{h}" fill="{PAPER}"/>
<g stroke="{RULE_SOFT}" stroke-width=".5"><line x1="100" y1="12" x2="100" y2="84"/>
<line x1="200" y1="12" x2="200" y2="84"/></g>
<!-- chalk machine -->
<g transform="translate(50,50)">
  <rect x="-16" y="-10" width="32" height="18" rx="2" fill="#5A4C3C"/>
  <rect x="-12" y="-16" width="8" height="7" fill="#6E6054"/>
  <circle cx="-10" cy="10" r="5" fill="#3A322A"/><circle cx="10" cy="10" r="5" fill="#3A322A"/>
  <path d="M14,-8 L26,-24" stroke="#5A4C3C" stroke-width="2.4"/>
  <rect x="-18" y="14" width="36" height="2" fill="#F4EFE4" fill-opacity=".75"/>
</g>
<!-- captain's band -->
<g transform="translate(150,48)">
  <path d="M-20,-7 C-8,-13 8,-13 20,-7 L20,7 C8,13 -8,13 -20,7 Z" fill="{accent}"/>
  <path d="M-20,-7 C-8,-13 8,-13 20,-7" stroke="#F4EFE4" stroke-opacity=".5" fill="none"/>
  <text x="0" y="3" text-anchor="middle" font-family="{SANS}" font-size="7"
        fill="#F2EADA" letter-spacing="1.4">CAPT</text>
</g>
<!-- boots, tied slowly -->
<g transform="translate(250,52)">
  <path d="M-18,6 C-18,-4 -12,-10 -4,-10 L2,-10 L4,0 L16,4 L16,10 L-18,10 Z" fill="#3E372F"/>
  <path d="M-12,-6 L0,-4 M-12,-2 L0,0 M-12,2 L1,4" stroke="#EDE4D2" stroke-opacity=".6"
        stroke-width=".9"/>
</g>
<g font-family="{SANS}" font-size="6.2" fill="{MUTED}" letter-spacing="1.1" text-anchor="middle">
  <text x="50" y="80">CHALK MACHINE</text><text x="150" y="80">THE BAND</text>
  <text x="250" y="80">HIS OWN POWER</text>
</g>"""
    return _svg(w, h, defs, body) + _cap(
        "What passes between generations &#183; he gave the band to the team, not to a successor")


# ----------------------------------------------------------------- The City
def city_map(seed=31, accent="#3E6B8A", w=300, h=208):
    """BRIEF: the city at 4:47. Morrow Street, the grid, what draws power, what stores it.
    The reader must be able to SEE the system, not be told it exists."""
    rnd = random.Random(seed)
    defs = barrier_defs(seed, .5) + f"""
<linearGradient id="heat{seed}" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0%" stop-color="#C98A4B" stop-opacity=".16"/>
  <stop offset="100%" stop-color="#C98A4B" stop-opacity=".04"/></linearGradient>"""
    # street grid
    streets = []
    for x in range(30, 290, 36):
        streets.append(f'<line x1="{x}" y1="26" x2="{x}" y2="176" stroke="{PAPER_DEEP}" stroke-width="5"/>')
    for y in range(44, 180, 34):
        streets.append(f'<line x1="24" y1="{y}" x2="288" y2="{y}" stroke="{PAPER_DEEP}" stroke-width="5"/>')
    blocks = []
    for x in range(34, 280, 36):
        for y in range(48, 170, 34):
            if rnd.random() < .82:
                bw, bh = rnd.uniform(14, 26), rnd.uniform(12, 20)
                blocks.append(f'<rect x="{x:.0f}" y="{y:.0f}" width="{bw:.0f}" height="{bh:.0f}" '
                              f'fill="{UMBER}" fill-opacity="{rnd.uniform(.14,.30):.2f}"/>')
    nodes = [
        (66, 78, "HOSPITAL", "#A0524A"), (138, 112, "LIBRARY\nBATTERY", accent),
        (210, 78, "TRAINS", UMBER), (246, 146, "LAUNDRY", UMBER),
        (102, 146, "SHOPS", UMBER), (174, 44, "WORKSHOPS", UMBER),
    ]
    node_svg = []
    for nx, ny, label, col in nodes:
        node_svg.append(
            f'<circle cx="{nx}" cy="{ny}" r="7.5" fill="{CREAM}" stroke="{col}" stroke-width="1.8"/>'
            f'<circle cx="{nx}" cy="{ny}" r="3" fill="{col}"/>')
        for i, ln in enumerate(label.split("\n")):
            node_svg.append(f'<text x="{nx}" y="{ny+17+i*7.4}" text-anchor="middle" '
                            f'font-family="{SANS}" font-size="6" letter-spacing=".7" '
                            f'fill="{CHARCOAL}">{ln}</text>')
    # feeders from substation
    feeders = "".join(
        f'<path d="M150,192 C150,{170-i*6} {nx},{ny+46} {nx},{ny+9}" stroke="{accent}" '
        f'stroke-width="1.5" stroke-opacity=".62" fill="none"/>'
        for i, (nx, ny, _, _) in enumerate(nodes))
    body = f"""
<rect width="{w}" height="{h}" fill="{PAPER}"/>
<rect width="{w}" height="{h}" fill="url(#heat{seed})"/>
<g>
  {''.join(blocks)}{''.join(streets)}
  <!-- Morrow Street, named and findable -->
  <line x1="24" y1="112" x2="288" y2="112" stroke="{SEPIA}" stroke-width="6" stroke-opacity=".85"/>
  <text x="28" y="108" font-family="{SANS}" font-size="6.6" letter-spacing="1.3"
        fill="{INK}">MORROW STREET</text>
  {feeders}
  <!-- substation -->
  <rect x="136" y="186" width="28" height="16" rx="2" fill="{CHARCOAL}"/>
  <text x="150" y="197" text-anchor="middle" font-family="{SANS}" font-size="5.8"
        fill="{CREAM}" letter-spacing=".8">SUPPLY</text>
  {''.join(node_svg)}
  <!-- the failing transformer crews replaced -->
  <g transform="translate(246,112)">
    <rect x="-5" y="-5" width="10" height="10" fill="{CREAM}" stroke="#A0524A" stroke-width="1.6"/>
    <path d="M-2.5,-2.5 L2.5,2.5 M2.5,-2.5 L-2.5,2.5" stroke="#A0524A" stroke-width="1.5"/>
    <text x="0" y="-9" text-anchor="middle" font-family="{SANS}" font-size="5.6"
          fill="#A0524A" letter-spacing=".6">FAILING TRANSFORMER</text>
  </g>
</g>
{barrier_overlay(seed, w, h, .5)}
<rect width="{w}" height="{h}" fill="none" stroke="{RULE}" stroke-width="0.8"/>"""
    return _svg(w, h, defs, body) + _cap(
        "The city as a system &#183; one supply, many simultaneous requests, "
        "one battery that can answer locally")


def demand_curve(seed=32, accent="#3E6B8A", w=300, h=132):
    """BRIEF: the 4:47 peak, before and after the night test. Honest axes, no invented units."""
    pts_before = [(0,58),(30,56),(60,52),(90,44),(120,30),(150,18),(180,24),(210,36),(240,48),(270,56)]
    pts_after  = [(0,58),(30,57),(60,55),(90,50),(120,42),(150,38),(180,40),(210,44),(240,52),(270,58)]
    def path(pts, oy=0):
        return "M" + " L".join(f"{22+x*0.94:.1f},{oy+96-y:.1f}" for x, y in pts)
    defs = ""
    body = f"""
<rect width="{w}" height="{h}" fill="{PAPER}"/>
<g stroke="{RULE_SOFT}" stroke-width=".5">
  {''.join(f'<line x1="22" y1="{96-v}" x2="278" y2="{96-v}"/>' for v in (0,20,40,60))}
</g>
<line x1="22" y1="96" x2="278" y2="96" stroke="{CHARCOAL}" stroke-width="1"/>
<line x1="22" y1="16" x2="22" y2="96" stroke="{CHARCOAL}" stroke-width="1"/>
<path d="{path(pts_before)}" stroke="#A0524A" stroke-width="2" fill="none"/>
<path d="{path(pts_after)}" stroke="{accent}" stroke-width="2" fill="none" stroke-dasharray="4 2.5"/>
<line x1="163" y1="16" x2="163" y2="96" stroke="{UMBER}" stroke-width=".8" stroke-dasharray="2 2"/>
<text x="166" y="24" font-family="{MONO}" font-size="6.6" fill="{UMBER}">4:47</text>
<g font-family="{SANS}" font-size="6.2" fill="{MUTED}" letter-spacing=".7">
  <text x="22" y="108">EARLY</text><text x="140" y="108">HOT AFTERNOON</text>
  <text x="248" y="108">NIGHT</text>
  <text x="6" y="20" transform="rotate(-90 6,20)">DEMAND</text>
</g>
<g font-family="{SANS}" font-size="6.4" letter-spacing=".6">
  <rect x="180" y="112" width="8" height="2.4" fill="#A0524A"/>
  <text x="192" y="116" fill="{CHARCOAL}">the day it blinked</text>
  <rect x="180" y="121" width="8" height="2.4" fill="{accent}"/>
  <text x="192" y="125" fill="{CHARCOAL}">after the three-block test</text>
</g>
<text x="22" y="125" font-family="{MONO}" font-size="5.8" fill="{MUTED}">
  shape only &#183; no measured units are claimed</text>"""
    return _svg(w, h, defs, body) + _cap(
        "Same supply, flatter peak &#183; nothing was added that one machine could have done alone")


def three_blocks(seed=33, accent="#3E6B8A", w=300, h=108):
    """BRIEF: what each of the three blocks actually did. Cause and effect, participation voluntary."""
    items = [("SHOPS", "cooled storage early", "moved load off the peak"),
             ("LIBRARY", "battery carried the block", "supplied the evening hour"),
             ("LAUNDROMAT", "discounted later cycles", "people chose to shift")]
    cards = []
    for i, (who, did, effect) in enumerate(items):
        x = 10 + i * 96
        cards.append(f"""
<g transform="translate({x},10)">
  <rect width="88" height="70" fill="{CREAM}" stroke="{RULE}" stroke-width=".7"/>
  <rect width="88" height="4" fill="{accent}" fill-opacity=".8"/>
  <text x="8" y="19" font-family="{SANS}" font-size="7" font-weight="bold"
        letter-spacing="1" fill="{INK}">{who}</text>
  <foreignObject x="8" y="24" width="72" height="24">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:{SANS};font-size:6.4pt;
      line-height:1.3;color:{CHARCOAL}">{did}</div></foreignObject>
  <line x1="8" y1="50" x2="80" y2="50" stroke="{RULE_SOFT}" stroke-width=".6"/>
  <foreignObject x="8" y="52" width="72" height="18">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:{SANS};font-size:6pt;
      line-height:1.25;color:{MUTED}">{effect}</div></foreignObject>
</g>""")
    arrows = "".join(
        f'<path d="M{98+i*96},45 L{104+i*96},45" stroke="{UMBER}" stroke-width="1.4" '
        f'marker-end="url(#ar{seed})"/>' for i in range(2))
    body = f"""
<rect width="{w}" height="{h}" fill="{PAPER}"/>
<marker id="ar{seed}" markerWidth="6" markerHeight="6" refX="4.6" refY="2.6" orient="auto">
  <path d="M0,0 L5,2.6 L0,5 Z" fill="{UMBER}"/></marker>
{''.join(cards)}{arrows}
<text x="150" y="98" text-anchor="middle" font-family="{SANS}" font-size="6.4"
      letter-spacing="1" fill="{MUTED}">PARTICIPATION WAS VOLUNTARY &#183; NO SINGLE BLOCK &#8220;FIXED IT&#8221;</text>"""
    return _svg(w, h, "", body) + _cap("Which things worked together")


# ----------------------------------------------------------------- The Handoff
def three_lists(seed=41, accent="#9A7B3F", w=300, h=150):
    """BRIEF: the inventory Mara made. Three columns; the third is the one that matters."""
    cols = [("FACTS", ["contracts", "schedules", "passwords", "maintenance", "risks"], RULE),
            ("JUDGMENTS", ["who needs time", "dangerous shortcuts",
                           "when a quiet room", "means agreement", "or fear"], RULE),
            ("THINGS MARA MAY", ["BE WRONG ABOUT", "", "&#8220;If I hand you only",
                                 "my certainty, I am", "handing you a cage.&#8221;"], accent)]
    out = []
    for i, (title, rows, col) in enumerate(cols):
        x = 8 + i * 97
        hl = (i == 2)
        out.append(f"""
<g transform="translate({x},10)">
  <rect width="90" height="122" fill="{'#FBF6EA' if hl else CREAM}"
        stroke="{col}" stroke-width="{1.5 if hl else .7}"/>
  <rect width="90" height="16" fill="{col}" fill-opacity="{.9 if hl else .18}"/>
  <text x="45" y="11.4" text-anchor="middle" font-family="{SANS}" font-size="6.6"
        font-weight="bold" letter-spacing=".9"
        fill="{CREAM if hl else INK}">{title}</text>
  {''.join(f'<text x="7" y="{31+j*15}" font-family="{SANS}" font-size="6.4" fill="{CHARCOAL}">{r}</text>'
           f'<line x1="7" y1="{34+j*15}" x2="83" y2="{34+j*15}" stroke="{RULE_SOFT}" stroke-width=".4"/>'
           for j, r in enumerate(rows))}
</g>""")
    body = f"""<rect width="{w}" height="{h}" fill="{PAPER}"/>{''.join(out)}
<text x="150" y="144" text-anchor="middle" font-family="{SANS}" font-size="6.2"
      letter-spacing=".9" fill="{MUTED}">AN INVENTORY, NOT A CEREMONY</text>"""
    return _svg(w, h, "", body) + _cap("The three lists &#183; the third list is the handoff")


def key_to_log(seed=42, accent="#9A7B3F", w=300, h=112):
    """BRIEF: single brass key replaced by logged access. Responsibility becomes visible."""
    defs = f"""<linearGradient id="brass{seed}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#C6A45E"/><stop offset="60%" stop-color="{accent}"/>
      <stop offset="100%" stop-color="#6E5628"/></linearGradient>"""
    rows = "".join(
        f'<g transform="translate(0,{j*13})">'
        f'<rect x="0" y="0" width="112" height="10" fill="{CREAM}" stroke="{RULE}" stroke-width=".5"/>'
        f'<rect x="0" y="0" width="3" height="10" fill="{accent}" fill-opacity=".75"/>'
        f'<text x="7" y="7.2" font-family="{MONO}" font-size="5.6" fill="{CHARCOAL}">{t}</text></g>'
        for j, t in enumerate(["06:02 open / E.SORREL",
                               "06:14 press four / MAINT",
                               "08:30 records / OPEN",
                               "10:00 visitor / M.VENN"]))
    body = f"""
<rect width="{w}" height="{h}" fill="{PAPER}"/>
<g transform="translate(44,56)">
  <circle cx="0" cy="0" r="15" fill="none" stroke="url(#brass{seed})" stroke-width="6"/>
  <rect x="12" y="-3.4" width="42" height="6.8" fill="url(#brass{seed})"/>
  <rect x="44" y="3.4" width="5" height="9" fill="url(#brass{seed})"/>
  <rect x="34" y="3.4" width="4" height="7" fill="url(#brass{seed})"/>
</g>
<text x="44" y="94" text-anchor="middle" font-family="{SANS}" font-size="6.2"
      letter-spacing="1" fill="{MUTED}">ONE KEY</text>
<path d="M112,56 L142,56" stroke="{CHARCOAL}" stroke-width="1.4" marker-end="url(#k{seed})"/>
<marker id="k{seed}" markerWidth="7" markerHeight="7" refX="5.4" refY="3" orient="auto">
  <path d="M0,0 L6,3 L0,6 Z" fill="{CHARCOAL}"/></marker>
<g transform="translate(152,30)">{rows}</g>
<text x="208" y="94" text-anchor="middle" font-family="{SANS}" font-size="6.2"
      letter-spacing="1" fill="{MUTED}">LOGGED ACCESS FOR THE PEOPLE WHO NEED IT</text>"""
    return _svg(w, h, defs, body) + _cap(
        "The first thing Eli changed &#183; the predecessor is not performed, the purpose is protected")


def press_four(seed=43, accent="#9A7B3F", w=300, h=104):
    """BRIEF: the decision at Press Four. Old workaround vs. the twenty minutes."""
    body = f"""
<rect width="{w}" height="{h}" fill="{PAPER}"/>
<g transform="translate(12,14)">
  <rect width="130" height="74" fill="{CREAM}" stroke="{RULE}" stroke-width=".7"/>
  <text x="9" y="16" font-family="{SANS}" font-size="6.6" font-weight="bold"
        letter-spacing=".9" fill="{MUTED}">THE SHORTCUT</text>
  <text x="9" y="31" font-family="{SANS}" font-size="6.4" fill="{CHARCOAL}">works today</text>
  <text x="9" y="44" font-family="{SANS}" font-size="6.4" fill="{CHARCOAL}">violates the new</text>
  <text x="9" y="55" font-family="{SANS}" font-size="6.4" fill="{CHARCOAL}">safety procedure</text>
  <text x="9" y="68" font-family="{MONO}" font-size="5.8" fill="#A0524A">failure returned 6&#215;</text>
</g>
<g transform="translate(158,14)">
  <rect width="130" height="74" fill="#FBF6EA" stroke="{accent}" stroke-width="1.4"/>
  <text x="9" y="16" font-family="{SANS}" font-size="6.6" font-weight="bold"
        letter-spacing=".9" fill="{accent}">WHAT ELI ASKED FOR</text>
  <text x="9" y="31" font-family="{SANS}" font-size="6.4" fill="{CHARCOAL}">twenty minutes</text>
  <text x="9" y="44" font-family="{SANS}" font-size="6.4" fill="{CHARCOAL}">maintenance records</text>
  <text x="9" y="55" font-family="{SANS}" font-size="6.4" fill="{CHARCOAL}">permission to miss</text>
  <text x="9" y="66" font-family="{SANS}" font-size="6.4" fill="{CHARCOAL}">today&#8217;s target</text>
</g>
<text x="150" y="98" text-anchor="middle" font-family="{SANS}" font-size="6.2"
      letter-spacing=".9" fill="{MUTED}">COST: ONE AFTERNOON &#183; REMOVED: A REPEATING FAILURE</text>"""
    return _svg(w, h, "", body) + _cap("&#8220;My shortcut would have worked.&#8221; &#8212; &#8220;Today.&#8221;")


# ----------------------------------------------------------------- Build a World
def expansion_map(seed=51, accent="#6B5A8E", w=300, h=210):
    """BRIEF: one idea expanding through nine stages. Dependency, not decoration:
    every arrow is a real 'cannot exist without'."""
    stages = ["IDEA","PEOPLE","PLACE","WORK","OBJECTS","SYSTEMS","CULTURE","STORY","COMMERCE"]
    import math
    cx, cy = 150, 100
    nodes = []
    pos = []
    for i, s in enumerate(stages):
        if i == 0:
            x, y = cx, cy
        else:
            a = -math.pi/2 + (i-1) * (2*math.pi/8)
            r = 74
            x, y = cx + r*math.cos(a), cy + r*math.sin(a)
        pos.append((x, y))
    spokes = "".join(
        f'<line x1="{pos[0][0]}" y1="{pos[0][1]}" x2="{pos[i][0]:.1f}" y2="{pos[i][1]:.1f}" '
        f'stroke="{accent}" stroke-opacity=".30" stroke-width="1"/>' for i in range(1, 9))
    ring = "".join(
        f'<line x1="{pos[i][0]:.1f}" y1="{pos[i][1]:.1f}" x2="{pos[i%8+1][0]:.1f}" '
        f'y2="{pos[i%8+1][1]:.1f}" stroke="{UMBER}" stroke-opacity=".38" stroke-width="1.2"/>'
        for i in range(1, 9))
    for i, (x, y) in enumerate(pos):
        r = 17 if i == 0 else 13.5
        fill = accent if i == 0 else CREAM
        txt = CREAM if i == 0 else INK
        nodes.append(
            f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r}" fill="{fill}" stroke="{accent}" '
            f'stroke-width="{1.8 if i==0 else 1.1}"/>'
            f'<text x="{x:.1f}" y="{y+2.2:.1f}" text-anchor="middle" font-family="{SANS}" '
            f'font-size="{5.6 if i else 6.4}" font-weight="bold" letter-spacing=".5" '
            f'fill="{txt}">{stages[i]}</text>')
    body = f"""
<rect width="{w}" height="{h}" fill="{PAPER}"/>
{spokes}{ring}{''.join(nodes)}
<text x="150" y="198" text-anchor="middle" font-family="{SANS}" font-size="6.2"
      letter-spacing=".9" fill="{MUTED}">EVERY LINE IS A DEPENDENCY &#183; MOVE ONE AND CHECK THE REST</text>"""
    return _svg(w, h, "", body) + _cap(
        "The expansion the workbook performs on your own idea")


def worksheet_block(prompt, hint="", lines=3, tight=False):
    cls = "ln tight" if tight else "ln"
    h = '<div class="hint">%s</div>' % hint if hint else ""
    rules = "".join('<div class="%s"></div>' % cls for _ in range(lines))
    return ('<div class="prompt">%s</div>%s<div class="write">%s</div>' % (prompt, h, rules))


# ----------------------------------------------------------------- Question Deck
def class_mark(cls, size=10):
    """Tick pattern + colour so classes survive greyscale printing."""
    col, n = DECK_CLASS_LOCAL[cls]
    ticks = "".join(f'<rect x="{i*2.6}" y="0" width="1.5" height="{size}" fill="{col}"/>'
                    for i in range(n))
    return (f'<svg width="{n*2.6+1}" height="{size}" viewBox="0 0 {n*2.6+1} {size}" '
            f'style="display:inline-block;vertical-align:-1px">{ticks}</svg>')


from design import DECK_CLASS as DECK_CLASS_LOCAL  # noqa: E402


def card_anatomy(seed=61, w=300, h=150, fill=False):
    """BRIEF: legend page. Teaches the card architecture once so 50 cards need no boilerplate.
    Font sizes are in viewBox units (not pt) because the figure is scaled to page width."""
    accent = "#6B5A8E"
    rules = "".join(f'<line x1="9" y1="{74+i*8.4:.1f}" x2="123" y2="{74+i*8.4:.1f}" '
                    f'stroke="{RULE}" stroke-width=".4"/>' for i in range(6))
    body = f"""
<rect width="{w}" height="{h}" fill="{PAPER}"/>
<g transform="translate(18,12)">
  <rect width="132" height="126" rx="2" fill="{CREAM}" stroke="{RULE}" stroke-width=".8"/>
  <rect x="0" y="0" width="132" height="14" fill="{accent}" fill-opacity=".12"/>
  <rect x="0" y="0" width="3.4" height="126" fill="{accent}"/>
  <rect x="7" y="4" width="2" height="6" fill="{accent}"/>
  <text x="12" y="10" font-family="{SANS}" font-size="6" font-weight="bold"
        letter-spacing="1" fill="{accent}">01 &#183; REALITY</text>
  <text x="124" y="10" text-anchor="end" font-family="{MONO}" font-size="5.4"
        fill="{MUTED}">01/50</text>
  <text x="9" y="26" font-family="{SANS}" font-size="7" font-weight="bold" fill="{INK}">What do we know because</text>
  <text x="9" y="35" font-family="{SANS}" font-size="7" font-weight="bold" fill="{INK}">we witnessed it&#8212;not because</text>
  <text x="9" y="44" font-family="{SANS}" font-size="7" font-weight="bold" fill="{INK}">somebody reported it?</text>
  <line x1="9" y1="52" x2="123" y2="52" stroke="{RULE_SOFT}" stroke-width=".5"/>
  {rules}
  <text x="9" y="134" font-family="{MONO}" font-size="4.6" fill="{MUTED}">one observation &#183; one evidence-producing next move</text>
</g>
<g font-family="{SANS}" font-size="6" fill="{CHARCOAL}">
  <g><line x1="152" y1="18" x2="170" y2="18" stroke="{UMBER}" stroke-width=".5"/>
     <text x="174" y="20">class band and tick code</text></g>
  <g><line x1="152" y1="38" x2="170" y2="38" stroke="{UMBER}" stroke-width=".5"/>
     <text x="174" y="40">the question, and only the question</text></g>
  <g><line x1="152" y1="58" x2="170" y2="58" stroke="{UMBER}" stroke-width=".5"/>
     <text x="174" y="60">rule line: below it you write</text></g>
  <g><line x1="152" y1="86" x2="170" y2="86" stroke="{UMBER}" stroke-width=".5"/>
     <text x="174" y="84">ruled writing surface &#8212; one observation,</text>
     <text x="174" y="92">one evidence-producing next move</text></g>
  <g><line x1="152" y1="128" x2="170" y2="128" stroke="{UMBER}" stroke-width=".5"/>
     <text x="174" y="130">card number, for the session record</text></g>
</g>
<text x="18" y="146" font-family="{SANS}" font-size="5.6" letter-spacing=".8" fill="{MUTED}">
  THE INSTRUCTION IS PRINTED ONCE, HERE &#8212; NOT FIFTY TIMES</text>"""
    return _svg(w, h, "", body, fill=fill) + ("" if fill else _cap("Card anatomy"))


WORKBOOK_STAGES = ["SPARK","RULE","PLACE","PEOPLE","WORK","FRICTION","MEMORY","SYSTEM",
                   "STORY","SHELF"]


def stage_rail(active, w=300, h=26, accent="#6B5A8E", stages=None):
    """Locator: which of the workbook's ten stages this page is working on."""
    stages = stages or WORKBOOK_STAGES
    step = w / len(stages)
    out = []
    for i, s in enumerate(stages):
        cx = step * i + step / 2
        on = (i == active)
        out.append(f'<circle cx="{cx:.1f}" cy="9" r="{4.6 if on else 3}" '
                   f'fill="{accent if on else CREAM}" stroke="{accent}" '
                   f'stroke-width="{1.4 if on else .9}" stroke-opacity="{1 if on else .5}"/>')
        bold = " font-weight='bold'" if on else ""
        out.append(f'<text x="{cx:.1f}" y="23" text-anchor="middle" font-family="{SANS}" '
                   f'font-size="{5.4 if on else 4.9}" letter-spacing=".4" '
                   f'fill="{INK if on else MUTED}"{bold}>{s}</text>')
    line = f'<line x1="{step/2:.1f}" y1="9" x2="{w-step/2:.1f}" y2="9" stroke="{accent}" stroke-opacity=".28" stroke-width="1"/>'
    return _svg(w, h, "", f'{line}{"".join(out)}', cls="fig stage-rail")


def cut_guides(x, y, w, h, ln=5):
    """Crop marks so the deck can actually be cut into cards."""
    c = []
    for (px, py, dx, dy) in [(x,y,-1,0),(x,y,0,-1),(x+w,y,1,0),(x+w,y,0,-1),
                             (x,y+h,-1,0),(x,y+h,0,1),(x+w,y+h,1,0),(x+w,y+h,0,1)]:
        c.append(f'<line x1="{px}" y1="{py}" x2="{px+dx*ln}" y2="{py+dy*ln}" '
                 f'stroke="{MUTED}" stroke-opacity=".55" stroke-width=".4"/>')
    return "".join(c)


def flame_detail(seed=14, accent="#C0842F", w=300, h=170):
    """BRIEF: the flame bent almost flat by the draft, then smaller and steadier once the
    wick is lowered. Two states of the same lantern, side by side, as evidence."""
    defs = barrier_defs(seed, .8) + f"""
<radialGradient id="fl{seed}" cx="50%" cy="54%" r="54%">
  <stop offset="0%" stop-color="#FFE9B8" stop-opacity=".95"/>
  <stop offset="42%" stop-color="{accent}" stop-opacity=".62"/>
  <stop offset="100%" stop-color="{accent}" stop-opacity="0"/></radialGradient>"""
    def lamp(x, bent):
        if bent:
            flame = (f'<path d="M{x},92 C{x-13},88 {x-19},84 {x-21},80 '
                     f'C{x-12},82 {x-5},86 {x},92 Z" fill="#FFF2CF" fill-opacity=".9"/>')
            glow = f'<ellipse cx="{x-9}" cy="86" rx="26" ry="13" fill="url(#fl{seed})"/>'
            lbl = "FLAME BENT ALMOST FLAT"
        else:
            flame = (f'<path d="M{x},92 C{x-4},85 {x-3},79 {x},74 '
                     f'C{x+3},79 {x+4},85 {x},92 Z" fill="#FFF2CF" fill-opacity=".95"/>')
            glow = f'<ellipse cx="{x}" cy="84" rx="17" ry="17" fill="url(#fl{seed})"/>'
            lbl = "SMALLER, BUT STEADIER"
        return f"""<g>{glow}
  <rect x="{x-16}" y="70" width="32" height="42" rx="2" fill="#2C2620" fill-opacity=".92"/>
  <rect x="{x-12}" y="74" width="24" height="32" fill="#120F0C"/>{flame}
  <rect x="{x-19}" y="66" width="38" height="5" rx="1.6" fill="#3A322A"/>
  <path d="M{x-9},66 C{x-9},57 {x+9},57 {x+9},66" stroke="#3A322A" stroke-width="2.2" fill="none"/>
  <rect x="{x-16}" y="110" width="32" height="4" rx="1" fill="#241F1A"/>
  <text x="{x}" y="132" text-anchor="middle" font-family="{SANS}" font-size="6.2"
        letter-spacing=".9" fill="#E7DDC8">{lbl}</text></g>"""
    draft = "".join(
        f'<path d="M6,{40+i*11} q26,{-4+i:.0f} 54,0 t54,0" stroke="#CFC2A8" '
        f'stroke-opacity="{.10+.03*i:.2f}" stroke-width="{.6+.1*i:.1f}" fill="none"/>'
        for i in range(4))
    body = f"""
<rect width="{w}" height="{h}" fill="#3D342C"/>
<rect y="118" width="{w}" height="52" fill="#2A2420" fill-opacity=".55"/>
{draft}
{lamp(86, True)}{lamp(214, False)}
<line x1="150" y1="34" x2="150" y2="140" stroke="{RULE}" stroke-opacity=".22"
      stroke-width=".6" stroke-dasharray="3 3"/>
<text x="150" y="26" text-anchor="middle" font-family="{MONO}" font-size="6.4"
      fill="#CFC2A8" fill-opacity=".8">she moved it off the draft and lowered the wick</text>
<text x="150" y="160" text-anchor="middle" font-family="{SANS}" font-size="6"
      letter-spacing="1.2" fill="#CFC2A8" fill-opacity=".62">SEVENTH NIGHT &#183; EAST WINDOW</text>
{barrier_overlay(seed, w, h, .8)}"""
    return _svg(w, h, defs, body, fill=True)


def door_knock(seed=15, accent="#C0842F", w=300, h=170):
    """BRIEF: near midnight. The door, the courier with mud to his knees, the broken
    wheel-pin in his hand. Read as a figure at a threshold, not a portrait."""
    rnd = random.Random(seed)
    rain = "".join(
        f'<line x1="{(x:=rnd.uniform(4,296)):.1f}" y1="{(y:=rnd.uniform(0,150)):.1f}" '
        f'x2="{x-4:.1f}" y2="{y+12:.1f}" stroke="#E7DDC8" stroke-opacity="{rnd.uniform(.08,.20):.2f}" '
        f'stroke-width=".55" stroke-linecap="round"/>' for _ in range(80))
    defs = barrier_defs(seed, .9) + f"""
<linearGradient id="spill{seed}" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0%" stop-color="{accent}" stop-opacity=".46"/>
  <stop offset="100%" stop-color="{accent}" stop-opacity="0"/></linearGradient>"""
    body = f"""
<rect width="{w}" height="{h}" fill="#241F1B"/>
{rain}
<!-- doorway, open a hand's width: the light that reached the road -->
<rect x="96" y="30" width="76" height="126" fill="#1A1613"/>
<rect x="96" y="30" width="30" height="126" fill="url(#spill{seed})"/>
<path d="M126,30 L126,156 L188,170 L188,44 Z" fill="{accent}" fill-opacity=".10"/>
<rect x="92" y="26" width="84" height="6" fill="#3A322A"/>
<g stroke="#3A322A" stroke-width="3" fill="none"><rect x="96" y="30" width="76" height="126"/></g>
<!-- courier: mud to the knees, wheel-pin in hand -->
<g transform="translate(206,68)">
  <path d="M0,88 L0,44 C-9,42 -13,33 -11,24 L11,24 C13,33 9,42 0,44 Z" fill="#2E2823"/>
  <circle cx="0" cy="14" r="10" fill="#2E2823"/>
  <path d="M-11,26 L-24,52 L-19,55 L-7,34 Z" fill="#2E2823"/>
  <path d="M11,26 L25,50 L20,54 L8,34 Z" fill="#2E2823"/>
  <rect x="-9" y="66" width="7" height="22" fill="#4A3F34"/>
  <rect x="3" y="66" width="7" height="22" fill="#4A3F34"/>
  <rect x="22" y="48" width="18" height="3.4" rx="1.4" fill="#6E6358"/>
  <path d="M40,48 L45,49.4 L45,51.4 L40,52.8 Z" fill="#6E6358"/>
</g>
<g font-family="{MONO}" font-size="6.6" fill="#CFC2A8" fill-opacity=".85">
  <text x="14" y="146">3 knocks &#183; near midnight</text>
  <text x="14" y="158">north road &#183; cart failed</text>
</g>
{barrier_overlay(seed, w, h, .9)}"""
    return _svg(w, h, defs, body, fill=True)


def chalk_detail(seed=23, accent="#4E6B4A", w=300, h=170):
    """BRIEF: the two sidelines. The first curved toward the garden fence; the second
    straight enough for everybody except Tomas. Half clover underfoot."""
    rnd = random.Random(seed)
    clover = "".join(
        f'<circle cx="{rnd.uniform(6,294):.0f}" cy="{rnd.uniform(6,164):.0f}" '
        f'r="{rnd.uniform(.9,2.3):.1f}" fill="#6E7F5E" fill-opacity="{rnd.uniform(.20,.44):.2f}"/>'
        for _ in range(180))
    defs = barrier_defs(seed, .5)
    body = f"""
<rect width="{w}" height="{h}" fill="#6A7758"/>
<rect width="{w}" height="{h}" fill="#7D8A6B" fill-opacity=".55"/>
{clover}
<!-- the first line: curved toward the garden fence, still faintly visible -->
<path d="M8,118 C80,110 150,128 292,104" stroke="#F4EFE4" stroke-opacity=".34"
      stroke-width="4" fill="none"/>
<text x="12" y="134" font-family="{SANS}" font-size="6.4" letter-spacing=".9"
      fill="#F4EFE4" fill-opacity=".62">FIRST LINE &#183; CURVED TOWARD THE FENCE</text>
<!-- the second line -->
<path d="M8,64 L292,60" stroke="#F4EFE4" stroke-opacity=".95" stroke-width="5" fill="none"/>
<text x="12" y="52" font-family="{SANS}" font-size="6.4" letter-spacing=".9"
      fill="#F4EFE4" fill-opacity=".85">SECOND LINE &#183; STRAIGHT ENOUGH FOR EVERYBODY EXCEPT TOMAS</text>
<!-- garden fence at the far edge -->
<g stroke="#4A3F34" stroke-width="2" opacity=".5">
  {''.join(f'<line x1="{x}" y1="14" x2="{x}" y2="30"/>' for x in range(12, 300, 14))}
  <line x1="6" y1="20" x2="296" y2="20"/></g>
<!-- chalk machine, set down -->
<g transform="translate(250,140)">
  <rect x="-14" y="-9" width="28" height="16" rx="2" fill="#5A4C3C"/>
  <circle cx="-9" cy="8" r="4.4" fill="#3A322A"/><circle cx="9" cy="8" r="4.4" fill="#3A322A"/>
  <path d="M12,-7 L24,-22" stroke="#5A4C3C" stroke-width="2.2"/></g>
<text x="150" y="162" text-anchor="middle" font-family="{MONO}" font-size="6.2"
      fill="#F4EFE4" fill-opacity=".72">07:00 &#183; the grass is half clover</text>
{barrier_overlay(seed, w, h, .5)}"""
    return _svg(w, h, defs, body, fill=True)


def two_drawings(seed=34, accent="#3E6B8A", w=300, h=170):
    """BRIEF: Des's one giant station beside Imani's many-part system, pinned up together,
    with the teacher's question written under both."""
    body = f"""
<rect width="{w}" height="{h}" fill="{PAPER}"/>
<!-- Des: one machine -->
<g transform="translate(14,16)">
  <rect width="126" height="106" fill="{CREAM}" stroke="{RULE}" stroke-width=".8"/>
  <circle cx="63" cy="6" r="2.4" fill="{MUTED}"/>
  <g transform="translate(20,26)">
    <rect x="0" y="26" width="86" height="42" fill="{UMBER}" fill-opacity=".30"/>
    <path d="M14,26 L14,6 L28,6 L28,26 Z" fill="{UMBER}" fill-opacity=".45"/>
    <path d="M58,26 L58,2 L72,2 L72,26 Z" fill="{UMBER}" fill-opacity=".45"/>
    <path d="M18,6 q4,-10 8,-4" stroke="{MUTED}" stroke-width="1" fill="none"/>
    <path d="M62,2 q4,-10 8,-4" stroke="{MUTED}" stroke-width="1" fill="none"/>
  </g>
  <text x="63" y="98" text-anchor="middle" font-family="{SANS}" font-size="6.6"
        letter-spacing=".9" fill="{CHARCOAL}">ONE GIANT POWER STATION</text>
</g>
<!-- Imani: a system -->
<g transform="translate(160,16)">
  <rect width="126" height="106" fill="{CREAM}" stroke="{accent}" stroke-width="1.2"/>
  <circle cx="63" cy="6" r="2.4" fill="{MUTED}"/>
  <g transform="translate(10,20)">
    {''.join(f'<rect x="{i*20}" y="6" width="15" height="9" fill="{accent}" fill-opacity=".34"/>'
             f'<path d="M{i*20},6 L{i*20+7.5},1 L{i*20+15},6 Z" fill="{accent}" fill-opacity=".5"/>'
             for i in range(5))}
    <rect x="4" y="26" width="26" height="12" rx="2" fill="{accent}" fill-opacity=".55"/>
    <text x="17" y="35" text-anchor="middle" font-family="{SANS}" font-size="5"
          fill="{CREAM}">STORE</text>
    <rect x="40" y="26" width="26" height="12" rx="2" fill="{UMBER}" fill-opacity=".40"/>
    <text x="53" y="35" text-anchor="middle" font-family="{SANS}" font-size="5"
          fill="{CREAM}">SHADE</text>
    <rect x="76" y="26" width="26" height="12" rx="2" fill="{UMBER}" fill-opacity=".40"/>
    <text x="89" y="35" text-anchor="middle" font-family="{SANS}" font-size="5"
          fill="{CREAM}">REPAIR</text>
    <g stroke="{accent}" stroke-width=".9" stroke-opacity=".7">
      <line x1="17" y1="44" x2="17" y2="54"/><line x1="53" y1="44" x2="53" y2="54"/>
      <line x1="89" y1="44" x2="89" y2="54"/><line x1="17" y1="54" x2="89" y2="54"/>
      <line x1="53" y1="54" x2="53" y2="62"/></g>
    <text x="53" y="70" text-anchor="middle" font-family="{SANS}" font-size="5.4"
          fill="{CHARCOAL}">SCHEDULES THAT MOVE FLEXIBLE WORK</text>
  </g>
  <text x="63" y="98" text-anchor="middle" font-family="{SANS}" font-size="6.6"
        letter-spacing=".9" fill="{CHARCOAL}">ROOFS, BATTERIES, SHADE, REPAIR</text>
</g>
<line x1="14" y1="134" x2="286" y2="134" stroke="{RULE}" stroke-width=".5"/>
<text x="150" y="150" text-anchor="middle" font-family="{SERIF}" font-size="9"
      font-style="italic" fill="{INK}">&#8220;Good. Now tell us what each answer cannot do.&#8221;</text>
<text x="150" y="163" text-anchor="middle" font-family="{SANS}" font-size="6"
      letter-spacing="1" fill="{MUTED}">EVERY CHOICE USED LAND, MATERIALS, MONEY, TIME, OR TRUST</text>"""
    return _svg(w, h, "", body, fill=True)


def north_works_dawn(seed=44, accent="#9A7B3F", w=300, h=170):
    """BRIEF: North Works before sunrise, twenty-eight years of it. The brass key placed
    on the conference table is the event; the building is the context."""
    rnd = random.Random(seed)
    defs = barrier_defs(seed, .6) + f"""
<linearGradient id="dawn{seed}" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0%" stop-color="#4A4036"/><stop offset="70%" stop-color="#7A6850"/>
  <stop offset="100%" stop-color="#9A8straight" stop-opacity="0"/></linearGradient>""".replace("8straight","8867")
    win = "".join(
        f'<rect x="{x}" y="{y}" width="9" height="7" fill="{accent}" '
        f'fill-opacity="{rnd.choice([.10,.16,.34,.52]):.2f}"/>'
        for y in (70, 82, 94) for x in range(30, 190, 16))
    body = f"""
<rect width="{w}" height="{h}" fill="url(#dawn{seed})"/>
<!-- works building -->
<rect x="20" y="58" width="180" height="62" fill="#2E2823"/>
<path d="M20,58 L110,36 L200,58 Z" fill="#241F1A"/>
{win}
<!-- sawtooth roof vents -->
{''.join(f'<path d="M{x},36 L{x+12},28 L{x+12},36 Z" fill="#1A1613"/>' for x in range(40,170,26))}
<rect x="204" y="86" width="14" height="34" fill="#2E2823"/>
<rect x="0" y="120" width="{w}" height="50" fill="#3A322A"/>
<!-- the conference table, and the key placed on it -->
<rect x="0" y="132" width="{w}" height="38" fill="#4A3F34"/>
<rect x="0" y="132" width="{w}" height="2" fill="#6E6054" fill-opacity=".7"/>
<g transform="translate(150,152)">
  <circle cx="0" cy="0" r="7.5" fill="none" stroke="{accent}" stroke-width="3"/>
  <rect x="6" y="-1.7" width="24" height="3.4" fill="{accent}"/>
  <rect x="26" y="1.7" width="3" height="5" fill="{accent}"/>
  <rect x="19" y="1.7" width="2.4" height="4" fill="{accent}"/>
  <ellipse cx="14" cy="8" rx="22" ry="3" fill="#241F1A" fill-opacity=".34"/>
</g>
<text x="150" y="128" text-anchor="middle" font-family="{MONO}" font-size="6.4"
      fill="#E7DDC8" fill-opacity=".8">before sunrise &#183; twenty-eight years</text>
<text x="150" y="166" text-anchor="middle" font-family="{SANS}" font-size="6.2"
      letter-spacing="1.1" fill="#E7DDC8" fill-opacity=".72">&#8220;PEOPLE THINK THIS IS A CEREMONY. IT IS AN INVENTORY.&#8221;</text>
{barrier_overlay(seed, w, h, .6)}"""
    return _svg(w, h, defs, body, fill=True)


def detail_strip(items):
    """World/context details as an evidence band: place, time, condition, object.
    Earns its place by carrying facts the prose does not stop to state."""
    cells = "".join(
        f'<div class="strip-cell"><span class="strip-k">{k}</span>'
        f'<span class="strip-v">{v}</span></div>' for k, v in items)
    return f'<div class="strip"><div class="strip-inner">{cells}</div></div>'


import re as _re


def _inner(svg_div):
    """Strip the wrapper div and return the raw <svg>...</svg> of a scene."""
    m = _re.search(r'(<svg\b.*</svg>)', svg_div, _re.S)
    return m.group(1)


def _place(svg_div, x, y, w, h):
    """Embed a scene as a nested <svg> at a position inside a larger canvas."""
    raw = _inner(svg_div)
    raw = _re.sub(r'^<svg\b[^>]*?viewBox="([^"]+)"[^>]*>',
                  lambda m: f'<svg x="{x}" y="{y}" width="{w}" height="{h}" '
                            f'viewBox="{m.group(1)}" preserveAspectRatio="xMidYMid meet">',
                  raw, count=1, flags=_re.S)
    # paper behind the placed box, so any fit margin reads as page, never as a hole
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{PAPER}"/>' + raw


def cover_plate(key, seed, accent, w=300, h=288):
    """
    Composed cover plate: the world scene, a divider carrying one world fact, and a
    second plate beneath it. Portrait, so it fills the cover instead of floating in it.
    """
    # lazy: building every product's scenes here would waste work and, worse, would
    # register other products' art as this product's provenance
    pairs = {
        "bramble":   (lambda: lantern_window(seed, accent), lambda: valley_lights(seed + 40, accent),
                      "ONE LANTERN PER WINDOW AFTER SUNSET"),
        "lastmatch": (lambda: pitch_pass(seed, accent), lambda: legacy_objects(seed + 40, accent),
                      "HARBOR ELEVEN &#183; HIS LAST MATCH AS CAPTAIN"),
        "city":      (lambda: city_map(seed, accent), lambda: demand_curve(seed + 40, accent),
                      "MORROW STREET &#183; 4:47 ON THE HOTTEST AFTERNOON"),
        "handoff":   (lambda: north_works_dawn(seed, accent), lambda: three_lists(seed + 40, accent),
                      "NORTH WORKS &#183; TWENTY-EIGHT YEARS, HANDED OVER"),
        "world":     (lambda: expansion_map(seed, accent), lambda: stage_rail(0, accent=accent),
                      "ONE IDEA &#183; NINE STAGES &#183; ONE RELEASE GATE"),
        "deck":      (lambda: card_anatomy(seed), None,
                      "50 CARDS &#183; FIVE CLASSES &#183; ONE SESSION RECORD"),
    }
    top_fn, bottom_fn, label = pairs[key]
    top = top_fn()
    bottom = bottom_fn() if bottom_fn is not None else None
    split = int(h * 0.62)
    body = [f'<rect width="{w}" height="{h}" fill="{PAPER}"/>']
    body.append(_place(top, 0, 0, w, split))
    body.append(f'<rect x="0" y="{split}" width="{w}" height="15" fill="{CREAM}"/>')
    body.append(f'<line x1="0" y1="{split}" x2="{w}" y2="{split}" stroke="{accent}" stroke-width="1"/>')
    body.append(f'<text x="8" y="{split+10}" font-family="{SANS}" font-size="6.2" '
                f'letter-spacing="1.3" fill="{MUTED}">{label}</text>')
    if bottom is not None:
        body.append(_place(bottom, 0, split + 15, w, h - split - 15))
    else:
        body.append(f'<rect x="0" y="{split+15}" width="{w}" height="{h-split-15}" fill="{CREAM}"/>')
        body.append(_place(card_anatomy(seed + 41), 0, split + 15, w, h - split - 15))
    body.append(f'<rect width="{w}" height="{h}" fill="none" stroke="{RULE}" stroke-width="0.8"/>')
    return _svg(w, h, "", "".join(body), fill=True)


def edition_stamp(serial, edition, build, pages, accent, seed=71, w=300, h=64):
    compact = h < 56
    """An inked edition stamp: the artifact says what it is, on its own face."""
    rnd = random.Random(seed)
    specks = "".join(
        f'<circle cx="{rnd.uniform(8,292):.1f}" cy="{rnd.uniform(6,58):.1f}" '
        f'r="{rnd.uniform(.2,.6):.2f}" fill="{accent}" fill-opacity="{rnd.uniform(.06,.16):.2f}"/>'
        for _ in range(26))
    return _svg(w, h, "", f"""
<rect width="{w}" height="{h}" fill="{PAPER}"/>
<g transform="translate(10,{4 if compact else 8})">
  <rect width="126" height="{32 if compact else 48}" rx="2" fill="none" stroke="{accent}" stroke-width="1.6"
        stroke-opacity=".82"/>
  <rect x="4" y="4" width="118" height="{24 if compact else 40}" rx="1" fill="none" stroke="{accent}"
        stroke-width=".5" stroke-opacity=".5"/>
  <text x="63" y="{13 if compact else 19}" text-anchor="middle" font-family="{SANS}" font-size="6.4"
        font-weight="bold" letter-spacing="1.6" fill="{accent}">THYLORA EDITION</text>
  <text x="63" y="{22 if compact else 31}" text-anchor="middle" font-family="{MONO}" font-size="6.6"
        fill="{INK}">{serial}</text>
  <text x="63" y="{31 if compact else 41}" text-anchor="middle" font-family="{MONO}" font-size="5.4"
        fill="{MUTED}">{edition} &#183; {pages} pages</text>
</g>
<g font-family="{MONO}" font-size="5.8" fill="{MUTED}">
  <text x="150" y="{12 if compact else 20}">build {build}</text>
  <text x="150" y="{22 if compact else 32}">vector art generated for this edition</text>
  <text x="150" y="{32 if compact else 44}">sha-256 recorded in the THYLORA backend</text>
  {"" if compact else f'<text x="150" y="56">no QR: no verified destination is registered</text>'}
</g>
{specks}
<line x1="0" y1="{h-1}" x2="{w}" y2="{h-1}" stroke="{RULE}" stroke-width=".5"/>""")


# ---------------------------------------------------------------- asset registration
def _install_logging():
    """Wrap every scene factory so each generated component is recorded with its hash.
    Registration is a requirement of the image-generation rule, not an optional extra."""
    import sys, functools, inspect
    mod = sys.modules[__name__]
    skip = {"_svg", "_cap", "_inner", "_place", "_log_asset", "_install_logging",
            "worksheet_block", "detail_strip", "cut_guides"}
    for nm, fn in list(vars(mod).items()):
        if (not inspect.isfunction(fn) or nm.startswith("_") or nm in skip
                or getattr(fn, "_logged", False)):
            continue

        def make(nm, fn):
            @functools.wraps(fn)
            def wrapper(*a, **kw):
                out = fn(*a, **kw)
                if isinstance(out, str) and "<svg" in out:
                    _log_asset(nm, out, kw.get("w", "-"), kw.get("h", "-"))
                return out
            wrapper._logged = True
            return wrapper
        setattr(mod, nm, make(nm, fn))


_install_logging()
