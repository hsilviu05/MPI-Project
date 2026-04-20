import { Link } from "react-router-dom";
import { EmptyState, ErrorBanner } from "../components/feedback/PageStates";
import { getAccessToken } from "../lib/authToken";

export function SettingsPage() {
  const token = getAccessToken();
  const needsAuth = !token;

  return (
    <div className="portfolios-page">
      <section className="card">
        <h3>Settings</h3>
        <p className="muted">
          Preferinte si cont. Autentificarea se gestioneaza prin token salvat local in browser.
        </p>

        {needsAuth ? (
          <>
            <ErrorBanner
              title="Nu esti autentificat"
              message="Setarile legate de cont vor fi disponibile dupa login."
            />
            <EmptyState
              title="Sesiune lipsa"
              description="Pentru o experienta completa, autentifica-te si revino aici."
            >
              <Link className="btn-link" to="/login">
                Mergi la login
              </Link>
            </EmptyState>
          </>
        ) : (
          <EmptyState
            title="Preferinte in dezvoltare"
            description="Momentan nu exista optiuni configurabile in UI. Esti autentificat; poti folosi portofoliile si activele din meniu."
          >
            <Link className="btn-link" to="/portfolios">
              Portofolii
            </Link>
            <Link className="btn-link" to="/assets">
              Assets
            </Link>
          </EmptyState>
        )}
      </section>
    </div>
  );
}
