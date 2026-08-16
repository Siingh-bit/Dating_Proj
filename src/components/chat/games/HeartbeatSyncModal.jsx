import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, RotateCcw, Play } from 'lucide-react';
import './gameShell.css';
import './HeartbeatSyncModal.css';

/**
 * HEARTBEAT SYNC — a rhythm / timing game.
 *
 * A ring contracts toward the heart once per beat. Tap at the exact moment it
 * lands. Accuracy is measured in milliseconds of error against the beat clock,
 * so this is a real timing game rather than a multiple-choice prompt.
 */

const TOTAL_BEATS = 12;
const LEAD_IN = 1200;        // ms before the first beat lands
const WINDOWS = [            // |error| ms -> rating
  { max: 60,  label: 'PERFECT', points: 100, cls: 'perfect' },
  { max: 130, label: 'GREAT',   points: 70,  cls: 'great'   },
  { max: 220, label: 'OK',      points: 40,  cls: 'ok'      },
];
const MISS = { label: 'MISS', points: 0, cls: 'miss' };

const TEMPOS = [
  { name: 'Resting',  bpm: 75,  note: 'calm and easy' },
  { name: 'Fluttery', bpm: 105, note: 'they just walked in' },
  { name: 'Racing',   bpm: 145, note: 'first kiss energy' },
];

const verdict = (pct) => {
  if (pct >= 90) return { title: 'In perfect sync 💞', note: 'Your hearts are literally beating together. Suspicious.' };
  if (pct >= 70) return { title: 'Strong connection 💗', note: 'A beat or two apart, but you found each other.' };
  if (pct >= 45) return { title: 'Getting there 💓', note: 'Slightly out of step — that is what practice dates are for.' };
  return { title: 'Chaotic rhythm 💔', note: 'Wildly out of sync. Honestly kind of charming.' };
};

