// Page behaviour: reveals, style tabs, booking tabs, the stack feeding the piercing form, preview-only confirmations.
(() => {
  const $ = id => document.getElementById(id);
  const say = t => { const a = $('announce'); if (a) { a.textContent = ''; setTimeout(() => a.textContent = t, 30); } };

  // ---- scroll reveal (house standard) ----
  const els = [...document.querySelectorAll('[data-reveal]')];
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) els.forEach(e => e.classList.add('is-visible'));
  else {
    const n = new Map();
    els.forEach(e => { const p = e.parentElement, i = n.get(p) || 0; e.style.setProperty('--d', i * .08 + 's'); n.set(p, i + 1); });
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } }), { threshold: .01, rootMargin: '0px 0px -8% 0px' });
    els.forEach(e => io.observe(e));
    setTimeout(() => els.forEach(e => { if (e.getBoundingClientRect().top < innerHeight) e.classList.add('is-visible'); }), 1500);
  }

  // ---- tabs (style gallery and booking) with arrow keys ----
  function tabs(list, onShow) {
    const btns = [...list.querySelectorAll('[role=tab]')];
    const show = (b, focus) => {
      btns.forEach(x => { const on = x === b; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1; $(x.getAttribute('aria-controls')).hidden = !on; });
      if (focus) b.focus();
      onShow && onShow(b);
    };
    btns.forEach((b, i) => {
      b.addEventListener('click', () => show(b));
      b.addEventListener('keydown', e => {
        const k = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (k) { e.preventDefault(); show(btns[(i + k + btns.length) % btns.length], true); }
      });
    });
    return show;
  }
  const styleTabs = document.querySelector('.work .tabs');
  if (styleTabs) tabs(styleTabs);
  const bookList = document.querySelector('.book-tabs');
  const confirmBox = $('confirm');
  const showBook = bookList ? tabs(bookList, () => { confirmBox.hidden = true; }) : null;

  // ---- the ear stack feeds the piercing form ----
  const ear = window.TG_EAR, stackField = $('pf-stack'), heal = $('pf-heal');
  let edited = false;
  stackField && stackField.addEventListener('input', () => { edited = true; });
  const sync = () => {
    if (!ear || !stackField) return;
    if (!edited) stackField.value = ear.summary();
    heal.textContent = ear.stack.size ? ear.longest().replace(/^\d+ piercings? · /, 'Stack: ') + '.' : '';
  };
  if (ear) { ear.onchange.push(sync); sync(); }
  const send = $('sendstack');
  send && send.addEventListener('click', () => { edited = false; sync(); showBook && showBook($('bt-pierce')); });

  // ---- "Request this style" opens the tattoo request with the style chosen ----
  document.querySelectorAll('[data-request]').forEach(b => b.addEventListener('click', () => {
    $('tf-style').value = b.dataset.request;
    showBook($('bt-tattoo'));
    $('book').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    setTimeout(() => $('tf-place').focus({ preventScroll: true }), 600);
    say(b.dataset.request + ' chosen in the tattoo request.');
  }));

  // ---- dates: today or later ----
  const t = new Date(), iso = new Date(t.getTime() - t.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
  document.querySelectorAll('input[type=date]').forEach(d => d.min = iso);
  const nice = v => v ? new Date(v + 'T12:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) : '';

  // ---- preview-only submit ----
  function check(form) {
    let ok = true;
    form.querySelectorAll('[required]').forEach(f => {
      const bad = !f.value.trim() || (f.type === 'tel' && f.value.replace(/\D/g, '').length < 10);
      f.setAttribute('aria-invalid', bad); if (bad && ok) { f.focus(); ok = false; }
    });
    return ok;
  }
  function done(form, line) {
    form.hidden = true; $('confirm-line').textContent = line; confirmBox.hidden = false; confirmBox.focus();
    $('confirm-back').onclick = () => { confirmBox.hidden = true; form.hidden = false; form.querySelector('input,select,textarea').focus(); };
  }
  const pf = $('bp-pierce');
  pf && pf.addEventListener('submit', e => {
    e.preventDefault(); if (!check(pf)) return;
    const d = nice($('pf-day').value), tm = $('pf-time').value;
    const stack = $('pf-stack').value.trim() || 'A piercing consult';
    done(pf, `${stack}, ${d ? d + ', ' : ''}${tm === 'Whenever works' ? 'any time' : tm.toLowerCase()}, for ${$('pf-name').value.trim()}.`);
  });
  const tf = $('bp-tattoo');
  tf && tf.addEventListener('submit', e => {
    e.preventDefault(); if (!check(tf)) return;
    const d = nice($('tf-day').value), a = $('tf-artist').value;
    done(tf, `${$('tf-style').value} tattoo, ${$('tf-size').value.toLowerCase()}, ${$('tf-place').value.toLowerCase()}${a !== 'No preference' ? ', with ' + a : ''}${d ? ', ' + d : ''}, for ${$('tf-name').value.trim()}.`);
  });
  document.addEventListener('input', e => { if (e.target.getAttribute && e.target.getAttribute('aria-invalid') === 'true') e.target.setAttribute('aria-invalid', 'false'); });
})();

// ---- phone menu: opens, closes on link tap, Escape and outside tap; scroll lock lives on <html> ----
(() => {
  const btn = document.querySelector('.menu-btn'), nav = document.getElementById('nav');
  if (!btn || !nav) return;
  const set = open => {
    nav.classList.toggle('open', open); btn.setAttribute('aria-expanded', open);
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.documentElement.classList.toggle('nav-open', open);
  };
  btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', e => { if (e.target.closest('a')) set(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('open')) { set(false); btn.focus(); } });
  document.addEventListener('click', e => { if (nav.classList.contains('open') && !e.target.closest('.top')) set(false); });
  matchMedia('(min-width: 980px)').addEventListener('change', () => set(false));
})();
