import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services | Software, AI, Cloud, Cybersecurity & More",
  description:
    "ABWcurious offers end-to-end technology services — software development, AI solutions, cloud infrastructure, cybersecurity, DevOps, UI/UX design, mobile apps, IoT, and digital marketing.",
  keywords: [
    "software development services",
    "AI solutions",
    "cloud services India",
    "cybersecurity services",
    "DevOps services",
    "mobile app development",
    "UI UX design",
    "IT consulting",
    "digital marketing",
    "IoT development",
    "ABWcurious services",
  ],
  alternates: {
    canonical: "https://abwcurious.com/services",
  },
  openGraph: {
    title: "Services | ABWcurious — End-to-End Technology Solutions",
    description:
      "From software development to AI and cybersecurity — ABWcurious delivers comprehensive technology services for businesses at every stage.",
    url: "https://abwcurious.com/services",
    type: "website",
    images: [{ url: "/logo.svg", width: 1200, height: 630, alt: "ABWcurious Services" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Services | ABWcurious — Technology Solutions",
    description: "End-to-end technology services from software development to AI and cybersecurity.",
    images: ["/logo.svg"],
  },
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
