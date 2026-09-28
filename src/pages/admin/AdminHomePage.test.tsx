import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AdminHomePage } from './AdminHomePage';

function renderPage(sections?: Parameters<typeof AdminHomePage>[0]['sections']) {
  return render(
    <MemoryRouter>
      <AdminHomePage sections={sections} />
    </MemoryRouter>,
  );
}

describe('AdminHomePage', () => {
  it('links each section card to its route', () => {
    renderPage([
      { to: '/admin/users', title: 'Users', description: 'Manage accounts.' },
      { to: '/admin/reports', title: 'Reports', description: 'Usage reports.' },
    ]);
    expect(screen.getByRole('link', { name: /users/i })).toHaveAttribute('href', '/admin/users');
    expect(screen.getByRole('link', { name: /reports/i })).toHaveAttribute(
      'href',
      '/admin/reports',
    );
  });

  it('explains where to add sections when there are none', () => {
    renderPage([]);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText(/no admin sections yet/i)).toBeInTheDocument();
  });
});
