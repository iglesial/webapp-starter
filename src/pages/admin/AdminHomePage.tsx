import { Link } from 'react-router-dom';
import { Card } from '../../components/core/Card';
import './AdminHomePage.css';

// The admin back-office is English-only by convention (see CLAUDE.md): no
// useTranslation() under pages/admin/ or components/admin/.

export interface AdminSection {
  to: string;
  title: string;
  description: string;
}

// One card per admin area. Add an entry here when you add a nested route
// under /admin in App.tsx.
const SECTIONS: AdminSection[] = [];

export function AdminHomePage({ sections = SECTIONS }: { sections?: AdminSection[] }) {
  return (
    <main className="admin-home-page">
      <h1 className="admin-home-title">Admin</h1>
      {sections.length === 0 ? (
        <p className="admin-home-empty">
          No admin sections yet. Add one to <code>SECTIONS</code> in{' '}
          <code>src/pages/admin/AdminHomePage.tsx</code> and a nested route under{' '}
          <code>/admin</code> in <code>App.tsx</code>.
        </p>
      ) : (
        <div className="admin-home-grid">
          {sections.map((section) => (
            <Link key={section.to} to={section.to} className="admin-home-link">
              <Card hoverable>
                <h2 className="admin-home-card-title">{section.title}</h2>
                <p className="admin-home-card-desc">{section.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
