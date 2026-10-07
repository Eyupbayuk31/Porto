(() => {
  'use strict';
  const C = window.CONFIG, S = window.SFX;
  const W = 1600, H = 1000;
  const $ = s => document.querySelector(s);
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pickOne = a => a[Math.floor(Math.random() * a.length)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touch = matchMedia('(hover: none)').matches;
  const T = ms => reduced ? 1 : ms;

  const world = $('#world'), stage = $('#stage'), bmo = $('#bmo'), cartsEl = $('#carts');
  const screenEl = $('#screen'), sc = $('#screenContent'), panel = $('#panel');
  const dlgText = $('#dlgText'), dlgHint = $('#dlgHint'), dialog = $('#dialog');

  const st = {
    mode: 'asleep',             // asleep | waking | room | panel
    projects: [], carts: [], pos: [], sel: -1, inserted: -1, busy: false, fly: null,
    view: { S: 1, ox: 0, oy: 0 }, bp: { x: 800, y: 690, s: 1 },
    mouse: { x: 800, y: 500, t: 0 }, eye: { x: 0, y: 0 }, par: { x: 0, y: 0, tx: 0, ty: 0 },
    lastInput: performance.now(), readme: {},
  };

  /* ================= DİLLER / RENKLER ================= */
  const LANG = {
    JavaScript: ['#e8c82a', 'JS'], TypeScript: ['#3a7bd5', 'TS'], Python: ['#3f7fb5', 'PY'], HTML: ['#e8553a', '<>'],
    CSS: ['#7a4fd0', '{}'], Java: ['#c9722a', 'JV'], 'C#': ['#3f9a3f', 'C#'], 'C++': ['#d04f8a', '++'], C: ['#7a8a99', 'C'],
    Go: ['#2fb5c9', 'GO'], Rust: ['#b5562a', 'RS'], PHP: ['#7a7fc9', 'PHP'], Kotlin: ['#9a5fe0', 'KT'], Swift: ['#f0723a', 'SW'],
    Dart: ['#2aa5d0', 'DT'], Shell: ['#4fa84f', '$_'], Vue: ['#41b883', 'VU'], Lua: ['#4a5fd0', 'LU'], 'Jupyter Notebook': ['#e07a2a', 'NB'],
  };
  const langColor = l => (LANG[l] || ['#ee3f55'])[0];
  const langAbbr = (l, n) => (LANG[l] || [0, n.slice(0, 2).toUpperCase()])[1];
  const colorOf = p => p.color || langColor(p.lang);

  /* ================= VERİ ================= */
  async function loadProjects() {
    let list = [];
    const ab = C.about && C.about.enabled;
    const profP = ab ? fetch(`https://api.github.com/users/${C.username}`).then(r => r.ok ? r.json() : null).catch(() => null) : null;
    try {
      const r = await fetch(`https://api.github.com/users/${C.username}/repos?per_page=100&sort=pushed`);
      if (!r.ok) throw new Error(r.status);
      const hide = new Set(C.hide.map(s => s.toLowerCase()));
      list = (await r.json()).filter(x => !x.fork && !hide.has(x.name.toLowerCase())).map(x => ({
        name: x.name, desc: x.description || '', lang: x.language || '', stars: x.stargazers_count, forks: x.forks_count,
        url: x.html_url, demo: x.homepage || '', topics: x.topics || [], updated: x.pushed_at, full: x.full_name,
      }));
      const pin = C.pin.map(s => s.toLowerCase());
      const rank = p => { const i = pin.indexOf(p.name.toLowerCase()); return i < 0 ? 99 : i; };
      list.sort((a, b) => rank(a) - rank(b) || b.stars - a.stars || new Date(b.updated) - new Date(a.updated));
    } catch (e) { /* çevrimdışı ya da limit: yedek liste */ }
    if (!list.length) list = C.fallback.map(p => ({
      stars: 0, forks: 0, topics: [], demo: '', updated: '', ...p,
      url: `https://github.com/${C.username}/${p.name}`, full: `${C.username}/${p.name}`,
    }));
    const out = list.slice(0, C.maxCarts - (ab ? 1 : 0)).map(p => ({ ...p, ...(C.overrides[p.name] || {}) }));
    if (ab) out.unshift(makeAbout(await profP, out));
    return out;
  }
  function makeAbout(pr, projs) {
    const a = C.about, u = C.username;
    return {
      about: true, name: 'Hakkımda', title: a.name || pr?.name || C.owner, lang: '', color: '#f2c14e',
      desc: a.bio || pr?.bio || `Merhaba! Ben ${C.owner}. Kod yazmayı ve bir şeyler üretmeyi seviyorum.`,
      url: pr?.html_url || `https://github.com/${u}`, full: `${u}/${u}`, profile: pr || {},
      cover: `https://github.com/${u}.png?size=40`, avatar: `https://github.com/${u}.png?size=400`,
      topics: [...new Set([...projs.map(p => p.lang).filter(Boolean), ...(a.skills || [])])], updated: '',
    };
  }

  /* ================= PİKSEL-ART KAPAK ================= */
  function hash(s) { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rnd(seed) { return () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function hue(hex) {
    const n = parseInt(hex.slice(1), 16), r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
    if (!d) return 0;
    const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return (h * 60 + 360) % 360;
  }
  function drawCover(cv, p, logo = true) {
    const x = cv.getContext('2d'), w = cv.width, h = cv.height, R = rnd(hash(p.name));
    const hu = hue(colorOf(p)), kind = hash(p.name) % 3;
    const px = (a, b, c) => { x.fillStyle = c; x.fillRect(a, b, 1, 1); };
    const disc = (cx, cy, r, c) => { for (let i = -r; i <= r; i++) for (let j = -r; j <= r; j++) if (i * i + j * j <= r * r + r * .6) px(cx + i, cy + j, c); };
    // gökyüzü bantları (dither geçişli)
    const sky = kind === 0 ? [[hu + 220, 45, 12], [hu + 230, 45, 18], [hu + 240, 40, 25], [hu + 250, 40, 32], [hu + 260, 35, 40]]
      : kind === 1 ? [[hu + 260, 50, 30], [hu + 300, 55, 45], [hu + 330, 70, 58], [hu + 20, 85, 65], [hu + 40, 90, 70]]
        : [[200, 70, 60], [198, 70, 66], [196, 70, 72], [194, 65, 78], [190, 60, 84]];
    const bh = Math.ceil(h * .7 / sky.length);
    sky.forEach(([a, s, l], i) => {
      x.fillStyle = `hsl(${a % 360} ${s}% ${l}%)`; x.fillRect(0, i * bh, w, bh);
      if (i) for (let xx = 0; xx < w; xx++) if (xx % 2) px(xx, i * bh, `hsl(${sky[i - 1][0] % 360} ${sky[i - 1][1]}% ${sky[i - 1][2]}%)`);
    });
    x.fillStyle = `hsl(${sky[4][0] % 360} ${sky[4][1]}% ${sky[4][2]}%)`; x.fillRect(0, bh * 5, w, h);
    if (kind === 0) { for (let i = 0; i < 40; i++) px(Math.floor(R() * w), Math.floor(R() * h * .5), R() < .3 ? '#fff' : '#cfd8ff'); disc(Math.floor(w * .76), 9, 5, '#f4f1d0'); disc(Math.floor(w * .76) + 2, 8, 4, `hsl(${(hu + 225) % 360} 45% 14%)`); }
    else if (kind === 1) disc(Math.floor(w * .5), Math.floor(h * .55), 9, '#ffe27a');
    else { disc(Math.floor(w * .8), 8, 5, '#fff2a8'); for (let c = 0; c < 3; c++) { const cx = Math.floor(R() * w), cy = 6 + Math.floor(R() * 12); for (let i = 0; i < 9; i++) px(cx + i, cy, '#fff'), px(cx + 2 + (i % 5), cy - 1, '#fff'); } }
    // dağlar / tepeler
    const layers = [[.55, 9, `hsl(${(hu + 200) % 360} 30% ${kind === 2 ? 52 : 22}%)`], [.7, 6, `hsl(${hu} 55% ${kind === 2 ? 40 : 18}%)`], [.86, 3, `hsl(${(hu + 20) % 360} 50% ${kind === 2 ? 28 : 10}%)`]];
    layers.forEach(([base, amp, col], li) => {
      const f1 = .1 + R() * .15, f2 = .25 + R() * .3, ph = R() * 9;
      x.fillStyle = col;
      for (let xx = 0; xx < w; xx++) {
        const y = Math.round(h * base - amp * (Math.sin(xx * f1 + ph) + .5 * Math.sin(xx * f2 + ph * 2)) - (li === 0 ? 4 : 0));
        x.fillRect(xx, y, 1, h - y);
      }
    });
    if (!logo) return;
    // logo: proje adının ilk harfi, büyük piksel harf
    const label = (p.name.match(/[A-Za-z0-9ÇĞİÖŞÜçğıöşü]/) || ['B'])[0].toUpperCase();
    x.font = '16px "Press Start 2P", monospace'; x.textAlign = 'center'; x.textBaseline = 'top';
    const tx = Math.round(w * (kind === 0 ? .32 : .5)), ty = Math.floor(h * .14);
    x.fillStyle = '#1a1020'; [[-1, 0], [1, 0], [0, -1], [0, 1], [2, 2], [3, 3], [1, 2], [2, 1]].forEach(([a, b]) => x.fillText(label, tx + a, ty + b));
    x.fillStyle = colorOf(p); x.fillText(label, tx, ty);
    x.fillStyle = 'rgba(255,255,255,.6)'; x.fillRect(tx - 6, ty + 1, 3, 2);
  }

  /* ================= KASETLER ================= */
  function makeCart(p, i) {
    const b = document.createElement('button');
    b.className = 'cart' + (p.about ? ' gold' : ''); b.type = 'button'; b.dataset.i = i;
    b.setAttribute('role', 'listitem');
    b.setAttribute('aria-label', `${p.name} kaseti${p.desc ? ': ' + p.desc : ''}`);
    b.style.setProperty('--c', colorOf(p));
    const cover = p.cover ? `<img src="${esc(p.cover)}" alt="" loading="lazy">` : '<canvas width="64" height="48"></canvas>';
    b.innerHTML = `<span class="c-shadow"></span><span class="c-pos"><span class="c-tilt"><span class="c-body">
      <span class="c-grip"></span>
      <span class="c-label">${cover}<span class="c-band"><span class="c-ic">${p.about ? '★' : esc(langAbbr(p.lang, p.name))}</span><span class="c-nm">${esc(p.name)}</span></span></span>
      <span class="c-shine"></span></span></span></span><span class="c-arrow" aria-hidden="true">▼</span>`;
    const cv = b.querySelector('canvas'); if (cv) drawCover(cv, p);
    b.addEventListener('pointerdown', e => dragStart(e, i));
    b.addEventListener('click', e => { e.stopPropagation(); if (st.justDragged) { st.justDragged = false; return; } activate(i); });
    if (!touch) {
      b.addEventListener('pointerenter', () => { if (st.mode === 'room' && !st.busy && st.sel !== i) select(i, { hover: true }); });
      const tilt = b.querySelector('.c-tilt');
      b.addEventListener('pointermove', e => {
        if (drag?.on) return;
        const r = tilt.getBoundingClientRect();
        tilt.style.setProperty('--ry', ((e.clientX - r.left) / r.width - .5) * 26 + 'deg');
        tilt.style.setProperty('--rx', -((e.clientY - r.top) / r.height - .5) * 22 + 'deg');
      });
      b.addEventListener('pointerleave', () => { tilt.style.setProperty('--rx', '0deg'); tilt.style.setProperty('--ry', '0deg'); });
    }
    return b;
  }

  /* ---- sürükle-bırak: kaseti tutup BMO'ya götür ---- */
  let drag = null;
  function dragStart(e, i) {
    if (e.button !== 0 || st.busy || st.inserted === i || st.mode === 'panel') return;
    drag = { i, id: e.pointerId, sx: e.clientX, sy: e.clientY, on: false, near: false };
  }
  function bmoNear(pt) { const c = local2stage(160, 170); return Math.hypot(pt.x - c.x, pt.y - c.y) < 200 * st.bp.s; }
  addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== drag.id) return;
    const cart = st.carts[drag.i];
    if (!drag.on) {
      if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 9) return;
      if (st.mode === 'asleep') wake(true);
      if (st.busy) { drag = null; return; }
      drag.on = true;
      try { cart.setPointerCapture(e.pointerId); } catch (_) { }
      cart.classList.add('dragging'); S.lift(); select(drag.i, { quiet: true });
      if (screenEl.dataset.mode === 'face') setMood('wow');
    }
    const pt = client2stage(e.clientX, e.clientY), s = st.pos[drag.i].s * 1.15;
    drag.pt = { x: pt.x, y: pt.y + 80 * s, s };
    Object.assign(cart.style, { left: drag.pt.x + 'px', top: drag.pt.y + 'px' });
    const near = bmoNear(pt);
    if (near !== drag.near) {
      drag.near = near; bmo.classList.toggle('want', near);
      if (near) { S.hover(); if (screenEl.dataset.mode === 'face') setMood('grin', true); }
      else if (screenEl.dataset.mode === 'face') { face.classList.remove('happy'); setMood('wow'); }
    }
  });
  function dragEnd(e) {
    if (!drag || e.pointerId !== drag.id) return;
    const d = drag; drag = null;
    if (!d.on) return;
    st.justDragged = true; setTimeout(() => { st.justDragged = false; }, 350);
    const cart = st.carts[d.i], home = st.pos[d.i];
    cart.classList.remove('dragging'); bmo.classList.remove('want'); face.classList.remove('happy');
    if (d.near && st.mode === 'room' && !st.busy) return insert(d.i, { x: d.pt.x, y: d.pt.y, s: d.pt.s, rot: 0 });
    cart.classList.add('returning');
    Object.assign(cart.style, { left: home.x + 'px', top: home.y + 'px' });
    setTimeout(() => cart.classList.remove('returning'), 420);
    S.hover(); setMood('smile');
  }
  addEventListener('pointerup', dragEnd);
  addEventListener('pointercancel', dragEnd);

  /* ================= YERLEŞİM ================= */
  const SLOTS = [[-.40, .08], [.40, .08], [-.63, .52], [.63, .52], [-.37, .88], [.37, .88], [-.88, .22], [.88, .22], [-.86, .96], [.86, .96]];
  function layout() {
    const vw = innerWidth, vh = innerHeight;
    const Sc = Math.max(vw / W, vh / H), ox = (vw - W * Sc) / 2, oy = (vh - H * Sc) / 2;
    st.view = { S: Sc, ox, oy };
    stage.style.transform = `translate(${ox}px,${oy}px) scale(${Sc})`;
    const x0 = -ox / Sc, x1 = (vw - ox) / Sc, y0 = -oy / Sc, y1 = (vh - oy) / Sc, vwD = x1 - x0;
    const dTop = (dialog.getBoundingClientRect().top - oy) / Sc;
    const hudB = y0 + 92 / Sc;
    const n = st.projects.length, pos = [];

    if (vw / vh >= 1) {
      const half = Math.min(vwD, W) / 2 - 105;
      const fTop = 600, fBot = Math.max(fTop + 160, Math.min(y1 - 30, dTop - 14));
      const by = fTop + .33 * (fBot - fTop) + 18;
      const bs = Math.min(1.05, (by - hudB) / 385);
      st.bp = { x: 800, y: by, s: bs };
      for (let i = 0; i < n; i++) {
        const [u, f] = SLOTS[i];
        const y = fTop + f * (fBot - fTop);
        pos.push({ x: 800 + u * half, y, s: (.62 + (y - 540) / 460 * .62) * Math.min(1, half / 520 + .2), rot: ((hash(st.projects[i].name) % 11) - 5) * .9 });
      }
    } else {
      const cols = n <= 4 ? 2 : n <= 6 ? 3 : 4, rows = Math.ceil(n / cols);
      const cw = (vwD - 24) / cols, cs = Math.min(.85, cw / 130 * .86), rowH = 160 * cs + 22;
      const bottom = dTop - 16;
      const firstTop = bottom - rows * rowH;
      let bs = Math.min(.9, (vwD - 30) / 360);
      const by = firstTop - 4;
      bs = Math.min(bs, (by - hudB) / 385);
      st.bp = { x: 800, y: by, s: bs };
      for (let i = 0; i < n; i++) {
        const r = Math.floor(i / cols), c = i % cols, inRow = Math.min(cols, n - r * cols);
        pos.push({ x: 800 + (c - (inRow - 1) / 2) * cw, y: firstTop + (r + 1) * rowH - 10, s: cs * (1 + r * .04), rot: ((hash(st.projects[i].name) % 7) - 3) * .8 });
      }
    }
    st.pos = pos;
    const { x, y, s } = st.bp;
    Object.assign(bmo.style, { left: x - 170 + 'px', top: y - 380 + 'px', transform: `scale(${s})`, zIndex: Math.round(y) });
    st.carts.forEach((c, i) => {
      const p = pos[i];
      Object.assign(c.style, { left: p.x + 'px', top: p.y + 'px', zIndex: Math.round(p.y) });
      c.style.setProperty('--s', p.s); c.style.setProperty('--rot', p.rot + 'deg');
    });
    if (st.fly && !st.fly.anim) placeInserted();
  }
  const local2stage = (lx, ly) => ({ x: st.bp.x + (lx + 40 - 170) * st.bp.s, y: st.bp.y + (ly - 380) * st.bp.s });
  const client2stage = (cx, cy) => ({ x: (cx - st.view.ox) / st.view.S, y: (cy - st.view.oy) / st.view.S });

  /* ================= EKRAN & YÜZ ================= */
  sc.innerHTML = `
    <div class="scr scr-off"><span class="zz">z</span><span class="zz">z</span><span class="zz">Z</span>
      <svg viewBox="0 0 164 112"><path d="M40 46 Q55 54 70 46 M94 46 Q109 54 124 46" stroke="#4d8a7c" stroke-width="5" fill="none" stroke-linecap="round"/></svg></div>
    <div class="scr scr-boot"><div class="boot-logo">BMO</div><div class="boot-bar"><i></i></div><div class="boot-txt" id="bootTxt">SİSTEM BAŞLIYOR</div></div>
    <div class="scr scr-face"><svg viewBox="0 0 164 112">
      <g id="eyes"><g class="eye-o"><ellipse cx="55" cy="44" rx="6" ry="8" fill="#1e3b3a"/><ellipse cx="109" cy="44" rx="6" ry="8" fill="#1e3b3a"/>
        <circle cx="57" cy="41" r="2" fill="#fff"/><circle cx="111" cy="41" r="2" fill="#fff"/></g>
        <g class="eye-h"><path d="M47 48 L55 39 L63 48 M101 48 L109 39 L117 48" stroke="#1e3b3a" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g></g>
      <ellipse class="blush" cx="40" cy="64" rx="9" ry="5" fill="#ff9fb0" opacity=".0"/><ellipse class="blush" cx="124" cy="64" rx="9" ry="5" fill="#ff9fb0" opacity=".0"/>
      <path id="mouth" d="M64 70 Q82 88 100 70" stroke="#1e3b3a" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
    <div class="scr scr-game" id="scrGame"></div>`;
  const mouth = $('#mouth'), eyes = $('#eyes'), face = sc.querySelector('.scr-face');
  const MOUTH = {
    smile: ['M64 70 Q82 88 100 70', 'none'], open: ['M66 68 Q82 96 98 68 Z', '#1e3b3a'], o: ['M76 74 Q82 64 88 74 Q82 86 76 74 Z', '#1e3b3a'],
    grin: ['M58 66 Q82 100 106 66 Z', '#1e3b3a'], flat: ['M68 74 L96 74', 'none'], wow: ['M74 72 Q82 60 90 72 Q82 90 74 72 Z', '#1e3b3a'],
  };
  let mood = 'smile';
  function setMouth(m) { const [d, f] = MOUTH[m] || MOUTH.smile; mouth.setAttribute('d', d); mouth.setAttribute('fill', f); }
  function setMood(m, happyEyes = false) { mood = m; setMouth(m); face.classList.toggle('happy', happyEyes); }
  function setScreen(mode) { screenEl.dataset.mode = mode; }
  function blink() { if (!face.classList.contains('happy')) { face.classList.add('blink'); setTimeout(() => face.classList.remove('blink'), 130); } }
  (function blinkLoop() { setTimeout(() => { blink(); if (Math.random() < .25) setTimeout(blink, 220); blinkLoop(); }, 2200 + Math.random() * 3000); })();

  /* ================= DİYALOG ================= */
  let typing = null;
  function say(text, opts = {}) {
    const { speed = 26, talk = true, after = 'smile' } = opts;
    if (typing) typing.finish(true);
    dialog.classList.remove('done');
    return new Promise(res => {
      let i = 0, tick = 0;
      dlgText.textContent = '';
      const iv = setInterval(() => {
        i++; tick++;
        dlgText.textContent = text.slice(0, i);
        const ch = text[i - 1] || ' ';
        if (talk && /\S/.test(ch) && tick % 2 === 0) S.voice(ch);
        if (talk && screenEl.dataset.mode === 'face') setMouth(tick % 4 < 2 ? 'open' : 'smile');
        if (i >= text.length) finish();
      }, reduced ? 1 : speed);
      function finish(cut) {
        clearInterval(iv); dlgText.textContent = text; typing = null;
        if (screenEl.dataset.mode === 'face') setMood(after, face.classList.contains('happy'));
        dialog.classList.add('done'); res(!cut);
      }
      typing = { finish };
    });
  }
  const HINTS = touch ? {
    asleep: 'BMO’ya dokun', room: 'Bir kasete dokun ya da BMO’ya sürükle · pencere: gece/gündüz',
    cart: 'Ekrana ya da yeşil tuşa dokun: içine gir · kırmızı: çıkar', panel: '',
  } : {
    asleep: 'Uyandırmak için tıkla ya da bir tuşa bas',
    room: '← ↑ ↓ → seç · ENTER tak · sürükle-bırak · N gece · M müzik',
    cart: 'A / ENTER içine gir · B çıkar · ← → başka kaset',
    panel: '',
  };
  const hint = k => { dlgHint.textContent = HINTS[k]; };
  dialog.addEventListener('click', e => { e.stopPropagation(); if (typing) typing.finish(true); else if (st.mode === 'asleep') wake(); });

  /* ================= SEÇİM ================= */
  function describe(p) {
    if (p.about) return `Altın kaset! ${C.possessive} hikâyesi bunun içinde.`;
    const l = p.lang ? `${p.lang} ile yapılmış.` : '';
    const d = p.desc ? ` ${p.desc.length > 90 ? p.desc.slice(0, 88) + '…' : p.desc}` : '';
    return `“${p.name}” — ${l}${d}`;
  }
  function select(i, { hover = false, quiet = false } = {}) {
    if (i < 0 || i >= st.carts.length) return;
    st.sel = i;
    st.carts.forEach((c, k) => c.classList.toggle('sel', k === i));
    if (!quiet) {
      hover ? S.hover() : S.move();
      if (st.inserted < 0) { say(describe(st.projects[i]) + (touch ? '' : ' Takayım mı?'), { speed: 18 }); setMood('smile'); }
    }
    if (!hover && document.activeElement !== st.carts[i] && document.activeElement?.classList?.contains('cart')) st.carts[i].focus({ preventScroll: true });
  }
  function moveSel(dir) {
    st.lastInput = performance.now(); st.mouse.t = 0;
    const n = st.carts.length; if (!n) return;
    if (st.sel < 0) return select(0);
    const c = st.pos[st.sel]; let best = -1, bd = 1e9;
    st.pos.forEach((p, i) => {
      if (i === st.sel || i === st.inserted) return;
      const dx = p.x - c.x, dy = p.y - c.y;
      const [main, cross] = dir === 'left' ? [-dx, Math.abs(dy)] : dir === 'right' ? [dx, Math.abs(dy)] : dir === 'up' ? [-dy, Math.abs(dx)] : [dy, Math.abs(dx)];
      if (main <= 8) return;
      const d = main + cross * 1.6;
      if (d < bd) { bd = d; best = i; }
    });
    if (best < 0) { // kenarda: x sırasına göre dön
      const order = st.pos.map((p, i) => i).filter(i => i !== st.inserted).sort((a, b) => st.pos[a].x - st.pos[b].x || st.pos[a].y - st.pos[b].y);
      const k = order.indexOf(st.sel), step = dir === 'left' || dir === 'up' ? -1 : 1;
      best = order[(k + step + order.length) % order.length];
    }
    if (best !== undefined && best >= 0) select(best);
  }

  /* ================= UYANMA ================= */
  async function wake(quick = false) {
    if (st.mode !== 'asleep') return;
    st.mode = 'waking'; S.init();
    document.body.classList.remove('asleep');
    setScreen('boot'); S.wake();
    $('#bootTxt').textContent = 'SİSTEM BAŞLIYOR';
    await wait(T(quick ? 500 : 1300));
    setScreen('face'); setMood('grin', true);
    bmo.classList.add('wave'); setTimeout(() => bmo.classList.remove('wave'), 1600);
    st.mode = 'room'; hint('room');
    if (quick) { setMood('smile'); return; }
    await say(`Hey! Ben BMO! ${C.possessive} projeleriyle oynuyordum.`, { after: 'grin' });
    await wait(T(900));
    if (st.mode !== 'room' || st.inserted >= 0 || typing) return;
    face.classList.remove('happy');
    await say(`Burada ${st.projects.length} kaset var. Birini seç, beraber bakalım!`);
    if (st.sel < 0 && !touch) select(0, { quiet: true });
  }

  /* ================= KASET TAKMA ================= */
  function geom(i, from) {
    const p = from || st.pos[i], slotL = local2stage(80, 184), slotR = local2stage(192, 184);
    const sw = slotR.x - slotL.x, sf = (sw * .86) / 130;
    return { s0: p.s, rot0: p.rot, dx: (slotL.x + slotR.x) / 2 - p.x, dy: slotL.y - p.y, sf, sink: 160 * sf * .86 };
  }
  const tf = (x, y, ry, rz, s) => `translate(${x}px,${y}px) perspective(900px) rotateY(${ry}deg) rotate(${rz}deg) scale(${s})`;
  function flightFrames(g) {
    const top = Math.min(0, g.dy) - 170 * g.s0 - 60;
    return [
      { transform: tf(0, 0, 0, g.rot0, g.s0), offset: 0 },
      { transform: tf(0, -60 * g.s0, 0, 0, g.s0 * 1.12), offset: .22 },
      { transform: tf(g.dx * .55, top, 200, -8, (g.s0 + g.sf) * .62), offset: .62 },
      { transform: tf(g.dx, g.dy - 26, 360, 0, g.sf), offset: .88 },
      { transform: tf(g.dx, g.dy, 360, 0, g.sf), offset: 1 },
    ];
  }
  function placeInserted() {
    const { el, i } = st.fly, g = geom(i), p = st.pos[i];
    Object.assign(el.style, { left: p.x + 'px', top: p.y + 'px', transform: tf(g.dx, g.dy + g.sink, 360, 0, g.sf) });
    el.querySelector('.c-pos').style.clipPath = 'inset(0 0 86% 0)';
  }

  async function activate(i) {
    st.lastInput = performance.now();
    if (st.mode === 'asleep') { await wake(true); }
    if (st.mode !== 'room' || st.busy) return;
    if (st.inserted === i) return enter();
    insert(i);
  }

  async function insert(i, from) {
    if (st.busy || st.mode !== 'room' || i < 0) return;
    if (st.inserted === i) return enter();
    st.busy = true;
    if (st.inserted >= 0) await eject(true);
    const p = st.projects[i], cart = st.carts[i];
    select(i, { quiet: true });
    say(pickOne(['Ooo, bu güzel!', 'Hadi bakalım!', 'Bunu seviyorum!', 'Tamamdır!']) + ` “${p.name}” takılıyor…`, { after: 'wow' });
    setMood('wow');
    const fly = cart.cloneNode(true);
    fly.classList.add('fly'); fly.classList.remove('sel'); fly.removeAttribute('role'); fly.tabIndex = -1; fly.setAttribute('aria-hidden', 'true');
    const cv0 = cart.querySelector('canvas'), cv1 = fly.querySelector('canvas'); if (cv0 && cv1) cv1.getContext('2d').drawImage(cv0, 0, 0);
    fly.style.zIndex = 4000;
    cartsEl.appendChild(fly);
    cart.classList.add('gone');
    Object.assign(cart.style, { left: st.pos[i].x + 'px', top: st.pos[i].y + 'px' });
    st.fly = { el: fly, i, anim: true };
    const g = geom(i, from), inner = fly.querySelector('.c-pos');
    S.lift(); setTimeout(() => S.whoosh(), T(250));
    await fly.animate(flightFrames(g), { duration: T(1000), easing: 'cubic-bezier(.45,.05,.35,1)', fill: 'forwards' }).finished;
    // yuvaya kayarak girme
    const down = fly.animate([{ transform: tf(g.dx, g.dy, 360, 0, g.sf) }, { transform: tf(g.dx, g.dy + g.sink, 360, 0, g.sf) }], { duration: T(320), easing: 'cubic-bezier(.6,0,.9,.6)', fill: 'forwards' });
    inner.animate([{ clipPath: 'inset(0 0 0% 0)' }, { clipPath: 'inset(0 0 86% 0)' }], { duration: T(320), easing: 'cubic-bezier(.6,0,.9,.6)', fill: 'forwards' });
    await down.finished;
    fly.getAnimations({ subtree: true }).forEach(a => a.cancel());
    st.fly.anim = false; placeInserted();
    S.clunk();
    { const sl = local2stage(136, 184); sparkle(sl.x, sl.y, colorOf(p)); }
    bmo.classList.remove('jolt'); void bmo.offsetWidth; bmo.classList.add('jolt');
    bmo.classList.add('has-cart');
    st.inserted = i;
    try { history.replaceState(null, '', '#' + encodeURIComponent(p.name)); } catch (_) { }
    // açılış ekranı
    setScreen('boot'); $('#bootTxt').textContent = p.name.toUpperCase().slice(0, 16);
    screenEl.style.setProperty('--cc', colorOf(p));
    setTimeout(() => S.boot(), T(150));
    await wait(T(1150));
    renderGame(p);
    setScreen('game');
    hint('cart');
    st.busy = false;
    await say(`“${p.name}” yüklendi!` + (p.desc ? ` ${p.desc.length > 80 ? p.desc.slice(0, 78) + '…' : p.desc}` : '') + (touch ? ' Ekrana dokun, içine girelim!' : ' A’ya bas, içine girelim!'));
  }

  function sparkle(x, y, c) {
    if (reduced) return;
    for (let k = 0; k < 22; k++) {
      const d = document.createElement('i'); d.className = 'spark';
      Object.assign(d.style, { left: x + 'px', top: y + 'px', background: k % 3 ? c : (k % 2 ? '#fff' : '#ffe36e') });
      cartsEl.appendChild(d);
      const a = Math.PI * (1.05 + Math.random() * .9), r = (60 + Math.random() * 110) * st.bp.s;
      d.animate([{ transform: 'translate(-50%,-50%) scale(1.2)', opacity: 1 },
        { transform: `translate(${Math.cos(a) * r}px,${Math.sin(a) * r}px) rotate(200deg) scale(0)`, opacity: .2 }],
        { duration: 650 + Math.random() * 450, easing: 'cubic-bezier(.1,.8,.3,1)' }).onfinish = () => d.remove();
    }
  }

  function renderGame(p) {
    const box = $('#scrGame');
    box.innerHTML = '';
    const cv = document.createElement('canvas'); cv.width = 64; cv.height = 48; cv.className = 'g-bg';
    if (p.cover) { const im = new Image(); im.src = p.cover; im.className = 'g-bg'; box.append(im); } else { drawCover(cv, p, false); box.append(cv); }
    const t = document.createElement('div'); t.className = 'g-title'; t.textContent = (p.title || p.name).toUpperCase(); t.style.fontSize = ((p.title || p.name).length > 13 ? 6 : p.name.length > 9 ? 7.5 : 10) + 'px';
    const s = document.createElement('div'); s.className = 'g-start'; s.textContent = touch ? 'DOKUN' : '▶ BAS A';
    const l = document.createElement('div'); l.className = 'g-lang'; l.textContent = (p.about ? '★ HAKKIMDA ★' : (p.lang || 'PROJE') + (p.stars ? '  ★' + p.stars : ''));
    box.append(t, l, s);
  }

  async function eject(silent = false) {
    if (st.inserted < 0 || !st.fly) return;
    const own = !st.busy; if (own) st.busy = true;
    const i = st.inserted, { el } = st.fly, inner = el.querySelector('.c-pos'), g = geom(i);
    st.fly.anim = true;
    S.eject();
    setScreen('face'); setMood('o');
    if (!silent) say(pickOne(['Kaset çıktı! Başka hangisine bakalım?', 'Tamam, sıradaki!', 'Pıt! Çıktı. Başka bir tane seç!']));
    bmo.classList.remove('has-cart');
    const up = el.animate([{ transform: tf(g.dx, g.dy + g.sink, 360, 0, g.sf) }, { transform: tf(g.dx, g.dy - 30, 360, 0, g.sf) }], { duration: T(260), easing: 'cubic-bezier(.2,.8,.3,1)', fill: 'forwards' });
    inner.animate([{ clipPath: 'inset(0 0 86% 0)' }, { clipPath: 'inset(0 0 0% 0)' }], { duration: T(200), fill: 'forwards' });
    await up.finished;
    const back = flightFrames(g).reverse().map(k => ({ ...k, offset: 1 - k.offset }));
    back[0].transform = tf(g.dx, g.dy - 30, 360, 0, g.sf);
    await el.animate(back, { duration: T(800), easing: 'cubic-bezier(.45,.05,.35,1)', fill: 'forwards' }).finished;
    el.remove(); st.fly = null; st.inserted = -1;
    try { history.replaceState(null, '', location.pathname + location.search); } catch (_) { }
    st.carts[i].classList.remove('gone');
    S.hover();
    hint('room'); setMood('smile');
    if (own) st.busy = false;
  }

  /* ================= EKRANA ZOOM / PANEL ================= */
  function relDate(iso) {
    if (!iso) return '—';
    const d = (Date.now() - new Date(iso)) / 864e5;
    if (d < 1) return 'bugün'; if (d < 2) return 'dün'; if (d < 30) return Math.floor(d) + ' gün önce';
    if (d < 365) return Math.floor(d / 30) + ' ay önce'; return Math.floor(d / 365) + ' yıl önce';
  }
  function fillPanel(p) {
    $('#pCart').textContent = 'KASET: ' + p.name.toUpperCase();
    $('#pTitle').textContent = p.title || p.name;
    $('#pDesc').textContent = p.desc || 'Bu kasetin henüz bir açıklaması yok. Ama BMO yine de çok sevdi!';
    $('#pReadmeH').textContent = p.about ? 'HAKKIMDA.md' : 'README.md';
    $('#pRepo').innerHTML = p.about ? '<b>A</b> GitHub profilim' : '<b>A</b> GitHub\'da aç';
    $('#pShare').innerHTML = '<b>⇪</b> Linki kopyala';
    $('#pLinks').innerHTML = (p.about ? (C.about.links || []) : []).map(l => `<a class="act act-l" href="${esc(l.url)}" target="_blank" rel="noopener"><b>↗</b> ${esc(l.label)}</a>`).join('');
    document.querySelector('.p-cover').classList.toggle('avatar', !!p.about);
    // Sıfır olan GitHub sayıları gösterilmez; config'teki gerçek ek istatistikler (ör. kullanıcı sayısı) eklenir.
    const score = 3 + hash(p.name) % 3;
    let stats = [['Dil', p.lang ? `<i class="dot" style="background:${langColor(p.lang)}"></i>${esc(p.lang)}` : '—'], ['Son güncelleme', relDate(p.updated)]];
    if (p.about) {
      const pr = p.profile; stats = [];
      if (pr.location) stats.push(['Konum', '⌂ ' + esc(pr.location)]);
      stats.push(['Açık proje', '▣ ' + (pr.public_repos ?? st.projects.length - 1)]);
      if (pr.followers) stats.push(['Takipçi', '♥ ' + pr.followers]);
      if (pr.created_at) stats.push(['GitHub’da', new Date(pr.created_at).getFullYear() + '’den beri']);
      if (stats.length % 2) stats.push(['Favori konsol', 'BMO ♥']);
    }
    if (p.stars) stats.push(['Yıldız', '★ ' + p.stars]);
    if (p.forks) stats.push(['Fork', '⑂ ' + p.forks]);
    (p.stats || []).forEach(([k, v]) => stats.push([esc(k), esc(v)]));
    if (stats.length % 2 && !p.about) stats.push(['BMO puanı', '<span class="bmo-score">' + '★'.repeat(score) + '☆'.repeat(5 - score) + '</span>']);
    $('#pStats').innerHTML = stats.map(([k, v]) => `<li><span>${k}</span><b>${v}</b></li>`).join('');
    $('#pTopics').innerHTML = (p.topics || []).map(t => `<span>${p.about ? '' : '#'}${esc(t)}</span>`).join('');
    const repo = $('#pRepo'); repo.href = p.url;
    const demo = $('#pDemo');
    if (p.demo) { demo.href = /^https?:/.test(p.demo) ? p.demo : 'https://' + p.demo; demo.hidden = false; } else demo.hidden = true;
    const img = $('#pImg'), cv = $('#pCanvas');
    drawCover(cv, p); cv.hidden = false; img.hidden = true;
    img.onload = () => { img.hidden = false; cv.hidden = true; };
    img.onerror = () => { img.hidden = true; cv.hidden = false; };
    img.src = p.about ? p.avatar : (p.cover || `https://opengraph.githubassets.com/bmo/${p.full}`);
    loadReadme(p);
  }
  async function loadReadme(p) {
    const pre = $('#pReadme');
    if (p.about && C.about.text) { pre.textContent = C.about.text; return; }
    if (st.readme[p.full] != null) { pre.textContent = st.readme[p.full]; return; }
    pre.textContent = 'Yükleniyor…';
    const langs = p.about ? p.topics.slice(0, 4).join(', ') : '';
    let txt = p.about
      ? `Merhaba! Ben ${C.owner}.\n\nBu ağaç evine ${st.projects.length - 1} projemi kaset olarak koydum${langs ? `; en çok ${langs} ile çalışıyorum` : ''}.\n\nBir kaset seç, BMO'ya tak ve içine gir. İyi eğlenceler!`
      : 'README bulunamadı.';
    try {
      const r = await fetch(`https://api.github.com/repos/${p.full}/readme`, { headers: { Accept: 'application/vnd.github.raw+json' } });
      if (r.ok) {
        txt = (await r.text())
          .replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, '').replace(/!\[[^\]]*\]\([^)]*\)/g, '')
          .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/^#{1,6}\s*/gm, '▸ ').replace(/[*_`]{1,3}/g, '')
          .replace(/\n{3,}/g, '\n\n').trim();
        if (txt.length > 2400) txt = txt.slice(0, 2400) + '\n…';
        if (!txt) txt = 'README boş.';
      }
    } catch (e) { if (!p.about) txt = 'README yüklenemedi (bağlantı yok).'; }
    st.readme[p.full] = txt;
    if ($('#pTitle').textContent === (p.title || p.name)) pre.textContent = txt;
  }

  // Ekrana "dalma": sahne hafifçe büyürken BMO'nun ekranı tüm görüntüyü kaplayacak şekilde genişler.
  let zoomAnim = null, portal = null, portalFrom = '';
  const PORTAL_EASE = 'cubic-bezier(.7,0,.2,1)';
  async function enter() {
    if (st.inserted < 0 || st.busy || st.mode !== 'room') return;
    st.busy = true; st.lastInput = performance.now();
    const p = st.projects[st.inserted];
    fillPanel(p);
    say('İçeri giriyoruz! Wiiiii!', { after: 'grin' });
    setMood('grin', true);
    S.zoomIn();
    const r = screenEl.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    world.style.transformOrigin = `${cx}px ${cy}px`;
    zoomAnim = world.animate([{ transform: 'none', filter: 'brightness(1)' }, { transform: `translate(${innerWidth / 2 - cx}px,${innerHeight / 2 - cy}px) scale(1.9)`, filter: 'brightness(.7)' }],
      { duration: T(800), easing: PORTAL_EASE, fill: 'forwards' });
    portal = document.createElement('div'); portal.className = 'portal';
    portal.innerHTML = `<div class="portal-title">${esc(p.name.toUpperCase())}</div>`;
    document.body.appendChild(portal);
    portalFrom = `translate(${r.left}px,${r.top}px) scale(${r.width / innerWidth},${r.height / innerHeight})`;
    await portal.animate([{ transform: portalFrom, borderRadius: '40px' }, { transform: 'none', borderRadius: '0px' }], { duration: T(800), easing: PORTAL_EASE, fill: 'forwards' }).finished;
    panel.classList.add('open'); panel.setAttribute('aria-hidden', 'false'); document.body.classList.add('in-panel');
    await wait(T(300));
    world.classList.add('hidden'); portal.style.visibility = 'hidden';
    st.mode = 'panel'; st.busy = false;
    $('#pRepo').focus({ preventScroll: true });
  }
  async function exitPanel() {
    if (st.mode !== 'panel' || st.busy) return;
    st.busy = true;
    S.zoomOut();
    world.classList.remove('hidden'); portal.style.visibility = '';
    panel.classList.remove('open'); panel.setAttribute('aria-hidden', 'true'); document.body.classList.remove('in-panel');
    await wait(T(250));
    zoomAnim.reverse();
    await portal.animate([{ transform: 'none', borderRadius: '0px', opacity: 1 }, { transform: portalFrom, borderRadius: '40px', opacity: 1 }], { duration: T(700), easing: PORTAL_EASE, fill: 'forwards' }).finished;
    await zoomAnim.finished;
    portal.remove(); portal = null;
    zoomAnim.cancel(); zoomAnim = null;
    face.classList.remove('happy');
    st.mode = 'room'; st.busy = false;
    say(pickOne(['Geri döndük! Eğlenceliydi.', 'Of, çok güzeldi!', 'Başka bir kaset deneyelim mi?']));
    st.carts[st.sel]?.focus({ preventScroll: true });
  }

  /* ================= GECE / GÜNDÜZ ================= */
  function setNight(v, talk) {
    st.night = v; document.body.classList.toggle('night', v);
    if (talk) {
      S.chime(v);
      say(v ? pickOne(['Gece oldu… Ateş böceklerine bak!', 'Yıldızlar çıktı! Ampuller de parlıyor.']) : pickOne(['Günaydın! Güneş doğdu.', 'Gündüz oldu, hadi çalışalım!']), { after: 'grin' });
    }
  }

  /* ================= ODA EŞYALARI ================= */
  const HOT = {
    shelf: ['Bu kitapların hepsini okudum. Tamam, sadece resimlerine baktım.', `${C.possessive} kitaplığı! Kodlama kitapları en üst rafta.`, 'Kitapları karıştırma, sonra yerini bulamıyorum!'],
    sword: ['Bu kılıç çok tehlikeli! …Şaka, tahtadan.', 'Kılıç sallamak yerine kod yazmayı tercih ederim.'],
    picture: ['Bu tabloyu ben çizdim! …Pekala, ben çizmedim.', 'Ne güzel bir manzara. Bir gün oraya gidelim.'],
    plant: ['Bitkiye su verdim! Büyü küçük bitki, büyü!', 'Bu bitkinin adı Bitki. Yaratıcı, değil mi?'],
    pouf: ['Burası benim şekerleme köşem. Zzz…', 'Yumuşacık! Ama kasetler daha eğlenceli.'],
  };
  $('#bg').addEventListener('click', e => {
    const h = e.target.closest('.hot'); if (!h) return;
    e.stopPropagation(); st.lastInput = performance.now();
    if (st.mode === 'asleep') return wake();
    if (st.mode !== 'room') return;
    h.classList.remove('poke'); void h.getBoundingClientRect(); h.classList.add('poke');
    setTimeout(() => h.classList.remove('poke'), 700);
    const k = h.dataset.hot;
    if (k === 'window') return setNight(!st.night, true);
    S.boing();
    if (!st.busy) say(pickOne(HOT[k]), { after: 'grin' });
  });

  $('#pShare').addEventListener('click', async () => {
    const p = st.projects[st.inserted]; if (!p) return;
    const url = location.origin + location.pathname + '#' + encodeURIComponent(p.name);
    try { await navigator.clipboard.writeText(url); $('#pShare').innerHTML = '<b>✓</b> Kopyalandı!'; }
    catch (_) { prompt('Linki kopyala:', url); }
  });

  /* ================= GİRDİLER ================= */
  function press(act) {
    const el = bmo.querySelector(`.ctl[data-act="${act}"]`);
    if (el) { el.classList.add('press'); setTimeout(() => el.classList.remove('press'), 140); }
  }
  bmo.addEventListener('click', e => {
    e.stopPropagation(); st.lastInput = performance.now();
    if (st.mode === 'asleep') return wake();
    if (st.mode !== 'room') return;
    const dp = e.target.closest('.dp');
    if (dp) { press('dpad'); return moveSel(dp.dataset.dir); }
    const ctl = e.target.closest('.ctl');
    if (ctl?.dataset.act === 'a') { press('a'); return st.inserted >= 0 ? enter() : insert(st.sel < 0 ? 0 : st.sel); }
    if (ctl?.dataset.act === 'b') { press('b'); return eject(); }
    if (e.target.closest('.screen') && st.inserted >= 0) return enter();
    if (!st.busy && !typing) {
      setMood('grin', true); bmo.classList.add('wave'); setTimeout(() => { bmo.classList.remove('wave'); face.classList.remove('happy'); setMood('smile'); }, 1500);
      say(pickOne(['Hihi, gıdıklanıyorum!', 'Selam! Bir kaset seçmeyi unutma.', 'BMO seni seviyor!', 'Bip bop! Ben bir video oyun konsoluyum!']), { after: 'grin' });
    }
  });
  document.addEventListener('click', () => { if (st.mode === 'asleep') wake(); });

  addEventListener('keydown', e => {
    st.lastInput = performance.now();
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (k === 'm') { toggleMusic(); return; }
    if (k === 'n' && st.mode !== 'panel') { if (st.mode === 'asleep') wake(true); setNight(!st.night, true); return; }
    if (st.mode === 'asleep') { e.preventDefault(); wake(); return; }
    if (st.mode === 'panel') {
      if (k === 'Escape' || k === 'Backspace') { e.preventDefault(); exitPanel(); }
      else if (k === 'b') { e.preventDefault(); exitPanel().then(() => eject()); }
      else if (k === 'a' || (k === 'Enter' && document.activeElement === document.body)) { e.preventDefault(); $('#pRepo').click(); }
      else if (k === 'd' && !$('#pDemo').hidden) $('#pDemo').click();
      return;
    }
    if (st.mode !== 'room') return;
    const dirs = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' };
    if (dirs[k]) { e.preventDefault(); press('dpad'); moveSel(dirs[k]); return; }
    if (k === 'Enter' || k === ' ') { e.preventDefault(); if (typing) typing.finish(true); press('a'); if (st.sel === st.inserted && st.inserted >= 0) enter(); else insert(st.sel < 0 ? 0 : st.sel); return; }
    if (k === 'a') { press('a'); if (st.inserted >= 0) enter(); else insert(st.sel < 0 ? 0 : st.sel); return; }
    if (k === 'b' || k === 'Backspace' || k === 'Escape') { e.preventDefault(); press('b'); eject(); }
  });

  $('#pEject').addEventListener('click', () => exitPanel().then(() => eject()));
  $('#pBack').addEventListener('click', exitPanel);
  panel.addEventListener('click', e => e.stopPropagation());

  const soundBtn = $('#soundBtn'), musicBtn = $('#musicBtn');
  soundBtn.addEventListener('click', e => { e.stopPropagation(); S.init(); S.setSfx(!S.sfxOn); soundBtn.classList.toggle('off', !S.sfxOn); soundBtn.setAttribute('aria-pressed', S.sfxOn); soundBtn.textContent = S.sfxOn ? '🔊' : '🔇'; });
  function toggleMusic() { const on = S.toggleMusic(); musicBtn.classList.toggle('off', !on); musicBtn.setAttribute('aria-pressed', on); }
  musicBtn.addEventListener('click', e => { e.stopPropagation(); if (st.mode === 'asleep') wake(); toggleMusic(); });

  addEventListener('pointermove', e => {
    const s = client2stage(e.clientX, e.clientY);
    st.mouse = { x: s.x, y: s.y, t: performance.now() };
    st.par.tx = e.clientX / innerWidth - .5; st.par.ty = e.clientY / innerHeight - .5;
  });

  /* ================= ANİMASYON DÖNGÜSÜ ================= */
  const far = () => document.getElementById('far'), front = () => document.getElementById('front'), lights = () => document.getElementById('lights');
  const IDLE = ['Kaseti tutup bana sürükleyebilirsin, biliyor muydun?', 'Pencereye tıkla, gece olsun!', 'Odadaki eşyalara tıklamayı dene!', 'Altın kaseti gördün mü? Çok özel o!', 'Psst… kasetlerin üstüne gelince eğiliyorlar, fark ettin mi?', 'Sıkıldım… Hadi bir kaset tak!', 'M tuşuna basarsan müzik çalarım!',
    'Ok tuşlarıyla kasetler arasında gezebilirsin.', 'Biliyor musun? Ben de bir oyun konsoluyum!', 'Bip bop. Kasetler beni bekliyor…'];
  function loop(now) {
    // göz takibi
    const eyeC = local2stage(160, 112);
    let tx = 0, ty = 0;
    if (st.mode === 'room' || st.mode === 'waking') {
      let target = null;
      if (now - st.mouse.t < 2500) target = st.mouse;
      else if (st.sel >= 0 && st.inserted !== st.sel) { const p = st.pos[st.sel]; target = { x: p.x, y: p.y - 70 * p.s }; }
      if (st.fly?.anim) { const r = st.fly.el.querySelector('.c-pos').getBoundingClientRect(); target = client2stage(r.left + r.width / 2, r.top + r.height / 2); }
      if (target) {
        const dx = target.x - eyeC.x, dy = target.y - eyeC.y, d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 260);
        tx = dx / d * 9 * k; ty = dy / d * 6 * k;
      }
    }
    st.eye.x += (tx - st.eye.x) * .15; st.eye.y += (ty - st.eye.y) * .15;
    eyes.setAttribute('transform', `translate(${st.eye.x.toFixed(2)} ${st.eye.y.toFixed(2)})`);
    // paralaks
    if (!reduced) {
      const p = st.par; p.x += (p.tx - p.x) * .06; p.y += (p.ty - p.y) * .06;
      far()?.setAttribute('transform', `translate(${(-p.x * 16).toFixed(2)} ${(-p.y * 8).toFixed(2)})`);
      front()?.setAttribute('transform', `translate(${(-p.x * 40).toFixed(2)} ${(-p.y * 14).toFixed(2)})`);
      lights()?.setAttribute('transform', `translate(${(-p.x * 28).toFixed(2)} ${(-p.y * 10).toFixed(2)})`);
    }
    // boşta konuşma
    if (st.mode === 'room' && !st.busy && !typing && now - st.lastInput > 24000) {
      st.lastInput = now;
      if (st.inserted < 0) say(pickOne(IDLE));
    }
    requestAnimationFrame(loop);
  }

  /* ================= BAŞLAT ================= */
  async function init() {
    $('#title').textContent = C.title;
    $('#subtitle').innerHTML = `GitHub portfolyosu · <a href="https://github.com/${esc(C.username)}" target="_blank" rel="noopener">@${esc(C.username)}</a>`;
    Room.build();
    { const h = new Date().getHours(); setNight(h >= 19 || h < 7, false); }
    setScreen('off');
    hint('asleep');
    say('Zzz… BMO uyuyor. (Uyandırmak için tıkla ya da bir tuşa bas)', { talk: false, speed: 30 });
    layout();
    addEventListener('resize', layout);
    requestAnimationFrame(loop);
    st.projects = await loadProjects();
    try { await document.fonts.load('8px "Press Start 2P"'); } catch (e) { }
    st.carts = st.projects.map((p, i) => makeCart(p, i));
    st.carts.forEach((c, i) => { c.style.transitionDelay = (i * 90) + 'ms'; cartsEl.appendChild(c); });
    setTimeout(() => st.carts.forEach(c => { c.style.transitionDelay = ''; }), 2000);
    layout();
    document.body.classList.add('loaded');
    // paylaşılan link: #proje-adi → o kaseti takılı aç
    const want = decodeURIComponent(location.hash.slice(1)).toLowerCase();
    const wi = want ? st.projects.findIndex(p => p.name.toLowerCase() === want) : -1;
    if (wi >= 0) {
      await wait(T(900));
      await wake(true);
      say('Bu kaseti senin için hazırladım!', { after: 'grin' });
      await wait(T(700));
      insert(wi);
    }
  }
  init();
})();
