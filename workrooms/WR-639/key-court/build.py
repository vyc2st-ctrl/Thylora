"""Key court report, edition 639.

Build: python3 workrooms/WR-639/key-court/build.py
Fonts are embedded DejaVu (full Unicode) so ×, ÷, Σ, ⇄, subscripts and λ print.
The earlier PDFs used WinAnsi standard fonts, which cannot draw those glyphs.
"""
import re
from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer,
                                Table, TableStyle, PageBreak, KeepTogether)

HERE = Path(__file__).parent
OUT = HERE / "Key-Court-Report-639.pdf"
SERIAL = "THY-COURT-001-E639"
TITLE = "The River Court Filing Drift"
FD = "/usr/share/fonts/truetype/dejavu/"
for name, f in [("Sans", "DejaVuSans.ttf"), ("SansB", "DejaVuSans-Bold.ttf"),
                ("Serif", "DejaVuSerif.ttf"), ("SerifB", "DejaVuSerif-Bold.ttf"),
                ("Mono", "DejaVuSansMono.ttf"), ("MonoB", "DejaVuSansMono-Bold.ttf")]:
    pdfmetrics.registerFont(TTFont(name, FD + f))

INK = colors.HexColor("#1b1f24")
SOFT = colors.HexColor("#5b6470")
RULE = colors.HexColor("#c9ced6")
GOLD = colors.HexColor("#9a6b12")
TEAL = colors.HexColor("#0f5e63")
PAPER = colors.HexColor("#f6f3ec")
TINT = colors.HexColor("#eef4f4")

S = {
    "h1": ParagraphStyle("h1", fontName="SerifB", fontSize=26, leading=31, alignment=TA_CENTER, textColor=INK),
    "h2": ParagraphStyle("h2", fontName="SerifB", fontSize=16, leading=20, textColor=INK, spaceBefore=4, spaceAfter=6),
    "h3": ParagraphStyle("h3", fontName="SansB", fontSize=10.5, leading=13, textColor=TEAL, spaceBefore=6, spaceAfter=2),
    "body": ParagraphStyle("body", fontName="Serif", fontSize=10.2, leading=14.2, textColor=INK, spaceAfter=5),
    "small": ParagraphStyle("small", fontName="Sans", fontSize=8.3, leading=11, textColor=SOFT),
    "center": ParagraphStyle("center", fontName="Serif", fontSize=11, leading=15, alignment=TA_CENTER, textColor=INK),
    "csmall": ParagraphStyle("csmall", fontName="Sans", fontSize=8.5, leading=11.5, alignment=TA_CENTER, textColor=SOFT),
    "eq": ParagraphStyle("eq", fontName="SerifB", fontSize=22, leading=28, alignment=TA_CENTER, textColor=INK),
    "eqsay": ParagraphStyle("eqsay", fontName="Sans", fontSize=8.8, leading=11, alignment=TA_CENTER, textColor=SOFT),
    "cell": ParagraphStyle("cell", fontName="Serif", fontSize=9.2, leading=12, textColor=INK),
    "cellb": ParagraphStyle("cellb", fontName="SansB", fontSize=9, leading=12, textColor=INK),
    "q": ParagraphStyle("q", fontName="SerifB", fontSize=11.5, leading=15, alignment=TA_CENTER, textColor=GOLD),
    "tag": ParagraphStyle("tag", fontName="SansB", fontSize=7.6, leading=9.5, textColor=TEAL),
}


def sub(t):
    return t


def P(t, s="body"):
    return Paragraph(sub(t), S[s])


