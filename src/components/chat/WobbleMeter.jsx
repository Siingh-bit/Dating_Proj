import React, { useState, useEffect } from 'react';
import { Flame, Sparkles, Heart, Gift, Compass } from 'lucide-react';
import { playFanfare, playPop } from '../../utils/soundEffects';
import './WobbleMeter.css';

export default function WobbleMeter({ messageCount = 0, onTriggerDatePlanner }) {
  // Compute chemistry % based on messages & game rounds (up to 100)
  const chemistryPercent = Math.min(100, Math.max(35, 35 + messageCount * 8));

  let tierLabel = "Sparking ⚡";
  let tierColor = "#7C4DFF";
  if (chemistryPercent >= 80) {
    tierLabel = "Magnetic 🔥";
    tierColor = "#E8604C";
  } else if (chemistryPercent >= 60) {
    tierLabel = "In Sync 💫";
    tierColor = "#FF7B6B";
  }

  const isMax = chemistryPercent >= 100;

  return (
    <div className={`wobble-meter-container ${isMax ? 'is-max-chemistry' : ''}`}>
      <div className="wobble-meter-top">
        <div className="meter-left">
          <span className="flame-icon-wrap" style={{ color: tierColor }}>
            <Flame size={16} />
          </span>
          <span className="meter-title">Wobble Chemistry</span>
        </div>
        <div className="meter-right">
          <span className="meter-badge" style={{ color: tierColor, background: `${tierColor}20` }}>
            {tierLabel}
          </span>
          <span className="meter-pct">{chemistryPercent}%</span>
        </div>
      </div>

      <div className="meter-track">
        <div 
          className="meter-fill"
          style={{ 
            width: `${chemistryPercent}%`,
            background: isMax 
              ? 'linear-gradient(90deg, #FFD700, #FF7B6B, #E8604C)' 
              : `linear-gradient(90deg, #7C4DFF, ${tierColor})`
          }}
        />
      </div>

      {isMax && (
        <div className="max-chemistry-banner animate-fade-in-up">
          <div className="max-chem-text">
            <Sparkles size={14} className="sparkle-gold" />
            <span>100% Chemistry Unlocked! Ready for Date #1?</span>
          </div>
          <button 
            className="plan-date-trigger-btn"
            onClick={() => {
              playPop();
              if (onTriggerDatePlanner) onTriggerDatePlanner();
            }}
          >
            🎡 Plan Our Date
          </button>
        </div>
      )}
    </div>
  );
}
