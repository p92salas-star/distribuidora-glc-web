// Non-network contract tests: execute the actual Apps Script and frontend in VMs.
const {test} = require('node:test');
const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const {join} = require('node:path');
const {createHash} = require('node:crypto');
const vm = require('node:vm');
const backendSource = readFileSync(join(__dirname, 'distributor-leads.gs'), 'utf8');
const frontendSource = readFileSync(join(__dirname, '../../glc-opportunities.js'), 'utf8');
const id = 'b8a08229-65ec-4a1b-8140-34f7dc86b73e';
function payload(overrides = {}) {
  return Object.assign({lead_id: id, created_at: '2026-10-06T12:00:00.000Z', status: 'NEW',
    nombre: 'Persona de prueba', whatsapp: '+50688888888', email: 'test@example.invalid',
    provincia: 'San José', canton_zona: 'Central', tiene_negocio: 'SI', tipo_negocio: 'Salón',
    mensaje: 'Consulta', consentimiento: 'true', source: 'glc_website_distributor_program', language: 'es'}, overrides);
}
function backend() {
  const rows = [], cache = new Map(), flags = {locked: false, releases: 0, flushes: 0};
  function range(r, c, h = 1, w = 1) {
    const obj = {
      getValues: () => Array.from({length: h}, (_, i) => Array.from({length: w}, (_, j) => rows[r + i - 1]?.[c + j - 1] ?? '')),
      getValue: () => rows[r - 1]?.[c - 1] ?? '',
      setNumberFormat(format) { assert.equal(format, '@'); return obj; },
      setValues(values) {
        assert.equal(flags.locked, true);
        if (flags.writeError) throw Error('private spreadsheet ID/stack');
        values.forEach((row, i) => { rows[r + i - 1] ??= []; row.forEach((v, j) => {rows[r + i - 1][c + j - 1] = v;}); });
        return obj;
      },
      createTextFinder(value) {
        const finder = {
          matchEntireCell(v) { assert.equal(v, true); return finder; },
          matchCase(v) { assert.equal(v, false); return finder; },
          useRegularExpression(v) { assert.equal(v, false); return finder; },
          findNext() {
            const i = rows.findIndex((row, index) => index >= r - 1 && index < r - 1 + h && String(row[c - 1]).toLowerCase() === value.toLowerCase());
            return i < 0 ? null : {getRow: () => i + 1};
          }
        };
        return finder;
      }
    };
    return obj;
  }
  const sheet = {getLastRow: () => rows.length, getLastColumn: () => Math.max(0, ...rows.map(row => row.length)), getRange: range,
    getMaxRows: () => flags.maxRows || 1000, insertRowsAfter: (after, count) => {flags.maxRows = after + count;}};
  const workbook = {
    getSheetByName(name) { assert.equal(name, 'WEB_DISTRIBUIDORES'); return flags.exists ? sheet : null; },
    insertSheet(name) { assert.equal(name, 'WEB_DISTRIBUIDORES'); flags.exists = true; return sheet; }
  };
  const context = vm.createContext({
    ContentService: {MimeType: {JSON: 'application/json'}, createTextOutput: text => ({setMimeType(type) {assert.equal(type, 'application/json'); return JSON.parse(text);}})},
    LockService: {getScriptLock: () => ({tryLock() {flags.locked = !flags.busy; return flags.locked;}, releaseLock() {flags.locked = false; flags.releases++;}})},
    Utilities: {DigestAlgorithm: {SHA_256: 'sha256'}, Charset: {UTF_8: 'utf8'}, computeDigest: (algorithm, text) => Array.from(createHash(algorithm).update(text).digest())},
    CacheService: {getScriptCache: () => ({get: key => cache.get(key), put: (key, value) => cache.set(key, value)})},
    SpreadsheetApp: {flush() {flags.flushes++; if (flags.flushError) throw Error('private error');}}
  });
  vm.runInContext(backendSource, context);
  return {rows, flags, cache, context, send: (p = payload(), extra = {}) => context.glcHandleDistributorLead(Object.assign({parameter: p}, extra), workbook)};
}

