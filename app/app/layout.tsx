import type { Metadata } from 'next';
import './globals.css';
import ParticleField from '@/app/components/ParticleField';

export const metadata: Metadata = {
  title: 'SoleMandate — Automate your revenue on Solana',
  description: 'Non-custodial recurring payments and subscription mandates for the Solana ecosystem.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ParticleField />
        {children}
      </body>
    </html>
  );
}
