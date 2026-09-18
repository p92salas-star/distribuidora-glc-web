# Real product photos — drop-in convention

This folder holds **real, owner-authorized product photography**. A product without a photo
here still works fine — the catalog page shows an elegant placeholder for it, and picks up a
real one automatically the moment it's added, with no code changes.

## Current state (2026-09-17)

**4 of 162 products have a real photo so far**: `agujas-microblanding.jpg`, `tinte-pestanas.jpg`,
`maquina-de-cera.jpg`, `vitamina-ayd.jpg`. The remaining 158 use the placeholder. See
`MAPPING.md` for the per-product status and `catalog_extraction/catalog_extraction_report.md`
plus this milestone's final report for how these were obtained and why mass import was not
completed in one pass (WhatsApp Web's catalog UI has no download action, so each image is a
one-time, owner-authorized, manually-cropped capture of the product photo only — not something
safe or reasonable to fully automate).

## How it works

Every product in `data/glc-catalog.json` / `data/glc-catalog.js` has a deterministic `image`
field:

```
img/catalog/<id>.jpg
```

`<id>` is a stable slug derived from the product's name (see `MAPPING.md` in this folder for
the full id → product name → image status table, 162 rows). To add a photo for a product:

1. Find its `id` in `MAPPING.md` (or in `data/glc-catalog.json`).
2. Save the real photo as `img/catalog/<id>.jpg` (square-ish crop works best — cards use a
   1:1 photo area).
3. Done. The `<img>` tag already points at that path; the placeholder's `onerror` fallback
   simply stops firing once the file exists.

## Where the 4 existing photos came from

WhatsApp Web's catalog product-detail view has no "download image" action (checked directly —
neither the detail panel nor its full-screen image viewer expose one). Per explicit owner
authorization, each image is a one-time capture of *only* the product-photo region of that
viewer — no WhatsApp UI, no chat list, no customer data, no phone numbers. Nothing was
hotlinked from WhatsApp's own (session-only) image URLs, and no automated scraper was built.

## Do not

- Do not hotlink WhatsApp's own image URLs here.
- Do not commit screenshots that include WhatsApp UI, chats, or customer data.
- Do not rename files away from the `<id>.jpg` convention — the site depends on it.