def frame_page(c, doc):
    c.saveState()
    w, h = letter
    c.setStrokeColor(RULE)
    c.setLineWidth(0.6)
    c.line(0.75 * inch, h - 0.6 * inch, w - 0.75 * inch, h - 0.6 * inch)
    c.line(0.75 * inch, 0.62 * inch, w - 0.75 * inch, 0.62 * inch)
    c.setFont("Sans", 7.8)
    c.setFillColor(SOFT)
    # Title on every page (the page-12 failure cannot recur).
    c.drawString(0.75 * inch, h - 0.5 * inch, f"{TITLE} · Court Operations & Access Desk")
    c.drawRightString(w - 0.75 * inch, h - 0.5 * inch, SERIAL)
    c.drawString(0.75 * inch, 0.45 * inch, "World figures are EdereAirah SIMULATION, not Earth data. Earth figures cite sources (page 14).")
    c.drawRightString(w - 0.75 * inch, 0.45 * inch, f"Page {doc.page}")
    c.restoreState()


def cover(c, doc):
    c.saveState()
    w, h = letter
    c.setFillColor(PAPER)
    c.rect(0, 0, w, h, stroke=0, fill=1)
    c.setStrokeColor(GOLD)
    c.setLineWidth(1.2)
    c.rect(0.55 * inch, 0.55 * inch, w - 1.1 * inch, h - 1.1 * inch, stroke=1, fill=0)
    c.setFont("Sans", 8)
    c.setFillColor(SOFT)
    c.drawCentredString(w / 2, 0.75 * inch, f"Serial {SERIAL} · Edition 639 · 2026-10-03")
    c.restoreState()


def eq_block(code, name, formula, readback, parts, words, swap, work, question, child, cls):
    """SEE → NAME → SAY → SWAP → WORK → ASK. One equation, one locked block."""
    eqstyle = ParagraphStyle("eqx", parent=S["eq"], fontSize=22 if len(re.sub("<[^>]+>", "", formula)) < 28 else 15.5)
    head = Table([[P(f"{code} · {name}", "h3"), P(cls, "tag")]], colWidths=[4.9 * inch, 2.1 * inch])
    head.setStyle(TableStyle([("ALIGN", (1, 0), (1, 0), "RIGHT"), ("VALIGN", (0, 0), (-1, -1), "BOTTOM"),
                              ("LEFTPADDING", (0, 0), (-1, -1), 0), ("RIGHTPADDING", (0, 0), (-1, -1), 0)]))
    see = Table([[P("1 · SEE IT", "tag")], [Paragraph(sub(formula), eqstyle)], [P(f"say it aloud: “{readback}”", "eqsay")]],
                colWidths=[7.0 * inch])
    see.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), TINT), ("BOX", (0, 0), (-1, -1), 0.8, TEAL),
                             ("TOPPADDING", (0, 0), (-1, -1), 5), ("BOTTOMPADDING", (0, 0), (-1, -1), 6)]))
    rows = [[P("symbol", "cellb"), P("what it is", "cellb"), P("unit", "cellb")]]
    rows += [[P(f"<font name='SerifB' size='11'>{a}</font>", "cell"), P(b, "cell"), P(u, "cell")] for a, b, u in parts]
    name_t = Table(rows, colWidths=[1.0 * inch, 4.9 * inch, 1.1 * inch], repeatRows=1)
    name_t.setStyle(TableStyle([("LINEBELOW", (0, 0), (-1, 0), 0.8, INK), ("LINEBELOW", (0, 1), (-1, -1), 0.3, RULE),
                                ("VALIGN", (0, 0), (-1, -1), "TOP"), ("TOPPADDING", (0, 0), (-1, -1), 2.5),
                                ("BOTTOMPADDING", (0, 0), (-1, -1), 2.5)]))
    lower = Table([
        [P("3 · SAY IT IN WORDS", "tag"), P("4 · SWAP IN YOUR OWN THINGS", "tag")],
        [P(words, "cell"), P(swap, "cell")],
        [P("5 · WORK IT", "tag"), P("FOR A CHILD", "tag")],
        [P(work, "cell"), P(child, "cell")],
    ], colWidths=[3.5 * inch, 3.5 * inch])
    lower.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 0),
                               ("RIGHTPADDING", (0, 0), (0, -1), 10), ("TOPPADDING", (0, 0), (-1, -1), 3)]))
    ask = Table([[P("6 · THE QUESTION IT ASKS", "tag")], [P(question, "q")]], colWidths=[7.0 * inch])
    ask.setStyle(TableStyle([("LINEABOVE", (0, 0), (-1, 0), 0.8, GOLD), ("LINEBELOW", (0, -1), (-1, -1), 0.8, GOLD),
                             ("TOPPADDING", (0, 0), (-1, -1), 3), ("BOTTOMPADDING", (0, -1), (-1, -1), 6)]))
    return [KeepTogether([head, Spacer(1, 4), see, Spacer(1, 6), P("2 · NAME EVERY PART", "tag"), name_t,
                          Spacer(1, 6), lower, Spacer(1, 6), ask]), Spacer(1, 16)]


