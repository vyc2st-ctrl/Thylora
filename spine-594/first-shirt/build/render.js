const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const DIR = process.argv[2] || '/home/user/Thylora/spine-594/first-shirt';
const jobs = [
  ['mockup-2XL.svg', 'mockup-2XL.png', 1, false],
  ['mockup-3XL.svg', 'mockup-3XL.png', 1, false],
  ['@front-preview.svg', 'front-preview.png', 0.25, false],
  ['@front-print.svg', 'front-print-3600x4800.png', 1, true],
  ['@back-print.svg', 'back-print-3600x4800.png', 1, true],
];
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  for (const [src, out, scale, transparent] of jobs) {
    const svg = fs.readFileSync(src.startsWith('@') ? path.join(__dirname, src.slice(1)) : path.join(DIR, src), 'utf8');
    const m = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
    const w = +m[1], h = +m[2];
    const p = await b.newPage({ viewport: { width: Math.round(w * scale), height: Math.round(h * scale) }, deviceScaleFactor: 1 });
    await p.setContent(`<html><body style="margin:0;background:transparent"><div style="width:${w * scale}px;height:${h * scale}px">${svg.replace(/<\?xml[^>]*>/, '').replace(/width="[^"]+" height="[^"]+"/, `width="${w * scale}" height="${h * scale}"`)}</div></body></html>`);
    await p.waitForTimeout(200);
    await p.screenshot({ path: path.join(DIR, out), omitBackground: transparent, clip: { x: 0, y: 0, width: Math.round(w * scale), height: Math.round(h * scale) } });
    await p.close();
    console.log('rendered', out);
  }
  await b.close();
})();
