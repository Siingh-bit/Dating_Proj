import React from 'react';
import { NavLink } from 'react-router-dom';
import { Compass, Heart, MessageCircle, User } from 'lucide-react';
import './BottomNav.css';

const BottomNav = () => {
  const navItems = [
    { path: '/app/discover', icon: Compass, label: 'Discover' },
    { path: '/app/likes', icon: Heart, label: 'Likes', badgeCount: 3 },
    { path: '/app/matches', icon: MessageCircle, label: 'Matches', hasBadge: true },
    { path: '/app/profile', icon: User, label: 'Profile' },
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
              <Icon size={24} />
              {item.badgeCount && <span className="nav-badge count">{item.badgeCount}</span>}
              {item.hasBadge && !item.badgeCount && <span className="nav-badge dot"></span>}
              <div className="glow-dot"></div>
            </div>
            <span className="bottom-nav-label">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default BottomNav;
