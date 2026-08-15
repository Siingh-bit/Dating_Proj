import React, { useState } from 'react';
import { X, Eye, Image as ImageIcon, Send, Sparkles } from 'lucide-react';
import './PhotoShareModal.css';

const SAMPLE_PHOTOS = [
  { id: '1', title: 'Coffee & Books', url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80' },
  { id: '2', title: 'Sunset View', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80' },
  { id: '3', title: 'Art Gallery', url: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=800&q=80' },
  { id: '4', title: 'Cute Dog', url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80' },
  { id: '5', title: 'Night Cityscape', url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80' },
];

export default function PhotoShareModal({ onSendMedia, onClose }) {
  const [selectedPhoto, setSelectedPhoto] = useState(SAMPLE_PHOTOS[0].url);
  const [customUrl, setCustomUrl] = useState('');
  const [viewMode, setViewMode] = useState('view_once'); // 'view_once' | 'permanent'
  const [caption, setCaption] = useState('');

  const activeUrl = customUrl.trim() ? customUrl.trim() : selectedPhoto;

  const handleSend = () => {
    if (activeUrl) {
      onSendMedia({
        photoUrl: activeUrl,
        mode: viewMode,
        caption: caption.trim() || null,
      });
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content photo-share-modal animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Share Photo</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Selected Photo Preview */}
        <div className="photo-preview-container">
          <img src={activeUrl} alt="Preview" className="photo-preview" />
          <div className="view-mode-badge-preview">
            {viewMode === 'view_once' ? (
              <span className="badge-item view-once"><Eye size={14} /> View Once</span>
            ) : (
              <span className="badge-item permanent"><ImageIcon size={14} /> Permanent</span>
            )}
          </div>
        </div>

        {/* View Permissions Selector */}
        <div className="view-permissions-section">
          <label className="section-label">View Permissions</label>
          <div className="permissions-toggle-group">
            <button
              className={`perm-option-btn ${viewMode === 'view_once' ? 'is-selected' : ''}`}
              onClick={() => setViewMode('view_once')}
            >
              <Eye size={18} className="perm-icon" />
              <div className="perm-text">
                <span className="perm-title">View Once 👁️</span>
                <span className="perm-desc">Disappears after viewing once</span>
              </div>
            </button>

            <button
              className={`perm-option-btn ${viewMode === 'permanent' ? 'is-selected' : ''}`}
              onClick={() => setViewMode('permanent')}
            >
              <ImageIcon size={18} className="perm-icon" />
              <div className="perm-text">
                <span className="perm-title">Keep in Chat 🖼️</span>
                <span className="perm-desc">Stays permanently in chat</span>
              </div>
            </button>
          </div>
        </div>

        {/* Photo Selection */}
        <div className="photo-selection-section">
          <label className="section-label">Choose a Photo</label>
          <div className="sample-photos-grid">
            {SAMPLE_PHOTOS.map((p) => (
              <div
                key={p.id}
                className={`sample-photo-thumb ${selectedPhoto === p.url && !customUrl ? 'is-active' : ''}`}
                onClick={() => {
                  setSelectedPhoto(p.url);
                  setCustomUrl('');
                }}
              >
                <img src={p.url} alt={p.title} />
              </div>
            ))}
          </div>
          
          <input
            type="text"
            className="custom-url-input"
            placeholder="Or paste an image URL..."
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
          />
        </div>

        {/* Optional Caption */}
        <div className="caption-section">
          <input
            type="text"
            className="caption-input"
            placeholder="Add a caption... (optional)"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
        </div>

        {/* Action Button */}
        <div className="modal-footer">
          <button className="btn-primary btn-send-photo" onClick={handleSend}>
            <Send size={16} /> Send Photo
          </button>
        </div>
      </div>
    </div>
  );
}
