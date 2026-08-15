import React, { useState } from 'react';
import { X, Heart, ChevronRight, Share2 } from 'lucide-react';
import './WouldYouRatherModal.css';

const QUESTIONS = [
  { id: 1, optionA: "Sunset beach picnic", optionB: "Cozy rooftop candlelit dinner" },
  { id: 2, optionA: "Spontaneous weekend roadtrip", optionB: "5-star luxury staycation" },
  { id: 3, optionA: "Cook a gourmet dinner together at home", optionB: "Try a new fancy restaurant every week" },
  { id: 4, optionA: "Binge-watch a full series in pajamas", optionB: "All-night music festival & dancing" },
  { id: 5, optionA: "Partner who makes you laugh until you cry", optionB: "Partner who listens to your deep late-night thoughts" },
  { id: 6, optionA: "Morning coffee in bed", optionB: "Late night stargazing with hot cocoa" },
  { id: 7, optionA: "Never have to do dishes again", optionB: "Never have to fold laundry again" },
  { id: 8, optionA: "Travel the world for a year in a campervan", optionB: "Buy our dream home with a garden" },
  { id: 9, optionA: "Surprise date planned entirely by your partner", optionB: "Planning a dream date together step-by-step" },
  { id: 10, optionA: "Whisper secrets in a quiet library", optionB: "Sing duet karaoke at a crowded bar" }
];

export default function WouldYouRatherModal({ onClose, onSendToChat }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [matchScore, setMatchScore] = useState(null);

  const currentQ = QUESTIONS[currentIndex];

  const handleSelect = (option) => {
    setSelectedOption(option);
    const match = Math.floor(75 + Math.random() * 21);
    setMatchScore(match);
  };

  const handleNext = () => {
    setSelectedOption(null);
    setMatchScore(null);
    setCurrentIndex((prev) => (prev + 1) % QUESTIONS.length);
  };

  const handleShare = () => {
    if (!selectedOption) return;
    const choiceText = selectedOption === 'A' ? currentQ.optionA : currentQ.optionB;
    onSendToChat({
      type: 'would_you_rather',
      question: `Would You Rather: ${currentQ.optionA} OR ${currentQ.optionB}?`,
      userChoice: choiceText,
      matchPercentage: matchScore,
      summaryText: `⚖️ Would You Rather: I picked "${choiceText}"! (${matchScore}% Match)`
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content bottom-sheet wyr-modal animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="sheet-header">
          <div className="game-title-badge">
            <span>⚖️</span> Would You Rather?
          </div>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="wyr-body">
          <div className="question-counter">Question {currentIndex + 1} of {QUESTIONS.length}</div>
          
          <div className="options-container">
            <button 
              className={`option-card option-a ${selectedOption === 'A' ? 'selected' : ''}`}
              onClick={() => handleSelect('A')}
            >
              <span className="option-tag">Option A</span>
              <span className="option-text">{currentQ.optionA}</span>
              {selectedOption === 'A' && <span className="check-mark">✓ Selected</span>}
            </button>

            <div className="or-divider">
              <span>OR</span>
            </div>

            <button 
              className={`option-card option-b ${selectedOption === 'B' ? 'selected' : ''}`}
              onClick={() => handleSelect('B')}
            >
              <span className="option-tag">Option B</span>
              <span className="option-text">{currentQ.optionB}</span>
              {selectedOption === 'B' && <span className="check-mark">✓ Selected</span>}
            </button>
          </div>

          {matchScore !== null && (
            <div className="result-reveal animate-fade-in-up">
              <div className="match-pill">
                <Heart size={16} fill="var(--accent)" color="var(--accent)" />
                <span>{matchScore}% Match Alignment!</span>
              </div>
              <p className="result-subtext">You and your match share high chemistry vibes!</p>
            </div>
          )}

          <div className="wyr-actions">
            {selectedOption ? (
              <>
                <button className="btn-share-chat" onClick={handleShare}>
                  <Share2 size={18} /> Share Choice to Chat
                </button>
                <button className="btn-next-q" onClick={handleNext}>
                  Next Card <ChevronRight size={18} />
                </button>
              </>
            ) : (
              <p className="pick-prompt">Tap an option above to see your compatibility!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
