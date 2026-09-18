#!/usr/bin/env python3
"""Minimal dependency-free PNG cropper (8-bit truecolour, with or without alpha).

Headless Chromium in this environment paints 80 CSS px short of the requested
window height, so the still is rendered into an over-tall viewport and the exact
frame is cropped out here. Pure stdlib: the render stays reproducible on any
machine with python3 + chromium and nothing else installed.

usage: pngcrop.py <src.png> <dst.png> <x> <y> <w> <h>
"""
import struct
import sys
import zlib


def decode(path):
    data = open(path, "rb").read()
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        raise SystemExit(f"{path}: not a PNG")
    pos, idat = 8, bytearray()
    width = height = depth = colour = None
    while pos < len(data):
        (length,) = struct.unpack(">I", data[pos:pos + 4])
        kind = data[pos + 4:pos + 8]
        body = data[pos + 8:pos + 8 + length]
        if kind == b"IHDR":
            width, height, depth, colour, _, _, interlace = struct.unpack(">IIBBBBB", body)
            if depth != 8 or colour not in (2, 6) or interlace:
                raise SystemExit("only 8-bit RGB/RGBA, non-interlaced PNG supported")
        elif kind == b"IDAT":
            idat += body
        elif kind == b"IEND":
            break
        pos += 12 + length

    channels = 3 if colour == 2 else 4
    stride = width * channels
    raw = zlib.decompress(bytes(idat))
    rows, prev, p = [], bytearray(stride), 0
    for _ in range(height):
        filt = raw[p]
        p += 1
        line = bytearray(raw[p:p + stride])
        p += stride
        if filt:
            for i in range(stride):
                a = line[i - channels] if i >= channels else 0
                b = prev[i]
                c = prev[i - channels] if i >= channels else 0
                if filt == 1:
                    line[i] = (line[i] + a) & 255
                elif filt == 2:
                    line[i] = (line[i] + b) & 255
                elif filt == 3:
                    line[i] = (line[i] + ((a + b) >> 1)) & 255
                elif filt == 4:
                    est = a + b - c
                    da, db, dc = abs(est - a), abs(est - b), abs(est - c)
                    line[i] = (line[i] + (a if da <= db and da <= dc else b if db <= dc else c)) & 255
                else:
                    raise SystemExit(f"bad filter {filt}")
        rows.append(bytes(line))
        prev = line
    return width, height, channels, rows


def encode(path, width, height, channels, rows):
    body = bytearray()
    for line in rows:
        body.append(0)          # filter 0: store as-is, byte-stable output
        body += line
    colour = 2 if channels == 3 else 6

    def chunk(kind, payload):
        return (struct.pack(">I", len(payload)) + kind + payload
                + struct.pack(">I", zlib.crc32(kind + payload) & 0xFFFFFFFF))

    out = b"\x89PNG\r\n\x1a\n"
    out += chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, colour, 0, 0, 0))
    out += chunk(b"IDAT", zlib.compress(bytes(body), 9))
    out += chunk(b"IEND", b"")
    open(path, "wb").write(out)


def main():
    if len(sys.argv) != 7:
        raise SystemExit(__doc__.strip())
    src, dst = sys.argv[1], sys.argv[2]
    x, y, w, h = (int(v) for v in sys.argv[3:7])
    width, height, channels, rows = decode(src)
    if x + w > width or y + h > height:
        raise SystemExit(f"crop {w}x{h}+{x}+{y} does not fit in {width}x{height}")
    cropped = [rows[y + r][(x * channels):((x + w) * channels)] for r in range(h)]
    encode(dst, w, h, channels, cropped)
    print(f"{dst}  {w}x{h}")


if __name__ == "__main__":
    main()
