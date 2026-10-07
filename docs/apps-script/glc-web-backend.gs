/** Paste this ENTIRE file alone into the new MASTER-bound Apps Script (V8).
 * Distributor implementation is bundled below; do not add the modular files too.
 * No calls or changes to the old order deployment.
 */
var GLC_MASTER_SPREADSHEET_ID = '1QydykhTtaD5HqpB04opPU0MTUTeWxKt3YOQkBJTAMA4';
var GLC_BACKEND_BUILD = '2026-10-07-schema-fix-1';
var GLC_ORDER_SOURCE = 'glc_website_order';
var GLC_ORDER_HEADER_ROW = 4;
var GLC_ORDER_FIELDS = ['source', 'order_id', 'cliente', 'telefono', 'telefono_alt', 'email',
  'provincia', 'canton', 'distrito', 'direccion', 'producto', 'categoria', 'cantidad', 'precio', 'pago'];
var GLC_ORDER_BASE_HEADERS = ['Fecha', 'Cliente', 'Teléfono', 'Producto', 'Categoría',
  'Cantidad', 'Precio unitario (₡)', 'Total (₡)', 'Método de pago', 'Estado'];
var GLC_ORDER_EXTRA_HEADERS = ['Order ID', 'Teléfono alternativo', 'Email', 'Provincia',
  'Cantón', 'Distrito', 'Dirección', 'Source', 'Received at'];

function glcMasterSpreadsheet_() {
  return SpreadsheetApp.openById(GLC_MASTER_SPREADSHEET_ID);
}

function glcWebJson_(result) {
  if (result.ok === false) result.build = GLC_BACKEND_BUILD;
  return glcDistributorJson_(result);
}

function glcOrderHeader_(value) {
  return String(value == null ? '' : value).normalize('NFC').trim();
}

function glcOrderHeaderError_(code, index, expected, value) {
  // Never echo cell contents: a wrongly placed header could contain customer data.
  return glcWebJson_({ok: false, error: code, header_row: GLC_ORDER_HEADER_ROW,
    index: index, column: String.fromCharCode(65 + index), expected: expected,
    actual_type: typeof value,
    reason: value === undefined ? 'MISSING_COLUMN' : glcOrderHeader_(value) === '' ? 'EMPTY_HEADER' : 'HEADER_VALUE_MISMATCH'});
}

function doGet(e) {
  // Liveness only: no IDs, spreadsheet contents or claims of a completed write.
  return glcWebJson_({ok: true, service: 'glc-web-backend', master: true, build: GLC_BACKEND_BUILD});
}

function doPost(e) {
  try {
    var source = e && e.parameter && e.parameter.source;
    if (source !== GLC_ORDER_SOURCE && source !== GLC_DISTRIBUTOR_SOURCE) {
      return glcWebJson_({ok: false, error: 'INVALID_SOURCE'});
    }
    if (e.parameters && e.parameters.source && e.parameters.source.length !== 1) {
      return glcWebJson_({ok: false, error: 'INVALID_SOURCE'});
    }
    var validated = source === GLC_ORDER_SOURCE ? glcOrderValidate_(e) : glcDistributorValidate_(e);
    if (validated.error) return glcWebJson_({ok: false, error: validated.error});
    var master = glcMasterSpreadsheet_();
    return source === GLC_ORDER_SOURCE ? glcHandleOrder_(validated.data, master) : glcHandleDistributorLead(e, master);
  } catch (_) {
    return glcWebJson_({ok: false, error: 'STORAGE_UNAVAILABLE'});
  }
}

