#!/usr/bin/env python3
"""
Build a THYLORA EDF digital edition PDF from canonical text blocks.

The blocks in `thylora_edf_text_blocks` are the source of truth for a story, not
the legacy PDF that happened to be uploaded first. This renders those blocks, so
a lost or never-ingested binary can always be rebuilt from the record rather
than re-sourced from someone's file library.

No third-party dependencies: the sandbox has no reportlab and no network to pip.
Output is PDF 1.4 with WinAnsiEncoding and the base-14 Times faces, matching the
convention of the editions already staged in the backend.

Usage:
    edf_pdf.py blocks.json out.pdf --title "..." --subtitle "..."

blocks.json is a list of {"o": ordinal, "t": block_type, "x": text}, where
block_type is one of TITLE, HEADING, PARAGRAPH, BREAK.
"""
import json
import sys
import zlib

# Times-Roman advance widths (1/1000 em) for the printable ASCII range, plus the
# WinAnsi punctuation this corpus actually uses. Values are the Adobe base-14
# metrics; getting these right is what keeps the right margin straight.
_TIMES_ROMAN = {
    32: 250, 33: 333, 34: 408, 35: 500, 36: 500, 37: 833, 38: 778, 39: 333,
    40: 333, 41: 333, 42: 500, 43: 564, 44: 250, 45: 333, 46: 250, 47: 278,
    48: 500, 49: 500, 50: 500, 51: 500, 52: 500, 53: 500, 54: 500, 55: 500,
    56: 500, 57: 500, 58: 278, 59: 278, 60: 564, 61: 564, 62: 564, 63: 444,
    64: 921, 65: 722, 66: 667, 67: 667, 68: 722, 69: 611, 70: 556, 71: 722,
    72: 722, 73: 333, 74: 389, 75: 722, 76: 611, 77: 889, 78: 722, 79: 722,
    80: 556, 81: 722, 82: 667, 83: 556, 84: 611, 85: 722, 86: 722, 87: 944,
    88: 722, 89: 722, 90: 611, 91: 333, 92: 278, 93: 333, 94: 469, 95: 500,
    96: 333, 97: 444, 98: 500, 99: 444, 100: 500, 101: 444, 102: 333, 103: 500,
    104: 500, 105: 278, 106: 278, 107: 500, 108: 278, 109: 778, 110: 500,
    111: 500, 112: 500, 113: 500, 114: 333, 115: 389, 116: 278, 117: 500,
    118: 500, 119: 722, 120: 500, 121: 500, 122: 444, 123: 480, 124: 200,
    125: 480, 126: 541,
    0x91: 333, 0x92: 333, 0x93: 444, 0x94: 444, 0x96: 500, 0x97: 1000,
    0xD7: 564, 0xA0: 250,
}
# Times-Bold, for headings.
_TIMES_BOLD = dict(_TIMES_ROMAN)
_TIMES_BOLD.update({
    32: 250, 65: 722, 66: 667, 67: 722, 68: 722, 69: 667, 70: 611, 71: 778,
    72: 778, 73: 389, 74: 500, 75: 778, 76: 667, 77: 944, 78: 722, 79: 778,
    80: 611, 81: 778, 82: 722, 83: 556, 84: 667, 85: 722, 86: 722, 87: 1000,
    88: 722, 89: 722, 90: 667,
    97: 500, 98: 556, 99: 444, 100: 556, 101: 444, 102: 333, 103: 500, 104: 556,
    105: 278, 106: 333, 107: 556, 108: 278, 109: 833, 110: 556, 111: 500,
    112: 556, 113: 556, 114: 444, 115: 389, 116: 333, 117: 556, 118: 500,
    119: 722, 120: 500, 121: 500, 122: 444,
})

# Unicode the corpus uses -> WinAnsi byte.
_WINANSI = {
    '‘': 0x91, '’': 0x92, '“': 0x93, '”': 0x94,
    '–': 0x96, '—': 0x97, '×': 0xD7, '…': 0x85,
    ' ': 0x20,
}

PAGE_W, PAGE_H = 612.0, 792.0          # US Letter
MARGIN_X, MARGIN_TOP, MARGIN_BOT = 72.0, 72.0, 72.0
TEXT_W = PAGE_W - 2 * MARGIN_X


def to_winansi(text):
    """Map the document's Unicode onto WinAnsi bytes, dropping nothing silently."""
    out = bytearray()
    for ch in text:
        code = ord(ch)
        if code < 127:
            out.append(code)
        elif ch in _WINANSI:
            out.append(_WINANSI[ch])
        elif code < 256:
            out.append(code)
        else:
            # An unmappable glyph would render as garbage. Fail loudly instead:
            # a silently corrupted customer deliverable is worse than no build.
            raise ValueError(f'character U+{code:04X} ({ch!r}) has no WinAnsi mapping')
    return bytes(out)


def width_of(text_bytes, size, bold):
    table = _TIMES_BOLD if bold else _TIMES_ROMAN
    return sum(table.get(b, 500) for b in text_bytes) * size / 1000.0


def wrap(text, size, bold, max_width):
    """Greedy wrap on WinAnsi bytes so measurement matches what is drawn."""
    words = text.split()
    if not words:
        return [b'']
    lines, current = [], to_winansi(words[0])
    for word in words[1:]:
        candidate = current + b' ' + to_winansi(word)
        if width_of(candidate, size, bold) <= max_width:
            current = candidate
        else:
            lines.append(current)
            current = to_winansi(word)
    lines.append(current)
    return lines


def escape(b):
    return b.replace(b'\\', b'\\\\').replace(b'(', b'\\(').replace(b')', b'\\)')


