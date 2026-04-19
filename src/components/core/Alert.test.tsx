import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Alert } from './Alert';

describe('Alert', () => {
  it('renders with default props', () => {
    const { container } = render(<Alert>Test message</Alert>);
    expect(screen.getByText('Test message')).toBeInTheDocument();
    expect(container.querySelector('.alert-info')).toBeInTheDocument();
  });

  it('renders all type variants', () => {
    const types = ['success', 'danger', 'warning', 'info'] as const;
    types.forEach((type) => {
      const { container } = render(<Alert type={type}>Message</Alert>);
      expect(container.querySelector(`.alert-${type}`)).toBeInTheDocument();
    });
  });

  it('renders title when provided', () => {
    render(<Alert title="Alert Title">Message</Alert>);
    expect(screen.getByText('Alert Title')).toBeInTheDocument();
  });

  it('does not render title when not provided', () => {
    const { container } = render(<Alert>Message</Alert>);
    expect(container.querySelector('.alert-title')).not.toBeInTheDocument();
  });

  it('renders close button when onClose is provided', () => {
    render(<Alert onClose={() => {}}>Message</Alert>);
    expect(screen.getByLabelText('Close')).toBeInTheDocument();
  });

  it('does not render close button when onClose is not provided', () => {
    render(<Alert>Message</Alert>);
    expect(screen.queryByLabelText('Close')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const handleClose = vi.fn();
    render(<Alert onClose={handleClose}>Message</Alert>);
    await userEvent.click(screen.getByLabelText('Close'));
    expect(handleClose).toHaveBeenCalledOnce();
  });

  it('has role="alert" for accessibility', () => {
    render(<Alert>Message</Alert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
