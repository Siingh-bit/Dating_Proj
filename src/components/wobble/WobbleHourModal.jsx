import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Star, Flame, Heart, Timer, Check, ArrowRight, Zap, RefreshCw } from 'lucide-react';
import { playPop, playMatchChime, playHeartbeat, playFanfare } from '../../utils/soundEffects';
import './WobbleHourModal.css';

const SPEED_QUESTIONS = [
  {
    id: 1,
    question: "Round 1: Spontaneous Weekend Vibe",
    optA: "🏖️ Goa Beach Bonfire with Acoustic Guitar",
    optB: "🏔️ Cozy Manali Cabin with Hot Cocoa & Rain",
  },
  {
    id: 2,
    question: "Round 2: First Date Rhythm",
    optA: "☕ Artisanal Coffee & Endless Walking Talks",
    optB: "🍸 Dim-lit Speakeasy Cocktails & Board Games",
  },
  {
    id: 3,
    question: "Round 3: Love Language Check",
    optA: "💫 Quality Time & Zero Phone Distractions",
    optB: "💌 Cute Unexpected Notes & Thoughtful Gifts",
  },
];

export default function WobbleHourModal({ onClose, onMatchCreated, potentialCandidates = [] }) {
  const [stage, setStage] = useState('radar'); // 'radar' | 'speed_round' | 'rating' | 'celebration'
  const [candidate, setCandidate] = useState(null);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userChoice, setUserChoice] = useState(null);
  const [partnerChoice, setPartnerChoice] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    // Select candidate
    const pick = potentialCandidates.length > 0 ? potentialCandidates[0] : {
      id: 'p9',
      name: 'Isha',
      age: 24,
      location: 'Bandra, Mumbai',
      photos: ['/profiles/isha/1.jpg'],
    };
    setCandidate(pick);

    // Radar simulation for 2.5 seconds
    const radarTimer = setTimeout(() => {
      playMatchChime();
      setStage('speed_round');
    }, 2400);

    return () => clearTimeout(radarTimer);
  }, [potentialCandidates]);

  // Timer countdown during speed round
  useEffect(() => {
    if (stage === 'speed_round') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setStage('rating');
            return 0;
          }
          if (prev % 30 === 0) playHeartbeat();
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stage]);

  const handleSelectOption = (opt) => {
    playPop();
    setUserChoice(opt);
    // Partner responds after 0.8s
    setTimeout(() => {
      setPartnerChoice(opt); // high match synergy
      playPop();
    }, 800);
  };

  const handleNextQuestion = () => {
    playPop();
    if (currentQIndex < SPEED_QUESTIONS.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      setUserChoice(null);
      setPartnerChoice(null);
    } else {
      setStage('rating');
    }
  };

  const handleSubmitRating = (rating) => {
    setUserRating(rating);
    playPop();
    setTimeout(() => {
      if (rating >= 4) {
        playFanfare();
        setStage('celebration');
      } else {
        onClose();
      }
    }, 400);
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const currentQ = SPEED_QUESTIONS[currentQIndex];

  return (
    <div className="wobble-hour-backdrop" onClick={onClose}>
      <div className="wobble-hour-modal animate-scale-in" onClick={e => e.stopPropagation()}>
        <button className="wobble-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        {/* STAGE 1: RADAR SCAN */}
        {stage === 'radar' && (
          <div className="radar-stage">
            <div className="wobble-live-pill">
              <span className="live-pulse" /> LIVE NOW • 8PM - 9PM
            </div>
            <div className="radar-animation">
              <div className="radar-circle circle-1" />
              <div className="radar-circle circle-2" />
              <div className="radar-circle circle-3" />
              <div className="radar-scanner" />
              <Flame size={48} className="radar-core-icon" />
            </div>
            <h3>Finding Your Frequency...</h3>
            <p>Matching you with an active dater for a 3-minute blind chemistry round.</p>
          </div>
        )}

        {/* STAGE 2: 3-MINUTE SPEED ROUND */}
        {stage === 'speed_round' && candidate && (
          <div className="speed-round-stage">
            <div className="speed-header">
              <div className="speed-timer">
                <Timer size={16} /> {formatTimer(timeLeft)}
              </div>
              <span className="round-count">Q {currentQIndex + 1} of {SPEED_QUESTIONS.length}</span>
            </div>

            <div className="mystery-profile-preview">
              <div className="mystery-photo-wrap">
                <img src={candidate.photos[0]} alt="" className="mystery-photo blurred" />
                <div className="mystery-badge">
                  <span>🎭 Photos Locked</span>
                </div>
              </div>
              <div className="mystery-info">
                <h4>{candidate.name}, {candidate.age}</h4>
                <span className="mystery-location">{candidate.location}</span>
              </div>
            </div>

            <div className="speed-question-card">
              <span className="q-label">{currentQ.question}</span>
              <div className="speed-options-grid">
                <button 
                  className={`speed-opt-btn ${userChoice === 'A' ? 'selected' : ''}`}
                  onClick={() => handleSelectOption('A')}
                >
                  <span>{currentQ.optA}</span>
                  {userChoice === 'A' && <Check size={16} className="opt-check" />}
                  {partnerChoice === 'A' && <span className="partner-matched-tag">{candidate.name} picked this</span>}
                </button>

                <button 
                  className={`speed-opt-btn ${userChoice === 'B' ? 'selected' : ''}`}
                  onClick={() => handleSelectOption('B')}
                >
                  <span>{currentQ.optB}</span>
                  {userChoice === 'B' && <Check size={16} className="opt-check" />}
                  {partnerChoice === 'B' && <span className="partner-matched-tag">{candidate.name} picked this</span>}
                </button>
              </div>

              {userChoice && (
                <button className="speed-next-btn animate-fade-in-up" onClick={handleNextQuestion}>
                  {currentQIndex < SPEED_QUESTIONS.length - 1 ? 'Next Vibe Check' : 'Finish & Rate Chemistry'} <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* STAGE 3: RATE THE CHEMISTRY */}
        {stage === 'rating' && candidate && (
          <div className="rating-stage">
            <div className="rating-mystery-avatar">
              <img src={candidate.photos[0]} alt="" className="mystery-photo blurred" />
            </div>
            <h3>How was the vibe with {candidate.name}?</h3>
            <p>If you both rate 4+ stars, photos unblur and you match instantly!</p>

            <div className="stars-row">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  className={`star-btn ${userRating >= star ? 'active' : ''}`}
                  onClick={() => handleSubmitRating(star)}
                >
                  <Star size={36} fill={userRating >= star ? "#FFD700" : "none"} color={userRating >= star ? "#FFD700" : "#5A5465"} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STAGE 4: MATCH CELEBRATION */}
        {stage === 'celebration' && candidate && (
          <div className="celebration-stage">
            <div className="celebration-sparkle-burst">
              <Sparkles size={32} />
            </div>
            <div className="unblurred-match-photo">
              <img src={candidate.photos[0]} alt={candidate.name} className="unblurred-img" />
              <div className="instant-match-badge">
                <Heart size={14} fill="#fff" /> 100% Chemistry
              </div>
            </div>
            <h2>It's a Wobble Match</h2>
            <p>You and <strong>{candidate.name}</strong> both rated 5 stars! Photos unblurred.</p>

            <button 
              className="chat-now-btn"
              onClick={() => {
                if (onMatchCreated) onMatchCreated(candidate);
                onClose();
              }}
            >
              Start Chatting with {candidate.name} <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
