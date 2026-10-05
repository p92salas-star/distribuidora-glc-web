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

The Home campaign is a photographic diptych: a large lash-detail photograph, an inset monochrome preparation photograph, an oversized GLC signature and a dark editorial text field. Mobile preserves a large photographic opening before the headline. Photography remains visible without JavaScript; respect reduced motion for the finite mask reveal.

The journey is campaign → oversized real-product selection → dark visual discovery → light editorial image spread → independent photographic kit entrance → lash product rail → burgundy photographic Apartados → programs, services, Personal Shopper and social. Adjacent sections vary in scale, color and structure. The four approved real-product photographs use a mixed-size composition with one oversized product and an image/text product row. Never substitute editorial imagery for a product photograph.

Discovery uses eight photographic destination controls with visible gold selection outlines and real catalog mappings. Four columns become two at mobile sizes; imagery stays at least 200px tall. The selected destination retains a photograph and real product links. The kit lives in its own section, reachable both from discovery and its independent entrance. A technique photograph, three-step progress, exploration/restocking buttons, approved product thumbnails where available, selected states and visual review lead to the existing cart. Preserve variant requirements and selection across techniques.

Apartados pairs large burgundy/white typography, a four-step gold-accented sequence and a large editorial photograph. Terms and WhatsApp remain visible below. On phones, headline, photo, steps and terms form a clear vertical progression. Personal Shopper pairs its existing authorized lookbook with dark readable text on a warm light surface.

The white catalog uses four product columns, three at 860px and two at 600px. Mobile categories use a labeled native select; desktop categories use an underlined horizontal rail. The home product rail shows four items, three at 860px and 72%-wide items at 600px, with scrolling and arrow controls.

## Elevation & Depth

Commerce surfaces are flat: photography, tonal blocks, thin dividers and scale provide depth. Avoid card hover shadows. Quick view uses a structural shadow (0 24px 80px #0004); the existing navigation dropdown retains its ambient overlay shadow (0 20px 45px rgba(0,0,0,0.08)). Hero overlays exist for readable type; do not add glass panels behind copy.

## Shapes

Cards, image frames, search, selects, chips and quick view are square. Primary buttons use the small button radius; rail controls are circular. Use 1px separators and outlines, a 2px berry top rule for text-first rail items, and an underline for active categories. Selected variants add a 3px inset gold-light bottom edge.

## Components

Buttons: primary berry/white, campaign white/berry with gold-light hover, and simple underlined secondary links. Main actions are at least 48px high; most shopping controls are at least 44px. Keep WhatsApp actions explicit and close to product choices.

The header keeps the original logo; the hero uses a straight transparent typographic GLC lockup and Gaudi signature. Social controls pair restrained platform colors with distinct hover states, consistently above and below. Never restore white-on-white social hover rules or tiny category overrides.

The rotating promotion keeps a strong, stable-height band with readable linked copy (roughly 19–23px), a position count, pause/resume and next controls, and the existing dismiss action. Reserve space for mobile controls without crowding the message. Rotate every 8.5 seconds; pause while hovered, focused, hidden or explicitly paused. Manual next pauses rotation until resumed. Reduced motion keeps manual navigation and disables autoplay and the brief text entrance; do not announce automatic changes through a live region.

Guided discovery: eight paths cover Pestañas clásicas, Volumen, Lifting y laminado, Cejas, Microblading, Herramientas, Adhesivos and Consumibles. Resolve curated product IDs against named public catalog records, with real names, prices and category links; hide unavailable paths rather than inventing content. Editorial photos establish technique context and are never evidence of a listed product. Keep the full catalog accessible without opening the guide.

Guided commerce: “Armá tu kit” opens an optional technique and exploration/restocking guide. Require an explicit variant before selection; preserve full owner-authored labels and distinguish starting prices from selected prices. Selection stays in memory across technique changes, with no account or server persistence. Review precedes adding one unit of each selected product to the existing cart, where quantities can be edited. Keep unknown prices explicit as a known subtotal. These are individual catalog choices, with no bundle discount, completeness or compatibility promise; WhatsApp confirms availability and suitability.

Apartados: use the existing ivory, berry and restrained gold hierarchy to explain the four steps and keep terms visible beside the action. Preserve the initial amount from ₡10,000, payments from ₡5,000, three-month completion period and cancellation if payment is incomplete at the deadline. The action starts a WhatsApp inquiry; it does not record a reservation or payment online.

Shopping bag: native right-side dialog, quantities 1–99, separate variants, localStorage persistence and an itemized WhatsApp inquiry. Preserve direct WhatsApp purchase. ES/EN translates curated interface text immediately; product names, brands and variant values stay verbatim. Header bag and language controls remain visible on mobile. No backend checkout.

Shipping progress: a slim berry native progress bar and adjacent amount text show the known cart subtotal toward ₡25,000 for this week’s Valle Central delivery promotion. Qualification is inclusive at 25000; ₡18,500 leaves ₡6,500. Keep the region explicit, unknown-price notices visible and final delivery confirmation with WhatsApp; this is not a nationwide shipping promise.

Images: crop authorized campaign/category/editorial photos with cover; show product photographs with contain and breathing room. Only four approved product images are currently whitelisted. Missing photographs stay compact and text-first, labeled “Fotografía pendiente”; do not substitute campaign or reference images for merchandise.

Quick view: real-photo products use a 1.1fr/1fr image-and-information split (maximum 960px); missing-photo products use one column (maximum 620px) and a 100px information strip. At 600px, quick view stacks, caps at 94dvh, and keeps its close control available. Preserve variant prices, keyboard focus management and WhatsApp ordering.

Motion: the GLC signature is a finite editorial arrival followed by quiet, functional shopping interactions: reveal (800ms, 18px rise), campaign arrival (1.4s), restrained photo scaling, and functional rail controls. Discovery path changes use a brief fade and 4px rise (300ms); promotional text uses a similar entrance (350ms). Keep product names, prices and choices stable while reading. Shopper photography crossfades over 420ms, advances every 5s, supports pause/manual navigation, and pauses after manual navigation. Reduced motion disables animation, transitions, smooth scrolling and shopper/promotion autoplay. Guide transitions move keyboard focus to the relevant heading or control, with no motion required to understand state.

Future content commerce should connect real, authorized technique demonstrations and product photography to the corresponding catalog choices, preserving this editorial hierarchy. Add demonstrations only when real assets and permission exist; no placeholder players, invented videos or substitute merchandise imagery. Defer recently viewed products to avoid crowding the discovery and shopping flow.

Focus: use the existing visible 3px #ad7446 outline with 4px offset; search uses a 2px berry focus-within outline with 3px offset. Pair color states with outlines, underlines or selected-control semantics. Mobile menus, category selection and dialogs must remain keyboard operable.

Kit disclosure: keep the opening button's `aria-expanded` synchronized with the guide. Opening focuses its heading; closing returns focus to the opening button. The close action keeps a minimum 44px touch target at all widths. Changing technique preserves selections; clearing a required variant removes that product from the selection.

## Do's and Don'ts

- Do preserve the original GLC identity, local authorized photography and legible commerce hierarchy.
- Do keep product truth and the four-image whitelist intact; derive catalog content from its existing source.
- Do retain the static HTML, CSS and vanilla JavaScript architecture and existing forms.
- Don't use screenshots, email captures, reference-site imagery or invented photography as product evidence.
- Don't replace the varied editorial rhythm with repeated rounded cards, decorative badges, glass panels or generic SaaS layouts.
- Don't invent urgency, discounts, reviews, stock, service claims or decorative product records.
