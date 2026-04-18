import type { PropsWithChildren } from "react";

export function BaseLayout({ children }: PropsWithChildren) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Portfolio Tracker</h1>
        <p>Frontend React + Vite conectat la backendul FastAPI.</p>
      </header>
      <main className="app-main">{children}</main>
    </div>
  );
}
