import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select } from './Select';

const mockOptions = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
  { value: 'c', label: 'Option C' },
];

describe('Select', () => {
  it('renders options', () => {
    render(<Select options={mockOptions} />);
    expect(screen.getByText('Option A')).toBeInTheDocument();
    expect(screen.getByText('Option B')).toBeInTheDocument();
    expect(screen.getByText('Option C')).toBeInTheDocument();
  });

  it('renders placeholder when provided', () => {
    render(<Select options={mockOptions} placeholder="Choose one" />);
    const placeholder = screen.getByText('Choose one');
    expect(placeholder).toBeInTheDocument();
    expect(placeholder).toBeDisabled();
  });

  it('does not render placeholder when not provided', () => {
    render(<Select options={mockOptions} />);
    const allOptions = screen.getAllByRole('option');
    expect(allOptions).toHaveLength(3);
  });

  it('fires onChange handler', async () => {
    const handleChange = vi.fn();
    render(<Select options={mockOptions} onChange={handleChange} />);
    await userEvent.selectOptions(screen.getByRole('combobox'), 'b');
    expect(handleChange).toHaveBeenCalled();
  });

  it('shows error message when error is provided', () => {
    const { container } = render(<Select options={mockOptions} error="Required" />);
    expect(screen.getByText('Required')).toBeInTheDocument();
    expect(container.querySelector('.select-error')).toBeInTheDocument();
  });

  it('does not show error when no error', () => {
    const { container } = render(<Select options={mockOptions} />);
    expect(container.querySelector('.select-error')).not.toBeInTheDocument();
    expect(container.querySelector('.select-error-message')).not.toBeInTheDocument();
  });

  it('applies fullWidth class', () => {
    const { container } = render(<Select options={mockOptions} fullWidth />);
    expect(container.querySelector('.select-full-width')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Select options={mockOptions} className="custom" />);
    expect(container.querySelector('.select.custom')).toBeInTheDocument();
  });
});
