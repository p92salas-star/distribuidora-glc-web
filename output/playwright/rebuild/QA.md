# GLC visual rebuild QA — 2026-10-05

Local URL: http://127.0.0.1:4173/

## Visual evidence

`home-1440-top.png`, `home-1440-full.png`, `home-390-top.png`, `home-390-full.png`, `home-430-top.png`, `home-430-full.png`.
Detailed `categories-*`, `products-*`, `bottom-*`, `footer-*`, `kit-*` captures cover the same widths.

All three viewport widths: document width equals viewport width; zero broken images; eight unique category image paths; zero JavaScript errors. Official header/footer logo asset is identical, displayed at 132 × 94 desktop and 104 × 74 mobile. No hero image reused in the category grid.

## Functional checks — 23 passed

- Real product add opens the native cart; catalog price is retained.
- ₡24,700 leaves ₡300; exactly ₡25,000 qualifies for Central Valley promotion. Native progress maximum is 25000.
- Itemized WhatsApp includes selected products and uses 50670281688. No message sent.
- Cart quantities and subtotal persist on reload.
- ES/EN changes document language, hero, discovery and new footer labels.
- Mobile navigation opens and closes.
- Category choice updates the selection panel.
- Kit opens, requires a variant, retains selection, and synchronizes its close state.
- Apartados and all WhatsApp links use the existing official destination.
- Catalog renders products without mobile overflow.
- Reduced motion disables the hero arrival animation.
- No runtime errors during the functional journey.

## Review

Independent first review requested a missing social-heading space and a true consumables image; both corrected. Recommended kit-image repetition also corrected. All affected screenshots recaptured. Final independent verdict: **ship**; all three original findings scored resolved at 1440, 390 and 430. No deployment implied.

Static syntax checks: inline scripts in home/catalog and both modified JavaScript files. `git diff --check` passed. Existing `pedido.html` change and unrelated untracked files excluded from this work.

No merge or production deployment.
