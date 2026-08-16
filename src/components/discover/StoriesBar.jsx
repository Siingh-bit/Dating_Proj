import React from 'react';
import { Plus, Flame, Sparkles } from 'lucide-react';
import { playPop } from '../../utils/soundEffects';
import './StoriesBar.css';

export default function StoriesBar({ stories, onSelectStory, onAddStory }) {
  if (!stories || stories.length === 0) return null;

  return (
    <div className="stories-bar-container hide-scrollbar">
      <div className="stories-bar-track">
        {stories.map((item) => (
          <div 
            key={item.id} 
            className="story-item"
            onClick={() => {
              playPop();
              if (item.isSelf && !item.hasStory) {
                if (onAddStory) onAddStory();
              } else {
                if (onSelectStory) onSelectStory(item);
              }
            }}
          >
            <div className={`story-ring ${item.isSelf && !item.hasStory ? 'self-add' : 'has-story'}`}>
              <img src={item.avatar} alt={item.userName} className="story-avatar-img" />
              {item.isSelf && !item.hasStory ? (
                <div className="add-story-badge">
                  <Plus size={12} strokeWidth={3} />
                </div>
              ) : (
                <div className="story-glow-dot" />
              )}
            </div>
            <span className="story-username">
              {item.isSelf ? 'Your Vibe' : item.userName}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
