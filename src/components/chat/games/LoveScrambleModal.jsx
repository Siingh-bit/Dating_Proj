import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, RotateCcw, Delete, Shuffle, Play } from 'lucide-react';
import './gameShell.css';
import './LoveScrambleModal.css';

/**
 * LOVE SCRAMBLE — a timed word-building puzzle.
 *
 * Each round uses a themed 7-letter "root" word. Any word in that round's
 * word list can be built from those letters; longer words score more, and
 * finding the full 7-letter root is worth a big bonus.
 */

const ROUNDS = [
  {
    root: 'ROMANCE',
    words: [
      'ROMANCE', 'MANOR', 'OCEAN', 'CANOE', 'CREAM', 'CRANE', 'MORE', 'CARE', 'RACE',
      'NAME', 'MEAN', 'CANE', 'CORN', 'ROAM', 'MOAN', 'ACRE', 'CAME', 'CONE', 'EARN',
      'NEAR', 'OMEN', 'MACE', 'ONCE', 'ROMAN', 'MANE', 'NORM',
      'ARM', 'CAR', 'CAN', 'MAN', 'ONE', 'EAR', 'ACE', 'ARC', 'OAR', 'RAN', 'CON', 'ORE',
    ],
  },
  {
    root: 'KISSING',
    words: [
      'KISSING', 'SKIING', 'SIGNS', 'KINGS', 'SKINS', 'SINKS', 'SIGN', 'SING', 'KING',
      'SKIN', 'SINK', 'GINS', 'KISS', 'INKS', 'SINS', 'GIN', 'SIN', 'INK', 'KIN', 'SKI', 
    ],
  },
  {
    root: 'FLIRTED',
    words: [
      'FLIRTED', 'TRIFLED', 'FILTER', 'TRIFLE', 'LIFTED', 'FIELD', 'TRIED', 'TIRED',
      'TILED', 'FIRED', 'DRIFT', 'FLIRT', 'FILET', 'RIFLE', 'TILDE', 'FLED', 'FIRE',
      'LIFT', 'DIRT', 'RIDE', 'TIDE', 'TIRE', 'FILE', 'LIED', 'DIET', 'EDIT', 'DELI',
      'RED', 'TIE', 'LIE', 'FIT', 'LIT', 'FED', 'LID', 'RID', 'FIR',
    ],
  },
  {
    root: 'DARLING',
    words: [
      'DARLING', 'LADING', 'GRAND', 'GLAND', 'DRAIN', 'GRAIN', 
      'DARN', 'DRAG', 'GIRL', 'GRID', 'LAND', 'LAID', 'RAID', 'RAIN', 'RANG', 'RING',
      'GAIN', 'NAIL', 'LIAR', 'LAIR', 'DIAL', 'GLAD', 'ARID', 'GILD', 'GIRD', 'DING',
      'AND', 'AIR', 'RID', 'RIG', 'RAG', 'LAG', 'LID', 'DIG', 'GIN', 'GAL', 'NIL', 'AID', 'RAN', 
    ],
  },
];

const canBuild = (word, root) => {
  const pool = root.split('');
  return word.split('').every(ch => {
    const i = pool.indexOf(ch);
    if (i === -1) return false;
    pool.splice(i, 1);
    return true;
  });
};

// Build the validated dictionary once, discarding anything the letters can't make.
const DICTS = ROUNDS.map(r => ({
  root: r.root,
  set: new Set(
    r.words
      .filter(w => typeof w === 'string' && w.length >= 3)
      .map(w => w.toUpperCase())
      .filter(w => canBuild(w, r.root))
  ),
}));

const scoreFor = (w) => (w.length >= 7 ? 60 : w.length >= 6 ? 30 : w.length >= 5 ? 18 : w.length >= 4 ? 10 : 5);

const ROUND_SECONDS = 60;

