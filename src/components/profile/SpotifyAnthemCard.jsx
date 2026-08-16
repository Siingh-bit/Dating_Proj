import React, { useState } from 'react';
import { Music, Disc3, Play, Pause } from 'lucide-react';
import { playPop } from '../../utils/soundEffects';
import './SpotifyAnthemCard.css';

export default function SpotifyAnthemCard({ spotify, name }) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!spotify) return null;

  const handleToggle = () => {
    playPop();
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="spotify-anthem-card">
      <div className="spotify-top-row">
        <div className="spotify-brand">
          <span className="spotify-icon">🟢</span>
          <span className="spotify-label">My Anthem & Vibe</span>
        </div>
        <span className="spotify-badge">Spotify</span>
      </div>

      <div className="anthem-player-box">
        <div className={`vinyl-record ${isPlaying ? 'spinning' : ''}`} onClick={handleToggle}>
          <div className="vinyl-grooves">
            <div className="vinyl-center">
              <Disc3 size={20} className="vinyl-disc-icon" />
            </div>
          </div>
        </div>

        <div className="anthem-details">
          <h4 className="anthem-title">{spotify.anthem || 'Favorite Track'}</h4>
          <p className="anthem-artist">{spotify.artist || name}</p>
          <div className="sound-visualizer">
            <span className={`bar ${isPlaying ? 'active' : ''}`} />
            <span className={`bar ${isPlaying ? 'active' : ''}`} />
            <span className={`bar ${isPlaying ? 'active' : ''}`} />
            <span className={`bar ${isPlaying ? 'active' : ''}`} />
          </div>
        </div>

        <button 
          className={`anthem-play-btn ${isPlaying ? 'playing' : ''}`}
          onClick={handleToggle}
          aria-label={isPlaying ? 'Pause anthem' : 'Play anthem'}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}
        </button>
      </div>

      {spotify.topArtists && spotify.topArtists.length > 0 && (
        <div className="top-artists-container">
          <span className="top-artists-label">Top Artists on Repeat:</span>
          <div className="artist-chips">
            {spotify.topArtists.map((artist, idx) => (
              <span key={idx} className="artist-chip">
                <Music size={11} /> {artist}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
