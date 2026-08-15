import React, { useState, useRef, useEffect } from 'react';
import { X, Share2, Flame } from 'lucide-react';
import './HotTakesModal.css';

const TAKES = [
  "Texting 'goodnight' every night is non-negotiable",
  "It's totally fine to have a celebrity crush list",
  "The person who asks should always pay for the first date",
  "Couples who game together stay together",
  "Breakfast in bed > Fancy dinner out",
  "You should never go through your partner's phone",
  "Long distance can actually make love stronger",
  "PDA in public is cute, not cringe",
  "Matching outfits are adorable, not embarrassing",
  "A handwritten letter > 1000 texts"
];

const getEmoji = (val) => {
  if (val <= 20) return '😤';
  if (val <= 40) return '😐';
  if (val <= 60) return '🤔';
  if (val <= 80) return '😊';
  return '🔥';
};

const HotTakesModal = ({ onClose, onSendToChat, partnerName = "Partner" }) => {
  const [currentTakeIndex, setCurrentTakeIndex] = useState(0);
  const [sliderValue, setSliderValue] = useState(50);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  
  const [partnerValue, setPartnerValue] = useState(null);
  const [streak, setStreak] = useState(0);
  const [history, setHistory] = useState([]);
  
  const trackRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  // Handle Drag
  const updateSliderFromEvent = (e) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clientX = e.touches && e.touches.length > 0 ? e.touches[0].clientX : e.clientX;
    
    let x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;
    
    setSliderValue(Math.round(percentage));
    setHasInteracted(true);
  };

  const handlePointerDown = (e) => {
    setIsDragging(true);
    updateSliderFromEvent(e);
  };

  const handlePointerMove = (e) => {
    if (isDragging) {
      updateSliderFromEvent(e);
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('touchmove', handlePointerMove, { passive: false });
      window.addEventListener('touchend', handlePointerUp);
    } else {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [isDragging]);

  const handleLockIn = () => {
    if (!hasInteracted) return;
    
    // Simulate partner response
    const pValue = Math.floor(Math.random() * 101);
    setPartnerValue(pValue);
    setIsLocked(true);
    
    const diff = Math.abs(sliderValue - pValue);
    if (diff <= 20) {
      setStreak(s => s + 1);
    } else {
      setStreak(0);
    }
    
    setHistory(prev => [...prev, {
      take: TAKES[currentTakeIndex],
      user: sliderValue,
      partner: pValue,
      diff: diff
    }]);
  };

  const handleNext = () => {
    setSliderValue(50);
    setHasInteracted(false);
    setIsLocked(false);
    setPartnerValue(null);
    setCurrentTakeIndex(prev => prev + 1);
  };

  const handleShare = () => {
    const totalDiff = history.reduce((acc, h) => acc + h.diff, 0);
    const avgDiff = totalDiff / history.length;
    const alignment = Math.max(0, Math.round(100 - avgDiff));
    
    const bestTake = [...history].sort((a,b) => a.diff - b.diff)[0];
    const worstTake = [...history].sort((a,b) => b.diff - a.diff)[0];
    
    onSendToChat({
      type: 'hot_takes',
      summaryText: `🔥 Hot Takes: ${alignment}% aligned with ${partnerName}! Biggest clash: "${worstTake.take}"`,
      score: alignment,
      totalTakes: TAKES.length
    });
    onClose();
  };

  const isGameOver = currentTakeIndex >= TAKES.length;
  
  const getDiffStatus = (diff) => {
    if (diff <= 20) return { text: "🔥 You're aligned!", cls: "ht-comp-aligned" };
    if (diff <= 50) return { text: "😏 Interesting difference!", cls: "ht-comp-different" };
    return { text: "💥 Hot debate incoming!", cls: "ht-comp-clash" };
  };

  const renderSummary = () => {
    const totalDiff = history.reduce((acc, h) => acc + h.diff, 0);
    const avgDiff = totalDiff / history.length;
    const alignment = Math.max(0, Math.round(100 - avgDiff));
    
    const bestTake = [...history].sort((a,b) => a.diff - b.diff)[0];
    const worstTake = [...history].sort((a,b) => b.diff - a.diff)[0];

    return (
      <div className="ht-summary">
        <h2>Results</h2>
        <div className="ht-score-circle" style={{ '--pct': `${alignment}%` }}>
          <div className="ht-score-inner">
            <span className="ht-score-val">{alignment}%</span>
            <span className="ht-score-label">Aligned</span>
          </div>
        </div>
        
        <div className="ht-highlights">
          <div className="ht-highlight-box">
            <div className="ht-hl-title">Most Aligned Take</div>
            <div className="ht-hl-text">"{bestTake.take}"</div>
          </div>
          <div className="ht-highlight-box">
            <div className="ht-hl-title">Biggest Clash</div>
            <div className="ht-hl-text">"{worstTake.take}"</div>
          </div>
        </div>
        
        <div className="ht-actions">
          <button className="ht-btn-share" onClick={handleShare}>
            <Share2 size={20} /> Share to Chat
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="hot-takes-overlay">
      <div className="hot-takes-modal">
        <div className="ht-header">
          <div className="ht-counter">
            {isGameOver ? 'Summary' : `Take ${currentTakeIndex + 1}/${TAKES.length}`}
          </div>
          {!isGameOver && streak > 1 && (
            <div className="ht-streak">
              <Flame size={16} /> Streak {streak}
            </div>
          )}
          <button className="ht-close" onClick={onClose}><X size={24} /></button>
        </div>
        
        <div className="ht-content">
          {isGameOver ? (
            renderSummary()
          ) : (
            <>
              <div className="ht-statement-container">
                <div className="ht-statement">"{TAKES[currentTakeIndex]}"</div>
              </div>
              
              {!isLocked && (
                <div className="ht-slider-container">
                  <div 
                    className="ht-slider-track-wrap" 
                    ref={trackRef}
                    onPointerDown={handlePointerDown}
                  >
                    <div className="ht-slider-track" />
                    <div 
                      className="ht-slider-thumb"
                      style={{ left: `${sliderValue}%` }}
                    >
                      {getEmoji(sliderValue)}
                    </div>
                  </div>
                  <div className="ht-slider-labels">
                    <span>NOPE</span>
                    <span>YES!</span>
                  </div>
                </div>
              )}

              {isLocked && (
                <div className="ht-comparison">
                  <div className={`ht-comp-title ${getDiffStatus(Math.abs(sliderValue - partnerValue)).cls}`}>
                    {getDiffStatus(Math.abs(sliderValue - partnerValue)).text}
                  </div>
                  <div className="ht-comp-bars">
                    <div className="ht-comp-bar-row">
                      <div className="ht-comp-avatar">You</div>
                      <div className="ht-comp-track">
                        <div className="ht-comp-fill user" style={{ width: `${sliderValue}%` }} />
                      </div>
                    </div>
                    <div className="ht-comp-bar-row">
                      <div className="ht-comp-avatar">{partnerName[0]}</div>
                      <div className="ht-comp-track">
                        <div className="ht-comp-fill partner" style={{ width: `${partnerValue}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="ht-actions">
                {!isLocked ? (
                  <button 
                    className={`ht-btn-lock ${hasInteracted ? 'active' : ''}`}
                    onClick={handleLockIn}
                    disabled={!hasInteracted}
                  >
                    {hasInteracted ? 'Lock In Answer' : 'Drag slider to answer'}
                  </button>
                ) : (
                  <button className="ht-btn-next" onClick={handleNext}>
                    Next Take
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HotTakesModal;
