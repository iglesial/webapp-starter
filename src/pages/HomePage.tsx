import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/core/Button';
import { Hero } from '../components/core/Hero';
import './HomePage.css';

// The navbar and footer come from AppShell; this page is only its content.
export function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <main className="home-page">
      <Hero title={t('home.title')} subtitle={t('home.subtitle')}>
        <Button variant="primary" size="large" onClick={() => navigate('/signup')}>
          {t('home.signUp')}
        </Button>
        <Button variant="secondary" size="large" onClick={() => navigate('/signin')}>
          {t('home.signIn')}
        </Button>
      </Hero>
    </main>
  );
}
