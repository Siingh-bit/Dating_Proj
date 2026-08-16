import React, { useState } from 'react';
import { Sparkles, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { playPop } from '../../utils/soundEffects';
import './SmartReviver.css';

export default function SmartReviver({ matchProfile, onSelectPrompt }) {
  const [isOpen, setIsOpen] = useState(false);

  const smartSparks = matchProfile?.smartSparks || [
    `Ask ${matchProfile?.name} about her favorite weekend spots!`,
    `Ask what music album has been on repeat for her lately 🎧`,
    `Ask for her #1 recommendation for dinner in ${matchProfile?.location?.split(',')[0] || 'the city'} 🍕`,
  ];

  const handlePick = (text) => {
    playPop();
    if (onSelectPrompt) onSelectPrompt(text);
    setIsOpen(false);
  };

  return (
    <div className="smart-reviver-wrapper">
      <button 
        className={`smart-reviver-toggle ${isOpen ? 'active' : ''}`}
        onClick={() => {
          playPop();
          setIsOpen(!isOpen);
        }}
      >
        <Sparkles size={14} className="sparkle-icon" />
        <span>Spark Ideas</span>
        {isOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>

      {isOpen && (
        <div className="smart-sparks-drawer animate-slide-up">
          <div className="sparks-header">
            <span>✨ Tailored conversation sparks for {matchProfile?.name}:</span>
          </div>
          <div className="sparks-list">
            {smartSparks.map((spark, idx) => (
              <button 
                key={idx} 
                className="spark-chip"
                onClick={() => handlePick(spark)}
              >
                <MessageCircle size={12} className="spark-msg-icon" />
                <span>{spark}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
