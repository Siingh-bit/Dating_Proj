import React, { useState } from 'react';
import { X, Send, RotateCcw, ArrowRight, Coins } from 'lucide-react';
import './gameShell.css';
import './LoveBetsModal.css';

/**
 * LOVE BETS — a wagering / prediction game.
 *
 * You stake chips on what you think your partner will say, then they reveal the
 * truth and the bet settles. Because the stake is yours to choose, confidence
 * costs something — which is the actual mechanic here, not the questions.
 */

const STARTING_CHIPS = 100;
const ROUNDS = 5;

const QUESTIONS = [
  { q: 'Would they rather cancel plans or go out?', a: 'Cancel, obviously', b: 'Go out' },
  { q: 'Do they text back within five minutes?', a: 'Almost always', b: 'Eventually…' },
  { q: 'Beach holiday or mountain cabin?', a: 'Beach', b: 'Mountains' },
  { q: 'Would they ever go skydiving?', a: 'Absolutely', b: 'Never' },
  { q: 'Do they sing in the shower?', a: 'Every time', b: 'Never' },
  { q: 'Horror film or rom-com on a night in?', a: 'Horror', b: 'Rom-com' },
  { q: 'Are they early or late to everything?', a: 'Weirdly early', b: 'Chronically late' },
  { q: 'Would they move abroad for the right person?', a: 'In a heartbeat', b: 'Not a chance' },
  { q: 'Big group party or dinner with two friends?', a: 'Big party', b: 'Small dinner' },
  { q: 'Do they read the reviews before ordering food?', a: 'Every single one', b: 'Just point and hope' },
];

const pickQuestions = () => {
  const pool = [...QUESTIONS];
  const out = [];
  while (out.length < ROUNDS && pool.length) {
    out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  }
  return out;
};

const STAKES = [5, 10, 25, 50];

const verdict = (chips) => {
  if (chips >= STARTING_CHIPS * 2) return { title: 'You know them cold 🃏', note: 'You doubled up. Slightly frightening.' };
  if (chips > STARTING_CHIPS) return { title: 'Up on the night 💰', note: 'You read them well more often than not.' };
  if (chips === STARTING_CHIPS) return { title: 'Broke even 😐', note: 'Every win cancelled by a wrong call.' };
  if (chips > 0) return { title: 'Down but alive 📉', note: 'You are still learning how they think.' };
  return { title: 'Cleaned out 💸', note: 'Bankrupt. Maybe ask more questions before betting.' };
};

