import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Switch } from './Switch';

describe('Switch', () => {
  it('is a switch named by its label, announcing its state', () => {
    render(<Switch checked={false} onChange={() => {}} label="Raw JSON" />);
    expect(screen.getByRole('switch', { name: 'Raw JSON' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
  });

  it('reports the opposite state when toggled', async () => {
    const onChange = vi.fn();
    render(<Switch checked onChange={onChange} label="Raw JSON" />);
    await userEvent.setup().click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('never submits a surrounding form', () => {
    render(<Switch checked={false} onChange={() => {}} label="Raw JSON" />);
    expect(screen.getByRole('switch')).toHaveAttribute('type', 'button');
  });
});
