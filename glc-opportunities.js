/* Home-only carousel and distributor lead client. No catalog or cart mutations. */
(function () {
  'use strict';
  var messages = {
    program:['Distribuidor autorizado GLC','Authorized GLC distributor'], headline:['Llevá GLC a tu zona.','Bring GLC to your area.'],
    intro:['¿Querés emprender con productos profesionales de belleza? Conversemos sobre cómo podés distribuir GLC en tu zona.','Want to start a business with professional beauty products? Let’s talk about distributing GLC in your area.'],
    benefit1:['Atención comercial personalizada','Personalized commercial support'],benefit2:['Acceso al catálogo profesional','Access to the professional catalog'],benefit3:['Conversemos sobre condiciones comerciales para distribuidores','Let’s discuss commercial terms for distributors'],
    zones:['Guanacaste, Limón, San Carlos y otras zonas de Costa Rica. Contanos dónde querés empezar.','Guanacaste, Limón, San Carlos and other areas of Costa Rica. Tell us where you’d like to start.'],
    formTitle:['Contanos de vos','Tell us about yourself'],requiredNote:['Los campos marcados con * son obligatorios.','Fields marked with * are required.'],
    name:['Nombre completo *','Full name *'],phone:['WhatsApp / teléfono *','WhatsApp / phone *'],email:['Correo *','Email *'],province:['Provincia *','Province *'],zone:['Cantón / zona *','Canton / area *'],choose:['Seleccioná una provincia','Choose a province'],
    optional:['Un poco más sobre tu proyecto (opcional)','A little more about your project (optional)'],business:['¿Actualmente tenés negocio?','Do you currently run a business?'],unspecified:['Sin indicar','Not specified'],yes:['Sí','Yes'],no:['No','No'],businessType:['Tipo de negocio / actividad','Business type / activity'],interest:['Comentario / interés','Comment / interest'],
    consent:['Autorizo a Distribuidora GLC a contactarme sobre esta solicitud.','I authorize Distribuidora GLC to contact me about this application.'],submit:['Enviar solicitud','Send application'],submitting:['Enviando solicitud…','Sending application…'],sentButton:['Solicitud recibida','Application received'],
    success:['Recibimos tu solicitud.\nNos pondremos en contacto con vos para conocer mejor tu zona y tu proyecto.','We received your application.\nWe’ll contact you to learn more about your area and your project.'],
    pending:['El envío en línea todavía no está activo. Tu solicitud no fue enviada. Escribinos por WhatsApp y conversemos sobre tu zona.','Online submission is not active yet. Your application was not sent. Contact us on WhatsApp to discuss your area.'],
    error:['No pudimos confirmar la recepción de tu solicitud. Tus datos siguen aquí; intentá de nuevo o escribinos por WhatsApp.','We couldn’t confirm receipt of your application. Your details are still here; try again or contact us on WhatsApp.'],
    invalid:['Revisá los campos indicados para enviar tu solicitud.','Review the marked fields to send your application.'],required:['Completá este campo.','Complete this field.'],invalidEmail:['Ingresá un correo válido.','Enter a valid email address.'],invalidPhone:['Ingresá un teléfono de 8 a 15 dígitos; incluí el código de país si corresponde.','Enter a phone number with 8–15 digits; include a country code if needed.'],invalidName:['Ingresá tu nombre completo.','Enter your full name.'],consentError:['Necesitamos tu autorización para contactarte.','We need your permission to contact you.'],tooLong:['Acortá este texto al límite indicado.','Shorten this text to the stated limit.'],
    contact:['Prefiero conversar por WhatsApp','I’d rather chat on WhatsApp'],carousel:['Fotografías de GLC','GLC photographs'],carouselRole:['carrusel','carousel'],slideRole:['diapositiva','slide'],previous:['Fotografía anterior','Previous photo'],next:['Fotografía siguiente','Next photo'],pause:['Pausar','Pause'],play:['Reanudar','Resume'],manual:['Manual','Manual'],manualLabel:['Reproducción automática desactivada por movimiento reducido','Autoplay disabled by reduced motion'],photos:['Elegir fotografía','Choose a photo'],
    alt1:['Detalle del cepillado de extensiones de pestañas','Close-up of eyelash extensions being brushed'],alt2:['Bandejas de pestañas Nagaraku del catálogo de GLC','Nagaraku lash trays from the GLC catalog'],alt3:['Almohada de lashista con organizador del catálogo de GLC','Lash pillow with organizer from the GLC catalog'],distributorAlt:['Organizador de herramientas del catálogo de GLC','Tool organizer from the GLC catalog']
  };
  function t(key) { return messages[key][document.documentElement.lang === 'en' ? 1 : 0]; }
  function translate() {
    document.querySelectorAll('[data-v1-copy]').forEach(function (node) { node.textContent=t(node.dataset.v1Copy); });
    document.querySelectorAll('[data-v1-alt]').forEach(function (node) { node.alt=t(node.dataset.v1Alt); });
  }
  translate();

  var carousel=document.getElementById('heroCarousel');
  if (carousel) {
    var slides=Array.from(carousel.querySelectorAll('.hero-slide')),dots=Array.from(carousel.querySelectorAll('[data-hero-slide]'));
    var toggle=carousel.querySelector('[data-hero-play]'),live=carousel.querySelector('[data-hero-live]');
    var motion=window.matchMedia('(prefers-reduced-motion: reduce)'),index=0,requestedIndex=0,paused=false,hovered=false,inView=true,timer=null,sequence=0;
    function running() { return !paused&&!motion.matches&&!document.hidden&&!hovered&&inView; }
    function schedule() { window.clearTimeout(timer); if(running())timer=window.setTimeout(function(){show(index+1,false);},6000); }
    function labels() {
      carousel.setAttribute('aria-label',t('carousel'));carousel.setAttribute('aria-roledescription',t('carouselRole'));
      carousel.querySelector('[data-hero-prev]').setAttribute('aria-label',t('previous'));
      carousel.querySelector('[data-hero-next]').setAttribute('aria-label',t('next'));
      carousel.querySelector('.hero-carousel-dots').setAttribute('aria-label',t('photos'));
      slides.forEach(function(slide,i){slide.setAttribute('aria-label',(i+1)+' / '+slides.length);slide.setAttribute('aria-roledescription',t('slideRole'));});
      dots.forEach(function(dot,i){dot.setAttribute('aria-label',t('photos')+' '+(i+1)+' / '+slides.length);dot.setAttribute('aria-current',String(i===index));});
      toggle.textContent=t(motion.matches?'manual':paused?'play':'pause');toggle.disabled=motion.matches;
      toggle.setAttribute('aria-label',t(motion.matches?'manualLabel':paused?'play':'pause'));
    }
    function pause() { paused=true;window.clearTimeout(timer);labels(); }
    async function show(next,manual) {
      if(manual)pause();window.clearTimeout(timer);
      var request=++sequence,target=(next+slides.length)%slides.length,img=slides[target].querySelector('img');
      requestedIndex=target;
      try { if(img.decode)await img.decode(); } catch (_) { if(request===sequence){requestedIndex=index;schedule();}return; }
      if(request!==sequence||(!manual&&!running()))return;
      index=target;slides.forEach(function(slide,i){slide.classList.toggle('is-active',i===index);slide.setAttribute('aria-hidden',String(i!==index));});
      labels();if(manual)live.textContent=t('photos')+' '+(index+1)+' / '+slides.length;schedule();
    }
    carousel.querySelector('[data-hero-prev]').addEventListener('click',function(){show(requestedIndex-1,true);});
    carousel.querySelector('[data-hero-next]').addEventListener('click',function(){show(requestedIndex+1,true);});
    dots.forEach(function(dot){dot.addEventListener('click',function(){show(Number(dot.dataset.heroSlide),true);});});
    toggle.addEventListener('click',function(){paused=!paused;labels();schedule();});
    carousel.addEventListener('focusin',function(event){if(event.target!==toggle)pause();});
    carousel.addEventListener('keydown',function(event){if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();show(requestedIndex+(event.key==='ArrowLeft'?-1:1),true);}});
    carousel.addEventListener('mouseenter',function(){hovered=true;schedule();});carousel.addEventListener('mouseleave',function(){hovered=false;schedule();});
    var start=null;
    carousel.addEventListener('pointerdown',function(event){if(!event.target.closest('button')){pause();if(event.pointerType==='touch')start={x:event.clientX,y:event.clientY};}});
    carousel.addEventListener('pointerup',function(event){if(!start)return;var dx=event.clientX-start.x,dy=event.clientY-start.y;start=null;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.4)show(requestedIndex+(dx<0?1:-1),true);});
    carousel.addEventListener('pointercancel',function(){start=null;});
    document.addEventListener('visibilitychange',schedule);motion.addEventListener('change',function(){labels();schedule();});
    if('IntersectionObserver' in window)new IntersectionObserver(function(entries){inView=entries[0].isIntersecting;schedule();},{threshold:.15}).observe(carousel);
    document.addEventListener('glc:language',labels);carousel.querySelector('.hero-carousel-controls').hidden=false;labels();schedule();
  }

  var form=document.getElementById('distributorForm');
  if(form){
    var fields=form.querySelector('fieldset'),submit=form.querySelector('[type=submit]'),status=form.querySelector('[role=status]');
    var state='idle',statusKey='',pendingLead=null,submitted=false;
    var required=['nombre','whatsapp','email','provincia','canton_zona','consentimiento'];
    function field(name){return form.elements.namedItem(name);}
    function message(name,key){var control=field(name),error=document.getElementById('distributor-error-'+name);control.setAttribute('aria-invalid',String(!!key));if(error){error.dataset.errorKey=key||'';error.textContent=key?t(key):'';}}
    function validate(name){
      var control=field(name),value=control.value.trim(),key='';
      if(name==='consentimiento'){if(!control.checked)key='consentError';}
      else if(control.required&&!value)key='required';
      else if(control.maxLength>0&&value.length>control.maxLength)key='tooLong';
      else if(name==='nombre'&&value.length<3)key='invalidName';
      else if(name==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))key='invalidEmail';
      else if(name==='whatsapp'&&(!/^\+?[\d\s().-]+$/.test(value)||value.replace(/\D/g,'').length<8||value.replace(/\D/g,'').length>15))key='invalidPhone';
      else if(name==='provincia'&&!Array.from(control.options).some(function(option){return option.value&&option.value===value;}))key='required';
      message(name,key);return !key;
    }
    function renderState(){
      form.dataset.state=state;form.setAttribute('aria-busy',String(state==='submitting'));
      fields.disabled=state==='submitting'||state==='success';submit.disabled=state==='submitting'||state==='success';
      submit.textContent=t(state==='submitting'?'submitting':state==='success'?'sentButton':'submit');
      status.dataset.state=state;status.textContent=statusKey?t(statusKey):'';
    }
    function setState(next,key){state=next;statusKey=key;renderState();}
    form.noValidate=true;fields.disabled=false;submit.disabled=false;
    required.forEach(function(name){var control=field(name);control.addEventListener('blur',function(){if(control.value||control.getAttribute('aria-invalid')==='true')validate(name);});control.addEventListener('input',function(){if(control.getAttribute('aria-invalid')==='true')validate(name);});});
    function uuid(){if(window.crypto.randomUUID)return window.crypto.randomUUID();var bytes=window.crypto.getRandomValues(new Uint8Array(16));bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;return Array.from(bytes,function(b){return b.toString(16).padStart(2,'0');}).join('').replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/,'$1-$2-$3-$4-$5');}
    function values(){return {nombre:field('nombre').value.trim(),whatsapp:field('whatsapp').value.trim().replace(/[\s().-]/g,''),email:field('email').value.trim(),provincia:field('provincia').value,canton_zona:field('canton_zona').value.trim(),tiene_negocio:field('tiene_negocio').value,tipo_negocio:field('tipo_negocio').value.trim(),mensaje:field('mensaje').value.trim(),consentimiento:field('consentimiento').checked,source:'glc_website_distributor_program',language:document.documentElement.lang==='en'?'en':'es'};}
    form.addEventListener('submit',async function(event){
      event.preventDefault();if(state==='submitting'||submitted)return;
      var invalid=required.concat(['tipo_negocio','mensaje']).filter(function(name){return !validate(name);});
      if(invalid.length){setState('error','invalid');var first=field(invalid[0]);if(first.closest('details'))first.closest('details').open=true;first.focus();return;}
      var endpoint=form.dataset.endpoint.trim();
      if(!/^https:\/\//.test(endpoint)){setState('error','pending');return;}
      var current=values(),fingerprint=JSON.stringify(current);
      if(!pendingLead||pendingLead.fingerprint!==fingerprint)pendingLead={fingerprint:fingerprint,payload:Object.assign({lead_id:uuid(),created_at:new Date().toISOString(),status:'NEW'},current)};
      var payload=pendingLead.payload,controller=new AbortController(),timeout=window.setTimeout(function(){controller.abort();},15000);
      setState('submitting','submitting');
      try{
        var response=await fetch(endpoint,{method:'POST',body:new URLSearchParams(payload),signal:controller.signal,credentials:'omit',redirect:'follow'});
        if(!response.ok)throw new Error('HTTP response');
        var result=await response.json();
        if(result.ok!==true||result.persisted!==true||result.lead_id!==payload.lead_id)throw new Error('Unconfirmed persistence');
        submitted=true;form.reset();pendingLead=null;setState('success','success');
      }catch(_){setState('error','error');}finally{window.clearTimeout(timeout);}
    });
    document.addEventListener('glc:language',function(){form.querySelectorAll('[data-error-key]').forEach(function(node){if(node.dataset.errorKey)node.textContent=t(node.dataset.errorKey);});renderState();});
    renderState();
  }
  document.addEventListener('glc:language',translate);
})();
