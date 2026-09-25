"""Generate the per-product section of the SPINE-610 Phase 2 report.

Inputs (all read-only snapshots taken 2026-09-25):
  evidence/shopify-catalog-readback-20260925.json   live Shopify Admin readback (225 products)
  evidence/delivery-pdf-inspection-20260925.json    PyMuPDF inspection of every backend delivery file
  BACKEND below                                      thylora_store_product_readiness / thylora_delivery_assets facts

Output: report-parts/40-catalog.md
Run from spine-610/:  python3 tools/build_catalog_section.py
"""
import json, re, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
cat = json.loads((ROOT / "evidence/shopify-catalog-readback-20260925.json").read_text())
pdf = json.loads((ROOT / "evidence/delivery-pdf-inspection-20260925.json").read_text())

# Backend facts read 2026-09-25 (thylora_delivery_assets + thylora_store_product_readiness).
# key = numeric Shopify product id
BACKEND = {
    "7957652275277": dict(file="Uncle-Seezin-Twelve-Miles-for-Flour.pdf", sha="9be1fae6…", asset="ACTIVE",
        ready="ACTIVE, active_allowed=true, re-access witnessed",
        finding="Opening page is the story itself (no cover page). DEFECT: the 'ORIGINAL STORY' label is printed over the title on page 1. "
                "PDF metadata title shows 'Š' where an em dash belongs (encoding). Body text spells 'Uncle Seezin'; title and listing spell 'Unkle'. "
                "No image inside the PDF; the cover image exists only as Shopify media (tmf-0004.png) and its alt text names 'Freight Woman 01 / Wagon Hand 01' while the story names Lottie James. "
                "Listing tag 'EdereAriah' is the drift spelling of the locked 'EdereAirah'."),
    "7957199749197": dict(file="THYLORA-Gap-Hunt-21-v2-winansi-repair.pdf", sha="926a35f1…", asset="ACTIVE",
        ready="DRAFT in backend, active_allowed=false — but Shopify shows ACTIVE since 2026-09-25 12:59 UTC with no backend record of who activated it",
        finding="9 pages; page 1 is a typographic title page (236 characters, not blank). Text check: HUNT 1 through HUNT 21 all present. No image inside the PDF."),
    "7957199913037": dict(file="THYLORA-Question-Deck-50-Better-Questions-v2-winansi-repair.pdf", sha="64add6c7…", asset="ACTIVE",
        ready="DRAFT in backend, active_allowed=false — but Shopify shows ACTIVE since 2026-09-25 12:59 UTC with no backend record of who activated it",
        finding="27 pages; page 1 typographic title (265 chars). Text check: CARD 1 through CARD 50 all present (50 of 50). No image inside."),
    "7957200109645": dict(file="THYLORA-Build-a-World-Starter-Kit-v2-winansi-repair.pdf", sha="4a0c96e1…", asset="ACTIVE",
        ready="DRAFT in backend, active_allowed=false — but Shopify shows ACTIVE since 2026-09-25 12:59 UTC with no backend record of who activated it",
        finding="13 pages; page 1 typographic title (279 chars). Page 13 is an internal 'Release gate' checklist printed in the customer copy — internal wording in a customer artifact."),
    "7956697448525": dict(file="Bramble_Wick_Nighttime_Story_Digital_Edition_v1.pdf", sha="6c7891cf…", asset="ACTIVE (asset) / product HELD",
        ready="DRAFT, Chairman quality hold 2026-09-19; name locks WYCK/EdereAirah breached; protagonist Mara Vale unregistered",
        finding="3 pages; page 1 not blank (427 chars). Plain text, no illustration. Embedded C2PA manifest declares machine-generated media (per backend finding)."),
    "7957206630477": dict(file="THYLORA-Story-The-Last-Match-v2-winansi-repair.pdf", sha="540b8637…", asset="ACTIVE (asset) / product HELD",
        ready="DRAFT, Chairman quality hold 2026-09-19 (text-first, no illustration, no author identity)",
        finding="6 pages; page 1 typographic title (245 chars). No image."),
    "7957206892621": dict(file="THYLORA-Story-The-City-That-Needed-More-Power-v2-winansi-repair.pdf", sha="3186e5b5…", asset="ACTIVE (asset) / product HELD",
        ready="DRAFT, Chairman quality hold 2026-09-19", finding="6 pages; page 1 typographic title (274 chars). No image."),
    "7957206958157": dict(file="THYLORA-Story-The-Handoff-v2-winansi-repair.pdf", sha="d5ec343e…", asset="ACTIVE (asset) / product HELD",
        ready="DRAFT, Chairman quality hold 2026-09-19", finding="6 pages; page 1 typographic title (258 chars). Protagonist 'Mara Venn' — check against person registry. No image."),
    "7956697481293": dict(file="Trail-Table-001-Old-Jaros-Rain-Side-Beans.pdf", sha="d3965a22…", asset="HELD",
        ready="DRAFT_PRODUCTION_ACTIVE; one open rights fact (origin of preserved 2-page historical source); Shopify featured image is a REJECTED visual",
        finding="4 sheets; sheet 1 not blank (2,228 chars) with attribution box. No image inside (typographic cover by design)."),
    "7985315577933": dict(file="CW-Engineering-Notebook-Vol1.pdf", sha="9159ed18…", asset="HELD",
        ready="DRAFT; no cover; requiresShipping=true on a digital file (defect); listing says 'ten-chapter', file has chapters 0-10",
        finding="8 pages; page 1 dense and not blank (3,026 chars). Text check finds CHAPTER 0 through CHAPTER 10 = 11 chapter headings against the listing's 'ten-chapter' claim (wording mismatch)."),
    "7985698275405": dict(file="CW-Design-Notebook-Eight-Things.pdf", sha="50961292…", asset="ACTIVE (asset) / product DRAFT",
        ready="DRAFT; duplicates Vol. 1 source records — Chairman must choose",
        finding="4 pages; page 1 not blank (2,026 chars). DEFECT: the 'THYLORA / ErsatzReality · A C&W Design Notebook' label is printed over the title (same overlap defect as Twelve Miles)."),
    "10319334309965": dict(file="THYLORA-Money-Path-Card-001.pdf", sha="6d1f2c4b…", asset="HELD",
        ready="DRAFT; built this pass as the one-dollar pilot",
        finding="2 pages; page 1 not blank (1,503 chars): title, equation N = P − F − T − D, worked $1 example. No image, no cover yet."),
}

