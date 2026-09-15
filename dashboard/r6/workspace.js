// THYLORA Dashboard R6 · two-lane Chairman workspace
// Canonical backend records:
//   THY-DASH-VOICE-SPINE-001
//   THY-IDEA-DASHBOARD-SCREEN-ARCHITECTURE-001
//   THY-IDEA-READBACK-MARGIN-NOTES-001
//   THY-IDEA-PROMPT-COVERAGE-LEDGER-001
//
// This module builds its own DOM and attaches it to the page. It does not query,
// restyle or rewrite anything the current head already renders. That is what
// makes it additive: the authoritative dashboard gains one script tag and loses
// nothing, and if this file were deleted the dashboard would be exactly as it
// was before.
//
// It reads from the host page in one direction only — "Capture from dashboard"
// lifts the latest department reply out of the existing talk history so the
// Chairman can hear it read back and mark it up without re-pasting it.

import { ReadbackEngine } from './readback-engine.js';
import { NoteMicrophone } from './note-mic.js';
import { AnnotationCanvas, INK_COLORS } from './canvas.js';
import { TOOLS, describeInk } from './lib/ink.js';
import { clock, READBACK_STATES, MIN_RATE, MAX_RATE } from './lib/readback.js';
import {
  createNote, attachNote, setSelected, setCustody, liveNotes, inResponseOrder,
  buildNextPrompt, custodyReport, selectedNotes, NOTE_KINDS, NOTE_CUSTODY
} from './lib/margin-notes.js';
import {
  atomizePrompt, resolveAtom, coverage, completionGate, verifyContinuity,
  ATOM_STATES, RESOLVED_STATES, reviveLedger
} from './lib/coverage-ledger.js';
import { measureStore, portfolioDistance, readingsFromRows, MONEY_GATES, GATE_STATES } from './lib/money-distance.js';
import { buildMatrix, summarise, proofGap, ARRIVAL_LANES, ARRIVAL_STATES } from './lib/arrival-matrix.js';
import { Custody } from './custody.js';
import { buildMediaRouterRoom } from './media-router-room.js';

const RELEASE = 'THY-DASH-R6-WORKSPACE-001';

// ---- tiny DOM helpers ------------------------------------------------------

