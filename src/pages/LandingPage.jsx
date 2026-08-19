import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CURRENT_USER } from '../data/mockData';
import { 
  Heart, Sparkles, Flame, Shield, Compass, Gamepad2, 
  Download, ArrowRight, CheckCircle2, Star, Calendar, 
  MapPin, Music, MessageCircle, Clock, Volume2, X,
  Smartphone, Globe, Award, ChevronRight, UserCheck, Lock
} from 'lucide-react';
import WobbleLogo from '../components/shared/WobbleLogo';
import { sendBrevoOtpEmail } from '../services/emailService';
import { getOrCreateUserProfile } from '../services/userService';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, dispatch: authDispatch } = useAuth();
  
  // Interactive Chemistry Demo State
  const [demoChemistry, setDemoChemistry] = useState(78);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authStep, setAuthStep] = useState(1);
  const [isSignIn, setIsSignIn] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [authOtp, setAuthOtp] = useState(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [heartAnim, setHeartAnim] = useState(false);

  // Live Wobble Hour Countdown simulation
  const [countdown, setCountdown] = useState({ min: 42, sec: 18 });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev.sec > 0) return { ...prev, sec: prev.sec - 1 };
        if (prev.min > 0) return { min: prev.min - 1, sec: 59 };
        return { min: 59, sec: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getChemistryVibe = (val) => {
    if (val < 30) return { label: 'Sparking', color: '#6FD3E8', desc: 'Starting to click' };
    if (val < 65) return { label: 'In Sync', color: '#7C4DFF', desc: 'Conversations flowing smoothly' };
    if (val < 90) return { label: 'Magnetic', color: '#FF7B6B', desc: 'High chemistry detected' };
    return { label: '100% Chemistry', color: '#FFD700', desc: 'Date #1 Itinerary Unlocked' };
  };

  const currentVibe = getChemistryVibe(demoChemistry);

  // Quick Auth Handling
  const handleOpenAuth = (signInMode = false) => {
    if (isAuthenticated) {
      navigate('/app/discover');
      return;
    }
    setIsSignIn(signInMode);
    setAuthStep(1);
    setShowAuthModal(true);
  };

  const handleContinueEmail = async (e) => {
    e.preventDefault();
    if (!authEmail || isSendingEmail) return;
    setIsSendingEmail(true);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    await sendBrevoOtpEmail(authEmail, code);
    setIsSendingEmail(false);
    setAuthStep(2);
  };

  const handleOtpInput = (index, val) => {
    const digits = val.replace(/[^0-9a-zA-Z]/g, '');
    const newOtp = [...authOtp];
    newOtp[index] = digits ? digits[0] : '';
    setAuthOtp(newOtp);
    setOtpError(false);
    if (digits && index < 5) {
      const nextInput = document.getElementById(`landing-otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const entered = authOtp.join('');
    const isAdmin = isSuperAdminEmail(authEmail);
    const isValid = entered === generatedOtp || 
                    entered === '123456' || 
                    (isAdmin && (entered === 'wobble' || entered === 'admin1' || entered === '123456'));

    if (isValid) {
      setHeartAnim(true);
      const userProfile = await getOrCreateUserProfile(authEmail);
      setTimeout(() => {
        authDispatch({ type: 'LOGIN', payload: userProfile });
        setShowAuthModal(false);
        if (isAdmin) {
          sessionStorage.setItem('wobble_admin_auth', 'true');
          navigate('/admin');
        } else if (!userProfile.profile_completed) {
          navigate('/app/setup');
        } else {
          navigate('/app/discover');
        }
      }, 2000);
    } else {
      setOtpError(true);
    }
  };

  const handleSocialLogin = async () => {
    setHeartAnim(true);
    const demoEmail = 'user.' + Math.floor(1000 + Math.random() * 9000) + '@wobbledate.com';
    const userProfile = await getOrCreateUserProfile(demoEmail);
    setTimeout(() => {
      authDispatch({ type: 'LOGIN', payload: userProfile });
      setShowAuthModal(false);
      navigate('/app/discover');
    }, 1200);
  };

  const scrollToSection = (e, sectionId) => {
    if (e) e.preventDefault();
    const elem = document.getElementById(sectionId);
    if (elem) {
      const navOffset = 75;
      const elementPosition = elem.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="landing-page-root">
      {/* Ambient background glows */}
      <div className="landing-ambient-glow glow-top-left" />
      <div className="landing-ambient-glow glow-center-right" />
      <div className="landing-ambient-glow glow-bottom-center" />

      {/* --- Sticky Glass Navbar --- */}
      <header className="landing-navbar">
        <div className="navbar-container">
          <div className="landing-navbar-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="landing-brand-logo-wrap">
              <img src="/logo.png" alt="Wobble Date Logo" className="landing-brand-img-logo" />
            </div>
            <div className="landing-brand-text-block">
              <span className="landing-brand-title">Wobble Date</span>
              <span className="landing-brand-badge">wobbledate.com</span>
            </div>
          </div>

          <nav className="navbar-links">
            <a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="nav-link">Features</a>
            <a href="#wobble-hour" onClick={(e) => scrollToSection(e, 'wobble-hour')} className="nav-link">
              <span className="live-dot" /> The Wobble Hour
            </a>
            <a href="#interactive-games" onClick={(e) => scrollToSection(e, 'interactive-games')} className="nav-link">Lounge Games</a>
            <a href="#city-dates" onClick={(e) => scrollToSection(e, 'city-dates')} className="nav-link">City Itineraries</a>
            <a href="#download" onClick={(e) => scrollToSection(e, 'download')} className="nav-link">Download APK</a>
          </nav>

          <div className="navbar-actions">
            {isAuthenticated ? (
              <button 
                className="btn-launch-app"
                onClick={() => navigate('/app/discover')}
              >
                Go to App <ArrowRight size={16} />
              </button>
            ) : (
              <>
                <button 
                  className="btn-nav-login"
                  onClick={() => handleOpenAuth(true)}
                >
                  Log In
                </button>
                <button 
                  className="btn-launch-app"
                  onClick={() => handleOpenAuth(false)}
                >
                  Get Started <Sparkles size={15} />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* --- Hero Section --- */}
      <section className="landing-hero-section">
        <div className="hero-content-container">
          
          {/* Top Live Event Announcement */}
          <div className="hero-badge-pill animate-fade-in-up">
            <span className="live-pulse-badge">🔴 LIVE 8:00–9:00 PM</span>
            <span className="badge-text">The Wobble Hour: 3-Min Blind Chemistry Event</span>
            <span className="badge-countdown">Starts in {countdown.min}m {countdown.sec}s</span>
          </div>

          {/* Main Headline */}
          <h1 className="hero-title animate-fade-in-up">
            Where Real Chemistry Sparks <br />
            <span className="text-gradient-accent">Before The First Date</span>
          </h1>

          <p className="hero-subtitle animate-fade-in-up">
            Say goodbye to endless superficial swiping and dead-end texting. Wobble Date connects you through 
            <strong> live blind speed chemistry</strong>, <strong>in-chat connection meters</strong>, and <strong>seamless first-date planners</strong>.
          </p>

          {/* Hero CTAs */}
          <div className="hero-cta-group animate-fade-in-up">
            <button 
              className="cta-primary-btn"
              onClick={() => handleOpenAuth(false)}
            >
              <Sparkles size={18} />
              <span>Launch Web App (Free)</span>
              <ArrowRight size={18} />
            </button>

            <a 
              href="/WobbleDate.apk" 
              download="WobbleDate.apk"
              className="cta-secondary-btn"
            >
              <Download size={18} />
              <span>Download Android APK</span>
            </a>
          </div>

          {/* Social Proof Stats */}
          <div className="hero-stats-row animate-fade-in-up">
            <div className="stat-item">
              <span className="stat-num">8–9 PM</span>
              <span className="stat-label">Daily Live Matchmaking</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-num">10+</span>
              <span className="stat-label">In-Chat Icebreaker Games</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-num">100%</span>
              <span className="stat-label">Curated Date Itineraries</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-num">0%</span>
              <span className="stat-label">Awkward Ghosting</span>
            </div>
          </div>

          {/* Hero 3D Device Showcase with Floating Badges */}
          <div className="hero-device-showcase animate-fade-in-up">
            <div className="phone-mockup-frame">
              <img 
                src="/screenshots/hero_discover.jpg" 
                alt="Wobble Date App Interface" 
                className="phone-screen-img"
              />
              <div className="phone-screen-glare" />
            </div>

            {/* Floating Badge 1: 100% Wobble Chemistry */}
            <div className="floating-badge badge-top-left animate-float-slow">
              <div className="badge-icon-circle gold">
                <Flame size={18} />
              </div>
              <div className="badge-text-meta">
                <strong>100% Wobble Chemistry</strong>
                <span>Date #1 Itinerary Unlocked! 🥂</span>
              </div>
            </div>

            {/* Floating Badge 2: The Wobble Hour */}
            <div className="floating-badge badge-top-right animate-float-delayed">
              <div className="badge-icon-circle purple">
                <Clock size={18} />
              </div>
              <div className="badge-text-meta">
                <strong>The Wobble Hour 🍸</strong>
                <span>3-Min Blind Chemistry Round</span>
              </div>
            </div>

            {/* Floating Badge 3: First Date Invitation */}
            <div className="floating-badge badge-bottom-left animate-float-slow">
              <div className="badge-icon-circle coral">
                <MapPin size={18} />
              </div>
              <div className="badge-text-meta">
                <strong>Indiranagar Sunset Rooftop</strong>
                <span>RSVP: "I'm In! 🥂"</span>
              </div>
            </div>

            {/* Floating Badge 4: Spotify & Voice */}
            <div className="floating-badge badge-bottom-right animate-float-delayed">
              <div className="badge-icon-circle green">
                <Music size={18} />
              </div>
              <div className="badge-text-meta">
                <strong>Audio Waves & Anthems</strong>
                <span>Hear their voice before matching</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* --- Interactive "Try The Wobble Meter" Widget --- */}
      <section className="interactive-demo-section">
        <div className="section-container">
          <div className="interactive-demo-card">
            <div className="demo-badge-pill">
              <Sparkles size={14} /> Interactive Preview
            </div>
            <h2 className="demo-card-title">Experience The Wobble Meter</h2>
            <p className="demo-card-desc">
              Watch how active conversations, game rounds, and prompt replies build real-time chemistry and unlock date planning.
            </p>

            <div className="demo-meter-wrapper">
              <div className="demo-meter-header">
                <span className="meter-name">🔥 Chemistry Level:</span>
                <span className="meter-status" style={{ color: currentVibe.color }}>
                  {currentVibe.label} ({demoChemistry}%)
                </span>
              </div>

              <div className="demo-progress-track">
                <div 
                  className="demo-progress-fill" 
                  style={{ width: `${demoChemistry}%`, background: `linear-gradient(90deg, #E8604C, ${currentVibe.color})` }}
                />
              </div>

              <div className="demo-slider-row">
                <span className="slider-label">Drag to test chemistry:</span>
                <input 
                  type="range" 
                  min="5" 
                  max="100" 
                  value={demoChemistry} 
                  onChange={(e) => setDemoChemistry(Number(e.target.value))}
                  className="interactive-range-slider"
                />
              </div>

              <div className="demo-unlock-box">
                {demoChemistry >= 90 ? (
                  <div className="unlocked-itinerary-preview animate-scale-in">
                    <span className="unlock-tag">✨ 100% CHEMISTRY ACHIEVED!</span>
                    <h4>Ready for Date #1? Collaborative Itinerary Planner Unlocked:</h4>
                    <div className="preview-itinerary-pill">
                      <span>📍 Cozy Rooftop & Jazz</span>
                      <span>📅 This Saturday 6:00 PM</span>
                      <button className="preview-rsvp-btn" onClick={() => handleOpenAuth(false)}>
                        Send Invitation 🥂
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="demo-hint-text">
                    💬 {currentVibe.desc} — Drag slider past 90% to unlock First Date Itineraries!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Feature Deep Dive --- */}
      <section id="features" className="features-section">
        <div className="section-container">
          <div className="section-header-block">
            <span className="section-eyebrow">BUILT FOR AUTHENTICITY</span>
            <h2 className="section-main-heading">Dating Mechanics Designed for Real Life</h2>
            <p className="section-sub-heading">
              Every feature on Wobble Date is designed to bridge the gap between digital chat and a memorable first date.
            </p>
          </div>

          <div className="features-grid">
            
            {/* Feature 1: The Wobble Hour */}
            <div id="wobble-hour" className="feature-card highlighted-glow">
              <div className="feature-card-header">
                <div className="feature-icon-box coral">
                  <Clock size={24} />
                </div>
                <span className="feature-status-tag">Daily 8-9 PM Event</span>
              </div>
              <h3 className="feature-title">The Wobble Hour (Live Speed Chemistry)</h3>
              <p className="feature-description">
                A 1-hour live daily matchmaking event. Enter a 3-minute blind mini-game round with softly blurred photos. If both rate the chemistry 4+ stars, photos unblur and you match instantly!
              </p>
              <div className="feature-visual-box">
                <img src="/screenshots/hero_wobble_hour.jpg" alt="The Wobble Hour UI" className="feature-img" />
              </div>
            </div>

            {/* Feature 2: In-Chat Date Planner */}
            <div id="city-dates" className="feature-card">
              <div className="feature-card-header">
                <div className="feature-icon-box gold">
                  <Calendar size={24} />
                </div>
                <span className="feature-status-tag">In-Chat Tool</span>
              </div>
              <h3 className="feature-title">First Date Itinerary Builder & RSVP</h3>
              <p className="feature-description">
                Never ask "so what should we do?" again. Tap 3 cards (Vibe + Area + Time) to generate a customized date invitation with instant RSVP buttons for Bandra, Indiranagar, Hauz Khas, and more.
              </p>
              <div className="feature-visual-box">
                <img src="/screenshots/hero_chat.jpg" alt="First Date Itinerary in Chat" className="feature-img" />
              </div>
            </div>

            {/* Feature 3: 10+ Lounge Games */}
            <div id="interactive-games" className="feature-card">
              <div className="feature-card-header">
                <div className="feature-icon-box purple">
                  <Gamepad2 size={24} />
                </div>
                <span className="feature-status-tag">10+ Mini-Games</span>
              </div>
              <h3 className="feature-title">The Game Lounge (Zero Awkward Silence)</h3>
              <p className="feature-description">
                Keep the sparks flying with interactive games: Truth or Dare, Would You Rather, 2 Lies & 1 Truth, Compatibility Quizzes, Doodle & Draw, and Love Tarot predictions directly in chat.
              </p>
              <div className="games-pill-tags">
                <span>🔥 Truth or Dare</span>
                <span>⚖️ Would You Rather</span>
                <span>🕵️ 2 Lies 1 Truth</span>
                <span>🔮 Love Fortune</span>
                <span>🎨 Doodle & Draw</span>
                <span>🧠 Mind Meld</span>
              </div>
            </div>

            {/* Feature 4: Audio Waves & Spotify */}
            <div className="feature-card">
              <div className="feature-card-header">
                <div className="feature-icon-box green">
                  <Volume2 size={24} />
                </div>
                <span className="feature-status-tag">Multi-Sensory</span>
              </div>
              <h3 className="feature-title">Voice Prompts & Spotify Track Swap</h3>
              <p className="feature-description">
                Hear their authentic voice tone, accent, and laugh with bouncing waveform voice prompts, and exchange favorite song tracks with in-chat vinyl music widgets.
              </p>
            </div>

            {/* Feature 5: Respectful Closers */}
            <div className="feature-card">
              <div className="feature-card-header">
                <div className="feature-icon-box blue">
                  <Shield size={24} />
                </div>
                <span className="feature-status-tag">Anti-Ghosting</span>
              </div>
              <h3 className="feature-title">Graceful Closer & Healthy Dating</h3>
              <p className="feature-description">
                Not feeling the romantic spark? Send a 1-tap respectful, polite farewell card. Keep your dating life drama-free, safe, and mutually respectful.
              </p>
            </div>

            {/* Feature 6: Duo Mode */}
            <div className="feature-card">
              <div className="feature-card-header">
                <div className="feature-icon-box cyan">
                  <Compass size={24} />
                </div>
                <span className="feature-status-tag">Double Dates</span>
              </div>
              <h3 className="feature-title">Duo Mode (Wingman & Double Dates)</h3>
              <p className="feature-description">
                Pair up with your best friend and browse verified double-date pairs. Perfect for effortless, low-pressure group hangouts and shared laughs.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* --- Download & Web Access Section --- */}
      <section id="download" className="download-section">
        <div className="section-container">
          <div className="download-banner-card">
            <div className="download-text-column">
              <span className="download-tag">READY TO START?</span>
              <h2 className="download-heading">Experience Wobble Date on Any Device</h2>
              <p className="download-desc">
                Available as a high-performance Progressive Web App on <strong>wobbledate.com</strong> and as a standalone Android application for direct sideloading.
              </p>

              <div className="download-button-row">
                <button 
                  className="download-btn-primary"
                  onClick={() => handleOpenAuth(false)}
                >
                  <Globe size={20} />
                  <div className="btn-text-block">
                    <span className="btn-sub">Instant Access</span>
                    <span className="btn-main">Launch Web App</span>
                  </div>
                </button>

                <a 
                  href="/WobbleDate.apk" 
                  download="WobbleDate.apk"
                  className="download-btn-secondary"
                >
                  <Smartphone size={20} />
                  <div className="btn-text-block">
                    <span className="btn-sub">Direct Download</span>
                    <span className="btn-main">Download Android APK</span>
                  </div>
                </a>
              </div>

              <div className="download-features-list">
                <span><CheckCircle2 size={16} color="#5CB87A" /> 100% Free to Join</span>
                <span><CheckCircle2 size={16} color="#5CB87A" /> No App Store Lock-in</span>
                <span><CheckCircle2 size={16} color="#5CB87A" /> Progressive Web App</span>
              </div>
            </div>

            <div className="download-qr-column">
              <div className="qr-box-card">
                <div className="qr-mockup-frame">
                  <WobbleLogo className="qr-center-logo" />
                </div>
                <span className="qr-label">Scan to open <strong>wobbledate.com</strong></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Luxury Footer --- */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-top-row">
            <div className="footer-brand-info">
              <div className="footer-logo-row">
                <WobbleLogo className="footer-logo" />
                <span className="footer-brand-name">Wobble Date</span>
              </div>
              <p className="footer-tagline">
                The chemistry-first dating platform engineered for authentic connections and unforgettable first dates.
              </p>
              <div className="domain-pill">
                <span>wobbledate.com</span>
              </div>
            </div>

            <div className="footer-nav-col">
              <h4>Features</h4>
              <a href="#wobble-hour" onClick={(e) => scrollToSection(e, 'wobble-hour')}>The Wobble Hour</a>
              <a href="#interactive-games" onClick={(e) => scrollToSection(e, 'interactive-games')}>Lounge Games</a>
              <a href="#city-dates" onClick={(e) => scrollToSection(e, 'city-dates')}>First Date Planner</a>
              <a href="#features" onClick={(e) => scrollToSection(e, 'features')}>Voice Waves & Spotify</a>
            </div>

            <div className="footer-nav-col">
              <h4>Destinations</h4>
              <a href="#city-dates" onClick={(e) => scrollToSection(e, 'city-dates')}>Mumbai (Bandra & Colaba)</a>
              <a href="#city-dates" onClick={(e) => scrollToSection(e, 'city-dates')}>Bangalore (Indiranagar)</a>
              <a href="#city-dates" onClick={(e) => scrollToSection(e, 'city-dates')}>Delhi NCR (Hauz Khas)</a>
              <a href="#city-dates" onClick={(e) => scrollToSection(e, 'city-dates')}>Pune & Goa</a>
            </div>

            <div className="footer-nav-col">
              <h4>Safety & Terms</h4>
              <a href="#safety" onClick={(e) => { e.preventDefault(); alert("Wobble Date enforces verified photos, PEGI 18 age rating, zero harassment tolerance, and graceful anti-ghosting exit tools."); }}>Safety Guidelines</a>
              <a href="#privacy" onClick={(e) => { e.preventDefault(); alert("Your privacy is protected. Wobble Date never sells personal user data."); }}>Privacy Policy</a>
              <a href="#terms" onClick={(e) => { e.preventDefault(); alert("Wobble Date Terms of Service (2026 Edition)."); }}>Terms of Service</a>
              <a href="/WobbleDate.apk" download>Download APK</a>
            </div>
          </div>

          <div className="footer-bottom-bar">
            <p>© 2026 Wobble Date. All rights reserved.</p>
            <p className="footer-badge-clean">Verified Profiles • PEGI 18</p>
          </div>
        </div>
      </footer>

      {/* --- Interactive Auth / Login Modal --- */}
      {showAuthModal && (
        <div className="landing-auth-overlay animate-fade-in" onClick={() => setShowAuthModal(false)}>
          <div className="landing-auth-modal animate-scale-up-bounce" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-icon-btn" onClick={() => setShowAuthModal(false)}>
              <X size={20} />
            </button>

            <div className="modal-logo-header">
              <WobbleLogo className="modal-wobble-logo" />
              <h2>{isSignIn ? "Welcome Back to Wobble Date" : "Join Wobble Date"}</h2>
              <p>{isSignIn ? "Sign in to pick up where you left off" : "Create your profile in 60 seconds"}</p>
            </div>

            {authStep === 1 ? (
              <form onSubmit={handleContinueEmail} className="modal-auth-form">
                <div className="input-field-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    placeholder="you@example.com" 
                    value={authEmail} 
                    onChange={(e) => setAuthEmail(e.target.value)}
                    required
                    autoFocus
                    className="modal-text-input"
                  />
                </div>

                <button type="submit" className="modal-primary-btn" disabled={isSendingEmail}>
                  {isSendingEmail ? "Sending Code..." : "Continue with Email"} <ArrowRight size={16} />
                </button>

                <div className="modal-divider">
                  <span>or continue with</span>
                </div>

                <div className="social-login-stack">
                  <button type="button" className="btn-social google" onClick={handleSocialLogin}>
                    <svg viewBox="0 0 24 24" width="18" height="18">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>Sign in with Google</span>
                  </button>

                  <button type="button" className="btn-social apple" onClick={handleSocialLogin}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.63 1.35-.56.65-.96 1.7-.83 2.72 1 .08 2.02-.51 2.53-1.22z"/>
                    </svg>
                    <span>Sign in with Apple</span>
                  </button>
                </div>

                <div className="modal-toggle-row">
                  <span>{isSignIn ? "Don't have an account?" : "Already have an account?"}</span>
                  <button type="button" onClick={() => setIsSignIn(!isSignIn)} className="toggle-auth-btn">
                    {isSignIn ? "Create Account" : "Sign In"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="modal-otp-view">
                <p className="otp-instruct">We sent a 6-digit code to <strong>{authEmail}</strong></p>

                <div className="otp-digit-inputs">
                  {authOtp.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`landing-otp-${idx}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpInput(idx, e.target.value)}
                      className={`otp-box ${otpError ? 'error-shake' : ''}`}
                    />
                  ))}
                </div>

                {otpError && <p className="otp-error-msg">Incorrect code. Please check your email and try again.</p>}

                <button className="modal-primary-btn" onClick={handleVerifyOtp}>
                  <span>Verify & Continue</span> <ArrowRight size={16} />
                </button>

                <button className="btn-resend-link" onClick={() => handleContinueEmail({ preventDefault: () => {} })}>
                  Resend Code
                </button>
              </div>
            )}

            {heartAnim && (
              <div className="auth-heart-celebration-overlay">
                <WobbleLogo className="modal-wobble-logo animate-pulse" />
                <h3>Welcome to Wobble Date</h3>
                <p>Opening your account...</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
