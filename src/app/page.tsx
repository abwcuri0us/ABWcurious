"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";
import { useNavigation } from "@/contexts/NavigationContext";

const ScrollProgress = dynamic(() => import("@/components/ScrollProgress"), { ssr: false, loading: () => null });
const AIChatbot = dynamic(() => import("@/components/AIChatbot"), { ssr: false, loading: () => null });
const Preloader = dynamic(() => import("@/components/Preloader"), { ssr: false });

const HeroSection = dynamic(() => import("@/components/sections/HeroSection"), { ssr: false });
const AboutSection = dynamic(() => import("@/components/sections/AboutSection"), { ssr: false });
const ProductsSection = dynamic(() => import("@/components/sections/ProductsSection"), { ssr: false });
const ServicesSection = dynamic(() => import("@/components/sections/ServicesSection"), { ssr: false });
const ContactSection = dynamic(() => import("@/components/sections/ContactSection"), { ssr: false });
const TechPartnersMarquee = dynamic(() => import("@/components/sections/TechPartnersMarquee"), { ssr: false });
const CybersecuritySection = dynamic(() => import("@/components/sections/CybersecuritySection"), { ssr: false });
const TechStackSection = dynamic(() => import("@/components/sections/TechStackSection"), { ssr: false });

const SolutionsPage = dynamic(() => import("@/components/pages/SolutionsPage"), { ssr: false });
const CareersPage = dynamic(() => import("@/components/pages/CareersPage"), { ssr: false });
const EventsPage = dynamic(() => import("@/components/pages/EventsPage"), { ssr: false });
const PartnershipPage = dynamic(() => import("@/components/pages/PartnershipPage"), { ssr: false });
const CaseStudiesPage = dynamic(() => import("@/components/pages/CaseStudiesPage"), { ssr: false });
const UserDashboardPage = dynamic(() => import("@/components/pages/UserDashboardPage"), { ssr: false });

function HomePageContent() {
  return (
    <main className="relative flex-1">
      <HeroSection />
      <AboutSection />
      <ProductsSection />
      <TechPartnersMarquee />
      <ServicesSection />
      <CybersecuritySection />
      <TechStackSection />
      <ContactSection />
    </main>
  );
}

export default function Home() {
  const [, setPreloaderDone] = useState(false);
  const { page } = useNavigation();
  const currentPage = page.currentPage;
  const isSubPage = currentPage !== "home";

  return (
    <>
      <Preloader onComplete={() => setPreloaderDone(true)} />
      {currentPage !== "dashboard" && <ScrollProgress />}
      <Navbar />
      {isSubPage ? (
        currentPage === "dashboard" ? <UserDashboardPage /> : (
          <main className="relative flex-1 pt-20 lg:pt-24">
            {currentPage === "solutions" && <SolutionsPage />}
            {currentPage === "careers" && <CareersPage />}
            {currentPage === "events" && <EventsPage />}
            {currentPage === "partnership" && <PartnershipPage />}
            {currentPage === "case-studies" && <CaseStudiesPage />}
          </main>
        )
      ) : <HomePageContent />}
      {currentPage !== "dashboard" && <Footer />}
      {currentPage !== "dashboard" && <AIChatbot />}
    </>
  );
}
