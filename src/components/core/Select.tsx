import React from 'react';
import './Select.css';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  'children'
> {
  options: SelectOption[];
  error?: string;
  fullWidth?: boolean;
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({
  options,
  error,
  fullWidth = false,
  placeholder,
  className = '',
  ...props
}) => {
  const classes = [
    'select',
    error ? 'select-error' : '',
    fullWidth ? 'select-full-width' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="select-wrapper">
      <select className={classes} {...props}>
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="select-error-message">{error}</span>}
    </div>
  );
};
