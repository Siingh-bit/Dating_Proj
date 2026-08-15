import React, { useState, useEffect } from 'react';
import { X, Share2, Flame } from 'lucide-react';
import './MindMeldModal.css';

const PROMPTS = [
  { text: "Name a romantic city", options: ["paris", "venice", "rome", "new york", "london"] },
  { text: "Pick a comfort food", options: ["pizza", "mac and cheese", "ice cream", "burger", "chocolate"] },
  { text: "Name a love song", options: ["perfect", "all of me", "can't help falling in love", "thinking out loud"] },
  { text: "Choose a dream vacation spot", options: ["hawaii", "maldives", "bali", "japan", "italy"] },
  { text: "Pick a movie genre for date night", options: ["romcom", "horror", "comedy", "action", "thriller"] },
  { text: "Name something you'd bring to a deserted island", options: ["knife", "water", "you", "fire starter", "boat"] },
  { text: "Pick a color that represents love", options: ["red", "pink", "white"] },
  { text: "Name a perfect first date activity", options: ["coffee", "dinner", "walk", "movie", "drinks"] },
  { text: "Choose a superpower you'd want", options: ["flying", "invisibility", "teleportation", "mind reading", "time travel"] },
  { text: "Name the best time of day for a kiss", options: ["sunset", "midnight", "morning", "night", "golden hour"] }
];

