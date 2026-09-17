import json, hashlib, collections

LOCK_MD = "docs/ERN-SPORTS-EDITION-001-LOCK.md"
LOCK_JSON = "docs/ERN-SPORTS-EDITION-001-LOCK.json"
PLATE = "docs/reference/ERN-SPORTS-001-preview-plate.png"

def sha(p):
    return hashlib.sha256(open(p, "rb").read()).hexdigest()

L = json.load(open(LOCK_JSON))
locks = L["locks"]
bp = L["field_blueprint"]

# Band boundaries measured from the plate (1112 x 1415) by row-luminance transition scan.
H = 1415.0
BANDS = [
    ("preview_rail",     0,   34),
    ("masthead",        34,  206),
    ("hero",           206,  806),
    ("data_band",      807,  892),
    ("editorial_row_1",892, 1085),
    ("editorial_row_2",1085,1229),
    ("footer_strip",  1230, 1327),
    ("legal_rail",    1328, 1415),
]
def nb(a, b): return {"y0": round(a/H, 4), "y1": round(b/H, 4)}
bands = collections.OrderedDict((n, nb(a, b)) for n, a, b in BANDS)

# Field panel: left edge measured at x=385/1112 by green-dominance column scan;
# equals the 0.34 outer bound of the LOCK-01 presenter zone.
PANEL = {"x0": 0.3462, "x1": 1.0000, "y0": bands["hero"]["y0"], "y1": bands["hero"]["y1"]}
SX = PANEL["x1"] - PANEL["x0"]
SY = PANEL["y1"] - PANEL["y0"]

def to_page(px, py):
    return {"x": round(PANEL["x0"] + (px/100.0)*SX, 4),
            "y": round(PANEL["y0"] + (py/100.0)*SY, 4)}

# Map every locked blueprint element into page-normalized space, verbatim on motion/label.
elements = []
for e in bp["elements"]:
    rec = {
        "id": e["id"],
        "panel_local": {"x": e["x"], "y": e["y"]},
        "page_normalized": to_page(e["x"], e["y"]),
        "motion": e.get("motion"),
        "label": e.get("label"),
    }
    if "width" in e:
        rec["panel_local"]["width"] = e["width"]
        rec["panel_local"]["height"] = e["height"]
        rec["page_normalized"]["width"] = round(e["width"]/100.0*SX, 4)
        rec["page_normalized"]["height"] = round(e["height"]/100.0*SY, 4)
    elements.append(rec)

# Flat exclusion list: every prohibition already carried by the lock, nothing added.
exclusions = []
exclusions += ["no " + p for p in L["prohibited_globally"]]
exclusions += ["pendant must not be a " + p for p in locks["LOCK-02"]["prohibited"]]
exclusions += ["no " + p for p in locks["LOCK-07"]["prohibited"]]
exclusions += ["no " + p for p in locks["LOCK-06"]["excluded"]]
exclusions += ["no " + p for p in locks["LOCK-11"]["prohibited"]]
exclusions += ["quarterback must not be " + p for p in locks["LOCK-05"]["qb_prohibited"]]
exclusions += [
    "no defender jersey numbered " + ", ".join(locks["LOCK-06"]["defender_numbers_forbidden"]),
    "no cup slogan or scene other than LOCK-04 side A or side B",
    "no mug, presenter, arm or desk element crossing the field panel boundary",
    "no cropping or occlusion of the tablet mark",
    "no clipped yard numerals",
    "no statistic other than the LOCK-12 documented set",
    "no removal of the chairman preview rail",
    "no dropped, blurred or non-square QR block",
]

