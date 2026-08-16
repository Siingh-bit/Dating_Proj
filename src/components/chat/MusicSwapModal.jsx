import React, { useState } from 'react';
import { X, Music, Disc3, Send, Play, Pause, Search } from 'lucide-react';
import { playPop, playMatchChime } from '../../utils/soundEffects';
import './MusicSwapModal.css';

const CURATED_TRACKS = [
  { id: 1, title: 'Kasoor', artist: 'Prateek Kuhad', album: 'Kasoor Single', vibe: 'Soulful & Romantic 🎸' },
  { id: 2, title: 'Baarishein', artist: 'Anuv Jain', album: 'Baarishein', vibe: 'Acoustic Rain Vibe 🌧️' },
  { id: 3, title: 'Chaand Baaliyan', artist: 'Aditya A', album: 'Chaand Baaliyan', vibe: 'Upbeat & Sweet 🌙' },
  { id: 4, title: 'Kho Gaye Hum Kahan', artist: 'Jasleen Royal & Prateek Kuhad', album: 'Baar Baar Dekho', vibe: 'Dreamy Serenade ✨' },
  { id: 5, title: 'Liggi', artist: 'Ritviz', album: 'DEV', vibe: 'High Energy Indie Electronic ⚡' },
  { id: 6, title: 'Sage', artist: 'Ritviz', album: 'VED', vibe: 'Sunset Drive Melody 🌅' },
  { id: 7, title: 'Alag Aasmaan', artist: 'Anuv Jain', album: 'Alag Aasmaan', vibe: 'Long Distance Acoustic ✈️' },
];

export default function MusicSwapModal({ matchProfile, onClose, onSendTrack }) {
  const [selectedTrack, setSelectedTrack] = useState(CURATED_TRACKS[0]);
  const [customQuery, setCustomQuery] = useState('');
  const [personalNote, setPersonalNote] = useState('');

  const filteredTracks = customQuery.trim()
    ? CURATED_TRACKS.filter(t => 
        t.title.toLowerCase().includes(customQuery.toLowerCase()) || 
        t.artist.toLowerCase().includes(customQuery.toLowerCase())
      )
    : CURATED_TRACKS;

  const handleSend = () => {
    playMatchChime();
    if (onSendTrack) {
      onSendTrack({
        type: 'music_swap',
        track: selectedTrack.title,
        artist: selectedTrack.artist,
        note: personalNote || `Hey ${matchProfile?.name}, thought you'd love this song! 🎵`,
      });
    }
    onClose();
  };

  return (
    <div className="music-swap-backdrop" onClick={onClose}>
      <div className="music-swap-modal animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="music-swap-header">
          <div className="music-swap-title-box">
            <span className="music-swap-badge">
              <Music size={13} /> Music Swap
            </span>
            <h3>Share a Song with {matchProfile?.name}</h3>
          </div>
          <button className="music-swap-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="music-swap-body hide-scrollbar">
          {/* Search bar */}
          <div className="track-search-box">
            <Search size={14} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search artist or song..."
              value={customQuery}
              onChange={e => setCustomQuery(e.target.value)}
              className="track-search-input"
            />
          </div>

          {/* Tracks list */}
          <div className="tracks-list">
            {filteredTracks.map((track) => (
              <div 
                key={track.id}
                className={`track-item ${selectedTrack.id === track.id ? 'active' : ''}`}
                onClick={() => {
                  playPop();
                  setSelectedTrack(track);
                }}
              >
                <div className="track-disc">
                  <Disc3 size={18} />
                </div>
                <div className="track-info">
                  <h4>{track.title}</h4>
                  <p>{track.artist} • <span className="track-vibe">{track.vibe}</span></p>
                </div>
              </div>
            ))}
          </div>

          {/* Personal Note */}
          <div className="music-note-box">
            <label>Why do you love this track?</label>
            <input 
              type="text" 
              placeholder="e.g. This is on repeat every morning..."
              value={personalNote}
              onChange={e => setPersonalNote(e.target.value)}
              className="music-note-input"
            />
          </div>
        </div>

        <div className="music-swap-footer">
          <button className="send-track-btn" onClick={handleSend}>
            <Send size={15} /> Send Song Card to Chat
          </button>
        </div>
      </div>
    </div>
  );
}
