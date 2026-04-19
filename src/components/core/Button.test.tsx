import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders with default props', () => {
    const { container } = render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
    expect(container.querySelector('.btn-primary')).toBeInTheDocument();
    expect(container.querySelector('.btn-medium')).toBeInTheDocument();
  });

  it('renders all variant combinations', () => {
    const variants = ['primary', 'secondary', 'danger'] as const;
    variants.forEach((variant) => {
      const { container } = render(<Button variant={variant}>Btn</Button>);
      expect(container.querySelector(`.btn-${variant}`)).toBeInTheDocument();
    });
  });

  it('renders all size combinations', () => {
    const sizes = ['small', 'medium', 'large'] as const;
    sizes.forEach((size) => {
      const { container } = render(<Button size={size}>Btn</Button>);
      expect(container.querySelector(`.btn-${size}`)).toBeInTheDocument();
    });
  });

  it('applies fullWidth class', () => {
    const { container } = render(<Button fullWidth>Btn</Button>);
    expect(container.querySelector('.btn-full-width')).toBeInTheDocument();
  });

  it('handles disabled state', () => {
    render(<Button disabled>Btn</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('fires onClick handler', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Btn</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('does not fire onClick when disabled', async () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Btn</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    const { container } = render(<Button className="custom">Btn</Button>);
    expect(container.querySelector('.btn.custom')).toBeInTheDocument();
  });
});
