import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressBar } from './ProgressBar';

describe('ProgressBar', () => {
  it('renders with default props', () => {
    const { container } = render(<ProgressBar value={50} />);
    expect(container.querySelector('.progress-bar-medium')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('sets correct width style', () => {
    render(<ProgressBar value={75} />);
    expect(screen.getByRole('progressbar')).toHaveStyle({ width: '75%' });
  });

  it('clamps value below 0', () => {
    render(<ProgressBar value={-10} />);
    expect(screen.getByRole('progressbar')).toHaveStyle({ width: '0%' });
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('clamps value above 100', () => {
    render(<ProgressBar value={150} />);
    expect(screen.getByRole('progressbar')).toHaveStyle({ width: '100%' });
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });

  it('shows label when showLabel is true', () => {
    render(<ProgressBar value={65} showLabel />);
    expect(screen.getByText('65%')).toBeInTheDocument();
  });

  it('does not show label by default', () => {
    const { container } = render(<ProgressBar value={65} />);
    expect(container.querySelector('.progress-bar-label')).not.toBeInTheDocument();
  });

  it('renders all size variants', () => {
    const sizes = ['small', 'medium', 'large'] as const;
    sizes.forEach((size) => {
      const { container } = render(<ProgressBar value={50} size={size} />);
      expect(container.querySelector(`.progress-bar-${size}`)).toBeInTheDocument();
    });
  });

  it('renders all variant combinations', () => {
    const variants = ['primary', 'success', 'warning', 'danger'] as const;
    variants.forEach((variant) => {
      const { container } = render(<ProgressBar value={50} variant={variant} />);
      expect(container.querySelector(`.progress-bar-${variant}`)).toBeInTheDocument();
    });
  });

  it('has correct accessibility attributes', () => {
    render(<ProgressBar value={42} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '42');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });
});
