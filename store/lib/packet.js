// THYLORA STORE · packet runtime · WR-STORE-UTILITY-582
// Three jobs only: stamp the preview serial, keep what the holder types, print.
// No framework, no network call, no backend dependency. A packet with JavaScript
// switched off is still a complete, printable, fillable-by-pen document.

const pad = (n, w) => String(n).padStart(w, '0');

export function previewSerial(prefix, now = new Date()){
  const d = `${now.getFullYear()}${pad(now.getMonth() + 1, 2)}${pad(now.getDate(), 2)}`;
  // Preview copies carry 0000. A sold copy is stamped by the store at delivery.
  return `${prefix}-${d}-0000`;
}

export function initPacket({ productId, serialPrefix }){
  const now = new Date();
  const serial = previewSerial(serialPrefix, now);

  document.querySelectorAll('[data-serial]').forEach(el => { el.textContent = serial; });
  document.querySelectorAll('[data-issued]').forEach(el => {
    el.textContent = now.toISOString().slice(0, 10);
  });

  const key = `thylora_packet_${productId}`;
  const fields = Array.from(document.querySelectorAll('[data-keep]'));

  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(key) || '{}'); } catch { saved = {}; }

  fields.forEach(f => {
    const id = f.getAttribute('data-keep');
    if (saved[id] !== undefined) {
      if (f.type === 'checkbox' || f.type === 'radio') f.checked = Boolean(saved[id]);
      else f.value = saved[id];
    }
    f.addEventListener('input', save);
    f.addEventListener('change', save);
  });

  function save(){
    const out = {};
    fields.forEach(f => {
      const id = f.getAttribute('data-keep');
      out[id] = (f.type === 'checkbox' || f.type === 'radio') ? f.checked : f.value;
    });
    try { localStorage.setItem(key, JSON.stringify(out)); } catch { /* private mode: typing still works */ }
    mark('SAVED ON THIS DEVICE');
  }

  function mark(text){
    const chip = document.getElementById('keepChip');
    if (!chip) return;
    chip.textContent = text;
    chip.classList.add('ok');
  }

  const printBtn = document.getElementById('printBtn');
  if (printBtn) printBtn.addEventListener('click', () => window.print());

  const clearBtn = document.getElementById('clearBtn');
  if (clearBtn) clearBtn.addEventListener('click', () => {
    if (!confirm('Clear everything you have typed into this packet on this device?')) return;
    fields.forEach(f => {
      if (f.type === 'checkbox' || f.type === 'radio') f.checked = false; else f.value = '';
    });
    try { localStorage.removeItem(key); } catch { /* nothing to remove */ }
    const chip = document.getElementById('keepChip');
    if (chip) { chip.textContent = 'CLEARED'; chip.classList.remove('ok'); }
  });

  const copyBtns = Array.from(document.querySelectorAll('[data-copy-from]'));
  copyBtns.forEach(btn => btn.addEventListener('click', async () => {
    const src = document.getElementById(btn.getAttribute('data-copy-from'));
    if (!src) return;
    const text = src.value !== undefined ? src.value : src.textContent;
    try {
      await navigator.clipboard.writeText(text);
      btn.textContent = 'COPIED';
    } catch {
      src.focus?.(); src.select?.();
      btn.textContent = 'SELECT AND COPY';
    }
    setTimeout(() => { btn.textContent = btn.getAttribute('data-label') || 'COPY'; }, 2600);
  }));

  if (fields.length) mark('KEPT ON THIS DEVICE');
  return { serial };
}
