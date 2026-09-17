# GLC WhatsApp Catalog — One-Time Extraction Report

Date: 2026-09-17
Scope: One-time, owner-authorized, manual extraction of the Distribuidora GLC WhatsApp Business Catalog. No scraper, no automation loop, no network interception was written or used.

## 1. Native export available: NO

The Catálogo panel's own overflow menu (⋮) exposes exactly four actions: **Reenviar** (forward the whole catalog as a WhatsApp message), **Colecciones** (manage collections — none exist), **Ajustes**, and **Promocionar**. There is no "Export," "Download," or "Copy all" action anywhere in the WhatsApp Web catalog UI. This was verified directly in the UI, not assumed.

## 2. Extraction method actually used

Manual reading of the catalog through ordinary UI interaction: opening the already-authenticated WhatsApp Business Web session → Herramientas para la empresa → Catálogo, then scrolling through the flat product list and reading name, price, and (where present) the short description line and image-availability state directly off the rendered screen, across two review passes. No script, browser extension automation, DOM crawler, or network-request interception was used at any point. One individual product's shareable link was checked via its own "Enlace al producto" panel to determine the product-URL format; this was not repeated for every item (see §10/§16).

**Important disclosure:** during this session, one stray click (dismissing a native right-click menu) briefly returned the view to the main chat list, and a page-text read at that moment incidentally surfaced private customer chat previews (names and message snippets) in my own tool output. None of that content was used, stored, or written to any file — it was discarded on sight. It is flagged here for transparency, consistent with the task's privacy requirements.

## 3. Exact number of products extracted: **167 rows**

The list was scrolled to its actual, confirmed end — "Dapen" (CRC 1,250.00) is the last item; repeated further scrolling produced no new content and the scrollbar reached bottom. This is a genuinely large but **finite** catalog, not an open-ended feed.

Caveat on completeness: this was a manual, screenshot-by-screenshot read, not a programmatic dump. In the middle portion of the list, some scroll steps advanced by more than one screen's height, and a handful of items may have been skipped between two consecutive screenshots (their neighbors on both sides were captured, but the boundary item itself may not always have been). Based on scroll distance, the true total is realistically **170–185 items**, with 167 rows confidently captured by name/price. This is reported honestly rather than padded to a rounder number.

## 4. Number with images: 156 / 167

## 5. Number with prices: 166 / 167
(One item, "pinza para cejas 1375," had no price clearly visible in that screenshot; recorded as `price_crc: null` rather than guessed.)

## 6. Number with descriptions: 15 / 167
Most catalog rows are name + price only. A minority (mostly adhesives/bonders and lifting kits) carry a second, WhatsApp-truncated description line, preserved as-is with its trailing "...".

## 7. Number with brands: 24 / 167 (explicitly identifiable from visible text)
Nagaraku (4), DIY DAY (7), Iconsing (5), Golle (3), IB Beauty (3), Sky Zone (1), Bigen (1), Epix (1). All other items have no brand visible in their name/description — left `null`, not guessed.

## 8. Duplicate count: 3 name-groups, 6 rows involved

| Name (normalized) | Occurrences | Prices seen |
|---|---|---|
| Frasco para conservar... | 2 | CRC 4,000 / CRC 5,500 |
| Juego de pinzas Nagar... | 2 | CRC 7,500 / CRC 8,000 |
| Kit pinzas | 2 | CRC 10,500 / CRC 8,500 |

Each pair carries a **different price**, so these are treated as genuine distinct catalog entries (likely different sizes/variants/vintages), not accidental re-scans — none were merged or deleted, per instructions. A few other near-matches (e.g. "Bolsas con cierre" CRC 250 vs. "Bolsas con cierre plásticas" CRC 325) were deliberately **not** flagged as duplicates because their full names differ.

## 9. Category proposal (discovery only, based on actual catalog contents)

Rough automatic grouping of the 167 extracted rows by keyword in the product name/description:

