import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('renders with default props', () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector('.spinner-medium')).toBeInTheDocument();
    expect(container.querySelector('.spinner-primary')).toBeInTheDocument();
  });

  it('renders all size variants', () => {
    const sizes = ['small', 'medium', 'large'] as const;
    sizes.forEach((size) => {
      const { container } = render(<Spinner size={size} />);
      expect(container.querySelector(`.spinner-${size}`)).toBeInTheDocument();
    });
  });

  it('renders all color variants', () => {
    const colors = ['primary', 'white'] as const;
    colors.forEach((color) => {
      const { container } = render(<Spinner color={color} />);
      expect(container.querySelector(`.spinner-${color}`)).toBeInTheDocument();
    });
  });

  it('has role="status" for accessibility', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has screen reader text', () => {
    render(<Spinner />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
