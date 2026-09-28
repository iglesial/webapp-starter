import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/core/Button';
import { Hero } from '../components/core/Hero';
import { Toast } from '../components/core/Toast';
import './HomePage.css';

// The navbar and footer come from AppShell; this page is only its content.
export function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  // Set by the profile page after a successful account deletion. The user is
  // signed out by the time they land here, so this is the only place left to
  // confirm it.
  const [accountDeleted, setAccountDeleted] = useState(
    () => (location.state as { accountDeleted?: boolean } | null)?.accountDeleted === true,
  );

  return (
    <main className="home-page">
      {accountDeleted && (
        <Toast onDismiss={() => setAccountDeleted(false)}>{t('account.deletedToast')}</Toast>
      )}
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
