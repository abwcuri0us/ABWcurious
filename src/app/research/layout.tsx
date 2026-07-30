import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Research",
  description:
    "Explore ABWcurious research publications, whitepapers, and technical reports on cybersecurity and AI.",
  openGraph: {
    title: "Research — ABWcurious",
    description: "Deep-dive into our research and technical publications.",
    url: "https://abwcurious.com/research",
  },
};

export default function ResearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}