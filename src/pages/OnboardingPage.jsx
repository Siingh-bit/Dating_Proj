import React from 'react';
import { useNavigate } from 'react-router-dom';
import './OnboardingPage.css';

export default function OnboardingPage() {
  const navigate = useNavigate();

  return (
    <div className="onboarding-page animate-fade-in">
      <div className="floating-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>
      
      <div className="onboarding-content">
        <div className="onboarding-brand animate-fade-in-up">
          <h1 className="onboarding-logo">Wobble Date</h1>
          <p className="onboarding-tagline">One person. Full attention.</p>
        </div>

        <div className="onboarding-benefits stagger-children">
          <div className="benefit-pill">
            <span>🔒</span> One conversation at a time
          </div>
          <div className="benefit-pill">
            <span>💯</span> Know they're focused on you
          </div>
          <div className="benefit-pill">
            <span>💫</span> Real connections, not collections
          </div>
        </div>
      </div>

      <div className="onboarding-actions animate-fade-in-up" style={{ animationDelay: '500ms' }}>
        <button className="btn-primary" onClick={() => navigate('/app/discover')}>
          Get Started
        </button>
        <button className="btn-secondary" onClick={() => navigate('/app/discover')}>
          I have an account
        </button>
      </div>
    </div>
  );
}