packet = collections.OrderedDict()
packet["packet_id"] = "ERN-SPORTS-001-RENDER-PACKET-001"
packet["packet_type"] = "render_packet"
packet["packet_status"] = "READY_FOR_VISUAL_WORKROOM"
packet["lock_id"] = L["lock_id"]
packet["lock_authority"] = "This packet executes ERN-SPORTS-LOCK-001. It adds no design decision. Where packet and lock disagree, the lock governs."
packet["edition_id"] = L["edition_id"]
packet["edition_label"] = L["edition_label"]
packet["edition_date"] = L["edition_date"]
packet["lane"] = L["lane"]
packet["lane_action"] = L["lane_action"]
packet["render_target"] = "separate visual workroom"
packet["publication_state"] = L["state"]["publication"]
packet["preview_rail"] = L["state"]["preview_rail"]
packet["derived_from"] = [
    {"file": LOCK_JSON, "sha256": sha(LOCK_JSON), "role": "locked values, copied verbatim"},
    {"file": LOCK_MD, "sha256": sha(LOCK_MD), "role": "lock sheet, blueprint, continuity rules, defects, prompt"},
    {"file": PLATE, "sha256": sha(PLATE), "role": "measurement source for bands, panel edge and colour tokens; defect source"},
]
packet["prohibited_globally"] = L["prohibited_globally"]

packet["canvas"] = {
    "aspect_ratio": "1112:1415",
    "aspect_decimal": 0.7859,
    "orientation": "portrait",
    "reference_plate_pixels": {"width": 1112, "height": 1415},
    "render_target_pixels": {"width": 2400, "height": 3054},
    "minimum_pixels": {"width": 1112, "height": 1415},
    "coordinate_space": "page-normalized, x 0.0 left to 1.0 right, y 0.0 top to 1.0 bottom; valid at any canvas of this aspect",
    "bleed": "full bleed, no page margin; hero and footer imagery run to the trim edge",
}

packet["band_layout"] = {
    "derivation": "row-luminance transition scan of the reference plate at 1112x1415",
    "order_is_locked_by": "LOCK-10",
    "inter_band_gaps": "sub-half-percent gaps between consecutive bands are the hairline gold and violet separating rules; no page ground shows between bands",
    "bands": bands,
}

packet["presenter"] = {
    "lock": "LOCK-01",
    "identity": locks["LOCK-01"]["value"],
    "appearance_continuity": "long dark-brown wavy hair with warm lighter highlights past the shoulder; warm mid-brown skin; defined brows; direct address to camera; violet structured blazer over a dark navy top; seated at a dark desk",
    "framing": locks["LOCK-01"]["framing"],
    "zone_page_normalized": {"x0": 0.0000, "x1": 0.3462, "y0": bands["hero"]["y0"], "y1": bands["hero"]["y1"]},
    "zone_rule": "left 30-34 percent of the hero band is reserved to the presenter; no field element enters it and no presenter element crosses the passing window",
    "crop": "chest-up",
    "attribution_lines": locks["LOCK-01"]["attribution"],
    "necklace": {
        "lock": "LOCK-02",
        "artwork": locks["LOCK-02"]["value"],
        "scale": locks["LOCK-02"]["scale"],
        "count": locks["LOCK-02"]["count"],
        "chain": "fine silver-tone chain",
        "metal": "gold/brass mark",
        "geometry": "circular lens, handle descending to the lower right, brimmed-hat figure read inside the lens; identical geometry to the masthead mark, no rotation, no mirror, no restyle",
        "seat_page_normalized": {"x": 0.155, "y": 0.372},
        "redesign_permitted": locks["LOCK-02"]["redesign_permitted"],
        "prohibited": locks["LOCK-02"]["prohibited"],
        "zoom_legibility_requirement": "hat figure and lens-and-handle silhouette both legible when the pendant is cropped and upscaled",
    },
    "tablet": {
        "lock": "LOCK-03",
        "artwork": locks["LOCK-03"]["value"],
        "integrity": locks["LOCK-03"]["integrity"],
        "hold": "near hand, screen away from camera",
        "treatment": "flat gold on dark slate shell; no glow, no emboss, no gradient invention",
        "seat_page_normalized": {"x": 0.105, "y": 0.495},
    },
    "cup": {
        "lock": "LOCK-04",
        "side_a": locks["LOCK-04"]["side_a"],
        "side_b": locks["LOCK-04"]["side_b"],
        "rule": locks["LOCK-04"]["rule"],
        "placement": locks["LOCK-04"]["placement"],
        "visible_side_this_render": "SIDE_B",
        "visible_side_text": "TRUTH IN CONTEXT BUILDS A DEEPER TOMORROW",
        "vessel": "matte black mug, gold artwork",
        "seat_page_normalized": {"x": 0.295, "y": 0.512},
        "boundary_constraint": "mug silhouette must terminate left of x=0.3462",
    },
}

