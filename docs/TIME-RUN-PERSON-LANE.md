# Time Run · person lane

Head: **THY-WORK-TIME-RUN-OPS-VERONICA-582**
Schema: `db/time-run/0009_person_lane.sql`, `db/time-run/0010_person_seed.sql`
Locks: `LOCK-ER-VERONICA-HALL-001`, `LOCK-ER-CLARA-BENNETT-001`, `OBJ-LOCKET-001`

Reference image `E17D2C31-0C29-489B-811D-9573552A4E1F.jpeg` is registered:
**LEFT — Inés Morales · CENTER — Veronica Hall · RIGHT — Clara Bennett.**
Reference only. **No image generation.**

---

## 1 · Standing relations

| A | B | Relation | First meeting |
|---|---|---|---|
| Vyctor Ebeneezer | Inés Morales | `PREEXISTING_ACQUAINTANCE_FROM_PRIOR_VISITS` | **Not available. Does not exist. Cannot be written.** |
| Vyctor Ebeneezer | Veronica Hall | `NEW_ENCOUNTER` | Open. The only one open in this packet. |
| Inés Morales | Veronica Hall | `KINSHIP_EXISTS_DEGREE_UNKNOWN` | — |
| Clara Bennett | Veronica Hall | `BROUGHT_BACK_BY`, `PROTECTIVE_OF` | — |

`thytr_no_first_meeting_regression()` raises `THYTR-REL-001` on any attempt to
insert a `FIRST_MEETING` encounter between Vyctor and Inés, in either
direction. The guard is in the database, not only in this document.

---

## 2 · Veronica Hall

**Current:** age 23 · 166 cm · 55–60 kg · deep-brown complexion · dark textured
hair · slender working build · systems thinker · sees how things work.

### Origin

She was living precariously, on or around the street, among poor people. Not
passing through them and not studying them: **among** them, counted by them,
expected by them. She helped them and they helped her, and it ran both
directions. **She was not helpless**, and nothing in her origin is written as
rescue from helplessness.

The people she lived among are **not named yet**. That is deliberate and it is
locked: `thytr_origin_beat.names_invented` and
`thytr_household_stance.named_person` are both checked false, so no name can be
slipped in as a beat.

### Survival routine

| Part of day | What she did |
|---|---|
| Before light | Water, while the queue was short and the well-keeper less particular. |
| Then | Fire, or the coals that stood in for one. Whoever keeps the fire keeps a reason to be stood near it. |
| Morning | The round: back doors of a cookshop, a stable yard, a market edge at the hour when unsold things stop being worth guarding. She did the work first and asked after. |
| Afternoon | Mending. Leather, sacking, a strap, a handle, a hinge, a shoe with one more month in it. Her real trade before anyone gave her one. |
| Night | Arranged, not endured. Which corner drains, which wall holds heat, which doorway has someone in it who won't be moved on, and who is owed a turn at the better spot. She kept those obligations exactly. That exactness was the whole of her security. |

### What she knew how to do

Carry and stack a load so it does not shift. Mend leather, sacking and rope.
Set and keep a fire on poor fuel. Judge water. Read a yard — where the traffic
runs, where the theft happens, which animal is lame, which man is about to be
trouble. Nurse a fever without medicine. Count, hold a tally in her head across
days, and know exactly who was owed what.

### The thing she actually is

She sees how things work. Not what things are called or who owns them: **how
they run, where they bind, what happens three steps after the thing that just
happened.** On the street that reads as uncanny luck. In a household it will
read as insolence until it reads as indispensable.

---

## 3 · Clara Bennett and the employment path

Clara maintains standards. She does not turn sentimental and she does not turn
aristocratic. Both of those would be easier than what she actually does.

**What Clara noticed.** Not a girl in want — there were many. She noticed a
cart being unloaded wrong, a word from a young woman nobody had asked, and the
load then coming off in a different order with two fewer hands and no breakage.
She noticed that the men had listened without deciding to.

**What Clara noticed second.** She watched longer than was comfortable for
either of them, and saw the tally: who Veronica fed before she ate, who she
came back for, what she carried out of the yard for someone who was not there
to see it. Clara was pricing competence and pricing character. Both came back
high.

**How Clara approached her.** Not with pity, and not with an offer of rescue.
She asked a question about the work — why that order, and not the obvious one.
She waited through the pause where Veronica decided whether answering would
cost her. Then she listened to the whole answer without interrupting it, which
no one had done in a long time.

**What Clara actually offered.** A position, wages, a bed, and the plain terms
of both: what the work was, what it paid, what would be expected, what would
end it. No promise of kindness. No description of it as a better life. A place,
and that she would stand behind it.

