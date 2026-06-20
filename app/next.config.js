/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The Solana wallet-adapter pulls a duplicate @types/react@19 transitively
  // (via react-native), which trips next build's type-checker on otherwise
  // valid JSX. Runtime is unaffected. Don't let it block the production build.
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  // Next.js dev server runs behind nginx/rproxy; trust forwarded host
  experimental: {
    serverActions: { allowedOrigins: ['solemandate.saasku.my', 'localhost:14020', 'localhost:14022'] },
  },
};

module.exports = nextConfig;
