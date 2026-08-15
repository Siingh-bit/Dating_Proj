import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Crown, Sparkles, ArrowLeft, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PREMIUM_TIERS } from '../data/mockData';
import './PremiumPage.css';

export default function PremiumPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [billingCycle, setBillingCycle] = useState('quarterly');
  const [showFeatures, setShowFeatures] = useState(false);
  
  const handleBillingToggle = (cycle) => {
    setBillingCycle(cycle);
  };
  
  const getPrice = (tier) => {
    if (billingCycle === 'monthly') return tier.monthlyPrice;
    if (billingCycle === 'quarterly') return Math.round(tier.quarterlyPrice / 3);
    if (billingCycle === 'halfYearly') return Math.round(tier.halfYearlyPrice / 6);
  };
  
  const comparisonFeatures = [
    { name: 'Simultaneous Conversations', standard: '1', lite: '3', plus: '5', elite: '10' },
    { name: 'Weekly Ends', standard: '2', lite: '3', plus: '5', elite: '7' },
    { name: 'See Likes', standard: false, lite: true, plus: true, elite: true },
    { name: 'Daily Likes', standard: '8', lite: 'Unlimited', plus: 'Unlimited', elite: 'Unlimited' },
    { name: 'Advanced Filters', standard: false, lite: true, plus: true, elite: true },
    { name: 'Priority Feed', standard: false, lite: false, plus: true, elite: true },
    { name: 'Profile Boost', standard: false, lite: false, plus: false, elite: 'Weekly' },
    { name: 'Read Receipts', standard: false, lite: false, plus: false, elite: true },
  ];
  
  const currentTier = user?.tier || 'free';
  
  return (
    <div className="premium-page">
      <header className="premium-header-nav">
        <button className="back-button" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
      </header>
      
      <div className="premium-header">
        <h1 className="premium-title">Upgrade to Solely Premium</h1>
        <p className="premium-subtitle">More conversations. More connections. More possibilities.</p>
      </div>
      
      <div className="billing-toggle-wrapper">
        <div className="billing-toggle">
          <button 
            className={`toggle-btn ${billingCycle === 'monthly' ? 'active' : ''}`}
            onClick={() => handleBillingToggle('monthly')}
          >
            Monthly
          </button>
          <button 
            className={`toggle-btn ${billingCycle === 'quarterly' ? 'active' : ''}`}
            onClick={() => handleBillingToggle('quarterly')}
          >
            3 Months <span className="save-badge">save 20%</span>
          </button>
          <button 
            className={`toggle-btn ${billingCycle === 'halfYearly' ? 'active' : ''}`}
            onClick={() => handleBillingToggle('halfYearly')}
          >
            6 Months <span className="save-badge">save 33%</span>
          </button>
        </div>
      </div>
      
      <div className="tier-cards-container">
        {PREMIUM_TIERS.map(tier => {
          const price = getPrice(tier);
          const isCurrentTier = currentTier === tier.id;
          
          return (
            <div key={tier.id} className={`tier-card ${tier.popular ? 'popular' : ''} ${tier.id === 'elite' ? 'elite-card' : ''}`}>
              {tier.popular && (
                <div className="popular-ribbon">
                  <Sparkles size={14} /> Most Popular
                </div>
              )}
              {isCurrentTier && (
                <div className="current-plan-badge">Current Plan</div>
              )}
              
              <div className="tier-card-header">
                <div className="tier-name-wrapper">
                  <h2 className="tier-name" style={tier.id === 'elite' ? {color: 'var(--gold)'} : {}}>{tier.name}</h2>
                  {tier.id === 'elite' && <Crown size={20} color="var(--gold)" />}
                </div>
                <p className="tier-tagline">{tier.tagline}</p>
              </div>
              
              <div className="tier-price-wrapper">
                <span className="tier-currency">{tier.currency}</span>
                <span className="tier-price">{price}</span>
                <span className="tier-duration">/mo</span>
              </div>
              {billingCycle !== 'monthly' && (
                <div className="tier-total-billed">
                  Billed as one payment of {tier.currency}{billingCycle === 'quarterly' ? tier.quarterlyPrice : tier.halfYearlyPrice}
                </div>
              )}
              
              <ul className="tier-features">
                {tier.features.map((feature, idx) => (
                  <li key={idx}>
                    <Check size={18} className="feature-check" />
                    <span>{feature.label}</span>
                  </li>
                ))}
              </ul>
              
              <button className={`tier-cta ${tier.id}-btn`}>
                Choose {tier.name}
              </button>
            </div>
          );
        })}
      </div>
      
      {currentTier === 'free' && (
        <div className="current-plan-indicator">
          You're on the Standard plan
        </div>
      )}
      
      <div className="feature-comparison-wrapper">
        <button 
          className="comparison-toggle" 
          onClick={() => setShowFeatures(!showFeatures)}
        >
          Compare all features <ChevronDown size={20} className={showFeatures ? 'rotate' : ''} />
        </button>
        
        {showFeatures && (
          <div className="comparison-table-container">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Features</th>
                  <th>Standard</th>
                  <th>Lite</th>
                  <th>Plus</th>
                  <th>Elite</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((feat, idx) => (
                  <tr key={idx}>
                    <td className="feature-name">{feat.name}</td>
                    <td className="feature-val">{typeof feat.standard === 'boolean' ? (feat.standard ? <Check size={16} className="check"/> : <X size={16} className="cross"/>) : feat.standard}</td>
                    <td className="feature-val">{typeof feat.lite === 'boolean' ? (feat.lite ? <Check size={16} className="check"/> : <X size={16} className="cross"/>) : feat.lite}</td>
                    <td className="feature-val">{typeof feat.plus === 'boolean' ? (feat.plus ? <Check size={16} className="check"/> : <X size={16} className="cross"/>) : feat.plus}</td>
                    <td className="feature-val">{typeof feat.elite === 'boolean' ? (feat.elite ? <Check size={16} className="check"/> : <X size={16} className="cross"/>) : feat.elite}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div className="womens-bonus-card">
        <div className="bonus-icon">🎉</div>
        <div className="bonus-content">
          <h4>New to Solely?</h4>
          <p>Women get Elite features free for their first month!</p>
        </div>
      </div>
      
    </div>
  );
}
