// Pure Web Audio API Sound Effects Engine
// Zero external files, zero latency, runs directly in browser

let audioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function isSoundEnabled() {
  if (typeof window === 'undefined') return true;
  const stored = localStorage.getItem('wobble_sound_enabled');
  return stored === null ? true : stored === 'true';
}

export function setSoundEnabled(enabled) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('wobble_sound_enabled', String(enabled));
}

// 1. Satisfying soft pop (for likes, button taps, chip selects)
export function playPop() {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch (e) {
    // Ignore audio context errors gracefully
  }
}

// 2. Gentle air whoosh (for card pass / swipe / screen transition)
export function playWhoosh() {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.14);

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.14);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.14);
  } catch (e) {}
}

// 3. Dreamy warm arpeggio chime (for match unlock & Wobble Hour chemistry match)
export function playMatchChime() {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.07);

      gain.gain.setValueAtTime(0.25, ctx.currentTime + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.07 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.07);
      osc.stop(ctx.currentTime + idx * 0.07 + 0.35);
    });
  } catch (e) {}
}

// 4. Acoustic heartbeat thump (for Wobble Hour & Heartbeat Sync)
export function playHeartbeat() {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    
    // Lub-dub double beat
    [0, 0.16].forEach((delay) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(80, ctx.currentTime + delay);
      osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + delay + 0.12);

      gain.gain.setValueAtTime(0.35, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.12);
    });
  } catch (e) {}
}

// 5. Upbeat fanfare for mini-game success & 100% Wobble Meter
export function playFanfare() {
  if (!isSoundEnabled()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.08);
      osc.stop(ctx.currentTime + idx * 0.08 + 0.4);
    });
  } catch (e) {}
}

// 6. Voice prompt synthesis melody (plays a warm soothing audio phrase when previewing voice note)
export function playVoiceMelody(durationSec = 5, onEnd) {
  if (!isSoundEnabled()) {
    if (onEnd) setTimeout(onEnd, durationSec * 1000);
    return () => {};
  }
  try {
    const ctx = getAudioContext();
    if (!ctx) {
      if (onEnd) setTimeout(onEnd, durationSec * 1000);
      return () => {};
    }

    const pentatonic = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25];
    let isCancelled = false;
    const oscillators = [];

    const totalNotes = Math.min(12, Math.floor(durationSec * 2));
    for (let i = 0; i < totalNotes; i++) {
      const noteTime = ctx.currentTime + i * 0.45;
      const freq = pentatonic[i % pentatonic.length];

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.12, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.4);
      oscillators.push(osc);
    }

    const timer = setTimeout(() => {
      if (!isCancelled && onEnd) onEnd();
    }, durationSec * 1000);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
      oscillators.forEach(o => {
        try { o.stop(); } catch (e) {}
      });
    };
  } catch (e) {
    if (onEnd) setTimeout(onEnd, durationSec * 1000);
    return () => {};
  }
}
