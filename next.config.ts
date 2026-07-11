import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },

  allowedDevOrigins: ["21.0.3.139", "localhost", "127.0.0.1"],

  serverExternalPackages: ['pg', 'nodemailer'],

  // Tree-shake large barrel-export libraries so only the icons/components
  // actually used end up in the client bundle.
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "recharts",
      "date-fns",
      "@radix-ui/react-progress",
      "@radix-ui/react-avatar",
      "@radix-ui/react-toggle",
      "@radix-ui/react-slot",
      "@radix-ui/react-menubar",
      "@radix-ui/react-aspect-ratio",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-accordion",
      "@radix-ui/react-hover-card",
      "@radix-ui/react-label",
      "@radix-ui/react-slider",
      "@radix-ui/react-tooltip",
      "@radix-ui/react-navigation-menu",
      "@radix-ui/react-select",
      "@radix-ui/react-scroll-area",
      "@radix-ui/react-toggle-group",
      "@radix-ui/react-switch",
      "@radix-ui/react-dialog",
      "@radix-ui/react-tabs",
      "@radix-ui/react-separator",
      "@radix-ui/react-alert-dialog",
      "@radix-ui/react-popover",
      "@radix-ui/react-radio-group",
      "@radix-ui/react-context-menu",
      "@radix-ui/react-collapsible",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-toast",
    ],
  },

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
          value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://hcaptcha.com https://*.hcaptcha.com https://pagead2.googlesyndication.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https://*.supabase.co https://hcaptcha.com https://*.hcaptcha.com https://api.mistral.ai; frame-src https://hcaptcha.com https://*.hcaptcha.com https://www.youtube.com https://youtube.com https://*.google.com; worker-src 'self' blob:; object-src 'none';"
        },
      ],
    },
  ],
};

export default nextConfig;
