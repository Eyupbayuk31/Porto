/* Tüm sesler WebAudio ile üretilir — hiç ses dosyası yok. */
window.SFX = (() => {
  let ac = null, master, sfxBus, musicBus, noiseBuf;
  let sfxOn = true, musicOn = false, musicTimer = null, nextNoteTime = 0, step = 0;

  function init() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ac = new AC();
    master = ac.createGain(); master.gain.value = 0.9; master.connect(ac.destination);
    sfxBus = ac.createGain(); sfxBus.gain.value = 1; sfxBus.connect(master);
    musicBus = ac.createGain(); musicBus.gain.value = 0; musicBus.connect(master);
    noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }

  function tone(freq, dur, { type = 'square', vol = 0.05, at = 0, slide = 0, bus = sfxBus, attack = 0.004 } = {}) {
    if (!ac || (bus === sfxBus && !sfxOn)) return;
    const t = ac.currentTime + at;
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq * slide), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(bus); o.start(t); o.stop(t + dur + 0.02);
  }

  function noise(dur, { vol = 0.08, at = 0, from = 800, to = 800, q = 1, type = 'bandpass' } = {}) {
    if (!ac || !sfxOn) return;
    const t = ac.currentTime + at;
    const s = ac.createBufferSource(); s.buffer = noiseBuf;
    const f = ac.createBiquadFilter(); f.type = type; f.Q.value = q;
    f.frequency.setValueAtTime(from, t); f.frequency.exponentialRampToValueAtTime(to, t + dur);
    const g = ac.createGain();
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f).connect(g).connect(sfxBus); s.start(t); s.stop(t + dur + 0.02);
  }

  const N = n => 440 * Math.pow(2, (n - 69) / 12); // MIDI -> Hz

  const api = {
    init,
    get sfxOn() { return sfxOn; },
    get musicOn() { return musicOn; },
    setSfx(v) { sfxOn = v; },

    hover() { tone(1320, 0.035, { vol: 0.02 }); },
    move() { tone(988, 0.05, { vol: 0.035 }); tone(1480, 0.05, { vol: 0.025, at: 0.04 }); },
    voice(ch) {
      // BMO'nun "konuşması": karaktere göre hafif değişen çip sesi
      const base = 520 + ((ch.charCodeAt(0) * 37) % 9) * 38;
      tone(base, 0.055, { type: 'triangle', vol: 0.05, slide: 1.12 });
    },
    lift() { noise(0.25, { vol: 0.05, from: 400, to: 2400, q: 2 }); },
    whoosh() { noise(0.45, { vol: 0.07, from: 300, to: 3000, q: 1.5 }); },
    clunk() {
      noise(0.08, { vol: 0.25, from: 2500, to: 600, q: 0.8 });
      tone(110, 0.14, { vol: 0.12, slide: 0.5 });
      noise(0.05, { vol: 0.15, at: 0.11, from: 3000, to: 1500, q: 2 });
      tone(180, 0.06, { vol: 0.06, at: 0.11 });
    },
    boot() {
      [72, 76, 79, 84].forEach((n, i) => tone(N(n), 0.12, { vol: 0.045, at: 0.08 + i * 0.08 }));
      [72, 76, 79, 88].forEach(n => tone(N(n), 0.5, { vol: 0.025, at: 0.42, type: 'triangle' }));
    },
    wake() {
      [60, 64, 67, 72, 76].forEach((n, i) => tone(N(n), 0.1, { vol: 0.04, at: i * 0.06 }));
      tone(N(84), 0.35, { vol: 0.03, at: 0.32, type: 'triangle' });
    },
    eject() {
      tone(160, 0.08, { vol: 0.1, slide: 1.8 });
      noise(0.1, { vol: 0.18, from: 900, to: 3500, q: 1 });
      [84, 79, 76, 72].forEach((n, i) => tone(N(n), 0.08, { vol: 0.035, at: 0.12 + i * 0.06 }));
    },
    zoomIn() { noise(0.6, { vol: 0.06, from: 200, to: 5000, q: 3 }); tone(220, 0.6, { vol: 0.03, slide: 4, type: 'sine' }); },
    zoomOut() { noise(0.5, { vol: 0.05, from: 4000, to: 200, q: 3 }); tone(880, 0.5, { vol: 0.03, slide: 0.25, type: 'sine' }); },
    error() { tone(196, 0.15, { vol: 0.06 }); tone(147, 0.25, { vol: 0.06, at: 0.14 }); },

    toggleMusic() {
      init(); if (!ac) return false;
      musicOn = !musicOn;
      const t = ac.currentTime;
      musicBus.gain.cancelScheduledValues(t);
      musicBus.gain.setTargetAtTime(musicOn ? 0.55 : 0, t, 0.3);
      if (musicOn && !musicTimer) { nextNoteTime = ac.currentTime + 0.1; step = 0; musicTimer = setInterval(schedule, 50); }
      if (!musicOn) setTimeout(() => { if (!musicOn && musicTimer) { clearInterval(musicTimer); musicTimer = null; } }, 1200);
      return musicOn;
    },
  };

  /* Küçük, sakin bir chiptune döngüsü (C - Am - F - G) */
  const CHORDS = [[48, 55, 64, 67], [45, 52, 60, 64], [41, 48, 57, 60], [43, 50, 59, 62]];
  const MELODY = [76, 0, 79, 76, 74, 0, 72, 0, 72, 74, 76, 0, 79, 0, 81, 79,
                  77, 0, 76, 74, 72, 0, 69, 0, 71, 72, 74, 0, 71, 0, 67, 0];
  const SPB = 60 / 92 / 2; // sekizlik nota süresi
  function schedule() {
    while (nextNoteTime < ac.currentTime + 0.2) {
      const at = nextNoteTime - ac.currentTime;
      const bar = Math.floor(step / 8) % 4, chord = CHORDS[bar];
      if (step % 8 === 0) tone(N(chord[0] - 12), SPB * 7.5, { type: 'triangle', vol: 0.09, at, bus: musicBus, attack: 0.01 });
      if (step % 4 === 2) tone(N(chord[0]), SPB * 0.8, { type: 'triangle', vol: 0.05, at, bus: musicBus });
      tone(N(chord[1 + (step % 3)] + 12), SPB * 0.6, { type: 'square', vol: 0.012, at, bus: musicBus });
      const m = MELODY[step % 32];
      if (m && Math.floor(step / 32) % 2 === 1) tone(N(m), SPB * 1.6, { type: 'square', vol: 0.022, at, bus: musicBus, attack: 0.01 });
      nextNoteTime += SPB; step++;
    }
  }
  return api;
})();
