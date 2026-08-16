import React, { useState, useEffect, useRef } from 'react';
import { Heart, MapPin, Briefcase, GraduationCap, Home, Check, Ruler, Wine, Cigarette, Eye, EyeOff } from 'lucide-react';
import VoicePromptCard from './VoicePromptCard';
import SpotifyAnthemCard from './SpotifyAnthemCard';
import { playPop } from '../../utils/soundEffects';
import './ProfileCard.css';

export default function ProfileCard({ profile, onLike, onSkip, onComment, isBlindMode = false }) {
  const [commentInput, setCommentInput] = useState(null); // { type, index }
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [revealedPhotos, setRevealedPhotos] = useState(false);
  const photoRefs = useRef([]);

  useEffect(() => {
    setActivePhotoIndex(0);
    setRevealedPhotos(!isBlindMode);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.dataset.index);
            if (!isNaN(index)) {
              setActivePhotoIndex(index);
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    const currentRefs = photoRefs.current;
    currentRefs.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [profile, isBlindMode]);
  
  if (!profile) return null;
  
  const handleCommentOpen = (itemType, itemIndex) => {
    playPop();
    setCommentInput({ itemType, itemIndex });
  };
  
  const submitComment = (text) => {
    if (text && text.trim()) {
      if (onComment) onComment({ itemType: commentInput.itemType, itemIndex: commentInput.itemIndex, comment: text });
    }
    setCommentInput(null);
  };

  const handleReveal = () => {
    playPop();
    setRevealedPhotos(true);
  };

  const vitalsList = profile.vitals ? [
    { icon: Ruler, value: profile.vitals.height },
    { icon: Briefcase, value: profile.vitals.work },
    { icon: GraduationCap, value: profile.vitals.education },
    { icon: Home, value: profile.vitals.hometown },
    { icon: Wine, value: profile.vitals.drinking },
    { icon: Cigarette, value: profile.vitals.smoking },
  ].filter(v => v.value) : [];

  const items = [];
  
  let photoIndex = 0;
  let promptIndex = 0;
  
  const photos = profile.photos || [];
  const prompts = profile.prompts || [];

  photoRefs.current = [];

  while (photoIndex < photos.length || promptIndex < prompts.length) {
    if (photoIndex < photos.length) {
      items.push({ type: 'photo', data: photos[photoIndex], originalIndex: photoIndex });
      photoIndex++;
    }
    if (promptIndex < prompts.length) {
      items.push({ type: 'prompt', data: prompts[promptIndex], originalIndex: promptIndex });
      promptIndex++;
    }
  }

  const photoCount = photos.length;

  return (
    <div className={`profile-card ${isBlindMode && !revealedPhotos ? 'is-blind-mode' : ''}`}>
      {photoCount > 0 && (
        <div className="photo-progress-container">
          {Array.from({ length: photoCount }).map((_, i) => (
            <div 
              key={i} 
              className={`photo-progress-bar ${i === activePhotoIndex ? 'active' : ''}`} 
            />
          ))}
        </div>
      )}

      {isBlindMode && !revealedPhotos && (
        <div className="blind-mode-banner">
          <span>🎭 Blind Impression Mode</span>
          <button className="reveal-btn" onClick={handleReveal}>
            <Eye size={14} /> Reveal Photos
          </button>
        </div>
      )}

      <div className="profile-scroll">
        {/* Voice Prompt Showcase (placed right at top if available) */}
        {profile.voicePrompt && (
          <div className="profile-item voice-item">
            <VoicePromptCard voicePrompt={profile.voicePrompt} name={profile.name} />
          </div>
        )}

        {items.map((item, idx) => (
          <div key={`${item.type}-${idx}`} className={`profile-item ${item.type}-item`}>
            {item.type === 'photo' ? (
              <div 
                className={`photo-container ${isBlindMode && !revealedPhotos ? 'blurred' : ''}`}
                ref={(el) => (photoRefs.current[item.originalIndex] = el)}
                data-index={item.originalIndex}
              >
                <img src={item.data} alt="" className="profile-photo" />
                
                {isBlindMode && !revealedPhotos && (
                  <div className="photo-blur-overlay" onClick={handleReveal}>
                    <EyeOff size={32} />
                    <p>Photos Blurred in Blind Mode</p>
                    <span className="tap-hint">Tap to Reveal</span>
                  </div>
                )}

                {idx === 0 && (
                  <div className="name-overlay">
                    <h2>{profile.name}, {profile.age} {profile.verified && <span className="verified-badge"><Check size={12} /></span>}</h2>
                    <div className="location-row">
                      <MapPin size={14} /> <span>{profile.location || profile.distance}</span>
                    </div>
                  </div>
                )}
                <button className="item-heart-btn" onClick={() => handleCommentOpen('photo', item.originalIndex)}>
                  <Heart size={20} />
                </button>
              </div>
            ) : (
              <div className="prompt-container">
                <p className="prompt-question">{item.data.question}</p>
                <p className="prompt-answer">{item.data.answer}</p>
                <button className="item-heart-btn" onClick={() => handleCommentOpen('prompt', item.originalIndex)}>
                  <Heart size={20} />
                </button>
              </div>
            )}
            
            {commentInput?.itemType === item.type && commentInput?.itemIndex === item.originalIndex && (
              <div className="comment-overlay">
                <input 
                  type="text" 
                  placeholder={`Comment on ${item.type}...`}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') submitComment(e.target.value);
                  }}
                  onBlur={(e) => {
                    submitComment(e.target.value);
                  }}
                />
              </div>
            )}
          </div>
        ))}

        {/* Spotify Anthem Card */}
        {profile.spotify && (
          <div className="profile-item spotify-item">
            <SpotifyAnthemCard spotify={profile.spotify} name={profile.name} />
          </div>
        )}

        {vitalsList.length > 0 && (
          <div className="vitals-section">
            {vitalsList.map((v, i) => (
              <div key={i} className="vital-chip">
                <v.icon size={14} />
                <span>{v.value}</span>
              </div>
            ))}
          </div>
        )}

        <div className="intention-badge">
          <Heart size={16} className="intention-icon" />
          <span>Looking for: {profile.intention || 'Life partner'}</span>
        </div>
      </div>
    </div>
  );
}

