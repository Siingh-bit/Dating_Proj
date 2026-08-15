import React, { useState, useEffect } from 'react';
import { X, BookHeart, ChevronRight, Share, RotateCcw } from 'lucide-react';
import './OurStoryModal.css';

const BLANKS = [
  { id: 'place', label: 'A PLACE', context: 'We first met at ' },
  { id: 'adjective', label: 'AN ADJECTIVE', context: 'You looked absolutely ' },
  { id: 'food', label: 'A FOOD', context: 'Our first meal together was ' },
  { id: 'embarrassing', label: 'SOMETHING EMBARRASSING', context: 'I accidentally ' },
  { id: 'celebrity', label: 'A CELEBRITY', context: 'People say we look like ' },
  { id: 'superpower', label: 'A SUPERPOWER', context: 'If I could have any superpower for our relationship, it would be ' },
  { id: 'destination', label: 'A DREAM DESTINATION', context: "Someday we'll travel to " },
  { id: 'promise', label: 'A PROMISE', context: "I promise I'll always " }
];

export default function OurStoryModal({ onClose, onSendToChat }) {
  const [phase, setPhase] = useState('start'); // start, input, reveal
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentInput, setCurrentInput] = useState('');
  const [revealedText, setRevealedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const getFullStory = () => {
    return `Our Love Story\n\nWe first met at [${answers.place}]. You looked absolutely [${answers.adjective}].\nOur first meal together was [${answers.food}] — not exactly gourmet, but it was perfect.\nI accidentally [${answers.embarrassing}] on our first date, but you just laughed.\nPeople say we look like [${answers.celebrity}] and their partner. I'll take that.\nIf I could have any superpower for our relationship, it would be [${answers.superpower}].\nSomeday we'll travel to [${answers.destination}] together.\nAnd through it all, I promise I'll always [${answers.promise}].\n\n— Your Love Story ❤️`;
  };

  useEffect(() => {
    if (phase === 'reveal') {
      const fullText = getFullStory();
      let i = 0;
      setIsTyping(true);
      const interval = setInterval(() => {
        setRevealedText(fullText.substring(0, i));
        i++;
        if (i > fullText.length) {
          clearInterval(interval);
          setIsTyping(false);
        }
      }, 15); // Adjust typing speed here
      return () => clearInterval(interval);
    }
  }, [phase]);

  const handleStart = () => {
    setPhase('input');
    setCurrentIndex(0);
    setAnswers({});
    setCurrentInput('');
  };

  const handleNext = () => {
    if (!currentInput.trim()) return;
    
    const currentBlank = BLANKS[currentIndex];
    const newAnswers = { ...answers, [currentBlank.id]: currentInput.trim() };
    setAnswers(newAnswers);
    
    if (currentIndex < BLANKS.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setCurrentInput('');
    } else {
      setPhase('reveal');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleNext();
    }
  };

  const handleShare = () => {
    const fullStoryText = getFullStory();
    onSendToChat({
      type: 'our_story',
      summaryText: `📖 We wrote Our Love Story together! It starts at ${answers.place} and ends with a promise to always ${answers.promise} ❤️`,
      story: fullStoryText
    });
    onClose();
  };

  const renderStart = () => (
    <div className="story-start">
      <div className="story-icon-wrapper">
        <BookHeart size={56} className="story-icon" />
      </div>
      <h1 className="story-title">Our Love Story</h1>
      <p className="story-subtitle">Fill in the blanks to create your unique love story!</p>
      <button className="story-btn story-btn-primary" onClick={handleStart}>
        Begin
      </button>
    </div>
  );

  const renderInput = () => {
    const currentBlank = BLANKS[currentIndex];
    const progress = ((currentIndex + 1) / BLANKS.length) * 100;

    return (
      <div className="story-input-phase">
        <div className="story-progress-header">
          <span className="story-progress-text">{currentIndex + 1} / {BLANKS.length}</span>
          <div className="story-progress-bar-container">
            <div 
              className="story-progress-bar-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="story-input-content">
          <div className="story-blank-label">{currentBlank.label}</div>
          <div className="story-context-preview">
            "{currentBlank.context}<span className="story-highlight">___</span>"
          </div>
          
          <input
            type="text"
            className="story-text-input"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Enter ${currentBlank.label.toLowerCase()}...`}
            autoFocus
          />
        </div>

        <button 
          className="story-btn story-btn-primary story-next-btn" 
          onClick={handleNext}
          disabled={!currentInput.trim()}
        >
          <span>Next</span>
          <ChevronRight size={20} />
        </button>
      </div>
    );
  };

  const renderReveal = () => {
    // A helper to format the typed text, making bracketed text highlighted
    const formatText = (text) => {
      const parts = text.split(/(\[[^\]]+\])/g);
      return parts.map((part, i) => {
        if (part.startsWith('[') && part.endsWith(']')) {
          return <span key={i} className="story-text-highlight">{part.slice(1, -1)}</span>;
        }
        return part;
      });
    };

    return (
      <div className="story-reveal-phase">
        <h2 className="story-reveal-title">Your Tale</h2>
        
        <div className="story-card">
          <div className="story-card-inner">
            <div className="story-text-content">
              {formatText(revealedText)}
              {isTyping && <span className="story-cursor">|</span>}
            </div>
          </div>
        </div>

        {!isTyping && (
          <div className="story-reveal-actions">
            <button className="story-btn story-btn-primary" onClick={handleShare}>
              <Share size={20} />
              <span>Share Our Story to Chat</span>
            </button>
            <button className="story-btn story-btn-secondary" onClick={handleStart}>
              <RotateCcw size={20} />
              <span>Write Another</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="story-overlay">
      <div className="story-modal">
        <button className="story-close-btn" onClick={onClose}>
          <X size={24} />
        </button>
        {phase === 'start' && renderStart()}
        {phase === 'input' && renderInput()}
        {phase === 'reveal' && renderReveal()}
      </div>
    </div>
  );
}
