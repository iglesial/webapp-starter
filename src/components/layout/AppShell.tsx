import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import './AppShell.css';

export function AppShell() {
  return (
    <div className="app-shell">
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
}
