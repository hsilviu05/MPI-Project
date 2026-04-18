import { useEffect, useState } from "react";
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
      <h2>Base Page</h2>
      <p>
        Aplicatia frontend ruleaza. Acesta este punctul de plecare pentru
        ecranele de autentificare si portofoliu.
      </p>

      <div className="status">
        <strong>Backend status:</strong>
        {requestStatus === "loading" && <span> Verific conexiunea...</span>}
        {requestStatus === "success" && (
          <span>
            {" "}
            OK ({health?.status}) | debug: {String(health?.debug)}
          </span>
        )}
        {requestStatus === "error" && <span> Eroare: {errorMessage}</span>}
      </div>
    </section>
  );
}
