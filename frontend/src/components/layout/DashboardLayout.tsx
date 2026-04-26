import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { onSessionExpired } from "../../lib/sessionExpiry";
import { MainNavigation } from "../navigation/MainNavigation";

const PAGE_TITLES: Record<string, string> = {
  "/": "Overview",
  "/portfolios": "Portfolios",
  "/assets": "Assets",
  "/settings": "Settings",
};

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith("/portfolios/") && pathname.endsWith("/holdings")) return "Holdings";
  return "Dashboard";
}

export function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showSessionPopup, setShowSessionPopup] = useState(false);

  useEffect(() => {
    return onSessionExpired(() => {
      setShowSessionPopup(true);
      navigate("/login");
    });
  }, [navigate]);

  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="brand">
          <span className="brand-icon" aria-hidden>◈</span>
          <div>
            <h1>Portfolio Tracker</h1>
            <p>Investment Dashboard</p>
          </div>
        </div>
        <MainNavigation />
      </aside>

      <div className="dashboard-content">
        <header className="dashboard-header">
          <h2>{pageTitle}</h2>
        </header>
        <main className="dashboard-main">
          <Outlet />
        </main>
      </div>

      {showSessionPopup && (
        <div className="session-modal-backdrop" role="presentation">
          <div className="session-modal" role="alertdialog" aria-labelledby="session-expired-title">
            <h3 id="session-expired-title">Session expired</h3>
            <p>You were signed out automatically. Please log in again.</p>
            <button type="button" className="btn-primary" onClick={() => setShowSessionPopup(false)}>
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
