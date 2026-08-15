import React, { useState } from 'react';
import { X, Flame, Scale, UserCheck, Heart, Puzzle, Trophy, HelpCircle, PenTool, Sparkles, Music, Brain, Zap, BookHeart, Dice5 } from 'lucide-react';
import './GameLoungeModal.css';

const games = [
  { id: 'truth_or_dare', title: 'Truth or Dare (Couple Edition)', icon: Flame, category: 'Party & Fun', tag: 'Hot' },
  { id: 'would_you_rather', title: 'Would You Rather?', icon: Scale, category: 'Icebreakers', tag: 'Popular' },
  { id: 'two_lies_one_truth', title: '2 Lies & A Truth', icon: UserCheck, category: 'Icebreakers' },
  { id: 'compatibility_quiz', title: 'Compatibility Quiz', icon: Heart, category: 'Deep Connection' },
  { id: 'emoji_decoder', title: 'Emoji Decoder', icon: Puzzle, category: 'Party & Fun' },
  { id: 'couple_trivia', title: 'Couple Trivia', icon: Trophy, category: 'Deep Connection' },
  { id: 'twenty_questions', title: '20 Questions', icon: HelpCircle, category: 'Icebreakers' },
  { id: 'doodle_draw', title: 'Doodle & Draw', icon: PenTool, category: 'Party & Fun' },
  { id: 'love_fortune', title: 'Love Fortune Teller', icon: Sparkles, category: 'Party & Fun' },
  { id: 'finish_lyric', title: 'Finish The Lyric', icon: Music, category: 'Party & Fun' },
  { id: 'hot_takes', title: 'Hot Takes 🔥', icon: Flame, category: 'Deep Connection', tag: 'New' },
  { id: 'mind_meld', title: 'Mind Meld 💭', icon: Brain, category: 'Deep Connection', tag: 'Addictive' },
  { id: 'this_or_that_blitz', title: 'This or That Blitz ⚡', icon: Zap, category: 'Party & Fun', tag: 'Speed' },
  { id: 'our_story', title: 'Our Love Story 📖', icon: BookHeart, category: 'Deep Connection', tag: 'New' },
  { id: 'date_night_roulette', title: 'Date Night Roulette 🎰', icon: Dice5, category: 'Party & Fun', tag: 'New' },
];

const categories = ['All', 'Icebreakers', 'Deep Connection', 'Party & Fun'];

export default function GameLoungeModal({ onClose, onSelectGame }) {
  const [activeTab, setActiveTab] = useState('All');

  const filteredGames = activeTab === 'All' ? games : games.filter(g => g.category === activeTab);

  return (
    <div className="game-lounge-overlay">
      <div className="game-lounge-modal">
        <header className="lounge-header">
          <h2>Game Lounge</h2>
          <button className="close-btn" onClick={onClose}><X size={24} /></button>
        </header>
        
        <div className="lounge-tabs">
          {categories.map(cat => (
            <button 
              key={cat} 
              className={`tab-btn ${activeTab === cat ? 'active' : ''}`}
              onClick={() => setActiveTab(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="games-grid">
          {filteredGames.map(game => (
            <div key={game.id} className="game-card" onClick={() => onSelectGame(game.id)}>
              <div className="game-icon-wrapper">
                <game.icon className="game-icon" size={28} />
              </div>
              <div className="game-info">
                <h3>{game.title}</h3>
                <span className="game-category">{game.category}</span>
              </div>
              {game.tag && <span className="game-badge">{game.tag}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
