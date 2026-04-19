import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';

describe('Input', () => {
  it('renders with default props', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter text')).toHaveAttribute('type', 'text');
  });

  it('renders with different types', () => {
    const types = ['text', 'email', 'password', 'number', 'tel', 'url'] as const;
    types.forEach((type) => {
      render(<Input type={type} placeholder={type} />);
      expect(screen.getByPlaceholderText(type)).toHaveAttribute('type', type);
    });
  });

  it('fires onChange handler', async () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} placeholder="input" />);
    await userEvent.type(screen.getByPlaceholderText('input'), 'hello');
    expect(handleChange).toHaveBeenCalled();
  });

  it('shows error message when error is provided', () => {
    const { container } = render(<Input error="Required field" />);
    expect(screen.getByText('Required field')).toBeInTheDocument();
    expect(container.querySelector('.input-error')).toBeInTheDocument();
  });

  it('does not show error message when no error', () => {
    const { container } = render(<Input placeholder="input" />);
    expect(container.querySelector('.input-error')).not.toBeInTheDocument();
    expect(container.querySelector('.input-error-message')).not.toBeInTheDocument();
  });

  it('applies fullWidth class', () => {
    const { container } = render(<Input fullWidth placeholder="input" />);
    expect(container.querySelector('.input-full-width')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Input className="custom" placeholder="input" />);
    expect(container.querySelector('.input.custom')).toBeInTheDocument();
  });
});
