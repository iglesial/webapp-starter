import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders with default props', () => {
    const { container } = render(<Badge>Label</Badge>);
    expect(screen.getByText('Label')).toBeInTheDocument();
    expect(container.querySelector('.badge-default')).toBeInTheDocument();
    expect(container.querySelector('.badge-small')).toBeInTheDocument();
  });

  it('renders all variant combinations', () => {
    const variants = ['default', 'success', 'warning', 'danger', 'info'] as const;
    variants.forEach((variant) => {
      const { container } = render(<Badge variant={variant}>Label</Badge>);
      expect(container.querySelector(`.badge-${variant}`)).toBeInTheDocument();
    });
  });

  it('renders all size combinations', () => {
    const sizes = ['small', 'medium'] as const;
    sizes.forEach((size) => {
      const { container } = render(<Badge size={size}>Label</Badge>);
      expect(container.querySelector(`.badge-${size}`)).toBeInTheDocument();
    });
  });

  it('applies custom className', () => {
    const { container } = render(<Badge className="custom">Label</Badge>);
    expect(container.querySelector('.badge.custom')).toBeInTheDocument();
  });
});
