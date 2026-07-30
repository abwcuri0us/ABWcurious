import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "News",
  description:
    "Latest news, articles, and insights from ABWcurious on cybersecurity, AI, and technology trends.",
  openGraph: {
    title: "News — ABWcurious",
    description:
      "Stay updated with the latest from ABWcurious.",
    url: "https://abwcurious.com/news",
  },
};

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return children;
}