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

  const handleNext = () => {
    playWhoosh();
    setAnimatingOut(true);
    setTimeout(() => {
      if (isDuoMode) {
        setDuoIndex(prev => prev + 1);
      } else {
        setCurrentIndex(prev => prev + 1);
      }
      setAnimatingOut(false);
    }, 400); // match exit animation duration
  };

  const handleLike = () => {
    playPop();
    if (user.daily_likes_remaining > 0) {
      authDispatch({ type: 'USE_DAILY_LIKE' });
      handleNext();
      showToast(isDuoMode ? "Liked double date profile! 👥" : "Liked profile! 💖");
    } else {
      showToast("No likes remaining today!");
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const handleRose = () => {
    playMatchChime();
    handleNext();
    showToast("Rose sent! 🌹");
  };

  const handleComment = (itemType, itemIndex, text) => {
    if (user.daily_likes_remaining > 0) {
      authDispatch({ type: 'USE_DAILY_LIKE' });
      handleNext();
      showToast("Like sent with comment!");
    } else {
      showToast("No likes remaining today!");
    }
  };

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

      {/* Main Card View */}
      {isDuoMode ? (
        currentDuo ? (
          <div className={`card-wrapper ${animatingOut ? 'animating-out' : 'animate-scale-in'}`}>
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
        <div className={`card-wrapper ${animatingOut ? 'animating-out' : 'animate-scale-in'}`}>
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