test('persists all 14 fields to the operational tab, with receipt time and hash', () => {
  const b = backend(), p = payload();
  assert.deepEqual(b.send(p), {ok: true, persisted: true, lead_id: id});
  assert.equal(b.rows.length, 2);
  assert.equal(b.rows[0].length, 16);
  for (const [index, key] of Object.keys(p).entries()) assert.equal(b.rows[1][index], key === 'whatsapp' ? "'" + p[key] : p[key]);
  assert.match(b.rows[1][14], /^\d{4}-/);
  assert.match(b.rows[1][15], /^[a-f0-9]{64}$/);
  assert.equal(b.flags.flushes, 1);
  assert.equal(b.flags.locked, false);
});
test('same ID retries are idempotent; conflicting payload cannot overwrite or append', () => {
  const b = backend(); b.send();
  b.rows[1][2] = 'CONTACTED'; // Later operational status changes do not break retries.
  assert.deepEqual(b.send(), {ok: true, persisted: false, duplicate: true, lead_id: id});
  assert.deepEqual(b.send(payload({mensaje: 'Different'})), {ok: false, error: 'LEAD_ID_CONFLICT'});
  assert.equal(b.rows.length, 2);
  assert.equal(b.rows[1][2], 'CONTACTED');
});
test('required/server fields, lengths, enum values and parameter pollution fail before storage', () => {
  const bad = {lead_id: 'invalid', created_at: '2026-02-30T12:00:00.000Z', status: 'APPROVED', nombre: 'X', whatsapp: '123', email: 'a@b', provincia: 'Other', canton_zona: '', consentimiento: 'false', source: 'orders', language: 'fr', tiene_negocio: 'YES', tipo_negocio: 'x'.repeat(161), mensaje: 'x'.repeat(1001)};
  for (const [key, value] of Object.entries(bad)) {
    const b = backend(); assert.equal(b.send(payload({[key]: value})).ok, false, key); assert.equal(b.rows.length, 0);
  }
  for (const key of ['lead_id','created_at','nombre','whatsapp','email','provincia','canton_zona','consentimiento','source','language']) {
    const b = backend(), p = payload(); delete p[key]; assert.equal(b.send(p).ok, false, key);
  }
  const b = backend();
  assert.equal(b.send(payload({nombre: 'Ana\u0000 User'})).ok, false);
  assert.equal(b.send(payload({password: 'not-stored'})).ok, false);
  assert.equal(b.send(payload(), {parameters: {consentimiento: ['true', 'false']}}).ok, false);
  assert.equal(b.send(payload(), {postData: {length: 16001}}).ok, false);
  assert.equal(b.rows.length, 0);
});
test('normalizes phone, name, domain and NFC without inventing data; neutralizes formulas', () => {
  const b = backend();
  assert.equal(b.send(payload({nombre: '  Ana   Pérez ', provincia: 'San Jose\u0301', whatsapp: '+506 (8888)-8888', email: 'Ana@EXAMPLE.INVALID', mensaje: '=IMPORTXML("url")'})).ok, true);
  assert.equal(b.rows[1][3], 'Ana Pérez'); assert.equal(b.rows[1][4], "'+50688888888");
  assert.equal(b.rows[1][5], 'Ana@example.invalid'); assert.equal(b.rows[1][10], '\'=IMPORTXML("url")');
  for (const text of ['=1+1', '+1', '-1', '@SUM(A1)', "'=1", '\t=1', '\n=1']) assert.equal(b.context.glcDistributorLiteral_(text), "'" + text);
});
test('lock contention, schema mismatch, write and flush failures return sanitized errors', () => {
  const busy = backend(); busy.flags.busy = true;
  assert.deepEqual(busy.send(), {ok: false, error: 'BUSY_RETRY'}); assert.equal(busy.rows.length, 0);
  const schema = backend(); schema.flags.exists = true; schema.rows.push(['unrelated']);
  assert.deepEqual(schema.send(), {ok: false, error: 'SCHEMA_MISMATCH'}); assert.equal(schema.rows.length, 1);
  const write = backend(); write.flags.writeError = true;
  assert.deepEqual(write.send(), {ok: false, error: 'STORAGE_UNAVAILABLE'}); assert.equal(write.flags.locked, false);
  const uncertain = backend(); uncertain.flags.flushError = true;
  assert.equal(uncertain.send().ok, false); uncertain.flags.flushError = false;
  assert.deepEqual(uncertain.send(), {ok: true, persisted: false, duplicate: true, lead_id: id});
  assert.equal(uncertain.rows.length, 2);
});
test('rate guard limits new leads, uses hashed contact keys, and permits idempotent retries', () => {
  const b = backend(); b.send();
  for (const key of b.cache.keys()) {assert.equal(key.includes('@'), false); b.cache.set(key, '100');}
  assert.equal(b.send().duplicate, true);
  assert.deepEqual(b.send(payload({lead_id: 'c8a08229-65ec-4a1b-8140-34f7dc86b73e'})), {ok: false, error: 'RATE_LIMITED'});
  assert.equal(b.rows.length, 2);
});
test('extends the existing tab when its initial row capacity is exhausted', () => {
  const b = backend(); b.flags.maxRows = 1;
  assert.equal(b.send().persisted, true); assert.equal(b.flags.maxRows, 101);
});

