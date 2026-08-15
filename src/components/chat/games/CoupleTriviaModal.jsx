import React, { useState } from 'react';
import { X, CheckCircle, XCircle, Award, Send } from 'lucide-react';
import './CoupleTriviaModal.css';

const TRIVIA_QUESTIONS = [
  {
    id: 1,
    question: "Which hormone is known as the 'love hormone'?",
    options: ["Dopamine", "Serotonin", "Oxytocin", "Endorphin"],
    answer: "Oxytocin"
  },
  {
    id: 2,
    question: "What is the most popular day of the week to go on a first date?",
    options: ["Friday", "Saturday", "Thursday", "Sunday"],
    answer: "Saturday"
  },
  {
    id: 3,
    question: "According to psychology, how long does it typically take to make a first impression?",
    options: ["7 seconds", "30 seconds", "1 minute", "5 minutes"],
    answer: "7 seconds"
  },
  {
    id: 4,
    question: "In what country is it a tradition to carve lovespoons out of wood as a romantic gesture?",
    options: ["Ireland", "Wales", "Scotland", "Norway"],
    answer: "Wales"
  },
  {
    id: 5,
    question: "What is the symbol of everlasting love in many cultures?",
    options: ["The Rose", "The Swan", "The Dove", "The Infinity Symbol"],
    answer: "The Swan"
  }
];

export default function CoupleTriviaModal({ onClose, onSendToChat }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isFinished, setIsFinished] = useState(false);

  const handleOptionSelect = (option) => {
    if (selectedOption) return; // Prevent multiple selections

    setSelectedOption(option);
    
    const isCorrect = option === TRIVIA_QUESTIONS[currentQuestion].answer;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setTimeout(() => {
      if (currentQuestion < TRIVIA_QUESTIONS.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedOption(null);
      } else {
        setIsFinished(true);
      }
    }, 1500);
  };

  const handleShare = () => {
    if (onSendToChat) {
      onSendToChat({ type: 'couple_trivia', score, total: TRIVIA_QUESTIONS.length });
    }
    onClose();
  };

  const getResultTitle = () => {
    if (score === 5) return "Certified Romance Expert 💖";
    if (score >= 3) return "Solid Love Guru ✨";
    return "Still Learning about Love 📚";
  };

  return (
    <div className="game-modal-overlay">
      <div className="game-modal-content trivia-modal">
        <button className="game-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        {!isFinished ? (
          <>
            <div className="trivia-header">
              <div className="trivia-score">Score: {score}</div>
              <p>Question {currentQuestion + 1} of {TRIVIA_QUESTIONS.length}</p>
            </div>

            <div className="trivia-question-container">
              <h3 className="trivia-question">{TRIVIA_QUESTIONS[currentQuestion].question}</h3>
              
              <div className="trivia-options">
                {TRIVIA_QUESTIONS[currentQuestion].options.map((option, index) => {
                  const isSelected = selectedOption === option;
                  const isCorrectAnswer = option === TRIVIA_QUESTIONS[currentQuestion].answer;
                  
                  let optionClass = '';
                  if (selectedOption) {
                    if (isCorrectAnswer) optionClass = 'correct';
                    else if (isSelected) optionClass = 'wrong';
                  }

                  return (
                    <button
                      key={index}
                      className={`trivia-option-btn ${optionClass}`}
                      onClick={() => handleOptionSelect(option)}
                      disabled={selectedOption !== null}
                    >
                      <span>{option}</span>
                      {selectedOption && isCorrectAnswer && <CheckCircle size={18} className="icon-correct" />}
                      {selectedOption && isSelected && !isCorrectAnswer && <XCircle size={18} className="icon-wrong" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="trivia-results">
            <div className="results-icon-container">
              <Award className="results-award" size={48} />
            </div>
            <h2>{score} / {TRIVIA_QUESTIONS.length}</h2>
            <p className="results-subtitle">{getResultTitle()}</p>
            
            <button className="share-results-btn" onClick={handleShare}>
              <Send size={18} />
              Share Trivia Score to Chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
