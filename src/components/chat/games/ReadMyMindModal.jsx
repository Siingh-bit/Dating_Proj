import React, { useState, useRef, useCallback } from 'react';
import { X, Send, RotateCcw, Eye, EyeOff, ArrowRight } from 'lucide-react';
import './gameShell.css';
import './ReadMyMindModal.css';

/**
 * READ MY MIND — an analog estimation / deduction game (pass-the-phone).
 *
 * One of you gets a secret point on a spectrum between two opposites and has to
 * describe something that sits exactly there. The other drags the dial to guess.
 * Scoring is by proximity band, so this is estimation rather than multiple choice.
 */

const SPECTRUMS = [
  ['Terrible first date', 'Perfect first date'],
  ['Ice cold', 'Absolutely scorching'],
  ['Total ick', 'Instantly attractive'],
  ['Would never do it', 'Would do it tomorrow'],
  ['Guilty pleasure', 'Genuinely elite taste'],
  ['Way too soon', 'Long overdue'],
  ['Red flag', 'Green flag'],
  ['Overrated', 'Underrated'],
  ['Boring night in', 'Best night of my life'],
  ['Deeply embarrassing', 'Extremely cool'],
];

const BANDS = [
  { within: 4,  points: 4, label: 'Bullseye', note: 'You are in each other’s heads.' },
  { within: 10, points: 3, label: 'So close',  note: 'Practically telepathic.' },
  { within: 18, points: 2, label: 'Warm',      note: 'You read the room well.' },
  { within: 30, points: 1, label: 'In the area', note: 'Loosely on the same page.' },
];

const ROUNDS = 3;

