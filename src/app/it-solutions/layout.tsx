import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IT Solutions | Infrastructure, Cloud & Enterprise Technology",
  description:
    "ABWcurious delivers comprehensive IT solutions — infrastructure management, cloud services, enterprise solutions, networking, data backup, server management, AMC, and 24/7 support.",
  keywords: ["IT solutions India", "infrastructure management", "cloud IT solutions", "enterprise IT", "network management", "server management", "AMC", "IT support", "data backup", "ABWcurious IT"],
  alternates: { canonical: "https://abwcurious.com/it-solutions" },
  openGraph: {
    title: "IT Solutions | ABWcurious — Complete IT Infrastructure Services",
    description: "End-to-end IT solutions for enterprises — infrastructure, cloud, networking, server management, and 24/7 support.",
    url: "https://abwcurious.com/it-solutions",
    images: [{ url: "/logo.svg", width: 1200, height: 630 }],
  },
};

export default function ITSolutionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