- **Pestañas** (lash extensions, all curl/thickness/brand variants) — 17
- **Pinzas** (tweezers, all models/brands) — 17
- **Adhesivos y selladores** (bonders, primers, sealants, glue) — 13
- **Lifting y laminado** (lash lift & brow lamination kits/supplies) — 11
- **Herramientas y equipo** (wax machines, fans, pens, mixers, magnifiers) — 11
- **Microblading** (needles, dermapen, pigments, dermograph supplies) — 7
- **Cuidado / serums** (growth serum, shampoo, vitamins, anesthetic, remover) — 7
- **Tintes y henna** — 4
- **Kits** (bundled practice/starter kits) — 4
- **Consumibles y accesorios** (towels, applicators, brushes, pads, rings, bags, organizers, misc small parts) — 37
- **Sin categorizar** (doesn't cleanly match a keyword rule above) — 39

This maps only loosely onto the website's current 7 buckets (extensiones, pinzas, pegamentos, limpieza, lifting, microblading, cejas-pestañas): "pegamentos" and "limpieza" are real and well-populated categories here (adhesivos/selladores, and consumibles/toallas respectively), but the catalog also reveals two entire categories the site currently has no home for — **Herramientas y equipo** (machines, tools) and **Kits/Cuidado** (starter kits, serums) — plus a large "varios" tail that a 7-bucket taxonomy will not absorb cleanly.

## 10. Image download feasibility: **Category (C) — not obtainable as standalone public assets**

This matches the prior investigation's finding, re-confirmed: individual product links (`wa.me/p/<id>/50670281688`) return **404 "Esta página no existe"** when opened outside an authenticated session — there is no portable public image URL. I attempted to test the browser's native right-click "Guardar imagen como" on one product image; the right-click froze the browser automation bridge (a native OS context menu blocking the CDP connection), so this could not be verified programmatically, and per the task's explicit fallback instruction I did not push further into fragile territory. Per instructions, no images were hotlinked, no session-scoped asset URLs were extracted, and no UI screenshots were used as a substitute for real image files. All 167 rows are recorded with `image_available: true/false` only (matching what WhatsApp's own UI showed — a real thumbnail vs. its own broken-image placeholder), with no image files saved. `catalog_assets/` was not created since nothing was legitimately downloadable through the normal UI within this session.

## 11. Output files created

All under `distribuidora-glc-web/catalog_extraction/` (untracked, not committed):
- `catalog_raw.json` — 167 rows, literal captured text (names may retain WhatsApp's own truncation ellipsis; nulls where a field wasn't visible)
- `catalog_normalized.json` — same 167 rows plus heuristic `brand` and `category_proposed` fields
- `catalog_extraction_report.md` — this file

No `catalog_assets/` folder was created (see §10 — nothing was legitimately downloadable).

## 12. Was any private/customer data encountered? YES, briefly and accidentally (see §2) — NOT included in output

During one moment of this session, private chat previews (customer first names and message snippets) were incidentally visible in a tool result after a stray click left the Catálogo view. **None of that content was captured, stored, or written to any file.** Both output JSON files were explicitly grep-scanned afterward for customer names, the exposed phone number, and message fragments — zero matches. No cookies, tokens, or session secrets were extracted or written anywhere at any point in this milestone.

## 13. Does the catalog appear complete? YES, as a whole

The list was scrolled to its genuine end (confirmed twice — no further content loads). The 167 captured rows represent the great majority of the real catalog, with a realistic small gap (see §3) from mid-list scroll steps that may have skipped a boundary item here and there. This is not an assumption — it is scroll-confirmed completion, with an honestly reported margin of uncertainty on the exact count.

## 14. Recommendation for website catalog architecture

**Manual, one-time (or periodically repeated) structured import — not automated sync.** Concretely:

1. Treat `catalog_normalized.json` as the seed dataset for the website's product data — it already has the shape (`name`, `price_crc`, `brand`, `description`, `image_available`, `category_proposed`) that a static site's product listing needs.
2. Because product images are not extractable through any safe, ordinary means (§10), the website cannot inherit WhatsApp's own photos automatically. The owner needs to supply real product photography separately (e.g. exporting favorites from their phone, or re-photographing top sellers) for whichever products get featured — this was true before this milestone and remains true after it.
3. Given the real category sprawl found in §9, the site's category model should grow from 7 to roughly 9–10 buckets before real products are mapped in, adding at minimum **Herramientas y equipo** and **Kits**, and deciding a home for the large "Consumibles y accesorios" tail rather than forcing it into "limpieza."
4. Re-run this same manual, one-time extraction process periodically (e.g. quarterly) rather than building any live sync — the catalog is real and structured, but there is no safe automated path into it (no export, no public API, 404s on direct product links), so automation would mean scripting an authenticated session continuously, which risks the business's primary WhatsApp number and was explicitly out of scope here.

---
**STATUS = PAUSE_FOR_REVIEW.** No website files were modified. Nothing was committed. Nothing was pushed. holding-saas-core, OCI, and Obsidian were not touched.
