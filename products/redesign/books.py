# -*- coding: utf-8 -*-
"""Assembly of the six redesigned customer editions. Body copy is locked to v1."""
from design import (TRIM, base_css, ACCENT, DECK_CLASS, INK, CHARCOAL, UMBER, SEPIA,
                    CREAM, PAPER, RULE, RULE_SOFT, MUTED, SANS, SERIF, MONO)
from editions import (page, cover, identity_page, talk_page, story_page, EDITION, BUILD_TAG)
import scenes as S

RIGHTS = ("Original THYLORA / ErsatzReality work. No third-party rights engaged. "
          "No Earth historical event is represented as fact.")


def doc(title, kind, accent, pages):
    css = base_css(kind, accent)
    return (f'<!doctype html><html lang="en"><head><meta charset="utf-8">'
            f'<title>{title}</title><style>{css}</style></head><body>'
            f'{"".join(pages)}</body></html>')


# ===================================================================== BRAMBLE WICK
def bramble_wick():
    a = ACCENT["bramble"]; k = "story"; s = 101
    prov = "THYLORA / ErsatzReality &#183; Bramble Wick &#183; EdereAriah story location"
    P = []
    P.append(cover(
        "Bramble Wick",
        "The Lantern That Wouldn&#8217;t Go Out &#8212; a nighttime story from EdereAriah.",
        "Digital story edition 001", S.cover_plate("bramble", s, a), a, s, "1.99",
        "ER-BRAMBLE-WICK-001", k))
    P.append(identity_page({
        "title": "Bramble Wick &#8212; The Lantern That Wouldn&#8217;t Go Out",
        "serial": "ER-BRAMBLE-WICK-001",
        "prov": prov,
        "rows": [
            ("Document class", "Customer story edition, read-aloud"),
            ("Edition", f"{EDITION} &#183; {BUILD_TAG} &#183; supersedes v1 (retained)"),
            ("Audience", "Family reading, bedtime or classroom; child-safe"),
            ("Purpose", "One story and one question a child can carry into sleep"),
            ("World layer", "EdereAriah &#183; hill-town of Bramble Wick"),
            ("Rights", "Original THYLORA / ErsatzReality work. No third-party rights engaged."),
            ("Imagery", "Vector scenes drawn for this edition. No photography or stock."),
            ("Interworld barrier", "Applied to world scenes under THY-INTERWORLD-OLDFILM-BARRIER-001"),
            ("Delivery", "PDF download via the THYLORA library (checkout-email sign-in)"),
        ],
        "boundary": ("Bramble Wick is an EdereAriah location and is real in that layer. "
                     "Nothing here reports an Earth event. Where a page shows the world, it is "
                     "shown through the viewer plane, so the transmission is visible as an "
                     "uneven film rather than a clean window."),
        "unknown": [
            "THYLORA graphic mark: recorded UNKNOWN / not approved. Typographic wordmark only; no logo invented.",
            "Brand font family: recorded UNKNOWN. Families used are PROPOSED &#8212; NOT CANON.",
            "QR destinations: none verified, so no QR is printed.",
        ]}, a, s + 1, k, pages=9))
    P.append(story_page(
        s + 2, a, "", "The lanterns in the windows",
        ["In the hill-town of Bramble Wick, every house kept one small lantern in the window "
         "after sunset. Nobody was required to. It was simply what people did.",
         "The lanterns told travelers: <em class='line'>Someone lives here. Someone is awake. "
         "If you need help, knock.</em>"],
        S.valley_lights(s + 2, a), prov, 1, k, drop=True, tail=S.detail_strip([('Place', 'Bramble Wick, a hill-town'), ('The custom', 'One small lantern per window after sunset'), ('Nobody required it', 'It was simply what people did')])))
    P.append(story_page(
        s + 3, a, "One", "The Wind",
        ["Mara Vale was nine and had been trusted with the east-window lantern for exactly six nights.",
         "On the seventh night, a storm rolled down from the black hills. Wind pushed at the shutters, "
         "rain scratched the glass, and every few minutes the whole house gave a little wooden groan.",
         "Mara&#8217;s father checked the roof. Her mother checked the pantry door. Mara checked the "
         "lantern. The flame bent almost flat.",
         "&#8220;You can put it out,&#8221; her older brother said. &#8220;Nobody is traveling in this.&#8221;",
         "Mara looked through the wet glass. &#8220;That is exactly when somebody might need it.&#8221;",
         "She moved the lantern farther from the draft and lowered the wick. The flame became smaller, "
         "but steadier.",
         "Across the valley, one light after another disappeared behind the rain. Mara&#8217;s stayed."],
        S.flame_detail(s + 3, a), prov, 2, k, tail=S.detail_strip([('The night', 'The seventh'), ('Weather', 'A storm down from the black hills'), ('Trusted with', 'The east-window lantern')])))
    P.append(story_page(
        s + 4, a, "Two", "The Knock",
        ["Near midnight came three knocks.",
         "Not loud. Not desperate. Just three careful knocks that almost disappeared under the storm.",
         "At the door stood an old courier with mud to his knees and a broken wheel-pin in his hand. "
         "His cart had failed on the north road. He had seen one light through the rain."],
        S.door_knock(s + 4, a), prov, 3, k,
        callout=("What he said",
                 "&#8220;I did not know whose house it was. I only knew somebody had left a way "
                 "to be found.&#8221;"),
        tail=S.detail_strip([("Time", "Near midnight"),
                             ("At the door", "A courier, mud to his knees"),
                             ("In his hand", "A broken wheel-pin")])))
    P.append(story_page(
        s + 5, a, "Three", "What the Lantern Was For",
        ["The family gave the courier dry socks, hot broth, and a place near the stove. At dawn, "
         "Mara&#8217;s father helped repair the cart.",
         "Before leaving, the courier placed the broken wheel-pin on the table.",
         "&#8220;Keep it,&#8221; he told Mara. &#8220;People remember lamps. But sometimes they "
         "forget what the lamp actually did.&#8221;"],
        S.wheel_pin(s + 5, a), prov, 4, k, tail=S.detail_strip([('Given', 'Dry socks, hot broth, a place near the stove'), ('At dawn', 'Her father helped repair the cart'), ('Left behind', 'The wheel-pin')])))
    P.append(story_page(
        s + 6, a, "", "What Mara kept",
        ["Years later, Bramble Wick changed. Streets became brighter. Roads became safer. Houses "
         "used different lights.",
         "Mara still kept the old wheel-pin.",
         "Not because she believed every lantern had to burn forever.",
         "Because she understood the question underneath it:"],
        f"""<div class="qbox" style="margin-top:2mm"><span class="k">The question underneath</span>
        <div class="q">When somebody cannot see a way forward, what can we leave visible
        enough for them to find us?</div></div>""", prov, 5, k, tail=S.detail_strip([('Years later', 'Brighter streets, safer roads'), ('Still kept', 'The old wheel-pin'), ('Not because', 'Every lantern must burn forever')])))
    P.append(talk_page(
        s + 7, a,
        ["What is one small thing a person can do that may matter much more to somebody else "
         "than it seems?"],
        prov, 6, k, title="A little question before sleep",
        note="Ask it once. Let the answer be small. Small is the point of the story."))
    P.append(page(f"""
<div style="margin-top:6mm">
  <div class="eyebrow" style="color:{a}">World note</div>
  <h2 class="head" style="font-size:14pt">Where this story sits</h2>
  <p style="margin-top:3mm">Bramble Wick is an EdereAriah story location. This story is original
  THYLORA / ErsatzReality material. No Earth historical event is being represented as fact.</p>
  <div class="callout"><span class="k">If you read it again</span>
  <p>The lantern is not the point of the story. The wheel-pin is. One of them is remembered;
  the other is the evidence that something was actually done.</p></div>
  {S.wheel_pin(s + 9, a)}
  {S.detail_strip([("World layer", "EdereAriah"),
                   ("Location", "Bramble Wick, a hill-town"),
                   ("Rights", "Original THYLORA work")])}
</div>""", s + 8, "World note", "", prov, 7, k))
    return doc("Bramble Wick — The Lantern That Wouldn't Go Out", k, a, P), len(P)