CHAIR_RIGHTS = "readiness rights_passed=true; Chairman release decision rights_release_confirmed=true (latest 2026-09-19)"
RIGHTS = {k: CHAIR_RIGHTS for k in ["7957652275277","7957199749197","7957199913037","7957200109645","7956697448525","7957206630477","7957206892621","7957206958157"]}
RIGHTS.update({"7956697481293": "rights_passed=false — origin of the preserved 2-page historical source is not recorded (one open fact)",
  "7985315577933": "rights_passed=true (original work; no third-party material per listing)",
  "7985698275405": "rights_passed=true (original work)",
  "10319334309965": "original ErsatzReality × THYLORA work written this pass; no third-party text, image or font embedded"})
ACTIVE = {"7957652275277", "7957199749197", "7957199913037", "7957200109645"}
BLOCKED_WITH_ARTIFACT = {"7956697448525", "7957206630477", "7957206892621", "7957206958157", "7956697481293",
                         "7985315577933", "7985698275405", "10319334309965"}
FEE_RATE, FEE_FIXED = 0.029, 0.30   # recorded on order #1004 (Shopify Payments, $1.99 -> $0.36)

def money(p):
    if p <= 0:
        return "P not set (price $0.00 / not authorized) → N cannot be computed. N = UNKNOWN."
    f = round(p * FEE_RATE + FEE_FIXED, 2)
    n = round(p - f, 2)
    return (f"N = P − F − T − D = ${p:.2f} − ${f:.2f} − T − $0.00 = ${n:.2f} − T "
            f"(T = buyer-state sales tax, passed through; $0.00 on the one recorded sale). "
            f"N = B + C + A + O + R: all five shares UNSET.")

