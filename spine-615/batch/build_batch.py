"""Build the help-first product batch (spine-615) as customer-facing PDFs.

Every interior opens on page 1 with its wording and a reserved art plate. The plate
is deliberately empty: Chairman rejection 614 (2026-09-25) bars new image generation
until a pre-render scene contract is approved, so each plate names the contract it
is waiting on (see SCENE-CONTRACTS.md). No product here is published or listed.

Fee line uses the rate recorded on order #1004: F = 2.9% x P + $0.30.
Fonts: DejaVu (embedded TTF) so minus signs, arrows and curly quotes render; the
earlier WinAnsi 0x7F defect class cannot occur.

Run: python3 build_batch.py   -> writes ./pdf/*.pdf and ./preview/*.png
"""
import math, os
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer,
                                Table, TableStyle, PageBreak, Flowable, KeepTogether)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

HERE = os.path.dirname(os.path.abspath(__file__))
FD = '/usr/share/fonts/truetype/dejavu/'
pdfmetrics.registerFont(TTFont('Sans', FD + 'DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('Sans-Bold', FD + 'DejaVuSans-Bold.ttf'))
pdfmetrics.registerFont(TTFont('Serif', FD + 'DejaVuSerif.ttf'))
pdfmetrics.registerFont(TTFont('Serif-Bold', FD + 'DejaVuSerif-Bold.ttf'))
# DejaVu ships no serif italic here; Liberation Serif Italic has the same Unicode coverage we use.
pdfmetrics.registerFont(TTFont('Serif-Italic', '/usr/share/fonts/truetype/liberation/LiberationSerif-Italic.ttf'))
from reportlab.pdfbase.pdfmetrics import registerFontFamily
registerFontFamily('Sans', normal='Sans', bold='Sans-Bold', italic='Sans', boldItalic='Sans-Bold')
registerFontFamily('Serif', normal='Serif', bold='Serif-Bold', italic='Serif-Italic', boldItalic='Serif-Bold')

GOLD = colors.HexColor('#B8862F'); INK = colors.HexColor('#1A1712'); DIM = colors.HexColor('#5E5A52')
LINE = colors.HexColor('#D9CFBF'); PAPER = colors.HexColor('#F7F2E8')
EMAIL = 'ersatzrealityenterprise@gmail.com'

S = {
  'kicker': ParagraphStyle('k', fontName='Sans-Bold', fontSize=9, textColor=GOLD, leading=12, spaceAfter=4),
  'title': ParagraphStyle('t', fontName='Sans-Bold', fontSize=26, leading=30, textColor=INK, spaceAfter=6),
  'sub': ParagraphStyle('s', fontName='Serif', fontSize=13, leading=18, textColor=DIM, spaceAfter=10),
  'h2': ParagraphStyle('h2', fontName='Sans-Bold', fontSize=15, leading=19, textColor=INK, spaceBefore=4, spaceAfter=6),
  'h3': ParagraphStyle('h3', fontName='Sans-Bold', fontSize=10.5, leading=14, textColor=GOLD, spaceBefore=8, spaceAfter=3),
  'body': ParagraphStyle('b', fontName='Serif', fontSize=10.5, leading=15, textColor=INK, spaceAfter=6),
  'small': ParagraphStyle('sm', fontName='Sans', fontSize=8.5, leading=11.5, textColor=DIM, spaceAfter=4),
  'eq': ParagraphStyle('eq', fontName='Sans-Bold', fontSize=12, leading=16, textColor=INK, spaceAfter=4),
  'cell': ParagraphStyle('c', fontName='Sans', fontSize=9, leading=12, textColor=INK),
}

def fee(p):
    return round(0.029 * p + 0.30, 2) if p > 0 else 0.0

def money_line(price, label='one sale'):
    """The Chairman's first line, filled with this item's own numbers."""
    if price <= 0:
        return ('<b>N = P − F − T − D</b> &nbsp; For a person who needs it: P = $0.00, so N = $0.00. '
                'No money moves, so there is nothing to split and nothing is promised.')
    f = fee(price); n = round(price - f, 2)
    return (f'<b>N = P − F − T − D</b> &nbsp; For {label}: ${price:.2f} − ${f:.2f} card fee − T (sales tax, passed through) − $0.00 delivery '
            f'= <b>${n:.2f} − T</b>. &nbsp; Then <b>N = B + C + A + O + R</b>, written down before the first sale.')

class ArtPlate(Flowable):
    """Reserved painted plate. Empty on purpose until its scene contract is approved."""
    def __init__(self, w, h, contract, scene):
        super().__init__(); self.w, self.h, self.contract, self.scene = w, h, contract, scene
    def wrap(self, *a): return self.w, self.h
    def draw(self):
        c = self.canv
        c.setFillColor(PAPER); c.setStrokeColor(GOLD); c.setLineWidth(1.2)
        c.roundRect(0, 0, self.w, self.h, 8, fill=1, stroke=1)
        c.setStrokeColor(LINE); c.setDash(3, 3); c.roundRect(8, 8, self.w - 16, self.h - 16, 6, fill=0, stroke=1); c.setDash()
        c.setFillColor(GOLD); c.setFont('Sans-Bold', 8.5)
        c.drawCentredString(self.w / 2, self.h - 26, 'PAINTED PLATE — HELD FOR CHAIRMAN SCENE-CONTRACT APPROVAL')
        c.setFillColor(DIM); c.setFont('Sans', 8)
        c.drawCentredString(self.w / 2, self.h - 40, f'Contract {self.contract} · no image generated (rule of Chairman rejection 614)')
        c.setFillColor(INK); c.setFont('Serif-Italic', 10.5)
        words, line, y = self.scene.split(), '', self.h / 2 + 8
        lines = []
        for w in words:
            t = (line + ' ' + w).strip()
            if c.stringWidth(t, 'Serif-Italic', 10.5) > self.w - 70: lines.append(line); line = w
            else: line = t
        lines.append(line)
        y = self.h / 2 + (len(lines) - 1) * 7
        for ln in lines:
            c.drawCentredString(self.w / 2, y, ln); y -= 14

def footer(label):
    def draw(c, doc):
        c.saveState(); c.setStrokeColor(GOLD); c.setLineWidth(0.6)
        c.line(0.75 * inch, 0.62 * inch, letter[0] - 0.75 * inch, 0.62 * inch)
        c.setFont('Sans', 7.5); c.setFillColor(DIM)
        c.drawString(0.75 * inch, 0.45 * inch, f'ERSATZREALITY × THYLORA · {label} · DRAFT FOR CHAIRMAN REVIEW · NOT FOR SALE')
        c.drawRightString(letter[0] - 0.75 * inch, 0.45 * inch, str(doc.page)); c.restoreState()
    return draw

def table(rows, widths, header=True):
    data = [[Paragraph(str(x), S['cell']) for x in r] for r in rows]
    t = Table(data, colWidths=widths, repeatRows=1 if header else 0)
    st = [('GRID', (0, 0), (-1, -1), 0.5, LINE), ('VALIGN', (0, 0), (-1, -1), 'TOP'),
          ('LEFTPADDING', (0, 0), (-1, -1), 5), ('RIGHTPADDING', (0, 0), (-1, -1), 5)]
    if header: st += [('BACKGROUND', (0, 0), (-1, 0), PAPER)]
    t.setStyle(TableStyle(st)); return t

def blanks(n, label=''):
    return table([[label or ' ', ' ']] * n, [1.8 * inch, 5.0 * inch], header=False)

def opening(kicker, title, sub, contract, scene, promise):
    return [Paragraph(kicker, S['kicker']), Paragraph(title, S['title']), Paragraph(sub, S['sub']),
            ArtPlate(7.0 * inch, 3.3 * inch, contract, scene), Spacer(1, 12),
            Paragraph(promise, S['body'])]

def build(slug, label, story):
    os.makedirs(os.path.join(HERE, 'pdf'), exist_ok=True)
    path = os.path.join(HERE, 'pdf', slug + '.pdf')
    doc = BaseDocTemplate(path, pagesize=letter, leftMargin=0.75 * inch, rightMargin=0.75 * inch,
                          topMargin=0.7 * inch, bottomMargin=0.85 * inch,
                          title=label, author='ErsatzReality Enterprise × THYLORA', subject='Draft for Chairman review')
    fr = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id='f')
    doc.addPageTemplates([PageTemplate(id='p', frames=[fr], onPage=footer(label))])
    doc.build(story); return path

B, H2, H3, SM, EQ = (lambda t: Paragraph(t, S['body'])), (lambda t: Paragraph(t, S['h2'])), \
    (lambda t: Paragraph(t, S['h3'])), (lambda t: Paragraph(t, S['small'])), (lambda t: Paragraph(t, S['eq']))

DONT_SEND = ('Please do not send medical records, ID numbers, account details, court papers, or your exact '
             'sleeping location in the first email. We read messages ourselves; this is not an emergency service and '
             'no reply time is guaranteed. If you need help right now, contact an established local emergency or aid service.')

# ───────────────────────── 1. HELP ME POST THIS ─────────────────────────
def help_me_post():
    s = opening('ERSATZREALITY × THYLORA · HELP FIRST', 'Help Me Post This',
        'Say the true thing clearly, so the right person can answer.',
        'SC-615-01', 'A kitchen table at the moment of rewriting: one hand holds the first draft, the other points at the missing line.',
        'You have something to say — a need, a thing you made, a question for your city — and the post is not getting '
        'answered. Most posts stall at the same few gaps: nobody can tell <b>where you are</b>, <b>what you are asking for</b>, '
        'or <b>what they should do next</b>. This worksheet walks you through those gaps one at a time. It is free. '
        'We never post for you, and nothing you write here comes to us unless you choose to send it.')
    s += [PageBreak(), H2('How it works'),
      table([['Step', 'You', 'Us'],
             ['1', 'Fill in the six questions on the next page.', 'Nothing yet.'],
             ['2', 'Rewrite your post with the pattern on page 3.', 'Nothing yet.'],
             ['3', f'If you want a second look, email the before and after to {EMAIL}.', 'A person reads it and replies with specific changes. No reply time is promised.'],
             ['4', 'You decide what to post, where, and when.', 'We never post, share or sell your words.']],
            [0.5 * inch, 3.3 * inch, 3.0 * inch]),
      Spacer(1, 10), H3('What we will not do'),
      B('We will not write a post that pretends to be you, invent a story, add urgency that is not true, or tell you that a post '
        'will raise a certain amount. We cannot promise that anyone will answer.'),
      PageBreak(), H2('The six questions every post has to answer'),
      table([['Question', 'Why it matters', 'Your answer'],
             ['WHO is this for?', 'A post for "everyone" is a post for no one.', ' '],
             ['WHERE are you?', 'Help is local. Country, city or region — not your street.', ' '],
             ['WHAT exactly do you need or offer?', 'One thing. Name it plainly.', ' '],
             ['BY WHEN?', 'A real deadline, if there is one. Do not invent one.', ' '],
             ['WHAT should the reader do?', 'Reply, share, buy, point you to someone — pick one.', ' '],
             ['WHAT is the next question?', 'What you will ask once someone answers.', ' ']],
            [1.7 * inch, 2.4 * inch, 2.7 * inch]),
      Spacer(1, 8), SM('From the source (Chairman, sequence 605): "I can help you with your — give you a better way to post that. We can help people like that."'),
      PageBreak(), H2('Rewrite pattern'),
      B('<b>Line 1 — the need in plain words.</b> &nbsp; <b>Line 2 — where.</b> &nbsp; <b>Line 3 — what the reader can do.</b> '
        '&nbsp; <b>Line 4 — the next question.</b>'),
      H3('Worked example (invented for teaching — not a real person)'),
      table([['Before', 'After'],
             ['Anybody know anything?? Really need help asap, nobody ever answers.',
              'I need a free or low-cost place to wash clothes this week.<br/>I am in Dundalk, Maryland, USA.<br/>If you know a laundromat or church that helps, please reply with the name.<br/>Next I will ask: what hours, and do I need to sign up?']],
            [3.4 * inch, 3.4 * inch]),
      Spacer(1, 8), H3('Your rewrite'), blanks(4, 'Line'),
      PageBreak(), H2('Keep yourself safe in public'),
      table([['Do not put in a public post', 'Say this instead'],
             ['Your exact address or where you sleep', 'Your city or neighbourhood'],
             ['Phone numbers, account numbers, ID numbers', '"Message me" or an email you can abandon'],
             ['Medical or court details', '"I have a medical bill I cannot pay" — no records'],
             ['Children’s names, faces or schools', 'Nothing about the children at all'],
             ['Anyone else’s story without their permission', 'Your own part of it only']],
            [3.4 * inch, 3.4 * inch]),
      Spacer(1, 10), H2('If your post is selling something'),
      B('Show the money path before the first sale so nobody is surprised:'), EQ(money_line(10.00, 'a $10.00 item sold by card')),
      SM('Card fee uses 2.9% + $0.30, the rate recorded on this store’s own sale #1004. Your platform’s fee may differ; check it.'),
      PageBreak(), H2('Send it to us (optional)'),
      B(f'Email <b>{EMAIL}</b> with: your country and city or region, your preferred language, the post before, and your rewrite. '
        'Write “email only” if you cannot take calls.'), B(DONT_SEND),
      H3('The price of this worksheet'), EQ(money_line(0)),
      SM('Help first. The worksheet stays free to anyone. A paid review service does not exist yet and is not offered.')]
    return build('help-me-post-this', 'HELP ME POST THIS', s)

# ───────────────────────── 2. HELP ME SELL THIS ─────────────────────────
def help_me_sell():
    s = opening('ERSATZREALITY × THYLORA · CREATOR LISTING', 'Help Me Sell This',
        'Your work. Your name. Your split — written down first.',
        'SC-615-02', 'A maker’s bench seen from the maker’s side: the finished piece, the price tag still blank, a pen resting on a two-column sheet.',
        'You made something and it is not getting seen or sold. Tell us what it is and where it stalls. If it fits, we can talk '
        'about listing a digital version in the THYLORA store. <b>Nothing is listed and no money moves until ownership, consent, '
        'price, costs and exactly who gets paid are agreed in writing</b> — on the pages that follow.')
    s += [PageBreak(), H2('What we can and cannot do'),
      table([['We can', 'We cannot (yet)'],
             ['Read your post and suggest specific changes.', 'Promise any sales.'],
             ['Review whether a digital version could be sold safely.', 'Pay you: no payout processor has been chosen.'],
             ['Show you every fee before you sign.', 'Sell physical goods: this store ships nothing.'],
             ['List only the version you approve, under the name you choose.', 'Take ownership of your work. You keep it.']],
            [3.4 * inch, 3.4 * inch]),
      SM('Honest status: this is an intake and agreement draft. It is not open for sign-ups until the Chairman approves it and a '
         'payout method exists.'),
      PageBreak(), H2('Intake'),
      table([['Question', 'Your answer'],
             ['What did you make? (one sentence)', ' '], ['Is it yours? Did anyone else help make it?', ' '],
             ['Where is it posted or sold now?', ' '], ['What would “sold” mean to you — how many, at what price?', ' '],
             ['Country / region (for tax and payment rules)', ' '],
             ['Do you receive any benefits that income could affect? (You do not have to tell us which.)', ' ']],
            [3.2 * inch, 3.6 * inch]),
      H3('Proof you own it'), B('Any one of: the original file with its creation date; drafts or sketches; a dated post from your own account; '
        'written permission from every co-maker.'),
      PageBreak(), H2('The price, before anything else'),
      EQ('N = P − F − T − D'),
      table([['Price P', 'Card fee F (2.9% + $0.30)', 'Left before tax', 'Fee share of price'],
             *[[f'${p:.2f}', f'${fee(p):.2f}', f'${p - fee(p):.2f}', f'{100 * fee(p) / p:.0f}%'] for p in (1.00, 3.00, 5.00, 10.00, 20.00)]],
            [1.5 * inch, 1.9 * inch, 1.7 * inch, 1.7 * inch]),
      SM('Why this matters: on a $1.00 item the flat 30 cents takes about a third. Very small prices are mostly fee.'),
      H3('Your item'), blanks(4, 'P, F, T, D'),
      PageBreak(), H2('The split, written down'),
      EQ('N = B + C + A + O + R'),
      table([['Share', 'Who', 'Percent of N', 'Named person or partner'],
             ['C — creator', 'You', ' ', ' '], ['O — operation', 'Store, library, reporting', ' ', 'ErsatzReality Enterprise'],
             ['R — reserve', 'Refunds and chargebacks', ' ', ' '],
             ['B — beneficiary', 'Only if you choose one, and only a named one', ' ', ' '],
             ['A — approved partner', 'Only a partner who has agreed in writing', ' ', ' '],
             ['Total', ' ', '100%', ' ']],
            [1.5 * inch, 2.1 * inch, 1.2 * inch, 2.0 * inch]),
      SM('No split is proposed for you here on purpose. Splits are set per creator, in writing, before the first sale.'),
      H3('Idea credit (from the Chairman’s “Joey’s corner”, sequence 602)'),
      B('If someone’s idea changes what we sell, we name it for them and write down, in advance, what share of that item they receive. '
        'Credit follows what a person actually contributed, recorded before sales, not after.'),
      PageBreak(), H2('Consent and signatures'),
      B('<i>“I own this work, or have written permission to sell it. THYLORA may show and sell only the version I approve, under my chosen '
        'name. I can withdraw it at any time; sales already made stay valid. My taxes, benefits and payment details are my responsibility; '
        'THYLORA has shown me every fee it knows of before I sign.”</i>'),
      B('<b>Cooling-off:</b> nothing is listed until 14 days after both sides sign, unless the creator asks for sooner in writing.'),
      table([['Creator (name you sell under)', ' '], ['Signature and date', ' '], ['For ErsatzReality Enterprise', ' '], ['Signature and date', ' ']],
            [2.6 * inch, 4.2 * inch], header=False),
      H3('The price of applying'), EQ(money_line(0)), SM('Applying is free. Your own item carries its own price and split.')]
    return build('help-me-sell-this', 'HELP ME SELL THIS', s)

# ───────────────────────── 3. MONEY PATH MAP ─────────────────────────
def money_path_map():
    target, n_obs = 10.00, 1.63
    need = math.ceil(target / n_obs)
    s = opening('ERSATZREALITY × THYLORA · MONEY PATH', 'Money Path Map',
        'Money is not in the product. It moves along the path between a real need and a delivery that works.',
        'SC-615-03', 'A hand-drawn map across a table: one coin at the start, gates along the road, and a small ledger at the end showing where it arrived.',
        'This map lets you follow one dollar — or ten — from the person who pays to everyone it reaches, and see each place it can leak, '
        'stall or be claimed. It uses two lines. Every number is marked <b>OBSERVED</b> (seen in a real record), <b>ESTIMATED</b> '
        '(calculated from a stated rule), or <b>UNKNOWN</b> (not yet known). Nothing moves from UNKNOWN to OBSERVED by hoping.')
    s += [PageBreak(), H2('The two lines'),
      EQ('N = P − F − T − D'), B('Payment, minus fees, minus tax passed through, minus the cost of delivering, leaves <b>N</b> — the only money anyone can share.'),
      EQ('N = B + C + A + O + R'), B('N is shared between beneficiary, creator, approved partner, operation and reserve, and the shares must be written down before the sale. '
        'One dollar stays one dollar: a share can never add up to more than N.'),
      H3('Where a gap can sit (Chairman, sequence 599)'),
      table([['Position', 'What the gap is doing', 'Example on the path'],
             ['SIGNAL', 'Shows you something is missing', 'A product with no buyers yet'],
             ['BLOCK', 'Stops money or delivery on purpose', 'Checkout closed until the file is ready'],
             ['BUFFER', 'Gives time to absorb a problem', 'The reserve R for refunds'],
             ['BRIDGE', 'Connects two sides that could not meet', 'A partner who reaches people who need help'],
             ['BRANCH', 'Splits one flow into several', 'The N = B + C + A + O + R line itself']],
            [1.1 * inch, 2.6 * inch, 3.1 * inch]),
      SM('A gap is not good or bad. It is placed well or badly.'),
      PageBreak(), H2('Worked example: “I need $10”'),
      B('Using this store’s own record. The only paid sale on record is order #1004: Twelve Miles for Flour, $1.99.'),
      table([['Line', 'Value', 'Label'],
             ['P, payment', '$1.99', 'OBSERVED — order #1004'], ['F, card fee', '$0.36', 'OBSERVED — transaction fee on #1004'],
             ['T, tax', '$0.00', 'OBSERVED on #1004; varies by buyer location'], ['D, delivery', '$0.00', 'OBSERVED — digital, nothing ships'],
             ['N', f'${n_obs:.2f}', 'OBSERVED'],
             ['Sales needed for $10', f'n = ceil(10 ÷ {n_obs:.2f}) = <b>{need}</b>', 'ESTIMATED from the rule'],
             ['Will 7 people buy?', '—', 'UNKNOWN — no outside buyer recorded yet'],
             ['When is it in the bank?', '—', 'UNKNOWN — payout schedule not read']],
            [2.0 * inch, 2.6 * inch, 2.2 * inch]),
      B(f'So “$10” means {need} real buyers of that item, and it is not money in the bank until the payout settles. '
        'Anyone who promises the $10 before those two facts is guessing.'),
      PageBreak(), H2('Map your own path'),
      table([['Stop on the path', 'Amount', 'OBSERVED / ESTIMATED / UNKNOWN', 'Where you saw it'],
             *[[x, ' ', ' ', ' '] for x in ['Who pays, and how much (P)', 'Platform or card fee (F)', 'Tax (T)', 'Cost to deliver (D)',
                                          'What is left (N)', 'Beneficiary (B)', 'Creator (C)', 'Approved partner (A)',
                                          'Operation (O)', 'Reserve (R)', 'Date it is actually in the account']]],
            [2.1 * inch, 1.0 * inch, 1.9 * inch, 1.8 * inch]),
      PageBreak(), H2('Four questions for any “proceeds go to…” promise'),
      B('1. Proceeds of what — the price, or what is left after fees and costs?'),
      B('2. To whom — a named organisation or person, or a category like “the homeless”?'),
      B('3. How much is already in the pot, what is the ceiling, and what does each dollar buy?'),
      B('4. Who confirms it arrived, and when will you see the report?'),
      SM('From the source (Chairman, sequence 608): “how is that money gonna be allocated … how much is in the pot now … is there a ceiling?”'),
      H3('The price of this map'), EQ(money_line(3.00, 'one $3.00 copy')),
      SM('PROPOSED price, not authorized. Educational only — not financial, tax or legal advice. Not a donation or charity program.')]
    return build('money-path-map', 'MONEY PATH MAP', s)

# ───────────────────────── 4. SCHOOL QUESTION PACK ─────────────────────────
def school_question_pack():
    s = opening('ERSATZREALITY × THYLORA · CLASSROOM', 'School Question Pack',
        'The question does not end with us. We give it a push up the hill; the student keeps it moving.',
        'SC-615-04', 'A classroom in mid-exchange: one student speaking with a hand still raised, others turned toward her, the board showing one equation.',
        'Five one-period lessons for teachers and home educators. Students practise telling what they <b>know</b> from what they '
        '<b>guess</b>, reading an equation as a sentence, and — most of all — asking the next question instead of stopping at an answer. '
        'Nothing is collected from students.')
    s += [PageBreak(), H2('For the teacher'),
      B('Each lesson: warm-up (5 min) · activity (25 min) · exchange (10 min) · exit ticket (5 min). Grade band: upper elementary to '
        'middle school; adjust numbers up or down.'),
      H3('Four sorting labels used in every lesson (Position Mathematics, sequence 601)'),
      table([['Label', 'Meaning', 'Student says'], ['KNOWN', 'Checked, with a source', '“I saw it, and here is where.”'],
             ['INFERENCE', 'A reasonable guess from what is known', '“I think so, because…”'],
             ['UNKNOWN', 'Not known yet', '“We don’t know yet. We could find out by…”'],
             ['CONTRADICTION', 'Two claims that cannot both be true', '“These disagree. Which one has the better source?”']],
            [1.3 * inch, 2.5 * inch, 3.0 * inch]),
      PageBreak(), H2('Lesson 1 — Sort it'),
      B('Read each line aloud. Students hold up KNOWN, INFERENCE, UNKNOWN or CONTRADICTION, then say why.'),
      table([['Statement', 'Label'], ['The thermometer outside says 12 °C.', ' '], ['It will rain after lunch.', ' '],
             ['Maya was late because she overslept.', ' '], ['The bus schedule says 8:05; the bus came at 8:20.', ' '],
             ['Everyone in our town likes football.', ' ']], [5.3 * inch, 1.5 * inch]),
      H2('Lesson 2 — The next-question ladder'),
      B('Start with any answer. Each student adds one rung: a question that the last answer makes possible. Stop only when the class '
        'cannot tell whether the next rung would be KNOWN or UNKNOWN — then plan how to find out.'),
      blanks(5, 'Rung'),
      PageBreak(), H2('Lesson 3 — An exchange, not a lecture'),
      B('One student reads a short paragraph. Everyone else writes one question about it. Questions are asked while hands are still '
        'raised — anyone can add to a question while it is being asked. The reader does not have to answer; the class decides together '
        'which questions can be answered from the paragraph and which need another source.'),
      SM('From the source (Chairman, sequence 608): “it’s not a talk, it’s an exchange … what’s your next question?”'),
      H2('Lesson 4 — Read the equation like a sentence'),
      EQ('N = P − F − T − D'),
      B('“What is left equals what was paid, minus the fee, minus the tax, minus the cost of getting it to you.”'),
      table([['Class sale', 'P', 'F', 'T', 'D', 'N'], ['Bake-sale cookie', '$1.00', '$0.00 cash', '$0.00', '$0.10 bag', ' '],
             ['Card payment at a fair', '$5.00', f'${fee(5):.2f}', '$0.00', '$0.00', ' ']], [2.0 * inch] + [0.95 * inch] * 5),
      B('Students fill N, then ask: <i>who decides how N is shared?</i>'),
      PageBreak(), H2('Lesson 5 — Count your own dance'),
      B('Everyone hears the same beat. With eyes closed, each student moves the way they hear it for 16 counts. Then each counts their '
        'own steps, turns and claps and writes them down. Compare: same music, different counts. There is no single right two-step.'),
      SM('Safety: clear space, no running, anyone may sit it out and count claps instead. From the source (sequence 608).'),
      H2('Exit tickets'),
      table([['Name (optional)', 'One thing I KNOW now', 'One thing still UNKNOWN', 'My next question'], [' ', ' ', ' ', ' '], [' ', ' ', ' ', ' ']],
            [1.3 * inch, 1.8 * inch, 1.8 * inch, 1.9 * inch]),
      H3('Licence and price'), B('Single teacher: print for your own students. No student data is collected; if you share student work with us, remove names first.'),
      EQ(money_line(5.00, 'one single-teacher copy')), SM('PROPOSED price, not authorized. Classroom/district licence not written and not offered.')]
    return build('school-question-pack', 'SCHOOL QUESTION PACK', s)

# ───────────────────────── 5. LOCAL HELP ROUTE WORKSHEET ─────────────────────────
def local_help_route():
    s = opening('ERSATZREALITY × THYLORA · HELP FIRST · FREE', 'Local Help Route Worksheet',
        'No one number works everywhere. Find the door where you are, write down where you found it, and keep going.',
        'SC-615-05', 'A worn paper route card on a bus seat, three doors sketched along one street, the first two crossed through, the third circled.',
        'This worksheet helps you find the next place to ask — for shelter, food, a medical bill, or legal help — in <b>your</b> country '
        'and city. It does not promise a bed or a service. It helps you keep a record of where you asked, what they said, and what to ask '
        'next, so that a closed door becomes information instead of a dead end. <b>Free to anyone who needs it.</b>')
    s += [PageBreak(), H2('If you are in danger right now'),
      B('Call your local emergency number first. It is different in different places. Write yours here: ________'),
      table([['Place', 'Emergency number'], ['United States, Canada', '911'], ['European Union countries', '112'],
             ['United Kingdom', '999 (112 also works)'], ['Australia', '000'], ['New Zealand', '111']],
            [3.4 * inch, 3.4 * inch]),
      SM('Check your own country’s number with a trusted local source; this short list is not complete. In the United States and Canada, '
         '211 connects many people to local services — but most of the world has no 211, which is why this worksheet exists.'),
      PageBreak(), H2('Your route card'),
      B('One row per door. Always write <b>where you found it</b> and <b>the date</b>: services change, and a date lets the next person trust or re-check it.'),
      table([['Need', 'Place or number to ask', 'Found it where? (link, office, person)', 'Date checked', 'What happened', 'Next door'],
             *[[' '] * 6 for _ in range(7)]], [0.9 * inch, 1.3 * inch, 1.5 * inch, 0.8 * inch, 1.2 * inch, 1.1 * inch]),
      PageBreak(), H2('Questions to ask at any door'),
      B('1. Do I qualify, and what do I need to bring?  2. If not here, who else helps with this?  3. Is there a waiting list — how long?  '
        '4. Can I apply by email or phone if I cannot come in?  5. Can I have that in writing?  6. Who should I ask for next time?'),
      H3('A medical bill you cannot pay'),
      B('Ask the hospital billing office: <i>“Do you have a financial assistance or charity-care policy, and can I apply?”</i> In the United States, '
        'non-profit hospitals are required to have a written financial assistance policy. Ask before a bill goes to collections, and ask for a '
        'payment plan in writing. Rules differ in other countries — ask the same question in your language.'),
      SM('From the source (Chairman, sequence 606): “most people don’t even know … they qualify for some fund that would help them pay their bill.”'),
      H3('Tonight · this week · this month'),
      table([['Tonight', 'This week', 'This month'], ['A safe place to sleep; warmth; water; a charged phone',
             'Food; a mailing address; replacing an ID; medication', 'Benefits you may qualify for; work; a longer-term place to live']],
            [2.27 * inch] * 3),
      PageBreak(), H2('Writing to us'),
      B(f'Email <b>{EMAIL}</b>. Send your country, city or region, your preferred language, what you need, and whether a deadline is close. '
        'If you cannot call, write “email only.” If you are writing for someone else, ask their permission first.'), B(DONT_SEND),
      B('We will look for the service where you are, show you the source and the date, and help you form the next question. Then tell us what happened. '
        'If that door did not open, we keep looking with you. Replies come from people, not from a simulated character.'),
      H3('Money on this worksheet'), EQ(money_line(0)),
      SM('This worksheet is never sold to a person in need. Help is not conditional on a story, a post, a thank-you or unpaid work.')]
    return build('local-help-route-worksheet', 'LOCAL HELP ROUTE WORKSHEET', s)

# ───────────────────────── 6. CELEBRATION / FAMILY CARD ─────────────────────────
def celebration_card():
    s = opening('ERSATZREALITY × THYLORA · CELEBRATION CARD STUDIO', 'Happy Birthday, [Name]',
        'A card made for one person, with words you approve before anything is delivered.',
        'SC-615-06', 'A kitchen at dawn: a covered plate set aside on the counter with a folded note leaning on it, the room still quiet before everyone wakes.',
        '<i>[Your message appears here exactly as you approve it — up to 60 words.]</i><br/><br/>'
        'This page is the sample front. Your card is built from your wording and shown to you as a proof. <b>Nothing is sent or '
        'delivered until you approve the proof.</b>')
    s += [PageBreak(), H2('Inside the card'),
      B('<b>Opening line</b> (you choose one, or write your own):'),
      table([['Birthday', '“Another year of you, and we are all better for it.”'], ['New baby', '“Welcome. You were already loved before you arrived.”'],
             ['Graduation', '“You did the work. Now ask the next question.”'], ['Thank you', '“You did something for me I did not know how to ask for.”'],
             ['Thinking of you', '“No reason. Just you.”']], [1.6 * inch, 5.2 * inch], header=False),
      H3('Your words'), blanks(4, 'Line'),
      B('<b>Signed:</b> ______________________'),
      PageBreak(), H2('Proof approval — nothing is delivered until this is complete'),
      table([['Check', 'You confirm'], ['Name spelled exactly as the person spells it', '☐'], ['Message exactly as you want it', '☐'],
             ['Occasion and date', '☐'], ['Who the card is from', '☐'],
             ['I have the right to use every name in this card, and no photo is included', '☐']], [5.3 * inch, 1.5 * inch]),
      B('<i>“I approve this proof. I understand THYLORA uses these names and words only to make this card. They will not be posted, sold, '
        f'or used to train anything. I can ask for them to be deleted at any time by writing to {EMAIL}.”</i>'),
      table([['Approved by', ' '], ['Date', ' ']], [2.0 * inch, 4.8 * inch], header=False),
      H3('Price and money path'), EQ(money_line(9.99, 'one $9.99 card')),
      SM('Price $9.99 is AUTHORIZED on the existing Shopify record “THYLORA Celebration Card Studio” (tag PRICE-AUTHORIZED); the record stays '
         'DRAFT and NOT-OPEN-FOR-ORDERS because the submit → proof → approve → deliver path does not exist yet. No photos or likenesses are accepted in this version.')]
    return build('celebration-card-studio-interior', 'CELEBRATION CARD STUDIO', s)

if __name__ == '__main__':
    import fitz  # PyMuPDF, for the previews
    os.makedirs(os.path.join(HERE, 'preview'), exist_ok=True)
    for fn in (help_me_post, help_me_sell, money_path_map, school_question_pack, local_help_route, celebration_card):
        p = fn(); d = fitz.open(p)
        for i in range(min(2, d.page_count)):
            d[i].get_pixmap(dpi=72).save(os.path.join(HERE, 'preview', os.path.basename(p)[:-4] + f'-p{i + 1}.png'))
        print(os.path.basename(p), d.page_count, 'pages', os.path.getsize(p), 'bytes')
