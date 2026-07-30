import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | ABWcurious Pvt Ltd",
  description: "Sign in to your ABWcurious Pvt Ltd account to access services, manage applications, and track your engagement.",
  openGraph: {
    title: "Login | ABWcurious Pvt Ltd",
    description: "Sign in to your ABWcurious Pvt Ltd account to access services, manage applications, and track your engagement.",
    url: "https://abwcurious.com/login",
    siteName: "ABWcurious Pvt Ltd",
    type: "website",
    images: [{ url: "https://abwcurious.com/logo.svg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Login | ABWcurious Pvt Ltd",
    description: "Sign in to your ABWcurious Pvt Ltd account to access services, manage applications, and track your engagement.",
    images: ["https://abwcurious.com/logo.svg"],
  },
  alternates: {
    canonical: "https://abwcurious.com/login",
  },
  robots: { index: true, follow: true },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}