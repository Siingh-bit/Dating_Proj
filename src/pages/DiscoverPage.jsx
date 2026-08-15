import React, { useState, useEffect } from 'react';
import { Compass } from 'lucide-react';
import ProfileCard from '../components/profile/ProfileCard';
import ActionBar from '../components/discover/ActionBar';
import { PROFILES } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';
import { useConversations } from '../contexts/ConversationContext';
import './DiscoverPage.css';

export default function DiscoverPage() {
  const { user, dispatch: authDispatch } = useAuth();
  const { matches } = useConversations();
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animatingOut, setAnimatingOut] = useState(false);
  const [toast, setToast] = useState(null);

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
    setAnimatingOut(true);
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setAnimatingOut(false);
    }, 400); // match exit animation duration
  };

  const handleLike = () => {
    if (user.daily_likes_remaining > 0) {
      authDispatch({ type: 'USE_DAILY_LIKE' });
      handleNext();
    } else {
      showToast("No likes remaining today!");
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const handleRose = () => {
    handleNext();
    showToast("Rose sent!");
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

  const currentProfile = profiles[currentIndex];
  
  if (!currentProfile) {
    return (
      <div className="discover-page empty-state">
        <Compass size={80} className="empty-icon" />
        <h2>You've seen everyone</h2>
        <p>Check back later for new people</p>
      </div>
    );
  }

  return (
    <div className="discover-page">
      <div className="top-area">
        <span className="likes-counter">
          {user.daily_likes_remaining} likes remaining today
        </span>
      </div>

      <div className={`card-wrapper ${animatingOut ? 'animating-out' : 'animate-scale-in'}`}>
        <ProfileCard 
          profile={currentProfile}
          onLike={handleLike}
          onSkip={handleSkip}
          onComment={handleComment}
        />
      </div>

      <ActionBar 
        onSkip={handleSkip}
        onLike={handleLike}
        onRose={handleRose}
        likesRemaining={user.daily_likes_remaining}
      />

      {toast && (
        <div className="toast animate-fade-in-up">
          {toast}
        </div>
      )}
    </div>
  );
}
