import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from './Modal';

describe('Modal', () => {
  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <Modal isOpen={false} onClose={() => {}}>Content</Modal>
    );
    expect(container.querySelector('.modal-overlay')).not.toBeInTheDocument();
  });

  it('renders content when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>Modal content</Modal>
    );
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Modal Title">Content</Modal>
    );
    expect(screen.getByText('Modal Title')).toBeInTheDocument();
  });

  it('does not render header when title is not provided', () => {
    const { container } = render(
      <Modal isOpen={true} onClose={() => {}}>Content</Modal>
    );
    expect(container.querySelector('.modal-header')).not.toBeInTheDocument();
  });

  it('renders all size variants', () => {
    const sizes = ['small', 'medium', 'large'] as const;
    sizes.forEach((size) => {
      const { container } = render(
        <Modal isOpen={true} onClose={() => {}} size={size}>Content</Modal>
      );
      expect(container.querySelector(`.modal-${size}`)).toBeInTheDocument();
    });
  });

  it('defaults to medium size', () => {
    const { container } = render(
      <Modal isOpen={true} onClose={() => {}}>Content</Modal>
    );
    expect(container.querySelector('.modal-medium')).toBeInTheDocument();
  });

  it('calls onClose when overlay is clicked', async () => {
    const handleClose = vi.fn();
    const { container } = render(
      <Modal isOpen={true} onClose={handleClose}>Content</Modal>
    );
    await userEvent.click(container.querySelector('.modal-overlay')!);
    expect(handleClose).toHaveBeenCalledOnce();
  });

  it('does not call onClose when content is clicked', async () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose}>
        <button>Inner button</button>
      </Modal>
    );
    await userEvent.click(screen.getByText('Inner button'));
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('calls onClose when Escape key is pressed', async () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose}>Content</Modal>
    );
    await userEvent.keyboard('{Escape}');
    expect(handleClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when close button is clicked', async () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Title">Content</Modal>
    );
    await userEvent.click(screen.getByLabelText('Close'));
    expect(handleClose).toHaveBeenCalledOnce();
  });

  it('sets body overflow to hidden when open', () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>Content</Modal>
    );
    expect(document.body.style.overflow).toBe('hidden');
  });
});
