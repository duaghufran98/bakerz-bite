// Contact, Feedback, Product review aur Order emails — EmailJS ki ek hi template se.
// Template me sirf ye 4 variables hain: {{subject}}, {{from_name}}, {{reply_to}}, {{{html_body}}}
(function () {
  const cfg = window.EMAILJS_CONFIG || {};
  const ok = v => v && !/^YOUR_/.test(v);
  const configured = () => window.emailjs && ok(cfg.publicKey) && ok(cfg.serviceId) && ok(cfg.templateId);
  if (window.emailjs && ok(cfg.publicKey)) emailjs.init({ publicKey: cfg.publicKey });

  const esc = t => String(t == null ? '' : t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const nl = t => esc(t).replace(/\n/g, '<br>');
  const rs = n => 'Rs. ' + Number(n).toLocaleString('en-PK');
  const row = (k, v) => '<p style="margin:6px 0"><b>' + k + ':</b> ' + v + '</p>';

  function send(subject, fromName, replyTo, html) {
    return emailjs.send(cfg.serviceId, cfg.templateId, {
      to_email: cfg.ownerEmail,
      subject: subject,
      from_name: fromName,
      reply_to: replyTo || cfg.ownerEmail,
      html_body: html
    });
  }

  function handle(formId, msgId, build, successText) {
    const form = document.getElementById(formId);
    if (!form) return;
    const msg = document.getElementById(msgId);
    const btn = form.querySelector('button[type="submit"]');
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!configured()) { msg.textContent = 'Email service abhi set up nahi hai (js/emailjs-config.js check karein).'; return; }
      const label = btn.textContent;
      btn.disabled = true; btn.textContent = 'Sending…'; msg.textContent = '';
      try {
        const m = build();
        await send(m.subject, m.fromName, m.replyTo, m.html);
        msg.textContent = successText;
        form.reset();
        if (formId === 'reviewForm') {
          document.getElementById('ratingValue').value = 5;
          document.querySelectorAll('.star-choice').forEach(s => (s.textContent = '☆'));
        }
      } catch (err) {
        console.error('EmailJS error:', err);
        msg.textContent = 'Sorry, message send nahi ho saka. Dobara koshish karein.';
      } finally { btn.disabled = false; btn.textContent = label; }
    });
  }

  const val = id => (document.getElementById(id)?.value || '').trim();

  handle('contactForm', 'formMessage', () => ({
    subject: 'New contact message: ' + val('subject'),
    fromName: val('name'),
    replyTo: val('email'),
    html: '<h2>New contact message</h2>' + row('Name', esc(val('name'))) + row('Email', esc(val('email'))) +
      row('Subject', esc(val('subject'))) + row('Message', '<br>' + nl(val('message')))
  }), 'Thank you! Your message has been sent. We will get back to you soon.');

  handle('reviewForm', 'reviewMessage', () => {
    const product = val('reviewProduct') || 'General (whole bakery)';
    return {
      subject: 'New feedback on ' + product + ' from ' + val('reviewName'),
      fromName: val('reviewName'),
      replyTo: '',
      html: '<h2>New feedback</h2>' + row('Name', esc(val('reviewName'))) + row('Product', esc(product)) +
        row('Rating', esc(val('ratingValue')) + ' / 5') + row('Feedback', '<br>' + nl(val('reviewText')))
    };
  }, 'Thank you for sharing your feedback!');

  // Feedback page: product dropdown products.json se bharta hai
  const sel = document.getElementById('reviewProduct');
  if (sel) {
    Promise.resolve(window.PRODUCTS_DATA || fetch('../json/products.json?v=3').then(r => r.json())).then(list => {
      list.forEach(p => {
        const o = document.createElement('option');
        o.value = p.name; o.textContent = p.name + ' (' + p.category + ')';
        sel.appendChild(o);
      });
    }).catch(() => { });
  }

  // Product details page review (app.js se call hota hai)
  window.sendProductFeedback = function (r) {
    if (!configured()) { console.warn('EmailJS config incomplete — review email skipped.'); return; }
    send('New feedback on ' + r.product + ' from ' + r.name, r.name, '',
      '<h2>New product review</h2>' + row('Name', esc(r.name)) + row('Product', esc(r.product)) +
      row('Rating', esc(r.rating) + ' / 5') + row('Review', '<br>' + nl(r.text)))
      .catch(err => console.error('EmailJS error:', err));
  };

  // Checkout: naya order aate hi owner ko email. Hamesha resolve hota hai taake order kabhi na ruke.
  window.sendOrderEmail = function (o) {
    return new Promise(resolve => {
      if (!configured()) { console.warn('Order email skipped (EmailJS not configured).'); return resolve(false); }
      const items = '<ul>' + o.items.map(i => '<li>' + esc(i.name) + ' × ' + esc(i.qty) + ' — ' + rs(i.price * i.qty) + '</li>').join('') + '</ul>';
      const html = '<h2>New order received</h2>' + row('Order ID', esc(o.orderId)) + row('Customer', esc(o.customer)) +
        row('Customer email', esc(o.email)) + row('Order type', esc(o.type)) + row('Location', esc(o.place)) +
        row('Payment', esc(o.payment)) + '<p><b>Items:</b></p>' + items +
        '<p>Subtotal: ' + rs(o.subtotal) + '<br>Delivery: ' + rs(o.delivery) + '</p><p><b>Total: ' + rs(o.total) + '</b></p>';
      const timer = setTimeout(() => resolve(false), 6000);
      send('New order ' + o.orderId + ' - ' + rs(o.total), o.customer, /@/.test(o.email) ? o.email : '', html)
        .then(() => { clearTimeout(timer); resolve(true); })
        .catch(err => { clearTimeout(timer); console.error('EmailJS order error:', err); resolve(false); });
    });
  };

  // Login / Signup: user ke login ya account banane par owner ko email (password kabhi nahi bheja jata)
  window.sendAuthEmail = function (a) {
    if (!configured()) { console.warn('Auth email skipped (EmailJS not configured).'); return; }
    const isSignup = a.mode === 'signup';
    send((isSignup ? 'New signup: ' : 'User login: ') + a.email, a.name || a.email, a.email,
      '<h2>' + (isSignup ? 'New account created' : 'User logged in') + '</h2>' +
      row('Name', esc(a.name || '—')) + row('Email', esc(a.email)) +
      row('Time', esc(new Date().toLocaleString('en-PK'))))
      .catch(err => console.error('EmailJS auth error:', err));
  };
})();