function glcOrderValidate_(e) {
  if (!e || !e.parameter || (e.postData && e.postData.length > 16000)) return {error: 'INVALID_PAYLOAD'};
  var p = e.parameter, data = {}, invalid = false;
  if (Object.keys(p).some(function (key) { return GLC_ORDER_FIELDS.indexOf(key) < 0; })) return {error: 'INVALID_PAYLOAD'};
  GLC_ORDER_FIELDS.forEach(function (key) {
    if ((p[key] !== undefined && typeof p[key] !== 'string') ||
        (e.parameters && e.parameters[key] && e.parameters[key].length !== 1)) invalid = true;
    data[key] = typeof p[key] === 'string' ? p[key].normalize('NFC').trim() : '';
    if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F\u202A-\u202E\u2066-\u2069]/.test(data[key])) invalid = true;
    data[key] = data[key].replace(/\s+/g, ' ');
  });
  if (invalid) return {error: 'INVALID_PAYLOAD'};
  if (data.source !== GLC_ORDER_SOURCE) return {error: 'INVALID_SOURCE'};
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.order_id)) return {error: 'INVALID_ORDER_ID'};
  var lengths = {cliente: [3,120], canton: [1,120], distrito: [1,120], direccion: [5,1000], producto: [1,300]};
  var badField = Object.keys(lengths).find(function (key) {return data[key].length < lengths[key][0] || data[key].length > lengths[key][1];});
  if (badField) return {error: 'INVALID_' + badField.toUpperCase()};
  for (var i = 0; i < 2; i++) {
    var key = i === 0 ? 'telefono' : 'telefono_alt';
    if (i === 1 && !data[key]) continue;
    if (!/^\+?[\d ().-]+$/.test(data[key])) return {error: 'INVALID_' + key.toUpperCase()};
    data[key] = data[key].replace(/[ ().-]/g, '');
    if (!/^\+?\d{8,15}$/.test(data[key])) return {error: 'INVALID_' + key.toUpperCase()};
  }
  if (data.email && (data.email.length > 254 || !/^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/.test(data.email))) return {error: 'INVALID_EMAIL'};
  data.email = data.email.replace(/@(.+)$/, function (_, domain) {return '@' + domain.toLowerCase();});
  if (['San José','Alajuela','Cartago','Heredia','Guanacaste','Puntarenas','Limón'].indexOf(data.provincia) < 0) return {error: 'INVALID_PROVINCIA'};
  if (['Extensiones de pestañas','Pinzas y herramientas','Pegamentos y removedores','Cuidado y limpieza',
    'Lash lift & brow lift','Kits de inicio y microblading','Personal Shopper USA','Otro'].indexOf(data.categoria) < 0) return {error: 'INVALID_CATEGORIA'};
  if (['SINPE Móvil','Efectivo (contra entrega)','Tarjeta','Transferencia'].indexOf(data.pago) < 0) return {error: 'INVALID_PAGO'};
  if (!/^\d{1,5}$/.test(data.cantidad) || Number(data.cantidad) < 1 || Number(data.cantidad) > 10000) return {error: 'INVALID_CANTIDAD'};
  if (!/^\d{1,10}$/.test(data.precio) || Number(data.precio) > 1000000000) return {error: 'INVALID_PRECIO'};
  data.cantidad = Number(data.cantidad);
  data.precio = Number(data.precio);
  return {data: data};
}

function glcOrderAvailableRow_(sheet) {
  var first = GLC_ORDER_HEADER_ROW + 1, last = sheet.getLastRow();
  // Only H (template Total) is ignored. Preserve any value or formula in A:G/I:S,
  // including zero, false and formulas whose current result is an empty string.
  for (var start = first; start <= last; start += 250) {
    var count = Math.min(250, last - start + 1);
    var range = sheet.getRange(start, 1, count, 19);
    var values = range.getValues(), formulas = range.getFormulas();
    for (var row = 0; row < count; row++) {
      var occupied = values[row].some(function (value, column) {
        return column !== 7 && ((value !== '' && value != null) || formulas[row][column] !== '');
      });
      if (!occupied) return start + row;
    }
  }
  return Math.max(first, last + 1);
}

