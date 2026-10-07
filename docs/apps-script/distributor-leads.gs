/**
 * Add to the EXISTING GLC operational Apps Script project (V8).
 * Route only source=glc_website_distributor_program from its existing doPost.
 * Pass its existing operational Spreadsheet object; no new workbook or endpoint.
 */
var GLC_DISTRIBUTOR_SOURCE = 'glc_website_distributor_program';
var GLC_DISTRIBUTOR_FIELDS = [
  'lead_id', 'created_at', 'status', 'nombre', 'whatsapp', 'email',
  'provincia', 'canton_zona', 'tiene_negocio', 'tipo_negocio', 'mensaje',
  'consentimiento', 'source', 'language'
];
var GLC_DISTRIBUTOR_HEADERS = GLC_DISTRIBUTOR_FIELDS.concat(['received_at', 'payload_hash']);

function glcDistributorJson_(result) {
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

function glcDistributorValidate_(e) {
  if (!e || !e.parameter || (e.postData && e.postData.length > 16000)) return {error: 'INVALID_PAYLOAD'};
  var p = e.parameter, data = {}, error = '';
  if (Object.keys(p).some(function (key) { return GLC_DISTRIBUTOR_FIELDS.indexOf(key) < 0; })) return {error: 'INVALID_PAYLOAD'};
  GLC_DISTRIBUTOR_FIELDS.forEach(function (key) {
    var value = p[key];
    if ((e.parameters && e.parameters[key] && e.parameters[key].length !== 1) ||
        (value !== undefined && typeof value !== 'string')) error = 'INVALID_PAYLOAD';
    data[key] = typeof value === 'string' ? value.normalize('NFC').trim() : '';
    // Permit ordinary multiline comments, but reject hidden controls elsewhere.
    var controls = key === 'mensaje' ? /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/ : /[\x00-\x1F\x7F]/;
    if (controls.test(data[key]) || /[\u202A-\u202E\u2066-\u2069]/.test(data[key])) error = 'INVALID_PAYLOAD';
  });
  if (error) return {error: error};
  if (data.source !== GLC_DISTRIBUTOR_SOURCE) return {error: 'INVALID_SOURCE'};
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.lead_id)) return {error: 'INVALID_LEAD_ID'};
  // Preserve the submitted key exactly for the client's acknowledgement check.
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(data.created_at) ||
      !Number.isFinite(Date.parse(data.created_at)) || new Date(data.created_at).toISOString() !== data.created_at) return {error: 'INVALID_CREATED_AT'};
  if (data.status && data.status !== 'NEW') return {error: 'INVALID_STATUS'};
  data.status = 'NEW';
  data.nombre = data.nombre.replace(/\s+/g, ' ');
  if (data.nombre.length < 3 || data.nombre.length > 120) return {error: 'INVALID_NOMBRE'};
  if (!/^\+?[\d ().-]+$/.test(data.whatsapp)) return {error: 'INVALID_WHATSAPP'};
  data.whatsapp = data.whatsapp.replace(/[ ().-]/g, '');
  if (!/^\+?\d{8,15}$/.test(data.whatsapp)) return {error: 'INVALID_WHATSAPP'};
  if (data.email.length > 254 || !/^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/.test(data.email)) return {error: 'INVALID_EMAIL'};
  data.email = data.email.replace(/@(.+)$/, function (_, domain) { return '@' + domain.toLowerCase(); });
  if (['San José', 'Alajuela', 'Cartago', 'Heredia', 'Guanacaste', 'Puntarenas', 'Limón'].indexOf(data.provincia) < 0) return {error: 'INVALID_PROVINCIA'};
  if (!data.canton_zona || data.canton_zona.length > 120) return {error: 'INVALID_CANTON_ZONA'};
  if (['', 'SI', 'NO'].indexOf(data.tiene_negocio) < 0 || data.tipo_negocio.length > 160 || data.mensaje.length > 1000) return {error: 'INVALID_OPTIONAL_FIELDS'};
  if (data.consentimiento !== 'true') return {error: 'CONSENT_REQUIRED'};
  if (['es', 'en'].indexOf(data.language) < 0) return {error: 'INVALID_LANGUAGE'};
  return {data: data};
}

