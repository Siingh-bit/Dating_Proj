import React, { useState, useEffect, useRef } from 'react';
import { X, Heart, Send, MapPin, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { playPop, playMatchChime } from '../../utils/soundEffects';
import './StoryViewerModal.css';

export default function StoryViewerModal({ storyData, onClose, onReply }) {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [hasLiked, setHasLiked] = useState(false);
  const timerRef = useRef(null);

  const stories = storyData?.stories || [];
  const currentStory = stories[currentStoryIndex];

  useEffect(() => {
    if (!currentStory) return;
    setProgress(0);
    setHasLiked(false);

    if (timerRef.current) clearInterval(timerRef.current);

    const DURATION = 4500; // 4.5 seconds per story
    const INTERVAL = 50;
    const step = (INTERVAL / DURATION) * 100;

    timerRef.current = setInterval(() => {
      if (!isPaused) {
        setProgress((prev) => {
          if (prev >= 100) {
            handleNextStory();
            return 0;
          }
          return prev + step;
        });
      }
    }, INTERVAL);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentStoryIndex, isPaused, storyData]);

  const handleNextStory = () => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
      setProgress(0);
    }
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    playPop();
    if (onReply) {
      onReply({
        userName: storyData.userName,
        storyCaption: currentStory.caption,
        text: replyText.trim()
      });
    }
    setReplyText('');
    onClose();
  };

  const handleLikeStory = () => {
    playMatchChime();
    setHasLiked(true);
  };

  if (!currentStory) return null;

  return (
    <div className="story-viewer-backdrop" onClick={onClose}>
      <div 
        className="story-viewer-modal" 
        onClick={e => e.stopPropagation()}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
      >
        {/* Story Progress Indicators */}
        <div className="story-progress-bar-row">
          {stories.map((s, idx) => (
            <div key={s.id || idx} className="story-seg-bg">
              <div 
                className="story-seg-fill"
                style={{
                  width: idx === currentStoryIndex ? `${progress}%` : idx < currentStoryIndex ? '100%' : '0%'
                }}
              />
            </div>
          ))}
        </div>

        {/* Story Header */}
        <div className="story-header-row">
          <div className="story-user-info">
            <img src={storyData.avatar} alt={storyData.userName} className="story-header-avatar" />
            <div className="story-header-text">
              <h4>{storyData.userName}</h4>
              <span className="story-time">{currentStory.timestamp} {storyData.location && `• ${storyData.location}`}</span>
            </div>
          </div>
          <button className="story-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Story Main Image */}
        <div className="story-media-stage">
          <img src={currentStory.photo} alt="" className="story-media-img" />
          <div className="story-tap-left" onClick={handlePrevStory} />
          <div className="story-tap-right" onClick={handleNextStory} />
          
          {currentStory.vibe && (
            <div className="story-vibe-tag">
              <Sparkles size={13} /> {currentStory.vibe}
            </div>
          )}

          {currentStory.caption && (
            <div className="story-caption-overlay">
              <p>{currentStory.caption}</p>
            </div>
          )}

          {hasLiked && (
            <div className="story-like-burst">
              <Heart size={64} fill="#E8604C" color="#E8604C" />
            </div>
          )}
        </div>

        {/* Story Reply Footer */}
        <div className="story-footer-row">
          <form className="story-reply-form" onSubmit={handleSendReply}>
            <input 
              type="text" 
              placeholder={`Reply to ${storyData.userName}...`}
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              onFocus={() => setIsPaused(true)}
              onBlur={() => setIsPaused(false)}
              className="story-reply-input"
            />
            {replyText.trim() && (
              <button type="submit" className="story-send-btn">
                <Send size={16} />
              </button>
            )}
          </form>
          <button 
            className={`story-heart-reaction ${hasLiked ? 'liked' : ''}`}
            onClick={handleLikeStory}
          >
            <Heart size={24} fill={hasLiked ? "#E8604C" : "none"} color={hasLiked ? "#E8604C" : "#fff"} />
          </button>
        </div>
      </div>
    </div>
  );
}
