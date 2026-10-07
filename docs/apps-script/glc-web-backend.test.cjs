// No network or live Sheets writes. Execute the shipped backend and order script.
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {createHash, webcrypto} = require('node:crypto');
const read = file => fs.readFileSync(path.join(__dirname, file), 'utf8').replace(/\r\n/g, '\n');
const code = read('glc-web-backend.gs');
const html = read('../../pedido.html');
const orderScript = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]).find(s => s.includes('var ENDPOINT'));
const id = 'b8a08229-65ec-4a1b-8140-34f7dc86b73e';
function order(changes = {}) {
  return Object.assign({source: 'glc_website_order', order_id: id, cliente: 'Persona de prueba', telefono: '+50688888888',
    telefono_alt: '', email: '', provincia: 'San José', canton: 'Central', distrito: 'Carmen', direccion: 'Dirección de prueba',
    producto: 'Producto de prueba', categoria: 'Otro', cantidad: '2', precio: '2500', pago: 'SINPE Móvil'}, changes);
}
function backend() {
  const flags = {locked: false, opens: 0, flushes: 0}, cache = new Map(), sheets = {};
  function makeSheet(rows = []) {
    const notes = new Map(), writes = [], sheet = {rows, notes, writes, columns: 19, capacity: 1000,
      getLastRow: () => rows.length, getLastColumn: () => Math.max(0, ...rows.map(r => r.length)),
      getMaxRows: () => sheet.capacity, getMaxColumns: () => sheet.columns,
      insertRowsAfter: (after, n) => {sheet.capacity = after + n;}, insertColumnsAfter: (after, n) => {sheet.columns = after + n;}};
    sheet.getRange = (r, c, h = 1, w = 1) => {
      const range = {getRow: () => r, getValue: () => rows[r - 1]?.[c - 1] ?? '',
        getValues: () => Array.from({length: h}, (_, i) => Array.from({length: w}, (_, j) => rows[r + i - 1]?.[c + j - 1] ?? '')),
        getNote: () => notes.get(`${r}:${c}`) || '',
        setNote(value) {if (flags.noteError) throw Error('private note error'); notes.set(`${r}:${c}`, value); return range;},
        setNumberFormat: () => range,
        setValue: value => range.setValues([[value]]),
        setValues(values) {
          assert.equal(flags.locked, true);
          if (flags.writeError && r > 1) throw Error('private write error');
          writes.push({r, c, values});
          values.forEach((row, i) => {rows[r + i - 1] ??= []; row.forEach((value, j) => {rows[r + i - 1][c + j - 1] = value;});});
          return range;
        },
        createTextFinder(value) {
          const finder = {matchEntireCell(v) {assert.equal(v, true); return finder;}, matchCase(v) {assert.equal(v, false); return finder;},
            useRegularExpression(v) {assert.equal(v, false); return finder;},
            findNext() {const i = rows.findIndex((row, i) => i >= r - 1 && i < r - 1 + h && String(row[c - 1]).toLowerCase() === value.toLowerCase()); return i < 0 ? null : {getRow: () => i + 1};}};
          return finder;
        }
      };
      return range;
    };
    return sheet;
  }
  const master = {getSheetByName: name => sheets[name] || null, insertSheet(name) {return sheets[name] = makeSheet();}};
  const context = vm.createContext({
    ContentService: {MimeType: {JSON: 'application/json'}, createTextOutput: text => ({setMimeType(type) {assert.equal(type, 'application/json'); return JSON.parse(text);}})},
    SpreadsheetApp: {openById(value) {assert.equal(value, '1QydykhTtaD5HqpB04opPU0MTUTeWxKt3YOQkBJTAMA4'); flags.opens++; if (flags.openError) throw Error('private ID'); return master;},
      flush() {flags.flushes++; if (flags.flushError || flags.flushFailAt === flags.flushes) throw Error('private flush error');}},
    LockService: {getScriptLock: () => ({tryLock() {flags.locked = !flags.busy; return flags.locked;}, releaseLock() {flags.locked = false;}})},
    CacheService: {getScriptCache: () => ({get: key => cache.get(key), put: (key, value) => cache.set(key, value)})},
    Utilities: {DigestAlgorithm: {SHA_256: 'sha256'}, Charset: {UTF_8: 'utf8'}, computeDigest: (algorithm, value) => Array.from(createHash(algorithm).update(value).digest())}
  });
  vm.runInContext(code, context);
  sheets.Pedidos = makeSheet([Array.from(context.GLC_ORDER_BASE_HEADERS)]);
  return {flags, cache, sheets, context, send: (p = order(), extra = {}) => context.doPost(Object.assign({parameter: p}, extra))};
}
test('bundles the tested distributor module without changes and parses order JS', () => {
  assert.equal(code.split('// BEGIN UNCHANGED DISTRIBUTOR MODULE (kept byte-equivalent after line endings).\n')[1], read('distributor-leads.gs'));
  new vm.Script(orderScript); new vm.Script(read('../../glc-opportunities.js'));
});
test('health is non-sensitive; unknown/missing/repeated sources never open MASTER', () => {
  const b = backend();
  assert.deepEqual(b.context.doGet(), {ok: true, service: 'glc-web-backend', master: true});
  for (const p of [{}, order({source: 'orders'}), order({source: undefined})]) assert.deepEqual(b.send(p), {ok: false, error: 'INVALID_SOURCE'});
  assert.equal(b.send(order(), {parameters: {source: ['glc_website_order', 'other']}}).error, 'INVALID_SOURCE');
  assert.equal(b.flags.opens, 0);
});
test('order persists A:S with numeric totals, Nuevo status, note hash; legacy A:J stays intact', () => {
  const b = backend(), s = b.sheets.Pedidos, legacy = ['old date','Legacy','88888888','Old','Otro',1,1000,1000,'Tarjeta','Entregado'];
  const headers = [...s.rows[0]]; s.rows.push([...legacy]); s.columns = 10;
  assert.deepEqual(b.send(), {ok: true, persisted: true, order_id: id});
  assert.deepEqual(s.rows[0].slice(0,10), headers); assert.deepEqual(s.rows[1], legacy);
  assert.deepEqual(s.rows[0].slice(10), Array.from(b.context.GLC_ORDER_EXTRA_HEADERS));
  assert.equal(s.rows[2].length, 19); assert.equal(s.rows[2][7], 5000); assert.equal(s.rows[2][9], 'Nuevo');
  assert.equal(s.rows[2][10], id); assert.equal(s.rows[2][17], 'glc_website_order');
  assert.match(s.notes.get('3:11'), /^glc-order-sha256:[a-f0-9]{64}$/);
  assert.equal(s.writes.some(w => w.r === 1 && w.c <= 10), false);
  assert.equal(b.flags.locked, false);
});
test('same normalized order is idempotent; different payload conflicts even after status change', () => {
  const b = backend(); b.send(); b.sheets.Pedidos.rows[1][9] = 'Contactado';
  assert.deepEqual(b.send(order({telefono: '+506 (8888)-8888', cliente: ' Persona  de prueba '})), {ok: true, persisted: false, duplicate: true, order_id: id});
  assert.deepEqual(b.send(order({precio: '2600'})), {ok: false, error: 'ORDER_ID_CONFLICT'});
  assert.equal(b.sheets.Pedidos.rows.length, 2);
});
test('server rejects invalid fields, totals and parameter pollution without writing', () => {
  const cases = {order_id: 'bad', cliente: 'X', telefono: '123', telefono_alt: 'bad', email: 'x@bad', provincia: 'Other', canton: '', distrito: '', direccion: 'X', producto: '', categoria: 'Bad', cantidad: '1.5', precio: '-1', pago: 'Unknown'};
  for (const [key, value] of Object.entries(cases)) {
    const b = backend(); assert.equal(b.send(order({[key]: value})).ok, false, key); assert.equal(b.flags.opens, 0);
  }
  for (const overrides of [{cantidad: '10001'}, {cantidad: '0'}, {precio: '1.5'}, {precio: '1000000001'}, {cliente:'x'.repeat(121)}, {producto:'x'.repeat(301)}, {direccion: 'x'.repeat(1001)}, {cliente:'Ana\u0000 User'}, {total:'1'}, {password:'secret'}]) {
    const b = backend(); assert.equal(b.send(order(overrides)).ok, false); assert.equal(b.flags.opens, 0);
  }
  const b = backend(); assert.equal(b.send(order(), {parameters: {cantidad: ['2','3']}}).ok, false);
  assert.equal(b.send(order(), {postData: {length:16001}}).ok, false);
  assert.equal(b.send(order({precio: '0'})).persisted, true); assert.equal(b.sheets.Pedidos.rows[1][7], 0);
});
test('formula prefixes are protected in stored text, with +phone normalized independently', () => {
  const b = backend(); assert.equal(b.send(order({cliente:'=HYPERLINK("x")', producto:'@cmd', direccion:'-123 calle', telefono:'+506 (8888)-8888'})).ok, true);
  const row = b.sheets.Pedidos.rows[1]; assert.equal(row[1], '\'=HYPERLINK("x")'); assert.equal(row[2], "'+50688888888");
  assert.equal(row[3], "'@cmd"); assert.equal(row[16], "'-123 calle");
});
test('schema mismatch fails closed; only blank K:S headers are initialized', () => {
  for (const col of [0,10]) {const b = backend(); b.sheets.Pedidos.rows[0][col] = 'Different'; assert.equal(b.send().error, 'ORDER_SCHEMA_MISMATCH'); assert.equal(b.sheets.Pedidos.writes.length, 0);}
  const b = backend(); b.sheets.Pedidos.rows[0][10] = 'Order ID'; b.send();
  assert.equal(b.sheets.Pedidos.writes.some(w => w.r === 1 && w.c === 11), false);
});
test('busy/storage failures are sanitized; failed writes and lost acknowledgements are retryable', () => {
  for (const flag of ['busy','openError','noteError','writeError','flushError']) {
    const b = backend(); b.flags[flag] = true;
    assert.deepEqual(b.send(), {ok: false, error: flag === 'busy' ? 'BUSY_RETRY' : 'STORAGE_UNAVAILABLE'});
    assert.equal(b.sheets.Pedidos.rows.length, 1); b.flags[flag] = false; assert.equal(b.send().persisted, true);
  }
  const b = backend(); b.send(); // Discard response, as if it were lost in transit.
  assert.equal(b.send().duplicate, true); assert.equal(b.sheets.Pedidos.rows.length, 2);
  const uncertain = backend(); uncertain.flags.flushFailAt = 2;
  assert.equal(uncertain.send().error, 'STORAGE_UNAVAILABLE');
  assert.equal(uncertain.send().duplicate, true); assert.equal(uncertain.sheets.Pedidos.rows.length, 2);
});
test('rate guard blocks new IDs, hashes contact keys, and allows confirmed retries', () => {
  const b = backend(); b.send();
  for (const key of b.cache.keys()) {assert.equal(key.includes('88888888'), false); b.cache.set(key, '100');}
  assert.equal(b.send().duplicate, true);
  assert.equal(b.send(order({order_id:'c8a08229-65ec-4a1b-8140-34f7dc86b73e'})).error, 'RATE_LIMITED');
});
test('unified distributor route persists, retries and rejects conflicts through MASTER', () => {
  const b = backend(), p = {lead_id:id, created_at:'2026-10-07T12:00:00.000Z', status:'NEW', nombre:'Persona de prueba',
    whatsapp:'+50688888888', email:'test@example.invalid', provincia:'San José', canton_zona:'Central', tiene_negocio:'',
    tipo_negocio:'', mensaje:'Prueba', consentimiento:'true', source:'glc_website_distributor_program', language:'es'};
  assert.deepEqual(b.send(p), {ok:true, persisted:true, lead_id:id});
  assert.deepEqual(b.send(p), {ok:true, persisted:false, duplicate:true, lead_id:id});
  assert.equal(b.send({...p, mensaje:'Otro'}).error, 'LEAD_ID_CONFLICT');
  assert.equal(b.sheets.WEB_DISTRIBUIDORES.rows.length, 2); assert.equal(b.sheets.Pedidos.rows.length, 1);
});