packet["field_panel"] = {
    "locks": ["LOCK-05", "LOCK-06"],
    "bounds_page_normalized": PANEL,
    "panel_edge_derivation": "green-dominance column scan; left edge at x=385/1112=0.3462, coincident with the LOCK-01 presenter zone outer bound",
    "offense_direction": locks["LOCK-05"]["offense_direction"],
    "camera": locks["LOCK-05"]["camera"],
    "qb_orientation": locks["LOCK-05"]["qb_orientation"],
    "qb_prohibited": locks["LOCK-05"]["qb_prohibited"],
    "yard_numbers": {
        "sequence": locks["LOCK-05"]["yard_numbers"],
        "orientation": "upright for the reader",
        "integrity": "complete and uncut, fully inside the panel",
        "baseline_panel_local_y": 96,
        "baseline_page_normalized_y": to_page(0, 96)["y"],
    },
    "coordinate_mapping": {
        "space": bp["coordinate_space"],
        "page_x": "0.3462 + (panel_x / 100) * 0.6538",
        "page_y": str(round(PANEL["y0"], 4)) + " + (panel_y / 100) * " + str(round(SY, 4)),
    },
    "cast": locks["LOCK-06"]["cast"],
    "elements": elements,
    "counts": {
        "max_field_human_figures": locks["LOCK-06"]["max_field_figures"],
        "callout_boxes": locks["LOCK-06"]["callout_boxes"],
        "route_arrows": locks["LOCK-06"]["arrows"],
        "passing_windows": locks["LOCK-06"]["passing_windows"],
        "defenders_min": 4,
        "defenders_max": 6,
    },
    "defender_numbers_forbidden": locks["LOCK-06"]["defender_numbers_forbidden"],
    "defender_posture": "hips open, eyes to the quarterback or trailing an assigned receiver; plain jersey numbers permitted; no callout boxes",
    "line_of_scrimmage": "carried by field markings and the coverage front only; no rendered offensive line",
    "passing_window_placement_rule": "in the gap between the underneath linebacker (44,66) and the nickel (70,54); must read as an opening, never as an overlay on a defender",
    "arrow_style": "thin gold, one per named receiver, single-headed, never crossing a callout box",
    "callout_style": "dark fill, hairline gold border, gold and white caps, placed clear of heads, jersey numbers and the passing-window ellipse",
    "bands": bp["bands"],
    "empty_turf_target": bp["empty_turf_target"],
    "depth_of_field": "deepest sharpness on QB #8 and the passing window; crowd band soft",
    "team_colour_read": "purple offense, white opponent",
    "excluded": locks["LOCK-06"]["excluded"],
}

packet["imagery_style"] = {
    "lock": "LOCK-07",
    "medium": locks["LOCK-07"]["value"],
    "surface": "visible brushwork; aged-newsprint tooth in the paper areas; film-grain warmth in the hero band",
    "light": "stadium twilight; cool blue dusk sky, warm gold rim light on presenter and field",
    "palette_names": locks["LOCK-07"]["palette"],
    "style_reference_use": locks["LOCK-07"]["style_reference_use"],
    "prohibited": locks["LOCK-07"]["prohibited"],
    "colour_tokens": {
        "derivation": "masked-median sampling of the reference plate; supplied so the renderer matches the established palette rather than re-deriving it",
        "page_ground": "#F8F7FA",
        "headline_ink": "#040403",
        "violet_headline": "#32067D",
        "violet_rail": "#332A98",
        "gold_mark": "#AC883C",
        "gold_accent": "#C4B65C",
        "gold_highlight": "#FFE350",
        "band_ink_ground": "#14161D",
        "turf_green": "#657854",
        "stadium_dusk_violet": "#4C3F9F",
        "stadium_sky_deep": "#1C2683",
    },
    "dominance_rule": "violet, gold and stadium blue-green dominate; brown is never dominant",
}

