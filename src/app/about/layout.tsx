import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About ABWcurious | Our Mission, Vision & Story",
  description:
    "Learn about ABWcurious Pvt Ltd — our mission to shape a better world with technology, our leadership team, core values, company history, and culture of innovation.",
  keywords: [
    "about ABWcurious",
    "ABWcurious company",
    "technology company India",
    "cybersecurity company",
    "AI company",
    "software company Mumbai",
    "tech startup India",
    "ABWcurious team",
    "ABWcurious history",
  ],
  alternates: {
    canonical: "https://abwcurious.com/about",
  },
  openGraph: {
    title: "About ABWcurious | Shaping A Better World With Technology",
    description:
      "Meet the team behind ABWcurious — innovators in cybersecurity, AI, and software development dedicated to building a better future through technology.",
    url: "https://abwcurious.com/about",
    type: "website",
    images: [
      {
        url: "/logo.svg",
        width: 1200,
        height: 630,
        alt: "About ABWcurious Pvt Ltd",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About ABWcurious | Our Mission, Vision & Story",
    description:
      "Learn about ABWcurious — our mission, team, values, and commitment to technological excellence.",
    images: ["/logo.svg"],
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
