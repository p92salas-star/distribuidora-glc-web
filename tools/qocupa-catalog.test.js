// Runs glc-qocupa-catalog.js in a fake browser: first visit (no cache), the feed answers, second visit uses it.
const fs = require('fs'), vm = require('vm'), assert = require('assert');
const site = process.argv[2] || require('path').resolve(__dirname, '..');  // node tools/qocupa-catalog.test.js
const code = fs.readFileSync(site + '/glc-qocupa-catalog.js', 'utf8');
const feed = {kind: 'qocupa-storefront-catalog', catalog_version: 'v1', products: [
  {id: 'prd_aaaaaaaaaaaa', name: 'Tinte pestañas', category: {name: 'Tintes y Henna'}, brand: null, description: null,
   price_minor: 550000, price_from_minor: null, variants: [], photo: null},
  {id: 'prd_bbbbbbbbbbbb', name: 'Producto Nuevo Q', category: null, brand: 'X', description: 'd',
   price_minor: null, price_from_minor: 350000, photo: 'https://qocupa.cr/tienda/distribuidora-glc/foto/prd_bbbbbbbbbbbb?v=1',
   variants: [{id: 'var_1', label: 'S', price_minor: 350000}, {id: 'var_2', label: 'M', price_minor: 380000}]}]};

function visit(storage, answer) {
  const snapshot = [{id: 'tinte-pestanas', name: 'Tinte pestañas', image: 'img/catalog/tinte-pestanas.jpg', featured: true, price_crc: 5000}];
  let fetched;
  const window = {GLC_CATALOG: snapshot, GLC_IMAGE_PATHS: ['img/catalog/tinte-pestanas.jpg']};
  window.fetch = (url, opts) => { fetched = {url, opts}; return Promise.resolve(answer); };
  const context = {window, localStorage: {getItem: k => storage[k] || null, setItem: (k, v) => { storage[k] = v; },
    removeItem: k => { delete storage[k]; }}, setTimeout, clearTimeout, AbortController, console};
  context.fetch = window.fetch; context.AbortController = AbortController;
  vm.runInNewContext(code, context);
  return {window, fetched};
}

(async () => {
  const storage = {};
  const first = visit(storage, {status: 200, ok: true, json: () => Promise.resolve(feed)});
  assert.strictEqual(first.window.GLC_CATALOG[0].id, 'tinte-pestanas');  // the snapshot, at once
  assert.strictEqual(first.window.GLC_CATALOG_SOURCE.source, 'snapshot');
  assert.strictEqual(first.fetched.opts.credentials, 'omit');
  await new Promise(r => setTimeout(r, 20));
  assert.ok(storage.glc_qocupa_catalog_v1, 'kept for the next page');
  const second = visit(storage, {status: 200, ok: true, json: () => Promise.resolve(feed)});
  const [tinte, nuevo] = second.window.GLC_CATALOG;
  assert.deepStrictEqual([tinte.id, tinte.price_crc, tinte.image, tinte.featured, tinte.category], ['tinte-pestanas', 5500, 'img/catalog/tinte-pestanas.jpg', true, 'Tintes y Henna']);
  assert.ok(nuevo.id.startsWith('q-producto-nuevo-q-'));
  assert.deepStrictEqual(JSON.parse(JSON.stringify(nuevo.variants.map(v => [v.label, v.price_crc]))), [['S', 3500], ['M', 3800]]);
  assert.strictEqual(nuevo.price_crc, 3500);
  assert.ok(second.window.GLC_IMAGE_PATHS.includes(nuevo.image));
  assert.strictEqual(second.window.GLC_CATALOG_SOURCE.source, 'qocupa');
  // Withdrawn in Q'Ocupa: the copy is forgotten and the next page shows the snapshot.
  visit(storage, {status: 404, ok: false, json: () => Promise.reject()});
  await new Promise(r => setTimeout(r, 20));
  assert.ok(!storage.glc_qocupa_catalog_v1);
  // Q'Ocupa down: nothing breaks.
  const down = visit({}, Promise.reject(new Error('offline')));
  await new Promise(r => setTimeout(r, 20));
  assert.strictEqual(down.window.GLC_CATALOG[0].id, 'tinte-pestanas');
  console.log('loader: 4 scenarios PASS');
})().catch(e => { console.error(e); process.exit(1); });
