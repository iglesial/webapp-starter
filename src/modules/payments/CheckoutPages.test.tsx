import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthContext } from '../../contexts/AuthContext';
import type { AuthContextValue } from '../../types/auth';
import { looseText, rx, tt } from '../../test/i18n';
import { formatPrice } from '../../i18n/format';
import { DEFAULT_LOCALE } from '../../i18n/locale';
import { CheckoutPage } from './CheckoutPage';
import { CheckoutSuccessPage, POLL_ATTEMPTS, POLL_INTERVAL_MS } from './CheckoutSuccessPage';
import { PaymentError, paymentService } from './paymentService';

vi.mock('./paymentService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./paymentService')>();
  return {
    ...actual,
    paymentService: { createCheckoutSession: vi.fn(), listMyEntitlements: vi.fn() },
  };
});

const createMock = vi.mocked(paymentService.createCheckoutSession);
const listMock = vi.mocked(paymentService.listMyEntitlements);

const ctx: AuthContextValue = {
  status: 'authenticated',
  user: { sub: 'user-1', email: 'a@b.co', displayName: 'A', emailVerified: true, locale: null, groups: [] },
  isAdmin: false,
  signOut: vi.fn(),
  refreshUser: vi.fn(),
};

function renderAt(path: string) {
  return render(
    <AuthContext.Provider value={ctx}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
          <Route path="/checkout/:slug" element={<CheckoutPage />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

const assign = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.stubGlobal('location', { ...window.location, assign });
  listMock.mockResolvedValue([]);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('CheckoutPage', () => {
  it('shows the product and its price, then hands over to Stripe', async () => {
    createMock.mockResolvedValue('https://checkout.stripe.com/c/pay/cs_1');
    renderAt('/checkout/pro');

    expect(screen.getByText(tt('payments.products.pro.name'))).toBeInTheDocument();
    expect(screen.getByText(looseText(formatPrice(1900, DEFAULT_LOCALE, 'EUR')))).toBeInTheDocument();

    await userEvent.setup().click(await screen.findByRole('button', { name: rx('payments.checkout.buy') }));

    expect(createMock).toHaveBeenCalledWith('pro');
    await waitFor(() => expect(assign).toHaveBeenCalledWith('https://checkout.stripe.com/c/pay/cs_1'));
  });

  it('offers no purchase of something already owned', async () => {
    listMock.mockResolvedValue([{ productSlug: 'pro', grantedAt: 't' }]);
    renderAt('/checkout/pro');

    expect(await screen.findByText(tt('payments.checkout.alreadyOwned'))).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: rx('payments.checkout.buy') })).toBeNull();
  });

  it('shows translated copy for a coded failure, never the raw message', async () => {
    createMock.mockRejectedValue(new PaymentError('PAY_NOT_CONFIGURED', 'Lambda: PAY_NOT_CONFIGURED'));
    renderAt('/checkout/pro');

    await userEvent.setup().click(await screen.findByRole('button', { name: rx('payments.checkout.buy') }));

    expect(await screen.findByText(tt('payments.errors.PAY_NOT_CONFIGURED'))).toBeInTheDocument();
    expect(screen.queryByText(/Lambda/)).toBeNull();
    expect(assign).not.toHaveBeenCalled();
  });

  it('says so for a product that is not in the catalog', () => {
    renderAt('/checkout/enterprise');
    expect(screen.getByText(tt('payments.checkout.notFound'))).toBeInTheDocument();
    expect(screen.queryByRole('button')).toBeNull();
  });
});

describe('CheckoutSuccessPage', () => {
  it('confirms once the webhook has granted the product just bought', async () => {
    listMock.mockResolvedValueOnce([]).mockResolvedValue([{ productSlug: 'pro', grantedAt: 't' }]);
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderAt('/checkout/success?product=pro&session_id=cs_1');

    expect(screen.getByText(tt('payments.success.activating'))).toBeInTheDocument();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS);
    });
    expect(await screen.findByText(tt('payments.success.done'))).toBeInTheDocument();
  });

  // Owning a DIFFERENT product must not read as this purchase being active —
  // the webhook for this one may not have run yet.
  it('keeps waiting while only other products are owned', async () => {
    listMock.mockResolvedValue([{ productSlug: 'team', grantedAt: 't' }]);
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderAt('/checkout/success?product=pro&session_id=cs_1');

    await act(async () => {
      await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS * 3);
    });
    expect(screen.getByText(tt('payments.success.activating'))).toBeInTheDocument();
    expect(screen.queryByText(tt('payments.success.done'))).toBeNull();
  });

  it('says activation is slow, not failed, when the grant never shows up', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderAt('/checkout/success?product=pro&session_id=cs_1');

    await act(async () => {
      await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS * POLL_ATTEMPTS);
    });
    expect(await screen.findByText(tt('payments.success.slow'))).toBeInTheDocument();
    expect(listMock).toHaveBeenCalledTimes(POLL_ATTEMPTS);
  });
});
