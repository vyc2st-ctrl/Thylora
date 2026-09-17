# -*- coding: utf-8 -*-
"""
Clipping check, required by THY-VISUAL-OUTPUT-IDENTITY-001 ("render every page,
inspect for clipping"). Measures, in a real browser, whether any page's content
exceeds its trim box.
"""
import json, os, sys
from playwright.sync_api import sync_playwright

OUT = ("/tmp/claude-0/-home-user-Thylora/d3272dba-25bd-571e-9555-c5dbbdd95dba/"
       "scratchpad/editions")

JS = """
() => Array.from(document.querySelectorAll('.page')).map((pg, i) => {
  const pad = pg.querySelector('.pad');
  const pr = pg.getBoundingClientRect();
  let worst = 0, culprit = '';
  const walk = (el) => {
    for (const c of el.children) {
      // SVG subtrees use their own coordinate system; measuring their children
      // against the page box is meaningless, so stop at the <svg> root.
      if (c instanceof SVGElement) continue;
      const r = c.getBoundingClientRect();
      const over = Math.max(0, r.bottom - pr.bottom, pr.top - r.top);
      if (over > worst) { worst = over; culprit = (typeof c.className === 'string'
        ? c.className : c.tagName); }
      walk(c);
    }
  };
  if (pad) walk(pad);
  return {
    page: i + 1,
    title: pg.getAttribute('data-title') || '',
    padScroll: pad ? pad.scrollHeight : 0,
    padClient: pad ? pad.clientHeight : 0,
    overflowPx: pad ? Math.max(0, pad.scrollHeight - pad.clientHeight) : 0,
    worstChildOverflowPx: Math.round(worst),
    culprit: String(culprit).slice(0, 60)
  };
});
"""


def main():
    man = json.load(open(os.path.join(OUT, "manifest.json")))
    bad_total = 0
    report = []
    with sync_playwright() as pw:
        # pinned to the browser already present in this environment
        b = pw.chromium.launch(
            executable_path="/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
            args=["--no-sandbox"])
        pg = b.new_page()
        for p in man:
            html = os.path.join(OUT, f'{p["key"]}.html')
            pg.goto("file://" + html, wait_until="load")
            pg.wait_for_timeout(500)
            rows = pg.evaluate(JS)
            bad = [r for r in rows
                   if r["overflowPx"] > 2 or r["worstChildOverflowPx"] > 2]
            bad_total += len(bad)
            report.append({"key": p["key"], "pages": len(rows), "clipped": bad})
            mark = "OK " if not bad else "!! "
            print(f'{mark}{p["key"]:15} {len(rows):3d}pp  clipped={len(bad)}')
            for r in bad:
                print(f'      p{r["page"]:<3} "{r["title"][:28]:28}" '
                      f'pad+{r["overflowPx"]}px child+{r["worstChildOverflowPx"]}px '
                      f'<- {r["culprit"]}')
        b.close()
    json.dump(report, open(os.path.join(OUT, "overflow_report.json"), "w"), indent=1)
    print(f"\ntotal clipped pages: {bad_total}")
    return bad_total


if __name__ == "__main__":
    sys.exit(0 if main() == 0 else 1)
