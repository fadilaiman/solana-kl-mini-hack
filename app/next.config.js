/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Next.js dev server runs behind nginx/rproxy; trust forwarded host
  experimental: {
    serverActions: { allowedOrigins: ['solemandate.saasku.my', 'localhost:14020', 'localhost:14022'] },
  },
};

module.exports = nextConfig;
