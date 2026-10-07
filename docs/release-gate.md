# Final release gate — 7 October 2026

Branch: `feat/glc-growth-experience-v2`. Rights gate reclassification checkpoint: `9f8b296`.

**Release status: READY FOR OWNER MERGE/DEPLOY REVIEW.** The owner explicitly confirmed that the 14 active reference photographs listed below were supplied or authorized as product references for the GLC website. This owner authorization is the provenance evidence for `OWNER_AUTHORIZED_REFERENCE`. It applies to those 14 files; it does not authorize independently sourced images listed as removed below. Functional smoke and commercial checks pass. No backend or spreadsheet work, form submissions, merge, deployment, downloads, or web research was performed.

## Shipping image inventory

Scope: all 63 tracked raster/icon assets at the starting checkpoint, plus public HTML/CSS/JavaScript image references, the runtime catalog image whitelist, and the dynamic shopper gallery. No Pages exclusion configuration is tracked, so all tracked image files are conservatively treated as publishable, even when unused. Untracked local photos, archives, and screenshots are not part of the release branch and were left untouched.

| Classification | Files | Evidence and disposition |
| --- | --- | --- |
| OWNER_PROVIDED | All 25 JPEGs in `img/catalog/owner/` | Explicit Gaudi Lara authorization in `img/catalog/owner/SOURCES.md`; exact file/source mapping in `manifest.json`. Retained. |
| OWNER_PROVIDED | `img/catalog/agujas-microblanding.jpg`, `maquina-de-cera.jpg`, `tinte-pestanas.jpg`, `vitamina-ayd.jpg` | Owner-authorized photo-only captures documented in `img/catalog/README.md` and `MAPPING.md`. Retained. |
| OWNER_AUTHORIZED_REFERENCE | 14 active files listed below | Owner confirmation: these were supplied/authorized as product-reference material for the GLC website. May remain active unchanged. |
| OFFICIAL_BRAND | `img/editorial/glc-logo.jpg`, `img/editorial/glc-logo-transparent.png` | Explicitly identified by the owner in this release mission. Unchanged. |
| OFFICIAL_BRAND | `img/hero-glc.jpg`, `favicon.ico`, `img/favicon-16.png`, `img/favicon-32.png`, `img/favicon-48.png`, `img/favicon-180.png`, `img/favicon-512.png` | Commit `140128c` records extraction from existing GLC brand artwork; `hero-glc.jpg` visually checked as the GLC logo. Unchanged. |
| LICENSED_WITH_EVIDENCE | None established | No additional licenses were inferred. |
| UNKNOWN_UNSAFE | 11 removed images listed below | No rights-holder permission established locally. |
| UNKNOWN_UNSAFE | 0 active images | All independently sourced/unlicensed images without owner authorization were removed; none are actively referenced. |

After cleanup: 52 tracked image/icon assets remain, comprising 29 OWNER_PROVIDED, 9 OFFICIAL_BRAND, and 14 OWNER_AUTHORIZED_REFERENCE. Of these 52 files, 38 have explicit per-source repository evidence and 14 have the owner's explicit authorization documented here. No remaining tracked image is classified UNKNOWN_UNSAFE. Inline interface SVG/code remains unchanged; no replacement logo or generated artwork was introduced.

## Removed files and replacements

All five previously flagged files existed and were tracked. Only the volume tray and adhesive image still had active public-code references:

- `img/curated/diyday-volume-tray.jpg` → `img/catalog/owner/pestanas-tecnologicas-3d-4d-5d-6d-7d.jpg` in the Volumen category.
- `img/curated/gollee-adhesive-master.webp` → `img/catalog/owner/boquilla-para-adhesivo.jpg` in the Adhesivos category.
- `img/curated/gollee-lift-kit.webp`, `gollee-tools.webp`, `gollee-eye-patches.jpg`: removed, unused.
- Removed the three `.webp.json` provenance sidecars accompanying the Gollee files; their download-source notes did not establish a reuse license.