class Builder:
    """Lays blocks out into pages, then serialises them."""

    def __init__(self):
        self.pages, self.ops, self.y = [], [], PAGE_H - MARGIN_TOP

    def _newpage(self):
        if self.ops:
            self.pages.append(b'\n'.join(self.ops))
        self.ops, self.y = [], PAGE_H - MARGIN_TOP

    def _space(self, needed):
        if self.y - needed < MARGIN_BOT:
            self._newpage()

    def text(self, raw, size=11.0, bold=False, leading=None, space_before=0.0,
             space_after=0.0, centered=False, gray=None):
        leading = leading or size * 1.45
        font = b'/F2' if bold else b'/F1'
        self.y -= space_before
        for line in wrap(raw, size, bold, TEXT_W):
            self._space(leading)
            x = MARGIN_X
            if centered:
                x = MARGIN_X + (TEXT_W - width_of(line, size, bold)) / 2.0
            color = b'0 0 0 rg' if gray is None else f'{gray} {gray} {gray} rg'.encode()
            self.ops.append(
                b'BT ' + color + b' ' + font + b' ' + f'{size}'.encode() + b' Tf ' +
                f'{x:.2f} {self.y:.2f}'.encode() + b' Td (' + escape(line) + b') Tj ET')
            self.y -= leading
        self.y -= space_after

    def rule(self, space_before=6.0, space_after=10.0, gray=0.75):
        self._space(space_before + space_after + 2)
        self.y -= space_before
        self.ops.append(
            f'{gray} {gray} {gray} RG 0.7 w {MARGIN_X:.2f} {self.y:.2f} m '
            f'{PAGE_W - MARGIN_X:.2f} {self.y:.2f} l S'.encode())
        self.y -= space_after

    def finish(self):
        if self.ops:
            self.pages.append(b'\n'.join(self.ops))
        return self.pages


def render(blocks, title, subtitle=None, footer=None):
    b = Builder()
    first_title = True
    for blk in blocks:
        kind, text = blk.get('t', 'PARAGRAPH'), (blk.get('x') or '').strip()
        if not text:
            continue
        if kind == 'TITLE':
            b.text(text, size=26.0, bold=True, centered=True,
                   space_before=0 if first_title else 24, space_after=6)
            first_title = False
        elif kind == 'HEADING':
            b.text(text, size=14.5, bold=True, space_before=16, space_after=4)
        elif kind == 'BREAK':
            b.rule()
        else:
            # The two lines above the title are the imprint; set them small and
            # centered rather than as body copy.
            if first_title:
                b.text(text, size=9.0, centered=True, gray=0.35, space_after=2)
            else:
                b.text(text, size=11.0, space_after=7)
    if footer:
        b.rule(space_before=18, space_after=8)
        for line in footer:
            b.text(line, size=8.5, gray=0.4, space_after=1)
    return b.finish()


def serialise(pages, title):
    """Assemble the PDF. Streams are Flate-compressed; xref offsets are exact."""
    objects = {}
    n_pages = len(pages)
    font_regular, font_bold = 3 + n_pages * 2, 4 + n_pages * 2

    kids = ' '.join(f'{3 + i} 0 R' for i in range(n_pages))
    objects[1] = b'<< /Type /Catalog /Pages 2 0 R >>'
    objects[2] = f'<< /Type /Pages /Count {n_pages} /Kids [{kids}] >>'.encode()

    for i, content in enumerate(pages):
        page_obj = 3 + i
        stream_obj = 3 + n_pages + i
        objects[page_obj] = (
            f'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {PAGE_W:g} {PAGE_H:g}] '
            f'/Resources << /Font << /F1 {font_regular} 0 R /F2 {font_bold} 0 R >> >> '
            f'/Contents {stream_obj} 0 R >>').encode()
        packed = zlib.compress(content, 9)
        objects[stream_obj] = (
            f'<< /Length {len(packed)} /Filter /FlateDecode >>\nstream\n'.encode()
            + packed + b'\nendstream')

    objects[font_regular] = (b'<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman '
                             b'/Encoding /WinAnsiEncoding >>')
    objects[font_bold] = (b'<< /Type /Font /Subtype /Type1 /BaseFont /Times-Bold '
                          b'/Encoding /WinAnsiEncoding >>')

    info_obj = max(objects) + 1
    safe_title = to_winansi(title)
    objects[info_obj] = (b'<< /Title (' + escape(safe_title) +
                         b') /Producer (THYLORA EDF builder) >>')

    out = bytearray(b'%PDF-1.4\n%\xe2\xe3\xcf\xd3\n')
    offsets = {}
    for num in sorted(objects):
        offsets[num] = len(out)
        out += f'{num} 0 obj\n'.encode() + objects[num] + b'\nendobj\n'

    xref_at = len(out)
    highest = max(objects)
    out += f'xref\n0 {highest + 1}\n'.encode()
    out += b'0000000000 65535 f \n'
    for num in range(1, highest + 1):
        out += f'{offsets[num]:010d} 00000 n \n'.encode()
    out += (f'trailer\n<< /Size {highest + 1} /Root 1 0 R /Info {info_obj} 0 R >>\n'
            f'startxref\n{xref_at}\n%%EOF\n').encode()
    return bytes(out)


def main():
    src, dest = sys.argv[1], sys.argv[2]
    args = sys.argv[3:]
    title = args[args.index('--title') + 1] if '--title' in args else 'THYLORA Edition'
    footer = None
    if '--footer' in args:
        footer = json.loads(args[args.index('--footer') + 1])
    blocks = json.load(open(src, encoding='utf-8'))
    pdf = serialise(render(blocks, title, footer=footer), title)
    with open(dest, 'wb') as fh:
        fh.write(pdf)
    print(f'{dest}  {len(pdf)} bytes  {len(render(blocks, title, footer=footer))} pages')


if __name__ == '__main__':
    main()
