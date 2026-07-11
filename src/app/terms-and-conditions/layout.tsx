import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description:
    "Read the ABWcurious Terms and Conditions governing the use of our website and services.",
  openGraph: {
    title: "Terms and Conditions — ABWcurious",
    url: "https://abwcurious.com/terms-and-conditions",
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}