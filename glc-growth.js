/* Guided commerce uses the public catalog and the existing bag's variant validator. */
(function () {
  'use strict';
  var catalog = (window.GLC_CATALOG || []).filter(function (p) { return p.name && p.public !== false; });
  var byId = new Map(catalog.map(function (p) { return [p.id,p]; }));
  var en = document.documentElement.lang === 'en';
  function copy(es,english) { return en ? english : es; }
  function money(n) { return typeof n === 'number' ? '₡' + n.toLocaleString('es-CR') : copy('Precio a confirmar','Price on request'); }
  function el(tag,cls,text) { var node = document.createElement(tag); if (cls) node.className = cls; if (text !== undefined) node.textContent = text; return node; }
  function button(text,fn,cls) { var node = el('button',cls,text); node.type = 'button'; node.addEventListener('click',fn); return node; }
  function link(text,url,cls) { var node = el('a',cls,text); node.href = url; return node; }
  function productPrice(p,index) { var v = (p.variants || [])[index]; return v && typeof v.price_crc === 'number' ? v.price_crc : p.price_crc; }
  function startingPrice(p) { var prices = (p.variants || []).map(function (_,i) { return productPrice(p,i); }).filter(function (n) { return typeof n === 'number'; }); return prices.length ? Math.min.apply(Math,prices) : p.price_crc; }
  function priceLabel(p) { return ((p.variants || []).length ? copy('Desde ','From ') : '') + money(startingPrice(p)); }
  var staticCopy = Array.from(document.querySelectorAll('[data-growth] [data-en]')).map(function (node) { return {node:node,es:node.innerHTML,en:node.dataset.en}; });
  function translateStatic() {
    staticCopy.forEach(function (record) { record.node.innerHTML = en ? record.en : record.es; });
    var wa = document.getElementById('layawayWhatsapp');
    if (wa) wa.href = 'https://wa.me/50670281688?text=' + encodeURIComponent(copy('Hola, quisiera consultar el sistema de apartados.','Hello, I would like to ask about reserving products and paying over time.'));
  }

  // Long enough to read; user interaction pauses rotation. No live announcement on autoplay.
  var banner = document.getElementById('promoBanner'), promoIndex = 1, paused = false, hovering = false, focused = false;
  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var messages = [
    ['PROMOCIONES DE LA SEMANA','THIS WEEK’S PROMOTIONS','catalogo.html'],
    ['¡Envíos gratis al Valle Central por compras desde ₡25,000!','Free Central Valley delivery on orders of ₡25,000 or more!','catalogo.html'],
    ['Ahora contamos con sistema de apartados','You can now reserve products and pay over time','index.html#apartados'],
    ['Apartá desde ₡10,000 y completá tu pago hasta en 3 meses','Reserve from ₡10,000 and complete payment within 3 months','index.html#apartados'],
    ['Explorá nuestros esenciales para profesionales de belleza','Explore our essentials for beauty professionals','index.html#catalogo'],
    ['Pedí por WhatsApp de forma rápida','Order quickly through WhatsApp','https://wa.me/50670281688']
  ];
  var promoLink, promoCount, promoPause, promoNext;
  function renderPromo() {
    if (!promoLink) return;
    promoLink.textContent = messages[promoIndex][en ? 1 : 0]; promoLink.href = messages[promoIndex][2];
    promoCount.textContent = (promoIndex+1) + ' / ' + messages.length;
    promoPause.textContent = motion.matches ? copy('Manual','Manual') : paused ? copy('Reanudar','Resume') : copy('Pausar','Pause');
    promoPause.disabled = motion.matches;
    promoPause.setAttribute('aria-label',copy('Pausar o reanudar promociones','Pause or resume promotions'));
    promoNext.setAttribute('aria-label',copy('Siguiente promoción','Next promotion'));
    banner.querySelector('.promo-banner__close').setAttribute('aria-label',copy('Cerrar banner promocional','Dismiss promotion'));
    if (!motion.matches && promoLink.animate) promoLink.animate([{opacity:.3,transform:'translateY(4px)'},{opacity:1,transform:'translateY(0)'}],{duration:350,easing:'ease-out'});
  }
  if (banner) {
    banner.dataset.growth = ''; banner.classList.add('growth-promo');
    var text = banner.querySelector('.promo-banner__text'); text.replaceChildren();
    promoLink = link('','catalogo.html','growth-promo-link'); text.appendChild(promoLink);
    var controls = el('div','growth-promo-controls'); promoCount = el('span','growth-promo-count'); promoCount.setAttribute('aria-hidden','true');
    promoPause = button('',function () { paused = !paused; renderPromo(); });
    promoNext = button('',function () { paused = true; promoIndex = (promoIndex+1)%messages.length; renderPromo(); });
    promoNext.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6"/></svg>';
    controls.append(promoCount,promoPause,promoNext); text.after(controls);
    banner.addEventListener('mouseenter',function () { hovering = true; }); banner.addEventListener('mouseleave',function () { hovering = false; });
    banner.addEventListener('focusin',function () { focused = true; }); banner.addEventListener('focusout',function (event) { focused = banner.contains(event.relatedTarget); });
    window.setInterval(function () { if (!paused && !hovering && !focused && !motion.matches && !document.hidden && !banner.hidden) { promoIndex = (promoIndex+1)%messages.length; renderPromo(); } },8500);
    motion.addEventListener('change',renderPromo);
  }

  var paths = [
    {id:'classic',es:'Pestañas clásicas',en:'Classic lashes',cat:'Pestañas',image:'img/catalog/owner/pestanas-nagaraku-mi.jpg',desc:['Dale forma a tu selección: extensiones, pinzas y aplicadores.','Shape your selection: extensions, tweezers and applicators.'],ids:['pestanas-diy-day-clasi','pestanas-nagaraku-mi','pinza-de-aislar-nariz','pinzas-diy-day-unidad','100-microaplicadores','50-parches']},
    {id:'volume',es:'Volumen',en:'Volume',cat:'Pestañas',image:'img/catalog/owner/pestanas-tecnologicas-3d-4d-5d-6d-7d.jpg',desc:['Explorá formatos de pestañas y elegí la variante para tu trabajo.','Explore lash formats and choose the variant for your work.'],ids:['pestanas-tecnologicas-3d-4d-5d-6d-7d','pestanas-diy-day-3d','diy-day-autofloracion','pinza-volumen','100-microaplicadores','50-parches']},
    {id:'lift',es:'Lifting y laminado',en:'Lifts & lamination',cat:'Lifting y Laminado',image:'img/catalog/owner/lifting-golle.jpg',desc:['Compará opciones de lifting, laminado y herramientas de aplicación.','Compare lifts, lamination and application tools.'],ids:['lifting-golle','kit-de-lifting-iconsing','laminado-3-pasos','cepillos-laminado-pa','cepillo-plastico-lifting','100-microaplicadores']},
    {id:'brow',es:'Cejas',en:'Brows',cat:'Tintes y Henna',image:'img/catalog/owner/henna-iconsing.jpg',desc:['Color, marcaje y precisión. Elegí los productos según tu técnica.','Color, mapping and precision. Choose products for your technique.'],ids:['henna-iconsing','golle-tinte','hilo-marcaje','lapicero-blanco','maquina-de-cera','50-aplicadores-sin-pelusa']},
    {id:'micro',es:'Microblading',en:'Microblading',cat:'Microblading',image:'img/catalog/owner/inductor-tebori-doble.jpg',desc:['Encontrá agujas, pigmentos y herramientas. Revisá cada opción antes de elegir.','Find needles, pigments and tools. Review each option before choosing.'],ids:['agujas-microblanding','pigmento-pasta-micro','inductor-tebori-doble','mezclador-de-pigmentos','pincel-aplicador-de-pig','50-aplicadores-sin-pelusa']},
    {id:'tools',es:'Herramientas',en:'Tools',cat:'Herramientas y Equipos',image:'img/catalog/owner/organizacion-para-almacenar.jpg',desc:['Una selección para organizar y equipar tu espacio de trabajo.','A selection to organize and equip your workspace.'],ids:['espejo-visor','abanico-electrico','maquina-de-cera','lapicero-blanco','organizador','pinzas-diy-day-unidad']},
    {id:'adhesive',es:'Adhesivos',en:'Adhesives',cat:'Pegamentos y Adhesivos',image:'img/catalog/owner/boquilla-para-adhesivo.jpg',desc:['Compará las opciones. Consultanos cuál se ajusta a tu técnica y condiciones de trabajo.','Compare options. Ask us which suits your technique and working conditions.'],ids:['adhesivo-golle-to','adhesivo-super-pl','goma-sky','boquilla-para-adhesivo','super-bonder-ib','primer-ib-beauty']},
    {id:'supplies',es:'Consumibles',en:'Supplies',cat:'Consumibles',image:'img/catalog/owner/100-microaplicadores.jpg',desc:['Reponé aplicadores, cepillos y parches sin recorrer todo el catálogo.','Restock applicators, brushes and patches without browsing the entire catalog.'],ids:['100-microaplicadores','50-aplicadores-sin-pelusa','50-cepillos','50-parches','toallas-libres-de-pelus','paq-de-100-toallas']}
  ].filter(function (path) { path.ids = path.ids.filter(function (id) { return byId.has(id); }); return path.ids.length && catalog.some(function (p) { return p.category === path.cat; }); });
  var experience = document.getElementById('discoveryExperience'), active = paths[0], selected = new Map(), kitOpen = false, purpose = 'start', review = false;
  var nav, stage, kit, feedback, kitFromEntrance = false;
  function candidates() { return active.ids.map(function (id) { return byId.get(id); }).filter(function (p) { return purpose !== 'refill' || ['Consumibles','Pegamentos y Adhesivos','Pestañas','Tintes y Henna','Lifting y Laminado','Microblading'].indexOf(p.category) !== -1; }); }
  function choosePath(path) {
    var restorePathFocus = nav.contains(document.activeElement);
    active = path; review = false; renderDiscovery();
    if (restorePathFocus) nav.querySelector('[aria-pressed="true"]').focus({preventScroll:true});
    if (!motion.matches && stage.animate) stage.animate([{opacity:.65,transform:'translateY(4px)'},{opacity:1,transform:'translateY(0)'}],{duration:300,easing:'ease-out'});
    if (kitOpen) renderKit();
  }
  function renderDiscovery() {
    if (!experience) return;
    nav.replaceChildren();
    paths.forEach(function (path) { var b = button('',function () { choosePath(path); },'discovery-path'); var tile=el('img'); tile.src=path.image; tile.alt=''; tile.loading='lazy'; tile.width=400; tile.height=440; b.append(tile,el('span','discovery-path-label',en ? path.en : path.es)); b.setAttribute('aria-pressed',String(path === active)); b.setAttribute('aria-controls','discoveryStage'); nav.appendChild(b); });
    stage.replaceChildren();
    var detail = el('div','discovery-detail');
    detail.append(el('h3','',en ? active.en : active.es),el('p','discovery-description',active.desc[en ? 1 : 0]));
    var preview = el('ul','discovery-preview');
    active.ids.slice(0,3).forEach(function (id) { var p = byId.get(id), item = el('li'); var a = link(p.name,'catalogo.html?product='+encodeURIComponent(id)); a.appendChild(el('span','',priceLabel(p))); item.appendChild(a); preview.appendChild(item); });
    detail.appendChild(preview);
    var actions = el('div','discovery-actions');
    var build = button(copy('Armá tu kit','Build your kit'),function () { kitFromEntrance = false; kitOpen = true; review = false; renderKit(); kit.scrollIntoView({behavior:motion.matches?'instant':'smooth',block:'start'}); kit.querySelector('h3').focus({preventScroll:true}); },'btn btn-primary'); build.setAttribute('aria-expanded',String(kitOpen)); build.setAttribute('aria-controls','kitBuilder');
    actions.append(build,link(copy('Ver categoría','View category'),'catalogo.html?cat='+encodeURIComponent(active.cat),'text-link'));
    detail.appendChild(actions); stage.append(detail);
  }
  function selectionTotal() { var total=0, unknown=false; selected.forEach(function (index,id) { var price=productPrice(byId.get(id),index); if (typeof price==='number') total+=price; else unknown=true; }); return {total:total,unknown:unknown}; }
  function renderKit() {
    var entrance = document.getElementById('openKitStudio');
    if (entrance) { entrance.setAttribute('aria-expanded',String(kitOpen)); entrance.setAttribute('aria-controls','kitBuilder'); }
    var trigger = stage.querySelector('[aria-controls="kitBuilder"]');
    if (trigger) trigger.setAttribute('aria-expanded',String(kitOpen));
    kit.hidden = !kitOpen; if (!kitOpen) return;
    kit.replaceChildren();
    var top = el('div','kit-heading'), heading = el('h3','',review ? copy('Revisá tu selección','Review your selection') : copy('Armá tu kit','Build your kit')); heading.tabIndex=-1;
    top.append(heading,button(copy('Cerrar guía','Close guide'),function () { kitOpen=false; renderKit(); renderDiscovery(); (kitFromEntrance ? document.getElementById('openKitStudio') : stage.querySelector('button')).focus(); },'text-link')); kit.appendChild(top); var journey=el('ol','kit-journey'); [copy('Tu técnica','Your technique'),copy('Tu selección','Your selection'),copy('Al carrito','To your bag')].forEach(function(label,i){ var step=el('li',i===(review?2:1)?'is-current':'',label); if(i===(review?2:1)) step.setAttribute('aria-current','step'); journey.appendChild(step); }); kit.appendChild(journey); var kitPhoto=el('img','kit-technique-photo'); kitPhoto.src=active.image; kitPhoto.alt=''; kitPhoto.width=800; kitPhoto.height=300; kit.appendChild(kitPhoto);
    kit.appendChild(el('p','kit-intro',copy('Opciones para tu técnica, no un paquete cerrado. Elegí solo lo que ocupás. Confirmamos disponibilidad y compatibilidad por WhatsApp.','Options for your technique, not a fixed bundle. Choose only what you need. Availability and compatibility are confirmed on WhatsApp.')));
    if (!review) {
      var decisions = el('div','kit-decisions');
      var techniqueLabel = el('label','',copy('1. Tu técnica','1. Your technique')), techniques = el('select'); techniques.id='kitTechnique'; techniqueLabel.htmlFor=techniques.id;
      paths.forEach(function (path) { var opt=el('option','',en?path.en:path.es); opt.value=path.id; opt.selected=path===active; techniques.appendChild(opt); });
      techniques.addEventListener('change',function () { choosePath(paths.find(function (p) { return p.id===techniques.value; })); kit.querySelector('#kitTechnique').focus(); }); techniqueLabel.appendChild(techniques);
      var purposeLabel = el('div','kit-purpose',copy('¿Por dónde empezamos?','Where shall we start?')), purposes=el('div','kit-purpose-options'); purposes.setAttribute('role','group'); purposes.setAttribute('aria-label',copy('Objetivo de tu selección','Selection purpose'));
      [['start',copy('Explorar opciones','Explore options')],['refill',copy('Reponer productos','Restock products')]].forEach(function (pair) { var opt=button(pair[1],function(){purpose=pair[0];renderKit();kit.querySelector('[data-purpose="'+purpose+'"]').focus();}); opt.dataset.purpose=pair[0]; opt.setAttribute('aria-pressed',String(purpose===pair[0])); purposes.appendChild(opt); });
      purposeLabel.appendChild(purposes); decisions.append(techniqueLabel,purposeLabel); kit.appendChild(decisions);
    }
    var list=el('div','kit-products');
    var items=review ? Array.from(selected.keys()).map(function (id) { return byId.get(id); }) : candidates();
    if (!items.length) list.appendChild(el('p','',copy('No hay opciones en esta vista. Explorá otra técnica o continuá al catálogo.','No options in this view. Explore another technique or continue to the catalog.')));
    items.forEach(function (p) {
      var row=el('article','kit-product'), title=el('h4'); title.appendChild(link(p.name,'catalogo.html?product='+encodeURIComponent(p.id))); row.appendChild(title); if ((window.GLC_IMAGE_PATHS||[]).indexOf(p.image)!==-1) { var thumb=el('img','kit-product-photo'); thumb.src=p.image; thumb.alt=p.name; thumb.width=220; thumb.height=200; thumb.loading='lazy'; row.prepend(thumb); row.classList.add('has-photo'); }
      var variants=p.variants||[], index=selected.has(p.id)?selected.get(p.id):null;
      var price=el('p','kit-price',variants.length && index===null?priceLabel(p):money(productPrice(p,index))); row.appendChild(price);
      var controls=el('div','kit-product-controls'), variantSelect, variantLabel;
      if (variants.length) {
        variantSelect=el('select'); variantSelect.setAttribute('aria-label',copy('Variante de ','Variant for ')+p.name);
        var placeholder=el('option','',copy('Elegí tu variante','Choose your variant')); placeholder.value=''; variantSelect.appendChild(placeholder);
        variants.forEach(function (v,i) { var option=el('option','',(typeof v==='string'?v:v.label)+' · '+money(productPrice(p,i))); option.value=String(i); variantSelect.appendChild(option); });
        variantSelect.value=index===null?'':String(index);
        variantLabel=el('p','kit-variant-label',index===null?'':(typeof variants[index]==='string'?variants[index]:variants[index].label));
        variantLabel.hidden=index===null;
        row.appendChild(variantLabel);
        row.classList.add('kit-product--variants');
        controls.appendChild(variantSelect);
      }
      var toggle=button(selected.has(p.id)?copy('Seleccionado · quitar','Selected · remove'):copy('Seleccionar','Select'),function () {
        if (selected.has(p.id)) selected.delete(p.id); else selected.set(p.id,variants.length?Number(variantSelect.value):null);
        renderKit(); var replacement=kit.querySelector('[data-select-product="'+p.id+'"]'); if (replacement) replacement.focus(); else kit.querySelector('h3').focus();
      },'kit-select'); toggle.dataset.selectProduct=p.id; toggle.setAttribute('aria-pressed',String(selected.has(p.id))); toggle.setAttribute('aria-label',(selected.has(p.id)?copy('Quitar ','Remove '):copy('Seleccionar ','Select '))+p.name);
      toggle.disabled=variants.length>0 && index===null;
      if (variantSelect) variantSelect.addEventListener('change',function () { index=variantSelect.value===''?null:Number(variantSelect.value); price.textContent=index===null?priceLabel(p):money(productPrice(p,index)); variantLabel.textContent=index===null?'':(typeof variants[index]==='string'?variants[index]:variants[index].label); variantLabel.hidden=index===null; toggle.disabled=index===null; if (selected.has(p.id)) { if (index===null) selected.delete(p.id); else selected.set(p.id,index); renderKit(); var current=kit.querySelector('[data-product="'+p.id+'"] select'); if (current) current.focus(); } });
      row.dataset.product=p.id; controls.appendChild(toggle); row.appendChild(controls); list.appendChild(row);
    });
    kit.appendChild(list);
    var footer=el('div','kit-footer'), totals=selectionTotal();
    footer.appendChild(el('p','kit-total',selected.size+' '+copy('seleccionados','selected')+' · '+(totals.unknown?copy('Subtotal conocido: ','Known subtotal: '):'')+money(totals.total)));
    var actions=el('div','kit-actions');
    if (review) {
      actions.appendChild(button(copy('Editar selección','Edit selection'),function () { review=false; renderKit(); kit.querySelector('h3').focus(); },'text-link'));
      var add=button(copy('Agregar selección al carrito','Add selection to bag'),function () {
        var added=[]; selected.forEach(function (index,id) { if (window.GLCStore.add(id,index)) added.push(id); });
        added.forEach(function (id) { selected.delete(id); });
        review=false; renderKit(); feedback.textContent=copy('Selección agregada al carrito.','Selection added to bag.'); window.GLCStore.open();
      },'btn btn-primary'); add.disabled=!selected.size; actions.appendChild(add);
    } else {
      var reviewButton=button(copy('Revisar selección','Review selection'),function () { review=true; renderKit(); kit.scrollIntoView({behavior:motion.matches?'instant':'smooth',block:'start'}); kit.querySelector('h3').focus({preventScroll:true}); },'btn btn-primary'); reviewButton.disabled=!selected.size; actions.appendChild(reviewButton);
    }
    actions.appendChild(link(copy('Seguir al catálogo','Continue to catalog'),'catalogo.html','text-link')); footer.appendChild(actions); kit.appendChild(footer);
    kit.appendChild(el('p','kit-note',copy('Cada producto se agrega por unidad, a su precio de catálogo. Podés ajustar cantidades en el carrito. La selección se conserva al cambiar de técnica.','Each product is added as one unit at its catalog price. Adjust quantities in the bag. Your selection is kept when changing techniques.')));
  }
  if (experience && paths.length && window.GLCStore) {
    experience.hidden=false; nav=el('div','discovery-paths'); nav.setAttribute('role','group');
    stage=el('div','discovery-stage'); stage.id='discoveryStage';
    kit=el('div','kit-builder'); kit.id='kitBuilder'; kit.hidden=true;
    feedback=el('p','sr-only'); feedback.setAttribute('role','status');
    experience.append(nav,stage,feedback); (document.getElementById('kitStudioMount')||experience).appendChild(kit); var kitEntrance=document.getElementById('openKitStudio'); if(kitEntrance) kitEntrance.addEventListener('click',function(event){event.preventDefault(); kitFromEntrance=true; kitOpen=true; review=false; renderKit(); kit.scrollIntoView({behavior:motion.matches?'instant':'smooth',block:'start'}); kit.querySelector('h3').focus({preventScroll:true});});
  }
  function render() { translateStatic(); renderPromo(); if (nav) { nav.setAttribute('aria-label',copy('Elegí tu técnica o producto','Choose your technique or product')); renderDiscovery(); renderKit(); } }
  document.addEventListener('glc:language',function () { en=document.documentElement.lang==='en'; render(); });
  render();
})();
