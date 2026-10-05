---
name: Distribuidora GLC
description: An editorial beauty counter with clear techniques and equally weighted merchandise.
colors:
  berry: "#781f38"
  berry-dark: "#551529"
  ivory: "#f7f3ed"
  paper: "#fff"
  ink: "#241c20"
  ink-soft: "#665b60"
  line: "#ded6d2"
  blush-panel: "#f3e8e9"
  shopper-paper: "#f0e9e2"
  gold: "#89632e"
  gold-light: "#e9cb96"
typography:
  display: {fontFamily: "Fraunces, serif", fontSize: "clamp(52px, 5vw, 72px)", fontWeight: 400, lineHeight: 1.06, letterSpacing: "-.04em"}
  headline: {fontFamily: "Fraunces, serif", fontSize: "clamp(36px, 3.5vw, 50px)", fontWeight: 400, lineHeight: 1.12, letterSpacing: "-.035em"}
  body: {fontFamily: "Work Sans, sans-serif", fontSize: "16px", fontWeight: 400, lineHeight: 1.55}
  product-title: {fontFamily: "Work Sans, sans-serif", fontSize: "17px", fontWeight: 500, lineHeight: 1.45}
  category-title: {fontFamily: "Fraunces, serif", fontSize: "23px", fontWeight: 400, lineHeight: 1.25}
  action: {fontFamily: "Work Sans, sans-serif", fontSize: "15px", fontWeight: 500}
rounded:
  square: "0"
  button: "2px"
  circular: "50%"
spacing:
  control-gap: "8px"
  mobile-gutter: "20px"
  grid-gap: "24px"
  tablet-gutter: "28px"
  heading-gap: "36px"
  desktop-gutter: "40px"
  section-mobile: "56px"
  section-tablet: "64px"
  section-desktop: "88px"
components:
  button-primary: {backgroundColor: "{colors.berry}", textColor: "{colors.paper}", rounded: "{rounded.button}", padding: "13px 22px", typography: "{typography.action}"}
  button-primary-hover: {backgroundColor: "{colors.berry-dark}", textColor: "{colors.paper}"}
  button-ghost: {backgroundColor: "transparent", textColor: "{colors.berry}", rounded: "{rounded.square}", padding: "13px 0"}
  discovery-panel: {backgroundColor: "{colors.ivory}", textColor: "{colors.ink}", rounded: "{rounded.square}", padding: "32px"}
  variant-selected: {backgroundColor: "{colors.berry}", textColor: "{colors.paper}", rounded: "{rounded.square}", padding: "10px 13px"}
---

# Design System: Distribuidora GLC

## Overview

**Creative North Star: "A curated beauty counter"**

Restrained Fraunces headlines, Work Sans commerce copy, warm paper and burgundy actions frame real beauty supplies. Photography introduces techniques; product names, prices and choices stay easy to compare. The official transparent GLC logo is the identity in both header and footer, without an invented wordmark or hero lockup.

This documents the implemented home replacement: glc-home.css loads after glc-commerce.css and replaces the former home media stylesheet. Its home ink tokens override the shared commerce defaults; the standalone catalog retains its own styling and behavior. The composition contract remains in .impeccable/surfaces/index-html.md.

**Key Characteristics:**

- Equal category and featured-product grids.
- Generous section spacing, quiet rules and flat tonal surfaces.
- Clear catalog, variant, cart and WhatsApp actions.

## Colors

Primary: berry anchors actions, selected category underlines and reservations; berry-dark marks hover. Neutral: ivory and paper alternate shopping surfaces; ink and ink-soft separate primary text from supporting copy; line provides quiet dividers. Blush-panel softens the kit and social sections; shopper-paper carries personal shopping. Gold and gold-light remain supporting commerce accents.

**The Contrast Rule.** Keep dark readable copy on the light hero and service panels. Use white copy on the burgundy reservation panel.

## Typography

