/* Owner-authorized photography. Sources: img/curated and img/catalog/owner/SOURCES.md. */
(() => {
 'use strict';
 const stage=document.querySelector('.photo-stage'),image=document.querySelector('#hero-photo');
 if(!stage||!image)return;
 const product=(file,es,en)=>({src:`img/catalog/owner/${file}.jpg`,es,en,fit:'contain',position:'center'});
 const scenes=[
  {src:'img/hero-lash-application.jpg',es:'Aplicación profesional de extensiones de pestañas',en:'Professional lash extension application',fit:'cover',position:'center 54%'},
  product('henna-iconsing','Henna para cejas y resultado de aplicación','Brow henna and application result'),
  product('lifting-golle','Kit profesional de lifting de pestañas Gollee','Gollee professional lash lifting kit'),
  {src:'img/editorial/lashes.jpg',es:'Peinado de extensiones de pestañas en primer plano',en:'Lash extensions being brushed, close up',fit:'cover',position:'center 46%'},
  product('pestanas-en-y','Pestañas YY y detalle del acabado','YY lashes and finish detail'),
  product('dermapen-tambien','Herramienta y accesorios de microneedling','Microneedling tool and accessories'),
  product('pestanas-tecnologicas-3d-4d-5d-6d-7d','Bandejas de pestañas de volumen en distintos formatos','Volume lash trays in different formats'),
  product('pinza-de-aislar-nariz','Pinza profesional dorada para pestañas','Gold professional lash tweezers'),
  product('super-bonder-v2','Super Bonder V2 para extensiones de pestañas','Super Bonder V2 for lash extensions'),
  product('pestanas-nagaraku-mi','Bandejas de extensiones de pestañas Nagaraku','Nagaraku lash extension trays'),
  product('abanico-recargable-par','Abanico recargable para el estudio de pestañas','Rechargeable fan for the lash studio'),
  product('cepillos-con-tubito','Cepillos rosados para pestañas con estuche individual','Pink lash brushes with individual cases')
 ];
 const dwell=9000;
 let index=0,timer=0,visible=false,hovered=false,focused=false,busy=false,generation=0,overlay=null;
 const reduced=()=>document.documentElement.classList.contains('motion-reduced')||matchMedia('(prefers-reduced-motion: reduce)').matches;
 const allowed=()=>visible&&!document.hidden&&!hovered&&!focused&&!reduced();
 const alt=scene=>scene[document.documentElement.lang==='en'?'en':'es'];
 function schedule(){clearTimeout(timer);if(allowed()&&!busy)timer=setTimeout(advance,dwell);}
 async function advance(){
  if(!allowed()||busy)return;
  busy=true;const ticket=++generation,next=(index+1)%scenes.length,scene=scenes[next],incoming=new Image();
  incoming.src=scene.src;incoming.alt='';incoming.setAttribute('aria-hidden','true');
  incoming.className='carousel-incoming';incoming.style.objectFit=scene.fit;incoming.style.objectPosition=scene.position;
  incoming.style.backgroundColor=scene.fit==='contain'?'#fff':'#3b1725';
  try{await incoming.decode();
   if(ticket!==generation||!allowed())return;
   overlay=incoming;stage.append(incoming);
   const fade=incoming.animate([{opacity:0},{opacity:1}],{duration:950,easing:'ease-in-out',fill:'both'});
   await fade.finished;
   if(ticket!==generation)return;
   image.src=scene.src;image.alt=alt(scene);image.style.objectFit=scene.fit;image.style.objectPosition=scene.position;
   stage.classList.toggle('product-scene',scene.fit==='contain');index=next;stage.dataset.scene=String(index+1);
  }catch{/* Keep the current photograph if decoding or animation is interrupted. */}
  finally{incoming.remove();if(overlay===incoming)overlay=null;busy=false;schedule();}
 }
 function refresh(){
  if(!allowed()&&overlay){generation++;overlay.getAnimations().forEach(a=>a.cancel());overlay.remove();overlay=null;}
  image.alt=alt(scenes[index]);schedule();
 }
 stage.dataset.scene='1';stage.dataset.sceneCount=String(scenes.length);
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;refresh();},{threshold:.25}).observe(stage);
 stage.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){hovered=true;refresh();}});
 stage.addEventListener('pointerleave',()=>{hovered=false;refresh();});
 const composition=stage.closest('.photo-composition');
 composition.addEventListener('focusin',()=>{focused=true;refresh();});
 composition.addEventListener('focusout',e=>{focused=composition.contains(e.relatedTarget);refresh();});
 document.addEventListener('visibilitychange',refresh);
 new MutationObserver(refresh).observe(document.documentElement,{attributes:true,attributeFilter:['class','lang']});
 addEventListener('pagehide',()=>{visible=false;refresh();});
 addEventListener('pageshow',schedule);
})();
