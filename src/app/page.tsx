"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import ParticleBackground from "@/components/ParticleBackground";
import AuroraBackground from "@/components/AuroraBackground";
import FloatingShapes from "@/components/FloatingShapes";
// CursorGlow removed per request
import Preloader from "@/components/Preloader";
import HeroSection from "@/components/sections/HeroSection";
import AboutSection from "@/components/sections/AboutSection";
import Footer from "@/components/sections/Footer";
import { useNavigation } from "@/contexts/NavigationContext";

/* ------------------------------------------------------------------ */
/*  ScrollProgress - lazy loaded (client-only, GPU-friendly)           */
/*  Defers the scroll-progress indicator (and its framer-motion        */
/*  useScroll/useSpring hooks) out of the initial SSR bundle.          */
/* ------------------------------------------------------------------ */
const ScrollProgress = dynamic(() => import("@/components/ScrollProgress"), {
  ssr: false,
  loading: () => null,
});

/* ------------------------------------------------------------------ */
/*  AI Chatbot - lazy loaded (below-the-fold floating widget)          */
/*  Defers framer-motion + AIAvatar SVG out of the initial bundle.     */
/* ------------------------------------------------------------------ */
const AIChatbot = dynamic(() => import("@/components/AIChatbot"), {
  ssr: false,
  loading: () => null,
});