const MindMeldModal = ({ onClose, onSendToChat, partnerName = "Partner" }) => {
  const [currentRound, setCurrentRound] = useState(0);
  const [inputValue, setInputValue] = useState('');
  
  const [gameState, setGameState] = useState('input'); // 'input', 'suspense', 'reveal', 'summary'
  
  const [partnerAnswer, setPartnerAnswer] = useState('');
  const [isMatch, setIsMatch] = useState(false);
  
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [melds, setMelds] = useState(0);
  
  const [particles, setParticles] = useState([]);
  
  const handleLockIn = () => {
    if (!inputValue.trim()) return;
    
    setGameState('suspense');
    
    // Determine partner answer
    const currentPrompt = PROMPTS[currentRound];
    const userAns = inputValue.trim().toLowerCase();
    
    // 30% chance partner guesses same if it's in options, otherwise random option
    let pAns = "";
    if (currentPrompt.options.includes(userAns) && Math.random() < 0.4) {
      pAns = userAns;
    } else {
      pAns = currentPrompt.options[Math.floor(Math.random() * currentPrompt.options.length)];
    }
    
    setPartnerAnswer(pAns);
    
    const match = userAns === pAns;
    setIsMatch(match);
    
    setTimeout(() => {
      setGameState('reveal');
      if (match) {
        setMelds(m => m + 1);
        setStreak(s => {
          const newStreak = s + 1;
          if (newStreak > bestStreak) setBestStreak(newStreak);
          return newStreak;
        });
        generateParticles();
      } else {
        setStreak(0);
      }
    }, 1500);
  };

  const handleNext = () => {
    if (currentRound + 1 >= PROMPTS.length) {
      setGameState('summary');
    } else {
      setCurrentRound(r => r + 1);
      setInputValue('');
      setGameState('input');
      setParticles([]);
    }
  };

  const generateParticles = () => {
    const newParticles = [];
    const colors = ['#4CAF50', '#81C784', '#A5D6A7', '#FFF', '#FFEB3B'];
    for (let i = 0; i < 25; i++) {
      const angle = Math.random() * Math.PI * 2;
      const velocity = 50 + Math.random() * 150;
      const tx = Math.cos(angle) * velocity;
      const ty = Math.sin(angle) * velocity;
      const color = colors[Math.floor(Math.random() * colors.length)];
      newParticles.push({ id: i, tx, ty, color });
    }
    setParticles(newParticles);
  };

  const getTelepathyLevel = (score) => {
    if (score <= 2) return "Still warming up 😅";
    if (score <= 4) return "Getting there! 🤝";
    if (score <= 6) return "Strong connection! 💫";
    if (score <= 8) return "Practically telepathic! 🧠";
    return "SOULMATES CONFIRMED! 💕🔥";
  };

  const handleShare = () => {
    onSendToChat({
      type: 'mind_meld',
      summaryText: `💭 Mind Meld: ${melds}/${PROMPTS.length} melds! Telepathy Level: ${getTelepathyLevel(melds)}`,
      score: melds,
      total: PROMPTS.length,
      bestStreak
    });
    onClose();
  };

  const renderContent = () => {
    if (gameState === 'summary') {
      return (
        <div className="mm-summary">
          <h2>Results</h2>
          <div className="mm-stats">
            <div className="mm-stat-box">
              <div className="mm-stat-val">{melds}</div>
              <div className="mm-stat-label">Total Melds</div>
            </div>
            <div className="mm-stat-box">
              <div className="mm-stat-val">{bestStreak}</div>
              <div className="mm-stat-label">Best Streak</div>
            </div>
          </div>
          
          <div className="mm-rating-box">
            <div className="mm-rating-label">Telepathy Level</div>
            <div className="mm-rating-val">{getTelepathyLevel(melds)}</div>
          </div>
          
          <div className="mm-actions">
            <button className="mm-btn-share" onClick={handleShare}>
              <Share2 size={20} /> Share to Chat
            </button>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="mm-prompt-container">
          <div className="mm-prompt">"{PROMPTS[currentRound].text}"</div>
        </div>

        {gameState === 'input' && (
          <div className="mm-input-area">
            <input 
              type="text" 
              className="mm-input"
              placeholder="Type your answer..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLockIn()}
              autoFocus
            />
          </div>
        )}

        {gameState === 'suspense' && (
          <div className="mm-suspense">
            <div className="mm-suspense-text">Checking mind meld...</div>
            <div className="mm-dots">
              <div className="mm-dot"></div>
              <div className="mm-dot"></div>
              <div className="mm-dot"></div>
            </div>
          </div>
        )}

        {gameState === 'reveal' && (
          <div className={`mm-reveal ${!isMatch ? 'shake-anim' : ''}`}>
            <div className={`mm-result-title ${isMatch ? 'match' : 'miss'}`}>
              {isMatch ? 'MIND MELD! 🧠💥' : 'Almost!'}
            </div>
            
            <div className="mm-answers-display">
              <div className={`mm-answer-box ${isMatch ? 'match' : ''}`}>
                <div className="mm-answer-label">You</div>
                <div>{inputValue}</div>
              </div>
              <div className={`mm-answer-box ${isMatch ? 'match' : ''}`}>
                <div className="mm-answer-label">{partnerName}</div>
                <div>{partnerAnswer}</div>
              </div>
            </div>
            
            {isMatch && particles.length > 0 && (
              <div className="mm-particle-container">
                {particles.map(p => (
                  <div 
                    key={p.id} 
                    className="mm-particle" 
                    style={{ 
                      '--tx': `${p.tx}px`, 
                      '--ty': `${p.ty}px`,
                      backgroundColor: p.color
                    }} 
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mm-actions">
          {gameState === 'input' && (
            <button 
              className={`mm-btn-lock ${inputValue.trim() ? 'active' : ''}`}
              onClick={handleLockIn}
              disabled={!inputValue.trim()}
            >
              Lock In Answer
            </button>
          )}
          {gameState === 'reveal' && (
            <button className="mm-btn-next" onClick={handleNext}>
              {currentRound + 1 >= PROMPTS.length ? 'See Results' : 'Next Round'}
            </button>
          )}
        </div>
      </>
    );
  };

  return (
    <div className="mind-meld-overlay">
      <div className={`mind-meld-modal ${gameState === 'reveal' && isMatch ? 'flash-green' : ''}`}>
        <div className="mm-header">
          <div className="mm-round-info">
            <div className="mm-counter">
              {gameState === 'summary' ? 'Summary' : `Round ${currentRound + 1}/${PROMPTS.length}`}
            </div>
            {gameState !== 'summary' && (
              <div className="mm-progress-bar">
                <div className="mm-progress-fill" style={{ width: `${((currentRound + 1) / PROMPTS.length) * 100}%` }} />
              </div>
            )}
          </div>
          
          {streak >= 2 && gameState !== 'summary' && (
            <div className="mm-streak-display">
              <Flame size={18} /> STREAK: {streak}
            </div>
          )}
          
          <button className="mm-close" onClick={onClose}><X size={24} /></button>
        </div>
        
        <div className="mm-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default MindMeldModal;
