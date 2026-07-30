import type { Metadata } from "next";
import { Space_Grotesk, Inter, Poppins, Sora } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

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
  url: "https://abwcurious.com",
  logo: "https://abwcurious.com/logo.svg",
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
  url: "https://abwcurious.com",
  description:
    "Shaping A Better World With Technology — cybersecurity, AI, education, software innovation, and scalable digital transformation.",
  publisher: {
    "@type": "Organization",
    name: "ABWcurious Pvt Ltd",
    logo: {
      "@type": "ImageObject",
      url: "https://abwcurious.com/logo.svg",
    },
  },
};

// JSON-LD for ProfessionalService
const professionalServiceJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "ABWcurious Pvt Ltd",
  image: "https://abwcurious.com/logo.svg",
  "@id": "https://abwcurious.com",
  url: "https://abwcurious.com",
  telephone: "+91-XXXXXXXXXX",
  priceRange: "$$",
  description:
    "Cybersecurity, AI, software development, education technology, and digital transformation services.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "ABWcurious HQ",
    addressLocality: "Bengaluru",
    addressRegion: "KA",
    postalCode: "560001",
    addressCountry: "IN",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 12.9716,
    longitude: 77.5946,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
  ],
  sameAs: [
    "https://linkedin.com/company/abwcurious",
    "https://twitter.com/abwcurious",
    "https://github.com/abwcurious",
  ],
  areaServed: "Worldwide",
  knowsAbout: [
    "Cybersecurity",
    "Artificial Intelligence",
    "Machine Learning",
    "Software Development",
    "Cloud Security",
    "Digital Transformation",
    "Education Technology",
    "Penetration Testing",
    "DevOps",
    "Data Analytics",
  ],
};

// JSON-LD for BreadcrumbList
const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://abwcurious.com",
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://abwcurious.com"),
  title: {
    default: "ABWcurious Pvt Ltd | Shaping A Better World With Technology",
    template: "%s | ABWcurious Pvt Ltd",
  },
  description:
    "Empowering businesses through cybersecurity, AI, education, software innovation, and scalable digital transformation. We build secure, intelligent solutions that shape a better world.",
  applicationName: "ABWcurious",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
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
    "managed security services",
    "SOC",
    "threat intelligence",
    "zero trust",
    "compliance",
    "ISO 27001",
    "GDPR",
    "genAI",
    "LLM integration",
    "RAG",
    "MLOps",
    "cloud migration",
    "microservices",
    "UI/UX design",
    "product engineering",
  ],
  authors: [{ name: "ABWcurious Pvt Ltd", url: "https://abwcurious.com" }],
  creator: "ABWcurious Pvt Ltd",
  publisher: "ABWcurious Pvt Ltd",
  verification: {
    google: "PCkBALMpAKHbfCOyXg6G9E7BqickqsM3eY8iA3bVZls",
    yandex: "99177fb36f89dc88",
  },
  icons: {
    icon: [
      { url: "/logo.svg", sizes: "any" },
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
    ],
    apple: [{ url: "/logo.svg", sizes: "180x180", type: "image/svg+xml" }],
    shortcut: ["/favicon.ico"],
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: "https://abwcurious.com",
    languages: {
      "en-US": "https://abwcurious.com",
      "en-IN": "https://abwcurious.com",
    },
  },
  openGraph: {
    title: "ABWcurious Pvt Ltd | Shaping A Better World With Technology",
    description:
      "Empowering businesses through cybersecurity, AI, education, software innovation, and scalable digital transformation.",
    url: "https://abwcurious.com",
    siteName: "ABWcurious Pvt Ltd",
    type: "website",
    locale: "en_US",
    alternateLocale: ["en_IN"],
    images: [
      {
        url: "/logo.svg",
        width: 1200,
        height: 630,
        alt: "ABWcurious Pvt Ltd - Shaping A Better World With Technology",
        type: "image/svg+xml",
      },
      {
        url: "/logo.svg",
        width: 1080,
        height: 1080,
        alt: "ABWcurious Pvt Ltd Logo",
        type: "image/svg+xml",
      },
    ],
    emails: ["info@abwcurious.com"],
    phoneNumbers: ["+91-XXXXXXXXXX"],
  },
  twitter: {
    card: "summary_large_image",
    site: "@abwcurious",
    title: "ABWcurious Pvt Ltd | Shaping A Better World With Technology",
    description:
      "Empowering businesses through cybersecurity, AI, education, software innovation, and scalable digital transformation.",
    images: ["/logo.svg"],
    creator: "@abwcurious",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "technology",
  appLinks: {
    web: {
      url: "https://abwcurious.com",
      should_fallback: true,
    },
  },
  assets: ["https://abwcurious.com/logo.svg"],
  other: {
    "geo.region": "IN-KA",
    "geo.placename": "Bengaluru",
    "geo.position": "12.9716;77.5946",
    ICBM: "12.9716, 77.5946",
    "theme-color": "#00f0ff",
    "color-scheme": "dark light",
    "msapplication-TileColor": "#00f0ff",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "ABWcurious",
    "mobile-web-app-capable": "yes",
    "format-detection": "telephone=no",
    "rating": "5",
    "review-count": "150+",
    "fb:app_id": "61579618321899",
    "fb:pages": "https://www.facebook.com/people/ABWcurious/61579618321899/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(professionalServiceJsonLd),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbJsonLd),
          }}
        />
        {process.env.NEXT_PUBLIC_GOOGLE_AD_CLIENT && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_GOOGLE_AD_CLIENT}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${poppins.variable} ${sora.variable} antialiased bg-background text-foreground`}
        style={{ fontFamily: "var(--font-poppins)" }}
        suppressHydrationWarning
      >
        <ClientLayout>{children}</ClientLayout>
        <Script
          id="service-worker-register"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(() => {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
