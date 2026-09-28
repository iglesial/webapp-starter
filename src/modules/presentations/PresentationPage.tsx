import { Suspense, lazy } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Spinner } from '../../components/core/Spinner';
import { PresentationShell } from './PresentationShell';
import { PRESENTATIONS } from './registry';
import './PresentationsIndexPage.css';

// One lazy deck per registered entry, created once at module load: making them
// during render would remount the deck (back to slide 1) on every render.
// Stored as elements, so rendering one is a lookup, not a component created in
// render.
const DECKS = new Map(
  PRESENTATIONS.map((entry) => {
    const Deck = lazy(entry.load);
    return [entry.slug, <Deck />] as const;
  }),
);

// /presentations/:slug — resolves the deck from the registry and loads its
// chunk on demand.
export function PresentationPage() {
  const { t } = useTranslation();
  const { slug = '' } = useParams();
  const deck = DECKS.get(slug);

  if (!deck) {
    return (
      <PresentationShell>
        <main className="presentations-index">
          <p>{t('presentations.notFound')}</p>
          <Link to="/presentations">{t('presentations.backToIndex')}</Link>
        </main>
      </PresentationShell>
    );
  }

  return (
    <Suspense fallback={<Spinner size="large" />}>
      {deck}
    </Suspense>
  );
}
