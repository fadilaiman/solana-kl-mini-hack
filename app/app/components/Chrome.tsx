'use client';

import { useState } from 'react';
import Link from 'next/link';

/** Sol(purple) · e(gradient) · Mandate(gold) wordmark */
export function Wordmark({ small = false }: { small?: boolean }) {
  return (
    <span className={`wordmark${small ? ' sm' : ''}`}>
      <span className="w-sol">Sol</span>
      <span className="w-e">e</span>
      <span className="w-mandate">Mandate</span>
    </span>
  );
}

type NavKey = 'dashboard' | 'create' | 'activity';

const LINKS: { key: NavKey; label: string; href: string; icon: string }[] = [
  { key: 'create', label: 'Create Mandate', href: '/', icon: 'add_circle' },
  { key: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
  { key: 'activity', label: 'Activity', href: '/activity', icon: 'history' },
];

export function TopNav({ active, cta }: { active?: NavKey; cta?: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="topnav">
        <div className="topnav-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="hamburger" aria-label="Open menu" onClick={() => setOpen(true)}>
              <span className="material-symbols-outlined">menu</span>
            </button>
            <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
              <Wordmark />
            </Link>
          </div>
          <div className="nav-links">
            {LINKS.map((l) => (
              <Link key={l.key} href={l.href} className={active === l.key ? 'active' : ''}>
                {l.label}
              </Link>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {cta ?? (
              <Link href="/dashboard" className="btn btn-primary">
                Connect Wallet
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* animated mobile drawer */}
      <div className={`drawer-backdrop${open ? ' open' : ''}`} onClick={() => setOpen(false)} />
      <aside className={`drawer${open ? ' open' : ''}`} aria-hidden={!open}>
        <div className="flex-between" style={{ marginBottom: 12 }}>
          <Wordmark small />
          <button className="icon-btn" aria-label="Close menu" onClick={() => setOpen(false)}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        {LINKS.map((l, i) => (
          <Link
            key={l.key}
            href={l.href}
            onClick={() => setOpen(false)}
            className={`nav-item${active === l.key ? ' active' : ''}`}
            style={{ ['--i' as string]: i + 1, animationDelay: `${(i + 1) * 60}ms` }}
          >
            <span className="material-symbols-outlined">{l.icon}</span>
            {l.label}
          </Link>
        ))}
        <Link href="/dashboard" onClick={() => setOpen(false)} className="btn btn-primary btn-block" style={{ marginTop: 'auto' }}>
          Connect Wallet
        </Link>
      </aside>
    </>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="inner">
        <div style={{ textAlign: 'center' }}>
          <Wordmark small />
          <p className="footer-copy">© {new Date().getFullYear()} SoleMandate. Powered by Solana.</p>
        </div>
        <div className="links">
          <a href="#">Terms</a>
          <a href="#">Privacy</a>
          <a href="#">Docs</a>
          <a href="#">Support</a>
        </div>
      </div>
    </footer>
  );
}
