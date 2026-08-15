import React, { useState } from 'react';
import { Eye, EyeOff, Image as ImageIcon, Trash2, X, Gamepad2 } from 'lucide-react';
import { formatTime } from '../../utils/helpers';
import './MessageBubble.css';

export default function MessageBubble({ message, isOwn, showTimestamp, onUnsend, onViewOnce }) {
  const [showFullImage, setShowFullImage] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const media = message.media;

  const handleViewOnceClick = () => {
    if (media?.mode === 'view_once' && !media.viewed) {
      setShowFullImage(true);
    } else if (media?.mode === 'permanent') {
      setShowFullImage(true);
    }
  };

  const handleCloseFullImage = () => {
    setShowFullImage(false);
    if (media?.mode === 'view_once' && !media.viewed && onViewOnce) {
      onViewOnce(message.id);
    }
  };

  return (
    <div className={`message-bubble-container ${isOwn ? 'is-own' : 'is-other'}`}>
      <div className="message-wrapper">
        {/* Unsend trigger for own messages */}
        {isOwn && (
          <button 
            className="unsend-action-btn"
            onClick={() => onUnsend && onUnsend(message)}
            title="Unsend Message"
          >
            <Trash2 size={14} />
          </button>
        )}

        <div className={`message-bubble animate-fade-in-up ${media ? 'has-media' : ''}`}>
          {/* Media Content */}
          {media && (
            <div className="media-content-block">
              {media.mode === 'view_once' ? (
                <div 
                  className={`view-once-card ${media.viewed ? 'is-opened' : 'is-unopened'}`}
                  onClick={handleViewOnceClick}
                >
                  {media.viewed ? (
                    <span className="view-once-text"><EyeOff size={16} /> Opened</span>
                  ) : (
                    <span className="view-once-text"><Eye size={16} /> View Once Photo <span className="tap-hint">(Tap to view)</span></span>
                  )}
                </div>
              ) : (
                <div className="permanent-photo-card" onClick={handleViewOnceClick}>
                  <img src={media.url} alt="Shared photo" className="chat-inline-photo" />
                </div>
              )}
            </div>
          )}

          {/* Game Content */}
          {message.gameData && (
            <div className="game-content-block">
              <div className="game-badge">
                <Gamepad2 size={14} /> {message.gameData.type?.replace(/_/g, ' ').toUpperCase()}
              </div>

              {message.gameData.type === 'truth_or_dare' && (
                <div className="game-tod-card">
                  <span className="tod-mode">{message.gameData.mode?.toUpperCase()}</span>
                  <p className="tod-text">{message.gameData.text}</p>
                </div>
              )}

              {message.gameData.type === 'would_you_rather' && (
                <div className="game-wyr-card">
                  <p className="wyr-question">{message.gameData.question}</p>
                  <div className="wyr-choice">Picked: <strong>{message.gameData.userChoice}</strong></div>
                  <div className="wyr-match-tag">❤️ {message.gameData.matchPercentage}% Compatibility</div>
                </div>
              )}

              {message.gameData.type === 'two_lies_one_truth' && (
                <div className="game-tlt-card">
                  <p className="tlt-intro">Which statement is the TRUTH?</p>
                  {message.gameData.statements?.map((stmt, i) => (
                    <div key={i} className="tlt-stmt-bubble">
                      <span>{i + 1}.</span> {stmt}
                    </div>
                  ))}
                </div>
              )}

              {message.gameData.type === 'compatibility_quiz' && (
                <div className="game-compat-card">
                  <div className="compat-score-num">{message.gameData.score}% MATCH</div>
                  <p className="compat-summary">{message.gameData.breakdown}</p>
                </div>
              )}

              {message.gameData.type === 'emoji_decoder' && (
                <div className="game-emoji-card">
                  <div className="emoji-score-banner">Score: {message.gameData.score} pts</div>
                  <p className="emoji-solved">{message.gameData.puzzlesSolved} Puzzles Decoded!</p>
                </div>
              )}

              {message.gameData.type === 'couple_trivia' && (
                <div className="game-trivia-card">
                  <div className="trivia-score-banner">{message.gameData.score} / {message.gameData.total} Correct</div>
                </div>
              )}

              {message.gameData.type === 'twenty_questions' && (
                <div className="game-twenty-card">
                  <span className="twenty-cat">Category: {message.gameData.category}</span>
                  <p className="twenty-text">I've picked a secret! Ask me YES/NO questions to guess it.</p>
                </div>
              )}

              {message.gameData.type === 'doodle_draw' && (
                <div className="game-doodle">
                  <span className="game-doodle-prompt">"{message.gameData.prompt}"</span>
                  <img src={message.gameData.dataUrl} alt="Doodle" className="chat-inline-photo doodle-img" />
                </div>
              )}

              {message.gameData.type === 'love_fortune' && (
                <div className="game-fortune">
                  {message.gameData.card1 && <div className="fortune-result"><strong>{message.gameData.card1.title}:</strong> {message.gameData.card1.text}</div>}
                  {message.gameData.card2 && <div className="fortune-result"><strong>{message.gameData.card2.title}:</strong> {message.gameData.card2.text}</div>}
                  {message.gameData.card3 && <div className="fortune-result"><strong>{message.gameData.card3.title}:</strong> {message.gameData.card3.text}</div>}
                </div>
              )}

              {message.gameData.type === 'finish_lyric' && (
                <div className="game-lyric">
                  <span className="game-score">Love Song Quiz Score: {message.gameData.score}/{message.gameData.total}</span>
                </div>
              )}
            </div>
          )}

          {/* Text Content */}
          {message.text && (!media || (media.mode === 'view_once' && media.viewed) ? null : <div className="message-text">{message.text}</div>)}
        </div>
      </div>

      {showTimestamp && (
        <div className="message-timestamp animate-fade-in">
          {formatTime(message.timestamp)}
        </div>
      )}

      {/* Lightbox Photo Viewer Modal */}
      {showFullImage && media && (
        <div className="media-lightbox-overlay animate-fade-in" onClick={handleCloseFullImage}>
          <button className="lightbox-close-btn" onClick={handleCloseFullImage}>
            <X size={24} />
          </button>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={media.url} alt="Shared media" className="lightbox-image" />
            {media.mode === 'view_once' && (
              <div className="view-once-notice-banner">
                <Eye size={14} /> This photo will disappear once closed
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
