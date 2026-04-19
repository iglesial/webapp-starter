import React from 'react';
import './Textarea.css';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  fullWidth?: boolean;
}

export const Textarea: React.FC<TextareaProps> = ({
  error,
  fullWidth = false,
  className = '',
  ...props
}) => {
  const classes = [
    'textarea',
    error ? 'textarea-error' : '',
    fullWidth ? 'textarea-full-width' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="textarea-wrapper">
      <textarea className={classes} {...props} />
      {error && <span className="textarea-error-message">{error}</span>}
    </div>
  );
};
