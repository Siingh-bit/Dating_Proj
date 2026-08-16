import React from 'react';
import { Heart, X, Star } from 'lucide-react';
import './ActionBar.css';

export default function ActionBar({ onSkip, onLike, onRose, likesRemaining }) {
  return (
    <div className="action-bar">
      <button 
        className="action-btn btn-skip" 
        onClick={onSkip}
        title="Pass / Swipe Left"
        aria-label="Pass"
      >
        <X size={26} strokeWidth={2.5} />
      </button>
      
      <button 
        className="action-btn btn-superlike" 
        onClick={onRose}
        title="Superlike / Rose (Swipe Up)"
        aria-label="Superlike / Rose"
      >
        <div className="superlike-glow-ring" />
        <Star size={26} fill="currentColor" strokeWidth={1.5} />
        <span className="superlike-sparkle-dot dot-1">✦</span>
        <span className="superlike-sparkle-dot dot-2">✦</span>
      </button>

      <button 
        className="action-btn btn-like" 
        onClick={onLike}
        title="Like (Swipe Right)"
        aria-label="Like"
      >
        <Heart size={28} fill="currentColor" />
        {likesRemaining !== undefined && (
          <span className="likes-badge">{likesRemaining}</span>
        )}
      </button>
    </div>
  );
}

