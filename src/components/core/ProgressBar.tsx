import React from 'react';
import './ProgressBar.css';

export interface ProgressBarProps {
  value: number; // 0-100
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'success' | 'warning' | 'danger';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  showLabel = false,
  size = 'medium',
  variant = 'primary',
}) => {
  const clampedValue = Math.min(Math.max(value, 0), 100);

  return (
    <div className={`progress-bar progress-bar-${size}`}>
      <div
        className={`progress-bar-fill progress-bar-${variant}`}
        style={{ width: `${clampedValue}%` }}
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {showLabel && <span className="progress-bar-label">{clampedValue}%</span>}
      </div>
    </div>
  );
};
