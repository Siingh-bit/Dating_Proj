import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, RotateCcw, Play } from 'lucide-react';
import './gameShell.css';
import './TugOfLoveModal.css';

/**
 * TUG OF LOVE — a real-time mashing / dexterity game.
 *
 * The knot has velocity and friction, so it is a little physics duel rather
 * than a turn-based prompt. Every tap adds impulse toward your side while the
 * AI pulls back with a difficulty-scaled force plus random surges.
 */

/**
 * Balance note: a tap adds TAP_IMPULSE, the AI subtracts `pull` every frame,
 * so the break-even tap rate is roughly (pull + 0.24 * surge) * 60 / TAP_IMPULSE.
 * That works out to about 4, 7 and 10 taps per second respectively — i.e. Sweet
 * is winnable at a relaxed pace and Ruthless demands genuine mashing.
 */
const DIFFICULTIES = [
  { name: 'Sweet',    pull: 0.085, surge: 0.06, label: 'they let you win' },
  { name: 'Playful',  pull: 0.145, surge: 0.12, label: 'a fair fight' },
  { name: 'Ruthless', pull: 0.200, surge: 0.20, label: 'no mercy' },
];

const ROUND_MS = 20000;
const TAP_IMPULSE = 1.5;
const FRICTION = 0.90;
const POS_GAIN = 0.18;       // converts velocity into knot travel; tuned so a
                             // decisive win takes ~7-12s rather than ~2s
const WIN_AT = 100;          // knot position range is -100..100

const WINNER_FORFEITS = [
  'Loser sends a voice note singing the chorus of their favourite song.',
  'Loser has to answer one question with total honesty — winner picks.',
  'Loser plans and pays for the next date. No appeals.',
  'Loser sends their most embarrassing camera-roll photo.',
  'Loser writes a two-line poem about the winner. Right now.',
];

