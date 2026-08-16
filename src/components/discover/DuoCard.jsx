import React from 'react';
import { Users, Sparkles, MapPin, Heart, MessageSquare } from 'lucide-react';
import { playPop } from '../../utils/soundEffects';
import './DuoCard.css';

export default function DuoCard({ duoProfile, onLike, onSkip }) {
  if (!duoProfile) return null;

  return (
    <div className="duo-card-container">
      <div className="duo-badge-header">
        <span className="duo-tag">
          <Users size={14} /> Double Date Match
        </span>
        <span className="duo-city">
          <MapPin size={12} /> {duoProfile.city}
        </span>
      </div>

      <div className="duo-photos-split">
        <div className="duo-person-side">
          <img src={duoProfile.person1.photo} alt={duoProfile.person1.name} className="duo-img" />
          <div className="duo-person-info">
            <h4>{duoProfile.person1.name}, {duoProfile.person1.age}</h4>
            <span className="duo-role">{duoProfile.person1.role}</span>
            <p className="duo-vibe">✨ {duoProfile.person1.vibe}</p>
          </div>
        </div>

        <div className="duo-vs-divider">
          <span>&</span>
        </div>

        <div className="duo-person-side">
          <img src={duoProfile.person2.photo} alt={duoProfile.person2.name} className="duo-img" />
          <div className="duo-person-info">
            <h4>{duoProfile.person2.name}, {duoProfile.person2.age}</h4>
            <span className="duo-role">{duoProfile.person2.role}</span>
            <p className="duo-vibe">✨ {duoProfile.person2.vibe}</p>
          </div>
        </div>
      </div>

      <div className="duo-headline-card">
        <p className="duo-headline-text">"{duoProfile.headline}"</p>
      </div>

      <div className="duo-joint-prompt">
        <span className="prompt-label">{duoProfile.jointPrompt.question}</span>
        <p className="prompt-body">{duoProfile.jointPrompt.answer}</p>
      </div>

      {duoProfile.interests && (
        <div className="duo-interests-row">
          {duoProfile.interests.map((interest, i) => (
            <span key={i} className="duo-interest-chip">
              {interest}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
