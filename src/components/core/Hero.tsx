import React from 'react';
import './Hero.css';

export interface HeroProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const Hero: React.FC<HeroProps> = ({
  title,
  subtitle,
  children,
  size = 'large',
  className = '',
}) => {
  const classes = ['hero', `hero-${size}`, className].filter(Boolean).join(' ');

  return (
    <section className={classes}>
      <div className="hero-content">
        <h1 className="hero-title">{title}</h1>
        {subtitle && <p className="hero-subtitle">{subtitle}</p>}
        {children && <div className="hero-actions">{children}</div>}
      </div>
    </section>
  );
};
