import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events & Webinars",
  description:
    "Join expert-led webinars, workshops, and conferences by ABWcurious on cybersecurity, AI, and emerging technologies.",
  openGraph: {
    title: "Events & Webinars — ABWcurious",
    description:
      "Register for upcoming webinars, workshops, and conferences on cybersecurity and AI.",
    url: "https://abwcurious.com/events",
  },
};

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return children;
}