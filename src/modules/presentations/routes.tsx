import { Suspense, lazy } from 'react';
import { Route } from 'react-router-dom';
import { Spinner } from '../../components/core/Spinner';

// Lazy pages: nobody who never opens a deck downloads the framework.
// eslint-disable-next-line react-refresh/only-export-components -- not exported; lazy() wrappers
const PresentationsIndexPage = lazy(() =>
  import('./PresentationsIndexPage').then((m) => ({ default: m.PresentationsIndexPage })),
);
// eslint-disable-next-line react-refresh/only-export-components -- not exported; lazy() wrappers
const PresentationPage = lazy(() =>
  import('./PresentationPage').then((m) => ({ default: m.PresentationPage })),
);

// Spliced into <Routes> by App.tsx OUTSIDE the AppShell layout route: decks
// are full-screen, with no navbar or footer. Public, like a talk's slides —
// wrap them in <ProtectedRoute> if yours are not.
export function presentationRoutes() {
  const page = (element: React.ReactNode) => (
    <Suspense fallback={<Spinner size="large" />}>{element}</Suspense>
  );
  return (
    <>
      <Route path="/presentations" element={page(<PresentationsIndexPage />)} />
      <Route path="/presentations/:slug" element={page(<PresentationPage />)} />
    </>
  );
}
