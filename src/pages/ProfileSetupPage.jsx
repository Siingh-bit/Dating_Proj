import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle, 
  Upload, 
  RefreshCw, 
  ChevronRight, 
  MapPin, 
  Plus, 
  X,
  FileText,
  Scan,
  Heart,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile } from '../services/userService';
import WobbleLogo from '../components/shared/WobbleLogo';
import './ProfileSetupPage.css';

export default function ProfileSetupPage() {
  const navigate = useNavigate();
  const { user, dispatch } = useAuth();
  const [step, setStep] = useState(1); // 1: Basics & Photos, 2: Prompts & Bio, 3: Verification (Selfie & Govt ID)

  // Step 1 State: Basics & Photos
  const [name, setName] = useState(user?.name || '');
  const [age, setAge] = useState(user?.age || 24);
  const [gender, setGender] = useState(user?.gender || 'male');
  const [location, setLocation] = useState(user?.location || 'Mumbai, India');
  const [photos, setPhotos] = useState(user?.photos?.length ? user?.photos : [
    '/profiles/isha/1.jpg',
    '/profiles/isha/2.jpg',
    '/profiles/isha/3.jpg',
    '/profiles/isha/4.jpg',
  ]);

  // Step 2 State: Bio & Prompts
  const [bio, setBio] = useState(user?.bio || 'Love spontaneous weekend trips, filter coffee, and deep late-night talks.');
  const [prompts, setPrompts] = useState(user?.prompts?.length ? user?.prompts : [
    { question: 'My simple pleasures are', answer: 'Iced matcha latte and sunset walks at Bandstand.' },
    { question: "I'll fall for you if", answer: 'You are passionate about your craft and make me laugh unexpectedly.' },
    { question: 'The hallmark of a good relationship is', answer: 'Unfiltered comfort, mutual trust, and endless banter.' },
  ]);

  // Step 3 State: Live Selfie & Govt ID
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [capturedSelfie, setCapturedSelfie] = useState(user?.live_selfie_url || null);

  const idVideoRef = useRef(null);
  const idCanvasRef = useRef(null);
  const [idCameraActive, setIdCameraActive] = useState(false);
  const [idCameraStream, setIdCameraStream] = useState(null);
  const [capturedId, setCapturedId] = useState(user?.govt_id_url || null);

  // Stop camera streams on unmount
  useEffect(() => {
    return () => {
      stopCamera(cameraStream);
      stopCamera(idCameraStream);
    };
  }, [cameraStream, idCameraStream]);

  const stopCamera = (stream) => {
    if (stream) stream.getTracks().forEach(t => t.stop());
  };

  // Selfie camera
  const startSelfieCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
        audio: false,
      });
      setCameraStream(stream);
      setCameraActive(true);
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (e) {
      console.warn('Camera error:', e);
    }
  };

  const snapSelfie = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current;
    const c = canvasRef.current;
    c.width = v.videoWidth || 480;
    c.height = v.videoHeight || 480;
    c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);
    setCapturedSelfie(c.toDataURL('image/jpeg', 0.9));
    stopCamera(cameraStream);
    setCameraActive(false);
  };

  // Govt ID camera
  const startIdCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setIdCameraStream(stream);
      setIdCameraActive(true);
      if (idVideoRef.current) idVideoRef.current.srcObject = stream;
    } catch (e) {
      console.warn('ID Camera error:', e);
    }
  };

  const snapId = () => {
    if (!idVideoRef.current || !idCanvasRef.current) return;
    const v = idVideoRef.current;
    const c = idCanvasRef.current;
    c.width = v.videoWidth || 800;
    c.height = v.videoHeight || 500;
    c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);
    setCapturedId(c.toDataURL('image/jpeg', 0.9));
    stopCamera(idCameraStream);
    setIdCameraActive(false);
  };

  const handleIdFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const r = new FileReader();
      r.onload = (ev) => setCapturedId(ev.target.result);
      r.readAsDataURL(file);
    }
  };

  // Finish setup
  const handleSaveAndComplete = async () => {
    const updatedProfile = {
      name: name || user?.name || 'Alex',
      age: parseInt(age, 10) || 24,
      gender,
      location,
      photos,
      bio,
      prompts,
      live_selfie_url: capturedSelfie || photos[0],
      govt_id_url: capturedId || null,
      govt_id_status: capturedId ? 'uploaded' : 'none',
      profile_completed: true,
      verification_status: 'pending',
    };

    dispatch({
      type: 'UPDATE_PROFILE',
      payload: updatedProfile,
    });

    if (user?.id) {
      await updateUserProfile(user.id, updatedProfile);
    }

    navigate('/app/discover');
  };

  return (
    <div className="profile-setup-page">
      <div className="setup-header">
        <WobbleLogo size={28} />
        <h1>Complete Your Profile</h1>
        <p>Set up your authentic dating profile on Wobble Date</p>
      </div>

      <div className="setup-progress-bar">
        <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>1. Basics</div>
        <div className="progress-connector"></div>
        <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>2. Bio & Prompts</div>
        <div className="progress-connector"></div>
        <div className={`step-dot ${step >= 3 ? 'active' : ''}`}>3. Verification</div>
      </div>

      <div className="setup-card">
        {/* STEP 1: BASICS & 4 PHOTOS */}
        {step === 1 && (
          <div className="setup-step-body animate-fade-in">
            <h2>Personal Basics & Photos</h2>
            <p className="step-desc">Add your info and at least 4 clear photos.</p>

            <div className="setup-form-grid">
              <div className="form-group">
                <label>First Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Your Name"
                  className="setup-input"
                />
              </div>

              <div className="form-group">
                <label>Age</label>
                <input 
                  type="number" 
                  value={age} 
                  onChange={(e) => setAge(e.target.value)} 
                  className="setup-input"
                />
              </div>

              <div className="form-group full-width">
                <label>City & Location</label>
                <div className="input-with-icon">
                  <MapPin size={16} />
                  <input 
                    type="text" 
                    value={location} 
                    onChange={(e) => setLocation(e.target.value)} 
                    placeholder="e.g. Bandra, Mumbai"
                    className="setup-input"
                  />
                </div>
              </div>
            </div>

            <label className="section-subtitle">Profile Photos (4 required)</label>
            <div className="photos-preview-strip">
              {photos.map((p, i) => (
                <div key={i} className="photo-box">
                  <img src={p} alt={`Photo ${i + 1}`} />
                  <span className="photo-tag">#{i + 1}</span>
                </div>
              ))}
            </div>

            <button className="btn-setup-continue" onClick={() => setStep(2)}>
              <span>Next: Bio & Prompts</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* STEP 2: BIO & 3 PROMPTS */}
        {step === 2 && (
          <div className="setup-step-body animate-fade-in">
            <h2>Your Vibe & Prompts</h2>
            <p className="step-desc">Show your personality and what makes you tick.</p>

            <div className="form-group">
              <label>Short Bio</label>
              <textarea 
                value={bio} 
                onChange={(e) => setBio(e.target.value)} 
                rows={3} 
                className="setup-textarea"
                placeholder="A little bit about you..."
              />
            </div>

            <label className="section-subtitle">Your 3 Prompts</label>
            <div className="prompts-edit-stack">
              {prompts.map((p, idx) => (
                <div key={idx} className="prompt-edit-card">
                  <div className="prompt-label">{p.question}</div>
                  <input 
                    type="text" 
                    value={p.answer} 
                    onChange={(e) => {
                      const updated = [...prompts];
                      updated[idx].answer = e.target.value;
                      setPrompts(updated);
                    }}
                    className="prompt-text-input"
                  />
                </div>
              ))}
            </div>

            <div className="setup-btn-row">
              <button className="btn-setup-back" onClick={() => setStep(1)}>Back</button>
              <button className="btn-setup-continue" onClick={() => setStep(3)}>
                <span>Next: Verification</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: LIVE SELFIE & GOVT ID VERIFICATION */}
        {step === 3 && (
          <div className="setup-step-body animate-fade-in">
            <h2>Identity & Verification</h2>
            <p className="step-desc">
              Snap a live camera selfie to prove liveness. Optionally attach a Government ID for the Official Verified Badge.
            </p>

            {/* Live Selfie Box */}
            <div className="verification-card-unit">
              <div className="unit-header">
                <Camera size={18} color="#E8604C" />
                <div>
                  <strong>Live Selfie Check</strong>
                  <span>Align face inside the oval HUD</span>
                </div>
              </div>

              <div className="viewfinder-mini-box">
                {cameraActive ? (
                  <div className="live-camera-wrap">
                    <video ref={videoRef} autoPlay playsInline muted className="camera-feed" />
                    <div className="oval-face-hud"></div>
                    <button className="btn-snap-circle" onClick={snapSelfie}></button>
                  </div>
                ) : capturedSelfie ? (
                  <div className="captured-preview-wrap">
                    <img src={capturedSelfie} alt="Live Selfie" />
                    <button className="btn-resnap" onClick={startSelfieCamera}><RefreshCw size={14} /> Retake</button>
                  </div>
                ) : (
                  <div className="idle-camera-trigger" onClick={startSelfieCamera}>
                    <Camera size={28} />
                    <span>Tap to take live selfie</span>
                  </div>
                )}
              </div>
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>

            {/* Govt ID Box (With Rectangular Guide) */}
            <div className="verification-card-unit gold-border">
              <div className="unit-header">
                <Sparkles size={18} color="#FFD700" />
                <div>
                  <strong>Government ID (Optional for Verified Badge)</strong>
                  <span>Aadhaar, Driving License, or Passport in rectangle box</span>
                </div>
              </div>

              <div className="id-viewfinder-mini-box">
                {idCameraActive ? (
                  <div className="live-camera-wrap">
                    <video ref={idVideoRef} autoPlay playsInline muted className="camera-feed" />
                    <div className="rect-id-hud">
                      <div className="hud-corner tl"></div>
                      <div className="hud-corner tr"></div>
                      <div className="hud-corner bl"></div>
                      <div className="hud-corner br"></div>
                    </div>
                    <button className="btn-snap-circle gold" onClick={snapId}></button>
                  </div>
                ) : capturedId ? (
                  <div className="captured-preview-wrap">
                    <img src={capturedId} alt="Govt ID" />
                    <button className="btn-resnap" onClick={startIdCamera}><RefreshCw size={14} /> Rescan</button>
                  </div>
                ) : (
                  <div className="idle-id-trigger" onClick={startIdCamera}>
                    <Scan size={28} color="#FFD700" />
                    <span>Tap to scan ID Card</span>
                  </div>
                )}
              </div>
              <canvas ref={idCanvasRef} style={{ display: 'none' }} />

              {!capturedId && (
                <label className="btn-upload-file-id">
                  <Upload size={14} />
                  <span>Or upload ID image file</span>
                  <input type="file" accept="image/*" onChange={handleIdFileUpload} style={{ display: 'none' }} />
                </label>
              )}
            </div>

            <div className="setup-btn-row">
              <button className="btn-setup-back" onClick={() => setStep(2)}>Back</button>
              <button className="btn-setup-finish" onClick={handleSaveAndComplete}>
                <ShieldCheck size={18} />
                <span>Save Profile & Start Dating</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
