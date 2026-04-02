import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ── Turbopack root (top-level, NOT inside experimental) ──────────────────
  // Silences the "multiple lockfiles" workspace root warning in Next.js 16+
  turbopack: {
    root: __dirname,
  },

  // Gzip + Brotli response compression
  compress: true,

  // ── Image optimisation ────────────────────────────────────────────────────
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,            // 24 h client-side cache
    deviceSizes: [375, 640, 750, 828, 1080, 1200, 1920],
    imageSizes:  [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // ── Security & caching headers ────────────────────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options',  value: 'nosniff' },
          // SAMEORIGIN allows our internship iframe AND Google AdSense
          { key: 'X-Frame-Options',         value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection',        value: '1; mode=block' },
          { key: 'Referrer-Policy',         value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',      value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'X-DNS-Prefetch-Control',  value: 'on' },
          // Content-Security-Policy — allow Google Fonts, CDNs & AdSense
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://ep2.adtrafficquality.google https://code.jquery.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://www.google.com https://www.googletagmanager.com https://googleads.g.doubleclick.net",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com",
              "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https:",
              "frame-src 'self' https://docs.google.com https://ep2.adtrafficquality.google https://www.google.com https://googleads.g.doubleclick.net https://pagead2.googlesyndication.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
          // Strict-Transport-Security (HSTS) — enable once on HTTPS in prod
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
      // Static CSS — immutable 1-year cache
      {
        source: '/css/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      // Static JS — immutable 1-year cache
      {
        source: '/js/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      // Images — 7-day cache + stale-while-revalidate
      {
        source: '/images/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' }],
      },
      // Fonts — immutable 1-year cache
      {
        source: '/fonts/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },

  // ── Permanent SEO redirects ───────────────────────────────────────────────
  async redirects() {
    return [
      { source: '/security',              destination: '/cyber-intelligence', permanent: true },
      { source: '/services/cybersecurity',destination: '/cyber-intelligence', permanent: true },
      { source: '/join',                  destination: '/join-now',           permanent: true },
    ];
  },
};

export default nextConfig;
