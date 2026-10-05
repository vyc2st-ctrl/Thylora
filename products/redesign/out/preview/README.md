# Mobile-readable preview evidence (deliverable H)

Phone-width proof for the six Edition v2 artifacts: each page rendered at a 1080px
viewport, as a customer sees it on a phone, then stored here downscaled to JPEG so the
evidence survives in the repository rather than only in a session scratchpad.

Full-resolution PNGs are regenerated deterministically by `python3 build.py` from the
committed generator; they are not committed because the full set is ~41 MB.

`../v1_content_lock.json` holds the text extracted from the **v1** artifacts stored in
`thylora_delivery_assets`. It is the content-preservation record: the v2 editions carry
this copy verbatim, so the claim "content and meaning preserved" is checkable rather than
asserted.
