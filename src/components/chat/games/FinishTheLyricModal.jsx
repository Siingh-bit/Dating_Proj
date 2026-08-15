import React, { useState } from 'react';
import { X, Send, Music } from 'lucide-react';
import './FinishTheLyricModal.css';

const SONGS = [
  {
    id: 1,
    line: "All of me loves all of",
    options: ["you", "this", "us", "it"],
    answer: "you"
  },
  {
    id: 2,
    line: "I will always love",
    options: ["him", "her", "you", "them"],
    answer: "you"
  },
  {
    id: 3,
    line: "You're the one that I",
    options: ["need", "want", "love", "see"],
    answer: "want"
  },
  {
    id: 4,
    line: "Never gonna give you",
    options: ["away", "out", "up", "down"],
    answer: "up"
  },
  {
    id: 5,
    line: "Can't help falling in love with",
    options: ["you", "me", "this", "us"],
    answer: "you"
  }
];

export default function FinishTheLyricModal({ onClose, onSendToChat }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isFinished, setIsFinished] = useState(false);

  const handleSelect = (option) => {
    const newAnswers = { ...answers, [currentIndex]: option };
    setAnswers(newAnswers);

    if (currentIndex < SONGS.length - 1) {
      setTimeout(() => setCurrentIndex(currentIndex + 1), 300);
    } else {
      setTimeout(() => setIsFinished(true), 300);
    }
  };

  const currentSong = SONGS[currentIndex];
  
  const score = SONGS.reduce((acc, song, idx) => {
    return acc + (answers[idx] === song.answer ? 1 : 0);
  }, 0);

  const handleSend = () => {
    onSendToChat({ 
      type: 'finish_lyric', 
      score, 
      total: SONGS.length,
      summaryText: `🎵 Scored ${score}/${SONGS.length} on Finish the Lyric!`
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content lyric-modal animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="lyric-title">
            <Music size={20} className="accent-icon" />
            <h3>Finish The Lyric</h3>
          </div>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        {!isFinished ? (
          <div className="lyric-gameplay">
            <div className="lyric-progress">
              {SONGS.map((_, idx) => (
                <div key={idx} className={`progress-dot ${idx <= currentIndex ? 'active' : ''}`} />
              ))}
            </div>
            
            <div className="lyric-card">
              <p className="lyric-prompt">"{currentSong.line} ___"</p>
              
              <div className="lyric-options">
                {currentSong.options.map((opt, idx) => (
                  <button 
                    key={idx}
                    className={`lyric-option-btn ${answers[currentIndex] === opt ? 'selected' : ''}`}
                    onClick={() => handleSelect(opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="lyric-results">
            <div className="lyric-score">
              <span className="score-number">{score}</span>
              <span className="score-total">/ {SONGS.length}</span>
            </div>
            <p className="score-text">
              {score === SONGS.length ? "Perfect Pitch! 🎶" : score >= 3 ? "Not bad! 🎤" : "Needs some tuning! 📻"}
            </p>
            <button className="btn-primary full-width" onClick={handleSend}>
              <Send size={18} /> Share Score in Chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
