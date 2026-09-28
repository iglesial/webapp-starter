import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { rx } from '../../test/i18n';
import { Toast } from './Toast';

afterEach(() => {
  vi.useRealTimers();
});

describe('Toast', () => {
  it('is a polite live region rendered at the document body', () => {
    const { container } = render(<Toast onDismiss={() => {}}>Saved</Toast>);
    const toast = screen.getByRole('status');
    expect(toast).toHaveTextContent('Saved');
    expect(toast).toHaveAttribute('aria-live', 'polite');
    // Portalled: not inside the render container, so no transformed ancestor
    // can capture its position: fixed.
    expect(container).not.toContainElement(toast);
  });

  it('dismisses itself after durationMs', () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    render(
      <Toast onDismiss={onDismiss} durationMs={500}>
        Saved
      </Toast>,
    );
    act(() => vi.advanceTimersByTime(499));
    expect(onDismiss).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('can be dismissed early with its close button', async () => {
    const onDismiss = vi.fn();
    render(<Toast onDismiss={onDismiss}>Saved</Toast>);
    await userEvent.setup().click(screen.getByRole('button', { name: rx('common.dismiss') }));
    expect(onDismiss).toHaveBeenCalled();
  });
});
