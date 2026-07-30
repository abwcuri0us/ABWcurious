import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | ABWcurious Pvt Ltd",
  description: "ABWcurious Pvt Ltd admin dashboard for managing services, content, and operations.",
  openGraph: {
    title: "Admin Dashboard | ABWcurious Pvt Ltd",
    description: "ABWcurious Pvt Ltd admin dashboard for managing services, content, and operations.",
    url: "https://abwcurious.com/admin",
    siteName: "ABWcurious Pvt Ltd",
    type: "website",
    images: [{ url: "https://abwcurious.com/logo.svg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Admin Dashboard | ABWcurious Pvt Ltd",
    description: "ABWcurious Pvt Ltd admin dashboard for managing services, content, and operations.",
    images: ["https://abwcurious.com/logo.svg"],
  },
  alternates: {
    canonical: "https://abwcurious.com/admin",
  },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}