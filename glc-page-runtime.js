(function () {
    function openDestination() {
      var id; try { id = decodeURIComponent(location.hash.slice(1)); } catch (e) { return; }
      var target = document.getElementById(id);
      if (target && target.matches('details')) { target.open = true; requestAnimationFrame(function () { target.scrollIntoView(); }); }
    }
    addEventListener('hashchange', openDestination);
    openDestination();
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var target = document.getElementById(a.getAttribute('href').slice(1));
      if (target && target.matches('details')) target.open = true;
    });
    document.querySelectorAll('.cine__frame img[data-image]').forEach(function (img) {
      if (window.GLC_IMAGE_PATHS.indexOf(img.dataset.image) !== -1) img.src = img.dataset.image;
      else { img.remove(); img.closest('.cine__frame').classList.add('is-placeholder'); }
    });
    var toggle = document.querySelector('.mobile-menu-toggle');
    var nav = document.getElementById('primaryNav');
    var currentPath = location.pathname === '/' ? '/index.html' : location.pathname;
    nav.querySelectorAll('a[href]').forEach(function (link) {
      var linkPath = new URL(link.href, location.href).pathname;
      if (linkPath === currentPath) link.setAttribute('aria-current', 'page');
    });
    var more = document.getElementById('navMoreBtn');
    if (more && nav.querySelector('.nav-more__menu a[aria-current="page"]')) more.setAttribute('aria-current', 'page');
    function closeMenu() { nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); }
    toggle.addEventListener('click', function () { var open = nav.classList.toggle('is-open'); toggle.setAttribute('aria-expanded', String(open)); });
    nav.addEventListener('click', function (e) {
      var link = e.target.closest('a');
      if (!link) return;
      closeMenu();
      if (link.hash && link.pathname === location.pathname) {
        var destination = document.getElementById(link.hash.slice(1));
        if (destination) { destination.setAttribute('tabindex', '-1'); destination.focus({ preventScroll: true }); }
      }
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('is-open')) { closeMenu(); toggle.focus(); } });
    document.addEventListener('click', function (e) { if (!e.target.closest('header.site')) closeMenu(); });
    var floating = document.getElementById('whatsappFloat');
    if (!floating) return;
    var queued = false;
    function avoidCards() {
      queued = false;
      var r = floating.getBoundingClientRect();
      var blocked = Array.from(document.querySelectorAll('.feat-card, .cat-card, form, .lux-overlay.is-open, .discovery-preview a, .discovery-actions, .kit-builder, .layaway-actions')).some(function (el) {
        var b = el.getBoundingClientRect();
        return b.width && b.height && b.left < r.right + 8 && b.right > r.left - 8 && b.top < r.bottom + 8 && b.bottom > r.top - 8;
      });
      floating.classList.toggle('is-obstructing', blocked);
    }
    function schedule() { if (!queued) { queued = true; requestAnimationFrame(avoidCards); } }
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule);
    addEventListener('load', schedule);
    new MutationObserver(schedule).observe(document.querySelector('main'), { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  })();
  // SEGURIDAD (RULE-02/RULE-03) — Sanitización anti-inyección (XSS): neutraliza los
  // caracteres/patrones usados para inyectar HTML o JS antes de cualquier fetch().
  // Es una capa extra; el escape definitivo debe hacerse también en el
  // servidor (Apps Script) al escribir en la hoja y al mostrar los datos.
  function sanitize(value) {
    var limpio = String(value == null ? '' : value)
      .replace(/[<>]/g, '')                       // corta apertura/cierre de etiquetas HTML
      .replace(/[\x00-\x1F\x7F]/g, '')            // elimina caracteres de control
      .replace(/javascript:/gi, '')               // esquema de URL peligroso
      .replace(/\bon\w+\s*=/gi, '')                // manejadores de eventos inline
      .replace(/\s{2,}/g, ' ')                     // colapsa espacios múltiples
      .trim();

    // ESCUDO ANTI-INYECCIÓN DE FÓRMULAS (Google Sheets / CSV):
    // si el texto arranca con = + - o @, Sheets lo ejecutaría como fórmula.
    // Anteponer una comilla simple lo fuerza a leerse como texto plano.
    if (/^[=+\-@]/.test(limpio)) {
      limpio = "'" + limpio;
    }

    return limpio;
  }

  /* ---------- Catálogo real: categorías + destacados (datos desde data/glc-catalog.js) ---------- */
  (function () {
    var catGrid = document.getElementById('categoryGrid');
    var grid = document.getElementById('featuredGrid');
    var chipRail = document.getElementById('homeCatChips');
    if (!Array.isArray(window.GLC_CATALOG)) return;

    var catalog = window.GLC_CATALOG.filter(function (p) { return !!p.name && p.public !== false; });
    document.querySelectorAll('[data-public-count]').forEach(function (el) { el.textContent = catalog.length; });

    function formatCRC(n) {
      if (typeof n !== 'number') return null;
      return '₡' + n.toLocaleString('es-CR');
    }

    function waLink(name) {
      var msg = 'Hola, me interesa ' + name + '. ¿Me indican disponibilidad y precio?';
      return 'https://wa.me/50670281688?text=' + encodeURIComponent(msg);
    }

    // ---- Identidad visual por categoría (compartida con catalogo.html): un
    // tinte y un ícono ya existentes en el sitio, nunca inventados. ----
    var CATEGORY_STYLE = {
      'Microblading': { tint: 'gold', icon: 'i-sparkle' },
      'Pestañas': { tint: 'gold', icon: 'i-sparkle' },
      'Lifting y Laminado': { tint: 'gold', icon: 'i-sparkle' },
      'Tintes y Henna': { tint: 'gold', icon: 'i-tag' },
      'Pinzas': { tint: 'berry', icon: 'i-sliders' },
      'Herramientas y Equipos': { tint: 'berry', icon: 'i-sliders' },
      'Pegamentos y Adhesivos': { tint: 'berry', icon: 'i-tag' },
      'Cuidado y Preparación': { tint: 'neutral', icon: 'i-tag' },
      'Consumibles': { tint: 'neutral', icon: 'i-bag' },
      'Accesorios': { tint: 'neutral', icon: 'i-bag' },
      'Kits': { tint: 'neutral', icon: 'i-gift' },
      'Sin categorizar': { tint: 'ink', icon: 'i-tag' }
    };
    function styleFor(category) { return CATEGORY_STYLE[category] || { tint: 'neutral', icon: 'i-tag' }; }

    function buildPlaceholder(category) {
      var style = styleFor(category);
      return {
        tint: style.tint,
        html:
          '<span class="ph-mono" aria-hidden="true">' + (category || '?').charAt(0) + '</span>' +
          '<span class="cat-card__placeholder"><span class="cat-card__icon" aria-hidden="true"><svg class="icon" aria-hidden="true"><use href="#' + style.icon + '"/></svg></span></span>'
      };
    }

    var CATEGORY_PHOTOS = {
      'Lifting y Laminado': { src: 'img/catalog/owner/lifting-golle.jpg', width: 1500, height: 1000 },
      'Consumibles': { src: 'img/catalog/owner/50-aplicadores-sin-pelusa.jpg', width: 1000, height: 1500 },
      'Accesorios': { src: 'img/catalog/owner/almohada-lashista-mas.jpg', width: 1500, height: 1125 },
      'Pestañas': { src: 'img/editorial/lashes.jpg', width: 995, height: 1500 },
      'Pinzas': { src: 'img/catalog/owner/pinza-de-aislar-nariz.jpg', width: 1500, height: 1000 },
      'Pegamentos y Adhesivos': { src: 'img/hero-lash-application.jpg', width: 2000, height: 1333 },
      'Herramientas y Equipos': { src: 'img/catalog/owner/organizacion-para-almacenar.jpg', width: 1500, height: 1000 }
    };

    // ---- Categorías reales (con conteo) ----
    var counts = {};
    catalog.forEach(function (p) { counts[p.category] = (counts[p.category] || 0) + 1; });
    var cats = Object.keys(counts).filter(function (c) { return c !== 'Sin categorizar'; })
      .sort(function (a, b) { return counts[b] - counts[a]; });

    // ---- Grilla editorial: las categorías principales, como puerta de entrada visual ----
    if (catGrid) {
      catGrid.classList.add('cat-grid--editorial');
      cats.slice(0, 6).sort(function (a, b) { return a === 'Pestañas' ? -1 : b === 'Pestañas' ? 1 : 0; }).forEach(function (c, i) {
        var ph = buildPlaceholder(c);
        var card = document.createElement('a');
        card.className = 'cat-card' + (i === 0 ? ' cat-card--feature' : '');
        card.dataset.category = c;
        card.href = 'catalogo.html?cat=' + encodeURIComponent(c);

        var photo = document.createElement('div');
        photo.className = 'cat-card__photo';
        photo.setAttribute('data-tint', ph.tint);
        photo.innerHTML = ph.html;
        if (CATEGORY_PHOTOS[c]) {
          var categoryImage = document.createElement('img');
          categoryImage.src = CATEGORY_PHOTOS[c].src;
          categoryImage.alt = 'Imagen editorial para la categoría ' + c;
          categoryImage.loading = 'lazy';
          categoryImage.decoding = 'async';
          categoryImage.width = CATEGORY_PHOTOS[c].width;
          categoryImage.height = CATEGORY_PHOTOS[c].height;
          photo.appendChild(categoryImage);
          photo.classList.add('has-photo');
        }
        card.appendChild(photo);

        var mark = document.createElement('div');
        mark.className = 'mark';
        card.appendChild(mark);

        var h3 = document.createElement('h3');
        h3.textContent = c;
        card.appendChild(h3);

        var count = document.createElement('span');
        count.className = 'cat-card__count';
        count.innerHTML = counts[c] + ' producto' + (counts[c] === 1 ? '' : 's') + ' <svg class="icon" aria-hidden="true"><use href="#i-arrow-right"/></svg>';
        card.appendChild(count);

        catGrid.appendChild(card);
      });
    }

    if (chipRail) {
      cats.forEach(function (c) {
        var chip = document.createElement('a');
        chip.className = 'cat-chip';
        chip.href = 'catalogo.html?cat=' + encodeURIComponent(c);
        chip.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#i-tag"/></svg> ' + c + ' (' + counts[c] + ')';
        chipRail.appendChild(chip);
      });
    }

    // Merchandise is rendered by glc-commerce.js from the same active catalog.
  })();

  (function () {
    var wrap = document.querySelector('.nav-more');
    var btn = document.getElementById('navMoreBtn');
    if (!wrap || !btn) return;
    function close() {
      wrap.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
    }
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = wrap.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', function (e) {
      if (!wrap.contains(e.target)) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && wrap.classList.contains('is-open')) { close(); btn.focus(); }
    });
    wrap.addEventListener('focusout', function (e) { if (!wrap.contains(e.relatedTarget)) close(); });
    wrap.addEventListener('click', function (e) { if (e.target.closest('a')) close(); });
  })();

  (function () {
    var banner = document.getElementById('promoBanner');
    if (!banner) return;
    var closeBtn = banner.querySelector('.promo-banner__close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        banner.classList.add('is-hidden');
      });
    }
  })();

  /* ---------- Revelado al hacer scroll ---------- */
  /* Marca con .is-visible cada .reveal/.reveal-stagger cuando entra en
     el viewport -- una sola vez (unobserve tras revelar), para que la
     jerarquía de lectura se comunique con movimiento sin quedar
     "saltando" si el usuario vuelve a scrollear. Respeta
     prefers-reduced-motion mostrando todo de inmediato. */
  (function () {
    var targets = document.querySelectorAll('.reveal, .reveal-stagger');
    if (!targets.length) return;

    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || typeof IntersectionObserver === 'undefined') {
      targets.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(function (el) { observer.observe(el); });
  })();

  /* ---------- Botón flotante de WhatsApp (solo móvil, tras el hero) ---------- */
  (function () {
    var btn = document.getElementById('whatsappFloat');
    var hero = document.querySelector('.hero');
    if (!btn || !hero || typeof IntersectionObserver === 'undefined') return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        btn.classList.toggle('is-visible', !entry.isIntersecting);
      });
    }, { threshold: 0 });

    observer.observe(hero);
  })();

  /* ---------- Aviso de cookies y consentimiento ---------- */
  (function () {
    var bar = document.getElementById('cookieBar');
    if (!bar) return;
    var aceptado = false;
    try { aceptado = localStorage.getItem('glc_cookies_ok') === '1'; } catch (e) {}
    if (aceptado) { bar.classList.add('is-hidden'); return; }
    var btn = document.getElementById('cookieAccept');
    if (btn) {
      btn.addEventListener('click', function () {
        bar.classList.add('is-hidden');
        try { localStorage.setItem('glc_cookies_ok', '1'); } catch (e) {}
      });
    }
  })();

  /* ---------- Agendar cita → Google Sheets (Apps Script) ---------- */
  (function () {
    var form = document.getElementById('citaForm');
    if (!form) return;
    var status = document.getElementById('citaStatus');
    var submitBtn = document.getElementById('citaSubmit');
    var fields = Array.prototype.slice.call(form.querySelectorAll('input, select, textarea'));

    // URL del Web App de Google Apps Script para citas (termina en /exec).
    // Mientras no esté configurada, el formulario deriva a WhatsApp.
    var ENDPOINT_CITAS = 'PENDIENTE_URL_APPS_SCRIPT_CITAS';

    var fecha = document.getElementById('cita_fecha');
    if (fecha) {
      var ahora = new Date();
      fecha.min = new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60000)
        .toISOString().slice(0, 10);
    }

    function validateField(el) {
      if (el.name === 'notas') { return true; }
      var wrap = el.closest('.cita-field');
      var ok = (el.type === 'checkbox') ? el.checked : (el.value || '').trim().length > 0;
      if (wrap) { wrap.classList.toggle('invalid', !ok); }
      return ok;
    }

    fields.forEach(function (el) {
      var evt = (el.tagName === 'SELECT' || el.type === 'checkbox') ? 'change' : 'blur';
      el.addEventListener(evt, function () { validateField(el); });
      el.addEventListener('input', function () {
        var wrap = el.closest('.cita-field');
        if (wrap && wrap.classList.contains('invalid')) { validateField(el); }
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var firstInvalid = null;
      fields.forEach(function (el) {
        var ok = validateField(el);
        if (!ok && !firstInvalid) { firstInvalid = el; }
      });
      if (firstInvalid) {
        status.className = 'cita-status error';
        status.textContent = (firstInvalid.type === 'checkbox')
          ? 'Necesitamos tu confirmación para agendar la cita.'
          : 'Revisá el formulario: faltan campos obligatorios.';
        firstInvalid.focus();
        return;
      }

      if (ENDPOINT_CITAS.indexOf('http') !== 0) {
        status.className = 'cita-status error';
        status.textContent = 'El agendado en línea todavía no está activo. Escribinos por WhatsApp al 7028 1688 y te agendamos con gusto.';
        return;
      }

      var payload = new URLSearchParams({
        cliente:    form.nombre.value.trim(),
        telefono:   form.whatsapp.value.trim(),
        servicio:   form.servicio.value,
        fecha_cita: form.fecha_cita.value,
        franja:     form.franja.value,
        notas:      form.notas.value.trim()
      });

      submitBtn.disabled = true;
      status.className = 'cita-status';
      status.textContent = 'Enviando solicitud…';

      fetch(ENDPOINT_CITAS, { method: 'POST', body: payload })
        .then(function (response) {
          if (!response.ok) { throw new Error('HTTP ' + response.status); }
          status.className = 'cita-status ok';
          status.textContent = '¡Solicitud enviada! Te contactaremos por WhatsApp para confirmar tu cita.';
          form.reset();
        })
        .catch(function () {
          status.className = 'cita-status error';
          status.textContent = 'No pudimos enviar la solicitud. Revisá tu conexión e intentá de nuevo, o escribinos por WhatsApp.';
        })
        .then(function () {
          submitBtn.disabled = false;
        });
    });
  })();

  /* ---------- Ventanas modales de lujo (catálogo + citas) ---------- */
  (function () {
    function lockScroll(lock) { document.body.classList.toggle('lux-lock', lock); }
    var returnFocus = new WeakMap();

    function openModal(overlay) {
      if (!overlay) return;
      returnFocus.set(overlay, document.activeElement);
      overlay.classList.add('is-open');
      overlay.setAttribute('aria-hidden', 'false');
      lockScroll(true);
      var closeBtn = overlay.querySelector('.lux-modal__close');
      if (closeBtn) { closeBtn.focus(); }
    }

    function closeModal(overlay) {
      if (!overlay) return;
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
      lockScroll(false);
      var trigger = returnFocus.get(overlay);
      if (trigger && trigger.isConnected) trigger.focus({ preventScroll: true });
    }

    document.querySelectorAll('[data-modal-open]').forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        var overlay = document.querySelector(trigger.getAttribute('data-modal-open'));
        openModal(overlay);
      });
    });

    document.querySelectorAll('.lux-overlay').forEach(function (overlay) {
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) { closeModal(overlay); }
      });
      var closeBtn = overlay.querySelector('.lux-modal__close');
      if (closeBtn) { closeBtn.addEventListener('click', function () { closeModal(overlay); }); }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        document.querySelectorAll('.lux-overlay.is-open').forEach(closeModal);
      }
      if (e.key === 'Tab') {
        var overlay = document.querySelector('.lux-overlay.is-open');
        if (!overlay) return;
        var items = Array.from(overlay.querySelectorAll('a[href], button, input, select, textarea, [tabindex="0"]'))
          .filter(function (el) { return !el.disabled && el.getClientRects().length; });
        var first = items[0];
        var last = items[items.length - 1];
        if (e.shiftKey && (document.activeElement === first || !overlay.contains(document.activeElement))) {
          e.preventDefault(); if (last) last.focus();
        } else if (!e.shiftKey && (document.activeElement === last || !overlay.contains(document.activeElement))) {
          e.preventDefault(); if (first) first.focus();
        }
      }
    });
  })();

  /* ---------- Membresía Estudiante Profesional → Google Sheets (Apps Script) ---------- */
  (function () {
    var form = document.getElementById('estudianteForm');
    if (!form) return;
    var status = document.getElementById('estudianteStatus');
    var submitBtn = document.getElementById('estudianteSubmit');
    var fields = Array.prototype.slice.call(form.querySelectorAll('input, textarea'));

    // URL del Web App de Google Apps Script para la pestaña mayorista "Estudiantes"
    // (termina en /exec). Mientras no esté configurada, el formulario deriva a WhatsApp.
    var ENDPOINT_ESTUDIANTES = 'PENDIENTE_URL_APPS_SCRIPT_ESTUDIANTES';

    function validateField(el) {
      var wrap = el.closest('.lux-field');
      var ok;
      if (el.type === 'checkbox') {
        ok = el.checked;
      } else if (el.type === 'file') {
        ok = !!(el.files && el.files.length > 0);
      } else {
        var value = (el.value || '').trim();
        ok = value.length > 0;
        if (ok && el.type === 'email') {
          ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        }
      }
      if (wrap) { wrap.classList.toggle('invalid', !ok); }
      return ok;
    }

    fields.forEach(function (el) {
      var evt = (el.type === 'checkbox' || el.type === 'file') ? 'change' : 'blur';
      el.addEventListener(evt, function () { validateField(el); });
      el.addEventListener('input', function () {
        var wrap = el.closest('.lux-field');
        if (wrap && wrap.classList.contains('invalid')) { validateField(el); }
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var firstInvalid = null;
      fields.forEach(function (el) {
        var ok = validateField(el);
        if (!ok && !firstInvalid) { firstInvalid = el; }
      });
      if (firstInvalid) {
        status.className = 'lux-status error';
        status.textContent = (firstInvalid.type === 'checkbox')
          ? 'Necesitamos tu confirmación para procesar la solicitud.'
          : 'Revisá el formulario: hay campos obligatorios sin completar.';
        firstInvalid.focus();
        return;
      }

      // SEGURIDAD (RULE-02/RULE-03): sanitizar todos los campos de texto antes
      // de cualquier procesamiento. El archivo "comprobante" viaja aparte (no es
      // texto) y se incorporará a un FormData cuando se conecte el endpoint real.
      var datos = {
        nombre:    sanitize(form.nombre.value),
        whatsapp:  sanitize(form.whatsapp.value),
        correo:    sanitize(form.correo.value),
        instituto: sanitize(form.instituto.value)
      };

      if (ENDPOINT_ESTUDIANTES.indexOf('http') !== 0) {
        status.className = 'lux-status error';
        status.textContent = 'La activación en línea todavía no está disponible. Escribinos por WhatsApp al 7028 1688 y validamos tu comprobante ahí mismo.';
        return;
      }

      // Conexión futura: armar un FormData con `datos` + el archivo de
      // form.comprobante.files[0], y hacer fetch(ENDPOINT_ESTUDIANTES,
      // { method: 'POST', body: formData }) hacia la pestaña "Estudiantes".
      submitBtn.disabled = true;
      status.className = 'lux-status';
      status.textContent = 'Enviando solicitud…';
    });
  })();

  /* ---------- Alianzas para Emprendedores & Logística (B2B) → Google Sheets (Apps Script) ---------- */
  (function () {
    var form = document.getElementById('emprendeForm');
    if (!form) return;
    var status = document.getElementById('emprendeStatus');
    var submitBtn = document.getElementById('emprendeSubmit');
    var fields = Array.prototype.slice.call(form.querySelectorAll('input:not([type="radio"]), textarea'));
    var necesidadRadios = Array.prototype.slice.call(form.querySelectorAll('input[name="necesidad"]'));

    // URL del Web App de Google Apps Script para la pestaña mayorista "Emprendedores B2B"
    // (termina en /exec). Mientras no esté configurada, el formulario deriva a WhatsApp.
    var ENDPOINT_EMPRENDE = 'PENDIENTE_URL_APPS_SCRIPT_EMPRENDEDORES';

    function validateField(el) {
      if (el.name === 'negocio') { return true; } // campo opcional
      var wrap = el.closest('.cita-field');
      var ok;
      if (el.type === 'checkbox') {
        ok = el.checked;
      } else {
        var value = (el.value || '').trim();
        ok = value.length > 0;
        if (ok && el.type === 'email') {
          ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        }
      }
      if (wrap) { wrap.classList.toggle('invalid', !ok); }
      return ok;
    }

    function validateNecesidad() {
      var wrap = necesidadRadios.length ? necesidadRadios[0].closest('.cita-field') : null;
      var ok = necesidadRadios.some(function (r) { return r.checked; });
      if (wrap) { wrap.classList.toggle('invalid', !ok); }
      return ok;
    }

    fields.forEach(function (el) {
      if (el.name === 'negocio') { return; }
      el.addEventListener('blur', function () { validateField(el); });
      el.addEventListener('input', function () {
        var wrap = el.closest('.cita-field');
        if (wrap && wrap.classList.contains('invalid')) { validateField(el); }
      });
    });
    necesidadRadios.forEach(function (r) {
      r.addEventListener('change', validateNecesidad);
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var firstInvalid = null;
      fields.forEach(function (el) {
        if (el.name === 'negocio') { return; }
        var ok = validateField(el);
        if (!ok && !firstInvalid) { firstInvalid = el; }
      });
      if (!validateNecesidad() && !firstInvalid) {
        firstInvalid = necesidadRadios[0];
      }
      if (firstInvalid) {
        status.className = 'cita-status error';
        status.textContent = (firstInvalid.type === 'checkbox')
          ? 'Necesitamos tu confirmación para procesar la solicitud.'
          : 'Revisá el formulario: hay campos obligatorios sin completar.';
        firstInvalid.focus();
        return;
      }

      var necesidadSel = necesidadRadios.filter(function (r) { return r.checked; })[0];

      // SEGURIDAD (RULE-02/RULE-03): sanitizar todos los campos de texto antes
      // de cualquier procesamiento.
      var datos = {
        nombre:    sanitize(form.nombre.value),
        negocio:   sanitize(form.negocio.value),
        whatsapp:  sanitize(form.whatsapp.value),
        correo:    sanitize(form.correo.value),
        necesidad: sanitize(necesidadSel ? necesidadSel.value : ''),
        detalle:   sanitize(form.detalle.value)
      };

      if (ENDPOINT_EMPRENDE.indexOf('http') !== 0) {
        status.className = 'cita-status error';
        status.textContent = 'El envío en línea todavía no está activo. Escribinos por WhatsApp al 7028 1688 y coordinamos tu propuesta.';
        return;
      }

      // Conexión futura: fetch(ENDPOINT_EMPRENDE, { method: 'POST',
      // body: new URLSearchParams(datos) }) hacia la pestaña "Emprendedores B2B".
      submitBtn.disabled = true;
      status.className = 'cita-status';
      status.textContent = 'Enviando propuesta…';
    });
  })();

  /* ---------- Personal Shopper USA → WhatsApp ---------- */
  (function () {
    var gallery = document.querySelector('[data-shopper-lookbook]');
    if (!gallery) return;
    var image = gallery.querySelector('[data-shopper-image]');
    var count = gallery.querySelector('[data-shopper-count]');
    var previous = gallery.querySelector('[data-shopper-prev]');
    var next = gallery.querySelector('[data-shopper-next]');
    var playback = gallery.querySelector('[data-shopper-playback]');
    var photos = [
      ['IMG_8633.jpeg', 'Camiseta turquesa con estampado Champion en una tienda'],
      ['IMG_8632.jpeg', 'Blusa de mezclilla expuesta en una tienda'],
      ['IMG_8626.jpeg', 'Prendas rosadas con estampados de corazones'],
      ['IMG_8627.jpeg', 'Prenda color lila exhibida en una tienda'],
      ['IMG_8630.jpeg', 'Selecci\u00f3n de prendas coloridas con etiquetas de tienda'],
      ['IMG_8635.jpeg', 'Cartera clara expuesta en una tienda'],
      ['IMG_8631.jpeg', 'Cartera negra Calvin Klein en su caja'],
      ['IMG_8622.jpeg', 'Sandalias caf\u00e9 en exhibici\u00f3n'],
      ['IMG_8625.jpeg', 'Sandalias caf\u00e9 en su caja'],
      ['IMG_8629.jpeg', 'Calzado infantil Crocs en una tienda'],
      ['01-retail-display.jpg', 'Exhibición de artículos en una tienda'],
      ['02-cosmetics-shelves.jpg', 'Exhibición de cosméticos en tienda'],
      ['03-shopping-display.jpg', 'Accesorio exhibido en una tienda'],
      ['04-retail-apparel.jpg', 'Área de ropa en tienda'],
      ['05-store-interior.jpg', 'Vista interior de un comercio'],
      ['06-beauty-products.jpg', 'Productos de belleza en tienda'],
      ['07-retail-storefront.jpg', 'Fachada de un comercio'],
      ['08-shopping-mall.jpg', 'Pasillo de centro comercial'],
      ['09-store-interior.jpg', 'Interior de una tienda'],
      ['10-shopping-center.jpg', 'Vista de un centro comercial'],
      ['11-retail-bags.jpg', 'Artículos exhibidos en una tienda'],
      ['12-retail-apparel.jpg', 'Ropa exhibida en una tienda']
    ];
    var index = 0;
    var timer = 0;
    var request = 0;
    var incoming = null;
    var paused = false;
    var hovered = false;
    var focused = false;
    var inView = false;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    function showPhoto(nextIndex) {
      var photoIndex = (nextIndex + photos.length) % photos.length;
      var currentRequest = ++request;
      if (incoming) { incoming.remove(); incoming = null; }
      var candidate = new Image();
      candidate.className = 'shopper-lookbook__incoming';
      candidate.alt = photos[photoIndex][1];
      candidate.decoding = 'async';
      candidate.width = 4;
      candidate.height = 3;
      candidate.setAttribute('aria-hidden', 'true');
      candidate.onload = function () {
        if (currentRequest !== request) return;
        incoming = candidate;
        image.parentNode.appendChild(candidate);
        index = photoIndex;
        if (thumbs) thumbs.querySelectorAll("button").forEach(function (button, position) { button.setAttribute("aria-pressed", String(position === index)); });
        count.textContent = String(index + 1).padStart(2, '0') + ' / ' + String(photos.length).padStart(2, '0');
        function commit() {
          if (currentRequest !== request || incoming !== candidate) return;
          image.remove();
          candidate.className = '';
          candidate.removeAttribute('aria-hidden');
          candidate.setAttribute('data-shopper-image', '');
          image = candidate;
          incoming = null;
        }
        if (reduceMotion.matches) { commit(); return; }
        candidate.addEventListener('transitionend', commit, { once: true });
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            if (currentRequest === request) candidate.classList.add('is-ready');
          });
        });
        // Also finish if a background tab or a motion preference change skips transitionend.
        window.setTimeout(function () { if (incoming === candidate) commit(); }, 500);
      };
      candidate.onerror = function () { if (currentRequest === request) { paused = true; start(); } };
      candidate.src = (photos[photoIndex][0].indexOf('IMG_') === 0 ? 'img/owner-inbox-20261028/' : 'img/editorial/shopper-lookbook/') + photos[photoIndex][0];
    }
    function stop() { window.clearTimeout(timer); timer = 0; }
    function start() {
      stop();
      var canPlay = !reduceMotion.matches && !paused;
      playback.textContent = canPlay ? 'Pausar galería' : 'Reanudar galería';
      playback.hidden = reduceMotion.matches;
      count.setAttribute('aria-live', canPlay && !focused ? 'off' : 'polite');
      if (canPlay && !hovered && !focused && inView && !document.hidden) {
        timer = window.setTimeout(function () { showPhoto(index + 1); start(); }, 5000);
      }
    }
    function manual(direction) { paused = true; start(); showPhoto(index + direction); }
    var thumbs = null;
    if (document.body.classList.contains('service-page')) {
      thumbs = document.createElement('div');
      thumbs.className = 'shopper-thumbnails';
      thumbs.setAttribute('role', 'group');
      thumbs.setAttribute('aria-label', 'Seleccionar fotografía');
      photos.forEach(function (photo, position) {
        var button = document.createElement('button');
        var thumb = document.createElement('img');
        button.type = 'button';
        button.setAttribute('aria-label', photo[1]);
        button.setAttribute('aria-pressed', String(position === 0));
        thumb.alt = '';
        thumb.loading = 'lazy';
        thumb.src = (photo[0].indexOf('IMG_') === 0 ? 'img/owner-inbox-20261028/' : 'img/editorial/shopper-lookbook/') + photo[0];
        button.appendChild(thumb);
        button.addEventListener('click', function () { paused = true; start(); showPhoto(position); });
        thumbs.appendChild(button);
      });
      gallery.appendChild(thumbs);
    }

    previous.addEventListener('click', function () { manual(-1); });
    next.addEventListener('click', function () { manual(1); });
    playback.addEventListener('click', function () { paused = !paused; start(); });
    gallery.addEventListener('mouseenter', function () { hovered = true; start(); });
    gallery.addEventListener('mouseleave', function () { hovered = false; start(); });
    gallery.addEventListener('focusin', function () { focused = true; start(); });
    gallery.addEventListener('focusout', function (event) {
      if (!gallery.contains(event.relatedTarget)) { focused = false; start(); }
    });
    document.addEventListener('visibilitychange', start);
    if (reduceMotion.addEventListener) reduceMotion.addEventListener('change', start);
    if (typeof IntersectionObserver !== 'undefined') {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        start();
      }, { threshold: .15 }).observe(gallery);
    } else { inView = true; }
    start();
  })();

  /* ---------- Personal Shopper USA → WhatsApp ---------- */
  (function () {
    var form = document.getElementById('shopperForm');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var nombre   = (form.nombre.value || '').trim();
      var whatsapp = (form.whatsapp.value || '').trim();
      var producto = (form.producto.value || '').trim();

      if (!nombre || !whatsapp || !producto) {
        form.reportValidity();
        return;
      }

      var texto = '¡Hola Gaudi! Deseo cotizar un artículo con el Personal Shopper USA. ' +
        'Nombre: ' + nombre + ', Teléfono: ' + whatsapp + ', Producto a cotizar: ' + producto;

      window.open(
        'https://wa.me/50670281688?text=' + encodeURIComponent(texto),
        '_blank',
        'noopener'
      );
    });
  })();
