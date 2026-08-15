import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, RefreshCw, Volume2 } from 'lucide-react';
import './CallOverlay.css';

export default function CallOverlay({ profile, callType = 'video', onClose }) {
  const [status, setStatus] = useState('Ringing...'); // 'Ringing...', 'Connected'
  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(callType === 'audio');
  const [isFrontCam, setIsFrontCam] = useState(true);

  useEffect(() => {
    // Simulate answering call after 2.5 seconds
    const ringTimer = setTimeout(() => {
      setStatus('Connected');
    }, 2500);

    return () => clearTimeout(ringTimer);
  }, []);

  useEffect(() => {
    let interval = null;
    if (status === 'Connected') {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="call-overlay animate-fade-in">
      {/* Background Video / Visualizer */}
      {callType === 'video' && !isVideoOff ? (
        <div className="video-background">
          <img src={profile.photos[0]} alt={profile.name} className="remote-video-feed" />
          <div className="video-feed-overlay"></div>
          
          {/* Local camera PIP */}
          <div className="local-video-pip">
            <div className="pip-video-feed">
              <span className="pip-label">You</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="audio-background">
          <div className={`avatar-container ${status === 'Ringing...' ? 'is-ringing' : 'is-connected'}`}>
            <div className="pulse-ring ring-1"></div>
            <div className="pulse-ring ring-2"></div>
            <img src={profile.photos[0]} alt={profile.name} className="audio-call-avatar" />
          </div>
        </div>
      )}

      {/* Header Info */}
      <div className="call-header">
        <h2 className="call-name">{profile.name}</h2>
        <div className="call-status-badge">
          {status === 'Ringing...' ? (
            <span className="status-text ringing-pulse">{callType === 'video' ? 'Outgoing Video Call...' : 'Outgoing Audio Call...'}</span>
          ) : (
            <span className="status-text connected-time">Connected • {formatTimer(seconds)}</span>
          )}
        </div>
      </div>

      {/* Call Actions Bar */}
      <div className="call-actions-bar">
        <button 
          className={`call-action-btn ${isMuted ? 'active-off' : ''}`}
          onClick={() => setIsMuted(!isMuted)}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
        </button>

        {callType === 'video' && (
          <button 
            className={`call-action-btn ${isVideoOff ? 'active-off' : ''}`}
            onClick={() => setIsVideoOff(!isVideoOff)}
            title={isVideoOff ? "Turn Camera On" : "Turn Camera Off"}
          >
            {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
          </button>
        )}

        {callType === 'video' && !isVideoOff && (
          <button 
            className="call-action-btn"
            onClick={() => setIsFrontCam(!isFrontCam)}
            title="Flip Camera"
          >
            <RefreshCw size={22} />
          </button>
        )}

        {callType === 'audio' && (
          <button className="call-action-btn">
            <Volume2 size={24} />
          </button>
        )}

        <button 
          className="call-action-btn end-call-btn"
          onClick={onClose}
          title="End Call"
        >
          <PhoneOff size={26} />
        </button>
      </div>
    </div>
  );
}
