import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  ShieldCheck, 
  CheckCircle, 
  Upload, 
  RefreshCw, 
  ChevronRight, 
  Sparkles, 
  FileText, 
  X, 
  Plus, 
  AlertCircle,
  HelpCircle,
  Scan
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserProfile } from '../../services/userService';
import { PROMPTS_CATALOG } from '../../data/mockData';
import './ProfileVerificationWizard.css';

export default function ProfileVerificationWizard({ onComplete }) {
  const { user, dispatch } = useAuth();
  const [currentStep, setCurrentStep] = useState(1); // 1: Photos & Prompts, 2: Live Selfie, 3: Govt ID

  // Step 1: Photos & Prompts State
  // Starts empty. This used to pre-fill a new user with a seeded profile's
  // four photos, bio and prompt answers — publishing someone else's face and
  // words as their own if they didn't overwrite every field.
  const [photos, setPhotos] = useState(user?.photos?.length ? user.photos : []);
  const [bio, setBio] = useState(user?.bio || '');
  const [prompts, setPrompts] = useState(user?.prompts?.length ? user.prompts : [
    { question: 'My simple pleasures are', answer: '' },
    { question: "I'll fall for you if", answer: '' },
    { question: 'The hallmark of a good relationship is', answer: '' },
  ]);

  // Step 2: Live Selfie Camera State
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [capturedSelfie, setCapturedSelfie] = useState(user?.live_selfie_url || null);
  const [cameraError, setCameraError] = useState(null);

  // Step 3: Govt ID Camera State
  const idVideoRef = useRef(null);
  const idCanvasRef = useRef(null);
  const [idCameraActive, setIdCameraActive] = useState(false);
  const [idCameraStream, setIdCameraStream] = useState(null);
  const [capturedId, setCapturedId] = useState(user?.govt_id_url || null);
  const [idCameraError, setIdCameraError] = useState(null);

  // Stop camera streams on unmount
  useEffect(() => {
    return () => {
      stopCamera(cameraStream);
      stopCamera(idCameraStream);
    };
  }, [cameraStream, idCameraStream]);

  const stopCamera = (stream) => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  // -------------------------------------------------------------
  // LIVE SELFIE CAMERA CONTROLS
  // -------------------------------------------------------------
  const startSelfieCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
        audio: false,
      });
      setCameraStream(stream);
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Webcam not accessible:', err);
      setCameraError('Camera access denied or unavailable. You can upload a photo directly.');
      setCameraActive(false);
    }
  };

  const captureSelfieSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 480;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedSelfie(dataUrl);
    stopCamera(cameraStream);
    setCameraActive(false);
  };

  const handleSelfieFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedSelfie(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // -------------------------------------------------------------
  // GOVT ID CAMERA CONTROLS (With Rectangular Guide Box)
  // -------------------------------------------------------------
  const startIdCamera = async () => {
    setIdCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setIdCameraStream(stream);
      setIdCameraActive(true);
      if (idVideoRef.current) {
        idVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('ID Camera not accessible:', err);
      setIdCameraError('Camera access unavailable. You can upload an ID photo from files.');
      setIdCameraActive(false);
    }
  };

  const captureIdSnapshot = () => {
    if (!idVideoRef.current || !idCanvasRef.current) return;
    const video = idVideoRef.current;
    const canvas = idCanvasRef.current;
    canvas.width = video.videoWidth || 800;
    canvas.height = video.videoHeight || 500;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedId(dataUrl);
    stopCamera(idCameraStream);
    setIdCameraActive(false);
  };

  const handleIdFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedId(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // -------------------------------------------------------------
  // FINAL SUBMISSION
  // -------------------------------------------------------------
  const handleFinishWizard = async () => {
    const updatedData = {
      photos,
      bio,
      prompts,
      live_selfie_url: capturedSelfie || photos[0],
      govt_id_url: capturedId || null,
      govt_id_status: capturedId ? 'uploaded' : 'none',
      verification_status: 'pending',
      verified: false,
    };

    dispatch({
      type: 'UPDATE_PROFILE',
      payload: updatedData,
    });

    if (user?.id) {
      await updateUserProfile(user.id, updatedData);
    }

    if (onComplete) {
      onComplete();
    }
  };

  return (
    <div className="wizard-overlay">
      <div className="wizard-container">
        {/* Step Indicator Topbar */}
        <div className="wizard-topbar">
          <div className="wizard-brand">
            <ShieldCheck size={20} color="#E8604C" />
            <span>Wobble Date Verification</span>
          </div>
          <div className="wizard-steps-pill">
            <span className={currentStep === 1 ? 'active' : ''}>1. Profile</span>
            <span className="dot">•</span>
            <span className={currentStep === 2 ? 'active' : ''}>2. Live Selfie</span>
            <span className="dot">•</span>
            <span className={currentStep === 3 ? 'active' : ''}>3. Govt ID</span>
          </div>
        </div>

        {/* =========================================================
            STEP 1: PHOTOS & PROMPTS
           ========================================================= */}
        {currentStep === 1 && (
          <div className="wizard-step-content">
            <h2 className="step-heading">Curate Your Profile</h2>
            <p className="step-subheading">
              Add at least 4 photos and 3 prompts to show your authentic chemistry.
            </p>

            {/* Photo Grid */}
            <div className="wizard-photos-grid">
              {photos.map((url, idx) => (
                <div key={idx} className="wizard-photo-slot">
                  <img src={url} alt={`Profile ${idx + 1}`} />
                  <span className="photo-num-badge">#{idx + 1}</span>
                </div>
              ))}
            </div>

            {/* Bio Input */}
            <div className="wizard-input-group">
              <label className="wizard-label">About You</label>
              <textarea 
                value={bio} 
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share a quick glimpse of what excites you..."
                rows={3}
                className="wizard-textarea"
              />
            </div>

            {/* Prompts Preview */}
            <div className="wizard-prompts-preview">
              <label className="wizard-label">Your 3 Prompts</label>
              {prompts.map((p, idx) => (
                <div key={idx} className="prompt-preview-box">
                  <div className="prompt-q-badge">{p.question}</div>
                  <div className="prompt-a-text">{p.answer}</div>
                </div>
              ))}
            </div>

            <button className="btn-wizard-next" onClick={() => setCurrentStep(2)}>
              <span>Continue to Live Selfie</span>
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* =========================================================
            STEP 2: LIVE SELFIE LIVENESS (Hinge-Style)
           ========================================================= */}
        {currentStep === 2 && (
          <div className="wizard-step-content">
            <div className="step-badge-icon">
              <Camera size={24} color="#E8604C" />
            </div>
            <h2 className="step-heading">Live Selfie Verification</h2>
            <p className="step-subheading">
              Align your face in the oval guide. This ensures all profiles on Wobble Date are 100% genuine and prevents catfishing.
            </p>

            {/* Live Camera Viewfinder or Captured Preview */}
            <div className="camera-viewfinder-box">
              {cameraActive ? (
                <div className="camera-live-frame">
                  <video ref={videoRef} autoPlay playsInline muted className="live-video-feed is-selfie" />
                  {/* Oval Face Guide Overlay */}
                  <div className="face-oval-hud">
                    <div className="oval-border"></div>
                    <div className="scan-laser-line"></div>
                  </div>
                  <div className="hud-guidance-text">Align your face inside the oval</div>
                </div>
              ) : capturedSelfie ? (
                <div className="captured-selfie-frame">
                  <img src={capturedSelfie} alt="Captured Selfie" className="selfie-preview-img" />
                  <div className="selfie-verified-tag">
                    <CheckCircle size={14} />
                    <span>Liveness Captured</span>
                  </div>
                </div>
              ) : (
                <div className="camera-idle-frame" onClick={startSelfieCamera}>
                  <div className="camera-start-circle">
                    <Camera size={36} color="#FFF" />
                  </div>
                  <p>Tap to open front camera</p>
                  <span>Position yourself in good lighting</span>
                </div>
              )}
            </div>

            {/* Hidden Canvas for Frame Grab */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* Camera Controls */}
            {cameraActive ? (
              <div className="camera-action-controls">
                <button className="btn-snap-photo" onClick={captureSelfieSnapshot}>
                  <div className="snap-inner-ring"></div>
                </button>
              </div>
            ) : capturedSelfie ? (
              <div className="captured-action-buttons">
                <button className="btn-retake-photo" onClick={startSelfieCamera}>
                  <RefreshCw size={15} />
                  <span>Retake Selfie</span>
                </button>
                <button className="btn-confirm-selfie" onClick={() => setCurrentStep(3)}>
                  <span>Confirm & Continue</span>
                  <ChevronRight size={17} />
                </button>
              </div>
            ) : (
              <div className="fallback-upload-row">
                <label className="btn-file-fallback">
                  <Upload size={15} />
                  <span>Upload from Gallery</span>
                  <input type="file" accept="image/*" onChange={handleSelfieFileUpload} style={{ display: 'none' }} />
                </label>
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            STEP 3: GOVT ID VERIFICATION (Rectangular Box Guide)
           ========================================================= */}
        {currentStep === 3 && (
          <div className="wizard-step-content">
            <div className="step-badge-icon badge-gold">
              <Sparkles size={24} color="#FFD700" />
            </div>
            <h2 className="step-heading">Official Verified Badge</h2>
            <p className="step-subheading">
              Upload or snap a picture of your Government ID (Aadhaar, Driving License, or Passport). 
              Keep your ID centered in the <strong>rectangular guide box</strong>.
            </p>

            {/* ID Viewfinder with Rectangular HUD */}
            <div className="id-viewfinder-box">
              {idCameraActive ? (
                <div className="id-camera-live-frame">
                  <video ref={idVideoRef} autoPlay playsInline muted className="live-video-feed" />
                  {/* Rectangular ID Bounding Box Guide */}
                  <div className="id-card-hud-rect">
                    <div className="corner-bracket top-left"></div>
                    <div className="corner-bracket top-right"></div>
                    <div className="corner-bracket bottom-left"></div>
                    <div className="corner-bracket bottom-right"></div>
                    <div className="id-rect-guide-text">Fit ID Card Inside This Frame</div>
                  </div>
                </div>
              ) : capturedId ? (
                <div className="captured-id-frame">
                  <img src={capturedId} alt="Captured ID" className="id-preview-img" />
                  <div className="id-attached-tag">
                    <FileText size={14} />
                    <span>ID Document Attached</span>
                  </div>
                </div>
              ) : (
                <div className="id-idle-frame" onClick={startIdCamera}>
                  {/* Rectangular Target Indicator */}
                  <div className="id-rect-idle-placeholder">
                    <Scan size={38} color="#FFD700" />
                    <p>Tap to scan ID Card</p>
                    <span>Aadhaar Card • Driving License • Passport</span>
                  </div>
                </div>
              )}
            </div>

            {/* Hidden Canvas for Frame Grab */}
            <canvas ref={idCanvasRef} style={{ display: 'none' }} />

            {/* ID Camera Controls */}
            {idCameraActive ? (
              <div className="camera-action-controls">
                <button className="btn-snap-photo gold-snap" onClick={captureIdSnapshot}>
                  <div className="snap-inner-ring"></div>
                </button>
              </div>
            ) : capturedId ? (
              <div className="captured-action-buttons">
                <button className="btn-retake-photo" onClick={startIdCamera}>
                  <RefreshCw size={15} />
                  <span>Rescan ID</span>
                </button>
                <button className="btn-submit-verification" onClick={handleFinishWizard}>
                  <ShieldCheck size={18} />
                  <span>Submit for Concierge Verification</span>
                </button>
              </div>
            ) : (
              <div className="id-action-options">
                <label className="btn-id-file-upload">
                  <Upload size={16} />
                  <span>Upload ID Photo File</span>
                  <input type="file" accept="image/*" onChange={handleIdFileUpload} style={{ display: 'none' }} />
                </label>
                <button className="btn-skip-id" onClick={handleFinishWizard}>
                  <span>Skip ID (Submit Standard Profile)</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
