import { Suspense, lazy } from 'react';
import { Spinner } from '../../components/core/Spinner';

// The entry point for the rest of the app. The Markdown parser and its
// plugins are ~100 kB; loading them on demand keeps them off every page that
// does not render Markdown. Import SafeMarkdown directly only from code that
// is itself lazy-loaded.
const SafeMarkdown = lazy(() =>
  import('./SafeMarkdown').then((m) => ({ default: m.SafeMarkdown })),
);

export function LazyMarkdown({ children }: { children: string }) {
  return (
    <Suspense fallback={<Spinner size="small" />}>
      <SafeMarkdown>{children}</SafeMarkdown>
    </Suspense>
  );
}
