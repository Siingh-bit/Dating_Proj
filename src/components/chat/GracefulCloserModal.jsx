import React, { useState } from 'react';
import { X, HeartHandshake, Sparkles, Send, Check } from 'lucide-react';
import { playPop, playMatchChime } from '../../utils/soundEffects';
import './GracefulCloserModal.css';

const PRESET_CLOSURES = [
  {
    id: 1,
    title: "No Romantic Spark (Wishing the Best)",
    text: "Hey! I've really enjoyed chatting with you, but I don't feel a romantic spark between us. Wishing you the absolute best in your journey! ✨",
  },
  {
    id: 2,
    title: "Taking a Break from Dating",
    text: "Hey! Just wanted to be honest — I'm taking a step back from dating apps for a bit to focus on myself. It was wonderful talking to you! 🌱",
  },
  {
    id: 3,
    title: "Better as Friends",
    text: "I really value our conversations and think you're awesome! I feel we'd have great chemistry as friends rather than partners. 💛",
  },
  {
    id: 4,
    title: "Different Relationship Goals",
    text: "Hey! Loved learning about you, but I feel our current life directions and goals are a bit different right now. Wish you all the happiness! 💫",
  },
];

export default function GracefulCloserModal({ matchProfile, onClose, onConfirmEnd }) {
  const [selectedPreset, setSelectedPreset] = useState(PRESET_CLOSURES[0]);
  const [customText, setCustomText] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  const handleSendAndEnd = () => {
    playMatchChime();
    const messageToSend = isCustom && customText.trim() ? customText.trim() : selectedPreset.text;
    if (onConfirmEnd) {
      onConfirmEnd(messageToSend);
    }
    onClose();
  };

  return (
    <div className="graceful-closer-backdrop" onClick={onClose}>
      <div className="graceful-closer-modal animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="closer-header">
          <div className="closer-title-box">
            <span className="closer-badge">
              <HeartHandshake size={14} /> Graceful Closer
            </span>
            <h3>End Conversation with Kindness</h3>
            <p>Close your conversation slot with {matchProfile?.name} respectfully. No ghosting, zero hard feelings.</p>
          </div>
          <button className="closer-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="closer-body hide-scrollbar">
          <label className="section-label">Select a polite note to send:</label>
          <div className="closures-list">
            {PRESET_CLOSURES.map((c) => (
              <div
                key={c.id}
                className={`closure-card ${!isCustom && selectedPreset.id === c.id ? 'active' : ''}`}
                onClick={() => {
                  playPop();
                  setIsCustom(false);
                  setSelectedPreset(c);
                }}
              >
                <div className="closure-card-top">
                  <h4>{c.title}</h4>
                  {!isCustom && selectedPreset.id === c.id && <Check size={16} className="check-icon" />}
                </div>
                <p>"{c.text}"</p>
              </div>
            ))}

            <div 
              className={`closure-card ${isCustom ? 'active' : ''}`}
              onClick={() => {
                playPop();
                setIsCustom(true);
              }}
            >
              <div className="closure-card-top">
                <h4>✍️ Custom Respectful Note</h4>
                {isCustom && <Check size={16} className="check-icon" />}
              </div>
              {isCustom ? (
                <textarea
                  className="custom-closer-textarea"
                  placeholder="Write your kind farewell note..."
                  value={customText}
                  onChange={e => setCustomText(e.target.value)}
                  autoFocus
                />
              ) : (
                <p>Write your own personalized kind message...</p>
              )}
            </div>
          </div>
        </div>

        <div className="closer-footer">
          <button className="btn-cancel-closer" onClick={onClose}>
            Keep Talking
          </button>
          <button className="btn-send-closer" onClick={handleSendAndEnd}>
            <Send size={15} /> Send & Free Slot
          </button>
        </div>
      </div>
    </div>
  );
}
