import React, { useState } from 'react';
import { X, Flame, Scale, UserCheck, Heart, Puzzle, Trophy, HelpCircle, PenTool, Sparkles, Music, Brain, Zap, BookHeart, Dice5, HeartPulse, Grip, Grid3X3, Type, Target, Blocks, Bomb, ListOrdered, Crosshair, Feather, Eye, Coins } from 'lucide-react';
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
  { id: 'hot_takes', title: 'Hot Takes', icon: Flame, category: 'Deep Connection', tag: 'New' },
  { id: 'mind_meld', title: 'Mind Meld', icon: Brain, category: 'Deep Connection', tag: 'Addictive' },
  { id: 'this_or_that_blitz', title: 'This or That Blitz', icon: Zap, category: 'Party & Fun', tag: 'Speed' },
  { id: 'our_story', title: 'Our Love Story', icon: BookHeart, category: 'Deep Connection', tag: 'New' },
  { id: 'date_night_roulette', title: 'Date Night Roulette', icon: Dice5, category: 'Party & Fun', tag: 'New' },

  /* --- Skill-based games: these are played, not answered --- */
  { id: 'heartbeat_sync', title: 'Heartbeat Sync', icon: HeartPulse, category: 'Arcade', tag: 'Rhythm' },
  { id: 'tug_of_love', title: 'Tug of Love', icon: Grip, category: 'Arcade', tag: 'Duel' },
  { id: 'memory_lane', title: 'Memory Lane', icon: Grid3X3, category: 'Arcade', tag: 'Memory' },
  { id: 'love_scramble', title: 'Love Scramble', icon: Type, category: 'Arcade', tag: 'Word' },
  { id: 'stack_of_us', title: 'Stack of Us', icon: Blocks, category: 'Arcade', tag: 'Skill' },
  { id: 'read_my_mind', title: 'Read My Mind', icon: Target, category: 'Deep Connection', tag: '2 Player' },
  { id: 'hot_potato', title: 'Hot Potato', icon: Bomb, category: 'Party & Fun', tag: 'Chaos' },
  { id: 'love_sequence', title: 'Love Sequence', icon: ListOrdered, category: 'Arcade', tag: 'Recall' },
  { id: 'cupids_arrow', title: "Cupid's Arrow", icon: Crosshair, category: 'Arcade', tag: 'Aim' },
  { id: 'odd_one_out', title: 'Odd One Out', icon: Eye, category: 'Arcade', tag: 'Eyes' },
  { id: 'two_line_tango', title: 'Two-Line Tango', icon: Feather, category: 'Deep Connection', tag: 'Creative' },
  { id: 'love_bets', title: 'Love Bets', icon: Coins, category: 'Party & Fun', tag: 'Wager' },
];

const categories = ['All', 'Arcade', 'Icebreakers', 'Deep Connection', 'Party & Fun'];

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
