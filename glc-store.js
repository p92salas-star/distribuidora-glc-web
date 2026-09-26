/* Small, local-only shopping bag and curated interface translations. No checkout service. */
(function () {
  'use strict';
  var CART_KEY = 'glc.cart.v1', LANG_KEY = 'glc.language';
  var products = (window.GLC_CATALOG || []).filter(function (p) { return p.name && p.public !== false; });
  var storageAvailable = true;
  function read(key) { try { return localStorage.getItem(key); } catch (_) { storageAvailable = false; return null; } }
  function write(key, value) { try { localStorage.setItem(key, value); } catch (_) { storageAvailable = false; } }
  var language = read(LANG_KEY) === 'en' ? 'en' : 'es';
  var words = {
    'Catálogo':'Catalog', 'Pedidos':'Orders', 'Citas':'Appointments', 'Más':'More', 'Menú':'Menu', 'Inicio':'Home',
    'Programas profesionales':'Professional programs', 'Entregas y pagos':'Delivery & payment', 'Recompensas':'Rewards',
    'Promociones de la semana:':'This week’s promotion:', '¡Envíos gratis al Valle Central':'Free Central Valley delivery',
    'por':'on', 'compras mayores a ₡30,000!':'orders over ₡30,000!',
    'Tu técnica.':'Your technique.', 'Tu estilo.':'Your style.', 'Tus esenciales.':'Your essentials.',
    'Insumos profesionales para pestañas, cejas y microblading. Encontrá extensiones, pinzas, adhesivos y kits para tu trabajo de cada día.':'Professional supplies for lashes, brows and microblading. Explore extensions, tweezers, adhesives and kits for your everyday work.',
    'Pedir por WhatsApp':'Order on WhatsApp', 'Explorar el catálogo':'Explore the catalog',
    'Entrega en el Valle Central y envíos a todo Costa Rica.':'Central Valley delivery and shipping throughout Costa Rica.',
    'Tu estudio. Tus herramientas. Tu siguiente creación.':'Your studio. Your tools. Your next creation.',
    'Explorá':'Explore', 'esenciales de belleza ↗':'beauty essentials ↗',
    'Encontrá tu':'Find your', 'siguiente esencial.':'next essential.',
    'De la primera preparación al último detalle. Elegí por dónde empezar.':'From the first preparation to the finishing touch. Choose where to begin.',
    'Ver todas las categorías':'Explore all categories', 'Selección GLC.':'The GLC edit.',
    'Herramientas, fórmulas y pestañas para tu técnica. Explorá las opciones y hacelas parte de tu estudio.':'Tools, formulas and lashes for your technique. Explore the options and bring them into your studio.',
    'Ver catálogo completo (':'View the full catalog (', 'productos)':'products)', 'Prefiero preguntar por WhatsApp':'Ask us on WhatsApp',
    'Precios de catálogo. Confirmamos disponibilidad y precio final por WhatsApp.':'Catalog prices. Availability and final price confirmed on WhatsApp.',
    'El detalle':'The detail', 'lo cambia':'changes', 'todo.':'everything.',
    'Tu mirada profesional hace la diferencia. Encontrá pestañas, pinzas y adhesivos para darle forma a cada técnica.':'Your professional eye makes the difference. Discover lashes, tweezers and adhesives for every technique.',
    'Explorar pestañas':'Explore lashes', 'Productos reales.':'Real products.', 'Para profesionales reales.':'For real professionals.',
    'Una mirada.':'One look.', 'Muchas posibilidades.':'Many possibilities.',
    'Hacé crecer':'Grow', 'lo que te apasiona.':'what you love.',
    'Membresía Estudiante Profesional':'Professional Student Membership',
    'Precios preferenciales para estudiantes activos de academias de belleza. Subí tu comprobante de estudio y activá tu membresía.':'Special pricing for current beauty academy students. Upload proof of enrollment to activate your membership.',
    'Quiero mi membresía →':'Get my membership →', 'Alianzas para Emprendedores & Logística':'Business & Logistics Partnerships',
    'Cotizaciones al por mayor, distribución masiva y alianzas logísticas para tu negocio. Contanos tu proyecto.':'Wholesale quotes, distribution and logistics partnerships for your business. Tell us about your project.',
    'Explorar alianza →':'Explore a partnership →', 'Cómo comprar':'How to order', 'Escribís':'Get in touch', 'Confirmamos':'We confirm', 'Recibís':'Receive your order',
    'Nos contás qué necesitás por WhatsApp — una pieza o tu pedido completo del mes.':'Tell us what you need on WhatsApp — one item or your complete monthly order.',
    'Te respondemos con disponibilidad y precio al momento, sin vueltas.':'We reply with current availability and pricing.',
    'Con mensajero en Alajuela, Heredia y San José, o por correo a cualquier parte del país.':'Courier delivery in Alajuela, Heredia and San José, or postal shipping nationwide.',
    'Zonas de entrega':'Delivery areas', 'Métodos de pago':'Payment methods',
    '— entrega con mensajero, pago contra entrega.':'— courier delivery, payment on delivery.',
    'Resto del país':'Elsewhere in Costa Rica', '— envíos por Correos de Costa Rica o encomiendas.':'— shipping via Correos de Costa Rica or parcel services.',
    'Efectivo':'Cash', 'al recibir tu pedido.':'on delivery.', ', fácil y directo.':', quick and easy.',
    'Tarjeta':'Card', 'de crédito o débito.':'credit or debit.', 'Realizar Pedido / Datos de Envío':'Order / Delivery details',
    'por Gaudi Lara':'by Gaudi Lara',
    'Estaremos viajando en octubre a Estados Unidos para traer los encargos de todos nuestros clientes. Aproveche y realice sus pedidos para navidad y final de año! — desde tecnología hasta ropa, belleza y regalos, comprados en tiendas de confianza.':'We are traveling to the United States in October to bring back our customers’ orders. Place your Christmas and year-end requests — from technology and clothing to beauty and gifts, purchased at trusted stores.',
    'Quiero enterarme primero':'Keep me informed', 'Reservá tu espacio en el viaje':'Reserve your spot for the trip',
    'Contanos qué necesitás y te preparamos una cotización antes del viaje de octubre.':'Tell us what you need and we will prepare a quote before the October trip.',
    'Nombre Completo':'Full name', 'Nombre completo':'Full name', 'WhatsApp de contacto':'WhatsApp number',
    '¿Qué producto deseas cotizar? (Enlace o descripción)':'Which product would you like a quote for? (Link or description)',
    'Enviar Solicitud':'Send request', 'y más':'and more', 'Pausar galería':'Pause gallery', 'Reanudar galería':'Resume gallery',
    'Cejas, pestañas y microblading':'Brows, lashes and microblading',
    'Reservá tu espacio para diseño de cejas, extensiones y lifting de pestañas o microblading. Elegí el servicio, la fecha y la franja horaria que te queden mejor y te confirmamos por WhatsApp.':'Book brow styling, lash extensions and lifts, or microblading. Choose your preferred service, date and time slot; we confirm on WhatsApp.',
    'Servicios disponibles':'Available services', 'Cómo funciona':'How it works',
    '— diseño y depilación, laminado':'— styling, shaping and lamination', '— clásicas, volumen, lash lift':'— classic extensions, volume and lash lifts',
    '— sesión completa y retoque':'— full session and touch-up',
    'Enviás la solicitud con tu fecha y franja preferida.':'Send your preferred date and time slot.',
    'Te escribimos por WhatsApp para confirmar el horario exacto.':'We contact you on WhatsApp to confirm the exact time.',
    'Tu solicitud queda registrada al instante.':'Your request is recorded immediately.',
    'Reservá en menos de un minuto':'Request a booking in under a minute',
    'Elegí el servicio, la fecha y la franja horaria que te queden mejor. Confirmamos tu espacio por WhatsApp.':'Choose your preferred service, date and time slot. We confirm your appointment on WhatsApp.',
    'Agendar mi cita':'Book my appointment', 'La belleza':'Beauty', 'nos conecta.':'connects us.',
    'Explorá el catálogo, las promociones y las novedades de GLC.':'Discover the catalog, promotions and updates from GLC.',
    'Correo':'Email', 'Privacidad':'Privacy', 'Términos y Condiciones':'Terms & Conditions', 'Política de Privacidad':'Privacy Policy', 'Aceptar':'Accept',
    '🍪 Usamos únicamente los recursos técnicos necesarios para mostrar el sitio (como tipografías de Google). No usamos cookies de publicidad ni de analítica. Más información en nuestra':'🍪 We use only technical resources needed to display this site (such as Google Fonts). No advertising or analytics cookies. Learn more in our',
    '← Volver al inicio':'← Back to home', 'Tu próximo':'Your next', 'imprescindible.':'essential.',
    'Pestañas, herramientas y esenciales para tu estudio. Elegí tu producto, encontrá tu variante y pedilo por WhatsApp.':'Lashes, tools and essentials for your studio. Choose your product and variant, then order on WhatsApp.',
    'productos en':'products in', 'categorías':'categories', 'Buscá o filtrá al instante':'Search or filter instantly', 'Pedís directo por WhatsApp':'Order directly on WhatsApp',
    'Buscar producto, marca o técnica…':'Search product, brand or technique…', 'Buscar productos':'Search products', 'Borrar búsqueda':'Clear search',
    'Categoría':'Category', 'Todos':'All', 'Cargar más productos':'Load more products',
    'No encontramos productos con ese criterio':'No products match your search',
    'Probá con otra palabra o categoría, o escribinos directo por WhatsApp y te ayudamos a encontrarlo.':'Try another word or category, or ask us on WhatsApp and we will help you find it.',
    'Preguntar por WhatsApp':'Ask on WhatsApp', 'Elegí tu variante':'Choose your variant',
    'La selección se incluye en tu consulta por WhatsApp.':'Your selection is included in your WhatsApp inquiry.',
    'Precio de la variante · se envía en tu consulta':'Variant price · included in your inquiry',
    'Precio de catálogo · confirmamos disponibilidad por WhatsApp':'Catalog price · availability confirmed on WhatsApp',
    'Precio de catálogo':'Catalog price', 'Elegí tu variante':'Choose your variant', 'Elegir variante':'Choose variant',
    'Quiero este producto':'Order on WhatsApp', 'Seguir viendo':'Continue browsing', 'Ver producto':'View product', 'Elegir opciones':'Choose options',
    'Consultá disponibilidad':'Ask about availability', 'Precio a confirmar':'Price on request', 'Precio a confirmar por WhatsApp':'Ask for price on WhatsApp',
    'Cerrar banner promocional':'Dismiss promotion', 'Navegación principal':'Main navigation', 'Navegación del pie de página':'Footer navigation',
    'Redes sociales':'Social media', 'Ver más categorías':'View more categories', 'Filtrar por categoría':'Filter by category',
    'Cerrar vista rápida':'Close quick view', 'Ver productos anteriores':'Previous products', 'Ver siguientes productos':'Next products',
    'Fotografía anterior':'Previous photo', 'Fotografía siguiente':'Next photo', 'Agregar al carrito':'Add to bag',
    'Tu carrito':'Your bag', 'Cerrar carrito':'Close bag', 'Cantidad':'Quantity', 'Quitar':'Remove',
    'Tu carrito está esperando tus esenciales.':'Your bag is waiting for your essentials.', 'Explorar productos':'Explore products',
    'Subtotal':'Subtotal', 'Subtotal conocido':'Known subtotal',
    'Confirmamos disponibilidad, envío y precio final por WhatsApp.':'Availability, delivery and final pricing are confirmed on WhatsApp.',
    'Hay productos con precio por confirmar.':'Some products need a price confirmation.',
    'Consultar carrito por WhatsApp':'Send bag to WhatsApp', 'Completar datos de envío':'Complete delivery details',
    'No se pudo guardar en este navegador. Tu carrito seguirá disponible mientras esta página esté abierta.':'This browser could not save your bag. It remains available while this page stays open.',
    'Tu carrito se actualizó.':'Your bag was updated.', 'Idioma: español':'Language: Spanish', 'Idioma: inglés':'Language: English'
  };
  function english(source) {
    if (Object.prototype.hasOwnProperty.call(words, source)) return words[source];
    return source.replace(/^(\d+) productos$/, '$1 products').replace(/^(\d+) de (\d+) productos$/, '$1 of $2 products').replace(/^(\d+) opciones disponibles$/, '$1 available options').replace(/^Desde /, 'From ').replace(/^Snapshot del catálogo/, 'Catalog snapshot').replace(/^Todos (\d+)$/, 'All $1').replace(/^Ver detalles de /,'View details for ').replace(/^Elegir opciones de /,'Choose options for ').replace(/^Ver producto /,'View product ').replace(/^Pedir /,'Order ').replace(/, variante /,', variant ');
  }
  var originals = new WeakMap(), originalAttributes = new WeakMap();
  var excluded = 'script,style,svg,.prod-card__name,.merch-card h3,#qvTitle,#qvVariant,.variant-chips,.cart-item__name,.cart-item__variant,.hero-brand-panel';
  function translate(root) {
    if (root.nodeType === 3) { translateText(root); return; }
    if (root.nodeType !== 1 || root.closest(excluded)) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), node;
    while ((node = walker.nextNode())) translateText(node);
    [root].concat(Array.from(root.querySelectorAll('[placeholder],[aria-label]'))).forEach(function (el) {
      if (el.closest(excluded)) return;
      ['placeholder','aria-label'].forEach(function (attribute) {
        if (!el.hasAttribute(attribute)) return;
        var records = originalAttributes.get(el) || {}, current = el.getAttribute(attribute), record = records[attribute];
        if (!record || (current !== record.output && current !== record.source)) record = {source:current};
        var source = record.source;
        var value = language === 'en' ? english(source) : source;
        record.output = value; records[attribute] = record; originalAttributes.set(el,records);
        if (el.getAttribute(attribute) !== value) el.setAttribute(attribute, value);
      });
    });
  }
  function translateText(node) {
    if (!node.parentElement || node.parentElement.closest(excluded)) return;
    var value = node.nodeValue, record = originals.get(node);
    if (!record || (value !== record.output && value !== record.source)) record = {source:value};
    var source = record.source, normalized = source.trim().replace(/\s+/g, ' ');
    var output = language === 'en' ? source.replace(source.trim(), english(normalized)) : source;
    record.output = output; originals.set(node, record);
    if (value !== output) node.nodeValue = output;
  }
  function t(es) { return language === 'en' ? english(es) : es; }
  function money(value) { return typeof value === 'number' ? '₡' + value.toLocaleString('es-CR') : t('Precio a confirmar'); }
  function element(tag, className, text) { var el = document.createElement(tag); if (className) el.className = className; if (text !== undefined) el.textContent = text; return el; }
  function button(text, label, action) { var el = element('button','',text); el.type = 'button'; if (label) el.setAttribute('aria-label',label); el.addEventListener('click',action); return el; }
  var bagIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 7h14l1 14H4L5 7Z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/></svg>';
  var tools = element('div','header-tools');
  var languageControl = element('div','language-switch'); languageControl.setAttribute('role','group'); languageControl.setAttribute('aria-label','ES / EN');
  ['es','en'].forEach(function (code) {
    var control = button(code.toUpperCase(),code === 'es' ? 'Idioma: español' : 'Idioma: inglés',function () { language = code; write(LANG_KEY,code); applyLanguage(); });
    control.dataset.language = code; control.lang = code; languageControl.appendChild(control);
  });
  var cartToggle = button('',null,function () { openCart(); }); cartToggle.className = 'cart-toggle'; cartToggle.innerHTML = bagIcon;
  cartToggle.setAttribute('aria-haspopup','dialog'); cartToggle.setAttribute('aria-controls','glcCart');
  var badge = element('span','cart-count','0'); badge.setAttribute('aria-hidden','true'); cartToggle.appendChild(badge);
  tools.append(languageControl,cartToggle); document.querySelector('.header-row').appendChild(tools);
  var drawer = element('dialog','cart-drawer'); drawer.id = 'glcCart'; drawer.setAttribute('aria-labelledby','cartTitle');
  var heading = element('div','cart-heading'), title = element('h2','','Tu carrito'); title.id = 'cartTitle';
  var close = button('',null,function () { drawer.close(); }); close.className = 'cart-close'; close.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>';
  heading.append(title,close);
  var storageNote = element('p','cart-storage-note'); storageNote.hidden = true;
  var itemList = element('div','cart-items'), summary = element('div','cart-summary');
  drawer.append(heading,storageNote,itemList,summary); document.body.appendChild(drawer);
  var live = element('p','sr-only'); live.setAttribute('role','status'); live.setAttribute('aria-live','polite'); document.body.appendChild(live);
  var cart = [];
  function selection(id,index) {
    var product = products.find(function (p) { return p.id === id; }); if (!product) return null;
    var variants = product.variants || [], variant = variants.length ? variants[index] : null;
    if (variants.length && (!Number.isInteger(index) || !variant)) return null;
    var label = variant ? (typeof variant === 'string' ? variant : variant.label) : '';
    var price = variant && typeof variant.price_crc === 'number' ? variant.price_crc : product.price_crc;
    return {id:product.id,name:product.name,variantIndex:variants.length ? index : null,variant:label,price:typeof price === 'number' ? price : null};
  }
  function loadCart(raw) {
    try {
      var parsed = JSON.parse(raw || '[]'); if (!Array.isArray(parsed)) return [];
      var result = [];
      parsed.slice(0,200).forEach(function (stored) {
        if (!stored || typeof stored !== 'object') return;
        var item = selection(stored.id,stored.variantIndex);
        if (!item || item.variant !== stored.variant || item.price !== stored.price || !Number.isInteger(stored.quantity) || stored.quantity < 1 || stored.quantity > 99) return;
        var previous = result.find(function (r) { return r.id === item.id && r.variantIndex === item.variantIndex; });
        if (previous) previous.quantity = Math.min(99,previous.quantity + stored.quantity);
        else { item.quantity = stored.quantity; result.push(item); }
      });
      return result;
    } catch (_) { return []; }
  }
  cart = loadCart(read(CART_KEY));
  function persist() { write(CART_KEY,JSON.stringify(cart)); renderCart(); live.textContent = t('Tu carrito se actualizó.'); }
  function add(id,index) {
    var item = selection(id,index); if (!item) return false;
    var existing = cart.find(function (line) { return line.id === item.id && line.variantIndex === item.variantIndex; });
    if (existing) existing.quantity = Math.min(99,existing.quantity + 1);
    else { item.quantity = 1; cart.push(item); }
    persist(); return true;
  }
  function openCart() { renderCart(); if (!drawer.open) drawer.showModal(); cartToggle.setAttribute('aria-expanded','true'); document.body.classList.add('cart-open'); close.focus(); }
  drawer.addEventListener('close',function () { document.body.classList.remove('cart-open'); cartToggle.setAttribute('aria-expanded','false'); cartToggle.focus(); });
  drawer.addEventListener('click',function (event) { if (event.target === drawer && event.clientX < drawer.getBoundingClientRect().left) drawer.close(); });
  drawer.addEventListener('keydown',function (event) {
    if (event.key !== 'Tab') return;
    var controls = Array.from(drawer.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled)')).filter(function (el) { return el.getClientRects().length; });
    var first = controls[0], last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  function renderCart(focusLine,focusControl) {
    var count = cart.reduce(function (n,line) { return n + line.quantity; },0);
    badge.textContent = count > 99 ? '99+' : count;
    cartToggle.setAttribute('aria-label',t('Tu carrito') + ' (' + count + ')'); cartToggle.setAttribute('aria-expanded',String(drawer.open));
    title.textContent = t('Tu carrito'); close.setAttribute('aria-label',t('Cerrar carrito'));
    storageNote.textContent = t('No se pudo guardar en este navegador. Tu carrito seguirá disponible mientras esta página esté abierta.'); storageNote.hidden = storageAvailable;
    itemList.replaceChildren(); summary.replaceChildren(); summary.hidden = !cart.length;
    if (!cart.length) {
      var empty = element('div','cart-empty'); empty.appendChild(element('p','',t('Tu carrito está esperando tus esenciales.')));
      var explore = element('a','text-link',t('Explorar productos')); explore.href = 'catalogo.html'; empty.appendChild(explore); itemList.appendChild(empty); return;
    }
    cart.forEach(function (item,index) {
      var row = element('article','cart-item'); row.dataset.line = index;
      row.appendChild(element('h3','cart-item__name',item.name));
      if (item.variant) row.appendChild(element('p','cart-item__variant',item.variant));
      row.appendChild(element('p','cart-item__price',money(item.price) + (item.price !== null ? ' × ' + item.quantity + ' = ' + money(item.price * item.quantity) : '')));
      var controls = element('div','cart-item__controls'), quantity = element('div','cart-quantity');
      function change(value,focus) { item.quantity = Math.max(1,Math.min(99,Math.round(Number(value) || 1))); write(CART_KEY,JSON.stringify(cart)); renderCart(index,focus); live.textContent = t('Tu carrito se actualizó.'); }
      var minus = button('−',(language === 'en' ? 'Decrease quantity: ' : 'Reducir cantidad: ') + item.name,function () { change(item.quantity-1,'minus'); }); minus.dataset.control = 'minus'; minus.disabled = item.quantity <= 1;
      var input = element('input'); input.type = 'number'; input.min = '1'; input.max = '99'; input.step = '1'; input.value = item.quantity; input.dataset.control = 'quantity'; input.setAttribute('aria-label',t('Cantidad') + ': ' + item.name); input.addEventListener('change',function () { change(input.value,'quantity'); });
      var plus = button('+',(language === 'en' ? 'Increase quantity: ' : 'Aumentar cantidad: ') + item.name,function () { change(item.quantity+1,'plus'); }); plus.dataset.control = 'plus'; plus.disabled = item.quantity >= 99;
      quantity.append(minus,input,plus);
      var remove = button(t('Quitar'),t('Quitar') + ': ' + item.name,function () { cart.splice(index,1); persist(); var next = itemList.querySelector('.cart-remove'); (next || close).focus(); }); remove.className = 'cart-remove'; controls.append(quantity,remove); row.appendChild(controls); itemList.appendChild(row);
    });
    var total = cart.reduce(function (n,item) { return n + (item.price || 0) * item.quantity; },0), unknown = cart.some(function (item) { return item.price === null; });
    var totalRow = element('p','cart-total'); totalRow.append(element('span','',t(unknown ? 'Subtotal conocido' : 'Subtotal')),element('span','',money(total))); summary.appendChild(totalRow);
    summary.appendChild(element('p','',(unknown ? t('Hay productos con precio por confirmar.') + ' ' : '') + t('Confirmamos disponibilidad, envío y precio final por WhatsApp.')));
    var message = language === 'en' ? 'Hello! I would like to check availability for:\n\n' : '¡Hola! Quisiera consultar disponibilidad de:\n\n';
    cart.forEach(function (item) { message += item.quantity + ' × ' + item.name + (item.variant ? ' — ' + item.variant : '') + ' · ' + money(item.price) + (item.price !== null ? ' c/u · ' + money(item.price * item.quantity) : '') + '\n'; });
    message += '\n' + t(unknown ? 'Subtotal conocido' : 'Subtotal') + ': ' + money(total) + '\n' + t('Confirmamos disponibilidad, envío y precio final por WhatsApp.');
    var whatsapp = element('a','btn btn-primary',t('Consultar carrito por WhatsApp')); whatsapp.href = 'https://wa.me/50670281688?text=' + encodeURIComponent(message); whatsapp.target = '_blank'; whatsapp.rel = 'noopener noreferrer'; whatsapp.dataset.cartWhatsapp = '';
    var order = element('a','btn btn-ghost',t('Completar datos de envío')); order.href = 'pedido.html'; summary.append(whatsapp,order);
    if (focusLine !== undefined) { var focus = itemList.querySelector('[data-line="'+focusLine+'"] [data-control="'+focusControl+'"]'); if (focus && focus.disabled) focus = itemList.querySelector('[data-line="'+focusLine+'"] input'); if (focus) focus.focus(); }
  }
  window.GLCStore = {add:add,open:openCart};
  document.querySelectorAll('#featuredGrid .merch-card').forEach(function (card) {
    var url = new URL(card.querySelector('a').href), id = url.searchParams.get('product'), product = products.find(function (p) { return p.id === id; });
    if (!product || (product.variants || []).length) return;
    var addButton = button('Agregar al carrito',null,function () { if (add(id,null)) openCart(); }); addButton.className = 'merch-add'; card.appendChild(addButton);
  });
  function applyLanguage() {
    document.documentElement.lang = language;
    languageControl.querySelectorAll('button').forEach(function (control) { control.setAttribute('aria-pressed',String(control.dataset.language === language)); });
    translate(document.body); renderCart();
  }
  applyLanguage();
  // New filtered cards and quick-view prices use the same curated vocabulary.
  new MutationObserver(function (mutations) {
    var roots = new Set(); mutations.forEach(function (mutation) { if (mutation.target.parentElement && mutation.target.parentElement.closest('.cart-drawer,.header-tools')) return; roots.add(mutation.type === 'characterData' ? mutation.target : mutation.target); });
    roots.forEach(translate);
  }).observe(document.body,{childList:true,subtree:true,characterData:true});
  window.addEventListener('storage',function (event) {
    if (event.key === CART_KEY) { cart = loadCart(event.newValue); renderCart(); }
    if (event.key === LANG_KEY) { language = event.newValue === 'en' ? 'en' : 'es'; applyLanguage(); }
  });
})();
