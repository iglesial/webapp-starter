import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Hero } from './Hero';

describe('Hero', () => {
  it('renders with title', () => {
    render(<Hero title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders with title and subtitle', () => {
    render(<Hero title="Test Title" subtitle="Test subtitle text" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test subtitle text')).toBeInTheDocument();
  });

  it('renders children when provided', () => {
    render(
      <Hero title="Test Title">
        <button>Click me</button>
      </Hero>
    );
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('applies size variants correctly', () => {
    const { container } = render(<Hero title="Test" size="small" />);
    expect(container.querySelector('.hero-small')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Hero title="Test" className="custom-class" />);
    expect(container.querySelector('.hero.custom-class')).toBeInTheDocument();
  });

  it('defaults to large size', () => {
    const { container } = render(<Hero title="Test" />);
    expect(container.querySelector('.hero-large')).toBeInTheDocument();
  });
});
