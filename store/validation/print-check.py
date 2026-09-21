#!/usr/bin/env python3
"""THYLORA STORE · print check · WR-STORE-UTILITY-582

Reads a rendered packet PDF and refuses it if the printed result is not what the
packet claims: one page per sheet, and ink on every page.

    python3 store/validation/print-check.py /tmp/qc.pdf 8

Standard library only — no pypdf, no poppler. It parses the page tree, pulls each
page's content stream, inflates it, and counts the operators that actually put
marks on paper: text runs (Tj/TJ), rules and fills (re/f/S), and lines (l).
A page whose operator count is near zero is a blank page, whatever the layout
looked like on screen.

The floor is calibrated, not guessed: the lightest designed page in this lane
(the cover) draws 771 marks, while a spill page carrying only a running foot
draws single figures. 120 sits between the two with room on both sides.
"""
import re, sys, zlib

MARK_OPS = re.compile(rb'(?:\bTJ\b|\bTj\b|\bre\b|\bf\*?\b|\bS\b|\bl\b)')

def objects(raw):
    out = {}
    for m in re.finditer(rb'(\d+)\s+(\d+)\s+obj\b(.*?)\bendobj', raw, re.S):
        out[int(m.group(1))] = m.group(3)
    return out

def stream_of(body):
    m = re.search(rb'stream\r?\n(.*?)\r?\nendstream', body, re.S)
    if not m:
        return b''
    data = m.group(1)
    if b'/FlateDecode' in body:
        try:
            return zlib.decompress(data)
        except zlib.error:
            try:
                return zlib.decompressobj().decompress(data)
            except zlib.error:
                return b''
    return data

def page_marks(raw):
    objs = objects(raw)
    pages = [(num, body) for num, body in objs.items()
             if re.search(rb'/Type\s*/Page\b', body) and not re.search(rb'/Type\s*/Pages\b', body)]
    pages.sort()
    counts = []
    for _, body in pages:
        refs = []
        m = re.search(rb'/Contents\s+(\d+)\s+\d+\s+R', body)
        if m:
            refs = [int(m.group(1))]
        else:
            m = re.search(rb'/Contents\s*\[(.*?)\]', body, re.S)
            if m:
                refs = [int(n) for n in re.findall(rb'(\d+)\s+\d+\s+R', m.group(1))]
        content = b''.join(stream_of(objs.get(r, b'')) for r in refs)
        counts.append(len(MARK_OPS.findall(content)))
    return counts

def main(path, expected_pages, floor=120):
    raw = open(path, 'rb').read()
    counts = page_marks(raw)
    ok = True
    print(f"{path}: {len(counts)} pages")
    for i, marks in enumerate(counts, 1):
        state = 'ok' if marks >= floor else 'BLANK / SPILL'
        print(f"  page {i}: {marks:5d} marks  {state}")
        if marks < floor:
            ok = False
    if len(counts) != expected_pages:
        print(f"FAIL: expected {expected_pages} pages, printed {len(counts)}."
              " A sheet is overflowing onto a spill page.")
        ok = False
    print("PASS: one page per sheet, ink on every page." if ok else "FAIL")
    return 0 if ok else 1

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(2)
    sys.exit(main(sys.argv[1], int(sys.argv[2])))