# ===================================================================== THE LAST MATCH
def last_match():
    a = ACCENT["lastmatch"]; k = "story"; s = 201
    prov = "THYLORA / ErsatzReality &#183; The Last Match &#183; original story"
    P = []
    P.append(cover(
        "The Last Match",
        "A family story about legacy, leaving, and what remains on the field.",
        "Original story &#183; customer edition", S.cover_plate("lastmatch", s, a), a, s, "3.00",
        "THY-STORY-LAST-MATCH-001", k))
    P.append(identity_page({
        "title": "The Last Match &#8212; A THYLORA Family Story About Legacy",
        "serial": "THY-STORY-LAST-MATCH-001", "prov": prov,
        "rows": [
            ("Document class", "Customer story edition with discussion pages"),
            ("Edition", f"{EDITION} &#183; {BUILD_TAG} &#183; supersedes v1 (retained)"),
            ("Audience", "Family, club, classroom; readers of any age"),
            ("Purpose", "A finished digital edition. Print it, mark it up, or use it on screen."),
            ("Subject", "Harbor Eleven, a neighbourhood team; one captain&#8217;s last match"),
            ("Rights", "Original THYLORA / ErsatzReality work. No third-party rights engaged."),
            ("Imagery", "Vector diagrams and object plates drawn for this edition"),
            ("Delivery", "PDF download via the THYLORA library (checkout-email sign-in)"),
        ],
        "boundary": ("Harbor Eleven, Tomas Vale, Nia and Malik are original THYLORA characters. "
                     "No real club, player or match is depicted, and no Earth sporting event is "
                     "reported as fact."),
        "unknown": [
            "THYLORA graphic mark: recorded UNKNOWN / not approved. No logo is drawn.",
            "Brand font family: recorded UNKNOWN. Families used are PROPOSED &#8212; NOT CANON.",
            "QR destinations: none verified, so no QR is printed.",
        ]}, a, s + 1, k, pages=8))
    P.append(story_page(
        s + 2, a, "One", "The Chalk Line",
        ["By seven in the morning, Tomas Vale had already drawn the sideline twice. The first line "
         "curved toward the garden fence. The second was straight enough to satisfy everybody "
         "except Tomas.",
         "His granddaughter Nia carried the corner flags. &#8220;It is a community match, Granddad. "
         "The grass is half clover. Nobody is bringing a ruler.&#8221;",
         "&#8220;That,&#8221; Tomas said, setting down the chalk machine, &#8220;is how crooked "
         "things become tradition.&#8221;",
         "Today was his last match as captain of Harbor Eleven, the neighborhood team he had joined "
         "before Nia was born."],
        S.chalk_detail(s + 2, a), prov, 1, k, drop=True, tail=S.detail_strip([('Time', 'Seven in the morning'), ('Ground', 'Community pitch, the grass half clover'), ('Today', 'His last match as captain of Harbor Eleven')])))
    P.append(story_page(
        s + 3, a, "Two", "What Everyone Came to See",
        ["By noon the field was crowded. Some came to watch Tomas score once more. Some came to see "
         "whether he would cry. Children chased a loose ball behind the benches while former "
         "teammates argued about matches no two people remembered the same way.",
         "Tomas tied his boots slowly. Nia sat beside him. &#8220;Are you scared?&#8221;",
         "&#8220;Of the match? No. Of everybody deciding what it means before we play it? A little.&#8221;",
         "He handed her the captain&#8217;s band. &#8220;Hold this until I ask.&#8221;"],
        S.legacy_objects(s + 3, a), prov, 2, k, tail=S.detail_strip([('By noon', 'The field was crowded'), ('Handed over', 'The captain&#8217;s band, to hold'), ('Asked', '&#8220;Are you scared?&#8221;')])))
    P.append(story_page(
        s + 4, a, "Three", "The Pass",
        ["The other team scored first. Harbor Eleven answered. With five minutes left, Tomas received "
         "the ball near the box. The crowd rose. He could shoot. The opening was narrow, but it was "
         "his kind of narrow.",
         "Then he saw Malik, sixteen, running unmarked on the right. Malik had spent the season "
         "apologizing every time he called for the ball. Tomas passed.",
         "Malik&#8217;s first touch bounced too far. His second sent the ball between the "
         "goalkeeper&#8217;s hands. After one surprised breath, the whole field erupted.",
         "Malik ran first to Tomas. &#8220;You had the shot.&#8221; &#8220;I had a choice,&#8221; "
         "Tomas said."],
        S.pitch_pass(s + 4, a), prov, 3, k, tail=S.detail_strip([('Five minutes left', 'Tomas receives near the box'), ('Unmarked on the right', 'Malik, sixteen'), ('Chosen', 'The pass, not the shot')])))
    P.append(story_page(
        s + 5, a, "Four", "After the Whistle",
        ["When the match ended, Tomas refused to be carried because his knee hurt and because he "
         "wanted to walk off under his own power. At midfield he called Nia over.",
         "He did not give the captain&#8217;s band to Malik. He gave it to the team and made them "
         "choose together."],
        f"""<div class="qbox" style="margin-top:1mm"><span class="k">What he told them</span>
        <div class="q">Legacy is not making people repeat you. It is leaving them able to
        choose without you.</div></div>
        <p style="margin-top:3mm">Later Nia found him pushing the chalk machine toward the shed.
        &#8220;The line is still crooked,&#8221; she said. Tomas looked back. &#8220;Good. Gives
        them something to fix tomorrow.&#8221;</p>""", prov, 4, k, tail=S.detail_strip([('After the whistle', 'He walked off under his own power'), ('The band', 'Given to the team, to choose together'), ('The line', 'Still crooked, on purpose')])))
    P.append(talk_page(
        s + 6, a,
        ["When is passing the better act of leadership?",
         "What should continue after Tomas leaves&#8212;and what should change?",
         "What did Nia learn from what Tomas did rather than what he said?"],
        prov, 5, k))
    P.append(page(f"""
<div style="margin-top:6mm">
  <div class="eyebrow" style="color:{a}">World note</div>
  <h2 class="head" style="font-size:14pt">The crooked line</h2>
  <p style="margin-top:3mm">Two chalk lines are drawn in this story. The straight one is the one
  everybody praised. The crooked one is the one he left behind on purpose.</p>
  <div class="callout"><span class="k">Rights and origin</span><p>{RIGHTS}</p></div>
  {S.legacy_objects(s + 8, a)}
  {S.detail_strip([("Club", "Harbor Eleven, a neighbourhood team"),
                   ("Characters", "Original THYLORA characters"),
                   ("Rights", "No real club or player depicted")])}
</div>""", s + 7, "World note", "", prov, 6, k))
    return doc("The Last Match — A THYLORA Family Story About Legacy", k, a, P), len(P)


