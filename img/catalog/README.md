# Real product photos — drop-in convention

This folder is where **real, owner-provided product photography** goes when it becomes
available. Nothing here is required before publishing — the catalog page already shows an
elegant placeholder for any product without a photo, and picks up a real one automatically
the moment it's added, with no code changes.

## How it works

Every product in `data/glc-catalog.json` / `data/glc-catalog.js` has a deterministic `image`
field:

```
img/catalog/<id>.jpg
```

`<id>` is a stable slug derived from the product's name (see `MAPPING.md` in this folder for
the full id → product name table, 162 rows). To add a photo for a product:

1. Find its `id` in `MAPPING.md` (or in `data/glc-catalog.json`).
2. Save the real photo as `img/catalog/<id>.jpg` (square-ish crop works best — cards use a
   1:1 photo area).
3. Done. The `<img>` tag already points at that path; the placeholder's `onerror` fallback
   simply stops firing once the file exists.

## Why there are no photos here yet

The source WhatsApp Business Catalog photos could **not** be legitimately downloaded through
any ordinary, public means (see `catalog_extraction/catalog_extraction_report.md`, §10) —
WhatsApp does not expose a public/portable image URL for catalog products. So this folder
starts empty on purpose, rather than containing hotlinked or screenshotted images.

## Do not

- Do not hotlink WhatsApp's own image URLs here.
- Do not commit screenshots of the WhatsApp catalog as if they were product photos.
- Do not rename files away from the `<id>.jpg` convention — the site depends on it.
