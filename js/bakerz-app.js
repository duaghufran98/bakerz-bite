const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
/* Page-aware paths: index.html lives in the project root, all other pages live in /html/ */
const IN_HTML = (() => { const src = document.currentScript?.getAttribute('src') || ''; return src ? src.startsWith('../') : /\/html\/[^/]*$/.test(location.pathname); })();
const ASSET = path => (IN_HTML ? '../' : '') + path;       // images/..., json/...
const PAGE = name => (IN_HTML ? '' : 'html/') + name;      // menu.html, login.html ...
const HOME = IN_HTML ? '../index.html' : 'index.html';
const money = n => 'Rs. ' + Number(n).toLocaleString('en-PK');
const getCart = () => JSON.parse(localStorage.getItem('bakerzCart') || '[]');
const saveCart = cart => { localStorage.setItem('bakerzCart', JSON.stringify(cart)); updateCartCount(); syncProductButtons(); };
function updateCartCount() { const n = getCart().reduce((a, x) => a + x.qty, 0); $$('[data-cart-count]').forEach(el => el.textContent = n); renderDrawerCart?.() }
function toast(msg) { const t = $('#toast'); if (!t) return; t.textContent = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2400) }
function addToCart(id, button = null, quantity = 1) { const p = products.find(x => x.id === Number(id)); if (!p) return; const c = getCart(); const found = c.find(x => x.id === p.id); found ? found.qty += quantity : c.push({ ...p, qty: quantity }); saveCart(c); if (button && !button.classList.contains('small-btn')) { button.classList.add('is-added'); button.innerHTML = 'Added to cart <span class="added-check" aria-hidden="true">✓</span>'; button.setAttribute('aria-label', p.name + ' added to cart'); } syncProductButtons(); openCartDrawer(); toast(p.name + ' added to your cart.') }
function syncProductButtons() { const ids = new Set(getCart().map(item => Number(item.id))); $$('.product-card .small-btn[data-product-id]').forEach(button => { const added = ids.has(Number(button.dataset.productId)); button.classList.toggle('is-added', added); button.innerHTML = added ? '<span class="home-added-check" aria-hidden="true">✓</span>' : '<span aria-hidden="true">＋</span>'; button.setAttribute('aria-label', added ? button.dataset.productName + ' added to cart' : 'Add ' + button.dataset.productName + ' to cart'); button.setAttribute('title', added ? 'Added to cart' : 'Add to cart'); }); $$('[data-cart-product-action][data-product-id]').forEach(button => { const added = ids.has(Number(button.dataset.productId)); button.classList.toggle('is-added', added); button.innerHTML = added ? 'Added to cart <span class="added-check" aria-hidden="true">✓</span>' : 'Add to cart'; button.setAttribute('aria-label', added ? button.dataset.productName + ' added to cart' : 'Add ' + button.dataset.productName + ' to cart'); }); }

function renderDrawerCart() { const host = $('#drawerCartItems'); if (!host) return; const cart = getCart(); const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0); host.innerHTML = cart.length ? cart.map(item => `<div class="drawer-cart-row"><img src="${ASSET(item.image)}" alt="${item.name}"><div><h3>${item.name}</h3><p>${money(item.price)} each</p><div class="qty"><button type="button" onclick="changeQty(${item.id},-1)" aria-label="Decrease ${item.name}">−</button><span>${item.qty}</span><button type="button" onclick="changeQty(${item.id},1)" aria-label="Increase ${item.name}">+</button></div></div><div style="text-align:right"><strong>${money(item.price * item.qty)}</strong><br><button class="remove-btn" type="button" onclick="removeItem(${item.id})" aria-label="Remove ${item.name} from cart" title="Remove item"><svg class="trash-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m3 4v5m6-5v5"/></svg></button></div></div>`).join('') : '<div class="empty-state"><h3>Your cart is empty</h3><p>Add something freshly baked to get started.</p><a class="btn btn-primary" href="' + PAGE('menu.html') + '">Explore the menu</a></div>'; const total = $('#drawerCartSubtotal'); if (total) total.textContent = money(subtotal); const delivery = $('#drawerDelivery'); if (delivery) delivery.textContent = money(cart.length ? 150 : 0); const grand = $('#drawerCartTotal'); if (grand) grand.textContent = money(subtotal + (cart.length ? 150 : 0)); const checkout = $('#drawerCheckoutBtn'); if (checkout) checkout.disabled = !cart.length; }
function openCartDrawer() { document.body.classList.add('cart-open'); $('#cartDrawer')?.setAttribute('aria-hidden', 'false'); renderDrawerCart() }
function closeCartDrawer() { document.body.classList.remove('cart-open'); $('#cartDrawer')?.setAttribute('aria-hidden', 'true') }