packet["format_family"] = {
    "locks": ["LOCK-09", "LOCK-10"],
    "redesign_permitted": locks["LOCK-09"]["redesign_permitted"],
    "band_order": locks["LOCK-10"]["band_order"],
    "structural_components": locks["LOCK-10"]["structural"],
    "typography": {
        "nameplate": "engraved serif italic, two-tone weight, full measure",
        "headline_primary": "heavy condensed caps, headline_ink",
        "headline_secondary": "heavy condensed caps, violet_headline",
        "deck": "serif, sentence case",
        "labels_and_rails": "letterspaced sans caps",
        "data_band_figures": "heavy condensed caps, page_ground on band_ink_ground",
        "rules": "hairline gold and violet",
    },
}

packet["text_elements"] = [
    {"band": "preview_rail", "align": "centre", "text": "CHAIRMAN PREVIEW — NOT FOR PUBLICATION"},
    {"band": "masthead", "align": "left", "role": "mark_tagline", "text": "REAL GAMES. / REAL QUESTIONS. / A MORE INFORMED WORLD."},
    {"band": "masthead", "align": "centre", "role": "nameplate", "text": "ErsatzReality News"},
    {"band": "masthead", "align": "centre", "role": "subline", "text": "Earth Desk • Sports"},
    {"band": "masthead", "align": "centre", "role": "edition_line", "text": "Morning Edition 001    |    THY-RAVENS-PAPER-20260917-001    |    Sep 17, 2026"},
    {"band": "masthead", "align": "right", "role": "category_rail", "text": "PEOPLE / SPORTS / CULTURE / ANALYSIS / A DEEPER TOMORROW"},
    {"band": "hero", "align": "centre", "role": "headline_primary", "text": "BALTIMORE WON BIG."},
    {"band": "hero", "align": "centre", "role": "headline_secondary", "text": "NOW SHOW US THE DEPTH."},
    {"band": "hero", "align": "centre", "role": "deck", "text": "Flowers is day-to-day. Lane is on injured reserve. Sunday turns Baltimore's receiver depth into a live test."},
    {"band": "hero", "align": "left", "role": "pull_quote", "text": "“Same game. Deeper questions.”"},
    {"band": "hero", "align": "left", "role": "attribution", "text": "— NEYRA SOL / SPORTS DESK"},
    {"band": "hero", "align": "right", "role": "micro_copy", "text": "A BRIGHTER TOMORROW"},
    {"band": "hero", "align": "right", "role": "micro_copy", "text": "DIFFERENT PLAYERS. / MORE PATHS. / A STRONGER TOMORROW."},
    {"band": "hero", "align": "centre", "role": "field_micro_copy", "text": "OPPORTUNITY LIVES EVERYWHERE"},
    {"band": "hero", "align": "centre", "role": "stadium_board", "text": "BALTIMORE BUILDS DEEPER"},
    {"band": "hero", "align": "left", "role": "cup_side_b", "text": "TRUTH IN CONTEXT BUILDS A DEEPER TOMORROW"},
    {"band": "hero", "align": "callout", "role": "field_label", "text": "WR #4 GO ROUTE"},
    {"band": "hero", "align": "callout", "role": "field_label", "text": "WR #7 CURL / SIT"},
    {"band": "hero", "align": "callout", "role": "field_label", "text": "WR #3 OUT ROUTE"},
    {"band": "hero", "align": "callout", "role": "field_label", "text": "RB #22 SLANT"},
    {"band": "hero", "align": "callout", "role": "field_label", "text": "PASSING WINDOW"},
]

packet["data_band"] = {
    "lock": "LOCK-12",
    "cells": [
        {"index": 1, "figure": "41–23", "caption": "THE RESULT"},
        {"index": 2, "figure": "324", "caption": "JACKSON PASSING YARDS"},
        {"index": 3, "figure": "144 / 3 TD", "caption": "HENRY RUSHING"},
        {"index": 4, "figure": "150", "caption": "FLOWERS RECEIVING YARDS BEFORE EXIT"},
        {"index": 5, "figure": "LANE — IR", "caption": "THE DEPTH CHANGE"},
        {"index": 6, "figure": "SUN · 1PM", "caption": "THE NEXT TEST"},
    ],
    "rule": locks["LOCK-12"]["rule"],
    "documented_set": locks["LOCK-12"]["documented"],
    "cell_count": 6,
    "layout": "six equal cells across the band, gold hairline dividers",
}

