/* Direct-manipulation motion for the GLC product world. */
(function () {
  'use strict';
  document.documentElement.dataset.glcMotion = 'ready';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var ease = 'cubic-bezier(.16,1,.3,1)';
  function animateTransient(element, keyframes, options) {
    if (!element || !Element.prototype.animate) return null;
    var animation = element.animate(keyframes, options);
    animation.addEventListener('finish', function () { animation.cancel(); }, { once: true });
    return animation;
  }
  var campaignHero = document.querySelector('.portal-hero, .hero-world, .media-campaign.hero, .hero.has-image');
  var heroFigure = document.querySelector('.portal-hero__media, .hero-world__photograph, .media-campaign .hero-media, .hero.has-image .hero-media');
  var heroPhoto = document.getElementById('heroWorldImage') || (heroFigure && heroFigure.querySelector('img'));
  if (heroFigure && heroPhoto) {
    var entrancePlayed = false;
    function arrivePhoto() {
      if (entrancePlayed) return;
      entrancePlayed = true;
      heroFigure.classList.add('is-arrived');
      if (reduce.matches || !Element.prototype.animate) return;
      var copyItems = campaignHero && !campaignHero.matches('.hero-world') ? campaignHero.querySelectorAll('.hero-copy .hero-copy__message h1,.hero .lede,.hero .ctas,.hero-delivery,.hero-brand-panel') : [];
      Array.from(copyItems).forEach(function(item,index){
        animateTransient(item,[{opacity:.35,transform:'translate3d(0,18px,0)'},{opacity:1,transform:'translate3d(0,0,0)'}],{duration:760,easing:ease,delay:100+index*105,fill:'both'});
      });
      var mark = document.querySelector('header.site .brand-lockup img');
      if (mark) animateTransient(mark,[{opacity:.6,transform:'translate3d(0,-5px,0)'},{opacity:1,transform:'translate3d(0,0,0)'}],{duration:660,easing:ease,delay:90,fill:'both'});
      if (heroPhoto.animate && campaignHero && !campaignHero.matches('.hero-world')) animateTransient(heroPhoto,[{transform:'scale(1.045)'},{transform:'scale(1)'}],{duration:1500,easing:ease,fill:'both'});
    }
    if (heroPhoto.complete) requestAnimationFrame(arrivePhoto);
    else heroPhoto.addEventListener('load', arrivePhoto, { once: true });
    var photoFrame = 0, photoRect = null;
    function cachePhotoRect() {
      var rect = heroFigure.getBoundingClientRect();
      photoRect = rect.width && rect.height ? { left: rect.left, top: rect.top, width: rect.width, height: rect.height } : null;
    }
    heroFigure.addEventListener('pointerenter', cachePhotoRect);
    window.addEventListener('resize', cachePhotoRect, { passive: true });
    if ('ResizeObserver' in window) new ResizeObserver(cachePhotoRect).observe(heroFigure);
    heroFigure.addEventListener('pointermove', function (event) {
      if (reduce.matches || window.innerWidth < 761 || !event.isPrimary) return;
      if (!photoRect) cachePhotoRect();
      if (!photoRect) return;
      var x = (event.clientX - photoRect.left) / photoRect.width - .5;
      var y = (event.clientY - photoRect.top) / photoRect.height - .5;
      if (photoFrame) cancelAnimationFrame(photoFrame);
      photoFrame = requestAnimationFrame(function () {
        heroPhoto.style.transform = 'translate3d(' + (x * -8).toFixed(1) + 'px,' + (y * -6).toFixed(1) + 'px,0)';
        photoFrame = 0;
      });
    });
    heroFigure.addEventListener('pointerleave', function () {
      heroPhoto.style.transform = '';
    });
  }

  var atelierPhoto = document.querySelector('.atelier__image img');
  if (atelierPhoto && !reduce.matches && Element.prototype.animate && 'IntersectionObserver' in window) {
    var atelierObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        animateTransient(atelierPhoto, [{ opacity: .72, transform: 'scale(1.07)' }, { opacity: 1, transform: 'scale(1.025)' }], { duration: 1250, easing: ease, fill: 'both' });
        atelierObserver.disconnect();
      });
    }, { threshold: .12 });
    atelierObserver.observe(atelierPhoto);
  }

  if (campaignHero && 'IntersectionObserver' in window) {
    var campaignObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { campaignHero.classList.toggle('is-offscreen', !entry.isIntersecting); });
    });
    campaignObserver.observe(campaignHero);
  }

  var revealTargets = document.querySelectorAll('.real-catalog__head, .atelier__copy, .kit-invitation-copy, .lash-edit__heading, .layaway-intro, .shopper__intro, .shopper-lookbook, .citas__info, .distributor-copy, .hero-world__caption');
  function reveal(element) {
    if (!element || element.dataset.motionPlayed || reduce.matches || !Element.prototype.animate) return;
    element.dataset.motionPlayed = 'true';
    animateTransient(element, [{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 640, easing: ease, fill: 'both' });
  }
  if (!reduce.matches && Element.prototype.animate && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { if (!entry.isIntersecting) return; reveal(entry.target); observer.unobserve(entry.target); });
    }, { threshold: .16, rootMargin: '0px 0px -5% 0px' });
    revealTargets.forEach(function (element) { observer.observe(element); });
    var productObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { if (!entry.isIntersecting) return; reveal(entry.target); productObserver.unobserve(entry.target); });
    }, { threshold: .14, rootMargin: '0px 0px -4% 0px' });
    var watchCards = function (root) { if (!root) return; root.querySelectorAll('.merch-card:not([data-motion-observed]),.cat-card:not([data-motion-observed]),.feat-card:not([data-motion-observed])').forEach(function (card) { card.dataset.motionObserved = 'true'; productObserver.observe(card); }); };
    ['#featuredGrid','#categoryGrid','.real-catalog','.product-rail'].forEach(function(selector){document.querySelectorAll(selector).forEach(watchCards);});
    new MutationObserver(function(mutations){mutations.forEach(function(m){if(m.target instanceof Element)watchCards(m.target);});}).observe(document.body,{childList:true,subtree:true});
  }

  var siteHeader = document.querySelector('header.site'), headerFrame = 0;
  function updateHeader(){headerFrame=0;if(siteHeader)siteHeader.classList.toggle('is-scrolled',window.scrollY>12);}
  window.addEventListener('scroll',function(){if(!headerFrame)headerFrame=requestAnimationFrame(updateHeader);},{passive:true});
  updateHeader();
})();
