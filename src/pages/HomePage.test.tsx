import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { rx, tt } from '../test/i18n';
import { HomePage } from './HomePage';

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="landed-at">{location.pathname}</div>;
}

function renderHome() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<LocationDisplay />} />
        <Route path="/signin" element={<LocationDisplay />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('HomePage', () => {
  it('renders the hero headline', () => {
    renderHome();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(tt('home.title'));
  });

  it('navigates to /signup when the primary CTA is clicked', async () => {
    const user = userEvent.setup();
    renderHome();
    await user.click(screen.getByRole('button', { name: rx('home.signUp') }));
    expect(screen.getByTestId('landed-at')).toHaveTextContent('/signup');
  });

  it('navigates to /signin when the secondary CTA is clicked', async () => {
    const user = userEvent.setup();
    renderHome();
    await user.click(screen.getByRole('button', { name: rx('home.signIn') }));
    expect(screen.getByTestId('landed-at')).toHaveTextContent('/signin');
  });

  it('renders a header landmark with the brand mark and a language switch', () => {
    renderHome();
    const banner = screen.getByRole('banner');
    expect(banner).toHaveTextContent(tt('home.brand'));
    expect(screen.getByRole('group', { name: rx('nav.language') })).toBeInTheDocument();
  });

  it('renders a footer with two placeholder legal links', () => {
    renderHome();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: rx('home.terms') })).toHaveAttribute('href', '#terms');
    expect(screen.getByRole('link', { name: rx('home.privacy') })).toHaveAttribute('href', '#privacy');
  });
});
