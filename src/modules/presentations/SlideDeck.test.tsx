import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SlideDeck } from './SlideDeck';
import { tt } from '../../test/i18n';

function ActiveProbe({ isActive }: { isActive?: boolean }) {
  return <p>Probe: {isActive ? 'active' : 'inactive'}</p>;
}

function renderDeck() {
  return render(
    <SlideDeck
      deckTitle="Test deck"
      slides={[<p key="a">Slide A</p>, <p key="b">Slide B</p>, <p key="c">Slide C</p>]}
    />,
  );
}

describe('SlideDeck', () => {
  it('renders one dot per slide', () => {
    const { container } = renderDeck();
    expect(container.querySelectorAll('.slide-deck-dot')).toHaveLength(3);
  });

  it('only marks the active slide as visible', () => {
    const { container } = renderDeck();
    const slides = container.querySelectorAll('.slide-deck-slide');
    expect(slides[0]).toHaveClass('is-active');
    expect(slides[0]).toHaveAttribute('aria-hidden', 'false');
    expect(slides[1]).not.toHaveClass('is-active');
    expect(slides[1]).toHaveAttribute('aria-hidden', 'true');
  });

  it('disables the previous arrow on the first slide and the next arrow on the last', async () => {
    const user = userEvent.setup();
    renderDeck();
    expect(screen.getByLabelText(tt('presentations.previous'))).toBeDisabled();
    expect(screen.getByLabelText(tt('presentations.next'))).not.toBeDisabled();

    await user.click(screen.getByLabelText(tt('presentations.goTo', { number: 3 })));

    expect(screen.getByLabelText(tt('presentations.next'))).toBeDisabled();
    expect(screen.getByLabelText(tt('presentations.previous'))).not.toBeDisabled();
  });

  it('navigates by clicking a dot', async () => {
    const user = userEvent.setup();
    const { container } = renderDeck();
    await user.click(screen.getByLabelText(tt('presentations.goTo', { number: 2 })));
    const slides = container.querySelectorAll('.slide-deck-slide');
    expect(slides[1]).toHaveClass('is-active');
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });

  it('navigates with arrow keys', async () => {
    const user = userEvent.setup();
    const { container } = renderDeck();
    await user.keyboard('{ArrowRight}');
    expect(container.querySelectorAll('.slide-deck-slide')[1]).toHaveClass('is-active');
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });

  it('injects an isActive prop into custom slide components, tracking the active index', async () => {
    const user = userEvent.setup();
    render(
      <SlideDeck
        deckTitle="Probe deck"
        slides={[<ActiveProbe key="a" />, <ActiveProbe key="b" />]}
      />,
    );
    expect(screen.getByText('Probe: active')).toBeInTheDocument();
    expect(screen.getByText('Probe: inactive')).toBeInTheDocument();

    await user.click(screen.getByLabelText(tt('presentations.goTo', { number: 2 })));
    expect(screen.getAllByText('Probe: active')).toHaveLength(1);
    expect(screen.getAllByText('Probe: inactive')).toHaveLength(1);
  });
});
