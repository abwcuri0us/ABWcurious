import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events & Webinars | Cybersecurity, AI & Technology",
  description:
    "Join ABWcurious events — expert-led webinars, workshops, conferences, and hackathons on cybersecurity, artificial intelligence, software development, and emerging technologies.",
  keywords: ["ABWcurious events", "cybersecurity webinars", "AI workshops", "tech conferences India", "security training events"],
  alternates: { canonical: "https://abwcurious.com/events" },
  openGraph: {
    title: "Events & Webinars | ABWcurious — Technology Education",
    description: "Expert-led technology events on cybersecurity, AI, software development, and emerging technologies from ABWcurious.",
    url: "https://abwcurious.com/events",
    type: "website",
    images: [{ url: "/logo.svg", width: 1200, height: 630, alt: "ABWcurious Events" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Events & Webinars | ABWcurious",
    description: "Join ABWcurious expert-led events on cybersecurity, AI, and technology.",
    images: ["/logo.svg"],
  },
};

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return children;
}