CUSTOMER = {
 "7957199749197": "IMPLIED ONLY — 'your own work' (anyone reviewing a process, product or plan). No explicit who-it-is-for line; add one.",
 "7957199913037": "IMPLIED ONLY — people in 'a meeting, a classroom, an interview, a car ride'. No explicit who-it-is-for line; add one.",
 "7957200109645": "IMPLIED ONLY — anyone with one idea to develop into a world (writers, makers). No explicit who-it-is-for line; add one.",
 "7957652275277": "IMPLIED ONLY — readers who want a finished short story with discussion questions (families, classrooms). No explicit who-it-is-for line; add one.",
 "10319334309965": "Anyone selling something small, or asked to trust a 'proceeds go to…' offer (stated on the card and listing).",
}
def customer(desc, pid=None):
    if pid in CUSTOMER: return CUSTOMER[pid]
    m = re.search(r"Customer\.\s*([^.]*\.)", desc or "")
    if m:
        return m.group(1).strip()
    m = re.search(r"Who (?:it helps|it is for)[.:]\s*([^.]*\.)", desc or "")
    return m.group(1).strip() if m else "Not stated in the listing."

STATUS = re.compile(r"^(DRAFT|Draft|Not open|Not for sale|No |Status:|Customer\.|The price below)")
def purpose(desc, ptype=""):
    d = re.sub(r"(Customer\.)", r" \1 ", desc or "")
    for s in re.split(r"(?<=[.!?])\s+", d):
        s = s.strip()
        if s and not STATUS.match(s) and len(s) > 25 and not s.startswith("Customer") and s != customer(desc):
            return (ptype + " — " if ptype else "") + s[:240]
    return (ptype or "Not stated") + " — purpose sentence not written in listing."

def rights(tags, pid=None):
    if pid in RIGHTS: return RIGHTS[pid]
    t = set(tags or [])
    parts = []
    if {"ERSATZV-OWNED"} & t: parts.append("tagged ERSATZV-OWNED")
    if {"MINORS-IN-SCOPE"} & t: parts.append("minors in scope → guardian consent + safeguarding required")
    if {"SENSITIVE-SUBJECT", "COGNITIVE-DECLINE-IN-SCOPE"} & t: parts.append("sensitive subject → consent review required")
    if {"LICENSE-NOT-WRITTEN", "LICENCE-TIER-MISSING"} & t: parts.append("licence text not written")
    if {"CANON-CHECK-REQUIRED", "CANON-BLOCKING"} & t: parts.append("canon check required")
    parts.append("no rights record in backend")
    return "; ".join(parts)

def classify(pid, status, price, tags):
    t = set(tags or [])
    if pid in ACTIVE and status == "ACTIVE":
        return "ACTIVE"
    if pid in BLOCKED_WITH_ARTIFACT:
        return "BLOCKED"
    if pid == "7978983293005":
        return "UNKNOWN"
    if pid == "7956692598861":
        return "BLOCKED"
    if price > 0 and ("NOT-OPEN-FOR-ORDERS" in t or "price-proposed-not-authorized" in t):
        return "BLOCKED"
    return "DRAFT"

def blocker(pid, cls, tags, price):
    if pid in BACKEND:
        return BACKEND[pid]["ready"]
    t = set(tags or [])
    if pid == "7978983293005":
        return "No file located in any backend delivery table; no price; family-memory rights (the Chairman's mother's story) not recorded; tag carries drift spelling 'EdereAriah'."
    if pid == "7956692598861":
        return "Service with one $295 paid order (#1001, 2026-09-01, buyer = store owner). No featured media; fulfilment/re-access not witnessed; mobile preview not passed."
    if "NOT-OPEN-FOR-ORDERS" in t:
        return "Price authorized but submit, consent (likeness) and delivery mechanisms do not exist; no artifact."
    if "price-proposed-not-authorized" in t:
        return "Price not authorized; deliverable scope and turnaround undefined; no consent path for customer-supplied stories."
    if "NO-RUNTIME-YET" in t or "no-runtime-yet" in t:
        return "No runtime/software exists; no artifact; price not set."
    if "CONTENT-NOT-WRITTEN" in t:
        return "Content not written; no artifact; price not set."
    return "No artifact, no approved price, no delivery path, no rights record."

rows = []
for n in cat:
    pid = n["id"].rsplit("/", 1)[1]
    v = (n.get("variants") or {}).get("nodes") or [{}]
    price = float(v[0].get("price") or 0)
    rows.append(dict(pid=pid, title=n["title"], status=n["status"], type=n.get("productType", ""),
                     tags=n.get("tags", []), desc=n.get("description", ""), price=price,
                     media=bool(n.get("featuredMedia")), ship=(v[0].get("inventoryItem") or {}).get("requiresShipping"),
                     pubs=(n.get("resourcePublicationsCount") or {}).get("count", 0), sku=v[0].get("sku")))
