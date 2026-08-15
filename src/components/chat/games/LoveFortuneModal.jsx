import React, { useState } from 'react';
import { X, Sparkles, Send, RefreshCw } from 'lucide-react';
import './LoveFortuneModal.css';

const FORTUNES = {
  nearFuture: [
    "You'll soon discover a mutual weird obsession.",
    "A spontaneous late-night food run is in your cards.",
    "Expect a lot of laughing at something not even funny.",
    "Someone will double text, and it's okay."
  ],
  superpower: [
    "Telepathically deciding what to eat.",
    "Never running out of things to talk about.",
    "Making mundane errands feel like a fun date.",
    "Perfectly timed sarcasm."
  ],
  nextDate: [
    "Coffee that accidentally turns into dinner.",
    "Trying to cook together and ordering pizza instead.",
    "An arcade battle where someone gets way too competitive.",
    "A cozy movie night where you both fall asleep."
  ]
};

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

export default function LoveFortuneModal({ onClose, onSendToChat }) {
  const [cards, setCards] = useState([
    { id: 1, title: "Near Future Vibe", text: getRandom(FORTUNES.nearFuture), flipped: false },
    { id: 2, title: "Couples Secret Superpower", text: getRandom(FORTUNES.superpower), flipped: false },
    { id: 3, title: "Next Date Prediction", text: getRandom(FORTUNES.nextDate), flipped: false }
  ]);

  const flipCard = (id) => {
    setCards(cards.map(c => c.id === id ? { ...c, flipped: true } : c));
  };

  const spinNew = () => {
    setCards([
      { id: 1, title: "Near Future Vibe", text: getRandom(FORTUNES.nearFuture), flipped: false },
      { id: 2, title: "Couples Secret Superpower", text: getRandom(FORTUNES.superpower), flipped: false },
      { id: 3, title: "Next Date Prediction", text: getRandom(FORTUNES.nextDate), flipped: false }
    ]);
  };

  const handleSend = () => {
    onSendToChat({ 
      type: 'love_fortune', 
      card1: cards[0],
      card2: cards[1],
      card3: cards[2],
      summaryText: `🔮 Pulled a Love Fortune!`
    });
  };

  const allFlipped = cards.every(c => c.flipped);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content fortune-modal animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="fortune-title">
            <Sparkles size={20} className="accent-icon" />
            <h3>Love Fortune</h3>
          </div>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        
        <div className="fortune-cards">
          {cards.map(card => (
            <div 
              key={card.id} 
              className={`fortune-card ${card.flipped ? 'is-flipped' : ''}`}
              onClick={() => flipCard(card.id)}
            >
              <div className="card-inner">
                <div className="card-front">
                  <div className="card-pattern"></div>
                  <span className="card-tap-text">Tap to Reveal</span>
                  <h4 className="card-title">{card.title}</h4>
                </div>
                <div className="card-back">
                  <h4 className="card-title-small">{card.title}</h4>
                  <p className="card-text">{card.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="fortune-actions">
          <button className="btn-secondary spin-btn" onClick={spinNew}>
            <RefreshCw size={16} /> Spin New Fortune
          </button>
          <button className="btn-primary full-width" onClick={handleSend} disabled={!allFlipped}>
            <Send size={18} /> Share Fortune to Chat
          </button>
        </div>
      </div>
    </div>
  );
}
