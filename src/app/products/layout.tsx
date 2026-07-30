import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Products | Restaurant360, IntelliQR, CyberIntelligence360 & StudySpark",
  description:
    "Explore ABWcurious products — Restaurant360 for hospitality management, IntelliQR for smart QR codes, CyberIntelligence360 for security, and StudySpark for e-learning.",
  keywords: ["ABWcurious products", "Restaurant360", "IntelliQR", "CyberIntelligence360", "StudySpark", "restaurant management software", "QR code platform", "cybersecurity platform", "LMS"],
  alternates: { canonical: "https://abwcurious.com/products" },
  openGraph: {
    title: "Products | ABWcurious — Innovative Technology Products",
    description: "Discover ABWcurious's suite of technology products designed for restaurants, businesses, security teams, and educators.",
    url: "https://abwcurious.com/products",
    images: [{ url: "/logo.svg", width: 1200, height: 630 }],
  },
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