**Why Veronica did not agree at once.** Because leaving is a debt. She was owed
turns and she owed turns, and going meant a gap in an arrangement with no slack
in it. She asked for a day. Clara gave it without comment — which Veronica
weighed more heavily than the wage.

**Why Veronica agreed to return.** She settled what she owed first: the night
place passed on, the mending finished, the tally squared, a word left with the
people who would notice she was gone so they would not think she had been
taken. Then she went — because the terms were stated straight, and because
Clara had waited instead of insisting. **Not because she was saved.** Because
it was a fair arrangement and she could see how it worked.

### The arrival sequence

| Beat | What happened |
|---|---|
| **First night** | Arrived after dark by the yard door, not the front. Shown a room; slept on the floor against the wall with her back to the door, because that is where she had slept for a long time and the body takes no instruction on the first night. Someone noticed in the morning. Nothing was said that day. |
| **First meal** | Bread, broth, small beer, at the kitchen table, sat down, the household eating around her. She ate slowly and not much, and put a piece aside out of habit before she understood there would be another meal. Clara saw it and let it alone. It stopped on its own after a fortnight. |
| **First clothing issue** | Two shifts, one gown, an apron, a cap, stockings, shoes fitted rather than handed down blind. **Her own things were washed and returned to her, not burned.** That was Clara's decision, and Veronica understood exactly what it meant: nothing of hers was being erased to pay for this. |
| **First household task** | The scullery and the water. Deliberately plain, deliberately visible, deliberately the bottom of the order, so no one could say she had been placed over anyone. She did it well and fast — then reset the water route so it took one trip fewer. Noticed, and not by everyone kindly. |
| **First pay** | Era coin, in her hand, counted out in front of her, at the stated rate on the stated day. She asked for it to be counted twice. Clara counted it twice without a word about why. Veronica did not spend it: she sent most of it back to the arrangement she had left, and kept doing so. |
| **First room and bed** | A shared upper room, a bed of her own, and a box that fastened. **The box mattered more than the bed.** By the end of the first month she was sleeping in the bed. She kept sleeping with her back to the door. |

### Who objects, who supports

Recorded by household **role**. No new personal names are created to fill these.

| Holder | Stance | Ground |
|---|---|---|
| The senior of the household staff | **Objects** | Order. Someone brought in off the street and placed outside the usual route unsettles a hierarchy that took years to set. Not cruelty — a real and defensible position, held by someone whose standing genuinely is threatened by an outsider who is immediately good at the work. |
| The one whose task she improved | **Objects** | Pride, and fear. The shortened water route is a visible judgement on how it was done before. |
| The household's keeper of accounts | **Withholds** | Cost. Another wage, another bed, another set of clothes, against a season that is not generous. Neither for nor against her — against the expense. Changes position on evidence, and does. |
| The youngest of the household staff | **Supports** | Relief. The worst of the carrying stopped landing on the smallest person in the house. |
| The yard and stable side | **Supports** | Usefulness. She mends what they break and does not have to be told twice about an animal. |
| Clara Bennett | **Supports** | She stated the terms and stands behind them. Standards are applied to Veronica exactly as to everyone else — **that is the support.** Clara does not soften and does not elevate her, and protects the placement by refusing to make it exceptional. |

**What the household cannot place:** she has no account of herself that fits
their categories. Not trained service, not country-sent, not family-placed, and
not grateful in the way the house expects. She was competent immediately, which
is the hardest thing for a settled household to forgive in a newcomer.

---

## 4 · Inés Morales and Veronica

**Kinship exists. The exact degree is intentionally unknown and is not stored.**
`kinshipDegree()` returns the seal, not a value:
`{ known: false, sealed: true, tiedTo: 'OBJ-LOCKET-001' }`.

**Inés instantly takes to Veronica** and does not know why. The behaviour runs
ahead of the explanation, and that gap is the point.

| Behaviour | How it shows |
|---|---|
| **Feeding** | The first and most obvious. Inés puts food in front of her before anyone asks, more than is needed, and notices immediately when it is not eaten. She does not comment on the piece Veronica puts aside. She simply starts leaving out something that keeps. |
| **Watching** | Inés knows where Veronica is in the house at any hour, and could not say how she knows. She looks up when the yard door goes. |
| **Teaching** | Not correcting — teaching. The order of things, the names of things, who to go to first, what the house means when it says a thing it does not mean. She hands over knowledge that protects Veronica, and does it quickly, as though there is not much time. |
| **Quiet concern** | About the back-to-the-door sleeping, the counting, the money that leaves the house every quarter. She has worked out where it goes. She has not said so. |
| **Defending her when warranted** | Warranted, and only warranted. When the senior of the staff is right, Inés says nothing. When the objection is pride wearing the clothes of order, Inés speaks — briefly, in front of others, and does not repeat herself. |
| **Without understanding why** | Inés has no account of this that satisfies her. She has noticed that she has no account, and that is beginning to be its own problem. |

