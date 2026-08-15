import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './SettingsPage.css';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [matchNotifs, setMatchNotifs] = useState(true);
  const [messageNotifs, setMessageNotifs] = useState(true);
  const [likeNotifs, setLikeNotifs] = useState(false);

  return (
    <div className="settings-page animate-fade-in page-with-topbar">
      <div className="settings-header">
        <button className="btn-back" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1 className="settings-title">Settings</h1>
      </div>

      <div className="settings-content">
        <div className="settings-group">
          <h2 className="settings-group-title">Account</h2>
          <div className="settings-card">
            <div className="settings-row">
              <span className="settings-label">Name</span>
              <span className="settings-value">{user?.name || 'User'}</span>
            </div>
            <div className="settings-row">
              <span className="settings-label">Email</span>
              <span className="settings-value">hello@example.com</span>
            </div>
            <div className="settings-row">
              <span className="settings-label">Phone</span>
              <span className="settings-value">+1 (555) 123-4567</span>
            </div>
          </div>
        </div>

        <div className="settings-group">
          <h2 className="settings-group-title">Discovery</h2>
          <div className="settings-card">
            <div className="settings-row">
              <span className="settings-label">Age Range</span>
              <span className="settings-value">21-30</span>
            </div>
            <div className="settings-row">
              <span className="settings-label">Maximum Distance</span>
              <span className="settings-value">25 km</span>
            </div>
            <div className="settings-row">
              <span className="settings-label">Show Me</span>
              <span className="settings-value">Women</span>
            </div>
          </div>
        </div>

        <div className="settings-group">
          <h2 className="settings-group-title">Notifications</h2>
          <div className="settings-card">
            <div className="settings-row">
              <span className="settings-label">New Matches</span>
              <button 
                className={`toggle-switch ${matchNotifs ? 'active' : ''}`}
                onClick={() => setMatchNotifs(!matchNotifs)}
              >
                <div className="toggle-knob"></div>
              </button>
            </div>
            <div className="settings-row">
              <span className="settings-label">Messages</span>
              <button 
                className={`toggle-switch ${messageNotifs ? 'active' : ''}`}
                onClick={() => setMessageNotifs(!messageNotifs)}
              >
                <div className="toggle-knob"></div>
              </button>
            </div>
            <div className="settings-row">
              <span className="settings-label">Likes</span>
              <button 
                className={`toggle-switch ${likeNotifs ? 'active' : ''}`}
                onClick={() => setLikeNotifs(!likeNotifs)}
              >
                <div className="toggle-knob"></div>
              </button>
            </div>
          </div>
        </div>

        <div className="settings-group">
          <h2 className="settings-group-title">Subscription</h2>
          <div className="settings-card">
            <div className="settings-row">
              <span className="settings-label">Current Tier</span>
              <span className="settings-value gold-text">Standard</span>
            </div>
            <div className="settings-row clickable" onClick={() => navigate('/app/premium')}>
              <span className="settings-label">Manage Subscription</span>
              <span className="settings-value chevron">›</span>
            </div>
          </div>
        </div>

        <div className="settings-group">
          <h2 className="settings-group-title">About</h2>
          <div className="settings-card">
            <div className="settings-row clickable">
              <span className="settings-label">Terms of Service</span>
            </div>
            <div className="settings-row clickable">
              <span className="settings-label">Privacy Policy</span>
            </div>
            <div className="settings-row clickable">
              <span className="settings-label">Licenses</span>
            </div>
            <div className="settings-row">
              <span className="settings-label">App Version</span>
              <span className="settings-value">v1.0.0</span>
            </div>
          </div>
        </div>

        <div className="settings-group">
          <div className="settings-card danger-zone">
            <div className="settings-row clickable text-center">
              <span className="settings-label danger-text">Pause Account</span>
            </div>
            <div className="settings-row clickable text-center">
              <span className="settings-label danger-text">Delete Account</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
