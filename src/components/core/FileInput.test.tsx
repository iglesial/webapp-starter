import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FileInput } from './FileInput';

describe('FileInput', () => {
  it('labels the native input with the button text', () => {
    render(<FileInput id="avatar" accept="image/png" label="Choose image…" onSelect={() => {}} />);
    const input = screen.getByLabelText('Choose image…');
    expect(input).toHaveAttribute('type', 'file');
    expect(input).toHaveAttribute('accept', 'image/png');
  });

  it('hands the chosen file to onSelect', async () => {
    const onSelect = vi.fn();
    render(<FileInput id="avatar" accept="image/png" label="Choose image…" onSelect={onSelect} />);
    const file = new File(['x'], 'me.png', { type: 'image/png' });
    await userEvent.setup().upload(screen.getByLabelText('Choose image…'), file);
    expect(onSelect).toHaveBeenCalledWith(file);
  });

  it('shows the hint beside the button', () => {
    render(
      <FileInput id="avatar" accept="image/png" label="Choose" hint="me.png" onSelect={() => {}} />,
    );
    expect(screen.getByText('me.png')).toBeInTheDocument();
  });
});