# ===================================================================== THE CITY
def city_power():
    a = ACCENT["city"]; k = "story"; s = 301
    prov = "THYLORA / ErsatzReality &#183; The City That Needed More Power &#183; science story"
    P = []
    P.append(cover(
        "The City That Needed More Power",
        "A family science story about electricity, choices, and making room for tomorrow.",
        "Original story &#183; customer edition", S.cover_plate("city", s, a), a, s, "5.00",
        "THY-STORY-CITY-POWER-001", k))
    P.append(identity_page({
        "title": "The City That Needed More Power &#8212; A THYLORA Science Story",
        "serial": "THY-STORY-CITY-POWER-001", "prov": prov,
        "rows": [
            ("Document class", "Customer science story with system diagrams and discussion pages"),
            ("Edition", f"{EDITION} &#183; {BUILD_TAG} &#183; supersedes v1 (retained)"),
            ("Audience", "Family and classroom, roughly ages 9 and up"),
            ("Purpose", "A finished digital edition. Print it, mark it up, or use it on screen."),
            ("Subject", "Morrow Street and one city&#8217;s electricity system"),
            ("Rights", "Original THYLORA / ErsatzReality work. No third-party rights engaged."),
            ("Diagrams", "Drawn for this edition. Curve shows shape only, no units claimed."),
            ("Delivery", "PDF download via the THYLORA library (checkout-email sign-in)"),
        ],
        "boundary": ("The city, Morrow Street, Imani, Des and their grandmother are original "
                     "THYLORA characters. The engineering ideas &#8212; supply and demand balance, "
                     "storage, repair, voluntary load shifting &#8212; are described in general terms. "
                     "No specific Earth utility, outage or measurement is reported as fact."),
        "unknown": [
            "THYLORA graphic mark: recorded UNKNOWN / not approved. No logo is drawn.",
            "Brand font family: recorded UNKNOWN. Families used are PROPOSED &#8212; NOT CANON.",
            "Demand figure is shape only; no numeric load data is held.",
        ]}, a, s + 1, k, pages=8))
    P.append(story_page(
        s + 2, a, "One", "A Million Tiny Requests",
        ["At 4:47 on the hottest afternoon of the year, every light on Morrow Street blinked.",
         "Imani froze with the freezer open. Her brother Des looked up from his secondhand computer. "
         "Grandmother called from the porch, &#8220;If the house is trying to wink at us, tell it I "
         "am not impressed.&#8221;",
         "Across the city, air conditioners, trains, kitchens, hospitals, chargers, workshops, and "
         "computing halls were asking for power at the same time. Supply and demand had to stay "
         "balanced. The blink warned that the city needed a better plan."],
        S.demand_curve(s + 2, a), prov, 1, k, drop=True, tail=S.detail_strip([('Time', '4:47, the hottest afternoon of the year'), ('Street', 'Morrow Street'), ('What the blink meant', 'Supply and demand must stay balanced')])))
    P.append(story_page(
        s + 3, a, "Two", "The Loudest Machine",
        ["At school, the mayor asked students to design one. Des drew a giant power station. Imani "
         "drew solar roofs, batteries, shaded buildings, repaired wires, and schedules that moved "
         "flexible work away from the busiest hours.",
         "&#8220;Your drawing has too many answers,&#8221; Des said. &#8220;Yours has one answer "
         "pretending to be all of them,&#8221; Imani replied.",
         "Their teacher put both drawings up. &#8220;Good. Now tell us what each answer cannot do.&#8221; "
         "Every choice used land, materials, money, time, or trust. Reliability came from designing "
         "the system, not worshipping one machine."],
        S.two_drawings(s + 3, a), prov, 2, k,
        callout=("The teacher&#8217;s move",
                 "Not &#8220;which is right&#8221; but &#8220;what can each one not do&#8221;. "
                 "That is the question that turns a drawing into engineering."),
        tail=S.detail_strip([("Asked by", "The mayor, at school"),
                             ("Des drew", "One giant power station"),
                             ("Imani drew", "Roofs, batteries, shade, repair, schedules")])))
    P.append(story_page(
        s + 4, a, "Three", "The Night Test",
        ["The students tested three blocks. Shops cooled storage early. The library battery supported "
         "the block during the evening peak. A laundromat discounted later cycles. Crews replaced a "
         "failing transformer. Participation was voluntary.",
         "At 4:47 the next hot afternoon, Morrow Street did not blink. Des checked the meter. "
         "&#8220;Which thing fixed it?&#8221;",
         "&#8220;Wrong question,&#8221; Imani said. &#8220;Which things worked together?&#8221; "
         "Grandmother nodded. &#8220;Now that sounds like somebody who plans to keep the ice cream "
         "frozen.&#8221;"],
        S.three_blocks(s + 4, a), prov, 3, k, tail=S.detail_strip([('Tested', 'Three blocks'), ('Replaced', 'A failing transformer'), ('Participation', 'Voluntary')])))
    P.append(story_page(
        s + 5, a, "Four", "Room for Tomorrow",
        ["The city built new generation, but also wasted less, stored more, repaired equipment, "
         "protected hospitals and vulnerable residents, and measured what helped."],
        f"""<div class="qbox" style="margin-top:1mm">
        <span class="k">On the control-room wall</span>
        <div class="q">Power is not only what we make. It is how carefully we connect need,
        supply, timing, protection, and choice.</div></div>
        <p style="margin-top:3mm">Des added a smaller note: <em class="line">And never argue with a
        freezer in August.</em></p>""", prov, 4, k, tail=S.detail_strip([('Built', 'New generation, and less waste'), ('Protected', 'Hospitals and vulnerable residents'), ('Measured', 'What actually helped')])))
    P.append(talk_page(
        s + 6, a,
        ["Why did one big answer fail the class test?",
         "What parts of an electric system must work together?",
         "How can a city protect choice while asking people to help?"],
        prov, 5, k))
    P.append(page(f"""
<div style="margin-top:6mm">
  <div class="eyebrow" style="color:{a}">World note</div>
  <h2 class="head" style="font-size:14pt">Reading the diagrams</h2>
  <p style="margin-top:3mm">The city map shows one supply feeding many simultaneous requests, and one
  battery that can answer locally. The curve shows the <em class="line">shape</em> of a hot afternoon
  before and after the three-block test. It carries no units, because no measured load data is held.</p>
  <div class="callout"><span class="k">Rights and origin</span><p>{RIGHTS}</p></div>
  {S.demand_curve(s + 8, a)}
  {S.detail_strip([("Setting", "Morrow Street and one city grid"),
                   ("Figures", "Shape only, no measured units claimed"),
                   ("Rights", "Original THYLORA work")])}
</div>""", s + 7, "World note", "", prov, 6, k))
    return doc("The City That Needed More Power — A THYLORA Science Story", k, a, P), len(P)