packet["editorial_row_1"] = {
    "cells": [
        {"role": "central_question", "heading": "THE CENTRAL QUESTION",
         "body": "Did Baltimore's Week 1 explosion prove the offense is deep, or did it show how much one explosive receiver changes everything?"},
        {"role": "three_branch_conditional",
         "heading": "IF FLOWERS CANNOT CARRY THE SAME WORKLOAD, WHERE DO THE OPPORTUNITIES GO?",
         "branches": [
            {"state": "FLOWERS AVAILABLE FULL WORKLOAD", "signal": "green", "question": "Does the Week 1 structure repeat?"},
            {"state": "FLOWERS LIMITED", "signal": "amber", "question": "Which routes and targets are redistributed?"},
            {"state": "FLOWERS OUT", "signal": "red", "question": "Who inherits the high-value opportunities?"}]},
        {"role": "subject_inspect_card", "heading": "BATEMAN",
         "statement": "WEEK 1 DID NOT ANSWER THE BATEMAN QUESTION. WEEK 2 MIGHT.",
         "inspect_chain": ["EARLY TARGET", "SEPARATION", "THROW LOCATION", "CATCH RESULT", "NEXT TARGET", "DEFENSIVE RESPONSE"]},
    ]
}

packet["editorial_row_2"] = {
    "cells": [
        {"role": "path_to_win", "heading": "PATH TO A BALTIMORE WIN", "signal": "green", "glyph": "tick", "items": [
            "Preserve explosive spacing",
            "Avoid drive-killing penalties",
            "Maintain run efficiency",
            "Redistribute receiver opportunities if Flowers is limited",
            "Force New Orleans to defend multiple answers"]},
        {"role": "path_to_loss", "heading": "PATH TO A BALTIMORE LOSS / FAILURE", "signal": "red", "glyph": "cross", "items": [
            "Flowers' absence collapses explosive receiver production",
            "Penalties erase high-value plays",
            "Receiver depth fails to replace targets",
            "New Orleans compresses the field",
            "Baltimore becomes dependent on one offensive answer"]},
        {"role": "information_classification", "heading": "INFORMATION CLASSIFICATION", "columns": [
            {"name": "DOCUMENTED", "items": ["game results", "player statistics", "injury/roster status", "game film evidence"]},
            {"name": "INFERENCE / ANALYSIS", "items": ["tactical evaluation", "projected opportunities", "matchup analysis", "reasonable projections"]},
            {"name": "UNKNOWN", "items": ["opponent game plan", "Flowers' availability", "actual target distribution", "defensive adjustments", "any numerical estimate not yet supported"]}]},
    ]
}

packet["footer"] = {
    "lock": "LOCK-08",
    "treatment": locks["LOCK-08"]["value"],
    "cells": locks["LOCK-08"]["cells"],
    "cell_order_is_locked": True,
    "qr_block": {"shape": "square", "edges": "sharp", "contrast": "high", "frame": "hairline gold rule", "state": "always present, always crisp"},
    "legal_rail": locks["LOCK-08"]["legal_rail"],
    "legal_rail_text": {
        "left": "THY-RAVENS-PAPER-20260917-001    |    SEP 17, 2026    |    ER-NEWS-001",
        "centre": "© 2026 ERSATZREALITY. ALL RIGHTS RESERVED. / ORIGINAL ILLUSTRATION. NO TEAM LOGOS, NO PLAYER PHOTOS.",
        "right": "GAMES INFORM TODAY. / BETTER QUESTIONS BUILD TOMORROW.",
    },
}

packet["rights"] = {
    "lock": "LOCK-11",
    "value": locks["LOCK-11"]["value"],
    "prohibited": locks["LOCK-11"]["prohibited"],
    "jersey_numbers": "invented editorial numerals",
}

packet["mark_system"] = {
    "locks": ["LOCK-02", "LOCK-03", "LOCK-04", "LOCK-09"],
    "single_mark": "hat and magnifying glass",
    "scales": ["masthead", "tablet rear", "necklace pendant", "cup side A"],
    "geometry_rule": "identical geometry at every scale; never redesigned, simplified, restyled or re-lettered per placement",
    "new_mark_permitted": False,
}

packet["exclusions"] = exclusions

packet["mandatory_defect_corrections"] = [
    {"id": d["id"], "observed_defect": d["defect"], "lock": d["lock"], "status": "MUST_BE_CORRECTED"}
    for d in L["defects"]["observed"]
]
packet["pre_empted_risk_defects"] = L["defects"]["risk"]

