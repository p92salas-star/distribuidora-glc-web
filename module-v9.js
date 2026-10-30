(() => {
 if(parent===window)return;
 // Native module scripts initialize normally, in their own document and global scope.
 document.addEventListener('click',e=>{const a=e.target.closest('a[href]');if(!a||e.ctrlKey||e.metaKey||e.shiftKey)return;const raw=a.getAttribute('href');if(!raw||raw.startsWith('#'))return;const u=new URL(a.href);if(u.origin===location.origin&&parent.GLCNavigate?.(u.href)){e.preventDefault();e.stopImmediatePropagation();}},true);
 document.addEventListener('glc:language',()=>parent.dispatchEvent(new Event('storage')));
 document.querySelector('#glcCart')?.addEventListener('close',()=>parent.document.querySelector('#shell-cart')?.focus());
 addEventListener('pagehide',()=>{document.getAnimations().forEach(a=>a.cancel());});
})();
