import type { PropsWithChildren } from "react";

type LoadingNoticeProps = {
  label?: string;
  className?: string;
};

export function LoadingNotice({
  label = "Se incarca datele...",
  className = "",
}: LoadingNoticeProps) {
  return (
    <div className={`loading-notice ${className}`.trim()} role="status" aria-live="polite">
      <span className="loading-spinner" aria-hidden />
      <span className="loading-notice-text">{label}</span>
    </div>
  );
}

type ErrorBannerProps = {
  message: string;
  title?: string;
};

export function ErrorBanner({ message, title = "Eroare" }: ErrorBannerProps) {
  if (!message) return null;
  return (
    <div className="error-banner" role="alert">
      <strong className="error-banner-title">{title}</strong>
      <p className="error-banner-body">{message}</p>
    </div>
  );
}

type EmptyStateProps = PropsWithChildren<{
  title: string;
  description?: string;
}>;

export function EmptyState({ title, description, children }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <h4 className="empty-state-title">{title}</h4>
      {description ? <p className="empty-state-desc">{description}</p> : null}
      {children ? <div className="empty-state-actions">{children}</div> : null}
    </div>
  );
}
