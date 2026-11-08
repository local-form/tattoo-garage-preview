// Build your ear: spots on the line-art ear, jewelry that snaps in, typical healing, and a stack that feeds the booking form.
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.getElementById('earsvg');
  if (!svg) return;
  const $ = id => document.getElementById(id);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Spot geometry is in the ear's own 400 x 560 drawing. n = direction a hoop hangs (out over the nearest edge).
  // heal = typical range commonly quoted by piercers; shown as "typical", never as advice.
  const SPOTS = [
    { id: 'lobe', name: 'Lobe', x: 210, y: 470, n: [-.25, 1], styles: ['hoop', 'stud'], heal: '6–8 weeks', lw: 1.5, about: 'The classic first piercing.', lab: [-30, 470, 'L'] },
    { id: 'upper-lobe', name: 'Upper lobe', x: 254, y: 456, n: [.2, 1], styles: ['stud', 'hoop'], heal: '2–3 months', lw: 2.5, about: 'A second hole, set a little higher on the lobe.', lab: [430, 470, 'R'] },
    { id: 'helix', name: 'Helix', x: 366, y: 198, n: [1, .12], styles: ['hoop', 'stud'], heal: '6–12 months', lw: 9, about: 'The outer rim of the ear.', lab: [430, 240, 'R'] },
    { id: 'forward-helix', name: 'Forward helix', x: 139, y: 176, n: [-1, 0], styles: ['stud'], heal: '6–12 months', lw: 9, about: 'The front of the rim, next to the face.', lab: [0, 150, 'L'] },
    { id: 'tragus', name: 'Tragus', x: 186, y: 322, n: [1, .2], styles: ['stud', 'hoop'], heal: '6–12 months', lw: 9, about: 'The small flap in front of the ear canal.', lab: [-30, 318, 'L'] },
    { id: 'rook', name: 'Rook', x: 205, y: 193, styles: ['bar'], heal: '6–12 months', lw: 10, about: 'The inner ridge at the top of the ear.', lab: [0, 204, 'L'] },
    { id: 'daith', name: 'Daith', x: 176, y: 236, n: [.25, 1], styles: ['hoop'], heal: '6–12 months', lw: 10, about: 'The innermost fold, just above the ear canal.', lab: [0, 262, 'L'] },
    { id: 'conch', name: 'Conch', x: 238, y: 300, styles: ['stud'], heal: '6–12 months', lw: 9, about: 'The middle of the ear’s bowl.', lab: [430, 318, 'R'] },
    { id: 'industrial', name: 'Industrial', x: 186, y: 86, x2: 352, y2: 124, styles: ['bar'], heal: '9–12 months', lw: 11, about: 'One straight bar through two holes in the upper rim.', lab: [430, 104, 'R'] }
  ];
  const STYLE_NAME = { stud: 'stud', hoop: 'hoop', bar: 'barbell' };
  const METAL = {
    gold: { fill: '#D9A63A', hi: '#FBE7A6', name: 'gold' },
    silver: { fill: '#BCC3CB', hi: '#FFFFFF', name: 'silver' },
    black: { fill: '#2A2623', hi: '#8C8580', name: 'black' }
  };

  // Shared state (read by app.js for the booking form).
  const state = window.TG_EAR = { metal: 'gold', stack: new Map(), onchange: [] };
  const params = new URLSearchParams(location.search);
  const start = params.has('ear') ? params.get('ear').split(',').filter(Boolean) : ['lobe:hoop', 'upper-lobe:stud', 'helix:hoop', 'tragus:stud'];
  if (['gold', 'silver', 'black'].includes(params.get('metal'))) state.metal = params.get('metal');
  start.forEach(t => { const [id, st] = t.split(':'); const s = SPOTS.find(p => p.id === id); if (s) state.stack.set(id, s.styles.includes(st) ? st : s.styles[0]); });

  const el = (tag, attrs = {}, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  const jewels = $('jewels'), spotsG = $('spots'), labelsG = $('labels');

  // ---- drawing jewelry (ink outline + flat metal + one highlight, like flash) ----
  const ball = (g, x, y, r, m) => { el('circle', { cx: x, cy: y, r, fill: m.fill, stroke: '#17130F', 'stroke-width': 2.4 }, g); el('circle', { cx: x - r * .32, cy: y - r * .34, r: r * .3, fill: m.hi, stroke: 'none' }, g); };
  const arcPath = (cx, cy, r, a0, a1) => { const p = a => [cx + r * Math.cos(a), cy + r * Math.sin(a)]; const [x0, y0] = p(a0), [x1, y1] = p(a1); const large = Math.abs(a1 - a0) > Math.PI ? 1 : 0; return `M${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`; };
  const drawHoop = (g, s, m, r) => {
    const [nx, ny] = s.n, len = Math.hypot(nx, ny), ux = nx / len, uy = ny / len;
    const cx = s.x + ux * r, cy = s.y + uy * r, a0 = Math.atan2(-uy, -ux);
    const d = arcPath(cx, cy, r, a0, a0 + Math.PI * 1.62);
    el('path', { d, stroke: '#17130F', 'stroke-width': 9.6, fill: 'none' }, g);
    el('path', { d, stroke: m.fill, 'stroke-width': 5, fill: 'none' }, g);
    el('path', { d: arcPath(cx, cy, r - .6, a0 + Math.PI * .55, a0 + Math.PI * .95), stroke: m.hi, 'stroke-width': 1.6, fill: 'none', opacity: .9 }, g);
    el('circle', { cx: s.x, cy: s.y, r: 3.4, fill: '#17130F', stroke: 'none' }, g);
  };
  const drawStud = (g, s, m) => {
    el('circle', { cx: s.x, cy: s.y, r: 11, fill: m.fill, stroke: '#17130F', 'stroke-width': 2.8 }, g);
    el('path', { d: `M${s.x - 11} ${s.y}H${s.x + 11}M${s.x} ${s.y - 11}V${s.y + 11}`, stroke: '#17130F', 'stroke-width': .9, opacity: .35 }, g);
    el('circle', { cx: s.x - 3.6, cy: s.y - 3.8, r: 3, fill: m.hi, stroke: 'none' }, g);
  };
  const drawBar = (g, s, m) => {
    if (s.id === 'rook') {
      const d = `M${s.x + 2} ${s.y - 16} Q${s.x - 13} ${s.y} ${s.x + 2} ${s.y + 16}`;
      el('path', { d, stroke: '#17130F', 'stroke-width': 7.6 }, g); el('path', { d, stroke: m.fill, 'stroke-width': 3.6 }, g);
      ball(g, s.x + 2, s.y - 16, 6, m); ball(g, s.x + 2, s.y + 16, 6, m);
    } else {
      const d = `M${s.x} ${s.y}L${s.x2} ${s.y2}`;
      el('path', { d, stroke: '#17130F', 'stroke-width': 8 }, g); el('path', { d, stroke: m.fill, 'stroke-width': 4 }, g);
      el('path', { d: `M${s.x + 8} ${s.y + .6}L${s.x2 - 8} ${s.y2 - 1.4}`, stroke: m.hi, 'stroke-width': 1.2, opacity: .7 }, g);
      ball(g, s.x, s.y, 7, m); ball(g, s.x2, s.y2, 7, m);
    }
  };
  const drawJewel = (s, style, animate) => {
    const m = METAL[state.metal];
    const g = el('g', { class: 'jw', 'data-id': s.id }, jewels);
    if (style === 'hoop') drawHoop(g, s, m, s.id === 'daith' ? 13 : s.id === 'tragus' ? 11 : s.id === 'upper-lobe' ? 21 : s.id === 'lobe' ? 17 : 16);
    else if (style === 'bar') drawBar(g, s, m);
    else drawStud(g, s, m);
    if (animate && !reduce) {
      g.classList.add('snap');
      const burst = el('circle', { class: 'burst', cx: s.x, cy: s.y, r: 8, stroke: '#C8262D', 'stroke-width': 2.5, fill: 'none' }, jewels);
      burst.addEventListener('animationend', () => burst.remove());
    }
  };

  // ---- spots (marks) and desktop labels ----
  SPOTS.forEach((s, i) => {
    const b = el('g', { class: 'spot', 'data-id': s.id }, spotsG);
    const draw = (x, y) => { el('circle', { cx: x, cy: y, r: 8.5, class: 'mark' }, b); el('circle', { cx: x, cy: y, r: 2.2, class: 'dot' }, b); };
    draw(s.x, s.y); if (s.x2) draw(s.x2, s.y2);
    el('circle', { cx: s.x, cy: s.y, r: 22, class: 'hit' }, b); if (s.x2) el('circle', { cx: s.x2, cy: s.y2, r: 22, class: 'hit' }, b);
    b.addEventListener('click', () => toggle(s.id));
    // flash-sheet callout (desktop only, CSS hides it on phones)
    const [lx, ly, side] = s.lab, ax = s.x2 && side === 'R' ? s.x2 : s.x, ay = s.x2 && side === 'R' ? s.y2 : s.y;
    const gl = el('g', { class: 'lab', 'data-id': s.id }, labelsG);
    const ex = side === 'L' ? 64 : 390;
    el('path', { d: `M${ex} ${ly}L${ax + (side === 'L' ? -12 : 12)} ${ay}`, class: 'leader' }, gl);
    el('circle', { cx: ex, cy: ly, r: 2.4, class: 'leader-dot' }, gl);
    const t = el('text', { x: side === 'L' ? 56 : 398, y: ly + 5, 'text-anchor': side === 'L' ? 'end' : 'start' }, gl);
    t.textContent = s.name;
    gl.addEventListener('click', () => toggle(s.id));
  });

  // ---- chips under the ear (the accessible way in, and the phone labels) ----
  const bar = $('spotbar');
  SPOTS.forEach(s => {
    const c = document.createElement('button');
    c.type = 'button'; c.className = 'chip'; c.dataset.id = s.id; c.textContent = s.name;
    c.addEventListener('click', () => toggle(s.id));
    bar.appendChild(c);
  });

  function toggle(id) {
    const s = SPOTS.find(p => p.id === id);
    if (state.stack.has(id)) state.stack.delete(id); else state.stack.set(id, s.styles[0]);
    render(id);
  }
  function setStyle(id, st) { state.stack.set(id, st); render(id); }

  function render(changed) {
    jewels.textContent = '';
    for (const [id, st] of state.stack) drawJewel(SPOTS.find(p => p.id === id), st, id === changed);
    spotsG.querySelectorAll('.spot').forEach(g => g.classList.toggle('on', state.stack.has(g.dataset.id)));
    labelsG.querySelectorAll('.lab').forEach(g => g.classList.toggle('on', state.stack.has(g.dataset.id)));
    bar.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', state.stack.has(c.dataset.id)));
    document.querySelectorAll('[data-metal]').forEach(b => b.setAttribute('aria-checked', b.dataset.metal === state.metal));
    // the list
    const list = $('stacklist'); list.textContent = '';
    for (const [id, st] of state.stack) {
      const s = SPOTS.find(p => p.id === id), li = document.createElement('li');
      const styles = s.styles.length > 1 ? `<span class="seg" role="group" aria-label="${s.name} jewelry">${s.styles.map(x => `<button type="button" data-st="${x}" aria-pressed="${x === st}">${STYLE_NAME[x]}</button>`).join('')}</span>` : `<span class="seg one">${STYLE_NAME[st]}</span>`;
      li.innerHTML = `<span class="li-name">${s.name}<small>${s.about}</small></span>${styles}<span class="heal"><b>${s.heal}</b>typical heal</span><button type="button" class="x" aria-label="Remove ${s.name}">&times;</button>`;
      li.querySelectorAll('[data-st]').forEach(b => b.addEventListener('click', () => setStyle(id, b.dataset.st)));
      li.querySelector('.x').addEventListener('click', () => toggle(id));
      list.appendChild(li);
    }
    const n = state.stack.size;
    const order = ['6–8 weeks', '2–3 months', '6–12 months', '9–12 months'];
    const longest = [...state.stack.keys()].map(id => SPOTS.find(p => p.id === id).heal).sort((a, b) => order.indexOf(b) - order.indexOf(a))[0];
    $('stacksum').textContent = n ? `${n} piercing${n > 1 ? 's' : ''} · longest typical heal ${longest}` : 'Empty. Tap a spot to start.';
    if (!n) list.innerHTML = '<li class="empty">Nothing yet. Tap a red mark on the ear, or a name above.</li>';
    state.onchange.forEach(f => f());
  }
  state.summary = () => [...state.stack].map(([id, st]) => `${SPOTS.find(p => p.id === id).name} (${METAL[state.metal].name} ${STYLE_NAME[st]})`).join(' + ');
  state.longest = () => $('stacksum').textContent;

  document.querySelectorAll('[data-metal]').forEach(b => b.addEventListener('click', () => { state.metal = b.dataset.metal; render([...state.stack.keys()].pop()); }));

  // Phone vs desktop framing: desktop shows flash-sheet callouts around the ear.
  const mq = matchMedia('(min-width: 980px)');
  const frame = () => svg.setAttribute('viewBox', mq.matches ? '-78 30 588 490' : '104 32 290 482');
  mq.addEventListener ? mq.addEventListener('change', frame) : mq.addListener(frame);
  frame(); render();
})();
