import { useEffect, useState } from "react";
import { ErrorBanner, LoadingNotice } from "../components/feedback/PageStates";
import { fetchHealth } from "../services/api";
import type { HealthResponse } from "../types/health";

type RequestStatus = "idle" | "loading" | "success" | "error";

export function HomePage() {
  const [requestStatus, setRequestStatus] = useState<RequestStatus>("idle");
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const checkHealth = async () => {
      try {
        setRequestStatus("loading");
        const result = await fetchHealth();
        setHealth(result);
        setRequestStatus("success");
      } catch (error) {
        setRequestStatus("error");
        setErrorMessage(
          error instanceof Error ? error.message : "Unknown connection error",
        );
      }
    };

    void checkHealth();
  }, []);

  return (
    <section className="card">
      <h3>Overview</h3>
      <p>
        Acesta este dashboard-ul principal. De aici poti merge catre portofolii,
        active si setari.
      </p>

      <div className="status">
        <strong>Backend status</strong>
        {requestStatus === "loading" && (
          <LoadingNotice label="Verific conexiunea cu serverul..." className="status-loading" />
        )}
        {requestStatus === "success" && (
          <p className="status-ok muted">
            Conexiune OK — status: <code>{health?.status}</code>, debug:{" "}
            <code>{String(health?.debug)}</code>
          </p>
        )}
        {requestStatus === "error" && (
          <ErrorBanner
            title="Nu s-a putut contacta backend-ul"
            message={errorMessage || "Verifica daca API-ul ruleaza si URL-ul din .env (VITE_API_BASE_URL)."}
          />
        )}
      </div>
    </section>
  );
}
