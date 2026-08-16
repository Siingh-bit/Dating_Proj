import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, RotateCcw, Play } from 'lucide-react';
import './gameShell.css';
import './CupidsArrowModal.css';

/**
 * CUPID'S ARROW — a drag-to-aim projectile game.
 *
 * Pull back from the bow to set angle and power, release to fire. The arrow
 * follows a real ballistic arc under gravity while the heart target drifts up
 * and down, so it is an aiming/physics game rather than a reflex or quiz one.
 */

const BOARD_W = 300;
const BOARD_H = 400;
const BOW = { x: 44, y: 320 };
const GRAVITY = 0.32;
const POWER = 0.185;         // drag pixels -> initial velocity
const MAX_DRAG = 130;
const ARROWS = 5;
const TARGET_R = 26;

const TARGET_X = 244;
const TARGET_TOP = 70;
const TARGET_BOTTOM = 300;

const rank = (hits) => {
  if (hits === ARROWS) return { title: 'Cupid himself 🏹', note: 'Five for five. Genuinely unfair.' };
  if (hits >= 3) return { title: 'Sharp shot 💘', note: 'Most arrows found their mark.' };
  if (hits >= 1) return { title: 'Got one in 🎯', note: 'Enough to count. Barely.' };
  return { title: 'Missed entirely 🍃', note: 'Every arrow sailed past. Try aiming higher.' };
};

