import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormField } from './FormField';

describe('FormField', () => {
  it('renders label and children', () => {
    render(
      <FormField label="Email" htmlFor="email">
        <input id="email" />
      </FormField>
    );
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('shows required asterisk when required', () => {
    const { container } = render(
      <FormField label="Email" htmlFor="email" required>
        <input id="email" />
      </FormField>
    );
    expect(container.querySelector('.form-field-required')).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('does not show required asterisk by default', () => {
    const { container } = render(
      <FormField label="Email" htmlFor="email">
        <input id="email" />
      </FormField>
    );
    expect(container.querySelector('.form-field-required')).not.toBeInTheDocument();
  });

  it('shows helper text when provided', () => {
    render(
      <FormField label="Email" htmlFor="email" helper="Enter your email">
        <input id="email" />
      </FormField>
    );
    expect(screen.getByText('Enter your email')).toBeInTheDocument();
  });

  it('shows error message when provided', () => {
    render(
      <FormField label="Email" htmlFor="email" error="Invalid email">
        <input id="email" />
      </FormField>
    );
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
  });

  it('hides helper text when error is present', () => {
    render(
      <FormField label="Email" htmlFor="email" helper="Enter your email" error="Invalid email">
        <input id="email" />
      </FormField>
    );
    expect(screen.queryByText('Enter your email')).not.toBeInTheDocument();
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
  });

  it('links label to input via htmlFor', () => {
    render(
      <FormField label="Email" htmlFor="email-input">
        <input id="email-input" />
      </FormField>
    );
    const label = screen.getByText('Email');
    expect(label).toHaveAttribute('for', 'email-input');
  });
});
