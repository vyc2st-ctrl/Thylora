# -*- coding: utf-8 -*-
"""Build a World From One Idea (workbook) and THYLORA Question Deck (card system)."""
from design import (base_css, ACCENT, DECK_CLASS, INK, CHARCOAL, UMBER, SEPIA, CREAM,
                    PAPER, RULE, RULE_SOFT, MUTED, SANS, SERIF, MONO)
from editions import page, cover, identity_page, EDITION, BUILD_TAG
from books import doc, RIGHTS

CARD_RULES = 8
import scenes as S

# ---------------------------------------------------------------- workbook content (locked)
STAGES = [
    ("1. The Spark", 0, [
        ("Write the idea in one sentence.", "", 6),
        ("Why must this world exist?", "", 6),
        ("What feeling should a visitor carry out?", "", 6)]),
    ("2. The Rule", 1, [
        ("Name one rule that makes this world different.", "", 6),
        ("Who benefits and who pays?", "", 6),
        ("What breaks when somebody refuses it?", "", 6)]),
    ("3. The Place", 2, [
        ("Name the first place people can picture.", "", 6),
        ("What work happens there?", "", 6),
        ("Which sensory detail shows who has power?", "", 6)]),
    ("4. The People", 3, [
        ("Create three people who want different outcomes.", "", 6),
        ("Give each a competence, protection, refusal, contradiction, and hope.", "", 6),
        ("Write three lines only each would say.", "", 6)]),
    ("5. The Work", 4, [
        ("What keeps the place alive daily?", "", 6),
        ("Who performs invisible labor?", "", 6),
        ("What tool, ritual, or shortcut shows the culture?", "", 6)]),
    ("6. The Friction", 5, [
        ("What ordinary problem reveals character?", "", 6),
        ("What does each person misunderstand?", "", 6),
        ("Which choice has a consequence?", "", 6)]),
    ("7. The Memory", 6, [
        ("What happened before page one?", "", 6),
        ("Who remembers it differently?", "", 6),
        ("What object or place carries the memory?", "", 6)]),
    ("8. The System", 7, [
        ("Map people, places, work, rules, resources, consequence, and repair.", "", 6),
        ("Where does information travel?", "", 6),
        ("What changes elsewhere when one part moves?", "", 6)]),
    ("9. The First Story", 8, [
        ("Begin with a person doing work.", "", 6),
        ("Let a specific problem interrupt routine.", "", 6),
        ("End with a changed relationship or decision.", "", 6)]),
    ("10. The Living Shelf", 9, [
        ("Choose the first form: story, card, recipe, audio scene, map, or activity.", "", 6),
        ("Define artifact, price, rights, delivery, and support.", "", 6),
        ("Name the next product only after the first is finished.", "", 6)]),
]

GATE_ITEMS = ["Finished artifact", "Rights checked", "Customer can receive it", "Re-access works",
              "Price visible", "Support boundary visible", "Claims are truthful",
              "Next revision has an owner"]


