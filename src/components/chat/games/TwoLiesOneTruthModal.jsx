import React, { useState } from 'react';
import { X, Send, Sparkles, HelpCircle } from 'lucide-react';
import './TwoLiesOneTruthModal.css';

const PRESETS = [
  {
    s1: "I have traveled to over 15 countries",
    s2: "I used to be a competitive dancer",
    s3: "I once got stuck in an elevator for 4 hours",
    truth: 1
  },
  {
    s1: "I can speak 4 languages fluently",
    s2: "I've met a famous Hollywood celebrity in an airport",
    s3: "I never learned how to ride a bicycle",
    truth: 0
  },
  {
    s1: "I can cook a 5-course Italian meal from scratch",
    s2: "I ran a half marathon without training",
    s3: "I have never seen a single episode of Game of Thrones",
    truth: 2
  }
];

export default function TwoLiesOneTruthModal({ onClose, onSendToChat }) {
  const [activeTab, setActiveTab] = useState('preset'); // 'preset' | 'custom'
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  
  // Custom mode state
  const [statement1, setStatement1] = useState('');
  const [statement2, setStatement2] = useState('');
  const [statement3, setStatement3] = useState('');
  const [customTruthIndex, setCustomTruthIndex] = useState(0);

  const currentPreset = PRESETS[selectedPresetIndex];

  const handleSendPreset = () => {
    onSendToChat({
      type: 'two_lies_one_truth',
      statements: [currentPreset.s1, currentPreset.s2, currentPreset.s3],
      truthIndex: currentPreset.truth,
      summaryText: `🕵️ 2 Lies & 1 Truth: Guess which statement about me is real!`
    });
  };

  const handleSendCustom = () => {
    if (!statement1 || !statement2 || !statement3) return;
    onSendToChat({
      type: 'two_lies_one_truth',
      statements: [statement1, statement2, statement3],
      truthIndex: customTruthIndex,
      summaryText: `🕵️ 2 Lies & 1 Truth: Guess which statement about me is real!`
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content bottom-sheet tlt-modal animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="sheet-header">
          <div className="game-title-badge">
            <span>🕵️</span> 2 Lies & A Truth
          </div>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="tlt-tab-bar">
          <button 
            className={`tlt-tab ${activeTab === 'preset' ? 'active' : ''}`}
            onClick={() => setActiveTab('preset')}
          >
            Quick Packs
          </button>
          <button 
            className={`tlt-tab ${activeTab === 'custom' ? 'active' : ''}`}
            onClick={() => setActiveTab('custom')}
          >
            Create Your Own
          </button>
        </div>

        {activeTab === 'preset' ? (
          <div className="tlt-body">
            <div className="preset-selector">
              {PRESETS.map((_, i) => (
                <button 
                  key={i} 
                  className={`preset-chip ${selectedPresetIndex === i ? 'selected' : ''}`}
                  onClick={() => setSelectedPresetIndex(i)}
                >
                  Pack #{i + 1}
                </button>
              ))}
            </div>

            <div className="preset-card">
              <span className="card-hint"><HelpCircle size={14} /> One of these is TRUE, two are LIES!</span>
              <div className="statement-item">1. {currentPreset.s1}</div>
              <div className="statement-item">2. {currentPreset.s2}</div>
              <div className="statement-item">3. {currentPreset.s3}</div>
            </div>

            <button className="btn-send-game" onClick={handleSendPreset}>
              <Send size={18} /> Send Challenge to Chat
            </button>
          </div>
        ) : (
          <div className="tlt-body">
            <p className="custom-instructions">Enter 3 statements about yourself, then mark which one is the actual TRUTH:</p>

            <div className="custom-inputs">
              {[statement1, statement2, statement3].map((val, idx) => {
                const setters = [setStatement1, setStatement2, setStatement3];
                return (
                  <div key={idx} className="custom-input-row">
                    <input 
                      type="text" 
                      placeholder={`Statement ${idx + 1}...`}
                      value={val}
                      onChange={e => setters[idx](e.target.value)}
                      className="tlt-input"
                    />
                    <button 
                      className={`truth-toggle ${customTruthIndex === idx ? 'is-truth' : ''}`}
                      onClick={() => setCustomTruthIndex(idx)}
                      type="button"
                    >
                      {customTruthIndex === idx ? 'TRUTH ✓' : 'Mark Truth'}
                    </button>
                  </div>
                );
              })}
            </div>

            <button 
              className="btn-send-game" 
              onClick={handleSendCustom}
              disabled={!statement1.trim() || !statement2.trim() || !statement3.trim()}
            >
              <Send size={18} /> Send Custom Challenge
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
