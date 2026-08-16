import React, { useState, useEffect } from 'react';
import { Compass, Flame, Users, User, Eye, EyeOff, Sparkles, Plus } from 'lucide-react';
import ProfileCard from '../components/profile/ProfileCard';
import ActionBar from '../components/discover/ActionBar';
import StoriesBar from '../components/discover/StoriesBar';
import StoryViewerModal from '../components/discover/StoryViewerModal';
import DuoCard from '../components/discover/DuoCard';
import WobbleHourModal from '../components/wobble/WobbleHourModal';
import { PROFILES, STORIES, DUO_PROFILES } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';
import { useConversations } from '../contexts/ConversationContext';
import { playPop, playWhoosh, playMatchChime } from '../utils/soundEffects';
import './DiscoverPage.css';

export default function DiscoverPage() {
  const { user, dispatch: authDispatch } = useAuth();
  const { matches, dispatch: convoDispatch } = useConversations();
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animatingOut, setAnimatingOut] = useState(false);
  const [toast, setToast] = useState(null);

  const [exitDirection, setExitDirection] = useState(null); // null | 'left' | 'right' | 'up'
  const [superlikeCelebration, setSuperlikeCelebration] = useState(null);
  const [touchState, setTouchState] = useState({ startX: 0, startY: 0, currentX: 0, currentY: 0, isDragging: false });

  // New Feature States
  const [activeStory, setActiveStory] = useState(null);
  const [showWobbleHour, setShowWobbleHour] = useState(false);
  const [isDuoMode, setIsDuoMode] = useState(false);
  const [duoIndex, setDuoIndex] = useState(0);
  const [isBlindMode, setIsBlindMode] = useState(false);
  const [storiesList, setStoriesList] = useState(STORIES);

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

  const advanceProfile = (direction, delayMs = 380) => {
    setExitDirection(direction);
    setTimeout(() => {
      if (isDuoMode) {
        setDuoIndex(prev => prev + 1);
      } else {
        setCurrentIndex(prev => prev + 1);
      }
      setExitDirection(null);
      setTouchState({ startX: 0, startY: 0, currentX: 0, currentY: 0, isDragging: false });
    }, delayMs);
  };

  const handleSkip = () => {
    if (exitDirection) return;
    playWhoosh();
    advanceProfile('left', 380);
  };

  const handleLike = () => {
    if (exitDirection) return;
    playPop();
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
    playSuperlikeFanfare();
    const targetName = isDuoMode ? currentDuo?.person1?.name : currentProfile?.name;
    
    // Trigger majestic cosmic celebration
    setSuperlikeCelebration({
      name: targetName || 'Date',
      type: 'superlike',
    });

    advanceProfile('up', 750);

    setTimeout(() => {
      setSuperlikeCelebration(null);
    }, 1800);
  };

  const handleComment = (itemType, itemIndex, text) => {
    if (exitDirection) return;
    if (user.daily_likes_remaining > 0) {
      authDispatch({ type: 'USE_DAILY_LIKE' });
      advanceProfile('right', 380);
      showToast("Like sent with comment!");
    } else {
      showToast("No likes remaining today!");
    }
  };

  // Touch / Mouse Drag Swipe Gestures
  const handleDragStart = (e) => {
    if (exitDirection) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setTouchState({ startX: clientX, startY: clientY, currentX: clientX, currentY: clientY, isDragging: true });
  };

  const handleDragMove = (e) => {
    if (!touchState.isDragging || exitDirection) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setTouchState(prev => ({ ...prev, currentX: clientX, currentY: clientY }));
  };

  const handleDragEnd = () => {
    if (!touchState.isDragging || exitDirection) return;
    const deltaX = touchState.currentX - touchState.startX;
    const deltaY = touchState.currentY - touchState.startY;

    // Check gesture thresholds
    if (deltaY < -90 && Math.abs(deltaX) < 70) {
      // Swiped UP -> Superlike / Rose
      handleRose();
    } else if (deltaX > 80) {
      // Swiped RIGHT -> Like
      handleLike();
    } else if (deltaX < -80) {
      // Swiped LEFT -> Reject / Pass
      handleSkip();
    } else {
      // Reset position smoothly
      setTouchState({ startX: 0, startY: 0, currentX: 0, currentY: 0, isDragging: false });
    }
  };

  const deltaX = touchState.isDragging ? touchState.currentX - touchState.startX : 0;
  const deltaY = touchState.isDragging ? touchState.currentY - touchState.startY : 0;
  const dragRotation = deltaX * 0.08;

  const dragStyle = touchState.isDragging && !exitDirection ? {
    transform: `translate3d(${deltaX}px, ${deltaY}px, 0) rotate(${dragRotation}deg)`,
    transition: 'none',
  } : {};

  const handleAddVibeSnap = () => {
    playPop();
    // Simulate user posting a 24h snap
    const userSnap = {
      id: "story_self_active",
      userId: "user-self",
      userName: "Your Vibe",
      avatar: user?.photos?.[0] || "/profiles/ananya/1.jpg",
      isSelf: true,
      hasStory: true,
      storyCount: 1,
      stories: [
        {
          id: "s_user_1",
          photo: user?.photos?.[0] || "/profiles/ananya/1.jpg",
          timestamp: "Just now",
          caption: "Sunday morning pour-over coffee & design mode ☕✨",
          vibe: "Fresh Brew",
        },
      ],
    };
    setStoriesList(prev => [userSnap, ...prev.filter(s => !s.isSelf)]);
    showToast("Your 24h Vibe Snap is live! 📸");
  };

  const handleWobbleHourMatch = (candidate) => {
    playMatchChime();
    showToast(`You matched with ${candidate.name} during Wobble Hour! ✨`);
  };

  const currentProfile = profiles[currentIndex];
  const currentDuo = DUO_PROFILES[duoIndex];

  return (
    <div className="discover-page">
      {/* 24h Vibe Snaps (Stories Bar) */}
      <StoriesBar 
        stories={storiesList}
        onSelectStory={(s) => setActiveStory(s)}
        onAddStory={handleAddVibeSnap}
      />

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
          {user.daily_likes_remaining} likes left
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
          >
            {/* Visual Swipe Direction Stamps */}
            {(deltaX > 40 || exitDirection === 'right') && (
              <div className="swipe-stamp like-stamp animate-pop">LIKE 💖</div>
            )}
            {(deltaX < -40 || exitDirection === 'left') && (
              <div className="swipe-stamp nope-stamp animate-pop">PASS ✕</div>
            )}
            {(deltaY < -50 || exitDirection === 'up') && (
              <div className="swipe-stamp superlike-stamp animate-pop">SUPERLIKE ⭐</div>
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
        >
          {/* Visual Swipe Direction Stamps */}
          {(deltaX > 40 || exitDirection === 'right') && (
            <div className="swipe-stamp like-stamp animate-pop">LIKE 💖</div>
          )}
          {(deltaX < -40 || exitDirection === 'left') && (
            <div className="swipe-stamp nope-stamp animate-pop">PASS ✕</div>
          )}
          {(deltaY < -50 || exitDirection === 'up') && (
            <div className="swipe-stamp superlike-stamp animate-pop">SUPERLIKE ⭐</div>
          )}

          <ProfileCard 
            profile={currentProfile}
            onLike={handleLike}
            onSkip={handleSkip}
            onComment={handleComment}
            isBlindMode={isBlindMode}
          />
        </div>
      ) : (
        <div className="discover-page empty-state">
          <Compass size={80} className="empty-icon" />
          <h2>You've seen everyone</h2>
          <p>Check back later for new people</p>
        </div>
      )}

      {/* Action Floating Bar */}
      {((!isDuoMode && currentProfile) || (isDuoMode && currentDuo)) && (
        <ActionBar 
          onSkip={handleSkip}
          onLike={handleLike}
          onRose={handleRose}
          likesRemaining={user.daily_likes_remaining}
        />
      )}

      {/* Superlike / Rose Fullscreen Cosmic Celebration Effect */}
      {superlikeCelebration && (
        <div className="superlike-celebration-overlay animate-fade-in">
          <div className="cosmic-light-column" />
          
          {/* Shimmering floating particles burst */}
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

      {/* 24h Vibe Snap Fullscreen Story Viewer */}
      {activeStory && (
        <StoryViewerModal 
          storyData={activeStory}
          onClose={() => setActiveStory(null)}
          onReply={({ userName, storyCaption, text }) => {
            showToast(`Replied to ${userName}'s story: "${text}" 💌`);
          }}
        />
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