def build_a_world():
    a = ACCENT["world"]; k = "letter"; s = 501
    prov = "THYLORA / ErsatzReality &#183; Build a World From One Idea &#183; worldbuilding workbook"
    P = []
    P.append(cover(
        "Build a World From One Idea",
        "Turn one spark into people, places, consequences, stories, and finished products.",
        "Worldbuilding workbook &#183; customer edition", S.cover_plate("world", s, a), a, s, "19.00",
        "THY-WORLD-KIT-001", k))
    P.append(identity_page({
        "title": "Build a World From One Idea &#8212; THYLORA Starter Kit",
        "serial": "THY-WORLD-KIT-001", "prov": prov,
        "rows": [
            ("Document class", "Printable working workbook. Ten stages, one release gate."),
            ("Edition", f"{EDITION} &#183; {BUILD_TAG} &#183; supersedes v1 (retained)"),
            ("Audience", "Writers, makers, teachers, families, and anyone holding one idea"),
            ("Purpose", "A finished digital edition. Print it, mark it up, or use it on screen."),
            ("How to work it", "One stage per sitting. Do not skip to stage 10."),
            ("Rights", "Original THYLORA / ErsatzReality work. No third-party rights engaged."),
            ("Paper", "US Letter. Rules set at pen height; prints cleanly in black only."),
            ("Delivery", "PDF download via the THYLORA library (checkout-email sign-in)"),
        ],
        "boundary": ("This workbook builds YOUR world. THYLORA and EdereAriah are used only as the "
                     "worked example of the method. Nothing you write here becomes THYLORA canon."),
        "unknown": [
            "THYLORA graphic mark: recorded UNKNOWN / not approved. No logo is drawn.",
            "Brand font family: recorded UNKNOWN. Families used are PROPOSED &#8212; NOT CANON.",
            "QR destinations: none verified, so no QR is printed.",
        ]}, a, s + 1, k, pages=15))
    # the world test
    P.append(page(f"""
<div style="margin-top:5mm">
  <div class="eyebrow" style="color:{a}">Before stage one</div>
  <h2 class="head">The world test</h2>
  <p class="lead" style="margin-top:3mm">A living world is not a pile of lore. It contains distinct
  people, work with consequences, systems that remember, and doors a visitor can enter.</p>
  {S.expansion_map(s + 2, a)}
  <div class="prompt">Your one idea</div>
  <div class="write">{"".join('<div class="ln"></div>' for _ in range(9))}</div>
</div>""", s + 2, "The world test", "", prov, 1, k))
    folio = 2
    for i, (title, active, blocks) in enumerate(STAGES):
        body = "".join(S.worksheet_block(p, h, n) for p, h, n in blocks)
        P.append(page(f"""
<div style="margin-top:4mm">
  <div class="eyebrow" style="color:{a}">Stage {i+1} of 10</div>
  <h2 class="head">{title.split('. ',1)[1]}</h2>
  {S.stage_rail(active, accent=a)}
  <div style="margin-top:1mm">{body}</div>
</div>""", s + 3 + i, title, "", prov, folio, k))
        folio += 1
    # release gate
    boxes = "".join(
        f'<div style="display:flex;align-items:center;gap:2.6mm;padding:2.6mm 0;'
        f'border-bottom:.3mm solid {RULE_SOFT}">'
        f'<span style="width:5mm;height:5mm;border:.5mm solid {a};display:inline-block"></span>'
        f'<span style="font-family:{SANS};font-size:9pt;color:{INK}">{g}</span></div>'
        for g in GATE_ITEMS)
    P.append(page(f"""
<div style="margin-top:5mm">
  <div class="eyebrow" style="color:{a}">Stage 10 output</div>
  <h2 class="head">Release gate</h2>
  <p class="hint" style="margin-top:2mm">Tick every line before you call the first product
  finished. An unticked line is the next piece of work, not an opinion.</p>
  <div style="margin-top:3mm;columns:2;column-gap:10mm">{boxes}</div>
  <div class="callout" style="margin-top:6mm"><span class="k">If one box will not tick</span>
  <p>Do not widen the product to avoid it. Name the box, name the owner, and finish that
  one thing. The shelf stays honest that way.</p></div>
</div>""", s + 20, "Release gate", "", prov, folio, k))
    folio += 1
    P.append(page(f"""
<div style="margin-top:5mm">
  <div class="eyebrow" style="color:{a}">Next action</div>
  <h2 class="head">Name the one thing you will finish first</h2>
  <p style="margin-top:3mm">Not the world. Not the series. The first artifact a person could
  actually receive.</p>
  <div class="write" style="margin-top:3mm">{"".join('<div class="ln"></div>' for _ in range(3))}</div>
  <div class="prompt">Who owns it, and by when?</div>
  <div class="write">{"".join('<div class="ln"></div>' for _ in range(2))}</div>
  <div class="callout" style="margin-top:5mm"><span class="k">Rights and origin</span>
  <p>{RIGHTS} What you write on these pages is yours.</p></div>
</div>""", s + 21, "Next action", "", prov, folio, k))
    return doc("Build a World From One Idea — THYLORA Starter Kit", k, a, P), len(P)


