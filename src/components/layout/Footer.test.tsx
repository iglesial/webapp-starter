import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { tt } from '../../test/i18n';
import { Footer } from './Footer';

describe('Footer', () => {
  it('is a landmark carrying the product name', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );
    expect(screen.getByRole('contentinfo')).toHaveTextContent(tt('common.appName'));
  });
});
