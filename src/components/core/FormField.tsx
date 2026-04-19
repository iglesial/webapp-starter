import React from 'react';
import './FormField.css';

export interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  helper?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  htmlFor,
  error,
  required = false,
  helper,
  children,
}) => {
  return (
    <div className="form-field">
      <label htmlFor={htmlFor} className="form-field-label">
        {label}
        {required && <span className="form-field-required">*</span>}
      </label>
      {children}
      {helper && !error && <p className="form-field-helper">{helper}</p>}
      {error && <p className="form-field-error">{error}</p>}
    </div>
  );
};
