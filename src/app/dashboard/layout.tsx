import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | ABWcurious Pvt Ltd",
  description: "Your personal dashboard for managing your ABWcurious account, applications, and activities.",
  openGraph: {
    title: "Dashboard | ABWcurious Pvt Ltd",
    description: "Your personal dashboard for managing your ABWcurious account, applications, and activities.",
    url: "https://abwcurious.com/dashboard",
    siteName: "ABWcurious Pvt Ltd",
    type: "website",
    images: [{ url: "https://abwcurious.com/logo.svg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dashboard | ABWcurious Pvt Ltd",
    description: "Your personal dashboard for managing your ABWcurious account, applications, and activities.",
    images: ["https://abwcurious.com/logo.svg"],
  },
  alternates: {
    canonical: "https://abwcurious.com/dashboard",
  },
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