export default function ReadMyMindModal({ onClose, onSendToChat }) {
  const [phase, setPhase] = useState('brief');  // brief | clue | guess | reveal | done
  const [round, setRound] = useState(1);
  const [spectrum, setSpectrum] = useState(() => SPECTRUMS[Math.floor(Math.random() * SPECTRUMS.length)]);
  const [target, setTarget] = useState(() => Math.floor(Math.random() * 101));
  const [clue, setClue] = useState('');
  const [guess, setGuess] = useState(50);
  const [total, setTotal] = useState(0);
  const [lastBand, setLastBand] = useState(null);
  const [peeking, setPeeking] = useState(false);

  const trackRef = useRef(null);
  const draggingRef = useRef(false);

  const posFromEvent = useCallback((e) => {
    const el = trackRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    return Math.round(Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)));
  }, []);

  const onDragStart = (e) => { draggingRef.current = true; const v = posFromEvent(e); if (v !== null) setGuess(v); };
  const onDragMove  = (e) => { if (!draggingRef.current) return; e.preventDefault(); const v = posFromEvent(e); if (v !== null) setGuess(v); };
  const onDragEnd   = () => { draggingRef.current = false; };

  const lockGuess = () => {
    const diff = Math.abs(guess - target);
    const band = BANDS.find(b => diff <= b.within) || { points: 0, label: 'Way off', note: 'Completely different wavelengths. Discuss.' };
    setLastBand({ ...band, diff });
    setTotal(t => t + band.points);
    setPhase('reveal');
  };

  const nextRound = () => {
    if (round >= ROUNDS) return setPhase('done');
    setRound(r => r + 1);
    setSpectrum(SPECTRUMS[Math.floor(Math.random() * SPECTRUMS.length)]);
    setTarget(Math.floor(Math.random() * 101));
    setClue(''); setGuess(50); setLastBand(null); setPeeking(false);
    setPhase('clue');
  };

  const restart = () => {
    setRound(1); setTotal(0); setClue(''); setGuess(50);
    setLastBand(null); setPeeking(false);
    setSpectrum(SPECTRUMS[Math.floor(Math.random() * SPECTRUMS.length)]);
    setTarget(Math.floor(Math.random() * 101));
    setPhase('brief');
  };

  const maxScore = ROUNDS * 4;

  const send = () => {
    onSendToChat({
      type: 'read_my_mind',
      score: total, max: maxScore,
      summaryText: `🎯 Read My Mind — we scored ${total}/${maxScore} across ${ROUNDS} rounds. ${total >= maxScore * 0.75 ? 'Frighteningly in sync.' : total >= maxScore * 0.4 ? 'Decent wavelength, room to grow.' : 'Completely different brains. Rematch?'}`,
    });
    onClose();
  };

  return (
    <div className="gs-overlay">
      <div className="gs-modal">
        <header className="gs-header">
          <h2>Read My Mind</h2>
          <button className="close-btn" onClick={onClose}><X size={24} /></button>
        </header>

        {phase === 'brief' && (
          <>
            <p className="gs-sub">A two-player game. You will pass the phone.</p>
            <div className="gs-stage">
              <ol className="rm-steps">
                <li><strong>Player 1</strong> sees a secret spot on the spectrum and types a clue that sits exactly there.</li>
                <li>Pass the phone. <strong>Player 2</strong> drags the dial to where they think the clue lands.</li>
                <li>Closer guess, more points. Three rounds, {maxScore} points on the table.</li>
              </ol>
            </div>
            <div className="gs-actions">
              <button className="gs-btn gs-btn-primary" onClick={() => setPhase('clue')}>
                Player 1, ready <ArrowRight size={18} />
              </button>
            </div>
          </>
        )}

        {phase === 'clue' && (
          <>
            <p className="gs-sub">Round {round} of {ROUNDS} · Player 1 only</p>
            <div className="gs-stage rm-stage">
              <div className="rm-ends">
                <span>{spectrum[0]}</span><span>{spectrum[1]}</span>
              </div>
              <div className="rm-track rm-track-static">
                <div className="rm-gradient" />
                {peeking && <div className="rm-target" style={{ left: `${target}%` }}><span>{target}</span></div>}
              </div>

              <button className="rm-peek" onClick={() => setPeeking(p => !p)}>
                {peeking ? <><EyeOff size={16} /> Hide it</> : <><Eye size={16} /> Reveal my secret spot</>}
              </button>

              <label className="rm-label" htmlFor="rm-clue">Your clue — something that sits exactly there</label>
              <input
                id="rm-clue"
                className="rm-input"
                value={clue}
                onChange={(e) => setClue(e.target.value)}
                placeholder="e.g. “texting back after 3 days”"
                maxLength={70}
              />
            </div>
            <div className="gs-actions">
              <button
                className="gs-btn gs-btn-primary"
                disabled={!clue.trim()}
                onClick={() => { setPeeking(false); setPhase('guess'); }}
              >
                Pass the phone <ArrowRight size={18} />
              </button>
            </div>
          </>
        )}

        {phase === 'guess' && (
          <>
            <p className="gs-sub">Round {round} of {ROUNDS} · Player 2 — where does it land?</p>
            <div className="gs-stage rm-stage">
              <div className="gs-prompt-card rm-clue-card">“{clue}”</div>

              <div className="rm-ends">
                <span>{spectrum[0]}</span><span>{spectrum[1]}</span>
              </div>
              <div
                className="rm-track"
                ref={trackRef}
                onPointerDown={onDragStart}
                onPointerMove={onDragMove}
                onPointerUp={onDragEnd}
                onPointerLeave={onDragEnd}
              >
                <div className="rm-gradient" />
                <div className="rm-dial" style={{ left: `${guess}%` }}>
                  <span className="rm-dial-value">{guess}</span>
                </div>
              </div>
              <p className="rm-drag-hint">drag anywhere on the bar</p>
            </div>
            <div className="gs-actions">
              <button className="gs-btn gs-btn-primary" onClick={lockGuess}>Lock it in</button>
            </div>
          </>
        )}

        {phase === 'reveal' && lastBand && (
          <>
            <p className="gs-sub">Round {round} of {ROUNDS}</p>
            <div className="gs-stage rm-stage">
              <div className="rm-ends">
                <span>{spectrum[0]}</span><span>{spectrum[1]}</span>
              </div>
              <div className="rm-track rm-track-static">
                <div className="rm-gradient" />
                <div className="rm-target revealed" style={{ left: `${target}%` }}><span>{target}</span></div>
                <div className="rm-dial locked" style={{ left: `${guess}%` }}><span className="rm-dial-value">{guess}</span></div>
              </div>

              <div className="gs-result rm-reveal">
                <div className="gs-result-score">+{lastBand.points}</div>
                <h3 className="gs-result-title">{lastBand.label}</h3>
                <p className="gs-result-note">{lastBand.diff} apart. {lastBand.note}</p>
                <p className="gs-result-note rm-running">Running total: {total}/{maxScore}</p>
              </div>
            </div>
            <div className="gs-actions">
              <button className="gs-btn gs-btn-primary" onClick={nextRound}>
                {round >= ROUNDS ? 'See final score' : 'Next round'} <ArrowRight size={18} />
              </button>
            </div>
          </>
        )}

        {phase === 'done' && (
          <>
            <p className="gs-sub">Final wavelength reading</p>
            <div className="gs-stage">
              <div className="gs-result">
                <div className="gs-result-score">{total}<span className="rm-of">/{maxScore}</span></div>
                <h3 className="gs-result-title">
                  {total >= maxScore * 0.75 ? 'Same brain 🧠' : total >= maxScore * 0.4 ? 'Tuned in 📡' : 'Different frequencies 📻'}
                </h3>
                <p className="gs-result-note">
                  {total >= maxScore * 0.75
                    ? 'You read each other almost perfectly. Slightly unnerving.'
                    : total >= maxScore * 0.4
                    ? 'You mostly get each other — the gaps are the interesting part.'
                    : 'You see the world completely differently. Plenty to talk about.'}
                </p>
              </div>
            </div>
            <div className="gs-actions">
              <button className="gs-btn gs-btn-ghost" onClick={restart}><RotateCcw size={18} /> Again</button>
              <button className="gs-btn gs-btn-primary" onClick={send}><Send size={18} /> Send score</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
