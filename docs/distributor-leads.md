# Distributor applications — backend contract

Status: **READY FOR MANUAL APPS SCRIPT ACTIVATION**. The operational Apps Script source, editable project ID and clasp setup are absent from this repository. The owner has confirmed one canonical workbook: **Control GLC — MASTER**, ID `1QydykhTtaD5HqpB04opPU0MTUTeWxKt3YOQkBJTAMA4`. All backend operations must target this MASTER; the former duplicate workbooks were removed.

Prepared files: [distributor-leads.gs](apps-script/distributor-leads.gs) (unchanged persistence module) and [master-routing-snippet.gs](apps-script/master-routing-snippet.gs) (MASTER helper plus commented routing insertion). They introduce no workbook, endpoint or frontend credentials. `#distributorForm[data-endpoint]` remains unconfigured until the external backend is updated and verified. No backend or website was deployed; `pedido.html` is untouched.

The exact existing order endpoint, confirmed in both `pedido.html`'s form action and `ENDPOINT`, is:

```text
https://script.google.com/macros/s/AKfycbx6taZhMApzYRCU4ZQsRm6Hgn_0IjYbvHcyFvWg3XkjCLi2VkLLh2I5tRJOzHcUdkRH3Q/exec
```

This identifies the deployment, not the editable script project or verified distributor support.

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

The module validates all fields before storage, normalizes Unicode/name whitespace/phone separators/email domain, forces NEW, and rejects unexpected fields, repeated parameters, invalid enum values and missing consent. It writes the 14 fields in table order, followed by `received_at` and `payload_hash`. Consent is stored as literal text `true`. The owner confirms WEB_DISTRIBUIDORES already exists in MASTER with these exact headers:

```text
lead_id, created_at, status, nombre, whatsapp, email, provincia, canton_zona, tiene_negocio, tipo_negocio, mensaje, consentimiento, source, language, received_at, payload_hash
```

Use that existing tab. Do not delete, recreate or overwrite it to resolve a schema error; an incompatible existing schema fails closed. The module's existing absent/empty-tab initialization remains unchanged and is not an activation step.

A script lock covers deduplication and writes. The same lead_id and normalized payload return duplicate success without another row, including after an acknowledgement is lost. A different payload for a stored ID returns LEAD_ID_CONFLICT. The hash preserves retry semantics even if staff later update the stored status. Keep retries' lead_id, created_at and payload unchanged. Use this one Apps Script project for all writers; separate projects do not share its lock.

Text formatting plus formula-prefix escaping protects submitted values. No personal data is logged or returned beyond lead_id. A best-effort cache guard limits new submissions to 60/minute globally and 5/hour per hashed email; stored-ID retries bypass it. Cache eviction can reset these limits; this is not a complete anti-bot system. Restrict spreadsheet access to authorized GLC staff.

Return a CORS-readable JSON response **only after successful persistence**:

```json
{"ok":true,"persisted":true,"lead_id":"the-submitted-uuid"}
```

An identical retry returns `{"ok":true,"persisted":false,"duplicate":true,"lead_id":"the-submitted-uuid"}`. Failures return `{"ok":false,"error":"CONCISE_CODE"}` (validation, BUSY_RETRY, RATE_LIMITED, SCHEMA_MISMATCH, LEAD_ID_CONFLICT or STORAGE_UNAVAILABLE), without stack traces or internal identifiers. Successful writes are flushed before acknowledgement.

The deployed web app must permit a cross-origin form-urlencoded POST and readable response from the production GLC origin. Verify the actual Apps Script redirect/CORS behavior; do not use `no-cors`, opaque responses or HTTP 200 alone as proof of persistence. If the deployment cannot return readable JSON, use an existing controlled same-origin adapter; do not introduce paid infrastructure by default.

The client requires HTTP success, strict `ok:true`, the exact lead_id, and either `persisted:true` or `persisted:false` with `duplicate:true`. It aborts at 15 seconds, keeps entered data after an uncertain result, and reuses the same payload for unchanged retries. Submission is locked while pending and after success. No personal data is stored in localStorage; refresh clears the retry context.

## Activación manual por el propietario

