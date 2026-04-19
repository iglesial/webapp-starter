import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/core/Button';
import { Hero } from '../components/core/Hero';
import './HomePage.css';

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <header className="home-header">
        <Link to="/" className="home-brand" aria-label="Home">
          Webapp Starter
        </Link>
      </header>

      <main>
        <Hero
          title="Welcome to your new app."
          subtitle="A React + Amplify Gen 2 + Cognito starter — routing, auth context, route guards, and core UI primitives are already wired. Start building."
        >
          <Button variant="primary" size="large" onClick={() => navigate('/signup')}>
            Sign up
          </Button>
          <Button variant="secondary" size="large" onClick={() => navigate('/signin')}>
            Sign in
          </Button>
        </Hero>
      </main>

      <footer className="home-footer">
        <p className="home-footer-copy">© Your App</p>
        <nav className="home-footer-links" aria-label="Legal">
          <a href="#terms" className="home-footer-link">
            Terms
          </a>
          <a href="#privacy" className="home-footer-link">
            Privacy
          </a>
        </nav>
      </footer>
    </div>
  );
}
