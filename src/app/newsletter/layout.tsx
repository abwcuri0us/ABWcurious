import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Newsletter",
  description:
    "Subscribe to the ABWcurious newsletter for the latest updates on cybersecurity, AI, and technology.",
  openGraph: {
    title: "Newsletter — ABWcurious",
    description: "Get curated tech insights delivered to your inbox.",
    url: "https://abwcurious.com/newsletter",
  },
};

export default function NewsletterLayout({ children }: { children: React.ReactNode }) {
  return children;
}