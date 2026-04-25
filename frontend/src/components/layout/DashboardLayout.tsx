import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { onSessionExpired } from "../../lib/sessionExpiry";
import { MainNavigation } from "../navigation/MainNavigation";

export function DashboardLayout() {
  const navigate = useNavigate();
  const [showSessionPopup, setShowSessionPopup] = useState(false);

  useEffect(() => {
    return onSessionExpired(() => {
      setShowSessionPopup(true);
      navigate("/login");
    });
  }, [navigate]);

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="brand">
          <h1>Portfolio Tracker</h1>
          <p>Dashboard</p>
        </div>
        <MainNavigation />
      </aside>

      <div className="dashboard-content">
        <header className="dashboard-header">
          <h2>Aplicatie investitii</h2>
          <p>Navigheaza rapid intre modulele principale.</p>
        </header>
        <main className="dashboard-main">
          <Outlet />
        </main>
      </div>
      {showSessionPopup && (
        <div className="session-modal-backdrop" role="presentation">
          <div className="session-modal" role="alertdialog" aria-labelledby="session-expired-title">
            <h3 id="session-expired-title">Sesiune expirata</h3>
            <p>Ai fost deconectat automat. Te rugam sa te autentifici din nou.</p>
            <button type="button" className="btn-primary" onClick={() => setShowSessionPopup(false)}>
              Am inteles
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
