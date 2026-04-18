import { Outlet } from "react-router-dom";
import { MainNavigation } from "../navigation/MainNavigation";

export function DashboardLayout() {
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
    </div>
  );
}
