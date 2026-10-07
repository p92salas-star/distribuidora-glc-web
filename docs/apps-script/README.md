# GLC public web backend — manual activation

**Ready for deployment, not activated or live-verified.** Paste only [glc-web-backend.gs](glc-web-backend.gs) into the new project bound to **Control GLC — MASTER**, ID `1QydykhTtaD5HqpB04opPU0MTUTeWxKt3YOQkBJTAMA4`. The old order endpoint returns anonymous POST HTTP 401 according to the owner's verification. Do not modify or delete that old deployment/project.

The unified file includes the unchanged, tested distributor module. **Do not also paste `distributor-leads.gs` or `master-routing-snippet.gs`**: that would duplicate declarations. The older routing-insertion approach is superseded. This file defines exactly one `doGet` and one `doPost`. All writes open MASTER explicitly; no other workbook or endpoint is used.

## Owner activation — exact sequence

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
11. Test an anonymous GET: expect `{"ok":true,"service":"glc-web-backend","master":true}`. This is liveness, not proof of a successful Sheets write.
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

Only blank K:S headers **on row 4** are initialized. A missing Pedidos tab or incompatible nonblank header returns `ORDER_SCHEMA_MISMATCH`. No replacement sheet is created. Received at is server ISO UTC. Existing rows are preserved.

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
