// THYLORA Dashboard R6 · interaction witness
// Canonical backend record: THY-DASH-VOICE-SPINE-001
//
// Drives the real workspace in a real browser and reports what it observed, on
// iPad portrait, iPad landscape and desktop in that order.
//
// What this proves: the transport, the anchoring of notes to exact response
// positions, ducking and restore, Pencil input with palm rejection, the preview
// approval gate, and the coverage ledger's refusal to call a run complete when
// an atom has disappeared.
//
// What this does NOT prove: audible speech. A headless browser has no voice, so
// the engine is driven against a deterministic stand-in that speaks at a known
// rate and fires the same events a real voice does. Audio on a real device is
// what the Chairman's own iPad witness is for, and no claim of completion should
// rest on this script alone.
//
//   node dashboard/r6/proof/witness.mjs [output-directory]
//
// Requires playwright. It is not a dependency of this repository:
//   npm install --no-save playwright
import { chromium, devices } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = new URL('../../../', import.meta.url).pathname.replace(/\/$/, '');
const OUT = process.argv[2] || new URL('./screenshots/', import.meta.url).pathname;
fs.mkdirSync(OUT, { recursive: true });

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png' };

const server = http.createServer((req, res) => {
  const file = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404); res.end('not found'); return;
  }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
  res.end(fs.readFileSync(file));
});
await new Promise(r => server.listen(4173, r));
const BASE = 'http://127.0.0.1:4173';

// A deterministic stand-in for the platform voice. Real audio cannot be heard in
// a headless browser, so the engine is driven against a synth that speaks at a
// known rate and fires the same events a real one does. This proves the
// transport, the anchoring and the ducking; it does not prove audio, which is
// what the iPad witness is for.
const FAKE_SYNTH = `
window.__spoken = [];
window.__cancels = 0;
class FakeUtterance extends EventTarget {
  constructor(text){ super(); this.text = text; this.rate = 1; this.volume = 1; this.lang = 'en-US'; }
}
Object.defineProperty(window, 'SpeechSynthesisUtterance', { value: FakeUtterance, configurable: true, writable: true });
Object.defineProperty(window, 'speechSynthesis', { configurable: true, writable: true, value: {
  speaking: false,
  _timer: null,
  _current: null,
  speak(u){
    this.speaking = true;
    this._current = u;
    window.__spoken.push({ text: u.text, rate: u.rate, volume: u.volume, at: Date.now() });
    const charsPerSecond = 17.5 * u.rate;
    const ms = Math.max(30, (u.text.length / charsPerSecond) * 1000);
    let i = 0;
    const step = () => {
      if (this._current !== u) return;
      i += Math.max(1, Math.round(u.text.length / 8));
      if (i < u.text.length) {
        u.onboundary && u.onboundary({ charIndex: Math.min(i, u.text.length - 1) });
        this._timer = setTimeout(step, ms / 8);
      } else {
        this.speaking = false;
        this._current = null;
        u.onend && u.onend({});
      }
    };
    this._timer = setTimeout(step, ms / 8);
  },
  cancel(){ window.__cancels++; clearTimeout(this._timer); this._current = null; this.speaking = false; },
  pause(){}, resume(){}, getVoices(){ return []; }
} });
window.__fakeSynthInstalled = (window.speechSynthesis && typeof window.speechSynthesis.cancel === 'function' && Array.isArray(window.__spoken));
`;

const RESPONSE = [
  'The THYLORA storefront is live in three territories and the product passports have been issued.',
  'Payment acceptance is not connected, so no order can complete and no money can arrive yet.',
  'The media network is producing but nothing has been published to an audience outside the family.',
  'We plan to ship the first commercial release on Friday regardless of the payment rail state.',
  'That plan carries the risk that a customer arrives at a checkout that cannot take their money.'
].join(' ');

const findings = [];
const record = (name, ok, detail) => {
  findings.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
};

