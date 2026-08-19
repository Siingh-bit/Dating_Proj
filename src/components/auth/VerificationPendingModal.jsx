import React, { useState } from 'react';
import { ShieldCheck, Clock, RefreshCw, LogOut, CheckCircle2, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '../../services/supabaseClient';
import WobbleLogo from '../shared/WobbleLogo';
import './VerificationPendingModal.css';

export default function VerificationPendingModal({ onApproved }) {
  const { user, dispatch } = useAuth();
  const [checking, setChecking] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const handleCheckStatus = async () => {
    setChecking(true);
    setStatusMessage(null);

    try {
      if (isSupabaseConfigured && supabase && user?.id) {
        const { data, error } = await supabase
          .from('profiles')
          .select('verification_status, verified')
          .eq('id', user.id)
          .single();

        if (data && (data.verification_status === 'approved' || data.verified)) {
          dispatch({
            type: 'UPDATE_PROFILE',
            payload: { verification_status: 'approved', verified: true },
          });
          setStatusMessage('🎉 Your profile has been approved! Redirecting...');
          setTimeout(() => {
            if (onApproved) onApproved();
          }, 1200);
          return;
        }
      }

      setTimeout(() => {
        setChecking(false);
        setStatusMessage('Your profile is still under review. You will receive an email once approved!');
      }, 800);
    } catch (err) {
      setChecking(false);
      setStatusMessage('Still under concierge review. Please check back shortly!');
    }
  };

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <div className="pending-modal-overlay">
      <div className="pending-card">
        <div className="pending-header-icon">
          <div className="pulse-ring"></div>
          <div className="shield-icon-wrap">
            <ShieldCheck size={36} color="#E8604C" />
          </div>
        </div>

        <div className="pending-badge">
          <Clock size={13} />
          <span>Verification In Progress</span>
        </div>

        <h2 className="pending-title">Profile Under Concierge Review</h2>
        <p className="pending-desc">
          To ensure genuine, high-quality chemistry for everyone on Wobble Date, every profile is personally reviewed by our team.
        </p>

        {user && (
          <div className="user-review-preview">
            <div className="preview-avatar">
              <img 
                src={user.photos?.[0] || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80'} 
                alt={user.name} 
              />
            </div>
            <div className="preview-info">
              <div className="preview-name">
                {user.name}, {user.age}
              </div>
              <div className="preview-city">{user.location || 'Mumbai, India'}</div>
              <div className="preview-email">{user.email}</div>
            </div>
          </div>
        )}

        <div className="perks-list">
          <div className="perk-item">
            <Sparkles size={16} color="#FF7B6B" />
            <span>You'll get an <strong>email notification</strong> immediately once approved.</span>
          </div>
          <div className="perk-item">
            <CheckCircle2 size={16} color="#34D399" />
            <span>Average turnaround: <strong>~10–15 minutes</strong>.</span>
          </div>
        </div>

        {statusMessage && (
          <div className={`status-banner ${statusMessage.includes('approved') ? 'approved' : ''}`}>
            {statusMessage}
          </div>
        )}

        <div className="pending-actions">
          <button 
            className="btn-check-status" 
            onClick={handleCheckStatus} 
            disabled={checking}
          >
            <RefreshCw size={17} className={checking ? 'spin' : ''} />
            <span>{checking ? 'Checking Status...' : 'Check Status Now'}</span>
          </button>

          <button className="btn-pending-logout" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
