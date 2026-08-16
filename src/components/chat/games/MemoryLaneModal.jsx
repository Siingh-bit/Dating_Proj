import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, RotateCcw } from 'lucide-react';
import './gameShell.css';
import './MemoryLaneModal.css';

/**
 * MEMORY LANE — a concentration / memory game.
 *
 * Standard match-two mechanics, except every matched pair unlocks a question
 * about the two of you. Finish the board and you finish with eight prompts
 * to work through together.
 */

const PAIRS = [
  { emoji: '🍕', prompt: 'What food would you two happily eat every day for a month?' },
  { emoji: '🎬', prompt: 'Name a film you could both quote from memory.' },
  { emoji: '✈️', prompt: 'One flight, anywhere, leaving tonight — where are you going?' },
  { emoji: '🎵', prompt: 'Which song should be playing in the background right now?' },
  { emoji: '☕', prompt: 'Describe your ideal lazy morning together in one sentence.' },
  { emoji: '🌧️', prompt: 'It rains all weekend. What is the plan?' },
  { emoji: '🐶', prompt: 'You adopt a pet together. What is its name?' },
  { emoji: '🔥', prompt: 'What is something you find unexpectedly attractive?' },
];

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const buildDeck = () =>
  shuffle(
    PAIRS.flatMap((p, i) => [
      { id: `${i}a`, pairId: i, emoji: p.emoji },
      { id: `${i}b`, pairId: i, emoji: p.emoji },
    ])
  );

const rating = (moves) => {
  if (moves <= 12) return { stars: '⭐⭐⭐', title: 'Photographic memory' };
  if (moves <= 18) return { stars: '⭐⭐', title: 'Sharp eyes' };
  return { stars: '⭐', title: 'Got there in the end' };
};

export default function MemoryLaneModal({ onClose, onSendToChat }) {
  const [deck, setDeck] = useState(buildDeck);
  const [flipped, setFlipped] = useState([]);   // ids currently face up (max 2)
  const [matched, setMatched] = useState([]);   // pairIds solved
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [revealed, setRevealed] = useState(null); // prompt shown after a match
  const [busy, setBusy] = useState(false);

  const timerRef = useRef(null);
  const done = matched.length === PAIRS.length;

  useEffect(() => {
    if (done) return;
    timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [done]);

  const reset = useCallback(() => {
    setDeck(buildDeck());
    setFlipped([]); setMatched([]); setMoves(0);
    setSeconds(0); setRevealed(null); setBusy(false);
  }, []);

  const handleFlip = (card) => {
    if (busy || flipped.includes(card.id) || matched.includes(card.pairId)) return;
    if (flipped.length === 2) return;

    const next = [...flipped, card.id];
    setFlipped(next);
    if (next.length < 2) return;

    setMoves(m => m + 1);
    const [aId, bId] = next;
    const a = deck.find(c => c.id === aId);
    const b = deck.find(c => c.id === bId);

    if (a.pairId === b.pairId) {
      setMatched(m => [...m, a.pairId]);
      setRevealed(PAIRS[a.pairId]);
      setFlipped([]);
    } else {
      setBusy(true);
      setTimeout(() => { setFlipped([]); setBusy(false); }, 750);
    }
  };

  const r = rating(moves);
  const mmss = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

  const send = () => {
    onSendToChat({
      type: 'memory_lane',
      moves, seconds,
      summaryText: `🃏 Memory Lane — cleared the board in ${moves} moves and ${mmss}. ${r.stars} ${r.title}. Beat that, then answer these: ${PAIRS.slice(0, 3).map(p => p.prompt).join(' ')}`,
    });
    onClose();
  };

  return (
    <div className="gs-overlay">
      <div className="gs-modal">
        <header className="gs-header">
          <h2>Memory Lane</h2>
          <button className="close-btn" onClick={onClose}><X size={24} /></button>
        </header>
        <p className="gs-sub">Match a pair, unlock a question about the two of you.</p>

        <div className="gs-stats">
          <div className="gs-stat">
            <span className="gs-stat-label">Moves</span>
            <span className="gs-stat-value">{moves}</span>
          </div>
          <div className="gs-stat">
            <span className="gs-stat-label">Time</span>
            <span className="gs-stat-value">{mmss}</span>
          </div>
          <div className="gs-stat">
            <span className="gs-stat-label">Found</span>
            <span className="gs-stat-value">{matched.length}/{PAIRS.length}</span>
          </div>
        </div>

        {!done ? (
          <>
            <div className="ml-grid">
              {deck.map(card => {
                const isUp = flipped.includes(card.id) || matched.includes(card.pairId);
                return (
                  <button
                    key={card.id}
                    className={`ml-card ${isUp ? 'up' : ''} ${matched.includes(card.pairId) ? 'solved' : ''}`}
                    onClick={() => handleFlip(card)}
                    aria-label={isUp ? card.emoji : 'Hidden card'}
                  >
                    <span className="ml-face ml-back" />
                    <span className="ml-face ml-front">{card.emoji}</span>
                  </button>
                );
              })}
            </div>

            <div className="ml-prompt-slot">
              {revealed ? (
                <div key={revealed.emoji} className="gs-prompt-card">
                  <span className="ml-prompt-emoji">{revealed.emoji}</span> {revealed.prompt}
                </div>
              ) : (
                <p className="ml-prompt-empty">Match a pair to reveal a question…</p>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="gs-stage">
              <div className="gs-result">
                <div className="ml-stars">{r.stars}</div>
                <h3 className="gs-result-title">{r.title}</h3>
                <p className="gs-result-note">Board cleared in <strong>{moves} moves</strong> and <strong>{mmss}</strong>.</p>
                <p className="gs-result-note ml-unlocked">All 8 questions unlocked — work through them together.</p>
              </div>
            </div>
            <div className="gs-actions">
              <button className="gs-btn gs-btn-ghost" onClick={reset}><RotateCcw size={18} /> Shuffle again</button>
              <button className="gs-btn gs-btn-primary" onClick={send}><Send size={18} /> Send score</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
