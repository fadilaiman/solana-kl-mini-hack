'use client';

import { useEffect } from 'react';
import { TopNav, Footer } from '@/app/components/Chrome';
import { ErrorState } from '@/app/components/States';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Surface the failure for debugging; the user sees a friendly card.
    console.error(error);
  }, [error]);

  return (
    <>
      <TopNav />
      <main className="container" style={{ minHeight: '60vh' }}>
        <div className="glass-card fade-up" style={{ maxWidth: 560, margin: '0 auto' }}>
          <ErrorState
            title="This page hit a snag"
            message={error.message || 'An unexpected error occurred while rendering this view.'}
            onRetry={reset}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
