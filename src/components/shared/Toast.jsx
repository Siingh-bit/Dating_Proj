import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';
import './Toast.css';

const Toast = ({ message, variant = 'info', isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const icons = {
    success: <CheckCircle size={20} className="toast-icon" />,
    error: <AlertCircle size={20} className="toast-icon" />,
    info: <Info size={20} className="toast-icon" />
  };

  return (
    <div className={`toast-container ${isVisible ? 'visible' : ''}`}>
      <div className={`toast toast-${variant}`}>
        {icons[variant]}
        <span className="toast-message">{message}</span>
      </div>
    </div>
  );
};

export default Toast;