1. Abrí [Control GLC — MASTER](https://docs.google.com/spreadsheets/d/1QydykhTtaD5HqpB04opPU0MTUTeWxKt3YOQkBJTAMA4/edit) → **Extensiones → Apps Script**.
2. Identificá el proyecto **existente** que contiene el `doPost` de pedidos y cuya implementación coincide con el `/exec` indicado arriba. Si el proyecto abierto desde MASTER no es el propietario de esa implementación, abrí el proyecto operativo correcto desde Apps Script; no publiques un proyecto vacío o duplicado. Confirmá que los accesos a hojas de las rutas existentes apuntan al MASTER. Si conservan un ID eliminado, corregí únicamente esa configuración de destino; conservá su lógica de procesamiento.
3. Agregá un archivo de script `distributor-leads` y pegá el módulo completo, sin reemplazar archivos existentes. Usá el runtime V8. Confirmá la pestaña y los 16 encabezados indicados arriba; no los sobrescribas.
4. Agregá un archivo de script `master-routing-snippet` y pegá el helper preparado. El ID pertenece solo al backend. El archivo incluye la inserción como comentario para evitar un `return` fuera de una función.
5. Copiá **solo el bloque `if` de abajo** dentro del `doPost(e)` existente, al principio y antes de procesar/escribir pedidos. No agregués otro `doPost`. Las demás solicitudes continúan por el código existente sin cambios.
6. Guardá ambos archivos y la inserción en el proyecto operativo.
7. Con autorización del propietario, abrí **Implementar → Gestionar implementaciones**, seleccioná la aplicación web existente, editá y elegí **Nueva versión → Implementar**. Conservá la identidad y configuración de acceso del despliegue operativo. No creés otro backend independiente.
8. Usá el **mismo `/exec`** indicado arriba; su URL debe mantenerse al actualizar esa implementación. No cambiés el endpoint de pedidos.
9. Ejecutá las cuatro comprobaciones de abajo con datos de prueba autorizados y verificá las filas en MASTER. Comprobá también que la respuesta JSON sea legible desde el origen web de GLC, con redirecciones; HTTP 200 por sí solo no basta. No envíes WhatsApp ni crees pedidos reales involuntarios.
10. **Solo después de aprobar esas pruebas**, configurá `#distributorForm[data-endpoint]` con ese `/exec` verificado mediante el proceso normal de publicación web. Esta preparación no modifica el frontend ni despliega nada.

Helper exacto (incluido en `master-routing-snippet.gs`):

```js
var GLC_MASTER_SPREADSHEET_ID =
  '1QydykhTtaD5HqpB04opPU0MTUTeWxKt3YOQkBJTAMA4';

function glcMasterSpreadsheet_() {
  return SpreadsheetApp.openById(GLC_MASTER_SPREADSHEET_ID);
}
```

Inserción exacta dentro del `doPost(e)` existente:

```js
if (e && e.parameter && e.parameter.source === 'glc_website_distributor_program') {
  return glcHandleDistributorLead(e, glcMasterSpreadsheet_());
}
```

### Pruebas de activación pendientes

1. Una solicitud de pedido autorizada conserva su respuesta y procesamiento previo, con destino **Pedidos en MASTER**; no entra al handler de distribuidores.
2. Un POST form-urlencoded de distribuidor con los 14 campos válidos y un UUID v4 nuevo devuelve `ok:true`, `persisted:true` y el mismo lead_id; aparece exactamente una fila en **WEB_DISTRIBUIDORES de MASTER**, con sus 16 columnas.
3. Repetí el POST idéntico, conservando lead_id y created_at: devuelve `ok:true`, `persisted:false`, `duplicate:true`; sigue habiendo una sola fila.
4. Reutilizá ese lead_id cambiando `mensaje`: devuelve `ok:false`, `error:"LEAD_ID_CONFLICT"`; la fila original permanece intacta y no aparece otra.

Pendiente: localizar el proyecto operativo, insertar la ruta, actualizar su implementación con autorización y verificar la persistencia real. No se ejecutaron solicitudes de producción ni se crearon leads de prueba en esta misión.

## Targeted validation

Run `node --test docs/apps-script/distributor-leads.test.cjs` and `node --check glc-opportunities.js`. Tests execute the actual module and client using in-memory service/DOM doubles: validation, complete field persistence, schema safety, formula protection, lock contention, write/flush failures, deduplication/conflicts, row capacity, rate guards, strict frontend acknowledgements, failed requests, double-submit prevention and a lost-response/retry round trip. These confirm code behavior, **not live Google Sheets persistence, deployment permissions or CORS**. Hero code and catalog/delivery data are unchanged.

API references: [ContentService JSON and redirects](https://developers.google.com/apps-script/guides/content), [script locks](https://developers.google.com/apps-script/reference/lock/lock-service).

## Media and accessibility

Hero uses the existing approved `img/editorial/lashes.jpg` plus owner-authorized catalog photos `pestanas-nagaraku-mi.jpg` and `almohada-lashista-mas.jpg`. Distributor image: owner-authorized `organizacion-para-almacenar.jpg`. Provenance: `img/catalog/owner/manifest.json`. No new external or generated imagery.

The first image keeps eager/high-priority loading; additional slides have explicit dimensions and lazy/low-priority loading. Controls are manual under reduced motion; autoplay pauses after manual navigation/focus/swipe, while hidden, hovered or offscreen. A separate resume control allows intentional restart. Existing `glc:language` events translate the new copy, controls, validation and state messages without changing product names.
