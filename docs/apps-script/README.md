# GLC public web backend — manual activation

**Schema diagnostic update ready; live root cause not yet established.** The owner confirms the current public GET works, but order POST returns the former generic `ORDER_SCHEMA_MISMATCH`. Use [glc-web-backend.gs](glc-web-backend.gs) in the project bound to **Control GLC — MASTER**, ID `1QydykhTtaD5HqpB04opPU0MTUTeWxKt3YOQkBJTAMA4`. The older, separate order endpoint returns anonymous POST HTTP 401; do not modify/delete that old deployment or reuse it.

The unified file includes the unchanged, tested distributor module. **Do not also paste `distributor-leads.gs` or `master-routing-snippet.gs`**: that would duplicate declarations. The older routing-insertion approach is superseded. This file defines exactly one `doGet` and one `doPost`. All writes open MASTER explicitly; no other workbook or endpoint is used.

## Current hotfix — one version update and live retest

1. In the current MASTER-bound public backend project, replace **all contents of Código.gs** with `glc-web-backend.gs`. Keep exactly one `doGet` and `doPost`; do not add the separately bundled modules. Save.
2. **Deploy → Manage deployments → select the current public Web app → Edit → New version → Deploy**. Keep the same `/exec`, Execute as Me and access Anyone. Do not create another endpoint or change the spreadsheet.
3. Anonymous GET on that same `/exec` must return `build: "2026-10-07-schema-fix-1"` with `ok:true`, `service:"glc-web-backend"`, `master:true`. A missing/different build proves this corrected GET is not being served; do not proceed to order writes until it matches. The marker identifies this source revision, not a successful Sheets write.
4. Retest the controlled valid order, then its identical retry using the same order_id. Expect one persisted row, then duplicate success. If it fails, capture the returned JSON including build/error/column/reason. No raw sheet values are included. A legacy `ORDER_SCHEMA_MISMATCH` response cannot come from this file's corrected order path: check the deployed version/URL and duplicate handler definitions before changing any sheet cells.

No Apps Script deployment, Sheets modification or live request was performed by this hotfix.

### Trace of the former generic error

| Former condition | Precise response now |
|---|---|
| `getSheetByName('Pedidos')` returns no sheet | `ORDER_SHEET_NOT_FOUND` |
| Last content row is above row 4, or row 4 A:J is entirely blank | `ORDER_HEADER_ROW_MISSING` |
| Fewer than 10 allocated columns or an A:J header differs | `ORDER_BASE_HEADER_MISMATCH` |
| Fewer than 19 allocated columns or a nonblank K:S header differs | `ORDER_EXTRA_HEADER_MISMATCH` |

The supplied exact row-4 A:S schema plus row-5 example passes local persistence/retry/conflict tests. No deterministic failure was reproduced for that exact structure. The previous raw comparisons **do** reject harmless edge whitespace and canonically equivalent decomposed accents; this fragility is fixed, but it is not proven to be the live cause. Deployment-state ambiguity remains until the marker and precise live response are observed.

Header comparison uses `String(value).normalize('NFC').trim()` (empty/null values treated as empty). It preserves accents, case, punctuation, internal spacing and column order; zero-width characters or materially renamed headers still fail. It never rewrites matching headers. Insufficient grid width is reported instead of inserting columns.

Header diagnostics include `header_row:4`, a **zero-based A:S index**, column letter, expected public schema label, `actual_type`, `reason` and build. Reasons are `MISSING_COLUMN`, `EMPTY_HEADER` or `HEADER_VALUE_MISMATCH`. Actual cell contents are intentionally omitted: a misplaced row could contain customer information. All order/router errors include build; the bundled distributor handler and its response contract remain unchanged.