let products = [];
Promise.resolve(window.PRODUCTS_DATA || fetch(ASSET('json/products.json?v=3')).then(r => r.json())).then(data => { products = data; renderProductCards(); renderDetail(); renderCart(); }).catch(() => { });
function productCard(p) { const reviews = getProductReviews(p.id); const avg = reviews.length ? reviews.reduce((a, r) => a + Number(r.rating), 0) / reviews.length : (p.rating || 4.8); const count = reviews.length + (p.reviewCount || 0); return `<article class="product-card"><a href="${PAGE('product-details.html')}?id=${p.id}"><img src="${ASSET(p.image)}" alt="${p.name}" loading="eager" style="display:block;" onerror="this.onerror=null;this.src='${ASSET('images/logo-bakerz-bite.png?v=4')}';"></a><div class="product-info"><span class="tag">${p.category}</span><h3><a href="${PAGE('product-details.html')}?id=${p.id}">${p.name}</a></h3><p>${p.desc}</p><div class="product-bottom"><span class="price">${money(p.price)}</span><button class="small-btn" data-product-id="${p.id}" data-product-name="${p.name}" aria-label="Add ${p.name} to cart" title="Add to cart" onclick="addToCart(${p.id}, this)"><span aria-hidden="true">＋</span></button></div></div></article>` }
//  Espresso/mocha theme. Each category has its own tint, accent colour and title. Photos come from that category's own products.
//  To use your OWN banner picture for a category, add  image: 'assets/banners/cakes.jpg'  to its entry below. */
const CATEGORY_ORDER = ['Cakes', 'Pastries', 'Cookies', 'Pies', 'Merchandise'];
const CATEGORY_BANNERS = {
  Cakes: { title: 'CAKE', tag: 'Baked fresh for every celebration', c1: '#24150f', c2: '#58352c', accent: '#f0c2ae', fs: .40 },
  Pastries: { title: 'PASTRIES', tag: 'Flaky, buttery and golden', c1: '#24150f', c2: '#5a3b1c', accent: '#f0cd86', fs: .30 },
  Cookies: { title: 'COOKIES', tag: 'Crisp edges, soft centres', c1: '#24150f', c2: '#4e3320', accent: '#e3b57d', fs: .32 },
  Pies: { title: 'PIES', tag: 'Homestyle with a golden crust', c1: '#24150f', c2: '#562d31', accent: '#e8a79b', fs: .40 },
  Merchandise: { title: 'MERCHANDISE', tag: 'Take a little Bakerz Bite home', c1: '#24150f', c2: '#3f3226', accent: '#d2bfa3', fs: .22 }
};
const catSlug = c => String(c).toLowerCase().replace(/[^a-z0-9]+/g, '-');
function categoryBanner(cat, photos) {
  const b = CATEGORY_BANNERS[cat]; if (!b) return '';
  if (b.image) return `<div class="cat-banner cat-banner-custom" role="img" aria-label="${cat}"><img src="${b.image}" alt="${cat}" loading="lazy"></div>`;
  const pics = (photos || []).filter(Boolean);
  const photo = (n, cls) => pics.length ? `<img class="cb-photo ${cls}" src="${pics[n % pics.length]}" alt="" loading="lazy">` : '';
  return `<div class="cat-banner" role="img" aria-label="${cat}" style="--bn-c1:${b.c1};--bn-c2:${b.c2};--bn-accent:${b.accent};--bn-fs:${b.fs}">${photo(0, 'cb-p1')}${photo(1, 'cb-p2')}${photo(2, 'cb-p3')}${photo(3, 'cb-p4')}<div class="cb-center"><div class="cb-kicker">&#10022; Bakerz Bite &#10022;</div><div class="cb-title">${b.title}</div><div class="cb-tag"><span></span>${b.tag}<span></span></div></div></div>`;
}
function categoryPhotos(cat, extra) {
  const own = products.filter(p => p.category === cat).map(p => ASSET(p.image));
  return [...new Set([...(extra || []), ...own])].slice(0, 4);
}
const HOME_CARD_LIMIT = 8; /* home page shows only the first 8 cards; "View all bakes" opens the Menu page with every card */
function renderProductCards() {
  const grid = $('#productGrid'); if (!grid) return;
  const category = $('#categoryFilter')?.value || 'All';
  const search = ($('#productSearch')?.value || '').toLowerCase();
  const filtered = products.filter(p => (category === 'All' || p.category === category) && (p.name + ' ' + p.desc + ' ' + p.category).toLowerCase().includes(search));
  if (!$('#categoryFilter')) { const shown = filtered.slice(0, HOME_CARD_LIMIT); grid.innerHTML = shown.map(productCard).join('') || '<p class="muted">No products match your search.</p>'; syncProductButtons(); return; } /* home page: first 8 cards only, "View all bakes" shows the rest */
  const groups = CATEGORY_ORDER.map(cat => ({ cat, items: filtered.filter(p => p.category === cat) })).filter(g => g.items.length);
  grid.innerHTML = groups.map(g => `<section class="cat-section" id="cat-${catSlug(g.cat)}">${categoryBanner(g.cat, categoryPhotos(g.cat))}<div class="product-grid">${g.items.map(productCard).join('')}</div></section>`).join('') || '<p class="muted">No products match your search.</p>'; syncProductButtons();
}
function getProductReviews(id) { try { return JSON.parse(localStorage.getItem('bakerzReviews_' + id) || '[]') } catch (e) { return [] } }
let detailQuantity = 1; function changeDetailQty(delta) { detailQuantity = Math.max(1, Math.min(99, detailQuantity + delta)); const output = document.getElementById('detailQty'); if (output) output.textContent = detailQuantity; } function addDetailToCart(id, button) { addToCart(id, button, detailQuantity); }
function renderDetail() { const host = $('#productDetail'); if (!host) return; const id = Number(new URLSearchParams(location.search).get('id')); const p = products.find(x => x.id === id) || products[0]; if (!p) return; const reviews = getProductReviews(p.id); const avg = reviews.length ? reviews.reduce((a, r) => a + Number(r.rating), 0) / reviews.length : (p.rating || 4.8); host.innerHTML = `<div class="product-detail"><div class="product-detail-visual"><span class="detail-image-note">✦ Baked with care</span><img src="${ASSET(p.image)}" alt="${p.name}" style="display:block;width:100%;min-height:300px;object-fit:contain;background:#fff;" onerror="this.onerror=null;this.src='${ASSET('images/logo-bakerz-bite.png?v=4')}';"><div class="detail-image-caption"><span>BAKERZ BITE</span><span>Small-batch goodness</span></div></div><div class="product-detail-copy"><span class="kicker">Freshly made at Bakerz Bite</span><h1>${p.name}</h1><p class="price detail-price">${money(p.price)}</p><div class="product-rating"><span class="rating-stars">★★★★★</span><strong>${avg.toFixed(1)}</strong><span class="rating-count">(${reviews.length + (p.reviewCount || 0)} reviews)</span></div><p class="detail-description">${p.desc}</p><div class="detail-divider"></div><div class="detail-buy-row"><div class="detail-quantity"><button type="button" onclick="changeDetailQty(-1)" aria-label="Decrease quantity">−</button><output id="detailQty">1</output><button type="button" onclick="changeDetailQty(1)" aria-label="Increase quantity">＋</button></div><button class="btn btn-primary detail-add-btn" data-cart-product-action data-product-id="${p.id}" data-product-name="${p.name}" onclick="addDetailToCart(${p.id}, this)">Add to cart</button></div></div></div><section class="product-review-panel" id="productReviews"><span class="kicker">Customer feedback</span><h2>Reviews for ${p.name}</h2><div class="review-list">${reviews.length ? reviews.map(r => `<article class="review-item"><div class="review-stars">${'★'.repeat(Number(r.rating))}${'☆'.repeat(5 - Number(r.rating))}</div><strong>${escapeText(r.name)}</strong><p>${escapeText(r.text)}</p></article>`).join('') : '<p class="muted">No customer-written reviews yet. Be the first to share your experience.</p>'}</div><form id="productReviewForm" class="product-review-form"><div class="field"><label for="reviewerName">Your name</label><input id="reviewerName" required placeholder="Name"></div><div class="field"><label for="productRating">Your rating</label><select id="productRating" required><option value="5">★★★★★ — Excellent</option><option value="4">★★★★☆ — Very good</option><option value="3">★★★☆☆ — Good</option><option value="2">★★☆☆☆ — Fair</option><option value="1">★☆☆☆☆ — Needs improvement</option></select></div><div class="field"><label for="productReviewText">Your review</label><textarea id="productReviewText" required minlength="4" placeholder="Tell other customers what you thought..."></textarea></div><button class="btn btn-primary" type="submit">Submit review</button><p id="productReviewMessage" class="form-message" role="status"></p></form></section>`; $('#productReviewForm')?.addEventListener('submit', e => { e.preventDefault(); const list = getProductReviews(p.id); list.unshift({ name: $('#reviewerName').value.trim(), rating: Number($('#productRating').value), text: $('#productReviewText').value.trim() }); localStorage.setItem('bakerzReviews_' + p.id, JSON.stringify(list)); window.sendProductFeedback?.({ product: p.name, name: list[0].name, rating: list[0].rating, text: list[0].text }); renderDetail(); toast('Thank you for reviewing this product') }) }
function escapeText(value) { return String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])) }
function renderCart() { const host = $('#cartItems'); if (!host) return; const c = getCart(); const subtotal = c.reduce((s, x) => s + x.price * x.qty, 0); host.innerHTML = c.length ? c.map(x => `<div class="cart-row"><img src="${ASSET(String(x.image||'').replace(/^(\.\.\/)+/, ''))}" alt="${x.name}"><div><h3>${x.name}</h3><p>${money(x.price)} each</p><div class="qty"><button onclick="changeQty(${x.id},-1)" aria-label="Decrease quantity">−</button><span>${x.qty}</span><button onclick="changeQty(${x.id},1)" aria-label="Increase quantity">+</button></div></div><div style="text-align:right"><strong>${money(x.price * x.qty)}</strong><br><button class="remove-btn" onclick="removeItem(${x.id})" aria-label="Remove ${x.name} from cart" title="Remove item"><svg class="trash-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m3 4v5m6-5v5"/></svg></button></div></div>`).join('') : '<div class="empty-state"><h3>Your cart is waiting for a treat.</h3><p>Add something freshly baked to get started.</p><a class="btn btn-primary" href="' + PAGE('menu.html') + '">Explore the menu</a></div>'; const total = $('#cartTotal'); if (total) total.textContent = money(subtotal + (c.length ? 150 : 0)); const sub = $('#cartSubtotal'); if (sub) sub.textContent = money(subtotal); const delivery = $('#cartDelivery'); if (delivery) delivery.textContent = money(c.length ? 150 : 0); const checkout = $('#checkoutBtn'); if (checkout) checkout.disabled = !c.length; }
function changeQty(id, d) { const c = getCart().map(x => x.id === id ? { ...x, qty: x.qty + d } : x).filter(x => x.qty > 0); saveCart(c); renderCart(); renderDrawerCart() }
function removeItem(id) { saveCart(getCart().filter(x => x.id !== id)); renderCart(); renderDrawerCart(); toast('Item removed from cart') }
function checkout() {
  const cart = getCart();
  if (!cart.length) return;
  openOrderPopup(true, () => { location.href = PAGE('checkout.html'); });
}
function placeOrder() {
  const cart = getCart();
  if (!cart.length) { location.href = PAGE('menu.html'); return; }
  const form = $('#checkoutForm');
  if (!form || !form.reportValidity()) return;
  const details = {
    title: $('#customerTitle')?.value || 'Mr.',
    name: $('#customerName')?.value.trim() || '',
    phone: $('#customerPhone')?.value.trim() || '',
    alternatePhone: $('#alternatePhone')?.value.trim() || '',
    email: $('#customerEmail')?.value.trim() || '',
    notes: $('#orderNotes')?.value.trim() || '',
    payment: $('input[name="paymentMethod"]:checked')?.value || 'Pay at pickup',
    address: $('#customerAddress')?.value.trim() || ''
  };
  const pref = getOrderPref();
  if (pref?.type === 'delivery' && !details.address) {
    const addressField = $('#customerAddress');
    addressField.setCustomValidity('Please enter your delivery address.');
    addressField.reportValidity();
    addressField.setCustomValidity('');
    return;
  }
  const items = cart.map(i => ({ id: i.id, name: i.name, price: Number(i.price), qty: i.qty, image: i.image }));
  const orderId = 'BB-' + Date.now().toString(36).toUpperCase();
  localStorage.setItem('bakerzLastOrder', JSON.stringify(items));
  localStorage.setItem('bakerzLastOrderId', orderId);
  localStorage.setItem('bakerzLastOrderType', orderPrefLabel());
  localStorage.setItem('bakerzCustomerDetails', JSON.stringify(details));
  localStorage.removeItem('bakerzCart');
  location.href = PAGE('thank-you.html');
}
function setTheme(dark) { document.body.classList.toggle('dark', dark); localStorage.setItem('bakerzTheme', dark ? 'dark' : 'light'); const b = $('#themeToggle'); if (b) { b.setAttribute('aria-checked', String(!dark)); b.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme'); b.title = dark ? 'Light theme' : 'Dark theme'; } const knob = $('#themeIcon'); if (knob) knob.textContent = dark ? '☾' : '☀'; }
/* ---------- Login / Signup (front-end demo: accounts are saved in this browser only) ---------- */
const USERS_KEY = 'bakerzUsers', SESSION_KEY = 'bakerzSession';
const PROFILE_ICON = '<svg class="profile-icon-svg" viewBox="0 0 24 24" focusable="false" aria-hidden="true"><circle cx="12" cy="8" r="3.1"/><path d="M5.8 19c.5-3.4 2.7-5.2 6.2-5.2s5.7 1.8 6.2 5.2"/></svg>';
const readJSON = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch (e) { return fallback; } };
async function hashPassword(password, salt) {
  const text = salt + ':' + password;
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  }
  let h = 5381; for (const ch of text) h = ((h << 5) + h + ch.charCodeAt(0)) >>> 0; return 'x' + h.toString(16);
}
function currentUser() { const id = localStorage.getItem(SESSION_KEY); return readJSON(USERS_KEY, []).find(u => u.id === id) || null; }
async function signupUser(name, email, password) {
  name = String(name || '').trim(); email = String(email || '').trim().toLowerCase(); password = String(password || '');
  if (name.length < 2) return { error: 'Please enter your full name.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Please enter a valid email address.' };
  if (password.length < 8) return { error: 'Password must contain at least 8 characters.' };
  const users = readJSON(USERS_KEY, []);
  if (users.some(u => u.email === email)) return { error: 'An account with this email already exists. Please login.' };
  const salt = Math.random().toString(36).slice(2) + Date.now().toString(36);
  const user = { id: 'u' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7), name, email, salt, hash: await hashPassword(password, salt) };
  users.push(user); localStorage.setItem(USERS_KEY, JSON.stringify(users)); localStorage.setItem(SESSION_KEY, user.id);
  return { user };
}
async function loginUser(email, password) {
  email = String(email || '').trim().toLowerCase(); password = String(password || '');
  const user = readJSON(USERS_KEY, []).find(u => u.email === email);
  if (!user || user.hash !== await hashPassword(password, user.salt)) return { error: 'Email or password is incorrect.' };
  localStorage.setItem(SESSION_KEY, user.id); return { user };
}
function logoutUser() { localStorage.removeItem(SESSION_KEY); }
function updateAccountNav() {
  const user = currentUser();
  const link = $('#accountNav'), icon = $('#accountStatusIcon'), label = $('#accountNavText'), signup = $('#signupNavBtn');
  let logout = $('#logoutBtn');
  if (!link || !icon) return;
  const menuLink = $('#menuAccountLink');
  if (menuLink) {
    if (user) { menuLink.textContent = 'Logout'; menuLink.href = '#'; menuLink.onclick = e => { e.preventDefault(); logoutUser(); updateAccountNav(); toast('You have been logged out'); }; }
    else { menuLink.textContent = 'Create Account'; menuLink.href = PAGE('signup.html'); menuLink.onclick = null; }
  }
  if (user) {
    icon.textContent = (user.name || user.email || 'B').trim().charAt(0).toUpperCase();
    icon.classList.add('logged-in');
    link.href = '#'; link.title = 'Signed in as ' + user.name; link.setAttribute('aria-label', 'Signed in as ' + user.name);
    link.onclick = e => e.preventDefault();
    if (label) label.textContent = user.name;
    if (signup) signup.style.display = 'none';
    if (!logout) {
      logout = document.createElement('button');
      logout.id = 'logoutBtn'; logout.type = 'button'; logout.className = 'icon-btn logout-btn'; logout.textContent = 'Logout';
      logout.setAttribute('aria-label', 'Logout');
      link.insertAdjacentElement('afterend', logout);
    }
    logout.onclick = () => { logoutUser(); updateAccountNav(); toast('You have been logged out'); };
  } else {
    icon.innerHTML = PROFILE_ICON; icon.classList.remove('logged-in');
    link.href = PAGE('login.html'); link.title = 'Login'; link.setAttribute('aria-label', 'Login'); link.onclick = null;
    if (label) label.textContent = 'Login';
    if (signup) signup.style.display = '';
    if (logout) logout.remove();
  }
}
async function submitAuth(mode) {
  const msg = $('#authMessage');
  const form = mode === 'login' ? $('#loginForm') : $('#signupForm');
  const button = form?.querySelector('button[type="submit"]');
  const show = (text, isError) => { if (msg) { msg.textContent = text; msg.classList.toggle('is-error', !!isError); } };
  const email = $('#' + (mode === 'login' ? 'loginEmail' : 'signupEmail'))?.value;
  const password = $('#' + (mode === 'login' ? 'loginPassword' : 'signupPassword'))?.value;
  if (mode === 'signup' && password !== $('#confirmPassword')?.value) { show('Passwords do not match.', true); return; }
  show('', false);
  if (button) { button.disabled = true; button.dataset.originalText = button.textContent; button.textContent = mode === 'login' ? 'Logging in...' : 'Creating account...'; }
  const result = mode === 'login' ? await loginUser(email, password) : await signupUser($('#signupName')?.value, email, password);
  if (button) { button.disabled = false; button.textContent = button.dataset.originalText; }
  if (result.error) { show(result.error, true); return; }
  window.sendAuthEmail?.({ mode, email, name: mode === 'signup' ? $('#signupName')?.value : (result.user?.name || result.name || '') });
  updateAccountNav();
  show(mode === 'login' ? 'Login successful! Welcome back.' : 'Account created! You are now logged in.', false);
  setTimeout(() => { location.href = HOME; }, 700);
}

