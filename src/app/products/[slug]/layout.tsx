import type { Metadata } from "next";

const productsMeta: Record<string, { title: string; description: string }> = {
  restaurant360: {
    title: "Restaurant360 | Complete Restaurant Management Platform",
    description: "Restaurant360 by ABWcurious — an all-in-one SaaS platform for restaurant management including POS, online ordering, inventory, staff scheduling, and analytics.",
  },
  intelliqr: {
    title: "IntelliQR | Smart Dynamic QR Code Platform",
    description: "IntelliQR by ABWcurious — dynamic QR code generation, management, and analytics platform for businesses, menus, marketing campaigns, and events.",
  },
  cyberintelligence360: {
    title: "CyberIntelligence360 | AI-Powered Threat Intelligence Platform",
    description: "CyberIntelligence360 by ABWcurious — enterprise cybersecurity platform with AI threat intelligence, vulnerability management, SOC automation, and compliance.",
  },
  studyspark: {
    title: "StudySpark | AI-Powered Learning Management System",
    description: "StudySpark by ABWcurious — next-generation LMS with AI tutoring, adaptive learning paths, live classes, and blockchain-verified certifications.",
  },
};

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const meta = productsMeta[slug] ?? {
    title: `${slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} | ABWcurious Products`,
    description: `Discover ${slug.replace(/-/g, " ")} — an innovative product by ABWcurious.`,
  };
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: `https://abwcurious.com/products/${slug}` },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `https://abwcurious.com/products/${slug}`,
      images: [{ url: "/logo.svg", width: 1200, height: 630 }],
    },
  };
}

export default function ProductSlugLayout({ children }: { children: React.ReactNode }) {
  return children;
}
