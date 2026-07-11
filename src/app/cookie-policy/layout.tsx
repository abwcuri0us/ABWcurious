import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "ABWcurious Cookie Policy — learn about how we use cookies and tracking technologies on our website.",
  openGraph: {
    title: "Cookie Policy — ABWcurious",
    url: "https://abwcurious.com/cookie-policy",
  },
};

export default function CookiePolicyLayout({ children }: { children: React.ReactNode }) {
  return children;
}