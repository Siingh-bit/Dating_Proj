import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, RotateCcw, Play } from 'lucide-react';
import './gameShell.css';
import './HotPotatoModal.css';

/**
 * HOT POTATO CONFESSIONS — a suspense / party game.
 *
 * A hidden fuse burns for a random 10–28 seconds. Whoever is holding the phone
 * when it blows does the forfeit. Nobody can see the clock, so the tension is
 * the mechanic — the heat, pulse and sound cues escalate as the fuse burns down.
 */

const MIN_MS = 10000;
const MAX_MS = 28000;

const FORFEITS = [
  'Confess the most embarrassing thing in your search history.',
  'Say the nicest thing you have ever thought about them but never said out loud.',
  'Describe your worst ever date in exactly ten words.',
  'Send the last photo you took, no explanation, no context.',
  'Admit which of their habits you find secretly adorable.',
  'Reveal the first thing you thought when you saw their profile.',
  'Tell them a story you have never told anyone else.',
  'Rate your own flirting out of ten and then defend the score.',
  'Name one thing you would change about your first conversation.',
  'Do your best impression of them. Right now. Out loud.',
];

const HOLDERS = ['You', 'Them'];

export default function HotPotatoModal({ onClose, onSendToChat }) {
  const [phase, setPhase] = useState('ready');   // ready | playing | boom
  const [holder, setHolder] = useState(0);
  const [passes, setPasses] = useState(0);
  const [heat, setHeat] = useState(0);           // 0..1, drives the visuals
  const [forfeit, setForfeit] = useState(FORFEITS[0]);
  const [loser, setLoser] = useState(null);

  const rafRef = useRef(null);
  const fuseRef = useRef(0);
  const startRef = useRef(0);
  const holderRef = useRef(0);

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }, []);

  useEffect(() => stop, [stop]);

  const loop = useCallback(() => {
    const elapsed = performance.now() - startRef.current;
    const p = Math.min(1, elapsed / fuseRef.current);
    setHeat(p);

    if (p >= 1) {
      stop();
      setLoser(HOLDERS[holderRef.current]);
      setForfeit(FORFEITS[Math.floor(Math.random() * FORFEITS.length)]);
      setPhase('boom');
      if (navigator.vibrate) navigator.vibrate([90, 60, 200]);
      return;
    }
    rafRef.current = requestAnimationFrame(loop);
  }, [stop]);

  const start = () => {
    fuseRef.current = MIN_MS + Math.random() * (MAX_MS - MIN_MS);
    startRef.current = performance.now();
    holderRef.current = 0;
    setHolder(0); setPasses(0); setHeat(0); setLoser(null);
    setPhase('playing');
    stop();
    rafRef.current = requestAnimationFrame(loop);
  };

  const pass = () => {
    if (phase !== 'playing') return;
    holderRef.current = holderRef.current === 0 ? 1 : 0;
    setHolder(holderRef.current);
    setPasses(p => p + 1);
    if (navigator.vibrate) navigator.vibrate(25);
  };

  const send = () => {
    onSendToChat({
      type: 'hot_potato',
      loser, passes,
      summaryText: `🥔💥 Hot Potato — it blew up after ${passes} pass${passes === 1 ? '' : 'es'} and ${loser === 'You' ? 'I' : 'you'} got caught holding it. Forfeit: ${forfeit}`,
    });
    onClose();
  };

  // Visual escalation — the last third gets noticeably frantic
  const stage = heat < 0.4 ? 'cool' : heat < 0.7 ? 'warm' : heat < 0.9 ? 'hot' : 'critical';
  const pulseMs = Math.max(180, 900 - heat * 760);

  return (
    <div className="gs-overlay">
      <div className="gs-modal">
        <header className="gs-header">
          <h2>Hot Potato</h2>
          <button className="close-btn" onClick={() => { stop(); onClose(); }}><X size={24} /></button>
        </header>
        <p className="gs-sub">A hidden fuse. Pass fast — whoever holds it when it blows pays.</p>

        {phase === 'ready' && (
          <>
            <div className="gs-stage">
              <div className="hp-intro">
                <div className="hp-potato hp-idle">🥔</div>
                <p className="hp-intro-note">
                  The timer is hidden and random — somewhere between 10 and 28 seconds.
                  Hand the phone back and forth and hit <strong>Passed it!</strong> each time.
                  Whoever is holding it at the bang does the forfeit.
                </p>
              </div>
            </div>
            <div className="gs-actions">
              <button className="gs-btn gs-btn-primary" onClick={start}><Play size={18} /> Light the fuse</button>
            </div>
          </>
        )}

        {phase === 'playing' && (
          <>
            <div className={`gs-stage hp-stage stage-${stage}`}>
              <div className="hp-holder">
                <span className="hp-holder-label">Currently holding</span>
                <span className="hp-holder-name">{HOLDERS[holder]}</span>
              </div>

              <div
                className={`hp-potato stage-${stage}`}
                style={{ animationDuration: `${pulseMs}ms` }}
              >
                🥔
              </div>

              <div className="hp-sparks">
                {stage === 'critical' ? '💥 💥 💥' : stage === 'hot' ? '🔥 🔥' : stage === 'warm' ? '🔥' : '　'}
              </div>

              <p className="hp-status">
                {stage === 'critical' ? 'ANY SECOND NOW' : stage === 'hot' ? 'It is getting hot…' : stage === 'warm' ? 'Warming up' : 'Nice and cool… for now'}
              </p>

              <div className="hp-passes">{passes} pass{passes === 1 ? '' : 'es'}</div>
            </div>

            <div className="gs-actions">
              <button className={`gs-btn gs-btn-primary hp-pass-btn stage-${stage}`} onClick={pass}>
                Passed it! →
              </button>
            </div>
          </>
        )}

        {phase === 'boom' && (
          <>
            <div className="gs-stage">
              <div className="gs-result">
                <div className="hp-boom">💥</div>
                <h3 className="gs-result-title">{loser === 'You' ? 'You were holding it!' : 'They were holding it!'}</h3>
                <p className="gs-result-note">Survived {passes} pass{passes === 1 ? '' : 'es'} before it went off.</p>
                <div className="gs-prompt-card hp-forfeit">
                  <strong>Forfeit</strong><br />{forfeit}
                </div>
              </div>
            </div>
            <div className="gs-actions">
              <button className="gs-btn gs-btn-ghost" onClick={start}><RotateCcw size={18} /> Again</button>
              <button className="gs-btn gs-btn-primary" onClick={send}><Send size={18} /> Send forfeit</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
