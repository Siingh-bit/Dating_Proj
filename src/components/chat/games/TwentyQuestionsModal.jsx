import React, { useState } from 'react';
import { X, Target, Send, Brain, ChevronRight } from 'lucide-react';
import './TwentyQuestionsModal.css';

const CATEGORIES = [
  "Secret Habit",
  "Dream Vacation",
  "Favorite Comfort Food",
  "Hidden Talent",
  "Childhood Memory"
];

export default function TwentyQuestionsModal({ onClose, onSendToChat }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isStarted, setIsStarted] = useState(false);

  const handleStart = () => {
    if (selectedCategory) {
      setIsStarted(true);
    }
  };

  const handleShare = () => {
    if (onSendToChat) {
      onSendToChat({ 
        type: 'twenty_questions', 
        category: selectedCategory, 
        remaining: 20 
      });
    }
    onClose();
  };

  return (
    <div className="game-modal-overlay">
      <div className="game-modal-content twenty-modal">
        <button className="game-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        {!isStarted ? (
          <div className="twenty-setup">
            <div className="twenty-header">
              <div className="icon-wrapper">
                <Brain size={32} />
              </div>
              <h2>20 Questions</h2>
              <p>Pick a category for your match to guess!</p>
            </div>

            <div className="category-list">
              {CATEGORIES.map((cat, index) => (
                <button
                  key={index}
                  className={`category-btn ${selectedCategory === cat ? 'selected' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  <span>{cat}</span>
                  <ChevronRight size={18} className="chevron" />
                </button>
              ))}
            </div>

            <button 
              className="start-game-btn"
              disabled={!selectedCategory}
              onClick={handleStart}
            >
              Ready to Play
            </button>
          </div>
        ) : (
          <div className="twenty-active">
            <div className="twenty-active-header">
              <Target className="target-icon" size={40} />
              <h3>Your Secret Word</h3>
              <p>Keep this in mind while they guess!</p>
            </div>

            <div className="secret-category-display">
              <span className="label">Category:</span>
              <span className="value">{selectedCategory}</span>
            </div>

            <div className="rules-box">
              <h4>How it works:</h4>
              <ul>
                <li>Your match has 20 Yes/No questions.</li>
                <li>Answer honestly in the chat.</li>
                <li>If they guess it, they win!</li>
              </ul>
            </div>

            <button className="share-results-btn" onClick={handleShare}>
              <Send size={18} />
              Send 20 Questions Game to Chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
