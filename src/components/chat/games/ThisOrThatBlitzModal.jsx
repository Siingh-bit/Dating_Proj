import React, { useState, useEffect, useRef } from 'react';
import { X, Zap, Heart, Check, XCircle, Share } from 'lucide-react';
import './ThisOrThatBlitzModal.css';

const PAIRS = [
  { id: 1, left: { text: "Mountains", emoji: "⛰️" }, right: { text: "Beach", emoji: "🏖️" } },
  { id: 2, left: { text: "Dogs", emoji: "🐕" }, right: { text: "Cats", emoji: "🐈" } },
  { id: 3, left: { text: "Morning", emoji: "☀️" }, right: { text: "Night", emoji: "🌙" } },
  { id: 4, left: { text: "Cook at home", emoji: "🍳" }, right: { text: "Eat out", emoji: "🍽️" } },
  { id: 5, left: { text: "Text", emoji: "💬" }, right: { text: "Call", emoji: "📞" } },
  { id: 6, left: { text: "Road trip", emoji: "🚗" }, right: { text: "Fly", emoji: "✈️" } },
  { id: 7, left: { text: "Movies", emoji: "🎬" }, right: { text: "Books", emoji: "📚" } },
  { id: 8, left: { text: "Summer", emoji: "☀️" }, right: { text: "Winter", emoji: "❄️" } },
  { id: 9, left: { text: "Sweet", emoji: "🍰" }, right: { text: "Savory", emoji: "🧀" } },
  { id: 10, left: { text: "City", emoji: "🏙️" }, right: { text: "Countryside", emoji: "🌿" } },
  { id: 11, left: { text: "Early bird", emoji: "🐦" }, right: { text: "Night owl", emoji: "🦉" } },
  { id: 12, left: { text: "Hugs", emoji: "🤗" }, right: { text: "Kisses", emoji: "💋" } },
  { id: 13, left: { text: "Planning", emoji: "📋" }, right: { text: "Spontaneous", emoji: "🎲" } },
  { id: 14, left: { text: "Dancing", emoji: "💃" }, right: { text: "Singing", emoji: "🎤" } },
  { id: 15, left: { text: "Pizza", emoji: "🍕" }, right: { text: "Sushi", emoji: "🍣" } },
  { id: 16, left: { text: "Netflix", emoji: "📺" }, right: { text: "Adventure", emoji: "🧗" } },
  { id: 17, left: { text: "Coffee", emoji: "☕" }, right: { text: "Tea", emoji: "🍵" } },
  { id: 18, left: { text: "Rain", emoji: "🌧️" }, right: { text: "Sunshine", emoji: "🌞" } },
  { id: 19, left: { text: "Indie music", emoji: "🎸" }, right: { text: "Pop music", emoji: "🎵" } },
  { id: 20, left: { text: "Truth", emoji: "🤔" }, right: { text: "Dare", emoji: "🔥" } }
];

const TOTAL_TIME = 30;

