import { useTranslation } from 'react-i18next';
import './Footer.css';

// Rendered by AppShell, so it exists on every page rather than only the
// homepage: anything that must be reachable from anywhere (legal notices,
// contact) belongs here.
export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="site-footer">
      <p className="site-footer-copy">{t('common.copyright', { appName: t('common.appName') })}</p>
    </footer>
  );
}
