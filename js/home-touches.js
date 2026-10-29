/* Home page: tap-to-copy offer code */
(function () {
  'use strict';
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.code-ticket');
    if (!b) return;
    var code = b.getAttribute('data-copy'), note = b.querySelector('small');
    function done() { note.textContent = 'Copied'; setTimeout(function () { note.textContent = 'Tap to copy'; }, 1800); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(code).then(done, done);
    else done();
  });
})();
