import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
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
  it('renders the hero headline and supporting pitch', () => {
    renderHome();
    expect(
      screen.getByRole('heading', { level: 1, name: /welcome to your new app/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/React \+ Amplify/i)).toBeInTheDocument();
  });

  it('navigates to /signup when the primary CTA is clicked', async () => {
    const user = userEvent.setup();
    renderHome();
    await user.click(screen.getByRole('button', { name: /^sign up$/i }));
    expect(screen.getByTestId('landed-at')).toHaveTextContent('/signup');
  });

  it('navigates to /signin when the secondary CTA is clicked', async () => {
    const user = userEvent.setup();
    renderHome();
    await user.click(screen.getByRole('button', { name: /^sign in$/i }));
    expect(screen.getByTestId('landed-at')).toHaveTextContent('/signin');
  });

  it('renders a header landmark with the brand mark', () => {
    renderHome();
    expect(screen.getByRole('banner')).toHaveTextContent(/webapp starter/i);
  });

  it('renders a footer with two placeholder legal links', () => {
    renderHome();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /terms/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /privacy/i })).toBeInTheDocument();
  });
});
