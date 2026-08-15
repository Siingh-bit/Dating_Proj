import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import './DateNightRouletteModal.css';

const activities = [
  "🍕 Pizza & Movie",
  "🌅 Sunset Walk",
  "🎨 Art Class",
  "🏖️ Beach Day",
  "🍳 Cook Together",
  "☕ Café Hopping",
  "🎮 Game Night",
  "🎪 Adventure Outing"
];

const vibes = ["Cozy 🕯️", "Adventurous 🧗", "Romantic 💕", "Silly 🤪"];
const budgets = ["Free 🆓", "$ Budget 💵", "$$ Splurge 💰"];
const whens = ["This Weekend", "Tonight", "Next Date Night"];

export default function DateNightRouletteModal({ onClose, onSendToChat }) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinDeg, setSpinDeg] = useState(0);
  const [result, setResult] = useState(null);

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setResult(null);

    const extraDeg = Math.floor(Math.random() * 360);
    const totalDeg = spinDeg + 1800 + extraDeg + Math.floor(Math.random() * 1800);
    setSpinDeg(totalDeg);

    setTimeout(() => {
      setIsSpinning(false);
      
      // Calculate which segment is at the top
      // 0 deg is the middle of the first segment (index 0).
      // Each segment is 45 degrees.
      const normalizedDeg = (360 - (totalDeg % 360)) % 360;
      
      // We added an offset of 22.5 deg to visually align segments, so segment 0 is from -22.5 to 22.5.
      // Therefore, segment index calculation:
      const segmentIndex = Math.floor(((normalizedDeg + 22.5) % 360) / 45);
      
      const activity = activities[segmentIndex];
      const vibe = vibes[Math.floor(Math.random() * vibes.length)];
      const budget = budgets[Math.floor(Math.random() * budgets.length)];
      const when = whens[Math.floor(Math.random() * whens.length)];

      setResult({ activity, vibe, budget, when });
    }, 4000);
  };

  const handleLockIn = () => {
    if (!result) return;
    onSendToChat({
      type: 'date_night_roulette',
      summaryText: `🎰 Date Night Roulette landed on: ${result.activity}! Vibe: ${result.vibe} | Budget: ${result.budget} | When: ${result.when}`,
      activity: result.activity,
      vibe: result.vibe,
      budget: result.budget,
      when: result.when
    });
  };

  return (
    <div className="date-night-overlay">
      <div className="date-night-modal">
        <header className="date-night-header">
          <h2>🎰 Date Night Roulette</h2>
          <button className="close-btn" onClick={onClose}><X size={24} /></button>
        </header>

        <div className="date-night-body">
          {!result ? (
            <>
              <div className="wheel-container">
                <div className="wheel-pointer"></div>
                <div 
                  className="wheel" 
                  style={{ 
                    transform: `rotate(${spinDeg}deg)`, 
                    transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none' 
                  }}
                >
                  {activities.map((act, i) => (
                    <div key={i} className="wheel-segment-text" style={{ transform: `rotate(${i * 45}deg)` }}>
                      {act.split(' ')[0]}
                    </div>
                  ))}
                  <div className="wheel-center-dot"></div>
                </div>
              </div>
              <button 
                className="spin-btn" 
                onClick={handleSpin}
                disabled={isSpinning}
              >
                {isSpinning ? 'Spinning...' : 'SPIN!'}
              </button>
            </>
          ) : (
            <div className="result-card">
              <h3 className="result-activity">{result.activity}</h3>
              <div className="result-modifiers">
                <div className="modifier">Vibe: <strong>{result.vibe}</strong></div>
                <div className="modifier">Budget: <strong>{result.budget}</strong></div>
                <div className="modifier">When: <strong>{result.when}</strong></div>
              </div>
              <div className="result-actions">
                <button className="btn-lock-in" onClick={handleLockIn}>Lock In This Date!</button>
                <button className="btn-spin-again" onClick={() => setResult(null)}>Spin Again</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
