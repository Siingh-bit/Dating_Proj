import { useLocation, Outlet } from 'react-router-dom';
import TopBar from './TopBar';
import BottomNav from './BottomNav';
import './AppShell.css';

export default function AppShell() {
  const location = useLocation();
  const isChatRoute = location.pathname.includes('/chat/');

  return (
    <div className="app-shell">
      {!isChatRoute && <TopBar />}
      <main className={`app-content ${!isChatRoute ? 'has-topbar' : ''}`}>
        <Outlet />
      </main>
      {!isChatRoute && <BottomNav />}
    </div>
  );
}
