"use client";

import dynamic from "next/dynamic";
import ParticleBackground from "@/components/ParticleBackground";
import AuroraBackground from "@/components/AuroraBackground";
import FloatingShapes from "@/components/FloatingShapes";
import CursorGlow from "@/components/CursorGlow";
import ScrollProgress from "@/components/ScrollProgress";
import Preloader from "@/components/Preloader";
import HeroSection from "@/components/sections/HeroSection";
import Footer from "@/components/sections/Footer";

// Dynamic imports for client-only components to prevent hydration mismatch
const Navbar = dynamic(() => import("@/components/Navbar"), { ssr: false });
const AIChatbot = dynamic(() => import("@/components/AIChatbot"), { ssr: false });

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
const AboutSection = dynamic(
  () => import("@/components/sections/AboutSection"),
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

const TechStackSection = dynamic(
  () => import("@/components/sections/TechStackSection"),
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

export default function Home() {
  return (
    <>
      {/* Preloader - only shows on first visit */}
      <Preloader onComplete={() => {}} />

      {/* Scroll progress indicator */}
      <ScrollProgress />

      {/* Custom cursor glow effect */}
      <CursorGlow />

      <Navbar />

      <main id="main-content" className="relative flex-1">
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

        {/* Government Recognition Section - lazy loaded */}
        <GovernmentRecognitionSection />

        {/* Products Section - lazy loaded */}
        <ProductsSection />

        {/* Services Section - lazy loaded */}
        <ServicesSection />

        {/* Tech Stack Section - lazy loaded */}
        <TechStackSection />

        {/* Contact Section - lazy loaded */}
        <ContactSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* AI Chatbot */}
      <AIChatbot />
    </>
  );
}
