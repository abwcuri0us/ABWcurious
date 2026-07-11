import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy",
  description:
    "ABWcurious Refund Policy — understand our refund terms and conditions for services and products.",
  openGraph: {
    title: "Refund Policy — ABWcurious",
    url: "https://abwcurious.com/refund-policy",
  },
};

export default function RefundPolicyLayout({ children }: { children: React.ReactNode }) {
  return children;
}