/* ------------------------------------------------------------------ */
/*  Section Skeleton for lazy-loaded sections                          */
/* ------------------------------------------------------------------ */
function SectionSkeleton() {
  return (
    <div className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Title placeholder */}
        <div className="flex flex-col items-center gap-3">
          <div className="h-4 w-24 rounded bg-foreground/5 animate-pulse" />
          <div className="h-8 w-72 rounded bg-foreground/5 animate-pulse" />
          <div className="h-5 w-96 max-w-full rounded bg-foreground/5 animate-pulse" />
        </div>
        {/* Cards placeholder */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-40 rounded-xl bg-foreground/5 animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Dynamic imports for below-fold sections                            */
/* ------------------------------------------------------------------ */
const BrochureSection = dynamic(
  () => import("@/components/sections/BrochureSection"),
  {
    loading: () => <SectionSkeleton />,
    ssr: false,
  }
);

const GovernmentRecognitionSection = dynamic(
  () => import("@/components/sections/GovernmentRecognitionSection"),
  {
    loading: () => <SectionSkeleton />,
    ssr: false,
  }
);

const ProductsSection = dynamic(
  () => import("@/components/sections/ProductsSection"),
  {
    loading: () => <SectionSkeleton />,
    ssr: false,
  }
);

const ServicesSection = dynamic(
  () => import("@/components/sections/ServicesSection"),
  {
    loading: () => <SectionSkeleton />,
    ssr: false,
  }
);

const CybersecuritySection = dynamic(
  () => import("@/components/sections/CybersecuritySection"),
  {
    loading: () => <SectionSkeleton />,
    ssr: false,
  }
);

const TechStackSection = dynamic(
  () => import("@/components/sections/TechStackSection"),
  {
    loading: () => <SectionSkeleton />,
    ssr: false,
  }
);

const WhyChooseUsSection = dynamic(
  () => import("@/components/sections/WhyChooseUsSection"),
  {
    loading: () => <SectionSkeleton />,
    ssr: false,
  }
);

const ContactSection = dynamic(
  () => import("@/components/sections/ContactSection"),
  {
    loading: () => <SectionSkeleton />,
    ssr: false,
  }
);

/* ------------------------------------------------------------------ */
/*  Dynamic imports for sub-pages                                      */
/* ------------------------------------------------------------------ */
const SolutionsPage = dynamic(
  () => import("@/components/pages/SolutionsPage"),
  {
    loading: () => <SectionSkeleton />,
    ssr: false,
  }
);

const StatusPage = dynamic(
  () => import("@/components/pages/StatusPage"),
  {
    loading: () => <SectionSkeleton />,
    ssr: false,
  }
);

const CareersPage = dynamic(
  () => import("@/components/pages/CareersPage"),
  {
    loading: () => <SectionSkeleton />,
    ssr: false,
  }
);

const EventsPage = dynamic(
  () => import("@/components/pages/EventsPage"),
  {
    loading: () => <SectionSkeleton />,
    ssr: false,
  }
);

const PartnershipPage = dynamic(
  () => import("@/components/pages/PartnershipPage"),
  {
    loading: () => <SectionSkeleton />,
    ssr: false,
  }
);

const SponsorshipPage = dynamic(
  () => import("@/components/pages/SponsorshipPage"),
  {
    loading: () => <SectionSkeleton />,
    ssr: false,
  }
);

const UserDashboardPage = dynamic(
  () => import("@/components/pages/UserDashboardPage"),
  {
    loading: () => <SectionSkeleton />,
    ssr: false,
  }
);

const ServiceDetailPage = dynamic(
  () => import("@/components/pages/ServiceDetailPage"),
  {
    loading: () => <SectionSkeleton />,
    ssr: false,
  }
);

/* ------------------------------------------------------------------ */
/*  Home Page Content                                                   */
/* ------------------------------------------------------------------ */
function HomePageContent() {
  return (
    <main className="relative flex-1">
      {/* Background effects layer */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
        <ParticleBackground />
      </div>

      {/* Aurora background effect - behind all sections */}
      <AuroraBackground intensity="medium" />

      {/* Floating geometric shapes - decorative */}
      <FloatingShapes />

      {/* Hero Section */}
      <HeroSection />

      {/* About Section */}
      <AboutSection />

      {/* Brochure Section - lazy loaded */}
      <BrochureSection />

      {/* Government Recognition Section - lazy loaded */}
      <GovernmentRecognitionSection />

      {/* Products Section - lazy loaded */}
      <ProductsSection />

      {/* Services Section - lazy loaded */}
      <ServicesSection />

      {/* Cybersecurity Section - lazy loaded */}
      <CybersecuritySection />

      {/* Tech Stack Section - lazy loaded */}
      <TechStackSection />

      {/* Why Choose Us Section - lazy loaded */}
      <WhyChooseUsSection />

      {/* Contact Section - lazy loaded */}
      <ContactSection />
    </main>
  );
}

/* ------------------------------------------------------------------ */
/*  Main App Component                                                  */
/* ------------------------------------------------------------------ */
export default function Home() {
  const [preloaderDone, setPreloaderDone] = useState(false);
  const { page } = useNavigation();
  const currentPage = page.currentPage;

  // Determine if we're on a sub-page or the home page
  const isSubPage = currentPage !== "home";

  return (
    <>
      {/* Preloader - only shows on first visit */}
      <Preloader onComplete={() => setPreloaderDone(true)} />

      {/* Scroll progress indicator - hide on dashboard */}
      {currentPage !== "dashboard" && <ScrollProgress />}

      {/* Cursor glow removed */}

      <Navbar />

      {isSubPage ? (
        /* Sub-page rendering */
        currentPage === "dashboard" ? (
          <UserDashboardPage />
        ) : (
          <main className="relative flex-1 pt-20 lg:pt-24">
            {currentPage === "solutions" && <SolutionsPage />}
            {currentPage === "status" && <StatusPage />}
            {currentPage === "careers" && <CareersPage />}
            {currentPage === "events" && <EventsPage />}
            {currentPage === "partnership" && <PartnershipPage />}
            {currentPage === "sponsorship" && <SponsorshipPage />}
            {currentPage === "service-detail" && <ServiceDetailPage />}
          </main>
        )
      ) : (
        /* Home page rendering */
        <HomePageContent />
      )}

      {/* Footer - hide on dashboard and service-detail pages */}
      {currentPage !== "dashboard" && currentPage !== "service-detail" && <Footer />}

      {/* AI Chatbot - hide on dashboard page */}
      {currentPage !== "dashboard" && <AIChatbot />}
    </>
  );
}