export default function ThisOrThatBlitzModal({ onClose, onSendToChat }) {
  const [phase, setPhase] = useState('start'); // start, playing, complete
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userChoices, setUserChoices] = useState([]);
  const [partnerChoices, setPartnerChoices] = useState([]);
  const [selectedSide, setSelectedSide] = useState(null); // 'left' or 'right'
  const [soulmatePercentage, setSoulmatePercentage] = useState(0);
  const [displayPercentage, setDisplayPercentage] = useState(0);
  
  const timerRef = useRef(null);

  useEffect(() => {
    if (phase === 'playing') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [phase]);

  useEffect(() => {
    if (phase === 'complete') {
      let current = 0;
      const step = Math.max(1, Math.floor(soulmatePercentage / 20));
      const interval = setInterval(() => {
        current += step;
        if (current >= soulmatePercentage) {
          setDisplayPercentage(soulmatePercentage);
          clearInterval(interval);
        } else {
          setDisplayPercentage(current);
        }
      }, 50);
      return () => clearInterval(interval);
    }
  }, [phase, soulmatePercentage]);

  const startGame = () => {
    setPhase('playing');
    setTimeLeft(TOTAL_TIME);
    setCurrentIndex(0);
    setUserChoices([]);
    setSelectedSide(null);
  };

  const endGame = () => {
    clearInterval(timerRef.current);
    
    // Generate simulated partner choices (weighted to ~60-80% match)
    const currentChoices = [...userChoices];
    const generatedPartner = currentChoices.map(choice => {
      const match = Math.random() < 0.7; // ~70% match rate
      return {
        id: choice.id,
        userPick: choice.pick,
        partnerPick: match ? choice.pick : (choice.pick === 'left' ? 'right' : 'left')
      };
    });
    
    setPartnerChoices(generatedPartner);
    
    const matches = generatedPartner.filter(c => c.userPick === c.partnerPick).length;
    const total = generatedPartner.length || 1;
    setSoulmatePercentage(Math.round((matches / total) * 100));
    
    setPhase('complete');
  };

  const handleChoice = (side) => {
    if (selectedSide) return; // Prevent double click
    
    setSelectedSide(side);
    const newChoices = [...userChoices, { id: PAIRS[currentIndex].id, pick: side }];
    setUserChoices(newChoices);
    
    setTimeout(() => {
      setSelectedSide(null);
      if (currentIndex + 1 < PAIRS.length) {
        setCurrentIndex(prev => prev + 1);
      } else {
        endGame();
      }
    }, 500);
  };

  const handleShare = () => {
    const matches = partnerChoices.filter(c => c.userPick === c.partnerPick).length;
    const rating = getSoulmateRating(soulmatePercentage);
    onSendToChat({
      type: 'this_or_that_blitz',
      summaryText: `This or That Blitz: ${matches}/${partnerChoices.length} matched (${soulmatePercentage}%)! We are ${rating}!`,
      score: soulmatePercentage,
      answered: matches,
      total: partnerChoices.length
    });
    onClose();
  };

  const getSoulmateRating = (pct) => {
    if (pct >= 90) return "Twin Flames! 🔥🔥";
    if (pct >= 75) return "Perfect Match! 💕";
    if (pct >= 60) return "Great Chemistry! ✨";
    if (pct >= 40) return "Opposites Attract! 🧲";
    return "Unique Pairing! 🌈";
  };

  const renderStart = () => (
    <div className="blitz-start">
      <div className="blitz-icon-wrapper pulse">
        <Zap size={64} className="blitz-icon" />
      </div>
      <h1 className="blitz-title">This or That BLITZ</h1>
      <p className="blitz-subtitle">You have 30 seconds. Choose fast!</p>
      <button className="blitz-btn blitz-btn-primary" onClick={startGame}>
        START!
      </button>
    </div>
  );

  const renderPlaying = () => {
    const currentPair = PAIRS[currentIndex];
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (timeLeft / TOTAL_TIME) * circumference;
    const isDanger = timeLeft < 10;
    const isPulsing = timeLeft < 5;

    return (
      <div className="blitz-playing">
        <div className="blitz-header">
          <div className={`blitz-timer-container ${isPulsing ? 'timer-pulse' : ''}`}>
            <svg width="80" height="80" className="blitz-timer-svg">
              <circle cx="40" cy="40" r={radius} className="blitz-timer-bg" />
              <circle 
                cx="40" 
                cy="40" 
                r={radius} 
                className={`blitz-timer-progress ${isDanger ? 'danger' : ''}`}
                style={{
                  strokeDasharray: circumference,
                  strokeDashoffset: strokeDashoffset
                }}
              />
            </svg>
            <div className={`blitz-timer-text ${isDanger ? 'danger-text' : ''}`}>{timeLeft}</div>
          </div>
        </div>

        <div className="blitz-cards">
          <div 
            className={`blitz-card ${selectedSide === 'left' ? 'selected' : ''} ${selectedSide === 'right' ? 'faded' : ''}`}
            onClick={() => handleChoice('left')}
          >
            <span className="blitz-emoji">{currentPair.left.emoji}</span>
            <span className="blitz-card-text">{currentPair.left.text}</span>
          </div>
          
          <div className="blitz-vs">VS</div>
          
          <div 
            className={`blitz-card ${selectedSide === 'right' ? 'selected' : ''} ${selectedSide === 'left' ? 'faded' : ''}`}
            onClick={() => handleChoice('right')}
          >
            <span className="blitz-emoji">{currentPair.right.emoji}</span>
            <span className="blitz-card-text">{currentPair.right.text}</span>
          </div>
        </div>

        <div className="blitz-footer">
          <div className="blitz-progress-text">Choices made: {currentIndex}/{PAIRS.length}</div>
          <div className="blitz-progress-bar-container">
            <div 
              className="blitz-progress-bar-fill" 
              style={{ width: `${(currentIndex / PAIRS.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  };

  const renderComplete = () => {
    const matches = partnerChoices.filter(c => c.userPick === c.partnerPick).length;

    return (
      <div className="blitz-complete">
        <div className="blitz-complete-header">
          <Zap size={32} className="blitz-complete-icon" />
          <h2>BLITZ COMPLETE!</h2>
        </div>

        <div className="blitz-meter-section">
          <div className="blitz-percentage">{displayPercentage}%</div>
          <div className="blitz-rating">{getSoulmateRating(displayPercentage)}</div>
          
          <div className="blitz-meter-bar">
            <div 
              className="blitz-meter-fill"
              style={{ width: `${displayPercentage}%` }}
            ></div>
          </div>
          <p className="blitz-meter-subtitle">{matches} out of {partnerChoices.length} matched</p>
        </div>

        <div className="blitz-results-list">
          {partnerChoices.map((choice, idx) => {
            const pair = PAIRS.find(p => p.id === choice.id);
            const isMatch = choice.userPick === choice.partnerPick;
            const userText = choice.userPick === 'left' ? pair.left.text : pair.right.text;
            const userEmoji = choice.userPick === 'left' ? pair.left.emoji : pair.right.emoji;
            
            return (
              <div key={idx} className={`blitz-result-item ${isMatch ? 'match' : 'mismatch'}`}>
                <div className="blitz-result-icon">
                  {isMatch ? <Check size={18} /> : <XCircle size={18} />}
                </div>
                <div className="blitz-result-text">
                  {userEmoji} {userText}
                </div>
              </div>
            );
          })}
        </div>

        <button className="blitz-btn blitz-btn-primary share-btn" onClick={handleShare}>
          <Share size={20} />
          <span>Share Results to Chat</span>
        </button>
      </div>
    );
  };

  return (
    <div className="blitz-overlay">
      <div className="blitz-modal">
        <button className="blitz-close-btn" onClick={onClose}>
          <X size={24} />
        </button>
        {phase === 'start' && renderStart()}
        {phase === 'playing' && renderPlaying()}
        {phase === 'complete' && renderComplete()}
      </div>
    </div>
  );
}
