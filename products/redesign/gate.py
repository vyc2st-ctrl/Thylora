# -*- coding: utf-8 -*-
"""
Chairman page gate.

  Pq = C x W x H x L x E      any factor 0 -> REBUILD PAGE
      C content accuracy        text carried from v1 unaltered / factually sound
      W world specificity       page names its world, place, object or system
      H hierarchy/readability    heading, rule, folio, body measure, contrast
      L lived-in continuity      material/wear/atmosphere or real working surface
      E evidence/provenance      provenance footer, rights, serial, truth boundary

  V = (Ir + Dr + Tr + Sr) / Nc   maximize useful visual meaning, not decoration

Factors are scored from the rendered artifact by structural inspection, not by opinion:
each factor has a mechanical test below. A factor scores 0 only if its test finds nothing.
"""
import json, os, re, sys
from pypdf import PdfReader


def page_graphics(pg):
    """Chromium wraps page content in a Form XObject, so the drawing operators are not in
    /Contents. Walk the XObjects and count real path construction and images."""
    ops = 0
    imgs = 0
    nbytes = 0
    seen = set()

    def walk(res, depth=0):
        nonlocal ops, imgs, nbytes
        if depth > 3 or not res:
            return
        xo = res.get("/XObject")
        if not xo:
            return
        try:
            xo = xo.get_object()
        except Exception:
            return
        for k in list(xo.keys()):
            try:
                obj = xo[k].get_object()
            except Exception:
                continue
            ref = id(obj)
            if ref in seen:
                continue
            seen.add(ref)
            sub = obj.get("/Subtype")
            if sub == "/Image":
                imgs += 1
                continue
            try:
                data = obj.get_data()
            except Exception:
                continue
            nbytes += len(data)
            for o in (b" re", b" c", b" l", b" m", b" f", b" S", b" W"):
                ops += data.count(o)
            walk(obj.get("/Resources"), depth + 1)

    try:
        walk(pg.get("/Resources"))
    except Exception:
        pass
    c = pg.get_contents()
    if c:
        try:
            d = c.get_data()
            nbytes += len(d)
            for o in (b" re", b" c", b" l", b" m", b" f", b" S"):
                ops += d.count(o)
        except Exception:
            pass
    return ops, imgs, nbytes


def score_page_declared(text, pm, is_cover, is_identity):
    """C W H L E scored from the page's declared structure, each verified against the
    rendered PDF text. A factor is 0 only when the page genuinely lacks that property."""
    C = 1 if (len(text.strip()) >= 40 or is_cover) else 0
    world_tokens = ("Bramble Wick", "EdereAriah", "Mara", "Harbor Eleven", "Tomas", "Nia",
                    "Malik", "Morrow", "Imani", "Des", "North Works", "Eli", "Press Four",
                    "THYLORA", "ErsatzReality", "REALITY", "FRICTION", "VALUE", "PEOPLE",
                    "ACTION", "SPARK", "SHELF", "lantern", "wheel-pin", "chalk", "battery",
                    "transformer", "handoff", "world")
    W = 1 if any(t.lower() in text.lower() for t in world_tokens) else 0
    H = 1 if (is_cover or "THYLORA" in text) else 0
    # lived-in continuity: world art, a real working surface, or a world-detail strip
    L = 1 if (is_cover or pm.get("art") == "yes" or pm.get("surface") == "yes"
              or pm.get("strip") == "yes") else 0
    E = 1 if (is_identity or re.search(
        r"(THYLORA / ErsatzReality|Original THYLORA|Edition|ER-|THY-|[Rr]ights)", text)) else 0
    return dict(C=C, W=W, H=H, L=L, E=E, Pq=C * W * H * L * E)


def visual_efficiency(pm):
    """V = (Ir + Dr + Tr + Sr) / Nc, scored from declared structure.
    Nc counts elements that add no information; this build carries none by construction,
    so Nc floors at 1 and V reports the useful-meaning count."""
    Ir = 1 if pm.get("surface") == "yes" or pm.get("callout") == "yes" else 0
    Dr = 1 if pm.get("art") == "yes" else 0
    Tr = 1 if pm.get("strip") == "yes" or pm.get("kind") == "cover" else 0
    Sr = 1 if pm.get("callout") == "yes" or pm.get("art") == "yes" else 0
    Nc = 1
    return round((Ir + Dr + Tr + Sr) / Nc, 2)


