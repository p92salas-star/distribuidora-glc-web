/* Presentation only. Product truth and variant fulfillment remain in glc-catalog.js. */
(function () {
  'use strict';
  var products = Array.isArray(window.GLC_CATALOG) ? window.GLC_CATALOG.filter(function (p) { return p.name && p.public !== false; }) : [];
  var approvedImages = window.GLC_IMAGE_PATHS || [];
  if (document.body.classList.contains('catalog-page')) {
    var nav = document.getElementById('primaryNav');
    var toggle = document.querySelector('.mobile-menu-toggle');
    var more = document.getElementById('navMoreBtn');
    var moreMenu = document.getElementById('navMoreMenu');
    function closeNav() { nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); }
    function closeMore() { more.setAttribute('aria-expanded', 'false'); moreMenu.classList.remove('is-open'); }
    toggle.addEventListener('click', function () { toggle.setAttribute('aria-expanded', String(nav.classList.toggle('is-open'))); });
    more.addEventListener('click', function () { var open = more.getAttribute('aria-expanded') !== 'true'; more.setAttribute('aria-expanded', String(open)); moreMenu.classList.toggle('is-open', open); });
    document.addEventListener('click', function (event) { if (!event.target.closest('header.site')) { closeNav(); closeMore(); } });
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape') { if (nav.classList.contains('is-open')) { closeNav(); toggle.focus(); } if (more.getAttribute('aria-expanded') === 'true') { closeMore(); more.focus(); } } });
    document.querySelector('.promo-banner__close').addEventListener('click', function () { document.getElementById('promoBanner').hidden = true; });
    // Category filters use toggle-button semantics, without incomplete tab widgets.
    var catRail = document.getElementById('catRail');
    catRail.setAttribute('role', 'group');
    function syncFilters() { catRail.querySelectorAll('.cat-pill').forEach(function (button) { button.removeAttribute('role'); button.setAttribute('aria-pressed', button.classList.contains('is-active') ? 'true' : 'false'); button.removeAttribute('aria-selected'); }); }
    var categorySelect = document.getElementById('categorySelect');
    catRail.querySelectorAll('.cat-pill').forEach(function (button) { var option = document.createElement('option'); option.value = button.dataset.cat; option.textContent = button.textContent; categorySelect.appendChild(option); if (button.classList.contains('is-active')) categorySelect.value = button.dataset.cat; });
    categorySelect.addEventListener('change', function () { var button = Array.from(catRail.children).find(function (item) { return item.dataset.cat === categorySelect.value; }); if (button) button.click(); });
    catRail.addEventListener('click', function () { syncFilters(); var active = catRail.querySelector('.is-active'); if (active) categorySelect.value = active.dataset.cat; }); syncFilters();
    document.querySelector('.category-next').addEventListener('click', function () { var wrap = catRail.parentElement; var end = wrap.scrollLeft >= wrap.scrollWidth - wrap.clientWidth - 4; wrap.scrollTo({ left: end ? 0 : wrap.scrollLeft + wrap.clientWidth * .75, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); });
  }
  function icon(name) { return '<svg class="icon" aria-hidden="true"><use href="#i-' + name + '"/></svg>'; }
  function renderMerch(target, ids) {
    if (!target) return;
    ids.forEach(function (id) {
      var p = products.find(function (item) { return item.id === id; });
      if (!p) return;
      var url = 'catalogo.html?product=' + encodeURIComponent(p.id);
      var article = document.createElement('article');
      article.className = 'merch-card';
      var photoLink = document.createElement('a');
      photoLink.className = 'merch-card__image'; photoLink.href = url;
      photoLink.setAttribute('aria-label', 'Ver ' + p.name);
      if (approvedImages.indexOf(p.image) !== -1) {
        var img = document.createElement('img');
        img.src = p.image; img.alt = p.name; img.loading = 'lazy'; img.decoding = 'async'; img.width = 500; img.height = 560;
        photoLink.appendChild(img);
      } else {
        photoLink.classList.add('merch-card__image--unavailable');
        var mark = document.createElement('span'); mark.className = 'merch-card__monogram'; mark.textContent = 'GLC';
        var notice = document.createElement('span'); notice.textContent = 'Fotografía pendiente';
        photoLink.append(mark, notice);
      }
      article.appendChild(photoLink);
      var category = document.createElement('p'); category.className = 'merch-card__category'; category.textContent = p.brand || p.category; article.appendChild(category);
      var title = document.createElement('h3'); var titleLink = document.createElement('a'); titleLink.href = url; titleLink.textContent = p.name; title.appendChild(titleLink); article.appendChild(title);
      var variants = Array.isArray(p.variants) ? p.variants : [];
      var prices = variants.map(function (v) { return typeof v === 'object' && typeof v.price_crc === 'number' ? v.price_crc : p.price_crc; }).filter(function (n) { return typeof n === 'number'; });
      var price = prices.length ? Math.min.apply(Math, prices) : p.price_crc;
      var varied = prices.some(function (n) { return n !== price; });
      if (target.id === 'lashRail') { var count = document.createElement('p'); count.className = 'merch-card__variant-count'; count.textContent = variants.length ? variants.length + ' opciones disponibles' : 'Consultá disponibilidad'; article.appendChild(count); }
      var priceEl = document.createElement('p'); priceEl.className = 'merch-card__price';
      priceEl.textContent = typeof price === 'number' ? (varied ? 'Desde ' : '') + '₡' + price.toLocaleString('es-CR') : 'Precio a confirmar'; article.appendChild(priceEl);
      var link = document.createElement('a'); link.className = 'merch-card__options'; link.href = url;
      link.innerHTML = (variants.length ? 'Elegir opciones' : 'Ver producto') + icon('arrow-right');
      link.setAttribute('aria-label', (variants.length ? 'Elegir opciones de ' : 'Ver producto ') + p.name);
      article.appendChild(link); target.appendChild(article);
    });
  }
  renderMerch(document.getElementById('featuredGrid'), ['tinte-pestanas','maquina-de-cera','agujas-microblanding','vitamina-ayd']);
  renderMerch(document.getElementById('lashRail'), ['pestanas-diy-day-clasi','pestanas-diy-day-3d','diy-day-foxy','diy-day-autofloracion','tinte-pestanas','pinzas-diy-day-unidad']);
  var rail = document.getElementById('lashRail');
  if (rail) {
    var prev = document.querySelector('[data-rail-prev]'); var next = document.querySelector('[data-rail-next]');
    function update() { prev.disabled = rail.scrollLeft < 4; next.disabled = rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 4; }
    [prev, next].forEach(function (button, index) { button.addEventListener('click', function () { rail.scrollBy({ left: (index ? 1 : -1) * (rail.clientWidth * .8), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); }); });
    rail.addEventListener('scroll', update, { passive: true }); window.addEventListener('resize', update); update();
  }
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) { entries.forEach(function (entry) { if (entry.isIntersecting) { entry.target.classList.add('is-seen'); observer.unobserve(entry.target); } }); }, { threshold: .12 });
    document.querySelectorAll('.cat-card__photo, .atelier__image, .lash-edit__heading').forEach(function (el) { el.classList.add('glc-reveal'); observer.observe(el); });
  }
})();
