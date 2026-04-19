import React from 'react';
import './Alert.css';

export interface AlertProps {
  type?: 'success' | 'danger' | 'warning' | 'info';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({ type = 'info', title, children, onClose }) => {
  return (
    <div className={`alert alert-${type}`} role="alert">
      <div className="alert-content">
        {title && <div className="alert-title">{title}</div>}
        <div className="alert-message">{children}</div>
      </div>
      {onClose && (
        <button className="alert-close" onClick={onClose} aria-label="Close">
          ×
        </button>
      )}
    </div>
  );
};
