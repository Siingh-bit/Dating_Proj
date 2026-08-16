import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, RotateCcw, Play } from 'lucide-react';
import './gameShell.css';
import './LoveSequenceModal.css';

/**
 * LOVE SEQUENCE — a pattern-recall game (Simon).
 *
 * Distinct from Memory Lane: that one is spatial pair-matching, this is ordered
 * short-term recall of a sequence that grows by one every round. Each pad has
 * its own tone, generated with WebAudio so there are no audio assets.
 */

const PADS = [
  { id: 0, emoji: '💗', color: '#E8604C', freq: 261.63 },  // C4
  { id: 1, emoji: '💙', color: '#3B7CA8', freq: 329.63 },  // E4
  { id: 2, emoji: '💛', color: '#C4A265', freq: 392.00 },  // G4
  { id: 3, emoji: '💚', color: '#5CB87A', freq: 523.25 },  // C5
];

const SHOW_ON = 420;    // ms a pad stays lit
const SHOW_GAP = 180;   // ms between pads

const rank = (level) => {
  if (level >= 12) return { title: 'Unforgettable 🧠', note: 'Twelve deep. That is a genuinely rare memory.' };
  if (level >= 8)  return { title: 'Locked in 💗', note: 'Eight in a row is well above average.' };
  if (level >= 5)  return { title: 'Paying attention 👀', note: 'Solid. Most people wobble around here.' };
  return { title: 'Distracted 🙈', note: 'Thinking about something else? Or someone?' };
};

export default function LoveSequenceModal({ onClose, onSendToChat }) {
  const [phase, setPhase] = useState('ready');   // ready | showing | input | done
  const [sequence, setSequence] = useState([]);
  const [lit, setLit] = useState(null);
  const [inputIdx, setInputIdx] = useState(0);
  const [best, setBest] = useState(0);
  const [wrongPad, setWrongPad] = useState(null);

  const timersRef = useRef([]);
  const audioRef = useRef(null);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  // Short pluck per pad. Silently no-ops if WebAudio is unavailable.
  const tone = useCallback((freq, bad = false) => {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!audioRef.current) audioRef.current = new Ctx();
      const ctx = audioRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = bad ? 'sawtooth' : 'sine';
      osc.frequency.value = bad ? 110 : freq;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + (bad ? 0.45 : 0.3));
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + (bad ? 0.45 : 0.3));
    } catch { /* audio is a nicety, never a failure */ }
  }, []);

  const playSequence = useCallback((seq) => {
    setPhase('showing');
    setInputIdx(0);
    clearTimers();
    seq.forEach((padId, i) => {
      timersRef.current.push(setTimeout(() => {
        setLit(padId);
        tone(PADS[padId].freq);
        timersRef.current.push(setTimeout(() => setLit(null), SHOW_ON));
      }, i * (SHOW_ON + SHOW_GAP) + 400));
    });
    timersRef.current.push(setTimeout(
      () => setPhase('input'),
      seq.length * (SHOW_ON + SHOW_GAP) + 400
    ));
  }, [clearTimers, tone]);

  const start = () => {
    const first = [Math.floor(Math.random() * PADS.length)];
    setSequence(first);
    setWrongPad(null);
    playSequence(first);
  };

  const handlePad = (padId) => {
    if (phase !== 'input') return;

    if (padId !== sequence[inputIdx]) {   // wrong pad -> game over
      tone(0, true);
      setWrongPad(padId);
      setBest(b => Math.max(b, sequence.length - 1));
      clearTimers();
      timersRef.current.push(setTimeout(() => setPhase('done'), 650));
      setPhase('failing');
      return;
    }

    tone(PADS[padId].freq);
    setLit(padId);
    timersRef.current.push(setTimeout(() => setLit(null), 160));

    const next = inputIdx + 1;
    if (next < sequence.length) {
      setInputIdx(next);
      return;
    }

    // Round cleared — extend the sequence
    const grown = [...sequence, Math.floor(Math.random() * PADS.length)];
    setBest(b => Math.max(b, sequence.length));
    setSequence(grown);
    timersRef.current.push(setTimeout(() => playSequence(grown), 620));
  };

  const level = Math.max(best, 0);
  const r = rank(level);

  const send = () => {
    onSendToChat({
      type: 'love_sequence',
      level,
      summaryText: `🎶 Love Sequence — I remembered ${level} step${level === 1 ? '' : 's'} in a row. ${r.title} Think you can go further?`,
    });
    onClose();
  };

  const statusText =
    phase === 'showing' ? 'Watch carefully…'
    : phase === 'input' ? `Your turn — ${inputIdx}/${sequence.length}`
    : phase === 'failing' ? 'Wrong one!'
    : '';

  return (
    <div className="gs-overlay">
      <div className="gs-modal">
        <header className="gs-header">
          <h2>Love Sequence</h2>
          <button className="close-btn" onClick={() => { clearTimers(); onClose(); }}><X size={24} /></button>
        </header>
        <p className="gs-sub">Watch the pattern, then repeat it. It grows every round.</p>

        {phase === 'ready' && (
          <>
            <div className="gs-stage">
              <div className="lsq-preview">
                {PADS.map(p => (
                  <div key={p.id} className="lsq-preview-pad" style={{ background: p.color }}>{p.emoji}</div>
                ))}
              </div>
              <p className="lsq-intro-note">
                One extra step is added every round. One wrong tap ends it.
                <br />How deep can your memory go?
              </p>
            </div>
            <div className="gs-actions">
              <button className="gs-btn gs-btn-primary" onClick={start}><Play size={18} /> Start</button>
            </div>
          </>
        )}

        {(phase === 'showing' || phase === 'input' || phase === 'failing') && (
          <>
            <div className="gs-stats">
              <div className="gs-stat">
                <span className="gs-stat-label">Round</span>
                <span className="gs-stat-value">{sequence.length}</span>
              </div>
              <div className="gs-stat">
                <span className="gs-stat-label">Best</span>
                <span className="gs-stat-value">{best}</span>
              </div>
            </div>

            <p className={`lsq-status ${phase}`}>{statusText}</p>

            <div className={`lsq-grid ${phase === 'input' ? 'active' : ''}`}>
              {PADS.map(p => (
                <button
                  key={p.id}
                  className={`lsq-pad ${lit === p.id ? 'lit' : ''} ${wrongPad === p.id ? 'wrong' : ''}`}
                  style={{ '--pad-color': p.color }}
                  onPointerDown={() => handlePad(p.id)}
                  disabled={phase !== 'input'}
                  aria-label={`Pad ${p.id + 1}`}
                >
                  {p.emoji}
                </button>
              ))}
            </div>
          </>
        )}

        {phase === 'done' && (
          <>
            <div className="gs-stage">
              <div className="gs-result">
                <div className="gs-result-score">{level}</div>
                <h3 className="gs-result-title">{r.title}</h3>
                <p className="gs-result-note">{r.note}</p>
              </div>
            </div>
            <div className="gs-actions">
              <button className="gs-btn gs-btn-ghost" onClick={start}><RotateCcw size={18} /> Again</button>
              <button className="gs-btn gs-btn-primary" onClick={send}><Send size={18} /> Send score</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