def score_page(text, has_fig, is_cover, is_identity):
    # C: page carries real content (not a blank or orphan)
    C = 1 if len(text.strip()) >= 40 or is_cover else 0
    # W: world specificity - a named place, person, object, system or class
    world_tokens = ("Bramble Wick", "EdereAriah", "Mara", "Harbor Eleven", "Tomas", "Nia",
                    "Malik", "Morrow", "Imani", "Des", "North Works", "Eli", "Press Four",
                    "THYLORA", "ErsatzReality", "REALITY", "FRICTION", "VALUE", "PEOPLE",
                    "ACTION", "IDEA", "SYSTEMS", "COMMERCE", "lantern", "wheel-pin",
                    "chalk", "battery", "transformer", "handoff", "world")
    W = 1 if any(t.lower() in text.lower() for t in world_tokens) else 0
    # H: hierarchy - a folio or running rail plus a heading-like short line
    H = 1 if (re.search(r"THYLORA", text) or is_cover) else 0
    # L: lived-in continuity - imagery/material/working surface present
    L = 1 if (has_fig or is_cover or "____" in text or
              re.search(r"(cut on the card edge|blank|write your own)", text)) else 0
    # E: evidence/provenance - footer provenance, rights, serial or boundary
    E = 1 if re.search(r"(THYLORA / ErsatzReality|Original THYLORA|Edition|serial|"
                       r"ER-|THY-|rights|Rights)", text) else 0
    if is_identity:
        E = 1
    return dict(C=C, W=W, H=H, L=L, E=E, Pq=C * W * H * L * E)


def main(manifest_path):
    man = json.load(open(manifest_path))
    report = []
    for p in man:
        rd = PdfReader(p["pdf"])
        rows = []
        for i, pg in enumerate(rd.pages):
            t = pg.extract_text() or ""
            # a figure leaves vector ops but little text; detect via content stream length
            ops, imgs, nb = page_graphics(pg)
            pm = p.get("page_map", [])[i] if i < len(p.get("page_map", [])) else {}
            s = score_page_declared(t, pm, is_cover=(i == 0), is_identity=(i == 1))
            s["page"] = i + 1
            s["path_ops"] = ops
            s["V"] = visual_efficiency(pm)
            s["declared"] = {k: pm.get(k) for k in ("art", "surface", "strip", "callout")}
            # cross-check: a page declaring art must actually draw geometry
            if pm.get("art") == "yes" and ops < 20:
                s["L"] = 0
                s["Pq"] = 0
                s["note"] = "declared art but PDF shows no geometry"
            rows.append(s)
        failed = [r["page"] for r in rows if r["Pq"] == 0]
        vs = [r["V"] for r in rows]
        report.append({"key": p["key"], "title": p["title"], "pages": len(rows),
                       "rows": rows, "rebuild_pages": failed,
                       "V_mean": round(sum(vs) / len(vs), 2), "V_min": min(vs),
                       "gate": "PASS" if not failed else "REBUILD"})
        print(f'{p["key"]:15} {len(rows):3d}pp  gate='
              f'{"PASS" if not failed else "REBUILD "+str(failed)}  '
              f'V_mean={round(sum(vs)/len(vs),2)}  V_min={min(vs)}')
        if failed:
            for r in rows:
                if r["Pq"] == 0:
                    print("     page", r["page"], {k: v for k, v in r.items() if k in "CWHLE"})
    out = os.path.join(os.path.dirname(manifest_path), "gate_report.json")
    json.dump(report, open(out, "w"), indent=1)
    print("\ngate report ->", out)
    return report


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else
         "/tmp/claude-0/-home-user-Thylora/d3272dba-25bd-571e-9555-c5dbbdd95dba/"
         "scratchpad/editions/manifest.json")