Fraunces carries editorial headings and category destinations. Work Sans carries product names, prices, controls and explanations. The frontmatter display and headline roles describe desktop home hierarchy. On phones the hero is (48px), section headings generally (36px), product titles (15px), and prices (20px). Descriptions use relaxed leading, usually (1.7–1.75), with constrained measures. Prices use tabular numerals. Preserve full product and variant names.

The logo is an image asset, never reconstructed with a font. Existing named personal-service signature styling does not authorize a new brand lockup.

## Layout

Home content caps at (1280px), including gutters; large split compositions cap at (1440px). Desktop section rhythm and gutters follow the spacing tokens. Breakpoints at (1100px), (860px) and (600px) reduce gaps, navigation density and section spacing. Desktop navigation is (112px) tall below a (58px) promotion band.

The hero splits ivory copy and one lash photograph evenly with a desktop minimum height of (620px). Mobile places copy before the (330px) photo. Discovery and featured products use four equal columns, becoming two on phones. Discovery images are (4:3), becoming square on phones; product fields stay square with contained product photography. Selected discovery content is a compact text-only ivory panel, split between description/actions and real product links on desktop, stacked on phones.

The kit has a separate two-column invitation, stacking on phones. Services use simpler splits and visible pauses. Reservations keep four steps, photograph, terms and action together. Social links are quiet ruled rows; the ivory footer separates contact, navigation and information. The phone product rail uses (78%) item widths. Do not propagate home overrides to the standalone catalog.

## Elevation & Depth

Photography, tonal panels and thin rules provide depth. Hero copy, buttons, program cards, social links and footer surfaces have no decorative shadows or glass. Existing commerce dialogs retain structural elevation. The finite hero photo reveal lasts (1.1s); category hover scales images to (1.025) over (.5s). Reduced motion disables these effects. Focus, motion and overlay extensions live in the sidecar.

## Shapes

Image fields and major surfaces are square. Primary buttons use the small token radius; secondary actions are underlined. Selected destinations have a burgundy bottom rule (2px) and pressed semantics. Selected variants retain the shared inset gold-light edge. Rail controls remain circular. Avoid decorative rounded containers around every item.

## Components

Buttons use burgundy and white with a darker hover and no floating effect. Main actions have a minimum height of (48px); most commerce actions are at least (44px). Secondary actions use plain underlines. Keep keyboard focus visible with an outline and offset, including on selected discovery controls.

Navigation uses the same official transparent logo asset in header and footer, displayed at (132 × 94px) on desktop and (104 × 74px) on phones. Mobile keeps language and bag controls available beside the menu. Social icons use restrained platform color accents.

Discovery selection updates the text-only product edit; imagery establishes technique context and never proves product identity. Featured items have equal square image fields, full names, catalog prices and options. Only actual catalog photography may stand in for merchandise; retain text-first treatments when photos are unavailable. Source records belong in img/curated/SOURCES.md and image sidecars.

The optional kit guide preserves technique selection, explicit variant requirements, review before adding to the existing cart, and selection across technique changes. Keep disclosure state and focus synchronized. No bundle, compatibility or availability promise is implied by the layout.

The promotion has linked copy, position, pause/resume, next and dismiss controls. Its current shipping offer is free delivery in the Valle Central this week for purchases from ₡25,000 inclusive. Keep scope and threshold aligned with commerce logic; visual changes do not extend the offer.

Reservation terms remain unchanged: initial payment from ₡10,000, payments from ₡5,000, three months to complete payment, collection after full payment, and cancellation if incomplete at the deadline. The action starts a WhatsApp inquiry. Cart quantities, variant separation, local persistence, bilingual interface, catalog data and existing forms retain established behavior; there is no backend checkout.

## Do's and Don'ts

- Do use the supplied transparent logo consistently and preserve its proportions.
- Do keep equal product fields, readable full names and real catalog choices.
- Do preserve keyboard operation, visible focus and reduced-motion behavior.
- Do distinguish editorial imagery from exact product photos and record provenance.
- Don't restore the superseded diptych, oversized product hierarchy, photographic selection panel or invented hero signature.
- Don't invent stock, discounts, urgency, testimonials, product records or service claims.
- Don't alter catalog behavior or reservation terms through a visual refresh.