# ===================================================================== THE HANDOFF
def handoff():
    a = ACCENT["handoff"]; k = "story"; s = 401
    prov = "THYLORA / ErsatzReality &#183; The Handoff &#183; original story"
    P = []
    P.append(cover(
        "The Handoff",
        "A story about leadership, change, and making room without abandoning responsibility.",
        "Original story &#183; customer edition", S.cover_plate("handoff", s, a), a, s, "7.00",
        "THY-STORY-HANDOFF-001", k))
    P.append(identity_page({
        "title": "The Handoff &#8212; A THYLORA Story About Leadership and Change",
        "serial": "THY-STORY-HANDOFF-001", "prov": prov,
        "rows": [
            ("Document class", "Customer story edition with discussion pages"),
            ("Edition", f"{EDITION} &#183; {BUILD_TAG} &#183; supersedes v1 (retained)"),
            ("Audience", "Working teams, successors, families; any reader facing a transfer"),
            ("Purpose", "A finished digital edition. Print it, mark it up, or use it on screen."),
            ("Subject", "North Works, and a twenty-eight-year handover"),
            ("Rights", "Original THYLORA / ErsatzReality work. No third-party rights engaged."),
            ("Imagery", "Vector inventory and decision plates drawn for this edition"),
            ("Delivery", "PDF download via the THYLORA library (checkout-email sign-in)"),
        ],
        "boundary": ("North Works, Mara Venn and Eli Sorrel are original THYLORA characters. "
                     "No real company, plant or person is depicted."),
        "unknown": [
            "THYLORA graphic mark: recorded UNKNOWN / not approved. No logo is drawn.",
            "Brand font family: recorded UNKNOWN. Families used are PROPOSED &#8212; NOT CANON.",
            "QR destinations: none verified, so no QR is printed.",
        ]}, a, s + 1, k, pages=8))
    P.append(story_page(
        s + 2, a, "One", "The Bell at North Works",
        ["For twenty-eight years, Mara Venn opened North Works before sunrise. She knew which press "
         "rattled in cold weather, which customer read every footnote, and which technician heard a "
         "bad bearing before the sensors did.",
         "On Monday she placed the brass key on the conference table. Across from her sat Eli Sorrel, "
         "who would become director at month&#8217;s end.",
         "&#8220;People think this is a ceremony,&#8221; Mara said. &#8220;It is an inventory.&#8221; "
         "Eli opened his notebook. &#8220;Of what?&#8221;",
         "&#8220;Everything I know that the building does not.&#8221;"],
        S.north_works_dawn(s + 2, a), prov, 1, k, drop=True, tail=S.detail_strip([('Years', 'Twenty-eight'), ('Opened', 'Before sunrise, every day'), ('On the table', 'The brass key')])))
    P.append(story_page(
        s + 3, a, "Two", "Three Lists",
        ["They made three lists. Facts held contracts, schedules, passwords, maintenance, and risks. "
         "Judgments held who needed time, which shortcuts were dangerous, and when a quiet room meant "
         "agreement or fear.",
         "The third list was titled <em class='line'>Things Mara May Be Wrong About</em>. Eli looked "
         "at it. &#8220;You made this?&#8221;",
         "&#8220;If I hand you only my certainty, I am not handing you leadership. I am handing you a "
         "cage.&#8221; For two weeks Eli shadowed Mara. For two more, Mara shadowed Eli. Staff could "
         "see who decided and why."],
        S.three_lists(s + 3, a), prov, 2, k, tail=S.detail_strip([('List one', 'Facts'), ('List two', 'Judgments'), ('List three', 'Things Mara May Be Wrong About')])))
    P.append(story_page(
        s + 4, a, "Three", "The Broken Press",
        ["Three days before the handoff, Press Four stopped. Mara knew the old workaround. Eli knew it "
         "violated the new safety procedure. Everyone looked at Mara.",
         "She felt the familiar answer rise. Then she asked, &#8220;Eli, what do you need?&#8221;",
         "&#8220;Twenty minutes, maintenance records, and permission to miss today&#8217;s target.&#8221; "
         "Mara gave all three. The team repaired the sensor properly, losing an afternoon and removing "
         "a failure that had returned six times.",
         "&#8220;My shortcut would have worked,&#8221; Mara said later. &#8220;Today,&#8221; Eli "
         "replied. Mara smiled. &#8220;Good answer.&#8221;"],
        S.press_four(s + 4, a), prov, 3, k, tail=S.detail_strip([('Three days before', 'Press Four stopped'), ('Cost', 'One afternoon, one missed target'), ('Removed', 'A failure that had returned six times')])))
    P.append(story_page(
        s + 5, a, "Four", "The Door Opens Differently",
        ["On Eli&#8217;s first morning, Mara did not come early. He opened North Works, then replaced "
         "the single-key system with logged access for the people who needed it.",
         "At ten, Mara arrived as a guest. Eli showed her the living handoff record: facts with "
         "sources, decisions with owners, assumptions marked for testing, and questions staff could add.",
         "&#8220;You changed my system,&#8221; Mara said. &#8220;I thought that was the point.&#8221; "
         "&#8220;It was.&#8221; She returned the visitor badge."],
        S.key_to_log(s + 5, a) + f"""<div class="qbox" style="margin-top:2mm">
        <span class="k">What completes a handoff</span>
        <div class="q">A handoff is complete when the next person can protect the purpose
        without performing the predecessor.</div></div>""", prov, 4, k, tail=S.detail_strip([('First morning', 'Mara did not come early'), ('Replaced', 'One key, with logged access'), ('At ten', 'Mara arrived as a guest')])))
    P.append(talk_page(
        s + 6, a,
        ["Which knowledge belongs in a record, and which needs practice?",
         "How did Mara keep responsibility without controlling Eli?",
         "What should a successor preserve&#8212;and be free to redesign?"],
        prov, 5, k))
    P.append(page(f"""
<div style="margin-top:6mm">
  <div class="eyebrow" style="color:{a}">World note</div>
  <h2 class="head" style="font-size:14pt">The third list</h2>
  <p style="margin-top:3mm">Most handovers transfer the first two lists. The third one &#8212;
  <em class="line">Things Mara May Be Wrong About</em> &#8212; is the one that makes the other two
  safe to inherit.</p>
  <div class="callout"><span class="k">Rights and origin</span><p>{RIGHTS}</p></div>
  {S.three_lists(s + 8, a)}
  {S.detail_strip([("Place", "North Works"),
                   ("Characters", "Original THYLORA characters"),
                   ("Rights", "No real company or person depicted")])}
</div>""", s + 7, "World note", "", prov, 6, k))
    return doc("The Handoff — A THYLORA Story About Leadership and Change", k, a, P), len(P)