export default function LoveBetsModal({ onClose, onSendToChat }) {
  const [questions, setQuestions] = useState(pickQuestions);
  const [round, setRound] = useState(0);
  const [chips, setChips] = useState(STARTING_CHIPS);
  const [phase, setPhase] = useState('brief');   // brief | bet | reveal | settle | done
  const [choice, setChoice] = useState(null);    // 'a' | 'b'
  const [stake, setStake] = useState(10);
  const [truth, setTruth] = useState(null);
  const [history, setHistory] = useState([]);

  const q = questions[round];
  const maxStake = Math.min(50, chips);
  const availableStakes = STAKES.filter(s => s <= chips);

  const lockBet = () => {
    if (!choice) return;
    setStake(s => Math.min(s, chips));
    setPhase('reveal');
  };

  const revealTruth = (answer) => {
    setTruth(answer);
    const won = answer === choice;
    const delta = won ? stake : -stake;
    setChips(c => c + delta);
    setHistory(h => [...h, { q: q.q, won, delta }]);
    setPhase('settle');
  };

  const nextRound = () => {
    const nextIdx = round + 1;
    if (nextIdx >= ROUNDS || chips <= 0) return setPhase('done');
    setRound(nextIdx);
    setChoice(null);
    setStake(Math.min(10, chips));
    setTruth(null);
    setPhase('bet');
  };

  const restart = () => {
    setQuestions(pickQuestions());
    setRound(0); setChips(STARTING_CHIPS); setChoice(null);
    setStake(10); setTruth(null); setHistory([]);
    setPhase('brief');
  };

  const v = verdict(chips);
  const net = chips - STARTING_CHIPS;

  const send = () => {
    const wins = history.filter(h => h.won).length;
    onSendToChat({
      type: 'love_bets',
      chips, net, wins,
      summaryText: `🃏 Love Bets — I bet on how well I know you and finished with ${chips} chips (${net >= 0 ? '+' : ''}${net}), calling ${wins}/${history.length} right. ${v.title} Your turn to bet on me.`,
    });
    onClose();
  };

  return (
    <div className="gs-overlay">
      <div className="gs-modal">
        <header className="gs-header">
          <h2>Love Bets</h2>
          <button className="close-btn" onClick={onClose}><X size={24} /></button>
        </header>

        {phase === 'brief' && (
          <>
            <p className="gs-sub">Stake chips on how well you know them.</p>
            <div className="gs-stage">
              <div className="lb-chips-hero">
                <Coins size={44} />
                <span className="lb-chips-hero-value">{STARTING_CHIPS}</span>
              </div>
              <ol className="lb-steps">
                <li>You predict their answer and choose how much to stake on it.</li>
                <li>Pass the phone — <strong>they</strong> tap their real answer.</li>
                <li>Right call wins your stake, wrong call loses it. {ROUNDS} rounds.</li>
              </ol>
            </div>
            <div className="gs-actions">
              <button className="gs-btn gs-btn-primary" onClick={() => setPhase('bet')}>
                Place first bet <ArrowRight size={18} />
              </button>
            </div>
          </>
        )}

        {phase !== 'brief' && phase !== 'done' && (
          <div className="gs-stats">
            <div className="gs-stat">
              <span className="gs-stat-label">Chips</span>
              <span className="gs-stat-value">{chips}</span>
            </div>
            <div className="gs-stat">
              <span className="gs-stat-label">Round</span>
              <span className="gs-stat-value">{round + 1}/{ROUNDS}</span>
            </div>
            <div className="gs-stat">
              <span className="gs-stat-label">Stake</span>
              <span className="gs-stat-value">{stake}</span>
            </div>
          </div>
        )}

        {phase === 'bet' && (
          <>
            <div className="gs-stage lb-stage">
              <div className="gs-prompt-card lb-question">{q.q}</div>

              <span className="lb-label">Your prediction</span>
              <div className="lb-options">
                <button className={`lb-option ${choice === 'a' ? 'picked' : ''}`} onClick={() => setChoice('a')}>{q.a}</button>
                <button className={`lb-option ${choice === 'b' ? 'picked' : ''}`} onClick={() => setChoice('b')}>{q.b}</button>
              </div>

              <span className="lb-label">How confident are you?</span>
              <div className="lb-stakes">
                {availableStakes.map(s => (
                  <button key={s} className={`lb-stake ${stake === s ? 'picked' : ''}`} onClick={() => setStake(s)}>
                    {s}
                  </button>
                ))}
                <button
                  className={`lb-stake lb-allin ${stake === chips ? 'picked' : ''}`}
                  onClick={() => setStake(chips)}
                >
                  All in
                </button>
              </div>
              <p className="lb-risk">
                Risking <strong>{Math.min(stake, chips)}</strong> of {chips} chips
                {maxStake < 50 && chips > 0 ? ' (low on chips)' : ''}
              </p>
            </div>
            <div className="gs-actions">
              <button className="gs-btn gs-btn-primary" disabled={!choice} onClick={lockBet}>
                Lock the bet <ArrowRight size={18} />
              </button>
            </div>
          </>
        )}

        {phase === 'reveal' && (
          <>
            <p className="gs-sub">Pass the phone — their turn to answer honestly</p>
            <div className="gs-stage lb-stage">
              <div className="gs-prompt-card lb-question">{q.q}</div>
              <span className="lb-label">Tap your real answer</span>
              <div className="lb-options">
                <button className="lb-option" onClick={() => revealTruth('a')}>{q.a}</button>
                <button className="lb-option" onClick={() => revealTruth('b')}>{q.b}</button>
              </div>
              <p className="lb-secret">Their prediction is hidden until you choose.</p>
            </div>
          </>
        )}

        {phase === 'settle' && (
          <>
            <div className="gs-stage">
              <div className="gs-result">
                <div className={`lb-settle-amount ${truth === choice ? 'win' : 'lose'}`}>
                  {truth === choice ? '+' : '−'}{stake}
                </div>
                <h3 className="gs-result-title">{truth === choice ? 'Called it! 🎯' : 'Wrong read 😬'}</h3>
                <p className="gs-result-note">
                  They said <strong>“{truth === 'a' ? q.a : q.b}”</strong>.
                  {truth === choice ? ' Exactly what you predicted.' : ` You backed “${choice === 'a' ? q.a : q.b}”.`}
                </p>
                <p className="gs-result-note lb-balance">Balance: {chips} chips</p>
              </div>
            </div>
            <div className="gs-actions">
              <button className="gs-btn gs-btn-primary" onClick={nextRound}>
                {round + 1 >= ROUNDS || chips <= 0 ? 'Cash out' : 'Next bet'} <ArrowRight size={18} />
              </button>
            </div>
          </>
        )}

        {phase === 'done' && (
          <>
            <p className="gs-sub">Final chip count</p>
            <div className="gs-stage">
              <div className="gs-result">
                <div className="gs-result-score">{chips}</div>
                <h3 className="gs-result-title">{v.title}</h3>
                <p className="gs-result-note">{v.note}</p>
                <p className={`lb-net ${net >= 0 ? 'win' : 'lose'}`}>
                  {net >= 0 ? '+' : ''}{net} chips
                </p>
                <div className="lb-history">
                  {history.map((h, i) => (
                    <div key={i} className={`lb-history-row ${h.won ? 'win' : 'lose'}`}>
                      <span className="lb-history-q">{h.q}</span>
                      <span className="lb-history-d">{h.delta >= 0 ? '+' : ''}{h.delta}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="gs-actions">
              <button className="gs-btn gs-btn-ghost" onClick={restart}><RotateCcw size={18} /> New game</button>
              <button className="gs-btn gs-btn-primary" onClick={send}><Send size={18} /> Send result</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
