import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../core/Button';
import { LocaleToggle } from './LocaleToggle';
import { useAuth } from '../../hooks/useAuth';
import logoUrl from '../../assets/logo.svg';
import './Navbar.css';

const MOBILE_BREAKPOINT_QUERY = '(min-width: 1024px)';

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

function navLinkClass({ isActive }: { isActive: boolean }) {
  return ['navbar-link', isActive ? 'active' : ''].filter(Boolean).join(' ');
}

function mobileNavLinkClass({ isActive }: { isActive: boolean }) {
  return ['navbar-mobile-link', isActive ? 'active' : ''].filter(Boolean).join(' ');
}

export function Navbar() {
  const { t } = useTranslation();
  const auth = useAuth();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement | null>(null);
  const mobilePanelRef = useRef<HTMLDivElement | null>(null);

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
  }, [location.pathname]);

  // Close the mobile menu when the viewport crosses above the breakpoint.
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_BREAKPOINT_QUERY);
    function handler(e: MediaQueryListEvent) {
      if (e.matches) setMobileOpen(false);
    }
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Escape + outside-click dismissal for the mobile panel.
  useEffect(() => {
    if (!mobileOpen) return;
    function handleKeyDown(e: globalThis.KeyboardEvent) {
      if (e.key === 'Escape') {
        setMobileOpen(false);
        hamburgerRef.current?.focus();
      }
    }
    function handleMouseDown(e: globalThis.MouseEvent) {
      const t = e.target as Node;
      if (
        !mobilePanelRef.current?.contains(t) &&
        !hamburgerRef.current?.contains(t)
      ) {
        setMobileOpen(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [mobileOpen]);

  // When the mobile menu opens, move focus into its first focusable child.
  useEffect(() => {
    if (!mobileOpen) return;
    const first = mobilePanelRef.current?.querySelector<HTMLElement>(
      'a, button, [tabindex]:not([tabindex="-1"])',
    );
    first?.focus();
  }, [mobileOpen]);

  const toggleMobile = useCallback(() => setMobileOpen((v) => !v), []);

  // Loading: wordmark only — no hamburger, no auth controls.
  if (auth.status === 'loading') {
    return (
      <nav aria-label={t('nav.primary')} className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="navbar-brand">
            <img src={logoUrl} alt="" className="navbar-brand-mark" aria-hidden="true" />
            {t('common.appName')}
          </Link>
        </div>
      </nav>
    );
  }

  const isAuth = auth.status === 'authenticated';
  const isAdmin = isAuth && auth.isAdmin;

  return (
    <nav aria-label={t('nav.primary')} className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <img src={logoUrl} alt="" className="navbar-brand-mark" aria-hidden="true" />
          {t('common.appName')}
        </Link>

        {isAuth ? (
          <div className="navbar-nav navbar-desktop-only">
            {/* Your signed-in destinations go here. */}
            {isAdmin && (
              <NavLink to="/admin" className={navLinkClass}>
                {t('nav.admin')}
              </NavLink>
            )}
          </div>
        ) : null}

        <div className="navbar-spacer" />

        <div className="navbar-desktop-only navbar-right">
          {/* Outside the auth ternary: one instance, both signed-in and
              signed-out states. */}
          <LocaleToggle />
          {isAuth ? (
            <>
              <Link to="/profile" className="navbar-profile-link">
                <svg
                  className="navbar-profile-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
                <span className="navbar-profile-name">
                  {truncate(auth.user?.displayName || auth.user?.email || t('nav.account'), 20)}
                </span>
              </Link>
              <Button
                variant="secondary"
                size="small"
                onClick={() => {
                  void auth.signOut();
                }}
              >
                {t('nav.signOut')}
              </Button>
            </>
          ) : (
            <>
              <Link to="/signin" className="navbar-link">
                {t('nav.signIn')}
              </Link>
              {/* A link styled as a button, not a <Button> inside a <Link>: a
                  button nested in an anchor is invalid HTML and is announced
                  as two controls. */}
              <Link to="/signup" className="navbar-cta btn btn-primary btn-small">
                {t('nav.signUp')}
              </Link>
            </>
          )}
        </div>

        <button
          ref={hamburgerRef}
          type="button"
          className="navbar-hamburger navbar-mobile-only"
          aria-haspopup="dialog"
          aria-expanded={mobileOpen}
          aria-controls="navbar-mobile-menu"
          aria-label={mobileOpen ? t('nav.closeMenu') : t('nav.openMenu')}
          onClick={toggleMobile}
        >
          <span className="navbar-hamburger-icon" aria-hidden="true">
            {mobileOpen ? '✕' : '☰'}
          </span>
        </button>
      </div>

      {mobileOpen && (
        <div
          ref={mobilePanelRef}
          id="navbar-mobile-menu"
          role="dialog"
          aria-modal="false"
          aria-label={t('nav.primary')}
          className="navbar-mobile-menu"
        >
          {isAuth ? (
            <ul className="navbar-mobile-list">
              {isAdmin && (
                <li>
                  <NavLink to="/admin" className={mobileNavLinkClass}>
                    {t('nav.admin')}
                  </NavLink>
                </li>
              )}
              <li>
                <NavLink to="/profile" className={mobileNavLinkClass}>
                  {t('nav.profile')}
                </NavLink>
              </li>
              <li>
                <button
                  type="button"
                  className="navbar-mobile-link navbar-mobile-signout"
                  onClick={async (e: MouseEvent<HTMLButtonElement>) => {
                    e.preventDefault();
                    setMobileOpen(false);
                    await auth.signOut();
                  }}
                >
                  {t('nav.signOut')}
                </button>
              </li>
            </ul>
          ) : (
            <ul className="navbar-mobile-list">
              <li>
                <Link to="/signin" className="navbar-mobile-link">
                  {t('nav.signIn')}
                </Link>
              </li>
              <li>
                <Link to="/signup" className="navbar-mobile-link navbar-mobile-link-primary">
                  {t('nav.signUp')}
                </Link>
              </li>
            </ul>
          )}
          <div className="navbar-mobile-locale">
            <LocaleToggle />
          </div>
        </div>
      )}
    </nav>
  );
}
