import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useConversations } from '../../contexts/ConversationContext';
import { getSlotDisplay } from '../../utils/conversationRules';
import { MessageCircle, Heart } from 'lucide-react';
import './TopBar.css';

export default function TopBar({ title }) {
  const location = useLocation();
  const { user } = useAuth();
  const { activeCount } = useConversations();
  const isDiscover = location.pathname.includes('/discover');

  return (
    <header className="top-bar">
      <div className="top-bar-left">
        <h1 className="top-bar-title">{title || 'Solely'}</h1>
      </div>
      <div className="top-bar-right">
        {isDiscover && (
          <div className="top-bar-badge likes-badge">
            <Heart size={14} className="badge-icon" />
            <span>{user.daily_likes_remaining}</span>
          </div>
        )}
        <div className="top-bar-badge slot-badge">
          <MessageCircle size={14} className="badge-icon" />
          <span>{getSlotDisplay(user, activeCount)}</span>
        </div>
      </div>
    </header>
  );
}

