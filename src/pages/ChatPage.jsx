import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useConversations } from '../contexts/ConversationContext';
import { canStartConversation, canEndConversation } from '../utils/conversationRules';
import { formatDate } from '../utils/helpers';
import { PHASE_CONFIG } from '../data/mockData';
import MessageBubble from '../components/chat/MessageBubble';
import ChatInput from '../components/chat/ChatInput';
import ProfileCard from '../components/profile/ProfileCard';
import CallOverlay from '../components/chat/CallOverlay';
import PhotoShareModal from '../components/chat/PhotoShareModal';
import PaywallModal from '../components/chat/PaywallModal';
import GameLoungeModal from '../components/chat/games/GameLoungeModal';
import TruthOrDareModal from '../components/chat/games/TruthOrDareModal';
import WouldYouRatherModal from '../components/chat/games/WouldYouRatherModal';
import TwoLiesOneTruthModal from '../components/chat/games/TwoLiesOneTruthModal';
import CompatibilityQuizModal from '../components/chat/games/CompatibilityQuizModal';
import EmojiDecoderModal from '../components/chat/games/EmojiDecoderModal';
import CoupleTriviaModal from '../components/chat/games/CoupleTriviaModal';
import TwentyQuestionsModal from '../components/chat/games/TwentyQuestionsModal';
import DoodleDrawModal from '../components/chat/games/DoodleDrawModal';
import LoveFortuneModal from '../components/chat/games/LoveFortuneModal';
import FinishTheLyricModal from '../components/chat/games/FinishTheLyricModal';
import HotTakesModal from '../components/chat/games/HotTakesModal';
import MindMeldModal from '../components/chat/games/MindMeldModal';
import ThisOrThatBlitzModal from '../components/chat/games/ThisOrThatBlitzModal';
import OurStoryModal from '../components/chat/games/OurStoryModal';
import DateNightRouletteModal from '../components/chat/games/DateNightRouletteModal';
import HeartbeatSyncModal from '../components/chat/games/HeartbeatSyncModal';
import TugOfLoveModal from '../components/chat/games/TugOfLoveModal';
import MemoryLaneModal from '../components/chat/games/MemoryLaneModal';
import LoveScrambleModal from '../components/chat/games/LoveScrambleModal';
import ReadMyMindModal from '../components/chat/games/ReadMyMindModal';
import StackOfUsModal from '../components/chat/games/StackOfUsModal';
import HotPotatoModal from '../components/chat/games/HotPotatoModal';
import LoveSequenceModal from '../components/chat/games/LoveSequenceModal';
import CupidsArrowModal from '../components/chat/games/CupidsArrowModal';
import TwoLineTangoModal from '../components/chat/games/TwoLineTangoModal';
import OddOneOutModal from '../components/chat/games/OddOneOutModal';
import LoveBetsModal from '../components/chat/games/LoveBetsModal';
import WobbleMeter from '../components/chat/WobbleMeter';
import FirstDatePlannerModal from '../components/chat/FirstDatePlannerModal';
import MusicSwapModal from '../components/chat/MusicSwapModal';
import GracefulCloserModal from '../components/chat/GracefulCloserModal';
import SmartReviver from '../components/chat/SmartReviver';
import { playPop, playMatchChime, playFanfare, playWhoosh } from '../utils/soundEffects';
import { ArrowLeft, Lock, X, Sparkles, User, Phone, Video, HeartHandshake, Calendar, Music } from 'lucide-react';
import './ChatPage.css';