packet["acceptance_criteria"] = [
    {"id": "AC-01", "check": "pendant_is_masthead_mark", "assert": True, "method": "crop pendant, upscale, confirm hat figure plus lens-and-handle silhouette", "defect": "D-01", "lock": "LOCK-02"},
    {"id": "AC-02", "check": "qb_orientation", "assert": "three_quarter_side_facing_right", "method": "face-side, jawline and throwing arm visible; jersey 8 legible; not rear, not reversed", "defect": "D-02", "lock": "LOCK-05"},
    {"id": "AC-03", "check": "field_human_figure_count", "assert": "<= 11", "method": "count all human figures inside the field panel", "defect": "D-03", "lock": "LOCK-06"},
    {"id": "AC-04", "check": "officials_present", "assert": False, "method": "no striped official anywhere in the panel", "defect": "D-03", "lock": "LOCK-06"},
    {"id": "AC-05", "check": "numbered_offensive_line_present", "assert": False, "method": "no individually numbered linemen, no blocking or collision clusters", "defect": "D-03", "lock": "LOCK-06"},
    {"id": "AC-06", "check": "all_defenders_in_coverage", "assert": True, "method": "every white jersey shows coverage posture, none engaged in a block", "defect": "D-04", "lock": "LOCK-06"},
    {"id": "AC-07", "check": "yard_number_sequence", "assert": ["30", "40", "50", "40"], "method": "sequence complete, upright, uncut, inside the panel", "defect": "D-05", "lock": "LOCK-05"},
    {"id": "AC-08", "check": "telestration_rings_present", "assert": False, "method": "no spotlight or tracking rings beneath any player", "defect": "D-06", "lock": "LOCK-06"},
    {"id": "AC-09", "check": "mug_intersects_field_panel", "assert": False, "method": "mug silhouette terminates left of x=0.3462", "defect": "D-07", "lock": "LOCK-04"},
    {"id": "AC-10", "check": "duplicate_or_ambiguous_jersey_numerals", "assert": False, "method": "one #8 only; no offensive numeral repeated; no defender numbered 3, 4, 7, 8 or 22", "defect": "D-08", "lock": "LOCK-06"},
    {"id": "AC-11", "check": "cup_visible_side", "assert": "SIDE_B", "method": "visible face matches the declared side verbatim", "defect": "D-09", "lock": "LOCK-04"},
    {"id": "AC-12", "check": "callout_box_count", "assert": 5, "method": "four route labels plus one passing-window label", "lock": "LOCK-06"},
    {"id": "AC-13", "check": "route_arrow_count", "assert": 4, "method": "one single-headed arrow per named receiver", "lock": "LOCK-06"},
    {"id": "AC-14", "check": "passing_window_count", "assert": 1, "method": "one ellipse, sitting in the linebacker-nickel gap, reading as an opening", "lock": "LOCK-06"},
    {"id": "AC-15", "check": "offense_direction", "assert": "left_to_right", "method": "cover the labels; a reader can still state the direction of play", "lock": "LOCK-05"},
    {"id": "AC-16", "check": "tablet_mark_whole_and_uncropped", "assert": True, "method": "full mark plus wordmark visible, unoccluded by hand, frame or desk", "lock": "LOCK-03"},
    {"id": "AC-17", "check": "presenter_count", "assert": 1, "method": "Neyra Sol only; no co-anchor, no second figure in the presenter zone", "lock": "LOCK-01"},
    {"id": "AC-18", "check": "presenter_reads_as_illustration", "assert": True, "method": "no photoreal or photographic face rendering", "defect": "D-10", "lock": "LOCK-07"},
    {"id": "AC-19", "check": "brown_dominant", "assert": False, "method": "dominant hues are violet, gold and stadium blue-green", "defect": "D-11", "lock": "LOCK-07"},
    {"id": "AC-20", "check": "footer_cells_in_order", "assert": 3, "method": "QR cell left, promo panel centre, kicker and category list right", "defect": "D-17", "lock": "LOCK-08"},
    {"id": "AC-21", "check": "qr_block_crisp_and_square", "assert": True, "method": "sharp-edged, high contrast, hairline gold frame", "defect": "D-17", "lock": "LOCK-08"},
    {"id": "AC-22", "check": "rights_line_present", "assert": True, "method": "ORIGINAL ILLUSTRATION. NO TEAM LOGOS, NO PLAYER PHOTOS. present verbatim in the legal rail", "lock": "LOCK-11"},
    {"id": "AC-23", "check": "real_team_league_or_player_marks_present", "assert": False, "method": "no reproduced marks, no player photograph or likeness", "lock": "LOCK-11"},
    {"id": "AC-24", "check": "data_band_figures_match_lock", "assert": locks["LOCK-12"]["documented"], "method": "six cells, figures identical to the locked set, nothing added", "defect": "D-19", "lock": "LOCK-12"},
    {"id": "AC-25", "check": "band_order_matches_lock", "assert": locks["LOCK-10"]["band_order"], "method": "seven bands in locked order", "lock": "LOCK-10"},
    {"id": "AC-26", "check": "structural_components_present", "assert": locks["LOCK-10"]["structural"], "method": "three-branch conditional and three-column classification both present", "lock": "LOCK-10"},
    {"id": "AC-27", "check": "nameplate_unchanged", "assert": True, "method": "nameplate, subline and rails match LOCK-09; no new format family", "defect": "D-16", "lock": "LOCK-09"},
    {"id": "AC-28", "check": "preview_rail_present", "assert": True, "method": "CHAIRMAN PREVIEW — NOT FOR PUBLICATION present in the top rail", "defect": "D-22", "lock": "CR-15"},
]

