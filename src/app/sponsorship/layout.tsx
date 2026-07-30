import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sponsorship | Support Technology Innovation at ABWcurious",
  description:
    "Sponsor ABWcurious events, research, open-source projects, and student programs. Reach technology professionals and support meaningful innovation in cybersecurity and AI.",
  keywords: ["ABWcurious sponsorship", "technology sponsorship", "sponsor tech event India", "cybersecurity sponsor", "AI event sponsor", "support innovation"],
  alternates: { canonical: "https://abwcurious.com/sponsorship" },
  openGraph: {
    title: "Sponsorship | ABWcurious — Support Innovation",
    description: "Partner with ABWcurious as a sponsor — support technology events, research, and open-source initiatives while reaching a targeted tech audience.",
    url: "https://abwcurious.com/sponsorship",
    type: "website",
    images: [{ url: "/logo.svg", width: 1200, height: 630 }],
  },
};

export default function SponsorshipLayout({ children }: { children: React.ReactNode }) {
  return children;
}