export default function HeartbeatSyncModal({ onClose, onSendToChat }) {
  const [tempo, setTempo] = useState(TEMPOS[1]);
  const [phase, setPhase] = useState('ready');   // ready | playing | done
  const [beatIndex, setBeatIndex] = useState(0); // beats already resolved
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [judgement, setJudgement] = useState(null);
  const [ringScale, setRingScale] = useState(2.4);
  const [thump, setThump] = useState(false);

  const rafRef = useRef(null);
  const startRef = useRef(0);
  const resolvedRef = useRef(0);   // beats already scored (ref: read inside rAF)
  const interval = 60000 / tempo.bpm;

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }, []);

  useEffect(() => stop, [stop]);

  const judge = useCallback((error) => {
    const w = WINDOWS.find(x => Math.abs(error) <= x.max) || MISS;
    setJudgement({ ...w, id: Math.random() });
    setScore(s => s + w.points);
    setCombo(c => {
      const next = w.points > 0 ? c + 1 : 0;
      setBestCombo(b => Math.max(b, next));
      return next;
    });
    if (w.points > 0) {
      setThump(true);
      setTimeout(() => setThump(false), 160);
    }
  }, []);

  const loop = useCallback(() => {
    const elapsed = performance.now() - startRef.current;
    const nextBeatAt = LEAD_IN + resolvedRef.current * interval;

    // Ring contracts from 2.4x down to 1.0x as the beat approaches
    const remaining = nextBeatAt - elapsed;
    const progress = Math.max(0, Math.min(1, 1 - remaining / interval));
    setRingScale(2.4 - 1.4 * progress);

    // Beat passed without a tap -> miss
    if (elapsed > nextBeatAt + WINDOWS[WINDOWS.length - 1].max) {
      resolvedRef.current += 1;
      setBeatIndex(resolvedRef.current);
      judge(9999);
      if (resolvedRef.current >= TOTAL_BEATS) {
        setPhase('done');
        return;
      }
    }
    rafRef.current = requestAnimationFrame(loop);
  }, [interval, judge]);

  const start = () => {
    resolvedRef.current = 0;
    setBeatIndex(0); setScore(0); setCombo(0); setBestCombo(0);
    setJudgement(null); setPhase('playing');
    startRef.current = performance.now();
    rafRef.current = requestAnimationFrame(loop);
  };

  const handleTap = () => {
    if (phase !== 'playing') return;
    const elapsed = performance.now() - startRef.current;
    const target = LEAD_IN + resolvedRef.current * interval;
    const error = elapsed - target;
    if (error < -interval * 0.6) return; // way too early: ignore, don't burn the beat

    resolvedRef.current += 1;
    setBeatIndex(resolvedRef.current);
    judge(error);

    if (resolvedRef.current >= TOTAL_BEATS) {
      stop();
      setPhase('done');
    }
  };

  const pct = Math.round((score / (TOTAL_BEATS * 100)) * 100);
  const v = verdict(pct);

  const send = () => {
    onSendToChat({
      type: 'heartbeat_sync',
      score, pct, bestCombo, bpm: tempo.bpm,
      summaryText: `💓 Heartbeat Sync — I hit ${pct}% sync at ${tempo.bpm} BPM (best combo ${bestCombo}). ${v.title} Your turn — can you beat me?`,
    });
    onClose();
  };

  return (
    <div className="gs-overlay">
      <div className="gs-modal">
        <header className="gs-header">
          <h2>Heartbeat Sync</h2>
          <button className="close-btn" onClick={() => { stop(); onClose(); }}><X size={24} /></button>
        </header>
        <p className="gs-sub">Tap the heart the instant the ring lands on it.</p>

        {phase === 'ready' && (
          <>
            <div className="gs-stage">
              <div className="hb-tempo-list">
                {TEMPOS.map(t => (
                  <button
                    key={t.name}
                    className={`hb-tempo ${tempo.name === t.name ? 'active' : ''}`}
                    onClick={() => setTempo(t)}
                  >
                    <span className="hb-tempo-name">{t.name}</span>
                    <span className="hb-tempo-bpm">{t.bpm} BPM</span>
                    <span className="hb-tempo-note">{t.note}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="gs-actions">
              <button className="gs-btn gs-btn-primary" onClick={start}>
                <Play size={18} /> Start {TOTAL_BEATS} beats
              </button>
            </div>
          </>
        )}

        {phase === 'playing' && (
          <>
            <div className="gs-stats">
              <div className="gs-stat">
                <span className="gs-stat-label">Beat</span>
                <span className="gs-stat-value">{Math.min(beatIndex + 1, TOTAL_BEATS)}/{TOTAL_BEATS}</span>
              </div>
              <div className="gs-stat">
                <span className="gs-stat-label">Score</span>
                <span className="gs-stat-value">{score}</span>
              </div>
              <div className="gs-stat">
                <span className="gs-stat-label">Combo</span>
                <span className="gs-stat-value">{combo}×</span>
              </div>
            </div>

            <div
              className="gs-stage hb-stage"
              onPointerDown={handleTap}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); handleTap(); } }}
            >
              <div className="hb-target" />
              <div className="hb-ring" style={{ transform: `scale(${ringScale.toFixed(3)})` }} />
              <div className={`hb-heart ${thump ? 'thump' : ''}`}>💗</div>
              {judgement && (
                <div key={judgement.id} className={`hb-judge ${judgement.cls}`}>{judgement.label}</div>
              )}
              <span className="hb-hint">tap anywhere</span>
            </div>
          </>
        )}

        {phase === 'done' && (
          <>
            <div className="gs-stage">
              <div className="gs-result">
                <div className="gs-result-score">{pct}%</div>
                <h3 className="gs-result-title">{v.title}</h3>
                <p className="gs-result-note">{v.note}</p>
                <p className="gs-result-note hb-detail">
                  {score} pts · best combo {bestCombo}× · {tempo.bpm} BPM
                </p>
              </div>
            </div>
            <div className="gs-actions">
              <button className="gs-btn gs-btn-ghost" onClick={() => setPhase('ready')}>
                <RotateCcw size={18} /> Again
              </button>
              <button className="gs-btn gs-btn-primary" onClick={send}>
                <Send size={18} /> Challenge them
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
