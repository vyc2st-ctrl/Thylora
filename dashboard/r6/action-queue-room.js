// THYLORA CHAIRMAN ACTION QUEUE · dashboard room
// Authoritative backend: thylora-dash (jvsdxhrfhtlgaknhjxlz)
//
// The Chairman's instruction, in his words: the dashboard must move to
// completion without him, all the way to where it needs him, and then he is
// alerted, and a prompt is presented with as few gaps as possible, where he can
// click on what he needs to activate.
//
// This room is that prompt. Two panels:
//
//   WHERE'S THE MONEY   derived from thylora_money_truth_v1()
//   WHAT NEEDS YOU      derived from thylora_chairman_action_queue_v1()
//
// Both are BACKEND FUNCTIONS, not tables. Nothing in this room stores a second
// copy of the truth, so nothing in this room can drift from the backend. It
// creates no table and writes nothing on its own.
//
// One rule governs every button here: CLICKING DOES NOT CLOSE A GATE.
// The Chairman can open the place where the work happens, and he can ask the
// room to re-read the backend. A row only leaves this queue when the backend
// holds the evidence that closes it. There is no "mark as done".

const el = (tag, props = {}, kids = []) => {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else if (k === 'style') Object.assign(node.style, v);
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else if (v !== null && v !== undefined) node.setAttribute(k, v);
  }
  for (const kid of [].concat(kids)) {
    if (kid == null) continue;
    node.appendChild(typeof kid === 'string' ? document.createTextNode(kid) : kid);
  }
  return node;
};

const btn = (primary = false) => primary
  ? { minHeight: '44px', padding: '0 16px', borderRadius: '10px', border: '1px solid #d6a348', background: '#d6a348', color: '#10141b', fontWeight: '800', cursor: 'pointer' }
  : { minHeight: '44px', padding: '0 14px', borderRadius: '10px', border: '1px solid #293342', background: '#151e29', color: '#f4efe6', cursor: 'pointer' };

const money = v =>
  v === null || v === undefined ? '—' : `$${Number(v).toFixed(2)}`;

export const QUEUE_FN   = 'thylora_chairman_action_queue_v1';
export const WITHHELD_FN = 'thylora_chairman_action_queue_withheld_v1';
export const MONEY_FN   = 'thylora_money_truth_v1';