function el(tag, props = {}, kids = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k === 'style') Object.assign(node.style, v);
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else if (v !== null && v !== undefined) node.setAttribute(k, v);
  }
  for (const kid of [].concat(kids)) {
    if (kid == null) continue;
    node.appendChild(typeof kid === 'string' ? document.createTextNode(kid) : kid);
  }
  return node;
}

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function mountChairmanWorkspace(options = {}) {
  const host = options.mount || document.body;
  const custody = new Custody({ onStatus: (m, k) => state.say(m, k) });

  // ---- state ---------------------------------------------------------------

  const state = {
    response: { id: null, text: '', title: 'the response' },
    notes: Object.freeze([]),
    ledger: null,
    ledgerBaseline: null,     // the first reading, for disappearance checks
    room: 'WORKSPACE',
    say(message, kind = '') { ui.status.className = 'thy-r6-state ' + kind; ui.status.textContent = message; }
  };

  const engine = new ReadbackEngine();

  // ---- shell ---------------------------------------------------------------

  const ui = {};

  ui.launch = el('button', {
    class: 'thy-r6-launch', id: 'thyR6Launch', type: 'button',
    'aria-label': 'Open the Chairman readback and margin-note workspace'
  }, ['◑ CHAIRMAN WORKSPACE']);

  ui.status = el('div', { class: 'thy-r6-state', id: 'thyR6Status' },
    ['Load a response into the left lane to begin.']);

  const roomButton = (code, label) => el('button', {
    type: 'button', role: 'tab', 'data-room': code,
    'aria-selected': String(code === 'WORKSPACE'),
    onclick: () => showRoom(code)
  }, [label]);

  ui.rooms = el('div', { class: 'thy-r6-rooms', role: 'tablist' }, [
    roomButton('WORKSPACE', 'Workspace'),
    roomButton('PREVIEW', 'Preview room'),
    roomButton('COVERAGE', 'Coverage ledger'),
    roomButton('ARRIVAL', 'Arrival matrix'),
    roomButton('MEDIA', 'Media router')
  ]);

  ui.shell = el('div', { class: 'thy-r6 thy-r6-shell', id: 'thyR6Shell', role: 'dialog', 'aria-label': 'Chairman workspace' }, [
    el('div', { class: 'thy-r6-head' }, [
      el('div', {}, [
        el('h2', { text: 'CHAIRMAN WORKSPACE · R6' }),
        el('div', { class: 'thy-r6-sub', text: `Readback · margin notes · coverage · ${RELEASE}` })
      ]),
      el('div', { class: 'thy-r6-spacer' }),
      ui.rooms,
      el('button', {
        type: 'button', class: 'thy-r6-close',
        style: { minHeight: '38px', padding: '7px 13px', borderRadius: '9px', border: '1px solid #293342', background: '#0d131b', color: '#9fa8b5', cursor: 'pointer' },
        onclick: close
      }, ['Close'])
    ])
  ]);

  ui.body = el('div', { class: 'thy-r6-body' });
  ui.shell.appendChild(ui.body);

  // ---- room 1: the two lanes ----------------------------------------------

  // LEFT LANE — response, readback, read-ahead
  ui.responseBox = el('div', { class: 'thy-r6-response', id: 'thyR6Response' },
    [el('span', { class: 'thy-r6-empty', text: 'No response loaded.' })]);

  ui.sourceInput = el('textarea', {
    class: 'thy-r6-input thy-r6-textarea', id: 'thyR6Source',
    placeholder: 'Paste a THYLORA response here, or capture the latest department reply from the dashboard.'
  });

  const transportButton = (id, label, handler, primary = false) => el('button', {
    type: 'button', id, class: primary ? 'primary' : '', onclick: handler
  }, [label]);

  ui.transport = el('div', { class: 'thy-r6-transport' }, [
    transportButton('thyR6Speak', '▶ Speak', () => { engine.speak(); }, true),
    transportButton('thyR6Pause', '❚❚ Pause', () => engine.pause()),
    transportButton('thyR6Resume', '▶ Resume', () => engine.resume()),
    transportButton('thyR6Stop', '■ Stop', () => engine.stop()),
    transportButton('thyR6Back', '↺ 10s', () => engine.jumpBack()),
    transportButton('thyR6Fwd', '10s ↻', () => engine.jumpForward())
  ]);

  ui.scrub = el('input', {
    type: 'range', min: '0', max: '1000', value: '0', id: 'thyR6Scrub',
    'aria-label': 'Position in the response'
  });
  ui.scrub.addEventListener('input', () => {
    if (!state.response.text) return;
    const char = Math.round((Number(ui.scrub.value) / 1000) * state.response.text.length);
    engine.seekTo(char);
  });
  ui.clock = el('div', { class: 'thy-r6-clock', id: 'thyR6Clock', text: '0:00 / 0:00' });

  ui.speed = el('input', {
    type: 'range', min: String(MIN_RATE), max: String(MAX_RATE), step: '0.05', value: '1',
    id: 'thyR6Speed', 'aria-label': 'Playback speed'
  });
  ui.speedLabel = el('span', { id: 'thyR6SpeedLabel', text: '1.00×' });
  ui.speed.addEventListener('input', () => {
    const rate = engine.setRate(Number(ui.speed.value));
    ui.speedLabel.textContent = `${rate.toFixed(2)}×`;
  });

  ui.readAhead = el('div', { class: 'thy-r6-ahead-box', id: 'thyR6ReadAhead', text: 'Read-ahead appears here once a response is loaded.' });

  ui.holdToggle = el('input', { type: 'checkbox', id: 'thyR6Hold' });
  ui.holdToggle.addEventListener('change', () => {
    engine.holdWhileSpeaking = ui.holdToggle.checked;
    state.say(engine.holdWhileSpeaking
      ? 'Readback will hold its place while you speak a note.'
      : 'Readback will duck and keep running while you speak a note.', '');
  });

  const leftLane = el('section', { class: 'thy-r6-lane', id: 'thyR6Left', 'aria-label': 'Response, readback and read-ahead' }, [
    el('h3', { text: 'Response · readback · read-ahead' }),
    el('span', { class: 'thy-r6-pill', id: 'thyR6ResponsePill', text: 'NOTHING LOADED' }),
    ui.responseBox,
    ui.transport,
    el('div', { class: 'thy-r6-scrub' }, [ui.scrub, ui.clock]),
    el('div', { class: 'thy-r6-speed' }, [el('span', { text: 'Speed' }), ui.speed, ui.speedLabel]),
    ui.status,
    el('label', { style: { display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px', fontSize: '12px', color: '#9fa8b5' } },
      [ui.holdToggle, 'Hold readback position while I speak a note (instead of ducking)']),
    el('div', { style: { marginTop: '12px' } }, [
      el('div', { class: 'thy-r6-sub', text: 'READ-AHEAD — what has not been spoken yet' }),
      ui.readAhead
    ]),
    el('div', { style: { marginTop: '12px' } }, [
      ui.sourceInput,
      el('div', { class: 'thy-r6-row', style: { marginTop: '8px' } }, [
        el('button', { type: 'button', id: 'thyR6Load', class: 'thy-r6-build', style: { width: 'auto', padding: '0 16px', minHeight: '44px' }, onclick: loadFromInput }, ['Load response']),
        el('button', {
          type: 'button', id: 'thyR6Capture', style: { minHeight: '44px', padding: '0 14px', borderRadius: '10px', border: '1px solid #293342', background: '#151e29', color: '#f4efe6', cursor: 'pointer' },
          onclick: captureFromHost
        }, ['Capture from dashboard'])
      ])
    ])
  ]);

  // RIGHT LANE — the live Chairman thought lane
  ui.mic = el('button', {
    type: 'button', class: 'thy-r6-mic', id: 'thyR6Mic', 'aria-pressed': 'false',
    'aria-label': 'Hold to speak a margin note into the response'
  }, ['🎙 HOLD TO SPEAK A NOTE']);

  ui.interim = el('div', { class: 'thy-r6-interim', id: 'thyR6Interim' });
  ui.notesList = el('div', { class: 'thy-r6-notes', id: 'thyR6Notes' });
  ui.custodyLine = el('div', { class: 'thy-r6-custody', id: 'thyR6Custody', text: 'No notes yet.' });

  ui.typed = el('input', { class: 'thy-r6-input', id: 'thyR6Typed', placeholder: 'Type a note at the current readback position' });
  ui.typed.addEventListener('keydown', e => { if (e.key === 'Enter') addTypedNote(); });

  ui.buildBtn = el('button', { type: 'button', class: 'thy-r6-build', id: 'thyR6Build', disabled: 'disabled', onclick: doBuildNextPrompt },
    ['BUILD NEXT PROMPT FROM SELECTED NOTES']);
  ui.nextPrompt = el('textarea', { class: 'thy-r6-next', id: 'thyR6NextPrompt', placeholder: 'The next prompt assembled from the notes you select appears here.' });

  ui.canvasEl = el('canvas', { class: 'thy-r6-canvas', id: 'thyR6Canvas' });
  ui.canvasHint = el('div', { class: 'thy-r6-canvas-hint', id: 'thyR6CanvasHint', text: 'Apple Pencil, stylus, finger or mouse' });
  ui.toolbar = el('div', { class: 'thy-r6-tools', id: 'thyR6Tools' });
  ui.inkStatus = el('div', { class: 'thy-r6-sub', id: 'thyR6InkStatus', text: 'Canvas empty.' });

  const rightLane = el('section', { class: 'thy-r6-lane', id: 'thyR6Right', 'aria-label': 'Live Chairman thought lane' }, [
    el('h3', { text: 'Live Chairman thought lane' }),
    ui.mic,
    ui.interim,
    el('div', { class: 'thy-r6-row', style: { marginTop: '8px' } }, [
      ui.typed,
      el('button', {
        type: 'button', id: 'thyR6AddTyped', style: { minHeight: '44px', padding: '0 14px', borderRadius: '10px', border: '1px solid #293342', background: '#151e29', color: '#f4efe6', cursor: 'pointer' },
        onclick: addTypedNote
      }, ['Add'])
    ]),
    ui.notesList,
    ui.custodyLine,
    ui.buildBtn,
    ui.nextPrompt,
    el('div', { class: 'thy-r6-row', style: { marginTop: '8px' } }, [
      el('button', {
        type: 'button', style: { minHeight: '40px', padding: '0 12px', borderRadius: '9px', border: '1px solid #293342', background: '#151e29', color: '#f4efe6', cursor: 'pointer' },
        id: 'thyR6CopyNext', onclick: () => { navigator.clipboard?.writeText(ui.nextPrompt.value); state.say('Next prompt copied.', 'good'); }
      }, ['Copy next prompt']),
      el('button', {
        type: 'button', style: { minHeight: '40px', padding: '0 12px', borderRadius: '9px', border: '1px solid #293342', background: '#151e29', color: '#f4efe6', cursor: 'pointer' },
        id: 'thyR6NextToLedger', onclick: sendNextPromptToLedger
      }, ['Atomize into coverage ledger'])
    ]),
    el('div', { style: { marginTop: '14px' } }, [
      el('h3', { text: 'Pencil canvas', style: { margin: '0 0 4px' } }),
      ui.toolbar,
      el('div', { class: 'thy-r6-canvas-wrap' }, [ui.canvasEl, ui.canvasHint]),
      ui.inkStatus,
      el('div', { class: 'thy-r6-row', style: { marginTop: '8px' } }, [
        el('input', { type: 'file', accept: 'image/*', id: 'thyR6InkImage', style: { fontSize: '12px', color: '#9fa8b5' }, onchange: e => loadImageInto(canvas, e.target.files?.[0]) }),
        el('button', { type: 'button', class: 'thy-r6-note-acts', style: { minHeight: '38px', padding: '0 12px', borderRadius: '9px', border: '1px solid #293342', background: '#151e29', color: '#f4efe6', cursor: 'pointer' }, id: 'thyR6SaveInk', onclick: saveInkNote }, ['Save canvas as note'])
      ])
    ])
  ]);

  ui.workspaceRoom = el('div', { class: 'thy-r6-room active', id: 'thyR6RoomWorkspace', role: 'tabpanel' }, [
    el('div', { class: 'thy-r6-lanes' }, [leftLane, rightLane])
  ]);

  // ---- room 2: preview room -----------------------------------------------

  ui.stage = el('div', { class: 'thy-r6-stage', id: 'thyR6Stage' }, [
    el('div', { class: 'thy-r6-empty', text: 'Open an image, video or document to preview it.' })
  ]);
  ui.previewCanvasEl = el('canvas', { class: 'thy-r6-canvas', id: 'thyR6PreviewCanvas' });
  ui.previewTools = el('div', { class: 'thy-r6-tools', id: 'thyR6PreviewTools' });
  ui.previewPins = el('div', { class: 'thy-r6-notes', id: 'thyR6PreviewPins' });
  ui.previewStatus = el('div', { class: 'thy-r6-sub', id: 'thyR6PreviewStatus', text: 'Nothing open.' });
  ui.previewUrl = el('input', { class: 'thy-r6-input', id: 'thyR6PreviewUrl', placeholder: 'https://… image, video or document URL' });

  ui.approvalState = el('span', { class: 'thy-r6-pill', id: 'thyR6ApprovalState', text: 'NOT REVIEWED' });

  ui.previewRoom = el('div', { class: 'thy-r6-room', id: 'thyR6RoomPreview', role: 'tabpanel' }, [
    el('div', { class: 'thy-r6-preview-grid' }, [
      el('div', {}, [
        ui.stage,
        el('div', { class: 'thy-r6-row', style: { marginTop: '10px' } }, [
          el('button', { type: 'button', id: 'thyR6Enlarge', style: btn(), onclick: enlarge }, ['⤢ Enlarge']),
          el('button', { type: 'button', id: 'thyR6GrabFrame', style: btn(), onclick: () => grabVideoFrame() }, ['◉ Mark up current frame']),
          el('input', { type: 'file', accept: 'image/*,video/*,.pdf', id: 'thyR6PreviewFile', style: { fontSize: '12px', color: '#9fa8b5' }, onchange: e => openPreviewFile(e.target.files?.[0]) })
        ]),
        el('div', { class: 'thy-r6-row', style: { marginTop: '8px' } }, [ui.previewUrl, el('button', { type: 'button', id: 'thyR6PreviewOpen', style: btn(), onclick: () => openPreviewUrl(ui.previewUrl.value) }, ['Open'])])
      ]),
      el('div', {}, [
        el('div', { class: 'thy-r6-card' }, [
          el('h3', { text: 'Markup' }),
          ui.previewTools,
          el('div', { class: 'thy-r6-canvas-wrap' }, [ui.previewCanvasEl]),
          ui.previewStatus
        ]),
        el('div', { class: 'thy-r6-card' }, [
          el('h3', { text: 'Comments before approval' }),
          ui.previewPins,
          el('div', { class: 'thy-r6-approval' }, [
            ui.approvalState,
            el('button', { type: 'button', id: 'thyR6Approve', class: 'approve', onclick: () => decidePreview('APPROVED') }, ['Approve']),
            el('button', { type: 'button', id: 'thyR6Hold2', class: 'hold', onclick: () => decidePreview('HELD') }, ['Hold — comments first']),
            el('button', { type: 'button', id: 'thyR6Reject', onclick: () => decidePreview('REJECTED') }, ['Reject'])
          ])
        ])
      ])
    ])
  ]);

  // ---- room 3: coverage ledger --------------------------------------------

  ui.promptInput = el('textarea', { class: 'thy-r6-input thy-r6-textarea', id: 'thyR6PromptInput', placeholder: 'Paste a Chairman prompt to atomize it into the coverage ledger.' });
  ui.gateVerdict = el('div', { class: 'thy-r6-gate-verdict fail', id: 'thyR6Gate', text: 'No ledger loaded.' });
  ui.atomList = el('div', { id: 'thyR6Atoms' }, [el('div', { class: 'thy-r6-empty', text: 'No atoms yet.' })]);
  ui.coverageSummary = el('div', { class: 'thy-r6-sub', id: 'thyR6Coverage', text: '' });

  ui.coverageRoom = el('div', { class: 'thy-r6-room', id: 'thyR6RoomCoverage', role: 'tabpanel' }, [
    el('div', { class: 'thy-r6-pad' }, [
      el('div', { class: 'thy-r6-card' }, [
        el('h3', { text: 'Prompt Coverage Ledger' }),
        el('div', { class: 'thy-r6-sub', text: 'Every substantive item in a Chairman prompt becomes an atom. An atom that disappears fails completion — it is not allowed to simply stop existing.' }),
        ui.promptInput,
        el('div', { class: 'thy-r6-row', style: { marginTop: '8px' } }, [
          el('button', { type: 'button', id: 'thyR6Atomize', style: btn(true), onclick: () => atomizeInto(ui.promptInput.value) }, ['Atomize prompt']),
          el('button', { type: 'button', id: 'thyR6LodgeLedger', style: btn(), onclick: lodgeLedger }, ['Lodge to backend']),
          el('button', { type: 'button', id: 'thyR6Continuity', style: btn(), onclick: runContinuityCheck }, ['Run disappearance check'])
        ])
      ]),
      el('div', { class: 'thy-r6-card' }, [ui.gateVerdict, ui.coverageSummary, ui.atomList])
    ])
  ]);

  // ---- room 4: arrival matrix + money-distance ----------------------------

  ui.matrixBox = el('div', { class: 'thy-r6-scroll-x', id: 'thyR6Matrix' }, [el('div', { class: 'thy-r6-empty', text: 'Not loaded.' })]);
  ui.matrixSummary = el('div', { class: 'thy-r6-sub', id: 'thyR6MatrixSummary', text: '' });
  ui.moneyBox = el('div', { id: 'thyR6Money' }, [el('div', { class: 'thy-r6-empty', text: 'Not measured.' })]);
  ui.moneySummary = el('div', { class: 'thy-r6-sub', id: 'thyR6MoneySummary', text: '' });

  ui.arrivalRoom = el('div', { class: 'thy-r6-room', id: 'thyR6RoomArrival', role: 'tabpanel' }, [
    el('div', { class: 'thy-r6-pad' }, [
      el('div', { class: 'thy-r6-card' }, [
        el('h3', { text: 'Global Arrival Matrix' }),
        el('div', { class: 'thy-r6-sub', text: 'Where THYLORA has actually arrived, by territory and lane. A cell claiming arrival without an evidence record is shown as UNPROVEN, not as arrived.' }),
        el('div', { class: 'thy-r6-row', style: { margin: '8px 0' } }, [
          el('button', { type: 'button', id: 'thyR6LoadMatrix', style: btn(true), onclick: loadArrivalMatrix }, ['Load from backend'])
        ]),
        ui.matrixSummary,
        ui.matrixBox
      ]),
      el('div', { class: 'thy-r6-card' }, [
        el('h3', { text: 'Store Money-Distance' }),
        el('div', { class: 'thy-r6-sub', text: 'How many gates still stand between each store and money arriving. A gate closes on an evidence record, never on an assertion.' }),
        el('div', { class: 'thy-r6-row', style: { margin: '8px 0' } }, [
          el('button', { type: 'button', id: 'thyR6MeasureMoney', style: btn(true), onclick: measureMoneyDistance }, ['Measure from backend records'])
        ]),
        ui.moneySummary,
        ui.moneyBox
      ])
    ])
  ]);

  // The Media Router is its own module: it drives the render pipeline that
  // already exists on thylora-dash rather than adding one here.
  const mediaRouter = buildMediaRouterRoom({ custody, onStatus: (m, k) => state.say(m, k) });
  ui.mediaRoom = mediaRouter.node;

  ui.body.append(ui.workspaceRoom, ui.previewRoom, ui.coverageRoom, ui.arrivalRoom, ui.mediaRoom);
  host.append(ui.launch, ui.shell);

  function btn(primary = false) {
    return primary
      ? { minHeight: '44px', padding: '0 16px', borderRadius: '10px', border: '1px solid #d6a348', background: '#d6a348', color: '#10141b', fontWeight: '800', cursor: 'pointer' }
      : { minHeight: '44px', padding: '0 14px', borderRadius: '10px', border: '1px solid #293342', background: '#151e29', color: '#f4efe6', cursor: 'pointer' };
  }

  // ---- canvases ------------------------------------------------------------

  const canvas = new AnnotationCanvas({
    canvas: ui.canvasEl,
    onChange: payload => { ui.inkStatus.textContent = describeInk(payload); },
    onPinRequest: (pin, commit) => promptForPin(pin, commit),
    onStatus: (m, k) => state.say(m, k)
  });

  const previewCanvas = new AnnotationCanvas({
    canvas: ui.previewCanvasEl,
    onChange: () => renderPreviewPins(),
    onPinRequest: (pin, commit) => promptForPin(pin, p => { commit(p); renderPreviewPins(); }),
    onStatus: (m, k) => { ui.previewStatus.textContent = m; }
  });

  buildToolbar(ui.toolbar, canvas);
  buildToolbar(ui.previewTools, previewCanvas);

  function buildToolbar(container, target) {
    const tools = [
      [TOOLS.PEN, '✎ Sketch'], [TOOLS.HANDWRITING, '✍ Write'],
      [TOOLS.ARROW, '↗ Arrow'], [TOOLS.CIRCLE, '◯ Circle'],
      [TOOLS.PIN, '📍 Pin'], [TOOLS.ERASE, '⌫ Erase']
    ];
    const buttons = tools.map(([tool, label]) => el('button', {
      type: 'button', 'aria-pressed': String(tool === TOOLS.PEN), 'data-tool': tool,
      onclick: () => {
        target.setTool(tool);
        buttons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.tool === tool)));
      }
    }, [label]));
    const swatches = INK_COLORS.map((color, i) => el('button', {
      type: 'button', class: 'thy-r6-swatch', 'aria-pressed': String(i === 0),
      'aria-label': `Ink colour ${color}`, style: { background: color },
      onclick: () => {
        target.setColor(color);
        swatches.forEach((s, j) => s.setAttribute('aria-pressed', String(j === i)));
      }
    }));
    container.append(
      ...buttons,
      el('button', { type: 'button', onclick: () => target.undo() }, ['↶ Undo']),
      el('button', { type: 'button', onclick: () => target.redo() }, ['↷ Redo']),
      el('button', { type: 'button', onclick: () => target.clear() }, ['Clear']),
      ...swatches
    );
  }

  function promptForPin(pin, commit) {
    const body = window.prompt('Comment for this pin:', '');
    if (body === null) { commit(null); return; }
    commit({ ...pin, body });
  }

  // ---- microphone ----------------------------------------------------------

  const mic = new NoteMicrophone({
    button: ui.mic,
    engine,
    getResponse: () => state.response,
    onStatus: (m, k) => state.say(m, k),
    onInterim: text => { ui.interim.textContent = text; },
    onNote: (note, { empty }) => {
      if (empty) {
        // Keep the anchor alive so a typed note lands in the same place.
        pendingAnchor = note.anchor;
        ui.typed.placeholder = `Type the note held at ${note.anchor.percent}% of the response`;
        ui.typed.focus();
        return;
      }
      commitNote(note);
    }
  });

  let pendingAnchor = null;

  if (!NoteMicrophone.supported) {
    ui.mic.textContent = '🎙 HOLD TO MARK THE PLACE (no mic API here)';
  }

  // ---- notes ---------------------------------------------------------------

  function commitNote(note) {
    state.notes = attachNote(state.notes, note);
    renderNotes();
    persist();
    lodgeNotes();
  }

  function addTypedNote() {
    const body = ui.typed.value.trim();
    if (!body) return;
    const anchor = pendingAnchor || engine.position();
    const note = createNote({
      responseId: state.response.id,
      responseText: state.response.text,
      char: anchor.char,
      segmentIndex: anchor.segmentIndex ?? anchor.segment_index ?? null,
      percent: anchor.percent,
      elapsedSeconds: anchor.elapsedSeconds ?? null,
      body,
      kind: NOTE_KINDS.TYPED,
      target: { type: 'RESPONSE', ref: state.response.id }
    });
    ui.typed.value = '';
    ui.typed.placeholder = 'Type a note at the current readback position';
    pendingAnchor = null;
    commitNote(note);
    state.say(`Note held at ${note.anchor.percent}% of the response.`, 'good');
  }

  function saveInkNote() {
    if (canvas.isEmpty) { state.say('Canvas is empty — nothing to save.', 'warn'); return; }
    const payload = canvas.payload();
    const anchor = engine.position();
    const note = createNote({
      responseId: state.response.id,
      responseText: state.response.text,
      char: anchor.char,
      segmentIndex: anchor.segmentIndex,
      percent: anchor.percent,
      elapsedSeconds: anchor.elapsedSeconds,
      body: describeInk(payload),
      kind: NOTE_KINDS.INK,
      ink: payload,
      target: { type: payload.background?.kind || 'RESPONSE', ref: payload.background?.ref || state.response.id }
    });
    commitNote(note);
    state.say(`Canvas saved as a note atom: ${note.body}.`, 'good');
  }

  function renderNotes() {
    const list = inResponseOrder(liveNotes(state.notes));
    ui.notesList.replaceChildren();
    if (!list.length) {
      ui.notesList.appendChild(el('div', { class: 'thy-r6-empty', text: 'No notes yet. Hold the microphone during readback.' }));
    }
    for (const note of list) {
      const card = el('div', {
        class: `thy-r6-note${note.selected ? ' selected' : ''}${note.superseded ? ' superseded' : ''}`,
        'data-note': note.note_id
      }, [
        el('div', { class: 'thy-r6-note-top' }, [
          el('span', { class: 'thy-r6-note-at', text: `@ ${note.anchor.percent}% · char ${note.anchor.char}` }),
          el('span', { class: 'thy-r6-note-kind', text: note.kind }),
          el('span', { class: 'thy-r6-note-kind', text: note.custody }),
          note.superseded ? el('span', { class: 'thy-r6-note-kind', text: 'SUPERSEDED' }) : null
        ]),
        el('div', { class: 'thy-r6-note-body', text: note.body || '(ink note)' }),
        note.anchor.preview_after
          ? el('div', { class: 'thy-r6-note-quote', text: `“…${note.anchor.preview_after.trim().slice(0, 110)}”` })
          : null,
        el('div', { class: 'thy-r6-note-acts' }, [
          el('button', {
            type: 'button', class: note.selected ? 'on' : '',
            onclick: () => { state.notes = setSelected(state.notes, note.note_id, !note.selected); renderNotes(); persist(); }
          }, [note.selected ? '✓ Selected' : 'Select']),
          el('button', {
            type: 'button',
            onclick: () => { engine.seekTo(note.anchor.char); state.say(`Jumped to the note at ${note.anchor.percent}%.`, 'good'); }
          }, ['Jump to place'])
        ])
      ]);
      ui.notesList.appendChild(card);
    }
    const report = custodyReport(state.notes);
    ui.custodyLine.textContent = report.total === 0
      ? 'No notes yet.'
      : `${report.total} note atom(s) · ${report.in_custody} in backend custody · ${report.pending} pending · ${report.local_only} on this device only.`;
    ui.buildBtn.disabled = selectedNotes(state.notes).length === 0;
  }

  function doBuildNextPrompt() {
    const built = buildNextPrompt(state.notes, { responseTitle: state.response.title });
    if (built.error) { state.say(built.error, 'warn'); return; }
    ui.nextPrompt.value = built.text;
    state.say(`Next prompt built from ${built.count} note atom(s).`, 'good');
  }

  function sendNextPromptToLedger() {
    const text = ui.nextPrompt.value.trim();
    if (!text) { state.say('Build the next prompt first.', 'warn'); return; }
    atomizeInto(text);
    showRoom('COVERAGE');
  }

  async function lodgeNotes() {
    const result = await custody.lodgeNotes(state.notes);
    if (!result.ids.length) return;
    // Apply the outcome to the lane as it stands now. Notes the Chairman spoke
    // while this request was in flight are untouched and keep their own custody.
    const offered = new Set(result.ids);
    for (const id of offered) state.notes = setCustody(state.notes, id, result.custody);
    renderNotes();
    persist();
  }

  // ---- response loading ----------------------------------------------------

  function loadResponse(text, { id = null, title = 'the response' } = {}) {
    const clean = String(text || '').trim();
    if (!clean) { state.say('Nothing to load.', 'warn'); return false; }
    state.response = { id: id || `THY-RESP-${Date.now()}`, text: clean, title };
    engine.load(clean, { responseId: state.response.id });
    document.getElementById('thyR6ResponsePill').textContent =
      `${clean.length} CHARS · ${engine.segments.length} SEGMENTS`;
    renderResponse(engine.position());
    state.say(engine.available
      ? 'Response loaded. Press Speak to begin readback.'
      : 'Response loaded. This browser exposes no speech synthesis — controls will not produce audio here.', engine.available ? 'good' : 'warn');
    persist();
    return true;
  }

  function loadFromInput() { loadResponse(ui.sourceInput.value, { title: 'the pasted response' }); }

  /**
   * Lift the latest department reply out of the dashboard that is already on the
   * page. Read-only: the host DOM is not modified.
   */
  function captureFromHost() {
    const candidates = [
      ...document.querySelectorAll('#talkHistory .reply'),
      document.getElementById('thySpineResult'),
      document.getElementById('commandResult'),
      document.getElementById('viewerBody')
    ].filter(Boolean);
    const last = candidates.reverse().find(n => (n.innerText || '').trim().length > 40);
    if (!last) { state.say('No department reply found on this page to capture.', 'warn'); return; }
    ui.sourceInput.value = last.innerText.trim();
    loadResponse(last.innerText, { title: 'the latest dashboard reply' });
  }

  /**
   * Repaint the response with what has been spoken, what is being spoken, and
   * what is still ahead. Three slices of the same original string — the response
   * itself is never edited to show this.
   */
  function renderResponse(position) {
    const text = state.response.text;
    if (!text) return;
    const at = position.char;
    const segment = engine.segments[position.segmentIndex];
    const nowEnd = segment ? Math.min(segment.end, text.length) : at;
    ui.responseBox.replaceChildren(
      el('span', { class: 'thy-r6-said', text: text.slice(0, at) }),
      el('span', { class: 'thy-r6-now', text: text.slice(at, nowEnd) }),
      el('span', { class: 'thy-r6-ahead', text: text.slice(nowEnd) })
    );
    ui.readAhead.textContent = text.slice(nowEnd, nowEnd + 600) || 'End of response.';
    if (document.activeElement !== ui.scrub) {
      ui.scrub.value = String(text.length ? Math.round((at / text.length) * 1000) : 0);
    }
    ui.clock.textContent = `${clock(position.elapsedSeconds)} / ${clock(position.totalSeconds)}`;
  }

  engine.on('position', p => renderResponse(p));
  engine.on('state', s => {
    const label = {
      [READBACK_STATES.SPEAKING]: 'Reading back.',
      [READBACK_STATES.PAUSED]: 'Paused — the place is held.',
      [READBACK_STATES.DUCKED]: 'Ducked — the Chairman has the floor.',
      [READBACK_STATES.ENDED]: 'Response finished.',
      [READBACK_STATES.IDLE]: 'Ready.'
    }[s];
    if (label) state.say(label, s === READBACK_STATES.SPEAKING || s === READBACK_STATES.ENDED ? 'good' : '');
  });
  engine.on('error', e => state.say(`Readback error: ${e}`, 'bad'));

  // ---- preview room --------------------------------------------------------

  let previewItem = null;
  let previewDecision = 'NOT REVIEWED';

  function openPreviewFile(file) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const kind = file.type.startsWith('video') ? 'VIDEO' : file.type.startsWith('image') ? 'IMAGE' : 'DOCUMENT';
    showPreview({ url, kind, ref: file.name });
  }

  /**
   * What kind of thing is at this address.
   *
   * A data: URL states its own media type and must be read from the prefix — a
   * base64 image has no ".png" on the end, and treating it as a document would
   * put a picture in an iframe with no markup surface. Ordinary URLs fall back
   * to the extension, and anything unrecognised opens as a document rather than
   * being refused.
   */
  function mediaKind(url) {
    const clean = String(url || '').trim();
    const data = /^data:([a-z]+)\//i.exec(clean);
    if (data) {
      const type = data[1].toLowerCase();
      if (type === 'image') return 'IMAGE';
      if (type === 'video') return 'VIDEO';
      return 'DOCUMENT';
    }
    if (/\.(mp4|webm|mov|m4v|ogv)(\?|#|$)/i.test(clean)) return 'VIDEO';
    if (/\.(png|jpe?g|gif|webp|avif|svg|bmp|heic)(\?|#|$)/i.test(clean)) return 'IMAGE';
    return 'DOCUMENT';
  }

  function openPreviewUrl(url) {
    const clean = String(url || '').trim();
    if (!clean) { ui.previewStatus.textContent = 'Enter a URL first.'; return; }
    showPreview({ url: clean, kind: mediaKind(clean), ref: clean });
  }

  function showPreview({ url, kind, ref }) {
    previewItem = { url, kind, ref };
    previewDecision = 'NOT REVIEWED';
    ui.approvalState.textContent = previewDecision;
    ui.stage.replaceChildren();
    if (kind === 'IMAGE') {
      ui.stage.appendChild(el('img', { src: url, alt: `Preview of ${ref}` }));
      previewCanvas.setBackground({ src: url, kind: 'IMAGE', ref });
    } else if (kind === 'VIDEO') {
      const video = el('video', { src: url, controls: 'controls', playsinline: 'playsinline' });
      ui.stage.appendChild(video);
      previewCanvas.setTarget({ type: 'VIDEO', ref });
      previewCanvas.background = { kind: 'VIDEO', ref, element: video, image: null };
    } else {
      ui.stage.appendChild(el('iframe', { src: url, title: `Document preview of ${ref}` }));
      previewCanvas.setTarget({ type: 'DOCUMENT', ref });
    }
    ui.previewStatus.textContent = `${kind} open: ${shortRef(ref)}. Mark up and comment before approving.`;
  }

  /** A readable label for something whose address is a wall of base64. */
  function shortRef(ref) {
    const text = String(ref || '');
    if (/^data:/i.test(text)) {
      const type = /^data:([^;,]+)/i.exec(text);
      return `embedded ${type ? type[1] : 'data'} (${Math.round(text.length / 1024)} KB)`;
    }
    return text.length > 80 ? `${text.slice(0, 77)}…` : text;
  }

  function enlarge() {
    if (!previewItem) { ui.previewStatus.textContent = 'Nothing open to enlarge.'; return; }
    ui.stage.classList.toggle('enlarged');
    if (ui.stage.classList.contains('enlarged')) {
      const exit = el('button', {
        type: 'button', id: 'thyR6Shrink',
        style: { position: 'fixed', top: '16px', right: '16px', zIndex: '95', ...btn() },
        onclick: enlarge
      }, ['Close']);
      ui.stage.appendChild(exit);
    } else {
      document.getElementById('thyR6Shrink')?.remove();
    }
  }

  function grabVideoFrame() {
    const video = ui.stage.querySelector('video');
    if (!video) { ui.previewStatus.textContent = 'Open a video first.'; return; }
    previewCanvas.captureVideoFrame(video, previewItem?.ref);
    ui.previewStatus.textContent = `Frame at ${video.currentTime.toFixed(2)}s captured for markup.`;
  }

  function renderPreviewPins() {
    const pins = previewCanvas.pins;
    ui.previewPins.replaceChildren();
    if (!pins.length) {
      ui.previewPins.appendChild(el('div', { class: 'thy-r6-empty', text: 'No comment pins yet. Choose Pin and tap the markup canvas.' }));
      return;
    }
    pins.forEach((pin, i) => {
      ui.previewPins.appendChild(el('div', { class: 'thy-r6-note' }, [
        el('div', { class: 'thy-r6-note-top' }, [
          el('span', { class: 'thy-r6-note-at', text: `Pin ${i + 1}` }),
          el('span', { class: 'thy-r6-note-kind', text: pin.target?.type === 'VIDEO' ? `at ${pin.target.t ?? 0}s` : `x ${pin.x} · y ${pin.y}` })
        ]),
        el('div', { class: 'thy-r6-note-body', text: pin.body || '(no comment)' })
      ]));
    });
  }

  function decidePreview(decision) {
    if (!previewItem) { ui.previewStatus.textContent = 'Nothing open to decide on.'; return; }
    const pins = previewCanvas.pins;
    if (decision === 'APPROVED' && pins.some(p => !p.body)) {
      ui.previewStatus.textContent = 'A pin has no comment. Approval is refused while a comment is empty.';
      return;
    }
    previewDecision = decision;
    ui.approvalState.textContent = decision;
    // The decision is preserved as a note atom, so it travels with everything else.
    const payload = previewCanvas.payload();
    commitNote(createNote({
      responseId: state.response.id,
      responseText: state.response.text,
      char: engine.position().char,
      percent: engine.position().percent,
      body: `Preview ${decision}: ${shortRef(previewItem.ref)} (${describeInk(payload)})`,
      kind: NOTE_KINDS.PIN,
      ink: payload,
      target: { type: previewItem.kind, ref: previewItem.ref }
    }));
    ui.previewStatus.textContent = `${shortRef(previewItem.ref)} marked ${decision}. Recorded as a note atom.`;
  }

  // ---- coverage ledger -----------------------------------------------------

  function atomizeInto(text) {
    const clean = String(text || '').trim();
    if (!clean) { state.say('Paste a prompt to atomize.', 'warn'); return; }
    const ledger = atomizePrompt(clean, { promptId: `THY-PROMPT-${Date.now()}` });
    if (state.ledger) {
      // A new atomization never overwrites the old baseline; the baseline is
      // what later disappearance checks compare against.
      state.ledgerBaseline = state.ledgerBaseline || state.ledger;
    } else {
      state.ledgerBaseline = ledger;
    }
    state.ledger = ledger;
    renderLedger();
    persist();
  }

  function renderLedger() {
    const ledger = state.ledger;
    ui.atomList.replaceChildren();
    if (!ledger?.atoms?.length) {
      ui.atomList.appendChild(el('div', { class: 'thy-r6-empty', text: 'No atoms yet.' }));
      ui.gateVerdict.className = 'thy-r6-gate-verdict fail';
      ui.gateVerdict.textContent = 'No ledger loaded.';
      ui.coverageSummary.textContent = '';
      return;
    }
    for (const atom of ledger.atoms) {
      const select = el('select', { 'aria-label': `Resolution for atom ${atom.ordinal}` },
        [ATOM_STATES.UNKNOWN, ...RESOLVED_STATES].map(s =>
          el('option', { value: s, ...(s === atom.state ? { selected: 'selected' } : {}) }, [s])));
      const reason = el('textarea', {
        class: 'thy-r6-atom-reason', placeholder: 'Reason required for DEFERRED_WITH_REASON',
        style: { display: atom.state === ATOM_STATES.DEFERRED_WITH_REASON ? 'block' : 'none' }
      });
      reason.value = atom.reason || '';
      const apply = () => {
        const next = select.value;
        reason.style.display = next === ATOM_STATES.DEFERRED_WITH_REASON ? 'block' : 'none';
        try {
          state.ledger = resolveAtom(state.ledger, atom.atom_id, next, { reason: reason.value });
          renderLedger();
          persist();
        } catch (err) {
          state.say(err.message, 'bad');
          ui.gateVerdict.className = 'thy-r6-gate-verdict fail';
          ui.gateVerdict.textContent = err.message;
        }
      };
      select.addEventListener('change', () => {
        if (select.value === ATOM_STATES.DEFERRED_WITH_REASON && !reason.value.trim()) {
          reason.style.display = 'block';
          reason.focus();
          ui.gateVerdict.className = 'thy-r6-gate-verdict fail';
          ui.gateVerdict.textContent = 'DEFERRED_WITH_REASON requires a stated reason before it will be accepted.';
          return;
        }
        apply();
      });
      reason.addEventListener('blur', () => { if (select.value === ATOM_STATES.DEFERRED_WITH_REASON && reason.value.trim()) apply(); });

      ui.atomList.appendChild(el('div', { class: 'thy-r6-atom' }, [
        el('div', { class: 'thy-r6-atom-ord', text: String(atom.ordinal) }),
        el('div', { class: 'thy-r6-atom-text' }, [
          el('div', { text: atom.text }),
          el('div', { class: `thy-r6-atom-state ${atom.state}`, text: `${atom.section ? atom.section + ' · ' : ''}${atom.state}` }),
          reason
        ]),
        select
      ]));
    }
    const gate = completionGate(ledger, { previous: state.ledgerBaseline });
    ui.gateVerdict.className = `thy-r6-gate-verdict ${gate.complete ? 'pass' : 'fail'}`;
    ui.gateVerdict.textContent = gate.statement;
    const cov = gate.coverage;
    ui.coverageSummary.textContent =
      `${cov.resolved}/${cov.total} resolved (${cov.percent}%) · answered ${cov.answered} · executed ${cov.executed} · registered ${cov.registered} · deferred ${cov.deferred} · unknown ${cov.unknown}`;
  }

  function runContinuityCheck() {
    if (!state.ledger || !state.ledgerBaseline) { state.say('Atomize a prompt first.', 'warn'); return; }
    const result = verifyContinuity(state.ledgerBaseline, state.ledger);
    ui.gateVerdict.className = `thy-r6-gate-verdict ${result.ok ? 'pass' : 'fail'}`;
    ui.gateVerdict.textContent = result.ok
      ? `No atom has disappeared. ${state.ledger.atoms.length} atom(s) still accounted for.`
      : `COMPLETION FAILED — ${result.missing.length} atom(s) disappeared: ${result.missing.map(m => `#${m.ordinal} ${m.text.slice(0, 40)}`).join(' | ')}`;
  }

  async function lodgeLedger() {
    if (!state.ledger) { state.say('Atomize a prompt first.', 'warn'); return; }
    const result = await custody.lodgeLedger(state.ledger);
    state.say(result.ok ? 'Coverage ledger lodged into thylora-dash.' : custody.explain(result.reason, 'Ledger held on this device'), result.ok ? 'good' : 'warn');
  }

  // ---- arrival matrix + money-distance -------------------------------------

  async function fetchTable(name, query = 'select=*&limit=200') {
    const token = custody.token();
    if (!token) return { ok: false, reason: 'NOT_SIGNED_IN', rows: [] };
    try {
      const response = await fetch(`${custody.url}/rest/v1/${name}?${query}`, {
        headers: { apikey: custody.key, Authorization: `Bearer ${token}` }
      });
      if (!response.ok) return { ok: false, reason: `HTTP_${response.status}`, rows: [] };
      return { ok: true, rows: await response.json() };
    } catch (err) {
      return { ok: false, reason: 'NETWORK', rows: [] };
    }
  }

  async function loadArrivalMatrix() {
    ui.matrixSummary.textContent = 'Loading…';
    let result = await fetchTable('thylora_arrival_matrix');
    if (!result.ok) result = await fetchTable('thylora_territories');
    const rows = result.rows || [];
    const territories = rows.map(r => ({
      code: r.territory_code || r.code || r.iso2 || r.id,
      name: r.territory || r.name || r.country || r.territory_code,
      region: r.region || null,
      lanes: r.lanes || laneFromFlatRow(r)
    }));
    const matrix = buildMatrix(territories);
    renderMatrix(matrix);
    const gap = proofGap(matrix);
    ui.matrixSummary.textContent = territories.length
      ? `${matrix.summary.statement} ${gap.statement}`
      : `No arrival records returned (${result.reason || 'empty table'}). ${summarise([]).statement}`;
  }

  /** Accept a flat backend row shape as well as a nested one. */
  function laneFromFlatRow(row) {
    const lanes = {};
    for (const lane of ARRIVAL_LANES) {
      const stateValue = row[`${lane.code.toLowerCase()}_state`] || row[lane.code] || null;
      if (stateValue) {
        lanes[lane.code] = {
          state: String(stateValue).toUpperCase(),
          evidence_id: row[`${lane.code.toLowerCase()}_evidence`] || null,
          reason: row[`${lane.code.toLowerCase()}_reason`] || null
        };
      }
    }
    return lanes;
  }

  function renderMatrix(matrix) {
    ui.matrixBox.replaceChildren();
    if (!matrix.rows.length) {
      ui.matrixBox.appendChild(el('div', { class: 'thy-r6-empty', text: 'No territory rows to display. The matrix will not invent arrival.' }));
      return;
    }
    const head = el('tr', {}, [el('th', { text: 'Territory' }), ...matrix.lanes.map(l => el('th', { text: l.label }))]);
    const body = matrix.rows.map(row => el('tr', {}, [
      el('td', {}, [el('b', { text: row.territory }), row.region ? el('div', { class: 'thy-r6-sub', text: row.region }) : null]),
      ...row.cells.map(cell => el('td', {}, [
        el('div', { class: `thy-r6-cell ${cell.state}`, text: cell.state }),
        cell.evidence_id ? el('div', { class: 'thy-r6-sub', text: String(cell.evidence_id).slice(0, 18) }) : null,
        cell.reason ? el('div', { class: 'thy-r6-sub', text: cell.reason }) : null
      ]))
    ]));
    ui.matrixBox.appendChild(el('table', { class: 'thy-r6-matrix' }, [el('thead', {}, [head]), el('tbody', {}, body)]));
  }

  async function measureMoneyDistance() {
    ui.moneySummary.textContent = 'Measuring…';
    const [products, orders, payments, passports] = await Promise.all([
      fetchTable('products'), fetchTable('orders'), fetchTable('payments'), fetchTable('digital_product_passports')
    ]);
    if (!products.ok && !orders.ok && !payments.ok) {
      ui.moneySummary.textContent = `Backend records were not readable (${products.reason}). Money-distance is not measured from assumptions — sign in and retry.`;
      ui.moneyBox.replaceChildren(el('div', { class: 'thy-r6-empty', text: 'Nothing measured.' }));
      return;
    }
    const readings = readingsFromRows({
      products: products.rows, orders: orders.rows, payments: payments.rows, passports: passports.rows,
      storefront: null, providers: []
    });
    const store = measureStore({ store_code: 'THYLORA_STORE', label: 'THYLORA Store', readings });
    const portfolio = portfolioDistance([store]);
    ui.moneySummary.textContent = `${store.statement} ${portfolio.statement}`;
    ui.moneyBox.replaceChildren(
      el('div', { class: 'thy-r6-sub', style: { marginBottom: '8px' }, text: `Distance ${store.distance} of ${MONEY_GATES.length} gates.` }),
      ...store.gates.map(gate => el('div', { class: 'thy-r6-gate-line' }, [
        el('span', { class: `thy-r6-dot${gate.closed ? ' on' : gate.state === GATE_STATES.CLAIMED ? ' claimed' : gate.state === GATE_STATES.BLOCKED ? ' blocked' : ''}` }),
        el('span', { style: { flex: '1 1 auto' }, text: gate.label }),
        el('span', { class: 'thy-r6-sub', text: gate.closed ? `evidenced · ${String(gate.evidence_id).slice(0, 16)}` : gate.state })
      ]))
    );
  }

  // ---- persistence ---------------------------------------------------------

  function persist() {
    custody.saveDevice({
      release: RELEASE,
      response: state.response,
      notes: state.notes,
      ledger: state.ledger,
      ledgerBaseline: state.ledgerBaseline,
      saved_at: new Date().toISOString()
    });
  }

  function restore() {
    const saved = custody.loadDevice();
    if (!saved) return;
    if (saved.response?.text) {
      ui.sourceInput.value = saved.response.text;
      loadResponse(saved.response.text, { id: saved.response.id, title: saved.response.title });
    }
    if (Array.isArray(saved.notes)) { state.notes = Object.freeze(saved.notes); renderNotes(); }
    if (saved.ledger) { state.ledger = reviveLedger(saved.ledger); state.ledgerBaseline = reviveLedger(saved.ledgerBaseline) || state.ledger; renderLedger(); }
    state.say('Previous workspace restored from this device.', '');
  }

  // ---- rooms ---------------------------------------------------------------

  function showRoom(code) {
    state.room = code;
    const map = { WORKSPACE: ui.workspaceRoom, PREVIEW: ui.previewRoom, COVERAGE: ui.coverageRoom, ARRIVAL: ui.arrivalRoom, MEDIA: ui.mediaRoom };
    for (const [key, node] of Object.entries(map)) node.classList.toggle('active', key === code);
    ui.rooms.querySelectorAll('button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.room === code)));
    // Canvases sized while hidden measure zero; re-measure on reveal.
    requestAnimationFrame(() => { canvas.resize(); previewCanvas.resize(); });
  }

  function open() {
    ui.shell.classList.add('open');
    ui.launch.style.display = 'none';
    requestAnimationFrame(() => { canvas.resize(); previewCanvas.resize(); });
  }

  function close() {
    engine.pause();
    ui.shell.classList.remove('open');
    ui.launch.style.display = '';
  }

  ui.launch.addEventListener('click', open);

  renderNotes();
  renderLedger();
  renderPreviewPins();
  restore();
  if (options.autoOpen) open();

  return {
    open, close, showRoom, loadResponse, engine, canvas, previewCanvas, mic, custody, mediaRouter,
    get notes() { return state.notes; },
    get ledger() { return state.ledger; },
    buildNextPrompt: doBuildNextPrompt,
    atomize: atomizeInto,
    release: RELEASE
  };
}

// Auto-mount when dropped into a page with a plain script tag.
if (typeof window !== 'undefined' && !window.__THY_R6_MOUNTED__) {
  window.__THY_R6_MOUNTED__ = true;
  const boot = () => { window.thyR6 = mountChairmanWorkspace({ autoOpen: false }); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
}
