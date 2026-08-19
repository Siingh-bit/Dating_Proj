import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useConversations } from '../contexts/ConversationContext';
import { canStartConversation, getSlotDisplay, getEndsDisplay } from '../utils/conversationRules';
import { timeAgo } from '../utils/helpers';
import { PHASE_CONFIG, STORIES } from '../data/mockData';
import StoriesBar from '../components/discover/StoriesBar';
import StoryViewerModal from '../components/discover/StoryViewerModal';
import { MoreVertical, Lock, X } from 'lucide-react';
import './MatchesPage.css';

export default function MatchesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { matches, activeCount, dispatch } = useConversations();

  const [selectedMatch, setSelectedMatch] = useState(null);
  const [modalType, setModalType] = useState(null); // 'start', 'full', 'menu', 'phase'
  const [activeStory, setActiveStory] = useState(null);
  const [storiesList, setStoriesList] = useState(STORIES);

  const slotsFull = !canStartConversation(user, activeCount);
  const fillPercentage = (activeCount / user.conversation_slots) * 100;

  const handleAddVibeSnap = (newStory) => {
    setStoriesList(prev => [newStory, ...prev]);
  };

  const sortedMatches = useMemo(() => {
    return [...matches].sort((a, b) => {
      if (a.isActiveConversation && !b.isActiveConversation) return -1;
      if (!a.isActiveConversation && b.isActiveConversation) return 1;
      
      const timeA = a.lastMessage?.timestamp || a.matchedAt;
      const timeB = b.lastMessage?.timestamp || b.matchedAt;
      return new Date(timeB) - new Date(timeA);
    });
  }, [matches]);

  const handleMatchClick = (match) => {
    navigate(`/app/chat/${match.id}`);
  };

  const handleMenuClick = (e, match) => {
    e.stopPropagation();
    setSelectedMatch(match);
    setModalType('menu');
  };

  const confirmStart = () => {
    dispatch({ type: 'START_CONVERSATION', payload: { matchId: selectedMatch.id } });
    navigate(`/app/chat/${selectedMatch.id}`);
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedMatch(null);
  };

  return (
    <div className="page page-with-topbar matches-page">
      <header className="matches-header">
        <h1>Messages & Matches <span>{matches.length}</span></h1>
      </header>

      {/* 24-Hour Active Match Stories Bar */}
      <StoriesBar 
        stories={storiesList}
        onSelectStory={(s) => setActiveStory(s)}
        onAddStory={handleAddVibeSnap}
      />

      <div className="page-content">
        <div className="status-banners">
          <div className="slot-banner">
            <div className="slot-info">
              <span className="slot-text">
                {slotsFull ? 'All conversation slots active' : `Talking to ${getSlotDisplay(user, activeCount)} people`}
              </span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${fillPercentage}%` }}></div>
            </div>
          </div>
          <div className="ends-banner">
            <span className="ends-text">{getEndsDisplay(user)} ends left this week</span>
          </div>
        </div>

        <div className="matches-list stagger-children">
          {sortedMatches.map(match => {
            const profile = match.matchedWith;
            const phaseInfo = PHASE_CONFIG[match.phase];
            const isInactiveAndFull = !match.isActiveConversation && slotsFull;

            return (
              <div 
                key={match.id} 
                className={`match-card ${match.isActiveConversation ? 'is-active' : ''} ${isInactiveAndFull ? 'is-locked' : ''}`}
                onClick={() => handleMatchClick(match)}
              >
                <div className="match-avatar-wrapper">
                  <img src={profile.photos[0]} alt={profile.name} className="match-avatar" />
                  <div className="online-dot"></div>
                  {isInactiveAndFull && (
                    <div className="avatar-overlay">
                      <Lock size={16} />
                    </div>
                  )}
                </div>
                
                <div className="match-info">
                  <div className="match-info-header">
                    <span className="match-name">{profile.name}, {profile.age}</span>
                    {match.lastMessage && (
                      <span className="match-time">{timeAgo(match.lastMessage.timestamp)}</span>
                    )}
                  </div>
                  <div className="match-preview">
                    {match.lastMessage ? match.lastMessage.text : `Matched ${timeAgo(match.matchedAt)}`}
                  </div>
                </div>

                <div className="match-actions">
                  <div className="phase-badge" style={{ color: phaseInfo.color }}>
                    <span className="phase-emoji">{phaseInfo.emoji}</span>
                  </div>
                  <button className="menu-btn" onClick={(e) => handleMenuClick(e, match)}>
                    <MoreVertical size={20} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {modalType === 'start' && selectedMatch && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content animate-scale-in" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={closeModal}><X size={20} /></button>
            <h3>Start talking to {selectedMatch.matchedWith.name}?</h3>
            <p>This will use one of your conversation slots.</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={closeModal}>Cancel</button>
              <button className="btn-primary" onClick={confirmStart}>Start</button>
            </div>
          </div>
        </div>
      )}

      {modalType === 'full' && selectedMatch && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content animate-scale-in" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={closeModal}><X size={20} /></button>
            <div className="modal-icon"><Lock size={32} /></div>
            <h3>All slots are full</h3>
            <p>End a current conversation to talk to {selectedMatch.matchedWith.name}.</p>
            <div className="modal-actions single">
              <button className="btn-secondary" onClick={closeModal}>View Active Conversations</button>
            </div>
          </div>
        </div>
      )}

      {modalType === 'menu' && selectedMatch && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content bottom-sheet animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="sheet-header">
              <h3>Options for {selectedMatch.matchedWith.name}</h3>
              <button className="close-btn" onClick={closeModal}><X size={20} /></button>
            </div>
            <div className="menu-list">
              <button className="menu-item" onClick={() => setModalType('phase')}>Update Phase</button>
              {selectedMatch.isActiveConversation && (
                <button className="menu-item text-warning" onClick={() => {
                  dispatch({ type: 'END_CONVERSATION', payload: { matchId: selectedMatch.id } });
                  closeModal();
                }}>End Conversation</button>
              )}
              <button className="menu-item text-error" onClick={closeModal}>Unmatch</button>
            </div>
          </div>
        </div>
      )}

      {modalType === 'phase' && selectedMatch && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content bottom-sheet animate-slide-up" onClick={e => e.stopPropagation()}>
             <div className="sheet-header">
              <h3>Update Phase</h3>
              <button className="close-btn" onClick={closeModal}><X size={20} /></button>
            </div>
            <div className="phase-options">
              {Object.entries(PHASE_CONFIG).map(([key, config]) => (
                <div 
                  key={key} 
                  className={`phase-option ${selectedMatch.phase === key ? 'selected' : ''}`}
                  onClick={() => {
                    dispatch({ type: 'UPDATE_PHASE', payload: { matchId: selectedMatch.id, phase: key } });
                    closeModal();
                  }}
                >
                  <div className="phase-option-icon" style={{ background: config.color + '20', color: config.color }}>
                    {config.emoji}
                  </div>
                  <div className="phase-option-text">
                    <h4>{config.label}</h4>
                    <p>{config.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 24h Vibe Snap Fullscreen Story Viewer */}
      {activeStory && (
        <StoryViewerModal 
          storyData={activeStory}
          onClose={() => setActiveStory(null)}
          onReply={({ userName, text }) => {
            console.log(`Replied to ${userName}'s story: "${text}"`);
          }}
        />
      )}
    </div>
  );
}
