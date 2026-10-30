(() => {
 'use strict';
 const root=document.documentElement;
 const media=matchMedia('(prefers-reduced-motion: reduce)');
 const fine=matchMedia('(hover: hover) and (pointer: fine)');
 const params=new URLSearchParams(location.search);
 let manual=params.has('reduce'), reduced=media.matches||manual;
 const active=new Set();
 const ease='cubic-bezier(.16,1,.3,1)';
 const stage=document.querySelector('.photo-stage');
 const parallax=document.querySelector('.photo-parallax');
 const hero=document.querySelector('.hero');
 const toggle=document.querySelector('.motion-switch');
 const controls=document.querySelector('.photo-controls');
 let inView=true,frame=0,rect=null,entranceDone=false;
 function animate(el,frames,options={}) {
  if(!el || !el.animate)return null;
  const animation=el.animate(reduced?[{opacity:.6},{opacity:1}]:frames,{duration:reduced?150:850,easing:ease,fill:'backwards',...options});
  active.add(animation);
  animation.finished.then(()=>{active.delete(animation);animation.cancel();},()=>active.delete(animation));
  return animation;
 }
 function resetSpatial(){cancelAnimationFrame(frame);frame=0;parallax.style.removeProperty('--parallax');stage.style.removeProperty('transform');}
 function motionLabel(){
  toggle.setAttribute('aria-pressed',String(reduced));
  const en=root.lang==='en',label=en?(reduced?'Reduced motion':'Reduce motion'):(reduced?'Movimiento reducido':'Reducir movimiento');toggle.setAttribute('aria-label',label);toggle.querySelector('span').textContent=label;
 }
 function syncMotion(){
  reduced=manual||media.matches;root.classList.toggle('motion-reduced',reduced);motionLabel();
  if(reduced){active.forEach(a=>a.cancel());active.clear();resetSpatial();}
 }
 controls.hidden=false;syncMotion();media.addEventListener('change',syncMotion);
 new MutationObserver(motionLabel).observe(root,{attributes:true,attributeFilter:['lang']});
 toggle.addEventListener('click',()=>{manual=!reduced;syncMotion();});
 // The default HTML is visible. WAAPI adds only finite, cancellable effects.
 const words=[...document.querySelectorAll('[data-word]')];
 words.forEach((word,i)=>animate(word,[{opacity:0,transform:'translateY(45px) rotate(2deg)'},{opacity:1,transform:'none'}],{duration:reduced?150:1050,delay:reduced?0:80+i*95}));
 animate(document.querySelector('.hero-description'),[{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'none'}],{delay:reduced?0:320});
 animate(document.querySelector('.hero-actions'),[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'none'}],{delay:reduced?0:420});
 const photoEntrance=animate(stage,[{opacity:0,transform:'translateY(28px) rotate(5deg) scale(.94)'},{opacity:1,transform:'rotate(2deg)'}],{duration:reduced?150:1300,delay:reduced?0:160});
 if(photoEntrance)photoEntrance.finished.catch(()=>{}).finally(()=>{entranceDone=true;});else entranceDone=true;
 animate(document.querySelector('.hero-light'),[{transform:'translateX(-8%)',opacity:.3},{transform:'translateX(0)',opacity:1}],{duration:reduced?150:3600});
 animate(document.querySelector('.dock'),[{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'none'}],{delay:reduced?0:540});
 if('IntersectionObserver' in window){
  const reveal=new IntersectionObserver(entries=>{
   entries.filter(e=>e.isIntersecting).forEach((entry,i)=>{reveal.unobserve(entry.target);animate(entry.target,[{opacity:0,transform:'translateY(22px) rotateX(3deg)'},{opacity:1,transform:'none'}],{duration:reduced?150:720,delay:reduced?0:i*65});});
  },{threshold:.12});
  document.querySelectorAll('.service-card').forEach(el=>reveal.observe(el));
  new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;if(!inView)resetSpatial();}).observe(hero);
 }
 function queueScroll(){
  if(frame||reduced||!inView||!fine.matches||document.hidden)return;
  frame=requestAnimationFrame(()=>{frame=0;parallax.style.setProperty('--parallax',`${Math.min(12,scrollY*.035).toFixed(2)}px`);});
 }
 addEventListener('scroll',queueScroll,{passive:true});
 stage.addEventListener('pointerenter',()=>{rect=stage.getBoundingClientRect();});
 stage.addEventListener('pointermove',e=>{
  if(reduced||!fine.matches||!entranceDone||!rect)return;
  const x=(e.clientX-rect.left)/rect.width-.5,y=(e.clientY-rect.top)/rect.height-.5;
  cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{frame=0;stage.style.transform=`rotate(2deg) rotateX(${(-y*3).toFixed(2)}deg) rotateY(${(x*4).toFixed(2)}deg)`;});
 });
 stage.addEventListener('pointerleave',()=>{rect=null;cancelAnimationFrame(frame);frame=0;stage.style.removeProperty('transform');});
 addEventListener('resize',()=>{rect=null;resetSpatial();},{passive:true});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){resetSpatial();active.forEach(a=>a.pause());}else active.forEach(a=>a.play());});
 // Deterministic review of the opening sequence; normal navigation needs no query.
 if(params.has('t')){const time=Number(params.get('t'))*1000;if(Number.isFinite(time))active.forEach(a=>{a.pause();a.currentTime=Math.max(0,time);});}
})();
