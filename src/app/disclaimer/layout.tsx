import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer",
  description:
    "ABWcurious Disclaimer — important legal notices and limitations of liability.",
  openGraph: {
    title: "Disclaimer — ABWcurious",
    url: "https://abwcurious.com/disclaimer",
  },
};

export default function DisclaimerLayout({ children }: { children: React.ReactNode }) {
  return children;
}