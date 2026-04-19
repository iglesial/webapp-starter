import React from 'react';
import './Spinner.css';

export interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'white';
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'medium', color = 'primary' }) => {
  return (
    <div className={`spinner spinner-${size} spinner-${color}`} role="status">
      <span className="spinner-sr-only">Loading...</span>
    </div>
  );
};
