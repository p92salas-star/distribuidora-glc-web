(function () {
  'use strict';
  var figure = document.querySelector('[data-hero-carousel]');
  if (!figure) return;

  var slides = Array.prototype.slice.call(figure.querySelectorAll('.hero-slide'));
  if (slides.length < 2) return;
  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var activeIndex = 0;
  var timer = 0;
  var visible = !('IntersectionObserver' in window);

  function show(index) {
    activeIndex = index;
    slides.forEach(function (slide, i) {
      var active = i === activeIndex;
      slide.classList.toggle('is-active', active);
      if (active) slide.removeAttribute('aria-hidden');
      else slide.setAttribute('aria-hidden', 'true');
    });
  }

  function stop() {
    window.clearTimeout(timer);
    timer = 0;
  }

  function schedule() {
    stop();
    if (motion.matches || !visible || document.hidden) return;
    timer = window.setTimeout(function () {
      show((activeIndex + 1) % slides.length);
      schedule();
    }, 5200);
  }

  // Keep the first authored image as the no-JS and reduced-motion fallback.
  show(0);
  figure.dataset.carouselReady = 'true';
  slides.slice(1).forEach(function (slide) {
    slide.loading = 'eager';
    if (typeof slide.decode === 'function') slide.decode().catch(function () {});
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      schedule();
    }, { threshold: 0.15 }).observe(figure);
  }
  document.addEventListener('visibilitychange', schedule);
  function onMotionChange() {
    if (motion.matches) show(0);
    schedule();
  }
  if (motion.addEventListener) motion.addEventListener('change', onMotionChange);
  else if (motion.addListener) motion.addListener(onMotionChange);
  schedule();
})();
