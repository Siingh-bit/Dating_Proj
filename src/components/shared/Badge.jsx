import React from 'react';
import './Badge.css';

const PHASE_CONFIG = {
  liking: { emoji: '💫', label: 'Liking', color: '#FF6B9D' },
  talking: { emoji: '💬', label: 'Talking', color: '#7C4DFF' },
  dating: { emoji: '☕', label: 'Dating', color: '#FF5252' },
  serious: { emoji: '❤️', label: 'Serious', color: '#FFD700' },
};

const Badge = ({
  variant = 'status',
  phase,
  status = 'online',
  count = 0,
  className = ''
}) => {
  if (variant === 'phase' && phase && PHASE_CONFIG[phase]) {
    const { emoji, label, color } = PHASE_CONFIG[phase];
    return (
      <div className={`badge badge-phase ${className}`} style={{ '--phase-color': color }}>
        <span className="badge-dot" style={{ backgroundColor: color }}></span>
        <span className="badge-text">{emoji} {label}</span>
      </div>
    );
  }

  if (variant === 'count') {
    return (
      <div className={`badge badge-count ${className}`}>
        {count > 99 ? '99+' : count}
      </div>
    );
  }

  const isOnline = status === 'online';
  return (
    <div className={`badge badge-status ${className}`}>
      <span className="badge-dot" style={{ backgroundColor: isOnline ? '#4CAF50' : '#9B95A5' }}></span>
      <span className="badge-text">{isOnline ? 'Online' : 'Offline'}</span>
    </div>
  );
};

export default Badge;
