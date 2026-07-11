import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Partnership",
  description:
    "Partner with ABWcurious for technology collaborations, co-development, and strategic business partnerships.",
  openGraph: {
    title: "Partner with ABWcurious",
    description:
      "Explore partnership opportunities with ABWcurious Pvt Ltd.",
    url: "https://abwcurious.com/partnership",
  },
};

export default function PartnershipLayout({ children }: { children: React.ReactNode }) {
  return children;
}