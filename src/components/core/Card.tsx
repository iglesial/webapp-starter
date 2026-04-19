import React from 'react';
import './Card.css';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverable = false,
  padding = 'medium',
}) => {
  const classes = ['card', hoverable ? 'card-hoverable' : '', `card-padding-${padding}`, className]
    .filter(Boolean)
    .join(' ');

  return <div className={classes}>{children}</div>;
};