export default function CupidsArrowModal({ onClose, onSendToChat }) {
  const [phase, setPhase] = useState('ready');   // ready | aiming | flying | done
  const [arrowsLeft, setArrowsLeft] = useState(ARROWS);
  const [hits, setHits] = useState(0);
  const [drag, setDrag] = useState(null);        // {x, y} current pointer
  const [arrow, setArrow] = useState(null);      // {x, y, angle}
  const [targetY, setTargetY] = useState(180);
  const [flash, setFlash] = useState(null);      // 'hit' | 'miss'

  const rafRef = useRef(null);
  const boardRef = useRef(null);
  const arrowRef = useRef(null);
  const targetRef = useRef({ y: 180, dir: 1, speed: 1.1 });
  const draggingRef = useRef(false);
  const arrowsLeftRef = useRef(ARROWS);   // rAF reads this; state alone would be stale

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }, []);

  useEffect(() => stop, [stop]);

  // Target keeps drifting the whole time the game is live
  const driftTarget = useCallback(() => {
    const t = targetRef.current;
    t.y += t.dir * t.speed;
    if (t.y <= TARGET_TOP) { t.y = TARGET_TOP; t.dir = 1; }
    if (t.y >= TARGET_BOTTOM) { t.y = TARGET_BOTTOM; t.dir = -1; }
    setTargetY(t.y);
  }, []);

  const idleLoop = useCallback(() => {
    driftTarget();
    rafRef.current = requestAnimationFrame(idleLoop);
  }, [driftTarget]);

  const flightLoop = useCallback(() => {
    driftTarget();
    const a = arrowRef.current;
    if (!a) return;

    a.vy += GRAVITY;
    a.x += a.vx;
    a.y += a.vy;
    a.angle = (Math.atan2(a.vy, a.vx) * 180) / Math.PI;
    setArrow({ x: a.x, y: a.y, angle: a.angle });

    const dx = a.x - TARGET_X;
    const dy = a.y - targetRef.current.y;
    const hit = Math.hypot(dx, dy) <= TARGET_R;
    const offBoard = a.x > BOARD_W + 40 || a.y > BOARD_H + 40 || a.x < -40;

    if (hit || offBoard) {
      stop();
      arrowRef.current = null;
      setArrow(null);
      if (hit) { setHits(h => h + 1); setFlash('hit'); }
      else setFlash('miss');
      setTimeout(() => setFlash(null), 700);

      arrowsLeftRef.current -= 1;
      setArrowsLeft(arrowsLeftRef.current);

      if (arrowsLeftRef.current <= 0) {
        setTimeout(() => setPhase('done'), 500);
      } else {
        setPhase('aiming');
        rafRef.current = requestAnimationFrame(idleLoop);  // target keeps drifting
      }
      return;
    }
    rafRef.current = requestAnimationFrame(flightLoop);
  }, [driftTarget, stop, idleLoop]);

  const start = () => {
    stop();
    targetRef.current = { y: 180, dir: 1, speed: 1.1 };
    arrowRef.current = null;
    arrowsLeftRef.current = ARROWS;
    setArrowsLeft(ARROWS); setHits(0); setArrow(null); setFlash(null);
    setPhase('aiming');
    rafRef.current = requestAnimationFrame(idleLoop);
  };

  const pointFromEvent = (e) => {
    const rect = boardRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onDown = (e) => {
    if (phase !== 'aiming') return;
    draggingRef.current = true;
    setDrag(pointFromEvent(e));
  };

  const onMove = (e) => {
    if (!draggingRef.current || phase !== 'aiming') return;
    e.preventDefault();
    setDrag(pointFromEvent(e));
  };

  const onUp = () => {
    if (!draggingRef.current || phase !== 'aiming' || !drag) { draggingRef.current = false; return; }
    draggingRef.current = false;

    // Slingshot: pull back from the bow, arrow launches the opposite way
    let dx = BOW.x - drag.x;
    let dy = BOW.y - drag.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 12) { setDrag(null); return; }        // taps shouldn't waste an arrow
    const clamped = Math.min(dist, MAX_DRAG);
    dx = (dx / dist) * clamped;
    dy = (dy / dist) * clamped;

    arrowRef.current = { x: BOW.x, y: BOW.y, vx: dx * POWER, vy: dy * POWER, angle: 0 };
    setDrag(null);
    setPhase('flying');
    stop();
    rafRef.current = requestAnimationFrame(flightLoop);
  };

  // Aim guide
  const aim = (() => {
    if (!drag) return null;
    let dx = BOW.x - drag.x, dy = BOW.y - drag.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 1) return null;
    const clamped = Math.min(dist, MAX_DRAG);
    return {
      power: Math.round((clamped / MAX_DRAG) * 100),
      angle: (Math.atan2(dy, dx) * 180) / Math.PI,
      tipX: BOW.x + (dx / dist) * clamped * 0.42,
      tipY: BOW.y + (dy / dist) * clamped * 0.42,
    };
  })();

  const r = rank(hits);

  const send = () => {
    onSendToChat({
      type: 'cupids_arrow',
      hits, arrows: ARROWS,
      summaryText: `🏹 Cupid's Arrow — ${hits}/${ARROWS} hits. ${r.title} Your shot.`,
    });
    onClose();
  };

  return (
    <div className="gs-overlay">
      <div className="gs-modal">
        <header className="gs-header">
          <h2>Cupid's Arrow</h2>
          <button className="close-btn" onClick={() => { stop(); onClose(); }}><X size={24} /></button>
        </header>
        <p className="gs-sub">Pull back from the bow, let go, hit the heart.</p>

        {phase === 'ready' && (
          <>
            <div className="gs-stage">
              <div className="ca-intro">
                <div className="ca-intro-icon">🏹💘</div>
                <p className="ca-intro-note">
                  Drag <strong>away</strong> from the bow to pull the string — further back means more power.
                  The arrow drops as it flies and the heart keeps moving, so lead your shot.
                  <br /><br />You get {ARROWS} arrows.
                </p>
              </div>
            </div>
            <div className="gs-actions">
              <button className="gs-btn gs-btn-primary" onClick={start}><Play size={18} /> Take aim</button>
            </div>
          </>
        )}

        {(phase === 'aiming' || phase === 'flying') && (
          <>
            <div className="gs-stats">
              <div className="gs-stat">
                <span className="gs-stat-label">Arrows</span>
                <span className="gs-stat-value">{arrowsLeft}</span>
              </div>
              <div className="gs-stat">
                <span className="gs-stat-label">Hits</span>
                <span className="gs-stat-value">{hits}</span>
              </div>
              <div className="gs-stat">
                <span className="gs-stat-label">Power</span>
                <span className="gs-stat-value">{aim ? `${aim.power}%` : '—'}</span>
              </div>
            </div>

            <div
              className="ca-board"
              ref={boardRef}
              style={{ width: BOARD_W, height: BOARD_H }}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerLeave={onUp}
            >
              <div className="ca-ground" />

              {/* aim guide */}
              {aim && (
                <>
                  <div
                    className="ca-aim"
                    style={{
                      left: BOW.x, top: BOW.y,
                      width: Math.hypot(aim.tipX - BOW.x, aim.tipY - BOW.y),
                      transform: `rotate(${aim.angle}deg)`,
                    }}
                  />
                  <div className="ca-power-bar">
                    <div className="ca-power-fill" style={{ width: `${aim.power}%` }} />
                  </div>
                </>
              )}

              <div className="ca-bow" style={{ left: BOW.x, top: BOW.y }}>🏹</div>

              <div className="ca-target" style={{ left: TARGET_X, top: targetY }}>
                <div className="ca-target-ring" />
                <span className="ca-target-heart">💘</span>
              </div>

              {arrow && (
                <div
                  className="ca-arrow"
                  style={{ left: arrow.x, top: arrow.y, transform: `translate(-50%,-50%) rotate(${arrow.angle}deg)` }}
                >
                  ➵
                </div>
              )}

              {flash && <div className={`ca-flash ${flash}`}>{flash === 'hit' ? 'HIT! 💥' : 'MISS'}</div>}

              {phase === 'aiming' && !drag && <span className="ca-hint">drag back from the bow</span>}
            </div>
          </>
        )}

        {phase === 'done' && (
          <>
            <div className="gs-stage">
              <div className="gs-result">
                <div className="gs-result-score">{hits}<span className="ca-of">/{ARROWS}</span></div>
                <h3 className="gs-result-title">{r.title}</h3>
                <p className="gs-result-note">{r.note}</p>
              </div>
            </div>
            <div className="gs-actions">
              <button className="gs-btn gs-btn-ghost" onClick={start}><RotateCcw size={18} /> Reload</button>
              <button className="gs-btn gs-btn-primary" onClick={send}><Send size={18} /> Send score</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
