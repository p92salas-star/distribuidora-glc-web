/*
 * Orders from the cart reach Gaudi's panel in Q'Ocupa (QOC-49 phase 1b).
 *
 * pedido.html asks window.GLC_QOCUPA_ORDER whether the cart can go to Q'Ocupa. It can when every product in the cart
 * came from Q'Ocupa's published catalog, so each has its Q'Ocupa id and, if it has options, the option's id. Then:
 *   - the form shows the cart, and its product, quantity and price fields are filled from it (Q'Ocupa prices each
 *     line again from the published catalog: these fields are only what the customer reads);
 *   - the order is sent with the cart's ids and quantities, plus the customer's contact;
 *   - Q'Ocupa answers the same contract as before ({ok, order_id, persisted, duplicate}).
 * If the cart came from the static snapshot, or is empty, nothing changes: the form works as it always did.
 */
(function () {
  'use strict';
  var ENDPOINT = 'https://qocupa.cr/tienda/distribuidora-glc/pedido';
  var CART_KEY = 'glc.cart.v1';

  function cart() {
    try {
      var parsed = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) { return []; }
  }

  function lines() {
    var catalog = Array.isArray(window.GLC_CATALOG) ? window.GLC_CATALOG : [];
    var source = window.GLC_CATALOG_SOURCE || {};
    if (source.source !== 'qocupa') return null;
    var stored = cart(), out = [];
    if (!stored.length || stored.length > 30) return null;
    for (var i = 0; i < stored.length; i++) {
      var item = stored[i] || {};
      var product = catalog.find(function (p) { return p.id === item.id; });
      if (!product || !product.qocupa_id) return null;
      var variants = product.variants || [], variant = null;
      if (variants.length) {
        variant = variants[item.variantIndex];
        if (!variant || !variant.qocupa_id) return null;
      }
      var quantity = Math.max(1, Math.min(50, Math.round(Number(item.quantity) || 1)));
      var price = variant && typeof variant.price_crc === 'number' ? variant.price_crc : product.price_crc;
      out.push({id: product.qocupa_id, variant: variant ? variant.qocupa_id : undefined, qty: quantity,
                name: product.name, option: variant ? variant.label : '', price: typeof price === 'number' ? price : 0});
    }
    return out;
  }

  window.GLC_QOCUPA_ORDER = {
    endpoint: ENDPOINT,
    lines: lines,
    ready: function () { return !!lines(); },
    items: function () {
      return JSON.stringify((lines() || []).map(function (l) {
        return l.variant ? {id: l.id, variant: l.variant, qty: l.qty} : {id: l.id, qty: l.qty};
      }));
    },
    summary: function () {
      return (lines() || []).map(function (l) { return l.qty + ' × ' + l.name + (l.option ? ' (' + l.option + ')' : ''); })
        .join('; ').slice(0, 480);
    },
    quantity: function () { return (lines() || []).reduce(function (n, l) { return n + l.qty; }, 0); },
    total: function () { return (lines() || []).reduce(function (n, l) { return n + Math.round(l.price * l.qty); }, 0); },
    clear: function () { try { localStorage.removeItem(CART_KEY); } catch (_) {} }
  };
})();
