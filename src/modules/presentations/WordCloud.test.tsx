import { useState } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WordCloud } from './WordCloud';
import { tt } from '../../test/i18n';

const TERMS = [
  { text: 'Automatisation', weight: 3 as const },
  { text: 'Gain de temps', weight: 2 as const },
];

function ToggleActive({ initial, delayMs }: { initial: boolean; delayMs: number }) {
  const [active, setActive] = useState(initial);
  return (
    <div>
      <button type="button" onClick={() => setActive((a) => !a)}>
        toggle
      </button>
      <WordCloud terms={TERMS} autoRevealOn={active} autoRevealDelayMs={delayMs} />
    </div>
  );
}

describe('WordCloud', () => {
  it('starts unrevealed with the initial prompt', () => {
    const { container } = render(<WordCloud terms={TERMS} />);
    expect(screen.getByText(tt('presentations.reveal'))).toBeInTheDocument();
    expect(container.querySelector('.word-cloud-terms')).not.toHaveClass('is-revealed');
  });

  it('renders every term', () => {
    render(<WordCloud terms={TERMS} />);
    expect(screen.getByText('Automatisation')).toBeInTheDocument();
    expect(screen.getByText('Gain de temps')).toBeInTheDocument();
  });

  it('reveals the terms and swaps the trigger label on click (no delay for manual clicks)', async () => {
    const user = userEvent.setup();
    const { container } = render(<WordCloud terms={TERMS} />);
    await user.click(screen.getByText(tt('presentations.reveal')));
    expect(container.querySelector('.word-cloud-terms')).toHaveClass('is-revealed');
    expect(screen.getByText(tt('presentations.replay'))).toBeInTheDocument();
  });

  it('supports replaying the animation on a second click without throwing', async () => {
    const user = userEvent.setup();
    render(<WordCloud terms={TERMS} />);
    await user.click(screen.getByText(tt('presentations.reveal')));
    await user.click(screen.getByText(tt('presentations.replay')));
    expect(screen.getByText('Automatisation')).toBeInTheDocument();
  });

  it('renders an icon trigger with an accessible label when triggerIcon is set', async () => {
    const user = userEvent.setup();
    render(<WordCloud terms={TERMS} triggerIcon="/logo.svg" triggerLabel="Révéler" />);
    const button = screen.getByRole('button', { name: 'Révéler' });
    expect(button).toHaveClass('word-cloud-trigger-icon');
    await user.click(button);
    expect(screen.getByRole('button', { name: tt('presentations.replay') })).toBeInTheDocument();
  });

  it('applies the top-left positioning modifier when requested', () => {
    const { container } = render(<WordCloud terms={TERMS} triggerPosition="top-left" />);
    expect(container.querySelector('.word-cloud')).toHaveClass('word-cloud-trigger-top-left');
  });

  it('does not auto-reveal while autoRevealOn is false', () => {
    const { container } = render(<WordCloud terms={TERMS} autoRevealOn={false} />);
    expect(container.querySelector('.word-cloud-terms')).not.toHaveClass('is-revealed');
  });

  it('auto-reveals once autoRevealOn flips from false to true', async () => {
    const { container } = render(<ToggleActive initial={false} delayMs={0} />);
    expect(container.querySelector('.word-cloud-terms')).not.toHaveClass('is-revealed');

    await userEvent.setup().click(screen.getByText('toggle'));

    expect(await screen.findByRole('button', { name: tt('presentations.replay') })).toBeInTheDocument();
    expect(container.querySelector('.word-cloud-terms')).toHaveClass('is-revealed');
  });

  it('re-reveals each time the slide is revisited (false -> true -> false -> true)', async () => {
    const { container } = render(<ToggleActive initial={true} delayMs={0} />);
    expect(await screen.findByRole('button', { name: tt('presentations.replay') })).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByText('toggle')); // leave the slide
    await user.click(screen.getByText('toggle')); // return to the slide

    expect(container.querySelector('.word-cloud-terms')).toHaveClass('is-revealed');
  });

  describe('with fake timers', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('waits for the default 3s delay before the first automatic reveal', () => {
      const { container, rerender } = render(<WordCloud terms={TERMS} autoRevealOn={false} />);
      rerender(<WordCloud terms={TERMS} autoRevealOn={true} />);

      expect(container.querySelector('.word-cloud-terms')).not.toHaveClass('is-revealed');

      act(() => {
        vi.advanceTimersByTime(2999);
      });
      expect(container.querySelector('.word-cloud-terms')).not.toHaveClass('is-revealed');

      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(container.querySelector('.word-cloud-terms')).toHaveClass('is-revealed');
    });

    it('cancels the pending automatic reveal if the slide becomes inactive before the delay elapses', () => {
      const { container, rerender } = render(<WordCloud terms={TERMS} autoRevealOn={false} />);
      rerender(<WordCloud terms={TERMS} autoRevealOn={true} />);

      act(() => {
        vi.advanceTimersByTime(1000);
      });
      rerender(<WordCloud terms={TERMS} autoRevealOn={false} />);

      act(() => {
        vi.advanceTimersByTime(3000);
      });
      expect(container.querySelector('.word-cloud-terms')).not.toHaveClass('is-revealed');
    });
  });
});
