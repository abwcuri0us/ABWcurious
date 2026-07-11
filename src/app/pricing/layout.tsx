import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Explore ABWcurious pricing plans for cybersecurity, software development, and AI services.",
  openGraph: {
    title: "Pricing — ABWcurious",
    description: "Transparent pricing for all our technology services.",
    url: "https://abwcurious.com/pricing",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}