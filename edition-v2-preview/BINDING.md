# What binds the preview to the artifact under approval

The requirement is that the Chairman sees *the exact thing* he is deciding on —
not a description of it, not a stale copy, not a sibling row with the same title.
Three mechanisms carry that, and each one can be checked.

## 1. The preview is the content, not a report about it

`thylora_edf_preview_v1(p_edf_code)` returns the cover reference and every text
block in ordinal order, read straight from the same tables that
`thylora_open_edf_v1` serves to a paying customer. The Chairman reads the book.

The existing `thylora_edf_release_board_v1` — which the current approval panel
uses — returns only *facts about* the package: block count, character count,
"cover present", "source hash present". Those are useful and are still shown, but
they are not the artifact, and a decision taken on them alone is a decision taken
blind. That is the defect this closes.

## 2. Three identifiers travel with every preview

| Identifier | Where it comes from | What it pins |
|---|---|---|
| `package_version` | the package row's own version/updated marker | which revision of the row |
| `source_hash` | the package's stored provenance hash | the origin material the package was built from |
| `content_digest` | computed server-side, per read | the exact bytes rendered on screen |

`source_hash` may be `ABSENT`; the surface prints `ABSENT` in warning colour
rather than hiding the gap. A package with no provenance hash is shown as such
and should not be approved on the strength of this surface alone.

## 3. The content digest, defined exactly

`thylora_edf_content_digest_v1(p_edf_code)` is SHA-256, lowercase hex, over this
UTF-8 byte string:

```
edf_code
U+001F  cover_asset_ref            (empty string when no cover)
then for each text block, ascending ordinal:
  U+001E  ordinal  U+001D  block text
```

Reproducible by hand. Any change to the cover reference, to any block's text, to
the order of blocks, or to the number of blocks yields a different digest.

## 4. A stale decision is refused, not warned about

The surface holds the digest it rendered and sends it back with the decision.
`thylora_edf_record_preview_decision_v1` recomputes the digest at write time and
**raises `THY-PREVIEW-STALE` (SQLSTATE 40001)** if it differs. The row is not
written.

This is what turns "the preview is the exact artifact" from a claim into a
guarantee: it is impossible to attach a Chairman decision to content he did not
see, because the write is rejected at the database, not merely flagged in the UI.

The board also re-checks every recorded decision against current content and
marks any whose digest no longer matches — so a decision that has been overtaken
by an edit reads as overtaken, rather than continuing to look settled.

## 5. The record is append-only

`thylora_edf_preview_decisions` has `UPDATE` and `DELETE` revoked from every
client role *and* blocked by a `BEFORE UPDATE OR DELETE` trigger that raises
`THY-IMMUTABLE`. There is no `INSERT` policy: the only way a row is created is
through the digest-checking function. History is added to, never overwritten.
