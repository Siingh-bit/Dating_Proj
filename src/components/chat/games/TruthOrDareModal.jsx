import React, { useState } from 'react';
import { X, RefreshCw, Send, Sparkles } from 'lucide-react';
import './TruthOrDareModal.css';

const prompts = {
  Romantic: {
    truth: ["What was your first impression of me?", "What is your idea of a perfect date?", "What's a small thing that makes you feel loved?"],
    dare: ["Send me a voice note saying something sweet.", "Change my contact name to something romantic.", "Describe me in 3 words."]
  },
  Deep: {
    truth: ["What's a secret you've never told anyone?", "What's your biggest fear in a relationship?", "What does vulnerability mean to you?"],
    dare: ["Share an embarrassing childhood story.", "Send a photo of something meaningful to you.", "Admit something you've been hiding."]
  },
  Spicy: {
    truth: ["What's your biggest turn-on?", "Have you ever had a crush on a friend's partner?", "What's the wildest place you've ever hooked up?"],
    dare: ["Send me a cheeky selfie.", "Tell me a naughty fantasy.", "Text me something you want me to do to you."]
  },
  Funny: {
    truth: ["What's your most embarrassing moment?", "What's a weird habit you have?", "Have you ever faked being sick to get out of a date?"],
    dare: ["Send a selfie making the ugliest face possible.", "Record yourself singing the chorus of a pop song.", "Text your best friend a ridiculous lie right now."]
  }
};

export default function TruthOrDareModal({ onClose, onSendToChat }) {
  const [category, setCategory] = useState('Romantic');
  const [mode, setMode] = useState('truth');
  const [currentPrompt, setCurrentPrompt] = useState(prompts['Romantic']['truth'][0]);
  const [isFlipping, setIsFlipping] = useState(false);

  const handleShuffle = () => {
    setIsFlipping(true);
    setTimeout(() => {
      const available = prompts[category][mode];
      const random = available[Math.floor(Math.random() * available.length)];
      setCurrentPrompt(random);
      setIsFlipping(false);
    }, 300);
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    const available = prompts[category][newMode];
    setCurrentPrompt(available[0]);
  };

  const handleSend = () => {
    onSendToChat({ type: 'truth_or_dare', text: currentPrompt, mode });
    onClose();
  };

  return (
    <div className="tod-overlay">
      <div className="tod-modal">
        <header className="tod-header">
          <h2>Truth or Dare</h2>
          <button className="close-btn" onClick={onClose}><X size={24} /></button>
        </header>

        <div className="tod-categories">
          {Object.keys(prompts).map(cat => (
            <button 
              key={cat} 
              className={`cat-btn ${category === cat ? 'active' : ''}`}
              onClick={() => { setCategory(cat); setMode('truth'); setCurrentPrompt(prompts[cat]['truth'][0]); }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="tod-mode-toggle">
          <button className={`mode-btn ${mode === 'truth' ? 'active' : ''}`} onClick={() => handleModeChange('truth')}>Truth</button>
          <button className={`mode-btn ${mode === 'dare' ? 'active' : ''}`} onClick={() => handleModeChange('dare')}>Dare</button>
        </div>

        <div className={`tod-card ${isFlipping ? 'flipping' : ''} mode-${mode}`}>
          <Sparkles className="card-icon" size={32} />
          <p className="card-text">{currentPrompt}</p>
        </div>

        <div className="tod-actions">
          <button className="shuffle-btn" onClick={handleShuffle}>
            <RefreshCw size={20} /> Shuffle Next
          </button>
          <button className="send-btn" onClick={handleSend}>
            <Send size={20} /> Send to Chat
          </button>
        </div>
      </div>
    </div>
  );
}
