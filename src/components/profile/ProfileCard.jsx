import React, { useState, useEffect, useRef } from 'react';
import { Heart, MapPin, Briefcase, GraduationCap, Home, Check, Ruler, Wine, Cigarette } from 'lucide-react';
import './ProfileCard.css';

export default function ProfileCard({ profile, onLike, onSkip, onComment }) {
  const [commentInput, setCommentInput] = useState(null); // { type, index }
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const photoRefs = useRef([]);

  useEffect(() => {
    setActivePhotoIndex(0);
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
  }, [profile]);
  
  if (!profile) return null;
  
  const handleCommentOpen = (itemType, itemIndex) => {
    setCommentInput({ itemType, itemIndex });
  };
  
  const submitComment = (text) => {
    if (text && text.trim()) {
      if (onComment) onComment({ itemType: commentInput.itemType, itemIndex: commentInput.itemIndex, comment: text });
    }
    setCommentInput(null);
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
    <div className="profile-card">
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
      <div className="profile-scroll">
        {items.map((item, idx) => (
          <div key={`${item.type}-${idx}`} className={`profile-item ${item.type}-item`}>
            {item.type === 'photo' ? (
              <div 
                className="photo-container"
                ref={(el) => (photoRefs.current[item.originalIndex] = el)}
                data-index={item.originalIndex}
              >
                <img src={item.data} alt="" className="profile-photo" />
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
