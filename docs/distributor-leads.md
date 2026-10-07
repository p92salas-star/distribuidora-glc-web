# Distributor applications — backend contract

Status: **BACKEND PENDING**. This repository contains no Apps Script source. The existing appointment/student/B2B endpoints in index.html are placeholders and do not establish support for distributor leads. The frontend does not reuse them, send to an unknown endpoint, or claim persistence.

Configure the public HTTPS web-app URL in `#distributorForm[data-endpoint]` only after implementing and verifying the contract below. Do not put credentials or a secret in HTML. No production backend was deployed in this mission.

## POST contract

The frontend follows the existing URLSearchParams / `application/x-www-form-urlencoded` pattern. Logical destination: **WEB_DISTRIBUIDORES**. All fields must be validated server-side; browser validation is only usability support.

| Field | Contract |
|---|---|
| lead_id | UUID; required idempotency key |
| created_at | ISO UTC client time; server should validate and store server receipt time separately |
| status | Server sets NEW; never accept client approval |
| nombre | Required, 3–120 characters |
| whatsapp | Required, 8–15 digits, optional leading +; no sensitive information |
| email | Required valid email, maximum 254 characters |
| provincia | Required Costa Rican province from the seven-option allowlist |
| canton_zona | Required, maximum 120 characters |
| tiene_negocio | Optional: empty, SI, NO |
| tipo_negocio | Optional, maximum 160 characters |
| mensaje | Optional, maximum 1000 characters |
| consentimiento | Required literal true (URL-encoded string) |
| source | Server verifies glc_website_distributor_program |
| language | es or en |

Future status vocabulary: NEW, CONTACTED, QUALIFYING, APPROVED, NOT_APPROVED. V1 implements no CRM transitions.

## Required Apps Script change

Add a `doPost(e)` handler/router for `source=glc_website_distributor_program`. Validate the above payload, reject missing consent, set status NEW, and append one row to WEB_DISTRIBUIDORES. Under a script lock, check lead_id before appending; retries for a stored ID must return the same acknowledgement without a second row. Reject the same ID with conflicting payload. Escape leading spreadsheet formula characters (`=`, `+`, `-`, `@`, tabs/line breaks) or write literal text so submitted names, phone numbers and messages cannot become formulas. Do not return or log submitted personal data unnecessarily; restrict spreadsheet access to authorized GLC staff. Add server-side abuse/rate controls before activating a public endpoint.

Return a CORS-readable JSON response **only after successful persistence**:

```json
{"ok":true,"persisted":true,"lead_id":"the-submitted-uuid"}
```

The deployed web app must permit a cross-origin form-urlencoded POST and readable response from the production GLC origin. Verify the actual Apps Script redirect/CORS behavior; do not use `no-cors`, opaque responses or HTTP 200 alone as proof of persistence. If the deployment cannot return readable JSON, use an existing controlled same-origin adapter; do not introduce paid infrastructure by default.

Return an error response without `persisted:true` on failure. The client checks HTTP success, ok, persisted, and exact lead_id. It aborts at 15 seconds, keeps the entered data after an uncertain result, and reuses the same lead_id for retries of the unchanged payload. Fields/submission are locked during a request and after confirmed success. No personal data is stored in localStorage; refreshing clears in-memory retry context. Server duplicate/rate policy remains necessary for separate sessions.

## Media and accessibility

Hero uses the existing approved `img/editorial/lashes.jpg` plus owner-authorized catalog photos `pestanas-nagaraku-mi.jpg` and `almohada-lashista-mas.jpg`. Distributor image: owner-authorized `organizacion-para-almacenar.jpg`. Provenance: `img/catalog/owner/manifest.json`. No new external or generated imagery.

The first image keeps eager/high-priority loading; additional slides have explicit dimensions and lazy/low-priority loading. Controls are manual under reduced motion; autoplay pauses after manual navigation/focus/swipe, while hidden, hovered or offscreen. A separate resume control allows intentional restart. Existing `glc:language` events translate the new copy, controls, validation and state messages without changing product names.
