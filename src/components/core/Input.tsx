import React from 'react';
import './Input.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date';
  error?: string;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  type = 'text',
  error,
  fullWidth = false,
  className = '',
  ...props
}) => {
  const classes = [
    'input',
    error ? 'input-error' : '',
    fullWidth ? 'input-full-width' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="input-wrapper">
      <input type={type} className={classes} {...props} />
      {error && <span className="input-error-message">{error}</span>}
    </div>
  );
};
