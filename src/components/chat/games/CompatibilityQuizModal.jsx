import React, { useState } from 'react';
import { X, Heart, Sparkles, Send, ArrowRight } from 'lucide-react';
import './CompatibilityQuizModal.css';

const QUESTIONS = [
  {
    id: 1,
    question: "What's your ideal first date?",
    options: ["Coffee & Walk", "Fancy Dinner", "Adventure/Activity", "Cozy Movie Night"]
  },
  {
    id: 2,
    question: "What's your primary love language?",
    options: ["Words of Affirmation", "Quality Time", "Physical Touch", "Acts of Service"]
  },
  {
    id: 3,
    question: "How do you handle conflict?",
    options: ["Talk it out immediately", "Need time to cool off", "Write my feelings down", "Try to compromise"]
  },
  {
    id: 4,
    question: "What's your preferred vacation vibe?",
    options: ["Relaxing on a beach", "Exploring a new city", "Nature & Hiking", "Spontaneous road trip"]
  },
  {
    id: 5,
    question: "What's a secret habit of yours?",
    options: ["Talking to myself", "Singing in the shower", "Midnight snacking", "Overthinking everything"]
  }
];

export default function CompatibilityQuizModal({ onClose, onSendToChat }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isFinished, setIsFinished] = useState(false);

  const handleOptionSelect = (option) => {
    const newAnswers = { ...answers, [currentQuestion]: option };
    setAnswers(newAnswers);

    if (currentQuestion < QUESTIONS.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(prev => prev + 1);
      }, 300);
    } else {
      setTimeout(() => {
        setIsFinished(true);
      }, 300);
    }
  };

  const getScore = () => {
    // Mock calculation based on answers length (always 100% since 5 answered, but we'll add some randomness)
    const baseScore = 75;
    const randomBoost = Math.floor(Math.random() * 21); // 0-20
    return baseScore + randomBoost; // 75-95%
  };

  const handleShare = () => {
    const score = getScore();
    const breakdown = `Both love ${answers[0]} & ${answers[3]}!`;
    
    if (onSendToChat) {
      onSendToChat({ type: 'compatibility_quiz', score, breakdown });
    }
    onClose();
  };

  const progressPercentage = ((currentQuestion) / QUESTIONS.length) * 100;

  return (
    <div className="game-modal-overlay">
      <div className="game-modal-content compatibility-modal">
        <button className="game-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        {!isFinished ? (
          <>
            <div className="game-header">
              <Heart className="game-header-icon" />
              <h2>Compatibility Quiz</h2>
              <p>Question {currentQuestion + 1} of {QUESTIONS.length}</p>
            </div>

            <div className="quiz-progress-bar">
              <div 
                className="quiz-progress-fill" 
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            <div className="quiz-question-container">
              <h3 className="quiz-question">{QUESTIONS[currentQuestion].question}</h3>
              <div className="quiz-options">
                {QUESTIONS[currentQuestion].options.map((option, index) => (
                  <button
                    key={index}
                    className={`quiz-option-btn ${answers[currentQuestion] === option ? 'selected' : ''}`}
                    onClick={() => handleOptionSelect(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="quiz-results">
            <div className="results-icon-container">
              <Sparkles className="results-sparkles" size={48} />
            </div>
            <h2>{getScore()}% Compatible!</h2>
            <p className="results-subtitle">Perfect Match ✨</p>
            
            <div className="results-breakdown">
              <h4>Shared Traits Preview</h4>
              <p>You both value {answers[1]?.toLowerCase()} and enjoy {answers[0]?.toLowerCase()}!</p>
            </div>

            <button className="share-results-btn" onClick={handleShare}>
              <Send size={18} />
              Share Results in Chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