export default function TugOfLoveModal({ onClose, onSendToChat }) {
  const [diff, setDiff] = useState(DIFFICULTIES[1]);
  const [phase, setPhase] = useState('ready');  // ready | playing | done
  const [knot, setKnot] = useState(0);          // -100 (them) .. 100 (you)
  const [timeLeft, setTimeLeft] = useState(ROUND_MS);
  const [taps, setTaps] = useState(0);
  const [result, setResult] = useState(null);
  const [yank, setYank] = useState(false);
  const [forfeit, setForfeit] = useState(WINNER_FORFEITS[0]);

  const rafRef = useRef(null);
  const posRef = useRef(0);
  const velRef = useRef(0);
  const startRef = useRef(0);
  const lastRef = useRef(0);

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }, []);

  useEffect(() => stop, [stop]);

  const finish = useCallback((won, pos) => {
    stop();
    setResult({ won, margin: Math.round(Math.abs(pos)) });
    setForfeit(WINNER_FORFEITS[Math.floor(Math.random() * WINNER_FORFEITS.length)]);
    setPhase('done');
  }, [stop]);

  const loop = useCallback(() => {
    const now = performance.now();
    const dt = Math.min(50, now - lastRef.current) / 16.67; // frames, capped
    lastRef.current = now;

    // AI pull: steady force toward its side, plus occasional surges
    let aiForce = diff.pull;
    if (Math.random() < 0.03) aiForce += diff.surge * 8;
    velRef.current -= aiForce * dt;

    velRef.current *= Math.pow(FRICTION, dt);
    posRef.current += velRef.current * POS_GAIN * dt;
    posRef.current = Math.max(-WIN_AT, Math.min(WIN_AT, posRef.current));
    setKnot(posRef.current);

    const remaining = ROUND_MS - (now - startRef.current);
    setTimeLeft(Math.max(0, remaining));

    if (Math.abs(posRef.current) >= WIN_AT) return finish(posRef.current > 0, posRef.current);
    if (remaining <= 0) return finish(posRef.current > 0, posRef.current);

    rafRef.current = requestAnimationFrame(loop);
  }, [diff, finish]);

  const start = () => {
    posRef.current = 0; velRef.current = 0;
    setKnot(0); setTaps(0); setTimeLeft(ROUND_MS); setResult(null);
    setPhase('playing');
    startRef.current = performance.now();
    lastRef.current = startRef.current;
    rafRef.current = requestAnimationFrame(loop);
  };

  const handleTap = () => {
    if (phase !== 'playing') return;
    velRef.current += TAP_IMPULSE;
    setTaps(t => t + 1);
    setYank(true);
    setTimeout(() => setYank(false), 90);
  };

  const send = () => {
    onSendToChat({
      type: 'tug_of_love',
      won: result.won, margin: result.margin, taps, difficulty: diff.name,
      summaryText: result.won
        ? `🪢 Tug of Love — I dragged the rope ${result.margin}% my way on ${diff.name} mode (${taps} pulls). Forfeit: ${forfeit}`
        : `🪢 Tug of Love — I lost by ${result.margin}% on ${diff.name} mode after ${taps} pulls. Rematch? Forfeit on the line: ${forfeit}`,
    });
    onClose();
  };

  const pctFromLeft = 50 + (knot / WIN_AT) * 48; // keep knot inside the track

  return (
    <div className="gs-overlay">
      <div className="gs-modal">
        <header className="gs-header">
          <h2>Tug of Love</h2>
          <button className="close-btn" onClick={() => { stop(); onClose(); }}><X size={24} /></button>
        </header>
        <p className="gs-sub">Mash to haul the rope your way before the clock runs out.</p>

        {phase === 'ready' && (
          <>
            <div className="gs-stage">
              <div className="tug-diff-list">
                {DIFFICULTIES.map(d => (
                  <button
                    key={d.name}
                    className={`tug-diff ${diff.name === d.name ? 'active' : ''}`}
                    onClick={() => setDiff(d)}
                  >
                    <strong>{d.name}</strong>
                    <span>{d.label}</span>
                  </button>
                ))}
              </div>
              <p className="tug-rules">20 seconds. Pull the knot fully to your side for an early win.</p>
            </div>
            <div className="gs-actions">
              <button className="gs-btn gs-btn-primary" onClick={start}><Play size={18} /> Start the duel</button>
            </div>
          </>
        )}

        {phase === 'playing' && (
          <>
            <div className="gs-stats">
              <div className="gs-stat">
                <span className="gs-stat-label">Time</span>
                <span className="gs-stat-value">{(timeLeft / 1000).toFixed(1)}s</span>
              </div>
              <div className="gs-stat">
                <span className="gs-stat-label">Pulls</span>
                <span className="gs-stat-value">{taps}</span>
              </div>
              <div className="gs-stat">
                <span className="gs-stat-label">Edge</span>
                <span className="gs-stat-value">{knot > 0 ? '+' : ''}{Math.round(knot)}</span>
              </div>
            </div>

            <div className="gs-stage tug-stage">
              <div className="tug-labels">
                <span className="tug-them">Them</span>
                <span className="tug-you">You</span>
              </div>

              <div className="tug-track">
                <div className="tug-centre" />
                <div className="tug-fill" style={{ width: `${Math.max(0, pctFromLeft)}%` }} />
                <div className={`tug-knot ${yank ? 'yank' : ''}`} style={{ left: `${pctFromLeft}%` }}>
                  <span role="img" aria-label="knot">💞</span>
                </div>
              </div>

              <button className={`tug-pull-btn ${yank ? 'pressed' : ''}`} onPointerDown={handleTap}>
                PULL!
              </button>
              <span className="tug-hint">tap as fast as you can</span>
            </div>
          </>
        )}

        {phase === 'done' && result && (
          <>
            <div className="gs-stage">
              <div className="gs-result">
                <div className="tug-result-emoji">{result.won ? '🏆' : '💀'}</div>
                <h3 className="gs-result-title">{result.won ? 'You won the rope!' : 'Dragged over the line'}</h3>
                <p className="gs-result-note">
                  {result.won
                    ? `Won by ${result.margin}% on ${diff.name} with ${taps} pulls.`
                    : `Lost by ${result.margin}% on ${diff.name}. ${taps} pulls was not enough.`}
                </p>
                <div className="gs-prompt-card tug-forfeit">
                  <strong>Forfeit</strong><br />{forfeit}
                </div>
              </div>
            </div>
            <div className="gs-actions">
              <button className="gs-btn gs-btn-ghost" onClick={() => setPhase('ready')}><RotateCcw size={18} /> Rematch</button>
              <button className="gs-btn gs-btn-primary" onClick={send}><Send size={18} /> Send result</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
