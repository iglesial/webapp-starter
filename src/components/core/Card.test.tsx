import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from './Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('defaults to medium padding', () => {
    const { container } = render(<Card>Content</Card>);
    expect(container.querySelector('.card-padding-medium')).toBeInTheDocument();
  });

  it('renders all padding variants', () => {
    const paddings = ['none', 'small', 'medium', 'large'] as const;
    paddings.forEach((padding) => {
      const { container } = render(<Card padding={padding}>Content</Card>);
      expect(container.querySelector(`.card-padding-${padding}`)).toBeInTheDocument();
    });
  });

  it('applies hoverable class', () => {
    const { container } = render(<Card hoverable>Content</Card>);
    expect(container.querySelector('.card-hoverable')).toBeInTheDocument();
  });

  it('does not apply hoverable class by default', () => {
    const { container } = render(<Card>Content</Card>);
    expect(container.querySelector('.card-hoverable')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Card className="custom">Content</Card>);
    expect(container.querySelector('.card.custom')).toBeInTheDocument();
  });
});
