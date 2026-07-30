import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Join ABWcurious — explore open positions in cybersecurity, AI, software development, and more. Build the future with us.",
  openGraph: {
    title: "Careers at ABWcurious",
    description:
      "Explore job openings and internship opportunities at ABWcurious Pvt Ltd.",
    url: "https://abwcurious.com/careers",
  },
};

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return children;
}