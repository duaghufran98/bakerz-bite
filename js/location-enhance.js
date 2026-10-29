/* Bakerz Bite – Location page extras: today's day pill, copy address, scroll reveal */
(function () {
  'use strict';
  const q  = (s, r) => (r || document).querySelector(s);
  const qa = (s, r) => Array.from((r || document).querySelectorAll(s));

  /* 1) Highlight today (Karachi time) in the open-days row */
  function markToday() {
    const days = qa('#lcDays [data-day]');
    if (!days.length) return;
    const today = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Karachi', weekday: 'short' }).format(new Date());
    days.forEach(d => d.classList.toggle('is-today', d.dataset.day === today));
  }

  /* 2) Copy address button */
  function initCopy() {
    const btn = q('#lcCopy'), addr = q('#lcAddress');
    if (!btn || !addr) return;
    const toast = msg => {
      const t = q('#toast');
      if (!t) return;
      t.textContent = msg; t.classList.add('show');
      clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2200);
    };
    btn.addEventListener('click', () => {
      const text = addr.textContent.trim();
      const done = () => toast('Address copied');
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, () => toast('Could not copy. Please copy it manually.'));
      } else {
        const ta = document.createElement('textarea');
        ta.value = text; document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); done(); } catch (e) { toast('Could not copy. Please copy it manually.'); }
        ta.remove();
      }
    });
  }

  /* 3) Gentle scroll reveal (content stays visible if JS or IO is unavailable) */
  function initReveal() {
    const items = qa('.lc-reveal');
    if (!items.length || !('IntersectionObserver' in window)) return;
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const vh = window.innerHeight;
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        en.target.classList.add('lc-in');
        en.target.classList.remove('lc-pre');
        io.unobserve(en.target);
      });
    }, { threshold: 0.12 });
    items.forEach((el, i) => {
      if (el.getBoundingClientRect().top < vh * 0.9) return;   // already on screen
      el.classList.add('lc-pre');
      el.style.transitionDelay = ((i % 3) * 90) + 'ms';
      io.observe(el);
    });
  }

  document.addEventListener('DOMContentLoaded', () => { markToday(); initCopy(); initReveal(); });
})();
