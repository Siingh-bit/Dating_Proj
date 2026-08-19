import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Check, ShieldCheck, Clock, X, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserProfile } from '../../services/userService';
import './VerificationPanel.css';

/**
 * Two-part verification, shown on the profile.
 *
 *  1. Live selfie — REQUIRED. Camera only, never a gallery upload, because the
 *     point is to prove a live human matches the profile photos. Until this is
 *     submitted and approved the account can browse Discover but cannot like,
 *     pass or superlike.
 *  2. Government ID — OPTIONAL. Only needed for the verified badge. Camera or
 *     file upload, since a passport/licence is a document, not a liveness test.
 */
export default function VerificationPanel() {
  const { user, dispatch } = useAuth();

  const [mode, setMode] = useState(null);       // null | 'selfie' | 'id'
  const [stream, setStream] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const selfieDone = Boolean(user?.live_selfie_url);
  const idDone = Boolean(user?.govt_id_url);
  const status = user?.verification_status || 'unverified';
  const isApproved = status === 'approved' || user?.verified;
  const isPending = status === 'pending' && !isApproved;

  // Always release the camera when the panel closes or unmounts.
  const stopCamera = (s) => { if (s) s.getTracks().forEach(t => t.stop()); };
  useEffect(() => () => stopCamera(stream), [stream]);

  const openCamera = async (which) => {
    setError('');
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: which === 'selfie'
          ? { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 720 } }
          : { facingMode: 'environment', width: { ideal: 1280 } },
        audio: false,
      });
      setStream(s);
      setMode(which);
      // the <video> only exists after mode is set, so attach on the next frame
      requestAnimationFrame(() => { if (videoRef.current) videoRef.current.srcObject = s; });
    } catch (err) {
      console.error('[Wobble Date] Camera unavailable:', err);
      setError(
        which === 'selfie'
          ? 'We need camera access for the live selfie. Please allow it in your browser settings.'
          : 'Camera unavailable. You can upload a photo of your ID instead.'
      );
    }
  };

  const closeCamera = () => {
    stopCamera(stream);
    setStream(null);
    setMode(null);
  };

  const persist = async (patch) => {
    setSaving(true);
    dispatch({ type: 'UPDATE_PROFILE', payload: patch });
    try {
      if (user?.id) await updateUserProfile(user.id, patch);
    } catch (err) {
      console.error('[Wobble Date] Could not sync verification:', err);
    } finally {
      setSaving(false);
    }
  };

  const capture = async () => {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c) return;
    c.width = v.videoWidth || 640;
    c.height = v.videoHeight || 640;
    c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);
    const dataUrl = c.toDataURL('image/jpeg', 0.9);
    const which = mode;
    closeCamera();

    if (which === 'selfie') {
      // Submitting the selfie is what moves the account into the review queue.
      await persist({
        live_selfie_url: dataUrl,
        verification_status: 'pending',
      });
    } else {
      await persist({ govt_id_url: dataUrl, govt_id_status: 'uploaded' });
    }
  };

  const handleIdUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = (ev) => persist({ govt_id_url: ev.target.result, govt_id_status: 'uploaded' });
    r.readAsDataURL(file);
  };

  return (
    <section className="verify-panel">
      <div className="verify-head">
        <h3 className="verify-title">Verification</h3>
        {isApproved && (
          <span className="verify-status approved"><ShieldCheck size={13} /> Verified</span>
        )}
        {isPending && (
          <span className="verify-status pending"><Clock size={13} /> Pending review</span>
        )}
      </div>

      {error && <p className="verify-error">{error}</p>}

      {/* --- 1. Live selfie: required --- */}
      <div className={`verify-row ${selfieDone ? 'is-done' : ''}`}>
        <div className="verify-row-icon">
          {selfieDone ? <Check size={17} /> : <Camera size={17} />}
        </div>
        <div className="verify-row-body">
          <span className="verify-row-title">
            Live selfie <span className="verify-req">required</span>
          </span>
          <span className="verify-row-desc">
            {isApproved
              ? 'Approved. You have full access.'
              : selfieDone
              ? 'Submitted. We usually review within a few hours.'
              : 'Take a live photo so we know you are you. Needed before you can like or pass.'}
          </span>
        </div>
        {!isApproved && (
          <button className="verify-btn" onClick={() => openCamera('selfie')} disabled={saving}>
            {selfieDone ? <><RefreshCw size={14} /> Retake</> : 'Start'}
          </button>
        )}
      </div>

      {/* --- 2. Government ID: optional, badge only --- */}
      <div className={`verify-row ${idDone ? 'is-done' : ''}`}>
        <div className="verify-row-icon">
          {idDone ? <Check size={17} /> : <ShieldCheck size={17} />}
        </div>
        <div className="verify-row-body">
          <span className="verify-row-title">
            Government ID <span className="verify-opt">optional</span>
          </span>
          <span className="verify-row-desc">
            {idDone
              ? 'Received. Your badge appears once approved.'
              : 'Only needed if you want the verified badge on your profile.'}
          </span>
        </div>
        <div className="verify-row-actions">
          <button className="verify-btn" onClick={() => openCamera('id')} disabled={saving}>
            <Camera size={14} /> Scan
          </button>
          <label className="verify-btn as-label">
            <Upload size={14} /> Upload
            <input type="file" accept="image/*" hidden onChange={handleIdUpload} />
          </label>
        </div>
      </div>

      {/* --- Camera sheet --- */}
      {mode && (
        <div className="verify-cam-overlay" onClick={closeCamera}>
          <div className="verify-cam" onClick={(e) => e.stopPropagation()}>
            <button className="verify-cam-close" onClick={closeCamera} aria-label="Close camera">
              <X size={20} />
            </button>
            <h4 className="verify-cam-title">
              {mode === 'selfie' ? 'Center your face in the oval' : 'Fit your ID inside the frame'}
            </h4>
            <div className={`verify-cam-stage ${mode}`}>
              <video ref={videoRef} autoPlay playsInline muted className="verify-cam-video" />
              <div className={`verify-cam-guide ${mode}`} />
            </div>
            <canvas ref={canvasRef} hidden />
            <button className="verify-cam-shutter" onClick={capture}>
              <Camera size={18} /> Capture
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
