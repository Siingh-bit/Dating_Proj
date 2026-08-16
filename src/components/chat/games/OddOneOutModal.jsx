import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, RotateCcw, Play } from 'lucide-react';
import './gameShell.css';
import './OddOneOutModal.css';

/**
 * ODD ONE OUT — a timed visual-perception game.
 *
 * One tile in the grid is a very slightly different shade. Each level the grid
 * grows and the colour difference shrinks, so it gets genuinely hard fast.
 * Colours are generated in HSL rather than using emoji, which keeps the
 * difficulty identical on every device instead of depending on font rendering.
 */

const ROUND_SECONDS = 45;
const WRONG_PENALTY = 3;        // seconds lost for tapping the wrong tile

// Grid grows 2x2 -> 3x3 -> ... and the lightness gap narrows as you climb.
const gridSize = (level) => Math.min(7, 2 + Math.floor(level / 2));
const deltaFor = (level) => Math.max(2.2, 20 - level * 1.35);   // % lightness

const HUES = [352, 12, 40, 265, 200, 150];

const makeBoard = (level) => {
  const n = gridSize(level);
  const count = n * n;
  const hue = HUES[Math.floor(Math.random() * HUES.length)];
  const sat = 55 + Math.random() * 15;
  const base = 42 + Math.random() * 12;
  const delta = deltaFor(level);
  // Randomise direction so the odd tile isn't always the lighter one
  const oddL = Math.random() < 0.5 ? base + delta : base - delta;
  return {
    n,
    oddIndex: Math.floor(Math.random() * count),
    baseColor: `hsl(${hue} ${sat.toFixed(0)}% ${base.toFixed(1)}%)`,
    oddColor: `hsl(${hue} ${sat.toFixed(0)}% ${oddL.toFixed(1)}%)`,
    delta,
  };
};

const rank = (level) => {
  if (level >= 16) return { title: 'Eagle eyes 🦅', note: 'You are seeing differences most people physically cannot.' };
  if (level >= 11) return { title: 'Very sharp 👁️', note: 'Well past where the tiles start blurring together.' };
  if (level >= 6)  return { title: 'Good spotting 🔍', note: 'Solid run before the shades got mean.' };
  return { title: 'Warming up 🫣', note: 'They get closer together fast, to be fair.' };
};

export default function OddOneOutModal({ onClose, onSendToChat }) {
  const [phase, setPhase] = useState('ready');    // ready | playing | done
  const [level, setLevel] = useState(1);
  const [board, setBoard] = useState(() => makeBoard(1));
  const [left, setLeft] = useState(ROUND_SECONDS);
  const [shakeIdx, setShakeIdx] = useState(null);
  const [misses, setMisses] = useState(0);

  const timerRef = useRef(null);

  useEffect(() => {
    if (phase !== 'playing') return;
    timerRef.current = setInterval(() => {
      setLeft(s => {
        if (s <= 1) { clearInterval(timerRef.current); setPhase('done'); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const start = useCallback(() => {
    setLevel(1);
    setBoard(makeBoard(1));
    setLeft(ROUND_SECONDS);
    setMisses(0);
    setShakeIdx(null);
    setPhase('playing');
  }, []);

  const handleTile = (i) => {
    if (phase !== 'playing') return;
    if (i === board.oddIndex) {
      const next = level + 1;
      setLevel(next);
      setBoard(makeBoard(next));
    } else {
      setMisses(m => m + 1);
      setShakeIdx(i);
      setTimeout(() => setShakeIdx(null), 400);
      setLeft(s => Math.max(0, s - WRONG_PENALTY));
    }
  };

  const cleared = level - 1;
  const r = rank(cleared);

  const send = () => {
    onSendToChat({
      type: 'odd_one_out',
      level: cleared, misses,
      summaryText: `👁️ Odd One Out — cleared ${cleared} level${cleared === 1 ? '' : 's'} in ${ROUND_SECONDS}s with ${misses} miss${misses === 1 ? '' : 'es'}. ${r.title} Your eyes any better?`,
    });
    onClose();
  };

  return (
    <div className="gs-overlay">
      <div className="gs-modal">
        <header className="gs-header">
          <h2>Odd One Out</h2>
          <button className="close-btn" onClick={onClose}><X size={24} /></button>
        </header>
        <p className="gs-sub">One tile is a slightly different shade. Tap it.</p>

        {phase === 'ready' && (
          <>
            <div className="gs-stage">
              <div className="ooo-demo">
                {[0, 1, 2, 3].map(i => (
                  <div
                    key={i}
                    className="ooo-demo-tile"
                    style={{ background: i === 2 ? 'hsl(352 60% 58%)' : 'hsl(352 60% 46%)' }}
                  />
                ))}
              </div>
              <p className="ooo-intro-note">
                Every level the grid grows and the difference shrinks.
                <br />Wrong tap costs you {WRONG_PENALTY} seconds. You have {ROUND_SECONDS}.
              </p>
            </div>
            <div className="gs-actions">
              <button className="gs-btn gs-btn-primary" onClick={start}><Play size={18} /> Start</button>
            </div>
          </>
        )}

        {phase === 'playing' && (
          <>
            <div className="gs-stats">
              <div className="gs-stat">
                <span className="gs-stat-label">Time</span>
                <span className={`gs-stat-value ${left <= 10 ? 'ooo-urgent' : ''}`}>{left}s</span>
              </div>
              <div className="gs-stat">
                <span className="gs-stat-label">Level</span>
                <span className="gs-stat-value">{level}</span>
              </div>
              <div className="gs-stat">
                <span className="gs-stat-label">Misses</span>
                <span className="gs-stat-value">{misses}</span>
              </div>
            </div>

            <div className="gs-stage ooo-stage">
              <div
                className="ooo-grid"
                style={{ gridTemplateColumns: `repeat(${board.n}, 1fr)` }}
                key={level}
              >
                {Array.from({ length: board.n * board.n }, (_, i) => (
                  <button
                    key={i}
                    className={`ooo-tile ${shakeIdx === i ? 'shake' : ''}`}
                    style={{ background: i === board.oddIndex ? board.oddColor : board.baseColor }}
                    onClick={() => handleTile(i)}
                    aria-label={`Tile ${i + 1}`}
                  />
                ))}
              </div>
              <span className="ooo-difficulty">difference: {board.delta.toFixed(1)}%</span>
            </div>
          </>
        )}

        {phase === 'done' && (
          <>
            <div className="gs-stage">
              <div className="gs-result">
                <div className="gs-result-score">{cleared}</div>
                <h3 className="gs-result-title">{r.title}</h3>
                <p className="gs-result-note">{r.note}</p>
                <p className="gs-result-note ooo-detail">
                  {misses} wrong tap{misses === 1 ? '' : 's'} · finished on a {gridSize(level)}×{gridSize(level)} grid
                </p>
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
