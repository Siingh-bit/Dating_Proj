import React from 'react';
import { Heart, Check, X, MessageCircle } from 'lucide-react';
import { useConversations } from '../contexts/ConversationContext';
import { useAuth } from '../contexts/AuthContext';
import './LikesPage.css';

export default function LikesPage() {
  const { user } = useAuth();
  const { incomingLikes, dispatch } = useConversations();

  const handleAccept = (like) => {
    dispatch({ type: 'ACCEPT_LIKE', payload: { likeId: like.id, profile: like.from } });
  };

  const handleReject = (likeId) => {
    dispatch({ type: 'REJECT_LIKE', payload: likeId });
  };

  const targetGender = user?.interestedIn || (user?.gender === 'male' ? 'female' : 'male');
  const filteredLikes = incomingLikes.filter(like => 
    targetGender === 'all' || like.from.gender === targetGender
  );

  if (filteredLikes.length === 0) {
    return (
      <div className="likes-page empty-state">
        <Heart size={64} className="empty-icon-likes" />
        <h2>No likes yet</h2>
        <p>Keep using Solely to discover matches</p>
      </div>
    );
  }

  return (
    <div className="likes-page">
      <div className="likes-header">
        <h1>Likes <span className="likes-count">{filteredLikes.length}</span></h1>
      </div>
      
      <div className="likes-grid">
        {filteredLikes.map(like => {
          const profile = like.from;
          const { type, question, comment } = like.likedItem;
          
          return (
            <div key={like.id} className="like-card animate-scale-in">
              <div className="like-photo-container">
                <img src={profile.photos[0]} alt="" className="like-photo" />
                <div className="like-card-actions">
                  <button className="like-action-btn reject-btn" onClick={(e) => { e.stopPropagation(); handleReject(like.id); }}>
                    <X size={20} />
                  </button>
                  <button className="like-action-btn accept-btn" onClick={(e) => { e.stopPropagation(); handleAccept(like); }}>
                    <Check size={20} />
                  </button>
                </div>
              </div>
              
              <div className="like-info">
                <h3>{profile.name}, {profile.age}</h3>
                <p className="liked-what">
                  {type === 'prompt' ? `Liked your prompt: "${question}"` : 'Liked your photo'}
                </p>
                {comment && (
                  <div className="like-comment">
                    <MessageCircle size={14} className="comment-icon" />
                    <span>"{comment}"</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
