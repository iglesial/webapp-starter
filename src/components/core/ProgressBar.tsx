import React from 'react';
import './ProgressBar.css';

export interface ProgressBarProps {
  value: number; // 0-100
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'success' | 'warning' | 'danger';
  // Accessible name for the bar. Optional because a page with one bar reads
  // fine without it, but a page with several (one per item in a list)
  // otherwise announces "progress bar, 37%" repeatedly with no subject.
  // Core primitives stay i18n-free: pass an already-translated string.
  label?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  showLabel = false,
  size = 'medium',
  variant = 'primary',
  label,
  className,
}) => {
  const clampedValue = Math.min(Math.max(value, 0), 100);

  // Only a started bar gets the minimum width that keeps a sliver visible.
  // Zero has to stay exactly zero: the whole point is that an empty bar shows
  // an empty groove rather than a coloured stub at the left end.
  const fillClasses = [
    'progress-bar-fill',
    `progress-bar-${variant}`,
    clampedValue > 0 ? 'progress-bar-fill-started' : null,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={['progress-bar', `progress-bar-${size}`, className].filter(Boolean).join(' ')}>
      <div
        className={fillClasses}
        style={{ width: `${clampedValue}%` }}
        role="progressbar"
        // On the element carrying role="progressbar", not the wrapper —
        // labelling the wrapper names nothing.
        aria-label={label}
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {showLabel && <span className="progress-bar-label">{clampedValue}%</span>}
      </div>
    </div>
  );
};
