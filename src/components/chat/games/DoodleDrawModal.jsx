import React, { useRef, useState, useEffect } from 'react';
import { X, Undo, Trash2, Send } from 'lucide-react';
import './DoodleDrawModal.css';

const PRESETS = [
  "Draw a penguin on a date",
  "Our dream house",
  "A cozy coffee cup",
  "A funny self portrait"
];

const COLORS = [
  '#E8604C', // Coral red
  '#F4D03F', // Gold yellow
  '#8E44AD', // Deep purple
  '#3498DB', // Cyan blue
  '#FFFFFF', // White
  '#000000', // Black
  '#2ECC71'  // Mint green
];

const BRUSH_SIZES = {
  Small: 2,
  Medium: 5,
  Large: 10
};

export default function DoodleDrawModal({ onClose, onSendToChat }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState(COLORS[0]);
  const [brushSize, setBrushSize] = useState(BRUSH_SIZES.Medium);
  const [prompt, setPrompt] = useState(PRESETS[0]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1A1626'; // Match card background to look cohesive
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState();
  }, []);

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setHistory(prev => [...prev, canvas.toDataURL()]);
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const endDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveState();
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1A1626';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState();
  };

  const undo = () => {
    if (history.length <= 1) return;
    const newHistory = [...history];
    newHistory.pop();
    const previousState = newHistory[newHistory.length - 1];
    setHistory(newHistory);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = previousState;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  };

  const handleSend = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSendToChat({ type: 'doodle_draw', dataUrl, prompt, summaryText: `🎨 Drew: ${prompt}` });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content doodle-modal animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Doodle Draw</h3>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        
        <div className="doodle-body">
          <div className="prompt-selector">
            <select value={prompt} onChange={(e) => setPrompt(e.target.value)} className="doodle-select">
              {PRESETS.map((p, idx) => (
                <option key={idx} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="canvas-container">
            <canvas
              ref={canvasRef}
              width={300}
              height={260}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={endDrawing}
              onMouseOut={endDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={endDrawing}
              className="doodle-canvas"
            />
          </div>

          <div className="doodle-controls">
            <div className="doodle-colors">
              {COLORS.map((c) => (
                <button
                  key={c}
                  className={`color-btn ${color === c ? 'active' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>

            <div className="doodle-tools">
              <div className="brush-sizes">
                {Object.entries(BRUSH_SIZES).map(([label, size]) => (
                  <button
                    key={label}
                    className={`brush-btn ${brushSize === size ? 'active' : ''}`}
                    onClick={() => setBrushSize(size)}
                  >
                    <div className="brush-dot" style={{ width: size, height: size }} />
                  </button>
                ))}
              </div>
              <div className="action-buttons">
                <button className="tool-btn" onClick={undo} disabled={history.length <= 1} title="Undo">
                  <Undo size={18} />
                </button>
                <button className="tool-btn" onClick={clearCanvas} title="Clear Canvas">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-primary full-width" onClick={handleSend}>
            <Send size={18} /> Send Drawing to Chat
          </button>
        </div>
      </div>
    </div>
  );
}
