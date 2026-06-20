'use client';

/** Reusable empty / error / inline-error states with optional retry. */

export function EmptyState({ icon = 'inbox', title, hint }: { icon?: string; title: string; hint?: string }) {
  return (
    <div className="state-box fade-up">
      <div className="state-ico tint-purple"><span className="material-symbols-outlined">{icon}</span></div>
      <h3 className="card-title" style={{ margin: 0, fontSize: 18 }}>{title}</h3>
      {hint && <p className="muted" style={{ maxWidth: 420 }}>{hint}</p>}
    </div>
  );
}

export function ErrorState({ title = 'Something went wrong', message, onRetry, retrying }: {
  title?: string; message?: string; onRetry?: () => void; retrying?: boolean;
}) {
  return (
    <div className="state-box fade-up">
      <div className="state-ico" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--error)' }}>
        <span className="material-symbols-outlined">error</span>
      </div>
      <h3 className="card-title" style={{ margin: 0, fontSize: 18 }}>{title}</h3>
      {message && <p className="muted" style={{ maxWidth: 460 }}>{message}</p>}
      {onRetry && (
        <button className="secondary" style={{ width: 'auto', marginTop: 8 }} onClick={onRetry} disabled={retrying}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, animation: retrying ? 'spin .7s linear infinite' : 'none' }}>refresh</span>
          {retrying ? 'Retrying…' : 'Try again'}
        </button>
      )}
    </div>
  );
}

/** Compact error banner with inline retry, for the top of a populated view. */
export function InlineError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="inline-error">
      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>warning</span>
      <span style={{ flex: 1 }}>{message}</span>
      {onRetry && (
        <button className="link-btn" style={{ color: 'var(--error)' }} onClick={onRetry}>Retry</button>
      )}
    </div>
  );
}
