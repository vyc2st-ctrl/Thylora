"""THYLORA Back to Buy - family-identity QR builder + scan test (WR-SPINE-624).

Rule: the family/campaign crest FRAMES the code. Nothing is drawn on the data modules
or inside the 4-module quiet zone. Error correction Q (~25%) is kept as damage margin
for print wear, never spent on decoration.

Usage: python3 family_qr.py <payload_url> <campaign_id> <out.png>
Requires (build machine only, not a runtime dependency): segno, pillow, zxing-cpp.
"""
import sys, io, segno, zxingcpp
from PIL import Image, ImageDraw, ImageFont

def build(payload, campaign_id, out, module_px=12, border=4):
    qr = segno.make(payload, error='q', micro=False)
    buf = io.BytesIO()
    qr.save(buf, kind='png', scale=module_px, border=border, dark='#000000', light='#FFFFFF')
    code = Image.open(buf).convert('RGB')
    cw, ch = code.size
    band = int(cw * 0.16)                        # crest band thickness, outside the quiet zone
    W, H = cw + 2 * band, ch + 2 * band + band   # extra bottom band for campaign id + short URL
    img = Image.new('RGB', (W, H), '#1F2A44')    # family color field (placeholder crest color)
    d = ImageDraw.Draw(img)
    # crest frame: double rule + corner marks, all outside the code's quiet zone
    for inset, color in ((band // 5, '#D6A348'), (band // 3, '#F4EFE6')):
        d.rectangle([inset, inset, W - inset, H - inset], outline=color, width=max(2, band // 14))
    img.paste(code, (band, band))                # white quiet zone travels with the code
    try:
        font = ImageFont.truetype('DejaVuSans-Bold.ttf', max(14, band // 3))
    except OSError:
        font = ImageFont.load_default()
    d.text((W // 2, band + ch + band // 2), campaign_id, fill='#F4EFE6', font=font, anchor='mm')
    img.save(out)
    return qr, img

def scan_test(img, expected, widths=(1000, 600, 300, 180, 120)):
    results = []
    for w in widths:
        h = int(img.height * w / img.width)
        small = img.resize((w, h), Image.LANCZOS)
        found = [r.text for r in zxingcpp.read_barcodes(small)]
        results.append((w, expected in found))
    return results

if __name__ == '__main__':
    payload, cid, out = sys.argv[1:4]
    qr, img = build(payload, cid, out)
    print(f'version {qr.version} error {qr.error} modules {qr.symbol_size(border=0)[0]} image {img.size}')
    res = scan_test(img, payload)
    for w, ok in res:
        print(f'scan @ {w}px wide: {"PASS" if ok else "FAIL"}')
    sys.exit(0 if all(ok for w, ok in res[:4]) else 1)
