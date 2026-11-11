// Runs glc-qocupa-order.js in a fake browser: which carts go to Q'Ocupa, and what is sent.
// node tools/qocupa-order.test.js
const fs = require('fs'), vm = require('vm'), assert = require('assert'), path = require('path');
const code = fs.readFileSync(path.resolve(__dirname, '..', 'glc-qocupa-order.js'), 'utf8');
const plain = (x) => JSON.parse(JSON.stringify(x));

function bridge(catalog, source, cart) {
  const storage = {'glc.cart.v1': JSON.stringify(cart)};
  const window = {GLC_CATALOG: catalog, GLC_CATALOG_SOURCE: {source}};
  vm.runInNewContext(code, {window, localStorage: {getItem: k => storage[k] || null, removeItem: k => { delete storage[k]; }}});
  return {order: window.GLC_QOCUPA_ORDER, storage};
}

const catalog = [
  {id: 'tinte', name: 'Tinte pestañas', price_crc: 5500, qocupa_id: 'prd_a'},
  {id: 'q-pest', name: 'Pestañas volumen', price_crc: 3500, qocupa_id: 'prd_b',
   variants: [{label: 'S', price_crc: 3500, qocupa_id: 'var_1'}, {label: 'M', price_crc: 3800, qocupa_id: 'var_2'}]},
  {id: 'viejo', name: 'Sin id', price_crc: 100},
];

// A cart of Q'Ocupa's catalog: ids, options and quantities are what goes.
let {order, storage} = bridge(catalog, 'qocupa', [{id: 'tinte', quantity: 2}, {id: 'q-pest', variantIndex: 1, quantity: 1}]);
assert.ok(order.ready());
assert.deepStrictEqual(plain(JSON.parse(order.items())), [{id: 'prd_a', qty: 2}, {id: 'prd_b', variant: 'var_2', qty: 1}]);
assert.strictEqual(order.summary(), '2 × Tinte pestañas; 1 × Pestañas volumen (M)');
assert.strictEqual(order.quantity(), 3);
assert.strictEqual(order.total(), 5500 * 2 + 3800);
assert.strictEqual(order.endpoint, 'https://qocupa.cr/tienda/distribuidora-glc/pedido');
order.clear();
assert.ok(!storage['glc.cart.v1'], 'the cart is emptied after a confirmed order');

// Anything else keeps the old form: the static snapshot, a product without its id, a missing option, an empty cart.
assert.ok(!bridge(catalog, 'snapshot', [{id: 'tinte', quantity: 1}]).order.ready());
assert.ok(!bridge(catalog, 'qocupa', [{id: 'viejo', quantity: 1}]).order.ready());
assert.ok(!bridge(catalog, 'qocupa', [{id: 'q-pest', quantity: 1}]).order.ready());
assert.ok(!bridge(catalog, 'qocupa', []).order.ready());
assert.ok(!bridge(catalog, 'qocupa', Array.from({length: 31}, () => ({id: 'tinte', quantity: 1}))).order.ready());
// Quantities are kept within what Q'Ocupa takes.
assert.deepStrictEqual(plain(JSON.parse(bridge(catalog, 'qocupa', [{id: 'tinte', quantity: 999}]).order.items())), [{id: 'prd_a', qty: 50}]);
console.log('order bridge: 8 scenarios PASS');
