/* Login/Signup: shrink the form a little (never the page scroll) so it always fits on screen */
(function () {
  'use strict';
  var form = document.querySelector('.auth-page-form');
  if (!form || !document.body.classList.contains('auth-no-scroll')) return;

  var inner = document.createElement('div');
  inner.className = 'auth-fit';
  while (form.firstChild) inner.appendChild(form.firstChild);
  form.appendChild(inner);

  var queued = false;
  function fit() {
    queued = false;
    inner.style.zoom = 1;
    var cs = getComputedStyle(form);
    var avail = form.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    var h = inner.getBoundingClientRect().height;
    var sf = inner.querySelector('#signupForm');
    var floor = (sf && sf.offsetParent) ? 0.8 : 0.6; /* signup: kam se kam shrink, text bara rehta hai */
    if (avail > 0 && h > avail) {
      inner.style.zoom = Math.max(floor, (avail / h) * 0.98);
    }
  }
  function queueFit() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(fit);
  }

  window.addEventListener('resize', queueFit);
  window.addEventListener('load', queueFit);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(queueFit);
  new MutationObserver(queueFit).observe(inner, {
    childList: true, subtree: true, characterData: true,
    attributes: true, attributeFilter: ['hidden', 'class']
  });
  queueFit();
})();
