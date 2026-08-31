(function (global) {
  'use strict';

  const N = {
    C2: 65.41, D2: 73.42, E2: 82.41, F2: 87.31, G2: 98.00, A2: 110.00, B2: 123.47,
    C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
    C6: 1046.50, D6: 1174.66, E6: 1318.51, F6: 1396.91, G6: 1567.98
  };

  function note(o, type, f, t, dur, vol) {
    o.frequency.setValueAtTime(f, t);
    const g = o.gain;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  function initGameMusic(cfg) {
    if (!cfg || global.__musicActive) return;
    global.__musicActive = true;

    const actx = new (window.AudioContext || window.webkitAudioContext)();
    const master = actx.createGain();
    master.gain.value = 0.6;
    master.connect(actx.destination);

    const muted = { on: true };
    const btn = document.createElement('button');
    btn.classList.add('is-on');
    btn.setAttribute('aria-label', 'Música');
    btn.title = 'Música (clic para silenciar)';
    btn.id = 'game-music-btn';
    btn.innerHTML = '<svg viewBox="0 0 40 40" width="24" height="24" aria-hidden="true">' +
      '<rect x="7" y="15" width="7" height="10" rx="1.5" fill="#fff"/>' +
      '<path d="M14 15 L21 9 L21 31 L14 25 Z" fill="#fff"/>' +
      '<g class="spk-wave"><path d="M24 15 a5 5 0 0 1 0 10" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><path d="M28 12 a9 9 0 0 1 0 16" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/></g>' +
      '<g class="spk-mute"><path d="M23 15 L34 26 M34 15 L23 26" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/></g>' +
      '</svg>';
    const st = document.createElement('style');
    st.textContent =
      '#game-music-btn{position:fixed;' + (cfg.btnPos || 'top:16px;right:16px') + ';z-index:9999;width:50px;height:50px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;background:' +
      (cfg.btnBg || 'linear-gradient(135deg,#00e5ff,#f50057)') +
      ';box-shadow:0 8px 24px rgba(0,0,0,.5);transition:transform .15s}' +
      '#game-music-btn:hover{transform:scale(1.1)}' +
      '#game-music-btn .spk-mute{display:none}' +
      '#game-music-btn.is-off .spk-wave{display:none}' +
      '#game-music-btn.is-off .spk-mute{display:block}' +
      '@keyframes gmbPulse{0%,100%{box-shadow:0 8px 24px rgba(0,0,0,.5)}50%{box-shadow:0 8px 30px ' +
      (cfg.btnGlow || 'rgba(0,229,255,.7)') + '}}' +
      '#game-music-btn.is-on{animation:gmbPulse 2.2s ease-in-out infinite}';
    document.head.appendChild(st);
    document.body.appendChild(btn);

    function turn(on) {
      muted.on = on;
      master.gain.setTargetAtTime(on ? cfg.volume || 0.6 : 0, actx.currentTime, 0.05);
      btn.classList.toggle('is-on', on);
      btn.classList.toggle('is-off', !on);
    }
    btn.addEventListener('click', () => {
      if (actx.state === 'suspended') actx.resume();
      if (!started) { start(); started = true; }
      turn(!muted.on);
    });

    const spb = 60 / cfg.tempo / 2;
    const CHORDS = {
      C:  { bass: 'C2', arp: ['C4', 'E4', 'G4', 'C5', 'E5', 'G5'], pad: ['C3', 'G3', 'E4'] },
      Dm: { bass: 'D2', arp: ['D4', 'F4', 'A4', 'D5', 'F5', 'A5'], pad: ['D3', 'A3', 'F4'] },
      Em: { bass: 'E2', arp: ['E4', 'G4', 'B4', 'E5', 'G5', 'B5'], pad: ['E3', 'B3', 'G4'] },
      F:  { bass: 'F2', arp: ['F3', 'A3', 'C4', 'F4', 'A4', 'C5'], pad: ['F3', 'C4', 'A3'] },
      G:  { bass: 'G2', arp: ['G3', 'B3', 'D4', 'G4', 'B4', 'D5'], pad: ['G3', 'D4', 'B3'] },
      A:  { bass: 'A2', arp: ['A3', 'C#4', 'E4', 'A4', 'C#5', 'E5'], pad: ['A3', 'E4', 'C#4'] },
      Am: { bass: 'A2', arp: ['A3', 'C4', 'E4', 'A4', 'C5', 'E5'], pad: ['A3', 'E4', 'C4'] },
      Bb: { bass: 'A#2', arp: ['A#3', 'D4', 'F4', 'A#4', 'D5', 'F5'], pad: ['A#3', 'F4', 'D4'] }
    };

    const leadWaves = { bell: 'triangle', square: 'square', saw: 'sawtooth', soft: 'sine' };
    const arpWaves = { bell: 'sine', square: 'square', saw: 'sawtooth', soft: 'sine' };
    const bassWave = { bell: 'triangle', square: 'triangle', saw: 'square', soft: 'sine' };
    const lw = leadWaves[cfg.lead] || 'triangle';
    const aw = arpWaves[cfg.lead] || 'sine';
    const bw = bassWave[cfg.lead] || 'triangle';

    function lead(f, t, dur) {
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = lw; o.connect(g); g.connect(master);
      note({ frequency: o.frequency, gain: g }, null, f, t, dur, 0.13);
      o.disconnect = null;
      if (cfg.lead === 'bell' || cfg.sparkle) {
        const o2 = actx.createOscillator(), g2 = actx.createGain();
        o2.type = 'sine'; o2.frequency.value = f * 2; o2.connect(g2); g2.connect(master);
        g2.gain.setValueAtTime(0.0001, t);
        g2.gain.exponentialRampToValueAtTime(0.05, t + 0.015);
        g2.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.6);
        o2.start(t); o2.stop(t + dur);
      }
    }

    function pluck(f, t, dur, vol) {
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = aw; o.connect(g); g.connect(master);
      note({ frequency: o.frequency, gain: g }, null, f, t, dur, vol || 0.08);
    }

    function bass(f, t, dur, vol) {
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = bw; o.connect(g); g.connect(master);
      note({ frequency: o.frequency, gain: g }, null, f, t, dur, vol || 0.09);
    }

    function pad(freqs, t, dur, vol) {
      freqs.forEach(f => {
        const o = actx.createOscillator(), g = actx.createGain();
        o.type = 'triangle'; o.connect(g); g.connect(master);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(vol || 0.05, t + 0.18);
        g.gain.setValueAtTime(vol || 0.05, t + dur - 0.25);
        g.gain.linearRampToValueAtTime(0.0001, t + dur);
        o.start(t); o.stop(t + dur + 0.05);
      });
    }

    function playArp(ch, t0) {
      const tones = ch.arp.map(x => N[x]);
      for (let i = 0; i < 8; i++) pluck(tones[cfg.arpPat ? cfg.arpPat[i] : [0, 1, 2, 3, 2, 1, 0, 1][i]], t0 + i * spb, spb * 1.7, 0.08);
    }
    function playBass(ch, t0) {
      bass(N[ch.bass], t0, spb * 3.2);
      bass(N[ch.bass], t0 + 4 * spb, spb * 3.2);
    }

    const chordSeq = cfg.chordSeq;
    const melody = cfg.melody;
    const stepLen = chordSeq.length * 8;

    let step = 0, nextT = 0, started = false;
    function schedule() {
      const horizon = actx.currentTime + 0.4;
      if (nextT < actx.currentTime) nextT = actx.currentTime + 0.06;
      while (nextT < horizon) {
        const sIdx = step % stepLen;
        const mIdx = Math.floor(sIdx / 8);
        const sub = sIdx % 8;
        const ch = CHORDS[chordSeq[mIdx]];
        if (sub === 0) {
          if (cfg.pad !== false) pad(ch.pad.map(x => N[x]), nextT, 8 * spb, 0.045);
          if (cfg.arp !== false) playArp(ch, nextT);
          playBass(ch, nextT);
        }
        const noteName = melody[sIdx];
        if (noteName) lead(N[noteName], nextT, spb * 1.8);
        nextT += spb;
        step++;
      }
    }
    function start() {
      schedule();
      setInterval(schedule, 120);
    }

    function begin() {
      if (started) return;
      started = true;
      const p = actx.resume ? actx.resume() : null;
      if (p && typeof p.then === 'function') {
        p.then(() => start()).catch(() => start());
      } else {
        start();
      }
    }

    // Intenta arrancar la música de inmediato (el navegador puede bloquearla
    // sin interacción previa; si es así, arranca con la primera interacción).
    begin();
    const once = () => { begin(); document.removeEventListener('pointerdown', once); window.removeEventListener('keydown', once); };
    document.addEventListener('pointerdown', once);
    window.addEventListener('keydown', once);
  }

  global.initGameMusic = initGameMusic;
})(window);
