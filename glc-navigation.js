(function () {
  'use strict';
  var aliases = {
    catalogo: ['catalogo.html', ''], discovery: ['catalogo.html', 'discovery'],
    'catalogo-real': ['catalogo.html', 'productGrid'], featuredGrid: ['catalogo.html', 'productGrid'],
    'kit-studio': ['catalogo.html', 'kit-studio'], cine: ['catalogo.html', 'productGrid'],
    'agendar-citas': ['citas.html', 'agendar-citas'], citas: ['citas.html', 'agendar-citas'], modalCitas: ['citas.html', 'agendar-citas'],
    apartados: ['apartados.html', 'apartados'], programas: ['beneficios.html', 'programas'],
    modalEstudiante: ['beneficios.html', 'programas'], modalEmprende: ['beneficios.html', 'programas'],
    distribuidores: ['distribuidores.html', 'distribuidores'], 'personal-shopper': ['personal-shopper.html', 'personal-shopper'],
    'como-comprar': ['ayuda.html', 'como-comprar'], entrega: ['ayuda.html', 'entrega'], seguinos: ['index.html', 'portal-access-title']
  };
  function openLegacyDestination() {
    if (!document.body.classList.contains('hub-page') || !location.hash) return;
    var key;
    try { key = decodeURIComponent(location.hash.slice(1)); } catch (_) { return; }
    var target = aliases[key];
    if (target) location.replace(target[0] + (target[1] ? '#' + encodeURIComponent(target[1]) : ''));
  }
  openLegacyDestination();
  window.addEventListener('hashchange', openLegacyDestination);

  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var cards = Array.from(document.querySelectorAll('.portal-card'));
  if (!cards.length) return;
  document.documentElement.classList.add('glc-navigation-ready');
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-entered');
      observer.unobserve(entry.target);
    });
  }, { threshold: .1, rootMargin: '0px 0px -4% 0px' });
  cards.forEach(function (card, index) {
    card.style.setProperty('--portal-order', String(index));
    observer.observe(card);
  });
})();
