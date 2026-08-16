import React, { useState } from 'react';
import { X, Sparkles, MapPin, Calendar, Clock, Heart, Send, Check } from 'lucide-react';
import { playPop, playMatchChime } from '../../utils/soundEffects';
import './FirstDatePlannerModal.css';

const VIBES = [
  { id: 'cozy_cafe', label: '☕ Cozy Cafe & Books', icon: '☕', desc: 'Indie cafe, vinyl background, long deep talks' },
  { id: 'sunset_rooftop', label: '🌅 Sunset Rooftop & Drinks', icon: '🍸', desc: 'Skyline views, craft mocktails, evening breeze' },
  { id: 'pottery_art', label: '🏺 Pottery & Art Studio', icon: '🎨', desc: 'Get hands dirty making ceramic art together' },
  { id: 'street_food', label: '🌮 Street Food & Night Walk', icon: '🍢', desc: 'Bustling night market food crawl & fun chaos' },
  { id: 'live_gig', label: '🎸 Live Indie Gig / Jazz', icon: '🎵', desc: 'Live acoustic music, dim lights & dancing' },
];

const LOCATIONS = [
  'Bandra, Mumbai',
  'Indiranagar, Bangalore',
  'Hauz Khas Village, Delhi',
  'Koregaon Park, Pune',
  'Jubilee Hills, Hyderabad',
  'Cyber Hub, Gurgaon',
];

export default function FirstDatePlannerModal({ matchProfile, onClose, onSendItinerary }) {
  const [selectedVibe, setSelectedVibe] = useState(VIBES[0]);
  const [selectedLocation, setSelectedLocation] = useState(matchProfile?.location || LOCATIONS[0]);
  const [selectedDay, setSelectedDay] = useState('This Saturday');
  const [selectedTime, setSelectedTime] = useState('6:00 PM');
  const [customNote, setCustomNote] = useState('');

  const handleSend = () => {
    playMatchChime();
    if (onSendItinerary) {
      onSendItinerary({
        type: 'date_itinerary',
        vibe: selectedVibe.label,
        icon: selectedVibe.icon,
        location: selectedLocation,
        day: selectedDay,
        time: selectedTime,
        note: customNote || `Hey ${matchProfile?.name}! What do you think of this for Date #1? 🥂`,
      });
    }
    onClose();
  };

  return (
    <div className="date-planner-backdrop" onClick={onClose}>
      <div className="date-planner-modal animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="planner-header">
          <div className="planner-title-box">
            <span className="planner-badge">
              <Sparkles size={13} /> First Date Architect
            </span>
            <h3>Plan Date #1 with {matchProfile?.name}</h3>
          </div>
          <button className="planner-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="planner-body hide-scrollbar">
          {/* Step 1: Select the Vibe */}
          <div className="planner-section">
            <label className="section-label">1. Choose the Vibe</label>
            <div className="vibes-grid">
              {VIBES.map((v) => (
                <button
                  key={v.id}
                  className={`vibe-btn ${selectedVibe.id === v.id ? 'active' : ''}`}
                  onClick={() => {
                    playPop();
                    setSelectedVibe(v);
                  }}
                >
                  <span className="vibe-title">{v.label}</span>
                  <span className="vibe-desc">{v.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Location */}
          <div className="planner-section">
            <label className="section-label">2. Neighborhood / Area</label>
            <div className="loc-pills">
              {LOCATIONS.map((loc) => (
                <button
                  key={loc}
                  className={`loc-pill ${selectedLocation === loc ? 'active' : ''}`}
                  onClick={() => {
                    playPop();
                    setSelectedLocation(loc);
                  }}
                >
                  <MapPin size={12} /> {loc}
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Day & Time */}
          <div className="planner-section">
            <label className="section-label">3. Ideal Timing</label>
            <div className="timing-row">
              <select 
                value={selectedDay} 
                onChange={e => setSelectedDay(e.target.value)}
                className="planner-select"
              >
                <option>This Friday</option>
                <option>This Saturday</option>
                <option>This Sunday</option>
                <option>Next Weekend</option>
                <option>Weekday Evening</option>
              </select>

              <select 
                value={selectedTime} 
                onChange={e => setSelectedTime(e.target.value)}
                className="planner-select"
              >
                <option>5:00 PM (Sunset)</option>
                <option>6:00 PM</option>
                <option>7:30 PM (Dinner)</option>
                <option>8:30 PM (Night vibe)</option>
                <option>11:00 AM (Brunch)</option>
              </select>
            </div>
          </div>

          {/* Step 4: Preview Card */}
          <div className="planner-itinerary-preview">
            <div className="itinerary-tag">✨ Invitation Preview</div>
            <h4>{selectedVibe.label}</h4>
            <div className="preview-meta">
              <span><MapPin size={13} /> {selectedLocation}</span>
              <span><Calendar size={13} /> {selectedDay} • {selectedTime}</span>
            </div>
          </div>
        </div>

        <div className="planner-footer">
          <button className="send-itinerary-btn" onClick={handleSend}>
            <Send size={16} /> Send First Date Card to Chat
          </button>
        </div>
      </div>
    </div>
  );
}
