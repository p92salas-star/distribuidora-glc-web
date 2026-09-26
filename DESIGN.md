---
name: Distribuidora GLC
description: Costa Rican premium beauty commerce with photographic editorial character.
colors:
  berry: "#781f38"
  berry-dark: "#551529"
  ivory: "#f7f3ed"
  paper: "#fff"
  ink: "#181516"
  ink-soft: "#60575a"
  gold: "#89632e"
  gold-light: "#e9cb96"
  line: "#ded6d2"
typography:
  display: {fontFamily: "Fraunces, serif", fontSize: "clamp(64px, 6.6vw, 96px)", fontWeight: 400, lineHeight: 0.99, letterSpacing: "-.04em"}
  headline: {fontFamily: "Fraunces, serif", fontSize: "clamp(34px, 4.2vw, 60px)", fontWeight: 500, lineHeight: 1.06, letterSpacing: "-.035em"}
  body: {fontFamily: "Work Sans, sans-serif", fontSize: "16px", lineHeight: 1.55}
  product-title: {fontFamily: "Work Sans, sans-serif", fontSize: "18px", fontWeight: 500, lineHeight: 1.45, letterSpacing: "-.015em"}
  signature: {fontFamily: "Caveat, cursive", fontSize: "19px"}
rounded:
  square: "0"
  button: "2px"
  circular: "50%"
spacing:
  control-gap: "8px"
  mobile-gutter: "20px"
  grid-gap: "24px"
  heading-gap: "32px"
  desktop-gutter: "40px"
components:
  button-primary: {backgroundColor: "{colors.berry}", textColor: "{colors.paper}", rounded: "{rounded.button}", padding: "11px 20px"}
  button-primary-hover: {backgroundColor: "{colors.berry-dark}", textColor: "{colors.paper}"}
  button-campaign: {backgroundColor: "{colors.paper}", textColor: "{colors.berry}", rounded: "{rounded.button}", padding: "11px 24px"}
  button-campaign-hover: {backgroundColor: "{colors.gold-light}", textColor: "{colors.berry}"}
  variant-selected: {backgroundColor: "{colors.berry}", textColor: "{colors.paper}", rounded: "{rounded.square}", padding: "10px 13px"}
---

# Design System: Distribuidora GLC

## Overview

**Creative North Star: "GLC beauty atelier"**

Original Costa Rican premium beauty commerce: expressive photography and Fraunces headlines lead into clear, compact shopping tools. The implemented direction pairs campaign scale with restrained product information and Gaudi Lara's existing signature.

**Key Characteristics:**
- Photographic editorial contrast.
- Clear prices, variants and WhatsApp actions.
- Flat surfaces, sharp edges and purposeful motion.

## Colors

Primary: berry anchors actions, programs and social sections; berry-dark marks primary hover. Secondary: gold provides restrained accents; gold-light supports links and selected details on dark backgrounds. Neutrals: ivory warms feature/service sections, paper carries the catalog, ink carries reading and dark commerce bands, ink-soft supports metadata, and line separates controls.

## Typography

Use Fraunces for campaign and section hierarchy, Work Sans for commerce and reading, and Caveat for Gaudi's signature. Supporting copy is 16px desktop / 15px mobile; commerce metadata generally 13–14px. Catalog names are 18px / 16px and prices 24px / 22px. Category names are 24–32px / 25px, counts 16px / 14px. Mobile campaign type uses clamp(49px, 12.6vw, 64px) with 1.04 leading. Preserve owner-authored names without added truncation.

## Layout

Shared content caps at 1360px with desktop gutters from the tokens; campaign and shopper compositions reach 1440px. Shared breakpoints are 1100px, 860px and 600px; gutters tighten to 28px then the mobile token. Main sections generally use 64–76px vertical padding, reducing to 44–48px on phones.

The home composition uses a full-bleed photographic campaign, six real categories on an asymmetric 12-column spread (first and sixth span six), four verified photographic products, a black editorial interruption, a compact horizontal text-first product rail, and burgundy programs/social. Preserve this varied rhythm when extending it.

The white catalog uses four product columns, three at 860px and two at 600px. Mobile categories use a labeled native select; desktop categories use an underlined horizontal rail. The home product rail shows four items, three at 860px and 72%-wide items at 600px, with scrolling and arrow controls.

## Elevation & Depth

Commerce surfaces are flat: photography, tonal blocks, thin dividers and scale provide depth. Avoid card hover shadows. Quick view uses a structural shadow (0 24px 80px #0004); the existing navigation dropdown retains its ambient overlay shadow (0 20px 45px rgba(0,0,0,0.08)). Hero overlays exist for readable type; do not add glass panels behind copy.

## Shapes

Cards, image frames, search, selects, chips and quick view are square. Primary buttons use the small button radius; rail controls are circular. Use 1px separators and outlines, a 2px berry top rule for text-first rail items, and an underline for active categories. Selected variants add a 3px inset gold-light bottom edge.

## Components

Buttons: primary berry/white, campaign white/berry with gold-light hover, and simple underlined secondary links. Main actions are at least 48px high; most shopping controls are at least 44px. Keep WhatsApp actions explicit and close to product choices.

Owner correction: the promotion is a commercial headline (roughly 99px desktop / 115px mobile), with 19–25px benefit copy. The header keeps the original logo; the hero uses a straight transparent typographic GLC lockup and Gaudi signature. Social controls pair restrained platform colors with distinct hover states, consistently above and below. Never restore white-on-white social hover rules or tiny category overrides.

Shopping bag: native right-side dialog, quantities 1–99, separate variants, localStorage persistence and an itemized WhatsApp inquiry. Preserve direct WhatsApp purchase. ES/EN translates curated interface text immediately; product names, brands and variant values stay verbatim. Header bag and language controls remain visible on mobile. No backend checkout.

Images: crop authorized campaign/category/editorial photos with cover; show product photographs with contain and breathing room. Only four approved product images are currently whitelisted. Missing photographs stay compact and text-first, labeled “Fotografía pendiente”; do not substitute campaign or reference images for merchandise.

Quick view: real-photo products use a 1.1fr/1fr image-and-information split (maximum 960px); missing-photo products use one column (maximum 620px) and a 100px information strip. At 600px, quick view stacks, caps at 94dvh, and keeps its close control available. Preserve variant prices, keyboard focus management and WhatsApp ordering.

Motion: finite reveal (800ms, 18px rise), campaign arrival (1.4s), restrained photo scaling, and functional rail controls. Shopper photography crossfades over 420ms, advances every 5s, supports pause/manual navigation, and pauses after manual navigation. Reduced motion disables animation, transitions, smooth scrolling and shopper autoplay.

Focus: use the existing visible 3px #ad7446 outline with 4px offset; search uses a 2px berry focus-within outline with 3px offset. Pair color states with outlines, underlines or selected-control semantics. Mobile menus, category selection and dialogs must remain keyboard operable.

## Do's and Don'ts

- Do preserve the original GLC identity, local authorized photography and legible commerce hierarchy.
- Do keep product truth and the four-image whitelist intact; derive catalog content from its existing source.
- Do retain the static HTML, CSS and vanilla JavaScript architecture and existing forms.
- Don't use screenshots, email captures, reference-site imagery or invented photography as product evidence.
- Don't replace the varied editorial rhythm with repeated rounded cards, decorative badges, glass panels or generic SaaS layouts.
- Don't invent urgency, discounts, reviews, stock, service claims or decorative product records.