function glcDistributorHash_(text) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text, Utilities.Charset.UTF_8)
    .map(function (b) { return ('0' + ((b + 256) % 256).toString(16)).slice(-2); }).join('');
}

function glcDistributorLiteral_(value) {
  // Sheets may interpret = as a formula; neutralize common export/CSV prefixes too.
  return /^[=+\-@'\t\r\n]/.test(value) ? "'" + value : value;
}

function glcHandleDistributorLead(e, operationsSpreadsheet) {
  var lock, locked = false;
  try {
    var validated = glcDistributorValidate_(e);
    if (validated.error) return glcDistributorJson_({ok: false, error: validated.error});
    var data = validated.data;
    lock = LockService.getScriptLock();
    locked = lock.tryLock(10000);
    if (!locked) return glcDistributorJson_({ok: false, error: 'BUSY_RETRY'});
    var hash = glcDistributorHash_(JSON.stringify(data));
    var sheet = operationsSpreadsheet.getSheetByName('WEB_DISTRIBUIDORES');
    if (sheet && sheet.getLastRow() > 0) {
      var headers = sheet.getRange(1, 1, 1, GLC_DISTRIBUTOR_HEADERS.length).getValues()[0];
      if (sheet.getLastColumn() !== GLC_DISTRIBUTOR_HEADERS.length ||
          headers.some(function (value, i) { return value !== GLC_DISTRIBUTOR_HEADERS[i]; })) {
        return glcDistributorJson_({ok: false, error: 'SCHEMA_MISMATCH'});
      }
      if (sheet.getLastRow() > 1) {
        var found = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).createTextFinder(data.lead_id)
          .matchEntireCell(true).matchCase(false).useRegularExpression(false).findNext();
        if (found) {
          var storedHash = sheet.getRange(found.getRow(), GLC_DISTRIBUTOR_HEADERS.length).getValue();
          if (storedHash !== hash) return glcDistributorJson_({ok: false, error: 'LEAD_ID_CONFLICT'});
          return glcDistributorJson_({ok: true, persisted: false, duplicate: true, lead_id: data.lead_id});
        }
      }
    }
    // Best-effort abuse guard, under the same lock. Cache eviction can reset limits.
    // Retries of already persisted IDs bypass limits. No raw contact data in cache.
    var cache = CacheService.getScriptCache(), now = Date.now();
    var globalKey = 'glc-dist-minute-' + Math.floor(now / 60000);
    var contactKey = 'glc-dist-contact-' + Math.floor(now / 3600000) + '-' + glcDistributorHash_(data.email.toLowerCase());
    var globalCount = Number(cache.get(globalKey) || 0), contactCount = Number(cache.get(contactKey) || 0);
    if (globalCount >= 60 || contactCount >= 5) return glcDistributorJson_({ok: false, error: 'RATE_LIMITED'});
    cache.put(globalKey, String(globalCount + 1), 120);
    cache.put(contactKey, String(contactCount + 1), 7200);
    if (!sheet) sheet = operationsSpreadsheet.insertSheet('WEB_DISTRIBUIDORES');
    if (sheet.getLastRow() === 0) sheet.getRange(1, 1, 1, GLC_DISTRIBUTOR_HEADERS.length).setValues([GLC_DISTRIBUTOR_HEADERS]);
    var row = GLC_DISTRIBUTOR_FIELDS.map(function (key) { return glcDistributorLiteral_(data[key]); });
    row.push(new Date().toISOString(), hash);
    var nextRow = sheet.getLastRow() + 1;
    if (nextRow > sheet.getMaxRows()) sheet.insertRowsAfter(sheet.getMaxRows(), 100);
    sheet.getRange(nextRow, 1, 1, row.length).setNumberFormat('@').setValues([row]);
    SpreadsheetApp.flush();
    return glcDistributorJson_({ok: true, persisted: true, lead_id: data.lead_id});
  } catch (_) {
    // A failed acknowledgement can follow a completed write: retry the SAME key.
    return glcDistributorJson_({ok: false, error: 'STORAGE_UNAVAILABLE'});
  } finally {
    if (locked) { try { lock.releaseLock(); } catch (_) { /* Do not replace the JSON acknowledgement. */ } }
  }
}
