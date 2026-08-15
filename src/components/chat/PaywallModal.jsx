import React from 'react';
import { X, Sparkles, Check, Lock, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { PREMIUM_TIERS } from '../../data/mockData';
import './PaywallModal.css';

export default function PaywallModal({ featureName = 'Premium Feature', onClose }) {
  const { dispatch: authDispatch } = useAuth();

  const handleUpgrade = (tierId) => {
    authDispatch({ type: 'UPGRADE_TIER', payload: tierId });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content paywall-modal animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn paywall-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="paywall-hero">
          <div className="paywall-badge">
            <Sparkles size={16} /> Premium Required
          </div>
          <h2>Unlock {featureName}</h2>
          <p className="paywall-subtitle">
            {featureName} is available across all premium membership tiers. Upgrade your account to enjoy unlimited photo sharing, message unsending, and more!
          </p>
        </div>

        <div className="paywall-features-list">
          <div className="paywall-feat-item">
            <Check size={16} className="check-icon" /> <span>Send photos with View Once or Permanent modes</span>
          </div>
          <div className="paywall-feat-item">
            <Check size={16} className="check-icon" /> <span>Unshare / Unsend messages anytime</span>
          </div>
          <div className="paywall-feat-item">
            <Check size={16} className="check-icon" /> <span>Expanded active conversation slots</span>
          </div>
        </div>

        <div className="paywall-plans-grid">
          {PREMIUM_TIERS.map((tier) => (
            <div 
              key={tier.id} 
              className={`paywall-plan-card ${tier.popular ? 'is-popular' : ''}`}
              style={{ '--tier-color': tier.color }}
              onClick={() => handleUpgrade(tier.id)}
            >
              {tier.popular && <span className="popular-tag">Most Popular</span>}
              <h4 className="tier-title">{tier.name}</h4>
              <div className="tier-price">
                <span className="currency">{tier.currency}</span>
                <span className="price">{tier.monthlyPrice}</span>
                <span className="period">/mo</span>
              </div>
              <button className="btn-select-tier">Select {tier.name}</button>
            </div>
          ))}
        </div>

        <div className="paywall-footer-note">
          <ShieldCheck size={14} /> Instant activation for testing
        </div>
      </div>
    </div>
  );
}
