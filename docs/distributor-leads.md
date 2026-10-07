# Distributor applications — backend contract

Status: **CODE READY — DEPLOYMENT REQUIRED**. The operational Apps Script source, editable project ID, workbook configuration and clasp setup are absent from this repository. `pedido.html`'s `ENDPOINT` and order form action reference the existing operational Google Apps Script `/exec` deployment; they do not prove distributor support. The appointment/student/B2B placeholders are unrelated. The deployment's owner must locate its project in Apps Script; a public deployment ID is not an editable project ID.

Prepared module: [apps-script/distributor-leads.gs](apps-script/distributor-leads.gs). It accepts the existing operational Spreadsheet object, writes only the **WEB_DISTRIBUIDORES** tab and introduces no workbook, credentials or frontend secrets. `#distributorForm[data-endpoint]` remains empty until the external backend is activated and verified. No backend or website was deployed.

## POST contract

The frontend follows the existing URLSearchParams / `application/x-www-form-urlencoded` pattern. Logical destination: **WEB_DISTRIBUIDORES**. All fields must be validated server-side; browser validation is only usability support.

| Field | Contract |
|---|---|
| lead_id | UUID v4; required idempotency key |
| created_at | Valid ISO UTC client time; server also stores received_at |
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

## Backend behavior

The module validates all fields before storage, normalizes Unicode/name whitespace/phone separators/email domain, forces NEW, and rejects unexpected fields, repeated parameters, invalid enum values and missing consent. It writes the 14 fields in table order, followed by `received_at` and `payload_hash`. Consent is stored as literal text `true`. An absent/empty tab receives these headers; an existing incompatible schema fails closed without overwriting it.

A script lock covers deduplication and writes. The same lead_id and normalized payload return duplicate success without another row, including after an acknowledgement is lost. A different payload for a stored ID returns LEAD_ID_CONFLICT. The hash preserves retry semantics even if staff later update the stored status. Keep retries' lead_id, created_at and payload unchanged. Use this one Apps Script project for all writers; separate projects do not share its lock.

Text formatting plus formula-prefix escaping protects submitted values. No personal data is logged or returned beyond lead_id. A best-effort cache guard limits new submissions to 60/minute globally and 5/hour per hashed email; stored-ID retries bypass it. Cache eviction can reset these limits; this is not a complete anti-bot system. Restrict spreadsheet access to authorized GLC staff.

Return a CORS-readable JSON response **only after successful persistence**:

```json
{"ok":true,"persisted":true,"lead_id":"the-submitted-uuid"}
```

An identical retry returns `{"ok":true,"persisted":false,"duplicate":true,"lead_id":"the-submitted-uuid"}`. Failures return `{"ok":false,"error":"CONCISE_CODE"}` (validation, BUSY_RETRY, RATE_LIMITED, SCHEMA_MISMATCH, LEAD_ID_CONFLICT or STORAGE_UNAVAILABLE), without stack traces or internal identifiers. Successful writes are flushed before acknowledgement.

The deployed web app must permit a cross-origin form-urlencoded POST and readable response from the production GLC origin. Verify the actual Apps Script redirect/CORS behavior; do not use `no-cors`, opaque responses or HTTP 200 alone as proof of persistence. If the deployment cannot return readable JSON, use an existing controlled same-origin adapter; do not introduce paid infrastructure by default.

The client requires HTTP success, strict `ok:true`, the exact lead_id, and either `persisted:true` or `persisted:false` with `duplicate:true`. It aborts at 15 seconds, keeps entered data after an uncertain result, and reuses the same payload for unchanged retries. Submission is locked while pending and after success. No personal data is stored in localStorage; refresh clears the retry context.

## External activation (owner authorization required)

1. The existing order deployment's owner opens its Apps Script project and adds `distributor-leads.gs` using the V8 runtime. Reuse the same operational workbook and permissions. No replacement `doPost`, new workbook or second service is needed.
2. In the existing `doPost(e)`, before order parsing/writing, add this branch. `operationsSpreadsheet` below means the existing backend's resolved Spreadsheet object; substitute its actual variable/accessor, which is not available in this repository. Leave the existing order path intact.

   ```js
   if (e && e.parameter && e.parameter.source === 'glc_website_distributor_program') {
     return glcHandleDistributorLead(e, operationsSpreadsheet);
   }
   // Existing order handler continues unchanged.
   ```

3. Confirm WEB_DISTRIBUIDORES is absent/empty or has the exact 16 headers exported by `GLC_DISTRIBUTOR_HEADERS`. Do not overwrite an existing incompatible tab. Test the integrated router in an authorized non-production copy, including existing order routing, write/retry/failure cases and readable browser responses.
4. With owner authorization, version and update the **existing** web-app deployment. Verify form-urlencoded POST and JSON redirects/CORS from the website origin. Then configure that verified public `/exec` URL in `#distributorForm[data-endpoint]` through the normal website release gate. Never insert credentials or use an opaque response as success.

Remaining blocker: access to the actual backend project, router integration, authorized deployment and live response verification. A test endpoint was not evidenced in the inspected integration. No production requests or fake permanent leads were created.

## Targeted validation

Run `node --test docs/apps-script/distributor-leads.test.cjs` and `node --check glc-opportunities.js`. Tests execute the actual module and client using in-memory service/DOM doubles: validation, complete field persistence, schema safety, formula protection, lock contention, write/flush failures, deduplication/conflicts, row capacity, rate guards, strict frontend acknowledgements, failed requests, double-submit prevention and a lost-response/retry round trip. These confirm code behavior, **not live Google Sheets persistence, deployment permissions or CORS**. Hero code and catalog/delivery data are unchanged.

API references: [ContentService JSON and redirects](https://developers.google.com/apps-script/guides/content), [script locks](https://developers.google.com/apps-script/reference/lock/lock-service).

## Media and accessibility

Hero uses the existing approved `img/editorial/lashes.jpg` plus owner-authorized catalog photos `pestanas-nagaraku-mi.jpg` and `almohada-lashista-mas.jpg`. Distributor image: owner-authorized `organizacion-para-almacenar.jpg`. Provenance: `img/catalog/owner/manifest.json`. No new external or generated imagery.

The first image keeps eager/high-priority loading; additional slides have explicit dimensions and lazy/low-priority loading. Controls are manual under reduced motion; autoplay pauses after manual navigation/focus/swipe, while hidden, hovered or offscreen. A separate resume control allows intentional restart. Existing `glc:language` events translate the new copy, controls, validation and state messages without changing product names.
