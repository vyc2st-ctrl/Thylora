// QYRIS QUICKCHECK · sheet behaviour
// Product: THY-QYRIS-QUICKCHECK-001 · Workroom: WR-STORE-QYRIS-581
//
// Deliberately a CLASSIC script, not a module. The product is delivered as a
// file people open by double-clicking it, and a module script is blocked by the
// browser when a page is opened from disk. Nothing here calls the network.
// Answers are held in this browser only, and every read and write of storage is
// guarded — a private window, blocked site data or a print preview must still
// render a usable sheet.
//
// The rule table below is the shipped twin of store/qyris-quickcheck/lib/readout.js.
// tests/quickcheck.test.mjs runs all 48 input combinations through BOTH and
// asserts they agree, so the two cannot drift apart unnoticed.

(function () {
  'use strict';

  var VERDICTS = {
    PROCEED: { label: 'Proceed',
      meaning: 'The chain holds on evidence you can point at, and you can undo or survive being wrong.' },
    PROCEED_WITH_SAFEGUARD: { label: 'Proceed with safeguard',
      meaning: 'Go ahead, but the stop rule goes in writing before you commit, not after.' },
    HOLD_FOR_ONE_MORE_FACT: { label: 'Hold for one more fact',
      meaning: 'Name the one fact, name where you get it, name by when. Then run the check again.' },
    DECLINE: { label: 'Decline',
      meaning: 'You cannot absorb being wrong and you cannot undo it. That is not a risk, it is an exposure.' }
  };

  var RULES = [
    { id: 'R1', verdict: 'DECLINE',
      because: 'Two failures that are survivable apart are not survivable together.',
      test: function (i) { return i.can_absorb === false && i.reversal_cost === 'HIGH'; } },
    { id: 'R2', verdict: 'HOLD_FOR_ONE_MORE_FACT',
      because: 'Hope is not an evidence class. One fact usually moves it, and one fact is cheap.',
      test: function (i) { return i.weakest_link === 'HOPED'; } },
    { id: 'R3', verdict: 'HOLD_FOR_ONE_MORE_FACT',
      because: 'Shrink it until you can absorb it. The smaller version is a different decision — run it again.',
      test: function (i) { return i.can_absorb === false; } },
    { id: 'R4', verdict: 'PROCEED_WITH_SAFEGUARD',
      because: 'Either one is survivable with a stop rule. Neither is survivable without one.',
      test: function (i) { return i.reversal_cost === 'HIGH' || i.weakest_link === 'ASSUMED'; } },
    { id: 'R5', verdict: 'PROCEED',
      because: 'The chain holds on evidence you can point at, and being wrong is affordable.',
      test: function () { return true; } }
  ];

  function readout(input) {
    var rule = null;
    for (var n = 0; n < RULES.length; n++) { if (RULES[n].test(input)) { rule = RULES[n]; break; } }
    var verdict = VERDICTS[rule.verdict];
    var required = [];

    if (rule.verdict === 'PROCEED_WITH_SAFEGUARD' && input.stop_rule === false) {
      required.push({ code: 'STOP_RULE_REQUIRED',
        action: 'Write the stop rule before you commit: the observation that makes you stop, and what you do instead.' });
    }
    if (rule.verdict === 'HOLD_FOR_ONE_MORE_FACT') {
      required.push({ code: 'NAME_THE_FACT',
        action: 'Write the one fact, where you get it, and by when. Then run the check again.' });
    }
    if (rule.verdict === 'PROCEED' && input.reversal_cost === 'MEDIUM' && input.stop_rule === false) {
      required.push({ code: 'STOP_RULE_ADVISED',
        action: 'Undoing this costs something. A one-line stop rule is cheap insurance.' });
    }

    return {
      verdict: rule.verdict, label: verdict.label, meaning: verdict.meaning,
      rule_fired: rule.id, rule_because: rule.because,
      required_before_committing: required
    };
  }

  // Exposed so the test suite can prove the shipped sheet and the canonical
  // table agree. Nothing in the page depends on this being reachable.
  if (typeof globalThis !== 'undefined') globalThis.QYRIS_QUICKCHECK = { readout: readout, RULES: RULES };

  if (typeof document === 'undefined') return;

  var STORE_KEY = 'thy_qyris_quickcheck_001';
  var PICK_GROUPS = ['weakest_link', 'reversal_cost', 'can_absorb', 'stop_rule'];
  var state = { picks: {}, text: {} };

  function load() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (!raw) return;
      var saved = JSON.parse(raw);
      if (saved && saved.picks) Object.keys(saved.picks).forEach(function (k) { state.picks[k] = saved.picks[k]; });
      if (saved && saved.text) Object.keys(saved.text).forEach(function (k) { state.text[k] = saved.text[k]; });
    } catch (e) { /* unreadable storage is not an error the reader should ever see */ }
  }

  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* nothing to do */ }
  }

  function coerce(group, value) {
    return (group === 'can_absorb' || group === 'stop_rule') ? value === 'true' : value;
  }

  function paintPicks() {
    var rows = document.querySelectorAll('.pickrow[data-group]');
    Array.prototype.forEach.call(rows, function (row) {
      var group = row.getAttribute('data-group');
      Array.prototype.forEach.call(row.querySelectorAll('.pick'), function (button) {
        var chosen = state.picks[group] !== undefined
          && String(state.picks[group]) === button.getAttribute('data-value');
        button.setAttribute('aria-pressed', chosen ? 'true' : 'false');
      });
    });
  }

  function paintText() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-key]'), function (field) {
      var saved = state.text[field.getAttribute('data-key')];
      if (saved !== undefined && field.value === '') field.value = saved;
    });
  }

  function paintReadout() {
    var label = document.getElementById('verdictLabel');
    if (!label) return;
    var ruleEl = document.getElementById('verdictRule');
    var meaning = document.getElementById('verdictMeaning');
    var required = document.getElementById('verdictRequired');

    var missing = PICK_GROUPS.filter(function (g) { return state.picks[g] === undefined; });
    if (missing.length) {
      label.textContent = 'Readout';
      ruleEl.textContent = missing.length === 4 ? 'Answer the four marked choices' : missing.length + ' of 4 choices left';
      meaning.textContent = 'The verdict comes from four answers: the rung, the reversal cost, whether you can absorb the bad case, and whether a stop rule is written.';
      required.textContent = '';
      return;
    }

    var result = readout({
      weakest_link: state.picks.weakest_link,
      reversal_cost: state.picks.reversal_cost,
      can_absorb: state.picks.can_absorb,
      stop_rule: state.picks.stop_rule
    });

    label.textContent = result.label;
    ruleEl.textContent = 'Rule ' + result.rule_fired + ' fired';
    meaning.textContent = result.meaning + ' — ' + result.rule_because;
    required.textContent = result.required_before_committing.map(function (r) { return r.action; }).join(' ');
  }

  function paint() { paintPicks(); paintText(); paintReadout(); }

  document.addEventListener('click', function (event) {
    var button = event.target.closest ? event.target.closest('.pick') : null;
    if (!button) return;
    var row = button.closest('.pickrow');
    var group = row && row.getAttribute('data-group');
    if (!group) return;
    if (String(state.picks[group]) === button.getAttribute('data-value')) delete state.picks[group];
    else state.picks[group] = coerce(group, button.getAttribute('data-value'));
    save();
    paint();
  });

  document.addEventListener('input', function (event) {
    var field = event.target.closest ? event.target.closest('[data-key]') : null;
    if (!field) return;
    state.text[field.getAttribute('data-key')] = field.value;
    save();
  });

  function on(id, handler) {
    var element = document.getElementById(id);
    if (element) element.addEventListener('click', handler);
  }

  on('jumpSheet', function () {
    var sheet = document.getElementById('sheet');
    if (sheet) sheet.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  on('printDoc', function () { window.print(); });
  on('clearSheet', function () {
    state.picks = {}; state.text = {};
    Array.prototype.forEach.call(document.querySelectorAll('[data-key]'), function (f) { f.value = ''; });
    save();
    paint();
  });

  load();
  paint();
}());