The earlier test double derived headers from implementation constants, always used plain composed text, allowed out-of-grid ranges, and counted array length as last row. Tests now use independent production labels, Unicode/typed values, bounded ranges and the last row containing values. Google documents [getValues()](https://developers.google.com/apps-script/reference/spreadsheet/range#getValues()) as a 2D array of typed values (empty cells are empty strings), and [getMaxColumns()](https://developers.google.com/apps-script/reference/spreadsheet/sheet#getMaxColumns()) as allocated grid width. Plain matching header strings need no display-value conversion; no demonstrated API behavior explains a mismatch for the supplied exact schema.

## Initial owner activation — reference only

1. Open **Control GLC — MASTER → Extensions → Apps Script**.
2. Use the **new MASTER-bound project**, not the old order deployment's project.
3. Replace the default `myFunction` file contents with the **entire** `glc-web-backend.gs` file. Use the V8 runtime.
4. Distributor code is already included. Do not add the two older module/helper files. If already pasted into this new project, remove only those duplicate copies; preserve unrelated project code and ensure there is only one `doGet`/`doPost`.
5. Save. Confirm the existing MASTER tabs `Pedidos` and `WEB_DISTRIBUIDORES` have the headers below. Do not overwrite incompatible headers or data.
6. Choose **Deploy → New deployment → Web app**.
7. Set **Execute as: Me**, using the owner account with access to MASTER.
8. Set **Who has access: Anyone** (anonymous access). If that option is unavailable, stop activation; an authenticated-only endpoint cannot serve this public form.
9. Click **Deploy** and complete the owner's authorization prompts.
10. Copy the **new `/exec` URL**, not `/dev`. Keep the old project/deployment intact.
11. Test an anonymous GET: expect `{"ok":true,"service":"glc-web-backend","master":true,"build":"2026-10-07-schema-fix-1"}`. This is liveness, not proof of a successful Sheets write.
12. Submit one owner-approved controlled order using `application/x-www-form-urlencoded` and the fields below. Confirm the JSON acknowledgement and the row in MASTER; repeat exactly, then change one field with the same order_id to verify retry/conflict behavior. Avoid any fulfillment or WhatsApp side effects.
13. Submit one owner-approved distributor test using the [existing payload contract](../distributor-leads.md). Confirm its row in WEB_DISTRIBUIDORES, identical retry acknowledgement and conflict rejection. Verify anonymous POST responses and redirects are readable from the GLC website origin; HTTP 200 or an opaque response is insufficient.
14. **Only after those checks pass**, replace `PENDING_VERIFIED_GLC_WEB_BACKEND_EXEC_URL` in `pedido.html` and set `#distributorForm[data-endpoint]` to the **same verified new `/exec` URL**, through a separate authorized website release. Do not reinsert the old 401 URL. The order form uses fetch; its HTML action intentionally stays local and its button requires JavaScript.

No deployment, production request, controlled test row or website release was performed by this code-preparation mission.

## Routes and responses

POST accepts form-urlencoded fields with explicit `source`:

| Source | Destination | ID |
|---|---|---|
| `glc_website_order` | MASTER → Pedidos | `order_id`, UUID v4 |
| `glc_website_distributor_program` | MASTER → WEB_DISTRIBUIDORES | `lead_id`, UUID v4 |

Missing, unknown or repeated source returns `{"ok":false,"error":"INVALID_SOURCE"}`; there is no implicit order fallback. No student/other routes are claimed by this version.

Success: `{"ok":true,"persisted":true,"order_id":"submitted-uuid"}`. Identical retry: `{"ok":true,"persisted":false,"duplicate":true,"order_id":"submitted-uuid"}`. Distributor responses use `lead_id`. Errors have `ok:false` and a concise code, without stack traces or internal IDs. Both clients require the matching ID and strict confirmed-write/duplicate acknowledgement before success; errors preserve input. Orders use a 15-second timeout and reuse the exact in-memory ID/payload after an uncertain result. Changed data generates a new ID; refresh clears retry context. No personal data is kept in browser storage.

## Order fields and storage

Required strings: `source`, `order_id`, `cliente` (3–120), `telefono` (8–15 digits, optional leading +), `provincia` (seven Costa Rican provinces), `canton`/`distrito` (1–120 each), `direccion` (5–1000), `producto` (1–300), `categoria`, `cantidad`, `precio`, `pago`. `telefono_alt` and `email` are optional at the backend; if supplied, phone/email validation applies (email maximum 254). Category/payment values must match the existing order form options. Quantity: integer 1–10,000; unit price: integer ₡0–₡1,000,000,000. These are intake bounds, not price verification or a payment authorization; staff must confirm customer-entered prices. Unknown fields, including a submitted total, are rejected.

Pedidos has its title in row 1, instructions in row 2, a blank row 3, and headers in **row 4** (`GLC_ORDER_HEADER_ROW = 4`). Rows 1–3 remain untouched. Data starts at row 5; new orders append after the last existing data row, and Order ID lookup starts at row 5.

**A:J on row 4 stays in this exact order:**

```text
Fecha | Cliente | Teléfono | Producto | Categoría | Cantidad | Precio unitario (₡) | Total (₡) | Método de pago | Estado
```

New website rows use a server Date in A, numeric quantity/price in F:G, server-computed `cantidad × precio` in H, and `Nuevo` in J. No existing A:J headers/data are rewritten.

**K:S only:**

```text
Order ID | Teléfono alternativo | Email | Provincia | Cantón | Distrito | Dirección | Source | Received at
```

Only blank K:S headers **on row 4** are initialized. Missing sheet/row and incompatible base/extra headers return the precise codes listed above. No replacement sheet is created and no columns are inserted. Received at is server ISO UTC. Existing rows are preserved.

Under the script lock, the original normalized payload's SHA-256 is stored in the **note on the Order ID cell (K)**, keeping the prescribed 19-column layout. The note is flushed before the row write; a failure before writing leaves no order ID, so retry can safely reuse the blank row. Keep these notes with their rows; do not strip them during imports/sorts/copies. A changed payload or missing hash for an existing ID returns `ORDER_ID_CONFLICT` without overwriting or appending. Normal operational edits (e.g. Estado) do not break an identical retry. Notes contain only a hash, not a copy of personal data.

Distributor schema remains its existing 16 headers, including `received_at` and `payload_hash`; locking, hashes, conflict detection and acknowledgements are unchanged. No separate distributor module installation is needed.

## Security and targeted validation

Server-side validation, normalization, text formatting and formula-prefix escaping apply before writes. No frontend secrets or public personal-data reads are introduced. Cache guards limit each route to 60 new records/minute globally and 5/hour per hashed contact (order phone/distributor email). Identical persisted retries bypass these limits. Cache eviction may reset counters: these are basic safeguards, not comprehensive anti-bot protection. Restrict workbook/editor access to authorized staff.

Run:

```text
node --test docs/apps-script/glc-web-backend.test.cjs docs/apps-script/distributor-leads.test.cjs
git diff --check
```

Tests execute actual backend/client code using in-memory service/DOM doubles, without network or live Sheets writes. Coverage includes schema preservation, numeric total, explicit routing, validation, formula protection, idempotency/conflicts, failed writes/retries, rate guards, strict frontend JSON success, failed requests and duplicate submits. They also assert bundled distributor code matches its tested source and parse frontend JS. Deployment permissions, Google Sheets behavior and cross-origin response readability still require the owner's controlled activation tests.
