import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | Technology Insights, Cybersecurity & AI Articles",
  description:
    "Read the ABWcurious blog — expert insights on cybersecurity, artificial intelligence, software development, cloud, digital transformation, and technology trends.",
  keywords: ["technology blog", "cybersecurity blog", "AI articles", "software development blog", "ABWcurious blog", "tech insights", "digital transformation"],
  alternates: { canonical: "https://abwcurious.com/blogs" },
  openGraph: {
    title: "Blog | ABWcurious — Technology Insights & Expert Articles",
    description: "Expert articles on cybersecurity, AI, software development, and technology trends from the ABWcurious team.",
    url: "https://abwcurious.com/blogs",
    type: "website",
    images: [{ url: "/logo.svg", width: 1200, height: 630 }],
  },
};

export default function BlogsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
