import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },

  allowedDevOrigins: ["21.0.3.139", "localhost", "127.0.0.1", "preview-chat-0677f85a-8f7b-4ac4-a293-d0bb10e0d475.space-z.ai"],

  serverExternalPackages: ['pg', 'nodemailer'],

  // Silence "multiple lockfiles" Turbopack warning
  turbopack: {
    root: process.cwd(),
  },

  // Tree-shake large barrel-export libraries so only the icons/components
  // actually used end up in the client bundle.


  images: {
    formats: ["image/avif", "image/webp"],
    // Restrict remote image sources to trusted domains only.
    remotePatterns: [
      { protocol: "https", hostname: "abwcurious.com" },
      { protocol: "https", hostname: "**.abwcurious.com" },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: "inline",
  },

  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "X-XSS-Protection", value: "1; mode=block" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        {
          key: "Content-Security-Policy",
          value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://hcaptcha.com https://*.hcaptcha.com https://pagead2.googlesyndication.com https://maps.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https://*.supabase.co https://hcaptcha.com https://*.hcaptcha.com https://api.mistral.ai https://maps.googleapis.com; frame-src https://hcaptcha.com https://*.hcaptcha.com https://www.youtube.com https://youtube.com https://*.google.com https://www.google.com https://maps.google.com; worker-src 'self' blob:; object-src 'none';"
        },
      ],
    },
  ],
};

export default nextConfig;
