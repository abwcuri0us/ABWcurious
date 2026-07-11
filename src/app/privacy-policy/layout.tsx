import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read the ABWcurious Privacy Policy to understand how we collect, use, and protect your personal data.",
  openGraph: {
    title: "Privacy Policy — ABWcurious",
    url: "https://abwcurious.com/privacy-policy",
  },
};

export default function PrivacyPolicyLayout({ children }: { children: React.ReactNode }) {
  return children;
}