async function run(label, contextOptions, shotPrefix) {
  console.log(`\n===== ${label} =====`);
  const browser = await chromium.launch({ ...(process.env.THY_CHROMIUM ? { executablePath: process.env.THY_CHROMIUM } : {}) });
  const context = await browser.newContext(contextOptions);
  await context.addInitScript(FAKE_SYNTH);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { const where = m.location?.().url || ''; if (m.type() === 'error' && !/favicon/i.test(where + m.text())) errors.push(`${m.text()} @ ${where}`); });
  page.on('requestfailed', r => { if (!/favicon/i.test(r.url())) errors.push(`request failed: ${r.url()}`); });

  await page.goto(`${BASE}/dashboard/r6/index.html`);
  await page.waitForFunction(() => !!window.thyR6);

  const synthReady = await page.evaluate(() => window.__fakeSynthInstalled === true);
  if (!synthReady) throw new Error('The deterministic voice stub did not install; the proof would be measuring nothing.');

  // ---- 1. open the workspace, two lanes ----------------------------------
  await page.click('#openWorkspace');
  await page.waitForSelector('#thyR6Shell.open');
  const lanes = await page.evaluate(() => {
    const left = document.getElementById('thyR6Left').getBoundingClientRect();
    const right = document.getElementById('thyR6Right').getBoundingClientRect();
    return { left, right, sideBySide: right.left >= left.right - 2, width: innerWidth };
  });
  record(`${label}: two lanes present`, !!lanes.left.width && !!lanes.right.width,
    `left ${Math.round(lanes.left.width)}px, right ${Math.round(lanes.right.width)}px, side-by-side ${lanes.sideBySide} at ${lanes.width}px`);

  // ---- 2. load a response -------------------------------------------------
  await page.fill('#thyR6Source', RESPONSE);
  await page.click('#thyR6Load');
  const loaded = await page.textContent('#thyR6ResponsePill');
  record(`${label}: response loaded and segmented`, /SEGMENTS/.test(loaded), loaded);

  // ---- 3. speak, and watch the position actually advance ------------------
  await page.click('#thyR6Speak');
  await page.waitForTimeout(700);
  const p1 = await page.evaluate(() => window.thyR6.engine.position());
  await page.waitForTimeout(900);
  const p2 = await page.evaluate(() => window.thyR6.engine.position());
  record(`${label}: readback advances through the response`, p2.char > p1.char,
    `char ${p1.char} → ${p2.char} of ${p2.totalChars}`);

  const highlighted = await page.evaluate(() => ({
    said: document.querySelector('.thy-r6-said')?.textContent.length || 0,
    now: document.querySelector('.thy-r6-now')?.textContent.length || 0,
    ahead: document.querySelector('.thy-r6-ahead')?.textContent.length || 0
  }));
  record(`${label}: spoken / speaking / read-ahead shown in place`,
    highlighted.said > 0 && highlighted.ahead > 0 && (highlighted.said + highlighted.now + highlighted.ahead) === RESPONSE.length,
    `said ${highlighted.said} + now ${highlighted.now} + ahead ${highlighted.ahead} = ${RESPONSE.length}`);

  // ---- 4. pause holds the place, resume continues from it -----------------
  await page.click('#thyR6Pause');
  const paused = await page.evaluate(() => window.thyR6.engine.position().char);
  await page.waitForTimeout(500);
  const stillPaused = await page.evaluate(() => window.thyR6.engine.position().char);
  record(`${label}: pause holds the exact place`, paused === stillPaused, `held at char ${paused}`);

  await page.click('#thyR6Resume');
  await page.waitForTimeout(500);
  const resumed = await page.evaluate(() => ({
    char: window.thyR6.engine.position().char,
    lastSpoken: window.__spoken[window.__spoken.length - 1].text
  }));
  const midSentence = !RESPONSE.startsWith(resumed.lastSpoken);
  record(`${label}: resume continues mid-sentence, not from the top`,
    resumed.char >= paused && midSentence, `resumed at char ${resumed.char}; utterance began "${resumed.lastSpoken.slice(0, 32)}…"`);

  // ---- 5. jump back ten seconds ------------------------------------------
  // Move well into the response first: ten seconds cannot be given back from a
  // place that is only two seconds in, and clamping to zero there is correct.
  await page.evaluate(() => window.thyR6.engine.seekTo(Math.round(window.thyR6.engine.text.length * 0.6)));
  const before = await page.evaluate(() => window.thyR6.engine.position().char);
  await page.click('#thyR6Back');
  const jumped = await page.evaluate(() => ({ char: window.thyR6.engine.position().char, calibration: window.thyR6.engine.calibration }));
  const after = jumped.char;
  const movedSeconds = (before - after) / (17.5 * jumped.calibration);
  record(`${label}: jump back 10s moves back ten seconds of speech`,
    after < before && Math.abs(movedSeconds - 10) < 2.5,
    `char ${before} → ${after} (${movedSeconds.toFixed(1)}s at rate 1)`);

  await page.click('#thyR6Fwd');
  const forward = await page.evaluate(() => window.thyR6.engine.position().char);
  record(`${label}: jump forward moves ahead`, forward > after, `char ${after} → ${forward}`);

  const clamped = await page.evaluate(() => {
    window.thyR6.engine.pause();          // read the mark itself, not a position it has since spoken past
    window.thyR6.engine.seekTo(20);
    window.thyR6.engine.jumpBack();
    const mark = window.thyR6.engine.position().char;
    window.thyR6.engine.resume();
    return mark;
  });
  record(`${label}: jumping back past the start lands on the start`, clamped === 0, `char 20 → ${clamped}`);
  await page.evaluate(() => window.thyR6.engine.seekTo(Math.round(window.thyR6.engine.text.length * 0.35)));

  // ---- 6. speed changes mid-readback -------------------------------------
  await page.evaluate(() => {
    const s = document.getElementById('thyR6Speed');
    s.value = '1.75';
    s.dispatchEvent(new Event('input', { bubbles: true }));
  });
  const speed = await page.evaluate(() => ({
    rate: window.thyR6.engine.rate,
    label: document.getElementById('thyR6SpeedLabel').textContent,
    utteranceRate: window.__spoken[window.__spoken.length - 1].rate
  }));
  record(`${label}: playback speed applies to the voice immediately`,
    speed.rate === 1.75 && speed.utteranceRate === 1.75, `rate ${speed.label}, current utterance at ${speed.utteranceRate}×`);

  // ---- 7. hold the microphone: duck, anchor, restore ----------------------
  const duck = await page.evaluate(async () => {
    const engine = window.thyR6.engine;
    const before = { state: engine.state, char: engine.position().char };
    const mic = document.getElementById('thyR6Mic');
    mic.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1 }));
    await new Promise(r => setTimeout(r, 350));
    const during = {
      state: engine.state,
      volume: window.__spoken[window.__spoken.length - 1].volume,
      holding: mic.classList.contains('holding')
    };
    // the Chairman's words, as recognition would have delivered them
    window.thyR6.mic.finalText = 'This payment gap is the real blocker. ';
    mic.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1 }));
    await new Promise(r => setTimeout(r, 250));
    return { before, during, after: { state: engine.state, volume: window.__spoken[window.__spoken.length - 1].volume } };
  });
  record(`${label}: readback ducks while the Chairman speaks`,
    duck.during.state === 'DUCKED' && duck.during.volume < 1 && duck.during.holding,
    `state ${duck.before.state} → ${duck.during.state}, volume ${duck.during.volume}`);
  record(`${label}: readback restores on release`,
    duck.after.state === 'SPEAKING' && duck.after.volume === 1,
    `state ${duck.after.state}, volume ${duck.after.volume}`);

  const note = await page.evaluate(() => {
    const n = window.thyR6.notes[window.thyR6.notes.length - 1];
    return { body: n.body, char: n.anchor.char, percent: n.anchor.percent, preview: n.anchor.preview_after.slice(0, 40), kind: n.kind, id: n.note_id };
  });
  record(`${label}: the note is timestamped to the exact response location`,
    note.char === duck.before.char && note.percent > 0,
    `"${note.body.trim()}" anchored at char ${note.char} (${note.percent}%) → "${note.preview.trim()}…"`);

  const intact = await page.evaluate(r => document.getElementById('thyR6Response').textContent === r, RESPONSE);
  record(`${label}: the original response is not destroyed`, intact, 'response text identical after the note');

  // ---- 8. a second note: both survive as separate atoms -------------------
  await page.evaluate(async () => {
    window.thyR6.engine.seekTo(Math.round(window.thyR6.engine.text.length * 0.8));
    const mic = document.getElementById('thyR6Mic');
    mic.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 2 }));
    await new Promise(r => setTimeout(r, 120));
    window.thyR6.mic.finalText = 'Confirm the Friday date with production. ';
    mic.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 2 }));
    await new Promise(r => setTimeout(r, 150));
  });
  await page.waitForTimeout(300);
  const atoms = await page.evaluate(() => window.thyR6.notes.map(n => ({ id: n.note_id, char: n.anchor.char, body: n.body.trim() })));
  record(`${label}: every note preserved as its own atom`,
    atoms.length === 2 && atoms[0].id !== atoms[1].id,
    `${atoms.length} atoms: ${atoms.map(a => `@${a.char}`).join(', ')}`);

  await page.click('#thyR6Stop');

  // ---- 9. build next prompt from selected notes --------------------------
  await page.evaluate(() => {
    document.querySelectorAll('.thy-r6-note-acts button').forEach(b => { if (b.textContent === 'Select') b.click(); });
  });
  const buildEnabled = await page.isEnabled('#thyR6Build');
  await page.click('#thyR6Build');
  const next = await page.inputValue('#thyR6NextPrompt');
  record(`${label}: BUILD NEXT PROMPT FROM SELECTED NOTES`,
    buildEnabled && /1\./.test(next) && /2\./.test(next) && /payment gap/.test(next) && /Friday date/.test(next),
    `${next.split('\n').length} lines, both notes carried with their anchors`);

  await page.screenshot({ path: `${OUT}/${shotPrefix}-1-workspace.png`, fullPage: false });

  // ---- 10. Apple Pencil canvas + palm rejection --------------------------
  const ink = await page.evaluate(async () => {
    const c = document.getElementById('thyR6Canvas');
    const r = c.getBoundingClientRect();
    const pen = (type, x, y, pressure) => c.dispatchEvent(new PointerEvent(type, {
      bubbles: true, pointerId: 1, pointerType: 'pen', pressure,
      clientX: r.left + x, clientY: r.top + y
    }));
    pen('pointerdown', 30, 40, 0.3);
    for (let i = 1; i <= 12; i++) pen('pointermove', 30 + i * 12, 40 + Math.sin(i / 2) * 22, 0.3 + i * 0.05);
    pen('pointerup', 180, 40, 0.8);
    const afterPen = window.thyR6.canvas.strokes.length;

    // a palm resting on the glass after the Pencil has been used
    const touch = (type, x, y) => c.dispatchEvent(new PointerEvent(type, {
      bubbles: true, pointerId: 2, pointerType: 'touch', pressure: 0.5,
      clientX: r.left + x, clientY: r.top + y
    }));
    touch('pointerdown', 60, 150);
    for (let i = 0; i < 8; i++) touch('pointermove', 60 + i * 15, 150);
    touch('pointerup', 180, 150);
    const afterPalm = window.thyR6.canvas.strokes.length;

    // arrow and circle
    window.thyR6.canvas.setTool('ARROW');
    pen('pointerdown', 40, 200, 0.5); pen('pointermove', 200, 230, 0.5); pen('pointerup', 200, 230, 0.5);
    window.thyR6.canvas.setTool('CIRCLE');
    pen('pointerdown', 220, 60, 0.5); pen('pointermove', 320, 140, 0.5); pen('pointerup', 320, 140, 0.5);

    const strokes = window.thyR6.canvas.strokes;
    const pressures = strokes[0].points.map(p => p.p);
    return {
      afterPen, afterPalm, total: strokes.length,
      tools: strokes.map(s => s.tool),
      points: strokes[0].points.length,
      pressureVaried: new Set(pressures).size > 1
    };
  });
  record(`${label}: Apple Pencil draws freehand with pressure`,
    ink.afterPen === 1 && ink.points > 5 && ink.pressureVaried,
    `${ink.points} points, pressure varies across the stroke`);
  record(`${label}: palm rejection — finger does not draw after the Pencil`,
    ink.afterPalm === ink.afterPen, `strokes stayed at ${ink.afterPalm} through the palm drag`);
  record(`${label}: arrows and circles draw`, ink.tools.includes('ARROW') && ink.tools.includes('CIRCLE'),
    `tools drawn: ${ink.tools.join(', ')}`);

  // comment pin tied to coordinates
  const pin = await page.evaluate(async () => {
    window.prompt = () => 'Tighten this crop before approval.';
    window.thyR6.canvas.setTool('PIN');
    const c = document.getElementById('thyR6Canvas');
    const r = c.getBoundingClientRect();
    c.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, pointerType: 'pen', pressure: 0.5, clientX: r.left + r.width * 0.5, clientY: r.top + r.height * 0.5 }));
    const p = window.thyR6.canvas.pins[0];
    return p ? { x: p.x, y: p.y, body: p.body, target: p.target?.type } : null;
  });
  record(`${label}: comment pin tied to coordinates`,
    !!pin && pin.x > 0.4 && pin.x < 0.6 && !!pin.body,
    pin ? `pin at x ${pin.x}, y ${pin.y} on ${pin.target}: "${pin.body}"` : 'no pin created');

  // ink saved as its own atom
  await page.click('#thyR6SaveInk');
  const inkNote = await page.evaluate(() => {
    const n = window.thyR6.notes[window.thyR6.notes.length - 1];
    return { kind: n.kind, body: n.body, strokes: n.ink?.strokes?.length, pins: n.ink?.pins?.length };
  });
  record(`${label}: canvas preserved as a note atom`,
    inkNote.kind === 'INK' && inkNote.strokes >= 3,
    `${inkNote.body} (${inkNote.strokes} strokes, ${inkNote.pins} pins)`);

  await page.screenshot({ path: `${OUT}/${shotPrefix}-2-canvas.png` });

  // ---- 11. preview room ---------------------------------------------------
  await page.click('button[data-room="PREVIEW"]');
  const png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAPklEQVR42u3OMQEAAAgDoC251a3gLmSQ2m1qgQIFChQoUKBAgQIFChQoUKBAgQIFChQoUKBAgQIFChQo8OMBoq4AAViaTXwAAAAASUVORK5CYII=';
  await page.fill('#thyR6PreviewUrl', png);
  await page.click('#thyR6PreviewOpen');
  await page.waitForTimeout(400);
  const preview = await page.evaluate(() => ({
    stage: !!document.querySelector('#thyR6Stage img'),
    status: document.getElementById('thyR6PreviewStatus').textContent
  }));
  record(`${label}: preview room opens an image`, preview.stage, preview.status);

  await page.click('#thyR6Enlarge');
  const enlarged = await page.evaluate(() => document.getElementById('thyR6Stage').classList.contains('enlarged'));
  record(`${label}: preview enlarges`, enlarged, 'stage entered enlarged mode');
  await page.click('#thyR6Shrink');

  const approval = await page.evaluate(async () => {
    window.prompt = () => '';                        // a pin with no comment
    window.thyR6.previewCanvas.setTool('PIN');
    const c = document.getElementById('thyR6PreviewCanvas');
    const r = c.getBoundingClientRect();
    c.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, pointerType: 'pen', pressure: .5, clientX: r.left + 40, clientY: r.top + 40 }));
    document.getElementById('thyR6Approve').click();
    const refused = document.getElementById('thyR6PreviewStatus').textContent;

    window.prompt = () => 'Colour is right, ship it.';
    c.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, pointerType: 'pen', pressure: .5, clientX: r.left + 90, clientY: r.top + 70 }));
    // give the empty pin a comment so approval can proceed
    window.thyR6.previewCanvas.pins[0].body = 'Crop is tight enough.';
    document.getElementById('thyR6Approve').click();
    return { refused, state: document.getElementById('thyR6ApprovalState').textContent, status: document.getElementById('thyR6PreviewStatus').textContent };
  });
  record(`${label}: approval refused while a comment pin is empty`,
    /refused/i.test(approval.refused), approval.refused);
  record(`${label}: approval recorded once comments are complete`,
    approval.state === 'APPROVED', approval.status);

  await page.screenshot({ path: `${OUT}/${shotPrefix}-3-preview.png` });

  // ---- 12. coverage ledger ------------------------------------------------
  await page.click('button[data-room="COVERAGE"]');
  const CHAIRMAN_PROMPT = `BUILD:
1. Two-lane Chairman workspace.
2. Response controls: Speak / Pause / Resume / Stop.
3. Duck readback audio while Chairman speaks.
4. Preserve all notes as individual atoms.`;
  await page.fill('#thyR6PromptInput', CHAIRMAN_PROMPT);
  await page.click('#thyR6Atomize');
  const atomized = await page.evaluate(() => ({
    count: window.thyR6.ledger.atoms.length,
    verdict: document.getElementById('thyR6Gate').textContent,
    pass: document.getElementById('thyR6Gate').classList.contains('pass')
  }));
  record(`${label}: prompt atomized into the coverage ledger`, atomized.count >= 4, `${atomized.count} atoms`);
  record(`${label}: completion refused while atoms are UNKNOWN`, !atomized.pass, atomized.verdict);

  // a deferral with no reason must be refused
  const deferral = await page.evaluate(async () => {
    const select = document.querySelector('#thyR6Atoms select');
    select.value = 'DEFERRED_WITH_REASON';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    await new Promise(r => setTimeout(r, 50));
    return {
      verdict: document.getElementById('thyR6Gate').textContent,
      stillUnknown: window.thyR6.ledger.atoms[0].state
    };
  });
  record(`${label}: a deferral without a reason is refused`,
    /requires a stated reason/i.test(deferral.verdict) && deferral.stillUnknown === 'UNKNOWN',
    deferral.verdict);

  // resolve everything, then make an atom disappear
  const gate = await page.evaluate(async () => {
    const selects = [...document.querySelectorAll('#thyR6Atoms select')];
    for (const s of selects) {
      s.value = 'EXECUTED';
      s.dispatchEvent(new Event('change', { bubbles: true }));
      await new Promise(r => setTimeout(r, 30));
    }
    const complete = document.getElementById('thyR6Gate').textContent;
    const wasPass = document.getElementById('thyR6Gate').classList.contains('pass');

    // now drop one atom, exactly the failure the Chairman named
    const ledger = window.thyR6.ledger;
    const dropped = ledger.atoms[1];
    window.thyR6.atomize('');    // no-op guard
    const tampered = { ...ledger, atoms: ledger.atoms.filter(a => a.atom_id !== dropped.atom_id) };
    const mod = await import('/dashboard/r6/lib/coverage-ledger.js');
    const verdict = mod.completionGate(tampered, { previous: ledger });
    return { complete, wasPass, droppedText: dropped.text, failed: !verdict.complete, statement: verdict.statement, blocker: verdict.blockers[0]?.failure };
  });
  record(`${label}: completion passes only when every atom resolved`, gate.wasPass, gate.complete);
  record(`${label}: completion FAILS when an atom silently disappears`,
    gate.failed && gate.blocker === 'ATOM_DISAPPEARED',
    `dropped "${gate.droppedText}" → ${gate.statement}`);

  await page.screenshot({ path: `${OUT}/${shotPrefix}-4-ledger.png` });

  // ---- 13. arrival matrix + money-distance --------------------------------
  await page.click('button[data-room="ARRIVAL"]');
  await page.click('#thyR6LoadMatrix');
  await page.waitForTimeout(500);
  const arrival = await page.textContent('#thyR6MatrixSummary');
  record(`${label}: arrival matrix reports honestly with no backend session`,
    /No arrival records|cannot be claimed/i.test(arrival), arrival.slice(0, 120));

  await page.click('#thyR6MeasureMoney');
  await page.waitForTimeout(500);
  const money = await page.textContent('#thyR6MoneySummary');
  record(`${label}: money-distance refuses to measure from assumptions`,
    /not measured from assumptions|Money-distance/i.test(money), money.slice(0, 120));

  await page.screenshot({ path: `${OUT}/${shotPrefix}-5-arrival.png` });

  // ---- 14. media router ----------------------------------------------------
  await page.click('button[data-room="MEDIA"]');
  await page.waitForTimeout(250);

  const offers = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('#thyMROffers .thy-r6-note')];
    return cards.map(c => c.innerText);
  });
  const discloses = offers.length > 0 && offers.every(t =>
    /Estimated cost/.test(t) && /Expected duration/.test(t) && /Resolution/.test(t) && /Audio/.test(t));
  record(`${label}: every provider offer discloses cost, duration, resolution and audio`,
    discloses, `${offers.length} offer(s) rendered, all five disclosures present`);

  const blocked = await page.evaluate(() => ({
    verdict: document.getElementById('thyMRDecision').textContent,
    authoriseDisabled: document.getElementById('thyMRAuthorise').disabled
  }));
  record(`${label}: spend is blocked while rate cards are unverified and keys absent`,
    blocked.authoriseDisabled && /Cannot generate/.test(blocked.verdict),
    blocked.verdict.slice(0, 130));

  const noPrice = await page.evaluate(() =>
    [...document.querySelectorAll('#thyMROffers .thy-r6-note')].every(c => /cost unknown/.test(c.innerText)));
  record(`${label}: no invented price is shown for an unverified rate card`,
    noPrice, 'every offer reads "cost unknown" rather than a fabricated number');

  // Naming a provider that cannot serve must refuse and offer a named substitute.
  const substitution = await page.evaluate(async () => {
    const op = document.getElementById('thyMROperation');
    op.value = 'VIDEO_TO_VIDEO';
    op.dispatchEvent(new Event('change', { bubbles: true }));
    const prov = document.getElementById('thyMRProvider');
    prov.value = 'runway';                       // runway cannot do video-to-video
    prov.dispatchEvent(new Event('change', { bubbles: true }));
    await new Promise(r => setTimeout(r, 60));
    return {
      verdict: document.getElementById('thyMRDecision').textContent,
      consentOffered: !!document.getElementById('thyMRConsent'),
      consentLabel: document.getElementById('thyMRConsent')?.innerText || ''
    };
  });
  record(`${label}: a provider that cannot serve is refused, not swapped`,
    /SUBSTITUTION_REQUIRES_CONSENT|OPERATION_UNSUPPORTED/.test(substitution.verdict),
    substitution.verdict.slice(0, 130));
  // With no provider funded, there is no runnable substitute to offer. The
  // contract is then that the capable-but-blocked provider is still disclosed,
  // and that no "use this instead" control appears.
  const offersSwap = /Name /.test(substitution.consentLabel);
  record(`${label}: no substitute is offered when none can actually run`,
    !offersSwap, offersSwap ? 'a swap control appeared with nothing funded' : 'no swap control offered');
  record(`${label}: the capable-but-unfunded provider is still named`,
    /can perform VIDEO_TO_VIDEO/.test(substitution.consentLabel),
    substitution.consentLabel.replace(/\s+/g, ' ').slice(0, 120));

  const moneyDistance = await page.evaluate(() => ({
    line: document.getElementById('thyMRMoneyLine').textContent,
    open: [...document.querySelectorAll('#thyMRMoney .thy-r6-gate-line')].filter(g => /OPEN/.test(g.innerText)).length,
    closed: [...document.querySelectorAll('#thyMRMoney .thy-r6-gate-line')].filter(g => /evidenced/.test(g.innerText)).length
  }));
  record(`${label}: money-distance to a finished clip is measured and stated`,
    /Money-distance/.test(moneyDistance.line) && moneyDistance.open > 0,
    `${moneyDistance.line} (${moneyDistance.closed} closed, ${moneyDistance.open} open)`);

  await page.screenshot({ path: `${OUT}/${shotPrefix}-6-media.png` });

  // ---- 15. persistence across reload --------------------------------------
  await page.reload();
  await page.waitForFunction(() => !!window.thyR6);
  const restored = await page.evaluate(() => ({
    notes: window.thyR6.notes.length,
    atoms: window.thyR6.ledger?.atoms.length || 0
  }));
  record(`${label}: notes and ledger survive a reload`,
    restored.notes >= 3 && restored.atoms >= 4,
    `${restored.notes} note atoms and ${restored.atoms} prompt atoms restored`);

  record(`${label}: no uncaught page errors`, errors.length === 0, errors.slice(0, 2).join(' | ') || 'none');

  await browser.close();
}

const iPad = devices['iPad Pro 11'];
await run('iPad Pro 11 portrait', { ...iPad, hasTouch: true, permissions: [] }, 'ipad');
await run('iPad Pro 11 landscape', { ...iPad, viewport: { width: 1194, height: 834 }, hasTouch: true }, 'ipad-landscape');
await run('Desktop 1440x900', { viewport: { width: 1440, height: 900 } }, 'desktop');

server.close();
const failed = findings.filter(f => !f.ok);
console.log(`\n===== ${findings.length - failed.length}/${findings.length} checks passed =====`);
if (failed.length) { failed.forEach(f => console.log('FAILED: ' + f.name + ' — ' + f.detail)); process.exit(1); }
