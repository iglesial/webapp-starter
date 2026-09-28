import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/core/Button';
import { Hero } from '../components/core/Hero';
import { LocaleToggle } from '../components/layout/LocaleToggle';
import './HomePage.css';

export function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <header className="home-header">
        <Link to="/" className="home-brand" aria-label={t('nav.home')}>
          {t('home.brand')}
        </Link>
        <LocaleToggle />
      </header>

      <main>
        <Hero title={t('home.title')} subtitle={t('home.subtitle')}>
          <Button variant="primary" size="large" onClick={() => navigate('/signup')}>
            {t('home.signUp')}
          </Button>
          <Button variant="secondary" size="large" onClick={() => navigate('/signin')}>
            {t('home.signIn')}
          </Button>
        </Hero>
      </main>

      <footer className="home-footer">
        <p className="home-footer-copy">{t('home.copyright')}</p>
        <nav className="home-footer-links" aria-label={t('home.legalNav')}>
          <a href="#terms" className="home-footer-link">
            {t('home.terms')}
          </a>
          <a href="#privacy" className="home-footer-link">
            {t('home.privacy')}
          </a>
        </nav>
      </footer>
    </div>
  );
}