# ---------------------------------------------------------------- deck content (locked)
CARDS = [
 ("REALITY","What do we know because we witnessed it&#8212;not because somebody reported it?"),
 ("REALITY","Which sentence is secretly an assumption?"),
 ("REALITY","What changed most recently?"),
 ("REALITY","What is present but not working?"),
 ("REALITY","What works once but cannot be repeated?"),
 ("REALITY","What would prove us wrong?"),
 ("REALITY","Whose version is missing?"),
 ("REALITY","What happens immediately before the failure?"),
 ("REALITY","What happens after we call it finished?"),
 ("REALITY","Which number would change our decision?"),
 ("FRICTION","Where does somebody have to ask for help?"),
 ("FRICTION","Where do people stop, leave, or postpone?"),
 ("FRICTION","What must be entered twice?"),
 ("FRICTION","Which choice hides an irreversible consequence?"),
 ("FRICTION","What does the expert see that the beginner cannot?"),
 ("FRICTION","Where does the language change halfway through?"),
 ("FRICTION","What tiny annoyance repeats most often?"),
 ("FRICTION","Which handoff loses information?"),
 ("FRICTION","What is difficult only because of sequence?"),
 ("FRICTION","What does the customer have to remember?"),
 ("VALUE","What result is the customer actually buying?"),
 ("VALUE","What can they use within ten minutes?"),
 ("VALUE","What would they miss if it vanished tomorrow?"),
 ("VALUE","What costly mistake does this prevent?"),
 ("VALUE","What becomes easier, faster, safer, or clearer?"),
 ("VALUE","Who gets the benefit and who does the work?"),
 ("VALUE","What is the smallest paid result?"),
 ("VALUE","What do we include because we love it&#8212;not because they need it?"),
 ("VALUE","What makes this recognizably ours?"),
 ("VALUE","What proof can we show without making an unsupported claim?"),
 ("PEOPLE","What would this person say in their own words?"),
 ("PEOPLE","What do they refuse to do?"),
 ("PEOPLE","What are they protecting?"),
 ("PEOPLE","What do they know that others underestimate?"),
 ("PEOPLE","What changes when trust is low?"),
 ("PEOPLE","Whose consent is required?"),
 ("PEOPLE","Who gets harmed by the convenient version?"),
 ("PEOPLE","What happens when somebody returns after leaving?"),
 ("PEOPLE","What emotion should the next step reduce?"),
 ("PEOPLE","What would feel made for them&#8212;not merely aimed at them?"),
 ("ACTION","What next action produces evidence?"),
 ("ACTION","What can be completed with what already exists?"),
 ("ACTION","What must be true before this goes public?"),
 ("ACTION","What can safely be manual for the first five customers?"),
 ("ACTION","What are we waiting on that is not actually required?"),
 ("ACTION","What is the cheapest test that could change our mind?"),
 ("ACTION","Who owns the next move, and by when?"),
 ("ACTION","What must be recorded so this work is not lost?"),
 ("ACTION","What does done look like to the customer?"),
 ("ACTION","If we shipped one truthful thing today, what would it be?"),
]

CLASS_NOTE = {
 "REALITY":  "Separates what was witnessed from what was reported.",
 "FRICTION": "Finds where the work actually costs somebody something.",
 "VALUE":    "Tests what a customer is really paying for.",
 "PEOPLE":   "Keeps the person in the room when decisions are made.",
 "ACTION":   "Converts the session into evidence and an owner.",
}


def _card(n, cls, q, accent):
    col, ticks = DECK_CLASS[cls]
    tick = "".join(f'<span style="display:inline-block;width:1.1mm;height:3.4mm;'
                   f'background:{col};margin-right:.7mm"></span>' for _ in range(ticks))
    rules = "".join(f'<div style="height:7.1mm;border-bottom:.3mm solid {RULE}"></div>'
                    for _ in range(CARD_RULES))
    # crop marks: the card is meant to be cut out, so show where
    marks = "".join(
        f'<span style="position:absolute;{v};width:{"4mm" if hz else ".3mm"};'
        f'height:{".3mm" if hz else "4mm"};background:{MUTED};opacity:.55"></span>'
        for v, hz in [("top:-1mm;left:-4.6mm", True), ("top:-4.6mm;left:-1mm", False),
                      ("top:-1mm;right:-4.6mm", True), ("top:-4.6mm;right:-1mm", False),
                      ("bottom:-1mm;left:-4.6mm", True), ("bottom:-4.6mm;left:-1mm", False),
                      ("bottom:-1mm;right:-4.6mm", True), ("bottom:-4.6mm;right:-1mm", False)])
    return f"""
<div style="position:relative;border:.4mm solid {RULE};background:{CREAM};
  padding:0;height:100%;display:flex;flex-direction:column">
  {marks}
  <div style="border-left:1.4mm solid {col};padding:2.4mm 3mm 2.4mm 2.6mm;flex:1;
    display:flex;flex-direction:column">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <div style="display:flex;align-items:center;gap:1.6mm">
        <span style="display:flex;align-items:flex-end">{tick}</span>
        <span style="font-family:{SANS};font-size:6.2pt;font-weight:700;letter-spacing:.14em;
          color:{col}">{cls}</span>
      </div>
      <span style="font-family:{MONO};font-size:5.8pt;color:{MUTED}">{n:02d}/50</span>
    </div>
    <div style="font-family:{SANS};font-size:9.2pt;font-weight:600;line-height:1.26;
      color:{INK};margin-top:2.2mm;min-height:11mm">{q}</div>
    <div style="height:.3mm;background:{RULE_SOFT};margin:1.2mm 0 1.0mm 0"></div>
    <div>{rules}</div>
    <div style="margin-top:auto;font-family:{MONO};font-size:5.2pt;color:{MUTED}">
      one observation &#183; one evidence-producing next move</div>
  </div>
</div>"""


