import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Solutions",
  description:
    "Order custom solutions — website development, software apps, and security solutions tailored to your business by ABWcurious.",
  openGraph: {
    title: "Order a Solution — ABWcurious",
    description:
      "From custom websites to enterprise security solutions — tell us what you need.",
    url: "https://abwcurious.com/solutions",
  },
};

export default function SolutionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}