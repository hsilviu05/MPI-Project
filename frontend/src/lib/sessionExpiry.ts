const SESSION_EXPIRED_EVENT = "portfolio-tracker:session-expired";

export function notifySessionExpired(): void {
  window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
}

export function onSessionExpired(handler: () => void): () => void {
  const wrapped = () => handler();
  window.addEventListener(SESSION_EXPIRED_EVENT, wrapped);
  return () => window.removeEventListener(SESSION_EXPIRED_EVENT, wrapped);
}
