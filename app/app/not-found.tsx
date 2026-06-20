import Link from 'next/link';
import { TopNav, Footer } from '@/app/components/Chrome';

export default function NotFound() {
  return (
    <>
      <TopNav />
      <main className="container" style={{ minHeight: '60vh' }}>
        <div className="glass-card center fade-up" style={{ maxWidth: 560, margin: '0 auto', padding: 56 }}>
          <div className="display-lg text-gradient animated" style={{ fontSize: 72 }}>404</div>
          <h2 className="card-title" style={{ marginTop: 8 }}>Mandate not found</h2>
          <p className="muted" style={{ maxWidth: 380, margin: '0 auto 24px' }}>
            The page or mandate you&apos;re looking for doesn&apos;t exist or may have been revoked.
          </p>
          <Link href="/" className="btn btn-primary" style={{ display: 'inline-flex' }}>
            <span className="material-symbols-outlined">home</span>
            Back to home
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
