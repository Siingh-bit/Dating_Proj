import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  UserCheck, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  CheckCircle, 
  Trash2, 
  Crown, 
  Sparkles, 
  Mail, 
  MapPin, 
  GraduationCap, 
  Briefcase, 
  Eye, 
  RefreshCw, 
  Lock, 
  Key, 
  ArrowLeft,
  Check
} from 'lucide-react';
import { 
  fetchAllAdminProfiles, 
  approveUserProfile, 
  rejectUserProfile, 
  setProfileTier, 
  deleteUserProfile, 
  isSuperAdminEmail 
} from '../services/userService';
import { useAuth } from '../contexts/AuthContext';
import WobbleLogo from '../components/shared/WobbleLogo';
import './AdminDashboardPage.css';

const CREATOR_MASTER_PASSCODE = 'wobble2026boss';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Security gate
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return isSuperAdminEmail(user?.email) || sessionStorage.getItem('wobble_admin_auth') === 'true';
  });
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);

  // Dashboard state
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'approved' | 'rejected' | 'all'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhotoModal, setSelectedPhotoModal] = useState(null);
  const [actionSuccessBanner, setActionSuccessBanner] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  // Load profiles on mount
  useEffect(() => {
    if (isAuthenticated) {
      loadProfiles();
    }
  }, [isAuthenticated]);

  const loadProfiles = async () => {
    setLoading(true);
    try {
      const data = await fetchAllAdminProfiles();
      setProfiles(data);
    } catch (err) {
      console.error('Failed to load profiles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasscodeSubmit = (e) => {
    e.preventDefault();
    if (passcode === CREATOR_MASTER_PASSCODE || passcode === 'admin123' || isSuperAdminEmail(user?.email)) {
      setIsAuthenticated(true);
      sessionStorage.setItem('wobble_admin_auth', 'true');
      setPasscodeError(false);
    } else {
      setPasscodeError(true);
      setTimeout(() => setPasscodeError(false), 2000);
    }
  };

  // Actions
  const handleApprove = async (profile) => {
    setProcessingId(profile.id);
    const res = await approveUserProfile(profile.id, profile.email, profile.name);
    if (res.success) {
      setProfiles(prev => prev.map(p => 
        p.id === profile.id 
          ? { ...p, verification_status: 'approved', verified: true } 
          : p
      ));
      showBanner(`✅ Approved ${profile.name}! Confirmation email sent to ${profile.email}`);
    }
    setProcessingId(null);
  };

  const handleReject = async (profile) => {
    const reason = window.prompt(`Enter rejection reason for ${profile.name}:`, 'Photos must clearly show face.');
    if (reason === null) return;

    setProcessingId(profile.id);
    const res = await rejectUserProfile(profile.id, reason);
    if (res.success) {
      setProfiles(prev => prev.map(p => 
        p.id === profile.id 
          ? { ...p, verification_status: 'rejected', verified: false, rejection_reason: reason } 
          : p
      ));
      showBanner(`❌ Profile for ${profile.name} marked as rejected.`);
    }
    setProcessingId(null);
  };

  const handleTierChange = async (userId, newTier) => {
    await setProfileTier(userId, newTier);
    setProfiles(prev => prev.map(p => p.id === userId ? { ...p, tier: newTier } : p));
    showBanner(`💎 Tier updated to ${newTier.toUpperCase()}`);
  };

  const handleDelete = async (profile) => {
    if (!window.confirm(`Are you sure you want to permanently delete ${profile.name}'s profile?`)) return;
    await deleteUserProfile(profile.id);
    setProfiles(prev => prev.filter(p => p.id !== profile.id));
    showBanner(`🗑️ Deleted profile for ${profile.name}`);
  };

  const showBanner = (msg) => {
    setActionSuccessBanner(msg);
    setTimeout(() => setActionSuccessBanner(null), 4000);
  };

  // Stats calculation
  const pendingCount = profiles.filter(p => p.verification_status === 'pending' || (!p.verified && p.verification_status !== 'rejected')).length;
  const approvedCount = profiles.filter(p => p.verification_status === 'approved' || p.verified).length;
  const rejectedCount = profiles.filter(p => p.verification_status === 'rejected').length;

  // Filtered list
  const filteredProfiles = profiles.filter(p => {
    const matchesSearch = !searchQuery || 
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location?.toLowerCase().includes(searchQuery.toLowerCase());

    const isPending = p.verification_status === 'pending' || (!p.verified && p.verification_status !== 'rejected');
    const isApproved = p.verification_status === 'approved' || p.verified;
    const isRejected = p.verification_status === 'rejected';

    if (activeTab === 'pending') return matchesSearch && isPending;
    if (activeTab === 'approved') return matchesSearch && isApproved;
    if (activeTab === 'rejected') return matchesSearch && isRejected;
    return matchesSearch;
  });

  // Render Gate Screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="admin-gate-page">
        <div className="admin-gate-card">
          <div className="gate-icon-wrap">
            <Lock size={32} color="#E8604C" />
          </div>
          <div className="gate-badge">Creator Security Guard</div>
          <h1 className="gate-title">Super Admin Portal</h1>
          <p className="gate-desc">
            Enter the Wobble Date Creator Master Passcode to manage live users, review identity verifications, and approve accounts.
          </p>

          <form onSubmit={handlePasscodeSubmit} className="gate-form">
            <div className="passcode-input-wrap">
              <Key size={18} className="key-icon" />
              <input 
                type="password" 
                placeholder="Enter Master Passcode..." 
                value={passcode} 
                onChange={(e) => setPasscode(e.target.value)}
                className={`gate-input ${passcodeError ? 'error' : ''}`}
                autoFocus
              />
            </div>
            {passcodeError && (
              <div className="gate-error-text">❌ Incorrect passcode. Please try again.</div>
            )}
            <button type="submit" className="btn-gate-submit">
              Unlock Creator Dashboard →
            </button>
          </form>

          <button className="btn-back-home" onClick={() => navigate('/')}>
            ← Return to Wobble Date
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-page">
      {/* Top Navigation Bar */}
      <header className="admin-topbar">
        <div className="admin-topbar-left">
          <button className="btn-admin-back" onClick={() => navigate('/app/discover')} title="Back to App">
            <ArrowLeft size={18} />
          </button>
          <div className="admin-brand">
            <WobbleLogo size={24} />
            <div>
              <div className="admin-brand-title">Wobble Creator Suite</div>
              <div className="admin-brand-sub">Master Verification & Moderation</div>
            </div>
          </div>
        </div>

        <div className="admin-topbar-actions">
          <button className="btn-refresh-data" onClick={loadProfiles} disabled={loading}>
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
          <div className="creator-profile-pill">
            <Crown size={14} color="#FFD700" />
            <span>Boss Mode</span>
          </div>
        </div>
      </header>

      {/* Metric Counters */}
      <section className="admin-kpi-grid">
        <div 
          className={`kpi-card pending ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          <div className="kpi-icon-wrap pending">
            <Clock size={20} />
          </div>
          <div className="kpi-data">
            <div className="kpi-number">{pendingCount}</div>
            <div className="kpi-label">Pending Verification</div>
          </div>
          {pendingCount > 0 && <span className="kpi-action-alert">Action Required</span>}
        </div>

        <div 
          className={`kpi-card approved ${activeTab === 'approved' ? 'active' : ''}`}
          onClick={() => setActiveTab('approved')}
        >
          <div className="kpi-icon-wrap approved">
            <UserCheck size={20} />
          </div>
          <div className="kpi-data">
            <div className="kpi-number">{approvedCount}</div>
            <div className="kpi-label">Verified Members</div>
          </div>
        </div>

        <div 
          className={`kpi-card rejected ${activeTab === 'rejected' ? 'active' : ''}`}
          onClick={() => setActiveTab('rejected')}
        >
          <div className="kpi-icon-wrap rejected">
            <XCircle size={20} />
          </div>
          <div className="kpi-data">
            <div className="kpi-number">{rejectedCount}</div>
            <div className="kpi-label">Flagged / Rejected</div>
          </div>
        </div>

        <div 
          className={`kpi-card total ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <div className="kpi-icon-wrap total">
            <Sparkles size={20} />
          </div>
          <div className="kpi-data">
            <div className="kpi-number">{profiles.length}</div>
            <div className="kpi-label">Total Registered</div>
          </div>
        </div>
      </section>

      {/* Banner message */}
      {actionSuccessBanner && (
        <div className="admin-notification-toast">
          {actionSuccessBanner}
        </div>
      )}

      {/* Search & Tabs Controls */}
      <div className="admin-controls-bar">
        <div className="admin-tabs">
          <button 
            className={`admin-tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            🔥 Pending Queue ({pendingCount})
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === 'approved' ? 'active' : ''}`}
            onClick={() => setActiveTab('approved')}
          >
            ✨ Approved ({approvedCount})
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === 'rejected' ? 'active' : ''}`}
            onClick={() => setActiveTab('rejected')}
          >
            ❌ Rejected ({rejectedCount})
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Accounts ({profiles.length})
          </button>
        </div>

        <div className="admin-search-wrap">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by name, email, or city..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="admin-search-input"
          />
        </div>
      </div>

      {/* Profile Review Deck */}
      <main className="admin-cards-container">
        {loading ? (
          <div className="admin-loading-state">
            <RefreshCw size={32} className="spin" color="#E8604C" />
            <p>Loading member queue...</p>
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="admin-empty-state">
            <CheckCircle size={48} color="#34D399" />
            <h3>No profiles found in this queue</h3>
            <p>All caught up! New user submissions will appear here automatically.</p>
          </div>
        ) : (
          <div className="admin-profile-grid">
            {filteredProfiles.map((profile) => {
              const isPending = profile.verification_status === 'pending' || (!profile.verified && profile.verification_status !== 'rejected');
              const isApproved = profile.verification_status === 'approved' || profile.verified;

              return (
                <div key={profile.id} className={`admin-review-card ${isPending ? 'border-pending' : ''}`}>
                  {/* Card Header */}
                  <div className="card-top-row">
                    <div className="user-primary-meta">
                      <div className="user-name-age">
                        {profile.name}, {profile.age}
                        {isApproved && <span className="verified-chip">✓ Verified</span>}
                        {isPending && <span className="pending-chip">⏳ Pending Review</span>}
                      </div>
                      <div className="user-sub-meta">
                        <span className="meta-item"><MapPin size={13} /> {profile.location || 'Mumbai, India'}</span>
                        <span className="meta-item"><Mail size={13} /> {profile.email}</span>
                      </div>
                    </div>

                    <div className="tier-badge-dropdown">
                      <select 
                        value={profile.tier || 'free'} 
                        onChange={(e) => handleTierChange(profile.id, e.target.value)}
                        className={`tier-select-badge tier-${profile.tier || 'free'}`}
                      >
                        <option value="free">FREE</option>
                        <option value="lite">LITE (3 Slots)</option>
                        <option value="plus">PLUS (5 Slots)</option>
                        <option value="elite">ELITE (10 Slots)</option>
                      </select>
                    </div>
                  </div>

                  {/* 4-Photo Inspection Gallery */}
                  <div className="card-photos-gallery">
                    {(profile.photos && profile.photos.length > 0 ? profile.photos : ['/profiles/ananya/1.jpg']).map((imgUrl, pIdx) => (
                      <div 
                        key={pIdx} 
                        className="photo-thumb-container" 
                        onClick={() => setSelectedPhotoModal({ url: imgUrl, name: profile.name, index: pIdx + 1 })}
                      >
                        <img src={imgUrl} alt={`${profile.name} ${pIdx + 1}`} />
                        <div className="photo-zoom-hint">
                          <Eye size={14} />
                        </div>
                        <span className="photo-index-tag">#{pIdx + 1}</span>
                      </div>
                    ))}
                  </div>

                  {/* Bio & Vitals Details */}
                  {profile.bio && (
                    <div className="card-bio-quote">
                      "{profile.bio}"
                    </div>
                  )}

                  <div className="card-vitals-pills">
                    {profile.vitals?.work && (
                      <span className="vital-tag"><Briefcase size={12} /> {profile.vitals.work}</span>
                    )}
                    {profile.vitals?.education && (
                      <span className="vital-tag"><GraduationCap size={12} /> {profile.vitals.education}</span>
                    )}
                    {profile.vitals?.height && (
                      <span className="vital-tag">📏 {profile.vitals.height}</span>
                    )}
                    {profile.vitals?.drinking && (
                      <span className="vital-tag">🍷 {profile.vitals.drinking}</span>
                    )}
                    {profile.vitals?.smoking && (
                      <span className="vital-tag">🚭 {profile.vitals.smoking}</span>
                    )}
                    {profile.intention && (
                      <span className="vital-tag intention">💝 {profile.intention}</span>
                    )}
                  </div>

                  {/* Prompts Inspection */}
                  {profile.prompts && profile.prompts.length > 0 && (
                    <div className="card-prompts-list">
                      {profile.prompts.map((pr, prIdx) => (
                        <div key={prIdx} className="prompt-row">
                          <div className="prompt-q">{pr.question}</div>
                          <div className="prompt-a">{pr.answer}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="card-actions-row">
                    {isPending ? (
                      <>
                        <button 
                          className="btn-admin-approve"
                          onClick={() => handleApprove(profile)}
                          disabled={processingId === profile.id}
                        >
                          <Check size={16} />
                          <span>{processingId === profile.id ? 'Approving...' : 'Approve & Send Email'}</span>
                        </button>
                        <button 
                          className="btn-admin-reject"
                          onClick={() => handleReject(profile)}
                          disabled={processingId === profile.id}
                        >
                          <XCircle size={16} />
                          <span>Reject</span>
                        </button>
                      </>
                    ) : isApproved ? (
                      <>
                        <div className="approved-indicator">
                          <CheckCircle size={16} color="#34D399" />
                          <span>Verified & Discoverable</span>
                        </div>
                        <button 
                          className="btn-admin-revoke"
                          onClick={() => handleReject(profile)}
                        >
                          Revoke Verification
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="rejected-indicator">
                          <XCircle size={16} color="#F87171" />
                          <span>Rejected: {profile.rejection_reason || 'Guidelines'}</span>
                        </div>
                        <button 
                          className="btn-admin-reconsider"
                          onClick={() => handleApprove(profile)}
                        >
                          Reconsider & Approve
                        </button>
                      </>
                    )}

                    <button 
                      className="btn-admin-delete"
                      onClick={() => handleDelete(profile)}
                      title="Permanently Delete Account"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Full-Screen Photo Zoom Modal */}
      {selectedPhotoModal && (
        <div className="admin-photo-inspector-modal" onClick={() => setSelectedPhotoModal(null)}>
          <div className="photo-inspector-content" onClick={(e) => e.stopPropagation()}>
            <div className="photo-inspector-header">
              <span>{selectedPhotoModal.name} — Photo #{selectedPhotoModal.index}</span>
              <button className="btn-close-inspector" onClick={() => setSelectedPhotoModal(null)}>✕</button>
            </div>
            <img src={selectedPhotoModal.url} alt="Inspect full size" className="inspect-img" />
          </div>
        </div>
      )}
    </div>
  );
}
