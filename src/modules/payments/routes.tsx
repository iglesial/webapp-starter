import { Suspense, lazy } from 'react';
import { Route } from 'react-router-dom';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { Spinner } from '../../components/core/Spinner';

// Lazy pages keep Stripe copy and the data client out of the main bundle.
// eslint-disable-next-line react-refresh/only-export-components -- not exported; lazy() wrappers
const CheckoutPage = lazy(() => import('./CheckoutPage').then((m) => ({ default: m.CheckoutPage })));
// eslint-disable-next-line react-refresh/only-export-components -- not exported; lazy() wrappers
const CheckoutSuccessPage = lazy(() =>
  import('./CheckoutSuccessPage').then((m) => ({ default: m.CheckoutSuccessPage })),
);

// The module's routes, spliced into <Routes> by App.tsx while payments are on.
// A function returning elements rather than a component: <Routes> only
// accepts <Route> elements (and fragments of them) as children.
export function paymentRoutes() {
  const page = (element: React.ReactNode) => (
    <ProtectedRoute>
      <Suspense fallback={<Spinner size="large" />}>{element}</Suspense>
    </ProtectedRoute>
  );
  return (
    <>
      {/* Declared before :slug so "success" is never read as a product. */}
      <Route path="/checkout/success" element={page(<CheckoutSuccessPage />)} />
      <Route path="/checkout/:slug" element={page(<CheckoutPage />)} />
    </>
  );
}