packet["reference_file_requirements"] = {
    "gate": "The visual workroom does not render until every REQUIRED file below is present at its stated path and registered in this packet.",
    "files": [
        {"ref": "REF-01", "path": PLATE, "status": "PRESENT",
         "sha256": sha(PLATE), "role": "Edition 001 chairman-preview plate",
         "use": "composition, band and palette continuity; source of the nine observed defects",
         "authority": "continuity reference only — it is NOT authority for the necklace, the quarterback orientation, the field cast or the defender posture, all of which it renders defectively"},
        {"ref": "REF-02", "path": "docs/reference/ERN-MARK-MASTER.png", "status": "REQUIRED_MISSING",
         "role": "master hat-and-magnifier mark, clean, largest available resolution, transparent ground",
         "use": "single source for all four mark scales: masthead, tablet rear, necklace pendant, cup side A",
         "blocking": True,
         "reason": "LOCK-02 and CR-02 require identical mark geometry at every scale; without the master the pendant will be re-invented, which is defect D-01"},
        {"ref": "REF-03", "path": "docs/reference/ERN-NECKLACE-APPROVED.png", "status": "REQUIRED_MISSING",
         "role": "the approved necklace plate — the preferred second image",
         "use": "pendant size, chain gauge, seat height and metal finish",
         "blocking": True,
         "reason": "named by the Chairman as the only approved necklace source; the attached plate carries the wrong pendant"},
        {"ref": "REF-04", "path": "docs/reference/ERN-FOOTER-APPROVED.png", "status": "REQUIRED_MISSING",
         "role": "the preferred footer strip and QR treatment — the preferred first image",
         "use": "footer cell proportions, QR block scale and rule weights",
         "blocking": True,
         "reason": "LOCK-08 is presently written from the footer visible in REF-01; if the preferred first image differs, the lock is reissued as ERN-SPORTS-LOCK-002 before render"},
        {"ref": "REF-05", "path": "docs/reference/ERN-OLDWORLD-STYLE.png", "status": "REQUIRED_MISSING",
         "role": "the uploaded old-world image",
         "use": "STYLE VOCABULARY ONLY — painterly handling, texture, lamplight warmth",
         "blocking": False,
         "reason": "LOCK-07: never content, never composited, never permitted to set the colour cast",
         "constraint": "if supplied, it enters the render as handling reference only; if absent, the render proceeds on the LOCK-07 style description and the measured colour tokens"},
        {"ref": "REF-06", "path": "docs/reference/ERN-NEYRA-SOL-CONTINUITY.png", "status": "RECOMMENDED_MISSING",
         "role": "correspondent continuity plate for Neyra Sol",
         "use": "face, hair and wardrobe continuity across editions",
         "blocking": False,
         "reason": "CR-01; REF-01 currently carries her likeness and can serve until a dedicated plate exists"},
    ],
    "on_missing_blocking_file": "Hold the render. Report the missing ref. Do not substitute, do not approximate, do not redesign the affected element.",
    "on_reference_conflict": "If an approved plate contradicts a locked value, stop and reissue as ERN-SPORTS-LOCK-002. Never edit a locked rule in place, and never let a reference silently override the lock.",
    "versioning": "CR-17 — reference plates are versioned, not silently replaced.",
}

