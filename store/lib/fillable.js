/* THYLORA Product Page System — fillable behaviour.
   One file, no dependency, no network call, no analytics.
   Everything a customer types stays in their own browser. Nothing is sent anywhere.

   Storage is a per-viewer convenience only. Every read and write is wrapped:
   private windows, cleared site data and blocked storage must not break the page. */

(function () {
  'use strict';

  var root = document.documentElement;
  var KEY = 'thylora.product.' + (root.getAttribute('data-product') || 'unknown');

  function fields() {
    return Array.prototype.slice.call(
      document.querySelectorAll('[data-fill]')
    );
  }

  function safeRead() {
    try {
      var raw = window.localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function safeWrite(obj) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(obj));
      return true;
    } catch (e) {
      return false;
    }
  }

  function safeClear() {
    try {
      window.localStorage.removeItem(KEY);
      return true;
    } catch (e) {
      return false;
    }
  }

  function collect() {
    var out = {};
    fields().forEach(function (el) {
      var name = el.getAttribute('data-fill');
      out[name] = el.type === 'checkbox' ? !!el.checked : el.value;
    });
    return out;
  }

  function apply(data) {
    fields().forEach(function (el) {
      var name = el.getAttribute('data-fill');
      if (!(name in data)) return;
      if (el.type === 'checkbox') el.checked = !!data[name];
      else el.value = data[name] == null ? '' : String(data[name]);
    });
  }

  var statusEl = null;
  var statusTimer = null;
  function say(message) {
    if (!statusEl) return;
    statusEl.textContent = message;
    if (statusTimer) window.clearTimeout(statusTimer);
    statusTimer = window.setTimeout(function () {
      if (statusEl) statusEl.textContent = '';
    }, 4000);
  }

  var saveTimer = null;
  function queueSave() {
    if (saveTimer) window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(function () {
      safeWrite(collect());
    }, 400);
  }

  function copyScript(button) {
    var pre = button.closest('.script').querySelector('pre');
    if (!pre) return;
    var text = pre.innerText;
    var done = function () {
      var original = button.getAttribute('data-label') || button.textContent;
      button.setAttribute('data-label', original);
      button.textContent = 'Copied';
      window.setTimeout(function () { button.textContent = original; }, 2200);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { selectFallback(pre); });
    } else {
      selectFallback(pre);
    }
  }

  function selectFallback(pre) {
    try {
      var range = document.createRange();
      range.selectNodeContents(pre);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    } catch (e) { /* selection is a convenience, not a requirement */ }
  }

  function ready() {
    statusEl = document.querySelector('[data-status]');

    apply(safeRead());

    fields().forEach(function (el) {
      el.addEventListener('input', queueSave);
      el.addEventListener('change', queueSave);
    });

    var saveBtn = document.querySelector('[data-action="save"]');
    if (saveBtn) saveBtn.addEventListener('click', function () {
      say(safeWrite(collect())
        ? 'Saved in this browser. Nothing was sent anywhere.'
        : 'This browser is not allowing saves. Print or copy your answers instead.');
    });

    var printBtn = document.querySelector('[data-action="print"]');
    if (printBtn) printBtn.addEventListener('click', function () {
      safeWrite(collect());
      window.print();
    });

    var clearBtn = document.querySelector('[data-action="clear"]');
    if (clearBtn) clearBtn.addEventListener('click', function () {
      if (!window.confirm('Clear every answer you have typed into this copy?')) return;
      fields().forEach(function (el) {
        if (el.type === 'checkbox') el.checked = false;
        else el.value = '';
      });
      safeClear();
      say('Cleared. This copy is blank again and ready to reuse.');
    });

    Array.prototype.forEach.call(
      document.querySelectorAll('[data-action="copy"]'),
      function (b) { b.addEventListener('click', function () { copyScript(b); }); }
    );
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ready);
  } else {
    ready();
  }
})();