def question_deck():
    a = ACCENT["deck"]; k = "letter"; s = 601
    prov = "THYLORA / ErsatzReality &#183; Question Deck &#183; 50 cards, five classes"
    P = []
    P.append(cover(
        "THYLORA Question Deck",
        "50 Better Questions &#8212; a practical card deck for seeing what is true, "
        "what is missing, and what to do next.",
        "Question deck &#183; customer edition", S.cover_plate("deck", s, a), a, s, "12.00",
        "THY-QDECK-50-001", k))
    P.append(identity_page({
        "title": "THYLORA Question Deck &#8212; 50 Better Questions",
        "serial": "THY-QDECK-50-001", "prov": prov,
        "rows": [
            ("Document class", "Printable card system. 50 cards, 5 classes, 1 session record."),
            ("Edition", f"{EDITION} &#183; {BUILD_TAG} &#183; supersedes v1 (retained)"),
            ("Audience", "Teams, founders, families, and anyone stuck on a real decision"),
            ("Purpose", "A finished digital edition. Print it, mark it up, or use it on screen."),
            ("Cut to cards", "Four cards per sheet. Crop marks are printed at every card corner."),
            ("Class coding", "Colour and a tick count, so classes survive greyscale printing."),
            ("Rights", "Original THYLORA / ErsatzReality work. No third-party rights engaged."),
            ("Delivery", "PDF download via the THYLORA library (checkout-email sign-in)"),
        ],
        "boundary": ("The deck is a working instrument, not a story. It makes no claim about any "
                     "Earth organisation and contains no case study."),
        "unknown": [
            "THYLORA graphic mark: recorded UNKNOWN / not approved. No logo is drawn.",
            "Brand font family: recorded UNKNOWN. Families used are PROPOSED &#8212; NOT CANON.",
            "QR destinations: none verified, so no QR is printed.",
        ]}, a, s + 1, k, pages=19))
    # how to use + anatomy
    P.append(page(f"""
<div style="margin-top:4mm">
  <div class="eyebrow" style="color:{a}">Read this once</div>
  <h2 class="head">How to use it</h2>
  <p class="lead" style="margin-top:2.6mm">Choose one real situation and one card. Answer from
  evidence. Complete the action before drawing another card. In a group, let every person answer
  before the loudest voice frames the room.</p>
  <div class="callout" style="margin-top:3mm"><span class="k">On every card, do this</span>
  <p><strong>Look for:</strong> sources, behavior, dates, consequences, missing voices, or
  customer-visible proof. <strong>Do:</strong> write one observation and one evidence-producing
  next move.</p></div>
  <p class="hint">That instruction governs all fifty cards. It is printed here once instead of
  fifty times, so each card can carry its question, its class and your writing space and nothing else.</p>
  <div class="figwrap">{S.card_anatomy(s + 2, fill=True)}</div>
</div>""", s + 2, "How to use it", "", prov, 1, k))
    # class index
    rows = ""
    for cls, note in CLASS_NOTE.items():
        col, ticks = DECK_CLASS[cls]
        tick = "".join(f'<span style="display:inline-block;width:1.3mm;height:4mm;'
                       f'background:{col};margin-right:.8mm"></span>' for _ in range(ticks))
        lo = [i + 1 for i, (c, _) in enumerate(CARDS) if c == cls]
        rows += f"""
<div style="display:flex;gap:4mm;align-items:flex-start;padding:3.4mm 0;
  border-bottom:.3mm solid {RULE_SOFT}">
  <div style="width:26mm;display:flex;align-items:center;gap:2mm">
    <span style="display:flex;align-items:flex-end">{tick}</span></div>
  <div style="flex:1">
    <div style="font-family:{SANS};font-size:8.6pt;font-weight:700;letter-spacing:.12em;
      color:{col}">{cls}</div>
    <div style="font-family:{SERIF};font-size:9pt;color:{CHARCOAL};margin-top:.8mm">{note}</div>
  </div>
  <div style="font-family:{MONO};font-size:7pt;color:{MUTED};white-space:nowrap">
    cards {lo[0]:02d}&#8211;{lo[-1]:02d}</div>
</div>"""
    P.append(page(f"""
<div style="margin-top:4mm">
  <div class="eyebrow" style="color:{a}">The five classes</div>
  <h2 class="head">What each class is for</h2>
  <p class="hint" style="margin-top:2mm">Count the ticks to read the class without colour.</p>
  <div style="margin-top:2mm;border-top:.35mm solid {RULE}">{rows}</div>
  <div class="callout" style="margin-top:5mm"><span class="k">Order of play</span>
  <p>REALITY before VALUE. PEOPLE before ACTION. A deck drawn in that order tends to
  produce evidence; drawn in reverse it tends to produce opinions.</p></div>
</div>""", s + 3, "The five classes", "", prov, 2, k))
    # card pages, 4 per sheet with crop marks
    folio = 3
    for start in range(0, len(CARDS), 4):
        chunk = CARDS[start:start + 4]
        cells = ""
        for j, (cls, q) in enumerate(chunk):
            cells += f'<div style="height:101mm">{_card(start + j + 1, cls, q, a)}</div>'
        for _ in range(4 - len(chunk)):
            cells += (f'<div style="height:101mm;border:.4mm dashed {RULE_SOFT};'
                      f'display:flex;align-items:center;justify-content:center">'
                      f'<span style="font-family:{MONO};font-size:6.4pt;color:{MUTED}">'
                      f'blank &#183; write your own</span></div>')
        P.append(page(f"""
<div style="margin-top:2mm;flex:1">
  <div style="display:grid;grid-template-columns:1fr 1fr;grid-template-rows:101mm 101mm;
    gap:6mm 7mm">{cells}</div>
  <div style="font-family:{MONO};font-size:5.6pt;color:{MUTED};margin-top:2mm;
    letter-spacing:.04em">cut on the card edge &#183; four cards per sheet</div>
</div>""", s + 4 + start, f"Cards {start+1:02d}&#8211;{min(start+4,50):02d}", "", prov, folio, k))
        folio += 1
    # session record
    P.append(page(f"""
<div style="margin-top:4mm">
  <div class="eyebrow" style="color:{a}">Close the session</div>
  <h2 class="head">Session record</h2>
  <p class="hint" style="margin-top:2mm">A session that is not recorded did not happen.
  Card 48 exists for this page.</p>
  <div style="margin-top:3mm">
    {S.worksheet_block("Problem or decision:", "", 2)}
    {S.worksheet_block("What we know / assumed / need to test:", "", 6)}
    {S.worksheet_block("Next action, owner, and date:", "", 3)}
  </div>
</div>""", s + 90, "Session record", "", prov, folio, k))
    folio += 1
    P.append(page(f"""
<div style="margin-top:5mm">
  <div class="eyebrow" style="color:{a}">Last card</div>
  <h2 class="head">If we shipped one truthful thing today, what would it be?</h2>
  <p style="margin-top:3mm">Card 50 is the only card that should be answered out loud, by
  the person who can actually do it.</p>
  <div class="write" style="margin-top:3mm">{"".join('<div class="ln"></div>' for _ in range(3))}</div>
  <div class="callout" style="margin-top:5mm"><span class="k">Rights and origin</span>
  <p>{RIGHTS} What you write on these cards is yours.</p></div>
</div>""", s + 91, "Last card", "", prov, folio, k))
    return doc("THYLORA Question Deck — 50 Better Questions", k, a, P), len(P)
