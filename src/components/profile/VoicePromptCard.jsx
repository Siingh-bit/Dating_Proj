import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Mic, Volume2 } from 'lucide-react';
import { playVoiceMelody, playPop } from '../../utils/soundEffects';
import './VoicePromptCard.css';

export default function VoicePromptCard({ voicePrompt, name }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const stopMelodyRef = useRef(null);
  const timerRef = useRef(null);

  const duration = voicePrompt?.duration || 12;

  const handleTogglePlay = () => {
    playPop();
    if (isPlaying) {
      setIsPlaying(false);
      setProgress(0);
      if (stopMelodyRef.current) stopMelodyRef.current();
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      setIsPlaying(true);
      setProgress(0);

      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const pct = Math.min(100, (elapsed / duration) * 100);
        setProgress(pct);
        if (pct >= 100) {
          setIsPlaying(false);
          setProgress(0);
          clearInterval(timerRef.current);
        }
      }, 100);

      stopMelodyRef.current = playVoiceMelody(duration, () => {
        setIsPlaying(false);
        setProgress(0);
        if (timerRef.current) clearInterval(timerRef.current);
      });
    }
  };

  useEffect(() => {
    return () => {
      if (stopMelodyRef.current) stopMelodyRef.current();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (!voicePrompt) return null;

  return (
    <div className="voice-prompt-card">
      <div className="voice-header">
        <span className="voice-badge">
          <Mic size={14} /> Voice Prompt
        </span>
        <span className="voice-duration">
          {isPlaying ? `${Math.floor((progress / 100) * duration)}s` : voicePrompt.durationLabel || `${duration}s`}
        </span>
      </div>

      <h4 className="voice-question">{voicePrompt.question}</h4>

      <div className="voice-player-row">
        <button 
          className={`voice-play-btn ${isPlaying ? 'playing' : ''}`}
          onClick={handleTogglePlay}
          aria-label={isPlaying ? 'Pause voice prompt' : 'Play voice prompt'}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
        </button>

        <div className="waveform-container">
          <div className="waveform-bars">
            {[40, 65, 85, 45, 95, 70, 50, 80, 100, 60, 40, 75, 90, 55, 35, 80, 95, 60, 45, 70].map((height, i) => (
              <span
                key={i}
                className={`wave-bar ${isPlaying ? 'animating' : ''} ${progress >= (i / 20) * 100 ? 'filled' : ''}`}
                style={{ 
                  height: `${height}%`,
                  animationDelay: `${(i % 5) * 0.12}s`
                }}
              />
            ))}
          </div>
          <div className="waveform-progress" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {voicePrompt.caption && (
        <p className="voice-caption">
          "{voicePrompt.caption}"
        </p>
      )}
    </div>
  );
}
