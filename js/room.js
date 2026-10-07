/* Ağaç evi sahnesi + BMO gövdesi — tamamen kodla çizilmiş SVG. */
window.Room = (() => {
  const O = '#3a2213';           // çizgi rengi
  const HZ = 540;                // duvar / zemin çizgisi
  const VP = { x: 800, y: -400 };// zemin tahtaları için kaçış noktası

  function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const R = rng(7);
  const pick = a => a[Math.floor(R() * a.length)];
  const r1 = n => Math.round(n * 10) / 10;

  /* ---------- ARKA DUVAR ---------- */
  function wall() {
    let s = '';
    const tones = ['#c88d55', '#bf844c', '#cf965e', '#c58a51', '#c4874e'];
    let x = -60;
    while (x < 1660) {
      const w = 78 + R() * 50;
      s += `<rect x="${r1(x)}" y="-20" width="${r1(w + 2)}" height="${HZ + 40}" fill="${pick(tones)}"/>`;
      // damarlar
      for (let k = 0; k < 2; k++) {
        const gx = x + 14 + R() * (w - 28);
        let d = `M${r1(gx)} -10`;
        for (let y = 40; y <= HZ; y += 60) d += ` Q${r1(gx + (R() - .5) * 18)} ${y - 30} ${r1(gx + (R() - .5) * 8)} ${y}`;
        s += `<path d="${d}" fill="none" stroke="#8a5530" stroke-opacity=".35" stroke-width="2"/>`;
      }
      if (R() < .35) {
        const kx = x + 20 + R() * (w - 40), ky = 120 + R() * 360;
        s += `<ellipse cx="${r1(kx)}" cy="${r1(ky)}" rx="7" ry="11" fill="#9b6237" stroke="${O}" stroke-width="2.5"/><ellipse cx="${r1(kx)}" cy="${r1(ky)}" rx="2.5" ry="4.5" fill="${O}"/>`;
      }
      s += `<line x1="${r1(x)}" y1="-20" x2="${r1(x)}" y2="${HZ + 20}" stroke="${O}" stroke-width="4"/>`;
      x += w;
    }
    // duvar gölgesi (yukarısı daha koyu)
    s += `<rect x="-60" y="-20" width="1720" height="${HZ + 40}" fill="url(#wallShade)"/>`;
    return s;
  }

  function ceilingBranch() {
    // sol üstten çapraz uzanan kalın dal (videodaki gibi)
    let s = `<path d="M-80 470 C40 360 150 250 230 120 C270 55 300 10 320 -40 L430 -40 C400 30 360 90 320 160 C250 280 120 420 -80 590 Z" fill="#a76a3c" stroke="${O}" stroke-width="6" stroke-linejoin="round"/>`;
    for (let i = 0; i < 6; i++) {
      const o = 20 + i * 16;
      s += `<path d="M${-60 + o * .4} ${500 - o * .2} C${60 + o} ${380 - o * .3} ${170 + o * .8} ${250 - o * .5} ${260 + o * .6} ${90 - o * .4}" fill="none" stroke="#7a4626" stroke-width="${i % 2 ? 2 : 3}" stroke-linecap="round" stroke-dasharray="${40 + i * 7} ${18 + i * 3}"/>`;
    }
    // tavan kirişi
    s += `<path d="M-40 -20 H1640 V58 C1400 70 1200 52 1000 64 C760 78 500 56 300 70 C150 80 40 62 -40 72 Z" fill="#6e3f22" stroke="${O}" stroke-width="6"/>`;
    s += `<path d="M-20 30 C300 40 600 24 900 36 C1200 46 1450 28 1640 38" fill="none" stroke="#54301a" stroke-width="3" stroke-dasharray="60 30"/>`;
    return s;
  }

  function windowEl() {
    const cx = 330, cy = 250, r = 92;
    return `
    <g id="window" class="hot" data-hot="window">
      <circle cx="${cx + 6}" cy="${cy + 8}" r="${r + 6}" fill="#000" opacity=".18"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="#8a5530" stroke="${O}" stroke-width="6"/>
      <g clip-path="url(#winClip)">
        <rect x="${cx - r}" y="${cy - r}" width="${2 * r}" height="${2 * r}" fill="url(#sky)"/>
        <g class="cloud"><ellipse cx="${cx - 30}" cy="${cy - 40}" rx="30" ry="11" fill="#fff"/><ellipse cx="${cx - 12}" cy="${cy - 48}" rx="18" ry="12" fill="#fff"/></g>
        <g class="night-only"><rect x="${cx - r}" y="${cy - r}" width="${2 * r}" height="${2 * r}" fill="url(#nightSky)"/>
          ${Array.from({ length: 22 }, () => `<circle class="star" cx="${r1(cx - 80 + R() * 160)}" cy="${r1(cy - 80 + R() * 110)}" r="${r1(.8 + R() * 1.4)}" fill="#fff" style="--d:${(R() * 3).toFixed(2)}s"/>`).join('')}
          <circle cx="${cx + 36}" cy="${cy - 36}" r="17" fill="#fff6c8"/><circle cx="${cx + 44}" cy="${cy - 42}" r="15" fill="#22305e"/></g>
        <path d="M${cx - 90} ${cy + 40} Q${cx - 30} ${cy + 5} ${cx + 30} ${cy + 30} T${cx + 100} ${cy + 20} V${cy + 100} H${cx - 100} Z" fill="#8fd17a" stroke="${O}" stroke-width="3"/>
        <circle cx="${cx - 55}" cy="${cy + 52}" r="26" fill="#5aa04f" stroke="${O}" stroke-width="3"/>
        <circle cx="${cx - 25}" cy="${cy + 64}" r="22" fill="#6db85a" stroke="${O}" stroke-width="3"/>
        <circle cx="${cx + 48}" cy="${cy + 58}" r="28" fill="#4f9a45" stroke="${O}" stroke-width="3"/>
        <circle cx="${cx + 18}" cy="${cy + 72}" r="20" fill="#78bf5e" stroke="${O}" stroke-width="3"/>
        <g class="night-only">${Array.from({ length: 7 }, () => `<circle class="firefly" cx="${r1(cx - 60 + R() * 120)}" cy="${r1(cy + 20 + R() * 50)}" r="2.2" fill="#eaff7a" style="--d:${(R() * 4).toFixed(2)}s"/>`).join('')}</g>
        <rect x="${cx - 6}" y="${cy - r}" width="12" height="${2 * r}" fill="#8a5530" stroke="${O}" stroke-width="4"/>
        <rect x="${cx - r}" y="${cy - 6}" width="${2 * r}" height="12" fill="#8a5530" stroke="${O}" stroke-width="4"/>
        <path d="M${cx - 50} ${cy - 60} L${cx - 20} ${cy - 30}" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity=".55"/>
      </g>
      <circle cx="${cx}" cy="${cy}" r="${r - 18}" fill="none" stroke="${O}" stroke-width="5"/>
    </g>`;
  }

  function bookshelf() {
    const x0 = 600, x1 = 1000, y0 = 72, rows = [138, 204, 270];
    let s = `<g id="shelf" class="hot" data-hot="shelf"><rect x="${x0 + 8}" y="${y0 + 10}" width="${x1 - x0}" height="${rows[2] - y0 + 14}" fill="#000" opacity=".18"/>`;
    s += `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${rows[2] - y0 + 12}" fill="#7d4a28" stroke="${O}" stroke-width="6" rx="4"/>`;
    s += `<rect x="${x0 + 14}" y="${y0 + 12}" width="${x1 - x0 - 28}" height="${rows[2] - y0 - 10}" fill="#4f2e1a"/>`;
    const cols = ['#d9534f', '#5b8def', '#f2c14e', '#7bc47f', '#9b6fd1', '#e8884a', '#4fb3bf', '#e05d8e', '#efe2c0', '#3f6f9e'];
    rows.forEach((by, ri) => {
      let x = x0 + 18;
      while (x < x1 - 40) {
        if (R() < .08) { x += 24 + R() * 30; continue; } // boşluk
        const w = 13 + R() * 14, h = 40 + R() * 20, c = pick(cols);
        const lean = (R() < .1) ? 8 : 0;
        s += `<g transform="rotate(${lean} ${r1(x + w)} ${by})"><rect x="${r1(x)}" y="${r1(by - h)}" width="${r1(w)}" height="${r1(h)}" fill="${c}" stroke="${O}" stroke-width="3" rx="1.5"/>`;
        s += `<rect x="${r1(x + 2)}" y="${r1(by - h + 8)}" width="${r1(w - 4)}" height="4" fill="#000" opacity=".22"/></g>`;
        x += w + (lean ? 6 : 1);
      }
      s += `<rect x="${x0 + 6}" y="${by}" width="${x1 - x0 - 12}" height="10" fill="#9a6036" stroke="${O}" stroke-width="4"/>`;
    });
    // raf üstü süsler: saksı + kupa
    s += `<path d="M640 72 L648 46 H676 L684 72 Z" fill="#c4623a" stroke="${O}" stroke-width="4"/>
      <path d="M662 46 C640 20 630 10 618 14 M662 46 C664 18 672 4 684 0 M662 46 C680 28 700 26 708 32" fill="none" stroke="#4f9a45" stroke-width="7" stroke-linecap="round"/>
      <path d="M940 72 V64 H956 V54 C940 52 936 30 940 24 H976 C980 30 976 52 960 54 V64 H976 V72 Z" fill="#f2c14e" stroke="${O}" stroke-width="4"/></g>`;
    return s;
  }

  function wallDecor() {
    // çerçeveli resim
    const fx = 1150, fy = 120;
    let s = `<g id="picture" class="hot" data-hot="picture"><rect x="${fx + 6}" y="${fy + 8}" width="160" height="122" fill="#000" opacity=".18"/>
      <rect x="${fx}" y="${fy}" width="160" height="122" fill="#8a5530" stroke="${O}" stroke-width="5" rx="3"/>
      <rect x="${fx + 14}" y="${fy + 14}" width="132" height="94" fill="#ffd99a" stroke="${O}" stroke-width="3"/>
      <circle cx="${fx + 108}" cy="${fy + 42}" r="13" fill="#ff9f4a"/>
      <path d="M${fx + 14} ${fy + 90} Q${fx + 50} ${fy + 50} ${fx + 90} ${fy + 82} T${fx + 146} ${fy + 74} V${fy + 108} H${fx + 14} Z" fill="#7cc06a" stroke="${O}" stroke-width="3"/>
      <path d="M${fx + 40} ${fy + 108} L${fx + 40} ${fy + 86} L${fx + 52} ${fy + 76} L${fx + 64} ${fy + 86} V${fy + 108}" fill="#e8884a" stroke="${O}" stroke-width="2.5"/>
      <line x1="${fx + 80}" y1="${fy}" x2="${fx + 80}" y2="${fy - 26}" stroke="${O}" stroke-width="3"/></g>`;
    // tahta kılıç
    s += `<g id="sword" class="hot" data-hot="sword"><g transform="rotate(-28 520 220)">
      <path d="M512 70 L528 70 L530 300 L520 318 L510 300 Z" fill="#d8b98a" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>
      <line x1="520" y1="80" x2="520" y2="296" stroke="#b08a5a" stroke-width="3"/>
      <rect x="490" y="300" width="60" height="12" rx="4" fill="#f2c14e" stroke="${O}" stroke-width="4"/>
      <rect x="512" y="312" width="16" height="40" rx="3" fill="#7a3f22" stroke="${O}" stroke-width="4"/>
      <circle cx="520" cy="358" r="8" fill="#f2c14e" stroke="${O}" stroke-width="4"/></g></g>`;
    // sağ duvarda küçük raf + kutular
    s += `<rect x="1360" y="300" width="150" height="10" fill="#9a6036" stroke="${O}" stroke-width="4"/>
      <rect x="1372" y="262" width="34" height="38" fill="#5b8def" stroke="${O}" stroke-width="4" rx="2"/>
      <rect x="1410" y="276" width="44" height="24" fill="#e05d8e" stroke="${O}" stroke-width="4" rx="2"/>
      <circle cx="1480" cy="284" r="16" fill="#f2c14e" stroke="${O}" stroke-width="4"/>`;
    return s;
  }

  function fairyLights() {
    let s = '';
    const cols = ['#ffd36e', '#ff8fb1', '#8ff0e0', '#ffd36e', '#c6a8ff'];
    const segs = [[-20, 60, 420, 74], [420, 74, 900, 66], [900, 66, 1300, 76], [1300, 76, 1640, 62]];
    let n = 0;
    segs.forEach(([x1, y1, x2, y2]) => {
      const sag = 46;
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 + sag;
      s += `<path d="M${x1} ${y1} Q${mx} ${my + sag} ${x2} ${y2}" fill="none" stroke="#2a1a0f" stroke-width="2.5"/>`;
      for (let t = .08; t < .95; t += .12) {
        const x = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * mx + t * t * x2;
        const y = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * (my + sag) + t * t * y2;
        const c = cols[n % cols.length];
        s += `<g class="bulb" style="--d:${(R() * 3).toFixed(2)}s"><circle cx="${r1(x)}" cy="${r1(y + 9)}" r="16" fill="${c}" opacity=".35" filter="url(#glow)"/><rect x="${r1(x - 3)}" y="${r1(y)}" width="6" height="5" fill="#2a1a0f"/><ellipse cx="${r1(x)}" cy="${r1(y + 10)}" rx="5" ry="7" fill="${c}" stroke="${O}" stroke-width="2"/></g>`;
        n++;
      }
    });
    return s;
  }

  /* ---------- ZEMİN ---------- */
  const seamX = (xb, y) => VP.x + (xb - VP.x) * ((y - VP.y) / (1000 - VP.y));
  function floor() {
    let s = '<g clip-path="url(#floorClip)">';
    const tones = ['#b8804c', '#ad7643', '#be8753', '#b27b47'];
    const step = 118;
    for (let xb = -2800, i = 0; xb < 4400; xb += step, i++) {
      const a1 = seamX(xb, HZ), a2 = seamX(xb + step, HZ);
      s += `<polygon points="${r1(a1)},${HZ} ${r1(a2)},${HZ} ${xb + step},1000 ${xb},1000" fill="${tones[i % tones.length]}"/>`;
      // ek yerleri
      const joints = 1 + Math.floor(R() * 2);
      for (let k = 0; k < joints; k++) {
        const y = HZ + 20 + R() * 440;
        s += `<line x1="${r1(seamX(xb, y))}" y1="${r1(y)}" x2="${r1(seamX(xb + step, y))}" y2="${r1(y)}" stroke="${O}" stroke-width="3" opacity=".8"/>`;
      }
      // damar
      const g = xb + step * (.3 + R() * .4);
      s += `<line x1="${r1(seamX(g, HZ))}" y1="${HZ}" x2="${r1(g)}" y2="1000" stroke="#8a5530" stroke-width="2" opacity=".35" stroke-dasharray="${30 + R() * 50} ${20 + R() * 40}"/>`;
      s += `<line x1="${r1(a1)}" y1="${HZ}" x2="${xb}" y2="1000" stroke="${O}" stroke-width="3.5"/>`;
    }
    s += `<rect x="-60" y="${HZ}" width="1720" height="500" fill="url(#floorShade)"/>`;
    s += '</g>';
    // süpürgelik
    s += `<rect x="-60" y="${HZ - 16}" width="1720" height="22" fill="#7a4728" stroke="${O}" stroke-width="5"/>`;
    return s;
  }

  function rug() {
    return `<g id="rug">
      <ellipse cx="800" cy="752" rx="380" ry="100" fill="#000" opacity=".15"/>
      <ellipse cx="800" cy="745" rx="370" ry="96" fill="#4e8a7a" stroke="${O}" stroke-width="5"/>
      <ellipse cx="800" cy="745" rx="336" ry="80" fill="none" stroke="#f2e3b3" stroke-width="4" stroke-dasharray="16 10"/>
      <ellipse cx="800" cy="745" rx="270" ry="62" fill="#5d9c8a" stroke="${O}" stroke-width="3"/>
      <ellipse cx="800" cy="745" rx="190" ry="42" fill="none" stroke="#e27d60" stroke-width="7"/>
      <ellipse cx="800" cy="745" rx="110" ry="24" fill="#f2c14e" opacity=".55"/>
    </g>`;
  }

  function pouf() {
    const cx = 1300, cy = 562, rx = 190, ry = 50, h = 56;
    return `<g id="pouf" class="hot" data-hot="pouf">
      <ellipse cx="${cx + 10}" cy="${cy + h + 10}" rx="${rx + 10}" ry="${ry - 8}" fill="#000" opacity=".2"/>
      <path d="M${cx - rx} ${cy} V${cy + h} A${rx} ${ry} 0 0 0 ${cx + rx} ${cy + h} V${cy} Z" fill="#a3ac38" stroke="${O}" stroke-width="5"/>
      <path d="M${cx - rx + 30} ${cy + 30} V${cy + h + 22} M${cx - 60} ${cy + 48} V${cy + h + 46} M${cx + 60} ${cy + 48} V${cy + h + 46} M${cx + rx - 30} ${cy + 30} V${cy + h + 22}" stroke="#7f8829" stroke-width="3"/>
      <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#d4da5c" stroke="${O}" stroke-width="5"/>
      <ellipse cx="${cx}" cy="${cy}" rx="${rx - 22}" ry="${ry - 12}" fill="none" stroke="#a3ac38" stroke-width="3" stroke-dasharray="10 8"/>
      <path d="M${cx - 16} ${cy - 4} L${cx} ${cy + 6} L${cx + 16} ${cy - 4} M${cx} ${cy + 6} V${cy - 10}" stroke="${O}" stroke-width="3" fill="none"/>
      <g><rect x="${cx - 160}" y="${cy - 68}" width="120" height="44" rx="22" fill="#8cc79b" stroke="${O}" stroke-width="5"/>
         <ellipse cx="${cx - 150}" cy="${cy - 46}" rx="12" ry="21" fill="#a8d9b3" stroke="${O}" stroke-width="4"/></g>
      <g><rect x="${cx + 30}" y="${cy - 72}" width="124" height="46" rx="23" fill="#8cc79b" stroke="${O}" stroke-width="5"/>
         <ellipse cx="${cx + 142}" cy="${cy - 49}" rx="12" ry="22" fill="#a8d9b3" stroke="${O}" stroke-width="4"/></g>
      <path d="M${cx - 60} ${cy - 6} L${cx - 2} ${cy - 18} L${cx + 26} ${cy - 2} L${cx - 32} ${cy + 12} Z" fill="#4fb3bf" stroke="${O}" stroke-width="4"/>
    </g>`;
  }

  function plant() {
    return `<g id="plant" class="hot" data-hot="plant">
      <ellipse cx="180" cy="552" rx="54" ry="12" fill="#000" opacity=".2"/>
      <path d="M118 400 C80 360 70 330 84 312 C110 330 128 370 132 420 Z" fill="#5aa04f" stroke="${O}" stroke-width="4"/>
      <path d="M160 410 C150 340 166 290 196 270 C208 320 196 370 176 420 Z" fill="#78bf5e" stroke="${O}" stroke-width="4"/>
      <path d="M200 420 C230 370 270 350 290 360 C278 392 244 420 208 440 Z" fill="#4f9a45" stroke="${O}" stroke-width="4"/>
      <path d="M140 430 C110 400 80 396 64 406 C84 430 112 444 146 446 Z" fill="#6db85a" stroke="${O}" stroke-width="4"/>
      <path d="M130 470 L140 548 H222 L232 470 Z" fill="#c4623a" stroke="${O}" stroke-width="5"/>
      <rect x="122" y="456" width="118" height="22" rx="4" fill="#d9774c" stroke="${O}" stroke-width="5"/>
    </g>`;
  }

  function lightBeam() {
    let s = `<polygon class="beam" points="300,300 400,268 1010,860 600,960" fill="url(#beam)"/>`;
    for (let i = 0; i < 26; i++) {
      const t = R(), u = R();
      const x = 330 + t * 480 + u * 120, y = 300 + t * 560 + (u - .5) * 60;
      s += `<circle class="mote" cx="${r1(x)}" cy="${r1(y)}" r="${r1(1.4 + R() * 2.2)}" style="--d:${(R() * 8).toFixed(2)}s;--t:${(6 + R() * 6).toFixed(2)}s"/>`;
    }
    return s;
  }

  function defs() {
    return `<defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fdcff"/><stop offset="1" stop-color="#e9f8ff"/></linearGradient>
      <linearGradient id="wallShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a140a" stop-opacity=".45"/><stop offset=".45" stop-color="#2a140a" stop-opacity=".08"/><stop offset="1" stop-color="#2a140a" stop-opacity=".3"/></linearGradient>
      <linearGradient id="floorShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1e0e05" stop-opacity=".5"/><stop offset=".35" stop-color="#1e0e05" stop-opacity=".05"/><stop offset="1" stop-color="#1e0e05" stop-opacity=".25"/></linearGradient>
      <linearGradient id="beam" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff6d0" stop-opacity=".42"/><stop offset="1" stop-color="#fff6d0" stop-opacity="0"/></linearGradient>
      <linearGradient id="nightSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#101a3d"/><stop offset="1" stop-color="#2b3f7a"/></linearGradient>
      <linearGradient id="moonbeam" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#bcd4ff" stop-opacity=".28"/><stop offset="1" stop-color="#bcd4ff" stop-opacity="0"/></linearGradient>
      <radialGradient id="warm" cx=".5" cy=".55" r=".6"><stop offset="0" stop-color="#ffd27a" stop-opacity=".22"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>
      <clipPath id="winClip"><circle cx="330" cy="250" r="74"/></clipPath>
      <clipPath id="floorClip"><rect x="-60" y="${HZ}" width="1720" height="520"/></clipPath>
      <filter id="glow" x="-1" y="-1" width="3" height="3"><feGaussianBlur stdDeviation="6"/></filter>
    </defs>`;
  }

  function trunk(side) {
    // ön planda odayı çerçeveleyen ağaç gövdeleri
    const m = side === 'L' ? (x => x) : (x => 1600 - x);
    const pts = [[-40, -40], [130, -40], [112, 140], [128, 300], [104, 480], [118, 680], [138, 860], [210, 1040], [-40, 1040]];
    let d = `M${m(pts[0][0])} ${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const [x, y] = pts[i], [px, py] = pts[i - 1];
      d += ` Q${m((x + px) / 2 + (i % 2 ? 14 : -14))} ${(y + py) / 2} ${m(x)} ${y}`;
    }
    let s = `<path d="${d} Z" fill="#7a4a2a" stroke="${O}" stroke-width="7" stroke-linejoin="round"/>`;
    for (let i = 0; i < 5; i++) {
      const x = 16 + i * 20;
      s += `<path d="M${m(x)} -20 C${m(x + 12)} 200 ${m(x - 10)} 420 ${m(x + 8)} 640 S${m(x + 20)} 900 ${m(x + 30)} 1020" fill="none" stroke="${i % 2 ? '#5a341d' : '#946038'}" stroke-width="${i % 2 ? 3 : 4}" stroke-dasharray="${70 + i * 20} ${24 + i * 6}" stroke-linecap="round"/>`;
    }
    // asma yapraklar
    for (let i = 0; i < 9; i++) {
      const x = 40 + R() * 200, y = -10 + R() * 90, r = 18 + R() * 16;
      s += `<circle cx="${r1(m(x))}" cy="${r1(y)}" r="${r1(r)}" fill="${pick(['#4f9a45', '#5aa04f', '#6db85a', '#3f8a3a'])}" stroke="${O}" stroke-width="4"/>`;
    }
    s += `<path d="M${m(180)} 40 C${m(190)} 120 ${m(172)} 180 ${m(186)} 240" fill="none" stroke="#3f8a3a" stroke-width="5" stroke-linecap="round"/>
      <ellipse cx="${m(186)}" cy="248" rx="9" ry="14" fill="#6db85a" stroke="${O}" stroke-width="3"/>`;
    return s;
  }

  /* ---------- BMO ---------- */
  function bmoBody() {
    const lim = (d, c) => `<path d="${d}" fill="none" stroke="${O}" stroke-width="17" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="9" stroke-linecap="round"/>`;
    return `
      <g class="leg">${lim('M118 292 C114 326 104 344 90 360', '#9fdcc9')}<ellipse cx="84" cy="364" rx="17" ry="10" fill="#9fdcc9" stroke="${O}" stroke-width="4"/></g>
      <g class="leg">${lim('M204 292 C208 326 218 344 232 360', '#9fdcc9')}<ellipse cx="238" cy="364" rx="17" ry="10" fill="#9fdcc9" stroke="${O}" stroke-width="4"/></g>
      <polygon points="22,20 60,38 60,300 22,280" fill="#7fc2b0" stroke="${O}" stroke-width="6" stroke-linejoin="round"/>
      <polygon points="22,20 222,20 260,38 60,38" fill="#c2f0e0" stroke="${O}" stroke-width="6" stroke-linejoin="round"/>
      <g fill="${O}"><circle cx="33" cy="58" r="3.4"/><circle cx="47" cy="66" r="3.4"/><circle cx="33" cy="74" r="3.4"/><circle cx="47" cy="82" r="3.4"/><circle cx="33" cy="90" r="3.4"/><circle cx="47" cy="98" r="3.4"/></g>
      <text x="0" y="0" transform="translate(30 128) rotate(90) skewX(-12)" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="34" fill="${O}" letter-spacing="1">BMO</text>
      <g class="arm-l">${lim('M30 206 C-6 226 -18 280 -2 326', '#9fdcc9')}<ellipse cx="0" cy="332" rx="10" ry="8" fill="#9fdcc9" stroke="${O}" stroke-width="4"/></g>
      <rect x="60" y="38" width="200" height="262" rx="12" fill="#9fdcc9" stroke="${O}" stroke-width="6"/>
      <path d="M70 52 V286" stroke="#c2f0e0" stroke-width="6" stroke-linecap="round" opacity=".8"/>
      <rect x="78" y="56" width="164" height="112" rx="8" fill="#1d3b35" stroke="${O}" stroke-width="5"/>
      <rect x="80" y="184" width="112" height="10" rx="3" fill="#17302c"/>
      <circle class="led" cx="226" cy="189" r="6" fill="#2f6bff" stroke="${O}" stroke-width="3"/>
      <g class="ctl" data-act="dpad">
        <rect x="86" y="223" width="52" height="18" rx="3" fill="#f4d94a" stroke="${O}" stroke-width="4"/>
        <rect x="103" y="206" width="18" height="52" rx="3" fill="#f4d94a" stroke="${O}" stroke-width="4"/>
        <rect x="105" y="225" width="14" height="14" fill="#f4d94a"/>
        <rect class="dp" data-dir="up" x="100" y="200" width="24" height="24" fill="transparent"/>
        <rect class="dp" data-dir="down" x="100" y="240" width="24" height="24" fill="transparent"/>
        <rect class="dp" data-dir="left" x="80" y="220" width="24" height="24" fill="transparent"/>
        <rect class="dp" data-dir="right" x="120" y="220" width="24" height="24" fill="transparent"/>
      </g>
      <polygon points="193,198 208,222 178,222" fill="#8fd0ec" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>
      <g class="ctl" data-act="a"><circle cx="232" cy="224" r="12" fill="#5fd35f" stroke="${O}" stroke-width="4"/></g>
      <g class="ctl" data-act="b"><circle cx="204" cy="258" r="20" fill="#ee3f55" stroke="${O}" stroke-width="4"/><path d="M194 248 A12 12 0 0 1 210 244" stroke="#fff" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round"/></g>
      <rect x="84" y="270" width="30" height="10" rx="5" fill="#2f5bff" stroke="${O}" stroke-width="3"/>
      <rect x="122" y="270" width="30" height="10" rx="5" fill="#2f5bff" stroke="${O}" stroke-width="3"/>
      <g class="arm-r">${lim('M256 212 C300 232 312 290 292 330', '#9fdcc9')}<ellipse cx="290" cy="336" rx="10" ry="8" fill="#9fdcc9" stroke="${O}" stroke-width="4"/></g>`;
  }

  function build() {
    document.getElementById('bg').innerHTML = defs()
      + `<g id="far">${wall()}${ceilingBranch()}${windowEl()}${bookshelf()}${wallDecor()}</g>`
      + `<g id="mid">${floor()}${plant()}${rug()}${pouf()}${lightBeam()}<rect width="1600" height="1000" fill="url(#warm)"/></g>`;
    document.getElementById('fg').innerHTML = `<defs><filter id="glow2" x="-1" y="-1" width="3" height="3"><feGaussianBlur stdDeviation="6"/></filter></defs>`
      + `<g id="lights">${fairyLights().replace(/url\(#glow\)/g, 'url(#glow2)')}</g><g id="front">${trunk('L')}${trunk('R')}</g>`;
    document.querySelector('#bmo .bmo-body').innerHTML = bmoBody();
  }

  return { build, HZ };
})();