const AUTH_COPY = {
  login: { title: 'Login', eyebrow: 'A LITTLE JOY, FRESH FROM THE OVEN', heading: 'Welcome back.', text: 'Sign in and make your next sweet moment easy.', img: ASSET('images/auth-login-pastries.jpg'), alt: 'Fresh pastries and crumb cake on display in a bakery' },
  signup: { title: 'Sign Up', eyebrow: 'JOIN OUR BAKERY FAMILY', heading: 'Something good starts here.', text: 'Create an account to keep your favourite bakes close at hand.', img: '', alt: 'Freshly baked golden croissants' }
};
function setAuthTab(mode, updateUrl = true) {
  if (!$('#loginPanel') || !$('#signupPanel')) return;
  if (mode !== 'signup') mode = 'login';
  const copy = AUTH_COPY[mode];
  $$('[data-auth-panel]').forEach(p => { p.hidden = p.dataset.authPanel !== mode; });
  $$('[data-auth-tab]').forEach(b => { const on = b.dataset.authTab === mode; b.classList.toggle('active', on); b.setAttribute('aria-selected', String(on)); });
  const msg = $('#authMessage'); if (msg) { msg.textContent = ''; msg.classList.remove('is-error'); }
  const photo = $('#authPhoto'); if (photo) { photo.src = copy.img; photo.alt = copy.alt; }
  if ($('#authEyebrow')) $('#authEyebrow').textContent = copy.eyebrow;
  if ($('#authPhotoTitle')) $('#authPhotoTitle').textContent = copy.heading;
  if ($('#authPhotoText')) $('#authPhotoText').textContent = copy.text;
  document.title = copy.title + ' | Bakerz Bite';
  if (updateUrl && history.replaceState) history.replaceState(null, '', mode === 'signup' ? '#signup' : location.pathname.split('/').pop() || 'login.html');
}
function initAuthTabs() {
  if (!$('#loginPanel')) return;
  $$('[data-auth-tab]').forEach(b => b.addEventListener('click', () => setAuthTab(b.dataset.authTab)));
  $$('[data-auth-switch]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); setAuthTab(a.dataset.authSwitch); }));
  const q = new URLSearchParams(location.search);
  setAuthTab(location.hash === '#signup' || q.get('tab') === 'signup' ? 'signup' : 'login', false);
  window.addEventListener('hashchange', () => setAuthTab(location.hash === '#signup' ? 'signup' : 'login', false));
}
/* ---------- Login / Sign up tabs on one page ---------- */
const AUTH_PHOTOS = {
  login: { src: ASSET('images/login-bakerz-bite.jpg'), alt: 'Bakerz Bite chef hat, paper bag, croissants, cookies and muffins', eyebrow: 'A LITTLE JOY, FRESH FROM THE OVEN', title: 'Welcome back.', text: 'Sign in and make your next sweet moment easy.' },
  signup: { src: ASSET('images/auth-signup-pastries.jpg'), alt: 'Fresh pastries arranged in a bright bakery', eyebrow: 'JOIN OUR BAKERY FAMILY', title: 'Something good starts here.', text: 'Create an account to keep your favourite bakes close at hand.' }
};

function showAuthMode(mode) {
  const loginPanel = document.getElementById('panelLogin');
  const signupPanel = document.getElementById('panelSignup');

  if (!loginPanel || !signupPanel) return;

  const scrollY = window.scrollY;
  mode = mode === 'signup' ? 'signup' : 'login';

  loginPanel.hidden = mode !== 'login';
  signupPanel.hidden = mode !== 'signup';

  document.querySelectorAll('[data-auth-tab]').forEach(btn => {
    const active = btn.dataset.authTab === mode;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-selected', String(active));
  });

  const photo = AUTH_PHOTOS[mode];
  const img = document.getElementById('authPhotoImg');

  if (img) {
    img.src = photo.src;
    img.alt = photo.alt;
    const box = img.closest('.auth-page-photo');
    if (box) box.classList.remove('is-poster');
  }

  const eyebrow = document.getElementById('authPhotoEyebrow');
  const title = document.getElementById('authPhotoTitle');
  const text = document.getElementById('authPhotoText');
  const msg = document.getElementById('authMessage');

  if (eyebrow) eyebrow.textContent = photo.eyebrow;
  if (title) title.textContent = photo.title;
  if (text) text.textContent = photo.text;

  if (msg) {
    msg.textContent = '';
    msg.classList.remove('is-error');
  }

  document.title =
    (mode === 'signup' ? 'Sign Up' : 'Login') + ' | Bakerz Bite';

  requestAnimationFrame(() => {
    window.scrollTo({
      top: scrollY,
      left: 0,
      behavior: 'instant'
    });
  });
}

/* ---------- Order type popup (Delivery / Pick-up) ---------- */
const ORDER_KEY = 'bakerzOrderPref';
/* Sample data: add more cities, areas or branches here. Coordinates are approximate (used only for "Use Current Location"). */
const ORDER_DATA = {
  cities: ['Karachi'],
  areas: {
    Karachi: [
      { name: 'North Nazimabad', lat: 24.9400, lng: 67.0400 }, { name: 'Nazimabad', lat: 24.9100, lng: 67.0300 },
      { name: 'Buffer Zone', lat: 24.9650, lng: 67.0600 }, { name: 'North Karachi', lat: 24.9800, lng: 67.0700 },
      { name: 'Federal B Area', lat: 24.9300, lng: 67.0700 }, { name: 'Gulshan-e-Iqbal', lat: 24.9215, lng: 67.0920 },
      { name: 'Gulistan-e-Jauhar', lat: 24.9100, lng: 67.1300 }, { name: 'PECHS', lat: 24.8700, lng: 67.0600 },
      { name: 'Saddar', lat: 24.8600, lng: 67.0200 }, { name: 'Clifton', lat: 24.8130, lng: 67.0300 },
      { name: 'DHA', lat: 24.8000, lng: 67.0600 }, { name: 'Korangi', lat: 24.8300, lng: 67.1300 }
    ]
  },
  branches: {
    Karachi: [
      {
        name: 'Bakerz Bite North Nazimabad', address: 'North Nazimabad, Karachi, Pakistan', hours: 'Mon–Sun · 9:00 AM–10:00 PM', lat: 24.9400, lng: 67.0400,
        maps: 'https://www.google.com/maps/search/?api=1&query=North+Nazimabad+Karachi'
      }
    ]
  }
};
function getOrderPref() { try { return JSON.parse(localStorage.getItem(ORDER_KEY)); } catch (e) { return null; } }
function orderPrefLabel(p = getOrderPref()) { if (!p) return ''; return p.type === 'pickup' ? 'Pick-up · ' + p.place : 'Delivery · ' + p.place; }
function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371, r = x => x * Math.PI / 180, dLat = r(lat2 - lat1), dLng = r(lng2 - lng1);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function updateOrderChip() {
  // top bar location button removed; just clean up any leftover chip
  const chip = $('#orderChip'); if (chip) chip.remove();
}
function openOrderPopup(mandatory, onSelected) {
  if ($('#orderOverlay')) return;
  const saved = getOrderPref();
  const st = { type: saved?.type || 'delivery', city: saved?.city || ORDER_DATA.cities[0], place: saved?.place || '', hint: '' };
  const overlay = document.createElement('div'); overlay.id = 'orderOverlay'; overlay.className = 'ot-overlay';
  const modal = document.createElement('div'); modal.className = 'ot-modal'; modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true'); modal.setAttribute('aria-labelledby', 'otTitle');
  overlay.appendChild(modal); document.body.appendChild(overlay);
  const prevOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden';
  const fitPopup = () => { modal.style.zoom = ''; const avail = window.innerHeight - 20, h = modal.scrollHeight; if (h > avail && avail > 0) modal.style.zoom = (avail / h).toFixed(3); }; /* popup kabhi scroll na ho: zaroorat par poora popup chhota ho kar screen mein fit ho jata hai */ window.addEventListener('resize', fitPopup);
  const close = () => { overlay.remove(); document.body.style.overflow = prevOverflow; document.removeEventListener('keydown', onKey); window.removeEventListener('resize', fitPopup); };
  const onKey = e => { if (e.key === 'Escape' && !mandatory) close(); };
  document.addEventListener('keydown', onKey);
  if (!mandatory) overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  const listFor = () => (st.type === 'pickup' ? ORDER_DATA.branches : ORDER_DATA.areas)[st.city] || [];
  function draw(focusSel) {
    const pick = st.type === 'pickup', list = listFor();
    if (pick && !list.some(x => x.name === st.place)) st.place = list[0]?.name || '';
    if (!pick && !list.some(x => x.name === st.place)) st.place = '';
    const branch = pick ? list.find(x => x.name === st.place) : null;
    modal.innerHTML =
      '<button class="ot-close" type="button" id="otClose" aria-label="Close">×</button>' +
      '<div class="ot-head"><div class="ot-logo"><img src="' + ASSET('images/logo-bakerz-bite.png?v=4') + '" alt="Bakerz Bite"></div></div>' +
      '<div class="ot-body"><div class="ot-title" id="otTitle" role="heading" aria-level="2">Select Your Order Type</div>' +
      '<div class="ot-toggle" role="group" aria-label="Order type"><button type="button" data-type="delivery" class="' + (!pick ? 'active' : '') + '" aria-pressed="' + (!pick) + '">Delivery</button><button type="button" data-type="pickup" class="' + (pick ? 'active' : '') + '" aria-pressed="' + pick + '">Pick-Up</button></div>' +
      '<p class="ot-sub">' + (pick ? 'Which outlet would you like to pick-up from?' : 'Please select your location') + '</p>' +
      '<button class="ot-locate" id="otLocate" type="button"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>Use Current Location</button>' +
      '<p class="ot-hint" id="otHint" aria-live="polite">' + st.hint + '</p>' +
      '<div class="ot-field"><label for="otCity">Please Select City</label><select id="otCity" class="ot-select">' + ORDER_DATA.cities.map(c => '<option' + (c === st.city ? ' selected' : '') + '>' + c + '</option>').join('') + '</select></div>' +
      '<div class="ot-field"><label for="otPlace">' + (pick ? 'Select Branch' : 'Please select your location') + '</label><select id="otPlace" class="ot-select">' + (pick ? '' : '<option value="">Please select your location</option>') + list.map(x => '<option' + (x.name === st.place ? ' selected' : '') + '>' + x.name + '</option>').join('') + '</select></div>' +
      (branch ? '<div class="ot-branch"><span class="ot-pin" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.4"/></svg></span><div><strong>Branch Location</strong><p>' + branch.address + '</p><p>' + branch.hours + '</p><a href="' + branch.maps + '" target="_blank" rel="noopener">↗ Get Directions</a></div></div>' : '') +
      '</div><div class="ot-foot"><button class="ot-submit" id="otSubmit" type="button"' + (st.place ? '' : ' disabled') + '>Select</button></div>';
    modal.querySelectorAll('[data-type]').forEach(b => b.addEventListener('click', () => { st.type = b.dataset.type; st.place = ''; st.hint = ''; draw(b.dataset.type); }));
    $('#otCity', modal).addEventListener('change', e => { st.city = e.target.value; st.place = ''; st.hint = ''; draw(); });
    $('#otPlace', modal).addEventListener('change', e => { st.place = e.target.value; st.hint = ''; draw('place'); });
    $('#otClose', modal)?.addEventListener('click', close);
    $('#otLocate', modal).addEventListener('click', locate);
    $('#otSubmit', modal).addEventListener('click', () => {
      if (!st.place) return;
      localStorage.setItem(ORDER_KEY, JSON.stringify({ type: st.type, city: st.city, place: st.place, savedAt: new Date().toISOString() })); sessionStorage.setItem('bakerzOrderSession', '1');
      close(); updateOrderChip(); toast((st.type === 'pickup' ? 'Pick-up from ' : 'Delivering to ') + st.place); if (typeof onSelected === 'function') onSelected();
    });
    fitPopup();
    if (focusSel === 'place') $('#otPlace', modal).focus(); else if (focusSel) modal.querySelector('[data-type="' + focusSel + '"]')?.focus();
  }
  function locate() {
    const hint = $('#otHint', modal);
    if (!navigator.geolocation) { st.hint = 'Location is not available on this device. Please choose manually.'; hint.textContent = st.hint; return; }
    hint.textContent = 'Finding your location…';
    navigator.geolocation.getCurrentPosition(pos => {
      const list = listFor(); let best = null, bestD = Infinity;
      list.forEach(x => { const d = distanceKm(pos.coords.latitude, pos.coords.longitude, x.lat, x.lng); if (d < bestD) { bestD = d; best = x; } });
      if (!best || bestD > 30) { st.hint = 'We could not match your location to our service area. Please choose manually.'; draw(); return; }
      st.place = best.name; st.hint = 'Nearest ' + (st.type === 'pickup' ? 'branch' : 'area') + ': ' + best.name + ' (about ' + bestD.toFixed(1) + ' km away)'; draw('place');
    }, err => { st.hint = err && err.code === 1 ? 'Location permission was denied. Please choose manually.' : 'Could not get your location. Please choose manually.'; hint.textContent = st.hint; }, { timeout: 10000, maximumAge: 60000 });
  }
  modal.setAttribute('tabindex', '-1'); draw(); modal.focus({ preventScroll: true });
}
function initOrderType() { updateOrderChip(); }

function styleRoyalHeadings() {
  document.querySelectorAll('h1, h2').forEach(heading => {
    if (heading.dataset.royalStyled) return;
    const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
    const nodes = []; let node, totalWords = 0;
    while ((node = walker.nextNode())) { const words = node.nodeValue.match(/\S+/g) || []; totalWords += words.length; nodes.push(node); }
    if (totalWords < 2) return;
    const goldFrom = Math.ceil(totalWords / 2); let wordIndex = 0;
    nodes.forEach(textNode => {
      const pieces = textNode.nodeValue.split(/(\s+)/); const fragment = document.createDocumentFragment();
      pieces.forEach(piece => {
        if (!piece) return;
        if (/^\s+$/.test(piece)) { fragment.appendChild(document.createTextNode(piece)); return; }
        wordIndex++;
        if (wordIndex >= goldFrom) { const span = document.createElement('span'); span.className = 'gold-heading-text'; span.textContent = piece; fragment.appendChild(span); }
        else fragment.appendChild(document.createTextNode(piece));
      });
      textNode.parentNode.replaceChild(fragment, textNode);
    });
    heading.dataset.royalStyled = 'true';
  });
}

if (document.body) new MutationObserver(() => styleRoyalHeadings()).observe(document.body, { childList: true, subtree: true });

document.addEventListener('DOMContentLoaded', () => { styleRoyalHeadings(); updateAccountNav(); if (location.pathname.endsWith('login.html') && currentUser()) { location.replace(HOME); return; } initAuthTabs(); document.querySelectorAll('[data-auth-tab]').forEach(btn => btn.addEventListener('click', () => showAuthMode(btn.dataset.authTab))); document.querySelectorAll('[data-auth-switch]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); showAuthMode(a.dataset.authSwitch) })); showAuthMode(location.hash === '#signup' ? 'signup' : 'login'); $('#loginForm')?.addEventListener('submit', e => { e.preventDefault(); submitAuth('login') }); $('#signupForm')?.addEventListener('submit', e => { e.preventDefault(); submitAuth('signup') }); setTheme(localStorage.getItem('bakerzTheme') === 'dark'); updateCartCount(); $('#themeToggle')?.addEventListener('click', () => setTheme(!document.body.classList.contains('dark'))); $('#menuToggle')?.addEventListener('click', () => { const nav = $('#navLinks'); const toggle = $('#menuToggle'); const isOpen = nav?.classList.toggle('open') ?? false; toggle?.setAttribute('aria-expanded', String(isOpen)); }); $$('[data-cart-open]').forEach(btn => btn.addEventListener('click', e => { e.preventDefault(); openCartDrawer(); })); $$('[data-cart-close]').forEach(btn => btn.addEventListener('click', closeCartDrawer)); document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCartDrawer() }); $('#drawerCheckoutBtn')?.addEventListener('click', checkout); const requestedCategory = new URLSearchParams(location.search).get('category'); if (requestedCategory && $('#categoryFilter')) $('#categoryFilter').value = requestedCategory; const requestedSearch = new URLSearchParams(location.search).get('q'); if (requestedSearch && $('#productSearch')) $('#productSearch').value = requestedSearch; $('#categoryFilter')?.addEventListener('change', () => { renderProductCards(); syncMenuCategoryBar(); }); $('#productSearch')?.addEventListener('input', renderProductCards); $$('.menu-category-item').forEach(btn => btn.addEventListener('click', () => { const filter = $('#categoryFilter'); if (!filter) return; filter.value = btn.dataset.category; syncMenuCategoryBar(); renderProductCards(); const url = new URL(location.href); if (btn.dataset.category === 'All') url.searchParams.delete('category'); else url.searchParams.set('category', btn.dataset.category); history.replaceState({}, '', url); })); $('#checkoutBtn')?.addEventListener('click', checkout); $('#checkoutForm')?.addEventListener('submit', e => { e.preventDefault(); placeOrder(); }); /* contact & feedback forms are handled by js/emailjs-forms.js */ const ticker = $('#tickerText'); if (ticker) { const now = new Date(); const date = now.toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' }); const tickerBase = 'Bakerz Bite • Freshly baked, thoughtfully made • ' + date + ' • Location: '; const tickerEnd = 'Thank you for visiting Bakerz Bite • '; const GEO_KEY = 'bakerzGeoResult'; let savedGeo = null; try { savedGeo = localStorage.getItem(GEO_KEY); } catch (e) { } const showGeo = txt => { ticker.textContent = tickerBase + txt + tickerEnd; }; if (savedGeo) { /* permission pehle hi poocha ja chuka hai — dobara prompt nahi aayega */ showGeo(savedGeo === 'denied' ? 'Location permission not provided • ' : 'Your coordinates: ' + savedGeo + ' • '); } else if (navigator.geolocation) { showGeo(''); navigator.geolocation.getCurrentPosition(pos => { const c = pos.coords.latitude.toFixed(3) + ', ' + pos.coords.longitude.toFixed(3); try { localStorage.setItem(GEO_KEY, c); } catch (e) { } showGeo('Your coordinates: ' + c + ' • '); }, () => { try { localStorage.setItem(GEO_KEY, 'denied'); } catch (e) { } showGeo('Location permission not provided • '); }, { timeout: 5000 }); } else { showGeo('Location not available • '); } } const vc = $('#visitorCount'); if (vc) { let n = Number(sessionStorage.getItem('bakerzVisitCount') || 0) + 1; sessionStorage.setItem('bakerzVisitCount', n); vc.textContent = 'Visit ' + n } const stars = $$('.star-choice'); stars.forEach(s => s.addEventListener('click', () => { const v = Number(s.dataset.rating); $('#ratingValue').value = v; stars.forEach(x => x.textContent = Number(x.dataset.rating) <= v ? '★' : '☆') })); });
function syncMenuCategoryBar() { const value = $('#categoryFilter')?.value || 'All'; $$('.menu-category-item').forEach(btn => { const active = btn.dataset.category === value; btn.classList.toggle('active', active); if (active) btn.setAttribute('aria-current', 'true'); else btn.removeAttribute('aria-current'); }); }
document.addEventListener('DOMContentLoaded', () => { syncMenuCategoryBar(); });
document.addEventListener('DOMContentLoaded', initOrderType);
function initCategoryBar() {
  const bar = $('#catBar'); if (!bar) return;
  const prev = $('#catPrev'), next = $('#catNext');
  const update = () => { const max = bar.scrollWidth - bar.clientWidth; prev.hidden = bar.scrollLeft <= 4; next.hidden = max <= 4 || bar.scrollLeft >= max - 4; };
  bar.addEventListener('scroll', update, { passive: true }); window.addEventListener('resize', update);
  next.addEventListener('click', () => bar.scrollBy({ left: bar.clientWidth * 0.7, behavior: 'smooth' }));
  prev.addEventListener('click', () => bar.scrollBy({ left: -bar.clientWidth * 0.7, behavior: 'smooth' }));
  update();
  $('#catSearch')?.addEventListener('submit', e => { e.preventDefault(); const q = $('#catSearchInput').value.trim(); location.href = PAGE('menu.html') + (q ? '?q=' + encodeURIComponent(q) : ''); });
}
document.addEventListener('DOMContentLoaded', initCategoryBar);

document.querySelectorAll('[data-auth-tab], [data-auth-switch]')
  .forEach(element => {
    element.addEventListener('click', function (event) {
      event.preventDefault();

      const mode = this.dataset.authTab || this.dataset.authSwitch;
      showAuthMode(mode);
    });
  });