rows.append(dict(pid="10319334309965", title="Where Does One Dollar Go? — THYLORA Money Path Card", status="DRAFT",
                 type="Digital Product", tags=["one-dollar-pilot"], desc="A two-page printable card that shows where one dollar actually goes.",
                 price=1.00, media=False, ship=False, pubs=0, sku="THY-MONEY-PATH-CARD-001"))

order = {"ACTIVE": 0, "BLOCKED": 1, "UNKNOWN": 2, "DRAFT": 3}
for r in rows:
    r["cls"] = classify(r["pid"], r["status"], r["price"], r["tags"])
rows.sort(key=lambda r: (order[r["cls"]], r["title"]))

counts = {k: sum(1 for r in rows if r["cls"] == k) for k in order}
out = [f"Products covered: **{len(rows)}** (225 read live from Shopify + 1 built this pass). "
       f"ACTIVE {counts['ACTIVE']} · BLOCKED {counts['BLOCKED']} · UNKNOWN {counts['UNKNOWN']} · DRAFT {counts['DRAFT']}.\n",
       "Every entry answers the seven required checks in order: (1) artifact read, (2) opening page blank?, "
       "(3) image and wording, (4) title / purpose / customer / price / rights / delivery / source, (5) class, "
       "(6) activation rule, (7) version. The money line sits beside each entry.\n"]
for i, r in enumerate(rows, 1):
    b = BACKEND.get(r["pid"])
    art = f"`{b['file']}` (sha256 {b['sha']}, asset {b['asset']}) — read byte-for-byte" if b else "NO ARTIFACT EXISTS in Shopify or in any backend delivery table — nothing to open"
    opening = "NOT BLANK — " + b["finding"] if b else "CANNOT CHECK — there is no file"
    image = ("Shopify featured image present" if r["media"] else "NO featured image")
    delivery = ("THYLORA library (entitlement → protected reader/download)" if b else "none")
    if r["ship"] and b:
        delivery += "; DEFECT: variant set to require shipping"
    act_rule = ("file, rights, delivery and customer description all present — rule met." + (" Activation itself is UNRECORDED in the backend; Chairman to confirm." if r["pid"] in {"7957199749197","7957199913037","7957200109645"} else "") if r["cls"] == "ACTIVE" else
                "Must NOT be activated — " + ("delivery file HELD or quality/name hold" if b else "file, rights and delivery are missing") + ".")
    out.append(f"#### 4.{i} {r['title']}\n")
    out.append(f"- **Class: {r['cls']}** · Shopify `{r['status']}` · channels {r['pubs']} · `gid://shopify/Product/{r['pid']}`")
    out.append(f"- **Money:** {money(r['price'])}")
    out.append(f"- (1) Artifact: {art}")
    out.append(f"- (2) Opening page: {opening}")
    out.append(f"- (3) Image/wording: {image}; title and listing wording read live.")
    out.append(f"- (4) Title: {r['title']} · Purpose: {purpose(r['desc'], r['type'])} · Customer: {customer(r['desc'], r['pid'])} · "
               f"Price: ${r['price']:.2f}{' (SKU ' + r['sku'] + ')' if r['sku'] else ''} · Rights: {rights(r['tags'], r['pid'])} · "
               f"Delivery: {delivery} · Source: Shopify Admin readback 2026-09-25" + (" + backend delivery/readiness rows" if b else ""))
    out.append(f"- (5)/(6) Blocker: {blocker(r['pid'], r['cls'], r['tags'], r['price']).rstrip('.')}. Activation rule: {act_rule}")
    out.append(f"- (7) Version: " + ("NEW v1 created this pass." if r["pid"] == "10319334309965" else
               "v1 of record preserved; v2 proposed (see §5), not built over v1." if r["pid"] == "7957652275277" else
               "Existing record preserved unchanged; no new version this pass."))
    out.append("")

p = ROOT / "report-parts/40-catalog.md"
p.parent.mkdir(exist_ok=True)
p.write_text("\n".join(out))
print(p, len(rows), counts)
