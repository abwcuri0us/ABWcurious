import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Partnership | Technology, Academic & Channel Partners",
  description:
    "Partner with ABWcurious Pvt Ltd — technology partnerships, academic collaborations, channel partnerships, startup accelerator, and strategic alliances to grow together.",
  keywords: ["ABWcurious partnership", "technology partner India", "channel partner", "academic partnership", "startup partner", "technology alliance"],
  alternates: { canonical: "https://abwcurious.com/partnership" },
  openGraph: {
    title: "Partnership | ABWcurious — Grow Together",
    description: "Join the ABWcurious partner ecosystem — technology partners, academic institutions, channel resellers, and startup collaborators.",
    url: "https://abwcurious.com/partnership",
    type: "website",
    images: [{ url: "/logo.svg", width: 1200, height: 630, alt: "ABWcurious Partnership" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Partnership | ABWcurious",
    description: "Become an ABWcurious technology, academic, or channel partner.",
    images: ["/logo.svg"],
  },
};

export default function PartnershipLayout({ children }: { children: React.ReactNode }) {
  return children;
}