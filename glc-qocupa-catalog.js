/*
 * The catalog of Distribuidora GLC, from Q'Ocupa (QOC-49).
 *
 * Gaudi manages her products in Q'Ocupa and publishes them from «Productos → Vista previa de tienda → Publicar».
 * This file reads that published catalog and gives the rest of the site the same shape it always read
 * (window.GLC_CATALOG), so every page keeps working as it is.
 *
 *   - It runs right after data/glc-catalog.js (the static snapshot) and before every script that reads the catalog.
 *   - Cache first: when this browser already read Q'Ocupa's catalog, that copy replaces the static one at once.
 *   - Then it asks Q'Ocupa again in the background; a new version is kept for the next page.
 *   - If Q'Ocupa does not answer, or nothing is published, the static snapshot stays: the site never goes empty.
 *
 * A product that came from the static snapshot keeps its id, its local photo and its «featured» mark (matched by
 * name), so links, carts and the home page do not change. Prices are what a customer pays, IVA included.
 */
(function () {
  'use strict';
  var FEED = 'https://qocupa.cr/tienda/distribuidora-glc/catalogo.json';
  var KEY = 'glc_qocupa_catalog_v1';
  var TIMEOUT_MS = 6000;

  function plain(text) {
    return String(text || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, ' ').trim();
  }
  function slug(text) { return plain(text).replace(/ /g, '-').slice(0, 80); }
  function colones(minor) { return typeof minor === 'number' ? Math.round(minor) / 100 : null; }

  var snapshot = Array.isArray(window.GLC_CATALOG) ? window.GLC_CATALOG : [];
  var byName = {};
  snapshot.forEach(function (item) { if (item && item.name) byName[plain(item.name)] = item; });

  function map(document) {
    if (!document || document.kind !== 'qocupa-storefront-catalog' || !Array.isArray(document.products)) return null;
    var used = {}, images = [];
    var products = document.products.map(function (p) {
      var old = byName[plain(p.name)] || null;
      var id = old && !used[old.id] ? old.id : 'q-' + slug(p.name) + '-' + String(p.id).slice(-6);
      used[id] = true;
      var image = old && old.image && (window.GLC_IMAGE_PATHS || []).indexOf(old.image) !== -1 ? old.image : (p.photo || (old ? old.image : null));
      if (image) images.push(image);
      var item = {
        id: id, name: p.name, category: p.category ? p.category.name : 'Sin categorizar', brand: p.brand || null,
        price_crc: colones(p.price_minor !== null ? p.price_minor : p.price_from_minor), description: p.description || null,
        image: image, source_had_image: !!image, whatsapp_product_url: null, featured: !!(old && old.featured),
        source: 'qocupa', review_required: false, qocupa_id: p.id
      };
      if (Array.isArray(p.variants) && p.variants.length) {
        item.variants = p.variants.map(function (v) { return {label: v.label, price_crc: colones(v.price_minor), qocupa_id: v.id}; });
      }
      return item;
    });
    return products.length ? {version: document.catalog_version, products: products, images: images} : null;
  }

  function apply(mapped) {
    window.GLC_CATALOG = mapped.products;
    var paths = window.GLC_IMAGE_PATHS || [];
    mapped.images.forEach(function (src) { if (paths.indexOf(src) === -1) paths.push(src); });
    window.GLC_IMAGE_PATHS = paths;
    window.GLC_CATALOG_SOURCE = {source: 'qocupa', version: mapped.version};
  }

  var cached = null;
  try { cached = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (_) { cached = null; }
  if (cached && Array.isArray(cached.products) && cached.products.length) apply(cached);
  else window.GLC_CATALOG_SOURCE = {source: 'snapshot'};

  if (!window.fetch) return;
  var controller = window.AbortController ? new AbortController() : null;
  var timer = setTimeout(function () { if (controller) controller.abort(); }, TIMEOUT_MS);
  fetch(FEED, {mode: 'cors', credentials: 'omit', cache: 'no-cache', signal: controller ? controller.signal : undefined})
    .then(function (response) {
      if (response.status === 404) { try { localStorage.removeItem(KEY); } catch (_) {} return null; }
      return response.ok ? response.json() : null;
    })
    .then(function (document) {
      var mapped = document && map(document);
      if (!mapped || (cached && cached.version === mapped.version)) return;
      try { localStorage.setItem(KEY, JSON.stringify(mapped)); } catch (_) {}
    })
    .catch(function () {})
    .then(function () { clearTimeout(timer); });
})();