function frontend(fetchImpl, configured = true, fallback = false) {
  const listeners = {}, calls = [], status = {}, button = {}, values = order(), controls = {};
  const names = ['nombre','whatsapp','telefono_alt','email','provincia','canton','distrito','direccion','producto','categoria','cantidad','precio','pago','privacidad'];
  names.forEach(name => {controls[name] = {name, value: name === 'nombre' ? values.cliente : name === 'whatsapp' ? values.telefono : values[name] || (name === 'email' ? 'test@example.invalid' : '88888888'),
    type: name === 'privacidad' ? 'checkbox' : name === 'email' ? 'email' : 'text', checked:true, tagName:'INPUT',
    closest: () => null, addEventListener() {}, focus() {}};});
  const form = Object.assign({querySelectorAll: () => Object.values(controls), addEventListener: (event, fn) => {listeners[event] = fn;},
    reset() {form.resets = (form.resets || 0) + 1;}}, controls);
  let ids = 0;
  const context = vm.createContext({document: {getElementById: name => ({orderForm:form, formStatus:status, orderSubmit:button})[name]},
    window: {crypto: fallback ? webcrypto : {randomUUID: () => (++ids === 1 ? id : 'c8a08229-65ec-4a1b-8140-34f7dc86b73e')}, setTimeout: () => 1, clearTimeout() {}},
    URLSearchParams, AbortController, fetch: async (url, options) => {calls.push({url, options}); return fetchImpl(options);}});
  if (fallback) context.window.crypto = {getRandomValues: bytes => webcrypto.getRandomValues(bytes)};
  vm.runInContext(configured ? orderScript.replace('PENDING_VERIFIED_GLC_WEB_BACKEND_EXEC_URL', 'https://script.google.com/macros/s/TEST_ONLY/exec') : orderScript, context);
  return {form, status, controls, calls, button, send: () => listeners.submit({preventDefault() {}})};
}
const settle = () => new Promise(resolve => setImmediate(resolve));
const response = result => ({ok:true, json:async () => result});
test('order client confirms matching JSON only; HTTP 200 errors/malformed responses preserve data', async () => {
  for (const result of [{ok:true,persisted:true,order_id:id}, {ok:true,persisted:false,duplicate:true,order_id:id}]) {
    const f = frontend(() => response(result)); f.send(); await settle(); assert.equal(f.form.resets, 1); assert.equal(f.status.className, 'form-status ok');
  }
  for (const result of [null, {}, {ok:false,persisted:true,order_id:id}, {ok:true,persisted:false,order_id:id}, {ok:true,persisted:true,order_id:'wrong'}, {ok:true,persisted:'true',order_id:id}]) {
    const f = frontend(() => response(result)); f.send(); await settle(); assert.equal(f.form.resets, undefined); assert.equal(f.status.className, 'form-status error'); assert.equal(f.controls.nombre.value, order().cliente);
  }
});
test('network/HTTP/JSON failures retain exact retry ID; no double submit or placeholder request', async () => {
  for (const fail of [() => {throw Error('network');}, () => ({ok:false}), () => ({ok:true,json() {throw Error('JSON');}})]) {
    let attempt = 0; const f = frontend(() => ++attempt === 1 ? fail() : response({ok:true,persisted:false,duplicate:true,order_id:id}));
    f.send(); f.send(); await settle(); assert.equal(f.calls.length, 1); assert.equal(f.form.resets, undefined);
    f.send(); await settle(); assert.equal(f.form.resets, 1); assert.equal(f.calls[0].options.body.toString(), f.calls[1].options.body.toString());
  }
  const pending = frontend(() => {throw Error('must not call');}, false); pending.send(); await settle(); assert.equal(pending.calls.length, 0);
  for (const key of ['cantidad','precio']) {const f = frontend(() => {throw Error('must not call');}); f.controls[key].value = '1.5'; f.send(); assert.equal(f.calls.length, 0);}
});
test('client generates a new UUID for changed data and a secure fallback UUID when required', async () => {
  const f = frontend(() => {throw Error('network');}); f.send(); await settle(); f.controls.producto.value = 'Changed'; f.send(); await settle();
  assert.notEqual(f.calls[0].options.body.get('order_id'), f.calls[1].options.body.get('order_id'));
  const fallback = frontend(() => {throw Error('network');}, true, true); fallback.send(); await settle();
  assert.match(fallback.calls[0].options.body.get('order_id'), /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/);
});
test('actual order frontend/backend round trip recovers a lost acknowledgement without duplicating', async () => {
  const b = backend(); let first = true;
  const f = frontend(options => {const result = b.send(Object.fromEntries(options.body)); if (first) {first=false; throw Error('lost response');} return response(result);});
  f.send(); await settle(); assert.equal(f.status.className, 'form-status error'); assert.equal(b.sheets.Pedidos.rows.length, 2);
  f.send(); await settle(); assert.equal(f.status.className, 'form-status ok'); assert.equal(b.sheets.Pedidos.rows.length, 2);
});
