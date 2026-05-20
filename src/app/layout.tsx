import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, Poppins, Sora } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

// JSON-LD structured data for Organization
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ABWcurious Pvt Ltd",
  url: "https://www.abwcurious.com",
  logo: "https://www.abwcurious.com/logo.png",
  description:
    "Empowering businesses through cybersecurity, AI, education, software innovation, and scalable digital transformation.",
  foundingDate: "2020",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    email: "info@abwcurious.com",
    availableLanguage: ["English"],
  },
  sameAs: [
    "https://linkedin.com/company/abwcurious",
    "https://twitter.com/abwcurious",
    "https://github.com/orgs/ABWcurious-Pvt-Ltd",
    "https://www.instagram.com/abwcurious",
    "https://www.youtube.com/@ABWcurious",
    "https://www.facebook.com/people/ABWcurious/61579618321899/",
  ],
  areaServed: "Worldwide",
  serviceType: [
    "Cybersecurity",
    "Artificial Intelligence",
    "Software Development",
    "Digital Transformation",
    "Education Technology",
  ],
};

// JSON-LD for WebSite (enables sitelinks search box)
const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "ABWcurious Pvt Ltd",
  url: "https://www.abwcurious.com",
  description:
    "Shaping A Better World With Technology — cybersecurity, AI, education, software innovation, and scalable digital transformation.",
  publisher: {
    "@type": "Organization",
    name: "ABWcurious Pvt Ltd",
    logo: {
      "@type": "ImageObject",
      url: "https://www.abwcurious.com/logo.png",
    },
  },
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.abwcurious.com"),
  title: {
    default: "ABWcurious Pvt Ltd | Shaping A Better World With Technology",
    template: "%s | ABWcurious Pvt Ltd",
  },
  description:
    "Empowering businesses through cybersecurity, AI, education, software innovation, and scalable digital transformation. We build secure, intelligent solutions that shape a better world.",
  keywords: [
    "cybersecurity",
    "AI",
    "artificial intelligence",
    "software development",
    "education",
    "digital transformation",
    "ABWcurious",
    "machine learning",
    "cloud security",
    "penetration testing",
    "web development",
    "mobile app development",
    "IT consulting",
    "edtech",
    "SaaS",
    "data analytics",
    "DevOps",
    "enterprise solutions",
    "technology company",
    "innovation",
  ],
  authors: [{ name: "ABWcurious Pvt Ltd", url: "https://abwcurious.com" }],
  creator: "ABWcurious Pvt Ltd",
  publisher: "ABWcurious Pvt Ltd",
  verification: {
    google: "GOOGLE_SEARCH_CONSOLE_VERIFICATION_CODE",
  },
  icons: {
    icon: "/logo.png",
  },
  alternates: {
    canonical: "https://www.abwcurious.com",
  },
  openGraph: {
    title: "ABWcurious Pvt Ltd | Shaping A Better World With Technology",
    description:
      "Empowering businesses through cybersecurity, AI, education, software innovation, and scalable digital transformation.",
    url: "https://www.abwcurious.com",
    siteName: "ABWcurious Pvt Ltd",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "ABWcurious Pvt Ltd - Shaping A Better World With Technology",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ABWcurious Pvt Ltd | Shaping A Better World With Technology",
    description:
      "Empowering businesses through cybersecurity, AI, education, software innovation, and scalable digital transformation.",
    images: ["/logo.png"],
    creator: "@abwcurious",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "technology",
};

export const viewport: Viewport = {
  themeColor: "#00f0ff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#00f0ff" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd),
          }}
        />

      </head>
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${poppins.variable} ${sora.variable} antialiased bg-background text-foreground`}
        style={{ fontFamily: "var(--font-poppins)" }}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {/* Skip to content link for keyboard users */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-primary focus:text-primary-foreground focus:text-sm focus:font-semibold focus:shadow-lg focus:outline-none"
          >
            Skip to main content
          </a>
          <div className="min-h-screen flex flex-col">
            {children}
          </div>
          <Toaster />
          <div className="noise-overlay" />
        </ThemeProvider>
      </body>
    </html>
  );
}
