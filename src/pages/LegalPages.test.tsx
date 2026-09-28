import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { rx, tt } from '../test/i18n';

// Each test picks the configuration it needs: the template's empty one, or a
// filled-in one standing for an app that has done its homework.
const config = vi.hoisted(() => ({ filled: false, analytics: false }));

vi.mock('../analytics', () => ({ isAnalyticsEnabled: () => config.analytics }));

vi.mock('../data/legalEntity', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../data/legalEntity')>();
  const filled = {
    name: 'Acme SAS',
    legalForm: 'SAS au capital de 1 000 €',
    address: '1 rue de la Paix, 75002 Paris',
    registration: 'SIREN 123 456 789',
    publicationDirector: 'Jane Doe',
    vat: '',
    phone: '',
  };
  return {
    ...actual,
    get CONTACT_EMAIL() {
      return config.filled ? 'hello@acme.test' : '';
    },
    get LEGAL_ENTITY() {
      return config.filled ? filled : actual.LEGAL_ENTITY;
    },
    get SUPERVISORY_AUTHORITY() {
      return config.filled ? { name: 'CNIL', url: 'https://www.cnil.fr' } : actual.SUPERVISORY_AUTHORITY;
    },
    isLegalConfigured: () => config.filled,
  };
});

const { LegalNoticePage } = await import('./LegalNoticePage');
const { PrivacyPolicyPage } = await import('./PrivacyPolicyPage');

function renderPage(page: 'notice' | 'privacy') {
  return render(
    <MemoryRouter>{page === 'notice' ? <LegalNoticePage /> : <PrivacyPolicyPage />}</MemoryRouter>,
  );
}

beforeEach(() => {
  config.filled = false;
  config.analytics = false;
});

describe('legal pages — as shipped by the template', () => {
  // A template must never pass for a compliant legal page: until the
  // publisher's details are filled in, both pages say so, visibly.
  it.each(['notice', 'privacy'] as const)('%s page says it is not configured', (page) => {
    renderPage(page);
    expect(screen.getByRole('alert')).toHaveTextContent(tt('legal.notConfigured'));
  });

  it('renders no empty publisher rows and no dead mailto link', () => {
    renderPage('notice');
    expect(screen.queryByRole('heading', { name: rx('legal.publisherHeading') })).toBeNull();
    expect(document.querySelector('a[href="mailto:"]')).toBeNull();
  });

  // Not "write to ." with a dead mailto: a visible placeholder instead.
  it('says the contact address is missing rather than leaving a gap', () => {
    renderPage('privacy');
    expect(screen.getAllByText(tt('legal.emailNotSet'))).toHaveLength(2);
    expect(document.querySelector('a[href^="mailto:"]')).toBeNull();
  });

  it('points complaints to the local authority when none is named', () => {
    renderPage('privacy');
    expect(screen.getByText(tt('legal.complaintBodyGeneric'))).toBeInTheDocument();
  });
});

describe('legal notice — configured', () => {
  beforeEach(() => {
    config.filled = true;
  });

  it('drops the notice and lists only the supplied fields', () => {
    renderPage('notice');
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByText('Acme SAS')).toBeInTheDocument();
    expect(screen.getByText('SIREN 123 456 789')).toBeInTheDocument();
    // vat and phone were left empty: no label without a value.
    expect(screen.queryByText(tt('legal.publisherPhone'))).toBeNull();
    expect(screen.queryByText(tt('legal.publisherVat'))).toBeNull();
  });

  it('offers the contact address as a working mailto', () => {
    renderPage('notice');
    expect(screen.getByRole('link', { name: 'hello@acme.test' })).toHaveAttribute(
      'href',
      'mailto:hello@acme.test',
    );
  });

  it('gives the privacy contact as working mailto links', () => {
    renderPage('privacy');
    expect(screen.getAllByRole('link', { name: 'hello@acme.test' })).toHaveLength(2);
    expect(screen.queryByText(tt('legal.emailNotSet'))).toBeNull();
  });

  it('links the named supervisory authority', () => {
    renderPage('privacy');
    expect(screen.getByRole('link', { name: 'CNIL' })).toHaveAttribute(
      'href',
      'https://www.cnil.fr',
    );
  });
});

// The policy must disclose a tracker exactly when one is running.
describe('privacy policy — analytics disclosure', () => {
  it('names no analytics processor or purpose while analytics is off', () => {
    renderPage('privacy');
    expect(screen.queryByRole('link', { name: 'Plausible Analytics' })).toBeNull();
    expect(screen.queryByText(tt('legal.purpose.analytics'))).toBeNull();
  });

  it('discloses Plausible, its purpose and its retention once it is on', () => {
    config.analytics = true;
    renderPage('privacy');
    expect(screen.getByRole('link', { name: 'Plausible Analytics' })).toBeInTheDocument();
    expect(screen.getAllByText(tt('legal.purpose.analytics')).length).toBeGreaterThan(0);
    expect(screen.getByText(tt('legal.retention.analyticsValue'))).toBeInTheDocument();
  });

  it('always names the host', () => {
    renderPage('privacy');
    expect(screen.getByRole('link', { name: 'Amazon Web Services' })).toBeInTheDocument();
  });
});
