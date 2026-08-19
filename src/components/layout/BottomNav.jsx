import React from 'react';
import { NavLink } from 'react-router-dom';
import { Compass, Heart, MessageCircle, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useConversations } from '../../contexts/ConversationContext';
import './BottomNav.css';

const BottomNav = () => {
  const { user } = useAuth();
  const { matches, incomingLikes } = useConversations();

  // These counts used to be hardcoded (`badgeCount: 3`, `hasBadge: true`), so
  // the Likes tab showed "3" and Matches showed a dot even on a brand new
  // account with an empty inbox.
  const likeCount = incomingLikes?.length || 0;
  const hasUnreadMatch = (matches || []).some(
    m => m.lastMessage && m.lastMessage.read === false
  );

  const avatar = user?.photos?.[0] || null;

  const navItems = [
    { path: '/app/discover', icon: Compass, label: 'Discover' },
    { path: '/app/likes', icon: Heart, label: 'Likes', badgeCount: likeCount },
    { path: '/app/matches', icon: MessageCircle, label: 'Matches', hasBadge: hasUnreadMatch },
    { path: '/app/profile', icon: User, label: 'Profile', isAvatar: true },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            <div className="icon-wrapper">
              {/* Once the user has a photo, the Profile tab shows their face
                  rather than a generic person glyph. */}
              {item.isAvatar && avatar ? (
                <img src={avatar} alt="" className="nav-avatar" />
              ) : (
                <Icon size={24} />
              )}
              {item.badgeCount > 0 && (
                <span className="nav-badge count">{item.badgeCount > 9 ? '9+' : item.badgeCount}</span>
              )}
              {item.hasBadge && !item.badgeCount && <span className="nav-badge dot" />}
              <div className="glow-dot" />
            </div>
            <span className="bottom-nav-label">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default BottomNav;
