import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Flame, Users, User, Eye, EyeOff, Sparkles, Plus, Clock, UserPlus, ShieldAlert, ArrowRight, X } from 'lucide-react';
import ProfileCard from '../components/profile/ProfileCard';
import ActionBar from '../components/discover/ActionBar';
import DuoCard from '../components/discover/DuoCard';
import WobbleHourModal from '../components/wobble/WobbleHourModal';
import { PROFILES, DUO_PROFILES } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';
import { useConversations } from '../contexts/ConversationContext';
import { playPop, playWhoosh, playMatchChime, playSuperlikeFanfare } from '../utils/soundEffects';
import './DiscoverPage.css';

export default function DiscoverPage() {
  const navigate = useNavigate();
  const { user, dispatch: authDispatch } = useAuth();
  const { matches, dispatch: convoDispatch } = useConversations();
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animatingOut, setAnimatingOut] = useState(false);
  const [toast, setToast] = useState(null);

  const [exitDirection, setExitDirection] = useState(null); // null | 'left' | 'right' | 'up'
  const [superlikeCelebration, setSuperlikeCelebration] = useState(null);
  const [touchState, setTouchState] = useState({ startX: 0, startY: 0, currentX: 0, currentY: 0, isDragging: false, axis: null });

  // Discovery Feature States
  const [showWobbleHour, setShowWobbleHour] = useState(false);
  const [isDuoMode, setIsDuoMode] = useState(false);
  const [duoIndex, setDuoIndex] = useState(0);
  const [isBlindMode, setIsBlindMode] = useState(false);

  // Interaction Guards Modals
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);
  const [showPendingVerificationModal, setShowPendingVerificationModal] = useState(false);

  useEffect(() => {
    // Filter out already matched profiles and filter by target gender (women for male user)
    const matchedProfileIds = matches.map(m => m.matchedWith.id);
    const targetGender = user?.interestedIn || (user?.gender === 'male' ? 'female' : 'male');
    const availableProfiles = PROFILES.filter(p => 
      !matchedProfileIds.includes(p.id) && 
      (targetGender === 'all' || p.gender === targetGender)
    );
    setProfiles(availableProfiles);
  }, [matches, user]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  /**
   * Check if user is eligible to like/pass/superlike
   */
  const checkCanInteract = () => {
    // 1. Check if user profile is empty or incomplete
    if (!user?.profile_completed || !user?.photos || user.photos.length === 0) {
      setShowIncompleteModal(true);
      return false;
    }

    // 2. Check if user profile is pending admin verification
    if (user?.verification_status === 'pending' && !user?.is_admin && !user?.verified) {
      setShowPendingVerificationModal(true);
      return false;
    }

    return true;
  };

  const advanceProfile = (direction, delayMs = 380) => {
    setExitDirection(direction);
    setTimeout(() => {
      if (isDuoMode) {
        setDuoIndex(prev => prev + 1);
      } else {
        setCurrentIndex(prev => prev + 1);
      }
      setExitDirection(null);
      setTouchState({ startX: 0, startY: 0, currentX: 0, currentY: 0, isDragging: false, axis: null });
    }, delayMs);
  };

  const handleSkip = () => {
    if (exitDirection) return;
    if (!checkCanInteract()) return;
    try {
      playWhoosh();
    } catch (e) {}
    advanceProfile('left', 380);
  };

  const handleLike = () => {
    if (exitDirection) return;
    if (!checkCanInteract()) return;
    try {
      playPop();
    } catch (e) {}
    if (user.daily_likes_remaining > 0) {
      authDispatch({ type: 'USE_DAILY_LIKE' });
      advanceProfile('right', 380);
      showToast(isDuoMode ? "Liked double date profile! 👥" : "Liked profile! 💖");
    } else {
      showToast("No likes remaining today!");
    }
  };

  const handleRose = () => {
    if (exitDirection) return;
    if (!checkCanInteract()) return;
    try {
      playSuperlikeFanfare();
    } catch (e) {}
    const targetName = isDuoMode ? currentDuo?.person1?.name : currentProfile?.name;
    
    // Trigger majestic cosmic celebration
    setSuperlikeCelebration({
      name: targetName || 'Date',
      type: 'superlike',
    });

    advanceProfile('up', 800);

    setTimeout(() => {
      setSuperlikeCelebration(null);
    }, 2200);
  };

  const handleComment = (itemType, itemIndex, text) => {
    if (exitDirection) return;
    if (!checkCanInteract()) return;
    if (user.daily_likes_remaining > 0) {
      authDispatch({ type: 'USE_DAILY_LIKE' });
      advanceProfile('right', 380);
      showToast("Like sent with comment!");
    } else {
      showToast("No likes remaining today!");
    }
  };

  /* ---------------------------------------------------------------
     Swipe gestures with interactive guards
  --------------------------------------------------------------- */
  const AXIS_LOCK_THRESHOLD = 8;
  const SWIPE_COMMIT = 80;

  const handleDragStart = (e) => {
    if (exitDirection) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setTouchState({
      startX: clientX, startY: clientY,
      currentX: clientX, currentY: clientY,
      isDragging: true,
      axis: null,
    });
  };

  const handleDragMove = (e) => {
    if (!touchState.isDragging || exitDirection) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    setTouchState(prev => {
      if (!prev.isDragging) return prev;
      const dx = clientX - prev.startX;
      const dy = clientY - prev.startY;
      let axis = prev.axis;

      if (!axis) {
        const absX = Math.abs(dx);
        const absY = Math.abs(dy);
        if (absX >= AXIS_LOCK_THRESHOLD || absY >= AXIS_LOCK_THRESHOLD) {
          axis = absX >= absY ? 'x' : 'y';
        }
      }

      if (axis === 'y') {
        return { ...prev, isDragging: false, axis: 'y' };
      }

      return { ...prev, currentX: clientX, currentY: clientY, axis };
    });
  };

  const handleDragEnd = () => {
    if (!touchState.isDragging || exitDirection) {
      setTouchState(prev => ({ ...prev, isDragging: false, axis: null }));
      return;
    }

    const deltaX = touchState.currentX - touchState.startX;
    if (Math.abs(deltaX) > SWIPE_COMMIT && touchState.axis === 'x') {
      if (!checkCanInteract()) {
        setTouchState({ startX: 0, startY: 0, currentX: 0, currentY: 0, isDragging: false, axis: null });
        return;
      }

      if (deltaX > 0) {
        handleLike();
      } else {
        handleSkip();
      }
    } else {
      setTouchState({ startX: 0, startY: 0, currentX: 0, currentY: 0, isDragging: false, axis: null });
    }
  };

  const deltaX = touchState.isDragging && touchState.axis === 'x' 
    ? touchState.currentX - touchState.startX 
    : 0;

  const dragStyle = touchState.isDragging && touchState.axis === 'x' ? {
    transform: `translateX(${deltaX}px) rotate(${deltaX * 0.05}deg)`,
    transition: 'none',
  } : {};

  const handleWobbleHourMatch = (candidate) => {
    playMatchChime();
    showToast(`You matched with ${candidate.name} during Wobble Hour! ✨`);
  };

  const currentProfile = profiles[currentIndex];
  const currentDuo = DUO_PROFILES[duoIndex];

  return (
    <div className="discover-page">
      {/* The Wobble Hour Live Event Banner */}
      <div 
        className="wobble-hour-live-strip animate-pulse-subtle"
        onClick={() => {
          playPop();
          setShowWobbleHour(true);
        }}
      >
        <div className="wobble-strip-left">
          <span className="live-dot" />
          <Flame size={15} className="flame-strip-icon" />
          <span className="wobble-strip-title">THE WOBBLE HOUR (8-9 PM)</span>
        </div>
        <div className="wobble-strip-cta">
          <span>Enter Live Matchmaking 🍸</span>
        </div>
      </div>

      {/* Discovery Controls Bar */}
      <div className="discover-controls-bar">
        {/* Mode Toggle: Solo vs Duo Date */}
        <div className="mode-toggle-group">
          <button 
            className={`mode-toggle-btn ${!isDuoMode ? 'active' : ''}`}
            onClick={() => {
              playPop();
              setIsDuoMode(false);
            }}
          >
            <User size={13} /> Solo
          </button>
          <button 
            className={`mode-toggle-btn ${isDuoMode ? 'active' : ''}`}
            onClick={() => {
              playPop();
              setIsDuoMode(true);
            }}
          >
            <Users size={13} /> Duo Mode
          </button>
        </div>

        {/* Blind Impression Toggle */}
        <button 
          className={`blind-toggle-btn ${isBlindMode ? 'active' : ''}`}
          onClick={() => {
            playPop();
            setIsBlindMode(!isBlindMode);
            showToast(isBlindMode ? "Blind mode disabled" : "Blind mode enabled! Read personality first 🎭");
          }}
          title="Toggle Blind First Impression Mode"
        >
          {isBlindMode ? <EyeOff size={14} /> : <Eye size={14} />}
          <span>{isBlindMode ? 'Blind On' : 'Blind Off'}</span>
        </button>

        <span className="likes-counter-tag">
          {user?.daily_likes_remaining || 10} likes left
        </span>
      </div>

      {/* Main Card View with Interactive Swipe Gestures & Directions */}
      {isDuoMode ? (
        currentDuo ? (
          <div 
            className={`card-wrapper ${
              exitDirection === 'left' ? 'animating-out-left' :
              exitDirection === 'right' ? 'animating-out-right' :
              exitDirection === 'up' ? 'animating-out-up' :
              touchState.isDragging ? 'is-dragging' : 'animate-scale-in'
            }`}
            style={dragStyle}
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
            onMouseDown={handleDragStart}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
          >
            {/* Visual Swipe Direction Stamps */}
            {(deltaX > 40 || exitDirection === 'right') && (
              <div className="swipe-stamp like-stamp animate-pop">LIKE</div>
            )}
            {(deltaX < -40 || exitDirection === 'left') && (
              <div className="swipe-stamp nope-stamp animate-pop">PASS</div>
            )}
            {exitDirection === 'up' && (
              <div className="swipe-stamp superlike-stamp animate-pop">SUPERLIKED</div>
            )}

            <DuoCard 
              duoProfile={currentDuo}
              onLike={handleLike}
              onSkip={handleSkip}
            />
          </div>
        ) : (
          <div className="discover-page empty-state">
            <Users size={70} className="empty-icon" />
            <h2>No more Duo pairs right now</h2>
            <p>Switch back to Solo or check back later!</p>
          </div>
        )
      ) : currentProfile ? (
        <div 
          className={`card-wrapper ${
            exitDirection === 'left' ? 'animating-out-left' :
            exitDirection === 'right' ? 'animating-out-right' :
            exitDirection === 'up' ? 'animating-out-up' :
            touchState.isDragging ? 'is-dragging' : 'animate-scale-in'
          }`}
          style={dragStyle}
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
        >
          {/* Visual Swipe Direction Stamps */}
          {(deltaX > 40 || exitDirection === 'right') && (
            <div className="swipe-stamp like-stamp animate-pop">LIKE</div>
          )}
          {(deltaX < -40 || exitDirection === 'left') && (
            <div className="swipe-stamp nope-stamp animate-pop">PASS</div>
          )}
          {exitDirection === 'up' && (
            <div className="swipe-stamp superlike-stamp animate-pop">SUPERLIKED</div>
          )}

          <ProfileCard 
            profile={currentProfile}
            onLike={handleLike}
            onComment={handleComment}
            isBlindMode={isBlindMode}
          />
        </div>
      ) : (
        <div className="discover-page empty-state">
          <div className="empty-icon-wrap">
            <Compass size={72} className="empty-icon" />
          </div>
          <h2>You've explored all nearby matches!</h2>
          <p>Check back soon or expand your preferences in Settings.</p>
        </div>
      )}

      {/* Floating Action Bar */}
      {currentProfile && !isDuoMode && (
        <ActionBar 
          onSkip={handleSkip}
          onRose={handleRose}
          onLike={handleLike}
          disabled={animatingOut}
        />
      )}

      {/* Superlike Celebration */}
      {superlikeCelebration && (
        <div className="superlike-celebration-overlay animate-fade-in">
          <div className="cosmic-light-column" />
          
          <div className="particles-container">
            {['🌹', '⭐', '✨', '💖', '💫', '🌹', '🌟', '✨', '⭐', '🌹', '💫', '💖'].map((emoji, idx) => (
              <span 
                key={idx} 
                className={`celebration-particle p-${idx + 1}`}
              >
                {emoji}
              </span>
            ))}
          </div>

          <div className="superlike-badge-card animate-scale-up-bounce">
            <div className="superlike-icon-halo">
              <span className="star-icon-main">⭐</span>
              <span className="rose-icon-sub">🌹</span>
            </div>
            <h2 className="superlike-banner-title">SUPERLIKE SENT!</h2>
            <p className="superlike-banner-desc">
              Your profile will be highlighted at the top of <strong>{superlikeCelebration.name}</strong>'s deck ✨
            </p>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 1: COMPLETE YOUR PROFILE TO MATCH
         ========================================================= */}
      {showIncompleteModal && (
        <div className="discover-guard-modal-overlay animate-fade-in" onClick={() => setShowIncompleteModal(false)}>
          <div className="discover-guard-modal animate-scale-up-bounce" onClick={(e) => e.stopPropagation()}>
            <button className="guard-close-btn" onClick={() => setShowIncompleteModal(false)}>
              <X size={18} />
            </button>
            <div className="guard-icon-wrap">
              <UserPlus size={32} color="#E8604C" />
            </div>
            <h3>Complete Your Profile to Match</h3>
            <p>
              You need to add your photos and prompts before you can like, match, or chat with people on Wobble Date.
            </p>
            <button className="btn-guard-primary" onClick={() => navigate('/app/setup')}>
              <span>Set Up Profile Now</span>
              <ArrowRight size={16} />
            </button>
            <button className="btn-guard-secondary" onClick={() => setShowIncompleteModal(false)}>
              Browse Profiles for Now
            </button>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 2: VERIFICATION PENDING
         ========================================================= */}
      {showPendingVerificationModal && (
        <div className="discover-guard-modal-overlay animate-fade-in" onClick={() => setShowPendingVerificationModal(false)}>
          <div className="discover-guard-modal animate-scale-up-bounce" onClick={(e) => e.stopPropagation()}>
            <button className="guard-close-btn" onClick={() => setShowPendingVerificationModal(false)}>
              <X size={18} />
            </button>
            <div className="guard-icon-wrap pending">
              <Clock size={32} color="#F59E0B" />
            </div>
            <h3>Verification Under Review ⏳</h3>
            <p>
              Your profile is currently being reviewed by our concierge team (~10–15 mins). You can browse the deck, and you'll receive an email confirmation once approved to start matching!
            </p>
            <button className="btn-guard-primary" onClick={() => setShowPendingVerificationModal(false)}>
              <span>Got it</span>
            </button>
          </div>
        </div>
      )}

      {/* Wobble Hour Live Chemistry Modal */}
      {showWobbleHour && (
        <WobbleHourModal 
          onClose={() => setShowWobbleHour(false)}
          onMatchCreated={handleWobbleHourMatch}
          potentialCandidates={profiles}
        />
      )}

      {toast && (
        <div className="toast animate-fade-in-up">
          {toast}
        </div>
      )}
    </div>
  );
}