def simple_table(rows, widths, head=True):
    t = Table([[P(str(x), "cellb" if (head and i == 0) else "cell") for x in r] for i, r in enumerate(rows)],
              colWidths=widths, repeatRows=1 if head else 0)
    st = [("LINEBELOW", (0, 1), (-1, -1), 0.3, RULE), ("VALIGN", (0, 0), (-1, -1), "TOP"),
          ("TOPPADDING", (0, 0), (-1, -1), 3), ("BOTTOMPADDING", (0, 0), (-1, -1), 3)]
    if head:
        st.append(("LINEBELOW", (0, 0), (-1, 0), 0.9, INK))
    t.setStyle(TableStyle(st))
    return t


def story():
    s = []
    # ---- Cover
    s += [Spacer(1, 1.35 * inch), P("COURT OPERATIONS &amp; ACCESS DESK · EDEREAIRAH", "csmall"), Spacer(1, 10),
          P(TITLE, "h1"), Spacer(1, 8),
          P("How a court falls behind, how it catches up, and the eight equations that show it", "center"),
          Spacer(1, 36)]
    hero = Table([[P("CR<sub>t</sub> = D<sub>t</sub> ÷ F<sub>t</sub>", "eq")],
                  [P("cases finished ÷ cases filed", "eqsay")],
                  [Spacer(1, 6)],
                  [P("B<sub>t+1</sub> = B<sub>t</sub> + F<sub>t</sub> − D<sub>t</sub>", "eq")],
                  [P("next pile = this pile + what came in − what went out", "eqsay")]], colWidths=[5.2 * inch])
    hero.setStyle(TableStyle([("BOX", (0, 0), (-1, -1), 1, TEAL), ("BACKGROUND", (0, 0), (-1, -1), colors.white),
                              ("TOPPADDING", (0, 0), (-1, -1), 6), ("BOTTOMPADDING", (0, 0), (-1, -1), 6)]))
    hero.hAlign = "CENTER"
    s += [hero, Spacer(1, 30),
          P("<b>The question on the cover:</b> did the court finish at least as many cases as came in?", "center"),
          Spacer(1, 70),
          P("Prepared for Key · Edition 639 · Legal information, not legal advice", "csmall"),
          P("Authors are EdereAirah staff of the Court Operations &amp; Access Desk (simulated persons; no Earth credential claimed)", "csmall"),
          PageBreak()]

    # ---- How to read
    s += [P("How to read every equation in this report", "h2"),
          P("Each equation is shown whole first, so the eye learns its shape the way it knows 2 × 2. "
            "Then each part is named, said in words, swapped for everyday things, worked with numbers, and "
            "closed with the one question it answers. Once you have seen it six ways, the symbols alone are "
            "enough: you look at <b>D ÷ F</b> and you already know “finished over filed.”"),
          Spacer(1, 6)]
    steps = [["Step", "What you do", "Example with CR = D ÷ F"],
             ["1 · SEE", "Look at the whole formula before reading anything", "CR = D ÷ F"],
             ["2 · NAME", "Each letter gets one meaning, written right beside it", "D = cases finished, F = cases filed"],
             ["3 · SAY", "Read it as a sentence", "“The rate is what we finished divided by what came in.”"],
             ["4 · SWAP", "Put your own things in the letters; the shape still works", "Dishes washed ÷ dishes used"],
             ["5 · WORK", "Put real numbers in", "1,020 ÷ 1,200 = 0.85"],
             ["6 · ASK", "Name the question the formula answers", "Are we keeping up?"]]
    s += [simple_table(steps, [0.9 * inch, 3.0 * inch, 3.1 * inch]), Spacer(1, 14),
          P("Truth labels used throughout", "h3"),
          simple_table([["Label", "Meaning"],
                        ["EARTH SOURCE", "A published Earth figure, cited on page 14"],
                        ["WORLD SIMULATION", "Numbers from the EdereAirah River Court story. Not Earth data, not measured anywhere"],
                        ["UNKNOWN", "Not known yet. Left visible instead of guessed"]], [1.6 * inch, 5.4 * inch]),
          PageBreak()]

    # ---- The story
    s += [P("1 · The problem: the River Court Filing Drift", "h2"),
          P("<i>Written by Tamsin Rourke, Court Systems Analyst (EdereAirah, simulated). Reviewed by Judge Mireille "
            "Oduya, Presiding Referee, Tenancy &amp; Small-Claims Bench (EdereAirah, simulated; 11 years on the bench).</i>", "small"),
          Spacer(1, 4),
          P("On the Tenancy &amp; Small-Claims bench, the Filing Hall finished fewer cases than it received for four "
            "straight quarters (a quarter is 90 Earth days). About one hearing in four was postponed because the file "
            "was not ready. About one person in five did not appear. The pile grew every quarter."),
          P("<b>No single person was failing. The steps did not check each other.</b>"),
          P("The seven steps a case walks through", "h3"),
          simple_table([["#", "Step", "Who", "Where it broke"],
                        ["1", "Filing", "The person filing, often without a lawyer", "Missing names, addresses, attachments"],
                        ["2", "Intake", "Counter clerk", "No completeness check: incomplete files went straight on"],
                        ["3", "Scheduling", "Docket supervisor", "Hearing dates given to files that weren't ready"],
                        ["4", "Hearing", "Judge", "Missed appearances; unready files postponed"],
                        ["5", "Order", "Judge", "Orders people could not act on"],
                        ["6", "Follow-through", "Access desk + clerk", "Nobody owned what happens after"],
                        ["7", "Record", "Archive custody", "Files closed without a disposition code"]],
                       [0.3 * inch, 1.1 * inch, 2.4 * inch, 3.2 * inch]),
          Spacer(1, 10),
          P("2 · What we changed", "h2"),
          simple_table([["Change", "Owner (simulated)", "What it does"],
                        ["Completeness check at intake", "Rosalind Petrakis, Chief Deputy Clerk", "One-page checklist; incomplete files go back the same day with a list"],
                        ["Ready-to-hear gate", "Rosalind Petrakis", "No hearing date until intake says COMPLETE"],
                        ["Plain-language notice", "Naya Aven, Director of Access", "Date, time, place and what happens if you miss it, printed largest"],
                        ["Reminder + “what you must do next”", "Naya Aven", "A reminder before the hearing; one next-step line on every order"],
                        ["Weekly clearance ledger", "Hollis Varga, Court Systems Engineer", "All eight measures on one sheet, every week"]],
                       [2.0 * inch, 2.0 * inch, 3.0 * inch]),
          PageBreak()]

    # ---- Results
    s += [P("3 · Before and after", "h2"),
          P("<b>WORLD SIMULATION.</b> Averages per 90-day quarter over four quarters. Filings held at 1,200 so the change can be seen on its own.", "small"),
          Spacer(1, 4),
          simple_table([["Measure", "Before", "After", "Change"],
                        ["Filings F", "1,200", "1,200", "held constant"],
                        ["Cases finished D", "1,020", "1,380", "+360"],
                        ["Clearance rate CR = D ÷ F", "0.85", "1.15", "+0.30"],
                        ["Pile change per quarter (F − D)", "+180", "−180", "reversed"],
                        ["Backlog B over 4 quarters", "2,400 → 3,120", "3,120 → 2,400", "back to start"],
                        ["Missed appearances (of 1,500)", "330", "264", "−66"],
                        ["Failure-to-appear rate", "22.0%", "17.6%", "−20% relative"],
                        ["Postponed, file not ready", "405 (27%)", "180 (12%)", "−225 hearings"],
                        ["Median days to finish", "140", "120", "−20 days"],
                        ["Slowest 10% (P90) days", "410", "340", "−70 days"],
                        ["Clerk hours per finished case", "2.1", "1.55", "−26%"]],
                       [2.9 * inch, 1.4 * inch, 1.4 * inch, 1.3 * inch]),
          Spacer(1, 12),
          P("How the numbers check each other", "h3"),
          P("Clerk capacity 2,160 hours ÷ 2.1 hours per case = 1,029, which matches 1,020 before. "
            "2,160 ÷ 1.55 = 1,394, enough for 1,380 after (M6). Freed hearing slots: 225 + 66 = 291 per quarter (M3, M7). "
            "Mean wait at the end: 2,400 ÷ 13.33 per day = 180 days (M5)."),
          PageBreak()]

    # ---- Equations M1–M8
    s += [P("4 · The eight equations", "h2")]
    s += eq_block("M1", "Clearance rate", "CR<sub>t</sub> = D<sub>t</sub> ÷ F<sub>t</sub>",
                  "C-R sub t equals D sub t divided by F sub t",
                  [("CR<sub>t</sub>", "clearance rate in period t", "ratio"),
                   ("D<sub>t</sub>", "dispositions: cases finished and leaving the court", "cases"),
                   ("F<sub>t</sub>", "filings: new and reopened cases coming in", "cases"),
                   ("t", "the period: a month or a 90-day quarter", "time")],
                  "Did the court finish at least as many cases as came in? 1.00 means keeping pace. Below 1.00, the pile grows.",
                  "Dishes washed ÷ dishes used. Emails answered ÷ emails received. The shape works the same with any “out ÷ in.”",
                  "Earth (NCSC example): 913 ÷ 1,083 = 0.84.<br/>World before: 1,020 ÷ 1,200 = <b>0.85</b>.<br/>World after: 1,380 ÷ 1,200 = <b>1.15</b>.",
                  "Are we finishing as fast as cases arrive?",
                  "If 10 new toys land in the box and you put away 8, the box gets fuller.",
                  "DEFINITION · target ≥ 1.00")
    s += eq_block("M2", "Backlog (the pile)", "B<sub>t+1</sub> = B<sub>t</sub> + F<sub>t</sub> − D<sub>t</sub>",
                  "B sub t-plus-one equals B sub t plus F sub t minus D sub t",
                  [("B<sub>t</sub>", "cases waiting at the start of period t", "cases"),
                   ("B<sub>t+1</sub>", "cases waiting at the start of the next period", "cases"),
                   ("F<sub>t</sub>", "cases that came in during t", "cases"),
                   ("D<sub>t</sub>", "cases that left during t", "cases")],
                  "The pile at the end is the pile at the start, plus what came in, minus what went out.",
                  "Water in a bucket = old water + poured in − poured out. Money in the bank works the same way.",
                  "Before: 2,400 + 1,200 − 1,020 = <b>2,580</b>; four quarters later 3,120.<br/>After: 3,120 + 1,200 − 1,380 = 2,940 … back to <b>2,400</b>.",
                  "Is the pile getting bigger or smaller, and by how much?",
                  "A bucket fills when you pour in faster than it drains.",
                  "COUNTING IDENTITY")
    s += eq_block("M3", "Failure to appear, and the reminder effect",
                  "FTA = M ÷ S ;  FTA<sub>after</sub> = FTA<sub>before</sub> × (1 − r)",
                  "F-T-A equals M over S; F-T-A after equals F-T-A before times one minus r",
                  [("M", "hearings where a required person did not come", "hearings"),
                   ("S", "hearings scheduled that needed someone to appear", "hearings"),
                   ("r", "how much a reminder cuts misses, as a fraction (0.20 = 20%)", "ratio")],
                  "The share of people who didn't come, and how much a reminder shrinks that share.",
                  "Missed doctor visits ÷ booked visits. Practice no-shows ÷ practices called.",
                  "Before: 330 ÷ 1,500 = <b>0.22</b>.<br/>After: 0.22 × (1 − 0.20) = <b>0.176</b> → 264 of 1,500.<br/>Earth: reminders cut misses 13–21% in NYC (Science, 2020).",
                  "How many people miss court, and what brings them back?",
                  "If 5 friends are invited and 1 forgets, a note might mean nobody forgets.",
                  "DEFINITION + EARTH-TESTED MODEL")
    s += eq_block("M4", "Time to finish (median and slow tail)",
                  "T<sub>i</sub> = date<sub>finished</sub> − date<sub>filed</sub> ;  S(τ) = count(T<sub>i</sub> ≤ τ) ÷ N",
                  "T sub i equals date finished minus date filed; S of tau equals how many are at most tau, over N",
                  [("T<sub>i</sub>", "days case i was open", "days"),
                   ("τ (tau)", "the time standard being checked, e.g. 90 days", "days"),
                   ("N", "cases finished in the period", "cases"),
                   ("S(τ)", "share of cases finished within τ days", "ratio"),
                   ("P<sub>50</sub>, P<sub>90</sub>", "median case, and the slowest 10% line", "days")],
                  "How long cases take, for the typical case and for the slow ones that get forgotten.",
                  "How long orders take to ship: the typical order, and the slowest one in ten.",
                  "World: median 140 → <b>120</b> days; P<sub>90</sub> 410 → <b>340</b> days.<br/>Earth misdemeanor standard: S(60) ≥ 0.75, S(90) ≥ 0.90, S(180) ≥ 0.98.",
                  "How long does a person wait for an answer?",
                  "Line everyone up by how long they waited. The middle person is the median.",
                  "DEFINITION · standards are benchmarks")
    s += eq_block("M5", "Little's law (average wait)", "W = L ÷ λ",
                  "W equals L divided by lambda",
                  [("W", "average time a case spends waiting", "days"),
                   ("L", "average number of cases waiting", "cases"),
                   ("λ (lambda)", "how fast new cases arrive", "cases/day")],
                  "A big pile with a slow arrival rate means each case waits a long time.",
                  "Cars in a car-wash line ÷ cars arriving per minute = minutes you'll wait.",
                  "λ = 1,200 ÷ 90 = 13.33 per day.<br/>W = 2,400 ÷ 13.33 = <b>180 days</b>.",
                  "If you join the line today, how long until your turn?",
                  "20 kids in line, 2 new ones each minute: each waits about 10 minutes.",
                  "QUEUEING LAW (steady state)")
    s += eq_block("M6", "Clerk capacity", "D<sub>max</sub> = (H × u) ÷ h̄",
                  "D max equals H times u, divided by h-bar",
                  [("H", "clerk hours available in the period", "hours"),
                   ("u", "share of those hours spent on case work", "ratio"),
                   ("h̄ (h-bar)", "average clerk hours per finished case", "hours"),
                   ("D<sub>max</sub>", "most cases the clerks can finish", "cases")],
                  "Hours you have, times the share you can use, divided by hours per case, is the most you can finish.",
                  "Baking: oven hours × share used ÷ hours per batch = batches you can make.",
                  "6 clerks × 450 h = 2,700 h; × 0.8 = 2,160 h.<br/>Before: 2,160 ÷ 2.1 = <b>1,029</b>. After: 2,160 ÷ 1.55 = <b>1,394</b>.",
                  "Can the people we have keep up with what comes in?",
                  "Each puzzle takes 2 hours and you have 10 hours: you finish 5 puzzles.",
                  "WORKLOAD MODEL")
    s += eq_block("M7", "Wasted hearings", "X = S × p<sub>c</sub>",
                  "X equals S times p sub c",
                  [("X", "hearing slots used up with no progress", "hearings"),
                   ("S", "hearings scheduled", "hearings"),
                   ("p<sub>c</sub>", "share postponed because the file wasn't ready", "ratio")],
                  "How many hearing slots were spent going nowhere.",
                  "Delivery trucks sent out × share that arrived with the wrong box.",
                  "Before: 1,500 × 0.27 = <b>405</b>. After: 1,500 × 0.12 = <b>180</b>.<br/>225 slots recovered every quarter.",
                  "How much court time is lost to files that weren't ready?",
                  "Showing up to a game with no ball wastes the field.",
                  "MODEL · target ready share ≥ 0.85")
    s += eq_block("M8", "Pilot decision rule", "Δ = (x<sub>after</sub> − x<sub>base</sub>) ÷ x<sub>base</sub>",
                  "Delta equals x after minus x base, over x base",
                  [("Δ (delta)", "relative change", "ratio"),
                   ("x<sub>base</sub>", "the measure before the change", "any"),
                   ("x<sub>after</sub>", "the same measure after the change", "same")],
                  "Did it move enough? PASS only if it meets the target in at least 2 of 3 pilot months.",
                  "Grocery bill this month vs last month, as a percent.",
                  "FTA 0.22 → 0.19: Δ = (0.19 − 0.22) ÷ 0.22 = <b>−0.136</b>. Meets the 10% target.",
                  "Did our change really work, or was it luck?",
                  "Did your score go up in at least two of three games?",
                  "DECISION RULE")
    s.append(PageBreak())

    # ---- Pilot
    s += [P("5 · A 90-day pilot any court can run", "h2"),
          simple_table([["Field", "Plan"],
                        ["Partner", "UNKNOWN: no court contacted yet. Target: one docket (small claims or landlord-tenant)"],
                        ["Data", "Aggregate monthly counts only. No names, case numbers or case facts, ever"],
                        ["What changes", "Intake checklist · ready-to-hear gate · plain notice · reminder through the court's own channel"],
                        ["Pass if", "CR ≥ 1.00 in 2 of 3 months · FTA drop ≥ 10% · ready share ≥ 0.85 · slowest-10% time not worse"],
                        ["Stop if", "Any privacy issue · anyone says the checklist blocked a filing (filings are flagged, never refused)"],
                        ["Undo", "Paper checklist and template. Stop using the sheet and it's gone"]],
                       [1.4 * inch, 5.6 * inch]),
          Spacer(1, 14),
          P("6 · Privacy line we never cross", "h2"),
          P("No personal details of anyone in a case. Sealed, juvenile, protective-order, mental-health, adoption and "
            "expunged matters are excluded completely. Any count below 11 is hidden. Reminders are sent only by the "
            "court, under its own rules. We never hold a contact list."),
          P("7 · Who wrote this (simulated EdereAirah staff)", "h2"),
          simple_table([["Person", "Title", "Section"],
                        ["Nadia Baptiste", "Director, Global Legal Operations", "Department lead"],
                        ["Tamsin Rourke", "Court Systems Analyst (proposed)", "Story, results, math"],
                        ["Judge Mireille Oduya", "Presiding Referee, Tenancy & Small-Claims Bench (proposed)", "Bench review"],
                        ["Rosalind Petrakis", "Chief Deputy Clerk, The Filing Hall (proposed)", "Workflow"],
                        ["Naya Aven", "Director of Access and Follow-Through", "Notices, reminders"],
                        ["Hollis Varga", "Court Systems & Software Engineer (proposed)", "Ledger, dashboard"],
                        ["Elena Marrow", "Privacy, Data & Consumer Protection", "Privacy"]],
                       [1.7 * inch, 3.6 * inch, 1.7 * inch]),
          P("All are EdereAirah persons. No Earth credential is claimed for any of them.", "small"),
          PageBreak()]

    # ---- Sources
    s += [P("8 · Earth sources", "h2"),
          P("OPENED = page read and quoted. SNIPPET = seen in search results only; recheck before publishing.", "small"),
          simple_table([["#", "Source", "Figure used", "Level"],
                        ["S1", "NCSC CourTools Measure 2: Clearance Rates", "Definition; ≥100% target; 913 ÷ 1,083 = 84%", "OPENED"],
                        ["S2", "NCSC CourTools Measure 3: Time to Disposition", "Definition", "SNIPPET"],
                        ["S3", "Model Time Standards for State Trial Courts (2011)", "Misdemeanor 75%/60d, 90%/90d, 98%/180d", "OPENED"],
                        ["S4", "Fishbane, Ouss & Shah, Science 370 (2020)", "FTA −13% to −21%; ~30,000 fewer warrants in 3 yrs", "OPENED"],
                        ["S5", "NCSC Landscape of Civil Litigation (2015)", "76% of civil cases had a self-represented party", "SNIPPET"],
                        ["S6", "Court Statistics Project (2022 data)", "64.6 million incoming cases", "SNIPPET"],
                        ["S7", "LSC, The Justice Gap (2022)", "92% of civil legal problems got little or no help", "SNIPPET"],
                        ["S9", "Thomson Reuters Institute 2025 State Courts Survey", "Clerk shortages expected to continue", "OPENED"]],
                       [0.35 * inch, 2.75 * inch, 2.9 * inch, 1.0 * inch]),
          Spacer(1, 16),
          P("9 · Print check (run this page first)", "h2"),
          P("If every symbol below prints as itself, the printer and fonts are good. A box ▯ or blank means stop and tell us."),
          simple_table([["Symbol", "Name", "Symbol", "Name"],
                        ["×", "times", "÷", "divided by"],
                        ["−", "minus", "≤ ≥", "at most / at least"],
                        ["Σ", "sum of", "Δ", "change"],
                        ["λ", "lambda", "τ", "tau"],
                        ["h̄", "h-bar (average)", "⇄", "goes both ways"],
                        ["B<sub>t+1</sub>", "subscript", "x²", "superscript"]],
                       [1.1 * inch, 2.4 * inch, 1.1 * inch, 2.4 * inch]),
          Spacer(1, 18),
          P(f"Serial {SERIAL} · Edition 639 · Fonts embedded: DejaVu Serif/Sans (full Unicode)", "csmall")]
    return s


def build():
    doc = BaseDocTemplate(str(OUT), pagesize=letter, leftMargin=0.75 * inch, rightMargin=0.75 * inch,
                          topMargin=0.85 * inch, bottomMargin=0.85 * inch,
                          title=f"{TITLE} — Court Operations Report", author="Court Operations & Access Desk",
                          subject=SERIAL)
    fr = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="f")
    doc.addPageTemplates([PageTemplate(id="cover", frames=[fr], onPage=cover),
                          PageTemplate(id="body", frames=[fr], onPage=frame_page)])
    st = story()
    from reportlab.platypus.doctemplate import NextPageTemplate
    st.insert(0, NextPageTemplate("body"))
    doc.build(st)
    print(OUT)


if __name__ == "__main__":
    build()
