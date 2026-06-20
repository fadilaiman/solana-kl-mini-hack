/** Branded full-screen loader with an orbiting dot + animated bar (CSS-only). */
export function LoadingScreen({ label = 'Loading SoleMandate' }: { label?: string }) {
  return (
    <div className="loading-screen">
      <div className="loader-logo">
        <span className="ring" />
        <span className="core" />
        <span className="dot" />
      </div>
      <div className="loader-bar"><span /></div>
      <div className="loader-text">{label}</div>
    </div>
  );
}

/** Small inline spinner for buttons / sections. */
export function Spinner({ large = false }: { large?: boolean }) {
  return <span className={`spinner${large ? ' lg' : ''}`} aria-label="loading" />;
}