packet["render_instruction_source"] = {
    "prompt_text": LOCK_MD + " section 5.1",
    "exclusion_list": LOCK_MD + " section 5.2",
    "pre_render_checklist": LOCK_MD + " section 5.3",
    "post_render_test": LOCK_MD + " section 5.4",
    "rule": "The visual workroom renders from section 5.1 verbatim, carrying section 5.2, and is accepted only against the acceptance_criteria in this packet.",
}

packet["packet_rule"] = (
    "ERN-SPORTS-001-RENDER-PACKET-001 is an execution packet for ERN-SPORTS-LOCK-001. It introduces no new design, "
    "loosens no lock, and alters neither the correspondent, the necklace, the tablet mark, the cup rule, the field "
    "direction, the player set, the routes, the footer, the six data figures nor the format family. Placements, colour "
    "tokens and band boundaries are measured from the registered reference plate. Any change to a locked value requires "
    "ERN-SPORTS-LOCK-002 and a reissued packet."
)

out = "docs/ERN-SPORTS-001-RENDER-PACKET-001.json"
with open(out, "w") as f:
    json.dump(packet, f, indent=2, ensure_ascii=False)
    f.write("\n")

# ---- consistency assertions: the packet must not drift from the lock ----
P = json.load(open(out))
assert P["packet_id"] == "ERN-SPORTS-001-RENDER-PACKET-001"
assert P["lock_id"] == L["lock_id"] == "ERN-SPORTS-LOCK-001"
ids = [e["id"] for e in P["field_panel"]["elements"]]
assert ids == [e["id"] for e in bp["elements"]], "field cast drifted"
assert len(ids) == 11
assert P["field_panel"]["offense_direction"] == "left_to_right"
assert P["field_panel"]["counts"]["callout_boxes"] == 5
assert P["field_panel"]["counts"]["route_arrows"] == 4
assert P["field_panel"]["counts"]["passing_windows"] == 1
assert P["field_panel"]["counts"]["max_field_human_figures"] == 11
assert P["presenter"]["necklace"]["redesign_permitted"] is False
assert P["format_family"]["redesign_permitted"] is False
assert P["data_band"]["documented_set"] == locks["LOCK-12"]["documented"]
assert len(P["data_band"]["cells"]) == 6
assert len(P["footer"]["cells"]) == 3
assert len(P["mandatory_defect_corrections"]) == 9
assert len(P["pre_empted_risk_defects"]) == 13
for src in [locks["LOCK-06"]["excluded"], locks["LOCK-07"]["prohibited"], locks["LOCK-02"]["prohibited"], locks["LOCK-11"]["prohibited"]]:
    for item in src:
        assert any(item in x for x in P["exclusions"]), "lost exclusion: " + item
covered = {c.get("defect") for c in P["acceptance_criteria"]}
for d in L["defects"]["observed"]:
    assert d["id"] in covered, "observed defect not covered by an acceptance criterion: " + d["id"]
print("PACKET OK")
print("locks referenced      :", len({l for c in P["acceptance_criteria"] for l in [c["lock"]]}))
print("field elements        :", len(ids))
print("text elements         :", len(P["text_elements"]))
print("exclusions            :", len(P["exclusions"]))
print("acceptance criteria   :", len(P["acceptance_criteria"]))
print("defect corrections    :", len(P["mandatory_defect_corrections"]), "observed +", len(P["pre_empted_risk_defects"]), "risk")
print("reference files       :", len(P["reference_file_requirements"]["files"]),
      "| blocking missing:", sum(1 for f in P["reference_file_requirements"]["files"] if f.get("blocking") and "MISSING" in f["status"]))