export function buildActionQueueRoom({ custody, onStatus = () => {} } = {}) {
  const say = (m, k) => onStatus(m, k);

  const state = {
    queue: [],
    withheld: [],
    money: [],
    lastRead: null,
    reachable: null,
    reason: null
  };

  const ui = {};

  // Explicit id: the status line is the one place this room states whether the
  // backend read succeeded, so it must be addressable and never confused with
  // the surrounding prose.
  ui.status = el('p', {
    class: 'thy-r6-sub', id: 'thyR6QueueStatus',
    text: 'Not read yet. Press "Re-read the backend" to pull the live queue.'
  });

  ui.moneyBox = el('div', { class: 'thy-r6-stack' });
  ui.queueBox = el('div', { class: 'thy-r6-stack' });
  ui.withheldBox = el('div', { class: 'thy-r6-stack' });

  ui.refresh = el('button', {
    type: 'button', id: 'thyR6QueueRefresh', style: btn(true),
    text: 'Re-read the backend'
  });
  ui.refresh.addEventListener('click', () => { read().catch(() => {}); });

  const node = el('div', {
    class: 'thy-r6-room', id: 'thyR6RoomActionQueue', role: 'tabpanel'
  }, [
    el('div', { class: 'thy-r6-panel' }, [
      el('h3', { text: 'What needs the Chairman' }),
      el('p', {
        class: 'thy-r6-sub',
        text: 'Everything THYLORA can do without you is already done or already moving. '
            + 'These are the points where the work stops until you act. Each row says what to do, '
            + 'where to click, whether money is involved, and what evidence closes it.'
      }),
      el('div', { class: 'thy-r6-row' }, [ui.refresh]),
      ui.status
    ]),

    el('div', { class: 'thy-r6-panel' }, [
      el('h3', { text: "Where's the money" }),
      el('p', {
        class: 'thy-r6-sub',
        text: 'Computed live from the payment witness, the orders table, the revenue paths, '
            + 'the cost registry and the render pipeline. A lane marked NOT ON DASHBOARD is money '
            + 'that is real in the backend but that no dashboard room currently renders.'
      }),
      ui.moneyBox
    ]),

    el('div', { class: 'thy-r6-panel' }, [
      el('h3', { text: 'Action queue' }),
      ui.queueBox
    ]),

    el('div', { class: 'thy-r6-panel' }, [
      el('h3', { text: 'Withheld, with reason' }),
      el('p', {
        class: 'thy-r6-sub',
        text: 'Gates that are real but that you cannot close yet, because something upstream has '
            + 'to happen first. They are shown rather than hidden, so none of them disappears quietly.'
      }),
      ui.withheldBox
    ])
  ]);

  // ---- rendering -----------------------------------------------------------

  function renderMoney() {
    if (!state.money.length) {
      ui.moneyBox.replaceChildren(el('p', { class: 'thy-r6-sub', text: 'No money reading held.' }));
      return;
    }
    ui.moneyBox.replaceChildren(...state.money.map(row => {
      const arrow = row.direction === 'IN' ? '▲ IN' : row.direction === 'OUT' ? '▼ OUT' : '• —';
      return el('div', { class: 'thy-r6-card' }, [
        el('div', { class: 'thy-r6-row' }, [
          el('strong', { style: { flex: '1 1 auto' }, text: row.lane }),
          el('span', { class: 'thy-r6-sub', text: arrow }),
          el('span', {
            style: { fontWeight: '800', minWidth: '84px', textAlign: 'right' },
            text: money(row.amount_usd)
          })
        ]),
        el('p', { class: 'thy-r6-sub', text: row.headline }),
        el('p', {
          class: 'thy-r6-sub',
          style: { color: row.visible_on_dashboard ? '#9fb0c4' : '#e0a0a0' },
          text: row.visible_on_dashboard
            ? 'Visible on the dashboard.'
            : 'NOT ON DASHBOARD — this number is in the backend and no room renders it.'
        }),
        el('p', { class: 'thy-r6-sub', text: `GAP · ${row.gap}` }),
        el('p', { class: 'thy-r6-sub', text: `evidence · ${row.evidence}` })
      ]);
    }));
  }

  function renderQueue() {
    if (!state.queue.length) {
      ui.queueBox.replaceChildren(el('p', {
        class: 'thy-r6-sub',
        text: state.lastRead
          ? 'Nothing is waiting on the Chairman. Every gate THYLORA can close by itself is closed.'
          : 'Not read yet.'
      }));
      return;
    }

    ui.queueBox.replaceChildren(...state.queue.map(row => {
      const steps = Array.isArray(row.steps) ? row.steps : [];

      const open = el('button', {
        type: 'button', style: btn(true),
        text: row.click_here ? 'Open and activate' : 'No link recorded'
      });
      if (row.click_here) {
        open.addEventListener('click', () => {
          window.open(row.click_here, '_blank', 'noopener,noreferrer');
          say(`Opened ${row.action_code}. This queue will not mark it done — `
            + 'it closes when the backend holds the evidence.', 'warn');
        });
      } else {
        open.disabled = true;
        Object.assign(open.style, btn(false), { opacity: '0.55', cursor: 'not-allowed' });
      }

      return el('div', { class: 'thy-r6-card' }, [
        el('div', { class: 'thy-r6-row' }, [
          el('span', {
            style: {
              fontWeight: '900', minWidth: '34px', height: '34px', borderRadius: '8px',
              background: '#d6a348', color: '#10141b', display: 'inline-flex',
              alignItems: 'center', justifyContent: 'center'
            },
            text: String(row.rank)
          }),
          el('strong', { style: { flex: '1 1 auto' }, text: row.title }),
          el('span', { class: 'thy-r6-sub', text: row.lane })
        ]),

        el('p', { text: row.what_to_do }),

        el('div', { class: 'thy-r6-row' }, [
          el('span', {
            class: 'thy-r6-sub',
            style: { color: row.money_required ? '#e0a0a0' : '#9fd4a0' },
            text: row.money_required
              ? `MONEY REQUIRED · ${row.spend_on_this_step}`
              : `NO MONEY · ${row.spend_on_this_step}`
          }),
          row.card_state === 'NO_CARD_YET'
            ? el('span', { class: 'thy-r6-sub', style: { color: '#e0c48a' }, text: 'NO CARD YET — surfaced from live state' })
            : null
        ]),

        steps.length
          ? el('ol', { class: 'thy-r6-sub' }, steps.map(s => el('li', { text: String(s) })))
          : null,

        row.why_it_needs_you
          ? el('p', { class: 'thy-r6-sub', text: `WHY YOU · ${row.why_it_needs_you}` })
          : null,
        el('p', { class: 'thy-r6-sub', text: `DONE WHEN · ${row.done_when}` }),
        row.unblocks
          ? el('p', { class: 'thy-r6-sub', text: `UNBLOCKS · ${row.unblocks}` })
          : null,

        el('div', { class: 'thy-r6-row' }, [
          open,
          el('span', { class: 'thy-r6-sub', text: row.action_code })
        ])
      ]);
    }));
  }

  function renderWithheld() {
    if (!state.withheld.length) {
      ui.withheldBox.replaceChildren(el('p', { class: 'thy-r6-sub', text: 'Nothing withheld.' }));
      return;
    }
    ui.withheldBox.replaceChildren(...state.withheld.map(row => el('div', { class: 'thy-r6-card' }, [
      el('strong', { text: row.title }),
      el('p', { class: 'thy-r6-sub', text: row.withheld_reason }),
      el('p', { class: 'thy-r6-sub', text: `RELEASED · ${row.released_when}` })
    ])));
  }

  // ---- backend read --------------------------------------------------------

  async function read() {
    if (!custody) {
      ui.status.textContent = 'No backend custody available in this page.';
      return state;
    }
    ui.status.textContent = 'Reading the authoritative backend…';

    const [queue, withheld, moneyRows] = await Promise.all([
      custody.rpc(QUEUE_FN),
      custody.rpc(WITHHELD_FN),
      custody.rpc(MONEY_FN)
    ]);

    state.reachable = queue.ok;
    state.reason = queue.ok ? null : queue.reason;

    if (!queue.ok) {
      // Honest about which failure this is. A Chairman who is not signed in is
      // told that, not shown an empty queue that looks like "nothing to do".
      const msg = queue.reason === 'NOT_SIGNED_IN'
        ? 'NOT SIGNED IN. The action queue is a signed-in read — sign in as Chairman and press re-read. '
          + 'An empty queue here would be a lie, so nothing is shown.'
        : queue.reason === 'FUNCTION_NOT_PRESENT'
          ? `The backend function ${QUEUE_FN}() is not present on this project. `
            + 'The queue cannot be derived until it is applied.'
          : `Backend refused the read · ${queue.reason}${queue.detail ? ` · ${queue.detail}` : ''}`;
      ui.status.textContent = msg;
      say(msg, 'bad');
      state.queue = []; state.withheld = []; state.money = [];
      renderQueue(); renderWithheld(); renderMoney();
      return state;
    }

    state.queue    = queue.rows || [];
    state.withheld = withheld.ok ? (withheld.rows || []) : [];
    state.money    = moneyRows.ok ? (moneyRows.rows || []) : [];
    state.lastRead = new Date().toISOString();

    renderQueue(); renderWithheld(); renderMoney();

    const needsMoney = state.queue.filter(r => r.money_required).length;
    const invisible  = state.money.filter(r => !r.visible_on_dashboard).length;
    const msg = `${state.queue.length} item(s) waiting on the Chairman`
      + (needsMoney ? `, ${needsMoney} needing money` : ', none needing money')
      + `. ${invisible} money lane(s) not rendered anywhere on the dashboard.`;
    ui.status.textContent = msg;
    say(msg, state.queue.length ? 'warn' : 'good');
    return state;
  }

  renderQueue(); renderWithheld(); renderMoney();

  return {
    node,
    read,
    refresh: read,
    get state() { return state; }
  };
}
