import React, { useState } from 'react';
import { X, HelpCircle, Trophy, Send, Sparkles } from 'lucide-react';
import './EmojiDecoderModal.css';

const PUZZLES = [
  { emoji: "🚢🧊🥶", answer: "Titanic", hint: "Movie", category: "Movie" },
  { emoji: "🍷🕯️🍝", answer: "Candlelight Dinner", hint: "Romantic Activity", category: "Activity" },
  { emoji: "🦁👑🌅", answer: "The Lion King", hint: "Animated Movie", category: "Movie" },
  { emoji: "💃🕺✨", answer: "La La Land", hint: "Musical Movie", category: "Movie" },
  { emoji: "🥐☕🗼", answer: "Trip to Paris", hint: "Vacation", category: "Travel" },
  { emoji: "🍿🎬🕶️", answer: "Movie Night", hint: "Date Idea", category: "Activity" },
  { emoji: "🍎🗽🚕", answer: "New York", hint: "City", category: "Travel" },
  { emoji: "🦇👨🃏", answer: "Batman", hint: "Superhero Movie", category: "Movie" }
];

export default function EmojiDecoderModal({ onClose, onSendToChat }) {
  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [guess, setGuess] = useState('');
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong'
  const [isFinished, setIsFinished] = useState(false);
  const [puzzlesSolved, setPuzzlesSolved] = useState(0);

  const handleCheckAnswer = () => {
    if (!guess.trim()) return;

    const isCorrect = guess.toLowerCase().trim() === PUZZLES[currentPuzzle].answer.toLowerCase();
    
    if (isCorrect) {
      setFeedback('correct');
      setScore(prev => prev + 10);
      setPuzzlesSolved(prev => prev + 1);
      
      setTimeout(() => {
        if (currentPuzzle < PUZZLES.length - 1) {
          setCurrentPuzzle(prev => prev + 1);
          setGuess('');
          setShowHint(false);
          setFeedback(null);
        } else {
          setIsFinished(true);
        }
      }, 1500);
    } else {
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 1500);
    }
  };

  const handleSkip = () => {
    if (currentPuzzle < PUZZLES.length - 1) {
      setCurrentPuzzle(prev => prev + 1);
      setGuess('');
      setShowHint(false);
      setFeedback(null);
    } else {
      setIsFinished(true);
    }
  };

  const handleShare = () => {
    if (onSendToChat) {
      onSendToChat({ type: 'emoji_decoder', score, puzzlesSolved });
    }
    onClose();
  };

  return (
    <div className="game-modal-overlay">
      <div className="game-modal-content emoji-modal">
        <button className="game-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        {!isFinished ? (
          <>
            <div className="emoji-header">
              <div className="score-badge">
                <Trophy size={16} />
                <span>{score} pts</span>
              </div>
              <p>Puzzle {currentPuzzle + 1} of {PUZZLES.length}</p>
            </div>

            <div className="emoji-puzzle-container">
              <div className={`emoji-display ${feedback ? feedback : ''}`}>
                {PUZZLES[currentPuzzle].emoji}
              </div>

              {showHint && (
                <div className="emoji-hint">
                  <span className="hint-label">Category:</span> {PUZZLES[currentPuzzle].category}
                </div>
              )}

              <div className="emoji-input-group">
                <input
                  type="text"
                  className="emoji-input"
                  placeholder="Type your guess..."
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCheckAnswer()}
                  disabled={feedback === 'correct'}
                />
              </div>

              {feedback === 'wrong' && <div className="feedback-message wrong">Not quite right! Try again.</div>}
              {feedback === 'correct' && <div className="feedback-message correct">Spot on! +10 pts</div>}

              <div className="emoji-actions">
                <button 
                  className="hint-btn"
                  onClick={() => setShowHint(true)}
                  disabled={showHint || feedback === 'correct'}
                >
                  <HelpCircle size={16} />
                  Hint
                </button>
                <button 
                  className="check-btn"
                  onClick={handleCheckAnswer}
                  disabled={!guess.trim() || feedback === 'correct'}
                >
                  Check Answer
                </button>
              </div>
              
              <button className="skip-btn" onClick={handleSkip} disabled={feedback === 'correct'}>
                Skip Puzzle
              </button>
            </div>
          </>
        ) : (
          <div className="emoji-results">
            <div className="results-icon-container">
              <Sparkles className="results-sparkles" size={48} />
            </div>
            <h2>Game Complete!</h2>
            
            <div className="score-summary">
              <div className="score-box">
                <span className="score-label">Final Score</span>
                <span className="score-value">{score}</span>
              </div>
              <div className="score-box">
                <span className="score-label">Solved</span>
                <span className="score-value">{puzzlesSolved}/{PUZZLES.length}</span>
              </div>
            </div>

            <button className="share-results-btn" onClick={handleShare}>
              <Send size={18} />
              Share Score to Chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
