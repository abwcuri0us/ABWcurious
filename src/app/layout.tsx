import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import LoaderWrapper from "@/components/ui/LoaderWrapper";
import SpaceBackground from "@/components/ui/SpaceBackground";
import Chatbot from "@/components/ui/Chatbot";
import Script from "next/script";
import { SpeedInsights } from "@vercel/speed-insights/next"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
});

/* ─────────────────────────────────────────────
   GLOBAL SEO METADATA
───────────────────────────────────────────── */
export const metadata: Metadata = {
  metadataBase: new URL("https://www.abwcurious.com"),

  title: {
    default: "ABWcurious | EdTech · IT Support · Cybersecurity · AI & AR Solutions",
    template: "%s | ABWcurious",
  },
  description:
    "ABWcurious is a leading EdTech & IT services company offering cybersecurity, web & app development, AI/ML, AR/VR technologies, digital marketing, and hands-on student training programs in Navi Mumbai, India.",
  keywords: [
    "ABWcurious",
    "ABW",
    "ABW curious",
    "ABWcurious.com",
    "ABWcurious.in",
    "ABWcurious Internship",
    "ABWcurious Cyber Intelligence",
    "ABWcurious Web Development",
    "ABWcurious App Development",
    "ABWcurious Digital Marketing",
    "ABWcurious AI & AR Solutions",
    "EdTech",
    "AR Technologies",
    "Augmented Reality",
    "VR Technologies",
    "AI Machine Learning",
    "Cybersecurity",
    "IT Support",
    "Web Development",
    "App Development",
    "Digital Marketing",
    "Online Learning",
    "Student Training",
    "Internship",
    "Tech Education",
    "Navi Mumbai",
    "Maharashtra",
    "India",
    "STEM Education",
    "Software Development",
    "Cloud Computing",
    "Data Science",
    "Full Stack Development",
    "Tech Startup India",
  ],
  authors: [{ name: "ABWcurious", url: "https://www.abwcurious.com" }],
  creator: "ABWcurious",
  publisher: "ABWcurious",
  category: "Technology, Education",
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
  alternates: {
    canonical: "https://www.abwcurious.com",
  },
  openGraph: {
    title: "ABWcurious | EdTech · IT Support · Cybersecurity · AI & AR Solutions",
    description:
      "Empowering businesses & students with cutting-edge IT services, cybersecurity, AI/ML, AR/VR, web development, and interactive training programs.",
    url: "https://www.abwcurious.com",
    siteName: "ABWcurious",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/images/logo.png",
        width: 1200,
        height: 630,
        alt: "ABWcurious - EdTech & IT Solutions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@abwcurious",
    creator: "@abwcurious",
    title: "ABWcurious | EdTech · Cybersecurity · AI & AR Solutions",
    description:
      "Empowering businesses & students with cutting-edge IT services, AI/ML, AR technologies & training programs.",
    images: ["/images/logo.png"],
  },
  verification: {
    google: "google-site-verification",   // replace with actual token once available
  },
  other: {
    "google-adsense-account": "ca-pub-4170752809389671",
  },
};

/* ─────────────────────────────────────────────
   ROOT LAYOUT
───────────────────────────────────────────── */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Favicon */}
        <link rel="icon" type="image/png" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />

        {/* Viewport */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#00f2fe" />
        <meta name="color-scheme" content="dark" />

        {/* Additional SEO */}
        <meta name="language" content="English" />
        <meta name="geo.region" content="IN-MH" />
        <meta name="geo.placename" content="Navi Mumbai" />
        <meta name="geo.position" content="19.0330;73.0297" />
        <meta name="ICBM" content="19.0330, 73.0297" />
        <meta name="classification" content="Education, Technology, Business" />
        <meta name="coverage" content="Worldwide" />
        <meta name="target" content="all" />
        <meta name="HandheldFriendly" content="True" />
        <meta name="MobileOptimized" content="320" />

        {/* Google Fonts — preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;600&family=Nunito:wght@600;700;800&display=swap"
          rel="stylesheet"
        />

        {/* Icon libraries — loaded via Script after interaction to not block first paint */}
        {/* Bootstrap Icons are critical for UI so kept in head */}
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css"
          rel="stylesheet"
        />
        <link href="/css/bootstrap.min.css" rel="stylesheet" />
        <link href="/css/style.css" rel="stylesheet" />

        {/* ── Google AdSense ── */}
        <Script
          strategy="lazyOnload"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4170752809389671"
          crossOrigin="anonymous"
        />

        {/* Structured Data — Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "ABWcurious",
              url: "https://www.abwcurious.com",
              logo: "https://www.abwcurious.com/images/logo.png",
              description:
                "ABWcurious is a leading EdTech & IT company offering cybersecurity, web development, AI/ML, AR/VR, digital marketing, and student training programs.",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Vashi",
                addressLocality: "Navi Mumbai",
                addressRegion: "Maharashtra",
                postalCode: "400703",
                addressCountry: "IN",
              },
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+91-8108915402",
                contactType: "customer support",
                email: "info@abwcurious.com",
                availableLanguage: ["English", "Hindi"],
              },
              sameAs: [
                "https://www.facebook.com/people/ABWcurious/61579618321899/",
                "https://www.instagram.com/abwcurious",
                "https://x.com/abwcurious",
                "https://www.linkedin.com/company/abwcurious",
                "https://www.youtube.com/@ABWcurious",
                "https://github.com/abwcuri0us",
              ],
            }),
          }}
        />

        {/* Structured Data — Website with SearchAction */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "ABWcurious",
              url: "https://www.abwcurious.com",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://www.abwcurious.com/services?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>


      <body className={`${inter.className} theme-technology`}>
        <SpaceBackground />
        <LoaderWrapper>
          <Navbar />
          <main id="main-content">{children}</main>
          <Footer />
          <Chatbot />
        </LoaderWrapper>

        {/* ── Third-party scripts — deferred for performance ── */}
        <Script
          src="https://code.jquery.com/jquery-3.4.1.min.js"
          strategy="lazyOnload"
          crossOrigin="anonymous"
        />
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0/dist/js/bootstrap.bundle.min.js"
          strategy="lazyOnload"
          crossOrigin="anonymous"
        />
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/wow/1.1.2/wow.min.js"
          strategy="lazyOnload"
          crossOrigin="anonymous"
        />
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/jquery-easing/1.4.1/jquery.easing.min.js"
          strategy="lazyOnload"
          crossOrigin="anonymous"
        />
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/waypoints/4.0.1/jquery.waypoints.min.js"
          strategy="lazyOnload"
          crossOrigin="anonymous"
        />
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/owl.carousel.min.js"
          strategy="lazyOnload"
          crossOrigin="anonymous"
        />
        <Script src="/js/main.js" strategy="lazyOnload" />

        {/* ── Cosmetic CSS — injected lazily after page load, no render blocking ── */}
        <Script id="load-fa-css" strategy="lazyOnload">{`
          var fa = document.createElement('link');
          fa.rel = 'stylesheet';
          fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.10.0/css/all.min.css';
          fa.crossOrigin = 'anonymous';
          document.head.appendChild(fa);
          var ac = document.createElement('link');
          ac.rel = 'stylesheet';
          ac.href = 'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css';
          ac.crossOrigin = 'anonymous';
          document.head.appendChild(ac);
          var oc = document.createElement('link');
          oc.rel = 'stylesheet';
          oc.href = 'https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/assets/owl.carousel.min.css';
          document.head.appendChild(oc);
        `}</Script>
      </body>
    </html>
  );
}
