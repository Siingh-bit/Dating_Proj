import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, RotateCcw, Play } from 'lucide-react';
import './gameShell.css';
import './StackOfUsModal.css';

/**
 * STACK OF US — an arcade precision game.
 *
 * A block slides back and forth; tap to drop it. Any overhang is sliced off,
 * so sloppy drops narrow the tower until you miss entirely. Every third level
 * unlocks a question, so the tower height *is* how deep the conversation goes.
 */

const BOARD_W = 300;
const BOARD_H = 380;
const BLOCK_H = 26;
const START_W = 190;
const BASE_SPEED = 2.0;
const SPEED_STEP = 0.16;
const MAX_SPEED = 6.5;

const COLORS = ['#E8604C', '#FF7B6B', '#C4A265', '#7C4DFF', '#5CB87A', '#FF6B9D', '#3B7CA8'];

const MILESTONES = [
  'What is one thing you have never told anyone on a first date?',
  'Describe the version of us five years from now.',
  'What is a small habit of mine you have already noticed?',
  'Name something you would happily give up to make this work.',
  'What is the bravest thing you have ever done for someone?',
  'When did you first think this might actually go somewhere?',
  'What is one thing you want more of in your life right now?',
];

export default function StackOfUsModal({ onClose, onSendToChat }) {
  const [phase, setPhase] = useState('ready');   // ready | playing | done
  const [blocks, setBlocks] = useState([]);      // {x, w, color} bottom-up
  const [level, setLevel] = useState(0);
  const [perfects, setPerfects] = useState(0);
  const [prompt, setPrompt] = useState(null);
  const [moving, setMoving] = useState({ x: (BOARD_W - START_W) / 2, w: START_W });

  const rafRef = useRef(null);
  const stateRef = useRef({ x: 0, w: START_W, dir: 1, speed: BASE_SPEED, top: null });

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }, []);

  useEffect(() => stop, [stop]);

  const loop = useCallback(() => {
    const s = stateRef.current;
    s.x += s.dir * s.speed;
    if (s.x <= 0) { s.x = 0; s.dir = 1; }
    if (s.x + s.w >= BOARD_W) { s.x = BOARD_W - s.w; s.dir = -1; }
    setMoving({ x: s.x, w: s.w });
    rafRef.current = requestAnimationFrame(loop);
  }, []);

  const start = () => {
    const base = { x: (BOARD_W - START_W) / 2, w: START_W, color: COLORS[0] };
    stateRef.current = { x: 0, w: START_W, dir: 1, speed: BASE_SPEED, top: base };
    setBlocks([base]);
    setLevel(0); setPerfects(0); setPrompt(null);
    setMoving({ x: 0, w: START_W });
    setPhase('playing');
    stop();
    rafRef.current = requestAnimationFrame(loop);
  };

  const drop = () => {
    if (phase !== 'playing') return;
    const s = stateRef.current;
    const top = s.top;

    const left = Math.max(s.x, top.x);
    const right = Math.min(s.x + s.w, top.x + top.w);
    const overlap = right - left;

    if (overlap <= 0) {           // missed the tower entirely
      stop();
      setPhase('done');
      return;
    }

    const offset = Math.abs(s.x - top.x);
    const isPerfect = offset <= 4;
    // A near-perfect drop keeps the full width as a reward
    const newW = isPerfect ? top.w : overlap;
    const newX = isPerfect ? top.x : left;
    const placed = { x: newX, w: newW, color: COLORS[(blocks.length) % COLORS.length] };

    setBlocks(b => [...b, placed]);
    if (isPerfect) setPerfects(p => p + 1);

    const nextLevel = level + 1;
    setLevel(nextLevel);
    if (nextLevel % 3 === 0) {
      setPrompt(MILESTONES[(nextLevel / 3 - 1) % MILESTONES.length]);
    }

    if (newW < 14) {              // tower too thin to continue
      stop();
      setPhase('done');
      return;
    }

    s.top = placed;
    s.w = newW;
    s.x = s.dir > 0 ? 0 : BOARD_W - newW;
    s.speed = Math.min(MAX_SPEED, BASE_SPEED + nextLevel * SPEED_STEP);
  };

  const visible = blocks.slice(-Math.floor(BOARD_H / BLOCK_H) + 1);
  const unlocked = Math.floor(level / 3);

  const send = () => {
    onSendToChat({
      type: 'stack_of_us',
      level, perfects,
      summaryText: `🧱 Stack of Us — built ${level} levels with ${perfects} perfect drops and unlocked ${unlocked} question${unlocked === 1 ? '' : 's'}.${prompt ? ` Starting with: ${prompt}` : ''} Beat my tower.`,
    });
    onClose();
  };

  return (
    <div className="gs-overlay">
      <div className="gs-modal">
        <header className="gs-header">
          <h2>Stack of Us</h2>
          <button className="close-btn" onClick={() => { stop(); onClose(); }}><X size={24} /></button>
        </header>
        <p className="gs-sub">Tap to drop. Every 3 levels unlocks a question.</p>

        {phase === 'ready' && (
          <>
            <div className="gs-stage">
              <div className="so-intro">
                <div className="so-intro-tower">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="so-intro-block" style={{ background: COLORS[i], width: 130 - i * 22 }} />
                  ))}
                </div>
                <p className="so-intro-note">
                  Overhang gets sliced off, so every sloppy drop makes the next one harder.
                  Land it dead centre and you keep the full width.
                </p>
              </div>
            </div>
            <div className="gs-actions">
              <button className="gs-btn gs-btn-primary" onClick={start}><Play size={18} /> Start building</button>
            </div>
          </>
        )}

        {phase !== 'ready' && (
          <div className="gs-stats">
            <div className="gs-stat">
              <span className="gs-stat-label">Level</span>
              <span className="gs-stat-value">{level}</span>
            </div>
            <div className="gs-stat">
              <span className="gs-stat-label">Perfect</span>
              <span className="gs-stat-value">{perfects}</span>
            </div>
            <div className="gs-stat">
              <span className="gs-stat-label">Unlocked</span>
              <span className="gs-stat-value">{unlocked}</span>
            </div>
          </div>
        )}

        {phase === 'playing' && (
          <>
            <div
              className="so-board"
              style={{ width: BOARD_W, height: BOARD_H }}
              onPointerDown={drop}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); drop(); } }}
            >
              {visible.map((b, i) => (
                <div
                  key={`${i}-${b.x}-${b.w}`}
                  className="so-block"
                  style={{
                    left: b.x, width: b.w, height: BLOCK_H,
                    bottom: i * BLOCK_H, background: b.color,
                  }}
                />
              ))}
              <div
                className="so-block so-moving"
                style={{
                  left: moving.x, width: moving.w, height: BLOCK_H,
                  bottom: visible.length * BLOCK_H,
                  background: COLORS[blocks.length % COLORS.length],
                }}
              />
              <span className="so-tap-hint">tap to drop</span>
            </div>

            {prompt && <div key={prompt} className="gs-prompt-card so-prompt">🔓 {prompt}</div>}
          </>
        )}

        {phase === 'done' && (
          <>
            <div className="gs-stage">
              <div className="gs-result">
                <div className="gs-result-score">{level}</div>
                <h3 className="gs-result-title">
                  {level >= 15 ? 'Architect of love 🏗️' : level >= 8 ? 'Solid foundation 🧱' : 'It wobbled 🪨'}
                </h3>
                <p className="gs-result-note">
                  {perfects} perfect drop{perfects === 1 ? '' : 's'} · {unlocked} question{unlocked === 1 ? '' : 's'} unlocked
                </p>
                {prompt && <div className="gs-prompt-card so-prompt-final">🔓 {prompt}</div>}
              </div>
            </div>
            <div className="gs-actions">
              <button className="gs-btn gs-btn-ghost" onClick={start}><RotateCcw size={18} /> Rebuild</button>
              <button className="gs-btn gs-btn-primary" onClick={send}><Send size={18} /> Send tower</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
