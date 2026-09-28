import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CONTACT_EMAIL } from '../../data/legalEntity';
import './Footer.css';

// Rendered by AppShell, so it exists on every page rather than only the
// homepage: legal notices have to be reachable from anywhere.
export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="site-footer">
      <p className="site-footer-copy">{t('common.copyright', { appName: t('common.appName') })}</p>
      <nav className="site-footer-links" aria-label={t('legal.footerNav')}>
        {CONTACT_EMAIL && (
          <a href={`mailto:${CONTACT_EMAIL}`} className="site-footer-link">
            {CONTACT_EMAIL}
          </a>
        )}
        <Link to="/legal" className="site-footer-link">
          {t('legal.legalNoticeLink')}
        </Link>
        <Link to="/privacy" className="site-footer-link">
          {t('legal.privacyLink')}
        </Link>
      </nav>
    </footer>
  );
}
