import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Textarea } from './Textarea';

describe('Textarea', () => {
  it('renders with default props', () => {
    render(<Textarea placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('fires onChange handler', async () => {
    const handleChange = vi.fn();
    render(<Textarea onChange={handleChange} placeholder="textarea" />);
    await userEvent.type(screen.getByPlaceholderText('textarea'), 'hello');
    expect(handleChange).toHaveBeenCalled();
  });

  it('renders with rows prop', () => {
    render(<Textarea rows={5} placeholder="textarea" />);
    expect(screen.getByPlaceholderText('textarea')).toHaveAttribute('rows', '5');
  });

  it('renders with maxLength prop', () => {
    render(<Textarea maxLength={100} placeholder="textarea" />);
    expect(screen.getByPlaceholderText('textarea')).toHaveAttribute('maxlength', '100');
  });

  it('shows error message when error is provided', () => {
    const { container } = render(<Textarea error="Required field" />);
    expect(screen.getByText('Required field')).toBeInTheDocument();
    expect(container.querySelector('.textarea-error')).toBeInTheDocument();
  });

  it('does not show error message when no error', () => {
    const { container } = render(<Textarea placeholder="textarea" />);
    expect(container.querySelector('.textarea-error')).not.toBeInTheDocument();
    expect(container.querySelector('.textarea-error-message')).not.toBeInTheDocument();
  });

  it('applies fullWidth class', () => {
    const { container } = render(<Textarea fullWidth placeholder="textarea" />);
    expect(container.querySelector('.textarea-full-width')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Textarea className="custom" placeholder="textarea" />);
    expect(container.querySelector('.textarea.custom')).toBeInTheDocument();
  });
});
