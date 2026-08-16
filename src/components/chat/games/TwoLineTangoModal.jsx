import React, { useState, useRef, useEffect } from 'react';
import { X, Send, RotateCcw, ArrowRight, EyeOff } from 'lucide-react';
import './gameShell.css';
import './TwoLineTangoModal.css';

/**
 * TWO-LINE TANGO — collaborative "exquisite corpse" writing.
 *
 * You take turns adding a line, but you only ever see the line immediately
 * before yours. The whole thing is revealed at the end. There is no score —
 * the output is the story itself, which gets posted to the chat.
 */

const OPENERS = [
  'They met on the last train of the night, and…',
  'Nobody warned them about the third date, which is when…',
  'It started with a text sent to completely the wrong person…',
  'The plan was one coffee. Ninety minutes later…',
  'She said she hated surprises. He decided that meant…',
  'Everything was normal until the lights went out and…',
  'Two strangers, one umbrella, and absolutely no shared language…',
  'The note tucked under the door simply read…',
];

const TOTAL_LINES = 6;   // 3 each

export default function TwoLineTangoModal({ onClose, onSendToChat }) {
  const [phase, setPhase] = useState('brief');  // brief | write | handoff | reveal
  const [opener, setOpener] = useState(() => OPENERS[Math.floor(Math.random() * OPENERS.length)]);
  const [lines, setLines] = useState([]);
  const [draft, setDraft] = useState('');

  const inputRef = useRef(null);

  useEffect(() => {
    if (phase === 'write' && inputRef.current) inputRef.current.focus();
  }, [phase]);

  const turn = lines.length;                    // 0-indexed
  const author = turn % 2 === 0 ? 'Player 1' : 'Player 2';
  const nextAuthor = (turn + 1) % 2 === 0 ? 'Player 1' : 'Player 2';
  const visible = turn === 0 ? opener : lines[turn - 1];

  const submitLine = () => {
    const text = draft.trim();
    if (!text) return;
    const next = [...lines, text];
    setLines(next);
    setDraft('');
    setPhase(next.length >= TOTAL_LINES ? 'reveal' : 'handoff');
  };

  const restart = () => {
    setOpener(OPENERS[Math.floor(Math.random() * OPENERS.length)]);
    setLines([]); setDraft(''); setPhase('brief');
  };

  const fullStory = [opener, ...lines].join('\n');

  const send = () => {
    onSendToChat({
      type: 'two_line_tango',
      lines: lines.length,
      summaryText: `📝 Two-Line Tango — we wrote this blind, one line each:\n\n${fullStory}`,
    });
    onClose();
  };

  return (
    <div className="gs-overlay">
      <div className="gs-modal">
        <header className="gs-header">
          <h2>Two-Line Tango</h2>
          <button className="close-btn" onClick={onClose}><X size={24} /></button>
        </header>

        {phase === 'brief' && (
          <>
            <p className="gs-sub">Write a story together — blind.</p>
            <div className="gs-stage">
              <ol className="tt-steps">
                <li>You each add one line at a time, taking turns.</li>
                <li>You only ever see <strong>the line directly before yours</strong>. Everything earlier stays hidden.</li>
                <li>After {TOTAL_LINES} lines the whole thing is revealed. It will not make sense. That is the point.</li>
              </ol>
              <div className="gs-prompt-card tt-opener-preview">{opener}</div>
              <button className="tt-reroll" onClick={() => setOpener(OPENERS[Math.floor(Math.random() * OPENERS.length)])}>
                <RotateCcw size={14} /> different opener
              </button>
            </div>
            <div className="gs-actions">
              <button className="gs-btn gs-btn-primary" onClick={() => setPhase('write')}>
                Player 1 starts <ArrowRight size={18} />
              </button>
            </div>
          </>
        )}

        {phase === 'write' && (
          <>
            <p className="gs-sub">{author} · line {turn + 1} of {TOTAL_LINES}</p>
            <div className="gs-stage tt-stage">
              <span className="tt-label">All you can see</span>
              <div className="gs-prompt-card tt-visible">{visible}</div>

              <div className="tt-hidden-note">
                <EyeOff size={14} />
                {turn > 1 ? `${turn - 1} earlier line${turn - 1 === 1 ? '' : 's'} hidden` : 'nothing else to see'}
              </div>

              <textarea
                ref={inputRef}
                className="tt-input"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="…continue the story in one line"
                rows={3}
                maxLength={160}
              />
              <span className="tt-count">{draft.length}/160</span>
            </div>
            <div className="gs-actions">
              <button className="gs-btn gs-btn-primary" disabled={!draft.trim()} onClick={submitLine}>
                Done <ArrowRight size={18} />
              </button>
            </div>
          </>
        )}

        {phase === 'handoff' && (
          <>
            <p className="gs-sub">Line {lines.length} of {TOTAL_LINES} written</p>
            <div className="gs-stage">
              <div className="tt-handoff">
                <div className="tt-handoff-icon">🤝</div>
                <h3 className="tt-handoff-title">Pass the phone to {nextAuthor}</h3>
                <p className="tt-handoff-note">No peeking at what came before.</p>
              </div>
            </div>
            <div className="gs-actions">
              <button className="gs-btn gs-btn-primary" onClick={() => setPhase('write')}>
                I'm {nextAuthor} <ArrowRight size={18} />
              </button>
            </div>
          </>
        )}

        {phase === 'reveal' && (
          <>
            <p className="gs-sub">Your masterpiece</p>
            <div className="tt-story">
              <p className="tt-story-line tt-story-opener">{opener}</p>
              {lines.map((l, i) => (
                <p
                  key={i}
                  className={`tt-story-line ${i % 2 === 0 ? 'p1' : 'p2'}`}
                  style={{ animationDelay: `${i * 0.16}s` }}
                >
                  {l}
                </p>
              ))}
            </div>
            <div className="gs-actions">
              <button className="gs-btn gs-btn-ghost" onClick={restart}><RotateCcw size={18} /> New story</button>
              <button className="gs-btn gs-btn-primary" onClick={send}><Send size={18} /> Post it</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
