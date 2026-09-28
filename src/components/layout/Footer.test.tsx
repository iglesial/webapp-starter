import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { rx, tt } from '../../test/i18n';
import { Footer } from './Footer';

function renderFooter() {
  return render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>,
  );
}

describe('Footer', () => {
  it('is a landmark carrying the product name', () => {
    renderFooter();
    expect(screen.getByRole('contentinfo')).toHaveTextContent(tt('common.appName'));
  });

  // The footer is on every page, which is what makes the legal pages
  // reachable from anywhere.
  it('links to the legal notice and the privacy policy', () => {
    renderFooter();
    expect(screen.getByRole('link', { name: rx('legal.legalNoticeLink') })).toHaveAttribute(
      'href',
      '/legal',
    );
    expect(screen.getByRole('link', { name: rx('legal.privacyLink') })).toHaveAttribute(
      'href',
      '/privacy',
    );
  });

  it('shows no mailto link while no contact address is configured', () => {
    renderFooter();
    expect(document.querySelector('a[href^="mailto:"]')).toBeNull();
  });
});