export default function LoveScrambleModal({ onClose, onSendToChat }) {
  const [roundIdx] = useState(() => Math.floor(Math.random() * DICTS.length));
  const dict = DICTS[roundIdx];

  const [tray, setTray] = useState(() => dict.root.split('').sort(() => Math.random() - 0.5));
  const [picked, setPicked] = useState([]);      // indices into tray
  const [found, setFound] = useState([]);
  const [score, setScore] = useState(0);
  const [left, setLeft] = useState(ROUND_SECONDS);
  const [phase, setPhase] = useState('ready');   // ready | playing | done
  const [flash, setFlash] = useState(null);      // {ok, text}

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

  const current = picked.map(i => tray[i]).join('');

  const showFlash = useCallback((ok, text) => {
    setFlash({ ok, text, id: Math.random() });
    setTimeout(() => setFlash(null), 1100);
  }, []);

  const submit = () => {
    const w = current;
    if (w.length < 3) return showFlash(false, 'Too short — 3 letters minimum');
    if (found.includes(w)) return showFlash(false, `${w} already found`);
    if (!dict.set.has(w)) return showFlash(false, `${w} is not in this round`);

    const pts = scoreFor(w);
    setFound(f => [w, ...f]);
    setScore(s => s + pts);
    showFlash(true, `${w} +${pts}${w.length === 7 ? ' — full word bonus!' : ''}`);
    setPicked([]);
  };

  const start = () => {
    setTray(dict.root.split('').sort(() => Math.random() - 0.5));
    setPicked([]); setFound([]); setScore(0); setLeft(ROUND_SECONDS);
    setPhase('playing');
  };

  const totalPossible = dict.set.size;

  const send = () => {
    onSendToChat({
      type: 'love_scramble',
      score, found: found.length, root: dict.root,
      summaryText: `🔤 Love Scramble — scored ${score} pts with ${found.length}/${totalPossible} words from ${dict.root} in 60s${found.includes(dict.root) ? ' (found the full word!)' : ''}. Your go.`,
    });
    onClose();
  };

  return (
    <div className="gs-overlay">
      <div className="gs-modal">
        <header className="gs-header">
          <h2>Love Scramble</h2>
          <button className="close-btn" onClick={onClose}><X size={24} /></button>
        </header>
        <p className="gs-sub">Sixty seconds. Build as many words as you can from the letters.</p>

        {phase === 'ready' && (
          <>
            <div className="gs-stage">
              <div className="ls-intro">
                <div className="ls-intro-root">{dict.root.split('').map((c, i) => <span key={i}>{c}</span>)}</div>
                <p className="ls-intro-note">
                  {totalPossible} words hide in these letters.<br />
                  3 letters = 5 pts · 4 = 10 · 5 = 18 · 6 = 30 · all 7 = <strong>60</strong>
                </p>
              </div>
            </div>
            <div className="gs-actions">
              <button className="gs-btn gs-btn-primary" onClick={start}><Play size={18} /> Start 60s</button>
            </div>
          </>
        )}

        {phase === 'playing' && (
          <>
            <div className="gs-stats">
              <div className="gs-stat">
                <span className="gs-stat-label">Time</span>
                <span className={`gs-stat-value ${left <= 10 ? 'ls-urgent' : ''}`}>{left}s</span>
              </div>
              <div className="gs-stat">
                <span className="gs-stat-label">Score</span>
                <span className="gs-stat-value">{score}</span>
              </div>
              <div className="gs-stat">
                <span className="gs-stat-label">Words</span>
                <span className="gs-stat-value">{found.length}</span>
              </div>
            </div>

            <div className="ls-current">
              {current || <span className="ls-placeholder">tap letters…</span>}
            </div>

            <div className="ls-flash-slot">
              {flash && <span key={flash.id} className={`ls-flash ${flash.ok ? 'ok' : 'bad'}`}>{flash.text}</span>}
            </div>

            <div className="ls-tray">
              {tray.map((ch, i) => (
                <button
                  key={i}
                  className={`ls-tile ${picked.includes(i) ? 'used' : ''}`}
                  disabled={picked.includes(i)}
                  onClick={() => setPicked(p => [...p, i])}
                >
                  {ch}
                </button>
              ))}
            </div>

            <div className="ls-controls">
              <button className="ls-ctrl" onClick={() => setPicked(p => p.slice(0, -1))} aria-label="Delete last letter">
                <Delete size={18} />
              </button>
              <button className="ls-ctrl" onClick={() => setTray(t => [...t].sort(() => Math.random() - 0.5))} aria-label="Shuffle letters">
                <Shuffle size={18} />
              </button>
              <button className="ls-ctrl ls-submit" onClick={submit} disabled={picked.length < 3}>
                Enter
              </button>
            </div>

            <div className="ls-found">
              {found.map(w => <span key={w} className="ls-found-chip">{w}</span>)}
            </div>
          </>
        )}

        {phase === 'done' && (
          <>
            <div className="gs-stage">
              <div className="gs-result">
                <div className="gs-result-score">{score}</div>
                <h3 className="gs-result-title">
                  {found.includes(dict.root) ? 'Cracked the whole word!' : found.length >= 8 ? 'Word machine' : 'Time!'}
                </h3>
                <p className="gs-result-note">
                  {found.length} of {totalPossible} words hidden in <strong>{dict.root}</strong>.
                </p>
                <div className="ls-found ls-found-final">
                  {found.map(w => <span key={w} className="ls-found-chip">{w}</span>)}
                </div>
              </div>
            </div>
            <div className="gs-actions">
              <button className="gs-btn gs-btn-ghost" onClick={start}><RotateCcw size={18} /> Play again</button>
              <button className="gs-btn gs-btn-primary" onClick={send}><Send size={18} /> Send score</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
