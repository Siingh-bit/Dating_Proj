import React, { useState } from 'react';
import { Check } from 'lucide-react';
import './Avatar.css';

const Avatar = ({
  src,
  alt,
  name,
  size = 'md',
  isOnline = false,
  isVerified = false,
  className = ''
}) => {
  const [imgError, setImgError] = useState(false);

  const getInitials = (str) => {
    if (!str) return '?';
    return str.substring(0, 1).toUpperCase();
  };

  const classes = ['avatar-wrapper', `avatar-${size}`, className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <div className="avatar-image-container">
        {src && !imgError ? (
          <img 
            src={src} 
            alt={alt || name} 
            className="avatar-image" 
            onError={() => setImgError(true)} 
          />
        ) : (
          <div className="avatar-fallback">
            {getInitials(name)}
          </div>
        )}
      </div>
      
      {isOnline && <div className="avatar-online-dot"></div>}
      
      {isVerified && (
        <div className="avatar-verified-badge">
          <Check size={size === 'sm' ? 8 : size === 'md' ? 10 : 12} strokeWidth={3} />
        </div>
      )}
    </div>
  );
};

export default Avatar;
