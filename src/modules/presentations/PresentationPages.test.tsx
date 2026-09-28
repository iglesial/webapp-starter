import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { rx, tt } from '../../test/i18n';
import { PresentationPage } from './PresentationPage';
import { PresentationsIndexPage } from './PresentationsIndexPage';
import { PRESENTATIONS } from './registry';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/presentations" element={<PresentationsIndexPage />} />
        <Route path="/presentations/:slug" element={<PresentationPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('presentations registry', () => {
  it('has unique slugs, each loading a deck component', async () => {
    const slugs = PRESENTATIONS.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const entry of PRESENTATIONS) {
      expect(typeof (await entry.load()).default).toBe('function');
    }
  });
});

describe('PresentationsIndexPage', () => {
  it('links every registered deck', () => {
    renderAt('/presentations');
    for (const entry of PRESENTATIONS) {
      expect(screen.getByRole('link', { name: new RegExp(entry.title) })).toHaveAttribute(
        'href',
        `/presentations/${entry.slug}`,
      );
    }
  });
});

describe('PresentationPage', () => {
  it('says so for an unknown deck and links back to the index', () => {
    renderAt('/presentations/nope');
    expect(screen.getByText(tt('presentations.notFound'))).toBeInTheDocument();
    expect(screen.getByRole('link', { name: rx('presentations.backToIndex') })).toHaveAttribute(
      'href',
      '/presentations',
    );
  });

  it('loads the example deck and navigates it from the keyboard', async () => {
    renderAt('/presentations/example');

    const deck = await screen.findByRole('region', { name: 'Building a deck' }, { timeout: 10_000 });
    expect(deck).toBeInTheDocument();
    expect(screen.getByText('1 / 3')).toBeInTheDocument();

    await userEvent.setup().keyboard('{ArrowRight}');
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  }, 15_000);
});