function frontend(fetchImpl) {
  const listeners = {}, controls = {}, calls = [], attrs = {}, status = {dataset: {}}, fieldset = {}, submit = {};
  for (const [name, value] of Object.entries(payload())) controls[name] = {
    value, checked: true, required: ['nombre','whatsapp','email','provincia','canton_zona','consentimiento'].includes(name), maxLength: -1,
    options: [{value: 'San José'}], addEventListener() {}, setAttribute() {}, getAttribute() {}, closest: () => null, focus() {}
  };
  const form = {
    dataset: {endpoint: 'https://example.invalid/mock'}, elements: {namedItem: name => controls[name]},
    querySelector: selector => selector === 'fieldset' ? fieldset : selector === '[type=submit]' ? submit : status,
    querySelectorAll: () => [], setAttribute: (key, value) => {attrs[key] = value;},
    addEventListener: (name, fn) => {listeners[name] = fn;}, reset() {form.resets = (form.resets || 0) + 1;}
  };
  const context = vm.createContext({
    document: {documentElement: {lang: 'es'}, querySelectorAll: () => [], getElementById: name => name === 'distributorForm' ? form : null, addEventListener() {}},
    window: {crypto: {randomUUID: () => id}, setTimeout: () => 1, clearTimeout() {}}, URLSearchParams, AbortController,
    fetch: async (url, options) => {calls.push({url, options}); return fetchImpl(options);}
  });
  vm.runInContext(frontendSource, context);
  return {form, controls, calls, fieldset, submit, send: () => listeners.submit({preventDefault() {}})};
}
const response = result => ({ok: true, json: async () => result});
test('frontend accepts confirmed writes and matching idempotent acknowledgements only', async () => {
  for (const result of [{ok: true, persisted: true, lead_id: id}, {ok: true, persisted: false, duplicate: true, lead_id: id}]) {
    const f = frontend(() => response(result)); await f.send();
    assert.equal(f.form.dataset.state, 'success'); assert.equal(f.form.resets, 1);
    assert.equal(f.fieldset.disabled, true); await f.send(); assert.equal(f.calls.length, 1);
  }
  for (const result of [null, {}, {ok: true}, {ok: true, persisted: false, lead_id: id}, {ok: false, persisted: true, lead_id: id}, {ok: true, persisted: true, lead_id: 'wrong'}, {ok: true, persisted: 'true', lead_id: id}, {ok: true, duplicate: true, lead_id: id}]) {
    const f = frontend(() => response(result)); await f.send();
    assert.equal(f.form.dataset.state, 'error'); assert.equal(f.form.resets, undefined); assert.equal(f.fieldset.disabled, false);
  }
});
test('frontend network/HTTP/JSON failures preserve input; retries reuse the exact payload', async () => {
  for (const fail of [() => {throw Error('network');}, () => ({ok: false}), () => ({ok: true, json() {throw Error('invalid JSON');}})]) {
    let attempts = 0;
    const f = frontend(() => ++attempts === 1 ? fail() : response({ok: true, persisted: false, duplicate: true, lead_id: id}));
    await f.send(); assert.equal(f.form.dataset.state, 'error'); assert.equal(f.controls.nombre.value, payload().nombre);
    await f.send(); assert.equal(f.form.dataset.state, 'success');
    assert.equal(f.calls[0].options.body.toString(), f.calls[1].options.body.toString());
  }
});
test('frontend blocks double submits, invalid fields, and unconfigured backend', async () => {
  let finish;
  const f = frontend(() => new Promise(resolve => {finish = resolve;}));
  const pending = f.send(); assert.equal(f.form.dataset.state, 'submitting'); assert.equal(f.submit.disabled, true);
  await f.send(); assert.equal(f.calls.length, 1);
  finish(response({ok: true, persisted: true, lead_id: id})); await pending;
  const invalid = frontend(() => {throw Error('must not send');}); invalid.controls.consentimiento.checked = false;
  await invalid.send(); assert.equal(invalid.calls.length, 0); assert.equal(invalid.form.dataset.state, 'error');
  const missing = frontend(() => {throw Error('must not send');}); missing.form.dataset.endpoint = '';
  await missing.send(); assert.equal(missing.calls.length, 0); assert.equal(missing.form.dataset.state, 'error');
});
test('frontend and actual backend round trip, including lost acknowledgement then retry', async () => {
  const b = backend(); let first = true;
  const f = frontend(options => {
    const result = b.send(Object.fromEntries(options.body));
    if (first) {first = false; throw Error('response lost after persistence');}
    return response(result);
  });
  await f.send(); assert.equal(f.form.dataset.state, 'error'); assert.equal(b.rows.length, 2);
  await f.send(); assert.equal(f.form.dataset.state, 'success'); assert.equal(b.rows.length, 2);
});
