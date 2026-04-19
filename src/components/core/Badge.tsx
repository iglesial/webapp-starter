import React from 'react';
import './Badge.css';

export interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'small' | 'medium';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'small',
  children,
  className = '',
}) => {
  const classes = ['badge', `badge-${variant}`, `badge-${size}`, className]
    .filter(Boolean)
    .join(' ');

  return <span className={classes}>{children}</span>;
};
