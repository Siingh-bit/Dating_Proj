import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import VerificationPanel from '../components/profile/VerificationPanel';
import './ProfilePage.css';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="profile-page animate-fade-in">
      <div className="profile-hero">
        <img src={user.photos[0]} alt={user.name} className="profile-photo" />
        <div className="profile-hero-gradient"></div>
        <div className="profile-header-info">
          <div className="profile-name-age">
            <span>{user.name}</span>
            <span className="profile-age">{user.age}</span>
          </div>
          <div className="profile-location">{user.location}</div>
        </div>
      </div>

      <div className="profile-content">
        <div className="tier-badge">
          Standard Tier
        </div>
        {user.intention && (
          <div className="intention-badge">
            💝 {user.intention}
          </div>
        )}

        <div className="vitals-section">
          {user.vitals.height && (
            <div className="vital-pill">
              <span className="vital-icon">📏</span> {user.vitals.height}
            </div>
          )}
          {user.vitals.work && (
            <div className="vital-pill">
              <span className="vital-icon">💼</span> {user.vitals.work}
            </div>
          )}
          {user.vitals.education && (
            <div className="vital-pill">
              <span className="vital-icon">🎓</span> {user.vitals.education}
            </div>
          )}
          {user.vitals.hometown && (
            <div className="vital-pill">
              <span className="vital-icon">📍</span> {user.vitals.hometown}
            </div>
          )}
          {user.vitals.religion && (
            <div className="vital-pill">
              <span className="vital-icon">🙏</span> {user.vitals.religion}
            </div>
          )}
          {user.vitals.drinking && (
            <div className="vital-pill">
              <span className="vital-icon">🍷</span> {user.vitals.drinking}
            </div>
          )}
          {user.vitals.smoking && (
            <div className="vital-pill">
              <span className="vital-icon">🚭</span> {user.vitals.smoking}
            </div>
          )}
        </div>

        <div className="slot-status-card">
          <div className="slot-header">
            <span>Conversation Slots</span>
            <span className="slot-value">1 / 1</span>
          </div>
          <div className="slot-progress-bg">
            <div className="slot-progress-fill" style={{ width: '100%' }}></div>
          </div>
          <div className="slot-footer">
            <span>Weekly Ends</span>
            <span>2 / 2</span>
          </div>
        </div>

        <div className="prompts-section">
          {user.prompts.map((prompt, index) => (
            <div key={index} className="prompt-card">
              <div className="prompt-q">{prompt.question}</div>
              <div className="prompt-a">{prompt.answer}</div>
            </div>
          ))}
        </div>

        {user.interests && user.interests.length > 0 && (
          <div className="interests-section">
            <h3 className="section-label">Interests</h3>
            <div className="interests-grid">
              {user.interests.map((interest, i) => (
                <span key={i} className="interest-chip">{interest}</span>
              ))}
            </div>
          </div>
        )}

        <VerificationPanel />

        <div className="profile-actions">
          <button className="btn-upgrade" onClick={() => navigate('/app/premium')}>
            Upgrade Plan
          </button>
          <button className="btn-edit" onClick={() => navigate('/app/edit-profile')}>
            Edit Profile
          </button>
          <Link to="/app/settings" className="settings-link">
            Settings
          </Link>
        </div>
      </div>
    </div>
  );
}