Additional unverified editorial assets were removed where an appropriate authorized replacement already existed:

- `img/editorial/appointments.jpg` → owner `lifting-golle.jpg`.
- `img/editorial/brows.jpg` → owner `pinza-de-aislar-nariz.jpg`; visible alternative text describes the replacement.
- `img/editorial/consumables.jpg` → owner `50-aplicadores-sin-pelusa.jpg`.
- `img/editorial/preparation.jpg` → owner `pestanas-nagaraku-mi.jpg` for Pestañas clásicas; owner `almohada-lashista-mas.jpg` for Accesorios.
- `img/editorial/tools.jpg` → owner `henna-iconsing.jpg` for Cejas; owner `organizacion-para-almacenar.jpg` for Herramientas.
- `img/editorial/shopper.jpg`: removed, unused.

Only image references and the one affected alternative text changed in the existing category/home code. Catalog records, product identity, prices, variants, layout and form contracts remain unchanged.

## OWNER_AUTHORIZED_REFERENCE — active images

The owner's confirmation covers exactly these 14 existing files. They remain unchanged and active. Similar-looking owner product photos, independent Codex/agent sourcing, and manufacturer availability do not extend this authorization to other assets:

- `img/editorial/lashes.jpg` — first hero slide and existing category mapping.
- `img/hero-lash-application.jpg` — service/application photograph and existing category mapping.
- `img/editorial/shopper-lookbook/01-retail-display.jpg`
- `img/editorial/shopper-lookbook/02-cosmetics-shelves.jpg`
- `img/editorial/shopper-lookbook/03-shopping-display.jpg`
- `img/editorial/shopper-lookbook/04-retail-apparel.jpg`
- `img/editorial/shopper-lookbook/05-store-interior.jpg`
- `img/editorial/shopper-lookbook/06-beauty-products.jpg`
- `img/editorial/shopper-lookbook/07-retail-storefront.jpg`
- `img/editorial/shopper-lookbook/08-shopping-mall.jpg`
- `img/editorial/shopper-lookbook/09-store-interior.jpg`
- `img/editorial/shopper-lookbook/10-shopping-center.jpg`
- `img/editorial/shopper-lookbook/11-retail-bags.jpg`
- `img/editorial/shopper-lookbook/12-retail-apparel.jpg`

The twelve shopper photographs are used by the existing dynamic gallery. All 14 files resolve in the repository. No layout or image-reference changes were made for this owner authorization.

The independently sourced `img/curated/` photographs identified in the removal history remain removed. The owner authorization for the 14 files above does not restore or reclassify any separately downloaded file. See `img/curated/SOURCES.md`.

## Targeted validation

Real Chromium smoke at `http://127.0.0.1:4173/`, 1440px and 390px: homepage, manual hero advance, catalog navigation/rendering, cart open and persistence through reload/navigation, ES/EN, distributor rendering and verified endpoint, order rendering and verified endpoint, and Valle Central promotion from ₡25,000 all pass. No order or distributor POST was sent. No runtime JavaScript errors or local asset HTTP failures appeared.

The pre-existing local `pedido.html` footer `flex-wrap: wrap` rule is included as the necessary mobile smoke fix: without it the document measured 540px at a 390px viewport; with it all three tested pages fit 390px. No redesign was made.

All 48 active literal/dynamic/whitelisted local image paths exist in tracked files and returned HTTP 200 and decoded successfully in the browser. Unavailable catalog image placeholders are excluded by the existing runtime whitelist, so they are not requested. No active reference to a removed image remains. Inline home/catalog/order scripts and `glc-growth.js` parse; `git diff --check` passes.

Commercial integrity: 157 active runtime catalog products; 17 technological-lash variants; Anillos S/M ₡2,500; all three active fan records rechargeable at ₡4,000; primary adhesive jar ₡4,000; owner-mapped N02 isolation tweezer ₡5,500; shipping threshold ₡25,000. Both catalog data files are unchanged from `576f71f`; the older JSON snapshot is not substituted for the active JavaScript catalog.
