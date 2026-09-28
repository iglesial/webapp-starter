import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('is reachable by its label text', () => {
    render(<Checkbox checked={false} onChange={() => {}} label="I agree" />);

    expect(screen.getByRole('checkbox', { name: 'I agree' })).toBeInTheDocument();
  });

  // Two instances on one page is the case this exists for; a hardcoded id
  // would bind both labels to the first input.
  it('gives each instance its own label association', async () => {
    const first = vi.fn();
    const second = vi.fn();
    const user = userEvent.setup();
    render(
      <>
        <Checkbox checked={false} onChange={first} label="First" />
        <Checkbox checked={false} onChange={second} label="Second" />
      </>,
    );

    await user.click(screen.getByText('Second'));

    expect(second).toHaveBeenCalledWith(true);
    expect(first).not.toHaveBeenCalled();
  });

  it('reports the new state when toggled', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Checkbox checked={false} onChange={onChange} label="I agree" />);

    await user.click(screen.getByRole('checkbox'));

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('reflects the checked prop', () => {
    render(<Checkbox checked onChange={() => {}} label="I agree" />);

    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('does not fire while disabled', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Checkbox checked={false} onChange={onChange} disabled label="I agree" />);

    await user.click(screen.getByRole('checkbox'));

    expect(onChange).not.toHaveBeenCalled();
  });

  // Consent must be an affirmative act: a box that arrives ticked is not one.
  it('renders unchecked when told to', () => {
    render(<Checkbox checked={false} onChange={() => {}} label="I agree" />);

    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });
});
