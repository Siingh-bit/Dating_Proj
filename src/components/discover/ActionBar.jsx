import React from 'react';
import { Heart, X, Sparkles } from 'lucide-react';
import './ActionBar.css';

export default function ActionBar({ onSkip, onLike, onRose, likesRemaining }) {
  return (
    <div className="action-bar">
      <button className="action-btn btn-skip" onClick={onSkip}>
        <X size={24} />
      </button>
      
      <button className="action-btn btn-like" onClick={onLike}>
        <Heart size={28} fill="currentColor" />
        {likesRemaining !== undefined && (
          <span className="likes-badge">{likesRemaining}</span>
        )}
      </button>
      
      <button className="action-btn btn-rose" onClick={onRose}>
        <Sparkles size={24} fill="currentColor" />
      </button>
    </div>
  );
}
