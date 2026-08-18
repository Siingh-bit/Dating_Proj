import React, { useState } from 'react';
import { Eye, EyeOff, Image as ImageIcon, Trash2, X, Gamepad2, Check } from 'lucide-react';
import { formatTime } from '../../utils/helpers';
import './MessageBubble.css';

/* Rendered as their own card elsewhere in this component, not inside the
   mini-game block. */
const FEATURE_CARD_TYPES = ['date_itinerary', 'music_swap', 'graceful_closure'];

/* Game types that have a bespoke result card below. Anything NOT listed here
   falls back to showing the game's summary text, so a new game is never
   silently rendered as an empty bubble. Add a type here when you add its card. */
const GAMES_WITH_CUSTOM_CARD = [
  'truth_or_dare',
  'would_you_rather',
  'two_lies_one_truth',
  'compatibility_quiz',
  'emoji_decoder',
  'couple_trivia',
  'twenty_questions',
  'doodle_draw',
  'love_fortune',
  'finish_lyric',
];

export default function MessageBubble({ message, isOwn, showTimestamp, onUnsend, onViewOnce }) {
  const [showFullImage, setShowFullImage] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [rsvp, setRsvp] = useState(null);   // null | 'accepted' | 'tweak'

  const media = message.media;
  const dateData = message.gameData?.type === 'date_itinerary' ? message.gameData : (
    message.text?.startsWith('✨ Proposed Date #1:') ? {
      type: 'date_itinerary',
      vibe: message.text.replace('✨ Proposed Date #1:', '').trim(),
      note: "Hey! What do you think of this for Date #1? 🥂",
      day: "This Weekend",
      time: "Evening",
    } : null
  );

  const musicData = message.gameData?.type === 'music_swap' ? message.gameData : (
    message.text?.startsWith('🎵 Shared track:') ? {
      type: 'music_swap',
      track: message.text.replace('🎵 Shared track:', '').trim(),
      artist: 'Spotify Track',
      note: "Thought you'd love this track! 🎵",
    } : null
  );

  const closureData = message.gameData?.type === 'graceful_closure' ? message.gameData : (
    message.text?.startsWith('🕊️') ? {
      type: 'graceful_closure',
      note: message.text.replace('🕊️', '').trim(),
    } : null
  );

  const gameType = message.gameData?.type;
  const isGameResult = !!message.gameData && !FEATURE_CARD_TYPES.includes(gameType);
  /* No bespoke card for this game -> show its summary text instead of an
     empty badge. */
  const needsSummaryFallback = isGameResult && !GAMES_WITH_CUSTOM_CARD.includes(gameType);
  const summaryText = message.gameData?.summaryText || message.text;

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

          {/* Special Feature Cards (Date Itinerary, Music Swap, Graceful Closure) */}
          {dateData && (
            <div className="chat-itinerary-card">
              <div className="itinerary-header-badge">
                <span>✨ First Date Invitation</span>
              </div>
              <h4 className="itinerary-vibe-title">{dateData.vibe || 'Curated Date Night'}</h4>
              <div className="itinerary-details">
                {dateData.location && <p>📍 {dateData.location}</p>}
                {(dateData.day || dateData.time) && (
                  <p>📅 {dateData.day || 'This Weekend'} • {dateData.time || 'Evening'}</p>
                )}
              </div>
              {dateData.note && <p className="itinerary-note">"{dateData.note}"</p>}
              {rsvp ? (
                <div className={`itinerary-rsvp-state is-${rsvp}`} role="status">
                  <Check size={15} />
                  <span>{rsvp === 'accepted' ? "You're going" : 'Change suggested'}</span>
                </div>
              ) : (
                <div className="itinerary-rsvp-row">
                  <button className="rsvp-btn accepted" onClick={() => setRsvp('accepted')}>
                    Count me in
                  </button>
                  <button className="rsvp-btn tweak" onClick={() => setRsvp('tweak')}>
                    Suggest a change
                  </button>
                </div>
              )}
            </div>
          )}

          {musicData && (
            <div className="chat-music-card">
              <div className="music-header-badge">
                <span>🟢 Spotify Track Swap</span>
              </div>
              <div className="music-body-box">
                <div className="music-note-icon">🎵</div>
                <div className="music-text-meta">
                  <h4>{musicData.track}</h4>
                  <p>{musicData.artist}</p>
                </div>
              </div>
              {musicData.note && <p className="music-shared-note">"{musicData.note}"</p>}
            </div>
          )}

          {closureData && (
            <div className="chat-closure-card">
              <div className="closure-badge-pill">
                <span>🕊️ Respectful Closure</span>
              </div>
              <p className="closure-note-body">{closureData.note}</p>
            </div>
          )}

          {/* Mini-Games Content */}
          {isGameResult && (
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

              {/* Fallback for games without a bespoke card — without this the
                  bubble would show only the badge and drop the result entirely. */}
              {needsSummaryFallback && summaryText && (
                <p className="game-summary-text">{summaryText}</p>
              )}
            </div>
          )}

          {/* Normal Text Content: Always render if present and not a viewed view-once */}
          {message.text && !message.gameData && !(media?.mode === 'view_once' && media?.viewed) && (
            <div className="message-text">{message.text}</div>
          )}
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
