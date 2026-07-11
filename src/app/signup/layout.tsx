import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | ABWcurious Pvt Ltd",
  description: "Create your ABWcurious Pvt Ltd account to access cybersecurity, AI, and digital transformation services. Join our growing community.",
  openGraph: {
    title: "Sign Up | ABWcurious Pvt Ltd",
    description: "Create your ABWcurious Pvt Ltd account to access cybersecurity, AI, and digital transformation services. Join our growing community.",
    url: "https://abwcurious.com/signup",
    siteName: "ABWcurious Pvt Ltd",
    type: "website",
    images: [{ url: "https://abwcurious.com/logo.svg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign Up | ABWcurious Pvt Ltd",
    description: "Create your ABWcurious Pvt Ltd account to access cybersecurity, AI, and digital transformation services. Join our growing community.",
    images: ["https://abwcurious.com/logo.svg"],
  },
  alternates: {
    canonical: "https://abwcurious.com/signup",
  },
  robots: { index: true, follow: true },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}