import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CURRENT_USER } from '../data/mockData';
import { Heart, ChevronLeft, Loader2 } from 'lucide-react';
import WobbleLogo from '../components/shared/WobbleLogo';
import OtpHeartReveal, { REVEAL_DURATION } from '../components/shared/OtpHeartReveal';
import WobbleIntroOverlay, { INTRO_DURATION } from '../components/shared/WobbleIntroOverlay';
import { sendBrevoOtpEmail } from '../services/emailService';
import { getOrCreateUserProfile, isSuperAdminEmail } from '../services/userService';
import './AuthPage.css';

const AuthPage = () => {
  const [step, setStep] = useState(1);
  const [introPlaying, setIntroPlaying] = useState(false);
  const introTimer = useRef(null);
  const [isSignIn, setIsSignIn] = useState(false);
  const [email, setEmail] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [authErrorMsg, setAuthErrorMsg] = useState('');
  const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  
  const { dispatch } = useAuth();
  const navigate = useNavigate();

  useEffect(() => () => clearTimeout(introTimer.current), []);

  const handleGetStarted = () => {
    if (introPlaying) return;
    setIsSignIn(false);
    setIntroPlaying(true);
    introTimer.current = setTimeout(() => {
      setIntroPlaying(false);
      setStep(2);
    }, INTRO_DURATION);
  };

  const handleHaveAccount = () => {
    setIsSignIn(true);
    setStep(2);
  };

  const handleContinue = async (e) => {
    e.preventDefault();
    if (!email) return;

    // Generate real 6-digit random code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setIsSendingEmail(true);

    try {
      // sendBrevoOtpEmail RESOLVES with { success:false } on failure rather
      // than throwing, so the result has to be inspected. Previously this
      // advanced to the code screen regardless, leaving the user waiting for
      // an email that was never going to arrive.
      const result = await sendBrevoOtpEmail(email, code);
      if (!result?.success) {
        setAuthErrorMsg("We couldn't send your code right now. Please check the address and try again.");
        return;
      }
      setAuthErrorMsg('');
      setStep(3);
    } catch (err) {
      console.error('[Wobble Date] Could not send verification email:', err);
      setAuthErrorMsg("We couldn't send your code right now. Please check the address and try again.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleOtpChange = (index, value) => {
    const digitsOnly = value.replace(/[^0-9a-zA-Z]/g, '');
    
    // Handle paste of full string
    if (digitsOnly.length > 1) {
      const pastedData = digitsOnly.slice(0, 6).split('');
      const newOtp = [...otp];
      pastedData.forEach((char, i) => {
        if (index + i < 6) newOtp[index + i] = char;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + pastedData.length, 5);
      inputRefs[nextIndex].current.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = digitsOnly;
    setOtp(newOtp);
    setOtpError(false);

    if (digitsOnly && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handleVerify = async () => {
    if (isVerifying) return;
    const enteredOtp = otp.join('');

    // The emailed code is the only accepted credential — see LandingPage for
    // the backdoors that used to live here.
    if (!generatedOtp || enteredOtp !== generatedOtp) {
      setOtpError(true);
      setTimeout(() => setOtpError(false), 500); // reset after shake
      return;
    }

    setIsVerifying(true);
    setAuthErrorMsg('');
    setStep(4);

    let userProfile;
    try {
      userProfile = await getOrCreateUserProfile(email);
    } catch (err) {
      console.error('[Wobble Date] Sign-in failed:', err);
      setStep(3);
      setIsVerifying(false);
      setAuthErrorMsg("We couldn't finish signing you in. Please check your connection and try again.");
      return;
    }

    const isAdmin = isSuperAdminEmail(email);
    setTimeout(() => {
      dispatch({ type: 'LOGIN', payload: userProfile });
      setIsVerifying(false);
      if (isAdmin) {
        sessionStorage.setItem('wobble_admin_auth', 'true');
        navigate('/admin');
      } else {
        // Profile setup is prompted from inside Discover instead of blocking
        // the way in.
        navigate('/app/discover');
      }
    }, REVEAL_DURATION); // stay in step with the heart reveal
  };

  return (
    <div className="auth-page">
      {introPlaying && <WobbleIntroOverlay />}


      {step > 1 && step < 4 && (
        <button className="back-button" onClick={() => setStep(step - 1)}>
          <ChevronLeft size={24} />
        </button>
      )}

      {step === 1 && (
        <div className="step-container step-1 fade-in">
          <div className="brand-header">
            <div className="logo-container">
              <WobbleLogo className="logo-icon-img" />
            </div>
            <h1 className="brand-name">Wobble Date</h1>
            <p className="brand-tagline">Find your perfect match in the dark.</p>
          </div>
          <div className="auth-actions">
            <button className="btn-primary" onClick={handleGetStarted}>
              Get Started
            </button>
            <button className="btn-secondary" onClick={handleHaveAccount}>
              I have an account
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="step-container step-2 slide-in-right">
          <div className="auth-form-header">
            <h2>{isSignIn ? 'Welcome Back' : 'Create Account'}</h2>
            <p>Enter your email to continue</p>
          </div>
          
          <form className="auth-form" onSubmit={handleContinue}>
            <div className="input-group">
              <input 
                type="email" 
                placeholder="Email address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary" disabled={isSendingEmail}>
              {isSendingEmail ? 'Sending Code...' : 'Continue'}
            </button>
          </form>

          <div className="divider">
            <span>or continue with</span>
          </div>

          <div className="social-login">
            <button className="btn-social btn-google">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>
            <button className="btn-social btn-apple">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.365 7.159c1.036-1.258 1.737-3.003 1.547-4.747-1.492.062-3.357 1.01-4.43 2.268-1.002 1.144-1.848 2.935-1.618 4.64 1.666.126 3.465-.898 4.501-2.161zM17.514 18.067c-.642 1.845-2.585 5.568-4.764 5.568-1.042 0-1.643-.655-3.067-.655-1.442 0-2.127.636-3.085.636-2.217 0-4.343-4.004-4.996-5.856-1.523-4.321-.497-8.318 2.016-9.761 1.255-.718 2.605-1.164 3.978-1.164 1.523 0 2.766.702 3.731.702.943 0 2.457-.76 4.195-.76 1.472 0 3.342.545 4.52 1.954-3.791 1.996-3.167 6.942.531 8.35-1.127 1.637-2.317 3.315-3.059 4.986z" fill="#FFFFFF"/>
              </svg>
              Sign in with Apple
            </button>
          </div>

          <p className="auth-toggle" onClick={() => setIsSignIn(!isSignIn)}>
            {isSignIn ? "New here? Create account" : "Already have an account? Sign in"}
          </p>
        </div>
      )}

      {step === 3 && (
        <div className="step-container step-3 slide-in-right">
          <div className="auth-form-header">
            <h2>Enter verification code</h2>
            <p>We sent a 6-digit code to {email || 'your email'}</p>
          </div>

          <div className={`otp-container ${otpError ? 'shake' : ''}`}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={inputRefs[index]}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                className={`otp-input ${digit ? 'filled' : ''} ${otpError ? 'error' : ''}`}
                autoComplete="off"
              />
            ))}
          </div>
          
          {otpError && <p className="otp-error-text">Incorrect code. Please try again.</p>}

          <button onClick={handleVerify} className="btn-primary verify-btn" disabled={otp.join('').length !== 6}>
            Verify
          </button>
          
          <p className="resend-link">
            Didn't receive the code? <span>Resend Code</span>
          </p>
        </div>
      )}

      {step === 4 && (
        <div className="step-container step-4">
          <OtpHeartReveal
            digits={otp}
            title="Welcome to Wobble Date"
            subtitle="Let's find your match"
          />
        </div>
      )}

    </div>
  );
};

export default AuthPage;
