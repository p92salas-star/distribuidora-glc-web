(function () {
  'use strict';
  var gallery = document.querySelector('[data-shopper-lookbook]');
  if (gallery) {
    gallery.addEventListener('error', function (event) {
      if (!event.target.matches('[data-shopper-image]')) return;
      var frame = event.target.parentElement;
      if (frame.querySelector('.glc-photo-fallback')) return;
      var fallback = document.createElement('figcaption');
      fallback.className = 'glc-photo-fallback';
      fallback.textContent = document.documentElement.lang === 'en' ? 'This photo could not load. Try another thumbnail.' : 'No se pudo cargar esta fotografía. Elegí otra miniatura.';
      frame.appendChild(fallback);
    }, true);
    gallery.addEventListener('load', function (event) {
      if (event.target.closest('.shopper-lookbook__frame')) {
        var fallback = gallery.querySelector('.glc-photo-fallback');
        if (fallback) fallback.remove();
      }
    }, true);
  }
  var details = document.querySelector('.shopper-request');
  if (!details || typeof HTMLDialogElement === 'undefined') return;
  var trigger = details.querySelector('summary');
  var card = details.querySelector('.shopper-card');
  if (!trigger || !card) return;
  var dialog = document.createElement('dialog');
  dialog.className = 'glc-shopper-dialog';
  dialog.id = 'shopperRequestDialog';
  var title = card.querySelector('h3');
  title.id = 'shopperRequestTitle';
  dialog.setAttribute('aria-labelledby', title.id);
  var close = document.createElement('button');
  close.type = 'button';
  close.className = 'glc-shopper-dialog__close';
  function language() { close.textContent = document.documentElement.lang === 'en' ? 'Close' : 'Cerrar'; }
  language();
  document.addEventListener('glc:language', language);
  close.addEventListener('click', function () { dialog.close(); });
  dialog.appendChild(close);
  document.body.appendChild(dialog);
  trigger.setAttribute('aria-haspopup', 'dialog');
  trigger.setAttribute('aria-controls', dialog.id);
  trigger.addEventListener('click', function (event) {
    event.preventDefault();
    dialog.appendChild(card);
    dialog.showModal();
    trigger.setAttribute('aria-expanded', 'true');
    var input = card.querySelector('input');
    if (input) input.focus();
  });
  dialog.addEventListener('close', function () {
    trigger.setAttribute('aria-expanded', 'false');
    details.appendChild(card);
    trigger.focus();
  });
})();
