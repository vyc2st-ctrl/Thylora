// ROOT HOUSE · the Parlor: STEEPED, the nightly tea-table game
// Workroom: WR-LINEAGE-001
//
// Grandmother's tea set comes out. Whoever is poured for answers. Then they pour
// for the next person and pick that person's card. Every few nights one card is
// an "Elder card" — a question to carry to a grandparent or great-aunt. The
// answer comes back to the Parlor as a FAMILY_TOLD story on the Root House
// floors, credited to whoever asked and whoever told it.

export const DECKS = Object.freeze({
  STEEP: [ // how was your day — said a different way every night
    'Rose, thorn, bud: one good thing, one hard thing, one thing you’re looking forward to.',
    'If today were a movie, what would the title be?',
    'What made you laugh today — act it out.',
    'Who was kind to you today? Who were you kind to?',
    'Rate your day 1–10, then convince us it deserves one point more.',
    'What’s one thing you learned today that you could teach us right now?',
    'What did you worry about today, and is it still heavy?',
    'Pick an animal that matches your mood right now. Why?',
    'What was the loudest moment of your day? The quietest?',
    'If you could redo one minute of today, which minute?'
  ],
  SUGAR: [ // light, silly, keeps it a game
    'Two truths and a fib about your day. We guess the fib.',
    'Describe your day using only three snacks.',
    'Sing one line about your day to a song everybody knows.',
    'What would a fruit fly say about our kitchen tonight?',
    'You’re a monster in a classic movie. Which one, and what’s your weakness?',
    'Pitch a TV show starring this family. What’s it called?'
  ],
  ELDER: [ // carry to a grandparent — answers go to the Root House Parlor
    'What was your grandmother’s full name, and what did people call her?',
    'Where was your mother born? Did she ever talk about where her people came from?',
    'Did anyone in our family ever live in Canada? Who told you, and what did they say?',
    'What church did your family go to when you were little?',
    'What did your grandfather do for work?',
    'Is there a family Bible, an old photo, a funeral program or a letter? Who has it?',
    'What town or county do you remember visiting family in?',
    'Who was the oldest person you knew as a child, and how were they related to you?',
    'What did the family cook for holidays, and who taught it?',
    'Is there a story everybody tells at reunions?'
  ],
  LEAF: [ // wild card: the reader reads the "leaves" and gives everybody a fortune
    'Read the leaves: give every person at the table a fortune for tomorrow.',
    'Read the leaves: say one thing you admire about the person on your left.',
    'Read the leaves: name a small promise for tomorrow and who will check on it.'
  ]
});

// Deterministic per night so everyone sees the same cards on any device.
export function seeded(seed) {
  let x = 0;
  for (const ch of String(seed)) x = (x * 31 + ch.charCodeAt(0)) >>> 0;
  return () => { x = (x * 1664525 + 1013904223) >>> 0; return x / 2 ** 32; };
}

export function pourOrder(players, night = 0) {
  if (!players?.length) return [];
  const k = night % players.length;
  return players.slice(k).concat(players.slice(0, k));
}

// One card per player; one Elder card on every third night; one Leaf wild card
// for the last person poured.
export function dealNight(players, dateKey, nightNumber = 0) {
  const order = pourOrder(players, nightNumber);
  const rand = seeded(dateKey);
  const pick = deck => DECKS[deck][Math.floor(rand() * DECKS[deck].length)];
  const elderSeat = nightNumber % 3 === 0 ? Math.floor(rand() * order.length) : -1;
  return order.map((player, i) => {
    const deck = i === elderSeat ? 'ELDER' : i === order.length - 1 && order.length > 2 ? 'LEAF'
      : i % 2 === 0 ? 'STEEP' : 'SUGAR';
    return { player, pouredBy: order[(i - 1 + order.length) % order.length], deck, card: pick(deck) };
  });
}

// Sugar cubes: a tiny score for good listening, not for "winning" the day.
export function awardCube(tally, player, reason) {
  if (!reason) throw new Error('a sugar cube needs a reason said out loud');
  return { ...tally, [player]: (tally[player] ?? 0) + 1 };
}

// An Elder answer becomes a Root House story: credited, graded, never edited.
export function elderAnswer({ asker, teller, question, answer, date }) {
  if (!asker || !teller || !answer) throw new Error('asker, teller and answer are all required');
  return { teller, asked_by: asker, question, text: answer, recorded: date ?? new Date().toISOString().slice(0, 10),
    grade: 'FAMILY_TOLD', source: 'Parlor · STEEPED Elder card' };
}

// Monster Night: the classics they asked for, plus the Black horror lineage.
export const MONSTER_NIGHT = Object.freeze([
  { title: 'Dracula', year: 1931, rating: 'Not rated (pre-Code)', note: 'Bela Lugosi. Spooky, slow, safe for most kids.' },
  { title: 'Frankenstein', year: 1931, rating: 'Not rated (pre-Code)', note: 'Boris Karloff. Short — about 70 minutes.' },
  { title: 'Bride of Frankenstein', year: 1935, rating: 'Not rated', note: 'Watch right after Frankenstein; it picks up the same night.' },
  { title: 'The Conjuring 2', year: 2016, rating: 'R', note: 'Real scares. Parent call by age — pause button is allowed.' },
  { title: 'Night of the Living Dead', year: 1968, rating: 'Not rated', note: 'Duane Jones plays Ben — a Black lead hero in 1968, and the ending is a lesson.' },
  { title: 'Blacula', year: 1972, rating: 'PG', note: 'William Marshall as an African prince cursed by Dracula. Pairs with the 1931 Dracula.' },
  { title: 'Ganja & Hess', year: 1973, rating: 'R', note: 'Bill Gunn’s art-house vampire film. Grown-ups first.' },
  { title: 'Candyman', year: 1992, rating: 'R', note: 'Grown-ups first.' },
  { title: 'Get Out', year: 2017, rating: 'R', note: 'Grown-ups first; great talk after.' }
]);

export const SNACKS = Object.freeze(['Fruit board', 'Popcorn bar (butter, cinnamon sugar, cheddar)', 'Tea with grandmother’s set', 'Frozen grapes', 'Apple “monster mouths” with peanut butter']);
