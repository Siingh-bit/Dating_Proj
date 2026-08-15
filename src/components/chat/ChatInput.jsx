import React, { useState } from 'react';
import { ArrowUp, Camera, Gamepad2 } from 'lucide-react';
import './ChatInput.css';

export default function ChatInput({ onSend, onOpenMediaPicker, onOpenGameLounge, disabled, disabledReason }) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim() && !disabled) {
      onSend(text.trim());
      setText('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`chat-input-container ${disabled ? 'is-disabled' : ''}`}>
      <div className="chat-input-wrapper">
        <button 
          className="chat-media-btn"
          onClick={onOpenMediaPicker}
          disabled={disabled}
          title="Share Photo"
        >
          <Camera size={20} />
        </button>

        <button 
          className="chat-game-btn"
          onClick={onOpenGameLounge}
          disabled={disabled}
          title="Play a Game"
        >
          <Gamepad2 size={20} />
        </button>

        <input
          type="text"
          className="chat-input-field"
          placeholder={disabled ? disabledReason : "Type a message..."}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        <button 
          className={`chat-send-btn ${text.trim().length > 0 ? 'is-visible' : ''}`}
          onClick={handleSend}
          disabled={disabled || text.trim().length === 0}
        >
          <ArrowUp size={18} />
        </button>
      </div>
    </div>
  );
}
