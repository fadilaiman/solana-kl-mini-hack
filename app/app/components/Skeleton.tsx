/** Shimmer skeleton primitives + composed loaders that mirror real layouts. */

export function Skeleton({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`skeleton ${className}`} style={style} />;
}

/** Rows for the home "Recent Mandates" / dashboard mandate lists. */
export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div style={{ padding: 'var(--gutter)' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex-between" style={{ padding: '14px 0', borderTop: i ? '1px solid rgba(255,255,255,0.05)' : 'none', animation: 'fadeIn .4s ease both', animationDelay: `${i * 60}ms` }}>
          <div style={{ flex: 1 }}>
            <Skeleton className="sk-line" style={{ width: '42%' }} />
            <Skeleton className="sk-line sm" style={{ width: '26%' }} />
          </div>
          <Skeleton className="sk-line" style={{ width: 90 }} />
          <Skeleton className="sk-pill" />
        </div>
      ))}
    </div>
  );
}

/** Three-up bento card skeletons. */
export function SkeletonBento({ cards = 3 }: { cards?: number }) {
  return (
    <div className="bento">
      {Array.from({ length: cards }).map((_, i) => (
        <div key={i} className="glass-card bento-card" style={{ animation: 'fadeUp .4s ease both', animationDelay: `${i * 80}ms` }}>
          <div className="flex-between" style={{ marginBottom: 18 }}>
            <Skeleton className="sk-line sm" style={{ width: 110 }} />
            <Skeleton className="sk-circle" style={{ width: 38, height: 38 }} />
          </div>
          <Skeleton className="sk-line lg" style={{ width: '55%', height: 30 }} />
          <Skeleton className="sk-line sm" style={{ width: '40%', marginTop: 14 }} />
        </div>
      ))}
    </div>
  );
}

/** Activity feed row skeletons. */
export function SkeletonFeed({ rows = 6 }: { rows?: number }) {
  return (
    <div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="feed-row" style={{ animationDelay: `${i * 60}ms` }}>
          <div style={{ gridColumn: 'span 3', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Skeleton className="sk-circle" style={{ width: 8, height: 8 }} />
            <Skeleton className="sk-line" style={{ width: 90 }} />
          </div>
          <Skeleton className="sk-line" style={{ gridColumn: 'span 3', width: 80 }} />
          <div style={{ gridColumn: 'span 1' }} />
          <Skeleton className="sk-line" style={{ gridColumn: 'span 3', width: 100 }} />
          <Skeleton className="sk-line sm" style={{ gridColumn: 'span 1', width: 50 }} />
          <Skeleton className="sk-circle" style={{ gridColumn: 'span 1', width: 18, height: 18, marginLeft: 'auto' }} />
        </div>
      ))}
    </div>
  );
}
