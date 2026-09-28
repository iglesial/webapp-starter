import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PresentationShell } from './PresentationShell';
import { PRESENTATIONS } from './registry';
import './PresentationsIndexPage.css';

export function PresentationsIndexPage() {
  const { t } = useTranslation();

  return (
    <PresentationShell>
      <main className="presentations-index">
        <h1>{t('presentations.indexTitle')}</h1>
        <ul className="presentations-index-list">
          {PRESENTATIONS.map((presentation) => (
            <li key={presentation.slug}>
              <Link to={`/presentations/${presentation.slug}`} className="presentations-index-card">
                <h2>{presentation.title}</h2>
                <p>{presentation.subtitle}</p>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </PresentationShell>
  );
}
