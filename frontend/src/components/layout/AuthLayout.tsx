import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="auth-shell">
      <section className="auth-card">
        <h1>Portfolio Tracker</h1>
        <p>Autentifica-te sau creeaza un cont nou.</p>
        <Outlet />
      </section>
    </div>
  );
}