**The locket is closed.** No contents column exists in the schema and none is
to be added. The locket is tied to the eventual reveal of the kinship degree.
It is not opened, not described from the inside, and not inferred from.

---

## 5 · Vyctor Ebeneezer ↔ Veronica Hall · encounter packet

**Encounter kind:** `FIRST_MEETING`. Permitted, and the only one permitted in
this packet.

**Prior state, held:** Vyctor already knows Inés Morales, from prior visits.
Nothing in this encounter introduces them, reintroduces them, or is written as
though they are meeting. He arrives as someone the house has seen before.

### Conditions

Vyctor is a returning visitor. The household has him placed. Inés has him
placed. **Veronica is the only person in the room he has no account of, and he
is the only person in the room she has no account of.** That symmetry is the
whole shape of the encounter.

His knowledge, memory, identity and experience are with him in full. Nothing
later-era functions. He knows things and can use none of them.

### What Veronica notices first

Not his manner and not his clothes. **The way the household reorganises around
him** — who straightens, who finds a reason to be elsewhere, whose voice
changes pitch. She reads the room's response to him before she reads him, which
is how she reads everything.

Then: that he does not seem to want anything from the house. In her experience,
everyone who arrives is transacting. She cannot find the transaction, and that
is more unsettling to her than a bad one would be.

### What Vyctor notices first

That she is watching the room and not him. That the water comes in by a route
that is not the route the house has always used, and that nobody has explained
the change to him because to them it is now simply the route.

He asks who changed it. He is told. He looks at her differently after that, and
she sees him do it.

### What is said

Little, and about the work. He asks a question about the route — the same kind
of question Clara asked, which Veronica registers immediately and does not
comment on. She answers it fully, because answering fully worked once.

He does not ask where she is from. That is the single most noticeable thing he
does, and she notices it.

### What is not said

- He does not tell her what he is or where he has come from.
- He does not tell her anything about her own future. Disclosure is *permitted*
  in this world — he chooses not to, and the choice is recorded as
  `SILENCE_KEPT`, which is a recorded act, not an absence.
- He says nothing about the locket, which he has not seen.
- He does not name what he thinks he recognises, because he is not yet sure he
  recognises anything.

### Inés during the encounter

Present, and **watching Veronica rather than Vyctor.** She is not anxious about
him. She is anxious about the room's attention landing on Veronica, which is a
different fear and one she cannot yet explain to herself. She stays closer than
she needs to. She does not intervene, because nothing warrants it.

### Clara during the encounter

Clara is not charmed and does not perform. She observes that the visitor has
noticed her servant's competence, and she neither trades on it nor shields her
from it. She lets it stand. **She does not describe how Veronica came to the
house.** That account is Veronica's to give or withhold.

### After-state

| Field | Value |
|---|---|
| Relation Vyctor ↔ Veronica | `NEW_ENCOUNTER`, now `CONTINUED_ACQUAINTANCE` |
| Became history | True. Locked. |
| Branch universe created | False. Locked. |
| Disclosure made | `SILENCE_KEPT` |
| Capability exported backward | None |
| Kinship degree | Still `UNKNOWN`. Still sealed. |
| Locket | Still `CLOSED` |
| Vyctor ↔ Inés | Unchanged. Still preexisting. No first meeting written. |

---

## 6 · The open kinship mystery

What is fixed:

- Kinship between Inés Morales and Veronica Hall **exists**.
- The **degree is unknown**, intentionally, and is not stored anywhere in this
  schema or these documents.
- The **closed locket** is tied to the eventual reveal.
- Inés's behaviour toward Veronica **runs ahead of her understanding of it.**

What is refused:

- No degree is invented, implied, narrowed or hinted at.
- The locket is not opened and its contents are not described, guessed or
  encoded.
- No third person is invented to carry or explain the connection.
- Vyctor is not made the one who knows. He notices something. He is not sure
  what, and he is not told.

The reveal is a sealed Chairman act. Until then the correct state of this
question is **unresolved and visibly unresolved**, which is why
`kinshipDegree()` returns a seal rather than a null: an absent value invites
someone to fill it, and a seal does not.