function glcHandleOrder_(data, master) {
  var lock, locked = false;
  try {
    lock = LockService.getScriptLock();
    locked = lock.tryLock(10000);
    if (!locked) return glcWebJson_({ok: false, error: 'BUSY_RETRY'});
    var sheet = master.getSheetByName('Pedidos');
    if (!sheet) return glcWebJson_({ok: false, error: 'ORDER_SHEET_NOT_FOUND'});
    if (sheet.getLastRow() < GLC_ORDER_HEADER_ROW) return glcWebJson_({ok: false, error: 'ORDER_HEADER_ROW_MISSING', header_row: GLC_ORDER_HEADER_ROW});
    var columns = sheet.getMaxColumns();
    if (columns < 10) return glcOrderHeaderError_('ORDER_BASE_HEADER_MISMATCH', columns, GLC_ORDER_BASE_HEADERS[columns], undefined);
    var base = sheet.getRange(GLC_ORDER_HEADER_ROW, 1, 1, 10).getValues()[0];
    if (base.every(function (value) {return glcOrderHeader_(value) === '';})) return glcWebJson_({ok: false, error: 'ORDER_HEADER_ROW_MISSING', header_row: GLC_ORDER_HEADER_ROW});
    var baseMismatch = base.findIndex(function (value, i) {return glcOrderHeader_(value) !== GLC_ORDER_BASE_HEADERS[i];});
    if (baseMismatch >= 0) return glcOrderHeaderError_('ORDER_BASE_HEADER_MISMATCH', baseMismatch, GLC_ORDER_BASE_HEADERS[baseMismatch], base[baseMismatch]);
    // Diagnose insufficient columns; do not alter the MASTER grid to hide a mismatch.
    if (columns < 19) return glcOrderHeaderError_('ORDER_EXTRA_HEADER_MISMATCH', columns, GLC_ORDER_EXTRA_HEADERS[columns - 10], undefined);
    var extra = sheet.getRange(GLC_ORDER_HEADER_ROW, 11, 1, 9).getValues()[0];
    var extraMismatch = extra.findIndex(function (value, i) {var normalized = glcOrderHeader_(value); return normalized !== '' && normalized !== GLC_ORDER_EXTRA_HEADERS[i];});
    if (extraMismatch >= 0) return glcOrderHeaderError_('ORDER_EXTRA_HEADER_MISMATCH', extraMismatch + 10, GLC_ORDER_EXTRA_HEADERS[extraMismatch], extra[extraMismatch]);
    var hash = glcDistributorHash_(JSON.stringify(data));
    if (sheet.getLastRow() > GLC_ORDER_HEADER_ROW) {
      var found = sheet.getRange(GLC_ORDER_HEADER_ROW + 1, 11, sheet.getLastRow() - GLC_ORDER_HEADER_ROW, 1).createTextFinder(data.order_id)
        .matchEntireCell(true).matchCase(false).useRegularExpression(false).findNext();
      if (found) {
        if (sheet.getRange(found.getRow(), 11).getNote() !== 'glc-order-sha256:' + hash) {
          return glcWebJson_({ok: false, error: 'ORDER_ID_CONFLICT'});
        }
        return glcWebJson_({ok: true, persisted: false, duplicate: true, order_id: data.order_id});
      }
    }
    var cache = CacheService.getScriptCache(), now = Date.now();
    var globalKey = 'glc-order-minute-' + Math.floor(now / 60000);
    var contactKey = 'glc-order-contact-' + Math.floor(now / 3600000) + '-' + glcDistributorHash_(data.telefono);
    var globalCount = Number(cache.get(globalKey) || 0), contactCount = Number(cache.get(contactKey) || 0);
    if (globalCount >= 60 || contactCount >= 5) return glcWebJson_({ok: false, error: 'RATE_LIMITED'});
    cache.put(globalKey, String(globalCount + 1), 120);
    cache.put(contactKey, String(contactCount + 1), 7200);
    extra.forEach(function (value, i) {if (glcOrderHeader_(value) === '') sheet.getRange(GLC_ORDER_HEADER_ROW, 11 + i).setValue(GLC_ORDER_EXTRA_HEADERS[i]);});
    var rowIndex = glcOrderAvailableRow_(sheet);
    if (rowIndex > sheet.getMaxRows()) sheet.insertRowsAfter(sheet.getMaxRows(), 100);
    var literal = glcDistributorLiteral_, received = new Date();
    var row = [received, literal(data.cliente), literal(data.telefono), literal(data.producto), literal(data.categoria),
      data.cantidad, data.precio, data.cantidad * data.precio, literal(data.pago), 'Nuevo', data.order_id,
      literal(data.telefono_alt), literal(data.email), literal(data.provincia), literal(data.canton), literal(data.distrito),
      literal(data.direccion), data.source, received.toISOString()];
    // Durable hash in the Order ID cell NOTE keeps K:S exactly as specified.
    // Flush the note before writing the row: a failed attempt leaves no order ID,
    // and a retry safely reuses the blank row. Never remove notes on stored IDs.
    sheet.getRange(rowIndex, 11).setNote('glc-order-sha256:' + hash);
    SpreadsheetApp.flush();
    sheet.getRange(rowIndex, 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
    sheet.getRange(rowIndex, 2, 1, 4).setNumberFormat('@');
    sheet.getRange(rowIndex, 6, 1, 3).setNumberFormat('0');
    sheet.getRange(rowIndex, 9, 1, 11).setNumberFormat('@');
    sheet.getRange(rowIndex, 1, 1, row.length).setValues([row]);
    SpreadsheetApp.flush();
    return glcWebJson_({ok: true, persisted: true, order_id: data.order_id});
  } catch (_) {
    return glcWebJson_({ok: false, error: 'STORAGE_UNAVAILABLE'});
  } finally {
    if (locked) {try {lock.releaseLock();} catch (_) { /* Preserve acknowledgement. */ }}
  }
}

// BEGIN UNCHANGED DISTRIBUTOR MODULE (kept byte-equivalent after line endings).
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
