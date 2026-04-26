import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="auth-shell">
      <section className="auth-card">
        <div className="auth-brand">
          <span className="auth-brand-icon" aria-hidden>◈</span>
          <div>
            <h1>Portfolio Tracker</h1>
            <p>Manage your investments in one place.</p>
          </div>
        </div>
        <Outlet />
      </section>
    </div>
  );
}