export default function ChatPage() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { user, dispatch: authDispatch } = useAuth();
  const { matches, conversations, activeCount, activeConversations, dispatch } = useConversations();
  const scrollRef = useRef(null);

  const [showPhaseModal, setShowPhaseModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEndConfirmModal, setShowEndConfirmModal] = useState(false);
  const [showGracefulCloser, setShowGracefulCloser] = useState(false);
  const [showDatePlanner, setShowDatePlanner] = useState(false);
  const [showMusicSwap, setShowMusicSwap] = useState(false);
  const [activeCallType, setActiveCallType] = useState(null); // null | 'audio' | 'video'
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState(null); // null | 'Photo Sharing' | 'Message Unsending'
  const [showGameLounge, setShowGameLounge] = useState(false);
  const [activeGameId, setActiveGameId] = useState(null);

  const match = matches.find(m => m.id === matchId);
  const conversation = conversations[matchId];
  const profile = match?.matchedWith;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation?.messages]);

  if (!match || !profile) {
    return <div className="page"><div className="page-content">Match not found.</div></div>;
  }

  const phaseInfo = PHASE_CONFIG[match.phase];
  const isActive = match.isActiveConversation;
  const slotsFull = !canStartConversation(user, activeCount);
  const canEnd = canEndConversation(user);

  const isLocked = !isActive && slotsFull;
  const isAvailableToStart = !isActive && !slotsFull;

  const handleSend = (text) => {
    playPop();
    if (!isActive) {
      dispatch({ type: 'START_CONVERSATION', payload: { matchId } });
    }
    dispatch({ type: 'SEND_MESSAGE', payload: { matchId, text } });
  };

  const handleSendGameResult = (gamePayload) => {
    playFanfare();
    if (!isActive) dispatch({ type: 'START_CONVERSATION', payload: { matchId } });
    dispatch({
      type: 'SEND_MESSAGE',
      payload: { matchId, text: gamePayload.summaryText || `🎮 Played ${gamePayload.type}`, gameData: gamePayload }
    });
    setActiveGameId(null);
    setShowGameLounge(false);
  };

  const handleSendDateItinerary = (itineraryPayload) => {
    if (!isActive) dispatch({ type: 'START_CONVERSATION', payload: { matchId } });
    dispatch({
      type: 'SEND_MESSAGE',
      payload: { matchId, text: `✨ Proposed Date #1: ${itineraryPayload.vibe} (${itineraryPayload.day} at ${itineraryPayload.time})`, gameData: itineraryPayload }
    });
  };

  const handleSendMusicTrack = (musicPayload) => {
    if (!isActive) dispatch({ type: 'START_CONVERSATION', payload: { matchId } });
    dispatch({
      type: 'SEND_MESSAGE',
      payload: { matchId, text: `🎵 Shared track: ${musicPayload.track} by ${musicPayload.artist}`, gameData: musicPayload }
    });
  };

  const handleGracefulEndConfirm = (farewellNote) => {
    dispatch({
      type: 'SEND_MESSAGE',
      payload: { matchId, text: `🕊️ ${farewellNote}`, gameData: { type: 'graceful_closure', note: farewellNote } }
    });
    setTimeout(() => {
      dispatch({ type: 'END_CONVERSATION', payload: { matchId } });
      authDispatch({ type: 'USE_WEEKLY_END' });
      navigate('/app/matches');
    }, 800);
  };

  const handleOpenMediaPicker = () => {
    if (user.tier === 'free') {
      setPaywallFeature('Photo Sharing');
    } else {
      setShowPhotoModal(true);
    }
  };

  const handleSendMedia = ({ photoUrl, mode, caption }) => {
    playPop();
    if (!isActive) {
      dispatch({ type: 'START_CONVERSATION', payload: { matchId } });
    }
    dispatch({
      type: 'SEND_MEDIA_MESSAGE',
      payload: { matchId, photoUrl, mode, caption },
    });
  };

  const handleViewOnceOpened = (messageId) => {
    dispatch({ type: 'VIEW_ONCE_OPENED', payload: { matchId, messageId } });
  };

  const handleUnsend = (message) => {
    if (user.tier === 'free') {
      setPaywallFeature('Message Unsending');
    } else {
      dispatch({ type: 'UNSEND_MESSAGE', payload: { matchId, messageId: message.id } });
    }
  };

  const handleEndAndReplyConfirm = () => {
    const activeMatchToEnd = activeConversations[0];
    if (activeMatchToEnd) {
      dispatch({ type: 'END_CONVERSATION', payload: { matchId: activeMatchToEnd.id } });
      authDispatch({ type: 'USE_WEEKLY_END' });
    }
    dispatch({ type: 'START_CONVERSATION', payload: { matchId } });
    setShowEndConfirmModal(false);
  };

  const messages = conversation?.messages || [];
  
  // Group messages by date
  const groupedMessages = [];
  let currentDate = null;

  messages.forEach((msg, index) => {
    const msgDate = new Date(msg.timestamp).toDateString();
    if (msgDate !== currentDate) {
      groupedMessages.push({ type: 'date', text: formatDate(msg.timestamp), id: `date-${msgDate}` });
      currentDate = msgDate;
    }
    
    // Show timestamp if > 1 hour gap or last message
    const prevMsg = index > 0 ? messages[index - 1] : null;
    let showTimestamp = false;
    
    if (index === messages.length - 1) {
      showTimestamp = true;
    } else if (prevMsg) {
      const gap = new Date(msg.timestamp) - new Date(prevMsg.timestamp);
      if (gap > 60 * 60 * 1000) showTimestamp = true;
    } else {
      showTimestamp = true;
    }

    groupedMessages.push({ 
      type: 'message', 
      message: msg, 
      isOwn: msg.sender === 'user-self', 
      showTimestamp 
    });
  });

  return (
    <div className="page chat-page">
      <header className="chat-header">
        <button className="icon-btn" onClick={() => navigate('/app/matches')}>
          <ArrowLeft size={24} />
        </button>
        <div className="chat-header-profile" onClick={() => setShowProfileModal(true)} style={{ cursor: 'pointer' }}>
          <img src={profile.photos[0]} alt={profile.name} className="chat-avatar" />
          <div className="chat-header-info">
            <span className="chat-name">{profile.name}</span>
            <span className="view-profile-subtext">Tap to view full profile</span>
          </div>
        </div>

        <div className="chat-header-actions">
          <button className="icon-btn" onClick={() => setShowDatePlanner(true)} title="Plan Date #1">
            <Calendar size={18} />
          </button>
          <button className="icon-btn" onClick={() => setShowMusicSwap(true)} title="Music Swap">
            <Music size={18} />
          </button>
          <button className="icon-btn call-btn" onClick={() => setActiveCallType('audio')} title="Audio Call">
            <Phone size={18} />
          </button>
          <button className="icon-btn call-btn" onClick={() => setActiveCallType('video')} title="Video Call">
            <Video size={18} />
          </button>
          <button className="icon-btn closer-trigger-btn" onClick={() => setShowGracefulCloser(true)} title="End Conversation with Kindness">
            <HeartHandshake size={18} />
          </button>
        </div>
      </header>

      {/* Wobble Chemistry Meter */}
      <WobbleMeter 
        messageCount={messages.length} 
        onTriggerDatePlanner={() => setShowDatePlanner(true)} 
      />

      <div className="chat-phase-banner" onClick={() => setShowPhaseModal(true)}>
        <div className="phase-indicator" style={{ color: phaseInfo.color, background: phaseInfo.color + '15' }}>
          {phaseInfo.emoji} {phaseInfo.label}
        </div>
      </div>

      {isAvailableToStart && (
        <div className="start-conversation-banner animate-fade-in-up">
          <p>Start talking to {profile.name}?</p>
          <button className="btn-say-hi" onClick={() => handleSend("Hi!")}>Say Hi 👋</button>
        </div>
      )}

      <div className="chat-messages-area hide-scrollbar" ref={scrollRef}>
        {groupedMessages.map((item) => {
          if (item.type === 'date') {
            return <div key={item.id} className="date-separator">{item.text}</div>;
          }
          return (
            <MessageBubble 
              key={item.message.id} 
              message={item.message} 
              isOwn={item.isOwn} 
              showTimestamp={item.showTimestamp} 
              onUnsend={handleUnsend}
              onViewOnce={handleViewOnceOpened}
            />
          );
        })}
      </div>

      {/* Smart Conversation Reviver Suggestions */}
      {!isLocked && (
        <SmartReviver 
          matchProfile={profile} 
          onSelectPrompt={(text) => handleSend(text)} 
        />
      )}

      {isLocked ? (
        <div className="locked-input-bar">
          <div className="locked-input-info">
            <Lock size={18} className="locked-icon" />
            <div className="locked-text">
              <span className="locked-title">You're talking to someone else</span>
              <span className="locked-subtitle">End conversation to reply to {profile.name}</span>
            </div>
          </div>
          <div className="locked-actions">
            {canEnd ? (
              <button className="btn-end-convo" onClick={() => setShowEndConfirmModal(true)}>
                End & Reply
              </button>
            ) : (
              <button className="btn-upgrade-small" onClick={() => navigate('/app/premium')}>
                <Sparkles size={14} /> Upgrade
              </button>
            )}
          </div>
        </div>
      ) : (
        <ChatInput 
          onSend={handleSend} 
          onOpenMediaPicker={handleOpenMediaPicker}
          onOpenGameLounge={() => setShowGameLounge(true)}
          disabled={false} 
        />
      )}

      {/* Call Overlay Component */}
      {activeCallType && (
        <CallOverlay 
          profile={profile} 
          callType={activeCallType} 
          onClose={() => setActiveCallType(null)} 
        />
      )}

      {/* Photo Share Modal Component */}
      {showPhotoModal && (
        <PhotoShareModal 
          onSendMedia={handleSendMedia} 
          onClose={() => setShowPhotoModal(false)} 
        />
      )}

      {/* Paywall Modal Component */}
      {paywallFeature && (
        <PaywallModal 
          featureName={paywallFeature} 
          onClose={() => setPaywallFeature(null)} 
        />
      )}

      {/* Profile Viewer Modal */}
      {showProfileModal && (
        <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="modal-content full-screen-sheet animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="sheet-header sticky-header">
              <h3>{profile.name}'s Profile</h3>
              <button className="close-btn" onClick={() => setShowProfileModal(false)}><X size={20} /></button>
            </div>
            <div className="profile-modal-body hide-scrollbar">
              <ProfileCard profile={profile} />
            </div>
          </div>
        </div>
      )}

      {/* End & Reply Confirmation Modal */}
      {showEndConfirmModal && activeConversations[0] && (
        <div className="modal-overlay" onClick={() => setShowEndConfirmModal(false)}>
          <div className="modal-content animate-scale-in" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowEndConfirmModal(false)}><X size={20} /></button>
            <h3>Switch active conversation?</h3>
            <p>
              Ending conversation with <strong>{activeConversations[0].matchedWith.name}</strong> will free up your slot to talk to <strong>{profile.name}</strong>.
            </p>
            <p className="sub-note">You have {user.weekly_ends_remaining} conversation ends left this week.</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowEndConfirmModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleEndAndReplyConfirm}>End & Reply</button>
            </div>
          </div>
        </div>
      )}

      {/* Phase Update Modal */}
      {showPhaseModal && (
        <div className="modal-overlay" onClick={() => setShowPhaseModal(false)}>
          <div className="modal-content bottom-sheet animate-slide-up" onClick={e => e.stopPropagation()}>
             <div className="sheet-header">
              <h3>Update Phase</h3>
              <button className="close-btn" onClick={() => setShowPhaseModal(false)}><X size={20} /></button>
            </div>
            <div className="phase-options">
              {Object.entries(PHASE_CONFIG).map(([key, config]) => (
                <div 
                  key={key} 
                  className={`phase-option ${match.phase === key ? 'selected' : ''}`}
                  onClick={() => {
                    dispatch({ type: 'UPDATE_PHASE', payload: { matchId: match.id, phase: key } });
                    setShowPhaseModal(false);
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

      {/* Game Lounge Modal */}
      {showGameLounge && !activeGameId && (
        <GameLoungeModal 
          onClose={() => setShowGameLounge(false)}
          onSelectGame={(gameId) => setActiveGameId(gameId)}
        />
      )}

      {/* Active Game Modals */}
      {activeGameId === 'truth_or_dare' && <TruthOrDareModal onClose={() => setActiveGameId(null)} onSendToChat={handleSendGameResult} />}
      {activeGameId === 'would_you_rather' && <WouldYouRatherModal onClose={() => setActiveGameId(null)} onSendToChat={handleSendGameResult} />}
      {activeGameId === 'two_lies_one_truth' && <TwoLiesOneTruthModal onClose={() => setActiveGameId(null)} onSendToChat={handleSendGameResult} />}
      {activeGameId === 'compatibility_quiz' && <CompatibilityQuizModal onClose={() => setActiveGameId(null)} onSendToChat={handleSendGameResult} />}
      {activeGameId === 'emoji_decoder' && <EmojiDecoderModal onClose={() => setActiveGameId(null)} onSendToChat={handleSendGameResult} />}
      {activeGameId === 'couple_trivia' && <CoupleTriviaModal onClose={() => setActiveGameId(null)} onSendToChat={handleSendGameResult} />}
      {activeGameId === 'twenty_questions' && <TwentyQuestionsModal onClose={() => setActiveGameId(null)} onSendToChat={handleSendGameResult} />}
      {activeGameId === 'doodle_draw' && <DoodleDrawModal onClose={() => setActiveGameId(null)} onSendToChat={handleSendGameResult} />}
      {activeGameId === 'love_fortune' && <LoveFortuneModal onClose={() => setActiveGameId(null)} onSendToChat={handleSendGameResult} />}
      {activeGameId === 'finish_lyric' && <FinishTheLyricModal onClose={() => setActiveGameId(null)} onSendToChat={handleSendGameResult} />}
      {activeGameId === 'hot_takes' && <HotTakesModal onClose={() => setActiveGameId(null)} onSendToChat={handleSendGameResult} />}
      {activeGameId === 'mind_meld' && <MindMeldModal onClose={() => setActiveGameId(null)} onSendToChat={handleSendGameResult} />}
      {activeGameId === 'this_or_that_blitz' && <ThisOrThatBlitzModal onClose={() => setActiveGameId(null)} onSendToChat={handleSendGameResult} />}
      {activeGameId === 'our_story' && <OurStoryModal onClose={() => setActiveGameId(null)} onSendToChat={handleSendGameResult} />}
      {activeGameId === 'date_night_roulette' && <DateNightRouletteModal onClose={() => setActiveGameId(null)} onSendToChat={handleSendGameResult} />}

      {/* Skill-based games */}
      {activeGameId === 'heartbeat_sync' && <HeartbeatSyncModal onClose={() => setActiveGameId(null)} onSendToChat={handleSendGameResult} />}
      {activeGameId === 'tug_of_love' && <TugOfLoveModal onClose={() => setActiveGameId(null)} onSendToChat={handleSendGameResult} />}
      {activeGameId === 'memory_lane' && <MemoryLaneModal onClose={() => setActiveGameId(null)} onSendToChat={handleSendGameResult} />}
      {activeGameId === 'love_scramble' && <LoveScrambleModal onClose={() => setActiveGameId(null)} onSendToChat={handleSendGameResult} />}
      {activeGameId === 'read_my_mind' && <ReadMyMindModal onClose={() => setActiveGameId(null)} onSendToChat={handleSendGameResult} />}
      {activeGameId === 'stack_of_us' && <StackOfUsModal onClose={() => setActiveGameId(null)} onSendToChat={handleSendGameResult} />}
      {activeGameId === 'hot_potato' && <HotPotatoModal onClose={() => setActiveGameId(null)} onSendToChat={handleSendGameResult} />}
      {activeGameId === 'love_sequence' && <LoveSequenceModal onClose={() => setActiveGameId(null)} onSendToChat={handleSendGameResult} />}
      {activeGameId === 'cupids_arrow' && <CupidsArrowModal onClose={() => setActiveGameId(null)} onSendToChat={handleSendGameResult} />}
      {activeGameId === 'two_line_tango' && <TwoLineTangoModal onClose={() => setActiveGameId(null)} onSendToChat={handleSendGameResult} />}
      {activeGameId === 'odd_one_out' && <OddOneOutModal onClose={() => setActiveGameId(null)} onSendToChat={handleSendGameResult} />}
      {activeGameId === 'love_bets' && <LoveBetsModal onClose={() => setActiveGameId(null)} onSendToChat={handleSendGameResult} />}

      {/* First Date Planner Modal */}
      {showDatePlanner && (
        <FirstDatePlannerModal 
          matchProfile={profile} 
          onClose={() => setShowDatePlanner(false)} 
          onSendItinerary={handleSendDateItinerary} 
        />
      )}

      {/* Music Swap Modal */}
      {showMusicSwap && (
        <MusicSwapModal 
          matchProfile={profile} 
          onClose={() => setShowMusicSwap(false)} 
          onSendTrack={handleSendMusicTrack} 
        />
      )}

      {/* Graceful Closer Modal */}
      {showGracefulCloser && (
        <GracefulCloserModal 
          matchProfile={profile} 
          onClose={() => setShowGracefulCloser(false)} 
          onConfirmEnd={handleGracefulEndConfirm} 
        />
      )}
    </div>
  );
}
